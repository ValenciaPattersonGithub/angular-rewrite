'use strict';

angular
  .module('Soar.Widget')
  .controller('NegativeAdjustmentController', [
    '$scope',
    'WidgetFactory',
    'WidgetBarChartStyle',
    'WidgetInitStatus',
    '$location',
    'FeatureFlagService',
    'FuseFlag',
    NegativeAdjustmentController,
  ]);
function NegativeAdjustmentController(
  $scope,
  factory,
  widgetBarChartStyle,
  widgetInitStatus,
  $location,
  featureFlagService,
  fuseFlag
) {
  BaseCtrl.call(this, $scope, 'NegativeAdjustmentController');
  var ctrl = this;
  ctrl.dateSelection = null;
  
  var launchDarklyStatus = false;

  ctrl.getWidgetData = function (dateOption) {
    var filterResult = factory.GetFilterDto(dateOption, $scope.data.Locations, null);
    if ($location.$$url === '/BusinessCenter/PracticeAtAGlance') {
      featureFlagService.getOnce$(fuseFlag.NegativeAdjustmentsWidget).subscribe((value) => {
        launchDarklyStatus = value;
      
      });
      filterResult["LaunchDarklyStatus"] = launchDarklyStatus;
    }
    ctrl.dateSelection = dateOption;
    $scope.$emit('WidgetLoadingStarted');
    factory
      .GetNegativeAdjustment(filterResult)
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
    $scope.negativeAdjustmentModel = data;
    if (!_.isNil($scope.data)) {
      $scope.negativeAdjustmentModel.title = $scope.data.Title;
      $scope.negativeAdjustmentModel.locationIds = $scope.data.Locations;
    }
    $scope.negativeAdjustmentModel.isCurrency = true;
    $scope.negativeAdjustmentModel.barStyle = widgetBarChartStyle.Flat;
    $scope.negativeAdjustmentModel.reportId = 22;
    $scope.negativeAdjustmentModel.adjustmentTypeFieldName =
      'NegativeAdjustmentTypeIds';
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

  $scope.$watch('data.initMode', function (nv, ov) {
    ctrl.processInitMode(nv);
  });

  $scope.$on('locationsUpdated', function () {
    ctrl.getWidgetData(ctrl.dateSelection);
  });
}

NegativeAdjustmentController.prototype = Object.create(BaseCtrl.prototype);
