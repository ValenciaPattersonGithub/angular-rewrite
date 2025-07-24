describe('RoleDetailsController', function () {
  var ctrl,
    scope,
    modalFactory,
    userServices,
    toastrFactory,
    filter,
    localize,
    q;
  var deferred;

  beforeEach(module('Soar.Common'));
  beforeEach(module('common.factories'));
  beforeEach(module('Soar.BusinessCenter'));

  beforeEach(inject(function ($rootScope, $controller, $injector, $q) {
    scope = $rootScope.$new();
    q = $q;
    filter = $injector.get('$filter');

    //mock for userServices
    userServices = {
      Modules: {
        getAllModules: jasmine.createSpy().and.returnValue('getAllModules'),
      },
      Functions: {
        getAllFunctions: jasmine.createSpy().and.returnValue('getAllFunctions'),
      },
      Roles: {
        getPrivilegesbyRole: jasmine
          .createSpy()
          .and.returnValue('getPrivilegesbyRole'),
      },
      privileges: {
        getActionsbyPrivilegeId: jasmine
          .createSpy('userServices.privileges.getActionsbyPrivilegeId')
          .and.callFake(function () {
            deferred = q.defer();
            deferred.$promise = deferred.promise;
            deferred.resolve('some value in return');
            return deferred;
          }),
      },
    };

    //mock for toastrFactory
    toastrFactory = {
      success: jasmine.createSpy(),
      error: jasmine.createSpy(),
    };

    modalFactory = {
      LoadingModalWithoutTemplate: jasmine
        .createSpy('modalFactory.LoadingModalWithoutTemplate')
        .and.callFake(function () {
          deferred = $q.defer();
          deferred.resolve(1);
          return {
            result: deferred.promise,
            then: function () {},
          };
        }),
    };

    // mock localize
    localize = {
      getLocalizedString: jasmine.createSpy().and.returnValue(''),
    };

    // create controller
    ctrl = $controller('RoleDetailsController', {
      $scope: scope,
      UserServices: userServices,
      toastrFactory: toastrFactory,
      $filter: filter,
      ModalFactory: modalFactory,
      $q: q,
      localize: localize,
    });
  }));

  //controller
  it('RoleDetailsController : should check if controller exists', function () {
    expect(ctrl).not.toBeNull();
    expect(ctrl).not.toBeUndefined();
  });

  describe('getAllModulesSuccess function -->', function () {
    it('should set ctrl.modules ', function () {
      var successResponse = { Result: [{ ApplicationId: 1, Name: 'Success' }] };
      sessionStorage.setItem(
        'userContext',
        JSON.stringify({ Result: { Application: { ApplicationId: 1 } } })
      );
      ctrl.getAllModulesSuccess(successResponse);
      expect(ctrl.modules).toEqual(successResponse.Result);
    });
  });

  describe('getAllModulesFailure function -->', function () {
    it('should call toastrFactory.error', function () {
      ctrl.getAllModulesFailure();
      expect(toastrFactory.error).toHaveBeenCalled();
    });
  });

  describe('getAllFunctionsSuccess function -->', function () {
    it('should set ctrl.functions ', function () {
      var successResponse = { Result: 'Success' };
      ctrl.getAllFunctionsSuccess(successResponse);
      expect(ctrl.functions).toEqual('Success');
    });
  });

  describe('getAllFunctionsFailure function -->', function () {
    it('should call toastrFactory.error', function () {
      ctrl.getAllFunctionsFailure();
      expect(toastrFactory.error).toHaveBeenCalled();
    });
  });

  describe('getActionsByRoleSuccess function -->', function () {
    it('should set ctrl.actionsByRole ', function () {
      var successResponse = { Result: 'Success' };
      ctrl.getActionsByRoleSuccess(successResponse);
      expect(ctrl.actionsByRole).toEqual('Success');
    });
  });

  describe('getActionsByRoleFailure function -->', function () {
    it('should call toastrFactory.error', function () {
      ctrl.getActionsByRoleFailure();
      expect(toastrFactory.error).toHaveBeenCalled();
    });
  });

  describe('actionsGetSucess function -->', function () {
    it('should set ctrl.functions ', function () {
      var successResponse = { Result: 'Success' };
      ctrl.actionsGetSucess(successResponse);
      expect(ctrl.Actions).toEqual(['Success']);
    });
  });

  describe('actionsGetFailure function -->', function () {
    it('should call toastrFactory.error', function () {
      ctrl.actionsGetFailure();
      expect(toastrFactory.error).toHaveBeenCalled();
    });
  });

  describe('buildAmfaData function -->', function () {
    it('should display all the data if has matching actionId and functionId ', function () {
      ctrl.modules = [{ ModuleId: '1', Name: 'Schedule' }];
      ctrl.functions = [
        { ModuleId: '1', Name: 'Add Schedule', FunctionId: '3' },
      ];
      ctrl.actionsByRole = [
        { ModuleId: '1', Name: 'Add', FunctionId: '3' },
        { ModuleId: '2', Name: 'Delete', FunctionId: '4' },
      ];
      var moduleFunctionAction = [
        {
          ModuleName: 'Schedule',
          FunctionName: 'Add Schedule',
          Actions: [{ ActionName: 'Add' }],
        },
      ];
      ctrl.buildAmfaData();
      expect(scope.moduleFunctionActionList).toEqual(moduleFunctionAction);
    });

    it('should display only module name and function name if has matching functionId and not actionID', function () {
      ctrl.modules = [{ ModuleId: '1', Name: 'Schedule' }];
      ctrl.functions = [
        { ModuleId: '1', Name: 'Add Schedule', FunctionId: '3' },
      ];
      ctrl.Actions = [
        { ModuleId: '1', Name: 'Add', FunctionId: '5' },
        { ModuleId: '2', Name: 'Delete', FunctionId: '4' },
      ];
      var moduleFunctionAction = [
        { ModuleName: 'Schedule', FunctionName: 'Add Schedule', Actions: [] },
      ];
      ctrl.buildAmfaData();
      expect(scope.moduleFunctionActionList).toEqual(moduleFunctionAction);
    });

    it('should display only module name if does not have matching functionId and actionID ', function () {
      ctrl.modules = [{ ModuleId: '1', Name: 'Schedule' }];
      ctrl.functions = [
        { ModuleId: '2', Name: 'Add Schedule', FunctionId: '3' },
      ];
      ctrl.Actions = [
        { ModuleId: '1', Name: 'Add', FunctionId: '5' },
        { ModuleId: '2', Name: 'Delete', FunctionId: '4' },
      ];
      var moduleFunctionAction = [
        { ModuleName: 'Schedule', FunctionName: null, Actions: [] },
      ];
      ctrl.buildAmfaData();
      expect(scope.moduleFunctionActionList).toEqual(moduleFunctionAction);
    });
  });

  describe('amfaCallSetup function -->', function () {
    it('should setup the calls for amfa', function () {
      ctrl.getAllModulesSuccess = jasmine.createSpy().and.returnValue('Module');
      ctrl.getAllFunctionsSuccess = jasmine
        .createSpy()
        .and.returnValue('Function');
      ctrl.getPrivilegesbyRoleSuccess = jasmine
        .createSpy()
        .and.returnValue('Privilage');
      ctrl.getAllModulesFailure = jasmine.createSpy().and.returnValue('Error');
      ctrl.getAllFunctionsFailure = jasmine
        .createSpy()
        .and.returnValue('Error');
      ctrl.getPrivilegesbyRoleFailure = jasmine
        .createSpy()
        .and.returnValue('Error');
      scope.roleId = '1223';
      var services = [
        {
          Call: 'getAllModules',
          OnSuccess: 'Module',
          OnError: 'Error',
        },
        {
          Call: 'getAllFunctions',
          OnSuccess: 'Function',
          OnError: 'Error',
        },
        {
          Call: 'getPrivilegesbyRole',
          Params: {
            roleId: '1223',
          },
          OnSuccess: 'Privilage',
          OnError: 'Error',
        },
      ];

      var result = ctrl.amfaCallSetup();
    });
  });

  describe('processAmfaData function -->', function () {
    it('should call ctrl.buildAmfaData', function () {
      spyOn(ctrl, 'buildAmfaData');
      ctrl.actionsByRole = [{ PrivilegeId: '1' }, { PrivilegeId: '2' }];
      ctrl.processAmfaData();
      expect(ctrl.buildAmfaData).toHaveBeenCalled();
    });

    it('should set loading to false', function () {
      spyOn(ctrl, 'buildAmfaData');
      ctrl.actionsByRole = [{ PrivilegeId: '1' }, { PrivilegeId: '2' }];
      ctrl.processAmfaData();
      expect(scope.isLoading).toEqual(false);
    });
  });

  describe('roleId watcher -->', function () {
    it('should call toastrFactory.error', function () {
      scope.roleId = 1;
      scope.$apply();
      scope.roleId = 2;
      scope.$apply();
      expect(scope.moduleFunctionActionList.length).toEqual(0);
      expect(scope.isLoading).toBe(true);
      expect(modalFactory.LoadingModalWithoutTemplate).toHaveBeenCalled();
    });
  });
});
