describe('UserSearchController tests when auth ->', function () {
  var scope,
    route,
    routeParams,
    ctrl,
    httpBackend,
    rootScope,
    localize,
    location,
    roleNames,
    referenceDataService,
    userServices;

  var mockProviderTypes = [
    { Id: '1', Name: 'ProviderType1' },
    { Id: '2', Name: 'ProviderType2' },
    { Id: '3', Name: 'ProviderType3' },
    { Id: '4', Name: 'ProviderType4' },
  ];

  var mockProviderTypesWrapper = {
    Value: mockProviderTypes,
  };

  var mockDepartments = [
    { DepartmentId: '1', Name: 'Department1' },
    { DepartmentId: '2', Name: 'Department2' },
    { DepartmentId: '3', Name: 'Department3' },
    { DepartmentId: '4', Name: 'Department4' },
  ];

  var mockDepartmentsWrapper = {
    Value: mockDepartments,
  };

  //#region mocks
  var mockUsers = [
    {
      UserImage: '',
      UserId: 1,
      FirstName: 'Reed',
      LastName: 'Richards',
      PreferredName: 'Stretch',
      ProviderTypeId: '1',
      DepartmentId: '1',
      UserName: 'rrichards',
      UserCode: 'Ricre',
      IsActive: false,
    },
    {
      UserImage: '',
      UserId: 2,
      FirstName: 'Susan',
      LastName: 'Storm',
      PreferredName: '',
      ProviderTypeId: '1',
      DepartmentId: '1',
      UserName: 'sstorm',
      UserCode: 'Stosu',
      IsActive: false,
    },
    {
      UserImage: '',
      UserId: 3,
      FirstName: 'Benjamin',
      LastName: 'Grimm',
      PreferredName: 'Rock',
      ProviderTypeId: '2',
      DepartmentId: '3',
      UserName: 'bgrimm',
      UserCode: 'Gribe',
      IsActive: true,
    },
    {
      UserImage: '',
      UserId: 4,
      FirstName: 'Justin',
      LastName: 'Storm',
      PreferredName: 'Torch',
      ProviderTypeId: '3',
      DepartmentId: null,
      UserName: 'jstorm',
      UserCode: 'Stoju',
      IsActive: true,
    },
    {
      UserImage: '',
      UserId: 5,
      FirstName: 'Stan',
      LastName: 'Lee',
      PreferredName: '',
      ProviderTypeId: null,
      DepartmentId: null,
      UserName: 'jstorm',
      UserCode: 'Stoju',
      IsActive: true,
    },
  ];
  var mockServiceReturnWrapperNoUsers = {
    Value: null,
    Count: 0,
  };
  var mockServiceReturnWrapper = {};
  var mockFactoryReturnWrapper;

  //#region service mocks

  // mock the injected factory
  beforeEach(module('Soar.Common'));
  beforeEach(module('common.factories'));
  beforeEach(module('Soar.BusinessCenter'));

  // provide the UserServices and have it return the mockUsers when called
  var mockUsersFactory, mockStaticData, mockLocationServices;
  beforeEach(
    module('Soar.BusinessCenter', function ($provide) {
      mockServiceReturnWrapper = {
        Value: angular.copy(mockUsers),
        Count: 4,
      };

      mockFactoryReturnWrapper = {
        then: jasmine.createSpy(),
      };

      mockUsersFactory = {
        Users: jasmine.createSpy().and.returnValue(mockFactoryReturnWrapper),
      };

      $provide.value('UsersFactory', mockUsersFactory);

      userServices = {
        Roles: {
          getAllRolesByPractice: jasmine.createSpy(),
        },
      };
      $provide.value('UserServices', userServices);

      mockStaticData = {
        ProviderTypes: jasmine.createSpy().and.returnValue(mockProviderTypes),
        Departments: jasmine.createSpy().and.returnValue(mockDepartments),
      };

      $provide.value('StaticData', mockStaticData);

      mockLocationServices = {
        get: jasmine.createSpy(),
      };
      $provide.value('LocationServices', mockLocationServices);

      referenceDataService = {
        get: jasmine.createSpy().and.callFake(function () {
          return [];
        }),
        entityNames: {
          serviceTypes: 'serviceTypes',
          preventiveServiceTypes: 'preventiveServiceTypes',
          serviceCodes: 'serviceCodes',
          locations: 'locations',
        },
      };

      $provide.value('referenceDataService', referenceDataService);
    })
  );

  //#endregion

  describe('when user is authorized - >', function () {
    // inject the search service to controller
    beforeEach(inject(function (
      $rootScope,
      $controller,
      $injector,
      $route,
      $routeParams,
      $location,
      $q,
      $templateCache
    ) {
      scope = $rootScope.$new();
      location = $location;
      route = $route;
      routeParams = $routeParams;
      ctrl = $controller('UserSearchController', {
        $scope: scope,
        patSecurityService: _authPatSecurityService_,
      });
      scope.users = mockServiceReturnWrapper.Value;
      localize = $injector.get('localize');
      httpBackend = $injector.get('$httpBackend');
      roleNames = $injector.get('RoleNames');
      $rootScope.$apply();
    }));

    // test specs below
    it('should exist', function () {
      expect(ctrl).not.toBeNull();
    });

    // test the userService has been injected
    it('should have injected usersFactory', function () {
      expect(mockUsersFactory).not.toBeNull();
    });

    it('should set default values', function () {
      expect(scope.activeUserText).toBe('Active Users');
      expect(scope.inActiveUserText).toBe('Inactive Users');
      expect(scope.activeFilter).toBe(true);
      expect(scope.inactiveFilter).toBe(true);
      expect(scope.filter).toBe('');
      expect(scope.activeUsersCount).toBe(0);
      expect(scope.inactiveUsersCount).toBe(0);
    });

    describe('authorization function ->', function () {
      it('authViewAccess should be true for user search', function () {
        expect(scope.authViewAccess()).toEqual(true);
      });
    });

    describe('userFilter function ->', function () {
      it('should call calculateUserInfo', function () {
        spyOn(scope, 'calculateUserInfo');
        scope.userFilter(scope.users[0]);
        expect(scope.calculateUserInfo).toHaveBeenCalled();
      });

      it('should filter out users based on filter text', function () {
        spyOn(scope, 'calculateUserInfo');

        // Richards matches 1st in array
        scope.filter = 'Richards';
        var returnValue = scope.userFilter(scope.users[0]);
        expect(returnValue).toBe(true);
        returnValue = scope.userFilter(scope.users[1]);
        expect(returnValue).toBe(false);
        returnValue = scope.userFilter(scope.users[2]);
        expect(returnValue).toBe(false);
        returnValue = scope.userFilter(scope.users[3]);
        expect(returnValue).toBe(false);
        returnValue = scope.userFilter(scope.users[4]);
        expect(returnValue).toBe(false);

        //Benjamin matches third in array
        scope.filter = 'Benjamin';
        returnValue = scope.userFilter(scope.users[0]);
        expect(returnValue).toBe(false);
        returnValue = scope.userFilter(scope.users[1]);
        expect(returnValue).toBe(false);
        returnValue = scope.userFilter(scope.users[2]);
        expect(returnValue).toBe(true);
        returnValue = scope.userFilter(scope.users[3]);
        expect(returnValue).toBe(false);
        returnValue = scope.userFilter(scope.users[4]);
        expect(returnValue).toBe(false);
      });

      it('should filter out users based on inactiveFilter', function () {
        spyOn(scope, 'calculateUserInfo');
        // Richards matches 1st in array
        scope.filter = 'Richards';
        scope.inactiveFilter = true;
        var returnValue = scope.userFilter(scope.users[0]);
        expect(returnValue).toBe(true);

        // uncheck active
        scope.inactiveFilter = false;
        returnValue = scope.userFilter(scope.users[0]);
        expect(returnValue).toBe(false);
      });

      it('should filter out users based on activeFilter', function () {
        spyOn(scope, 'calculateUserInfo');
        // Richards matches 1st in array and is active
        scope.filter = 'Benjamin';
        scope.activeFilter = true;
        var returnValue = scope.userFilter(scope.users[2]);
        expect(returnValue).toBe(true);

        // uncheck active
        scope.activeFilter = false;
        returnValue = scope.userFilter(scope.users[0]);
        expect(returnValue).toBe(false);
      });
    });

    describe('getPracticeUsers function ->', function () {
      it('should call factory', function () {
        scope.getPracticeUsers();
        expect(mockUsersFactory.Users).toHaveBeenCalled();
      });
    });

    describe('userServicesGetSuccess function ->', function () {
      it('should populate users', function () {
        spyOn(scope, 'getDepartments').and.callFake(function () {});
        spyOn(scope, 'getProviderTypes').and.callFake(function () {});
        scope.loading = true;
        scope.userServicesGetSuccess(mockServiceReturnWrapper);
        expect(scope.loading).toBe(false);
        expect(scope.users).toEqual(mockServiceReturnWrapper.Value);
      });
    });

    describe('userServicesGetFailure function ->', function () {
      it('should set users to empty array and display toastr error', function () {
        scope.loading = true;
        scope.userServicesGetFailure();
        expect(scope.loading).toBe(false);
        expect(scope.users).toEqual([]);
      });

      it('should call toastr error', function () {
        scope.userServicesGetFailure();
        expect(_toastr_.error).toHaveBeenCalled();
      });
    });

    describe('setDepartment function ->', function () {
      it('should set user Department if user DepartmentId is not null', function () {
        scope.departmentTypes = mockDepartments;
        scope.setDepartment();
        expect(scope.users[0].DepartmentId).toBe('1');
        expect(scope.users[0].DepartmentName).toBe('Department1');
      });

      it('should not set user Department if user DepartmentId is null', function () {
        scope.departmentTypes = mockDepartments;
        scope.setDepartment();

        expect(scope.users[4].DepartmentId).toEqual(null);
        expect(scope.users[4].DepartmentName).toBe(undefined);
      });
    });

    describe('setProviderType function ->', function () {
      it('should set user ProviderTypeName if user ProviderTypeId is not null', function () {
        scope.providerTypes = mockProviderTypes;
        scope.setProviderType();
        expect(scope.users[0].ProviderTypeId).toBe('1');
        expect(scope.users[0].ProviderTypeName).toBe('ProviderType1');
      });

      it('should not set user ProviderTypeName if user ProviderTypeId is null', function () {
        scope.providerTypes = mockProviderTypes;
        scope.setProviderType();
        expect(scope.users[4].ProviderTypeId).toEqual(null);
        expect(scope.users[4].ProviderTypeName).toBe(undefined);
      });
    });

    describe('calculateUserInfo function ->', function () {
      it('should set active and inactive count based on users array', function () {
        scope.calculateUserInfo();
        expect(scope.activeUsersCount).toBe(3);
        expect(scope.inactiveUsersCount).toBe(2);
        // remove inactive user
        scope.users.splice(0, 1);
        scope.calculateUserInfo();
        expect(scope.activeUsersCount).toBe(3);
        expect(scope.inactiveUsersCount).toBe(1);
        // remove active user
        scope.users.splice(1, 1);
        scope.calculateUserInfo();
        expect(scope.activeUsersCount).toBe(2);
        expect(scope.inactiveUsersCount).toBe(1);
      });
    });

    describe('getPracticeUserRolesSuccess function ->', function () {
      var result = { Result: {} };
      beforeEach(function () {
        scope.practiceUsers = [];
      });

      it('should add user to practiceUsers if isPracticeAdmin returns true', function () {
        result.Result = [
          {
            User: { UserId: 12 },
            Roles: [
              { RoleId: 8, RoleName: 'Practice Administrator' },
              { RoleId: 13, RoleName: 'Rx User' },
            ],
          },
        ];
        spyOn(ctrl, 'isPracticeAdmin').and.returnValue(true);
        ctrl.getPracticeUserRolesSuccess(result);
        expect(scope.practiceUsers).toEqual([12]);
      });

      it('should not add user to practiceUsers if isPracticeAdmin returns false', function () {
        result.Result = [
          {
            User: { UserId: 12 },
            Roles: [{ RoleId: 13, RoleName: 'Rx User' }],
          },
        ];
        spyOn(ctrl, 'isPracticeAdmin').and.returnValue(false);
        ctrl.getPracticeUserRolesSuccess(result);
        expect(scope.practiceUsers).toEqual([]);
      });
    });

    describe('isPracticeAdmin function ->', function () {
      var result = {};
      beforeEach(function () {
        scope.practiceUsers = [];
      });

      it('should return true if user practice roles contains practice admin', function () {
        result = {
          Roles: [
            { RoleId: 8, RoleName: roleNames.PracticeAdmin },
            { RoleId: 13, RoleName: 'Rx User' },
          ],
        };
        expect(ctrl.isPracticeAdmin(result.Roles)).toBe(true);
      });

      it('should return false if user practice roles does not contain practice admin', function () {
        result = { Roles: [{ RoleId: 13, RoleName: 'Rx User' }] };
        expect(ctrl.isPracticeAdmin(result.Roles)).toBe(false);
      });
    });

    describe('hasLocation function ->', function () {
      var locations = [];
      beforeEach(function () {
        scope.practiceUsers = [3, 4];
        locations = [{ LocationId: 1, AssignedUserIds: [1, 2] }];
      });

      it('should return true if practiceUsers list contains userId', function () {
        expect(ctrl.hasLocation(locations, 3)).toBe(true);
      });

      it('should return true if location.AssignUserIds contains userId', function () {
        expect(ctrl.hasLocation(locations, 1)).toBe(true);
      });

      it('should return false if location.AssignUserIds and practiceUsers does not contain userId', function () {
        expect(ctrl.hasLocation(locations, 5)).toBe(false);
      });
    });
  });
});
