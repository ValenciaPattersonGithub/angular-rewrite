'use strict';

angular
  .module('Soar.Widget')
  .controller('ReceivablesHalfDonutController', [
    '$scope',
    'localize',
    'WidgetInitStatus',
    'WidgetFactory',
    '$window',
    '$location',
    'locationService',
    'tabLauncher',
    'FeatureFlagService',
    'FuseFlag',
    ReceivablesHalfDonutController,
  ]);

function ReceivablesHalfDonutController(
  $scope,
  localize,
  widgetInitStatus,
  factory,
  $window,
  $location,
  locationService,
  tabLauncher,
  featureFlagService,
  fuseFlag
) {
  BaseCtrl.call(this, $scope, 'ReceivablesHalfDonutController');
  var ctrl = this;
  var DisplayType_All = 0;
  var DisplayType_Patient_Only = 1;
  var DisplayType_Insurance_Only = 2;
  var launchDarklyStatus = false;
  ctrl.isLoading = false; // Prevents multiple calls
  ctrl.selectedType = DisplayType_All;
  ctrl.drilldownUrl = '#/BusinessCenter/Receivables/TotalReceivables/';
  var tabNames = [
    'balanceCurrent',
    'balance30',
    'balance60',
    'balance90',
    'inCollections',
  ];
  var emptyGuid = '00000000-0000-0000-0000-000000000000';

  $scope.receivablesData = [];

  $scope.filterChanged = function (type) {
    if (!ctrl.isLoading) {
      ctrl.selectedType = type;
      ctrl.loadData(type);
    }
  };

  $scope.displayTypeOptions = [
    { name: localize.getLocalizedString('All'), value: DisplayType_All },
    {
      name: localize.getLocalizedString('Patient Only'),
      value: DisplayType_Patient_Only,
    },
    {
      name: localize.getLocalizedString('Insurance Only'),
      value: DisplayType_Insurance_Only,
    },
  ];
  $scope.selectedDisplayType = DisplayType_All;
  $scope.selectedType = DisplayType_All;

  $scope.drilldown = function (e) {
    e.preventDefault();
    var category = e.category || e.text;
    var categoryIndex = null;
    _.each($scope.receivablesData, function (value, key) {
      if (value.Category === category) {
        categoryIndex = key;
      }
    });
    if (category != null) {
      var tabName = tabNames[categoryIndex];
      tabLauncher.launchNewTab(ctrl.drilldownUrl + tabName);
    }
  };

  ctrl.checkForEmptyGuid = function (locations) {
    return _.find(locations, function (o) {
      return o === emptyGuid;
    });
  };
  // gets the report via POST or GET
  ctrl.loadData = function (amountType) {
    $scope.$emit('WidgetLoadingStarted');
    ctrl.isLoading = true;
      var firstLocationId = locationService.getCurrentLocation();
    ctrl.hasEmptyGuid =
      amountType === 0
        ? ctrl.checkForEmptyGuid(firstLocationId.id)
        : undefined;
    var filters = factory.GetFilterDto(
      null,
        _.isUndefined(ctrl.hasEmptyGuid) ? firstLocationId.id : [0],
      null
    );
    filters['AmountType'] = amountType;

    if ($location.$$url === '/BusinessCenter/PracticeAtAGlance') {
      factory.GetReceivables(filters).then(
        function (res) {
          if (res && res.Value) {
            $scope.receivablesData = res.Value.SeriesData;
          }
          $scope.$emit('WidgetLoadingDone');
        },
        function (res) {
          $scope.$emit(
            'WidgetLoadingError',
            localize.getLocalizedString('Failed to load data.')
          );
        }
      );
    } else {

      featureFlagService.getOnce$(fuseFlag.DashboardReceivablesWidgetMvp).subscribe((value) => {
          launchDarklyStatus = value;
      });
      filters["LaunchDarklyStatus"] = launchDarklyStatus;
      // Pass parameter to the service
      factory.GetUserDashboardReceivables(filters).then(
        function (res) {
          if (res && res.Value) {
            $scope.receivablesData = res.Value.SeriesData;
          }
          $scope.$emit('WidgetLoadingDone');
        },
        function (res) {
          $scope.$emit(
            'WidgetLoadingError',
            localize.getLocalizedString('Failed to load data.')
          );
        }
      );
    }

    // Pass parameter to the service
    //factory.GetReceivables(filters).then(
    //    function (res) {
    //        if (res && res.Value) {
    //            $scope.receivablesData = res.Value.SeriesData;
    //        }
    //        $scope.$emit('WidgetLoadingDone');
    //    },
    //    function (res) {
    //        $scope.$emit('WidgetLoadingError', localize.getLocalizedString('Failed to load data.'));
    //    }
    //);
    ctrl.isLoading = false;
  };

  ctrl.processInitMode = function processInitMode(mode) {
    if (mode === widgetInitStatus.Loaded) {
      $scope.receivablesData =
        $scope.data.initData.Data[
          $scope.data.initData.DefaultFilter
        ].SeriesData;
    } else if (mode === widgetInitStatus.ToLoad) {
      ctrl.loadData(ctrl.selectedType);
    }
  };

  $scope.$watch('data.initMode', function (nv) {
    ctrl.processInitMode(nv);
  });

  $scope.$on('locationsUpdated', function () {
    ctrl.loadData(ctrl.selectedType);
  });
}

ReceivablesHalfDonutController.prototype = Object.create(BaseCtrl.prototype);
