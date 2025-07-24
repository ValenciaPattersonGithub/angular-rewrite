'use strict';
angular.module('Soar.Patient').controller('InvoiceOptionsController', [
  '$scope',
  'localize',
  '$uibModalInstance',
  'DataForModal',
  'ModalFactory',
  function ($scope, localize, $uibModalInstance, dataForModal, modalFactory) {
    var ctrl = this;

    $scope.isCustomInvoice = true;
    $scope.PatientDetailsList = [
      { Name: 'First Patient' },
      { Name: 'Second Patient' },
    ];

    $scope.data = angular.copy(dataForModal);

    //// set payment related flags and data
    //$scope.isPaymentApplied = dataForModal.PaymentDetails ? true : false;
    //$scope.paymentAmount = $scope.isPaymentApplied ? dataForModal.PaymentDetails.Amount : 0;
    //$scope.paymentDescription = $scope.isPaymentApplied ? dataForModal.PaymentDetails.Description : "";

    //// set negative adjustment related flags and data
    //$scope.isNegatveAdjustmentApplied = dataForModal.NegativeAdjustmentDetails ? true : false;
    //$scope.negativeAdjustmentAmount = $scope.isNegatveAdjustmentApplied ? dataForModal.NegativeAdjustmentDetails.Amount : 0;
    //$scope.negativeAdjustmentDescription = $scope.isNegatveAdjustmentApplied ? dataForModal.NegativeAdjustmentDetails.Description : "";

    $scope.printOrViewInvoice = function () {
      $uibModalInstance.close($scope.data.InvoiceOptions);
    };

    $scope.cancelAction = function () {
      $uibModalInstance.close();
    };
  },
]);
