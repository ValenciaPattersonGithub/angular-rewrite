import { Component, OnInit, Inject, Input, OnChanges, Output, EventEmitter, SimpleChanges, ElementRef, ViewChild, OnDestroy} from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { PatientCheckoutService } from '../providers/patient-checkout.service';
import { CreditTransaction } from '../models/patient-encounter.model';
import { TransactionTypes } from 'src/@shared/models/transaction-enum';
import { isNullOrUndefined } from 'util';
import cloneDeep from 'lodash/cloneDeep';
import { WaitOverlayRef } from '../../../@shared/components/wait-overlay/wait-overlay-ref';
import { WaitOverlayService } from '../../../@shared/components/wait-overlay/wait-overlay.service';
import { AdjustmentTypesService } from 'src/@shared/providers/adjustment-types.service';
import { FeatureFlagService } from 'src/featureflag/featureflag.service';
import { FuseFlag } from 'src/@core/feature-flags/fuse-flag';
import { PaymentProvider } from 'src/@shared/enum/accounting/payment-provider';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { CurrencyType } from 'src/@core/models/currency/currency-type.model';
import { GatewayAccountType } from 'src/@core/models/payment-gateway/account-type.enum';
import { GatewayTransactionType } from 'src/@core/models/payment-gateway/transaction-type.enum';
import { GatewayChargeType } from 'src/@core/models/payment-gateway/charge-type.enum';
import { PaymentCategory } from 'src/@core/models/payment-gateway/payment-category.enum';
import { SapiValidationError } from 'src/@shared/models/sapi-validation-error';

@Component({
    selector: 'patient-checkout-payments',
    templateUrl: './patient-checkout-payments.component.html',
    styleUrls: ['./patient-checkout-payments.component.scss']
})
export class PatientCheckoutPaymentsComponent implements OnInit, OnDestroy, OnChanges {
    @Input() creditTransactions;
    @Input() hasDistributionChanges;
    @Input() dataForUnappliedTransactions;
    @Input() paymentTypes;
    @Input() negativeAdjustmentTypes;
    // updates totals, dataForUnappliedTransactions 
    @Input() updateSummary: boolean;
    @Input() accountId: any;
    @Input() accountMembersDetails: any;

    @Output() addUnappliedCredit = new EventEmitter<any>();
    @Output() addPaymentOrAdjustment = new EventEmitter<any>();
    @Output() promptUserOnNavigation = new EventEmitter<any>();
    @ViewChild('paypage') paypage: ElementRef;
    constructor(private translate: TranslateService,
        private waitOverlayService: WaitOverlayService,
        private patientCheckoutService: PatientCheckoutService,
        @Inject('referenceDataService') private referenceDataService,
        @Inject('PaymentGatewayService') private paymentGatewayService,
        @Inject('toastrFactory') private toastrFactory,
        @Inject('patSecurityService') private patSecurityService,
        private adjustmentTypesService: AdjustmentTypesService,
        @Inject('StaticData') private staticData,
        @Inject('localize') private localize,
        @Inject('locationService') private locationService,
        @Inject('UserServices') private userServices,
        @Inject('ModalFactory') private modalFactory ,
        private featureFlagService: FeatureFlagService,      
        @Inject('PatientServices') private patientServices,
        private sanitizer: DomSanitizer,
    ) { }

    paymentAdjustmentChoices: any[];

    /**
     * List of adjustment types.
     * 
     * Should be private, but is exposed for current unit test cases.
     * 
     * @private
     */
    adjustmentTypes: any[];

    /**
     * List of transaction types.
     * 
     * Should be private, but is exposed for current unit test cases.
     * 
     * @private
     */
    transactionTypes: any[];

    minDate: Date;
    maxDate: Date;
    // can user add payments
    private paymentAddAccess: false;
    disablePayment: boolean;
    allowPaymentApply: boolean;
    isValidDate: boolean;
    invalidDateErrorMessage: any;
    // local container for creditTransaction until applied  
    creditTransaction: CreditTransaction;
    selectedTransactionTypeId: string;
    selectedCardReader:string='0';
   
    /**
     * Location of user.
     * 
     * Should be private, but is exposed for current unit test cases.
     * 
     * @private
     */
    location: any;

    noPermissionMessage: any;

    /**
     * Requested debit or credit amount.
     * 
     * Should be private, but is exposed for current unit test cases.
     * 
     * @private
     */
    requestedAmount: any;

    /**
     * Reference to wait overlay.
     * 
     * Should be private, but is exposed for current unit test cases.
     * 
     * @private
     */
    waitOverlay: WaitOverlayRef;

    /**
     * Indicates dataForUnappledTransactions have been loaded
     * 
     * Should be private, but is exposed for current unit test cases.
     * 
     * @private
     */
    dataForUnappliedTransactionsLoaded: boolean;
    showPaymentProvider :boolean;
    showCreditCardDropDown:boolean;
    payPageUrl: SafeUrl;
    showPayPageModal: boolean;
    transactionInformation:any;
    paymentTransaction: CreditTransaction;
    isPaymentDevicesExist=false;

    ngOnInit() {
        this.requestedAmount = 0;
        this.dataForUnappliedTransactionsLoaded = false;
        this.selectedTransactionTypeId = '2';
        this.allowPaymentApply = false;
        this.maxDate = new Date();
        this.minDate = new Date(1900, 0, 1);
        this.authPaymentAddAccess();
        // this.unappliedCredits = [];
        this.loadDependancies();

        // NOTE, just filling these out now to have something to load dropdown, these will be handled in another pbi
        this.paymentAdjustmentChoices = [
            { text: this.translate.instant('Payment'), value: TransactionTypes.Payment },
            { text: this.translate.instant('Adjustment'), value: TransactionTypes.NegativeAdjustment },];
        this.isValidDate = true;
        this.invalidDateErrorMessage = this.localize.getLocalizedString('Invalid Date');
        this.initializePaymentOrAdjustment();
        this.checkFeatureFlags();

    }

    ngOnDestroy(): void {
    }

    handlePayPageTransactionCallback(): void {
        this.paymentGatewayService.completeCreditTransaction(this.transactionInformation ,3, this.handlePartialPayment.bind(this), this.cardTransactionOnErrorCallback.bind(this));
        this.clearPaypageModal();
        this.showCreditCardDropDown = false;
        this.isPaymentDevicesExist = false;
        this.creditTransaction.Amount = 0.00;
        this.creditTransaction.PaymentTypeId = '0';
        // TODO: When transaction is complete, need to send a message to the card reader component to reset
        this.allowPaymentApply = false;     
    }



    /**
     * Initialize a local CreditTransaction container for a payment or adjustment
     * 
     * Should be private, but is exposed for current unit test cases.
     * 
     * @private
     */


    initializePaymentOrAdjustment() {
        // create a container creditTransaction
        this.creditTransaction = this.patientCheckoutService.initializeCreditTransaction(this.accountId, null);
        // set TransactionTypeId to selectedTransactionTypeId 
        this.creditTransaction.TransactionTypeId = this.selectedTransactionTypeId === '2' ? 2 : 4;
    }

    /**
     * Loads component dependencies.
     * 
     * Should be private, but is exposed for current unit test cases.
     * 
     * @private
     */
    loadDependancies() {
        const promises = [];
        promises.push(Promise.resolve(this.adjustmentTypesService.get({ active: false })));
        promises.push(Promise.resolve(this.staticData.TransactionTypes()));
        promises.push(Promise.resolve(this.locationService.getCurrentLocation()));
        Promise.all(promises).then(([adjustmentTypes, transactionTypes, ofclocation]) => {
            this.adjustmentTypes = adjustmentTypes.Value;
            this.transactionTypes = transactionTypes.Value;
            this.location = ofclocation;
            var locations = this.referenceDataService.get(this.referenceDataService.entityNames.locations);
            this.location = locations.find(loc => loc.LocationId === this.location.id);
            this.loadPaymentTypes();
        }).catch(error => {
            this.toastrFactory.error('There was an error while attempting to retrieve data.', 'Server Error');
        });

    }

    private loadPaymentTypes() {
        if (this.paymentTypes && this.paymentTypes.length > 0) {
            this.paymentTypes.forEach(paymentType => {
                paymentType.value = paymentType.PaymentTypeId;
                paymentType.test = paymentType.Description;
            });
            // set initial value of paymentTypeId to 'Select Option'
            this.creditTransaction.PaymentTypeId = '0';
           
        }
    }

    // ngOnChanges fires when one of the input values is changed
    ngOnChanges(values: SimpleChanges) {
        this.loadDataForUnappliedTransactions();
    }

    /**
     * Load creditTransactions passed to component to dataForUnappliedTransactions.unappliedCreditTransactions
     * 
     * Should be private, but is exposed for current unit test cases.
     * 
     * @private
     */
    loadDataForUnappliedTransactions() {
        // make sure objects exist
        if (this.creditTransactions && this.creditTransactions.length > 0 &&
            this.transactionTypes && this.transactionTypes.length > 0 &&
            this.paymentTypes && this.paymentTypes.length > 0 &&
            this.adjustmentTypes && this.adjustmentTypes.length > 0 &&
            this.dataForUnappliedTransactionsLoaded === false) {
            this.dataForUnappliedTransactions.unappliedCreditTransactions = [];

            // filter creditTransactions for only unapplied creditTransactions
            let unappliedCreditTransactions = this.patientCheckoutService.getUnappliedCreditTransactions(this.creditTransactions, null);
            // sort by DateEntered date ascending order (Oldest first)
            if (unappliedCreditTransactions) {
                unappliedCreditTransactions = unappliedCreditTransactions.sort((x, y) => (x.DateEntered < y.DateEntered) ? -1 : 1);
                unappliedCreditTransactions.forEach(unappliedCreditTransaction => {
                    // set transactionType
                    const transactionTypeMatch = this.transactionTypes.find(transactionType =>
                        transactionType.TransactionTypeId === unappliedCreditTransaction.TransactionTypeId);
                    unappliedCreditTransaction.TransactionType = transactionTypeMatch ? transactionTypeMatch.Name : '';
                    // set UnassignedAmount and AvailableUnassignedAmount
                    unappliedCreditTransaction.UnassignedAmount = this.patientCheckoutService.getUnappliedCreditTransactionDetailAmount(
                        unappliedCreditTransaction.CreditTransactionDetails, null);
                    unappliedCreditTransaction.AvailableUnassignedAmount = unappliedCreditTransaction.UnassignedAmount;
                    // Default setting for IsDisabled is false
                    unappliedCreditTransaction.IsDisabled = false;
                    // handle display date for unapplied credit transactions          
                    unappliedCreditTransaction.DateEnteredDisplay = cloneDeep(unappliedCreditTransaction.DateEntered);
                    if (!unappliedCreditTransaction.DateEnteredDisplay.toLowerCase().endsWith('z')) {
                        unappliedCreditTransaction.DateEnteredDisplay += 'Z';
                    }
                    this.dataForUnappliedTransactions.unappliedCreditTransactions.push(unappliedCreditTransaction);
                });
                // calculate totals
                this.dataForUnappliedTransactions.totalUnappliedAmount = this.patientCheckoutService.getTotalUnappliedAmountFromCreditTransactions(
                    this.dataForUnappliedTransactions.unappliedCreditTransactions, null);
                this.dataForUnappliedTransactions.totalAvailableCredit = parseFloat(this.dataForUnappliedTransactions.totalUnappliedAmount);
                this.dataForUnappliedTransactionsLoaded = true;
            }
        }
        if (this.dataForUnappliedTransactions.totalBalanceDue === 0) {
            // since totalBalanceDue is 0 or there is at least one credit already applied, disable all unappliedCreditTransactions
            this.dataForUnappliedTransactions.unappliedCreditTransactions.forEach(unappliedTransaction => unappliedTransaction.IsDisabled = true);
        } else {
            // enable all unapplied where is more than 0
            this.dataForUnappliedTransactions.unappliedCreditTransactions.forEach(unappliedTransaction => {
                unappliedTransaction.IsDisabled = unappliedTransaction.AvailableUnassignedAmount > 0 ? false : true;
            });
        }
    }

    // determines if an id is empty
    private isAnEmptyId(id) {
        const emptyGuid = '0';
        return id === emptyGuid || isNullOrUndefined(id) || id === '';
    }

    /**
     * Validate credit transaction
     * 
     * TODO: as more activites are added we may need to revisit this validation.
     *  
     * Should be private, but is exposed for current unit test cases.
     * 
     * @private
     */
    validateCreditTransaction() {
        // disable apply during validation
        this.allowPaymentApply = false;
        if (this.creditTransaction) {
            // validate date, must not be a future date
            if (this.creditTransaction.DateEntered) {
                const dateValue = new Date(this.creditTransaction.DateEntered);
                dateValue.setHours(0, 0, 0, 0);
                this.isValidDate = dateValue != null && dateValue < this.maxDate && dateValue > this.minDate;
                if (this.isValidDate === false) {
                    return;
                }
            }else{
                return;
            }
            // enable / disable apply based on other fields
            // Must either have a PaymentTypeId or AdjustmentTypeId
            if (this.isAnEmptyId(this.creditTransaction.PaymentTypeId) && this.isAnEmptyId(this.creditTransaction.AdjustmentTypeId)) {
                return;
            }
            // Amount must be more than 0
            if (this.creditTransaction.Amount <= 0) {
                return;
            }

            // if this is an unapplied transaction the creditTransaction.Amount can not be more than the totalAvailableCredit
            if (this.creditTransaction.TransactionTypeId === TransactionTypes.CreditPayment &&
                this.dataForUnappliedTransactions.TotalAvailableCredit < this.creditTransaction.Amount) {
                return;
            }

            if(this.showCreditCardDropDown  && this.selectedCardReader == '0'){               
                return;
            }
            // if all conditions are satisfied, enable apply
            this.allowPaymentApply = true;
        }
    }

    onTransactionTypeChange($event) {
        // set TransactionTypeId
        this.creditTransaction.TransactionTypeId = this.selectedTransactionTypeId === '2' ? 2 : 4;
        this.allowPaymentApply = false;
        if (this.creditTransaction.TransactionTypeId === TransactionTypes.Payment) {
            this.creditTransaction.PaymentTypeId = '0';
            this.creditTransaction.AdjustmentTypeId = null;
        } else {
            this.creditTransaction.PaymentTypeId = null;
            this.creditTransaction.AdjustmentTypeId = '0';
        }
        this.creditTransaction.PromptTitle = null;
        this.creditTransaction.PaymentTypePromptValue = null;
    }

    /**
     * Opens card transaction overlay
     * 
     * Should be private, but is exposed for current unit test cases.
     * 
     * @private
     */
    getCardTransactionOverlay() {
        let data = {
            header: 'Please wait, do not refresh...',
            message: 'Your payment is currently being processed. ',
            message2: 'Refreshing the page or closing the browser during this transaction may prevent the payment from being posted to the patient account.',
        }
        return this.waitOverlayService.open({ data });
    };

    /**
     * Removes the wait overaly.
     * 
     * Should be private, but is exposed for current unit test cases.
     * 
     * @private
     */
    removeWaitOverlay() {
        if (this.waitOverlay) {
            this.waitOverlay.close();
            this.waitOverlay = null;
        }
    }

    /**
     * Creates a debit for the endounter.
     * 
     * Should be private, but is exposed for current unit test cases.
     * 
     * @private
     */
    createDebit() {
        // capture the creditTransaction.Amount before calling OE
        this.requestedAmount = this.creditTransaction.Amount;
        if(this.location?.PaymentProvider !== PaymentProvider.OpenEdge && this.showPaymentProvider ){
            this.setupCardPaymentTransaction(GatewayAccountType.Pin, GatewayTransactionType.DebitCard, GatewayChargeType.Purchase);
        } else {
            this.waitOverlay = this.getCardTransactionOverlay();
            this.paymentGatewayService.createDebitForEncounter(this.creditTransaction.AccountId, this.creditTransaction.Amount, 1, false, this.handlePartialPayment.bind(this), this.cardTransactionOnErrorCallback.bind(this));
        }
    };

    /**
     * Created a credit for the encounter.
     * 
     * Should be private, but is exposed for current unit test cases.
     * 
     * @private
     */
    createCredit() {
        this.requestedAmount = this.creditTransaction.Amount;
      
        if(this.location?.PaymentProvider !== PaymentProvider.OpenEdge && this.showPaymentProvider ){
            this.setupCardPaymentTransaction(GatewayAccountType.None, GatewayTransactionType.CreditCard, GatewayChargeType.Sale);
        } else{
            // capture the creditTransaction.Amount before calling OE
            this.waitOverlay = this.getCardTransactionOverlay();
            this.paymentGatewayService.createCreditForEncounter(this.creditTransaction.AccountId, this.creditTransaction.Amount, 1, false, this.handlePartialPayment.bind(this), this.cardTransactionOnErrorCallback.bind(this));
        }
    }


    setupCardPaymentTransaction(accountType: number, transactionType: number, chargeType: number): void {
        const paymentCategory=PaymentCategory.Encounter;
        this.paymentGatewayService.createPaymentProviderCreditOrDebitPayment(this.creditTransaction.AccountId, this.creditTransaction.Amount, 1, false, accountType, transactionType, chargeType, paymentCategory).$promise.then((result) => {
            this.transactionInformation = result.Value;
            var paymentIntentDto : PaymentIntentRequestDto ={
              LocationId: this.location?.LocationId,
              PaymentGatewayTransactionId: this.transactionInformation.PaymentGatewayTransactionId,
              Amount: this.creditTransaction.Amount,
              PartnerDeviceId: this.selectedCardReader ? this.selectedCardReader : null,
              RedirectUrl:location.origin + '/v1.0/index.html?v=1.0.0.1#/paypage-redirect-callback'
            }
            this.patientServices.CreditTransactions.payPageRequest(paymentIntentDto).$promise.then(
                (result) => {
                        this.payPageUrl = this.sanitizer.bypassSecurityTrustResourceUrl(result.Value.PaypageUrl);
                        this.openPaypage();
                },
                (error) => {
                    const validationError: SapiValidationError = error.data;
                    if (validationError.InvalidProperties.length > 0) {
                        validationError.InvalidProperties.forEach(element => {
                            this.toastrFactory.error(`${element.PropertyName}: ${element.ValidationMessage}`, this.localize.getLocalizedString('Error'));
                        });
                    } else {
                        this.toastrFactory.error(this.localize.getLocalizedString('Get pay page failed.'), this.localize.getLocalizedString('Error'));
                    }
                }
            );
        }, (error) => {
            this.toastrFactory.error(this.localize.getLocalizedString('Get pay page failed.'), this.localize.getLocalizedString('Error'));
        });
    }
    
    closePaypage(): void {
        this.showPayPageModal = false;
    }

    clearPaypageModal(): void {
        this.showPayPageModal = false;
    }

    openPaypage(): void {
        this.showPayPageModal = true;
        sessionStorage.setItem('isPaypageModalOpen', 'true');
    }

    /**
     * Applies a partial payment.
     * 
     * Should be private, but is exposed for current unit test cases.
     * 
     * @private
     */
    handlePartialPayment(paymentGatewayId, approvedAmount) {
        this.removeWaitOverlay();
        if (approvedAmount) {
            this.creditTransaction.Amount = approvedAmount;
            this.paymentTransaction.Amount = approvedAmount;
            this.continueApplyPayment(paymentGatewayId);
            this.requestedAmount = 0;
        } else {
            // if requested amount doesn't match the creditTransaction.Amount, update the creditTransaction amount
            if (this.requestedAmount !== this.creditTransaction.Amount) {
                this.creditTransaction.Amount = this.requestedAmount;
            }
            this.continueApplyPayment(paymentGatewayId);
        }
    }

    /**
     * Removes wait overlay.
     * 
     * Should be private, but is exposed for current unit test cases.
     * 
     * @private
     */
    cardTransactionOnErrorCallback() {
        this.removeWaitOverlay();
    }

    /**
     * Apply payment
     * 
     * NOTE: Modify CurrencyTypes to use enum for readability
     * 
     * Should be private, but is exposed for current unit test cases.
     * 
     * @private
     */
    applyPayment() {
        this.validateCreditTransaction();
        if (this.allowPaymentApply === true) {
            this.paymentTransaction = JSON.parse(JSON.stringify(this.creditTransaction));
            var paymentType = this.paymentTypes.find(pt => pt.PaymentTypeId === this.creditTransaction.PaymentTypeId);
            if (this.location.IsPaymentGatewayEnabled) {
                if (paymentType && paymentType.CurrencyTypeId === CurrencyType.CreditCard) {
                    this.createCredit();
                } else if (paymentType && paymentType.CurrencyTypeId === CurrencyType.DebitCard) {
                    this.createDebit();
                } else {
                    this.continueApplyPayment(false);
                }
            } else {
                this.continueApplyPayment(false);
            }
        }
    }

    /**
     * Continue on apply payment.
     * 
     * Should be private, but is exposed for current unit test cases.
     * 
     * @private
     */
    continueApplyPayment(paymentGatewayId) {
        if (paymentGatewayId) {
            this.creditTransaction.PaymentGatewayTransactionId = paymentGatewayId;
            this.paymentTransaction.PaymentGatewayTransactionId = paymentGatewayId;
        }

        this.addPaymentOrAdjustment.emit(this.paymentTransaction);
        this.initializePaymentOrAdjustment();
        this.allowPaymentApply = false;
    }

    applyPaymentOrAdjustment() {
        //If we already have distribution changes that aren't saved, prompt user to save them
        if (this.hasDistributionChanges) {
            this.promptUserOnNavigation.emit()
        }
        else {

            //Otherwise, continue on and check if credit card processing is enabled at the current location
            var paymentType = this.paymentTypes.find(pt => pt.PaymentTypeId === this.creditTransaction.PaymentTypeId);

            var req1 = paymentType && (paymentType.CurrencyTypeId === CurrencyType.CreditCard || paymentType.CurrencyTypeId === CurrencyType.DebitCard);
            var req2 = this.location && !this.location.IsPaymentGatewayEnabled;
            var req3 = this.location && this.location.MerchantId && this.location.MerchantId != '' && this.location.MerchantId.length > 0;

            if ((req1) && (req2) && (req3)) {
                //If this is a credit card and the credit card integration is disabled
                var userContext = JSON.parse(sessionStorage.getItem('userContext'));
                var userId = userContext.Result.User.UserId;

                this.userServices.Users.get({ Id: userId }).$promise.then(
                    (result) => {
                        var user = result.Value;
                        
                        if (user.ShowCardServiceDisabledMessage) {
                            //User should be shown the disabled message
                            this.modalFactory.CardServiceDisabledModal(this.location.NameLine1, user).then(() => {
                                this.applyPayment();
                            });
                        } else {
                            //User should not be shown the disabled message
                            this.applyPayment();
                        }
                    },
                    () => {
                        this.toastrFactory.error(this.localize.getLocalizedString('Get user failed.'), this.localize.getLocalizedString('Error'));
                    }
                );
            } else {
                //CC processing is enabled
                this.applyPayment();
            }
        }
    }

    // add CreditTransactionDetail to an instance of CreditTransactionDto and add to the creditTransactionDtoList
    applyUnappliedCredit(unappliedCredit: { CreditTransactionId: string; Applied: boolean; IsDisabled: boolean; }) {
        if (this.hasDistributionChanges === false) {
            for (let unapplied of this.dataForUnappliedTransactions.unappliedCreditTransactions) {
                if (unapplied.CreditTransactionId === unappliedCredit.CreditTransactionId) {
                    unappliedCredit.Applied = true;
                    unappliedCredit.IsDisabled = true;
                }
            }
            // add CreditTransactionDetails to CreditTransaction
            this.addUnappliedCredit.emit(unappliedCredit);
        } else {
            this.promptUserOnNavigation.emit();
        }
    }

    // Payment Amount 
    onPaymentChanged(amount: any) {
       const parsedFloat = parseFloat(amount?.NewValue);
       if (isNaN(parsedFloat)) {
        this.creditTransaction.Amount = 0.00;
       }else{
        this.creditTransaction.Amount=parseFloat(parsedFloat.toFixed(2));
       }     
       this.validateCreditTransaction();      
    }


    // on PaymentTypeId change reset payment prompt based on the payment type
    onPaymentTypeChange(paymentTypeId) {
        this.creditTransaction.PaymentTypeId = paymentTypeId;
        const selectedPaymentType = this.paymentTypes.find(x => x.PaymentTypeId === this.creditTransaction.PaymentTypeId);
        const hidePromptField =(selectedPaymentType?.CurrencyTypeId === CurrencyType.CreditCard || selectedPaymentType?.CurrencyTypeId === CurrencyType.DebitCard )  && this.showPaymentProvider && this.location?.IsPaymentGatewayEnabled && this.location?.PaymentProvider !== PaymentProvider.OpenEdge;
        if (selectedPaymentType) {
            this.creditTransaction.PromptTitle = hidePromptField ? null: selectedPaymentType.Prompt;
            this.creditTransaction.Description = selectedPaymentType.Description;
            // reset the PaymentPromptValue on change
            this.creditTransaction.PaymentTypePromptValue = null;
        }else{
            this.creditTransaction.PromptTitle = null;
            this.creditTransaction.Description = null;
            this.creditTransaction.PaymentTypePromptValue = null;
        }
        this.showCreditCardDropDown = this.paymentTypes.find(x => x.PaymentTypeId === paymentTypeId && (x.CurrencyTypeId == CurrencyType.CreditCard || x.CurrencyTypeId == CurrencyType.DebitCard)) && this.showPaymentProvider && this.location?.IsPaymentGatewayEnabled && this.location?.PaymentProvider !== PaymentProvider.OpenEdge ;
        if(!this.showCreditCardDropDown){
            this.isPaymentDevicesExist =false;
           }
        this.validateCreditTransaction();

    }

    onAdjustmentTypeChange(event) {
        const selectedAdjustmentType = this.adjustmentTypes.find(x => x.AdjustmentTypeId === this.creditTransaction.AdjustmentTypeId);
        if (selectedAdjustmentType) {
            this.creditTransaction.Description = selectedAdjustmentType.Description;
        }
        this.validateCreditTransaction();
    }

    onCreditTransactionDateChanged(event) {
        this.validateCreditTransaction();
    }

    // add account payment access (can user add payments)
    // NOTE, do we need to disable the payment controls if this is false
    private authPaymentAddAccess() {
        this.paymentAddAccess = this.patSecurityService.IsAuthorizedByAbbreviation('soar-acct-aapmt-add');
        this.disablePayment = !this.paymentAddAccess;
        // if disable payment set appropriate tooltip message
        this.noPermissionMessage = this.disablePayment === true ? this.translate.instant('You do not have permission to view this information') : '';
    }

    checkFeatureFlags() {
        this.featureFlagService
            .getOnce$(FuseFlag.UsePaymentService)
            .subscribe(value => {
                this.showPaymentProvider = value;
            });
    }

    onSelectedCardReader(cardReader){
        this.selectedCardReader = cardReader;
        this.validateCreditTransaction(); 
    }

    isCardReaderExist(value:boolean){
        this.isPaymentDevicesExist = value;
        this.showCreditCardDropDown = value;
        this.validateCreditTransaction();
    }


}

export class PaymentIntentRequestDto {
    LocationId: Number;
    PaymentGatewayTransactionId :Number;
    Amount:Number;
    PartnerDeviceId:string;
    RedirectUrl:string
}