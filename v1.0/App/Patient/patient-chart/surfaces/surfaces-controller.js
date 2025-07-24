'use strict';
angular.module('Soar.Patient').controller('SurfacesController', [
  '$scope',
  'ListHelper',
  'StaticData',
  '$filter',
  function ($scope, listHelper, staticData) {
    var ctrl = this;

    $scope.selectSurface = function (surface) {
      var activeSurfaces = angular.copy($scope.$parent.$parent.activeSurfaces);
      if (surface.selected) {
        surface.selected = false;
        var index = listHelper.findIndexByFieldValue(
          $scope.$parent.$parent.activeSurfaces,
          'SurfaceAbbreviation',
          surface.SurfaceAbbreviation
        );
        if (index != -1) activeSurfaces.splice(index, 1);
      } else {
        var index = listHelper.findIndexByFieldValue(
          $scope.$parent.$parent.activeSurfaces,
          'SurfaceAbbreviation',
          surface.SurfaceAbbreviation
        );
        surface.selected = true;
        if (index != -1) {
          activeSurfaces[index] = surface;
        } else {
          activeSurfaces.push(surface);
        }
      }
      $scope.$parent.$parent.$parent.activeSurfaces = activeSurfaces;
      $scope.$parent.$parent.validateForm();
    };
  },
]);
