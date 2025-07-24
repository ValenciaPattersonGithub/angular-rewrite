'use strict';

var app = angular.module('Soar.BusinessCenter');
app.controller('UserRolesByLocationController', [
  '$scope',
  '$rootScope',
  'toastrFactory',
  'localize',
  '$filter',
  'tabLauncher',
  'patSecurityService',
  'practiceService',
  '$location',
  'UsersFactory',
  'RolesFactory',
  'ListHelper',
  'referenceDataService',
  'SaveStates',
  '$q',
  'UserServices',
  'ModalFactory',
  'AuthZService',
  '$http',
  'RoleNames',
  function (
    $scope,
    $rootScope,
    toastrFactory,
    localize,
    $filter,
    tabLauncher,
    patSecurityService,
    practiceService,
    $location,
    usersFactory,
    rolesFactory,
    listHelper,
    referenceDataService,
    saveStates,
    $q,
    userServices,
    modalFactory,
    authZ,
    $http,
    roleNames
  ) {
    var ctrl = this;
    $scope.selectedLocations = [];
    $scope.currentUserLocations = [];
    $scope.currentLocation = { name: '' };
    $scope.locationName = $scope.currentLocation.name;

    $scope.loadingUsers = false;
    $scope.savingRoles = false;
    $scope.dataHasChanged = false;
    $scope.formIsValid = true;
    $scope.roles = [];

    //#region authentication

    // user roles access
    $scope.authAccess = usersFactory.access();
    ctrl.titleMessage = authZ.generateTitleMessage();

    if (!$scope.authAccess.View) {
      toastrFactory.error(
        patSecurityService.generateMessage('plapi-user-usrrol-read'),
        'Not Authorized'
      );
      event.preventDefault();
      $location.path('/');
    }

    //#endregion

    //#region location

    // get locations for this user
    ctrl.getCurrentUserLocations = function () {
      $scope.loadingUsers = true;
      var currentUser = $rootScope.patAuthContext.userInfo;

      // get all practice locations
      $scope.locations = referenceDataService.get(
        referenceDataService.entityNames.locations
      );
      $scope.currentUserLocations = $scope.locations;
      ctrl.getPracticeUsers();
    };

    $scope.$watch(
      'selectedLocations',
      function (nv, ov) {
        if (nv && nv != null && nv.length > 0) {
          $scope.selectedLocation = nv[0];
          $scope.locationName = $scope.selectedLocation.NameLine1;
        }
      },
      true
    );

    $scope.$watch(
      'currentLocation',
      function (nv, ov) {
        if (nv) {
          $scope.locationName = nv.name;
        }
      },
      true
    );

    //#endregion

    //#region teamMembers

    // get a list of all users for practice
    ctrl.getPracticeUsers = function () {
      $scope.loading = true;
      usersFactory.Users().then(function (res) {
        $scope.loading = false;
        $scope.users = res.Value;
        angular.forEach($scope.users, function (user) {
          // initialize lists
          user.$$UserLocations = [];
          user.$$UserPracticeRoles = [];
          user.$$AvailableRoles = [];
        });
        ctrl.getUsersRoles($scope.users);
      });
    };

    //#endregion

    //#region all roles

    // roles only available for location roles
    ctrl.setLocationRoles = function () {
      $scope.locationRoles = [];
      angular.forEach($scope.roles, function (role) {
        if (
          role.RoleName.toLowerCase() !== roleNames.RxUser.toLowerCase() &&
          role.RoleName.toLowerCase() !== roleNames.PracticeAdmin.toLowerCase()
        ) {
          $scope.locationRoles.push(role);
        }
      });
    };

    ctrl.getRoles = function () {
      rolesFactory.Roles().then(function (res) {
        $scope.roles = res.Result;
        ctrl.setLocationRoles();
        ctrl.setAdditionalFilters();
      });
    };

    //#endregion

    //#region practice roles

    ctrl.setUserPracticeRoles = function (user, practiceRoles) {
      // filter out Rx roles - not to be displayed
      var rolesToDispay = $filter('filter')(practiceRoles, function (role) {
        return $scope.rxRoleFilter(role);
      });
      if (rolesToDispay.length > 0) {
        // practice roles exist for all current locations so add these to the user locations
        angular.forEach($scope.currentUserLocations, function (location) {
          var userLocation = { LocationId: location.LocationId };
          user.$$UserLocations.push(userLocation);
        });
      }
      // add the practice roles to the user
      angular.forEach(rolesToDispay, function (userRole) {
        user.$$UserPracticeRoles.push(userRole);
      });
    };

    //#endregion

    //#region location roles

    // add location role to user
    ctrl.setUserLocationRoles = function (user, locationId, locationRoles) {
      if (locationRoles.length > 0) {
        var userLocation = { LocationId: locationId };
        userLocation.$$UserLocationRoles = locationRoles;
        user.$$UserLocations.push(userLocation);
        ctrl.setAvailableRoles(user);
      }
    };

    ctrl.setUserRoles = function (user, userRoles) {
      angular.forEach(
        userRoles.PracticeRoles,
        function (practiceRoles, practiceId) {
          ctrl.setUserPracticeRoles(user, practiceRoles);
        }
      );
      angular.forEach(userRoles.LocationRoles, function (locationRoles, key) {
        var locationId = parseInt(key);
        ctrl.setUserLocationRoles(user, locationId, locationRoles);
      });
    };

    // get all roles for each user
    ctrl.getUsersRoles = function (users) {
      angular.forEach(users, function (user) {
        rolesFactory.UserRoles(user.UserId).then(function (res) {
          var userRoles = res.Result;
          ctrl.setUserRoles(user, userRoles);
          $scope.loadingUsers = false;
        });
      });
    };

    //#endregion

    //#region filters

    // always filter rx role from dropdown
    $scope.rxRoleFilter = function (item) {
      if (item) {
        return item.RoleName.toLowerCase() === roleNames.RxUser.toLowerCase()
          ? false
          : true;
      }
      return true;
    };

    // filters deleted roles from userLocationRoles
    $scope.deletedRolesFilter = function (userLocationRoles) {
      if (userLocationRoles && userLocationRoles.$$ObjectState) {
        return userLocationRoles.$$ObjectState !== saveStates.Delete;
      }
      return true;
    };

    // filter locations by selected location
    $scope.locationsFilter = function (item) {
      if (item && $scope.selectedLocations[0]) {
        return item.LocationId === $scope.selectedLocations[0].LocationId;
      }
      return true;
    };

    // filter team members by roles in a selected location
    $scope.teamMemberLocationFilter = function (teamMember) {
      var match = false;
      // if team member is practice admin can see all locations
      if (
        teamMember &&
        teamMember.$$UserPracticeRoles &&
        teamMember.$$UserPracticeRoles.length > 0
      ) {
        match = true;
      } else {
        if (
          teamMember &&
          teamMember.$$UserLocations &&
          teamMember.$$UserLocations.length > 0
        ) {
          angular.forEach(teamMember.$$UserLocations, function (location) {
            if (
              location.LocationId === $scope.selectedLocations[0].LocationId
            ) {
              match = true;
            }
          });
        }
      }
      return match;
    };

    $scope.filterRoles = [];
    $scope.teamMemberRoleByLocationFilter = function (teamMember) {
      var match = false;

      // if member is practice admin can see all locations, filter by only roles
      if (
        teamMember &&
        teamMember.$$UserPracticeRoles &&
        teamMember.$$UserPracticeRoles.length > 0
      ) {
        if ($scope.filterRoles.length === 0) {
          match = true;
        } else {
          angular.forEach($scope.filterRoles, function (role) {
            var roleIndex = listHelper.findIndexByFieldValue(
              teamMember.$$UserPracticeRoles,
              'RoleId',
              role.Id
            );
            if (roleIndex > -1) {
              match = true;
            }
          });
        }
        // otherwise filter on locations and roles
      } else {
        if (
          teamMember &&
          teamMember.$$UserLocations &&
          teamMember.$$UserLocations.length > 0 &&
          $scope.selectedLocations[0]
        ) {
          // only filter on this location
          var locationIndex = listHelper.findIndexByFieldValue(
            teamMember.$$UserLocations,
            'LocationId',
            $scope.selectedLocations[0].LocationId
          );
          if (locationIndex > -1) {
            if ($scope.filterRoles.length === 0) {
              match = true;
            } else {
              angular.forEach($scope.filterRoles, function (role) {
                var roleIndex = listHelper.findIndexByFieldValue(
                  teamMember.$$UserLocations[locationIndex].$$UserLocationRoles,
                  'RoleId',
                  role.Id
                );
                if (roleIndex > -1) {
                  match = true;
                }
              });
            }
          }
        }
      }
      return match;
    };

    $scope.showHideFilterLabel = localize.getLocalizedString('Show Filters');
    $scope.showFilter = false;

    $scope.showHideFilter = function () {
      $scope.showFilter = !$scope.showFilter;
      if ($scope.showFilter) {
        $scope.showHideFilterLabel =
          localize.getLocalizedString('Hide Filters');
      } else {
        $scope.showHideFilterLabel =
          localize.getLocalizedString('Show Filters');
      }
    };

    // this function must be called when a role is added or removed from user location
    ctrl.setAvailableRolesByUserLocation = function (userLocation) {
      userLocation.$$AvailableRoles = [];
      angular.forEach($scope.locationRoles, function (role) {
        var hasRole = listHelper.findItemByFieldValue(
          userLocation.$$UserLocationRoles,
          'RoleId',
          role.RoleId
        );
        if (!hasRole) {
          userLocation.$$AvailableRoles.push(role);
        }
      });
      userLocation.$$AvailableRoles = $filter('orderBy')(
        userLocation.$$AvailableRoles,
        'RoleName'
      );
    };

    // set the available roles for each teammember at initialization
    ctrl.setAvailableRoles = function (user) {
      // add dynamic column for available roles per location
      angular.forEach(user.$$UserLocations, function (userLocation) {
        ctrl.setAvailableRolesByUserLocation(userLocation);
      });
    };

    // additional filtering
    ctrl.setAdditionalFilters = function () {
      $scope.additionalFilters = [];

      // // roles filter
      var header = localize.getLocalizedString('Filter by {0}', ['Roles']);
      var roleOptions = [];
      // filter out rx role

      angular.forEach($scope.roles, function (role) {
        //var checked = role.RoleId === -1 ? true : false;
        // filter out rx role
        if (role.RoleName.toLowerCase() !== roleNames.RxUser.toLowerCase()) {
          roleOptions.push({
            Name: role.RoleName,
            Id: role.RoleId,
            Field: role.RoleId,
            Checked: false,
            Type: 'checkbox',
          });
        }
      });
      $scope.additionalFilters.push({
        header: header,
        id: 'TeamMemberRolesFilter',
        options: roleOptions,
      });
      $scope.collapseSlideout = false;
    };

    $scope.resetFilters = function () {
      $scope.filterRoles = [];
    };

    $scope.applyFilters = function (filters) {
      if (filters.length > 0) {
        $scope.filterRoles = angular.copy(filters);
      }
    };

    //#endregion

    // #region - Sorting

    // scope variable that holds ordering details
    $scope.orderBy = {
      field: 'LastName',
      asc: true,
    };

    // function to apply orderBy functionality
    $scope.changeSortingForGrid = function (field) {
      var asc = $scope.orderBy.field === field ? !$scope.orderBy.asc : true;
      $scope.orderBy = {
        field: field,
        asc: asc,
      };
    };

    // #endregion

    //#region add remove roles

    // add $$UserLocationRoles from select list to userLocation.$$UserLocationRoles
    $scope.addLocationRole = function (role, userLocation) {
      if ($scope.authAccess.Create) {
        // if userLocation.$$UserLocationRoles has an objectState of delete, just switch back to null
        var roleIndex = listHelper.findIndexByFieldValue(
          userLocation.$$UserLocationRoles,
          'RoleId',
          role.RoleId
        );
        if (roleIndex > -1) {
          if (
            userLocation.$$UserLocationRoles[roleIndex].$$ObjectState &&
            userLocation.$$UserLocationRoles[roleIndex].$$ObjectState ===
              saveStates.Delete
          ) {
            userLocation.$$UserLocationRoles[roleIndex].$$ObjectState =
              saveStates.None;
          }
        } else {
          // otherwise this is a new role for user, set object state to add
          var newLocationRole = {
            RoleId: role.RoleId,
            RoleName: role.RoleName,
            RoleDesc: role.RoleDesc,
            $$ObjectState: saveStates.Add,
          };
          userLocation.$$UserLocationRoles.push(newLocationRole);
        }
        $scope.dataHasChanged = true;
        ctrl.validateUserLocationRoles(userLocation);
        ctrl.setAvailableRolesByUserLocation(userLocation);
      }
    };

    // each team member with location roles must have at least one role per location to save
    ctrl.validateUserLocationRoles = function (userLocation) {
      if (userLocation.$$UserLocationRoles) {
        var numberOfLocationRoles = $filter('filter')(
          userLocation.$$UserLocationRoles,
          { $$ObjectState: '!' + saveStates.Delete }
        );
        userLocation.$$NoRoleError = numberOfLocationRoles.length === 0;
        return !(numberOfLocationRoles.length === 0);
      }
      return true;
    };

    // remove role from $$UserLocationRoles
    $scope.removeLocationRole = function (userLocationRole, userLocation) {
      if ($scope.authAccess.Delete) {
        // if role hasn't been saved yet, just delete object state
        if (
          userLocationRole.$$ObjectState &&
          userLocationRole.$$ObjectState === saveStates.Add
        ) {
          delete userLocationRole.$$ObjectState;
          var index = listHelper.findIndexByFieldValue(
            userLocation.$$UserLocationRoles,
            'RoleId',
            userLocationRole.RoleId
          );
          if (index !== -1) {
            userLocation.$$UserLocationRoles.splice(index, 1);
          }
        } else {
          userLocationRole.$$ObjectState = saveStates.Delete;
        }
        $scope.dataHasChanged = true;
        ctrl.validateUserLocationRoles(userLocation);
        //ctrl.setAvailableRolesByUserLocation(userLocation);
        // adding removed one to available list and reordering
        userLocation.$$SelectedRole = null;
        userLocation.$$AvailableRoles.push(userLocationRole);
        userLocation.$$AvailableRoles = $filter('orderBy')(
          userLocation.$$AvailableRoles,
          'RoleName'
        );
      }
    };

    //#endregion

    //#region crud operations

    // helper function to set state on list of userRoles
    ctrl.setObjectState = function (userRoles, state) {
      angular.forEach(userRoles, function (userRole) {
        userRole.$$NewObjectState = state;
      });
    };

    // helper function to to create object required by enterprise api
    ctrl.createUserRolesDto = function (userRoles, locationId) {
      // NOTE currently we can only add LocationRoles from this page
      var userRolesDto = {
        EnterpriseRoles: {},
        PracticeRoles: {},
        LocationRoles: {},
      };
      var roles = [];
      for (var i = 0; i < userRoles.length; i++) {
        roles.push(userRoles[i].RoleId);
      }
      userRolesDto.LocationRoles[locationId] = roles;
      return userRolesDto;
    };

    // crud method to remove role from user
    ctrl.removeLocationAssignment = function (userId, userRoles, locationId) {
      var defer = $q.defer();
      var promise = defer.promise;
      if ($scope.authAccess.Delete) {
        var userRolesDto = ctrl.createUserRolesDto(userRoles, locationId);
        // due to that fact that the 1.5 angular resource doesn't allow a body to be part of the request
        // handle the delete using $httpProvider
        $http({
          url: '_webapiurl_/api/users/roles/' + userId,
          method: 'DELETE',
          data: userRolesDto,
          headers: {
            'Content-Type': 'application/json;charset=utf-8',
          },
        }).then(
          function (res) {
            defer.resolve({ success: true });
            ctrl.setObjectState(userRoles, saveStates.Successful);
          },
          function (res) {
            defer.resolve({ success: false });
            ctrl.setObjectState(userRoles, saveStates.Failed);
          }
        );
      }
      return promise;
    };

    // crud method to add role to user
    ctrl.addLocationAssignment = function (userId, userRoles, locationId) {
      var defer = $q.defer();
      var promise = defer.promise;
      if ($scope.authAccess.Create) {
        var userRolesDto = ctrl.createUserRolesDto(userRoles, locationId);
        userServices.UserRoles.save(
          { userId: userId },
          userRolesDto
        ).$promise.then(
          function (res) {
            defer.resolve({ success: true });
            ctrl.setObjectState(userRoles, saveStates.Successful);
          },
          function () {
            defer.resolve({ success: false });
            ctrl.setObjectState(userRoles, saveStates.Failed);
          }
        );
      }
      return promise;
    };

    // queue processes for adding and removing role assignments
    ctrl.processRoleAssignmentsByTeamMember = function (teamMember) {
      if (
        teamMember &&
        teamMember.$$UserLocations &&
        teamMember.$$UserLocations.length > 0
      ) {
        var processes = [];
        // only filter on this location
        var locationIndex = listHelper.findIndexByFieldValue(
          teamMember.$$UserLocations,
          'LocationId',
          $scope.selectedLocations[0].LocationId
        );
        if (locationIndex > -1) {
          var userLocation = teamMember.$$UserLocations[locationIndex];
          // get all of the 'saveStates.Add' for this team member and location
          var rolesToAdd = $filter('filter')(userLocation.$$UserLocationRoles, {
            $$ObjectState: saveStates.Add,
          });
          if (rolesToAdd && rolesToAdd.length) {
            processes.push(
              ctrl.addLocationAssignment(
                teamMember.UserId,
                rolesToAdd,
                userLocation.LocationId
              )
            );
          }

          // get all of the 'saveStates.Delete' for this team member
          var rolesToRemove = $filter('filter')(
            userLocation.$$UserLocationRoles,
            { $$ObjectState: saveStates.Delete }
          );
          if (rolesToRemove && rolesToRemove.length) {
            processes.push(
              ctrl.removeLocationAssignment(
                teamMember.UserId,
                rolesToRemove,
                userLocation.LocationId
              )
            );
          }
        }
        return processes;
      }
    };

    // update failed role assignments by userLocation
    ctrl.updateRoleAssignments = function (userLocation, userLocationRole) {
      if (userLocationRole.$$NewObjectState === saveStates.Failed) {
        // handling for failed deletes

        // handling for failed adds
        if (userLocationRole.$$ObjectState === saveStates.Add) {
          // remove role from userLocation.$$UserLocationRoles.
          var index = listHelper.findIndexByFieldValue(
            userLocation.$$UserLocationRoles,
            'RoleId',
            userLocationRole.RoleId
          );
          if (index > -1) {
            userLocation.$$UserLocationRoles.splice(index, 1);
          }
        }
        // reset object states
        userLocationRole.$$NewObjectState = saveStates.None;
        userLocationRole.$$ObjectState = saveStates.None;
      } else if (userLocationRole.$$NewObjectState === saveStates.Successful) {
        // handling for successful deletes
        if (userLocationRole.$$ObjectState === saveStates.Delete) {
          // remove role from userLocation.$$UserLocationRoles.
          var index = listHelper.findIndexByFieldValue(
            userLocation.$$UserLocationRoles,
            'RoleId',
            userLocationRole.RoleId
          );
          if (index > -1) {
            userLocation.$$UserLocationRoles.splice(index, 1);
          }
        }
        // reset object states
        userLocationRole.$$NewObjectState = saveStates.None;
        userLocationRole.$$ObjectState = saveStates.None;
      }
    };

    // after save operation update the lists
    ctrl.refreshList = function () {
      angular.forEach($scope.users, function (teamMember) {
        if (
          teamMember &&
          teamMember.$$UserLocations &&
          teamMember.$$UserLocations.length > 0
        ) {
          // only filter on this location
          var locationIndex = listHelper.findIndexByFieldValue(
            teamMember.$$UserLocations,
            'LocationId',
            $scope.selectedLocations[0].LocationId
          );
          if (locationIndex > -1) {
            var userLocation = teamMember.$$UserLocations[locationIndex];
            if (userLocation.$$UserLocationRoles) {
              // for selected location handle roles update loop backwards because we will sometimes need to splice from list
              for (
                var i = userLocation.$$UserLocationRoles.length - 1;
                i >= 0;
                i--
              ) {
                ctrl.updateRoleAssignments(
                  userLocation,
                  userLocation.$$UserLocationRoles[i]
                );
              }
              // reset availableRoles for this teamMember and location
              ctrl.setAvailableRolesByUserLocation(userLocation);
            }
          }
        }
      });
    };

    $scope.hasFailures = false;
    // process all changes
    ctrl.processRoleAssignments = function () {
      var deferred = $q.defer();
      var locationRolesToProcess = [];
      angular.forEach($scope.users, function (teamMember) {
        var processes = ctrl.processRoleAssignmentsByTeamMember(teamMember);
        angular.forEach(processes, function (process) {
          locationRolesToProcess.push(process);
        });
      });
      $q.all(locationRolesToProcess).then(function (res) {
        angular.forEach(res, function (result) {
          if (result.success === false) {
            $scope.hasFailures = true;
          }
        });
        // handle post save functions - messaging
        if ($scope.hasFailures) {
          toastrFactory.error(
            localize.getLocalizedString(
              'Failed to save at least some of the {0}. Refresh the page and try again.',
              ['Roles']
            ),
            'Error'
          );
        } else {
          toastrFactory.success(
            localize.getLocalizedString('Roles assigned successfully.'),
            localize.getLocalizedString('Success')
          );
        }
        ctrl.refreshList();
        $scope.dataHasChanged = false;
        $scope.savingRoles = false;
        $scope.hasFailures = false;
        $location.url(_.escape('/BusinessCenter/PracticeSettings/'));
      });
    };

    ctrl.validateRoleAssigments = function () {
      $scope.formIsValid = true;
      angular.forEach($scope.users, function (teamMember) {
        // only on this location
        var locationIndex = listHelper.findIndexByFieldValue(
          teamMember.$$UserLocations,
          'LocationId',
          $scope.selectedLocations[0].LocationId
        );
        // only validate if user has location roles
        if (locationIndex > -1) {
          var userLocation = teamMember.$$UserLocations[locationIndex];
          if (userLocation) {
            if (ctrl.validateUserLocationRoles(userLocation) === false) {
              $scope.formIsValid = false;
            }
          }
        }
      });
    };

    $scope.saveRolesByLocation = function () {
      ctrl.validateRoleAssigments();
      if ($scope.formIsValid) {
        $scope.savingRoles = true;
        $scope.numberOfRolesToProcess = 0;
        ctrl.processRoleAssignments();
      }
    };

    //#endregion

    //#region cancel changes

    $scope.cancelListChanges = function () {
      if ($scope.dataHasChanged === true) {
        modalFactory.CancelModal().then($scope.cancelChanges, function () {});
      } else {
        $scope.cancelChanges();
      }
    };

    $scope.cancelChanges = function () {
      // revert any unsaved added or deleted roles
      ctrl.revertUnsavedChanges();
      // set variables to defaults
      $scope.dataHasChanged = false;
      $location.url(_.escape('/BusinessCenter/PracticeSettings/'));
    };

    // on cancel changes revert all unsaved changes
    ctrl.revertUnsavedChanges = function () {
      angular.forEach($scope.users, function (teamMember) {
        // only on this location
        var locationIndex = listHelper.findIndexByFieldValue(
          teamMember.$$UserLocations,
          'LocationId',
          $scope.selectedLocations[0].LocationId
        );
        if (locationIndex > -1) {
          var userLocation = teamMember.$$UserLocations[locationIndex];
          if (userLocation.$$UserLocationRoles) {
            for (
              var i = userLocation.$$UserLocationRoles.length - 1;
              i >= 0;
              i--
            ) {
              if (
                userLocation.$$UserLocationRoles[i].$$ObjectState ===
                saveStates.Add
              ) {
                userLocation.$$UserLocationRoles[i].$$ObjectState =
                  saveStates.None;
                // remove added roles
                var index = listHelper.findIndexByFieldValue(
                  userLocation.$$UserLocationRoles,
                  'RoleId',
                  userLocation.$$UserLocationRoles[i].RoleId
                );
                if (index > -1) {
                  userLocation.$$UserLocationRoles.splice(index, 1);
                }
              } else if (
                userLocation.$$UserLocationRoles[i].$$ObjectState ===
                saveStates.Delete
              ) {
                userLocation.$$UserLocationRoles[i].$$ObjectState =
                  saveStates.None;
              }
            }
            // clear errors
            userLocation.$$NoRoleError = false;
            $scope.formIsValid = true;
            // reset availableRoles for this teamMember and location
            ctrl.setAvailableRolesByUserLocation(userLocation);
          }
        }
      });
    };

    // discard service method
    $scope.resetData = function () {
      $scope.dataHasChanged = false;
    };

    //#endregion

    // dynamically setting title for no perms message
    $scope.showTitle = function (e) {
      if (!$scope.authAccess.Delete) {
        e.currentTarget.title = ctrl.titleMessage;
      }
    };

    // Navigate to the view roles page
    $scope.viewRoles = function () {
      modalFactory
        .Modal({
          templateUrl:
            'App/BusinessCenter/roles/role-settings/role-settings-view.html',
          backdrop: 'static',
          keyboard: false,
          size: 'xl',
          windowClass: 'center-modal',
          controller: 'RoleSettingsController',
          amfa: 'soar-biz-sec-roldet',
          resolve: {
            // nothing yet
          },
        })
        .result.then(function () {
          // nothing yet
        });
    };

    // Navigate to the compare roles page
    $scope.compareRoles = function () {
      modalFactory
        .Modal({
          templateUrl:
            'App/BusinessCenter/roles/role-settings/role-settings-compare.html',
          backdrop: 'static',
          keyboard: false,
          size: 'lg',
          windowClass: 'center-modal',
          controller: 'RoleSettingsController',
          amfa: 'soar-biz-sec-roldet',
          resolve: {
            // nothing yet
          },
        })
        .result.then(function () {
          // nothing yet
        });
    };

    // on load
    ctrl.$onInit = function () {
      // only show locations for this user
      ctrl.getRoles();
      ctrl.getCurrentUserLocations();
      $location.search('fromAssignRoles', null);
    };
    ctrl.$onInit();
  },
]);
