'use strict';

angular
    .module('Soar.Widget')
    .controller('NetProductionController', [
        '$scope',
        'WidgetFactory',
        'WidgetBarChartStyle',
        'WidgetInitStatus',
        NetProductionController,
    ]);
function NetProductionController(
    $scope,
    factory,
    widgetBarChartStyle,
    widgetInitStatus
) {
    BaseCtrl.call(this, $scope, 'NetProductionController');
    var ctrl = this;
    ctrl.dateSelection = null;

    ctrl.getWidgetData = function (dateOption) {
        ctrl.dateSelection = dateOption;
        $scope.$emit('WidgetLoadingStarted');
        factory
            .GetNetProduction(
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
        $scope.netProductionModel = data;
        if (!_.isNil($scope.data)) {
            $scope.netProductionModel.title = $scope.data.Title;
            $scope.netProductionModel.locationIds = $scope.data.Locations;
        }
        $scope.netProductionModel.isCurrency = true;
        $scope.netProductionModel.barStyle = widgetBarChartStyle.Flat;
        $scope.netProductionModel.reportId = 21;
        $scope.netProductionModel.adjustmentTypeFieldName = 'All';
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

NetProductionController.prototype = Object.create(BaseCtrl.prototype);
