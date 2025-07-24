'use strict';

angular
  .module('Soar.Widget')
  .controller('HalfDonutController', [
    '$scope',
    '$element',
    '$timeout',
    HalfDonutController,
  ]);

function HalfDonutController($scope, $element, $timeout) {
  // $scope.data is passed in and contains all the data needed to display
  BaseCtrl.call(this, $scope, 'HalfDonutController');

  var presetColors = ['#7FDE8E', '#FFB34C', '#FF674C', '#D25E59', '#30AFCD'];

  var holeSize = 100;
  var legendOffset = 0;
  var holeItem = null;

  var ctrl = this;
  $scope.element = $element;

  $scope.count = 0;

  ctrl.prepareData = function prepareData(rawData) {
    if (_.isEmpty(rawData)) return [];

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
        holeItem.color = item.color ? item.color : '#434649';
        if (item.label) holeItem.label = item.label;
      } else if (item.Value > 0) {
        var displayItem = {
          value: item.Value,
          category: item.Category,
          realValue: ctrl.formatValue(item.Value),
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
          realValue: ctrl.formatValue(item.Value),
        };
        displayItem.color = item.color
          ? item.color
          : index < presetColors.length
          ? presetColors[index]
          : presetColors[0];
        data.push(displayItem);
      }
    });
    return data;
  };

  ctrl.formatValue = function (value) {
    value = parseFloat(Math.round(value * 100) / 100).toFixed(2);
    if (value < 0) {
      value =
        '(' +
        '$' +
        value.toString().substring(1, value.toString().length) +
        ')';
    }
    value = value.toString().substring(0, 1) === '(' ? value : '$' + value;
    value = value.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return value;
  };

  ctrl.computeChartLayout = function computeChartLayout(width) {
    var factor = 0.05;
    if (width < 350) factor += (350.0 - width) / 700.0;

    $scope.chartHeight = width; //Math.floor(width * 1.2);
    $scope.chartOffset = -Math.floor(width * factor);
    legendOffset = width * 0.6;
    holeSize = width / 5;
    $scope.legendSpacing = width < 350 ? 10 : 30;
    $scope.chartWidth = width;
  };

  ctrl.chartObject = null;

  ctrl.onRender = function (e) {
    // To show hole data on donut center
    var count = 0;
    _.each($scope.data, function (series) {
      if (series.Value === 0) {
        count++;
      }
    });
    // Capture the chart object.
    ctrl.chartObject = e.sender;

    if (holeItem) {
      // Draw text in the donut hole
      var Rect = kendo.geometry.Rect;
      var draw = kendo.drawing;
      var bbox =
        count === 1 && $scope.data.length !== 6
          ? new Rect([0, 25], [$scope.chartWidth, $scope.chartHeight])
          : count > 1 && count < 5 && $scope.data.length !== 6
          ? new Rect([0, 10], [$scope.chartWidth, $scope.chartHeight])
          : count === 0 && $scope.data.length !== 6
          ? new Rect([0, 25], [$scope.chartWidth, $scope.chartHeight])
          : new Rect([0, 25], [$scope.chartWidth, $scope.chartHeight]);
      // var bbox = ((count > 0 && count < 5) &&  $scope.data.length !== 6 ?
      //             new Rect([0, 10], [$scope.chartWidth, $scope.chartHeight]) :
      //             count === 0 &&  $scope.data.length !== 6 ? new Rect([0, 25], [$scope.chartWidth, $scope.chartHeight]) :
      //             new Rect([0, 25], [$scope.chartWidth, $scope.chartHeight]));

      var text =
        (holeItem.value === null ? '' : ctrl.formatValue(holeItem.value)) + '';
      var fontSize = '14px';
      var bigFontSize = '18px';

      if ($scope.chartWidth < 250) {
        bigFontSize = '12px';
        fontSize = '10px';
      } else if ($scope.chartWidth < 350) {
        bigFontSize = '14px';
        fontSize = '12px';
      } else {
        bigFontSize = '18px';
        fontSize = '14px';
      }

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

      var smallRect = new Rect([0, 0], [50, 25]);
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
    }
  };

  // if needed, put  ng-style="getChartStyle()" on the containing element
  $scope.getChartStyle = function () {
    return {
      position: 'absolute',
      left: '0px',
      top: $scope.chartOffset + 'px',
      right: '0px',
      height: $scope.chartHeight + 'px',
    };
  };

  ctrl.showCollections = false;
  //Use the visual function to draw the labels and add them to the visual
  ctrl.getLegend = function (offset) {
    return {
      position: 'top',
      spacing: 20,
      offsetX: 0,
      offsetY: offset,
      item: {
        visual: function (e) {
          if (
            $scope.count === 5 &&
            e.series.data.length === 6 &&
            ctrl.showCollections === false
          ) {
            $scope.count = 0;
          }
          if ($scope.count >= e.series.data.length) $scope.count = 0;

          if (e.series.data[$scope.count].color === 'transparent') {
            $scope.count++;
            return null;
          } else {
            var legendFontSize = '12px';
            if ($scope.chartWidth < 250) legendFontSize = '10px';

            var data = e.series.data[$scope.count];

            var marker = new kendo.drawing.Text(data.realValue, [0, 0], {
              cursor: 'pointer',
              fill: {
                color: e.series.data[$scope.count].color,
              },
              font: legendFontSize + " 'Open Sans', sans-serif",
            });

            var label = new kendo.drawing.Text(data.category, [0, 0], {
              cursor: 'pointer',
              fill: {
                color: '#aeb5ba',
              },
              font: legendFontSize + " 'Open Sans', sans-serif",
            });
            var smallRect = new kendo.geometry.Rect([0, 0], [50, 50]);
            var smallLayout = new kendo.drawing.Layout(smallRect, {
              spacing: 0,
              alignItems: 'center',
            });
            smallLayout.append(label, marker);
            smallLayout.reflow();
            $scope.count++;
            ctrl.showCollections =
              $scope.count === 5 && e.series.data.length === 6 ? true : false;
            return smallLayout;
          }
        },
      },
    };
  };

  ctrl.getSeriesDefaults = function () {
    return {
      labels: {
        //Custom template to show the percentage
        template: function (e) {
          var template;
          var totalValue = 0;
          var filteredData = [];
          if (e.category !== '__0') {
            filteredData = e.series.data.filter(item => item.category !== '__0');
            totalValue = filteredData.reduce((accumulator, currentValue) => accumulator + currentValue.value, 0);
            return Number(Math.round((e.value / totalValue) * 100)) + "%";
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

  // Create the chart with the data
  ctrl.createChart = function (data) {
    var width = $scope.element.width();
    if (width == 0)
      // cannot create chart if the width is not determined.
      return;

    ctrl.computeChartLayout(width);

    $scope.dataSource = new kendo.data.DataSource({
      data: ctrl.prepareData(data),
    });

    angular.element('#halfDonut-' + $scope.$id).kendoChart({
      dataSource: $scope.dataSource,
      series: ctrl.getSeries(holeSize),
      seriesDefaults: ctrl.getSeriesDefaults(),
      legend: ctrl.getLegend(legendOffset),
      render: ctrl.onRender,
      chartArea: {
        width: $scope.chartWidth,
        height: $scope.chartHeight,
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
          ctrl.chartObject.options.legend.spacing = $scope.legendSpacing;
          ctrl.chartObject.options.series[0].holeSize = holeSize;
          ctrl.chartObject.options.chartArea = {
            width: $scope.chartWidth,
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
    if ($scope.data && !_.isEmpty($scope.data)) ctrl.createChart($scope.data);
  };
  $timeout(function () {
    if ($scope.data && !_.isEmpty($scope.data)) ctrl.createChart($scope.data);
  });
}

HalfDonutController.prototype = Object.create(BaseCtrl.prototype);
