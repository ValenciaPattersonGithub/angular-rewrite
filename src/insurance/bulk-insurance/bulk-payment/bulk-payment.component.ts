import {
  Component,
  Inject,
  OnInit,
  ChangeDetectorRef,
  TemplateRef,
  ViewChild,
  ViewContainerRef,
  EventEmitter,
} from '@angular/core';
import { SoarEraHttpService } from 'src/@core/http-services/soar-era-http.service';
import { AllowedAmountOverrideDto, CarrierDto, ClaimDto } from 'src/@core/models/bulk-payment/bulk-insurance-dtos.model';
import { EraPaymentDto } from 'src/@core/models/era/soar-era-dtos.model';
import {
  RequestArgs,
  SoarBulkPaymentHttpService,
} from 'src/@core/http-services/soar-bulk-payment-http.service';
import cloneDeep from 'lodash/cloneDeep';
import { InsurancePaymentIsValidPipe } from 'src/@shared/pipes/insurancePaymentIsValid/insurance-payment-is-valid.pipe';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ClaimPaymentAmountBlurEvent } from 'src/insurance/bulk-insurance/claim-payment-table/claim-payment-table.component';

import { Subscription } from 'rxjs/internal/Subscription';
import { ConfirmationModalService } from 'src/@shared/components/confirmation-modal/confirmation-modal.service';
import { TranslateService } from '@ngx-translate/core';
import { ConfirmationModalOverlayRef } from 'src/@shared/components/confirmation-modal/confirmation-modal.overlayref';
import { WaitOverlayRef } from '../../../@shared/components/wait-overlay/wait-overlay-ref';
import { WaitOverlayService } from '../../../@shared/components/wait-overlay/wait-overlay.service';
import { filter, take } from 'rxjs/operators';
import { CarrierLongLabelPipe } from 'src/@shared/pipes/carrierLongLabel/carrier-long-label.pipe';
import { SoarLocationHttpService } from 'src/@core/http-services/soar-location-http.service';
import {
  SoarPaymentGatewayTransactionHttpService,
  UnappliedBulkInsurancePayment,
} from 'src/@core/http-services/soar-payment-gateway-transaction-http.service';
import { PatientRegistrationService } from 'src/patient/common/http-providers/patient-registration.service';
import { RegistrationCustomEvent } from 'src/patient/common/models/registration-custom-event.model';
import { RegistrationEvent } from 'src/patient/common/models/enums';
import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';
import { SoarResponse } from 'src/@core/models/core/soar-response';
import { PaymentTypes } from 'src/business-center/payment-types/payment-types.model';
import { PaymentTypesService } from 'src/@shared/providers/payment-types.service';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { FuseFlag } from 'src/@core/feature-flags/fuse-flag';
import { FeatureFlagService } from 'src/featureflag/featureflag.service';
import { PaymentProvider } from 'src/@shared/enum/accounting/payment-provider';
import { CurrencyType } from 'src/@core/models/currency/currency-type.model';
import { InsuranceEstimateDto } from 'src/accounting/encounter/models/patient-encounter.model';
import { ClaimEntity, OrignalInsuranceEstimateDto } from 'src/patient/common/models/patient-apply-insurance-payment.model';
import { UpdatedAllowedAmountDto } from 'src/insurance/fee-schedule/fee-schedule-dtos';
import { FeeScheduleUpdateModalRef, FeeScheduleUpdateModalService } from 'src/insurance/fee-schedule/fee-schedule-update-on-payment/fee-schedule-update-modal.service';
import { SapiValidationError } from 'src/@shared/models/sapi-validation-error';

@Component({
  selector: 'bulk-payment',
  templateUrl: './bulk-payment.component.html',
  styleUrls: ['./bulk-payment.component.scss'],
})
export class BulkPaymentComponent implements OnInit { 
  filter = {
    DateEntered: new Date(),
    BulkCreditTransactionType: 1,
    Carrier: null,
    InsurancePaymentTypeId: null,
    PaymentTypePromptValue: null,
    Note: null,
    PayerId: '',
    EraId: '',
    Locations: [],
    Amount: 0.0,
    PaymentGatewayTransactionId: null,
    UpdatedEstimates: [],
  };
  filterCopy = {
    DateEntered: new Date(),
    BulkCreditTransactionType: 1,
    Carrier: null,
    InsurancePaymentTypeId: null,
    PaymentTypePromptValue: null,
    Note: null,
    PayerId: '',
    EraId: '',
    Locations: [],
    Amount: 0.0,
    UpdatedEstimates: [],
  };
  hasEditedAllowedAmounts: boolean;
  invalidAllowedAmounts:boolean = false;
  paymentPrompt: string = '';
  cancelButtonText: string;
  carrierSearchPlaceholder: string = 'Search Carrier, Payer ID...';
  template = 'kendoAutoCompleteCarrierTemplate';
  today: Date = new Date();
  triggerOverlayClose: Subject<void> = new Subject();

  carriers: CarrierDto[];
  filteredCarrierList: any = [];
  // insurance payments is used for both eraClaimPayments and ClaimDto
  insurancePayments: any[] = [];
  resultPaged: any = [];
  locations: any = [];
  unappliedBulkPaymentTransactions: UnappliedBulkInsurancePayment[] = [];
  era: EraPaymentDto = null;
  selectedCarrier: any;
  selectedUnappliedBulkInsurancePayment: UnappliedBulkInsurancePayment = null;

  totalForServices: number = 0;
  filterAmountBackup: number = 0;
  page: number = 0;
  resultCount: number = 0;
  pagelength: number = 50;
  pageCount: number = 50;
  eraDistributionErrorPaymentAmount: number = 0;
  eraDistributionErrorServiceTotal: number = 0;
  selectedPaymentTypeId: any = 0;
  selectedPaymentType: any;
  unappliedAmount: number = 0;

  isEra: boolean = false;
  disableLocationSelector: boolean = false;
  disableCarrier: boolean = false;
  disableApplyButton: boolean = false;
  waitingOnValidation: boolean = false;
  serviceErrors: boolean = false;
  claimsHaveErrors: boolean = false;
  isUpdatings: boolean = false;
  showNoClaimsMessage: boolean = false;
  hasEraInitialDistributionError: boolean = false;
  showErrors: boolean = false;
  hasClinicalDocumentsAddAccess: boolean = false;
  distributedDetailsLoading: boolean = false;
  insurancePaymentIsValid: boolean = false;
  confirmationModalSubscription: Subscription;
  confirmationRef: ConfirmationModalOverlayRef;
  feeScheduleUpdateModalRef: FeeScheduleUpdateModalRef;
  feeScheduleUpdateModalSubscription: Subscription;

  filterHasChanges: boolean = false;
  amfaAccess: string;
  selectedCarrierName: string;
  isPaymentProviderEnabled: boolean = false;
  currentLocation: any = null;
  isBulkPaymentEobUploadEnabled: boolean = false;
  hasValidClaimPayments: boolean = false;
  waitOverlay: WaitOverlayRef;
  selectedLocationIds: number[] = [];
  patientListForFileUpload: string[] = [];
  // allowed amount override
  canEditAllowedAmount: boolean = false;
  // instruct the child to refresh after reset
  triggerRefreshEmitter = new EventEmitter<void>();  
  originalEstimates: OrignalInsuranceEstimateDto[] = [];

  patientListForFileUploadFirstPatient: string; //placeholder
  private unsubscribe$: Subject<any> = new Subject<any>();
  private overlayRef: OverlayRef;
  @ViewChild('templateRef') templateRef: TemplateRef<any>;
  soarAuthClinicalDocumentsAddKey = 'soar-doc-docimp-add';

   showPaymentProvider: boolean;
   showCardReaderDropDown: boolean;
   isPaymentDevicesExist = false;
   selectedCardReader: string;
   showPayPageModal=false;
   payPageUrl: SafeUrl;
   transactionInformation:any;


  // NOTE add as needed/remove as many of these as possible
  constructor(
    @Inject('$routeParams') private routeParams,
    @Inject('BusinessCenterServices') private businessCenterServices,
    @Inject('referenceDataService') private referenceDataService,
    @Inject('locationService') private locationService,
    @Inject('$location') private $location,
    @Inject('FeatureService') private featureService,
    @Inject('ModalFactory') private modalFactory,
    @Inject('TimeZoneFactory') private timeZoneFactory,
    @Inject('PatientInsurancePaymentFactory')
    private patientInsurancePaymentFactory,
    @Inject('PersonFactory') private personFactory,
    @Inject('PaymentGatewayService') private paymentGatewayService,
    @Inject('platformSessionCachingService')
    private platformSessionCachingService,
    @Inject('toastrFactory') private toastrFactory,
    @Inject('AmfaInfo') private amfaInfo,
    @Inject('patSecurityService') private patSecurityService,
    @Inject('UserServices') private userServices,
    @Inject('$q') private $q,
    @Inject('PatientValidationFactory') private patientValidationFactory,
    @Inject('GlobalSearchFactory') private globalSearchFactory,
    @Inject('tabLauncher') private tabLauncher,
    @Inject('PatientServices') private patientServices,
    @Inject('localize') private localize,
    private eraService: SoarEraHttpService,
    private locationsService: SoarLocationHttpService,
    private bulkPaymentService: SoarBulkPaymentHttpService,
    private carrierLongLabelPipe: CarrierLongLabelPipe,
    private insurancePaymentIsValidPipe: InsurancePaymentIsValidPipe,
    private confirmationModalService: ConfirmationModalService,
    private translate: TranslateService,
    private paymentGatewayTransactionService: SoarPaymentGatewayTransactionHttpService,
    private registrationService: PatientRegistrationService,
    private cd: ChangeDetectorRef,
    private waitOverlayService: WaitOverlayService,
    private overlay: Overlay,
    private viewContainerRef: ViewContainerRef,
    private paymentTypesService: PaymentTypesService,
    private featureFlagService: FeatureFlagService,
    private sanitizer: DomSanitizer,
    private feeScheduleUpdateModalService: FeeScheduleUpdateModalService,
     
  ) {}

  ngOnInit(): void {
    // TODO add security checks
      if (
          !this.patSecurityService.IsAuthorizedByAbbreviation(
              'soar-acct-aipmt-view'
          )
      ) {
          this.toastrFactory.error(
              this.patSecurityService.generateMessage('soar-acct-aipmt-view'),
              'Not Authorized'
          );
          this.$location.path('/');
          return;
      }
      
      let initPromises: Promise<any>[] = [];

      this.amfaAccess = 'soar-acct-aipmt-add';
      this.hasClinicalDocumentsAddAccess = this.authAccessByType(
          this.soarAuthClinicalDocumentsAddKey
      );
      this.isEra = this.routeParams.EraId ? true : false;
      // disable location selector until we get era payments
      this.disableLocationSelector =  this.routeParams.EraId ? true : false;
      this.disableCarrier = this.routeParams.EraId ? true : false;
      this.cancelButtonText = this.isEra ? 'Cancel' : 'Clear';
      // may not need this once we have access-based-location-selectory
      this.referenceDataService.getData(
          this.referenceDataService.entityNames.locations)
          .then(locationResult => {
              this.locations = locationResult;

              this.today = new Date();
              this.selectedPaymentTypeId = 0;
              this.showErrors = false;

              this.featureService
                  .isEnabled('BulkPaymentEobUpload', 'practicesettingrow')
                  .then((res: any) => {
                      this.isBulkPaymentEobUploadEnabled = res;
                  });

              // determine current location and default the location dropdown to this
              var currentLocation = this.locationService.getCurrentLocation();
              let locations = this.locations.filter(location => {
                  return location.LocationId === currentLocation.id;
              });
      
              // set initial filter to current location
              this.filter.Locations = locations.map(x => x.LocationId);
              let carriersPromise = this.businessCenterServices.Carrier.get().$promise;
              carriersPromise.then(res => {
                  // order carriers
                  this.processCarriers(res.Value);
                  if (this.routeParams.EraId) this.getEra(this.routeParams.EraId);
                  else {
                      this.selectedLocationIds = [currentLocation.id];
                  }
              });
              initPromises.push(carriersPromise);
              
              Promise.all(initPromises).then(() => {
                  if (locations.length === 1) this.onLocationChange(locations[0]);

                  this.registrationService
                      .getRegistrationEvent()
                      .pipe(takeUntil(this.unsubscribe$))
                      .subscribe((event: RegistrationCustomEvent) => {
                          if (event) {
                              switch (event.eventtype) {
                                  case RegistrationEvent.CurrentLocation:
                                      let locations = this.locations.filter(location => {
                                          return location.LocationId === event.data.id;
                                      });

                                      if (locations.length === 1) this.onLocationChange(locations[0]);

                                      break;
                              }
                          }
                      });
              });
          });

      this.checkFeatureFlags();
  }

  onLocationChange(location: any) {
    if (location.LocationId === this.currentLocation?.LocationId) return;

    this.currentLocation = location;

    this.unappliedBulkPaymentTransactions = [];
    var locationPaymentGatewayEnabled =
      location && location.IsPaymentGatewayEnabled;


    this.isPaymentProviderEnabled =
      locationPaymentGatewayEnabled && location?.PaymentProvider != null;

    if (this.selectedUnappliedBulkInsurancePayment) this.cancelPayment();

    if (this.isPaymentProviderEnabled) this.loadUnappliedBulkInsurancePayments();
     if(this.selectedPaymentType && this.selectedPaymentType.CurrencyTypeId === CurrencyType.CreditCard)
     this.selectedPaymentTypeWatcher(this.selectedPaymentType);
  }

  loadUnappliedBulkInsurancePayments(
    clearCache?: boolean
  ): Promise<void | SoarResponse<UnappliedBulkInsurancePayment[]>> {
    return this.paymentGatewayTransactionService
      .requestUnappliedBulkInsurancePayments(clearCache)
      .then(res => {
        let unapplied = res.Value;
        unapplied.sort((a, b) => (a.PaymentDate > b.PaymentDate ? 1 : -1));

        this.unappliedBulkPaymentTransactions = unapplied;
      });
  }

  processCarriers(carriers) {
    this.carriers = carriers.sort((a, b) => (a.Name < b.Name ? -1 : 1));
    this.carriers.forEach(carrier => {
      carrier.LongLabel = this.carrierLongLabelPipe.transform(carrier);
    });
    this.filteredCarrierList = cloneDeep(this.carriers);
  }

  onCarrierChanged(carrierId: string): void {
    if (this.filter.Carrier && this.filter.Carrier.CarrierId === carrierId) {
      // if carrier is already selected, do not make a second call to get the same list of claims
      // but reset the selected carrier name to null and trigger the change detection
      this.selectedCarrierName = null;
      this.cd.detectChanges();
      this.selectCarrier(carrierId); 
      return;
    }
       
    this.selectCarrier(carrierId);
    if (this.isEra) {
      // Eras with unmatched payments and flag enabled
      if (this.era.Era.IsAutoMatched === false && (this.filter.Carrier || this.filter.PayerId))  
        this.getClaimsList();
    } else {
      // Not Era 
      if (this.filter.Carrier || this.filter.PayerId) 
        this.getClaimsList();
    }    
  }

  selectCarrier(carrierId: string, isPayerIdSearch: boolean = false): void {
    if (carrierId && carrierId !== '') {
      let carrier = this.filteredCarrierList.find(
        x => x.CarrierId == carrierId
      );
      if (carrier) {
        if (carrier.SearchType === 'payerIdSearch' || isPayerIdSearch) {
          this.filter.Carrier = null;
          this.filter.PayerId = carrier.PayerId;
          this.selectedCarrierName = carrier.PayerId;
        } else {
          this.filter.PayerId = '';
          this.filter.Carrier = carrier;
            this.selectedCarrierName = carrier.Name;
        }
      }
    } else {
      this.cancelPayment();
    }

    // special handling for ERA, preserve payment type  on carrier change 
    this.selectedPaymentTypeId = this.isEra? this.selectedPaymentTypeId : 0;
    this.checkFilterChanges();
  }

  filterCarriers(item: string) {
    this.filteredCarrierList = this.carriers.filter(
      carrier =>
        carrier.LongLabel.toLowerCase().indexOf(item.toLowerCase()) !== -1
    );

    if (
      this.$location.path() === '/BusinessCenter/Insurance/BulkPayment' &&
      item.length === 5
    ) {
      this.carriers.find(carrier => {
        if (
          carrier.PayerId &&
          carrier.PayerId !== '06126' &&
          carrier.PayerId.toLowerCase() === item.toLowerCase()
        ) {
          let payerObj: CarrierDto = {
            LongLabel: 'All Submitted Claims with Payer ID: ' + carrier.PayerId,
            SearchType: 'payerIdSearch',
            Name: carrier.PayerId,
            CarrierId: carrier.PayerId,
            PayerId: carrier.PayerId,
            AddressLine1: '',
            AddressLine2: '',
            City: '',
            State: '',
            Zip: '',
            PhoneNumbers: [],
            IsActive: carrier.IsActive,
          };
          return this.filteredCarrierList.unshift(payerObj);
        }
      });
    }
  }

  validateFilter() {
    if (
      this.filter.Carrier &&
      this.filter.Carrier.CarrierId &&
      this.filter.Locations &&
      this.filter.Locations.length > 0
    ) {
      return true;
    }
    if (
      this.filter.PayerId &&
      this.filter.Locations &&
      this.filter.Locations.length > 0
    ) {
      return true;
    }
    return false;
  }

  getClaimsList() {
    if (this.validateFilter()) {
      const requestArgs = new RequestArgs();
      requestArgs.carrierId = this.filter.Carrier
        ? this.filter.Carrier.CarrierId
        : null;
      requestArgs.payerId = this.filter.PayerId;
      requestArgs.locations = this.filter.Locations;
      if (requestArgs.carrierId) {
        this.bulkPaymentService
          .requestClaimsListByCarrierId(requestArgs)
          .subscribe(claimDtos => {
            this.processClaims(claimDtos.Value);
          });
      } else if (requestArgs.payerId) {
        this.bulkPaymentService
          .requestClaimsListByPayerId(requestArgs)
          .subscribe(claimDtos => {
            this.processClaims(claimDtos.Value);
          });
      }
    } else {
      this.processClaims([]);
    }
  }

  processClaims(claimDtos) {
    claimDtos.forEach(claim => {
      let locationTemp = this.locations.find(
        location => location.LocationId == claim.LocationId
        );
        let locationTimezone = locationTemp ? locationTemp.Timezone : ''; 
        claim.ServiceTransactionToClaimPaymentDtos.sort((a, b) => {
            if (a.InsuranceOrder === b.InsuranceOrder) {
                return new Date(a.DateEntered) > new Date(b.DateEntered) ? 1 : -1;
            }
            return a.InsuranceOrder > b.InsuranceOrder ? 1 : -1;
        });
        claim.ServiceTransactionToClaimPaymentDtos.forEach(serviceTransaction => {
            serviceTransaction.TotalInsurancePayments = Math.abs(
                serviceTransaction.TotalInsurancePayments
            );
            serviceTransaction.displayDateEntered = this.timeZoneFactory
                .ConvertDateToMomentTZ(
                    serviceTransaction.DateEntered,
                    locationTimezone
                )
                .format('MM/DD/YYYY');
        });        
    });

    this.resultPaged = claimDtos;
    this.resultCount = this.resultPaged.length;
    this.insurancePayments = [];

    this.page = 0;
    this.pageCount = this.pagelength;
    this.insurancePayments = cloneDeep(this.resultPaged);
    this.originalEstimates = this.snapshotOriginalEstimates(claimDtos);

    if (this.validateFilter()) {
      this.showNoClaimsMessage =
        this.insurancePayments.length === 0 ? true : false;
    } else {
      this.showNoClaimsMessage = false;
    }
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


  selectedPaymentTypeWatcher(paymentType) {
    if (paymentType !== null && paymentType !== undefined) {
      this.selectedPaymentType = paymentType;
      this.selectedPaymentTypeId = paymentType.PaymentTypeId;
      this.showCardReaderDropDown = paymentType.CurrencyTypeId === CurrencyType.CreditCard && this.showPaymentProvider && this.currentLocation?.IsPaymentGatewayEnabled && this.currentLocation?.PaymentProvider === PaymentProvider.TransactionsUI;
      this.filter.InsurancePaymentTypeId = paymentType.PaymentTypeId;
      this.paymentPrompt = this.showCardReaderDropDown? '': paymentType.Prompt;
    } else {
      this.filter.InsurancePaymentTypeId = null;
      this.paymentPrompt = '';
      this.showCardReaderDropDown = false;
    }
    if (!this.showCardReaderDropDown) {
      this.selectedCardReader = null;
      this.isPaymentDevicesExist =false;
    }
    this.checkFilterChanges();
  }

  serviceAmountBlurEvent(event) {
    if (event.claim) {
      let claim = event.claim;
      // get total PaymentAmount for claim
      claim.PaymentAmount = claim.ServiceTransactionToClaimPaymentDtos.reduce(
        (sum, item) => {
          return sum + item.PaymentAmount;
        },
        0
      );
      this.validate();

      this.insurancePaymentIsValid = this.insurancePaymentIsValidPipe.transform(this.insurancePayments, this.canEditAllowedAmount); 
      
      // // in this case, "service" is actually the same object referentially as the specific claim servicetransactiontoclaimpaymentdto
      // // you are looking for with the filter, so we can modify "service" directly
      event.service.$$hasError =
        (event.service.Charges - event.service.TotalInsurancePayments).toFixed(
          2
        ) < event.service.PaymentAmount.toFixed(2);

      let servicesWithErrors =
        event.claim.ServiceTransactionToClaimPaymentDtos.filter(serviceTx => {
          return serviceTx.$$hasError === true;
        });
      event.claim.$$servicesHaveErrors = servicesWithErrors.length > 0;

      this.checkClaimsForServicesErrors();

      this.checkForValidClaimPayments();
    }
  }
  finalPaymentChangeEvent(claim) {
    this.insurancePaymentIsValid = this.insurancePaymentIsValidPipe.transform(this.insurancePayments, this.canEditAllowedAmount);     
    this.checkForValidClaimPayments();
  }

  navToPatientProfile(personId) {
    this.personFactory.getById(personId).then(result => {
      var patientInfo = result.Value;
      this.patientValidationFactory
        .PatientSearchValidation(patientInfo)
        .then(res => {
          patientInfo = res;
          if (
            !patientInfo.authorization
              .UserIsAuthorizedToAtLeastOnePatientLocation
          ) {
            this.patientValidationFactory.LaunchPatientLocationErrorModal(
              patientInfo
            );
            return '';
          } else {
            this.globalSearchFactory.SaveMostRecentPerson(personId);
            var patientLocation = '#/Patient/';
            this.$location.search('newTab', null);
            this.tabLauncher.launchNewTab(
              patientLocation + personId + '/Summary/?tab=Account%20Summary'
            );
            return '';
          }
        });
    });
  }

  masterNoteChangeEvent(masterNote) {
    this.filter.Note = masterNote;
  }

  apply() {
    this.disableApplyButton = true;
    this.totalForServices = Math.round(this.totalForServices * 100) / 100;
    this.unappliedAmount = Math.round(this.unappliedAmount * 100) / 100;

    // Ensure that $0 final payments are posted.
    this.insurancePayments.forEach(payment => {
      if (payment.FinalPayment && payment.PaymentAmount === null)
        payment.PaymentAmount = 0;
    });
    if (this.validate()) {
      // only process 'new' CC payment through OE, not unapplied
      if (
        this.currentLocation &&
        this.selectedPaymentType.CurrencyTypeId === 3 &&
        !this.filter.PaymentGatewayTransactionId
      ) {
        this.applyCreditCardPayment();
      } else {
        // TODO move to services
        this.patientInsurancePaymentFactory.applyInsurancePayments(
          this.filter,
          this.insurancePayments,
          this.selectedPaymentType,
          this.applyInsurancePaymentsSuccess.bind(this),
          this.applyInsurancePaymentsFailure
        );
      }
    } else {
      this.disableApplyButton = false;
    }
  }

  applyCreditCardPayment() {
    const userContext = this.platformSessionCachingService.userContext.get();
    const userId = userContext.Result.User.UserId;
    this.userServices.Users.get({ Id: userId }).$promise.then(
      result => {
        const user = result.Value;
        if (this.isPaymentProviderEnabled === false) {
          // User should be shown the disabled message if ShowCardServiceDisabledMessage if they haven't opted to suppress modal
          // the CardServiceDisabledModal warns You are about to make a credit/debit card payment, but the integration with the credit card service is disabled for this location.
          // If they have opted to suppress modal allow CC payment type without CC integration
          if (user.ShowCardServiceDisabledMessage === true) {
            this.modalFactory
              .CardServiceDisabledModal(this.currentLocation.NameLine1, user)
              .then(() => {
                // if user selects Yes, regular payment, no CC integration
                this.patientInsurancePaymentFactory.applyInsurancePayments(
                  this.filter,
                  this.insurancePayments,
                  this.selectedPaymentType,
                  this.applyInsurancePaymentsSuccess.bind(this),
                  this.applyInsurancePaymentsFailure
                );
              });
          } else {
            // regular payment, no CC integration
            this.patientInsurancePaymentFactory.applyInsurancePayments(
              this.filter,
              this.insurancePayments,
              this.selectedPaymentType,
              this.applyInsurancePaymentsSuccess.bind(this),
              this.applyInsurancePaymentsFailure
            );
          }
        } else {
          // process CC payment
          this.applyPayment();
        }
      },
      () => {
        this.toastrFactory.error(
          this.translate.instant('Get user failed.'),
          this.translate.instant('Error')
        );
      }
    );
  }

  applyPayment() {
    if (!this.selectedCarrierName) return;
 
    var carrierId = this.filter.Carrier ? this.filter.Carrier.CarrierId : null;
    var payerId = this.filter.PayerId ? this.filter.PayerId : null;
    if( this.currentLocation.IsPaymentGatewayEnabled){
      if(this.showPaymentProvider && this.currentLocation.PaymentProvider !== PaymentProvider.OpenEdge){
        this.paymentGatewayService.createPaymentProviderCreditForBulkInsurance(
          carrierId,
          payerId,
          this.filter.InsurancePaymentTypeId,
          this.filter.Amount,
          1,
          false).$promise.then((result) => {
             this.transactionInformation =result.Value;
              const paymentIntentDto ={
              LocationId: this.currentLocation?.LocationId,
              PaymentGatewayTransactionId: result.Value.PaymentGatewayTransactionId,
              Amount: this.filter.Amount,
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
        this.paymentGatewayService.createCreditForBulkInsurance(
          carrierId,
          payerId,
          this.filter.InsurancePaymentTypeId,
          this.filter.Amount,
          1,
          false,
          this.createCreditTransactionSuccess,
          this.createCreditTransactionFailure
        );

      }
    }  
  }

  closePaypage(){
    this.disableApplyButton = false;
    this.showPayPageModal = false;
  }

  openPaypage(): void {
    this.showPayPageModal = true;
    sessionStorage.setItem('isPaypageModalOpen', 'true');
  }

  checkFeatureFlags() {
      this.featureFlagService.getOnce$(FuseFlag.UsePaymentService).subscribe(value => {
        this.showPaymentProvider = value;
      });
      this.featureFlagService.getOnce$(FuseFlag.EnableUpdateAllowedAmountOnPaymentScreen).subscribe((value) => {
        this.canEditAllowedAmount = value;
      });
  }  
  
  cardReaderChanged(value: string): void {
    this.selectedCardReader = value == '0' ? null : value;
  }

  isCardReaderExist(value:boolean){
    this.showCardReaderDropDown = value;
    this.isPaymentDevicesExist = value;
  }
          
  handlePayPageTransactionCallback(): void {
    this.paymentGatewayService.completeCreditTransaction(this.transactionInformation ,7, this.createCreditTransactionSuccess, this.createCreditTransactionFailure);
    this.closePaypage()   
 }

  getCardTransactionOverlay() {
    const data = {
      header: 'Please wait, do not refresh...',
      message: 'Your payment is currently being processed. ',
      message2:
        'Refreshing the page or closing the browser during this transaction may prevent the payment from being posted to the patient account.',
    };
    return this.waitOverlayService.open({ data });
  }

  createCreditTransactionSuccess = transactionId => {
    this.filter.PaymentGatewayTransactionId = transactionId;
    this.removeWaitOverlay();
    this.patientInsurancePaymentFactory.applyInsurancePayments(
      this.filter,
      this.insurancePayments,
      this.selectedPaymentType,
      this.applyInsurancePaymentsSuccess.bind(this),
      this.applyInsurancePaymentsFailure
    );
  };

  createCreditTransactionFailure = () => {
    this.removeWaitOverlay();
    this.disableApplyButton = false;
  };

  removeWaitOverlay() {
    if (this.waitOverlay) {
      this.waitOverlay.close();
      this.waitOverlay = null;
    }
  }

  applyInsurancePaymentsSuccess() {
    this.hasEditedAllowedAmounts = false;
    const shouldClearUnappliedCache =
      this.selectedUnappliedBulkInsurancePayment != null;    
      this.cancelPayment(true);

    if (this.isPaymentProviderEnabled)
        this.loadUnappliedBulkInsurancePayments(shouldClearUnappliedCache);

    // we need to check if any allowed amounts were edited and take appropriate action
    const updatedAllowedAmounts = this.getUpdatedAllowedAmounts(this.insurancePayments);
    if (updatedAllowedAmounts && updatedAllowedAmounts.length > 0) {
      // handle update of allowed amounts
      this.handleUpdatedAllowedAmounts(updatedAllowedAmounts);
    } else {
      this.insurancePayments=[];
      this.confirmRedirect();
    }  
  }

  confirmRedirect() {
    if (this.era) {
        let message = `Payment operation complete, return to ERA Screen.`;
        let title = this.translate.instant('Success');
        let okButtonText = this.translate.instant('OK');
        this.modalFactory.ConfirmModal(title, message, okButtonText).then(() => this.redirectToEra());
    }
  }

  redirectToEra = () => {
      localStorage.setItem("eraPaymentApplied", "true");
      window.close();
  }

  // error handling method for patientInsurancePaymentFactory.applyInsurancePayments
  applyInsurancePaymentsFailure = error => {
    // error handling if error is for the credit transaction
    let invalidClosedClaim = error.data.InvalidProperties.filter(
      invalidProperty => {
        return invalidProperty.PropertyName === 'claim.IsClosed';
      }
    );
    if (invalidClosedClaim.length > 0) {
      this.toastrFactory.error(
        this.translate.instant(
          'Failed to apply insurance payment - claim has already been closed.'
        )
      );
    } else {
      this.toastrFactory.error(
        this.translate.instant('An error has occurred while applying payment.'),
        this.translate.instant('Error')
      );
    }
    // if this is a CC payment, the OE transaction succeeded but apply failed.
    if (
      this.selectedPaymentType.CurrencyTypeId === 3 &&
      this.isPaymentProviderEnabled
    ) {
      this.handleUnappliedPaymentProviderPayment();
    }
    this.disableApplyButton = false;
  };

  // Open Edge transaction has succeeded but payment distribution has not.
  // distribution should remain as user has entered it
  // unapplied CC payment is added to and automatically selected from list of unapplied
  // apply button not disabled, dropdowns and search bar are disabled
  handleUnappliedPaymentProviderPayment(): Promise<void> {
    return this.paymentGatewayTransactionService
      .requestUnappliedBulkInsurancePayments(true)
      .then(res => {
        let unapplied = res.Value;
        unapplied.sort((a, b) => (a.PaymentDate > b.PaymentDate ? 1 : -1));
        this.unappliedBulkPaymentTransactions = unapplied;
        // find the PaymentGatewayTransaction we just updated
        let paymentGatewayTransaction =
          this.unappliedBulkPaymentTransactions.find(unapplied => {
            return (
              unapplied.PaymentGatewayTransactionId ===
              this.filter.PaymentGatewayTransactionId
            );
          });
        if (paymentGatewayTransaction) {
          this.selectedUnappliedBulkInsurancePayment =
            paymentGatewayTransaction;
          this.disableCarrier = true;
        }
      });
  }

  distributePaymentAmount(event: ClaimPaymentAmountBlurEvent) {
    if (event.amount >= 0 && event.claim) {
      this.distributedDetailsLoading = true;
      // TODO move to  http services
      this.patientInsurancePaymentFactory.distributeAmountToServices(
        event.amount,
        [event.claim],
        () => this.distributePaymentAmountSuccess(event.changeDetectorRef),
        this.distributePaymentAmountFailure
      );
      this.validate();
      this.checkForValidClaimPayments();
    }
  }

  distributePaymentAmountSuccess = (changeDetectorRef: ChangeDetectorRef) => {
    this.distributedDetailsLoading = false;
    this.insurancePaymentIsValid = this.insurancePaymentIsValidPipe.transform(this.insurancePayments, this.canEditAllowedAmount);  
    this.validate();
    this.checkClaimsForServicesErrors();
    changeDetectorRef.markForCheck();
  };

  distributePaymentAmountFailure = () => {
    this.distributedDetailsLoading = false;
  };

  checkClaimsForServicesErrors() {
    let claimsWithErrors = this.insurancePayments.filter(claim => {
      return claim.$$servicesHaveErrors === true;
    });
    this.claimsHaveErrors = claimsWithErrors.length > 0;
  }

  processPaymentChange(event) {
      this.filter.Amount = event.NewValue;
    // if the filterAmountBackup is 0
    var shouldPrompt =
      this.filter.Amount != this.filterAmountBackup &&
      this.filterAmountBackup > 0;
    var hasDistribution = this.totalForServices > 0 ? true : false;
    this.processUnappliedAmount();
    // non era bulk payments
    if (shouldPrompt && hasDistribution === true && !this.isEra) {
      this.confirmClearingDistribution();
    }
    // store a copy of the payment to compare when amount has changed
    this.filterAmountBackup = this.filter.Amount;
    this.checkFilterChanges();
  }

  processUnappliedAmount() {
    this.totalForServices = this.insurancePayments.reduce((sum, item) => {
      return sum + item.PaymentAmount;
    }, 0);
    this.unappliedAmount = this.filter.Amount - this.totalForServices;
  }

  validate() {
    this.processUnappliedAmount();
    this.showErrors =
      this.unappliedAmount < -0.009999 ||
      this.unappliedAmount > 0.009999 ||
      !this.filter.DateEntered ||
      !this.filter.InsurancePaymentTypeId ||
      (this.showCardReaderDropDown && this.isPaymentDevicesExist && (!this.selectedCardReader || this.selectedCardReader == '0'))

    // 431874: Some come through initially with claim payments not matching service distributions.
    //     scenario: Claim submitted with a service.Insurance company downgrades the service
    //         (Composite > Amalgam) and pays.Fuse cannot distribute the payment to the existing service
    //             on the claim because it does not match the service that insurance paid on.
    if (this.isEra) {
      this.hasEraInitialDistributionError = false;
      this.insurancePayments.forEach(claimPayment => {
        var serviceAmountSum =
          claimPayment.ServiceTransactionToClaimPaymentDtos.reduce(
            (sum, item) => {
              return sum + item.PaymentAmount;
            },
            0
          );
        claimPayment.highlightAmountError =
          Math.abs(claimPayment.PaymentAmount - serviceAmountSum) > 0.009999;

        //capture error message detail for the first violation only
        if (
          claimPayment.highlightAmountError &&
          !this.hasEraInitialDistributionError
        ) {
          this.hasEraInitialDistributionError = true;
          this.eraDistributionErrorPaymentAmount = claimPayment.PaymentAmount;
          this.eraDistributionErrorServiceTotal = serviceAmountSum;
        }
      });
    }
    return !this.showErrors;
  }

  // location selector is enabled if era's have no claim payments or not an era
  // check disabled setting because this is triggered by selector on setting location
  locationChange = function () {
   
    if (!this.disableLocationSelector) {
      if (!this.selectedUnappliedBulkInsurancePayment)
        this.clearPaymentAndDistribution();
      if (this.selectedUnappliedBulkInsurancePayment) this.clearDistribution();
      this.getClaimsList();
    }
  };

  clearContent = function () {
    this.filter.Carrier = {};
  };

  getEra(eraId) {
    this.eraService.requestEraClaimPayments({ eraId: eraId }).subscribe(
      eraClaimPayment => {
        this.era = this.processEra(eraClaimPayment.Value);
      },
      err => {
        this.toastrFactory.error(
          this.translate.instant('Failed to retrieve Era data'),
          this.translate.instant('Error')
        );
      }
    );
  }

  processEra(eraClaimPayments: EraPaymentDto) {
    this.applyEraCarrier(eraClaimPayments.Era);
    this.applyEraToGrid(eraClaimPayments.ClaimPayments);
    this.applyEraLocation(eraClaimPayments.LocationIds);
    this.applyEraPaymentType(eraClaimPayments.Era.CurrencyType);
    const paymentNumber =
      eraClaimPayments.Era.PaymentNumber &&
      eraClaimPayments.Era.PaymentNumber.length > 25
        ? eraClaimPayments.Era.PaymentNumber.slice(0, 25)
        : eraClaimPayments.Era.PaymentNumber;

    // Total paid: old logic was to default to total paid for entire source ERA, new logic is just the paid amount for this EraHeaderId
    this.filter.Amount = eraClaimPayments.PaidTotal;

    this.filter.PaymentTypePromptValue = paymentNumber;
    this.filter.EraId = this.routeParams.EraId;
    this.filter.BulkCreditTransactionType = 3;
    this.validate();
    this.insurancePaymentIsValid =this.insurancePaymentIsValidPipe.transform(this.insurancePayments, this.canEditAllowedAmount);


    // 431874: Expand all claims if any era initial distribution error (from validate())
    // An unusal requirement imo, but the requirement is clearly stated.
    if (this.hasEraInitialDistributionError) {
      this.insurancePayments.forEach(claimPayment => {
        claimPayment.expanded = claimPayment.highlightAmountError;
      });
    }
    return eraClaimPayments;
  }

  applyEraToGrid(claimPayments) {
    this.insurancePayments = claimPayments;
    //trigger error text if no results returned and carrier is selected
    if (this.filter.Carrier) {
      this.showNoClaimsMessage = this.insurancePayments.length === 0;
      }

    // Open claim/payment if there is an ins payment so that office can see distribution
    this.insurancePayments.forEach(claimPayment => {
      claimPayment.selected = claimPayment.PaymentAmount > 0 ? true : false;
      const claimLocation = this.locations.find(
        location => location.LocationId === claimPayment.LocationId
        );
      const locationTimezone = claimLocation ? claimLocation.Timezone : '';
      claimPayment.ServiceTransactionToClaimPaymentDtos.forEach(
        serviceTransaction => {
          serviceTransaction.displayDateEntered = this.timeZoneFactory
            .ConvertDateToMomentTZ(
              serviceTransaction.DateEntered,
              locationTimezone
            )
            .format('MM/DD/YYYY');
          // set flags on services and claim/payment for payment errors
          serviceTransaction.TotalInsurancePayments = Math.abs(
            serviceTransaction.TotalInsurancePayments
          );
          serviceTransaction.$$hasError =
            serviceTransaction.Charges -
              serviceTransaction.TotalInsurancePayments <
            Math.abs(serviceTransaction.PaymentAmount);
          if (serviceTransaction.$$hasError) {
            claimPayment.$$servicesHaveErrors = true;
          }
        }
      );
    });
    this.checkClaimsForServicesErrors();
  }

  applyEraLocation(eraLocationIds: number[]) {
    // set the filter.Locations for only those locations that the user has permissions for...
    const getActionId = this.amfaInfo[this.amfaAccess].ActionId;
    this.locationsService
      .requestPermittedLocations({ actionId: getActionId })
      .subscribe(locations => {
        const allPermittedLocations = locations.Value;
        const appendedLocations = allPermittedLocations.filter(location =>
          eraLocationIds.includes(location.LocationId)
        );
        this.filter.Locations = [...appendedLocations.map(x => x.LocationId)];
        this.selectedLocationIds = [
          ...appendedLocations.map(x => x.LocationId),
        ];
        this.disableLocationSelector = this.selectedLocationIds.length > 0 ? true: false
        this.cd.detectChanges();
      });
  }
  // If carrier is not determined on the ERA, allow user to set and change the carrier 
  // (else is locked down to a carrier as it is today)
  applyEraCarrier(era) {
    const eraCarrier = this.filteredCarrierList.find(
      carrier => carrier.CarrierId === era.CarrierId
    );
    this.filter.Carrier = eraCarrier;
    this.selectedCarrierName = eraCarrier ? eraCarrier.Name : '';   
    this.selectedPaymentTypeId = 0;
    this.checkFilterChanges();
    this.disableCarrier = eraCarrier ? true: false;
  }

  applyEraPaymentType(currencyType) {
    const insurancePaymentTypeCategory = 2;
    this.paymentTypesService
      .getAllPaymentTypesMinimal(true, insurancePaymentTypeCategory)
      .then((res: SoarResponse<PaymentTypes[]>) => {
        const paymentTypes = res?.Value;
        const eraPaymentType = paymentTypes?.find(
          paymentType => paymentType?.CurrencyTypeId == currencyType
        );
        if (eraPaymentType) {
          this.selectedPaymentTypeId = eraPaymentType?.PaymentTypeId;
          this.filter.InsurancePaymentTypeId = eraPaymentType?.PaymentTypeId;
        }
      });
  }

  applyUnappliedPaymentLocation(
    unappliedPayment: UnappliedBulkInsurancePayment
  ) {
    this.selectedLocationIds = null;
    this.selectedLocationIds = [unappliedPayment.LocationId];
    this.filter.Locations = [unappliedPayment.LocationId];
    this.cd.detectChanges();
  }

  applyUnappliedPaymentPaymentType(
    unappliedPayment: UnappliedBulkInsurancePayment
  ) {
    this.selectedPaymentTypeId = unappliedPayment.PaymentTypeId;
    this.filter.InsurancePaymentTypeId = unappliedPayment.PaymentTypeId;
  }

  cancelPaymentConfirm() {
    let header = this.isEra
      ? this.translate.instant('Cancel Bulk Payment')
      : this.translate.instant('Clear Bulk Payment');
    let message = this.isEra
      ? this.translate.instant(
          'Are you sure you want to clear the bulk insurance payment?'
        )
      : this.translate.instant(
          'Are you sure you want to discard these changes?'
        );
    let data = {
      header: header,
      message: message,
      confirm: this.translate.instant('Yes'),
      cancel: this.translate.instant('No'),
      height: 200,
      width: 650,
    };
    this.confirmationRef = this.confirmationModalService.open({
      data,
    });
    this.confirmationModalSubscription = this.confirmationRef.events
      .pipe(
        filter(event => !!event),
        filter(event => {
          return event.type === 'confirm' || event.type === 'close';
        }),
        take(1)
      )
      .subscribe(events => {
        switch (events.type) {
          case 'confirm':
            this.cancelPayment(true);
            this.confirmationRef.close();
            window.close();
            break;
          case 'close':
            this.confirmationRef.close();
            break;
        }
      });
  }

  cancelPayment = (backToEra: boolean = false) => {
    // maintain selected locations
    let locations = this.filter.Locations;
    // @ts-ignore
    this.filter = cloneDeep(this.filterCopy);
    this.filter.Locations = locations;
    this.filter.PaymentGatewayTransactionId = null;
    // special handling for ERA, preserve payment type   
    this.selectedPaymentTypeId = this.isEra? this.selectedPaymentTypeId : 0;
    this.unappliedAmount = 0.0;
    this.filteredCarrierList = cloneDeep(this.carriers);
    this.showNoClaimsMessage = false;
    this.showErrors = false;
    this.selectedCarrierName = null;
    this.selectedUnappliedBulkInsurancePayment = null;
    this.disableLocationSelector = false;
    this.disableCarrier = false;
    this.checkFilterChanges();
    this.filterAmountBackup = 0;  
    this.disableApplyButton = false;
  };

  checkFilterChanges = function () {
    var hasChanges = false;
    if (this.filterCopy) {
      hasChanges =
        this.filter.BulkCreditTransactionType !==
          this.filterCopy.BulkCreditTransactionType ||
        this.filter.InsurancePaymentTypeId !==
          this.filterCopy.InsurancePaymentTypeId ||
        this.filter.PaymentTypePromptValue !==
          this.filterCopy.PaymentTypePromptValue ||
        this.filter.Note !== this.filterCopy.Note ||
        this.filter.Carrier !== this.filterCopy.Carrier;
    }
    this.filterHasChanges = hasChanges;
  };

  // clear payment and distribution
  clearPaymentAndDistribution() {
    // special handling for ERA
    // Only clear the payment amount and selectedPaymentTypeId if this is not an era
    if (!this.isEra) {
      this.filter.Amount = 0;
      this.selectedPaymentTypeId = 0;
      this.disableLocationSelector = false;
      this.filterAmountBackup = 0;
    }
    this.resultPaged = [];
    this.insurancePayments = [];
    this.filter.PaymentGatewayTransactionId = null;
    this.insurancePayments = cloneDeep(this.resultPaged);
    this.unappliedAmount = 0.0;
    this.filteredCarrierList = cloneDeep(this.carriers);
    this.showNoClaimsMessage = false;
    this.showErrors = false;
    this.checkFilterChanges();
  }

  // clear distribution only when payment amount changed and confirmed
  clearDistribution() {
    this.insurancePayments = [];
    // reset the insurancePayments, necessary because of ChangeDetectionStrategy.Push on claim-payment-table
    this.insurancePayments = cloneDeep(this.resultPaged);
    this.showErrors = false;
    this.unappliedAmount = 0;
    this.checkFilterChanges();
  }

  confirmClearingDistribution() {
    let data = {
      header: this.translate.instant('Confirm'),
      message: this.translate.instant(
        'Would you like to clear the current distribution for this payment?'
      ),
      confirm: this.translate.instant('Yes'),
      cancel: this.translate.instant('No'),
      height: 200,
      width: 650,
    };
    this.confirmationRef = this.confirmationModalService.open({
      data,
    });
    this.confirmationModalSubscription = this.confirmationRef.events
      .pipe(
        filter(event => !!event),
        filter(event => {
          return event.type === 'confirm' || event.type === 'close';
        }),
        take(1)
      )
      .subscribe(events => {
        switch (events.type) {
          case 'confirm':
            this.clearDistribution();
            this.confirmationRef.close();
            break;
          case 'close':
            this.confirmationRef.close();
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

    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  // captures location changes
  onSelectedValueChanged(locations) {
    this.filter.Locations = locations.map(x => x.value);
    this.locationChange();
  }

  onDateChanged(event) {}

  unappliedPaymentIdentity(index: number, item: UnappliedBulkInsurancePayment) {
    return item.PaymentGatewayTransactionId;
  }

  applyUnappliedBulkInsurancePayment(payment: UnappliedBulkInsurancePayment) {
    // only call prior to loading an unapplied payment to clear distribution and any entered payment info
    this.clearPaymentAndDistribution();

    let carrierId: string = null;
    let isPayerIdSearch = false;
    if (payment && payment.CarrierId) {
      const carrier = this.carriers.find(
        x => x.CarrierId === payment.CarrierId
      );
      if (carrier) carrierId = carrier.CarrierId;
    } else if (payment && payment.PayerId && payment.PayerId.length === 5) {
      const carrier = this.carriers.find(x => x.PayerId === payment.PayerId);
      isPayerIdSearch = true;
      if (carrier) carrierId = carrier.CarrierId;
    }

    if (!carrierId) {
      this.toastrFactory.error(
        `Unable to find the ${
          isPayerIdSearch ? 'Payer ID' : 'Carrier'
        } for the unapplied payment.`
      );
    } else {
      this.selectedUnappliedBulkInsurancePayment = payment;
      this.filter.PaymentGatewayTransactionId =
        payment.PaymentGatewayTransactionId;

      this.selectCarrier(carrierId, isPayerIdSearch);
      this.disableCarrier = true;
      this.applyUnappliedPaymentPaymentType(payment);
      this.filter.Amount = payment.Amount;

      this.applyUnappliedPaymentLocation(payment);

      this.triggerOverlayClose.next();
    }
  }

  authAccessByType = (authtype: string) => {
    const result = this.patSecurityService.IsAuthorizedByAbbreviation(authtype);
    return result;
  };

  checkForValidClaimPayments = () => {
    this.hasValidClaimPayments = this.insurancePayments.some(
      claimPayment =>
        claimPayment.PaymentAmount > 0 || claimPayment.FinalPayment === true
    );
  };

  serviceAllowedAmountBlurChange = (event: ClaimPaymentAmountBlurEvent) => {
    this.hasEditedAllowedAmounts = true;
    this.validateAllowedAmounts();
    // If any of the allowed amounts are invalid, we do not want to proceed with the re-estimation
    if (this.invalidAllowedAmounts)     
      return;       
    if (event.claim) {
      // set the waitingOnValidation flag to true to disable the apply button
      // while the re-estimation is being processed
      this.waitingOnValidation = true;
      const claim = event.claim;      
      // get a list of all services including the Overridden AllowedAmount
      let overriddenServices: AllowedAmountOverrideDto[] = [];
      claim.ServiceTransactionToClaimPaymentDtos.forEach(service => {
        overriddenServices.push({
          ServiceTransactionId: service.ServiceTransactionId,
          EstimatedInsuranceId: service.EstimatedInsuranceId,
          AllowedAmount: service.AllowedAmount,
        }); 
      });
      // send the allowedAmounts on this claim to be re-estimated based on the 'new' allowed amount  
      this.bulkPaymentService.reEstimateClaimServices({claimId: claim.ClaimId, allowedAmounts: overriddenServices})
        .subscribe({
          next: (estimates) => {
            // store the estimates for apply
            this.loadUpdatedEstimates(estimates);
            // reset the amounts on this claim based on new estimates
            this.updateClaimWithEstimates(claim, estimates);
          },
          error: (err) => {
            this.waitingOnValidation = false;
            this.toastrFactory.error('Failed to re-estimate claim services.  Please contact support.', 'Error');
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
      const existingIndex = this.filter.UpdatedEstimates.findIndex(
          estimate => estimate.EstimatedInsuranceId === newEstimate.EstimatedInsuranceId
      );
      // Add estimates to insurancePaymentDto.UpdatedEstimates list
      // If an existing estimate is found, replace it with the new one
      // If not found, add the new estimate to the list   
      if (existingIndex !== -1) {
        this.filter.UpdatedEstimates[existingIndex] = newEstimate;
      } else {
        this.filter.UpdatedEstimates.push(newEstimate);
      }
    });
  }

  updateClaimWithEstimates(claimPaymentDto: ClaimDto, estimates: SoarResponse<InsuranceEstimateDto[]>) {
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
        service.AdjustedEstimate = (insAdjEst - adjPaidAmount) < 0 ? 0 : (insAdjEst - adjPaidAmount);
        service.OriginalInsuranceEstimate = insEstAmt;
      }      
    });    
    this.recalculateClaimEstimateTotals(claimPaymentDto);
    this.insurancePaymentIsValid = this.insurancePaymentIsValidPipe.transform(this.insurancePayments, this.canEditAllowedAmount);
  
    this.triggerRefreshEmitter.next();
  }

  // recalculate the accumulated values for the claim
  recalculateClaimEstimateTotals(claimPaymentDto: ClaimDto) {    
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

  // reset the updated estimates
  resetAllowedAmounts() {
    this.hasEditedAllowedAmounts = false;
    this.filter.UpdatedEstimates = [];
    this.filterCopy.UpdatedEstimates = [];
     // map lookup of original estimates
    const originalEstimatesMap = new Map(
      this.originalEstimates.map(estimate => [estimate.ServiceTransactionId, estimate])
    );
    // replace modified estimate columns with original amounts 
    this.insurancePayments.forEach(claim => {
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
      this.triggerRefreshEmitter.next();
    });        
  };
 
  isApplyButtonDisabled() {
    return this.unappliedAmount < -0.009999 || 
      this.unappliedAmount > 0.009999  || 
      !this.insurancePaymentIsValid || 
      !this.filter.InsurancePaymentTypeId || 
      this.showNoClaimsMessage || 
      this.hasEraInitialDistributionError || 
      this.disableApplyButton || 
      this.invalidAllowedAmounts ||
      this.waitingOnValidation     
  }

  validateAllowedAmounts() {
    this.invalidAllowedAmounts = false;
    this.insurancePayments.forEach(claim => {
      claim.ServiceTransactionToClaimPaymentDtos.forEach(service => {
        if (service.AllowedAmount < 0 || service.AllowedAmount > service.Charges) {
          this.invalidAllowedAmounts = true;
        }
      });
    });
  }

  addDocument = () => {
    //logic to loop through patients with payment amounts or final payment checked
    this.insurancePayments.forEach(claimPayment => {
      if (
        claimPayment.PaymentAmount > 0 ||
        claimPayment.FinalPayment === true
      ) {
        this.patientListForFileUpload.push(claimPayment.PatientId);
      }
    });
    //this is a placeholder until it is determined how we want the uploader to handle multiple patients
    this.patientListForFileUploadFirstPatient =
      this.patientListForFileUpload[0];

    this.overlayRef = this.overlay.create({
      positionStrategy: this.overlay
        .position()
        .global()
        .centerVertically()
        .centerHorizontally(),
      scrollStrategy: this.overlay.scrollStrategies.reposition(),
      hasBackdrop: true,
    });
    const patientDocumentPortal = new TemplatePortal(
      this.templateRef,
      this.viewContainerRef
    );
    this.overlayRef.attach(patientDocumentPortal);
    this.overlayRef.backdropClick().subscribe(() => {
      this.closeModal();
    });
    this.overlayRef.detachments().subscribe(() => {
      this.closeModal();
    });
  };

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
      this.insurancePayments = [];
      this.confirmRedirect();
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
          case 'close':
            this.feeScheduleUpdateModalRef.close();
            this.insurancePayments=[];
            this.confirmRedirect();            
            break;
        }
      });
    
  }


  closeModal = () => {
    if (this.overlayRef) {
      this.overlayRef.dispose();
      this.overlayRef = undefined;
    }
  };

  onUploadSuccess = (event: any) => {
    //this.getDocumentsforPatient();
    this.closeModal();
  };
  onUploadCancel = (event: any) => {
    this.closeModal();
  };
}
