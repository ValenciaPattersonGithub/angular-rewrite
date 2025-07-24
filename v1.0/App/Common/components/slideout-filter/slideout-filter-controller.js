'use strict';
angular.module('Soar.Common').controller('SlideOutFilterController', [
  '$scope',
  '$filter',
  '$timeout',
  function SlideOutFilterController($scope, $filter, $timeout) {
    var ctrl = this;

    $scope.appliedFiltersCount = 0;
    // 407277 bug is created for mismatch in filter count.
    ctrl.setFiltersCount = function () {
      var filtersCount = $('.option:checked').length;
      if (
        _.isNil(document.getElementById('HasUnappliedAmountZeroBalance')) &&
        _.isArray($scope.filters) &&
        $scope.filters.length === 9 &&
        $scope.filters[7].options[0].Checked === true
      ) {
        filtersCount++;
      }
      $scope.appliedFiltersCount = filtersCount;
    };

    $scope.$on('resetFiltersCount', function (events, args) {
      ctrl.setFiltersCount();
    });

    $scope.toggleSelect = function (fld, val) {
      ctrl.setFiltersCount();
    };

    $scope.reset = function () {
      _.each($('.option'), function (obj) {
        var options = $filter('filter')($scope.filters, {
          options: { Id: obj.id },
        })[0].options;
        obj.checked = $filter('filter')(options, { Id: obj.id })[0].Checked;
      });
      ctrl.setFiltersCount();

      $scope.open = $scope.collapse != undefined ? $scope.collapse : true;
      if (!$scope.hideExpandCollapseBtn) {
        ctrl.toggleFilterGroup();
      }

      $scope.resetFiltersFn();
    };

    $scope.apply = function () {
      var selectedFilters = [];
      _.each($('.option:checked'), function (obj) {
        selectedFilters.push({ Id: obj.id });
      });
      ctrl.setFiltersCount();
      $scope.applyFiltersFn({ filters: selectedFilters });
    };

    ctrl.toggleFilterGroup = function () {
      if ($scope.open == true) {
        $('#btnExpandCollapse')[0].innerHTML = 'Expand All';
        $('.panel-heading + .collapse.in').collapse('hide');
        angular
          .element('.panel-heading')
          .find('.glyphicon-chevron-down')
          .removeClass('glyphicon-chevron-down')
          .addClass('glyphicon-chevron-up');
      } else {
        $('#btnExpandCollapse')[0].innerHTML = 'Collapse All';
        $('.panel-heading + .collapse:not(".in")').collapse('show');
        angular
          .element('.panel-heading')
          .find('.glyphicon-chevron-up')
          .removeClass('glyphicon-chevron-up')
          .addClass('glyphicon-chevron-down');
      }
    };

    $scope.expandCollapseFn = function () {
      $scope.open = !$scope.open;
      if (!$scope.hideExpandCollapseBtn) {
        ctrl.toggleFilterGroup();
      }
    };

    ctrl.toggleChevron = function (e) {
      if ($('.panel-heading + .collapse:not(".in")').length == 0) {
        $scope.open = false;
        $('#btnExpandCollapse')[0].innerHTML = 'Collapse All';
      }

      if ($('.panel-heading + .collapse.in').length == 0) {
        $scope.open = true;
        $('#btnExpandCollapse')[0].innerHTML = 'Expand All';
      }

      $(e.target)
        .prev('.panel-heading')
        .find('i.indicator')
        .toggleClass('glyphicon-chevron-up glyphicon-chevron-down');
    };

    $timeout(function () {
      $('#accordion').on('hidden.bs.collapse', ctrl.toggleChevron);
      $('#accordion').on('shown.bs.collapse', ctrl.toggleChevron);
    }, 0);

    ctrl.init = function () {
      ctrl.setFiltersCount();

      $scope.open = $scope.collapse != undefined ? $scope.collapse : true;
      if (!$scope.hideExpandCollapseBtn) {
        ctrl.toggleFilterGroup();
      }
    };

    ctrl.init();
  },
]);
