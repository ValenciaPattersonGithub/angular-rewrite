import { ChangeDetectorRef, ElementRef } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormArray, FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { OrderByPipe } from 'src/@shared/pipes';
import { CustomFormTemplate, FormItemTextField, FormSection, FormSectionItem, FormTypes } from 'src/business-center/practice-settings/chart/note-templates/note-templates';
import { NoteTemplatesComponent } from 'src/business-center/practice-settings/chart/note-templates/note-templates.component';
import { NoteTemplatesHelperService } from 'src/business-center/practice-settings/chart/note-templates/note-templates-helper.service';
import { SectionCrudComponent } from '../section-crud.component';
import { CustomTextFieldComponent } from './custom-text-field/custom-text-field.component';
import { LinkToothComponent } from './link-tooth/link-tooth.component';
import { MultipleChoiceComponent } from './multiple-choice/multiple-choice.component';
import { SectionItemCrudComponent } from './section-item-crud.component';
import { YesNoTrueFalseComponent } from './yes-no-true-false/yes-no-true-false.component';
import { NoteTemplatesHttpService } from 'src/@shared/providers/note-templates-http.service';
import { BehaviorSubject } from 'rxjs';

let mockLocalizeService = {
    getLocalizedString: () => 'translated text'
};

let mockSubscription = {
    unsubscribe: jasmine.createSpy(),
    _subscriptions: jasmine.createSpy(),
    closed: true,
    add: jasmine.createSpy(),
    remove: jasmine.createSpy(),
    _parentOrParents: []
};

let bankItem = {
    ItemText: "",
    FormItemTypeName: "",
    Description: "",
    CommonlyUsed: false,
    IsVisible: true,
    UseDefaultValue: false,
    DefaultValue: "",
};

let noteTemplatesHttpService = {}

let mockSectionItem = {
    BankItemDemographicId: null,
    BankItemId: null,
    DataTag: "AAAAAAAhpeQ=",
    DateModified: "2023-02-08T15:57:34.3266499",
    FormBankItem: { FormItemTypeName: FormTypes[3] },
    FormBankItemDemographic: null,
    FormBankItemEmergencyContact: null,
    FormItemTextField: null,
    FormItemType: FormTypes['Multiple Choice'],
    FormSectionId: "01aef280-2cf5-4326-934e-ed43ee3849f7",
    IsRequired: false,
    IsVisible: true,
    FormBankItemPromptTexts: [
        {
            Answer: null,
            BankItemId: "a6773ae6-0b79-477e-bfb4-9c148994bf4a",
            CommonlyUsed: false,
            DataTag: "AAAAAAAhpVg=",
            DateModified: "2023-02-08T12:55:15.7229439",
            DefaultValue: "",
            Description: "",
            ItemSequenceNumber: 1,
            ItemText: "Text Before Response 1",
            SectionItemId: "cfc94739-53ec-427d-8a90-b8ae40ca2939",
            UseDefaultValue: false,
            UserModified: "a162c864-8f50-4e84-8942-7194bc8070cf"
        }, {
            Answer: null,
            BankItemId: "a6773ae6-0b79-477e-bfb4-9c148994bf4a",
            CommonlyUsed: false,
            DataTag: "AAAAAAAhpVg=",
            DateModified: "2023-02-08T12:55:15.7229439",
            DefaultValue: "",
            Description: "",
            ItemSequenceNumber: 2,
            ItemText: "Text After Response 2",
            SectionItemId: "cfc94739-53ec-427d-8a90-b8ae40ca2939",
            UseDefaultValue: false,
            UserModified: "a162c864-8f50-4e84-8942-7194bc8070cf"
        }
    ],

}

let tempCustomerFormData: CustomFormTemplate = {
    FormId: "1234",
    FormName: "Test Form",
    VersionNumber: 1,
    SourceFormId: "4567",
    FormTypeId: 2,
    Description: "Description",
    IsActive: false,
    IsVisible: false,
    IsPublished: false,
    IsDefault: false,
    FormSections: [{ SequenceNumber: 1 }, { SequenceNumber: 2 }, { SequenceNumber: 3 }],
    TemplateMode: 1,
    FileAllocationId: 1,
    DataTag: "",
    UserModified: "",
    DateModified: "",
    IndexOfSectionInEditMode: -1,
    SectionValidationFlag: false,
    SectionCopyValidationFlag: 1
};

//AdLib
let mockModalFactoryService = {};
let mockLocation = {};
let mockInjector = {};
let mockToastrFactory = {};
let mockPatSecurityService = {};
let mockAuthZ = {};

//linkTooth
let mockStaticData = {
    TeethDefinitions: () => {
        return {
            then: (res) => { res({ Value: { Teeth: [{ USNumber: "1" }, { USNumber: "2" }] } }) }
        };
    }
};

describe('SectionItemCrudComponent ->', () => {
    let component: SectionItemCrudComponent;
    let fixture: ComponentFixture<SectionItemCrudComponent>;

    let formSectionItem: FormSectionItem = new FormSectionItem();
    formSectionItem.FormItemTextField = new FormItemTextField();
    formSectionItem.FormItemTextField.NoteText = null;
    formSectionItem.FormItemTextField.IsRequiredNoteText = true;
    formSectionItem.FormItemTextField.TextFieldItemTypeId = FormTypes['Note Text'].toString();
    formSectionItem.FormItemTextField.ItemTextFieldId = '00000000-0000-0000-0000-000000000000';
    formSectionItem.ItemTextFieldId = '00000000-0000-0000-0000-000000000000';
    formSectionItem.FormItemTypeName = FormTypes[11];  //'Note Text';
    formSectionItem.FormItemType = FormTypes['Note Text'];  //11;
    formSectionItem.FormBankItem = bankItem;
    formSectionItem.FormBankItemPromptTexts = mockSectionItem.FormBankItemPromptTexts;
    formSectionItem.BankItemDemographicId = null;
    formSectionItem.FormBankItemDemographic = null;
    formSectionItem.BankItemEmergencyContactId = null;
    formSectionItem.FormBankItemEmergencyContact = null;
    formSectionItem.FormBankItemDemographic = null;
    formSectionItem.BankItemId = null;

    const yesNo = {
        BankItemDemographicId: null,
        BankItemId: null,
        DataTag: "AAAAAAAhpeQ=",
        DateModified: "2023-02-08T15:57:34.3266499",
        FormBankItem: {
            ItemText: "",
            FormItemTypeName: "",
            Description: "",
            CommonlyUsed: false,
            IsVisible: true,
            UseDefaultValue: false,
            DefaultValue: "",
        },
        FormBankItemDemographic: null,
        FormBankItemEmergencyContact: null,
        FormItemTextField: null,
        FormItemType: FormTypes['Yes/No True/False'],
        FormSectionId: "01aef280-2cf5-4326-934e-ed43ee3849f7",
        IsRequired: false,
        IsVisible: true,
        ItemOptions: [],
        ItemPromptTextsOptions: [],
        MultiSelectAllow: false,
        SectionItemId: "686af729-a55d-47d5-9952-b0f47ff4d00d",
        SequenceNumber: 1,
        UserModified: "a162c864-8f50-4e84-8942-7194bc8070cf",
        FormItemTypeName: FormTypes[2]
    }
    const AdLib = {
        BankItemDemographicId: null,
        BankItemId: null,
        DataTag: "AAAAAAAhpeQ=",
        DateModified: "2023-02-08T15:57:34.3266499",
        FormBankItem: {
            ItemText: "",
            FormItemTypeName: "",
            Description: "",
            CommonlyUsed: false,
            IsVisible: true,
            UseDefaultValue: false,
            DefaultValue: "",
        },
        FormBankItemDemographic: null,
        FormBankItemEmergencyContact: null,
        FormItemTextField: null,
        FormItemType: FormTypes['Ad-Lib'],
        FormSectionId: "01aef280-2cf5-4326-934e-ed43ee3849f7",
        IsRequired: false,
        IsVisible: true,
        ItemOptions: [],
        ItemPromptTextsOptions: [],
        MultiSelectAllow: false,
        SectionItemId: "686af729-a55d-47d5-9952-b0f47ff4d00d",
        SequenceNumber: 2,
        UserModified: "a162c864-8f50-4e84-8942-7194bc8070cf",
        FormItemTypeName: FormTypes[9]
    }
    const noteText = {
        FormSectionId: "368cca4d-3f8e-415a-8d8d-2c1ddf299ea8",
        SectionItemId: "5775af09-79b3-4df0-9a25-23cdd5e88eac",
        FormItemType: FormTypes['Note Text'],
        BankItemId: "d9a7a5fe-002e-4a81-ab8f-864a152642ea",
        FormBankItem: null,
        FormBankItemPromptTexts: [],
        IsRequired: false,
        MultiSelectAllow: false,
        IsVisible: true,
        SequenceNumber: 3,
        BankItemDemographicId: null,
        FormBankItemDemographic: null,
        FormBankItemEmergencyContact: null,
        FormItemTextField: null,
        ItemOptions: [],
        ItemPromptTextsOptions: [],
        DataTag: "AAAAAAAh8s0=",
        UserModified: "a162c864-8f50-4e84-8942-7194bc8070cf",
        DateModified: "2023-03-06T11:10:37.4066032",
        FormItemTypeName: FormTypes[11]
    }
    const multipleChoice = {
        FormSectionId: "368cca4d-3f8e-415a-8d8d-2c1ddf299ea8",
        SectionItemId: "a25b641e-fd5d-47f6-9e84-1205e4401d4a",
        FormItemType: FormTypes['Multiple Choice'],
        BankItemId: "098d8072-b325-4a90-8daa-99d0f4f84398",
        FormBankItem: null,
        FormBankItemPromptTexts: [],
        IsRequired: false,
        MultiSelectAllow: false,
        IsVisible: true,
        SequenceNumber: 4,
        BankItemDemographicId: null,
        FormBankItemDemographic: null,
        FormBankItemEmergencyContact: null,
        FormItemTextField: null,
        ItemOptions: [],
        ItemPromptTextsOptions: [],
        DataTag: "AAAAAAAh8s0=",
        UserModified: "a162c864-8f50-4e84-8942-7194bc8070cf",
        DateModified: "2023-03-06T11:10:37.4066032",
        FormItemTypeName: FormTypes[3]
    }
    const linkTooth = {
        FormSectionId: "368cca4d-3f8e-415a-8d8d-2c1ddf299ea8",
        SectionItemId: "a25b641e-fd5d-47f6-9e84-1205e4401d4a",
        FormItemType: FormTypes['Link Tooth'],
        BankItemId: "098d8072-b325-4a90-8daa-99d0f4f84398",
        FormBankItem: null,
        FormBankItemPromptTexts: [],
        IsRequired: false,
        MultiSelectAllow: false,
        IsVisible: true,
        SequenceNumber: 5,
        BankItemDemographicId: null,
        FormBankItemDemographic: null,
        FormBankItemEmergencyContact: null,
        FormItemTextField: null,
        ItemOptions: [],
        ItemPromptTextsOptions: [],
        DataTag: "AAAAAAAh8s0=",
        UserModified: "a162c864-8f50-4e84-8942-7194bc8070cf",
        DateModified: "2023-03-06T11:10:37.4066032",
        FormItemTypeName: FormTypes[10]
    }

    const commentEssay = {}
    const emergencyContact = {}
    const demographicQuestion = {}
    const dateofCompletion = {}
    const signatureBox = {}

    const formSection: FormSection = {
        SequenceNumber: 1, FormSectionItems: [yesNo, AdLib, noteText, multipleChoice, linkTooth, commentEssay, emergencyContact, demographicQuestion, dateofCompletion, signatureBox
        ]
    }

    let noteTemplateMock = {
        getData: () => {
            return {
                subscribe: (res) => {
                    res(tempCustomerFormData)
                }
            }
        },
        setData: (tempData) => { return tempData },
        onUndo: jasmine.createSpy(),
        undoStack: ['moving_section', 'adding_section', 'deleting_section', 'value_changed', 'copying_section', 'adding_title'],
        getUndo: () => {
            return {
                subscribe: (res) => {
                    res(true)
                }
            }
        },
        setUndo: () => { return },
        resetCrudForm: jasmine.createSpy().and.returnValue({}),
        invokeEvent : new BehaviorSubject<string>(null),
        setChildForms: () => { return },
        deleteSections: () => { return },
    };

    let service: NoteTemplatesHelperService;
    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [SectionItemCrudComponent, SectionCrudComponent, NoteTemplatesComponent, OrderByPipe],
            imports: [TranslateModule.forRoot(), FormsModule, ReactiveFormsModule],
            providers: [
                { provide: 'ModalFactory', useValue: mockModalFactoryService },
                { provide: '$location', useValue: mockLocation },
                { provide: '$injector', useValue: mockInjector },
                { provide: 'toastrFactory', useValue: mockToastrFactory },
                { provide: 'patSecurityService', useValue: mockPatSecurityService },
                { provide: 'AuthZService', useValue: mockAuthZ },
                { provide: 'localize', useValue: mockLocalizeService },
                { provide: 'StaticData', useValue: mockStaticData },
                { provide: NoteTemplatesHttpService, useValue: noteTemplatesHttpService },
                { provide: NoteTemplatesHelperService, useValue: noteTemplateMock },
                { provide: '_elementRef', useValue: ElementRef },
                { provide: 'changeDetectorRef', useValue: ChangeDetectorRef },
                SectionCrudComponent, NoteTemplatesComponent, FormBuilder, YesNoTrueFalseComponent, MultipleChoiceComponent, LinkToothComponent, CustomTextFieldComponent
            ],

        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(SectionItemCrudComponent);
        component = fixture.componentInstance;
        let tempParentForm: FormGroup = new FormGroup({
            inpTemplateName: new FormControl(""),
            slctTemplateCategory: new FormControl(""),
            questionYesNoTrueFalseFormArray_0_1: new FormArray([new FormGroup({
                inpTemplateName: new FormControl(""),
                slctTemplateCategory: new FormControl("")
            })]),
            questionAdlibFormArray_0_0: new FormArray([new FormGroup({
                inpTemplateName: new FormControl(""),
                slctTemplateCategory: new FormControl("")
            })]),
            sectionHeaderFormArray: new FormGroup({})
        });
        component.parentForm = tempParentForm;
        component.sectionItem = formSectionItem;
        component.customForm = tempCustomerFormData;
        component.sectionIndex = 0;
        service = TestBed.get(NoteTemplatesHelperService);
        service.setData(tempCustomerFormData);
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    describe('ngOnInit -> ', () => {
        it('should call ngOnInit', () => {
            component.customForm = tempCustomerFormData;
            const spy = component.ngOnInit = jasmine.createSpy();
            component.ngOnInit();
            expect(spy).toHaveBeenCalled();
        });

        it('should call getFormItemName with ngOnInit', () => {
            const spy = component.getFormItemName = jasmine.createSpy();
            component.ngOnInit();
            expect(spy).toHaveBeenCalled();
        });
    });

    describe('getFormItemName -> ', () => {
        it('should call getFormItemName ', () => {
            component.section = {
                SequenceNumber: 1, FormSectionItems: [multipleChoice, AdLib]
            }
            component.section.FormSectionItems[0].FormItemType = 2;
            component.section.FormSectionItems[0].FormItemType = 8;
            component.ngOnInit();
            expect(component.section.FormSectionItems[0].FormItemTypeName).toEqual("Yes/No True/False");
        });
    });

    describe('cancelDeleteSectionItemConfirmBox -> ', () => {
        it('should call cancelDeleteSectionItemConfirmBox', () => {
            component.cancelDeleteSectionItemConfirmBox();
            expect(component.deleteSectionItemIndex).toBe(-1);
        });
    });

    describe('moveSectionItem ->', () => {
        it('should update section history with moved section items', () => {
            component.movedSectionItems = [[{ FormSectionItems: [{}, {}] },], []];
            component.section = {
                SequenceNumber: 1, FormSectionItems: [yesNo, AdLib]
            }
            const originIndex = 0;
            const destinationIndex = 2;
            noteTemplateMock.undoStack = ['moving_section'];
            component.moveSectionItem(originIndex, destinationIndex);
            expect(component.movedSectionItems.length).toEqual(2);
        });
    });

    describe('moveSectionItemUp -> ', () => {

        it('should move up yes/no or true/false question', () => {
            component.sectionIndex = 0;
            component.section = {
                SequenceNumber: 1, FormSectionItems: [AdLib, yesNo]
            }
            let tempParentForm: FormGroup = new FormGroup({
                questionAdlibFormArray_0_0: new FormArray([new FormGroup({
                    inpTemplateName: new FormControl(""),
                })]),
                questionYesNoTrueFalseFormArray_0_1: new FormArray([new FormGroup({
                    inpTemplateName: new FormControl(""),
                })]),
            });

            component.sectionItem = formSectionItem;
            component.sectionItem.FormItemType = FormTypes['Yes/No True/False'];
            component.parentForm = tempParentForm;
            const el = fixture.nativeElement.querySelector('div');
            el.id = "questionYesNoTrueFalseText0_1"
            fixture.detectChanges();
            component.moveSectionItemUp(0, 0);
            expect(component.section.FormSectionItems[1]).toBe(yesNo);
        });

        it('should move up Link Tooth question', () => {
            component.sectionIndex = 0;
            component.section = {
                SequenceNumber: 1, FormSectionItems: [AdLib, linkTooth]
            }
            let tempParentForm: FormGroup = new FormGroup({
                questionAdlibFormArray_0_0: new FormArray([new FormGroup({
                    inpTemplateName: new FormControl("")
                })]),
                frmToothLinkFormArray_0_1: new FormArray([new FormGroup({
                    inpTemplateName: new FormControl("")
                })]),
            });

            component.sectionItem = formSectionItem;
            component.sectionItem.FormItemType = FormTypes['Link Tooth'];
            component.parentForm = tempParentForm;
            const el = fixture.nativeElement.querySelector('div');
            el.id = "questionLinkToothText0_1"
            fixture.detectChanges();
            component.moveSectionItemUp(0, 0);
            expect(component.section.FormSectionItems[1]).toBe(linkTooth);
        });

        it('should move up multipleChoice question', () => {
            component.sectionIndex = 0;
            component.section = {
                SequenceNumber: 1, FormSectionItems: [AdLib, multipleChoice]
            }
            let tempParentForm: FormGroup = new FormGroup({
                questionAdlibFormArray_0_0: new FormArray([new FormGroup({
                    inpTemplateName: new FormControl(""),
                })]),
                questionMultipleChoiceFormArray_0_1: new FormArray([new FormGroup({
                    inpTemplateName: new FormControl(""),
                })]),
            });

            component.sectionItem = formSectionItem;
            component.sectionItem.FormItemType = FormTypes['Multiple Choice'];
            component.parentForm = tempParentForm;
            const el = fixture.nativeElement.querySelector('div');
            el.id = "questionYesNoTrueFalseText0_1"
            fixture.detectChanges();
            component.moveSectionItemUp(0, 0);
            expect(component.section.FormSectionItems[1]).toBe(multipleChoice);
        });

        it('should move up noteText question', () => {
            component.sectionIndex = 0;
            component.section = {
                SequenceNumber: 1, FormSectionItems: [AdLib, noteText
                ]
            }
            let tempParentForm: FormGroup = new FormGroup({
                questionAdlibFormArray_0_0: new FormArray([new FormGroup({
                    inpTemplateName: new FormControl("")
                })]),
                frmQuestionTextFieldFormArray_0_1: new FormArray([new FormGroup({
                    inpTemplateName: new FormControl("")
                })]),

            });

            component.sectionItem = formSectionItem;
            component.sectionItem.FormItemType = FormTypes['Note Text'];
            component.parentForm = tempParentForm;
            const el = fixture.nativeElement.querySelector('div');
            el.id = "questionTextField0_1"
            fixture.detectChanges();
            component.moveSectionItemUp(0, 0);
            expect(component.section.FormSectionItems[1]).toBe(noteText);
        });

        it('should move up AdLib question', () => {
            component.sectionIndex = 0;
            component.section = {
                SequenceNumber: 1, FormSectionItems: [multipleChoice, AdLib]
            }
            let tempParentForm: FormGroup = new FormGroup({

                questionMultipleChoiceFormArray_0_0: new FormArray([new FormGroup({
                    inpTemplateName: new FormControl("")
                })]),
                questionAdlibFormArray_0_1: new FormArray([new FormGroup({
                    inpTemplateName: new FormControl(""),
                })]),
            });

            component.sectionItem = formSectionItem;
            component.sectionItem.FormItemType = FormTypes['Ad-Lib'];
            component.parentForm = tempParentForm;
            const el = fixture.nativeElement.querySelector('div');
            el.id = "questionAdlib1Text0_1"
            fixture.detectChanges();
            component.moveSectionItemUp(0, 0);
            expect(component.section.FormSectionItems[1]).toBe(AdLib);
        });

        it('should move Comment-Essay question ', () => {
            component.sectionIndex = 0;
            component.section = {
                SequenceNumber: 1, FormSectionItems: [commentEssay, AdLib
                ]
            }
            let tempParentForm: FormGroup = new FormGroup({
                questionAdlibFormArray_0_1: new FormArray([new FormGroup({
                    inpTemplateName: new FormControl("")
                })]),
                frmQuestionCommentEssayTextFormArray_0_0: new FormArray([new FormGroup({
                    inpTemplateName: new FormControl("")
                })]),

            });
            component.parentForm = tempParentForm;
            component.sectionItem = formSectionItem;
            component.sectionItem.FormItemType = FormTypes['Comment/Essay'];
            const el = fixture.nativeElement.querySelector('div');
            el.id = "questionCommentEssayText"
            component.moveSectionItemUp(2, 1);
            fixture.detectChanges();
            expect(component.section.FormSectionItems[1]).toBe(commentEssay);
        });

        it('should move Emergency Contact question ', () => {
            component.sectionIndex = 0;
            component.section = {
                SequenceNumber: 1, FormSectionItems: [emergencyContact, AdLib
                ]
            }
            let tempParentForm: FormGroup = new FormGroup({
                questionAdlibFormArray_0_1: new FormArray([new FormGroup({
                    inpTemplateName: new FormControl("")
                })]),
                frmQuestionEmergencyContactNameCKBFormArray_0_0: new FormArray([new FormGroup({
                    inpTemplateName: new FormControl("")
                })]),

            });
            component.parentForm = tempParentForm;
            component.sectionItem = formSectionItem;
            component.sectionItem.FormItemType = FormTypes['Emergency Contact'];
            const el = fixture.nativeElement.querySelector('div');
            el.id = "questionEmergencyContactNameCKB"
            component.moveSectionItemUp(2, 1);
            fixture.detectChanges();
            expect(component.section.FormSectionItems[1]).toBe(emergencyContact);
        });

        it('should move Demographic Question ', () => {
            component.sectionIndex = 0;
            component.section = {
                SequenceNumber: 1, FormSectionItems: [demographicQuestion, AdLib
                ]
            }
            let tempParentForm: FormGroup = new FormGroup({
                questionAdlibFormArray_0_1: new FormArray([new FormGroup({
                    inpTemplateName: new FormControl("")
                })]),
                frmQuestionDemographicPreferredNameCKBFormArray_0_0: new FormArray([new FormGroup({
                    inpTemplateName: new FormControl("")
                })]),

            });
            component.parentForm = tempParentForm;
            component.sectionItem = formSectionItem;
            component.sectionItem.FormItemType = FormTypes['Demographic Question'];
            const el = fixture.nativeElement.querySelector('div');
            el.id = "questionDemographicPreferredNameCKB"
            component.moveSectionItemUp(2, 1);
            fixture.detectChanges();
            expect(component.section.FormSectionItems[1]).toBe(demographicQuestion);
        });

        it('should move Date of Completion question ', () => {
            component.sectionIndex = 0;
            component.section = {
                SequenceNumber: 1, FormSectionItems: [dateofCompletion, AdLib
                ]
            }
            let tempParentForm: FormGroup = new FormGroup({
                questionAdlibFormArray_0_1: new FormArray([new FormGroup({
                    inpTemplateName: new FormControl("")
                })]),
                frmLblDateOfCompletionFormArray_0_0: new FormArray([new FormGroup({
                    inpTemplateName: new FormControl("")
                })]),

            });
            component.parentForm = tempParentForm;
            component.sectionItem = formSectionItem;
            component.sectionItem.FormItemType = FormTypes['Date of Completion'];
            const el = fixture.nativeElement.querySelector('div');
            el.id = "lblDateOfCompletion"
            component.moveSectionItemUp(2, 1);
            fixture.detectChanges();
            expect(component.section.FormSectionItems[1]).toBe(dateofCompletion);
        });

        it('should move Signature Box Question ', () => {
            component.sectionIndex = 0;
            component.section = {
                SequenceNumber: 1, FormSectionItems: [signatureBox, AdLib
                ]
            }
            let tempParentForm: FormGroup = new FormGroup({
                questionAdlibFormArray_0_1: new FormArray([new FormGroup({
                    inpTemplateName: new FormControl("")
                })]),
                frmQuestionSignatureBoxCKBFormArray_0_0: new FormArray([new FormGroup({
                    inpTemplateName: new FormControl("")
                })]),

            });
            component.parentForm = tempParentForm;
            component.sectionItem = formSectionItem;
            component.sectionItem.FormItemType = FormTypes['Signature Box'];
            const el = fixture.nativeElement.querySelector('div');
            el.id = "questionSignatureBoxCKB"
            component.moveSectionItemUp(2, 1);
            fixture.detectChanges();
            expect(component.section.FormSectionItems[1]).toBe(signatureBox);
        });

    });

    describe('moveSectionItemDown -> ', () => {

        it('should move down yes/no or true/false question', () => {
            component.sectionIndex = 0;
            component.section = {
                SequenceNumber: 1, FormSectionItems: [AdLib, yesNo]
            }
            let tempParentForm: FormGroup = new FormGroup({
                questionAdlibFormArray_0_0: new FormArray([new FormGroup({
                    inpTemplateName: new FormControl("")
                })]),
                questionYesNoTrueFalseFormArray_0_1: new FormArray([new FormGroup({
                    inpTemplateName: new FormControl("")
                })]),
            });
            component.sectionItem = formSectionItem;
            component.sectionItem.FormItemType = FormTypes['Yes/No True/False'];
            component.parentForm = tempParentForm;
            const el = fixture.nativeElement.querySelector('div');
            el.id = "questionYesNoTrueFalseText0_1"
            fixture.detectChanges();
            component.moveSectionItemDown(0, 0);
            expect(component.section.FormSectionItems[0]).toBe(yesNo);
        });

        it('should move down Link Tooth question', () => {
            component.sectionIndex = 0;
            component.section = {
                SequenceNumber: 1, FormSectionItems: [AdLib, linkTooth
                ]
            }
            let tempParentForm: FormGroup = new FormGroup({
                questionAdlibFormArray_0_0: new FormArray([new FormGroup({
                    inpTemplateName: new FormControl("")
                })]),
                frmToothLinkFormArray_0_1: new FormArray([new FormGroup({
                    inpTemplateName: new FormControl("")
                })]),
            });
            component.sectionItem = formSectionItem;
            component.sectionItem.FormItemType = FormTypes['Link Tooth'];
            component.parentForm = tempParentForm;
            const el = fixture.nativeElement.querySelector('div');
            el.id = "questionLinkToothText0_1"
            fixture.detectChanges();
            component.moveSectionItemDown(0, 0);
            expect(component.section.FormSectionItems[0]).toBe(linkTooth);
        });

        it('should move down noteText question', () => {
            component.sectionIndex = 0;
            component.section = {
                SequenceNumber: 1, FormSectionItems: [AdLib, noteText
                ]
            }
            let tempParentForm: FormGroup = new FormGroup({
                questionAdlibFormArray_0_0: new FormArray([new FormGroup({
                    inpTemplateName: new FormControl("")
                })]),
                frmQuestionTextFieldFormArray_0_1: new FormArray([new FormGroup({
                    inpTemplateName: new FormControl("")
                })]),

            });
            component.parentForm = tempParentForm;
            component.sectionItem = formSectionItem;
            component.sectionItem.FormItemType = FormTypes['Note Text'];
            const el = fixture.nativeElement.querySelector('div');
            el.id = "questionTextField0_1"
            fixture.detectChanges();
            component.moveSectionItemDown(0, 0);
            expect(component.section.FormSectionItems[0]).toBe(noteText);
        });

        it('should move down AdLib question', () => {
            component.sectionIndex = 0;
            component.section = {
                SequenceNumber: 1, FormSectionItems: [multipleChoice, AdLib]
            }
            let tempParentForm: FormGroup = new FormGroup({

                questionMultipleChoiceFormArray_0_0: new FormArray([new FormGroup({
                    inpTemplateName: new FormControl("")
                })]),
                questionAdlibFormArray_0_1: new FormArray([new FormGroup({
                    inpTemplateName: new FormControl(""),
                })]),
            });
            component.sectionItem = formSectionItem;
            component.sectionItem.FormItemType = FormTypes['Ad-Lib'];;
            component.parentForm = tempParentForm;
            const el = fixture.nativeElement.querySelector('div');
            el.id = "questionAdlib1Text0_1"
            fixture.detectChanges();
            component.moveSectionItemDown(0, 0);
            expect(component.section.FormSectionItems[0]).toBe(AdLib);
        });

        it('should move down multipleChoice question', () => {
            component.sectionIndex = 0;
            component.section = {
                SequenceNumber: 1, FormSectionItems: [AdLib, multipleChoice]
            }
            let tempParentForm: FormGroup = new FormGroup({
                questionAdlibFormArray_0_0: new FormArray([new FormGroup({
                    inpTemplateName: new FormControl("")
                })]),
                questionMultipleChoiceFormArray_0_1: new FormArray([new FormGroup({
                    inpTemplateName: new FormControl("")
                })]),
            });
            component.sectionItem = formSectionItem;
            component.sectionItem.FormItemType = FormTypes['Multiple Choice'];
            component.parentForm = tempParentForm;
            const el = fixture.nativeElement.querySelector('div');
            el.id = "questionYesNoTrueFalseText0_1"
            fixture.detectChanges();
            component.moveSectionItemDown(0, 0);
            expect(component.section.FormSectionItems[0]).toBe(multipleChoice);
        });

        it('should move down Comment-Essay question ', () => {
            component.section = {
                SequenceNumber: 1, FormSectionItems: [multipleChoice, commentEssay
                ]
            }
            let tempParentForm: FormGroup = new FormGroup({
                questionMultipleChoiceFormArray_0_0: new FormArray([new FormGroup({
                    inpTemplateName: new FormControl("")
                })]),
                frmQuestionCommentEssayTextFormArray_0_1: new FormArray([new FormGroup({
                    inpTemplateName: new FormControl("")
                })]),

            });
            component.parentForm = tempParentForm;
            component.sectionItem = formSectionItem
            component.sectionItem.FormItemType = FormTypes['Comment/Essay'];
            const el = fixture.nativeElement.querySelector('div');
            el.id = "questionCommentEssayText"
            component.moveSectionItemDown(2, 0);
            fixture.detectChanges();
            expect(component.section.FormSectionItems[0]).toBe(commentEssay);
        });

        it('should move down Emergency Contact question ', () => {
            component.section = {
                SequenceNumber: 1, FormSectionItems: [AdLib, emergencyContact
                ]
            }
            let tempParentForm: FormGroup = new FormGroup({
                questionAdlibFormArray_0_0: new FormArray([new FormGroup({
                    inpTemplateName: new FormControl("")
                })]),
                frmQuestionEmergencyContactNameCKBFormArray_0_1: new FormArray([new FormGroup({
                    inpTemplateName: new FormControl("")
                })]),

            });
            component.parentForm = tempParentForm;
            component.sectionItem = formSectionItem;
            component.sectionItem.FormItemType = FormTypes['Emergency Contact'];
            const el = fixture.nativeElement.querySelector('div');
            el.id = "questionEmergencyContactNameCKB"
            component.moveSectionItemDown(2, 0);
            fixture.detectChanges();
            expect(component.section.FormSectionItems[0]).toBe(emergencyContact);
        });

        it('should move down Demographic Question question ', () => {
            component.section = {
                SequenceNumber: 1, FormSectionItems: [AdLib, demographicQuestion
                ]
            }
            let tempParentForm: FormGroup = new FormGroup({
                questionAdlibFormArray_0_0: new FormArray([new FormGroup({
                    inpTemplateName: new FormControl("")
                })]),
                frmQuestionDemographicPreferredNameCKBFormArray_0_1: new FormArray([new FormGroup({
                    inpTemplateName: new FormControl("")
                })]),

            });
            component.parentForm = tempParentForm;
            component.sectionItem = formSectionItem;
            component.sectionItem.FormItemType = FormTypes['Demographic Question'];
            const el = fixture.nativeElement.querySelector('div');
            el.id = "questionDemographicPreferredNameCKB"
            component.moveSectionItemDown(2, 0);
            fixture.detectChanges();
            expect(component.section.FormSectionItems[0]).toBe(demographicQuestion);
        });

        it('should move down Date of Completion question ', () => {
            component.section = {
                SequenceNumber: 1, FormSectionItems: [AdLib, dateofCompletion
                ]
            }
            let tempParentForm: FormGroup = new FormGroup({
                questionAdlibFormArray_0_0: new FormArray([new FormGroup({
                    inpTemplateName: new FormControl("")
                })]),
                frmLblDateOfCompletionFormArray_0_1: new FormArray([new FormGroup({
                    inpTemplateName: new FormControl("")
                })]),

            });
            component.parentForm = tempParentForm;
            component.sectionItem = formSectionItem;
            component.sectionItem.FormItemType = FormTypes['Date of Completion'];
            const el = fixture.nativeElement.querySelector('div');
            el.id = "lblDateOfCompletion"
            component.moveSectionItemDown(2, 0);
            fixture.detectChanges();
            expect(component.section.FormSectionItems[0]).toBe(dateofCompletion);
        });

        it('should move down Signature Box question ', () => {
            component.section = {
                SequenceNumber: 1, FormSectionItems: [multipleChoice, signatureBox
                ]
            }
            let tempParentForm: FormGroup = new FormGroup({
                questionMultipleChoiceFormArray_0_0: new FormArray([new FormGroup({
                    inpTemplateName: new FormControl("")
                })]),
                frmQuestionSignatureBoxCKBFormArray_0_1: new FormArray([new FormGroup({
                    inpTemplateName: new FormControl("")
                })]),

            });
            component.parentForm = tempParentForm;
            component.sectionItem = formSectionItem;
            component.sectionItem.FormItemType = FormTypes['Signature Box'];
            const el = fixture.nativeElement.querySelector('div');
            el.id = "questionSignatureBoxCKB"
            component.moveSectionItemDown(2, 0);
            fixture.detectChanges();
            expect(component.section.FormSectionItems[0]).toBe(signatureBox);
        });

    });

    describe('deleteSectionItem -> ', () => {
        it('should call deleteSectionItem  ', () => {
            component.section = formSection;
            component.deleteSectionItemIndex = 0;
            component.deleteSectionItem();
            expect(component.deleteSectionItemIndex).toBe(null);
        });
    });

    describe('resequenceFormItems -> ', () => {
        it('should call resequenceFormItems ', () => {
            component.section = formSection;
            component.resequenceFormItems(component.section.FormSectionItems);
            expect(component.section.FormSectionItems[0].SequenceNumber).toBe(0);
        });
    });

    describe('confirmDeleteSectionItem -> ', () => {
        it('should call confirmDeleteSectionItem ', () => {
            component.section = formSection;
            const spy = component.resequenceFormItems = jasmine.createSpy();
            component.confirmDeleteSectionItem(1);
            expect(spy).toHaveBeenCalled();
            expect(component.deleteSectionItemIndex).toBe(1);
        });
    });

    describe('undo ->', () => {

        it('should undo adding a section', () => {
            component.noteTemplatesHelperService.undoStack = ["adding_section"];
            component.section = {
                FormSectionItems: [{ FormSectionId: "2", FormBankItem: { ItemText: 'sample' } }]
            };
            spyOn(component, 'removeSectionItems').and.callThrough();
            component.undo();
            expect(component.removeSectionItems).toHaveBeenCalled();
            expect(component.section.FormSectionItems.length).toBe(0);
            expect(component.noteTemplatesHelperService.undoStack.length).toBe(0);
        });

        it("should undo deleting a section", () => {
            component.deletedSectionItem = [{ index: 1, item: {} }]; // Add some item to be restored  
            component.section = {
                FormSectionItems: [{}, {}] // Add some other items to the section
            };
            spyOn(component.noteTemplatesHelperService, "deleteSections");
            component.noteTemplatesHelperService.undoStack = ["deleting_section"];
            component.undo();
            expect(component.section.FormSectionItems.length).toBe(3);
            expect(component.noteTemplatesHelperService.deleteSections).toHaveBeenCalled();
            expect(component.noteTemplatesHelperService.undoStack.length).toBe(0);
        });

        it("should undo moving a section", () => {
            component.movedSectionItems = [[{ FormSectionItems: [{}, {}] },], []];
            component.section = {
                FormSectionItems: [{}, {}, {}] // Add some items to the section
            };
            spyOn(component.changeDetectorRef, "detectChanges");
            component.noteTemplatesHelperService.undoStack = ["moving_section"];
            component.undo();
            expect(component.changeDetectorRef.detectChanges).toHaveBeenCalled();
            expect(component.noteTemplatesHelperService.undoStack.length).toBe(0);
        });

        it("should undo copying a section", () => {
            component.copiedSectionItem = [{}]; // Add some item to be removed
            component.noteTemplatesHelperService.undoStack = ["copying_section"];
            component.undo();
            expect(component.copiedSectionItem.length).toBe(0);
            expect(component.noteTemplatesHelperService.undoStack.length).toBe(0);
        });

        it("should undo a change in a section item's value", () => {
            component.formDataArray = [{ formData: {}, sectionItemIndex: 1 }];
            component.section = {
                FormSectionItems: [{}, {}]
            };
            component.noteTemplatesHelperService.undoStack = ["value_changed"];
            component.undo();
            expect(component.formDataArray.length).toBe(0); // Check that the formDataArray has been cleared
            expect(component.noteTemplatesHelperService.undoStack.length).toBe(0);
        });

    });

    describe('copySectionItem -> ', () => {
        it('should call copySectionItem', () => {
            component.customForm = {
                SectionCopyValidationFlag: -1,
                FormSections: [{ FormSectionItems: [{ FormItemType: 2 }, { FormItemType: 2 }, { FormItemType: 5 }] }]
            };
            component.copySectionItem(2, 2);
            component.noteTemplatesHelperService.undoStack = ["copying_section"];
            expect(component.customForm.SectionCopyValidationFlag).toBe(2);
        });

        it('copySectionItem should copy a section item, when the copied section item is yesno-true-false and is valid', () => {
            component.customForm = {
                SectionCopyValidationFlag: -1,
                FormSections: [{ FormSectionItems: [{ FormItemType: 3 }, { FormItemType: 2 }] }]
            };
            component.section = component.customForm.FormSections[0];
            component.sectionItem = component.section.FormSectionItems[0];
            spyOn(component, 'isSectionItemValid').and.returnValue(true);
            component.copySectionItem(1, 1);
            expect(component.customForm.SectionCopyValidationFlag).toBe(1);
            expect(component.isSectionItemValid).toHaveBeenCalled();
            expect(component.customForm.FormSections[0].FormSectionItems.length).toBe(3);
        });

        it('copySectionItem should copy a section item, when the copied section item is multiple choice and is valid', () => {
            component.customForm = {
                SectionCopyValidationFlag: -1,
                FormSections: [{ FormSectionItems: [{ FormItemType: 3 }, { FormItemType: 3 }] }]
            };
            component.section = component.customForm.FormSections[0];
            component.sectionItem = component.section.FormSectionItems[0];
            spyOn(component, 'isSectionItemValid').and.returnValue(true);
            component.copySectionItem(1, 1);
            expect(component.customForm.SectionCopyValidationFlag).toBe(1);
            expect(component.isSectionItemValid).toHaveBeenCalled();
            expect(component.customForm.FormSections[0].FormSectionItems.length).toBe(3);
        });

        it('copySectionItem should copy a section item, when the copied section item is comment-essay and is valid', () => {
            component.customForm = {
                SectionCopyValidationFlag: -1,
                FormSections: [{ FormSectionItems: [{ FormItemType: 3 }, { FormItemType: 7 }] }]
            };

            component.section = component.customForm.FormSections[0];
            component.sectionItem = component.section.FormSectionItems[0];
            spyOn(component, 'isSectionItemValid').and.returnValue(true);
            component.copySectionItem(1, 1);
            expect(component.customForm.SectionCopyValidationFlag).toBe(1);
            expect(component.isSectionItemValid).toHaveBeenCalled();
            expect(component.customForm.FormSections[0].FormSectionItems.length).toBe(3);
        });

        it('copySectionItem should copy a section item, when the copied section item is other than yesno-truefalse,multiple choice,comment-essay and is valid', () => {
            component.customForm = {
                SectionCopyValidationFlag: -1,
                FormSections: [{ FormSectionItems: [{ FormItemType: 6 }, { FormItemType: 3 }] }]
            };
            component.section = component.customForm.FormSections[0];
            component.sectionItem = component.section.FormSectionItems[0];
            spyOn(component, 'isSectionItemValid').and.returnValue(true);
            component.copySectionItem(1, 1);
            expect(component.customForm.SectionCopyValidationFlag).toBe(1);
            expect(component.isSectionItemValid).toHaveBeenCalled();
            expect(component.customForm.FormSections[0].FormSectionItems.length).toBe(3);
        });

        it('copySectionItem should not copy a section item, when the copied section item is invalid', () => {
            component.customForm = {
                SectionCopyValidationFlag: -1,
                FormSections: [{ FormSectionItems: [{ FormItemType: 6 }, { FormItemType: 3 }] }]
            };
            component.section = component.customForm.FormSections[0];
            component.sectionItem = component.section.FormSectionItems[0];
            spyOn(component, 'isSectionItemValid').and.returnValue(true);
            component.copySectionItem(1, 1);
            expect(component.customForm.SectionCopyValidationFlag).toBe(1);
            expect(component.isSectionItemValid).toHaveBeenCalled();
        });

        it('copySectionItem should copy a section item, when the copied section item is Emergency Contact and is valid', () => {
            component.customForm = {
                SectionCopyValidationFlag: -1,
                FormSections: [{ FormSectionItems: [{ FormItemType: 5 }, { FormItemType: 6 }] }]
            };
            component.section = component.customForm.FormSections[0];
            component.sectionItem = component.section.FormSectionItems[0];
            spyOn(component, 'isSectionItemValid').and.returnValue(true);
            component.copySectionItem(1, 1);
            expect(component.customForm.SectionCopyValidationFlag).toBe(1);
            expect(component.isSectionItemValid).toHaveBeenCalled();
            expect(component.customForm.FormSections[0].FormSectionItems.length).toBe(3);
        });

        it('copySectionItem should copy a section item, when the copied section item is Demographic Question and is valid', () => {
            component.customForm = {
                SectionCopyValidationFlag: -1,
                FormSections: [{ FormSectionItems: [{ FormItemType: 6 }, { FormItemType: 1 }] }]
            };
            component.section = component.customForm.FormSections[0];
            component.sectionItem = component.section.FormSectionItems[0];
            spyOn(component, 'isSectionItemValid').and.returnValue(true);
            component.copySectionItem(1, 1);
            expect(component.customForm.SectionCopyValidationFlag).toBe(1);
            expect(component.isSectionItemValid).toHaveBeenCalled();
            expect(component.customForm.FormSections[0].FormSectionItems.length).toBe(3);
        });

        it('copySectionItem should copy a section item, when the copied section item is Date of Completion and is valid', () => {
            component.customForm = {
                SectionCopyValidationFlag: -1,
                FormSections: [{ FormSectionItems: [{ FormItemType: 1 }, { FormItemType: 5 }] }]
            };
            component.section = component.customForm.FormSections[0];
            component.sectionItem = component.section.FormSectionItems[0];
            spyOn(component, 'isSectionItemValid').and.returnValue(true);
            component.copySectionItem(1, 1);
            expect(component.customForm.SectionCopyValidationFlag).toBe(1);
            expect(component.isSectionItemValid).toHaveBeenCalled();
            expect(component.customForm.FormSections[0].FormSectionItems.length).toBe(3);
        });

        it('copySectionItem should copy a section item, when the copied section item is Signature box and is valid', () => {
            component.customForm = {
                SectionCopyValidationFlag: -1,
                FormSections: [{ FormSectionItems: [{ FormItemType: 3 }, { FormItemType: 4 }] }]
            };
            component.section = component.customForm.FormSections[0];
            component.sectionItem = component.section.FormSectionItems[0];
            spyOn(component, 'isSectionItemValid').and.returnValue(true);
            component.copySectionItem(1, 1);
            expect(component.customForm.SectionCopyValidationFlag).toBe(1);
            expect(component.isSectionItemValid).toHaveBeenCalled();
            expect(component.customForm.FormSections[0].FormSectionItems.length).toBe(3);
        });

        it('copySectionItem should copy a section item, when the copied section item is Note Text and is valid', () => {
            component.customForm = {
                SectionCopyValidationFlag: -1,
                FormSections: [{ FormSectionItems: [{ FormItemType: 3 }, { FormItemType: 11 }] }]
            };
            component.section = component.customForm.FormSections[0];
            component.sectionItem = component.section.FormSectionItems[0];
            spyOn(component, 'isSectionItemValid').and.returnValue(true);
            component.copySectionItem(1, 1);
            expect(component.customForm.SectionCopyValidationFlag).toBe(1);
            expect(component.isSectionItemValid).toHaveBeenCalled();
            expect(component.customForm.FormSections[0].FormSectionItems.length).toBe(3);
        });

        it('copySectionItem should copy a section item, when the copied section item is Link tooth and is valid', () => {
            component.customForm = {
                SectionCopyValidationFlag: -1,
                FormSections: [{ FormSectionItems: [{ FormItemType: 9 }, { FormItemType: 10 }] }]
            };
            component.section = component.customForm.FormSections[0];
            component.sectionItem = component.section.FormSectionItems[0];
            spyOn(component, 'isSectionItemValid').and.returnValue(true);
            component.copySectionItem(1, 1);
            expect(component.customForm.SectionCopyValidationFlag).toBe(1);
            expect(component.isSectionItemValid).toHaveBeenCalled();
            expect(component.customForm.FormSections[0].FormSectionItems.length).toBe(3);
        });

        it('copySectionItem should copy a section item, when the copied section item is Ad-Lib and is valid', () => {
            component.customForm = {
                SectionCopyValidationFlag: -1,
                FormSections: [{ FormSectionItems: [{ FormItemType: 10 }, { FormItemType: 9 }] }]
            };
            component.section = component.customForm.FormSections[0];
            component.sectionItem = component.section.FormSectionItems[0];
            spyOn(component, 'isSectionItemValid').and.returnValue(true);
            component.copySectionItem(1, 1);
            expect(component.customForm.SectionCopyValidationFlag).toBe(1);
            expect(component.isSectionItemValid).toHaveBeenCalled();
            expect(component.customForm.FormSections[0].FormSectionItems.length).toBe(3);
        });

    });

    describe('isSectionItemValid -> ', () => {

        it('should check for formType Yes/No True/False', () => {
            formSectionItem.FormItemType = FormTypes['Yes/No True/False'];
            formSectionItem.FormItemType = 8;
            formSectionItem.FormBankItem.ItemText = "";
            component.sectionItem = formSectionItem;
            let result = component.isSectionItemValid();
            expect(result).toBe(false);
        });

        it('should check for formType Multiple Choice', () => {
            formSectionItem.FormItemType = FormTypes['Multiple Choice'];
            formSectionItem.FormBankItem.ItemText = "";
            component.sectionItem = formSectionItem;
            let result = component.isSectionItemValid();
            expect(result).toBe(false);
        });

        it('should check for formType Comment/Essay', () => {
            formSectionItem.FormItemType = FormTypes['Comment/Essay'];
            formSectionItem.FormBankItem.ItemText = "";
            component.sectionItem = formSectionItem;
            let result = component.isSectionItemValid();
            expect(result).toBe(false);
        });

        it('should check for formType Ad-Lib', () => {
            component.sectionItem = formSectionItem;
            formSectionItem.FormItemType = FormTypes['Ad-Lib'];
            formSectionItem.FormBankItem.ItemText = "";
            formSectionItem.FormBankItemPromptTexts = formSectionItem.FormBankItemPromptTexts;
            formSectionItem.FormBankItemPromptTexts[0].ItemText = "";
            let result = component.isSectionItemValid();
            expect(result).toBe(false);
        });

        it('should check for formType Link Tooth', () => {
            formSectionItem.FormItemType = FormTypes['Link Tooth'];
            formSectionItem.FormBankItem.ItemText = "";
            component.sectionItem = formSectionItem;
            let result = component.isSectionItemValid();
            expect(result).toBe(false);
        });

        it('should check for formType Note Text', () => {
            formSectionItem.FormItemType = FormTypes['Note Text'];
            formSectionItem.FormItemTextField.NoteText = "";
            component.sectionItem = formSectionItem;
            let result = component.isSectionItemValid();
            expect(result).toBe(false);
        });

    });

    describe('ngOnDestroy ->', () => {
        it('should close subscription on destroy', () => {
            component.parentFormSubscription = Object.assign(mockSubscription);
            component.ngOnDestroy();
            expect(component.parentFormSubscription.closed).toBe(true);
        });
    });

});
