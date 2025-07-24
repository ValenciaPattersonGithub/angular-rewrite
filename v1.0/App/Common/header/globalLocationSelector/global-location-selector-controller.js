'use strict';

angular.module('Soar.Common').controller('GlobalLocationSelectorController', [
  '$scope',
  'toastrFactory',
  'TimeZoneFactory',
  '$filter',
  'locationService',
  'LocationServices',
  '$rootScope',
  'Page',
  '$injector',
  function (
    $scope,
    toastrFactory,
    timeZoneFactory,
    $filter,
    locationService,
    locationServices,
    $rootScope,
    Page,
    $injector
  ) {
    var ctrl = this;
    ctrl.groupLocations = function (locs) {
      ctrl.resLocs = [];
      ctrl.pendingInactiveLocs = [];
      ctrl.inactiveLocs = [];

      var dateNow = moment().format('MM/DD/YYYY');
      _.each(locs, function (obj) {
        if (obj.deactivationTimeUtc) {
          var toCheck = moment(obj.deactivationTimeUtc).format('MM/DD/YYYY');
          obj.name =
            obj.name +
            ' (' +
            timeZoneFactory.GetTimeZoneAbbr(obj.timezone) +
            ')' +
            ' - ' +
            toCheck;

          if (
            moment(toCheck).isBefore(dateNow) ||
            moment(toCheck).isSame(dateNow)
          ) {
            obj.status = 'Inactive';
            obj.sort = 3;
            ctrl.inactiveLocs.push(obj);
          } else {
            obj.status = 'Pending Inactive';
            obj.sort = 2;
            ctrl.pendingInactiveLocs.push(obj);
          }
        } else {
          obj.name =
            obj.name +
            ' (' +
            timeZoneFactory.GetTimeZoneAbbr(obj.timezone) +
            ')';
          obj.status = 'Active';
          obj.sort = 1;
          ctrl.resLocs.push(obj);
        }
      });
      ctrl.resLocs = $filter('orderBy')(ctrl.resLocs, 'name');
      ctrl.pendingInactiveLocs = $filter('orderBy')(
        ctrl.pendingInactiveLocs,
        'deactivationTimeUtc',
        false
      );
      ctrl.inactiveLocs = $filter('orderBy')(
        ctrl.inactiveLocs,
        'deactivationTimeUtc',
        true
      );

      _.each(ctrl.pendingInactiveLocs, function (obj) {
        ctrl.resLocs.push(obj);
      });
      _.each(ctrl.inactiveLocs, function (obj) {
        ctrl.resLocs.push(obj);
      });
      return ctrl.resLocs;
    };

    ctrl.updateDisabledFlag = function (route) {
      $scope.disabled =
        route && route.data && route.data.disableLocationHeader ? true : false;
    };
    Page.AddRouteChangeSuccessEvent(ctrl.updateDisabledFlag);



    $scope.$on("patient-adj-modal-open", function(event, data) {
      $scope.disabled = data;
    });

    ctrl.getLocationSuccess = function (res) {
      if (res) {
        var locs = ctrl.groupLocations(res);
        $scope.activeLocationsSorted = $filter('filter')(
          locs,
          { status: 'Active' },
          true
        );
        $scope.pendingLocationsSorted = $filter('filter')(
          locs,
          { status: 'Pending Inactive' },
          true
        );
        $scope.inactiveLocationsSorted = $filter('filter')(
          locs,
          { status: 'Inactive' },
          true
        );
      }
    };

    ctrl.getlocationFailure = function () {
      toastrFactory.error('Failed to retrieve locations', 'Error');
    };

    ctrl.getLocationActivityLogSuccess = function () {};

    ctrl.getLocationActivityLogFailure = function () {};

    $scope.pickLocation = function (location) {

      // If the user tries to change the location while the paypage
      // modal is open, we need to block them and alert them why.
      // TODO: This is a temporary fix. What we really need to do is
      // register an event that is triggered when the paypage is opened.
      // Then, anywhere that we need to disable something, we can subscribe
      // to that event and do what we need to do.
      let isPaypageModalOpen = JSON.parse(sessionStorage.getItem('isPaypageModalOpen'));
      if (isPaypageModalOpen) {
        alert('You cannot change locations at this time.  Finish or cancel your current activity.');
        return;
      }

      var oldLocation = locationService.getCurrentLocation();
      locationService.selectLocation(location);
      locationServices
        .locationChangeActivityEvent({
          locationId: oldLocation.id,
          oldLocationName: oldLocation.name,
          newLocationName: location.name,
        })
        .$promise.then(
          ctrl.getLocationActivityLogSuccess,
          ctrl.getLocationActivityLogFailure
        );
      $scope.selectedLocationName = location.name;

      $scope.selectedLocation = angular.copy(location);
      locationService.showAppHeaderWarning(location.deactivationTimeUtc);
      // storing the selected location
      localStorage.setItem('selected-location', $scope.selectedLocationName);
      const patientRegistrationService = $injector.get(
        'PatientRegistrationService'
      );
      if (patientRegistrationService) {
        patientRegistrationService.setRegistrationEvent({
          eventtype: 6,
          data: location,
        });
      }
    };

    var selectedLocation = locationService.getCurrentLocation();
    if (selectedLocation) {
      $scope.selectedLocationName = selectedLocation.name;
      $scope.selectedLocation = angular.copy(selectedLocation);
      locationService.showAppHeaderWarning(
        selectedLocation.deactivationTimeUtc
      );
    } else {
      $scope.selectedLocationName = 'Select item';
    }

    function getLocations() {
      locationService
        .getCurrentPracticeLocations()
        .then(function (locations) {
          if ($scope.practicelocations) {
            $scope.practicelocations.length = 0;

            // order the list if need be.
            if ($scope.sorter !== undefined) {
              locations.sort($scope.sorter);
            }

            angular.forEach(locations, function (loc) {
              $scope.practicelocations.push(loc);
            });

            //get location ...
            $scope.selectedLocationName = $scope.practicelocations[0].name;
            sessionStorage.setItem(
              'userLocation',
              angular.toJson($scope.practicelocations[0])
            );
            sessionStorage.setItem(
              'activeLocations',
              angular.toJson($scope.practicelocations)
            );
            $rootScope.$broadcast('patCore:practiceAndLocationsLoaded');
            localStorage.setItem(
              'selected-location',
              $scope.selectedLocationName
            );
          } else {
            // order the list if need be.
            if ($scope.sorter !== undefined) {
              locations.sort($scope.sorter);
            }

            $scope.practicelocations = locations;

            // get location;
            $scope.selectedLocationName = $scope.practicelocations[0].name;
            sessionStorage.setItem(
              'userLocation',
              angular.toJson($scope.practicelocations[0])
            );
            sessionStorage.setItem(
              'activeLocations',
              angular.toJson($scope.practicelocations)
            );
            $rootScope.$broadcast('patCore:practiceAndLocationsLoaded');
          }
        })
        .catch(function () {
          $scope.selectedLocationName = 'Select a Practice';
        });
    }

    $scope.$on('update-locations-dropdown', function (events, args) {
      if (
        $scope.selectedLocation === null ||
        $scope.selectedLocation === 'undefined'
      ) {
        var currentLoc = locationService.getCurrentLocation();
        $scope.selectedLocation = angular.copy(currentLoc);
      }

      if (args.LocationId === $scope.selectedLocation.id) {
        $scope.selectedLocation.name = args.NameLine1;
        $scope.selectedLocation.deactivationTimeUtc = args.DeactivationTimeUtc;
        locationService.selectLocation($scope.selectedLocation);
        locationService.showAppHeaderWarning(args.DeactivationTimeUtc);
      }
      getLocations();
    });

    $scope.$on('patCore:load-location-display', function (event, args) {
      var activeLocations = locationService.getActiveLocations();
      if (activeLocations) {
        $scope.practicelocations = activeLocations;
        ctrl.getLocationSuccess(activeLocations);
      }

      if (_.isNil($scope.selectedLocation)) {
        var currentLoc = locationService.getCurrentLocation();
        $scope.selectedLocation = angular.copy(currentLoc);
      }
    });
    var activeLocations = locationService.getActiveLocations();
    if (activeLocations !== null) {
      $scope.practicelocations = activeLocations;

      ctrl.getLocationSuccess(activeLocations);

      var currentLocation = locationService.getCurrentLocation();
      if (selectedLocation !== null) {
        $scope.selectedLocation = currentLocation;
      }
    }
  },
]);
