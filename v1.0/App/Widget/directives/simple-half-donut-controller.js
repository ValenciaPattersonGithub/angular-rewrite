'use strict';

angular
  .module('Soar.Widget')
  .controller('SimpleHalfDonutController', [
    '$scope',
    '$element',
    '$timeout',
    SimpleHalfDonutController,
  ]);

function SimpleHalfDonutController($scope, $element, $timeout) {
  // $scope.data is passed in and contains all the data needed to display
  // A special SeriesName "_hole_" to provide data for the hole.
  // For each item, label property can be provided to override the default label of the category.
  // And color property can be provided to specify the color for each data point.
  BaseCtrl.call(this, $scope, 'SimpleHalfDonutController');
  var ctrl = this;
  var presetColors = ['#7FDE8E', '#FFB34C', '#FF674C', '#D25E59'];
  var labels = [];
  var fontSize = '14px';

  var legendOffset = 0;
  var holeSize = 100;

  var holeItem = null;

  $scope.element = $element;
  ctrl.chartObject = null;

  ctrl.prepareData = function prepareData(rawData) {
    if (!rawData || _.isEmpty(rawData)) return [];

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
        };
        holeItem.color = item.color ? item.color : '#111111';
        if (item.label) holeItem.label = item.label;
      } else if (item.Value > 0) {
        labels[item.Category] = !_.isNull(item.label) ? item.label : item.Value;

        var displayItem = {
          value: item.Value,
          category: item.Category,
          realValue: item.Value,
          isVisible: true,
        };
        displayItem.color = item.color
          ? item.color
          : index < presetColors.length
          ? presetColors[index]
          : presetColors[0]; // use the first one if we cannot find a match.
        data[0].value += displayItem.value;
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
    var factor = 0.05;
    if (width < 250) factor += (250.0 - width) / 500.0;

    ctrl.chartWidth = width;
    ctrl.chartHeight = width; // Math.floor(width * 0.8);
    ctrl.chartOffset = -Math.floor(width * factor);
    legendOffset = width * 0.6;
    holeSize = width / 5;
  };

  // Draw text in donut hole.
  ctrl.onRender = function (e) {
    // Capture the chart object.
    ctrl.chartObject = e.sender;

    if (holeItem) {
      // Draw text in the donut hole
      var Rect = kendo.geometry.Rect;
      var draw = kendo.drawing;
      var bbox = new Rect([0, 0], [ctrl.chartWidth, ctrl.chartHeight]);

      var text = holeItem.value + '';
      if (holeItem.label) text = holeItem.label;

      var bigFontSize = '18px';
      if (ctrl.chartWidth < 250) {
        bigFontSize = '12px';
        fontSize = '10px';
      } else if (ctrl.chartWidth < 350) {
        bigFontSize = '14px';
        fontSize = '12px';
      } else {
        bigFontSize = '18px';
        fontSize = '14px';
      }

      // Render the text
      //
      // http://docs.telerik.com/kendo-ui/api/javascript/dataviz/drawing/text
      var marker = new draw.Text(text, [0, 0], {
        fill: {
          color: holeItem.color,
        },
        font: bigFontSize + " 'Open Sans', sans-serif",
      });

      var label = new draw.Text(holeItem.category, [0, 0], {
        fill: {
          color: holeItem.color,
        },
        font: fontSize + " 'Open Sans', sans-serif",
      });

      var smallRect = new Rect([0, 0], [50, 50]);
      var smallLayout = new draw.Layout(smallRect, {
        spacing: 0,
        alignItems: 'center',
        justifyContent: 'center',
      });
      smallLayout.append(label, marker);
      smallLayout.reflow();
      draw.align([smallLayout], bbox, 'center');
      draw.vAlign([smallLayout], bbox, 'center');

      // Draw it on the Chart drawing surface
      e.sender.surface.draw(smallLayout);

      // Bind drilldown to text
      if ($scope.drilldown) {
        var donutTextSelector =
          'div#simpleHalfDonut-' + $scope.$id + ' > svg > g[transform] > text';
        $(donutTextSelector).bind('click', $scope.drilldown);
        $(donutTextSelector).css('cursor', 'pointer');
      }
    }
  };

  // if needed, put  ng-style="getChartStyle()" on the containing element
  $scope.getChartStyle = function () {
    return {
      position: 'absolute',
      left: '0px',
      top: ctrl.chartOffset + 'px',
      right: '0px',
      height: ctrl.chartHeight + 'px',
    };
  };

  ctrl.getSeriesDefaults = function () {
    return {
      labels: {
        //Custom template to show label
        template: function (e) {
          var template;
          if (e.category !== '__0') {
            return labels[e.category];
          } else {
            template = '';
            return template;
          }
        },
        visible: true,
        background: 'transparent',
        color: 'black',
      },
    };
  };

  //Display the legends with an offset from the top
  ctrl.getLegend = function (offset) {
    return {
      position: 'top',
      spacing: 30,
      offsetX: 0,
      offsetY: offset,
      labels: {
        //Custom template to show label
        template: function (e) {
          var template;
          if (e.text !== '__0') {
            return e.text;
          } else {
            template = '';
            return template;
          }
        },
        visible: true,
        background: 'transparent',
        color: 'black',
      },
    };
  };

  //The first value is always half of the total and the color is set to transparent. The isVisible property is so the label is not displayed
  ctrl.getSeries = function (holeSize) {
    return [
      {
        type: 'donut',
        startAngle: 180,
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

  ctrl.tooltip = {
    visible: false,
  };

  // Create the chart with the data
  ctrl.createChart = function (data) {
    var width = $scope.element.width();
    if (width == 0)
      // cannot create chart if the width is not determined.
      return;

    ctrl.computeChartLayout(width);

    ctrl.dataSource = new kendo.data.DataSource({
      data: ctrl.prepareData(data),
    });

    angular.element('#simpleHalfDonut-' + $scope.$id).kendoChart({
      dataSource: ctrl.dataSource,
      series: ctrl.getSeries(holeSize),
      seriesDefaults: ctrl.getSeriesDefaults(),
      legend: ctrl.getLegend(legendOffset),
      render: ctrl.onRender,
      tooltip: $scope.tooltip || ctrl.tooltip,
      chartArea: {
        width: ctrl.chartWidth,
        height: ctrl.chartHeight,
      },
      seriesClick: $scope.drilldown,
      legendItemClick: $scope.drilldown,
    });
  };

  // Watch the change of data and refresh the chart.
  $scope.$watch('data', function (newVal) {
    ctrl.createChart(newVal);
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
        if (!_.isNull(ctrl.chartObject)) {
          ctrl.chartObject.options.legend.offsetY = legendOffset;
          ctrl.chartObject.options.series[0].holeSize = holeSize;
          ctrl.chartObject.options.chartArea = {
            width: ctrl.chartWidth,
            height: ctrl.chartHeight,
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
    if ($scope.data && !_.isEmpty($scope.data)) ctrl.createChart($scope.data);
  };
  $timeout(function () {
    if ($scope.data && !_.isEmpty($scope.data)) ctrl.createChart($scope.data);
  });
}

SimpleHalfDonutController.prototype = Object.create(BaseCtrl.prototype);
