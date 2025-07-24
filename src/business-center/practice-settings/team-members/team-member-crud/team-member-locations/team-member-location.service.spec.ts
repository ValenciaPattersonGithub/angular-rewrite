import { TestBed } from '@angular/core/testing';
import moment from 'moment';
import { TeamMemberLocationService } from './team-member-location.service';
import { LocationTimeService } from 'src/practices/common/providers';
import { RoleNames, TeamMemberLocations, TeamMemberRoles, User, UserLocationSetup, providerTypes } from '../../team-member';
import { SaveStates } from 'src/@shared/models/transaction-enum';


describe('TeamMemberLocationSetupService', () => {
  let service: TeamMemberLocationService;

  const teamMemberRoles: TeamMemberRoles = {
    EnterpriseRoles: [],
    PracticeRoles: {
      38638: [
        {
          RoleId: 190786,
          PracticeId: null,
          RoleName: "Practice Admin/Exec. Dentist",
          RoleDesc: "Practice Administrator or Executive Dentist for Fuse Practices",
          ApplicationId: 2,
          DataTag: "AAAAACXqGIk=",
          UserModified: "00000000-0000-0000-0000-000000000000",
          DateModified: "2023-06-28T23:07:49.6584494"
        }
      ]
    },
    LocationRoles: {
      5402716: [
        {
          RoleId: 436554,
          PracticeId: null,
          RoleName: "Add on Administrative Setup Rights",
          RoleDesc: "Add-on Administrative Setup Rights for Fuse Practices",
          ApplicationId: 2,
          DataTag: "AAAAACXqGJQ=",
          UserModified: "00000000-0000-0000-0000-000000000000",
          DateModified: "2023-06-28T23:07:49.6584494"
        },
        {
          RoleId: 1432729,
          PracticeId: null,
          RoleName: "Add on Clinical Reporting Rights",
          RoleDesc: "Only use reporting for Clinical Reports",
          ApplicationId: 2,
          DataTag: "AAAAACXqGKM=",
          UserModified: "00000000-0000-0000-0000-000000000000",
          DateModified: "2023-06-28T23:07:49.6584494"
        }
      ],
      6265689: [
        {
          RoleId: 436554,
          PracticeId: null,
          RoleName: "Add on Administrative Setup Rights",
          RoleDesc: "Add-on Administrative Setup Rights for Fuse Practices",
          ApplicationId: 2,
          DataTag: "AAAAACXqGJQ=",
          UserModified: "00000000-0000-0000-0000-000000000000",
          DateModified: "2023-06-28T23:07:49.6584494"
        }
      ],
      6173202: [
        {
          RoleId: 436555,
          PracticeId: null,
          RoleName: "Add on Clinical Setup Rights",
          RoleDesc: "Add-on Clinical Setup Rights for Fuse Practices",
          ApplicationId: 2,
          DataTag: "AAAAACXqGJU=",
          UserModified: "00000000-0000-0000-0000-000000000000",
          DateModified: "2023-06-28T23:07:49.6584494"
        }
      ]
    }
  }

  const mockPermittedLocations: Array<TeamMemberLocations> = [{
    LocationId: 6265689,
    NameLine1: "AA.pntggwjctlcrypokikmezf",
    NameLine2: null,
    NameAbbreviation: "AA.pntggwjctlcrypoki",
    DeactivationTimeUtc: null,
    Timezone: "Central Standard Time",
    State: "AL",
    DataTag: "AAAAAAAoqYg=",
    UserModified: "a162c864-8f50-4e84-8942-7194bc8070cf",
    DateModified: "2023-06-28T17:03:18.2273796"
  },
  {
    LocationId: 6173202,
    NameLine1: "ABC Location",
    NameLine2: null,
    NameAbbreviation: "Manual",
    DeactivationTimeUtc: new Date(2023, 10, 12),
    Timezone: "Mountain Standard Time",
    State: "AZ",
    DataTag: "AAAAAAAnBwU=",
    UserModified: "a162c864-8f50-4e84-8942-7194bc8070cf",
    DateModified: "2023-05-12T09:08:05.8070064"
  },
  {
    LocationId: 6173199,
    NameLine1: "AA Location",
    NameLine2: null,
    NameAbbreviation: "Abcd",
    DeactivationTimeUtc: null,
    Timezone: "Hawaiian Standard Time",
    State: "AL",
    DataTag: "AAAAAAAoilE=",
    UserModified: "a162c864-8f50-4e84-8942-7194bc8070cf",
    DateModified: "2023-06-26T13:31:10.8473231"
  },
  {
    LocationId: 6296981,
    NameLine1: "Aabb test 123wee",
    NameLine2: "Pract  001",
    NameAbbreviation: "Aab practice",
    DeactivationTimeUtc: null,
    Timezone: "Central Standard Time",
    State: "AK",
    DataTag: "AAAAAAAokU4=",
    UserModified: "a162c864-8f50-4e84-8942-7194bc8070cf",
    DateModified: "2023-06-27T08:33:42.7917752"
  },
  {
    LocationId: 6296980,
    NameLine1: "Ad practice",
    NameLine2: "Pract",
    NameAbbreviation: "Ad practice",
    DeactivationTimeUtc: null,
    Timezone: "Alaskan Standard Time",
    State: "AK",
    DataTag: "AAAAAAAnBXU=",
    UserModified: "a162c864-8f50-4e84-8942-7194bc8070cf",
    DateModified: "2023-05-12T08:42:51.3762757"
  }]

  const providerTypes: Array<providerTypes> = [{
    Id: 1, Name: 'Dentist'
  }, {
    Id: 2, Name: 'Hygienist'
  }, {
    Id: 3, Name: 'Assistant'
  }, {
    Id: 4, Name: 'No A Provider'
  }, {
    Id: 5, Name: 'Others'
  }]

  const mockLocations = [{
    LocationId: 6265689,
    NameLine1: "AA.pntggwjctlcrypokikmezf",
    NameLine2: null,
    NameAbbreviation: "AA.pntggwjctlcrypoki",
    DeactivationTimeUtc: null,
    Timezone: "Central Standard Time",
    State: "AL",
    DataTag: "AAAAAAAoqYg=",
    UserModified: "a162c864-8f50-4e84-8942-7194bc8070cf",
    DateModified: "2023-06-28T17:03:18.2273796"
  },
  {
    LocationId: 6173202,
    NameLine1: "ABC Location",
    NameLine2: null,
    NameAbbreviation: "Manual",
    DeactivationTimeUtc: null,
    Timezone: "Mountain Standard Time",
    State: "AZ",
    DataTag: "AAAAAAAnBwU=",
    UserModified: "a162c864-8f50-4e84-8942-7194bc8070cf",
    DateModified: "2023-05-12T09:08:05.8070064"
  },
  {
    LocationId: 6173199,
    NameLine1: "AA Location",
    NameLine2: null,
    NameAbbreviation: "Abcd",
    DeactivationTimeUtc: null,
    Timezone: "Hawaiian Standard Time",
    State: "AL",
    DataTag: "AAAAAAAoilE=",
    UserModified: "a162c864-8f50-4e84-8942-7194bc8070cf",
    DateModified: "2023-06-26T13:31:10.8473231"
  },
  {
    LocationId: 6296981,
    NameLine1: "Aabb test 123wee",
    NameLine2: "Pract  001",
    NameAbbreviation: "Aab practice",
    DeactivationTimeUtc: null,
    Timezone: "Central Standard Time",
    State: "AK",
    DataTag: "AAAAAAAokU4=",
    UserModified: "a162c864-8f50-4e84-8942-7194bc8070cf",
    DateModified: "2023-06-27T08:33:42.7917752"
  },
  {
    LocationId: 6296980,
    NameLine1: "Ad practice",
    NameLine2: "Pract",
    NameAbbreviation: "Ad practice",
    DeactivationTimeUtc: null,
    Timezone: "Alaskan Standard Time",
    State: "AK",
    DataTag: "AAAAAAAnBXU=",
    UserModified: "a162c864-8f50-4e84-8942-7194bc8070cf",
    DateModified: "2023-05-12T08:42:51.3762757"
  }]

  const mockAmfaInfo = {
    "plapi-user-usrrol-create": { "ActionId": "2255", "ActionName": "Get", "ItemType": "Permitted Locations" },
  };

  const mockUser: User = {
    UserId: "a44a11a9-ead7-4586-b4ca-f77e70f078dc",
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
    $$locations: [],
    $$isPracticeAdmin: true,
    DepartmentName: ""
  };

  const mockUsers = [{
    UserId: "a44a11a9-ead7-4586-b4ca-f77e70f078dc",
    FirstName: 'John',
    Locations: []
  }, {
    UserId: "a44a11a9-ead7-4586-b4ca-f77e34534555",
    FirstName: 'David',
    Locations: []
  }, {
    UserId: "a44a11a9-ead7-4586-b4ca-f77e7weee333",
    FirstName: 'Joy',
    Locations: [{ LocationId: 123 }]
  }]

  const mockUserLocationSetup: Array<UserLocationSetup> = [{
    UserProviderSetupLocationId: "9901289f-033f-4cb2-b72d-2a47af50ca6a",
    UserId: "a44a11a9-ead7-4586-b4ca-f77e70f078dc",
    LocationId: 6265689,
    ProviderTypeId: 4,
    ProviderOnClaimsRelationship: 0,
    ProviderOnClaimsId: "a44a11a9-ead7-4586-b4ca-f77e34534555",
    Color: null,
    ProviderQualifierType: 0,
    ObjectState: SaveStates.Update,
    FailedMessage: null,
    IsActive: true,
    DataTag: "AAAAAAAofWs=",
    UserModified: "a162c864-8f50-4e84-8942-7194bc8070cf",
    DateModified: "2023-06-23T16:01:13.5199118",
    $$UserLocationRoles: [],
    $$Location: null
  },
  {
    UserProviderSetupLocationId: "7d29c55a-d553-4bb8-971c-6bf60234e2a3",
    UserId: "a44a11a9-ead7-4586-b4ca-f77e70f078dc",
    LocationId: 6173199,
    ProviderTypeId: 4,
    ProviderOnClaimsRelationship: 0,
    ProviderOnClaimsId: null,
    Color: null,
    ProviderQualifierType: 0,
    ObjectState: SaveStates.None,
    FailedMessage: null,
    IsActive: true,
    DataTag: "AAAAAAAofAg=",
    UserModified: "a162c864-8f50-4e84-8942-7194bc8070cf",
    DateModified: "2023-06-23T11:39:23.0754927",
    $$UserLocationRoles: [],
    $$Location: null
  },
  {
    UserProviderSetupLocationId: "fbc3a0bc-9c56-430c-94e8-96aef0f6fee2",
    UserId: "a44a11a9-ead7-4586-b4ca-f77e70f078dc",
    LocationId: 6296980,
    ProviderTypeId: 4,
    ProviderOnClaimsRelationship: 0,
    ProviderOnClaimsId: null,
    Color: null,
    ProviderQualifierType: 0,
    ObjectState: SaveStates.Add,
    FailedMessage: null,
    IsActive: true,
    DataTag: "AAAAAAAofDY=",
    UserModified: "a162c864-8f50-4e84-8942-7194bc8070cf",
    DateModified: "2023-06-23T11:50:55.660244",
    $$UserLocationRoles: [],
    $$Location: null
  },
  {
    UserProviderSetupLocationId: "e106402f-b88c-406e-9762-a340b7ab0e8c",
    UserId: "a44a11a9-ead7-4586-b4ca-f77e70f078dc",
    LocationId: 6173202,
    ProviderTypeId: 1,
    ProviderOnClaimsRelationship: 1,
    ProviderOnClaimsId: null,
    Color: null,
    ProviderQualifierType: 2,
    ObjectState: SaveStates.Delete,
    FailedMessage: null,
    IsActive: true,
    DataTag: "AAAAAAAofWw=",
    UserModified: "a162c864-8f50-4e84-8942-7194bc8070cf",
    DateModified: "2023-06-23T16:01:13.5199118",
    $$UserLocationRoles: [],
    $$Location: null
  }]

  const mockUserServices = {
    UserLocationSetups: {
      create: jasmine.createSpy().and.returnValue({ Value: { UserId: "a44a11a9-ead7-4586-b4ca-f77e70f078dc" } }),
      update: jasmine.createSpy().and.returnValue({ $promise: { then: jasmine.createSpy() } }),
      deconste: jasmine.createSpy().and.returnValue({ $promise: { then: jasmine.createSpy() } }),
      get: jasmine.createSpy().and.returnValue({ $promise: { then: jasmine.createSpy() } }),
      delete: jasmine.createSpy().and.returnValue({ $promise: { then: jasmine.createSpy() } })
    },

  };

  const mockStaticDataService = {
    ProviderTypes: jasmine.createSpy()
  };

  const mockReferenceDataService = {
    get: jasmine.createSpy().and.returnValue(mockUsers),
    entityNames: {
      practiceSettings: 'test'
    }
  }

  const mockRolesFactory = {
    access: jasmine.createSpy().and.returnValue({}),
    Roles: jasmine.createSpy().and.returnValue({
      then: jasmine.createSpy().and.returnValue({})
    }),
    UserRoles: jasmine.createSpy().and.returnValue({
      then: jasmine.createSpy().and.returnValue({})
    }),
    AllPracticeAdmins: jasmine.createSpy().and.returnValue({
      then: jasmine.createSpy().and.returnValue({
        $promise: {
          then: (res) => {
            res({ Result: {} })
          }
        }
      })
    }),
    GetInactiveUserAssignedRoles: jasmine.createSpy().and.returnValue({
      then: jasmine.createSpy().and.returnValue({})
    }),
  };

  const mockLocationServices = {
    get: () => {
      return {
        $promise: {
          then: (res, error) => {
            res({ Result: {} }),
              error({
                data: {
                  InvalidProperties: [{
                    PropertyName: "",
                    ValidationMessage: ""
                  }]
                }
              })
          }
        }
      }
    },
    getPermittedLocations: jasmine.createSpy().and.returnValue({
      then: jasmine.createSpy().and.returnValue({})
    })
  };

  const mockTimeZoneFactory = {
    convertDateToMomentTZ: jasmine.createSpy('mockTimeZoneFactory.ConvertDateToMomentTZ')
      .and.callFake((date) => { return moment(date); }),
    getTimezoneInfo: jasmine.createSpy('mockTimeZoneFactory.ConvertDateToMomentTZ')
      .and.callFake((date) => { return moment(date); }),

  };

  const mockLocalizeService = {
    getLocalizedString: () => 'translated text'
  }

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [],
      providers: [
        { provide: 'StaticData', useValue: mockStaticDataService },
        { provide: 'RolesFactory', useValue: mockRolesFactory },
        { provide: 'AmfaInfo', useValue: mockAmfaInfo },
        { provide: 'LocationServices', useValue: mockLocationServices },
        { provide: 'localize', useValue: mockLocalizeService },
        { provide: 'referenceDataService', useValue: mockReferenceDataService },
        { provide: 'UserServices', useValue: mockUserServices },
        { provide: LocationTimeService, useValue: mockTimeZoneFactory }
      ]
    });
    service = TestBed.inject(TeamMemberLocationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getProviderTypes =>', () => {
    it('should call StaticDataService.ProviderTypes', () => {
      service.getProviderTypes();
      expect(mockStaticDataService.ProviderTypes).toHaveBeenCalled();
    });
  });

  describe('getRoles =>', () => {
    it('should call rolesFactory.Roles', () => {
      service.getRoles();
      expect(mockRolesFactory.Roles).toHaveBeenCalled();
    });

    it('should call resolve on Success API call', () => {
      service.getRoles();
      mockRolesFactory.Roles = jasmine.createSpy().and.callFake(() => {
        return new Promise((resolve) => {
          const res = { value: 123 };
          resolve(res);
        });
      });

      mockRolesFactory.Roles().then(
        res => {
          expect(res.value).toEqual(123);
        }
      )
    });

    it('should call reject on Failed API call', () => {
      const msg = 'Not found';
      const apiSucceed = false;
      service.getRoles();
      mockRolesFactory.Roles = jasmine.createSpy().and.callFake(() => {
        return new Promise((resolve, reject) => {
          if (apiSucceed) {
            const res = { value: true };
            resolve(res);
          } else {
            const error = { error: 'Not found' };
            reject(error);
          }
        },);
      });

      mockRolesFactory.Roles().then(
        (res) => {
          expect(res.value).toEqual(true);
        },
        (err) => {
          expect(err.error).toEqual(msg);
        }
      )
    });

    it('should call resolve on Success API call', () => {
      service.getRoles();
      expect(mockRolesFactory.Roles).toHaveBeenCalled();
    });
  });

  describe('getPermittedLocations =>', () => {
    it('should call LocationServices.getPermittedLocations', () => {
      service.getPermittedLocations();
      expect(mockLocationServices.getPermittedLocations).toHaveBeenCalled();
    });

    it('should call resolve on Success API call', () => {
      service.getPermittedLocations();
      mockLocationServices.getPermittedLocations().then(
        res => {
          expect(res.value).toEqual(123);
        }
      )
    });

    it('should call reject on Failed API call', () => {
      const msg = 'Not found';
      service.getPermittedLocations();
      mockLocationServices.getPermittedLocations = jasmine.createSpy().and.callFake(() => {
        return new Promise((resolve, reject) => {
          const error = { error: 'Not found' }
          reject(error);
        });
      });

      mockLocationServices.getPermittedLocations().then(
        err => {
          expect(err.error).toEqual(msg)
        }
      )
    });
  });

  describe('getGroupedLocations =>', () => {
    it('should set InactiveDate', () => {
      let data = mockPermittedLocations;
      data[0].DeactivationTimeUtc = new Date();
      data[0].InactiveDate = undefined;
      service.getGroupedLocations(data);
      expect(data[0].NameLine1).toEqual(mockPermittedLocations[0].NameLine1);
      expect(data[0].InactiveDate).not.toEqual(undefined);
    });

    it('should return all Locations, when there is de activation location', () => {
      let data = mockPermittedLocations;
      data[0].DeactivationTimeUtc = new Date();
      data[0].InactiveDate = undefined;
      const res = service.getGroupedLocations(data);
      expect(res.length).toBeGreaterThan(0);
    });

    it('should return all Locations, when there is ctivation location', () => {
      let data = mockPermittedLocations;
      data[0].DeactivationTimeUtc = null;
      data[0].InactiveDate = undefined;
      const res = service.getGroupedLocations(data);
      expect(res.length).toBeGreaterThan(0);
    });

  });

  describe('saveUserLocationSetups =>', () => {
    it('should call addUserLocationSetups', () => {
      spyOn(service, 'addUserLocationSetups');
      let locationWithSaveAction = [];
      locationWithSaveAction.push(mockUserLocationSetup[2]);
      service.saveUserLocationSetups(locationWithSaveAction);
      expect(service.addUserLocationSetups).toHaveBeenCalled();
    });

    it('should call updateUserLocationSetups', () => {
      spyOn(service, 'updateUserLocationSetups');
      let locationWithSaveAction = [];
      locationWithSaveAction.push(mockUserLocationSetup[0]);
      service.saveUserLocationSetups(locationWithSaveAction);
      expect(service.updateUserLocationSetups).toHaveBeenCalled();
    });

    it('should call deleteUserLocationSetups', () => {
      spyOn(service, 'deleteUserLocationSetups');
      let locationWithSaveAction = [];
      locationWithSaveAction.push(mockUserLocationSetup[3]);
      service.saveUserLocationSetups(locationWithSaveAction);
      expect(service.deleteUserLocationSetups).toHaveBeenCalled();
    });

  });

  describe('addUserLocationSetups =>', () => {
    it('should call UserLocationSetups.create', () => {
      service.addUserLocationSetups(mockUserLocationSetup);
      expect(mockUserServices.UserLocationSetups.create).toHaveBeenCalled();
    });
  });

  describe('updateUserLocationSetups =>', () => {
    it('should call UserLocationSetups.update', () => {
      service.updateUserLocationSetups(mockUserLocationSetup);
      expect(mockUserServices.UserLocationSetups.update).toHaveBeenCalled();
    });
  });

  describe('deleteUserLocationSetups =>', () => {
    it('should call UserLocationSetups.delete', () => {
      service.deleteUserLocationSetups(mockUserLocationSetup);
      expect(mockUserServices.UserLocationSetups.delete).toHaveBeenCalled();
    });
  });

  describe('getUserRoles =>', () => {
    it('should call RolesFactory.UserRoles', () => {
      const userId = "a44a11a9-ead7-4586-b4ca-f77e70f078dc";
      service.getUserRoles(userId);
      expect(mockRolesFactory.UserRoles).toHaveBeenCalled();
    });
  });

  describe('getUserLocationSetups =>', () => {
    it('should call mockUserServices.UserLocationSetups.get', () => {
      const userId = "a44a11a9-ead7-4586-b4ca-f77e70f078dc";
      service.getUserLocationSetups(userId);
      expect(mockUserServices.UserLocationSetups.get).toHaveBeenCalled();
    });
  });

  describe('getMergedLocationRolesData =>', () => {
    it('should set Object State as None', () => {
      const data = teamMemberRoles;
      const locationData = mockUserLocationSetup;
      service.getMergedLocationRolesData(locationData, teamMemberRoles);
      expect(locationData[0].$$UserLocationRoles.length).toBeGreaterThan(0);
      expect(locationData[0].$$UserLocationRoles[0].$$ObjectState).toEqual(SaveStates.None);
    });
  });

  describe('getMergedPracticeRolesData =>', () => {
    it('should set isPracticeAdmin true', () => {
      const returnedUser = service.getMergedPracticeRolesData(teamMemberRoles, mockUser);
      expect(returnedUser.$$isPracticeAdmin).toEqual(true);
    });

    it('should set isPracticeAdmin as false', () => {
      const data = teamMemberRoles;
      data.PracticeRoles = [];
      const returnedUser = service.getMergedPracticeRolesData(data, mockUser);
      expect(returnedUser.$$isPracticeAdmin).toEqual(false);
    });
  });

  describe('getMergedLocationData =>', () => {
    it('should call', () => {
      let data = mockUserLocationSetup;
      service.getMergedLocationData(data, mockLocations, mockPermittedLocations);
      expect(data[0].$$Location).not.toEqual(null);
    });
  });

  describe('getMergedUserData =>', () => {
    it('should call Provider on Claims is a User', () => {
      let data = mockUserLocationSetup;
      data[0].ProviderOnClaimsRelationship = 2;
      service.getMergedUserData(data, mockUsers, providerTypes);
      expect(data[0].$$ProviderOnClaims).toEqual('David');
    });

    it('should call when Provider on Claims is a Self', () => {
      let data = mockUserLocationSetup;
      data[0].ProviderOnClaimsRelationship = 1;
      service.getMergedUserData(data, mockUsers, providerTypes);
      expect(data[0].$$ProviderOnClaims).toEqual(mockLocalizeService.getLocalizedString());
    });

    it('should call when Provider is Dentist', () => {
      let data = mockUserLocationSetup;
      data[0].ProviderTypeId = 1;
      service.getMergedUserData(data, mockUsers, providerTypes);
      expect(data[0].$$ProviderTypeName).toEqual('Dentist');
    });

    it('should call when ProviderQualifierType is Part Time', () => {
      let data = mockUserLocationSetup;
      data[0].ProviderQualifierType = 1;
      service.getMergedUserData(data, mockUsers, providerTypes);
      expect(data[0].$$ProviderQualifierTypeName).toEqual(mockLocalizeService.getLocalizedString());
    });

    it('should call when ProviderQualifierType is Full Time', () => {
      let data = mockUserLocationSetup;
      data[0].ProviderQualifierType = 2;
      service.getMergedUserData(data, mockUsers, providerTypes);
      expect(data[0].$$ProviderQualifierTypeName).toEqual(mockLocalizeService.getLocalizedString());
    });

  });

  describe('getProvidersByUserLocationSetups =>', () => {
    it('should return list of Providers locations', () => {
      const mockRes = service.getProvidersByUserLocationSetups(123);
      expect(mockReferenceDataService.get).toHaveBeenCalled();
      expect(mockRes.length).toBeGreaterThan(0);

    });
  });

  describe('rxRoleFilter =>', () => {
    it('should return list of non Rx Users', () => {
      const mockRes = service.rxRoleFilter(mockUser);
      expect(mockReferenceDataService.get).toHaveBeenCalled();
      expect(mockRes[0]?.RoleName.toLowerCase()).not.toEqual(RoleNames.RxUser?.toLowerCase());
    });
  });

});
