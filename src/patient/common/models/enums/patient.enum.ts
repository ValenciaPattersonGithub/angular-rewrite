export enum PatientSlideout {
    SoonerIfPossible = 'SoonerIfPossible'
}

export enum SlideoutFilter {
    GroupTypes = 'GroupTypes',
    Insurance = 'Insurance',
    PreferredLocations = 'PreferredLocations',
    PreferredDentists = 'PreferredDentists',
    PreferredHygienists = 'PreferredHygienists',
    PatientLocationZipCodes = 'PatientLocationZipCodes',
    PreventiveCare = 'PreventiveCare',
    ReminderStatus = 'ReminderStatus',
    BirthMonths = 'BirthMonths',
    AdditionalIdentifiers = 'AdditionalIdentifiers',
    BusinessDays = 'BusinessDays',
    AppointmentStatusList = 'AppointmentStatusList',
    HasInsurance = 'HasInsurance',
    IsActive = 'IsActive',
    IsPatient = 'IsPatient',
    IsNoDueDate = 'IsNoDueDate',
    PreventiveCareIsScheduled = 'PreventiveCareIsScheduled',
    TreatmentPlanStates = 'TreatmentPlanStates',
    ZipCodes = 'ZipCodes',
    TreatmentPlanCreatedDate = 'Treatment Plan Create Date',
    TreatmentPlanName = 'Treatment Plan Name',
    TreatmentPlanStatus = 'Treatment Plan Status',
    PatientsNonPatients = 'Patients/Non-Patients',
    IsUnscheduled = 'IsUnscheduled',
    IsScheduled = 'IsScheduled',
    IsProposed = 'IsProposed',
    IsAccepted = 'IsAccepted',
    PatientTypeStatus = 'PatientTypeStatus',
    CreatedDateList = 'createdDateList',
    TreatmentPlan = 'TreatmentPlanName',
    TreatmentPlanProviders = 'TreatmentProviders',
    AppointmentDates = 'AppointmentDates',
    InsuranceFilter = 'InsuranceFilter',
    DueDateItems = 'DueDateItems',
    Providers = 'Providers',
    Rooms = 'Rooms',
    AppointmentTypes = 'AppointmentTypes',
    AppointmentBlocks = 'AppointmentBlocks',
    AppointmentState = 'AppointmentState',
    SoonerIfPossible = 'SoonerIfPossible',
    PastDue = 'PastDue',
    DueLess30 = 'DueLess30',
    Due30 = 'Due30',
    Due60 = 'Due60',
    DueOver90 = 'DueOver90',
    PreventiveIsScheduled = 'PreventiveIsScheduled',
    All = 'All',
    HasUnreadCommunication = 'HasUnreadCommunication',
    Completed = 'Completed',
    Patients = 'Patients',
    Active = 'Active',
    AppointmentStates = 'AppointmentStates',
    TreatmentPlanCreatedDateField = 'treatmentPlanCreatedDate',
    PlanCreatedDateRange = 'PlanCreatedDateRange',
    DueDate = 'DueDate',
    AppointmentStatusCancellation = '0|Cancellation',
    AppointmentStatusMissed = '1|Missed',
    AppointmentStatusConfirmed = '3',
    AppointmentStatusIsScheduled = 'true',
    AppointmentStatusIsUnscheduled = 'false',

}

export enum ActiveTemplateUrl {
    Overview = "App/Patient/patient-profile/patient-overview/patient-overview.html",
    Appointments = "App/Patient/patient-appointments/patient-appointments-tab.html",
    Clinical = "App/Patient/patient-chart/patient-chart.html",
    Summary = "App/Patient/patient-account/patient-account-options/patient-account-options.html",
    Communication = "App/Patient/communication-center/communication-center.html",
}

export enum CommunicationDrawer {
    TimelineDrawer = 1,
    ChartingDrawer = 2,
    TreatmentPlanDrawer = 3,
    NotesDrawer = 4,
    ReferralDrawer = 5
}

export enum OtherToDoColumnsFields {
    OtherLastAppt = 'otherLastAppt',
    NextAppt = 'nextAppt'
}

export enum CommonColumnsFields {
    LastAppt = 'lastAppt',
    NextAppt = 'nextAppt'
}

export enum AppointmentsColumnsFields {
    LastAppt = 'lastAppt',
    ApptDate = 'appointmentDate'
}

export enum PatientColumnsFields {
    LastAppt = 'lastAppt',
    NextAppt = 'nextAppt',
    ApptDate = 'appointmentDate',
    OtherLastAppt = 'otherLastAppt',
    DateofBirth = 'dob',
    Name = 'name',
    ResponsibleParty = 'responsibleParty',
    LastCommunication = 'lastCommunication',
    PreventiveCare = 'preventiveCare',
    DueDate = 'dueDate',
    Status = 'status',
    TreatmentPlan = 'treatmentPlans',
    Schedule = 'schedule',
}

export enum PatientBadgeTabType {
    Appointments = 'AppointmentTab',
    AllPatients = 'PatientTab',
    PreventiveCare = 'PreventiveCareTab',
    TreatmentPlans = 'TreatmentPlanTab',
    OtherToDo = 'OtherToDoTab',
}

export enum BadgeCSVFileName {
    Appointments = 'PM-Appointments',
    AllPatients = 'PM-All-Patients',
    PreventiveCare = 'PM-Preventive-Care',
    TreatmentPlans = 'PM-Treatment-Plans',
    OtherToDo = 'PM-Other-To-Do',
}

export enum GridTabList {
    AllPatients = 'All Patients List',
    PreventiveCare = 'Preventive Care',
    TreatmentPlans = 'Treatment Plans',
    Appointments = 'Appointments',
    OtherToDo = 'Other To Do List'
}

export enum CommunicationType {
    UsMail = 1,
    Postcard = 4
}

export enum MailingLabel {
    AllPatients = 'All Patients',
    Appointments = 'Appointments',
    OtherToDo = 'Other to do',
    PreventiveCare = 'Preventive Care',
    TreatmentPlans = 'Treatment Plans'
}

export enum LocationHash {
    PreventiveCare = 'preventivecare',
    TreatmentPlans = 'treatmentplans',
    OtherTodo = 'othertodo',
    Appointments = 'appointments',
    AllPatients = 'allpatients'
}


export enum PatientSortField {
    name = 'PatientName',
    dob = 'PatientDateOfBirth',
    responsibleParty = 'ResponsiblePartyName',
    lastAppt = 'PreviousAppointmentDate',
    nextAppt = 'NextAppointmentDate',
    preventiveCare = 'PreventiveCareDueDate',
    treatmentPlans = 'TreatmentPlanTotalBalance',
    lastCommunication = 'LastCommunicationDate',
    appointmentDate = 'AppointmentDate',
    status = 'AppointmentStatus',
    dueDate = 'DueDate',
    otherStatus = 'IsComplete',
    otherLastAppt = 'PreviousAppointmentDate'
}

export enum PatientSortOrder {
    asc = 'asc',
    desc = 'desc'    
}

export const PatientEmptyGuid = '00000000-0000-0000-0000-000000000000';
export const StartItemThirty = 30;
export const PostcardCount = 3
