'use strict';
angular.module('Soar.Patient').controller('TreatmentPlanFeeChangeController', [
  '$scope',
  '$routeParams',
  'toastrFactory',
  'localize',
  'DiscountTypesService',
  'PatientServices',
  'ListHelper',
  'ModalFactory',
  '$timeout',
  function (
    $scope,
    $routeParams,
    toastrFactory,
    localize,
    discountTypesService,
    patientServices,
    listHelper,
    modalFactory,
    $timeout
  ) {
    var ctrl = this;
    //set variables
    $scope.show = false;
    $scope.isOpen = false;
    $scope.inputData = angular.copy($scope.serviceTransaction);
    $scope.isToggled = false;
    $scope.saveEnabled = false;
    if (
      !angular.isNumber($scope.inputData.Amount) ||
      isNaN($scope.inputData.Amount)
    ) {
      $scope.inputData.Amount = 0;
    }
    $scope.showCharge = function ($event) {
      $scope.show = true;
    };

    ctrl.unregisterWatch = $scope.$watch(
      'serviceTransaction',
      function (nv, ov) {
        if (nv.Amount != $scope.inputData.Amount) {
          $scope.inputData = angular.copy($scope.serviceTransaction);
          if (
            !angular.isNumber($scope.inputData.Amount) ||
            isNaN($scope.inputData.Amount)
          ) {
            $scope.inputData.Amount = 0;
          }
          ctrl.unregisterWatch();
        }
      },
      true
    );

    $scope.$watch(
      'inputData',
      function (nv, ov) {
        if (JSON.stringify(nv) != JSON.stringify(ov)) {
          nv.Amount = nv.Fee - nv.Discount + nv.Tax;
          ctrl.unregisterWatch();
        }
      },
      true
    );

    $scope.toggle = function () {
      if ($scope.serviceTransaction.Fee != $scope.inputData.Fee) {
        $scope.inputData.Fee = $scope.serviceTransaction.Fee;
      }
      if ($scope.serviceTransaction.Discount != $scope.inputData.Discount) {
        $scope.inputData.Discount = $scope.serviceTransaction.Discount;
      }
      if ($scope.serviceTransaction.Tax != $scope.inputData.Tax) {
        $scope.inputData.Tax = $scope.serviceTransaction.Tax;
      }

      $scope.closeAll.closeAllCharge = !$scope.closeAll.closeAllCharge;
      $scope.isToggled = true;
      $timeout(function () {
        $scope.isOpen = !$scope.isOpen;
        $scope.isToggled = false;
      }, 0);
    };

    $scope.saveChanges = function () {
      ctrl.changeUserOverRiddenFlag();
      $scope.saveEnabled = false;
      $scope.serviceTransaction.Fee = $scope.inputData.Fee;
      $scope.serviceTransaction.Discount = $scope.inputData.Discount;
      $scope.serviceTransaction.Tax = $scope.inputData.Tax;
      $scope.serviceTransaction.Amount = $scope.inputData.Amount;
      $scope.serviceTransaction.Balance = parseFloat(
        (
          $scope.serviceTransaction.Amount -
          $scope.serviceTransaction.TotalEstInsurance -
          $scope.serviceTransaction.TotalAdjEstimate
        ).toFixed(2)
      );
      $scope.save($scope.serviceTransaction, false);
      $scope.isOpen = false;
      $scope.closeAll.closeAllCharge = false;
    };

    ctrl.changeUserOverRiddenFlag = function () {
      angular.forEach(
        $scope.serviceTransaction.InsuranceEstimates,
        function (estimate) {
          estimate.IsUserOverRidden = false;
        }
      );
    };

    $scope.$watch(
      'closeAll',
      function (nv, ov) {
        if (nv.closeAllFeeChange != ov.closeAllFeeChange && !$scope.isToggled) {
          $scope.isOpen = false;
        }
      },
      true
    );

    $scope.verifyMaxAmount = function () {
      $scope.saveEnabled = false;
      if ($scope.inputData.Fee > 999999) {
        $scope.inputData.Fee = 999999.99;
      }
      $scope.recalculate($scope.inputData, $scope.valuesUpdated);
    };
    $scope.valuesUpdated = function () {
      $scope.saveEnabled = true;
    };
    $scope.saveValid = function () {
      return (
        $scope.serviceTransaction.Amount == $scope.inputData.Amount ||
        $scope.saveEnabled == false
      );
    };
  },
]);
