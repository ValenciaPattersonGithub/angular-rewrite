'use strict';

angular.module('common.controllers').controller('UserRoleController', [
  '$rootScope',
  '$scope',
  'UserServices',
  'toastrFactory',
  '$timeout',
  '$location',
  'localize',
  'patSecurityService',
  '$filter',
  'LocationServices',
  'ListHelper',
  'ModalFactory',
  'locationService',
  'StaticData',
  'RolesFactory',
  'AmfaInfo',
  'TimeZoneFactory',
  'RoleNames',
  function (
    $rootScope,
    $scope,
    userServices,
    toastrFactory,
    $timeout,
    $location,
    localize,
    patSecurityService,
    $filter,
    locationServices,
    listHelper,
    modalFactory,
    locationService,
    staticData,
    rolesFactory,
    amfaInfo,
    timeZoneFactory,
    roleNames
  ) {
    var ctrl = this;

    // Indicate that fetching of data from server has been started
    $scope.isLoading = true;

    ctrl.hasRoleDetailsAccess = false;
    $scope.hasHighRoleAccess = false;
    $scope.roles = [];
    $scope.roleIds = [];
    $scope.updatedRoleId = [];
    $scope.securityRolesSectionOpen = true;
    $scope.locationsLoading = false;
    $scope.selectedRoles = [];
    $scope.locations = [];
    $scope.user.$$originalUserScheduleLocations = [];
    $scope.user.$$originalUserLocationRoles = [];
    $scope.user.$$locations = [];
    $scope.user.$$isOnSchedule = false;
    $scope.currentStatus = angular.copy($scope.user.IsActive);
    $scope.isEdit =
      angular.isDefined($scope.user.UserId) && $scope.user.UserId.length == 36;
    $scope.reasonPlaceHolder =
      'Reason to ' +
      ($scope.user.IsActive ? 'disable' : 'enable') +
      ' user access';

    $scope.user.$$selectedLocations = [];
    $scope.user.$$selectedPracticeRoles = [];
    $scope.validating = false;
    $scope.activeLocation = locationService.getCurrentLocation();

    $scope.practiceAdminRoleName = roleNames.PracticeAdmin;

    // when header locations dropdown changes, we need to reset activeLocation to make sure is not removed
    $scope.$on('patCore:initlocation', function () {
      $scope.activeLocation = locationService.getCurrentLocation();
    });

    //#region new assignRolesBy (radio buttons) functionality

    $scope.$watch('assignRolesBySelection', function (nv, ov) {
      ctrl.assignRolesBySelectionWatch(nv, ov);
    });

    ctrl.switchToPracticeAdmin = function () {
      angular.forEach($scope.user.$$locations, function (location) {
        location.Roles.length = 0;
      });
      $scope.user.$$locations.length = 0;
      $scope.user.$$selectedLocations.length = 0;
      $scope.user.$$selectedPracticeRoles = $filter('filter')(
        $scope.user.$$selectedPracticeRoles,
        function (role) {
          return !$scope.rxRoleFilter(role);
        }
      );
      var item = listHelper.findItemByFieldValue(
        $scope.roles,
        'RoleName',
        roleNames.PracticeAdmin
      );
      if (item) {
        $scope.user.$$selectedPracticeRoles.push(item);
      }
    };

    ctrl.assignRolesBySelectionWatch = function (nv, ov) {
      if (nv === 'location') {
        ctrl.getPracticeAdminsInPractice(nv, ov);
        $scope.user.$$selectedPracticeRoles = $filter('filter')(
          $scope.user.$$selectedPracticeRoles,
          function (role) {
            return !$scope.rxRoleFilter(role);
          }
        );
      } else if (nv === 'practice') {
        if (
          ov === 'location' &&
          $scope.user.$$originalSelectedPracticeRoles &&
          $scope.user.$$originalSelectedPracticeRoles.length === 0
        ) {
          ctrl.warnUserWhenSwitchingFromLocationToPractice(nv, ov);
        } else {
          ctrl.switchToPracticeAdmin();
        }
      }
    };

    // need to make sure that they can remove practice admin from this user, can't if they are the last one
    ctrl.getPracticeAdminsInPractice = function (nv, ov) {
      // only do this once and only when they have tried to go from practice to location
      if (
        nv === 'location' &&
        ov === 'practice' &&
        angular.isUndefined($scope.practiceOnlyHasOneAdmin)
      ) {
        var userPractice = JSON.parse(sessionStorage.getItem('userPractice'));
        if (userPractice) {
          userServices.Roles.getAllRolesByPractice(
            { practiceId: userPractice.id },
            function (res) {
              if (res && res.Result) {
                if (
                  res.Result.length === 1 &&
                  $scope.user.$$originalSelectedPracticeRoles.length > 0
                ) {
                  $scope.practiceOnlyHasOneAdmin = true;
                  // switch it back
                  $scope.assignRolesBySelection = 'practice';
                } else {
                  $scope.practiceOnlyHasOneAdmin = false;
                }
              }
            },
            function () {
              // if this call fails, we cannot allow them to remove practice admin from this user in case there is only one
              $scope.practiceOnlyHasOneAdmin = true;
              // switch it back
              $scope.assignRolesBySelection = 'practice';
            }
          );
        }
      }
    };

    // warning user that if they switch them from location tp provider, they will lose all location roles, etc.
    ctrl.warnUserWhenSwitchingFromLocationToPractice = function (nv, ov) {
      if (
        nv === 'practice' &&
        ov === 'location' &&
        $scope.user.$$originalSelectedPracticeRoles.length === 0
      ) {
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
              $scope.assignRolesBySelection = 'location';
            }
          );
      }
    };

    //#endregion

    // Navigate to the view roles page
    $scope.viewRoles = function () {
      //$location.path('BusinessCenter/PracticeSettings/ViewRoles/');
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

    // Navigate to the view roles page
    $scope.compareRoles = function () {
      //$location.path('BusinessCenter/PracticeSettings/ViewRoles/');
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

    // used to determine if X is displayed on location tag
    $scope.canRemove = function (location, tagType) {
      var result;
      if ($scope.activeLocation) {
        var currentUser = $rootScope.patAuthContext.userInfo;
        if (tagType === 'location') {
          result =
            $scope.activeLocation.name === location.Location.NameLine1 &&
            currentUser.userid === $scope.user.UserId;
          location.$$LocationTooltip = result
            ? localize.getLocalizedString('Cannot remove your active location')
            : '';
        } else if (tagType === 'role') {
          var locRoleCount = location.Roles ? location.Roles.length : 0;
          var pracRoleCount = $scope.user.$$selectedPracticeRoles
            ? $scope.user.$$selectedPracticeRoles.length
            : 0;
          var totalRoles = locRoleCount + pracRoleCount;
          result =
            $scope.activeLocation.name === location.Location.NameLine1 &&
            currentUser.userid === $scope.user.UserId &&
            totalRoles === 1;
        }
      }
      return result;
    };

    $scope.$watchCollection('user.$$locations', function (nv, ov) {
      var availableLocationsCount = $scope.locations.length;
      var selectedLocationsCount = 0;
      $scope.checkScheduleStatuses(nv);

      if (availableLocationsCount > 0) {
        angular.forEach($scope.locations, function (availableLocation) {
          angular.forEach($scope.user.$$locations, function (selectedLocation) {
            if (
              availableLocation.LocationId ==
              selectedLocation.Location.LocationId
            ) {
              selectedLocationsCount++;
            }
          });
        });
        if (availableLocationsCount == selectedLocationsCount) {
          $timeout(function () {
            $('#locationSelect>div>input').attr(
              'placeholder',
              'No locations available'
            );
          }, 500);
        } else {
          $timeout(function () {
            $('#locationSelect>div>input').attr('placeholder', 'Add Location');
          }, 500);
        }
      }

      if (nv && nv != ov) {
        $scope.validating = true;
        if ($scope.hasLocationErrors) {
          if ($scope.user.$$locations.length == 0) {
            $scope.hasLocationErrors = true;
          } else {
            $scope.hasLocationErrors = false;
          }
        }
        $scope.processLocationsToValidate($scope.user.$$locations);
        ctrl.validateStateLicenseByLocation();
      }
      $scope.validating = false;
    });

    ctrl.hasNewLocation = false;
    $scope.locationSelected = function (item) {
      var objLocation = {
        Location: {
          LocationId: item.LocationId,
          NameLine1: item.NameLine1,
          HasDeactivationDate: item.DeactivationTimeUtc != null,
          DeactivationTimeUtc: $filter('date')(
            item.DeactivationTimeUtc,
            'MM/dd/yyyy'
          ),
        },
        EnableSchedule: false,
        Roles: [],
      };

      objLocation.Location.IsLocationInactive = false;
      if (objLocation.Location.HasDeactivationDate) {
        var toCheck = moment(item.DeactivationTimeUtc).format('MM/DD/YYYY');
        var dateNow = moment().format('MM/DD/YYYY');

        if (
          moment(toCheck).isBefore(dateNow) ||
          moment(toCheck).isSame(dateNow)
        ) {
          objLocation.Location.IsLocationInactive = true;
        }
      }

      ctrl.hasNewLocation = true;
      $scope.user.$$locations.push(objLocation);
      ctrl.validateRoles();
    };

    ctrl.validateRoles = function () {
      $scope.validating = true;

      var nonRxRoles = $filter('filter')(
        $scope.user.$$selectedPracticeRoles,
        function (role) {
          return (
            role.RoleName.toLowerCase().trim() !==
            roleNames.RxUser.toLowerCase()
          );
        }
      );

      if (nonRxRoles.length == 0) {
        $scope.hasRoleErrors = false;
        angular.forEach($scope.user.$$locations, function (location) {
          if (!location.Roles || location.Roles.length == 0) {
            $scope.hasRoleErrors = true;
          }
        });
      } else {
        $scope.hasRoleErrors = false;
      }
      $scope.validating = false;
    };

    $scope.roleChanged = function (nv) {
      ctrl.validateRoles();
      ctrl.setDisplayRoleMessage();
    };

    $scope.practiceRoleAdded = function (practiceRole) {
      ctrl.validateRoles();
      ctrl.setDisplayRoleMessage();
    };

    $scope.practiceRoleRemoved = function (practiceRole) {};

    //#region Authorization

    // Create custom template to show "Details" link in dropdown items
    ctrl.createRoleDropdownTemplate = function (hasRoleDetailsAccess) {
      var highRoleTemplate = '';

      if (hasRoleDetailsAccess) {
        highRoleTemplate =
          '<a href="\\#/BusinessCenter/Roles/#:RoleId#/2" target="_blank">Details</a>';
      } else {
        highRoleTemplate =
          '<a title="' +
          localize.getLocalizedString(
            'User is not authorized to access this area'
          ) +
          '">Details</a></div>';
      }

      $scope.roleDropDownTemplate =
        '<div class="clearfix" id="template" type="text/x-kendo-template">' +
        '<div class="pull-left">#: RoleName #  </div>' +
        '<div class="pull-right">' +
        highRoleTemplate +
        '</div>';
    };

    //state license validation
    staticData.States().then(function (res) {
      $scope.originalStates = res.Value;
    });

    $scope.updatedLicenses = [];
    $scope.$on('sendLicensesToValidate', function (events, args) {
      if (args) {
        $scope.updatedLicenses = args;
      }
    });
    $scope.$on('validateNewLicenses', function (events, args) {
      if (args) {
        $scope.updatedLicenses = args;
        ctrl.validateStateLicenseByLocation();
      }
    });

    $scope.locationsToValidate = [];
    $scope.$on('sendLocationsToValidate', function (events, args) {
      if (args && args.length > 0) {
        $scope.processLocationsToValidate(args);
      } else {
        $scope.noStateLicense = false;
        $rootScope.$broadcast('stateLicenseValidation', '');
      }
    });

    $scope.processLocationsToValidate = function (locations) {
      $scope.locationsToValidate = [];
      _.forEach(locations, function (obj) {
        var filteredLoc = $filter('filter')(
          $scope.locations,
          { LocationId: obj.Location.LocationId },
          true
        );
        var loc = {
          LocationId: obj.Location.LocationId,
          NameLine1: obj.Location.NameLine1,
          Abbreviation: filteredLoc[0].State,
          Roles: obj.Roles,
        };

        $scope.locationsToValidate.push(loc);
      });

      if (ctrl.hasNewLocation) {
        ctrl.validateStateLicenseByLocation();
      }
    };

    $scope.noStateLicense = false;
    $scope.isProvider = false;
    $scope.CheckAssigenedStateLicense = function (locationId) {
      var objLoc = $filter('filter')(
        $scope.locations,
        { LocationId: locationId },
        true
      )[0];
      var strResult = '';
      if (
        $filter('filter')(
          $scope.updatedLicenses,
          { StateAbbreviation: objLoc.State },
          true
        ).length === 0
      ) {
        strResult = objLoc.State;
        $scope.noStateLicense = true;
      } else if (
        $filter('filter')(
          $scope.updatedLicenses,
          { StateAbbreviation: objLoc.State },
          true
        )[0].ObjectState == 'Delete'
      ) {
        strResult = objLoc.State;
        $scope.noStateLicense = true;
      }
      return strResult;
    };

    ctrl.validatedStates = [];
    ctrl.validateStateLicenseByLocation = function () {
      ctrl.validatedStates = [];
      $scope.noStateLicense = false;
      $scope.needLicenseStates = '';
      _.forEach($scope.locationsToValidate, function (obj) {
        var roleFilter = $filter('filter')(obj.Roles, {
          RoleName: 'Practice Admi',
        });
        if (roleFilter && roleFilter.length === 0) {
          var stateResult = $scope.CheckAssigenedStateLicense(obj.LocationId);
          if (stateResult !== '') {
            if (ctrl.validatedStates.length > 0) {
              if (
                $filter('filter')(
                  ctrl.validatedStates,
                  { StateAbbreviation: stateResult },
                  true
                ).length === 0
              ) {
                ctrl.validatedStates.push({ StateAbbreviation: stateResult });
                $scope.needLicenseStates += stateResult + ', ';
              }
            } else {
              ctrl.validatedStates.push({ StateAbbreviation: stateResult });
              $scope.needLicenseStates += stateResult + ', ';
            }
          }
        }
      });
      if ($scope.needLicenseStates !== '') {
        $scope.needLicenseStates = $scope.needLicenseStates
          .toString()
          .slice(0, -2);
      }

      var valResult =
        $scope.needLicenseStates === ''
          ? ''
          : 'Please add a State License for ' + $scope.needLicenseStates;
      $rootScope.$broadcast('stateLicenseValidation', valResult);
    };

    //state license validation end region

    // Get all locations
    ctrl.getLocations = function () {
      $scope.locationsLoading = true;
      locationServices.getPermittedLocations(
        { actionId: amfaInfo['plapi-user-usrrol-read'].ActionId },
        ctrl.getLocationSuccess,
        ctrl.getLocationFailure
      );
    };

    ctrl.getLocationSuccess = function (res) {
      $scope.locations = ctrl.groupLocations(res.Value);

      if ($scope.user.UserId) {
        if ($scope.user.IsActive) {
          //get assigned locations
          userServices.UserScheduleLocation.get(
            { Id: $scope.user.UserId },
            $scope.getSelectedLocationsSuccess,
            $scope.getSelectedLocationsFailure
          );

          // gets practice roles for user if logged in user has permissions, handles 403 if not
          rolesFactory
            .UserPracticeRoles($scope.user.UserId)
            .then(function (res) {
              ctrl.getUserPracticeRolesSuccess(res.Result);
            });

          $scope.user.$$isOriginalInactive = false;
        } else {
          //get roles for inactive user
          userServices.UserScheduleLocation.getInactiveUserAssignedLocations(
            { Id: $scope.user.UserId },
            $scope.getInactiveUserAssignedLocationsSuccess,
            $scope.getSelectedLocationsFailure
          );
        }
      }

      $scope.locationsLoading = false;
    };

    $scope.$watch(
      'user.$$originalUserScheduleLocations',
      function (nv, ov) {
        if ($scope.user.$$originalUserScheduleLocations) {
          $scope.originalAssignedRoles = $scope.user.$$locations;

          if ($scope.user.$$locations.length > 0) {
            $scope.originalAssignedRoles = [];
            angular.forEach($scope.user.$$locations, function (loc) {
              $scope.originalAssignedRoles.push(loc);
            });
          }
        }
      },
      true
    );

    ctrl.addedLocs = [];
    ctrl.locToSwitch = [];
    ctrl.selectedLocToSwitch = [];
    ctrl.isOriginalInactive = false;
    $scope.$watch(
      'user.IsActive',
      function (nv) {
        if (ctrl.isOriginalInactive) {
          if (nv) {
            angular.forEach(
              $scope.user.$$retainedPracticeRoles,
              function (practiceRole) {
                var pRole = $filter('filter')(
                  $scope.user.$$selectedPracticeRoles,
                  { RoleId: practiceRole.RoleId },
                  true
                );
                if (pRole == null || pRole.length == 0) {
                  $scope.user.$$selectedPracticeRoles.push(practiceRole);
                }
              }
            );

            $scope.user.$$locations = $scope.originalAssignedRoles;
            $scope.user.$$selectedLocations = ctrl.addedLocs;
          } else {
            $scope.user.$$selectedPracticeRoles = [];
            $scope.user.$$locations = ctrl.locToSwitch;
            $scope.user.$$selectedLocations = ctrl.selectedLocToSwitch;
          }
        } else {
          $scope.originalAssignedRoles = $scope.user.$$locations;
        }
        $rootScope.$broadcast('setRxDisable', nv);
      },
      true
    );

    ctrl.setLocationDeactivationTimeProperties = function (objLocation) {
      var resLocation = {
        LocationId: objLocation.LocationId,
        NameLine1: objLocation.NameLine1,
        HasDeactivationDate: objLocation.DeactivationTimeUtc != null,
        DeactivationTimeUtc: $filter('date')(
          objLocation.DeactivationTimeUtc,
          'MM/dd/yyyy'
        ),
      };

      resLocation.IsLocationInactive = false;
      if (resLocation.HasDeactivationDate) {
        var toCheck = moment(objLocation.DeactivationTimeUtc).format(
          'MM/DD/YYYY'
        );
        var dateNow = moment().format('MM/DD/YYYY');

        if (
          moment(toCheck).isBefore(dateNow) ||
          moment(toCheck).isSame(dateNow)
        ) {
          resLocation.IsLocationInactive = true;
        }
      }
      return resLocation;
    };

    ctrl.setRoleProperties = function (objRole) {
      var resRole = {
        ApplicationId: objRole.ApplicationId,
        DataTag: objRole.DataTag,
        DateModified: objRole.DateModified,
        PracticeId: objRole.PracticeId,
        RoleDesc: objRole.RoleDesc,
        RoleId: objRole.RoleId,
        RoleName: objRole.RoleName,
        UserModified: objRole.UserModified,
      };
      return resRole;
    };

    $scope.getInactiveUserAssignedLocationsSuccess = function (res) {
      $scope.originalAssignedRoles = [];
      ctrl.addedLocs = [];
      ctrl.isOriginalInactive = true;
      $scope.user.$$isOriginalInactive = true;
      $scope.user.$$retainedRolesLocations = [];
      $scope.user.$$retainedPracticeRoles = [];

      ctrl.locToSwitch = $scope.user.$$locations;
      ctrl.selectedLocToSwitch = $scope.user.$$selectedLocations;

      $scope.assignRolesBySelection = 'practice';
      if (res.Value.UserRoleLocationInactiveDtos) {
        $scope.assignRolesBySelection = 'location';
        angular.forEach(
          res.Value.UserRoleLocationInactiveDtos,
          function (roleLoc) {
            if ($scope.originalAssignedRoles.length === 0) {
              var tempLocation =
                $filter('filter')(
                  $scope.locations,
                  { LocationId: roleLoc.LocationId },
                  true
                ).length > 0
                  ? $filter('filter')(
                      $scope.locations,
                      { LocationId: roleLoc.LocationId },
                      true
                    )[0]
                  : null;
              if (tempLocation) {
                var intLocation =
                  ctrl.setLocationDeactivationTimeProperties(tempLocation);
                var loc = {
                  Location: intLocation,
                  Roles: [],
                  $$LocationTooltip: '',
                  //$$hasAppointments: false,
                  EnableSchedule: false,
                };

                var listRole = $filter('filter')(
                  res.Value.UserRoleLocationInactiveDtos,
                  { LocationId: roleLoc.LocationId },
                  true
                );
                angular.forEach(listRole, function (objRole) {
                  loc.Roles.push(
                    ctrl.setRoleProperties(
                      $filter('filter')(
                        $scope.roles,
                        { RoleId: objRole.RoleId },
                        true
                      )[0]
                    )
                  );
                });

                $scope.originalAssignedRoles.push(loc);
                ctrl.addedLocs.push(tempLocation);
                ctrl.addedLocs.push(intLocation);
                $scope.user.$$retainedRolesLocations.push(loc);
              }
            } else if (
              $filter('filter')(
                ctrl.addedLocs,
                { LocationId: roleLoc.LocationId },
                true
              ).length === 0
            ) {
              var tempLocation = $filter('filter')(
                $scope.locations,
                { LocationId: roleLoc.LocationId },
                true
              )[0];
              var intLocation =
                ctrl.setLocationDeactivationTimeProperties(tempLocation);
              var loc = {
                Location: intLocation,
                Roles: [],
                $$LocationTooltip: '',
                //$$hasAppointments: false,
                EnableSchedule: false,
              };

              var listRole = $filter('filter')(
                res.Value.UserRoleLocationInactiveDtos,
                { LocationId: roleLoc.LocationId },
                true
              );
              angular.forEach(listRole, function (objRole) {
                loc.Roles.push(
                  ctrl.setRoleProperties(
                    $filter('filter')(
                      $scope.roles,
                      { RoleId: objRole.RoleId },
                      true
                    )[0]
                  )
                );
              });

              $scope.originalAssignedRoles.push(loc);
              ctrl.addedLocs.push(tempLocation);
              ctrl.addedLocs.push(intLocation);
              $scope.user.$$retainedRolesLocations.push(loc);
            }
          }
        );
      }
      if (res.Value.UserRolePracticeInactiveDtos) {
        //$scope.user.$$retainedPracticeRoles.push($filter('filter')($scope.roles, { RoleId: res.Value.UserRolePracticeInactiveDto.RoleId }, true)[0]);
        angular.forEach(
          res.Value.UserRolePracticeInactiveDtos,
          function (practiceRole) {
            $scope.user.$$retainedPracticeRoles.push(
              ctrl.setRoleProperties(
                $filter('filter')(
                  $scope.roles,
                  { RoleId: practiceRole.RoleId },
                  true
                )[0]
              )
            );
          }
        );
      }
    };

    ctrl.resLocs = [];
    ctrl.pendingInactiveLocs = [];
    ctrl.inactiveLocs = [];
    ctrl.groupLocations = function (locs) {
      ctrl.resLocs = [];
      ctrl.pendingInactiveLocs = [];
      ctrl.inactiveLocs = [];

      var dateNow = moment().format('MM/DD/YYYY');
      _.each(locs, function (obj) {
        if (obj.DeactivationTimeUtc) {
          var toCheck = moment(obj.DeactivationTimeUtc).format('MM/DD/YYYY');
          obj.NameLine1 = _.escape(
            obj.NameLine1 +
              ' (' +
              timeZoneFactory.GetTimeZoneAbbr(obj.Timezone) +
              ')'
          );
          obj.InactiveDate =
            '  -  ' + $filter('date')(obj.DeactivationTimeUtc, 'MM/dd/yyyy');

          if (
            moment(toCheck).isBefore(dateNow) ||
            moment(toCheck).isSame(dateNow)
          ) {
            obj.LocationStatus = 'Inactive';
            obj.SortOrder = 3;
            ctrl.inactiveLocs.push(obj);
          } else {
            obj.LocationStatus = 'Pending Inactive';
            obj.SortOrder = 2;
            ctrl.pendingInactiveLocs.push(obj);
          }
        } else {
          obj.NameLine1 = _.escape(
            obj.NameLine1 +
              ' (' +
              timeZoneFactory.GetTimeZoneAbbr(obj.Timezone) +
              ')'
          );
          obj.InactiveDate = '';
          obj.LocationStatus = 'Active';
          obj.SortOrder = 1;
          ctrl.resLocs.push(obj);
        }
      });
      ctrl.resLocs = $filter('orderBy')(ctrl.resLocs, 'NameLine1');
      ctrl.inactiveLocs = $filter('orderBy')(
        ctrl.inactiveLocs,
        'DeactivationTimeUtc',
        true
      );
      ctrl.pendingInactiveLocs = $filter('orderBy')(
        ctrl.pendingInactiveLocs,
        'DeactivationTimeUtc',
        false
      );

      _.each(ctrl.pendingInactiveLocs, function (obj) {
        ctrl.resLocs.push(obj);
      });
      _.each(ctrl.inactiveLocs, function (obj) {
        ctrl.resLocs.push(obj);
      });
      return ctrl.resLocs;
    };

    ctrl.getLocationFailure = function () {
      toastrFactory.error('Failed to retrieve locations', 'Error');
      $scope.locationsLoading = false;
    };

    ctrl.getLocations();

    // Check if logged in user has high role access
    ctrl.checkUserHasRoleDetailAccess = function () {
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

      // check AMFA access
      var hasApplicationReadAccess =
        patSecurityService.IsAuthorizedByAbbreviation('plapi-sec-app-read');
      var hasModuleReadAccess =
        patSecurityService.IsAuthorizedByAbbreviation('plapi-sec-mod-read');
      var hasFunctionReadAccess =
        patSecurityService.IsAuthorizedByAbbreviation('plapi-sec-fun-read');
      var hasActionReadAccess =
        patSecurityService.IsAuthorizedByAbbreviation('plapi-sec-act-read');

      $scope.hasHighRoleAccess =
        hasUserRoleReadAccess &&
        hasUserRoleCreateAccess &&
        hasUserRoleDeleteAccess;

      ctrl.hasRoleDetailsAccess =
        hasUserRoleReadAccess &&
        hasUserRoleCreateAccess &&
        hasUserRoleDeleteAccess &&
        hasRoleReadAccess &&
        hasApplicationReadAccess &&
        hasModuleReadAccess &&
        hasFunctionReadAccess &&
        hasActionReadAccess;

      ctrl.createRoleDropdownTemplate(ctrl.hasRoleDetailsAccess);
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

    // Check if logged in user has high role access
    ctrl.checkUserHasRoleDetailAccess();

    //#endregion

    // Get roles from server and load in dropdown list
    ctrl.getRoles = function () {
      if ($scope.hasHighRoleAccess) {
        var userContext = JSON.parse(sessionStorage.getItem('userContext'));
        var applicationId = userContext.Result.Application.ApplicationId;
        $scope.loggedInUserHasPracticeAccess =
          userContext.Result.Access[0] &&
          userContext.Result.Access[0].AccessLevel === 2
            ? true
            : false;
        userServices.Roles.get(
          { applicationId: applicationId },
          ctrl.rolesGetSuccess,
          ctrl.rolesGetFailure
        );
      }
    };

    // Success callback to handle successful response from server
    ctrl.getUserPracticeRolesSuccess = function (practiceRoles) {
      $scope.assignRolesBySelection = ctrl.isOriginalInactive
        ? $scope.assignRolesBySelection
        : 'location';
      if (practiceRoles) {
        // Save the original copy to compare against when saving
        $scope.user.$$originalSelectedPracticeRoles = practiceRoles;
        $scope.practiceRolesAreLoaded = true;
        ctrl.setRolesAreLoaded();
        if (practiceRoles && practiceRoles.length > 0) {
          angular.forEach(practiceRoles, function (practiceRole) {
            $scope.user.$$selectedPracticeRoles.push(practiceRole);
            if ($scope.rxRoleFilter(practiceRole)) {
              $scope.assignRolesBySelection = 'practice';
            }
          });
        }
      } else {
        $scope.practiceRolesAreLoaded = true;
        ctrl.setRolesAreLoaded();
      }
      $scope.user.$$originalAssignRolesBySelection =
        $scope.assignRolesBySelection;
      $scope.isLoading = false;
    };

    $scope.viewOptions = [
      {
        Name: 'By Location',
        Plural: 'By Locations',
      },
      {
        Name: 'All Locations',
        Plural: 'All Locations',
      },
    ];

    $scope.selectedView = $scope.viewOptions[0];

    $scope.selectView = function (view) {
      $scope.selectedView = view;
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
        $scope.practiceRoles = res.Result;
        ctrl.assignRolesBySelectionWatch(
          $scope.assignRolesBySelection,
          $scope.assignRolesBySelection
        );
      }
      $scope.isLoading = false;
    };

    $scope.getLocationRoles = function (objLocations) {
      angular.forEach(objLocations, function (location) {
        if (location.LocationId != 'All') {
          $scope.currentLocationId = location.LocationId;
          location.$$selectedLocationRoles = [];

          $timeout(function () {
            // Call to get the location based roles
            userServices.Roles.getUserRolesByLocation(
              { userId: $scope.user.UserId, locationId: location.LocationId },
              ctrl.getUserRolesByLocatonSuccess.bind(null, location),
              ctrl.getUserRolesByLocatonFailure
            );
          }, 100);
        }
      });
    };

    $scope.getSelectedLocationsSuccess = function (res) {
      if (res && res.Value.length > 0) {
        var selectedLocations = res.Value;
        $scope.user.$$originalUserScheduleLocations = angular.copy(res.Value);
        $scope.user.$$locations = [];

        angular.forEach(selectedLocations, function (location) {
          var fLocation = $filter('filter')(
            $scope.locations,
            { LocationId: location.LocationId },
            true
          );
          var filteredLocation = fLocation.length > 0 ? fLocation[0] : location;
          var objLocation = {
            Location: {
              LocationId: filteredLocation.LocationId,
              NameLine1: filteredLocation.NameLine1,
              HasDeactivationDate: filteredLocation.DeactivationTimeUtc != null,
              DeactivationTimeUtc: $filter('date')(
                filteredLocation.DeactivationTimeUtc,
                'MM/dd/yyyy'
              ),
            },
            EnableSchedule: true,
            Roles: [],
          };

          objLocation.Location.IsLocationInactive = false;
          if (objLocation.Location.HasDeactivationDate) {
            var toCheck = moment(
              objLocation.Location.DeactivationTimeUtc
            ).format('MM/DD/YYYY');
            var dateNow = moment().format('MM/DD/YYYY');

            if (
              moment(toCheck).isBefore(dateNow) ||
              moment(toCheck).isSame(dateNow)
            ) {
              objLocation.Location.IsLocationInactive = true;
            }
          }

          $scope.user.$$locations.push(objLocation);
          $scope.user.$$selectedLocations.push(location);

          var userOriginalAssignedLocation = $filter('filter')(
            $scope.user.$$originalUserScheduleLocations,
            { LocationId: location.LocationId },
            true
          )[0];
          userOriginalAssignedLocation.$$selectedLocationRoles = [];
          location.$$selectedLocationRoles = [];
          location.$$originalSelectedLocationRoles = [];
          $scope.user.$$selectedLocations.push(
            $filter('filter')(
              $scope.locations,
              { LocationId: location.LocationId },
              true
            )[0]
          );
        });

        $scope.getLocationRoles(selectedLocations);

        $scope.processLocationsToValidate($scope.user.$$locations);
        ctrl.validateStateLicenseByLocation();
      }
    };

    $scope.getSelectedLocationsFailure = function () {
      $scope.user.$$selectedLocations = [];
      toastrFactory.error(
        localize.getLocalizedString('{0} failed to load.', [
          'Selected Locations',
        ]),
        localize.getLocalizedString('Server Error')
      );
    };

    // Handle error response if roles could not be fetched from server
    ctrl.rolesGetFailure = function () {
      $scope.isLoading = false;
      toastrFactory.error(
        localize.getLocalizedString('{0} failed to load.', ['Roles']),
        localize.getLocalizedString('Server Error')
      );
    };

    // Get roles when directive is loaded
    ctrl.getRoles();
    ctrl.getUserRolesByLocatonSuccess = function (location, res) {
      if (location) {
        if (res && res.Result.length > 0) {
          var objLocationRole = {
            LocationId: location.LocationId,
            Roles: angular.copy(res.Result),
          };

          $scope.user.$$originalUserLocationRoles.push(objLocationRole);

          var findLocation = $filter('filter')(
            $scope.user.$$locations,
            { Location: { LocationId: location.LocationId } },
            true
          )[0];
          if (findLocation) {
            findLocation.Roles = res.Result;
          } else {
            var objLocation = {
              Location: {
                LocationId: location.LocationId,
                NameLine1: location.NameLine1,
                HasDeactivationDate: location.DeactivationTimeUtc != null,
                DeactivationTimeUtc: $filter('date')(
                  location.DeactivationTimeUtc,
                  'MM/dd/yyyy'
                ),
              },
              EnableSchedule: false,
              Roles: res.Result,
            };

            objLocation.Location.IsLocationInactive = false;
            if (objLocation.Location.HasDeactivationDate) {
              var toCheck = moment(location.DeactivationTimeUtc).format(
                'MM/DD/YYYY'
              );
              var dateNow = moment().format('MM/DD/YYYY');

              if (
                moment(toCheck).isBefore(dateNow) ||
                moment(toCheck).isSame(dateNow)
              ) {
                objLocation.Location.IsLocationInactive = true;
              }
            }

            $scope.user.$$locations.push(objLocation);
            $scope.user.$$selectedLocations.push(location);
          }
        }
      }
    };

    ctrl.getUserRolesByLocatonFailure = function () {
      toastrFactory.error('Failed to retrieve roles by location', 'Error');
    };

    // Remove functions for selected locations, location roles, and practice roles
    $scope.removeSelectedLocation = function (location) {
      var title = localize.getLocalizedString('Remove');
      var message = localize.getLocalizedString(
        'Removing this location will remove all associated roles. Are you sure you want to continue?'
      );
      var button1Text = localize.getLocalizedString('Yes');
      var button2Text = localize.getLocalizedString('No');
      modalFactory
        .ConfirmModal(title, message, button1Text, button2Text)
        .then($scope.confirmRemoveSelectedLocation.bind(null, location));
    };

    $scope.removeAllLocations = function () {
      var title = localize.getLocalizedString('Remove');
      var message = localize.getLocalizedString(
        'Removing "All Locations" will remove all associated roles. Are you sure you want to continue?'
      );
      var button1Text = localize.getLocalizedString('Yes');
      var button2Text = localize.getLocalizedString('No');
      modalFactory
        .ConfirmModal(title, message, button1Text, button2Text)
        .then($scope.confirmRemoveAllLocations);
    };

    $scope.confirmRemoveSelectedLocation = function (location) {
      $scope.user.$$locations.splice(
        $scope.user.$$locations.indexOf(location),
        1
      );

      //The original user selected locations might be in the list multiple times, so we splice each version.
      $filter('filter')($scope.user.$$selectedLocations, {
        LocationId: location.Location.LocationId,
      }).forEach(function (loc) {
        $scope.user.$$selectedLocations.splice(
          $scope.user.$$selectedLocations.indexOf(loc),
          1
        );
      });
      ctrl.validateRoles();
    };

    $scope.confirmRemoveAllLocations = function () {
      $scope.user.$$selectedPracticeRoles = [];
    };

    $scope.removeLocationRoles = function (role, location) {
      location.Roles.splice(location.Roles.indexOf(role), 1);
      ctrl.validateRoles();
      ctrl.setDisplayRoleMessage();
    };

    $scope.removePracticeRoles = function (role) {
      $scope.user.$$selectedPracticeRoles.splice(
        $scope.user.$$selectedPracticeRoles.indexOf(role),
        1
      );
      $scope.practiceRoleRemoved(role);
      ctrl.validateRoles();
      ctrl.setDisplayRoleMessage();
    };

    //#region rx access role

    // store the rx access role / add to roles as needed
    $scope.rxAccessRole = null;

    $scope.$watch('rxAccessRole', function (nv) {
      if ($scope.rxAccessRole) {
        $scope.rxAccessRole.$$isRxRole = true;
      }
    });

    // add / remove role based on rxRole
    $scope.$watch('user.RxUserType', function (nv, ov) {
      if (nv || nv === 0) {
        if (
          $scope.user.RxUserType === 1 ||
          $scope.user.RxUserType === 2 ||
          $scope.user.RxUserType === 3
        ) {
          if ($scope.rxAccessRole) {
            var rxRole = $filter('filter')(
              $scope.user.$$selectedPracticeRoles,
              function (role) {
                return !$scope.rxRoleFilter(role);
              }
            );
            if (!rxRole || rxRole.length == 0) {
              $scope.user.$$selectedPracticeRoles.push($scope.rxAccessRole);
            }
          }
        } else if ($scope.rxAccessRole) {
          var index = listHelper.findIndexByFieldValue(
            $scope.user.$$selectedPracticeRoles,
            'RoleId',
            $scope.rxAccessRole.RoleId
          );
          if (index > -1) {
            $scope.user.$$selectedPracticeRoles.splice(index, 1);
          }
        }
      }
    });

    $scope.rxRoleFilter = function (item) {
      if (item) {
        return item.RoleName.toLowerCase() === roleNames.RxUser.toLowerCase()
          ? false
          : true;
      }
      return true;
    };

    $scope.$watch('user.ProviderTypeId', function (nv) {
      if (nv === '4' || nv === 4) {
        angular.forEach($scope.user.$$locations, function (obj) {
          obj.EnableSchedule = false;
        });
        $scope.disableSchedule = true;
        $scope.isProvider = false;
      } else {
        $scope.disableSchedule = false;
        $scope.isProvider = true;
      }
    });
    // #endregion

    $scope.setupLocationDropdown = function () {
      $timeout(function () {
        //$('#locationSelect>div>input').attr("onkeydown", "return false");
        $('#locationSelect>div>input').attr(
          'style',
          'color:#D3D3D3; width:100%;'
        );
        //$('#locationSelect>div>input').val("Add Location");
        //$('#locationSelect>div>input').val("    Add Location        ▼");
      }, 600);
    };
    //$scope.setupLocationDropdown();

    // user crud has to be notified when all roles are loaded
    $scope.locationRolesAreLoaded = false;
    $scope.practiceRolesAreLoaded = false;
    ctrl.setRolesAreLoaded = function () {
      if ($scope.practiceRolesAreLoaded && $scope.locationRolesAreLoaded) {
        $timeout(function () {
          $scope.rolesStatus.Loaded = true;
        }, 1000);
      }
    };

    $scope.$watch(
      'user.$$selectedPracticeRoles',
      function (nv, ov) {
        if (nv && nv != ov) {
          $scope.practiceRolesAreLoaded = true;
          ctrl.setRolesAreLoaded();
          ctrl.setDisplayRoleMessage();
        }
      },
      true
    );

    $scope.$watch(
      'user.$$originalUserLocationRoles',
      function (nv, ov) {
        if (nv && nv != ov) {
          $scope.locationRolesAreLoaded = true;
          ctrl.setRolesAreLoaded();
        }
      },
      true
    );

    // Check the list of locations against the list of schedule locations to see if the loction can be removed from the user
    $scope.checkScheduleStatuses = function (locations) {
      if ($scope.user.$$scheduleStatuses && locations && locations.length > 0) {
        angular.forEach(locations, function (locationToCheck) {
          var item = listHelper.findItemByFieldValue(
            $scope.user.$$scheduleStatuses,
            'LocationId',
            locationToCheck.Location.LocationId
          );
          if (item) {
            if (
              item != null &&
              (item.HasProviderAppointments || item.HasProviderRoomOccurrences)
            ) {
              locationToCheck.$$hasAppointmentsTooltip =
                localize.getLocalizedString(
                  '{0} can not be removed because this {1} has scheduled hours and/or scheduled appointments.',
                  ['Location', 'provider']
                );
              locationToCheck.$$hasAppointments = true;
            } else {
              locationToCheck.$$hasAppointmentsTooltip =
                locationToCheck.$$LocationTooltip;
              locationToCheck.$$hasAppointments = false;
            }
          }
        });
      }
    };

    $scope.displayRolesChangedMessage = false;
    $scope.displayPracticeRolesChangedMessage = false;
    // display roles changed message if the roles don't match the original ones for this user
    ctrl.setDisplayRoleMessage = function () {
      $scope.displayRolesChangedMessage = false;
      $scope.displayPracticeRolesChangedMessage = false;
      // compare original location roles to user roles if location roles have changed, display the message
      _.forEach($scope.user.$$locations, function (location) {
        var userLocationRoleKeys = _.map(location.Roles, 'RoleId');
        var originalLocation = _.find(
          $scope.user.$$originalUserLocationRoles,
          function (loc) {
            return loc.LocationId === location.Location.LocationId;
          }
        );
        var userOriginalLocationRoleKeys = _.map(
          originalLocation.Roles,
          'RoleId'
        );
        $scope.displayRolesChangedMessage = !_.isEqual(
          userOriginalLocationRoleKeys,
          userLocationRoleKeys
        )
          ? true
          : $scope.displayRolesChangedMessage;
      });

      // if practice roles other than rx roles have changed, display the message
      // filter out rx roles from both before comparing
      var selectedPracticeRoles = _.filter(
        $scope.user.$$selectedPracticeRoles,
        function (role) {
          return role.RoleName.toLowerCase() !== roleNames.RxUser.toLowerCase();
        }
      );
      var originalPracticeRoles = _.filter(
        $scope.user.$$originalSelectedPracticeRoles,
        function (role) {
          return role.RoleName.toLowerCase() !== roleNames.RxUser.toLowerCase();
        }
      );
      var userPracticeRoleKeys = _.map(selectedPracticeRoles, 'RoleId');
      var userOriginalPracticeRoleKeys = _.map(originalPracticeRoles, 'RoleId');

      $scope.displayPracticeRolesChangedMessage = !_.isEqual(
        userOriginalPracticeRoleKeys,
        userPracticeRoleKeys
      )
        ? true
        : $scope.displayPracticeRolesChangedMessage;
    };
  },
]);
