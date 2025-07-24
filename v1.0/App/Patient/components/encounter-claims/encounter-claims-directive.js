'use strict';

angular.module('Soar.Patient').directive('encounterClaims', function () {
  return {
    restrict: 'E',
    scope: {
      encounter: '=',
      encounterClaimsList: '=?',
      patientInfo: '=',
      providers: '=',
      serviceCodes: '=',
      serviceTransaction: '=',
      refreshSummaryPageDataForGrid: '=',
    },
    templateUrl:
      'App/Patient/components/encounter-claims/encounter-claims.html',
    controller: 'EncounterClaimsController',
    link: function link(scope, element, attrs) {
      element.on('$destroy', function elementOnDestroy() {
        scope.$destroy();
      });
    },
  };
});
