import { ChangeDetectorRef, ElementRef, SimpleChanges } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { CustomFormTemplate } from 'src/business-center/practice-settings/chart/note-templates/note-templates';
import { NoteTemplatesHelperService } from 'src/business-center/practice-settings/chart/note-templates/note-templates-helper.service';
import { NoteTemplatesComponent } from '../../../../business-center/practice-settings/chart/note-templates/note-templates.component';
import { SectionCrudComponent } from '../section-crud.component';
import { SectionHeaderComponent } from './section-header.component';
import { NoteTemplatesHttpService } from 'src/@shared/providers/note-templates-http.service';

let localize;
let mockCustomFormsFactory = {
    ValidateFormSectionItem: jasmine.createSpy().and.returnValue(true)
};

let mockAuthZ = {}
let mockLocation = {}
let mockInjector = {}
let mockListHelper = {}
let noteTemplatesHttpService = {}

let mockLocalizeService = {
    getLocalizedString: () => 'triggering undo operation'
};

let mockToastrFactory = {
    success: jasmine.createSpy('toastrFactory.success'),
    error: jasmine.createSpy('toastrFactory.error')
};

const mockModalFactoryService = {
    WarningModal: jasmine.createSpy('ModalFactory.WarningModal')
        .and.callFake(() => {
            return {
                then() { return [] }
            };
        })
}

let mockPatSecurityService = {
    IsAuthorizedByAbbreviation: jasmine.createSpy('patSecurityService.IsAuthorizedByAbbreviation').and.returnValue(true),
    generateMessage: jasmine.createSpy('patSecurityService.generateMessage')
};

let changes: SimpleChanges = {
    section: {
        currentValue: { DataTag: "AAAAAAAeupg=", Title: 'AnglersDemo', FormSectionItems: [] },
        previousValue: null,
        firstChange: false,
        isFirstChange: () => { return false }
    }
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
}

let frmNoteTemplate: FormGroup;

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

let mockSubscription = {
    unsubscribe: jasmine.createSpy(),
    _subscriptions: jasmine.createSpy(),
    closed: true,
    add: jasmine.createSpy(),
    remove: jasmine.createSpy(),
    _parentOrParents: []
};

describe('SectionHeaderComponent', () => {
    let component: SectionHeaderComponent;
    let fixture: ComponentFixture<SectionHeaderComponent>;
    let service: NoteTemplatesHelperService;
    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [TranslateModule.forRoot(), FormsModule, ReactiveFormsModule],
            declarations: [SectionHeaderComponent, SectionCrudComponent, NoteTemplatesComponent],
            providers: [
                { provide: 'CustomFormsFactory', useValue: mockCustomFormsFactory },
                { provide: 'localize', useValue: mockLocalizeService },
                { provide: NoteTemplatesHelperService, useValue: noteTemplateMock },
                { provide: '_elementRef', useValue: ElementRef },
                { provide: 'ModalFactory', useValue: mockModalFactoryService },
                { provide: 'toastrFactory', useValue: mockToastrFactory },
                { provide: 'patSecurityService', useValue: mockPatSecurityService },
                { provide: 'AuthZService', useValue: mockAuthZ },
                { provide: '$location', useValue: mockLocation },
                { provide: '$injector', useValue: mockInjector },
                { provide: "ListHelper", useValue: mockListHelper },
                { provide: NoteTemplatesHttpService, useValue: noteTemplatesHttpService },
                SectionCrudComponent, NoteTemplatesComponent, FormBuilder, ChangeDetectorRef
            ]
        })
            .compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(SectionHeaderComponent);
        component = fixture.componentInstance;
        localize = TestBed.get('localize');
        frmNoteTemplate = component.fb.group({
            inpTemplateName: "templatename",
            slctTemplateCategory: "1",
            sectionHeaderFormArray: new FormArray([])
        });
        component.parentForm = frmNoteTemplate;
        component.customForm = tempCustomerFormData;
        component.section = { DataTag: "AAAAAAAeupg=", Title: 'AnglersDemo', FormSectionItems: [] }
        service = TestBed.get(NoteTemplatesHelperService);
        service.setData(tempCustomerFormData);
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    describe('ngOnInit -->', () => {
        it('should call setSectionsValue', () => {
            spyOn(component, "setSectionsValue").and.callThrough();
            component.ngOnInit();
            expect(component.setSectionsValue).toHaveBeenCalled();
        })

        it('should set value for subscription', () => {
            component.ngOnInit();
            expect(component.subscription).not.toBe(null);
        })
    })

    describe('addSectionItem should add a section item of type Multiple Choice question to the given section of the customForm-> ', () => {
        it('should add Multiple Choice Section question   ', () => {
            component.section.FormSectionItems = [];
            let newSectionItem =
            {
                "FormSectionId": "00000000-0000-0000-0000-000000000000",
                "SectionItemId": -1,
                "BankItemId": "00000000-0000-0000-0000-000000000000",
                "FormBankItem": {
                    "ItemText": "",
                    "FormItemTypeId": "00000000-0000-0000-0000-000000000000",
                    "FormItemTypeName": "",
                    "Description": "",
                    "CommonlyUsed": "",
                    "IsVisible": true,
                    "UseDefaultValue": false,
                    "DefaultValue": ""
                },
                "IsRequired": false,
                "MultiSelectAllow": false,
                "IsVisible": true,
                "SequenceNumber": 1,
                "BankItemDemographicId": "00000000-0000-0000-0000-000000000000",
                "FormBankItemDemographic": {},
                "BankItemEmergencyContactId": "00000000-0000-0000-0000-000000000000",
                "FormBankItemEmergencyContact": {},
                "ItemOptions": [],

                "FormItemTypeName": "",
                "FormItemTypeId": ""
            };
            spyOn(component, 'initializeSectionItem').and.returnValue(newSectionItem);
            component.addSectionClick(1, 1);
            expect(component.customForm.SectionValidationFlag).toBe(false);
            expect(component.customForm.SectionCopyValidationFlag).toBe(-1);
            expect(component.initializeSectionItem).toHaveBeenCalled();
            expect(component.section.FormSectionItems.length).toBe(1);
            expect(component.section.FormSectionItems[0].FormItemTypeName).toEqual('Multiple Choice');
            expect(component.section.FormSectionItems[0].FormItemType).toEqual(3);
            expect(component.section.FormSectionItems[0].FormBankItem).not.toBeNull();
            expect(component.section.FormSectionItems[0].FormBankItem.FormItemTypeName).toEqual('Multiple Choice');
            expect(component.section.FormSectionItems[0].BankItemDemographicId).toBeNull();
            expect(component.section.FormSectionItems[0].FormBankItemDemographic).toBeNull();
            expect(component.section.FormSectionItems[0].BankItemEmergencyContactId).toBeNull();
            expect(component.section.FormSectionItems[0].FormBankItemEmergencyContact).toBeNull();
            expect(component.customForm.SectionValidationFlag).toBe(false);
        });
    });

    describe('addSectionItem should add a section item of type Yes/No or True/False question to the given section of the customForm -> ', () => {
        it('should add Yes/No True/False Section question   ', () => {
            component.section.FormSectionItems = [];
            let newSectionItem =
            {
                "FormSectionId": "00000000-0000-0000-0000-000000000000",
                "SectionItemId": -1,
                "BankItemId": "00000000-0000-0000-0000-000000000000",
                "FormBankItem": {
                    "ItemText": "",
                    "FormItemTypeId": "00000000-0000-0000-0000-000000000000",
                    "FormItemTypeName": "",
                    "Description": "",
                    "CommonlyUsed": "",
                    "IsVisible": true,
                    "UseDefaultValue": false,
                    "DefaultValue": ""
                },
                "IsRequired": false,
                "MultiSelectAllow": false,
                "IsVisible": true,
                "SequenceNumber": 1,
                "BankItemDemographicId": "00000000-0000-0000-0000-000000000000",
                "FormBankItemDemographic": {},
                "BankItemEmergencyContactId": "00000000-0000-0000-0000-000000000000",
                "FormBankItemEmergencyContact": {},
                "ItemOptions": [],

                "FormItemTypeName": "",
                "FormItemTypeId": ""
            };
            spyOn(component, 'initializeSectionItem').and.returnValue(newSectionItem);
            let sectionItemTypeValue = 2;
            let sectionIndex = 1;
            component.addSectionClick(sectionIndex, sectionItemTypeValue);
            expect(component.customForm.SectionValidationFlag).toBe(false);
            expect(component.customForm.SectionCopyValidationFlag).toBe(-1);
            expect(component.initializeSectionItem).toHaveBeenCalled();
            expect(component.section.FormSectionItems.length).toBe(1);
            expect(component.section.FormSectionItems[0].FormItemTypeName).toEqual('Yes/No True/False');
            expect(component.section.FormSectionItems[0].FormItemType).toEqual(2);
            expect(component.section.FormSectionItems[0].FormBankItem).not.toBeNull();
            expect(component.section.FormSectionItems[0].FormBankItem.FormItemTypeName).toEqual('Yes/No True/False');
            expect(component.section.FormSectionItems[0].BankItemDemographicId).toBeNull();
            expect(component.section.FormSectionItems[0].FormBankItemDemographic).toBeNull();
            expect(component.section.FormSectionItems[0].BankItemEmergencyContactId).toBeNull();
            expect(component.section.FormSectionItems[0].FormBankItemEmergencyContact).toBeNull();
            expect(component.customForm.SectionValidationFlag).toBe(false);
        });
    });

    describe('add Ad-Lib Section funtion -> ', () => {
        it('should add Ad-Lib Section question   ', () => {

            component.section.FormSectionItems = [];
            let newSectionItem =
            {
                "FormSectionId": "00000000-0000-0000-0000-000000000000",
                "SectionItemId": -1,
                "BankItemId": "00000000-0000-0000-0000-000000000000",
                "FormBankItem": {
                    "ItemText": "",
                    "FormItemTypeId": "00000000-0000-0000-0000-000000000000",
                    "FormItemTypeName": "",
                    "Description": "",
                    "CommonlyUsed": "",
                    "IsVisible": true,
                    "UseDefaultValue": false,
                    "DefaultValue": ""
                },
                "IsRequired": false,
                "MultiSelectAllow": false,
                "IsVisible": true,
                "SequenceNumber": 1,
                "BankItemDemographicId": "00000000-0000-0000-0000-000000000000",
                "FormBankItemDemographic": {},
                "BankItemEmergencyContactId": "00000000-0000-0000-0000-000000000000",
                "FormBankItemEmergencyContact": {},
                "ItemOptions": [],

                "FormItemTypeName": "",
                "FormItemTypeId": ""
            };
            spyOn(component, 'initializeSectionItem').and.returnValue(newSectionItem);
            let sectionItemTypeValue = 3;
            let sectionIndex = 1;

            component.addSectionClick(sectionIndex, sectionItemTypeValue);
            expect(component.initializeSectionItem).toHaveBeenCalled();
            expect(component.section.FormSectionItems.length).toBe(1);
            expect(component.section.FormSectionItems[0].FormItemTypeName).toEqual("Ad-Lib");
            expect(component.section.FormSectionItems[0].FormItemType).toEqual(9);
            expect(component.section.FormSectionItems[0].FormBankItem).not.toBeNull();
            expect(component.section.FormSectionItems[0].BankItemDemographicId).toBeNull();
            expect(component.section.FormSectionItems[0].FormBankItemDemographic).toBeNull();
            expect(component.section.FormSectionItems[0].BankItemEmergencyContactId).toBeNull();
            expect(component.section.FormSectionItems[0].FormBankItemEmergencyContact).toBeNull();
            expect(component.customForm.SectionValidationFlag).toBe(false);
        });
    });

    describe('add Link Tooth Section funtion -> ', () => {
        it('should add  Link Tooth Section question   ', () => {

            component.section.FormSectionItems = [];
            let newSectionItem =
            {
                "FormSectionId": "00000000-0000-0000-0000-000000000000",
                "SectionItemId": -1,
                "BankItemId": "00000000-0000-0000-0000-000000000000",
                "FormBankItem": {
                    "ItemText": "",
                    "FormItemTypeId": "00000000-0000-0000-0000-000000000000",
                    "FormItemTypeName": "",
                    "Description": "",
                    "CommonlyUsed": "",
                    "IsVisible": true,
                    "UseDefaultValue": false,
                    "DefaultValue": ""
                },
                "IsRequired": false,
                "MultiSelectAllow": false,
                "IsVisible": true,
                "SequenceNumber": 1,
                "BankItemDemographicId": "00000000-0000-0000-0000-000000000000",
                "FormBankItemDemographic": {},
                "BankItemEmergencyContactId": "00000000-0000-0000-0000-000000000000",
                "FormBankItemEmergencyContact": {},
                "ItemOptions": [],

                "FormItemTypeName": "",
                "FormItemTypeId": ""
            };
            spyOn(component, 'initializeSectionItem').and.returnValue(newSectionItem);
            let sectionItemTypeValue = 4;
            let sectionIndex = 1;

            component.addSectionClick(sectionIndex, sectionItemTypeValue);
            expect(component.initializeSectionItem).toHaveBeenCalled();
            expect(component.section.FormSectionItems.length).toBe(1);
            expect(component.section.FormSectionItems[0].FormItemTypeName).toEqual("Link Tooth");
            expect(component.section.FormSectionItems[0].FormItemType).toEqual(10);
            expect(component.section.FormSectionItems[0].FormBankItem).not.toBeNull();
            expect(component.section.FormSectionItems[0].BankItemDemographicId).toBeNull();
            expect(component.section.FormSectionItems[0].FormBankItemDemographic).toBeNull();
            expect(component.section.FormSectionItems[0].BankItemEmergencyContactId).toBeNull();
            expect(component.section.FormSectionItems[0].FormBankItemEmergencyContact).toBeNull();
            expect(component.customForm.SectionValidationFlag).toBe(false);
        });
    });

    describe('add Note Text Section funtion -> ', () => {
        it('should add Note Text Section question   ', () => {

            component.section.FormSectionItems = [];
            let newSectionItem =
            {
                "FormSectionId": "00000000-0000-0000-0000-000000000000",
                "SectionItemId": -1,
                "BankItemId": "00000000-0000-0000-0000-000000000000",
                "FormBankItem": {
                    "ItemText": "",
                    "FormItemTypeId": "00000000-0000-0000-0000-000000000000",
                    "FormItemTypeName": "",
                    "Description": "",
                    "CommonlyUsed": "",
                    "IsVisible": true,
                    "UseDefaultValue": false,
                    "DefaultValue": ""
                },
                "IsRequired": false,
                "MultiSelectAllow": false,
                "IsVisible": true,
                "SequenceNumber": 1,
                "BankItemDemographicId": "00000000-0000-0000-0000-000000000000",
                "FormBankItemDemographic": {},
                "BankItemEmergencyContactId": "00000000-0000-0000-0000-000000000000",
                "FormBankItemEmergencyContact": {},
                "ItemOptions": [],

                "FormItemTypeName": "",
                "FormItemTypeId": ""
            };
            spyOn(component, 'initializeSectionItem').and.returnValue(newSectionItem);
            let sectionItemTypeValue = 5;
            let sectionIndex = 1;

            component.addSectionClick(sectionIndex, sectionItemTypeValue);
            expect(component.initializeSectionItem).toHaveBeenCalled();
            expect(component.section.FormSectionItems.length).toBe(1);
            expect(component.section.FormSectionItems[0].FormItemTypeName).toEqual("Note Text");
            expect(component.section.FormSectionItems[0].FormItemType).toEqual(11);
            expect(component.section.FormSectionItems[0].BankItemDemographicId).toBeNull();
            expect(component.section.FormSectionItems[0].FormBankItemDemographic).toBeNull();
            expect(component.section.FormSectionItems[0].BankItemEmergencyContactId).toBeNull();
            expect(component.section.FormSectionItems[0].FormBankItemEmergencyContact).toBeNull();
            expect(component.customForm.SectionValidationFlag).toBe(false);
        });
    });

    describe('add Demographic Question Section Item  funtion -> ', () => {
        it('should add Demographic Question Section question   ', () => {

            component.section.FormSectionItems = [];
            let newSectionItem =
            {
                "FormSectionId": "00000000-0000-0000-0000-000000000000",
                "SectionItemId": -1,
                "BankItemId": "00000000-0000-0000-0000-000000000000",
                "FormBankItem": {
                    "ItemText": "",
                    "FormItemTypeId": "00000000-0000-0000-0000-000000000000",
                    "FormItemTypeName": "",
                    "Description": "",
                    "CommonlyUsed": "",
                    "IsVisible": true,
                    "UseDefaultValue": false,
                    "DefaultValue": ""
                },
                "IsRequired": false,
                "MultiSelectAllow": false,
                "IsVisible": true,
                "SequenceNumber": 1,
                "BankItemDemographicId": "00000000-0000-0000-0000-000000000000",
                "FormBankItemDemographic": {},
                "BankItemEmergencyContactId": "00000000-0000-0000-0000-000000000000",
                "FormBankItemEmergencyContact": {},
                "ItemOptions": [],

                "FormItemTypeName": "",
                "FormItemTypeId": ""
            };
            spyOn(component, 'initializeSectionItem').and.returnValue(newSectionItem);
            let sectionItemTypeValue = 1;
            let sectionIndex = 1;
            component.addSectionItem(sectionIndex, sectionItemTypeValue);
            expect(component.customForm.SectionValidationFlag).toBe(false);
            expect(component.customForm.SectionCopyValidationFlag).toBe(-1);
            expect(component.initializeSectionItem).toHaveBeenCalled();
            expect(component.section.FormSectionItems.length).toBe(1);
            //
            expect(component.section.FormSectionItems[0].FormItemTypeName).toEqual('Demographic Question');
            expect(component.section.FormSectionItems[0].FormItemType).toEqual(1);
            expect(component.section.FormSectionItems[0].FormBankItemDemographic).not.toBeNull();
            expect(component.section.FormSectionItems[0].FormBankItemDemographic.BankItemDemographicId).toEqual("00000000-0000-0000-0000-000000000001");
            expect(component.section.FormSectionItems[0].FormBankItemDemographic.FirstNameFormItemTypeId).toEqual(0);
            expect(component.section.FormSectionItems[0].FormBankItemDemographic.IsRequiredFirstName).toEqual(true);
            expect(component.section.FormSectionItems[0].FormBankItemDemographic.LastNameFormItemTypeId).toEqual(0);
            expect(component.section.FormSectionItems[0].FormBankItemDemographic.IsRequiredLastName).toEqual(true);
            expect(component.section.FormSectionItems[0].FormBankItemDemographic.PreferredNameFormItemTypeId).toEqual(0);
            expect(component.section.FormSectionItems[0].FormBankItemDemographic.IsRequiredPreferredName).toEqual(false);
            expect(component.section.FormSectionItems[0].FormBankItemDemographic.AddressLine1FormItemTypeId).toEqual(0);
            expect(component.section.FormSectionItems[0].FormBankItemDemographic.IsRequiredAddressLine1).toEqual(false);
            expect(component.section.FormSectionItems[0].FormBankItemDemographic.AddressLine2FormItemTypeId).toEqual(0);
            expect(component.section.FormSectionItems[0].FormBankItemDemographic.IsRequiredAddressLine2).toEqual(false);
            expect(component.section.FormSectionItems[0].FormBankItemDemographic.CityFormItemTypeId).toEqual(0);
            expect(component.section.FormSectionItems[0].FormBankItemDemographic.IsRequiredCity).toEqual(false);
            expect(component.section.FormSectionItems[0].FormBankItemDemographic.StateFormItemTypeId).toEqual(0);
            expect(component.section.FormSectionItems[0].FormBankItemDemographic.IsRequiredState).toEqual(false);
            expect(component.section.FormSectionItems[0].FormBankItemDemographic.ZipFormItemTypeId).toEqual(0);
            expect(component.section.FormSectionItems[0].FormBankItemDemographic.IsRequiredZip).toEqual(false);
            expect(component.section.FormSectionItems[0].FormBankItemDemographic.EmailAddressFormItemTypeId).toEqual(0);
            expect(component.section.FormSectionItems[0].FormBankItemDemographic.IsRequiredEmailAddress).toEqual(false);
            expect(component.section.FormSectionItems[0].FormBankItemDemographic.PrimaryNumberFormItemTypeId).toEqual(0);
            expect(component.section.FormSectionItems[0].FormBankItemDemographic.IsRequiredPrimaryNumber).toEqual(false);
            expect(component.section.FormSectionItems[0].FormBankItemDemographic.SecondaryNumberFormItemTypeId).toEqual(0);
            expect(component.section.FormSectionItems[0].FormBankItemDemographic.IsRequiredSecondaryNumber).toEqual(false);
            expect(component.section.FormSectionItems[0].BankItemEmergencyContactId).toBeNull();
            expect(component.section.FormSectionItems[0].FormBankItemEmergencyContact).toBeNull();
            expect(component.section.FormSectionItems[0].BankItemId).toBeNull();
            expect(component.section.FormSectionItems[0].FormBankItem).toBeNull();
            expect(component.customForm.SectionValidationFlag).toBe(false);
        });
    });

    describe('add Signature Box  Section Item  funtion -> ', () => {
        it('should add Signature Box Section question   ', () => {
            component.section.FormSectionItems = [];
            let newSectionItem =
            {
                "FormSectionId": "00000000-0000-0000-0000-000000000000",
                "SectionItemId": -1,
                "BankItemId": "00000000-0000-0000-0000-000000000000",
                "FormBankItem": {
                    "ItemText": "",
                    "FormItemTypeId": "00000000-0000-0000-0000-000000000000",
                    "FormItemTypeName": "",
                    "Description": "",
                    "CommonlyUsed": "",
                    "IsVisible": true,
                    "UseDefaultValue": false,
                    "DefaultValue": ""
                },
                "IsRequired": false,
                "MultiSelectAllow": false,
                "IsVisible": true,
                "SequenceNumber": 1,
                "BankItemDemographicId": "00000000-0000-0000-0000-000000000000",
                "FormBankItemDemographic": {},
                "BankItemEmergencyContactId": "00000000-0000-0000-0000-000000000000",
                "FormBankItemEmergencyContact": {},
                "ItemOptions": [],

                "FormItemTypeName": "",
                "FormItemTypeId": ""
            };
            spyOn(component, 'initializeSectionItem').and.returnValue(newSectionItem);
            let sectionItemTypeValue = 4;
            let sectionIndex = 1;

            component.addSectionItem(sectionIndex, sectionItemTypeValue);
            expect(component.customForm.SectionValidationFlag).toBe(false);
            expect(component.customForm.SectionCopyValidationFlag).toBe(-1);
            expect(component.initializeSectionItem).toHaveBeenCalled();
            expect(component.section.FormSectionItems.length).toBe(1);
            expect(component.section.FormSectionItems[0].FormItemTypeName).toEqual('Signature Box');
            expect(component.section.FormSectionItems[0].FormItemType).toEqual(4);
            expect(component.section.FormSectionItems[0].FormBankItem).not.toBeNull();
            expect(component.section.FormSectionItems[0].FormBankItem.FormItemTypeName).toEqual('Signature Box');
            expect(component.section.FormSectionItems[0].BankItemDemographicId).toBeNull();
            expect(component.section.FormSectionItems[0].FormBankItemDemographic).toBeNull();
            expect(component.section.FormSectionItems[0].BankItemEmergencyContactId).toBeNull();
            expect(component.section.FormSectionItems[0].FormBankItemEmergencyContact).toBeNull();
            expect(component.customForm.SectionValidationFlag).toBe(false);
        });
    });

    describe('addSectionItem should add a section item of type Date of Completion question to the given section of the customForm -> ', () => {
        it('should add Date of Completion Section question   ', () => {
            component.section.FormSectionItems = [];
            let newSectionItem =
            {
                "FormSectionId": "00000000-0000-0000-0000-000000000000",
                "SectionItemId": -1,
                "BankItemId": "00000000-0000-0000-0000-000000000000",
                "FormBankItem": {
                    "ItemText": "",
                    "FormItemTypeId": "00000000-0000-0000-0000-000000000000",
                    "FormItemTypeName": "",
                    "Description": "",
                    "CommonlyUsed": "",
                    "IsVisible": true,
                    "UseDefaultValue": false,
                    "DefaultValue": ""
                },
                "IsRequired": false,
                "MultiSelectAllow": false,
                "IsVisible": true,
                "SequenceNumber": 1,
                "BankItemDemographicId": "00000000-0000-0000-0000-000000000000",
                "FormBankItemDemographic": {},
                "BankItemEmergencyContactId": "00000000-0000-0000-0000-000000000000",
                "FormBankItemEmergencyContact": {},
                "ItemOptions": [],

                "FormItemTypeName": "",
                "FormItemTypeId": ""
            };
            spyOn(component, 'initializeSectionItem').and.returnValue(newSectionItem);
            let sectionItemTypeValue = 5;
            let sectionIndex = 1;
            component.addSectionItem(sectionIndex, sectionItemTypeValue);
            expect(component.customForm.SectionValidationFlag).toBe(false);
            expect(component.customForm.SectionCopyValidationFlag).toBe(-1);
            expect(component.initializeSectionItem).toHaveBeenCalled();
            expect(component.section.FormSectionItems.length).toBe(1);
            expect(component.section.FormSectionItems[0].FormItemTypeName).toEqual('Date of Completion');
            expect(component.section.FormSectionItems[0].FormItemType).toEqual(5);
            expect(component.section.FormSectionItems[0].FormBankItem).not.toBeNull();
            expect(component.section.FormSectionItems[0].FormBankItem.FormItemTypeName).toEqual('Date of Completion');
            expect(component.section.FormSectionItems[0].BankItemDemographicId).toBeNull();
            expect(component.section.FormSectionItems[0].FormBankItemDemographic).toBeNull();
            expect(component.section.FormSectionItems[0].BankItemEmergencyContactId).toBeNull();
            expect(component.section.FormSectionItems[0].FormBankItemEmergencyContact).toBeNull();
            expect(component.customForm.SectionValidationFlag).toBe(false);
        });
    });

    describe('add Emergency Contact Section Item  funtion -> ', () => {
        it('should add Emergency Contact Section question   ', () => {
            component.section.FormSectionItems = [];
            let newSectionItem =
            {
                "FormSectionId": "00000000-0000-0000-0000-000000000000",
                "SectionItemId": -1,
                "BankItemId": "00000000-0000-0000-0000-000000000000",
                "FormBankItem": {
                    "ItemText": "",
                    "FormItemTypeId": "00000000-0000-0000-0000-000000000000",
                    "FormItemTypeName": "",
                    "Description": "",
                    "CommonlyUsed": "",
                    "IsVisible": true,
                    "UseDefaultValue": false,
                    "DefaultValue": ""
                },
                "IsRequired": false,
                "MultiSelectAllow": false,
                "IsVisible": true,
                "SequenceNumber": 1,
                "BankItemDemographicId": "00000000-0000-0000-0000-000000000000",
                "FormBankItemDemographic": {},
                "BankItemEmergencyContactId": "00000000-0000-0000-0000-000000000000",
                "FormBankItemEmergencyContact": {},
                "ItemOptions": [],

                "FormItemTypeName": "",
                "FormItemTypeId": ""
            };
            spyOn(component, 'initializeSectionItem').and.returnValue(newSectionItem);
            let sectionItemTypeValue = 6;
            let sectionIndex = 1;
            component.addSectionItem(sectionIndex, sectionItemTypeValue);
            expect(component.customForm.SectionValidationFlag).toBe(false);
            expect(component.customForm.SectionCopyValidationFlag).toBe(-1);
            expect(component.initializeSectionItem).toHaveBeenCalled();
            expect(component.section.FormSectionItems.length).toBe(1);
            expect(component.section.FormSectionItems[0].FormItemTypeName).toEqual('Emergency Contact');
            expect(component.section.FormSectionItems[0].FormItemType).toEqual(6);
            expect(component.section.FormSectionItems[0].FormBankItemEmergencyContact).not.toBeNull();
            expect(component.section.FormSectionItems[0].FormBankItemEmergencyContact.ContactFormItemTypeId).toEqual(0);
            expect(component.section.FormSectionItems[0].FormBankItemEmergencyContact.IsRequiredContact).toEqual(false);
            expect(component.section.FormSectionItems[0].FormBankItemEmergencyContact.PhoneFormItemTypeId).toEqual(0);
            expect(component.section.FormSectionItems[0].FormBankItemEmergencyContact.IsRequiredPhone).toEqual(false);
            expect(component.section.FormSectionItems[0].FormBankItemEmergencyContact.ContactRelationshipFormItemTypeId).toEqual(0);
            expect(component.section.FormSectionItems[0].FormBankItemEmergencyContact.IsRequiredContactRelationship).toEqual(false);
            expect(component.section.FormSectionItems[0].BankItemDemographicId).toBeNull();
            expect(component.section.FormSectionItems[0].FormBankItemDemographic).toBeNull();
            expect(component.section.FormSectionItems[0].BankItemId).toBeNull();
            expect(component.section.FormSectionItems[0].FormBankItem).toBeNull();
            expect(component.customForm.SectionValidationFlag).toBe(false);
        });
    });

    describe('add Comment/Essay Section Item  funtion -> ', () => {
        it('should add Comment/Essay Section question   ', () => {
            component.section = { FormSectionItems: [] };
            let newSectionItem =
            {
                "FormSectionId": "00000000-0000-0000-0000-000000000000",
                "SectionItemId": -1,
                "BankItemId": "00000000-0000-0000-0000-000000000000",
                "FormBankItem": {
                    "ItemText": "",
                    "FormItemTypeId": "00000000-0000-0000-0000-000000000000",
                    "FormItemTypeName": "",
                    "Description": "",
                    "CommonlyUsed": "",
                    "IsVisible": true,
                    "UseDefaultValue": false,
                    "DefaultValue": ""
                },
                "IsRequired": false,
                "MultiSelectAllow": false,
                "IsVisible": true,
                "SequenceNumber": 1,
                "BankItemDemographicId": "00000000-0000-0000-0000-000000000000",
                "FormBankItemDemographic": {},
                "BankItemEmergencyContactId": "00000000-0000-0000-0000-000000000000",
                "FormBankItemEmergencyContact": {},
                "ItemOptions": [],

                "FormItemTypeName": "",
                "FormItemTypeId": ""
            };
            spyOn(component, 'initializeSectionItem').and.returnValue(newSectionItem);
            let sectionItemTypeValue = 7;
            let sectionIndex = 1;
            component.addSectionItem(sectionIndex, sectionItemTypeValue);
            expect(component.customForm.SectionValidationFlag).toBe(false);
            expect(component.customForm.SectionCopyValidationFlag).toBe(-1);
            expect(component.initializeSectionItem).toHaveBeenCalled();
            expect(component.section.FormSectionItems.length).toBe(1);
            expect(component.section.FormSectionItems[0].FormItemTypeName).toEqual('Comment/Essay');
            expect(component.section.FormSectionItems[0].FormItemType).toEqual(7);
            expect(component.section.FormSectionItems[0].FormBankItem).not.toBeNull();
            expect(component.section.FormSectionItems[0].FormBankItem.FormItemTypeName).toEqual('Comment/Essay');
            expect(component.section.FormSectionItems[0].BankItemDemographicId).toBeNull();
            expect(component.section.FormSectionItems[0].FormBankItemDemographic).toBeNull();
            expect(component.section.FormSectionItems[0].BankItemEmergencyContactId).toBeNull();
            expect(component.section.FormSectionItems[0].FormBankItemEmergencyContact).toBeNull();
            expect(component.customForm.SectionValidationFlag).toBe(false);
        });
    });

    describe('copySection should not copy a given section below it, when the section to be copied is invalid', () => {
        it('should not copy Section   ', () => {
            component.customForm = tempCustomerFormData
            component.customForm = {
                SectionValidationFlag: true,
                FormSections: [{ Title: 'Section1' }, { Title: 'Section2' }],
                IndexOfSectionInEditMode: 0
            };
            component.section = component.customForm.FormSections[0];

            spyOn(component, 'isSectionValid').and.returnValue(true);
            spyOn(component, 'previewSection');

            expect(component.customForm.FormSections.length).toEqual(2);

            component.copySection(0);

            expect(component.isSectionValid).toHaveBeenCalled();
            expect(component.customForm.SectionValidationFlag).toBe(false);
            expect(component.customForm.FormSections.length).toEqual(3);
            expect(component.customForm.FormSections[0].Title).toEqual('Section1');
            expect(component.customForm.FormSections[1].Title).toEqual('');
            expect(component.customForm.FormSections[2].Title).toEqual('Section2');

            var newlyCopiedSection = component.customForm.FormSections[1];
            expect(component.previewSection).toHaveBeenCalled();
            component.copySection(1);
            expect(component.customForm.SectionValidationFlag).toBe(false);
        });
    });
    describe('copySection should copy a given section below it, when the section to be copied is valid ', () => {
        it('should copy Section   ', () => {
            component.customForm = tempCustomerFormData
            component.customForm = {
                FormSections: [{ Title: '' }, { Title: 'Section2' }],
                IndexOfSectionInEditMode: 0
            };
            component.section = component.customForm.FormSections[0];

            spyOn(component, 'isSectionValid').and.returnValue(false);
            spyOn(component, 'previewSection');

            expect(component.customForm.FormSections.length).toEqual(2);

            component.copySection(0);

            expect(component.isSectionValid).toHaveBeenCalledWith();
            expect(component.previewSection).not.toHaveBeenCalled();

            expect(component.customForm.FormSections.length).toEqual(2);
            expect(component.customForm.FormSections[0].Title).toEqual('');
            expect(component.customForm.FormSections[1].Title).toEqual('Section2');
            expect(component.customForm.IndexOfSectionInEditMode).toBe(0);
        });
    });
    describe('move Section Up funtion -> ', () => {
        it('should move Section Up   ', () => {
            spyOn(component, "moveSection").and.callThrough();
            //  component.moveSectionUp(1);
            component.customForm = {
                FormSections: [{ Title: 'Section1', FormSectionItems: [] }, { Title: 'Section2', FormSectionItems: [] }],
                IndexOfSectionInEditMode: 0
            };
            component.section = component.customForm.FormSections[1];

            component.moveSectionUp(1);

            expect(component.customForm.IndexOfSectionInEditMode).toBe(0);
            expect(component.moveSection).toHaveBeenCalled();
        });
    });

    describe('moveSectionDown should move section down when the section to move is not bottom-most section-> ', () => {
        it('should move Section Down ', () => {
            spyOn(component, "moveSection").and.callThrough();
            component.customForm = {
                FormSections: [{ Title: 'Section1' }, { Title: 'Section2' }],
                IndexOfSectionInEditMode: 0
            };
            component.section = component.customForm.FormSections[0];

            component.moveSectionDown(0);
            expect(component.customForm.FormSections.length).toEqual(2);
            expect(component.customForm.FormSections[0].Title).toEqual('Section2');
            expect(component.customForm.FormSections[1].Title).toEqual('Section1');
            expect(component.customForm.IndexOfSectionInEditMode).toBe(1);
            expect(component.moveSection).toHaveBeenCalled();
        });
    });
    describe('previewSection should set the given section preview mode, when the section is valid -> ', () => {
        it('previewSection should set the given section preview mode, when the section is valid ', () => {
            component.customForm = {
                SectionValidationFlag: true,
                FormSections: [{ Title: 'Section1' }],
                IndexOfSectionInEditMode: 0
            };
            component.section = component.customForm.FormSections[0];

            spyOn(component, 'isSectionValid').and.returnValue(true);

            expect(component.customForm.IndexOfSectionInEditMode).toBe(0);

            component.previewSection();

            expect(component.isSectionValid).toHaveBeenCalled();
            expect(component.customForm.IndexOfSectionInEditMode).toBe(-1);
            expect(component.customForm.SectionValidationFlag).toBe(false);
        });
    });
    describe('previewSection should not set the given section preview mode, when the section is invalid-> ', () => {
        it('previewSection should not set the given section preview mode, when the section is invalid', () => {
            component.customForm = {
                SectionValidationFlag: false,
                FormSections: [{ Title: 'Section1' }],
                IndexOfSectionInEditMode: 0
            };
            component.section = component.customForm.FormSections[0];

            spyOn(component, 'isSectionValid').and.returnValue(false);

            expect(component.customForm.IndexOfSectionInEditMode).toBe(0);

            component.previewSection();

            expect(component.isSectionValid).toHaveBeenCalled();
            expect(component.customForm.IndexOfSectionInEditMode).toBe(0);
            expect(component.customForm.SectionValidationFlag).toBe(true);
        });
    });

    describe('isSectionValid should return true when the section is valid  funtion -> ', () => {
        it('isSectionValid should return true when the section is valid', () => {
            //for yes-no
            component.section = {
                FormSectionItems: [{ FormSectionId: "2", FormBankItem: { ItemText: 'sample' } }]
            };

            var result = component.isSectionValid();
            expect(result).toBe(true);

            //for true-false
            component.section = {
                FormSectionItems: [{ FormSectionId: "8", FormBankItem: { ItemText: 'sample' } }]
            };

            var result = component.isSectionValid();
            expect(result).toBe(true);

            //for multiple choice
            component.section = {
                FormSectionItems: [{ FormSectionId: "3", FormBankItem: { ItemText: 'sample' } }]
            };

            var result = component.isSectionValid();
            expect(result).toBe(true);

            //for comment-essay
            component.section = {
                FormSectionItems: [{ FormSectionId: "7", FormBankItem: { ItemText: 'sample' } }]
            };

            var result = component.isSectionValid();
            expect(result).toBe(true);
        });
    });

    describe('on Section Selected Change funtion -> ', () => {
        it('should on Section Selected Change    ', () => {
            component.onSectionSelectedChange(1);
            expect(component.sectionSelected).toBe(1);
        });
    });

    describe('createForm -->', () => {
        it('should call createForm with all fields', () => {
            component.createForm();
            expect(component.sectionHeaderForm).not.toBe(null);
        })

        it('should add sectionHeaderForm in parent form', () => {
            component.createForm();
            expect(component.parentForm.controls["sectionHeaderFormArray"]).not.toBe(null);
        })

        it('should focus control if value is blank', () => {
            component.section.Title = "";
            component.createForm();
            expect(component.section.Title).toEqual("");
        })
    })

    describe('setUpdatedFormValues -->', () => {
        it('should call setUpdatedFormValues on any form value changed', () => {
            component.sectionHeaderForm.setValue({ "inpSectionTitle": "Section Title" });
            component.sectionHeaderForm.valueChanges.subscribe((changedvalue) => {
                component.canUndo = true;
                expect(component.section.Title).toEqual("Section Title");
            })
        })

        it('should call setUpdatedFormValues on any form value changed including note categories', () => {
            component.createForm();
            component.sectionHeaderForm.setValue({ "inpSectionTitle": "Section Title" });
            component.sectionHeaderForm.valueChanges.subscribe((changedvalue) => {
                expect(component.section.Title).toEqual("Section Title");
            })
        })
    })

    describe('ngOnDestroy -->', () => {
        it('should close subscription on destroy', () => {
            component.subscription = Object.assign(mockSubscription);
            component.formValueSubscription = Object.assign(mockSubscription);
            component.undoSubscription = Object.assign(mockSubscription);
            component.ngOnDestroy();
            expect(component.subscription.closed).toBe(true);
            expect(component.formValueSubscription.closed).toBe(true);
            expect(component.undoSubscription.closed).toBe(true);
        })
    })

    describe('titleChanged method', () => {
        it('should add "adding_title" to undoStack when called', () => {
            component.titleChanged();
            expect(noteTemplateMock.undoStack).toContain('adding_title');
        });
    });


    describe('undo method', () => {

        it('should increment the undoCount', () => {
            component.undoCount = 0;
            component.undo();
            component.undoCount = component.undoCount + 1;
            expect(component.undoCount).toBe(1);
        });

        it('should set canUndo to false when undoCount is greater than or equal to 5', () => {
            spyOn(noteTemplateMock, 'setUndo').and.returnValue(false);
            component.undoCount = 5;
            component.canUndo = true;
            component.undo();
            expect(noteTemplateMock.setUndo).toHaveBeenCalledWith(false);
        });

        it('should not call NoteTemplatesHelperService.onUndo when canUndo is false and undoStack is empty', () => {
            component.canUndo = false;
            noteTemplateMock.undoStack = [];
            component.undo();
            expect(noteTemplateMock.onUndo).not.toHaveBeenCalledWith();
        });

        it('should call NoteTemplatesHelperService.onUndo when undoStack is not empty and undo operation is triggered', () => {
            component.canUndo = true;
            noteTemplateMock.undoStack = [];
            component.undo();
            spyOn(localize, 'getLocalizedString').and.returnValue('triggering undo operation');
            expect(noteTemplateMock.onUndo).toHaveBeenCalledWith('triggering undo operation');
        });

        it('should remove last character from section title and update form when undoStack has "adding_title"', () => {
            component.section = { Title: 'Test Title' };
            component.sectionHeaderForm.patchValue({ inpSectionTitle: '' });
            component.undo();
            expect(component.sectionHeaderForm.value.inpSectionTitle).toEqual('');
            expect(noteTemplateMock.undoStack.length).toEqual(0);
        });
    });

    describe('toggleAccordion', () => {
        it('should return inverse value for sectionCrudComponent.IsExpanded', () => {
            let initialValue: boolean = component?.sectionCrudComponent?.IsExpanded;
            component.toggleAccordion();
            expect(component?.sectionCrudComponent?.IsExpanded).toEqual(!initialValue);
        });
    });
});
