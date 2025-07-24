describe('Controller: UserRoleController', function () {
  var ctrl,
    scope,
    userServices,
    toastrFactory,
    locationServices,
    timeout,
    location,
    localize,
    q,
    modalFactory,
    roleNames;
  var rolesFactory;
  var resultMock = {
    Result: [
      {
        RoleId: 1,
        AccessLevel: 2,
        RoleName: 'Low',
      },
      {
        RoleId: 1,
        AccessLevel: 2,
        RoleName: 'High',
      },
    ],
  };

  // mock constant for roleNames
  roleNames = {
    PracticeAdmin: 'Practice Admin/Exec. Dentist',
    RxUser: 'Rx User',
  };

  var practiceRoles = [
    {
      RoleId: 1,
      AccessLevel: 2,
      RoleName: 'Low',
    },
    {
      RoleId: 1,
      AccessLevel: 2,
      RoleName: 'High',
    },
  ];

  var locationsMock = {
    Value: [
      {
        $$selectedLocationRoles: [{ RoleName: 'Test Role', RoleId: 1 }],
        $$originalSelectedLocationRoles: [],
        LocationId: 1,
        NameLine1: 'First Office',
        AddressLine1: '123 Apple St',
        AddressLine2: 'Suite 10',
        ZipCode: '62401',
        City: 'Effingham',
        State: 'IL',
        PrimaryPhone: '5551234567',
        Timezone: 'Central Standard Time',
      },
      {
        $$selectedLocationRoles: [],
        $$originalSelectedLocationRoles: [],
        LocationId: 2,
        NameLine1: 'Second Office',
        AddressLine1: '123 Count Rd',
        AddressLine2: '',
        ZipCode: '62858',
        City: 'Louisville',
        State: 'IL',
        PrimaryPhone: '5559876543',
        Timezone: 'Central Standard Time',
      },
    ],
  };

  var userscheduleLocationsMock = {
    Value: [{ UserId: '1', LocationId: 2, ObjectState: null }],
  };

  beforeEach(module('kendo.directives'));
  beforeEach(module('Soar.Common'));
  beforeEach(module('common.factories'));
  beforeEach(module('common.directives'));
  beforeEach(module('Soar.BusinessCenter'));

  beforeEach(
    module(function ($provide) {
      // mock location services
      locationServices = {
        get: jasmine.createSpy().and.returnValue({
          then: jasmine.createSpy(ctrl, 'getLocationSuccess'),
        }),
        getPermittedLocations: jasmine.createSpy().and.returnValue({
          then: jasmine.createSpy(ctrl, 'getLocationSuccess'),
        }),
      };
      $provide.value('LocationServices', locationServices);

      modalFactory = {
        ConfirmModal: jasmine
          .createSpy()
          .and.returnValue({ then: jasmine.createSpy() }),
      };
      $provide.value('ModalFactory', modalFactory);

      //mock for userServices
      userServices = {
        Roles: {
          get: jasmine.createSpy(),
          getUserRoles: jasmine.createSpy().and.returnValue({
            then: jasmine.createSpy(),
          }),
          getUserRolesByLocation: jasmine.createSpy().and.returnValue({
            then: jasmine.createSpy(),
          }),
          getAllRolesByPractice: jasmine.createSpy().and.returnValue({
            then: jasmine.createSpy(),
          }),
        },
        UserScheduleLocation: {
          get: jasmine.createSpy(),
          update: jasmine.createSpy(),
          getInactiveUserAssignedLocations: jasmine.createSpy(),
        },
      };
      $provide.value('UserServices', userServices);

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
      };
      $provide.value('RolesFactory', rolesFactory);

      $provide.constant('RoleNames', roleNames);

      //mock for toastrFactory
      toastrFactory = {
        success: jasmine.createSpy(),
        error: jasmine.createSpy(),
      };

      // mock localize
      localize = {
        getLocalizedString: jasmine
          .createSpy()
          .and.returnValue('localized text'),
      };
    })
  );

  // Create controller and scope
  beforeEach(inject(function ($rootScope, $controller, $injector) {
    scope = $rootScope.$new();
    timeout = $injector.get('$timeout');
    location = $injector.get('$location');
    q = $injector.get('$q');
    scope.user = {};
    var userContext = {};
    userContext.Result = {};
    userContext.Result.Application = { ApplicationId: '2' };
    userContext.Result.Access = { AccessLevel: 2 };
    userContext = JSON.stringify(userContext);
    sessionStorage.setItem('userContext', userContext);

    // create controller
    ctrl = $controller('UserRoleController', {
      $scope: scope,
      UserServices: userServices,
      toastrFactory: toastrFactory,
      $timeout: timeout,
      LocationServices: locationServices,
      $location: location,
      localize: localize,
      $q: q,
    });
  }));

  //controller
  it('UserRoleController : should check if controller exists', function () {
    expect(ctrl).not.toBeNull();
    expect(ctrl).not.toBeUndefined();
  });

  describe('getPracticeAdminsInPractice function -->', function () {
    beforeEach(function () {
      sessionStorage.setItem('userPractice', JSON.stringify({ id: 1 }));
      delete scope.practiceOnlyHasOneAdmin;
    });

    it('should not call userServices.Roles.getAllRolesByPractice if wrong params are passed', function () {
      ctrl.getPracticeAdminsInPractice('practice', 'location');
      expect(userServices.Roles.getAllRolesByPractice).not.toHaveBeenCalled();
    });

    it('should not call userServices.Roles.getAllRolesByPractice if $scope.practiceOnlyHasOneAdmin is defined', function () {
      scope.practiceOnlyHasOneAdmin = true;
      ctrl.getPracticeAdminsInPractice('location', 'practice');
      expect(userServices.Roles.getAllRolesByPractice).not.toHaveBeenCalled();
    });

    it("should not call userServices.Roles.getAllRolesByPractice if we can't get user practice from sessionStorage", function () {
      sessionStorage.removeItem('userPractice');
      ctrl.getPracticeAdminsInPractice('practice', 'location');
      expect(userServices.Roles.getAllRolesByPractice).not.toHaveBeenCalled();
    });

    it('should call userServices.Roles.getAllRolesByPractice', function () {
      ctrl.getPracticeAdminsInPractice('location', 'practice');
      expect(userServices.Roles.getAllRolesByPractice).toHaveBeenCalled();
    });
  });

  describe(' function -->', function () {
    beforeEach(function () {
      scope.user.$$originalSelectedPracticeRoles = [];
    });

    it('should call confirm modal if nv is practice, ov is location, and scope.user.$$originalSelectedPracticeRoles is empty', function () {
      ctrl.warnUserWhenSwitchingFromLocationToPractice('practice', 'location');
      expect(modalFactory.ConfirmModal).toHaveBeenCalled();
    });

    it('should call confirm modal with provider alert text in message if user is a provider', function () {
      scope.user.ProviderTypeId = 3;
      ctrl.warnUserWhenSwitchingFromLocationToPractice('practice', 'location');
      expect(modalFactory.ConfirmModal).toHaveBeenCalledWith(
        'localized text',
        'localized text localized text',
        'localized text',
        'localized text'
      );
      scope.user.ProviderTypeId = '1';
      ctrl.warnUserWhenSwitchingFromLocationToPractice('practice', 'location');
      expect(modalFactory.ConfirmModal).toHaveBeenCalledWith(
        'localized text',
        'localized text localized text',
        'localized text',
        'localized text'
      );
    });

    it('should not call confirm modal with provider alert text in message if user is not a provider', function () {
      scope.user.ProviderTypeId = 4;
      ctrl.warnUserWhenSwitchingFromLocationToPractice('practice', 'location');
      expect(modalFactory.ConfirmModal).toHaveBeenCalledWith(
        'localized text',
        'localized text',
        'localized text',
        'localized text'
      );
      scope.user.ProviderTypeId = '4';
      ctrl.warnUserWhenSwitchingFromLocationToPractice('practice', 'location');
      expect(modalFactory.ConfirmModal).toHaveBeenCalledWith(
        'localized text',
        'localized text',
        'localized text',
        'localized text'
      );
    });

    it('should not call confirm modal if incorrect params are passed', function () {
      ctrl.warnUserWhenSwitchingFromLocationToPractice();
      expect(modalFactory.ConfirmModal).not.toHaveBeenCalled();
      ctrl.warnUserWhenSwitchingFromLocationToPractice('location', 'practice');
      expect(modalFactory.ConfirmModal).not.toHaveBeenCalled();
      scope.user.$$originalSelectedPracticeRoles.push({});
      ctrl.warnUserWhenSwitchingFromLocationToPractice('practice', 'location');
      expect(modalFactory.ConfirmModal).not.toHaveBeenCalled();
    });
  });

  describe('getRoles function -->', function () {
    it('should call userServices.Roles.get function', function () {
      ctrl.getRoles();
      expect(userServices.Roles.get).toHaveBeenCalled();
    });
  });

  describe('getUserRolesSuccess function -->', function () {
    it('should make $$selectedPracticeRoles equal the result', function () {
      ctrl.getUserPracticeRolesSuccess(practiceRoles);
      expect(scope.user.$$selectedPracticeRoles).toEqual(practiceRoles);
    });
  });

  describe('notifyNotAuthorized function -->', function () {
    it('should call toastrFactory.error function', function () {
      ctrl.notifyNotAuthorized();
      expect(toastrFactory.error).toHaveBeenCalled();
    });
  });

  describe('rolesGetSuccess function -->', function () {
    it('should make scope.roles.length to equal 2', function () {
      var resultMock = {
        Result: [
          {
            RoleId: 1,
            AccessLevel: 2,
            RoleName: 'low',
          },
        ],
      };
      scope.user = { UserId: 1 };
      ctrl.rolesGetSuccess(resultMock);
      expect(scope.roles.length).toEqual(1);
      expect(scope.practiceRoles).toEqual(resultMock.Result);
    });

    it('should set scope.isLoading to false', function () {
      scope.user = {};
      ctrl.rolesGetSuccess(resultMock);
      expect(scope.isLoading).toBe(false);
    });

    it('should set scope.isLoading to false', function () {
      var resultMock = {
        Result: [
          {
            RoleId: 2,
            AccessLevel: 2,
            RoleName: 'medium',
          },
        ],
      };
      scope.user = {};
      ctrl.rolesGetSuccess(resultMock);
      expect(scope.roles.length).toEqual(1);
    });

    it('should set scope.isLoading to false', function () {
      var resultMock = {
        Result: [
          {
            RoleId: 3,
            AccessLevel: 2,
            RoleName: 'high',
          },
        ],
      };
      scope.user = {};
      ctrl.rolesGetSuccess(resultMock);
      expect(scope.roles.length).toEqual(1);
    });

    it('should set scope.isLoading to false', function () {
      var resultMock = {
        Result: [
          {
            RoleId: 2,
            AccessLevel: 2,
            RoleName: 'Other',
          },
        ],
      };
      scope.user = {};
      ctrl.rolesGetSuccess(resultMock);
      expect(scope.roles.length).toEqual(1);
    });
  });

  describe('rolesGetFailure function -->', function () {
    it('should make scope.roles.length to equal 2', function () {
      ctrl.rolesGetFailure();
      expect(toastrFactory.error).toHaveBeenCalled();
    });
  });

  describe('ctrl.getLocations function -> ', function () {
    it('should call getLocations', function () {
      spyOn(ctrl, 'getLocations');
      ctrl.getLocations();
      expect(locationServices.getPermittedLocations).toHaveBeenCalled();
    });
  });

  describe('ctrl.getLocationSuccess function -> ', function () {
    beforeEach(function () {
      scope.user = { UserId: 1, IsActive: true };
    });

    it('should set $scope.locations', function () {
      expect(ctrl.locations).toBeUndefined();
      scope.user = { UserId: 'userId', IsActive: true };
      ctrl.getLocationSuccess(locationsMock);
      expect(scope.locations.length).toBe(2);
      expect(userServices.UserScheduleLocation.get).toHaveBeenCalled();
    });

    it('should call rolesFactory.UserPracticeRoles', function () {
      scope.user = { UserId: 'userId', IsActive: true };
      ctrl.getLocationSuccess(locationsMock);
      expect(rolesFactory.UserPracticeRoles).toHaveBeenCalledWith(
        scope.user.UserId
      );
    });
  });

  describe('ctrl.getLocationFailure function -> ', function () {
    it('should throw toastr error', function () {
      ctrl.getLocationFailure();
      expect(toastrFactory.error).toHaveBeenCalled();
    });
  });

  describe('getSelectedLocationsSuccess function -> ', function () {
    it('should set $scope.userScheduleLocations and $scope.originalUserScheduleLocations', function () {
      spyOn(scope, 'getLocationRoles');
      scope.locations = locationsMock.Value;
      scope.getSelectedLocationsSuccess(userscheduleLocationsMock);
      expect(scope.user.$$selectedLocations.length).toEqual(2);
      expect(scope.user.$$originalUserScheduleLocations.length).toEqual(1);
    });
  });

  describe('getSelectedLocationsFailure function -> ', function () {
    it('should set $scope.userScheduleLocations to empty array and set $scope.originalUserScheduleLocations', function () {
      spyOn(scope, 'getSelectedLocationsFailure');
      expect(scope.user.$$selectedLocations).toEqual([]);
      expect(scope.user.$$originalUserScheduleLocations).toEqual(
        scope.user.$$selectedLocations
      );
    });

    it('should set $scope.userScheduleLocations to empty array if not in edit mode and set $scope.originalUserScheduleLocations', function () {
      scope.editMode = false;
      expect(userServices.UserScheduleLocation.get).not.toHaveBeenCalled();
      expect(scope.user.$$selectedLocations).toEqual([]);
      expect(scope.user.$$originalUserScheduleLocations).toEqual([]);
    });
  });

  describe('getLocationRoles function -> ', function () {
    it('should call getLocationRoles', function () {
      spyOn(scope, 'getLocationRoles');
      scope.getLocationRoles();
      expect(scope.getLocationRoles).toHaveBeenCalled();
    });
  });

  describe('removeSelectedLocation function -> ', function () {
    it('should launch the are you sure modal', function () {
      spyOn(scope, 'confirmRemoveSelectedLocation');
      scope.removeSelectedLocation(locationsMock.Value[0]);
      expect(modalFactory.ConfirmModal).toHaveBeenCalled();
    });
  });

  describe('confirmRemoveSelectedLocation function -> ', function () {
    it('should set the selected roles for the removed location to an empty array', function () {
      var ofcLocation = { Location: locationsMock.Value };
      scope.confirmRemoveSelectedLocation(ofcLocation);
      expect(scope.user.$$selectedLocations.length).toBe(0);
    });
  });

  describe('removeSelectedLocation function -> ', function () {
    it('should launch the are you sure modal', function () {
      //spyOn(scope, 'removeSelectedLocation');
      scope.removeSelectedLocation(locationsMock.Value[0]);
      expect(modalFactory.ConfirmModal).toHaveBeenCalled();
    });
  });

  describe('validateStateLicenseByLocation function -->', function () {
    it('should call state license validation function', function () {
      ctrl.validateStateLicenseByLocation();
      expect(scope.needLicenseStates).toEqual('');
    });
  });

  describe('roleChanged function -->', function () {
    it('should call ctrl.setDisplayRoleMessage method', function () {
      spyOn(ctrl, 'setDisplayRoleMessage');
      scope.roleChanged();
      expect(ctrl.setDisplayRoleMessage).toHaveBeenCalled();
    });
  });

  describe('practiceRoleAdded function -->', function () {
    it('should call ctrl.setDisplayRoleMessage method', function () {
      spyOn(ctrl, 'setDisplayRoleMessage');
      scope.practiceRoleAdded({});
      expect(ctrl.setDisplayRoleMessage).toHaveBeenCalled();
    });
  });

  describe('removeLocationRoles function -->', function () {
    it('should call ctrl.setDisplayRoleMessage method', function () {
      spyOn(ctrl, 'setDisplayRoleMessage');
      var role = { RoleId: '1' };
      var ofcLocation = {
        LocationId: '22',
        Roles: [{ RoleId: '1' }, { RoleId: '13' }, { RoleId: '14' }],
      };
      scope.removeLocationRoles(role, ofcLocation);
      expect(ctrl.setDisplayRoleMessage).toHaveBeenCalled();
    });
  });

  describe('removeLocationRoles function -->', function () {
    it('should call ctrl.setDisplayRoleMessage method', function () {
      spyOn(ctrl, 'setDisplayRoleMessage');
      var role = { RoleId: '1' };
      scope.user = {
        $$locations: [
          { Location: { LocationId: '22' }, Roles: [] },
          { Location: { LocationId: '44' }, Roles: [] },
        ],
        $$originalUserLocationRoles: [
          { LocationId: '22', Roles: [] },
          { LocationId: '44', Roles: [] },
        ],
        $$selectedPracticeRoles: [
          { RoleId: '1', RoleName: 'Practice Admin/Exec. Dentist' },
        ],
        $$originalSelectedPracticeRoles: [
          { RoleId: '1', RoleName: 'Practice Admin/Exec. Dentist' },
        ],
      };
      scope.removePracticeRoles(role);
      expect(ctrl.setDisplayRoleMessage).toHaveBeenCalled();
    });
  });

  describe('ctrl.setDisplayRoleMessage for location roles method -->', function () {
    beforeEach(function () {
      scope.user = {
        $$locations: [
          {
            Location: { LocationId: '22' },
            Roles: [{ RoleId: '1' }, { RoleId: '13' }],
          },
          {
            Location: { LocationId: '44' },
            Roles: [{ RoleId: '1' }, { RoleId: '12' }, { RoleId: '11' }],
          },
        ],
        $$originalUserLocationRoles: [
          { LocationId: '22', Roles: [{ RoleId: '1' }, { RoleId: '13' }] },
          {
            LocationId: '44',
            Roles: [{ RoleId: '1' }, { RoleId: '12' }, { RoleId: '11' }],
          },
        ],
      };
      scope.displayRolesChangedMessage = false;
    });

    it('should set scope.displayRolesChangedMessage true if user location roles are not the same as original', function () {
      ctrl.setDisplayRoleMessage();
      //original matches current
      expect(scope.displayRolesChangedMessage).toEqual(false);

      // make a change to location roles, remove role from fist location
      scope.user.$$locations = [
        { Location: { LocationId: '22' }, Roles: [{ RoleId: '1' }] },
        {
          Location: { LocationId: '44' },
          Roles: [{ RoleId: '1' }, { RoleId: '12' }, { RoleId: '11' }],
        },
      ];
      ctrl.setDisplayRoleMessage();
      // original no longer matches current
      expect(scope.displayRolesChangedMessage).toEqual(true);

      // make another change, add the same role back to roles
      scope.user.$$locations = [
        {
          Location: { LocationId: '22' },
          Roles: [{ RoleId: '1' }, { RoleId: '13' }],
        },
        {
          Location: { LocationId: '44' },
          Roles: [{ RoleId: '1' }, { RoleId: '12' }, { RoleId: '11' }],
        },
      ];
      ctrl.setDisplayRoleMessage();
      // original no longer matches current
      expect(scope.displayRolesChangedMessage).toEqual(false);

      // make another change, add a new role back to roles
      scope.user.$$locations = [
        {
          Location: { LocationId: '22' },
          Roles: [{ RoleId: '1' }, { RoleId: '13' }, { RoleId: '14' }],
        },
        {
          Location: { LocationId: '44' },
          Roles: [{ RoleId: '1' }, { RoleId: '12' }, { RoleId: '11' }],
        },
      ];
      ctrl.setDisplayRoleMessage();
      // original no longer matches current
      expect(scope.displayRolesChangedMessage).toEqual(true);
    });

    it('should set scope.displayPracticeRolesChangedMessage true if user practice roles are not the same as original', function () {
      ctrl.setDisplayRoleMessage();
      //expect(scope.needLicenseStates).toEqual('');
    });
  });

  describe('ctrl.setDisplayRoleMessage for practice roles method -->', function () {
    it('should set scope.displayRolesChangedMessage true if user selects practice admin and removes location roles', function () {
      // setup
      scope.user = {
        $$locations: [
          { Location: { LocationId: '22' }, Roles: [] },
          { Location: { LocationId: '44' }, Roles: [] },
        ],
        $$originalUserLocationRoles: [
          { LocationId: '22', Roles: [] },
          { LocationId: '44', Roles: [] },
        ],
        $$selectedPracticeRoles: [{ RoleId: '13', RoleName: 'Rx User' }],
        $$originalSelectedPracticeRoles: [
          { RoleId: '13', RoleName: 'Rx User' },
        ],
      };
      scope.displayRolesChangedMessage = false;

      ctrl.setDisplayRoleMessage();
      //original matches current
      expect(scope.displayPracticeRolesChangedMessage).toEqual(false);
      // make a change to practice roles, remove role
      scope.user.$$selectedPracticeRoles = [
        { RoleId: '1', RoleName: 'Practice Admin/Exec. Dentist' },
        { RoleId: '13', RoleName: 'Rx User' },
      ];
      ctrl.setDisplayRoleMessage();
      // original no longer matches current
      expect(scope.displayPracticeRolesChangedMessage).toEqual(true);
    });

    it('should not set scope.displayRolesChangedMessage true if user selects rx role', function () {
      scope.user = {
        $$locations: [
          { Location: { LocationId: '22' }, Roles: [] },
          { Location: { LocationId: '44' }, Roles: [] },
        ],
        $$originalUserLocationRoles: [
          { LocationId: '22', Roles: [] },
          { LocationId: '44', Roles: [] },
        ],
        $$selectedPracticeRoles: [
          { RoleId: '1', RoleName: 'Practice Admin/Exec. Dentist' },
        ],
        $$originalSelectedPracticeRoles: [
          { RoleId: '1', RoleName: 'Practice Admin/Exec. Dentist' },
        ],
      };
      scope.displayPracticeRolesChangedMessage = false;

      ctrl.setDisplayRoleMessage();
      //original matches current
      expect(scope.displayPracticeRolesChangedMessage).toEqual(false);

      //add rx role this should not affect the displayPracticeRolesChangedMessage
      scope.user.$$selectedPracticeRoles.push({
        RoleId: '13',
        RoleName: 'Rx User',
      });
      ctrl.setDisplayRoleMessage();
      expect(scope.displayPracticeRolesChangedMessage).toEqual(false);
    });
  });
});
