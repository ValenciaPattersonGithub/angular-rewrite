'use strict';

angular
  .module('Soar.Widget')
  .controller('NewPatientsController', [
    '$scope',
    'WidgetFactory',
    'WidgetBarChartStyle',
    'WidgetInitStatus',
    NewPatientsController,
  ]);
function NewPatientsController(
  $scope,
  factory,
  widgetBarChartStyle,
  widgetInitStatus
) {
  BaseCtrl.call(this, $scope, 'NewPatientsController');
  var ctrl = this;
  ctrl.dateSelection = null;

  ctrl.getWidgetData = function (dateOption) {
    ctrl.dateSelection = dateOption;
    $scope.$emit('WidgetLoadingStarted');
    factory
      .GetNewPatients(factory.GetFilterDto(dateOption, $scope.data.Locations))
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
    $scope.newPatientsModel = data;
    if (!_.isNil($scope.data)) {
      $scope.newPatientsModel.title = $scope.data.Title;
      $scope.newPatientsModel.locationIds = $scope.data.Locations;
    }
    $scope.newPatientsModel.isCurrency = false;
    $scope.newPatientsModel.barStyle = widgetBarChartStyle.Pillar;
    $scope.newPatientsModel.reportId = 16;
  };

  ctrl.processInitMode = function (mode) {
    if (mode === widgetInitStatus.Loaded) {
      ctrl.processData($scope.data.initData);
    } else if (mode === widgetInitStatus.ToLoad) {
      ctrl.getWidgetData();
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

NewPatientsController.prototype = Object.create(BaseCtrl.prototype);
