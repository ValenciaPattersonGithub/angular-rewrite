'use strict';

angular.module('Soar.Patient').directive('perioStatsMouthTile', function () {
  return {
    restrict: 'E',
    scope: {
      //Perio Exam Summary Collection
      perioStatsMouth: '=',

      //Tile Index
      tileIndex: '=',

      //Flag to show or hide date
      showDate: '@',

      //Function to navigate user to selected perio exam
      activateTab: '=',
    },
    templateUrl:
      'App/Patient/patient-chart/perio/perio-stats-mouth-tile/perio-stats-mouth-tile.html',
  };
});
