import { Component, OnInit, Inject, Input, Output, EventEmitter, OnChanges, OnDestroy } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { AuthAccess } from 'src/@shared/models/auth-access.model';
import { CreditTransaction } from '../models/patient-encounter.model';
import { BestPracticePatientNamePipe } from 'src/@shared/pipes/best-practice/best-practice-patient-name.pipe';
import { PatientCheckoutService } from '../providers/patient-checkout.service';
import { ConfirmationModalOverlayRef } from 'src/@shared/components/confirmation-modal/confirmation-modal.overlayref';
import { ConfirmationModalService } from 'src/@shared/components/confirmation-modal/confirmation-modal.service';
import { Subject, Subscription } from 'rxjs';
import cloneDeep from 'lodash/cloneDeep';
import { filter, take } from 'rxjs/operators';
import { TransactionTypes } from 'src/@shared/models/transaction-enum';
import { CurrencyPipe } from '@angular/common';
import { isNullOrUndefined } from 'util';
import { SaveStates } from '../../../@shared/models/transaction-enum';
import { WaitOverlayRef } from '../../../@shared/components/wait-overlay/wait-overlay-ref';
import { WaitOverlayService } from '../../../@shared/components/wait-overlay/wait-overlay.service';
import { TeamMemberLocationService } from 'src/business-center/practice-settings/team-members/team-member-crud/team-member-locations/team-member-location.service';
import { AdjustmentTypesService } from 'src/@shared/providers/adjustment-types.service';
import { GatewayTransactionType } from 'src/@core/models/payment-gateway/transaction-type.enum';
import { PaymentProvider } from 'src/@shared/enum/accounting/payment-provider';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { GatewayAccountType } from 'src/@core/models/payment-gateway/account-type.enum';
import { GatewayChargeType } from 'src/@core/models/payment-gateway/charge-type.enum';
import { CardType, CurrencyType } from 'src/@core/models/currency/currency-type.model';
import { SapiValidationError } from 'src/@shared/models/sapi-validation-error';

@Component({
    selector: 'patient-checkout',
    templateUrl: './patient-checkout.component.html',
    styleUrls: ['./patient-checkout.component.scss'],
})
export class PatientCheckoutComponent implements OnInit, OnChanges, OnDestroy {
    constructor(private translate: TranslateService,
        private waitOverlayService: WaitOverlayService,
        private currencyPipe: CurrencyPipe,
        private patientCheckoutService: PatientCheckoutService,
        @Inject('$routeParams') private route,
        @Inject('toastrFactory') private toastrFactory,
        @Inject('patSecurityService') private patSecurityService,
        @Inject('PatientServices') private patientServices,
        private adjustmentTypesService: AdjustmentTypesService,
        @Inject('StaticData') private staticData,
        @Inject('PatientOdontogramFactory') private patientOdontogramFactory,
        @Inject('ModalFactory') private modalFactory,
        @Inject('ModalDataFactory') private modalDataFactory,
        public teamMemberLocationService: TeamMemberLocationService,
        @Inject('referenceDataService') private referenceDataService,
        @Inject('locationService') private locationService,
        @Inject('LocationServices') private locationServices,
        @Inject('FinancialService') private financialService,
        @Inject('SaveStates') private saveStates,
        @Inject('$uibModal') private uibModal,
        @Inject('tabLauncher') private tabLauncher,
        private bestPracticePatientNamePipe: BestPracticePatientNamePipe,
        private confirmationModalService: ConfirmationModalService,
        @Inject('PaymentGatewayService') private paymentGatewayService,
        private sanitizer: DomSanitizer,
        @Inject('localize') private localize,
    ) { }
    confirmationRef: ConfirmationModalOverlayRef;
    confirmationModalSubscription: Subscription;
    @Input() patientInfo: any;
    @Output() cancel = new EventEmitter<any>();
    @Output() finish = new EventEmitter<any>();

    patientId: any;
    accountId: any;
    encounterId: any;
    balanceDetail: any;
    encounterServices: any;
    patientHeaderData: any;
    phones: any;
    breadCrumbs: any;
    fromLocation: any;
    showTodaysEncounters: any;
    showPriorBalance: any;
    showAppliedAmountError: boolean;
    appliedAmountErrorSubject = new Subject();

    /**
     * This is a side-effect variable that is used to trigger ngOnChanges in child components.
     */
    updateSummary: boolean;

    transactionTypes: any;

    negativeAdjustmentTypes: any[];
    allTeeth: any;
    serviceCodes: any[];
    paymentAdjustmentTypes: any[];
    paymentAdjustmentTypes2: any[];
    unappliedCreditTransactionDetailToDelete: any;
    dataForPage: any;
    paymentTypes: any[];
    accountMembersDetails: any[];
    accountMembersList: any[];
    currentPatient: any;
    providers: any[];
    allProvidersList: any[];
    location: any;
    loadingCheckout: boolean;
    plansTrimmed: any[];
    allMemberPlans: any[];
    loadingFeeScheduleAdjustments: boolean;
    priorBalances: any[];
    includePriorBalance: boolean;
    authAccess: AuthAccess;
    canAddPaymentAuthorization: boolean;
    checkoutInfo: any;
    debitTransactions: any[];
    creditTransactionMatch: any;
    servicesHaveBeenReEstimated: boolean;
    feeScheduleAdjustmentRemoved: any[];
    waitOverlay: WaitOverlayRef;

    showPayPageModal: boolean;
    payPageUrl: SafeUrl;
    cardReaders: any[] = [];

    // when a provider is selected for CreditTransactionDetail.ProviderId on unappliedAmounts
    // this is set to the ProviderId value
    providerOnUnappliedCredits: any;

    // data structure for modal to confirm saveDistribution
    saveDistributionConfirmationData = {
        header: this.translate.instant('Save Distribution?'),
        message: this.translate.instant('You have manually edited the distribution, but these changes have not been saved.'),
        boldTextMessage: this.translate.instant('Do you want to save the distribution?'),
        confirm: this.translate.instant('Yes'),
        cancel: this.translate.instant('No'),
        height: 200,
        width: 580
    }

    // data structure for modal to prompt when distribution is invalid
    distributionWarningData = {
        header: this.translate.instant('Warning'),
        message: this.translate.instant('There are errors with the current distribution, and your changes have not been saved.'),
        boldTextMessage: this.translate.instant('  Do you want to reset the distribution?'),
        confirm: this.translate.instant('Yes'),
        cancel: this.translate.instant('No'),
        height: 200,
        width: 580,
    }

    // structure for modal to confirm unappliedAmounts in checkout
    unappliedConfirmationData = {
        header: this.translate.instant('Confirm'),
        message: '',
        message2: '',
        confirm: this.translate.instant('Continue'),
        cancel: this.translate.instant('Cancel'),
        height: 150,
        width: 580
    };

    // structure for modal to confirm unappliedAmounts in checkout
    warningModalData = {
        header: this.translate.instant('Checkout'),
        message: '',
        confirm: this.translate.instant('OK'),
        height: 200,
        width: 580
    };


    confirmationData = {
        header: this.translate.instant('Changes needed'),
        message: '',
        message2: '',
        confirm: this.translate.instant('OK'),
        cancel: this.translate.instant('Cancel'),
        height: 200,
        width: 580
    };

    getCardTransactionOverlay() {
        let data = {
            header: 'Please wait, do not refresh...',
            message: 'Your payment is currently being processed. ',
            message2: 'Refreshing the page or closing the browser during this transaction may prevent the payment from being posted to the patient account.',
        }
        return this.waitOverlayService.open({ data });
    };

    removeWaitOverlay() {
        if (this.waitOverlay) {
            this.waitOverlay.close();
            this.waitOverlay = null;
        }
    }

    checkoutIsInProgress: boolean;

    addCreditTransactionToList: boolean;
    dataForUnappliedTransactions = {
        totalAvailableCredit: 0,
        totalUnappliedAmount: 0,
        totalBalanceDue: 0,
        unappliedCreditTransactions: []
    };
    adjustmentTypes: any[];
    priorAdjustments: any[];
    backupServiceTransactionDtos: any[];
    serviceTransactionsForInsuranceList: any[];
    isDistributionForFeeScheduleAdjustment: boolean;
    currentAdjustmentEncounter: any;
    userLocation: any;
    feeScheduleAdjustments: any[];

    pendingEncounterListBackup: any[];
    encounterBackupList: any[];

    // credit transaction
    isFeeScheduleAdjustment: boolean;
    serviceTransactionToClaimDtoList: any[];
    // container for all CreditTransactionDetails that could be applied to this encounter(s)
    creditTransactionDto: CreditTransaction;
    feeScheduleWriteoffBackup: any[];
    // container for all CreditTransactions that have been applied to this encounter(s)
    creditTransactionDtoList: any[];
    creditTransactions: any[];
    creditPaymentOrder: any[];
    // encounter
    patientEncounters: any[];
    allEncounters: any[];
    adjustmentEncounters: any[];
    allDebitTransactions: any[];
    priorBalanceTransactionsByPatient: any[];
    serviceAndDebitTransactionDtos: any[];
    unappliedAmount: number;
    currentUnappliedAmount: number;
    // NOTE openEdge not implemented yet
    paymentOrRefundPlaceholderAmount: number;
    // allow user to re-distribute credits
    allowSaveDistribution: boolean;
    hasDistributionChanges: boolean;
    disableSummary: boolean;
    disablePayments: boolean;
    disableCreateClaims: boolean;
    disableCreditDistribution: boolean;

    // totals
    claimsCount: number;
    summaryTotals: any;
    // indicates process that updates CreditTransactionDetails is underway
    hasPendingUpdateCreditTransaction: boolean;
    showCardReaderSelectModal: boolean;
    selectedCardReader: string;
    refundTransaction: any;

    ngOnChanges(values) {
    }

    ngOnInit() {
        this.debitTransactions = [];
        this.feeScheduleAdjustmentRemoved = [];
        this.servicesHaveBeenReEstimated = false;
        this.backupServiceTransactionDtos = [];
        this.paymentOrRefundPlaceholderAmount = 0;
        this.showAppliedAmountError = false;
        this.addCreditTransactionToList = false;
        this.creditPaymentOrder = [];
        this.priorBalanceTransactionsByPatient = [];
        this.disableSummary = true;
        this.allowSaveDistribution = false;
        this.hasDistributionChanges = false;
        this.disableCreditDistribution = true;
        this.disableCreateClaims = false;
        this.loadingCheckout = true;
        this.creditTransactionDtoList = [];
        this.checkoutIsInProgress = false;
        this.includePriorBalance = true;
        // TODO find a way to calculate these booleans, to many to keep track of
        this.hasPendingUpdateCreditTransaction = false;
        this.location = this.locationService.getCurrentLocation();
        this.patientId = this.route.patientId;
        this.accountId = this.route.accountId;
        this.encounterId = this.route.encounterId;
        if (this.route.PrevLocation) {
            this.fromLocation = this.route.PrevLocation;
        }
        this.updateSummary = false;

        this.showTodaysEncounters = true;
        this.showPriorBalance = false;

        this.authAccess = this.getAuthAccess();
        this.loadDependancies();

        // loads breadcrumbs which may not be shown but are used for purpose of cancelling and returning to previous page
        // TODO if we don't show breadcrumbs we probably dont need this
        this.getPageNavigation();

        this.getCheckoutInfo(this.patientInfo.PersonAccount.AccountId, this.encounterId);

        // prep this instance of CreditTransactionDto, creditTransactionDtoList
        this.creditTransactionDtoList = [];
        // create initial creditTransactionDto
        const locationId = this.location ? this.location.id : null;
        this.creditTransactionDto = this.patientCheckoutService.initializeCreditTransaction(
            this.patientInfo.PersonAccount.AccountId, locationId);
        this.creditTransactionDto.AccountId = this.patientInfo.PersonAccount.AccountId;
        this.transactionTypes = TransactionTypes;
    }

    //#region load encounters

    // entry point to load encounters
    getCheckoutInfo(patientAccountId, encounterId) {
        if (this.authAccess.view) {
            // combine calls to get checkout info and debit transactions to reduce calls to distribute amounts
            const promises = [];
            promises.push(Promise.resolve(this.patientServices.CheckoutInfo.getCheckoutInfo({ accountId: patientAccountId, encounterId }).$promise));
            promises.push(Promise.resolve(this.patientServices.Encounter.getDebitTransactionsByAccountId({ accountId: this.accountId, includeFinanceCharge: true }).$promise));
            promises.push(Promise.resolve(this.referenceDataService.getData(this.referenceDataService.entityNames.serviceCodes)));
            Promise.all(promises).then(([checkoutInfo, debitTransactions, allServiceCodes]) => {
                // service code
                this.serviceCodes = allServiceCodes;

                // set fees by location
                this.referenceDataService.setFeesByLocation(allServiceCodes);

                this.checkoutInfo = checkoutInfo.Value;
                this.debitTransactions = debitTransactions.Value;
                this.patientEncounters = [];
                // Benefit Plan Info
                this.loadBenefitPlans(this.checkoutInfo.PatientBenefitPlanDtoList);
                // ServiceTransactionToClaimDtoList
                this.serviceTransactionToClaimDtoList = this.checkoutInfo.ServiceTransationToClaimDtoList;
                // Patient Encounters
                this.loadPatientEncounters(this.checkoutInfo);
                // Credit Transactions
                this.loadCreditTransactions(this.checkoutInfo);
            }, (err) => {
                // tslint:disable-next-line: max-line-length
                this.toastrFactory.error(this.translate.instant('Failed to retrieve the Account Members. Refresh the page to try again.'),
                    this.translate.instant('Server Error'));
            });
        }
    }

    //#endregion


    //#region depenancies / secondary lists needed for page

    getNegativeAdjustmentTypes() {
        return new Promise((resolve, reject) => {
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

    // This method loads most of the supporting lists for the page
    loadDependancies() {
        // Negative Adjustment Types
        this.getNegativeAdjustmentTypes().then((res: any[]) => {
            this.negativeAdjustmentTypes = res.filter(x => x.IsPositive === false && x.IsActive === true);
        });
        // TeethDefinitions store
        this.staticData.TeethDefinitions().then((res: any) => {
            this.allTeeth = res.Value.Teeth;
            // NOTE ? this seems wrong, these are only used by the proposed-service-create-update and should be
            // loaded there (outside of scope)
            this.patientOdontogramFactory.TeethDefinitions = res.Value;
        });
        // CdtCodeGroups
        this.staticData.CdtCodeGroups().then((res: any) => {
            // NOTE ? this seems wrong, these are only used by the proposed-service-create-update and should be
            // loaded there (outside of scope)
            this.patientOdontogramFactory.CdtCodeGroups = res.Value;
        });

        // userLocation
        this.locationServices.get({ Id: this.location.id }).$promise.then(res => {
            this.userLocation = res.Value;
        });

        // payment types
        // TODO add localization to the description
        // tslint:disable-next-line: max-line-length
        // NOTE from patient-checkout-refactor --backend requires 2 and 4 for the adjustment types, not sure if 3 is correct or if something else is required
        this.paymentAdjustmentTypes = [
            { PaymentAdjustmentTypeId: 2, Description: 'Apply Payment' },
            { PaymentAdjustmentTypeId: 4, Description: 'Apply Negative Adjustment' },
            { PaymentAdjustmentTypeId: 7, Description: 'Apply Credit' }
        ];
        // TODO add localization to the description
        // tslint:disable-next-line: max-line-length
        // NOTE from patient-checkout-refactor -- backend requires 2 and 4 for the adjustment types, not sure if 3 is correct or if something else is required
        this.paymentAdjustmentTypes2 = [
            { PaymentAdjustmentTypeId: 2, Description: 'Apply Payment' },
            { PaymentAdjustmentTypeId: 4, Description: 'Apply Negative Adjustment' }
        ];

        // get providers for this location
        this.providers = this.teamMemberLocationService.getProvidersByUserLocationSetups(this.location?.id);

        // get all other providers for lookup
        this.allProvidersList = this.referenceDataService.get(this.referenceDataService.entityNames.users);
    }

    //#endregion

    //#region authentication

    // redirect if no permission for checkout
    getAuthAccess() {
        const authAccess = new AuthAccess();
        if (this.patSecurityService.IsAuthorizedByAbbreviation('soar-acct-enctr-chkout')) {
            authAccess.view = true;
        } else {
            // Notify user, he is not authorized to access current area
            this.toastrFactory.error(this.patSecurityService.generateMessage('soar-acct-enctr-chkout'), 'Not Authorized');
            this.cancel.emit();
        }
        // also set canAddPaymentAuthorization which is used at checkout
        this.canAddPaymentAuthorization = this.patSecurityService.IsAuthorizedByAbbreviation('soar-acct-aapmt-add');
        return authAccess;
    }

    //#endregion

    //#region process checkoutInfo.CreditTransactionsDtoList

    // pass checkoutInfo.CreditTransactionDtoList to payments for handling
    // this method just notifies if get fails
    loadCreditTransactions(checkoutInfo) {
        this.creditTransactions = [];
        if (checkoutInfo.CreditTransactionDtoList) {
            this.creditTransactions = checkoutInfo.CreditTransactionDtoList;
        } else {
            // tslint:disable-next-line: max-line-length
            this.toastrFactory.error(this.translate.instant('An error has occurred while getting credit transactions'),
                this.translate.instant('Server Error'));
        }
    }

    //#endregion

    //#region load encounters

    // This method is pretty much the same as the one in patient-checkout-refactor
    // At some point it would simplify the code if some of this was offloaded to services, etc ...but for now
    // also i hate some of the let names like dataForPage (way too general)
    // NOTE, this call to the modalDataFactory reloads the patientEncounters to PendingEncounters
    // also returns the following (We need to find out if we need all of this)
    // AccountMemberDetails
    // AccountMembersList
    // CurrentPatient
    // PaymentTypes
    //

    // this method loads the following:
    // accountMemberDetails
    // accountMembersList
    // currentPatient
    // providers (also adds dynamic properties for providers)
    // calls
    // getFeeScheduleAdjustments
    // processRequiredPropertiesForServiceTransaction
    // setData (which continues process of loading todays encounters)
    getEncounterData() {
        this.modalDataFactory.GetCheckoutModalData(null, this.patientId, this.accountId, this.patientEncounters).then((res) => {
            this.dataForPage = res;
            this.paymentTypes = this.dataForPage.PaymentTypes.Value;
            this.accountMembersDetails = this.dataForPage.AccountMembersDetail.Value;
            this.accountMembersList = this.dataForPage.AccountMembersList.Value;
            // TODO do we need this when we already have patientInfo?
            this.currentPatient = this.dataForPage.CurrentPatient;
            // setFeeSchedules
            this.getFeeScheduleAdjustments(this.checkoutInfo);
            //
            this.setData(this.dataForPage);

        });
    }


    getProviderName(providerUserId, providers: any[]) {
        const provider = providers.find(x => x.UserId === providerUserId);
        return provider
            ? provider.FirstName + ' ' + provider.LastName + (provider.ProfessionalDesignation ? ', ' + provider.ProfessionalDesignation : '')
            : '';
    }

    // each encounter needs patient name for display purposes
    getPatientName(accountMemberId) {
        // tslint:disable-next-line: max-line-length
        const matchingPatientDetail = this.accountMembersDetails.find(accountMemberDetail => accountMemberDetail.AccountMemberId === accountMemberId);
        if (matchingPatientDetail) {
            const matchingPatient = this.accountMembersList.find(accountMember => accountMember.PatientId === matchingPatientDetail.PersonId);
            if (matchingPatient) {
                // use best practices patient name
                const bestPracticePatientName = this.bestPracticePatientNamePipe.transform(matchingPatient);
                return bestPracticePatientName ? bestPracticePatientName : '';
            } else {
                return '';
            }
        } else {
            return '';
        }
    }

    // this method takes the dataForPage data (loaded in getEncounterData) and does further processing on the
    // dataForPage.PendingEncounters
    // loads allEncounters which is the encounters that displays in the 'todays encounters' area of the checkout page
    // TODO we have to break this into a more manageable method
    setData(dataForPage) {
        this.feeScheduleAdjustments = [];
        const checkedOutEncounters = [];
        this.allEncounters = [];
        this.priorBalances = [];
        const encountersToAdd = [];
        dataForPage.PendingEncounters = this.patientEncounters;

        dataForPage.PendingEncounters.forEach(encounter => {
            // add name to encounters
            encounter.PatientName = this.getPatientName(encounter.AccountMemberId);

            // group services by date to determine ServicesHaveDifferentDates (display ... if true)
            const serviceDates = [...new Set(encounter.ServiceTransactionDtos.map(a => new Date(a.DateEntered).toLocaleDateString()))];
            encounter.servicesHaveDifferentDates = (serviceDates.length > 1) ? true : false;

            // encounter display date should be oldest service date
            const datesToCompare = encounter.ServiceTransactionDtos.map(a => a.DateEntered);
            if (datesToCompare) {
                datesToCompare.sort();
                encounter.displayDate = datesToCompare[0];
            } else {
                encounter.displayDate = encounter.ServiceTransactionDtos[0].DateEntered;
            }
            // handle display date for encounter
            if (!encounter.displayDate.toLowerCase().endsWith('z')) {
                encounter.displayDate += 'Z';
            }

            // sort serviceTransactions by InsuranceOrder
            encounter.ServiceTransactionDtos.sort((x, y) => (x.InsuranceOrder > y.InsuranceOrder) ? -1 : 1);

            // add benefit plan data to each encounter so we don't have to continually look it up
            this.addBenefitPlanData(encounter);
            // set dynamic properties on serviceTransactions
            this.processRequiredPropertiesForServiceTransaction(encounter);
            // calculate the balance due NOTE, this may not be the right place to do this but this was previously calculated from a call
            // from the dom which is not performant
            this.getEncounterBalanceDue(encounter);
            // if encounterId was passed in route param then this is a checkout for one encounter
            // if not, then this is checkout for all pending encounters
            if (encounter.Status === 2 && (!this.encounterId || this.encounterId === encounter.EncounterId)) {
                encountersToAdd.push(encounter);
            }
            // checkedOutEncounters
            if (encounter.Status === 1) {
                checkedOutEncounters.push(encounter);
            }
        });
        this.allEncounters = this.allEncounters.concat(encountersToAdd);
        // sort encounters sort by patient name then most recent first
        this.allEncounters.sort((x, y) => {
            return x.PatientName.localeCompare(y.PatientName) || y.displayDate.localeCompare(x.displayDate);
        });
        // sort services by InsuranceOrder
        this.allEncounters.forEach(encounter => {
            encounter.ServiceTransactionDtos.sort((x, y) => (x.InsuranceOrder > y.InsuranceOrder) ? 1 : -1);
        });


        //#endregion

        //#region Prior Balances        
        this.loadAllDebitTransactions(checkedOutEncounters, this.debitTransactions);

        // NOTE...most of the next code dealing with prior balances can go away, but i'm not sure how encounterServiceToClaims is used so...
        // NOTE, should we move priorBalances work to another component...
        // TODO in another pbi
        // the following has been stubbed out to use in a following sprint since it was in the original method in this form
        // left it here until I have a better understanding of how that will work.
        // Also, this is another place we're looping thru the encounters and service transacdtions, we need to find a way to only do that once
        checkedOutEncounters.forEach(checkedOutEncounter => {
            if (checkedOutEncounter.BalanceDue > 0) {
                // filter out any deleted ServiceTransactions
                checkedOutEncounter.ServiceTransactionDtos = checkedOutEncounter.ServiceTransactionDtos.filter(x => x.IsDeleted === false);
                const encounterServiceToClaims = [];
                checkedOutEncounter.ServiceTransactionDtos.forEach(serviceTransaction => {
                    // tslint:disable-next-line: max-line-length
                    const serviceToClaim = this.serviceTransactionToClaimDtoList.find(x => x.ServiceTransactionId === serviceTransaction.ServiceTransactionId);
                    if (serviceToClaim) {
                        encounterServiceToClaims.push(serviceToClaim);
                    }
                });

                if (encounterServiceToClaims.length > 0) {
                    checkedOutEncounter.AreCreatingClaimOnCheckout = true;
                    checkedOutEncounter.serviceToClaims = encounterServiceToClaims;
                }
                // TODO rename this to encountersWithPriorBalances..i like descriptive names
                this.priorBalances.push(checkedOutEncounter);

                // NOTE, it seems wrong to be looping thru the same list of checkedOutEncounter (same as above)
                // but i'm just migrating this code so don't want to change the code here...this should be revisited.
                // FIX for ServiceTransactionVerifier not to update the balance on prior balance encounter
                checkedOutEncounter.ServiceTransactionDtos.forEach(serviceTransaction => {
                    serviceTransaction.Amount = 0;
                    serviceTransaction.IsBalanceAlreadyUpdated = true;
                });
            }
        });

        // create our serviceAndDebitTransactionDtos list of service references from the encounters
        // NOTE loadServiceAndDebitTransactionDtos was called set2dServiceList
        this.loadServiceAndDebitTransactionDtos();

        // get totals
        // NOTE this is done in the summary too
        // I have to have it here to set the total for the Credit Transaction
        // TODO this leads me to think i should have a service that i can call to get these totals that can be called from both
        this.updateTotals();

        // TODO do we need this
        this.patientCheckoutService.resetCurrentCreditTransaction(this.creditTransactionDto, this.creditTransactionDtoList);
        // set up the adjustment amounts of services on the creditTransactionDto
        this.updateServiceAdjustmentAmount();

        // this is run only on initial load properly initialize details for all services
        this.initializeCreditTransactionDetails();

        this.adjustmentEncounters = [];

        // TODO this is wierd...we do this exact thing in the getFeeScheduleAdjustments to set some dynamic properties
        // add TotalAdjustedEstimate to all encounters looking to move this to prevent looping through encounters twice
        // see
        this.allEncounters.forEach(encounter => {
            if (encounter.benefitPlan &&
                encounter.benefitPlan.PolicyHolderBenefitPlanDto.BenefitPlanDto.ApplyAdjustments === 1 &&
                encounter.benefitPlan.PolicyHolderBenefitPlanDto.BenefitPlanDto.FeesIns === 2
                && encounter.hasAdjustedEstimate === true) {
                this.adjustmentEncounters.push(encounter);
            }

            // set the initial value of the canCreateClaims checkbox for encounter
            // TODO move this to a more centralized method
            this.setSummaryRowClaimsCheckbox(encounter);
            this.setSummaryRowClaimsCheckboxTooltip(encounter);
            encounter.TotalAdjustedEstimate = parseFloat(encounter.TotalAdjustedEstimate.toFixed(2));
        });

        // load FeeScheduleAdjustments to creditTransactionDtoList
        if (this.adjustmentEncounters.length > 0) {
            // TODO
            this.adjustmentEncounters.forEach(encounter => {
                this.buildFeeScheduleAdjustment(encounter);
            });
        }
        // check to see if there are any invalid serviceCodes
        if (this.hasInvalidServiceCodes() === false) {
            this.loadingCheckout = false;
            this.disableSummary = false;
        }
    }

    // maps all the services in encounters to a serviceAndDebitTransactionDtos list
    // NOTE this is the another time we're double looping thru the same list (allEncounters and serviceTransactions) to glean a list
    // so this is affecting performance
    // NOTE loadServiceAndDebitTransactionDtos was called set2dServiceList
    loadServiceAndDebitTransactionDtos() {
        this.serviceAndDebitTransactionDtos = [];
        this.allEncounters.forEach(encounter => {
            encounter.ServiceTransactionDtos.forEach(serviceTransaction => {
                serviceTransaction.EncounterType = 'Current';
                serviceTransaction.BaseAdjustmentAmount = serviceTransaction.AdjustmentAmount;
                this.serviceAndDebitTransactionDtos.push(serviceTransaction);
                serviceTransaction.Detail = this.getServiceDetail(serviceTransaction.ServiceTransactionId);
            });
        });

        if (this.includePriorBalance) {
            this.priorBalances.forEach(priorBalance => {
                priorBalance.ServiceTransactionDtos.forEach(serviceTransaction => {
                    serviceTransaction.EncounterType = 'Prior';
                    serviceTransaction.BaseAdjustmentAmount = serviceTransaction.AdjustmentAmount;
                    this.serviceAndDebitTransactionDtos.push(serviceTransaction);
                    // DebitTransaction or ServiceTransactionId?
                    if (serviceTransaction.DebitTransactionId) {
                        serviceTransaction.Detail = this.getDebitTransactionDetail(serviceTransaction.DebitTransactionId);
                    } else {
                        serviceTransaction.Detail = this.getServiceDetail(serviceTransaction.ServiceTransactionId);
                    }
                });
            });
        }
    }

    // creates a list of serviceTransactions to be sent to recalculate insurance
    getServiceTransactionInsuranceList() {
        let serviceTransactionsForInsuranceList = [];
        let pendingEncounters = [];
        pendingEncounters = this.patientEncounters.filter(encounter => encounter.Status === 2);
        serviceTransactionsForInsuranceList = pendingEncounters.map(encounter => encounter.ServiceTransactionDtos);
        return serviceTransactionsForInsuranceList;
    }

    // find matching creditTransactionDetail or create a new one based on debitTransactionId
    getDebitTransactionDetail(debitTransactionId) {
        // find the serviceTransaction in creditTransactionDto.CreditTransactionDetails by serviceTransactionId
        let transaction = this.creditTransactionDto.CreditTransactionDetails.
            filter(detail => detail.AppliedToDebitTransactionId === debitTransactionId);
        if (transaction && transaction.length > 0) {
            return transaction[0];
        } else {
            // find the transaction in priorBalance.ServiceTransactionDtos by debitTransactionId
            const encounter = this.priorBalances.find(priorBalance =>
                (priorBalance.ServiceTransactionDtos.find(x => x.DebitTransactionId === debitTransactionId)));
            if (encounter) {
                this.creditTransactionDto.CreditTransactionDetails.push(
                    {
                        AppliedToDebitTransactionId: debitTransactionId, Amount: 0,
                        EncounterId: encounter.EncounterId,
                        AccountMemberId: encounter.AccountMemberId
                    });
            } else {
                // otherwise just add it
                this.creditTransactionDto.CreditTransactionDetails.push(
                    { AppliedToDebitTransactionId: debitTransactionId, Amount: 0, EncounterId: null, AccountMemberId: null });
            }
            transaction = this.creditTransactionDto.CreditTransactionDetails.
                filter(detail => detail.AppliedToDebitTransactionId === debitTransactionId);
            return transaction[0];
        }
    }

    // This method is needed to for creditTransactionDto to create CreditTransactionDetails for serviceTransactions
    getServiceDetail(serviceTransactionId) {
        // find the serviceTransaction in creditTransactionDto.CreditTransactionDetails by serviceTransactionId
        let transaction = this.creditTransactionDto.CreditTransactionDetails.
            filter(detail => detail.AppliedToServiceTransationId === serviceTransactionId);
        if (transaction && transaction.length > 0) {
            return transaction[0];
        } else {
            // find the serviceTransaction in priorBalance.ServiceTransactionDtos by serviceTransactionId
            const encounter = this.priorBalances.find(priorBalance =>
                (priorBalance.ServiceTransactionDtos.find(x => x.ServiceTransactionId === serviceTransactionId)));
            if (encounter) {
                this.creditTransactionDto.CreditTransactionDetails.push(
                    {
                        AppliedToServiceTransationId: serviceTransactionId, Amount: 0,
                        EncounterId: encounter.EncounterId, AccountMemberId: encounter.AccountMemberId
                    });
            } else {
                // otherwise just add it
                this.creditTransactionDto.CreditTransactionDetails.push(
                    { AppliedToServiceTransationId: serviceTransactionId, Amount: 0, EncounterId: null, AccountMemberId: null });
            }
            transaction = this.creditTransactionDto.CreditTransactionDetails.
                filter(detail => detail.AppliedToServiceTransationId === serviceTransactionId);
            return transaction[0];
        }
    }

    // #endregion

    // Note, this should always be called after calculateServiceTransactionAmounts...
    // how can we make sure this happens
    getEncounterBalanceDue(encounter) {
        let balanceDue = 0;
        encounter.ServiceTransactionDtos.forEach(serviceTransaction => {
            balanceDue += serviceTransaction.DueNow;
        });
        encounter.BalanceDue = balanceDue.toFixed(2);
    }

    // computed properties on service transactions
    processRequiredPropertiesForServiceTransaction(encounter) {
        // set default for encounter
        encounter.hasAdjustedEstimate = false;
        encounter.TotalAdjustedEstimate = 0;
        encounter.ServiceTransactionDtos.forEach(serviceTransaction => {
            const serviceCodeItem = this.serviceCodes.find(x => x.ServiceCodeId === serviceTransaction.ServiceCodeId);
            if (serviceCodeItem) {
                serviceTransaction.AffectedAreaId = serviceCodeItem.AffectedAreaId;
                serviceTransaction.IsEligibleForDiscount = serviceCodeItem.IsEligibleForDiscount;
                serviceTransaction.UseCodeForRangeOfTeeth = serviceCodeItem.UseCodeForRangeOfTeeth;
                serviceTransaction.UsuallyPerformedByProviderTypeId = serviceCodeItem.UsuallyPerformedByProviderTypeId;
                serviceTransaction.CdtCodeId = serviceCodeItem.CdtCodeId;
                serviceTransaction.SubmitOnInsurance = serviceCodeItem.SubmitOnInsurance;
            }
            // handle display date for serviceTransactions
            serviceTransaction.DateEnteredDisplay = serviceTransaction.DateEntered.toString();
            if (!serviceTransaction.DateEnteredDisplay.toLowerCase().endsWith('z')) {
                serviceTransaction.DateEnteredDisplay += 'Z';
            }
            const split = serviceTransaction.Description.split(':');
            serviceTransaction.CompleteDescription = split[1];
            serviceTransaction.AdjustmentAmount = serviceTransaction.AdjustmentAmount || 0;
            serviceTransaction.Code = serviceTransaction.Description.slice(0, 5);
            serviceTransaction.ProviderName = this.getProviderName(serviceTransaction.ProviderUserId, this.providers);
            serviceTransaction.ProviderNameOnClaim = this.getProviderName(serviceTransaction.ProviderOnClaimsId, this.allProvidersList);
            // for grouping (prior balances)
            serviceTransaction.PatientName = this.getPatientName(serviceTransaction.AccountMemberId);
            // add Surfaces, Roots, and Tooth to ExtendedDescription
            serviceTransaction.ExtendedDescription = serviceTransaction.Description;
            if (serviceTransaction.Tooth) {
                serviceTransaction.ExtendedDescription += (' #' + serviceTransaction.Tooth);
            }
            if (serviceTransaction.RootSummaryInfo) {
                serviceTransaction.ExtendedDescription += (', ' + serviceTransaction.RootSummaryInfo);
            }
            if (serviceTransaction.SurfaceSummaryInfo) {
                serviceTransaction.ExtendedDescription += (', ' + serviceTransaction.SurfaceSummaryInfo);
            }

            // claims
            if (encounter.benefitPlan) {
                serviceTransaction.canCreateClaim = (serviceTransaction.CdtCodeId && serviceTransaction.SubmitOnInsurance === true) ? true : false;
                serviceTransaction.CreateClaim = serviceTransaction.canCreateClaim;
                // default CreateClaim to false if SubmitClaims is false (make sure object exists before querying)
                if (encounter.benefitPlan.PolicyHolderBenefitPlanDto && encounter.benefitPlan.PolicyHolderBenefitPlanDto.BenefitPlanDto && encounter.benefitPlan.PolicyHolderBenefitPlanDto.BenefitPlanDto.SubmitClaims === false) {
                    serviceTransaction.CreateClaim = false;
                }
                serviceTransaction.hasBenefitPlan = true;
                if (serviceTransaction.canCreateClaim === false) {
                    serviceTransaction.claimsTooltip = 'The service must have a CDT code assigned and be marked to submit to insurance.';
                }
                // set TotalAdjustedEstimate, hasAdjustedEstimate based on serviceTransactions

                if (serviceTransaction.InsuranceEstimates) {
                    // tslint:disable-next-line: max-line-length
                    const estimates = serviceTransaction.InsuranceEstimates.filter(insEst => insEst.PatientBenefitPlanId === encounter.benefitPlan.PatientBenefitPlanId);
                    if (estimates) {
                        encounter.TotalAdjustedEstimate += estimates.reduce((a, b) => a + b.AdjEst, 0);
                    }
                    if (serviceTransaction.InsuranceEstimates.length > 0 && serviceTransaction.InsuranceEstimates[0].AdjEst > 0) {
                        encounter.hasAdjustedEstimate = true;
                    }
                }
            } else {
                serviceTransaction.canCreateClaim = false;
                serviceTransaction.CreateClaim = false;
                serviceTransaction.hasBenefitPlan = false;
                serviceTransaction.claimsTooltip = 'The patient does not have a benefit plan attached.';
            }
            this.patientCheckoutService.calculateServiceTransactionAmounts(serviceTransaction);

        });
    }


    // TODO, it would be nice if this could be moved to the service layer, pretty intense logic to be handled by the UI
    // if hasFeeScheduleAdjustments is true, do not include fee schedule adjustments in estimated insurance and do show as separate line item
    // does encounter have a negative adjustment, setting this here so we don't have to calculate each time we do summary
    // What this accomplishes: if at least one encounter.ServiceTransactionDtos has an InsuranceEstimates[0].AdjEst amount over 0
    // then the encounter has adjusted insurance estimates.
    // calculate hasFeeScheduleAdjustments
    getFeeScheduleAdjustments(checkoutInfo) {
        this.loadingFeeScheduleAdjustments = false;
        checkoutInfo.EncounterDtoList.forEach(encounter => {
            this.addBenefitPlanData(encounter);
            encounter.hasAdjustedEstimate = false;
            encounter.hasFeeScheduleAdjustments = false;
            // tried to avoid looping thru service transactions here but its the only way to set the hasAdjustedEstimate
            // TODO look for ways to limit looping ....
            // NOTE, we're not sure that serviceTransaction.InsuranceEstimates[0].AdjEst will always be correct, the intention
            // being that the insurance with Priority 0 would be the record that should determine this.
            // We're leaving for now but anticipate revisting, also note this determines whether hasFeeScheduleAdjustments can be true
            encounter.ServiceTransactionDtos.forEach(serviceTransaction => {
                serviceTransaction.encounterHasFeeScheduleAdjustments = false;
                if (serviceTransaction.InsuranceEstimates && serviceTransaction.InsuranceEstimates.length > 0 &&
                    serviceTransaction.InsuranceEstimates[0].AdjEst > 0) {
                    encounter.hasAdjustedEstimate = true;
                    if (encounter.benefitPlan
                        && encounter.benefitPlan.PolicyHolderBenefitPlanDto.BenefitPlanDto.ApplyAdjustments === 1
                        && encounter.benefitPlan.PolicyHolderBenefitPlanDto.BenefitPlanDto.FeesIns === 2) {
                        encounter.hasFeeScheduleAdjustments = true;
                        serviceTransaction.encounterHasFeeScheduleAdjustments = true;
                        this.loadingFeeScheduleAdjustments = true;
                    }
                }
            });
        });
    }


    loadPatientEncounters(checkoutInfo) {
        if (checkoutInfo.EncounterDtoList) {
            this.patientEncounters = this.patientEncounters.concat(checkoutInfo.EncounterDtoList);
            this.patientEncounters = this.patientEncounters.filter(encounter => encounter.ServiceTransactionDtos.length > 0); //filter out corrupt encounter data (ex: no services on encounter)
            this.getEncounterData();
        } else {
            // tslint:disable-next-line: max-line-length
            this.toastrFactory.error(this.translate.instant('An error has occurred while getting all encounters'),
                this.translate.instant('Server Error'));
        }
    }
    // TODO this should be renamed to reflect what is actually happening
    // TODO test that this is sorted by Priority
    loadBenefitPlans(planObject: any) {
        this.plansTrimmed = [];
        this.allMemberPlans = [];
        if (planObject && Object.keys(planObject).length) {
            Object.values(planObject).forEach(x => {
                // sort the plans by Priority
                let patientPlans = x as any;
                patientPlans = patientPlans.sort((a, b) => a.Priority - b.Priority);
                patientPlans.forEach(plan => {
                    this.plansTrimmed.push({
                        Patient: plan.PatientId,
                        BenefitPlanId: plan.BenefitPlanId,
                        Name: plan.PolicyHolderBenefitPlanDto.BenefitPlanDto.Name + ' (Primary)',
                        PatientBenefitPlanId: plan.PatientBenefitPlanId,
                        Carrier: plan.PolicyHolderBenefitPlanDto.BenefitPlanDto.CarrierName,
                        Priority: plan.Priority
                    });
                });
                this.allMemberPlans = this.allMemberPlans.concat(patientPlans);
            });
        }

    }

    //#endregion





    toggleShowTodaysEncounters() {
        this.showTodaysEncounters = !this.showTodaysEncounters;
    }

    // set the summary row Claims checkbox for the encounter based on
    // if any individual service on the Encounter fits the criteria to have 'Claim' checked
    // Display a Checked 'Claim' checkbox associated with the Summary row
    // if not Display an Un-Checked 'Claim' checkbox
    setSummaryRowClaimsCheckbox(encounter) {
        if (encounter) {
            encounter.disableCreateClaims = false;
            // indicates encounter has at least one service that is eligible for a claim
            encounter.canCreateClaims = encounter.ServiceTransactionDtos.some(x => x.canCreateClaim === true);
            // default state of checkbox
            encounter.CreateClaims = encounter.canCreateClaims;
            // default CreateClaims to false if SubmitClaims is false (make sure object exists before querying)
            if (encounter.benefitPlan && encounter.benefitPlan.PolicyHolderBenefitPlanDto && encounter.benefitPlan.PolicyHolderBenefitPlanDto.BenefitPlanDto && encounter.benefitPlan.PolicyHolderBenefitPlanDto.BenefitPlanDto.SubmitClaims === false) {
                encounter.CreateClaims = false;
            }
            encounter.AreCreatingClaimOnCheckout = encounter.CreateClaims;
            // boolean which prevents individual services from having the CreateClaim checkbox checked manually if false
            // encounter.allowSelectClaims = encounter.canCreateClaims === true ? true : false;
            encounter.allowSelectClaims = false;
            // reset serviceTransaction amounts based on claims checkbox
        }
    }

    setSummaryRowClaimsCheckboxTooltip(encounter) {
        if (encounter) {
            encounter.disableCreateClaimsTooltip = encounter.canCreateClaims === true ? '' :
                'There are no services marked to submit to insurance';
        }
    }


    // toggle all services in this encounter CreateClaim equals not CreateClaim
    toggleEncounterCreateClaims(encounter) {
        if (encounter.canCreateClaims === true && this.disableCreateClaims === false) {
            // toggle all serviceTransaction checkboxes in this encounter
            this.toggleClaimSelected(encounter.ServiceTransactionDtos, encounter.CreateClaims, encounter);
        }
    }


    // toggle list of serviceTransactions 
    // Note, this may only be one if called from the service checkbox method, or multiple if called from summary row
    toggleClaimSelected(serviceTransactions, createClaims, encounter) {
        this.disableSummary = true;
        // trigger update on child component
        this.updateSummary = !this.updateSummary;
        // indicator for whether or not we need to recalculate an existing fee schedule adjustment
        let affectsFeeScheduleAdjustment = false;
        // change CreateClaim property and recalculate transaction amounts based on change
        serviceTransactions.forEach(serviceTransaction => {
            // does this change affect a feeSchedule adjustment
            // NOTE, we have to check to see if original insurance had a fee schedule adjustment as well as the new estimate below
            // in either case, we need to remove fee schedules adjustments and recalculate 
            if (serviceTransaction.InsuranceEstimates.length > 0 && serviceTransaction.InsuranceEstimates[0].AdjEst > 0) {
                affectsFeeScheduleAdjustment = true;
            }
            if (serviceTransaction.canCreateClaim === true && this.disableCreateClaims === false) {
                // createClaim is always the current value, so we need to flip it 
                let originalCreateClaimValue = serviceTransaction.CreateClaim;
                serviceTransaction.CreateClaim = !createClaims;
                this.resetInsuranceEstimate(serviceTransaction, originalCreateClaimValue);
            }
        });
        let numberOfClaimsServices = encounter.ServiceTransactionDtos.filter(serviceTransaction => serviceTransaction.CreateClaim === true);
        // determine AreCreatingClaimOnCheckout
        encounter.CreateClaims = numberOfClaimsServices.length > 0 ? true : false;
        encounter.AreCreatingClaimOnCheckout = encounter.CreateClaims;

        // get a list of serviceTransactions in all pending encounters in this checkout
        const serviceTransactionsEstimates = this.getServiceTransactionEstimatesList();

        // we need to recalculate insurance when CreateClaims changes on any service because this can affect other services
        // this means we also need to recalculate the fee schedule adjustments because a change in coverage may affect one
        // or all of the fee schedule adjustments 

        // get a list of services guids to exclude from  calculations because no claim is being created
        const servicesToExclude = this.getServicesToExclude();

        this.calculateServiceEstimates(serviceTransactionsEstimates, servicesToExclude, this.feeScheduleAdjustmentRemoved).then(() => {
            // recalculate service totals for all encounters being checked out
            this.allEncounters.forEach(encounter => {
                encounter.ServiceTransactionDtos.forEach(serviceTransaction => {
                    this.patientCheckoutService.calculateServiceTransactionAmounts(serviceTransaction);
                    // does this change affect a feeSchedule adjustment
                    if (serviceTransaction.InsuranceEstimates.length > 0 && serviceTransaction.InsuranceEstimates[0].AdjEst > 0 && serviceTransaction.CreateClaim === true) {
                        affectsFeeScheduleAdjustment = true;
                    }
                });
                // resets DueNow for each encounter
                this.getEncounterBalanceDue(encounter);
            })
            if (affectsFeeScheduleAdjustment) {
                // build new fee schedule adjustments for all eligible encounters
                // this insures changes to one encounter that might affect another fee schedule adjustment are considered             
                this.adjustmentEncounters.forEach(encounter => {
                    // remove any fee schedue adjustments for this encounter, then rebuild as needed
                    this.removeCreditTransactionForFeeScheduleAdjustments(encounter);
                    this.buildFeeScheduleAdjustment(encounter);
                });
            }
            // reset totals for checkout summary
            this.updateTotals();
            // update current credittransaction to reflect change of claims checkbox
            this.resetCurrentCreditTransactionDistribution();
            this.disableSummary = false;
            // trigger update on child component
            this.updateSummary = !this.updateSummary;
        });
    }

    // manually reset InsuranceEstimate
    // Do not call to recalculate api as the user will expect values to stay the same as cart when / if they recheck the service
    resetInsuranceEstimate(serviceTransaction, originalCreateClaimValue) {
        // if CreateClaim value is changing and we're setting CreateClaim to false, 0 out estimates
        // and update the insurance estimate
        if (serviceTransaction.CreateClaim === false && originalCreateClaimValue === true) {
            // add this service transaction to backup list in case we need to restore it
            let cloneServiceTransaction = cloneDeep(serviceTransaction)
            this.backupServiceTransactionDtos.push(cloneServiceTransaction);
        }
        // if CreateClaim value is changing and we're setting CreateClaim to true, 
        // restore the original insurance estimates
        if (serviceTransaction.CreateClaim === true && originalCreateClaimValue === false) {
            // find backup of serviceTransaction
            let originalServiceTransaction = this.backupServiceTransactionDtos.find(backupServiceTransaction => {
                return backupServiceTransaction.ServiceTransactionId === serviceTransaction.ServiceTransactionId;
            })
            if (originalServiceTransaction) {
                serviceTransaction.TotalAdjEstimate = originalServiceTransaction.TotalAdjEstimate;
                serviceTransaction.TotalEstInsurance = originalServiceTransaction.TotalEstInsurance;
                serviceTransaction.Balance = originalServiceTransaction.Balance;
                // reset Insurance estimates to original values
                serviceTransaction.InsuranceEstimates = originalServiceTransaction.InsuranceEstimates;
            }
            // remove from backup
            const ndx = this.backupServiceTransactionDtos.indexOf(originalServiceTransaction);
            if (ndx !== -1) {
                this.backupServiceTransactionDtos.splice(ndx, 1)
            }
        }
    }

    toggleShowPriorBalance() {
        this.showPriorBalance = !this.showPriorBalance;
    }

    // if claim checkbox is unchecked / checked, balanceDue changes and we may need to recalculate distribution
    // if creditTransaction.Amount is > 0 this means the user has a current creditTransaction that hasn't been finalized (Save Distribution)
    // if so we need to redistribute based on the new BalanceDue amounts
    async resetCurrentCreditTransactionDistribution() {
        if (this.creditTransactionDto && this.creditTransactionDto.Amount > 0) {
            this.disableSummary = true;
            // clone a copy in order to reset the top level values of the CreditTransaction
            const creditTransaction = cloneDeep(this.creditTransactionDto);
            // remove the current creditTransaction
            await this.removeCredit(this.creditTransactionDto);
            // reset the CreditTransaction properties to accept creditTransaction amounts / properties
            this.patientCheckoutService.resetCurrentCreditTransaction(
                this.creditTransactionDto, this.creditTransactionDtoList);
            this.creditTransactionDto.TransactionTypeId = creditTransaction.TransactionTypeId;
            this.creditTransactionDto.PaymentTypeId = creditTransaction.PaymentTypeId;
            this.creditTransactionDto.PromptTitle = creditTransaction.PromptTitle;
            this.creditTransactionDto.PaymentTypePromptValue = creditTransaction.PaymentTypePromptValue;
            this.creditTransactionDto.AdjustmentTypeId = creditTransaction.AdjustmentTypeId;
            this.creditTransactionDto.Amount = creditTransaction.Amount;
            this.creditTransactionDto.DateEntered = creditTransaction.DateEntered;
            this.creditTransactionDto.Description = creditTransaction.Description;
            this.creditTransactionDto.Note = creditTransaction.Note;

            // set boolean to automatically add CreditTransaction to creditTransactionDtoList after redistributing
            this.addCreditTransactionToList = true;
            // get correct distribution for this creditTransactionDto
            await this.updateCreditTransactionDtoDetails(this.includePriorBalance);
        }
    }

    // adds a CreditTransaction to creditTransactionDtoList
    addCreditDistribution() {
        // set DateEntered on all creditTransactionDetail to match Credit
        this.creditTransactionDto.CreditTransactionDetails.forEach(creditTransactionDetail => {
            creditTransactionDetail.DateEntered = this.creditTransactionDto.DateEntered;
        });
        // add creditTransactionDto to list
        const creditTransactionDto = cloneDeep(this.creditTransactionDto);
        this.creditTransactionDtoList.push(creditTransactionDto);

        // reset addCreditTransactionToList indicator
        this.addCreditTransactionToList = false;

        // update the services and set the Adjustment amount based on applied credits
        this.updateServiceAdjustmentAmount();

        // recalculate the total balance due for the encounters
        this.allEncounters.forEach(encounter => {
            this.getEncounterBalanceDue(encounter);
        });

        // update the totals
        this.updateTotals();
        this.disableCreditDistribution = false;
        this.allowSaveDistribution = false;
        this.hasDistributionChanges = false;
        this.disableSummary = false;
        // set disableCreateClaims
        this.setDisableCreateClaims();
    }


    async saveDistribution() {
        // check to make sure the current creditTransaction is still valid
        if (this.validateCreditTransactionDto(this.creditTransactionDto) === true) {
            // if valid, replace the creditTransaction that is already in the list with the manually modified one
            // clone creditTransactionDto
            const creditTransactionDto = cloneDeep(this.creditTransactionDto);
            // set marker that this CreditTransaction has PriorBalanceAmounts
            creditTransactionDto.hasPriorBalanceAmounts = this.checkHasPriorBalanceDistributions();

            // remove this creditTransaction from the list, then push the modified creditTransactionDto
            for (let indx = 0; indx < this.creditTransactionDtoList.length; indx++) {
                if (this.creditTransactionDtoList[indx].OriginalPosition === creditTransactionDto.OriginalPosition) {
                    this.creditTransactionDtoList.splice(indx, 1);
                    break;
                }
            }

            // push the modified creditTransaction to the list
            this.creditTransactionDtoList.push(creditTransactionDto);

            // update the services and set the Adjustment amount based on applied credits
            this.updateServiceAdjustmentAmount();

            // recalculate the total balance due for the encounters
            this.allEncounters.forEach(encounter => {
                this.getEncounterBalanceDue(encounter);
            });

            // reset the creditTransactionDto for next use
            this.patientCheckoutService.resetCurrentCreditTransaction(
                this.creditTransactionDto, this.creditTransactionDtoList);

            // get correct distribution for this creditTransactionDto
            await this.updateCreditTransactionDtoDetails();

            // set currentUnappliedAmount to zero, since this creditTransaction is no longer distributable
            this.currentUnappliedAmount = 0;

            // update the totals
            this.updateTotals();
            this.disableCreditDistribution = true;
            this.hasDistributionChanges = false;
            this.disableSummary = false;
            this.allowSaveDistribution = false;
        }
    }

    getPatientId(encounterId) {
        // get encounter
        let encounter = this.allEncounters.find(encounter => encounter.EncounterId === encounterId);
        let accountMemberId = encounter ? encounter.AccountMemberId : null;
        if (accountMemberId) {
            const matchingPatientDetail = this.accountMembersDetails.find(accountMemberDetail => accountMemberDetail.AccountMemberId === accountMemberId);
            if (matchingPatientDetail) {
                return matchingPatientDetail.PersonId;
            }
        }
        return null;
    }

    cancelCheckout(encounterId) {
        if (encounterId) {
            // routes to encounter
            let data = { EncounterId: encounterId, PatientId: null }
            data.PatientId = this.getPatientId(encounterId);
            this.cancel.emit(data);
        } else {
            this.cancel.emit();
        }
    }

    applyPayments() {
        // TODO
    }

    //#region breadcrumbs
    // per AW probably not going to have navigation breadcrumb here but at the very least will
    // need navigation on successful checkout or cancel checkout
    // TODO all breadcrumbs except AccountSummaryEncounter
    getPageNavigation() {
        if (this.fromLocation === 'Schedule') {
            // TODO maybe
        }
        if (this.fromLocation === 'AccountSummary') {
            this.breadCrumbs = [
                {
                    name: this.translate.instant('Patient Overview'),
                    path: '#/Patient/' + this.patientId + '/Overview/',
                    title: 'Patient Overview'
                },
            ];
        }
        if (this.fromLocation === 'AccountSummaryEncounter') {
            this.breadCrumbs = [
                {
                    name: this.translate.instant('Patient Overview'),
                    path: '#/Patient/' + this.patientId + '/Overview/',
                    title: 'Patient Overview'
                },
                {
                    name: this.translate.instant('Account Summary'),
                    path: '#/Patient/' + this.patientId + '/Summary/?tab=Account Summary',
                    title: 'Account Summary'
                },
                {
                    name: this.translate.instant('Encounter'),
                    // tslint:disable-next-line: max-line-length
                    path: '/Patient/' + this.patientId + '/Account/' + this.accountId + '/Encounter/' + this.encounterId + '/Encounters/AccountSummary',
                    title: 'Encounter'
                },
            ];
        }
        if (this.fromLocation === 'Clinical') {
            this.breadCrumbs = [
                {
                    name: this.translate.instant('Patient Overview'),
                    path: '#/Patient/' + this.patientId + '/Overview/',
                    title: 'Patient Overview'
                },
                {
                    name: this.translate.instant('Clinical'),
                    path: '#/Patient/' + this.patientId + '/Clinical',
                    title: 'Clinical'
                }
            ];
        }
        if (this.fromLocation === 'PatientOverviewEncounter') {
            this.breadCrumbs = [
                {
                    name: this.translate.instant('Patient Overview'),
                    path: '#/Patient/' + this.patientId + '/Overview/',
                    title: 'Patient Overview'
                },
                {
                    name: this.translate.instant('Account Summary'),
                    // tslint:disable-next-line: max-line-length
                    path: '/Patient/' + this.patientId + '/Account/' + this.accountId + '/Encounter/' + this.encounterId + '/Encounters/PatientOverview',
                    title: 'Encounter'
                },


            ];
        }



    }
    //#endregion

    //#region Benefit Plans

    addBenefitPlanData(encounter) {
        // find the person and plan
        let foundPlan;
        const person = this.accountMembersDetails.find(detail => detail.AccountMemberId === encounter.AccountMemberId);
        if (person) {
            // find plan with 0 priority and attach to encounter
            foundPlan = this.allMemberPlans.find(plan => plan.PatientId === person.PersonId && plan.Priority === 0);
        }

        encounter.benefitPlan = foundPlan ? foundPlan : null;
    }
    //#endregion

    //#region claims checkbox logic


    //#endregion

    //#region allDebitTransactions

    // NOTE, this is a departure from the way the patient-checkout-refactor handled the prior balance
    // and debit transactions.  Previously they were organized as encounters but never displayed.  The new
    // design calls for them to be organized by patient, then transaction.

    // next, get DebitTransactions, these will be loaded to the allDebitTransactions list and grouped by Patient
    getDebitTransactionsByAccountId() {
        return new Promise((resolve, reject) => {
            // tslint:disable-next-line: max-line-length
            this.patientServices.Encounter.getDebitTransactionsByAccountId({ accountId: this.accountId, includeFinanceCharge: true }, (res) => {
                resolve(res.Value);
            }, (err) => {
                // tslint:disable-next-line: max-line-length
                this.toastrFactory.error(this.translate.instant('Failed to retrieve the list of Debit Transactions. Refresh the page to try again.'),
                    this.translate.instant('Server Error'));
                resolve([]);
            });
        });
    }

    // This method loads previously checkout out encounters services and debitTransactions to the priorAdjustments list
    loadAllDebitTransactions(checkedOutEncounters, debitTransactions) {
        this.allDebitTransactions = [];
        this.priorBalanceTransactionsByPatient = [];
        // first load checked out encounters that have balances to the allDebitTransactions list
        checkedOutEncounters.forEach(checkedOutEncounter => {
            // filter out any deleted ServiceTransactions
            checkedOutEncounter.ServiceTransactionDtos = checkedOutEncounter.ServiceTransactionDtos.filter(x => x.IsDeleted === false);
            checkedOutEncounter.ServiceTransactionDtos.forEach(serviceTransaction => {
                if (serviceTransaction.Balance > 0 || serviceTransaction.Balance < 0) {
                    this.patientCheckoutService.calculateServiceTransactionAmounts(serviceTransaction);
                    serviceTransaction.DateEnteredDisplay = serviceTransaction.DateEntered.toString();
                    if (!serviceTransaction.DateEnteredDisplay.toLowerCase().endsWith('z')) {
                        serviceTransaction.DateEnteredDisplay += 'Z';
                    }
                    this.allDebitTransactions.push(serviceTransaction);
                }
            });
        });

        // Possible refactor...
        // For now we need to leave this 
        // debitTransaction.ServiceTransactionId = debitTransaction.DebitTransactionId;
        // because the DistributeCreditTransactionAmountAsync aggregator method uses that to set the AppliedToDebitTransactionId 
        // load priorAdjustments and push these to the allDebitTransactions array
        this.priorAdjustments = debitTransactions;
        this.priorAdjustments.forEach(debitTransaction => {
            if (!debitTransaction.IsDeleted) {
                debitTransaction.Code = '+ Adjustment';
                // TODO this will be revisited when we handle Prior Balance distribution
                debitTransaction.isAdjustment = true;
                debitTransaction.CompleteDescription = debitTransaction.Description;
                debitTransaction.ExtendedDescription = debitTransaction.Description;
                if (debitTransaction.ProviderUserId) {
                    debitTransaction.ProviderName = this.getProviderName(debitTransaction.ProviderUserId, this.providers);
                } else {
                    debitTransaction.ProviderName = '';
                }
                debitTransaction.Fee = debitTransaction.Balance;
                debitTransaction.EncounterId = debitTransaction.DebitTransactionId;
                debitTransaction.ServiceTransactionId = debitTransaction.DebitTransactionId;
                debitTransaction.TotalEstInsurance = 0;
                debitTransaction.TotalAdjEstimate = 0;
                debitTransaction.Discount = 0;
                debitTransaction.Tax = 0;
                // set PatientBalance computed property
                debitTransaction.PatientBalance = debitTransaction.Balance;
                debitTransaction.PatientName = this.getPatientName(debitTransaction.AccountMemberId);
                debitTransaction.Charges = debitTransaction.Amount;
                debitTransaction.AdjustmentAmount = 0;
                debitTransaction.DueNow = debitTransaction.Balance;
                debitTransaction.Amount = 0;
                debitTransaction.DateEnteredDisplay = debitTransaction.DateEntered.toString();
                if (!debitTransaction.DateEnteredDisplay.toLowerCase().endsWith('z')) {
                    debitTransaction.DateEnteredDisplay += 'Z';
                }
                this.allDebitTransactions.push(debitTransaction);

                // add to priorBalances so we can get totals that include positive adjustments
                const encounter = {
                    AdjustmentAmount: 0,
                    AccountMemberId: debitTransaction.AccountMemberId,
                    DataTag: debitTransaction.DataTag,
                    AreCreatingClaimOnCheckout: false,
                    DateModified: debitTransaction.DateEntered,
                    Date: debitTransaction.DateEntered,
                    Status: 1,
                    isAdjustment: true,
                    Description: debitTransaction.Description,
                    EncounterId: debitTransaction.DebitTransactionId,
                    UserModified: debitTransaction.UserModified,
                    ServiceTransactionDtos: []
                };
                encounter.ServiceTransactionDtos.push(debitTransaction);
                this.priorBalances.push(encounter);
            }
        });

        // reload the ServiceAndDebitTransactionDtos and update totals
        this.loadServiceAndDebitTransactionDtos();
        this.updateTotals();

        // TODO next, load debitTransactions to list
        // sort before grouping
        this.allDebitTransactions = this.allDebitTransactions.sort((x, y) => {
            return x.PatientName.localeCompare(y.PatientName) || x.DateEntered.localeCompare(y.DateEntered);
        });

        // group all debit transactions by AccountMemberId
        this.priorBalanceTransactionsByPatient = Array.from(new Set(this.allDebitTransactions.map(s => s.AccountMemberId)))
            .map(AccountMemberId => {
                return {
                    PatientName: this.getPatientName(AccountMemberId),
                    AccountMemberId,
                    ServiceTransactionDtos: this.allDebitTransactions.filter(x => x.AccountMemberId === AccountMemberId),
                    BalanceDue: 0
                };
            });
        // calculate the BalanceDue for each group of priorBalanceTransactions grouped by patient
        this.priorBalanceTransactionsByPatient.forEach(y => {
            y.BalanceDue = y.ServiceTransactionDtos.reduce((a, b) => {
                return b.DueNow == null ? a : a + b.DueNow;
            }, 0);
        });
    }

    //#endregion

    //#region FeeScheduleAdjustments

    // Create a CreditTransaction for FeeScheduleAdjustments one for each fee schedule adjustment on encounter  
    buildFeeScheduleAdjustment(encounter) {
        this.isFeeScheduleAdjustment = true;
        let adjustmentTotal = 0;

        const serviceTransactionDtos = [];
        encounter.ServiceTransactionDtos.forEach(serviceTransaction => {
            // reset balance to the AdjEst
            const serviceTransactionDto = cloneDeep(serviceTransaction);
            // include service only if CreateClaim = true            
            serviceTransactionDto.Balance = serviceTransaction.InsuranceEstimates && serviceTransaction.CreateClaim === true ?
                serviceTransaction.InsuranceEstimates[0].AdjEst : 0;
            serviceTransactionDtos.push(serviceTransactionDto);
            adjustmentTotal += serviceTransactionDto.Balance;
        });

        const distributionParams = {
            accountMemberId: serviceTransactionDtos[0].AccountMemberId,
            uiSuppressModal: true,
            amount: adjustmentTotal
        };

        // pass amount paid, and each of the service transactions to get the payments for each, then pass to success
        // tslint:disable-next-line: max-line-length
        this.patientServices.CreditTransactions.creditDistributionForSelectedServiceTransactions(distributionParams, serviceTransactionDtos).$promise.then((res: any) => {
            const details = res.Value;
            this.createCreditTransactionsForFeeScheduleAdjustments(details, encounter);
        }, (err) => {
            // NOTE patient-checkout-refactor doesn't have action when this fails...should there be?
            console.log(err)
        });
    }


    // calculates total fee schedule adjustments for this encounter based on CreateClaim being checked
    // and hasFeeScheduleAdjustments = true;Adjust Off	Time of Charge	Negative Adjustment Impacts Production
    // hasFeeScheduleAdjustments is determined by benefitPlan.PolicyHolderBenefitPlanDto.BenefitPlanDto.ApplyAdjustments (Time of Charge) = 1
    // and benefitPlan.PolicyHolderBenefitPlanDto.BenefitPlanDto.FeesIns === 2 (Adjust Off)
    // and has hasAdjustedEstimate = true
    // hasAdjustedEstimated
    calculateFeeScheduleAdjustment(encounter) {
        encounter.FeeScheduleAdjustment = 0;
        // calculate fee schedule adjustments for this encounter
        if (encounter.hasFeeScheduleAdjustments === true) {
            // NOTE we only want to include the InsuranceEstimates[0].AdjEst when the serviceTransaction.CreateClaim is true
            encounter.ServiceTransactionDtos.forEach(serviceTransaction => {
                if (serviceTransaction.CreateClaim === true) {
                    encounter.FeeScheduleAdjustment += serviceTransaction.InsuranceEstimates.reduce((a, b) => {
                        return a + b.AdjEst;
                    }, 0);
                }
            });
        }
    }

    addCreditTransactionDescription(creditTransactionDto) {
        let foundMatch = this.paymentTypes.find(paymentType => paymentType.PaymentTypeId === creditTransactionDto.PaymentTypeId);
        if (foundMatch) {
            return foundMatch.Description;
        } else {
            foundMatch = this.negativeAdjustmentTypes.find(negativeAdjustmentType =>
                negativeAdjustmentType.AdjustmentTypeId === creditTransactionDto.AdjustmentTypeId);
            if (foundMatch) {
                return foundMatch.Description;
            } else {
                return '';
            }
        }
    }


    // NOTE Fee Schedule details must be one for one on a creditTransaction because
    // they are applied to a single service whereas other credittransactions
    // can be distributed across multiple services

    createCreditTransactionsForFeeScheduleAdjustments(creditTransactionDetails, encounter) {

        // set location id
        const locationId = this.location ? this.location.id : null;
        creditTransactionDetails.forEach(creditTransactionDetail => {
            // We only create CreditTransactions for FeeScheduleAdjustments that are not 0
            if (creditTransactionDetail.Amount !== 0) {
                // initialize a CreditTransaction
                let creditTransactionDto = this.patientCheckoutService.initializeCreditTransaction(
                    this.patientInfo.PersonAccount.AccountId, locationId);

                // push detail to creditTransactionDto.CreditTransactionDetails
                creditTransactionDto.CreditTransactionDetails.push(creditTransactionDetail);
                // hard code FeeSchedule values
                creditTransactionDto.FeeScheduleAdjustmentForEncounterId = encounter.EncounterId;
                creditTransactionDto.TransactionTypeId = TransactionTypes.NegativeAdjustment;
                creditTransactionDto.IsFeeScheduleWriteOff = true;
                // set benefit plan information
                creditTransactionDto.PatientBenefitPlanId = encounter.benefitPlan.PatientBenefitPlanId;
                // set creditTransaction OriginalPosition
                this.patientCheckoutService.setCreditTransactionOriginalPosition(creditTransactionDto, this.creditTransactionDtoList);
                if (encounter && encounter.benefitPlan.PolicyHolderBenefitPlanDto.BenefitPlanDto.AdjustmentTypeId) {
                    creditTransactionDto.AdjustmentTypeId = encounter.benefitPlan.PolicyHolderBenefitPlanDto.BenefitPlanDto.AdjustmentTypeId;
                }
                creditTransactionDto.Amount = creditTransactionDetail.Amount;
                creditTransactionDto.Description = this.addCreditTransactionDescription(creditTransactionDto);
                this.creditTransactionDtoList.push(creditTransactionDto);
            }
        });
        this.isFeeScheduleAdjustment = false;

        // recalculate the total balance due for the encounters
        this.allEncounters.forEach(encounter => {
            this.getEncounterBalanceDue(encounter);
        });

        this.updateTotals();
    }


    // find and remove all creditTransactions for this encounter if it has fee schedule adjustments
    removeCreditTransactionForFeeScheduleAdjustments(encounter) {
        // find fee schedule creditTransaction in creditTransactionDtoList
        const creditTransactionMatch = this.creditTransactionDtoList.filter(creditTransaction => {
            return creditTransaction.FeeScheduleAdjustmentForEncounterId === encounter.EncounterId;
        })
        if (creditTransactionMatch) {
            creditTransactionMatch.forEach(creditTransaction => {
                this.removeCredit(creditTransaction);
            })
        }
    }

    //#endregion

    //#region Payments / Adjustments

    getUnappliedCreditTransactionDetail() {
        const unappliedCreditTransactionDetail = this.creditTransactionDto.CreditTransactionDetails.find(
            x => x.AppliedToDebitTransactionId === null && x.AppliedToServiceTransationId === null && x.EncounterId === null);
        return unappliedCreditTransactionDetail;
    }

    // as unapplied amount is used when applying a payment, any manual amount used may affect
    updateUnappliedCreditAmount() {
        // calculate the applied amount of all CreditTransaction.CreditTransactionDetails Amounts
        const appliedCreditTransactionDetails = this.creditTransactionDto.CreditTransactionDetails.filter(
            x => x.AppliedToDebitTransactionId !== null || x.AppliedToServiceTransationId !== null && x.EncounterId !== null);
        let totalAppliedCredit = 0;
        if (appliedCreditTransactionDetails) {
            totalAppliedCredit = appliedCreditTransactionDetails.reduce((a, b) => a + b.Amount, 0);
        }

        const unappliedCreditTransactionDetail = this.getUnappliedCreditTransactionDetail();

        const newUnappliedAmount = this.creditTransactionDto.Amount - totalAppliedCredit;
        if (unappliedCreditTransactionDetail) {
            unappliedCreditTransactionDetail.Amount = (newUnappliedAmount >= 0) ? newUnappliedAmount : 0;
            // update the current unapplied amount in banner
            this.currentUnappliedAmount = unappliedCreditTransactionDetail.Amount;
        }
    }


    // this method detects change to CreditTransactionDetail.Amount and sets serviceTransaction.showAppliedAmountError to true
    // if the new Amount would be more than the PatientBalance
    onCreditAmountChange(serviceTransaction, amount: any) {
        // don't allow checkout or save distribution until we have verified
        this.hasDistributionChanges = true;
        this.allowSaveDistribution = false;
        this.showAppliedAmountError = false;
        serviceTransaction.showAppliedAmountError = false;

        // get difference from old amount to new and add to DueNow
        const differenceInAmounts = (amount.OldValue - amount.NewValue);
        serviceTransaction.DueNow += differenceInAmounts;
        // set then new amount
        serviceTransaction.Detail.Amount = amount.NewValue;

        // recalculate unapplied amount for this credittransaction
        this.updateUnappliedCreditAmount();

        // validate serviceTransaction
        this.validateServiceTransaction(serviceTransaction);

        // validate the creditTransaction
        if (this.validateCreditTransactionDto(this.creditTransactionDto)) {
            this.allowSaveDistribution = true;
        }

    }


    // populate CreditTransactionDto based on applied payment
    async addPaymentOrAdjustment(paymentOrAdjustment) {
        if (this.hasDistributionChanges === false) {
            // disable the FinishButton while distributing the payment
            this.disableSummary = true;
            // reset the CreditTransaction to accept paymentOrAdjustment amounts
            this.patientCheckoutService.resetCurrentCreditTransaction(
                this.creditTransactionDto, this.creditTransactionDtoList);
            this.creditTransactionDto.TransactionTypeId = paymentOrAdjustment.TransactionTypeId;
            this.creditTransactionDto.PaymentTypeId = paymentOrAdjustment.PaymentTypeId;
            this.creditTransactionDto.PromptTitle = paymentOrAdjustment.PromptTitle;
            this.creditTransactionDto.PaymentTypePromptValue = paymentOrAdjustment.PaymentTypePromptValue;
            this.creditTransactionDto.AdjustmentTypeId = paymentOrAdjustment.AdjustmentTypeId;
            this.creditTransactionDto.Amount = paymentOrAdjustment.Amount;
            this.creditTransactionDto.DateEntered = paymentOrAdjustment.DateEntered;
            this.creditTransactionDto.Description = paymentOrAdjustment.Description;
            this.creditTransactionDto.Note = paymentOrAdjustment.Note;
            this.creditTransactionDto.PaymentGatewayTransactionId = paymentOrAdjustment.PaymentGatewayTransactionId;


            if (this.creditTransactionDto.PaymentGatewayTransactionId) {
                var responsiblePerson = this.accountMembersDetails.find(amd => amd.ResponsiblePersonId === amd.PersonId);

                var unappliedCreditTransaction = cloneDeep(this.creditTransactionDto);
                unappliedCreditTransaction.CreditTransactionDetails = [
                    {
                        AppliedToDebitTransactionId: null,
                        AppliedToServiceTransationId: null,
                        Amount: unappliedCreditTransaction.Amount,
                        EncounterId: null,
                        ProviderUserId: null,
                        AccountMemberId: responsiblePerson.AccountMemberId,
                        DateEntered: paymentOrAdjustment.DateEntered
                    }
                ]

                // add an unapplied payment for the approved debit or credit (Open Edge transaction)
                this.patientServices.CreditTransactions.create(unappliedCreditTransaction).$promise.then((result) => {
                    this.creditTransactionDto.CreditTransactionId = result.Value.CreditTransactionId;
                    this.creditTransactionDto.IsAuthorized = result.Value.IsAuthorized;
                    this.creditTransactionDto.DataTag = result.Value.DataTag;
                    this.creditTransactionDto.EnteredByUserId = result.Value.EnteredByUserId;
                    result.Value.CreditTransactionDetails[0].ObjectState = "Delete";
                    result.Value.CreditTransactionDetails[0].Amount = Math.abs(result.Value.CreditTransactionDetails[0].Amount);
                    //this.creditTransactionDto.CreditTransactionDetails.push(result.Value.CreditTransactionDetails[0]);
                    // add newly created detail after credit is redistributed
                    this.unappliedCreditTransactionDetailToDelete = result.Value.CreditTransactionDetails[0];
                    // update the paymentOrRefundPlaceholderAmount
                    this.paymentOrRefundPlaceholderAmount += result.Value.CreditTransactionDetails[0].Amount;
                    this.addCreditCardPayment(this.creditTransactionDto);
                }, (err) => {
                    this.promptOpenEdgeCreditTransactionUpdateFailed();
                });
            }
            else {
                // set boolean to automatically add CreditTransaction to creditTransactionDtoList
                this.addCreditTransactionToList = true;
                // get correct distribution for this creditTransactionDto
                await this.updateCreditTransactionDtoDetails(this.includePriorBalance);
            }
        } else {
            this.promptToSaveOrRollbackDistribution();
        }
    }

    //#endregion

    //#region UnappliedCredits


    // A fee schedule item can be one or more creditTransactions
    removeFeeScheduleAdjustmentItem(feeScheduleAdjustmentItem) {
        // find matching creditTransactions for fee schedule adjustments
        let matchingCreditTransactions = this.creditTransactionDtoList.filter(creditTransaction => creditTransaction.FeeScheduleAdjustmentForEncounterId === feeScheduleAdjustmentItem.FeeScheduleAdjustmentForEncounterId);
        // remove any creditTransaction with creditTransactionDetails with matching EncounterId
        matchingCreditTransactions.forEach(creditTransaction => {
            creditTransaction.CreditTransactionDetails.forEach(creditTransactionDetail => {
                // find the matching serviceTransaction in serviceTransactionDtos
                let matchingServiceTransaction = this.serviceAndDebitTransactionDtos.find(serviceTransaction => {
                    return serviceTransaction.ServiceTransactionId === creditTransactionDetail.AppliedToServiceTransationId;
                })
                if (matchingServiceTransaction) {
                    this.feeScheduleAdjustmentRemoved.push(matchingServiceTransaction.ServiceTransactionId);
                }
            })
        })
        // get a list of serviceTransactions in all pending encounters in this checkout
        const serviceTransactionsEstimates = this.getServiceTransactionEstimatesList();
        // get a list of services guids to exclude from  calculations based on CreateClaim = false
        // recalculate estimates based on feeScheduleAdjustmentRemoved list
        const servicesToExclude = this.getServicesToExclude();
        this.calculateServiceEstimates(serviceTransactionsEstimates, servicesToExclude, this.feeScheduleAdjustmentRemoved).then(async () => {
            for(const creditTransaction of matchingCreditTransactions) {
                await this.removeCredit(creditTransaction);
            }
        });
    }

    // triggered from the summary when a CreditTransaction is removed
    // handles unapplied creditTransactions, payments, and adjustments
    async creditTransactionChange(event) {
        switch (event.action) {
            case 'removeUnappliedCredit':
                await this.removeUnappliedCredit(event.creditTransaction);
                break;
            case 'removeCredit':
                await this.removeCredit(event.creditTransaction);
                break;
            case 'removeFeeScheduleAdjustmentItem':
                this.removeFeeScheduleAdjustmentItem(event.feeScheduleAdjustmentItem);
                break;
        }
    }

    closePaypage(): void {
        this.showPayPageModal = false;
    }

    handlePayPageTransactionCallback() {
        this.paymentGatewayService.completeCreditTransaction(
            this.refundTransaction,
            6,
            this.continueDebitRefund.bind(this),
            this.closePaypage.bind(this)
        );
    }

    continueDebitRefund(): void {
        this.paymentOrRefundPlaceholderAmount -= this.refundTransaction.Amount;
        this.continueRemoveCreditTransactionItem(this.refundTransaction.PaymentGatewayTransactionId);
    }

    async removeCredit(creditTransactionToRemove) {
        this.creditTransactionMatch = null;
        if (this.hasDistributionChanges === true) {
            this.promptToSaveOrRollbackDistribution();
            return;
        }
        // find matching CreditTransaction in list
        this.creditTransactionMatch = this.creditTransactionDtoList.find(creditTransaction =>
            creditTransaction.OriginalPosition === creditTransactionToRemove.OriginalPosition);
        // if found remove it from the list
        var paymentType = this.paymentTypes.find(paymentType => paymentType.PaymentTypeId === this.creditTransactionMatch.PaymentTypeId);
        if (this.creditTransactionMatch) {
            if (this.creditTransactionMatch.PaymentGatewayTransactionId) {
                if (this.userLocation.IsPaymentGatewayEnabled) {
                    const gatewayTransactionType = this.getGatewayTransactionTypeFromMap(this.creditTransactionMatch.PaymentGatewayTransactionId);

                    if (!this.isOpenEdgeLocation && gatewayTransactionType == GatewayTransactionType.DebitCard) {
                        this.initializeCardReaderSelectModal();
                    } else if (gatewayTransactionType == GatewayTransactionType.CreditCard) {
                        this.paymentOrRefundPlaceholderAmount -= this.creditTransactionMatch.Amount;
                        this.continueRemoveCreditTransactionItem(null);
                    } else if (paymentType && paymentType.CurrencyTypeId === 4) {
                        this.paymentOrRefundPlaceholderAmount -= this.creditTransactionMatch.Amount;
                        this.deleteDebitCardTransaction(this.creditTransactionMatch);
                    } else {
                        this.paymentOrRefundPlaceholderAmount -= this.creditTransactionMatch.Amount;
                        await this.continueRemoveCreditTransactionItem(null);
                    }
                }
                else {
                    //Future work?
                    //We should never get here, because this method is only entered 
                    //when deleting a new credit card payment that was just created on the checkout.
                    //If we made it here, the payment gateway was enabled when we started the checkout,
                    //then was disabled after we made our credit card payment

                    //If that's the case, then we wouldn't want to remove the credit transaction anyway,
                    //that would cause a mismatch between OpenEdge and Fuse transactions.
                }
            } else {
                // remove this creditTransaction from the list
                for (let indx = 0; indx < this.creditTransactionDtoList.length; indx++) {
                    if (this.creditTransactionDtoList[indx].OriginalPosition === this.creditTransactionMatch.OriginalPosition) {
                        this.creditTransactionDtoList.splice(indx, 1);
                        break;
                    }
                }
                await this.continueRemoveCreditTransactionItem(null);
            }
        }
    }

    /**
     * Return true if this is an Open Edge location and false if it is not
     */
    get isOpenEdgeLocation(): boolean {
        return this.userLocation && this.userLocation.PaymentProvider == PaymentProvider.OpenEdge;
    }

    /**
     * User needs to select a card reader to be sent to the paypage
     */
    initializeCardReaderSelectModal(): void {
        this.locationServices.getPaymentDevicesByLocationAsync({ locationId: this.userLocation?.LocationId }).$promise.then((result)=>{
            this.handleLoadedCardReaders(result.Value);
        }).catch(error => {
            console.error('Error: ', error);
        });
    }

    /**
     * Once card readers are loaded, decide what to do with them
     * @param cardReaders loaded card readers
     */
    handleLoadedCardReaders(cardReaders: any[]): void {
        if (cardReaders.length == 1) {
            this.onCardReaderSelectionComplete(cardReaders[0].PartnerDeviceId);
        } else if (cardReaders.length > 1) {
            this.cardReaders = cardReaders;
            this.showCardReaderSelectModal = true;
        } else {
            // TODO: No card readers available for this location
            return;
        }
    }

    /**
     * Once the user selects a card reader, use it and open the paypage
     * @param cardReaderId card reader id
     */
    onCardReaderSelectionComplete(cardReaderId: string): void {
        this.selectedCardReader = cardReaderId;
        this.showCardReaderSelectModal = false;
        this.initiatePaypageReturn();
    }

    cancelCardReaderSelection(): void {
        this.selectedCardReader = null;
        this.showCardReaderSelectModal = false;
        this.refundTransaction = null;
    }

    initiatePaypageReturn(): void {

        this.paymentGatewayService.createDebitReturnForEncounter(
            this.creditTransactionMatch.AccountId,
            this.creditTransactionMatch.Amount,
            1,
            false,
            GatewayAccountType.Pin,
            GatewayTransactionType.DebitCard,
            GatewayChargeType.Refund
        ).$promise.then((result) => {
            this.refundTransaction = result.Value;
        
            var paymentIntentDto : any = {
                LocationId: this.userLocation?.LocationId,
                PaymentGatewayPaymentTransactionId: this.creditTransactionMatch.PaymentGatewayTransactionId,
                PaymentGatewayRefundTransactionId: this.refundTransaction.PaymentGatewayTransactionId,
                PartnerDeviceId: this.selectedCardReader ?? null,
                RedirectUrl:location.origin + '/v1.0/index.html?v=1.0.0.1#/paypage-redirect-callback'
            }

            this.patientServices.CreditTransactions.payPageReturnRequest(paymentIntentDto).$promise.then(
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
        },
        (error) => {
            this.toastrFactory.error(this.localize.getLocalizedString('Get pay page failed.'), this.localize.getLocalizedString('Error'));
        });
    }

    openPaypage(): void {
        this.showPayPageModal = true;
        sessionStorage.setItem('isPaypageModalOpen', 'true');
    }

    getGatewayTransactionTypeFromMap(id: any): GatewayTransactionType {
        const map = sessionStorage.getItem('payment-provider-transaction-map');
        return map ? JSON.parse(map).find(x => x.id == id)?.type : null;
    }

    deleteDebitCardTransaction(transactionToVoid) {
        var requestedAmount = -transactionToVoid.Amount > 0 ? -transactionToVoid.Amount : transactionToVoid.Amount;
        this.waitOverlay = this.getCardTransactionOverlay();
        this.paymentGatewayService.encounterDebitCardReturn(transactionToVoid.AccountId, requestedAmount, 1, false, this.continueRemoveCreditTransactionItem.bind(this), this.cardTransactionOnErrorCallback.bind(this));
    };

    cardTransactionOnErrorCallback() {
        this.removeWaitOverlay();
    }

    async continueRemoveCreditTransactionItem(refundId: string) {
        var paymentType = this.paymentTypes.find(paymentType => paymentType.PaymentTypeId === this.creditTransactionMatch.PaymentTypeId);
  
        var cardType = (paymentType?.CurrencyTypeId && (paymentType.CurrencyTypeId=== CurrencyType.CreditCard || paymentType.CurrencyTypeId === CurrencyType.DebitCard)) ? (paymentType.CurrencyTypeId=== CurrencyType.CreditCard ? CardType.Credit:CardType.Debit):paymentType?.CurrencyTypeId;
 
        if(this.creditTransactionMatch?.PaymentGatewayTransactionId){
         const gatewayTransactionType = this.getGatewayTransactionTypeFromMap(this.creditTransactionMatch.PaymentGatewayTransactionId);
         cardType =(gatewayTransactionType === GatewayTransactionType.CreditCard|| gatewayTransactionType ===GatewayTransactionType.DebitCard )?(gatewayTransactionType == GatewayTransactionType.CreditCard ?CardType.Credit:CardType.Debit):gatewayTransactionType;
        }
   
        if (this.creditTransactionMatch && this.creditTransactionMatch.PaymentGatewayTransactionId > 0 && cardType === CardType.Credit) {
            this.creditTransactionMatch.DeletedCreditTransactionDetailDtos = [];

            var matchingCreditTransactionDetails = this.creditTransactionMatch.CreditTransactionDetails.find(detail => detail.CreditTransactionDetailId !== '00000000-0000-0000-0000-000000000000');
            this.creditTransactionMatch.DeletedCreditTransactionDetailDtos.push(matchingCreditTransactionDetails);
            this.creditTransactionMatch.CreditTransactionDetails = [];
            this.creditTransactionMatch.CreditTransactionDetails.push(matchingCreditTransactionDetails);

            const promises = [];
            promises.push(Promise.resolve(this.patientServices.CreditTransactions.markAccountPaymentAsDeleted(this.creditTransactionMatch).$promise));

            await Promise.all(promises).then(() => {
                //turn this into its own method on the controller and call it here.
                for (let indx = 0; indx < this.creditTransactionDtoList.length; indx++) {
                    if (this.creditTransactionDtoList[indx].OriginalPosition === this.creditTransactionMatch.OriginalPosition) {
                        this.creditTransactionDtoList.splice(indx, 1);
                        this.modalFactory.ConfirmModal('Confirm', 'Refund Successful', 'Ok');
                        break;
                    }
                }
            });
        }

        if (this.creditTransactionMatch && this.creditTransactionMatch.PaymentGatewayTransactionId > 0 && cardType === CardType.Debit) {
            this.creditTransactionMatch.DeletedCreditTransactionDetailDtos = [];

            var matchingCreditTransactionDetails = this.creditTransactionMatch.CreditTransactionDetails.find(detail => detail.CreditTransactionDetailId !== '00000000-0000-0000-0000-000000000000');
            this.creditTransactionMatch.DeletedCreditTransactionDetailDtos.push(matchingCreditTransactionDetails);
            this.creditTransactionMatch.PaymentGatewayTransactionRefundId = refundId;
            this.creditTransactionMatch.CreditTransactionDetails = [];
            this.creditTransactionMatch.CreditTransactionDetails.push(matchingCreditTransactionDetails);

            const promises = [];
            promises.push(Promise.resolve(this.patientServices.CreditTransactions.markAccountPaymentAsDeleted(this.creditTransactionMatch).$promise));

            await Promise.all(promises).then(() => {
                //turn this into its own method on the controller and call it here.
                for (let indx = 0; indx < this.creditTransactionDtoList.length; indx++) {
                    if (this.creditTransactionDtoList[indx].OriginalPosition === this.creditTransactionMatch.OriginalPosition) {
                        this.creditTransactionDtoList.splice(indx, 1);
                        this.removeWaitOverlay();
                        break;
                    }
                }

            });
        }

        if (this.creditTransactionMatch.OriginalPosition === this.creditTransactionDto.OriginalPosition) {
            this.patientCheckoutService.resetCurrentCreditTransaction(this.creditTransactionDto, this.creditTransactionDtoList);
            await this.updateCreditTransactionDtoDetails();
        }

        // update the services and set the Adjustment amount based on remaining applied credits
        this.updateServiceAdjustmentAmount();

        // recalculate the total balance due for the encounters
        this.allEncounters.forEach(encounter => {
            this.getEncounterBalanceDue(encounter);
        });

        // update the summary totals
        this.updateTotals();
        // set disableCreateClaims
        this.setDisableCreateClaims();
        // reset currentUnappliedAmount
        this.currentUnappliedAmount = 0;

        // reset validations
        this.clearDistributionValidation();
    }

    // set disableCreateClaims to true if creditTransactionDtoList has records of type
    setDisableCreateClaims() {
        // only applies to credit transactions that are not FeeSchedules
        const filteredCreditTransactions = this.creditTransactionDtoList.filter(creditTransaction => {
            return creditTransaction.IsFeeScheduleWriteOff === false;
        })
        const disableClaimsTooltip = this.translate.instant('Credits, Payments or Adjustments are already distributed to this encounter.');
        this.allEncounters.forEach(encounter => {
            // are there any creditTransactionDetails that match this encounterId in filtered creditTransactionDtoList
            let creditDistributions = filteredCreditTransactions.filter(creditTransaction => creditTransaction.CreditTransactionDetails.
                some(detail => detail.Amount > 0 && detail.EncounterId === encounter.EncounterId));

            if (creditDistributions.length > 0) {
                //if any detail has an amount > 0 and an encounterId, disable CreateClaim on that encounter and all services
                encounter.disableCreateClaims = true;
                encounter.disableCreateClaimsTooltip = disableClaimsTooltip;
                encounter.ServiceTransactionDtos.forEach(serviceTransaction => {
                    // only replace the tooltip if there was none
                    if (serviceTransaction.canCreateClaim === true) {
                        serviceTransaction.claimsTooltip = disableClaimsTooltip;
                    }
                });

            } else {
                encounter.disableCreateClaims = false;
                encounter.disableCreateClaimsTooltip = '';
                encounter.ServiceTransactionDtos.forEach(serviceTransaction => {
                    serviceTransaction.disableCreateClaims = false;
                    if (serviceTransaction.canCreateClaim === true) {
                        serviceTransaction.claimsTooltip = '';
                    }
                });
            }

        })
    }

    // user removed  unapplied credit from summary
    async removeUnappliedCredit(unappliedCreditTransaction) {
        if (this.hasDistributionChanges === true) {
            this.promptToSaveOrRollbackDistribution();
            return;
        }
        // find this creditTransaction in the creditTransactionDtoList
        const creditTransactionToRemove = this.creditTransactionDtoList.find((creditTransaction, indx) => {
            // Per Aaron, we should not be refunding any unapplied credit card payments back to the card
            // if they were already existing outside of the checkout
            // remove this creditTransaction from the list
            if (creditTransaction.OriginalPosition === unappliedCreditTransaction.OriginalPosition) {
                this.creditTransactionDtoList.splice(indx, 1);
                return creditTransaction;
            }
        });

        // if the creditTransactionToRemove is still the active creditTransaction, we need to reset it
        // and update the CreditTransaction.CreditTransactionDetails
        if (creditTransactionToRemove?.OriginalPosition === this.creditTransactionDto.OriginalPosition) {
            this.patientCheckoutService.resetCurrentCreditTransaction(this.creditTransactionDto, this.creditTransactionDtoList);
            await this.updateCreditTransactionDtoDetails();
        }
        // remove the unappliedCredit.CreditTransactionId from CreditPaymentOrder
        const indx = this.creditPaymentOrder.indexOf(creditTransactionToRemove?.RelatedCreditTransactionId);
        if (indx > -1) {
            this.creditPaymentOrder.splice(indx, 1);
        }

        // update this.dataForUnappliedTransactions.unappliedCreditTransactions
        this.dataForUnappliedTransactions.unappliedCreditTransactions.forEach(unappliedCreditTransaction => {
            if (unappliedCreditTransaction.CreditTransactionId === creditTransactionToRemove?.RelatedCreditTransactionId) {
                unappliedCreditTransaction.Applied = false;
                unappliedCreditTransaction.AvailableUnassignedAmount = unappliedCreditTransaction.UnassignedAmount;
            }
            // Enable all unappliedCreditTransactions
            unappliedCreditTransaction.IsDisabled = false;
        });

        // update the services and set the Adjustment amount based on remaining applied credits
        this.updateServiceAdjustmentAmount();

        // recalculate the total balance due for the encounters
        this.allEncounters.forEach(encounter => {
            this.getEncounterBalanceDue(encounter);
        });

        // update the totals
        this.updateTotals();
        // set disableCreateClaims
        this.setDisableCreateClaims();
        // reset currentUnappliedAmount
        this.currentUnappliedAmount = 0;

        // reset validations
        this.clearDistributionValidation();
    }

    // when a distribution is removed, clear all validation messages, 
    // set distribution state to initial settings
    clearDistributionValidation() {
        this.serviceAndDebitTransactionDtos.forEach(serviceTransaction => {
            serviceTransaction.HasExcessiveAppliedAmount = false;
            serviceTransaction.HasNegativeBalance = false;
            serviceTransaction.InvalidInputErrorMessage = '';
            serviceTransaction.showAppliedAmountError = false;
        });
        this.showAppliedAmountError = false;
        this.hasDistributionChanges = false;
    }


    // rollback changes to match creditTransactions original state
    // reset serviceTransactionDtos to their original distribution
    rollbackDistributionChanges() {
        // find matching CreditTransaction in list and reload original creditTransaction to currentCreditTransaction
        const creditTransactionMatch = this.creditTransactionDtoList.find(creditTransaction =>
            creditTransaction.OriginalPosition === this.creditTransactionDto.OriginalPosition);
        // if found reset the current creditTransactionDto to the one from the list
        if (creditTransactionMatch) {
            this.creditTransactionDto = cloneDeep(creditTransactionMatch);
        }
        // reload serviceTransactions to clear out any edited detail rows
        this.loadServiceAndDebitTransactionDtos();

        // update the services and set the Adjustment amount based on remaining applied credits
        this.updateServiceAdjustmentAmount();

        // recalculate the total balance due for the encounters
        this.allEncounters.forEach(encounter => {
            this.getEncounterBalanceDue(encounter);
        });

        // update the summary totals
        this.updateTotals();
        // reset claims checkbox disabled state
        this.setDisableCreateClaims();
        // enable checkout finish
        this.disableSummary = false;
        // reset validations
        this.clearDistributionValidation();
        // disable save since there are no changes after rollback
        this.allowSaveDistribution = false;
    }

    promptToSaveOrRollbackDistribution() {
        if (this.hasDistributionChanges === true && this.checkServicesForErrors() === true) {
            this.promptDistributionWarning();
        } else if (this.hasDistributionChanges === true) {
            this.promptSaveDistribution();
        }
    }

    promptOpenEdgeCreditTransactionUpdateFailed() {
        this.disableSummary = true;
        let data = {
            header: this.translate.instant('Confirm'),
            message: this.translate.instant('Your payment was posted to Open Edge, but the payment was not created in Fuse. '),
            boldTextMessage: this.translate.instant('To ensure your patient’s card isn’t charged twice, create a separate payment transaction in Fuse without using the credit card integration.'),
            confirm: this.translate.instant('Ok'),
            height: 250,
            width: 650,
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
                    this.disableSummary = false;
                    break;
            }
        })
    };

    // NO button:  Will return the user to the Review Distributions section 
    // and allow them the opportunity to resolve the errors
    // YES button:  Will return the user to the Checkout 
    // and reset the manual changes to the Distributions (restore the default distribution)
    promptDistributionWarning() {
        this.disableSummary = true;
        let data = this.distributionWarningData;
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
                    // rollback changes to original distribution
                    this.rollbackDistributionChanges();
                    break;
                case 'close':
                    this.confirmationRef.close();
                    // leave distribution as is and allow user to edit
                    this.disableSummary = false;
                    break;
            }
        })
    };

    // prompt user to save before taking next action
    promptSaveDistribution() {
        this.disableSummary = true;
        let data = this.saveDistributionConfirmationData;
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
                    this.saveDistribution();
                    break;
                case 'close':
                    this.confirmationRef.close();
                    // redirect to the first encounter with invalid codes (if more than one was passed to checkout)
                    this.rollbackDistributionChanges();
                    break;
            }
        });
    }

    // triggered when a serviceTransaction.Detail.Amount changes
    setHasDistributionChanges(event) {
        this.hasDistributionChanges = true;
        this.allowSaveDistribution = false;
    }

    // user added unapplied credit from payments
    async addUnappliedCredit(unappliedCredit) {
        if (this.hasDistributionChanges === false) {
            // disable the FinishButton
            this.disableSummary = true;
            // add the unappliedCredit.CreditTransactionId to CreditPaymentOrder
            this.creditPaymentOrder.push(unappliedCredit.CreditTransactionId);
            // reset the CreditTransaction and load from unappliedCredit
            this.patientCheckoutService.resetCurrentCreditTransaction(
                this.creditTransactionDto, this.creditTransactionDtoList);
            // set properties on creditTransaction based on parameter
            this.creditTransactionDto.TransactionTypeId = TransactionTypes.CreditPayment;
            this.creditTransactionDto.Description = unappliedCredit.Description;
            this.creditTransactionDto.AdjustmentTypeId = unappliedCredit.AdjustmentTypeId;
            this.creditTransactionDto.PaymentTypeId = unappliedCredit.PaymentTypeId;
            // add marker for unappliedTransaction
            this.creditTransactionDto.RelatedCreditTransactionId = unappliedCredit.CreditTransactionId;
            // set creditTransaction to be added to list
            this.addCreditTransactionToList = true;

            // set the creditTransaction amount and disable unappliedCreditTransactions if balance due is 0
            // NOTE, for the purpose of automatic distribution of unapplied credit transactions we only want to consider 'pending' encounters
            this.creditTransactionDto.Amount = unappliedCredit.UnassignedAmount;
            // reset AvailableUnassignedAmount for this unappliedCredit
            unappliedCredit.AvailableUnassignedAmount = 0;

            // get correct distribution for this creditTransactionDto
            await this.updateCreditTransactionDtoDetails(this.includePriorBalance);
        } else {
            this.promptToSaveOrRollbackDistribution();
        }
    }

    async addCreditCardPayment(creditCardPayment) {
        if (this.hasDistributionChanges === false) {
            // disable the FinishButton
            this.disableSummary = true;
            // add marker for unappliedTransaction
            this.creditTransactionDto.RelatedCreditTransactionId = creditCardPayment.CreditTransactionId;
            // set creditTransaction to be added to list
            this.addCreditTransactionToList = true;

            // get correct distribution for this creditTransactionDto
            await this.updateCreditTransactionDtoDetails(this.includePriorBalance);

        } else {
            this.promptSaveDistribution();
        }
    }

    //#endregion

    //#endregion


    //#region process CreditTransactionDtos

    // this method updates the serviceTransaction.AdjustmentAmount for all serviceTransactionDtos in this checkout
    // this is called anytime the creditTransactionDto list is added to, modified, or row(s) deleted
    updateServiceAdjustmentAmount() {
        this.unappliedAmount = 0;
        let totalDetailAmount = 0;
        // 0 out all AdjustmentAmounts for serviceAndDebitTransactionDtos and priorBalances
        this.serviceAndDebitTransactionDtos.forEach(transaction => {
            transaction.AdjustmentAmount = 0;
            // reset balance in case CreditTransactionDtoList is empty
            this.patientCheckoutService.calculateServiceTransactionAmounts(transaction);
        });
        this.priorBalances.forEach(transaction => {
            transaction.AdjustmentAmount = 0;
        });
        // loop thru all transactions in the creditTransactionList
        this.creditTransactionDtoList.forEach(transaction => {
            if (transaction.IsFeeScheduleWriteOff === false) {
                let adjustmentAmount = 0;
                // loop through each transaction.CreditTransactionDetails and recalculate the Amounts
                // service detail
                transaction.CreditTransactionDetails.forEach(creditTransactionDetail => {
                    creditTransactionDetail.Amount = parseFloat(creditTransactionDetail.Amount.toFixed(2));
                    if (creditTransactionDetail.AppliedToServiceTransationId) {
                        const serviceTransactionDto = this.serviceAndDebitTransactionDtos.
                            find(x => x.ServiceTransactionId === creditTransactionDetail.AppliedToServiceTransationId);
                        if (serviceTransactionDto && creditTransactionDetail.EncounterId) {
                            serviceTransactionDto.AdjustmentAmount += creditTransactionDetail.Amount;
                            adjustmentAmount += creditTransactionDetail.Amount;
                            this.patientCheckoutService.calculateServiceTransactionAmounts(serviceTransactionDto);
                        }
                    } else if (creditTransactionDetail.AppliedToDebitTransactionId) {
                        // debit details
                        const serviceTransactionDto = this.serviceAndDebitTransactionDtos.
                            find(x => x.DebitTransactionId === creditTransactionDetail.AppliedToDebitTransactionId);
                        if (serviceTransactionDto && creditTransactionDetail.EncounterId) {
                            serviceTransactionDto.AdjustmentAmount += creditTransactionDetail.Amount;
                            adjustmentAmount += creditTransactionDetail.Amount;
                            this.patientCheckoutService.calculateServiceTransactionAmounts(serviceTransactionDto);
                        }
                    } else {
                        totalDetailAmount += creditTransactionDetail.Amount;
                    }
                });
                transaction.AppliedAmount = parseFloat(adjustmentAmount.toFixed(2));
            }
        });
        // calculate the BalanceDue for each group of prior balance trnasactions for display on headers
        this.priorBalanceTransactionsByPatient.forEach(y => {
            y.BalanceDue = y.ServiceTransactionDtos.reduce((a, b) => {
                return b.DueNow == null ? a : a + b.DueNow;
            }, 0);
        });
        // unapplied amount -consider paymentOrRefundPlaceholderAmount
        this.unappliedAmount = parseFloat((totalDetailAmount - this.paymentOrRefundPlaceholderAmount).toFixed(2));
        // calculate unapplied amount of current CreditTransaction only
        this.calculateCurrentUnapplied();
    }

    // calculate the unapplied amount from the current creditTransaction to display in the review section
    calculateCurrentUnapplied() {
        this.currentUnappliedAmount = 0;
        const unappliedCreditTransactionDetail = this.getUnappliedCreditTransactionDetail();
        if (unappliedCreditTransactionDetail) {
            this.currentUnappliedAmount = unappliedCreditTransactionDetail.Amount;
        }
    }

    assignProviderOnUnappliedCredits(providerId) {
        this.providerOnUnappliedCredits = providerId;
    }

    // updates the creditTransactionDto.CreditTransactionDetails
    // in a couple of places i need to await this...
    async updateCreditTransactionDtoDetails(includePriorBalance = false) {
        if (this.hasPendingUpdateCreditTransaction === false) {
            this.hasPendingUpdateCreditTransaction = true;
            // clone a copy of serviceAndDebitTransactionDtos only if 'Current' EncounterType
            let serviceTransactionDtos = [];
            let serviceAndDebitTransactionDtos = cloneDeep(this.serviceAndDebitTransactionDtos);
            // sort list oldest to newest            
            serviceAndDebitTransactionDtos = serviceAndDebitTransactionDtos.sort((x, y) => (x.DateEntered > y.DateEntered) ? 1 : -1);
            // always send pending
            serviceTransactionDtos = serviceAndDebitTransactionDtos.filter(
                serviceTransaction => serviceTransaction.EncounterType === 'Current');

            // if we have unapplied more than the pending, apply it to the prior balances transactions if includePriorBalance is true 
            // // pull in enough transactions to use up the unapplied amount starting with the oldest
            if (includePriorBalance === true) {
                let creditUsed = serviceTransactionDtos.reduce((a, b) => a + b.DueNow, 0);
                let creditRemaining = this.creditTransactionDto.Amount - creditUsed;
                const priorBalanceTrainsactons = serviceAndDebitTransactionDtos.filter(
                    serviceTransaction => serviceTransaction.EncounterType === 'Prior');
                priorBalanceTrainsactons.forEach(transaction => {
                    if (creditRemaining > 0) {
                        serviceTransactionDtos.push(transaction);
                        creditUsed = serviceTransactionDtos.reduce((a, b) => a + b.DueNow, 0);
                        creditRemaining = this.creditTransactionDto.Amount - creditUsed;
                        // expand prior balance area if we are applying payments there
                        this.showPriorBalance = true;
                    }
                });
            }

            // map the DebitTransactionId to the ServiceTransactionId as distribution API accepts list of ServiceTransactionDtos
            serviceTransactionDtos.forEach(transaction => {
                // set transaction Balance based on PatientBalance - Adjustment Amount
                // NOTE this doesn't affect the actual serviceTransaction.Balance because we are working with a cloned serviceTransaction
                // but the creditDistributionForSelectedServiceTransactions uses Balance in calculations
                // also, PatientBalance is a computed property to allow us to calculate with or without a claim being created
                transaction.Balance = transaction.PatientBalance - transaction.AdjustmentAmount;
                if (this.isFeeScheduleAdjustment === true) {
                    transaction.Balance = transaction.InsuranceEstimates[0].AdjEst;
                }
            });

            // when getting distribution on service-transactions of the more than one (pending) encounter (COPIED OVER not sure what this means)
            const distributionParams = {
                accountMemberId: this.patientInfo.PersonAccount.PersonAccountMember.AccountMemberId,
                uiSuppressModal: true,
                amount: this.creditTransactionDto.Amount.toFixed(2),
                pendingFirst: true
            };
            // pass amount paid, and each of the service transactions to get the payments for each, then pass to success
            return this.patientServices.CreditTransactions.creditDistributionForSelectedServiceTransactions(distributionParams, serviceTransactionDtos).$promise.then
                ((res) => this.updateCreditTransactionDtoDetailsSuccess(res), this.updateCreditTransactionDtoDetailsError);
        }
    }

    // Handles results from creditDistributionForSelectedServiceTransactions
    updateCreditTransactionDtoDetailsSuccess(res) {
        const creditTransactionDetails = res.Value;
        this.creditTransactionDto.CreditTransactionDetails.forEach(creditTransactionDetail => {
            creditTransactionDetail.Amount = 0;
        });
        // clear priorBalanceAmount
        this.serviceAndDebitTransactionDtos.forEach(transaction => {
            if (transaction.EncounterId) {
                const priorBalance = this.priorBalances.find(x => x.EncounterId === transaction.EncounterId);
                if (priorBalance) {
                    transaction.Amount = 0;
                }
            }
            if (typeof transaction.EncounterId === 'undefined' && transaction.isAdjustment) {
                transaction.Amount = 0;
            }
        });

        // create new CreditTransactionDetails if needed
        const newCreditTransactionDetails = [];
        // for each creditTransactionDetail in distribution, find matching serviceTransaction if exists and 
        // update the creditTransactionDetail on that service
        creditTransactionDetails.forEach(creditTransactionDetail => {
            // set creditTransactionDetail.AccountMemberId based on matching service (which can be a serviceTransaction or  debitTransaction(less common))
            let matchingTransaction = this.serviceAndDebitTransactionDtos.find(x => x.ServiceTransactionId === creditTransactionDetail.AppliedToServiceTransationId);
            if (matchingTransaction) {
                creditTransactionDetail.AccountMemberId = matchingTransaction.AccountMemberId;
            } else {
                // set creditTransactionDetail.AccountMemberId based on matching debitTransaction
                matchingTransaction = this.serviceAndDebitTransactionDtos.find(x => x.DebitTransactionId === creditTransactionDetail.AppliedToDebitTransactionId);
                if (matchingTransaction) {
                    creditTransactionDetail.AccountMemberId = matchingTransaction.AccountMemberId;
                }
            }

            // reload this.creditTransactionDto.CreditTransactionDetails from distribution
            // need to match on AppliedToDebitTransactionId            
            if (!isNullOrUndefined(creditTransactionDetail.AppliedToDebitTransactionId)) {
                let matchingCreditTransactionDetail = this.creditTransactionDto.CreditTransactionDetails.find(
                    x => x.AppliedToDebitTransactionId === creditTransactionDetail.AppliedToDebitTransactionId);
                if (matchingCreditTransactionDetail) {
                    // assign new values to matchingCreditTransactionDetail
                    for (const [key, value] of Object.entries(creditTransactionDetail)) {
                        matchingCreditTransactionDetail[key] = value;
                    }
                    // Check if this is a prior balance service
                    if (creditTransactionDetail.EncounterId) {
                        // Get prior balance encounter
                        const matchingPriorBalance = this.priorBalances.find(x => x.EncounterId === creditTransactionDetail.EncounterId);
                        if (matchingPriorBalance) {
                            // set amount based on matching AppliedToDebitTransactionId
                            const transaction = this.serviceAndDebitTransactionDtos.find(
                                x => x.DebitTransactionId === creditTransactionDetail.AppliedToDebitTransactionId);
                            if (transaction) {
                                transaction.Amount = creditTransactionDetail.Amount;
                            }
                        }
                    } else if (creditTransactionDetail.EncounterId === null) {
                        const adjustment = this.priorBalances.find(x => x.isAdjustment === true);
                        if (adjustment) {
                            const matchingTransaction = this.serviceAndDebitTransactionDtos.find(x => x.isAdjustment === true);
                            if (matchingTransaction) {
                                matchingTransaction.Amount = creditTransactionDetail.Amount;
                            }
                        }
                    }
                }
                // or match on AppliedToServiceTransationId    
            } else if (!isNullOrUndefined(creditTransactionDetail.AppliedToServiceTransationId)) {
                let matchingCreditTransactionDetail = this.creditTransactionDto.CreditTransactionDetails.find(
                    x => x.AppliedToServiceTransationId === creditTransactionDetail.AppliedToServiceTransationId);
                if (matchingCreditTransactionDetail) {
                    // assign new values to matchingCreditTransactionDetail
                    for (const [key, value] of Object.entries(creditTransactionDetail)) {
                        matchingCreditTransactionDetail[key] = value;
                    }
                    // Check if this is a prior balance service
                    if (creditTransactionDetail.EncounterId) {
                        // Get prior balance encounter
                        const matchingPriorBalance = this.priorBalances.find(x => x.EncounterId === creditTransactionDetail.EncounterId);
                        if (matchingPriorBalance) {
                            // set amount based on matching AppliedToServiceTransationId or AppliedToDebitTransactionId
                            const transaction = this.serviceAndDebitTransactionDtos.find(
                                x => x.ServiceTransactionId === creditTransactionDetail.AppliedToServiceTransationId);
                            if (transaction) {
                                transaction.Amount = creditTransactionDetail.Amount;
                            }
                        }
                    } else if (creditTransactionDetail.EncounterId === null) {
                        const adjustment = this.priorBalances.find(x => x.isAdjustment === true);
                        if (adjustment) {
                            const matchingTransaction = this.serviceAndDebitTransactionDtos.find(x => x.isAdjustment === true);
                            if (matchingTransaction) {
                                matchingTransaction.Amount = creditTransactionDetail.Amount;
                            }
                        }
                    }
                }
            } else {
                // indicates this record is unapplied
                // is there an existing unapplied CreditTransactionDetail in this CreditTransaction, if so apply values to this, otherwise insert new unapplied record
                let matchingCreditTransactionDetail = this.creditTransactionDto.CreditTransactionDetails.find(
                    x => x.AppliedToServiceTransationId === null && x.AppliedToDebitTransactionId === null);
                if (matchingCreditTransactionDetail) {
                    // assign new values to matchingCreditTransactionDetail
                    for (const [key, value] of Object.entries(creditTransactionDetail)) {
                        matchingCreditTransactionDetail[key] = value;
                    }
                } else {
                    // if there is no match for the creditTransactionDetail
                    newCreditTransactionDetails.push(creditTransactionDetail);
                }
            }
        });

        this.creditTransactionDto.CreditTransactionDetails =
            this.creditTransactionDto.CreditTransactionDetails.concat(newCreditTransactionDetails);

        // if CreditTransaction was created with details for 2 or more AccountMembers 
        // validation requires unapplied detail to be assigned to the ResponsiblePersonId.
        const uniqueAccountMemberIds = [...new Set(this.creditTransactionDto.CreditTransactionDetails.map(obj => obj.AccountMemberId))];
        if (uniqueAccountMemberIds.length > 1) {
            this.setAccountMemberIdOnUnapplied(this.creditTransactionDto)
        };

        // NOTE we may revisit this (reference bug 436642)    
        // if this creditTransaction is for a CreditCard payment and has an unapplied CreditTransactionDetail with an amount more than 0
        // set the AccountMemberId to the RP (this is an offsetting CreditTransactionDetail)
        if (this.creditTransactionDto.PaymentGatewayTransactionId && this.creditTransactionDto.PaymentGatewayTransactionId > 0) {
            this.setAccountMemberIdOnUnapplied(this.creditTransactionDto);
            // if  PaymentGatewayTransaction we should have an offsetting unapplied credit transaction detail to add to creditTransactionDto.CreditTransactionDetails
            // this needs to be added after the regular distribution so that the amount is not overwritten
            if (this.unappliedCreditTransactionDetailToDelete) {
                let detail = cloneDeep(this.unappliedCreditTransactionDetailToDelete)
                this.creditTransactionDto.CreditTransactionDetails.push(detail);
                this.unappliedCreditTransactionDetailToDelete = null;
            }
        }

        // set marker that this CreditTransaction has PriorBalanceAmounts if it does
        this.creditTransactionDto.hasPriorBalanceAmounts = this.checkHasPriorBalanceDistributions();

        // tslint:disable-next-line: max-line-length
        // this determines if the unapplied creditTransactionDetail already exists, if so no need to create another
        const unapplied = this.getUnappliedCreditTransactionDetail();
        if (!unapplied) {
            const distributionParams = {
                accountMemberId: this.patientInfo.PersonAccount.PersonAccountMember.AccountMemberId,
                uiSuppressModal: true,
                amount: 1
            };

            // pass amount paid, and each of the service transactions to get the payments for each, then pass to success
            // tslint:disable-next-line: max-line-length
            this.patientServices.CreditTransactions.creditDistributionForSelectedServiceTransactions(distributionParams, [], (res) => {
                let unappliedCreditTransaction = res.Value[0];
                if (unappliedCreditTransaction) {
                    unappliedCreditTransaction.Amount = 0;
                    this.creditTransactionDto.CreditTransactionDetails.push(unappliedCreditTransaction);
                }
            }, (err) => {
                // NOTE patient-checkout-refactor doesn't have action when this fails...should there be?
                // logging this to see if there is a need to add error handling
                console.log(err)
            });
        }
        this.loadServiceAndDebitTransactionDtos();

        this.hasPendingUpdateCreditTransaction = false;
        // if we are applying an unappliedCreditTransaction, add CreditTransaction to creditTransactionDtoList
        if (this.addCreditTransactionToList === true) {
            this.addCreditDistribution();
        }
    }

    // set unapplied CreditTransactionDetail.AccountMemberId to responsible person AccountMemberId
    setAccountMemberIdOnUnapplied(creditTransaction) {
        let responsiblePerson = this.accountMembersDetails.find(x => x.ResponsiblePersonId === x.PersonId);
        // find upapplied detail
        let unappliedCreditTransactionDetail = creditTransaction.CreditTransactionDetails.find(detail =>
            detail.Amount > 0 && detail.AppliedToDebitTransactionId === null && detail.AppliedToServiceTransationId === null);
        if (unappliedCreditTransactionDetail) {
            unappliedCreditTransactionDetail.AccountMemberId = responsiblePerson.AccountMemberId;
        }
    }

    updateCreditTransactionDtoDetailsError() {
        this.negativeAdjustmentTypes = [];
        const message = this.creditTransactionDto.TransactionTypeId === TransactionTypes.CreditPayment ?
            'Failed to distribute negative adjustment. Refresh the page to try again.' :
            'Failed to distribute account payment. Refresh the page to try again.';
        this.toastrFactory.error(this.translate.instant(message),
            this.translate.instant('Server Error'));
        this.hasPendingUpdateCreditTransaction = false;
        return false;
    }

    //#endregion


    updateTotals() {

        let totalFeeScheduleAdjustment = 0;
        // calculate FeeScheduleAdjustments, note this has to be recalculated based on CreateClaim checkbox
        if (this.allEncounters && this.allEncounters.length > 0) {
            this.allEncounters.forEach(encounter => {
                this.calculateFeeScheduleAdjustment(encounter);
                // add to total for checkout
                totalFeeScheduleAdjustment += encounter.FeeScheduleAdjustment;
            });
        }

        this.summaryTotals = this.patientCheckoutService.getCheckoutTotals(this.serviceAndDebitTransactionDtos,
            this.encounterId, this.priorBalances, this.creditTransactionDtoList, totalFeeScheduleAdjustment, this.includePriorBalance);

        // this was in the original method, i'm not sure how its to be used yet so leaving for the time being
        if (!this.dataForUnappliedTransactions) {
            this.dataForUnappliedTransactions = { totalAvailableCredit: 0, totalBalanceDue: 0, totalUnappliedAmount: 0, unappliedCreditTransactions: [] };
        }

        this.dataForUnappliedTransactions.totalAvailableCredit = parseFloat((
            this.dataForUnappliedTransactions.totalUnappliedAmount - this.summaryTotals.totalUnappliedCredit).toFixed(2));
        // NOTE, for the purpose of unapplied credit transactions to be distributed
        // we only want to consider 'pending' encounters
        this.dataForUnappliedTransactions.totalBalanceDue = parseFloat(this.summaryTotals.totalBalanceDue);

        // trigger update to child components
        this.updateSummary = !this.updateSummary;
    }



    togglePriorBalanceSection() {
        if (this.includePriorBalance === false) {
            this.showPriorBalance = false;
        }
    }

    // determines whether we have Prior Balance transactions with CreditTransactionDetail in completed CreditTransaction
    checkHasCompletedPriorBalanceDistributions() {
        const priorBalanceDistributions = this.creditTransactionDtoList.filter(creditTransaction => {
            return creditTransaction.hasPriorBalanceAmounts === true;
        })
        return priorBalanceDistributions.length > 0;
    }

    // determines whether we have Prior Balance transactions with CreditTransactionDetail in current CreditTransaction
    checkHasPriorBalanceDistributions() {
        const priorBalanceDistributions = this.serviceAndDebitTransactionDtos.filter(serviceTransaction => {
            return serviceTransaction.EncounterType === 'Prior' && (serviceTransaction.Detail && serviceTransaction.Detail.Amount > 0);
        })
        return priorBalanceDistributions.length > 0;
    }

    // determines whether any services have distribution errors
    checkServicesForErrors() {
        let servicesWithErrors = this.serviceAndDebitTransactionDtos.filter(serviceTransaction => {
            return (serviceTransaction.HasExcessiveAppliedAmount === true || serviceTransaction.HasNegativeBalance);
        })
        return servicesWithErrors.length > 0;
    }

    // triggered when includePriorBalance is changed by child
    // if creditTransactionList contains distributions for Prior Account Balance warn user that 'include prior balance' cannot be removed
    // if current creditTransaction contains distributions for Prior Account Balanceprompt user to save before taking next action
    // otherwise allow remove and update totals
    includePriorBalanceChange($event) {
        if (this.checkHasCompletedPriorBalanceDistributions() === true) {
            this.includePriorBalance = true;
            const message = this.translate.instant('The prior balance cannot be removed while there is an applied credit, payment or adjustment.');
            this.promptModalWarning(message);
        } else if (this.checkHasPriorBalanceDistributions() === true) {
            this.includePriorBalance = true;
            this.promptToSaveOrRollbackDistribution();
        } else {
            this.includePriorBalance = $event;
            this.loadServiceAndDebitTransactionDtos();
            this.updateTotals();
            this.togglePriorBalanceSection();
        }
        this.updateSummary = !this.updateSummary;
    }

    onAppliedChanged() {
        // Placeholder
    }

    //#region FeeScheduleAdjustment dates (part of checkout)

    // set any fee schedule adjustment dates to their associated services
    setFeeScheduleAdjustmentDates(encounterCreditTransactionCheckoutDto) {
        encounterCreditTransactionCheckoutDto.CreditTransactions.forEach(creditTransaction => {
            if (creditTransaction.IsFeeScheduleWriteOff === true) {
                const associatedEncounter = encounterCreditTransactionCheckoutDto.Encounters.find(encounter =>
                    encounter.EncounterId === creditTransaction.FeeScheduleAdjustmentForEncounterId
                );
                // only check for a matching serviceTransaction if there are creditTransactionDetails.
                if (associatedEncounter && creditTransaction.CreditTransactionDetails.length > 0) {
                    const associatedService = associatedEncounter.ServiceTransactionDtos.find(serviceTransaction =>
                        serviceTransaction.ServiceTransactionId === creditTransaction.CreditTransactionDetails[0].AppliedToServiceTransationId
                    );
                    if (associatedService) {
                        creditTransaction.DateEntered = associatedService.AgingDate;
                        creditTransaction.CreditTransactionDetails.forEach(creditTransactionDetail => {
                            creditTransactionDetail.DateEntered = associatedService.AgingDate;
                            creditTransactionDetail.ProviderUserId = associatedService.ProviderUserId;
                        });
                    }
                }
            }
        });
    }


    //#endregion

    //#region Checkout processes
    // beginCheckout
    // continueCheckout
    // finishCheckout
    // cancelCheckout
    // NOTE, we need a different modal to signal when changes are needed
    confirmChangesNeeded(data, serviceCodesWithInvalidCodes, firstEncountersWithInvalidCodes) {
        // custom message for confirmation
        const serviceCodeString = [serviceCodesWithInvalidCodes.join(', ')];
        const message = this.translate.instant('The setup of service code(s) has changed.  ' +
            'You will be returned to the Cart where you will be able to make the necessary corrections to continue with the Checkout.');
        data.message = message;
        data.boldTextMessage = serviceCodeString;
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
                    // on confirm redirect to the first encounter with invalid codes (if more than one was passed to checkout)
                    // routes to encounter
                    let data = { EncounterId: firstEncountersWithInvalidCodes, PatientId: null }
                    data.PatientId = this.getPatientId(firstEncountersWithInvalidCodes);
                    this.cancel.emit(data);
                    break;
                case 'close':
                    this.confirmationRef.close();
                    // on cancel redirect to page checkout is called from
                    this.cancel.emit();
                    break;
            }
        });
    }

    confirmUnappliedCredits(data) {
        // custom message for confirmation
        const unappliedAmount = this.currencyPipe.transform(this.unappliedAmount, 'USD', 'symbol', '1.2-2');
        const translatedMessage = this.translate.instant('Payment will result in an account credit of ') + unappliedAmount;
        data.message = translatedMessage;
        data.message2 = '';
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
                    this.finishCheckout();
                    break;
                case 'close':
                    this.cancelFinishCheckout();
                    this.confirmationRef.close();
                    break;
            }
        });
    }

    // remove any creditTransactions that are existing unapplied creditTransactions that have not been applied to services 
    // (these have already been processed and don't need to be again)
    removeUnappliedWithNoDetailsToProcess() {
        for (let indx = this.creditTransactionDtoList.length - 1; indx >= 0; indx--) {
            // is credit transaction a previously unapplied credit
            if (this.creditTransactionDtoList[indx].RelatedCreditTransactionId !== null && this.creditTransactionDtoList[indx].RelatedCreditTransactionId !== undefined) {
                // has it been applied...     
                let credittransactionDetailsToProcess = this.creditTransactionDtoList[indx].CreditTransactionDetails.filter(detail => {
                    return ((detail.AppliedToServiceTransationId !== null && detail.AppliedToServiceTransationId !== undefined) ||
                        (detail.AppliedToDebitTransactionId !== null && detail.AppliedToDebitTransactionId !== undefined))
                })
                // if not, remove this creditTransaction from the list
                if (credittransactionDetailsToProcess.length === 0) {
                    this.creditTransactionDtoList.splice(indx, 1);
                }
            }
        }
    }

    cancelFinishCheckout() {
        this.disableSummary = false;
        // trigger update on child component
        this.updateSummary = !this.updateSummary;
    }

    beginCheckout() {
        if (this.hasDistributionChanges === true) {
            this.promptToSaveOrRollbackDistribution();
            return;
        }
        if (this.hasInvalidServiceCodes() === false) {
            // only load the creditTransactionDetails that have an amount more than 0
            this.creditTransactionDtoList.forEach(creditTransaction => {
                const creditTransactionDetailsAmountMoreThanZero = creditTransaction.CreditTransactionDetails.filter(detail => detail.Amount > 0);
                // replace CreditTransactionDetails
                creditTransaction.CreditTransactionDetails = creditTransactionDetailsAmountMoreThanZero;
                if (creditTransaction.CreditTransactionId) {
                    creditTransaction.CreditTransactionDetails.forEach(details => {
                        details.CreditTransactionId = creditTransaction.CreditTransactionId;
                        if (!details.ObjectState) {
                            details.ObjectState = this.saveStates.Add;
                        }
                    });
                }
            });

            // remove any unapplied credit transactions where none of the details were actually applied to services
            this.removeUnappliedWithNoDetailsToProcess();

            // if we've made it this far we're ready to continue checkout
            // if the serviceTransaction insurance estimates have already been recalculated, we don't need to do so again
            if (this.servicesHaveBeenReEstimated === true) {
                this.continueCheckout();
            } else {
                // get a list of serviceTransactions in all pending encounters in this checkout
                const serviceTransactionsEstimates = this.getServiceTransactionEstimatesList();

                // get a list of services guids to exclude from  calculations based on CreateClaim = false
                const servicesToExclude = this.getServicesToExclude();

                this.calculateServiceEstimates(serviceTransactionsEstimates, servicesToExclude, this.feeScheduleAdjustmentRemoved).then(() => {
                    this.continueCheckout();
                });
            }
        }
    }

    // this step is responsible for verifying unapplied amounts (if any)
    continueCheckout() {
        // don't proceed if the checkout is already in progress
        if (this.checkoutIsInProgress === false) {
            // if we have unapplied amounts confirm that this is ok with the user before finishing checkout
            // otherwise continue checkout
            if (this.unappliedAmount > 0) {
                this.confirmUnappliedCredits(this.unappliedConfirmationData);
            } else {
                this.finishCheckout();
            }
        }
    }

    finishCheckout() {
        // do not allow checkout if one is in progress
        if (this.checkoutIsInProgress === true) {
            return;
        }
        this.checkoutIsInProgress = true;
        this.disableSummary = true;
        const filteredEncounters = [];

        // add prior balance to encounter list if includePriorBalance is true
        if (this.includePriorBalance === true) {
            // TODO find out if prior balances are part of this pbi
            // this.updatePriorBalance
        }

        // set AgingDate on pending encounters included in this checkout
        this.allEncounters.forEach(encounter => {
            encounter.ServiceTransactionDtos.forEach(serviceTransaction => {
                serviceTransaction.AgingDate = serviceTransaction.DateEntered;
                serviceTransaction.ObjectState = SaveStates.Update;
            });
            // check to see if encounter is an adjustment, remove from list if so
            if (!encounter.isAdjustment) {
                filteredEncounters.push(encounter);
            }
        });
        this.allEncounters = filteredEncounters;

        // get a list of services guids to exclude from  calculations because no claim is being created
        const excludeFromClaim = this.getServicesToExclude();

        // set details on the creditTransactionDtoList
        this.setCreditTransactionListDetails(this.creditTransactionDtoList);
        // create the param for the encounter update
        const encounterCreditTransactionCheckoutDto = {
            Encounters: this.allEncounters,
            CreditTransactions: this.creditTransactionDtoList,
            // pass list of CreditPayerOrder
            CreditPaymentOrder: this.creditPaymentOrder ? this.creditPaymentOrder : [],
            ServicesToExcludeFromClaim: excludeFromClaim,

        };

        // set any fee schedule adjustment dates
        this.setFeeScheduleAdjustmentDates(encounterCreditTransactionCheckoutDto);
        // checkout the encounter
        this.patientServices.Encounter.checkoutEncounters(encounterCreditTransactionCheckoutDto, (res) => {
            this.checkoutEncountersSuccess(res);
            this.checkoutIsInProgress = false;
        }, (err) => {
            // handle failing checkout
            if (err && err.status !== 409) {

                let failedProperty = err.data?.InvalidProperties?.[0]?.PropertyName;

                if (err.status === 400 && failedProperty === 'OpenClaim') {
                    this.toastrFactory.error(this.translate.instant('There is already an open claim on one or more of the service transactions.'),
                        this.translate.instant('Server Error'));
                } else if (err.status === 400 && failedProperty === 'Status') {
                    this.toastrFactory.error(this.translate.instant('This encounter has already been checked out, or deleted.'),
                        this.translate.instant('Server Error'));
                } else {
                    this.toastrFactory.error(this.translate.instant('Failed to checkout the encounters. Please try again.'),
                        this.translate.instant('Server Error'));
                }
            }
            this.checkoutIsInProgress = false;
        });
    }

    // create a unique list of patient names for pending encounters only
    getPatientNamesFromEncounters() {
        const encounterPatients = Array.from(new Set(this.allEncounters.map(s => s.AccountMemberId)))
            .map(AccountMemberId => {
                return {
                    AccountMemberId,
                    PatientName: this.allEncounters.find(s => s.AccountMemberId === AccountMemberId).PatientName,
                };
            });
        return encounterPatients;
    }


    checkoutEncountersSuccess(res) {
        let creditTransaction = null;
        let paymentTypeDetail = null;
        let negativeTypeDetail = null;

        const dataForModal = {
            PatientDetails: this.patientInfo,
            ServiceCodes: { Value: this.serviceCodes },
            PaymentDetails: null,
            PatientNames: this.getPatientNamesFromEncounters(),
            PaymentsApplied: cloneDeep(this.creditTransactionDtoList)
        };

        if (this.creditTransactionDtoList.length > 0) {
            creditTransaction = cloneDeep(this.creditTransactionDtoList[0]);
            paymentTypeDetail = this.paymentTypes.find(paymentType => paymentType.PaymentTypeId === creditTransaction.PaymentTypeId);

            negativeTypeDetail = this.negativeAdjustmentTypes.find(negativeAdjustmentType =>
                negativeAdjustmentType.AdjustmentTypeId === creditTransaction.AdjustmentTypeId);
        }

        // If payment is applied then set it's confirmation-window-details
        if (paymentTypeDetail) {
            const paymentTypeDescreption = paymentTypeDetail.Description;
            const prompt = paymentTypeDetail.Prompt && paymentTypeDetail.Prompt != '' ? ('- ' + paymentTypeDetail.Prompt) : '';
            const paymentTypePromptValue = creditTransaction.PaymentTypePromptValue && creditTransaction.PaymentTypePromptValue != '' ?
                (': ' + creditTransaction.PaymentTypePromptValue) : '';
            const description = `${paymentTypeDescreption} ${prompt} ${paymentTypePromptValue} - ${creditTransaction.Note}`;
            const paymentDetails = {
                Amount: creditTransaction.Amount,
                Description: description
            };
            dataForModal.PaymentDetails = paymentDetails;
        } else if (negativeTypeDetail) {
            // //If negative-adjustment is applied then set it's confirmation-window-details
            // const description = `${this.getNegativeAdjustmentTypes.AdjustmentTypeDescription} - ${this.negativeAdjustmentData.Note}`;
            // var negativeAdjustmentDetails = {
            //     Amount: $scope.negativeAdjustmentData.Amount,
            //     Description: description
            // };
            // ctrl.dataForModal.NegativeAdjustmentDetails = negativeAdjustmentDetails;
        }
        // load other modalData
        // confirmation dialog - no feedback needed
        const modalInstance = this.uibModal.open({
            templateUrl: 'App/Patient/components/payment-confirmation/payment-confirmation.html',
            keyboard: false,
            size: 'lg',
            windowClass: 'center-modal',
            backdrop: 'static',
            controller: 'PaymentConfirmationController',
            resolve: {
                DataForModal: (() => {
                    return dataForModal;
                })
            }
        });
        // Handle callback for "OK" & "CACNCEL" buttons action of dialog
        modalInstance.result.then((res) => {
            if (res) {
                const pendingEncounters = this.allEncounters.filter(encounter => encounter.Status === 2);
                res.EncounterIds = Array.from(new Set(pendingEncounters.map(s => s.EncounterId)));
                this.patientServices.Encounter.createInvoices({ accountId: this.accountId }, res, (result) => {
                    if (result && result.Value) {
                        // we might get back multiple invoices, open a tab for each one
                        result.Value.forEach(invoice => {
                            invoice.isCustomInvoice = false;
                            invoice.IncludeFutureAppointments = res.IncludeFutureAppointments;
                            invoice.IncludePreviousBalance = res.IncludePreviousBalance;
                            invoice.IncludeEstimatedInsurance = true;

                            localStorage.setItem('invoice_' + invoice.InvoiceId, JSON.stringify(invoice));
                            const patientPath = '#/Patient/';
                            this.tabLauncher.launchNewTab(patientPath + encodeURIComponent(invoice.InvoiceId) + '/Account/PrintInvoice/');
                        });
                    }
                }, (err) => {
                    // handle failing checkout
                    if (err && err.status !== 409) {
                        this.toastrFactory.error(this.translate.instant('Failed to create Invoice(s). Please try again.'),
                            this.translate.instant('Server Error'));
                    }
                    this.checkoutIsInProgress = false;
                });
            }
            // on finish
            this.finish.emit();
        });
    }


    // to simplify several methods in this service I'm adding this helper function that simply returns
    // true if a passed in value is not an actual value but an empty one or placeholder
    isAnEmptyId(id) {
        const emptyGuid = '00000000-0000-0000-0000-000000000000';
        return id === emptyGuid || isNullOrUndefined(id) || id === '';
    }

    // set details on the creditTransactionDtoList if they have a match in the priorAdjustment
    setCreditTransactionListDetails(creditTransactionDtoList) {
        creditTransactionDtoList.forEach(creditTransaction => {
            // build list of accountMemberIds based on CreditTransactionDetails
            const accountMemberIds = [];
            creditTransaction.CreditTransactionDetails.forEach(creditTransactionDetail => {
                creditTransactionDetail.DateEntered = creditTransaction.DateEntered;
                accountMemberIds.push(creditTransactionDetail.AccountMemberId);
                // if creditTransactionDetail is not applied to a service transaction and does not have EncounterId set
                // then its is unapplied, set the ProviderUserId to providerOnUnappliedCredits if one has been selected
                if (!creditTransactionDetail.AppliedToServiceTransationId && !creditTransactionDetail.EncounterId) {
                    // since we're not handling providerOnUnappliedCredits yet commenting this out
                    creditTransactionDetail.ProviderUserId =
                        (this.isAnEmptyId(this.providerOnUnappliedCredits) === true) ? null : this.providerOnUnappliedCredits;
                }
                // find priorAdjustment in list and if found set details
                // TODO maybe can this be refactored, we may not need to do this since we aren't translating debitTransactions to ServiceTransactions
                // to reload the details.
                const matchingAdjustment = this.priorAdjustments.find(
                    priorAdjustment => priorAdjustment.DebitTransactionId === creditTransactionDetail.EncounterId);
                if (matchingAdjustment) {
                    creditTransactionDetail.AppliedToServiceTransationId = null;
                    creditTransactionDetail.AppliedToDebitTransactionId = creditTransactionDetail.EncounterId;
                    creditTransactionDetail.EncounterId = null;
                    creditTransactionDetail.ObjectState = this.saveStates.Add;
                    creditTransactionDetail.AccountMemberId = matchingAdjustment.AccountMemberId;
                }
            });
            // Set flag if credit transaction applies to more than one account member
            const uniqueAccountMemberIds = [...new Set(accountMemberIds)];
            creditTransaction.IsAllAccountMembersSelected = uniqueAccountMemberIds.length > 1;
        });
    }

    //#endregion

    //#region validations

    // to simplify several methods in this service I'm adding this helper function that simply returns
    // true if a passed in value is not an actual value but an empty one or placeholder
    isNullOrEmpty(value) {
        return isNullOrUndefined(value) || value === '';
    }

    // validate serviceTransaction.Detail.Amount change
    validateServiceTransaction(serviceTransaction) {
        // reset all error messages for hasExcessiveAppliedAmount
        this.serviceAndDebitTransactionDtos.forEach(serviceTransaction => {
            serviceTransaction.HasExcessiveAppliedAmount = false;
        });
        serviceTransaction.HasNegativeBalance = false;

        // serviceTransaction.DueNow must not be negative * leave this message until corrected
        serviceTransaction.InvalidInputErrorMessage = '';
        if (serviceTransaction.DueNow < 0) {
            serviceTransaction.InvalidInputErrorMessage = this.translate.instant('Applied amount cannot exceed Patient Balance.');
            serviceTransaction.HasNegativeBalance = true;
        } else {
            // total CreditTransactionDetail.Amount for child CreditTransactionDetails must equal the CreditTransactionDto.Amount
            // only show this on most recent input
            let totalAmount = 0;
            let filteredCreditTransactionDetails = this.creditTransactionDto.CreditTransactionDetails.filter(creditTransactionDetail => {
                return creditTransactionDetail.ObjectState !== this.saveStates.Delete;
            })
            filteredCreditTransactionDetails.forEach(creditTransactionDetail => {
                totalAmount += creditTransactionDetail.Amount;
            });
            totalAmount = parseFloat(totalAmount.toFixed(2));
            if (this.creditTransactionDto.Amount < totalAmount) {
                serviceTransaction.InvalidInputErrorMessage = this.translate.instant('Applied amount cannot exceed Payment or Adjustment amount.');
                serviceTransaction.HasExcessiveAppliedAmount = true;
            }
        }
    }

    // TODO not used yet but this needs to happen somewhere?
    // returns true or false on if the credit transaction dto is valid or not
    validateCreditTransactionDto(creditTransactionDto) {
        let showAppliedAmountError = false;
        // must have a PaymentTypeId or AdjustmentTypeId
        if (this.isNullOrEmpty(creditTransactionDto.PaymentTypeId) && this.isNullOrEmpty(creditTransactionDto.AdjustmentTypeId)) {
            // TODO communicate error,
            return false;
        }

        // Must have a positive amount
        if (creditTransactionDto.Amount === 0 || creditTransactionDto.Amount < 0) {
            // TODO communicate error,
            return false;
        }
        // total CreditTransactionDetail.Amount for child CreditTransactionDetails must equal the CreditTransactionDto.Amount
        let totalAmount = 0;
        let filteredCreditTransactionDetails = creditTransactionDto.CreditTransactionDetails.filter(creditTransactionDetail => {
            return creditTransactionDetail.ObjectState !== this.saveStates.Delete;
        })
        const total = filteredCreditTransactionDetails.forEach(creditTransactionDetail => {
            totalAmount += creditTransactionDetail.Amount;
        });
        totalAmount = parseFloat(totalAmount.toFixed(2));
        if (creditTransactionDto.Amount !== totalAmount) {
            return false;
        }
        // if this is FeeScheduleAdjustment and creditTransactionDto.Amount more than encounter.TotalAdjustedEstimate return false
        if (this.isFeeScheduleAdjustment === true) {
            const encounter = this.allEncounters.find(encounter => encounter.EncounterId ===
                creditTransactionDto.FeeScheduleAdjustmentForEncounterId);
            if (encounter && creditTransactionDto.Amount > encounter.TotalAdjustedEstimate) {
                // TODO communicate error, creditTransaction.Amount is more than the TotalAdjustedEstimate and this is a FeeScheduleAdjustment CreditTransaction
                return false;
            }
        }
        // serviceTransaction.DueNow must not be negative
        this.serviceAndDebitTransactionDtos.forEach(serviceTransaction => {
            if (serviceTransaction.DueNow < 0) {
                showAppliedAmountError = true;
            }
        });
        if (showAppliedAmountError) {
            return false;
        }
        return true;
    }


    // check for serviceTransactions that need to have the code(s) updated due to affectedArea requirements
    hasInvalidServiceCodes() {
        const serviceCodesWithInvalidCodes = [];
        let firstEncountersWithInvalidCodes;
        this.allEncounters.forEach(encounter => {
            // get a list of serviceTransactions with codes that need to be manually updated
            // due to affected area validation
            // service codes could have had there affected areas changed since the encounter was created
            const listOfExceptions = this.patientCheckoutService.checkForAffectedAreaChanges(
                encounter.ServiceTransactionDtos, this.serviceCodes);
            // add to list of serviceCodesWithInvalidCodes if they are not alreday in there
            listOfExceptions.forEach(exception => {
                if (serviceCodesWithInvalidCodes.indexOf(exception.Code) === -1) {
                    serviceCodesWithInvalidCodes.push(exception.Code);
                }
            });
            if (listOfExceptions.length > 0) {
                firstEncountersWithInvalidCodes = firstEncountersWithInvalidCodes ? firstEncountersWithInvalidCodes : encounter.EncounterId;
            }
        });
        // if some serviceTransactions require modification, message and stop checkout
        if (serviceCodesWithInvalidCodes.length > 0) {
            this.confirmChangesNeeded(this.confirmationData, serviceCodesWithInvalidCodes, firstEncountersWithInvalidCodes);
        }
        return serviceCodesWithInvalidCodes.length > 0;
    }

    //#endregion

    //#region modals

    // OK button:  Will return the user to the Review Distributions section 
    // and allow them the opportunity to resolve the errors
    promptModalWarning(message) {
        let data = this.warningModalData;
        data.message = message;
        this.confirmationRef = this.confirmationModalService.open({
            data
        });
        this.confirmationModalSubscription = this.confirmationRef.events.pipe(
            filter((event) => !!event),
            filter((event) => {
                return event.type === 'confirm';
            }),
            take(1)
        ).subscribe((events) => {
            switch (events.type) {
                case 'confirm':
                    this.confirmationRef.close();
                    break;
            }
        })
    };


    //#endregion


    //#region service estimates recalculate NOTE at some point should be moved to a service?

    // gets a list of service Guids from pending encounters where CreateClaim is false
    // used by calculateServiceEstimates
    getServicesToExclude() {
        let servicesToExclude = [];
        let pendingEncounters = [];
        pendingEncounters = this.patientEncounters.filter(encounter => encounter.Status === 2);
        pendingEncounters.forEach(encounter => {
            encounter.ServiceTransactionDtos.forEach(serviceTransaction => {
                if (serviceTransaction.CreateClaim === false) {
                    servicesToExclude.push(serviceTransaction.ServiceTransactionId);
                }
            });
        })
        return servicesToExclude;
    }

    // creates a single list of serviceTransactions to be sent to recalculate insurance
    getServiceTransactionEstimatesList() {
        let serviceTransactions = [];
        let pendingEncounters = [];
        pendingEncounters = this.patientEncounters.filter(encounter => encounter.Status === 2);
        pendingEncounters.forEach(pendingEncounter => {
            pendingEncounter.ServiceTransactionDtos.forEach(serviceTransaction => {
                serviceTransactions.push(serviceTransaction);
            })
        })
        return serviceTransactions;
    }

    // given a list all service transactions on pending encounter(s) to be checked out, and a list of service transactions to be excluded
    // this method calls patientServices.ServiceTransactions.serviceEstimates calls updateMatchingServiceTransaction for each service to reset the InsuranceEstimates
    async calculateServiceEstimates(serviceTransactionsEstimatesList, excludeFromClaim, removeAdjustment) {
        let insuranceServiceEstimatesDto = { Services: serviceTransactionsEstimatesList, ExcludeFromClaim: excludeFromClaim, RemoveAdjustment: removeAdjustment }
        return this.patientServices.ServiceTransactions.serviceEstimates(insuranceServiceEstimatesDto).$promise.then((res) => {
            const updatedList = res.Value;
            updatedList.Services.forEach(serviceTransaction => {
                // find matching service in original serviceTransactionsForInsuranceList and update estimate
                this.updateMatchingServiceTransaction(serviceTransaction, serviceTransactionsEstimatesList);
            });
        }, (err) => {
            const message = 'An error occurred when trying to recalculate the insurance and tax amounts. Please try again.';
            this.toastrFactory.error(this.translate.instant(message), this.translate.instant('Server Error'));
            return false;
        });
    }

    // find matching service in original serviceTransactionsForInsuranceList and update estimate amounts
    updateMatchingServiceTransaction(updatedServiceEstimate, serviceTransactionsEstimatesList) {
        let matchingServiceTransaction = serviceTransactionsEstimatesList.find(serviceTransaction => {
            return serviceTransaction.ServiceTransactionId === updatedServiceEstimate.ServiceTransactionId;
        })
        if (matchingServiceTransaction) {
            matchingServiceTransaction.InsuranceEstimates = updatedServiceEstimate.InsuranceEstimates;
            matchingServiceTransaction.TotalEstInsurance = updatedServiceEstimate.TotalEstInsurance;
            matchingServiceTransaction.TotalAdjEstimate = updatedServiceEstimate.TotalAdjEstimate;
            matchingServiceTransaction.Balance = matchingServiceTransaction.Amount -
                updatedServiceEstimate.TotalEstInsurance - updatedServiceEstimate.TotalAdjEstimate;
        }
    }

    //#endregion

    // in order to manually change distribution, we need to set creditTransactionDetail rows
    // on each serviceTransaction.  Note, this is only done on initial load to establish CreditTransactionDetails on 
    // each serviceTransaction, even PriorBalance ones.  When normally applying credits and payments we don't consider 
    // PriorBalances, these can only be manually applied
    async initializeCreditTransactionDetails() {
        const totalBalanceDue = this.summaryTotals.totalBalanceDue + this.summaryTotals.totalPriorBalanceDue;
        this.creditTransactionDto.Amount = totalBalanceDue;
        await this.updateCreditTransactionDtoDetails(true);

        // reset distribution to 0, pass empty res list to success function to reset all service.Details
        this.creditTransactionDto.Amount = 0;
        let res = { Value: [] };
        this.updateCreditTransactionDtoDetailsSuccess(res)
        this.showPriorBalance = false;
    }

    ngOnDestroy() {
        // clean up modal subscription
        if (this.confirmationModalSubscription) {
            this.confirmationModalSubscription.unsubscribe();
        }
    }
}