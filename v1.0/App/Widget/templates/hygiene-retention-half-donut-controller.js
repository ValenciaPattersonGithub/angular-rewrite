'use strict';

angular
  .module('Soar.Widget')
  .controller('HygieneRetentionHalfDonutController', [
    '$scope',
    'localize',
    'WidgetInitStatus',
    'WidgetFactory',
    '$location',
    HygieneRetentionHalfDonutController,
  ]);

function HygieneRetentionHalfDonutController(
  $scope,
  localize,
  widgetInitStatus,
  factory,
  $location
) {
  BaseCtrl.call(this, $scope, 'HygieneRetentionHalfDonutController');

  var ctrl = this;
  var colors = {
    Scheduled: '#AEB5BA',
    Unscheduled: '#30AFCD',
  };

  $scope.hygieneRetentionData = [];

  ctrl.getWidgetData = function () {
    $scope.$emit('WidgetLoadingStarted');
    var filterResult = factory.GetFilterDto(null, $scope.data.Locations, null);
    if ($location.$$url === '/BusinessCenter/PracticeAtAGlance') {
      factory.GetHygieneRetention(filterResult).then(
        function (res) {
          ctrl.processData(res.Value.Data[res.Value.DefaultFilter].SeriesData);
          $scope.$emit('WidgetLoadingDone');
        },
        function () {
          $scope.$emit('WidgetLoadingError', 'Failed to load data.');
        }
      );
    } else {
      factory.GetUserDashboardHygieneRetention(filterResult).then(
        function (res) {
          ctrl.processData(res.Value.Data[res.Value.DefaultFilter].SeriesData);
          $scope.$emit('WidgetLoadingDone');
        },
        function () {
          $scope.$emit('WidgetLoadingError', 'Failed to load data.');
        }
      );
    }
    //factory.GetHygieneRetention(filterResult).then(
    //    function (res) {
    //        ctrl.processData(res.Value.Data[res.Value.DefaultFilter].SeriesData);
    //        $scope.$emit('WidgetLoadingDone');
    //    },
    //    function () {
    //        $scope.$emit('WidgetLoadingError', 'Failed to load data.');
    //    }
    //);
  };

  ctrl.processData = function (seriesData) {
    $scope.hygieneRetentionData = [];

    var scheduled = 0;
    var totalPatients = 0;

    _.each(seriesData, function (item) {
      var displayItem = {
        SeriesName: item.SeriesName,
        Category: localize.getLocalizedString(item.Category),
        Value: item.Value,
        label: item.Value + '\n' + localize.getLocalizedString('patients'),
      };

      if (colors[item.Category]) displayItem.color = colors[item.Category];

      $scope.hygieneRetentionData.push(displayItem);
      if (item.Category === 'Scheduled') scheduled = item.Value;
      totalPatients += item.Value;
    });

    var retentionRate = 0;
    if (totalPatients > 0)
      retentionRate = Math.round((scheduled * 100) / totalPatients);

    $scope.hygieneRetentionData.push({
      SeriesName: '_hole_',
      Category: localize.getLocalizedString('Retention'),
      Value: retentionRate,
      label: retentionRate + localize.getLocalizedString('%'),
    });
  };

  ctrl.processInitMode = function processInitMode(mode) {
    if (mode === widgetInitStatus.Loaded) {
      var data = $scope.data.initData.Data[$scope.data.initData.DefaultFilter];
      ctrl.processData(data.SeriesData);
    } else if (mode === widgetInitStatus.ToLoad) {
      ctrl.getWidgetData();
    }
  };

  // handle different init modes.
  // invoke this after the rendering is done.
  $scope.$watch('data.initMode', function (nv) {
    ctrl.processInitMode(nv);
  });

  $scope.$on('locationsUpdated', function () {
    ctrl.getWidgetData();
  });
}

HygieneRetentionHalfDonutController.prototype = Object.create(
  BaseCtrl.prototype
);
