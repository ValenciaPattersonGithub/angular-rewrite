'use strict';
angular.module('Soar.Patient').controller('PatientAccountBalanceController', [
  '$scope',
  'localize',
  '$timeout',
  '$routeParams',
  'patSecurityService',
  'toastrFactory',
  'PatientServices',
  'ListHelper',
  '$filter',
  'FinancialService',
  function (
    $scope,
    localize,
    $timeout,
    $routeParams,
    patSecurityService,
    toastrFactory,
    patientServices,
    listHelper,
    $filter,
    financialService
  ) {
    //#region properties

    var ctrl = this;
    $scope.detailGraphData = {
      moreThanThirtyBalance: 0,
      moreThanSixtyBalance: 0,
      moreThanNintyBalance: 0,
      currentBalance: 0,
      totalBalance: 0,
      chartHeight: 120,
    };

    // stubs for balance bar
    $scope.balanceCurrentPercentage = 75;
    $scope.balanceOverduePercentage = 5;
    $scope.balanceDelinquentPercentage = 20;

    // getting the height style for each section of balance bar
    $scope.getHeightStyle = function (perc) {
      return {
        height: perc + '%',
      };
    };

    $scope.loadGraphData = function (modifier) {
      if ($scope.accountBalances && $scope.accountBalances.length > 0) {
        $scope.detailGraphData =
          financialService.CalculateAccountAgingGraphData(
            $scope.accountBalances,
            '',
            modifier
          );
      }
    };

    $scope.loadGraphData();

    $scope.$watch('accountBalances', function () {
      $scope.loadGraphData();
    });

    $scope.patAcctBalDtlPopover = false;

    $scope.closePopover = function () {
      $scope.patAcctBalDtlPopover = false;
    };
  },
]);
