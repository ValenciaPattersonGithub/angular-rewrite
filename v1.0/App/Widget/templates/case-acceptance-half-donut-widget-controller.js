'use strict';

angular
  .module('Soar.Widget')
  .controller('CaseAcceptanceHalfDonutWidgetController', [
    '$scope',
    'WidgetInitStatus',
    'WidgetFactory',
    'localize',
    '$filter',
    'ReportsFactory',
    CaseAcceptanceHalfDonutWidgetController,
  ]);

function CaseAcceptanceHalfDonutWidgetController(
  $scope,
  widgetInitStatus,
  widgetFactory,
  localize,
  $filter,
  reportsFactory
) {
  BaseCtrl.call(this, $scope, 'CaseAcceptanceHalfDonutWidgetController');
  var ctrl = this;

  $scope.caseAccData = null;
  $scope.caseAccSeriesData = null;
  $scope.caseAccDateFilter = null;
  $scope.caseAccDateFilterOptions = null;
  $scope.caseAccFromDate = null;
  $scope.caseAccToDate = null;
  var caseAccStartDate = null;
  var caseAccEndDate = null;
  ctrl.isLoading = false; // Prevents multiple calls
  var emptyGuid = '00000000-0000-0000-0000-000000000000';

  $scope.onDateFilterChange = function (dateOption) {
    $scope.caseAccDateFilter = _.isNull(dateOption) ? 'MTD' : dateOption;
    caseAccStartDate =
      dateOption === 'Date Range' ? $scope.caseAccFromDate : null;
    caseAccEndDate = dateOption === 'Date Range' ? $scope.caseAccToDate : null;
    if (!ctrl.isLoading && !_.isNull(dateOption)) {
      ctrl.getWidgetData();
    }
  };

  $scope.clearFilters = function () {
    $scope.$broadcast('dateSelector.clear');
    $scope.caseAccFromDate = null;
    $scope.caseAccToDate = null;
  };

  $scope.tooltip = {
    visible: true,
    template: function (e) {
      return $filter('currency')(e.value, '$', 2);
    },
  };

  ctrl.updateDonut = function () {
    if (!$scope.caseAccData || !$scope.caseAccDateFilter) {
      return;
    }
    var rangeData = $scope.caseAccData[$scope.caseAccDateFilter].SeriesData;
    $scope.caseAccSeriesData = [];
    _.each(rangeData, function (item) {
      var displayItem = {
        Category: localize.getLocalizedString(item.Category),
        Value: item.Value,
        color: item.Color,
        label: $filter('currency')(item.Value, '$', 2),
      };
      $scope.caseAccSeriesData.push(displayItem);
    });
    var accepted = _.find(rangeData, function (item) {
      return item.Category === 'Accepted';
    }).Value;
    var proposed = _.find(rangeData, function (item) {
      return item.Category === 'Proposed';
    }).Value;
    var ratio = 0;
    if (accepted || proposed) {
      ratio = Math.round((100 * accepted) / (accepted + proposed));
    }
    $scope.caseAccSeriesData.push({
      SeriesName: '_hole_',
      Category: localize.getLocalizedString('Case Acceptance'),
      label: ratio + localize.getLocalizedString('%'),
    });
  };

  $scope.drilldown = function (e) {
    e.preventDefault();
    $scope.caseAccDateFilter = _.isNull($scope.caseAccDateFilter)
      ? 'MTD'
      : $scope.caseAccDateFilter;
    var filter = widgetFactory.GetReportFilterDtoForCaseAcceptance(
      $scope.data.Locations,
      $scope.caseAccDateFilter,
      caseAccStartDate,
      caseAccEndDate,
      e.category || e.text
    );
    var dateNow = moment().format('MM/DD/YYYY');
    sessionStorage.setItem('dateType', $scope.caseAccDateFilter);
    var toCheck = moment(filter.PresetFilterDto.StartDate).format('MM/DD/YYYY');
    reportsFactory.GetSpecificReports([34]).then(function (res) {
      if (res && res.Value) {
        var report = res.Value[0];
        report.Route =
          '/BusinessCenter/' +
          report.Route.charAt(0).toUpperCase() +
          report.Route.slice(1);
        report.FilterProperties = report.RequestBodyProperties;
        report.Amfa = reportsFactory.GetAmfaAbbrev(report.ActionId);
        reportsFactory.OpenReportPageWithContext(report, report.Route, filter);
        reportsFactory.ClearReportContext();
      }
    });
  };

  ctrl.processData = function (data) {
    $scope.caseAccData = data.Data;
    $scope.caseAccDateFilterOptions =
      $scope.caseAccDateFilterOptions ||
      _.map(data.FilterList, function (filter) {
        return { display: localize.getLocalizedString(filter), value: filter };
      });
    $scope.caseAccDateFilter = data.DefaultFilter;
    ctrl.updateDonut();
  };

  ctrl.checkForEmptyGuid = function (locations) {
    return _.find(locations, function (o) {
      return o === emptyGuid;
    });
  };

  ctrl.getWidgetData = function () {
    ctrl.isLoading = true;
    $scope.$emit('WidgetLoadingStarted');
    var filterResult = widgetFactory.GetFilterDto(
      $scope.caseAccDateFilter,
      $scope.data.Locations,
      null,
      caseAccStartDate,
      caseAccEndDate
    );
    widgetFactory.GetCaseAcceptance(filterResult).then(
      function (res) {
        ctrl.processData(res.Value);
        $scope.$emit('WidgetLoadingDone');
      },
      function () {
        $scope.$emit(
          'WidgetLoadingError',
          localize.getLocalizedString('Failed to load data.')
        );
      }
    );
    ctrl.isLoading = false;
  };

  ctrl.processInitMode = function (initMode) {
    if (initMode === widgetInitStatus.Loaded) {
      ctrl.processData($scope.data.initData);
    }
    if (initMode === widgetInitStatus.ToLoad) {
      ctrl.getWidgetData();
    }
  };

  $scope.$watch('data.initMode', function (nv) {
    ctrl.processInitMode(nv);
  });
  $scope.$on('locationsUpdated', function () {
    ctrl.getWidgetData();
  });
}

CaseAcceptanceHalfDonutWidgetController.prototype = Object.create(
  BaseCtrl.prototype
);
