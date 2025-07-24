'use strict';

var app = angular.module('Soar.BusinessCenter');
var userLocationsSetupController = app.controller(
  'UserLocationsSetupController',
  [
    '$rootScope',
    '$scope',
    '$q',
    'StaticData',
    'referenceDataService',
    'UserServices',
    '$timeout',
    'toastrFactory',
    'localize',
    'patSecurityService',
    'ModalFactory',
    'RolesFactory',
    'UserLocationsSetupFactory',
    'RoleNames',
    'SaveStates',
    function (
      $rootScope,
      $scope,
      $q,
      staticData,
      referenceDataService,
      userServices,
      $timeout,
      toastrFactory,
      localize,
      patSecurityService,
      modalFactory,
      rolesFactory,
      userLocationsSetupFactory,
      roleNames,
      saveStates
    ) {
      var ctrl = this;
      $scope.roleNames = roleNames;
      $scope.savingUserLocationSetup = false;
      $scope.practiceOnlyHasOneAdmin = false;
      $scope.disableTeamMemberType = true;
      ctrl.userLocationSetups = [];
      ctrl.userRoles = [];
      $scope.availableLocations = [];
      $scope.displayPracticeRolesChangedMessage = false;
      $scope.loggedInUserHasPracticeAccess = false;
      $scope.currentStatus = _.clone($scope.user.IsActive);
      $scope.reasonPlaceHolder =
        'Reason to ' +
        ($scope.user.IsActive ? 'disable' : 'enable') +
        ' user access';
      $scope.backupUserLocationSetup = null;

      //#region security

      $scope.authAccess = rolesFactory.access();
      // if (!$scope.authAccess.View) {
      //     toastrFactory.error(patSecurityService.generateMessage('plapi-user-usrrol-read'), 'Not Authorized');
      //     event.preventDefault();
      //     $location.path('/');
      // }

      //#endregion

      // NOTE TODO  handle access
      $scope.hasCreateAccess = true;
      $scope.hasViewAccess = true;

      //#region init
      ctrl.$onInit = function () {
        // determine whether logged in user can change a user from location roles to practice admin roles
        ctrl.determinePracticeRoleAccess();
        // load all of the dependancies we need to display the UserLocationSetups
        $scope.loading = true;
        var initialDependancies = [];
        $scope.savingUserLocationSetup = false;
        ctrl.users = referenceDataService.get(
          referenceDataService.entityNames.users
        );
        ctrl.locations = referenceDataService.get(
          referenceDataService.entityNames.locations
        );
        initialDependancies.push(ctrl.getProviderTypes());
        initialDependancies.push(ctrl.getPermittedLocations());
        initialDependancies.push(ctrl.getRoles());
        // if this is an existing user get their current userLocationSetups
        if (!_.isEmpty($scope.user.UserId) && !_.isNil($scope.user.UserId)) {
          initialDependancies.push(
            ctrl.getUserLocationsSetups($scope.user.UserId)
          );
          initialDependancies.push(ctrl.getUserRoles());
        }
        $q.all(initialDependancies).then(function () {
          ctrl.mergeDataForUserLocationSetups();
        });
      };
      ctrl.determinePracticeRoleAccess = function () {
        var userContext = JSON.parse(sessionStorage.getItem('userContext'));
        $scope.loggedInUserHasPracticeAccess =
          userContext.Result.Access[0] &&
          userContext.Result.Access[0].AccessLevel === 2
            ? true
            : false;
      };

      //#region merge data to get displayNames

      ctrl.mergeDataForUserLocationSetups = function () {
        // merge location info to the userLocationSetups
        userLocationsSetupFactory.MergeLocationData(
          ctrl.userLocationSetups,
          ctrl.locations,
          ctrl.permittedLocations
        );
        // merge user info to the userLocationSetups
        userLocationsSetupFactory.MergeUserData(
          ctrl.userLocationSetups,
          ctrl.users,
          ctrl.providerTypes
        );
        // merge location roles info to the userLocationSetups
        _.forEach(ctrl.userLocationSetups, function (userLocationSetup) {
          userLocationSetup.$$UserLocationRoles = [];
        });
        // merge practice roles info to the userLocationSetups
        userLocationsSetupFactory.MergeLocationRolesData(
          ctrl.userLocationSetups,
          ctrl.userRoles
        );
        $scope.user.$$UserPracticeRoles = [];
        userLocationsSetupFactory.MergePracticeRolesData(
          ctrl.userRoles,
          $scope.user
        );
        _.forEach(ctrl.userLocationSetups, function (userLocationSetup) {
          $scope.userLocationSetups.push(userLocationSetup);
        });
        // sort the userLocationSetups
        $scope.userLocationSetups = _.orderBy(
          $scope.userLocationSetups,
          '$$Location.NameLine1'
        );
        // check licenses for this user by state
        ctrl.validateStateLicenseByLocation();
        // build a list of locations that can be added
        $scope.availableLocations = ctrl.getAvailableLocations();
        $scope.loading = false;
      };

      //#endregion

      //#region initial dependancies data

      // get this users current provider location setup
      ctrl.getUserLocationsSetups = function () {
        var promise = userLocationsSetupFactory
          .UserLocationSetups($scope.user.UserId)
          .then(function (res) {
            ctrl.userLocationSetups = res.Value;
          });
        return promise;
      };

      // list of provider types with names and ids
      ctrl.getProviderTypes = function () {
        ctrl.providerTypes = [];
        var promise = staticData.ProviderTypes().then(function (res) {
          ctrl.providerTypes = res.Value;
        });
        return promise;
      };

      // gets a list of locations this user is permitted to add userLocationsSetup and roles for
      ctrl.getPermittedLocations = function () {
        var promise = userLocationsSetupFactory
          .PermittedLocations()
          .then(function (res) {
            var permittedLocations = res.Value;
            ctrl.permittedLocations = userLocationsSetupFactory.GroupLocations(
              permittedLocations
            );
          });
        return promise;
      };

      //#region Handle switch from location user to practice admin or practice admin to location user

      // warning when switching from location user to practice roles user
      ctrl.confirmSwitchToPracticeAdmin = function () {
        var title = localize.getLocalizedString('Warning');
        var message = localize.getLocalizedString(
          'Changing this user to a Practice Admin/Exec. Dentist will remove all existing location roles and provide global access.'
        );
        message =
          $scope.user.ProviderTypeId != 4
            ? message +
              ' ' +
              localize.getLocalizedString(
                'Any Provider time assigned to the weekly setup will remain on the schedule.'
              )
            : message;
        var button1Text = localize.getLocalizedString('Continue');
        var button2Text = localize.getLocalizedString('Cancel');
        modalFactory
          .ConfirmModal(title, message, button1Text, button2Text)
          .then(
            function () {
              ctrl.switchToPracticeAdmin();
            },
            function () {
              // user cancelled action
              $scope.user.$$isPracticeAdmin = false;
            }
          );
      };

      $scope.changeRoleAssignment = function (toPracticeAdmin) {
        if (toPracticeAdmin === true) {
          // if no userLocationSetups, just switch it
          if ($scope.userLocationSetups.length === 0) {
            ctrl.switchToPracticeAdmin();
          } else {
            ctrl.confirmSwitchToPracticeAdmin();
          }
        }

        if (toPracticeAdmin === false) {
          // if changing from practice admin to location roles user
          // check to see if this is the only practice admin before proceeding (NOTE removing practice role prohibited if only one admin)
          rolesFactory.AllPracticeAdmins().then(function (res) {
            $scope.practiceOnlyHasOneAdmin =
              res.Result.length > 1 ? false : true;
            if ($scope.practiceOnlyHasOneAdmin === true) {
              // STOP do not allow switch to practice admin
              $scope.user.$$isPracticeAdmin = true;
            } else {
              ctrl.switchToLocationUserRoles();
            }
          });
        }
      };

      // if user.IsActive they are required to have at least one location role per location
      // or to be a PracticeAdmin (which would dictate they have one Practice role)
      ctrl.checkLocationsForRoles = function () {
        $scope.showMissingRolesMessage = false;
        if (
          $scope.user.$$isPracticeAdmin === false &&
          $scope.user.IsActive === true
        ) {
          _.forEach($scope.userLocationSetups, function (userLocationSetup) {
            if (userLocationSetup.$$UserLocationRoles.length === 0) {
              $scope.showMissingRolesMessage = true;
            }
          });
        }
      };

      // switch from location user roles to practice role and set objectStates
      ctrl.switchToLocationUserRoles = function () {
        // if roles have ObjectState of Delete it means this action hasn't been saved yet
        // return them to None
        _.forEach($scope.userLocationSetups, function (userLocationSetup) {
          _.forEach(userLocationSetup.$$UserLocationRoles, function (role) {
            role.$$ObjectState = saveStates.None;
          });
        });

        if (ctrl.practiceAdminRole) {
          // if user has a practice admin role, delete it
          _.forEach($scope.user.$$UserPracticeRoles, function (practiceRole) {
            if (practiceRole.RoleId === ctrl.practiceAdminRole.RoleId) {
              practiceRole.$$ObjectState = saveStates.Delete;
            }
          });
          $scope.user.$$isPracticeAdmin = false;
        }
        ctrl.checkLocationsForRoles();
      };

      // switch from location user roles to practice role and set objectStates
      ctrl.switchToPracticeAdmin = function () {
        _.forEach($scope.userLocationSetups, function (userLocationSetup) {
          _.forEach(userLocationSetup.$$UserLocationRoles, function (role) {
            role.$$ObjectState = saveStates.Delete;
          });
        });

        if (ctrl.practiceAdminRole) {
          $scope.user.$$isPracticeAdmin = true;
          var role = _.cloneDeep(ctrl.practiceAdminRole);
          // if role already exists just set the object state to None otherwise Add
          var practiceRole = _.find(
            $scope.user.$$UserPracticeRoles,
            function (role) {
              return (
                role.RoleName.toLowerCase() ===
                roleNames.PracticeAdmin.toLowerCase()
              );
            }
          );
          if (practiceRole) {
            practiceRole.$$ObjectState = saveStates.None;
          } else {
            role.$$ObjectState = saveStates.Add;
            $scope.user.$$UserPracticeRoles.push(role);
          }
        }
        ctrl.checkLocationsForRoles();
      };

      //#endregion

      //#region role data

      // merge roles to user
      ctrl.mergeUserRoleData = function () {
        userLocationsSetupFactory.mergeUserRoleData(
          $scope.user,
          ctrl.userRoles
        );
      };

      // get roles
      ctrl.getRoles = function () {
        var promise = rolesFactory.Roles().then(function (res) {
          // remove rxRoles
          ctrl.roles = res.Result;
          // grab the practiceAdmin role
          ctrl.practiceAdminRole = _.find(ctrl.roles, function (role) {
            return (
              role.RoleName.toLowerCase() ===
              roleNames.PracticeAdmin.toLowerCase()
            );
          });
          ctrl.rxAccessRole = _.find(ctrl.roles, function (role) {
            return (
              role.RoleName.toLowerCase() ===
              roleNames.RxUser.toLowerCase().trim()
            );
          });
        });
        return promise;
      };

      // get all user roles
      ctrl.getUserRoles = function () {
        var promise = rolesFactory
          .UserRoles($scope.user.UserId)
          .then(function (res) {
            ctrl.userRoles = res.Result;
          });
        return promise;
      };

      $scope.deletedRolesFilter = function (item) {
        if (item) {
          return item.$$ObjectState === saveStates.Delete ? false : true;
        }
        return true;
      };

      //#endregion

      //#region crud

      // when user completes new location setup or edit, merge that data to the userLocationSetup table
      // on cancel check to see if we have userLocationSetup changes
      ctrl.addUserLocationSetupToList = function (locationSetup) {
        // set ProviderTypeId to int
        var providerTypeId = parseInt(locationSetup.ProviderTypeId);
        locationSetup.ProviderTypeId = providerTypeId;

        // set LocationId to int
        var locationId = parseInt(locationSetup.LocationId);
        locationSetup.LocationId = locationId;

        let matchingIndex;

        if (_.isNil(locationSetup.UserProviderSetupLocationId)) {
          matchingIndex = _.findIndex(
            $scope.userLocationSetups,
            function (userLocationSetup) {
              return (
                userLocationSetup.LocationId === locationSetup.LocationId &&
                userLocationSetup.ObjectState === saveStates.Delete
              );
            }
          );
          if (matchingIndex !== -1) {
            // if this is a new userLocationSetup that matches a userLocationSetup that has an objectState of Delete
            // merge to the existing and change objectState to Update
            locationSetup.DataTag =
              $scope.userLocationSetups[matchingIndex].DataTag;
            locationSetup.UserProviderSetupLocationId =
              $scope.userLocationSetups[
                matchingIndex
              ].UserProviderSetupLocationId;
            locationSetup.ObjectState = saveStates.Update;
            // UserLocationRoles
            // If the existing UserLocationSetup has a role that matches the new one, we don't need to do anything with it
            // otherwise add the role to be deleted to the collection
            _.forEach(
              $scope.userLocationSetups[matchingIndex].$$UserLocationRoles,
              function (userLocationRole) {
                var matchingRole = _.find(
                  locationSetup.$$UserLocationRoles,
                  function (newUserLocationRole) {
                    return (
                      newUserLocationRole.RoleId === userLocationRole.RoleId
                    );
                  }
                );
                if (matchingRole) {
                  userLocationRole.ObjectState = saveStates.None;
                } else {
                  locationSetup.$$UserLocationRoles.push(userLocationRole);
                }
              }
            );
            $scope.userLocationSetups.splice(matchingIndex, 1);
            $scope.userLocationSetups.push(locationSetup);
            $scope.userLocationSetupsDataChanged = true;
          }
        }

        // if this is a new userLocationSetup that is being edited, replace in the list
        // otherwise push to list
        if (_.isNil(locationSetup.UserProviderSetupLocationId)) {
          var newIndex = _.findIndex(
            $scope.userLocationSetups,
            function (userLocationSetup) {
              return userLocationSetup.LocationId === locationSetup.LocationId;
            }
          );
          if (newIndex !== -1) {
            $scope.userLocationSetups.splice(newIndex, 1);
            $scope.userLocationSetups.push(locationSetup);
            $scope.userLocationSetupsDataChanged = true;
          } else {
            // if we have a backup then this userLocationSetup was new, then edited, and the location has been changed
            // in this case we need to remove the backup from the list
            if ($scope.userLocationSetupBackup !== null) {
              var backupIndex = _.findIndex(
                $scope.userLocationSetups,
                function (userLocationSetup) {
                  return (
                    userLocationSetup.LocationId ===
                    $scope.userLocationSetupBackup.LocationId
                  );
                }
              );
              if (backupIndex !== -1) {
                $scope.userLocationSetups.splice(backupIndex, 1);
              }
            }
            $scope.userLocationSetups.push(locationSetup);
            $scope.userLocationSetupsDataChanged = true;
          }
        }
        // if this is an existing setup, replace it in the list
        if (!_.isNil(locationSetup.UserProviderSetupLocationId)) {
          var updateIndex = _.findIndex(
            $scope.userLocationSetups,
            function (userLocationSetup) {
              return (
                userLocationSetup.UserProviderSetupLocationId ===
                locationSetup.UserProviderSetupLocationId
              );
            }
          );
          if (updateIndex !== -1) {
            $scope.userLocationSetups.splice(updateIndex, 1);
            $scope.userLocationSetups.push(locationSetup);
            $scope.userLocationSetupsDataChanged = true;
          }
        }
        // reset merged data
        // merge location info to the userLocationSetups
        userLocationsSetupFactory.MergeLocationData(
          $scope.userLocationSetups,
          ctrl.locations,
          ctrl.permittedLocations
        );
        // merge user info to the userLocationSetups
        userLocationsSetupFactory.MergeUserData(
          $scope.userLocationSetups,
          ctrl.users,
          ctrl.providerTypes
        );

        // sort after NameLine has been added
        $scope.userLocationSetups = _.orderBy(
          $scope.userLocationSetups,
          '$$Location.NameLine1'
        );
        ctrl.checkLocationsForRoles();
        // notify user they will need to sign out and back in Only if they are an existing user
        if (!_.isNil($scope.user.UserId) && !_.isEmpty($scope.user.UserId)) {
          $scope.displayPracticeRolesChangedMessage = true;
        }

        $scope.userLocationsErrors.NoUserLocationsError = false;
      };

      // filter list to remove any active user locations
      ctrl.getAvailableLocations = function () {
        var locationsSetup = [];
        // build a list of locationIds on existing userLocationSetups (exclude ones with ObjectState.Delete)
        let activeLocations = $scope.userLocationSetups.filter(function (
          location
        ) {
          return location.ObjectState !== saveStates.Delete;
        });
        locationsSetup = _.uniq(
          _.concat(locationsSetup, _.map(activeLocations, 'LocationId'))
        );
        return _.filter(
          ctrl.permittedLocations,
          v => _.indexOf(locationsSetup, v.LocationId) === -1
        );
      };

      $scope.addUserLocationSetup = function () {
        $scope.userLocationSetupBackup = null;
        // build a list of locations that can be added
        $scope.availableLocations = ctrl.getAvailableLocations();
        var userLocationSetup = userLocationsSetupFactory.UserLocationSetupDto();
        // default Color on new userLocationSetup
        userLocationSetup.ObjectState = saveStates.Add;
        // NOTE open modal to add a user location
        var modalInstance = modalFactory.Modal({
          windowTemplateUrl: 'uib/template/modal/window.html',
          templateUrl:
            'App/BusinessCenter/users/user-crud/user-locations-setup/user-location-setup-crud/user-location-setup-crud.html',
          controller: 'UserLocationSetupCrudController',
          amfa: 'plapi-user-usrrol-read',
          backdrop: 'static',
          keyboard: false,
          size: 'md',
          windowClass: 'center-modal',
          resolve: {
            addUserLocationSetupCallback: function () {
              return ctrl.addUserLocationSetupToList;
            },
            user: function () {
              return $scope.user;
            },
            userRoles: function () {
              return ctrl.userRoles;
            },
            roles: function () {
              return ctrl.roles;
            },
            providerTypes: function () {
              return ctrl.providerTypes;
            },
            userLocationSetup: function () {
              return userLocationSetup;
            },
            availableLocations: function () {
              return $scope.availableLocations;
            },
          },
        });
      };

      // NOTE cannot remove a location if you have scheduled appointments /provider room occurrences at this location
      // This method disables the trash can button and adds a tooltip for a location if provider has provider hours or appointments for this location
      // Also sets the remove button tooltip for this location
      ctrl.setCanRemoveLocation = function (userLocationSetup) {
        userLocationSetup.$$RemoveButtonTooltip = localize.getLocalizedString(
          'Remove {0}',
          ['User Location Setup']
        );
        userLocationSetup.$$CanRemoveLocation = true;
        if ($scope.user.$$scheduleStatuses && userLocationSetup.LocationId) {
          userLocationSetup.$$CanRemoveLocation = true;
          // does this user have a scheduleStatus record for this location
          var scheduleStatusRecord = _.find(
            $scope.user.$$scheduleStatuses,
            function (record) {
              return record.LocationId === userLocationSetup.LocationId;
            }
          );
          if (scheduleStatusRecord) {
            if (
              scheduleStatusRecord.HasProviderAppointments ||
              scheduleStatusRecord.HasProviderRoomOccurrences
            ) {
              userLocationSetup.$$CanRemoveLocation = false;
            }
          }
        }
        if (userLocationSetup.$$CanRemoveLocation === false) {
          userLocationSetup.$$RemoveButtonTooltip = localize.getLocalizedString(
            'This {0} cannot be changed because he/she has scheduled hours and/or scheduled appointments.',
            ['provider']
          );
        }
      };
      // remove this location for user
      // if this is a new location, just remove from list
      // if existing location, set objectState
      $scope.removeUserLocationSetup = function (userLocationSetup) {
        var hasDeleteAccess = patSecurityService.IsAuthorizedByAbbreviation(
          'soar-biz-bizusr-delete'
        );
        // can we remove this location
        ctrl.setCanRemoveLocation(userLocationSetup);
        if (userLocationSetup.$$CanRemoveLocation && hasDeleteAccess === true) {
          // remove this location from list of userLocations if it is an existing userLocationSetup
          var editMode = _.isNil(userLocationSetup.UserProviderSetupLocationId)
            ? false
            : true;
          if (editMode === true) {
            userLocationSetup.ObjectState = saveStates.Delete;
            // mark all location roles for this location as ObjectState.Delete
            _.forEach(userLocationSetup.$$UserLocationRoles, function (role) {
              if (role.$$ObjectState === 'Add') {
                role.$$ObjectState = saveStates.None;
              } else {
                role.$$ObjectState = saveStates.Delete;
              }
            });
            $scope.userLocationSetupsDataChanged = true;
          } else {
            // remove from list if this is a new userLocationSetup
            if (_.isNil(userLocationSetup.UserProviderSetupLocationId)) {
              var newIndex = _.findIndex(
                $scope.userLocationSetups,
                function (locationSetup) {
                  return (
                    parseInt(locationSetup.LocationId) ===
                    parseInt(userLocationSetup.LocationId)
                  );
                }
              );
              if (newIndex !== -1) {
                $scope.userLocationSetups.splice(newIndex, 1);
                $scope.userLocationSetupsDataChanged = true;
              }
            }
          }
          // rebuild a list of locations that can be added
          $scope.availableLocations = ctrl.getAvailableLocations();
        }
      };

      // TODO amfa
      $scope.editUserLocationSetup = function (userLocationSetup) {
        var userLocationSetupToEdit = _.cloneDeep(userLocationSetup);
        $scope.userLocationSetupBackup = null;
        // keep a backup of this userLocationSetup from list if it is a new user location
        if (_.isNil(userLocationSetup.UserProviderSetupLocationId)) {
          var newIndex = _.findIndex(
            $scope.userLocationSetups,
            function (locationSetup) {
              return locationSetup.LocationId === userLocationSetup.LocationId;
            }
          );
          if (newIndex !== -1) {
            $scope.userLocationSetupBackup =
              $scope.userLocationSetups[newIndex];
          }
        }

        // NOTE open modal to add a user location
        var modalInstance = modalFactory.Modal({
          windowTemplateUrl: 'uib/template/modal/window.html',
          templateUrl:
            'App/BusinessCenter/users/user-crud/user-locations-setup/user-location-setup-crud/user-location-setup-crud.html',
          controller: 'UserLocationSetupCrudController',
          amfa: 'plapi-user-usrrol-read',
          backdrop: 'static',
          keyboard: false,
          size: 'md',
          windowClass: 'center-modal',
          resolve: {
            addUserLocationSetupCallback: function () {
              return ctrl.addUserLocationSetupToList;
            },
            user: function () {
              return $scope.user;
            },
            roles: function () {
              return ctrl.roles;
            },
            userRoles: function () {
              return ctrl.userRoles;
            },
            providerTypes: function () {
              return ctrl.providerTypes;
            },
            userLocationSetup: function () {
              return userLocationSetupToEdit;
            },
            availableLocations: function () {
              return $scope.availableLocations;
            },
          },
        });
      };

      //#endregion

      //#region handle inactivating a user

      //TODO

      //#endregion

      //#region rx

      $scope.rxRoleFilter = function (item) {
        if (item) {
          return item.RoleName.toLowerCase() === roleNames.RxUser.toLowerCase()
            ? false
            : true;
        }
        return true;
      };

      ctrl.rxAccessRole = null;

      // add / remove role based on rxRole
      $scope.$watch('user.RxUserType', function (nv) {
        if (nv || nv === 0) {
          if (
            $scope.user.RxUserType === 1 ||
            $scope.user.RxUserType === 2 ||
            $scope.user.RxUserType === 3
          ) {
            if (ctrl.rxAccessRole) {
              var rxRole = _.filter(
                $scope.user.$$UserPracticeRoles,
                function (role) {
                  return !$scope.rxRoleFilter(role);
                }
              );
              if (!rxRole || rxRole.length == 0) {
                ctrl.rxAccessRole.$$ObjectState = saveStates.Add;
                $scope.user.$$UserPracticeRoles.push(ctrl.rxAccessRole);
              }
            }
          } else if (ctrl.rxAccessRole) {
            var index = _.findIndex(
              $scope.user.$$UserPracticeRoles,
              function (userPracticeRole) {
                return userPracticeRole.RoleId === ctrl.rxAccessRole.RoleId;
              }
            );
            if (index > -1) {
              $scope.user.$$UserPracticeRoles[index].$$ObjectState =
                saveStates.Delete;
            }
          }
        }
      });

      $scope.$on('fuse:user-rx-changed', function (event, rxSettings) {
        if (rxSettings) {
          if (
            !_.isEmpty(rxSettings.locations) &&
            !_.isEmpty(rxSettings.roles)
          ) {
            if (ctrl.rxAccessRole) {
              var rxRole = _.filter(
                $scope.user.$$UserPracticeRoles,
                function (role) {
                  return !$scope.rxRoleFilter(role);
                }
              );
              if (!rxRole || rxRole.length == 0) {
                ctrl.rxAccessRole.$$ObjectState = saveStates.Add;
                $scope.user.$$UserPracticeRoles.push(ctrl.rxAccessRole);
              }
            }
          } else if (ctrl.rxAccessRole) {
            var index = _.findIndex(
              $scope.user.$$UserPracticeRoles,
              function (userPracticeRole) {
                return userPracticeRole.RoleId === ctrl.rxAccessRole.RoleId;
              }
            );
            if (index > -1) {
              $scope.user.$$UserPracticeRoles[index].$$ObjectState =
                saveStates.Delete;
            }
          }
        }
      });

      //#endregion

      //handle not adding a location if you have all of them

      //#region View / Compare Roles

      //#region show warning if any of the userLocationSetups don't have a state license if required
      ctrl.updatedLicenses = [];
      $scope.$on('sendLicensesToValidate', function (events, args) {
        if (args) {
          ctrl.updatedLicenses = args;
        }
        ctrl.validateStateLicenseByLocation();
      });

      ctrl.checkForUserStateLicense = function (locationId) {
        var ofcLocation = _.find(ctrl.permittedLocations, function (location) {
          return location.LocationId === locationId;
        });
        if (ofcLocation) {
          var locationHasLicense = _.filter(
            ctrl.updatedLicenses,
            function (license) {
              return license.StateAbbreviation === ofcLocation.State;
            }
          );
          if (locationHasLicense.length === 0) {
            return ofcLocation.State;
          }
        }
        return '';
      };

      ctrl.validateStateLicenseByLocation = function () {
        ctrl.validatedStates = [];
        $scope.noStateLicense = false;
        $scope.needLicenseStates = '';
        _.forEach($scope.userLocationSetups, function (userLocationSetups) {
          var stateWithNoLicense = ctrl.checkForUserStateLicense(
            userLocationSetups.LocationId
          );
          if (!_.isEmpty(stateWithNoLicense)) {
            var stateInListIndex = _.findIndex(
              ctrl.validatedStates,
              function (state) {
                return state.StateAbbreviation == stateWithNoLicense;
              }
            );
            if (stateInListIndex === -1) {
              // array of states that need licenses
              ctrl.validatedStates.push({
                StateAbbreviation: stateWithNoLicense,
              });
              // display for licenses needed
              $scope.needLicenseStates += stateWithNoLicense + ', ';
            }
          }
        });
        if ($scope.needLicenseStates !== '') {
          $scope.needLicenseStates = $scope.needLicenseStates
            .toString()
            .slice(0, -2);
        }
        var needLicenseStatesMessage =
          $scope.needLicenseStates === ''
            ? ''
            : 'Please add a State License for ' + $scope.needLicenseStates;
        $rootScope.$broadcast(
          'stateLicenseValidation',
          needLicenseStatesMessage
        );
      };

      //#endregion

      $scope.viewRoles = function () {
        userLocationsSetupFactory.ViewRoles();
      };

      $scope.compareRoles = function () {
        userLocationsSetupFactory.CompareRoles();
      };

      //#region InactiveUser and store roles

      // after restoring user access, adds aaretained location role back to user by location
      ctrl.addLocationRole = function (roleId, locationId) {
        if (roleId && locationId) {
          // look up role in list
          var locationRoleToAdd = _.find(ctrl.roles, function (role) {
            return role.RoleId === parseInt(roleId);
          });
          if (locationRoleToAdd) {
            // find matching location
            var matchingLocationSetup = _.find(
              $scope.userLocationSetups,
              function (userLocationSetup) {
                return (
                  parseInt(userLocationSetup.LocationId) ===
                  parseInt(locationId)
                );
              }
            );
            if (matchingLocationSetup) {
              // add to users location roles and set ObjectState
              locationRoleToAdd.$$ObjectState = saveStates.Add;
              matchingLocationSetup.$$UserLocationRoles.push(locationRoleToAdd);
              $scope.userLocationSetupsDataChanged = true;
            }
          }
        }
      };

      // after restoring user access, adds a retained practice role roles back to user
      ctrl.addPracticeRole = function (roleId) {
        if (roleId) {
          // look up role in list
          var practiceRoleToAdd = _.find(ctrl.roles, function (role) {
            return role.RoleId === parseInt(roleId);
          });

          if (practiceRoleToAdd) {
            // add to users location roles and set ObjectState
            practiceRoleToAdd.$$ObjectState = saveStates.Add;
            $scope.user.$$UserPracticeRoles.push(practiceRoleToAdd);
            $scope.userLocationSetupsDataChanged = true;
          }
        }
        // if user has a practice admin role, set them to practice admin
        _.forEach($scope.user.$$UserPracticeRoles, function (practiceRole) {
          if (practiceRole.RoleId === ctrl.practiceAdminRole.RoleId) {
            $scope.user.$$isPracticeAdmin = true;
          }
        });
      };

      // gets roles that were stored  when user access set to false
      ctrl.getInactiveUserRoles = function () {
        rolesFactory
          .GetInactiveUserAssignedRoles($scope.user.UserId)
          .then(function (res) {
            var inactiveUserRole = res.Value;
            // merge these into new roles and mark as add
            _.forEach(
              inactiveUserRole.UserRoleLocationInactiveDtos,
              function (userLocationRole) {
                // add location roles
                ctrl.addLocationRole(
                  userLocationRole.RoleId,
                  userLocationRole.LocationId
                );
              }
            );

            _.forEach(
              inactiveUserRole.UserRolePracticeInactiveDtos,
              function (userPracticeRole) {
                // add practice roles
                ctrl.addPracticeRole(userPracticeRole.RoleId);
              }
            );
          });
      };

      // when user access is restored and confirmed, userActivated is set to true
      // this triggers adding retained roles back to the user
      $scope.$watch(
        'userActivated',
        function (nv) {
          if (!_.isNil(nv)) {
            if (nv === true && $scope.user.IsActive === true) {
              ctrl.getInactiveUserRoles();
            }
          }
        },
        true
      );

      //#endregion
    },
  ]
);
