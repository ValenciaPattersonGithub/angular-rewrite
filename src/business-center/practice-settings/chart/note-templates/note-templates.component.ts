import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { Categories, FormSection, NoteTemplatesViewModel, Template } from './note-templates';
import cloneDeep from 'lodash/cloneDeep';
import isEqual from 'lodash/isequal';
import { NoteTemplatesHelperService } from './note-templates-helper.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { NoteTemplatesHttpService } from 'src/@shared/providers/note-templates-http.service';
import { AuthAccess } from 'src/@shared/models/auth-access.model';
import { SoarResponse } from 'src/@core/models/core/soar-response';

@Component({
    selector: 'note-templates',
    templateUrl: './note-templates.component.html',
    styleUrls: ['./note-templates.component.scss']
})
export class NoteTemplatesComponent implements OnInit, OnDestroy {

    constructor(@Inject('localize') private localize,
        @Inject('ModalFactory') private modalFactory,
        @Inject('toastrFactory') private toastrFactory,
        @Inject('patSecurityService') private patSecurityService,
        private noteTemplatesHelperService: NoteTemplatesHelperService,
        private fb: FormBuilder,
        private noteTemplatesHttpService: NoteTemplatesHttpService) { }

    // initial state of flags
    existingTemplateActive = false;
    editMode = false;
    isSaving = false;
    isValidCustomForm = false;
    canAddSection = true;
    inputIsDisabled = true;
    noteCategories: Categories[] = [];
    breadCrumbs: { name: string, path: string, title: string }[] = [];
    authAccess = new AuthAccess();
    dataForCrudOperation = {
        BreadCrumbs: []
    };
    selectedTemplate: NoteTemplatesViewModel = new NoteTemplatesViewModel();
    selectedTemplateCopy: NoteTemplatesViewModel = new NoteTemplatesViewModel();
    selectedTemplateBackup: NoteTemplatesViewModel;
    canEditForm: boolean;
    parentForm: FormGroup;
    frmNoteTemplate: FormGroup;
    frmNoteTemplateSubScription: Subscription;
    parentFormSubscription: Subscription;

    ngOnInit(): void {
        this.getPageNavigation();
        // making sure that the factory doesn't have any stale data in it

        // calling auth on the factory for all relevant operations
        this.getAccess();

        //Creating initial form
        this.parentForm = this.fb.group({});
        this.parentFormSubscription = this.parentForm.valueChanges.subscribe((changes) => {
            if (changes) {
                // To get all the child form changes
            }
        })

        this.createForm();
        this.noteTemplatesHttpService.SetActiveNoteTemplate(null);
        this.noteTemplatesHttpService.SetActiveTemplateCategory(null);
        this.noteTemplatesHelperService.setData(this.selectedTemplate.TemplateBodyCustomForm);
    }

    createForm = () => {
        //Remove Existing form if exist in array
        if (this.parentForm?.get("frmNoteTemplate")) {
            this.parentForm?.removeControl("frmNoteTemplate");
        }

        this.frmNoteTemplate = this.fb.group({
            inpTemplateName: [this.selectedTemplate?.Template?.TemplateName, [Validators.required, Validators.maxLength(100)]],
            slctTemplateCategory: [this.selectedTemplate?.Template?.CategoryId, [Validators.required]]
        });

        this.parentForm.addControl("frmNoteTemplate", this.fb.array([this.frmNoteTemplate]));
        this.setValuesOnChanges();
    }

    setValuesOnChanges = () => {
        //To get all child form changes 
        this.frmNoteTemplateSubScription = this.frmNoteTemplate.valueChanges.subscribe((changes) => {
            if (changes && this.selectedTemplate?.Template) {
                this.selectedTemplate.Template.TemplateName = changes["inpTemplateName"]?.toString();
                this.selectedTemplate.Template.CategoryId = changes["slctTemplateCategory"]?.toString();
            }
        })
    }

    templateBodyCustomFormChanged = () => {
        if (this.selectedTemplate?.TemplateBodyCustomForm) {
            if (this.selectedTemplate?.TemplateBodyCustomForm?.FormSections && this.selectedTemplate?.TemplateBodyCustomForm?.FormSections?.length > 0) {
                this.canAddSection = (this.selectedTemplate?.TemplateBodyCustomForm?.FormSections?.findIndex(x => x?.Title == "") == -1 && this.selectedTemplate.TemplateBodyCustomForm.IndexOfSectionInEditMode === -1 ? true : false);
            }
            else {
                this.canAddSection = true;
            }
        }
    }

    getPageNavigation = () => {
        this.breadCrumbs = [
            {
                name: this.localize.getLocalizedString('Practice Settings'),
                path: '#/BusinessCenter/PracticeSettings',
                title: 'Practice Settings'
            },
            {
                name: this.localize.getLocalizedString('Clinical Note Templates'),
                path: '/BusinessCenter/Settings/NoteTemplates/',
                title: 'Clinical Note Templates'
            }
        ];
        this.dataForCrudOperation.BreadCrumbs = this.breadCrumbs;

    }

    getAccess = () => {
        this.authAccess = this.noteTemplatesHttpService.access();
        if (!this.authAccess.view) {
            this.toastrFactory.error(this.patSecurityService.generateMessage('soar-clin-nottmp-view'), 'Not Authorized');
            window.location.href = '/';
        }
    }

    createEmptySection = (sectionCount) => {
        const tempSection: FormSection = new FormSection();
        tempSection.FormSectionId = "00000000-0000-0000-0000-000000000000";
        tempSection.Title = "";
        tempSection.FormId = "00000000-0000-0000-0000-000000000000";
        tempSection.SequenceNumber = sectionCount;
        tempSection.ShowTitle = true;
        tempSection.ShowBorder = true;
        tempSection.IsVisible = true;
        tempSection.FormSectionItems = [];
        return tempSection;
    };

    selectedNoteTemplate = (data: { selectedTemplate: NoteTemplatesViewModel, editMode: boolean }) => {
        this.selectedTemplate = cloneDeep(data?.selectedTemplate);
        if (this.noteTemplatesHttpService?.CurrentOperation !== 'copy') {
            this.selectedTemplateBackup = cloneDeep(data?.selectedTemplate);
        }
        this.canEditForm = data?.selectedTemplate?.canEditForm;
        //Form will create here as we are calling this form from note template list
        this.createForm();
        this.noteTemplatesHttpService.categories().then((res: SoarResponse<Categories>) => {
            this.noteCategories = cloneDeep(res?.Value);
            this.editMode = data?.editMode;
            this.existingTemplateActive = true;
        },
            () => {
                this.toastrFactory.error(this.localize.getLocalizedString('Failed to retrieve the list of {0}. Refresh the page to try again.', ['Clinical Note Templates']), this.localize.getLocalizedString('Server Error'));
            });
    }

    templateBodyCustomForm = () => {
        this.templateBodyCustomFormChanged();
        this.noteTemplatesHelperService.setData(this.selectedTemplate?.TemplateBodyCustomForm);
    }

    addSection = () => {
        if (this.selectedTemplate.TemplateBodyCustomForm && this.selectedTemplate.TemplateBodyCustomForm.FormSections) {
            let sectionCount = 0;
            if (this.selectedTemplate.TemplateBodyCustomForm.IndexOfSectionInEditMode == -1) {
                this.selectedTemplate.TemplateBodyCustomForm.IndexOfSectionInEditMode = this.selectedTemplate.TemplateBodyCustomForm.FormSections.length;
            }
            sectionCount = this.selectedTemplate.TemplateBodyCustomForm.FormSections.length + 1;
            this.selectedTemplate.TemplateBodyCustomForm.FormSections.push(this.createEmptySection(sectionCount));
            this.resequenceFormItems();
            this.templateBodyCustomFormChanged();
            this.noteTemplatesHelperService.setData(this.selectedTemplate.TemplateBodyCustomForm);
        }
    }

    // cancel button handler
    cancelEdit = () => {
        if (this.parentForm.dirty && !isEqual(this.selectedTemplate, this.selectedTemplateBackup)) {
            this.launchWarningModal();
        }
        else {
            this.cancel();
        }
    };
    // launch warning modal for edit cancel
    launchWarningModal = () => {
        this.modalFactory.WarningModal().then((result) => {
            if (result === true) {
                this.cancel();
            }
        }
        );
    };

    // cleanup after they have confirmed they want to cancel
    cancel = () => {
        this.noteTemplatesHttpService.SetActiveNoteTemplate({});
        this.editMode = false;
        this.existingTemplateActive = false;
        this.noteTemplatesHttpService.setTemplateDataChanged(false);
        this.noteTemplatesHelperService.resetCrudForm(this.parentForm);
        this.selectedTemplate = new NoteTemplatesViewModel();
        this.createForm();
    };

    // save button click handler, create or edit done here   
    saveTemplate = () => {
        if (this.isSaving == false) {
            this.isSaving = true;
            if (this.isValidCustomFormCheck(true)) {
                if (this.selectedTemplate?.Template?.TemplateId && this.authAccess?.update && this.noteTemplatesHttpService?.CurrentOperation === 'edit') {
                    this.updateTemplateForm();
                } else {
                    if (this.authAccess?.update) {
                        // the custom form name needs to be unique, just giving it a derived name because it will not be presented to the user for clinical note templates
                        this.selectedTemplate.TemplateBodyCustomForm.FormName = `${this.selectedTemplate?.Template?.TemplateName}_${Math.floor(Math.random() * 1000000)}_CNT`;

                        //Delete columns while add operation where value is auto generating
                        delete this.selectedTemplate?.Template?.TemplateBodyFormId;
                        delete this.selectedTemplate?.Template?.TemplateId;
                        delete this.selectedTemplate?.TemplateBodyCustomForm?.FormId;
                        delete this.selectedTemplate?.TemplateBodyCustomForm?.SourceFormId;

                        if (this.noteTemplatesHttpService?.CurrentOperation === 'copy') {
                            this.selectedTemplate.TemplateBodyCustomForm.TemplateMode = 1;
                        }

                        this.noteTemplatesHttpService.createNoteTemplate(this.selectedTemplate).then((result: SoarResponse<NoteTemplatesViewModel>) => {
                            this.toastrFactory.success(this.localize.getLocalizedString('Your {0} has been created.', ['Clinical Note Template']),
                                this.localize.getLocalizedString('Success'));
                            const saveResponse: NoteTemplatesViewModel = cloneDeep(result?.Value);
                            this.postSaveCleanup(saveResponse?.Template);
                        }, () => {
                            this.toastrFactory.error(this.localize.getLocalizedString('Save was unsuccessful. Please refresh the page and retry your save.'),
                                this.localize.getLocalizedString('Server Error'));
                        });
                    }
                    this.noteTemplatesHttpService.CurrentOperation = '';
                }
            }
        }
    };

    // update api call(s)
    updateTemplateForm = () => {
        const templateFormChanged = !isEqual(this.selectedTemplate?.TemplateBodyCustomForm, this.selectedTemplateBackup?.TemplateBodyCustomForm);
        if (templateFormChanged) {
            this.noteTemplatesHttpService.updateNoteTemplateForm(this.selectedTemplate?.TemplateBodyCustomForm).then(() => {
                this.toastrFactory.success(this.localize.getLocalizedString('Your {0} has been updated.', ['Clinical Note Template']),
                    this.localize.getLocalizedString('Success'));
                if (this.frmNoteTemplate.dirty) {
                    this.noteTemplatesHttpService.updateNoteTemplate(this.selectedTemplate?.Template).then((result: SoarResponse<Template>) => {
                        this.toastrFactory.success(this.localize.getLocalizedString('Your {0} has been updated.', ['Clinical Note Template']),
                            this.localize.getLocalizedString('Success'));
                        this.postSaveCleanup(result?.Value);
                    }, () => {
                        this.toastrFactory.error(this.localize.getLocalizedString('Save was unsuccessful. Please refresh the page and retry your update.'),
                            this.localize.getLocalizedString('Server Error'));
                    });
                }
                else {
                    this.postSaveCleanup(this.selectedTemplate?.Template);
                }
            }, () => {
                this.toastrFactory.error(this.localize.getLocalizedString('Save was unsuccessful. Please refresh the page and retry your update.'),
                    this.localize.getLocalizedString('Server Error'));
            });
        }
        else if (this.frmNoteTemplate.dirty) {
            this.noteTemplatesHttpService.updateNoteTemplate(this.selectedTemplate?.Template).then((result: SoarResponse<Template>) => {
                this.toastrFactory.success(this.localize.getLocalizedString('Your {0} has been updated.', ['Clinical Note Template']),
                    this.localize.getLocalizedString('Success'));
                this.postSaveCleanup(result?.Value);
            }, () => {
                this.toastrFactory.error(this.localize.getLocalizedString('Save was unsuccessful. Please refresh the page and retry your update.'),
                    this.localize.getLocalizedString('Server Error'));
            });
        }
    };

    // reset after successful save or edit
    postSaveCleanup = (result) => {
        if (!result.$$CategoryName) {
            const category = this.noteCategories?.find(x => x?.CategoryId == result?.CategoryId);
            if (category) {
                result.$$CategoryName = category.CategoryName;
            }
        }
        this.existingTemplateActive = false;
        this.noteTemplatesHttpService.SetActiveNoteTemplate({});
        this.editMode = false;
        this.isSaving = false;
        this.selectedTemplate = new NoteTemplatesViewModel();
        this.noteTemplatesHelperService.resetCrudForm(this.parentForm);
        this.parentForm.reset();
        this.createForm();
        this.noteTemplatesHttpService.setTemplateDataChanged(false);
        this.noteTemplatesHelperService.setCategoriesData();
    };

    // function to check if form is valid or not.
    isValidCustomFormCheck = (cleanupOptions) => {
        if (this.parentForm.valid == true && cleanupOptions) {
            this.noteTemplatesHttpService.SetItemOptions(this.selectedTemplate?.TemplateBodyCustomForm);
        }
        return this.parentForm.valid;
    }

    // resequence the form items after one is deleted to avoid duplicates
    resequenceFormItems = () => {
        let i = 0;
        this.selectedTemplate?.TemplateBodyCustomForm?.FormSections?.forEach((res) => {
            res.SequenceNumber = i;
            i++;
        })
    }

    // save button disabled conditions    
    isDisabled = () => {
        let result = false;
        result = (this.frmNoteTemplate.invalid || !this.parentForm.dirty || this.isSaving || this.parentForm.invalid || isEqual(this.selectedTemplate, this.selectedTemplateBackup));
        return result;
    }

    checkCanAddSection = () => {
        this.templateBodyCustomFormChanged();
        return !this.canAddSection;
    }

    ngOnDestroy() {
        this.frmNoteTemplateSubScription.unsubscribe();
        this.parentFormSubscription.unsubscribe();
    }
}