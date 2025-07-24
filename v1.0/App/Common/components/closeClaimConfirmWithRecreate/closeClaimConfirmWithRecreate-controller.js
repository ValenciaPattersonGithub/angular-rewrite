'use strict';

// Close claim modal for patient summary
angular
  .module('common.controllers')
  .controller('CloseClaimConfirmWithRecreateController', [
    '$scope',
    '$uibModalInstance',
    'toastrFactory',
    'closeClaimObject',
    'localize',
    'ModalFactory',
    'ModalDataFactory',
    'CloseClaimService',
    'patSecurityService',
    'UserServices',
    'PatientServices',
    '$filter',
    'UsersFactory',
    function (
      $scope,
      $uibModalInstance,
      toastrFactory,
      closeClaimObject,
      localize,
      modalFactory,
      modalDataFactory,
      closeClaimService,
      patSecurityService,
      userServices,
      patientServices,
      $filter,
      usersFactory
    ) {
      var ctrl = this;

      $scope.claimInfo = closeClaimObject.claimInfo;
      $scope.affectedTransactions = closeClaimObject.affectedTransactions;
      $scope.canReCreateClaim = closeClaimObject.canRecreate;
      $scope.multipleEdits = closeClaimObject.multipleEdits;
      $scope.isLastClaim = closeClaimObject.claimInfo.IsLastClaim;
      $scope.patientBenefitPlan =
        closeClaimObject.claimInfo.PatientBenefitPlanId;
      $scope.patientBenefitPlanPriority =
        closeClaimObject.claimInfo.PatientBenefitPlanPriority;
      $scope.willAffectFeeScheduleWriteOff =
        closeClaimObject.willAffectFeeScheduleWriteOff;
      $scope.delete = closeClaimObject.delete;
      $scope.adjustDateWarning = closeClaimObject.adjustDateWarning;
      $scope.soarAuthAddCreditAdjustmentKey = 'soar-acct-cdtadj-add';
      $scope.note = '';
      $scope.message = '';
      $scope.noInsurancePayment = false;
      $scope.allProvidersList = [];
      $scope.loadingProviders = false;
      $scope.claimActionsValue = '1';
      $scope.recreateClaimSelected = true;
      $scope.accountOptionsValue = '';
      $scope.updateservicetransactions = true;
      $scope.hideCancel = false;
      $scope.showInsuranceError = false;
      angular.forEach($scope.affectedTransactions, function (transaction) {
        if (transaction.TotalInsurancePaidAmount > 0)
          $scope.showInsuranceError = true;
      });

      $scope.createClaimSelected = false;

      if (closeClaimObject.delete) {
        $scope.message = 'deleting';
      }

      if (closeClaimObject.edit) {
        $scope.message = 'editing';
      }

      if (
        closeClaimObject.delete &&
        closeClaimObject.affectedTransactions.length <= 1
      ) {
        $scope.recreateClaimSelected = false;
        $scope.canReCreateClaim = false;
        $scope.createClaimSelected = false;
      }

      switch ($scope.patientBenefitPlanPriority) {
        case 0:
          $scope.priorityString = 'Primary Claim';
          break;
        case 1:
          $scope.priorityString = 'Secondary Claim';
          break;
        case 2:
          $scope.priorityString = '3rd Supplemental Claim';
          break;
        case 3:
          $scope.priorityString = '4th Supplemental Claim';
          break;
        case 4:
          $scope.priorityString = '5th Supplemental Claim';
          break;
        case 5:
          $scope.priorityString = '6th Supplemental Claim';
          break;
        default:
          $scope.priorityString = 'N/A';
          break;
      }

      // gets all the providers
      $scope.getPracticeProviders = function () {
        $scope.loadingProviders = true;
        usersFactory
          .Users()
          .then($scope.userServicesGetSuccess, $scope.userServicesGetFailure);
      };

      $scope.userServicesGetSuccess = function (res) {
        $scope.loadingProviders = false;
        $scope.allProvidersList = res.Value;
      };

      $scope.userServicesGetFailure = function () {
        $scope.loadingProviders = false;
        $scope.allProvidersList = [];

        toastrFactory.error(
          localize.getLocalizedString(
            'Failed to retrieve the list of {0}. Refresh the page to try again',
            ['providers']
          ),
          localize.getLocalizedString('Server Error')
        );
      };

      $scope.getPracticeProviders();

      $scope.$watch('recreateClaimSelected', function (nv, ov) {
        if ($scope.recreateClaimSelected) {
          $scope.claimActionsValue = null;
        } else {
          $scope.claimActionsValue = '1';
        }
      });

      var claimObject = function (
        claimId,
        reason,
        insurancepayment,
        recreateclaim,
        closeclaimadjustment,
        updateservicetransactions,
        isEdited
      ) {
        (this.ClaimId = claimId),
          (this.Note = reason),
          (this.NoInsurancePayment = insurancepayment),
          (this.ReCreateClaim = recreateclaim),
          (this.CloseClaimAdjustment = closeclaimadjustment),
          (this.UpdateServiceTransactions = updateservicetransactions),
          (this.IsEdited = isEdited);
      };

      ctrl.originalClaimId = angular.copy($scope.claimInfo.ClaimId);

      $scope.closeClaim = function () {
        if ($scope.recreateClaimSelected) {
          $scope.recreateClaimSelected = false;
          $scope.createClaimSelected = true;
          $scope.claimActionsValue = null;
        }

        $scope.closing = true;
        if ($scope.claimInfo.ClaimId) {
          var claimObj = new claimObject(
            $scope.claimInfo.ClaimId,
            $scope.note,
            $scope.noInsurancePayment,
            $scope.recreateClaimSelected,
            $scope.claimActionsValue,
            $scope.updateservicetransactions,
            true
          );
          claimObj.patientBenefitPlanId = $scope.claimInfo.PatientBenefitPlanId;
          claimObj.patientBenefitPlanPriority =
            $scope.claimInfo.PatientBenefitPlanPriority;
          $scope.closing = false;
          claimObj.recreate = $scope.createClaimSelected;
          claimObj.CloseClaimAdjustment = null;
          if (!claimObj.recreate) {
            _.forEach($scope.affectedTransactions, transaction => {
              transaction.TotalEstInsurance = 0;
              transaction.InsuranceEstimates = [];
            });
          }
          claimObj.affectedTransactions = $scope.affectedTransactions;
          $uibModalInstance.close(claimObj);
        } else {
          $scope.closing = false;
        }
      };

      ctrl.authAddCreditTransactionAccess = function () {
        return patSecurityService.IsAuthorizedByAbbreviation(
          $scope.soarAuthAddCreditAdjustmentKey
        );
      };

      ctrl.hasChanges = function () {
        return !angular.equals($scope.claimId, ctrl.originalClaimId);
      }; // Amfa

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

      ctrl.cancelModal = function () {
        $uibModalInstance.dismiss();
      };
    },
  ]);
