'use strict';

var PatientAccountTransferController = angular
  .module('Soar.Patient')
  .controller('PatientTransferGridController', [
    '$scope',
    '$routeParams',
    '$timeout',
    'PatientServices',
    '$filter',
    '$window',
    'BoundObjectFactory',
    'toastrFactory',
    'localize',
    '$location',
    '$rootScope',
    function (
      $scope,
      $routeParams,
      $timeout,
      patientServices,
      $filter,
      $window,
      boundObjectFactory,
      toastrFactory,
      localize,
      $location,
      $rootScope
    ) {
      var ctrl = this;

      $scope.header = [
        {
          label: localize.getLocalizedString('First Name'),
          filters: false,
          sortable: false,
          sorted: false,
          size: 'col-sm-2 cell',
        },
        {
          label: localize.getLocalizedString('Middle Initial'),
          filters: false,
          sortable: false,
          sorted: false,
          size: 'col-sm-2 cell',
        },
        {
          label: localize.getLocalizedString('Last Name'),
          filters: false,
          sortable: false,
          sorted: false,
          size: 'col-sm-2 cell',
        },
        {
          label: localize.getLocalizedString('Date of Birth'),
          filters: false,
          sortable: false,
          sorted: false,
          size: 'col-sm-2 cell',
        },
        {
          label: localize.getLocalizedString('Patient Code'),
          filters: false,
          sortable: false,
          sorted: false,
          size: 'col-sm-2 cell',
        },
      ];
      ctrl.previousRow = { highlighted: false };

      $scope.patientGrid = [];

      $scope.takeAmount = 50;
      $scope.isUpdating = false;
      $scope.isHidden = false;
      $scope.currentCount = 0;
      ctrl.currentPage = 0;
      ctrl.maxPage = 0;
      $scope.searchQuery = '';
      $scope.resultCount = 0;

      $scope.loadPatientGrid = function () {
        $scope.isSearch = false;
        if (
          ctrl.currentPage < ctrl.maxPage &&
          $scope.currentCount < $scope.resultCount
        ) {
          ctrl.currentPage++;
          $scope.updateGrid();
        }
      };
      $scope.searchGrid = function () {
        $scope.isSearch = true;
        ctrl.maxPage = 0;
        $scope.resultCount = 0;
        ctrl.currentPage = 0;
        $scope.updateGrid();
      };
      $scope.updateGrid = function () {
        if ($scope.isUpdating) return;

        $scope.isUpdating = true;

        var searchParams = {
          searchQuery: $scope.searchQuery,
          skip: $scope.takeAmount * ctrl.currentPage,
          take: $scope.takeAmount,
        };
        patientServices.PatientAccountTransfer.getPatientGrid(
          searchParams
        ).$promise.then(ctrl.getPatientGridSuccess, ctrl.getPatientGridFailure);
      };

      ctrl.getPatientGridSuccess = function (res) {
        if (res.Value.length != $scope.takeAmount) {
          $scope.allDataDisplayed = true;
        }
        if (res.Value.length > 0) {
          $scope.resultCount = res.Value[0].TotalCount;
          $scope.currentCount = res.Value.length;
          if ($scope.isSearch) $scope.patientGrid = res.Value;
          else {
            for (var i = 0; i < res.Value.length; i++) {
              var rowItem = res.Value[i];
              $scope.patientGrid.push(rowItem);
            }
          }

          ctrl.maxPage = Math.floor($scope.resultCount / $scope.takeAmount);
        } /// If no result found clear grid
        else $scope.patientGrid = [];

        $timeout(function () {
          $scope.isUpdating = false;
        });
      };

      $scope.highlightRow = function (currentRow) {
        ctrl.previousRow.highlighted = !ctrl.previousRow.highlighted;
        currentRow.highlighted = !currentRow.highlighted;
        ctrl.previousRow = currentRow;
        $scope.patientSelected = angular.copy(currentRow);
      };
      $scope.$watch('patientSelected', function (nv) {
        $scope.patientData2 = nv;
      });
      ctrl.getPatientGridFailure = function () {};
      ctrl.init = function () {
        $scope.updateGrid();
      };
      
      ctrl.init();
    },
  ]);
