import { Component, Inject, Input, OnInit } from '@angular/core';
import { DialogContentBase, DialogRef } from '@progress/kendo-angular-dialog';
import { PaymentTypes } from '../payment-types.model';
import { FormControl, FormGroup } from '@angular/forms';
import { PaymentTypesService } from 'src/@shared/providers/payment-types.service';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'payment-type-options-dialog',
  templateUrl: './payment-type-options-dialog.component.html',
  styleUrls: ['./payment-type-options-dialog.component.scss']
})
export class PaymentTypeOptionsDialogComponent extends DialogContentBase implements OnInit {

  @Input() paymentType: PaymentTypes;
  form: FormGroup;
  saving = false;

  constructor(
    dialog: DialogRef,
    private paymentTypesService: PaymentTypesService,
    @Inject('toastrFactory') private toastrFactory,
    @Inject('localize') private localize,
  ) {
    super(dialog);
  }

  ngOnInit(): void {
    this.form = new FormGroup({
      IsAutoApplied: new FormControl(!!this.paymentType!.IsAutoApplied),
    });
  }

  close() {
    this.dialog.close();
  }

  save() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving = true;

    const payload: any = {
      PaymentTypeId: this.paymentType.PaymentTypeId,
      ...this.form.getRawValue()
    };

    this.paymentTypesService.updatePaymentTypeOptions(payload)
      .pipe(
        finalize(() => this.saving = false),
      )
      .subscribe({
        next: paymentType => this.success(paymentType),
        error: error => this.error(error),
      });
  }

  onIsAutoAppliedChange(value: boolean) {
    const control = this.form.get('IsAutoApplied');
    if (value !== control?.value) {
      control?.setValue(value);
      control?.markAsDirty();
    }
  }

  private success(paymentType: PaymentTypes) {
    this.toastrFactory.success(this.localize.getLocalizedString('Payment type options updated successfully'), this.localize.getLocalizedString('Success'));
    this.dialog.close(paymentType);
  }

  private error(error: unknown) {
    this.toastrFactory.error(this.localize.getLocalizedString('Failed to update payment type options'), this.localize.getLocalizedString('Server Error'));
    this.dialog.close(error);
  }
}
