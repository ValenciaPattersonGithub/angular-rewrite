'use strict';

angular
  .module('common.controllers')
  .controller('StateListController', [
    '$rootScope',
    '$scope',
    '$timeout',
    'StaticData',
    'ListHelper',
    StateListController,
  ]);

function StateListController(
  $rootScope,
  $scope,
  $timeout,
  staticData,
  listHelper
) {
  BaseCtrl.call(this, $scope, 'StateListController');

  $scope.initSelection = function () {
    if ($scope.source && $scope.source.length > 0) {
      $scope.stateSource = listHelper.findItemByFieldValue(
        $scope.stateList,
        'Abbreviation',
        $scope.source.toUpperCase()
      );
      $scope.state = $scope.stateSource ? $scope.stateSource.Name : null;
      $scope.source = null;
    } else {
      $scope.state = null;
    }
    $timeout(function () {
      $scope.source = $scope.stateSource
        ? $scope.stateSource.Abbreviation
        : $scope.source;
    }, 500);
  };

  $scope.StatesOnSuccess = function (res) {
    $scope.loadingStates = false;
    $scope.stateList = res.Value;
    $scope.initSelection();
  };

  // fill state lists
  $scope.loadingStates = true;
  staticData.States().then($scope.StatesOnSuccess);

  $scope.filterStates = function (item, search) {
    var state = listHelper.findItemByFieldValue($scope.stateList, 'Name', item);
    if (state.Abbreviation.toLowerCase() == search.toLowerCase()) {
      $timeout(function () {
        $scope.state = state.Name;
        $scope.updateSource();
        return true;
      }, 200);
    }

    if (item.toLowerCase().indexOf(search.toLowerCase()) == 0) {
      return true;
    }

    return false;
  };

  //$scope.updateSource = function (nv, ov) {
  //    // prevent '$apply already in progress' error
  //    $timeout(function () {
  //        if ($scope.state) {
  //            var state = listHelper.findItemByFieldValue($scope.stateList, 'Name', $scope.state);
  //            $scope.source = state ? state.Abbreviation : null;
  //        }
  //        else {
  //            $scope.source = null;
  //        }
  //    });
  //};

  $scope.$watch('source', function (nv, ov) {
    if (!nv && nv != ov) {
      $scope.source = null;
    }
  });
}
StateListController.prototype = Object.create(BaseCtrl.prototype);
