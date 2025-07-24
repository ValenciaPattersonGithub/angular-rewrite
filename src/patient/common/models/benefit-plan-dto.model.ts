import { Carrier } from './carrier.model';

export interface BenefitPlanDto {
    BenefitId: string;
    CarrierId: string;
    FeeScheduleId?: string;
    Name: string;
    AddressLine1?: string;
    AddressLine2?: string;
    City: string;
    State: string;
    ZipCode: string;
    PhoneNumbers: string[];
    Website: string;
    Email: string;
    PlanGroupNumber: string;
    PlanGroupName: string;
    RenewalMonth: number;
    CoverageList: BenefitCoverageDto[];
    ServiceCodeExceptions: ServiceCodeException[];
    Carrier: Carrier;
    AlternativeBenefits: AlternativeBenefit[];
    IndividualDeductible: number;
    FamilyDeductible: number;
    AnnualBenefitMaxPerIndividual: number;
    SubmitClaims: boolean;
    ClaimMethod: number;
    TrackClaims?: boolean;
    ApplyAdjustments?: number;
    FeesIns?: number;
    AuthorizePaymentToOffice: boolean;
    BenefitClause: boolean;
    TaxPreference: number;
    InsurancePaymentTypeId?: string;
    AdjustmentTypeId?: string;
    Notes?: string;
    SecondaryCalculationMethod: number;
    CarrierName: string;
    BillingLocationAdditionalIdentifierId?: string;
    ServiceLocationAdditionalIdentifierId?: string;
    AdditionalProviderAdditionalIdentifierId?: number;
    TaxCalculation: number;
    TaxAssignment: number;
    IsActive: boolean;
    IsLinkedToPatient: boolean;
    DataTag: string;
    UserModified: string;
    DateModified: string;
    PatientHasPlan?: boolean;
}

export class BenefitCoverageDto {
    BenefitCoverageId: string;
    BenefitPlanId: string;
    ServiceTypeId: string;
    Copay: number;
    CoveragePercent: number;
    Deductible: boolean;
    ObjectState: string;
    FailedMessage: string;
}

export class ServiceCodeException {
    ServiceCodeExceptionId: number;
    CdtCodeName: string;
    Description: string;
    BenefitPlanId: string;
    ServiceCodeId: string;
    Copay: number;
    CoveragePercent: number;
    Deductible: boolean;
    ObjectState: string;
    FailedMessage: string;
}

export class AlternativeBenefit {
    AlternativeBenefitId: number;
    BenefitPlanId: string;
    ParentServiceCodeId: string;
    ChildServiceCodeId: string;
    ObjectState: string;
    FailedMessage: string;
}