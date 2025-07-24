'use strict';

angular.module('Soar.Patient').directive('quadrantSelectorNew', function () {
  return {
    restrict: 'E',
    scope: {
      selectedQuadrant: '=',
      disableSelection: '=',
      supernumeraryToothChartActive: '=',
      showQuandrantSelectionMenu: '=',
    },
    templateUrl:
      'App/Patient/patient-chart/quadrant-selector/quadrant-selector-new.html',
    controller: 'QuadrantSelectorController',
  };
});
