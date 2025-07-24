'use strict';

angular
  .module('Soar.Widget')
  .controller('ReceivablesToNetProductionGaugeWidgetController', [
    '$scope',
    'WidgetFactory',
    'localize',
    'WidgetInitStatus',
    'WidgetDateFilterValues',
    'ReportsFactory',
    '$timeout',
    ReceivablesToNetProductionGaugeWidgetController,
  ]);

function ReceivablesToNetProductionGaugeWidgetController(
  $scope,
  factory,
  localize,
  widgetInitStatus,
  widgetDateFilterValues,
  reportsFactory,
  $timeout
) {
  BaseCtrl.call(
    this,
    $scope,
    'ReceivablesToNetProductionGaugeWidgetController'
  );
  var ctrl = this;
  ctrl.reportId = 19;

  $scope.dateFilterOptions = null;
  $scope.dateFilterRec = null;
  $scope.gaugeData = null;

  ctrl.updateGauge = function (allData) {
    var rangeData = allData[$scope.dateFilterRec].SeriesData;
    var gaugeData = [];
    var percent = 0;
    var production = _.find(rangeData, function (e) {
      return e.Category === 'Production';
    });
    var receivables = _.find(rangeData, function (e) {
      return e.Category === 'Receivables';
    });
    if (production.Value) {
      percent = Math.round((receivables.Value * 100.0) / production.Value);
    }
    var category =
      $scope.dateFilterRec === widgetDateFilterValues.MonthToDate ||
      $scope.dateFilterRec === widgetDateFilterValues.LastMonth
        ? localize.getLocalizedString('of monthly production')
        : localize.getLocalizedString('of yearly production');
    gaugeData.push(receivables);
    gaugeData.push({
      Color: production.Color,
      Value: production.Value - receivables.Value,
    });
    gaugeData.push({
      SeriesName: '_hole_',
      Category: category,
      label: percent + localize.getLocalizedString('%'),
    });
    $scope.gaugeData = gaugeData;
  };

  ctrl.getWidgetData = function (dateOption) {
    $scope.$emit('WidgetLoadingStarted');
    var filterResult = factory.GetFilterDto(
      dateOption,
      $scope.data.Locations,
      null
    );
    factory.GetReceivablesToNetProduction(filterResult).then(
      function (res) {
        ctrl.processData(res.Value);
        $scope.$emit('WidgetLoadingDone');
      },
      function () {
        $scope.$emit('WidgetLoadingError', 'Failed to load data.');
      }
    );
  };

  ctrl.processData = function (data) {
    $scope.dateFilterOptions = Object.values(data.FilterList).map(
      function (value) {
        return { Value: value };
      }
    );
    $timeout(function () {
      if ($scope.dateFilterRec != data.DefaultFilter) {
        $scope.dateFilterRec = data.DefaultFilter;
      }
      ctrl.updateGauge(data.Data);
    }, 200);
  };

  ctrl.processInitMode = function (mode) {
    if (mode === widgetInitStatus.Loaded) {
      ctrl.processData($scope.data.initData);
    } else if (mode === widgetInitStatus.ToLoad) {
      ctrl.getWidgetData($scope.dateFilterRec);
    }
  };

  $scope.drilldown = function (e) {
    var filter = factory.GetReportFilterDto(
      $scope.data.Locations,
      null,
      $scope.dateFilterRec
      );
      filter.PresetFilterDto.ViewDeletedTransaction = true;
      sessionStorage.setItem('ViewDeletedTransaction', 'true');
      sessionStorage.setItem('dateType', $scope.dateFilterRec);
      sessionStorage.setItem('FlagForARNetProductionWidget', 'true');
      filter.PresetFilterDto.FlagForARNetProductionWidget = true;
    reportsFactory.GetSpecificReports([ctrl.reportId]).then(function (res) {
      if (res && res.Value) {
        var report = res.Value[0];
        report.Route =
          '/BusinessCenter/' +
          report.Route.charAt(0).toUpperCase() +
          report.Route.slice(1);
        report.FilterProperties = report.RequestBodyProperties;
        report.Amfa = reportsFactory.GetAmfaAbbrev(report.ActionId);
        reportsFactory.OpenReportPageWithContext(report, report.Route, filter);
        reportsFactory.ClearReportContext();
      }
    });
  };

  $scope.onDateFilterChange = function (dateOption) {
    if (!_.isNull(dateOption) && !_.isNull($scope.dateFilterRec)) {
      ctrl.getWidgetData(dateOption);
    }
  };

  $scope.$watch('data.initMode', function (nv, ov) {
    ctrl.processInitMode(nv);
  });

  $scope.$on('locationsUpdated', function () {
    ctrl.getWidgetData($scope.dateFilterRec);
  });
}

ReceivablesToNetProductionGaugeWidgetController.prototype = Object.create(
  BaseCtrl.prototype
);
