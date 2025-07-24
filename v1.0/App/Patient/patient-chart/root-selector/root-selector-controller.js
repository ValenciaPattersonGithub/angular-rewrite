'use strict';
angular.module('Soar.Patient').controller('RootSelectorController', [
  '$scope',
  'ListHelper',
  'StaticData',
  '$filter',
  function ($scope, listHelper, staticData) {
    var ctrl = this;

    //#region teethDef

    $scope.teethDefinitions = [];
    // get a list of teeth definitions which includes the summary surfaces info and root info
    ctrl.getTeethDefinitions = function () {
      staticData.TeethDefinitions().then(function (res) {
        $scope.teethDefinitions = res.Value;
      });
    };

    //#endregion

    //#region select root and add to SelectedRoots if not in array

    $scope.selectRoot = function (root) {
      // if no selected roots reinitialize list
      $scope.activeTooth.SelectedRoots = !$scope.activeTooth.SelectedRoots
        ? []
        : $scope.activeTooth.SelectedRoots;
      var index = $scope.activeTooth.RootAbbreviations.indexOf(
        root.RootAbbreviation
      );
      if (index !== -1) {
        var inToothRoots = listHelper.findIndexByFieldValue(
          $scope.activeTooth.SelectedRoots,
          'Roots',
          root.RootAbbreviation
        );
        if (inToothRoots === -1) {
          $scope.activeTooth.SelectedRoots.push({
            Roots: root.RootAbbreviation,
          });
        } else {
          $scope.activeTooth.SelectedRoots.splice(inToothRoots, 1);
        }
      }
      // rebuild the surface string on each change
      $scope.activeTooth.Roots = '';
      angular.forEach(
        $scope.activeTooth.SelectedRoots,
        function (selectedRoot) {
          $scope.activeTooth.Roots =
            $scope.activeTooth.Roots + selectedRoot.Roots + ',';
        }
      );
      // remove trailing comma
      $scope.activeTooth.Roots = $scope.activeTooth.Roots.substring(
        0,
        $scope.activeTooth.Roots.lastIndexOf(',')
      );
    };

    //#endregion*/

    //#region returns true/false tooth has root in selectedRoots

    $scope.hasSelectedRoots = function (root) {
      if ($scope.activeTooth && $scope.activeTooth.SelectedRoots) {
        var contains =
          listHelper.findIndexByFieldValue(
            $scope.activeTooth.SelectedRoots,
            'Roots',
            root.RootAbbreviation
          ) !== -1;
        return contains;
      }
      return false;
    };

    //#endregion

    //#region condition changes, reset surfaces

    // reset the selected surfaces when the condition is changed
    $scope.$watch(
      'disableSelection',
      function (nv, ov) {
        if ($scope.disableSelection === true) {
          angular.forEach($scope.selectedTeeth, function (tooth) {
            tooth.SelectedRoots = [];
            tooth.Roots = '';
          });
        }
      },
      true
    );

    //#endregion

    //#region show roots for activeTooth

    $scope.showRootsForTooth = function (root) {
      if ($scope.activeTooth && $scope.activeTooth.RootAbbreviations) {
        var contains =
          $scope.activeTooth.RootAbbreviations.indexOf(root.RootAbbreviation) >
          -1;
        return contains;
      }
      return false;
    };

    //#endregion

    //#region showMessage

    // watch selected teeth
    $scope.$watch(
      'selectedTeeth',
      function (nv, ov) {
        $scope.validateRoots();
        // if no selected teeth, clear activeTooth
        if (nv && nv.length === 0) {
          $scope.activeTooth = {};
        }
        // if there is only one tooth, set it to active
        else if (nv && nv.length === 1) {
          $scope.activeTooth = nv[0];
        }
      },
      true
    );

    $scope.showRootMessage = false;
    $scope.validateRoots = function () {
      $scope.showRootMessage = false;
      angular.forEach($scope.selectedTeeth, function (tooth) {
        if (
          (tooth.Roots === '' || !tooth.Roots) &&
          (!tooth.SelectedRoots || tooth.SelectedRoots.length === 0)
        ) {
          $scope.showRootMessage = true;
        }
      });
    };

    //#endregion

    ctrl.initController = function () {
      ctrl.getTeethDefinitions();
    };
    ctrl.initController();
  },
]);
