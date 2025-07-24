var app = angular.module('Soar.BusinessCenter');

var RoleLandingController = app.controller('RoleLandingController', [
  '$scope',
  '$routeParams',
  'UserServices',
  'toastrFactory',
  '$filter',
  'patSecurityService',
  '$location',
  'localize',
  function (
    $scope,
    $routeParams,
    userServices,
    toastrFactory,
    $filter,
    patSecurityService,
    $location,
    localize
  ) {
    var ctrl = this;
    ctrl.defaultRoleIndex = 0;
    ctrl.hasRoleDetailAccess = false;

    // #region Roles
    // This method will fill the list of roles on userServices.Roles get success
    ctrl.rolesGetSuccess = function (res) {
      $scope.roleList = [];
      if (res && res.Result) {
        $scope.roleList = res.Result;
      }

      // set default value to selected
      $scope.selectedRoleId = $routeParams.RoleId;
      var filteredRole = $filter('filter')($scope.roleList, {
        RoleId: $scope.selectedRoleId,
      });

      if (filteredRole && filteredRole.length > 0) {
        $scope.selectedRoleName = filteredRole[0].RoleName;
      } else {
        $scope.selectedRoleId = $scope.roleList[ctrl.defaultRoleIndex].RoleId;
        $scope.selectedRoleName =
          $scope.roleList[ctrl.defaultRoleIndex].RoleName;
      }
    };

    //Notify user, userServices.Roles.get call has been failed
    ctrl.rolesGetFailure = function () {
      toastrFactory.error(
        localize.getLocalizedString('{0} {1}', ['Roles', 'failed to load.']),
        localize.getLocalizedString('Server Error')
      );
    };

    // This method will fetch list of roles
    ctrl.getRoles = function () {
      userServices.Roles.get({}, ctrl.rolesGetSuccess, ctrl.rolesGetFailure);
    };

    // change event handler for role options
    $scope.roleOptionClicked = function (option) {
      // set the name of currently selected view
      $scope.selectedRoleName = option.RoleName;
      $scope.selectedRoleId = option.RoleId;
    };
    // #endregion

    //#region Authorization

    // Check if logged in user has view access to this page
    ctrl.authRoleDetailReadAccess = function () {
      // check high role access
      var hasUserRoleReadAccess = patSecurityService.IsAuthorizedByAbbreviation(
        'plapi-user-usrrol-read'
      );
      var hasUserRoleCreateAccess =
        patSecurityService.IsAuthorizedByAbbreviation(
          'plapi-user-usrrol-create'
        );
      var hasUserRoleDeleteAccess =
        patSecurityService.IsAuthorizedByAbbreviation(
          'plapi-user-usrrol-delete'
        );
      // check if user has access to read the roles
      var hasRoleReadAccess =
        patSecurityService.IsAuthorizedByAbbreviation('plapi-sec-rol-read');
      // check AMFA read access
      var hasApplicationReadAccess =
        patSecurityService.IsAuthorizedByAbbreviation('plapi-sec-app-read');
      var hasModuleReadAccess =
        patSecurityService.IsAuthorizedByAbbreviation('plapi-sec-mod-read');
      var hasFunctionReadAccess =
        patSecurityService.IsAuthorizedByAbbreviation('plapi-sec-fun-read');
      var hasActionReadAccess =
        patSecurityService.IsAuthorizedByAbbreviation('plapi-sec-act-read');
      $scope.hasAccess =
        hasUserRoleReadAccess &&
        hasUserRoleCreateAccess &&
        hasUserRoleDeleteAccess &&
        hasRoleReadAccess &&
        hasApplicationReadAccess &&
        hasModuleReadAccess &&
        hasFunctionReadAccess &&
        hasActionReadAccess;

      var roleDetailReadAccess =
        hasUserRoleReadAccess &&
        hasUserRoleCreateAccess &&
        hasUserRoleDeleteAccess &&
        hasRoleReadAccess &&
        hasApplicationReadAccess &&
        hasModuleReadAccess &&
        hasFunctionReadAccess &&
        hasActionReadAccess;

      return roleDetailReadAccess;
    };

    //Notify user, he is not authorized to access current area
    ctrl.notifyNotAuthorized = function () {
      toastrFactory.error(
        patSecurityService.generateMessage(
          'User is not authorized to access this area.'
        ),
        'Not Authorized'
      );
      $location.path('/');
    };

    // Check user's access rights to access this page
    ctrl.authAccess = function () {
      if (!ctrl.authRoleDetailReadAccess()) {
        ctrl.notifyNotAuthorized();
      } else {
        ctrl.getRoles();
      }
    };

    // authorization
    ctrl.authAccess();

    // #endregion

    // #region BreadCrumb

    // This method will create the breadCrumb
    ctrl.createBreadCrumb = function () {
      var source = _.toLower($routeParams.SourceName);
      if (source == 1) {
        $scope.SourceName = 'Assign Roles';
        $scope.SourceRoute = '#/BusinessCenter/Users/Roles/';
      } else if (source == 2) {
        $scope.SourceName = 'Add a Team Member';
        $scope.SourceRoute = '#/BusinessCenter/Users/Create/';
      } else {
        $scope.SourceName = null;
        $scope.SourceRoute = null;
      }
    };

    ctrl.createBreadCrumb();

    // #endregion
  },
]);
