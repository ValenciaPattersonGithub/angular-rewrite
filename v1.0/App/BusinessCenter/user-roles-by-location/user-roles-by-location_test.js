describe('UserRolesByLocationController ->', function () {
  var scope, timeout, toastrFactory, localize, location, filter, ctrl;
  var listHelper,
    usersFactory,
    rolesFactory,
    referenceDataService,
    userServices,
    modalFactory,
    roleNames,
    user;

  //#region mocks

  var practiceUserRolesResult = {
    EnterpriseRoles: [],
    PracticeRoles: {
      1: [
        { RoleId: 8, RoleName: 'Practice Administrator' },
        { RoleId: 13, RoleName: 'Rx User' },
      ],
    },
    LocationRoles: {},
  };

  //#endregion

  //#region before each

  beforeEach(module('Soar.Common'));
  beforeEach(module('common.factories'));
  beforeEach(
    module('Soar.BusinessCenter', function ($provide) {
      modalFactory = {
        CancelModal: jasmine.createSpy().and.returnValue({
          then: jasmine.createSpy(),
        }),
        Modal: jasmine.createSpy().and.returnValue({
          result: {
            then: function (fn) {
              fn();
            },
          },
        }),
      };
      $provide.value('ModalFactory', modalFactory);

      localize = {
        getLocalizedString: jasmine.createSpy().and.callFake(function (val) {
          return val;
        }),
      };
      $provide.value('localize', localize);

      userServices = {
        UserRoles: {
          save: jasmine
            .createSpy()
            .and.returnValue({ $promise: { then: jasmine.createSpy() } }),
        },
        Roles: {
          assignRoleByLocation: jasmine
            .createSpy()
            .and.returnValue({ $promise: { then: jasmine.createSpy() } }),
          deleteRoleByLocation: jasmine
            .createSpy()
            .and.returnValue({ $promise: { then: jasmine.createSpy() } }),
        },
      };
      $provide.value('UserServices', userServices);

      referenceDataService = {
        get: jasmine.createSpy().and.callFake(function () {
          return [];
        }),
        entityNames: {
          locations: 'locations',
        },
      };

      $provide.value('referenceDataService', referenceDataService);

      usersFactory = {
        access: jasmine.createSpy().and.returnValue({
          View: true,
          Create: true,
        }),
        Users: jasmine.createSpy().and.returnValue({
          then: jasmine.createSpy().and.returnValue(),
        }),
      };
      $provide.value('UsersFactory', usersFactory);

      rolesFactory = {
        Roles: jasmine.createSpy().and.returnValue({
          then: jasmine.createSpy().and.returnValue(),
        }),
        UserPracticeRoles: jasmine.createSpy().and.returnValue({
          then: jasmine.createSpy().and.returnValue(),
        }),
        UserLocationRoles: jasmine.createSpy().and.returnValue({
          then: jasmine.createSpy().and.returnValue(),
        }),
        AllUsersLocationRoles: jasmine.createSpy().and.returnValue({
          then: jasmine.createSpy().and.returnValue(),
        }),
        AllUsersPracticeRoles: jasmine.createSpy().and.returnValue({
          then: jasmine.createSpy().and.returnValue(),
        }),
        UserRoles: jasmine.createSpy().and.returnValue({
          then: jasmine.createSpy().and.returnValue(),
        }),
      };
      $provide.value('RolesFactory', rolesFactory);

      toastrFactory = {};
      toastrFactory.error = jasmine.createSpy();
      toastrFactory.success = jasmine.createSpy();
      $provide.value('toastrFactory', toastrFactory);
    })
  );

  beforeEach(inject(function ($rootScope, $controller, $injector, $timeout) {
    scope = $rootScope.$new();

    // Set up the mock http service responses
    //$httpBackend = $injector.get('$httpBackend');
    //// backend definition common for all tests
    //authRequestHandler = $httpBackend.when('DELETE', '/api/users/roles/1')
    //    .respond({userId: 'userX'}, {'A-Token': 'xxx'});

    // users mock must be reset on each test
    scope.users = [
      {
        UserId: 1,
        $$UserLocations: [
          {
            LocationId: 1,
            $$UserLocationRoles: [
              { RoleId: 1, RoleName: 'Hygienist', $$ObjectState: 'Add' },
              {
                RoleId: 2,
                RoleName: 'Business Partner',
                $$ObjectState: 'Delete',
              },
              { RoleId: 3, RoleName: 'Assistant', $$ObjectState: 'Add' },
              { RoleId: 4, RoleName: 'Associate Dentist' },
            ],
          },
        ],
      },
      {
        UserId: 2,
        $$UserLocations: [
          {
            LocationId: 1,
            $$UserLocationRoles: [
              {
                RoleId: 2,
                RoleName: 'Business Partner',
                $$ObjectState: 'Delete',
              },
            ],
          },
        ],
      },
      {
        UserId: 3,
        $$UserLocations: [{ LocationId: 1 }],
        $$UserPracticeRoles: [{}, {}],
      },
    ];

    timeout = $timeout;
    listHelper = $injector.get('ListHelper');
    roleNames = $injector.get('RoleNames');

    //mock for location
    location = {
      url: jasmine.createSpy('$location.url'),
      search: jasmine.createSpy('$location.search'),
    };

    $rootScope.patAuthContext = {
      isAuthorized: true,
      userInfo: {
        userid: null,
      },
    };
    filter = $injector.get('$filter');
    scope = $rootScope.$new();
    ctrl = $controller('UserRolesByLocationController', {
      $scope: scope,
      ListHelper: listHelper,
      $timeout: timeout,
      toastrFactory: toastrFactory,
      localize: localize,
      $filter: filter,
      $location: location,
    });

    scope.authAccess.Delete = true;
    scope.authAccess.Create = true;
    scope.selectedLocations = [{ LocationId: 1 }];
  }));

  //#endregion

  describe('getCurrentUserLocations function -> ', function () {
    it('should call referenceDataService.get', function () {
      ctrl.getCurrentUserLocations();
      expect(referenceDataService.get).toHaveBeenCalledWith(
        referenceDataService.entityNames.locations
      );
    });
  });

  describe('watch selectedLocations function -> ', function () {
    it('should set locationName when changed', function () {
      scope.selectedLocations = [{ NameLine1: 'First Location' }];
      scope.$apply();

      scope.selectedLocations = [{ NameLine1: 'Second Location' }];
      scope.$apply();
      expect(scope.locationName).toBe('Second Location');
    });
  });

  describe('getPracticeUsers function -> ', function () {
    it('should call usersFactory.Users', function () {
      ctrl.getPracticeUsers();
      expect(usersFactory.Users).toHaveBeenCalled();
    });
  });

  describe('setUserPracticeRoles function -> ', function () {
    it('should add practice roles to each user location ', function () {
      scope.currentUserLocations = [{ LocationId: 1 }, { LocationId: 2 }];
      user = { UserId: '123456', $$UserLocations: [], $$UserPracticeRoles: [] };
      ctrl.setUserPracticeRoles(user, [
        { RoleId: 8, RoleName: 'Practice Administrator' },
      ]);
      expect(user.$$UserPracticeRoles).toEqual([
        { RoleId: 8, RoleName: 'Practice Administrator' },
      ]);
    });

    it('should add all locations to user ', function () {
      scope.currentUserLocations = [{ LocationId: 1 }, { LocationId: 2 }];
      user = { UserId: 2, $$UserLocations: [], $$UserPracticeRoles: [] };
      angular.forEach(
        practiceUserRolesResult.PracticeRoles,
        function (practiceRoles) {
          ctrl.setUserPracticeRoles(user, practiceRoles);
          expect(user.$$UserLocations).toEqual([
            { LocationId: 1 },
            { LocationId: 2 },
          ]);
        }
      );
    });
  });

  describe('getUsersRoles function -> ', function () {
    it('should call rolesFactory.AllUsersPracticeRoles ', function () {
      var users = [{ UserId: 2 }, { UserId: 3 }];
      ctrl.getUsersRoles(users);
      angular.forEach(users, function (user) {
        expect(rolesFactory.UserRoles).toHaveBeenCalledWith(user.UserId);
      });
    });
  });

  describe('setUserRoles function -> ', function () {
    var user = {};
    beforeEach(function () {
      user = { UserId: 1, $$UserLocationRoles: [], $$UserPracticeRoles: [] };
    });

    it('should ctrl.setUserPracticeRoles foruser with PracticeRoles', function () {
      spyOn(ctrl, 'setUserPracticeRoles');
      var userRoles = {
        PracticeRoles: [
          { RoleId: 8, RoleName: 'Practice Administrator' },
          { RoleId: 13, RoleName: 'Rx User' },
        ],
      };

      ctrl.setUserRoles(user, userRoles);
      angular.forEach(userRoles.PracticeRoles, function (practiceRoles) {
        expect(ctrl.setUserPracticeRoles).toHaveBeenCalledWith(
          user,
          practiceRoles
        );
      });
    });

    it('should ctrl.setUserLocationRoles for user with LocationRoles', function () {
      spyOn(ctrl, 'setUserLocationRoles');
      var userRoles = {
        LocationRoles: {
          1: [
            { RoleId: 6, RoleName: 'Associate Dentist' },
            { RoleId: 11, RoleName: 'Office Manager' },
          ],
          2: [
            { RoleId: 6, RoleName: 'Associate Dentist' },
            { RoleId: 11, RoleName: 'Office Manager' },
          ],
          3: [
            { RoleId: 6, RoleName: 'Associate Dentist' },
            { RoleId: 11, RoleName: 'Office Manager' },
          ],
          4: [
            { RoleId: 6, RoleName: 'Associate Dentist' },
            { RoleId: 5, RoleName: 'Assistant' },
          ],
        },
      };

      ctrl.setUserRoles(user, userRoles);
      angular.forEach(userRoles.LocationRoles, function (locationRoles, key) {
        var locationId = parseInt(key);
        expect(ctrl.setUserLocationRoles).toHaveBeenCalledWith(
          user,
          locationId,
          locationRoles
        );
      });
    });
  });

  describe('setUserLocationRoles function -> ', function () {
    var user = {};
    var locationId = 4;
    var locationRoles = [];

    beforeEach(function () {
      spyOn(ctrl, 'setAvailableRoles');
      user = { UserId: '123456', $$UserLocations: [], $$UserPracticeRoles: [] };
      location = { LocationId: 4 };
      locationRoles = [
        { RoleId: 6, RoleName: 'Associate Dentist' },
        { RoleId: 11, RoleName: 'Office Manager' },
      ];
    });

    it('should add locations to user ', function () {
      ctrl.setUserLocationRoles(user, locationId, locationRoles);
      expect(user.$$UserLocations[0].LocationId).toEqual(4);
    });

    it('should add locationRoles roles to user.$$UserLocations ', function () {
      ctrl.setUserLocationRoles(user, location, locationRoles);
      expect(user.$$UserLocations[0].$$UserLocationRoles[0].RoleId).toEqual(6);
      expect(user.$$UserLocations[0].$$UserLocationRoles[1].RoleId).toEqual(11);
    });

    it('should call setAvailableRoles ', function () {
      ctrl.setUserLocationRoles(user, location, locationRoles);
      expect(ctrl.setAvailableRoles).toHaveBeenCalledWith(user);
    });
  });

  describe('setLocationRoles function -> ', function () {
    beforeEach(function () {
      scope.roles = [
        { RoleId: 1, RoleName: roleNames.PracticeAdmin },
        { RoleId: 2, RoleName: 'Rx User' },
        { RoleId: 3, RoleName: 'Hygienist' },
        { RoleId: 4, RoleName: 'Assistant' },
        { RoleId: 5, RoleName: 'Business Partner' },
        { RoleId: 6, RoleName: 'Associate Dentist' },
      ];
      scope.locationRoles = [];
    });

    it('should set locationRoles to all roles except rx user and practice administrator ', function () {
      ctrl.setLocationRoles();
      expect(scope.locationRoles.length).toEqual(4);
      expect(scope.locationRoles[0]).toEqual(scope.roles[2]);
      expect(scope.locationRoles[1]).toEqual(scope.roles[3]);
      expect(scope.locationRoles[2]).toEqual(scope.roles[4]);
      expect(scope.locationRoles[3]).toEqual(scope.roles[5]);
    });
  });

  describe('deletedRolesFilter function -> ', function () {
    var userLocationRoles = [];

    beforeEach(function () {
      userLocationRoles = [
        { RoleId: 1, RoleName: 'Hygienist', $$ObjectState: 'Delete' },
        { RoleId: 2, RoleName: 'Assistant', $$ObjectState: 'Add' },
        { RoleId: 2, RoleName: 'Associate Dentist', $$ObjectState: 'None' },
        { RoleId: 2, RoleName: 'Business Partner' },
      ];
    });

    it('should return false if userLocationRole has $$ObjectState.Delete', function () {
      expect(scope.deletedRolesFilter(userLocationRoles[1])).toEqual(true);
      expect(scope.deletedRolesFilter(userLocationRoles[2])).toEqual(true);
      expect(scope.deletedRolesFilter(userLocationRoles[3])).toEqual(true);
    });

    it('should return true if userLocationRole does not have $$ObjectState.Delete', function () {
      expect(scope.deletedRolesFilter(userLocationRoles[0])).toEqual(false);
    });
  });

  describe('setAvailableRolesByUserLocation function -> ', function () {
    var userLocation;

    beforeEach(function () {
      scope.locationRoles = [
        { RoleId: 1, RoleName: 'Hygienist' },
        { RoleId: 2, RoleName: 'Assistant' },
        { RoleId: 2, RoleName: 'Associate Dentist' },
        { RoleId: 2, RoleName: 'Business Partner' },
      ];

      userLocation = {
        LocationId: 1,
        $$UserLocationRoles: [
          { RoleId: 1, RoleName: 'Hygienist' },
          { RoleId: 2, RoleName: 'Business Partner' },
        ],
        $$AvailableRoles: [],
      };
    });

    it('should reset userLocation.$$AvailableRoles to all locationRoles when userLocation.$$UserLocationRoles is empty', function () {
      listHelper.findItemByFieldValue = jasmine
        .createSpy()
        .and.returnValue(null);
      ctrl.setAvailableRolesByUserLocation(userLocation);
      expect(userLocation.$$AvailableRoles.length).toEqual(4);
      expect(userLocation.$$AvailableRoles[0].RoleName).toEqual('Assistant');
      expect(userLocation.$$AvailableRoles[1].RoleName).toEqual(
        'Associate Dentist'
      );
      expect(userLocation.$$AvailableRoles[2].RoleName).toEqual(
        'Business Partner'
      );
      expect(userLocation.$$AvailableRoles[3].RoleName).toEqual('Hygienist');
    });

    it('should reset userLocation.$$AvailableRoles if userLocation contains role', function () {
      listHelper.findItemByFieldValue = jasmine
        .createSpy()
        .and.returnValue({ RoleId: 2, RoleName: 'Business Partner' });
      ctrl.setAvailableRolesByUserLocation(userLocation);
      expect(userLocation.$$AvailableRoles).toEqual([]);
    });
  });

  describe('addLocationRole function if user has authAccess.Create -> ', function () {
    var role = { RoleId: 1, RoleName: 'Hygienist' };
    var userLocation = {};

    beforeEach(function () {
      userLocation = {
        LocationId: 1,
        $$UserLocationRoles: [{ RoleId: 2, RoleName: 'Business Partner' }],
      };
    });

    it('should add role to userLocation and set ObjectState to Add if teamMember does not have role in userLocation.$$UserLocationRoles', function () {
      listHelper.findIndexByFieldValue = jasmine
        .createSpy()
        .and.returnValue(-1);
      expect(userLocation.$$UserLocationRoles.length).toEqual(1);
      scope.addLocationRole(role, userLocation);
      expect(userLocation.$$UserLocationRoles.length).toEqual(2);
      expect(userLocation.$$UserLocationRoles[1].RoleName).toEqual('Hygienist');
      expect(userLocation.$$UserLocationRoles[1].RoleId).toEqual(1);
      expect(userLocation.$$UserLocationRoles[1].$$ObjectState).toEqual('Add');
      expect(scope.dataHasChanged).toBe(true);
    });

    it('should not add role to userLocation.$$UserLocationRoles and set ObjectState to None if teamMember does have role in userLocation.$$UserLocationRoles with ObjectState = Delete', function () {
      listHelper.findIndexByFieldValue = jasmine.createSpy().and.returnValue(0);

      userLocation = {
        LocationId: 1,
        $$UserLocationRoles: [
          { RoleId: 2, RoleName: 'Business Partner', $$ObjectState: 'Delete' },
        ],
      };
      expect(userLocation.$$UserLocationRoles.length).toEqual(1);
      scope.addLocationRole(role, userLocation);
      expect(userLocation.$$UserLocationRoles.length).toEqual(1);
      expect(userLocation.$$UserLocationRoles[0].RoleName).toEqual(
        'Business Partner'
      );
      expect(userLocation.$$UserLocationRoles[0].RoleId).toEqual(2);
      expect(userLocation.$$UserLocationRoles[0].$$ObjectState).toEqual('None');
    });
  });

  describe('removeLocationRole function if user has authAccess.Delete -> ', function () {
    var userLocation = {};
    beforeEach(function () {
      scope.authAccess.Delete = true;
      userLocation = {
        LocationId: 1,
        $$UserLocationRoles: [
          { RoleId: 1, RoleName: 'Hygienist', $$ObjectState: 'Add' },
        ],
        $$AvailableRoles: [],
      };
    });

    it('should set userLocationRole.$$ObjectState to None if $$ObjectState was Add in userLocation.$$UserLocationRoles', function () {
      var userLocationRole = userLocation.$$UserLocationRoles[0];
      expect(userLocation.$$UserLocationRoles[0].RoleName).toEqual('Hygienist');
      expect(userLocation.$$UserLocationRoles[0].$$ObjectState).toEqual('Add');
      scope.removeLocationRole(userLocationRole, userLocation);
      expect(userLocation.$$UserLocationRoles[0]).toBeUndefined();
      expect(scope.dataHasChanged).toBe(true);
    });

    it('should set userLocationRole.$$ObjectState to Delete if $$ObjectState was None or null in userLocation.$$UserLocationRoles', function () {
      var userLocationRole = userLocation.$$UserLocationRoles[0];
      userLocationRole.$$ObjectState = null;
      scope.removeLocationRole(userLocationRole, userLocation);
      expect(userLocation.$$UserLocationRoles[0].RoleName).toEqual('Hygienist');
      expect(userLocation.$$UserLocationRoles[0].$$ObjectState).toEqual(
        'Delete'
      );
      expect(scope.dataHasChanged).toBe(true);
    });
  });

  describe('addLocationAssignment function if user has authAccess.Create -> ', function () {
    var userLocation;

    beforeEach(function () {
      scope.authAccess.Create = true;
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

    it('should call userServices.UserRoles.save', function () {
      ctrl.addLocationAssignment(1, userLocation.$$UserLocationRoles, 1);
      expect(userServices.UserRoles.save).toHaveBeenCalled();
    });
  });

  describe('processRoleAssignmentsByTeamMember function -> ', function () {
    var teamMember = {
      UserId: 2,
      $$UserLocations: [],
      $$UserPracticeRoles: [],
    };

    beforeEach(function () {
      scope.authAccess.Delete = true;
      scope.selectedLocations = [{ LocationId: 1 }];
      teamMember.$$UserLocations.push({
        LocationId: 1,
        $$UserLocationRoles: [],
      });
      teamMember.$$UserLocations[0].$$UserLocationRoles.push({
        RoleId: 1,
        RoleName: 'Hygienist',
        $$ObjectState: 'Add',
      });
      teamMember.$$UserLocations[0].$$UserLocationRoles.push({
        RoleId: 2,
        RoleName: 'Business Partner',
        $$ObjectState: 'Add',
      });
      teamMember.$$UserLocations[0].$$UserLocationRoles.push({
        RoleId: 3,
        RoleName: 'Assistant',
        $$ObjectState: 'Add',
      });
      teamMember.$$UserLocations[0].$$UserLocationRoles.push({
        RoleId: 4,
        RoleName: 'Associate Dentist',
        $$ObjectState: 'Delete',
      });
    });

    it('should return a list of serviceCalls for each team member based on the number of adds and deletes  in current location ', function () {
      listHelper.findIndexByFieldValue = jasmine.createSpy().and.returnValue(0);
      var processes = ctrl.processRoleAssignmentsByTeamMember(teamMember);
      expect(processes.length).toEqual(2);
    });
  });

  describe('updateRoleAssignments function -> ', function () {
    var userLocation = {};

    beforeEach(function () {
      scope.authAccess.Delete = true;
      scope.selectedLocations = [{ LocationId: 1 }];
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

    it('should remove a failed locationRole from $$UserLocationRoles', function () {
      listHelper.findIndexByFieldValue = jasmine.createSpy().and.returnValue(0);
      userLocation.$$UserLocationRoles[0].$$ObjectState = 'Add';
      userLocation.$$UserLocationRoles[0].$$NewObjectState = 'Failed';
      ctrl.updateRoleAssignments(
        userLocation,
        userLocation.$$UserLocationRoles[0]
      );
      expect(userLocation.$$UserLocationRoles.length).toEqual(3);
      expect(userLocation.$$UserLocationRoles[0].RoleName).toEqual(
        'Business Partner'
      );
    });

    it('should remove a successful locationRole from $$UserLocationRoles when ObjectState is Delete', function () {
      listHelper.findIndexByFieldValue = jasmine.createSpy().and.returnValue(0);
      userLocation.$$UserLocationRoles[0].$$ObjectState = 'Delete';
      userLocation.$$UserLocationRoles[0].$$NewObjectState = 'Successful';
      ctrl.updateRoleAssignments(
        userLocation,
        userLocation.$$UserLocationRoles[0]
      );
      expect(userLocation.$$UserLocationRoles.length).toEqual(3);
      expect(userLocation.$$UserLocationRoles[0].RoleName).toEqual(
        'Business Partner'
      );
    });
  });

  describe('validateUserLocationRoles function -> ', function () {
    var userLocation = {};

    beforeEach(function () {
      scope.authAccess.Delete = true;
      scope.selectedLocations = [{ LocationId: 1 }];
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

    it('should return false if userLocation.$$UserLocationRoles does not have at least one location role with $$ObjectState other than Delete on save', function () {
      userLocation.$$UserLocationRoles = [];
      ctrl.validateUserLocationRoles(userLocation);
      expect(ctrl.validateUserLocationRoles(userLocation)).toBe(false);
      expect(userLocation.$$NoRoleError).toBe(true);
    });

    it('should return false if userLocation.$$UserLocationRoles does not have at least one location role with $$ObjectState other than Delete on save', function () {
      userLocation.$$UserLocationRoles = [
        { RoleId: 2, RoleName: 'Business Partner', $$ObjectState: 'Delete' },
      ];
      ctrl.validateUserLocationRoles(userLocation);
      expect(ctrl.validateUserLocationRoles(userLocation)).toBe(false);
      expect(userLocation.$$NoRoleError).toBe(true);
    });

    it('should return true if userLocation.$$UserLocationRoles does have at least one location role with $$ObjectState other than Delete on save', function () {
      ctrl.validateUserLocationRoles(userLocation);
      expect(ctrl.validateUserLocationRoles(userLocation)).toBe(true);
      expect(userLocation.$$NoRoleError).toBe(false);
    });
  });

  describe('validateRoleAssigments function -> ', function () {
    //second user has only one role with a Delete state so will fail

    beforeEach(function () {
      scope.users = [
        {
          UserId: 1,
          $$UserLocations: [
            {
              LocationId: 1,
              $$UserLocationRoles: [
                { RoleId: 1, RoleName: 'Hygienist', $$ObjectState: 'Add' },
                {
                  RoleId: 2,
                  RoleName: 'Business Partner',
                  $$ObjectState: 'Delete',
                },
                { RoleId: 3, RoleName: 'Assistant', $$ObjectState: 'Add' },
                { RoleId: 4, RoleName: 'Associate Dentist' },
              ],
            },
          ],
        },
        {
          UserId: 2,
          $$UserLocations: [
            {
              LocationId: 1,
              $$UserLocationRoles: [
                {
                  RoleId: 2,
                  RoleName: 'Business Partner',
                  $$ObjectState: 'Delete',
                },
              ],
            },
          ],
        },
      ];
    });

    it('should return set formIsValid to false if any validateUserLocationRoles returns false for any userLocation', function () {
      listHelper.findIndexByFieldValue = jasmine.createSpy().and.returnValue(0);
      ctrl.validateRoleAssigments();
      expect(scope.formIsValid).toBe(false);
    });

    it('should return set formIsValid to true if any validateUserLocationRoles returns true for all userLocation', function () {
      // add a role to second user
      scope.users[1].$$UserLocations[0].$$UserLocationRoles.push({
        RoleId: 4,
        RoleName: 'Associate Dentist',
      });
      listHelper.findIndexByFieldValue = jasmine.createSpy().and.returnValue(0);
      ctrl.validateRoleAssigments();
      expect(scope.formIsValid).toBe(true);
    });
  });

  describe('refreshList function -> ', function () {
    //second user has only one role with a Delete state so will fail

    beforeEach(function () {
      scope.authAccess.Delete = true;
      scope.selectedLocations = [{ LocationId: 1 }];
      spyOn(ctrl, 'updateRoleAssignments');
    });

    it('should call ctrl.updateRoleAssignments for each userLocation and userLocationRoles );', function () {
      listHelper.findIndexByFieldValue = jasmine.createSpy().and.returnValue(0);
      ctrl.refreshList();

      angular.forEach(scope.users, function (user) {
        var userLocation = user.$$UserLocations;
        if (userLocation.$$UserLocationRoles) {
          for (
            var i = userLocation.$$UserLocationRoles.length - 1;
            i >= 0;
            i--
          ) {
            expect(ctrl.updateRoleAssignments).toHaveBeenCalledWith(
              userLocation,
              userLocation.$$UserLocationRoles[i]
            );
          }
        }
      });
    });

    it('should call ctrl.setAvailableRolesByUserLocation for each userLocation', function () {
      listHelper.findIndexByFieldValue = jasmine.createSpy().and.returnValue(0);
      ctrl.refreshList();

      angular.forEach(scope.users, function (user) {
        var userLocation = user.$$UserLocations;
        if (userLocation.$$UserLocationRoles) {
          expect(ctrl.setAvailableRolesByUserLocation).toHaveBeenCalledWith(
            userLocation
          );
        }
      });
    });
  });

  describe('refreshList function -> ', function () {
    //second user has only one role with a Delete state so will fail

    beforeEach(function () {
      spyOn(ctrl, 'updateRoleAssignments');
    });

    it('should call ctrl.updateRoleAssignments for each userLocation and userLocationRoles );', function () {
      listHelper.findIndexByFieldValue = jasmine.createSpy().and.returnValue(0);
      ctrl.refreshList();

      angular.forEach(scope.users, function (user) {
        var userLocation = user.$$UserLocations;
        if (userLocation.$$UserLocationRoles) {
          for (
            var i = userLocation.$$UserLocationRoles.length - 1;
            i >= 0;
            i--
          ) {
            expect(ctrl.updateRoleAssignments).toHaveBeenCalledWith(
              userLocation,
              userLocation.$$UserLocationRoles[i]
            );
          }
        }
      });
    });

    it('should not call ctrl.validateRoleAssigments if formIsValid is false', function () {
      spyOn(ctrl, 'validateRoleAssigments').and.returnValue(false);
      spyOn(ctrl, 'processRoleAssignments');
      scope.formIsValid = false;
      scope.saveRolesByLocation();
      expect(ctrl.processRoleAssignments).not.toHaveBeenCalled();
    });

    it('should call ctrl.processRoleAssignments if formIsValid', function () {
      spyOn(ctrl, 'validateRoleAssigments').and.returnValue(false);
      spyOn(ctrl, 'processRoleAssignments');
      scope.formIsValid = true;
      scope.saveRolesByLocation();
      expect(ctrl.processRoleAssignments).toHaveBeenCalled();
    });
  });

  describe('cancelChanges function -> ', function () {
    it('should call ctrl.revertUnsavedChanges and set dataHasChanged to false ', function () {
      spyOn(ctrl, 'revertUnsavedChanges');
      scope.cancelChanges();
      expect(scope.dataHasChanged).toBe(false);
      expect(ctrl.revertUnsavedChanges).toHaveBeenCalled();
    });
  });

  describe('cancelListChanges function -> ', function () {
    it('should call CancelModal if dataHasChanged is true', function () {
      scope.dataHasChanged = true;
      scope.cancelListChanges();
      expect(modalFactory.CancelModal).toHaveBeenCalled();
    });

    it('should call cancelChanges if dataHasChanged is false', function () {
      spyOn(scope, 'cancelChanges');
      scope.dataHasChanged = false;
      scope.cancelListChanges();
      expect(scope.cancelChanges).toHaveBeenCalled();
    });
  });

  describe('cancelChanges function -> ', function () {
    it('should call ctrl.revertUnsavedChanges and set dataHasChanged to false ', function () {
      spyOn(ctrl, 'revertUnsavedChanges');
      scope.cancelChanges();
      expect(scope.dataHasChanged).toBe(false);
      expect(ctrl.revertUnsavedChanges).toHaveBeenCalled();
    });
  });

  describe('revertUnsavedChanges function -> ', function () {
    beforeEach(function () {
      spyOn(ctrl, 'updateRoleAssignments');
    });

    it('should revert all unsaved changes with $$ObjectState.Delete to $$ObjectState.None on cancel changes ', function () {
      angular.forEach(scope.users, function () {
        angular.forEach(user.$$UserLocations, function (userLocation) {
          angular.forEach(
            userLocation.$$UserLocationRoles,
            function (userLocationRole) {
              userLocationRole.$$ObjectState = 'Delete';
            }
          );
        });
      });
      ctrl.revertUnsavedChanges();
      angular.forEach(scope.users, function () {
        angular.forEach(user.$$UserLocations, function (userLocation) {
          angular.forEach(
            userLocation.$$UserLocationRoles,
            function (userLocationRole) {
              expect(userLocationRole.$$ObjectState).toEqual('None');
            }
          );
        });
      });
    });

    it('should revert all unsaved changes with $$ObjectState.Add to $$ObjectState.None on cancel changes ', function () {
      angular.forEach(scope.users, function () {
        angular.forEach(user.$$UserLocations, function (userLocation) {
          angular.forEach(
            userLocation.$$UserLocationRoles,
            function (userLocationRole) {
              userLocationRole.$$ObjectState = 'Add';
            }
          );
        });
      });
      ctrl.revertUnsavedChanges();
      angular.forEach(scope.users, function () {
        angular.forEach(user.$$UserLocations, function (userLocation) {
          angular.forEach(
            userLocation.$$UserLocationRoles,
            function (userLocationRole) {
              expect(userLocationRole.$$ObjectState).toEqual('None');
            }
          );
        });
      });
    });

    it('should revert all unsaved changes with $$ObjectState.Add to $$ObjectState.None on cancel changes ', function () {
      spyOn(ctrl, 'setAvailableRolesByUserLocation');
      ctrl.revertUnsavedChanges();
      angular.forEach(scope.users, function () {
        angular.forEach(user.$$UserLocations, function (userLocation) {
          expect(ctrl.setAvailableRolesByUserLocation).toHaveBeenCalledWith(
            userLocation
          );
          expect(userLocation.$$NoRoleError).toBe(false);
        });
      });
      expect(scope.formIsValid).toBe(true);
    });
  });

  describe('processRoleAssignments function -> ', function () {
    beforeEach(function () {
      scope.selectedLocations = [{ LocationId: 1 }];
      spyOn(ctrl, 'processRoleAssignmentsByTeamMember');
    });

    it('should create list of locationRolesToProcess ', function () {
      ctrl.processRoleAssignments();
      angular.forEach(scope.users, function (teamMember) {
        expect(ctrl.processRoleAssignmentsByTeamMember).toHaveBeenCalledWith(
          teamMember
        );
      });
    });
  });

  describe('setObjectState method -> ', function () {
    var saveStates = {};
    var userLocation = {};
    beforeEach(function () {
      saveStates = {
        Add: 'Add',
        Update: 'Update',
        Delete: 'Delete',
        None: 'None',
      };
      userLocation = {
        LocationId: 1,
        $$UserLocationRoles: [
          { RoleId: 1, RoleName: 'Hygienist' },
          { RoleId: 2, RoleName: 'Business Partner' },
        ],
        $$AvailableRoles: [],
      };
    });

    it('should set $$NewObjectState of userRoles', function () {
      ctrl.setObjectState(userLocation.$$UserLocationRoles, saveStates.Add);
      angular.forEach(userLocation.$$UserLocationRoles, function (userRole) {
        expect(userRole.$$NewObjectState).toEqual(saveStates.Add);
      });

      ctrl.setObjectState(userLocation.$$UserLocationRoles, saveStates.Delete);
      angular.forEach(userLocation.$$UserLocationRoles, function (userRole) {
        expect(userRole.$$NewObjectState).toEqual(saveStates.Delete);
      });
    });
  });

  describe('createUserRolesDto method -> ', function () {
    var userLocation;

    beforeEach(function () {
      userLocation = {
        LocationId: 1,
        $$UserLocationRoles: [
          { RoleId: 1, RoleName: 'Hygienist' },
          { RoleId: 2, RoleName: 'Business Partner' },
        ],
        $$AvailableRoles: [],
      };
    });

    it('should ', function () {
      var returnValue = ctrl.createUserRolesDto(
        userLocation.$$UserLocationRoles,
        userLocation.LocationId
      );
      expect(returnValue.LocationRoles).toEqual({ 1: [1, 2] });
    });
  });

  /*ctrl.removeLocationAssignment = function (userId, userRoles, locationId) {
               var defer = $q.defer();
               var promise = defer.promise;
               if ($scope.authAccess.Delete) {
                   var userRolesDto = ctrl.createUserRolesDto(userRoles, locationId)
                   // due to that fact that the 1.5 angular resource doesn't allow a body to be part of the request
                   // handle the delete using $httpProvider
                   $http({url:'_webapiurl_/api/users/roles/'+ userId,
                       method:'DELETE',
                       data: userRolesDto,
                       headers:{
                           'Content-Type':'application/json;charset=utf-8'
                       }
                   }).then(function(res){
                       defer.resolve({ success: true });
                       ctrl.setObjectState(userRoles, saveStates.Successful);
                   },function (res) {
                       defer.resolve({ success: false });
                       ctrl.setObjectState(userRoles, saveStates.Failed);
                   });
               };
               return promise;
           };*/
  describe('removeLocationAssignment function if user has authAccess.Delete -> ', function () {
    //TODO
  });
});
