import { InsuranceEstimateDto } from "src/accounting/encounter/models/patient-encounter.model";

export interface PatientAlert {
    PatientAlertId: string;
    MasterAlertId: string;
    PatientId: string;
    Description: string;
    SymbolId: string;
    ExpirationDate: string | null;
    ObjectState: any; 
    FailedMessage: string | null;
    DataTag: string;
    UserModified: string;
    DateModified: string;
}

export interface Profile {
    PatientId: string;
    FirstName: string;
    MiddleName: string;
    LastName: string;
    PreferredName: string;
    Prefix: string | null;
    Suffix: string;
    AddressReferrerId: string | null;
    AddressReferrer: any; 
    AddressLine1: string;
    AddressLine2: string;
    City: string;
    State: string;
    ZipCode: string;
    Sex: string;
    DateOfBirth: string;
    IsPatient: boolean;
    PatientSince: string;
    PatientCode: string;
    EmailAddress: string | null;
    EmailAddressRemindersOk: boolean;
    EmailAddress2: string | null;
    EmailAddress2RemindersOk: boolean;
    ThirdPartyPatientId: number;
    PersonAccount: any;
    ResponsiblePersonType: number;
    ResponsiblePersonId: string | null;
    ResponsiblePersonName: string | null;
    IsResponsiblePersonEditable: boolean;
    PreferredLocation: number;
    PreferredDentist: string;
    PreferredHygienist: string | null;
    IsActive: boolean;
    IsSignatureOnFile: boolean;
    EmailAddresses: any[];
    DirectoryAllocationId: string;
    MailAddressRemindersOK: boolean;
    PatientLocations: any[];
    IsRxRegistered: boolean;
    HeightFeet: number;
    HeightInches: number;
    Weight: string;
    DataTag: string;
    UserModified: string;
    DateModified: string;
}

export interface PatientBenefitPlan {
    PatientBenefitPlanId: string;
    PolicyHolderId: string;
    PatientId: string;
  
}

export interface PreventiveService {
    PatientId: string;
    PreventiveServiceTypeId: string;
    PreventiveServiceTypeDescription: string;
    DateServiceDue: string | null;
    DateServiceLastPerformed: string | null;
    IsTrumpService: boolean;
    Frequency: number;
    AppointmentId: string | null;
    AppointmentStartTime: string | null;
    DaysSinceLast: number | null;
    DaysUntilDue: number | null;
    PercentTimeRemaining: number | null;
}

export interface Phone {
    PatientId: string;
    ContactId: string;
    PhoneNumber: string;
    Type: string;
    TextOk: boolean;
    ReminderOK: boolean;
    Notes: string | null;
    IsPrimary: boolean;
    ObjectState: string;
    FailedMessage: string | null;
    PhoneReferrerId: string | null;
    PhoneReferrerName: string | null;
    PhoneReferrer: any; 
    Links: any[];
    DataTag: string;
    UserModified: string;
    DateModified: string;
}

export interface Email {
    PatientId: string;
    PatientEmailId: string;
    Email: string;
    ReminderOK: boolean;
    IsPrimary: boolean;
    AccountEmailId: string | null;
    AccountEMail: any;
    Links: any[];
    ObjectState: string;
    FailedMessage: string | null;
    DataTag: string;
    UserModified: string;
    DateModified: string;
}

export interface PatientLocation {
    PatientLocationId: number;
    PatientId: string;
    LocationId: number;
    IsPrimary: boolean;
    PatientActivity: boolean;
    ObjectState: string;
    FailedMessage: string | null;
    LocationName: string;
    DataTag: string;
    UserModified: string;
    DateModified: string;
}

export interface PatientData {
    PatientId: string;
    Flags: PatientAlert[];
    MedicalHistoryAlerts: any[] | null; 
    ReferredPatients: any[]; 
    Profile: Profile;
    BenefitPlans: PatientBenefitPlan[];
    PreventiveServicesDue: PreventiveService[];
    PhoneNumbers: Phone[];
    Emails: Email[];
    PatientLocations: PatientLocation[];
}




export interface ClaimEntity {
    ClaimEntityId: string;
    ClaimId: string;
    LocationId: number;
    AccountMemberId: string;
    PatientId: string;
    PatientName: string;
    AccountId: string;
    ProviderId: string;
    ProviderName: string;
    CarrierId: string;
    BenefitPlanId: string;
    CarrierName: string;
    PrimaryClaim: boolean;
    Type: number;
    MinServiceDate: Date;
    MaxServiceDate: Date;
    DisplayDate: string;
    ServiceTransactionToClaimPaymentDtos: ServiceTransactionToClaimPaymentDto[];
    ApplyInsurancePaymentBackToPatientBenefit: boolean;
    RecreateClaim: boolean;
    Status: number;
    IsReceived: boolean;
    TotalCharges: number;
    TotalEstimatedInsurance: number;
    TotalEstInsuranceAdj: number;
    TotalPatientBalance: number;
    PaymentAmount: number | null;
    FinalPayment: boolean;
    AllowedAmount: number;
    ClaimEntityDataTag: string;
    DataTag: string | null;
    UserModified: string;
    DateModified: Date;
    InsuranceEstimate: number;
    Charges: number;
    AdjustedEstimate: number;
    Balance: number;
}


export interface SelectedPaymentType {
    PaymentTypeId: string;
    Description: string;
    Prompt: string;
    CurrencyTypeId: number;
    PaymentTypeCategory: number;
    IsActive: boolean;
    DataTag: string;
    UserModified: string;
    DateModified: string;
}


// Define interface for AdditionalIdentifier
interface AdditionalIdentifier {
    LocationIdentifierId: string;
    LocationId: number;
    MasterLocationIdentifierId: string;
    Value: string;
    Description: string;
    PracticeId: number;
    DateModified: string;
    UserModified: string;
    DataTag: any;
}

export interface ServiceTransactionToClaimPaymentDto {
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

export interface FinalPaymentChange {
    ClaimEntityId: string;
    ClaimId: string;
    LocationId: number;
    AccountMemberId: string;
    PatientId: string;
    PatientName: string;
    AccountId: string;
    ProviderId: string;
    ProviderName: string;
    CarrierId: string;
    BenefitPlanId: string;
    CarrierName: string;
    PrimaryClaim: boolean;
    Type: number;
    MinServiceDate: Date;
    MaxServiceDate: Date;
    DisplayDate: string;
    ServiceTransactionToClaimPaymentDtos: ServiceTransactionToClaimPaymentDto[];
    ApplyInsurancePaymentBackToPatientBenefit: boolean;
    RecreateClaim: boolean;
    Status: number;
    IsReceived: boolean;
    TotalCharges: number;
    TotalEstimatedInsurance: number;
    TotalEstInsuranceAdj: number;
    TotalPatientBalance: number;
    PaymentAmount: number | null;
    FinalPayment: boolean;
    AllowedAmount: number;
    ClaimEntityDataTag: string;
    DataTag: string | null;
    UserModified: string;
    DateModified: string;
    InsuranceEstimate: number;
    Charges: number;
    AdjustedEstimate: number;
    Balance: number;
}

export interface InsurancePaymentFilter {
    DateEntered: Date;
    BulkCreditTransactionType: number;
    Carrier?: string;
    InsurancePaymentTypeId?: string;
    PaymentTypePromptValue?: string;
    Note?: string;
    PayerId?: string;
    EraId?: string;
    Locations?: string[];
    Amount: number;
    PaymentGatewayTransactionId?: number;
}

export interface InsurancePaymentDto {
    Amount: number,
    DateEntered: Date;
    InsurancePaymentTypeId: string,
    Note: string,
    BulkCreditTransactionType: number,
    PaymentTypePromptValue: number,
    AccountId: string,
    UpdatedEstimates: InsuranceEstimateDto[],
}

export interface InsurancePaymentBreadCrumbDto {
    FirstLocation: boolean,
    FirstLocationName: string,
    FirstLocationRoute: string,
    PrevLocation: string,
    PreviousLocationName: string,
    PreviousLocationRoute: string    
}

export interface BulkCreditTransactionDto {
    BulkCreditTransactionId: string;
    CarrierId?: string;
    LocationId: number;
    EnteredByUserId: string;
    DateEntered: Date;
    PaymentTypeId: string;
    PaymentTypePromptValue: string;
    IsAuthorized: boolean;
    IsDeposited: boolean;
    DepositId?: string;
    Note: string;
    CreditTransactions: CreditTransactionDto[];
    BulkCreditTransactionType: number;
    PaymentGatewayTransactionId?: number;
    EraHeaderId?: number;
    PayerId: string;
    PayerBulkCreditTransactionId: string;
}

export interface CreditTransactionDto{
    CreditTransactionId: string,
    AccountId: string,
    AdjustmentTypeId?: string,
    Amount: number,
    DateEntered: Date,
    Description: string,
    PaymentTypePromptValue: string,
    EnteredByUserId: string,
    Note: string,
    PaymentTypeId: string,
    TransactionTypeId: number,
    CreditTransactionDetails: CreditTransactionDetailDto[],
    IsDeleted: boolean,
    IsAllAccountMembersSelected: boolean,
    IsApplyNegativeAdjustmentForCloseClaim: boolean,
    IsFeeScheduleWriteOff: boolean,
    PaymentGatewayTransactionId?: number,
    IsAuthorized: boolean,
    IsDeposited: boolean,
    DepositId?: string,
    HasSplitPayment: boolean,
    BulkCreditTransactionId?: string,
    ClaimId?: string,
    PatientBenefitPlanId?: string,
    IsCollectedAtCheckOut: boolean,
    IsOnlyChild: boolean,
    EraTransactionSetHeaderId?: string,
    ClaimCommonId?: string,
    ReceiptEntryLegend: string,
    ReceiptEntryMethod: string,
    ReceiptApprovalCode: string,
    ReceiptApplicationCryptogram: string,
    ReceiptApplicationTransactionCounter: string,
    ReceiptApplicationIdentifier: string,
    ReceiptApplicationPreferredName: string,
    ReceiptTerminalVerificationResults: string,
    ReceiptTransactionStatusInformation: string,
    ReceiptAuthorizationResponseCode: string,
    ReceiptTransactionReferenceNumber: string,
    ReceiptValidationCode: string,
    DateCompleted: Date,
    CanEditAtAllLocations: boolean,
    RelatedRecordId?: string,
    ImpactType: string
}
 
export interface CreditTransactionDetailDto {
    CreditTransactionDetailId: string,
    AccountMemberId: string,
    Amount: number,
    AppliedToServiceTransationId?: string,
    CreditTransactionId: string,
    DateEntered: Date,
    EncounterId?: string,
    ProviderUserId?: string,
    AppliedToDebitTransactionId?: string,
    IsDeleted: boolean,
    ObjectState: string,
    FailedMessage: string,
    AllAccountMembersSelected: boolean,
    AppliedLocationId?: number,
    DateCompleted?: Date,
    FromUpdate: boolean,
    ServiceTransactionDataTag: string,
    DebitTransactionDataTag: string
}

export class ClaimEntityDto {
    ClaimEntityId: string;
    ClaimId: string;
    LocationId: number;
    AccountMemberId: string;
    PatientId: string;
    PatientName: string;
    AccountId: string;
    ProviderId: string;
    ProviderName: string;
    CarrierId: string;
    BenefitPlanId: string;
    CarrierName: string;
    PrimaryClaim: boolean;
    Type: number;
    MinServiceDate: Date;
    MaxServiceDate: Date;
    DisplayDate: string;
    ServiceTransactionToClaimPaymentDtos: ServiceTransactionToClaimPaymentDto[];
    ApplyInsurancePaymentBackToPatientBenefit: boolean;
    RecreateClaim: boolean;
    Status: number;
    IsReceived: boolean;
    TotalCharges: number;
    TotalEstimatedInsurance: number;
    TotalEstInsuranceAdj: number;
    TotalPatientBalance: number;
    PaymentAmount: number | null;
    FinalPayment: boolean;
    AllowedAmount: number;
    ClaimEntityDataTag: string;
    DataTag: string | null;
    UserModified: string;
    DateModified: Date;
}

export class OrignalInsuranceEstimateDto {
    ServiceTransactionId: string;  
    AdjustedEstimate: number;
    InsuranceEstimate: number;
    PaidInsuranceEstimate: number;
    AllowedAmount: number;
    OriginalInsuranceEstimate: number;
}


