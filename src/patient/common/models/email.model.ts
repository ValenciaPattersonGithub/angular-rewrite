export interface Email {
    PatientId: string;
    PatientEmailId: string;
    Email: string;
    ReminderOK: boolean;
    IsPrimary: boolean;
    AccountEmailId?: string;
    AccountEMail: Email;
    Links: Email[];
    ObjectState: string;
    FailedMessage: string;
    DataTag: string;
    UserModified: string;
    DateModified: string;
}