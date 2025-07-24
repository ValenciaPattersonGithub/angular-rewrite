import { Component, OnInit, EventEmitter, Output, Inject, ViewContainerRef, Input, OnChanges, OnDestroy } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { ConfirmationModalService } from 'src/@shared/components/confirmation-modal/confirmation-modal.service';
import { ConfirmationModalOverlayRef } from 'src/@shared/components/confirmation-modal/confirmation-modal.overlayref';
import { Subscription } from 'rxjs';
import { take, filter } from 'rxjs/operators';
import { TransactionTypes } from '../../../@shared/models/transaction-enum';
import { AdjustmentTypesService } from 'src/@shared/providers/adjustment-types.service';

@Component({
    selector: 'patient-checkout-summary',
    templateUrl: './patient-checkout-summary.component.html',
    styleUrls: ['./patient-checkout-summary.component.scss']
})

export class PatientCheckoutSummaryComponent implements OnInit, OnChanges, OnDestroy {
    @Input() isDisabled;
    @Input() allEncounters: any[];   
    @Input() creditTransactionDtoList: any[];
    @Input() unappliedAmount: any;
    @Input() patientInfo: any;
    @Input() summaryTotals: any;
    @Input() encounterId: any;
    @Input() updateSummary: boolean;
    @Input() includePriorBalance: boolean;
    @Output() includePriorBalanceChange = new EventEmitter<boolean>();
    @Output() finish = new EventEmitter<any>();
    @Output() creditTransactionChange = new EventEmitter<any>();
    @Output() assignProvider = new EventEmitter<any>();

    @Output() cancel = new EventEmitter<any>();
    public containerRef: ViewContainerRef;

    constructor(private translate: TranslateService,
        private currencyPipe: CurrencyPipe,
        @Inject('toastrFactory') private toastrFactory,
        private adjustmentTypesService: AdjustmentTypesService,
        private confirmationModalService: ConfirmationModalService,
        @Inject('DiscardChangesService') private discardChangesService
    ) { }

    confirmationRef: ConfirmationModalOverlayRef;
    confirmationModalSubscription: Subscription;

    totalCharges: number;
    claimsCount: number;

    totalPaymentAmount: number;
    totalCreditsPaymentsAdjustments: number;
    totalBalanceDue: number;
    priorAccountBalance: number;
    todaysVisit: number;
    totalEstimatedInsurance: number;

    priorBalanceLinkText: any;
    serviceTransactionsToClaims: any[];
    benefitPlansWithClaims: any[];
    negativeAdjustmentTypes: any[];
    feeScheduleAdjustmentItems: any[];
    // non fee schedule creditTransactions
    filteredCreditTransactions: any[];
    encounterList:  Array<{ text: string, value: any }> = [];
    selectedEncounterId : any;

    disableSave: boolean;
    disableFinish: boolean;
    isFinishing: boolean = false;
    unappliedCreditTransactions: any[];
    transactionTypes: any;
    // if user selects provider to assign unapplied credits to store this value
    providerOnUnapplied: any;
    defaultAssignTo: any;
    hasCreditCardPayment: boolean;

    cancelConfirmationData = {
        header: this.translate.instant('Cancel Checkout'),
        message: this.translate.instant('Are you sure you want to cancel this Checkout?'),
        confirm: this.translate.instant('Yes'),
        cancel: this.translate.instant('No'),
        height: 200,
        width: 500
    };

    deleteCreditCardPaymentConfirmationData = {
        data: {
            header: this.translate.instant('Refund Credit Card Payment'),
            message: this.translate.instant('Do you want to return the amount to the card?'),
            confirm: this.translate.instant('Yes'),
            cancel: this.translate.instant('No'),
            height: 170,
            width: 350
        }
    };

    cancelCheckoutWithCreditCardPaymentData = {
        header: this.translate.instant('Warning'),
        message: this.translate.instant('A credit/debit card has been charged.  Cancelling the Checkout will not void the credit/debit card payment, and it will  appear as an Unapplied payment on the Account.'),
        message2: this.translate.instant('Do you wish to continue?'),
        confirm: this.translate.instant('Yes'),
        cancel: this.translate.instant('No'),
        height: 210,
        width: 600
    };

    // helper function to group services to tally up the number of unique claims by encounter, benefit plan, providerTypeId
    static groupBy(array, f) {
        const groups = {};
        array.forEach(o => {
            const group = JSON.stringify(f(o));
            groups[group] = groups[group] || [];
            groups[group].push(o);
        });
        return Object.keys(groups).map(group => {
            return groups[group];
        });
    }

    ngOnInit() {
        this.disableSave = true;
        this.disableFinish = true;
        this.claimsCount = 0;        
        this.priorBalanceLinkText = 'Remove';
        // Negative Adjustment Types
        this.getNegativeAdjustmentTypes().then((res: any[]) => {
            this.negativeAdjustmentTypes = res.filter(x => x.IsPositive === false && x.IsActive === true);
        });
        this.transactionTypes = TransactionTypes;
        // default for provider
        this.defaultAssignTo = this.translate.instant('Leave as Unassigned');
        this.selectedEncounterId = null;
        this.registerController();
    }    

    getEncounterList () {        
        if (!this.encounterId && this.encounterList.length === 0 && this.allEncounters ) {
            // load dropdown list
            this.encounterList = [];
            //Display each encounter by date and name and dollar amount<XX/XX/XXXX>
            this.allEncounters.forEach(encounter => { 
                const displayAmount = this.currencyPipe.transform(encounter.BalanceDue, 'USD', 'symbol', '1.2-2');               
                const displayDate = new DatePipe('en-US').transform(encounter.displayDate, 'MM/dd/yyyy');
                let encounterDescription = `${encounter.PatientName} ${displayDate} ${displayAmount}`;    
                this.encounterList.push({text: encounterDescription,value: encounter.EncounterId });
            });
        }
    }
    
    registerController() {
        this.discardChangesService.onRegisterController({
            controller: 'PatientCheckoutComponent',
            hasChanges: false
        });
    };

    registerControllerHasChanges(canSave) {
        if (this.discardChangesService.currentChangeRegistration !== null &&
            this.discardChangesService.currentChangeRegistration.hasChanges != canSave) {
            if (this.discardChangesService.currentChangeRegistration.controller === 'PatientCheckoutComponent') {
                this.discardChangesService.currentChangeRegistration.hasChanges = canSave;
            }
        }        
    };


    getNegativeAdjustmentTypes() {
        return new Promise((resolve, reject) => {
            // tslint:disable-next-line: max-line-length

              // tslint:disable-next-line: max-line-length
              this.adjustmentTypesService.get({ active: false }).then(res => {
                resolve(res?.Value);
            }, () => {
                // tslint:disable-next-line: max-line-length
                this.negativeAdjustmentTypes = [];
                // tslint:disable-next-line: max-line-length
                this.toastrFactory.error(this.translate.instant('Failed to retrieve the list of Adjustment Types. Refresh the page to try again.'),
                    this.translate.instant('Server Error'));
                reject();
            });
        });
    }

    // helper function to group services
    groupBy(array, f) {
        const groups = {};
        array.forEach(o => {
            const group = JSON.stringify(f(o));
            groups[group] = groups[group] || [];
            groups[group].push(o);
        });
        return Object.keys(groups).map(group => {
            return groups[group];
        });
    }

    addRemovePriorBalance() {
        let includePriorBalance = !this.includePriorBalance;
        this.includePriorBalanceChange.emit(includePriorBalance);
    }

    cancelCheckout() {
        var data;
        if (this.hasCreditCardPayment) {
            data = this.cancelCheckoutWithCreditCardPaymentData;
        }
        else {
            data = this.cancelConfirmationData;
            data.header = this.translate.instant('Cancel Checkout'),
            data.message = this.translate.instant('Are you sure you want to cancel this Checkout?');
            data.message2 =  this.translate.instant('Any changes you have made will be lost.'); 
            data.height = 200;
            data.width= 500;   
        }

        this.confirmationRef = this.confirmationModalService.open({
            data
        });
        this.confirmationModalSubscription = this.confirmationRef.events.pipe(
            filter((event) => !!event),
            filter((event) => {
                return event.type === 'confirm' || event.type === 'close';
            }),
            take(1)
        ).subscribe((events) => {
            switch (events.type) {
                case 'confirm':
                    this.confirmationRef.close();
                    this.registerControllerHasChanges(false);
                    this.cancel.emit();
                    break;
                case 'close':
                    this.confirmationRef.close();
                    break;
            }
        });
    }

    // Clicking the Back to Cart button should return the user to the Cart, regardless of where the user came to the Checkout from 
    // if there have not been any changes to the Checkout by the user simply route to Cart
    // if the user has made changes, clicking Back to Cart button prompt user 
    backToCart(event) {        
        if (event.value){
            this.selectedEncounterId = event.value;
        } else {
            this.selectedEncounterId = this.encounterId;
        }        
        if (this.filteredCreditTransactions.length > 0){
            var data = this.cancelConfirmationData;
            this.backToCartPrompt(data);
        } else {
            this.registerControllerHasChanges(false);
            this.cancel.emit(this.selectedEncounterId);
        }
    }

    backToCartPrompt(data) {
        // Prompt messaging will be different if we have taken Open Edge payments 
        const hasOpenEdgePayments = this.filteredCreditTransactions.filter(creditTransaction => {
            return creditTransaction.PaymentGatewayTransactionId && creditTransaction.TransactionTypeId === TransactionTypes.Payment;
        })

        if (hasOpenEdgePayments.length > 0){
            // custom message for cancel confirmation if the user has added creditTransactions
            data.header = this.translate.instant('Warning'),
            data.message = this.translate.instant('A credit/debit card has been charged.  Cancelling the checkout will not void the credit/debit card payment, and it will  appear as an unapplied payment on the account.');
            data.message2 =  this.translate.instant('Do you wish to continue?');
            data.height = 210;
            data.width= 600;
        } else {
            // custom message for cancel confirmation if the user has added creditTransactions
            data.header = this.translate.instant('Back to Cart'),
            data.message = this.translate.instant('Are you sure you want to cancel this Checkout and return to the Cart?');
            data.message2 =  this.translate.instant('Any changes you have made will be lost.');
            data.height = 200;
            data.width= 500;
        }        
        this.confirmationRef = this.confirmationModalService.open({
            data
        });
        this.confirmationModalSubscription = this.confirmationRef.events.pipe(
            filter((event) => !!event),
            filter((event) => {
                return event.type === 'confirm' || event.type === 'close';
            }),
            take(1)
        ).subscribe((events) => {
            switch (events.type) {
                case 'confirm':
                    this.confirmationRef.close();
                    this.registerControllerHasChanges(false);
                    this.cancel.emit(this.selectedEncounterId);
                    break;
                case 'close':
                    this.confirmationRef.close();
                    break;
            }
        });
    }

    ngOnDestroy() {
        // clean up modal subscription
        if (this.confirmationModalSubscription) {
            this.confirmationModalSubscription.unsubscribe();
        }
        this.registerControllerHasChanges(false);
    }

    // ngOnChanges fires when one of the input values is changed
    ngOnChanges(values) {
        // ease transtion on reload
        setTimeout(()=>{
            this.updateTotals();
            this.updateClaimsTotals();
            this.setButtonState();
            this.updateCredits();
            this.createFeeScheduleAdjustmentItems();
            if (this.allEncounters){
                this.getEncounterList();
            }
        }, 100);

        var creditCardPayments = this.creditTransactionDtoList.find(credit => credit.PaymentGatewayTransactionId && credit.TransactionTypeId === TransactionTypes.Payment);
        if (creditCardPayments) {
            this.discardChangesService.currentChangeRegistration.customMessage = {
                Title: 'Warning',
                Message: 'A credit/debit card has been charged.  Cancelling the Checkout will not void the credit/debit card payment, and it will  appear as an Unapplied payment on the Account.  Do you wish to continue?'
            };
            if (!this.isFinishing) {
                this.hasCreditCardPayment = true;
                this.registerControllerHasChanges(true);
            }            
        }
        else {
            this.hasCreditCardPayment = false;
        }

    }

    // used for any manipulation of creditTransactions for display purposes
    // handles adjustments(including fee schedule), payments
    updateCredits() {
        if (this.creditTransactionDtoList.length > 0) {
            this.creditTransactionDtoList.forEach(creditTransaction => {
                // format PaymentTypePromptValue
                const paymentTypePromptValue = creditTransaction.PaymentTypePromptValue ?
                    '('.concat(creditTransaction.PaymentTypePromptValue).concat(')') : '';
                if (creditTransaction.TransactionTypeId === TransactionTypes.Payment && creditTransaction.IsFeeScheduleWriteOff === false) {
                    creditTransaction.FormattedDescription = creditTransaction.Description.concat(' ', paymentTypePromptValue);
                } else {
                    creditTransaction.FormattedDescription = creditTransaction.Description;
                }
            });
        }
        this.filteredCreditTransactions = this.creditTransactionDtoList.filter(creditTransaction => {
            return creditTransaction.IsFeeScheduleWriteOff === false;
        })
        // set discard message if user navigates away if changes have been made (only if not finishing)
        if (this.isFinishing === false) {
            const hasChanges = this.filteredCreditTransactions.length > 0 ? true : false;
            this.registerControllerHasChanges(hasChanges); 
        }
    }    

    // fee schedule adjustments are to be displayed as one line item per encounter
    // to achieve this we need to create feeScheduleAdjustmentItems that group 
    // the creditTransactions involved to one entity.
    createFeeScheduleAdjustmentItems() {
        this.feeScheduleAdjustmentItems = [];
        // filter creditTransactionDtoList for only IsFeeScheduleWriteOff = true;
        let feeScheduleAdjustments = this.creditTransactionDtoList.filter(creditTransaction => {
            return creditTransaction.IsFeeScheduleWriteOff === true;
        })
        // group by encounter
        const feeScheduleAdjustmentGroups = this.groupBy(feeScheduleAdjustments, creditTransaction => {
            return creditTransaction.FeeScheduleAdjustmentForEncounterId;
        });
        // create one line item for each creditTransaction group    
        feeScheduleAdjustmentGroups.forEach(group => {
            let feeScheduleAdjustmentItem = {
                Amount: 0, Description: '',
                FormattedDescription: '', FeeScheduleAdjustmentForEncounterId: null, DefaultNegativeAdjustmentType: null
            };
            feeScheduleAdjustmentItem.Amount += group.reduce((a, b) => {
                return a + b.Amount;
            }, 0);
            feeScheduleAdjustmentItem.FeeScheduleAdjustmentForEncounterId = group[0].FeeScheduleAdjustmentForEncounterId;
            feeScheduleAdjustmentItem.Description = group[0].Description;
            this.createFeeScheduleAdjustmentTooltip(feeScheduleAdjustmentItem);
            this.feeScheduleAdjustmentItems.push(feeScheduleAdjustmentItem);
        });
    }

    // create tooltip that is particular to fee schedule adjustments
    createFeeScheduleAdjustmentTooltip(creditTransaction) {
        // make sure this computed property is never empty.
        creditTransaction.FormattedDescription = creditTransaction.Description;
        // find the matching encounter
        const encounterMatch = this.allEncounters.find(encounter => {
            return encounter.EncounterId === creditTransaction.FeeScheduleAdjustmentForEncounterId;
        })
        if (encounterMatch) {
            const displayDate = new DatePipe('en-US').transform(encounterMatch.displayDate, 'MM/dd/yyyy');
            creditTransaction.FormattedDescription = this.translate.instant('Fee Schedule Adjustment').
                concat(': ').concat(encounterMatch.PatientName).concat(' - ').concat(displayDate);
        }
    }

    // NOTE, as we build on, other controls may need to be disabled based on this setting
    setButtonState() {
        this.disableSave = this.isDisabled;
        this.disableFinish = this.isDisabled === true ? true : false;
        this.priorBalanceLinkText = this.includePriorBalance === true ? 'Remove' : 'Include Prior Balance';
    }

    //#region handle unappliedCreditTransactions

    removeUnappliedCreditTransaction(unappliedCreditTransaction) {
        this.creditTransactionChange.emit({ action: 'removeUnappliedCredit', creditTransaction: unappliedCreditTransaction });
    }

    // remove all credit transactions associated with a fee schedule item which can be one or more creditTransactions
    removeFeeScheduleAdjustmentItem(feeScheduleAdjustmentItem){
        this.creditTransactionChange.emit({ action: 'removeFeeScheduleAdjustmentItem', feeScheduleAdjustmentItem: feeScheduleAdjustmentItem });            
    }

    removeCreditTransaction(creditTransaction) {
        if (creditTransaction.PaymentGatewayTransactionId) {
            this.confirmationRef = this.confirmationModalService.open(this.deleteCreditCardPaymentConfirmationData);
            this.confirmationModalSubscription = this.confirmationRef.events.pipe(
                filter((event) => !!event),
                filter((event) => {
                    return event.type === 'confirm' || event.type === 'close';
                }),
                take(1)
            ).subscribe((events) => {
                switch (events.type) {
                    case 'confirm':
                        this.confirmationRef.close();
                        this.creditTransactionChange.emit({ action: 'removeCredit', creditTransaction });
                        break;
                    case 'close':
                        this.confirmationRef.close();
                        break;
                }
            });
        }
        else {
            this.creditTransactionChange.emit({ action: 'removeCredit', creditTransaction });
        }
    }

    //#endregion

    // calculate total claims per benefit plan
    updateClaimsTotals() {
        if (this.allEncounters && this.allEncounters.length > 0) {
            // maintain a list of serviceTransactions that have CreateClaim set to true
            this.serviceTransactionsToClaims = [];
            this.allEncounters.forEach(encounter => {
                if (encounter.benefitPlan) {
                    encounter.ServiceTransactionDtos.forEach(serviceTransaction => {
                        if (serviceTransaction.CreateClaim === true) {
                            const serviceOnClaim = {
                                EncounterId: serviceTransaction.EncounterId,
                                ProviderOnClaimsId: serviceTransaction.ProviderOnClaimsId,
                                BenefitPlanId: encounter.benefitPlan.BenefitPlanId,
                                CarrierName: encounter.benefitPlan.PolicyHolderBenefitPlanDto.BenefitPlanDto.Carrier.Name,
                                PlanName: encounter.benefitPlan.PolicyHolderBenefitPlanDto.BenefitPlanDto.Name,
                            };
                            this.serviceTransactionsToClaims.push(serviceOnClaim);
                        }
                    });
                }
            });
            // create a unique array of benefit plans associated with these services
            this.benefitPlansWithClaims = Array.from(new Set(this.serviceTransactionsToClaims.map(s => s.BenefitPlanId)))
                .map(BenefitPlanId => {
                    return {
                        BenefitPlanId,
                        CarrierName: this.serviceTransactionsToClaims.find(s => s.BenefitPlanId === BenefitPlanId).CarrierName,
                        PlanName: this.serviceTransactionsToClaims.find(s => s.BenefitPlanId === BenefitPlanId).PlanName,
                        NumberOfClaims: 0
                    };
                });
            // calculate the NumberOfClaims to be generated for each
            this.benefitPlansWithClaims.forEach(benefitPlan => {
                // calculate the number of claims for each
                const servicesByPlan = this.serviceTransactionsToClaims.filter(x => x.BenefitPlanId === benefitPlan.BenefitPlanId);
                const claimsToBeCreated = this.groupBy(servicesByPlan, s => {
                    return [s.EncounterId, s.BenefitPlanId, s.ProviderOnClaimsId];
                });
                benefitPlan.NumberOfClaims = claimsToBeCreated.length;
            });
        }
    }

    // Less estimated insurance amount
    // If encounter.hasFeeScheduleAdjustments is true and encounter.PatientBenefitPlanId =insuranceEstimate.PatientBenefitPlanId ,
    // estimatedInsurance for serviceTransaction equals insuranceEstimate.EstInsurance
    // otherwise estimatedInsurance = insuranceEstimate.EstInsurance + insuranceEstimate.AdjEst
    // When no claims are to be created from the Checkout, Insurance Estimates amount should be $0.00
    // estimatedInsurance per transaction is 0 if claim is unchecked
    calculateInsuranceEstimateByTransaction(serviceTransaction, encounter) {
        let estimatedInsuranceTotal = 0;
        if (serviceTransaction.CreateClaim === true) {
            // tslint:disable-next-line: max-line-length
            if (encounter.hasFeeScheduleAdjustments === true) {
                // if encounter.hasFeeScheduleAdjustments is true then estimated insurance is sum of EstInsurance
                serviceTransaction.InsuranceEstimates.forEach(insuranceEstimate => {
                    if (insuranceEstimate.PatientBenefitPlanId === encounter.benefitPlan.PatientBenefitPlanId) {
                        estimatedInsuranceTotal += insuranceEstimate.EstInsurance;
                    } else {
                        estimatedInsuranceTotal += insuranceEstimate.EstInsurance + insuranceEstimate.AdjEst;
                    }
                });
            } else {
                serviceTransaction.InsuranceEstimates.forEach(insuranceEstimate => {
                    estimatedInsuranceTotal += insuranceEstimate.EstInsurance + insuranceEstimate.AdjEst;
                });
            }
        }
        return estimatedInsuranceTotal;
    }

    // this was the updateTiles method in patient-checkout-refactor
    // recalculates values when any of the input values change
    // loop thru the serviceAndDebitTransactionDtos and calculate totals
    updateTotals = function () {
        if (this.summaryTotals) {
            const totalPaymentApplied = this.summaryTotals.totalPaymentApplied;
            this.totalPaymentAmount = parseFloat(totalPaymentApplied.toFixed(2));

            // Total Credits, Payments, and Adjustments should reflect unapplied as well as applied
            this.totalCreditsPaymentsAdjustments = parseFloat(this.summaryTotals.totalCreditsPaymentsAdjustments.toFixed(2));

            this.priorAccountBalance = parseFloat(this.summaryTotals.totalPriorBalanceDue.toFixed(2));
            this.todaysVisit = parseFloat(this.summaryTotals.todaysVisitAmount.toFixed(2));
            this.totalEstimatedInsurance = parseFloat(this.summaryTotals.totalEstimatedInsurance.toFixed(2));

            this.totalCharges = parseFloat(this.summaryTotals.totalCharges.toFixed(2));

            // this.totalBalanceDue (includePriorBalance indicates to includePriorBalance in totalBalanceDue)     
            this.totalBalanceDue = parseFloat(this.summaryTotals.totalBalanceDue.toFixed(2));
        }
    };

    finishCheckout() {
        this.disableFinish = true;
        this.isFinishing = true;
        this.registerControllerHasChanges(false);
        this.finish.emit();
    }

    onProviderOnUnapplied(provider) {
        this.providerOnUnapplied = provider.ProviderId;
        this.assignProvider.emit(this.providerOnUnapplied);
    }

}
