angular
  .module('common.directives')
  .controller('AmfaBasedLocationSelectorController', [
    '$scope',
    '$filter',
    '$document',
    'patSecurityService',
    'toastrFactory',
    'LocationServices',
    '$timeout',
    'AmfaInfo',
    'TimeZoneFactory',
    function (
      $scope,
      $filter,
      $document,
      patSecurityService,
      toastrFactory,
      locationServices,
      $timeout,
      amfaInfo,
      timeZoneFactory
    ) {
      var ctrl = this;
      $scope.list = [];

      $scope.init = function () {
        if (amfaInfo[$scope.amfa]) {
          $scope.loading = true;
          locationServices.getPermittedLocations(
            { actionId: amfaInfo[$scope.amfa].ActionId },
            ctrl.getLocationsSuccess,
            ctrl.getLocationsFailure
          );
        }
      };

      ctrl.getLocationsSuccess = function (res) {
        $scope.list = [
          {
            LocationId: null,
            NameLine1: 'All Locations',
            Selected: false,
          },
        ];

        $scope.list = $scope.list.concat(res.Value);

        var dateNow = moment().format('MM/DD/YYYY');

        angular.forEach($scope.list, function (obj) {
          if (obj.DeactivationTimeUtc) {
            var toCheck = moment(obj.DeactivationTimeUtc).format('MM/DD/YYYY');
            if (
              moment(toCheck).isBefore(dateNow) ||
              moment(toCheck).isSame(dateNow)
            ) {
              obj.LocationStatus = 'Inactive';
              obj.SortOrder = 3;
            } else {
              obj.LocationStatus = 'Pending Inactive';
              obj.SortOrder = 2;
            }

            obj.NameLine1 =
              obj.NameLine1 +
              ' (' +
              timeZoneFactory.GetTimeZoneAbbr(obj.Timezone) +
              ')';
            obj.InactiveDate =
              '  -  ' + $filter('date')(obj.DeactivationTimeUtc, 'MM/dd/yyyy');
          } else {
            if (obj.LocationId) {
              obj.LocationStatus = 'Active';
              obj.NameLine1 =
                obj.NameLine1 +
                ' (' +
                timeZoneFactory.GetTimeZoneAbbr(obj.Timezone) +
                ')';
            } else {
              obj.LocationStatus = 'All Status';
            }

            obj.SortOrder = 1;
          }
        });

        var ofcLocation = sessionStorage.getItem('userLocation');
        if (ofcLocation) {
          var id = JSON.parse(ofcLocation).id;
          angular.forEach($scope.list, function (location) {
            location.Selected = location.LocationId === id;
          });
        }
        $scope.loading = false;
        if ($scope.onLoadCompleteFn) {
          $timeout(function () {
            $scope.onLoadCompleteFn();
          });
        }
      };

      ctrl.getLocationsFailure = function () {
        $scope.loading = false;
        toastrFactory.error('Failed to retrieve locations', 'Error');
      };

      $scope.removeLocation = function (location) {
        if (!$scope.msDisabled) {
          location.Selected = false;
          if ($scope.onBlurFn) {
            $timeout(function () {
              $scope.onBlurFn();
            });
          }
        }
      };

      $scope.init();
    },
  ]);
