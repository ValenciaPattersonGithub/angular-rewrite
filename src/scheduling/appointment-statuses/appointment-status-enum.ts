// This link explains the very odd way of working with Enums in Typescript ... very weird so I want to save it.
//https://www.gurustop.net/blog/2016/05/24/how-to-use-typescript-enum-with-angular2/
export enum AppointmentStatusEnum {
    Unconfirmed = 0,
    ReminderSent = 1,
    Confirmed = 2,
    InReception = 6,
    Completed = 3,
    InTreatment = 4,
    ReadyForCheckout = 5,
    Late = 9,
    CheckOut = 10,
    StartAppointment = 11,
    Unschedule = 12,
    AddToClipboard = 13,
    Missed = 98,
    Cancelled = 99
}
