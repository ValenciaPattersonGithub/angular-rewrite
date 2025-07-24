'use strict';

var app = angular.module('Soar.Patient');

var PatientPerioController = app.controller('PerioChartController', [
  '$scope',
  '$routeParams',
  '$timeout',
  'ListHelper',
  '$window',
  'PatientPerioExamFactory',
  'localize',
  function (
    $scope,
    $routeParams,
    $timeout,
    listHelper,
    $window,
    patientPerioExamFactory,
    localize
  ) {
    var ctrl = this;

    // run on instantiation
    ctrl.$onInit = function () {
      ctrl.fontDeclaration = '"Open Sans", sans-serif';
      // colors
      $scope.pocketDepthColor = '#009900';
      $scope.gingivalMarginColor = '#0066cc';
      $scope.mgjLevelColor = '#00ff00';
      $scope.attachmentLevelColor = '#ff6600';
      $scope.alertLevelColor = '#ff6666';
      ctrl.bleedingColor = '#ff2600';
      ctrl.suppurationColor = '#ffd479';
      // selectors
      ctrl.buccalChartSelector = '#buccal' + $scope.arch;
      ctrl.lingualChartSelector = '#lingual' + $scope.arch;

      // making sure dom is ready before creating the charts
      $timeout(function () {
        ctrl.buildChart('buccal');
        ctrl.buildChart('lingual');
        ctrl.updateCharts();
      });
    };

    // getting the correct index, different for each side of mouth
    ctrl.getDynamicIndex = function (i, ped) {
      var dynamicIndex = i;
      if (ped.$$MouthSide === 'Left') {
        switch (i) {
          case 0:
            dynamicIndex = 2;
            break;
          case 2:
            dynamicIndex = 0;
            break;
        }
      } else if (ped.$$MouthSide === 'Right') {
        switch (i) {
          case 3:
            dynamicIndex = 5;
            break;
          case 5:
            dynamicIndex = 3;
            break;
        }
      }
      return dynamicIndex;
    };

    // making a modified version of the exam (and splitting into two lists) to be passed to the chart via the dataSource property
    ctrl.transformExamObjects = function () {
      ctrl.chart1Data = [];
      ctrl.chart2Data = [];
      angular.forEach(ctrl.rawExamForArch, function (ped) {
        var i;
        for (i = 0; i < 6; i++) {
          var dynamicIndex = ctrl.getDynamicIndex(i, ped);
          var perioExamDetail = angular.copy(ped);
          // making a perioExamDetail object for each entry
          perioExamDetail.ToothId =
            perioExamDetail.ToothId &&
            perioExamDetail.ToothState !== 'MissingPrimary'
              ? perioExamDetail.ToothId
              : '';
          perioExamDetail.BleedingPocket = perioExamDetail.BleedingPocket[i];
          perioExamDetail.DepthPocket = perioExamDetail.DepthPocket[
            dynamicIndex
          ]
            ? parseInt(perioExamDetail.DepthPocket[dynamicIndex])
            : 0;
          perioExamDetail.GingivalMarginPocket = perioExamDetail
            .GingivalMarginPocket[dynamicIndex]
            ? parseInt(perioExamDetail.GingivalMarginPocket[dynamicIndex])
            : 0;
          perioExamDetail.MgjPocket = perioExamDetail.MgjPocket[dynamicIndex]
            ? parseInt(perioExamDetail.MgjPocket[dynamicIndex])
            : 0;
          perioExamDetail.SuppurationPocket =
            perioExamDetail.SuppurationPocket[i];
          // custom properties
          perioExamDetail.$$AttachmentLevel = 0;
          if ($scope.activeDataPoints.indexOf('PD') !== -1) {
            perioExamDetail.$$AttachmentLevel =
              perioExamDetail.$$AttachmentLevel + perioExamDetail.DepthPocket;
          }
          if ($scope.activeDataPoints.indexOf('GM') !== -1) {
            perioExamDetail.$$AttachmentLevel =
              perioExamDetail.$$AttachmentLevel +
              perioExamDetail.GingivalMarginPocket;
          }
          perioExamDetail.$$DepthPocketColor =
            perioExamDetail.DepthPocket >=
            patientPerioExamFactory.AlertLevels.DepthPocket
              ? $scope.alertLevelColor
              : $scope.pocketDepthColor;
          // handle the possible negative values for GM
          if (perioExamDetail.GingivalMarginPocket >= 0) {
            perioExamDetail.$$GingivalMarginColor =
              perioExamDetail.GingivalMarginPocket >=
              patientPerioExamFactory.AlertLevels.GingivalMarginPocket
                ? $scope.alertLevelColor
                : $scope.gingivalMarginColor;
          } else {
            if (perioExamDetail.GingivalMarginPocket < 0) {
              perioExamDetail.$$GingivalMarginColor =
                perioExamDetail.GingivalMarginPocket <=
                patientPerioExamFactory.AlertLevels.GingivalMarginPocket * -1
                  ? $scope.alertLevelColor
                  : $scope.gingivalMarginColor;
            } else {
              perioExamDetail.$$GingivalMarginColor =
                $scope.gingivalMarginColor;
            }
          }
          perioExamDetail.$$Indentifier =
            'tooth_id_' +
            perioExamDetail.ToothNumber +
            '_pocket_' +
            (dynamicIndex + 1);
          perioExamDetail.$$Circle = 0;
          // pushing inputs to the correct chart list
          var relevantChart = dynamicIndex < 3 ? 'chart1Data' : 'chart2Data';
          ctrl[relevantChart].push(perioExamDetail);
        }
      });
    };

    ctrl.rebindDataSources = function () {
      angular
        .element(ctrl.buccalChartSelector)
        .data('kendoChart')
        .setDataSource(ctrl.chart1Data);
      angular
        .element(ctrl.lingualChartSelector)
        .data('kendoChart')
        .setDataSource(ctrl.chart2Data);
    };

    // chart instantiation
    ctrl.buildChart = function (side) {
      var selector =
        side === 'buccal'
          ? ctrl.buccalChartSelector
          : ctrl.lingualChartSelector;
      angular.element(selector).kendoChart({
        transitions: false,
        chartArea: {
          background: '',
        },
        dataSource: {
          data: side === 'buccal' ? ctrl.chart1Data : ctrl.chart2Data,
        },
        legend: {
          visible: false,
        },
        seriesDefaults: {
          labels: {
            visible: false,
          },
        },
        reverse: true,
        series: [
          {
            color: '#ffffff',
            field: '$$Circle',
            opacity: 0,
            type: 'line',
            zIndex: 2,
          },
          {
            colorField: '$$GingivalMarginColor',
            field: 'GingivalMarginPocket',
            overlay: {
              gradient: 'none',
            },
            stack: true,
            type: 'column',
            zIndex: 1,
          },
          {
            color: $scope.mgjLevelColor,
            field: 'MgjPocket',
            type: 'line',
            zIndex: 1,
          },
          {
            colorField: '$$DepthPocketColor',
            field: 'DepthPocket',
            overlay: {
              gradient: 'none',
            },
            stack: true,
            type: 'column',
            zIndex: 1,
          },
          {
            color: $scope.attachmentLevelColor,
            field: '$$AttachmentLevel',
            type: 'line',
            zIndex: 1,
          },
        ],
        valueAxis: [
          {
            min: 0,
            max: 10,
            majorGridLines: {
              step: 2,
              visible: false,
            },
            title: {
              font: ctrl.fontDeclaration,
              text:
                side === 'buccal'
                  ? localize.getLocalizedString('Buccal')
                  : localize.getLocalizedString('Lingual'),
            },
            labels: {
              font: ctrl.fontDeclaration,
            },
            reverse:
              ($scope.arch === 'Upper' && side === 'buccal') ||
              ($scope.arch === 'Lower' && side === 'lingual')
                ? false
                : true,
          },
          {
            min: 0,
            max: 10,
            majorGridLines: {
              step: 2,
              visible: false,
            },
            title: {
              font: ctrl.fontDeclaration,
              text:
                side === 'buccal'
                  ? localize.getLocalizedString('Buccal')
                  : localize.getLocalizedString('Lingual'),
            },
            labels: {
              font: ctrl.fontDeclaration,
            },
            reverse:
              ($scope.arch === 'Upper' && side === 'buccal') ||
              ($scope.arch === 'Lower' && side === 'lingual')
                ? false
                : true,
          },
        ],
        categoryAxis: {
          field: 'ToothId',
          majorGridLines: {
            step: 3,
            width: 3,
          },
          line: {
            visible: false,
          },
          visible: true,
          labels: {
            font: ctrl.fontDeclaration,
            margin: {
              top: 10,
            },
            skip: 1,
            step: 3,
            visible:
              ($scope.arch === 'Upper' && side === 'buccal') ||
              ($scope.arch === 'Lower' && side === 'lingual')
                ? true
                : false,
          },
          axisCrossingValue: [0, 48],
        },
      });
    };

    // binding to the resize event, calling kendo.resize to make the graph responsive
    angular.element($window).bind('resize', function () {
      kendo.resize(angular.element(ctrl.buccalChartSelector));
      kendo.resize(angular.element(ctrl.lingualChartSelector));
    });

    // refreshing the charts
    ctrl.updateCharts = function () {
      var chart1 = angular.element(ctrl.buccalChartSelector).data('kendoChart');
      if (chart1) {
        chart1.options.series[1].visible =
          $scope.activeDataPoints.indexOf('GM') !== -1;
        chart1.options.series[2].visible =
          $scope.activeDataPoints.indexOf('MGJ') !== -1;
        chart1.options.series[3].visible =
          $scope.activeDataPoints.indexOf('PD') !== -1;
        chart1.options.series[4].visible =
          $scope.activeDataPoints.indexOf('PD') !== -1 ||
          $scope.activeDataPoints.indexOf('GM') !== -1;
        chart1.refresh();
        ctrl.updateCircles(ctrl.buccalChartSelector);
        ctrl.fillCircles('chart1Data');
      }
      var chart2 = angular
        .element(ctrl.lingualChartSelector)
        .data('kendoChart');
      if (chart2) {
        chart2.options.series[1].visible =
          $scope.activeDataPoints.indexOf('GM') !== -1;
        chart2.options.series[2].visible =
          $scope.activeDataPoints.indexOf('MGJ') !== -1;
        chart2.options.series[3].visible =
          $scope.activeDataPoints.indexOf('PD') !== -1;
        chart2.options.series[4].visible =
          $scope.activeDataPoints.indexOf('PD') !== -1 ||
          $scope.activeDataPoints.indexOf('GM') !== -1;
        chart2.refresh();
        ctrl.updateCircles(ctrl.lingualChartSelector);
        ctrl.fillCircles('chart2Data');
      }
    };

    // displays the bleeding/suppuration circles
    ctrl.fillCircles = function (listName) {
      angular.forEach(ctrl[listName], function (ped) {
        var circles = angular.element('g circle');
        angular.forEach(circles, function (cir) {
          cir = angular.element(cir);
          if (
            cir.attr('class') &&
            cir.attr('class') === ped.$$Indentifier &&
            (ped.BleedingPocket === true || ped.SuppurationPocket === true)
          ) {
            // dynamic circle coloring
            if (ped.BleedingPocket === true && ped.SuppurationPocket === true) {
              cir.attr('fill', ctrl.bleedingColor);
              cir.attr('stroke', ctrl.suppurationColor);
              cir.attr('stroke-width', 3);
            } else if (ped.BleedingPocket === true) {
              cir.attr('fill', ctrl.bleedingColor);
              cir.attr('stroke-width', 0);
            } else if (ped.SuppurationPocket === true) {
              cir.attr('fill', ctrl.suppurationColor);
              cir.attr('stroke-width', 0);
            }
            var upperCirclePosition = 80;
            if (
              window.navigator.userAgent.toLowerCase().indexOf('firefox') > -1
            ) {
              upperCirclePosition = 79;
            }
            if (
              cir.attr('class').indexOf('pocket_1') !== -1 ||
              cir.attr('class').indexOf('pocket_2') !== -1 ||
              cir.attr('class').indexOf('pocket_3') !== -1
            ) {
              $scope.arch === 'Upper'
                ? cir.attr('cy', upperCirclePosition)
                : cir.attr('cy', 19);
            } else {
              $scope.arch === 'Upper'
                ? cir.attr('cy', 19)
                : cir.attr('cy', upperCirclePosition);
            }
            cir.attr('style', 'display:block;');
          }
        });
      });
    };

    // adding classes to chart circles for bleeding charting
    ctrl.updateCircles = function (selector) {
      var circles = angular.element(selector + ' g circle');
      var toothCounter = $scope.arch === 'Upper' ? 1 : 32;
      var pocketCounter = selector === ctrl.buccalChartSelector ? 1 : 4;
      angular.forEach(circles, function (cir, $index) {
        cir = angular.element(cir);
        if (cir.attr('stroke') === '#ffffff') {
          var indexPlusOne = $index + 1;
          cir.attr(
            'class',
            'tooth_id_' + toothCounter + '_pocket_' + pocketCounter
          );
          if (indexPlusOne % 3 === 0) {
            $scope.arch === 'Upper' ? toothCounter++ : toothCounter--;
            pocketCounter = selector === ctrl.buccalChartSelector ? 1 : 4;
          } else {
            pocketCounter++;
          }
        }
      });
    };

    // every time 'rawExam' is changed in the parent, update 'exam' for the chart
    $scope.$watch(
      'rawExam',
      function (nv) {
        if (nv) {
          ctrl.rawExamForArch =
            $scope.arch === 'Upper'
              ? angular.copy(nv.slice(0, 16))
              : angular.copy(nv.slice(16)).reverse();
          ctrl.transformExamObjects();
          $timeout(function () {
            ctrl.rebindDataSources();
            ctrl.updateCharts();
          });
        }
      },
      true
    );

    // for updating graph when options are toggled
    $scope.$watch(
      'activeDataPoints',
      function (nv, ov) {
        if (nv && ov && !angular.equals(nv, ov)) {
          ctrl.transformExamObjects();
          $timeout(function () {
            ctrl.rebindDataSources();
            ctrl.updateCharts();
          });
        }
      },
      true
    );
  },
]);
