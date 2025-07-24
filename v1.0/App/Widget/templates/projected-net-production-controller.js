'use strict';

angular
  .module('Soar.Widget')
  .controller('ProjectedNetProductionController', [
    '$scope',
    'WidgetFactory',
    'WidgetBarChartStyle',
    'WidgetInitStatus',
    ProjectedNetProductionController,
  ]);
function ProjectedNetProductionController(
  $scope,
  factory,
  widgetBarChartStyle,
  widgetInitStatus
) {
  BaseCtrl.call(this, $scope, 'ProjectedNetProductionController');
  var ctrl = this;
  ctrl.getWidgetData = function () {
    $scope.$emit('WidgetLoadingStarted');
    var filterResult = factory.GetFilterDto(null, $scope.data.Locations, null);
    factory.GetProjectedNetProduction(filterResult).then(
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
    $scope.projectedNetProductionModel = data;
    if (!_.isNil($scope.data)) {
      $scope.projectedNetProductionModel.title = $scope.data.Title;
      $scope.projectedNetProductionModel.locationIds = $scope.data.Locations;
    }
    $scope.projectedNetProductionModel.isCurrency = true;
    $scope.projectedNetProductionModel.barStyle = widgetBarChartStyle.Flat;

    $scope.projectedNetProductionModel.reportId = 56;
  };

  ctrl.processInitMode = function (mode) {
    if (mode === widgetInitStatus.Loaded) {
      ctrl.processData($scope.data.initData);
    } else if (mode === widgetInitStatus.ToLoad) {
      ctrl.getWidgetData();
    }
  };

  // handle different init modes.
  $scope.$watch('data.initMode', function (nv, ov) {
    ctrl.processInitMode(nv);
  });

  $scope.$on('locationsUpdated', function () {
    ctrl.getWidgetData();
  });
}

ProjectedNetProductionController.prototype = Object.create(BaseCtrl.prototype);
