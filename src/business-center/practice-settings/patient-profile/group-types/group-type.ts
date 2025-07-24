export class GroupType {
    DataTag?: string;
    DateModified?: string;
    GroupTypeName?: string;
    MasterPatientGroupId?: string;
    UserModified?: string;

    constructor(DataTag: string, DateModified: string, GroupTypeName: string, MasterPatientGroupId: string,
        UserModified: string) {
        this.DataTag = DataTag;
        this.DateModified = DateModified;
        this.GroupTypeName = GroupTypeName;
        this.MasterPatientGroupId = MasterPatientGroupId;
        this.UserModified = UserModified;
    }
}

export class PatientsWithGroupType{
    AddressReferrerId?: string;
    DateOfBirth?: string;
    FirstName?: string;
    IsActive?: boolean;
    IsActiveAccountMember?: boolean;
    IsPatient?: boolean;
    IsResponsiblePerson?: boolean;
    IsRxRegistered?: boolean;
    LastName?: boolean;
    MiddleName?: boolean;
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
        LastName: boolean,
        MiddleName: boolean,
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