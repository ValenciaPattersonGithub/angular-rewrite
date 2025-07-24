'use strict';

angular
  .module('Soar.Widget')
  .controller('PendingClaimsHalfDonutWidgetController', [
    '$scope',
    'localize',
    'WidgetInitStatus',
    'WidgetFactory',
    '$location',
    'locationService',
    'FeatureFlagService',
    'FuseFlag',
    PendingClaimsHalfDonutWidgetController,
  ]);

function PendingClaimsHalfDonutWidgetController(
  $scope,
  localize,
  widgetInitStatus,
  factory,
  $location,
  locationService,
  featureFlagService,
  fuseFlag
) {
  BaseCtrl.call(this, $scope, 'PendingClaimsHalfDonutWidgetController');

  $scope.pendingClaimsData = [];
  $scope.dateSelection = null;
  var ctrl = this;

  ctrl.addLegendTitle = function () {
    $scope.pendingClaimsData.push({
      SeriesName: '_hole_',
      Category: localize.getLocalizedString('Days Outstanding'),
      Value: null,
      label: null,
    });
  };

  // gets the report via POST
  ctrl.loadData = function () {
      $scope.$emit('WidgetLoadingStarted');
      var firstLocationId = locationService.getCurrentLocation();
      var filterResult = factory.GetFilterDto(null, firstLocationId.id, null);
      var launchDarklyStatus = false;
    if ($location.$$url === '/BusinessCenter/PracticeAtAGlance') {
      factory.GetPendingClaims(filterResult).then(
        function (res) {
          if (res && res.Value) {
            $scope.pendingClaimsData = res.Value.Data['Date Range'].SeriesData;
            ctrl.addLegendTitle();
          }
          $scope.$emit('WidgetLoadingDone');
        },
        function () {
          $scope.$emit('WidgetLoadingError', 'Failed to load data.');
        }
      );
    } else {
      featureFlagService.getOnce$(fuseFlag.DashboardPendingClaimsWidgetMvp).subscribe((value) => {
        launchDarklyStatus = value;
      });
      filterResult["LaunchDarklyStatus"] = launchDarklyStatus;
      factory.GetUserDashboardPendingClaims(filterResult).then(
        function (res) {
          if (res && res.Value) {
            $scope.pendingClaimsData = res.Value.Data['Date Range'].SeriesData;
            ctrl.addLegendTitle();
          }
          $scope.$emit('WidgetLoadingDone');
        },
        function () {
          $scope.$emit('WidgetLoadingError', 'Failed to load data.');
        }
      );
    }
    //factory.GetPendingClaims(filterResult).then(
    //    function (res) {
    //        if (res && res.Value) {
    //            $scope.pendingClaimsData = res.Value.Data["Date Range"].SeriesData;
    //            ctrl.addLegendTitle();
    //        }
    //        $scope.$emit('WidgetLoadingDone');
    //    },
    //    function () {
    //        $scope.$emit('WidgetLoadingError', 'Failed to load data.');
    //    }
    //);
  };

  ctrl.processInitMode = function processInitMode(mode) {
    if (mode === widgetInitStatus.Loaded) {
      $scope.pendingClaimsData =
        $scope.data.initData.Data['Date Range'].SeriesData;
      ctrl.addLegendTitle();
    } else if (mode === widgetInitStatus.ToLoad) {
      ctrl.loadData();
    }
  };

  // handle different init modes.
  // invoke this after the rendering is done.
  $scope.$watch('data.initMode', function (nv) {
    ctrl.processInitMode(nv);
  });

  $scope.$on('locationsUpdated', function () {
    ctrl.loadData();
  });
}

PendingClaimsHalfDonutWidgetController.prototype = Object.create(
  BaseCtrl.prototype
);
