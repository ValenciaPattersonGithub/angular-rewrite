'use strict';

angular.module('Soar.Patient').controller('InsuranceModalController', [
  '$scope',
  '$uibModalInstance',
  'insurance',
  'patient',
  'allowedPlans',
  'PatientServices',
  'toastrFactory',
  'localize',
  'ModalFactory',
  'PatSharedServices',
  'PatientLogic',
  'PatientBenefitPlansFactory',
  '$uibModal',
  function (
    $scope,
    $uibModalInstance,
    insurance,
    patient,
    allowedPlans,
    patientServices,
    toastrFactory,
    localize,
    modalFactory,
    patSharedServices,
    patientLogic,
    patientBenefitPlansFactory,
    $uibModal
  ) {
    var ctrl = this;

    insurance.$trackingId = _.uniqueId();

    $scope.insurance = insurance;
    $scope.plansAllowed = allowedPlans;
    $scope.editing = insurance.Editing;
    $scope.currentPlans = [];
    $scope.patient = null;
    $scope.patientInsurance = null;
    $scope.person = null;

    ctrl.originalInsurance = angular.copy(insurance);

    if (patient) {
      patient.$name =
        patient.FirstName +
        (patient.PreferredName ? ' (' + patient.PreferredName + ')' : '') +
        (patient.MiddleInitial ? ' ' + patient.MiddleInitial + '.' : '') +
        ' ' +
        patient.LastName;
    }

    $scope.patient = patient;
    $scope.patient.PatientBenefitPlanDtos = [insurance];
    $scope.hasPlans = $scope.patient.PatientBenefitPlanDtos.length > 0;

    $scope.initialize = function () {
      if ($scope.insurance.PatientId !== null) {
        ctrl.getCurrentPlans();
      }

      $scope.editing = insurance.PatientBenefitPlanId != null;
      // Needed because patient-insurance directive this modal uses expects the $scope.$parent.person
      // to have a value in order to trigger the parent .remove method
      $scope.person = angular.copy(patient);

      if ($scope.patient != null) {
        $scope.patient.$name = patSharedServices.Format.PatientName(patient);
      }

      ctrl.getPatientBenefitPlans();
    };

    ctrl.getCurrentPlans = function () {
      patientServices.PatientBenefitPlan.get(
        { patientId: $scope.insurance.PatientId },
        function (res) {
          $scope.currentPlans = res.Value;
        },
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
    };

    ctrl.calculatedDeductibleAndMaximumAmounts = function (insurance) {
      if (!insurance.$benefitPlan) return;

      insurance.AdditionalBenefits =
        insurance.$additionalBenefits == null
          ? 0
          : insurance.$additionalBenefits;

      if (insurance.$individualDeductibleLeft != null) {
        insurance.IndividualDeductibleUsed = Math.max(
          0,
          insurance.$benefitPlan.IndividualDeductible -
            insurance.$individualDeductibleLeft
        );
      }

      if (
        insurance.$familyDeductibleLeft != null &&
        insurance.PolicyHolderBenefitPlanDto
      ) {
        insurance.PolicyHolderBenefitPlanDto.FamilyDeductibleUsed = Math.max(
          0,
          insurance.$benefitPlan.FamilyDeductible -
            insurance.$familyDeductibleLeft
        );
      }

      if (insurance.$individualMaxLeft != null) {
        insurance.IndividualMaxUsed = Math.max(
          0,
          insurance.$benefitPlan.AnnualBenefitMaxPerIndividual +
            insurance.AdditionalBenefits -
            insurance.$individualMaxLeft
        );
      }
    };

    // get benefit plans for this patient
    ctrl.getPatientBenefitPlans = function () {
      if (!$scope.editing) {
        patientBenefitPlansFactory
          .PatientBenefitPlans($scope.patient.PatientId)
          .then(function (res) {
            $scope.patientBenefitPlans = res.Value;
          });
      }
    };

    ctrl.getInsuranceObject = function () {
      return {
        $trackingId: _.uniqueId(),
        PatientId: $scope.patient.PatientId,
        // A floating point random will not be confused with actual IDs, but we need
        // a unique value here to use "track by" on the ng-repeat, and without this
        // <patient-insurance> will be re-initialized way too often.
        BenefitPlanId: null, // Math.random(),
        PolicyHolderId: null,
        DependentChildOnly: false,
        PolicyHolderStringId: null,
        Priority: ctrl.calcNextAvailablePriority(),
        $policyHolderNeedsInsurance:
          $scope.insurance.$policyHolderNeedsInsurance,
        RequiredIdentification: null,
      };
    };

    $scope.removeInsurance = function ($index) {
      $scope.patient.PatientBenefitPlanDtos.splice($index, 1);

      angular.forEach(
        $scope.patient.PatientBenefitPlanDtos,
        function (plan, index) {
          plan.Priority = parseInt(index);
        }
      );

      $scope.hasPlans = patient.PatientBenefitPlanDtos.length > 0;
    };

    // calculate the next available priority when adding a new plan
    ctrl.calcNextAvailablePriority = function () {
      var nextAvailablePriority = 0;
      angular.forEach($scope.patient.PatientBenefitPlanDtos, function (plan) {
        if (plan.Priority >= nextAvailablePriority) {
          nextAvailablePriority = plan.Priority + 1;
        }
      });
      return nextAvailablePriority;
    };

    $scope.addInsurance = function () {
      var insuranceObj = ctrl.getInsuranceObject();

      if (insuranceObj) {
        $scope.patient.PatientBenefitPlanDtos.push(insuranceObj);
      }

      $scope.hasPlans = patient.PatientBenefitPlanDtos.length > 0;
    };

    ctrl.validateInsurance = function (insurance) {
      var isValid = true;

      insurance.$hasErrors = false;

      if (insurance.PolicyHolderId == null) {
        insurance.$hasErrors = true;
        return false;
      }

      insurance.$hasErrors =
        !(insurance.$dateValid && insurance.BenefitPlanId) ||
        (insurance.PatientId != insurance.PolicyHolderId &&
          (!insurance.RelationshipToPolicyHolder ||
            insurance.RelationshipToPolicyHolder == '')) ||
        (insurance.$validPolicyHolder == false && !$scope.editing);

      if ($scope.editing && !insurance.$hasErrors) {
        insurance.$hasErrors =
          (insurance.IndividualDeductibleUsed &&
            (insurance.IndividualDeductibleUsed < 0 ||
              insurance.IndividualDeductibleUsed > 999999.99) &&
            insurance.IndividualMaxUsed &&
            (insurance.IndividualMaxUsed < 0 ||
              insurance.IndividualMaxUsed > 999999.99) &&
            insurance.PolicyHolderBenefitPlanDto.FamilyDeductibleUsed &&
            (insurance.PolicyHolderBenefitPlanDto.FamilyDeductibleUsed < 0 ||
              insurance.PolicyHolderBenefitPlanDto.FamilyDeductibleUsed >
                999999.99)) ||
          (ctrl.originalInsurance.BenefitPlanId !== insurance.BenefitPlanId &&
            insurance.hasOpenClaims) ||
          (ctrl.originalInsurance.PolicyHolderId !== insurance.PolicyHolderId &&
            insurance.hasOpenClaims);
      }

      isValid = !insurance.$hasErrors;

      return isValid;
    };

    ctrl.searchForDuplicates = insurance => {
      insurance.isDuplicate = $scope.currentPlans.some(plan =>
        ctrl.isDuplicatePlan(plan, insurance)
      );
    };

    ctrl.isDuplicatePlan = (planA, planB) => {
      return (
        planA.BenefitPlanId === planB.BenefitPlanId &&
        planA.PolicyHolderId === planB.PolicyHolderId &&
        !$scope.editing
      );
    };

    $scope.saveMultiplePlans = function (insuranceList) {
      $scope.saving = true;

      $scope.multipleInsurancesToAdd = [];
      // set priorities on list
      ctrl.setPriorities(insuranceList);

      angular.forEach(insuranceList, function (ins, index) {
        $scope.save(ins, index);
      });

      $scope.isValid = insuranceList.every(insurance => !insurance.$hasErrors);

      // Ensure there are no duplicates with existing plans
      var anyDuplicates = insuranceList.some(
        insurance => insurance.isDuplicate
      );

      if (!$scope.editing && !anyDuplicates) {
        // Ensure there are no duplicates within the plans being added
        var dedupedInsuranceList = insuranceList.filter(
          (insurance, index, array) =>
            array.findIndex(i => ctrl.isDuplicatePlan(i, insurance)) == index
        );

        anyDuplicates = dedupedInsuranceList.length != insuranceList.length;
      }

      if ($scope.isValid && !anyDuplicates) {
        var save = $scope.editing
          ? patientServices.PatientBenefitPlan.update
          : patientServices.PatientBenefitPlan.create;
        // determine patientId
        var patientId = $scope.multipleInsurancesToAdd[0].PatientId;
        save(
          {
            patientId: patientId,
          },
          $scope.multipleInsurancesToAdd,
          function (res) {
            $scope.saving = false;
            toastrFactory.success(
              localize.getLocalizedString('{0} saved successfully.', [
                'Insurance',
              ]),
              'Success'
            );

            // JRW - changed on 4/19 to use Value[0], which was causing errors, might need to be changed for correctness.
            patientLogic
              .GetPatientById(res.Value[0].PolicyHolderId)
              .then(function (policyHolder) {
                res.Value[0].PolicyHolderDetails = policyHolder;

                $uibModalInstance.close(res.Value);
              });
          },
          function (res) {
            $scope.saving = false;
            if (ctrl.confirmFailedValidation(res)) {
              // suppress toastr
            } else if (!(res && res.status === 409))
              toastrFactory.error(
                localize.getLocalizedString(
                  'Failed to save {0}. Please try again.',
                  ['insurance']
                ),
                'Error'
              );
          }
        );
      } else {
        $scope.saving = false;
        if (anyDuplicates) {
          toastrFactory.error(
            localize.getLocalizedString(
              'Duplicate Plan/Policy Combinations are not allowed'
            ),
            'Error'
          );
        } else {
          toastrFactory.error(
            localize.getLocalizedString('Save for {0} is invalid.', [
              'insurance',
            ]),
            'Error'
          );
        }
      }
    };

    ctrl.confirmModal = function (message) {
      $uibModal.open({
        templateUrl: 'App/Common/components/confirmModal/confirmModal.html',
        controller: 'ConfirmModalController',
        size: 'md',
        windowClass: 'warning-modal-center',
        backdrop: 'static',
        keyboard: false,
        resolve: {
          item: function () {
            return {
              Title: localize.getLocalizedString('Insurance Policy Validation'),
              Message: localize.getLocalizedString(message),
              Button1Text: localize.getLocalizedString('Ok'),
            };
          },
        },
      });
    };

    // capture specific ValidationMessages and display modal with localized message
    ctrl.confirmFailedValidation = function (res) {
      var validationMessage = _.get(
        res,
        'data.InvalidProperties[0].ValidationMessage',
        'None'
      );
      if (
        res &&
        res.status === 400 &&
        validationMessage ===
          'Same benefit plan cannot be repeated with same policyholder'
      ) {
        ctrl.confirmModal(
          'Another user has made changes, refresh the page to see the latest information.'
        );
        return true;
      }
      if (
        res &&
        res.status === 400 &&
        validationMessage ===
          'Same priority cannot be set to more than one plan'
      ) {
        ctrl.confirmModal(
          'Another user has made changes, refresh the page to see the latest information.'
        );
        return true;
      }
      return false;
    };

    $scope.save = function (insurance, index) {
      $scope.saving = true;

      ctrl.calculatedDeductibleAndMaximumAmounts(insurance);

      // date picker was saving date as "xx/xx/xxxx" which was then saved as zulu time on the server. Need to convert to current time zone before saving.
      if (insurance.EffectiveDate && insurance.EffectiveDate != '') {
        insurance.EffectiveDate = new Date(
          insurance.EffectiveDate
        ).toISOString();
      }

      ctrl.searchForDuplicates(insurance);
      $scope.isValid = ctrl.validateInsurance(insurance);

      $scope.multipleInsurancesToAdd.push(insurance);
    };

    ctrl.hasChanges = function () {
      return !angular.equals($scope.insurance, ctrl.originalInsurance);
    };

    $scope.cancel = function () {
      if (ctrl.hasChanges()) {
        ctrl.openDiscardModal();
      } else {
        ctrl.cancelModal();
      }
    };

    ctrl.openDiscardModal = function () {
      modalFactory.CancelModal().then(ctrl.cancelModal);
    };

    ctrl.cancelModal = function (args) {
      $uibModalInstance.dismiss(args);
    };

    // set priorities on new plans
    ctrl.setPriorities = function (patientBenefitPlans) {
      if ($scope.editing === false) {
        var nextAvailablePriority = ctrl.calcNextAvailablePriority();
        angular.forEach(patientBenefitPlans, function (plan) {
          plan.Priority = nextAvailablePriority;
          nextAvailablePriority++;
        });
      }
    };

    // calculate the next available priority when adding a new plan
    ctrl.calcNextAvailablePriority = function () {
      var nextAvailablePriority = 0;
      angular.forEach($scope.patientBenefitPlans, function (plan) {
        if (plan.Priority >= nextAvailablePriority) {
          nextAvailablePriority = plan.Priority + 1;
        }
      });
      return nextAvailablePriority;
    };
  },
]);
