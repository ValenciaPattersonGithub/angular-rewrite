import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InsurancePaymentTypesDropdownComponent } from './insurance-payment-types-dropdown.component';
import { OrderByPipe } from 'src/@shared/pipes/order-by/order-by.pipe';
import { DropDownsModule } from '@progress/kendo-angular-dropdowns';
import { configureTestSuite } from 'src/configure-test-suite';
import { PaymentTypesService } from 'src/@shared/providers/payment-types.service';
import { CurrencyType } from 'src/@core/models/currency/currency-type.model';

let paymentTypeService: any;
let toastrFactory: any;
let paymentTypes: any;

describe('InsurancePaymentTypesDropdownComponent', () => {
  let component: InsurancePaymentTypesDropdownComponent;
  let fixture: ComponentFixture<InsurancePaymentTypesDropdownComponent>;

  let mockPaymentTypesService;
  let mockTostarfactory: any;
  let mockLocalizeService: any;
  let mockPatSecurityService;

  configureTestSuite(() => {
    paymentTypes = [
      {
        Description: 'Beta',
        PaymentTypeId: 1,
        PaymentTypeCategory: 2,
        CurrencyTypeId: CurrencyType.Cash,
        IsActive: true,
      },
      {
        Description: 'Zeta',
        PaymentTypeId: 2,
        PaymentTypeCategory: 2,
        CurrencyTypeId: CurrencyType.Check,
        IsActive: true,
      },
      {
        Description: 'Alpha',
        PaymentTypeId: 3,
        PaymentTypeCategory: 2,
        CurrencyTypeId: CurrencyType.CreditCard,
        IsActive: true,
      },
    ];

    mockPaymentTypesService = {
      getAllPaymentTypesMinimal: () => {
        return {
          then: (res, error) => {
            res({ Value: [] }), error({});
          },
        };
      },
    };

    mockTostarfactory = {
      error: jasmine.createSpy().and.returnValue('Error Message'),
      success: jasmine.createSpy().and.returnValue('Success Message'),
    };

    mockLocalizeService = {
      getLocalizedString: () => 'translated text',
    };

    TestBed.configureTestingModule({
      imports: [DropDownsModule],
      providers: [
        { provide: 'toastrFactory', useValue: mockTostarfactory },
        { provide: PaymentTypesService, useValue: mockPaymentTypesService },
        { provide: 'localize', useValue: mockLocalizeService },
      ],
      declarations: [InsurancePaymentTypesDropdownComponent, OrderByPipe],
    });
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(InsurancePaymentTypesDropdownComponent);
    component = fixture.componentInstance;
    paymentTypeService = TestBed.get(PaymentTypesService);
    toastrFactory = TestBed.get('toastrFactory');
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit ->', () => {
    it('should call the payment types service and retrun insurance payment types', () => {
      spyOn(paymentTypeService, 'getAllPaymentTypesMinimal').and.returnValue(
        Promise.resolve(paymentTypes)
      );
      component.ngOnInit();
      expect(paymentTypeService.getAllPaymentTypesMinimal).toHaveBeenCalled();
    });
  });

  describe('ngOnChanges ->', () => {
    it('should call the initial payment selection change method when a change made to the initial selection input variable', () => {
      var changes = { initialSelectedPaymentType: { currentValue: 1 } };
      spyOn(component, 'initialPaymentTypeSelectionChange');
      component.ngOnChanges(changes);

      expect(component.initialPaymentTypeSelectionChange).toHaveBeenCalledWith(
        changes.initialSelectedPaymentType
      );
    });
    it('should not call the initial payment selection change method when no change made to the initial selection input variable', () => {
      var changes = {};
      spyOn(component, 'initialPaymentTypeSelectionChange');
      component.ngOnChanges(changes);

      expect(
        component.initialPaymentTypeSelectionChange
      ).not.toHaveBeenCalled();
    });
  });

  describe('initialPaymentTypeSelectionChange ->', () => {
    it('should set the initial selection variable and call the payment change method if valid input change', () => {
      var change = { previousValue: null, currentValue: 1 };
      spyOn(component, 'addInactivePaymentTypeToDropDown');
      spyOn(component, 'paymentTypesChanged');
      component.initialPaymentTypeSelectionChange(change);

      expect(component.initialSelectedPaymentType).toBe(change.currentValue);
      expect(component.addInactivePaymentTypeToDropDown).toHaveBeenCalled();
      expect(component.paymentTypesChanged).toHaveBeenCalledWith(
        change.currentValue
      );
    });
    it('should not set the initial selection variable or call the payment change method if currentValue is null', () => {
      var change = { previousValue: 1, currentValue: null };
      spyOn(component, 'addInactivePaymentTypeToDropDown');
      spyOn(component, 'paymentTypesChanged');
      component.initialPaymentTypeSelectionChange(change);

      expect(component.initialSelectedPaymentType).toBe(undefined);
      expect(component.addInactivePaymentTypeToDropDown).not.toHaveBeenCalled();
      expect(component.paymentTypesChanged).not.toHaveBeenCalled();
    });
    it('should not set the initial selection variable or call the payment change method if currentValue equals previousValue', () => {
      var change = { previousValue: 1, currentValue: 1 };
      spyOn(component, 'addInactivePaymentTypeToDropDown');
      spyOn(component, 'paymentTypesChanged');
      component.initialPaymentTypeSelectionChange(change);

      expect(component.initialSelectedPaymentType).toBe(undefined);
      expect(component.addInactivePaymentTypeToDropDown).not.toHaveBeenCalled();
      expect(component.paymentTypesChanged).not.toHaveBeenCalled();
    });
  });

  describe('getInsurancePaymentTypesSuccess ->', () => {
    it('should set insurancePaymentTypes variable', () => {
      spyOn(component, 'filterInsurancePaymentTypes');
      var res = { Value: paymentTypes };
      component.getInsurancePaymentTypesSuccess(res);

      expect(component.filterInsurancePaymentTypes).toHaveBeenCalledWith(
        paymentTypes
      );
      expect(component.insurancePaymentTypes).toEqual(paymentTypes);
    });
    it('should not set insurancePaymentTypes variable if empty list is given', () => {
      component.insurancePaymentTypes = [];
      spyOn(component, 'filterInsurancePaymentTypes');
      component.getInsurancePaymentTypesSuccess([]);

      expect(component.filterInsurancePaymentTypes).not.toHaveBeenCalled();
      expect(component.insurancePaymentTypes.length).toBe(0);
    });
    it('should not set insurancePaymentTypes variable if null is given', () => {
      component.insurancePaymentTypes = [];
      spyOn(component, 'filterInsurancePaymentTypes');
      component.getInsurancePaymentTypesSuccess(null);

      expect(component.filterInsurancePaymentTypes).not.toHaveBeenCalled();
      expect(component.insurancePaymentTypes.length).toBe(0);
    });
  });

  describe('getInsurancePaymentTypesFailure ->', () => {
    it('should call toastrFactory.error', () => {
      component.getInsurancePaymentTypesFailure();

      expect(toastrFactory.error).toHaveBeenCalled();
    });
  });
  
describe('filterInsurancePaymentTypes ->', () => {
  it('should filter out inactive types and order the results by description', () => {
    paymentTypes[0].IsActive = false;
    component.filterInsurancePaymentTypes(paymentTypes);

    expect(component.insurancePaymentTypes.length).toBe(2);
    expect(component.insurancePaymentTypes[0].Description).toBe('Alpha');
    expect(component.insurancePaymentTypes[1].Description).toBe('Zeta');
  });

  it('should show all active payment types and include credit card types when isPatientInsMultiClaim is false', () => {
    paymentTypes[0].IsActive = true;
    component.isPatientInsMultiClaim = false;
    spyOn(component, 'filterInsurancePaymentTypes').and.callThrough();
    component.filterInsurancePaymentTypes(paymentTypes);

    expect(component.insurancePaymentTypes.length).toBe(3);
    expect(component.insurancePaymentTypes.some(pt => pt.CurrencyTypeId === CurrencyType.CreditCard)).toBeTruthy();
    expect(component.insurancePaymentTypes.some(pt => pt.CurrencyTypeId === CurrencyType.Cash)).toBeTruthy();
    expect(component.insurancePaymentTypes.some(pt => pt.CurrencyTypeId === CurrencyType.Check)).toBeTruthy();
  });

  it('should show all active payment types and exclude credit card types when isPatientInsMultiClaim is true', () => {
    component.isPatientInsMultiClaim = true;
    spyOn(component, 'filterInsurancePaymentTypes').and.callThrough();
    component.filterInsurancePaymentTypes(paymentTypes);

    expect(component.insurancePaymentTypes.length).toBe(2);
    expect(component.insurancePaymentTypes.some(pt => pt.CurrencyTypeId === CurrencyType.CreditCard)).toBeFalsy();
    expect(component.insurancePaymentTypes.some(pt => pt.CurrencyTypeId === CurrencyType.Cash)).toBeTruthy();
    expect(component.insurancePaymentTypes.some(pt => pt.CurrencyTypeId === CurrencyType.Check)).toBeTruthy();
  });
});

  describe('addInactivePaymentTypeToDropDown ->', () => {
    beforeEach(function () {
      component.insurancePaymentTypes = [paymentTypes[0], paymentTypes[2]];
      paymentTypes[1].IsActive = false;
      component.allInsurancePaymentTypes = paymentTypes;
    });
    it('should add inactive type of the initial payment type selection and order the results by description', () => {
      component.initialSelectedPaymentType = 2;
      component.addInactivePaymentTypeToDropDown();

      expect(component.insurancePaymentTypes.length).toBe(3);
      expect(component.insurancePaymentTypes[0].Description).toBe('Alpha');
      expect(component.insurancePaymentTypes[1].Description).toBe('Beta');
      expect(component.insurancePaymentTypes[2].Description).toBe('Zeta');
    });
    it('should not add active type of the initial payment type selection since already present', () => {
      component.initialSelectedPaymentType = 1;
      component.addInactivePaymentTypeToDropDown();

      expect(component.insurancePaymentTypes.length).toBe(2);
      expect(component.insurancePaymentTypes[0].Description).toBe('Beta');
      expect(component.insurancePaymentTypes[1].Description).toBe('Alpha');
    });
    it('should not change insurance payment list if initial selection variable is undefined', () => {
      component.addInactivePaymentTypeToDropDown();

      expect(component.insurancePaymentTypes.length).toBe(2);
      expect(component.insurancePaymentTypes[0].Description).toBe('Beta');
      expect(component.insurancePaymentTypes[1].Description).toBe('Alpha');
    });
    it('should not change insurance payment list if list is undefined', () => {
      component.insurancePaymentTypes = null;
      component.initialSelectedPaymentType = 2;
      component.addInactivePaymentTypeToDropDown();

      expect(component.insurancePaymentTypes).toBe(null);
    });
    it('should not add payment type of the initial payment type selection if not found in list of all payment types', () => {
      component.initialSelectedPaymentType = 4;
      component.addInactivePaymentTypeToDropDown();

      expect(component.insurancePaymentTypes.length).toBe(2);
      expect(component.insurancePaymentTypes[0].Description).toBe('Beta');
      expect(component.insurancePaymentTypes[1].Description).toBe('Alpha');
    });
  });

  describe('paymentTypesChanged ->', () => {
    it('should set emit -1 if given null', () => {
      component.selectedPaymentTypeChange.subscribe(g => {
        expect(g).toEqual(null);
      });
      component.paymentTypesChanged(null);
    });
    it('should set emit to the payment type with the given payment type id', () => {
      component.insurancePaymentTypes = paymentTypes;
      component.selectedPaymentTypeChange.subscribe(g => {
        expect(g).toEqual(paymentTypes[1]);
      });
      component.paymentTypesChanged(2);
      expect(component.selectedPaymentTypeId).toBe(2);
    });
  });

  describe('itemDisabled ->', () => {
    it('should return true if the default/header is selected (PaymentTypeId == null)', () => {
      var result = component.itemDisabled({
        dataItem: { PaymentTypeId: null },
        index: -1,
      });
      expect(result).toBe(true);
    });
    it('should return false if a valid payment type is selected (PaymentTypeId !== null)', () => {
      var result = component.itemDisabled({
        dataItem: { PaymentTypeId: 1 },
        index: -1,
      });
      expect(result).toBe(false);
    });
  });
});
