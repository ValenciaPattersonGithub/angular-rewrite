import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ConfirmationModalService } from 'src/@shared/components/confirmation-modal/confirmation-modal.service';
import { WaitOverlayService } from 'src/@shared/components/wait-overlay/wait-overlay.service';
import { FormsModule } from '@angular/forms';
import { ApplyInsurancePaymentComponent } from './apply-insurance-payment.component';
import { TranslateModule } from '@ngx-translate/core';
import { FeatureFlagService } from 'src/featureflag/featureflag.service';
import { Observable, of } from 'rxjs';
import { PaymentTypesService } from 'src/@shared/providers/payment-types.service';
import moment from 'moment';
import { ApplyInsurancePaymentIsValidPipe } from 'src/@shared/pipes/applyInsurancePaymentIsValid/apply-insurance-payment-is-valid.pipe';
import { RemainingAmountToDistributePipe } from 'src/@shared/pipes/remainingAmountToDistribute/remaining-amount-to-distribute.pipe';
import * as cloneDeep from 'lodash/cloneDeep';
import { LocationDto } from 'src/@core/models/location/location-dto.model';
import { PaymentProvider } from 'src/@shared/enum/accounting/payment-provider';
import { DomSanitizer } from '@angular/platform-browser';
import { SoarBulkPaymentHttpService } from 'src/@core/http-services/soar-bulk-payment-http.service';
import { InsuranceEstimateDto } from 'src/accounting/encounter/models/patient-encounter.model';
import { SoarResponse } from 'src/@core/models/core/soar-response';
import { FeeScheduleUpdateModalRef, FeeScheduleUpdateModalService } from 'src/insurance/fee-schedule/fee-schedule-update-on-payment/fee-schedule-update-modal.service';
import { UpdatedAllowedAmountDto } from 'src/insurance/fee-schedule/fee-schedule-dtos';

describe('ApplyInsurancePaymentComponent', () => {
  let component: ApplyInsurancePaymentComponent;
  let fixture: ComponentFixture<ApplyInsurancePaymentComponent>;
  let mockReferenceDataService;
  let $locationMock;
  let routeParams;
  let mockPatientInsurancePaymentFactory;
  let mockPersonFactory;
  let res;
  let personResult;
  let mockPatientValidationFactory;
  let patientLocationAuthorization;
  let mockGlobalSearchFactory;
  let mockTabLauncher;
  let mockUserServices;
  let mockModalFactory;
  let mockToastrFactory;
  let mockLocalizeService;
  let mockFeatureFlagService;
  let mockPaymentTypesService;
  let mockSoarBulkPaymentHttpService;
  let paymentTypes;
  let mockLocationService;
  let mockPatSecurityService;
  let mockPatientServices;
  let mockTimeZoneFactory;
  let mockBusinessCenterServices;
  let mockConfirmationModalService;
  let mockApplyInsurancePaymentIsValidPipe;
  let mockRemainingAmountToDistributePipe;
  let mockClaims;
  let mockWaitOverlayService;
  let mockPaymentGatewayService;
  let sanitizerSpy: jasmine.SpyObj<DomSanitizer>;
  let mockFeeScheduleUpdateModalService;
  const mockDialogRef = {
      events: {
          pipe: jasmine.createSpy().and.returnValue({ subscribe: jasmine.createSpy() }),          
      },
      subscribe: jasmine.createSpy(),
      unsubscribe: jasmine.createSpy(),
      _subscriptions: jasmine.createSpy(),
      _parentOrParents: jasmine.createSpy(),
      closed: jasmine.createSpy(),
  };  
  beforeEach(() => {
    res = { Value: [] };
    personResult = { Value: { Profile: { PersonId: 1 } } };

    const mockClaimsService = {
      getClaimById: {
        get: jasmine.createSpy().and.returnValue({
          $promise: {
            then() {
              return {};
            },
          },
        }),
      },
    };

    mockFeeScheduleUpdateModalService = {
        open: jasmine.createSpy().and.returnValue( {
             events: { type:'confirm' ,next: jasmine.createSpy(), subscribe: jasmine.createSpy(), },
        })         
    } 

    mockReferenceDataService = {
      getData: function () {
        return Promise.resolve([{ LocationId: 12 }]);
      },
      entityNames: {
        locations: [],
      },
    };

    $locationMock = {
      url: jasmine.createSpy('$location.url'),
      search: jasmine.createSpy('$location.search'),
    };

    mockSoarBulkPaymentHttpService = {
      reEstimateClaimServices: jasmine.createSpy('SoarBulkPaymentHttpService.reEstimateClaimServices').and.returnValue(
        of({
          Value: []
        })),
    }

    routeParams = {
      EraId: null,
    };

    mockClaims = [
      {
        ClaimEntityId: '12345',
        ClaimId: '12345',
        LocationId: 123,
        AccountMemberId: '12587',
        PatientId: '14785',
        PatientName: 'Norman Bates',
        AccountId: '25874',
        ProviderId: '12587',
        ProviderName: '25874',
        CarrierId: '25412',
        BenefitPlanId: '52874',
        CarrierName: '12548',
        PrimaryClaim: false,
        Type: 25,
        MinServiceDate: new Date(),
        MaxServiceDate: new Date(),
        DisplayDate: '2021-07-01',
        ServiceTransactionToClaimPaymentDtos: [{
          ServiceTransactionToClaimId: '',
          ServiceTransactionId: '',
          ClaimId: '',
          DateEntered: '',
          Description: '', 
          ProviderUserId: '',
          EncounterId: '',
          AccountMemberId: '',
          PatientName: '',
          ProviderName: '',
          Charges: 0,
          Balance: 0,
          TotalInsurancePayments: 0,
          PaymentAmount: 0,
          Tooth: '',
          Surface: '',
          Roots: '',
          InsuranceOrder: 0,
          DateServiceCompleted: '',
          EstimatedInsuranceId: '',
          DataTag: '',
          UserModified: '',
          DateModified: '',
          AllowedAmount: 0,
          OriginalAllowedAmount: 0,
          FeeScheduleId: '',
          FeeScheduleGroupId: '',
          FeeScheduleGroupDetailId: '',
          ServiceCodeId: '',
          InsuranceEstimate: 0,
          AdjustedEstimate: 0,
          OriginalInsuranceEstimate: 0,
          PaidInsuranceEstimate: 0,
          AllowedAmountOverride: null
        }],
        ApplyInsurancePaymentBackToPatientBenefit: false,
        RecreateClaim: false,
        Status: 12,
        IsReceived: false,
        TotalCharges: 0,
        TotalEstimatedInsurance: 0,
        TotalEstInsuranceAdj: 0,
        TotalPatientBalance: 0,
        PaymentAmount: 0,
        FinalPayment: false,
        AllowedAmount: 0,
        ClaimEntityDataTag: 'string',
        DataTag: 'string',
        UserModified: 'string',
        DateModified: new Date(),
        InsuranceEstimate: 0,
        Charges: 0,
        AdjustedEstimate: 0,
        Balance: 0,
      },
    ];

    const mockInsuranceEstimateDtos = [
      {
        EstimatedInsuranceId: '12345', 
        AccountMemberId: '12345', 
        EncounterId: '12345',
        ServiceTransactionId: '12345',
        ServiceCodeId: '12345',
        PatientBenefitPlanId: '12345',  
        Fee: 0,
        EstInsurance: 0,
        // IsUserOverRidden: boolean = false,
        // FamilyDeductibleUsed: number = 0,
        // IndividualDeductibleUsed: number = 0,
        // CalculationDescription: string = '',  
        // CalcWithoutClaim: boolean = false,
        // PaidAmount: number = 0,
        // ObjectState: string = '',  
        // FailedMessage: string = '',  
        // AdjEst: number = 0,
        // AdjPaid: number = 0,
        // AreBenefitsApplied: boolean = false,
        // IsMostRecentOverride: boolean = false,
        // AllowedAmountOverride?: number = null,
        // AllowedAmount?: number = null,
        // DataTag: string = '',  
        DateModified: new Date(),
        //UserModified: string = undefined,  
      },
    ]

    mockPatientInsurancePaymentFactory = {
      applyInsurancePayments: jasmine
        .createSpy('PatientInsurancePaymentFactory.applyInsurancePayments')
        .and.returnValue({
          $promise: {
            then(callback) {
              callback(res);
            },
          },
        }),
      distributeAmountToServices: jasmine
        .createSpy('PatientInsurancePaymentFactory.distributeAmountToServices')
        .and.returnValue({
          $promise: {
            then(callback) {
              callback(res);
            },
          },
        }),
      getSelectedClaims: jasmine.createSpy('PatientInsurancePaymentFactory.getSelectedClaims').and.returnValue([]),
      applyInsurancePayment: jasmine.createSpy().and.returnValue({
        then: function () {},
      }),

      completeInsurancePaymentTransaction: jasmine
      .createSpy('PatientInsurancePaymentFactory.completeInsurancePaymentTransaction')
      .and.returnValue({
        $promise: {
          then(callback) {
            callback(res);
          },
        },
      }),
    };

    mockPersonFactory = {
      getById: jasmine.createSpy('PersonFactory.getById').and.returnValue({
        then: function (callback) {
          callback(personResult);
        },
      }),
    };

    patientLocationAuthorization = {
      authorization: { UserIsAuthorizedToAtLeastOnePatientLocation: false },
    };

    mockPatientValidationFactory = {
      PatientSearchValidation: jasmine.createSpy('PatientValidationFactory.PatientSearchValidation').and.returnValue({
        then(callback) {
          callback(patientLocationAuthorization);
        },
      }),
      LaunchPatientLocationErrorModal: jasmine
        .createSpy('PatientValidationFactory.LaunchPatientLocationErrorModal')
        .and.returnValue({
          then(callback) {
            callback(res);
          },
        }),
    };

    mockGlobalSearchFactory = {
      SaveMostRecentPerson: jasmine.createSpy('GlobalSearchFactory.SaveMostRecentPerson').and.returnValue({
        $promise: {
          then(callback) {
            callback(res);
          },
        },
      }),
    };

    mockUserServices = {
      Users: {
        get: jasmine.createSpy().and.returnValue({
          $promise: {
            then(callback) {
              callback(res);
            },
          },
        }),
      },
    };

    mockModalFactory = {
      CardServiceDisabledModal: jasmine.createSpy('ModalFactory.CardServiceDisabledModal').and.returnValue({
        then(callback) {
          callback(res);
        },
      }),
      LoadingModal: jasmine.createSpy('ModalFactory.LoadingModal').and.returnValue({
        then(callback) {
          callback(res);
        },
      }),

      DecisionModal: jasmine.createSpy('ModalFactory.DecisionModal').and.returnValue({
        then(callback) {
          callback(res);
        },
      }),
    };

    mockToastrFactory = {
      error: jasmine.createSpy(),
      success: jasmine.createSpy(),
    };

    mockLocalizeService = {
      getLocalizedString: () => 'translated text',
    };

    mockFeatureFlagService = {
      getOnce$: jasmine.createSpy('FeatureFlagService.getOnce$').and.returnValue(of(true)),
    };

    paymentTypes = {
      Value: [
        { CurrencyTypeId: 1, PaymentTypeId: 11 },
        { CurrencyTypeId: 2, PaymentTypeId: 21 },
      ],
    };

    mockPaymentTypesService = {
      getAllPaymentTypesMinimal: () => {
        return {
          then: res => {
            res({ Value: paymentTypes.Value });
          },
        };
      },
    };

    mockLocationService = {
      getCurrentLocation: jasmine.createSpy('LocationService.getCurrentLocation').and.returnValue({ id: 3 }),
      path: jasmine.createSpy('path').and.returnValue('/somePath'),
    };

    mockPatSecurityService = {
      IsAuthorizedByAbbreviation: jasmine
        .createSpy('patSecurityService.IsAuthorizedByAbbreviation')
        .and.returnValue(true),
    };

    mockPatientServices = {
      PatientLocations: {
        get: jasmine.createSpy().and.callFake(array => {
          return {
            then(callback) {
              callback(array);
            },
          };
        }),
      },
      CreditTransactions: {
        payPageRequest: jasmine.createSpy().and.callFake(() => {
          return {
            $promise: {
              then: (res, error) => {
                res({
                  Value: {
                    PaymentGatewayTransactionId: 4713,
                    PaypageUrl: 'https://web.test.paygateway.com/paypage/v1/sales/123',
                  },
                });
              },
            },
          };
        }),
      },


    };


    mockTimeZoneFactory = {
      ConvertDateToMomentTZ: jasmine.createSpy('mockTimeZoneFactory.ConvertDateToMomentTZ').and.callFake(date => {
        return moment(date);
      }),
    };

    mockBusinessCenterServices = {
      Carrier: {
        get: jasmine.createSpy().and.returnValue({
          $promise: {
            then(callback) {
              callback(res);
            },
          },
        }),
      },
    };

    mockTabLauncher = {
      launchNewTab: jasmine.createSpy(),
    };

    mockConfirmationModalService = {
      open: jasmine.createSpy('open').and.returnValue({
        events: new Observable(observer => {
          observer.next({ type: 'confirm' });

          observer.complete();
        }),
        close: jasmine.createSpy('close'),
      }),
    };
    mockApplyInsurancePaymentIsValidPipe = new ApplyInsurancePaymentIsValidPipe();
    mockRemainingAmountToDistributePipe = new RemainingAmountToDistributePipe();

    mockWaitOverlayService = jasmine.createSpyObj<WaitOverlayService>('mockWaitOverlayService', ['open']);

    mockPaymentGatewayService = {

      createPaymentProviderCreditOrDebitPayment: jasmine.createSpy().and.callFake(() => {
              return {
                  $promise: {
                      then: (res, error) => {
                          res({ Value: { PaymentGatewayTransactionId: 4713} });
                      },
              },
          };
      }),
       completeCreditTransaction: jasmine.createSpy()
  };
  sanitizerSpy = jasmine.createSpyObj('DomSanitizer', ['bypassSecurityTrustResourceUrl']);

    TestBed.configureTestingModule({
      imports: [FormsModule, TranslateModule.forRoot()],
      schemas: [NO_ERRORS_SCHEMA],
      declarations: [ApplyInsurancePaymentComponent],
      providers: [
        { provide: '$routeParams', useValue: routeParams },
        { provide: '$location', useValue: $locationMock },
        { provide: 'PatientInsurancePaymentFactory', useValue: mockPatientInsurancePaymentFactory },
        { provide: 'PersonFactory', useValue: mockPersonFactory },
        { provide: 'PatientValidationFactory', useValue: mockPatientValidationFactory },
        { provide: 'GlobalSearchFactory', useValue: mockGlobalSearchFactory },
        { provide: 'tabLauncher', useValue: mockTabLauncher },
        { provide: 'UserServices', useValue: mockUserServices },
        { provide: 'ModalFactory', useValue: mockModalFactory },
        { provide: 'toastrFactory', useValue: mockToastrFactory },
        { provide: 'localize', useValue: mockLocalizeService },
        { provide: 'referenceDataService', useValue: mockReferenceDataService },
        { provide: 'locationService', useValue: mockLocationService },
        { provide: 'patSecurityService', useValue: mockPatSecurityService },
        { provide: 'PatientServices', useValue: mockPatientServices },
        { provide: 'TimeZoneFactory', useValue: mockTimeZoneFactory },
        { provide: 'BusinessCenterServices', useValue: mockBusinessCenterServices },
        { provide: ConfirmationModalService, useValue: mockConfirmationModalService },
        { provide: RemainingAmountToDistributePipe, useValue: mockRemainingAmountToDistributePipe },
        { provide: ApplyInsurancePaymentIsValidPipe, useValue: mockApplyInsurancePaymentIsValidPipe },
        { provide: WaitOverlayService, useValue: mockWaitOverlayService },
        { provide: FeatureFlagService, useValue: mockFeatureFlagService },
        { provide: PaymentTypesService, useValue: mockPaymentTypesService },
        { provide: SoarBulkPaymentHttpService, useValue: mockSoarBulkPaymentHttpService },
        { provide: 'ClaimsService', useValue: mockClaimsService },
        { provide: 'PaymentGatewayService', useValue: mockPaymentGatewayService},
        { provide: DomSanitizer, useValue: sanitizerSpy },
        { provide: FeeScheduleUpdateModalRef, useValue: mockDialogRef },
         { provide: FeeScheduleUpdateModalService, useValue: mockFeeScheduleUpdateModalService },
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ApplyInsurancePaymentComponent);
    component = fixture.componentInstance;

    // person is passed as param to the component
    component.person = {
      PatientId: '123456',
      Flags: [],
      MedicalHistoryAlerts: [],
      ReferredPatients: [],
      Profile: {
        PatientId: '123456',
        FirstName: 'string',
        MiddleName: 'string',
        LastName: 'string',
        PreferredName: 'string',
        Prefix: null,
        Suffix: 'string',
        AddressReferrerId: null,
        AddressReferrer: null,
        AddressLine1: 'string',
        AddressLine2: 'string',
        City: 'string',
        State: 'string',
        ZipCode: 'string',
        Sex: 'string',
        DateOfBirth: 'string',
        IsPatient: false,
        PatientSince: 'string',
        PatientCode: 'string',
        EmailAddress: null,
        EmailAddressRemindersOk: false,
        EmailAddress2: null,
        EmailAddress2RemindersOk: false,
        ThirdPartyPatientId: null,
        PersonAccount: {},
        ResponsiblePersonType: 1,
        ResponsiblePersonId: null,
        ResponsiblePersonName: null,
        IsResponsiblePersonEditable: false,
        PreferredLocation: 123,
        PreferredDentist: 'string',
        PreferredHygienist: null,
        IsActive: false,
        IsSignatureOnFile: false,
        EmailAddresses: [],
        DirectoryAllocationId: 'string',
        MailAddressRemindersOK: false,
        PatientLocations: [],
        IsRxRegistered: false,
        HeightFeet: null,
        HeightInches: null,
        Weight: 'string',
        DataTag: 'string',
        UserModified: 'string',
        DateModified: 'string',
      },
      BenefitPlans: [],
      PreventiveServicesDue: [],
      PhoneNumbers: [],
      Emails: [],
      PatientLocations: [],
    };
    fixture.detectChanges();
  });

  it('can load instance', () => {
    expect(component).toBeTruthy();
  });

  describe('getCardTransactionOverlay', () => {
    it('makes expected calls getCardTransactionOverlay', () => {
      component.getCardTransactionOverlay();
      expect(mockWaitOverlayService.open).toHaveBeenCalled();
    });
  });

  describe('selectedPaymentTypeWatcher', () => {
    let paymentType;
    beforeEach(() => {});
    it('should update properties when paymentType is not null or undefined', () => {
      // Arrange
      paymentType = {
        PaymentTypeId: '123456',
        Prompt: 'Some prompt',
      };
      // Act
      component.selectedPaymentTypeWatcher(paymentType);

      // Assert
      expect(component.selectedPaymentType).toBeDefined();
      expect(component.insurancePaymentDto.InsurancePaymentTypeId).toEqual(paymentType.PaymentTypeId);
      expect(component.paymentPrompt).toEqual(paymentType.Prompt);
    });

    it('should reset properties when paymentType is null or undefined', () => {
      paymentType = {
        PaymentTypeId: undefined,
        Prompt: undefined,
      };
      const initialSelectedPaymentType = component.selectedPaymentType;
      const initialSelectedPaymentTypeId = paymentType.PaymentTypeId;
      const initialInsurancePaymentTypeId = component.insurancePaymentDto.InsurancePaymentTypeId;
      const initialPaymentPrompt = component.paymentPrompt;

      component.selectedPaymentTypeWatcher(null);

      expect(component.selectedPaymentType).toEqual(initialSelectedPaymentType);
      expect(component.insurancePaymentDto.InsurancePaymentTypeId).toEqual(initialInsurancePaymentTypeId);
      expect(component.paymentPrompt).toEqual(initialPaymentPrompt);
    });

    it('should call checkFilterChanges after updating properties', () => {
      const checkFilterChangesSpy = spyOn(component, 'checkFilterChanges');
      const paymentType = {
        PaymentTypeId: 1,
        Prompt: 'Some prompt',
      };

      component.selectedPaymentTypeWatcher(paymentType);

      expect(checkFilterChangesSpy).toHaveBeenCalled();
    });
  });

  describe('applyTransactionFailure', () => {
    let error = {data: { InvalidProperties: [] }};
    beforeEach(() => {  
      error = {data: { InvalidProperties: [] }};
    })
    it('should display a DecisionModal when error data does not contain InvalidProperties for ClaimId', () => {
      error.data.InvalidProperties = [{PropertyName: 'ClaimId'}];
      component.applyTransactionFailure(error);
      expect(mockToastrFactory.error).toHaveBeenCalled();
      expect(mockModalFactory.DecisionModal).toHaveBeenCalled();
    });
    it('should display generic error message when error data does not contain InvalidProperties for ClaimId', () => {    
      component.applyTransactionFailure(error);
      expect(mockToastrFactory.error).toHaveBeenCalledWith('An error has occurred while applying payment', 'Error');
    });
  })

  it('should set activeUrlTab and emit activeUrlPath event with the provided url', () => {
    const url = { TemplateUrl: 'some-url' };
    const emitSpy = jasmine.createSpyObj('emit', ['emit']);

    component.activeUrl(url);

    expect(component.activeUrlTab).toBeDefined();
    expect(emitSpy.emit).not.toHaveBeenCalled();
  });

  describe('processPaymentChange', () => {
    it('should update filter amount and check for filter changes', () => {
      const event = { NewValue: 100 };
      spyOn(component, 'checkFilterChanges');

      component.processPaymentChange(event, {});

      expect(component.insurancePaymentDto.Amount).toEqual(event.NewValue);
      expect(component.checkFilterChanges).toHaveBeenCalled();
    });

    it('should process unapplied amount', () => {
      spyOn(component, 'processUnappliedAmount');

      component.processPaymentChange({ NewValue: 100 }, {});

      expect(component.processUnappliedAmount).toHaveBeenCalled();
    });
  });

  describe('getInsurancePaymentTypesSuccess', () => {
    it('should sort insurance payment types when response is not null', () => {
      const mockResponse = {
        Value: [{ Description: 'B' }, { Description: 'C' }, { Description: 'A' }],
      };

      component.getInsurancePaymentTypesSuccess(mockResponse);

      expect(component.insurancePaymentTypes.length).toEqual(3);
      expect(component.insurancePaymentTypes[0].Description).toEqual('A');
      expect(component.insurancePaymentTypes[1].Description).toEqual('B');
      expect(component.insurancePaymentTypes[2].Description).toEqual('C');
    });

    it('should set insurance payment types to an empty array when response is null', () => {
      component.getInsurancePaymentTypesSuccess(null);

      expect(component.insurancePaymentTypes.length).toEqual(0); // Ensure array length is 0
    });
  });

  describe('validateInsurancePayment', () => {
    beforeEach(() => {
      component.claims = cloneDeep(mockClaims);
      component.editMode = false;
      mockFeatureFlagService.getOnce$.and.returnValue(of(false));
    });

    it('should return true if all required fields are valid', () => {
      mockFeatureFlagService.getOnce$.and.returnValue(of(false));
      component.insurancePaymentDto.DateEntered = new Date();
      component.claims[0].FinalPayment = false;
      component.editMode = true;
      component.claims[0].ServiceTransactionToClaimPaymentDtos[0].Charges = 75.00;
      component.claims[0].ServiceTransactionToClaimPaymentDtos[0].AllowedAmount = null;
      component.claims[0].ServiceTransactionToClaimPaymentDtos[0].TotalInsurancePayments = 20; 
      component.claims[0].ServiceTransactionToClaimPaymentDtos[0].PaymentAmount = 56;
      component.insurancePaymentDto.InsurancePaymentTypeId = '1';
      component.claims[0].ServiceTransactionToClaimPaymentDtos[0].PaymentAmount = 50;
      expect(component.validateInsurancePayment()).toBe(true);
    });
    it('should return false if DateEntered is invalid', () => {
      component.insurancePaymentDto.DateEntered = null;

      expect(component.validateInsurancePayment()).toBeFalsy();
    });

    it('should return false if Amount is invalid', () => {
      component.insurancePaymentDto.Amount = -1;

      expect(component.validateInsurancePayment()).toBeFalsy();
    });

    it('should return false if InsurancePaymentTypeId is not set', () => {
      component.insurancePaymentDto.InsurancePaymentTypeId = null;

      expect(component.validateInsurancePayment()).toBeFalsy();
    });

    it('should return false if any service has a payment amount that is greater than the charges minus the TotalInsurancePayments (if FF is false)', () => {
      mockFeatureFlagService.getOnce$.and.returnValue(of(false));
      component.claims[0].ServiceTransactionToClaimPaymentDtos[0].Charges = 75.00;
      component.claims[0].ServiceTransactionToClaimPaymentDtos[0].AllowedAmount = 60;
      component.claims[0].ServiceTransactionToClaimPaymentDtos[0].TotalInsurancePayments = 20; 
      component.claims[0].ServiceTransactionToClaimPaymentDtos[0].PaymentAmount = 56;
      expect(component.validateInsurancePayment()).toBe(false)
    });

    it('should return false if any service has a payment amount that is greater than the Charges minus the TotalInsurancePayments (if FF is true) and no AllowedAmount', () => {
      mockFeatureFlagService.getOnce$.and.returnValue(of(true));
      component.claims[0].ServiceTransactionToClaimPaymentDtos[0].Charges = 75.00;
      component.claims[0].ServiceTransactionToClaimPaymentDtos[0].AllowedAmount = null;
      component.claims[0].ServiceTransactionToClaimPaymentDtos[0].TotalInsurancePayments = 20; 
      component.claims[0].ServiceTransactionToClaimPaymentDtos[0].PaymentAmount = 56;      
      expect(component.validateInsurancePayment()).toBe(false)
    });

    it('should return false if any service has a payment amount that is greater than the AllowedAmount minus the TotalInsurancePayments (if FF is true) and has AllowedAmount', () => {
      mockFeatureFlagService.getOnce$.and.returnValue(of(true));
      component.claims[0].ServiceTransactionToClaimPaymentDtos[0].Charges = 75.00;
      component.claims[0].ServiceTransactionToClaimPaymentDtos[0].AllowedAmount = 60;
      component.claims[0].ServiceTransactionToClaimPaymentDtos[0].TotalInsurancePayments = 20; 
      component.claims[0].ServiceTransactionToClaimPaymentDtos[0].PaymentAmount = 41;     
      expect(component.validateInsurancePayment()).toBe(false)
    });
  });

  describe('applyTransactionWithCCPaymentFailure', () => {
    let promptOpenEdgeCreditTransactionUpdateFailedSpy;

    beforeEach(() => {
      promptOpenEdgeCreditTransactionUpdateFailedSpy = spyOn(component, 'promptOpenEdgeCreditTransactionUpdateFailed');
      spyOn(component, 'removeWaitOverlay');
    });

    it('should call removeWaitOverlay', () => {
      const error = { error: {} };
      component.applyTransactionWithCCPaymentFailure(error);
      expect(component.removeWaitOverlay).toHaveBeenCalled();
    });

    it('should prompt for credit transaction update if there is a creditTransaction error', () => {
      const error = { error: { InvalidProperties: [] } };
      component.applyTransactionWithCCPaymentFailure(error);
      expect(promptOpenEdgeCreditTransactionUpdateFailedSpy).toHaveBeenCalled();
    });
  });

  describe('distributePaymentAmount', () => {
    let claims;
    let amount;

    beforeEach(() => {
      claims = cloneDeep(mockClaims);
    });

    it('should set distributedDetailsLoading to true if if amount is not more than remaining balance', () => {
      component.remainingBalance = 101;
      amount = 100;
      component.distributePaymentAmount(amount, claims);
      expect(component.distributedDetailsLoading).toBe(true);
    });

    it('should call this.patientInsurancePaymentFactory.distributeAmountToServices if amount is not more than remaining balance', () => {
      amount = 100;
      component.remainingBalance = 101;
      component.distributePaymentAmount(amount, claims);
      expect(mockPatientInsurancePaymentFactory.distributeAmountToServices).toHaveBeenCalled();
      expect(component.distributedDetailsLoading).toBeTruthy();
    });

    it('should not call this.patientInsurancePaymentFactory.distributeAmountToServices if amount is not more than remaining balance or claims is empty', () => {
      amount = 102;
      claims = null;
      component.remainingBalance = 101;
      component.distributePaymentAmount(amount, claims);
      expect(mockPatientInsurancePaymentFactory.distributeAmountToServices).not.toHaveBeenCalled();
    });
  });

  describe('distributePaymentAmountSuccess', () => {
    beforeEach(() => {
      spyOn(mockApplyInsurancePaymentIsValidPipe, 'transform').and.returnValue(true);
      -spyOn(mockRemainingAmountToDistributePipe, 'transform').and.returnValue(0);
    });

    it('should set distributedDetailsLoading to false', () => {
      component.distributePaymentAmountSuccess();
      expect(component.distributedDetailsLoading).toBeFalsy();
    });

    it('should set insurancePaymentIsValid based on the transform method of insurancePaymentIsValidPipe', () => {
      component.distributePaymentAmountSuccess();
      expect(component.insurancePaymentIsValid).toBeDefined();
    });

    it('should set distributedDetailsLoading to false and calculate insurancePaymentIsValid and unappliedAmount', () => {
      component.distributePaymentAmountSuccess();
      expect(component.distributedDetailsLoading).toBe(false);
      expect(component.insurancePaymentIsValid).toBeDefined();
      expect(component.unappliedAmount).toBeDefined();
    });
  });

  describe('serviceAmountBlurEvent', () => {
    let event;

    beforeEach(() => {
      component.claims = cloneDeep(mockClaims);
      event = {
        claim: {
          ServiceTransactionToClaimPaymentDtos: [
            { PaymentAmount: 50, Charges: 100, TotalInsurancePayments: 20 },
            { PaymentAmount: 30, Charges: 80, TotalInsurancePayments: 50 },
          ],
        },
        service: {},
      };
      event.service = event.claim.ServiceTransactionToClaimPaymentDtos[0];
    });

    it('should calculate the total PaymentAmount for the claim', () => {
      component.serviceAmountBlurEvent(event);
      expect(event.claim.PaymentAmount).toEqual(80);
    });

    it('should determine if the service has an error based on Charges and TotalInsurancePayments', () => {
      component.serviceAmountBlurEvent(event);
      expect(event.service.$$hasError).toBeFalsy();
    });

    it('should update the claim $$servicesHaveErrors property based on services with errors', () => {
      component.serviceAmountBlurEvent(event);
      expect(event.claim.$$servicesHaveErrors).toBeFalsy();
    });
  });

  describe('navToPatientProfile', () => {
    let mockPersonId, mockPatientInfo, mockAuthorization;

    beforeEach(() => {
      mockPersonId = '12345';
      mockPatientInfo = {};
      mockAuthorization = { UserIsAuthorizedToAtLeastOnePatientLocation: true };
    });

    it('should launch an error modal if the user is not authorized to any patient location', async () => {
      mockAuthorization.UserIsAuthorizedToAtLeastOnePatientLocation = false;
      mockPatientInfo.authorization = mockAuthorization;
      await component.navToPatientProfile(mockPersonId);
    });

    it('should save the most recent person and launch a new tab with the patient summary if the user is authorized', async () => {
      mockAuthorization.UserIsAuthorizedToAtLeastOnePatientLocation = true;
      mockPatientInfo.authorization = mockAuthorization;
      mockPersonFactory.getById.and.returnValue(Promise.resolve({ Value: mockPatientInfo }));
      mockPatientValidationFactory.PatientSearchValidation.and.returnValue(Promise.resolve(mockPatientInfo));

      await component.navToPatientProfile(mockPersonId);

      expect(mockGlobalSearchFactory.SaveMostRecentPerson).not.toHaveBeenCalledWith(mockPersonId);
      // expect($location.search).toHaveBeenCalledWith('newTab', null);
      expect(mockTabLauncher.launchNewTab).not.toHaveBeenCalledWith('#/Patient/12345/Summary/?tab=Account%20Summary');
    });
  });

  describe('getClaimsSuccess', () => {
    it('should filter and set claims correctly when response is valid and bulkCreditTransactionId is not set', async () => {
      const response = {
        Value: [{}],
      };
      component.bulkCreditTransactionId = null;

      await component.getClaimsSuccess(response);

      //expect(component.claims).toBeUndefined();
    });

    it('should set noRecordFoundMsg to true when response is null', async () => {
      const response = {
        Value: null,
      };

      await component.getClaimsSuccess(response);

      expect(component.noRecordFoundMsg).toEqual(true);
    });
  });

  describe('createBreadCrumb', () => {
    it('should set properties correctly when locationName is "account summary_selectclaims"', () => {
      // Arrange
      component.route = {
        patientId: '123',
        accountId: '456',
        PrevLocation: 'account summary_selectclaims',
      };

      // Act
      component.createBreadCrumb();

      // Assert
      expect(component.breadCrumbDto.FirstLocation).toBe(true);
      expect(component.breadCrumbDto.FirstLocationName).toBe('Account Summary');
      expect(component.breadCrumbDto.FirstLocationRoute).toBe('Patient/123/Summary/?tab=Account Summary');
      expect(component.breadCrumbDto.PreviousLocationName).toBe('Select Claims');
      expect(component.breadCrumbDto.PreviousLocationRoute).toBe(
        'Patient/123/Account/456/SelectClaims/Account Summary'
      );
    });

    it('should set properties correctly when locationName is "transaction history_selectclaims"', () => {
      // Arrange
      component.route = {
        patientId: '123',
        accountId: '456',
        PrevLocation: 'transaction history_selectclaims',
      };

      // Act
      component.createBreadCrumb();

      // Assert
      expect(component.breadCrumbDto.FirstLocation).toBe(true);
      expect(component.breadCrumbDto.FirstLocationName).toBe('Transaction History');
      expect(component.breadCrumbDto.FirstLocationRoute).toBe('Patient/123/Summary/?tab=Transaction History');
      expect(component.breadCrumbDto.PreviousLocationName).toBe('Select Claims');
      expect(component.breadCrumbDto.PreviousLocationRoute).toBe(
        'Patient/123/Account/456/SelectClaims/Transaction History'
      );
    });

    // ... (previous test cases)

    it('should set properties correctly when locationName is "patientoverview_selectclaims"', () => {
      // Arrange
      component.route = {
        patientId: '123',
        accountId: '456',
        PrevLocation: 'patientoverview_selectclaims',
        snapshot: { params: { patientId: '123' } },
      };

      // Act
      component.createBreadCrumb();

      // Assert
      expect(component.breadCrumbDto.FirstLocation).toBe(true);
      expect(component.breadCrumbDto.FirstLocationName).toBe('Patient Overview');
      expect(component.breadCrumbDto.FirstLocationRoute).toBe('Patient/123/Overview/');
      expect(component.breadCrumbDto.PreviousLocationName).toBe('Select Claims');
      expect(component.breadCrumbDto.PreviousLocationRoute).toBe(
        'Patient/123/Account/456/SelectClaims/PatientOverview'
      );
    });

    it('should set properties correctly when locationName is "transaction history"', () => {
      // Arrange
      component.route = {
        patientId: '123',
        PrevLocation: 'transaction history',
      };

      // Act
      component.createBreadCrumb();

      // Assert
      expect(component.breadCrumbDto.PreviousLocationName).toBe('Transaction History');
      expect(component.breadCrumbDto.PreviousLocationRoute).toBe('Patient/123/Summary/?tab=Transaction History');
    });

    it('should set properties correctly when locationName is "businesscenter_insurance"', () => {
      // Arrange
      component.route = {
        PrevLocation: 'businesscenter_insurance',
      };

      // Act
      component.createBreadCrumb();

      // Assert
      expect(component.breadCrumbDto.PreviousLocationName).toBe('Claims');
      expect(component.breadCrumbDto.PreviousLocationRoute).toBe('BusinessCenter/Insurance');
    });

    it('should set properties correctly when locationName is not matched', () => {
      // Arrange
      component.route = {
        patientId: '123',
        PrevLocation: 'some_other_location',
      };

      // Act
      component.createBreadCrumb();

      // Assert
      expect(component.breadCrumbDto.PreviousLocationName).toBe('Patient Overview');
      expect(component.breadCrumbDto.PreviousLocationRoute).toBe('Patient/123/Overview/');
    });
  });

  describe('promptOpenEdgeCreditTransactionUpdateFailed', () => {
    it('should set openEdgePaymentNotApplied to true and call decisionModal with correct parameters', () => {
      component.promptOpenEdgeCreditTransactionUpdateFailed();
      expect(component.openEdgePaymentNotApplied).toBeTruthy();

      expect(mockModalFactory.DecisionModal).toHaveBeenCalled();
    });
  });

  describe('removeWaitOverlay', () => {
    it('should close the waitOverlay and set it to null if it exists', () => {
      expect(component.waitOverlay).not.toBeNull();
      component.removeWaitOverlay();
      expect(component.waitOverlay).toBeUndefined();
    });

    it('should not throw if waitOverlay is already null', () => {
      component.waitOverlay = null;

      expect(() => {
        component.removeWaitOverlay();
      }).not.toThrow();
    });
  });

  describe('getInsurancePaymentTypes', () => {
    it('should call getAllPaymentTypesMinimal and handle the result with getInsurancePaymentTypesSuccess', () => {
      mockPaymentTypesService.getAllPaymentTypesMinimal = jasmine.createSpy().and.returnValue({
        then: (success, failure) => success(paymentTypes),
      });
      spyOn(component, 'getInsurancePaymentTypesSuccess');
      component.getInsurancePaymentTypes();
      expect(mockPaymentTypesService.getAllPaymentTypesMinimal).toHaveBeenCalled();
      expect(component.getInsurancePaymentTypesSuccess).toHaveBeenCalled();
    });

    it('should handle the error with getInsurancePaymentTypesFailure', () => {
      mockPaymentTypesService.getAllPaymentTypesMinimal = jasmine.createSpy().and.returnValue({
        then: (success, failure) => failure({}),
      });
      spyOn(component, 'getInsurancePaymentTypesFailure');
      component.getInsurancePaymentTypes();
      expect(component.getInsurancePaymentTypesFailure).toHaveBeenCalled();
    });
  });

  describe('getInsurancePaymentTypesFailure', () => {
    it('should display an error message', () => {
      component.getInsurancePaymentTypesFailure();

      expect(mockToastrFactory.error).toHaveBeenCalled();
    });
  });

  describe('pageDataCallSetup', () => {
    it('should setup service call to get single claim by ID', () => {
      component.claimId = 'someClaimId';

      const services = component.pageDataCallSetup();

      expect(services.length).toBe(1);
      expect(services[0].Params.claimId).toBe(component.claimId);
      expect(services[0].OnSuccess).toEqual(jasmine.any(Function));
      expect(services[0].OnError).toEqual(jasmine.any(Function));
    });
  });

  describe('getClaimsFailure', () => {
    it('should display an error message', () => {
      spyOn(mockLocalizeService, 'getLocalizedString');
      component.getClaimsFailure();

      expect(mockToastrFactory.error).toHaveBeenCalled();

      expect(mockLocalizeService.getLocalizedString).toHaveBeenCalled();
    });
  });

  describe('getClaimFailure', () => {
    it('should display an error message', () => {
      spyOn(mockLocalizeService, 'getLocalizedString');
      component.getClaimFailure();

      expect(mockToastrFactory.error).toHaveBeenCalled();

      expect(mockLocalizeService.getLocalizedString).toHaveBeenCalled();
    });
  });

  describe('getTransactionFailure', () => {
    it('should display an error message', () => {
      spyOn(mockLocalizeService, 'getLocalizedString');
      component.getTransactionFailure();

      expect(mockToastrFactory.error).toHaveBeenCalled();

      expect(mockLocalizeService.getLocalizedString).toHaveBeenCalled();
    });
  });

  describe('checkFeatureFlags', () => {
    it('should set showPaymentProvider to true when checking feature flag', () => {
      component.checkFeatureFlags();
      expect(component.showPaymentProvider).toBeTruthy();
    });
  });


  describe('applyProcess',()=>{
    beforeEach(()=>{
      component.insurancePaymentTypes = [
          { CurrencyTypeId: 1, PaymentTypeId: 11 },
          { CurrencyTypeId: 3, PaymentTypeId: 21 },
      ];

    })
    it('should call PaymentGatewayService createPaymentProviderCreditOrDebitPayment when selected location have GPI is enabled and credit card is selected', async() => {
    component.applyButtonTouched = true;
    component.isInsTransactionDeposited =false;
    component.insurancePaymentDto.InsurancePaymentTypeId='21';
    component.insurancePaymentDto.Amount=10;
    component.insurancePaymentDto.DateEntered= new Date();
    component.insurancePaymentDto.AccountId ='1';
    component.editMode = false;
    const userLocation={
      IsPaymentGatewayEnabled:true,
      PaymentProvider:PaymentProvider.TransactionsUI,
      LocationId :1,
      MerchantId:''
    }
    const mockSanitizedUrl = 'https://web.test.paygateway.com/paypage/v1/sales/123';
    component.claims = JSON.parse(JSON.stringify(mockClaims));
    component.claims[0].PaymentAmount = 5;
    spyOn(component, 'getUserLocation').and.returnValue(Promise.resolve(userLocation));
    await component.apply();
    
    expect(mockPaymentGatewayService.createPaymentProviderCreditOrDebitPayment).toHaveBeenCalled();
    expect(mockPatientServices.CreditTransactions.payPageRequest).toHaveBeenCalled();
    expect(sanitizerSpy.bypassSecurityTrustResourceUrl).toHaveBeenCalledWith(mockSanitizedUrl);
    expect(component.showPayPageModal).toBeTruthy();
    });

    it('should not call PaymentGatewayService createPaymentProviderCreditOrDebitPayment when selected location have GPI is disable and credit card is selected', async() => {
      component.applyButtonTouched = true;
      component.isInsTransactionDeposited =false;
      component.insurancePaymentDto.InsurancePaymentTypeId='21';
      component.insurancePaymentDto.Amount=10;
      component.insurancePaymentDto.DateEntered= new Date();
      component.insurancePaymentDto.AccountId ='1';
      component.editMode = false;
      const userLocation={
        IsPaymentGatewayEnabled:true,
        PaymentProvider:PaymentProvider.OpenEdge,
        LocationId :1,
        MerchantId:null
      }
      component.claims = JSON.parse(JSON.stringify(mockClaims));
      component.claims[0].PaymentAmount = 5;
      spyOn(component, 'getUserLocation').and.returnValue(Promise.resolve(userLocation));
      await component.apply();
      
       expect(mockPaymentGatewayService.createPaymentProviderCreditOrDebitPayment).not.toHaveBeenCalled()
       expect(component.showPayPageModal).toBeFalsy();
    });

    it('should not call PaymentGatewayService createPaymentProviderCreditOrDebitPayment when multiple claims selected have payment amount greater than 0 and credit card selected', async() => {
      component.applyButtonTouched = true;
      component.isInsTransactionDeposited =false;
      component.insurancePaymentDto.InsurancePaymentTypeId='21';
      component.insurancePaymentDto.Amount=10;
      component.insurancePaymentDto.DateEntered= new Date();
      component.insurancePaymentDto.AccountId ='1';
      component.editMode = false;
      const userLocation={
        IsPaymentGatewayEnabled:true,
        PaymentProvider:PaymentProvider.TransactionsUI,
        LocationId :1,
        MerchantId:null
      }

      component.claims =[];
      component.claims.push( JSON.parse(JSON.stringify(mockClaims[0])));
      component.claims.push( JSON.parse(JSON.stringify(mockClaims[0])));
      component.claims[0].PaymentAmount = 5;
      component.claims[1].PaymentAmount = 5;

      spyOn(component, 'getUserLocation').and.returnValue(Promise.resolve(userLocation));
      await component.apply();
      
       expect(mockPaymentGatewayService.createPaymentProviderCreditOrDebitPayment).not.toHaveBeenCalled()
       expect(component.showPayPageModal).toBeFalsy();
    });

  });



  describe('paypageRedirectCallBackEvent', () => {
  
    it('should call completeGPIInsurancePaymentTransaction with correct arguments', () => {
      component.transactionInformation={
        PaymentGatewayTransactionId:'4973'
      }
       component.insurancePaymentDto = {
        Amount: 10,
        DateEntered: new Date(),
        InsurancePaymentTypeId: '21',
        Note: '',
        BulkCreditTransactionType: 2,
        PaymentTypePromptValue: null,
        AccountId: '1',
        UpdatedEstimates: [],
      };
      component.claims = JSON.parse(JSON.stringify(mockClaims));
      component.claims[0].PaymentAmount = 5;
      // Call the function
      component.paypageRedirectCallBackEvent();
  
      // Check that the function was called with correct arguments
      expect(mockPatientInsurancePaymentFactory.completeInsurancePaymentTransaction).toHaveBeenCalledWith(
        component.transactionInformation,
        component.insurancePaymentDto,
        component.claims,
        jasmine.any(Function), 
        jasmine.any(Function)  
      );
    });
  
  });

  describe('serviceAllowedAmountBlurEvent', () => {
    let event;
  
    beforeEach(() => {
      component.claims = cloneDeep(mockClaims);
      spyOn(component, 'updateClaimWithEstimates'); 
      component.insurancePaymentDto.Amount = 300.00;  
      event = {
        claim: {
          ClaimId: 12345,
          ServiceTransactionToClaimPaymentDtos: [
            { AllowedAmount: 100, ClaimId: '1', ServiceTransactionId: '101', EstimatedInsuranceId: '201', PaymentAmount: 50 },
            { AllowedAmount: 200, ClaimId: '1', ServiceTransactionId: '102', EstimatedInsuranceId: '202', PaymentAmount: null },
            { AllowedAmount: 150, ClaimId: '1', ServiceTransactionId: '103', EstimatedInsuranceId: '203', PaymentAmount: 0 },
          ],
        },
      };
    });
  
    it('should create a list of AllowedAmountOverrideDto for services in claim with overridden AllowedAmounts', () => {
      event.claim.ServiceTransactionToClaimPaymentDtos[0].AllowedAmount = 131;
      component.serviceAllowedAmountBlurEvent(event); 
      expect(mockSoarBulkPaymentHttpService.reEstimateClaimServices).toHaveBeenCalledWith({claimId : 12345, 
        allowedAmounts: [
          { ServiceTransactionId: '101', AllowedAmount: 131 , EstimatedInsuranceId: '201'},
          { ServiceTransactionId: '102', AllowedAmount: 200, EstimatedInsuranceId: '202'},
          { ServiceTransactionId: '103', AllowedAmount: 150 , EstimatedInsuranceId: '203'},
        ],
      });      
    });
    
    it('should call updateClaimWithEstimates with the claim and estimates', () => {
      const estimates = { Value: [] };
      component.serviceAllowedAmountBlurEvent(event); 
      expect(component.updateClaimWithEstimates).toHaveBeenCalledWith(event.claim, estimates);
    });
    
  });


  describe('updateClaimWithEstimates', () => {
    let claim;
    let estimates;
  
    beforeEach(() => {
      component.claims = cloneDeep(mockClaims);
      claim = {
        ServiceTransactionToClaimPaymentDtos: [
          {
            ServiceTransactionId: '101',
            AllowedAmount:200,
            TotalInsurancePayments: 0,
            AdjustedEstimate: 0,
            PatientBalance: 0,
            EstimatedInsurance: 180,
            EstimatedInsuranceAdjustment: 0,
          },
          {
            ServiceTransactionId: '102',
            AllowedAmount: 200,
            TotalInsurancePayments: 0,
            AdjustedEstimate: 0,
            PatientBalance: 0,
            EstimatedInsurance: 180,
            EstimatedInsuranceAdjustment: 0,
          },
        ],
      };
  
      estimates = {
        Value: [
          {
            ServiceTransactionId: '101',
            AllowedAmount: 200,
            AllowedAmountOverride: 150.00,
            TotalInsurancePayments: 60,
            AdjEst: 44,
            PatientBalance: 60,
            EstInsurance: 50,
            EstimatedInsuranceAdjustment: 10,
          },
          {
            ServiceTransactionId: '102',
            AllowedAmount: 200,
            AllowedAmountOverride: 150.00,
            TotalInsurancePayments: 110,
            AdjEst: 44,
            PatientBalance: 110,
            EstInsurance: 90,
            EstimatedInsuranceAdjustment: 20,
          },
        ],
      };
      spyOn(component, 'recalculateClaimEstimateTotals');
    });
  
    it('should update the claim services with the provided estimates', () => {
      component.updateClaimWithEstimates(claim, estimates);
  
      expect(claim.ServiceTransactionToClaimPaymentDtos[0].AllowedAmount).toEqual(150);
      expect(claim.ServiceTransactionToClaimPaymentDtos[0].TotalInsurancePayments).toEqual(0);
      expect(claim.ServiceTransactionToClaimPaymentDtos[0].PatientBalance).toEqual(0);
      expect(claim.ServiceTransactionToClaimPaymentDtos[0].EstimatedInsurance).toEqual(180);
      expect(claim.ServiceTransactionToClaimPaymentDtos[0].EstimatedInsuranceAdjustment).toEqual(0);
  
      expect(claim.ServiceTransactionToClaimPaymentDtos[1].AllowedAmount).toEqual(150);
      expect(claim.ServiceTransactionToClaimPaymentDtos[1].TotalInsurancePayments).toEqual(0);
      expect(claim.ServiceTransactionToClaimPaymentDtos[1].PatientBalance).toEqual(0);
      expect(claim.ServiceTransactionToClaimPaymentDtos[1].EstimatedInsurance).toEqual(180);
      expect(claim.ServiceTransactionToClaimPaymentDtos[1].EstimatedInsuranceAdjustment).toEqual(0);
    });  

    it('should call recalculateClaimEstimateTotals', () => {
      component.updateClaimWithEstimates(claim, estimates);  
      expect(component.recalculateClaimEstimateTotals).toHaveBeenCalledWith(claim);
    });    
  });

  
  describe('loadUpdatedEstimates', () => {
    let mockEstimates: SoarResponse<InsuranceEstimateDto[]>;
    beforeEach(() => {           
      mockEstimates = {
        Value: [
          {
            EstimatedInsuranceId: '12345', 
            AccountMemberId: '12345', 
            EncounterId: '12345',
            ServiceTransactionId: '12345',
            ServiceCodeId: '12345',
            PatientBenefitPlanId: '12345',  
            Fee: 0,
            EstInsurance: 0,
            IsUserOverRidden: false,
            FamilyDeductibleUsed: 0,
            IndividualDeductibleUsed: 0,
            CalculationDescription: 'string',
            CalcWithoutClaim: false,
            PaidAmount: 0,
            ObjectState: 'string',
            FailedMessage: 'string',
            AdjEst: 0,
            AdjPaid: 0,
            AreBenefitsApplied: false,
            IsMostRecentOverride: false,
            AllowedAmountOverride: 125,
            AllowedAmount: 150,
            DataTag: 'string',
            DateModified: new Date(),
            UserModified: 'string',
          }]
      };
      component.insurancePaymentDto.UpdatedEstimates = [{
        EstimatedInsuranceId: '12345', 
        AccountMemberId: '12345', 
        EncounterId: '12345',
        ServiceTransactionId: '12345',
        ServiceCodeId: '12345',
        PatientBenefitPlanId: '12345',  
        Fee: 0,
        EstInsurance: 0,
        IsUserOverRidden: false,
        FamilyDeductibleUsed: 0,
        IndividualDeductibleUsed: 0,
        CalculationDescription: 'string',
        CalcWithoutClaim: false,
        PaidAmount: 0,
        ObjectState: 'string',
        FailedMessage: 'string',
        AdjEst: 0,
        AdjPaid: 0,
        AreBenefitsApplied: false,
        IsMostRecentOverride: false,
        AllowedAmountOverride: 125,
        AllowedAmount: 150,
        DataTag: 'string',
        DateModified: new Date(),
        UserModified: 'string',
      }]
    });

    it('should add new estimates if they do not exist in updatedEstimates', () => {
        component.loadUpdatedEstimates(mockEstimates);
        expect(component.insurancePaymentDto.UpdatedEstimates.length).toBe(1);
        expect(component.insurancePaymentDto.UpdatedEstimates).toEqual(mockEstimates.Value);
    });

    it('should replace existing estimates with the same EstimatedInsuranceId', () => {      
      mockEstimates.Value[0].AllowedAmountOverride = 110.00;
      component.loadUpdatedEstimates(mockEstimates);
      expect(component.insurancePaymentDto.UpdatedEstimates.length).toBe(1);
      expect(component.insurancePaymentDto.UpdatedEstimates[0].AllowedAmountOverride).toBe(110);
    }); 
    
    it('should add estimates with different EstimatedInsuranceId', () => {
      mockEstimates.Value[0].AllowedAmount = 110.00;      
      mockEstimates.Value[0].EstimatedInsuranceId = '67890'; // Different ID
      component.loadUpdatedEstimates(mockEstimates);
      expect(component.insurancePaymentDto.UpdatedEstimates.length).toBe(2);
      expect(component.insurancePaymentDto.UpdatedEstimates[0].AllowedAmount).toBe(150);
      expect(component.insurancePaymentDto.UpdatedEstimates[1].AllowedAmount).toBe(110);
    });  
  }); 
  
  describe('isApplyButtonDisabled', () => { 
    beforeEach(() => {
      component.editMode = false;
    });
  
    it('should return true if applyButtonTouched is true', () => {
      component.applyButtonTouched = true;
      expect(component.isApplyButtonDisabled()).toBe(true);
    });
  
    it('should return true if insurancePaymentDto.Amount exceeds remainingBalance', () => {
      component.insurancePaymentDto.Amount = 200;
      component.remainingBalance = 100;
      expect(component.isApplyButtonDisabled()).toBe(true);
    });
  
    it('should return true if insurancePaymentDto.Amount is less than 0', () => {
      component.insurancePaymentDto.Amount = -1;
      expect(component.isApplyButtonDisabled()).toBe(true);
    });
  
    it('should return true if insurancePaymentDto.Amount exceeds 999999.99', () => {
      component.insurancePaymentDto.Amount = 1000000;
      expect(component.isApplyButtonDisabled()).toBe(true);
    });
  
    it('should return true if unappliedAmount is less than -0.009999', () => {
      component.unappliedAmount = -0.01;
      expect(component.isApplyButtonDisabled()).toBe(true);
    });
  
    it('should return true if unappliedAmount exceeds minValCheck', () => {
      component.unappliedAmount = 0.02;
      component.minValCheck = 0.01;
      expect(component.isApplyButtonDisabled()).toBe(true);
    });
  
    it('should return true if invalidAllowedAmounts is true', () => {
      component.invalidAllowedAmounts = true;
      expect(component.isApplyButtonDisabled()).toBe(true);
    });
  
    it('should return true if InsurancePaymentTypeId is not set', () => {
      component.insurancePaymentDto.InsurancePaymentTypeId = null;
      expect(component.isApplyButtonDisabled()).toBe(true);
    });
  
    it('should return true if showCreditCardDropDown is true and selectedCardReader is not set', () => {
      component.showCreditCardDropDown = true;
      component.selectedCardReader = null;
      expect(component.isApplyButtonDisabled()).toBe(true);
    });
  
    it('should return true if waitingOnValidation is true', () => {
      component.waitingOnValidation = true;
      expect(component.isApplyButtonDisabled()).toBe(true);
    });

    it('should return false if editMode is true insurancePaymentIsValid is false', () => {
      component.insurancePaymentIsValid = false;
      component.editMode = false;
      expect(component.isApplyButtonDisabled()).toBe(true);
    });

     it('should return true if insurancePaymentIsValid is false', () => {
      component.insurancePaymentIsValid = false;
      expect(component.isApplyButtonDisabled()).toBe(true);
    });

    it('should return true if InsurancePaymentTypeId is not set', () => {
      component.editMode = true;
      component.insurancePaymentDto.InsurancePaymentTypeId = null;
      expect(component.isApplyButtonDisabled()).toBe(true);
    });

    it('should return false if insurancePaymentDto.Amount exceeds remainingBalance when in editmode', () => {
      component.editMode = true;
      component.insurancePaymentDto.Amount = 200;
      component.insurancePaymentDto.InsurancePaymentTypeId = '1234';
      component.remainingBalance = 100;
      expect(component.isApplyButtonDisabled()).toBe(false);
    });
  
    it('should return false if all conditions are valid', () => {
      component.insurancePaymentIsValid = true;
      component.applyButtonTouched = false;
      component.insurancePaymentDto.Amount = 100;
      component.remainingBalance = 200;
      component.unappliedAmount = 0;
      component.minValCheck = 0.01;
      component.invalidAllowedAmounts = false;
      component.insurancePaymentDto.InsurancePaymentTypeId = '1';
      component.showCreditCardDropDown = false;
      component.waitingOnValidation = false;
  
      expect(component.isApplyButtonDisabled()).toBe(false);
    });
  });

  describe('validateAllowedAmounts', () => {  
    beforeEach(() => {
      // Arrange
      component.claims = [
        {
          ServiceTransactionToClaimPaymentDtos: [
            {
              AllowedAmount: -10, Charges: 200,
              ServiceTransactionToClaimId: '',
              ServiceTransactionId: '',
              ClaimId: '',
              DateEntered: '',
              Description: '',
              ProviderUserId: '',
              EncounterId: '',
              AccountMemberId: '',
              PatientName: '',
              ProviderName: '',
              InsuranceEstimate: 0,
              AdjustedEstimate: 0,
              OriginalInsuranceEstimate: 0,
              PaidInsuranceEstimate: 0,
              Balance: 0,
              TotalInsurancePayments: 0,
              PaymentAmount: 0,
              Tooth: '',
              Surface: '',
              Roots: '',
              InsuranceOrder: 0,
              DateServiceCompleted: '',
              EstimatedInsuranceId: '',
              DataTag: '',
              UserModified: '',
              DateModified: '',
              OriginalAllowedAmount: 0,
              FeeScheduleId: '',
              FeeScheduleGroupId: '',
              FeeScheduleGroupDetailId: '',
              ServiceCodeId: '',  
               AllowedAmountOverride: null 
            },
            {
              AllowedAmount: 50, Charges: 100,
              ServiceTransactionToClaimId: '',
              ServiceTransactionId: '',
              ClaimId: '',
              DateEntered: '',
              Description: '',
              ProviderUserId: '',
              EncounterId: '',
              AccountMemberId: '',
              PatientName: '',
              ProviderName: '',
              InsuranceEstimate: 0,
              AdjustedEstimate: 0,
              OriginalInsuranceEstimate: 0,
              PaidInsuranceEstimate: 0,
              Balance: 0,
              TotalInsurancePayments: 0,
              PaymentAmount: 0,
              Tooth: '',
              Surface: '',
              Roots: '',
              InsuranceOrder: 0,
              DateServiceCompleted: '',
              EstimatedInsuranceId: '',
              DataTag: '',
              UserModified: '',
              DateModified: '',
              OriginalAllowedAmount: 0,
              FeeScheduleId: '',
              FeeScheduleGroupId: '',
              FeeScheduleGroupDetailId: '',
              ServiceCodeId: '',  
              AllowedAmountOverride: null
            },
          ],
          ClaimEntityId: '',
          ClaimId: '',
          LocationId: 0,
          AccountMemberId: '',
          PatientId: '',
          PatientName: '',
          AccountId: '',
          ProviderId: '',
          ProviderName: '',
          CarrierId: '',
          BenefitPlanId: '',
          CarrierName: '',
          PrimaryClaim: false,
          Type: 0,
          MinServiceDate: undefined,
          MaxServiceDate: undefined,
          DisplayDate: '',
          ApplyInsurancePaymentBackToPatientBenefit: false,
          RecreateClaim: false,
          Status: 0,
          IsReceived: false,
          TotalCharges: 0,
          TotalEstimatedInsurance: 0,
          TotalEstInsuranceAdj: 0,
          TotalPatientBalance: 0,
          PaymentAmount: 0,
          FinalPayment: false,
          AllowedAmount: 0,
          ClaimEntityDataTag: '',
          DataTag: '',
          UserModified: '',
          DateModified: undefined,
          InsuranceEstimate: 0,
          Charges: 0,
          AdjustedEstimate: 0,
          Balance: 0
        },
      ];
      
    });

    it('should set invalidAllowedAmounts to true if any AllowedAmount exceeds charge', () => {
      component.claims[0].ServiceTransactionToClaimPaymentDtos[0].AllowedAmount = 100;
      component.claims[0].ServiceTransactionToClaimPaymentDtos[0].Charges = 50; 
      component.validateAllowedAmounts();
      expect(component.invalidAllowedAmounts).toBe(true);
    }); 
  
    it('should set invalidAllowedAmounts to false if no AllowedAmount exceeds charge', () => {
      component.claims[0].ServiceTransactionToClaimPaymentDtos[0].AllowedAmount = 100;
      component.claims[0].ServiceTransactionToClaimPaymentDtos[0].Charges = 110; 
      component.validateAllowedAmounts();
      expect(component.invalidAllowedAmounts).toBe(false);
    });    
  });

  describe('snapshotOriginalEstimates', () => {
    beforeEach(() => {
      spyOn(component, 'recalculateClaimEstimateTotals');
      component.claims = [
        {
          ServiceTransactionToClaimPaymentDtos: [
            {
              ServiceTransactionId: '1',
              AdjustedEstimate: 100,
              InsuranceEstimate: 200,
              PaidInsuranceEstimate: 50,
              AllowedAmount: 150,
              OriginalInsuranceEstimate: 200,
              ServiceTransactionToClaimId: '',
              ClaimId: '',
              DateEntered: '',
              Description: '',
              ProviderUserId: '',
              EncounterId: '',
              AccountMemberId: '',
              PatientName: '',
              ProviderName: '',
              Charges: 0,
              Balance: 0,
              TotalInsurancePayments: 0,
              PaymentAmount: 0,
              Tooth: '',
              Surface: '',
              Roots: '',
              InsuranceOrder: 0,
              DateServiceCompleted: '',
              EstimatedInsuranceId: '',
              DataTag: '',
              UserModified: '',
              DateModified: '',
              OriginalAllowedAmount: 0,
              FeeScheduleId: '',
              FeeScheduleGroupId: '',
              FeeScheduleGroupDetailId: '',
              ServiceCodeId: '', 
               AllowedAmountOverride: null 
            },
            {
              ServiceTransactionId: '2',
              AdjustedEstimate: 120,
              InsuranceEstimate: 220,
              PaidInsuranceEstimate: 60,
              AllowedAmount: 160,
              OriginalInsuranceEstimate: 220,
              ServiceTransactionToClaimId: '',
              ClaimId: '',
              DateEntered: '',
              Description: '',
              ProviderUserId: '',
              EncounterId: '',
              AccountMemberId: '',
              PatientName: '',
              ProviderName: '',
              Charges: 0,
              Balance: 0,
              TotalInsurancePayments: 0,
              PaymentAmount: 0,
              Tooth: '',
              Surface: '',
              Roots: '',
              InsuranceOrder: 0,
              DateServiceCompleted: '',
              EstimatedInsuranceId: '',
              DataTag: '',
              UserModified: '',
              DateModified: '',
              OriginalAllowedAmount: 0,
              FeeScheduleId: '',
              FeeScheduleGroupId: '',
              FeeScheduleGroupDetailId: '',
              ServiceCodeId: '',  
               AllowedAmountOverride: null
            },
          ],
          ClaimEntityId: '',
          ClaimId: '',
          LocationId: 0,
          AccountMemberId: '',
          PatientId: '',
          PatientName: '',
          AccountId: '',
          ProviderId: '',
          ProviderName: '',
          CarrierId: '',
          BenefitPlanId: '',
          CarrierName: '',
          PrimaryClaim: false,
          Type: 0,
          MinServiceDate: undefined,
          MaxServiceDate: undefined,
          DisplayDate: '',
          ApplyInsurancePaymentBackToPatientBenefit: false,
          RecreateClaim: false,
          Status: 0,
          IsReceived: false,
          TotalCharges: 0,
          TotalEstimatedInsurance: 0,
          TotalEstInsuranceAdj: 0,
          TotalPatientBalance: 0,
          PaymentAmount: 0,
          FinalPayment: false,
          AllowedAmount: 0,
          ClaimEntityDataTag: '',
          DataTag: '',
          UserModified: '',
          DateModified: undefined,
          InsuranceEstimate: 0,
          Charges: 0,
          AdjustedEstimate: 0,
          Balance: 0
        },
        {
          ServiceTransactionToClaimPaymentDtos: [
            {
              ServiceTransactionId: '3',
              AdjustedEstimate: 130,
              InsuranceEstimate: 230,
              PaidInsuranceEstimate: 70,
              AllowedAmount: 170,
              OriginalInsuranceEstimate: 230,
              ServiceTransactionToClaimId: '',
              ClaimId: '',
              DateEntered: '',
              Description: '',
              ProviderUserId: '',
              EncounterId: '',
              AccountMemberId: '',
              PatientName: '',
              ProviderName: '',
              Charges: 0,
              Balance: 0,
              TotalInsurancePayments: 0,
              PaymentAmount: 0,
              Tooth: '',
              Surface: '',
              Roots: '',
              InsuranceOrder: 0,
              DateServiceCompleted: '',
              EstimatedInsuranceId: '',
              DataTag: '',
              UserModified: '',
              DateModified: '',
              OriginalAllowedAmount: 0,
              FeeScheduleId: '',
              FeeScheduleGroupId: '',
              FeeScheduleGroupDetailId: '',
              ServiceCodeId: '',
               AllowedAmountOverride: null
            },
          ],
          ClaimEntityId: '',
          ClaimId: '',
          LocationId: 0,
          AccountMemberId: '',
          PatientId: '',
          PatientName: '',
          AccountId: '',
          ProviderId: '',
          ProviderName: '',
          CarrierId: '',
          BenefitPlanId: '',
          CarrierName: '',
          PrimaryClaim: false,
          Type: 0,
          MinServiceDate: undefined,
          MaxServiceDate: undefined,
          DisplayDate: '',
          ApplyInsurancePaymentBackToPatientBenefit: false,
          RecreateClaim: false,
          Status: 0,
          IsReceived: false,
          TotalCharges: 0,
          TotalEstimatedInsurance: 0,
          TotalEstInsuranceAdj: 0,
          TotalPatientBalance: 0,
          PaymentAmount: 0,
          FinalPayment: false,
          AllowedAmount: 0,
          ClaimEntityDataTag: '',
          DataTag: '',
          UserModified: '',
          DateModified: undefined,
          InsuranceEstimate: 0,
          Charges: 0,
          AdjustedEstimate: 0,
          Balance: 0
        },
      ] ;
    });
 

    it('should store original estimates for all services in claims', () => {  
      const originalEstimates = component.snapshotOriginalEstimates(component.claims);
      expect(originalEstimates.length).toBe(3);
      expect(originalEstimates).toEqual([
        {
          ServiceTransactionId: '1',
          AdjustedEstimate: 100,
          InsuranceEstimate: 200,
          PaidInsuranceEstimate: 50,
          AllowedAmount: 150,
          OriginalInsuranceEstimate: 200,
        },
        {
          ServiceTransactionId: '2',
          AdjustedEstimate: 120,
          InsuranceEstimate: 220,
          PaidInsuranceEstimate: 60,
          AllowedAmount: 160,
          OriginalInsuranceEstimate: 220,
        },
        {
          ServiceTransactionId: '3',
          AdjustedEstimate: 130,
          InsuranceEstimate: 230,
          PaidInsuranceEstimate: 70,
          AllowedAmount: 170,
          OriginalInsuranceEstimate: 230,
        },
      ]);
    }); 
  });

  describe('recalculateClaimEstimateTotals', () => {
    let claim;
    beforeEach(() => {
      claim = {
        ServiceTransactionToClaimPaymentDtos: [
          {
            AdjustedEstimate: 100,
            InsuranceEstimate: 200,
            PaidInsuranceEstimate: 50,
            AllowedAmount: 150,
            TotalInsurancePayments: 20,
            PatientBalance: 0,
          },
          {
            AdjustedEstimate: 120,
            InsuranceEstimate: 220,
            PaidInsuranceEstimate: 60,
            AllowedAmount: 160,
            TotalInsurancePayments: 30,
            PatientBalance: 0,
          },
        ],
        TotalCharges: 0,
        TotalEstimatedInsurance: 0,
        TotalEstInsuranceAdj: 0,
        TotalPatientBalance: 0,
      };
    });

    it('should recalculate totals for the claim', () => {
      component.recalculateClaimEstimateTotals(claim);
      expect(claim.AllowedAmount).toBe(310);
      expect(claim.TotalEstimatedInsurance).toBe(420); 
      expect(claim.TotalEstInsuranceAdj).toBe(220); 
       
    });      
  });

  describe('resetAllowedAmounts', () => {
    beforeEach(() => {
      component.originalEstimates = [
        {
          ServiceTransactionId: '101',
          AllowedAmount: 100,
          InsuranceEstimate: 200,
          AdjustedEstimate: 150,
          PaidInsuranceEstimate: 50,
          OriginalInsuranceEstimate: 200,
        },
        {
          ServiceTransactionId: '102',
          AllowedAmount: 200,
          InsuranceEstimate: 300,
          AdjustedEstimate: 250,
          PaidInsuranceEstimate: 100,
          OriginalInsuranceEstimate: 300,
        },
      ];

      component.claims = [
        {
          ServiceTransactionToClaimPaymentDtos: [
            {
              ServiceTransactionId: '101',
              AllowedAmount: 120, // Modified value
              InsuranceEstimate: 220,
              AdjustedEstimate: 170,
              PaidInsuranceEstimate: 60,
              OriginalInsuranceEstimate: 200,
              ServiceTransactionToClaimId: '',
              ClaimId: '',
              DateEntered: '',
              Description: '',
              ProviderUserId: '',
              EncounterId: '',
              AccountMemberId: '',
              PatientName: '',
              ProviderName: '',
              Charges: 0,
              Balance: 0,
              TotalInsurancePayments: 0,
              PaymentAmount: 0,
              Tooth: '',
              Surface: '',
              Roots: '',
              InsuranceOrder: 0,
              DateServiceCompleted: '',
              EstimatedInsuranceId: '',
              DataTag: '',
              UserModified: '',
              DateModified: '',
              OriginalAllowedAmount: 0,
              FeeScheduleId: '',
              FeeScheduleGroupId: '',
              FeeScheduleGroupDetailId: '',
              ServiceCodeId: '',
               AllowedAmountOverride: null
            },
            {
              ServiceTransactionId: '102',
              AllowedAmount: 250, // Modified value
              InsuranceEstimate: 350,
              AdjustedEstimate: 300,
              PaidInsuranceEstimate: 120,
              OriginalInsuranceEstimate: 300,
              ServiceTransactionToClaimId: '',
              ClaimId: '',
              DateEntered: '',
              Description: '',
              ProviderUserId: '',
              EncounterId: '',
              AccountMemberId: '',
              PatientName: '',
              ProviderName: '',
              Charges: 0,
              Balance: 0,
              TotalInsurancePayments: 0,
              PaymentAmount: 0,
              Tooth: '',
              Surface: '',
              Roots: '',
              InsuranceOrder: 0,
              DateServiceCompleted: '',
              EstimatedInsuranceId: '',
              DataTag: '',
              UserModified: '',
              DateModified: '',
              OriginalAllowedAmount: 0,
              FeeScheduleId: '',
              FeeScheduleGroupId: '',
              FeeScheduleGroupDetailId: '',
              ServiceCodeId: '',
               AllowedAmountOverride: null
            },
          ],
          ClaimEntityId: '',
          ClaimId: '',
          LocationId: 0,
          AccountMemberId: '',
          PatientId: '',
          PatientName: '',
          AccountId: '',
          ProviderId: '',
          ProviderName: '',
          CarrierId: '',
          BenefitPlanId: '',
          CarrierName: '',
          PrimaryClaim: false,
          Type: 0,
          MinServiceDate: undefined,
          MaxServiceDate: undefined,
          DisplayDate: '',
          ApplyInsurancePaymentBackToPatientBenefit: false,
          RecreateClaim: false,
          Status: 0,
          IsReceived: false,
          TotalCharges: 0,
          TotalEstimatedInsurance: 0,
          TotalEstInsuranceAdj: 0,
          TotalPatientBalance: 0,
          PaymentAmount: 0,
          FinalPayment: false,
          AllowedAmount: 0,
          ClaimEntityDataTag: '',
          DataTag: '',
          UserModified: '',
          DateModified: undefined,
          InsuranceEstimate: 0,
          Charges: 0,
          AdjustedEstimate: 0,
          Balance: 0
        },
      ];

      component.insurancePaymentDto.UpdatedEstimates = [
        {
          ServiceTransactionId: '101',
          AllowedAmount: 120,
          EstimatedInsuranceId: '',
          AccountMemberId: '',
          EncounterId: '',
          ServiceCodeId: '',
          PatientBenefitPlanId: '',
          Fee: 0,
          EstInsurance: 0,
          IsUserOverRidden: false,
          FamilyDeductibleUsed: 0,
          IndividualDeductibleUsed: 0,
          CalculationDescription: '',
          CalcWithoutClaim: false,
          PaidAmount: 0,
          ObjectState: '',
          FailedMessage: '',
          AdjEst: 0,
          AdjPaid: 0,
          AreBenefitsApplied: false,
          IsMostRecentOverride: false,
          DataTag: '',
          DateModified: undefined,
          UserModified: ''
        },
        {
          ServiceTransactionId: '102',
          AllowedAmount: 250,
          EstimatedInsuranceId: '',
          AccountMemberId: '',
          EncounterId: '',
          ServiceCodeId: '',
          PatientBenefitPlanId: '',
          Fee: 0,
          EstInsurance: 0,
          IsUserOverRidden: false,
          FamilyDeductibleUsed: 0,
          IndividualDeductibleUsed: 0,
          CalculationDescription: '',
          CalcWithoutClaim: false,
          PaidAmount: 0,
          ObjectState: '',
          FailedMessage: '',
          AdjEst: 0,
          AdjPaid: 0,
          AreBenefitsApplied: false,
          IsMostRecentOverride: false,
          DataTag: '',
          DateModified: undefined,
          UserModified: ''
        },
      ];        
    });

    it('should reset allowed amounts and estimates to their original values', () => {
      component.resetAllowedAmounts();

      const claim = component.claims[0];
      expect(claim.ServiceTransactionToClaimPaymentDtos[0].AllowedAmount).toBe(100);
      expect(claim.ServiceTransactionToClaimPaymentDtos[0].InsuranceEstimate).toBe(200);
      expect(claim.ServiceTransactionToClaimPaymentDtos[0].AdjustedEstimate).toBe(150);
      expect(claim.ServiceTransactionToClaimPaymentDtos[0].PaidInsuranceEstimate).toBe(50);
      expect(claim.ServiceTransactionToClaimPaymentDtos[0].OriginalInsuranceEstimate).toBe(200);

      expect(claim.ServiceTransactionToClaimPaymentDtos[1].AllowedAmount).toBe(200);
      expect(claim.ServiceTransactionToClaimPaymentDtos[1].InsuranceEstimate).toBe(300);
      expect(claim.ServiceTransactionToClaimPaymentDtos[1].AdjustedEstimate).toBe(250);
      expect(claim.ServiceTransactionToClaimPaymentDtos[1].PaidInsuranceEstimate).toBe(100);
      expect(claim.ServiceTransactionToClaimPaymentDtos[1].OriginalInsuranceEstimate).toBe(300);

      expect(component.insurancePaymentDto.UpdatedEstimates.length).toBe(0);
      expect(component.hasEditedAllowedAmounts).toBe(false);
    });

    it('should call recalculateClaimEstimateTotals for each claim', () => {
      spyOn(component, 'recalculateClaimEstimateTotals');
      component.resetAllowedAmounts();        
      expect(component.recalculateClaimEstimateTotals).toHaveBeenCalledWith(component.claims[0]);
    });    
  }); 
  
  describe('handleUpdatedAllowedAmounts', () => {
    beforeEach(() => {
      spyOn(component, 'goToPreviousPage');
      spyOn(component, 'openFeeScheduleUpdateModal');
    });
      it('should open fee schedule update modal if user is authorized', () => {
      (mockPatSecurityService.IsAuthorizedByAbbreviation as jasmine.Spy).and.returnValue(true);
      const updatedAllowedAmounts: UpdatedAllowedAmountDto[] = [{ FeeScheduleId: '1' } as UpdatedAllowedAmountDto];
      component.openFeeScheduleUpdateModal = jasmine.createSpy();

      component.handleUpdatedAllowedAmounts(updatedAllowedAmounts);

      expect(component.openFeeScheduleUpdateModal).toHaveBeenCalledWith(updatedAllowedAmounts);
      expect(component.goToPreviousPage).not.toHaveBeenCalled();
    });

    it('should go to previous page if user is not authorized', () => {
      (mockPatSecurityService.IsAuthorizedByAbbreviation as jasmine.Spy).and.returnValue(false);
      const updatedAllowedAmounts: UpdatedAllowedAmountDto[] = [{ FeeScheduleId: '1' } as UpdatedAllowedAmountDto];
      component.openFeeScheduleUpdateModal = jasmine.createSpy();

      component.handleUpdatedAllowedAmounts(updatedAllowedAmounts);

      expect(component.openFeeScheduleUpdateModal).not.toHaveBeenCalled();
      expect(component.goToPreviousPage).toHaveBeenCalled();
    });
  });

  describe('getUpdatedAllowedAmounts', () => {
    beforeEach(() => {  
        component.claims = [
        {
          ServiceTransactionToClaimPaymentDtos: [
            {
              ServiceTransactionId: '101',
              AllowedAmount: 120, // Modified value
              InsuranceEstimate: 220,
              AdjustedEstimate: 170,
              PaidInsuranceEstimate: 60,
              OriginalInsuranceEstimate: 200,
              ServiceTransactionToClaimId: '',
              ClaimId: '',
              DateEntered: '',
              Description: '',
              ProviderUserId: '',
              EncounterId: '',
              AccountMemberId: '',
              PatientName: '',
              ProviderName: '',
              Charges: 0,
              Balance: 0,
              TotalInsurancePayments: 0,
              PaymentAmount: 0,
              Tooth: '',
              Surface: '',
              Roots: '',
              InsuranceOrder: 0,
              DateServiceCompleted: '',
              EstimatedInsuranceId: '',
              DataTag: '',
              UserModified: '',
              DateModified: '',
              OriginalAllowedAmount: 0,
              FeeScheduleId: '',
              FeeScheduleGroupId: '',
              FeeScheduleGroupDetailId: '',
              ServiceCodeId: '',
              AllowedAmountOverride: null
            },
            {
              ServiceTransactionId: '102',
              AllowedAmount: 250, // Modified value
              InsuranceEstimate: 350,
              AdjustedEstimate: 300,
              PaidInsuranceEstimate: 120,
              OriginalInsuranceEstimate: 300,
              ServiceTransactionToClaimId: '',
              ClaimId: '',
              DateEntered: '',
              Description: '',
              ProviderUserId: '',
              EncounterId: '',
              AccountMemberId: '',
              PatientName: '',
              ProviderName: '',
              Charges: 0,
              Balance: 0,
              TotalInsurancePayments: 0,
              PaymentAmount: 0,
              Tooth: '',
              Surface: '',
              Roots: '',
              InsuranceOrder: 0,
              DateServiceCompleted: '',
              EstimatedInsuranceId: '',
              DataTag: '',
              UserModified: '',
              DateModified: '',
              OriginalAllowedAmount: 0,
              FeeScheduleId: '',
              FeeScheduleGroupId: '',
              FeeScheduleGroupDetailId: '',
              ServiceCodeId: '',
               AllowedAmountOverride: null
            },
          ],
          ClaimEntityId: '',
          ClaimId: '',
          LocationId: 0,
          AccountMemberId: '',
          PatientId: '',
          PatientName: '',
          AccountId: '',
          ProviderId: '',
          ProviderName: '',
          CarrierId: '',
          BenefitPlanId: '',
          CarrierName: '',
          PrimaryClaim: false,
          Type: 0,
          MinServiceDate: undefined,
          MaxServiceDate: undefined,
          DisplayDate: '',
          ApplyInsurancePaymentBackToPatientBenefit: false,
          RecreateClaim: false,
          Status: 0,
          IsReceived: false,
          TotalCharges: 0,
          TotalEstimatedInsurance: 0,
          TotalEstInsuranceAdj: 0,
          TotalPatientBalance: 0,
          PaymentAmount: 0,
          FinalPayment: false,
          AllowedAmount: 0,
          ClaimEntityDataTag: '',
          DataTag: '',
          UserModified: '',
          DateModified: undefined,
          InsuranceEstimate: 0,
          Charges: 0,
          AdjustedEstimate: 0,
          Balance: 0
        },
      ];
    })
      
    it('should return only services with changed AllowedAmount and map fields correctly', () => {
      component.claims[0].ServiceTransactionToClaimPaymentDtos[0].AllowedAmount = 120;
      component.claims[0].ServiceTransactionToClaimPaymentDtos[1].AllowedAmount = 250;
      component.claims[0].ServiceTransactionToClaimPaymentDtos[0].OriginalAllowedAmount = 120;
      component.claims[0].ServiceTransactionToClaimPaymentDtos[1].OriginalAllowedAmount = 100;
      const updatedAllowedAmounts = component.getUpdatedAllowedAmounts(component.claims);

      expect(updatedAllowedAmounts.length).toBe(1);
      expect(updatedAllowedAmounts[0].UpdatedAmount).toBe(250);
      expect(updatedAllowedAmounts[0].CurrentAmount).toBe(100);
    });

    it('should return an empty array if no AllowedAmount has changed', () => {
      component.claims[0].ServiceTransactionToClaimPaymentDtos[0].AllowedAmount = 120;
      component.claims[0].ServiceTransactionToClaimPaymentDtos[1].AllowedAmount = 100;
      component.claims[0].ServiceTransactionToClaimPaymentDtos[0].OriginalAllowedAmount = 120;
      component.claims[0].ServiceTransactionToClaimPaymentDtos[1].OriginalAllowedAmount = 100;
      const updatedAllowedAmounts = component.getUpdatedAllowedAmounts(component.claims);

      expect(updatedAllowedAmounts.length).toBe(0);
    });
  });

  describe('openFeeScheduleUpdateModal', () => {
    let updatedAllowedAmounts: UpdatedAllowedAmountDto[] = [];
    beforeEach(() => {
      updatedAllowedAmounts = 
              [{ FeeScheduleId: '1' } as UpdatedAllowedAmountDto];
    })
    it('should call feeScheduleUpdateModalService.open', () => {
      mockFeeScheduleUpdateModalService.open = jasmine.createSpy().and.returnValue(mockDialogRef);
      component.openFeeScheduleUpdateModal(updatedAllowedAmounts);
      expect(mockFeeScheduleUpdateModalService.open).toHaveBeenCalled();
    });       
  })
});
