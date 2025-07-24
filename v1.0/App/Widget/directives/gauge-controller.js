'use strict';

angular
  .module('Soar.Widget')
  .controller('GaugeController', [
    '$scope',
    '$element',
    '$timeout',
    GaugeController,
  ]);

function GaugeController($scope, $element, $timeout) {
  // $scope.data is passed in and contains all the data needed to display
  // A special SeriesName "_hole_" to provide data for the hole.
  // For each item, label property can be provided to override the default label of the category.
  // And color property can be provided to specify the color for each data point.
  BaseCtrl.call(this, $scope, 'GaugeController');
  var ctrl = this;
  var presetColors = ['#30AFCD', '#AEB5BA', '#FF674C', '#D25E59'];
  var labels = [];

  var holeSize = 100;

  var holeItem = null;

  $scope.element = $element;
  ctrl.chartObject = null;

  ctrl.prepareData = function prepareData(rawData) {
    if (!rawData || rawData.length === 0) return [];

    // Add a summary item to hide the bottom of a donut chart.
    var data = [
      {
        category: '__0',
        value: 0,
        color: 'transparent',
        isVisible: false,
        distance: 0,
      },
    ];

    _.each(rawData, function (item, index) {
      if (item.SeriesName === '_hole_') {
        holeItem = {
          value: item.Value,
          category: item.Category,
          color: item.Color || '#111111',
          label: item.label,
          categoryFont: item.categoryFont,
          labelFont: item.labelFont,
        };
      } else if (item.Value > 0) {
        labels[item.Category] = item.label || item.Value;
        var displayItem = {
          value: item.Value,
          category: item.Category,
          realValue: item.Value,
          isVisible: true,
        };
        if (item.Color) displayItem.color = item.Color;
        else {
          if (index < presetColors.length)
            displayItem.color = presetColors[index];
          else displayItem.color = presetColors[0]; // use the first one if we cannot find a match.
        }
        data[0].value += displayItem.value / 4.0; // to make the missing piece 20%
        data.push(displayItem);
      } else {
        var displayItem = {
          value: 0,
          category: item.Category,
          isVisible: true,
          realValue: item.Value,
          color: '#111111',
        };
        data.push(displayItem);
      }
    });
    return data;
  };

  ctrl.computeChartLayout = function (width) {
    $scope.chartWidth = width;
    $scope.chartHeight = width;
    holeSize = $scope.chartWidth * 0.4;
  };

  // Draw text in donut hole.
  var onRender = function (e) {
    // Capture the chart object.
    ctrl.chartObject = e.sender;

    if (holeItem) {
      var categoryFont = "16px 'Open Sans', sans-serif";
      var labelFont = "bold 40px 'Open Sans', sans-serif";

      if ($scope.chartWidth < 160) {
        categoryFont = "12px 'Open Sans', sans-serif";
        labelFont = "bold 20px 'Open Sans', sans-serif";
      } else if ($scope.chartWidth < 200) {
        categoryFont = "14px 'Open Sans', sans-serif";
        labelFont = "bold 30px 'Open Sans', sans-serif";
      }

      // Draw text in the donut hole
      var Rect = kendo.geometry.Rect;
      var draw = kendo.drawing;
      var bbox = new Rect([0, 0], [$scope.chartWidth, $scope.chartHeight]);

      var text = holeItem.value + '';
      if (holeItem.label) text = holeItem.label;

      // Render the text
      // http://docs.telerik.com/kendo-ui/api/javascript/dataviz/drawing/text
      var marker = new draw.Text(text, [0, 0], {
        fill: {
          color: holeItem.color,
        },
        font: holeItem.labelFont || labelFont,
        cursor: 'pointer',
      });

      var category = new draw.Text(holeItem.category, [0, 0], {
        fill: {
          color: holeItem.color,
        },
        font: holeItem.categoryFont || categoryFont,
        cursor: 'pointer',
      });

      var smallRect = new Rect([0, 0], [50, 50]);
      var smallLayout = new draw.Layout(smallRect, {
        spacing: 0,
        alignItems: 'center',
        justifyContent: 'center',
      });
      smallLayout.append(marker, category);
      smallLayout.reflow();
      draw.align([smallLayout], bbox, 'center');
      draw.vAlign([smallLayout], bbox, 'center');

      // Draw it on the Chart drawing surface
      e.sender.surface.draw(smallLayout);
      e.sender.surface.bind('click', $scope.drilldown);
    }
  };

  // if needed, put  ng-style="getChartStyle()" on the containing element
  $scope.getChartStyle = function () {
    return {
      position: 'absolute',
      left: '0px',
      top: '0px',
      right: '0px',
      height: $scope.chartHeight + 'px',
    };
  };

  var getSeriesDefaults = function () {
    return {
      labels: {
        visible: false,
      },
    };
  };

  //Hide the legend
  var getLegend = function () {
    return {
      visible: false,
    };
  };

  //The first value is the missing piece and the color is set to transparent. The isVisible property is so the label is not displayed
  var getSeries = function (holeSize) {
    return [
      {
        type: 'donut',
        startAngle: 234, // make the missing piece 20%
        padding: 0,
        holeSize: holeSize,
        overlay: {
          gradient: 'none',
        },
        // Define the binding to data source.
        field: 'value',
        categoryField: 'category',
        colorField: 'color',
        isVisibleField: 'isVisible',
      },
    ];
  };

  // Create the chart with the data
  var createChart = function (data) {
    var width = $scope.element.width();
    if (width == 0)
      // cannot create chart if the width is not determined.
      return;
    ctrl.computeChartLayout(width);

    ctrl.dataSource = new kendo.data.DataSource({
      data: ctrl.prepareData(data),
    });

    angular.element('#gauge-' + $scope.$id).kendoChart({
      dataSource: ctrl.dataSource,
      series: getSeries(holeSize),
      seriesDefaults: getSeriesDefaults(),
      legend: getLegend(),
      render: onRender,
      chartArea: {
        width: ctrl.width,
        height: $scope.chartHeight,
      },
    });
  };

  // Watch the change of data and refresh the chart.
  $scope.$watch('data', function (newVal, oldVal) {
    if (newVal) createChart(newVal);
  });

  // Observe the element's width.
  $scope.$watch(
    function () {
      return $scope.element.width();
    },
    function (newValue, oldValue) {
      if (newValue != oldValue) {
        ctrl.computeChartLayout(newValue);

        // update the chartObject with new values
        if (ctrl.chartObject != null) {
          ctrl.chartObject.options.series[0].holeSize = holeSize;
          ctrl.chartObject.options.chartArea = {
            width: ctrl.width,
            height: $scope.chartHeight,
          };
        } else {
          if (oldValue == 0)
            // need to initialize the chart if size changes from 0 to non-zero, a hackish way.
            ctrl.initChart();
        }
      }
    }
  );

  ctrl.initChart = function () {
    if ($scope.data && !_.isEmpty($scope.data)) createChart($scope.data);
  };

  $timeout(function () {
    ctrl.initChart();
  });
}

GaugeController.prototype = Object.create(BaseCtrl.prototype);
