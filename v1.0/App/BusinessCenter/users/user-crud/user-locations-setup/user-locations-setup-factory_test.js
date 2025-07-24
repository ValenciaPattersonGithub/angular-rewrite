describe('UserLocationsSetupFactory ->', function () {
  var toastrFactory, userLocationsSetupFactory;
  var userServices;

  //#region mock
  var locationUserRolesMock = {
    EnterpriseRoles: [],
    LocationRoles: {
      2: [
        { RoleId: 15, RoleName: 'Add on Administrative Setup Rights' },
        { RoleId: 15, RoleName: 'Add on Security Admin Rights' },
      ],
      3: [{ RoleId: 5, PracticeId: null, RoleName: 'Assistant' }],
    },
    PracticeRoles: {},
  };

  var userLocationSetupsMock = [
    {
      $$CanEditLocation: true,
      $$Location: { LocationId: 2, NameLine1: 'Universal Export' },
      $$ProviderOnClaims: null,
      $$ProviderQualifierTypeName: '',
      $$ProviderTypeName: 'Not a Provider',
      $$UserLocationRoles: [],
      Color: null,
      FailedMessage: null,
      Location: null,
      LocationId: 2,
      ObjectState: 'None',
      ProviderOnClaimsId: '1235',
      ProviderOnClaimsRelationship: 0,
      ProviderQualifierType: 0,
      ProviderTypeId: 4,
      UserId: '1234',
      UserProviderSetupLocationId: '82fd82',
    },
    {
      $$CanEditLocation: true,
      $$Location: { LocationId: 3, NameLine1: 'Flat Branch' },
      $$ProviderOnClaims: null,
      $$ProviderQualifierTypeName: '',
      $$ProviderTypeName: 'Dentist',
      $$UserLocationRoles: [],
      Color: null,
      Location: null,
      LocationId: 3,
      ObjectState: 'None',
      ProviderOnClaimsId: null,
      ProviderOnClaimsRelationship: 0,
      ProviderQualifierType: 0,
      ProviderTypeId: 2,
      UserId: '1234',
      UserProviderSetupLocationId: 'aB354',
    },
  ];

  //#endregion

  //#region mocks

  //#endregion

  //#region services, before each

  beforeEach(module('Soar.Common'));
  beforeEach(module('common.factories'));

  beforeEach(
    module('Soar.BusinessCenter', function ($provide) {
      userServices = {
        UserLocationSetups: {
          create: jasmine.createSpy().and.returnValue({}),
        },
      };
      $provide.value('UserServices', userServices);

      toastrFactory = {};
      toastrFactory.error = jasmine.createSpy();
      toastrFactory.success = jasmine.createSpy();
      $provide.value('toastrFactory', toastrFactory);
    })
  );

  beforeEach(inject(function ($injector) {
    userLocationsSetupFactory = $injector.get('UserLocationsSetupFactory');
  }));

  //#endregion

  describe('MergeLocationRolesData method -> ', function () {
    var userLocationSetups = [];
    var userRoles = [];
    beforeEach(function () {
      userLocationSetups = _.cloneDeep(userLocationSetupsMock);
      userRoles = _.cloneDeep(locationUserRolesMock);
    });

    it('should merge roles data to userLocationSetups', function () {
      userLocationsSetupFactory.MergeLocationRolesData(
        userLocationSetups,
        userRoles
      );
      _.forEach(userRoles.LocationRoles, function (locationRoles, key) {
        var locationId = parseInt(key);
        // find the matching userLocationSetup
        var userLocationSetup = _.find(userLocationSetups, function (item) {
          return item.LocationId === locationId;
        });
        expect(userLocationSetup.$$UserLocationRoles).toEqual(locationRoles);
      });
    });
  });

  describe('MergedPracticeRolesData method -> ', function () {
    var user = { UserId: '1234' };
    var userRoles = [];
    beforeEach(function () {
      userRoles = {
        EnterpriseRoles: [],
        LocationRoles: {},
        PracticeRoles: {
          1: [
            { RoleId: 8, RoleName: 'Practice Admin/Exec. Dentist' },
            { RoleId: 13, RoleName: 'Rx User' },
          ],
        },
      };
    });

    it('should set user.$$UserPracticeRoles based on practiceRoles', function () {
      userLocationsSetupFactory.MergePracticeRolesData(userRoles, user);
      expect(user.$$UserPracticeRoles).toEqual([
        {
          RoleId: 8,
          RoleName: 'Practice Admin/Exec. Dentist',
          $$ObjectState: 'None',
        },
        { RoleId: 13, RoleName: 'Rx User', $$ObjectState: 'None' },
      ]);
    });

    it('should set user.$$isPracticeAdmin to true if one RoleName = Practice Admin/Exec. Dentist ', function () {
      userLocationsSetupFactory.MergePracticeRolesData(userRoles, user);
      expect(user.$$isPracticeAdmin).toBe(true);
    });

    it('should set user.$$isPracticeAdmin to false if no RoleName = Practice Admin/Exec. Dentist ', function () {
      userRoles.PracticeRoles = { 1: [{ RoleId: 13, RoleName: 'Rx User' }] };
      userLocationsSetupFactory.MergePracticeRolesData(userRoles, user);
      expect(user.$$isPracticeAdmin).toBe(false);
    });
  });

  describe('MergeLocationData method -> ', function () {
    var userLocationSetups = [];
    var locations = [];
    var permittedLocations = [];
    beforeEach(function () {
      userLocationSetups = _.cloneDeep(userLocationSetupsMock);
      locations = _.cloneDeep([
        { LocationId: 1, NameLine1: 'Location1' },
        { LocationId: 2, NameLine1: 'Location2' },
        { LocationId: 3, NameLine1: 'Location3' },
        { LocationId: 4, NameLine1: 'Location4' },
      ]);
      permittedLocations = _.cloneDeep([
        { LocationId: 2, NameLine1: 'Location2' },
      ]);
    });

    it('should merge locationData to userLocationsSetups', function () {
      userLocationsSetupFactory.MergeLocationData(
        userLocationSetups,
        locations,
        permittedLocations
      );
      expect(userLocationSetups[0].$$Location).toEqual({
        LocationId: 2,
        NameLine1: 'Location2',
      });
      expect(userLocationSetups[1].$$Location).toEqual({
        LocationId: 3,
        NameLine1: 'Location3',
      });
    });

    it('should set userLocationsSetup.$$CanEditLocation based on permittedLocations', function () {
      userLocationsSetupFactory.MergeLocationData(
        userLocationSetups,
        locations,
        permittedLocations
      );
      expect(userLocationSetups[0].$$CanEditLocation).toBe(true);
      expect(userLocationSetups[1].$$CanEditLocation).toBe(false);
    });
  });

  describe('MergeLocationData method -> ', function () {
    var users = [
      { UserId: '1234' },
      {
        UserId: '1235',
        FirstName: 'Jaime',
        LastName: 'Lannister',
        UserCode: 'LANJA1',
      },
      {
        UserId: '1236',
        FirstName: 'Mary',
        LastName: '"Goodnight"',
        UserCode: 'LANJA1',
      },
      {
        UserId: '1237',
        FirstName: 'Felix',
        LastName: '"Leiter"',
        UserCode: 'LEIFE1',
      },
    ];
    var providerTypes = [
      { Id: '1', Name: 'ProviderType1' },
      { Id: '2', Name: 'ProviderType2' },
      { Id: '3', Name: 'ProviderType3' },
      { Id: '4', Name: 'Not a Provider' },
      { Id: '5', Name: 'ProviderType5' },
    ];
    var userLocationSetups = [];
    beforeEach(function () {
      userLocationSetups = _.cloneDeep(userLocationSetupsMock);
    });

    it('should set $$ProviderOnClaims on each userLocationSetup based on ProviderOnClaimsRelationship and ProviderOnClaimsId', function () {
      userLocationSetups[0].ProviderOnClaimsId = '1235';
      userLocationSetups[0].ProviderOnClaimsRelationship = 2;
      userLocationsSetupFactory.MergeUserData(
        userLocationSetups,
        users,
        providerTypes
      );
      expect(userLocationSetups[0].$$ProviderOnClaims).toEqual(
        'Jaime Lannister'
      );
    });

    it('should set $$ProviderTypeName on each userLocationSetup based on ProviderTypeId', function () {
      userLocationSetups[0].ProviderTypeId = '3';
      userLocationsSetupFactory.MergeUserData(
        userLocationSetups,
        users,
        providerTypes
      );
      expect(userLocationSetups[0].$$ProviderTypeName).toEqual('ProviderType3');
    });

    it('should set $$ProviderQualifierTypeName on each userLocationSetup based on ProviderQualifierType', function () {
      userLocationSetups[0].ProviderQualifierType = 2;
      userLocationsSetupFactory.MergeUserData(
        userLocationSetups,
        users,
        providerTypes
      );
      expect(userLocationSetups[0].$$ProviderQualifierTypeName).toEqual(
        'Full Time'
      );

      userLocationSetups[0].ProviderQualifierType = 1;
      userLocationsSetupFactory.MergeUserData(
        userLocationSetups,
        users,
        providerTypes
      );
      expect(userLocationSetups[0].$$ProviderQualifierTypeName).toEqual(
        'Part Time'
      );
    });
  });
});
