import { Injectable } from '@angular/core';
import { filter } from 'rxjs/operators';
import { isNullOrUndefined } from 'util';
import cloneDeep from 'lodash/cloneDeep';
import { CreditTransaction } from '../models/patient-encounter.model';
import { TransactionTypes } from 'src/@shared/models/transaction-enum';

@Injectable()
export class PatientCheckoutService {

    constructor() { }
    // getCheckoutTotals - Summary of the amounts in the summaryTotals    
    // totalUnappliedCredit:    total Unapplied Credits Only calculation
    // todaysVisitAmount:       total serviceTransaction.Charges for included pending encounters
    // totalEstimatedInsurance: total Estimated Insurance for serviceTransaction.EncounterType === 'Current'
    // totalPaymentApplied:     total Payments, Credits, and Adjustments Applied to serviceTransactions
    // totalCreditsPaymentsAdjustments:   total of all Payments, Credits, and Adjustments
    // totalCharges:            if includePriorBalance total of todaysVisit + priorBalanceTotal - estimatedInsuranceTotal
    //                          if not, TodaysVisit - estimatedInsuranceTotal
    // totalBalanceDue:         if includePriorBalance is true, total serviceTransaction.PatientBalance - serviceTransaction.AdjustmentAmount
    //                          if includePriorBalance is false, total serviceTransaction.PatientBalance - serviceTransaction.AdjustmentAmount if EncounterType is 'Current' 
    // totalPriorBalance:       total serviceTransaction.PatientBalance if EncounterType is 'Prior'

    getCheckoutTotals(serviceAndDebitTransactionDtos, encounterId, priorBalances, creditTransactionDtoList, totalFeeScheduleAdjustment, includePriorBalance) {
        // this will run through the current serviceAndDebitTransactionDtos
        let todaysVisitAmount = 0;
        let estimatedInsuranceTotal = 0;
        let paymentAppliedTotal = 0;
        let adjEstTotal = 0;
        let totalUnappliedCredit = 0;
        let priorBalancesTotal = 0;
        let totalBalanceDue = 0;
        let totalCreditsPaymentsAdjustments = 0;
        const summaryTotals = {
            todaysVisitAmount: 0,
            totalEstimatedInsurance: 0,
            totalCharges: 0,
            totalPaymentApplied: 0,
            totalBalanceDue: 0,
            totalUnappliedCredit: 0,
            totalPriorBalanceDue: 0,
            totalCreditsPaymentsAdjustments: 0
        };

        serviceAndDebitTransactionDtos.forEach(serviceTransaction => {
            // adjEstTotal
            if (serviceTransaction.InsuranceEstimates && serviceTransaction.InsuranceEstimates[0]) {
                adjEstTotal += serviceTransaction.InsuranceEstimates[0].AdjEst;
            }

            // todays Visit (encounterId is used to filter the serviceTransactions when only one encounter is being checked out)
            if (typeof (encounterId) !== 'undefined' && encounterId != null) {
                if (serviceTransaction.EncounterId === encounterId) {
                    todaysVisitAmount += serviceTransaction.Charges;
                }
            } else {
                // I'm not sure why we do this...seems like the more accurate would be to look at the EncounterType
                // don't count prior balance transactions in the totalCharges(todays Visit)
                const matchingPriorBalanceTransaction = priorBalances.filter(x => x.EncounterId === serviceTransaction.EncounterId);
                if (matchingPriorBalanceTransaction === null || (matchingPriorBalanceTransaction && matchingPriorBalanceTransaction.length === 0)) {
                    todaysVisitAmount += serviceTransaction.Charges;
                }
            }

            // prior balance total equals total of serviceTransaction.PatientBalance
            if (serviceTransaction.EncounterType === 'Prior') {
                priorBalancesTotal += serviceTransaction.PatientBalance;
            }

            // total balance due (includePriorBalance notifies whether to include prior in totalBalance)
            if (includePriorBalance === true) {
                totalBalanceDue += (serviceTransaction.PatientBalance - serviceTransaction.AdjustmentAmount);
            } else {
                if (serviceTransaction.EncounterType === 'Current') {
                    totalBalanceDue += (serviceTransaction.PatientBalance - serviceTransaction.AdjustmentAmount);
                }
            }

            // total insurance estimate
            if (serviceTransaction.EncounterType === 'Current') {
                // less estimated insurance amount
                // Sum of Est Ins + Est Ins Adj for each service on each encounter being checked out (display $0 when there are none)
                // When no claims are to be created from the Checkout, Insurance Estimates amount should be $0.00
                // estimatedInsurance per transaction is 0 if claim is unchecked
                if (serviceTransaction.CreateClaim === true) {
                    // tslint:disable-next-line: max-line-length
                    if (serviceTransaction.encounterHasFeeScheduleAdjustments === true) {
                        // if encounter.hasFeeScheduleAdjustments is true then estimated insurance is sum of EstInsurance
                        estimatedInsuranceTotal += serviceTransaction.InsuranceEstimates.reduce((a, b) => {
                            return a + b.EstInsurance;
                        }, 0);
                    } else {
                        // if encounter.hasFeeScheduleAdjustments is false then estimated insurance is sum of EstInsurance plus AdjEst
                        // tslint:disable-next-line: max-line-length
                        estimatedInsuranceTotal += serviceTransaction.InsuranceEstimates.reduce((a, b) => {
                            return a + (b.EstInsurance + b.AdjEst);
                        }, 0);
                    }
                }
            }

            // adjustment amount
            // Ensure property exists. Gets removed after editing encounter charge
            if (!serviceTransaction.AdjustmentAmount) {
                serviceTransaction.AdjustmentAmount = 0;
            }

            // payment applied (Soon)
            paymentAppliedTotal += serviceTransaction.AdjustmentAmount;
        });
        paymentAppliedTotal += totalFeeScheduleAdjustment;

        // total credits applied to these transactions
        creditTransactionDtoList.forEach(creditTransaction => {
            if (creditTransaction.TransactionTypeId === TransactionTypes.CreditPayment) {
                totalUnappliedCredit += parseFloat(creditTransaction.Amount);
            }
            // Total Payments, Credits, and Adjustments calculation
            totalCreditsPaymentsAdjustments += creditTransaction.Amount;
        });
        summaryTotals.totalUnappliedCredit = parseFloat(totalUnappliedCredit.toFixed(2));
        summaryTotals.todaysVisitAmount = parseFloat(todaysVisitAmount.toFixed(2));
        summaryTotals.totalEstimatedInsurance = parseFloat(estimatedInsuranceTotal.toFixed(2));
        summaryTotals.totalPaymentApplied = parseFloat(paymentAppliedTotal.toFixed(2));
        summaryTotals.totalCreditsPaymentsAdjustments = parseFloat(totalCreditsPaymentsAdjustments.toFixed(2));
        let totalCharges = 0;

        // if includePriorBalance is true add priorBalancesTotal to totalCharges and totalBalanceDue
        if (includePriorBalance) {
            totalCharges = todaysVisitAmount + priorBalancesTotal - estimatedInsuranceTotal;
        } else {
            totalCharges = todaysVisitAmount - estimatedInsuranceTotal;
        }
        summaryTotals.totalCharges = parseFloat(totalCharges.toFixed(2));
        summaryTotals.totalBalanceDue = parseFloat(totalBalanceDue.toFixed(2));
        summaryTotals.totalPriorBalanceDue = parseFloat(priorBalancesTotal.toFixed(2));
        return summaryTotals;
    }

    // to simplify several methods in this service I'm adding this helper function that simply returns
    // true if a passed in value is not an actual value but an empty one or placeholder
    isAnEmptyId(id) {
        const emptyGuid = '00000000-0000-0000-0000-000000000000';
        return id === emptyGuid || isNullOrUndefined(id) || id === '';
    }

    // to simplify several methods in this service I'm adding this helper function that simply returns
    // true if a creditTransactionDetail hasn't been applied yet based on set Properties
    isAnUnappliedCreditTransactionDetail(creditTransactionDetail) {
        if (creditTransactionDetail.IsDeleted === false &&
            this.isAnEmptyId(creditTransactionDetail.AppliedToDebitTransactionId) &&
            this.isAnEmptyId(creditTransactionDetail.AppliedToServiceTransationId)) {
            return true;
        }
        return false;
    }

    getUnappliedCreditTransactionDetailAmount(creditTransactionDetails, accountMemberId) {
        let unappliedAmount = 0;
        if (accountMemberId) {
            // filter creditTransactionDetails for only those records that have AccountMemberId equal to accountMemberId
            creditTransactionDetails = creditTransactionDetails.filter(
                creditTransactionDetail => creditTransactionDetail.AccountMemberId === accountMemberId);
        }
        creditTransactionDetails.forEach(creditTransactionDetail => {
            if (creditTransactionDetail.IsDeleted === false &&
                this.isAnEmptyId(creditTransactionDetail.AppliedToDebitTransactionId) &&
                this.isAnEmptyId(creditTransactionDetail.AppliedToServiceTransationId)) {
                unappliedAmount += creditTransactionDetail.Amount;
            }
        });
        unappliedAmount = Math.abs(unappliedAmount);
        return parseFloat(unappliedAmount.toFixed(2));
    }

    getTotalUnappliedAmountFromCreditTransactions(creditTransactions, accountMemberId) {
        let unappliedAmount = 0;
        creditTransactions.forEach(creditTransaction => {
            creditTransaction.CreditTransactionDetails.forEach(creditTransactionDetail => {
                if (this.isAnUnappliedCreditTransactionDetail(creditTransactionDetail)) {
                    // if accountMemberId is passed to method only add creditTransactionDetail to filteredCreditTransactionDetails if match
                    if (accountMemberId && creditTransactionDetail.AccountMemberId === accountMemberId) {
                        unappliedAmount += -(creditTransactionDetail.Amount);
                    }
                    // otherwise just add creditTransactionDetail to filteredCreditTransactionDetails
                    if (!accountMemberId) {
                        unappliedAmount += -(creditTransactionDetail.Amount);
                    }
                }
            });
        });
        return unappliedAmount;
    }

    getUnappliedCreditTransactions(creditTransactions, accountMemberId) {
        const filteredCreditTransactions = [];
        creditTransactions.forEach(creditTransaction => {
            const filteredCreditTransactionDetails = [];
            creditTransaction.CreditTransactionDetails.forEach(creditTransactionDetail => {
                if (this.isAnEmptyId(creditTransactionDetail.EncounterId) &&
                    this.isAnUnappliedCreditTransactionDetail(creditTransactionDetail) === true) {
                    // if accountMemberId is passed to method only add creditTransactionDetail to filteredCreditTransactionDetails if match
                    if (accountMemberId && creditTransactionDetail.AccountMemberId === accountMemberId) {
                        filteredCreditTransactionDetails.push(creditTransactionDetail);
                    }
                    // otherwise just add creditTransactionDetail to filteredCreditTransactionDetails
                    if (!accountMemberId) {
                        filteredCreditTransactionDetails.push(creditTransactionDetail);
                    }
                }
            });
            if (filteredCreditTransactionDetails.length > 0) {
                const creditTransactionCopy = cloneDeep(creditTransaction);
                creditTransactionCopy.CreditTransactionDetails = filteredCreditTransactionDetails;
                filteredCreditTransactions.push(creditTransactionCopy);
            }
        });
        return filteredCreditTransactions;
    }

    // returns a list of invalid service codes for a list of serviceTransactions based on the affected area
    // since the affectedArea on the serviceTransaction might not match the requirments if the service code definition has changed
    // returns a list of invalid codes
    checkForAffectedAreaChanges(serviceTransations, serviceCodes) {
        const serviceCodesThatNeedUpdated = [];
        serviceTransations.forEach(serviceTransaction => {
            let updateCode = false;
            // find the associated serviceCode
            const associatedServiceCode = serviceCodes.find(serviceCode => serviceCode.ServiceCodeId === serviceTransaction.ServiceCodeId);
            if (associatedServiceCode) {
                switch (associatedServiceCode.AffectedAreaId) {
                    case 1: // mouth shouldn't have roots, tooth, surface
                        if (serviceTransaction.Roots || serviceTransaction.RootSummaryInfo ||
                            serviceTransaction.Tooth || serviceTransaction.Surface || serviceTransaction.SurfaceSummaryInfo) {
                            updateCode = true;
                        }
                        break;
                    case 3: // roots should have roots and tooth -  should not have surface
                        if (!serviceTransaction.Roots || !serviceTransaction.Tooth || serviceTransaction.Surface ||
                            serviceTransaction.SurfaceSummaryInfo) {
                            updateCode = true;
                        }
                        break;
                    case 4: // surface should have surface and tooth, should not have roots
                        if (!serviceTransaction.Surface || !serviceTransaction.Tooth ||
                            serviceTransaction.Roots || serviceTransaction.RootSummaryInfo) {
                            updateCode = true;
                        }
                        break;
                    case 5: // tooth only, not roots or surface
                        if (!serviceTransaction.Tooth || serviceTransaction.Roots || serviceTransaction.RootSummaryInfo ||
                            serviceTransaction.Surface || serviceTransaction.SurfaceSummaryInfo) {
                            updateCode = true;
                        }
                        break;
                }
                // if the code needs to be updated add it to the list
                if (updateCode === true) {
                    if (serviceCodesThatNeedUpdated.indexOf(associatedServiceCode) === -1) {
                        serviceCodesThatNeedUpdated.push(associatedServiceCode);
                    }
                }
            }
        });
        return serviceCodesThatNeedUpdated;
    }

    // sets the OriginalPosition property on the CreditTransaction
    setCreditTransactionOriginalPosition(creditTransaction, creditTransactionsList) {
        let maxPosition = 0;
        // calculate the max position in list
        if (creditTransactionsList && creditTransactionsList.length > 0) {
            maxPosition = Math.max.apply(Math, creditTransactionsList.map((o) => o.OriginalPosition));
        }
        maxPosition = maxPosition + 1;
        creditTransaction.OriginalPosition = maxPosition;
    }

    initializeCreditTransaction(accountId, locationId) {
        const creditTransactionDto = new CreditTransaction();
        creditTransactionDto.AccountId = accountId;
        creditTransactionDto.AdjustmentTypeId = null;
        creditTransactionDto.Amount = 0;
        creditTransactionDto.AppliedAmount = 0;
        creditTransactionDto.AssignedAdjustmentTypeId = 1;
        creditTransactionDto.ClaimId = null;
        creditTransactionDto.CreditTransactionId = '00000000-0000-0000-0000-000000000000';
        creditTransactionDto.DateEntered = new Date();
        creditTransactionDto.Description = null;
        creditTransactionDto.EnteredByUserId = '00000000-0000-0000-0000-000000000000';
        creditTransactionDto.OriginalPosition = 0;
        creditTransactionDto.LocationId = locationId ? locationId : null;
        creditTransactionDto.Note = '';
        creditTransactionDto.PaymentTypeId = '';
        creditTransactionDto.PaymentTypePromptValue = null;
        creditTransactionDto.PromptTitle = null;
        creditTransactionDto.TransactionTypeId = TransactionTypes.Payment;
        creditTransactionDto.ValidDate = true;
        creditTransactionDto.CreditTransactionDetails = [];
        creditTransactionDto.FeeScheduleAdjustmentForEncounterId = null;
        creditTransactionDto.IsFeeScheduleWriteOff = false;
        creditTransactionDto.CreditTransactionDetails = [];
        creditTransactionDto.hasPriorBalanceAmounts = false;
        return creditTransactionDto;
    }

    // reinitialize creditTransactionDto and reload current details
    resetCurrentCreditTransaction(creditTransaction, creditTransactionsList) {
        const details = creditTransaction.CreditTransactionDetails;
        creditTransaction.AdjustmentTypeId = null;
        creditTransaction.Amount = 0;
        creditTransaction.AppliedAmount = 0;
        creditTransaction.AssignedAdjustmentTypeId = 1;
        creditTransaction.ClaimId = null;
        creditTransaction.CreditTransactionId = '00000000-0000-0000-0000-000000000000';
        creditTransaction.DateEntered = new Date();
        creditTransaction.Description = null;
        creditTransaction.EnteredByUserId = '00000000-0000-0000-0000-000000000000';
        creditTransaction.OriginalPosition = 0;
        creditTransaction.Note = '';
        creditTransaction.PaymentTypeId = '';
        creditTransaction.PaymentTypePromptValue = null;
        creditTransaction.PromptTitle = null;
        creditTransaction.TransactionTypeId = TransactionTypes.Payment;
        creditTransaction.ValidDate = true;
        creditTransaction.CreditTransactionDetails = [];
        creditTransaction.FeeScheduleAdjustmentForEncounterId = null;
        creditTransaction.IsFeeScheduleWriteOff = false;
        creditTransaction.CreditTransactionDetails = [];
        creditTransaction.TransactionTypeId = TransactionTypes.Payment;
        creditTransaction.hasPriorBalanceAmounts = false;
        this.setCreditTransactionOriginalPosition(creditTransaction, creditTransactionsList);
        creditTransaction.CreditTransactionDetails = details;
        return creditTransaction;
    }

    // recalculate ServiceTransactionAmounts on change
    // PatientBalance = Balance - insEst (based on whether CreateClaim is true or false) This lets us preserve original Balance amount
    // Charges = Fee - Discount + Tax
    // DueNow = PatientBalance - AdjustmentAmount (cumulated total of CreditTransactionDetail.Amount not yet persisted)
    calculateServiceTransactionAmounts(serviceTransaction) {
        if (serviceTransaction) {
            // Charges calculate total charge for each serviceTransaction
            // DebitTransactions do not have discount or tax columns
            const discount = serviceTransaction.Discount ? serviceTransaction.Discount : 0;
            const tax = serviceTransaction.Tax ? serviceTransaction.Tax : 0;
            serviceTransaction.Charges = serviceTransaction.Fee - discount + tax;

            // PatientBalance is computed value so that we can preserve the original balance in the serviceTransaction
            // If we have InsuranceEstimates and CreateClaim is true, calculate the value
            if (serviceTransaction.InsuranceEstimates && serviceTransaction.InsuranceEstimates.length > 0) {
                let insEst = 0;
                serviceTransaction.InsuranceEstimates.forEach(insuranceEstimate => {
                    insEst += insuranceEstimate.EstInsurance + insuranceEstimate.AdjEst;
                });
                serviceTransaction.PatientBalance = serviceTransaction.CreateClaim === true ?
                    serviceTransaction.Balance :
                    serviceTransaction.Balance + insEst;
            } else {
                // otherwise just use the Balance
                serviceTransaction.PatientBalance = serviceTransaction.Balance;
            }
            serviceTransaction.DueNow = serviceTransaction.PatientBalance - serviceTransaction.AdjustmentAmount;
        }
    }
}
