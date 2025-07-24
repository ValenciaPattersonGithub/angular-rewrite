'use strict';

angular.module('Soar.Patient').directive('previousDentalOffice', function () {
  return {
    restrict: 'E',
    templateUrl:
      'App/Patient/patient-crud/previous-dental-office/previous-dental-office.html',
    scope: {
      person: '=',
      previousDentalOffice: '=',
      setFocusOnInput: '=',
    },
    controller: 'PreviousDentalOfficeController',
    link: function link(scope, element, attrs) {
      element.on('$destroy', function elementOnDestroy() {
        scope.$destroy();
      });
    },
  };
});
