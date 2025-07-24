describe('UserLocationSetupCrudController  ->', function () {
  var scope, referenceDataService, toastrFactory, modalFactory;
  var uibModalInstance, userLocationSetup;
  var ctrl, userLocationsSetupFactory;
  var newMockUser = { UserId: null, $$UserPracticeRoles: [] };
  var providerTypesMock = [];
  var rolesMock = [],
    roleNames;
  var userRolesMock = [];
  var userLocationSetupMock = { UserProviderSetupLocationId: null };
  var availableLocationsMock = [
    { LocationId: 1, NameLine1: 'Location1' },
    { LocationId: 11, NameLine1: 'Location11' },
    { LocationId: 112, NameLine1: 'Location112' },
    { LocationId: 2, NameLine1: 'Location2' },
    { LocationId: 22, NameLine1: 'Location22' },
    { LocationId: 223, NameLine1: 'Location223' },
  ];
  var usersMock = (usersMock = [
    {
      UserId: '1234',
      ProviderTypeId: 1,
      IsActive: true,
      FirstName: 'Bob',
      LastName: 'Smith',
    },
    {
      UserId: '1235',
      ProviderTypeId: 1,
      IsActive: true,
      FirstName: 'Bo',
      LastName: 'Smythe',
    },
    {
      UserId: '1236',
      ProviderTypeId: 1,
      IsActive: false,
      FirstName: 'Larry',
      LastName: 'Woods',
    },
    {
      UserId: '1237',
      ProviderTypeId: 2,
      IsActive: true,
      FirstName: 'Sam',
      LastName: 'Smith',
    },
    {
      UserId: '1238',
      ProviderTypeId: 2,
      IsActive: true,
      FirstName: 'Sid',
      LastName: 'Smith',
    },
    {
      UserId: '1239',
      ProviderTypeId: 2,
      IsActive: false,
      FirstName: 'Bob',
      LastName: 'Smith',
    },
    {
      UserId: '1244',
      ProviderTypeId: 3,
      IsActive: true,
      FirstName: 'Bob',
      LastName: 'Woods',
    },
    {
      UserId: '1254',
      ProviderTypeId: 4,
      IsActive: true,
      FirstName: 'Bob',
      LastName: 'David',
    },
    {
      UserId: '1264',
      ProviderTypeId: 4,
      IsActive: true,
      FirstName: 'Larry',
      LastName: 'David',
    },
    {
      UserId: '1274',
      ProviderTypeId: 5,
      IsActive: true,
      FirstName: 'Pat',
      LastName: 'David',
    },
    {
      UserId: '1334',
      ProviderTypeId: 5,
      IsActive: true,
      FirstName: 'Sid',
      LastName: 'Smith',
    },
  ]);

  var newUserLocationSetupMock = {
    $$ProviderOnClaims: '',
    $$ProviderQualifierTypeName: '',
    $$ProviderTypeName: null,
    $$UserLocationRoles: [],
    Color: null,
    LocationId: null,
    ObjectState: 'None',
    ProviderOnClaimsId: null,
    ProviderOnClaimsRelationship: null,
    ProviderQualifierType: null,
    ProviderTypeId: null,
    UserId: null,
    UserProviderSetupLocationId: null,
  };

  var existingUserLocationSetupMock = {
    $$ProviderOnClaims: '',
    $$ProviderQualifierTypeName: '',
    $$ProviderTypeName: null,
    $$UserLocationRoles: [],
    Color: null,
    LocationId: null,
    ObjectState: 'None',
    ProviderOnClaimsId: null,
    ProviderOnClaimsRelationship: null,
    ProviderQualifierType: null,
    ProviderTypeId: null,
    UserId: null,
    UserProviderSetupLocationId: '1234',
  };

  var addUserLocationSetupCallbackMock = jasmine.createSpy();

  //#region mocks

  //#endregion

  beforeEach(
    module('Soar.BusinessCenter', function ($provide) {
      modalFactory = {
        ConfirmModal: jasmine
          .createSpy('modalFactory.ConfirmModal')
          .and.returnValue({
            then: function (callBack, dismissCallBack) {
              callBack();
              dismissCallBack();
            },
          }),
        Modal: jasmine.createSpy('modalFactory.Modal').and.returnValue({
          then: function (callBack, dismissCallBack) {
            callBack();
            dismissCallBack();
          },
        }),
      };
      $provide.value('ModalFactory', modalFactory);

      userLocationsSetupFactory = {
        MergeLocationData: jasmine.createSpy(),
        MergeUserData: jasmine.createSpy(),
        mergeUserRoleData: jasmine.createSpy(),
        MergeLocationRolesData: jasmine.createSpy(),
        MergePracticeRolesData: jasmine.createSpy(),
        UserLocationSetups: jasmine.createSpy().and.returnValue({
          then: jasmine.createSpy().and.returnValue({}),
        }),
        PermittedLocations: jasmine.createSpy().and.returnValue({
          then: jasmine.createSpy().and.returnValue({}),
        }),
        GroupLocations: jasmine.createSpy(),
        UserLocationSetupDto: jasmine
          .createSpy()
          .and.returnValue(newUserLocationSetupMock),
        ViewRoles: jasmine.createSpy(),
        CompareRoles: jasmine.createSpy(),
      };
      $provide.value('UserLocationsSetupFactory', userLocationsSetupFactory);

      referenceDataService = {
        get: jasmine.createSpy().and.callFake(function () {
          return [];
        }),
        entityNames: {
          locations: 'locations',
          users: 'users',
        },
      };
      $provide.value('referenceDataService', referenceDataService);

      uibModalInstance = {
        close: jasmine.createSpy(),
      };
      $provide.value('$uibModalInstance', uibModalInstance);

      toastrFactory = {};
      toastrFactory.error = jasmine.createSpy();
      toastrFactory.success = jasmine.createSpy();
      $provide.value('toastrFactory', toastrFactory);
    })
  );

  beforeEach(inject(function ($rootScope, $controller, $injector) {
    roleNames = $injector.get('RoleNames');
    // scopes
    scope = $rootScope.$new();
    // instantiating the controller object
    ctrl = $controller('UserLocationSetupCrudController', {
      $scope: scope,
      toastrFactory: toastrFactory,
      user: newMockUser,
      providerTypes: providerTypesMock,
      roles: rolesMock,
      userRoles: userRolesMock,
      availableLocations: availableLocationsMock,
      userLocationSetup: userLocationSetupMock,
      addUserLocationSetupCallback: addUserLocationSetupCallbackMock,
    });
  }));

  describe('$onInit function -> ', function () {
    beforeEach(function () {
      spyOn(ctrl, 'setAvailableRoles');
      spyOn(ctrl, 'getActiveUsers');
    });

    it('should call initializing methods', function () {
      ctrl.$onInit();
      expect(ctrl.setAvailableRoles).toHaveBeenCalledWith(ctrl.roles);
      expect(scope.pageTitle).toEqual('Add {0} ');
      expect(ctrl.getActiveUsers).toHaveBeenCalled();
    });

    it('should set pageTitle  to Add if new userLocationSetup', function () {
      userLocationSetupMock.UserProviderSetupLocationId = null;
      ctrl.$onInit();
      expect(scope.pageTitle).toEqual('Add {0} ');
    });

    it('should set pageTitle  to Edit if existing userLocationSetup', function () {
      userLocationSetupMock.UserProviderSetupLocationId = '1234';
      ctrl.$onInit();
      expect(scope.pageTitle).toEqual('Edit {0} ');
    });

    it('should set editMode to false if new userLocationSetup', function () {
      userLocationSetupMock.UserProviderSetupLocationId = null;
      // new
      ctrl.$onInit();
      expect(scope.editMode).toEqual(false);
    });

    it('should set editMode based to true if existing userLocationSetup', function () {
      userLocationSetupMock.UserProviderSetupLocationId = '1234';
      ctrl.$onInit();
      expect(scope.editMode).toEqual(true);
    });

    it('should set scope.isProviderActive to false if scope.userLocationSetup.ProviderTypeId is null or 4', function () {
      userLocationSetupMock.UserProviderSetupLocationId = '1234';
      userLocationSetupMock.ProviderTypeId = 4;
      ctrl.$onInit();
      expect(scope.isProviderActive).toEqual(false);
    });

    it('should set scope.searchLocation if scope.userLocationSetup.$$Location is not null', function () {
      userLocationSetupMock.$$Location = {
        LocationId: '1234',
        NameLine1: 'LocationA',
      };
      ctrl.$onInit();
      expect(scope.searchLocation).toEqual('LocationA');
    });

    it('should set scope.isProviderActive to true if scope.userLocationSetup.ProviderTypeId is not null and not 4', function () {
      userLocationSetupMock.UserProviderSetupLocationId = '1234';
      userLocationSetupMock.ProviderTypeId = 4;
      ctrl.$onInit();
      expect(scope.isProviderActive).toEqual(false);
    });

    it('should set scope.searchLocation if scope.userLocationSetup.$$Location is not null', function () {
      userLocationSetupMock.ProviderOnClaimsId = '1234';
      userLocationSetupMock.$$ProviderOnClaims = 'Bob Smith';
      ctrl.$onInit();
      expect(scope.providerOnClaimsSearchTerm).toEqual(
        scope.userLocationSetup.$$ProviderOnClaims
      );
    });

    it('should set providerTypeId to 4 is not editMode', function () {
      userLocationSetupMock.UserProviderSetupLocationId = null;
      // new
      ctrl.$onInit();
      expect(scope.editMode).toEqual(false);
      expect(scope.userLocationSetup.ProviderTypeId).toBe(4);
    });
  });

  describe('ctrl.setExistingUserLocationRoles method -> ', function () {
    beforeEach(function () {
      ctrl.userRoles = _.cloneDeep(userRolesMock);
      scope.userLocationSetup = { LocationId: 12 };
    });
    it('should call userLocationsSetupFactory.MergeLocationRolesData with userLocationSetup and userRoles', function () {
      ctrl.setExistingUserLocationRoles();
      expect(
        userLocationsSetupFactory.MergeLocationRolesData
      ).toHaveBeenCalledWith([scope.userLocationSetup], ctrl.userRoles);
    });
  });

  describe('ctrl.getActiveUsers method -> ', function () {
    beforeEach(function () {
      scope.user = _.cloneDeep(newMockUser);
      var users = _.cloneDeep(usersMock);
      spyOn(ctrl, 'setAvailableRoles');
      referenceDataService.get = jasmine.createSpy().and.returnValue(users);
    });
    it('should call referenceDataService.get with user', function () {
      ctrl.getActiveUsers();
      expect(referenceDataService.get).toHaveBeenCalledWith('users');
    });

    it('should filter ctrl.activeUsers to only contain users who have a providerType other than 4 and are active and whose UserId does not match the current user', function () {
      var activeUsers = ctrl.getActiveUsers();
      _.forEach(activeUsers, function (user) {
        expect(user.ProviderTypeId).not.toBe(4);
        expect(user.IsActive).toBe(true);
        expect(user.ProviderTypeId).not.toEqual(scope.user.UserId);
      });
    });
  });

  describe('scope.clearLocation method -> ', function () {
    beforeEach(function () {
      scope.searchLocation = 'SelectedLocation';
      scope.userLocationSetup = { LocationId: 12 };
    });
    it('should clear the scope.userLocationSetup.LocationId ', function () {
      scope.clearLocation();
      expect(scope.searchLocation).toBe('');
      expect(scope.userLocationSetup.LocationId).toBe(null);
    });
  });

  describe('scope.selectLocationResult method -> ', function () {
    beforeEach(function () {
      scope.searchLocation = '';
      scope.userLocationSetup = { LocationId: null };
      spyOn(ctrl, 'setExistingUserLocationRoles').and.callFake(function () {});
    });
    it('should set the scope.userLocationSetup.LocationId ', function () {
      scope.selectLocationResult({
        LocationId: 12,
        NameLine1: 'SelectedLocation',
      });
      expect(scope.searchLocation).toBe('SelectedLocation');
      expect(scope.userLocationSetup.LocationId).toBe(12);
    });
    it('should call ctrl.setExistingUserLocationRoles ', function () {
      scope.selectLocationResult({
        LocationId: 12,
        NameLine1: 'SelectedLocation',
      });
      expect(ctrl.setExistingUserLocationRoles).toHaveBeenCalled();
    });
  });

  describe('scope.searchLocations method -> ', function () {
    beforeEach(function () {
      scope.searchLocation = '';
      scope.userLocationSetup = { LocationId: null };
      scope.availableLocations = _.cloneDeep(availableLocationsMock);
    });
    it('should set scope.filteredLocations to scope.availableLocations if search term is empty', function () {
      scope.searchLocations('');
      expect(scope.filteredLocations).toEqual(scope.availableLocations);
    });

    it('should set scope.filteredLocations to filtered scope.availableLocations based on term', function () {
      scope.searchLocations('11');
      expect(scope.filteredLocations[0].LocationId).toEqual(11);
      expect(scope.filteredLocations[1].LocationId).toEqual(112);
    });
  });

  describe('ctrl.changeProviderType method -> ', function () {
    beforeEach(function () {
      scope.userLocationSetup = _.cloneDeep(newUserLocationSetupMock);
    });
    it('should set showProviderOnClaims to false if nv is undefined or 4 ', function () {
      ctrl.changeProviderType('4', null);
      expect(scope.showProviderOnClaims).toBe(false);
    });
    it('should set ProviderOnClaimsRelationship to 0 if nv is undefined or 4', function () {
      ctrl.changeProviderType('4', null);
      expect(scope.userLocationSetup.ProviderOnClaimsRelationship).toBe(0);
      expect(scope.isProviderActive).toBe(false);
    });
    it('should set isProviderActive to true if nv is not undefined or 4 ', function () {
      ctrl.changeProviderType('3', '3');
      expect(scope.isProviderActive).toBe(true);
    });

    it('should set ProviderOnClaimsRelationship to 1 if nv is not undefined or 4 and ov was different value', function () {
      ctrl.changeProviderType('3', null);
      expect(scope.userLocationSetup.ProviderOnClaimsRelationship).toBe(1);
      expect(scope.isProviderActive).toBe(true);
    });
    it('should set ProviderOnClaimsId to null if nv is not undefined or 4 and ov was different value', function () {
      ctrl.changeProviderType('3', null);
      expect(scope.userLocationSetup.ProviderOnClaimsId).toBe(null);
    });

    it('should set scope.userLocationSetup.ProviderQualifierType to ctrl.userLocationSetupBackup.ProviderQualifierType when ProviderQualifierType is 0  ', function () {
      var userLocation = {
        ProviderQualifierType: 0,
        ProviderTypeId: null,
      };
      var userLocationSetupBackup = {
        ProviderQualifierType: 1,
        ProviderTypeId: null,
      };
      scope.userLocationSetup = userLocation;
      ctrl.userLocationSetupBackup = userLocationSetupBackup;
      ctrl.changeProviderType('3', '4');
      expect(scope.userLocationSetup.ProviderQualifierType).toBe(
        ctrl.userLocationSetupBackup.ProviderQualifierType
      );
      expect(scope.isProviderActive).toBe(true);
    });
    it('should not set scope.userLocationSetup.ProviderQualifierType to ctrl.userLocationSetupBackup.ProviderQualifierType when ProviderQualifierType is not 0  ', function () {
      var userLocation = {
        ProviderQualifierType: 2,
        ProviderTypeId: null,
      };
      var userLocationSetupBackup = {
        ProviderQualifierType: 1,
        ProviderTypeId: null,
      };
      scope.userLocationSetup = userLocation;
      ctrl.userLocationSetupBackup = userLocationSetupBackup;
      ctrl.changeProviderType('3', '4');
      expect(scope.userLocationSetup.ProviderQualifierType).toBe(2);
      expect(scope.isProviderActive).toBe(true);
    });

    it('should  set scope.userLocationSetup.ProviderQualifierType to 2 when ProviderQualifierType is null and not in editmode', function () {
      var userLocation = {
        ProviderQualifierType: null,
        ProviderTypeId: null,
      };
      scope.editMode = false;
      scope.userLocationSetup = userLocation;
      ctrl.changeProviderType('3', '4');
      expect(scope.userLocationSetup.ProviderQualifierType).toBe(2);
      expect(scope.isProviderActive).toBe(true);
    });
    it('should not set scope.userLocationSetup.ProviderQualifierType to 2 when ProviderQualifierType is null and in editmode', function () {
      var userLocation = {
        ProviderQualifierType: null,
        ProviderTypeId: null,
      };
      scope.editMode = true;
      scope.userLocationSetup = userLocation;
      ctrl.changeProviderType('3', '4');
      expect(scope.userLocationSetup.ProviderQualifierType).toBe(null);
      expect(scope.isProviderActive).toBe(true);
    });

    it('should set scope.userLocationSetup.ProviderQualifierType to 2 when backupdata is zero  ', function () {
      var userLocation = {
        ProviderQualifierType: 0,
        ProviderTypeId: null,
      };
      var userLocationSetupBackup = {
        ProviderQualifierType: 0,
        ProviderTypeId: null,
      };
      scope.userLocationSetup = userLocation;
      ctrl.userLocationSetupBackup = userLocationSetupBackup;
      ctrl.changeProviderType('3', '4');
      expect(scope.userLocationSetup.ProviderQualifierType).toBe(2);
      expect(scope.isProviderActive).toBe(true);
    });
    it('should set scope.userLocationSetup.ProviderQualifierType to backupdata when it is not zero  ', function () {
      var userLocation = {
        ProviderQualifierType: 0,
        ProviderTypeId: null,
      };
      var userLocationSetupBackup = {
        ProviderQualifierType: 1,
        ProviderTypeId: null,
      };
      scope.userLocationSetup = userLocation;
      ctrl.userLocationSetupBackup = userLocationSetupBackup;
      ctrl.changeProviderType('3', '4');
      expect(scope.userLocationSetup.ProviderQualifierType).toBe(1);
      expect(scope.isProviderActive).toBe(true);
    });

    it('should set scope.userLocationSetup.IsActive to true if changed from Not a provider to anything else', function () {
      var userLocation = {
        IsActive: false,
        ProviderTypeId: 4,
      };
      scope.userLocationSetup = userLocation;
      ctrl.changeProviderType('2', '4');
      expect(scope.userLocationSetup.IsActive).toBe(true);
    });

    it('should not set scope.userLocationSetup.IsActive to true if changed from other than Not a provider to anything else', function () {
      var userLocation = {
        IsActive: false,
        ProviderTypeId: 2,
      };
      scope.userLocationSetup = userLocation;
      ctrl.changeProviderType('3', '2');
      expect(scope.userLocationSetup.IsActive).toBe(false);
    });
  });

  // TODO when editing
  describe('ctrl.canChangeProvider method -> ', function () {
    beforeEach(function () {});
    it('should call ', function () {
      ctrl.canChangeProvider();
    });
  });

  describe('userLocationSetup.ProviderTypeId watch -> ', function () {
    beforeEach(function () {
      scope.userLocationSetup = _.cloneDeep(newUserLocationSetupMock);
      spyOn(ctrl, 'confirmProviderTypeChangeSubscription');
      spyOn(ctrl, 'changeProviderType');
    });
    it('should call canChangProvider if nv not null', function () {
      spyOn(ctrl, 'canChangeProvider');
      scope.userLocationSetup.ProviderTypeId = '2';
      scope.$apply();
      scope.userLocationSetup.ProviderTypeId = '4';
      scope.$apply();
      expect(ctrl.canChangeProvider).toHaveBeenCalledWith('4', '2');
      expect(ctrl.confirmProviderTypeChangeSubscription).toHaveBeenCalledWith(
        '4',
        '2'
      );
    });

    it('should not call canChangProvider if nv is null or undefined', function () {
      spyOn(ctrl, 'canChangeProvider');
      scope.userLocationSetup.ProviderTypeId = '2';
      scope.$apply();
      scope.userLocationSetup.ProviderTypeId = null;
      scope.$apply();
      expect(ctrl.canChangeProvider).not.toHaveBeenCalled();
    });

    it('should call ctrl.changeProviderType if canChangeProvider returns true', function () {
      spyOn(ctrl, 'canChangeProvider').and.callFake(function () {
        return true;
      });
      scope.userLocationSetup.ProviderTypeId = '2';
      scope.$apply();
      scope.userLocationSetup.ProviderTypeId = '3';
      scope.$apply();
      expect(ctrl.changeProviderType).toHaveBeenCalled();
    });
  });

  describe('userLocationSetup.ProviderOnClaimsRelationship watch -> ', function () {
    beforeEach(function () {
      scope.userLocationSetup = _.cloneDeep(newUserLocationSetupMock);
      scope.providerOnClaimsError = true;
      scope.userLocationSetup.ProviderTypeId = '3';
    });
    it('should set scope.userLocationSetup.ProviderOnClaimsId to null if nv is 1 ', function () {
      scope.userLocationSetup.ProviderOnClaimsRelationship = '2';
      scope.$apply();
      scope.userLocationSetup.ProviderOnClaimsRelationship = '1';
      scope.$apply();
      expect(scope.userLocationSetup.ProviderOnClaimsId).toBe(null);
    });

    it('should reset providerOnClaimsError to  false if nv is 1 ', function () {
      scope.userLocationSetup.ProviderOnClaimsRelationship = '2';
      scope.$apply();
      scope.userLocationSetup.ProviderOnClaimsRelationship = '1';
      scope.$apply();
      expect(scope.providerOnClaimsError).toBe(false);
    });

    it('should reset providerOnClaimsSearchTerm to empty string if nv is not 2 and ov is 2', function () {
      scope.providerOnClaimsSearchTerm = 'Bob';
      scope.disableProviderOnClaims = true;
      scope.userLocationSetup.ProviderOnClaimsRelationship = '2';
      scope.$apply();
      scope.userLocationSetup.ProviderOnClaimsRelationship = '1';
      scope.$apply();
      expect(scope.providerOnClaimsSearchTerm).toBe('');
      expect(scope.disableProviderOnClaims).toBe(false);
    });
  });

  // TODO when editing
  describe('ctrl.confirmProviderTypeChangeSubscription method -> ', function () {
    beforeEach(function () {
      scope.userLocationSetup = _.cloneDeep(userLocationSetupMock);
      ctrl.affirmedSubscription = false;
    });

    it('should not call ConfirmModal if providerTypeId is 4', function () {
      scope.editMode = true;
      ctrl.confirmProviderTypeChangeSubscription('4', 1);
      expect(modalFactory.ConfirmModal).not.toHaveBeenCalled();
    });

    it('should call ConfirmModal if editMode is true and new providerTypeId is not 4 but old providerId was 4', function () {
      scope.editMode = true;
      ctrl.confirmProviderTypeChangeSubscription('2', 4);
      expect(modalFactory.ConfirmModal).toHaveBeenCalled();
    });

    it('should call call ConfirmModal if editMode is false and new providerTypeId is not 4 ', function () {
      ctrl.affirmedSubscription = false;
      scope.editMode = false;
      ctrl.confirmProviderTypeChangeSubscription('2', 1);
      expect(modalFactory.ConfirmModal).toHaveBeenCalled();
    });

    it('should set ctrl.affirmedSubscription to true if confirmed and ctrl.affirmedSubscription was false', function () {
      ctrl.affirmedSubscription = false;
      scope.editMode = false;
      ctrl.confirmProviderTypeChangeSubscription('2', 1);
      expect(modalFactory.ConfirmModal).toHaveBeenCalled();
    });

    it('should set ProviderId to ov if not confirmed and ctrl.affirmedSubscription was false', function () {
      scope.userLocationSetup.ProviderTypeId = 1;
      ctrl.affirmedSubscription = false;
      scope.editMode = false;
      modalFactory.ConfirmModal = jasmine.createSpy().and.returnValue({
        then: jasmine.createSpy().and.returnValue(false),
      });
      ctrl.confirmProviderTypeChangeSubscription('2', 1);
      expect(scope.userLocationSetup.ProviderTypeId).toBe(1);
    });
  });

  describe('scope.selectProviderResult method -> ', function () {
    beforeEach(function () {
      scope.userLocationSetup = _.cloneDeep(newUserLocationSetupMock);
    });
    it('should call ', function () {
      var providerOnClaims = {
        UserId: '2345',
        FirstName: 'Bob',
        LastName: 'Frapples',
      };
      scope.selectProviderResult(providerOnClaims);
      expect(scope.providerOnClaimsSearchTerm).toBe(
        providerOnClaims.FirstName + ' ' + providerOnClaims.LastName
      );
      expect(scope.userLocationSetup.ProviderOnClaimsId).toEqual(
        providerOnClaims.UserId
      );
      expect(scope.disableProviderOnClaims).toBe(true);
      expect(scope.providerOnClaimsError).toBe(false);
    });
  });

  describe('ctrl.checkMustBeAProvider method -> ', function () {
    beforeEach(function () {
      scope.user = {
        UserId: '1234',
        $$scheduleStatuses: [
          {
            LocationId: 2,
            HasProviderAppointments: 3,
            HasProviderRoomOccurrences: 2,
          },
          {
            LocationId: 3,
            HasProviderAppointments: 3,
            HasProviderRoomOccurrences: 2,
          },
        ],
      };
      scope.userLocationSetup = _.cloneDeep(existingUserLocationSetupMock);
      scope.userLocationSetup.LocationId = 2;
    });
    it(
      'should return true if user has $$ScheduleStatus record with locaiton matching this location id and ' +
        'has either HasProviderRoomOccurrences or HasProviderAppointments',
      function () {
        scope.userLocationSetup.LocationId = 2;
        expect(ctrl.checkMustBeAProvider()).toEqual(true);
      }
    );

    it('should return false  if user does not have $$ScheduleStatus record with locaiton matching this location id', function () {
      scope.userLocationSetup.LocationId = 4;
      expect(ctrl.checkMustBeAProvider()).toEqual(false);
    });

    it('should return false  if user does not have $$ScheduleStatus records ', function () {
      scope.user = { UserId: '1234', $$scheduleStatuses: [] };
      ctrl.checkMustBeAProvider();
    });
  });

  describe('scope.clearProviderClaimUser method -> ', function () {
    beforeEach(function () {
      scope.userLocationSetup = _.cloneDeep(newUserLocationSetupMock);
    });
    it('should reset search params and set scope.userLocationSetup.ProviderOnClaimsId to null ', function () {
      scope.clearProviderClaimUser();
      expect(scope.providerOnClaimsSearchTerm).toEqual('');
      expect(scope.userLocationSetup.ProviderOnClaimsId).toEqual(null);
      expect(scope.disableProviderOnClaims).toBe(false);
      expect(scope.disableProviderClaim).toBe(false);
      expect(scope.providerOnClaimsError).toBe(true);
      expect(scope.filteredActiveProviders).toEqual(ctrl.activeUsers);
    });
  });

  describe('scope.providerOnClaimsSearch method -> ', function () {
    beforeEach(function () {
      scope.userLocationSetup = _.cloneDeep(newUserLocationSetupMock);
      scope.filteredActiveProviders = [];
      ctrl.activeUsers = [
        {
          UserId: '1234',
          ProviderTypeId: 1,
          IsActive: true,
          FirstName: 'Bob',
          LastName: 'Smith',
        },
        {
          UserId: '1235',
          ProviderTypeId: 1,
          IsActive: true,
          FirstName: 'Bo',
          LastName: 'Smythe',
        },
        {
          UserId: '1237',
          ProviderTypeId: 2,
          IsActive: true,
          FirstName: 'Sam',
          LastName: 'Smith',
        },
        {
          UserId: '1238',
          ProviderTypeId: 2,
          IsActive: true,
          FirstName: 'Sid',
          LastName: 'Smith',
        },
        {
          UserId: '1244',
          ProviderTypeId: 3,
          IsActive: true,
          FirstName: 'Bob',
          LastName: 'Woods',
        },
        {
          UserId: '1274',
          ProviderTypeId: 5,
          IsActive: true,
          FirstName: 'Pat',
          LastName: 'Bob',
        },
        {
          UserId: '1334',
          ProviderTypeId: 5,
          IsActive: true,
          FirstName: 'Sid',
          LastName: 'Smith',
        },
      ];
    });
    it('should set scope.filteredActiveProviders to scope.activeUsers if search term is empty', function () {
      scope.providerOnClaimsSearch('');
      expect(scope.filteredActiveProviders).toEqual(ctrl.activeUsers);
    });

    it('should set scope.filteredActiveProviders to filtered scope.activeUsers based on term', function () {
      scope.providerOnClaimsSearch('Bob');
      expect(scope.filteredActiveProviders[0]).toEqual(ctrl.activeUsers[0]); // Bob Smith
      expect(scope.filteredActiveProviders[1]).toEqual(ctrl.activeUsers[4]); // Bob Woods
      expect(scope.filteredActiveProviders[2]).toEqual(ctrl.activeUsers[5]); // Pat Bob
    });
  });

  describe('ctrl.validateUserLocationSetup method -> ', function () {
    beforeEach(function () {
      scope.userLocationSetup = {
        $$ProviderOnClaims: '',
        $$ProviderQualifierTypeName: '',
        $$ProviderTypeName: null,
        $$UserLocationRoles: [
          { $$ObjectState: 'None' },
          { $$ObjectState: 'None' },
        ],
        Color: null,
        LocationId: 12,
        ObjectState: 'None',
        ProviderOnClaimsId: null,
        ProviderOnClaimsRelationship: '1',
        ProviderQualifierType: '1',
        ProviderTypeId: '3',
        UserId: null,
        UserProviderSetupLocationId: null,
      };
      scope.user = {
        UserId: null,
        $$UserPracticeRoles: [],
        $$isPracticeAdmin: false,
        IsActive: true,
      };
    });
    it('should set formIsValid to true if all conditions met ', function () {
      scope.user.IsActive = true;
      ctrl.validateUserLocationSetup();
      expect(scope.formIsValid).toBe(true);
      expect(scope.hasErrors).toBe(false);
      expect(scope.providerOnClaimsError).toBe(false);
    });

    it('should set formIsValid to false if scope.user.$$isPracticeAdmin is false and scope.userLocationSetup.$$UserLocationRoles is empty and user.IsActive is true', function () {
      scope.user.$$isPracticeAdmin = false;
      scope.user.IsActive = true;
      scope.userLocationSetup.$$UserLocationRoles = [];
      ctrl.validateUserLocationSetup();
      expect(scope.formIsValid).toBe(false);
      expect(scope.hasRoleErrors).toBe(true);
    });

    it('should set formIsValid to true if scope.user.$$isPracticeAdmin is false and scope.userLocationSetup.$$UserLocationRoles is empty and user.IsActive is false', function () {
      scope.user.$$isPracticeAdmin = false;
      scope.user.IsActive = false;
      scope.userLocationSetup.$$UserLocationRoles = [];
      ctrl.validateUserLocationSetup();
      expect(scope.formIsValid).toBe(true);
      expect(scope.hasRoleErrors).toBe(false);
    });

    it('should set formIsValid to false if scope.user.$$isPracticeAdmin is ProviderTypeId is null', function () {
      scope.user.$$isPracticeAdmin = false;
      scope.userLocationSetup.ProviderTypeId = null;
      ctrl.validateUserLocationSetup();
      expect(scope.formIsValid).toBe(false);
      expect(scope.hasErrors).toBe(true);
    });

    it('should set formIsValid to false if LocationId is null', function () {
      scope.user.$$isPracticeAdmin = false;
      scope.userLocationSetup.LocationId = null;
      ctrl.validateUserLocationSetup();
      expect(scope.formIsValid).toBe(false);
      expect(scope.hasErrors).toBe(true);
    });

    it('should set formIsValid to false if scope.user.$$isPracticeAdmin is false and scope.userLocationSetup.$$UserLocationRoles only has roles with $$ObjectState.Delete', function () {
      scope.user.$$isPracticeAdmin = false;
      scope.userLocationSetup.LocationId = 11;
      scope.userLocationSetup.$$UserLocationRoles = [
        { RoleId: 5, $$ObjectState: 'Delete' },
      ];
      ctrl.validateUserLocationSetup();
      expect(scope.formIsValid).toBe(false);
      expect(scope.hasRoleErrors).toBe(true);
    });

    it('should set formIsValid to false if scope.userLocationSetup.ProviderTypeId is not 4 and scope.userLocationSetup.ProviderQualifierType is null', function () {
      scope.user.$$isPracticeAdmin = false;
      scope.userLocationSetup.ProviderQualifierType = null;
      ctrl.validateUserLocationSetup();
      expect(scope.formIsValid).toBe(false);
      expect(scope.hasErrors).toBe(true);
    });

    it(
      'should set formIsValid to false if scope.userLocationSetup.ProviderTypeId is not 4 and scope.userLocationSetup.ProviderOnClaimsRelationship is 2' +
        'and scope.userLocationSetup.ProviderOnClaimsId is null',
      function () {
        scope.user.$$isPracticeAdmin = false;
        scope.userLocationSetup.ProviderTypeId = '3';
        scope.userLocationSetup.ProviderOnClaimsRelationship = '2';
        scope.userLocationSetup.ProviderOnClaimsId = null;
        ctrl.validateUserLocationSetup();
        expect(scope.formIsValid).toBe(false);
      }
    );

    it(
      'should set formIsValid to false if scope.userLocationSetup.ProviderTypeId is not 4 and scope.userLocationSetup.ProviderOnClaimsRelationship is 2' +
        'and scope.userLocationSetup.ProviderOnClaimsId is empty',
      function () {
        scope.user.$$isPracticeAdmin = false;
        scope.userLocationSetup.ProviderTypeId = '3';
        scope.userLocationSetup.ProviderOnClaimsRelationship = '2';
        scope.userLocationSetup.ProviderOnClaimsId = '';
        ctrl.validateUserLocationSetup();
        expect(scope.formIsValid).toBe(false);
        expect(scope.providerOnClaimsError).toBe(true);
      }
    );
  });

  describe('scope.saveUserLocationSetup method -> ', function () {
    beforeEach(function () {
      scope.user = { UserId: null, $$isPracticeAdmin: false };
      scope.userLocationSetup = {
        $$ProviderOnClaims: '',
        $$ProviderQualifierTypeName: '',
        $$ProviderTypeName: null,
        $$UserLocationRoles: [{}, {}],
        Color: null,
        LocationId: 12,
        ObjectState: 'None',
        ProviderOnClaimsId: null,
        ProviderOnClaimsRelationship: '1',
        ProviderQualifierType: '1',
        ProviderTypeId: '3',
        UserId: null,
        UserProviderSetupLocationId: null,
      };
      uibModalInstance.close = jasmine.createSpy();
    });
    it('should call validateUserLocationSetup', function () {
      spyOn(ctrl, 'validateUserLocationSetup').and.callFake(function () {
        return true;
      });
      scope.saveUserLocationSetup(userLocationSetup);
      expect(ctrl.validateUserLocationSetup).toHaveBeenCalled();
    });

    it('should call ctrl.setObjectState', function () {
      spyOn(ctrl, 'setObjectState').and.callFake(function () {
        return true;
      });
      scope.saveUserLocationSetup(userLocationSetup);
      expect(ctrl.setObjectState).toHaveBeenCalled();
    });

    it('should call addUserLocationSetupCallback if formIsValid', function () {
      scope.formIsValid = true;
      spyOn(ctrl, 'validateUserLocationSetup').and.callFake(function () {
        return true;
      });
      scope.saveUserLocationSetup(userLocationSetup);
      expect(addUserLocationSetupCallbackMock).toHaveBeenCalledWith(
        userLocationSetup
      );
    });
  });

  describe('ctrl.setObjectState method -> ', function () {
    beforeEach(function () {
      scope.userLocationSetup = _.cloneDeep(newUserLocationSetupMock);
      ctrl.userLocationSetupBackup = _.cloneDeep(newUserLocationSetupMock);
    });
    it('should set objectState to None if scope.userLocationSetup has not changed on existing scope.userLocationSetup ', function () {
      scope.editMode = true;
      ctrl.setObjectState();
      expect(scope.userLocationSetup.ObjectState).toBe('None');
    });
    it('should set objectState to Update if scope.userLocationSetup has changed on existing scope.userLocationSetup ', function () {
      scope.userLocationSetup.Color = '#f7f7f7';
      scope.editMode = true;
      ctrl.setObjectState();
      expect(scope.userLocationSetup.ObjectState).toBe('Update');
    });
    it('should set objectState to Add on new scope.userLocationSetup ', function () {
      scope.editMode = false;
      ctrl.setObjectState();
      expect(scope.userLocationSetup.ObjectState).toBe('Add');
    });
  });

  describe('scope.close method -> ', function () {
    beforeEach(function () {
      scope.userLocationSetup = _.cloneDeep(newUserLocationSetupMock);
      scope.dataHasChanged = true;
    });
    it('should set dataChanged to false ', function () {
      scope.close();
      expect(scope.dataHasChanged).toBe(false);
    });
  });

  describe('scope.removeRole method -> ', function () {
    beforeEach(function () {
      scope.userLocationSetup = _.cloneDeep(newUserLocationSetupMock);
      scope.userLocationSetup.$$UserLocationRoles = [
        { RoleId: '1234' },
        { RoleId: '1235' },
      ];
      scope.userLocationRoles = {
        item: [{ RoleId: '1234' }, { RoleId: '1235' }],
      };
    });
    it('should set the ObjectState to Deleted on removed role', function () {
      var userRole = { RoleId: '1234' };
      scope.removeRole(userRole);
      expect(scope.userLocationSetup.$$UserLocationRoles[0].$$ObjectState).toBe(
        'Delete'
      );
      expect(scope.dataHasChanged).toBe(true);
    });

    it('should remove deleted role from userLocationRoles list', function () {
      var userRole = { RoleId: '1234' };
      scope.removeRole(userRole);
      expect(scope.userLocationRoles.item).toEqual([{ RoleId: '1235' }]);
      expect(scope.dataHasChanged).toBe(true);
    });
  });

  describe('scope.addLocationRole method -> ', function () {
    beforeEach(function () {
      scope.userLocationSetup = _.cloneDeep(newUserLocationSetupMock);
      scope.userLocationSetup.$$UserLocationRoles = [
        { RoleId: '1234', $$ObjectState: 'None' },
        { RoleId: '1235', $$ObjectState: 'None' },
      ];
    });
    it('should set the ObjectState to Add on added role', function () {
      var userRole = { RoleId: '1234', $$ObjectState: 'test' };
      scope.addLocationRole(userRole);
      expect(scope.userLocationSetup.$$UserLocationRoles[0].$$ObjectState).toBe(
        'Add'
      );
      expect(scope.hasRoleErrors).toBe(false);
      expect(scope.dataHasChanged).toBe(true);
    });
  });

  describe('scope.setAvailableRoles method -> ', function () {
    beforeEach(function () {
      ctrl.roles = [
        { RoleId: '1234', RoleName: 'Practice Admin/Exec. Dentist' },
        { RoleId: '1235', RoleName: 'Rx User' },
        { RoleId: '1236', RoleName: 'Business Partner' },
        { RoleId: '1237', RoleName: 'Dentist' },
        { RoleId: '1237', RoleName: 'Hygienist' },
      ];
    });
    it('should filter rxRoles from available roles removing Rx User and Practice Admin', function () {
      ctrl.setAvailableRoles();
      expect(scope.availableRoles.length).toBe(3);
      expect(scope.availableRoles).not.toContain({
        RoleId: '1234',
        RoleName: 'Practice Admin/Exec. Dentist',
      });
      expect(scope.availableRoles).not.toContain({
        RoleId: '1235',
        RoleName: 'Rx User',
      });
      expect(scope.availableRoles).toContain({
        RoleId: '1236',
        RoleName: 'Business Partner',
      });
      expect(scope.availableRoles).toContain({
        RoleId: '1237',
        RoleName: 'Dentist',
      });
      expect(scope.availableRoles).toContain({
        RoleId: '1237',
        RoleName: 'Hygienist',
      });
    });
  });

  describe('userLocationSetup watch -> ', function () {
    beforeEach(function () {
      scope.userLocationSetup = _.cloneDeep(existingUserLocationSetupMock);
      scope.dataHasChanged = false;
    });

    it('should set dataHasChanged to true', function () {
      expect(scope.dataHasChanged).toBe(false);
      scope.userLocationSetup.Color = '#7f7f7f';
      scope.$apply();
      scope.userLocationSetup.Color = '#22b14c';
      scope.$apply();
      expect(scope.dataHasChanged).toBe(true);
    });

    it('should set dataHasChanged to false when ProviderQualifierType is null', function () {
      expect(scope.dataHasChanged).toBe(false);
      scope.userLocationSetup.ProviderQualifierType = 2;
      scope.$apply();
      scope.userLocationSetup.ProviderQualifierType = '';
      scope.$apply();
      expect(scope.dataHasChanged).toBe(false);
    });
    it('should set dataHasChanged to true when ProviderQualifierType is 0 and ProviderTypeId  4 ', function () {
      expect(scope.dataHasChanged).toBe(false);
      scope.userLocationSetup.ProviderQualifierType = 0;
      scope.$apply();
      scope.userLocationSetup.ProviderTypeId = 4;
      scope.$apply();
      expect(scope.dataHasChanged).toBe(true);
    });
    it('should set dataHasChanged to false when ProviderQualifierType is 0 and ProviderTypeId is not  4 ', function () {
      expect(scope.dataHasChanged).toBe(false);
      scope.userLocationSetup.ProviderQualifierType = 0;
      scope.$apply();
      scope.userLocationSetup.ProviderTypeId = 3;
      scope.$apply();
      expect(scope.dataHasChanged).toBe(false);
    });
  });
});
