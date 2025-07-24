'use strict';

angular.module('common.controllers').controller('LocationsSelectorController', [
  '$scope',
  '$timeout',
  '$filter',
  '$rootScope',
  'localize',
  'toastrFactory',
  'ListHelper',
  'UsersFactory',
  'referenceDataService',
  'RolesFactory',
  function (
    $scope,
    $timeout,
    $filter,
    $rootScope,
    localize,
    toastrFactory,
    listHelper,
    usersFactory,
    referenceDataService,
    rolesFactory
  ) {
    var ctrl = this;

    $scope.userHasLocationAssignment = true;
    $scope.locationsDisabled = false;
    $scope.currentUserLocations = [];

    // set if value not supplied
    $scope.disableSelect = $scope.disableSelect ? $scope.disableSelect : false;

    // get current user location
    ctrl.getCurrentLocation = function () {
      var cachedLocation = JSON.parse(sessionStorage.getItem('userLocation'));
      $scope.currentLocation =
        typeof cachedLocation !== 'undefined' ? cachedLocation : null;
    };

    // push selected location to list from select option
    $scope.selectLocations = function (location) {
      if (!$scope.multiSelect) {
        // only one selected location
        $scope.selectedLocations = [];
      }
      $scope.selectedLocations.push(_.escape(location));
    };

    // set selected location based on current location
    ctrl.setSelectedLocation = function () {
      if ($scope.currentLocation && $scope.currentUserLocations) {
        var index = listHelper.findIndexByFieldValue(
          $scope.currentUserLocations,
          'LocationId',
          $scope.currentLocation.id
        );
        if (index > -1) {
          $scope.selectedLocations.push($scope.currentUserLocations[index]);
        }
      }
    };

    $scope.$watch('selectedLocations', function (nv, ov) {
      console.log(nv);
    });

    //#region locations

    //TODO change control to determine current locations based on amfa

    // get all locations for this user
    ctrl.getCurrentUserLocations = function () {
      var currentUser = $rootScope.patAuthContext.userInfo;

      // get all practice locations
      $scope.locations = referenceDataService.get(
        referenceDataService.entityNames.locations
      );

      // get practice roles for current user
      rolesFactory.UserPracticeRoles(currentUser.userid).then(function (res) {
        var userRoles = res.Result;
        if (userRoles.length > 0) {
          $scope.currentUserLocations = $scope.locations;
          // set current user current location as selected
          ctrl.setSelectedLocation();
        } else {
          // or if none get location roles for current user
          angular.forEach($scope.locations, function (location) {
            rolesFactory
              .UserLocationRoles(currentUser.userid, location.LocationId)
              .then(function (res) {
                var locationRoles = res.Result;
                // if user has roles add this location to user
                if (locationRoles.length > 0) {
                  $scope.currentUserLocations.push(location);
                  // set current user current location as selected
                  ctrl.setSelectedLocation();
                }
              });
          });
        }
      });
    };

    // on load
    ctrl.$onInit = function () {
      ctrl.getCurrentUserLocations();
      ctrl.getCurrentLocation();
    };
  },
]);
