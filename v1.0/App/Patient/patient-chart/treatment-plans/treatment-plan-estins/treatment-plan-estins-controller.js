'use strict';
angular.module('Soar.Patient').controller('TreatmentPlanEstinsController', [
    '$scope',
    '$timeout',
    'referenceDataService',
    function ($scope, $timeout, referenceDataService) {
        var ctrl = this;
        //set variables
        $scope.validInsAmount = true;
        $scope.estimatesExceedCharges = false;
        $scope.show = false;
        $scope.isOpen = false;
        $scope.isToggled = false;
        $scope.expanded = false;
        $scope.tooltipText = '';

        $scope.showCharge = function ($event) {
            $scope.show = true;
        };
        $scope.disableEdit = false;
        $scope.expand = function () {
            $scope.expanded = !$scope.expanded;
        };

        $scope.disableEditFunctions = false;

        ctrl.$onInit = function () {
            referenceDataService
                .getData(referenceDataService.entityNames.serviceCodes)
                .then(function (serviceCodes) {
                    ctrl.serviceCode = _.find(serviceCodes, function (code) {
                        return _.isEqual(
                            code.ServiceCodeId,
                            $scope.serviceTransaction.ServiceTransaction.ServiceCodeId
                        );
                    });
                    $scope.isValidForInsurance =
                        !_.isNil(ctrl.serviceCode) &&
                        !_.isNull(ctrl.serviceCode.CdtCodeId) &&
                        ctrl.serviceCode.SubmitOnInsurance;

                    $scope.setTooltipText();
                });
        };

        $scope.setTooltipText = function () {
            if (
                !$scope.patientBenefitPlans ||
                !$scope.patientBenefitPlans.length > 0
            ) {
                $scope.tooltipText = 'This patient does not have a benefit plan.';
                $scope.disableEdit = true;
            } else if (
                $scope.serviceTransaction.ServiceTransaction
                    .ServiceTransactionStatusId == 5
            ) {
                //Pending
                $scope.tooltipText =
                    'Pending services estimated insurance must be edited on the encounter page.';
                $scope.disableEdit = true;
            } else if (
                $scope.serviceTransaction.ServiceTransaction
                    .ServiceTransactionStatusId == 4
            ) {
                //Completed
                $scope.tooltipText = 'This service has been completed.';
                $scope.disableEdit = true;
            } else if (!$scope.isValidForInsurance) {
                $scope.tooltipText =
                    'The service must have a CDT Code assigned and/or be marked to submit to insurance.';
                $scope.disableEdit = true;
            }
        };

        $scope.copyServiceTransaction = function (serviceTransaction) {
            var inputData = angular.copy(serviceTransaction.ServiceTransaction);
            if (serviceTransaction) {
                inputData.InputTotalEstInsurance = angular.copy(
                    inputData.TotalEstInsurance
                );
                inputData.InputTotalAdjEstimate = angular.copy(
                    inputData.TotalAdjEstimate
                );
                if (serviceTransaction.ServiceTransaction.InsuranceEstimates) {
                    for (
                        var i = 0;
                        i < serviceTransaction.ServiceTransaction.InsuranceEstimates.length;
                        i++
                    ) {
                        var estimate = inputData.InsuranceEstimates[i];
                        estimate.sourceEstimate =
                            serviceTransaction.ServiceTransaction.InsuranceEstimates[i];
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
            if (!$scope.disableEdit && !$scope.disableEditFunctions) {
                $scope.inputData = $scope.copyServiceTransaction(
                    $scope.serviceTransaction
                );
                $scope.inputData.TotalEstInsurance =
                    $scope.serviceTransaction.ServiceTransaction.TotalEstInsurance;
                $scope.inputData.TotalAdjEstimate =
                    $scope.serviceTransaction.ServiceTransaction.TotalAdjEstimate;
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
            $scope.serviceTransaction.ServiceTransaction.TotalEstInsurance =
                $scope.inputData.InputTotalEstInsurance;
            $scope.serviceTransaction.ServiceTransaction.Balance = parseFloat(
                (
                    $scope.serviceTransaction.ServiceTransaction.Amount -
                    $scope.serviceTransaction.ServiceTransaction.TotalEstInsurance -
                    $scope.serviceTransaction.ServiceTransaction.TotalAdjEstimate
                ).toFixed(2)
            );

            for (
                var i = 0;
                i <
                $scope.serviceTransaction.ServiceTransaction.InsuranceEstimates.length;
                i++
            ) {
                $scope.serviceTransaction.ServiceTransaction.InsuranceEstimates[
                    i
                ].IsUserOverRidden = true;
                $scope.serviceTransaction.ServiceTransaction.InsuranceEstimates[
                    i
                ].EstInsurance =
                    $scope.inputData.InsuranceEstimates[i].InputEstInsurance;

                if (i == 0) {
                    $scope.serviceTransaction.ServiceTransaction.InsuranceEstimates[
                        i
                    ].IsMostRecentOverride = true;
                }

                if (
                    $scope.serviceTransaction.TreatmentPlanServiceHeader
                        .TreatmentPlanInsuranceEstimates
                ) {
                    var matchingTxServiceEstimate = $scope.serviceTransaction.TreatmentPlanServiceHeader.TreatmentPlanInsuranceEstimates.find(
                        function (x) {
                            return (
                                x.PatientBenefitPlanId ==
                                $scope.serviceTransaction.ServiceTransaction.InsuranceEstimates[
                                    i
                                ].PatientBenefitPlanId
                            );
                        }
                    );

                    if (matchingTxServiceEstimate) {
                        matchingTxServiceEstimate.EstInsurance =
                            $scope.serviceTransaction.ServiceTransaction.InsuranceEstimates[
                                i
                            ].EstInsurance;
                        matchingTxServiceEstimate.AdjEst =
                            $scope.serviceTransaction.ServiceTransaction.InsuranceEstimates[
                                i
                            ].AdjEst;
                        matchingTxServiceEstimate.IsUserOverRidden = true;
                        matchingTxServiceEstimate.ObjectState = 'Update';
                    } else {
                        $scope.serviceTransaction.TreatmentPlanServiceHeader.TreatmentPlanInsuranceEstimates.push(
                            {
                                PatientBenefitPlanId:
                                    $scope.serviceTransaction.ServiceTransaction
                                        .InsuranceEstimates[i].PatientBenefitPlanId,
                                EstInsurance:
                                    $scope.serviceTransaction.ServiceTransaction
                                        .InsuranceEstimates[i].EstInsurance,
                                AdjEst:
                                    $scope.serviceTransaction.ServiceTransaction
                                        .InsuranceEstimates[i].AdjEst,
                                IsUserOverRidden: true,
                                ObjectState: 'Add',
                            }
                        );
                    }
                } else {
                    $scope.serviceTransaction.TreatmentPlanServiceHeader.TreatmentPlanInsuranceEstimates = [
                        {
                            PatientBenefitPlanId:
                                $scope.serviceTransaction.ServiceTransaction.InsuranceEstimates[
                                    i
                                ].PatientBenefitPlanId,
                            EstInsurance:
                                $scope.serviceTransaction.ServiceTransaction.InsuranceEstimates[
                                    i
                                ].EstInsurance,
                            AdjEst:
                                $scope.serviceTransaction.ServiceTransaction.InsuranceEstimates[
                                    i
                                ].AdjEst,
                            IsUserOverRidden: true,
                            ObjectState: 'Add',
                        },
                    ];
                }
            }

            $scope.recalculate($scope.serviceTransaction.ServiceTransaction);
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

        $scope.verifyMaxAmount = function (type, estimate) {
            switch (type) {
                case 'ins':
                    if (estimate.InputEstInsurance === estimate.LatestEstInsurance) break;

                    if (estimate.InputEstInsurance > 999999.99) {
                        estimate.InputEstInsurance = 999999.99;
                    }
                    estimate.LatestEstInsurance = estimate.InputEstInsurance;
                    var tax = $scope.inputData.Tax ? $scope.inputData.Tax : 0;
                    var discount = $scope.inputData.Discount
                        ? $scope.inputData.Discount
                        : 0;
                    var charge = parseFloat(($scope.inputData.Fee - discount + tax).toFixed(2));
                    var feeScheduleFee = parseFloat((charge - $scope.inputData.InsuranceEstimates[0].AdjEst).toFixed(2));
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
                    if ($scope.inputData.InsuranceEstimates[0].AdjEst > 999999.99) {
                        $scope.inputData.InsuranceEstimates[0].AdjEst = 999999.99;
                    }
                    var charge = $scope.inputData.Fee;
                    var feeScheduleFee = parseFloat((charge - $scope.inputData.InsuranceEstimates[0].AdjEst).toFixed(2));

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
            var totalEstimatedInsurance = 0;
            var tax = $scope.inputData.Tax ? $scope.inputData.Tax : 0;
            var discount = $scope.inputData.Discount ? $scope.inputData.Discount : 0;
            var charge = parseFloat(($scope.inputData.Fee - discount + tax).toFixed(2));

            angular.forEach($scope.inputData.InsuranceEstimates, function (est) {
                totalEstimatedInsurance += est.InputEstInsurance;
                totalEstimatedInsurance += est.AdjEst;
            });

            if (parseFloat(totalEstimatedInsurance.toFixed(2)) > parseFloat(charge.toFixed(2))) {
                $scope.estimatesExceedCharges = true;
            } else {
                $scope.estimatesExceedCharges = false;
            }

            // Disable when nothing has changed or anything is invalid.
            //|| !_.reduce($scope.inputData.InsuranceEstimates,
            //function (valid, est) { return valid & est.validInsAmount; }, true)

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
                !$scope.validInsAmount ||
                $scope.estimatesExceedCharges
            );
        };

        $scope.$on('soar:tx-plan-disable-edit-functions', function (e, value) {
            $scope.disableEditFunctions = value;
        });
    },
]);
