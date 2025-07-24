import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ClaimPaymentTableComponent } from './claim-payment-table.component';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { SharedModule } from 'src/@shared/shared.module';
import { EventEmitter } from '@angular/core';

describe('ClaimPaymentTableComponent', () => {
    let component: ClaimPaymentTableComponent;
    let fixture: ComponentFixture<ClaimPaymentTableComponent>;
    

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [ClaimPaymentTableComponent],
            imports: [
                ScrollingModule,
                CommonModule,
                SharedModule,
                TranslateModule,
            ],

        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(ClaimPaymentTableComponent);
        component = fixture.componentInstance;
        component.triggerRefresh = new EventEmitter<void>();
        fixture.detectChanges();
    });
    it('should create', () => {
        expect(component).toBeTruthy();
    });

    describe('getServicesToExclude', () => {
        var e = { claim: { PaymentAmount: 0, FinalPayment: false }, amount: 0, service: { PaymentAmount: { NewValue: 0, OldValue: 0 } } };
        beforeEach(() => {
            e = { claim: { PaymentAmount: 0, FinalPayment: false }, amount: 0, service: { PaymentAmount: { NewValue: 0, OldValue: 0 } } };
        });
        it('should set FinalPayment to true when claim amount changes', () => {
            e.claim.PaymentAmount = 0;
            e.amount = 19.99;
            component.onAmountChanging(e);
            expect(e.claim.FinalPayment).toBe(true);
        });
        
        it('should set FinalPayment to true when user changes service amount', () => {
            e.claim.FinalPayment = false;
            e.claim.PaymentAmount = 0;
            e.service.PaymentAmount.NewValue = 19.99;
            component.onAmountChanging(e);
            expect(e.claim.FinalPayment).toBe(true);
        });        
    });

    describe('shouldAllowEdit', () => {
        it('should return false if canEditAllowedAmount is false', () => {
            component.canEditAllowedAmount = false;
            const service = {
                FeeScheduleId: '123',
                EstimatedInsuranceId: '456',
            };
            expect(component.shouldAllowEdit(service)).toBe(false);
        });

        it('should return false if FeeScheduleId is null', () => {
            component.canEditAllowedAmount = true;
            const service = {
                FeeScheduleId: null,
                EstimatedInsuranceId: '456',
            };
            expect(component.shouldAllowEdit(service)).toBe(false);
        });

        it('should return false if EstimatedInsuranceId is null', () => {
            component.canEditAllowedAmount = true;
            const service = {
                FeeScheduleId: '123',
                EstimatedInsuranceId: null,
            };
            expect(component.shouldAllowEdit(service)).toBe(false);
        });

        it('should return false if EstimatedInsuranceId is undefined', () => {
            component.canEditAllowedAmount = true;
            const service = {
                FeeScheduleId: '123',
                EstimatedInsuranceId: undefined,
            };
            expect(component.shouldAllowEdit(service)).toBe(false);
        });

        it('should return false if EstimatedInsuranceId is an empty GUID', () => {
            component.canEditAllowedAmount = true;
            const service = {
                FeeScheduleId: '123',
                EstimatedInsuranceId: '00000000-0000-0000-0000-000000000000',
            };
            expect(component.shouldAllowEdit(service)).toBe(false);
        });

        it('should return true if all conditions are met', () => {
            component.canEditAllowedAmount = true;
            const service = {
                Charges: 1,
                FeeScheduleId: '123',
                EstimatedInsuranceId: '456',
            };
            expect(component.shouldAllowEdit(service)).toBe(true);
        });

        it('should return false if service.Charges equal 0', () => {
            component.canEditAllowedAmount = true;
            const service = {
                FeeScheduleId: '123',
                EstimatedInsuranceId: '456',
                Charges: 0,
            };
            expect(component.shouldAllowEdit(service)).toBe(false);
        });
    });

    
    describe('getAllowedAmountTooltip', () => {
        it('should return a message if EstimatedInsuranceId is null', () => {
            component.canEditAllowedAmount = true;
            const service = {
                EstimatedInsuranceId: null,
                FeeScheduleId: '123',
            };
            const result = component.getAllowedAmountTooltip(service);
            expect(result).toBe('Allowed Amount can only be edited for primary and secondary plans.');
        });    

        it('should return a message if EstimatedInsuranceId is an empty GUID', () => {
            component.canEditAllowedAmount = true;
            const service = {
                EstimatedInsuranceId: '00000000-0000-0000-0000-000000000000',
                FeeScheduleId: '123',
            };
            const result = component.getAllowedAmountTooltip(service);
            expect(result).toBe('Allowed Amount can only be edited for primary and secondary plans.');
        });

        it('should return a message if FeeScheduleId is null', () => {
            component.canEditAllowedAmount = true;
            const service = {
                EstimatedInsuranceId: '456',
                FeeScheduleId: null,
            };
            const result = component.getAllowedAmountTooltip(service);
            expect(result).toBe('Allowed Amount cannot be edited because there is no fee schedule for this benefit plan.');
        });

        it('should return an empty string if all conditions are met', () => {
            component.canEditAllowedAmount = true;
            const service = {
                EstimatedInsuranceId: '456',
                FeeScheduleId: '123',
            };
            const result = component.getAllowedAmountTooltip(service);
            expect(result).toBe('');
        });

        it('should return an empty string if canEditAllowedAmount is false', () => {
            component.canEditAllowedAmount = false;
            const service = {
                EstimatedInsuranceId: '456',
                FeeScheduleId: '123',
            };
            const result = component.getAllowedAmountTooltip(service);
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
            TotalInsurancePayments: 0
        }
    });

	// Tests for arePaymentsMoreThanCharge
    // this is a fee schedule item with 0 allowed amount, so max payment amount determined by AllowedAmount - TotalInsurancePayments
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

    // // this is not a fee schedule item so max payment amount determined by Charge - TotalInsurancePayments 
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

    it('should return true if canEditAllowedAmount is false and if canEditAllowedAmount is false payment must be less than or equal to Charge - TotalInsurancePayments', () => {
      component.canEditAllowedAmount = false;
      serviceInTest.AllowedAmount = 0;
      serviceInTest.OriginalAllowedAmount = 0;
      serviceInTest.FeeScheduleGroupDetailId = null;
      serviceInTest.Charges = 70.00;
      serviceInTest.TotalInsurancePayments = 5.00;
      serviceInTest.PaymentAmount = 66.00;
      expect(component.arePaymentsMoreThanCharge(serviceInTest)).toBe(true);
    });

    it('should return false if canEditAllowedAmount is false and payment is equal or less than the difference of the Charge minus the TotalInsurancePayments ', () => {
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
            TotalInsurancePayments: 0
        }
    });
    it('should return true if canEditAllowedAmount is true and is FeeSchedule item and payment is more than the difference the AllowedAmount minus the TotalInsurancePayments', () => {
      component.canEditAllowedAmount = true;
      serviceInTest.AllowedAmount = 65.00;
      serviceInTest.FeeScheduleGroupDetailId = '123';
      serviceInTest.TotalInsurancePayments = 5.00;
      serviceInTest.PaymentAmount = 65.00;
      expect(component.arePaymentsMoreThanAllowedAmount(serviceInTest)).toBe(true);
    });

    it('should return false if canEditAllowedAmount is true and is FeeSchedule item and  payment is equal or less than the difference the AllowedAmount minus the TotalInsurancePayments  ', () => {
      component.canEditAllowedAmount = false;
      serviceInTest.AllowedAmount = 65.00;
      serviceInTest.FeeScheduleGroupDetailId = null;
      serviceInTest.TotalInsurancePayments = 5.00;
      serviceInTest.PaymentAmount = 60.00;
      expect(component.arePaymentsMoreThanAllowedAmount(serviceInTest)).toBe(false);
    });

    it('should return false if canEditAllowedAmount is true and is not FeeSchedule item and OriginalAllowedAmount equals AllowedAmount', () => {
      component.canEditAllowedAmount = false;
      serviceInTest.AllowedAmount = 0.00;
      serviceInTest.FeeScheduleGroupDetailId = null;
      serviceInTest.TotalInsurancePayments = 5.00;
      serviceInTest.PaymentAmount = 60.00;
      expect(component.arePaymentsMoreThanAllowedAmount(serviceInTest)).toBe(false);
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

    it('should return false when payment is the same as the difference between AllowedAmount and previous payments and service is on FeeSchedule', () => {      
        component.canEditAllowedAmount = true;
        serviceInTest.PaymentAmount = 8.6;
        serviceInTest.FeeScheduleGroupDetailId = '123';
        serviceInTest.PaymentAmount = 8.6;
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
