var app = angular.module('Soar.BusinessCenter');

var RoleDetailsController = app.controller('RoleDetailsController', [
  '$scope',
  'UserServices',
  'toastrFactory',
  'ModalFactory',
  '$q',
  '$filter',
  'localize',
  function (
    $scope,
    userServices,
    toastrFactory,
    modalFactory,
    $q,
    $filter,
    localize
  ) {
    var ctrl = this;
    var privilegePromises = [];

    ctrl.Actions = [];
    $scope.moduleFunctionActionList = [];

    // Indicate that fetching of data from server has been started
    $scope.isLoading = true;

    //#region Modules
    // Callback handler to handle success from modules service
    ctrl.getAllModulesSuccess = function (successResponse) {
      var modulesList = successResponse.Result;

      // filter all the modules on the basis of logged in user's application id
      var userContext = JSON.parse(sessionStorage.getItem('userContext'));
      var applicationId = userContext.Result.Application.ApplicationId;
      ctrl.modules = $filter('filter')(
        modulesList,
        { ApplicationId: applicationId },
        true
      );
    };

    // Callback handler to handle failure from modules service
    ctrl.getAllModulesFailure = function () {
      toastrFactory.error(
        localize.getLocalizedString('An error has occurred while {0}', [
          'getting modules',
        ]),
        localize.getLocalizedString('Server Error')
      );
    };
    //#endregion

    //#region Functions
    ctrl.getAllFunctionsSuccess = function (successResponse) {
      ctrl.functions = successResponse.Result;
    };

    // Callback handler to handle failure from functions service
    ctrl.getAllFunctionsFailure = function () {
      toastrFactory.error(
        localize.getLocalizedString('An error has occurred while {0}', [
          'getting functions',
        ]),
        localize.getLocalizedString('Server Error')
      );
    };
    //#endregion

    //#region Privileges
    ctrl.getActionsByRoleSuccess = function (successResponse) {
      ctrl.actionsByRole = successResponse.Result;
    };

    // Callback handler to handle failure from privileges service
    ctrl.getActionsByRoleFailure = function () {
      toastrFactory.error(
        localize.getLocalizedString('An error has occurred while {0}', [
          'getting actions by role',
        ]),
        localize.getLocalizedString('Server Error')
      );
    };
    //#endregion

    //#region Actions
    ctrl.actionsGetSucess = function (successResponse) {
      ctrl.Actions = ctrl.Actions.concat(successResponse.Result);
    };

    // Callback handler to handle failure from actions service
    ctrl.actionsGetFailure = function () {
      toastrFactory.error(
        localize.getLocalizedString('An error has occurred while {0}', [
          'getting actions',
        ]),
        localize.getLocalizedString('Server Error')
      );
    };
    //#endregion

    // #region data building logic for amfa

    // Builds amfa data in Modules->Functions->Actions collection hierarchy
    ctrl.buildAmfaData = function () {
      var moduleFunctionActionCollection = [];

      // Loop for Modules
      angular.forEach(ctrl.modules, function (module) {
        // Get all functions by moduleId
        var functionsByModuleId = $filter('filter')(
          ctrl.functions,
          { ModuleId: module.ModuleId },
          true
        );

        if (functionsByModuleId && functionsByModuleId.length > 0) {
          // Sorting the list in ascending order
          functionsByModuleId = $filter('orderBy')(functionsByModuleId, 'Name');

          // Loop for functions
          angular.forEach(functionsByModuleId, function (func) {
            // Get all actions by functionId
            var actionsByFunctionId = $filter('filter')(
              ctrl.actionsByRole,
              { FunctionId: func.FunctionId },
              true
            );

            // Check if actions exist
            if (actionsByFunctionId && actionsByFunctionId.length > 0) {
              var moduleFunctionAction = {};
              moduleFunctionAction.ModuleName = module.Name;
              moduleFunctionAction.FunctionName = func.Name;
              moduleFunctionAction.Actions = [];

              // Loop for actions
              angular.forEach(actionsByFunctionId, function (action) {
                moduleFunctionAction.Actions.push({ ActionName: action.Name });
              });

              moduleFunctionActionCollection.push(moduleFunctionAction);
            } else {
              var moduleFunctionAction = {};
              moduleFunctionAction.ModuleName = module.Name;
              moduleFunctionAction.FunctionName = func.Name;
              moduleFunctionAction.Actions = [];
              moduleFunctionActionCollection.push(moduleFunctionAction);
            }
          });
        } else {
          var moduleFunctionAction = {};
          moduleFunctionAction.ModuleName = module.Name;
          moduleFunctionAction.FunctionName = null;
          moduleFunctionAction.Actions = [];
          moduleFunctionActionCollection.push(moduleFunctionAction);
        }
      });

      $scope.moduleFunctionActionList = moduleFunctionActionCollection;

      // Kendo Grid data Object
      $scope.rolesGridOptions = {};
      $scope.amfaDataSource = new kendo.data.DataSource({
        data: $scope.moduleFunctionActionList,
        group: [{ field: 'ModuleName' }],
      });

      // Detail template for actions
      $scope.roleActionTemplate =
        '<div class="roleDtl__detail">' +
        '# for (var i = 0; i < data.Actions.length; i++)' +
        '{ # <div><button class="btn btn-link" ">#:data.Actions[i].ActionName#</button></div> ' +
        '# } #' +
        '</div>';

      // Grid Settings
      $scope.rolesGridOptions = {
        dataSource: $scope.amfaDataSource,
        columns: [
          { field: 'FunctionName' },
          {
            field: 'ModuleName',
            hidden: true,
            groupHeaderTemplate: '#: value #',
          },
        ],
        detailTemplate: $scope.roleActionTemplate,
        dataBound: function () {
          var grid = this;
          grid.tbody.find('tr.k-grouping-row').each(function () {
            grid.collapseGroup(this);
          });
        },
      };
    };

    // #endregion

    //#region amfa dependent service calls

    // Populate and return the dependency services for amfa
    ctrl.amfaCallSetup = function () {
      //Create a list of dependent services
      var services = [
        {
          Call: userServices.Modules.getAllModules,
          OnSuccess: ctrl.getAllModulesSuccess,
          OnError: ctrl.getAllModulesFailure,
        },
        {
          Call: userServices.Functions.getAllFunctions,
          OnSuccess: ctrl.getAllFunctionsSuccess,
          OnError: ctrl.getAllFunctionsFailure,
        },
        {
          Call: userServices.Roles.getActionsByRole,
          Params: {
            roleId: $scope.roleId,
          },
          OnSuccess: ctrl.getActionsByRoleSuccess,
          OnError: ctrl.getActionsByRoleFailure,
        },
      ];

      services.push();
      return services;
    };

    ctrl.processAmfaData = function () {
      var promise = null;
      ctrl.Actions = [];

      // get actions for privileges
      if (ctrl.actionsByRole && ctrl.actionsByRole.length > 0) {
        // Rearrangement of Modules-->Functions-->Actions
        ctrl.buildAmfaData();
        $scope.isLoading = false;
        privilegePromises = [];
      }
    };

    //#endregion

    // #region Watch
    $scope.$watch('roleId', function (nv, ov) {
      if (nv !== ov) {
        // Show modal loading screen until data has been fetched from the server
        if ($scope.roleId && $scope.roleId > 0) {
          $scope.moduleFunctionActionList = [];
          ctrl.Actions = [];
          $scope.isLoading = true;
          modalFactory
            .LoadingModalWithoutTemplate(ctrl.amfaCallSetup)
            .then(ctrl.processAmfaData);
        }
      }
    });
    // #endregion
  },
]);
