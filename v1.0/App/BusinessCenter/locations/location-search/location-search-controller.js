'use strict';

angular.module('Soar.BusinessCenter').controller('LocationSearchController', [
  '$scope',
  '$routeParams',
  '$location',
  'localize',
  'toastrFactory',
  'ModalFactory',
  'patSecurityService',
  'LocationServices',
  'StaticData',
  '$filter',
  'ListHelper',
  '$timeout',
  'LocationIdentifierService',
  function (
    $scope,
    $routeParams,
    $location,
    localize,
    toastrFactory,
    modalFactory,
    patSecurityService,
    locationServices,
    staticData,
    $filter,
    listHelper,
    $timeout,
    locationIdentifierService
  ) {
    var ctrl = this;

    /** quick link to a location that was sent from another page*/
    ctrl.selectedLocationId = $routeParams.locationId;

    //#region Authorization
    ctrl.authViewAccess = function () {
      return patSecurityService.IsAuthorizedByAbbreviation(
        'soar-biz-bizloc-view'
      );
    };

    ctrl.authAccess = function () {
      $scope.hasViewAccess = ctrl.authViewAccess();

      if (!$scope.hasViewAccess) {
        toastrFactory.error(
          patSecurityService.generateMessage('soar-biz-bizloc-view'),
          'Not Authorized'
        );
        $location.path('/');
      }
    };
    ctrl.authAccess();
    //#endregion

    //#region Filter Locations
    $scope.filter = '';
    $scope.stateFilter = '';
    $scope.searchFilter = function (item) {
      //removes any dashes in scope property;
      var filter = $scope.filter.toLowerCase();
      var phoneFilter = $scope.filter.replace(/[/()\s-]/g, '');
      var checkPhones = phoneFilter.length > 0;

      $scope.setStateFilter(item, filter);
      if (
        (item.NameLine1 &&
          item.NameLine1.toLowerCase().indexOf(filter) != -1) ||
        (item.NameLine2 &&
          item.NameLine2.toLowerCase().indexOf(filter) != -1) ||
        (item.ZipCode && item.ZipCode.indexOf(filter) != -1) ||
        (item.City && item.City.toLowerCase().indexOf(filter) != -1) ||
        (item.State && item.State.toLowerCase().indexOf(filter) != -1) ||
        (item.StateName &&
          item.StateName.toLowerCase().indexOf(filter) != -1) ||
        (checkPhones &&
          item.PrimaryPhone &&
          item.PrimaryPhone.indexOf(phoneFilter) != -1) ||
        (checkPhones &&
          item.SecondaryPhone &&
          item.SecondaryPhone.indexOf(phoneFilter) != -1) ||
        filter.length == 0
      ) {
        return true;
      }

      return false;
    };

    // added to bold text of State if StateName or State matches
    $scope.setStateFilter = function (item, filter) {
      if (
        (item.StateName &&
          item.StateName.toLowerCase().indexOf(filter) != -1 &&
          filter.length != 0) ||
        (item.State &&
          item.State.toLowerCase().indexOf(filter) != -1 &&
          filter.length != 0)
      ) {
        $scope.stateFilter = item.State.toLowerCase();
      }
    };
    //#endregion

    //#region Get Locations from Service
    $scope.getLocations = function () {
      $scope.loading = true;
      locationServices.get(
        {},
        $scope.locationsGetSuccess,
        $scope.locationsGetFailure
      );
    };

    $scope.locationsGetSuccess = function (res) {
      $scope.loading = false;
      // alert landing page that loading is done;
      $scope.loadingLocations = false;
      $scope.locations = $filter('orderBy')(res.Value, [
        'NameLine1',
        'NameLine2',
      ]);
      $scope.setStateName();
      ctrl.setPercentageRate();

      var index = 0;
      if (ctrl.selectedLocationId) {
        index =
          ctrl.selectedLocationId > -1
            ? listHelper.findIndexByFieldValue(
                $scope.locations,
                'LocationId',
                ctrl.selectedLocationId
              )
            : ctrl.selectedLocationId;
      }

      $scope.selectedLocation =
        index >= 0 && $scope.locations.length > 0
          ? $scope.locations[index]
          : null;
      if ($scope.selectedLocation) {
        //$scope.selectedLocation.Timezone = 'Central Standard Time';
      }

      //ctrl.getLocationIdentifiers();
    };

    $scope.locationsGetFailure = function () {
      $scope.loading = false;
      $scope.loadingLocations = false;
      toastrFactory.error(
        localize.getLocalizedString('{0} {1}', [
          'Locations',
          'failed to load.',
        ]),
        localize.getLocalizedString('Server Error')
      );
    };

    ctrl.setPercentageRate = function () {
      angular.forEach($scope.locations, function (location) {
        if (location.SalesAndUseTaxRate != null) {
          location.SalesAndUseTaxRate = (
            location.SalesAndUseTaxRate * 100
          ).toFixed(3);
        }
        if (location.ProviderTaxRate) {
          location.ProviderTaxRate = (location.ProviderTaxRate * 100).toFixed(
            3
          );
        }
      });
    };

    //test
    //ctrl.getLocationIdentifiers = function () {
    //    locationIdentifierService.get($scope.locationIdentifiersGetSuccess, $scope.locationIdentifiersGetFailure);
    //};

    //$scope.locationIdentifiersGetSuccess = function (res) {
    //    $scope.loading = false;
    //    var result = [];
    //    $scope.identifierShow = true;
    //    $scope.locationIdentifiers = result;

    //    for (var i = 0; i < res.Value.length; i++) {
    //        var index = listHelper.findIndexByFieldValue($scope.selectedLocation.AdditionalIdentifiers, 'MasterLocationIdentifierId', res.Value[i].MasterLocationIdentifierId);
    //        result.push({ Name: res.Value[i].Name, MasterLocationIdentifierId: res.Value[i].MasterLocationIdentifierId, Value: index.Value });
    //    }

    //}

    //$scope.locationIdentifiersGetFailure = function () {
    //    $scope.loading = false;
    //    $scope.locationIdentifiers = [];
    //    toastrFactory.error(localize.getLocalizedString('Failed to retrieve the list of additional identifiers. Refresh the page to try again.'), localize.getLocalizedString('Error'));
    //};

    //test
    //#endregion

    $scope.getLocations();

    $scope.$watch('selectedLocation', function (nv, ov) {
      if (nv && nv != ov && nv.LocationId == null) {
        /** need to remove active class when user clicks add a location */
        $timeout(function () {
          ctrl.changeLocationUrl(-1);
        }, 100);
      } else if (ov && ov.LocationId == null && nv && nv != ov) {
        /** if user cancels out of add location we need to add active class to default location */
        ctrl.changeLocationUrl(nv.LocationId);
      } else if (
        nv &&
        nv.LocationId &&
        nv.LocationId == $scope.selectedLocation.LocationId
      ) {
        ctrl.changeLocationUrl(nv.LocationId);
      }
    });

    $scope.populateAdditionalIdentifiers = function () {
      for (
        var i = 0;
        i < $scope.selectedLocation.AdditionalIdentifiers.length;
        i++
      ) {
        var index = listHelper.findIndexByFieldValue(
          $scope.locationIdentifiers,
          'MasterLocationIdentifierId',
          $scope.selectedLocation.AdditionalIdentifiers[i]
            .MasterLocationIdentifierId
        );
        $scope.selectedLocation.AdditionalIdentifiers[i].Description =
          $scope.locationIdentifiers[index].Description;
      }
    };

    $scope.selectLocation = function (location, elemId) {
      if ($scope.hasChanges) {
        modalFactory.CancelModal().then(function () {
          ctrl.confirmCancel(location);
        });
      } else {
        ctrl.confirmCancel(location);
      }
    };

    ctrl.confirmCancel = function (location) {
      $scope.selectedLocation = location;
      if ($scope.selectedLocation) {
        //$scope.selectedLocation.Timezone = 'Central Standard Time';
      }
      ctrl.changeLocationUrl(location.LocationId);
    };

    ctrl.changeLocationUrl = function (locationId) {
      $location.replace();
      $location.url('?locationId=' + locationId);
      //$scope.populateAdditionalIdentifiers();
    };

    //#region stateList

    var statesPromise = staticData.States();

    // get states lists
    statesPromise.then(function (res) {
      $scope.stateList = res.Value;
    });

    // set the user department Name based on id
    $scope.setStateName = function () {
      statesPromise.then(function () {
        angular.forEach($scope.locations, function (location) {
          if (location.State) {
            location.StateName = '';
            var state = $filter('filter')($scope.stateList, {
              Abbreviation: location.State,
            });
            if (state[0]) {
              location.StateName = state[0].Name;
            }
          }
        });
      });
    };

    $scope.$watch('filter', function (nv, ov) {
      $scope.stateFilter = '';
    });

    // When editing is changed, reset the person object to backup
    $scope.$watch('locations.State', function (nv, ov) {
      if (nv && nv != ov) {
        $scope.setStateName();
      }
    });
    //#endregion

    $scope.checkLocationStatus = function (item) {
      var isLocActive = false;

      if (item.DeactivationTimeUtc) {
        isLocActive = true;

        var dateNow = moment().format('MM/DD/YYYY');
        var toCheck = moment(item.DeactivationTimeUtc).format('MM/DD/YYYY');

        if (
          moment(toCheck).isBefore(dateNow) ||
          moment(toCheck).isSame(dateNow)
        ) {
          item.StatusDisplay = 'Inactive as of ' + toCheck;
          item.IsPendingInactive = false;
        } else {
          item.StatusDisplay = 'Pending Inactive on ' + toCheck;
          item.IsPendingInactive = true;
        }
      }

      return isLocActive;
    };

    $scope.getTitle = function (item) {
      var title = item.NameLine2
        ? item.NameLine1 + ' ' + item.NameLine2
        : item.NameLine1;
      return title;
    };
  },
]);
