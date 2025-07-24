describe('RoleLandingController', function () {
  var ctrl,
    scope,
    routeParams,
    userServices,
    toastrFactory,
    filter,
    patSecurityService,
    location,
    localize;

  var resultMock = {
    Result: [
      {
        RoleId: 1,
        RoleName: 'Low',
        AccessLevel: 2,
      },
      {
        RoleId: 2,
        RoleName: 'Medium',
        AccessLevel: 2,
      },
      {
        RoleId: 3,
        RoleName: 'High',
        AccessLevel: 2,
      },
    ],
  };

  // mock for option
  var option = {
    RoleId: 2,
    RoleName: 'Medium',
  };

  //beforeEach(module("kendo.directives"));
  beforeEach(module('Soar.Common'));
  beforeEach(module('common.factories'));
  beforeEach(module('Soar.BusinessCenter'));

  beforeEach(inject(function ($rootScope, $controller, $injector) {
    scope = $rootScope.$new();

    routeParams = {
      RoleId: '3',
    };

    //mock for userServices
    userServices = {
      Roles: {
        get: jasmine.createSpy(),
      },
    };

    //mock for toastrFactory
    toastrFactory = {
      success: jasmine.createSpy(),
      error: jasmine.createSpy(),
    };

    filter = $injector.get('$filter');

    //mock for patSecurityService
    patSecurityService = {
      IsAuthorizedByAbbreviation: jasmine
        .createSpy('patSecurityService.IsAuthorizedByAbbreviation')
        .and.returnValue(true),
      generateMessage: jasmine.createSpy('patSecurityService.generateMessage'),
    };

    location = $injector.get('$location');

    // mock localize
    localize = {
      getLocalizedString: jasmine.createSpy().and.returnValue(''),
    };

    // create controller
    ctrl = $controller('RoleLandingController', {
      $scope: scope,
      $routeParams: routeParams,
      UserServices: userServices,
      toastrFactory: toastrFactory,
      $filter: filter,
      patSecurityService: patSecurityService,
      $location: location,
      localize: localize,
    });
  }));

  //controller
  it('RoleLandingController : should check if controller exists', function () {
    expect(ctrl).not.toBeNull();
    expect(ctrl).not.toBeUndefined();
  });

  describe('getRoles function -->', function () {
    it('should call userServices.Roles.get function', function () {
      ctrl.getRoles();
      expect(userServices.Roles.get).toHaveBeenCalled();
    });
  });

  describe('rolesGetSuccess function -->', function () {
    it('should make scope.roleList.length to equal 3', function () {
      ctrl.rolesGetSuccess(resultMock);
      expect(scope.roleList.length).toEqual(3);
    });

    it('should make scope.roleList.length to equal 2 and set first role as selected when roleId is invalid', function () {
      var resultMock = {
        Result: [
          {
            RoleId: 1,
            RoleName: 'Low',
            AccessLevel: 2,
          },
          {
            RoleId: 2,
            RoleName: 'Medium',
            AccessLevel: 2,
          },
        ],
      };

      ctrl.rolesGetSuccess(resultMock);

      expect(scope.roleList.length).toEqual(2);
      expect(scope.selectedRoleId).toEqual(1);
    });
  });

  describe('rolesGetFailure function -->', function () {
    it('should call toastrFactory erroe message in case of exception from the api', function () {
      ctrl.rolesGetFailure();
      expect(toastrFactory.error).toHaveBeenCalled();
    });
  });

  // set the name of currently selected view
  describe('roleOptionClicked function -->', function () {
    it('should set selectedRoleId as per role option clicked', function () {
      scope.roleOptionClicked(option);
      expect(scope.selectedRoleId).toEqual(2);
    });
  });

  describe('createBreadCrumb function -->', function () {
    it('should set SourceName and SourceRoute', function () {
      routeParams.SourceName = 1;
      ctrl.createBreadCrumb(option);
      expect(scope.SourceName).toEqual('Assign Roles');
      expect(scope.SourceRoute).toEqual('#/BusinessCenter/Users/Roles/');
    });

    it('should set SourceName and SourceRoute', function () {
      routeParams.SourceName = 2;
      ctrl.createBreadCrumb(option);
      expect(scope.SourceName).toEqual('Add a Team Member');
      expect(scope.SourceRoute).toEqual('#/BusinessCenter/Users/Create/');
    });

    it('should set SourceName and SourceRoute to Null', function () {
      routeParams.SourceName = 3;
      ctrl.createBreadCrumb(option);
      expect(scope.SourceName).toBeNull();
      expect(scope.SourceRoute).toBeNull();
    });
  });

  describe('authAccess ->', function () {
    beforeEach(function () {
      ctrl.authRoleDetailReadAccess = jasmine.createSpy().and.returnValue(true);
      ctrl.getRoles = jasmine.createSpy().and.returnValue(resultMock);
    });

    it('should call authRoleDetailReadAccess', function () {
      ctrl.authAccess();

      expect(ctrl.authRoleDetailReadAccess).toHaveBeenCalled();
    });

    it('when authRoleDetailReadAccess returns true, should return true and should call ctrl.getRoles', function () {
      ctrl.authAccess();

      expect(ctrl.getRoles).toHaveBeenCalled();
    });

    it('when authRoleDetailReadAccess returns false, show a message and redirect back to the home page', function () {
      ctrl.authRoleDetailReadAccess = jasmine
        .createSpy()
        .and.returnValue(false);

      ctrl.authAccess();

      expect(toastrFactory.error).toHaveBeenCalled();
      expect(location.path).toHaveBeenCalledWith('/');
    });
  });
});
