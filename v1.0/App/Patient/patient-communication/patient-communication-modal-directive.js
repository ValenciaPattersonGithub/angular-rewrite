'use strict';

angular
  .module('Soar.Patient')
  .directive('patientCommunicationModal', function () {
    return {
      restrict: 'E',
      scope: {
        activeFltrTab: '=',
        activeGridData: '=',
        selectedLocation: '=',
        appliedFiltersCount: '=',
      },
      templateUrl:
        'App/Patient/patient-communication/patient-communication-modal.html',
      controller: 'patientCommunicationModalController',
      link: function link(scope, element, attrs) {
        element.on('$destroy', function elementOnDestroy() {
          scope.$destroy();
        });
      },
    };
  });
