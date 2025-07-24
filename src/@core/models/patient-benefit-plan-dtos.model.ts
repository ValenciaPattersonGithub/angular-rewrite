export class PatientBenefitPlanDto {
    PatientBenefitPlanId: string;
    PolicyHolderId: string;
    PatientId: string;
    BenefitPlanId: string;
    PolicyHolderBenefitPlanId: string;
    PolicyHolderStringId: string;
    RelationshipToPolicyHolder: string;
    DependentChildOnly: boolean = false;
    EffectiveDate: Date;
    IndividualDeductibleUsed: number;
    IndividualMaxUsed: number;
    Priority: number;
    EligibleEPSDTTitleXIX: boolean = false;
    ObjectState: string;
    FailedMessage: string;
    IsDeleted: boolean = false;
    AdditionalBenefits: number;
    MemberId: string;
}

export class PatientBenefitPlanLiteDto {
    PatientBenefitPlanId: string;    
    PatientId: string;
    BenefitPlanId: string;
    PolicyHolderBenefitPlanId: string;
    Priority: number;
    CarrierName: string;
    PlanName: string;
    IsDeleted: boolean = false;
    // Non-DTO / Component
    label: string;
    PriorityLabel: string;
}