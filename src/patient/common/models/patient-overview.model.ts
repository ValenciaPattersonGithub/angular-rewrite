import { Patient, PatientAddressReferrer } from './patient.model';
import { PatientLocation } from './patient-location.model';
import { PreventiveServicesDue } from './preventive-services-due.model';
import { MedicalHistoryAlert } from './medical-history-alert.model';
import { BenefitPlan } from './benefit-plan.model';
import { Phone } from './phone.model';
import { Email } from './email.model';
import { AccountMemberOverview } from './account-member-overview.model';
import { Location, Rooms } from 'src/business-center/practice-settings/location'
import { PersonAccount } from './person-account.model';
import { ServiceCodeModel } from 'src/business-center/service-code/service-code-model';
export interface PatientOverview {
    PatientId: string;
    Flags: PatientFlags[];
    MedicalHistoryAlerts: MedicalHistoryAlert[];
    ReferredPatients: any[];
    Profile: Patient;
    BenefitPlans: BenefitPlan[];
    PreventiveServicesDue: PreventiveServicesDue[];
    Phones: Phone[]; 
    Emails: Email[];
    ActiveTreatmentPlanCount: number;
    PatientLocations: PatientLocation[];
    PatientGroups: PatientGroups[];
    AccountMemberOverview: AccountMemberOverview;
    Updated?: boolean;
    ResponsiblePersonType?: number; 
    PatientCode?: string;
    IsActive?: boolean;
    IsPatient?: boolean;
    PersonAccount?: PersonAccount;
    imageUrl: string;
    hasImage: boolean;
}

export class PatientOverviewDetail implements Pick<Patient, 'PatientId' | 'FirstName' | 'MiddleName' |
    'LastName' | 'PreferredName' | 'Prefix' | 'Suffix' | 'AddressReferrerId' | 'AddressReferrer' |
    'AddressLine1' | 'AddressLine2' | 'City' | 'State' | 'ZipCode' | 'Sex' | 'DateOfBirth' |
    'IsPatient' | 'PatientSince' | 'PatientCode' | 'EmailAddress' | 'EmailAddressRemindersOk' | 'EmailAddress2' |
    'EmailAddress2RemindersOk' | 'ThirdPartyPatientId' | 'PersonAccount' | 'ResponsiblePersonType' | 'ResponsiblePersonId' |
    'ResponsiblePersonName' | 'IsResponsiblePersonEditable' | 'PreferredLocation' | 'PreferredDentist' |
    'PreferredHygienist' | 'IsActive' | 'IsSignatureOnFile' | 'EmailAddresses' |
    'DirectoryAllocationId' | 'MailAddressRemindersOK' | 'PatientLocations' | 'PrimaryDuplicatePatientId' | 'IsRxRegistered' |
    'HeightFeet' | 'HeightInches' | 'Weight' | 'DataTag' | 'UserModified' | 'DateModified' | 'ResponsibleParty'>,
    Pick<PatientOverview, 'Flags' | 'Phones' | 'Emails' | 'MedicalHistoryAlerts' | 'BenefitPlans'> {
    PatientId: string;
    FirstName: string;
    MiddleName: string;
    LastName: string;
    PreferredName: string;
    Prefix: string;
    Suffix: string;
    AddressReferrerId: string;
    AddressReferrer: PatientAddressReferrer;
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
    EmailAddress: string;
    EmailAddressRemindersOk: boolean;
    EmailAddress2: string;
    EmailAddress2RemindersOk: boolean;
    ThirdPartyPatientId: number;
    PersonAccount: PersonAccount;
    ResponsiblePersonType: number;
    ResponsiblePersonId: string;
    ResponsiblePersonName: string;
    IsResponsiblePersonEditable: boolean;
    PreferredLocation: number;
    PreferredLocationName: string;  //this value is populated after the data is loaded. - view model property
    PreferredDentist: string; // the UserId of the patient's preferred dentist, if they have one set 
    PreferredHygienist: string; // the UserId of the patient's preferred hygienist, if they have one set 
    IsActive: boolean;
    IsSignatureOnFile: boolean;
    EmailAddresses: Email[];
    DirectoryAllocationId: string;
    MailAddressRemindersOK: boolean;
    PatientLocations: PatientLocation[];
    DataTag: string;
    UserModified: string;
    DateModified: string;
    preferredDentist: string; // the display name and professional designation of the patient's preferred dentist 
    preferredHygienist: string; // the display name and professional designation of the patient's preferred hygienist 
    HeightFeet: number;
    HeightInches: number;
    IsRxRegistered: boolean;
    PrimaryDuplicatePatientId?: string;
    Weight: string;
    ResponsibleParty?: boolean;
    Groups: PatientGroups[];
    defaultExpandedPanel?: string;
    Flags: PatientFlags[];
    PrevCare: PreventiveServicesDue[];
    PrimaryLocation: Location[];
    MedicalHistoryAlerts: MedicalHistoryAlert[];
    BenefitPlans: BenefitPlan[];
    Phones: Phone[];
    Emails: Email[];
    prevCareDue?: string;
    nextPrev?: string;
}

export class PatientFlags {
    Description: string;
    ExpirationDate: string;
    FailedMessage: string;
    MasterAlertId: string;
    ObjectState: string;
    PatientAlertId: string;
    PatientId: string;
    SymbolId: string;
    UserModified: string;
    DataTag: string;
    DateModified: string;
    MedicalHistoryAlertTypeId: number;
}

export class PatientGroups {
    MasterGroupId: string;
    ObjectState: string;
    PatientGroupId: string;
    Description: string;
    PatientId: string;
    UserModified: string;
    DataTag: string;
    DateModified: string;
}

//#region Pending Encounters Model
export class PendingEncounters {
    $$authorizedForDeleteAtLocation?: boolean;
    $$authorizedForEditOrCheckoutAtLocation?: boolean;
    $$isMultiLocationEncounter?: boolean;
    $$locationId?: number;
    $$noEditOrCheckoutAccessTooltipMessage?: boolean;
    AccountMemberId: string;
    AdjustedAmount?: number;
    AdjustedAmountString: string;
    AllClaims: AccountSummaryClaim[];
    AllowedAmount?: number;
    AllowedAmountString: string;
    AlreadyPaidAmount?: number;
    Amount?: number;
    ApplyAdjustmentType?: number;
    AssociatedServiceTransactionIds: string;
    Balance?: number;
    Claims: AccountSummaryClaim[];
    DataTag: string;
    Date: string;
    Description: string;
    EncounterId?: string;
    EncounterServiceLocationIds: number[];
    EntityId?: string;
    EraTransactionSetHeaderId?: string;
    InsuranceEstimates: AccountSummaryInsuranceEstimate[];
    InsuranceOrder?: number;
    IsAppliedAcrossEncounters?: boolean;
    IsAssociatedEncounters: boolean;
    IsAuthorized?: boolean;
    IsBeta: boolean;
    IsDeposited?: boolean;
    IsFeeScheduleWriteOff?: boolean;
    IsSubmittableOnClaim?: boolean;
    LocationId?: number;
    NoteType?: number;
    ObjectId?: string;
    ObjectIdLong?: number;
    ObjectState?: string;
    ObjectType: string;
    PatientFirstName: string;
    PatientLastName: string;
    PatientMiddleName: string;
    PatientName: string;
    PatientPreferredName: string;
    PatientSuffix: string;
    PaymentTypeId?: string;
    PersonId?: string;
    ProviderUserId?: string;
    Root: string;
    ServiceCodeId?: string;
    ServicesHaveDifferentDates?: boolean;
    Surface?: string;
    Tooth: string;
    TotalAdjEstimate: number;
    TotalAdjPaidAmount: number;
    TotalEstInsurance: number;
    TotalInsurancePaidAmount: number;
    TotalUnpaidBalance: number;
    TransactionTypeId?: number;
    Type?: number;
    UnassignedAmount?: number;
    displayDate: string;
}

export class AccountSummaryClaim {
    ClaimId: string;
    LocationId: number;
    Type: number;
    BenefitPlanId: string;
    BenefitPlanName: string;
    PatientBenefitPlanPriority: number;
    Status: number;
    PatientName: string;
    TotalFees: number;
    ClaimCommonId: string;
    AssociatedServiceTransactionIds: string[];
    ServiceTransactionId: string;
    PatientBenefitPlanId: string;
    DataTag: string;
}

export class AccountSummaryInsuranceEstimate {
    EstInsurance: number;
    PaidAmount: number;
    AdjEst: number;
    AdjPaid: number;
    PatientBenefitPlanId: string;
    AllowedAmount?: number;
}
//#endregion

//#region patient-appointments Model
export class AppointmentOverview {
    AppointmentId: string;
    ActualStartTime?: string;
    StartTime?: string;
    EndTime?: string;
    ProposedDuration?: number;
    Status?: number;
    Classification?: number;
    LocationId?: string;
    PersonId: string;
    TreatmentRoomId?: string;
    ProviderId?: string;
    IsProviderValid: boolean;
    UserId?: string;
    ServiceCodes: ServiceCodeModel[];
    AppointmentType: AppointmentType;
    Patient: Pick<Patient, 'PatientId' | 'FirstName' | 'ResponsiblePersonId' | 'PersonAccount'>;
    Provider: ProviderDto;
    Location: Pick<Location, 'NameAbbreviation' | 'Timezone'>;
    Room: Pick<Rooms, 'Name'>;
    DataTag?: string;
    DateModified?: string;
}

export class AccountValidation {
    PatientId: string;
    PatientPrimaryLocationName: string;
    PatientPrimaryLocationPhone: string;
    UserIsAuthorizedToAtLeastOnePatientLocation: boolean;
}

export class AatientAppointmentActions {
    Function: () => {};
    Path: string;
    Text: string;
    Inactive: boolean;
    toolTip: string;
}

export class AppointmentType {
    Name: string;
    AppointmentTypeColor: string;
    FontColor: string;
}

export class ProviderDto {
    Name: string;
    IsActive: boolean;
    ProviderTypeId?: number;
}

//#endregion

//#region odontogram-snapshot Model
export class PatientOdontogram {
    OdontogramId: string;
    PatientId: string;
    SnapshotAllocationId?: number;
    SnapshotDateInvalidated?: string;
    SnapshotIsDirty: boolean;
    SnapshotUpdateQueued: boolean;
    Teeth: OdontogramTooth[];
    DataTag: string;
    DateModified: string;
    UserModified: string;
}

export class OdontogramTooth {
    ToothNumber: string;
    OrderedDrawItems: OdontogramDrawItem[];
}

export class OdontogramDrawItem {
    ItemTypeId: number;
    ItemId: string;
}
//#endregion

//#region patient-preventive-care Model
export class GraphData {
    moreThanThirtyBalance: number;
    moreThanSixtyBalance: number;
    moreThanNintyBalance: number;
    currentBalance: number;
    totalBalance: number;
    chartHeight: number;
    totalInsurance: number;
    totalPatientPortion: number;
}
//#endregion

//#region patient-account-latest-statement Model
export class AccountStatementDto {
    AccountStatementId: string;
    AccountId: string;
    DueDate?: string;
    FromDate: string;
    LocationId: number;
    FinanceCharge?: number;
    Message: string;
    AccountStatementData: string;
    BatchId?: string;
    SubmissionMethod?: number;
    PdfFormVersion?: string;
    EnteredByUserId: string;
    CreatedDate: string;
    TotalCharges: number;
    EstimatedInsurance: number;
    PatientPortion: number;
    ResponsiblePersonName: string;
    ApplyFinanceCharge: boolean;
    IsSelectedOnBatch: boolean;
    DueNow: number;
    TotalEstimates: number;
    Balance: number;
    FinanceChargeAmount: number;
    AccountReceivesFinanceCharges: boolean;
    StatementHistory: number;
}
//#endregion

export class ActiveTemplateModel {
    Area: string;
    Title: string;
    Url: string;
    TemplateUrl: string;
    Selected: boolean;
    amfa: string;
    IconClass?: string;
    ShowIcon?: boolean;
    IconRight?:boolean;
}