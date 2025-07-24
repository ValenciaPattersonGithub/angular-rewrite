'use strict';

var app = angular.module('Soar.BusinessCenter');

app.controller('DeleteFeeScheduleModalController', [
  '$scope',
  '$uibModalInstance',
  'affectedBenefitPlans',
  'BusinessCenterServices',
  'toastrFactory',
  function (
    $scope,
    $uibModalInstance,
    affectedBenefitPlans,
    businessCenterServices,
    toastrFactory
  ) {
    var ctrl = this;

    $scope.affectedBenefitPlans = affectedBenefitPlans;

    $scope.removeFeeScheduleFromAllBenefitPlans = function () {
      var count = $scope.affectedBenefitPlans.length;
      $scope.affectedBenefitPlans.forEach(function (bp) {
        bp.FeeScheduleId = null;
        if (bp.TaxCalculation === 2) {
          // Change "Calculate Tax Using" from "the fee schedule allowed amount" to "the location fee" since plan no longer has fee schedule
          bp.TaxCalculation = 1;
        }
        if (bp.TaxAssignment === 2) {
          // Change "Assign Tax to" from "the fee schedule adjustment amount" to "be estimated as part of the charge" since plan no longer has fee schedule
          bp.TaxAssignment = 1;
        }
        businessCenterServices.BenefitPlan.update(
          bp,
          function (res) {
            count--;
            if (count <= 0) done();
          },
          function (err) {
            toastrFactory.error(
              { Text: 'Failed to update {0}.', Params: ['benefit plan'] },
              'Error'
            );
          }
        );
      });
      function done() {
        toastrFactory.success(
          { Text: 'Removed from {0}s.', Params: ['benefit plan'] },
          'Success'
        );
      }
      $uibModalInstance.close();
    };

    $scope.cancel = function () {
      $uibModalInstance.dismiss();
    };
  },
]);
