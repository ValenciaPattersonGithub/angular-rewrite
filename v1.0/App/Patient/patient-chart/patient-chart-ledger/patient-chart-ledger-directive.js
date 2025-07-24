'use strict';

angular.module('Soar.Patient').directive('patientChartLedger', function () {
  return {
    restrict: 'E',
    scope: {
      personId: '=',
      patientInfo: '=',
      selection: '=',
      chartLedgerServices: '=',
      watchToView: '=',
      duplicatePatients: '=',
    },
    templateUrl:
      'App/Patient/patient-chart/patient-chart-ledger/patient-chart-ledger.html',
    controller: 'PatientChartLedgerController',
    link: function link(scope, element, attrs) {
      element.on('$destroy', function elementOnDestroy() {
        scope.$destroy();
      });
    },
  };
});
