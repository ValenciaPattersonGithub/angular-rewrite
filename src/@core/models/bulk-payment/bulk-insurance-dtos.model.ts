export class CarrierDto {
    CarrierId: string;
    LongLabel: string;
    Name: string;
    IsActive: boolean;
    PayerId: string;
    AddressLine1: string;
    AddressLine2: string;
    State: string;
    City: string;
    Zip: string;
    SearchType: string;
    PhoneNumbers:string[];
}

export class ClaimDto {
    ClaimId: string;
    expanded : boolean;
    MinServiceDate: Date;
    MaxServiceDate: Date;
    ProviderName: string;
    CarrierName: string;
    PrimaryClaim :boolean;
    Tooth: string;
    Surface: string;
    TotalCharges: number;
    AllowedAmount: number;
    TotalEstimatedInsurance: number;
    TotalEstInsuranceAdj: number;
    TotalPatientBalance: number;
    PaymentAmount: number;
    highlightAmountError: boolean;
    Status: string;
    Note: string;
    FinalPayment: boolean;
    $$servicesHaveErrors: boolean;
    ServiceTransactionToClaimPaymentDtos: ServiceTransactionToClaimPaymentDto[];
}

export class ServiceTransactionToClaimPaymentDto {
    ServiceTransactionToClaimId: string;
    ServiceTransactionId: string;
    ClaimId: string;
    DateEntered: string;
    Description: string;
    ProviderUserId: string;
    EncounterId: string;
    AccountMemberId: string;
    PatientName: string;
    ProviderName: string;
    Charges: number;
    InsuranceEstimate: number;
    AdjustedEstimate: number;
    OriginalInsuranceEstimate: number;
    PaidInsuranceEstimate: number;
    Balance: number;
    TotalInsurancePayments: number;
    PaymentAmount: number | null;
    AllowedAmount: number;
    Tooth: string | null;
    Surface: string | null;
    Roots: string | null;
    InsuranceOrder: number;
    DateServiceCompleted: string;
    EstimatedInsuranceId: string;
    DataTag: string | null;
    UserModified: string;
    DateModified: string;
    OriginalAllowedAmount: number;
    FeeScheduleId: string | null;
    FeeScheduleGroupId: string | null;
    FeeScheduleGroupDetailId: string | null;
    ServiceCodeId: string ;
    AllowedAmountOverride: number | null;
}

export class AllowedAmountOverrideDto { 
    ServiceTransactionId: string;
    EstimatedInsuranceId: string;
    AllowedAmount: number;
}

