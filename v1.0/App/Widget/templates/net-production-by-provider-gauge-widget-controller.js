'use strict';

angular
  .module('Soar.Widget')
  .controller('NetProductionByProviderGaugeWidgetController', [
    '$scope',
    'WidgetFactory',
    'WidgetInitStatus',
    '$timeout',
    'localize',
    'ReportsFactory',
    '$location',
    'FeatureFlagService',
    'FuseFlag',
    NetProductionByProviderGaugeWidgetController,
  ]);

function NetProductionByProviderGaugeWidgetController(
  $scope,
  factory,
  widgetInitStatus,
  $timeout,
  localize,
  reportsFactory,
  $location,
  featureFlagService,
  fuseFlag
) {
  BaseCtrl.call(this, $scope, 'NetProductionByProviderGaugeWidgetController');
  var ctrl = this;
  ctrl.userData = $scope.data.userData;
  ctrl.widgetId = $scope.data.ItemId;

  ctrl.reportId = 21;

  $scope.allData = null;
  $scope.dateFilterOptions = null;
  $scope.dateFilter = null;
  $scope.gaugeData = null;
  var launchDarklyStatus = false;
  $scope.dateFilterChanged = function (filterValue) {
    if (filterValue && $scope.dateFilter !== filterValue) {
      $scope.dateFilter = filterValue;
      ctrl.getWidgetData($scope.dateFilter);
    }
  };

  $scope.drilldown = function (e) {
    var filter = factory.GetReportFilterDto(
      $scope.data.Locations,
      [$scope.data.userData.UserId],
      $scope.dateFilter
    );
    sessionStorage.setItem('dateType', $scope.dateFilter);
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
      }
    });
  };

  ctrl.updateGauge = function (dateOption) {
    if (!$scope.allData || !dateOption) {
      return;
    }
    var rangeData = $scope.allData[dateOption].SeriesData;
    var percent = 0;
    var productionData = _.find(rangeData, function (e) {
      return e.Category === 'Value';
    });
    if (productionData.Value) {
      percent = 100;
    }
    var category =
      localize.getLocalizedString('$') +
      productionData.Value.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,');
    var holeData = {
      SeriesName: '_hole_',
      Category: category,
      label: percent + localize.getLocalizedString('%'),
    };
    rangeData.push(holeData);
    $scope.gaugeData = rangeData;
  };

  ctrl.getWidgetData = function (dateOption) {
    $scope.$emit('WidgetLoadingStarted');
    var userIds = ctrl.userData && [ctrl.userData.UserId];
    var filterResult = factory.GetFilterDto(dateOption, null, userIds);
    if ($location.$$url === '/BusinessCenter/PracticeAtAGlance') {
      factory.GetNetProduction(filterResult).then(
        function (res) {
          ctrl.processData(res.Value);
          $scope.$emit('WidgetLoadingDone');
        },
        function () {
          $scope.$emit('WidgetLoadingError', 'Failed to load data.');
        }
      );
    } else {
        featureFlagService.getOnce$(fuseFlag.DashboardNetProductionWidgetMvp).subscribe((value) => {
            launchDarklyStatus = value;
        });
        filterResult["LaunchDarklyStatus"] = launchDarklyStatus;
      factory.GetUserDashboardNetProduction(filterResult).then(
        function (res) {
          ctrl.processData(res.Value);
          $scope.$emit('WidgetLoadingDone');
        },
        function () {
          $scope.$emit('WidgetLoadingError', 'Failed to load data.');
        }
      );
    }
    //factory.GetNetProduction(filterResult).then(
    //    function (res) {
    //        ctrl.processData(res.Value);
    //        $scope.$emit('WidgetLoadingDone');
    //    },
    //    function () {
    //        $scope.$emit('WidgetLoadingError', 'Failed to load data.');
    //    }
    //);
  };

  ctrl.processData = function (data) {
    $scope.allData = data.Data;
    $scope.dateFilterOptions = data.FilterList.map(function (key) {
      return { Value: key };
    });
    $timeout(function () {
      $scope.dateFilter = data.DefaultFilter;
      ctrl.updateGauge($scope.dateFilter);
    });
  };

  ctrl.processInitMode = function (mode) {
    if (mode === widgetInitStatus.Loaded) {
      ctrl.processData($scope.data.initData);
    } else if (mode === widgetInitStatus.ToLoad) {
      ctrl.getWidgetData();
    }
  };

  $scope.$watch('data.initMode', function (nv, ov) {
    ctrl.processInitMode(nv);
  });
}

NetProductionByProviderGaugeWidgetController.prototype = Object.create(
  BaseCtrl.prototype
);
