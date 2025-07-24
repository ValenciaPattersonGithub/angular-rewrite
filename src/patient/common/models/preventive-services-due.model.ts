export interface PreventiveServicesDue {
    PatientId: string;
    PreventiveServiceTypeId: string;
    PreventiveServiceTypeDescription: string;
    DateServiceDue: string;
    DateServiceLastPerformed: string;
    IsTrumpService: boolean;
    Frequency: number;
    AppointmentId: string;
    AppointmentStartTime: string;
    DaysSinceLast: number;
    DaysUntilDue: number;
    PercentTimeRemaining: number;
}