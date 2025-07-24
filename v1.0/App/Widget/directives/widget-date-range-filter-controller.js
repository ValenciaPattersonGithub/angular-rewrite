'use strict';

angular
  .module('Soar.Widget')
  .controller('WidgetDateRangeFilterController', [
    '$scope',
    '$filter',
    'localize',
    WidgetDateRangeFilterController,
  ]);
function WidgetDateRangeFilterController($scope, $filter, localize) {
  BaseCtrl.call(this, $scope, 'WidgetDateRangeFilterController');
  var ctrl = this;
  ctrl.update = true;
  $scope.showModal = null;
  ctrl.previousDateFilter = null;
  $scope.fromDateIsValid = null;
  $scope.toDateIsValid = null;
  $scope.dropdownId = 'widgetDateFilter' + $scope.$id;

  ctrl.getDropDownList = function () {
    return angular
      .element('select#' + $scope.dropdownId)
      .data('kendoDropDownList');
  };

  $scope.onDateFilterSelect = function (e) {
    if (e && e.dataItem) {
      $scope.showModal = e.dataItem.value === 'Date Range';
      ctrl.previousDateFilter = $scope.dateFilter;
      $scope.$digest();
    }
  };

  $scope.onDateFilterChange = function (dateOption) {
    if (!$scope.showModal) {
      ctrl.previousDateFilter = dateOption;
      ctrl.setMouseover(null);
      $scope.onChange(dateOption); // get fresh data
    }
  };

  $scope.onSearch = function () {
    if (
      $scope.fromDate &&
      $scope.fromDateIsValid &&
      $scope.toDate &&
      $scope.toDateIsValid
    ) {
      var dropdownlist = ctrl.getDropDownList();
      var dateText =
        $filter('date')($scope.fromDate, 'shortDate') +
        ' ' +
        localize.getLocalizedString('to') +
        ' ' +
        $filter('date')($scope.toDate, 'shortDate');
      dropdownlist.span[0].textContent = dateText;
      ctrl.setMouseover(dateText);
      $scope.showModal = false;
      $scope.onChange($scope.dateFilter); // get fresh data
    }
  };

  $scope.$on('dateSelector.clear', function (e) {
    $scope.fromDate = null;
    $scope.toDate = null;
    $scope.dateFilter = ctrl.previousDateFilter;
    $scope.showModal = false;
  });

  ctrl.setMouseover = function (text) {
    angular
      .element('soar-select-list#' + $scope.dropdownId)
      .find('span.soarSelectList')
      .attr('title', text);
  };
}

WidgetDateRangeFilterController.prototype = Object.create(BaseCtrl.prototype);
