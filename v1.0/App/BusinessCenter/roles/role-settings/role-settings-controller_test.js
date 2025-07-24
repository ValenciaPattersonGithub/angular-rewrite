describe('role-settings-controller tests ->', function () {
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
    modalInstance;
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
      };
      $provide.value('LocationServices', locationServices);

      // Mock for modal instance
      modalInstance = {
        close: jasmine.createSpy(),
        dismiss: jasmine.createSpy(),
      };
      $provide.value('ModalInstance', modalInstance);

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
          getRoleMatrix: jasmine.createSpy().and.returnValue({
            then: jasmine.createSpy(),
          }),
        },
        UserScheduleLocation: {
          get: jasmine.createSpy(),
          update: jasmine.createSpy(),
        },
      };
      $provide.value('UserServices', userServices);

      //mock for toastrFactory
      toastrFactory = {
        success: jasmine.createSpy(),
        error: jasmine.createSpy(),
      };

      // mock localize
      localize = {
        getLocalizedString: jasmine.createSpy().and.returnValue({
          then: jasmine.createSpy().and.returnValue(''),
        }),
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

    sessionStorage.setItem(
      'userContext',
      JSON.stringify({ Result: { Application: { ApplicationId: 1 } } })
    );

    // create controller
    ctrl = $controller('RoleSettingsController', {
      $scope: scope,
      UserServices: userServices,
      toastrFactory: toastrFactory,
      $timeout: timeout,
      $uibModalInstance: modalInstance,
      LocationServices: locationServices,
      $location: location,
      localize: localize,
      $q: q,
    });
  }));

  //controller
  it('RoleSettingsController : should check if controller exists', function () {
    expect(ctrl).not.toBeNull();
    expect(ctrl).not.toBeUndefined();
  });

  describe('getRoles function -->', function () {
    it('should call userServices.Roles.get function', function () {
      ctrl.getRoles();
      expect(userServices.Roles.get).toHaveBeenCalled();
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
  });

  describe('rolesGetFailure function -->', function () {
    it('should make scope.roles.length to equal 2', function () {
      ctrl.rolesGetFailure();
      expect(toastrFactory.error).toHaveBeenCalled();
    });
  });

  describe('getRoleMatrix function -->', function () {
    it('should call userServices.Roles.get function', function () {
      ctrl.getRoleMatrix();
      expect(userServices.Roles.getRoleMatrix).toHaveBeenCalled();
    });
  });

  describe('roleMatrixSuccess function -->', function () {
    it('should make scope.roles.length to equal 2', function () {
      var roleMatrixMock = {
        Result: [
          {
            RoleId: 1,
            AccessLevel: 2,
            RoleName: 'low',
          },
        ],
      };

      ctrl.roleMatrixSuccess(roleMatrixMock);
      expect(scope.isLoading).toBe(false);
    });

    it('should set scope.isLoading to false', function () {
      var roleMatrixMock = {
        Result: [
          {
            RoleId: 1,
            AccessLevel: 2,
            RoleName: 'low',
          },
        ],
      };

      ctrl.rolesGetSuccess(roleMatrixMock);
      expect(scope.isLoading).toBe(false);
    });

    it('should set scope.isLoading to false', function () {
      var roleMatrixMock = {
        Result: [
          {
            RoleId: 2,
            AccessLevel: 2,
            RoleName: 'medium',
          },
        ],
      };
      scope.user = {};
      ctrl.rolesGetSuccess(roleMatrixMock);
      expect(scope.roles.length).toEqual(1);
    });
  });

  describe('roleMatrixFailure function -->', function () {
    it('should make scope.roles.length to equal 2', function () {
      ctrl.roleMatrixFailure();
      expect(toastrFactory.error).toHaveBeenCalled();
      expect(scope.isLoading).toBe(false);
    });

    it('should set scope.isLoading to false', function () {
      ctrl.roleMatrixFailure();
      expect(scope.isLoading).toBe(false);
    });
  });
});
