import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { PatientCheckoutService } from './patient-checkout.service';
import cloneDeep from 'lodash/cloneDeep';
import { CreditTransaction } from '../models/patient-encounter.model';
import { TransactionTypes } from 'src/@shared/models/transaction-enum';

// DEV NOTE the spelling on CreditTransactionDetail property AppliedToServiceTransationId
// I continually type it as AppliedToServiceTransactionId which will break tests.

describe('PatientCheckoutService', () => {
    beforeEach(() => TestBed.configureTestingModule({
        providers: [
            PatientCheckoutService,
        ],
        schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }));

    let patientCheckoutService;
    beforeEach(() => {
        patientCheckoutService = TestBed.get(PatientCheckoutService);
    });

    it('should be created', () => {
        expect(patientCheckoutService).toBeTruthy();
    });

    /*
  
  export enum TransactionTypes {
      Service = 1,
      Payment = 2,
      InsurancePayment = 3,
      NegativeAdjustment = 4,
      PositiveAdjustment = 5,
      FinanceCharge = 6,
      CreditPayment = 7,
      VoidService= 8,
      VoidPayment= 9,
  }
  
    */

    describe('getUnappliedCreditTransactions', () => {
        let mockCreditTransactions = [];
        beforeEach(() => {
            // 3 credit transactions
            mockCreditTransactions = [{
                PaymentTypeId: 1,
                TransactionTypeId: TransactionTypes.Payment,
                AdjustmentTypeId: 3,
                CreditTransactionId: 1234,
                CreditTransactionDetails: [{
                    IsDeleted: false,
                    AccountMemberId: '1234',
                    CreditTransactionId: 1234,
                    CreditTransactionDetailId: 2345,
                    AppliedToServiceTransationId: null,
                    AppliedToDebitTransactionId: null,
                    EncounterId: null,
                    Amount: 75.00,
                    DateEntered: '2020-09-09'
                }, {
                    IsDeleted: false,
                    AccountMemberId: '1234',
                    CreditTransactionId: 1234,
                    CreditTransactionDetailId: 2346,
                    AppliedToServiceTransationId: null,
                    AppliedToDebitTransactionId: null,
                    EncounterId: null,
                    Amount: 25.00,
                    DateEntered: '2020-09-09'
                },]
            }, {
                PaymentTypeId: 2,
                TransactionTypeId: TransactionTypes.Payment,
                AdjustmentTypeId: 1,
                CreditTransactionId: 1235,
                CreditTransactionDetails: [{
                    IsDeleted: false,
                    AccountMemberId: '1234',
                    CreditTransactionId: 1235,
                    CreditTransactionDetailId: 2347,
                    AppliedToServiceTransationId: null,
                    AppliedToDebitTransactionId: null,
                    EncounterId: null,
                    Amount: 25.00,
                    DateEntered: '2020-08-09'
                },]
            },
            {
                PaymentTypeId: 3,
                TransactionTypeId: TransactionTypes.Service,
                AdjustmentTypeId: 2,
                CreditTransactionId: 1239,
                CreditTransactionDetails: [{
                    IsDeleted: false,
                    AccountMemberId: '1234',
                    CreditTransactionId: 1239,
                    CreditTransactionDetailId: 2349,
                    AppliedToServiceTransationId: null,
                    AppliedToDebitTransactionId: null,
                    EncounterId: null,
                    Amount: 50.00,
                    DateEntered: '2020-07-09'
                }, {
                    IsDeleted: false,
                    AccountMemberId: '1234',
                    CreditTransactionId: 1239,
                    CreditTransactionDetailId: 2350,
                    AppliedToServiceTransationId: null,
                    AppliedToDebitTransactionId: null,
                    EncounterId: null,
                    Amount: 50.00,
                    DateEntered: '2020-08-09'
                },]
            },];
        });

        it('should filter creditTransactions and return list of getUnappliedCreditTransactions', () => {
            const creditTransactions = Object.assign(mockCreditTransactions);
            const accountMemberId = null;
            const returnList = patientCheckoutService.getUnappliedCreditTransactions(creditTransactions, accountMemberId);
            expect(returnList.length).toBe(3);
        });

        it('should filter creditTransactions and return list of getUnappliedCreditTransactions' +
            ' and exclude creditTransactions where all of the details do not have ' +
            'EncounterId and AppliedToServiceTransationId and AppliedToDebitTransactionId as null or empty', () => {
                const creditTransactions = Object.assign(mockCreditTransactions);
                const accountMemberId = null;
                creditTransactions[0].CreditTransactionDetails.forEach(creditTransactionDetail => {
                    creditTransactionDetail.EncounterId = '1234';
                });
                const returnList = patientCheckoutService.getUnappliedCreditTransactions(creditTransactions, accountMemberId);
                expect(returnList.length).toBe(2);
            });

        it('should filter creditTransactions and return list of getUnappliedCreditTransactions' +
            ' and exclude creditTransactions where all of the details do not have ' +
            'EncounterId and AppliedToServiceTransationId and AppliedToDebitTransactionId as null or empty', () => {
                const creditTransactions = Object.assign(mockCreditTransactions);
                const accountMemberId = null;
                creditTransactions[0].CreditTransactionDetails.forEach(creditTransactionDetail => {
                    creditTransactionDetail.AppliedToServiceTransationId = '1234';
                });
                const returnList = patientCheckoutService.getUnappliedCreditTransactions(creditTransactions, accountMemberId);
                expect(returnList.length).toBe(2);
            });

        it('should filter creditTransactions and return list of getUnappliedCreditTransactions' +
            ' and exclude creditTransactions where the accountMemberId is passed in and all of the creditTransactionDetails' +
            ' do not match the AccountMemberId', () => {
                const creditTransactions = Object.assign(mockCreditTransactions);
                const accountMemberId = '1234';
                creditTransactions[0].CreditTransactionDetails.forEach(creditTransactionDetail => {
                    creditTransactionDetail.AccountMemberId = '1235';
                });
                const returnList = patientCheckoutService.getUnappliedCreditTransactions(creditTransactions, accountMemberId);
                expect(returnList.length).toBe(2);
            });
    });

    describe('getUnappliedCreditTransactionDetailAmount method', () => {
        let mockCreditTransactionDetails = [];
        beforeEach(() => {
            // 3 credit transactions
            mockCreditTransactionDetails = [{
                IsDeleted: false,
                AccountMemberId: '1234',
                CreditTransactionId: 1234,
                CreditTransactionDetailId: 2345,
                AppliedToServiceTransationId: null,
                AppliedToDebitTransactionId: null,
                EncounterId: null,
                Amount: 75.00,
                DateEntered: '2020-09-09'
            }, {
                IsDeleted: false,
                AccountMemberId: '1234',
                CreditTransactionId: 1234,
                CreditTransactionDetailId: 2346,
                AppliedToServiceTransationId: null,
                AppliedToDebitTransactionId: null,
                EncounterId: null,
                Amount: 25.00,
                DateEntered: '2020-09-09'
            }, {
                IsDeleted: false,
                AccountMemberId: '1234',
                CreditTransactionId: 1235,
                CreditTransactionDetailId: 2347,
                AppliedToServiceTransationId: null,
                AppliedToDebitTransactionId: null,
                EncounterId: null,
                Amount: 25.00,
                DateEntered: '2020-08-09'
            }];
        });

        // Amounts are 75, 25, and 25 respectively

        it('should return total amount of creditTransactionDetails.Amount ' +
            'where AppliedToServiceTransationId and AppliedToDebitTransactionId are not populated', () => {
                const creditTransactionDetails = Object.assign(mockCreditTransactionDetails);
                const accountMemberId = null;
                const returnValue = patientCheckoutService.getUnappliedCreditTransactionDetailAmount(
                    creditTransactionDetails, accountMemberId);
                expect(returnValue).toBe(125);
            });

        it('should not include creditTransactionDetails.Amount ' +
            'where AppliedToServiceTransationId or AppliedToDebitTransactionId are populated', () => {
                const creditTransactionDetails = Object.assign(mockCreditTransactionDetails);
                creditTransactionDetails[0].AppliedToDebitTransactionId = '1234';
                const accountMemberId = null;
                const returnValue = patientCheckoutService.getUnappliedCreditTransactionDetailAmount(
                    creditTransactionDetails, accountMemberId);
                expect(returnValue).toBe(50);
            });

        it('should filter by accountMemberId if that is passed in creditTransactionDetails.Amount ' +
            'where AppliedToServiceTransationId or AppliedToDebitTransactionId are populated', () => {
                const creditTransactionDetails = Object.assign(mockCreditTransactionDetails);
                creditTransactionDetails[0].AccountMemberId = '1235';
                const accountMemberId = '1234';
                const returnValue = patientCheckoutService.getUnappliedCreditTransactionDetailAmount(
                    creditTransactionDetails, accountMemberId);
                expect(returnValue).toBe(50);
            });
    });

    describe('getTotalUnappliedAmountFromCreditTransactions', () => {
        let mockCreditTransactions = [];
        beforeEach(() => {
            // 3 credit transactions
            mockCreditTransactions = [{
                PaymentTypeId: 1,
                TransactionTypeId: TransactionTypes.Payment,
                AdjustmentTypeId: 3,
                CreditTransactionId: 1234,
                CreditTransactionDetails: [{
                    IsDeleted: false,
                    AccountMemberId: '1234',
                    CreditTransactionId: 1234,
                    CreditTransactionDetailId: 2345,
                    AppliedToServiceTransationId: null,
                    AppliedToDebitTransactionId: null,
                    EncounterId: null,
                    Amount: 75.00,
                    DateEntered: '2020-09-09'
                }, {
                    IsDeleted: false,
                    AccountMemberId: '1234',
                    CreditTransactionId: 1234,
                    CreditTransactionDetailId: 2346,
                    AppliedToServiceTransationId: null,
                    AppliedToDebitTransactionId: null,
                    EncounterId: null,
                    Amount: 25.00,
                    DateEntered: '2020-09-09'
                },]
            }, {
                PaymentTypeId: 2,
                TransactionTypeId: TransactionTypes.Payment,
                AdjustmentTypeId: 1,
                CreditTransactionId: 1235,
                CreditTransactionDetails: [{
                    IsDeleted: false,
                    AccountMemberId: '1234',
                    CreditTransactionId: 1235,
                    CreditTransactionDetailId: 2347,
                    AppliedToServiceTransationId: null,
                    AppliedToDebitTransactionId: null,
                    EncounterId: null,
                    Amount: 25.00,
                    DateEntered: '2020-08-09'
                },]
            },
            {
                PaymentTypeId: 3,
                TransactionTypeId: TransactionTypes.Service,
                AdjustmentTypeId: 2,
                CreditTransactionId: 1239,
                CreditTransactionDetails: [{
                    IsDeleted: false,
                    AccountMemberId: '1234',
                    CreditTransactionId: 1239,
                    CreditTransactionDetailId: 2349,
                    AppliedToServiceTransationId: null,
                    AppliedToDebitTransactionId: null,
                    EncounterId: null,
                    Amount: 50.00,
                    DateEntered: '2020-07-09'
                }, {
                    IsDeleted: false,
                    AccountMemberId: '1234',
                    CreditTransactionId: 1239,
                    CreditTransactionDetailId: 2350,
                    AppliedToServiceTransationId: null,
                    AppliedToDebitTransactionId: null,
                    EncounterId: null,
                    Amount: 50.00,
                    DateEntered: '2020-08-09'
                },]
            },];
        });

        // Amounts are [75,25],[25],[50,50]
        it('should filter creditTransactions and return the total amount for all unapplied creditTransactions as negative amount', () => {
            const creditTransactions = Object.assign(mockCreditTransactions);
            const accountMemberId = null;
            const returnAmount = patientCheckoutService.getTotalUnappliedAmountFromCreditTransactions(creditTransactions, accountMemberId);
            expect(returnAmount).toBe(-225);
        });

        it('should filter creditTransactions and total amount for all unassigned creditTransactions as negative amount' +
            ' and exclude creditTransactions where all of the details do not have ' +
            'AppliedToServiceTransationId and AppliedToDebitTransactionId as null or empty', () => {
                const creditTransactions = Object.assign(mockCreditTransactions);
                const accountMemberId = null;
                creditTransactions[0].CreditTransactionDetails.forEach(creditTransactionDetail => {
                    creditTransactionDetail.AppliedToDebitTransactionId = '1234';
                });
                const returnAmount = patientCheckoutService.getTotalUnappliedAmountFromCreditTransactions(creditTransactions, accountMemberId);
                expect(returnAmount).toBe(-125);
            });

        it('should filter creditTransactions and total amount for all unassigned creditTransactions as negative amount' +
            ' and exclude creditTransactions where the accountMemberId is passed in and all of the creditTransactionDetails' +
            ' do not match the AccountMemberId', () => {
                const creditTransactions = Object.assign(mockCreditTransactions);
                const accountMemberId = '1234';
                creditTransactions[0].CreditTransactionDetails.forEach(creditTransactionDetail => {
                    creditTransactionDetail.AccountMemberId = '1235';
                });
                const returnAmount = patientCheckoutService.getTotalUnappliedAmountFromCreditTransactions(creditTransactions, accountMemberId);
                expect(returnAmount).toBe(-125);
            });
    });

    describe('getCheckoutTotals method', () => {
        let serviceAndDebitTransactionDtos;
        let priorBalances;
        let creditTransactionDtoList;
        let totalFeeScheduleAdjustment;

        beforeEach(() => {
            creditTransactionDtoList = [];
            priorBalances = [];
            totalFeeScheduleAdjustment = 0;
            serviceAndDebitTransactionDtos = [];
        });


        it('should return summaryTotals with 0 amounts if serviceAndDebitTransactionDtos is empty list ', () => {
            const encounterId = null;
            const includePriorBalance = false;
            const summaryTotals = patientCheckoutService.getCheckoutTotals(
                serviceAndDebitTransactionDtos, encounterId, priorBalances, creditTransactionDtoList, totalFeeScheduleAdjustment, includePriorBalance);
            expect(summaryTotals.totalBalanceDue).toBe(0);
        });
        it('should return summaryTotals with todaysVisitAmount equals to sum of serviceTransaction.Charges if ' +
            ' serviceAndDebitTransactionDtos is not empty list and serviceTransaction is not in priorBalances list and encounterId is null ', () => {
                const encounterId = null;
                const includePriorBalance = false;
                serviceAndDebitTransactionDtos = [
                    { Charges: 150.00, Balance: 150.00, EncounterId: 100, EncounterType: 'Current' },
                    { Charges: 150.00, Balance: 150.00, EncounterId: 101, EncounterType: 'Current' },];
                const summaryTotals = patientCheckoutService.getCheckoutTotals(serviceAndDebitTransactionDtos, encounterId, priorBalances, creditTransactionDtoList, totalFeeScheduleAdjustment, includePriorBalance);
                expect(summaryTotals.todaysVisitAmount).toBe(300);
            });

        it('should calculate and return summaryTotals.totalBalanceDue to equal PatientBalance minus AdjustmentAmount ' +
            'and should include priorBalance if includePriorBalance is true', () => {
                const encounterId = 100;
                const includePriorBalance = true;
                serviceAndDebitTransactionDtos = [
                    { DueNow: 125.00, Charges: 150.00, PatientBalance: 150.00, EncounterId: 100, EncounterType: 'Current', AdjustmentAmount: 25 },
                    { DueNow: 95.00, Charges: 150.00, PatientBalance: 120.00, EncounterId: 102, EncounterType: 'Current', AdjustmentAmount: 25 },
                    { DueNow: 99.00, Charges: 150.00, PatientBalance: 99.00, EncounterId: 151, EncounterType: 'Current', AdjustmentAmount: 0 },
                    { DueNow: 125.00, Charges: 150.00, PatientBalance: 125.00, EncounterId: 125, EncounterType: 'Prior', AdjustmentAmount: 0 },
                    { DueNow: 150.00, Charges: 150.00, PatientBalance: 150.00, EncounterId: 101, EncounterType: 'Prior', AdjustmentAmount: 0 },];
                const summaryTotals = patientCheckoutService.getCheckoutTotals(serviceAndDebitTransactionDtos,
                    encounterId, priorBalances, creditTransactionDtoList, totalFeeScheduleAdjustment, includePriorBalance);
                expect(summaryTotals.totalBalanceDue).toBe(594.00);
            });

        it('should calculate and return summaryTotals.totalBalanceDue to equal PatientBalance minus AdjustmentAmount ' +
            ' and should not to include priorBalance if includePriorBalance is false', () => {
                const encounterId = 100;
                const includePriorBalance = false;
                serviceAndDebitTransactionDtos = [
                    { DueNow: 125.00, Charges: 150.00, PatientBalance: 150.00, EncounterId: 100, EncounterType: 'Current', AdjustmentAmount: 25 },
                    { DueNow: 95.00, Charges: 150.00, PatientBalance: 120.00, EncounterId: 102, EncounterType: 'Current', AdjustmentAmount: 25 },
                    { DueNow: 99.00, Charges: 150.00, PatientBalance: 99.00, EncounterId: 151, EncounterType: 'Current', AdjustmentAmount: 0 },
                    { DueNow: 150.00, Charges: 150.00, PatientBalance: 125.00, EncounterId: 125, EncounterType: 'Prior', AdjustmentAmount: 0 },
                    { DueNow: 150.00, Charges: 150.00, PatientBalance: 150.00, EncounterId: 101, EncounterType: 'Prior', AdjustmentAmount: 0 },];
                const summaryTotals = patientCheckoutService.getCheckoutTotals(serviceAndDebitTransactionDtos,
                    encounterId, priorBalances, creditTransactionDtoList, totalFeeScheduleAdjustment, includePriorBalance);
                expect(summaryTotals.totalBalanceDue).toBe(319.00);
            });

        it('should return summaryTotals with totalBalanceDue equals to sum of ' +
            ' serviceTransaction.PatientBalance minus serviceTransaction.AdjustmentAmount ' +
            'and encounterId matches serviceTransaction.EncounterId ', () => {
                const encounterId = 100;
                const includePriorBalance = false;
                serviceAndDebitTransactionDtos = [
                    { DueNow: 125.00, Charges: 150.00, PatientBalance: 150.00, EncounterId: 100, EncounterType: 'Current', AdjustmentAmount: 25 },
                    { DueNow: 150.00, Charges: 150.00, PatientBalance: 150.00, EncounterId: 101, EncounterType: 'Prior', AdjustmentAmount: 0 },];
                // tslint:disable-next-line: max-line-length
                const summaryTotals = patientCheckoutService.getCheckoutTotals(serviceAndDebitTransactionDtos, encounterId, priorBalances, creditTransactionDtoList, totalFeeScheduleAdjustment, includePriorBalance);
                expect(summaryTotals.totalBalanceDue).toBe(125);
            });

        it('should return summaryTotals with totalPriorBalanceDue equals to sum of serviceTransaction.PatientBalance minus serviceTransaction.AdjustmentAmount if ' +
            ' serviceAndDebitTransactionDtos is not empty list and serviceTransaction is not in priorBalances list and encounterId matches serviceTransaction.EncounterId ', () => {
                const encounterId = 100;
                const includePriorBalance = false;
                priorBalances = [{ Charges: 150.00, EncounterId: 200, PatientBalance: 125, Balance: 125, AdjustmentAmount: 0 },
                { DueNow: 150.00, Charges: 150.00, EncounterId: 101, PatientBalance: 125, Balance: 125, AdjustmentAmount: 0 },];
                serviceAndDebitTransactionDtos = [
                    { DueNow: 150.00, Charges: 150.00, EncounterId: 100, PatientBalance: 125, EncounterType: 'Current', AdjustmentAmount: 0 },
                    { DueNow: 150.00, Charges: 150.00, EncounterId: 101, PatientBalance: 125, EncounterType: 'Current', AdjustmentAmount: 0 },
                    { DueNow: 150.00, Charges: 150.00, EncounterId: 102, PatientBalance: 125, EncounterType: 'Prior', AdjustmentAmount: 0 },
                    { DueNow: 150.00, Charges: 150.00, EncounterId: 105, PatientBalance: 125, EncounterType: 'Prior', AdjustmentAmount: 0 },];
                // tslint:disable-next-line: max-line-length
                const summaryTotals = patientCheckoutService.getCheckoutTotals(serviceAndDebitTransactionDtos, encounterId, priorBalances, creditTransactionDtoList, totalFeeScheduleAdjustment, includePriorBalance);
                expect(summaryTotals.totalPriorBalanceDue).toBe(250);
            });

        it('should return summaryTotals.totalEstimatedInsurance equals to sum of serviceTransaction.InsuranceEstimates.EstInsurance if ' +
            ' serviceTransaction.CreateClaim equals true and serviceTransaction.encounterHasFeeScheduleAdjustments equals true and' +
            ' serviceTransaction.CreateClaim equals true and serviceTransaction.EncounterType is Current', () => {
                const encounterId = 100;
                const includePriorBalance = false;

                serviceAndDebitTransactionDtos = [
                    { DueNow: 150.00, Charges: 150.00, EncounterId: 100 },
                    { DueNow: 150.00, Charges: 150.00, EncounterId: 101 },
                    {
                        DueNow: 175.00, Charges: 175.00, EncounterId: 102, Balance: 325, EncounterType: 'Current', InsuranceEstimates: [{ EstInsurance: 125.00 }],
                        encounterHasFeeScheduleAdjustments: true, CreateClaim: true
                    },
                    {
                        DueNow: 150.00, Charges: 150.00, EncounterId: 105, Balance: 325, EncounterType: 'Current', InsuranceEstimates: [{ EstInsurance: 155 }, { EstInsurance: 165 }],
                        encounterHasFeeScheduleAdjustments: true, CreateClaim: true
                    },];
                // tslint:disable-next-line: max-line-length
                const summaryTotals = patientCheckoutService.getCheckoutTotals(serviceAndDebitTransactionDtos, encounterId, priorBalances, creditTransactionDtoList, totalFeeScheduleAdjustment, includePriorBalance);
                expect(summaryTotals.totalEstimatedInsurance).toBe(445);
            });

        it('should return summaryTotals.totalEstimatedInsurance equals to sum of serviceTransaction.InsuranceEstimates.EstInsurance plus AdjEst if ' +
            ' serviceTransaction.CreateClaim equals true and serviceTransaction.encounterHasFeeScheduleAdjustments equals false and' +
            ' serviceTransaction.CreateClaim equals true and serviceTransaction.EncounterType is Current', () => {
                const encounterId = 100;
                const includePriorBalance = false;

                serviceAndDebitTransactionDtos = [
                    { DueNow: 150.00, Charges: 150.00, EncounterId: 100 },
                    { DueNow: 150.00, Charges: 150.00, EncounterId: 101 },
                    {
                        DueNow: 175.00, Charges: 175.00, EncounterId: 102, Balance: 325, EncounterType: 'Current', InsuranceEstimates: [{ EstInsurance: 125.00, AdjEst: 25.00 }],
                        encounterHasFeeScheduleAdjustments: false, CreateClaim: true
                    },
                    {
                        DueNow: 150.00, Charges: 150.00, EncounterId: 105, Balance: 325, EncounterType: 'Current', InsuranceEstimates: [{ EstInsurance: 155, AdjEst: 125.00 }, { EstInsurance: 165, AdjEst: 25.00 }],
                        encounterHasFeeScheduleAdjustments: false, CreateClaim: true
                    },];
                // tslint:disable-next-line: max-line-length
                const summaryTotals = patientCheckoutService.getCheckoutTotals(serviceAndDebitTransactionDtos, encounterId, priorBalances, creditTransactionDtoList, totalFeeScheduleAdjustment, includePriorBalance);
                expect(summaryTotals.totalEstimatedInsurance).toBe(620);
            });

        it('should return summaryTotals.totalEstimatedInsurance equals to 0 if ' +
            ' serviceTransaction.CreateClaim equals false', () => {
                const encounterId = 100;
                const includePriorBalance = false;
                serviceAndDebitTransactionDtos = [
                    { DueNow: 150.00, Charges: 150.00, EncounterId: 100 },
                    { DueNow: 150.00, Charges: 150.00, EncounterId: 101 },
                    {
                        DueNow: 175, Charges: 175.00, EncounterId: 102, Balance: 325, EncounterType: 'Current', InsuranceEstimates: [{ EstInsurance: 125.00, AdjEst: 25.00 }],
                        encounterHasFeeScheduleAdjustments: false, CreateClaim: false
                    },
                    {
                        DueNow: 150.00, Charges: 150.00, EncounterId: 105, Balance: 325, EncounterType: 'Current', InsuranceEstimates: [{ EstInsurance: 155, AdjEst: 125.00 }, { EstInsurance: 165, AdjEst: 25.00 }],
                        encounterHasFeeScheduleAdjustments: false, CreateClaim: false
                    },];
                // tslint:disable-next-line: max-line-length
                const summaryTotals = patientCheckoutService.getCheckoutTotals(serviceAndDebitTransactionDtos, encounterId, priorBalances, creditTransactionDtoList, totalFeeScheduleAdjustment, includePriorBalance);
                expect(summaryTotals.totalEstimatedInsurance).toBe(0);
            });

        // TODO tests for totalPaymentApplied, totalCredit after those are incorporated

        it('should return summaryTotals.todaysCharges equals to sum of todaysVisitAmount minus estimatedInsuranceTotal if includePriorBalance is false' +
            ' serviceAndDebitTransactionDtos is not empty list and serviceTransaction is not in priorBalances list and encounterId is null ' +
            ' and serviceTransaction.encounterHasFeeScheduleAdjustments = false', () => {
                const encounterId = null;
                const includePriorBalance = false;
                priorBalances = [{ Charges: 150.00, EncounterId: 200 },
                { Charges: 150.00, EncounterId: 101 },];
                serviceAndDebitTransactionDtos = [
                    { DueNow: 150.00, Charges: 150.00, EncounterId: 100 },
                    { DueNow: 150.00, Charges: 150.00, EncounterId: 101 },
                    {
                        DueNow: 1.00, Charges: 175.00, EncounterId: 102, Balance: 325, EncounterType: 'Current', InsuranceEstimates: [{ EstInsurance: 125.00, AdjEst: 25.00 }],
                        encounterHasFeeScheduleAdjustments: false, CreateClaim: true
                    },
                    {
                        DueNow: .00, Charges: 225.00, EncounterId: 105, Balance: 325, EncounterType: 'Current', InsuranceEstimates: [{ EstInsurance: 155, AdjEst: 25.00 }],
                        encounterHasFeeScheduleAdjustments: false, CreateClaim: true
                    },];
                const summaryTotals = patientCheckoutService.getCheckoutTotals(serviceAndDebitTransactionDtos, encounterId, priorBalances, creditTransactionDtoList, totalFeeScheduleAdjustment, includePriorBalance);
                expect(summaryTotals.todaysVisitAmount).toBe(550);
                expect(summaryTotals.totalEstimatedInsurance).toBe(330);
                expect(summaryTotals.totalCharges).toBe(220);

            });

        it('should return summaryTotals.todaysCharges equals to sum of todaysVisitAmount minus estimatedInsuranceTotal if includePriorBalance is false' +
            ' serviceAndDebitTransactionDtos is not empty list and serviceTransaction is not in priorBalances list and encounterId is null ' +
            ' and serviceTransaction.encounterHasFeeScheduleAdjustments is true', () => {
                const encounterId = null;
                const includePriorBalance = false;
                priorBalances = [{ Charges: 150.00, EncounterId: 200 },
                { Charges: 150.00, EncounterId: 101 },];
                serviceAndDebitTransactionDtos = [
                    { DueNow: 150.00, Charges: 150.00, EncounterId: 100 },
                    { DueNow: 150.00, Charges: 150.00, EncounterId: 101 },
                    {
                        DueNow: 175.00, Charges: 175.00, EncounterId: 102, Balance: 325, EncounterType: 'Current', InsuranceEstimates: [{ EstInsurance: 125.00, AdjEst: 25.00 }],
                        encounterHasFeeScheduleAdjustments: true, CreateClaim: true
                    },
                    {
                        DueNow: 150.00, Charges: 225.00, EncounterId: 105, Balance: 325, EncounterType: 'Current', InsuranceEstimates: [{ EstInsurance: 155, AdjEst: 25.00 }],
                        encounterHasFeeScheduleAdjustments: true, CreateClaim: true
                    },];
                const summaryTotals = patientCheckoutService.getCheckoutTotals(serviceAndDebitTransactionDtos, encounterId, priorBalances, creditTransactionDtoList, totalFeeScheduleAdjustment, includePriorBalance);
                expect(summaryTotals.todaysVisitAmount).toBe(550);
                expect(summaryTotals.totalEstimatedInsurance).toBe(280);
                expect(summaryTotals.totalCharges).toBe(270);

            });

        it('should return summaryTotals.todaysCharges equals to sum of todaysVisitAmount plus totalPriorBalance minus estimatedInsuranceTotal if includePriorBalance is true' +
            ' serviceAndDebitTransactionDtos is not empty list and serviceTransaction is not in priorBalances list and encounterId is null ' +
            ' and serviceTransaction.encounterHasFeeScheduleAdjustments is true', () => {
                const encounterId = null;
                const includePriorBalance = true;
                priorBalances = [{ Charges: 150.00, EncounterId: 200, Balance: 120.00, PatientBalance: 120.00 },
                { Charges: 150.00, EncounterId: 101, Balance: 120.00, PatientBalance: 120.00 },];

                serviceAndDebitTransactionDtos = [
                    {
                        Charges: 0, EncounterId: 106, Balance: 325, EncounterType: 'Prior', PatientBalance: 200.00,
                        InsuranceEstimates: [{ EstInsurance: 125.00, AdjEst: 25.00 }],
                        encounterHasFeeScheduleAdjustments: false, CreateClaim: false
                    },
                    {
                        Charges: 0, EncounterId: 103, Balance: 325, EncounterType: 'Prior', PatientBalance: 200.00,
                        InsuranceEstimates: [{ EstInsurance: 125.00, AdjEst: 25.00 }],
                        encounterHasFeeScheduleAdjustments: false, CreateClaim: false
                    },
                    {
                        Charges: 175.00, EncounterId: 102, Balance: 325, EncounterType: 'Current', PatientBalance: 50,
                        InsuranceEstimates: [{ EstInsurance: 125.00, AdjEst: 25.00 }],
                        encounterHasFeeScheduleAdjustments: true, CreateClaim: true
                    },
                    {
                        Charges: 225.00, EncounterId: 105, Balance: 325, EncounterType: 'Current', PatientBalance: 70.00,
                        InsuranceEstimates: [{ EstInsurance: 155, AdjEst: 25.00 }],
                        encounterHasFeeScheduleAdjustments: true, CreateClaim: true
                    },];

                const summaryTotals = patientCheckoutService.getCheckoutTotals(serviceAndDebitTransactionDtos,
                    encounterId, priorBalances, creditTransactionDtoList, totalFeeScheduleAdjustment, includePriorBalance);
                expect(summaryTotals.todaysVisitAmount).toBe(400);
                expect(summaryTotals.totalEstimatedInsurance).toBe(280);
                expect(summaryTotals.totalPriorBalanceDue).toBe(400);
                // todaysVisitAmount + totalCharges - totalEstimatedInsurance
                expect(summaryTotals.totalCharges).toBe(520.00);

            });

        it('should return summaryTotals.totalUnappliedCredit equals to sum of the creditTransactionDtoList.Amounts where ' +
            'TransactionTypeId equals TransactionTypes.CreditPayment ', () => {
                const encounterId = null;
                const includePriorBalance = false;
                creditTransactionDtoList = [
                    { Amount: 100, TransactionTypeId: TransactionTypes.CreditPayment },
                    { Amount: 70, TransactionTypeId: TransactionTypes.Payment },
                    { Amount: 25, TransactionTypeId: TransactionTypes.CreditPayment },
                    { Amount: 75, TransactionTypeId: TransactionTypes.Payment }
                ];
                priorBalances = [
                    { Charges: 150.00, EncounterId: 200 },
                    { Charges: 150.00, EncounterId: 101 },];
                serviceAndDebitTransactionDtos = [
                    { DueNow: 150.00, Charges: 150.00, EncounterId: 100 },
                    { DueNow: 150.00, Charges: 150.00, EncounterId: 101 },
                    {
                        DueNow: 175.00, Charges: 175.00, EncounterId: 102, Balance: 325, EncounterType: 'Current',
                        InsuranceEstimates: [{ EstInsurance: 125.00, AdjEst: 25.00 }],
                        encounterHasFeeScheduleAdjustments: true, CreateClaim: true
                    },
                    {
                        DueNow: 150.00, Charges: 225.00, EncounterId: 105, Balance: 325, EncounterType: 'Current',
                        InsuranceEstimates: [{ EstInsurance: 155, AdjEst: 25.00 }],
                        encounterHasFeeScheduleAdjustments: true, CreateClaim: true
                    },];
                const summaryTotals = patientCheckoutService.getCheckoutTotals(serviceAndDebitTransactionDtos, encounterId,
                    priorBalances, creditTransactionDtoList, totalFeeScheduleAdjustment, includePriorBalance);
                expect(summaryTotals.totalUnappliedCredit).toBe(125);
            });

        it('should return summaryTotals.totalCreditsPaymentsAdjustments equals to sum of the creditTransactionDtoList.Amounts ', () => {
            const encounterId = null;
            const includePriorBalance = false;
            creditTransactionDtoList = [
                { Amount: 100, TransactionTypeId: TransactionTypes.CreditPayment },
                { Amount: 70, TransactionTypeId: TransactionTypes.Payment },
                { Amount: 25, TransactionTypeId: TransactionTypes.CreditPayment },
                { Amount: 75, TransactionTypeId: TransactionTypes.Payment }
            ];
            priorBalances = [
                { Charges: 150.00, EncounterId: 200 },
                { Charges: 150.00, EncounterId: 101 },];
            serviceAndDebitTransactionDtos = [
                { DueNow: 150.00, Charges: 150.00, EncounterId: 100 },
                { DueNow: 150.00, Charges: 150.00, EncounterId: 101 },
                {
                    DueNow: 175.00, Charges: 175.00, EncounterId: 102, Balance: 325, EncounterType: 'Current',
                    InsuranceEstimates: [{ EstInsurance: 125.00, AdjEst: 25.00 }],
                    encounterHasFeeScheduleAdjustments: true, CreateClaim: true
                },
                {
                    DueNow: 150.00, Charges: 225.00, EncounterId: 105, Balance: 325, EncounterType: 'Current',
                    InsuranceEstimates: [{ EstInsurance: 155, AdjEst: 25.00 }],
                    encounterHasFeeScheduleAdjustments: true, CreateClaim: true
                },];
            const summaryTotals = patientCheckoutService.getCheckoutTotals(serviceAndDebitTransactionDtos, encounterId,
                priorBalances, creditTransactionDtoList, totalFeeScheduleAdjustment, includePriorBalance);
            expect(summaryTotals.totalCreditsPaymentsAdjustments).toBe(270);

        });

    });



    describe('isAnUnappliedCreditTransactionDetail', () => {
        let mockCreditTransactionDetail;
        beforeEach(() => {
            mockCreditTransactionDetail = {
                IsDeleted: false,
                AccountMemberId: '1234',
                CreditTransactionId: 1234,
                CreditTransactionDetailId: 2345,
                AppliedToServiceTransationId: null,
                AppliedToDebitTransactionId: null,
                EncounterId: null,
                Amount: 75.00,
                DateEntered: '2020-09-09'
            };
        });

        it('should return true if this is an unapplied creditTransactionDetail', () => {
            const creditTransactionDetail = Object.assign(mockCreditTransactionDetail);
            expect(patientCheckoutService.isAnUnappliedCreditTransactionDetail(creditTransactionDetail)).toBe(true);
        });

        it('should return false if creditTransactionDetail.AppliedToServiceTransationId is not null', () => {
            const creditTransactionDetail = Object.assign(mockCreditTransactionDetail);
            creditTransactionDetail.AppliedToServiceTransationId = '1234';
            expect(patientCheckoutService.isAnUnappliedCreditTransactionDetail(creditTransactionDetail)).toBe(false);
        });

        it('should return false if creditTransactionDetail.AppliedToDebitTransactionId is not null', () => {
            const creditTransactionDetail = Object.assign(mockCreditTransactionDetail);
            creditTransactionDetail.AppliedToDebitTransactionId = '1234';
            expect(patientCheckoutService.isAnUnappliedCreditTransactionDetail(creditTransactionDetail)).toBe(false);
        });

        it('should return false if creditTransactionDetail.IsDeleted is not null', () => {
            const creditTransactionDetail = Object.assign(mockCreditTransactionDetail);
            creditTransactionDetail.IsDeleted = true;
            expect(patientCheckoutService.isAnUnappliedCreditTransactionDetail(creditTransactionDetail)).toBe(false);
        });
    });

    describe('checkForAffectedAreaChanges', () => {
        let mockServiceTransactions = [];
        const mockServiceCodes = [{ ServiceCodeId: '1234', AffectedAreaId: 1 },
        { ServiceCodeId: '2234', AffectedAreaId: 2 },
        { ServiceCodeId: '3234', AffectedAreaId: 3 },
        { ServiceCodeId: '4234', AffectedAreaId: 4 },
        { ServiceCodeId: '5234', AffectedAreaId: 5 },
        ];

        beforeEach(() => {
            mockServiceTransactions = [];
        });

        // Affected Area = 1 mouth

        it('should add serviceCode to serviceCodesThatNeedUpdated if has serviceTransaction has Surface or Root or Tooth ' +
            'when AffectedArea is mouth', () => {
                mockServiceTransactions = [{ ServiceCodeId: '1234', Surface: null, Tooth: null, Roots: 'DB,P,MB' }];
                let result = patientCheckoutService.checkForAffectedAreaChanges(mockServiceTransactions, mockServiceCodes);
                expect(result[0].ServiceCodeId).toBe('1234');

                mockServiceTransactions = [{ ServiceCodeId: '1234', Surface: null, Tooth: 1, Roots: null }];
                result = patientCheckoutService.checkForAffectedAreaChanges(mockServiceTransactions, mockServiceCodes);
                expect(result[0].ServiceCodeId).toBe('1234');

                mockServiceTransactions = [{ ServiceCodeId: '1234', Surface: 'M,I', Tooth: null, Roots: null }];
                result = patientCheckoutService.checkForAffectedAreaChanges(mockServiceTransactions, mockServiceCodes);
                expect(result[0].ServiceCodeId).toBe('1234');
            });

        it('should not add serviceCode to serviceCodesThatNeedUpdated ' +
            'if has serviceTransaction Tooth and surface and Root are empty when AffectedArea is mouth', () => {
                mockServiceTransactions = [{ ServiceCodeId: '1234', Surface: null, Tooth: null, Roots: null }];
                const result = patientCheckoutService.checkForAffectedAreaChanges(mockServiceTransactions, mockServiceCodes);
                expect(result.length).toEqual(0);
            });

        // AffectedAreaId = 3 Root

        it('should add serviceCode to serviceCodesThatNeedUpdated if serviceTransaction ' +
            'does not have Tooth and Root when AffectedArea is Root', () => {
                mockServiceTransactions = [{ ServiceCodeId: '3234', Surface: null, Tooth: null, Roots: 'DB,P,MB' }];
                let result = patientCheckoutService.checkForAffectedAreaChanges(mockServiceTransactions, mockServiceCodes);
                expect(result[0].ServiceCodeId).toBe('3234');

                mockServiceTransactions = [{ ServiceCodeId: '3234', Surface: null, Tooth: 1, Roots: null }];
                result = patientCheckoutService.checkForAffectedAreaChanges(mockServiceTransactions, mockServiceCodes);
                expect(result[0].ServiceCodeId).toBe('3234');
            });

        it('should add serviceCode to serviceCodesThatNeedUpdated if serviceTransaction has a surface when AffectedArea is Root', () => {
            mockServiceTransactions = [{ ServiceCodeId: '3234', Surface: 'M,I', Tooth: 1, Roots: 'DB,P,MB' }];
            const result = patientCheckoutService.checkForAffectedAreaChanges(mockServiceTransactions, mockServiceCodes);
            expect(result[0].ServiceCodeId).toBe('3234');
        });

        it('should not add serviceCode to serviceCodesThatNeedUpdated' +
            ' if serviceTransaction has a Tooth and Roots and surface is empty when AffectedArea is Root', () => {
                mockServiceTransactions = [{ ServiceCodeId: '3234', Surface: null, Tooth: 1, Roots: 'DB,P,MB' }];
                const result = patientCheckoutService.checkForAffectedAreaChanges(mockServiceTransactions, mockServiceCodes);
                expect(result.length).toEqual(0);
            });

        // AffectedAreaId = 4 Surface

        it('should add serviceCode to serviceCodesThatNeedUpdated if serviceTransaction ' +
            'does not have Tooth and Surface when AffectedArea is Surface', () => {
                mockServiceTransactions = [{ ServiceCodeId: '4234', Surface: 'M,I', Tooth: null, Roots: null }];
                let result = patientCheckoutService.checkForAffectedAreaChanges(mockServiceTransactions, mockServiceCodes);
                expect(result[0].ServiceCodeId).toBe('4234');

                mockServiceTransactions = [{ ServiceCodeId: '4234', Surface: null, Tooth: 1, Roots: null }];
                result = patientCheckoutService.checkForAffectedAreaChanges(mockServiceTransactions, mockServiceCodes);
                expect(result[0].ServiceCodeId).toBe('4234');
            });

        it('should add serviceCode to serviceCodesThatNeedUpdated if serviceTransaction has Roots when AffectedArea is Surface', () => {
            mockServiceTransactions = [{ ServiceCodeId: '4234', Surface: 'M,I', Tooth: 1, Roots: 'DB,P,MB' }];
            const result = patientCheckoutService.checkForAffectedAreaChanges(mockServiceTransactions, mockServiceCodes);
            expect(result[0].ServiceCodeId).toBe('4234');
        });

        it('should not add serviceCode to serviceCodesThatNeedUpdated' +
            ' if serviceTransaction has a Tooth and Surface and Roots is empty when AffectedArea is Surface', () => {
                mockServiceTransactions = [{ ServiceCodeId: '4234', Surface: 'M,I', Tooth: 1, Roots: null }];
                const result = patientCheckoutService.checkForAffectedAreaChanges(mockServiceTransactions, mockServiceCodes);
                expect(result.length).toEqual(0);
            });

        // AffectedAreaId = 5 Tooth

        it('should add serviceCode to serviceCodesThatNeedUpdated if serviceTransaction ' +
            'does not have Tooth when AffectedArea is Tooth', () => {
                mockServiceTransactions = [{ ServiceCodeId: '5234', Surface: null, Tooth: null, Roots: null }];
                const result = patientCheckoutService.checkForAffectedAreaChanges(mockServiceTransactions, mockServiceCodes);
                expect(result[0].ServiceCodeId).toBe('5234');
            });

        it('should add serviceCode to serviceCodesThatNeedUpdated if ' +
            ' serviceTransaction has Roots or Surface when AffectedArea is Tooth', () => {
                mockServiceTransactions = [{ ServiceCodeId: '5234', Surface: null, Tooth: 1, Roots: 'DB,P,MB' }];
                let result = patientCheckoutService.checkForAffectedAreaChanges(mockServiceTransactions, mockServiceCodes);
                expect(result[0].ServiceCodeId).toBe('5234');

                mockServiceTransactions = [{ ServiceCodeId: '5234', Surface: 'M,I', Tooth: 1, Roots: null }];
                result = patientCheckoutService.checkForAffectedAreaChanges(mockServiceTransactions, mockServiceCodes);
                expect(result[0].ServiceCodeId).toBe('5234');
            });

        it('should not add serviceCode to serviceCodesThatNeedUpdated' +
            ' if serviceTransaction has a Tooth and Surface and Roots are empty when AffectedArea is Surface', () => {
                mockServiceTransactions = [{ ServiceCodeId: '5234', Surface: null, Tooth: 1, Roots: null }];
                const result = patientCheckoutService.checkForAffectedAreaChanges(mockServiceTransactions, mockServiceCodes);
                expect(result.length).toEqual(0);
            });
    });

    describe('setCreditTransactionOriginalPosition', () => {
        let mockCreditTransaction;

        beforeEach(() => {
            mockCreditTransaction = {
                IsDeleted: false,
                AccountMemberId: '1234',
                CreditTransactionId: null,
                Amount: 75.00,
                DateEntered: '2020-09-09',
                OriginalPosition: null,
            };
        });

        it('should set OriginalPosition to max OriginalOrder plus one  on a creditTransaction based on creditTransactionsList', () => {
            const creditTransactionList = [{ OriginalPosition: 1 }, { OriginalPosition: 2 }, { OriginalPosition: 3 }];
            const creditTransaction = cloneDeep(mockCreditTransaction);
            expect(creditTransactionList.length).toBe(3);
            patientCheckoutService.setCreditTransactionOriginalPosition(creditTransaction, creditTransactionList);
            expect(creditTransaction.OriginalPosition).toBe(4);
        });

        it('should set OriginalPosition on a creditTransaction based on creditTransactionsList that are out of sequence', () => {
            const creditTransaction = cloneDeep(mockCreditTransaction);
            const creditTransactionList = [{ OriginalPosition: 1 }, { OriginalPosition: 3 }, { OriginalPosition: 5 }];
            expect(creditTransactionList.length).toBe(3);
            patientCheckoutService.setCreditTransactionOriginalPosition(creditTransaction, creditTransactionList);
            expect(creditTransaction.OriginalPosition).toBe(6);
        });

        it('should set OriginalPosition on a creditTransaction based on creditTransactionsList that are out of order', () => {
            const creditTransaction = cloneDeep(mockCreditTransaction);
            const creditTransactionList = [{ OriginalPosition: 1 }, { OriginalPosition: 6 }, { OriginalPosition: 2 }];
            expect(creditTransactionList.length).toBe(3);
            patientCheckoutService.setCreditTransactionOriginalPosition(creditTransaction, creditTransactionList);
            expect(creditTransaction.OriginalPosition).toBe(7);
        });

        it('should set OriginalPosition to one if creditTransactionsList is empty', () => {
            const creditTransaction = cloneDeep(mockCreditTransaction);
            const creditTransactionList = [];
            expect(creditTransactionList.length).toBe(0);
            patientCheckoutService.setCreditTransactionOriginalPosition(creditTransaction, creditTransactionList);
            expect(creditTransaction.OriginalPosition).toBe(1);
        });
    });

    describe('initializeCreditTransaction', () => {
        let accountId;
        let locationId;
        const creditTransaction = new CreditTransaction();
        beforeEach(() => {
            accountId = '1234';
            locationId = 2;
        });

        it('should return a new object of type CreditTransaction with AccountId and LocationId set to params', () => {
            creditTransaction.AccountId = accountId;
            creditTransaction.LocationId = locationId;
            const result = patientCheckoutService.initializeCreditTransaction(accountId, locationId);
            expect(result instanceof CreditTransaction).toBe(true);
        });

        it('should return a new object of type CreditTransaction with AccountId and LocationId set to params', () => {
            creditTransaction.AccountId = accountId;
            creditTransaction.LocationId = locationId;
            const result = patientCheckoutService.initializeCreditTransaction(accountId, locationId);
            expect(result.AccountId).toEqual(accountId);
            expect(result.LocationId).toEqual(locationId);
        });

        it('should set LocationId to null if no locationId parameter', () => {
            expect(patientCheckoutService.initializeCreditTransaction(accountId, null).LocationId).toEqual(null);
        });
    });



    describe('resetCurrentCreditTransaction', () => {
        let creditTransactionList;
        let creditTransaction;
        beforeEach(() => {
            creditTransactionList = [{
                Amount: 40., IsFeeScheduleWriteOff: true, AccountMemberId: 1234,
                Location: 3,
                OriginalPosition: 1,
                CreditTransactionDetails: [{
                    Amount: 40, AppliedToServiceTransationId: 1234,
                }]
            }, {
                Amount: 40., IsFeeScheduleWriteOff: true, AccountMemberId: 1234,
                Location: 3,
                OriginalPosition: 1,
                CreditTransactionDetails: [{
                    Amount: 40, AppliedToServiceTransationId: 1234,
                }]
            },];
            creditTransaction = new CreditTransaction();
            creditTransaction.AccountId = '1234';
            creditTransaction.LocationId = 2;
            creditTransaction.CreditTransactionDetails = [{}, {}];
            spyOn(patientCheckoutService, 'setCreditTransactionOriginalPosition');
        });

        it('should reload new component.creditTransactionDto with current CreditTransactionDetails', () => {
            patientCheckoutService.resetCurrentCreditTransaction(creditTransaction, creditTransactionList);
            expect(creditTransaction.AccountId).toEqual('1234');
            expect(creditTransaction.LocationId).toEqual(2);
            expect(creditTransaction.Amount).toEqual(0);
            expect(creditTransaction.CreditTransactionDetails.length).toEqual(2);
        });

        it('should call setCreditTransactionOriginalPosition', () => {
            patientCheckoutService.resetCurrentCreditTransaction(creditTransaction, creditTransactionList);
            expect(patientCheckoutService.setCreditTransactionOriginalPosition)
                .toHaveBeenCalledWith(creditTransaction, creditTransactionList);
        });
    });

    describe('calculateServiceTransactionAmounts method', () => {
        let serviceTransaction;
        beforeEach(() => {
            serviceTransaction = {
                LocationId: 12, Code: '', Description: 'D6750;	crown - porcelain fused to high noble metal', Fee: 200,
                DueNow: 200, Adjustment: 0, EncounterId: '1236', AccountMemberId: '1235', ServiceTransactionId: '1111', Discount: 0,
                Tax: 10.00, ServiceCodeId: '1236', TotalAdjEstimate: 0, Balance: 200, Amount: 200, AdjustmentAmount: 0, isAdjustment: false,
                canCreateClaim: true, CreateClaim: false,
                InsuranceEstimates: [{ AdjEst: 20, EstInsurance: 120 }]
            };
        });

        it('should calculate serviceTransaction.Charges based on Fee, Discount, and Tax', () => {
            serviceTransaction.Fee = 200;
            serviceTransaction.Discount = 20;
            serviceTransaction.Tax = 12.50;
            patientCheckoutService.calculateServiceTransactionAmounts(serviceTransaction);
            expect(serviceTransaction.Charges).toBe(192.50);
        });



        it('should calculate serviceTransaction.DueNow based on PatientBalance minus AdjustmentAmount', () => {
            serviceTransaction.Fee = 200;
            serviceTransaction.Balance = 80.00;
            serviceTransaction.Discount = 20;
            serviceTransaction.Tax = 12.50;
            serviceTransaction.AdjustmentAmount = 30.00;
            serviceTransaction.CreateClaim = false;
            serviceTransaction.InsuranceEstimates = [{ AdjEst: 20, EstInsurance: 120, AdjustmentAmount: 0 }];

            patientCheckoutService.calculateServiceTransactionAmounts(serviceTransaction);
            expect(serviceTransaction.PatientBalance).toBe(220.00);
            expect(serviceTransaction.AdjustmentAmount).toBe(30.00);
            expect(serviceTransaction.DueNow).toBe(190.00);
        });

        it('should calculate serviceTransaction.PatientBalance to equal serviceTransaction.Balance' +
            'plus InsuranceEstimates.EstInsurance and AdjEst if CreateClaims is false', () => {
                serviceTransaction.Fee = 200;
                serviceTransaction.Balance = 60.00;
                serviceTransaction.Discount = 20;
                serviceTransaction.Tax = 12.50;
                serviceTransaction.CreateClaim = false;
                serviceTransaction.InsuranceEstimates = [{ AdjEst: 20, EstInsurance: 120, AdjustmentAmount: 0 }];

                patientCheckoutService.calculateServiceTransactionAmounts(serviceTransaction);
                expect(serviceTransaction.PatientBalance).toBe(200.00);
            });


        it('should calculate serviceTransaction.PatientBalance to equal serviceTransaction.Balance if CreateClaims is true', () => {
            serviceTransaction.Fee = 200;
            serviceTransaction.Balance = 60.00;
            serviceTransaction.Discount = 20;
            serviceTransaction.Tax = 12.50;
            serviceTransaction.CreateClaim = true;
            serviceTransaction.InsuranceEstimates = [{ AdjEst: 20, EstInsurance: 120, AdjustmentAmount: 0 }];

            patientCheckoutService.calculateServiceTransactionAmounts(serviceTransaction);
            expect(serviceTransaction.PatientBalance).toBe(60.00);
        });

        it('should calculate serviceTransaction.PatientBalance to equal serviceTransaction.Balance no InsuranceEstimates', () => {
            serviceTransaction.Fee = 200;
            serviceTransaction.Balance = 200.00;
            serviceTransaction.Discount = 20;
            serviceTransaction.Tax = 12.50;
            serviceTransaction.CreateClaim = true;
            serviceTransaction.InsuranceEstimates = [];

            patientCheckoutService.calculateServiceTransactionAmounts(serviceTransaction);
            expect(serviceTransaction.PatientBalance).toBe(200.00);
        });
    });

});
