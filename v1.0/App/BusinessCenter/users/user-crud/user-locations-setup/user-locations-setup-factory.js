'use strict';
angular.module('Soar.BusinessCenter').factory('UserLocationsSetupFactory', [
  'UserServices',
  '$filter',
  'localize',
  '$q',
  'toastrFactory',
  'patSecurityService',
  'locationService',
  'ModalFactory',
  'LocationServices',
  'RoleNames',
  'AmfaInfo',
  'TimeZoneFactory',
  'SaveStates',
  'referenceDataService',
  function (
    userServices,
    $filter,
    localize,
    $q,
    toastrFactory,
    patSecurityService,
    locationService,
    modalFactory,
    locationServices,
    roleNames,
    amfaInfo,
    timeZoneFactory,
    saveStates,
    referenceDataService
  ) {
    var factory = {
      Access: getAccess,
      CompareRoles: compareRoles,
      ViewRoles: viewRoles,
      PermittedLocations: getPermittedLocations,
      UserLocationSetups: getUserLocationSetups,
      MergeLocationRolesData: getMergedLocationRolesData,
      MergePracticeRolesData: getMergedPracticeRolesData,
      MergeLocationData: getMergedLocationData,
      MergeUserData: getMergedUserData,
      UpdateUserLocationSetups: updateUserLocationSetups,
      AddUserLocationSetups: addUserLocationSetups,
      UserLocationSetupDto: getUserLocationSetupDto,
      SaveUserLocationSetups: saveUserLocationSetups,
      GroupLocations: getGroupedLocations,
      GetProvidersByUserLocationSetups: getProvidersByUserLocationSetups,
    };

    return factory;

    function getAccess() {}

    // Navigate to the view roles page
    function viewRoles() {
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
          resolve: {},
        })
        .result.then(function () {});
    }

    // Navigate to the view roles page
    function compareRoles() {
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
          resolve: {},
        })
        .result.then(function () {});
    }

    // This was originally in user-role
    // I'm actually not sure how it is used but am guessing it was necessary?
    function getGroupedLocations(locations) {
      var allLocations = [];
      var pendingInactiveLocations = [];
      var inactiveLocations = [];
      var groupedLocations = [];

      var dateNow = moment().format('MM/DD/YYYY');
      _.each(locations, function (location) {
        if (location.DeactivationTimeUtc) {
          var toCheck = moment(location.DeactivationTimeUtc).format(
            'MM/DD/YYYY'
          );
          location.NameLine1 =
            location.NameLine1 +
            ' (' +
            timeZoneFactory.GetTimeZoneAbbr(location.Timezone) +
            ')';
          location.InactiveDate =
            '  -  ' +
            $filter('date')(location.DeactivationTimeUtc, 'MM/dd/yyyy');

          if (
            moment(toCheck).isBefore(dateNow) ||
            moment(toCheck).isSame(dateNow)
          ) {
            location.LocationStatus = localize.getLocalizedString('Inactive');
            location.SortOrder = 3;
            inactiveLocations.push(location);
          } else {
            location.LocationStatus =
              localize.getLocalizedString('Pending Inactive');
            location.SortOrder = 2;
            pendingInactiveLocations.push(location);
          }
        } else {
          location.NameLine1 =
            location.NameLine1 +
            ' (' +
            timeZoneFactory.GetTimeZoneAbbr(location.Timezone) +
            ')';
          location.InactiveDate = '';
          location.LocationStatus = localize.getLocalizedString('Active');
          ('Active');
          location.SortOrder = 1;
          groupedLocations.push(location);
        }
      });
      allLocations = $filter('orderBy')(groupedLocations, 'NameLine1');
      inactiveLocations = $filter('orderBy')(
        inactiveLocations,
        'DeactivationTimeUtc',
        true
      );
      pendingInactiveLocations = $filter('orderBy')(
        pendingInactiveLocations,
        'DeactivationTimeUtc',
        false
      );

      _.each(pendingInactiveLocations, function (location) {
        allLocations.push(location);
      });
      _.each(inactiveLocations, function (location) {
        allLocations.push(location);
      });
      return allLocations;
    }

    // get permitted locations for the logged in user based on the action the user will be taking
    // in this case adding roles to a user
    // these are the only locations that a user can add roles to the user for
    function getPermittedLocations() {
      var defer = $q.defer();
      var promise = defer.promise;
      var actionIdParam = amfaInfo['plapi-user-usrrol-create'].ActionId;
      locationServices
        .getPermittedLocations({ actionId: actionIdParam })
        .$promise.then(
          function (res) {
            promise = $.extend(promise, { values: res.Value });
            defer.resolve(res);
          },
          function () {
            toastrFactory.error(
              localize.getLocalizedString(
                'Failed to retrieve {0}. Refresh the page to try again.',
                ['locations']
              ),
              localize.getLocalizedString('Server Error')
            );
          }
        );
      return promise;
    }

    // location setups need to succeed before updating roles so
    // queue these and return resolve
    function saveUserLocationSetups(userLocationSetups) {
      var defer = $q.defer();
      var promise = defer.promise;
      var saveActions = [];
      // update existing userLocationSetups
      var editedUserLocationSetups = _.filter(
        userLocationSetups,
        function (userLocationSetup) {
          return userLocationSetup.ObjectState === saveStates.Update;
        }
      );
      if (editedUserLocationSetups.length > 0) {
        saveActions.push(updateUserLocationSetups(editedUserLocationSetups));
      }

      // remove existing userLocationSetups with ObjectState=Delete
      var removeUserLocationSetups = _.filter(
        userLocationSetups,
        function (userLocationSetup) {
          return userLocationSetup.ObjectState === saveStates.Delete;
        }
      );
      if (removeUserLocationSetups.length > 0) {
        saveActions.push(deleteUserLocationSetups(removeUserLocationSetups));
      }

      // add new userSetupLocations
      var addedUserLocationSetups = _.filter(
        userLocationSetups,
        function (userLocationSetup) {
          return userLocationSetup.ObjectState === saveStates.Add;
        }
      );
      if (addedUserLocationSetups.length > 0) {
        saveActions.push(addUserLocationSetups(addedUserLocationSetups));
      }
      if (saveActions.length > 0) {
        $q.all(saveActions).then(function (res) {
          promise = $.extend(promise, { values: res.Value });
          defer.resolve(res);
        });
      } else {
        defer.resolve();
      }
      return promise;
    }

    function addUserLocationSetups(userLocationSetups) {
      var defer = $q.defer();
      var promise = defer.promise;
      userServices.UserLocationSetups.create(userLocationSetups).$promise.then(
        function (res) {
          promise = $.extend(promise, { values: res.Value });
          defer.resolve(res);
        },
        function (res) {
          toastrFactory.error(
            localize.getLocalizedString(
              'Failed to save the {0}. Refresh the page and try again.',
              ['User Location Setups']
            ),
            'Error'
          );
        }
      );
      return promise;
    }

    function updateUserLocationSetups(userLocationSetups) {
      var defer = $q.defer();
      var promise = defer.promise;
      userServices.UserLocationSetups.update(userLocationSetups).$promise.then(
        function (res) {
          promise = $.extend(promise, { values: res.Value });
          defer.resolve(res);
        },
        function (res) {
          toastrFactory.error(
            localize.getLocalizedString(
              'Failed to update the {0}. Refresh the page and try again.',
              ['User Location Setups']
            ),
            'Error'
          );
        }
      );
      return promise;
    }

    function deleteUserLocationSetups(userLocationSetups) {
      var defer = $q.defer();
      var promise = defer.promise;
      var userId = userLocationSetups[0].UserId;
      // list of LocationIds to be removed
      var removeLocationIds = userLocationSetups.map(
        userLocationSetup => userLocationSetup.LocationId
      );
      userServices.UserLocationSetups.delete(
        { userId: userId },
        removeLocationIds
      ).$promise.then(
        function (res) {
          promise = $.extend(promise, { values: res.Value });
          defer.resolve(res);
        },
        function (res) {
          toastrFactory.error(
            localize.getLocalizedString(
              'Failed to delete the {0}. Refresh the page and try again.',
              ['User Location Setups']
            ),
            'Error'
          );
        }
      );
      return promise;
    }

    function getUserLocationSetups(id) {
      var defer = $q.defer();
      var promise = defer.promise;
      userServices.UserLocationSetups.get({ userId: id }).$promise.then(
        function (res) {
          promise = $.extend(promise, { values: res.Value });
          defer.resolve(res);
        },
        function () {
          toastrFactory.error(
            localize.getLocalizedString(
              'Failed to retrieve {0}. Refresh the page to try again.',
              ['locations']
            ),
            localize.getLocalizedString('Server Error')
          );
        }
      );
      return promise;
    }

    // new UserLocationSetup
    function getUserLocationSetupDto() {
      return {
        $$ProviderOnClaims: '',
        $$ProviderQualifierTypeName: '',
        $$ProviderTypeName: null,
        $$UserLocationRoles: [],
        Color: null,
        LocationId: null,
        ObjectState: 'None',
        ProviderOnClaimsId: null,
        ProviderOnClaimsRelationship: 0,
        ProviderQualifierType: 0,
        ProviderTypeId: null,
        UserId: null,
        IsActive: true,
      };
    }

    function getMergedLocationRolesData(userLocationSetups, userRoles) {
      _.forEach(userRoles.LocationRoles, function (locationRoles, key) {
        var locationId = parseInt(key);
        // find the matching userLocationSetup
        var userLocationSetup = _.find(userLocationSetups, function (item) {
          return item.LocationId === locationId;
        });
        if (userLocationSetup) {
          // add this set of locationRoles to the userLocationSetup
          userLocationSetup.$$UserLocationRoles = locationRoles;
          // set objectState
          _.forEach(
            userLocationSetup.$$UserLocationRoles,
            function (userLocationRole) {
              userLocationRole.$$ObjectState = saveStates.None;
            }
          );
        }
      });
    }

    //TODO:// Below method is available in team-member-locations-setup.service.ts in angular
    function getMergedPracticeRolesData(userRoles, user) {
      // default user.$$isPracticeAdmin to false
      user.$$isPracticeAdmin = false;
      _.forEach(userRoles.PracticeRoles, function (practiceRoles, key) {
        var practiceRolesToDisplay = _.filter(practiceRoles, function (role) {
          return role.RoleName.toLowerCase() !== roleNames.RxUser.toLowerCase();
        });
        if (practiceRolesToDisplay.length > 0) {
          // if the user has practice roles other than rx, this is an admin
          user.$$isPracticeAdmin = true;
        }
        // practice roles exist for all current locations so add these to the user
        user.$$UserPracticeRoles = [];
        // add this set of practiceRoles to the userLocationSetup
        _.forEach(practiceRoles, function (practiceRole) {
          practiceRole.$$ObjectState = saveStates.None;
          user.$$UserPracticeRoles.push(practiceRole);
        });
      });
    }

    // set location data on userLocationSetup
    // set whether logged in user can edit this location
    function getMergedLocationData(
      userLocationSetups,
      locations,
      permittedLocations
    ) {
      _.forEach(userLocationSetups, function (userLocationSetup) {
        // set the location based on userLocationSetup.LocationId
        userLocationSetup.$$Location = {};
        var ofcLocation = _.find(locations, function (loc) {
          return loc.LocationId === userLocationSetup.LocationId;
        });
        if (ofcLocation) {
          userLocationSetup.$$Location = ofcLocation;
        }
        // set whether logged in user can edit this userLocationSetup
        userLocationSetup.$$CanEditLocation = false;
        var permittedLocation = _.find(permittedLocations, function (loc) {
          return loc.LocationId === userLocationSetup.LocationId;
        });
        if (permittedLocation) {
          userLocationSetup.$$CanEditLocation = true;
        }
      });
    }

    function getMergedUserData(userLocationSetups, users, providerTypes) {
      _.forEach(userLocationSetups, function (userLocationSetup) {
        userLocationSetup.$$ProviderOnClaims = null;
        userLocationSetup.$$ProviderTypeName = null;
        // set provider on claims name if ProviderOnClaimsRelationship set to 2 (Other)
        if (userLocationSetup.ProviderOnClaimsRelationship === 1) {
          userLocationSetup.$$ProviderOnClaims =
            localize.getLocalizedString('Self');
        }
        if (parseInt(userLocationSetup.ProviderOnClaimsRelationship) === 2) {
          var providerOnClaims = _.find(users, function (user) {
            return user.UserId === userLocationSetup.ProviderOnClaimsId;
          });
          if (providerOnClaims) {
            var formattedProviderOnClaims = $filter(
              'getDisplayNamePerBestPractice'
            )(providerOnClaims);
            userLocationSetup.$$ProviderOnClaims = formattedProviderOnClaims;
          }
        }
        // set provider type name
        var providerType = _.find(providerTypes, function (item) {
          return item.Id === userLocationSetup.ProviderTypeId;
        });
        if (providerType) {
          userLocationSetup.$$ProviderTypeName = providerType.Name;
        }
        // set employment status display
        userLocationSetup.$$ProviderQualifierTypeName = '';
        if (parseInt(userLocationSetup.ProviderQualifierType) === 2) {
          userLocationSetup.$$ProviderQualifierTypeName =
            localize.getLocalizedString('Full Time');
        }
        if (parseInt(userLocationSetup.ProviderQualifierType) === 1) {
          userLocationSetup.$$ProviderQualifierTypeName =
            localize.getLocalizedString('Part Time');
        }
      });
    }

    // returns a list of providers determined by their userLocationSetups
    function getProvidersByUserLocationSetups(locationId) {
      var filteredProviderList = [];
      // get provider list from referenceData
      var allProvidersList = referenceDataService.get(
        referenceDataService.entityNames.users
      );
      // filter list for providers for this location that are not 'Not a Provider'
      _.forEach(allProvidersList, function (provider) {
        var userLocationSetup = _.find(
          provider.Locations,
          function (userLocationSetup) {
            return userLocationSetup.LocationId === locationId;
          }
        );
        if (userLocationSetup && userLocationSetup.ProviderTypeId !== 4) {
          provider.UserLocationSetup = _.cloneDeep(userLocationSetup);
          filteredProviderList.push(provider);
        }
      });
      return filteredProviderList;
    }
  },
]);
