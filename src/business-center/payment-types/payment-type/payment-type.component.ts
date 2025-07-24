import { Component, OnInit, Inject, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { DialogRef, DialogContentBase } from '@progress/kendo-angular-dialog';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { CurrencyTypes, PaymentTypeCategory, PaymentTypes } from '../payment-types.model';
import { SoarResponse } from 'src/@core/models/core/soar-response';
import { PaymentTypesService } from 'src/@shared/providers/payment-types.service';

@Component({
    selector: 'app-payment-type',
    templateUrl: './payment-type.component.html',
    styleUrls: ['./payment-type.component.scss']
})
export class PaymentTypeComponent extends DialogContentBase implements OnInit, AfterViewInit {
    addPaymentType: FormGroup;
    currencyTypes: CurrencyTypes[];
    title: string;
    paymentTypes: PaymentTypes[];
    selectedTabDescription: string;
    isDescriptionExists = false;
    isFormModeEdit = true;
    selectedTab: number;
    debitCard = 'DEBIT CARD';
    editPaymentType: PaymentTypes;
    @ViewChild('description', { static: false }) description: ElementRef;

    constructor(
        @Inject('localize') private localize,
        @Inject('toastrFactory') private toastrFactory,
        @Inject('StaticData') private staticData,
        private fb: FormBuilder,
        public dialog: DialogRef,
        private paymentTypesService: PaymentTypesService
    ) {
        super(dialog);
    }

    ngOnInit() {
        this.getCurrencyTypes();
        if (this.dialog.content?.instance) {
            this.editPaymentType = this.dialog.content.instance.paymentType;
            this.createFormControls(this.editPaymentType);
            this.title = this.dialog.content.instance.title;
            this.paymentTypes = this.dialog.content.instance.paymentTypes;
            this.selectedTab = this.dialog.content.instance.selectedTab;
            this.selectedTabDescription = this.selectedTab ? 'Insurance' : 'Account';
        }
    }

    ngAfterViewInit() {
        Promise.resolve().then(() => { this.description?.nativeElement?.focus(); })
    }

    createFormControls = (paymentType) => {
        if (paymentType) {
            this.addPaymentType = this.fb.group({
                Description: [paymentType.Description, [Validators.required, Validators.maxLength(64)]],
                CurrencyTypeId: [paymentType.CurrencyTypeId, [Validators.required, Validators.min(1)]],
                Prompt: [paymentType.Prompt, Validators.maxLength(20)],
                IsActive: [null],
                PaymentTypeCategory: null
            });
        } else {
            this.isFormModeEdit = false;
            this.addPaymentType = this.fb.group({
                Description: ['', [Validators.required, Validators.maxLength(64)]],
                CurrencyTypeId: [0, [Validators.required, Validators.min(1)]],
                Prompt: ['', Validators.maxLength(20)],
                IsActive: [true],
                PaymentTypeCategory: this.selectedTab ? PaymentTypeCategory.InsurancePayment : PaymentTypeCategory.AccountPayment
            });
        }
    }

    getCurrencyTypes = () => {
        this.staticData.CurrencyTypes().then(this.getCurrencytypesSuccess, this.getCurrencytypesFailure);
    }

    getCurrencytypesSuccess = (res: SoarResponse<CurrencyTypes[]>) => {
        if (res?.Value?.length > 0) {
            this.currencyTypes = res.Value.filter((currencyType: CurrencyTypes) => {
                if (this.selectedTab && currencyType?.Name === this.debitCard) {
                } else {
                    return currencyType;
                }
            });
        }
    }

    getCurrencytypesFailure = () => {
        this.toastrFactory.error
            (this.localize.getLocalizedString('Failed to retrieve the list of currency types. Refresh the page to try again.'),
                this.localize.getLocalizedString('Server Error'));
    }

    CancelAddPaymentType = () => {
        this.addPaymentType.reset();
        this.dialog.close();
    }

    savePaymentType = () => {
        const paymentType = this.addPaymentType.getRawValue();
        const oldPaymentType = this.dialog.content?.instance?.paymentType;
        if (oldPaymentType?.PaymentTypeId) {
            oldPaymentType.Description = paymentType.Description;
            oldPaymentType.CurrencyTypeId = paymentType.CurrencyTypeId;
            oldPaymentType.Prompt = paymentType.Prompt;
            this.paymentTypesService.update(oldPaymentType).then(res => {
                this.updatePaymentTypeSuccess(res);
            }, (err) => {
                this.updatePaymentTypeFailure(err);
            })
        } else {
            this.addPaymentType.value.IsActive = paymentType?.IsActive;
            this.paymentTypesService.save(this.addPaymentType?.value).then(res => {
                this.savePaymentTypeSuccess(res);
            }, () => {
                this.savePaymentTypeFailure();
            })
        }
    }

    savePaymentTypeSuccess = (res: SoarResponse<PaymentTypes>) => {
        if (res?.Value) {
            this.addPaymentType.setValue({
                Description: '',
                CurrencyTypeId: 0,
                Prompt: '',
                IsActive: [true],
                PaymentTypeCategory: null
            });
            const currenyTypeItem = this.currencyTypes?.find(currencyType => currencyType?.Id == res.Value.CurrencyTypeId);
            if (currenyTypeItem) {
                res.Value.CurrencyTypeName = currenyTypeItem?.Name;
            }
            this.dialog.close(res.Value);

            this.toastrFactory.success(
                this.localize.getLocalizedString(`${this.selectedTabDescription} Payment Type  has been added.`),
                this.localize.getLocalizedString('Success'));
        }
    }

    savePaymentTypeFailure = () => {
        this.dialog.close('Server Error');
        this.toastrFactory.error(
            this.localize.getLocalizedString('There was an error and your payment type was not created.'),
            this.localize.getLocalizedString('Server Error'));
    }

    updatePaymentTypeSuccess = (res: SoarResponse<PaymentTypes>) => {
        if (res?.Value) {
            const updatedType = res.Value;
            this.addPaymentType?.reset();
            const currenyTypeItem = this.currencyTypes?.find(currency => currency?.Id == res.Value.CurrencyTypeId);
            if (currenyTypeItem) {
                updatedType.CurrencyTypeName = currenyTypeItem.Name;
            }
            const index = this.paymentTypes?.findIndex(payment => payment?.PaymentTypeId == updatedType?.PaymentTypeId);
            if (index !== -1) {
                this.paymentTypes.splice(index, 1, updatedType);
            }
            this.toastrFactory.success(
                this.localize.getLocalizedString('Your payment type has been updated.'),
                this.localize.getLocalizedString('Success'));
            this.dialog.close(updatedType);
        }
    }

    updatePaymentTypeFailure = (error) => {
        this.dialog.close('Server Error');

        const err = (error?.data?.InvalidProperties?.length > 0) ? error.data.InvalidProperties[0].ValidationMessage : '';
        this.toastrFactory.error(
            this.localize.getLocalizedString(err),
            this.localize.getLocalizedString('Server Error'));
    }

    isDescriptionAlreadyExists = (e) => {
        const filter = this.paymentTypes?.filter((f: PaymentTypes) => {
            if (this.dialog.content?.instance?.paymentType?.PaymentTypeId) {
                return ((f?.Description?.toLowerCase() === e?.target?.value?.toLowerCase()) &&
                    this.dialog.content.instance.paymentType.PaymentTypeId !== f.PaymentTypeId);
            } else {
                return (f?.Description?.toLowerCase() === e?.target?.value?.toLowerCase());
            }
        });
        this.isDescriptionExists = (filter?.length > 0);

    }
}
