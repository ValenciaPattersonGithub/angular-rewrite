'use strict';

var app = angular.module('Soar.Patient').controller('PreferencesController', [
  '$scope',
  '$location',
  'localize',
  '$timeout',
  'StaticData',
  'toastrFactory',
  'UsersFactory',
  '$filter',
  'ListHelper',
  'SaveStates',
  'RolesFactory',
  'TimeZoneFactory',
  'RoleNames',
  'referenceDataService',
  'locationService',
  /**
   *
   * @param {*} $scope
   * @param {*} $location
   * @param {*} localize
   * @param {angular.ITimeoutService} $timeout
   * @param {*} staticData
   * @param {*} toastrFactory
   * @param {*} usersFactory
   * @param {*} $filter
   * @param {*} listHelper
   * @param {*} saveStates
   * @param {*} rolesFactory
   * @param {*} timeZoneFactory
   * @param {*} roleNames
   * @param {*} referenceDataService
   * @param {*} locationService
   */
  function (
    $scope,
    $location,
    localize,
    $timeout,
    staticData,
    toastrFactory,
    usersFactory,
    $filter,
    listHelper,
    saveStates,
    rolesFactory,
    timeZoneFactory,
    roleNames,
    referenceDataService,
    locationService
  ) {
    //#region properties
    var ctrl = this;
    $scope.loading = true;
    ctrl.loadingProviders = true;
    ctrl.loadingLocations = true;
    // default placeholder for dentists
    $scope.dentistPlaceHolder = localize.getLocalizedString(
      'No Preferred {0}',
      ['Dentist']
    );
    $scope.hygienistPlaceHolder = localize.getLocalizedString(
      'No Preferred {0}',
      ['Hygienist']
    );
    ctrl.filteredLocations = [];

    ctrl.initializeController = function () {
      $scope.loading = true;
      ctrl.getProviders();
      ctrl.getLocations();
    };

    ctrl.isLoading = function () {
      if (ctrl.loadingProviders === false && ctrl.loadingLocations === false) {
        $scope.loading = false;
        var userLocation = JSON.parse(sessionStorage.getItem('userLocation'));
        if (userLocation) {
          $scope.person.Profile.PreferredLocation = userLocation.id;
        }

        $scope.$on('patCore:initlocation', function () {
          var userLocation = JSON.parse(sessionStorage.getItem('userLocation'));
          $scope.person.Profile.PreferredLocation = userLocation.id;
          ctrl.updatePrimaryLocation(
            $scope.person.Profile.PreferredLocation,
            {}
          );
        });

        $scope.$watch('person.Profile.PreferredLocation', function (nv, ov) {
          if (nv != ov) {
            ctrl.updatePrimaryLocation(nv, ov);
            ctrl.clearPreferredProviders();
          }

          if (nv !== $scope.preferredLocationId) {
            $scope.preferredLocationId = nv;
          }
        });
        $scope.$watch('patientAlternateChosenLocation', function (nv, ov) {
          if (nv != ov && nv != undefined) {
            $scope.addUpdatePatientLocations(nv);
          }
        });

        $scope.watchSet = true;
      }
    };

    ctrl.clearPreferredProviders = function () {
      $scope.person.Profile.PreferredDentist = null;
      $scope.person.Profile.PreferredHygienist = null;
    };

    $scope.alternateOptions = [];
    $scope.patientAlternateChosenLocation = {};
    $scope.updateAlternateOptionsList = function () {
      var tempList = _.filter(ctrl.filteredLocations, function (location) {
        if (
          _.filter($scope.person.PatientLocations, function (used) {
            return location.LocationId == used.LocationId;
          }).length > 0
        ) {
          return false;
        } else {
          return true;
        }
      });
      $scope.alternateOptions = tempList;

      $scope.alternateOptionsDDL = {
        data: $scope.alternateOptions,
        group: 'GroupOrder',
        sort: { field: 'SortingIndex', dir: 'asc' },
      };
    };

    $scope.removePatientLocation = function (location) {
      var index = listHelper.findIndexByFieldValue(
        $scope.person.PatientLocations,
        'LocationId',
        location.LocationId
      );
      switch ($scope.person.PatientLocations[index].ObjectState) {
        case saveStates.Update:
        case saveStates.None:
          //if its an old primary, we set to alt in event of patient activity
          $scope.person.PatientLocations[index].IsPrimary = false;
          if ($scope.person.PatientLocations[index].PatientActivity) {
            $scope.person.PatientLocations[index].ObjectState =
              saveStates.Update;
          } else {
            $scope.person.PatientLocations[index].ObjectState =
              saveStates.Delete;
          }
          break;
        default:
          $scope.person.PatientLocations.splice(index, 1);
          break;
      }
      $scope.updateAlternateOptionsList();
    };
    $scope.addUpdatePatientLocations = function (location) {
      if (location != undefined) {
        var foundNew = _.filter($scope.person.PatientLocations, function (loc) {
          return loc.LocationId == location;
        });
        if (foundNew.length > 0) {
          foundNew[0].ObjectState =
            foundNew[0].ObjectState != saveStates.Add
              ? saveStates.Update
              : saveStates.Add;
        } else {
          $scope.person.PatientLocations.push(
            ctrl.createNewAlternateLocation(location)
          );
        }
      }
      $scope.updateAlternateOptionsList();
    };
    ctrl.updatePrimaryLocation = function (prefLocation, oldLocation) {
      if (prefLocation != undefined) {
        var foundNew = _.filter($scope.person.PatientLocations, function (loc) {
          return loc.LocationId == prefLocation;
        });
        if (foundNew.length > 0) {
          if (!foundNew[0].IsPrimary) {
            foundNew[0].IsPrimary = true;
            foundNew[0].ObjectState =
              foundNew[0].ObjectState != saveStates.Add
                ? saveStates.Update
                : saveStates.Add;
          }
        } else {
          $scope.person.PatientLocations.push(
            ctrl.createNewPrimaryLocation(prefLocation)
          );
        }
      }
      if (oldLocation != undefined) {
        var foundOld = _.filter($scope.person.PatientLocations, function (loc) {
          return loc.LocationId == oldLocation;
        });
        if (foundOld.length > 0) {
          //this handles creating an alt location if old primary has activity
          //also just removes in other situations
          $scope.removePatientLocation(foundOld[0]);
        }
      }
      $scope.updateAlternateOptionsList();
    };

    ctrl.createNewPrimaryLocation = function (id) {
      return {
        PatientId: $scope.person.Profile.PatientId
          ? $scope.person.Profile.PatientId
          : '',
        LocationId: '' + id,
        IsPrimary: true,
        ObjectState: saveStates.Add,
        PatientActivity: false,
        LocationName: ctrl.locationName(id),
      };
    };

    ctrl.createNewAlternateLocation = function (id) {
      return {
        PatientId: $scope.person.Profile.PatientId
          ? $scope.person.Profile.PatientId
          : '',
        LocationId: '' + id,
        IsPrimary: false,
        ObjectState: saveStates.Add,
        PatientActivity: false,
        LocationName: ctrl.locationName(id),
      };
    };

    ctrl.locationName = function (locId) {
      var loc = ctrl.lookupLocation(locId);
      if (loc) {
        if (loc.tzAbbr) {
          return loc.NameLine1 + ' (' + loc.tzAbbr + ')';
        } else {
          return loc.NameLine1;
        }
      } else {
        return '';
      }
    };

    ctrl.lookupLocation = function (locationId) {
      return listHelper.findItemByFieldValue(
        ctrl.filteredLocations,
        'LocationId',
        locationId
      );
    };

    // auto-selecting if there is only one in list
    ctrl.setDefaultIfOnlyOneExists = function (
      list,
      sourceProperty,
      propertyToSet
    ) {
      $timeout(function () {
        if (list.length === 1) {
          $scope.person.Profile[propertyToSet] = list[0][sourceProperty];
        } else if (propertyToSet === 'PreferredHygienist') {
          // For 'Preferred Hygienist', if there is more than one available provider (dentists & assistants will also display in this list)
          // automatically populate the hygienist, but the user may still choose a non-hygienist from the list
          var i = 0;
          var index;
          angular.forEach(list, function (item, $index) {
            if (item.ProviderTypeId === 2) {
              i++;
              index = $index;
            }
          });
          if (i === 1 && index >= 0) {
            $scope.person.Profile[propertyToSet] = list[index][sourceProperty];
          }
        }
      }, 100);
    };

    //#region   load Providers

    /**
     * Get providers.
     *
     * @returns {angular.IPromise}
     */
    ctrl.getProviders = function () {
      ctrl.loadingProviders = true;
      return referenceDataService
        .getData(referenceDataService.entityNames.users)
        .then(function (providers) {
          $scope.providerList = providers;
          ctrl.setDefaultIfOnlyOneExists(
            $scope.providerList,
            'UserId',
            'PreferredDentist'
          );
          ctrl.setDefaultIfOnlyOneExists(
            $scope.providerList,
            'UserId',
            'PreferredHygienist'
          );
          ctrl.loadingProviders = false;
          ctrl.isLoading();
          return providers;
        });
    };

    //#endregion

    //#region load locations

    /**
     * Get locations.
     *
     * @returns {angular.IPromise}
     */
    // ARWEN: #509747 This is dangerous. Should there be a limit or backoff strategy?
    ctrl.getLocations = function () {
      return referenceDataService
        .getData(referenceDataService.entityNames.locations)
        .then(function (locations) {
          if (!_.isEmpty(locations)) {
            return ctrl.locationServicesGetOnSuccess({ Value: locations });
          } else {
            return $timeout(function () {
              return ctrl.getLocations();
            }, 100);
          }
        });
    };

    ctrl.resLocs = [];
    ctrl.pendingInactiveLocs = [];
    ctrl.inactiveLocs = [];
    ctrl.groupLocations = function (locs) {
      ctrl.resLocs = [];
      ctrl.activeLocs = [];
      ctrl.pendingInactiveLocs = [];
      ctrl.inactiveLocs = [];

      var dateNow = moment().format('MM/DD/YYYY');
      _.each(locs, function (obj) {
        if (obj.DeactivationTimeUtc) {
          var toCheck = moment(obj.DeactivationTimeUtc).format('MM/DD/YYYY');
          obj.LocationNameWithDate =
            obj.NameLine1 +
            ' (' +
            timeZoneFactory.GetTimeZoneAbbr(obj.Timezone) +
            ')' +
            ' - ' +
            toCheck;

          if (
            moment(toCheck).isBefore(dateNow) ||
            moment(toCheck).isSame(dateNow)
          ) {
            obj.LocationStatus = 'Inactive';
            obj.GroupOrder = 3;
            ctrl.inactiveLocs.push(obj);
          } else {
            obj.LocationStatus = 'Pending Inactive';
            obj.GroupOrder = 2;
            ctrl.pendingInactiveLocs.push(obj);
          }
        } else {
          obj.LocationNameWithDate =
            obj.NameLine1 +
            ' (' +
            timeZoneFactory.GetTimeZoneAbbr(obj.Timezone) +
            ')';
          obj.LocationStatus = 'Active';
          obj.GroupOrder = 1;
          ctrl.activeLocs.push(obj);
        }
      });
      ctrl.activeLocs = $filter('orderBy')(ctrl.activeLocs, 'NameLine1');
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

      var ctrIndex = 1;
      _.each(ctrl.activeLocs, function (obj) {
        obj.SortingIndex = ctrIndex;
        ctrl.resLocs.push(obj);
        ctrIndex++;
      });
      _.each(ctrl.pendingInactiveLocs, function (obj) {
        obj.SortingIndex = ctrIndex;
        ctrl.resLocs.push(obj);
        ctrIndex++;
      });
      _.each(ctrl.inactiveLocs, function (obj) {
        obj.SortingIndex = ctrIndex;
        ctrl.resLocs.push(obj);
        ctrIndex++;
      });
      return ctrl.resLocs;
    };

    // filter full location list by this users locations
    ctrl.filterLocationsByUserLocations = function (
      allLocations,
      userLocations
    ) {
      // list of location ids for the user
      var userLocationIds = userLocations.map(location => location.id);
      return allLocations.filter(function (location) {
        return userLocationIds.indexOf(location.LocationId) !== -1;
      });
    };

    // filter all locations to locations user has access,group and load locationsDDL
    ctrl.filterLocations = function (allLocations, userLocations) {
      // filter all locations to locations the user has access to
      var filteredLocations = ctrl.filterLocationsByUserLocations(
        allLocations,
        userLocations
      );
      // group locations
      ctrl.filteredLocations = ctrl.groupLocations(filteredLocations);

      if (ctrl.filteredLocations.length > 0) {
        $timeout(function () {
          var userLocation = JSON.parse(sessionStorage.getItem('userLocation'));
          if (userLocation) {
            $scope.person.Profile.PreferredLocation = userLocation.id;
            if (userLocation.id != undefined) {
              $scope.person.PatientLocations.push(
                ctrl.createNewPrimaryLocation(userLocation.id)
              );
            }
          }
        }, 1000);
      }

      if (!$scope.alternateOptions.length > 0) {
        $scope.updateAlternateOptionsList();
      }
      ctrl.isLoading();

      // dropdown list for locations
      $scope.locationsDDL = {
        data: ctrl.filteredLocations,
        group: 'GroupOrder',
        sort: { field: 'SortingIndex', dir: 'asc' },
      };
    };

    ctrl.locationServicesGetOnSuccess = function (res) {
      ctrl.loadingLocations = false;
      var allLocations = res.Value;
      // get list of locations for this user
      return locationService
        .getCurrentPracticeLocations()
        .then(function (userLocations) {
          ctrl.filterLocations(allLocations, userLocations);
        });
    };
    ctrl.locationServicesGetOnError = function () {
      ctrl.loadingLocations = false;
      ctrl.isLoading();
      toastrFactory.error(
        localize.getLocalizedString(
          'Failed to retrieve the list of {0}. Refresh the page to try again.',
          ['locations']
        ),
        localize.getLocalizedString('Error')
      );
    };

    //#endregion

    ctrl.initializeController();

    $scope.$watch('setFocusOnInput', function (nv, ov) {
      if (nv && nv != ov) {
        $scope.setFocusOnElement();
      }
    });

    //#region set focus

    // sets the focus on the first invalid input
    $scope.setFocusOnElement = function () {
      // reset focus trigger
      if ($scope.frmPreferences.inpLocation.$valid == false) {
        $timeout(function () {
          $($('#inpLocation .k-widget.k-dropdown').find('select')[0])
            .data('kendoDropDownList')
            .focus();
        });
        return true;
      }
      return false;
    };

    //#endregion
  },
]);
