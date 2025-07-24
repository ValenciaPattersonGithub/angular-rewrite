export class PatientEncounter {
    AccountMemberId: null;
    AdjustmentAmount: number;
    AreCreatingClaimOnCheckout: false;
    DataTag: string;
    Date: Date;
    DateModified: Date;
    Description: string;
    EncounterId: null;
    FailedMessage: string;
    ObjectState: 'None';
    Status: number;
    UserModified: string;
    isAdjustment: boolean;
    ServiceTransactionDtos: ServiceTransactionDto [];
}

export class EncounterDto {
    AccountMemberId: string = undefined;
    AreCreatingClaimOnCheckout: boolean = false;
    DataTag: string = '';
    Date: Date = undefined;
    DateModified: Date = undefined;
    Description: string = undefined;
    EncounterId: string = undefined;
    FailedMessage: string = '';
    ObjectState: string = '';
    Status: number = 0;
    UserModified: string = undefined;
    ServiceTransactionDtos: ServiceTransactionEstimateDto[] = [];
}

export class ServiceTransactionDto {
    DateEntered: Date;
    LocationId: number;
    Code: string;
    Description: string;
    CompleteDescription: string;
    ProviderUserId: string;
    ProviderName: string;
    Fee: number;
    EncounterId: null;
    DebitTransactionId: null;
    ServiceTransactionId: null;
    Discount: number;
    Tax: number;
    ServiceCodeId: string;
    TotalEstInsurance: number;
    TotalAdjEstimate: number;
    Balance: number;
    Amount: number;
    AdjustmentAmount: number;
    isAdjustment: boolean;
}

export class ServiceTransactionEstimateDto {
    AccountMemberId: string = undefined;    
    Amount: number = 0;
    AppointmentId?: string = null;  
    RelatedRecordId?: string = null;  
    DateCompleted?: Date = undefined;
    DateEntered: Date = undefined;
    Description: string = '';  
    Discount: number = 0;
    EncounterId?: string = null;  
    EnteredByUserId: string = undefined;  
    Fee: number = 0;
    PriorFee?: number = null;
    LocationId?: number = null;
    Note: string = '';  
    ProviderUserId?: string = null;  
    RejectedReason: string = '';  
    ServiceCodeId: string = undefined;  
    ServiceTransactionId: string = undefined;  
    ServiceTransactionStatusId: number = 0; 
    Surface: string = '';  
    SurfaceSummaryInfo: string = '';  
    Roots: string = '';  
    RootSummaryInfo: string = '';  
    Tax: number = 0;
    Tooth: string = '';  
    TransactionTypeId: string = undefined;  
    ObjectState: string = '';  
    FailedMessage: string = '';  
    Balance: number = 0;
    AgingDate: Date = undefined;
    ProposedAtLocationId?: string = null;  
    InsuranceEstimates: InsuranceEstimateDto[] = [];
    TotalEstInsurance: number = 0;
    TotalInsurancePaidAmount: number = 0;
    TotalAdjEstimate: number = 0;
    TotalAdjPaidAmount: number = 0;
    TotalUnpaidBalance: number = 0;
    CreatedDate?: Date = undefined;
    IsDeleted: boolean = false;
    IsBalanceAlreadyUpdated?: boolean = null;
    IsForClosingClaim?: boolean = null;
    PredeterminationHasResponse?: boolean = null;
    IsDiscounted: boolean = false;
    ProviderOnClaimsId: string = undefined;  
    IsOnInformedConsent: boolean = false;
    InsuranceOrder?: number = null;
    MasterDiscountTypeId?: string = null;  
    OldServiceTransactionId?: string = null;  
    AgingCategoryId: string = undefined;  
    BypassSnapshotQueue: boolean = false;
    OnClaimBeingClosed: boolean = false;
    ProposedProviderId?: string = null;  
    DataTag: string = '';  
    DateModified: Date = undefined;
    UserModified: string = undefined;
    ShowLedgerRowEditControl: boolean = true;
}

export class InsuranceEstimateDto {
    EstimatedInsuranceId: string = undefined; 
    AccountMemberId: string = undefined;  
    EncounterId: string = undefined;  
    ServiceTransactionId: string = undefined;  
    ServiceCodeId: string = undefined;  
    PatientBenefitPlanId: string = undefined;  
    Fee: number = 0;
    EstInsurance: number = 0;
    IsUserOverRidden: boolean = false;
    FamilyDeductibleUsed: number = 0;
    IndividualDeductibleUsed: number = 0;
    CalculationDescription: string = '';  
    CalcWithoutClaim: boolean = false;
    PaidAmount: number = 0;
    ObjectState: string = '';  
    FailedMessage: string = '';  
    AdjEst: number = 0;
    AdjPaid: number = 0;
    AreBenefitsApplied: boolean = false;
    IsMostRecentOverride: boolean = false;
    AllowedAmountOverride?: number = null;
    AllowedAmount?: number = null;
    DataTag: string = '';  
    DateModified: Date = undefined;
    UserModified: string = undefined;  
}

export class CreditTransaction {
    AccountId: string;
    AdjustmentTypeId: string;
    Amount: number;
    AppliedAmount: number;
    AssignedAdjustmentTypeId: 1;
    ClaimId: null;
    CreditTransactionDetails: any[];
    CreditTransactionId: string;
    DateEntered: Date;
    Description: string;
    EnteredByUserId: string;
    OriginalPosition: number;
    LocationId: number;
    Note: string;
    PaymentTypeId: string;
    PaymentTypePromptValue: string;
    PromptTitle: string;
    TransactionTypeId: number;
    ValidDate: boolean;
    FeeScheduleAdjustmentForEncounterId: null;
    IsFeeScheduleWriteOff: boolean;
    PatientBenefitPlan = null;
    PatientBenefitPlanId = null;
    RelatedCreditTransactionId = null;
    PaymentGatewayTransactionId = null;
    IsAuthorized: boolean;
    DataTag: string;
    UnassignedAmount: number;
    hasPriorBalanceAmounts: boolean;
}