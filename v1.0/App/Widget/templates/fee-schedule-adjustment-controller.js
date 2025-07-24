'use strict';

angular
  .module('Soar.Widget')
  .controller('FeeScheduleAdjustmentController', [
    '$scope',
    'WidgetFactory',
    'WidgetBarChartStyle',
    'WidgetInitStatus',
    FeeScheduleAdjustmentController,
  ]);
function FeeScheduleAdjustmentController(
  $scope,
  factory,
  widgetBarChartStyle,
  widgetInitStatus
) {
  BaseCtrl.call(this, $scope, 'FeeScheduleAdjustmentController');
  var ctrl = this;
  ctrl.dateSelection = null;

  ctrl.getWidgetData = function (dateOption) {
    ctrl.dateSelection = dateOption;
    $scope.$emit('WidgetLoadingStarted');
    factory
      .GetFeeScheduleAdjustment(
        factory.GetFilterDto(dateOption, $scope.data.Locations, null)
      )
      .then(
        function (res) {
          ctrl.processData(res.Value);
          $scope.$emit('WidgetLoadingDone');
        },
        function () {
          $scope.$emit('WidgetLoadingError', 'Failed to load data');
        }
      );
  };

  ctrl.processData = function (data) {
    $scope.feeScheduleAdjustmentModel = data;
    if (!_.isNil($scope.data)) {
      $scope.feeScheduleAdjustmentModel.title = $scope.data.Title;
      $scope.feeScheduleAdjustmentModel.locationIds = $scope.data.Locations;
    }
    $scope.feeScheduleAdjustmentModel.isCurrency = true;
    $scope.feeScheduleAdjustmentModel.barStyle = widgetBarChartStyle.Flat;
    //$scope.feeScheduleAdjustmentModel.reportId = 37; // disable drilldown until pointed to correct report.
  };

  ctrl.processInitMode = function (mode) {
    if (mode === widgetInitStatus.Loaded) {
      ctrl.processData($scope.data.initData);
    } else if (mode === widgetInitStatus.ToLoad) {
      ctrl.getWidgetData(ctrl.dateSelection);
    }
  };

  $scope.onFilterCallback = function (dateOption) {
    ctrl.getWidgetData(dateOption);
  };

  $scope.$watch('data.initMode', function (nv, ov) {
    ctrl.processInitMode(nv);
  });

  $scope.$on('locationsUpdated', function () {
    ctrl.getWidgetData(ctrl.dateSelection);
  });
}

FeeScheduleAdjustmentController.prototype = Object.create(BaseCtrl.prototype);
