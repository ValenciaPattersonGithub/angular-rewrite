import { ServiceTypes } from "./service-types";

export class ServiceCodeModel {
    ServiceCodeId?: string;
    CdtCodeId?: string;
    CdtCodeName?: string;
    Code?: string;
    Description?: string;
    CompleteDescription?: string;
    ServiceTypeId?: string;
    ServiceTypeDescription?: string;
    DisplayAs?: string;
    AffectedAreaId?: number;
    AffectedAreaName?: string;
    UsuallyPerformedByProviderTypeId?: number;
    UsuallyPerformedByProviderTypeName?: string;
    UseCodeForRangeOfTeeth?: boolean;
    IsActive?: boolean;
    IsEligibleForDiscount?: boolean;
    Notes?: string;
    SubmitOnInsurance?: boolean;
    IsSwiftPickCode?: boolean;
    SwiftPickServiceCodes?: Array<SwiftPickServiceCodeModel>;
    DrawTypeId?: string;
    DrawTypeDescription?: string;
    TimesUsed?: number;
    LastUsedDate?: Date;
    IconName?: string;
    LocationSpecificInfo?: Array<ServiceCodeLocationModel>;
    SetsToothAsMissing?: boolean;
    InactivationDate?: Date;
    InactivationRemoveReferences?: boolean;
    AmaDiagnosisCode?: string;
    CPT?: string;
    Modifier?: string;
    Modifications?: Array<any>;
    UseSmartCodes?: boolean;
    SmartCode1Id?: string;
    SmartCode2Id?: string;
    SmartCode3Id?: string;
    SmartCode4Id?: string;
    SmartCode5Id?: string;
    Fee?: number;
    TaxableServiceTypeId?: number;
    TaxableServiceTypeName?: string;
    isChecked?: boolean = false;
    DataTag?: string;
    DateModified?: string;
    PracticeId?: number;
    UserModified?: string;
    $$AffectedAreaName?: string;
    $$Dirty?: boolean;
    $$FeeString?: string;
    $$IsActiveName?: string;
    $$IsActiveNo?: boolean;
    $$IsActiveYes?: boolean;
    $$IsEligibleForDiscountName?: string;
    $$IsEligibleForDiscountNo?: boolean;
    $$IsEligibleForDiscountYes?: boolean
    $$OriginalAffectedAreaId?: string;
    $$SubmitOnInsuranceName?: string;
    $$SubmitOnInsuranceNo?: boolean;
    $$SubmitOnInsuranceYes?: boolean;
    $$UsuallyPerformedByProviderTypeName?: string;
    $$hashKey?: string;
    $$locationFee?: number;
    $$locationTaxableServiceTypeId?: number;
    $$serviceTransactionFee?: number;
    $$IconFileName?: string;
}

export class SwiftPickServiceCodeModel {
    SwiftPickServiceCodeId?: string;
    SwiftPickCodeId?: string;
    ServiceCodeId?: string;
    AffectedAreaId?: number;
    DisplayAs?: string;
    Code?: string;
    CdtCodeName?: string;
    Description?: string;
    UsuallyPerformedByProviderTypeId?: number;
    LocationSpecificInfo?: Array<ServiceCodeLocationModel>;
    DataTag?: string;
    DateModified?: string;
    UserModified?: string;
}

export class ServiceCodeLocationModel {
    ServiceCodeId?: string;
    LocationId?: number;
    Fee?: number;
    TaxableServiceTypeId?: number;
}

export class HeaderCategories {
    label?: string;
    show?: boolean;
    data?: string;
    field?: string;
    header?: Header[];
}

export class Header {
    label?: string;
    filters?: boolean;
    sortable?: boolean;
    sorted?: boolean;
    size?: string;
}

export class PreventiveServices {
    DataTag?: string;
    DateModified?: string;
    FailedMessage?: string;
    PreventiveServiceId?: string;
    PreventiveServiceTypeId?: string;
    ServiceCodeId?: string;
    UserModified?: string;
}

export class PreventiveLinkedServices extends PreventiveServices {
    Code?: string;
    Description?: string;
    InactivationDate?: Date;
    IsActive?: boolean
}

export class DrawTypes {
    AffectedAreaId?: number;
    DataTag?: string;
    DateModified?: string;
    Description?: string;
    DrawType?: string;
    DrawTypeId?: string;
    GroupNumber?: number;
    PathLocator?: string;
    PracticeId?: number;
    UserModified?: string;
}

export class ProviderTypes {
    Id?: number;
    Name?: string;
    Order?: number;
}

export class AffectedAreas {
    Id?: number;
    Name?: string;
    Order?: number;
}

export class TaxableServices {
    Id?: number;
    Name?: string;
    Order?: number;
}

export class ServiceCodesSorting {
    columnName?: string;
    asc: boolean = true;
}

export class ServiceCodeSearchInitialData {
    DrawTypes?: DrawTypes[];
    ServiceTypes?: ServiceTypes[];
    ServiceCodes: ServiceCodeModel[];
    TaxableServices?: TaxableServices[];
    AffectedAreas?: AffectedAreas[];
    ProviderTypes?: ProviderTypes[];
}

export class Accumulator {
    Name?: string;
    Field?: string;
    Label?: string;
    NewValue?: string;
    OldValue?: string;
    
}