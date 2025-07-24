'use strict';

angular
  .module('Soar.Widget')
  .controller('HygieneVsDoctorGrossProductionHalfDonutWidgetController', [
    '$scope',
    'WidgetInitStatus',
    'WidgetFactory',
    'ReportsFactory',
    '$timeout',
    HygieneVsDoctorGrossProductionHalfDonutWidgetController,
  ]);

function HygieneVsDoctorGrossProductionHalfDonutWidgetController(
  $scope,
  widgetInitStatus,
  widgetFactory,
  reportsFactory,
  $timeout
) {
  BaseCtrl.call(
    this,
    $scope,
    'HygieneVsDoctorGrossProductionHalfDonutWidgetController'
  );

  var ctrl = this;

  $scope.hygieneVsDoctorGrossProductionCharts = [];
  $scope.hygieneVsDoctorGrossProductionSeriesData = [];
  $scope.hygieneVsDoctorGrossProductionFilters = [];
  $scope.hygieneVsDoctorGrossProductionCurrentFilter = null;
  $scope.isLoadingForFilter = false;
  $scope.dateFilter = null;
  $scope.locations = [];
  ctrl.emptyGuid = '00000000-0000-0000-0000-000000000000';
  ctrl.guidOne = '00000000-0000-0000-0000-000000000001';
  ctrl.negativeAdj = [ctrl.emptyGuid];
  ctrl.positiveAdj = [ctrl.emptyGuid];
  ctrl.patientGroups = [ctrl.emptyGuid, ctrl.guidOne];

  $scope.drilldown = function (e) {
    e.preventDefault();
    if (e.series.data[1].value !== 0 || e.series.data[2].value !== 0) {
      var filter = widgetFactory.GetReportFilterDtoForHygieneVsDoctorReport(
        $scope.locations,
        $scope.dateFilter,
        e.category || e.text,
        ctrl.negativeAdj,
        ctrl.positiveAdj,
        ctrl.patientGroups
      );
      sessionStorage.setItem('dateType', $scope.dateFilter);
      reportsFactory.GetSpecificReports([21]).then(function (res) {
        if (res && res.Value) {
          var report = res.Value[0];
          report.Route =
            '/BusinessCenter/' +
            report.Route.charAt(0).toUpperCase() +
            report.Route.slice(1);
          report.FilterProperties = report.RequestBodyProperties;
          report.Amfa = reportsFactory.GetAmfaAbbrev(report.ActionId);
          reportsFactory.OpenReportPageWithContext(
            report,
            report.Route,
            filter
          );
          reportsFactory.ClearReportContext();
        }
      });
    }
  };

  $scope.$watch('data.initMode', function (nv) {
    $scope.isLoadingForFilter = true;
    ctrl.processInitMode(nv);
  });

  ctrl.processInitMode = function (initMode) {
    if (initMode === widgetInitStatus.ToLoad) {
      ctrl.getDataFromServer();
    }

    if (initMode === widgetInitStatus.Loaded) {
      ctrl.processDataFromServer($scope.data.initData);
      $scope.isLoadingForFilter = false;
    }
  };

  $scope.hygieneVsDoctorGrossProductionChangeFilter = function (filter) {
    if (!$scope.isLoadingForFilter && !_.isNull(filter)) {
      $scope.hygieneVsDoctorGrossProductionCurrentFilter = filter;
      ctrl.getDataFromServer();
    }
  };

  ctrl.getDataFromServer = function () {
    $scope.$emit('WidgetLoadingStarted');
    var filterResult = widgetFactory.GetFilterDto(
      $scope.hygieneVsDoctorGrossProductionCurrentFilter,
      $scope.data.Locations,
      null
    );
    widgetFactory.GetHygieneVsDoctorGrossProduction(filterResult).then(
      function (res) {
        ctrl.processDataFromServer(res.Value);
        $scope.$emit('WidgetLoadingDone');
      },
      function () {
        $scope.$emit('WidgetLoadingError', 'Failed to load data.');
      }
    );
    $scope.isLoadingForFilter = false;
  };

  ctrl.processDataFromServer = function (data) {
    $scope.hygieneVsDoctorGrossProductionCharts = data.Data;
    $scope.dateFilter = Object.keys(data.Data)[0];
    if (!_.isNil($scope.data)) {
      $scope.locations = $scope.data.Locations;
    }
    _.each($scope.hygieneVsDoctorGrossProductionCharts, function (chart, key) {
      _.each(chart.SeriesData, function (item) {
        item.label = item.Label;
        item.color = item.Color;
      });
    });
    var filters = [];
    _.each(data.FilterList, function (key, value) {
      filters.push({ name: key, value: key });
    });
    $scope.hygieneVsDoctorGrossProductionFilters = filters;
    $timeout(function () {
      if (_.isNull($scope.hygieneVsDoctorGrossProductionCurrentFilter)) {
        $scope.hygieneVsDoctorGrossProductionCurrentFilter = data.DefaultFilter;
      }
      $scope.hygieneVsDoctorGrossProductionSeriesData =
        $scope.hygieneVsDoctorGrossProductionCharts[
          $scope.hygieneVsDoctorGrossProductionCurrentFilter
        ].SeriesData;
    }, 100);
  };

  $scope.$on('locationsUpdated', function () {
    ctrl.getDataFromServer();
  });
}

HygieneVsDoctorGrossProductionHalfDonutWidgetController.prototype = Object.create(
  BaseCtrl.prototype
);
