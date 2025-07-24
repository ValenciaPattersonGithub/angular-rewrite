import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { SoarBulkPaymentHttpService } from 'src/@core/http-services/soar-bulk-payment-http.service';
import { SoarEraHttpService } from 'src/@core/http-services/soar-era-http.service';
import { SoarLocationHttpService } from 'src/@core/http-services/soar-location-http.service';
import { SoarPaymentGatewayTransactionHttpService, UnappliedBulkInsurancePayment } from 'src/@core/http-services/soar-payment-gateway-transaction-http.service';
import { PatientRegistrationService } from "src/patient/common/http-providers/patient-registration.service";
import { ConfirmationModalService } from 'src/@shared/components/confirmation-modal/confirmation-modal.service';
import { CarrierLongLabelPipe } from 'src/@shared/pipes/carrierLongLabel/carrier-long-label.pipe';
import { InsurancePaymentIsValidPipe } from 'src/@shared/pipes/insurancePaymentIsValid/insurance-payment-is-valid.pipe';
import { BulkPaymentComponent } from './bulk-payment.component';
import { Component, EventEmitter, Input, Output, ChangeDetectorRef } from '@angular/core';
import { SearchBarAutocompleteComponent } from '../../../@shared/components/search-bar-autocomplete/search-bar-autocomplete.component';
import { CurrencyInputComponent } from '../../../@shared/components/currency-input/currency-input.component';
import { ClaimPaymentTableComponent } from '../claim-payment-table/claim-payment-table.component';
import { of, Subject, throwError } from 'rxjs';
import { CarrierDto } from 'src/@core/models/bulk-payment/bulk-insurance-dtos.model';
import { EraPaymentDto } from 'src/@core/models/era/soar-era-dtos.model';
import { WaitOverlayService } from 'src/@shared/components/wait-overlay/wait-overlay.service';
import { RegistrationCustomEvent } from "src/patient/common/models/registration-custom-event.model";
import moment from 'moment-timezone';
import { Overlay, OverlayModule } from "@angular/cdk/overlay";
import { DropDownsModule } from '@progress/kendo-angular-dropdowns';
import { FormsModule } from '@angular/forms';
import { ClaimPaymentAmountBlurEvent } from 'src/insurance/bulk-insurance/claim-payment-table/claim-payment-table.component';
import { SearchBarAutocompleteByIdComponent } from '../../../@shared/components/search-bar-autocomplete-by-id/search-bar-autocomplete-by-id.component';
import { CurrencyType } from 'src/@core/models/currency/currency-type.model';
import { PaymentTypesService } from 'src/@shared/providers/payment-types.service';
import * as cloneDeep from 'lodash/cloneDeep';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { DomSanitizer } from '@angular/platform-browser';
import { FeatureFlagService } from 'src/featureflag/featureflag.service';
import { PaymentProvider } from 'src/@shared/enum/accounting/payment-provider';
import { PaypageModalComponent } from 'src/@shared/components/paypage-modal/paypage-modal.component';
import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { SoarResponse } from 'src/@core/models/core/soar-response';
import { InsuranceEstimateDto } from 'src/accounting/encounter/models/patient-encounter.model';
import { FeeScheduleUpdateModalRef, FeeScheduleUpdateModalService } from 'src/insurance/fee-schedule/fee-schedule-update-on-payment/fee-schedule-update-modal.service';
import { UpdatedAllowedAmountDto } from 'src/insurance/fee-schedule/fee-schedule-dtos';


@Component({
    selector: 'access-based-location-selector',
    template: ''
})

export class MockAccessBasedLocationSelectorComponent {
    @Input() id: string;
    @Input() initialSelection: Array<{ LocationId: string }>;
    @Input() selectedLocations: any[];
    @Input() selectedLocationIds: any[];
    @Input() locationList: any[];
    @Input() disabled: boolean = false;
    @Input() amfaAccess: string;
    @Input() expanded: boolean;
    @Input() showActiveOnly: boolean = false;
    @Output() selectedValueChanged = new EventEmitter<any>();
}


@Component({
    selector: 'app-date-picker',
    template: ''
})
export class MockAppDatePickerComponent {
    @Input() value: Date;
    @Input() minDate: Date;
    @Input() maxDate: Date;
    @Input() label: string;
}

@Component({
    selector: 'app-button',
    template: ''
})
export class MockAppButtonComponent {
    @Input() buttonLabel: string;
    @Input() isDisabled: boolean;
}

@Component({
    selector: 'app-label',
    template: ''
})
export class MockAppLabel {
    @Input() label: string;
    @Input() fieldId: string;
}

@Component({
    selector: 'insurance-payment-types-dropdown',
    template: ''
})
export class MockInsuranceTypesDropdown {
    @Input() initialSelectedPaymentType: any;
}

@Component({
    selector: 'app-icon-button',
    template: ''
})
export class MockAppIconButton {
    @Input() selected: any;
}


@Component({
    selector: 'side-drawer',
    template: ''
})
export class MockSideDrawerComponent {
    @Input() isOpen: boolean;
}



describe('BulkPaymentComponent', () => {
    let component: BulkPaymentComponent;
    let fixture: ComponentFixture<BulkPaymentComponent>;

    let mockLocationService: any;
    let mockToastrFactory: any;
    let routeParams;
    let res;
    let mock$q;
    let mockBusinessCenterServices;
    let mockreferenceDataService: any;
    let mockChangeDetectorRef: ChangeDetectorRef;
    let $locationMock;
    let mockSoarBulkPaymentHttpService;
    let mockReferenceDataService: any;
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
        mockLocationService = {
            getCurrentLocation: jasmine.createSpy('LocationService.getCurrentLocation').and.returnValue({ id: 3 })
        };
        mockToastrFactory = {
            error: jasmine.createSpy()
        };
        routeParams = {
            EraId: null,
        };

        res = { Value: [] };
        mock$q = {
            all: jasmine.createSpy('q.all').and.callFake(() => {
                return {
                    then(callback) {
                        callback(res);
                    }
                };
            })
        };
        mockBusinessCenterServices = {
            Carrier: {
                get: jasmine.createSpy().and.returnValue({
                    $promise: {
                        then(callback) {
                            callback(res);
                        }
                    }
                })
            }
        };
        
        mockFeeScheduleUpdateModalService = {
            open: jasmine.createSpy().and.returnValue( {
                events: { type:'confirm' ,next: jasmine.createSpy(), subscribe: jasmine.createSpy(), },
        })         
    } 

        mockreferenceDataService = {
            get: (a: any) => { return [] },
            entityNames: {
                locations: []
            }
        };

        mockChangeDetectorRef = {
            detach: null,
            detectChanges: null,
            checkNoChanges: null,
            reattach: null,
            markForCheck: jasmine.createSpy("ChangeDetectorRef.markForCheck")
        };


        $locationMock = {
            path: jasmine.createSpy().and.callFake(() => {
                return '/BusinessCenter/Insurance/BulkPayment'
            }),
            search: jasmine.createSpy()
        }

        mockSoarBulkPaymentHttpService = {
            requestClaimsListByPayerId: jasmine.createSpy('SoarBulkPaymentHttpService.requestClaimsListByPayerId').and.returnValue(
                of({
                    Value: []
                })),
            requestClaimsListByCarrierId: jasmine.createSpy('SoarBulkPaymentHttpService.requestClaimsListByCarrierId').and.returnValue(
                of({
                    Value: []
                })),
           reEstimateClaimServices: jasmine.createSpy('SoarBulkPaymentHttpService.reEstimateClaimServices').and.returnValue(
            of({
                Value: []
            })),
        }

        mockReferenceDataService = {
            getData: function (x) { return Promise.resolve([{ LocationId: 12 }]); },
            entityNames: {
                locations: []
            }
        };
    });

    let mockConfirmationModalSubscription;
    let mockAmfaInfo;
    let mockPatientInsurancePaymentFactory;
    let mockTimeZoneFactory: any;
    let mockPatSecurityService;
    let personResult;
    let mockPersonFactory;
    let paymentTypes;
    let mockPaymentTypesService;
    let mockSoarLocationHttpService;
    let mockSoarPaymentGatewayTransactionHttpService;
    let mockPatientRegistrationService;
    let mockConfirmationModalService;
    let patientLocationAuthorization;
    let mockPatientValidationFactory;
    let mockGlobalSearchFactory;
    let mockEraService;
    let mockTabLauncher;
    let mockFeatureService;
    let mockUserServices;
    let mockModalFactory;
    let mockPlatformSessionCachingService;
    let mockWaitOverlayService;
    let mockOverlayService: Overlay;
    let mockPaymentGatewayService;
    let mockTranslateService;
    let mockCarrierLongLabelPipe: CarrierLongLabelPipe;
    let mockInsurancePaymentIsValidPipe: InsurancePaymentIsValidPipe;
    let sampleUnappliedPayment: UnappliedBulkInsurancePayment;
    let mockFeatureFlagService;
    let mockPatientServices;
    let sanitizerSpy: jasmine.SpyObj<DomSanitizer>;
    let mockLocalizeService;

    beforeEach(async () => {

        mockConfirmationModalSubscription = {
            subscribe: jasmine.createSpy(),
            unsubscribe: jasmine.createSpy(),
            _subscriptions: jasmine.createSpy(),
            _parentOrParents: jasmine.createSpy(),
            closed: jasmine.createSpy(),
            open: jasmine.createSpy(),
        };


        mockAmfaInfo = {
            "soar-acct-aipmt-add": { "ActionId": "2255", "ActionName": "Add", "ItemType": "Insurance Payments" },
        };

        mockPatientInsurancePaymentFactory = {
            applyInsurancePayments: jasmine.createSpy('PatientInsurancePaymentFactory.applyInsurancePayments').and.returnValue({
                $promise: {
                    then(callback) {
                        callback(res);
                    }
                }
            }),
            distributeAmountToServices: jasmine.createSpy('PatientInsurancePaymentFactory.distributeAmountToServices').and.returnValue({
                $promise: {
                    then(callback) {
                        callback(res);
                    }
                }
            }),
        };
        mockTimeZoneFactory = {
            ConvertDateToMomentTZ: jasmine.createSpy('mockTimeZoneFactory.ConvertDateToMomentTZ')
                .and.callFake((date) => { return moment(date); }),
        };
        mockPatSecurityService = {
            IsAuthorizedByAbbreviation: jasmine.createSpy('patSecurityService.IsAuthorizedByAbbreviation').and.returnValue(true)
        };
        personResult = { Value: '' };
        mockPersonFactory = {
            getById: jasmine.createSpy('PersonFactory.getById').and.returnValue({
                then: function (callback) {
                    callback(personResult);
                }
            }),
        };

        paymentTypes = { Value: [{ CurrencyTypeId: 1, PaymentTypeId: 11 }, { CurrencyTypeId: 2, PaymentTypeId: 21 }] };
        mockPaymentTypesService = {
            getAllPaymentTypesMinimal: () => {
                return {
                    then: (res) => {
                        res({ Value: paymentTypes.Value })

                    }
                }
            }
        }

        mockSoarLocationHttpService = {
            requestPermittedLocations: jasmine.createSpy('SoarLocationHttpService.requestPermittedLocations').and.returnValue(
                of({
                    Value: []
                })),

        };

        mockSoarPaymentGatewayTransactionHttpService = {
            requestUnappliedBulkInsurancePayments: jasmine.createSpy('SoarPaymentGatewayTransactionHttpService.requestUnappliedBulkInsurancePayments')
        };

        mockPatientRegistrationService = {
            getRegistrationEvent: jasmine.createSpy('PatientRegistrationService.getRegistrationEvent').and.returnValue(
                of({
                    Value: new Subject<RegistrationCustomEvent>()
                })
            )
        };

        mockConfirmationModalService = {
            open: jasmine.createSpy().and.returnValue({
                events: {
                    pipe: jasmine.createSpy().and.returnValue({ subscribe: jasmine.createSpy() }),
                },
                subscribe: jasmine.createSpy(),
                closed: jasmine.createSpy(),
            }),
        };
        patientLocationAuthorization = { authorization: { UserIsAuthorizedToAtLeastOnePatientLocation: false } };

        mockPatientValidationFactory = {
            PatientSearchValidation: jasmine.createSpy('PatientValidationFactory.PatientSearchValidation').and.returnValue({
                then(callback) {
                    callback(patientLocationAuthorization);
                }
            }),
            LaunchPatientLocationErrorModal: jasmine.createSpy('PatientValidationFactory.LaunchPatientLocationErrorModal').and.returnValue({
                then(callback) {
                    callback(res);
                }
            }),
        };

        mockGlobalSearchFactory = {
            SaveMostRecentPerson: jasmine.createSpy('GlobalSearchFactory.SaveMostRecentPerson').and.returnValue({
                $promise: {
                    then(callback) {
                        callback(res);
                    }
                }
            })
        }

        mockEraService = {
            requestEraClaimPayments: jasmine.createSpy().and.returnValue({
                subscribe: jasmine.createSpy(),
            }),
        };

        mockFeatureService = {
            isEnabled: jasmine.createSpy('FeatureService.isEnabled').and.returnValue({
                then: function (callback) {
                    callback(false);
                }
            }),
        };


        mockTabLauncher: {
        };

        mockUserServices = {
            Users: {
                get: jasmine.createSpy().and.returnValue({
                    $promise: {
                        then(callback) {
                            callback(res);
                        }
                    }
                })
            }
        };

        mockModalFactory = {
            CardServiceDisabledModal: jasmine.createSpy('ModalFactory.CardServiceDisabledModal').and.returnValue({
                then(callback) {
                    callback(res);
                }
            })
        };

        mockPlatformSessionCachingService = {
            userContext: {
                get: jasmine.createSpy().and.returnValue({
                    Result: {
                        User: {
                            UserId: 3
                        }
                    }
                })
            }
        };
        mockWaitOverlayService = jasmine.createSpyObj<WaitOverlayService>('mockWaitOverlayService', ['open']);

        mockPaymentGatewayService = {
            createCreditForBulkInsurance: jasmine.createSpy().and.callFake((res) => {
                return {
                    then(callback) {
                        callback(res);
                    }
                }
            }),
            createPaymentProviderCreditForBulkInsurance: jasmine.createSpy().and.callFake(() => {
                return {
                  $promise: {
                    then: (res, error) => {
                      res({ Value: { PaymentGatewayTransactionId: 4713 } });
                    },
                  },
                };
              }),
            completeCreditTransaction: jasmine.createSpy('completeCreditTransaction')

        };
        mockTranslateService = jasmine.createSpyObj<TranslateService>('TranslateService', ['instant']);
        mockCarrierLongLabelPipe = new CarrierLongLabelPipe();
        mockInsurancePaymentIsValidPipe = new InsurancePaymentIsValidPipe();
        mockFeatureFlagService = {
            getOnce$: jasmine.createSpy('FeatureFlagService.getOnce$').and.returnValue(of(true)),
          };
        
        mockPatientServices = {
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

        sanitizerSpy = jasmine.createSpyObj('DomSanitizer', ['bypassSecurityTrustResourceUrl']);
        mockLocalizeService = {
            getLocalizedString: () => 'translated text',
        };

        sampleUnappliedPayment = {
            PaymentDate: new Date(),
            CarrierId: '123',
            CarrierName: 'Test',
            LocationId: 2,
            LocationName: 'Test',
            PaymentGatewayTransactionId: 1,
            CardLastFour: '1234',
            PayerId: null,
            Amount: 10,
            PaymentTypeId: '123',
            PaymentTypeDescription: 'Credit'
        };

        await TestBed.configureTestingModule({
            providers: [
                { provide: 'referenceDataService', useValue: mockReferenceDataService },
                { provide: 'locationService', useValue: mockLocationService },
                { provide: '$location', useValue: $locationMock },
                { provide: '$routeParams', useValue: routeParams },
                { provide: 'toastrFactory', useValue: mockToastrFactory },
                { provide: 'PersonFactory', useValue: mockPersonFactory },
                { provide: 'BusinessCenterServices', useValue: mockBusinessCenterServices },
                { provide: 'patSecurityService', useValue: mockPatSecurityService },
                { provide: PaymentTypesService, useValue: mockPaymentTypesService },
                { provide: 'PatientInsurancePaymentFactory', useValue: mockPatientInsurancePaymentFactory },
                { provide: 'PaymentGatewayService', useValue: mockPaymentGatewayService },
                { provide: 'platformSessionCachingService', useValue: mockPlatformSessionCachingService },
                { provide: 'TimeZoneFactory', useValue: mockTimeZoneFactory },
                { provide: 'AmfaInfo', useValue: mockAmfaInfo },
                { provide: 'PatientValidationFactory', useValue: mockPatientValidationFactory },
                { provide: 'FeatureService', useValue: mockFeatureService },
                { provide: 'UserServices', useValue: mockUserServices },
                { provide: 'ModalFactory', useValue: mockModalFactory },
                { provide: '$q', useValue: mock$q },
                { provide: 'GlobalSearchFactory', useValue: mockGlobalSearchFactory },
                { provide: 'tabLauncher', useValue: mockTabLauncher },
                { provide: CarrierLongLabelPipe, useValue: mockCarrierLongLabelPipe },
                { provide: SoarBulkPaymentHttpService, useValue: mockSoarBulkPaymentHttpService },
                { provide: SoarLocationHttpService, useValue: mockSoarLocationHttpService },
                { provide: SoarEraHttpService, useValue: mockEraService },
                { provide: SoarPaymentGatewayTransactionHttpService, useValue: mockSoarPaymentGatewayTransactionHttpService },
                { provide: InsurancePaymentIsValidPipe, useValue: mockInsurancePaymentIsValidPipe },
                { provide: ConfirmationModalService, useValue: mockConfirmationModalService },
                { provide: WaitOverlayService, useValue: mockWaitOverlayService },
                { provide: PatientRegistrationService, useValue: mockPatientRegistrationService },
                { provide: FeatureFlagService, useValue: mockFeatureFlagService },
                { provide: 'PatientServices', useValue: mockPatientServices },
                { provide: DomSanitizer, useValue: sanitizerSpy },
                { provide: 'localize', useValue: mockLocalizeService},
                { provide: FeeScheduleUpdateModalRef, useValue: mockDialogRef },
                { provide: FeeScheduleUpdateModalService, useValue: mockFeeScheduleUpdateModalService },      
            ],
            imports: [
                TranslateModule.forRoot(),// Required import for componenets that use ngx-translate in the view or componenet code   
                NoopAnimationsModule,
                OverlayModule, DropDownsModule, FormsModule
            ],
            declarations: [BulkPaymentComponent, MockAppDatePickerComponent, MockAccessBasedLocationSelectorComponent,
                SearchBarAutocompleteComponent, SearchBarAutocompleteByIdComponent, CurrencyInputComponent, ClaimPaymentTableComponent, MockAppButtonComponent
                , MockAppLabel, MockAppIconButton, MockInsuranceTypesDropdown, MockSideDrawerComponent,PaypageModalComponent]
        })
            .compileComponents();

        mockOverlayService = TestBed.get(Overlay);
    });


    beforeEach(waitForAsync
        (() => {
            fixture = TestBed.createComponent(BulkPaymentComponent);
            component = fixture.componentInstance;
            fixture.detectChanges();
        }));

    it('should create', () => {

        spyOn(component, 'processCarriers').and.callFake((any: any) => { });
        expect(mockBusinessCenterServices.Carrier.get).toHaveBeenCalled();
        expect(component).toBeTruthy();
    });

    describe('apply method ->', () => {
        beforeEach(() => {
            mockPatientInsurancePaymentFactory.applyInsurancePayments = jasmine.createSpy().and.callFake((param: any) => {
                return param;
            });
            spyOn(component, 'applyCreditCardPayment').and.callFake(() => { });
            component.isPaymentProviderEnabled = true;
            component.currentLocation = { LocationId: 3, NameLine1: 'testLocation', IsPaymentGatewayEnabled: 'true', MerchantId: '1' };
            component.selectedPaymentType = { PaymentTypeId: 1, CurrencyTypeId: 1 };
            component.filter.PaymentGatewayTransactionId = null;
            component.validate = jasmine.createSpy().and.returnValue(true);
        });

        it('should round values', () => {
            component.totalForServices = 1.234;
            component.unappliedAmount = 1.236;
            component.validate = jasmine.createSpy().and.returnValue(false);
            component.apply();
            expect(component.totalForServices).toBe(1.23);
            expect(component.unappliedAmount).toBe(1.24);
        });

        it('should call PatientInsurancePaymentFactory.applyInsurancePayments when isEra is true and valid', () => {
            component.isEra = true;
            component.totalForServices = 0;
            component.unappliedAmount = 0;
            component.filter.InsurancePaymentTypeId = 1;
            component.apply();
            expect(mockPatientInsurancePaymentFactory.applyInsurancePayments).toHaveBeenCalled();
        });

        it('should call PatientInsurancePaymentFactory.applyInsurancePayments when not a new Credit Card payment and valid', () => {
            component.totalForServices = 0;
            component.unappliedAmount = 0;
            component.filter.InsurancePaymentTypeId = 1;
            component.apply();
            expect(mockPatientInsurancePaymentFactory.applyInsurancePayments).toHaveBeenCalled();
        });

        it('should not call PatientInsurancePaymentFactory.applyInsurancePayments when invalid', () => {
            component.totalForServices = 0;
            component.unappliedAmount = 0;
            component.validate = jasmine.createSpy().and.returnValue(false);
            component.apply();
            expect(mockPatientInsurancePaymentFactory.applyInsurancePayments).not.toHaveBeenCalled();
        });

        it('should call applyCreditCardPayment when valid and location is OpenEdgeEnabled and this is a new Credit Card payment ', () => {
            component.filter.PaymentGatewayTransactionId = null;
            component.selectedPaymentType.CurrencyTypeId = 3;
            component.apply();
            expect(component.applyCreditCardPayment).toHaveBeenCalled();
        });

        it('should PatientInsurancePaymentFactory.applyInsurancePayments if valid and is an existing unapplied CreditCard payment', () => {
            component.filter.PaymentGatewayTransactionId = 1234
            component.selectedPaymentType.CurrencyTypeId = 3;
            component.apply();
            expect(component.applyCreditCardPayment).not.toHaveBeenCalled();
            expect(mockPatientInsurancePaymentFactory.applyInsurancePayments).toHaveBeenCalled();
        });

        it('should set PaymentAmount to 0 when PaymentAmount is null and FinalPayment is true', () => {
            component.filter.PaymentGatewayTransactionId = 1234
            component.insurancePayments = [{ PaymentAmount: null, FinalPayment: true }]
            component.apply();
            expect(component.applyCreditCardPayment).not.toHaveBeenCalled();
            expect(mockPatientInsurancePaymentFactory.applyInsurancePayments).toHaveBeenCalledWith(jasmine.any(Object), jasmine.arrayContaining([{ PaymentAmount: 0, FinalPayment: true }]), jasmine.any(Object), jasmine.any(Function), jasmine.any(Function));
        });

        it('should set disableApplyButton to true if validate returns true', () => {   
            component.disableApplyButton=false;       
            component.validate = jasmine.createSpy().and.returnValue(true);
            component.apply();
            expect(component.disableApplyButton).toBe(true);
        });

        it('should set disableApplyButton to false if validate returns false', () => {   
            component.disableApplyButton=false;       
            component.validate = jasmine.createSpy().and.returnValue(false);
            component.apply();
            expect(component.disableApplyButton).toBe(false);
        });
    });

    describe('component.applyPayment', () => {
        beforeEach(() => {
            component.currentLocation = { LocationId: 3, NameLine1: 'testLocation' };
            component.filter = {
                DateEntered: new Date(),
                Carrier: { CarrierId: 123 },
                InsurancePaymentTypeId: 999,
                Amount: 10,
                BulkCreditTransactionType: 1,
                PaymentTypePromptValue: null,
                Note: null,
                PayerId: '',
                EraId: '',
                Locations: [],
                PaymentGatewayTransactionId: null,
                UpdatedEstimates: []
            };
            component.selectedPaymentType = { CurrencyTypeId: 3 };
            component.locations = [{ LocationId: 3, NameLine1: 'testLocation' }];
            component.selectedCarrierName = 'selectedCarrier';
        });

        it('should call createCreditForBulkInsurance with CarrierId of null if filter.Carrier is null', () => {
            component.filter.PayerId = '12345';
            component.filter.Carrier = null;
            component.currentLocation.IsPaymentGatewayEnabled= true;
            component.showPaymentProvider=false;
            component.applyPayment();
            expect(component.waitOverlay).toEqual(component.getCardTransactionOverlay());
            expect(mockPaymentGatewayService.createCreditForBulkInsurance.calls.first().args[0]).toEqual(null);
            expect(mockPaymentGatewayService.createCreditForBulkInsurance.calls.first().args[1]).toEqual('12345');
        });

        it('should call createPaymentProviderCreditForBulkInsurance and PayPage endpoint when Transaction UI is enabled for selected location', () => {
            component.filter.PayerId = '12345';
            component.filter.Carrier = null;
            component.currentLocation.IsPaymentGatewayEnabled= true;
            component.currentLocation.PaymentProvider = PaymentProvider.TransactionsUI;
            component.showPaymentProvider = true;
            component.applyPayment();
            expect(mockPaymentGatewayService.createPaymentProviderCreditForBulkInsurance).toHaveBeenCalled();
            expect(mockPatientServices.CreditTransactions.payPageRequest).toHaveBeenCalled();
            expect(component.showPayPageModal).toBe(true);

        });

        it('should not call createPaymentProviderCreditForBulkInsurance and PayPage endpoint when GPI feature flag is disabled', () => {
            component.filter.PayerId = '12345';
            component.filter.Carrier = null;
            component.currentLocation.IsPaymentGatewayEnabled= true;
            component.currentLocation.PaymentProvider = PaymentProvider.TransactionsUI;
            component.showPaymentProvider = false;
            component.applyPayment();
            expect(mockPaymentGatewayService.createPaymentProviderCreditForBulkInsurance).not.toHaveBeenCalled();
            expect(mockPatientServices.CreditTransactions.payPageRequest).not.toHaveBeenCalled();

        });
        
        it('should not call createPaymentProviderCreditForBulkInsurance and PayPage endpoint when selected location have OE', () => {
            component.filter.PayerId = '12345';
            component.filter.Carrier = null;
            component.currentLocation.IsPaymentGatewayEnabled= true;
            component.currentLocation.PaymentProvider = PaymentProvider.OpenEdge;
            component.showPaymentProvider = true;
            component.applyPayment();
            expect(mockPaymentGatewayService.createPaymentProviderCreditForBulkInsurance).not.toHaveBeenCalled();
            expect(mockPatientServices.CreditTransactions.payPageRequest).not.toHaveBeenCalled();

        });

        it('should not call createPaymentProviderCreditForBulkInsurance and PayPage endpoint when selected location have payment Gateway disabled', () => {
            component.filter.PayerId = '12345';
            component.filter.Carrier = null;
            component.currentLocation.IsPaymentGatewayEnabled= false ;
            component.currentLocation.PaymentProvider = null;
            component.showPaymentProvider = true;
            component.applyPayment();
            expect(mockPaymentGatewayService.createPaymentProviderCreditForBulkInsurance).not.toHaveBeenCalled();
            expect(mockPatientServices.CreditTransactions.payPageRequest).not.toHaveBeenCalled();

        });

    });

    describe('component.applyCreditCardPayment', () => {
        beforeEach(() => {
            component.currentLocation = { LocationId: 3, NameLine1: 'testLocation' };
            spyOn(component, 'applyPayment');
            component.selectedCarrierName = 'selectedCarrier';
        });



        it('should not display modal if user.ShowCardServiceDisabledMessage is true and isPaymentProviderEnabled is true', () => {
            component.isPaymentProviderEnabled = true;
            let mockUser = {
                Value: {
                    ShowCardServiceDisabledMessage: false
                }
            };

            mockUserServices.Users.get = jasmine.createSpy().and.returnValue({
                $promise: { then: (success, failure) => success(mockUser) }
            });
            component.applyCreditCardPayment();
            expect(mockUserServices.Users.get).toHaveBeenCalled();
            expect(component.applyPayment).toHaveBeenCalled();
            expect(mockModalFactory.CardServiceDisabledModal).not.toHaveBeenCalled();

        });

        it('should not display modal if user.ShowCardServiceDisabledMessage is false and isPaymentProviderEnabled is false ', () => {

            component.isPaymentProviderEnabled = false;
            let mockUser = {
                Value: {
                    ShowCardServiceDisabledMessage: false
                }
            };
            mockUserServices.Users.get = jasmine.createSpy().and.returnValue({
                $promise: { then: (success, failure) => success(mockUser) }
            });
            component.applyCreditCardPayment();
            expect(mockUserServices.Users.get).toHaveBeenCalled();
            expect(mockModalFactory.CardServiceDisabledModal).not.toHaveBeenCalled();
            expect(mockPatientInsurancePaymentFactory.applyInsurancePayments).toHaveBeenCalled();
        });

        it('should display modal if user.ShowCardServiceDisabledMessage is true and isPaymentProviderEnabled is false', () => {
            let mockUser = {
                Value: {
                    ShowCardServiceDisabledMessage: true
                }
            };

            component.isPaymentProviderEnabled = false;
            mockUserServices.Users.get = jasmine.createSpy().and.returnValue({
                $promise: { then: (success, failure) => success(mockUser) }
            });
            component.applyCreditCardPayment();
            expect(mockUserServices.Users.get).toHaveBeenCalled();
            expect(mockModalFactory.CardServiceDisabledModal).toHaveBeenCalled();
        });

    });

    describe('component.applyInsurancePaymentsFailure ->', () => {

        beforeEach(() => {
            component.selectedPaymentType = { PaymentTypeId: 1, CurrencyTypeId: 1 };
            spyOn(component, 'handleUnappliedPaymentProviderPayment').and.callFake(async () => { });
        });

        it('should call toastrFactory.error with generic message if error.data.InvalidProperties not claim.IsClosed ', () => {
            let error = { data: { InvalidProperties: [] } };
            component.applyInsurancePaymentsFailure(error);
            expect(mockToastrFactory.error).toHaveBeenCalledWith('An error has occurred while applying payment.', 'Error');
        });

        it('should call toastrFactory.error with specific message if error.data.InvalidProperties has claim.IsClosed InvalidProperty ', () => {
            let error = { data: { InvalidProperties: [{ PropertyName: 'claim.IsClosed' }] } };
            component.applyInsurancePaymentsFailure(error);
            expect(mockToastrFactory.error).toHaveBeenCalledWith('Failed to apply insurance payment - claim has already been closed.');
        });

        it('should call handleUnappliedPaymentProviderPayment if this is a Credit Card Payment (CurrencyTypeId 3) and isPaymentProviderEnabled', () => {
            component.isPaymentProviderEnabled = true;
            component.selectedPaymentType.CurrencyTypeId = 3;
            let error = { data: { InvalidProperties: [] } };
            component.applyInsurancePaymentsFailure(error);
            expect(component.handleUnappliedPaymentProviderPayment).toHaveBeenCalled();
        });

        it('should not call handleUnappliedPaymentProviderPayment if this is a Credit Card Payment (CurrencyTypeId 3) and isPaymentProviderEnabled is false', () => {
            component.isPaymentProviderEnabled = false;
            component.selectedPaymentType.CurrencyTypeId = 3;
            let error = { data: { InvalidProperties: [] } };
            component.applyInsurancePaymentsFailure(error);
            expect(component.handleUnappliedPaymentProviderPayment).not.toHaveBeenCalled();
        });

        it('should set disableApplyButton to false', () => {
            component.disableApplyButton = true;
            component.isPaymentProviderEnabled = false;
            component.selectedPaymentType.CurrencyTypeId = 3;
            let error = { data: { InvalidProperties: [] } };
            component.applyInsurancePaymentsFailure(error);
            expect(component.disableApplyButton).toBe(false);
        });

    });

    describe('component.distributePaymentAmount method ->', () => {
        let data: ClaimPaymentAmountBlurEvent = { amount: -1, claim: {}, changeDetectorRef: mockChangeDetectorRef };
        beforeEach(() => {
            spyOn(component, 'validate').and.callFake(() => { return true });
            data = { amount: -1, claim: {}, changeDetectorRef: mockChangeDetectorRef };
            component.distributedDetailsLoading = false;
            mockPatientInsurancePaymentFactory.distributeAmountToServices = jasmine.createSpy().and.callFake((param: any) => {
                return param;
            });
        });

        it('should set distributedDetailsLoading to true and call supporting methods if called with claim and amount > 0', () => {
            data.amount = 10;
            data.claim = {};
            component.distributePaymentAmount(data);
            expect(component.distributedDetailsLoading).toBe(true);
            expect(component.validate).toHaveBeenCalled();
            expect(mockPatientInsurancePaymentFactory.distributeAmountToServices).toHaveBeenCalledWith(data.amount, [data.claim], jasmine.any(Function), jasmine.any(Function));
        });

        it('should do nothing when amount is less than 0', () => {
            data.amount = -1;
            component.distributePaymentAmount(data);
            expect(component.validate).not.toHaveBeenCalled();
            expect(mockPatientInsurancePaymentFactory.distributeAmountToServices).not.toHaveBeenCalled();
            expect(component.distributedDetailsLoading).toBe(false);
        });

        it('should do nothing when claim does not exist', () => {
            data.claim = undefined;
            component.distributePaymentAmount(data);
            expect(component.validate).not.toHaveBeenCalled();
            expect(mockPatientInsurancePaymentFactory.distributeAmountToServices).not.toHaveBeenCalled();
            expect(component.distributedDetailsLoading).toBe(false);
        });
    });


    describe('component.navToPatientProfile ->', () => {

        beforeEach(() => {

        });

        // NG15CLEANUP  can fix incrementally after merge to DEV
        // Error: describe with no children (describe() or it()):  NOTE these were previously commented out
        // TODO revisit these
        it('should launch patient location error modal when user is not authorized to patient location', () => {
            var personId = 'b9ac5c40-8079-4422-8d83-d3b36c67241b';
            //component.navToPatientProfile(personId);
            //expect(mockPersonFactory.getById).toHaveBeenCalled();
            //expect(mockPatientValidationFactory.PatientSearchValidation).toHaveBeenCalled();
            //expect(mockPatientValidationFactory.LaunchPatientLocationErrorModal).toHaveBeenCalled();
        });
        it('should should call SaveMostRecentPerson when user is authorized to patient location', () => {
            var personId = 'b9ac5c40-8079-4422-8d83-d3b36c67241b';
            patientLocationAuthorization = { authorization: { UserIsAuthorizedToAtLeastOnePatientLocation: true } };
            //component.navToPatientProfile(personId);
            //expect(mockPersonFactory.getById).toHaveBeenCalled();
            //expect(mockPatientValidationFactory.PatientSearchValidation).toHaveBeenCalled();
            //expect(mockGlobalSearchFactory.SaveMostRecentPerson).toHaveBeenCalledWith(personId);
        });
        it('should should call location.search with newTab when user is authorized to patient location', () => {
            var personId = 'b9ac5c40-8079-4422-8d83-d3b36c67241b';
            patientLocationAuthorization = { authorization: { UserIsAuthorizedToAtLeastOnePatientLocation: true } };
            //component.navToPatientProfile(personId);
            //expect($locationMock.search).toHaveBeenCalledWith('newTab', null);
        });
    });

    describe('component.distributePaymentSuccess method ->', () => {
        beforeEach(() => {
            spyOn(component, 'validate');
            spyOn(component, 'checkClaimsForServicesErrors');
        });
        it('should validate insurance payments', () => {
            component.insurancePayments = [];
            component.distributePaymentAmountSuccess(mockChangeDetectorRef);
            expect(component.distributedDetailsLoading).toBe(false);

            expect(component.validate).toHaveBeenCalled();
            expect(component.checkClaimsForServicesErrors).toHaveBeenCalled();
            expect(mockChangeDetectorRef.markForCheck).toHaveBeenCalled();
        });
    });


    describe('component.serviceAmountBlurEvent method ->', () => {
        let data = { claim: null, service: null }
        beforeEach(() => {
            spyOn(component, 'validate');
            let data = { claim: null, service: null }
        });
        it('does nothing for null claim', () => {
            component.serviceAmountBlurEvent(data);
            expect(component.validate).not.toHaveBeenCalled();
        });

        it('should set data.service.$$hasError to true if service Charges minus TotalInsurancePayments is less PaymentAmount', () => {
            component.insurancePayments = [];
            let data = {
                claim: {
                    ServiceTransactionToClaimPaymentDtos: [
                        { PaymentAmount: 1.10 },
                        { PaymentAmount: 2.20 }
                    ],
                    PaymentAmount: 3.30
                },
                service: { Charges: 2.20, TotalInsurancePayments: 1.10, PaymentAmount: 1.20, $$hasError: false }
            }
            component.serviceAmountBlurEvent(data);
            expect(data.service.$$hasError).toBe(true);

        });

        it('should set data.service.$$hasError to false if service Charges minus TotalInsurancePayments is more than or equal PaymentAmount', () => {
            component.insurancePayments = [];
            let data = {
                claim: {
                    ServiceTransactionToClaimPaymentDtos: [
                        { PaymentAmount: 1.10 },
                        { PaymentAmount: 2.20 }
                    ],
                    PaymentAmount: 3.30
                },
                service: { Charges: 2.20, TotalInsurancePayments: 1.10, PaymentAmount: 1.10, $$hasError: false }
            }
            component.serviceAmountBlurEvent(data);
            expect(data.service.$$hasError).toBe(false);

        });

        it('should set claim.$$servicesHaveErrors to true if any service has $$hasError equal true', () => {
            component.insurancePayments = [];
            let data = {
                claim: {
                    $$servicesHaveErrors: false,
                    ServiceTransactionToClaimPaymentDtos: [
                        { PaymentAmount: 1.10, $$hasError: false },
                        { PaymentAmount: 2.20, $$hasError: true }
                    ],
                    PaymentAmount: 3.30
                },
                service: { Charges: 2.20, TotalInsurancePayments: 1.10, PaymentAmount: 1.20, $$hasError: false }
            }
            component.serviceAmountBlurEvent(data);
            expect(data.claim.$$servicesHaveErrors).toBe(true);

        });
    });


    describe('component.finalPaymentChangeEvent method ->', () => {
        let claim;
        beforeEach(() => {
            component.canEditAllowedAmount = false;
            claim = {
                ServiceTransactionToClaimPaymentDtos: [
                    { PaymentAmount: 1.10 },
                    { PaymentAmount: 2.20 }
                ],
                PaymentAmount: 3.30
            };
            mockInsurancePaymentIsValidPipe.transform = jasmine.createSpy().and.callFake((param: any) => {
                return param;
            });
        });
        it('validates insurance payments', () => {
            component.insurancePayments = [];
            component.finalPaymentChangeEvent(claim);
            expect(mockInsurancePaymentIsValidPipe.transform).toHaveBeenCalled();
        });
    });

    describe('component.processUnappliedAmount method ->', () => {
        it('sets correct values', () => {
            component.filter.Amount = 1.00;
            component.insurancePayments = [
                { PaymentAmount: 1.10 },
                { PaymentAmount: 2.20 }
            ];
            component.processUnappliedAmount();
            expect(component.totalForServices.toFixed(2)).toBe('3.30');
            expect(component.unappliedAmount.toFixed(2)).toBe('-2.30');
        });
    });

    describe('component.validate method ->', () => {
        beforeEach(() => {
            spyOn(component, 'processUnappliedAmount').and.callFake(() => { return true });
        });
        it('returns true for valid case', () => {
            component.unappliedAmount = 0;
            component.filter.DateEntered = new Date();
            component.filter.InsurancePaymentTypeId = 1;
            var result = component.validate();
            expect(component.processUnappliedAmount).toHaveBeenCalled();
            expect(result).toBe(true);
        });

        it('validates unapplied amount', () => {
            component.unappliedAmount = 1;
            component.filter.DateEntered = new Date();
            component.filter.InsurancePaymentTypeId = 1;
            var result = component.validate();
            expect(component.processUnappliedAmount).toHaveBeenCalled();
            expect(result).toBe(false);
        });

        it('validates date entered', () => {
            component.unappliedAmount = 0;
            component.filter.DateEntered = null;
            component.filter.InsurancePaymentTypeId = 1;
            var result = component.validate();
            expect(component.processUnappliedAmount).toHaveBeenCalled();
            expect(result).toBe(false);
        });

        it('validates insurancePaymentTypeId', () => {
            component.unappliedAmount = 0;
            component.filter.DateEntered = new Date();
            component.filter.InsurancePaymentTypeId = null;
            var result = component.validate();
            expect(component.processUnappliedAmount).toHaveBeenCalled();
            expect(result).toBe(false);
        });

        it('flags initial ERA distribution errors correctly', function () {
            component.isEra = true;
            component.insurancePayments = [
                { // good, within a penny
                    PaymentAmount: 100.00,
                    ServiceTransactionToClaimPaymentDtos: [
                        { PaymentAmount: 45.00 },
                        { PaymentAmount: 55.009 }
                    ]
                },
                { // bad
                    PaymentAmount: 55.00,
                    ServiceTransactionToClaimPaymentDtos: [
                        { PaymentAmount: 25.00 },
                        { PaymentAmount: 20.00 }
                    ]
                }
            ];
            component.validate();
            expect(component.hasEraInitialDistributionError).toBe(true);
            expect(component.eraDistributionErrorPaymentAmount).toBe(55.00);
            expect(component.eraDistributionErrorServiceTotal).toBe(45.00);
            expect(component.insurancePayments[0].highlightAmountError).toBe(false);
            expect(component.insurancePayments[1].highlightAmountError).toBe(true);
        });

        describe('processCarriers method ->', () => {
            it('sets component values', () => {
                let mockCarriers: CarrierDto[] = [];
                var res = { Value: mockCarriers };
                component.processCarriers(res.Value);
                mockCarriers.forEach(carrier => {
                    expect(mockCarrierLongLabelPipe.transform).toHaveBeenCalled();
                })
                expect(component.carriers).toBe(res.Value);
                expect(component.filteredCarrierList).toEqual(res.Value);
            });
        });
    });

    describe('component.selectCarrier method ->', () => {
        beforeEach(() => {
            spyOn(component, 'cancelPayment');
            component.filteredCarrierList = [
                { CarrierId: '1', Name: 'Carrier1', PayerId: null, SearchType: '' },
                { CarrierId: '2', Name: 'Carrier2', PayerId: '1234', SearchType: 'payerIdSearch' },
                { CarrierId: '3', Name: 'Carrier3', PayerId: null, SearchType: '' },
                { CarrierId: '4', Name: 'Carrier3', PayerId: null, SearchType: '' }
            ];
            spyOn(component, 'getClaimsList')
        });

        it('should set filter.PayerId and selectedCarrierName based on PayerId and reset filter.Carrier if SearchType is payerIdSearch', () => {
            component.filter.Carrier = {};

            component.selectCarrier('2');
            expect(component.filter.PayerId).toBe('1234');
            expect(component.selectedCarrierName).toBe('1234');
            expect(component.filter.Carrier).toBeNull();
        });

        it('should set selectedCarrierName and filter.Carrier based on PayerId if SearchType is not payerIdSearch', () => {
            component.filter.PayerId = "12345";

            component.selectCarrier('3');
            expect(component.filter.Carrier).toBe(component.filteredCarrierList[2]);
            expect(component.filter.PayerId).toBe('');
            expect(component.selectedCarrierName).toBe('Carrier3');
        });

        it('should call cancelPayment if param is empty (indicates Carrier removed)', () => {
            component.selectCarrier('');
            expect(component.cancelPayment).toHaveBeenCalled();
        });

        it('should set selectedCarrierName and filter.Carrier and reset PayerId when carriers have identical names', () => {
            component.filter.PayerId = "12345";

            component.selectCarrier('4');
            expect(component.filter.Carrier).toBe(component.filteredCarrierList[3]);
            expect(component.filter.PayerId).toBe('');
            expect(component.selectedCarrierName).toBe('Carrier3');
        });
        it('should not reset component.selectedPaymentTypeId if IsEra is true', () => {
            component.filter.PayerId = "12345";
            component.selectedPaymentTypeId = 5;
            component.isEra = true;
            component.selectCarrier('4');
            expect(component.selectedPaymentTypeId).toBe(5);
        });

        it('should reset component.selectedPaymentTypeId if IsEra is false', () => {
            component.filter.PayerId = "12345";
            component.selectedPaymentTypeId = 5;
            component.isEra = false;
            component.selectCarrier('4');
            expect(component.selectedPaymentTypeId).toBe(0);
        });
    });

    describe('component.locationChange method when disableLocationSelector is true->', () => {
        beforeEach(() => {            
            spyOn(component, 'clearPaymentAndDistribution');
            spyOn(component, 'clearDistribution');
            spyOn(component, 'getClaimsList')
            component.filteredCarrierList = [
                { CarrierId: '1', Name: 'Carrier1', PayerId: null, SearchType: '' },
                { CarrierId: '2', Name: 'Carrier2', PayerId: '1234', SearchType: 'payerIdSearch' },
                { CarrierId: '3', Name: 'Carrier3', PayerId: null, SearchType: '' },];
            component.disableLocationSelector = true;
        });
        it('does nothing if disableLocationSelector is true', () => {
            component.disableLocationSelector = true;
            component.locationChange();
            expect(component.getClaimsList).not.toHaveBeenCalled();
        });
    });



    describe('component.locationChange method when component.disableLocationSelector is false->', () => {
        beforeEach(() => {            
            spyOn(component, 'clearPaymentAndDistribution');
            spyOn(component, 'clearDistribution');
            spyOn(component, 'getClaimsList')
            component.filteredCarrierList = [
                { CarrierId: '1', Name: 'Carrier1', PayerId: null, SearchType: '' },
                { CarrierId: '2', Name: 'Carrier2', PayerId: '1234', SearchType: 'payerIdSearch' },
                { CarrierId: '3', Name: 'Carrier3', PayerId: null, SearchType: '' },];
            component.disableLocationSelector = false;
        });        

        it('should call clearPaymentAndDistribution', () => {
            component.disableLocationSelector = false;
            component.locationChange();
            expect(component.clearPaymentAndDistribution).toHaveBeenCalled();
        });

        it('should call clearPaymentAndDistribution if selectedUnappliedBulkInsurancePayment is null', () => {
            component.selectedUnappliedBulkInsurancePayment = null;
            component.locationChange();
            expect(component.clearPaymentAndDistribution).toHaveBeenCalled();
        });
        it('should not call clearPaymentAndDistribution if selectedUnappliedBulkInsurancePayment is not null', () => {
            component.selectedUnappliedBulkInsurancePayment = sampleUnappliedPayment;
            component.locationChange();
            expect(component.clearPaymentAndDistribution).not.toHaveBeenCalled();
        });

        it('does call geClaimmsList if routeParams.EraId is null and selectedUnappliedBulkInsurancePayment is not null', () => {
            component.selectedUnappliedBulkInsurancePayment = sampleUnappliedPayment
            component.locationChange();
            expect(component.getClaimsList).toHaveBeenCalled();
        });

        it('should call clearDistribution if selectedUnappliedBulkInsurancePayment is not null', () => {
            component.selectedUnappliedBulkInsurancePayment = sampleUnappliedPayment;
            component.locationChange();
            expect(component.clearDistribution).toHaveBeenCalled();
        });

        it('should call clearDistribution if selectedUnappliedBulkInsurancePayment is null', () => {
            component.selectedUnappliedBulkInsurancePayment = null;
            component.locationChange();
            expect(component.clearDistribution).not.toHaveBeenCalled();
        });

    });

    describe('component.getClaimsList method when filter.CarrierId is not null ->', () => {
        beforeEach(() => {
            spyOn(component, 'processClaims').and.callFake((param: any) => {
                return param;
            });
        });

        it('should call mockSoarBulkPaymentHttpService.requestClaimsListByCarrierId if component.validate returns true and filter.CarrierId', () => {
            spyOn(component, 'validateFilter').and.returnValue(true);
            component.filter.Carrier = { CarrierId: '1' };
            component.filter.PayerId = '';
            component.filter.Locations = [1, 2]
            component.getClaimsList();
            expect(mockSoarBulkPaymentHttpService.requestClaimsListByCarrierId).toHaveBeenCalled();
        });
    });

    describe('component.getClaimsList method when filter.CarrierId is null ->', () => {
        beforeEach(() => {
            spyOn(component, 'processClaims').and.callFake((param: any) => {
                return param;
            });
        });

        it('should call mockSoarBulkPaymentHttpService.requestClaimsListByPayerId if component.validate returns true and filter.CarrierId is null and filter.PayerId is not empty ', () => {
            spyOn(component, 'validateFilter').and.returnValue(true);
            component.filter.Carrier = null;
            component.filter.PayerId = '1234';
            component.filter.Locations = [1, 2]
            component.getClaimsList();
            expect(mockSoarBulkPaymentHttpService.requestClaimsListByPayerId).toHaveBeenCalled();
        });
    });


    describe('component.getClaimsList method when validateFilter returns false ->', () => {
        beforeEach(() => {
            spyOn(component, 'processClaims').and.callFake((param: any) => {
                return param;
            });
        });

        it('should not call claims service if component.validate returns false', () => {
            spyOn(component, 'validateFilter').and.returnValue(false);
            component.getClaimsList();
            expect(mockSoarBulkPaymentHttpService.requestClaimsListByCarrierId).not.toHaveBeenCalled();
            expect(mockSoarBulkPaymentHttpService.requestClaimsListByPayerId).not.toHaveBeenCalled();
        });
    });



    describe('component.clearContent method ->', () => {
        it('clears Carrier property on filter', () => {
            component.filter.Carrier = { CarrierId: 1 };
            component.clearContent();
            expect(component.filter.Carrier).toEqual({});
        });
    });

    describe('component.filterCarriers method ->', () => {
        beforeEach(() => {
            component.carriers = [
                { CarrierId: '1', Name: 'Carrier1', PayerId: null, SearchType: '', LongLabel: 'Carrier1LongLabel', IsActive: true, AddressLine1: '', AddressLine2: '', City: '', State: '', Zip: '', PhoneNumbers: [] },
                { CarrierId: '2', Name: 'Carrier2', PayerId: '12345', SearchType: 'payerIdSearch', LongLabel: 'Carrier2LongLabel', IsActive: true, AddressLine1: '', AddressLine2: '', City: '', State: '', Zip: '', PhoneNumbers: [] },
                { CarrierId: '3', Name: 'Carrier3', PayerId: null, SearchType: '', LongLabel: 'Carrier3LongLabel', IsActive: true, AddressLine1: '', AddressLine2: '', City: '', State: '', Zip: '', PhoneNumbers: [] },
            ];
            spyOn(component, 'processClaims').and.callFake((param: any) => {
                return param;
            });
        });

        it('should filter carriers based on LongLabel match to item', () => {
            var item = 'rier2';
            component.filterCarriers(item);
            expect(component.filteredCarrierList).toEqual([component.carriers[1]]);
        });
    });

    describe('component.filterCarriers method if item matches PayerId ->', () => {
        beforeEach(() => {
            component.carriers = [
                { CarrierId: '1', Name: 'Carrier1', PayerId: null, SearchType: '', LongLabel: 'Carrier1LongLabel', IsActive: true, AddressLine1: '', AddressLine2: '', City: '', State: '', Zip: '', PhoneNumbers: [] },
                { CarrierId: '2', Name: 'Carrier2', PayerId: '12345', SearchType: 'payerIdSearch', LongLabel: 'Carrier2LongLabel', IsActive: true, AddressLine1: '', AddressLine2: '', City: '', State: '', Zip: '', PhoneNumbers: [] },
                { CarrierId: '3', Name: 'Carrier3', PayerId: null, SearchType: '', LongLabel: 'Carrier3LongLabel', IsActive: true, AddressLine1: '', AddressLine2: '', City: '', State: '', Zip: '', PhoneNumbers: [] },
            ];
            spyOn(component, 'processClaims').and.callFake((param: any) => {
                return param;
            });
        });

        it('should add PayerId based selection to filteredCarrierList if item matches PayerId', () => {
            var item = '12345';
            component.filterCarriers(item);
            expect(component.filteredCarrierList).toContain({ LongLabel: 'All Submitted Claims with Payer ID: 12345', SearchType: 'payerIdSearch', Name: '12345', CarrierId: '12345', PayerId: '12345', AddressLine1: '', AddressLine2: '', City: '', State: '', Zip: '', PhoneNumbers: [], IsActive: true });
        });
    });

    describe('component.processEra method ->', () => {
        let eraClaimPayments;
        beforeEach(() => {
            spyOn(component, 'validate').and.callFake(() => { return true });

            eraClaimPayments = {
                ClaimPayments: [],
                LocationIds: [],
                Era: {
                    EraHeaderId: 1234,
                    Amount: 200,
                    PaymentNumber: '2345',
                    CarrierName: 'Carrier1',
                    EraClaimPayments: [],
                    IsAssociatedWithBulk: true,
                    IsProcessed: false,
                    ContainsAllPredeterminations: false,
                    CurrencyType: null,
                    expanded: false,
                    PaymentString: 'string',
                    claimOrder: { sortColumnName: 'string', sortDirection: 1 },
                    items: [],
                }
            };
            spyOn(component, 'applyEraToGrid');
            spyOn(component, 'applyEraLocation');
            spyOn(component, 'applyEraCarrier');
            spyOn(component, 'applyEraPaymentType');
            component.insurancePayments = [];
            routeParams.EraId = 4;
            component.filter.DateEntered = new Date();
            component.filter.BulkCreditTransactionType = 1;
        });
        it('sets relevant variables', () => {
            component.processEra(eraClaimPayments);
            expect(component.applyEraToGrid).toHaveBeenCalledWith(eraClaimPayments.ClaimPayments);
            expect(component.applyEraLocation).toHaveBeenCalledWith(eraClaimPayments.LocationIds);
            expect(component.applyEraCarrier).toHaveBeenCalledWith(eraClaimPayments.Era);
            expect(component.applyEraPaymentType).toHaveBeenCalledWith(eraClaimPayments.Era.CurrencyType);
            expect(component.validate).toHaveBeenCalled();

            //expect(component.filter.Amount).toEqual(eraClaimPayments.Era.Amount);
            expect(component.filter.EraId).toEqual(routeParams.EraId);
            expect(component.filter.BulkCreditTransactionType).toEqual(3);
        });


    });

    describe('component.getEra method ->', () => {
        beforeEach(() => {
            spyOn(component, 'processEra');
        });

        it('should call eraService.requestEraClaimPayments with eraId', () => {
            var id = '12345';
            component.getEra(id);
            expect(mockEraService.requestEraClaimPayments).toHaveBeenCalledWith({ eraId: id });
        });
    });

    describe('component.processEra method ->', () => {
        beforeEach(() => {
            spyOn(component, 'applyEraToGrid').and.callFake((any: any) => { });
            spyOn(component, 'applyEraLocation').and.callFake((any: any) => { });
            spyOn(component, 'applyEraCarrier').and.callFake((any: any) => { });
            spyOn(component, 'applyEraPaymentType').and.callFake((any: any) => { });
            component.validate = jasmine.createSpy().and.returnValue(true);

            mockInsurancePaymentIsValidPipe.transform = jasmine.createSpy().and.callFake((param: any) => {
                return param;
            });
        });

        it('should call child methods ', () => {
            const eraClaimPayments: EraPaymentDto = {
                Era: {
                    EraHeaderId: 12345, Amount: 100, PaymentNumber: '2345', CarrierName: 'CarrierName1',
                    EraClaimPayments: [],
                    IsAssociatedWithBulk: false, IsProcessed: false, ContainsAllPredeterminations: false, canView: false, tooltip: '',
                    CurrencyType: 12 as CurrencyType, expanded: false, PaymentString: '', claimOrder: { sortColumnName: '', sortDirection: 1 },
                    items: [
                        { label: 'string', click: 'string' }],
                    IsAutoMatched: true,
                    EraPayerName: null,
                    Paid: 100
                },
                ClaimPayments: [],
                LocationIds: [],
                PaidTotal:100
            };
            component.processEra(eraClaimPayments)
            expect(component.applyEraToGrid).toHaveBeenCalledWith(eraClaimPayments.ClaimPayments);
            expect(component.applyEraLocation).toHaveBeenCalledWith(eraClaimPayments.LocationIds);
            expect(component.applyEraCarrier).toHaveBeenCalledWith(eraClaimPayments.Era);
            expect(component.applyEraPaymentType).toHaveBeenCalledWith(eraClaimPayments.Era.CurrencyType);
            expect(component.validate).toHaveBeenCalled();
        });

        it('should set filter.PaymentTypePromptValue to no more than 25 char based on Era.PaymentNumber', () => {
            const eraClaimPayments: EraPaymentDto = {
                Era: {
                    EraHeaderId: 12345, Amount: 100, PaymentNumber: '123456789123456789123456789', CarrierName: 'CarrierName1',
                    EraClaimPayments: [],
                    IsAssociatedWithBulk: false, IsProcessed: false, ContainsAllPredeterminations: false, canView: false, tooltip: '',
                    CurrencyType: 12 as CurrencyType, expanded: false, PaymentString: '', claimOrder: { sortColumnName: '', sortDirection: 1 },
                    items: [
                        { label: 'string', click: 'string' }],
                    IsAutoMatched: true,
                    EraPayerName: null,
                    Paid: 100
                },
                ClaimPayments: [],
                LocationIds: [],
                PaidTotal:100
            };
            component.processEra(eraClaimPayments)
            expect(component.filter.PaymentTypePromptValue).toEqual('1234567891234567891234567');

        });

        it('should set filter values', () => {
            const eraClaimPayments: EraPaymentDto = {
                Era: {
                    EraHeaderId: 12345, Amount: 100, PaymentNumber: '123456789123456789123456789', CarrierName: 'CarrierName1',
                    EraClaimPayments: [],
                    IsAssociatedWithBulk: false, IsProcessed: false, ContainsAllPredeterminations: false, canView: false, tooltip: '',
                    CurrencyType: 12 as CurrencyType, expanded: false, PaymentString: '', claimOrder: { sortColumnName: '', sortDirection: 1 },
                    items: [
                        { label: 'string', click: 'string' }],
                    IsAutoMatched: true,
                    EraPayerName: null,
                    Paid: 0
                },
                ClaimPayments: [],
                LocationIds: [],
                PaidTotal:100
            };
            component.processEra(eraClaimPayments)
            expect(component.filter.Amount).toEqual(eraClaimPayments.PaidTotal);
            expect(component.filter.EraId).toEqual(routeParams.EraId);
        });

        it('should call insurancePaymentIsValidPipe.transform with insurancePayments if canEditAllowedAmount is false', () => {
            component.canEditAllowedAmount = false;
            const eraClaimPayments: EraPaymentDto = {
                Era: {
                    EraHeaderId: 12345, Amount: 100, PaymentNumber: '123456789123456789123456789', CarrierName: 'CarrierName1',
                    EraClaimPayments: [],
                    IsAssociatedWithBulk: false, IsProcessed: false, ContainsAllPredeterminations: false, canView: false, tooltip: '',
                    CurrencyType: 12 as CurrencyType, expanded: false, PaymentString: '', claimOrder: { sortColumnName: '', sortDirection: 1 },
                    items: [
                        { label: 'string', click: 'string' }],
                    IsAutoMatched: true,
                    EraPayerName: null,
                    Paid: 100
                },
                ClaimPayments: [],
                LocationIds: [],
                PaidTotal: 100
            };
            component.processEra(eraClaimPayments)
            expect(mockInsurancePaymentIsValidPipe.transform).toHaveBeenCalledWith(component.insurancePayments, false);
        });

        it('sets component.filter.PaymentTypePromptValue to null if value is null', () => {
            const eraClaimPayments: EraPaymentDto = {
                Era: {
                    EraHeaderId: 12345, Amount: 100, PaymentNumber: null, CarrierName: 'CarrierName1',
                    EraClaimPayments: [],
                    IsAssociatedWithBulk: false, IsProcessed: false, ContainsAllPredeterminations: false, canView: false, tooltip: '',
                    CurrencyType: 12 as CurrencyType, expanded: false, PaymentString: '', claimOrder: { sortColumnName: '', sortDirection: 1 },
                    items: [
                        { label: 'string', click: 'string' }],
                    IsAutoMatched: true,
                    EraPayerName: null,
                    Paid: 100
                },
                ClaimPayments: [],
                LocationIds: [],
                PaidTotal: 100
            };
            component.processEra(eraClaimPayments)
            expect(component.filter.PaymentTypePromptValue).toEqual(null);
        });
    });

    describe('component.applyEraToGrid method ->', () => {
        let mockClaimPayments;
        beforeEach(() => {
            mockClaimPayments = [{
                PaymentAmount: 100, LocationId: '1234',
                ServiceTransactionToClaimPaymentDtos: [{ DateEntered: new Date(), TotalInsurancePayments: 75.00, Charges: 100 },
                { DateEntered: new Date(), TotalInsurancePayments: 50.00, Charges: 150 },]
            }];
        })

        it('should set component.showNoClaimsMessage to false if filter.Carrier is populated and we have insurancePayments', () => {
            component.filter.Carrier = { CarrierId: '2345' };
            var claimPayments = cloneDeep(mockClaimPayments);
            component.applyEraToGrid(claimPayments);
            expect(component.showNoClaimsMessage).toBe(false);   
        });

        it('should set component.showNoClaimsMessage to false if filter.Carrier is null', () => {
            component.filter.Carrier = null;
            var claimPayments = cloneDeep(mockClaimPayments);
            component.applyEraToGrid(claimPayments);
            expect(component.showNoClaimsMessage).toBe(false);            
        });

        it('should set component.showNoClaimsMessage to true if filter.Carrier is populated and we do not have insurancePayments', () => {
            component.filter.Carrier = { CarrierId: '2345' };
            var claimPayments = [];
            component.applyEraToGrid(claimPayments);
            expect(component.showNoClaimsMessage).toBe(true);            
        });

        it('should set values correctly for empty claim payments', () => {
            var claimPayments = [];
            component.applyEraToGrid(claimPayments);
            expect(component.insurancePayments).toBe(claimPayments);            
        });

        it('should set values correctly for populated claim payments', () => {
            component.locations = [{ LocationId: '1234', Timezone: 'CT' }]
            var claimPayments = [{
                PaymentAmount: 100, LocationId: '1234',
                ServiceTransactionToClaimPaymentDtos: [{ DateEntered: new Date(), TotalInsurancePayments: 75.00, Charges: 100 },
                { DateEntered: new Date(), TotalInsurancePayments: 50.00, Charges: 150 },]
            }];
            component.applyEraToGrid(claimPayments);
            expect(component.insurancePayments).toBe(claimPayments);
            expect(component.showNoClaimsMessage).toBe(false);
        });

        it('should set errors on total insurance overpayment', () => {
            spyOn(component, 'checkClaimsForServicesErrors');
            var insurancePayments = [{
                ServiceTransactionToClaimPaymentDtos: [
                    { Charges: 50, TotalInsurancePayments: 45, PaymentAmount: 10 }]
            }];

            component.applyEraToGrid(insurancePayments);

            expect(component.insurancePayments).toBe(insurancePayments);
            expect(component.insurancePayments[0].ServiceTransactionToClaimPaymentDtos[0].$$hasError).toBe(true);
            expect(component.insurancePayments[0].$$servicesHaveErrors).toBe(true);
            expect(component.checkClaimsForServicesErrors).toHaveBeenCalled();
        });

        it('should set errors on individual insurance overpayment', () => {

            spyOn(component, 'checkClaimsForServicesErrors');
            var insurancePayments = [{
                LocationId: 1,
                ServiceTransactionToClaimPaymentDtos: [
                    { Charges: 50, TotalInsurancePayments: 0, PaymentAmount: 150 },
                    { Charges: 50, TotalInsurancePayments: 0, PaymentAmount: 0 },
                    { Charges: 50, TotalInsurancePayments: 0, PaymentAmount: 0 }
                ]
            }];

            component.applyEraToGrid(insurancePayments);

            expect(component.insurancePayments).toBe(insurancePayments);
            expect(component.insurancePayments[0].ServiceTransactionToClaimPaymentDtos[0].$$hasError).toBe(true);
            expect(component.insurancePayments[0].ServiceTransactionToClaimPaymentDtos[1].$$hasError).toBe(false);
            expect(component.insurancePayments[0].$$servicesHaveErrors).toBe(true);
            expect(component.checkClaimsForServicesErrors).toHaveBeenCalled();
        });
    });
    
    describe('component.applyEraLocation method ->', () => {
        beforeEach(() => {
            component.amfaAccess = 'soar-acct-aipmt-add';
        })

        it('should call locationsService.requestPermittedLocations with amfaAccess to get permitted locations for this user', () => {            
            component.applyEraLocation([1234]);
            expect(mockSoarLocationHttpService.requestPermittedLocations).toHaveBeenCalledWith({ actionId: '2255' });
        });

        it('should set component.disableLocationSelector to true if requestPermittedLocations return value contains the era location', () => {
            mockSoarLocationHttpService.requestPermittedLocations.and.returnValue(of({Value:[{LocationId:1234}]}));
            component.applyEraLocation([1234]);
            expect(component.disableLocationSelector).toBe(true);
        });

        it('should set component.disableLocationSelector to false if requestPermittedLocations return value does not contain the era location', () => {
            mockSoarLocationHttpService.requestPermittedLocations.and.returnValue(of({Value:[]}));
            component.applyEraLocation([1234]);
            expect(component.disableLocationSelector).toBe(false);
        });
    });

    describe('component.applyEraCarrier method ->', () => {
        let mockEra;
        beforeEach(()=> {
            mockEra = { CarrierId: 3, Name: 'Carrier3' };
            spyOn(component, 'checkFilterChanges').and.callFake((any: any) => { });
            component.filteredCarrierList = [
                { CarrierId: 1, Name: 'Carrier1' },
                { CarrierId: 2, Name: 'Carrier2' },
                { CarrierId: 3, Name: 'Carrier3' }
            ];      
        });
        
        it('should call checkFilterChanges', () => {
            component.applyEraCarrier(mockEra);
            expect(component.checkFilterChanges).toHaveBeenCalled();
        });

        it('should set filter properties', () => {
            let eraCarrier = { CarrierId: 3, Name: 'Carrier3' };
            component.filteredCarrierList = [
                { CarrierId: 1, Name: 'Carrier1' },
                { CarrierId: 2, Name: 'Carrier2' },
                { CarrierId: 3, Name: 'Carrier3' }
            ];
            component.applyEraCarrier(mockEra);
            expect(component.filter.Carrier).toEqual(mockEra);
            expect(component.selectedCarrierName).toEqual(mockEra.Name);
            expect(component.selectedPaymentTypeId).toBe(0);
            expect(component.disableCarrier).toBe(true);
        });

        it('should not set filter.Carrier if era.CarrierId is not in carrier list', () => {
            mockEra.CarrierId = 4;                     
            component.applyEraCarrier(mockEra);
            expect(component.filter.Carrier).toBe(undefined); 
            expect(component.selectedCarrierName).toEqual('');   
        });

        it('should set filter.Carrier if era.CarrierId is not in carrier list', () => { 
            mockEra.CarrierId = 4;                     
            component.applyEraCarrier(mockEra);
            expect(component.filter.Carrier).toBe(undefined); 
            expect(component.selectedCarrierName).toEqual('');   
        });

        it('should disable the carrier selection if we have a carrier ', () => { 
            mockEra.CarrierId = 3; 
            component.applyEraCarrier(mockEra);
            expect(component.disableCarrier).toBe(true);   
        });

        it('should not disable the carrier selection if we do not have a carrier ', () => { 
            mockEra.CarrierId = 4; 
            component.applyEraCarrier(mockEra); 
            expect(component.disableCarrier).toBe(false);   
        });
    });

    describe('component.applyEraPaymentType method ->', () => {

        it('should call this.paymentTypesService.getAllPaymentTypesMinimal with insurancePaymentTypeCategory to get payment types', () => {
            var currencyType = 1;
            component.applyEraPaymentType(currencyType);
            expect(component.filter.InsurancePaymentTypeId).toBe(11);
            expect(component.selectedPaymentTypeId).toBe(11);
        });

        it('should not set insurance payment type if not found in list of payment types', () => {
            var currencyType = 3;
            component.applyEraPaymentType(currencyType);
            expect(component.filter.InsurancePaymentTypeId).toBe(null);
            expect(component.selectedPaymentTypeId).toBe(0);
        });
    });


    describe('component.selectedPaymentTypeWatcher ->', () => {
        it('should set id and prompt to payment type if payment type parameter', () => {
            var paymentType = { PaymentTypeId: 1, Prompt: 'Test' };
            component.selectedPaymentTypeWatcher(paymentType);

            expect(component.filter.InsurancePaymentTypeId).toBe(1);
            expect(component.paymentPrompt).toBe('Test');
        });
        it('should set id and prompt to null if payment type param is null', () => {
            component.selectedPaymentTypeWatcher(null);
            expect(component.filter.InsurancePaymentTypeId).toBe(null);
            expect(component.paymentPrompt).toBe('');
        });

        it('should set prompt to null when credit card payment type is selected and the selected location is GPI-configured', () => {
            var paymentType =  {
                CurrencyTypeId: CurrencyType.CreditCard,
                PaymentTypeId: '1234',
                Description: 'Credit Card',
                Prompt: 'Number',
              };

           component.showPaymentProvider = true;
           component.currentLocation = {
            LocationId: 123,
            IsPaymentGatewayEnabled: true,
            PaymentProvider: PaymentProvider.TransactionsUI,
          };

        component.selectedPaymentTypeWatcher(paymentType);

        expect(component.paymentPrompt).toBe('');
        });

        it('should set the prompt to number when the credit card payment type is selected and the selected location is OE-configured', () => {
            var paymentType =  {
                CurrencyTypeId: CurrencyType.CreditCard,
                PaymentTypeId: '1234',
                Description: 'Credit Card',
                Prompt: 'Number',
              };

           component.currentLocation = {
            LocationId: 123,
            IsPaymentGatewayEnabled: true,
            PaymentProvider: PaymentProvider.OpenEdge,
          };

        component.selectedPaymentTypeWatcher(paymentType);

        expect(component.paymentPrompt).toBe('Number');
        });
    });

    describe('component.clearDistribution method ->', () => {
        beforeEach(() => {
            component.isEra = false;
            spyOn(component, 'processUnappliedAmount');
            spyOn(component, 'checkFilterChanges');
            component.resultPaged = [
                {
                    PaymentAmount: 0,
                    ServiceTransactionToClaimPaymentDtos: [
                        { PaymentAmount: 0 },
                        { PaymentAmount: 0 }
                    ]
                },
                {
                    PaymentAmount: 0,
                    ServiceTransactionToClaimPaymentDtos: [
                        { PaymentAmount: 0 },
                        { PaymentAmount: 0 }
                    ]
                }
            ];
            component.insurancePayments = [
                {
                    PaymentAmount: 100.00,
                    ServiceTransactionToClaimPaymentDtos: [
                        { PaymentAmount: 45.00 },
                        { PaymentAmount: 55.00 }
                    ]
                },
                {
                    PaymentAmount: 45.00,
                    ServiceTransactionToClaimPaymentDtos: [
                        { PaymentAmount: 25.00 },
                        { PaymentAmount: 20.00 }
                    ]
                }
            ];
        });

        it('should clear current distributions and reload insurancePayments from resultPaged', () => {
            expect(component.insurancePayments[0].PaymentAmount).toBe(100);
            expect(component.insurancePayments[0].ServiceTransactionToClaimPaymentDtos[0].PaymentAmount).toBe(45);
            expect(component.insurancePayments[0].ServiceTransactionToClaimPaymentDtos[1].PaymentAmount).toBe(55);

            expect(component.insurancePayments[1].PaymentAmount).toBe(45);
            expect(component.insurancePayments[1].ServiceTransactionToClaimPaymentDtos[0].PaymentAmount).toBe(25);
            expect(component.insurancePayments[1].ServiceTransactionToClaimPaymentDtos[1].PaymentAmount).toBe(20);

            component.clearDistribution();
            expect(component.insurancePayments[0].PaymentAmount).toBe(0);
            expect(component.insurancePayments[0].ServiceTransactionToClaimPaymentDtos[0].PaymentAmount).toBe(0);
            expect(component.insurancePayments[0].ServiceTransactionToClaimPaymentDtos[1].PaymentAmount).toBe(0);

            expect(component.insurancePayments[1].PaymentAmount).toBe(0);
            expect(component.insurancePayments[1].ServiceTransactionToClaimPaymentDtos[0].PaymentAmount).toBe(0);
            expect(component.insurancePayments[1].ServiceTransactionToClaimPaymentDtos[1].PaymentAmount).toBe(0);
        });

        it('should zero out unappliedAmount and checkFilterChanges', () => {
            component.unappliedAmount = 10;
            component.showErrors = true;
            component.clearDistribution();
            expect(component.showErrors).toBe(false);
            expect(component.unappliedAmount).toEqual(0);
            expect(component.checkFilterChanges).toHaveBeenCalled();
        });
    });


    describe('component.processPaymentChange method ->', () => {
        let event = { NewValue: 0 }
        beforeEach(() => {
            spyOn(component, 'processUnappliedAmount');
            spyOn(component, 'confirmClearingDistribution');
        });


        it('should call confirmClearingDistribution if isEra is not true and component.totalForServices is more than 0 and component.filter.amount changes', () => {
            event.NewValue = 20;
            component.isEra = false;
            component.filterAmountBackup = 15;
            component.totalForServices = 10;
            component.filter.Amount = 10;
            component.processPaymentChange(event);
            expect(component.confirmClearingDistribution).toHaveBeenCalled();
        });

        it('should not call confirmClearingDistribution if isEra is not true and component.totalForServices is more than 0 and component.filter.amount changes and paymentAmountBackup is 0', () => {
            component.isEra = false;
            event.NewValue = 20;
            component.filterAmountBackup = 0;
            component.totalForServices = 10;
            component.filter.Amount = 10;
            component.processPaymentChange(event);
            expect(component.confirmClearingDistribution).not.toHaveBeenCalled();
        });

        it('should not call confirmClearingDistribution if isEra is true', () => {
            component.isEra = true;
            event.NewValue = 20;
            component.totalForServices = 10;
            component.filter.Amount = 0;
            component.processPaymentChange(event);
            expect(component.confirmClearingDistribution).not.toHaveBeenCalled();
        });
    });

    describe('component.validateFilter method ->', () => {

        it('should return true if filter.CarrierId and filter.Locations', () => {
            component.filter.Locations = ['1234'];
            component.filter.Carrier = { CarrierId: '2345' };
            expect(component.validateFilter()).toEqual(true);
        });

        it('should return true if filter.CarrierId is null and PayerId and filter.Locations', () => {
            component.filter.Locations = ['1234'];
            component.filter.Carrier = null;
            component.filter.PayerId = '2345';
            expect(component.validateFilter()).toEqual(true);
        });

        it('should return false if no PayerId and no CarrierId', () => {
            component.filter.Locations = ['1234'];
            component.filter.Carrier = null;
            component.filter.PayerId = null;
            expect(component.validateFilter()).toEqual(false);
        });

        it('should return false if no Locations', () => {
            component.filter.Locations = [];
            component.filter.Carrier = null;
            component.filter.PayerId = '2345';
            expect(component.validateFilter()).toEqual(false);
        });
    });


    describe('component.processClaims method ->', () => {
        let claimDtos = []
        beforeEach(() => {
            claimDtos = [{
                PaymentAmount: 100.00,
                ServiceTransactionToClaimPaymentDtos: [
                    { PaymentAmount: 45.00, TotalInsurancePayments: 10.5542, DateEntered: new Date() },
                    { PaymentAmount: 55.00, TotalInsurancePayments: 15.3365, DateEntered: new Date() },]
            }, {
                PaymentAmount: 45.00,
                ServiceTransactionToClaimPaymentDtos: [
                    { PaymentAmount: 25.00, TotalInsurancePayments: 10.4452, DateEntered: new Date() },
                    { PaymentAmount: 20.00, TotalInsurancePayments: 15, DateEntered: new Date() },
                ]
            }
            ];
        });

        it('should round TotalInsurancePayments for each ServiceTransactionToClaimPaymentDtos in each claim', () => {
            component.processClaims(claimDtos)
            claimDtos.forEach(claimDto => {
                claimDto.ServiceTransactionToClaimPaymentDtos.forEach(serviceTransactionDto => {
                    expect(serviceTransactionDto.TotalInsurancePayments).toEqual(Math.abs(serviceTransactionDto.TotalInsurancePayments));
                });
            })
        });

        it('should set resultPaged to ClaimDtos', () => {
            component.processClaims(claimDtos)
            expect(component.resultPaged).toEqual(claimDtos)
        });

        it('should set insurancePayments to ClaimDtos', () => {
            component.processClaims(claimDtos)
            expect(component.insurancePayments).toEqual(component.resultPaged)
        });

        it('should set showNoClaimsMessage to true if validateFilter returns true and insurancePayments list is empty', () => {
            spyOn(component, 'validateFilter').and.returnValue(true);
            claimDtos = [];
            component.processClaims(claimDtos)
            expect(component.showNoClaimsMessage).toBe(true);
        });

        it('should set showNoClaimsMessage to false if validateFilter returns false and insurancePayments list is empty', () => {
            spyOn(component, 'validateFilter').and.returnValue(false);
            claimDtos = [];
            component.processClaims(claimDtos)
            expect(component.showNoClaimsMessage).toBe(false);
        });

        it('should set showNoClaimsMessage to false if validateFilter returns false and insurancePayments list is not empty', () => {
            spyOn(component, 'validateFilter').and.returnValue(false);
            component.processClaims(claimDtos)
            expect(component.showNoClaimsMessage).toBe(false);
        });

        it('should sort services by InsuranceOrder if InsuranceOrder is not null', () => {
            claimDtos = [{
                ServiceTransactionToClaimPaymentDtos: [
                    { InsuranceOrder: 3, DateEntered: '2016-02-02' },
                    { InsuranceOrder: 1, DateEntered: '2018-02-02' },
                    { InsuranceOrder: 2, DateEntered: '2021-02-02' }
                ]
            }]

            component.processClaims(claimDtos);

            expect(claimDtos[0].ServiceTransactionToClaimPaymentDtos[0].InsuranceOrder).toBe(1);
            expect(claimDtos[0].ServiceTransactionToClaimPaymentDtos[1].InsuranceOrder).toBe(2);
            expect(claimDtos[0].ServiceTransactionToClaimPaymentDtos[2].InsuranceOrder).toBe(3);
        });

        it('should sort services by DateEntered if InsuranceOrder is null', () => {
            claimDtos = [{
                ServiceTransactionToClaimPaymentDtos: [
                    { InsuranceOrder: null, DateEntered: '2018-02-02' },
                    { InsuranceOrder: null, DateEntered: '2021-02-02' },
                    { InsuranceOrder: null, DateEntered: '2016-02-02' }
                ]
            }]

            component.processClaims(claimDtos);

            expect(claimDtos[0].ServiceTransactionToClaimPaymentDtos[0].DateEntered).toBe('2016-02-02');
            expect(claimDtos[0].ServiceTransactionToClaimPaymentDtos[1].DateEntered).toBe('2018-02-02');
            expect(claimDtos[0].ServiceTransactionToClaimPaymentDtos[2].DateEntered).toBe('2021-02-02');
        });
    });

    describe('createCreditTransactionFailure function', () => {
        it('should call removeWaitOverlay', function () {
            spyOn(component, 'removeWaitOverlay');
            component.createCreditTransactionFailure();
            expect(component.removeWaitOverlay).toHaveBeenCalled();
        });

        it('should set disableApplyButton to false', function () {
            spyOn(component, 'removeWaitOverlay');
            component.createCreditTransactionFailure();
            expect(component.disableApplyButton).toBe(false);
        });
    });

    describe('onLocationChange', () => {
        it('should call loadUnappliedBulkInsurancePayments when open edge is enabled', () => {
            spyOn(component, 'loadUnappliedBulkInsurancePayments');
            spyOn(component, 'currentLocation').and.returnValue({ LocationId: 1 });

            component.onLocationChange({ LocationId: 2, IsPaymentGatewayEnabled: true,  PaymentProvider:PaymentProvider.OpenEdge });

            expect(component.loadUnappliedBulkInsurancePayments).toHaveBeenCalled();
        });
        it('should call loadUnappliedBulkInsurancePayments when GPI is enabled', () => {
            spyOn(component, 'loadUnappliedBulkInsurancePayments');
            spyOn(component, 'currentLocation').and.returnValue({ LocationId: 1 });

            component.onLocationChange({ LocationId: 2, IsPaymentGatewayEnabled: true, PaymentProvider:PaymentProvider.TransactionsUI });

            expect(component.loadUnappliedBulkInsurancePayments).toHaveBeenCalled();
        });

        it('should not call loadUnappliedBulkInsurancePayments when the location does not change', () => {
            spyOn(component, 'loadUnappliedBulkInsurancePayments');
            spyOn(component, 'currentLocation').and.returnValue({ LocationId: 2 });

            component.onLocationChange({ LocationId: 2 });

            expect(component.loadUnappliedBulkInsurancePayments).not.toHaveBeenCalled();
        });

        it('should not call loadUnappliedBulkInsurancePayments when payment integration is disabled', () => {
            spyOn(component, 'loadUnappliedBulkInsurancePayments');
            spyOn(component, 'currentLocation').and.returnValue({ LocationId: 1 });

            component.onLocationChange({ LocationId: 2, IsPaymentGatewayEnabled: false, MerchantId: '123' });

            expect(component.loadUnappliedBulkInsurancePayments).not.toHaveBeenCalled();
        });

        it('should call cancelPayment when selectedUnappliedBulkInsurancePayment is set', () => {
            spyOn(component, 'cancelPayment').and.callFake(() => { });
            spyOn(component, 'currentLocation').and.returnValue({ LocationId: 1 });
            component.selectedUnappliedBulkInsurancePayment = sampleUnappliedPayment;

            component.onLocationChange({ LocationId: 2 });

            expect(component.cancelPayment).toHaveBeenCalled();
        });


        it('should call selectedPaymentTypeWatcher when payment type credit card is selected ', () => {
            spyOn(component, 'selectedPaymentTypeWatcher');
            spyOn(component, 'currentLocation').and.returnValue({ LocationId: 1 });
          

            component.selectedPaymentType =  {
                CurrencyTypeId: CurrencyType.CreditCard,
                PaymentTypeId: '1234',
                Description: 'Credit Card',
                Prompt: 'Number',
              };

            component.onLocationChange({ LocationId: 2, IsPaymentGatewayEnabled: false, PaymentProvider:null});

            expect(component.selectedPaymentTypeWatcher).toHaveBeenCalled();
        });

        it('should not call selectedPaymentTypeWatcher when payment type other than credit card is selected ', () => {
            spyOn(component, 'selectedPaymentTypeWatcher');
            spyOn(component, 'currentLocation').and.returnValue({ LocationId: 1 });
          

            component.selectedPaymentType =  {
                CurrencyTypeId: CurrencyType.Check,
                PaymentTypeId: '1234',
                Description: 'Credit Card',
                Prompt: 'Number',
              };

            component.onLocationChange({ LocationId: 2, IsPaymentGatewayEnabled: false, PaymentProvider:null});

            expect(component.selectedPaymentTypeWatcher).not.toHaveBeenCalled();
        });

    })

    describe('loadUnappliedBulkInsurancePayments', () => {
        it('should call requestUnappliedBulkInsurancePayments and sort results on payment date from oldest to newest', async () => {
            mockSoarPaymentGatewayTransactionHttpService.requestUnappliedBulkInsurancePayments.and.returnValue(Promise.resolve({
                Value: [
                    { ...sampleUnappliedPayment, PaymentDate: new Date(2022, 10), PaymentGatewayTransactionId: 1 },
                    { ...sampleUnappliedPayment, PaymentDate: new Date(2022, 8), PaymentGatewayTransactionId: 2 },
                    { ...sampleUnappliedPayment, PaymentDate: new Date(2022, 11), PaymentGatewayTransactionId: 3 },
                ]
            }));

            await component.loadUnappliedBulkInsurancePayments(false);

            expect(mockSoarPaymentGatewayTransactionHttpService.requestUnappliedBulkInsurancePayments).toHaveBeenCalledWith(false);
            expect(component.unappliedBulkPaymentTransactions[0].PaymentGatewayTransactionId).toBe(2);
        });
    });

    describe('applyInsurancePaymentsSuccess', () => {
        it('should call cancelPayment', () => {
            spyOn(component, 'cancelPayment').and.callFake(() => { });
            component.isEra = false;

            component.applyInsurancePaymentsSuccess();

            expect(component.cancelPayment).toHaveBeenCalled();
        });

        it('should call loadUnappliedBulkInsurancePayments if payment Provider is enabled', () => {
            spyOn(component, 'loadUnappliedBulkInsurancePayments');
            component.isPaymentProviderEnabled = true;
            component.isEra = false;

            component.applyInsurancePaymentsSuccess();

            expect(component.loadUnappliedBulkInsurancePayments).toHaveBeenCalled();
        });

        it('should not call loadUnappliedBulkInsurancePayments if Payment Provider is not enabled', () => {
            spyOn(component, 'loadUnappliedBulkInsurancePayments');
            component.isPaymentProviderEnabled = false;
            component.isEra = false;

            component.applyInsurancePaymentsSuccess();

            expect(component.loadUnappliedBulkInsurancePayments).not.toHaveBeenCalled();
        });

        it('should set hasEditedAllowedAmounts to false', () => {
            spyOn(component, 'loadUnappliedBulkInsurancePayments');
            component.isPaymentProviderEnabled = false;
            component.isEra = false;
            component.applyInsurancePaymentsSuccess();
            expect(component.hasEditedAllowedAmounts).toBe(false);
        });
    });

    describe('applyUnappliedBulkInsurancePayment', () => {
        beforeEach(() => {
            spyOn(component, 'applyUnappliedPaymentLocation');
            spyOn(component, 'applyUnappliedPaymentPaymentType');
            spyOn(component, 'clearPaymentAndDistribution');

            component.carriers = [{ CarrierId: sampleUnappliedPayment.CarrierId, Name: '', IsActive: true, PayerId: '', AddressLine1: '', AddressLine2: '', City: '', State: '', Zip: '', SearchType: '', PhoneNumbers: [], LongLabel: '' }]
        });
        it('should trigger triggerOverlayClose when carrierId is found', () => {
            const nextSpy = spyOn(component.triggerOverlayClose, 'next');

            component.applyUnappliedBulkInsurancePayment(sampleUnappliedPayment);

            expect(nextSpy).toHaveBeenCalled();
        });
        it('should set filter.Amount', () => {
            spyOn(component.triggerOverlayClose, 'next');
            component.applyUnappliedBulkInsurancePayment(sampleUnappliedPayment);
            expect(component.filter.Amount).toEqual(sampleUnappliedPayment.Amount);
        });

        it('should call child methods', () => {
            spyOn(component.triggerOverlayClose, 'next');
            component.applyUnappliedBulkInsurancePayment(sampleUnappliedPayment);
            expect(component.clearPaymentAndDistribution).toHaveBeenCalled();
            expect(component.applyUnappliedPaymentLocation).toHaveBeenCalled();
            expect(component.applyUnappliedPaymentPaymentType).toHaveBeenCalled();
        });
    });

    describe('createCreditTransactionSuccess', () => {
        beforeEach(() => {
            component.insurancePayments = [];
            component.selectedPaymentType = 1;
        });

        it('should call removeWaitOverlay', () => {
            spyOn(component, 'removeWaitOverlay');
            component.createCreditTransactionSuccess(1234);
            expect(component.removeWaitOverlay).toHaveBeenCalled();
        });

        it('should call patientInsurancePaymentFactory.applyInsurancePayments', () => {
            spyOn(component, 'removeWaitOverlay');
            component.createCreditTransactionSuccess(1234);
            expect(mockPatientInsurancePaymentFactory.applyInsurancePayments).toHaveBeenCalledWith(component.filter, component.insurancePayments, component.selectedPaymentType, jasmine.any(Function), jasmine.any(Function));
        });

        it('should set component.filter.PaymentGatewayTransactionId', () => {
            spyOn(component, 'removeWaitOverlay');
            component.createCreditTransactionSuccess(1234);
            expect(component.filter.PaymentGatewayTransactionId).toEqual(1234)
        });
    });

    describe('handleUnappliedPaymentProviderPayment', () => {
        beforeEach(() => {
            mockSoarPaymentGatewayTransactionHttpService.requestUnappliedBulkInsurancePayments.and.returnValue(Promise.resolve({
                Value: [
                    { ...sampleUnappliedPayment, PaymentDate: new Date(2022, 10), PaymentGatewayTransactionId: 1 },
                    { ...sampleUnappliedPayment, PaymentDate: new Date(2022, 8), PaymentGatewayTransactionId: 2 },
                    { ...sampleUnappliedPayment, PaymentDate: new Date(2022, 11), PaymentGatewayTransactionId: 3 },
                ]
            }));
        });

        it('should reload unappliedBulkPaymentTransactions by calling requestUnappliedBulkInsurancePayments ', () => {
            component.handleUnappliedPaymentProviderPayment();
            expect(mockSoarPaymentGatewayTransactionHttpService.requestUnappliedBulkInsurancePayments).toHaveBeenCalled();
        });

        it('should load selectedUnappliedBulkInsurancePayment based on filter.PaymentGatewayTransactionId', async () => {
            component.filter.PaymentGatewayTransactionId = 3;

            await component.handleUnappliedPaymentProviderPayment();

            // find the PaymentGatewayTransaction we just updated
            let paymentGatewayTransaction = component.unappliedBulkPaymentTransactions.find(unapplied => {
                return unapplied.PaymentGatewayTransactionId === component.filter.PaymentGatewayTransactionId
            });
            expect(component.selectedUnappliedBulkInsurancePayment).toEqual(paymentGatewayTransaction);
        });

        it('should disable carrier dropdowns', async () => {
            component.filter.PaymentGatewayTransactionId = 3;
            await component.handleUnappliedPaymentProviderPayment();

            expect(component.disableCarrier).toBe(true);
        });
    });

    describe('addDocument', () => {
        let createSpy;
        let overlayRefSpyObj;
        let simulateClickBackdropEvent;
        let simulateDetachmentEvent;

        beforeEach(() => {
            ({ createSpy, overlayRefSpyObj, simulateClickBackdropEvent, simulateDetachmentEvent } = overlaySpyHelper(mockOverlayService));
            component.insurancePayments = [
                {
                    PaymentAmount: 100.00,
                    FinalPayment: true,
                    PatientId: '1'
                },
                {
                    PaymentAmount: 0.00,
                    FinalPayment: true,
                    PatientId: '2'
                },
                {
                    PaymentAmount: 100.00,
                    FinalPayment: false,
                    PatientId: '3'
                },
                {
                    PaymentAmount: 0.00,
                    FinalPayment: false,
                    PatientId: '4'
                }
            ];
        });

        it('should upload EOB for all valid insurance payments', () => {
            component.addDocument();
            expect(component.patientListForFileUpload.length).toBe(3);
        });
    });

    describe('onUploadSuccess', () => {
        beforeEach(() => {

        });

        it('should call closeModal()', () => {
            spyOn(component, 'closeModal');
            component.onUploadSuccess(null);
            expect(component.closeModal).toHaveBeenCalled();
        });
    });

    describe('onUploadCancel', () => {
        beforeEach(() => {

        });

        it('should call onUploadCancel()', () => {
            spyOn(component, 'closeModal');
            component.onUploadSuccess(null);
            expect(component.closeModal).toHaveBeenCalled();
        });
    });
  
    describe('onCarrierChanged when isEra is true', () => {
        beforeEach(() => {
            const eraClaimPayments: EraPaymentDto = {
                Era: {
                    EraHeaderId: 12345, Amount: 100, PaymentNumber: '2345', CarrierName: 'CarrierName1',
                    EraClaimPayments: [],
                    IsAssociatedWithBulk: false, IsProcessed: false, ContainsAllPredeterminations: false, canView: false, tooltip: '',
                    CurrencyType: 12 as CurrencyType, expanded: false, PaymentString: '', claimOrder: { sortColumnName: '', sortDirection: 1 },
                    items: [
                        { label: 'string', click: 'string' }],
                    IsAutoMatched: false,
                    EraPayerName: null,
                    Paid: 100
                },
                ClaimPayments: [],
                LocationIds: [],
                PaidTotal: 100
            };
            component.isEra = true;
            component.era = eraClaimPayments;
            spyOn(component, 'getClaimsList');
            spyOn(component, 'selectCarrier');
        });
        it(`should call getClaimsList when component.isEra is true and component.era.Era.IsAutoMatched is false
            and either component.filter.PayerId or component.filter.CarrierId are populated`, () => {
            const carrierId = "11";           
            component.filter.PayerId = '12345';
            component.onCarrierChanged(carrierId);
            expect(component.getClaimsList).toHaveBeenCalledTimes(1);
        });

        it('should not call getClaimsList when component.isEra is true and component.era.Era.IsAutoMatched is true', () => {
            component.era.Era.IsAutoMatched = true;            
            const carrierId = "11";            
            component.filter.PayerId = '12345';
            component.onCarrierChanged(carrierId);
            expect(component.getClaimsList).toHaveBeenCalledTimes(0);
        });

        it(`should not call getClaimsList when component.isEra is true and component.era.Era.IsAutoMatched is false'
            and carrierId and payerId are not set`, () => {
            component.era.Era.IsAutoMatched = true;
            const carrierId = "11";            
            component.filter.Carrier = null;
            component.filter.PayerId = null;

            component.onCarrierChanged(carrierId);

            expect(component.getClaimsList).toHaveBeenCalledTimes(0);
        });
    });

    describe('onCarrierChanged when isEra is false', () => {
        const carrierId = "11";
        beforeEach(() => {            
            component.isEra = false;
            spyOn(component, 'getClaimsList');
            spyOn(component, 'selectCarrier');            
            routeParams.EraId = null;
        });
        it('should call getClaimsList when is not era and carrierId is not equal to filter.Carrier.CarrierId', () => { 
            component.filter.Carrier = { CarrierId: "12" }
            component.onCarrierChanged(carrierId);
            expect(component.getClaimsList).toHaveBeenCalledTimes(1);
        });

        it('should call getClaimsList when is not era and payerId is set', () => {
            component.filter.PayerId = '12345';
            component.onCarrierChanged(carrierId);
            expect(component.getClaimsList).toHaveBeenCalledTimes(1);
        });


        it('should not call getClaimsList when is not era and carrier or payerid is not set', () => {
            const carrierId = "11";
            component.filter.Carrier = null;
            component.filter.PayerId = null;

            component.onCarrierChanged(carrierId);

            expect(component.getClaimsList).toHaveBeenCalledTimes(0);
        });

        it('should not call getClaimsList when carrierId matches the filter.CarrierId', () => {
            const carrierId = "11";
            component.filter.Carrier = {CarrierId: "11"};
            component.filter.PayerId = null;

            component.onCarrierChanged(carrierId);
            expect(component.selectCarrier).toHaveBeenCalledWith(carrierId);
            expect(component.getClaimsList).not.toHaveBeenCalled();
        });


    });

    describe('cancelPayment', () => {  
        it('should set disableApplyButton to false', () => {
            component.cancelPayment();
            expect(component.disableApplyButton).toBe(false);
        });  
    });

    describe('validate',()=>{
        
        beforeEach(() => {            
            spyOn(component,'processUnappliedAmount');
        });

        it('should not show error when all filters have value and card reader dropdown not exist', () => {  
            component.unappliedAmount = 0;         
            component.filter.DateEntered =new Date();
            component.filter.InsurancePaymentTypeId = 1;
            component.showCardReaderDropDown =false;
            component.validate();
            expect(component.showErrors).toBe(false);
        }); 

        it('should not show error when all filters have value and card reader dropdown exist', () => {  
            component.unappliedAmount = 0;         
            component.filter.DateEntered =new Date();
            component.filter.InsurancePaymentTypeId = 1;
            component.showCardReaderDropDown =true;
            component.isPaymentDevicesExist = true;
            component.selectedCardReader = 'citi';

            component.validate();
            expect(component.showErrors).toBe(false);
        }); 
        
         it('should show error when date entered is null', () => {    
            component.unappliedAmount = 0;         
            component.filter.DateEntered = null
            component.filter.InsurancePaymentTypeId = 1;
            component.showCardReaderDropDown =false;

            component.validate();
            expect(component.showErrors).toBe(true);
        }); 

        it('should show error when payment type is not selected', () => {  
            
            component.unappliedAmount = 0;         
            component.filter.DateEntered =new Date();
            component.filter.InsurancePaymentTypeId  = null
            component.showCardReaderDropDown =false;

            component.validate();
            expect(component.showErrors).toBe(true);
        }); 

        it('should show error when card reader dropdown is exist and not selected value ', () => {  
            
            component.unappliedAmount = 0;         
            component.filter.DateEntered =new Date();
            component.filter.InsurancePaymentTypeId = 1;
            component.showCardReaderDropDown =true;
            component.isPaymentDevicesExist = true;
            component.selectedCardReader = null;

            component.validate();
            expect(component.showErrors).toBe(true);
        }); 

    })

    describe('handlePayPageTransactionCallback',()=>{
        it('should call completeCreditTransaction with correct parameters', () => {
            spyOn(component, 'closePaypage'); // Spy on closePaypage method
        
            // Simulate the function call
            component.handlePayPageTransactionCallback();
        
            // Verify that completeCreditTransaction was called with expected arguments
            expect(mockPaymentGatewayService.completeCreditTransaction).toHaveBeenCalledWith(
              component.transactionInformation, 
              7, 
              component.createCreditTransactionSuccess, 
              component.createCreditTransactionFailure
            );
        
            // Verify that closePaypage is called
            expect(component.closePaypage).toHaveBeenCalled();
          });
          
        it('should handle successful transaction and close the paypage', () => {
            spyOn(component, 'closePaypage'); // Spy on closePaypage method
            spyOn(component, 'createCreditTransactionSuccess'); // Spy on createCreditTransactionSuccess method

            
        
            // Simulate successful transaction
            mockPaymentGatewayService.completeCreditTransaction.and.callFake(
              (transactionInfo, number, successCallback) => {
                successCallback();
              }
            );
        
            component.handlePayPageTransactionCallback();
        
            // Ensure the paypage closes
            expect(component.createCreditTransactionSuccess).toHaveBeenCalled();
            expect(component.closePaypage).toHaveBeenCalled();
          });

        it('should handle failed transaction and close the paypage', () => {
            spyOn(component, 'closePaypage'); // Spy on closePaypage method
            spyOn(component, 'createCreditTransactionFailure'); // Spy on createCreditTransactionFailure method
        
            // Simulate failed transaction
            mockPaymentGatewayService.completeCreditTransaction.and.callFake(
              (transactionInfo, number, successCallback, failureCallback) => {
                failureCallback();
              }
            );
        
            component.handlePayPageTransactionCallback();
        
            // Ensure the paypage still closes even if the transaction fails
            expect(component.closePaypage).toHaveBeenCalled();
            expect(component.createCreditTransactionFailure).toHaveBeenCalled();
          });
    })

    describe('serviceAllowedAmountBlurChange', () => {
        let mockEvent;
        const mockEstimates = { Value: [] };
        beforeEach(() => {
            mockSoarBulkPaymentHttpService.reEstimateClaimServices.and.returnValue(of(mockEstimates));
            mockEvent = {
                claim: {
                  PaymentAmount: 100,  
                  ClaimId: 12345,
                  ServiceTransactionToClaimPaymentDtos: [
                    { AllowedAmount: 125, ClaimId: '1', ServiceTransactionId: '101', EstimatedInsuranceId: '201'},
                    { AllowedAmount: 200, ClaimId: '1', ServiceTransactionId: '102', EstimatedInsuranceId: '202'},
                    { AllowedAmount: 150, ClaimId: '1', ServiceTransactionId: '103', EstimatedInsuranceId: '203'},
                  ],
                },
              };
            spyOn(component, 'loadUpdatedEstimates');
            spyOn(component, 'updateClaimWithEstimates');
        })

        it('should call soarBulkPaymentHttpService.reEstimateClaimServices with list of allowedAmounts', () => {
            component.serviceAllowedAmountBlurChange(mockEvent as any);
            expect(mockSoarBulkPaymentHttpService.reEstimateClaimServices).toHaveBeenCalledWith({claimId : 12345, 
                allowedAmounts: [
                  { ServiceTransactionId: '101', EstimatedInsuranceId: '201', AllowedAmount: 125},
                  { ServiceTransactionId: '102', EstimatedInsuranceId: '202', AllowedAmount: 200},
                  { ServiceTransactionId: '103', EstimatedInsuranceId: '203', AllowedAmount: 150},
                ],
              });
            expect(component.loadUpdatedEstimates).toHaveBeenCalledWith(mockEstimates);
            expect(component.updateClaimWithEstimates).toHaveBeenCalledWith(mockEvent.claim, mockEstimates);            
        });
        
        it('should call updateClaimWithEstimates with the claim and estimates', () => {
            const estimates = { Value: [] };
            component.serviceAllowedAmountBlurChange(mockEvent); 
            expect(component.updateClaimWithEstimates).toHaveBeenCalledWith(mockEvent.claim, estimates);
        });
        
        it('should handle errors from reEstimateClaimServices', () => {
            mockSoarBulkPaymentHttpService.reEstimateClaimServices.and.returnValue(throwError(() => new Error('Error')));        
            component.serviceAllowedAmountBlurChange(mockEvent as any);        
            expect(component.waitingOnValidation).toBe(false);
            expect(mockToastrFactory.error).toHaveBeenCalledWith('Failed to re-estimate claim services.  Please contact support.', 'Error');
        });
    });  
    
    describe('updateClaimWithEstimates', () => {
        let claim;
        let estimates;
      
        beforeEach(() => {          
          claim = {
            ServiceTransactionToClaimPaymentDtos: [
              {
                ServiceTransactionId: '101',
                AllowedAmount:200,
                OriginalAllowedAmount:200,
                TotalInsurancePayments: 0,
                AdjustedEstimate: 0,
                PatientBalance: 0,
                InsuranceEstimate: 180,
                EstimatedInsuranceAdjustment: 0,
              },
              {
                ServiceTransactionId: '102',
                AllowedAmount: 200,
                OriginalAllowedAmount:200,
                TotalInsurancePayments: 0,
                AdjustedEstimate: 0,
                PatientBalance: 0,
                InsuranceEstimate: 180,
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
        });
      
        it('should update the claim services with the provided estimates', () => {
          component.updateClaimWithEstimates(claim, estimates);
      
          expect(claim.ServiceTransactionToClaimPaymentDtos[0].AllowedAmount).toEqual(150);
          expect(claim.ServiceTransactionToClaimPaymentDtos[0].TotalInsurancePayments).toEqual(0);
          expect(claim.ServiceTransactionToClaimPaymentDtos[0].PatientBalance).toEqual(0);
          expect(claim.ServiceTransactionToClaimPaymentDtos[0].InsuranceEstimate).toEqual(50);
          expect(claim.ServiceTransactionToClaimPaymentDtos[0].EstimatedInsuranceAdjustment).toEqual(0);
      
          expect(claim.ServiceTransactionToClaimPaymentDtos[1].AllowedAmount).toEqual(150);
          expect(claim.ServiceTransactionToClaimPaymentDtos[1].TotalInsurancePayments).toEqual(0);
          expect(claim.ServiceTransactionToClaimPaymentDtos[1].PatientBalance).toEqual(0);
          expect(claim.ServiceTransactionToClaimPaymentDtos[1].InsuranceEstimate).toEqual(90);
          expect(claim.ServiceTransactionToClaimPaymentDtos[1].EstimatedInsuranceAdjustment).toEqual(0);
        });  
    
        it('should update claim with calculated totals', () => {
          component.updateClaimWithEstimates(claim, estimates);  
          expect(claim.TotalEstimatedInsurance).toEqual(140);
          expect(claim.TotalEstInsuranceAdj).toEqual(88);
          expect(claim.AllowedAmount).toEqual(300);
        }); 
        
        it('should call recalculateClaimEstimateTotals', () => {
            spyOn(component, 'recalculateClaimEstimateTotals');
            component.updateClaimWithEstimates(claim, estimates);  
            expect(component.recalculateClaimEstimateTotals).toHaveBeenCalledWith(claim);
        });  
      });

      describe('loadUpdatedEstimates', () => {
          var mockEstimates: SoarResponse<InsuranceEstimateDto[]>;
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
            component.filter.UpdatedEstimates = [{
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
              expect(component.filter.UpdatedEstimates.length).toBe(1);
              expect(component.filter.UpdatedEstimates).toEqual(mockEstimates.Value);
          });
      
          it('should replace existing estimates with the same EstimatedInsuranceId', () => {      
            mockEstimates.Value[0].AllowedAmountOverride = 110.00;
            component.loadUpdatedEstimates(mockEstimates);
            expect(component.filter.UpdatedEstimates.length).toBe(1);
            expect(component.filter.UpdatedEstimates[0].AllowedAmountOverride).toBe(110);
          }); 
          
          it('should add estimates with different EstimatedInsuranceId', () => {
            mockEstimates.Value[0].AllowedAmount = 110.00;      
            mockEstimates.Value[0].EstimatedInsuranceId = '67890'; // Different ID
            component.loadUpdatedEstimates(mockEstimates);
            expect(component.filter.UpdatedEstimates.length).toBe(2);
            expect(component.filter.UpdatedEstimates[0].AllowedAmount).toBe(150);
            expect(component.filter.UpdatedEstimates[1].AllowedAmount).toBe(110);
          });  
        }); 
        
    
  describe('validateAllowedAmounts', () => {  
    beforeEach(() => {
      // Arrange
      component.insurancePayments = [
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
              FeeScheduleGroupDetailId: ''
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
              FeeScheduleGroupDetailId: ''
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
      component.insurancePayments[0].ServiceTransactionToClaimPaymentDtos[0].AllowedAmount = 100;
      component.insurancePayments[0].ServiceTransactionToClaimPaymentDtos[0].Charges = 50; 
      component.validateAllowedAmounts();
      expect(component.invalidAllowedAmounts).toBe(true);
    }); 
  
    it('should set invalidAllowedAmounts to false if no AllowedAmount exceeds charge', () => {
      component.insurancePayments[0].ServiceTransactionToClaimPaymentDtos[0].AllowedAmount = 100;
      component.insurancePayments[0].ServiceTransactionToClaimPaymentDtos[0].Charges = 110; 
      component.validateAllowedAmounts();
      expect(component.invalidAllowedAmounts).toBe(false);
    });
  
    
  });

  describe('snapshotOriginalEstimates', () => {
    beforeEach(() => {
      spyOn(component, 'recalculateClaimEstimateTotals');
      component.insurancePayments = [
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
              FeeScheduleGroupDetailId: ''
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
              FeeScheduleGroupDetailId: ''
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
              FeeScheduleGroupDetailId: ''
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
      const originalEstimates = component.snapshotOriginalEstimates(component.insurancePayments);
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

      component.insurancePayments = [
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
              FeeScheduleGroupDetailId: ''
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
              FeeScheduleGroupDetailId: ''
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

      component.filter.UpdatedEstimates = [
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

      const claim = component.insurancePayments[0];
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

      expect(component.filter.UpdatedEstimates.length).toBe(0);
      expect(component.hasEditedAllowedAmounts).toBe(false);
    });

    it('should call recalculateClaimEstimateTotals for each claim', () => {
      spyOn(component, 'recalculateClaimEstimateTotals');
      component.resetAllowedAmounts();        
      expect(component.recalculateClaimEstimateTotals).toHaveBeenCalledWith(component.insurancePayments[0]);
    });    
  }); 
  
  
  describe('handleUpdatedAllowedAmounts', () => {
    beforeEach(() => {
      //spyOn(component, 'goToPreviousPage');
      spyOn(component, 'openFeeScheduleUpdateModal');
    });
      it('should open fee schedule update modal if user is authorized', () => {
      (mockPatSecurityService.IsAuthorizedByAbbreviation as jasmine.Spy).and.returnValue(true);
      const updatedAllowedAmounts: UpdatedAllowedAmountDto[] = [{ FeeScheduleId: '1' } as UpdatedAllowedAmountDto];
      component.openFeeScheduleUpdateModal = jasmine.createSpy();

      component.handleUpdatedAllowedAmounts(updatedAllowedAmounts);

      expect(component.openFeeScheduleUpdateModal).toHaveBeenCalledWith(updatedAllowedAmounts);
      //expect(component.goToPreviousPage).not.toHaveBeenCalled();
    });

    it('should go to previous page if user is not authorized', () => {
      (mockPatSecurityService.IsAuthorizedByAbbreviation as jasmine.Spy).and.returnValue(false);
      const updatedAllowedAmounts: UpdatedAllowedAmountDto[] = [{ FeeScheduleId: '1' } as UpdatedAllowedAmountDto];
      component.openFeeScheduleUpdateModal = jasmine.createSpy();

      component.handleUpdatedAllowedAmounts(updatedAllowedAmounts);

      expect(component.openFeeScheduleUpdateModal).not.toHaveBeenCalled();
      //expect(component.goToPreviousPage).toHaveBeenCalled();
    });
  });

  describe('getUpdatedAllowedAmounts', () => {
    beforeEach(() => {  
        component.insurancePayments = [
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
      component.insurancePayments[0].ServiceTransactionToClaimPaymentDtos[0].AllowedAmount = 120;
      component.insurancePayments[0].ServiceTransactionToClaimPaymentDtos[1].AllowedAmount = 250;
      component.insurancePayments[0].ServiceTransactionToClaimPaymentDtos[0].OriginalAllowedAmount = 120;
      component.insurancePayments[0].ServiceTransactionToClaimPaymentDtos[1].OriginalAllowedAmount = 100;
      const updatedAllowedAmounts = component.getUpdatedAllowedAmounts(component.insurancePayments);

      expect(updatedAllowedAmounts.length).toBe(1);
      expect(updatedAllowedAmounts[0].UpdatedAmount).toBe(250);
      expect(updatedAllowedAmounts[0].CurrentAmount).toBe(100);
    });

    it('should return an empty array if no AllowedAmount has changed', () => {
      component.insurancePayments[0].ServiceTransactionToClaimPaymentDtos[0].AllowedAmount = 120;
      component.insurancePayments[0].ServiceTransactionToClaimPaymentDtos[1].AllowedAmount = 100;
      component.insurancePayments[0].ServiceTransactionToClaimPaymentDtos[0].OriginalAllowedAmount = 120;
      component.insurancePayments[0].ServiceTransactionToClaimPaymentDtos[1].OriginalAllowedAmount = 100;
      const updatedAllowedAmounts = component.getUpdatedAllowedAmounts(component.insurancePayments);

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

function overlaySpyHelper(overlayService) {
    const simulateClickBackdropEvent = { callback: null };
    const simulateDetachmentEvent = { callback: null };
    const overlayRefSpyObj = jasmine.createSpyObj({
        attach: null,
        backdropClick: jasmine.createSpyObj({ subscribe: null }),
        detach: null,
        detachments: jasmine.createSpyObj({ subscribe: null }),
    });
    const createSpy = spyOn(overlayService, 'create').and.returnValue(overlayRefSpyObj);
    overlayRefSpyObj.backdropClick().subscribe.and.callFake((cb) => {
        simulateClickBackdropEvent.callback = cb;
    });
    overlayRefSpyObj.detachments().subscribe.and.callFake((cb) => {
        simulateDetachmentEvent.callback = cb;
    });
    return { createSpy, overlayRefSpyObj, simulateClickBackdropEvent, simulateDetachmentEvent };
}