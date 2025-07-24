export interface Appointment {
    AppointmentId: string;
    AppointmentTypeId: string;
    PersonId: string;
    TreatmentRoomId: string;
    UserId: string;
    Classification: number;
    Description: string;
    Note: string;
    StartTime: string;
    EndTime: string;
    ActualStartTime: string;
    ActualEndTime: string;
    ProposedDuration: string;
    Status: number;
    StatusNote: string;
    ReminderMethod: string;
    ExaminingDentist: string;
    IsExamNeeded: boolean;
    ProviderAppointments: any[];
    PlannedServices: string;
    IsDeleted: string;
    IsBeingClipped: boolean;
    DeletedReason: string;
    IsSooner: boolean;
    IsPinned: boolean;
    LocationId: number;
    LocationTimezoneInfo: string;
    MissedAppointmentTypeId: string;
    DataTag: string;
    UserModified: string;
    DateModified: string;

    $$StartTimeLocal: string; /* this is used by some views. would be nice to rename this. TODO: rename this. */ 
    AppointmentDetails: any;
}
