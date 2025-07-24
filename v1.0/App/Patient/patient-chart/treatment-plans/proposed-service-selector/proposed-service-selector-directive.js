'use strict';

angular
  .module('Soar.Patient')
  .directive('proposedServiceSelector', function () {
    return {
      restrict: 'E',
      scope: {
        personId: '=',
        viewSettings: '=',
        patientInfo: '=',
      },
      templateUrl:
        'App/Patient/patient-chart/treatment-plans/proposed-service-selector/proposed-service-selector.html',
      controller: 'ProposedServiceSelectorController',
      link: function link(scope, element, attrs) {
        element.on('$destroy', function elementOnDestroy() {
          scope.$destroy();
        });
      },
    };
  });
