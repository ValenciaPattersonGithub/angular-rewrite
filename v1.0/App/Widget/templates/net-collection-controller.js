'use strict';

angular
  .module('Soar.Widget')
  .controller('NetCollectionController', [
    '$scope',
    'WidgetFactory',
    'WidgetBarChartStyle',
    'WidgetInitStatus',
    NetCollectionController,
  ]);
function NetCollectionController(
  $scope,
  factory,
  widgetBarChartStyle,
  widgetInitStatus
) {
  BaseCtrl.call(this, $scope, 'NetCollectionController');
  var ctrl = this;
  ctrl.dateSelection = null;

  ctrl.getWidgetData = function (dateOption) {
    $scope.$emit('WidgetLoadingStarted');
    factory
      .GetNetCollection(
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
    $scope.netCollectionModel = data;
    if (!_.isNil($scope.data)) {
      $scope.netCollectionModel.title = $scope.data.Title;
    }
    $scope.netCollectionModel.isCurrency = true;
    $scope.netCollectionModel.barStyle = widgetBarChartStyle.Flat;
    if (ctrl.dateSelection != data.DefaultFilter)
      ctrl.dateSelection = data.DefaultFilter;
  };

  ctrl.processInitMode = function (mode) {
    if (mode === widgetInitStatus.Loaded) {
      ctrl.processData($scope.data.initData);
    } else if (mode === widgetInitStatus.ToLoad) {
      ctrl.getWidgetData(null);
    }
  };

  $scope.onFilterCallback = function (dateOption) {
    if (dateOption) ctrl.getWidgetData(dateOption);
  };

  $scope.$watch('data.initMode', function (nv, ov) {
    ctrl.processInitMode(nv);
  });

  $scope.$on('locationsUpdated', function () {
    ctrl.getWidgetData(ctrl.dateSelection);
  });
}

NetCollectionController.prototype = Object.create(BaseCtrl.prototype);
