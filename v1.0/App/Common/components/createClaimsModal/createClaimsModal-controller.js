'use strict';
angular.module('common.controllers').controller('CreateClaimsModalController', [
  '$scope',
  '$location',
  '$uibModalInstance',
  '$filter',
  'PatientServices',
  'toastrFactory',
  'localize',
  'createClaimData',
  function (
    $scope,
    $location,
    $uibModalInstance,
    $filter,
    patientServices,
    toastrFactory,
    localize,
    createClaimData
  ) {
    var ctrl = this;
    var primaryPlan = '';
    $scope.plans = [];
    $scope.patientBenefitPlans = [];
    $scope.selectedPlan = '';
    $scope.createClaimButtonDisabled = true;

    ctrl.getPatientBenefitPlans = function () {
      patientServices.PatientBenefitPlan.getBenefitPlansRecordsByPatientId(
        { patientId: createClaimData.AccountMember.personId },
        ctrl.getPatientBenefitPlansSuccess,
        ctrl.getPatientBenefitPlansFailure
      );
    };

    ctrl.getPatientBenefitPlansSuccess = function (response) {
      $scope.patientBenefitPlans = angular.copy(
        $filter('orderBy')(response.Value, 'Priority', false)
      ); // Filters the plans by priority (Primary starting first / switch false to true to reverse the order)

      angular.forEach($scope.patientBenefitPlans, function (plan) {
        var priorityIdentifier;

        switch (plan.Priority) {
          case 0:
            priorityIdentifier = 'Primary';
            primaryPlan = plan.PatientBenefitPlanId;
            break;
          case 1:
            priorityIdentifier = 'Secondary';
            break;
          case 2:
            priorityIdentifier = '3rd';
            break;
          case 3:
            priorityIdentifier = '4th';
            break;
          case 4:
            priorityIdentifier = '5th';
            break;
          case 5:
            priorityIdentifier = '6th';
            break;
          default:
            priorityIdentifier = 'unknown';
            break;
        }

        $scope.plans.push({
          Name:
            angular.copy(plan.PolicyHolderBenefitPlanDto.BenefitPlanDto.Name) +
            ' (' +
            priorityIdentifier +
            ')',
          PatientBenefitPlanId: angular.copy(plan.PatientBenefitPlanId),
        });
      });
    };

    ctrl.getPatientBenefitPlansFailure = function () {
      toastrFactory.error(
        { Text: 'Failed to get {0}.', Params: ['patient benefit plans'] },
        'Error'
      );
    };

    $scope.createClaims = function () {
      if (createClaimData.selectPlanOnly === true) {
        $uibModalInstance.close($scope.selectedPlan);
      } else {
        patientServices.Claim.Create(
          {
            encounterId: createClaimData.Encounter.EncounterId,
            patientBenefitPlanId: $scope.selectedPlan,
            calculateEstimatatedInsurance: true,
          },
          {}
        ).$promise.then(
          function (claim) {
            //check for things, if yes, route different
            claim.Value.planForClaim = _.find(
              $scope.patientBenefitPlans,
              function (benefitPlan) {
                return benefitPlan.PatientBenefitPlanId == $scope.selectedPlan;
              }
            );
            toastrFactory.success(
              { Text: '{0} created successfully.', Params: ['Claims'] },
              'Success'
            );
            $uibModalInstance.close(claim.Value);
          },
          function () {
            toastrFactory.error(
              { Text: 'Failed to create {0}.', Params: ['Claims'] },
              'Error'
            );
            $uibModalInstance.close();
          }
        );
      }
    };

    $scope.cancel = function () {
      $uibModalInstance.dismiss();
    };

    $scope.updateSelectedPlan = function (nv, ov) {
      if (!_.isUndefined(nv) && !_.isEqual(nv, ov)) {
        $scope.selectedPlan = nv;
      }

      $scope.createClaimButtonDisabled =
        !_.isUndefined($scope.selectedPlan) &&
        !_.isEqual($scope.selectedPlan, '')
          ? false
          : true;
    };

    ctrl.getPatientBenefitPlans();
  },
]);
