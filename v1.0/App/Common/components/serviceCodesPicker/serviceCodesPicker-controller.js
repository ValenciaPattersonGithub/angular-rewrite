'use strict';

angular
  .module('common.controllers')
  .controller('ServiceCodesPickerController', [
    '$scope',
    '$timeout',
    '$filter',
    '$rootScope',
    'localize',
    'toastrFactory',
    'patSecurityService',
    'referenceDataService',
    function (
      $scope,
      $timeout,
      $filter,
      $rootScope,
      localize,
      toastrFactory,
      patSecurityService,
      referenceDataService
    ) {
      var ctrl = this;
      $scope.orderBy = {
        field: '',
        asc: true,
      };
      $scope.serviceCodes = [];
      $scope.selectedServiceCodes = [];
      $scope.loadingServices = false;
      $scope.filteringServices = false;
      $scope.filteringMessageNoResults = localize.getLocalizedString(
        'There are no {0} that match the filter.',
        ['service codes']
      );
      $scope.loadingMessageNoResults = localize.getLocalizedString(
        'There are no {0}.',
        ['service codes']
      );
      $scope.disableQuickAdd = false;

      $scope.serviceCodes = referenceDataService.get(
        referenceDataService.entityNames.serviceCodes
      );

      // function to apply orderBy functionality on grid
      $scope.changeSortingForGrid = function (field) {
        var asc = $scope.orderBy.field === field ? !$scope.orderBy.asc : true;
        $scope.orderBy = { field: field, asc: asc };
      };

      $scope.quickAddStatus = function () {
        return $scope.disableQuickAdd;
      };

      $scope.selectedService = function (checked, serviceCode) {
        if (checked) {
          $scope.selectedServiceCodes.push(serviceCode);
        } else {
          $scope.selectedServiceCodes.splice(
            $scope.selectedServiceCodes.indexOf(serviceCode),
            1
          );
        }
        if ($scope.selectedServiceCodes.length > 0) {
          $scope.disableQuickAdd = true;
        } else {
          $scope.disableQuickAdd = false;
        }
      };

      $scope.quickAddService = function (serviceCode) {
        $scope.selectedServiceCodes.push(serviceCode);
        $scope.onSelectedCodes();
      };

      $scope.onSelectedCodes = function () {
        $scope.onSelect($scope.selectedServiceCodes);
      };

      $scope.$watch(
        'searchServiceCodesKeyword',
        function (nv) {
          if (nv) {
            $scope.filteringServices = true;
          }
        },
        true
      );
    },
  ]);
