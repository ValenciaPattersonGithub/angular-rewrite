import { PatientCheckoutPaymentsComponent } from './patient-checkout-payments.component';
import { TranslateModule } from '@ngx-translate/core';
import { PatientCheckoutService } from '../providers/patient-checkout.service';
import { CreditTransaction } from '../models/patient-encounter.model';
import { TransactionTypes } from 'src/@shared/models/transaction-enum';
import { WaitOverlayService } from 'src/@shared/components/wait-overlay/wait-overlay.service';
import { Component, CUSTOM_ELEMENTS_SCHEMA, SimpleChanges, ViewChild } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { AppButtonComponent } from 'src/@shared/components/form-controls/button/button.component';
import { CurrencyInputComponent } from 'src/@shared/components/currency-input/currency-input.component';
import { AppLabelComponent } from 'src/@shared/components/form-controls/form-label/form-label.component';
import { FormsModule } from '@angular/forms';
import { DatePickerModule } from '@progress/kendo-angular-dateinputs';
import { By, DomSanitizer } from '@angular/platform-browser';
import { AdjustmentTypesService } from 'src/@shared/providers/adjustment-types.service';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { FeatureFlagService } from 'src/featureflag/featureflag.service';
import { of } from 'rxjs/internal/observable/of';
import { PaymentProvider } from 'src/@shared/enum/accounting/payment-provider';
import { CurrencyType } from 'src/@core/models/currency/currency-type.model';

describe('PatientCheckoutPaymentsComponent', () => {
  let parentComponent: MockPatientCheckoutComponent;
  let component: PatientCheckoutPaymentsComponent;
  let fixture: ComponentFixture<MockPatientCheckoutComponent>;

  let mockPatientCheckoutService;
  let mockModalFactory;
  let mockStaticDataService;
  let mockReferenceDataService;
  let mockLocationService;
  let mockToastrFactory;
  let mockPatSecurityService;
  let mockAdjustmentTypesService;
  let mockUserServices;
  let mockPaymentGatewayService;
  let mockWaitOverlayService;
  let mockLocalizeService;
  let mockFeatureFlagService;
  let mockPatientServices;
  let sanitizerSpy: jasmine.SpyObj<DomSanitizer>;


  beforeEach(() => {
    mockPatientCheckoutService = {
      getUnappliedCreditTransactionDetailAmount: jasmine.createSpy().and.callFake(() => {
        return [];
      }),
      getUnappliedCreditTransactions: jasmine.createSpy().and.callFake(() => {
        return [{}, {}, {}];
      }),
      getTotalUnappliedAmountFromCreditTransactions: jasmine.createSpy().and.callFake(() => {
        return 0;
      }),
      initializeCreditTransaction: jasmine.createSpy().and.callFake(() => new CreditTransaction()),
    };

    mockModalFactory = {
      CardServiceDisabledModal: jasmine.createSpy().and.callFake(() => {
        return {
          then(callback) {
            callback({ Value: [] });
          },
        };
      }),
    };

    mockStaticDataService = {
      TransactionTypes: jasmine.createSpy().and.callFake(array => {
        return {
          then(callback) {
            callback({ Value: [] });
          },
        };
      }),
    };

    mockReferenceDataService = {};

    mockLocationService = {
      getCurrentLocation: function (x) {
        return { id: '1' };
      },
    };

    mockToastrFactory = {
      success: jasmine.createSpy('toastrFactory.success'),
      error: jasmine.createSpy('toastrFactory.error'),
    };

    mockPatSecurityService = {
      IsAuthorizedByAbbreviation: jasmine.createSpy().and.returnValue(true),
    };

    mockAdjustmentTypesService = {
      get: jasmine.createSpy().and.callFake(array => {
        return {
          then(callback) {
            callback(array);
          },
        };
      }),
    };

    mockUserServices = {
      Users: {
        get: jasmine.createSpy().and.callFake(array => {
          return {
            then(callback) {
              callback(array);
            },
          };
        }),
      },
    };

    mockPaymentGatewayService = {
      createCreditForEncounter: jasmine.createSpy().and.callFake(array => {
        return {
          then(callback) {
            callback(array);
          },
        };
      }),
      createDebitForEncounter: jasmine.createSpy().and.callFake(array => {
        return {
          then(callback) {
            callback(array);
          },
        };
      }),
      createPaymentProviderCreditOrDebitPayment: jasmine.createSpy().and.callFake(() => {
        return {
          $promise: {
            then: (res, error) => {
              res({ Value: { PaymentGatewayTransactionId: 4713 } });
            },
          },
        };
      }),
      completeCreditTransaction: jasmine.createSpy(),
    };

    mockWaitOverlayService = jasmine.createSpyObj<WaitOverlayService>('mockWaitOverlayService', ['open']);
    sanitizerSpy = jasmine.createSpyObj('DomSanitizer', ['bypassSecurityTrustResourceUrl']);
    mockLocalizeService = {
      getLocalizedString: () => 'translated text',
    };
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
  });

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [FormsModule, DatePickerModule, TranslateModule.forRoot(), NoopAnimationsModule],
      declarations: [
        MockPatientCheckoutComponent,
        PatientCheckoutPaymentsComponent,
        AppButtonComponent,
        CurrencyInputComponent,
        AppLabelComponent,
      ],
      providers: [
        {
          provide: WaitOverlayService,
          useValue: mockWaitOverlayService,
        },
        {
          provide: PatientCheckoutService,
          useValue: mockPatientCheckoutService,
        },
        {
          provide: 'referenceDataService',
          useValue: mockReferenceDataService,
        },
        {
          provide: 'PaymentGatewayService',
          useValue: mockPaymentGatewayService,
        },
        {
          provide: 'toastrFactory',
          useValue: mockToastrFactory,
        },
        {
          provide: 'patSecurityService',
          useValue: mockPatSecurityService,
        },
        {
          provide: AdjustmentTypesService,
          useValue: mockAdjustmentTypesService,
        },
        {
          provide: 'StaticData',
          useValue: mockStaticDataService,
        },
        {
          provide: 'localize',
          useValue: mockLocalizeService,
        },
        {
          provide: 'locationService',
          useValue: mockLocationService,
        },
        {
          provide: 'UserServices',
          useValue: mockUserServices,
        },
        {
          provide: 'ModalFactory',
          useValue: mockModalFactory,
        },
        { provide: FeatureFlagService, useValue: mockFeatureFlagService },
        { provide: 'PatientServices', useValue: mockPatientServices },
        { provide: DomSanitizer, useValue: sanitizerSpy },
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    });
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MockPatientCheckoutComponent);
    parentComponent = fixture.componentInstance;
    parentComponent.dataForUnappliedTransactions = {
      unappliedCreditTransactions: [],
    };
    fixture.detectChanges();
    component = parentComponent.paymentsComponent;
  });

  it('should create', () => {
    expect(parentComponent).toBeDefined();
  });

  describe('ngOnInit', () => {
    beforeEach(() => {
      spyOn(component, 'loadDependancies').and.callFake(() => {});
      spyOn(component, 'validateCreditTransaction').and.callFake(() => {});
    });

    it('should call dependancies ', () => {
      component.ngOnInit();
      expect(component.loadDependancies).toHaveBeenCalled();
    });

    it('should set selectedTransactionTypeId to 2 ', () => {
      component.ngOnInit();
      expect(component.selectedTransactionTypeId).toBe('2');
    });

    it('should call initializePaymentOrAdjustment ', () => {
      spyOn(component, 'initializePaymentOrAdjustment');
      component.ngOnInit();
      expect(component.initializePaymentOrAdjustment).toHaveBeenCalled();
    });
  });

  describe('initializePaymentOrAdjustment', () => {
    beforeEach(() => {
      component.selectedTransactionTypeId = '2';
    });

    it('should initialize the creditTransaction ', () => {
      component.initializePaymentOrAdjustment();
      expect(component.creditTransaction.TransactionTypeId).toBe(2);
    });
  });

  describe('ngOnChanges', () => {
    beforeEach(() => {
      component.transactionTypes = [{ TransactionTypeId: 1 }, { TransactionTypeId: 2 }];
      spyOn(component, 'loadDataForUnappliedTransactions').and.callFake(() => {});
      spyOn(component, 'validateCreditTransaction').and.callFake(() => {});
    });

    it('should call loadDataForUnappliedTransactions ', () => {
      const values: SimpleChanges = {};
      component.ngOnChanges(values);
      expect(component.loadDataForUnappliedTransactions).toHaveBeenCalled();
    });
  });

  describe('loadDataForUnappliedTransactions', () => {
    let unappliedTransactions;
    beforeEach(() => {
      component.transactionTypes = [{ TransactionTypeId: 1 }, { TransactionTypeId: 2 }];
      component.adjustmentTypes = [{}, {}];
      component.paymentTypes = [{}, {}];
      component.creditTransactions = [
        { DateEntered: '2020-09-09' },
        { DateEntered: '2020-09-09', TransactionTypeId: 2 },
      ];
      component.dataForUnappliedTransactions = {
        totalAvailableCredit: 0,
        totalBalanceDue: 0,
        totalUnappliedAmount: 0,
        unappliedCreditTransactions: [],
      };

      unappliedTransactions = [
        {
          Amount: -100,
          CreditTransactionId: '6167',
          DateEntered: '2020-12-07T04:26:15.3251243',
          TransactionTypeId: TransactionTypes.CreditPayment,
        },
        {
          Amount: -200,
          CreditTransactionId: '6168',
          DateEntered: '2020-12-07T14:26:15.3251243',
          TransactionTypeId: TransactionTypes.CreditPayment,
        },
      ];
      spyOn(component, 'validateCreditTransaction').and.callFake(() => {});
    });

    it('should not call patientCheckoutService.getUnappliedCreditTransactionDetailAmount if no creditTransactions', () => {
      component.creditTransactions = [];
      component.loadDataForUnappliedTransactions();
      expect(mockPatientCheckoutService.getUnappliedCreditTransactionDetailAmount).not.toHaveBeenCalled();
    });

    it('should add Z to unappliedCreditTransaction.DateEnteredDisplay for utc handling', () => {
      mockPatientCheckoutService.getUnappliedCreditTransactions = jasmine.createSpy().and.callFake(() => {
        return unappliedTransactions;
      });
      component.dataForUnappliedTransactionsLoaded = false;
      component.loadDataForUnappliedTransactions();
      expect(component.dataForUnappliedTransactions.unappliedCreditTransactions[0].DateEnteredDisplay).toEqual(
        '2020-12-07T04:26:15.3251243Z'
      );
      expect(component.dataForUnappliedTransactions.unappliedCreditTransactions[1].DateEnteredDisplay).toEqual(
        '2020-12-07T14:26:15.3251243Z'
      );
    });

    it(
      'should call patientCheckoutService.getUnassignedCreditTransactionDetailAmount if transactionTypes ' +
        ' and paymentTypes and adjustmentTypes and creditTransactions and dataForUnappliedTransactionsLoaded is false',
      () => {
        mockPatientCheckoutService.getUnappliedCreditTransactions = jasmine.createSpy().and.callFake(() => {
          return unappliedTransactions;
        });
        component.dataForUnappliedTransactionsLoaded = false;
        component.loadDataForUnappliedTransactions();
        expect(mockPatientCheckoutService.getUnappliedCreditTransactionDetailAmount).toHaveBeenCalled();
      }
    );

    it('should disable all this.dataForUnappliedTransactions.unappliedCreditTransactions if dataForUnappliedTransactions.totalBalanceDue is zero', () => {
      mockPatientCheckoutService.getUnappliedCreditTransactions = jasmine.createSpy().and.callFake(() => {
        return unappliedTransactions;
      });
      mockPatientCheckoutService.getUnappliedCreditTransactionDetailAmount = jasmine.createSpy().and.callFake(() => {
        return 50;
      });
      mockPatientCheckoutService.getTotalUnappliedAmountFromCreditTransactions = jasmine
        .createSpy()
        .and.callFake(() => {
          return 75.0;
        });
      component.dataForUnappliedTransactions.totalBalanceDue = 0;
      component.dataForUnappliedTransactionsLoaded = false;
      component.loadDataForUnappliedTransactions();
      component.dataForUnappliedTransactions.unappliedCreditTransactions.forEach(unappliedCreditTransaction => {
        expect(unappliedCreditTransaction.IsDisabled).toBe(true);
      });
    });

    it(
      'should enable all this.dataForUnappliedTransactions.unappliedCreditTransactions where AvailableUnassignedAmount is more than 0 ' +
        'if dataForUnappliedTransactions.totalBalanceDue is more than zero',
      () => {
        mockPatientCheckoutService.getUnappliedCreditTransactions = jasmine.createSpy().and.callFake(() => {
          return unappliedTransactions;
        });
        mockPatientCheckoutService.getUnappliedCreditTransactionDetailAmount = jasmine.createSpy().and.callFake(() => {
          return 50;
        });
        mockPatientCheckoutService.getTotalUnappliedAmountFromCreditTransactions = jasmine
          .createSpy()
          .and.callFake(() => {
            return 75.0;
          });
        component.dataForUnappliedTransactions.totalBalanceDue = 100;
        component.dataForUnappliedTransactionsLoaded = false;
        component.loadDataForUnappliedTransactions();
        component.dataForUnappliedTransactions.unappliedCreditTransactions.forEach(unappliedCreditTransaction => {
          expect(unappliedCreditTransaction.IsDisabled).toBe(false);
        });
      }
    );

    it(
      'should disable all this.dataForUnappliedTransactions.unappliedCreditTransactions where AvailableUnassignedAmount is  0 ' +
        'if dataForUnappliedTransactions.totalBalanceDue is more than zero',
      () => {
        mockPatientCheckoutService.getUnappliedCreditTransactions = jasmine.createSpy().and.callFake(() => {
          return unappliedTransactions;
        });
        mockPatientCheckoutService.getUnappliedCreditTransactionDetailAmount = jasmine.createSpy().and.callFake(() => {
          return 0;
        });
        mockPatientCheckoutService.getTotalUnappliedAmountFromCreditTransactions = jasmine
          .createSpy()
          .and.callFake(() => {
            return 75.0;
          });
        component.dataForUnappliedTransactions.totalBalanceDue = 100;
        component.dataForUnappliedTransactionsLoaded = false;
        component.loadDataForUnappliedTransactions();
        component.dataForUnappliedTransactions.unappliedCreditTransactions.forEach(unappliedCreditTransaction => {
          expect(unappliedCreditTransaction.IsDisabled).toBe(true);
        });
      }
    );
  });

  describe('onPaymentTypeChange', () => {
    let event;
    beforeEach(() => {
      event = {};
      // creditTransaction object
      component.creditTransaction = new CreditTransaction();
      component.creditTransaction.TransactionTypeId = 2;
      component.creditTransaction.Amount = 100;
      component.creditTransaction.PaymentTypeId = '1234';
      component.creditTransaction.PaymentTypePromptValue = 'Check';
      component.paymentTypes = [
        { PaymentTypeId: '123', Prompt: 'Number' },
        { PaymentTypeId: '345', Prompt: '' },
        { PaymentTypeId: '678', Prompt: 'Number', CurrencyTypeId: CurrencyType.CreditCard },
        { PaymentTypeId: '910', Prompt: 'Number' },
      ];
      spyOn(component, 'validateCreditTransaction').and.callFake(() => {});
    });

    it('should set component.creditTransaction.PaymentTypeId to match parameter', () => {
      var paymentTypeId = '123';
      component.onPaymentTypeChange(paymentTypeId);
      expect(component.creditTransaction.PaymentTypeId).toEqual(paymentTypeId);
    });

    it('should set component.creditTransaction.PromptTitle to match paymentType', () => {
      var paymentTypeId = '123';
      component.onPaymentTypeChange(paymentTypeId);
      expect(component.creditTransaction.PromptTitle).toEqual('Number');

      paymentTypeId = '345';
      component.onPaymentTypeChange(paymentTypeId);
      expect(component.creditTransaction.PromptTitle).toEqual('');

      paymentTypeId = '678';
      component.onPaymentTypeChange(paymentTypeId);
      expect(component.creditTransaction.PromptTitle).toEqual('Number');
    });

    it('should reset component.creditTransaction.PromptTitle to null', () => {
      component.creditTransaction.PaymentTypePromptValue = 'Check';
      var paymentTypeId = '345';
      component.onPaymentTypeChange(paymentTypeId);
      expect(component.creditTransaction.PaymentTypePromptValue).toBe(null);
    });

    it('should show Card Readers dropdown when Credit card selected and have card readers value', () => {
      component.ngOnInit();
      component.showPaymentProvider = true;
      component.location = {
        LocationId: 123,
        IsPaymentGatewayEnabled: true,
        PaymentProvider: PaymentProvider.TransactionsUI,
      };
      var paymentTypeId = '678';
      component.onPaymentTypeChange(paymentTypeId);
      fixture.detectChanges();
      expect(component.showCreditCardDropDown).toBe(true);
    });

    it('should not show Card Readers dropdown when Credit card selected and feature flag is disabled', () => {
      component.ngOnInit();
      component.showPaymentProvider = false;
      var paymentTypeId = '678';
      component.onPaymentTypeChange(paymentTypeId);
      fixture.detectChanges();
      expect(component.showCreditCardDropDown).toBe(false);
    });
  });

  describe('validateCreditTransaction', () => {
    let maxDate;
    let minDate;
    beforeEach(() => {
      maxDate = new Date();
      component.maxDate = new Date();
      minDate = new Date(1900, 0, 1);
      component.minDate = new Date(1900, 0, 1);
      component.paymentTypes = [
        { PaymentTypeId: 123, Prompt: 'Number' },
        { PaymentTypeId: 345, Prompt: '' },
        { PaymentTypeId: 678, Prompt: 'Number' },
        { PaymentTypeId: 910, Prompt: 'Number' },
        { PaymentTypeId: 678, Description: 'Credit Card', Prompt: 'Number' },
      ];
      component.dataForUnappliedTransactions = {
        totalAvailableCredit: 0,
        totalBalanceDue: 0,
        totalUnappliedAmount: 0,
        unappliedCreditTransactions: [],
      };
      // creditTransaction object
      component.creditTransaction = new CreditTransaction();
      component.creditTransaction.TransactionTypeId = 2;
      component.creditTransaction.Amount = 100;
      component.creditTransaction.PaymentTypeId = '1234';
    });

    it('should set component.allowPaymentApply to false if there is not PaymentTypeId or AdjustmentTypeId', () => {
      component.creditTransaction.AdjustmentTypeId = null;
      component.creditTransaction.PaymentTypeId = '0';
      component.validateCreditTransaction();
      expect(component.allowPaymentApply).toBe(false);
    });

    it('should set component.allowPaymentApply to false if component.creditTransaction.DateEntered is in future', () => {
      const aDayInTheFuture = new Date(maxDate.setDate(maxDate.getDate() + 7));
      component.creditTransaction.DateEntered = aDayInTheFuture;
      component.validateCreditTransaction();
      expect(component.allowPaymentApply).toBe(false);
    });

    it('should set component.allowPaymentApply to false if component.creditTransaction.DateEntered is earlier than the minimum allowed date', () => {
      const aDayBeforeMinDate = new Date(minDate.setDate(minDate.getDate() - 1));
      component.creditTransaction.DateEntered = aDayBeforeMinDate;
      component.validateCreditTransaction();
      expect(component.allowPaymentApply).toBe(false);
    });

    it('should set component.allowPaymentApply to false if component.creditTransaction.Amount is 0 or less than 0', () => {
      component.creditTransaction.Amount = 0;
      component.validateCreditTransaction();
      expect(component.allowPaymentApply).toBe(false);

      component.creditTransaction.Amount = -1;
      component.validateCreditTransaction();
      expect(component.allowPaymentApply).toBe(false);
    });

    it(
      'should set component.allowPaymentApply to false if this ' +
        'is an unapplied transaction the creditTransaction.Amount can not be more than the totalAvailableCredit',
      () => {
        component.dataForUnappliedTransactions.TotalAvailableCredit = 30.0;
        const aDayInTheFuture = maxDate.setDate(maxDate.getDate() + 7);
        component.creditTransaction.DateEntered = aDayInTheFuture;
        component.validateCreditTransaction();
        expect(component.allowPaymentApply).toBe(false);
      }
    );

    it('should set component.allowPaymentApply to true all of the above conditions are false', () => {
      component.dataForUnappliedTransactions.TotalAvailableCredit = 30.0;
      component.creditTransaction.Amount = 30.0;
      component.creditTransaction.PaymentTypeId = '1234';
      component.creditTransaction.DateEntered = new Date();
      component.validateCreditTransaction();
      expect(component.allowPaymentApply).toBe(true);
    });

    it('should set component.allowPaymentApply to true if have valid amount and selectedCardReader ', () => {
      component.creditTransaction.Amount = 30.0;
      component.creditTransaction.PaymentTypeId = '678';
      component.showPaymentProvider = true;
      component.showCreditCardDropDown = true;
      component.selectedCardReader = '1';
      component.creditTransaction.DateEntered = new Date();
      component.validateCreditTransaction();
      expect(component.allowPaymentApply).toBe(true);
    });
    it('should set component.allowPaymentApply to false if have valid amount and invalid selectedCardReader ', () => {
      component.creditTransaction.Amount = 30.0;
      component.showPaymentProvider = true;
      component.creditTransaction.PaymentTypeId = '678';
      component.showCreditCardDropDown = true;
      component.selectedCardReader = '0';
      component.creditTransaction.DateEntered = new Date();
      component.validateCreditTransaction();
      expect(component.allowPaymentApply).toBe(false);
    });
    it('should set component.allowPaymentApply to false if have invalid amount and valid selectedCardReader ', () => {
      component.creditTransaction.Amount = 0.0;
      component.showPaymentProvider = true;
      component.creditTransaction.PaymentTypeId = '678';
      component.showCreditCardDropDown = true;
      component.selectedCardReader = '1';
      component.creditTransaction.DateEntered = new Date();
      component.validateCreditTransaction();
      expect(component.allowPaymentApply).toBe(false);
    });
    it('should set component.allowPaymentApply to false if DateEntered is null', () => {
      component.creditTransaction.Amount = 10.0;
      component.showPaymentProvider = true;
      component.creditTransaction.PaymentTypeId = '678';
      component.creditTransaction.DateEntered = null;
      component.showCreditCardDropDown = true;
      component.selectedCardReader = '1';
      component.validateCreditTransaction();
      expect(component.allowPaymentApply).toBe(false);
    });
  });

  describe('onTransactionTypeChange', () => {
    let event;
    beforeEach(() => {
      event = {};
      component.transactionTypes = [{ TransactionTypeId: 1 }, { TransactionTypeId: 2 }];
      component.adjustmentTypes = [{}, {}];
      component.paymentTypes = [{}, {}];
      component.creditTransaction = new CreditTransaction();
      component.creditTransaction.TransactionTypeId = 2;
      component.creditTransaction.Amount = 100;
      component.creditTransaction.PaymentTypeId = '1234';

      spyOn(component, 'validateCreditTransaction').and.callFake(() => {});
    });

    it('should set initial PaymentTypeId value to 0 if selectedTransactionTypeId is 2', () => {
      component.selectedTransactionTypeId = '2';
      component.creditTransaction.PaymentTypeId = null;
      component.onTransactionTypeChange(event);
      expect(component.creditTransaction.PaymentTypeId).toEqual('0');
      expect(component.creditTransaction.AdjustmentTypeId).toEqual(null);
      expect(component.creditTransaction.PromptTitle).toEqual(null);
      expect(component.creditTransaction.PaymentTypePromptValue).toEqual(null);
    });

    it('should set initial AdjustmentTypeId value to 0 if TransactionTypeId is 4', () => {
      component.creditTransaction.PaymentTypeId = null;
      component.selectedTransactionTypeId = '4';
      component.onTransactionTypeChange(event);
      expect(component.creditTransaction.PaymentTypeId).toEqual(null);
      expect(component.creditTransaction.AdjustmentTypeId).toEqual('0');
      expect(component.creditTransaction.PromptTitle).toEqual(null);
      expect(component.creditTransaction.PaymentTypePromptValue).toEqual(null);
    });

    it('should set allowPaymentApply to false and initial  PromptTitle and PaymentTypePromptValue to null', () => {
      component.creditTransaction.PaymentTypeId = null;
      component.selectedTransactionTypeId = '2';
      component.onTransactionTypeChange(event);
      component.allowPaymentApply = false;
      expect(component.creditTransaction.PromptTitle).toEqual(null);
      expect(component.creditTransaction.PaymentTypePromptValue).toEqual(null);
    });
  });

  describe('applyUnappliedCredit', () => {
    let unappliedCredit;
    let unappliedCredits;
    beforeEach(() => {
      unappliedCredits = [
        {
          CreditTransactionId: '123',
          UnassignedAmount: 25,
          IsDisabled: false,
          DateEnteredDisplay: new Date(),
          Type: 'Cash',
          Description: 'Cash1',
        },
        {
          CreditTransactionId: '456',
          UnassignedAmount: 25,
          IsDisabled: false,
          DateEnteredDisplay: new Date(),
          Type: 'Credit',
          Description: 'Credit1',
        },
      ];
      unappliedCredit = { CreditTransactionId: '123', UnassignedAmount: 25, IsDisabled: false };
      component.hasDistributionChanges = false;
      component.dataForUnappliedTransactions = {
        totalAvailableCredit: 0,
        totalBalanceDue: 0,
        totalUnappliedAmount: 0,
        unappliedCreditTransactions: unappliedCredits,
      };
      fixture.detectChanges();
    });

    it('should set unappliedCredit.UnassignedAmount.IsDisabled and Applied to equal true if hasDistributionChanges is false', () => {
      component.applyUnappliedCredit(unappliedCredit);
      expect(unappliedCredit.IsDisabled).toBe(true);
      expect(unappliedCredit.Applied).toBe(true);
    });

    it('should emit unsignedCredit if its less than dataForUnappliedTransactions.totalBalanceDue  if hasDistributionChanges is false', () => {
      component.addUnappliedCredit.emit = jasmine.createSpy();
      component.applyUnappliedCredit(unappliedCredit);
      expect(component.addUnappliedCredit.emit).toHaveBeenCalled();
    });

    it('should emit promptUserOnNavigation if hasDistributionChanges is true', () => {
      component.hasDistributionChanges = true;
      component.promptUserOnNavigation.emit = jasmine.createSpy();
      component.applyUnappliedCredit(unappliedCredit);
      expect(component.promptUserOnNavigation.emit).toHaveBeenCalled();
    });

    /*
        Shoot what happens if its not less....
        */

    it('should disable button element when credits are applied', () => {
      const debugElement = fixture.debugElement;
      const unappliedCreditRows = debugElement.queryAll(By.css('.unappliedCreditRow'));
      unappliedCreditRows.forEach(row => {
        const button = row.query(By.css('app-button > button'));
        expect((button.nativeElement as HTMLButtonElement).disabled).toBe(false);
      });

      unappliedCreditRows[0].query(By.css('app-button > button')).triggerEventHandler('click', null);

      fixture.detectChanges();

      expect(
        (unappliedCreditRows[0].query(By.css('app-button > button')).nativeElement as HTMLButtonElement).disabled
      ).toBe(true);
      expect(
        (unappliedCreditRows[1].query(By.css('app-button > button')).nativeElement as HTMLButtonElement).disabled
      ).toBe(false);

      unappliedCreditRows[1].query(By.css('app-button > button')).triggerEventHandler('click', null);

      fixture.detectChanges();

      expect(
        (unappliedCreditRows[0].query(By.css('app-button > button')).nativeElement as HTMLButtonElement).disabled
      ).toBe(true);
      expect(
        (unappliedCreditRows[1].query(By.css('app-button > button')).nativeElement as HTMLButtonElement).disabled
      ).toBe(true);
    });

    it('should disabled buttons for unapplied credits if total balance equals zero', () => {
      const debugElement = fixture.debugElement;
      const unappliedCreditRows = debugElement.queryAll(By.css('.unappliedCreditRow'));

      const addUnappliedCredit = function () {
        this.dataForUnappliedTransactions.totalBalanceDue = 0;
        // trigger side-effect to call ngOnChanges and update paymentsComponent
        this.updateSummary = !this.updateSummary;
      };

      parentComponent.addUnappliedCredit = jasmine.createSpy().and.callFake(addUnappliedCredit.bind(parentComponent));

      unappliedCreditRows[0].query(By.css('app-button > button')).triggerEventHandler('click', null);

      fixture.detectChanges();

      unappliedCreditRows.forEach(row => {
        const button = row.query(By.css('app-button > button'));
        expect((button.nativeElement as HTMLButtonElement).disabled).toBe(true);
      });
    });
  });

  describe('addPaymentOrAdjustment with hasDistributionChanges true', () => {
    beforeEach(() => {
      component.creditTransaction = new CreditTransaction();
      component.hasDistributionChanges = false;
      component.paymentTypes = [
        { CurrencyTypeId: 3, PaymentTypeId: '1' },
        { CurrencyTypeId: 2, PaymentTypeId: '2' },
      ];

      sessionStorage.setItem('userContext', JSON.stringify({ Result: { User: { UserId: 3 } } }));
    });

    it('should emit promptSaveDistribution if hasDistributionChanges is true', () => {
      component.hasDistributionChanges = true;
      component.promptUserOnNavigation.emit = jasmine.createSpy();
      component.applyPaymentOrAdjustment();
      expect(component.promptUserOnNavigation.emit).toHaveBeenCalled();
    });

    it('should call applyPayment if req1 is false and others are true', () => {
      component.creditTransaction.PaymentTypeId = '2';
      component.location = { IsPaymentGatewayEnabled: false, MerchantId: '123' };

      component.applyPayment = jasmine.createSpy();
      component.applyPaymentOrAdjustment();
      expect(component.applyPayment).toHaveBeenCalled();
    });

    it('should call applyPayment if req2 is false and others are true', () => {
      component.creditTransaction.PaymentTypeId = '1';
      component.location = { IsPaymentGatewayEnabled: true, MerchantId: '123' };

      component.applyPayment = jasmine.createSpy();
      component.applyPaymentOrAdjustment();
      expect(component.applyPayment).toHaveBeenCalled();
    });

    it('should call applyPayment if req3 is false and others are true', () => {
      component.creditTransaction.PaymentTypeId = '1';
      component.location = { IsPaymentGatewayEnabled: false, MerchantId: 0 };

      component.applyPayment = jasmine.createSpy();
      component.applyPaymentOrAdjustment();
      expect(component.applyPayment).toHaveBeenCalled();
    });

    it('should display modal if all reqs are true and user is set to show modal', () => {
      let successResult = {
        Value: {
          ShowCardServiceDisabledMessage: true,
        },
      };

      mockUserServices.Users = {
        get: jasmine.createSpy().and.returnValue({
          $promise: { then: (success, failure) => success(successResult) },
        }),
      };

      component.creditTransaction.PaymentTypeId = '1';
      component.location = { IsPaymentGatewayEnabled: false, MerchantId: '123' };

      component.applyPayment = jasmine.createSpy();

      component.applyPaymentOrAdjustment();
      expect(component.applyPayment).toHaveBeenCalled();
      expect(mockModalFactory.CardServiceDisabledModal).toHaveBeenCalled();
    });
  });

  describe('continueApplyPayment', () => {
    beforeEach(() => {
      component.creditTransaction = new CreditTransaction();
      component.paymentTransaction = new CreditTransaction();
      component.hasDistributionChanges = false;
      component.paymentTypes = [
        { CurrencyTypeId: 3, PaymentTypeId: '1' },
        { CurrencyTypeId: 2, PaymentTypeId: '2' },
      ];

      sessionStorage.setItem('userContext', JSON.stringify({ Result: { User: { UserId: 3 } } }));
    });

    it('should call addPaymentOrAdjustment.emit with creditTransaction if hasDistributionChanges is false', () => {
      component.addPaymentOrAdjustment.emit = jasmine.createSpy();
      component.continueApplyPayment('1');
      expect(component.addPaymentOrAdjustment.emit).toHaveBeenCalled();
    });

    it('should call initializePaymentOrAdjustment if hasDistributionChanges is false', () => {
      component.initializePaymentOrAdjustment = jasmine.createSpy();
      component.continueApplyPayment('1');
      expect(component.initializePaymentOrAdjustment).toHaveBeenCalled();
    });

    it('should set component.allowPaymentApply to false if hasDistributionChanges is false', () => {
      component.allowPaymentApply = true;
      component.continueApplyPayment('1');
      expect(component.allowPaymentApply).toBe(false);
    });
  });

  describe('applyPayment', () => {
    beforeEach(() => {
      component.creditTransaction = new CreditTransaction();
      component.paymentTypes = [
        { CurrencyTypeId: 3, PaymentTypeId: '1' },
        { CurrencyTypeId: 2, PaymentTypeId: '2' },
        { CurrencyTypeId: 4, PaymentTypeId: '3' },
      ];
      component.location = { IsPaymentGatewayEnabled: true };
      spyOn(component, 'validateCreditTransaction');
    });

    it('should call validateCreditTransaction', () => {
      component.creditTransaction.PaymentTypeId = '1';
      component.createCredit = jasmine.createSpy();
      component.applyPayment();
      expect(component.validateCreditTransaction).toHaveBeenCalled();
    });

    it(
      'should call createCredit when creditTransaction.PaymentTypeId is 1 (CurrencyTypeId = 3)  ' +
        'and credit card enabled and component.allowPaymentApply is true',
      () => {
        component.creditTransaction.PaymentTypeId = '1';
        component.allowPaymentApply = true;
        component.createCredit = jasmine.createSpy();
        component.applyPayment();
        expect(component.createCredit).toHaveBeenCalled();
      }
    );

    it(
      'should not call createCredit when creditTransaction.PaymentTypeId is 1 (CurrencyTypeId = 3)  ' +
        'and credit card enabled and component.allowPaymentApply is false',
      () => {
        component.allowPaymentApply = false;
        component.creditTransaction.PaymentTypeId = '1';
        component.createCredit = jasmine.createSpy();
        component.applyPayment();
        expect(component.createCredit).not.toHaveBeenCalled();
      }
    );

    it(
      'should call createDebit when creditTransaction.PaymentTypeId is 3 (CurrencyTypeId = 4)  ' +
        'and credit card enabled and component.allowPaymentApply is true',
      () => {
        component.creditTransaction.PaymentTypeId = '3';
        component.allowPaymentApply = true;
        component.createDebit = jasmine.createSpy();
        component.applyPayment();
        expect(component.createDebit).toHaveBeenCalled();
      }
    );

    it(
      'should not call createDebit when creditTransaction.PaymentTypeId is 3 (CurrencyTypeId = 4)  ' +
        'and credit card enabled and component.allowPaymentApply is false',
      () => {
        component.allowPaymentApply = false;
        component.creditTransaction.PaymentTypeId = '3';
        component.createDebit = jasmine.createSpy();
        component.applyPayment();
        expect(component.createDebit).not.toHaveBeenCalled();
      }
    );

    it('should call continueApplyPayment when IsPaymentGatewayEnabled is false and component.allowPaymentApply is true', () => {
      component.creditTransaction.PaymentTypeId = '1';
      component.allowPaymentApply = true;
      component.continueApplyPayment = jasmine.createSpy();
      component.location.IsPaymentGatewayEnabled = false;
      component.applyPayment();
      expect(component.continueApplyPayment).toHaveBeenCalledWith(false);
    });

    it('should not call continueApplyPayment when IsPaymentGatewayEnabled is false and component.allowPaymentApply is false', () => {
      component.allowPaymentApply = false;
      component.creditTransaction.PaymentTypeId = '1';
      component.continueApplyPayment = jasmine.createSpy();
      component.location.IsPaymentGatewayEnabled = false;
      component.applyPayment();
      expect(component.continueApplyPayment).not.toHaveBeenCalled();
    });

    it(
      'should call continueApplyPayment when creditTransaction.PaymentTypeId neither 1 or 3  ' +
        'and credit card enabled and component.allowPaymentApply is true',
      () => {
        component.allowPaymentApply = true;
        component.creditTransaction.PaymentTypeId = '2';
        component.continueApplyPayment = jasmine.createSpy();
        component.applyPayment();
        expect(component.continueApplyPayment).toHaveBeenCalledWith(false);
      }
    );

    it(
      'should not call continueApplyPayment when creditTransaction.PaymentTypeId neither 1 or 3  ' +
        'and credit card enabled and component.allowPaymentApply is false',
      () => {
        component.allowPaymentApply = false;
        component.creditTransaction.PaymentTypeId = '2';
        component.continueApplyPayment = jasmine.createSpy();
        component.applyPayment();
        expect(component.continueApplyPayment).not.toHaveBeenCalled();
      }
    );
  });

  describe('cardTransactionOnErrorCallback', () => {
    beforeEach(() => {
      spyOn(component, 'removeWaitOverlay');
    });

    it('should call creditCardLoadingModal.close', () => {
      component.cardTransactionOnErrorCallback();
      expect(component.removeWaitOverlay).toHaveBeenCalled();
    });
  });

  describe('handlePartialPayment', () => {
    beforeEach(() => {
      component.creditTransaction = new CreditTransaction();
      component.paymentTransaction = new CreditTransaction();
      component.creditTransaction.PaymentGatewayTransactionId = 0;
      component.creditTransaction.Amount = 1;
      component.paymentTypes = [
        { CurrencyTypeId: 3, PaymentTypeId: '1' },
        { CurrencyTypeId: 2, PaymentTypeId: '2' },
        { CurrencyTypeId: 4, PaymentTypeId: '3' },
      ];
      component.location = { IsPaymentGatewayEnabled: true };
      spyOn(component, 'removeWaitOverlay');
    });

    it('should call creditCardLoadingModal.close', () => {
      component.handlePartialPayment('1', false);
      expect(component.removeWaitOverlay).toHaveBeenCalled();
    });

    it('should call continueApplyPayment if requestedAmount equals creditTransaction.Amount and approvedAmount is not provided ', () => {
      component.requestedAmount = 99;
      component.creditTransaction.Amount = 99;
      component.continueApplyPayment = jasmine.createSpy();
      component.handlePartialPayment('1', false);
      expect(component.continueApplyPayment).toHaveBeenCalled();
    });

    it(
      'should reset creditTransaction.Amount to requestedAmount if requestedAmount does not equal creditTransaction.Amount ' +
        'and call continueApplyPayment',
      () => {
        component.requestedAmount = 99;
        component.creditTransaction.Amount = 98;
        component.continueApplyPayment = jasmine.createSpy();
        component.handlePartialPayment('1', false);
        expect(component.creditTransaction.Amount).toBe(99);
        expect(component.continueApplyPayment).toHaveBeenCalled();
      }
    );

    it('should reset creditTransaction.Amount to approvedAmount and call continueApplyPayment if partial approval ', () => {
      component.requestedAmount = 99;
      component.creditTransaction.Amount = 99;
      component.continueApplyPayment = jasmine.createSpy();
      component.handlePartialPayment('1', 97);
      expect(component.creditTransaction.Amount).toBe(97);
      expect(component.continueApplyPayment).toHaveBeenCalled();
    });
  });

  describe('onPaymentChanged', () => {
    let amount;
    beforeEach(() => {
      component.creditTransaction = new CreditTransaction();
      component.creditTransaction.Amount = 98;
      spyOn(component, 'validateCreditTransaction');
      amount = { NewValue: 99, OldValue: 98 };
    });

    it('should reset creditTransaction.Amount if amount.NewValue', () => {
      component.onPaymentChanged(amount);
      expect(component.creditTransaction.Amount).toEqual(99);
    });

    it('should not reset creditTransaction.Amount if amount.NewValue is undefined', () => {
      amount.NewValue = undefined;
      component.onPaymentChanged(amount);
      expect(component.creditTransaction.Amount).toEqual(0);
    });

    it('should call validateCreditTransaction in each case', () => {
      amount.NewValue = undefined;
      component.onPaymentChanged(amount);
      expect(component.validateCreditTransaction).toHaveBeenCalled();

      amount.NewValue = 99;
      component.onPaymentChanged(amount);
      expect(component.validateCreditTransaction).toHaveBeenCalled();
    });
  });

  describe('createCredit', () => {
    beforeEach(() => {
      component.creditTransaction = new CreditTransaction();
      component.creditTransaction.PaymentGatewayTransactionId = 0;
      component.creditTransaction.Amount = 1;
      component.creditTransaction.AccountId = '123';
      component.location = { IsPaymentGatewayEnabled: true, PaymentProvider: PaymentProvider.OpenEdge };
      component.getCardTransactionOverlay = jasmine.createSpy();
    });

    it('should set requestedAmount from creditTransaction.Amount', () => {
      component.createCredit();
      expect(component.requestedAmount).toEqual(component.creditTransaction.Amount);
    });

    it('should set creditCardLoadingModal to return value from getCardTransactionOverlay', () => {
      component.createCredit();
      expect(component.waitOverlay).toEqual(component.getCardTransactionOverlay());
    });
    it('should call createCreditForEncounter', () => {
      component.createCredit();
      expect(mockPaymentGatewayService.createCreditForEncounter).toHaveBeenCalled();
    });
  });

  describe('createDebit', () => {
    beforeEach(() => {
      component.creditTransaction = new CreditTransaction();
      component.creditTransaction.PaymentGatewayTransactionId = 0;
      component.creditTransaction.Amount = 1;
      component.creditTransaction.AccountId = '123';
      component.location = { IsPaymentGatewayEnabled: true, PaymentProvider: PaymentProvider.OpenEdge };
      component.getCardTransactionOverlay = jasmine.createSpy();
    });

    it('should set requestedAmount from creditTransaction.Amount', () => {
      component.createDebit();
      expect(component.requestedAmount).toEqual(component.creditTransaction.Amount);
    });

    it('should set waitOverlay to return value from getCardTransactionOverlay', () => {
      component.createDebit();
      expect(component.waitOverlay).toEqual(component.getCardTransactionOverlay());
    });
    it('should call createDebitForEncounter', () => {
      component.createDebit();
      expect(mockPaymentGatewayService.createDebitForEncounter).toHaveBeenCalled();
    });
  });

  describe('getCardTransactionOverlay', () => {
    beforeEach(() => {
      component.creditTransaction = new CreditTransaction();
      component.creditTransaction.PaymentGatewayTransactionId = 0;
      component.creditTransaction.Amount = 1;
      component.creditTransaction.AccountId = '123';
      component.location = { IsPaymentGatewayEnabled: true };
    });

    it('should call uibModal.open', () => {
      component.getCardTransactionOverlay();

      expect(mockWaitOverlayService.open).toHaveBeenCalled();
    });
  });

  describe('loadPaymentDevices', () => {
    it('should call getPaymentDevicesByLocationAsync api when Payment Integration enabled', () => {
      component.location = {
        LocationId: 123,
        IsPaymentGatewayEnabled: true,
        PaymentProvider: PaymentProvider.TransactionsUI,
      };
      component.showPaymentProvider = true;
      fixture.detectChanges();
    });

    it('should not call getPaymentDevicesByLocationAsync api when Payment Integration disabled', () => {
      component.location = {
        LocationId: 123,
        IsPaymentGatewayEnabled: false,
        PaymentProvider: PaymentProvider.TransactionsUI,
      };
      component.showPaymentProvider = true;
      fixture.detectChanges();
    });
  });

  describe('createCredit for GPI', () => {
    beforeEach(() => {
      component.creditTransaction = new CreditTransaction();
      component.creditTransaction.PaymentGatewayTransactionId = 0;
      component.creditTransaction.Amount = 1;
      component.creditTransaction.AccountId = '123';
      component.showPaymentProvider = true;
      component.creditTransaction.DateEntered = new Date();
      component.location = {
        LocationId: 123,
        IsPaymentGatewayEnabled: true,
        PaymentProvider: PaymentProvider.TransactionsUI,
      };
      component.paymentTypes = [
        { PaymentTypeId: '123', Prompt: 'Number' },
        { CurrencyTypeId: 1, PaymentTypeId: '910', Prompt: 'Number' },
        { CurrencyTypeId: 3, PaymentTypeId: '678', Description: 'Credit Card', Prompt: 'Number' },
      ];
      component.selectedCardReader = '1';
      component.creditTransaction.PaymentTypeId = '678';
    });

    it('should call createCredit', () => {
      spyOn(component, 'createCredit');
      component.applyPaymentOrAdjustment();
      expect(component.createCredit).toHaveBeenCalled();
    });

    it('should call setupCardPaymentTransaction on createCredit', () => {
      component.location.PaymentProvider = PaymentProvider.TransactionsUI;
      component.showPaymentProvider = true;
      spyOn(component, 'setupCardPaymentTransaction');

      component.createCredit();

      expect(component.setupCardPaymentTransaction).toHaveBeenCalled();

    });

    it('should call createCreditForEncounter on createCredit', () => {
      component.location.PaymentProvider = PaymentProvider.OpenEdge;
      component.showPaymentProvider = false;
      component.createCredit();
      expect(component['paymentGatewayService'].createCreditForEncounter).toHaveBeenCalled();
    });

    it('should call setupCardPaymentTransaction on createDebit', () => {
      component.location.PaymentProvider = PaymentProvider.TransactionsUI;
      component.showPaymentProvider = true;
      spyOn(component, 'setupCardPaymentTransaction');
      component.createDebit();
      expect(component.setupCardPaymentTransaction).toHaveBeenCalled();
    });

    it('should call createDebitForEncounter on createDebit', () => {
      component.location.PaymentProvider = PaymentProvider.OpenEdge;
      component.showPaymentProvider = false;
      component.createDebit();
      expect(component['paymentGatewayService'].createDebitForEncounter).toHaveBeenCalled();
    });

    it('should call applyPayment method when calling applyPaymentOrAdjustment', () => {
      // Arrange
      spyOn(component, 'applyPayment');

      // Act
      component.applyPaymentOrAdjustment();

      // Assert
      expect(component.applyPayment).toHaveBeenCalled();
    });
  });


  describe('onPaymentTypeChange hide Number Prompt ', () => {
    let event;
    beforeEach(() => {
      event = {};
      // creditTransaction object
      component.creditTransaction = new CreditTransaction();
      component.creditTransaction.TransactionTypeId = TransactionTypes.CreditPayment;
      component.creditTransaction.PaymentTypeId = '1234';

      component.paymentTypes = [
        { CurrencyTypeId: CurrencyType.Other, PaymentTypeId: '678', Prompt: 'text', Description: 'Other' },
        { CurrencyTypeId: CurrencyType.DebitCard, PaymentTypeId: '789', Prompt: 'Number', Description: 'Debit Card' },
        {
          CurrencyTypeId: CurrencyType.CreditCard,
          PaymentTypeId: '1234',
          Description: 'Credit Card',
          Prompt: 'Number',
        },
      ];
      spyOn(component, 'validateCreditTransaction').and.callFake(() => {});
    });

    it('should set component.creditTransaction.PromptTitle null for selected GPI configured location location when credit card payment type selected', () => {
      var paymentTypeId = '1234';
      component.location = {
        LocationId: 123,
        IsPaymentGatewayEnabled: true,
        PaymentProvider: PaymentProvider.TransactionsUI,
      };
      component.onPaymentTypeChange(paymentTypeId);
      expect(component.creditTransaction.PromptTitle).toEqual(null);
    });
    it('should set component.creditTransaction.PromptTitle null for selected GPI configured location when debit card payment type selected', () => {
      component.creditTransaction.PaymentTypeId = '789';
      var paymentTypeId = '789';
      component.location = {
        LocationId: 123,
        IsPaymentGatewayEnabled: true,
        PaymentProvider: PaymentProvider.TransactionsUI,
      };
      component.onPaymentTypeChange(paymentTypeId);
      expect(component.creditTransaction.PromptTitle).toEqual(null);
    });
    it('should set component.creditTransaction.PromptTitle text for selected GPI configured location when other payment type selected', () => {
      component.creditTransaction.PaymentTypeId = '678';
      var paymentTypeId = '678';
      component.location = {
        LocationId: 123,
        IsPaymentGatewayEnabled: true,
        PaymentProvider: PaymentProvider.TransactionsUI,
      };
      component.onPaymentTypeChange(paymentTypeId);
      expect(component.creditTransaction.PromptTitle).toEqual('text');
    });
    it('should set component.creditTransaction.PromptTitle not null for selected open edge configured location when credit card payment type selected', () => {
      component.creditTransaction.PaymentTypeId = '789';
      var paymentTypeId = '789';
      component.location = {
        LocationId: 123,
        IsPaymentGatewayEnabled: true,
        PaymentProvider: PaymentProvider.OpenEdge,
      };
      component.onPaymentTypeChange(paymentTypeId);
      expect(component.creditTransaction.PromptTitle).toEqual('Number');
    });
  });

});

@Component({
  selector: 'mock-patient-checkout',
  template: `
    <patient-checkout-payments
      [(creditTransactions)]="creditTransactions"
      [(hasDistributionChanges)]="hasDistributionChanges"
      [(dataForUnappliedTransactions)]="dataForUnappliedTransactions"
      [(paymentTypes)]="paymentTypes"
      [(negativeAdjustmentTypes)]="negativeAdjustmentTypes"
      (addUnappliedCredit)="addUnappliedCredit($event)"
      (addPaymentOrAdjustment)="addPaymentOrAdjustment($event)"
      [(updateSummary)]="updateSummary"
      (promptUserOnNavigation)="promptToSaveOrRollbackDistribution()"
      [accountId]="accountId"
      [accountMembersDetails]="accountMembersDetails">
    </patient-checkout-payments>
  `,
})
class MockPatientCheckoutComponent {
  @ViewChild(PatientCheckoutPaymentsComponent) paymentsComponent: PatientCheckoutPaymentsComponent;
  dataForUnappliedTransactions: {
    unappliedCreditTransactions: {}[];
  };

  addUnappliedCredit() {}

  addPaymentOrAdjustment() {}
}
