var app = angular.module('Soar.BusinessCenter');

app.controller('ServiceFeesByLocationController', [
  '$scope',
  '$uibModalInstance',
  '$filter',
  'referenceDataService',
  function ($scope, $uibModalInstance, $filter, referenceDataService) {
    var ctrl = this;

    $scope.locations = null;
    $scope.searchTerm = '';
    $scope.defaultFee = 0.0;

    $scope.data = $scope.data.ServiceCode;
    $scope.taxableServiceTypes = [
      { id: 1, label: 'Not A Taxable Service' },
      { id: 2, label: 'Provider' },
      { id: 3, label: 'Sales And Use' },
    ];

    ctrl.setDefaultFee = function () {
      if (
        $scope.data.Fee &&
        ($scope.data.Fee != '' ||
          $scope.data.Fee != null ||
          $scope.data.Fee != 'undefined')
      ) {
        $scope.defaultFee = $scope.data.Fee;
      } else {
        $scope.defaultFee = 0.0;
      }
    };
    //ctrl.setDefaultFee();

    ctrl.setLocationProperties = function (locations) {
      angular.forEach(locations, function (location) {
        var locationInfo = $filter('filter')($scope.data.LocationSpecificInfo, {
          LocationId: location.LocationId,
        });
        if (
          (angular.isArray(locationInfo) && locationInfo.length == 0) ||
          locationInfo == 'undefined'
        ) {
          locationInfo = null;
        }
        var taxableServiceTypeIdType = '';
        if (locationInfo != null) {
          // set the information for this location if any
          // get taxable service label
          taxableServiceTypeIdType = ctrl.getTaxableServiceTypeType(
            locationInfo[0].TaxableServiceTypeId
          );

          location.$$LocationOverrides = {
            $$FeeOverride: locationInfo[0].Fee,
            $$TaxableServiceTypeId: locationInfo[0].TaxableServiceTypeId,
            $$TaxableServiceTypeIdType: taxableServiceTypeIdType,
            $$DataTag: locationInfo[0].DataTag,
          };
        } else {
          // get taxable service label
          taxableServiceTypeIdType = ctrl.getTaxableServiceTypeType(
            $scope.data.TaxableServiceTypeId
          );
          // Add the object to hold the override values
          location.$$LocationOverrides = {
            $$FeeOverride: $scope.defaultFee,
            $$TaxableServiceTypeId: $scope.data.TaxableServiceTypeId,
            $$TaxableServiceTypeIdType: taxableServiceTypeIdType,
            $$DataTag: null,
          };
        }
      });
    };

    ctrl.getLocations = function () {
      $scope.locations = referenceDataService.get(
        referenceDataService.entityNames.locations
      );
      $scope.filteredLocations = $scope.locations;
      referenceDataService.setFeesForLocations(
        $scope.data,
        _.map($scope.locations, 'LocationId')
      );
      ctrl.setLocationProperties($scope.locations);
    };

    // cancel button handler
    $scope.cancel = function () {
      $uibModalInstance.close();
    };

    //#region search

    // Locations filter
    $scope.setLocationFilter = function (searchString) {
      searchString = searchString.toLowerCase();
      $scope.filteredLocations = [];
      angular.forEach($scope.locations, function (location) {
        if (location.NameLine1.toLowerCase().indexOf(searchString) != -1) {
          $scope.filteredLocations.push(location);
        }
      });
    };

    $scope.clearLocations = function () {
      $scope.searchTerm = null;
      $scope.filteredLocations = [];
      $scope.filteredLocations = $scope.locations;
    };

    ctrl.getTaxableServiceTypeType = function (taxableServiceTypeId) {
      taxableServiceTypeId = parseInt(taxableServiceTypeId);
      var type = $filter('filter')($scope.taxableServiceTypes, {
        id: taxableServiceTypeId,
      });
      return type && type.length > 0 ? type[0].label : '';
    };

    //#endregion

    ctrl.init = function () {
      ctrl.getLocations();
      ctrl.setDefaultFee();
    };
    ctrl.init();
  },
]);
