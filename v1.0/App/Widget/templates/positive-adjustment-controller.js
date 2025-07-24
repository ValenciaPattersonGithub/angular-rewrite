'use strict';

angular
  .module('Soar.Widget')
  .controller('PositiveAdjustmentController', [
    '$scope',
    'WidgetFactory',
    'WidgetBarChartStyle',
    'WidgetInitStatus',
    '$location',
    'FeatureFlagService',
    'FuseFlag',
    PositiveAdjustmentController,
  ]);
function PositiveAdjustmentController(
  $scope,
  factory,
  widgetBarChartStyle,
  widgetInitStatus,
  $location,
  featureFlagService,
  fuseFlag
) {
  BaseCtrl.call(this, $scope, 'PositiveAdjustmentController');
  var ctrl = this;
  ctrl.dateSelection = null;
  
  var launchDarklyStatus = false;

  ctrl.getWidgetData = function (dateOption) {
    var filterResult = factory.GetFilterDto(dateOption, $scope.data.Locations, null);
    if ($location.$$url === '/BusinessCenter/PracticeAtAGlance') {
      featureFlagService.getOnce$(fuseFlag.PositiveAdjustmentsWidget).subscribe((value) => {
        launchDarklyStatus = value;
      
      });
      filterResult["LaunchDarklyStatus"] = launchDarklyStatus;
    }
    ctrl.dateSelection = dateOption;
    $scope.$emit('WidgetLoadingStarted');
    factory
      .GetPositiveAdjustment(filterResult)
      .then(
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
    $scope.positiveAdjustmentModel = data;
    if (!_.isNil($scope.data)) {
      $scope.positiveAdjustmentModel.title = $scope.data.Title;
      $scope.positiveAdjustmentModel.locationIds = $scope.data.Locations;
    }
    $scope.positiveAdjustmentModel.isCurrency = true;
    $scope.positiveAdjustmentModel.barStyle = widgetBarChartStyle.Flat;
    $scope.positiveAdjustmentModel.reportId = 22;
    $scope.positiveAdjustmentModel.adjustmentTypeFieldName =
      'PositiveAdjustmentTypeIds';
  };

  ctrl.processInitMode = function (mode) {
    if (mode === widgetInitStatus.Loaded) {
      ctrl.processData($scope.data.initData);
    } else if (mode === widgetInitStatus.ToLoad) {
      ctrl.getWidgetData(null);
    }
  };

  $scope.onFilterCallback = function (dateOption) {
    ctrl.getWidgetData(dateOption);
  };
  // handle different init modes.
  // invoke this after the rendering is done.
  $scope.$watch('data.initMode', function (nv, ov) {
    ctrl.processInitMode(nv);
  });

  $scope.$on('locationsUpdated', function () {
    ctrl.getWidgetData(ctrl.dateSelection);
  });
}

PositiveAdjustmentController.prototype = Object.create(BaseCtrl.prototype);
