import { Email } from './email.model';
import { PatientLocation } from './patient-location.model';
import { PersonAccount } from './person-account.model';
import { AppointmentPreview } from 'src/scheduling/common/models/appointment-preview.model';

export interface Patient {
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
    inactivePreferredDentist: boolean;
    preferredHygienist: string; // the display name and professional designation of the patient's preferred hygienist 
    inactivePreferredHygienist: boolean;
    NextAppointment: AppointmentPreview;
    nextAppointmentIsToday: boolean;
    HeightFeet?: number;
    HeightInches?: number;
    IsRxRegistered?: boolean;
    PrimaryDuplicatePatientId?: string;
    Weight?: string;
    ResponsibleParty?: boolean;    
    Value?: string;
}

// Patient Base Model
export class PatientDetailsBase implements Pick<Patient, 'PatientId' | 'IsActive' | 'IsPatient'> {
    PatientId: string;
    IsActive: boolean;
    IsPatient: boolean;
    PatientAccountId?: string;
    PatientDateOfBirth?: Date;
    PatientName?: string;
    PreviousAppointmentId?: string;
    PreviousAppointmentDate?: Date;
    PreviousAppointmentType?: string;
    LastCommunicationDate?: Date;
    ResponsiblePartyId?: string;
    ResponsiblePartyName?: string;
    PreviousAppointmentTimezone?: string;
}

// Patient Model
export class AllPatientDetails extends PatientDetailsBase {
    AppointmentStartTime?: Date;
    AppointmentEndTime?: Date;
    AppointmentDuration?: number;
    NextAppointmentId?: string;
    NextAppointmentDate?: Date;
    NextAppointmentStartTime?: Date;
    NextAppointmentEndTime?: Date;
    NextAppointmentDuration?: number;
    NextAppointmentType?: string;
    PreventiveCareDueDate?: Date;
    TreatmentPlanCount?: number;
    TreatmentPlanTotalBalance?: number;
    NextAppointmentTimezone?: string;
    HasUnreadCommunication?: boolean;
    UnreadSmsCount?: number;
    UnreadEmailCount?: number;
}

// Patient Preventive Care Model
export class PatientPreventiveCareDetails extends PatientDetailsBase {
    AppointmentStartTime?: Date;
    AppointmentEndTime?: Date;
    AppointmentDuration?: number;
    NextAppointmentId?: string;
    NextAppointmentDate?: Date;
    NextAppointmentStartTime?: Date;
    NextAppointmentEndTime?: Date;
    NextAppointmentDuration?: number;
    NextAppointmentType?: string;
    PreventiveCareDueDate?: Date;
    TreatmentPlanCount?: number;
    TreatmentPlanTotalBalance?: number;
    NextAppointmentTimezone?: string;
    HasUnreadCommunication?: boolean;
    UnreadSmsCount?: number;
    UnreadEmailCount?: number;
}

// Patient Treatment Plans model
export class PatientTreatmentPlansDetails extends PatientDetailsBase {
    AppointmentStartTime?: Date;
    AppointmentEndTime?: Date;
    AppointmentDuration?: number;
    NextAppointmentId?: string;
    NextAppointmentDate?: Date;
    NextAppointmentStartTime?: Date;
    NextAppointmentEndTime?: Date;
    NextAppointmentDuration?: number;
    NextAppointmentType?: string;
    PreventiveCareDueDate?: Date;
    TreatmentPlanId?: string;
    TreatmentPlanCount?: number;
    TreatmentPlanTotalBalance?: number;
    NextAppointmentTimezone?: string;
    HasUnreadCommunication?: boolean;
    UnreadSmsCount?: number;
    UnreadEmailCount?: number;
    TreatmentPlanScheduled?: boolean;
}

// Patient Appointment Model
export class PatientAppointmentDetails extends PatientDetailsBase {
    AppointmentId?: string;
    AppointmentDate?: Date;
    AppointmentStartTime?: Date;
    AppointmentEndTime?: Date;
    AppointmentDuration?: number;
    AppointmentStatus?: string;
    AppointmentType?: string;
    PreviousAppointmentStartTime?: Date;
    PreviousAppointmentEndTime?: Date;
    PreviousAppointmentDuration?: number;
    PreventiveCareDueDate?: Date;
    AppointmentTimezone?: string;
    DeletedReason?: string
    IsDeletedFromPatientFile?: boolean;
    HasUnreadCommunication?: boolean;
    UnreadSmsCount?: number;
    UnreadEmailCount?: number;
    Classification?: number;
}

// Patient Other To Do Model
export class PatientOtherToDoDetails extends PatientDetailsBase {
    PatientFirstName?: string;
    PatientLastName?: string;
    PatientCommunicationId?: number;
    DueDate?: Date;
    IsComplete?: boolean;
    Notes?: string;
    PreviousAppointmentStartTime?: Date;
    PreviousAppointmentEndTim?: Date;
    PreviousAppointmentDuration?: number;
    NextAppointmentId?: string;
    NextAppointmentDate?: Date;
    NextAppointmentStartTime?: Date;
    NextAppointmentEndTime?: Date;
    NextAppointmentDuration?: number;
    NextAppointmentType?: string;
    NextAppointmentTimezone?: string;
}

export class PatientAddressReferrer {
    AddressLine1:   string;
    AddressLine2:   string;
    City:           string;
    State:          string;
    ZipCode:        string;
}