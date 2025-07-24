import { LocationDto } from 'src/@core/models/location/location-dto.model';
import { Address } from 'src/patient/common/models/address.model';
import { Location } from 'src/business-center/practice-settings/location';

export class DepartmentTypes {
    DepartmentId?: number;
    Name?: string;
    Order?: number;
    DataTag?: string;
    DateModified?: string;
    UserModified?: string;
}

export class Roles {
    ApplicationId?: number;
    DataTag?: string;
    DateModified?: string;
    PracticeId?: number;
    RoleDesc?: string;
    RoleId?: number;
    RoleName?: string;
    UserModified?: string;
}

export class TeamMemberCrud {
    User?: User;
    PracticeRoles?: {}
    LocationRoles?: {};
    UserVerificationType?: number;

    constructor(User: User, PracticeRoles: {}, LocationRoles: {}, UserVerificationType: number) {
        this.User = User;
        this.PracticeRoles = PracticeRoles;
        this.LocationRoles = LocationRoles;
        this.UserVerificationType = UserVerificationType;
    }
}

export class User {
    Address?: Address;
    AnesthesiaId?: string;
    Color?: string;
    DateOfBirth?: Date;
    DeaNumber?: string;
    DepartmentId?: string;
    Email?: string;
    EmployeeEndDate?: Date;
    EmployeeStartDate?: Date;
    FederalLicense?: string;
    FirstName?: string;
    ImageFile?: string;
    IsActive?: boolean;
    JobTitle?: string;
    LastName?: string;
    Locations?: Array<Location>; // not used while add team member
    MiddleName?: string;
    NpiTypeOne?: string;
    ProviderTypeId?: number;
    PreferredName?: string;
    PrimaryTaxonomyId?: number;
    ProfessionalDesignation?: string;
    Roles?: Array<UserLocationRoles>; // not used while add team member
    RxUserType?: number;
    ShowCardServiceDisabledMessage?: boolean; // not used while add team member
    SecondaryTaxonomyId?: number;
    StateLicense?: string;
    StatusChangeNote?: string;
    SuffixName?: string; // not used while add team member
    TaxId?: string;
    UserCode?: string; // not used while add team member
    UserId?: string; // not used while add team member    
    $$UserPracticeRoles?: Array<UserLocationRoles>;
    UserName?: string;
    ProviderOnClaimsRelationship?: number;
    UserModified?: string;
    DateModified?: Date;
    $$isPracticeAdmin?: boolean;
    $$selectedPracticeRoles?: UserLocationRoles[];
    $$locations?: [];
    $$scheduleStatuses?: Array<ScheduleStatuses>;
    DentiCalPin?: string;
    $$originalStateLicenses?: Array<StateLicense>;
    DepartmentName?: string;
    ProviderTypeName?: string;
}

export class UserLocationSetup {

    Color?: string;
    DataTag?: string;
    DateModified?: string;
    FailedMessage?: string;
    IsActive?: boolean;
    IsLocumDentist?: boolean;
    LocationId?: number;
    ObjectState?: string;
    ProviderOnClaimsId?: string;
    ProviderOnClaimsRelationship?: number;
    ProviderQualifierType?: number;
    ProviderTypeId?: number;
    UserId?: string;
    UserModified?: string;
    UserProviderSetupLocationId?: string;

    $$UserLocationRoles?: Array<UserLocationRoles>;
    $$userLocationSetups?: [{ RoleId?: number }];
    $$CanRemoveLocation?: boolean;
    $$Location?: LocationDto;
    $$ProviderTypeName?: string;
    $$ProviderOnClaims?: string;
    $$ProviderQualifierTypeName?: string;

    constructor(Color?: string, DataTag?: string, IsActive?: boolean, LocationId?: number, ObjectState?: string,
        ProviderOnClaimsId?: string, ProviderOnClaimsRelationship?: number, ProviderQualifierType?: number,
        ProviderTypeId?: number, UserId?: string, $$UserLocationRoles?: Array<UserLocationRoles>, IsLocumDentist?: boolean) {
        this.Color = Color;
        this.DataTag = DataTag;
        this.IsActive = IsActive;
        this.IsLocumDentist = IsLocumDentist;
        this.LocationId = LocationId;
        this.ObjectState = ObjectState;
        this.ProviderOnClaimsId = ProviderOnClaimsId;
        this.ProviderOnClaimsRelationship = ProviderOnClaimsRelationship;
        this.ProviderQualifierType = ProviderQualifierType;
        this.ProviderTypeId = ProviderTypeId;
        this.UserId = UserId;
        this.$$UserLocationRoles = $$UserLocationRoles;
    }
}

export class providerTypes {
    Id?: number;
    Name?: string;
}

export class RxUser {
    UserId?: string;
    UserType?: string;
    FirstName?: string;
    MiddleName?: string;
    LastName?: string;
    Suffix?: string;
    Gender?: string;
    Address1?: string;
    Address2?: string;
    City?: string;
    State?: string;
    PostalCode?: string;
    ApplicationId?: string;
    DEANumber?: string;
    DateOfBirth?: Date;
    Email?: string;
    Fax?: string;
    NPINumber?: string;
    Phone?: string;
    LocationIds?: Array<number>;

    constructor(userId: string, UserType?: string, FirstName?: string, MiddleName?: string,
        LastName?: string, Suffix?: string, Gender?: string, Address1?: string,
        Address2?: string, City?: string, State?: string, PostalCode?: string, ApplicationId?: string,
        DEANumber?: string, DateOfBirth?: Date, Email?: string, Fax?: string, NPINumber?: string, Phone?: string,
        LocationIds?: Array<number>) {
        this.UserId = userId;
        this.UserType = UserType;
        this.FirstName = FirstName;
        this.MiddleName = MiddleName;
        this.LastName = LastName;
        this.Suffix = Suffix;
        this.Gender = Gender;
        this.Address1 = Address1;
        this.Address2 = Address2;
        this.City = City;
        this.State = State;
        this.PostalCode = PostalCode;
        this.ApplicationId = ApplicationId;
        this.DEANumber = DEANumber;
        this.DateOfBirth = DateOfBirth;
        this.Email = Email;
        this.Fax = Fax;
        this.NPINumber = NPINumber;
        this.Phone = Phone;
        this.LocationIds = LocationIds;
    }
}

export class UserLocationRoles {
    ApplicationId?: number;
    DataTag?: string;
    LocationId?: number;
    PracticeId?: string;
    RoleDesc?: string;
    RoleId?: number;
    RoleName?: string;
    $$ObjectState?: string

    constructor(ApplicationId?, DataTag?, LocationId?, PracticeId?, RoleDesc?, RoleId?, RoleName?, $$ObjectState?) {
        this.ApplicationId = ApplicationId;
        this.DataTag = DataTag;
        this.LocationId = LocationId;
        this.PracticeId = PracticeId;
        this.RoleDesc = RoleDesc;
        this.RoleId = RoleId;
        this.RoleName = RoleName;
        this.$$ObjectState = $$ObjectState;
    }
}

export class ScheduleStatuses {
    LocationId: number;
    HasProviderAppointments: boolean;
    HasProviderRoomOccurrences: boolean;
}

export class UserLocationsErrors {
    NoUserLocationsError: boolean;
    NoRoleForLocation: boolean;
}

export class TaxonomyCodes {
    $$DisplayText?: string;
    Category?: string;
    Code?: string;
    TaxonomyCodeId?: number;
}

export class StateLicense {
    UserId?: string;
    StateId?: number;
    StateLicenseId?: number;
    StateLicenseNumber?: string;
    AnesthesiaId?: string;
    IsActive?: boolean;
    IsDeleted?: boolean;
    ObjectState?: string;
    DataTag?: string;
    DateModified?: string;
    UserModified?: string;
    Flag?: number;
    StateAbbreviation: string;
    StateIdUndefined?: boolean;
    StateLicenseUndefined?: boolean;
}

export class States {
    Abbreviation?: string;
    DataTag?: string;
    DateModified?: string;
    Name?: string;
    StateId?: number;
    UserModified?: string;
}

export const SaveState = {
    None: "None",
    Update: "Update",
    Add: "Add",
    Delete: "Delete",
    Successful: "Successful",
    Failed: "Failed"
}

export const MasterTeamMemberIdentifierQualifiers = [
    { "Value": 0, "Text": "None" },
    { "Value": 1, "Text": "0B   State License Number" },
    { "Value": 2, "Text": "1G   Provider UPIN Number" },
    { "Value": 3, "Text": "G2   Provider Commercial Number" },
    { "Value": 4, "Text": "LU   Location Number" },
    { "Value": 5, "Text": "ZZ   Provider Taxonomy" },
]

export enum ProviderType {
    Dentist = 1,
    Hygienist = 2,
    Assistant = 3,
    NotAProvider = 4,
    Order = 5
}

export enum ProviderOnClaimsRelationship {
    Self = 1,
    Other = 2
}

export enum RolesType {
    PracticeAdmin = 'Practice Admin/Exec. Dentist',
    RxUser = 'Rx User',
    ClinicalReporting = 'Clinical Reporting',
    ManagerialReporting = 'Managerial Reporting',
    SapiToPMS='SAPI to Payment Management Service'
}

export class TeamMemberLocations implements Pick<Location, 'DataTag' | 'DateModified' | 'DeactivationTimeUtc' |
    'LocationId' | 'NameAbbreviation' | 'NameLine1' | 'NameLine2' | 'State' | 'Timezone' | 'UserModified'> {
    DataTag?: string;
    DateModified?: string;
    DeactivationTimeUtc?: Date;
    LocationId?: number;
    NameAbbreviation?: string;
    NameLine1?: string;
    NameLine2?: string;
    State?: string;
    Timezone?: string;
    UserModified?: string;
    LocationStatus?: string
    SortOrder?: number;
    InactiveDate?: string
}

export class TeamMemberRoles implements Pick<TeamMemberCrud, 'PracticeRoles' | 'LocationRoles'> {
    PracticeRoles?: {};
    LocationRoles?: {};
    EnterpriseRoles?: [];
}

export class TeamMemberLandingItem {
    public text: string;
    public value: string;
    public AssignedUserIds: Array<string>;
    public IsDisabled: boolean;

    constructor(text: string, value: string, AssignedUserIds: Array<string>, IsDisabled: boolean) { 
        this.text = text;
        this.value = value;
        this.AssignedUserIds = AssignedUserIds;
        this.IsDisabled = IsDisabled;
    }
}

export enum RoleNames {
    PracticeAdmin = 'Practice Admin/Exec. Dentist',
    RxUser = 'Rx User'
}
