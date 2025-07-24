'use strict';

angular.module('Soar.BusinessCenter').controller('UserSearchController', [
  '$scope',
  '$routeParams',
  '$filter',
  '$location',
  'localize',
  '$timeout',
  'toastrFactory',
  'patSecurityService',
  'practiceService',
  'UserServices',
  'StaticData',
  'ListHelper',
  'UsersFactory',
  'RoleNames',
  'referenceDataService',
  '$rootScope',
  function (
    $scope,
    $routeParams,
    $filter,
    $location,
    localize,
    $timeout,
    toastrFactory,
    patSecurityService,
    practiceService,
    userServices,
    staticData,
    listHelper,
    usersFactory,
    roleNames,
    referenceDataService,
    $rootScope
  ) {
    var ctrl = this;

    $scope.$location = $location;
    $scope.$watch('$location.path', function (nv, ov) {
      if (nv != ov) {
        $scope.fadeIn = false;
        $scope.fadeOut = true;
      }
    });
    $scope.fadeIn = true;

    //#region Authorization
    //TODO Set Authorization Abbreviation to correct settings
    // For now use patient, other matrixes can be substituted later
    //soar-per-perdem-search
    $scope.authViewAccess = function () {
      return patSecurityService.IsAuthorizedByAbbreviation(
        'soar-biz-bizusr-view'
      );
    };

    $scope.authAccess = function () {
      if (!$scope.authViewAccess()) {
        toastrFactory.error(
          localize.getLocalizedString(
            'User is not authorized to access this area.'
          ),
          localize.getLocalizedString('Not Authorized')
        );
        event.preventDefault();
        $location.path('/');
      }
    };
    $scope.authAccess();

    //#endregion

    $scope.users = [];
    $scope.locations = [];
    $scope.practiceUsers = [];

    $scope.activeUserText = 'Active Users';
    $scope.inActiveUserText = 'Inactive Users';
    $scope.activeUsersCount = 0;
    $scope.inactiveUsersCount = 0;
    $scope.activeFilter = true;
    $scope.inactiveFilter = true;
    $scope.filter = '';
    $scope.locationUsersRetrieved = false;
    $scope.locationUsersError = false;

    //contains filter for locations, returns true if user has any of the locations in the filter
    ctrl.hasLocation = function (locations, userId) {
      // if user is practice admin, they should always appear in filtered results
      if ($filter('filter')($scope.practiceUsers, userId, true).length > 0) {
        return true;
      }
      var wasFound = false;
      angular.forEach(locations, function (location) {
        if (!wasFound && location.AssignedUserIds) {
          var locationHasUser =
            $filter('filter')(location.AssignedUserIds, userId, true).length >
            0;
          if (locationHasUser === true) {
            wasFound = true;
          }
        }
      });
      return wasFound;
    };

    $scope.userFilter = function (item) {
      var locationFilter = $filter('filter')($scope.locations, {
        $active: true,
      });
      //removes any dashes in scope property;
      var filter = $scope.filter.replace(/-/g, '');

      filter = filter.toLowerCase();

      if (
        ((item.FirstName &&
          item.FirstName.toLowerCase().indexOf(filter) != -1) ||
          (item.LastName &&
            item.LastName.toLowerCase().indexOf(filter) != -1) ||
          (item.PreferredName &&
            item.PreferredName.toLowerCase().indexOf(filter) != -1) ||
          (item.DepartmentName &&
            item.DepartmentName.toLowerCase().indexOf(filter) != -1) ||
          (item.UserName &&
            item.UserName.toLowerCase().indexOf(filter) != -1) ||
          (item.UserCode &&
            item.UserCode.toLowerCase().indexOf(filter) != -1) ||
          (item.ProviderTypeName &&
            item.ProviderTypeName.toLowerCase().indexOf(filter) != -1) ||
          filter.length == 0) &&
        ((item.IsActive === true && item.IsActive === $scope.activeFilter) ||
          (item.IsActive === false && item.IsActive != $scope.inactiveFilter))
      ) {
        $scope.calculateUserInfo();

        if (locationFilter && locationFilter.length > 0) {
          return ctrl.hasLocation(locationFilter, item.UserId);
        } else {
          return true;
        }
      } else {
        $scope.calculateUserInfo();
        return false;
      }
    };

    // Method to get the users
    $scope.getPracticeUsers = function () {
      $scope.loading = true;
      usersFactory
        .Users()
        .then($scope.userServicesGetSuccess, $scope.userServicesGetFailure);
    };

    // emitted by RDS when force entity execution request success
    $rootScope.$on('soar:rds:force-entity-execution', function () {
      $scope.getPracticeUsers();
    });

    $scope.userServicesGetSuccess = function (res) {
      $scope.loading = false;
      $scope.users = res.Value;
      $scope.calculateUserInfo();
      $scope.getDepartments();
      $scope.getProviderTypes();
    };

    $scope.userServicesGetFailure = function () {
      $scope.loading = false;
      $scope.users = [];
      toastrFactory.error(
        localize.getLocalizedString(
          'Failed to retrieve the list of users. Refresh the page to try again.'
        ),
        localize.getLocalizedString('Error')
      );
    };
    $scope.getPracticeUsers();

    $scope.providerTypes = [];
    $scope.getProviderTypes = function () {
      staticData.ProviderTypes().then(function (res) {
        $scope.providerTypes = res.Value;
        $scope.setProviderType();
      });
    };

    $scope.departmentTypes = [];
    $scope.getDepartments = function () {
      staticData.Departments().then(function (res) {
        $scope.departmentTypes = res.Value;
        $scope.setDepartment();
      });
    };

    $scope.calculateUserInfo = function () {
      if ($scope.users.length > 0) {
        $scope.inactiveUsersCount = $filter('filter')($scope.users, {
          IsActive: false,
        }).length;
        $scope.activeUsersCount = $filter('filter')($scope.users, {
          IsActive: true,
        }).length;
      }
    };

    // set the user department Name based on id
    $scope.setDepartment = function () {
      angular.forEach($scope.users, function (user) {
        if (user.DepartmentId) {
          var department = $filter('filter')($scope.departmentTypes, {
            DepartmentId: user.DepartmentId,
          });
          user.DepartmentName = department[0].Name;
        }
      });
    };

    // set the user providerType Name based on id
    $scope.setProviderType = function () {
      angular.forEach($scope.users, function (user) {
        if (user.ProviderTypeId) {
          var providerType = $filter('filter')($scope.providerTypes, {
            Id: user.ProviderTypeId,
          });
          user.ProviderTypeName = providerType[0].Name;
        }
      });
    };

    ctrl.getLocations = function () {
      $scope.locations = referenceDataService.get(
        referenceDataService.entityNames.locations
      );
      ctrl.getLocationRoles($scope.locations);

      if ($routeParams.locationId) {
        var locations = $filter('filter')(
          $scope.locations,
          { LocationId: parseInt($routeParams.locationId) },
          true
        );
        /** filter returns an array, but we only want one.. so hard coding 0 index to set to active */
        if (locations.length > 0) {
          locations[0].$active = true;
        }
      }
    };

    ctrl.getLocationRoles = function (locations) {
      var currentPractice = practiceService.getCurrentPractice();
      if (
        currentPractice &&
        patSecurityService.IsAuthorizedByAbbreviationAtPractice(
          'soar-biz-bizusr-view'
        )
      ) {
        userServices.Roles.getAllRolesByPractice(
          { practiceId: currentPractice.id },
          ctrl.getPracticeUserRolesSuccess,
          ctrl.getRolesFailure
        );
      }
      angular.forEach(locations, function (location) {
        if (
          patSecurityService.IsAuthorizedByAbbreviationAtLocation(
            'soar-biz-bizusr-view',
            location.LocationId
          )
        ) {
          userServices.Roles.getAllRolesByLocation(
            { locationId: location.LocationId },
            function (res) {
              ctrl.getLocationUserRolesSuccess(location, res);
            },
            ctrl.getRolesFailure
          );
        } else {
          location.$disable = true;
        }
      });
    };

    // for the purpose of filtering users by location, a practice user has to have
    // a practice role of 'practice administrator'
    ctrl.getPracticeUserRolesSuccess = function (res) {
      $scope.practiceUsers = [];
      if (res && res.Result && res.Result.length > 0) {
        angular.forEach(res.Result, function (result) {
          if (ctrl.isPracticeAdmin(result.Roles)) {
            $scope.practiceUsers.push(result.User.UserId);
          }
        });
      }
    };

    ctrl.getLocationUserRolesSuccess = function (location, res) {
      if (res && res.Result) {
        $scope.locationUsersRetrieved = true;
        location.AssignedUserIds = res.Result.map(function (item) {
          return item.User.UserId;
        });
      }
    };

    ctrl.getRolesFailure = function () {
      toastrFactory.error({
        Text: 'Failed to retrieve list of {0}. Please try again.',
        Params: ['users by location'],
      });
      $scope.locationUsersError = true;
    };

    // for the purpose of filtering users by location, a practice user has to have
    // a practice role of 'practice administrator'
    ctrl.isPracticeAdmin = function (practiceRoles) {
      var isPracticeAdmin = false;
      angular.forEach(practiceRoles, function (role) {
        if (
          role.RoleName.toLowerCase().trim() ===
          roleNames.PracticeAdmin.toLowerCase().trim()
        ) {
          isPracticeAdmin = true;
        }
      });
      return isPracticeAdmin;
    };

    ctrl.getLocations();
  },
]);
