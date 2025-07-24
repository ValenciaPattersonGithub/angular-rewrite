export class NoteTemplatesViewModel {
    Template?: Template;
    TemplateBodyCustomForm?: CustomFormTemplate;
    canEditForm?: boolean;
}

export class Template {
    TemplateId?: string;
    TemplateName?: string;
    CategoryId?: string;
    CategoryName?: string;
    TemplateBodyFormId?: string;
    constructor(TemplateId?: string,
        TemplateName?: string,
        CategoryId?: string,
        CategoryName?: string,
        TemplateBodyFormId?: string) {
        this.TemplateId = TemplateId;
        this.TemplateName = TemplateName;
        this.CategoryId = CategoryId;
        this.CategoryName = CategoryName;
        this.TemplateBodyFormId = TemplateBodyFormId;
    }
}


export class CustomFormTemplate {
    FormId?: string;
    FormName?: string;
    VersionNumber?: number;
    SourceFormId?: string;
    FormTypeId?: number;
    Description?: string;
    IsActive?: boolean;
    IsVisible?: boolean;
    IsPublished?: boolean;
    IsDefault?: boolean;
    FormSections?: Array<FormSection>;
    TemplateMode?: number;
    FileAllocationId?: any;
    DataTag?: string;
    UserModified?: string;
    DateModified?: string;
    IndexOfSectionInEditMode?: number;
    SectionValidationFlag?: boolean;
    SectionCopyValidationFlag?: number;
}

export class FormSection {
    FormId?: string;
    FormSectionId?: string;
    Title?: string;
    ShowTitle?: boolean;
    ShowBorder?: boolean;
    IsVisible?: boolean;
    SequenceNumber?: number;
    FormSectionItems?: Array<FormSectionItem>;
    DataTag?: string;
    UserModified?: string;
    DateModified?: string;
    oneColumn?: boolean;
    threeColumn?: boolean;
    isMHF?: boolean;
    last?: boolean;
}

export class FormSectionItem {
    FormSectionId?: string;
    SectionItemId?: string;
    FormItemType?: number;
    BankItemId?: string;
    FormBankItem?: FormBankItem;
    FormBankItemPromptTexts?: FormBankItemPromptText[];
    IsRequired?: boolean;
    MultiSelectAllow?: boolean;
    IsVisible?: boolean;
    SequenceNumber?: number;
    BankItemDemographicId?: any;
    FormBankItemDemographic?: FormBankItemDemographic;
    FormBankItemEmergencyContact?: FormBankItemEmergencyContact;
    FormItemTextField?: FormItemTextField;
    ItemOptions?: ItemOption[];
    ItemPromptTextsOptions?: Array<ItemPromptTextsOption[]>;
    DataTag?: string;
    UserModified?: string;
    DateModified?: string;
    BankItemEmergencyContactId?: string;
    FormItemTypeName?: string;
    ItemTextFieldId?: string;
    Skip?: boolean;
    Index?: number;
    isMHF?: boolean;
    $$activeTeeth?: string[];
    $$TeethSelectOptions?:  Array<{USNumber: string}>;
}

export class FormBankItem {
    BankItemId?: string;
    SectionItemId?: string;
    ItemText?: string;
    ItemSequenceNumber?: number;
    Description?: string;
    CommonlyUsed?: boolean;
    UseDefaultValue?: boolean;
    DefaultValue?: string;
    FormItemTypeName?: string;
    IsVisible?: boolean;
    Answer?: string;
    DataTag?: string;
    UserModified?: string;
    DateModified?: string;
}

export class FormBankItemPromptText {
    BankItemId?: string;
    SectionItemId?: string;
    ItemText?: string;
    ItemSequenceNumber?: number;
    Description?: string;
    CommonlyUsed?: boolean;
    UseDefaultValue?: boolean;
    DefaultValue?: string;
    Answer?: any;
    DataTag?: string;
    FormItemType?: string;
    FormItemTypeName?: string;
    IsVisible?: boolean;
    UserModified?: string;
    DateModified?: string;
}

export class FormItemTextField {
    ItemTextFieldId?: string;
    NoteText?: string;
    IsRequiredNoteText?: boolean;
    TextFieldItemTypeId?: string;
    DataTag?: string;
    UserModified?: string;
    DateModified?: string;
}

export class ItemOption {
    SectionItemId?: string;
    SectionItemOptionId?: string;
    BankItemId?: string;
    BankItemOptionId?: string;
    IsSelected?: boolean;
    IsVisible?: boolean;
    SequenceNumber?: number;
    BankItemOption?: BankItemOption;
    DataTag?: string;
    UserModified?: string;
    DateModified?: string;
}

export class BankItemOption {
    BankItemId?: string;
    BankItemOptionId?: string;
    OptionIndex?: number;
    OptionText?: string;
    OptionValue?: string;
    DataTag?: string;
    UserModified?: string;
    DateModified?: string;
    IsSelected?: boolean;
    IsVisible?: boolean;
    SequenceNumber?: number;
}

export class ItemPromptTextsOption {
    SectionItemId?: string;
    SectionItemOptionId?: string;
    BankItemId?: string;
    BankItemOptionId?: string;
    IsSelected?: boolean;
    IsVisible?: boolean;
    SequenceNumber?: number;
    BankItemOption?: BankItemOption;
    DataTag?: string;
    UserModified?: string;
    DateModified?: string;
}

export class FormBankItemDemographic {
    BankItemDemographicId?: string;
    FirstNameFormItemTypeId?: number;
    IsRequiredFirstName?: boolean;
    LastNameFormItemTypeId?: number;
    IsRequiredLastName?: boolean;
    PreferredNameFormItemTypeId?: number;
    IsRequiredPreferredName?: boolean;
    AddressLine1FormItemTypeId?: number;
    IsRequiredAddressLine1?: boolean;
    AddressLine2FormItemTypeId?: number;
    IsRequiredAddressLine2?: boolean;
    CityFormItemTypeId?: number;
    IsRequiredCity?: boolean;
    StateFormItemTypeId?: number;
    IsRequiredState?: boolean;
    ZipFormItemTypeId?: number;
    IsRequiredZip?: boolean;
    EmailAddressFormItemTypeId?: number;
    IsRequiredEmailAddress?: boolean;
    PrimaryNumberFormItemTypeId?: number;
    IsRequiredPrimaryNumber?: boolean;
    SecondaryNumberFormItemTypeId?: number;
    IsRequiredSecondaryNumber?: boolean;
}

export class FormBankItemEmergencyContact {
    ContactFormItemTypeId?: number;
    IsRequiredContact?: boolean;
    PhoneFormItemTypeId?: number;
    IsRequiredPhone?: boolean;
    ContactRelationshipFormItemTypeId?: number;
    IsRequiredContactRelationship?: boolean;
}

export enum sections {
    "Multiple Choice" = 1,
    "Yes/No True/False" = 2,
    "Ad-Lib" = 3,
    "Link Tooth" = 4,
    "Note Text" = 5
}

export enum FormTypes {
    "Demographic Question" = 1,
    "Yes/No True/False" = 2,
    "Multiple Choice" = 3,
    "Signature Box" = 4,
    "Date of Completion" = 5,
    "Emergency Contact" = 6,
    "Comment/Essay" = 7,
    "Ad-Lib" = 9,
    "Link Tooth" = 10,
    "Note Text" = 11,
}

export class FormDataArray {
    formData?: FormSectionItem;
    sectionItemIndex?: number;
}

export class CategoriesWithTemplate {
    CategoryId?: string;
    CategoryName?: string;
    TemplateBodyFormId?: string;
    DataTag?: string;
    DateModified?: string;
    UserModified?: string;
    Templates?:Template[];
    ntExpand?:boolean;    
    addingNewTemplate?:boolean;    
    $$Loaded?:boolean;
    $$hasTemplates?:boolean;
    $$editing?:boolean;
    $$Visible?:boolean;
}

export class Categories {
    CategoryId?: string;
    CategoryName?: string;
    DataTag?: string;
    DateModified?: string;
    UserModified?: string;
}

