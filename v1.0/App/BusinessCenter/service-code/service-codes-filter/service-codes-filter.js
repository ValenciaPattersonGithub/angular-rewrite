'use strict';

var app = angular
  .module('Soar.BusinessCenter')
  .controller('ServiceCodesFilterController', [
    '$scope',
    'localize',
    '$timeout',
    '$filter',
    function ($scope, localize, $timeout, $filter) {
      //#region properties

      var ctrl = this;

      $scope.showFiltering = true;
      $scope.sortField = null;
      // template to inject into the filter box directive
      $scope.filterTemplate =
        'App/BusinessCenter/service-code/service-codes-filter/service-codes-filter.html';

      // base filter object
      $scope.filterObject = {
        ServiceTypes: [],
        IsSwiftPickCode: false,
        IsServiceCode: false,
        IsActive: false,
        IsInactive: false,
      };

      ctrl.initializeController = function () {
        $scope.setDefaultFilter();
      };
      //#endregion

      //#region sorting from filter dropdown

      // changing sort
      $scope.$watch('data.SortField', function (nv, ov) {
        if (nv) {
          $scope.sortMethod(nv);
        }
      });

      $scope.sortByTypes = [
        {
          SortByName: localize.getLocalizedString('Most Frequently Used'),
          SortByField: 'TimesUsed',
        },
        {
          SortByName: localize.getLocalizedString('Most Recently Used'),
          SortByField: 'LastUsedDate',
        },
      ];

      $scope.data = {
        SortByTypes: $scope.sortByTypes,
        SortField: $scope.sortField,
      };

      $scope.selectSort = function (sortByField) {
        $scope.sortMethod(sortByField);
      };

      //#endregion

      //#region implement filter directive

      // add the filter members to the filterObject

      $scope.setDefaultFilter = function () {
        angular.forEach($scope.serviceTypes, function (serviceType) {
          // add filter by for checkbox
          serviceType.FilterBy = false;
          $scope.filterObject.ServiceTypes.push(serviceType);
        });
        $scope.filterObject.IsSwiftPickCode = false;
        $scope.filterObject.IsServiceCode = false;
        $scope.filterObject.IsActive = false;
        $scope.filterObject.IsInactive = false;

        // make a backup for the filter object that clear uses
        $scope.originalFilterObject = angular.copy($scope.filterObject);
      };

      // filtering method for each item
      $scope.filterServiceCodes = function (value) {
        var match = false;
        var matchServiceType = false;

        // filter by IsSwiftPickCode/ IsServiceCode / IsActive / IsInactive
        if (
          (value.IsSwiftPickCode == $scope.filterObject.IsSwiftPickCode ||
            value.IsSwiftPickCode == !$scope.filterObject.IsServiceCode) &&
          (value.IsActive == $scope.filterObject.IsActive ||
            value.IsActive == !$scope.filterObject.IsInactive)
        ) {
          match = true;
        }

        // filter by ServiceType
        var serviceTypesChecked = $filter('filter')(
          $scope.filterObject.ServiceTypes,
          { FilterBy: true }
        );
        if (serviceTypesChecked && serviceTypesChecked.length > 0) {
          angular.forEach(serviceTypesChecked, function (serviceType) {
            if (
              !matchServiceType &&
              serviceType.ServiceTypeId === value.ServiceTypeId
            ) {
              matchServiceType = true;
            }
          });
        } else {
          matchServiceType = true;
        }
        if (!match || !matchServiceType) {
          return false;
        }
        return true;
      };

      // initialize filter after service types load
      $scope.$watch('serviceTypes', function (nv, ov) {
        if (nv && nv.length > 0) {
          ctrl.initializeController();
        }
      });

      $scope.$watch(
        'items',
        function (nv) {
          if (nv) {
            $scope.items = $filter('filter')(nv, $scope.filterServiceCodes);
          }
        },
        true
      );
    },
  ]);
