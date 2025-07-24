'use strict';

angular
  .module('Soar.Widget')
  .controller('CollectionsAtCheckoutGaugeWidgetController', [
    '$scope',
    'WidgetFactory',
    'ReportsFactory',
    'localize',
    'WidgetInitStatus',
    'WidgetDateFilterValues',
    '$timeout',
    CollectionsAtCheckoutGaugeWidgetController,
  ]);

function CollectionsAtCheckoutGaugeWidgetController(
  $scope,
  factory,
  reportsFactory,
  localize,
  widgetInitStatus,
  widgetDateFilterValues,
  $timeout
) {
  BaseCtrl.call(this, $scope, 'CollectionsAtCheckoutGaugeWidgetController');
  var ctrl = this;

  ctrl.reportId = 42;

  $scope.dateFilterOptionsCheckout = null;
  $scope.dateFilterCheckout = null;
  $scope.gaugeDataCheckout = null;

  //  $scope.drilldown = function (e) {
  //      var filter = factory.GetReportFilterDto($scope.data.Locations, null, $scope.dateFilterCheckout ? $scope.dateFilterCheckout : $scope.data.initData.DefaultFilter);
  //filter.PresetFilterDto.TransactionTypes = [2];
  //      reportsFactory.GetSpecificReports([ctrl.reportId]).then(function (res) {
  //          if (res && res.Value) {
  //              var report = res.Value[0];
  //              report.Route = '/BusinessCenter/' + report.Route.charAt(0).toUpperCase() + report.Route.slice(1);
  //              report.FilterProperties = report.RequestBodyProperties;
  //              report.Amfa = reportsFactory.GetAmfaAbbrev(report.ActionId);
  //              reportsFactory.OpenReportPageWithContext(report, '', filter);
  //          }
  //      });
  //  };

  ctrl.updateGauge = function (allData) {
    var rangeData = allData[$scope.dateFilterCheckout].SeriesData;
    var gaugeDataCheckout = [];
    var percent = 0;
    var patientBalance = _.find(rangeData, function (e) {
      return e.Category === 'PatientBalance';
    });
    var collectionsAtCheckout = _.find(rangeData, function (e) {
      return e.Category === 'CollectionsAtCheckout';
    });
    if (patientBalance.Value) {
      percent = Math.round(
        (collectionsAtCheckout.Value * 100.0) / patientBalance.Value
      );
    }
    var category =
      localize.getLocalizedString('$') +
      collectionsAtCheckout.Value.toFixed(2).replace(
        /(\d)(?=(\d{3})+\.)/g,
        '$1,'
      );
    gaugeDataCheckout.push(collectionsAtCheckout);
    gaugeDataCheckout.push({
      Color: patientBalance.Color,
      Value: patientBalance.Value - collectionsAtCheckout.Value,
    });
    gaugeDataCheckout.push({
      SeriesName: '_hole_',
      Category: category,
      label: percent + localize.getLocalizedString('%'),
    });
    $scope.gaugeDataCheckout = gaugeDataCheckout;
  };

  ctrl.getWidgetData = function (dateOption) {
    $scope.$emit('WidgetLoadingStarted');
    var filterResult = factory.GetFilterDto(
      dateOption,
      $scope.data.Locations,
      null
    );
    factory.GetCollectionsAtCheckout(filterResult).then(
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
    $scope.dateFilterOptionsCheckout = Object.values(data.FilterList).map(
      function (value) {
        return { display: localize.getLocalizedString(value), Value: value };
      }
    );
    $timeout(function () {
      if ($scope.dateFilterCheckout != data.DefaultFilter) {
        $scope.dateFilterCheckout = data.DefaultFilter;
      }
      ctrl.updateGauge(data.Data);
    }, 300);
  };

  ctrl.processInitMode = function (mode) {
    if (mode === widgetInitStatus.Loaded) {
      ctrl.processData($scope.data.initData);
    } else if (mode === widgetInitStatus.ToLoad) {
      ctrl.getWidgetData(widgetDateFilterValues.MonthToDate);
    }
  };

  $scope.onDateFilterChange = function (dateOption) {
    if (!_.isNull(dateOption) && !_.isNull($scope.dateFilterCheckout)) {
      ctrl.getWidgetData(dateOption);
    }
  };

  $scope.$watch('data.initMode', function (nv, ov) {
    ctrl.processInitMode(nv);
  });

  $scope.$on('locationsUpdated', function () {
    ctrl.getWidgetData($scope.dateFilterCheckout);
  });
}

CollectionsAtCheckoutGaugeWidgetController.prototype = Object.create(
  BaseCtrl.prototype
);
