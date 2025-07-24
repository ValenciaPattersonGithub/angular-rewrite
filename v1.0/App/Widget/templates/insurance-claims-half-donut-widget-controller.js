'use strict';

angular
  .module('Soar.Widget')
  .controller('InsuranceClaimsHalfDonutWidgetController', [
    '$scope',
    'localize',
    'WidgetInitStatus',
    '$filter',
    'WidgetFactory',
    '$timeout',
    '$location',
    'locationService',
    'FeatureFlagService',
    'FuseFlag',
    InsuranceClaimsHalfDonutWidgetController,
  ]);

function InsuranceClaimsHalfDonutWidgetController(
  $scope,
  localize,
  widgetInitStatus,
  $filter,
  factory,
  $timeout,
  $location,
  locationService,
  featureFlagService,
  fuseFlag
) {
  BaseCtrl.call(this, $scope, 'InsuranceClaimsHalfDonutWidgetController');

  var ctrl = this;
  var colors = {
    Unsubmitted: '#FF674C',
    Submitted: '#FFB34C',
    Alerts: '#D25E59',
    Paid: '#7FDE8E',
  };

  $scope.insuranceClaimsData = [];

  ctrl.isLoading = false; // Prevents multiple calls
  var dateOption = null;
  var launchDarklyStatus = false;

  $scope.filterChanged = function (type) {
    if (!_.isNull(type) && type != dateOption && !ctrl.isLoading) {
      dateOption = type;
      ctrl.loadData();
    }
  };

  // gets the data via POST or GET
  ctrl.loadData = function () {
    $scope.$emit('WidgetLoadingStarted');
    ctrl.isLoading = true;

    var firstLocationId = locationService.getCurrentLocation();

    // Pass parameter to the service
    var filterResult = factory.GetFilterDto(
      dateOption,
      firstLocationId.id,
      null
    );
    if ($location.$$url === '/BusinessCenter/PracticeAtAGlance') {
      factory.GetInsuranceClaims(filterResult).then(
        function (res) {
          if (res && res.Value) {
            ctrl.processData(res.Value);
          }
          $scope.$emit('WidgetLoadingDone');
        },
        function () {
          $scope.$emit(
            'WidgetLoadingError',
            localize.getLocalizedString('Failed to load data.')
          );
        }
      );
    } else {

      featureFlagService.getOnce$(fuseFlag.DashboardInsuranceClaimsWidgetMvp).subscribe((value) => {
          launchDarklyStatus = value;
      });
      filterResult["LaunchDarklyStatus"] = launchDarklyStatus;
      factory.GetUserDashboardInsuranceClaims(filterResult).then(
        function (res) {
          if (res && res.Value) {
            ctrl.processData(res.Value);
          }
          $scope.$emit('WidgetLoadingDone');
        },
        function () {
          $scope.$emit(
            'WidgetLoadingError',
            localize.getLocalizedString('Failed to load data.')
          );
        }
      );
    }
    //factory.GetInsuranceClaims(filterResult).then(
    //        function (res) {
    //            if (res && res.Value) {
    //                ctrl.processData(res.Value);
    //            }
    //            $scope.$emit('WidgetLoadingDone');
    //        },
    //        function () {
    //            $scope.$emit('WidgetLoadingError', localize.getLocalizedString('Failed to load data.'));
    //        }
    //    );
  };

  ctrl.processData = function (data) {
    $scope.insuranceClaimsData = [];
    $scope.displayTypeOptions = _.map(data.FilterList, function (filter) {
      return { display: localize.getLocalizedString(filter), value: filter };
    });
    $timeout(function () {
      if (_.isNull(dateOption)) {
        $scope.selectedDisplayType = dateOption = data.DefaultFilter;
      }
    }, 100);
    var seriesData =
      data.Data[_.isNull(dateOption) ? data.DefaultFilter : dateOption]
        .SeriesData;
    _.each(seriesData, function (item) {
      var displayItem = {
        SeriesName: item.SeriesName,
        Category: localize.getLocalizedString(item.Category),
        Value: item.Value,
        label: $filter('currency')(
          item.Value,
          '$',
          item.Value % 1 === 0 ? 0 : 2
        ),
      };

      if (colors[item.Category]) displayItem.color = colors[item.Category];

      $scope.insuranceClaimsData.push(displayItem);
    });
    ctrl.isLoading = false;
  };

  ctrl.processInitMode = function processInitMode(mode) {
    if (mode === widgetInitStatus.Loaded) {
      var data = $scope.data.initData;
      ctrl.processData(data);
    } else if (mode === widgetInitStatus.ToLoad) {
      ctrl.loadData();
    }
  };

  $scope.$watch('data.initMode', function (nv) {
    ctrl.processInitMode(nv);
  });

  $scope.$on('locationsUpdated', function () {
    ctrl.loadData();
  });
}

InsuranceClaimsHalfDonutWidgetController.prototype = Object.create(
  BaseCtrl.prototype
);
