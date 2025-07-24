import { Component, OnInit, Input, Inject, ViewContainerRef, TemplateRef } from '@angular/core';
import { DialogService, DialogRef } from '@progress/kendo-angular-dialog';
import { PaymentTypeComponent } from '../payment-type/payment-type.component';
import { OrderByPipe } from 'src/@shared/pipes';
import { PaymentTypes } from '../payment-types.model';
import { SoarResponse } from 'src/@core/models/core/soar-response';
import { NgTemplateOutlet } from '@angular/common';
import { Observable, of, Subscription } from 'rxjs';
import { PaymentTypesService } from 'src/@shared/providers/payment-types.service';
import { PaymentTypeOptionsDialogComponent } from '../payment-type-options-dialog/payment-type-options-dialog.component';
import { FeatureFlagService } from 'src/featureflag/featureflag.service';
import { FuseFlag } from 'src/@core/feature-flags';
import { shareReplay } from 'rxjs/operators';
import { PaymentTypeViewModel } from '../payment-types.component';
import { catchError, map } from 'rxjs/operators';

@Component({
    selector: 'app-payment-types-list',
    templateUrl: './payment-types-list.component.html',
    styleUrls: ['./payment-types-list.component.scss']
})
export class PaymentTypesListComponent implements OnInit {

    @Input() paymentTypes: PaymentTypeViewModel[];
    @Input() searchText: string;
    @Input() filteredPaymentTypes: PaymentTypeViewModel[];
    @Input() hasEditAccess: boolean;
    @Input() hasDeleteAccess: boolean;
    @Input() selectedTab = 0;
    isDescending: boolean;
    sortColumnName: string;
    sortDirection: number;
    typeToDelete: PaymentTypeViewModel;
    toolTipMessage: string;
    toolTipButton = 'Edit';
    dialog: DialogRef;
    dialogBoxSelectedTab: string;
    filterPaymentTypeStatus = 'all';
    canEditPaymentOptions: boolean;

    defaultOrderKey = 'Description';
    deleteAccessToolTipText = 'You do not have permission to delete this information.';
    deleteSystemTypeToolTipText = 'System required items cannot be deleted.';
    deleteIsUsedInCreditToolTipText = 'This payment type has already been used and cannot be deleted.';
    deletePaymentTypeFailureText = 'Failed to delete the payment type. Try again.';

    editIsUsedInCreditToolTipText = 'Previously used transaction types cannot be edited.';
    editSystemTypeToolTipText = 'System required items cannot be edited.';
    defaultFailureText = 'Server Error';
    defaultSuccessText = 'Success';
    deletePaymentTypeSuccessText = 'Successfully deleted the payment type.';
    paymentTypeUsedInCreditTransactionText =
        `This Account Payment Type has been used in previous transactions and can only be activated/inactivated.`;
    defaultInfoText = 'Info';
    isActivateAccessToolTipText = 'You do not have permission to activate/inactivate this information.';
    editAccessToolTipText = 'You do not have permission to edit this information.';
    defaultOnPlanDeleteMessage = 'This insurance payment type is set as the default for one or more benefit plans and cannot be deleted.';
    defaultOnPlanEditMessage = 'This insurance payment type is set as the default for one or more benefit plans and cannot be edited.';
    defaultOnPlanInactivateMessage = `This insurance payment type is set as the default for one or more benefit plans and
                                    cannot be inactivated.`;

    @Input() containerRef: ViewContainerRef;

    subscriptions: Subscription[] = [];

    hasWeavePaymentsIntegration$: Observable<boolean>;
    autoApplyPartnerPaymentsIsEnabled$: Observable<boolean>;

    constructor(
        @Inject('localize') private localize,
        @Inject('toastrFactory') private toastrFactory,
        private paymentTypesService: PaymentTypesService,
        private dialogService: DialogService,
        @Inject('locationService') private locationService,
        private featureFlagService: FeatureFlagService,
    ) { }

    ngOnInit() {
        this.filterPaymentTypes({ target: { value: this.filterPaymentTypeStatus } });
        this.hasWeavePaymentsIntegration$ = this.hasWeavePaymentsIntegration(this.locationId);
        this.autoApplyPartnerPaymentsIsEnabled$ = this.featureFlagService.getOnce$(FuseFlag.AutoApplyPartnerPaymentsIsEnabled)
            .pipe(
                shareReplay(1)
            );
    }

    /**
     * Get the current location id
     */
    get locationId() {
        return this.locationService.getCurrentLocation().id;
    }

    toolTipText = (paymentType: PaymentTypes, button: string) => {
        this.toolTipButton = button;
        this.typeToDelete = paymentType;
        let toolTipText = '';
        if (button === 'Delete') {
            if (this.hasDeleteAccess === false) {
                toolTipText = this.deleteAccessToolTipText;
            } else {
                if (this.typeToDelete.IsSystemType === true) {
                    toolTipText = this.deleteSystemTypeToolTipText;
                } else {
                    if (this.typeToDelete.IsUsedInCreditTransactions) {
                        toolTipText = this.deleteIsUsedInCreditToolTipText;
                    } else if (this.typeToDelete.IsDefaultTypeOnBenefitPlan) {
                        toolTipText = this.defaultOnPlanDeleteMessage;
                    } else {
                        toolTipText = '';
                    }
                }
            }
        } else if (button === 'Inactivate_Activate') {
            if (!this.hasEditAccess) {
                toolTipText = this.isActivateAccessToolTipText;
            } else if (this.typeToDelete.IsDefaultTypeOnBenefitPlan) {
                toolTipText = this.defaultOnPlanInactivateMessage;
            }
        } else {
            if (this.hasEditAccess === false) {
                toolTipText = this.editAccessToolTipText;
            } else {
                if (paymentType.IsSystemType === true) {
                    toolTipText = this.editSystemTypeToolTipText;
                } else {
                    if (paymentType.IsUsedInCreditTransactions === true) {
                        toolTipText = this.editIsUsedInCreditToolTipText;
                    } else if (this.typeToDelete.IsDefaultTypeOnBenefitPlan) {
                        toolTipText = this.defaultOnPlanEditMessage;
                    } else {
                        toolTipText = '';
                    }
                }
            }
        }
        this.toolTipMessage = toolTipText;
    }

    filterPaymentTypes = (event) => {
        this.paymentTypes = [...this.filterPaymentTypesByStatus(event?.target?.value, this.filteredPaymentTypes)];
    }

    filterPaymentTypesByStatus = (status: string, paymentTypes: PaymentTypeViewModel[] = []) => {
        this.filterPaymentTypeStatus = status;
        switch (status) {
            case 'all':
                return paymentTypes;
            case 'active':
                return paymentTypes.filter((paymentType) => paymentType.IsActive);
            case 'inActive':
                return paymentTypes.filter((paymentType) => !paymentType.IsActive);
        }
    }

    editPaymentType = (paymentType: PaymentTypeViewModel) => {
        if (this.hasEditAccess && !paymentType?.IsUsedInCreditTransactions
            && !paymentType?.IsSystemType && !paymentType?.IsDefaultTypeOnBenefitPlan) {
            this.dialog = this.dialogService.open({
                appendTo: this.containerRef,
                content: PaymentTypeComponent,
            });
            this.dialog.content.instance.selectedTab = this.selectedTab;
            this.setDialogContent(`Edit`);
            this.dialog.content.instance.paymentType = paymentType;
            this.subscriptions.push(this.dialog.result.subscribe(data => {
                if (data && Object.keys(data).length) {
                    this.paymentTypes = [... this.applyOrderByPipe()];
                }
            }));
        }
    }

    deletePaymentType = (paymentType: PaymentTypeViewModel, template: TemplateRef<NgTemplateOutlet>, actionTemplate: TemplateRef<NgTemplateOutlet>) => {
        if (this.hasDeleteAccess) {
            if (!paymentType.IsSystemType && !paymentType.IsUsedInCreditTransactions && !paymentType.IsDefaultTypeOnBenefitPlan) {
                this.dialogBoxSelectedTab = this.selectedTab ? 'Insurance' : 'Account';
                this.typeToDelete = paymentType;
                this.dialog = this.dialogService.open({
                    appendTo: this.containerRef,
                    content: template,
                    width: '37%',
                    actions: actionTemplate
                });
                this.subscriptions.push(this.dialog.result.subscribe((result: { primary: boolean }) => {
                    if (!result.primary) {
                        this.dialog.close();
                    } else {
                        this.paymentTypesService.deletePaymentTypeById(paymentType?.PaymentTypeId).then(res => {
                            this.deletePaymentTypeSuccess(res);
                        }, () => {
                            this.deletePaymentTypeFailure();
                        });
                    }
                }));
            }
        }
    }

    deletePaymentTypeSuccess = (res) => {
        if (res) {
            const index = this.paymentTypes.findIndex(paymentTypes => paymentTypes.PaymentTypeId === this.typeToDelete.PaymentTypeId);
            if (index !== -1) {
                this.filteredPaymentTypes.splice(index, 1);
            }
            this.paymentTypes = [... this.filteredPaymentTypes];
            this.toastrFactory.success(
                this.localize.getLocalizedString(this.deletePaymentTypeSuccessText),
                this.localize.getLocalizedString(this.defaultSuccessText));
        }
    }

    deletePaymentTypeFailure = () => {
        this.toastrFactory.error(
            this.localize.getLocalizedString(this.deletePaymentTypeFailureText),
            this.localize.getLocalizedString(this.defaultFailureText));
    }

    updatePaymentTypeStatus = (paymentType: PaymentTypeViewModel) => {
        if (this.hasEditAccess && !paymentType?.IsDefaultTypeOnBenefitPlan) {
            const oldPaymentType = { ...paymentType };
            oldPaymentType.IsActive = !oldPaymentType.IsActive;
            this.paymentTypesService.update(oldPaymentType).then(res => {
                this.updatePaymentTypeSuccess(res);
            }, (err) => {
                this.updatePaymentTypeFailure(err);
            })
        }
    }

    updatePaymentTypeSuccess = (res: SoarResponse<PaymentTypeViewModel>) => {
        if (res?.Value) {
            this.toastrFactory.success(
                this.localize.getLocalizedString('Your payment type has been updated.'),
                this.localize.getLocalizedString('Success'));
            const updatedType = res.Value;
            const index = this.filteredPaymentTypes?.findIndex(filteredPaymentTypes => filteredPaymentTypes.PaymentTypeId === updatedType.PaymentTypeId);
            if (index !== -1) {
                this.filteredPaymentTypes.splice(index, 1, updatedType);
            }
            this.paymentTypes = [...this.filteredPaymentTypes];
            this.filterPaymentTypes({ target: { value: this.filterPaymentTypeStatus } });
        }
    }

    updatePaymentTypeFailure = (error) => {
        if (error?.data?.InvalidProperties?.length) {
            this.toastrFactory.error(
                this.localize.getLocalizedString(error.data.InvalidProperties[0].ValidationMessage),
                this.localize.getLocalizedString('Server Error'));
        }
    }

    editPaymentOptions(paymentType: PaymentTypeViewModel) {
        const dialog = this.dialogService.open({
            appendTo: this.containerRef,
            content: PaymentTypeOptionsDialogComponent,
        });

        const paymentTypeOptions = dialog.content.instance as PaymentTypeOptionsDialogComponent
        paymentTypeOptions.paymentType = paymentType;

        dialog.result.subscribe((result: any) => {
            if (result.Value) {
                const isAutoApplied = result.Value.IsAutoApplied;
                const type = this.paymentTypes.find(x => x.PaymentTypeId == result.Value.PaymentTypeId);
                type.IsAutoApplied = isAutoApplied;
            }
        });
    }

    applyOrderByPipe = () => {
        const orderPipe = new OrderByPipe();
        return orderPipe.transform(this.paymentTypes, { sortColumnName: this.defaultOrderKey, sortDirection: 1 });
    }

    setDialogContent = (formMode: string) => {
        this.dialog.content.instance.title = this.selectedTab ? `${formMode} Insurance Payment Type` : `${formMode} Account Payment Type`;
        this.dialog.content.instance.paymentTypes = this.paymentTypes;
    }

    sortPaymentTypes = (propName: string) => {
        this.isDescending = !this.isDescending;
        this.sortColumnName = propName;
        this.sortDirection = this.isDescending ? 1 : -1;
    }

    ngOnDestroy() {
        this.subscriptions?.forEach((subscription) => subscription?.unsubscribe());
    }

    /**
     * Check if the location and then practice have Weave Payments integration. Will return true if the location/practice has Weave Payments integration.
     * 
     * @param locationId 
     * @returns 
     */
    private hasWeavePaymentsIntegration(locationId: number) {
        return this.paymentTypesService.hasWeavePaymentsIntegration(locationId)
            .pipe(
                catchError(() => {
                    this.toastrFactory.error(
                        this.localize.getLocalizedString('Failed to get Weave Payments integration status'),
                        this.localize.getLocalizedString('Server Error'));
                    return of({ Result: false });
                }),
                map(response => response.Result),
                shareReplay(1)
            );
    }

    /**
     * Check if the value is a PaymentTypes object
     * 
     * @param value 
     * @returns 
     */
    private static isPaymentType(value: any): value is PaymentTypeViewModel {
        return value && 'PaymentTypeId' in value;
    }
}
