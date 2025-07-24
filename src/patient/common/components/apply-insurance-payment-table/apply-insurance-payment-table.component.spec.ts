import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ChangeDetectorRef } from '@angular/core';
import { ApplyInsurancePaymentTableComponent } from './apply-insurance-payment-table.component';
import { ServiceTransactionToClaimPaymentDto } from 'src/@core/models/bulk-payment/bulk-insurance-dtos.model';
import { OrderByFeelistPipe } from 'src/business-center/practice-settings/fee-lists/pipes/order-by-feelist.pipe';

describe('ApplyInsurancePaymentTableComponent', () => {
  let component: ApplyInsurancePaymentTableComponent;
  let fixture: ComponentFixture<ApplyInsurancePaymentTableComponent>;
  let mockTabLauncher;

  beforeEach(() => {
    const changeDetectorRefStub = () => ({});
    mockTabLauncher = {
      launchNewTab: jasmine.createSpy(),
    };
    TestBed.configureTestingModule({
      schemas: [NO_ERRORS_SCHEMA],
      declarations: [ApplyInsurancePaymentTableComponent],
      providers: [
        { provide: ChangeDetectorRef, useValue: changeDetectorRefStub },
        { provide: 'tabLauncher', useValue: mockTabLauncher },
      ],
    });
    fixture = TestBed.createComponent(ApplyInsurancePaymentTableComponent);
    component = fixture.componentInstance;
  });

  it('can load instance', () => {
    expect(component).toBeTruthy();
  });

  describe('serviceAmountBlurEvent', () => {
    let mockEvent;
    beforeEach(() => {
      mockEvent = {
        service: {
          PaymentAmount: {
            NewValue: 100,
          },
        },
      };
    });

    it('should update PaymentAmount and emit the event', () => {
      spyOn(component.serviceAmountBlurChange, 'emit');
      component.serviceAmountBlurEvent(mockEvent);
      expect(mockEvent.service.PaymentAmount).toBe(100);
      expect(component.serviceAmountBlurChange.emit).toHaveBeenCalledWith(mockEvent);
    });
  });

  describe('finalPaymentChangeEvent', () => {
    let mockEvent;
    beforeEach(() => {
      mockEvent = {
        FinalPayment: false,
      };
    });

    it('should toggle FinalPayment and emit the event', () => {
      spyOn(component.finalPaymentChange, 'emit');
      component.finalPaymentChangeEvent(mockEvent);

      expect(mockEvent.FinalPayment).toBe(true);
      expect(component.finalPaymentChange.emit).toHaveBeenCalledWith(mockEvent);
    });
  });

  describe('paymentAmountBlurEvent', () => {
    let mockEvent;

    beforeEach(() => {
      mockEvent = {
        claim: {
          PaymentAmount: null,
        },
        amount: 200,
      };
    });

    it('should update PaymentAmount and emit the event', () => {
      spyOn(component.paymentAmountBlurChange, 'emit');
      component.paymentAmountBlurEvent(mockEvent);
      expect(mockEvent.claim.PaymentAmount).toEqual(200);
      expect(component.paymentAmountBlurChange.emit).toHaveBeenCalledWith(mockEvent);
    });
  });

  describe('patientNameClickEvent', () => {
    let mockEvent;
    beforeEach(() => {
      mockEvent = 'John Doe';
    });

    it('should emit the event with patient name', () => {
      spyOn(component.patientNameClick, 'emit');

      component.patientNameClickEvent(mockEvent);

      expect(component.patientNameClick.emit).toHaveBeenCalledWith(mockEvent);
    });
  });

  describe('patientNameClickEvent', () => {
    let mockEvent;

    beforeEach(() => {
      mockEvent = 'John Doe';
    });

    it('should emit the event with patient name', () => {
      spyOn(component.patientNameClick, 'emit');

      component.patientNameClickEvent(mockEvent);

      expect(component.patientNameClick.emit).toHaveBeenCalledWith(mockEvent);
    });
  });

  describe('onAmountChanging', () => {
    let mockEvent;

    beforeEach(() => {
      mockEvent = {
        claim: {
          FinalPayment: false,
        },
      };
    });

    it('should set FinalPayment to true', () => {
      component.onAmountChanging(mockEvent);

      expect(mockEvent.claim.FinalPayment).toBe(true);
    });
  });

  describe('onAllowedAmountBlurEvent', () => {
    let mockEvent;
    beforeEach(() => {
      mockEvent = {
        service: {
          AllowedAmount: {
            NewValue: 131.5,
          },
        },
      };
    });

    it('should update AllowedAmount and emit the event', () => {
      spyOn(component.serviceAllowedAmountBlurChange, 'emit');
      component.onAllowedAmountBlurEvent(mockEvent);
      expect(mockEvent.service.AllowedAmount).toBe(131.5);
      expect(component.serviceAllowedAmountBlurChange.emit).toHaveBeenCalledWith(mockEvent);
    });
  });

  
  describe('shouldAllowEdit', () => {
    let serviceTransactionToClaimPaymentDto;
    beforeEach(() => {  
        serviceTransactionToClaimPaymentDto = {
            ServiceTransactionToClaimId: '1',
            ServiceTransactionId: '1',
            ClaimId: '1',
            DateEntered: new Date(),
            EstimatedInsuranceId: null,
            FeeScheduleId: '123',
            PaymentAmount: 0,
            AllowedAmount: 0,
            OriginalAllowedAmount: 0
        }
        component.canEditAllowedAmount = true;
    });

    it('should return false if canEditAllowedAmount is false', () => {
        component.canEditAllowedAmount = false;
        serviceTransactionToClaimPaymentDto.EstimatedInsuranceId =  '456';
        serviceTransactionToClaimPaymentDto.FeeScheduleId ='123'; 
        expect(component.shouldAllowEdit(serviceTransactionToClaimPaymentDto)).toBe(false);
    });

    it('should return false if FeeScheduleId is null', () => {
        component.canEditAllowedAmount = true;
        serviceTransactionToClaimPaymentDto.EstimatedInsuranceId =  '456';
        serviceTransactionToClaimPaymentDto.FeeScheduleId =null; 
        expect(component.shouldAllowEdit(serviceTransactionToClaimPaymentDto)).toBe(false);
    });

    it('should return false if EstimatedInsuranceId is null', () => {
        component.canEditAllowedAmount = true;
        serviceTransactionToClaimPaymentDto.EstimatedInsuranceId =  null;
        serviceTransactionToClaimPaymentDto.FeeScheduleId ='123'; 
        expect(component.shouldAllowEdit(serviceTransactionToClaimPaymentDto)).toBe(false);
    });

    it('should return false if EstimatedInsuranceId is undefined', () => {
        component.canEditAllowedAmount = true;
        serviceTransactionToClaimPaymentDto.EstimatedInsuranceId = undefined;
        serviceTransactionToClaimPaymentDto.FeeScheduleId ='123'; 
        expect(component.shouldAllowEdit(serviceTransactionToClaimPaymentDto)).toBe(false);
    });

    it('should return false if EstimatedInsuranceId is an empty GUID', () => {
        component.canEditAllowedAmount = true;
        serviceTransactionToClaimPaymentDto.EstimatedInsuranceId =  '00000000-0000-0000-0000-000000000000';
        serviceTransactionToClaimPaymentDto.FeeScheduleId ='123'; 
        expect(component.shouldAllowEdit(serviceTransactionToClaimPaymentDto)).toBe(false);        
    });

    it('should return true if all conditions are met', () => {
        component.canEditAllowedAmount = true;
        serviceTransactionToClaimPaymentDto.Charges = 10;
        serviceTransactionToClaimPaymentDto.EstimatedInsuranceId =  '4560';
        serviceTransactionToClaimPaymentDto.FeeScheduleId ='123'; 
        expect(component.shouldAllowEdit(serviceTransactionToClaimPaymentDto)).toBe(true);  
    });

    it('should return false if service.Charges equal 0', () => {
        component.canEditAllowedAmount = true;
        serviceTransactionToClaimPaymentDto.FeeScheduleId = '123';
        serviceTransactionToClaimPaymentDto.EstimatedInsuranceId = '456';
        serviceTransactionToClaimPaymentDto.Charges = 0;
        expect(component.shouldAllowEdit(serviceTransactionToClaimPaymentDto)).toBe(false);
    });
  });


  describe('getAllowedAmountTooltip', () => {
    let serviceTransactionToClaimPaymentDto;
    beforeEach(() => {  
        serviceTransactionToClaimPaymentDto = {
            ServiceTransactionToClaimId: '1',
            ServiceTransactionId: '1',
            ClaimId: '1',
            DateEntered: new Date(),
            EstimatedInsuranceId: null,
            FeeScheduleId: '123',
            PaymentAmount: 0,
            AllowedAmount: 0,
        }
        component.canEditAllowedAmount = true;
    });
    it('should return a message if EstimatedInsuranceId is null', () => {
        component.canEditAllowedAmount = true;
        serviceTransactionToClaimPaymentDto.EstimatedInsuranceId = null;
        serviceTransactionToClaimPaymentDto.FeeScheduleId ='123';        
        const result = component.getAllowedAmountTooltip(serviceTransactionToClaimPaymentDto);
        expect(result).toBe('Allowed Amount can only be edited for primary and secondary plans.');
    });    

    it('should return a message if EstimatedInsuranceId is an empty GUID', () => {
        component.canEditAllowedAmount = true;
        serviceTransactionToClaimPaymentDto.EstimatedInsuranceId= '00000000-0000-0000-0000-000000000000';
        serviceTransactionToClaimPaymentDto.FeeScheduleId ='123';
        const result = component.getAllowedAmountTooltip(serviceTransactionToClaimPaymentDto);
        expect(result).toBe('Allowed Amount can only be edited for primary and secondary plans.');
    });

    it('should return a message if FeeScheduleId is null', () => {
        component.canEditAllowedAmount = true;
        serviceTransactionToClaimPaymentDto.EstimatedInsuranceId= '4556';
        serviceTransactionToClaimPaymentDto.FeeScheduleId =null;
        const result = component.getAllowedAmountTooltip(serviceTransactionToClaimPaymentDto);
        expect(result).toBe('Allowed Amount cannot be edited because there is no fee schedule for this benefit plan.');
    });

    it('should return an empty string if all conditions are met', () => {
        component.canEditAllowedAmount = true;
       serviceTransactionToClaimPaymentDto.EstimatedInsuranceId= '456';
        serviceTransactionToClaimPaymentDto.FeeScheduleId ='123';
        const result = component.getAllowedAmountTooltip(serviceTransactionToClaimPaymentDto);
        expect(result).toBe('');
    });

    it('should return an empty string if canEditAllowedAmount is false', () => {
        component.canEditAllowedAmount = false;
        serviceTransactionToClaimPaymentDto.EstimatedInsuranceId= '456';
        serviceTransactionToClaimPaymentDto.FeeScheduleId ='123';
        const result = component.getAllowedAmountTooltip(serviceTransactionToClaimPaymentDto);
        expect(result).toBe('');
    });
  });

  
  describe('arePaymentsMoreThanCharge', () => {
    let serviceInTest;
    beforeEach(() => {
        serviceInTest= {
            ServiceTransactionToClaimId: '1',
            ServiceTransactionId: '1',
            ClaimId: '1',
            DateEntered: new Date(),
            EstimatedInsuranceId: null,
            FeeScheduleId: '123',
            Charges: 0,
            PaymentAmount: 0,
            AllowedAmount: 0,
            OriginalAllowedAmount: 0,
            FeeScheduleGroupDetailId: null,
            TotalInsurancePayments: 0
        }
        component.editMode = false;
    });

	
    it('should return false if canEditAllowedAmount is true and service is a FeeSchedule item ', () => {
      component.canEditAllowedAmount = true;
      serviceInTest.AllowedAmount = 0;
      serviceInTest.OriginalAllowedAmount = 0;
      serviceInTest.FeeScheduleGroupDetailId = '123';
      serviceInTest.Charges = 70.00;
      serviceInTest.TotalInsurancePayments = 5.00;
      serviceInTest.PaymentAmount = 66.00;
      expect(component.arePaymentsMoreThanCharge(serviceInTest)).toBe(false);
    });   

    it('should return true if canEditAllowedAmount is true and service is not a FeeSchedule item and  payment is more than the difference of the Charge minus the TotalInsurancePayment', () => {
      component.canEditAllowedAmount = true;
      serviceInTest.AllowedAmount = 0;
      serviceInTest.OriginalAllowedAmount = 0;
      serviceInTest.FeeScheduleGroupDetailId = null;
      serviceInTest.Charges = 70.00;
      serviceInTest.TotalInsurancePayments = 5.00;
      serviceInTest.PaymentAmount = 66.00;
      expect(component.arePaymentsMoreThanCharge(serviceInTest)).toBe(true);
    });

    it('should return true if canEditAllowedAmount is false and  payment is more than the difference of the Charge minus the TotalInsurancePayments', () => {
      component.canEditAllowedAmount = false;
      serviceInTest.AllowedAmount = 0;
      serviceInTest.OriginalAllowedAmount = 0;
      serviceInTest.FeeScheduleGroupDetailId = null;
      serviceInTest.Charges = 70.00;
      serviceInTest.TotalInsurancePayments = 5.00;
      serviceInTest.PaymentAmount = 66.00;
      expect(component.arePaymentsMoreThanCharge(serviceInTest)).toBe(true);
    });

    it('should return false if canEditAllowedAmount is false and payment is equal or less than the difference of the Charge minus the TotalInsurancePayments if no AllowedAmount  ', () => {
      component.canEditAllowedAmount = false;
      serviceInTest.AllowedAmount = 0;
      serviceInTest.OriginalAllowedAmount = 0;
      serviceInTest.FeeScheduleGroupDetailId = null;
      serviceInTest.Charges = 70.00;
      serviceInTest.TotalInsurancePayments = 5.00;
      serviceInTest.PaymentAmount = 65.00;
      expect(component.arePaymentsMoreThanCharge(serviceInTest)).toBe(false);
    });

    it('should always return false if payment is 0', () => {
      component.canEditAllowedAmount = true;
      serviceInTest.AllowedAmount = 0;
      serviceInTest.FeeScheduleGroupDetailId = '123';
      serviceInTest.Charges = 70.00;
      serviceInTest.TotalInsurancePayments = 5.00;
      serviceInTest.PaymentAmount = 0;
      expect(component.arePaymentsMoreThanCharge(serviceInTest)).toBe(false);
    });

    it('should always return false if editMode is true', () => {
      component.editMode = true;
      component.canEditAllowedAmount = true;
      serviceInTest.AllowedAmount = 0;
      serviceInTest.FeeScheduleGroupDetailId = '123';
      serviceInTest.Charges = 70.00;
      serviceInTest.TotalInsurancePayments = 5.00;
      serviceInTest.PaymentAmount = 70;
      expect(component.arePaymentsMoreThanCharge(serviceInTest)).toBe(false);
    });
    
  });

  
  describe('arePaymentsMoreThanAllowedAmount', () => {
    let serviceInTest;
    beforeEach(() => {
        serviceInTest= {
            ServiceTransactionToClaimId: '1',
            ServiceTransactionId: '1',
            ClaimId: '1',
            DateEntered: new Date(),
            EstimatedInsuranceId: null,
            FeeScheduleId: '123',
            PaymentAmount: 0,
            AllowedAmount: 0,
            Charges: 65,
            OriginalAllowedAmount: 0,
            FeeScheduleGroupDetailId: null,
            TotalInsurancePayments: 0
        }
        component.editMode = false;
    });
    it('should return true if canEditAllowedAmount is true and is FeeSchedule item and payment is more than the difference the AllowedAmount minus the TotalInsurancePayments', () => {
      component.canEditAllowedAmount = true;
      serviceInTest.AllowedAmount = 65.00;
      serviceInTest.FeeScheduleGroupDetailId = '123';
      serviceInTest.TotalInsurancePayments = 5.00;
      serviceInTest.PaymentAmount = 61.00;
      expect(component.arePaymentsMoreThanAllowedAmount(serviceInTest)).toBe(true);
    });

    it('should return false if canEditAllowedAmount is true and is FeeSchedule item and  payment is equal or less than the difference the AllowedAmount minus the TotalInsurancePayments  ', () => {
      component.canEditAllowedAmount = true;
      serviceInTest.AllowedAmount = 65.00;
      serviceInTest.FeeScheduleGroupDetailId = null;
      serviceInTest.TotalInsurancePayments = 5.00;
      serviceInTest.PaymentAmount = 60.00;
      expect(component.arePaymentsMoreThanAllowedAmount(serviceInTest)).toBe(false);
    });

    it('should return false if canEditAllowedAmount is true and is not FeeSchedule item and OriginalAllowedAmount equals AllowedAmount', () => {
      component.canEditAllowedAmount = true;
      serviceInTest.AllowedAmount = 0.00;
      serviceInTest.OriginalAllowedAmount = 0.00;
      serviceInTest.FeeScheduleGroupDetailId = null;
      serviceInTest.TotalInsurancePayments = 5.00;
      serviceInTest.PaymentAmount = 60.00;
      expect(component.arePaymentsMoreThanAllowedAmount(serviceInTest)).toBe(false);
    });

    it('should return true if canEditAllowedAmount is true and is not FeeSchedule item and OriginalAllowedAmount does not equals AllowedAmount', () => {
      component.canEditAllowedAmount = true;
      serviceInTest.AllowedAmount = 50.00;
      serviceInTest.OriginalAllowedAmount = 0.00;
      serviceInTest.FeeScheduleGroupDetailId = null;
      serviceInTest.TotalInsurancePayments = 6.00;
      serviceInTest.PaymentAmount = 60.00;
      expect(component.arePaymentsMoreThanAllowedAmount(serviceInTest)).toBe(true);
    });

    it('should return false if canEditAllowedAmount is false', () => {
      component.canEditAllowedAmount = false;
      serviceInTest.AllowedAmount = 0;
      serviceInTest.FeeScheduleGroupDetailId = null;
      serviceInTest.TotalInsurancePayments = 0;
      serviceInTest.PaymentAmount = 0;
      expect(component.arePaymentsMoreThanAllowedAmount(serviceInTest)).toBe(false);
    });

    it('should always return false if payment amount is 0', () => {
      component.canEditAllowedAmount = true;
      serviceInTest.AllowedAmount = 0;
      serviceInTest.FeeScheduleGroupDetailId = null;
      serviceInTest.TotalInsurancePayments = 10;
      serviceInTest.PaymentAmount = 0;
      expect(component.arePaymentsMoreThanAllowedAmount(serviceInTest)).toBe(false);
    });

    it('should always return false if editMode is true', () => {
      component.canEditAllowedAmount = true;
      component.editMode = true;
      serviceInTest.AllowedAmount = 50;
      serviceInTest.FeeScheduleGroupDetailId = null;
      serviceInTest.TotalInsurancePayments = 10;
      serviceInTest.PaymentAmount = 60;
      expect(component.arePaymentsMoreThanAllowedAmount(serviceInTest)).toBe(false);
    });

    it('should return false when payment is the same as the difference between AllowedAmount and previous payments and service is on FeeSchedule', () => {
      component.canEditAllowedAmount = true;
      serviceInTest.PaymentAmount = 8.6;
      serviceInTest.FeeScheduleGroupDetailId = '123';
      serviceInTest.AllowedAmount = 86;
      serviceInTest.Charges = 110.00;
      serviceInTest.TotalInsurancePayments = 77.40;
      expect(component.arePaymentsMoreThanAllowedAmount(serviceInTest)).toBe(false);
    });

    it('should return true when payment is more than the difference between AllowedAmount and previous payments and service is on FeeSchedule', () => { 
        component.canEditAllowedAmount = true;     
        serviceInTest.PaymentAmount = 8.6;
        serviceInTest.FeeScheduleGroupDetailId = '123';
        serviceInTest.PaymentAmount = 8.6;
        serviceInTest.AllowedAmount = 86;
        serviceInTest.Charges = 110.00;
        serviceInTest.TotalInsurancePayments = 78.40;
        expect(component.arePaymentsMoreThanAllowedAmount(serviceInTest)).toBe(true);
    });
  });
});
