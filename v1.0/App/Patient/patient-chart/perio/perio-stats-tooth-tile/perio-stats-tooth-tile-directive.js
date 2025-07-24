'use strict';

angular.module('Soar.Patient').directive('perioStatsToothTile', function () {
  return {
    restrict: 'E',
    scope: {
      //A collection that holds detailed information of a perio exam
      perioStatsToothExam: '=',

      //Tile Index
      tileIndex: '=?',

      //Flag to show or hide date
      showDate: '@?',
    },
    templateUrl:
      'App/Patient/patient-chart/perio/perio-stats-tooth-tile/perio-stats-tooth-tile.html',
    controller: 'PerioStatsToothTileController',
    link: function link(scope, element, attrs) {
      element.on('$destroy', function elementOnDestroy() {
        scope.$destroy();
      });
    },
  };
});
