'use strict';
angular.module('Soar.BusinessCenter').controller('CloseClaimModalController', [
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
  'ClaimsService',
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
    usersFactory,
    claimsService
  ) {
    var ctrl = this;

    $scope.patientName = closeClaimObject.patientName;
    $scope.soarAuthAddCreditAdjustmentKey = 'soar-acct-cdtadj-add';
    $scope.alreadyApplyingAdjustment = false;
    $scope.note = '';
    $scope.noInsurancePayment = false;
    $scope.allProvidersList = [];
    $scope.loadingProviders = false;
    $scope.claimActionsValue = '1';
    $scope.recreateClaimSelected = false;
    $scope.accountOptionsValue = '';
    $scope.updateservicetransactions =
      closeClaimObject != null && closeClaimObject.isFromInsurancePayment
        ? true
        : false;
    $scope.claimActionsOptions = ['1', '2'];
    $scope.claimActionsLabels = [
      localize.getLocalizedString('Apply amount unpaid back to the account'),
      localize.getLocalizedString('Apply a negative adjustment to the account'),
    ];
    $scope.canReCreateClaim = closeClaimObject.hasMultipleTransactions;
    $scope.hideCancel =
      closeClaimObject.fromPatitentSummary &&
      !closeClaimObject.isPaymentApplied;
    $scope.hideAppliedPaymentWarning = !closeClaimObject.isPaymentApplied;
    $scope.createClaimSelected = false;
    $scope.isFromInsurancePayment = closeClaimObject.isFromInsurancePayment
      ? true
      : false;
    $scope.totalEstimatedInsurance = !_.isNil(
      closeClaimObject.TotalEstimatedInsurance
    )
      ? closeClaimObject.TotalEstimatedInsurance
      : 0.0;
    $scope.closeClaimButtonName = closeClaimObject.isFromInsurancePayment
      ? closeClaimObject.closeClaimButtonName
      : localize.getLocalizedString('Close Claim');
    $scope.patientBenefitPlansDto = [];

    $scope.estimateInsuranceOptionLabels = [
      localize.getLocalizedString(
        'Estimate Insurance Based on Current Benefits'
      ),
      localize.getLocalizedString('Do Not Estimate Insurance'),
    ];
    $scope.estimateInsuranceOption = true;

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

    ////retrieve list of patient benefit plans
    ctrl.getPatientBenefitPlan = function () {
      patientServices.PatientBenefitPlan.get(
        { patientId: closeClaimObject.patientId, includeDeleted: true },
        function (res) {
          $scope.patientBenefitPlansDto = res.Value;
          ctrl.getClaimEntity();
        },
        function () {
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
    ctrl.getPatientBenefitPlan();

    ctrl.getClaimEntity = function () {
      claimsService.getClaimEntityByClaimId(
        { claimId: closeClaimObject.claimId },
        ctrl.getClaimEntitySuccess,
        ctrl.getClaimEntityFailure
      );
    };

    ctrl.getClaimEntitySuccess = function (response) {
      $scope.claimEntity = response.Value;
      if (
        $scope.patientBenefitPlansDto &&
        $scope.patientBenefitPlansDto.length > 0
      ) {
        $scope.patientBenefitPlan = _.filter(
          $scope.patientBenefitPlansDto,
          function (plan) {
            return (
              plan.PatientBenefitPlanId ===
              $scope.claimEntity.PatientBenefitPlanId
            );
          }
        );
      }
      $scope.getEstInsurance = patientServices.Claim.getEstimatedInsuranceForClaim(
        { claimId: closeClaimObject.claimId },
        function (res) {
          $scope.estInsurance = 0;
          $scope.estInsurancePaid = 0;
          $scope.showEstInsurance = false;
          if (
            $scope.patientBenefitPlansDto &&
            $scope.patientBenefitPlansDto.length > 0
          ) {
            $scope.estInsuranceDtos = _.filter(res.Value, function (estInsDto) {
              return (
                estInsDto.PatientBenefitPlanId ===
                $scope.patientBenefitPlan[0].PatientBenefitPlanId
              );
            });
          }
          $scope.filteredServiceTransactionIds = [];
          angular.forEach($scope.estInsuranceDtos, function (estIns) {
            $scope.estInsurancePaid += estIns.PaidAmount;
            $scope.estInsurance += estIns.EstInsurance;
            $scope.filteredServiceTransactionIds.push(
              estIns.ServiceTransactionId
            );
          });
          $scope.totalUnpaidAmount =
            $scope.estInsurance - $scope.estInsurancePaid;
          $scope.showEstInsurance = angular.isNumber($scope.estInsurance);
          $scope.claimInformationSummary = closeClaimObject.isFromInsurancePayment
            ? localize.getLocalizedString('Patient') +
              '  ' +
              closeClaimObject.patientName +
              '  |  ' +
              closeClaimObject.DateOfServices +
              '  |  ' +
              $filter('currency')($scope.totalEstimatedInsurance)
            : '';
          ctrl.getServiceTransactionsList(closeClaimObject.claimId);
        }
      );
    };

    ctrl.getClaimEntityFailure = function () {
      toastrFactory.error(
        localize.getLocalizedString('Failed to retrieve claim entity'),
        localize.getLocalizedString('Error')
      );
    };

    // gets all the providers
    $scope.getPracticeProviders = function () {
      $scope.loadingProviders = true;
      usersFactory
        .Users()
        .then($scope.userServicesGetSuccess, $scope.userServicesGetFailure);
    };
    $scope.getPracticeProviders();

    //ng-blur handler for individual deductible remaining field.
    $scope.validateIndvDeductible = function () {
      if (
        $scope.individualDeductibleRemaining >
        $scope.patientBenefitPlan[0].PolicyHolderBenefitPlanDto.BenefitPlanDto
          .IndividualDeductible
      ) {
        $scope.individualDeductibleRemaining = '';
      }
    };

    //ng-blur handler for family deductible remaining field.
    $scope.validateFamDeductible = function () {
      if (
        $scope.familyDeductibleRemaining >
        $scope.patientBenefitPlan[0].PolicyHolderBenefitPlanDto.BenefitPlanDto
          .FamilyDeductible
      ) {
        $scope.familyDeductibleRemaining = '';
      }
    };

    $scope.$watch('recreateClaimSelected', function () {
      if ($scope.recreateClaimSelected) {
        $scope.claimActionsValue = null;
      } else $scope.claimActionsValue = '1';
    });

    ctrl.originalClaimId = angular.copy(closeClaimObject.claimId);

    var claimObject = function (
      claimId,
      reason,
      insurancepayment,
      recreateclaim,
      closeclaimadjustment,
      updateservicetransactions,
      isPaid,
      updateAgingDates
    ) {
      (this.ClaimId = claimId),
        (this.Note = reason),
        (this.NoInsurancePayment = insurancepayment),
        (this.ReCreateClaim = recreateclaim),
        (this.CloseClaimAdjustment = closeclaimadjustment),
        (this.UpdateServiceTransactions = updateservicetransactions),
        (this.IsPaid = isPaid);
      this.UpdateAgingDates = updateAgingDates;
    };

    ctrl.authAddCreditTransactionAccess = function () {
      return patSecurityService.IsAuthorizedByAbbreviation(
        $scope.soarAuthAddCreditAdjustmentKey
      );
    };

    $scope.filteredServiceTransactionIds = [];

    //function returns trasaction services for selected claim having (Insurance - PaidAmount) > 0,
    ctrl.getInsurancePaymentServices = function () {
      //$scope.ServiceTransactionList;
      //$scope.filteredServiceTransactionIds;
      _.each($scope.ServiceTransactionList, function (serviceTransaction) {
        serviceTransaction.isForCloseClaim = true;
      });
      return _.filter(
        $scope.ServiceTransactionList,
        function (serviceTransaction) {
          return (
            $scope.filteredServiceTransactionIds.indexOf(
              serviceTransaction.ServiceTransactionId
            ) !== -1
          );
        }
      );
    };

    // Function to open patient adjustment modal
    $scope.openAdjustmentModal = function () {
      if (ctrl.authAddCreditTransactionAccess()) {
        var accountId;
        var accountMemberId;
        if (closeClaimObject.claimId) {
          if (!$scope.alreadyApplyingAdjustment) {
            $scope.alreadyApplyingAdjustment = true;
            patientServices.Account.getByPersonId(
              { personId: closeClaimObject.patientId },
              function (res) {
                accountId = res.Value.AccountId;
                accountMemberId = res.Value.PersonAccountMember.AccountMemberId;
                ctrl.dataForModal = {
                  PatientAccountDetails: {
                    AccountId: accountId,
                    AccountMemberId: accountMemberId,
                  },
                  DefaultSelectedIndex: 1,
                  AllProviders: $scope.allProvidersList,
                  BenefitPlanId: $scope.claimEntity.BenefitPlanId,
                  claimAmount: $scope.estInsurance,
                  serviceTransactionData: {
                    serviceTransactions: $scope.filteredServiceTransactionIds,
                    isForCloseClaim: true,
                    unPaidAmout: parseFloat(
                      $scope.totalUnpaidAmount.toFixed(2)
                    ),
                  },
                  //patient information of which claims belongs to
                  patientData: {
                    patientId: closeClaimObject.patientId,
                    patientName: closeClaimObject.patientName,
                  },
                };

                modalDataFactory
                  .GetTransactionModalData(
                    ctrl.dataForModal,
                    closeClaimObject.patientId
                  )
                  .then(ctrl.openModal);
              }
            );
          }
        }
      } else {
        ctrl.notifyNotAuthorized($scope.soarAuthAddCreditAdjustmentKey);
      }
    };

    //Handle Ok callback from adjustment dialog
    ctrl.openAdjustmentModalResultOk = function () {
      if ($scope.alreadyApplyingAdjustment)
        $scope.alreadyApplyingAdjustment = false;
      else $scope.alreadyApplyingPayment = false;

      var claimObj = new claimObject(
        closeClaimObject.claimId,
        $scope.note,
        $scope.noInsurancePayment,
        $scope.recreateClaimSelected,
        $scope.claimActionsValue,
        $scope.updateservicetransactions,
        $scope.updateAgingDates
      );
      closeClaimService.update(
        claimObj,
        function () {
          $scope.closing = false;

          toastrFactory.success(
            localize.getLocalizedString('{0} closed successfully.', ['Claim']),
            'Success'
          );

          claimObj.recreate = $scope.createClaimSelected;
          ctrl.getPlansAvail(claimObj);
        },
        function () {
          $scope.closing = false;
          toastrFactory.error(
            localize.getLocalizedString(
              'Failed to close {0}. Please try again.',
              ['Claim']
            ),
            'Error'
          );
        }
      );
    };

    //Handle Cancel callback from adjustment dialog
    ctrl.openAdjustmentModalResultCancel = function () {
      if ($scope.alreadyApplyingAdjustment)
        $scope.alreadyApplyingAdjustment = false;
      else $scope.alreadyApplyingPayment = false;
      // when user selects cancel, apply the unpaid amount back to the patient account.
      $scope.claimActionsValue = '1';
      // $scope.recreateClaimSelected = false;
      var claimObj = new claimObject(
        closeClaimObject.claimId,
        $scope.note,
        $scope.noInsurancePayment,
        $scope.recreateClaimSelected,
        $scope.claimActionsValue,
        $scope.updateservicetransactions,
        $scope.updateAgingDates
      );

      closeClaimService.update(
        claimObj,
        function () {
          $scope.closing = false;

          toastrFactory.success(
            localize.getLocalizedString('{0} closed successfully.', ['Claim']),
            'Success'
          );

          claimObj.recreate = $scope.createClaimSelected;
          ctrl.getPlansAvail(claimObj);
        },
        function () {
          $scope.closing = false;
          toastrFactory.error(
            localize.getLocalizedString(
              'Failed to close {0}. Please try again.',
              ['Claim']
            ),
            'Error'
          );
        }
      );
    };

    //Function to open adjustment modal
    ctrl.openModal = function (transactionModalData) {
      ctrl.dataForModal = transactionModalData;
      modalFactory.TransactionModal(
        ctrl.dataForModal,
        ctrl.openAdjustmentModalResultOk,
        ctrl.openAdjustmentModalResultCancel
      );
    };

    $scope.closeClaim = function () {
      $scope.closing = true;
      if (closeClaimObject.claimId) {
        if ($scope.claimActionsValue === '2') {
          $scope.openAdjustmentModal();
        } else {
          if (
            $scope.recreateClaimSelected &&
            closeClaimObject.fromPatitentSummary
          ) {
            //$scope.recreateClaimSelected = false;
            $scope.createClaimSelected = true;
            $scope.claimActionsValue = null;
          }

          var claimObj = new claimObject(
            closeClaimObject.claimId,
            $scope.note,
            $scope.noInsurancePayment,
            $scope.recreateClaimSelected,
            $scope.claimActionsValue,
            $scope.updateservicetransactions,
            closeClaimObject.isFromInsurancePayment,
            $scope.updateAgingDates
          );

          claimObj.IndividualDeductibleRemaining =
            $scope.individualDeductibleRemaining;
          claimObj.FamilyDeductibleRemaining = $scope.familyDeductibleRemaining;
          claimObj.IsPrintedAndClosed = closeClaimObject.isPrintedAndClosed;

          // DataTag isn't null when closing claims directly from the ellipses. DataTag is null when submitting untracked paper claims.
          if (closeClaimObject.DataTag === null) {
            claimObj.DataTag = $scope.claimEntity.DataTag;
          } else {
            claimObj.DataTag = closeClaimObject.DataTag;
          }

          var checkDataTag = closeClaimObject.CheckDataTag ? true : false;

          closeClaimService.update(
            {
              checkDataTag: checkDataTag,
              calculateEstimatedInsurance: $scope.estimateInsuranceOption,
            },
            claimObj,
            function () {
              $scope.closing = false;
              toastrFactory.success(
                localize.getLocalizedString('{0} closed successfully.', [
                  'Claim',
                ]),
                'Success'
              );

              if (!claimObj.ReCreateClaim) {
                ctrl.getPlansAvail(claimObj);
              } else {
                $uibModalInstance.close(claimObj);
              }
            },
            function () {
              $scope.closing = false;
              toastrFactory.error(
                localize.getLocalizedString(
                  'Failed to close {0}. Please try again.',
                  ['Claim']
                ),
                'Error'
              );
            }
          );
        }
      } else {
        $scope.closing = false;
      }
    };

    // get a list of service transaction by claimId
    ctrl.getServiceTransactionsList = function (claimId) {
      // if (patSecurityService.IsAuthorizedByAbbreviation($scope.soarAuthClaimViewKey))
      {
        patientServices.Claim.getServiceTransactionsByClaimId(
          { claimId: claimId },
          function (res) {
            //transaction.ServiceTransactionIdToDelete = res.Value.ServiceTransactionId;
            var serviceTransactions = res.Value;
            angular.forEach(serviceTransactions, function (key, val) {
              if ($scope.serviceToDelete == key.ServiceTransactionId) {
                serviceTransactions.splice(val, 1);
              }
            });
            $scope.ServiceTransactionList = serviceTransactions;
          },
          function () {
            toastrFactory.error(
              localize.getLocalizedString('An error has occurred while {0}', [
                'getting claims',
              ]),
              localize.getLocalizedString('Server Error')
            );
          }
        );
      }
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

    $scope.plansAvail = [];

    ctrl.getPlansAvail = function (claimObj) {
      var listContainingClaimId = [];
      listContainingClaimId.push(closeClaimObject.claimId);
      patientServices.PatientBenefitPlan.getBenefitPlansAvailableByClaimId(
        listContainingClaimId,
        function (res) {
          ctrl.getPlansAvailSuccess(res, claimObj);
        },
        ctrl.getPlansAvailFailure
      );
      //patientServices.PatientBenefitPlan.getBenefitPlansRecordsByPatientId({ patientId: closeClaimObject.patientId }, ctrl.getPlansAvailSuccess, ctrl.getPlansAvailFailure);
    };

    ctrl.getPlansAvailSuccess = function (res, claimObj) {
      $scope.plansAvail = res.Value.PatientBenefitPlans;
      if (
        $scope.claimEntity.PatientBenefitPlanPriority ===
          $scope.patientBenefitPlan[0].Priority &&
        $scope.plansAvail &&
        $scope.plansAvail.length > 0 &&
        $scope.plansAvail[$scope.plansAvail.length - 1].Priority >
          $scope.claimEntity.PatientBenefitPlanPriority
      ) {
        ctrl.openCloseRecreateModal(res, claimObj);
      } else {
        $uibModalInstance.close(claimObj);
      }
    };

    ctrl.getPlansAvailFailure = function () {};

    ctrl.openCloseRecreateModal = function (res, claimObj) {
      res.Value.ClaimId = closeClaimObject.claimId;
      modalFactory.CloseClaimCancelModal(res).then(
        function (closed) {
          ctrl.getCreatedClaim(closed, claimObj);
        },
        function () {
          $uibModalInstance.close(claimObj);
        }
      );
    };

    ctrl.getCreatedClaim = function (claim, claimObj) {
      claimsService.getClaimById(
        {
          claimId: claim.claims[0].ClaimId,
        },
        ctrl.getClaimSuccess(claim, claimObj),
        ctrl.getClaimFailure
      );
    };

    ctrl.getClaimFailure = function () {
      toastrFactory.error(
        localize.getLocalizedString('Failed to get new claim.'),
        'Failure'
      );
    };

    ctrl.getClaimSuccess = function (oldClaimData, claimObj) {
      return function (response) {
        var newClaim = response.Value;
        var selectedClaimHasAdjustedEstimate = false;

        angular.forEach(
          newClaim.ServiceTransactionToClaimPaymentDtos,
          function (serviceTransaction) {
            if (serviceTransaction.AdjustedEstimate > 0) {
              selectedClaimHasAdjustedEstimate = true;
            }
          }
        );

        var selectedPlanAdjustsOff =
          oldClaimData.selectedPlan.PolicyHolderBenefitPlanDto.BenefitPlanDto
            .FeesIns === 2;
        var selectedPlanApplyAtCharge =
          oldClaimData.selectedPlan.PolicyHolderBenefitPlanDto.BenefitPlanDto
            .ApplyAdjustments === 1;

        if (
          oldClaimData.selectedPlan.Priority === 1 &&
          selectedPlanAdjustsOff &&
          selectedPlanApplyAtCharge &&
          selectedClaimHasAdjustedEstimate
        ) {
          ctrl.handleAdjustmentModal(newClaim, claimObj);
        } else {
          $uibModalInstance.close(claimObj);
        }
      };
    };

    //handle confirmation modal for handling fee schedule adjustments
    ctrl.handleAdjustmentModal = function (claim, claimObj) {
      var title = localize.getLocalizedString('Fee Schedule Present');
      var message = localize.getLocalizedString(
        "The patient's benefit plan requires a fee schedule adjustment. Would you like to complete the adjustment now?"
      );
      var button1Text = localize.getLocalizedString('Yes');
      var button2Text = localize.getLocalizedString('No');
      modalFactory
        .ConfirmModal(title, message, button1Text, button2Text)
        .then(
          ctrl.openAdjustmentModal(claim, claimObj),
          ctrl.closeModals(claimObj)
        );
    };

    ctrl.closeModals = function (claimObj) {
      return function () {
        $uibModalInstance.close(claimObj);
      };
    };

    ctrl.openAdjustmentModal = function (claim, claimObj) {
      return function () {
        var ids = _.map(
          claim.ServiceTransactionToClaimPaymentDtos,
          function (item) {
            return item.ServiceTransactionId;
          }
        );
        var sum = _.reduce(
          claim.ServiceTransactionToClaimPaymentDtos,
          function (sum, item) {
            return sum + item.AdjustedEstimate;
          },
          0
        );

        ctrl.dataForModal = {
          PatientAccountDetails: { AccountId: claim.AccountId },
          DefaultSelectedIndex: 1,
          AllProviders: $scope.allProvidersList,
          BenefitPlanId: claim.BenefitPlanId,
          claimAmount: 0,
          isFeeScheduleAdjustment: true,
          claimId: claim.ClaimId,
          serviceTransactionData: {
            serviceTransactions: ids,
            isForCloseClaim: true,
            unPaidAmout: sum,
          },
          patientData: {
            patientId: claim.PatientId,
            patientName: claim.PatientName,
          },
        };
        modalDataFactory
          .GetTransactionModalData(ctrl.dataForModal, claim.PatientId)
          .then(function (result) {
            modalFactory.TransactionModal(
              result,
              ctrl.closeModals(claimObj),
              ctrl.closeModals(claimObj)
            );
          });
      };
    };
    ctrl.openDiscardModal = function () {
      modalFactory.CancelModal().then(ctrl.cancelModal);
    };

    ctrl.cancelModal = function () {
      $uibModalInstance.dismiss();
    };
  },
]);
