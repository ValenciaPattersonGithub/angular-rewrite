(function () {
  'use strict';
  angular
    .module('Soar.Dashboard')
    .controller('DashboardContainerController', dashboardContainerController);
  dashboardContainerController.$inject = [
    '$scope',
    '$q',
    '$location',
    'toastrFactory',
    'DashboardService',
    'WidgetInitStatus',
    'localize',
  ];
  function dashboardContainerController(
    $scope,
    $q,
    $location,
    toastrFactory,
    DashboardService,
    widgetInitStatus,
    localize
  ) {
    BaseCtrl.call(this, $scope, 'dashboardContainerController');
    // data object will provide the following
    //  Items : define the list of display items in the container.
    //      Each item contains at least size, position, type and template properties. Other initial data may be provided as well.
    //      E.g.,  {Size: {Width: 2, Height: 1}, Position: [0, 0], ItemType: "widget", Title: "Test Day Sheet", Data : [], Template: "examples/test-day-sheet.html", ItemId: 1},
    //  Columns: define the number of columns for the dashboard.
    //  CanDrag: define whether the widget can be dragged. Needed to support customization.
    //  CanResize: define whether the widget can be resized. Needed to support customization.

    var ctrl = this;
    $scope.hiddenFilter = null;
    $scope.hiddenItems = [];
    $scope.saveLayoutDisabled = true;
    ctrl.columns = undefined;
    ctrl.draggable = false;
    ctrl.resizable = false;
    var unSelectedItems = [];
    $scope.location = $location.$$path;
    ctrl.createGridster = function () {
      if ($scope.data) {
        $scope.standardItems = _.filter($scope.data.Items, function (item) {
          return !item.IsHidden;
        });
        $scope.hiddenItems = _.filter($scope.data.Items, function (item) {
          return item.IsHidden;
        });
        unSelectedItems = $scope.hiddenItems.map(function (item) {
          return { Value: item.Title, Id: item.ItemId };
        });
        $scope.hiddenWidgetFilterOptions = _.sortBy(
          unSelectedItems,
          function (item) {
            return item.Value;
          }
        );
        ctrl.columns = $scope.data.Columns;
        ctrl.draggable = $scope.data.CanDrag;
        ctrl.resizable = $scope.data.CanResize;
      } else {
        ctrl.draggable = false;
        ctrl.resizable = false;
      }

      if (_.isNull($scope.standardItems)) $scope.standardItems = [];
      if (_.isNull(ctrl.columns)) ctrl.columns = 6;

      // map the gridsterItem to the custom item structure
      $scope.customItemMap = {
        sizeX: 'item.Size.Width',
        sizeY: 'item.Size.Height',
        row: 'item.Position[0]',
        col: 'item.Position[1]',
      };

      $scope.gridsterOpts = {
        minRows: 2, // the minimum height of the grid, in rows
        maxRows: 100,
        columns: ctrl.columns, // the width of the grid, in columns
        colWidth: 'auto', // can be an integer or 'auto'.  'auto' uses the pixel width of the element divided by 'columns'
        rowHeight: '*0.9', // can be an integer or 'match'.  Match uses the colWidth, giving you square widgets.
        margins: [10, 10], // the pixel distance between each widget
        defaultSizeX: 2, // the default width of a gridster item, if not specifed
        defaultSizeY: 1, // the default height of a gridster item, if not specified
        mobileBreakPoint: 600, // if the screen is not wider that this, remove the grid layout and stack the items
        resizable: {
          enabled: ctrl.resizable,
          start: function (event, uiWidget, $element) {}, // optional callback fired when resize is started,
          resize: function (event, uiWidget, $element) {}, // optional callback fired when item is resized,
          stop: function (event, uiWidget, $element) {
            $scope.saveLayoutDisabled = false;
          }, // optional callback fired when item is finished resizing
        },
        draggable: {
          enabled: ctrl.draggable, // whether dragging items is supported
          handle: '.widget-handle', // optional selector for resize handle
          start: function (event, uiWidget, $element) {}, // optional callback fired when drag is started,
          drag: function (event, uiWidget, $element) {}, // optional callback fired when item is moved,
          stop: function (event, uiWidget, $element) {
            $scope.saveLayoutDisabled = false;
          }, // optional callback fired when item is finished dragging
        },
      };
    };

    $scope.changeFilter = function (value) {
      if (value && $scope.data.Items) {
        var selectedItem = $scope.data.Items.find(function (item) {
          return item.ItemId === value.dataItem.Id;
        });
        if (selectedItem) {
          selectedItem.initMode = widgetInitStatus.ToLoad; // This is to force the widget to load data again when it is visible
          selectedItem.IsHidden = false;
          selectedItem.Position = null;
          $scope.saveLayoutDisabled = false;
          ctrl.createGridster();
        }
      }
    };

    $scope.onClose = function (id) {
      var hiddenItem = $scope.data.Items.find(function (item) {
        return item.ItemId === id;
      });
      hiddenItem.IsHidden = true;
      $scope.saveLayoutDisabled = false;
      ctrl.createGridster();
    };

    $scope.saveLayout = function () {
      if ($scope.saveLayoutDisabled) return;

      _.each($scope.data.Items, function (item) {
        item.Position = Object.values(item.Position);
      });

      var defer = $q.defer();
      var promise = defer.promise;
      DashboardService.DashboardDefinitions.save(
        { id: DashboardService.DashboardId },
        $scope.data
      ).$promise.then(
        function (res) {
          $scope.savedLayout = res.Value;
          $scope.saveLayoutDisabled = true;
          promise = $.extend(promise, {
            values: res.Value,
          });
          defer.resolve(res);
          toastrFactory.success(
            localize.getLocalizedString('Your layout has been saved.'),
            localize.getLocalizedString('Success')
          );
        },
        function (res) {
          toastrFactory.error(
            localize.getLocalizedString('Your layout has not been saved.'),
            localize.getLocalizedString('Failed')
          );
        }
      );
    };

    // In response to resize of the window.
    $scope.onResize = function (element) {
      $scope.$digest(); // need to propagate all changes before refreshing the charts.

      $(element)
        .find('.k-chart') // To use a desingated class to identify the one needs to be refresh.
        .each(function (el) {
          kendo.resize(el);
          //$(el).data("kendoChart").refresh();
        });
    };

    // monitor the data change
    $scope.$watchCollection('data.Items', function (newValue, oldValue) {
      if (newValue !== oldValue) ctrl.createGridster();
    });

    // Initialize the gridster
    ctrl.createGridster();
  }

  dashboardContainerController.prototype = Object.create(BaseCtrl);
})();
