import { ElementRef } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { CustomFormTemplate, FormTypes } from 'src/business-center/practice-settings/chart/note-templates/note-templates';
import { NoteTemplatesHelperService } from '../../../../../business-center/practice-settings/chart/note-templates/note-templates-helper.service';
import { MultipleChoiceComponent } from './multiple-choice.component';
import cloneDeep from 'lodash/cloneDeep';

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
    ItemOptions: [{
        SectionItemId: "686af729-a55d-47d5-9952-b0f47ff4d00d",
        SectionItemOptionId: "686af729-a55d-47d5-9952-b0f47ff4d00d",
        BankItemId: "a6773ae6-0b79-477e-bfb4-9c148994bf4a",
        BankItemOptionId: "a6773ae6-0b79-477e-bfb4-9c148994bf4a",
        IsSelected: true,
        IsVisible: true,
        SequenceNumber: 1,
        BankItemOption: {
            SectionItemId: "00000000-0000-0000-0000-000000000000",
            SectionItemOptionId: "00000000-0000-0000-0000-000000000000",
            BankItemId: "00000000-0000-0000-0000-000000000000",
            BankItemOptionId: "00000000-0000-0000-0000-000000000000",
            BankItemOption: {
                BankItemOptionId: "00000000-0000-0000-0000-000000000000",
                OptionIndex: 1,
                OptionText: "",
                OptionValue: "",
                IsSelected: true,
                IsVisible: true,
            },
            IsSelected: true,
            IsVisible: true,
            SequenceNumber: 0,
        },
        DataTag: "",
        UserModified: "",
        DateModified: ""
    }],
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
    ItemPromptTextsOptions: [[{
        BankItemId: "a6773ae6-0b79-477e-bfb4-9c148994bf4a",
        BankItemOption: {
            BankItemId: 'a6773ae6-0b79-477e-bfb4-9c148994bf4a', BankItemOptionId: '293ffcd8-6e38-4fc7-8a49-4c383d1ee5b4', OptionIndex: 1, OptionText: 'Responses 1', OptionValue: '', UserModified: "a162c864-8f50-4e84-8942-7194bc8070cf"
        },
        BankItemOptionId: "293ffcd8-6e38-4fc7-8a49-4c383d1ee5b4",
        DataTag: "AAAAAAAhpWU=",
        DateModified: "2023-02-08T12:55:15.7229439",
        IsSelected: true,
        IsVisible: true,
        SectionItemId: "cfc94739-53ec-427d-8a90-b8ae40ca2939",
        SectionItemOptionId: "21626080-4491-4d8c-b52c-9375043c5ef0",
        SequenceNumber: 1,
        UserModified: "a162c864-8f50-4e84-8942-7194bc8070cf"
    }, {
        BankItemId: "a6773ae6-0b79-477e-bfb4-9c148994bf4a",
        BankItemOption: {
            BankItemId: 'a6773ae6-0b79-477e-bfb4-9c148994bf4a', BankItemOptionId: '293ffcd8-6e38-4fc7-8a49-4c383d1ee5b4', OptionIndex: 2, OptionText: 'Responses 2', OptionValue: '', UserModified: "a162c864-8f50-4e84-8942-7194bc8070cf"
        },
        BankItemOptionId: "293ffcd8-6e38-4fc7-8a49-4c383d1ee5b4",
        DataTag: "AAAAAAAhpWU=",
        DateModified: "2023-02-08T12:55:15.7229439",
        IsSelected: true,
        IsVisible: true,
        SectionItemId: "cfc94739-53ec-427d-8a90-b8ae40ca2939",
        SectionItemOptionId: "21626080-4491-4d8c-b52c-9375043c5ef0",
        SequenceNumber: 2,
        UserModified: "a162c864-8f50-4e84-8942-7194bc8070cf"
    }]],
    MultiSelectAllow: false,
    SectionItemId: "686af729-a55d-47d5-9952-b0f47ff4d00d",
    SequenceNumber: 2,
    UserModified: "a162c864-8f50-4e84-8942-7194bc8070cf"
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
    FormSections: [{
        SequenceNumber: 1, FormSectionItems: [
            mockSectionItem
        ]
    }],
    TemplateMode: 1,
    FileAllocationId: 1,
    DataTag: "",
    UserModified: "",
    DateModified: "",
    IndexOfSectionInEditMode: -1,
    SectionValidationFlag: false,
    SectionCopyValidationFlag: 1
}

let frmNoteTemplate: FormGroup;

let noteTemplateMock = {
    getData: () => {
        return {
            subscribe: (res) => {
                res(mockSectionItem)
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
    resetCrudForm: jasmine.createSpy().and.returnValue({})
};

let mockSubscription = {
    unsubscribe: jasmine.createSpy(),
    _subscriptions: jasmine.createSpy(),
    closed: true,
    add: jasmine.createSpy(),
    remove: jasmine.createSpy(),
    _parentOrParents: []
};



describe('MultipleChoiceComponent', () => {
    let component: MultipleChoiceComponent;
    let fixture: ComponentFixture<MultipleChoiceComponent>;
    let service: NoteTemplatesHelperService;
    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [TranslateModule.forRoot(), FormsModule, ReactiveFormsModule],
            declarations: [MultipleChoiceComponent],
            providers: [
                { provide: '_elementRef', useValue: ElementRef },
                { provide: NoteTemplatesHelperService, useValue: noteTemplateMock  },
                FormBuilder
            ]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(MultipleChoiceComponent);
        component = fixture.componentInstance;
        frmNoteTemplate = component.fb.group({
            inpTemplateName: "templatename",
            slctTemplateCategory: "1",
            noteTempListFormArray: new FormArray([])
        });
        component.parentForm = frmNoteTemplate;
        component.sectionItem = mockSectionItem;
        component.sectionIndex = 0;
        component.sectionItemIndex = 0;
        fixture.detectChanges();
    });

    it('should create', () => {
        service = TestBed.get(NoteTemplatesHelperService);
        service.setData(tempCustomerFormData);
        expect(component).toBeTruthy();
    });

    describe('ngOnInit -->', () => {
        it('should call createForm method to create form', () => {
            component.createForm = jasmine.createSpy();
            component.ngOnInit();
            expect(component.createForm).toHaveBeenCalled();
        })
    })

    describe('createForm -->', () => {
        it('should call createForm with all fields & call setUpdatedFormValues', () => {
            component.setUpdatedFormValues = jasmine.createSpy();
            component.createForm();
            expect(component.questionMultipleChoiceForm).not.toBe(null);
        })

    })

    describe('setUpdatedFormValues -->', () => {
        it('should call setUpdatedFormValues on any form value changed', () => {
            spyOn(noteTemplateMock.undoStack, 'push');
            const formArg = { formData: cloneDeep(component.sectionItem), sectionItemIndex: component.sectionItemIndex };
            spyOn(component.formDataArray, 'push');
            component.questionMultipleChoiceForm.setValue({
                "questionMultipleChoiceText": "questionMultipleChoiceText",
                "questionMultipleChoiceCKB": true,
                "questionMultipleChoiceAllowMultipleAnsCKB": false,
                "questionMultipleChoiceOptionText0_0_0": "questionMultipleChoiceOptionText0_0_0"
            });
            component.questionMultipleChoiceForm.valueChanges.subscribe((changedvalue) => {
                expect(component.sectionItem.FormBankItem.ItemText).toEqual("questionMultipleChoiceText");
                expect(component.sectionItem.IsRequired).toEqual(true);
                expect(component.sectionItem.MultiSelectAllow).toEqual(false);
                expect(component.sectionItem.ItemOptions[0].BankItemOption.OptionText).toEqual("questionMultipleChoiceOptionText0_0_0");
            })
            expect(noteTemplateMock.undoStack.push).not.toHaveBeenCalledWith('value_changed');
            expect(component.formDataArray.push).not.toHaveBeenCalledWith(formArg);
            expect(component.manualDetectedChanges).toBe(false);
        })


        it('should create custom form subscription,', () => {
            component.questionMultipleChoiceForm.setValue({
                "questionMultipleChoiceText": "questionMultipleChoiceText",
                "questionMultipleChoiceCKB": true,
                "questionMultipleChoiceAllowMultipleAnsCKB": false,
                "questionMultipleChoiceOptionText0_0_0": "questionMultipleChoiceOptionText0_0_0"
            });
            expect(component.formSubscription).not.toBe(null);
        })

    })

    describe('confirmRemoveMultipleChoiceOption -->', () => {
        it('should call resequenceFormItems', () => {
            component.resequenceFormItems = jasmine.createSpy();
            component.confirmRemoveMultipleChoiceOption(null, 0);
            expect(component.confirmOptionRemoveIndex).toEqual(0);
            expect(component.resequenceFormItems).toHaveBeenCalled();
        })
    })

    describe('resequenceFormItems -->', () => {
        it('should resequenceFormItems as per section', () => {
            component.resequenceFormItems(component.sectionItem.ItemOptions);
            expect(component.sectionItem.ItemOptions[0].SequenceNumber).toBe(0);
        })
    })

    describe('addNewMultipleChoiceOption -->', () => {
        it('should add new control as per the index', () => {
            spyOn(noteTemplateMock.undoStack, 'push');
            const formArg = { formData: cloneDeep(component.sectionItem), sectionItemIndex: component.sectionItemIndex };
            spyOn(component.formDataArray, 'push');
            component.addNewMultipleChoiceOption(0, 0);
            expect(component.manualDetectedChanges).toBe(true);
            expect(component.sectionItem.ItemOptions.length).toBe(2);
            expect(noteTemplateMock.undoStack.push).toHaveBeenCalledWith('value_changed');
            expect(component.formDataArray.push).toHaveBeenCalledWith(formArg);
        })
    })

    describe('removeMultipleChoiceOption -->', () => {
        it('should remove control as per the index', () => {
            spyOn(noteTemplateMock.undoStack, 'push');
            const formArg = { formData: cloneDeep(component.sectionItem), sectionItemIndex: component.sectionItemIndex };
            spyOn(component.formDataArray, 'push');
            component.removeMultipleChoiceOption(0, 0);
            expect(component.manualDetectedChanges).toBe(true);
            expect(component.sectionItem.ItemOptions.length).toBe(1);
            expect(noteTemplateMock.undoStack.push).toHaveBeenCalledWith('value_changed');
            expect(component.formDataArray.push).toHaveBeenCalledWith(formArg);
        })
    })

    describe('cancelRemoveMultipleChoiceOption -->', () => {
        it('should call cancelRemoveMultipleChoiceOption and set confirmOptionRemoveIndex to be -1', () => {
            component.cancelRemoveMultipleChoiceOption();
            expect(component.confirmOptionRemoveIndex).toBe(-1);
        })
    })

    describe('ngOnDestroy -->', () => {
        it('should close subscription on destroy', () => {
            component.formSubscription = Object.assign(mockSubscription);
            component.ngOnDestroy();
            expect(component.formSubscription.closed).toBe(true);
        })
    })
});