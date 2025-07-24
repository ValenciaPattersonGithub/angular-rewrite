import { Component, EventEmitter, Inject, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { ActiveTemplateUrl } from '../common/models/enums/patient.enum';
import { TranslateService } from '@ngx-translate/core';
import { ConfirmationModalService } from 'src/@shared/components/confirmation-modal/confirmation-modal.service';
import { ConfirmationModalOverlayRef } from 'src/@shared/components/confirmation-modal/confirmation-modal.overlayref';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import { UnappliedBulkInsurancePayment } from 'src/@core/http-services/soar-payment-gateway-transaction-http.service';
import { WaitOverlayService } from 'src/@shared/components/wait-overlay/wait-overlay.service';
import {
  BulkCreditTransactionDto,
  ClaimEntity,
  InsurancePaymentBreadCrumbDto,
  InsurancePaymentDto,
  OrignalInsuranceEstimateDto,
  PatientData,
  SelectedPaymentType,
} from '../common/models/patient-apply-insurance-payment.model';
import { FeatureFlagService } from 'src/featureflag/featureflag.service';
import { PaymentTypesService } from 'src/@shared/providers/payment-types.service';
import { RemainingAmountToDistributePipe } from 'src/@shared/pipes/remainingAmountToDistribute/remaining-amount-to-distribute.pipe';
import { ApplyInsurancePaymentIsValidPipe } from 'src/@shared/pipes/applyInsurancePaymentIsValid/apply-insurance-payment-is-valid.pipe';
import { WaitOverlayRef } from 'src/@shared/components/wait-overlay/wait-overlay-ref';

import isNumber from 'lodash/isNumber';
import cloneDeep from 'lodash/cloneDeep';
import { LocationDto } from 'src/@core/models/location/location-dto.model';
import { FuseFlag } from 'src/@core/feature-flags';
import { CurrencyType } from 'src/@core/models/currency/currency-type.model';
import { PaymentProvider } from 'src/@shared/enum/accounting/payment-provider';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { GatewayChargeType } from 'src/@core/models/payment-gateway/charge-type.enum';
import { GatewayTransactionType } from 'src/@core/models/payment-gateway/transaction-type.enum';
import { GatewayAccountType } from 'src/@core/models/payment-gateway/account-type.enum';
import { PaymentCategory } from 'src/@core/models/payment-gateway/payment-category.enum';
import { AllowedAmountOverrideDto } from 'src/@core/models/bulk-payment/bulk-insurance-dtos.model';
import { SoarBulkPaymentHttpService } from '../../@core/http-services/soar-bulk-payment-http.service';
import { SoarResponse } from 'src/@core/models/core/soar-response';
import { InsuranceEstimateDto } from 'src/accounting/encounter/models/patient-encounter.model';
import { FeeScheduleUpdateModalRef, FeeScheduleUpdateModalService } from 'src/insurance/fee-schedule/fee-schedule-update-on-payment/fee-schedule-update-modal.service';
import { UpdatedAllowedAmountDto } from 'src/insurance/fee-schedule/fee-schedule-dtos';
import { SapiValidationError } from 'src/@shared/models/sapi-validation-error';

// TODO I dont think this is needed
// eslint-disable-next-line
declare let _: any;


@Component({
  selector: 'patient-account-insurance-payment',
  templateUrl: './apply-insurance-payment.component.html',
  styleUrls: ['./apply-insurance-payment.component.scss'],
})
export class ApplyInsurancePaymentComponent implements OnInit, OnDestroy {
  @Input() person: PatientData;
  @Output() activeUrlPath = new EventEmitter<string>();
  waitOverlay: WaitOverlayRef;
  waitingOnValidation: boolean;

  activeUrlTab: string;
  templateUrl = ActiveTemplateUrl;
  breadCrumbDto: InsurancePaymentBreadCrumbDto = {
    FirstLocation: false,
    FirstLocationName: '',
    FirstLocationRoute: '',
    PrevLocation: '',
    PreviousLocationName: '',
    PreviousLocationRoute: '',
  };
  filterAmountBackup = 0;
  totalForServices = 0;
  editMode: boolean;
  insurancePayments = [];
  bulkInsurance: boolean;
  titleMessage: string;
  breadCrumbs: { name: string; path: string; title: string }[] = [];
  today: Date = new Date();
  selectedPaymentType: SelectedPaymentType;
  paymentPrompt = '';
  claimHasInvalidStatus = false;
  selectedUnappliedBulkInsurancePayment: UnappliedBulkInsurancePayment = null;
  isInsTransactionDeposited = false;
  insurancePaymentIsValid = false;
  hasValidClaimPayments = false;
  openEdgePaymentNotApplied = false;
  claims: ClaimEntity[];
  locations: LocationDto[] = [];
  insurancePaymentTypes = [];
  applyButtonTouched = false;

  userLocation: LocationDto;
  unappliedAmount = 0;
  showNoClaimsMessage = false;
  showErrors = false;
  distributedDetailsLoading = false;
  paymentTypeCategories = { Account: 1, Insurance: 2 };
  noRecordFoundMsg = false;
  remainingBalance = 0;
  hasPatientInsurancePaymentViewAccess = false;
  minValCheck = 0.009999;
  paymentDate: Date = new Date();

  currentLocation = null;

  insurancePaymentDto: InsurancePaymentDto = {
    Amount: 0,
    DateEntered: this.paymentDate,
    InsurancePaymentTypeId: null,
    Note: '',
    BulkCreditTransactionType: 2,
    PaymentTypePromptValue: null,
    AccountId: null,
    UpdatedEstimates: [],
  };
  insurancePaymentDtoBackup: InsurancePaymentDto = {
    Amount: 0,
    DateEntered: this.paymentDate,
    InsurancePaymentTypeId: null,
    Note: '',
    BulkCreditTransactionType: 2,
    PaymentTypePromptValue: null,
    AccountId: null,
    UpdatedEstimates: [],
  };
  accountId: string;
  claimId: string;
  bulkCreditTransactionId: string;
  locationDto: LocationDto;
  creditTransactionCopy: BulkCreditTransactionDto;
  hasAccess: { InsurancePaymentView: boolean };
  currentAmountBlurEvent: { claim: ClaimEntity; amount: number };

  showPaymentProvider: boolean;
  showCreditCardDropDown: boolean;
  isPaymentDevicesExist = false;
  canEditAllowedAmount: boolean;
  invalidAllowedAmounts = false;
  hasEditedAllowedAmounts: boolean;
  selectedCardReader: string;
  showPayPageModal=false;
  payPageUrl: SafeUrl;
  originalEstimates: OrignalInsuranceEstimateDto[] = [];
  transactionInformation = null;
  constructor(
    @Inject('$routeParams') public route,
    @Inject('$location') private $location,
    @Inject('PatientInsurancePaymentFactory')
    private patientInsurancePaymentFactory,
    @Inject('PersonFactory') private personFactory,
    @Inject('PatientValidationFactory') private patientValidationFactory,
    @Inject('GlobalSearchFactory') private globalSearchFactory,
    @Inject('tabLauncher') private tabLauncher,
    @Inject('UserServices') private userServices,
    @Inject('ModalFactory') private modalFactory,
    @Inject('toastrFactory') private toastrFactory,
    @Inject('localize') private localize,
    @Inject('referenceDataService') private referenceDataService,
    @Inject('locationService') private locationService,
    @Inject('patSecurityService') private patSecurityService,
    @Inject('PatientServices') private patientServices,
    @Inject('TimeZoneFactory') private timeZoneFactory,
    @Inject('BusinessCenterServices') private businessCenterServices,
    private confirmationModalService: ConfirmationModalService,
    private applyInsurancePaymentIsValidPipe: ApplyInsurancePaymentIsValidPipe,
    private remainingAmountToDistributePipe: RemainingAmountToDistributePipe,
    private waitOverlayService: WaitOverlayService,
    private translate: TranslateService,
    private featureFlagService: FeatureFlagService,
    private paymentTypesService: PaymentTypesService,
    private soarBulkPaymentHttpService: SoarBulkPaymentHttpService,
    @Inject('ClaimsService') private claimsService,
    @Inject('PaymentGatewayService') private paymentGatewayService,
    private sanitizer: DomSanitizer,
    private feeScheduleUpdateModalService: FeeScheduleUpdateModalService,
  ) {}

  confirmationRef: ConfirmationModalOverlayRef;
  confirmationModalSubscription: Subscription;

  feeScheduleUpdateModalRef: FeeScheduleUpdateModalRef;
  feeScheduleUpdateModalSubscription: Subscription;

  ngOnInit(): void {
    this.authorizationCheck();
    this.accountId = this.route['accountId'];
    this.claimId = this.route['claimId'];
    this.bulkCreditTransactionId = this.route['bulkCreditTransactionId'];
    this.insurancePaymentDto.AccountId = this.accountId;
    this.editMode = this.bulkCreditTransactionId ? true : false;
    this.getInsurancePaymentTypes();
    this.modalFactory.LoadingModal(this.pageDataCallSetup);
    this.createBreadCrumb();
    this.checkFeatureFlags();
    this.setupCardReader();
  }

  // store original estimate amounts
  snapshotOriginalEstimates(claimDtos): OrignalInsuranceEstimateDto[] {
    const originalEstimates: OrignalInsuranceEstimateDto[] = [];

    if (claimDtos && claimDtos.length > 0) {
      claimDtos.forEach(claim => {
        claim.ServiceTransactionToClaimPaymentDtos.forEach(service => {
          const originalEstimate: OrignalInsuranceEstimateDto = {
            ServiceTransactionId: service.ServiceTransactionId,
            AdjustedEstimate: service.AdjustedEstimate,
            InsuranceEstimate: service.InsuranceEstimate,
            PaidInsuranceEstimate: service.PaidInsuranceEstimate,
            AllowedAmount: service.AllowedAmount,
            OriginalInsuranceEstimate: service.OriginalInsuranceEstimate,
          };
          originalEstimates.push(originalEstimate);
        });
      });
    }
    return originalEstimates;
  }

  setupCardReader() {   
    this.getUserLocation().then(
      (res) => {}, 
      () => {
        this.toastrFactory.error('Failed to load location for user');
      }
    );
  }

  isCardReaderExist(value:boolean){
    this.showCreditCardDropDown = value;
    this.isPaymentDevicesExist = value;
  }

  authorizationCheck() {
    if (!this.patSecurityService.IsAuthorizedByAbbreviation('soar-acct-aipmt-view')) {
      this.toastrFactory.error(this.patSecurityService.generateMessage('soar-acct-aipmt-view'), 'Not Authorized');
      this.$location.path('/');
      return;
    }
  }

  initializeSelectedClaims() {
    this.claims = this.patientInsurancePaymentFactory.getSelectedClaims();

    if (this.claims.length > 0) {
      this.insurancePaymentDto.Amount = this.claims.reduce((acc, obj) => acc + obj.InsuranceEstimate, 0);
      this.remainingBalance = this.claims.reduce((acc, obj) => acc + obj.TotalCharges, 0);
    }

    this.claims.forEach(claim => {
      claim.FinalPayment =
        claim.Status === 7 || claim.Status === 8 || claim.Status === 4 || claim.Status === 9 ? false : true;

      claim.ServiceTransactionToClaimPaymentDtos = claim.ServiceTransactionToClaimPaymentDtos.sort((a, b) => {
        if (a.InsuranceOrder === b.InsuranceOrder) {
          return a.DateEntered.localeCompare(b.DateEntered);
        }
        return a.InsuranceOrder - b.InsuranceOrder;
      });

      this.claims.sort((a, b) => {
        return new Date(b.MinServiceDate).getTime() - new Date(a.MinServiceDate).getTime();
      });
    });

    this.hasAccess = { InsurancePaymentView: false };
    this.hasAccess = this.patientInsurancePaymentFactory.access();
    this.hasPatientInsurancePaymentViewAccess = this.hasAccess.InsurancePaymentView;
  }

  getInsurancePaymentTypes() {
    this.paymentTypesService.getAllPaymentTypesMinimal(null, this.paymentTypeCategories.Insurance).then(
      res => {
        this.getInsurancePaymentTypesSuccess(res);
      },
      () => {
        this.getInsurancePaymentTypesFailure();
      }
    );
  }

  getInsurancePaymentTypesSuccess(response): void {
    if (response) {
      this.insurancePaymentTypes = response.Value.sort((a, b) => (a.Description < b.Description ? -1 : 1));
    } else {
      this.insurancePaymentTypes = [];
    }
  }

  getInsurancePaymentTypesFailure(): void {
    this.toastrFactory.error('Failed to retrieve the list of Payment Types. Refresh the page to try again.', 'Error');
  }

  masterNoteChangeEvent(masterNote) {
    this.insurancePaymentDto.Note = masterNote;
  }

  pageDataCallSetup = () => {
    // TODO this needs to be revisited or possibly migrate the LoadingModal
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    const services = [];
    // Call service to get claims
    if (this.claimId && this.claimId !== '') {
      const getSingleClaim = {
        Call: this.claimsService.getClaimById,
        Params: {
          claimId: this.claimId,
        },
        OnSuccess: this.getClaimsSuccess.bind(this),
        OnError: this.getClaimFailure.bind(this),
      };
      services.push(getSingleClaim);
    } else if (this.bulkCreditTransactionId && this.bulkCreditTransactionId !== '') {
      const getTransaction = {
        Call: this.patientServices.CreditTransactions.getBulkInsurancePayment,
        Params: {
          bulkCreditTransactionId: this.bulkCreditTransactionId,
        },
        OnSuccess: this.getTransactionSuccess.bind(this),
        OnError: this.getTransactionFailure.bind(this),
      };
      services.push(getTransaction);
    } else {
      const getAll = {
        Call: this.patientServices.Claim.getClaimsByAccount,
        Params: {
          accountId: this.accountId,
        },
        OnSuccess: this.getClaimsSuccess.bind(this),
        OnError: this.getClaimsFailure.bind(this),
      };
      services.push(getAll);
    }
    // TODO this needs to be revisited or possibly migrate the LoadingModal
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return services;
  };

  async getClaimsSuccess(response): Promise<void> {
    try {
      const locations = await this.getLocations();

      if (!response.Value) {
        this.noRecordFoundMsg = true;
        return;
      }

      if (this.bulkCreditTransactionId) {
        this.claims = response.Value;
      } else if (Array.isArray(response.Value)) {
        const claims: ClaimEntity[] = this.patientInsurancePaymentFactory.getSelectedClaims();
        this.claims = response.Value.filter(claim => claims.find(c => c.ClaimId === claim.ClaimId));
      } else {
        this.claims = [response.Value];
      }

      if (this.claims.length === 0) {
        this.noRecordFoundMsg = true;
        return;
      }

      if (this.editMode) {
        this.locationDto = locations.find(location => location.LocationId === this.creditTransactionCopy.LocationId);

        if (
          this.creditTransactionCopy.IsDeposited &&
          this.creditTransactionCopy.CreditTransactions != null &&
          this.creditTransactionCopy.CreditTransactions != undefined
        ) {
          const insPayments = this.creditTransactionCopy.CreditTransactions.filter(
            item => item.TransactionTypeId === 3
          );

          if (insPayments && insPayments.length > 0) {
            this.isInsTransactionDeposited = true;
          }
        }
      }

      if (this.claims.length > 1) {
        this.bulkInsurance = true;
        this.setTitle();
      }

      // Processing claims...
      this.claims.forEach(claim => {
        claim.FinalPayment =
          claim.Status === 7 || claim.Status === 8 || claim.Status === 4 || claim.Status === 9 ? false : true;

        claim.ServiceTransactionToClaimPaymentDtos.forEach(serviceTransaction => {
          serviceTransaction.TotalInsurancePayments = Math.abs(serviceTransaction.TotalInsurancePayments);
        });
        claim.ServiceTransactionToClaimPaymentDtos = claim.ServiceTransactionToClaimPaymentDtos.sort((a, b) => {
          if (a.InsuranceOrder === b.InsuranceOrder) {
            return a.DateEntered.localeCompare(b.DateEntered);
          }
          return a.InsuranceOrder - b.InsuranceOrder;
        });
      });

      this.claims = this.claims.sort(
        (a, b) => new Date(b.MinServiceDate).getTime() - new Date(a.MinServiceDate).getTime()
      );

      // More processing...
      this.remainingBalance =
        this.claims.length < 1
          ? 0
          : this.claims.reduce((acc: number, claim) => acc + parseFloat(claim.TotalCharges.toFixed(2)), 0);

      if (this.editMode) {
        this.insurancePaymentDto.Amount = this.claims.reduce(
          (acc: number, claim) => acc + Number(claim.PaymentAmount),
          0
        );
        this.unappliedAmount = this.remainingAmountToDistributePipe.transform(
          this.claims,
          this.insurancePaymentDto.Amount
        );
         this.insurancePaymentIsValid = this.applyInsurancePaymentIsValidPipe.transform(this.claims,this.canEditAllowedAmount);     
      } else {
        this.unappliedAmount = this.remainingAmountToDistributePipe.transform(
          this.claims,
          this.insurancePaymentDto.Amount
        );
         this.insurancePaymentIsValid = this.applyInsurancePaymentIsValidPipe.transform(this.claims,this.canEditAllowedAmount);  
        this.getBenefitPlanForDefaultInsuranceType(this.claims, this.insurancePaymentDto);
        this.insurancePaymentDto.Amount =
          this.claims.length < 1
            ? 0
            : this.claims.reduce((acc: number, claim) => acc + Number(claim.TotalEstimatedInsurance), 0);
        this.distributePaymentAmount(this.insurancePaymentDto.Amount, this.claims);

        this.originalEstimates = this.snapshotOriginalEstimates(this.claims)
      }
    } catch (error) {
      // TODO I dont think this check is needed
      console.error(error);
    }
  }

  getClaimsFailure(): void {
    this.toastrFactory.error(
      this.localize.getLocalizedString('Failed to retrieve the list of {0}. Refresh the page to try again.', [
        'claims',
      ]),
      this.localize.getLocalizedString('Error')
    );
  }

  getClaimFailure(): void {
    this.toastrFactory.error(
      this.localize.getLocalizedString('Failed to retrieve the claim. Refresh the page to try again.'),
      this.localize.getLocalizedString('Error')
    );
  }

  onPaymentDateChanged(dateValue: Date) {
    this.insurancePaymentDto.DateEntered = dateValue;
  }

  getTransactionSuccess(response): void {
    // insure the DateEntered does not change when loaded...hack until we have an overall solution to date handling
    const dateEntered: string = response.Value.DateEntered;
    const dateEnteredUtc = dateEntered.lastIndexOf('Z') === dateEntered.length - 1 ? dateEntered : dateEntered + 'Z';
    this.insurancePaymentDto.DateEntered = new Date(dateEnteredUtc);
    this.insurancePaymentDto.InsurancePaymentTypeId = this.selectedPaymentType = response.Value.PaymentTypeId;
    this.insurancePaymentDto.Note = response.Value.Note;
    this.insurancePaymentDto.PaymentTypePromptValue = response.Value.PaymentTypePromptValue;
    this.insurancePaymentDto.AccountId = response.Value.AccountId;
    this.creditTransactionCopy = cloneDeep(response.Value);
    this.patientServices.Claim.GetClaimsByBulkCreditTransactionId({
      accountId: this.accountId,
      bulkCreditTransactionId: this.bulkCreditTransactionId,
    })
      .$promise.then(async res => {
        await this.getClaimsSuccess(res);
      })
      .catch(() => {
        this.getClaimFailure();
      });
  }

  getTransactionFailure(): void {
    this.toastrFactory.error(
      this.localize.getLocalizedString('Failed to retrieve the list of {0}. Refresh the page to try again.', [
        'transcation',
      ]),
      this.localize.getLocalizedString('Error')
    );
  }

  getBenefitPlanForDefaultInsuranceType(claims, insurancePaymentDto): void {
    const plans = _.chain(claims).map('BenefitPlanId').uniq().value();
    if (plans.length === 1) {
      this.businessCenterServices.BenefitPlan.get(
        { BenefitId: plans[0] },
        function (response) {
          insurancePaymentDto.InsurancePaymentTypeId = response.Value.InsurancePaymentTypeId;
          claims.forEach(claim => {
            claim.FeeScheduleId = response.Value.FeeScheduleId;
          });
        },
        function () {
          this.toastrFactory.error(
            this.localize.getLocalizedString('Failed to retrieve claims benefit plan'),
            this.localize.getLocalizedString('Error')
          );
        }
      );
    } else if (plans.length > 1) {
      this.patientServices.PatientBenefitPlan.getBenefitPlansRecordsByAccountId(
        { accountId: this.accountId },
        function (response) {
          const patientBenefitPlans = response.Value;
          patientBenefitPlans.forEach(plan => {
            claims.forEach(claim => {
              if (claim.BenefitPlanId === plan.PatientBenefitPlanDto.BenefitPlanId) {
                claim.FeeScheduleId =
                  plan.PatientBenefitPlanDto.PolicyHolderBenefitPlanDto.BenefitPlanDto.FeeScheduleId;
              }
            });
          });
        },
        function () {
          this.toastrFactory.error(
            this.localize.getLocalizedString("Failed to retrieve account's patient benefit plans"),
            this.localize.getLocalizedString('Error')
          );
        }
      );
    }
  }

  activeUrl = url => {
    if (url) {
      this.activeUrlTab = url?.TemplateUrl;
      this.activeUrlPath?.emit(url?.TemplateUrl);
    } else {
      // set default tab
      this.activeUrlTab = this.templateUrl?.Overview;
    }
  };

  // change url
  changePath = breadcrumb => {
    this.$location.url(breadcrumb.path);
    document.title = breadcrumb.title;
  };

  confirmCancellation() {
    // default messaging for individual checkout
    const data = {
      header: this.translate.instant('Discard'),
      message: this.translate.instant('Are you sure you want to discard - Apply payment?'),
      message2: null,
      confirm: this.translate.instant('Yes'),
      cancel: this.translate.instant('No'),
      height: 200,
      width: 600,
    };

    // tailor messaging to family checkout with explicit encounter information

    this.confirmationRef = this.confirmationModalService.open({
      data,
    });
    this.confirmationModalSubscription = this.confirmationRef.events
      .pipe(
        filter(event => !!event),
        filter(event => {
          return event.type == 'confirm' || event.type == 'close';
        })
      )
      .subscribe(events => {
        switch (events.type) {
          case 'confirm':
            this.confirmationRef.close();
            this.goToPreviousPage();
            break;
          case 'close':
            this.confirmationRef.close();
            break;
        }
      });
  }

  selectedPaymentTypeWatcher(paymentType) {
    if (paymentType != null && paymentType != undefined) {
      this.selectedPaymentType = paymentType;
      this.insurancePaymentDto.InsurancePaymentTypeId = paymentType.PaymentTypeId;
      this.showCreditCardDropDown = this.isCardTransaction(paymentType.CurrencyTypeId) && this.showPaymentProvider && this.userLocation?.IsPaymentGatewayEnabled && this.userLocation?.PaymentProvider !== PaymentProvider.OpenEdge;
      this.paymentPrompt = this.showCreditCardDropDown? '': paymentType.Prompt;
    } else {
      this.insurancePaymentDto.InsurancePaymentTypeId = null;
      this.paymentPrompt = '';
      this.showCreditCardDropDown = false;
    }

    if (!this.showCreditCardDropDown) {
      this.selectedCardReader = null;
      this.isPaymentDevicesExist =false;
    }

    this.checkFilterChanges();
  }

  private isCardTransaction(currencyType: CurrencyType): boolean {
    return currencyType == CurrencyType.CreditCard || currencyType == CurrencyType.DebitCard;
  }

  cardReaderChanged(value: string): void {
    this.selectedCardReader = value == '0' ? null : value;
  }

  checkFilterChanges = function () {
    let hasChanges = false;
    if (this.insurancePaymentDtoCopy) {
      hasChanges =
        this.insurancePaymentDto.BulkCreditTransactionType != this.insurancePaymentDtoCopy.BulkCreditTransactionType ||
        this.insurancePaymentDto.InsurancePaymentTypeId != this.insurancePaymentDtoCopy.InsurancePaymentTypeId ||
        this.insurancePaymentDto.PaymentTypePromptValue != this.insurancePaymentDtoCopy.PaymentTypePromptValue ||
        this.insurancePaymentDto.Note != this.insurancePaymentDtoCopy.Note ||
        this.insurancePaymentDto.Carrier != this.insurancePaymentDtoCopy.Carrier;
    }
    this.filterHasChanges = hasChanges;
  };

  /**
   * When a numeric key is pressed in the Amount text box, we
   * will temorarily disable the APPLY button if it is not
   * otherwise disabled. This will stop the user from clicking 
   * APPLY before the page does its validations and processing
   */
  numericKeyPressed(): void {
    this.waitingOnValidation = true;
  }

  processPaymentChange(event, claims) {
    this.insurancePaymentDto.Amount = event.NewValue;

    this.distributePaymentAmount(this.insurancePaymentDto.Amount, claims);
    this.processUnappliedAmount();

    // store a copy of the payment to compare when amount has changed
    this.filterAmountBackup = this.insurancePaymentDto.Amount;
    this.checkFilterChanges();
    this.waitingOnValidation = false;
  }

  processUnappliedAmount() {
    this.totalForServices = this.insurancePayments.reduce((sum: number, item: { PaymentAmount: number }) => {
      return sum + item.PaymentAmount;
    }, 0);
    this.unappliedAmount = this.insurancePaymentDto.Amount - this.totalForServices;
  }

  finalPaymentChangeEvent(event){
    this.insurancePaymentIsValid = this.applyInsurancePaymentIsValidPipe.transform(this.claims,this.canEditAllowedAmount);  
  }

  // apply insurance payment
  async apply(): Promise<void> {
    await this.getUserLocation().then(userLocation => {
      const insurancePaymentTypeId = this.insurancePaymentDto.InsurancePaymentTypeId;
      const insurancePaymentType = this.insurancePaymentTypes.find(
        type => type.PaymentTypeId == insurancePaymentTypeId
      );

      const req1 = insurancePaymentType && [3, 4].includes(insurancePaymentType.CurrencyTypeId);
      const req2 = userLocation && !userLocation.IsPaymentGatewayEnabled;
      const req3 = userLocation && typeof userLocation.MerchantId == 'string' && userLocation.MerchantId != '';

      if (req1 && req2 && req3) {
        const userContext = JSON.parse(sessionStorage.getItem('userContext'));
        const userId = userContext.Result.User.UserId;

        this.userServices.Users.get(
          { Id: userId },
          result => {
            const user = result.Value;

            if (user.ShowCardServiceDisabledMessage) {
              this.modalFactory.CardServiceDisabledModal(userLocation.NameLine1, user).then(() => {
                this.applyProcess(userLocation);
              });
            } else {
              this.applyProcess(userLocation);
            }
          },
          () => {
            this.toastrFactory.error('Get user failed.', 'Error');
          }
        );
      } else {
        this.applyProcess(userLocation);
      }
    });
  }

  private applyProcess(userLocation: LocationDto): void {
    this.applyButtonTouched = true;
    if (!this.isInsTransactionDeposited && this.validateInsurancePayment()) {
      const paymentType = this.insurancePaymentTypes.find(
        type => type.PaymentTypeId == this.insurancePaymentDto.InsurancePaymentTypeId
      );
      if (this.editMode) {
        this.patientInsurancePaymentFactory.updateInsurancePayment(
          this.insurancePaymentDto,
          this.claims,
          this.creditTransactionCopy,
          () => {
            this.goToPreviousPage();
          },
          err => {
            this.applyTransactionFailure(err);
          }
        );
      } else {
        if (
          userLocation.IsPaymentGatewayEnabled &&
          (paymentType.CurrencyTypeId == 3 || paymentType.CurrencyTypeId == 4)
        ) {
          
      const needPaymentProviderPayment:boolean = (
           userLocation.IsPaymentGatewayEnabled &&
          paymentType &&
          paymentType.CurrencyTypeId === 3 &&
          this.insurancePaymentDto.AccountId &&
          !(
            _.filter(this.claims, function (claim:ClaimEntity) {
              return claim.PaymentAmount > 0 || claim.FinalPayment;
            }).length > 1
          ));
          
          if( needPaymentProviderPayment && userLocation.PaymentProvider !== PaymentProvider.OpenEdge){

            const gatewayEntryMode =1;
            const signatureRequired = false;
            const gatewayAccountType = GatewayAccountType.None;
            const gatewayTransactionType = GatewayTransactionType.CreditCard;
            const gatewayChargeType = GatewayChargeType.Sale;

            this.paymentGatewayService.createPaymentProviderCreditOrDebitPayment(this.insurancePaymentDto.AccountId, this.insurancePaymentDto.Amount, gatewayEntryMode, signatureRequired, gatewayAccountType, gatewayTransactionType, gatewayChargeType, PaymentCategory.Insurance).$promise.then((result) => {
            this.transactionInformation =result.Value;
              const paymentIntentDto ={
              LocationId: this.userLocation?.LocationId,
              PaymentGatewayTransactionId: result.Value.PaymentGatewayTransactionId,
              Amount: this.insurancePaymentDto.Amount,
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

          }else{ 
          this.waitOverlay = this.getCardTransactionOverlay();
          this.patientInsurancePaymentFactory.applyInsurancePayment(
            this.insurancePaymentDto,
            this.claims,
            paymentType,
            () => {
              this.hasEditedAllowedAmounts = false; 
              // we need to check if any allowed amounts were edited and take appropriate action
              const updatedAllowedAmounts = this.getUpdatedAllowedAmounts(this.claims);
              if (updatedAllowedAmounts && updatedAllowedAmounts.length > 0) {
                // handle update of allowed amounts
                this.handleUpdatedAllowedAmounts(updatedAllowedAmounts);
              } else {
                this.goToPreviousPage();
              }
            },
            err => {
              this.applyTransactionWithCCPaymentFailure(err);
            }
          );
        }
        
        
        
        } else {
          this.patientInsurancePaymentFactory.applyInsurancePayment(
            this.insurancePaymentDto,
            this.claims,
            paymentType,
            () => {
              this.hasEditedAllowedAmounts = false;              
              // we need to check if any allowed amounts were edited and take appropriate action
              const updatedAllowedAmounts = this.getUpdatedAllowedAmounts(this.claims);
              if (updatedAllowedAmounts && updatedAllowedAmounts.length > 0) {
                // handle update of allowed amounts
                this.handleUpdatedAllowedAmounts(updatedAllowedAmounts);
              } else {
                this.goToPreviousPage();
              }
            },
            err => {
              this.applyTransactionFailure(err);
            }
          );
        }
      }
    }
  }

  
  openPaypage(): void {
    this.showPayPageModal = true;
    sessionStorage.setItem('isPaypageModalOpen', 'true');
}


paypageRedirectCallBackEvent(){
  // add logic to complete transaction
  this.patientInsurancePaymentFactory.completeInsurancePaymentTransaction(this.transactionInformation,this.insurancePaymentDto,this.claims, () => {
    this.goToPreviousPage();
  },err => {
    this.applyTransactionFailure(err);
  });
}


closePaypage(){
  this.applyButtonTouched = false;
  this.showPayPageModal = false;
}

  getUserLocation(): Promise<LocationDto> {
    if (this.userLocation) {
      return Promise.resolve(this.userLocation);
    }
    return this.getLocations().then(locations => {
      const userLocationId = JSON.parse(sessionStorage.getItem('userLocation'));
      this.userLocation = locations.find(x => x.LocationId === userLocationId.id);
      return Promise.resolve(this.userLocation);
    });
  }

  getLocations(): Promise<LocationDto[]> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return this.referenceDataService.getData(this.referenceDataService.entityNames.locations).then(locations => {
      this.locations = locations;
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return this.locations;
    });
  }

  validateInsurancePayment(): boolean {
    const isValidDate = this.insurancePaymentDto.DateEntered && this.insurancePaymentDto.DateEntered != null;

    const isValidAmount = this.insurancePaymentDto.Amount >= 0 && this.insurancePaymentDto.Amount < 999999.99;

    if (!isValidDate) {
      setTimeout(() => {
        document.getElementById('insPmtDate')?.querySelector('input')?.focus();
      }, 0);
      return false;
    }

    if (!isValidAmount) {
      setTimeout(() => {
        document.getElementById('insPmtAmount')?.focus();
      }, 0);
      return false;
    }

    if (!this.insurancePaymentDto.InsurancePaymentTypeId) {
      return false;
    }
    if (!this.claims.some(claim => claim.FinalPayment || claim.PaymentAmount > 0) && !this.editMode) {
      return false;
    }

    if (!this.editMode) {
      this.insurancePaymentIsValid = this.applyInsurancePaymentIsValidPipe.transform(this.claims,this.canEditAllowedAmount);
    }
    return true;
  }

  validate() {
    this.processUnappliedAmount();
    this.showErrors =
      this.unappliedAmount < -this.minValCheck ||
      this.unappliedAmount > this.minValCheck ||
      !this.insurancePaymentDto.DateEntered ||
      !this.insurancePaymentDto.InsurancePaymentTypeId;
    return !this.showErrors;
  }

  goToPreviousPage(): void {
    this.applyButtonTouched = false;
    this.removeWaitOverlay();
    window.location.href = '#/' + this.breadCrumbDto.PreviousLocationRoute;
  }

  applyTransactionFailure(error): void {
    if (error) {
      if (error.data.InvalidProperties && error.data.InvalidProperties.some(prop => prop.PropertyName == 'ClaimId')) {
        this.toastrFactory.error('Failed to apply insurance payment - claim has invalid status.');
        this.promptClaimHasInvalidStatus();
      } else {
        this.toastrFactory.error('An error has occurred while applying payment', 'Error');
      }
    }
    this.applyButtonTouched = false;
  }

  promptClaimHasInvalidStatus(): void {
    this.claimHasInvalidStatus = true;
    const message = "Your payment could not be completed due to the claim's status being invalid.";
    const message2 =
      'The claim has either been closed or is processing, and therefore cannot have a payment made on it.';
    const title = 'Confirm';
    const okButtonText = 'OK';

    this.modalFactory.DecisionModal(title, message, message2, okButtonText);
  }

  getCardTransactionOverlay() {
    const data = {
      header: 'Please wait, do not refresh...',
      message: 'Your payment is currently being processed. ',
      message2:
        'Refreshing the page or closing the browser during this transaction may prevent the payment from being posted to the patient account.',
    };
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return this.waitOverlayService.open({ data });
  }

  applyTransactionWithCCPaymentFailure = error => {
    this.removeWaitOverlay();
    if (error && error.error) {
      if (error.error.InvalidProperties && error.error.InvalidProperties.some(prop => prop.PropertyName == 'ClaimId')) {
        this.toastrFactory.error('Failed to apply insurance payment - claim has invalid status.');
      } else {
        this.toastrFactory.error('An error has occurred while applying payment', 'Error');
      }
      // If we have a creditTransaction error, we need to inform user that the CC succeeded but payment was not persisted in Fuse
      this.promptOpenEdgeCreditTransactionUpdateFailed();
    }
  };

  removeWaitOverlay(): void {
    // Remove overlay
    if (this.waitOverlay) {
      this.waitOverlay.close();
      this.waitOverlay = null;
    }
  }

  promptOpenEdgeCreditTransactionUpdateFailed(): void {
    this.openEdgePaymentNotApplied = true;
    const message = this.localize.getLocalizedString(
      'Your payment was posted to Open Edge, but the payment was not created in Fuse.'
    );
    const message2 = this.localize.getLocalizedString(
      'To ensure your patient’s card isn’t charged twice, create a separate payment transaction in Fuse without using the credit card integration.'
    );
    const title = this.localize.getLocalizedString('Confirm');
    const okButtonText = this.localize.getLocalizedString('OK');
    this.modalFactory.DecisionModal(title, message, message2, okButtonText);
  }

  paymentAmountBlurEvent = function (event) {
    this.distributePaymentAmount(event.amount, [event.claim]);
    this.currentAmountBlurEvent = { claim: event.claim, amount: event.amount };
  };

  distributePaymentAmount(amount: number, claims: ClaimEntity[]) {
    if ((amount >= 0 && amount <= this.remainingBalance) || claims) {
      this.distributedDetailsLoading = true;
      // TODO move to  http services
      this.patientInsurancePaymentFactory.distributeAmountToServices(
        amount,
        claims,
        this.distributePaymentAmountSuccess,
        this.distributePaymentAmountFailure
      );
    }
  }

  distributePaymentAmountSuccess = () => {
    if (this.currentAmountBlurEvent) {
      const selectedClaim = this.claims.find(claim => claim.ClaimId === this.currentAmountBlurEvent.claim.ClaimId);

      if (this.currentAmountBlurEvent.amount >= 0 && this.currentAmountBlurEvent.amount > selectedClaim.PaymentAmount)
        this.toastrFactory.success(
          this.localize.getLocalizedString(
            'Payment amount adjusted to the maximum allowed amount remaining for the claim.'
          )
        );

      this.currentAmountBlurEvent = null;
    }

    this.distributedDetailsLoading = false;
    this.insurancePaymentIsValid = this.applyInsurancePaymentIsValidPipe.transform(this.claims,this.canEditAllowedAmount);   
    this.unappliedAmount = this.remainingAmountToDistributePipe.transform(this.claims, this.insurancePaymentDto.Amount);
  };

  distributePaymentAmountFailure = () => {
    this.distributedDetailsLoading = false;
  };

  serviceAmountBlurEvent(event) {
    if (event.claim) {
      const claim = event.claim;
      // get total PaymentAmount for claim
      claim.PaymentAmount = claim.ServiceTransactionToClaimPaymentDtos.reduce(
        (sum: number, item: { PaymentAmount: number }) => {
          return sum + item.PaymentAmount;
        },
        0
      );
      this.unappliedAmount = this.remainingAmountToDistributePipe.transform(
        this.claims,
        this.insurancePaymentDto.Amount
      );
      this.insurancePaymentIsValid = this.applyInsurancePaymentIsValidPipe.transform(this.claims,this.canEditAllowedAmount);  
    }
  }

  navToPatientProfile(personId) {
    this.personFactory.getById(personId).then(result => {
      let patientInfo = result.Value;
      this.patientValidationFactory.PatientSearchValidation(patientInfo).then(res => {
        patientInfo = res;
        if (!patientInfo.authorization.UserIsAuthorizedToAtLeastOnePatientLocation) {
          this.patientValidationFactory.LaunchPatientLocationErrorModal(patientInfo);
          return '';
        } else {
          this.globalSearchFactory.SaveMostRecentPerson(personId);
          const patientLocation = '#/Patient/';
          this.$location.search('newTab', null);
          this.tabLauncher.launchNewTab(patientLocation + String(personId) + '/Summary/?tab=Account%20Summary');
          return '';
        }
      });
    });
  }

  setTitle() {
    this.titleMessage =
      this.editMode && this.bulkInsurance
        ? 'Edit Bulk Insurance Payment'
        : this.editMode
        ? 'Edit Insurance Payment'
        : 'Apply an Insurance Payment';
  }

  createBreadCrumb = () => {
    const patientPath = 'Patient/';
    const patientId = encodeURIComponent(this.route.patientId);
    const accountId = encodeURIComponent(this.route.accountId);
    const locationName = _.toLower(this.route.PrevLocation);

    if (locationName === 'account summary_selectclaims') {
      this.breadCrumbDto.FirstLocation = true;
      this.breadCrumbDto.FirstLocationName = 'Account Summary';
      this.breadCrumbDto.FirstLocationRoute = `${patientPath}${patientId}/Summary/?tab=Account Summary`;
      this.breadCrumbDto.PreviousLocationName = 'Select Claims';
      this.breadCrumbDto.PreviousLocationRoute = `${patientPath}${patientId}/Account/${accountId}/SelectClaims/Account Summary`;
    } else if (locationName === 'transaction history_selectclaims') {
      this.breadCrumbDto.FirstLocation = true;
      this.breadCrumbDto.FirstLocationName = 'Transaction History';
      this.breadCrumbDto.FirstLocationRoute = `${patientPath}${patientId}/Summary/?tab=Transaction History`;
      this.breadCrumbDto.PreviousLocationName = 'Select Claims';
      this.breadCrumbDto.PreviousLocationRoute = `${patientPath}${patientId}/Account/${accountId}/SelectClaims/Transaction History`;
    } else if (locationName === 'patientoverview_selectclaims') {
      this.breadCrumbDto.FirstLocation = true;
      this.breadCrumbDto.FirstLocationRoute = `${patientPath}${patientId}/Overview/`;
      this.breadCrumbDto.FirstLocationName = 'Patient Overview';
      this.breadCrumbDto.PreviousLocationName = 'Select Claims';
      this.breadCrumbDto.PreviousLocationRoute = `${patientPath}${patientId}/Account/${accountId}/SelectClaims/PatientOverview`;
    } else if (locationName === 'transaction history') {
      this.breadCrumbDto.PreviousLocationName = 'Transaction History';
      this.breadCrumbDto.PreviousLocationRoute = `${patientPath}${patientId}/Summary/?tab=Transaction History`;
    } else if (locationName === 'businesscenter_insurance') {
      this.breadCrumbDto.PreviousLocationName = 'Claims';
      this.breadCrumbDto.PreviousLocationRoute = 'BusinessCenter/Insurance';
    } else {
      this.breadCrumbDto.PreviousLocationName = 'Patient Overview';
      this.breadCrumbDto.PreviousLocationRoute = `${patientPath}${patientId}/Overview/`;
    }

    this.breadCrumbs = [
      {
        name: this.breadCrumbDto.FirstLocationName,
        path: '#/' + this.breadCrumbDto.FirstLocationRoute,
        title: 'Patient',
      },
      {
        name: this.breadCrumbDto.PreviousLocationName,
        path: '#/' + this.breadCrumbDto.PreviousLocationRoute,
        title: 'Patient',
      },
      {
        name: this.translate.instant('Apply an Insurance Payment'),
        path: '',
        title: 'Patient',
      },
    ];
  };

  serviceAllowedAmountBlurEvent(event) {
    this.validateAllowedAmounts();
    // If any of the allowed amounts are invalid, we do not want to proceed with the re-estimation
    if (this.invalidAllowedAmounts)     
      return;        
    this.hasEditedAllowedAmounts = true;
    if (event.claim) {
      // set the waitingOnValidation flag to true to disable the apply button
      // while the re-estimation is being processed
      this.waitingOnValidation = true;
      const claim = event.claim;      
      // get a list of all services including the Overridden AllowedAmount
      const overriddenServices: AllowedAmountOverrideDto[] = [];
      claim.ServiceTransactionToClaimPaymentDtos.forEach(service => {
        overriddenServices.push({
          ServiceTransactionId: service.ServiceTransactionId,
          EstimatedInsuranceId: service.EstimatedInsuranceId,
          AllowedAmount: service.AllowedAmount,
        }); 
      });
      
      // send the allowedAmounts on this claim to be re-estimated based on the 'new' allowed amount  
      this.soarBulkPaymentHttpService.reEstimateClaimServices({claimId: claim.ClaimId, allowedAmounts: overriddenServices})
        .subscribe({
          next: (estimates) => {
            // store the estimates for apply
            this.loadUpdatedEstimates(estimates);
            // reset the amounts on this claim based on new estimates
            this.updateClaimWithEstimates(claim, estimates);
          },
          error: (err) => {
            this.waitingOnValidation = false;
            this.toastrFactory.error('Failed to re-estimate claim services.', 'Error');
          },
          complete: () => {
            this.waitingOnValidation = false;
          }
      });      
    }
  }

  // This method is called when the estimates have been returned from the server
  // and are used to update the payment object with the new estimates
  // This method will handle storing only the most up-to-date estimates for the claims
  // where the estimate allowed amount has been overridden
  loadUpdatedEstimates(estimates: SoarResponse<InsuranceEstimateDto[]>) {
    // Check if estimate exists in current updateEstimates list by comparing EstimatedInsuranceId
    estimates.Value.forEach(newEstimate => {
      // Find the index of an existing estimate with the same EstimatedInsuranceId
      const existingIndex = this.insurancePaymentDto.UpdatedEstimates.findIndex(
          estimate => estimate.EstimatedInsuranceId === newEstimate.EstimatedInsuranceId
      );
      // If an existing estimate is found, replace it with the new one
      // If not found, add the new estimate to the list   
      if (existingIndex !== -1) {
          this.insurancePaymentDto.UpdatedEstimates[existingIndex] = newEstimate;
      } else {
          this.insurancePaymentDto.UpdatedEstimates.push(newEstimate);
      }
    });
  }

  // Process the estimates after AllowedAmount has been changed
  updateClaimWithEstimates(claimPaymentDto: ClaimEntity, estimates: SoarResponse<InsuranceEstimateDto[]>) {
    // for each ServiceTransactionToClaimDto in the claim, find the estimate and update the values
    claimPaymentDto.ServiceTransactionToClaimPaymentDtos.forEach(service => {
      const insuranceEstimate = estimates.Value.find(e => e.ServiceTransactionId === service.ServiceTransactionId );
      // update all calculated amounts in the claim object      
      if (insuranceEstimate) {
        const insEstAmt = (insuranceEstimate?.EstInsurance) ?? 0;
        const insAdjEst = (insuranceEstimate?.AdjEst) ?? 0;
        const paidAmount = (insuranceEstimate?.PaidAmount) ?? 0;
        const adjPaidAmount = (insuranceEstimate?.AdjPaid) ?? 0;
        const remainingInsEst = (insEstAmt - paidAmount) < 0 ? 0 : (insEstAmt - paidAmount);
        const remainingAdjEst = (insAdjEst - adjPaidAmount) < 0 ? 0 : (insAdjEst - adjPaidAmount);

        // only update the service.AllowedAmount if the estimate.AllowedAmount and AllowedAmountOverride is not null
        service.AllowedAmount = 
          insuranceEstimate.AllowedAmountOverride !== null && insuranceEstimate.AllowedAmountOverride !== undefined
            ? insuranceEstimate.AllowedAmountOverride
            : (insuranceEstimate.AllowedAmount !== null && insuranceEstimate.AllowedAmount !== undefined
                ? insuranceEstimate.AllowedAmount
                : service.AllowedAmount);

        service.InsuranceEstimate = remainingInsEst;
        service.AdjustedEstimate = remainingAdjEst;
        service.PaidInsuranceEstimate = paidAmount;
        service.OriginalInsuranceEstimate = insEstAmt;
      }           
    })
    this.recalculateClaimEstimateTotals(claimPaymentDto);
    // verify payment is valid after the estimates have been updated
    this.insurancePaymentIsValid = this.applyInsurancePaymentIsValidPipe.transform(this.claims,this.canEditAllowedAmount);     
  }

  // recalculate the accumulated values for the claim
  recalculateClaimEstimateTotals(claimPaymentDto: ClaimEntity) {
    claimPaymentDto.TotalEstimatedInsurance = claimPaymentDto.ServiceTransactionToClaimPaymentDtos.reduce(
      (sum: number, item: { InsuranceEstimate: number }) => sum + item.InsuranceEstimate,
      0
    );
    claimPaymentDto.TotalEstInsuranceAdj = claimPaymentDto.ServiceTransactionToClaimPaymentDtos.reduce(
      (sum: number, item: { AdjustedEstimate: number }) => sum + item.AdjustedEstimate,
      0
    );
    claimPaymentDto.AllowedAmount = claimPaymentDto.ServiceTransactionToClaimPaymentDtos.reduce(
      (sum: number, item: { AllowedAmount: number }) => sum + item.AllowedAmount,
      0
    );
  }

  // Check if the apply button should be disabled based on various conditions
  // validation other than InsurancePaymentTypeId is ignored on edit
  isApplyButtonDisabled(): boolean {
   if (this.editMode) {
    return !this.insurancePaymentDto.InsurancePaymentTypeId
  }
  return (
    this.insurancePaymentIsValid === false ||
    this.applyButtonTouched ||
    this.insurancePaymentDto.Amount > this.remainingBalance ||
    this.insurancePaymentDto.Amount < 0 ||
    this.insurancePaymentDto.Amount > 999999.99 ||
    this.unappliedAmount < -0.009999 ||
    this.unappliedAmount > this.minValCheck ||
    this.invalidAllowedAmounts ||
    !this.insurancePaymentDto.InsurancePaymentTypeId ||
    (this.showCreditCardDropDown && !this.selectedCardReader) ||
    this.waitingOnValidation
  );
  }

  // reset the updated estimates
  resetAllowedAmounts() {
    this.hasEditedAllowedAmounts = false;
    this.insurancePaymentDto.UpdatedEstimates = [];
    this.insurancePaymentDtoBackup.UpdatedEstimates = [];

    // map lookup of original estimates
    const originalEstimatesMap = new Map(
      this.originalEstimates.map(estimate => [estimate.ServiceTransactionId, estimate])
    );
    // replace modified estimate columns with original amounts 
    this.claims.forEach(claim => {
      claim.ServiceTransactionToClaimPaymentDtos.forEach(service => {
        // if the allowed amount was changed, we need to reset the estimate
        // to the original value
        if (service.OriginalAllowedAmount !== service.AllowedAmount) {
          // Find the matching original estimate using the Map
          const originalEstimate = originalEstimatesMap.get(service.ServiceTransactionId);
          // If a matching original estimate is found, reset the service amounts
          // to the original values
          if (originalEstimate) {            
            service.AllowedAmount = originalEstimate.AllowedAmount;
            service.InsuranceEstimate = originalEstimate.InsuranceEstimate;
            service.AdjustedEstimate = originalEstimate.AdjustedEstimate;
            service.PaidInsuranceEstimate = originalEstimate.PaidInsuranceEstimate;
            service.OriginalInsuranceEstimate = originalEstimate.OriginalInsuranceEstimate;
          }
        }
      });
      this.recalculateClaimEstimateTotals(claim);
    });        
  }

  validateAllowedAmounts() {
    this.invalidAllowedAmounts = false;
    this.claims.forEach(claim => {
      claim.ServiceTransactionToClaimPaymentDtos.forEach(service => {
        if (service.AllowedAmount < 0 || service.AllowedAmount > service.Charges) {
          this.invalidAllowedAmounts = true;
        }
      });
    });    
  }

  getUpdatedAllowedAmounts(claims: ClaimEntity[]): UpdatedAllowedAmountDto[] {
    const updatedAllowedAmounts = claims
                  .map((claim: ClaimEntity) => claim.ServiceTransactionToClaimPaymentDtos.map(service => ({
                    ...service,
                    ClaimLocationId: claim.LocationId
                  })))
                  .reduce((acc, val) => acc.concat(val), []) 
                  .filter(service => service.AllowedAmount !== service.OriginalAllowedAmount);
    return updatedAllowedAmounts.map(service => ({ 
      ClaimLocationId: service.ClaimLocationId,    
      ServiceCodeId: service.ServiceCodeId,
      FeeScheduleId: service.FeeScheduleId || '', 
      FeeScheduleGroupId: service.FeeScheduleGroupId || null, 
      FeeScheduleGroupDetailId: service.FeeScheduleGroupDetailId || null, 
      CurrentAmount: service.OriginalAllowedAmount, 
      UpdatedAmount: service.AllowedAmount,
    }));
  }

  handleUpdatedAllowedAmounts(updatedAllowedAmounts: UpdatedAllowedAmountDto[]) {
    // does the user have permission to edit allowed amounts?    
    const canUserUpdateFeeSchedule = this.patSecurityService.IsAuthorizedByAbbreviation('soar-ins-ifsch-edit');
    if (canUserUpdateFeeSchedule) {
      this.openFeeScheduleUpdateModal(updatedAllowedAmounts);
    } else {
       this.goToPreviousPage();
    }
  }

  openFeeScheduleUpdateModal(updatedAllowedAmounts: UpdatedAllowedAmountDto[]) {
    const data = {
      updatedAllowedAmounts: updatedAllowedAmounts,
      header: this.translate.instant('Update Fee Schedule'),
      confirm: this.translate.instant('Update'),
      cancel: this.translate.instant('Cancel'),
      height: 200,
      width: 600,
    };
    this.feeScheduleUpdateModalRef = this.feeScheduleUpdateModalService.open({
      data,
    });
    this.feeScheduleUpdateModalSubscription = this.feeScheduleUpdateModalRef.events
      .pipe(
        filter(event => !!event),
        filter(event => {
          return event.type == 'confirm' || event.type == 'close';
        })
      )
      .subscribe(events => {
        switch (events.type) {
          case 'confirm':
            this.feeScheduleUpdateModalRef.close();
            this.goToPreviousPage();
            
            break;
          case 'close':
            this.feeScheduleUpdateModalRef.close();
            this.goToPreviousPage();
            break;
        }
      });
    
  }

  ngOnDestroy(): void {
    // clean up all subscriptions
    if (this.confirmationModalSubscription) {
      this.confirmationModalSubscription.unsubscribe();
    }
    if (this.feeScheduleUpdateModalSubscription) {
      this.feeScheduleUpdateModalSubscription.unsubscribe();
    }
  }

  

  checkFeatureFlags() {
    this.featureFlagService.getOnce$(FuseFlag.UsePaymentService).subscribe(value => {
      this.showPaymentProvider = value;
    });
    this.featureFlagService.getOnce$(FuseFlag.EnableUpdateAllowedAmountOnPaymentScreen).subscribe((value) => {
      this.canEditAllowedAmount = value;
    });
  }  
}