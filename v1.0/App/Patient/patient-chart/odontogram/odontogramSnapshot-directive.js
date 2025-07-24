'use strict';

angular.module('Soar.Patient').directive('odontogramSnapshot', function () {
  return {
    restrict: 'E',
    scope: {
      personId: '=',
      patientDirectoryId: '=',
    },
    templateUrl: 'App/Patient/patient-chart/odontogram/odontogramSnapshot.html',
    controller: 'OdontogramSnapshotController',
    link: function link(scope, element, attrs) {
      element.on('$destroy', function elementOnDestroy() {
        scope.$destroy();
      });
    },
  };
});
