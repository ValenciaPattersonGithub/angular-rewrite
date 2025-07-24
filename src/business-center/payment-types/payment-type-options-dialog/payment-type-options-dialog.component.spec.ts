import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PaymentTypeOptionsDialogComponent } from './payment-type-options-dialog.component';
import { DialogRef } from '@progress/kendo-angular-dialog';
import { MockRepository } from 'src/business-center/payment-types-mock-repo';
import { NEVER, of, throwError } from 'rxjs';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { PaymentTypesService } from 'src/@shared/providers/payment-types.service';

let mockDialogRef;
let mockRepo;
let mockTostarfactory;

describe('PaymentTypeOptionsDialogComponent', () => {
  let component: PaymentTypeOptionsDialogComponent;
  let fixture: ComponentFixture<PaymentTypeOptionsDialogComponent>;

  beforeEach(() => {
    mockRepo = MockRepository();

    mockTostarfactory = {
      error: jasmine.createSpy().and.returnValue('Error Message'),
      success: jasmine.createSpy().and.returnValue('Success Message'),
    };

    mockDialogRef = {
      close: () => of({}),
      open: () => {},
      content: {
        template: '',
        result: of(null),
        instance: {
          title: '',
          paymentTypes: mockRepo.mockDeletePaymentType,
        },
      },
      result: of(null),
    };
  });

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PaymentTypeOptionsDialogComponent],
      imports: [HttpClientTestingModule],
      providers: [
        { provide: PaymentTypesService, useValue: mockRepo.mockpaymentTypeService },
        { provide: 'localize', useValue: mockRepo.mockLocalizeService },
        { provide: 'toastrFactory', useValue: mockTostarfactory },
        { provide: DialogRef, useValue: mockDialogRef },
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PaymentTypeOptionsDialogComponent);
    component = fixture.componentInstance;
    component.paymentType = {
      IsAutoApplied: false,
    };
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('save', () => {
    it('should not submit save since form is invalid', () => {
      component.form.controls['IsAutoApplied'].setErrors({ invalid: true });
      component.save();
      expect(component['paymentTypesService'].updatePaymentTypeOptions).not.toHaveBeenCalled();
    });
    it('should submit save since form is valid', () => {
      mockRepo.mockpaymentTypeService.updatePaymentTypeOptions.and.returnValue(of(NEVER));
      component.form.controls['IsAutoApplied'].setErrors(null);
      component.save();
      expect(component['paymentTypesService'].updatePaymentTypeOptions).toHaveBeenCalled();
      expect(mockTostarfactory.success).toHaveBeenCalled();
    });
    it('should fail on save', () => {
      mockRepo.mockpaymentTypeService.updatePaymentTypeOptions.and.returnValue(throwError('update failed'));
      component.form.controls['IsAutoApplied'].setErrors(null);
      component.save();
      expect(mockTostarfactory.error).toHaveBeenCalled();
    });
  });

  it('should toggle isAutoApplied', () => {
    expect(component.form.get('IsAutoApplied').value).toBeFalsy();
    component.onIsAutoAppliedChange(true);
    expect(component.form.get('IsAutoApplied').value).toBeTruthy();
  });

  it('should close the dialog', () => {
    spyOn(component.dialog, 'close');
    component.close();
    expect(component.dialog.close).toHaveBeenCalled();
  });
});
