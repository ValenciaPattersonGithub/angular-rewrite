'use strict';

angular.module('Soar.Patient').controller('InsuranceSelectorModalController', [
  '$scope',
  '$uibModalInstance',
  'patient',
  'insurance',
  'unsavedBenefitPlans',
  'PatientServices',
  'BusinessCenterServices',
  'toastrFactory',
  'localize',
  'PatSharedServices',
  function (
    $scope,
    $uibModalInstance,
    patient,
    insurance,
    unsavedBenefitPlans,
    patientServices,
    businessCenterServices,
    toastrFactory,
    localize,
    patSharedServices
  ) {
    var ctrl = this;

    $scope.patient = patient;
    $scope.insurance = insurance;
    $scope.plan = null;
    $scope.plans = [];

    $scope.initialize = function () {
      if (insurance.PatientId === null) {
        var emptyPlans = {
          Value: [],
        };
        ctrl.patientBenefitPlanSuccess(emptyPlans);
      } else {
        patientServices.PatientBenefitPlan.get(
          { patientId: insurance.PatientId },
          ctrl.patientBenefitPlanSuccess,
          function (err) {
            toastrFactory.error(
              localize.getLocalizedString(
                'Failed to retrieve list of {0}. Please try again.',
                ['insurance patient benefit plans']
              ),
              'Error'
            );
          }
        );
      }
    };

    ctrl.getBenefitPlans = function (patientId) {
      patientServices.PatientBenefitPlan.get(
        { patientId: patientId },
        function (pbpRes) {
          var patientBenefitPlans = pbpRes.Value;
          var plan;
          patientBenefitPlans.forEach(function (patientBenefitPlan) {
            if (
              patientBenefitPlan.PolicyHolderBenefitPlanDto.PolicyHolderId ===
              patientId
            ) {
              businessCenterServices.BenefitPlan.get(
                { BenefitId: patientBenefitPlan.BenefitPlanId },
                function (res) {
                  plan = res.Value;

                  plan.PolicyHolderStringId =
                    patientBenefitPlan.PolicyHolderStringId;
                  plan.alreadyAttached = _.some(unsavedBenefitPlans, {
                    BenefitPlanId: patientBenefitPlan.BenefitPlanId,
                    PolicyHolderId: patientBenefitPlan.PolicyHolderId,
                  });
                  plan.Priority = patientBenefitPlan.Priority;
                  plan.PriorityName = ctrl.getPriorityName(plan.Priority);
                  plan.PolicyHolderName =
                    patientBenefitPlan.PolicyHolderDetails.FirstName +
                    ' ' +
                    patientBenefitPlan.PolicyHolderDetails.LastName;
                  plan.PolicyHolderDOB = moment(
                    patientBenefitPlan.PolicyHolderDetails.DateOfBirth
                  ).format('MM/DD/YYYY');
                  // sanitize display names for user input names
                  plan.Name = plan.Name ? _.escape(plan.Name) : plan.Name;
                  plan.PolicyHolderName = plan.PolicyHolderName
                    ? _.escape(plan.PolicyHolderName)
                    : plan.PolicyHolderName;
                  plan.CarrierName = plan.CarrierName
                    ? _.escape(plan.CarrierName)
                    : plan.CarrierName;

                  $scope.insurancePBPs.forEach(function (insurancePbp) {
                    if (
                      insurancePbp.BenefitPlanId ===
                        patientBenefitPlan.BenefitPlanId &&
                      insurancePbp.PolicyHolderId ===
                        patientBenefitPlan.PolicyHolderId
                    ) {
                      plan.alreadyAttached = true;
                    }
                  });

                  _.forEach(unsavedBenefitPlans, plan => {
                    if (
                      plan.BenefitPlanId === patientBenefitPlan.BenefitPlan &&
                      plan.PolicyHolderId === patientBenefitPlan.PolicyHolderId
                    ) {
                      plan.alreadyAttached = true;
                    }
                  });

                  $scope.plans.push(plan);
                  ctrl.sortPlansByPriority();
                },
                function (err) {
                  toastrFactory.error(
                    localize.getLocalizedString(
                      'Failed to retrieve list of {0}. Please try again.',
                      ['benefit plans']
                    ),
                    'Error'
                  );
                }
              );
            }
          });
        },
        function (err) {
          toastrFactory.error(
            localize.getLocalizedString(
              'Failed to retrieve list of {0}. Please try again.',
              ['patient benefit plans']
            ),
            'Error'
          );
        }
      );
    };

    ctrl.sortPlansByPriority = function () {
      $scope.plans.sort(function (a, b) {
        if (a.Priority > b.Priority) {
          return 1;
        }
        return -1;
      });
    };

    ctrl.patientBenefitPlanSuccess = function (res) {
      $scope.insurancePBPs = res.Value;
      var pat = $scope.patient;
      if (pat) {
        ctrl.getBenefitPlans(pat.PatientId);

        pat.$name = patSharedServices.Format.PatientName(pat);
      }
    };

    ctrl.getPriorityName = function (priority) {
      switch (priority) {
        case 0:
          return 'Primary';
        case 1:
          return 'Secondary';
        case 2:
          return '3rd';
        case 3:
          return '4th';
        case 4:
          return '5th';
        case 5:
          return '6th';
        default:
          return 'unknown';
      }
    };

    $scope.closeModal = function () {
      $uibModalInstance.close($scope.plan);
    };

    $scope.cancelModal = function () {
      $uibModalInstance.dismiss();
    };
  },
]);
