'use strict';

var app = angular.module('Soar.BusinessCenter');
var userLocationSetupCrudController = app.controller(
  'UserLocationSetupCrudController',
  [
    '$scope',
    'referenceDataService',
    'toastrFactory',
    '$filter',
    'ModalFactory',
    'localize',
    'patSecurityService',
    'user',
    'providerTypes',
    'roles',
    'userRoles',
    '$uibModalInstance',
    'availableLocations',
    'userLocationSetup',
    'RoleNames',
    'addUserLocationSetupCallback',
    'SaveStates',
    'UserLocationsSetupFactory',
    'FeatureService',

    function (
      $scope,
      referenceDataService,
      toastrFactory,
      $filter,
      modalFactory,
      localize,
      patSecurityService,
      user,
      providerTypes,
      roles,
      userRoles,
      $uibModalInstance,
      availableLocations,
      userLocationSetup,
      roleNames,
      addUserLocationSetupCallback,
      saveStates,
      userLocationsSetupFactory,
      featureService
    ) {
      var ctrl = this;
      // user this to determine whether user has already affirmed subscription
      ctrl.affirmedSubscription = false;

      // options for employee status
      $scope.employeeStatusOptions = [];
      $scope.employeeStatusOptions.push({
        Value: '1',
        Name: localize.getLocalizedString('Part Time'),
      });
      $scope.employeeStatusOptions.push({
        Value: '2',
        Name: localize.getLocalizedString('Full Time'),
      });
      $scope.providerOnClaimsSearchTerm = '';
      $scope.availableRoles = [];
      $scope.userLocationRoles = { item: [] };

      ctrl.$onInit = function () {
        $scope.formIsValid = false;
        $scope.dataHasChanged = false;

        // load all of the dependancies we need to add a userLocationSetup
        $scope.user = user;
        $scope.availableLocations = availableLocations;
        $scope.filteredLocations = _.cloneDeep(availableLocations);
        $scope.userLocationSetup = _.cloneDeep(userLocationSetup);
        // create backup for comparison
        ctrl.userLocationSetupBackup = _.cloneDeep(userLocationSetup);
        ctrl.roles = roles;
        ctrl.userRoles = userRoles;
        ctrl.activeUsers = ctrl.getActiveUsers();
        $scope.filteredActiveProviders = _.cloneDeep(ctrl.activeUsers);
        $scope.providerTypes = providerTypes;
        // set roles that could be added to this user
        featureService.isEnabled('DevelopmentMode').then(function (res) {
          if (res) {
            $scope.availableRoles = _.filter(ctrl.roles, function (role) {
              return (
                role.RoleName.toLowerCase() !==
                  roleNames.RxUser.toLowerCase() &&
                role.RoleName.toLowerCase() !==
                  roleNames.PracticeAdmin.toLowerCase() &&
                role.RoleName.toLowerCase() !==
                  'Clinical Reporting'.toLowerCase() &&
                role.RoleName.toLowerCase() !==
                  'Managerial Reporting'.toLowerCase()
              );
            });
          }
        });

        ctrl.setAvailableRoles(ctrl.roles);

        // since we may be editing a user location that hasn't been saved check to see if a location has been added
        // if so, the location can still be modified
        if ($scope.userLocationSetup.$$Location) {
          $scope.searchLocation = $scope.userLocationSetup.$$Location.NameLine1;
        }

        // set providerOnClaimsSearchTerm based on current ProviderOnClaimsId
        if (!_.isNil($scope.userLocationSetup.ProviderOnClaimsId)) {
          $scope.providerOnClaimsSearchTerm =
            userLocationSetup.$$ProviderOnClaims;
        }

        if (
          $scope.userLocationSetup &&
          !_.isNil($scope.userLocationSetup.UserProviderSetupLocationId)
        ) {
          $scope.pageTitle = localize.getLocalizedString('Edit {0} ', [
            'Location',
          ]);
        } else {
          $scope.pageTitle = localize.getLocalizedString('Add {0} ', [
            'Location',
          ]);
        }
        $scope.editMode = _.isNil(
          $scope.userLocationSetup.UserProviderSetupLocationId
        )
          ? false
          : true;
        $scope.userLocationSetup.UserId = _.isNil($scope.user.UserId)
          ? null
          : $scope.user.UserId;

        if (
          $scope.editMode === false &&
          _.isNil($scope.userLocationSetup.ProviderTypeId)
        ) {
          $scope.userLocationSetup.ProviderTypeId = 4;
        }

        if (
          _.isNil($scope.userLocationSetup.ProviderTypeId) ||
          $scope.userLocationSetup.ProviderTypeId === 4
        ) {
          $scope.isProviderActive = false;
        } else {
          $scope.isProviderActive = true;
        }

        var undeletedRolesList = [];
        if (
          $scope.userLocationSetup.$$UserLocationRoles &&
          $scope.userLocationSetup.$$UserLocationRoles.length > 0
        ) {
          $scope.userLocationSetup.$$UserLocationRoles.forEach(function (role) {
            if (role.$$ObjectState != saveStates.Delete) {
              undeletedRolesList.push(role);
            }
          });
        }
        $scope.userLocationRoles.item = _.cloneDeep(undeletedRolesList);
      };

      // list of active users for providerOnClaims
      ctrl.getActiveUsers = function () {
        var users = referenceDataService.get(
          referenceDataService.entityNames.users
        );
        var activeUsers = _.filter(users, function (user) {
          return (
            user.IsActive &&
            user.ProviderTypeId !== 4 &&
            user.UserId !== $scope.user.UserId
          );
        });
        return activeUsers;
      };

      //#region location search

      $scope.searchLocation = '';
      $scope.clearLocation = function () {
        $scope.searchLocation = '';
        $scope.userLocationSetup.LocationId = null;
      };

      // if roles exist for selected location, add them to this userLocationSetup
      ctrl.setExistingUserLocationRoles = function () {
        if (!_.isNil($scope.userLocationSetup.LocationId)) {
          userLocationsSetupFactory.MergeLocationRolesData(
            [$scope.userLocationSetup],
            ctrl.userRoles
          );
        }
      };

      $scope.selectLocationResult = function (location) {
        $scope.searchLocation = location.NameLine1;
        $scope.userLocationSetup.LocationId = location.LocationId;
        ctrl.setExistingUserLocationRoles();
      };

      $scope.searchLocations = function (term) {
        if (term === '') {
          $scope.filteredLocations = $scope.availableLocations;
          return;
        }
        if (!_.isNil(term)) {
          var termEntry = term.toLowerCase();
          $scope.filteredLocations = _.filter(
            $scope.availableLocations,
            function (location) {
              return location.NameLine1.toLowerCase().indexOf(termEntry) !== -1;
            }
          );
        }
      };

      $scope.displayResult = function () {};

      //#endregion

      //#region provider search for ProviderOnClaims

      //#region providerTypeId

      // capture provider type change
      ctrl.changeProviderType = function (nv, ov) {
        if (_.isNil(nv) || _.isEmpty(nv) || nv === '4' || nv === 4) {
          // Not a provider
          $scope.showProviderOnClaims = false;
          $scope.userLocationSetup.ProviderQualifierType = 0;
          $scope.userLocationSetup.ProviderOnClaimsRelationship = 0;
          $scope.userLocationSetup.ProviderOnClaimsId = null;
          $scope.isProviderActive = false;
        } else {
          $scope.isProviderActive = true;
          if (nv !== ov) {
            $scope.userLocationSetup.ProviderOnClaimsRelationship = 1;
            $scope.userLocationSetup.ProviderOnClaimsId = null;
            if ($scope.userLocationSetup.ProviderQualifierType === 0) {
              $scope.userLocationSetup.ProviderQualifierType =
                ctrl.userLocationSetupBackup.ProviderQualifierType === 0
                  ? ($scope.userLocationSetup.ProviderQualifierType = 2)
                  : ctrl.userLocationSetupBackup.ProviderQualifierType;
            }
            if (
              $scope.editMode === false &&
              _.isNil($scope.userLocationSetup.ProviderQualifierType)
            ) {
              $scope.userLocationSetup.ProviderQualifierType = 2;
            }
          }
          // when a user is changed from Not a Provider to anything else, set the IsActive value to true
          if (ov === '4' || ov === 4) {
            $scope.userLocationSetup.IsActive = true;
          }
        }
      };

      // confirm subscription if a provider
      // revert change if no confirmation
      ctrl.confirmProviderTypeChangeSubscription = function (nv, ov) {
        if (!_.isNil(nv) && !_.isEmpty(nv) && nv !== '4') {
          var title = localize.getLocalizedString(
            'Notice - Monthly Subscription Fee Increase'
          );
          var message = localize.getLocalizedString(
            'Setting a user as a provider incurs an increase in the Practice monthly subscription fee. Please contact the Patterson Technology Center for details at (844) 426-2304.'
          );
          var button1Text = localize.getLocalizedString('Acknowledge');
          var button2Text = localize.getLocalizedString('Cancel');
          if ($scope.editMode === true) {
            // only show subscription message if changing from Not a provider to provider
            if (parseInt(nv) !== 4 && parseInt(ov) === 4) {
              modalFactory
                .ConfirmModal(title, message, button1Text, button2Text)
                .then(
                  function () {
                    ctrl.affirmedSubscription = true;
                  },
                  function () {
                    $scope.userLocationSetup.ProviderTypeId = ov;
                    $scope.userLocationSetup.ProviderQualifierType = 0;
                    $scope.isProviderActive = false;
                  }
                );
            }
          }
          if ($scope.editMode === false) {
            // only show subscription message if changing from Not a provider to provider
            if (parseInt(nv) !== 4 && ctrl.affirmedSubscription === false) {
              modalFactory
                .ConfirmModal(title, message, button1Text, button2Text)
                .then(
                  function () {
                    ctrl.affirmedSubscription = true;
                  },
                  function () {
                    $scope.userLocationSetup.ProviderTypeId = ov;
                    $scope.userLocationSetup.ProviderQualifierType = 0;
                    $scope.isProviderActive = false;
                  }
                );
            }
          }
        }
      };

      // NOTE cant change to Not a provider if you have scheduled appointments /provider room occurrences at this location
      ctrl.checkMustBeAProvider = function () {
        if (
          $scope.user.$$scheduleStatuses &&
          $scope.userLocationSetup.LocationId
        ) {
          // does this user have a scheduleStatus record for this location
          var scheduleStatusRecord = _.find(
            $scope.user.$$scheduleStatuses,
            function (record) {
              return record.LocationId === $scope.userLocationSetup.LocationId;
            }
          );
          if (scheduleStatusRecord) {
            if (
              scheduleStatusRecord.HasProviderAppointments ||
              scheduleStatusRecord.HasProviderRoomOccurrences
            ) {
              return true;
            }
          }
        }
        return false;
      };

      // NOTE cant change to Not a provider if you have scheduled appointments /provider room occurrences at this location
      ctrl.canChangeProvider = function (nv, ov) {
        if ($scope.editMode === true) {
          var mustBeAProvider = ctrl.checkMustBeAProvider();

          if (!_.isNil(nv) && !_.isEmpty(nv) && nv === '4' && mustBeAProvider) {
            var title = localize.getLocalizedString('Warning');
            var message = localize.getLocalizedString(
              'This {0} cannot be changed because he/she has scheduled hours and/or scheduled appointments.',
              ['provider']
            );
            var button1Text = localize.getLocalizedString('Close');
            modalFactory
              .ConfirmModal(title, message, button1Text)
              .then(function () {
                $scope.userLocationSetup.ProviderTypeId = ov;
              });
            return false;
          } else {
            return true;
          }
        } else {
          return true;
        }
      };

      // handle ProviderTypeId change
      $scope.$watch(
        'userLocationSetup.ProviderTypeId',
        function (nv, ov) {
          if (!_.isNil(nv) && !_.isEmpty(nv) && nv !== ov) {
            if (ctrl.canChangeProvider(nv, ov)) {
              ctrl.changeProviderType(nv, ov);
            }
            ctrl.confirmProviderTypeChangeSubscription(nv, ov);
          }
        },
        true
      );

      //#endregion

      //#region ProviderOnClaimsRelationship

      $scope.$watch(
        'userLocationSetup.ProviderOnClaimsRelationship',
        function (nv, ov) {
          if (nv == '1') {
            $scope.userLocationSetup.ProviderOnClaimsId = null;
            $scope.providerOnClaimsError = false;
          }

          if (nv != ov && ov == 2) {
            $scope.providerOnClaimsSearchTerm = '';
            $scope.disableProviderOnClaims = false;
          }
        }
      );

      // Region for providerOnClaims

      $scope.selectProviderResult = function (providerOnClaims) {
        $scope.providerOnClaimsSearchTerm =
          providerOnClaims.FirstName + ' ' + providerOnClaims.LastName;
        $scope.userLocationSetup.ProviderOnClaimsId = providerOnClaims.UserId;
        $scope.disableProviderOnClaims = true;
        $scope.providerOnClaimsError = false;
      };

      $scope.clearProviderClaimUser = function () {
        $scope.userLocationSetup.ProviderOnClaimsId = null;
        $scope.providerOnClaimsSearchTerm = '';
        $scope.disableProviderClaim = false;
        $scope.disableProviderOnClaims = false;
        $scope.providerOnClaimsError = true;
        $scope.filteredActiveProviders = _.cloneDeep(ctrl.activeUsers);
      };

      // Perform the search
      $scope.providerOnClaimsSearch = function (term) {
        if (term === '') {
          $scope.filteredActiveProviders = _.cloneDeep(ctrl.activeUsers);
          return;
        }
        if (!_.isNil(term)) {
          $scope.filteredActiveProviders = _.filter(
            ctrl.activeUsers,
            function (provider) {
              //return (location.NameLine1).toLowerCase().indexOf(termEntry) !== -1;
              return (
                provider.FirstName.toLowerCase().indexOf(
                  _.toLower(term).toLowerCase()
                ) !== -1 ||
                provider.LastName.toLowerCase().indexOf(
                  _.toLower(term).toLowerCase()
                ) !== -1
              );
            }
          );
        }
      };

      $scope.displayResults = function () {};

      ctrl.validateUserLocationSetup = function () {
        $scope.hasErrors = false;
        $scope.formIsValid = true;
        $scope.hasRoleErrors = false;
        $scope.noLocationError = false;
        $scope.providerOnClaimsError = false;

        // validate that user has at least one location role that is not marked as $$ObjectState.Delete if they have Access (user.IsActive = true).
        // If user.IsActive is false, they do not have access and therefore would not be required to have roles
        if (
          $scope.user.$$isPracticeAdmin === false &&
          $scope.user.IsActive === true
        ) {
          var activeUserLocationRoles = _.filter(
            $scope.userLocationSetup.$$UserLocationRoles,
            function (userLocationRole) {
              return (
                userLocationRole.$$ObjectState === saveStates.Add ||
                userLocationRole.$$ObjectState === saveStates.None
              );
            }
          );
          if (activeUserLocationRoles.length === 0) {
            $scope.hasRoleErrors = true;
            $scope.formIsValid = false;
          }
        }

        // validation for all users
        // provider type
        if (_.isNil($scope.userLocationSetup.ProviderTypeId)) {
          $scope.formIsValid = false;
          $scope.hasErrors = true;
        }

        // location id
        if (_.isNil($scope.userLocationSetup.LocationId)) {
          $scope.formIsValid = false;
          $scope.hasErrors = true;
        }

        // validation for providers
        if (parseInt($scope.userLocationSetup.ProviderTypeId) !== 4) {
          // ProviderQualifierType
          if (_.isNil($scope.userLocationSetup.ProviderQualifierType)) {
            $scope.formIsValid = false;
            $scope.hasErrors = true;
          }

          // ProviderOnClaimsId
          if (
            parseInt($scope.userLocationSetup.ProviderOnClaimsRelationship) ===
            2
          ) {
            if (
              _.isNil($scope.userLocationSetup.ProviderOnClaimsId) ||
              _.isEmpty($scope.userLocationSetup.ProviderOnClaimsId)
            ) {
              $scope.formIsValid = false;
              $scope.providerOnClaimsError = true;
            }
          }
        }
      };

      // set object state on edited record based on changes
      ctrl.setObjectState = function () {
        if ($scope.editMode === true) {
          if (
            !_.isEqual($scope.userLocationSetup, ctrl.userLocationSetupBackup)
          ) {
            $scope.userLocationSetup.ObjectState = saveStates.Update;
          }
        } else {
          $scope.userLocationSetup.ObjectState = saveStates.Add;
        }
      };

      $scope.saveUserLocationSetup = function (userLocationSetup) {
        // validate object before callback
        ctrl.validateUserLocationSetup();
        ctrl.setObjectState();
        if ($scope.formIsValid === true) {
          if (addUserLocationSetupCallback) {
            addUserLocationSetupCallback(userLocationSetup);
            $scope.close();
          }
        }
      };

      $scope.close = function () {
        // revert all changes
        $scope.userLocationSetup = _.cloneDeep(ctrl.userLocationSetupBackup);
        $scope.dataHasChanged = false;
        $uibModalInstance.close();
      };

      $scope.showMoreColors = false;
      $scope.showMore = function () {
        $scope.showMoreColors = !$scope.showMoreColors;
      };

      // confirm cancel if changes
      $scope.cancelChanges = function () {
        if ($scope.dataHasChanged === true) {
          modalFactory.CancelModal().then($scope.close, function () {});
        } else {
          $scope.close();
        }
      };

      //#region location roles

      $scope.addLocationRole = function (userRole) {
        if (userRole) {
          var matchingIndex = _.findIndex(
            $scope.userLocationSetup.$$UserLocationRoles,
            function (userLocationRole) {
              return userLocationRole.RoleId == userRole.RoleId;
            }
          );
          if (matchingIndex > -1) {
            $scope.userLocationSetup.$$UserLocationRoles[
              matchingIndex
            ].$$ObjectState = saveStates.Add;
          } else {
            var roleToAdd = _.cloneDeep(userRole);
            roleToAdd.$$ObjectState = saveStates.Add;
            $scope.userLocationSetup.$$UserLocationRoles.push(roleToAdd);
          }
          $scope.hasRoleErrors = false;

          $scope.dataHasChanged = true;
        }
      };

      $scope.removeRole = function (userRole) {
        var roleToRemoveIndex = _.findIndex(
          $scope.userLocationSetup.$$UserLocationRoles,
          function (userLocationRole) {
            return userLocationRole.RoleId == userRole.RoleId;
          }
        );
        var fromListRemoveIndex = _.findIndex(
          $scope.userLocationRoles.item,
          function (userLocationRole) {
            return userLocationRole.RoleId == userRole.RoleId;
          }
        );

        if (roleToRemoveIndex > -1) {
          $scope.userLocationSetup.$$UserLocationRoles[
            roleToRemoveIndex
          ].$$ObjectState = saveStates.Delete;
          $scope.dataHasChanged = true;
        }

        if (fromListRemoveIndex > -1) {
          $scope.userLocationRoles.item.splice(fromListRemoveIndex, 1);
        }
      };

      ctrl.setAvailableRoles = function () {
        $scope.availableRoles = _.filter(ctrl.roles, function (role) {
          return (
            role.RoleName.toLowerCase() !== roleNames.RxUser.toLowerCase() &&
            role.RoleName.toLowerCase() !==
              roleNames.PracticeAdmin.toLowerCase() &&
            role.RoleName.toLowerCase() !==
              'Clinical Reporting'.toLowerCase() &&
            role.RoleName.toLowerCase() !== 'Managerial Reporting'.toLowerCase()
          );
        });
      };

      $scope.$watch(
        'userLocationSetup.$$UserLocationRoles',
        function (nv, ov) {
          if (!_.isNil(nv) && !_.isNil(ov) && nv !== ov) {
            $scope.dataHasChanged = true;
          }
        },
        true
      );

      $scope.$watch(
        'userLocationRoles',
        function (nv, ov) {
          if (!_.isNil(nv) && !_.isNil(ov) && nv !== ov) {
            $scope.dataHasChanged = true;
          }
        },
        true
      );

      $scope.rxRoleFilter = function (item) {
        if (item) {
          return item.RoleName.toLowerCase() === roleNames.RxUser.toLowerCase()
            ? false
            : true;
        }
        return true;
      };

      $scope.deletedRolesFilter = function (item) {
        if (item) {
          return item.$$ObjectState === saveStates.Delete ? false : true;
        }
        return true;
      };

      $scope.$watch(
        'userLocationSetup',
        function (nv, ov) {
          if (!_.isNil(nv) && !_.isNil(ov) && nv !== ov) {
            $scope.dataHasChanged = true;
          }
          if (
            (parseInt(nv.ProviderQualifierType) === 0 &&
              parseInt(nv.ProviderTypeId) !== 4) ||
            (nv.ProviderQualifierType === '' && nv !== ov)
          ) {
            $scope.dataHasChanged = false;
          }
          if (nv.ProviderTypeId === '') {
            $scope.dataHasChanged = false;
          }
        },
        true
      );

      //#endregion
    },
  ]
);
