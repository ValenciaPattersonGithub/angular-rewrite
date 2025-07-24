'use strict';

angular.module('Soar.Patient').controller('DeleteInsurancePaymentController', [
  '$scope',
  '$routeParams',
  '$uibModal',
  'patSecurityService',
  'localize',
  'ModalFactory',
  'DeleteInsurancePaymentFactory',
  'toastrFactory',
  'PatientServices',
  '$location',
  'ListHelper',
  '$filter',
  'userSettingsDataService',
  'CloseClaimOptionsService',
  '$q',
  function (
    $scope,
    $routeParams,
    $uibModal,
    patSecurityService,
    localize,
    modalFactory,
    deleteInsurancePaymentFactory,
    toastrFactory,
    patientServices,
    $location,
    listHelper,
    $filter,
    userSettingsDataService,
    closeClaimOptionsService,
    $q
  ) {
    var ctrl = this;
    $scope.isProcessingLastClaim = false;
    $scope.canRecreate = true; // Determines if 'Recreate' checkbox is enabled
    $scope.canApplyInsurancePaymentBackToPatientBenefit = false; // Determines if 'Apply Insurance Payment Back to Patient Benefit' checkbox is enabled
    // shows next claim,
    $scope.showNextAndProcess = function () {
      if (ctrl.claimIndexToProcess < ctrl.insurancePaymentClaims.length) {
        if (
          ctrl.claimIndexToProcess ===
          ctrl.insurancePaymentClaims.length - 1
        ) {
          $scope.isProcessingLastClaim = true;
        }
        ctrl.setupNextClaimForUI();
      } else {
        var status = 0;
        if ($scope.claimToProcess) {
          status = $scope.claimToProcess.Status;
        }

        if (status === 8 && !$scope.claimToProcess.RecreateClaim) {
          patientServices.ClaimChangeStatus.update(
            {
              claimId: $scope.claimToProcess.ClaimId,
              claimStatus: '7', // claimStatus 7 == "Closed"
            },
            function () {
              //ClaimChangeStatus.update Success
              deleteInsurancePaymentFactory
                .deleteInsurancePayment(
                  ctrl.currentPaymentTransaction,
                  ctrl.insurancePaymentClaims
                )
                .then(
                  ctrl.deleteInsurancePaymentSuccess,
                  ctrl.deleteInsurancePaymentFailure
                );
            },
            function () {
              //ClaimChangeStatus.update Failure
              toastrFactory.error(
                localize.getLocalizedString(
                  'Failed to reassign claim status to closed.'
                ),
                localize.getLocalizedString('Error')
              );
            }
          );
        } else {
          // determine if estimateInsuranceOption is applicable
          var estimateInsuranceOption = true;
          var plan = ctrl.patientBenefitPlans.find(
            plan => plan.BenefitPlanId === $scope.claimToProcess.BenefitPlanId
          );
          // patient may no longer have this plan in which case we don't need to call calculateEstimatedInsuranceOption
          if (plan) {
            var oldestServiceDate = $scope.claimToProcess.MinServiceDate;
            ctrl
              .calculateEstimatedInsuranceOption(plan, oldestServiceDate)
              .then(function (res) {
                estimateInsuranceOption = res;
                deleteInsurancePaymentFactory
                  .deleteInsurancePayment(
                    ctrl.currentPaymentTransaction,
                    ctrl.insurancePaymentClaims,
                    estimateInsuranceOption
                  )
                  .then(
                    ctrl.deleteInsurancePaymentSuccess,
                    ctrl.deleteInsurancePaymentFailure
                  );
              });
          } else {
            deleteInsurancePaymentFactory
              .deleteInsurancePayment(
                ctrl.currentPaymentTransaction,
                ctrl.insurancePaymentClaims
              )
              .then(
                ctrl.deleteInsurancePaymentSuccess,
                ctrl.deleteInsurancePaymentFailure
              );
          }
        }
      }
    };

    ctrl.calculateEstimatedInsuranceOption = function (
      plan,
      oldestServiceDate
    ) {
      let renewalMonth =
        plan.PolicyHolderBenefitPlanDto.BenefitPlanDto.RenewalMonth;
      let renewalMonthString = [
        'January',
        'February',
        'March',
        'April',
        'May',
        'June',
        'July',
        'August',
        'September',
        'October',
        'November',
        'December',
      ][renewalMonth - 1];
      let services = [];
      services.push({ DateEntered: oldestServiceDate });

      return new Promise(resolve => {
        if (
          closeClaimOptionsService.allowEstimateOption(renewalMonth, services)
        ) {
          var data = {
            estimateInsuranceOption: 'true',
            firstName: plan.PolicyHolderDetails.FirstName,
            lastName: plan.PolicyHolderDetails.LastName,
            renewalMonth: renewalMonthString,
          };
          $scope.confirmationRef = closeClaimOptionsService.open({ data });
          $scope.confirmationModalSubscription =
            $scope.confirmationRef.events.subscribe(events => {
              if (events && events.type) {
                switch (events.type) {
                  case 'confirm':
                    $scope.confirmationRef.close();
                    resolve(events.data.estimateInsuranceOption);
                    break;
                  case 'close':
                    $scope.confirmationRef.close();
                    break;
                }
              }
            });
        } else {
          resolve(true);
        }
      });
    };

    // processes claims: setting current processing claim in to scope variable to show it on ui
    ctrl.setupNextClaimForUI = function () {
      $scope.claimToProcess =
        ctrl.insurancePaymentClaims[ctrl.claimIndexToProcess];
      $scope.claimToProcess.ApplyInsurancePaymentBackToPatientBenefit = true;
      $scope.claimToProcess.PaidInsuranceEstimate =
        ctrl.getPaidInsuranceEstimate($scope.claimToProcess);
      ctrl.claimIndexToProcess++;
    };

    // returns insurance estimate paid for claim
    ctrl.getPaidInsuranceEstimate = function (claim) {
      var amount = 0;
      var currentTrans = ctrl.currentPaymentTransaction;
      var serviceTransactionToClaimPaymentDtos =
        claim.ServiceTransactionToClaimPaymentDtos;
      serviceTransactionToClaimPaymentDtos.forEach(function (transaction) {
        var creditTransactionDetails = listHelper.findItemByFieldValue(
          currentTrans.CreditTransactionDetails,
          'AppliedToServiceTransationId',
          transaction.ServiceTransactionId
        );
        if (creditTransactionDetails != null && creditTransactionDetails.Amount)
          amount += creditTransactionDetails.Amount * -1;
      });
      return $filter('currency')(amount);
    };

    ctrl.deleteInsurancePaymentSuccess = function (response) {
      toastrFactory.success(
        localize.getLocalizedString('Insurance payment deleted successfully'),
        localize.getLocalizedString('Success')
      );
      $location.path($scope.PreviousLocationRoute);
    };

    ctrl.deleteInsurancePaymentFailure = function (reason) {
      toastrFactory.error(
        localize.getLocalizedString('Failed to delete Insurance payment'),
        localize.getLocalizedString('Error')
      );
    };

    ctrl.getClaimsForServiceTransactionSuccess = function (res) {
      _.forEach(res.Value, function (item) {
        ctrl.allClaimsForTransactions.push(item);
      });
      ctrl.serviceTransactionIndex++;

      if (ctrl.serviceTransactionIndex === ctrl.serviceTransactionIds.length) {
        ctrl.setCanRecreate();
        ctrl.setCanApplyInsurancePaymentBackToPatientBenefit();
      }
    };

    ctrl.getClaimsForServiceTransactionFailure = function () {
      toastrFactory.error(
        localize.getLocalizedString('Failed to retrieve claim data'),
        localize.getLocalizedString('Error')
      );
    };

    ctrl.setCanRecreate = function () {
      // claims the payment to-be-deleted is tied to
      var currentClaimIds = _.map(
        ctrl.insurancePaymentClaims,
        function (claim) {
          return claim.ClaimId;
        }
      );
      // claims associated with these service transactions, but associated with the payment to-be-deleted and in an 'open' state
      var otherOpenClaims = _.filter(
        ctrl.allClaimsForTransactions,
        function (claim) {
          return (
            !currentClaimIds.includes(claim.ClaimId) &&
            claim.Status !== 8 &&
            claim.Status !== 7
          );
        }
      );
      if (!_.isEmpty(otherOpenClaims)) {
        $scope.canRecreate = false;
      }
    };

    // setCanApplyInsurancePaymentBackToPatientBenefit is used to determine if the 'Apply Insurance Payment Back to Patient Benefit' checkbox 
    // should be enabled, based on whether there are any service transactions that are older than the current benefit plan year.
    // plans with RenewalMonth = 0 are considered to be manually updated plans and the 'Apply Insurance Payment Back to Patient Benefit' checkbox should be enabled for those.
    ctrl.setCanApplyInsurancePaymentBackToPatientBenefit = function () {      
      $scope.canApplyInsurancePaymentBackToPatientBenefit = true; 
    
      _.forEach(ctrl.insurancePaymentClaims, function (claim) {
        var plan = ctrl.patientBenefitPlans.find(
          plan => plan.BenefitPlanId === claim.BenefitPlanId
        );
    
        if (plan) {
          var renewalMonth = plan.PolicyHolderBenefitPlanDto.BenefitPlanDto.RenewalMonth;
          var startDate;
    
          if (renewalMonth === 0) {
            // Practice manually updates plans, checkbox should remain enabled
            return;
          } else {
            // Calculate the start date for the current benefit plan year
            var currentDate = new Date();
            var currentYear = currentDate.getFullYear();
            var startDate = new Date(currentYear, renewalMonth - 1, 1);
    
            if (currentDate < startDate) {
              // If the current date is before the start of the benefit year, adjust to the previous year
              startDate = new Date(currentYear - 1, renewalMonth - 1, 1);
            }
          }
    
          // Check if any service date is before the start of the current benefit plan year and disable the checkbox if so
          _.forEach(claim.ServiceTransactionToClaimPaymentDtos, function (service) {
            var serviceDate = new Date(service.DateServiceCompleted);
            if (serviceDate < startDate) {
              $scope.canApplyInsurancePaymentBackToPatientBenefit = false;
              claim.ApplyInsurancePaymentBackToPatientBenefit = false;
            }
          });
        }
      });
    };

    // get all claims for each service transaction so we can determine if there are existing open claims // disable recreate if necessary
    ctrl.checkIfCanRecreate = function () {
      ctrl.serviceTransactionIds = [];
      // get all the service transaction id's
      _.forEach(ctrl.insurancePaymentClaims, function (claimPayment) {
        ctrl.serviceTransactionIds = _.concat(
          ctrl.serviceTransactionIds,
          _.map(
            claimPayment.ServiceTransactionToClaimPaymentDtos,
            'ServiceTransactionId'
          )
        );
      });
      ctrl.serviceTransactionIndex = 0;
      // get all claims for each service transaction id
      _.forEach(ctrl.serviceTransactionIds, function (id) {
        patientServices.Claim.getClaimsByServiceTransaction(
          { serviceTransactionId: id, ClaimType: 1 },
          ctrl.getClaimsForServiceTransactionSuccess,
          ctrl.getClaimsForServiceTransactionFailure
        );
      });
    };

    // #region breadcrum
    // create breadcrum menu based on previous page location
    ctrl.createBreadCrumb = function () {
      let patientPath = 'Patient/';
      var locationName = _.toLower($routeParams.PrevLocation);
      if (locationName === 'account summary') {
        $scope.PreviousLocationName = 'Account Summary';
        $scope.PreviousLocationRoute =
          patientPath +
          $routeParams.patientId +
          '/Summary/?tab=Account Summary';
      } else {
        $scope.PreviousLocationName = 'Transaction History';
        $scope.PreviousLocationRoute =
          patientPath +
          $routeParams.patientId +
          '/Summary/?tab=Transaction History';
      }
    };

    ctrl.createBreadCrumb();
    // #endregion

    //cancel insurance payment
    $scope.cancelModal = function (isCancel) {
      //showing modal alert if insurance payment amount field is dirty, otherwise simply redirect to previous page
      var message = localize.getLocalizedString(
        'Are you sure you want to discard - Delete insurance payment?'
      );
      var title = localize.getLocalizedString('Discard');
      var buttonYes = localize.getLocalizedString('Yes');
      var buttonNo = localize.getLocalizedString('No');
      if (isCancel == 1)
        modalFactory
          .ConfirmModal(title, message, buttonYes, buttonNo)
          .then(ctrl.GotoPreviousPage);
      else ctrl.GotoPreviousPage();
    };

    // back button function
    ctrl.GotoPreviousPage = function () {
      $location.path($scope.PreviousLocationRoute);
    };

    // creating request call setup to get initial data required to delete the insurance payment
    ctrl.pageDataCallSetup = function () {
      var promises = [
        patientServices.CreditTransactions.getCreditTransactionByIdForAccount({
          accountId: ctrl.accountId,
          creditTransactionId: ctrl.insurancePaymentId,
        }).$promise,
        patientServices.PatientBenefitPlan.get({ patientId: ctrl.patientId })
          .$promise,
        patientServices.Claim.getClaimsByInsuarncePaymentId({
          accountId: ctrl.accountId,
          insurancePaymentId: ctrl.insurancePaymentId,
        }).$promise,
      ];
      $q.all(promises).then(function (results) {
        ctrl.currentPaymentTransaction = results[0].Value;
        ctrl.patientBenefitPlans = results[1].Value;
        ctrl.originalInsurancePaymentClaims = results[2].Value;
        if (
          ctrl.currentPaymentTransaction === undefined ||
          ctrl.currentPaymentTransaction === null
        ) {
          toastrFactory.error(
            localize.getLocalizedString('Failed to retrieve payment data'),
            localize.getLocalizedString('Error')
          );
        }
        if (
          ctrl.patientBenefitPlans === undefined ||
          ctrl.patientBenefitPlans === null
        ) {
          toastrFactory.error(
            localize.getLocalizedString(
              'Failed to retrieve patient benefit plans'
            ),
            localize.getLocalizedString('Error')
          );
        }
        if (
          ctrl.originalInsurancePaymentClaims === undefined ||
          ctrl.originalInsurancePaymentClaims === null
        ) {
          toastrFactory.error(
            localize.getLocalizedString('Failed to retrieve claim data'),
            localize.getLocalizedString('Error')
          );
          return;
        }
        ctrl.insurancePaymentClaims = angular.copy(
          ctrl.originalInsurancePaymentClaims
        );
        ctrl.checkIfCanRecreate();
        $scope.showNextAndProcess();
      });
    };

    ctrl.init = function () {
      $scope.soarAuthActInsPmtDeleteKey = 'soar-acct-aipmt-delete';
      ctrl.accountId = $routeParams.accountId;
      ctrl.patientId = $routeParams.patientId;
      ctrl.insurancePaymentId = $routeParams.insurancePaymentId;
      ctrl.originalInsurancePaymentClaims = [];
      ctrl.insurancePaymentClaims = [];
      ctrl.allClaimsForTransactions = [];
      ctrl.currentPaymentTransaction = null;
      ctrl.patientBenefitPlans = [];
      ctrl.claimIndexToProcess = 0;
      ctrl.numServiceTransactions = 0;

      //Check if user has delete access to account payment or credit adjustment
      ctrl.hasDeleteAccessToCdtAdjOrActPmt =
        patSecurityService.IsAuthorizedByAbbreviation(
          $scope.soarAuthActInsPmtDeleteKey
        );
      ctrl.soarAuthDeleteAbbreviation = $scope.soarAuthActInsPmtDeleteKey;

      // getting initial page data
      modalFactory.LoadingModal(ctrl.pageDataCallSetup);
    };

    // initial page data
    ctrl.init();
  },
]);
