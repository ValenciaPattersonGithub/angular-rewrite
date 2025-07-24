import { PatientCheckoutSummaryComponent } from './patient-checkout-summary.component';
import { TranslateService } from '@ngx-translate/core';
import { ConfirmationModalService } from 'src/@shared/components/confirmation-modal/confirmation-modal.service';
import { TransactionTypes } from 'src/@shared/models/transaction-enum';
import { fakeAsync, tick } from '@angular/core/testing';
import { CurrencyPipe } from '@angular/common';

describe('PatientCheckoutSummaryComponent', () => {
    let component: PatientCheckoutSummaryComponent;
    let mockAdjustmentTypesService;

    let mockDiscardChangesService: any;
    let mockBenefitPlanA;
    let mockBenefitPlanB;
    let mockAllEncounters;
    let cancelConfirmationData;
    let mockDialogRef;
    let mockConfirmationModalService;
    let mockTranslateService;
    let mockConfirmationModalSubscription;
    let mockToastrFactory;

    // mock the currency Pipe
    let mockCurrencyPipe: CurrencyPipe;

    beforeEach(() => {
        mockDiscardChangesService = {
            onRegisterController: jasmine.createSpy(),
            currentChangeRegistration: {
                hasChanges: false,
                controller: ''
            }
        };

        mockBenefitPlanA = {
            PatientId: '2345', BenefitPlanId: 5, PatientBenefitPlanId: 10, Priority: 0,
            PolicyHolderBenefitPlanDto:
                { BenefitPlanDto: { Name: 'Plan5', Carrier: { Name: 'Carrier5' }, ApplyAdjustments: 1, FeesIns: 2 } }
        };
        mockBenefitPlanB = {
            PatientId: '2346', BenefitPlanId: 6, PatientBenefitPlanId: 11, Priority: 0,
            PolicyHolderBenefitPlanDto:
                { BenefitPlanDto: { Name: 'Plan6', Carrier: { Name: 'Carrier6' }, ApplyAdjustments: 1, FeesIns: 2 } }
        };

        mockAllEncounters = [
            {
                EncounterId: '100', AccountMemberId: '1235', hasAdjustedEstimate: true, benefitPlan: mockBenefitPlanA, hasFeeScheduleAdjustments: true,
                ServiceTransactionDtos: [
                    {
                        ServiceTransactionId: 1001, EncounterId: '100', ServiceCodeId: '1234', ProviderUserId: '9999', AdjustmentAmount: 0,
                        Balance: 50.00, CreateClaim: true, ProviderOnClaimsId: '123456', Charges: 120.00,
                        InsuranceEstimates: [{
                            AdjEst: 0,
                            TotalEstInsurance: 70,
                            TotalAdjEstimate: 0,
                            EstInsurance: 70,
                            PatientBenefitPlanId: '10',
                        },]
                    },
                    {
                        ServiceTransactionId: 1006, EncounterId: '100', ServiceCodeId: '1234', ProviderUserId: '9999', AdjustmentAmount: 0,
                        Balance: 50.00, CreateClaim: true, ProviderOnClaimsId: '123456', Charges: 120.00,
                        InsuranceEstimates: [{
                            AdjEst: 10,
                            TotalEstInsurance: 80,
                            TotalAdjEstimate: 10,
                            EstInsurance: 80,
                            PatientBenefitPlanId: '10',
                        },]
                    },
                    {
                        ServiceTransactionId: 1002, EncounterId: '100', ServiceCodeId: '1236', ProviderUserId: '9999', AdjustmentAmount: 0,
                        Balance: 25.00, CreateClaim: true, ProviderOnClaimsId: '123457', Charges: 110.00,
                        InsuranceEstimates: [{
                            AdjEst: 0,
                            TotalEstInsurance: 85,
                            TotalAdjEstimate: 0,
                            EstInsurance: 85,
                            PatientBenefitPlanId: '10',
                        }, {
                            AdjEst: 10,
                            TotalEstInsurance: 50,
                            TotalAdjEstimate: 10,
                            EstInsurance: 50,
                            PatientBenefitPlanId: '10',
                        },]
                    },
                ]
            },
            {
                EncounterId: '101', AccountMemberId: '1234', hasAdjustedEstimate: true, benefitPlan: mockBenefitPlanB, hasFeeScheduleAdjustments: false,
                ServiceTransactionDtos: [
                    {
                        ServiceTransactionId: 1003, EncounterId: '101', ServiceCodeId: '1235', ProviderUserId: '8888', AdjustmentAmount: null, Charges: 120.00,
                        Balance: 30.00, CreateClaim: true, ProviderOnClaimsId: '123457',
                        InsuranceEstimates: [{
                            AdjEst: 0,
                            TotalEstInsurance: 90,
                            TotalAdjEstimate: 0,
                            EstInsurance: 90,
                            PatientBenefitPlanId: '11',
                        }]
                    },
                    {
                        ServiceTransactionId: 1004, EncounterId: '101', ServiceCodeId: '1237', ProviderUserId: '8888', AdjustmentAmount: 0, Charges: 120.00,
                        Balance: 50.00, CreateClaim: true, ProviderOnClaimsId: '123456',
                        InsuranceEstimates: [{
                            AdjEst: 0,
                            TotalEstInsurance: 70,
                            TotalAdjEstimate: 0,
                            EstInsurance: 70,
                            PatientBenefitPlanId: '11',
                        }, {
                            AdjEst: 0,
                            TotalEstInsurance: 50,
                            TotalAdjEstimate: 0,
                            EstInsurance: 50,
                            PatientBenefitPlanId: '11',
                        },]
                    },
                ]
            },
            {
                EncounterId: '102', AccountMemberId: '1234', hasAdjustedEstimate: true, benefitPlan: mockBenefitPlanA, hasFeeScheduleAdjustments: false,
                ServiceTransactionDtos: [
                    {
                        ServiceTransactionId: 1005, EncounterId: '102', ServiceCodeId: '1239', ProviderUserId: '8888', AdjustmentAmount: null, Charges: 120.00,
                        Balance: 30.00, CreateClaim: false, ProviderOnClaimsId: '123458',
                        InsuranceEstimates: [{
                            AdjEst: 0,
                            EstInsurance: 90,
                            PatientBenefitPlanId: '10',
                        }]
                    },
                    {
                        ServiceTransactionId: 1006, ServiceCodeId: '1231', ProviderUserId: '8888', AdjustmentAmount: 0, InsuranceEstimates: [], Charges: 50.00,
                        CreateClaim: false, ProviderOnClaimsId: '123456', Balance: 50.00
                    },
                ]
            },
        ];

        cancelConfirmationData = {
        };

        mockDialogRef = {
            events: {
                pipe: jasmine.createSpy().and.returnValue({ subscribe: jasmine.createSpy() }),
                // subscribe: jasmine.createSpy(),
                // unsubscribe: jasmine.createSpy(),
            },
            subscribe: jasmine.createSpy(),
            unsubscribe: jasmine.createSpy(),
            _subscriptions: jasmine.createSpy(),
            _parentOrParents: jasmine.createSpy(),
            closed: jasmine.createSpy(),
        };

        mockConfirmationModalService = jasmine.createSpyObj<ConfirmationModalService>('mockConfirmationModalService', ['open']);

        mockTranslateService = jasmine.createSpyObj<TranslateService>('TranslateService', ['instant']);

        mockConfirmationModalSubscription = {
            subscribe: jasmine.createSpy(),
            unsubscribe: jasmine.createSpy(),
            _subscriptions: jasmine.createSpy(),
            _parentOrParents: jasmine.createSpy(),
            closed: jasmine.createSpy(),
        };

        mockAdjustmentTypesService = {
            get: jasmine.createSpy().and.callFake((array) => {
                return {
                    then(callback) {
                        callback(array);
                    }
                };
            })
        };

        mockToastrFactory = {
            success: jasmine.createSpy('toastrFactory.success'),
            error: jasmine.createSpy('toastrFactory.error')
        };

        mockCurrencyPipe = new CurrencyPipe('100');
    });

    beforeEach(() => {

        component = new PatientCheckoutSummaryComponent(
            mockTranslateService,
            mockCurrencyPipe,
            mockToastrFactory,
            mockAdjustmentTypesService,
            mockConfirmationModalService,
            mockDiscardChangesService
        );
        component.patientInfo = {
            PersonAccount: { AccountId: '1234', PersonAccountMember: { AccountMemberId: '1234' } }
        };
        component.isDisabled = false;
        component.creditTransactionDtoList = [];
        component.unappliedAmount = [];
        component.summaryTotals = {};
        component.updateSummary = false;
        component.includePriorBalance = false;
        component.allEncounters = [];
        mockTranslateService.instant = jasmine.createSpy().and.returnValue('mockTranslation');
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    describe('ngOnInit', () => {
        const mockAdjustmentTypes = [
            { IsPositive: true, IsActive: true, IsDefaultTypeOnBenefitPlan: false },
            { IsPositive: false, IsActive: true, IsDefaultTypeOnBenefitPlan: false },
            { IsPositive: false, IsActive: true, IsDefaultTypeOnBenefitPlan: false },
            { IsPositive: false, IsActive: true, IsDefaultTypeOnBenefitPlan: true },];
        beforeEach(() => {
            spyOn(component, 'getNegativeAdjustmentTypes').and.callFake(() => new Promise(() => {
                return {
                    then(callback) {
                        callback(mockAdjustmentTypes);
                    }
                };
            }));
        });

        it('should call getNegativeAdjustmentTypes', () => {
            component.ngOnInit();
            expect(component.getNegativeAdjustmentTypes).toHaveBeenCalled();
        });

        it('should filter return and set negativeAdjustmentTypes to only inclue negative adjustment ' +
            'types after getNegativeAdjustmentTypes resolves', (done) => {
                component.ngOnInit();
                const promise = component.getNegativeAdjustmentTypes();
                promise.then((res) => {
                    expect(component.negativeAdjustmentTypes.length).toBe(3);
                })
                done();
            });
    });

    describe('ngOnChanges', () => {
        const mockAdjustmentTypes = [
            { IsPositive: true, IsActive: true, IsDefaultTypeOnBenefitPlan: false },
            { IsPositive: false, IsActive: true, IsDefaultTypeOnBenefitPlan: false },
            { IsPositive: false, IsActive: true, IsDefaultTypeOnBenefitPlan: false },
            { IsPositive: false, IsActive: true, IsDefaultTypeOnBenefitPlan: true },];
        beforeEach(() => {
            component.summaryTotals = {
                totalPaymentApplied: 1, totalCreditsPaymentsAdjustments: 2, totalPriorBalanceDue: 3, todaysVisitAmount: 4,
                totalEstimatedInsurance: 5, totalCharges: 6, totalBalanceDue: 7
            }




        });

        it('should call updateTotals', () => fakeAsync(() => {
            component.updateTotals = jasmine.createSpy();
            component.ngOnChanges('test');
            tick(100);
            expect(component.updateTotals).toHaveBeenCalled();
        }));

        it('should call updateClaimsTotals', fakeAsync(() => {
            component.updateClaimsTotals = jasmine.createSpy();
            component.ngOnChanges('test');
            tick(100);
            expect(component.updateClaimsTotals).toHaveBeenCalled();
        }));

        it('should call setButtonState', fakeAsync(() => {
            component.setButtonState = jasmine.createSpy();
            component.ngOnChanges('test');
            tick(100);
            expect(component.setButtonState).toHaveBeenCalled();
        }));

        it('should call updateCredits', fakeAsync(() => {
            component.updateCredits = jasmine.createSpy();
            component.ngOnChanges('test');
            tick(100);
            expect(component.updateCredits).toHaveBeenCalled();
        }));

        it('should call createFeeScheduleAdjustmentItems', fakeAsync(() => {
            component.createFeeScheduleAdjustmentItems = jasmine.createSpy();
            component.ngOnChanges('test');
            tick(100);
            expect(component.createFeeScheduleAdjustmentItems).toHaveBeenCalled();
        }));

        it('should set hasCreditCardPayment to false when creditTransactionDtoList does not contain credit card payment', () => {
            component.hasCreditCardPayment = true;
            component.creditTransactionDtoList = [
                { PaymentGatewayTransactionId: '1', TransactionTypeId: TransactionTypes.NegativeAdjustment }
            ];

            component.ngOnChanges('test');
            expect(component.hasCreditCardPayment).toBe(false);
        });

        it('should set hasCreditCardPayment to true when creditTransactionDtoList contains credit card payment and isFinishing is false', () => {
            component.hasCreditCardPayment = false;
            component.isFinishing = false;

            component.creditTransactionDtoList = [
                { PaymentGatewayTransactionId: '1', TransactionTypeId: TransactionTypes.Payment }
            ];

            component.ngOnChanges('test');
            expect(component.hasCreditCardPayment).toBe(true);
        });

        it('should set call registerControllerHasChanges when creditTransactionDtoList contains credit card payment and isFinishing is false', () => {
            component.hasCreditCardPayment = false;
            component.isFinishing = false;
            component.registerControllerHasChanges = jasmine.createSpy();

            component.creditTransactionDtoList = [
                { PaymentGatewayTransactionId: '1', TransactionTypeId: TransactionTypes.Payment }
            ];

            component.ngOnChanges('test');
            expect(component.registerControllerHasChanges).toHaveBeenCalledWith(true);
        });

        it('should set call registerControllerHasChanges when creditTransactionDtoList contains credit card payment and isFinishing is false', () => {
            component.hasCreditCardPayment = false;
            component.isFinishing = true;
            component.registerControllerHasChanges = jasmine.createSpy();

            component.creditTransactionDtoList = [
                { PaymentGatewayTransactionId: '1', TransactionTypeId: TransactionTypes.Payment }
            ];

            component.ngOnChanges('test');
            expect(component.registerControllerHasChanges).not.toHaveBeenCalled();
        });



    });


    describe('removeCreditTransaction', () => {
        let creditTransaction;
        beforeEach(() => {
            creditTransaction = { PaymentGatewayTransactionId: 0 };
        });

        it('should call component.creditTransactionChange.emit when PaymentGatewayTransactionId is not set', () => {
            spyOn(component.creditTransactionChange, 'emit');
            component.removeCreditTransaction(creditTransaction);
            expect(component.creditTransactionChange.emit)
                .toHaveBeenCalledWith({ action: 'removeCredit', creditTransaction });
        });

        it('should call confirmationModal when PaymentGatewayTransactionId is set', () => {
            component.confirmationModalSubscription = Object.assign(mockConfirmationModalSubscription);
            creditTransaction.PaymentGatewayTransactionId = 1;

            mockConfirmationModalService.open = jasmine.createSpy().and.returnValue(mockDialogRef);
            component.removeCreditTransaction(creditTransaction);
            expect(mockConfirmationModalService.open).toHaveBeenCalled();
        });
    });

    describe('removeUnappliedCreditTransaction', () => {
        const unappliedCreditTransaction = {};
        beforeEach(() => {
        });

        it('should call component.creditTransactionChange.emit', () => {
            spyOn(component.creditTransactionChange, 'emit');
            component.removeUnappliedCreditTransaction(unappliedCreditTransaction);
            expect(component.creditTransactionChange.emit)
                .toHaveBeenCalledWith({ action: 'removeUnappliedCredit', creditTransaction: unappliedCreditTransaction });
        });
    });


    describe('removeFeeScheduleAdjustmentItem', () => {
        beforeEach(() => {
            spyOn(component.creditTransactionChange, 'emit');
        })

        it('should call component.creditTransactionChange.emit for each creditTransaction with IsFeeScheduleAdjustment equal true ' +
            ' and matching EncounterId to feeScheduleAdjustmentItem.EncounterId', () => {
                let feeScheduleAdjustmentItem = { EncounterId: '1234', Amount: 120.00, FeeScheduleAdjustmentForEncounterId: '1234', };
                component.removeFeeScheduleAdjustmentItem(feeScheduleAdjustmentItem);
                expect(component.creditTransactionChange.emit)
                    .toHaveBeenCalledWith({ action: 'removeFeeScheduleAdjustmentItem', feeScheduleAdjustmentItem: feeScheduleAdjustmentItem });

            });
    });

    describe('updateClaimsTotals', () => {
        beforeEach(() => {
            component.allEncounters = Object.assign([], mockAllEncounters);
            component.serviceTransactionsToClaims = [];
        });

        it('should include serviceTransations in serviceTransactionsToClaims if CreateClaim is true', () => {
            const encounterWithServicesSetToCreateClaim = component.allEncounters[0];
            // CreateClaim is true
            encounterWithServicesSetToCreateClaim.ServiceTransactionDtos[0].CreateClaim = true;
            // CreateClaim is false
            encounterWithServicesSetToCreateClaim.ServiceTransactionDtos[1].CreateClaim = false;
            component.updateClaimsTotals();
            const findServiceTransaction = component.serviceTransactionsToClaims.find(x => x.ServiceTransactionId ===
                encounterWithServicesSetToCreateClaim.ServiceTransactionDtos[0].ServiceTransactionId);
            expect(encounterWithServicesSetToCreateClaim.ServiceTransactionDtos[0].ServiceTransactionId).toBe(1001);
        });

        it('should not include serviceTransations in serviceTransactionsToClaims if CreateClaim is false', () => {
            const encounterWithServicesSetToCreateClaim = component.allEncounters[0];
            // CreateClaim is true
            encounterWithServicesSetToCreateClaim.ServiceTransactionDtos[0].CreateClaim = true;
            // CreateClaim is false
            encounterWithServicesSetToCreateClaim.ServiceTransactionDtos[1].CreateClaim = false;
            component.updateClaimsTotals();
            const findServiceTransaction = component.serviceTransactionsToClaims.find(x => x.ServiceTransactionId ===
                encounterWithServicesSetToCreateClaim.ServiceTransactionDtos[1].ServiceTransactionId);
            expect(findServiceTransaction).toBe(undefined);

        });

        it('should only include serviceTransations in serviceTransactionsToClaims if encounter has benefitPlan', () => {
            const encounterWithNoBenefitPlan = component.allEncounters[0];
            encounterWithNoBenefitPlan.benefitPlan = null;
            component.updateClaimsTotals();
            // none of these transactions will be included in component.serviceTransactionsToClaims
            encounterWithNoBenefitPlan.ServiceTransactionDtos.forEach(serviceTransaction => {
                // tslint:disable-next-line: max-line-length
                const findServiceTransaction = component.serviceTransactionsToClaims.find(x => x.ServiceTransactionId === serviceTransaction.ServiceTransactionId);
                expect(findServiceTransaction).toBe(undefined);
            });
        });


    });

    /*
  Multiple encounters being checked out each encounter can have one patient, multiple benefitPlans, multiple providers
  group by patient, benefitPlan, payment provider
  
  Multiple patients being checked out at once
  Same benefit plan/payer
  Different benefit plans/payers
  Multiple provider (claims) for services on encounter(s)
  
  Rules
  Since there can only be one treating dentist per claim form, if an encounter contains multiple Provider (claim)
  – Fuse will create multiple claims, one per Provider (claim)
    */

    describe('addRemovePriorBalance', () => {
        beforeEach(() => {
            // this will be expanded
            component.includePriorBalance = true;
            spyOn(component, 'updateTotals');
            component.priorBalanceLinkText = 'Remove';
        });
        it('should call component.includePriorBalanceChange.emit', () => {
            spyOn(component.includePriorBalanceChange, 'emit');
            component.addRemovePriorBalance();
            expect(component.includePriorBalanceChange.emit).toHaveBeenCalled();
        });
    });

    describe('cancelCheckout', () => {
        beforeEach(() => {
            component.confirmationModalSubscription = Object.assign(mockConfirmationModalSubscription);
            component.cancelCheckoutWithCreditCardPaymentData = {
                header: 'Warning',
                message: 'test1',
                message2: 'test1Message2',
                confirm: 'Yes',
                cancel: 'No',
                height: 170,
                width: 350
            };

            component.cancelConfirmationData = {
                header: 'Warning',
                message: 'test2',
                confirm: 'Yes',
                cancel: 'No',
                height: 170,
                width: 350
            };
        });

        it('should call modal to ask user to confirm cancel', () => {
            mockConfirmationModalService.open = jasmine.createSpy().and.returnValue(mockDialogRef);
            component.cancelCheckout();
            expect(mockConfirmationModalService.open).toHaveBeenCalled();
        });

        it('should set modal data to cancelCheckoutWithCreditCardPaymentData', () => {
            mockConfirmationModalService.open = jasmine.createSpy().and.returnValue(mockDialogRef);
            component.hasCreditCardPayment = true;
            component.cancelCheckout();
            expect(mockConfirmationModalService.open).toHaveBeenCalledWith({ data: component.cancelCheckoutWithCreditCardPaymentData });
        });

        it('should set modal data to cancelCheckoutWithCreditCardPaymentData', () => {
            mockConfirmationModalService.open = jasmine.createSpy().and.returnValue(mockDialogRef);
            component.hasCreditCardPayment = false;
            component.cancelCheckout();
            expect(mockConfirmationModalService.open).toHaveBeenCalledWith({ data: component.cancelConfirmationData });
        });
    });

    describe('backToCart', () => {
        let event = { value: undefined };
        beforeEach(() => {
            spyOn(component, 'backToCartPrompt');
            component.cancelConfirmationData = {
                header: 'Warning',
                message: 'test2',
                confirm: 'Yes',
                cancel: 'No',
                height: 170,
                width: 350
            };
            component.confirmationModalSubscription = Object.assign(mockConfirmationModalSubscription);
        });
        it('should call backToCartPrompt with cancelConfirmationData if filteredCreditTransactions length is more than zero', () => {
            component.filteredCreditTransactions = [{}, {}];
            component.backToCart(event);
            expect(component.backToCartPrompt).toHaveBeenCalledWith(component.cancelConfirmationData);
        });

        it('should call cancel.emit with component.selectedEncounterId if filteredCreditTransactions length is zero and event.value is not undefined', () => {
            spyOn(component.cancel, 'emit');
            event.value = '1234';
            component.filteredCreditTransactions = [];
            component.backToCart(event);
            expect(component.selectedEncounterId).toEqual(event.value);
            expect(component.cancel.emit).toHaveBeenCalledWith(component.selectedEncounterId);
        });

        it('should set selectedEncounterId equal to component.encounterId if filteredCreditTransactions length is zero and event.value is undefined', () => {
            spyOn(component.cancel, 'emit');
            component.encounterId = '1234';
            component.filteredCreditTransactions = [];
            component.backToCart(event);
            expect(component.selectedEncounterId).toEqual(component.encounterId);
        });

        it('should call cancel.emit with selectedEncounterId if filteredCreditTransactions length is zero and event.value is undefined', () => {
            spyOn(component.cancel, 'emit');
            component.encounterId = '1234';
            component.filteredCreditTransactions = [];
            component.backToCart(event);
            expect(component.cancel.emit).toHaveBeenCalledWith(component.selectedEncounterId);
        });

        it('should call registerControllerHasChanges with false if filteredCreditTransactions length is zero', () => {
            spyOn(component.cancel, 'emit');
            spyOn(component, 'registerControllerHasChanges');
            component.filteredCreditTransactions = [];
            component.backToCart(event);
            expect(component.registerControllerHasChanges).toHaveBeenCalledWith(false);
        });
    });

    describe('backToCartPrompt', () => {
        beforeEach(() => {
            component.confirmationModalSubscription = Object.assign(mockConfirmationModalSubscription);
            component.filteredCreditTransactions = [{}, {}];
        });

        it('should call modal to ask user to confirm cancel', () => {
            mockConfirmationModalService.open = jasmine.createSpy().and.returnValue(mockDialogRef);
            component.backToCartPrompt(cancelConfirmationData);
            expect(mockConfirmationModalService.open).toHaveBeenCalled();
        });
    });

    describe('setButtonState', () => {

        it('should set priorBalanceLinkText to Remove if includePriorBalance is true', () => {
            component.includePriorBalance = true;
            component.setButtonState();
            expect(component.priorBalanceLinkText).toEqual('Remove');
        });

        it('should set priorBalanceLinkText to Include Prior Balance if includePriorBalance is false', () => {
            component.includePriorBalance = false;
            component.setButtonState();
            expect(component.priorBalanceLinkText).toEqual('Include Prior Balance');
        });
    });

    describe('updateTotals', () => {

        beforeEach(() => {
            mockBenefitPlanA.PatientBenefitPlanId = 101;
            component.allEncounters = [{
                EncounterId: '100', AccountMemberId: '1235', hasAdjustedEstimate: true,
                benefitPlan: mockBenefitPlanA, hasFeeScheduleAdjustments: true,
                ServiceTransactionDtos: [
                    {
                        ServiceTransactionId: 1001, EncounterId: '100', ServiceCodeId: '1234', ProviderUserId: '9999', AdjustmentAmount: 0,
                        Balance: 50.00, CreateClaim: true, ProviderOnClaimsId: '123456', Charges: 120.00,
                        InsuranceEstimates: [{
                            AdjEst: 75,
                            TotalEstInsurance: 70,
                            TotalAdjEstimate: 0,
                            EstInsurance: 70,
                            PatientBenefitPlanId: 101,
                        },]
                    },
                    {
                        ServiceTransactionId: 1006, EncounterId: '100', ServiceCodeId: '1234', ProviderUserId: '9999', AdjustmentAmount: 0,
                        Balance: 50.00, CreateClaim: true, ProviderOnClaimsId: '123456', Charges: 120.00,
                        InsuranceEstimates: [{
                            AdjEst: 0,
                            TotalEstInsurance: 80,
                            TotalAdjEstimate: 10,
                            EstInsurance: 80,
                            PatientBenefitPlanId: 101,
                        },]
                    },
                    {
                        ServiceTransactionId: 1002, EncounterId: '100', ServiceCodeId: '1236', ProviderUserId: '9999', AdjustmentAmount: 0,
                        Balance: 25.00, CreateClaim: true, ProviderOnClaimsId: '123457', Charges: 110.00,
                        InsuranceEstimates: [{
                            AdjEst: 0,
                            TotalEstInsurance: 85,
                            TotalAdjEstimate: 0,
                            EstInsurance: 85,
                            PatientBenefitPlanId: 101,
                        }, {
                            AdjEst: 0,
                            TotalEstInsurance: 50,
                            TotalAdjEstimate: 10,
                            EstInsurance: 50,
                            PatientBenefitPlanId: 102,
                        },]
                    },

                ]
            }];

            component.summaryTotals = {
                todaysVisitAmount: 100,
                totalEstimatedInsurance: 75,
                totalPatientPortion: 25,
                totalCharges: 100,
                totalPaymentApplied: 0,
                totalBalanceDue: 25,
                totalUnappliedCredit: 0,
                totalCreditsPaymentsAdjustments: 0,
                totalPriorBalanceDue: 200
            };
        });

        it('should set totalPayments to equal summaryTotals.totalPaymentApplied', () => {
            component.updateTotals();
            expect(component.totalPaymentAmount).toBe(0.00);
        });

        it('should set priorAccountBalance to equal summaryTotals.totalPriorBalanceDue', () => {
            component.summaryTotals.totalPriorBalanceDue = 75.00;
            component.updateTotals();
            expect(component.priorAccountBalance).toBe(75.00);
        });

        it('should set todaysVisit to equal summaryTotals.todaysVisitAmount', () => {
            component.summaryTotals.todaysVisitAmount = 75.00;
            component.updateTotals();
            expect(component.todaysVisit).toBe(75.00);
        });

        it('should set totalEstimatedInsurance to equal summaryTotals.totalEstimatedInsurance', () => {
            component.summaryTotals.totalEstimatedInsurance = 75.00;
            component.updateTotals();
            expect(component.totalEstimatedInsurance).toBe(75.00);
        });

        it('should set totalCharges to equal summaryTotals.totalCharges', () => {
            component.summaryTotals.totalCharges = 75.00;
            component.updateTotals();
            expect(component.totalCharges).toBe(75.00);
        });

        it('should set totalBalanceDue to equal summaryTotals.totalBalanceDue if includePriorBalance is false', () => {
            component.includePriorBalance = false;
            component.summaryTotals.totalBalanceDue = 150.00;
            component.summaryTotals.totalPriorBalanceDue = 75.00;
            component.updateTotals();
            expect(component.totalBalanceDue).toBe(150.00);
        });

        it('should set totalBalanceDue to equal summaryTotals.totalBalanceDue includePriorBalance is true', () => {
            component.includePriorBalance = true;
            component.summaryTotals.totalBalanceDue = 150.00;
            component.summaryTotals.totalPriorBalanceDue = 75.00;
            component.updateTotals();
            expect(component.totalBalanceDue).toBe(150.00);
        });





        describe('ngOnDestroy function ->', () => {
            beforeEach(() => {
                component.confirmationModalSubscription = Object.assign(mockConfirmationModalSubscription);
            });

            it('should call component.confirmationModalSubscription.unsubscribe', () => {
                component.ngOnDestroy();
                expect(component.confirmationModalSubscription.unsubscribe).toHaveBeenCalled();
            });

            it('should call component.confirmationModalSubscription.unsubscribe', () => {
                component.registerControllerHasChanges = jasmine.createSpy();

                component.ngOnDestroy();
                expect(component.registerControllerHasChanges).toHaveBeenCalledWith(false);
            });
        });

        describe('calculateInsuranceEstimateByTransaction function ->', () => {
            let encounter;
            beforeEach(() => {
                mockBenefitPlanA.PatientBenefitPlanId = 10;
                encounter = {
                    EncounterId: '100', AccountMemberId: '1235', hasAdjustedEstimate: true, benefitPlan: mockBenefitPlanA, hasFeeScheduleAdjustments: true,
                    ServiceTransactionDtos: [
                        {
                            ServiceTransactionId: 1001, EncounterId: '100', ServiceCodeId: '1234', ProviderUserId: '9999', AdjustmentAmount: 0,
                            Balance: 50.00, CreateClaim: true, ProviderOnClaimsId: '123456', Charges: 120.00,
                            InsuranceEstimates: [{
                                AdjEst: 0,
                                TotalEstInsurance: 70,
                                TotalAdjEstimate: 0,
                                EstInsurance: 70,
                                PatientBenefitPlanId: 10,
                            },
                            {
                                AdjEst: 0,
                                TotalEstInsurance: 70,
                                TotalAdjEstimate: 0,
                                EstInsurance: 70,
                                PatientBenefitPlanId: 11,
                            },]
                        },
                    ]
                };
            });

            it('should return estimatedInsuranceTotal for each serviceTransaction in encounter ', () => {
                const serviceTransaction = encounter.ServiceTransactionDtos[0];
                expect(component.calculateInsuranceEstimateByTransaction(serviceTransaction, encounter)).toEqual(140);
            });

            it('should return estimatedInsuranceTotal for each serviceTransaction in encounter ' +
                'to equal 0 if serviceTransaction.CreateClaim is false', () => {
                    const serviceTransaction = encounter.ServiceTransactionDtos[0];
                    serviceTransaction.CreateClaim = false;
                    expect(component.calculateInsuranceEstimateByTransaction(serviceTransaction, encounter)).toEqual(0);
                });

            it('should return estimatedInsuranceTotal for each serviceTransaction in encounter ' +
                'to equal sum of serviceTransaction.EstInsurance plus AdjEst if encounter.hasFeeScheduleAdjustments is false', () => {
                    const serviceTransaction = encounter.ServiceTransactionDtos[0];
                    serviceTransaction.CreateClaim = true;
                    encounter.hasFeeScheduleAdjustments = false;
                    encounter.benefitPlan.PatientBenefitPlanId = 10;
                    serviceTransaction.CreateClaim = true;
                    serviceTransaction.InsuranceEstimates = [{
                        EstInsurance: 100.00, AdjEst: 50.00, PatientBenefitPlanId: 10
                    }, { EstInsurance: 40.00, AdjEst: 10.00, PatientBenefitPlanId: 11 }];
                    expect(component.calculateInsuranceEstimateByTransaction(serviceTransaction, encounter)).toEqual(200);
                });

            it('should return estimatedInsuranceTotal for each serviceTransaction ' +
                ' to equal sum of serviceTransaction.EstInsurance plus AdjEst ' +
                ' if encounter.hasFeeScheduleAdjustments is true and serviceTransaction.CreateClaim is true and ' +
                ' serviceTransaction.InsuranceEstimate.PatientBenefitPlanId = encounter.PatientBenefitPlanId', () => {
                    encounter.hasFeeScheduleAdjustments = true;
                    encounter.benefitPlan.PatientBenefitPlanId = 10;
                    const serviceTransaction = encounter.ServiceTransactionDtos[0];
                    serviceTransaction.CreateClaim = true; serviceTransaction.InsuranceEstimates = [{
                        EstInsurance: 100.00, AdjEst: 50.00, PatientBenefitPlanId: 10
                    }, { EstInsurance: 40.00, AdjEst: 10.00, PatientBenefitPlanId: 11 }];
                    expect(component.calculateInsuranceEstimateByTransaction(serviceTransaction, encounter)).toEqual(150);
                });

            it('should return estimatedInsuranceTotal for each serviceTransaction in encounter ' +
                ' to equal sum of serviceTransaction.EstInsurance plus AdjEst ' +
                ' if encounter.hasFeeScheduleAdjustments is true and serviceTransaction.CreateClaim is true and ' +
                ' serviceTransaction.InsuranceEstimate.PatientBenefitPlanId does not equal encounter.PatientBenefitPlanId ', () => {
                    encounter.hasFeeScheduleAdjustments = true;
                    encounter.benefitPlan.PatientBenefitPlanId = 10;
                    const serviceTransaction = encounter.ServiceTransactionDtos[0];
                    serviceTransaction.CreateClaim = true;
                    serviceTransaction.InsuranceEstimates = [{
                        EstInsurance: 100.00, AdjEst: 50.00, PatientBenefitPlanId: 10
                    }];
                    expect(component.calculateInsuranceEstimateByTransaction(serviceTransaction, encounter)).toEqual(100);
                });
        });

        describe('createFeeScheduleAdjustmentItems', () => {
            beforeEach(() => {
                component.allEncounters = [
                    {
                        EncounterId: '123456789', AccountMemberId: '1235', hasAdjustedEstimate: true,
                        displayDate: '2020-08-04 18:54:48.5599445Z', PatientName: 'Frank Carter',
                        benefitPlan: mockBenefitPlanA, hasFeeScheduleAdjustments: true,
                        ServiceTransactionDtos: []
                    },
                    {
                        EncounterId: '12345678910', AccountMemberId: '1235', hasAdjustedEstimate: true,
                        displayDate: '2020-08-11 18:54:48.5599445Z', PatientName: 'June Carter',
                        benefitPlan: mockBenefitPlanA, hasFeeScheduleAdjustments: true,
                        ServiceTransactionDtos: []
                    },]
                component.creditTransactionDtoList = [
                    { Description: 'Check', Note: '12345', TransactionTypeId: TransactionTypes.Payment, IsFeeScheduleWriteOff: false, FeeScheduleAdjustmentForEncounterId: null },
                    { Description: 'Check', Note: '', TransactionTypeId: TransactionTypes.CreditPayment, IsFeeScheduleWriteOff: false },
                    { Description: 'Cash', Note: '', TransactionTypeId: TransactionTypes.Payment, IsFeeScheduleWriteOff: false },
                    { Description: 'Check', Note: '', TransactionTypeId: TransactionTypes.Payment, IsFeeScheduleWriteOff: false, Amount: 75, },
                    {
                        Description: 'Some Type Of Adjustment', Note: '', TransactionTypeId: TransactionTypes.NegativeAdjustment,
                        IsFeeScheduleWriteOff: false, Amount: 75,
                    },
                    {
                        Description: 'Fee Schedule Adjustment 1', Note: '', TransactionTypeId: TransactionTypes.NegativeAdjustment, Amount: 75,
                        IsFeeScheduleWriteOff: true, FeeScheduleAdjustmentForEncounterId: '123456789'
                    },
                    {
                        Description: 'Fee Schedule Adjustment 2', Note: '', TransactionTypeId: TransactionTypes.NegativeAdjustment, Amount: 25,
                        IsFeeScheduleWriteOff: true, FeeScheduleAdjustmentForEncounterId: '123456789'
                    },
                    {
                        Description: 'Fee Schedule Adjustment 3', Note: '', TransactionTypeId: TransactionTypes.NegativeAdjustment, Amount: 50,
                        IsFeeScheduleWriteOff: true, FeeScheduleAdjustmentForEncounterId: '12345678910'
                    },
                ];
            });

            it('should create feeScheduleAdjustmentLineItems with one line for all feeSchedule adjustments for each encounter', () => {
                component.createFeeScheduleAdjustmentItems();
                expect(component.feeScheduleAdjustmentItems[0].FeeScheduleAdjustmentForEncounterId).toEqual('123456789');
                expect(component.feeScheduleAdjustmentItems[0].FormattedDescription).toEqual('mockTranslation: Frank Carter - 08/04/2020');
                expect(component.feeScheduleAdjustmentItems[0].Description).toEqual('Fee Schedule Adjustment 1');
                expect(component.feeScheduleAdjustmentItems[0].Amount).toEqual(100);

                expect(component.feeScheduleAdjustmentItems[1].FeeScheduleAdjustmentForEncounterId).toEqual('12345678910');
                expect(component.feeScheduleAdjustmentItems[1].FormattedDescription).toEqual('mockTranslation: June Carter - 08/11/2020');
                expect(component.feeScheduleAdjustmentItems[1].Description).toEqual('Fee Schedule Adjustment 3');
                expect(component.feeScheduleAdjustmentItems[1].Amount).toEqual(50);
            });
        });

        describe('updateCredits', () => {
            beforeEach(() => {
                spyOn(component, 'registerControllerHasChanges');
                component.creditTransactionDtoList = [
                    { Description: 'Check', Note: '12345', TransactionTypeId: TransactionTypes.Payment, IsFeeScheduleWriteOff: false },
                    { Description: 'Check', Note: '', TransactionTypeId: TransactionTypes.CreditPayment, IsFeeScheduleWriteOff: false },
                    { Description: 'Cash', Note: '', TransactionTypeId: TransactionTypes.Payment, IsFeeScheduleWriteOff: false },
                    { Description: 'Check', Note: '', TransactionTypeId: TransactionTypes.Payment, IsFeeScheduleWriteOff: false },
                    {
                        Description: 'Some Type Of Adjustment', Note: '', TransactionTypeId: TransactionTypes.NegativeAdjustment,
                        IsFeeScheduleWriteOff: false
                    },
                    {
                        Description: 'Some Type Of Adjustment', Note: '', TransactionTypeId: TransactionTypes.NegativeAdjustment,
                        IsFeeScheduleWriteOff: true
                    },
                ];
            });

            it('should set creditTransaction.FormattedName to concatenated creditTransaction.Description plus creditTransaction.PaymentTypePromptValue in parantheses' +
                ' if creditTransaction.TransactionTypeId equals this.transactionTypes.Payment and IsFeeScheduleWriteOff is false and PromptTitle is Number', () => {
                    component.creditTransactionDtoList[0].TransactionTypeId = TransactionTypes.Payment;
                    component.creditTransactionDtoList[0].IsFeeScheduleWriteOff = false;
                    component.creditTransactionDtoList[0].PromptTitle = 'Number';
                    component.creditTransactionDtoList[0].Description = 'Check';
                    component.creditTransactionDtoList[0].PaymentTypePromptValue = '123456';
                    component.updateCredits();
                    expect(component.creditTransactionDtoList[0].FormattedDescription).toEqual('Check (123456)');
                });

            it('should set creditTransaction.FormattedName to concatenated creditTransaction.Description plus creditTransaction.PaymentTypePromptValue' +
                ' if creditTransaction.TransactionTypeId equals this.transactionTypes.Payment and IsFeeScheduleWriteOff is false and PromptTitle is Number', () => {
                    component.creditTransactionDtoList[0].TransactionTypeId = TransactionTypes.Payment;
                    component.creditTransactionDtoList[0].IsFeeScheduleWriteOff = false;
                    component.creditTransactionDtoList[0].PromptTitle = null;
                    component.creditTransactionDtoList[0].Description = 'Cash';
                    component.creditTransactionDtoList[0].PaymentTypePromptValue = '';
                    component.updateCredits();
                    expect(component.creditTransactionDtoList[0].FormattedDescription).toEqual('Cash ');
                });

            it('should set creditTransaction.FormattedName to concatenated creditTransaction.Description plus empty string' +
                ' if creditTransaction.TransactionTypeId equals this.transactionTypes.Payment and IsFeeScheduleWriteOff is false and ' +
                'PromptTitle is Number and PaymentTypePromptValue is null', () => {
                    component.creditTransactionDtoList[0].TransactionTypeId = TransactionTypes.Payment;
                    component.creditTransactionDtoList[0].IsFeeScheduleWriteOff = false;
                    component.creditTransactionDtoList[0].PromptTitle = 'Number';
                    component.creditTransactionDtoList[0].Description = 'Check';
                    component.creditTransactionDtoList[0].PaymentTypePromptValue = null;
                    component.updateCredits();
                    expect(component.creditTransactionDtoList[0].FormattedDescription).toEqual('Check ');
                });

            it('should call registerControllerHasChanges with true if isFinishing is false and filteredCreditTransactions.length is greater than 0 ', () => {
                component.isFinishing = false;
                component.updateCredits();
                expect(component.filteredCreditTransactions.length).toBeGreaterThan(0);
                expect(component.registerControllerHasChanges).toHaveBeenCalledWith(true);
            });

            it('should not call registerControllerHasChanges if isFinishing is true ', () => {
                component.isFinishing = true;
                component.updateCredits();
                expect(component.filteredCreditTransactions.length).toBeGreaterThan(0);
                expect(component.registerControllerHasChanges).not.toHaveBeenCalled();
            });

            it('should call registerControllerHasChanges with false if filteredCreditTransactions.length is 0 ', () => {
                component.creditTransactionDtoList = [];
                component.isFinishing = false;
                component.updateCredits();
                expect(component.filteredCreditTransactions.length).not.toBeGreaterThan(0);
                expect(component.registerControllerHasChanges).toHaveBeenCalledWith(false);
            });
        });

        describe('createFeeScheduleAdjustmentTooltip', () => {
            let creditTransactionDto;
            beforeEach(() => {
                creditTransactionDto =
                {
                    Description: 'Check', Note: '12345', TransactionTypeId: TransactionTypes.Payment,
                    IsFeeScheduleWriteOff: true, FeeScheduleAdjustmentForEncounterId: '111'
                };

                component.allEncounters = [
                    {
                        EncounterId: '100', AccountMemberId: '1235', hasAdjustedEstimate: true,
                        displayDate: '2020-08-04 18:54:48.5599445Z', PatientName: 'Frank Carter',
                        benefitPlan: mockBenefitPlanA, hasFeeScheduleAdjustments: true,
                        ServiceTransactionDtos: []
                    },
                    {
                        EncounterId: '111', AccountMemberId: '1235', hasAdjustedEstimate: true,
                        displayDate: '2020-08-11 18:54:48.5599445Z', PatientName: 'June Carter',
                        benefitPlan: mockBenefitPlanA, hasFeeScheduleAdjustments: true,
                        ServiceTransactionDtos: []
                    },]
            });

            it('should set creditTransaction.FormattedDescription based on matching encounter', () => {
                component.createFeeScheduleAdjustmentTooltip(creditTransactionDto);
                expect(creditTransactionDto.FormattedDescription).toEqual('mockTranslation: June Carter - 08/11/2020');
            });

            it('should set creditTransaction.FormattedDescription to Description if no matching encounter', () => {
                creditTransactionDto.FeeScheduleAdjustmentForEncounterId = null;
                component.createFeeScheduleAdjustmentTooltip(creditTransactionDto);
                expect(creditTransactionDto.FormattedDescription).toEqual('Check');
            });
        });

        describe('onProviderOnUnapplied', () => {
            let provider;
            beforeEach(() => {
                provider = { ProviderId: '1234' };
            });

            it('should call component.includePriorBalanceChange.emit', () => {
                spyOn(component.assignProvider, 'emit');
                component.onProviderOnUnapplied(provider);
                expect(component.assignProvider.emit).toHaveBeenCalledWith('1234');
            });
        });

        describe('finishCheckout', () => {

            beforeEach(() => {
                component.disableFinish = false;
            });

            it('should call component.finish.emit', () => {
                spyOn(component.finish, 'emit');
                component.finishCheckout();
                expect(component.finish.emit).toHaveBeenCalled();
            });

            it('should call registerControllerHasChanges', () => {
                component.registerControllerHasChanges = jasmine.createSpy();
                spyOn(component.finish, 'emit');
                component.finishCheckout();
                expect(component.registerControllerHasChanges).toHaveBeenCalledWith(false);
            });

            it('should set component.disableFinish to true', () => {
                spyOn(component.finish, 'emit');
                component.finishCheckout();
                expect(component.disableFinish).toBe(true);
            });

            it('should set component.isFinishing to true', () => {
                component.isFinishing = false;
                spyOn(component.finish, 'emit');
                component.finishCheckout();
                expect(component.isFinishing).toBe(true);
            });
        });

    });
});
