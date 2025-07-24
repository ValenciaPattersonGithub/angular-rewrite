import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { configureTestSuite } from 'src/configure-test-suite';
import { NoteTemplatesComponent } from '../note-templates.component';
import { NoteTemplatesListComponent } from './note-templates-list.component';
import { cloneDeep } from 'lodash';
import { NoteTemplatesHttpService } from 'src/@shared/providers/note-templates-http.service';
import { CategoriesWithTemplate, NoteTemplatesViewModel } from '../note-templates';

let isEditMode: boolean;
let mockAuthZ = {}
let mockActiveCategoryTrue;
let mockCategories: CategoriesWithTemplate[];
let mockNoteTemplates;
let mockCategory;
let mockNoteCategories;
let mockPatSecurityService;
let mockToastrFactory;
let mockLocalizeService;
let mockTemplateEmpty;
let mockTemplate: NoteTemplatesViewModel;
let mockDeleteModalData;
let mockSaveCategory;
let mockNoteTemplatesHttpService;
let mockModalFactory;
let retValue;
let frmNoteTemplate: FormGroup;
let mockNoteTemplatesComponent;

describe('NoteTemplatesListComponent', () => {
    let component: NoteTemplatesListComponent;
    let fixture: ComponentFixture<NoteTemplatesListComponent>;

    configureTestSuite(() => {
        mockAuthZ = {}

        mockActiveCategoryTrue = {
            CategoryId: null,
            ntExpand: false,
            addingNewTemplate: true
        };

        mockCategories = [
            { CategoryName: 'Cat1', CategoryId: "1", addingNewTemplate: false, ntExpand: true },
            { CategoryName: 'Cat2', CategoryId: "2", addingNewTemplate: false, ntExpand: true },
            { CategoryName: 'Cat3', CategoryId: "3", addingNewTemplate: false, ntExpand: true },
            { CategoryName: 'Cat3', CategoryId: "4", addingNewTemplate: false, ntExpand: true }
        ];

        mockNoteTemplates = [
            { TemplateName: 'Temp 1', CategoryId: 1, TemplateId: 1 },
            { TemplateName: 'Temp 2', CategoryId: 1, TemplateId: 2 },
            { TemplateName: 'Temp 3', CategoryId: 3, TemplateId: 3 }
        ];

        mockCategory = { CategoryName: 'Cat3', CategoryId: 4, $$Loaded: true, $$Visible: true, $$editing: true };

        mockNoteCategories = [
            {
                "ExtendedStatusCode": null,
                "Value": [
                    {
                        "CategoryId": "461d047a-04c0-4d14-b1c9-09670e96d53f",
                        "CategoryName": "new2",
                        "DataTag": "AAAAAAAiXRY=",
                        "UserModified": "a162c864-8f50-4e84-8942-7194bc8070cf",
                        "DateModified": "2023-03-14T10:05:23.7153006"
                    },
                    {
                        "CategoryId": "ba693141-4310-4613-8a79-0ea4249d333d",
                        "CategoryName": "shil1",
                        "DataTag": "AAAAAAAjYFQ=",
                        "UserModified": "a162c864-8f50-4e84-8942-7194bc8070cf",
                        "DateModified": "2023-04-03T15:15:48.2147816"
                    },
                    {
                        "CategoryId": "2cf6f359-1d14-4c91-92bc-11979a728f2e",
                        "CategoryName": "test06March",
                        "DataTag": "AAAAAAAh9Bg=",
                        "UserModified": "a162c864-8f50-4e84-8942-7194bc8070cf",
                        "DateModified": "2023-03-06T14:56:05.1387809"
                    },
                ],
                "Count": null,
                "InvalidProperties": null
            }
        ]

        mockPatSecurityService = {
            IsAuthorizedByAbbreviation: jasmine.createSpy('patSecurityService.IsAuthorizedByAbbreviation').and.returnValue(true),
            generateMessage: jasmine.createSpy('patSecurityService.generateMessage')
        };

        mockToastrFactory = {
            success: jasmine.createSpy('toastrFactory.success'),
            error: jasmine.createSpy('toastrFactory.error')
        };

        mockLocalizeService = {
            getLocalizedString: () => 'translated text'
        };

        mockTemplateEmpty = {};

        mockTemplate = {
            Template: {
                CategoryId: "3d8bec8a-0eb7-44b2-9628-ac175eecb9f3",
                CategoryName: "Cat1",
                TemplateId: "b6c5193a-4394-4a69-8bd9-8c4e713f3277",
                TemplateName: "Temp 4"
            },
            TemplateBodyCustomForm: {
                FormId: "00000000-0000-0000-0000-000000000000",
                VersionNumber: 1,
                SourceFormId: "00000000-0000-0000-0000-000000000000",
                FormName: "Breakfast_880510_CNT",
                Description: "",
                IsActive: true,
                IsVisible: true,
                IsPublished: false,
                IsDefault: false,
                FormSections: [
                    {
                        "FormSectionId": "00000000-0000-0000-0000-000000000000",
                        "Title": "SS2",
                        "FormId": "00000000-0000-0000-0000-000000000000",
                        "SequenceNumber": -1,
                        "ShowTitle": true,
                        "ShowBorder": true,
                        "IsVisible": true,
                        "FormSectionItems": [
                            {
                                "FormSectionId": "00000000-0000-0000-0000-000000000000",
                                "SectionItemId": "-1",
                                "BankItemId": '00000000-0000-0000-0000-000000000000',
                                "FormBankItem": { 'BankItemId': '00000000-0000-0000-0000-000000000000' },
                                "IsRequired": false,
                                "MultiSelectAllow": false,
                                "IsVisible": true,
                                "SequenceNumber": 1,
                                "BankItemDemographicId": null,
                                "FormBankItemDemographic": null,
                                "BankItemEmergencyContactId": null,
                                "FormBankItemEmergencyContact": {

                                },
                                "ItemOptions": [{
                                    "SectionItemId": "-1",
                                    "BankItemId": '00000000-0000-0000-0000-000000000000',
                                    "IsVisible": true,
                                    "SequenceNumber": 1,
                                    "BankItemOption": {
                                        "BankItemId": null,
                                        "BankItemOptionId": null
                                    }
                                }
                                ],
                                "FormItemTypeName": "Ad-Lib",
                                "FormItemType": 9,
                                "FormBankItemPromptTexts": [
                                    {
                                        "Answer": null,
                                        "ItemText": "i like eggs",
                                        "FormItemTypeName": "",
                                        "Description": "",
                                        "CommonlyUsed": false,
                                        "IsVisible": true,
                                        "UseDefaultValue": false,
                                        "DefaultValue": "",
                                        "ItemSequenceNumber": 1
                                    },
                                    {
                                        "Answer": null,
                                        "ItemText": "w bacon",
                                        "FormItemTypeName": "",
                                        "Description": "",
                                        "CommonlyUsed": false,
                                        "IsVisible": true,
                                        "UseDefaultValue": false,
                                        "DefaultValue": "",
                                        "ItemSequenceNumber": 2
                                    }
                                ],
                                "ItemPromptTextsOptions": [
                                    [
                                        {
                                            "SectionItemId": "00000000-0000-0000-0000-000000000000",
                                            "SectionItemOptionId": "00000000-0000-0000-0000-000000000000",
                                            "BankItemId": "00000000-0000-0000-0000-000000000000",
                                            "BankItemOptionId": "00000000-0000-0000-0000-000000000000",
                                            "BankItemOption": {
                                                "BankItemOptionId": "00000000-0000-0000-0000-000000000000",
                                                "OptionIndex": 1,
                                                "OptionText": "over easy",
                                                "OptionValue": "",
                                                "IsSelected": false,
                                                "IsVisible": false,
                                                "SequenceNumber": 1
                                            },
                                            "IsSelected": true,
                                            "IsVisible": true,
                                            "SequenceNumber": 1
                                        },
                                        {
                                            "SectionItemId": "00000000-0000-0000-0000-000000000000",
                                            "SectionItemOptionId": "00000000-0000-0000-0000-000000000000",
                                            "BankItemId": "00000000-0000-0000-0000-000000000000",
                                            "BankItemOptionId": "00000000-0000-0000-0000-000000000000",
                                            "BankItemOption": {
                                                "BankItemOptionId": "00000000-0000-0000-0000-000000000000",
                                                "OptionIndex": 2,
                                                "OptionText": "over medium",
                                                "OptionValue": "",
                                                "IsSelected": false,
                                                "IsVisible": false,
                                                "SequenceNumber": 1
                                            },
                                            "IsSelected": true,
                                            "IsVisible": true,
                                            "SequenceNumber": 1
                                        },
                                        {
                                            "SectionItemId": "00000000-0000-0000-0000-000000000000",
                                            "SectionItemOptionId": "00000000-0000-0000-0000-000000000000",
                                            "BankItemId": "00000000-0000-0000-0000-000000000000",
                                            "BankItemOptionId": "00000000-0000-0000-0000-000000000000",
                                            "BankItemOption": {
                                                "BankItemOptionId": "00000000-0000-0000-0000-000000000000",
                                                "OptionIndex": 3,
                                                "OptionText": "over well",
                                                "OptionValue": "",
                                                "IsSelected": false,
                                                "IsVisible": false,
                                                "SequenceNumber": 1
                                            },
                                            "IsSelected": true,
                                            "IsVisible": true,
                                            "SequenceNumber": 1
                                        }
                                    ]
                                ]
                            }
                        ]
                    }
                ],
                IndexOfSectionInEditMode: 0,
                SectionValidationFlag: false,
                SectionCopyValidationFlag: -1,
                TemplateMode: 1
            }
        };

        mockDeleteModalData = [{ 'ExtendedStatusCode': null, 'InvalidProperties': null }]
        mockSaveCategory = [{
            "ExtendedStatusCode": null,
            "Value": {
                "CategoryId": "f79589c8-ff67-481b-b09f-2d1b9b4efc34",
                "CategoryName": "newCat1",
                "DataTag": "AAAAAAAll1E=",
                "UserModified": "a162c864-8f50-4e84-8942-7194bc8070cf",
                "DateModified": "2023-04-19T10:04:56.4083349Z"
            },
            "Count": null,
            "InvalidProperties": null
        }]

        mockNoteTemplatesHttpService = {
            ActiveTemplateCategory: jasmine.createSpy().and.returnValue({}),
            ActiveNoteTemplate: jasmine.createSpy().and.returnValue({}),
            CurrentOperation: jasmine.createSpy().and.returnValue({}),
            access: jasmine.createSpy().and.returnValue({ view: true, create: true, update: true }),
            SetActiveNoteTemplate: jasmine.createSpy().and.callFake((temp) => {
                return temp;
            }),
            SetActiveTemplateCategory: jasmine.createSpy().and.callFake((category) => {
                return category;
            }),
            SetCurrentOperation: jasmine.createSpy().and.callFake((temp) => {
                return temp;
            }),
            setTemplateDataChanged: jasmine.createSpy().and.returnValue({}),
            ShowTemplateHeader: jasmine.createSpy().and.returnValue({}),
            CloseTemplateHeader: jasmine.createSpy().and.returnValue({}),
            validateTemplate: jasmine.createSpy().and.returnValue({}),
            saveNoteTemplates: jasmine.createSpy().and.returnValue({
                then: jasmine.createSpy()
            }),
            observeTemplates: jasmine.createSpy().and.returnValue({}),
            observeCategories: jasmine.createSpy().and.returnValue({}),
            CategoriesWithTemplates: () => {
                return {
                    then: (res, error) => {
                        res({ Value: [] }),
                            error({})
                    }
                }
            },
            ExpandOrCollapseCategory: jasmine.createSpy().and.returnValue({
                then: jasmine.createSpy()
            }),
            deleteNoteCategory: (data) => {
                return {
                    then: (res, error) => {
                        res({ Value: mockDeleteModalData }),
                            error({})
                    }
                }
            },
            deleteNoteTemplate: (data) => {
                return {
                    then: (res, error) => {
                        res({ Value: mockDeleteModalData }),
                            error({})
                    }
                }
            },
            LoadTemplateBodyCustomForm: (data) => {
                return {
                    then: (res, error) => {
                        res({ Value: mockTemplate.TemplateBodyCustomForm }),
                            error({})
                    }
                }
            },
            getTemplates: (data) => {
                return {
                    then: (res, error) => {
                        res({ Value: mockNoteCategories }),
                            error({})
                    }
                }
            },
            saveCategory: (data) => {
                return {
                    then: (res, error) => {
                        res({ Value: mockSaveCategory }),
                            error({})
                    }
                }
            },
            updateNoteTemplateForm: () => {
                return {
                    then: (res, error) => {
                        res({ Value: mockNoteCategories }),
                            error({})
                    }
                }
            },
            updateNoteTemplate: () => {
                return {
                    then: (res, error) => {
                        res({ Value: mockCategories }),
                            error({})
                    }
                }
            },
            createNoteTemplate: () => {
                return {
                    then: (res, error) => {
                        res({ Value: mockNoteTemplates }),
                            error({})
                    }
                }
            },
            categories: () => {
                return {
                    then: (res, error) => {
                        res({ Value: mockNoteTemplates }),
                            error({})
                    }
                }
            },
        };

        mockModalFactory = {
            CancelModal: jasmine.createSpy('ModalFactory.CancelModal').and.returnValue({ then: () => { } }),
            ConfirmModal: jasmine.createSpy('ModalFactory.ConfirmModal').and.returnValue({ then: () => { } }),
            DeleteModal: jasmine.createSpy('ModalFactory.DeleteModal').and.returnValue({
                then: (success) => {
                    success(true)
                }
            }),
            WarningModal: jasmine.createSpy('ModalFactory.WarningModal').and.returnValue({
                then: (success) => {
                    success(true)
                }
            })
        }

        retValue = { $promise: { then: jasmine.createSpy() } };

        mockNoteTemplatesComponent = {
            templateBodyCustomForm: jasmine.createSpy().and.returnValue({}),
        }

        TestBed.configureTestingModule({
            imports: [
                FormsModule,
                ReactiveFormsModule,
                TranslateModule.forRoot()
            ],
            providers: [
                { provide: 'localize', useValue: mockLocalizeService },
                { provide: NoteTemplatesHttpService, useValue: mockNoteTemplatesHttpService },
                { provide: 'ModalFactory', useValue: mockModalFactory },
                { provide: 'toastrFactory', useValue: mockToastrFactory },
                { provide: 'localize', useValue: mockLocalizeService },
                { provide: 'patSecurityService', useValue: mockPatSecurityService },
                { provide: 'AuthZService', useValue: mockAuthZ },
                FormBuilder,
                { provide: NoteTemplatesComponent, useValue: mockNoteTemplatesComponent }
            ],
            declarations: [NoteTemplatesListComponent],
            schemas: [CUSTOM_ELEMENTS_SCHEMA]
        });
    });

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [NoteTemplatesListComponent]
        })
            .compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(NoteTemplatesListComponent);
        component = fixture.componentInstance;

        frmNoteTemplate = component.fb.group({
            inpTemplateName: "templatename",
            slctTemplateCategory: "1",
            noteTempListFormArray: new FormArray([])
        });

        component.parentForm = frmNoteTemplate;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    describe('getNoteTemplatesForCategory ->', () => {

        it('check if all the templates are retrieved', () => {
            component.getNoteTemplatesForCategory({ CategoryId: 1, $$Loaded: false }, false);
            component.noteTemplates = mockNoteTemplates
            expect(component.noteTemplates).toEqual([{ TemplateName: 'Temp 1', CategoryId: 1, TemplateId: 1 },
            { TemplateName: 'Temp 2', CategoryId: 1, TemplateId: 2 },
            { TemplateName: 'Temp 3', CategoryId: 3, TemplateId: 3 }
            ]);
        });
    });

    describe('loadCategoriesAndTemplates ->', () => {
        let mockCategories = [];
        beforeEach(() => {
            component.noteTemplates = [];
            mockCategories = [
                { CategoryName: 'Category 1', Templates: [{}, {}] },
                { CategoryName: 'Category 2', Templates: [{}, {}] },
                { CategoryName: 'Category 3', Templates: [{},] },
            ];
        });

        it('it should add categories to noteCategories if category.$$Loaded equals false', () => {
            component.noteCategories = [];
            component.loadCategoriesAndTemplates(mockCategories);
            expect(component.noteCategories.length).toEqual(3);
            component.noteCategories = [];
            component.noteTemplates = [];
        });

        it('it should add categories to component.noteCategories', () => {
            component.loadCategoriesAndTemplates(mockCategories);
            expect(component.noteCategories.length).toEqual(3);
        });

        it('it should add templates to component.noteTemplates', () => {
            component.loadCategoriesAndTemplates(mockCategories);
            expect(component.noteTemplates.length).toEqual(5);
        });

        it('it should call component.updateCategoryVisibleFlags(true) to set $$Visible ', () => {
            spyOn(component, 'updateCategoryVisibleFlags');
            component.loadCategoriesAndTemplates(mockCategories);
            expect(component.updateCategoryVisibleFlags).toHaveBeenCalledWith(true);
        });

        it('it should create a backup of noteTemplates ', () => {
            component.loadCategoriesAndTemplates(mockCategories);
            expect(component.noteTemplatesBackup).toEqual(component.noteTemplates);
            expect(component.loadingCategories).toEqual(false);
            expect(component.loadingTemplates).toEqual(false);
        });
    });

    describe('addCopyTemplate ->', () => {

        it('should call loadTemplateBodyCustomForm and check if the category in which template is to be added is active', () => {
            component.editMode = false;
            component.existingTemplateActive = true;
            component.addCopyTemplate({});
            expect(component.editMode).toBe(false);
            expect(component.existingTemplateActive).toBe(true);
        });

        it('check if the new Template is selected', () => {
            const spy = component.defaultInitilizationOfTemplate = jasmine.createSpy();
            component.editMode = false;
            component.selectedTemplate = mockTemplateEmpty;
            component.addCopyTemplate(mockTemplate);
            component.defaultInitilizationOfTemplate();
            expect(spy).toHaveBeenCalled();
        });

        it(' check if the new Template is selected', () => {
            component.addCopyTemplate(null);
            expect(component.selectedTemplate).toEqual({ Template: Object({ TemplateName: '', CategoryId: null }), TemplateBodyCustomForm: Object({ FormId: '00000000-0000-0000-0000-000000000000', VersionNumber: 1, SourceFormId: '00000000-0000-0000-0000-000000000000', FormName: "", Description: '', IsActive: true, IsVisible: true, IsPublished: false, IsDefault: false, FormSections: [], IndexOfSectionInEditMode: -1, SectionValidationFlag: false, SectionCopyValidationFlag: -1, TemplateMode: 1 }), canEditForm: true })
        });
    });

    describe('loadTemplateBodyCustomForm ->', () => {

        it('Check if templateId is null', () => {
            component.selectedTemplate.Template.TemplateId = null;
            component.loadTemplateBodyCustomForm(true);
            expect(mockNoteTemplatesComponent.templateBodyCustomForm).toHaveBeenCalled();
        });

        it('if templateId is not null', () => {
            component.selectedTemplate.Template = mockTemplate.Template;
            component.selectedTemplateCopy = component.selectedTemplate;
            component.loadTemplateBodyCustomForm(true);
            expect(mockNoteTemplatesComponent.templateBodyCustomForm).toHaveBeenCalled();
            expect(component.selectedTemplate.TemplateBodyCustomForm.IndexOfSectionInEditMode).toBe(-1);
        });

        it('if templateId is not null and FormItemType is not 11 and not 9', () => {
            component.selectedTemplate.TemplateBodyCustomForm = cloneDeep(mockTemplate.TemplateBodyCustomForm) as any;
            component.selectedTemplate.Template = mockTemplate.Template;
            component.selectedTemplateCopy = component.selectedTemplate;
            mockTemplate.TemplateBodyCustomForm.FormSections[0].FormSectionItems[0].FormItemType = 1;
            component.loadTemplateBodyCustomForm(true);
            expect(mockNoteTemplatesComponent.templateBodyCustomForm).toHaveBeenCalled();
            expect(component.selectedTemplate.TemplateBodyCustomForm.IndexOfSectionInEditMode).toBe(-1);
            expect(component.selectedTemplate.TemplateBodyCustomForm.FormSections[0].FormSectionItems[0].BankItemId).toBe('00000000-0000-0000-0000-000000000000');
        });

        it('should call copyNoteTemplate', () => {
            component.selectedTemplate = cloneDeep(mockTemplate);
            component.selectedTemplate.TemplateBodyCustomForm = cloneDeep(mockTemplate.TemplateBodyCustomForm);
            component.selectedTemplate.Template = mockTemplate.Template;
            component.selectedTemplateCopy.TemplateBodyCustomForm = cloneDeep(mockTemplate.TemplateBodyCustomForm);
            component.selectedTemplateCopy.Template = mockTemplate.Template;
            component.copyNoteTemplate();
            expect(component.parentForm.dirty).toBe(true);
        });

    });

    describe('loadNoteTemplate ->', () => {

        it('should call loadNoteTemplate', () => {
            component.selectedNoteTemplate.emit = jasmine.createSpy();
            component.addCopyTemplate(mockTemplate);
            component.loadNoteTemplate(true, 'edit');
            expect(component.selectedNoteTemplate.emit).toHaveBeenCalled();
        });

        it('should call CloseTemplateHeader', () => {
            const spy = mockNoteTemplatesHttpService.CloseTemplateHeader = jasmine.createSpy();
            component.searchMode = false;
            component.activeCategory = mockActiveCategoryTrue;
            component.activeCategory.addingNewTemplate = mockActiveCategoryTrue.addingNewTemplate
            component.addCopyTemplate(mockTemplate);
            mockNoteTemplatesHttpService.CloseTemplateHeader(mockActiveCategoryTrue);
            expect(spy).toHaveBeenCalled();
        });

    });

    describe('createEmptyCategory -> ', () => {

        it(' should call createEmptyCategory ', () => {
            component.createEmptyCategory();
            mockNoteTemplatesHttpService.access();
            expect(component.formIsValid).toBeTruthy();
        });

        it(' should check if the Category field is empty and set ntExpand, addingNewTemplate', () => {
            component.noteCategories = mockCategories;
            component.createEmptyCategory();
            mockNoteTemplatesHttpService.access();
            expect(component.formIsValid).toBeTruthy();
            expect(mockCategories[1].ntExpand).toBeFalsy();
            expect(mockCategories[1].addingNewTemplate).toBeFalsy();
        });

    });

    describe('addNoteCategory ->', () => {

        it(' should check if the Category name field is empty ', () => {
            component.addNoteCategory();
            mockNoteTemplatesHttpService.access();
            component.formIsValid = true;
            expect(component.formIsValid).toBeTruthy();
        });

        it(' should check if the Category name field exists already ', () => {
            component.NewCategory.newCategoryName = 'Cat1';
            component.noteCategories = mockCategories;
            component.addNoteCategory();
            mockNoteTemplatesHttpService.access();
            expect(component.duplicateNoteCategory).toBeTruthy();
        });

        it(' should check if the Category isAddCategory ', () => {
            component.formIsValid = true;
            component.addNoteCategory();
            mockNoteTemplatesHttpService.access();
            expect(component.isAddCategory).toEqual(component.isAddCategory);
            expect(component.NewCategory.newCategoryName).toBe(component.NewCategory.newCategoryName.trim());
        });

        it(' should call getTemplateCategoriesWithTemplates ', () => {
            const spy = component.getTemplateCategoriesWithTemplates = jasmine.createSpy();
            component.formIsValid = true;
            component.addNoteCategory();
            mockNoteTemplatesHttpService.access();
            component.getTemplateCategoriesWithTemplates();
            expect(component.isAddCategory).toEqual(component.isAddCategory);
            expect(component.NewCategory.newCategoryName).toBe(component.NewCategory.newCategoryName.trim());
            expect(spy).toHaveBeenCalled();
        });
    });

    describe('search ->', () => {
        let term = 'cat1';

        // NG15CLEANUP can fix incrementally after merge to DEV
        // test fails because wrong resolve for service method
        // it('should call search and return unloadedCategoriesCount with loaded records', () => {
        //     component.noteCategories = [{ CategoryName: 'Cat1', CategoryId: "1", addingNewTemplate: false, ntExpand: true, $$Loaded: false }];
        //     component.search(term);
        //     expect(component.unloadedCategoriesCount).toBe(0);
        //     expect(component.noteCategories[0].$$Loaded).toBe(true);
        // });

        it('should return unloadedCategoriesCount as 0', () => {
            component.noteCategories = mockCategories;
            component.unloadedCategoriesCount = 1;
            component.search(term);
            expect(component.unloadedCategoriesCount).toBe(0);
        });

        it('should call clearNoteTemplatesSearch ', () => {
            component.unloadedCategoriesCount = 0;
            term = '';
            component.search(term);
            component.clearNoteTemplatesSearch();
            expect(component.searchTerm).toBe('');
            expect(component.searchMode).toBeFalsy();
            expect(component.updateCategoryVisibleFlags).toBeTruthy();
        });
    });

    describe('deleteNoteCategory -> ', () => {
        it('opens confirmation popup and delete the category after confirm', () => {
            component.editMode = false;
            mockCategory.$$Loaded = true;
            component.deleteNoteCategory(mockCategory);
            expect(mockModalFactory.DeleteModal).toHaveBeenCalled();
        });
    });

    describe('editNoteTemplate ->', () => {

        it(' should call loadTemplateBodyCustomForm ', () => {
            const spy = component.loadTemplateBodyCustomForm = jasmine.createSpy();
            component.editMode = false;
            component.editNoteTemplate(mockTemplate, isEditMode);
            expect(spy).toHaveBeenCalled();
        });

        it(' should check for selectedTemplate ', () => {
            component.editNoteTemplate(mockTemplate, isEditMode);
            component.editMode = false;
            component.selectedTemplate = { Template: Object({ TemplateName: 'Temp1', CategoryId: null }) };
            expect(component.existingTemplateActive).toBeTruthy();
        });

    });

    describe('confirmDeleteNoteTemplate ->', () => {

        it('opens confirmation popup and delete the category after confirm', () => {
            component.confirmDeleteNoteTemplate(mockTemplate);
            expect(component.editMode).toBeFalsy();
            expect(component.existingTemplateActive).toBeFalsy();
        });

    });

    describe('deleteNoteTemplate -> ', () => {

        it('opens confirmation popup and delete the category after confirm', () => {
            spyOn(component, 'confirmDeleteNoteTemplate');
            mockTemplate.Template.TemplateName = 'Temp3';
            component.editMode = false;
            component.deleteNoteTemplate(mockNoteTemplates);
            component.confirmDeleteNoteTemplate(mockNoteTemplates);
            expect(component.confirmDeleteNoteTemplate).toHaveBeenCalled();
        });

    });

    describe('collapseAll ->', () => {
        it(' should collapse rest of the categories', () => {
            component.noteCategories = mockCategories;
            component.collapseAll(mockCategories[0]);
            expect(mockCategories[1].ntExpand).toBeFalsy();
        });
    });

    describe('confirmDeleteNoteCategory ->', () => {
        it(' should call confirmDeleteNoteCategory ', () => {
            component.confirmDeleteNoteCategory(mockCategory);
            expect(mockToastrFactory.success).toHaveBeenCalled();
        });
    });

    describe('updateNoteCategory -> ', () => {

        it('opens confirmation popup and delete the template after confirm', () => {
            spyOn(component, 'getNoteTemplatesForCategory');
            component.updateNoteCategory(mockCategories[0]);
            expect(component.editCategory).toBe(false);
        });

        describe('getTemplateCategoriesWithTemplates ->', () => {

            it('should check the duplicate name when updating', () => {
                spyOn(component, 'getTemplateCategoriesWithTemplates');
                component.noteCategories = mockCategories;
                mockCategories[0].CategoryName = 'Cat2';
                component.updateNoteCategory(mockCategories[0]);
                component.getTemplateCategoriesWithTemplates();
                expect(component.getTemplateCategoriesWithTemplates).toHaveBeenCalled();
            });

        });

        describe('createForm ->', () => {

            it('should call createForm with all fields', () => {
                component.createForm();
                expect(component.noteTempListForm).not.toBe(null);
            });

            it('should add noteTempListForm in parent form', () => {
                component.createForm();
                expect(component.parentForm.controls["noteTempListFormArray"]).not.toBe(null);
            });

            it('should add note categories in parent form', () => {
                component.noteCategories = mockCategories;
                component.createForm();
                expect(component.parentForm.controls["noteCategories_0"]).not.toBe(null);
            });

        })

        describe('setUpdatedFormValues ->', () => {

            it('should call setUpdatedFormValues on any form value changed', () => {
                component.noteTempListForm.setValue({ "inpNoteCategoryName": "CategoryName" });
                component.noteTempListForm.valueChanges.subscribe((changedvalue) => {
                    expect(component.NewCategory.newCategoryName).toEqual("CategoryName");
                })
            });

            it('should call setUpdatedFormValues on any form value changed including note categories', () => {
                component.noteCategories = mockCategories;
                component.createForm();
                component.noteTempListForm.setValue({ "inpNoteCategoryName": "CategoryName", "inpEditNoteCategoryName_0": "CategoryName_0", "inpEditNoteCategoryName_1": "CategoryName_1", "inpEditNoteCategoryName_2": "CategoryName_2", "inpEditNoteCategoryName_3": "CategoryName_3" });
                component.noteTempListForm.valueChanges.subscribe((changedvalue) => {
                    expect(component.NewCategory.newCategoryName).toEqual("CategoryName");
                    expect(component.noteCategories[0].CategoryName).toEqual("CategoryName_0");
                })
            });

        });

        describe('ngOnDestroy ->', () => {
            it('should close subscription on destroy', () => {
                component.ngOnDestroy();
                component.subscriptions?.forEach((subscription) =>
                    expect(subscription?.closed).toBe(true))
            });
        });
    });

    describe('cancelNoteCategory ->', () => {
        it(' should call launchWarningModal ', () => {
            const spy = component.launchWarningModal = jasmine.createSpy();
            component.cancelNoteCategory();
            component.launchWarningModal();
            expect(spy).toHaveBeenCalled();
        });

        it(' should call modalfactory if NewCategory has been added ', () => {
            component.NewCategory.newCategoryName = 'Cat1';
            const spy = component.launchWarningModal = jasmine.createSpy();
            component.cancelNoteCategory();
            component.launchWarningModal();
            expect(spy).toHaveBeenCalled();
        });

    });

    describe('launchWarningModal -> ', () => {

        it('should call clearNoteCategory', () => {
            const spy = component.clearNoteCategory = jasmine.createSpy();
            component.launchWarningModal();
            component.clearNoteCategory();
            expect(spy).toHaveBeenCalled();
        });

    });

    describe('expandNoteCategory ->', () => {

        it(' should call expandNoteCategory ', () => {
            component.expandNoteCategory(mockCategory);
            expect(component.isAddCategory).toBeFalsy();
        });

        it(' should call collapseAll ', () => {
            const spy = component.collapseAll = jasmine.createSpy();
            component.expandNoteCategory(mockCategory);
            component.collapseAll(mockCategory);
            expect(spy).toHaveBeenCalled();
        });

    });

    describe('cancelUpdateCategory ->', () => {

        it(' should call cancelUpdateCategory ', () => {
            component.cancelUpdateCategory(mockCategory);
            expect(component.editCategory).toBeFalsy();
            expect(mockCategory.$$editing = false)
        });

    });

    describe('toggleCategoryEdit ->', () => {

        it('if a user has unsaved changes in the inline edit field, resetting the name to the original', () => {
            component.toggleCategoryEdit(mockCategories[0], 1);
            component.editMode = false;
            expect(component.duplicateNoteCategory).toBeFalsy();
            expect(component.isAddCategory).toBeFalsy();
            expect(mockCategories[0].CategoryName).toEqual(mockCategories[0].CategoryName);
        });

    });

    describe('isSelectedNoteTemplate ->', () => {

        it('should call selected template and return false', () => {
            component.selectedTemplate.Template = mockTemplate.Template;
            component.isSelectedNoteTemplate(mockTemplate);
            expect(component.selectedTemplate.Template.TemplateId).toEqual(mockTemplate.Template.TemplateId);
        });

        it('should call selected template and return true', () => {
            spyOn(component, 'isSelectedNoteTemplate').and.returnValue(true);
            component.isSelectedNoteTemplate(mockTemplate);
            expect(component.isSelectedNoteTemplate).toHaveBeenCalledWith(mockTemplate);
        });

    });

})
