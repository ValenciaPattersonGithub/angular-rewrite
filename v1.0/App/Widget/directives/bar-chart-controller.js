'use strict';

angular
  .module('Soar.Widget')
  .controller('BarChartController', [
    '$scope',
    '$filter',
    'localize',
    '$timeout',
    'WidgetBarChartStyle',
    'ReportsFactory',
    'WidgetFactory',
    BarChartController,
  ]);

function BarChartController(
  $scope,
  $filter,
  localize,
  $timeout,
  widgetBarChartStyle,
  reportsFactory,
  widgetFactory
) {
  BaseCtrl.call(this, $scope, 'BarChartController');
  var ctrl = this;
  var chartData = null;
  var dataSource = null;
  var barStyle = null;
  var locationIds = null;
  var reportId = null;
  var adjustmentTypeFieldName = null;
  ctrl.patientSeenId = 14;
  ctrl.grossProductionId = 21;
  ctrl.newPatientsByComprehensiveExamReportId = 16;
  ctrl.isCurrency = null;
  $scope.dateFilter = null;
  $scope.totalValue = 0;
  $scope.dropdownOptions = null;
  $scope.showDropdown = !_.isUndefined($scope.showDropdown)
    ? $scope.showDropdown
    : true;
  ctrl.ProjectedNetProductionReportId = 56;
  ctrl.AdjustmentsByProviderReportId = 22;
  // The model isn't populated on initialization. Must watch for model to be populated.
  $scope.$watch('barChartModel', function (nv, ov) {
    if (nv) {
      ctrl.setModel(nv);
    }
  });

  $scope.dateFilterChanged = function () {
    if (
      ctrl.tempDateFilter &&
      $scope.dateFilter &&
      $scope.dateFilter !== 'NoFilter' &&
      !_.isEqual(ctrl.tempDateFilter, $scope.dateFilter)
    ) {
      if ($scope.onFilterChanged) {
        // First to check whether it is provided.
        if ($scope.dateFilter !== $scope.barChartModel.DefaultFilter)
          $scope.onFilterChanged({ dateOption: $scope.dateFilter });
        ctrl.tempDateFilter = $scope.dateFilter;
      } else ctrl.createChart();
    }
  };

  ctrl.setModel = function (model) {
    reportId = model.reportId;
    adjustmentTypeFieldName = model.adjustmentTypeFieldName;
    locationIds = model.locationIds;
    chartData = model.Data;
    if (model.FilterList && !_.isEmpty(model.FilterList))
      $scope.dropdownOptions = model.FilterList.map(function (key) {
        return { Value: key };
      });
    else
      $scope.dropdownOptions = Object.keys(chartData).map(function (key) {
        return { Value: key };
      });

    model.title = localize.getLocalizedString(model.title);
    barStyle = model.barStyle;
    ctrl.isCurrency = model.isCurrency;
    $timeout(function () {
      $scope.dateFilter = model.DefaultFilter;
      ctrl.tempDateFilter = $scope.dateFilter;
      ctrl.createChart();
    }, 100);
  };

  ctrl.createChart = function () {
    dataSource = chartData[$scope.dateFilter].SeriesData;
    $scope.totalValue = chartData[$scope.dateFilter].TotalValue
      ? chartData[$scope.dateFilter].TotalValue
      : dataSource.reduce(function (t, c) {
          return t + c.Value;
        }, 0);

    $scope.totalValue = ctrl.isCurrency
      ? $filter('currency')($scope.totalValue, '$')
      : $scope.totalValue;
    angular.element('#barChart-' + $scope.$id).kendoChart({
      dataSource: dataSource,
      tooltip: tooltip,
      valueAxis: valueAxis,
      categoryAxis: categoryAxis,
      series: series,
      seriesDefaults: ctrl.getSeriesDefaults(),
      panes: panes,
      axisLabelClick: $scope.drilldown,
      seriesClick: $scope.drilldown,
    });
  };

  ctrl.createPillar = function (value, rect, color) {
    var group = new kendo.drawing.Group();
    if (value) {
      var origin = rect.origin;
      var center = rect.center();
      var bottomRight = rect.bottomRight();
      var radiusX = rect.width() / 2;
      var radiusY = radiusX / 3;
      var gradient = new kendo.drawing.LinearGradient({
        stops: [
          {
            offset: 0,
            color: color,
          },
          {
            offset: 0.5,
            color: color,
            opacity: 0.9,
          },
          {
            offset: 0.5,
            color: color,
            opacity: 0.9,
          },
          {
            offset: 1,
            color: color,
          },
        ],
      });

      var path = new kendo.drawing.Path({
        fill: gradient,
        stroke: {
          color: 'none',
        },
      })
        .moveTo(origin.x, origin.y)
        .lineTo(origin.x, bottomRight.y)
        .arc(180, 0, radiusX, radiusY, true)
        .lineTo(bottomRight.x, origin.y)
        .arc(0, 180, radiusX, radiusY);

      var topArcGeometry = new kendo.geometry.Arc([center.x, origin.y], {
        startAngle: 0,
        endAngle: 360,
        radiusX: radiusX,
        radiusY: radiusY,
      });

      var topArc = new kendo.drawing.Arc(topArcGeometry, {
        fill: {
          color: color,
        },
        stroke: {
          color: '#ebebeb',
        },
      });
      group.append(path, topArc);
    }
    return group;
  };

  var panes = [
    {
      clip: false,
    },
  ];

  var categoryAxis = {
    majorGridLines: {
      visible: false,
    },
    line: {
      visible: true,
    },
    labels: {
      font: "14px 'Open Sans', sans-serif",
      rotation: 315,
    },
    majorTicks: {
      visible: false,
    },
  };

  ctrl.getSeriesDefaults = function () {
    var seriesDefaults = null;
    switch (barStyle) {
      case widgetBarChartStyle.Pillar:
        seriesDefaults = ctrl.getPillarSeriesDefaults();
        break;
      case widgetBarChartStyle.Flat:
      default:
        seriesDefaults = ctrl.getFlatSeriesDefaults();
        break;
    }
    return seriesDefaults;
  };

  ctrl.getFlatSeriesDefaults = function () {
    return {
      gap: dataSource.length === 1 ? 20 : 0.75,
      overlay: {
        gradient: 'none',
      },
      border: {
        width: 0,
      },
    };
  };

  ctrl.getPillarSeriesDefaults = function () {
    return {
      gap: dataSource.length === 1 ? 20 : 0.75,
      highlight: {
        toggle: function (e) {
          e.preventDefault();
          var visual = e.visual;
          var opacity = e.show ? 0.8 : 1;
          visual.opacity(opacity);
        },
      },
      visual: function (e) {
        return ctrl.createPillar(e.dataItem.Value, e.rect, e.dataItem.Color);
      },
    };
  };

  var tooltip = {
    visible: true,
    template: function (e) {
      return ctrl.isCurrency
        ? $filter('currency')(e.value, '$', e.value % 1 === 0 ? 0 : 2)
        : e.value;
    },
  };

  var valueAxis = {
    line: {
      visible: false,
    },
    majorGridLines: {
      visible: false,
    },
    labels: {
      visible: false,
    },
  };

  var series = [
    {
      field: 'Value',
      categoryField: 'Category',
      colorField: 'Color',
    },
  ];

  $scope.drilldown = function (e) {
    if (reportId) {
      var includeInactivePatients =
        reportId === ctrl.patientSeenId ||
        reportId === ctrl.newPatientsByComprehensiveExamReportId;
      var includePatientGroups =
        reportId === ctrl.patientSeenId ||
        reportId === ctrl.grossProductionId ||
        reportId === ctrl.AdjustmentsByProviderReportId;
      if (reportId === ctrl.ProjectedNetProductionReportId) {
        $scope.dateFilter = 'NoFilter';
      }
      var filter = widgetFactory.GetReportFilterDtoForBarChart(
        locationIds,
        $scope.dateFilter,
        e && (e.category || e.value),
        includeInactivePatients,
        adjustmentTypeFieldName,
        includePatientGroups
      );
      var dateNow = moment().format('MM/DD/YYYY');
      sessionStorage.setItem('dateType', $scope.dateFilter);
      sessionStorage.setItem('ViewDeletedTransaction', true);
      var toCheck = moment(filter.PresetFilterDto.StartDate).format(
        'MM/DD/YYYY'
      );
      if (
        moment(toCheck).isBefore(dateNow) ||
        moment(toCheck).isSame(dateNow) ||
        reportId === ctrl.ProjectedNetProductionReportId
      ) {
        reportsFactory.GetSpecificReports([reportId]).then(function (res) {
          if (res && res.Value) {
            var report = res.Value[0];
            report.Route =
              '/BusinessCenter/' +
              report.Route.charAt(0).toUpperCase() +
              report.Route.slice(1);
            report.FilterProperties = report.RequestBodyProperties;
            report.Amfa = reportsFactory.GetAmfaAbbrev(report.ActionId);
            reportsFactory.OpenReportPageWithContext(
              report,
              report.Route,
              filter
            );
            reportsFactory.ClearReportContext();
          }
        });
      }
    }
  };
}

BarChartController.prototype = Object.create(BaseCtrl.prototype);
