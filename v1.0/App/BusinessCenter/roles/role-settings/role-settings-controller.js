'use strict';

angular.module('Soar.BusinessCenter').controller('RoleSettingsController', [
  '$scope',
  '$filter',
  '$q',
  '$location',
  'toastrFactory',
  'localize',
  'ListHelper',
  'ModalFactory',
  'UserServices',
  'patSecurityService',
  '$uibModalInstance',
  '$timeout',
  'RoleNames',
  function (
    $scope,
    $filter,
    $q,
    $location,
    toastrFactory,
    localize,
    listHelper,
    modalFactory,
    userServices,
    patSecurityService,
    $uibModalInstance,
    $timeout,
    roleNames
  ) {
    var ctrl = this;

    $scope.selectedRoles = {};
    $scope.selectedRoles.roles = [];
    $scope.selectedRoles.roleActions = [];
    $scope.selectedSection = [];
    $scope.filteredRoles = [];
    $scope.roleMatrix = {};
    $scope.subSections = [];
    $scope.isLoading = false;

    // This is the list suggested by Mike as part of the new "View Roles" modal. PBI 267925
    $scope.fuseRoles = [
      roleNames.PracticeAdmin,
      'Associate Dentist',
      'Office Manager',
      'Hygienist',
      'Assistant',
      'Financial Coordinator',
      'Patient Coordinator',
      'Business Partner',
      'Add on Security Admin Rights',
      'Add on Administrative Setup Rights',
      'Add on Clinical Setup Rights',
      'Add on Managerial Reporting Rights',
      'Add on Clinical Reporting Rights',
      'Add on Financial Reporting Rights',
      'Add on Front Office Reporting Rights',
    ];

    ctrl.checkAuthorization = function (amfa) {
      return patSecurityService.IsAuthorizedByAbbreviation(amfa);
    };

    // Check role detail access
    ctrl.hasViewPRoleDetailAccess = function () {
      return ctrl.checkAuthorization('soar-biz-sec-roldet');
    };

    ctrl.hasEditProviderInfoAccess = function () {
      return ctrl.checkAuthorization('soar-biz-bizusr-etprov');
    };

    //Notify user, he is not authorized to access current area
    ctrl.notifyNotAuthorized = function () {
      toastrFactory.error(
        localize.getLocalizedString(
          'User is not authorized to access this area'
        ),
        'Not Authorized'
      );
    };

    $scope.canViewRoleDetails = ctrl.hasViewPRoleDetailAccess();

    //// Get roles from server and load in dropdown list
    ctrl.getRoles = function () {
      $scope.isLoading = true;
      var userContext = JSON.parse(sessionStorage.getItem('userContext'));
      var applicationId = userContext.Result.Application.ApplicationId;
      userServices.Roles.get(
        { applicationId: applicationId },
        ctrl.rolesGetSuccess,
        ctrl.rolesGetFailure
      );
    };

    // Handle success response when roles fetched from server successfully
    ctrl.rolesGetSuccess = function (res) {
      $scope.roles = [];
      if (res && res.Result) {
        angular.forEach(res.Result, function (role) {
          var roleName = $filter('lowercase')(role.RoleName);
          if (roleName === 'low') {
            role.Order = 1;

            if (!$scope.user.UserId) {
              $timeout(function () {
                $scope.updatedRoleId = role.RoleId;
                $scope.isLoading = false;
              }, 200);
            }
          } else if (roleName === 'medium') {
            role.Order = 2;
          } else if (roleName === 'high') {
            role.Order = 3;
          } else {
            role.Order = 4;
          }
          if (
            role.RoleName.toLowerCase().trim() ===
            roleNames.RxUser.toLowerCase().trim()
          ) {
            $scope.rxAccessRole = role;
          }
          $scope.roles.push(role);
        });

        $scope.roles = $filter('orderBy')($scope.roles, ['Order', 'RoleName']);
      }
      $scope.isLoading = false;
    };

    // Handle error response if roles could not be fetched from server
    ctrl.rolesGetFailure = function () {
      $scope.isLoading = false;
      toastrFactory.error(
        localize.getLocalizedString('{0} failed to load.', ['Roles']),
        localize.getLocalizedString('Server Error')
      );
    };
    ctrl.getRoles();

    // Get the roles matrix
    ctrl.getRoleMatrix = function () {
      if ($scope.canViewRoleDetails) {
        $scope.isLoading = true;
        userServices.Roles.getRoleMatrix(
          {},
          ctrl.roleMatrixSuccess,
          ctrl.roleMatrixFailure
        );
      }
    };

    // Success response for role matrix and parse the json feed
    ctrl.roleMatrixSuccess = function (res) {
      if (res && res.Value) {
        var roleMatrix = JSON.parse(res.Value);

        $scope.roleMatrix = roleMatrix;
      }
      $scope.isLoading = false;
    };

    ctrl.getRoleMatrix();

    // Handle error response if role matrix could not be fetched from server
    ctrl.roleMatrixFailure = function () {
      $scope.isLoading = false;
      toastrFactory.error(
        localize.getLocalizedString('{0} failed to load.', ['Role Matrix']),
        localize.getLocalizedString('Server Error')
      );
    };

    // Get the list of subsections based on the change in the sections list -- recheck the currenly selected role
    $scope.filterSections = function (selectedSection) {
      $scope.subSections = $filter('filter')($scope.roleMatrix.Modules, {
        Name: selectedSection,
      })[0].Functions;
    };

    // For adding roles when comparing (next story)
    $scope.addSelectedRole = function (item) {
      //$scope.selectedRoles.push(item);
    };

    // Check role permissions to display the check mark
    $scope.checkSelectedRolePermissions = function (
      rolePermissions,
      selectedRoleName
    ) {
      var permission = $filter('filter')(
        rolePermissions,
        selectedRoleName,
        true
      );
      if (permission && permission.length > 0) {
        return true;
      }
    };

    // For removing roles when comparing (next story)
    $scope.removeSelectedRole = function (role) {
      $scope.selectedRoles.roles.splice(
        $scope.selectedRoles.roles.indexOf(role),
        1
      );
    };

    // This will be used if I can figure out a way to add a click event to the accordion
    // This is the way it needs to get the filtered list for compare
    $scope.filterRoles = function (subSection) {
      angular.forEach(subSection.Actions, function (action) {
        var findSelectedRoles = $filter('filter')(
          action.Roles,
          $scope.selectedRoles[0].Name,
          true
        )[0];
      });
    };

    // cancel button handler
    $scope.close = function () {
      $uibModalInstance.close();
    };
  },
]);
