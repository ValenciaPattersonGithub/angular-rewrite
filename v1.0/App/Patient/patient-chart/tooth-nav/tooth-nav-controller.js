'use strict';
angular.module('Soar.Patient').controller('ToothNavController', [
  '$scope',
  'ListHelper',
  'StaticData',
  '$filter',
  function ($scope, listHelper, staticData, $filter) {
    var ctrl = this;

    $scope.sortedSelectedTeeth = [];
    $scope.sortSelectedTeeth = function () {
      if ($scope.selectedTeeth.length > 0) {
        $scope.sortedSelectedTeeth = $filter('orderBy')(
          $scope.selectedTeeth,
          'ToothId'
        );
        // find active tooth in selected teeth
        var index = listHelper.findIndexByFieldValue(
          $scope.sortedSelectedTeeth,
          'ToothId',
          $scope.activeTooth.ToothId
        );
        if (index === -1) {
          // if activeTooth is no longer in selectedTeeth, reinitialize tooth
          $scope.activeTooth.SelectedSurfaces = [];
          $scope.activeTooth.Surfaces = [];
          $scope.activeTooth.SelectedRoots = [];
          $scope.activeTooth.Roots = [];
          $scope.activeTooth = $scope.sortedSelectedTeeth[0];
        }
        if (!$scope.activeTooth.ToothId) {
          $scope.activeTooth = $scope.sortedSelectedTeeth[0];
        }
      }
    };

    // watch selected teeth
    $scope.$watch(
      'selectedTeeth',
      function (nv, ov) {
        if (nv && nv !== ov) {
          // sort selected teeth when list changes
          $scope.sortSelectedTeeth();
        }
      },
      true
    );

    // When tooth navigation, switch surface selection to only apply to that tooth
    $scope.toothNav = function (currentTooth, dir) {
      // if dir then we are navigating left get the index fo the current tooth
      var index = $scope.sortedSelectedTeeth.indexOf(currentTooth);
      if (dir) {
        if (index > 0) {
          $scope.activeTooth = $scope.sortedSelectedTeeth[index - 1];
        } else {
          $scope.activeTooth =
            $scope.sortedSelectedTeeth[$scope.sortedSelectedTeeth.length - 1];
        }
      } else {
        if (index >= 0 && index < $scope.sortedSelectedTeeth.length - 1) {
          $scope.activeTooth = $scope.sortedSelectedTeeth[index + 1];
        } else {
          $scope.activeTooth = $scope.sortedSelectedTeeth[0];
        }
      }
    };
  },
]);
