import { HttpClient } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { OrderByPipe } from 'src/@shared/pipes/order-by/order-by.pipe';
import { UserRolesByLocationComponent } from './user-roles-by-location.component';
import { Location } from '../../location';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

let user;
let mockUserLocationRoles;
let mockUser;
let mockToastrFactory;
let mockLocalizeService;
let mockPatSecurityService;
let mockAuthZ;
let mockLocation;
let mockUsersFactory;
let mockreferenceDataService;
let mockUserServices;
let mockRoleNames;
let mockSaveStates;
let mockModalFactoryService;
let mockRolesFactory;
let mockSoarConfig;
let mockHttpService;
let mockRootcomponent;
let mockLocations: Location[];
let mockCurrentLocation;
let mockCurrentUserLocations;
let mockPracticeUserRolesResult;
let mockUserRoles;

describe('UserRolesByLocationComponent', () => {
  let component: UserRolesByLocationComponent;
  let fixture: ComponentFixture<UserRolesByLocationComponent>;

  beforeEach(() => {
    user = {};

    mockUserLocationRoles = [
      { RoleId: 1, RoleName: 'Hygienist', $$ObjectState: 'Add', text: 'Hygienist', value: 1 },
      { RoleId: 2, RoleName: 'Business Partner', $$ObjectState: 'Delete', text: 'Business Partner', value: 2 },
      { RoleId: 3, RoleName: 'Assistant', $$ObjectState: 'Add', text: 'Assistant', value: 3 },
      { RoleId: 4, RoleName: 'Associate Dentist', text: 'Assistant', value: 4 },
    ]
    mockUser = [{
      UserId: '1',
      FirstName: 'John',
      MiddleName: 'm',
      LastName: 'Kon',
      PreferredName: 'John',
      ProfessionalDesignation: 'Dintist',
      DateOfBirth: new Date('1995-01-15T18:30:00.000Z'),
      UserName: 'test04@mailinator.com',
      ImageFile: null,
      EmployeeStartDate: new Date('2021-01-31T18:30:00.000Z'),
      EmployeeEndDate: new Date('2023-01-31T18:30:00.000Z'),
      Email: 'test04@mailinator.com',
      Address: {
        AddressLine1: null,
        AddressLine2: null,
        City: null,
        State: null,
        ZipCode: '22222-22222'
      },
      DepartmentId: null,
      LocationId: 1,
      JobTitle: 'Hghf',
      ProviderTypeId: null,
      TaxId: null,
      FederalLicense: null,
      DeaNumber: null,
      NpiTypeOne: null,
      PrimaryTaxonomyId: null,
      SecondaryTaxonomyId: null,
      StateLicense: null,
      AnesthesiaId: null,
      IsActive: true,
      StatusChangeNote: null,
      SuffixName: null,
      $$locations: [],
      $$UserPracticeRoles: [],
      $$UserLocations: [],
      $$AvailableRoles: [],
      Suffix: "Mr"
    }, {
      UserId: '2',
      FirstName: 'Cena',
      MiddleName: 'm',
      LastName: 'Kon',
      PreferredName: 'Jo',
      ProfessionalDesignation: 'Dintist',
      DateOfBirth: new Date('1995-01-15T18:30:00.000Z'),
      UserName: 'test04@mailinator.com',
      ImageFile: null,
      EmployeeStartDate: new Date('2021-01-31T18:30:00.000Z'),
      EmployeeEndDate: new Date('2023-01-31T18:30:00.000Z'),
      Email: 'test04@mailinator.com',
      Address: {
        AddressLine1: null,
        AddressLine2: null,
        City: null,
        State: null,
        ZipCode: '22222-22222'
      },
      DepartmentId: null,
      JobTitle: 'Hghf',
      ProviderTypeId: null,
      TaxId: null,
      FederalLicense: null,
      DeaNumber: null,
      NpiTypeOne: null,
      PrimaryTaxonomyId: null,
      SecondaryTaxonomyId: null,
      StateLicense: null,
      AnesthesiaId: null,
      IsActive: true,
      StatusChangeNote: null,
      SuffixName: null,
      $$locations: [],
      $$UserPracticeRoles: [],
      $$UserLocations: [],
      $$AvailableRoles: []
    }]

    mockToastrFactory = {
      success: jasmine.createSpy('toastrFactory.success'),
      error: jasmine.createSpy('toastrFactory.error')
    };

    mockLocalizeService = {
      getLocalizedString: () => 'translated text'
    }

    mockPatSecurityService = {
      IsAuthorizedByAbbreviation: jasmine.createSpy('patSecurityService.IsAuthorizedByAbbreviation').and.returnValue(true),
      generateMessage: jasmine.createSpy('patSecurityService.generateMessage'),
      IsAuthorizedByAbbreviationAtPractice: jasmine.createSpy('patSecurityService.IsAuthorizedByAbbreviationAtPractice').and.returnValue(true),
      IsAuthorizedByAbbreviationAtLocation: jasmine.createSpy('patSecurityService.IsAuthorizedByAbbreviationAtLocation').and.returnValue(true),
    }

    mockAuthZ = {
      generateTitleMessage: () => { return 'Not Allowed' }
    }

    mockLocation = {
      path: () => '',
      url: () => ''
    }

    mockUsersFactory = {
      access: jasmine.createSpy().and.returnValue({
        View: true, Create: true
      }),
      Users: () => {
        return {
          then: (res) => {
            res({ Value: mockUser })
          }
        }
      },
    }

    mockreferenceDataService = {
      get: jasmine.createSpy().and.returnValue({ $promise: { then: jasmine.createSpy() } }),
      entityNames: {
        locations: 'locations',
      }
    };

    mockUserServices = {
      UserRoles: {
        save: jasmine.createSpy().and.returnValue({
          $promise: {
            then: (success, fail) => {
              success({ Result: mockUserLocationRoles })
            }
          }
        })
      },
      Roles: {
        assignRoleByLocation: jasmine.createSpy().and.returnValue({ $promise: { then: jasmine.createSpy() } }),
        deleteRoleByLocation: jasmine.createSpy().and.returnValue({ $promise: { then: jasmine.createSpy() } })
      }
    }

    mockRoleNames = {
      PracticeAdmin: 'Practice Admin/Exec. Dentist',
      RxUser: 'Rx User'
    }

    mockSaveStates = {
      Add: 'Add',
      Update: 'Update',
      Delete: 'Delete',
      None: 'None',
      Successful: 'Successful',
      Failed: 'Failed'
    }

    mockModalFactoryService = {
      CancelModal: jasmine
        .createSpy('ModalFactory.CancelModal')
        .and.returnValue({ then: () => { } })
    }

    mockRolesFactory = {
      Roles: (userId) => {
        return {
          then: (res) => {
            res({ Result: [{ RoleId: 6, RoleName: 'Associate Dentist' }, { RoleId: 11, RoleName: 'Office Manager' }] })
          }
        }
      },
      UserPracticeRoles: jasmine.createSpy().and.returnValue({
        then: jasmine.createSpy().and.returnValue(0)
      }),
      UserLocationRoles: jasmine.createSpy().and.returnValue({
        then: jasmine.createSpy().and.returnValue(0)
      }),
      AllUsersLocationRoles: jasmine.createSpy().and.returnValue({
        then: jasmine.createSpy().and.returnValue(0)
      }),
      AllUsersPracticeRoles: jasmine.createSpy().and.returnValue({
        then: jasmine.createSpy().and.returnValue(0)
      }),
      UserRoles: (userId) => {
        return {
          then: (res) => {
            res({ Value: [{ RoleId: 6, RoleName: 'Associate Dentist' }, { RoleId: 11, RoleName: 'Office Manager' }] })
          }
        }
      },
    }

    mockSoarConfig = {};
    mockHttpService = jasmine.createSpyObj('HttpClient', ['post', 'get', 'put', 'delete']);
    mockRootcomponent = {
      patAuthContext: {
        userInfo: {
          UserId: '',
          FirstName: 'John',
          MiddleName: 'm',
          LastName: 'Kon',
          PreferredName: 'Jo',
          ProfessionalDesignation: 'Dintist',
          DateOfBirth: new Date('1995-01-15T18:30:00.000Z'),
          UserName: 'test04@mailinator.com',
          ImageFile: null,
          EmployeeStartDate: new Date('2021-01-31T18:30:00.000Z'),
          EmployeeEndDate: new Date('2023-01-31T18:30:00.000Z'),
          Email: 'test04@mailinator.com',
          Address: {
            AddressLine1: null,
            AddressLine2: null,
            City: null,
            State: null,
            ZipCode: '22222-22222'
          },
          DepartmentId: null,
          JobTitle: 'Hghf',
          ProviderTypeId: null,
          TaxId: null,
          FederalLicense: null,
          DeaNumber: null,
          NpiTypeOne: null,
          PrimaryTaxonomyId: null,
          SecondaryTaxonomyId: null,
          StateLicense: null,
          AnesthesiaId: null,
          IsActive: true,
          StatusChangeNote: null,
          SuffixName: null,
          $$locations: []
        }
      }
    }

    mockLocations = [
      { LocationId: 1, NameLine1: 'Alaska', AddressLine1: '123 Apple St', AddressLine2: 'Suite 10', ZipCode: '62401', City: 'Effingham', State: 'IL', PrimaryPhone: '5551234567', Timezone: "12" },
      { LocationId: 2, NameLine1: 'Tokyo', AddressLine1: '123 Count Rd', AddressLine2: '', ZipCode: '62858', City: 'Louisville', State: 'IL', PrimaryPhone: '5559876543' },
      { LocationId: 3, NameLine1: 'Jersey', AddressLine1: '123 Adios St', AddressLine2: '', ZipCode: '60601', City: 'Chicago', State: 'IL', PrimaryPhone: '3124567890' },
      { LocationId: 4, NameLine1: 'LA', AddressLine1: '123 Hello Rd', AddressLine2: '', ZipCode: '62895', City: 'Wayne City', State: 'IL', PrimaryPhone: '6187894563', SecondaryPhone: '6181234567' }
    ];

    mockCurrentLocation = { id: 1, name: "Alaska" }

    mockCurrentUserLocations = [{ LocationId: 1, NameLine1: "Alaska" },
    { LocationId: 2, NameLine1: "Tokyo" },
    { LocationId: 3, NameLine1: "Jersey" },
    { LocationId: 4, NameLine1: "LA" },
    { LocationId: 5, NameLine1: "RX" },
    { LocationId: 6, NameLine1: "NP" }]

    mockPracticeUserRolesResult = {
      EnterpriseRoles: [],
      PracticeRoles: [{ RoleId: 8, RoleName: 'Practice Administrator' }, { RoleId: 13, RoleName: 'Rx User' }],
      LocationRoles: {}
    };

    mockUserRoles = {
      LocationRoles: [{
        1: [{ RoleId: 6, RoleName: 'Associate Dentist' }, { RoleId: 11, RoleName: 'Office Manager' }],
        2: [{ RoleId: 6, RoleName: 'Associate Dentist' }, { RoleId: 11, RoleName: 'Office Manager' }],
        3: [{ RoleId: 6, RoleName: 'Associate Dentist' }, { RoleId: 11, RoleName: 'Office Manager' }],
        4: [{ RoleId: 6, RoleName: 'Associate Dentist' }, { RoleId: 5, RoleName: 'Assistant' }]
      }],
      PracticeRoles: [{ RoleId: 8, RoleName: 'Practice Administrator' }, { RoleId: 13, RoleName: 'Rx User' }]
    };
  });

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [UserRolesByLocationComponent, OrderByPipe],
      imports: [TranslateModule.forRoot(), ReactiveFormsModule, FormsModule],
      providers: [
        { provide: 'toastrFactory', useValue: mockToastrFactory },
        { provide: 'localize', useValue: mockLocalizeService },
        { provide: 'patSecurityService', useValue: mockPatSecurityService },
        { provide: 'AuthZService', useValue: mockAuthZ },
        { provide: '$location', useValue: mockLocation },
        { provide: '$rootScope', useValue: mockRootcomponent },
        { provide: 'UsersFactory', useValue: mockUsersFactory },
        { provide: 'UserServices', useValue: mockUserServices },
        { provide: 'RoleNames', useValue: mockRoleNames },
        { provide: 'referenceDataService', useValue: mockreferenceDataService },
        { provide: 'RolesFactory', useValue: mockRolesFactory },
        { provide: 'SaveStates', useValue: mockSaveStates },
        { provide: 'ModalFactory', useValue: mockModalFactoryService },
        { provide: 'SoarConfig', useValue: mockSoarConfig },
        { provide: HttpClient, useValue: mockHttpService }
      ]
    })
      .compileComponents();
  });
  let httpClient: HttpClient;
  beforeEach(() => {
    fixture = TestBed.createComponent(UserRolesByLocationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    component.currentUserLocations = mockCurrentUserLocations;
    component.currentLocation = mockCurrentLocation;
    component.locations = mockLocations;
    httpClient = TestBed.inject(HttpClient);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });


  describe('ngOnInit -->', () => {
    it('should call all mentioned methods', () => {
      spyOn(component, 'getAccess');
      spyOn(component, 'getPageNavigation');
      spyOn(component, 'getRoles');
      spyOn(component, 'getCurrentUserLocations');
      component.ngOnInit();
      expect(component.getAccess).toHaveBeenCalled();
      expect(component.getPageNavigation).toHaveBeenCalled();
      expect(component.getRoles).toHaveBeenCalled();
      expect(component.getCurrentUserLocations).toHaveBeenCalled();
    })
  })
  describe('getAccess -->', () => {
    it('Should call getAccess', () => {
      const spy = component.getAccess = jasmine.createSpy();
      component.getAccess();
      expect(spy).toHaveBeenCalled();
      expect(mockUsersFactory.access).toHaveBeenCalled();
    });

    it('Should not show toastr when view is true', () => {
      component.getAccess();
      expect(mockUsersFactory.access).toHaveBeenCalled();
      expect(mockToastrFactory.error).not.toHaveBeenCalled();
    });

    it('Should show toastr when view is false', () => {
      const spy = mockToastrFactory.error = jasmine.createSpy();
      component.authAccess.View = false;
      component.getAccess();
      expect(spy).toHaveBeenCalled();
    });
  });
  describe('getCurrentUserLocations --> ', () => {
    it('should call referenceDataService.get & getPracticeUsers', () => {
      component.getPracticeUsers = jasmine.createSpy();
      component.getCurrentUserLocations();
      expect(mockreferenceDataService.get).toHaveBeenCalledWith('locations');
      expect(component.getPracticeUsers).toHaveBeenCalled();
    });

    it('should set currentUserLocations and setSelectedLocation if user has practice roles', () => {
      mockRolesFactory.UserPracticeRoles.and.returnValue(Promise.resolve({ Result: ['role1', ''] }));
      mockreferenceDataService.get.and.returnValue(mockLocations);
      component.getCurrentUserLocations();
      expect(component.selectedLocations).toBeDefined();
    });

    it('should set currentUserLocations and setSelectedLocation if user has location roles', () => {
      component.setSelectedLocation = jasmine.createSpy();
      mockRolesFactory.UserPracticeRoles.and.returnValue(Promise.resolve({}));
      mockRolesFactory.UserLocationRoles.and.returnValue(Promise.resolve({ Result: mockLocations }));
      mockreferenceDataService.get.and.returnValue(mockLocations);
      component.getCurrentUserLocations();
      expect(component.currentUserLocations?.length).toBeGreaterThan(0);
      expect(component.setSelectedLocation).toBeDefined();
    });
  })

  describe('selectedLocationChange -->', () => {
    it('should call selectedLocationChange ', () => {
      let event = { LocationId: 1 };
      component.currentUserLocations = mockCurrentUserLocations;
      component.selectedLocationChange(event);
      expect(component.currentLocation.name).toEqual("Alaska");
      expect(component.selectedLocations?.length).toBeGreaterThan(0);
    })
  })

  describe('getPracticeUsers -->', () => {
    it('should call set users & call teamMemberName,getUsersRoles', () => {
      component.teamMemberName = jasmine.createSpy();
      component.getUsersRoles = jasmine.createSpy();
      component.getPracticeUsers();
      expect(component.users?.length).toBeGreaterThan(0);
      expect(component.teamMemberName).toHaveBeenCalled();
      expect(component.getUsersRoles).toHaveBeenCalled();
    })
  })

  describe('setLocationRoles --> ', () => {
    beforeEach(() => {
      component.roles = [{ RoleId: 1, RoleName: mockRoleNames.PracticeAdmin }, { RoleId: 2, RoleName: 'Rx User' },
      { RoleId: 3, RoleName: 'Hygienist' }, { RoleId: 4, RoleName: 'Assistant' },
      { RoleId: 5, RoleName: 'Business Partner' }, { RoleId: 6, RoleName: 'Associate Dentist' }];
      component.locationRoles = [];
    });

    it('should set locationRoles to all roles except rx user and practice administrator ', () => {
      component.setLocationRoles();
      expect(component.locationRoles?.length).toEqual(4);
      expect(component.locationRoles[0]).toEqual(component.roles[2]);
      expect(component.locationRoles[1]).toEqual(component.roles[3]);
      expect(component.locationRoles[2]).toEqual(component.roles[4]);
      expect(component.locationRoles[3]).toEqual(component.roles[5]);
    });
  });

  describe('getRoles -->', () => {
    it('should call rolesFactory.Roles', () => {
      component.setLocationRoles = jasmine.createSpy();
      component.getRoles();
      expect(component.roles?.length).toBeGreaterThan(0);
      expect(component.setLocationRoles).toHaveBeenCalled();
    });
  })

  describe('changeSortingForGrid  --> ', () => {
    beforeEach(() => {
      component.orderBy = {
        field: 'LastName',
        asc: true
      };
    });

    it('should initialize sort order to asc ', () => {
      expect(component.orderBy.asc).toBe(true);
    });

    it('should change sort order to desc if sort column selected again ', () => {
      expect(component.orderBy.asc).toBe(true);
      component.changeSortingForGrid('LastName');
      expect(component.orderBy.asc).toBe(false);
      component.changeSortingForGrid('LastName');
      expect(component.orderBy.asc).toBe(true);
    });
  })

  describe('rxRoleFilter  --> ', () => {
    it('should return true if no data for rxRoleFilter', () => {
      let tempResult = component.rxRoleFilter(null);
      expect(tempResult).toBe(true);
    });

    it('should return false if rolename matched with RxUser rolename', () => {
      let tempResult = component.rxRoleFilter({ RoleId: 1, RoleName: "Rx User" });
      expect(tempResult).toBe(false);
    });

    it('should return false if rolename matched with RxUser rolename', () => {
      let tempResult = component.rxRoleFilter({ RoleId: 1, RoleName: "Hygienist" });
      expect(tempResult).toBe(true);
    });
  })

  describe('getCurrentLocation -->', () => {
    it('should not set value if no location found in session storage', () => {
      sessionStorage.clear();
      component.selectedCurrentLocation = null;
      component.getCurrentLocation();
      expect(component.selectedCurrentLocation).toBeNull();
    })

    it('should set selectedCurrentLocation is current location', () => {
      sessionStorage.clear();
      component.selectedCurrentLocation = null;
      sessionStorage.setItem("userLocation", JSON.stringify({ id: 1, name: "Alaska" }));
      component.getCurrentLocation();
      expect(component.selectedCurrentLocation).toEqual(1);
    })
  })

  describe('teamMemberName -->', () => {
    it('should return blank if no person name mention', () => {
      let tempResult = component.teamMemberName("");
      expect(tempResult).toEqual("");
    })

    it('should return name in formatted version as per suffix & preferred name', () => {
      let tempResult = component.teamMemberName(mockUser[0]);
      expect(tempResult).toEqual("John (John) m. Kon, Mr");
    })
  })

  describe('setUserLocationRoles --> ', () => {
    let user = { UserId: '123456', $$UserLocations: [], $$UserPracticeRoles: [] };
    let locationId = 4;
    let locationRoles = [];

    beforeEach(() => {
      spyOn(component, 'setAvailableRoles');
      user = { UserId: '123456', $$UserLocations: [], $$UserPracticeRoles: [] };
      locationRoles = [{ RoleId: 6, RoleName: 'Associate Dentist' }, { RoleId: 11, RoleName: 'Office Manager' }];
    });

    it('should add locations to user ', () => {
      component.setUserLocationRoles(user, locationId, locationRoles);
      expect(user.$$UserLocations[0].LocationId).toEqual(4);
    });

    it('should add locationRoles roles to user.$$UserLocations ', () => {
      component.setUserLocationRoles(user, location, locationRoles);
      expect(user.$$UserLocations[0].$$UserLocationRoles[0].RoleId).toEqual(6);
      expect(user.$$UserLocations[0].$$UserLocationRoles[1].RoleId).toEqual(11);
    });

    it('should call setAvailableRoles ', () => {
      component.setUserLocationRoles(user, location, locationRoles);
      expect(component.setAvailableRoles).toHaveBeenCalledWith(user);
    });
  });

  describe('setUserPracticeRoles --> ', () => {
    it('should add practice roles to each user location ', () => {
      component.currentUserLocations = [{ LocationId: 1 }, { LocationId: 2 }];
      let user = { UserId: '123456', $$UserLocations: [], $$UserPracticeRoles: [] };
      component.setUserPracticeRoles(user, [{ RoleId: 8, RoleName: 'Practice Administrator' }]);
      expect(user.$$UserPracticeRoles).toEqual([{ RoleId: 8, RoleName: 'Practice Administrator' }]);
    });

    it('should add all locations to user ', () => {
      component.currentUserLocations = [{ LocationId: 1 }, { LocationId: 2 }];
      let user = { UserId: 2, $$UserLocations: [], $$UserPracticeRoles: [] };
      mockPracticeUserRolesResult?.PracticeRoles?.forEach((practiceRoles) => {
        component.setUserPracticeRoles(user, [practiceRoles]);
        expect(user.$$UserLocations).toEqual([{ LocationId: 1 }, { LocationId: 2 }]);
      });
    });
  });

  describe('setUserRoles --> ', () => {
    beforeEach(() => {
      user = { UserId: 1, $$UserLocationRoles: [], $$UserPracticeRoles: [] };
    });

    it('should component.setUserPracticeRoles for user with PracticeRoles', () => {
      let userRoles = { PracticeRoles: mockUserRoles.PracticeRoles };
      spyOn(component, 'setUserPracticeRoles');
      component.setUserRoles(user, userRoles);
      mockUserRoles?.PracticeRoles?.forEach((practiceRoles) => {
        expect(component.setUserPracticeRoles).toHaveBeenCalled();
      });
    });

    it('should component.setUserLocationRoles for user with LocationRoles', () => {
      spyOn(component, 'setUserLocationRoles');
      let userRoles = { LocationRoles: mockUserRoles.LocationRoles };
      component.setUserRoles(user, userRoles);
      mockUserRoles?.LocationRoles?.forEach((locationRoles, key) => {
        expect(component.setUserLocationRoles).toHaveBeenCalled();
      });
    });
  });

  describe('getUsersRoles --> ', () => {
    it('should call rolesFactory.AllUsersPracticeRoles ', () => {
      let users = [{ UserId: 2 }, { UserId: 3 }];
      component.setUserRoles = jasmine.createSpy();
      component.getUsersRoles(users);
      users?.forEach((user) => {
        expect(component.setUserRoles).toHaveBeenCalled();
      });
    });
  });

  describe('setAvailableRoles --> ', () => {
    it('should call setAvailableRolesByUserLocation if user has $$UserLocations ', () => {
      user = { UserId: '123456', $$UserLocations: [], $$UserPracticeRoles: [] };
      let locationRoles = [{ RoleId: 111, RoleName: 'Associate Dentist' }];
      component.setAvailableRolesByUserLocation = jasmine.createSpy();
      component.setUserLocationRoles(user, location, locationRoles);//Set $$UserLocations          
      component.setAvailableRoles(user);
      expect(component.setAvailableRolesByUserLocation).toHaveBeenCalled();
    });
  });

  describe('setAvailableRolesByUserLocation -->', () => {
    let userLocation;
    beforeEach(() => {
      component.locationRoles = [
        { RoleId: 1, RoleName: 'Hygienist' },
        { RoleId: 2, RoleName: 'Assistant' },
        { RoleId: 3, RoleName: 'Associate Dentist' },
        { RoleId: 4, RoleName: 'Business Partner' },
      ]
      userLocation = {
        LocationId: 1,
        $$UserLocationRoles: [{ RoleId: 4, RoleName: 'Business Partner' }],
        $$AvailableRoles: []
      };
    });

    it('should reset userLocation.$$AvailableRoles to all locationRoles with sorting when userLocation.$$UserLocationRoles is empty', () => {
      component.setAvailableRolesByUserLocation(userLocation);
      expect(userLocation.$$AvailableRoles?.length).toEqual(3);
      expect(userLocation.$$AvailableRoles[0].RoleName).toEqual('Assistant');
      expect(userLocation.$$AvailableRoles[1].RoleName).toEqual('Associate Dentist');
      expect(userLocation.$$AvailableRoles[2].RoleName).toEqual('Hygienist');
    });

    it('should reset userLocation.$$AvailableRoles if userLocation contains all roles', () => {
      userLocation = {
        LocationId: 1,
        $$UserLocationRoles: [{ RoleId: 1, RoleName: 'Hygienist' },
        { RoleId: 2, RoleName: 'Assistant' },
        { RoleId: 3, RoleName: 'Associate Dentist' },
        { RoleId: 4, RoleName: 'Business Partner' }],
        $$AvailableRoles: []
      };
      component.setAvailableRolesByUserLocation(userLocation);
      expect(userLocation.$$AvailableRoles).toEqual([]);
    });
  });

  describe('deletedRolesFilter-->', () => {
    let userLocationRoles = [];

    beforeEach(() => {
      userLocationRoles = [
        { RoleId: 1, RoleName: 'Hygienist', $$ObjectState: 'Delete' },
        { RoleId: 2, RoleName: 'Assistant', $$ObjectState: 'Add' },
        { RoleId: 2, RoleName: 'Associate Dentist', $$ObjectState: 'None' },
        { RoleId: 2, RoleName: 'Business Partner' },
      ];
    });
    it('should return true if userLocationRole does not have $$ObjectState.Delete', () => {
      expect(component.deletedRolesFilter(userLocationRoles[1])).toEqual(true);
      expect(component.deletedRolesFilter(userLocationRoles[2])).toEqual(true);
      expect(component.deletedRolesFilter(userLocationRoles[3])).toEqual(true);
    });

    it('should return false if userLocationRole has $$ObjectState.Delete', () => {
      expect(component.deletedRolesFilter(userLocationRoles[0])).toEqual(false);
    });
  });

  describe('locationsFilter-->', () => {
    it('should return true if selected location is same as item locationId', () => {
      component.users = mockUser;
      component.selectedLocations.push({ LocationId: 1, Name: "Alaska" });
      let tempResult = component.locationsFilter({ LocationId: 1 });
      expect(tempResult).toBe(true);
    })

    it('should return true if selected location is not same as item locationId', () => {
      component.users = mockUser;
      component.selectedLocations.push(mockCurrentLocation);
      let tempUser = component.locationsFilter({ LocationId: 2 });
      expect(tempUser).toBe(false);
    })

    it('should return true item is null ', () => {
      component.users = mockUser;
      component.selectedLocations.push(mockCurrentLocation);
      let tempUser = component.locationsFilter(null);
      expect(tempUser).toBe(true);
    })
  })

  describe('teamMemberLocationFilter-->', () => {
    it('should return true if team member has $$UserPracticeRoles', () => {
      component.selectedLocations.push({ LocationId: mockCurrentLocation.id });
      mockUser[0].$$UserPracticeRoles.push({ RoleId: 8, RoleName: 'Practice Administrator' });
      let tempResult = component.teamMemberLocationFilter(mockUser[0]);
      expect(tempResult).toBe(true);
    })

    it('should return true if team member has $$UserLocations and not contains $$UserPracticeRoles', () => {
      component.selectedLocations.push({ LocationId: mockCurrentLocation.id });
      mockUser[0].$$UserPracticeRoles = [];
      mockUser[0].$$UserLocations.push({ LocationId: 1, NameLine1: "Alaska" });
      let tempResult = component.teamMemberLocationFilter(mockUser[0]);
      expect(tempResult).toBe(true);
    })

    it('should return false if team member neigther contains $$UserLocations not $$UserPracticeRoles', () => {
      component.selectedLocations.push({ LocationId: mockCurrentLocation.id });
      mockUser[0].$$UserPracticeRoles = [];
      mockUser[0].$$UserLocations = [];
      let tempResult = component.teamMemberLocationFilter(mockUser[0]);
      expect(tempResult).toBe(false);
    })
  })

  describe('teamMemberRoleByLocationFilter -->', () => {
    it('should return true if team member has $$UserPracticeRoles & filterRoles has no roles ', () => {
      component.filterRoles = [];
      mockUser[0].$$UserPracticeRoles.push({ RoleId: 8, RoleName: 'Practice Administrator' });
      let tempResult = component.teamMemberRoleByLocationFilter(mockUser[0]);
      expect(tempResult).toBe(true);
    })

    it('should return true if team member has $$UserPracticeRoles and filterRoles has same role', () => {
      component.filterRoles = [{ Id: 1, RoleName: 'Hygienist' },
      { Id: 2, RoleName: 'Business Partner' },
      { Id: 3, RoleName: 'Assistant' },
      { Id: 4, RoleName: 'Associate Dentist' },];
      mockUser[0].$$UserPracticeRoles.push({ RoleId: 1, RoleName: 'Business Partner' });
      let tempResult = component.teamMemberRoleByLocationFilter(mockUser[0]);
      expect(tempResult).toBe(true);
    })

    it('should return false if team member has $$UserPracticeRoles but filterRoles not contains same role', () => {
      component.filterRoles = [{ Id: 1, RoleName: 'Hygienist' },
      { Id: 2, RoleName: 'Business Partner' },
      { Id: 3, RoleName: 'Assistant' },
      { Id: 4, RoleName: 'Associate Dentist' },];
      mockUser[0].$$UserPracticeRoles.push({ RoleId: 8, RoleName: 'Practice Administrator' });
      let tempResult = component.teamMemberRoleByLocationFilter(mockUser[0]);
      expect(tempResult).toBe(false);
    })

    it('should return true if team member has $$UserLocations & filterRoles has no roles ', () => {
      component.selectedLocations.push({ LocationId: mockCurrentLocation.id });
      mockUser[0].$$UserPracticeRoles = [];
      mockUser[0].$$UserLocations.push({ LocationId: 1, NameLine1: "Alaska" },
        { LocationId: 2, NameLine1: "Tokyo" });
      component.filterRoles = [];
      let tempResult = component.teamMemberRoleByLocationFilter(mockUser[0]);
      expect(tempResult).toBe(true);
    })

    it('should return true if team member has $$UserLocations has selected location', () => {
      component.selectedLocations.push({ LocationId: mockCurrentLocation.id });
      component.filterRoles = [{ Id: 1, RoleName: 'Hygienist' },
      { Id: 2, RoleName: 'Business Partner' },
      { Id: 3, RoleName: 'Assistant' },
      { Id: 4, RoleName: 'Associate Dentist' },];
      mockUser[0].$$UserLocations.push({ RoleId: 1, RoleName: 'Hygienist', LocationId: 1, $$UserLocationRoles: [{ RoleId: 1, RoleName: 'Hygienist' }] });
      let tempResult = component.teamMemberRoleByLocationFilter(mockUser[0]);
      expect(tempResult).toBe(true);
    })

    it('should return false if team member has $$UserLocations not contains selected location', () => {
      component.selectedLocations.push({ LocationId: mockCurrentLocation.id });
      component.filterRoles = [{ Id: 1, RoleName: 'Hygienist' },
      { Id: 2, RoleName: 'Business Partner' },
      { Id: 3, RoleName: 'Assistant' },
      { Id: 4, RoleName: 'Associate Dentist' },];
      mockUser[0].$$UserLocations.push({ RoleId: 8, RoleName: 'Practice Administrator', LocationId: 1 });
    })
  })

  describe('onSearch -->', () => {
    it('should filter team member on the basis of entered text', () => {
      component.onSearch("John");
      expect(component.users?.length).toBe(1);
    })
    it('should filter team member on the basis of entered text is in UPPERCASE', () => {
      component.onSearch("JOHN");
      expect(component.users?.length).toBe(1);
    })
    it('should return original data without filter if no text entered', () => {
      component.onSearch("");
      expect(component.users?.length).toBe(2);
    })

    it('should return blank data if no record matche', () => {
      component.onSearch("NOWAYOUT");
      expect(component.users?.length).toBe(0);
    })
  })

  describe('addLocationRole --> ', () => {
    let userLocation;
    let role;
    beforeEach(() => {
      role = { RoleId: 1, RoleName: 'Hygienist' };
      userLocation = {
        LocationId: 1,
        $$UserLocationRoles: [
          { RoleId: 2, RoleName: 'Business Partner' },],
      };
      component.validateUserLocationRoles = jasmine.createSpy();
      component.setAvailableRolesByUserLocation = jasmine.createSpy();
    });

    it('should add role to userLocation and set ObjectState to Add if teamMember does not have role in userLocation.$$UserLocationRoles', () => {
      expect(userLocation.$$UserLocationRoles?.length).toEqual(1);
      component.addLocationRole(role, userLocation);
      expect(userLocation.$$UserLocationRoles?.length).toEqual(2);
      expect(userLocation.$$UserLocationRoles[1].RoleName).toEqual('Hygienist');
      expect(userLocation.$$UserLocationRoles[1].RoleId).toEqual(1);
      expect(userLocation.$$UserLocationRoles[1].$$ObjectState).toEqual('Add');
      expect(component.dataHasChanged).toBe(true);
    });

    it('should not add role to userLocation.$$UserLocationRoles and set ObjectState to None if teamMember does have role in userLocation.$$UserLocationRoles with ObjectState = Delete', () => {
      userLocation = {
        LocationId: 1,
        $$UserLocationRoles: [
          { RoleId: 2, RoleName: 'Business Partner', $$ObjectState: 'Delete' },],
      };
      role = { RoleId: 2, RoleName: 'Business Partner' };
      expect(userLocation.$$UserLocationRoles?.length).toEqual(1);
      component.addLocationRole(role, userLocation);
      expect(userLocation.$$UserLocationRoles?.length).toEqual(1);
      expect(userLocation.$$UserLocationRoles[0].RoleName).toEqual('Business Partner');
      expect(userLocation.$$UserLocationRoles[0].RoleId).toEqual(2);
      expect(userLocation.$$UserLocationRoles[0].$$ObjectState).toEqual('None');
    });
  });


  describe('validateUserLocationRoles --> ', () => {
    let userLocation;

    beforeEach(() => {
      component.authAccess.Delete = true;
      component.selectedLocations = [{ LocationId: 1 }]
      userLocation = {
        LocationId: 1,
        $$UserLocationRoles: [
          { RoleId: 1, RoleName: 'Hygienist', $$ObjectState: 'Add' },
          { RoleId: 2, RoleName: 'Business Partner', $$ObjectState: 'Delete' },
          { RoleId: 3, RoleName: 'Assistant', $$ObjectState: 'Add' },
          { RoleId: 4, RoleName: 'Associate Dentist' },
        ],
      };
    });

    it('should return true if userLocation is null', () => {
      component.validateUserLocationRoles(null);
      expect(component.validateUserLocationRoles(null)).toBe(true);
    });

    it('should return false if userLocation.$$UserLocationRoles does not have at least one location role with $$ObjectState other than Delete on save', () => {
      userLocation.$$UserLocationRoles = [];
      component.validateUserLocationRoles(userLocation);
      expect(component.validateUserLocationRoles(userLocation)).toBe(false)
      expect(userLocation.$$NoRoleError).toBe(true)
    });

    it('should return false if userLocation.$$UserLocationRoles does not have at least one location role with $$ObjectState other than Delete on save', () => {
      userLocation.$$UserLocationRoles = [
        { RoleId: 2, RoleName: 'Business Partner', $$ObjectState: 'Delete' }];
      component.validateUserLocationRoles(userLocation);
      expect(component.validateUserLocationRoles(userLocation)).toBe(false)
      expect(userLocation.$$NoRoleError).toBe(true)
    });

    it('should return true if userLocation.$$UserLocationRoles does have at least one location role with $$ObjectState other than Delete on save', () => {
      component.validateUserLocationRoles(userLocation);
      expect(component.validateUserLocationRoles(userLocation)).toBe(true)
      expect(userLocation.$$NoRoleError).toBe(false)
    });
  });

  describe('removeLocationRole --> ', () => {
    let userLocation;
    beforeEach(() => {
      component.authAccess.Delete = true;
      userLocation = {
        LocationId: 1,
        $$UserLocationRoles: [
          { RoleId: 1, RoleName: 'Hygienist', $$ObjectState: 'Add' },
        ],
        $$AvailableRoles: []
      };
    });

    it('should set userLocationRole.$$ObjectState to None if $$ObjectState was Add in userLocation.$$UserLocationRoles', () => {
      let userLocationRole = userLocation.$$UserLocationRoles[0];
      expect(userLocation.$$UserLocationRoles[0].RoleName).toEqual('Hygienist');
      expect(userLocation.$$UserLocationRoles[0].$$ObjectState).toEqual('Add');
      component.removeLocationRole(userLocationRole, userLocation);
      expect(userLocation.$$UserLocationRoles[0]).toBeUndefined();
      expect(component.dataHasChanged).toBe(true);
    });

    it('should set userLocationRole.$$ObjectState to Delete if $$ObjectState was None or null in userLocation.$$UserLocationRoles', () => {
      let userLocationRole = userLocation.$$UserLocationRoles[0];
      userLocationRole.$$ObjectState = null;
      component.removeLocationRole(userLocationRole, userLocation);
      expect(userLocation.$$UserLocationRoles[0].RoleName).toEqual('Hygienist');
      expect(userLocation.$$UserLocationRoles[0].$$ObjectState).toEqual('Delete');
      expect(component.dataHasChanged).toBe(true);
    });
  });

  describe('setObjectState --> ', () => {
    let userLocation;
    beforeEach(() => {
      userLocation = {
        LocationId: 1,
        $$UserLocationRoles: [
          { RoleId: 1, RoleName: 'Hygienist' },
          { RoleId: 2, RoleName: 'Business Partner' },],
        $$AvailableRoles: []
      };
    });

    it('should set $$NewObjectState of userRoles', () => {
      component.setObjectState(userLocation.$$UserLocationRoles, mockSaveStates.Add);
      userLocation?.$$UserLocationRoles?.forEach((userRole) => {
        expect(userRole.$$NewObjectState).toEqual(mockSaveStates.Add);
      });

      component.setObjectState(userLocation.$$UserLocationRoles, mockSaveStates.Delete);
      userLocation?.$$UserLocationRoles?.forEach((userRole) => {
        expect(userRole.$$NewObjectState).toEqual(mockSaveStates.Delete);
      });
    });
  });

  describe('createUserRolesDto --> ', () => {
    let userLocation;
    beforeEach(() => {
      userLocation = {
        LocationId: 1,
        $$UserLocationRoles: [
          { RoleId: 1, RoleName: 'Hygienist' },
          { RoleId: 2, RoleName: 'Business Partner' },],
        $$AvailableRoles: []
      };
    });

    it('should create and return userRolesDto', () => {
      let returnValue = component.createUserRolesDto(userLocation.$$UserLocationRoles, userLocation.LocationId);
      expect(returnValue.LocationRoles).toEqual({ 1: [1, 2] })
    });
  });

  describe('addLocationAssignment --> ', () => {
    let userLocation;
    beforeEach(() => {
      component.setObjectState = jasmine.createSpy();
      component.authAccess.Create = true;
      userLocation = {
        LocationId: 1,
        $$UserLocationRoles: mockUserLocationRoles,
      };
    });

    it('should call userServices.UserRoles.save', () => {
      component.addLocationAssignment(1, userLocation.$$UserLocationRoles, 1);
      expect(mockUserServices.UserRoles.save).toHaveBeenCalled();
      expect(component.setObjectState).toHaveBeenCalled();
    });
  });

  describe('processRoleAssignmentsByTeamMember --> ', () => {
    let teamMember = { UserId: 2, $$UserLocations: [], $$UserPracticeRoles: [] };

    beforeEach(() => {
      component.authAccess.Delete = true;
      component.selectedLocations = [{ LocationId: 1 }]
      teamMember.$$UserLocations.push({
        LocationId: 1,
        $$UserLocationRoles: [
        ],
      });
      teamMember.$$UserLocations[0].$$UserLocationRoles.push({ RoleId: 1, RoleName: 'Hygienist', $$ObjectState: 'Add' });
      teamMember.$$UserLocations[0].$$UserLocationRoles.push({ RoleId: 2, RoleName: 'Business Partner', $$ObjectState: 'Add' });
      teamMember.$$UserLocations[0].$$UserLocationRoles.push({ RoleId: 3, RoleName: 'Assistant', $$ObjectState: 'Add' });
      teamMember.$$UserLocations[0].$$UserLocationRoles.push({ RoleId: 4, RoleName: 'Associate Dentist', $$ObjectState: 'Delete' });
      let res = { then: jasmine.createSpy() };
      httpClient.delete = jasmine.createSpy().and.returnValue({ toPromise: () => res })
    });

    it('should return a list of serviceCalls for each team member based on the number of adds and deletes  in current location ', () => {
      let processes = component.processRoleAssignmentsByTeamMember(teamMember)
      expect(processes?.length).toEqual(2);
    });
  });

  describe('updateRoleAssignments --> ', () => {
    let userLocation;
    beforeEach(() => {
      component.authAccess.Delete = true;
      component.selectedLocations = [{ LocationId: 1 }]
      userLocation = {
        LocationId: 1,
        $$UserLocationRoles: [
          { RoleId: 1, RoleName: 'Hygienist', $$ObjectState: 'Add' },
          { RoleId: 2, RoleName: 'Business Partner', $$ObjectState: 'Delete' },
          { RoleId: 3, RoleName: 'Assistant', $$ObjectState: 'Add' },
          { RoleId: 4, RoleName: 'Associate Dentist' },
        ],
      };
    });

    it('should remove a failed locationRole from $$UserLocationRoles', () => {
      userLocation.$$UserLocationRoles[0].$$ObjectState = 'Add';
      userLocation.$$UserLocationRoles[0].$$NewObjectState = 'Failed';
      component.updateRoleAssignments(userLocation, userLocation.$$UserLocationRoles[0]);
      expect(userLocation.$$UserLocationRoles?.length).toEqual(3)
      expect(userLocation.$$UserLocationRoles[0].RoleName).toEqual('Business Partner')
    });

    it('should remove a successful locationRole from $$UserLocationRoles when ObjectState is Delete', () => {
      userLocation.$$UserLocationRoles[0].$$ObjectState = 'Delete';
      userLocation.$$UserLocationRoles[0].$$NewObjectState = 'Successful';
      component.updateRoleAssignments(userLocation, userLocation.$$UserLocationRoles[0]);
      expect(userLocation.$$UserLocationRoles?.length).toEqual(3)
      expect(userLocation.$$UserLocationRoles[0].RoleName).toEqual('Business Partner')
    });
  });

  describe('validateUserLocationRoles --> ', () => {
    let userLocation;
    beforeEach(() => {
      component.authAccess.Delete = true;
      component.selectedLocations = [{ LocationId: 1 }]
      userLocation = {
        LocationId: 1,
        $$UserLocationRoles: [
          { RoleId: 1, RoleName: 'Hygienist', $$ObjectState: 'Add' },
          { RoleId: 2, RoleName: 'Business Partner', $$ObjectState: 'Delete' },
          { RoleId: 3, RoleName: 'Assistant', $$ObjectState: 'Add' },
          { RoleId: 4, RoleName: 'Associate Dentist' },
        ],
      };
    });

    it('should return false if userLocation.$$UserLocationRoles does not have at least one location role with $$ObjectState other than Delete on save', () => {
      userLocation.$$UserLocationRoles = [];
      component.validateUserLocationRoles(userLocation);
      expect(component.validateUserLocationRoles(userLocation)).toBe(false)
      expect(userLocation.$$NoRoleError).toBe(true)
    });

    it('should return false if userLocation.$$UserLocationRoles does not have at least one location role with $$ObjectState other than Delete on save', () => {
      userLocation.$$UserLocationRoles = [
        { RoleId: 2, RoleName: 'Business Partner', $$ObjectState: 'Delete' }];
      component.validateUserLocationRoles(userLocation);
      expect(component.validateUserLocationRoles(userLocation)).toBe(false)
      expect(userLocation.$$NoRoleError).toBe(true)
    });

    it('should return true if userLocation.$$UserLocationRoles does have at least one location role with $$ObjectState other than Delete on save', () => {
      component.validateUserLocationRoles(userLocation);
      expect(component.validateUserLocationRoles(userLocation)).toBe(true)
      expect(userLocation.$$NoRoleError).toBe(false)
    });
  });

  describe('validateRoleAssigments --> ', () => {
    //second user has only one role with a Delete state so will fail

    beforeEach(() => {
      component.users = [{
        UserId: 1, $$UserLocations: [{
          LocationId: 1,
          $$UserLocationRoles: [
            { RoleId: 1, RoleName: 'Hygienist', $$ObjectState: 'Add' },
            { RoleId: 2, RoleName: 'Business Partner', $$ObjectState: 'Delete' },
            { RoleId: 3, RoleName: 'Assistant', $$ObjectState: 'Add' },
            { RoleId: 4, RoleName: 'Associate Dentist' },
          ]
        }]
      },
      {
        UserId: 2, $$UserLocations: [{
          LocationId: 1,
          $$UserLocationRoles: [
            { RoleId: 2, RoleName: 'Business Partner', $$ObjectState: 'Delete' },
          ]
        }]
      },];
      component.selectedLocations = [{ LocationId: 1 }]

    });

    it('should return set formIsValid to false if any validateUserLocationRoles returns false for any userLocation', () => {
      component.validateRoleAssigments();
      expect(component.formIsValid).toBe(false);
    });

    it('should return set formIsValid to true if any validateUserLocationRoles returns true for all userLocation', () => {
      // add a role to second user
      component.users[1].$$UserLocations[0].$$UserLocationRoles.push({ RoleId: 4, RoleName: 'Associate Dentist' });
      component.validateRoleAssigments();
      expect(component.formIsValid).toBe(true);
    });
  });

  describe('cancelListChanges --> ', () => {
    it('should call CancelModal if dataHasChanged is true', () => {
      component.dataHasChanged = true;
      component.cancelListChanges();
      expect(mockModalFactoryService.CancelModal).toHaveBeenCalled();
    });

    it('should call cancelChanges if dataHasChanged is false', () => {
      spyOn(component, 'cancelChanges')
      component.dataHasChanged = false;
      component.cancelListChanges();
      expect(component.cancelChanges).toHaveBeenCalled();
    });
  });

  //   describe('cancelChanges', () => {
  //     //UT for this method is not possible as it has window.location.href = '#/BusinessCenter/PracticeSettings/'; which is causing issue

  //   });

  describe('refreshList --> ', () => {
    //second user has only one role with a Delete state so will fail

    beforeEach(() => {
      component.authAccess.Delete = true;
      component.selectedLocations = [{ LocationId: 1 }]
      spyOn(component, 'updateRoleAssignments')
      spyOn(component, 'setAvailableRolesByUserLocation')
    });

    it('should call component.updateRoleAssignments for each userLocation and userLocationRoles );', () => {
      component.users = mockUser;
      component.users[0].$$UserLocations.push({ RoleId: 1, RoleName: 'Hygienist', LocationId: 1, $$UserLocationRoles: [{ RoleId: 1, RoleName: 'Hygienist' }] });
      component.refreshList();
      expect(component.updateRoleAssignments).toHaveBeenCalled();
      expect(component.setAvailableRolesByUserLocation).toHaveBeenCalled();
    });

    it('should call component.setAvailableRolesByUserLocation for each userLocation if no userLocationRoles found', () => {
      component.users = mockUser;
      component.users[0].$$UserLocations.push({ RoleId: 1, RoleName: 'Hygienist', LocationId: 1, $$UserLocationRoles: [] });
      component.refreshList();
      expect(component.setAvailableRolesByUserLocation).toHaveBeenCalled();
    });
  });

  describe('saveRolesByLocation --> ', () => {
    //second user has only one role with a Delete state so will fail

    beforeEach(() => {
      spyOn(component, 'updateRoleAssignments')
    });

    it('should call component.updateRoleAssignments for each userLocation and userLocationRoles );', () => {
      component.refreshList();

      component.users?.forEach((user) => {
        var userLocation = user.$$UserLocations;
        if (userLocation.$$UserLocationRoles) {
          for (var i = userLocation.$$UserLocationRoles?.length - 1; i >= 0; i--) {
            expect(component.updateRoleAssignments).toHaveBeenCalledWith(userLocation, userLocation.$$UserLocationRoles[i]);
          };
        }
      });
    });

    it('should not call component.validateRoleAssigments if formIsValid is false', () => {
      spyOn(component, 'validateRoleAssigments').and.returnValue(false);
      spyOn(component, 'processRoleAssignments')
      component.formIsValid = false;
      component.saveRolesByLocation();
      expect(component.processRoleAssignments).not.toHaveBeenCalled();
    });

    it('should call component.processRoleAssignments if formIsValid', () => {
      spyOn(component, 'validateRoleAssigments').and.returnValue(false);
      spyOn(component, 'processRoleAssignments')
      component.formIsValid = true;
      component.saveRolesByLocation();
      expect(component.processRoleAssignments).toHaveBeenCalled();
    });
  });

  describe('revertUnsavedChanges --> ', () => {
    beforeEach(() => {
      spyOn(component, 'updateRoleAssignments');
      component.users = mockUser;
      component.users[0].$$UserLocations.push({
        RoleId: 1, RoleName: 'Hygienist', LocationId: 1, $$UserLocationRoles: [
          { RoleId: 1, RoleName: 'Hygienist' },
          { RoleId: 2, RoleName: 'Business Partner' }]
      });
      component.selectedLocations.push({ LocationId: mockCurrentLocation.id });
    });

    it('should revert all unsaved changes with $$ObjectState.Delete to $$ObjectState.None on cancel changes ', () => {
      component.users?.forEach((users) => {
        users?.$$UserLocations?.forEach((userLocation) => {
          userLocation?.$$UserLocationRoles?.forEach((userLocationRole) => {
            userLocationRole.$$ObjectState = 'Delete';
          })
        })
      })
      component.revertUnsavedChanges();
      component.users?.forEach((users) => {
        users?.$$UserLocations?.forEach((userLocation) => {
          userLocation?.$$UserLocationRoles?.forEach((userLocationRole) => {
            userLocationRole.$$ObjectState = 'none';
          })
        })
      })
    });

    it('should revert all unsaved changes with $$ObjectState.Add to $$ObjectState.None on cancel changes ', () => {
      component.users?.forEach((users) => {
        users?.$$UserLocations?.forEach((userLocation) => {
          userLocation?.$$UserLocationRoles?.forEach((userLocationRole) => {
            userLocationRole.$$ObjectState = 'Add';
          })
        })
      })
      component.revertUnsavedChanges();
      component.users.forEach((users) => {
        users?.$$UserLocations?.forEach((userLocation) => {
          userLocation?.$$UserLocationRoles?.forEach((userLocationRole) => {
            userLocationRole.$$ObjectState = 'none';
          })
        })
      })
    });

    it('should revert all unsaved changes with $$ObjectState.Add to $$ObjectState.None on cancel changes ', () => {
      spyOn(component, 'setAvailableRolesByUserLocation')
      component.revertUnsavedChanges();
      component.users?.forEach((users) => {
        users?.$$UserLocations?.forEach((userLocation) => {
          expect(component.setAvailableRolesByUserLocation).toHaveBeenCalledWith(userLocation);
          expect(userLocation.$$NoRoleError).toBe(false)
        })
      })
      expect(component.formIsValid).toBe(true);
    });
  });

  describe('resetData -->', () => {
    it('should set dataHasChanged is false', () => {
      component.dataHasChanged = true;
      component.resetData();
      expect(component.dataHasChanged).toBe(false);
    })
  });

  describe('showTitle -->', () => {
    it('should set title to current object if no delete access', () => {
      component.authAccess.Delete = false;
      let objData = {
        currentTarget: {
          title: ""
        }
      }
      component.titleMessage = "Set Title Message";
      component.showTitle(objData);
      expect(objData.currentTarget.title).toEqual("Set Title Message");
    })

    it('should not set title to current object if no delete access', () => {
      component.authAccess.Delete = true;
      let objData = {
        currentTarget: {
          title: ""
        }
      }
      component.titleMessage = "Set Title Message";
      component.showTitle(objData);
      expect(objData.currentTarget.title).toEqual("");
    })
  })

  describe('getSelectedList-->', () => {
    it('should filtere Users as per the $$UserLocations & $$UserLocationRoles', () => {
      mockUser[0].$$UserLocations.push({ LocationId: 1, NameLine1: "Alaska", $$UserLocationRoles: [{ RoleId: 1 }] });
      component.copyUser = mockUser;
      expect(component.users?.length).toBe(2);
      component.getSelectedList(mockUserLocationRoles);
      expect(component.users?.length).toBe(0);
    })

    it('should filter Users as per the $$UserPracticeRoles', () => {
      mockUser[0].$$UserLocations = [{ $$UserLocationRoles: [] }];
      mockUser[0].$$UserPracticeRoles.push({ RoleId: 1, RoleName: 'Hygienist' });
      mockUser[0].$$AvailableRoles = [];
      component.copyUser = mockUser;
      expect(component.users?.length).toBe(2);
      component.getSelectedList(mockUserLocationRoles);
      expect(component.users?.length).toBe(1);
    })

    it('should return all users if not roles mentioned', () => {
      component.copyUser = mockUser;
      expect(component.users?.length).toBe(2);
      component.getSelectedList([]);
      expect(component.users?.length).toBe(2);
    })
  })

  describe('isItemDisabled -->', () => {
    it('should return true if index is -1', () => {
      let dataItem = {
        RoleName: "Select role to add",
        index: -1
      }
      let tempResult = component.isItemDisabled(dataItem);
      expect(tempResult).toBe(true);
    })
    it('should return false if index is greater than -1', () => {
      let dataItem = {
        RoleName: "",
        index: 0
      }
      let tempResult = component.isItemDisabled(dataItem);
      expect(tempResult).toBe(false);
    })
  })

});
