'use strict';

angular.module('Soar.Patient').directive('patientNotesTile', function () {
  return {
    restrict: 'E',
    scope: {
      personId: '=',
      note: '=',
      onChange: '&?',
      noteDisabled: '=',
      viewSettings: '=',
      timelineView: '@?',
      showDate: '@?',
    },
    templateUrl:
      'App/Patient/patient-chart/patient-notes/patient-notes-tile/patient-notes-tile.html',
    controller: 'PatientNotesTileController',
    link: function link(scope, element, attrs) {
      element.on('$destroy', function elementOnDestroy() {
        scope.$destroy();
      });
    },
  };
});
