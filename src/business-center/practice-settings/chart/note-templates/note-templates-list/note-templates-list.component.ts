// The component is using the default change detection strategy, but we needed to handle dynamic DOM changes
// that must be loaded before using the component, and to handle potential errors related to DOM expression changes. 
// Therefore, we added manual change detection using "ChangeDetectorRef".
// https://stackoverflow.com/questions/36919399/angular-2-view-not-updating-after-model-changes

import { ChangeDetectorRef, ElementRef, HostListener } from '@angular/core';
import { Component, EventEmitter, Inject, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import cloneDeep from 'lodash/cloneDeep';
import concat from 'lodash/concat';
import isEqual from 'lodash/isequal';
import { Subscription } from 'rxjs';
import { OrderByPipe } from 'src/@shared/pipes';
import { CategoriesWithTemplate, CustomFormTemplate, NoteTemplatesViewModel } from '../note-templates';
import { NoteTemplatesComponent } from '../note-templates.component';
import { NoteTemplatesHttpService } from 'src/@shared/providers/note-templates-http.service';
import { AuthAccess } from 'src/@shared/models/auth-access.model';
import { SoarResponse } from 'src/@core/models/core/soar-response';
import { NoteTemplatesHelperService } from '../note-templates-helper.service';

@Component({
    selector: 'note-templates-list',
    templateUrl: './note-templates-list.component.html',
    styleUrls: ['./note-templates-list.component.scss']
})
export class NoteTemplatesListComponent implements OnInit, OnDestroy {

    @Input() parentForm: FormGroup;
    @Input() showMenu = true;
    @Input() showHeader = true;
    @Input() editMode = false;
    @Output() selectedNoteTemplate = new EventEmitter<{ selectedTemplate: NoteTemplatesViewModel, editMode: boolean }>();
    @Input() existingTemplateActive = false;

    noteCategories: CategoriesWithTemplate[] = [];
    noteTemplates = [];
    noteTemplatesBackup = [];
    noteCategoryBackup: CategoriesWithTemplate[] = [];
    loadingCategories = false;
    loadingTemplates = false;
    isAddCategory = false;
    editCategory = false;
    formIsValid = true;
    duplicateNoteCategory = false;
    searchTerm = '';
    loadingMessageNoCategoryResults = `<i class="fa fa-2x fa-minus-circle"></i>${this.localize.getLocalizedString('There are no template categories.') as string}`;
    loadingMessageNoTemplateResults = `<i class="fa fa-2x fa-minus-circle"></i>${this.localize.getLocalizedString('There are no templates.') as string}`;

    unloadedCategoriesCount = 0;
    authAccess = new AuthAccess();
    searchMode = false;
    NewCategory = {
        newCategoryName: ''
    };
    activeCategory: { CategoryId: string, addingNewTemplate: boolean, ntExpand: boolean };
    selectedTemplate: NoteTemplatesViewModel;
    placeholder = this.localize.getLocalizedString('Search by template name');
    showSuggestion = true;
    selectedTemplateCopy: NoteTemplatesViewModel = new NoteTemplatesViewModel();
    noteTempListForm: FormGroup;
    subscriptions: Subscription[] = [];

    constructor(@Inject('localize') private localize,
        @Inject('ModalFactory') private modalFactory,
        @Inject('toastrFactory') private toastrFactory,
        @Inject('patSecurityService') private patSecurityService,
        public fb: FormBuilder,
        private changeDetector: ChangeDetectorRef,
        private _elementRef: ElementRef,
        private noteTemplate: NoteTemplatesComponent,
        private noteTemplatesHttpService: NoteTemplatesHttpService,
        private noteTemplatesHelperService: NoteTemplatesHelperService
    ) { }

    ngOnInit(): void {
        this.defaultInitilizationOfTemplate();
        this.getTemplateCategoriesWithTemplates();
        this.getAccess();
        this.createForm();
    }

    defaultInitilizationOfTemplate = () => {
        this.selectedTemplate = new NoteTemplatesViewModel();
        this.selectedTemplate = {
            Template: {
                TemplateName: '',
                CategoryId: null
            },
            TemplateBodyCustomForm: {
                'FormId': '00000000-0000-0000-0000-000000000000',
                'VersionNumber': 1,
                'SourceFormId': '00000000-0000-0000-0000-000000000000',
                'FormName': "",
                'Description': '',
                'IsActive': true,
                'IsVisible': true,
                'IsPublished': false,
                'IsDefault': false,
                'FormSections': [],
                'IndexOfSectionInEditMode': -1,
                'SectionValidationFlag': false,
                'SectionCopyValidationFlag': -1,
                'TemplateMode': 1
            }
        };
    }

    getAccess = () => {
        this.authAccess = this.noteTemplatesHttpService.access();
        if (!this.authAccess.view) {
            this.toastrFactory.error(this.patSecurityService.generateMessage('soar-clin-nottmp-view'), 'Not Authorized');
            window.location.href = "/";
        }
    }
    getTemplateCategoriesWithTemplates = () => {
        this.noteTemplatesHelperService.setCategoriesData();
        this.loadingCategories = this.noteTemplatesHelperService.loadingCategories;
        this.loadingTemplates = this.noteTemplatesHelperService.loadingTemplates;
        this.subscriptions.push(this.noteTemplatesHelperService.getCategoriesData().subscribe((res) => {
            if (res) {
                this.loadCategoriesAndTemplates(res);
            }
        },
            () => {
                this.toastrFactory.error(this.localize.getLocalizedString('Failed to retrieve the list of {0}. Refresh the page to try again.', ['Clinical Note Templates']), this.localize.getLocalizedString('Server Error'));
            }))
    }

    createForm = () => {
        //Remove Existing form if exist in array
        if (this.parentForm?.get("noteTempListFormArray")) {
            this.parentForm?.removeControl("noteTempListFormArray");
        }

        this.noteTempListForm = this.fb.group({
            inpNoteCategoryName: [this.NewCategory?.newCategoryName]
        })
        if (this.noteCategories) {
            for (let i = 0; i < this.noteCategories?.length; i++) {
                const control = this.fb.control(this.noteCategories[i]?.CategoryName);
                this.noteTempListForm.addControl(`inpEditNoteCategoryName_${i}`, control);
            }
        }
        this.changeDetector.detectChanges();
        this.noteTempListForm?.controls["inpNoteCategoryName"]?.reset();
        this.parentForm.addControl("noteTempListFormArray", this.fb.array([this.noteTempListForm]));

        // Set focus on latest input field.
        this.changeDetector.detectChanges();
        if (this._elementRef?.nativeElement?.querySelector("#inpNoteCategoryName")) {
            this._elementRef?.nativeElement?.querySelector("#inpNoteCategoryName")?.focus();
        }
        this.setValuesOnChanges();
    }

    setValuesOnChanges = () => {
        this.subscriptions.push(this.noteTempListForm.valueChanges.subscribe((changes) => {
            if (changes) {
                this.NewCategory.newCategoryName = changes["inpNoteCategoryName"]?.toString();
                if (this.noteCategories) {
                    for (let i = 0; i < this.noteCategories.length; i++) {
                        if (changes[`inpEditNoteCategoryName_${i}`]) {
                            this.noteCategories[i].CategoryName = changes[`inpEditNoteCategoryName_${i}`]?.toString();
                        }
                    }
                }
            }
        }))
    }

    // load categories to scope
    loadCategoriesAndTemplates = (categories) => {
        this.noteTemplates = [];
        categories?.forEach((category) => {
            category?.Templates?.forEach((template) => {
                template.$$CategoryName = category?.CategoryName;
            })

            if (category?.CategoryId == this.activeCategory?.CategoryId) {
                category.ntExpand = true;
            }
            // Order by TemplateName
            const orderPipe = new OrderByPipe();
            orderPipe.transform(category?.Templates, { sortColumnName: 'TemplateName', sortDirection: 1 });
            this.noteTemplates = concat(this.noteTemplates, category.Templates);
        });
        // load scope objects
        this.noteCategories = cloneDeep(categories);
        this.noteCategoryBackup = cloneDeep(categories);

        //Create FormGroup once noteCategories filled
        this.createForm();
        this.changeDetector.detectChanges();
        this.noteTempListForm.setValidators([Validators.required, Validators.maxLength(100)]);
        // mark visible
        this.updateCategoryVisibleFlags(true);
        this.noteTemplates = cloneDeep(this.noteTemplates);

        // backup templates
        this.noteTemplatesBackup = cloneDeep(this.noteTemplates);
        // indicators
        this.loadingCategories = false;
        this.loadingTemplates = false;
    }

    // update visible flag
    updateCategoryVisibleFlags = (value: boolean) => {
        this.noteCategories.forEach((cat) => {
            cat.$$Visible = value;
        })
    }

    addCopyTemplate = (template) => {
        if (template) { // Copy
            if (this.editMode === false) {
                if (!this.selectedTemplate) {
                    this.defaultInitilizationOfTemplate();
                }
                this.selectedTemplateCopy = this.selectedTemplate;
                this.selectedTemplate = { Template: template };
                this.noteTemplatesHttpService.SetCurrentOperation('copy');
                this.loadTemplateBodyCustomForm(true);
                this.existingTemplateActive = true;
                this.toastrFactory.success(this.localize.getLocalizedString('Template Copied'), this.localize.getLocalizedString('Success'));
            }
        } else { // Add     
            this.defaultInitilizationOfTemplate();
            if (this.selectedTemplate?.Template) {
                this.selectedTemplate.Template.CategoryId = this.activeCategory ? this.activeCategory?.CategoryId : null;
            }
            this.noteTemplatesHttpService.SetActiveNoteTemplate(this.selectedTemplate);
            this.editMode = true;
            this.existingTemplateActive = false;
            this.selectedTemplate.canEditForm = true;
            this.loadTemplateBodyCustomForm(true);
            this.selectedNoteTemplate.emit({ selectedTemplate: this.selectedTemplate, editMode: this.editMode });
        }
    }

    loadTemplateBodyCustomForm = (isEditMode: boolean) => {
        if (this.selectedTemplate?.Template?.TemplateId != null && this.selectedTemplate?.Template?.TemplateId != undefined) {
            this.noteTemplatesHttpService.LoadTemplateBodyCustomForm(this.selectedTemplate?.Template).then((res: SoarResponse<CustomFormTemplate>) => {
                if (res?.Value) {
                    this.selectedTemplate.TemplateBodyCustomForm = res?.Value;
                    this.selectedTemplate.TemplateBodyCustomForm.IndexOfSectionInEditMode = -1;
                    this.selectedTemplate.TemplateBodyCustomForm.SectionValidationFlag = false;
                    this.selectedTemplate.TemplateBodyCustomForm.SectionCopyValidationFlag = -1;
                    this.selectedTemplate.TemplateBodyCustomForm.SourceFormId = this.selectedTemplate?.TemplateBodyCustomForm?.FormId;
                    this.selectedTemplate.TemplateBodyCustomForm.TemplateMode = 3;
                    this.noteTemplate.selectedTemplateBackup = cloneDeep(this.selectedTemplate);
                    if (this.noteTemplatesHttpService?.CurrentOperation == 'copy') {
                        this.copyNoteTemplate();
                        this.selectedTemplate = this.selectedTemplateCopy;
                        this.loadNoteTemplate(isEditMode, 'copy');
                    }
                    if (this.noteTemplatesHttpService?.CurrentOperation == 'edit') {
                        this.loadNoteTemplate(isEditMode, 'edit');
                    }
                    this.noteTemplate.templateBodyCustomForm();
                }
            }, () => {
                this.toastrFactory.error(this.localize.getLocalizedString('Failed to retrieve the {0}. Refresh the page to try again.',
                    ['Clinical Note Template']), this.localize.getLocalizedString('Server Error'));
            });
        }
        else {
            this.noteTemplate.selectedTemplate = cloneDeep(this.selectedTemplate);
            this.noteTemplate.templateBodyCustomForm();
        }
    }

    createEmptyCategory = () => {
        if (this.authAccess.update) {
            this.isAddCategory = !this.isAddCategory;
            this.formIsValid = true;
            this.noteCategories.forEach((cat) => {
                cat.ntExpand = false;
                cat.addingNewTemplate = false;
            });
            this.noteTemplatesHttpService.SetActiveNoteTemplate(this.noteTemplatesHttpService.NewTemplate);
            this.activeCategory = null;
        }
    }

    addNoteCategory = () => {
        if (this.authAccess.create) {
            // checks empty field
            this.duplicateNoteCategory = false;
            this.formIsValid = true;
            if (!this.NewCategory?.newCategoryName?.trim() || this.NewCategory?.newCategoryName.length == 0) {
                this.formIsValid = false;
            }
            // checks if the category name already exists
            else if (this.noteCategories.filter((item) => { return item.CategoryName.toLowerCase() == this.NewCategory?.newCategoryName.toLowerCase() }).length > 0) {
                this.duplicateNoteCategory = true;
                this.formIsValid = false;
            }
            if (this.formIsValid) {
                this.isAddCategory = !this.isAddCategory;
                this.NewCategory.newCategoryName = this.NewCategory?.newCategoryName?.trim()
                this.noteTemplatesHttpService.saveCategory({ CategoryName: this.NewCategory?.newCategoryName }).then(() => {
                    this.toastrFactory.success(this.localize.getLocalizedString('Your {0} has been created.', ['Clinical Note Template Category']),
                        this.localize.getLocalizedString('Success'));
                    this.getTemplateCategoriesWithTemplates()
                }, () => { // Error
                    this.toastrFactory.error(this.localize.getLocalizedString('Save was unsuccessful. Please retry your save.'),
                        this.localize.getLocalizedString('Server Error'));
                });
                this.createForm();
                this.changeDetector.detectChanges();
                this.NewCategory.newCategoryName = '';
                this.noteTempListForm.setValidators([Validators.required, Validators.maxLength(100)]);
            }
        }
    }

    cancelNoteCategory = () => {
        if (this.NewCategory?.newCategoryName != '') {
            this.launchWarningModal();
        }
        else {
            this.clearNoteCategory();
        }
    }

    // clean up unwanted category
    clearNoteCategory = () => {
        this.isAddCategory = false;
        this.NewCategory.newCategoryName = '';
        this.noteTemplatesHttpService.setTemplateDataChanged(false);
        this.createForm();
    };

    expandNoteCategory = (category) => {
        this.getNoteTemplatesForCategory(category, false);
        this.isAddCategory = false;
        this.noteTemplatesHttpService.ExpandOrCollapseCategory(category);
        this.collapseAll(category);
        this.activeCategory = category?.ntExpand ? category : {};
    }

    deleteNoteCategory = (category) => {
        if (!category?.$$Loaded) {
            // if this category hasn't loaded yet, we need to check for templates assigned to it before we can delete
            this.getNoteTemplatesForCategory(category, true);
        }
        else if (this.editMode === false && !category?.$$hasTemplates) {
            this.modalFactory.DeleteModal('note category ', category?.CategoryName, true).then(
                () => {
                    this.confirmDeleteNoteCategory(category)
                });
        }
    }

    // get note templates
    getNoteTemplatesForCategory = (category, attemptingToDeleteCategory) => {
        if (!category.$$Loaded) {
            this.loadingTemplates = true;
            this.noteTemplatesHttpService.getTemplates(category.CategoryId).then((res: SoarResponse<NoteTemplatesViewModel>) => {
                const tempNoteTempData = cloneDeep(res?.Value);
                tempNoteTempData?.forEach((nt) => {
                    const index = this.noteTemplates.findIndex(x => x?.TemplateId == nt?.TemplateId);
                    // if template is already in list it must have been moved from a category that was already loaded, just remove it
                    if (index !== -1) {
                        this.noteTemplates.splice(index, 1);
                    }
                    // for display when in view mode
                    nt.$$CategoryName = category.CategoryName;
                });
                this.noteTemplates = this.noteTemplates.concat(res.Value);
                this.noteTemplatesBackup = cloneDeep(this.noteTemplates);
                // if there are no templates assigned to category, allow delete
                category.$$hasTemplates = tempNoteTempData && tempNoteTempData?.length === 0 ? false : true;
                this.loadingTemplates = false;
                category.$$Loaded = true;
                this.unloadedCategoriesCount = this.unloadedCategoriesCount > 0 ? this.unloadedCategoriesCount - 1 : 0;
                if (attemptingToDeleteCategory && !category.$$hasTemplates) {
                    // if attemptingToDeleteCategory is true this was called by the user clicking the delete icon,
                    // going ahead and calling deleteCategory if there are no templates
                    this.deleteNoteCategory(category);
                }
            }, () => {
                this.toastrFactory.error(this.localize.getLocalizedString('Failed to retrieve the {0}. Refresh the page to try again.',
                    ['Clinical Note Template']), this.localize.getLocalizedString('Server Error'));
            });
        }
    };

    // collapsing all other categories
    collapseAll = (category) => {
        this.noteCategories.forEach((cat) => {
            if (cat.CategoryId !== category.CategoryId) {
                cat.ntExpand = false;
                cat.addingNewTemplate = false;
            }
        })
    }

    // calling delete category api
    confirmDeleteNoteCategory = (category) => {
        this.noteTemplatesHttpService.deleteNoteCategory(category?.CategoryId).then(() => {
            this.toastrFactory.success(this.localize.getLocalizedString('Your {0} has been deleted.', ['Clinical Note Category']),
                this.localize.getLocalizedString('Success'));
            const index = this.noteCategories.findIndex(x => x.CategoryId == category?.CategoryId);
            if (index !== -1) {
                this.noteCategories.splice(index, 1);
                this.getTemplateCategoriesWithTemplates();
            }
        }, () => {
            this.toastrFactory.error(this.localize.getLocalizedString('Delete was unsuccessful. Please retry your delete.'),
                this.localize.getLocalizedString('Server Error'));
        });
    };


    updateNoteCategory = (category) => {
        category.CategoryName = category?.CategoryName?.trim()
        category.duplicateNoteCategory = this.noteCategories?.filter((item) => { return item?.CategoryName?.toLowerCase() === category?.CategoryName?.trim()?.toLowerCase() })?.length > 1;
        if (!category.duplicateNoteCategory && category) {
            // only make the call if the name was updated
            if (!isEqual(category?.CategoryName, category?.categoryNameBackup)) {
                this.noteTemplatesHttpService.saveCategory(category).then(() => {
                    this.toastrFactory.success(this.localize.getLocalizedString('Your {0} has been updated.', ['Clinical Note Template Category']),
                        this.localize.getLocalizedString('Success'));
                    category.$$editing = false;
                    this.getTemplateCategoriesWithTemplates()
                }, () => {
                    this.toastrFactory.error(this.localize.getLocalizedString('Update was unsuccessful. Please retry your update.'),
                        this.localize.getLocalizedString('Server Error'));
                });
            }
            else {
                category.$$editing = false;
            }
            this.editCategory = false;
        }
    }

    cancelUpdateCategory = (category) => {
        category.CategoryName = cloneDeep(category?.categoryNameBackup);
        category.$$editing = false;
        this.editCategory = false;
    }

    loadNoteTemplate = (editMode, operation) => {
        this.editMode = editMode;
        if (this.searchMode == false && this.activeCategory && this.activeCategory?.addingNewTemplate == true) {
            this.noteTemplatesHttpService.CloseTemplateHeader(this.activeCategory);
        }
        this.noteTemplatesHttpService.SetActiveNoteTemplate(this.selectedTemplate);
        this.noteTemplatesHttpService.SetCurrentOperation(operation);
        this.selectedTemplate.canEditForm = editMode;

        if (!this.editMode && this.selectedTemplate?.Template?.CategoryId) {
            const categoryId = this.selectedTemplate.Template.CategoryId;
            const category = this.noteCategories?.find(category => category?.CategoryId == categoryId);
            this.selectedTemplate.Template.CategoryName = category?.CategoryName;
        }
        this.selectedNoteTemplate.emit({ selectedTemplate: this.selectedTemplate, editMode: editMode });
    }

    toggleCategoryEdit = (category, index: number) => {
        if (this.editMode === false) {
            category.duplicateNoteCategory = false;
            // making a backup of CategoryName for cancel, etc.
            category.categoryNameBackup = cloneDeep(category?.CategoryName);
            // if they add new category open, close it
            this.isAddCategory = false;
            this.noteCategories?.forEach((cat) => {
                cat.$$editing = cat.CategoryId !== category.CategoryId ? false : !cat.$$editing;
            });
            this.editCategory = category?.$$editing;
            this.noteTempListForm?.controls[`inpEditNoteCategoryName_${index}`]?.patchValue(category?.CategoryName);
        }
    }

    editNoteTemplate = (template, isEditMode: boolean) => {
        if (this.editMode === false) {
            this.selectedTemplate = { Template: template };
            this.noteTemplatesHttpService.SetCurrentOperation('edit');
            this.loadTemplateBodyCustomForm(isEditMode);
            this.existingTemplateActive = true;
        }
    }

    deleteNoteTemplate = (template) => {
        if (template.TemplateName && this.editMode === false) {
            this.modalFactory.DeleteModal('note template ', template?.TemplateName, true).then(
                () => {
                    this.confirmDeleteNoteTemplate(template)
                }
            );
        }
    }

    copyNoteTemplate = () => {
        this.selectedTemplateCopy.TemplateBodyCustomForm.IndexOfSectionInEditMode = -1;
        const Id = '00000000-0000-0000-0000-000000000000';
        this.selectedTemplate.TemplateBodyCustomForm.FormName = `${this.selectedTemplate?.Template?.TemplateName}_${Math.floor(Math.random() * 1000000)}_CNT`;
        this.selectedTemplateCopy.TemplateBodyCustomForm.FormName = this.selectedTemplate?.TemplateBodyCustomForm?.FormName;
        this.selectedTemplateCopy.TemplateBodyCustomForm.FormSections = this.selectedTemplate?.TemplateBodyCustomForm?.FormSections;
        this.selectedTemplateCopy.Template.TemplateName = this.selectedTemplate?.Template?.TemplateName;
        this.selectedTemplateCopy.Template.CategoryId = this.selectedTemplate?.Template?.CategoryId;
        this.selectedTemplate?.TemplateBodyCustomForm?.FormSections.forEach(formSection => {
            formSection.FormId = Id;
            formSection.FormSectionId = Id;
            formSection.FormSectionItems.forEach(formSectionItem => {
                formSectionItem.BankItemDemographicId = null;
                formSectionItem.FormBankItemEmergencyContact = null;
                formSectionItem.BankItemEmergencyContactId = null;
                formSectionItem.FormSectionId = Id;
                formSectionItem.SectionItemId = Id;
                if (formSectionItem?.FormItemType === 11 || formSectionItem?.FormItemType === 9) {
                    formSectionItem.BankItemId = null;
                }
                else {
                    if (formSectionItem?.FormBankItem?.BankItemId) {
                        formSectionItem.FormBankItem.BankItemId = Id;
                    }
                    if (formSectionItem?.ItemOptions?.length !== 0) {
                        formSectionItem.ItemOptions.forEach(ItemOption => {
                            ItemOption.SectionItemId = Id;
                            ItemOption.SectionItemOptionId = Id;
                            ItemOption.BankItemId = Id;
                            ItemOption.BankItemOptionId = Id;
                            ItemOption.BankItemOption.BankItemId = Id;
                            ItemOption.BankItemOption.BankItemOptionId = Id;
                        });
                    }
                    formSectionItem.BankItemId = Id;
                }
            });
        });
        this.parentForm.markAsDirty();
    }

    // calling delete api and handling success
    confirmDeleteNoteTemplate = (template) => {
        this.noteTemplatesHttpService.deleteNoteTemplate(template.TemplateId).then(() => {
            this.toastrFactory.success(this.localize.getLocalizedString('Your {0} has been deleted.', ['Clinical Note Template']), this.localize.getLocalizedString('Success'));
            this.getTemplateCategoriesWithTemplates()
            this.noteTemplatesHttpService.SetActiveNoteTemplate({});
            this.editMode = false;
            this.existingTemplateActive = false;
        },
            () => {
                this.toastrFactory.error(this.localize.getLocalizedString('Delete was unsuccessful. Please refresh the page and retry your delete.'), this.localize.getLocalizedString('Server Error'));
            });
    };

    // indicate current note type
    isSelectedNoteTemplate = (template) => {
        if (this.selectedTemplate && this.selectedTemplate?.Template && this.selectedTemplate?.Template?.TemplateId && this.existingTemplateActive) {
            return this.selectedTemplate.Template.TemplateId === template?.TemplateId;
        }
        return false;
    }

    launchWarningModal = () => {
        this.modalFactory.WarningModal().then(
            (result) => {
                if (result === true) {
                    this.clearNoteCategory();
                }
            }
        );
    }

    search = (term) => {
        term = term?.trim();
        this.searchMode = true;
        // when filtering for the first time or after a new category has been added, we need to make sure all the templates have been loaded
        const unloadedCategories = this.noteCategories.filter(x => x.$$Loaded == false);
        this.unloadedCategoriesCount = unloadedCategories != null ? unloadedCategories.length : 0;
        if (this.unloadedCategoriesCount > 0) {
            this.noteCategories.forEach((cat) => {
                if (!cat.$$Loaded) {
                    this.getNoteTemplatesForCategory(cat, false);
                }
            });
        }
        else {

            if (this.activeCategory) {
                this.activeCategory.ntExpand = false;
            }
            if (term === '') {
                this.clearNoteTemplatesSearch();
                return;
            }
            if (term !== undefined) {
                this.noteTemplates = cloneDeep(this.noteTemplatesBackup);
                this.noteCategories = cloneDeep(this.noteCategoryBackup);
                //Rest form and create noteCategory list
                this.createForm();
                this.changeDetector.detectChanges();
                this.noteTempListForm.setValidators([Validators.required, Validators.maxLength(100)]);
                this.noteTemplates = this.noteTemplates?.filter(template => template?.TemplateName?.toLowerCase()?.indexOf(term?.toLowerCase()) !== -1);
                this.updateCategoryVisibleFlags(false);
                this.noteTemplates.forEach((nt) => {
                    const category = this.noteCategories.find(x => x.CategoryId == nt.CategoryId);
                    if (category) {
                        category.Templates = category.Templates?.filter(template => template?.TemplateName?.toLowerCase()?.indexOf(term?.toLowerCase()) !== -1);
                        category.$$Visible = true;
                        category.ntExpand = true;
                    }
                });
            }
        }
    }

    // clear the search and reset the categories and templates
    clearNoteTemplatesSearch = () => {
        this.searchTerm = '';
        this.selectedTemplate = {};
        this.searchMode = false;
        this.noteTemplates = cloneDeep(this.noteTemplatesBackup);
        this.noteCategories = cloneDeep(this.noteCategoryBackup);
        this.updateCategoryVisibleFlags(true);
    }

    @HostListener('document:keypress', ['$event'])
    handleKeyboardEvent(event: KeyboardEvent) {
        if (event?.keyCode == 13) {
            event.preventDefault();
        }
    }

    ngOnDestroy() {
        this.subscriptions?.forEach((subscription) => subscription?.unsubscribe());
    }
}
