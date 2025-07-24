describe('Controller: UserRolesController', function () {
  var ctrl,
    scope,
    location,
    locationServices,
    toastrFactory,
    timeout,
    localize,
    userServices,
    q,
    deferred,
    tabLauncher;
  var usersFactory;
  var resultMock = {
    Value: [
      {
        RoleId: 1,
        AccessLevel: 2,
      },
      {
        RoleId: 2,
        AccessLevel: 2,
      },
    ],
  };

  var resMock = {
    Result: [
      {
        RoleId: 1,
        AccessLevel: 2,
      },
      {
        RoleId: 2,
        AccessLevel: 2,
      },
    ],
  };

  beforeEach(module('Soar.Common'));
  beforeEach(module('common.factories'));
  beforeEach(module('Soar.BusinessCenter'));

  beforeEach(inject(function (
    $rootScope,
    $controller,
    $injector,
    $location,
    $filter,
    $q
  ) {
    scope = $rootScope.$new();
    timeout = $injector.get('$timeout');
    q = $injector.get('$q');
    location = $injector.get('$location');

    //mock for userServices
    userServices = {
      Roles: {
        get: jasmine.createSpy(),
        deleteRole: jasmine
          .createSpy('userServices.Roles.deleteRole')
          .and.callFake(function () {
            deferred = q.defer();
            deferred.$promise = deferred.promise;
            deferred.resolve('some value in return');
            return deferred;
          }),
        assignRole: jasmine
          .createSpy('userServices.Roles.assignRole')
          .and.callFake(function () {
            deferred = q.defer();
            deferred.$promise = deferred.promise;
            deferred.resolve('some value in return');
            deferred.reject('ERROR');
            return deferred;
          }),
        getUserRoles: jasmine
          .createSpy('userServices.Roles.getUserRoles')
          .and.callFake(function () {
            deferred = q.defer();
            deferred.$promise = deferred.promise;
            deferred.resolve('some value in return');
            return deferred;
          }),
      },
      Users: {
        get: jasmine.createSpy(),
      },
    };

    tabLauncher = {
      launchNewTab: jasmine.createSpy(),
    };

    //mock for locationServices
    locationServices = {
      get: jasmine.createSpy(),
    };

    //mock for toastrFactory
    toastrFactory = {
      success: jasmine.createSpy(),
      error: jasmine.createSpy(),
    };

    // mock localize
    localize = {
      getLocalizedString: jasmine.createSpy().and.returnValue(''),
    };

    //mock for usersFactory
    usersFactory = {
      Users: jasmine.createSpy('usersFactory.Users').and.callFake(function () {
        deferred = $q.defer();
        deferred.resolve(1);
        return {
          result: deferred.promise,
          then: function () {},
        };
      }),
    };

    // create controller
    ctrl = $controller('UserRolesController', {
      $scope: scope,
      toastrFactory: toastrFactory,
      LocationServices: locationServices,
      localize: localize,
      UserServices: userServices,
      $timeout: timeout,
      $q: q,
      patSecurityService: _authPatSecurityService_,
      tabLauncher: tabLauncher,
      $location: location,
      UsersFactory: usersFactory,
    });
  }));

  //controller
  it('UserRolesController : should check if controller exists', function () {
    expect(ctrl).not.toBeNull();
    expect(ctrl).not.toBeUndefined();
  });

  describe('authAccess function -->', function () {
    it('should set scope.hasRoleDetailsAccess to true', function () {
      ctrl.checkUserHasRoleDetailsAccess = jasmine
        .createSpy()
        .and.returnValue(true);
      ctrl.authAccess();
      expect(scope.hasRoleDetailsAccess).toBe(true);
    });

    it('should set scope.hasRoleDetailsAccess to true', function () {
      scope.hasBasicRoleAccess = false;
      ctrl.checkUserHasRoleDetailsAccess = jasmine
        .createSpy()
        .and.returnValue(false);
      spyOn(ctrl, 'notifyNotAuthorized');
      ctrl.authAccess();
      expect(ctrl.notifyNotAuthorized).toHaveBeenCalled();
      expect(location.path).toHaveBeenCalledWith('/');
    });
  });

  describe('getPracticeUsers function -->', function () {
    it('should call userServices.Users.get function', function () {
      ctrl.getPracticeUsers();
      expect(usersFactory.Users).toHaveBeenCalled();
    });
  });

  describe('getPracticeUsersSuccess function -->', function () {
    it('should set scope.users equal to resultMock', function () {
      ctrl.getPracticeUsersSuccess(resultMock);
      expect(scope.users.length).toEqual(2);
    });
  });

  describe('getPracticeUsersFailure function -->', function () {
    it('should set scope.users equal to empty and call toastrFactory.error function', function () {
      ctrl.getPracticeUsersFailure();
      expect(scope.users.length).toEqual(0);
      expect(toastrFactory.error).toHaveBeenCalled();
    });
  });

  describe('getRoles function -->', function () {
    it('should call userServices.Roles.get function', function () {
      ctrl.getRoles();
      expect(userServices.Roles.get).toHaveBeenCalled();
    });
  });

  describe('getRolesSuccess function -->', function () {
    it('should make scope.roles.length to equal 1', function () {
      var resMock = {
        Result: [
          {
            RoleId: 1,
            AccessLevel: 2,
            RoleName: 'Low',
          },
        ],
      };
      scope.user = { UserId: 1 };
      ctrl.getRolesSuccess(resMock);
      expect(scope.roles.length).toEqual(1);
    });

    it('should make scope.roles.length to equal 1', function () {
      var resMock = {
        Result: [
          {
            RoleId: 1,
            AccessLevel: 2,
            RoleName: 'Medium',
          },
        ],
      };
      scope.user = { UserId: 1 };
      ctrl.getRolesSuccess(resMock);
      expect(scope.roles.length).toEqual(1);
    });

    it('should make scope.roles.length to equal 1', function () {
      var resMock = {
        Result: [
          {
            RoleId: 1,
            AccessLevel: 2,
            RoleName: 'High',
          },
        ],
      };
      scope.user = { UserId: 1 };
      ctrl.getRolesSuccess(resMock);
      expect(scope.roles.length).toEqual(1);
    });

    it('should make scope.roles.length to equal 1', function () {
      var resMock = {
        Result: [
          {
            RoleId: 1,
            AccessLevel: 2,
            RoleName: 'Other',
          },
        ],
      };
      scope.user = { UserId: 1 };
      ctrl.getRolesSuccess(resMock);
      expect(scope.roles.length).toEqual(1);
    });
  });

  describe('getRolesFailure function -->', function () {
    it('should call toastrFactory.error ', function () {
      ctrl.getRolesFailure();
      expect(toastrFactory.error).toHaveBeenCalled();
    });
  });

  describe('getRolesFailure function -->', function () {
    it('should make scope.roles.length to equal 2', function () {
      var e = { dropTarget: [{ id: 1 }] };
      spyOn(scope, 'assignRoleToSelectedUsers');
      scope.onDrop(e);
      expect(scope.assignRoleToSelectedUsers).toHaveBeenCalled();
    });
  });

  describe('clearUserSelection function -->', function () {
    it('should set assigningRole to false and role to null', function () {
      ctrl.selectedUsers = [{ selected: true }, { selected: true }];
      ctrl.role = { selected: true };
      ctrl.clearUserSelection();
      expect(ctrl.selectedUsers.length).toEqual(0);
      expect(scope.assigningRole).toBe(false);
      expect(ctrl.role).toBe(null);
    });
  });

  describe('getUserRolesOnSuccess function -->', function () {
    it('should call userServices.Roles.deleteRole if current roleId is not equal to roleIdToBeAssigned', function () {
      var userId = 1,
        roleIdToBeAssigned = 2;
      var deferredObject = { resolve: jasmine.createSpy() };
      var userRoles = [{ RoleId: 1 }, { RoleId: 2 }];
      ctrl.getUserRolesOnSuccess(
        userId,
        roleIdToBeAssigned,
        userRoles,
        deferredObject
      );
      expect(userServices.Roles.deleteRole).toHaveBeenCalled();
    });

    it('should call deferredObject.resolve if current roleId is equal to roleIdToBeAssigned', function () {
      var userId = 1,
        roleIdToBeAssigned = 3;
      var deferredObject = { resolve: jasmine.createSpy() };
      var userRoles = [{ RoleId: 3 }, { RoleId: 2 }];
      ctrl.getUserRolesOnSuccess(
        userId,
        roleIdToBeAssigned,
        userRoles,
        deferredObject
      );
      expect(deferredObject.resolve).toHaveBeenCalled();
    });

    it('should call addUserRole if there are no roles added', function () {
      var userId = 1,
        roleIdToBeAssigned = 3;
      var deferredObject = { resolve: jasmine.createSpy() };
      spyOn(ctrl, 'addUserRole');
      var userRoles = [];
      ctrl.getUserRolesOnSuccess(
        userId,
        roleIdToBeAssigned,
        userRoles,
        deferredObject
      );
      expect(ctrl.addUserRole).toHaveBeenCalled();
    });
  });

  describe('getUserRolesOnFailure function -->', function () {
    it('should call toastrFactory.error and deferredObject.reject', function () {
      var deferredObject = { reject: jasmine.createSpy() };
      ctrl.getUserRolesOnFailure(deferredObject);
      expect(toastrFactory.error).toHaveBeenCalled();
      expect(deferredObject.reject).toHaveBeenCalled();
    });
  });

  describe('deleteUserRoleOnSuccess function -->', function () {
    it('should call addUserRole ', function () {
      var userId = 1,
        roleId = 3;
      var deferredObject = { resolve: jasmine.createSpy() };
      spyOn(ctrl, 'addUserRole');
      ctrl.deleteUserRoleOnSuccess(userId, roleId, deferredObject);
      expect(ctrl.addUserRole).toHaveBeenCalled();
    });
  });

  describe('deleteUserRoleOnFailure function -->', function () {
    it('should call toastrFactory.error and deferredObject.reject', function () {
      var deferredObject = { reject: jasmine.createSpy() };
      ctrl.deleteUserRoleOnFailure(deferredObject);
      expect(toastrFactory.error).toHaveBeenCalled();
      expect(deferredObject.reject).toHaveBeenCalled();
    });
  });

  describe('addUserRole function -->', function () {
    it('should call userServices.Roles.assignRole ', function () {
      spyOn(ctrl, 'addUserRoleOnFailure');
      var userId = 1,
        roleId = 3;
      var deferredObject = { resolve: jasmine.createSpy() };
      ctrl.addUserRole(userId, roleId, deferredObject);
      expect(userServices.Roles.assignRole).toHaveBeenCalled();
    });
  });

  describe('addUserRoleOnSuccess function -->', function () {
    it('should call toastrFactory.success and deferredObject.resolve', function () {
      var deferredObject = { resolve: jasmine.createSpy() };
      ctrl.addUserRoleOnSuccess(deferredObject);
      expect(deferredObject.resolve).toHaveBeenCalled();
    });
  });

  describe('addUserRoleOnFailure function -->', function () {
    it('should call toastrFactory.success and deferredObject.reject', function () {
      var deferredObject = { reject: jasmine.createSpy() };
      ctrl.addUserRoleOnFailure(deferredObject);
      expect(deferredObject.reject).toHaveBeenCalled();
    });
  });

  describe('init function -->', function () {
    it('should call getLocations, getPracticeUsers and getRoles', function () {
      spyOn(ctrl, 'getPracticeUsers');
      spyOn(ctrl, 'getRoles');
      ctrl.init();
      expect(ctrl.getPracticeUsers).toHaveBeenCalled();
      expect(ctrl.getRoles).toHaveBeenCalled();
    });
  });

  describe('assignRoleToSelectedUsers function -->', function () {
    it('should set scope.assigningRole and ctrl.role.selected to true', function () {
      var roleId = 1;
      scope.roles = [
        { RoleId: 1, selected: true },
        { RoleId: 2, selected: true },
      ];
      scope.assigningRole = false;
      scope.assignRoleToSelectedUsers(roleId);
      expect(ctrl.role.selected).toBe(true);
    });

    it('should call userServices.Roles.getRoleAssociatedWithUser', function () {
      var roleId = 1;
      scope.roles = [
        { RoleId: 1, selected: false },
        { RoleId: 2, selected: true },
      ];
      scope.users = [
        { UserId: 1, selected: true },
        { UserId: 2, selected: false },
      ];
      spyOn(ctrl, 'clearUserSelection');
      scope.assigningRole = false;
      scope.assignRoleToSelectedUsers(roleId);
      expect(userServices.Roles.getUserRoles).toHaveBeenCalled();
      //expect(ctrl.clearUserSelection).toHaveBeenCalled();
    });
  });

  describe('openDetailsInNewTab function -->', function () {
    it('should call tabLauncher method', function () {
      var roleId = 1;
      scope.hasRoleDetailsAccess = true;
      scope.openDetailsInNewTab(roleId);
      expect(tabLauncher.launchNewTab).toHaveBeenCalled();
    });
    it('should call tabLauncher method', function () {
      var roleId = 1;
      ctrl.notifyNotAuthorized = jasmine.createSpy();
      scope.hasRoleDetailsAccess = false;
      scope.openDetailsInNewTab(roleId);
      expect(ctrl.notifyNotAuthorized).toHaveBeenCalled();
    });
  });

  describe('draggableHint function ->', function () {
    it('should return hintHtml as per selected users', function () {
      var hintHTML = '';
      scope.users = [
        { FirstName: 'Ted', LastName: 'Honey', selected: true },
        { FirstName: 'Bun', LastName: 'Shin', selected: true },
      ];
      hintHTML = scope.draggableHint();

      expect(hintHTML).not.toEqual('');
    });
  });

  describe('notifyNotAuthorized function ->', function () {
    it('should call toastr Factory error method', function () {
      ctrl.notifyNotAuthorized();
      expect(toastrFactory.error).toHaveBeenCalled();
    });
  });
});
