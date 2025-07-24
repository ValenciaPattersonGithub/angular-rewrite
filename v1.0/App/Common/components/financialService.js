'use strict';

var app = angular.module('Soar.Common');

app.service('FinancialService', [
  '$rootScope',
  'PatientServices',
  'SaveStates',
  'toastrFactory',
  'ListHelper',
  function (
    $rootScope,
    patientServices,
    saveStates,
    toastrFactory,
    listHelper
  ) {
    var financialService = {};

    // #region ServiceTransaction Calculations

    financialService.CalculateServiceTransactionAmount = function (
      serviceTransaction
    ) {
      if (serviceTransaction != null) {
        var fee = serviceTransaction.Fee != null ? serviceTransaction.Fee : 0;
        var tax = serviceTransaction.Tax != null ? serviceTransaction.Tax : 0;
        var discount =
          serviceTransaction.Discount != null ? serviceTransaction.Discount : 0;

        return fee - discount + tax;
      } else {
        return 0;
      }
    };

    financialService.CalculateServiceTransactionBalance = function (
      serviceTransaction
    ) {
      if (serviceTransaction != null) {
        var amount =
          financialService.CalculateServiceTransactionAmount(
            serviceTransaction
          );

        var estimtedInsurance =
          serviceTransaction.InsuranceEstimates != null &&
          isFinite(serviceTransaction.TotalEstInsurance)
            ? serviceTransaction.TotalEstInsurance
            : 0;
        var adjustedEstimate = 0;
        if (serviceTransaction.InsuranceEstimates) {
          adjustedEstimate = serviceTransaction.InsuranceEstimates.reduce(
            function (sum, est) {
              return sum + est['AdjEst'];
            },
            0
          );
        }

        return +(amount - estimtedInsurance - adjustedEstimate).toFixed(2);
      } else {
        return 0;
      }
    };

    // #endregion

    // #region CanSubmitToInsurance

    financialService.CanSubmitToInsurance = function (
      serviceTransactions,
      serviceCodes
    ) {
      var hasOneSubmittableService = false;

      if (
        serviceTransactions != null &&
        serviceCodes != null &&
        serviceCodes.length > 0
      ) {
        var serviceCode = null;

        for (
          var i = 0;
          !hasOneSubmittableService && i < serviceTransactions.length;
          i++
        ) {
          serviceCode = listHelper.findItemByFieldValue(
            serviceCodes,
            'ServiceCodeId',
            serviceTransactions[i].ServiceCodeId
          );

          hasOneSubmittableService =
            serviceCode != null && serviceCode.SubmitOnInsurance;
        }
      }

      return hasOneSubmittableService;
    };

    // #endregion

    // #region CanSubmitClaimsOnInsurance

    financialService.CanSubmitClaimsOnInsurance = function (
      encounters,
      patientBenefitPlans,
      benefitPlans
    ) {
      var canSubmit = false;

      var encounter, serviceTransaction, patientPlan, plan;

      var planIdsInUse = [];

      for (
        var encounterIndex = 0, encounterCount = encounters.length;
        encounterIndex < encounterCount && !canSubmit;
        encounterIndex++
      ) {
        encounter = encounters[encounterIndex];

        for (
          var serviceIndex = 0,
            serviceCount = encounter.ServiceTransactionDtos.length;
          serviceIndex < serviceCount && !canSubmit;
          serviceIndex++
        ) {
          serviceTransaction = encounter.ServiceTransactionDtos[serviceIndex];

          if (
            serviceTransaction.InsuranceEstimate != null &&
            serviceTransaction.InsuranceEstimate.PatientBenefitPlanId > '' &&
            planIdsInUse.indexOf(
              serviceTransaction.InsuranceEstimate.PatientBenefitPlanId
            ) < 0
          ) {
            planIdsInUse.push(
              serviceTransaction.InsuranceEstimate.PatientBenefitPlanId
            );
          }
        }
      }

      for (
        var planIndex = 0, plansUsedCount = planIdsInUse.length;
        planIndex < plansUsedCount && !canSubmit;
        planIndex++
      ) {
        patientPlan = listHelper.findItemByFieldValue(
          patientBenefitPlans,
          'PatientBenefitPlanId',
          planIdsInUse[planIndex]
        );

        plan =
          patientPlan != null
            ? listHelper.findItemByFieldValue(
                benefitPlans,
                'BenefitId',
                patientPlan.BenefitPlanId
              )
            : null;

        canSubmit = plan != null && plan.SubmitClaims;
      }

      return canSubmit;
    };

    // #endregion

    // #region ClearOverriddenEstiamtes

    financialService.ClearOverriddenEstiamtes = function (serviceTransactions) {
      angular.forEach(serviceTransactions, function (serviceTransaction) {
        if (
          serviceTransaction.InsuranceEstimate != null &&
          serviceTransaction.InsuranceEstimate.IsUserOverRidden
        ) {
          serviceTransaction.InsuranceEstimate.EstInsurance = 0;
          serviceTransaction.InsuranceEstimate.IndividualDeductibleUsed = 0;
          serviceTransaction.InsuranceEstimate.FamilyDeductibleUsed = 0;
          serviceTransaction.InsuranceEstimate.IsUserOverRidden = false;
          serviceTransaction.InsuranceEstimate.CalculationDescription = '';
        }
      });
    };

    // #endregion

    // #region Creating Insurance Estimate Objects

    // Use this when we know that we need a blank insurance estimate object.
    financialService.CreateInsuranceEstimateObject = function (
      serviceTransaction
    ) {
      if (serviceTransaction == null) {
        serviceTransaction = {
          AccountMemberId: null,
          ServiceTransactionId: null,
          ServiceCodeId: null,
          Fee: 0,
        };
      }

      return [
        {
          AccountMemberId: serviceTransaction.AccountMemberId,
          ServiceTransactionId: serviceTransaction.ServiceTransactionId,
          ServiceCodeId: serviceTransaction.ServiceCodeId,
          Fee: serviceTransaction.Fee,
          EstInsurance: 0,
          AdjEst: 0,
          IsUserOverRidden: false,
          IndividualDeductibleUsed: 0,
          FamilyDeductibleUsed: 0,
          CalculationDescription: '',
          ObjectState: saveStates.Add,
          FailedMessage: '',
        },
      ];
    };

    // Use this when we might have an existing insurance estimate object (updates), but we still want to ensure that one is exists if not.
    financialService.CreateOrCloneInsuranceEstimateObject = function (
      serviceTransaction
    ) {
      if (
        serviceTransaction != null &&
        serviceTransaction.InsuranceEstimates != null &&
        serviceTransaction.InsuranceEstimates.length > 0
      ) {
        return angular.copy(serviceTransaction.InsuranceEstimates);
      } else {
        return financialService.CreateInsuranceEstimateObject(
          serviceTransaction
        );
      }
    };

    // #endregion

    // #region RecalculateInsurance

    var recalculateInsuranceAndTaxSuccess = function (
      listOfListsOfServiceTransactions
    ) {
      return function (result) {
        var updatedListOfLists = result.Value;
        var updatedList = null;

        for (
          var listIndex = 0, listCount = updatedListOfLists.length;
          listIndex < listCount;
          listIndex++
        ) {
          updatedList = updatedListOfLists[listIndex];

          if (updatedList != null && updatedList.length > 0) {
            for (var i = 0, length = updatedList.length; i < length; i++) {
              if (
                updatedList[i].ObjectState != saveStates.Add &&
                !angular.equals(
                  listOfListsOfServiceTransactions[listIndex][i]
                    .InsuranceEstimates,
                  updatedList[i].InsuranceEstimates
                )
              ) {
                updatedList[i].ObjectState = saveStates.Update;
              }

              listOfListsOfServiceTransactions[listIndex][
                i
              ].InsuranceEstimates = updatedList[i].InsuranceEstimates;
              listOfListsOfServiceTransactions[listIndex][i].TotalEstInsurance =
                updatedList[i].TotalEstInsurance;
              listOfListsOfServiceTransactions[listIndex][i].TotalAdjEstimate =
                updatedList[i].TotalAdjEstimate;
              listOfListsOfServiceTransactions[listIndex][i].Balance =
                listOfListsOfServiceTransactions[listIndex][i].Amount -
                updatedList[i].TotalEstInsurance -
                updatedList[i].TotalAdjEstimate;
            }
          }
        }
        $rootScope.$broadcast('recalculationCompleted');
      };
    };

    var recalculateInsuranceAndTaxFailed = function (error) {
      toastrFactory.error(
        'An error occurred when trying to recalculate the insurance and tax amounts. Please try again.',
        'Error'
      );
    };

    var calculateInsurance = function (
      urlParams,
      listsOfListsOfEstimates,
      successFunction,
      recalculateInsuranceAndTaxFailed,
      personId
    ) {
      if (personId) {
        urlParams.personId = personId;
        return patientServices.ServiceTransactions.calculateInsuranceForTransactionsByPersonId(
          urlParams,
          listsOfListsOfEstimates,
          successFunction,
          recalculateInsuranceAndTaxFailed
        ).$promise;
      } else {
        //map to IServiceTransactionDto before post to remove dynamic content before processing
        var reducedlistOfListsOfEstimates = [];
        angular.forEach(listsOfListsOfEstimates, function (listOfEstimates) {
          var reducedListOfEstimates =
            financialService.mapToServiceTransactionEstimateDto(
              listOfEstimates
            );
          reducedlistOfListsOfEstimates.push(reducedListOfEstimates);
        });
        return patientServices.ServiceTransactions.calculateInsuranceForTransactions(
          urlParams,
          reducedlistOfListsOfEstimates,
          successFunction,
          recalculateInsuranceAndTaxFailed
        ).$promise;
      }
    };

    financialService.RecalculateInsurance = function (
      serviceTransactions,
      personId
    ) {
      var listsOfListsOfServiceTransactions = angular.isArray(
        serviceTransactions[0]
      )
        ? serviceTransactions
        : [serviceTransactions];
      var listsOfListsOfEstimates = [];
      var listofTransactions = null;

      angular.forEach(
        listsOfListsOfServiceTransactions,
        function (serviceTransactionList) {
          listofTransactions = [];

          angular.forEach(
            serviceTransactionList,
            function (serviceTransaction) {
              serviceTransaction.InsuranceEstimate = null;

              if (serviceTransaction.InsuranceEstimates != null) {
                angular.forEach(
                  serviceTransaction.InsuranceEstimates,
                  function (est) {
                    est.Fee = serviceTransaction.Fee;
                  }
                );
                if (serviceTransaction.applyDiscount !== undefined)
                  serviceTransaction.isDiscounted =
                    serviceTransaction.applyDiscount;
                listofTransactions.push(serviceTransaction);
              }
            }
          );

          listsOfListsOfEstimates.push(listofTransactions);
        }
      );

      var urlParams = {};

      var successFunction = recalculateInsuranceAndTaxSuccess(
        listsOfListsOfServiceTransactions
      );

      listsOfListsOfEstimates.uiSuppressModal = true;

      return calculateInsurance(
        urlParams,
        listsOfListsOfEstimates,
        successFunction,
        recalculateInsuranceAndTaxFailed,
        personId
      );
    };

    financialService.RecalculateInsuranceWithCascadingEstimates = function (
      serviceTransactions
    ) {
      var listsOfListsOfServiceTransactions = angular.isArray(
        serviceTransactions[0]
      )
        ? serviceTransactions
        : [serviceTransactions];
      var listsOfListsOfEstimates = [];
      var listOfEstimates = null;

      angular.forEach(
        listsOfListsOfServiceTransactions,
        function (serviceTransactionList) {
          listOfEstimates = [];

          angular.forEach(
            serviceTransactionList,
            function (serviceTransaction) {
              serviceTransaction.InsuranceEstimate = null;
              if (serviceTransaction.InsuranceEstimates != null) {
                angular.forEach(
                  serviceTransaction.InsuranceEstimates,
                  function (estimate) {
                    estimate.Fee = serviceTransaction.Fee;
                  }
                );
                if (serviceTransaction.applyDiscount !== undefined)
                  serviceTransaction.isDiscounted =
                    serviceTransaction.applyDiscount;

                listOfEstimates.push(serviceTransaction);
              }
            }
          );

          listsOfListsOfEstimates.push(listOfEstimates);
        }
      );

      var urlParams = { cascadeEstimates: true };

      var successFunction = recalculateInsuranceAndTaxSuccess(
        listsOfListsOfServiceTransactions
      );

      listsOfListsOfEstimates.uiSuppressModal = true;

      return calculateInsurance(
        urlParams,
        listsOfListsOfEstimates,
        successFunction,
        recalculateInsuranceAndTaxFailed
      );
    };

    // #endregion

    // #region Check for patient benefit plan

    var checkForPatientBenefitPlanSuccess = function (successResponse) {
      if (successResponse.Value && successResponse.Value.length > 0) {
        return {
          PatientBenefitPlanExists: true,
          PatientBenefitPlans: successResponse.Value,
        };
      } else {
        return false;
      }
    };

    var checkForPatientBenefitPlanFailure = function () {
      toastrFactory.error(
        'Failed check for patient benefit plan. Refresh the page to try again.',
        'Server Error'
      );
    };

    financialService.CheckForPatientBenefitPlan = function (patientId) {
      if (patientId) {
        // This should be returning a true/false value instead of the response object. Will refactor later.
        return patientServices.PatientBenefitPlan.get(
          {
            patientId: patientId,
          },
          checkForPatientBenefitPlanSuccess,
          checkForPatientBenefitPlanFailure
        ).$promise;
      } else {
        return false;
      }
    };

    // #endregion

    // #region Account and insurance balances

    // Calculate balances for account and insurance

    financialService.calculateAccountAndInsuranceBalances = function (
      accountBalances,
      selectedPatientId
    ) {
      var selectedMemberBalance = 0;
      var selectedMemberInsurance = 0;
      var selectedMemberAdjustedEstimate = 0;
      var allMembersInsurance = 0;
      var allMembersBalance = 0;
      var allMembersAdjustedEstimate = 0;
      var calculatedAccountBalances = {};

      if (accountBalances) {
        //get balance for all account members
        var moreThan30 = 0;
        var moreThan60 = 0;
        var moreThan90 = 0;
        var availableBalance = 0;

        var estimatedInsuranceMoreThan30 = 0;
        var estimatedInsuranceMoreThan60 = 0;
        var estimatedInsuranceMoreThan90 = 0;
        var estimatedInsurance = 0;

        var adjustedEstimateCurrent = 0;
        var adjustedEstimateMoreThan30 = 0;
        var adjustedEstimateMoreThan60 = 0;
        var adjustedEstimateMoreThan90 = 0;
        //added parseFloat(.toFixed) to hopefully fix a floating point error making values come up incorectly
        angular.forEach(accountBalances, function (accountMember) {
          moreThan30 += parseFloat(accountMember.Balance30.toFixed(2));
          moreThan60 += parseFloat(accountMember.Balance60.toFixed(2));
          moreThan90 += parseFloat(accountMember.Balance90.toFixed(2));
          availableBalance += parseFloat(
            accountMember.BalanceCurrent.toFixed(2)
          );

          estimatedInsuranceMoreThan30 += parseFloat(
            accountMember.EstimatedInsurance30.toFixed(2)
          );
          estimatedInsuranceMoreThan60 += parseFloat(
            accountMember.EstimatedInsurance60.toFixed(2)
          );
          estimatedInsuranceMoreThan90 += parseFloat(
            accountMember.EstimatedInsurance90.toFixed(2)
          );
          estimatedInsurance += parseFloat(
            accountMember.EstimatedInsuranceCurrent.toFixed(2)
          );

          adjustedEstimateCurrent += parseFloat(
            accountMember.AdjustedEstimateCurrent.toFixed(2)
          );
          adjustedEstimateMoreThan30 += parseFloat(
            accountMember.AdjustedEstimate30.toFixed(2)
          );
          adjustedEstimateMoreThan60 += parseFloat(
            accountMember.AdjustedEstimate60.toFixed(2)
          );
          adjustedEstimateMoreThan90 += parseFloat(
            accountMember.AdjustedEstimate90.toFixed(2)
          );
        });

        allMembersBalance =
          availableBalance + moreThan30 + moreThan60 + moreThan90;
        allMembersInsurance =
          estimatedInsurance +
          estimatedInsuranceMoreThan30 +
          estimatedInsuranceMoreThan60 +
          estimatedInsuranceMoreThan90;
        allMembersAdjustedEstimate =
          adjustedEstimateCurrent +
          adjustedEstimateMoreThan30 +
          adjustedEstimateMoreThan60 +
          adjustedEstimateMoreThan90;

        if (selectedPatientId && selectedPatientId != '0') {
          //get balance for selected account member
          var selectedPatientIds =
            Array === selectedPatientId.constructor
              ? selectedPatientId
              : [selectedPatientId];
          angular.forEach(selectedPatientIds, function (selectedPatientId) {
            var accountMemberBalance = listHelper.findItemByFieldValue(
              accountBalances,
              'AccountMemberId',
              selectedPatientId
            );
            if (!accountMemberBalance) {
              accountMemberBalance = listHelper.findItemByFieldValue(
                accountBalances,
                'PersonId',
                selectedPatientId
              );
            }
            if (accountMemberBalance) {
              selectedMemberBalance +=
                accountMemberBalance.BalanceCurrent +
                accountMemberBalance.Balance30 +
                accountMemberBalance.Balance60 +
                accountMemberBalance.Balance90;

              selectedMemberInsurance +=
                accountMemberBalance.EstimatedInsuranceCurrent +
                accountMemberBalance.EstimatedInsurance30 +
                accountMemberBalance.EstimatedInsurance60 +
                accountMemberBalance.EstimatedInsurance90;

              selectedMemberAdjustedEstimate +=
                accountMemberBalance.AdjustedEstimateCurrent +
                accountMemberBalance.AdjustedEstimate30 +
                accountMemberBalance.AdjustedEstimate60 +
                accountMemberBalance.AdjustedEstimate90;
            }
          });
        }

        calculatedAccountBalances = {
          MoreThan30Balance: moreThan30,
          MoreThan60Balance: moreThan60,
          MoreThan90Balance: moreThan90,
          CurrentBalance: availableBalance,
          EstInsMoreThan30Balance: estimatedInsuranceMoreThan30,
          EstInsMoreThan60Balance: estimatedInsuranceMoreThan60,
          EstInsMoreThan90Balance: estimatedInsuranceMoreThan90,
          EstInsCurrentBalance: estimatedInsurance,
          SelectedMemberBalance:
            selectedMemberBalance +
            selectedMemberInsurance +
            selectedMemberAdjustedEstimate,
          SelectedMemberInsurance: selectedMemberInsurance,
          SelectedMemberPatientPortion:
            selectedMemberBalance +
            selectedMemberInsurance -
            selectedMemberInsurance,
          SelectedMemberAdjustedEstimate: selectedMemberAdjustedEstimate,
          TotalBalance:
            allMembersBalance +
            allMembersInsurance +
            allMembersAdjustedEstimate,
          TotalInsurance: allMembersInsurance,
          TotalPatientPortion:
            allMembersBalance + allMembersInsurance - allMembersInsurance,
          TotalAdjustedEstimate: allMembersAdjustedEstimate,
        };
      }

      return calculatedAccountBalances;
    };

    // Calculate values for account aging graph
    financialService.CalculateAccountAgingGraphData = function (
      allAccountMembersBalance,
      selectedPatientId,
      modifier
    ) {
      var graphData = {};

      var moreThan30 = 0;
      var moreThan60 = 0;
      var moreThan90 = 0;
      var availableBalance = 0;
      var insurance = 0;
      var patientOnly = modifier && modifier == 'patient' ? true : false;
      var insuranceOnly = modifier && modifier == 'insurance' ? true : false;

      if (selectedPatientId && selectedPatientId != '0') {
        var accountMemberServerDto = listHelper.findItemByFieldValue(
          allAccountMembersBalance,
          'PersonId',
          selectedPatientId
        );

        if (accountMemberServerDto != null) {
          if (patientOnly) {
            moreThan30 = accountMemberServerDto.Balance30;
            moreThan60 = accountMemberServerDto.Balance60;
            moreThan90 = accountMemberServerDto.Balance90;
            availableBalance = accountMemberServerDto.BalanceCurrent;
          } else if (insuranceOnly) {
            moreThan30 =
              accountMemberServerDto.EstimatedInsurance30 +
              accountMemberServerDto.AdjustedEstimate30;
            moreThan60 =
              accountMemberServerDto.EstimatedInsurance60 +
              accountMemberServerDto.AdjustedEstimate60;
            moreThan90 =
              accountMemberServerDto.EstimatedInsurance90 +
              accountMemberServerDto.AdjustedEstimate90;
            insurance =
              accountMemberServerDto.EstimatedInsuranceCurrent +
              accountMemberServerDto.AdjustedEstimateCurrent;
          } else {
            moreThan30 =
              accountMemberServerDto.Balance30 +
              accountMemberServerDto.EstimatedInsurance30 +
              accountMemberServerDto.AdjustedEstimate30;
            moreThan60 =
              accountMemberServerDto.Balance60 +
              accountMemberServerDto.EstimatedInsurance60 +
              accountMemberServerDto.AdjustedEstimate60;
            moreThan90 =
              accountMemberServerDto.Balance90 +
              accountMemberServerDto.EstimatedInsurance90 +
              accountMemberServerDto.AdjustedEstimate90;
            availableBalance =
              accountMemberServerDto.BalanceCurrent +
              accountMemberServerDto.EstimatedInsuranceCurrent +
              accountMemberServerDto.AdjustedEstimateCurrent;
          }
        }
      } else {
        angular.forEach(allAccountMembersBalance, function (accountMember) {
          if (insuranceOnly) {
            moreThan30 +=
              accountMember.EstimatedInsurance30 +
              accountMember.AdjustedEstimate30;
            moreThan60 +=
              accountMember.EstimatedInsurance60 +
              accountMember.AdjustedEstimate60;
            moreThan90 +=
              accountMember.EstimatedInsurance90 +
              accountMember.AdjustedEstimate90;
            insurance +=
              accountMember.EstimatedInsuranceCurrent +
              accountMember.AdjustedEstimateCurrent;
          } else if (patientOnly) {
            moreThan30 += accountMember.Balance30;
            moreThan60 += accountMember.Balance60;
            moreThan90 += accountMember.Balance90;
            availableBalance += accountMember.BalanceCurrent;
          } else {
            moreThan30 +=
              accountMember.Balance30 +
              accountMember.EstimatedInsurance30 +
              accountMember.AdjustedEstimate30;
            moreThan60 +=
              accountMember.Balance60 +
              accountMember.EstimatedInsurance60 +
              accountMember.AdjustedEstimate60;
            moreThan90 +=
              accountMember.Balance90 +
              accountMember.EstimatedInsurance90 +
              accountMember.AdjustedEstimate90;
            availableBalance +=
              accountMember.BalanceCurrent +
              accountMember.EstimatedInsuranceCurrent +
              accountMember.AdjustedEstimateCurrent;
          }
        });
      }

      moreThan30 = Number(moreThan30.toFixed(2));
      moreThan60 = Number(moreThan60.toFixed(2));
      moreThan90 = Number(moreThan90.toFixed(2));

      availableBalance = Number(availableBalance.toFixed(2));
      insurance = Number(insurance.toFixed(2));

      graphData = {
        moreThanThirtyBalance: moreThan30,
        moreThanSixtyBalance: moreThan60,
        moreThanNintyBalance: moreThan90,
        currentBalance: insuranceOnly ? insurance : availableBalance,
        chartHeight: 120,
      };

      return graphData;
    };

    financialService.mapToServiceTransactionEstimateDto = function (
      serviceTransactionDtos
    ) {
      var serviceTransactionEstimateDtoKeys = _.keys(
        new ServiceTransactionEstimateDto()
      );
      var insuranceEstimateDtoKeys = _.keys(new InsuranceEstimateDto());
      var reducedDtos = serviceTransactionDtos.map(st => {
        var reduced = new ServiceTransactionEstimateDto();
        _.assign(reduced, _.pick(st, serviceTransactionEstimateDtoKeys));
        if (reduced.InsuranceEstimates.length > 0) {
          reduced.InsuranceEstimates = reduced.InsuranceEstimates.map(est => {
            var reducedEstimate = new InsuranceEstimateDto();
            _.assign(reducedEstimate, _.pick(est, insuranceEstimateDtoKeys));
            return reducedEstimate;
          });
        }
        return reduced;
      });
      return reducedDtos;
    };

    var ServiceTransactionEstimateDto = function () {
      var self = this;
      self.AccountMemberId = undefined;
      self.Amount = 0;
      self.AppointmentId = null;
      self.RelatedRecordId = null;
      self.DateCompleted = undefined;
      self.DateEntered = undefined;
      self.Description = '';
      self.Discount = 0;
      self.EncounterId = null;
      self.EnteredByUserId = undefined;
      self.Fee = 0;
      self.PriorFee = null;
      self.LocationId = null;
      self.Note = '';
      self.ProviderUserId = null;
      self.RejectedReason = '';
      self.ServiceCodeId = undefined;
      self.ServiceTransactionId = undefined;
      self.ServiceTransactionStatusId = 0;
      self.Surface = '';
      self.SurfaceSummaryInfo = '';
      self.Roots = '';
      self.RootSummaryInfo = '';
      self.Tax = 0;
      self.Tooth = '';
      self.TransactionTypeId = undefined;
      self.ObjectState = '';
      self.FailedMessage = '';
      self.Balance = 0;
      self.AgingDate = undefined;
      self.ProposedAtLocationId = null;
      self.InsuranceEstimates = InsuranceEstimateDto;
      self.TotalEstInsurance = 0;
      self.TotalInsurancePaidAmount = 0;
      self.TotalAdjEstimate = 0;
      self.TotalAdjPaidAmount = 0;
      self.TotalUnpaidBalance = 0;
      self.CreatedDate = undefined;
      self.IsDeleted = false;
      self.IsBalanceAlreadyUpdated = null;
      self.IsForClosingClaim = null;
      self.PredeterminationHasResponse = null;
      self.IsDiscounted = false;
      self.ProviderOnClaimsId = undefined;
      self.IsOnInformedConsent = false;
      self.InsuranceOrder = null;
      self.MasterDiscountTypeId = null;
      self.OldServiceTransactionId = null;
      self.AgingCategoryId = undefined;
      self.BypassSnapshotQueue = false;
      self.OnClaimBeingClosed = false;
      self.ProposedProviderId = null;
      self.DataTag = '';
      self.DateModified = undefined;
      self.UserModified = undefined;
    };

    var InsuranceEstimateDto = function () {
      var self = this;
      self.EstimatedInsuranceId = undefined;
      self.AccountMemberId = undefined;
      self.EncounterId = undefined;
      self.ServiceTransactionId = undefined;
      self.ServiceCodeId = undefined;
      self.PatientBenefitPlanId = undefined;
      self.Fee = 0;
      self.EstInsurance = 0;
      self.IsUserOverRidden = false;
      self.FamilyDeductibleUsed = 0;
      self.IndividualDeductibleUsed = 0;
      self.CalculationDescription = '';
      self.CalcWithoutClaim = false;
      self.PaidAmount = 0;
      self.ObjectState = '';
      self.FailedMessage = '';
      self.AdjEst = 0;
      self.AdjPaid = 0;
      self.AreBenefitsApplied = false;
      self.IsMostRecentOverride = false;
      self.AllowedAmountOverride = null;
      self.AllowedAmount = null;
      self.DataTag = '';
      self.DateModified = undefined;
      self.UserModified = undefined;
    };
    // #endregion

    return financialService;
  },
]);
