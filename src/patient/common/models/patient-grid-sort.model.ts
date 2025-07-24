export class PatientGridSortBase {
    PatientName?: number = 0;
    PreviousAppointmentDate?: number = 0;
    LastCommunicationDate?: number = 0;
    ResponsiblePartyName?: number = 0;
}

export class AllPatientGridSort extends PatientGridSortBase {
    PatientDateOfBirth?: number = 0;
    NextAppointmentDate?: number = 0;
    PreventiveCareDueDate?: number = 0;
    TreatmentPlanTotalBalance?: number = 0;
}

export class PreventiveGridSort extends PatientGridSortBase {
    PatientDateOfBirth?: number = 0;
    NextAppointmentDate?: number = 0;
    PreventiveCareDueDate?: number = 0;
    TreatmentPlanTotalBalance?: number = 0;
}

export class TreatmentGridSort extends PatientGridSortBase {
    PatientDateOfBirth?: number = 0;
    NextAppointmentDate?: number = 0;
    PreventiveCareDueDate?: number = 0;
    TreatmentPlanTotalBalance?: number = 0;
}

export class AppointmentGridSort extends PatientGridSortBase {
    AppointmentDate?: number = 0;
    AppointmentStatus?: number = 0;
    PatientDateOfBirth?: number = 0;
    PreventiveCareDueDate?: number = 0;
}

export class OtherToDoGridSort extends PatientGridSortBase {
    DueDate?: number = 0;
    NextAppointmentDate?: number = 0;
    TreatmentPlanTotalBalance?: number = 0;
    IsComplete?: number = 0;
}
