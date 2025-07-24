export interface AppointmentPreview {
    // Appointment ID
    // comes from the api
    AppointmentId: string,

    // Start Time for the appointment, in UTC
    // comes from the api
    StartTime: string,

    // Provider's UserID on the appointment, if any
    // comes from the api
    UserId: string,

    // ID of the location at which the appointment is scheduled
    // comes from the api
    LocationId: number

    // yes, this is a dumb name. 
    // this is set in the UI after handling the api response
    $$StartTimeLocal: string

    // the display name of the provider on this appointment
    // formatted like: F. LastName Dentist
    nextAppointmentProviderDisplayName: string    
}
