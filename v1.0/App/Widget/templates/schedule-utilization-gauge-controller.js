'use strict';

angular
  .module('Soar.Widget')
  .controller('ScheduleUtilizationGaugeController', [
    '$scope',
    '$timeout',
    'WidgetFactory',
    'WidgetInitStatus',
    'localize',
    '$filter',
    'FeatureFlagService',
    'FuseFlag',
    ScheduleUtilizationGaugeController,
  ]);
function ScheduleUtilizationGaugeController(
  $scope,
  $timeout,
  widgetFactory,
  widgetInitStatus,
  localize,
  $filter,
  featureFlagService,
  fuseFlag
) {
  // $scope.data is passed down from the dashboard-item directive. It will be used to
  //  pass filters and the definition of the dashboard item. The size information actually get passed into here
  BaseCtrl.call(this, $scope, 'ScheduleUtilizationGaugeController');
  var ctrl = this;
  var launchDarklyStatus = false;

  //PBI:362173 Hide this feature for userdashboard
  // $scope.isUserWidget = $scope.data.ItemId === 21;
  // ctrl.userData = $scope.data.userData;

  $scope.schedUtilData = null;
  $scope.schedUtilUtilizationData = null;
  $scope.schedUtilDateFilter = null;
  $scope.schedUtilDateFilterOptions = null;
  $scope.schedUtilFromDate = null;
  $scope.schedUtilToDate = null;
  var schedUtilDate = null;
  var schedUtilSelectedToDate = null;
  var schedUtilSelectedFromDate = null;

  $scope.onDateFilterChange = function (dateOption) {
    if (!_.isNull(dateOption)) {
      schedUtilDate = dateOption;
      schedUtilSelectedToDate = $scope.schedUtilToDate;
      schedUtilSelectedFromDate = $scope.schedUtilFromDate;
      ctrl.getWidgetData(
        dateOption,
        $scope.schedUtilFromDate,
        $scope.schedUtilToDate
      );
    }
  };

  ctrl.updateGauge = function (dateOption) {
    if (!$scope.schedUtilData || !dateOption) {
      return;
    }
    var rangeData = $scope.schedUtilData[dateOption].SeriesData;
    $scope.schedUtilUtilizationData = [];
    rangeData.forEach(function (item) {
      var displayItem = {
        Category: localize.getLocalizedString(item.Category),
        Value: item.Value,
        color: item.Color,
      };
      $scope.schedUtilUtilizationData.push(displayItem);
    });
    var booked = _.find(rangeData, function (item) {
      return item.Category === 'TotalMinutesBooked';
    }).Value;
    var available = _.find(rangeData, function (item) {
      return item.Category === 'TotalMinutesAvailable';
    }).Value;
    var ratio = 0;
      var total = booked + available;
      if (total) {
          ratio = +((100 * booked) / total).toFixed(1);
    }
    $scope.schedUtilUtilizationData.push({
      SeriesName: '_hole_',
      Category: localize.getLocalizedString('Booked'),
      label: ratio + localize.getLocalizedString('%'),
    });
  };

  ctrl.processData = function (data) {
    $scope.schedUtilData = data.Data;
    $scope.schedUtilDateFilterOptions =
      $scope.schedUtilDateFilterOptions ||
      data.FilterList.map(function (filter) {
        return { display: localize.getLocalizedString(filter), value: filter };
      });
    $timeout(function () {
      $scope.schedUtilDateFilter = data.DefaultFilter;
      ctrl.updateGauge($scope.schedUtilDateFilter);
    }, 300);
  };

  ctrl.getWidgetData = function (dateOption, startDate, endDate) {
    $scope.$emit('WidgetLoadingStarted');
    if (!$scope.providerFilter && ctrl.userData && ctrl.userData.UserId) {
      $scope.providerFilter = ctrl.userData.UserId;
    }

    let providerArray = [];
    if ($scope.providerFilter) providerArray.push($scope.providerFilter);

    featureFlagService.getOnce$(fuseFlag.DashboardScheduleUtilizationWidgetMvp).subscribe((value) => {
        launchDarklyStatus = value;
    });
    var filter = widgetFactory.GetFilterDto(
      dateOption,
      $scope.data.Locations,
      providerArray,
      $scope.schedUtilFromDate,
      $scope.schedUtilToDate,
      launchDarklyStatus
    );
    widgetFactory.GetScheduleUtilization(filter).then(
      function (res) {
        ctrl.processData(res.Value);
        $scope.$emit('WidgetLoadingDone');
      },
      function () {
        $scope.$emit(
          'WidgetLoadingError',
          localize.getLocalizedString('Failed to load data.')
        );
      }
    );
  };

  ctrl.processInitMode = function (initMode) {
    if (initMode === widgetInitStatus.Loaded) {
      ctrl.processData($scope.data.initData);
    }
    if (initMode === widgetInitStatus.ToLoad) {
      ctrl.getWidgetData();
    }
  };

  $scope.$watch('data.initMode', function (nv, ov) {
    ctrl.processInitMode(nv);
  });

  $scope.$on('locationsUpdated', function () {
    if ($scope.date === 'Date Range') {
      ctrl.getWidgetData(
        schedUtilDate,
        schedUtilSelectedFromDate,
        schedUtilSelectedToDate
      );
    } else {
      ctrl.getWidgetData(schedUtilDate);
    }
    $scope.data.Refresh = false;
  });

  $scope.clearFilters = function () {
    $scope.$broadcast('dateSelector.clear');
    $scope.schedUtilFromDate = null;
    $scope.schedUtilToDate = null;
  };
  //PBI:362173 Hide this feature for userdashboard
  // handle different init modes.
  // invoke this after the rendering is done.
  //$timeout(function () {
  //    if ($scope.isUserWidget) {
  //        $scope.providerFilterOptions = [{ display: $filter('getFullNameWithProfessionalDesignation')(ctrl.userData), id: ctrl.userData.UserId }];
  //        $timeout(function () {
  //            $scope.providerFilter = ctrl.userData.UserId;
  //        });
  //    }
  //});
}

ScheduleUtilizationGaugeController.prototype = Object.create(
  BaseCtrl.prototype
);
