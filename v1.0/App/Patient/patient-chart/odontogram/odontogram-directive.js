'use strict';

angular.module('Soar.Patient').directive('odontogram', function () {
  return {
    restrict: 'E',
    scope: {
      selection: '=',
      personId: '=',
      chartLedgerServices: '=',
      patientOdontogram: '=',
      patientDirectoryId: '=',
      conditions: '<'
    },
    templateUrl: 'App/Patient/patient-chart/odontogram/odontogram.html',
    controller: 'OdontogramController',
    link: function link(scope, element, attrs) {
      element.on('$destroy', function elementOnDestroy() {
        scope.$destroy();
      });
    },
  };
});
