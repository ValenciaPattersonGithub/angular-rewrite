'use strict';
angular.module('Soar.Patient').controller('PatientEncounterEstinsController', [
  '$scope',
  '$timeout',
  '$q',
  'referenceDataService',
  function ($scope, $timeout, $q, referenceDataService) {
    var ctrl = this;
    //set variables
    $scope.validInsAmount = true;
    $scope.show = false;
    $scope.isOpen = false;
    $scope.isToggled = false;
    $scope.expanded = false;

    if (
      $scope.popOverPlacement === null ||
      $scope.popOverPlacement === undefined
    ) {
      $scope.popOverPlacement = 'right';
    }

    var deferred = $q.defer();
    if ($scope.service !== null && $scope.service !== undefined) {
      deferred.resolve($scope.service);
    } else {
      referenceDataService
        .getData(referenceDataService.entityNames.serviceCodes)
        .then(function (serviceCodes) {
          var serviceCode = _.find(serviceCodes, function (code) {
            return _.isEqual(
              code.ServiceCodeId,
              $scope.serviceTransaction.ServiceCodeId
            );
          });
          deferred.resolve(serviceCode);
        });
    }
    deferred.promise.then(function (serviceCode) {
      $scope.isValidForInsurance =
        !_.isNil(serviceCode) &&
        !_.isNull(serviceCode.CdtCodeId) &&
        serviceCode.SubmitOnInsurance;
    });

    $scope.showCharge = function ($event) {
      $scope.show = true;
    };
    $scope.expand = function () {
      $scope.expanded = !$scope.expanded;
    };
    $scope.copyServiceTransaction = function (serviceTransaction) {
      var inputData = angular.copy(serviceTransaction);
      if (serviceTransaction) {
        inputData.InputTotalEstInsurance = angular.copy(
          inputData.TotalEstInsurance
        );
        inputData.InputTotalAdjEstimate = angular.copy(
          inputData.TotalAdjEstimate
        );
        if (serviceTransaction.InsuranceEstimates) {
          for (
            var i = 0;
            i < serviceTransaction.InsuranceEstimates.length;
            i++
          ) {
            var estimate = inputData.InsuranceEstimates[i];
            estimate.sourceEstimate = serviceTransaction.InsuranceEstimates[i];
            estimate.InputEstInsurance = angular.copy(estimate.EstInsurance);
            estimate.LatestEstInsurance = angular.copy(
              estimate.InputEstInsurance
            );
            estimate.InputAdjEst = angular.copy(estimate.AdjEst);
            estimate.validInsAmount = true;
            estimate.priority = i;
          }
        }
      }
      return inputData;
    };
    $scope.inputData = $scope.copyServiceTransaction($scope.serviceTransaction);

    //refresh the service if it changes as a result of other controllers - tax and discount get updated after page load, so
    //we need to get them
    $scope.$watch(
      'serviceTransaction',
      function () {
        $scope.inputData = $scope.copyServiceTransaction(
          $scope.serviceTransaction
        );
      },
      true
    );

    $scope.toggle = function () {
      if ($scope.isValidForInsurance) {
        if (
          $scope.serviceTransaction.InsuranceEstimates[0].AdjEst !=
          $scope.inputData.InsuranceEstimates[0].AdjEst
        ) {
          $scope.inputData.InsuranceEstimates[0].AdjEst =
            $scope.serviceTransaction.InsuranceEstimates[0].AdjEst;
        }
        if (
          $scope.serviceTransaction.InsuranceEstimates[0].EstInsurance !=
          $scope.inputData.InsuranceEstimates[0].EstInsurance
        ) {
          $scope.inputData.InsuranceEstimates[0].EstInsurance =
            $scope.serviceTransaction.InsuranceEstimates[0].InputEstInsurance;
        }
        $scope.inputData.TotalEstInsurance =
          $scope.serviceTransaction.TotalEstInsurance;
        $scope.inputData.TotalAdjEstimate =
          $scope.serviceTransaction.TotalAdjEstimate;
        $scope.closeAll.closeAllEstIns = !$scope.closeAll.closeAllEstIns;
        $scope.isToggled = true;
        $timeout(function () {
          $scope.isOpen = !$scope.isOpen;
          $scope.isToggled = false;
          $scope.expanded = false;
        }, 0);
      }
    };

    $scope.update = function () {
      //$scope.serviceTransaction.InsuranceEstimates[0].EstInsurance = $scope.inputData.InputTotalEstInsurance;
      //if ($scope.serviceTransaction.InsuranceEstimates.length > 1) {
      //    $scope.serviceTransaction.InsuranceEstimates[1].EstInsurance = 0;
      //}
      $scope.serviceTransaction.TotalEstInsurance =
        $scope.inputData.InputTotalEstInsurance;
      $scope.serviceTransaction.Balance = parseFloat(
        (
          $scope.serviceTransaction.Amount -
          $scope.serviceTransaction.TotalEstInsurance -
          $scope.serviceTransaction.TotalAdjEstimate
        ).toFixed(2)
      );
      //angular.forEach($scope.serviceTransaction.InsuranceEstimates, function (estimate) {
      //    estimate.IsUserOverRidden = true;
      //});
      for (
        var i = 0;
        i < $scope.serviceTransaction.InsuranceEstimates.length;
        i++
      ) {
        $scope.serviceTransaction.InsuranceEstimates[i].IsUserOverRidden =
          $scope.inputData.InsuranceEstimates[i].IsUserOverRidden;
        $scope.serviceTransaction.InsuranceEstimates[i].EstInsurance =
          $scope.inputData.InsuranceEstimates[i].InputEstInsurance;
        $scope.serviceTransaction.InsuranceEstimates[i].IsMostRecentOverride =
          $scope.inputData.InsuranceEstimates[i].IsMostRecentOverride;
      }
      $scope.recalculate($scope.serviceTransaction);
      $scope.isOpen = false;
      $scope.closeAll.closeAllEstIns = false;
    };

    $scope.$watch(
      'closeAll',
      function (nv, ov) {
        if (nv.closeAllEstIns != ov.closeAllEstIns && !$scope.isToggled) {
          $scope.isOpen = false;
        }
      },
      true
    );

    //$scope.verifyMaxAmount = function (type) {
    $scope.verifyMaxAmount = function (type, estimate) {
      switch (type) {
        case 'ins':
          if (estimate.InputEstInsurance === estimate.LatestEstInsurance) break;

          if (estimate.InputEstInsurance > 999999) {
            estimate.InputEstInsurance = 999999.99;
          }
          estimate.LatestEstInsurance = estimate.InputEstInsurance;
          var tax = $scope.inputData.Tax ? $scope.inputData.Tax : 0;
          var discount = $scope.inputData.Discount
            ? $scope.inputData.Discount
            : 0;
          var charge = parseFloat(
            ($scope.inputData.Fee - discount + tax).toFixed(2)
          );
          var feeScheduleFee = parseFloat(
            (charge - $scope.inputData.InsuranceEstimates[0].AdjEst).toFixed(2)
          );
          var minOfChargeAndFsf = Math.min(charge, feeScheduleFee);

          if (estimate.InputEstInsurance > minOfChargeAndFsf) {
            estimate.validInsAmount = false;
          } else {
            estimate.validInsAmount = true;
          }
          if (estimate.validInsAmount) {
            estimate.IsUserOverRidden = true;
            $scope.inputData.InputTotalEstInsurance = _.reduce(
              $scope.inputData.InsuranceEstimates,
              function (total, est) {
                return (
                  total + (est.InputEstInsurance ? est.InputEstInsurance : 0)
                );
              },
              0
            );
            angular.forEach(
              $scope.inputData.InsuranceEstimates,
              function (est) {
                est.IsMostRecentOverride = false;
              }
            );
            estimate.IsMostRecentOverride = true;
          }
          break;
        case 'adj':
          if ($scope.inputData.InsuranceEstimates[0].AdjEst > 999999) {
            $scope.inputData.InsuranceEstimates[0].AdjEst = 999999.99;
          }
          var charge = $scope.inputData.Fee;
          var feeScheduleFee = parseFloat(
            (charge - $scope.inputData.InsuranceEstimates[0].AdjEst).toFixed(2)
          );
          var minOfChargeAndFsf = Math.min(charge, feeScheduleFee);

          if ($scope.inputData.InputTotalEstInsurance > minOfChargeAndFsf) {
            $scope.validInsAmount = false;
          } else {
            $scope.validInsAmount = true;
          }
          break;
        default:
          break;
      }
    };

    $scope.disableSave = function () {
      // Disable when nothing has changed or anything is invalid.
      return (
        !_.reduce(
          $scope.inputData.InsuranceEstimates,
          function (changed, est) {
            return (
              changed |
              (est.InputEstInsurance !== est.sourceEstimate.EstInsurance)
            );
          },
          false
        ) ||
        !_.reduce(
          $scope.inputData.InsuranceEstimates,
          function (valid, est) {
            return valid & est.validInsAmount;
          },
          true
        ) ||
        !$scope.validInsAmount
      );
    };
  },
]);
