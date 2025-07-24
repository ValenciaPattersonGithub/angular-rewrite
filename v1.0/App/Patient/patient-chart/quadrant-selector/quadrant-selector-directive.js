'use strict';

angular.module('Soar.Patient').directive('quadrantSelector', function () {
  return {
    restrict: 'E',
    scope: {
      selectedQuadrant: '=',
      disableSelection: '=',
      supernumeraryToothChartActive: '=',
      showQuandrantSelectionMenu: '=',
    },
    templateUrl:
      'App/Patient/patient-chart/quadrant-selector/quadrant-selector.html',
    controller: 'QuadrantSelectorController',
  };
});
