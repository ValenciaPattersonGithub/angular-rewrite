'use strict';

angular.module('common.controllers').controller('ListMenuCtrl', [
  '$scope',
  '$location',
  'localize',
  '$timeout',
  '$routeParams',
  '$route',
  'ListHelper',
  function (
    $scope,
    $location,
    localize,
    $timeout,
    $routeParams,
    $route,
    listHelper
  ) {
    $scope.ShowOptions = true;
    $scope.optionIndex = -1;
    $scope.itemIndex = -1;
    $scope.forward = true;

    $scope.goBack = function () {
      $scope.forward = false;
      $timeout(function () {
        $scope.ShowOptions = true;
        $scope.optionIndex = -1;
        if ($scope.baseUrl) {
          $location.path($scope.baseUrl);
        }
      }, 100);
    };

    $scope.goBackOptions = function () {
      $scope.forward = false;
      $timeout(function () {
        $scope.itemIndex = -1;

        if ($scope.baseUrl) {
          $location.path(
            $scope.baseUrl + $scope.menuOptions[$scope.optionIndex].Area
          );
        }
      }, 100);
    };

    $scope.SelectOptionIndex = function (idx) {
      $scope.forward = true;
      $timeout(function () {
        $scope.ShowOptions = false;
        $scope.optionIndex = idx;

        if ($scope.baseUrl) {
          $location.path(
            $scope.baseUrl + $scope.menuOptions[$scope.optionIndex].Area
          );
        }
      }, 100);
    };

    $scope.SelectItemIndex = function (idx) {
      $scope.forward = true;
      $timeout(function () {
        $scope.itemIndex = idx;

        if ($scope.baseUrl) {
          $location.path(
            $scope.baseUrl +
              $scope.menuOptions[$scope.optionIndex].Area +
              '/' +
              $scope.menuOptions[$scope.optionIndex].Items[$scope.itemIndex]
                .Area
          );
        }
      }, 100);
    };

    $scope.updateRoute = function () {
      var params = {};

      if ($scope.optionIndex > -1) {
        params.category = $scope.menuOptions[$scope.optionIndex].Area;

        if ($scope.itemIndex > -1) {
          params.subcategory =
            $scope.menuOptions[$scope.optionIndex].Items[$scope.itemIndex].Area;
        }
      }

      //$route.updateParams(params); // angular 1.3 feature
    };

    //$scope.$watch('itemIndex', function (nv, ov) {
    //    console.log('itemIndex ' + $scope.itemIndex);
    //    if (ov >= 0 && nv < 0) {
    //        $scope.forward = false;
    //    }
    //});

    $scope.$on('soar:go-back-options', function (event, args) {
      $scope.forward = false;
      $timeout(function () {
        $scope.itemIndex = -1;
      }, 100);
    });

    $scope.navigateToArea = function (category, subcategory) {
      var categoryIndex = listHelper.findIndexByFieldValue(
        $scope.menuOptions,
        'Area',
        category
      );

      if (categoryIndex > -1) {
        var subcategoryIndex = listHelper.findIndexByFieldValue(
          $scope.menuOptions[categoryIndex].Items,
          'Area',
          subcategory
        );

        if (subcategoryIndex > -1) {
          $scope.optionIndex = categoryIndex;
          $scope.itemIndex = subcategoryIndex;
          $scope.ShowOptions = false;
          return;
        } else {
          $scope.optionIndex = categoryIndex;
          $scope.ShowOptions = false;
        }
      }
    };

    // KEEP THIS FOR NOW. IT MAY BE USED IF AND WHEN WE REWORK THIS TO BE GENERIC.
    //$scope.findAreaRecursive = function (list, area) {
    //	var selectedArea = null;

    //	if (list) {
    //		for (var i = 0; i < list.length && !selectedArea; i++) {
    //			if (list[i].Area == area) {
    //				selectedArea = list[i].Area;
    //			}
    //			else {
    //				selectedArea = $scope.findAreaRecursive(list[i].Items, area);
    //			}
    //		}
    //	}

    //	return selectedArea;
    //};

    $scope.navigateToArea(
      $route.current.params.category,
      $route.current.params.subcategory
    );
  },
]);
