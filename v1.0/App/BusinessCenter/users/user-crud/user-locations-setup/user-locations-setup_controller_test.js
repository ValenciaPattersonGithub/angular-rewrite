describe('UserLocationsSetupController  ->', function () {
  var rootScope,
    scope,
    staticData,
    referenceDataService,
    toastrFactory,
    patSecurityService;
  var modalFactory, rolesFactory, userLocationsSetupFactory, modalInstance;
  var ctrl;

  //#region mocks

  var newMockUser = { UserId: null, IsActive: true, $$UserPracticeRoles: [] };

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

  var userLocationSetupsMock = [
    {
      LocationId: 1,
      UserLocationSetupId: 1234,
      $$UserLocationRoles: [{ RoleId: 1 }, { RoleId: 2 }],
    },
    {
      LocationId: 2,
      UserLocationSetupId: 5678,
      $$UserLocationRoles: [{ RoleId: 1 }, { RoleId: 4 }],
    },
  ];

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

      modalInstance = {
        close: jasmine.createSpy(),
        dismiss: jasmine.createSpy(),
      };

      $provide.value('ModalInstance', modalInstance);

      staticData = {
        ProviderTypes: jasmine.createSpy().and.returnValue({
          then: jasmine.createSpy().and.returnValue({}),
        }),
      };
      $provide.value('StaticData', staticData);

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

      rolesFactory = {
        access: jasmine.createSpy().and.returnValue({}),
        Roles: jasmine.createSpy().and.returnValue({
          then: jasmine.createSpy().and.returnValue({}),
        }),
        UserRoles: jasmine.createSpy().and.returnValue({
          then: jasmine.createSpy().and.returnValue({}),
        }),
        AllPracticeAdmins: jasmine.createSpy().and.returnValue({
          then: jasmine.createSpy().and.returnValue({}),
        }),
        GetInactiveUserAssignedRoles: jasmine.createSpy().and.returnValue({
          then: jasmine.createSpy().and.returnValue({}),
        }),
      };
      $provide.value('RolesFactory', rolesFactory);

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

      //mock for patSecurityService
      patSecurityService = {
        IsAuthorizedByAbbreviation: jasmine
          .createSpy('patSecurityService.IsAuthorizedByAbbreviation')
          .and.returnValue(true),
        logout: jasmine
          .createSpy('patSecurityService.logout')
          .and.returnValue(true),
      };
      $provide.value('patSecurityService', patSecurityService);

      toastrFactory = {};
      toastrFactory.error = jasmine.createSpy();
      toastrFactory.success = jasmine.createSpy();
      $provide.value('toastrFactory', toastrFactory);
    })
  );

  beforeEach(inject(function ($rootScope, $controller) {
    // scopes
    rootScope = $rootScope;
    scope = $rootScope.$new();
    // instantiating the controller object
    scope.user = { UserId: '1234', IsActive: true };
    ctrl = $controller('UserLocationsSetupController', {
      $scope: scope,
      toastrFactory: toastrFactory,
    });

    // default scope properties
    scope.viewSettings = {};
  }));

  describe('$onInit function -> ', function () {
    beforeEach(function () {
      spyOn(ctrl, 'getProviderTypes');
      spyOn(ctrl, 'getPermittedLocations');
      spyOn(ctrl, 'getRoles');
      spyOn(ctrl, 'determinePracticeRoleAccess');
      spyOn(ctrl, 'getUserLocationsSetups');
      spyOn(ctrl, 'getUserRoles');
      scope.user = _.cloneDeep(newMockUser);
    });

    it('should call determinePracticeRoleAccess', function () {
      ctrl.$onInit();
      expect(ctrl.determinePracticeRoleAccess).toHaveBeenCalled();
    });

    it('should call referenceDataService, ctrl.getRoles, ctrl.getProviderTypes, and ctrl.getPermittedLocations for a new or edited user', function () {
      ctrl.$onInit();
      expect(referenceDataService.get).toHaveBeenCalledWith('users');
      expect(referenceDataService.get).toHaveBeenCalledWith('locations');
      expect(ctrl.getRoles).toHaveBeenCalled();
    });

    it('should not call ctrl.getUserLocationsSetups for when adding a new user', function () {
      scope.user.UserId = null;
      ctrl.$onInit();
      expect(ctrl.getUserLocationsSetups).not.toHaveBeenCalled();
      expect(ctrl.getUserRoles).not.toHaveBeenCalled();
    });

    it('should call ctrl.getUserLocationsSetups for when editing a user', function () {
      scope.user.UserId = '1234';
      ctrl.$onInit();
      expect(ctrl.getUserLocationsSetups).toHaveBeenCalledWith(
        scope.user.UserId
      );
      expect(ctrl.getUserRoles).toHaveBeenCalledWith();
    });
  });

  describe('mergeDataForUserLocationSetups method -> ', function () {
    beforeEach(function () {
      spyOn(ctrl, 'validateStateLicenseByLocation');
      spyOn(ctrl, 'getAvailableLocations');
      scope.user = _.cloneDeep(newMockUser);
      ctrl.userLocationSetups = [];
      ctrl.roles = [];
      scope.userRoles = [];
    });
    it('should call userLocationsSetupFactory.MergeLocationData a new or edited user', function () {
      ctrl.mergeDataForUserLocationSetups();
      expect(userLocationsSetupFactory.MergeLocationData).toHaveBeenCalledWith(
        ctrl.userLocationSetups,
        ctrl.locations,
        ctrl.permittedLocations
      );
    });

    it('should call userLocationsSetupFactory.MergeUserData a new or edited user', function () {
      ctrl.mergeDataForUserLocationSetups();
      expect(userLocationsSetupFactory.MergeUserData).toHaveBeenCalledWith(
        ctrl.userLocationSetups,
        ctrl.users,
        ctrl.providerTypes
      );
    });

    it('should call userLocationsSetupFactory.MergeLocationRolesData a new or edited user', function () {
      ctrl.mergeDataForUserLocationSetups();
      expect(
        userLocationsSetupFactory.MergeLocationRolesData
      ).toHaveBeenCalledWith(ctrl.userLocationSetups, scope.userRoles);
    });

    it('should call userLocationsSetupFactory.MergePracticeRolesData a new or edited user', function () {
      ctrl.mergeDataForUserLocationSetups();
      expect(
        userLocationsSetupFactory.MergePracticeRolesData
      ).toHaveBeenCalledWith(ctrl.userRoles, scope.user);
    });

    it('should call ctrl.validateStateLicenseByLocation a new or edited user', function () {
      ctrl.mergeDataForUserLocationSetups();
      expect(ctrl.validateStateLicenseByLocation).toHaveBeenCalled();
    });

    it('should call ctrl.getAvailableLocations a new or edited user', function () {
      ctrl.mergeDataForUserLocationSetups();
      expect(ctrl.getAvailableLocations).toHaveBeenCalled();
    });
  });

  describe('ctrl.determinePracticeRoleAccess function -> ', function () {
    beforeEach(function () {
      sessionStorage.setItem(
        'userContext',
        JSON.stringify({
          Result: {
            Access: [{ AccessLevel: 2 }],
            Application: { ApplicationId: 1 },
          },
        })
      );
      scope.loggedInUserHasPracticeAccess = false;
    });
    it('should set scope.loggedInUserHasPracticeAccess based on AccessLevel in userContext', function () {
      sessionStorage.setItem(
        'userContext',
        JSON.stringify({
          Result: {
            Access: [{ AccessLevel: 2 }],
            Application: { ApplicationId: 1 },
          },
        })
      );
      ctrl.determinePracticeRoleAccess();
      expect(scope.loggedInUserHasPracticeAccess).toBe(true);

      sessionStorage.setItem(
        'userContext',
        JSON.stringify({
          Result: {
            Access: [{ AccessLevel: 4 }],
            Application: { ApplicationId: 1 },
          },
        })
      );
      ctrl.determinePracticeRoleAccess();
      expect(scope.loggedInUserHasPracticeAccess).toBe(false);
    });
  });

  describe('ctrl.getUserLocationsSetups function -> ', function () {
    beforeEach(function () {
      scope.user = _.cloneDeep(newMockUser);
    });
    it('should call userLocationsSetupFactory.UserLocationSetups with userId', function () {
      ctrl.getUserLocationsSetups();
      expect(userLocationsSetupFactory.UserLocationSetups).toHaveBeenCalledWith(
        scope.user.UserId
      );
    });
  });

  describe('ctrl.getProviderTypes function -> ', function () {
    beforeEach(function () {
      scope.user = _.cloneDeep(newMockUser);
    });
    it('should call staticData.ProviderTypes', function () {
      ctrl.getProviderTypes();
      expect(staticData.ProviderTypes).toHaveBeenCalled();
    });
  });

  describe('ctrl.getPermittedLocations function -> ', function () {
    beforeEach(function () {
      scope.user = _.cloneDeep(newMockUser);
    });
    it('should call userLocationsSetupFactory.PermittedLocations', function () {
      ctrl.getPermittedLocations();
      expect(userLocationsSetupFactory.PermittedLocations).toHaveBeenCalled();
    });
  });

  describe('ctrl.confirmSwitchToPracticeAdmin -> ', function () {
    beforeEach(function () {
      spyOn(ctrl, 'switchToPracticeAdmin');
      scope.user = _.cloneDeep(newMockUser);
      scope.user.$$isPracticeAdmin = true;
    });
    it('should call modalFactory.ConfirmModal', function () {
      ctrl.confirmSwitchToPracticeAdmin();
      expect(modalFactory.ConfirmModal).toHaveBeenCalled();
    });
    it('should call ctrl.switchToPracticeAdmin if response is affirmative', function () {
      ctrl.confirmSwitchToPracticeAdmin();
      modalFactory.ConfirmModal = jasmine.createSpy().and.returnValue({
        then: jasmine.createSpy().and.returnValue(true),
      });
      expect(ctrl.switchToPracticeAdmin).toHaveBeenCalled();
    });

    it('should call ctrl.switchToPracticeAdmin if response is negative', function () {
      ctrl.confirmSwitchToPracticeAdmin();
      modalFactory.ConfirmModal = jasmine.createSpy().and.returnValue({
        then: jasmine.createSpy().and.returnValue(null),
      });
      modalInstance.dismiss();
      expect(scope.user.$$isPracticeAdmin).toBe(false);
    });
  });

  describe('scope.changeRoleAssignment when switch from location roles to practice admin function -> ', function () {
    beforeEach(function () {
      spyOn(ctrl, 'confirmSwitchToPracticeAdmin');
      spyOn(ctrl, 'switchToPracticeAdmin');
      spyOn(ctrl, 'switchToLocationUserRoles');
      scope.userLocationSetups = _.cloneDeep(userLocationSetupsMock);
      scope.user = _.cloneDeep(newMockUser);
    });
    it('should call rolesFactory.AllPracticeAdmin before proceeding if switching from location roles user to practice admin', function () {
      scope.changeRoleAssignment(false);
      expect(rolesFactory.AllPracticeAdmins).toHaveBeenCalled();
    });

    it('should call ctrl.confirmSwitchToPracticeAdmin before proceeding if switching from location role user to practiceAdmin if have userLocationSetups', function () {
      scope.userLocationSetups = [{}, {}];
      scope.changeRoleAssignment(true);
      expect(ctrl.confirmSwitchToPracticeAdmin).toHaveBeenCalled();
    });

    it('should call skip call to ctrl.confirmSwitchToPracticeAdmin and call ctrl.switchToPracticeAdmin if switching from to location role user to practiceAdmin  if no userLocationSetups', function () {
      scope.userLocationSetups = [];
      scope.changeRoleAssignment(true);
      expect(ctrl.confirmSwitchToPracticeAdmin).not.toHaveBeenCalled();
      expect(ctrl.switchToPracticeAdmin).toHaveBeenCalled();
    });
  });

  describe('scope.changeRoleAssignment when switch from practice admin to location roles function -> ', function () {
    //TODO test logic if switch from practiceAdmin to location roles
  });

  describe('checkLocationsForRoles method -> ', function () {
    beforeEach(function () {
      scope.user = _.cloneDeep(newMockUser);
      scope.user.$$isPracticeAdmin = false;
      scope.userLocationSetups = _.cloneDeep(userLocationSetupsMock);
    });
    it('should set scope.showMissingRolesMessage to true if user.$$isPracticeAdmin is false and one or more locations does not have a $$UserLocationsRole', function () {
      scope.userLocationSetups[0].$$UserLocationRoles = [];
      ctrl.checkLocationsForRoles();
      expect(scope.showMissingRolesMessage).toBe(true);
    });

    it('should  if user.$$isPracticeAdmin is false and one or more locations does not have a $$UserLocationsRole', function () {
      _.forEach(scope.userLocationSetups, function (userLocationSetup) {
        userLocationSetup.$$UserLocationRoles.push({ RoleId: 1 });
      });
      ctrl.checkLocationsForRoles();
      expect(scope.showMissingRolesMessage).toBe(false);
    });
  });

  describe('ctrl.switchToLocationUserRoles method -> ', function () {
    beforeEach(function () {
      spyOn(ctrl, 'checkLocationsForRoles');
      scope.user = _.cloneDeep(newMockUser);
      scope.userLocationSetups = _.cloneDeep(userLocationSetupsMock);
      ctrl.practiceAdminRole = { RoleId: 8 };
    });
    it('should set all $$UserLocationRoles $$ObjectState to None if they were set to delete', function () {
      _.forEach(scope.userLocationSetups, function (userLocationSetup) {
        userLocationSetup.$$UserLocationRoles.push({
          RoleId: 1,
          $$ObjectState: 'Delete',
        });
      });
      ctrl.switchToLocationUserRoles();
      _.forEach(scope.userLocationSetups, function (userLocationSetup) {
        _.forEach(
          userLocationSetup.$$UserLocationRoles,
          function (userLocationRole) {
            expect(userLocationRole.$$ObjectState).toBe('None');
          }
        );
      });
      expect(ctrl.checkLocationsForRoles).toHaveBeenCalled();
    });

    it('should set scope.user.$$UserPracticeRole $$ObjectState to Delete if user is currently a PracticeAdmin and RoleId matches ctrl.practiceRole.RoleId', function () {
      scope.user.$$UserPracticeRoles.push({ RoleId: 8, $$ObjectState: 'None' });
      scope.user.$$UserPracticeRoles.push({
        RoleId: 13,
        $$ObjectState: 'None',
      });

      ctrl.switchToLocationUserRoles();
      _.forEach(scope.user.$$UserPracticeRoles, function (practiceRole) {
        if (practiceRole.RoleId === ctrl.practiceAdminRole.RoleId) {
          expect(practiceRole.$$ObjectState).toEqual('Delete');
        } else {
          expect(practiceRole.$$ObjectState).toEqual('None');
        }
      });
      expect(scope.user.$$isPracticeAdmin).toBe(false);
    });
  });

  describe('ctrl.switchToPracticeAdmin method -> ', function () {
    beforeEach(function () {
      spyOn(ctrl, 'checkLocationsForRoles');
      scope.user = _.cloneDeep(newMockUser);
      scope.userLocationSetups = _.cloneDeep(userLocationSetupsMock);
      ctrl.practiceAdminRole = {
        PracticeAdmin: 'Practice Admin/Exec. Dentist',
      };
      scope.user.$$UserPracticeRoles.push({
        RoleId: 13,
        RoleName: 'Rx User',
        $$ObjectState: 'None',
      });
    });
    it('should set all $$UserLocationRoles $$ObjectState to Delete', function () {
      _.forEach(scope.userLocationSetups, function (userLocationSetup) {
        userLocationSetup.$$UserLocationRoles.push({
          RoleId: 1,
          $$ObjectState: 'None',
        });
      });
      ctrl.switchToPracticeAdmin();
      _.forEach(scope.userLocationSetups, function (userLocationSetup) {
        _.forEach(
          userLocationSetup.$$UserLocationRoles,
          function (userLocationRole) {
            expect(userLocationRole.$$ObjectState).toBe('Delete');
          }
        );
      });
      expect(ctrl.checkLocationsForRoles).toHaveBeenCalled();
    });

    it('should set scope.user.$$isPracticeAdmin to true', function () {
      ctrl.switchToPracticeAdmin();
      expect(scope.user.$$isPracticeAdmin).toBe(true);
    });

    it('should add admin role to user.$$UserPracticeRoles and set $$ObjectState to Add if  role does not already exists', function () {
      scope.user.$$UserPracticeRoles = [];
      ctrl.switchToPracticeAdmin();
      _.forEach(scope.user.$$UserPracticeRoles, function (practiceRole) {
        if (practiceRole.RoleId === ctrl.practiceAdminRole.RoleId) {
          expect(practiceRole.$$ObjectState).toEqual('Add');
        } else {
          expect(practiceRole.$$ObjectState).toEqual('None');
        }
      });
      expect(scope.user.$$isPracticeAdmin).toBe(true);
    });

    it('should switch user.$$UserPracticeRoles$$ObjectState to None if role already exists', function () {
      scope.user.$$UserPracticeRoles = [];
      scope.user.$$UserPracticeRoles.push({
        RoleId: 13,
        RoleName: 'Practice Admin/Exec. Dentist',
        $$ObjectState: 'Delete',
      });
      ctrl.switchToPracticeAdmin();
      _.forEach(scope.user.$$UserPracticeRoles, function (practiceRole) {
        if (practiceRole.RoleId === ctrl.practiceAdminRole.RoleId) {
          expect(practiceRole.$$ObjectState).toEqual('None');
        } else {
          expect(practiceRole.$$ObjectState).toEqual('None');
        }
      });
      expect(scope.user.$$isPracticeAdmin).toBe(true);
      expect(ctrl.checkLocationsForRoles).toHaveBeenCalled();
    });
  });

  describe('mergeUserRoleData function -> ', function () {
    beforeEach(function () {});
    it('should call userLocationsSetupFactory.mergeUserRoleData with user and userRoles data', function () {
      ctrl.mergeUserRoleData();
      expect(userLocationsSetupFactory.mergeUserRoleData).toHaveBeenCalledWith(
        scope.user,
        ctrl.userRoles
      );
    });
  });

  describe('ctrl.getRoles function -> ', function () {
    beforeEach(function () {});
    it('should call rolesFactory.Roles with user and userRoles data', function () {
      ctrl.getRoles();
      expect(rolesFactory.Roles).toHaveBeenCalled();
    });
  });

  describe('ctrl.getUserRoles function -> ', function () {
    beforeEach(function () {});
    it('should call rolesFactory.Roles with user and userRoles data', function () {
      ctrl.getUserRoles();
      expect(rolesFactory.UserRoles).toHaveBeenCalledWith(scope.user.UserId);
    });
  });

  describe('ctrl.addUserLocationSetupToList function -> ', function () {
    beforeEach(function () {
      spyOn(ctrl, 'checkLocationsForRoles');
      spyOn(ctrl, 'getAvailableLocations');
      scope.userLocationsErrors = { NoUserLocationsError: false };
      scope.userLocationSetupBackup = null;
    });

    it('should add a userLocationSetup to the scope.userLocationSetups list if new userLocationSetup', function () {
      var userLocationSetup = {
        ProviderTypeId: 2,
        UserProviderSetupLocationId: null,
      };
      scope.userLocationSetups = [];
      ctrl.addUserLocationSetupToList(userLocationSetup);
      expect(scope.userLocationSetups).toEqual([userLocationSetup]);
    });

    it('should replace a userLocationSetup to the scope.userLocationSetups list if existing userLocationSetup', function () {
      var userLocationSetup = {
        ProviderTypeId: 2,
        UserProviderSetupLocationId: '1234',
      };
      scope.userLocationSetups = [];
      scope.userLocationSetups.push({
        ProviderTypeId: 3,
        UserProviderSetupLocationId: '1234',
      });
      ctrl.addUserLocationSetupToList(userLocationSetup);
      expect(scope.userLocationSetups).toEqual([userLocationSetup]);
      expect(scope.userLocationSetups[0].ProviderTypeId).toEqual(2);
    });

    it('should call userLocationsSetupFactory.MergeLocationData', function () {
      var userLocationSetup = {
        ProviderTypeId: 2,
        UserProviderSetupLocationId: null,
        LocationId: 2,
      };
      scope.userLocationSetups = [];
      ctrl.addUserLocationSetupToList(userLocationSetup);
      expect(userLocationsSetupFactory.MergeLocationData).toHaveBeenCalledWith(
        scope.userLocationSetups,
        ctrl.locations,
        ctrl.permittedLocations
      );
    });

    it('should call userLocationsSetupFactory.MergeUserData', function () {
      var userLocationSetup = {
        ProviderTypeId: 2,
        UserProviderSetupLocationId: null,
      };
      scope.userLocationSetups = [];
      ctrl.addUserLocationSetupToList(userLocationSetup);
      expect(userLocationsSetupFactory.MergeUserData).toHaveBeenCalledWith(
        scope.userLocationSetups,
        ctrl.users,
        ctrl.providerTypes
      );
    });

    it('should call ctrl.checkLocationsForRoles and ctrl.getAvailableLocations', function () {
      var userLocationSetup = {
        ProviderTypeId: 2,
        UserProviderSetupLocationId: null,
      };
      scope.userLocationSetups = [];
      ctrl.addUserLocationSetupToList(userLocationSetup);
      expect(ctrl.checkLocationsForRoles).toHaveBeenCalled();
    });

    it('should set scope.displayPracticeRolesChangedMessage to true if existing user', function () {
      var userLocationSetup = {
        ProviderTypeId: 2,
        UserProviderSetupLocationId: null,
      };
      scope.userLocationSetups = [];
      scope.user.UserId = '1234';
      ctrl.addUserLocationSetupToList(userLocationSetup);
      expect(scope.displayPracticeRolesChangedMessage).toBe(true);
    });

    it('should set scope.displayPracticeRolesChangedMessage to false if new user', function () {
      var userLocationSetup = {
        ProviderTypeId: 2,
        UserProviderSetupLocationId: null,
      };
      scope.user.UserId = '';
      scope.userLocationSetups = [];
      ctrl.addUserLocationSetupToList(userLocationSetup);
      expect(scope.displayPracticeRolesChangedMessage).toBe(false);
    });

    it('should set scope.userLocationsErrors.NoUserLocationsError to false', function () {
      var userLocationSetup = {
        ProviderTypeId: 2,
        UserProviderSetupLocationId: null,
      };
      scope.user.UserId = '';
      scope.userLocationSetups = [];
      ctrl.addUserLocationSetupToList(userLocationSetup);
      expect(scope.userLocationsErrors.NoUserLocationsError).toBe(false);
    });

    it('should set scope.userLocationSetupsDataChanged to true when userLocationSetup is added', function () {
      scope.userLocationSetupsDataChanged = false;
      var userLocationSetup = {
        ProviderTypeId: 2,
        UserProviderSetupLocationId: null,
      };
      scope.user.UserId = '';
      scope.userLocationSetups = [];
      ctrl.addUserLocationSetupToList(userLocationSetup);
      expect(scope.userLocationSetupsDataChanged).toBe(true);
    });

    it('should replace userLocationSetup to list when it is being edited', function () {
      scope.userLocationSetups = [
        { ProviderTypeId: 2, UserProviderSetupLocationId: 1234 },
        { ProviderTypeId: 2, UserProviderSetupLocationId: 1235 },
      ];
      expect(scope.userLocationSetups.length).toBe(2);
      ctrl.addUserLocationSetupToList(scope.userLocationSetups[0]);
      expect(scope.userLocationSetups.length).toBe(2);
    });

    it('should add userLocationSetup to list when it is new and not in list', function () {
      var userLocationSetup = {
        ProviderTypeId: 2,
        UserProviderSetupLocationId: null,
        LocationId: 1,
      };
      scope.userLocationSetups = [
        { ProviderTypeId: 2, UserProviderSetupLocationId: 1234, LocationId: 2 },
        { ProviderTypeId: 2, UserProviderSetupLocationId: 1235, LocationId: 3 },
      ];
      expect(scope.userLocationSetups.length).toBe(2);
      ctrl.addUserLocationSetupToList(userLocationSetup);
      expect(scope.userLocationSetups.length).toBe(3);
    });

    it('should replace userLocationSetup to list when it is new and in list and location has changed and userLocationSetupBackup exists', function () {
      scope.userLocationSetups = [
        { ProviderTypeId: 2, UserProviderSetupLocationId: null, LocationId: 2 },
        { ProviderTypeId: 2, UserProviderSetupLocationId: 1235, LocationId: 3 },
      ];
      expect(scope.userLocationSetups.length).toBe(2);

      var newEditedLocation = scope.userLocationSetups[0];
      newEditedLocation.LocationId = 4;
      scope.userLocationBackup = scope.userLocationSetups[0];

      ctrl.addUserLocationSetupToList(newEditedLocation);
      expect(scope.userLocationSetups.length).toBe(2);
      expect(scope.userLocationSetups[0].LocationId).toBe(3);
      expect(scope.userLocationSetups[1].LocationId).toBe(4);
    });

    it('should replace userLocationSetup to list when it is new and in list', function () {
      scope.userLocationSetups = [
        { ProviderTypeId: 2, UserProviderSetupLocationId: null, LocationId: 2 },
        { ProviderTypeId: 2, UserProviderSetupLocationId: 1235, LocationId: 3 },
      ];
      expect(scope.userLocationSetups.length).toBe(2);
      ctrl.addUserLocationSetupToList(scope.userLocationSetups[0]);
      expect(scope.userLocationSetups.length).toBe(2);
    });

    it('should set scope.userLocationSetupsDataChanged to true when userLocationSetup is edited', function () {
      var userLocationSetup = {
        ProviderTypeId: 2,
        UserProviderSetupLocationId: '1234',
      };
      scope.userLocationSetups = [];
      scope.userLocationSetups.push({
        ProviderTypeId: 3,
        UserProviderSetupLocationId: '1234',
      });
      ctrl.addUserLocationSetupToList(userLocationSetup);
      expect(scope.userLocationSetups).toEqual([userLocationSetup]);
      expect(scope.userLocationSetups[0].ProviderTypeId).toEqual(2);
      expect(scope.userLocationSetupsDataChanged).toBe(true);
    });

    it('should merge new userLocationSetup with one that has same location and ObjectState.Delete', function () {
      var newUserLocationSetup = {
        ProviderTypeId: 3,
        LocationId: 2,
        UserProviderSetupLocationId: null,
        ObjectState: 'Add',
      };
      scope.userLocationSetups = [
        {
          ProviderTypeId: 2,
          LocationId: 2,
          UserProviderSetupLocationId: '1234',
          ObjectState: 'Delete',
          DataTag: 'x123',
        },
        {
          ProviderTypeId: 3,
          LocationId: 3,
          UserProviderSetupLocationId: '1235',
          ObjectState: 'Add',
          DataTag: 'x153',
        },
        {
          ProviderTypeId: 4,
          LocationId: 4,
          UserProviderSetupLocationId: '1236',
          ObjectState: 'None',
          DataTag: 'x1x3',
        },
        {
          ProviderTypeId: 3,
          LocationId: 5,
          UserProviderSetupLocationId: '1237',
          ObjectState: 'Update',
          DataTag: 'x173',
        },
      ];

      ctrl.addUserLocationSetupToList(newUserLocationSetup);
      // find the new record
      var findNewUserLocationSetup = _.find(
        scope.userLocationSetups,
        function (userLocationSetup) {
          return userLocationSetup.LocationId === 2;
        }
      );
      expect(findNewUserLocationSetup).toEqual({
        ProviderTypeId: 3,
        LocationId: 2,
        UserProviderSetupLocationId: '1234',
        ObjectState: 'Update',
        DataTag: 'x123',
      });
    });

    it('should merge new userLocationSetup.$$UserLocationRoles with one that has same location and ObjectState.Delete', function () {
      var newUserLocationSetup = {
        ProviderTypeId: 3,
        LocationId: 2,
        UserProviderSetupLocationId: null,
        ObjectState: 'Add',
        $$UserLocationRoles: [
          { RoleId: 1, ObjectState: 'Add' },
          { RoleId: 2, ObjectState: 'Add' },
        ],
      };
      scope.userLocationSetups = [
        {
          ProviderTypeId: 2,
          LocationId: 2,
          UserProviderSetupLocationId: '1234',
          ObjectState: 'Delete',
          DataTag: 'x123',
          $$UserLocationRoles: [
            { RoleId: 1, ObjectState: 'Delete' },
            { RoleId: 3, ObjectState: 'Delete' },
          ],
        },
        {
          ProviderTypeId: 3,
          LocationId: 3,
          UserProviderSetupLocationId: '1235',
          ObjectState: 'Add',
          DataTag: 'x153',
        },
        {
          ProviderTypeId: 4,
          LocationId: 4,
          UserProviderSetupLocationId: '1236',
          ObjectState: 'None',
          DataTag: 'x1x3',
        },
        {
          ProviderTypeId: 3,
          LocationId: 5,
          UserProviderSetupLocationId: '1237',
          ObjectState: 'Update',
          DataTag: 'x173',
        },
      ];

      ctrl.addUserLocationSetupToList(newUserLocationSetup);
      // find the new record
      var findNewUserLocationSetup = _.find(
        scope.userLocationSetups,
        function (userLocationSetup) {
          return userLocationSetup.LocationId === 2;
        }
      );
      expect(findNewUserLocationSetup.$$UserLocationRoles).toEqual([
        { RoleId: 1, ObjectState: 'Add' },
        { RoleId: 2, ObjectState: 'Add' },
        { RoleId: 3, ObjectState: 'Delete' },
      ]);
    });

    it('should not merge new userLocationSetup if userLocationSetup.LocationId doesnt match any in list', function () {
      var newUserLocationSetup = {
        ProviderTypeId: 3,
        LocationId: 6,
        UserProviderSetupLocationId: null,
        ObjectState: 'Add',
      };
      scope.userLocationSetups = [
        {
          ProviderTypeId: 2,
          LocationId: 2,
          UserProviderSetupLocationId: '1234',
          ObjectState: 'Delete',
          DataTag: 'x123',
        },
        {
          ProviderTypeId: 3,
          LocationId: 3,
          UserProviderSetupLocationId: '1235',
          ObjectState: 'Add',
          DataTag: 'x153',
        },
        {
          ProviderTypeId: 4,
          LocationId: 4,
          UserProviderSetupLocationId: '1236',
          ObjectState: 'None',
          DataTag: 'x1x3',
        },
        {
          ProviderTypeId: 3,
          LocationId: 5,
          UserProviderSetupLocationId: '1237',
          ObjectState: 'Update',
          DataTag: 'x173',
        },
      ];
      scope.userLocationSetupBackup = null;

      ctrl.addUserLocationSetupToList(newUserLocationSetup);
      // find the new record
      var findNewUserLocationSetup = _.find(
        scope.userLocationSetups,
        function (userLocationSetup) {
          return userLocationSetup.LocationId === 6;
        }
      );
      expect(findNewUserLocationSetup).toEqual({
        ProviderTypeId: 3,
        LocationId: 6,
        UserProviderSetupLocationId: null,
        ObjectState: 'Add',
      });
    });
  });

  describe('ctrl.getAvailableLocations method -> ', function () {
    beforeEach(function () {});

    it('should filter locations based on which ones are already in the userLocationSetups', function () {
      scope.userLocationSetups = [
        { LocationId: 1, $$UserLocationRoles: [{ RoleId: 1 }, { RoleId: 2 }] },
        { LocationId: 2, $$UserLocationRoles: [{ RoleId: 1 }, { RoleId: 4 }] },
      ];
      ctrl.permittedLocations = [
        { LocationId: 1 },
        { LocationId: 2 },
        { LocationId: 3 },
        { LocationId: 4 },
        { LocationId: 7 },
      ];
      scope.availableLocations = ctrl.getAvailableLocations();
      expect(scope.availableLocations).toEqual([
        { LocationId: 3 },
        { LocationId: 4 },
        { LocationId: 7 },
      ]);
    });

    it('should not filter out locations based that are objectState.Delete in userLocationSetups', function () {
      scope.userLocationSetups = [
        {
          LocationId: 1,
          ObjectState: 'Add',
          $$UserLocationRoles: [{ RoleId: 1 }, { RoleId: 2 }],
        },
        {
          LocationId: 2,
          ObjectState: 'Delete',
          $$UserLocationRoles: [{ RoleId: 1 }, { RoleId: 4 }],
        },
      ];
      ctrl.permittedLocations = [
        { LocationId: 1 },
        { LocationId: 2 },
        { LocationId: 3 },
        { LocationId: 4 },
        { LocationId: 7 },
      ];
      scope.availableLocations = ctrl.getAvailableLocations();
      expect(scope.availableLocations).toEqual([
        { LocationId: 2 },
        { LocationId: 3 },
        { LocationId: 4 },
        { LocationId: 7 },
      ]);
    });
  });

  describe('scope.addUserLocationSetup method -> ', function () {
    beforeEach(function () {
      spyOn(ctrl, 'getAvailableLocations');
      scope.user = _.cloneDeep(newMockUser);
    });
    it('should call scope.availableLocations', function () {
      scope.addUserLocationSetup();
      expect(ctrl.getAvailableLocations).toHaveBeenCalled();
    });

    it('should call userLocationsSetupFactory.UserLocationSetupDto', function () {
      scope.addUserLocationSetup();
      expect(userLocationsSetupFactory.UserLocationSetupDto).toHaveBeenCalled();
    });
  });

  describe('scope.editUserLocationSetup method -> ', function () {
    beforeEach(function () {
      spyOn(ctrl, 'getAvailableLocations');
      scope.user = _.cloneDeep(newMockUser);
    });

    /*
$scope.editUserLocationSetup=function(userLocationSetup){            
            var userLocationSetupToEdit = _.cloneDeep(userLocationSetup);
            $scope.userLocationSetupBackup=null;
            // keep a backup of this userLocationSetup from list if it is a new user location           
            if (_.isNil(userLocationSetup.UserProviderSetupLocationId)){
                var newIndex = _.findIndex($scope.userLocationSetups, function (locationSetup) {
                    return locationSetup.LocationId === userLocationSetup.LocationId;
                });                
                if (newIndex !== -1) {
                    $scope.userLocationSetupBackup= $scope.userLocationSetups[newIndex];                    
                }               
            }            
                    
        */

    it('should set userLocationSetupBackup to null if edited userLocationSetup is not new ', function () {
      scope.userLocationSetups = [
        { ProviderTypeId: 2, UserProviderSetupLocationId: null, LocationId: 2 },
        { ProviderTypeId: 2, UserProviderSetupLocationId: 1235, LocationId: 3 },
      ];
      var editedUserLocation = scope.userLocationSetups[1];
      scope.editUserLocationSetup(editedUserLocation);
      expect(scope.userLocationSetupBackup).toBe(null);
    });
    it('should set userLocationSetupBackup to be edited userLocationSetup if edited userLocationSetup is new ', function () {
      scope.userLocationSetups = [
        { ProviderTypeId: 2, UserProviderSetupLocationId: null, LocationId: 2 },
        { ProviderTypeId: 2, UserProviderSetupLocationId: 1235, LocationId: 3 },
      ];
      var editedUserLocation = scope.userLocationSetups[0];
      scope.editUserLocationSetup(editedUserLocation);
      expect(scope.userLocationSetupBackup.LocationId).toEqual(
        scope.userLocationSetups[0].LocationId
      );
    });
  });

  describe('watch user.RxUserType', function () {
    beforeEach(function () {
      scope.user = _.cloneDeep(newMockUser);
      scope.user.RxUserType = 0;
      scope.user.$$UserPracticeRoles = [];
      ctrl.rxAccessRole = { RoleId: 13, RoleName: 'Rx User' };
    });

    it(
      'should add rxAccessRole to user.$$UserPracticeRoles if RxUserType changed to ProxyUser' +
        'and user.$$UserPracticeRoles does not already contain this role',
      function () {
        scope.user.RxUserType = 2;
        scope.$apply();
        expect(scope.user.$$UserPracticeRoles[0].RoleId).toBe(
          ctrl.rxAccessRole.RoleId
        );
        expect(scope.user.$$UserPracticeRoles[0].RoleName).toBe(
          ctrl.rxAccessRole.RoleName
        );
        expect(scope.user.$$UserPracticeRoles[0].$$ObjectState).toBe('Add');
      }
    );

    it(
      'should add rxAccessRole to user.$$UserPracticeRoles if RxUserType changed to PrescribingUser' +
        'and user.$$UserPracticeRoles does not already contain this role',
      function () {
        scope.user.RxUserType = 1;
        scope.$apply();
        expect(scope.user.$$UserPracticeRoles[0].RoleId).toBe(
          ctrl.rxAccessRole.RoleId
        );
        expect(scope.user.$$UserPracticeRoles[0].RoleName).toBe(
          ctrl.rxAccessRole.RoleName
        );
        expect(scope.user.$$UserPracticeRoles[0].$$ObjectState).toBe('Add');
      }
    );

    it(
      'should set user.$$UserPracticeRoles $$ObjectState to Delete if RxUserType changed from PrescribingUser' +
        'or ProxyUser to No Rx Access and user.$$UserPracticeRoles alreadys contain this role',
      function () {
        scope.user.RxUserType = 0;
        scope.user.$$UserPracticeRoles.push(ctrl.rxAccessRole);
        scope.$apply();
        expect(scope.user.$$UserPracticeRoles[0].RoleId).toBe(
          ctrl.rxAccessRole.RoleId
        );
        expect(scope.user.$$UserPracticeRoles[0].RoleName).toBe(
          ctrl.rxAccessRole.RoleName
        );
        expect(scope.user.$$UserPracticeRoles[0].$$ObjectState).toBe('Delete');
      }
    );
  });

  describe('$on sendLicensesToValidate ->', function () {
    beforeEach(function () {
      spyOn(ctrl, 'validateStateLicenseByLocation');
    });
    it('should call $scope.modalInstance.close();', function () {
      scope.$broadcast('sendLicensesToValidate');
      expect(ctrl.validateStateLicenseByLocation).toHaveBeenCalled();
    });
  });

  describe('ctrl.checkForUserStateLicense method -> ', function () {
    beforeEach(function () {
      scope.user = _.cloneDeep(newMockUser);
      ctrl.permittedLocations = [
        { LocationId: 1, State: 'AR' },
        { LocationId: 2, State: 'AR' },
        { LocationId: 3, State: 'MN' },
        { LocationId: 4, State: 'IL' },
        { LocationId: 7, State: 'AR' },
      ];

      ctrl.updatedLicenses = [
        { StateAbbreviation: 'IL' },
        { StateAbbreviation: 'AR' },
      ];
    });
    it('should return location.State for state that does not have item in ctrl.updatedLicenses', function () {
      var locationId = 3;
      expect(ctrl.checkForUserStateLicense(locationId)).toEqual('MN');
    });
    it('should return empty for state that does have item in ctrl.updatedLicenses', function () {
      var locationId = 7;
      expect(ctrl.checkForUserStateLicense(locationId)).toEqual('');
    });
  });

  describe('ctrl.validateStateLicenseByLocation method -> ', function () {
    beforeEach(function () {
      scope.user = _.cloneDeep(newMockUser);

      scope.userLocationSetups = [
        { LocationId: 1, $$UserLocationRoles: [] },
        { LocationId: 3, $$UserLocationRoles: [] },
      ];

      ctrl.permittedLocations = [
        { LocationId: 1, State: 'AR' },
        { LocationId: 2, State: 'AR' },
        { LocationId: 3, State: 'MN' },
        { LocationId: 4, State: 'IL' },
        { LocationId: 7, State: 'AR' },
      ];
      ctrl.updatedLicenses = [
        { StateAbbreviation: 'IL' },
        { StateAbbreviation: 'AR' },
      ];
      spyOn(rootScope, '$broadcast');
    });

    it('should set scope.needLicenseStates concatenated values returned from checkForUserStateLicense', function () {
      spyOn(ctrl, 'checkForUserStateLicense').and.returnValue('AR');
      ctrl.validateStateLicenseByLocation();
      expect(scope.needLicenseStates).toEqual('AR');
    });

    it('should add row to ctrl.validatedStates for each value returned from checkForUserStateLicense', function () {
      spyOn(ctrl, 'checkForUserStateLicense').and.returnValue('AR');
      ctrl.validateStateLicenseByLocation();
      expect(ctrl.validatedStates).toEqual([{ StateAbbreviation: 'AR' }]);
      expect(rootScope.$broadcast).toHaveBeenCalledWith(
        'stateLicenseValidation',
        'Please add a State License for AR'
      );
    });
  });

  describe('$scope.removeUserLocationSetup method ->', function () {
    beforeEach(function () {
      scope.userLocationSetups = _.cloneDeep(userLocationSetupsMock);
      scope.hasDeleteAccess = true;
    });

    it('should call setCanRemoveLocation with userLocationSetup', function () {
      var userLocationSetupToDelete = scope.userLocationSetups[0];
      spyOn(ctrl, 'setCanRemoveLocation').and.callFake(function () {});
      userLocationSetupToDelete.UserProviderSetupLocationId = 1234;
      scope.removeUserLocationSetup(userLocationSetupToDelete);
      expect(ctrl.setCanRemoveLocation).toHaveBeenCalledWith(
        userLocationSetupToDelete
      );
    });

    it(
      'should set userLocationSetup.ObjectState to Delete if userLocationSetup.$$CanRemoveLocation is true ' +
        'and this is an existing userLocationSetup',
      function () {
        var userLocationSetupToDelete = scope.userLocationSetups[0];
        userLocationSetupToDelete.$$CanRemoveLocation = true;
        userLocationSetupToDelete.UserProviderSetupLocationId = 1234;
        scope.removeUserLocationSetup(userLocationSetupToDelete);
        expect(userLocationSetupToDelete.ObjectState).toEqual('Delete');
      }
    );

    it(
      'should remove userLocationSetup from list if userLocationSetup.$$CanRemoveLocation is true ' +
        'and this is not an existing userLocationSetup',
      function () {
        var userLocationSetupToDelete = scope.userLocationSetups[0];
        userLocationSetupToDelete.$$CanRemoveLocation = true;
        userLocationSetupToDelete.UserProviderSetupLocationId = null;
        scope.removeUserLocationSetup(userLocationSetupToDelete);
        expect(scope.userLocationSetups.length).toBe(1);
        expect(scope.userLocationSetups[0].UserLocationSetupId).toBe(5678);
      }
    );

    it(
      'should set each userLocationSetup.$$UserLocationRoles to Delete if userLocationSetup.$$CanRemoveLocation is true ' +
        'and this is an existing userLocationSetup and $$ObjectState is not Add',
      function () {
        var userLocationSetupToDelete = scope.userLocationSetups[0];
        userLocationSetupToDelete.$$UserLocationRoles = [
          { RoleId: 1, ObjectState: 'None' },
          { RoleId: 2, ObjectState: 'Add' },
        ];
        userLocationSetupToDelete.$$CanRemoveLocation = true;
        userLocationSetupToDelete.UserProviderSetupLocationId = 1234;
        scope.removeUserLocationSetup(userLocationSetupToDelete);
        _.forEach(
          userLocationSetupToDelete.$$UserLocationRoles,
          function (userLocationRole) {
            if (userLocationRole.$$ObjectState !== 'Add') {
              expect(userLocationRole.$$ObjectState).toEqual('Delete');
            }
          }
        );
      }
    );

    it(
      'should set each userLocationSetup.$$UserLocationRoles to None if userLocationSetup.$$CanRemoveLocation is true ' +
        'and this is an existing userLocationSetup and $$ObjectState is Add',
      function () {
        var userLocationSetupToDelete = scope.userLocationSetups[0];
        userLocationSetupToDelete.$$UserLocationRoles = [
          { RoleId: 1, ObjectState: 'None' },
          { RoleId: 2, ObjectState: 'Add' },
        ];
        userLocationSetupToDelete.$$CanRemoveLocation = true;
        userLocationSetupToDelete.UserProviderSetupLocationId = 1234;
        scope.removeUserLocationSetup(userLocationSetupToDelete);
        _.forEach(
          userLocationSetupToDelete.$$UserLocationRoles,
          function (userLocationRole) {
            if (userLocationRole.$$ObjectState === 'Add') {
              expect(userLocationRole.$$ObjectState).toEqual('None');
            }
          }
        );
      }
    );

    it(
      'should not set userLocationSetup.ObjectState to Delete if userLocationSetup.$$CanRemoveLocation is false ' +
        'and this is an existing userLocationSetup',
      function () {
        spyOn(ctrl, 'setCanRemoveLocation').and.callFake(function () {});
        var userLocationSetupToDelete = scope.userLocationSetups[0];
        userLocationSetupToDelete.$$CanRemoveLocation = false;
        userLocationSetupToDelete.UserProviderSetupLocationId = 1234;
        scope.removeUserLocationSetup(userLocationSetupToDelete);
        expect(userLocationSetupToDelete.ObjectState).not.toEqual('Delete');
      }
    );

    it('should show correct locations available in list', function () {
      var userLocationSetupToDelete = scope.userLocationSetups[1];
      userLocationSetupToDelete.$$CanRemoveLocation = false;
      userLocationSetupToDelete.UserProviderSetupLocationId = null;
      scope.removeUserLocationSetup(userLocationSetupToDelete);
      expect(scope.userLocationSetups[0].UserLocationSetupId).toBe(1234);
    });
  });

  describe('ctrl.setCanRemoveLocation method ->', function () {
    var userLocationSetup;
    beforeEach(function () {
      scope.userLocationSetups = _.cloneDeep(userLocationSetupsMock);
      userLocationSetup = scope.userLocationSetups[0];
      scope.user.$$scheduleStatuses = [
        {
          UserId: '1234',
          LocationId: 2,
          HasProviderAppointments: false,
          HasProviderRoomOccurrences: false,
        },
        {
          UserId: '1234',
          LocationId: 3,
          HasProviderAppointments: false,
          HasProviderRoomOccurrences: true,
        },
      ];
    });
    it('should set userLocationSetup.$$CanRemoveLocation to true if the location to remove does not have ProviderRoomOccurrences or Provider Appointments for this location ', function () {
      userLocationSetup.LocationId = 2;
      ctrl.setCanRemoveLocation(userLocationSetup);
      expect(userLocationSetup.$$CanRemoveLocation).toEqual(true);
      expect(userLocationSetup.$$RemoveButtonTooltip).toEqual('Remove {0}');
    });

    it('should set userLocationSetup.$$CanRemoveLocation to false if the location to remove does have HasProviderAppointments for this location ', function () {
      userLocationSetup.LocationId = 3;
      scope.user.$$scheduleStatuses = [
        {
          UserId: '1234',
          LocationId: 2,
          HasProviderAppointments: false,
          HasProviderRoomOccurrences: false,
        },
        {
          UserId: '1234',
          LocationId: 3,
          HasProviderAppointments: true,
          HasProviderRoomOccurrences: false,
        },
      ];
      ctrl.setCanRemoveLocation(userLocationSetup);
      expect(userLocationSetup.$$CanRemoveLocation).toEqual(false);
      expect(userLocationSetup.$$RemoveButtonTooltip).toEqual(
        'This {0} cannot be changed because he/she has scheduled hours and/or scheduled appointments.'
      );
    });

    it('should set userLocationSetup.$$CanRemoveLocation to true if the location to remove does not have ProviderRoomOccurrences for this location', function () {
      userLocationSetup.LocationId = 3;
      scope.user.$$scheduleStatuses = [
        {
          UserId: '1234',
          LocationId: 2,
          HasProviderAppointments: false,
          HasProviderRoomOccurrences: false,
        },
        {
          UserId: '1234',
          LocationId: 3,
          HasProviderAppointments: false,
          HasProviderRoomOccurrences: true,
        },
      ];
      ctrl.setCanRemoveLocation(userLocationSetup);
      expect(userLocationSetup.$$CanRemoveLocation).toEqual(false);
      expect(userLocationSetup.$$RemoveButtonTooltip).toEqual(
        'This {0} cannot be changed because he/she has scheduled hours and/or scheduled appointments.'
      );
    });

    it('should set userLocationSetup.$$CanRemoveLocation to true if the location to remove does have ProviderRoomOccurrences for this location ', function () {
      userLocationSetup.LocationId = 3;
      scope.user.$$scheduleStatuses = null;
      ctrl.setCanRemoveLocation(userLocationSetup);
      expect(userLocationSetup.$$CanRemoveLocation).toEqual(true);
    });
  });

  describe('ctrl.addPracticeRole method -> ', function () {
    beforeEach(function () {
      scope.userLocationSetups = [
        { LocationId: 1, UserLocationSetupId: 1234, $$UserLocationRoles: [] },
        { LocationId: 2, UserLocationSetupId: 5678, $$UserLocationRoles: [] },
      ];
      ctrl.roles = [{ RoleId: 1 }, { RoleId: 2 }, { RoleId: 3 }, { RoleId: 4 }];
      ctrl.practiceAdminRole = { RoleId: 2 };
      scope.user.$$UserPracticeRoles = [];
    });
    it('should add inactive practice roles back to user.$$UserPracticeRoles', function () {
      ctrl.addPracticeRole(2);
      expect(scope.user.$$UserPracticeRoles).toEqual([
        { RoleId: 2, $$ObjectState: 'Add' },
      ]);
    });

    it('should user.$$UserPracticeRoles ObjectState to Add', function () {
      ctrl.addPracticeRole(2);
      _.forEach(scope.user.$$UserPracticeRoles, function (practiceRole) {
        expect(practiceRole.$$ObjectState).toEqual('Add');
      });
    });
  });

  describe('ctrl.addLocationRole method -> ', function () {
    beforeEach(function () {
      scope.userLocationSetups = [
        { LocationId: 1, UserLocationSetupId: 1234, $$UserLocationRoles: [] },
        { LocationId: 2, UserLocationSetupId: 5678, $$UserLocationRoles: [] },
      ];
      ctrl.roles = [{ RoleId: 1 }, { RoleId: 2 }, { RoleId: 3 }, { RoleId: 4 }];
    });
    it('should add inactive location roles back to userLocationSetups', function () {
      ctrl.addLocationRole(3, 2);
      expect(scope.userLocationSetups).toEqual([
        { LocationId: 1, UserLocationSetupId: 1234, $$UserLocationRoles: [] },
        {
          LocationId: 2,
          UserLocationSetupId: 5678,
          $$UserLocationRoles: [{ RoleId: 3, $$ObjectState: 'Add' }],
        },
      ]);
    });
    it('should user.$$UserPracticeRoles ObjectState to Add', function () {
      ctrl.addLocationRole(3, 2);
      _.forEach(
        scope.userLocationSetups.$$UserLocationRoles,
        function (userLocationRole) {
          expect(userLocationRole.$$ObjectState).toEqual('Add');
        }
      );
    });
  });

  describe('ctrl.getInactiveUserRoles method -> ', function () {
    beforeEach(function () {});
    it('should call rolesFactory.GetInactiveUserAssignedRoles', function () {
      ctrl.getInactiveUserRoles();
      expect(rolesFactory.GetInactiveUserAssignedRoles).toHaveBeenCalledWith(
        scope.user.UserId
      );
    });
  });

  describe('watch userActivated', function () {
    beforeEach(function () {
      scope.userActivated = false;
      scope.$apply();
      spyOn(ctrl, 'getInactiveUserRoles');
    });

    it('should call ctrl.getInactiveUserRoles if userActivated is true and scope.user.IsActive is true', function () {
      scope.user.IsActive = true;
      scope.userActivated = true;
      scope.$apply();
      expect(ctrl.getInactiveUserRoles).toHaveBeenCalled();
    });

    it('should not call ctrl.getInactiveUserRoles if userActivated is true and scope.user.IsActive is false', function () {
      scope.user.IsActive = false;
      scope.userActivated = true;
      scope.$apply();
      expect(ctrl.getInactiveUserRoles).not.toHaveBeenCalled();
    });
  });
});
