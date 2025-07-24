'use strict';

angular
  .module('common.controllers')
  .controller('FeeServiceCodeSelectorController', [
    '$scope',
    'ServiceTypesService',
    function ($scope, serviceTypesService) {
      var ctrl = this;
      
      // get service trypes
      $scope.serviceTypes = [];
      serviceTypesService.getAll()
        .then(function (serviceTypes) {
          $scope.serviceTypes = serviceTypes;
        });

      //Apply and clear filter to grid when filterServiceType feild changes
      $scope.$watch(
        'filterServiceType',
        function (nv) {
          if (nv || $scope.searchServiceCodesKeyword) {
            ctrl.applyFilter();
          } else {
            ctrl.clearFilter();
          }
        },
        true
      );

      //Apply and clear filter to grid when searchServiceCodesKeyword feild changes
      $scope.$watch(
        'searchServiceCodesKeyword',
        function (nv) {
          if (nv || $scope.filterServiceType) {
            ctrl.applyFilter();
          } else {
            ctrl.clearFilter();
          }
        },
        true
      );

      //Remove filter from datasource
      ctrl.clearFilter = function () {
        $scope.allServiceCodes.dataSource.filter({});
      };

      //Apply filter to datasource
      ctrl.applyFilter = function () {
        var grdFilter = {};
        if ($scope.searchServiceCodesKeyword && $scope.filterServiceType) {
          grdFilter = {
            logic: 'and',
            filters: [
              {
                logic: 'or',
                filters: [
                  {
                    field: 'Code',
                    operator: 'contains',
                    value: $scope.searchServiceCodesKeyword,
                  },
                  {
                    field: 'CdtCodeName',
                    operator: 'contains',
                    value: $scope.searchServiceCodesKeyword,
                  },
                  {
                    field: 'Description',
                    operator: 'contains',
                    value: $scope.searchServiceCodesKeyword,
                  },
                  {
                    field: 'ServiceCodeDescriptionWithCDTCode',
                    operator: 'contains',
                    value: $scope.searchServiceCodesKeyword,
                  },
                ],
              },
              {
                field: 'ServiceTypeDescription',
                operator: 'eq',
                value: $scope.filterServiceType,
              },
            ],
          };
        } else if ($scope.searchServiceCodesKeyword) {
          grdFilter = {
            logic: 'or',
            filters: [
              {
                field: 'Code',
                operator: 'contains',
                value: $scope.searchServiceCodesKeyword,
              },
              {
                field: 'CdtCodeName',
                operator: 'contains',
                value: $scope.searchServiceCodesKeyword,
              },
              {
                field: 'Description',
                operator: 'contains',
                value: $scope.searchServiceCodesKeyword,
              },
              {
                field: 'ServiceCodeDescriptionWithCDTCode',
                operator: 'contains',
                value: $scope.searchServiceCodesKeyword,
              },
            ],
          };
        } else if ($scope.filterServiceType) {
          grdFilter = {
            field: 'ServiceTypeDescription',
            operator: 'eq',
            value: $scope.filterServiceType,
          };
        }
        $scope.allServiceCodes.dataSource.filter(grdFilter);
      };
    },
  ]);
