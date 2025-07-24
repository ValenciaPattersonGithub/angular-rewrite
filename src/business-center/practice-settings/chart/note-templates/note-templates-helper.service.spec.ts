import { TestBed } from '@angular/core/testing';
import { FormArray, FormControl, FormGroup } from '@angular/forms';
import { Subscription } from 'rxjs';
import { CategoriesWithTemplate, CustomFormTemplate, FormSection, FormTypes } from "./note-templates";
import { NoteTemplatesHelperService } from './note-templates-helper.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NoteTemplatesHttpService } from 'src/@shared/providers/note-templates-http.service';

let formSections: FormSection[] = [{
    SequenceNumber: 1, FormSectionItems: [{
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
        FormItemType: FormTypes['Link Tooth'],
        FormSectionId: "01aef280-2cf5-4326-934e-ed43ee3849f7",
        IsRequired: false,
        IsVisible: true,
        ItemOptions: [],
        ItemPromptTextsOptions: [],
        MultiSelectAllow: false,
        SectionItemId: "686af729-a55d-47d5-9952-b0f47ff4d00d",
        SequenceNumber: 1,
        UserModified: "a162c864-8f50-4e84-8942-7194bc8070cf",
        FormItemTypeName: FormTypes[10]
    }, {
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
        FormItemTypeName: FormTypes[11]
    }, {
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
        FormItemType: 8,
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
}]

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
    FormSections: formSections,
    TemplateMode: 1,
    FileAllocationId: 1,
    DataTag: "",
    UserModified: "",
    DateModified: "",
    IndexOfSectionInEditMode: 1,
    SectionValidationFlag: false,
    SectionCopyValidationFlag: 1
}

let mockCategories: CategoriesWithTemplate[] = [
    { CategoryName: 'Cat1', CategoryId: "1", addingNewTemplate: false, ntExpand: true },
    { CategoryName: 'Cat2', CategoryId: "2", addingNewTemplate: false, ntExpand: true },
    { CategoryName: 'Cat3', CategoryId: "3", addingNewTemplate: false, ntExpand: true },
    { CategoryName: 'Cat3', CategoryId: "4", addingNewTemplate: false, ntExpand: true }
];


const mockSoarConfig = {
    domainUrl: 'https://localhost:35440',
};

let mockPatSecurityService = {
    IsAuthorizedByAbbreviation: jasmine.createSpy('patSecurityService.IsAuthorizedByAbbreviation').and.returnValue(true), generateMessage: jasmine.createSpy('patSecurityService.generateMessage')
};
let mockToastrFactory = {
    success: jasmine.createSpy('toastrFactory.success'),
    error: jasmine.createSpy('toastrFactory.error')
};

let mockLocalizeService = {
    getLocalizedString: () => 'translated text'
};
const mockStaticDataService = {
    TeethDefinitions: () => new Promise((resolve, reject) => {
    })
};

let mockNoteTemplatesHttpService = {
    CategoriesWithTemplates: () => {
        return {
            then: (res, error) => {
                res({ Value: mockCategories }),
                error({})
            }
        }
    }
}

describe('NoteTemplatesHelperService', () => {
    let service: NoteTemplatesHelperService;
    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [
                { provide: 'toastrFactory', useValue: mockToastrFactory },
                { provide: 'localize', useValue: mockLocalizeService },
                { provide: 'patSecurityService', useValue: mockPatSecurityService },
                { provide: 'SoarConfig', useValue: mockSoarConfig },
                { provide: 'StaticData', useValue: mockStaticDataService },
                { provide: NoteTemplatesHttpService, useValue: mockNoteTemplatesHttpService },
            ],
        });
        service = TestBed.get(NoteTemplatesHelperService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should set and return latest updated data on setData', () => {
        service.setData(tempCustomerFormData);
        let subScription: Subscription = service.getData().subscribe((res) => {
            expect(res.FormId).toEqual("1234");
        })
        subScription.unsubscribe();
    })

    it('should delete section', () => {
        service.getFormName = jasmine.createSpy();
        let tempParentForm: FormGroup = new FormGroup({
            inpTemplateName: new FormControl(""),
            slctTemplateCategory: new FormControl(""),
            frmToothLinkFormArray_0_0: new FormArray([new FormGroup({})]),
            questionYesNoTrueFalseFormArray_0_1: new FormArray([new FormGroup({})]),
        });
        service.deleteSections(tempParentForm, FormTypes['Link Tooth'], 0, 1, tempCustomerFormData.FormSections[0]);
        expect(service.getFormName).toHaveBeenCalledWith(FormTypes['Link Tooth'], 0, 1);
    })

    it('should delete section and resequence the forms ', () => {
        let tempParentForm: FormGroup = new FormGroup({
            inpTemplateName: new FormControl(""),
            slctTemplateCategory: new FormControl(""),
            frmToothLinkFormArray_0_0: new FormArray([new FormGroup({})]),
            frmQuestionTextFieldFormArray_0_1: new FormArray([new FormGroup({})]),
            sectionHeaderFormArray: new FormGroup({}),
            questionYesNoTrueFalseFormArray_0_2: new FormArray([new FormGroup({})]),
        });
        service.deleteSections(tempParentForm, FormTypes['Yes/No True/False'], 0, 2, tempCustomerFormData.FormSections[0], true);
        expect(tempParentForm.get("questionYesNoTrueFalseFormArray_0_2")).toBeNull();

        tempParentForm = new FormGroup({
            inpTemplateName: new FormControl(""),
            slctTemplateCategory: new FormControl(""),
            frmToothLinkFormArray_0_0: new FormArray([new FormGroup({})]),
            frmQuestionTextFieldFormArray_0_1: new FormArray([new FormGroup({})]),
            sectionHeaderFormArray: new FormGroup({}),
            questionYesNoTrueFalseFormArray_0_2: new FormArray([new FormGroup({})]),
        });
        service.deleteSections(tempParentForm, FormTypes['Link Tooth'], 0, 0, tempCustomerFormData.FormSections[0], true);
        expect(tempParentForm.get("questionYesNoTrueFalseFormArray_0_2")).toBeNull();
    })

    it('should return form name as per form type', () => {
        let formName: string = "";
        formName = service.getFormName(FormTypes['Link Tooth'], 0, 1);
        expect(formName).toEqual("frmToothLinkFormArray_0_1");

        formName = service.getFormName(FormTypes['Yes/No True/False'], 0, 1);
        expect(formName).toEqual("questionYesNoTrueFalseFormArray_0_1");

        formName = service.getFormName(FormTypes['Multiple Choice'], 0, 1);
        expect(formName).toEqual("questionMultipleChoiceFormArray_0_1");

        formName = service.getFormName(FormTypes['Ad-Lib'], 0, 1);
        expect(formName).toEqual("questionAdlibFormArray_0_1");

        formName = service.getFormName(FormTypes['Note Text'], 0, 1);
        expect(formName).toEqual("frmQuestionTextFieldFormArray_0_1");
    })

    it('should remove section header form from Parent form', () => {
        let tempParentForm: FormGroup = new FormGroup({
            inpTemplateName: new FormControl(""),
            slctTemplateCategory: new FormControl(""),
            frmToothLinkFormArray_0_0: new FormGroup({}),
            frmQuestionTextFieldFormArray_0_1: new FormGroup({}),
            sectionHeaderFormArray: new FormGroup({})
        });
        service.resetCrudForm(tempParentForm);
        expect(tempParentForm.get("sectionHeaderFormArray")).toEqual(null);
    })

    it('should change form location as per the index', () => {
        let tempParentForm: FormGroup = new FormGroup({
            inpTemplateName: new FormControl(""),
            slctTemplateCategory: new FormControl(""),

            frmToothLinkFormArray_0_0: new FormArray([new FormGroup({})]),
            frmQuestionTextFieldFormArray_0_1: new FormArray([new FormGroup({})]),
            sectionHeaderFormArray: new FormGroup({})
        });
        service.setChildForms(1, 0, 0, tempCustomerFormData.FormSections[0], tempParentForm);
        expect(tempParentForm.get("frmToothLinkFormArray_0_0")).toEqual(null);
        expect(tempParentForm.get("frmQuestionTextFieldFormArray_0_1")).toEqual(null);
        expect(tempParentForm.get("frmToothLinkFormArray_0_1")).not.toBeNull();
        expect(tempParentForm.get("frmQuestionTextFieldFormArray_0_0")).not.toBeNull();
    })

    it('should set and return latest updated data on setCategoriesData', () => {
        service.setCategoriesData();
        let subScription: Subscription = service.getCategoriesData().subscribe((res) => {
            expect(res).not.toBeNull();
            expect(service.loadingCategories).toBe(true);
            expect(service.loadingTemplates).toBe(true);
        })
        subScription.unsubscribe();
    })
});
