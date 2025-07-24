'use strict';

angular
  .module('Soar.Widget')
  .controller('CollectionToNetProductionGaugeWidgetController', [
    '$scope',
    'WidgetFactory',
    'WidgetInitStatus',
    'localize',
    'WidgetDateFilterValues',
    '$timeout',
    '$location',
    'FeatureFlagService',
    'FuseFlag',
    CollectionToNetProductionGaugeWidgetController,
  ]);

function CollectionToNetProductionGaugeWidgetController(
  $scope,
  factory,
  widgetInitStatus,
  localize,
  widgetDateFilterValues,
  $timeout,
  $location,
  featureFlagService,
  fuseFlag
) {
  BaseCtrl.call(this, $scope, 'CollectionToNetProductionGaugeWidgetController');
  var ctrl = this;

  $scope.collectionToNetProductionDateFilterOptions = null;
  $scope.collectionToNetProductionDateFilter = null;
  $scope.gaugeData = null;
  
  var launchDarklyStatus = false;

  ctrl.updateGauge = function (allData) {
    var rangeData =
      allData[$scope.collectionToNetProductionDateFilter].SeriesData;
    var gaugeData = [];
    var percent = 0;
    var production = _.find(rangeData, function (e) {
      return e.Category === 'Production';
    });
    var collections = _.find(rangeData, function (e) {
      return e.Category === 'Collections';
    });
    if (production.Value) {
      percent = Math.round((collections.Value * 100.0) / production.Value);
    }
    var category =
      $scope.collectionToNetProductionDateFilter ===
        widgetDateFilterValues.MonthToDate ||
      $scope.collectionToNetProductionDateFilter ===
        widgetDateFilterValues.LastMonth
        ? localize.getLocalizedString('of monthly production')
        : localize.getLocalizedString('of yearly production');
    gaugeData.push(collections);
    gaugeData.push({
      Color: production.Color,
      Value: production.Value - collections.Value,
    });
    gaugeData.push({
      SeriesName: '_hole_',
      Category: category,
      label: percent + localize.getLocalizedString('%'),
    });
    $scope.gaugeData = gaugeData;
  };

  ctrl.getWidgetData = function (dateOption) {
    var filterResult = factory.GetFilterDto(
      dateOption,
      $scope.data.Locations,
      null
    );
    if ($location.$$url === '/BusinessCenter/PracticeAtAGlance') {
      featureFlagService.getOnce$(fuseFlag.CollectionToNetProductionWidget).subscribe((value) => {
        launchDarklyStatus = value;
      
      });
      filterResult["LaunchDarklyStatus"] = launchDarklyStatus;
    }
    $scope.$emit('WidgetLoadingStarted');
    
    factory.GetCollectionToNetProduction(filterResult).then(
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
    $scope.collectionToNetProductionDateFilterOptions = Object.values(
      data.FilterList
    ).map(function (value) {
      return { Value: value };
    });
    $timeout(function () {
      if ($scope.collectionToNetProductionDateFilter != data.DefaultFilter) {
        $scope.collectionToNetProductionDateFilter = data.DefaultFilter;
      }
      ctrl.updateGauge(data.Data);
    }, 200);
  };

  ctrl.processInitMode = function (mode) {
    if (mode === widgetInitStatus.Loaded) {
      ctrl.processData($scope.data.initData);
    } else if (mode === widgetInitStatus.ToLoad) {
      ctrl.getWidgetData(widgetDateFilterValues.YearToDate);
    }
  };

  $scope.onDateFilterChange = function (dateOption) {
    if (
      !_.isNull(dateOption) &&
      !_.isNull($scope.collectionToNetProductionDateFilter)
    ) {
      ctrl.getWidgetData(dateOption);
    }
  };

  $scope.$watch('data.initMode', function (nv) {
    ctrl.processInitMode(nv);
  });

  $scope.$on('locationsUpdated', function () {
    ctrl.getWidgetData($scope.collectionToNetProductionDateFilter);
  });
}

CollectionToNetProductionGaugeWidgetController.prototype = Object.create(
  BaseCtrl.prototype
);
