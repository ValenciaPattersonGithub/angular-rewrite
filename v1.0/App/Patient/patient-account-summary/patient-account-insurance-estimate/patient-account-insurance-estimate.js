'use strict';
angular
  .module('Soar.Patient')
  .controller('PatientAccountInsuranceEstimateController', [
    '$scope',
    'patSecurityService',
    function ($scope, patSecurityService) {
      var ctrl = this;

      // authentication var
      ctrl.soarAuthInsPaymentViewKey = 'soar-acct-aipmt-view';
      $scope.hasPatientInsurancePaymentViewAccess = false;

      $scope.makeInsurancePayment = function () {
        $scope.paymentFunction();
      };

      // Check view access for Insurance Payment view
      ctrl.authPatientInsurancePaymentViewAccess = function () {
        $scope.hasPatientInsurancePaymentViewAccess =
          patSecurityService.IsAuthorizedByAbbreviation(
            ctrl.soarAuthInsPaymentViewKey
          );
        $scope.disablePayments = !$scope.hasPatientInsurancePaymentViewAccess;
      };

      // validate patient account insurance access
      ctrl.authPatientInsurancePaymentViewAccess();
    },
  ]);
