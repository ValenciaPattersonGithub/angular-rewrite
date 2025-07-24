export interface Phone {
    PatientId: string;
    ContactId: string;
    PhoneNumber: string;
    Type: string;
    TextOk: boolean;
    ReminderOK: boolean;
    Notes: string;
    IsPrimary: boolean;
    ObjectState: string;
    FailedMessage: string;
    PhoneReferrerId: string;
    PhoneReferrer: PatientPhoneReferrer;
    Links: string;
    DataTag: string;
    UserModified: string;
    DateModified: string;
}

export class PatientPhoneReferrer {
    PhoneNumber:        string;
    Type:               string;
    ContactId:          string;
    PatientId:          string;
}