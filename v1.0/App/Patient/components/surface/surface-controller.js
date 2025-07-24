'use strict';
angular.module('Soar.Patient').controller('SurfaceController', [
  '$scope',
  'ListHelper',
  'StaticData',
  '$filter',
  'SurfaceHelper',
  function ($scope, listHelper, staticData, $filter, surfaceHelper) {
    var ctrl = this;

    // //#region init properties , teeth def
    $scope.ToothType = 0;
    ctrl.allTeeth = [];
    $scope.isSurfaceEditing =
      $scope.isSurfaceEditing == null || $scope.isSurfaceEditing == undefined
        ? false
        : $scope.isSurfaceEditing;

    $scope.summarySurfaces = [];
    $scope.teethDefinitions = [];
    $scope.openSelectedSurface = function () {
      $scope.isSurfaceEditing = !$scope.isSurfaceEditing;
      if ($scope.isSurfaceEditing) ctrl.init();
    };
    $scope.closeSelectedSurface = function () {
      $scope.isSurfaceEditing = false;
    };

    ctrl.getTeethDefinitions = function () {
      staticData.TeethDefinitions().then(function (res) {
        if (res && res.Value && res.Value.Teeth) {
          ctrl.allTeeth = res.Value.Teeth;
        }
      });
    };
    ctrl.getTeethDefinitions();
    ctrl.SetSelectedServicesForInitialize = function () {
      if ($scope.selectedSurface) {
        var surfaces = $scope.selectedSurface.split(',');
        _.each(surfaces, function (surface) {
          var surfaceObj = listHelper.findItemByFieldValue(
            $scope.summarySurfaces,
            'Surface',
            surface
          );
          if (surfaceObj) {
            surfaceObj.Selected = true;
          }
        });
      }
    };

    ctrl.init = function () {
      if (!ctrl.allTeeth) {
        ctrl.getTeethDefinitions();
      }
      // Passed in tooth
      var tooth = listHelper.findItemByFieldValue(
        ctrl.allTeeth,
        'USNumber',
        $scope.selectedTooth
      );
      if (tooth) {
        $scope.summarySurfaces = [];
        angular.forEach(tooth.SummarySurfaceAbbreviations, function (surface) {
          var surfaceObj = { Surface: surface, Selected: false };
          $scope.summarySurfaces.push(surfaceObj);
        });
        ctrl.setSummarySurfaces();
        ctrl.SetSelectedServicesForInitialize();
        ctrl.buildSurfaceString();
      }
    };

    //Set summary surfaces as per the tooth selected
    ctrl.setSummarySurfaces = function () {
      var oSerface = listHelper.findItemByFieldValue(
        $scope.summarySurfaces,
        'Surface',
        'O'
      );
      if (oSerface) {
        $scope.ToothType = 0;
        $scope.summarySurfaces = [
          { Surface: 'M', Selected: false, Desc: 'M', Order: 1 },
          { Surface: 'O', Selected: false, Desc: 'O', Order: 2 },
          { Surface: 'D', Selected: false, Desc: 'D', Order: 3 },
          { Surface: 'B', Selected: false, Desc: 'B', Order: 4 },
          { Surface: 'L', Selected: false, Desc: 'L', Order: 5 },
          { Surface: 'B5', Selected: false, Desc: 'B5', Order: 6 },
          { Surface: 'L5', Selected: false, Desc: 'L5', Order: 7 },
        ];
      } else {
        $scope.ToothType = 1;
        $scope.summarySurfaces = [
          { Surface: 'M', Selected: false, Desc: 'M', Order: 1 },
          { Surface: 'I', Selected: false, Desc: 'I', Order: 2 },
          { Surface: 'D', Selected: false, Desc: 'D', Order: 3 },
          { Surface: 'F', Selected: false, Desc: 'F', Order: 4 },
          { Surface: 'L', Selected: false, Desc: 'L', Order: 5 },
          { Surface: 'L5', Selected: false, Desc: 'L5', Order: 6 },
          { Surface: 'F5', Selected: false, Desc: 'F5', Order: 7 },
        ];
      }
    };

    //#region selecting surfaces

    ctrl.buildSurfaceString = function () {
      $scope.selectedSurfaceSummaryInfo =
        surfaceHelper.surfaceCSVStringToSurfaceString($scope.selectedSurface);
    };

    $scope.selectSurface = function (surface) {
      var existingSurface = listHelper.findItemByFieldValue(
        $scope.summarySurfaces,
        'Surface',
        surface
      );
      if (existingSurface) {
        existingSurface.Selected = !existingSurface.Selected;
        ctrl.createSurfaceCSV();
        ctrl.buildSurfaceString();
      }
    };

    //Unselects specified surface if found in scope.summarySurfaces
    ctrl.createSurfaceCSV = function () {
      var surfaceCSV = '';
      _.each($scope.summarySurfaces, function (surface) {
        if (surface.Selected) {
          if (surfaceCSV != '') {
            surfaceCSV = surfaceCSV + ',';
          }
          surfaceCSV = surfaceCSV + surface.Surface;
        }
      });
      $scope.selectedSurface = surfaceCSV;
    };

    //#endregion

    $scope.hasSelectedSurfaces = function (summarySurface) {
      var existingSerface = listHelper.findItemByFieldValue(
        $scope.summarySurfaces,
        'Surface',
        summarySurface
      );

      if (existingSerface && existingSerface.Selected) {
        return true;
      }

      return false;
    };

    //endregion
  },
]);
