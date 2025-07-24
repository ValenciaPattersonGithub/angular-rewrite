'use strict';

angular.module('Soar.Patient').directive('surface', function () {
  return {
    restrict: 'E',
    scope: {
      data: '=',
      selectedTooth: '=?',
      selectedSurface: '=?',
      selectedSurfaceSummaryInfo: '=?',
      isSurfaceEditing: '=?',
    },
    templateUrl: function (elem, attrs) {
      if (attrs.surfaceTemplate) {
        return (
          'App/Patient/components/surface/surface-' +
          attrs.surfaceTemplate +
          '.html'
        );
      } else {
        return 'App/Patient/components/surface/surface.html';
      }
    },
    controller: 'SurfaceController',
    link: function link(scope, element, attrs) {
      element.on('$destroy', function elementOnDestroy() {
        scope.$destroy();
      });
    },
  };
});
