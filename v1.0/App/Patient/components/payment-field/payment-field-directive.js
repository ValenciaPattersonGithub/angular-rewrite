'use strict';

angular.module('Soar.Patient').directive('paymentField', function () {
  return {
    restrict: 'E',
    scope: {
      paymentTypes: '=',
      payment: '=',
      hasError: '=',
    },
    templateUrl: 'App/Patient/components/payment-field/payment-field.html',
    controller: 'PaymentFieldController',
  };
});
