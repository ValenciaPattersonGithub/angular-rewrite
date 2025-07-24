'use strict';

// Define Filters
angular
  .module('Soar.Patient')
  .filter('totalFilter', function () {
    // filter to calculate encounter's total fee/charge
    return function (values, prop) {
      if (angular.isUndefined(prop)) {
        prop = 'Fee';
      }
      var total = 0;
      angular.forEach(values, function (value) {
        if (angular.isDefined(value[prop]) && value[prop] !== '') {
          if (!value['IsDeleted']) total = parseFloat(total + value[prop]);
        }
      });
      return total.toFixed(2);
    };
  })
  .filter('totalOfValidServiceTransactionFilter', function () {
    // filter to calculate encounter's total fee/charge excluding the services that are deleted
    return function (values, prop) {
      if (angular.isUndefined(prop)) {
        prop = 'Fee';
      }
      var total = 0;
      var serviceTransactionAmount = 0;
      angular.forEach(values, function (value) {
        if (
          angular.isDefined(value[prop]) &&
          angular.isDefined(value['ObjectState']) &&
          value['ObjectState'] !== 'Delete'
        ) {
          if (!value[prop]) serviceTransactionAmount = 0;
          else {
            serviceTransactionAmount = value[prop];
          }
          total = total + serviceTransactionAmount;
        }
      });
      return total;
    };
  })
  .filter('totalAmountOfValidServiceTransactionFilter', function () {
    // filter to calculate encounter's total fee/charge excluding the services that are deleted
    return function (serviceTransactions) {
      var total = 0;
      var serviceTransactionAmount = 0;
      var fee = 0;
      var tax = 0;
      var discount = 0;
      var estIns = 0;
      angular.forEach(serviceTransactions, function (value) {
        if (
          angular.isDefined(value['ObjectState']) &&
          value['ObjectState'] !== 'Delete'
        ) {
          serviceTransactionAmount = 0;
          fee = value['Fee'] ? value['Fee'] : 0;
          tax = value['Tax'] ? value['Tax'] : 0;
          discount = value['Discount'] ? value['Discount'] : 0;
          estIns = value['EstimatedInsurance']
            ? value['EstimatedInsurance']
            : 0;

          serviceTransactionAmount = fee + -discount + tax - estIns;
          total = total + serviceTransactionAmount;
        }
      });
      return total;
    };
  })
  .filter('totalOfPlannedServicesFilter', function () {
    // filter to calculate total fee/charge for services on the appointment
    return function (values, prop) {
      if (angular.isUndefined(prop)) {
        prop = 'Fee';
      }
      var total = 0;
      var plannedServiceAmount = 0;

      angular.forEach(values, function (value) {
        angular.forEach(value.PlannedServices, function (plannedService) {
          if (angular.isDefined(plannedService[prop])) {
            if (!plannedService[prop]) plannedServiceAmount = 0;
            else {
              plannedServiceAmount = plannedService[prop];
            }
            total = total + plannedServiceAmount;
          }
        });
      });

      return total;
    };
  })
  .filter('totalPatientPortionFilter', function () {
    // filter to calculate total patientportion
    return function (serviceTransactionDtos) {
      var totalPatientPortion = 0;
      var estIns = 0;
      var adjEst = 0;

      _.forEach(serviceTransactionDtos, function (serviceTransaction) {
        totalPatientPortion += serviceTransaction.Amount;

        if (
          !_.isUndefined(serviceTransaction['ObjectState']) &&
          !_.isEqual(serviceTransaction['ObjectState'], 'Delete')
        ) {
          _.forEach(
            serviceTransaction.InsuranceEstimates,
            function (insuranceEstimate) {
              estIns = insuranceEstimate.EstInsurance;
              adjEst = insuranceEstimate.AdjEst;
              totalPatientPortion -= estIns + adjEst;
            }
          );
        }
      });

      return parseFloat(totalPatientPortion.toFixed(2));
    };
  })
  .filter('totalBalanceForCreditPaymentFilter', function () {
    // filter to calculate total balance
    return function (serviceTransactionDtos) {
      var totalBalance = 0;
      angular.forEach(serviceTransactionDtos, function (serviceTransaction) {
        totalBalance += serviceTransaction.Balance;
      });
      return totalBalance;
    };
  })
  .filter('encounterAmountFilter', function () {
    // filter to recalculate encounter's charge on adding/removing services from it.
    return function (values, prop) {
      if (angular.isUndefined(prop)) {
        prop = 'Amount';
      }
      var total = 0;
      angular.forEach(values.ServiceTransactionDtos, function (value) {
        if (angular.isDefined(value[prop])) {
          if (!value['IsDeleted']) total = parseFloat(total + value[prop]);
        }
      });
      return total.toFixed(2);
    };
  })
  .filter('encounterTaxFilter', function () {
    // filter to recalculate encounter's charge on adding/removing services from it.
    return function (serviceTransactionDtos, prop) {
      if (angular.isUndefined(prop)) {
        prop = 'Tax';
      }
      var total = 0;
      var tax = 0;
      angular.forEach(serviceTransactionDtos, function (value) {
        if (
          angular.isDefined(value['ObjectState']) &&
          value['ObjectState'] !== 'Delete'
        ) {
          tax = value[prop] ? value[prop] : 0;
          total = total + tax;
        }
      });
      return total;
    };
  })
  .filter('encounterDiscountFilter', function () {
    // filter to recalculate encounter's charge on adding/removing services from it.
    return function (serviceTransactionDtos, prop) {
      if (angular.isUndefined(prop)) {
        prop = 'Discount';
      }
      var total = 0;
      var discount = 0;
      angular.forEach(serviceTransactionDtos, function (value) {
        if (
          angular.isDefined(value['ObjectState']) &&
          value['ObjectState'] !== 'Delete'
        ) {
          discount = value[prop] ? value[prop] : 0;
          total = total + discount;
        }
      });
      return total;
    };
  })
  .filter('encounterTotalInsuranceFilter', function () {
    // filter to recalculate encounter's charge on adding/removing services from it.
    return function (serviceTransactionDtos) {
      var totalIns = 0;

      _.forEach(serviceTransactionDtos, function (serviceTransaction) {
        if (
          !_.isUndefined(serviceTransaction['ObjectState']) &&
          !_.isEqual(serviceTransaction['ObjectState'], 'Delete')
        ) {
          _.forEach(
            serviceTransaction.InsuranceEstimates,
            function (insuranceEstimate) {
              totalIns += insuranceEstimate.EstInsurance
                ? insuranceEstimate.EstInsurance
                : 0;
              totalIns += insuranceEstimate.AdjEst
                ? insuranceEstimate.AdjEst
                : 0;
              totalIns -= insuranceEstimate.PaidAmount
                ? insuranceEstimate.PaidAmount
                : 0;
            }
          );
        }
      });

      return parseFloat(totalIns.toFixed(2));
    };
  })
  .filter('encounterEstimatedInsuranceFilter', function () {
    // filter to recalculate encounter's charge on adding/removing services from it.
    return function (serviceTransactionDtos, prop) {
      if (angular.isUndefined(prop)) {
        prop = 'EstInsurance';
      }
      var estIns = 0;
      angular.forEach(serviceTransactionDtos, function (serviceTransaction) {
        if (
          angular.isDefined(serviceTransaction['ObjectState']) &&
          serviceTransaction['ObjectState'] !== 'Delete'
        ) {
          estIns +=
            serviceTransaction.InsuranceEstimates &&
            serviceTransaction.InsuranceEstimates[0] &&
            serviceTransaction.InsuranceEstimates[0][prop]
              ? serviceTransaction.InsuranceEstimates[0][prop] -
                serviceTransaction.InsuranceEstimates[0]['PaidAmount']
              : 0;
        }
      });
      return estIns;
    };
  })
  .filter('encounterBalanceEstimatedInsuranceFilter', function () {
    // filter to recalculate encounter's insurance estimate balance
    return function (serviceTransactionDtos) {
      var total = 0;
      angular.forEach(serviceTransactionDtos, function (serviceTransaction) {
        if (
          angular.isDefined(serviceTransaction['ObjectState']) &&
          serviceTransaction['ObjectState'] !== 'Delete' &&
          serviceTransaction.InsuranceEstimates
        ) {
          angular.forEach(
            serviceTransaction.InsuranceEstimates,
            function (estimate) {
              //if paid more than estimate there is no estimate left for this insurance, otherwise estimate minus paid amount for remaining estimate
              total +=
                estimate.EstInsurance - estimate.PaidAmount < 0
                  ? 0
                  : estimate.EstInsurance - estimate.PaidAmount;
            }
          );
        }
      });
      return total;
    };
  })
  .filter('totalRemainingEstimateForServiceTransaction', function () {
    // filter to recalculate encounter's insurance estimate balance
    return function (serviceTransactionDto) {
      var total = 0;
      if (
        angular.isDefined(serviceTransactionDto['ObjectState']) &&
        serviceTransactionDto['ObjectState'] !== 'Delete' &&
        serviceTransactionDto.InsuranceEstimates
      ) {
        angular.forEach(
          serviceTransactionDto.InsuranceEstimates,
          function (estimate) {
            //if paid more than estimate there is no estimate left for this insurance, otherwise estimate minus paid amount for remaining estimate
            total +=
              estimate.EstInsurance - estimate.PaidAmount < 0
                ? 0
                : estimate.EstInsurance - estimate.PaidAmount;
          }
        );
      }
      return total;
    };
  })
  .filter('encounterTotalAmountFilter', function () {
    // filter to recalculate encounter's total amount on adding/removing services from it.
    return function (serviceTransactionDtos, prop) {
      if (_.isUndefined(prop)) {
        prop = 'Amount';
      }

      var total = 0;
      var amount = 0;

      _.forEach(serviceTransactionDtos, function (serviceTransaction) {
        if (
          !_.isUndefined(serviceTransaction['ObjectState']) &&
          !_.isEqual(serviceTransaction['ObjectState'], 'Delete')
        ) {
          amount = serviceTransaction[prop] ? serviceTransaction[prop] : 0;
          total = total + amount;
        }
      });

      return parseFloat(total.toFixed(2));
    };
  })
  .filter('encounterAdjEstFilter', function () {
    return function (serviceTransactionDtos, prop) {
      if (angular.isUndefined(prop)) {
        prop = 'AdjEst';
      }
      var total = 0;
      var amount = 0;
      angular.forEach(serviceTransactionDtos, function (value) {
        if (
          angular.isDefined(value['ObjectState']) &&
          value['ObjectState'] !== 'Delete'
        ) {
          angular.forEach(value.InsuranceEstimates, function (estimate) {
            amount = estimate[prop] ? estimate[prop] : 0;
            total = total + amount;
          });
        }
      });
      return total;
    };
  })

  .filter('serviceAdjEstFilter', function () {
    return function (serviceTransactionDto) {
      var total = 0;
      if (
        !serviceTransactionDto.InsuranceEstimates ||
        serviceTransactionDto.InsuranceEstimates.length === 0
      ) {
        return total;
      }
      angular.forEach(
        serviceTransactionDto.InsuranceEstimates,
        function (estimate) {
          total += estimate['AdjEst'] ? estimate['AdjEst'] : 0;
        }
      );
      return total;
    };
  })

  .filter('encounterBalanceFilter', function () {
    // filter to recalculate encounter's charge on adding/removing services from it.
    return function (values, prop) {
      if (angular.isUndefined(prop)) {
        prop = 'Balance';
      }
      var total = 0;
      angular.forEach(values.ServiceTransactionDtos, function (value) {
        if (angular.isDefined(value[prop])) {
          if (!value['IsDeleted']) total = total + value[prop];
        }
      });
      return total;
    };
  })
  .filter('totalEncounterAmountFilter', function () {
    // filter to recalculate encounter's charge on adding/removing services from it.
    return function (values, prop) {
      if (angular.isUndefined(prop)) {
        prop = 'Amount';
      }
      var total = 0;
      angular.forEach(values, function (encounter) {
        angular.forEach(
          encounter.ServiceTransactionDtos,
          function (serviceTransaction) {
            if (angular.isDefined(serviceTransaction[prop])) {
              total = total + serviceTransaction[prop];
            }
          }
        );
      });
      return total;
    };
  })
  .filter('totalEncounterEstimateAmountFilter', function () {
    // filter to recalculate encounter's charge on adding/removing services from it.
    return function (values, prop) {
      if (angular.isUndefined(prop)) {
        prop = 'EstInsurance';
      }
      var total = 0;
      angular.forEach(values, function (encounter) {
        angular.forEach(
          encounter.ServiceTransactionDtos,
          function (serviceTransaction) {
            if (
              serviceTransaction != null &&
              serviceTransaction.InsuranceEstimates
            ) {
              angular.forEach(
                serviceTransaction.InsuranceEstimates,
                function (estimate) {
                  if (angular.isDefined(estimate[prop])) {
                    total = total + (estimate[prop] == '' ? 0 : estimate[prop]);
                  }
                }
              );
            }
          }
        );
      });
      return total;
    };
  })
  .filter('getPositiveAdjustmentTypes', function () {
    // filter to get positive/negative adjustment types depending on isPositive param.
    return function (adjustmentTypes, isPositive) {
      if (angular.isUndefined(isPositive)) {
        isPositive = true;
      }

      adjustmentTypes = adjustmentTypes.filter(function (adjustmentType) {
        return adjustmentType.IsPositive === isPositive;
      });
      return adjustmentTypes;
    };
  })
  .filter('getCreditTransactionsByAccountMemberFilter', function () {
    // filter to get a collection of objects for an account member.
    return function (listHelper, creditTransactions, accountMemberId) {
      var result = [];
      if (accountMemberId == 0) {
        angular.forEach(creditTransactions, function (creditTransaction) {
          angular.forEach(
            creditTransaction.CreditTransactionDetails,
            function (creditTransactionDetail) {
              result.push(creditTransactionDetail);
            }
          );
        });
        return result;
      }

      angular.forEach(creditTransactions, function (creditTransaction) {
        angular.forEach(
          creditTransaction.CreditTransactionDetails,
          function (creditTransactionDetail) {
            if (creditTransactionDetail.AccountMemberId == accountMemberId)
              result.push(creditTransactionDetail);
          }
        );
      });
      return result;
    };
  })
  .filter('getScheduledAppointmentFilter', function () {
    // filter to get a collection of objects for an account member.
    return function (appointments) {
      var result = [];

      angular.forEach(appointments, function (appointment) {
        if (appointment.ApptDate != '') result.push(appointment);
      });
      return result;
    };
  })
  .filter('getUnScheduledAppointmentFilter', function () {
    // filter to get a collection of objects for an account member.
    return function (appointments) {
      var result = [];

      angular.forEach(appointments, function (appointment) {
        if (appointment.ApptDate == '') result.push(appointment);
      });
      return result;
    };
  })
  .filter('totalUnassignedAmountFilter', function () {
    // filter to calculate unassigned amount for the adjustment
    return function (adjustmentObject, serviceList) {
      var totalAdjustmentAmount;
      var serviceAmountTotal = 0.0;
      var adjustmentAmount;
      if (angular.isUndefined(adjustmentObject.Amount)) {
        totalAdjustmentAmount = 0.0;
      } else {
        totalAdjustmentAmount = adjustmentObject.Amount;
      }

      angular.forEach(serviceList, function (service) {
        adjustmentAmount = service.AdjustmentAmount
          ? service.AdjustmentAmount
          : 0;
        serviceAmountTotal = serviceAmountTotal + adjustmentAmount;
      });

      return (totalAdjustmentAmount - serviceAmountTotal).toFixed(2);
    };
  })
  .filter('sumofCreditDetailAdjEst', function () {
    return function (creditTransactionDetails) {
      return parseFloat(
        _.reduce(
          creditTransactionDetails,
          function (sum, item) {
            return sum + item.Amount;
          },
          0
        )
      ).toFixed(2);
    };
  })
  .filter('getUnassignedCreditTransactionDetailAmountFilter', function () {
    // filter to get unassigned payment for encounter filter
    return function (creditTransactionDetails, accountMemberId) {
      var unassignedAmount = 0;
      if (accountMemberId) {
        _.forEach(creditTransactionDetails, function (creditTransactionDetail) {
          if (
            !creditTransactionDetail.IsDeleted &&
            creditTransactionDetail.AccountMemberId == accountMemberId &&
            _.isEmpty(creditTransactionDetail.AppliedToServiceTransationId) &&
            _.isEmpty(creditTransactionDetail.AppliedToDebitTransactionId)
          )
            unassignedAmount += creditTransactionDetail.Amount;
        });
      } else {
        _.forEach(creditTransactionDetails, function (creditTransactionDetail) {
          if (
            !creditTransactionDetail.IsDeleted &&
            _.isEmpty(creditTransactionDetail.AppliedToServiceTransationId) &&
            _.isEmpty(creditTransactionDetail.AppliedToDebitTransactionId)
          )
            unassignedAmount += creditTransactionDetail.Amount;
        });
      }

      return parseFloat(unassignedAmount.toFixed(2));
    };
  })
  .filter('getTotalUnappliedAmountFromCreditTransactionsFilter', function () {
    // filter to get total of unapplied amount from all credit-transactions
    return function (creditTransactions, selectedAccountMemberId) {
      var unappliedAmount = 0;
      if (selectedAccountMemberId) {
        angular.forEach(creditTransactions, function (creditTransaction) {
          angular.forEach(
            creditTransaction.CreditTransactionDetails,
            function (creditTransactionDetail) {
              if (
                creditTransactionDetail.AccountMemberId ==
                  selectedAccountMemberId &&
                !(
                  creditTransactionDetail.AppliedToServiceTransationId !=
                    undefined &&
                  creditTransactionDetail.AppliedToServiceTransationId !=
                    null &&
                  creditTransactionDetail.AppliedToServiceTransationId !== ''
                ) &&
                !(
                  creditTransactionDetail.AppliedToDebitTransactionId !=
                    undefined &&
                  creditTransactionDetail.AppliedToDebitTransactionId != null &&
                  creditTransactionDetail.AppliedToDebitTransactionId !== ''
                )
              )
                unappliedAmount += -creditTransactionDetail.Amount;
            }
          );
        });
      } else {
        angular.forEach(creditTransactions, function (creditTransaction) {
          angular.forEach(
            creditTransaction.CreditTransactionDetails,
            function (creditTransactionDetail) {
              if (
                !(
                  creditTransactionDetail.AppliedToServiceTransationId !=
                    null &&
                  creditTransactionDetail.AppliedToServiceTransationId !=
                    undefined &&
                  creditTransactionDetail.AppliedToServiceTransationId !== ''
                ) &&
                !(
                  creditTransactionDetail.AppliedToDebitTransactionId != null &&
                  creditTransactionDetail.AppliedToDebitTransactionId !=
                    undefined &&
                  creditTransactionDetail.AppliedToDebitTransactionId !== ''
                )
              )
                unappliedAmount += -creditTransactionDetail.Amount;
            }
          );
        });
      }

      return unappliedAmount;
    };
  })
  .filter(
    'getTotalUnappliedAmountFromCreditTransactionsForSelectedMembersFilter',
    function () {
      // filter to get total of unapplied amount from all credit-transactions
      return function (creditTransactions, accountMemberIds) {
        var unappliedAmount = 0;
        var existingCreditTransactionDetails = [];
        if (accountMemberIds && accountMemberIds.length) {
          angular.forEach(creditTransactions, function (creditTransaction) {
            angular.forEach(
              creditTransaction.CreditTransactionDetails,
              function (creditTransactionDetail) {
                angular.forEach(
                  accountMemberIds,
                  function (selectedAccountMemberId) {
                    if (
                      creditTransactionDetail.AccountMemberId ==
                        selectedAccountMemberId &&
                      !(
                        creditTransactionDetail.AppliedToServiceTransationId !=
                          undefined &&
                        creditTransactionDetail.AppliedToServiceTransationId !=
                          null &&
                        creditTransactionDetail.AppliedToServiceTransationId !==
                          ''
                      ) &&
                      !(
                        creditTransactionDetail.AppliedToDebitTransactionId !=
                          undefined &&
                        creditTransactionDetail.AppliedToDebitTransactionId !=
                          null &&
                        creditTransactionDetail.AppliedToDebitTransactionId !==
                          ''
                      )
                    ) {
                      unappliedAmount += -creditTransactionDetail.Amount;
                    }
                  }
                );
              }
            );
          });
        } else {
          angular.forEach(creditTransactions, function (creditTransaction) {
            angular.forEach(
              creditTransaction.CreditTransactionDetails,
              function (creditTransactionDetail) {
                if (
                  !(
                    creditTransactionDetail.AppliedToServiceTransationId !=
                      null &&
                    creditTransactionDetail.AppliedToServiceTransationId !=
                      undefined &&
                    creditTransactionDetail.AppliedToServiceTransationId !== ''
                  ) &&
                  !(
                    creditTransactionDetail.AppliedToDebitTransactionId !=
                      null &&
                    creditTransactionDetail.AppliedToDebitTransactionId !=
                      undefined &&
                    creditTransactionDetail.AppliedToDebitTransactionId !== ''
                  )
                )
                  unappliedAmount += -creditTransactionDetail.Amount;
              }
            );
          });
        }
        return unappliedAmount;
      };
    }
  )
  .filter('getCreditTransactionsForEncounterFilter', function () {
    return function (creditTransactions, encounterId) {
      var resultCreditTrans = [];
      angular.forEach(creditTransactions, function (creditTransaction) {
        var resultCreditTransDetail = [];
        angular.forEach(
          creditTransaction.CreditTransactionDetails,
          function (creditTransactionDetail) {
            if (creditTransactionDetail.EncounterId === encounterId)
              resultCreditTransDetail.push(
                angular.copy(creditTransactionDetail)
              );
          }
        );
        if (resultCreditTransDetail.length > 0) {
          var creditTransTemp = angular.copy(creditTransaction);
          creditTransTemp.CreditTransactionDetails = resultCreditTransDetail;
          resultCreditTrans.push(creditTransTemp);
        }
      });

      return resultCreditTrans;
    };
  })
  .filter('getCreditTransactionsForDebitTransactionFilter', function () {
    return function (creditTransactions, debitTransactionId) {
      var resultCreditTrans = [];
      angular.forEach(creditTransactions, function (creditTransaction) {
        var resultCreditTransDetail = [];
        angular.forEach(
          creditTransaction.CreditTransactionDetails,
          function (creditTransactionDetail) {
            if (
              creditTransactionDetail.AppliedToDebitTransactionId ===
              debitTransactionId
            )
              resultCreditTransDetail.push(
                angular.copy(creditTransactionDetail)
              );
          }
        );
        if (resultCreditTransDetail.length > 0) {
          var creditTransTemp = angular.copy(creditTransaction);
          creditTransTemp.CreditTransactionDetails = resultCreditTransDetail;
          resultCreditTrans.push(creditTransTemp);
        }
      });

      return resultCreditTrans;
    };
  })
  .filter('getUnassignedCreditTransactionsFilter', function () {
    return function (creditTransactions, accountMemberId) {
      var resultCreditTrans = [];
      angular.forEach(creditTransactions, function (creditTransaction) {
        var resultCreditTransDetail = [];
        if (accountMemberId) {
          angular.forEach(
            creditTransaction.CreditTransactionDetails,
            function (creditTransactionDetail) {
              if (
                (!creditTransactionDetail.EncounterId ||
                  creditTransactionDetail.EncounterId ===
                    '00000000-0000-0000-0000-000000000000') &&
                (!creditTransactionDetail.AppliedToDebitTransactionId ||
                  creditTransactionDetail.AppliedToDebitTransactionId ===
                    '00000000-0000-0000-0000-000000000000') &&
                (!creditTransactionDetail.AppliedToServiceTransationId ||
                  creditTransactionDetail.AppliedToServiceTransationId ===
                    '00000000-0000-0000-0000-000000000000') &&
                creditTransactionDetail.AccountMemberId === accountMemberId &&
                creditTransactionDetail.IsDeleted === false
              )
                resultCreditTransDetail.push(
                  angular.copy(creditTransactionDetail)
                );
            }
          );
        } else {
          angular.forEach(
            creditTransaction.CreditTransactionDetails,
            function (creditTransactionDetail) {
              if (
                (!creditTransactionDetail.EncounterId ||
                  creditTransactionDetail.EncounterId ===
                    '00000000-0000-0000-0000-000000000000') &&
                (!creditTransactionDetail.AppliedToDebitTransactionId ||
                  creditTransactionDetail.AppliedToDebitTransactionId ===
                    '00000000-0000-0000-0000-000000000000') &&
                (!creditTransactionDetail.AppliedToServiceTransationId ||
                  creditTransactionDetail.AppliedToServiceTransationId ===
                    '00000000-0000-0000-0000-000000000000') &&
                creditTransactionDetail.IsDeleted === false
              )
                resultCreditTransDetail.push(
                  angular.copy(creditTransactionDetail)
                );
            }
          );
        }
        if (resultCreditTransDetail.length > 0) {
          var creditTransTemp = angular.copy(creditTransaction);
          creditTransTemp.CreditTransactionDetails = resultCreditTransDetail;
          resultCreditTrans.push(creditTransTemp);
        }
      });

      return resultCreditTrans;
    };
  })
  .filter(
    'getUnassignedCreditTransactionDetailFromCreditTransactionFilter',
    function () {
      // accepts single credit-transaction object and returns single unapplied credit-transaction-detail record.
      return function (creditTransaction) {
        var resultCreditTransDetail = [];
        angular.forEach(
          creditTransaction.CreditTransactionDetails,
          function (creditTransactionDetail) {
            if (
              (!creditTransactionDetail.EncounterId ||
                creditTransactionDetail.EncounterId ===
                  '00000000-0000-0000-0000-000000000000') &&
              (!creditTransactionDetail.AppliedToDebitTransactionId ||
                creditTransactionDetail.AppliedToDebitTransactionId ===
                  '00000000-0000-0000-0000-000000000000') &&
              (!creditTransactionDetail.AppliedToServiceTransationId ||
                creditTransactionDetail.AppliedToServiceTransationId ===
                  '00000000-0000-0000-0000-000000000000')
            )
              resultCreditTransDetail.push(
                angular.copy(creditTransactionDetail)
              );
          }
        );

        return resultCreditTransDetail;
      };
    }
  )
  .filter('setDateTime', function () {
    // accepts date given by dateSelector (UTC date) and appends time to it
    // returns dateTime
    return function (date) {
      if (!date) {
        return '';
      }
      var momentDate = moment(new Date(date));
      var tempDate = momentDate.format('DD');
      var tempMonth = momentDate.format('MM') - 1;
      var tempYear = momentDate.format('YYYY');
      var dateTimeForDatabase = new Date(
        tempYear,
        tempMonth,
        tempDate,
        moment().hour(),
        moment().minute(),
        moment().second(),
        moment().millisecond()
      );

      return dateTimeForDatabase;
    };
  })
  .filter('unique', function () {
    return function (collection, keyname) {
      var output = [],
        keys = [];

      angular.forEach(collection, function (item) {
        var key = item[keyname];
        if (keys.indexOf(key) === -1) {
          keys.push(key);
          output.push(item);
        }
      });

      return output;
    };
  })
  .filter('getProvidersInPreferredOrderFilter', [
    'orderByFilter',
    'ListHelper',
    function (orderByFilter, listHelper) {
      return function (allProviders, patientInfo, locationId) {
        var finalListOfProviders = [];

        // These variable holds the object of preferred dentist and hygienist if have been set in the system for a provided patient
        var preferredDentist;
        var preferredHygienist;
        patientInfo =
          angular.isUndefined(patientInfo.PreferredDentist) &&
          angular.isDefined(patientInfo.Profile)
            ? patientInfo.Profile
            : patientInfo;

        //#region Compose a list of providers which are other than 'Not a provider' type for This location
        // Get providers having their type as - Dentist, Hygienist, Assistant & Other

        // only include providers for this location and who have UserLocationSetup.ProviderTypeId other than 4
        var providersOtherThanNotAProvider = [];
        _.forEach(allProviders, function (provider) {
          var userLocationSetup = _.find(
            provider.Locations,
            function (userLocationSetup) {
              return userLocationSetup.LocationId === locationId;
            }
          );
          if (userLocationSetup && userLocationSetup.ProviderTypeId !== 4) {
            provider.UserLocationSetup = _.cloneDeep(userLocationSetup);
            providersOtherThanNotAProvider.push(provider);
          }
        });

        //#endregion

        //#region Retrieve preferred dentist and hygienist for a patient searched by user

        if (patientInfo && patientInfo.PreferredDentist) {
          // Retrieve preferred dentist from the list of providers
          preferredDentist = listHelper.findItemByFieldValue(
            allProviders,
            'UserId',
            patientInfo.PreferredDentist
          );

          // Remove existing preferredDentist from the providersOtherThanNotAProvider list so that it won't appear twice in the dropdown
          var dentistRemoveIndex = listHelper.findIndexByFieldValue(
            providersOtherThanNotAProvider,
            'UserId',
            patientInfo.PreferredDentist
          );
          if (dentistRemoveIndex !== -1)
            providersOtherThanNotAProvider.splice(dentistRemoveIndex, 1);
        }

        if (
          patientInfo &&
          patientInfo.PreferredHygienist &&
          patientInfo.PreferredHygienist !== patientInfo.PreferredDentist
        ) {
          // Retrieve preferred hygienist from the list of providers
          preferredHygienist = listHelper.findItemByFieldValue(
            allProviders,
            'UserId',
            patientInfo.PreferredHygienist
          );

          // Remove existing preferredHygienist from the providersOtherThanNotAProvider list so that it won't appear twice in the dropdown
          var hygienistRemoveIndex = listHelper.findIndexByFieldValue(
            providersOtherThanNotAProvider,
            'UserId',
            patientInfo.PreferredHygienist
          );
          if (hygienistRemoveIndex !== -1)
            providersOtherThanNotAProvider.splice(hygienistRemoveIndex, 1);
        }

        //#endregion

        //#region Compose a list of inactive providers
        // Get a list of inactive providers from the list of providers other than "Not a Provider" type
        // If patient has set preferred dentist and hygienist and if they are in Inactive state, they will be added at the top. Dentist at first index and then hygienist

        var copyOfProvidersOtherThanNotAProvider = angular.copy(
          providersOtherThanNotAProvider
        );

        var inactiveProviders = copyOfProvidersOtherThanNotAProvider.filter(
          function (provider) {
            // Find Inactive provider
            if (!provider.IsActive) {
              var inactiveRemoveIndex = listHelper.findIndexByFieldValue(
                providersOtherThanNotAProvider,
                'UserId',
                provider.UserId
              );
              providersOtherThanNotAProvider.splice(inactiveRemoveIndex, 1);
              return true;
            }

            return false;
          }
        );

        // If preferred dentist is inactive, add it at the top of list of inactive providers.
        if (preferredDentist) {
          if (!preferredDentist.IsActive) {
            inactiveProviders.push(preferredDentist);
          }
        }

        // If preferred hygienist is inactive, add it to the list of inactive providers below inactive preferred dentist.
        if (preferredHygienist) {
          if (!preferredHygienist.IsActive) {
            inactiveProviders.push(preferredHygienist);
          }
        }

        //#endregion

        //#region Compose a final list of providers to be shown on screen
        var temporaryProviders = [];

        // If preferred dentist is active, add it to the top of the list
        if (preferredDentist) {
          if (preferredDentist.IsActive) {
            temporaryProviders.push(preferredDentist);
          }
        }

        // If preferred hygienist is active, add it below the active dentist in the list
        if (preferredHygienist) {
          if (preferredHygienist.IsActive) {
            temporaryProviders.push(preferredHygienist);
          }
        }

        // Add sorted active providers
        //providersOtherThanNotAProvider = $filter('orderBy')(providersOtherThanNotAProvider, 'LastName');
        providersOtherThanNotAProvider = orderByFilter(
          providersOtherThanNotAProvider,
          'LastName'
        );
        temporaryProviders = temporaryProviders.concat(
          providersOtherThanNotAProvider
        );

        // Add sorted inactive providers after active providers in the final list
        //inactiveProviders = $filter('orderBy')(inactiveProviders, 'LastName');
        inactiveProviders = orderByFilter(inactiveProviders, 'LastName');
        temporaryProviders = temporaryProviders.concat(inactiveProviders);

        // Create a list of providers that can be bound to UI elements
        angular.forEach(temporaryProviders, function (provider) {
          var name =
            provider.FirstName +
            ' ' +
            provider.LastName +
            (provider.ProfessionalDesignation
              ? ', ' + provider.ProfessionalDesignation
              : '');
          var fullName = provider.FirstName + ' ' + provider.LastName;

          finalListOfProviders.push({
            Name: name,
            FullName: fullName,
            ProviderId: provider.UserId,
            IsActive: provider.IsActive,
            IsPreferred:
              patientInfo &&
              (provider.UserId === patientInfo.PreferredDentist ||
                provider.UserId === patientInfo.PreferredHygienist),
            FirstName: provider.FirstName,
            LastName: provider.LastName,
            ProfessionalDesignation: provider.ProfessionalDesignation,
            UserCode: provider.UserCode,
            UserLocationSetup: provider.UserLocationSetup,
          });
        });
        //#endregion

        return finalListOfProviders;
      };
    },
  ])
  .filter('getProvidersInPreferredOrderFilterMultiLocations', [
    'orderByFilter',
    'ListHelper',
    function (orderByFilter, listHelper) {
      return function (allProviders, patientInfo, locationIds) {
        var finalListOfProviders = [];

        // These variable holds the object of preferred dentist and hygienist if have been set in the system for a provided patient
        var preferredDentist;
        var preferredHygienist;
        patientInfo =
          angular.isUndefined(patientInfo.PreferredDentist) &&
          angular.isDefined(patientInfo.Profile)
            ? patientInfo.Profile
            : patientInfo;

        //#region Compose a list of providers which are other than 'Not a provider' type for This location
        // Get providers having their type as - Dentist, Hygienist, Assistant & Other

        // only include providers for this location and who have UserLocationSetup.ProviderTypeId other than 4
        var providersOtherThanNotAProvider = [];
        _.forEach(allProviders, function (provider) {
          provider.UserLocationSetup = [];
          _.forEach(locationIds, function (locationId) {
            var userLocationSetup = _.find(
              provider.Locations,
              function (userLocationSetup) {
                return userLocationSetup.LocationId === locationId;
              }
            );
            if (userLocationSetup && userLocationSetup.ProviderTypeId !== 4) {
              // NOTE
              // provider.IsActive is based on the UserLocationSetup.IsActive instead of the user.IsActive
              // provider.IsActive = false currently only shows the provider in  italicized grey text and at the
              // bottom of provider list when list is based on a location
              provider.IsActive = userLocationSetup.IsActive;
              provider.UserLocationSetup.push(_.cloneDeep(userLocationSetup));
            }
          });
          if (provider.UserLocationSetup.length > 0) {
            providersOtherThanNotAProvider.push(provider);
          }
        });

        //#endregion

        //#region Retrieve preferred dentist and hygienist for a patient searched by user

        if (patientInfo && patientInfo.PreferredDentist) {
          // Retrieve preferred dentist from the list of providers
          preferredDentist = listHelper.findItemByFieldValue(
            allProviders,
            'UserId',
            patientInfo.PreferredDentist
          );

          // Remove existing preferredDentist from the providersOtherThanNotAProvider list so that it won't appear twice in the dropdown
          var dentistRemoveIndex = listHelper.findIndexByFieldValue(
            providersOtherThanNotAProvider,
            'UserId',
            patientInfo.PreferredDentist
          );
          if (dentistRemoveIndex !== -1)
            providersOtherThanNotAProvider.splice(dentistRemoveIndex, 1);
        }

        if (
          patientInfo &&
          patientInfo.PreferredHygienist &&
          patientInfo.PreferredHygienist !== patientInfo.PreferredDentist
        ) {
          // Retrieve preferred hygienist from the list of providers
          preferredHygienist = listHelper.findItemByFieldValue(
            allProviders,
            'UserId',
            patientInfo.PreferredHygienist
          );

          // Remove existing preferredHygienist from the providersOtherThanNotAProvider list so that it won't appear twice in the dropdown
          var hygienistRemoveIndex = listHelper.findIndexByFieldValue(
            providersOtherThanNotAProvider,
            'UserId',
            patientInfo.PreferredHygienist
          );
          if (hygienistRemoveIndex !== -1)
            providersOtherThanNotAProvider.splice(hygienistRemoveIndex, 1);
        }

        //#endregion

        //#region Compose a list of inactive providers
        // Get a list of inactive providers from the list of providers other than "Not a Provider" type
        // If patient has set preferred dentist and hygienist and if they are in Inactive state, they will be added at the top. Dentist at first index and then hygienist

        var copyOfProvidersOtherThanNotAProvider = angular.copy(
          providersOtherThanNotAProvider
        );

        var inactiveProviders = copyOfProvidersOtherThanNotAProvider.filter(
          function (provider) {
            // Find Inactive provider
            if (!provider.IsActive) {
              var inactiveRemoveIndex = listHelper.findIndexByFieldValue(
                providersOtherThanNotAProvider,
                'UserId',
                provider.UserId
              );
              providersOtherThanNotAProvider.splice(inactiveRemoveIndex, 1);
              return true;
            }

            return false;
          }
        );

        // If preferred dentist is inactive, add it at the top of list of inactive providers.
        if (preferredDentist) {
          if (!preferredDentist.IsActive) {
            inactiveProviders.push(preferredDentist);
          }
        }

        // If preferred hygienist is inactive, add it to the list of inactive providers below inactive preferred dentist.
        if (preferredHygienist) {
          if (!preferredHygienist.IsActive) {
            inactiveProviders.push(preferredHygienist);
          }
        }

        //#endregion

        //#region Compose a final list of providers to be shown on screen
        var temporaryProviders = [];

        // If preferred dentist is active, add it to the top of the list
        if (preferredDentist) {
          if (preferredDentist.IsActive) {
            temporaryProviders.push(preferredDentist);
          }
        }

        // If preferred hygienist is active, add it below the active dentist in the list
        if (preferredHygienist) {
          if (preferredHygienist.IsActive) {
            temporaryProviders.push(preferredHygienist);
          }
        }

        // Add sorted active providers
        //providersOtherThanNotAProvider = $filter('orderBy')(providersOtherThanNotAProvider, 'LastName');
        providersOtherThanNotAProvider = orderByFilter(
          providersOtherThanNotAProvider,
          'LastName'
        );
        temporaryProviders = temporaryProviders.concat(
          providersOtherThanNotAProvider
        );

        // Add sorted inactive providers after active providers in the final list
        //inactiveProviders = $filter('orderBy')(inactiveProviders, 'LastName');
        inactiveProviders = orderByFilter(inactiveProviders, 'LastName');
        temporaryProviders = temporaryProviders.concat(inactiveProviders);

        // Create a list of providers that can be bound to UI elements
        angular.forEach(temporaryProviders, function (provider) {
          var name =
            provider.FirstName +
            ' ' +
            provider.LastName +
            (provider.ProfessionalDesignation
              ? ', ' + provider.ProfessionalDesignation
              : '');
          var fullName = provider.FirstName + ' ' + provider.LastName;

          finalListOfProviders.push({
            Name: name,
            FullName: fullName,
            ProviderId: provider.UserId,
            IsActive: provider.IsActive,
            IsPreferred:
              patientInfo &&
              (provider.UserId === patientInfo.PreferredDentist ||
                provider.UserId === patientInfo.PreferredHygienist),
            FirstName: provider.FirstName,
            LastName: provider.LastName,
            ProfessionalDesignation: provider.ProfessionalDesignation,
            UserCode: provider.UserCode,
            UserLocationSetup: provider.UserLocationSetup,
          });
        });
        //#endregion

        return finalListOfProviders;
      };
    },
  ])
  .filter('getServiceTransactionTotalFilter', function () {
    // filter to get total charge of the transaction
    return function (serviceTransaction) {
      var total = 0;
      if (serviceTransaction) {
        serviceTransaction.Fee = serviceTransaction.Fee
          ? serviceTransaction.Fee
          : 0;
        serviceTransaction.Tax = serviceTransaction.Tax
          ? serviceTransaction.Tax
          : 0;
        serviceTransaction.Discount = serviceTransaction.Discount
          ? serviceTransaction.Discount
          : 0;
        // formula total = fee - discount + tax
        total =
          serviceTransaction.Fee -
          serviceTransaction.Discount +
          serviceTransaction.Tax;
      }
      return total;
    };
  })
  .filter('getServiceTransactionPatientPortionFilter', [
    '$filter',
    function ($filter) {
      // filter to get total charge of the transaction
      return function (serviceTransaction) {
        var patientPortion = 0;
        if (serviceTransaction) {
          var total = $filter('getServiceTransactionTotalFilter')(
            serviceTransaction
          );
          // in future use insurance estimation property instead of zero
          // formula patient portion = total - insurance estimation
          patientPortion = total - 0;
        }
        return patientPortion;
      };
    },
  ])
  .filter('anySelected', function () {
    return function (rows) {
      return _.some(rows, { selected: true });
    };
  })
  .filter('serviceSelected', function () {
    return function (rows) {
      return _.some(rows, { ServiceManuallySelected: true });
    };
  });
