
export class PatientGridFilter {
    LocationId?: number;
    PatientName?: string;
    PatientDateOfBirthFrom?: Date;
    PatientDateOfBirthTo?: Date;
    PreviousAppointmentDateFrom?: Date;
    PreviousAppointmentDateTo?: Date;
    LastCommunicationFrom?: Date;
    LastCommunicationTo?: Date;
    ResponsiblePartyName?: string;
    PreferredDentists?: string[];
    PreferredHygienists?: string[];
    IsPatient?: string[];
    IsActive?: string[];
    AdditionalIdentifiers?: string[];
    GroupTypes?: string[];
    LastCommunicationDate?: Date;
}

export class AllPatientGridFilter extends PatientGridFilter {
    AppointmentStatusList?: string[];
    DeletedReason?: string[];
    AppointmentStatus?: number;
    NextAppointmentDateFrom?: Date;
    NextAppointmentDateTo?: Date;
    TreatmentPlanCountTotalFrom?: number;
    TreatmentPlanCountTotalTo?: number;
    PreventiveCareDueDateFrom?: Date;
    PreventiveCareDueDateTo?: Date;
    BusinessDays?: number[];
    PreferredLocation?: number[];
    ReminderStatus?: number[];
    TreatmentPlanStates?: string[];
    ZipCodes?: string[];
    IsScheduled?: string[];
    PreventiveCareIsScheduled?: string[];
    IsNoDueDate?: string[];
    HasUnreadCommunication?: boolean;
    BirthMonths?: string[];
    HasInsurance?: string[];
    TreatmentPlanTotalBalance?: string;
    NextAppointmentDate?: Date;
    PatientDateOfBirth?: Date;
    PreventiveCareDueDate?: Date;
    PreviousAppointmentDate?: Date;
}

export class PreventiveCareGridFilter extends PatientGridFilter {
    PreventiveCareDueDateTo?: Date;
    NextAppointmentDateFrom?: Date;
    NextAppointmentDateTo?: Date;
    TreatmentPlanCountTotalFrom?: number;
    TreatmentPlanCountTotalTo?: number;
    PreventiveCareDueDateFrom?: Date;
    PreventiveCareIsScheduled?: boolean[];
    HasUnreadCommunication?: boolean;
    DueLess30?: string;
    Due30?: string;
    Due60?: string;
    DueOver90?: string;
    DueInFuture?: string;
    NextAppointmentDate?: string;
    PatientDateOfBirth?: string;
    PreventiveCareDueDate?: string;
    PreviousAppointmentDate?: string;
    TreatmentPlanTotalBalance?: string;
}

export class TreatmentPlansGridFilter extends PatientGridFilter {
    NextAppointmentDateFrom?: Date;
    NextAppointmentDateTo?: Date;
    TreatmentPlanCountTotalFrom?: number;
    TreatmentPlanCountTotalTo?: number;
    PreventiveCareDueDateFrom?: Date;
    PreventiveCareDueDateTo?: Date;
    IsUnscheduled?: string;
    IsScheduled?: string;
    IsProposed?: string;
    IsAccepted?: string;
    TreatmentProviders?: string[];
    TreatmentPlanName?: string[];
    PlanCreatedDateRange?: string[];
    HasUnreadCommunication?: boolean;
    NextAppointmentDate?: string;
    PatientDateOfBirth?: string;
    PreventiveCareDueDate?: string;
    PreviousAppointmentDate?: string;
    TreatmentPlanTotalBalance?: string;
}

export class AppointmentGridFilter extends PatientGridFilter {
    AppointmentDateFrom?: Date;
    AppointmentDateTo?: Date;
    AppointmentState?: string[];
    AppointmentStatus?: string;
    AppointmentBlocks?: string[];
    AppointmentDate?: string[];
    AppointmentStatusList?: string[];
    AppointmentTypes?: string[];
    BusinessDays?: string[];
    IsScheduled?: string[];
    PatientDateOfBirth: "";//Todo: Data type and date format need to check while implementation
    PreventiveCareDueDateFrom?: Date;
    PreventiveCareDueDateTo?: Date;
    Providers?: string[];
    Rooms?: string[];
    HasUnreadCommunication?: boolean;
    SoonerIfPossible?: string[];
}

export class OtherToDoGridFilter extends PatientGridFilter {
    AppointmentStatusList?: number[];
    DeletedReason?: string[];
    AppointmentStatus?: number[];
    NextAppointmentDateFrom?: Date;
    NextAppointmentDateTo?: Date;
    TreatmentPlanCountTotalFrom?: number;
    TreatmentPlanCountTotalTo?: number;
    DueDateFrom?: Date;
    DueDateTo?: Date;
    IsComplete?: string;
    DueDateItems?: string[];
    DueDate?: string;
    PreviousAppointmentDate?: string;
    NextAppointmentDate?: string;
}

//TODO: need to remove this Filter if not required
export class DateRangeFilterTypes extends AllPatientGridFilter {
    DueDateFrom?: Date;
    DueDateTo?: Date;
    AppointmentDateFrom?: Date;
    AppointmentDateTo?: Date;
}

export class NumericRangeFilterTypes {
    TreatmentPlanCountTotalFrom?: number;
    TreatmentPlanCountTotalTo?: number;
}

export enum DateRangeFilterType {
    DateOfBirth = 'dob',
    LastAppointment = 'lastAppt',
    OtherToDoLastAppointment = 'otherLastAppt',
    NextAppointment = 'nextAppt',
    PreventiveCare = 'preventiveCare',
    LastCommunication = 'lastCommunication',
    DueDate = 'dueDate',
    Appointments = 'appointmentDate'
}

export enum TextFilterType {
    Name = 'name',
    ResponsibleParty = 'responsibleParty',
    Patient = 'patient',
    Status = 'otherStatus',
}

export enum ContactDetails {
    ExcludeContact = 0,
    IncludeContact = 1,
}

export class ExpandStateArray{
    Index: number;
    IsExpanded: boolean; 
}
