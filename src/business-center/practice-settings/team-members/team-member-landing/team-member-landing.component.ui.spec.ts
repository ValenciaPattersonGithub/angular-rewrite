import { render, screen } from '@testing-library/angular';
import { TeamMemberLandingComponent } from './team-member-landing.component';
import { TranslateModule } from '@ngx-translate/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TestBed } from '@angular/core/testing';
import { BoldTextIfContainsPipe, OrderByPipe } from 'src/@shared/pipes';
import { of } from 'rxjs';

let mockLocationsList = [
        { LocationId: '1', NameLine1: 'First Office', AddressLine1: '123 Apple St', AddressLine2: 'Suite 10', ZipCode: '62401', City: 'Effingham', State: 'IL', PrimaryPhone: '5551234567', Timezone: 12, isActiveLoc: true },
        { LocationId: '2', NameLine1: 'Second Office', AddressLine1: '123 Count Rd', AddressLine2: '', ZipCode: '62858', City: 'Louisville', State: 'IL', PrimaryPhone: '5559876543', isActiveLoc: true },
        { LocationId: '3', NameLine1: 'Third Office', AddressLine1: '123 Adios St', AddressLine2: '', ZipCode: '60601', City: 'Chicago', State: 'IL', PrimaryPhone: '3124567890', isActiveLoc: true },
        { LocationId: '4', NameLine1: 'Fourth Office', AddressLine1: '123 Hello Rd', AddressLine2: '', ZipCode: '62895', City: 'Wayne City', State: 'IL', PrimaryPhone: '6187894563', SecondaryPhone: '6181234567', isActiveLoc: true }
    ]

let mockAuthZ = {
    generateTitleMessage: () => { return 'Not Allowed' }
}
let mocktempProviderTypes = [
    { "ProviderTypeId": 4, "Id": 4, "Name": "Not a Provider", "Order": 1, "IsAppointmentType": false },
    { "ProviderTypeId": 1, "Id": 1, "Name": "Dentist", "Order": 2, "IsAppointmentType": true },
    { "ProviderTypeId": 2, "Id": 2, "Name": "Hygienist", "Order": 3, "IsAppointmentType": true },
    { "ProviderTypeId": 3, "Id": 3, "Name": "Assistant", "Order": 4, "IsAppointmentType": false },
    { "ProviderTypeId": 5, "Id": 5, "Name": "Other", "Order": 5, "IsAppointmentType": false }
]
let mockTempDepartment = [
    { DataTag: "AAAAAAAACHa=", DateModified: "2019-02-06T16:48:10.440946", DepartmentId: 1, Name: "Dentist", Order: 1, UserModified: "00000000-0000-0000-0000-000000000000" },
    { DataTag: "AAAAAAAACHb=", DateModified: "2019-02-06T16:48:10.440946", DepartmentId: 2, Name: "Assistant", Order: 2, UserModified: "00000000-0000-0000-0000-000000000000" },
    { DataTag: "AAAAAAAACHc=", DateModified: "2019-02-06T16:48:10.440946", DepartmentId: 3, Name: "Hygienist", Order: 3, UserModified: "00000000-0000-0000-0000-000000000000" },
    { DataTag: "AAAAAAAACHd=", DateModified: "2019-02-06T16:48:10.440946", DepartmentId: 4, Name: "Administrative", Order: 4, UserModified: "00000000-0000-0000-0000-000000000000" },
    { DataTag: "AAAAAAAACHe=", DateModified: "2019-02-06T16:48:10.440946", DepartmentId: 5, Name: "Executive", Order: 5, UserModified: "00000000-0000-0000-0000-000000000000" },
    { DataTag: "AAAAAAAACHf=", DateModified: "2019-02-06T16:48:10.440946", DepartmentId: 6, Name: "Business Partner", Order: 6, UserModified: "00000000-0000-0000-0000-000000000000" }
]
let mockTempUserData = [{
    Address: { AddressLine1: null, AddressLine2: null, City: null, State: null, ZipCode: null },
    AnesthesiaId: null,
    DataTag: "AAAAABSJYJE=",
    DateModified: "2022-05-31T15:38:35.7232476",
    DateOfBirth: null,
    DeaNumber: null,
    DentiCalPin: null,
    DepartmentId: 1,
    EmployeeEndDate: null,
    EmployeeStartDate: null,
    FederalLicense: null,
    FirstName: "User1FirstName",
    ImageFile: null,
    IsActive: true,
    JobTitle: null,
    LastName: "User1LastName",
    Locations: [{
        Color: null,
        DataTag: "AAAAABSJYJY=",
        DateModified: "2022-05-31T15:38:35.8794476",
        FailedMessage: null,
        IsActive: true,
        Location: null,
        LocationId: 1703574,
        ObjectState: null,
        PracticeId: 26899,
        ProviderOnClaimsId: null,
        ProviderOnClaimsRelationship: 0,
        ProviderQualifierType: 0,
        ProviderTypeId: 4,
        UserId: "1",
        UserModified: "46036023-d22b-4b0e-a0f6-c0120e19b7e0",
        UserProviderSetupLocationId: "4135c7c0-0b6c-4744-874d-fe442840a1d9"
    }],
    MiddleName: null,
    NpiTypeOne: null,
    PracticeId: 26899,
    PreferredName: null,
    PrimaryTaxonomyId: null,
    ProfessionalDesignation: null,
    Roles: null,
    RxUserType: 0,
    SecondaryTaxonomyId: null,
    ShowCardServiceDisabledMessage: false,
    StateLicense: null,
    StatusChangeNote: null,
    SuffixName: null,
    TaxId: null,
    UserCode: "CODE1",
    UserId: "1",
    UserModified: "46036023-d22b-4b0e-a0f6-c0120e19b7e0",
    UserName: "a@a.com",
    DepartmentName: "",
    ProviderTypeId: 4
}, {
    Address: { AddressLine1: null, AddressLine2: null, City: null, State: null, ZipCode: null },
    AnesthesiaId: null,
    DataTag: "AAAAABSJYJE=",
    DateModified: "2022-05-31T15:38:35.7232476",
    DateOfBirth: null,
    DeaNumber: null,
    DentiCalPin: null,
    DepartmentId: 2,
    EmployeeEndDate: null,
    EmployeeStartDate: null,
    FederalLicense: null,
    FirstName: "User2FirstName",
    ImageFile: null,
    IsActive: true,
    JobTitle: null,
    LastName: "User2LastName",
    Locations: [{
        Color: null,
        DataTag: "AAAAABSJYJY=",
        DateModified: "2022-05-31T15:38:35.8794476",
        FailedMessage: null,
        IsActive: true,
        Location: null,
        LocationId: 1703574,
        ObjectState: null,
        PracticeId: 26899,
        ProviderOnClaimsId: null,
        ProviderOnClaimsRelationship: 0,
        ProviderQualifierType: 0,
        ProviderTypeId: 4,
        UserId: "2",
        UserModified: "46036023-d22b-4b0e-a0f6-c0120e19b7e0",
        UserProviderSetupLocationId: "4135c7c0-0b6c-4744-874d-fe442840a1d9"
    }],
    MiddleName: null,
    NpiTypeOne: null,
    PracticeId: 26899,
    PreferredName: null,
    PrimaryTaxonomyId: null,
    ProfessionalDesignation: null,
    Roles: null,
    RxUserType: 0,
    SecondaryTaxonomyId: null,
    ShowCardServiceDisabledMessage: false,
    StateLicense: null,
    StatusChangeNote: null,
    SuffixName: null,
    TaxId: null,
    UserCode: "CODE2",
    UserId: "2",
    UserModified: "46036023-d22b-4b0e-a0f6-c0120e19b7e0",
    UserName: "b@b.com",
    ProviderTypeId: 3,
}, { UserImage: '', UserId: 1, FirstName: 'Reed', LastName: 'Richards', PreferredName: 'Stretch', ProviderTypeId: '1', DepartmentId: '1', UserName: 'rrichards', UserCode: 'Ricre', IsActive: false },
{ UserImage: '', UserId: 2, FirstName: 'Susan', LastName: 'Storm', PreferredName: '', ProviderTypeId: '1', DepartmentId: '1', UserName: 'sstorm', UserCode: 'Stosu', IsActive: false },
{ UserImage: '', UserId: 3, FirstName: 'Benjamin', LastName: 'Grimm', PreferredName: 'Rock', ProviderTypeId: '2', DepartmentId: '3', UserName: 'bgrimm', UserCode: 'Gribe', IsActive: true },
{ UserImage: '', UserId: 4, FirstName: 'Justin', LastName: 'Storm', PreferredName: 'Torch', ProviderTypeId: '3', DepartmentId: null, UserName: 'jstorm', UserCode: 'Stoju', IsActive: true },
{ UserImage: '', UserId: 5, FirstName: 'Stan', LastName: 'Lee', PreferredName: '', ProviderTypeId: null, DepartmentId: null, UserName: 'jstorm', UserCode: 'Stoju', IsActive: true },
//{ UserImage: '', UserId: '91F6AD0C-F0D5-41BF-DA86-08DCA2507780', FirstName: 'Anamika', LastName: 'sengar', PreferredName: '', ProviderTypeId: null, DepartmentId: null, UserName: 'anamika.sengar@pattersoncompanies.com', UserCode: '', IsActive: true }
]
let mockLocalizeService = {
    getLocalizedString: jasmine.createSpy('getLocalizedString').and.returnValue('translated text')
};
let mockLocation = {
    path: jasmine.createSpy('path').and.returnValue('')
};
const mockComponent = {
  loading: true,
  users: [],
  filteredUsers: [],
  calculateUserInfo: jasmine.createSpy('calculateUserInfo'),
  getDepartments: jasmine.createSpy('getDepartments'),
  getProviderTypes: jasmine.createSpy('getProviderTypes'),
  userServicesGetSuccess: jasmine.createSpy('userServicesGetSuccess')
};
let mockPatSecurityService = {
    IsAuthorizedByAbbreviation: jasmine.createSpy('IsAuthorizedByAbbreviation').and.returnValue(true),
    generateMessage: jasmine.createSpy('generateMessage'),
    IsAuthorizedByAbbreviationAtPractice: jasmine.createSpy('IsAuthorizedByAbbreviationAtPractice').and.returnValue(true),
    IsAuthorizedByAbbreviationAtLocation: jasmine.createSpy('IsAuthorizedByAbbreviationAtLocation').and.returnValue(true),
};
let mockToastrFactory = {
    success: jasmine.createSpy('toastrFactory.success'),
    error: jasmine.createSpy('toastrFactory.error')
};
const mockUsersFactory = {
    Users: jasmine.createSpy('Users').and.returnValue({
        then: (res: Function, error: Function) => {
            res({ Value: mockTempUserData });
            error(); // Simulate an empty error call
        }
    })
};
// Create spy object for mockStaticData
const mockStaticData = jasmine.createSpyObj('mockStaticData', ['Departments', 'ProviderTypes']);
 
// Set up the behavior of the spies
mockStaticData.Departments.and.returnValue({
  then: (callback) => {
    callback({ Value: mockTempDepartment });
  }
});
 
mockStaticData.ProviderTypes.and.returnValue({
  then: (callback) => {
    callback({ Value: mocktempProviderTypes });
  }
});
let mockreferenceDataService = {
    entityNames: {
        practiceSettings: 'practiceSettings'
    },
    get: jasmine.createSpy('get').and.returnValue((mockLocationsList))
};

let mockpracticeService = {
    getCurrentPractice: jasmine.createSpy('getCurrentPractice').and.returnValue({ id: 'practiceId' })
};
const mockUserServices = {
    Roles: {
      getAllRolesByPractice: jasmine.createSpy('getAllRolesByPractice').and.returnValue({
        $promise: {
          then: (successCallback, errorCallback) => {
            // Simulate successful response
            successCallback({ mockLocationsList });
   
            // Simulate error response
            errorCallback({
              data: {
                InvalidProperties: [
                  { PropertyName: 'GroupTypeName', ValidationMessage: 'Not Allowed' }
                ]
              }
            });
          }
        }
      }),
      getAllRolesByLocation: jasmine.createSpy('getAllRolesByLocation').and.returnValue({
        $promise: {
          then: (successCallback, errorCallback) => {
            // Simulate successful response
            successCallback({ mockLocationsList });
   
            // Simulate error response
            errorCallback({
              data: {
                InvalidProperties: [
                  { PropertyName: 'GroupTypeName', ValidationMessage: 'Not Allowed' }
                ]
              }
            });
          }
        }
      })
    }
  };
let mockRoleNames = {
    PracticeAdmin: 'Practice Admin/Exec. Dentist',
    RxUser: 'Rx User'
};
const mockservice = {
    IsAuthorizedByAbbreviation: jasmine.createSpy('IsAuthorizedByAbbreviation'),
    getServiceStatus: () => new Promise((resolve, reject) => {
        // Simulate resolve or reject based on test scenario
    }),
    isEnabled: () => new Promise((resolve, reject) => {
        // Simulate resolve or reject based on test scenario
    }),
    getCurrentLocation: jasmine.createSpy('getCurrentLocation').and.returnValue({ practiceId: 'test' }),
    locationId: 1
};
const mockRootScope = { $on: jasmine.createSpy('$on') };

describe('TeamMemberLandingComponent', () => {
   // let component: TeamMemberLandingComponent;
   // let fixture: ComponentFixture<TeamMemberLandingComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [TeamMemberLandingComponent, OrderByPipe, BoldTextIfContainsPipe],
            imports: [TranslateModule.forRoot(), FormsModule, ReactiveFormsModule],
            providers: [
                { provide: 'localize', useValue: mockLocalizeService },
                { provide: 'toastrFactory', useValue: mockToastrFactory },
                { provide: 'patSecurityService', useValue: mockPatSecurityService },
                { provide: 'AuthZService', useValue: mockAuthZ },
                { provide: '$location', useValue: mockLocation },
                { provide: 'UsersFactory', useValue: mockUsersFactory },
                { provide: 'StaticData', useValue: mockStaticData },
                { provide: 'referenceDataService', useValue: mockreferenceDataService },
                { provide: 'practiceService', useValue: mockpracticeService },
                { provide: 'UserServices', useValue: mockUserServices },
                { provide: 'RoleNames', useValue: mockRoleNames },
                { provide: '$routeParams', useValue: mockservice },
                { provide: '$rootScope', useValue: mockRootScope },

            ]
        });
    });
    it('should render', async () => {
        const { getByText } = await render(TeamMemberLandingComponent, {
          // Provide any necessary component inputs or mocks here
        });
    
        expect(getByText('Team Members')).toBeTruthy();
      });


      it('should filter items based on search term', async () => {
        // Render the component
       await render(TeamMemberLandingComponent);

        // Get the input element and type in a search term
        const input = screen.getByPlaceholderText(/Find Team Member/i);
        
        // Set the input value directly
        (input as HTMLInputElement).value = 'anamika';
       
        // Verify filtered results
        expect(screen.queryByText('anamika')).toBeNull(); // Not included
       });
    
       
      it('should filter items based on search term', async () => {
        // Render the component
       await render(TeamMemberLandingComponent);
       mockComponent.userServicesGetSuccess(mockTempUserData);

        // Get the input element and type in a search term
        const input = screen.getByPlaceholderText(/Find Team Member/i);
        
        // Set the input value directly
        (input as HTMLInputElement).value = 'anamika.sengar@pattersoncompanies.com';
       
        // Verify filtered results
        expect(screen.queryByText('anamika.sengar@pattersoncompanies.com')).toBeNull();
       });

       
      it('should filter items based on search term', async () => {
        // Render the component
       await render(TeamMemberLandingComponent);
       mockComponent.userServicesGetSuccess(mockTempUserData);

        // Get the input element and type in a search term
        const input = screen.getByPlaceholderText(/Find Team Member/i);
        
        // Set the input value directly
        (input as HTMLInputElement).value = 'b@b.com';
       
        // Verify filtered results
        expect(screen.queryByText('b@b.com')).toBeTruthy();
       });
});