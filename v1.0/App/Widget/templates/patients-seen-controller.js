'use strict';

angular
  .module('Soar.Widget')
  .controller('PatientsSeenController', [
    '$scope',
    'WidgetFactory',
    'WidgetBarChartStyle',
    'WidgetInitStatus',
    PatientsSeenController,
  ]);
function PatientsSeenController(
  $scope,
  factory,
  widgetBarChartStyle,
  widgetInitStatus
) {
  BaseCtrl.call(this, $scope, 'PatientsSeenController');
  var ctrl = this;
  ctrl.dateSelection = null;

  ctrl.getWidgetData = function (dateOption) {
    ctrl.dateSelection = dateOption;
    $scope.$emit('WidgetLoadingStarted');
    factory
      .GetPatientsSeen(
        factory.GetFilterDto(dateOption, $scope.data.Locations, null)
      )
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
    $scope.patientsSeenModel = data;
    if (!_.isNil($scope.data)) {
      $scope.patientsSeenModel.title = $scope.data.Title;
      $scope.patientsSeenModel.locationIds = $scope.data.Locations;
    }
    $scope.patientsSeenModel.isCurrency = false;
    $scope.patientsSeenModel.barStyle = widgetBarChartStyle.Pillar;
    $scope.patientsSeenModel.reportId = 14;
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

PatientsSeenController.prototype = Object.create(BaseCtrl.prototype);
