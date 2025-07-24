'use strict';
angular.module('Soar.Patient').controller('SurfaceSelectorController', [
  '$scope',
  'ListHelper',
  'StaticData',
  '$filter',
  function ($scope, listHelper, staticData, $filter) {
    var ctrl = this;

    //#region init properties , teeth def
    $scope.surfaces = [];
    $scope.selectedSurfaces = [];
    $scope.summarySurfaces = [];
    $scope.teethDefinitions = [];

    // get a list of teeth definitions which includes the summary surfaces info
    ctrl.getTeethDefinitions = function () {
      staticData.TeethDefinitions().then(function (res) {
        $scope.teethDefinitions = res.Value;
        $scope.summarySurfaces = $scope.teethDefinitions.SummarySurfaces;
      });
    };

    //#endregion

    //#region selecting surfaces

    // add /remove surfaces to teeth when selected or unselected,
    $scope.selectSurface = function (surface) {
      // if no selected surfaces reinitialize list
      $scope.activeTooth.SelectedSurfaces = !$scope.activeTooth.SelectedSurfaces
        ? []
        : $scope.activeTooth.SelectedSurfaces;

      var index =
        $scope.activeTooth.SummarySurfaceAbbreviations.indexOf(surface);
      if (index !== -1) {
        var inToothSurfaces = listHelper.findIndexByFieldValue(
          $scope.activeTooth.SelectedSurfaces,
          'Surface',
          surface
        );
        if (inToothSurfaces === -1) {
          $scope.activeTooth.SelectedSurfaces.push({ Surface: surface });
        } else {
          $scope.activeTooth.SelectedSurfaces.splice(inToothSurfaces, 1);
        }
      }

      // rebuild the surface string on each change
      $scope.activeTooth.Surfaces = '';
      angular.forEach(
        $scope.activeTooth.SelectedSurfaces,
        function (selectedSurface) {
          $scope.activeTooth.Surfaces =
            $scope.activeTooth.Surfaces + selectedSurface.Surface + ',';
        }
      );
    };

    //#endregion

    // #region form functions

    // determine if the active tooth has a surface, returns true if so, false if not
    $scope.hasSelectedSurfaces = function (summarySurface) {
      if ($scope.activeTooth && $scope.activeTooth.SelectedSurfaces) {
        var contains =
          listHelper.findIndexByFieldValue(
            $scope.activeTooth.SelectedSurfaces,
            'Surface',
            summarySurface
          ) !== -1;
        return contains;
      }
      return false;
    };

    //endregion

    //##region sorting teeth collection for use in the tooth slider

    // watch selected teeth
    $scope.$watch(
      'selectedTeeth',
      function (nv, ov) {
        $scope.validateSurfaces();
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

    $scope.showSurfaceMessage = false;
    $scope.validateSurfaces = function () {
      $scope.showSurfaceMessage = false;
      angular.forEach($scope.selectedTeeth, function (tooth) {
        if (
          (tooth.Surfaces === '' || !tooth.Surfaces) &&
          !$scope.disableSelection &&
          (!tooth.SelectedSurfaces || tooth.SelectedSurfaces.length === 0)
        ) {
          $scope.showSurfaceMessage = true;
        }
      });
    };

    //#endregion

    //#region condition changes, reset surfaces

    // reset the selected surfaces when the condition is changed
    $scope.$watch(
      'disableSelection',
      function (nv, ov) {
        if ($scope.disableSelection === true) {
          angular.forEach($scope.selectedTeeth, function (tooth) {
            tooth.SelectedSurfaces = [];
          });
        }
      },
      true
    );

    //#endregion

    ctrl.initController = function () {
      ctrl.getTeethDefinitions();
    };
    ctrl.initController();
  },
]);
