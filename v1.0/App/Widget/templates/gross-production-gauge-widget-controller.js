'use strict';

angular
  .module('Soar.Widget')
  .controller('GrossProductionGaugeWidgetController', [
    '$scope',
    'WidgetInitStatus',
    'WidgetFactory',
    '$timeout',
    'localize',
    'ReportsFactory',
    '$location',
    'FeatureFlagService',
    'FuseFlag',
    GrossProductionGaugeWidgetController,
  ]);

function GrossProductionGaugeWidgetController(
  $scope,
  widgetInitStatus,
  widgetFactory,
  $timeout,
  localize,
  reportsFactory,
  $location,
  featureFlagService,
  fuseFlag
) {
  BaseCtrl.call(this, $scope, 'GrossProductionGaugeWidgetController');
  var ctrl = this;
  ctrl.userData = $scope.data.userData;
  ctrl.widgetId = $scope.data.ItemId;
  ctrl.allData = null;

  $scope.gaugeData = null;
  $scope.dateFilter = null;
  $scope.dateFilterOptions = null;
  ctrl.reportId = 21;
  $scope.dateFilterChanged = function (filterValue) {
    if (filterValue && $scope.dateFilter !== filterValue) {
      $scope.dateFilter = filterValue;
      ctrl.getWidgetData($scope.dateFilter);
    }
  };

  ctrl.updateGauge = function (dateOption) {
    if (!ctrl.allData || !dateOption) {
      return;
    }
    var rangeData = ctrl.allData[dateOption].SeriesData;
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

  ctrl.processData = function (data) {
    ctrl.allData = data.Data;
    $scope.dateFilterOptions = data.FilterList.map(function (key) {
      return { Value: key };
    });
    $timeout(function () {
      $scope.dateFilter = data.DefaultFilter;
      ctrl.updateGauge($scope.dateFilter);
    });
  };

  ctrl.getWidgetData = function (dateOption) {
    $scope.$emit('WidgetLoadingStarted');
    var userIds = [ctrl.userData && ctrl.userData.UserId];
    var launchDarklyStatus = false;
    var filterResult = widgetFactory.GetFilterDto(dateOption, null, userIds);
    if ($location.$$url === '/BusinessCenter/PracticeAtAGlance') {
      widgetFactory.GetGrossProduction(filterResult).then(
        function (res) {
          ctrl.processData(res.Value);
          $scope.$emit('WidgetLoadingDone');
        },
        function () {
          $scope.$emit('WidgetLoadingError', 'Failed to load data.');
        }
      );
    } else {
      featureFlagService.getOnce$(fuseFlag.DashboardGrossProductionWidgetMvp).subscribe((value) => {
        launchDarklyStatus = value;
      });
      filterResult["LaunchDarklyStatus"] = launchDarklyStatus;
      widgetFactory.GetUserDashboardGrossProduction(filterResult).then(
        function (res) {
          ctrl.processData(res.Value);
          $scope.$emit('WidgetLoadingDone');
        },
        function () {
          $scope.$emit('WidgetLoadingError', 'Failed to load data.');
        }
      );
    }
    //widgetFactory.GetGrossProduction(filterResult).then(
    //    function (res) {
    //        ctrl.processData(res.Value);
    //        $scope.$emit('WidgetLoadingDone');
    //    },
    //    function () {
    //        $scope.$emit('WidgetLoadingError', 'Failed to load data.');
    //    }
    //);
  };

  ctrl.processInitMode = function (mode) {
    if (mode === widgetInitStatus.Loaded) {
      ctrl.processData($scope.data.initData);
    } else if (mode === widgetInitStatus.ToLoad) {
      ctrl.getWidgetData();
    }
  };

  $scope.$watch('data.initMode', function (nv) {
    ctrl.processInitMode(nv);
  });
  //Gross Production Widget Drill Down(redirection to other tab)
  $scope.drilldown = function (e) {
    var filter = widgetFactory.GetReportFilterDto(
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
}

GrossProductionGaugeWidgetController.prototype = Object.create(
  BaseCtrl.prototype
);
