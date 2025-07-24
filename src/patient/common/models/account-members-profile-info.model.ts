export interface AccountMembersProfileInfo {
    PatientId:                  string;
    FirstName:                  string;
    LastName:                   string;
    MiddleName:                 string;
    PreferredName:              string;
    SuffixName:                 string;
    DateOfBirth:                string;
    IsPatient:                  boolean;
    PhoneNumber:                string;
    IsResponsiblePerson:        boolean;
    IsActiveAccountMember:      boolean;
    RelationshipToPolicyHolder: string;
    IsActive:                   boolean;
    AddressReferrerId:          string;
    PatientCode:                string;
}
