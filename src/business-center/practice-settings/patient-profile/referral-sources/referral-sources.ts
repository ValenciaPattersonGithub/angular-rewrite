export class ReferralSource {
    DataTag?: string;
    DateModified?: string;
    PatientReferralSourceId?: string;
    SourceName?: string;
    UserModified?: string;


    constructor(DataTag: string, DateModified: string, PatientReferralSourceId: string, SourceName: string, UserModified: string) {
        this.DataTag = DataTag;
        this.DateModified = DateModified;
        this.PatientReferralSourceId = PatientReferralSourceId;
        this.SourceName = SourceName;
        this.UserModified = UserModified;
    }

}

export class PatientsWithSource {

    AddressReferrerId?: string;
    DateOfBirth?: string;
    FirstName?: string;
    IsActive?: boolean;
    IsActiveAccountMember?: boolean;
    IsPatient?: boolean;
    IsResponsiblePerson?: boolean;
    IsRxRegistered?: boolean;
    LastName?: string;
    MiddleName?: string;
    PatientCode?: string;
    PatientId?: string;
    PhoneNumber?: string;
    PreferredName?: string;
    PrimaryDuplicatePatientId?: string;
    RelationshipToPolicyHolder?: string;
    SuffixName?: string;

    constructor(AddressReferrerId: string,
        DateOfBirth: string,
        FirstName: string,
        IsActive: boolean,
        IsActiveAccountMember: boolean,
        IsPatient: boolean,
        IsResponsiblePerson: boolean,
        IsRxRegistered: boolean,
        LastName: string,
        MiddleName: string,
        PatientCode: string,
        PatientId: string,
        PhoneNumber: string,
        PreferredName: string,
        PrimaryDuplicatePatientId: string,
        RelationshipToPolicyHolder: string,
        SuffixName: string) {
        this.AddressReferrerId = AddressReferrerId;
        this.DateOfBirth = DateOfBirth;
        this.FirstName = FirstName;
        this.IsActive = IsActive;
        this.IsActiveAccountMember = IsActiveAccountMember;
        this.IsPatient = IsPatient;
        this.IsResponsiblePerson = IsResponsiblePerson;
        this.IsRxRegistered = IsRxRegistered;
        this.LastName = LastName;
        this.MiddleName = MiddleName;
        this.PatientCode = PatientCode;
        this.PatientId = PatientId;
        this.PhoneNumber = PhoneNumber;
        this.PreferredName = PreferredName;
        this.PrimaryDuplicatePatientId = PrimaryDuplicatePatientId;
        this.RelationshipToPolicyHolder = RelationshipToPolicyHolder;
        this.SuffixName = SuffixName;
    }
}