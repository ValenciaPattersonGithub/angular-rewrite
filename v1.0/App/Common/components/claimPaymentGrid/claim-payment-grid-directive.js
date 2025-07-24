'use strict';
// This directive is currently used in the following places:
// patient-account-insurance-payment.html
// bulk-payment.html
angular.module('common.directives').directive('claimPaymentGrid', function () {
  return {
    restrict: 'E',
    scope: {
      claims: '=',
      paymentAmountBlurEvent: '&',
      serviceAmountBlurEvent: '&',
      finalPaymentChangeEvent: '&',
      disableInput: '=?',
      getClaims: '&',
      isUpdating: '<?',
      resultCount: '=?',
      disableAll: '=?',
      openFeeScheduleEvent: '&',
    },
    templateUrl:
      'App/Common/components/claimPaymentGrid/claim-payment-grid.html',
    link: function (scope, elem, attr) {
      scope.parseFloat = function (value) {
        return parseFloat(value);
      };

      scope.header = [
        {
          label: 'Date',
          size: 'col-sm-1',
          class: 'text-left',
        },
        {
          label: 'Patient',
          size: 'col-sm-1',
          class: 'text-left',
        },
        {
          label: 'Provider',
          size: 'col-sm-1',
          class: 'text-left',
        },
        {
          label: 'Description',
          size: 'col-sm-2',
          class: 'text-left',
        },
        {
          label: 'Tooth',
          size: 'half-col',
          class: 'text-left',
        },
        {
          label: 'Area',
          size: 'half-col',
          class: 'text-left',
        },
        {
          label: 'Charges',
          size: 'col-sm-1',
          class: 'text-right',
        },
        {
          label: 'Allowed Amount',
          size: 'col-sm-1',
          class: 'text-right',
        },
        {
          label: 'Estimated Ins.',
          size: 'col-sm-1',
          class: 'text-right',
        },
        {
          label: 'Est. Ins. Adj.',
          size: 'col-sm-1',
          class: 'text-right',
        },
        {
          label: 'Patient Bal',
          size: 'col-sm-1',
          class: 'text-right',
        },
        {
          label: 'Apply Payment',
          size: 'col-sm-1',
          class: 'text-right',
        },
        {
          label: 'Final Payment',
          size: 'col-sm-1',
          class: 'text-right',
        },
      ];
      elem.on('$destroy', function elementOnDestroy() {
        scope.$destroy();
      });
    },
  };
});
