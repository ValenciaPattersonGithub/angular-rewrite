'use strict';
angular.module('Soar.Patient').controller('PatientAccountAgingController', [
  '$scope',
  'localize',
  '$timeout',
  function ($scope, localize, $timeout) {
    var ctrl = this;
    $scope.chartId =
      $scope.graphId == null ? 'chart' : 'chart' + $scope.graphId;
    ctrl.chartHeight =
      $scope.graphData.chartHeight == undefined ||
      $scope.graphData.chartHeight == null
        ? 90
        : $scope.graphData.chartHeight;

    ctrl.loadChart = function () {
      var initialBalance = $scope.graphData.currentBalance;
      if (initialBalance < 0) initialBalance = initialBalance * -1;
      var totalAmount =
        $scope.graphData.moreThanNintyBalance +
        $scope.graphData.moreThanSixtyBalance +
        $scope.graphData.moreThanThirtyBalance +
        initialBalance;
      var moreThanNintyBalance = Number(
        (($scope.graphData.moreThanNintyBalance / totalAmount) * 100).toFixed(2)
      );
      var moreThanSixtyBalance = Number(
        (($scope.graphData.moreThanSixtyBalance / totalAmount) * 100).toFixed(2)
      );
      var moreThanThirtyBalance = Number(
        (($scope.graphData.moreThanThirtyBalance / totalAmount) * 100).toFixed(
          2
        )
      );

      var currentBalance = Number(
        ((initialBalance / totalAmount) * 100).toFixed(2)
      );

      $timeout(function () {
        angular.element('#' + $scope.chartId).kendoChart({
          legend: {
            visible: false,
            margin: {
              left: 0,
              bottom: 0,
              right: 0,
              top: 0,
            },
          },
          seriesDefaults: {
            type: 'column',
            stack: {
              type: '100%',
            },
          },
          series: [
            {
              name: localize.getLocalizedString('{0} Days:', ['0-30']),
              data: [moreThanNintyBalance],
              gap: 0,
              color: '#F00',
            },
            {
              name: localize.getLocalizedString('{0} Days:', ['31-60']),
              data: [moreThanSixtyBalance],
              gap: 0,
              color: '#FF9516',
            },
            {
              name: localize.getLocalizedString('{0} Days:', ['61-90']),
              data: [moreThanThirtyBalance],
              gap: 0,
              color: '#FF9516',
            },
            {
              name: localize.getLocalizedString('{0} Days:', ['> 90']),
              data: [currentBalance],
              gap: 0,
              color: '#3C3',
            },
          ],
          valueAxis: {
            visible: false,
            line: {
              visible: false,
            },
            minorGridLines: {
              visible: false,
            },
            majorGridLines: {
              visible: false,
            },
            min: 0,
            max: 1,
          },
          categoryAxis: {
            visible: false,
            majorGridLines: {
              visible: false,
            },
            minorGridLines: {
              visible: false,
            },
          },
          tooltip: {
            visible: false,
            template: '#: series.name # : #: series.data[0] #',
          },
          chartArea: {
            height: ctrl.chartHeight,
            margin: 0,
          },
        });
      });
    };

    // reload chart whenever filters are changed
    $scope.$watch(
      'graphData',
      function (nv, ov) {
        if (nv != null) {
          ctrl.loadChart();
        }
      },
      true
    );
  },
]);
