'use strict';

angular
  .module('Soar.Widget')
  .controller('GrossProductionController', [
    '$scope',
    'WidgetFactory',
    'WidgetBarChartStyle',
    'WidgetInitStatus',
    '$location',
    'FeatureFlagService',
    'FuseFlag',
    GrossProductionController,
  ]);
function GrossProductionController(
  $scope,
  factory,
  widgetBarChartStyle,
  widgetInitStatus,
  $location,
  featureFlagService,
  fuseFlag
) {
  BaseCtrl.call(this, $scope, 'GrossProductionController');
  var ctrl = this;
  ctrl.widgetId = $scope.data.ItemId;
  ctrl.dateSelection = null;
  
  var launchDarklyStatus = false;

  ctrl.getWidgetData = function (dateOption) {
    var filterResult = factory.GetFilterDto(dateOption, $scope.data.Locations, null);
    if ($location.$$url === '/BusinessCenter/PracticeAtAGlance') {
      featureFlagService.getOnce$(fuseFlag.GrossProductionWidget).subscribe((value) => {
        launchDarklyStatus = value;
      
      });
      filterResult["LaunchDarklyStatus"] = launchDarklyStatus;
    }
    ctrl.dateSelection = dateOption;
    $scope.$emit('WidgetLoadingStarted');
    factory
      .GetGrossProduction(filterResult)
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
    $scope.grossProductionModel = data;
    if (!_.isNil($scope.data)) {
      $scope.grossProductionModel.title = $scope.data.Title;
      $scope.grossProductionModel.locationIds = $scope.data.Locations;
    }
    $scope.grossProductionModel.isCurrency = true;
    $scope.grossProductionModel.barStyle = widgetBarChartStyle.Flat;
    $scope.grossProductionModel.reportId = 21;
    $scope.grossProductionModel.adjustmentTypeFieldName = 'All';
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
  $scope.$watch('data.initMode', function (nv, ov) {
    ctrl.processInitMode(nv);
  });

  $scope.$on('locationsUpdated', function () {
    ctrl.getWidgetData(ctrl.dateSelection);
  });
}

GrossProductionController.prototype = Object.create(BaseCtrl.prototype);
