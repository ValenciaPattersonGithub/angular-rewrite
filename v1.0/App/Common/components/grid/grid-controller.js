'use strict';

angular
  .module('common.controllers')
  .controller('GridController', [
    '$scope',
    '$timeout',
    '$filter',
    GridController,
  ]);

function GridController($scope, $timeout, $filter) {
  BaseCtrl.call(this, $scope, 'GridController');
  var ctrl = this;

  ctrl.options = $scope.options;

  ctrl.pageSize =
    ctrl.options.pageSize !== null &&
    typeof ctrl.options.pageSize !== 'undefined'
      ? ctrl.options.pageSize
      : 10;
  ctrl.currentPage = 0;
  ctrl.maxPage = 0;
  ctrl.currentAction = null;
  ctrl.action = function (action) {
    this.cancelled = false;

    this.cancel = function () {
      this.cancelled = true;
    };

    this.complete = function (data) {
      if (!this.cancelled) {
        action(data);
      }
    };

    return this;
  };

  $scope.isUpdating = false;

  $scope.isHidden = $scope.options.isHidden;
  $scope.currentCount = 0;
  $scope.totalCount = 0;
  $scope.columnDefinition = ctrl.options.columnDefinition;
  $scope.data = {};
  $scope.rows = [];
  $scope.actions = ctrl.options.actions;
  $scope.expandable = ctrl.options.expandable;
  $scope.expandableRowIdFromColumn = ctrl.options.expandableRowIdFromColumn;
  $scope.expandableRowColumn = ctrl.options.expandableRowColumn;
  $scope.expandableColumnDefinition = ctrl.options.expandableColumnDefinition;

  $scope.$watch('options.isHidden', function (nv) {
    $scope.isHidden = nv;
  });

  // Add default filter and sort options if none exist
  for (let i = 0; i < $scope.columnDefinition.length; i++) {
    let item = $scope.columnDefinition[i];
    $scope.columnDefinition[i].hidden = false;
    if (typeof item.filter === 'undefined' || item.filter === null) {
      item.filter = '';
    }
    if (typeof item.filterFrom === 'undefined' || item.filterFrom === null) {
      item.filterFrom = '';
    }
    if (typeof item.filterTo === 'undefined' || item.filterTo === null) {
      item.filterTo = '';
    }
    if (typeof item.sort === 'undefined' || item.sort === null) {
      item.sort = 0;
    }
    if (typeof item.sortIcon === 'undefined' || item.sortIcon === null) {
      item.sortIcon = '';
    }
    if (typeof item.template === 'undefined' || item.template === null) {
      item.template = [
        function (data) {
          return _.escape(data);
        },
      ];
    }
    if (typeof item.filterable === 'undefined' || item.filterable === null) {
      item.filterable = false;
    }
    if (typeof item.sortable === 'undefined' || item.sortable === null) {
      item.sortable = false;
    }
    if (typeof item.type === 'undefined' || item.sort === null) {
      item.type = 'text';
    }
    if (typeof item.disabled === 'undefined' || item.disabled === null) {
      item.disabled = false;
    }
  }

  var resetSort = function () {
    for (let i = 0; i < $scope.columnDefinition.length; i++) {
      $scope.columnDefinition[i].sort = 0;
      $scope.columnDefinition[i].sortIcon = '';
    }
  };

  $scope.sort = function () {
    var sortOrder = this.column.sort || 0;
    resetSort();
    switch (sortOrder) {
      case 0:
        this.column.sort = 1;
        this.column.sortIcon = 'fa fa-caret-up';
        break;
      case 1:
        this.column.sort = 2;
        this.column.sortIcon = 'fa fa-caret-down';
        break;
      case 2:
        this.column.sort = 0;
        this.column.sortIcon = '';
        break;
    }
    $scope.refreshGrid();
  };

  var resetSubRowSort = function (row, data) {
    for (let i = 0; i < row.expandableColumnDefinition.length; i++) {
      if (
        row.expandableColumnDefinition[i].expandableRowColumn ==
        data.expandableRowColumn
      ) {
        for (
          let a = 0;
          a < row.expandableColumnDefinition[i].columnDefinition.length;
          a++
        ) {
          row.expandableColumnDefinition[i].columnDefinition[a].sort = 0;
          row.expandableColumnDefinition[i].columnDefinition[a].sortIcon = '';
        }
      }
    }
  };

  $scope.subRowSort = function (row, data) {
    var index = $scope.rows.indexOf(row);
    var sortOrder = this.column.sort || 0;
    resetSubRowSort(row, data);
    switch (sortOrder) {
      case 0:
        this.column.sort = 1;
        this.column.sortIcon = 'fa fa-caret-up';
        $scope.rows[index][data.expandableRowColumn] = _.orderBy(
          $scope.rows[index][data.expandableRowColumn],
          [this.column.field],
          ['asc']
        );
        break;
      case 1:
        this.column.sort = 2;
        this.column.sortIcon = 'fa fa-caret-down';
        $scope.rows[index][data.expandableRowColumn] = _.orderBy(
          $scope.rows[index][data.expandableRowColumn],
          [this.column.field],
          ['desc']
        );
        break;
      case 2:
        this.column.sort = 0;
        this.column.sortIcon = '';
        $scope.rows[index][data.expandableRowColumn] =
          ctrl.options.expandableRowSortOrder === 0
            ? _.orderBy(
                $scope.rows[index][data.expandableRowColumn],
                [ctrl.options.expandableRowSortColumn],
                ['asc']
              )
            : _.orderBy(
                $scope.rows[index][data.expandableRowColumn],
                [ctrl.options.expandableRowSortColumn],
                ['desc']
              );
        break;
    }
  };

  $scope.renderTemplate = function (index, template, data, ifEmpty, row) {
    if (typeof data === 'undefined' || data === null || data === '') {
      if (typeof ifEmpty === 'undefined' || ifEmpty === null || index > 0) {
        return '';
      }
      if (typeof ifEmpty === 'function') {
        return ifEmpty(row);
      }
      return ifEmpty;
    } else {
      return template(data, row, ifEmpty);
    }
  };

  $scope.updateGrid = function (clear) {
    if ($scope.isUpdating) {
      ctrl.currentAction.cancel();
    }

    $scope.isUpdating = true;

    var filterCriteria = {};
    var sortCriteria = {};

    for (let i = 0; i < $scope.columnDefinition.length; i++) {
      if ($scope.columnDefinition[i].type === 'multiselect') {
        var multi = [];
        _.forEach($scope.columnDefinition[i].filter, function (obj) {
          multi.push(obj.Key);
        });
        filterCriteria[$scope.columnDefinition[i].field] = multi;
      } else {
        filterCriteria[$scope.columnDefinition[i].field] =
          $scope.columnDefinition[i].filter;
      }

      var fieldFrom = $scope.columnDefinition[i].fieldFrom;
      var fieldTo = $scope.columnDefinition[i].fieldTo;
      if (typeof fieldFrom !== 'undefined' && fieldFrom !== null) {
        if ($scope.columnDefinition[i].filterFrom)
          filterCriteria[$scope.columnDefinition[i].fieldFrom] =
            $scope.columnDefinition[i].filterFrom;
      }
      if (typeof fieldTo !== 'undefined' && fieldTo !== null) {
        if ($scope.columnDefinition[i].filterTo)
          filterCriteria[$scope.columnDefinition[i].fieldTo] =
            $scope.columnDefinition[i].filterTo;
      }

      sortCriteria[$scope.columnDefinition[i].field] =
        $scope.columnDefinition[i].sort;
      if ($scope.columnDefinition[i].hiddenFilterCriteria) {
        var hidden = _.filter(ctrl.options.additionalFilters, {
          field: $scope.columnDefinition[i].hiddenFilterCriteria,
        })[0].filter;
        $scope.columnDefinition[i].hidden = !hidden;
      } else {
        $scope.columnDefinition[i].hidden = false;
      }
    }

    for (let i = 0; i < ctrl.options.additionalFilters.length; i++) {
      var item = ctrl.options.additionalFilters[i];
      filterCriteria[item.field] = item.filter;
    }

    if (
      typeof ctrl.options.query.getData !== 'undefined' &&
      ctrl.options.query.getData !== null
    ) {
      if (ctrl.options.preFetchAction) {
        ctrl.options.preFetchAction(filterCriteria);
      }

      var data = ctrl.options.query.getData({
        uiSuppressModal: true,
        PageCount: ctrl.pageSize,
        CurrentPage: ctrl.currentPage,
        FilterCriteria: filterCriteria,
        SortCriteria: sortCriteria,
      });

      var newAction = new ctrl.action(function (data) {
        $scope.data = data.Value;
        var displayRows = $scope.rows === null ? [] : _.cloneDeep($scope.rows);
        $scope.columnDefinition =
          $scope.columnDefinition === null ? [] : $scope.columnDefinition;
        var rows = data.Value.Rows;
        $scope.totalCount = data.Value.TotalCount;

        ctrl.maxPage = Math.floor($scope.totalCount / ctrl.pageSize);

        if (clear) {
          displayRows.length = 0;
        }
        for (let i = 0; i < rows.length; i++) {
          var rowItem = rows[i];
          rowItem.rowStyle = ctrl.options.rowStyle(rowItem);
          if ($scope.expandable) {
            rowItem.expandableColumnDefinition = _.cloneDeep(
              $scope.expandableColumnDefinition
            );
          }
          displayRows.push(rowItem);
        }
        $scope.rows = displayRows;
        $scope.currentCount = displayRows.length;
        for (let i = 0; i < $scope.columnDefinition.length; i++) {
          if (
            $scope.columnDefinition[i].type === 'dropdown' &&
            $scope.data[$scope.columnDefinition[i].dropDown]
          ) {
            var parsedFilter =
              typeof $scope.data[$scope.columnDefinition[i].dropDown][1].Key ===
              'number'
                ? parseInt($scope.columnDefinition[i].filter)
                : $scope.columnDefinition[i].filter;

            var x = $filter('filter')(
              $scope.data[$scope.columnDefinition[i].dropDown],
              { Key: parsedFilter },
              true
            );

            $scope.columnDefinition[i].filter =
              x.length > 0 ? $scope.columnDefinition[i].filter : '';
          } else if (
            $scope.columnDefinition[i].type === 'multiselect' &&
            $scope.data[$scope.columnDefinition[i].multiselectitems] &&
            $scope.columnDefinition[i].filter.length > 0
          ) {
            var msFilter =
              typeof $scope.data[$scope.columnDefinition[i].multiselectitems][1]
                .Key === 'number'
                ? parseInt($scope.columnDefinition[i].filter[0])
                : $scope.columnDefinition[i].filter[0];

            var y = $filter('filter')(
              $scope.data[$scope.columnDefinition[i].multiselectitems],
              { Key: msFilter.Key },
              true
            );

            $scope.columnDefinition[i].filter =
              y.length > 0 ? $scope.columnDefinition[i].filter : '';
            _.forEach($scope.columnDefinition[i].filter, function (obj) {
              var item = $filter('filter')(
                $scope.data[$scope.columnDefinition[i].multiselectitems],
                { Key: obj.Key },
                true
              );
              if (item.length > 0) {
                item[0].Selected = true;
              }
            });
          }
        }
        $timeout(function () {
          $scope.isUpdating = false;
        });

        if (typeof ctrl.options.successAction === 'function') {
          ctrl.options.successAction({
            totalCount: $scope.totalCount,
            dto: $scope.data,
          });
        }
      });

      ctrl.currentAction = newAction;

      data.$promise.then(
        function (data) {
          newAction.complete(data);
        },
        function (data) {
          $scope.isUpdating = false;
          ctrl.options.failAction();
        }
      );
    } else {
      $scope.isUpdating = false;
    }
  };

  $scope.refreshGrid = function () {
    ctrl.currentPage = 0;
    ctrl.maxPage = 0;
    $scope.currentCount = 0;
    $scope.totalCount = 0;
    $scope.updateGrid(true);
  };

  $scope.clear = function (column) {
    column.filter = '';
    $scope.refreshGrid();
  };

  $scope.clearCriteria = function () {
    for (let i = 0; i < $scope.columnDefinition.length; i++) {
      $scope.columnDefinition[i].filter = '';
      $scope.columnDefinition[i].filterFrom = '';
      $scope.columnDefinition[i].filterTo = '';
      $scope.columnDefinition[i].sort = 0;
      $scope.columnDefinition[i].sortIcon = '';
    }
    $scope.refreshGrid();
  };

  $scope.getMoreRecords = function () {
    if (
      ctrl.currentPage < ctrl.maxPage &&
      $scope.currentCount < $scope.totalCount
    ) {
      ctrl.currentPage++;
      $scope.updateGrid();
    }
  };

  $scope.options.refresh = function () {
    if ($scope.refreshGrid) $scope.refreshGrid();
  };

  $scope.setStyle = function (index) {
    var result = { overflow: 'visible' };
    if (index === 3) {
      result = { 'max-width': '500px' };
    }
    return result;
  };
  $scope.subGridRowStyle = function (item) {
    if (item.Status != undefined && item.Status == 1) {
      return 'deletedRow rowWordWrap';
    }
    return 'rowWordWrap';
  };
  $scope.overrideCell = function (index) {
    var result = '';
    if ($scope.columnDefinition[index].type === 'multiselect') {
      result = { overflow: 'visible' };
    }
    return result;
  };

  $scope.tooltip = function (row, index) {
    if (ctrl.options.rowTooltip) return ctrl.options.renderTooltip(row, index);
  };
  $scope.tooltipDeleted = function (row, item, index) {
    if (ctrl.options.renderToolTipDeletedPayments)
      return ctrl.options.renderToolTipDeletedPayments(row, item, index);
  };
  if (ctrl.options.updateOnInit) {
    $scope.updateGrid(true);
  }
  $scope.toggleAll = function () {};

  $scope.$onScopeDestroy = function () {
    cleanUpChildren($scope);
  };

  var cleanUpChildren = function cleanUpChildren(scope) {
    var nextChild = scope.$$childHead;
    while (nextChild) {
      var currentChild = nextChild;
      nextChild = nextChild.$$nextSibling;
      currentChild.$destroy();
      currentChild.$$watchers = [];
      currentChild.$$listeners = {};
      currentChild.$$nextSibling = null;
      currentChild.$$previousSibling = null;
      currentChild.$$prevSibling = null;

      for (var scopeItem in currentChild) {
        if (
          scopeItem &&
          currentChild.hasOwnProperty(scopeItem) &&
          !scopeItem.startsWith('$')
        ) {
          currentChild[scopeItem] = null;
        }
      }

      if (currentChild.$$childHead) {
        cleanUpChildren(currentChild.$$childHead);
      }

      currentChild.$parent = null;
    }
  };
}

GridController.prototype = Object.create(BaseCtrl.prototype);
