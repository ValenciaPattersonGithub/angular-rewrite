'use strict';

angular.module('Soar.Patient').directive('patientDiscounts', function () {
  return {
    restrict: 'E',
    templateUrl:
      'App/Patient/patient-crud/patient-discounts/patient-discounts.html',
    scope: {
      patientDiscount: '=',
      selectedDiscountType: '=',
    },
    controller: 'PatientDiscountsController',
    link: function link(scope, element, attrs) {
      element.on('$destroy', function elementOnDestroy() {
        scope.$destroy();
      });
    },
  };
});
