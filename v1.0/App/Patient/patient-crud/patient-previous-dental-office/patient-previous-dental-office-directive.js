'use strict';

angular
  .module('Soar.Patient')
  .directive('patientPreviousDentalOffice', function () {
    return {
      restrict: 'E',
      templateUrl:
        'App/Patient/patient-crud/patient-previous-dental-office/patient-previous-dental-office.html',
      controller: 'PatientPreviousDentalOfficeController',
      link: function link(scope, element, attrs) {
        element.on('$destroy', function elementOnDestroy() {
          scope.$destroy();
        });
      },
    };
  });
