'use strict';

angular.module('common.controllers').controller('FilterBoxController', [
  '$scope',
  '$filter',
  '$timeout',
  function ($scope, $filter, $timeout) {
    var ctrl = this;

    ctrl.originalList1 = angular.copy($scope.list1);
    ctrl.originalList2 = angular.copy($scope.list2);

    $scope.clearFilters = function () {
      $scope.filterObject = angular.copy($scope.originalFilterObject);
      $scope.$emit(
        'filter-object-changed',
        $scope.filterObject,
        $scope.list1,
        $scope.list2
      );
    };

    $scope.hideFilters = function () {
      angular.element('.slidePanel').removeClass('open');
    };

    ctrl.runFilters = function (filterObject) {
      $scope.filtering = true;
      $timeout(function () {
        $scope.list1 = $filter('filter')(
          ctrl.originalList1,
          $scope.filterFunction
        );
        $scope.list2 = $filter('filter')(
          ctrl.originalList2,
          $scope.filterFunction
        );
        $scope.$emit(
          'filter-object-changed',
          filterObject,
          $scope.list1,
          $scope.list2
        );
        $scope.filtering = false;
      });
    };

    $scope.$on('list1-reloaded', function (event, nv, updateOriginalList) {
      // because we do not always get the full list on load, updating the original as we get more records
      if (
        nv.length >= ctrl.originalList1.length ||
        updateOriginalList === true
      ) {
        ctrl.originalList1 = nv;
      }
      ctrl.runFilters($scope.filterObject);
    });

    $scope.$on('list2-reloaded', function (event, nv, updateOriginalList) {
      // because we do not always get the full list on load, updating the original as we get more records
      if (
        nv.length >= ctrl.originalList2.length ||
        updateOriginalList === true
      ) {
        ctrl.originalList2 = nv;
      }
      ctrl.runFilters($scope.filterObject);
    });

    ctrl.hasLoaded = false;
    $scope.$watch(
      'filterObject',
      function (nv, ov) {
        if (!angular.equals(nv, ov) || !ctrl.hasLoaded) {
          ctrl.hasLoaded = true;
          ctrl.runFilters(nv);
        }
      },
      true
    );

    $scope.$watch(
      'filterObject.members',
      function (nv, ov) {
        $scope.$emit('filter-object-members-changed', nv);
      },
      true
    );

    $scope.$watch(
      'list1',
      function (nv, ov) {
        // console.log(nv);
        if (
          !angular.equals(nv, ov) &&
          ctrl.originalList1 &&
          ctrl.originalList1.length === 0
        ) {
          ctrl.originalList1 = angular.copy($scope.list1);
        }
      },
      true
    );

    // reset originalList if items modified / added / removed
    $scope.$watch(
      'backupItems',
      function (nv, ov) {
        if (!angular.equals(nv, ov)) {
          ctrl.originalList1 = angular.copy(nv);
        }
      },
      true
    );
  },
]);
