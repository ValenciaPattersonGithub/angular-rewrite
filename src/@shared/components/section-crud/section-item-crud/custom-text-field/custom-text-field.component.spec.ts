import { ElementRef } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { CustomFormTemplate, FormTypes } from 'src/business-center/practice-settings/chart/note-templates/note-templates';
import { NoteTemplatesHelperService } from 'src/business-center/practice-settings/chart/note-templates/note-templates-helper.service';
import { CustomTextFieldComponent } from './custom-text-field.component';
import cloneDeep from 'lodash/cloneDeep';

let mockSectionItem = {
    BankItemDemographicId: null,
    BankItemId: null,
    DataTag: "AAAAAAAhpeQ=",
    DateModified: "2023-02-08T15:57:34.3266499",
    FormBankItem: null,
    FormItemTypeName: FormTypes[11],
    FormItemType: FormTypes['Note Text'],
    FormBankItemDemographic: null,
    FormBankItemEmergencyContact: null,
    FormItemTextField: {},
    FormSectionId: "01aef280-2cf5-4326-934e-ed43ee3849f7",
    IsRequired: false,
    IsVisible: true,
    ItemOptions: [],
    ItemPromptTextsOptions: [],
    MultiSelectAllow: false,
    SectionItemId: "686af729-a55d-47d5-9952-b0f47ff4d00d",
    SequenceNumber: 1,
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
        SequenceNumber: 1, FormSectionItems: [{
            BankItemDemographicId: null,
            BankItemId: null,
            DataTag: "AAAAAAAhpeQ=",
            DateModified: "2023-02-08T15:57:34.3266499",
            FormBankItem: null,
            FormBankItemDemographic: null,
            FormBankItemEmergencyContact: null,
            FormItemTextField: {},
            FormItemType: FormTypes['Note Text'],
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

let mockSubscription = {
    unsubscribe: jasmine.createSpy(),
    _subscriptions: jasmine.createSpy(),
    closed: true,
    add: jasmine.createSpy(),
    remove: jasmine.createSpy(),
    _parentOrParents: []
};

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
    resetCrudForm: jasmine.createSpy().and.returnValue({})
};

describe('CustomTextFieldComponent', () => {
    let component: CustomTextFieldComponent;
    let fixture: ComponentFixture<CustomTextFieldComponent>;
    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [CustomTextFieldComponent],
            imports: [TranslateModule.forRoot(), FormsModule, ReactiveFormsModule],
            providers: [
                { provide: NoteTemplatesHelperService, useValue: noteTemplateMock  },
                { provide: '_elementRef', useValue: ElementRef },
                FormBuilder
            ]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(CustomTextFieldComponent);
        component = fixture.componentInstance;
        frmNoteTemplate = component.fb.group({
            inpTemplateName: "templatename",
            slctTemplateCategory: "1",
            noteTempListFormArray: new FormArray([])
        });
        component.parentForm = frmNoteTemplate;
        component = fixture.componentInstance;
        component.sectionItem = mockSectionItem;
        component.sectionIndex = 0;
        component.sectionItemIndex = 0;
        fixture.detectChanges();
    });

    it('should create', () => {
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
        it('should call createForm with all fields', () => {
            component.createForm();
            expect(component.frmQuestionTextField).not.toBe(null);
        })
    })

    describe('setUpdatedFormValues -->', () => {
        it('should call setUpdatedFormValues on any form value changed', () => {
            spyOn(noteTemplateMock.undoStack, 'push');
            const formArg = { formData: cloneDeep(component.sectionItem), sectionItemIndex: component.sectionItemIndex };
            spyOn(component.formDataArray, 'push');
            component.frmQuestionTextField.setValue({ "questionTextFieldText": "NoteText" });
            component.setUpdatedFormValues();
            component.frmQuestionTextField.valueChanges.subscribe((changedvalue) => {
                expect(component.sectionItem.FormBankItem.ItemText).toEqual("NoteText");
            })
            expect(noteTemplateMock.undoStack.push).not.toHaveBeenCalledWith('value_changed');
            expect(component.formDataArray.push).not.toHaveBeenCalledWith(formArg);
        })
    })

    describe('ngOnDestroy -->', () => {
        it('should close subscription on destroy', () => {
            component.formValueSubscription = Object.assign(mockSubscription);
            component.ngOnDestroy();
            expect(component.formValueSubscription.closed).toBe(true);
        })
    })
});