import { Component, OnInit, Inject, ViewChild, ViewContainerRef, OnDestroy } from '@angular/core';
import { PaymentTypeComponent } from './payment-type/payment-type.component';
import { DialogService, DialogRef } from '@progress/kendo-angular-dialog';
import { OrderByPipe } from 'src/@shared/pipes';
import { Observable, Subscription, of } from 'rxjs';
import { SoarResponse } from 'src/@core/models/core/soar-response';
import { SelectEvent } from '@progress/kendo-angular-layout/dist/es2015/tabstrip/tabstrip-events';
import { PaymentTypeCategory, PaymentTypes } from './payment-types.model';
import { PaymentTypesService } from 'src/@shared/providers/payment-types.service';

// Extending the PaymentTypes model so we can set a flag for the vendor payment option
// This flag is used with the Weave payment integration to allow payments to be auto
// applied to the oldest balance. PBI: https://dev.azure.com/pdco-fuse/Fuse/_workitems/edit/559713
export interface PaymentTypeViewModel extends PaymentTypes {
    isVendorPaymentType?: boolean;
}

@Component({
    selector: 'app-payment-types',
    templateUrl: './payment-types.component.html',
    styleUrls: ['./payment-types.component.scss']
})
export class PaymentTypesComponent implements OnInit, OnDestroy {
    @ViewChild('container', { read: ViewContainerRef, static: false })
    public containerRef: ViewContainerRef;
    accountPaymentTypes$: Observable<PaymentTypeViewModel[]>;
    accountPaymentTypes: PaymentTypeViewModel[];
    insurancePaymentTypes$: Observable<PaymentTypeViewModel[]>;
    insurancePaymentTypes: PaymentTypeViewModel[];
    searchText: string;
    selectedTab = 0;
    breadCrumbs: { name: string, path: string, title: string }[] = [];;
    headerDate = Date.now();
    sortDirection: number;
    sortColumnName: string;
    isDescending: boolean;
    dialog: DialogRef;
    dialogSubscription: Subscription;
    viewWeaveIntCtrlAbbreviation = 'plapi-intcnt-intcnt-read';
    viewAuthAbbreviation = 'soar-biz-bpmttp-view';
    editAuthAbbreviation = 'soar-biz-bpmttp-edit';
    createAuthAbbreviation = 'soar-biz-bpmttp-add';
    deleteAuthAbbreviation = 'soar-biz-bpmttp-delete';

    hasIntCtrlViewAccess: boolean;
    hasViewAccess: boolean;
    hasEditAccess: boolean;
    hasCreateAccess: boolean;
    hasDeleteAccess: boolean;
    defaultOrderKey = 'Description';
    toolTipMessage: string;


    constructor(
        @Inject('localize') private localize,
        @Inject('$location') private $location,
        @Inject('toastrFactory') private toastrFactory,
        @Inject('patSecurityService') private patSecurityService,
        private dialogService: DialogService,
        private paymentTypesService: PaymentTypesService) {
    }

    ngOnInit() {
        this.paymentTypesService.getAllPaymentTypes().then(res => {
            this.getAllPaymentypesSuccess(res);
        }, () => {
            this.getAllPaymentypesFailure()
        });
        this.getPageNavigation();
        this.authAccess();
    }

    getPageNavigation = () => {
        this.breadCrumbs = [
            {
                name: this.localize.getLocalizedString('Practice Settings'),
                path: '#/BusinessCenter/PracticeSettings/',
                title: 'Practice Settings'
            },
            {
                name: this.localize.getLocalizedString('Manage Payment Types'),
                path: '/Business/Billing/PaymentTypesRefactor/',
                title: 'Manage Payment Types'
            }
        ];

    }

    getAllPaymentypesSuccess = (res: SoarResponse<PaymentTypes[]>) => {
        if (res?.Value?.length > 0) {

            const paymentTypes = res.Value
                .map((x: PaymentTypeViewModel) => ({
                    ...x,
                    isVendorPaymentType: x.Description === 'Vendor Payment' && x.IsSystemType
                }));

            this.accountPaymentTypes = paymentTypes
                .filter((x) => x?.PaymentTypeCategory === PaymentTypeCategory.AccountPayment);
            this.insurancePaymentTypes = paymentTypes
                .filter((x) => x?.PaymentTypeCategory === PaymentTypeCategory.InsurancePayment);

            this.insurancePaymentTypes$ = of(this.insurancePaymentTypes);
            this.accountPaymentTypes$ = of(this.accountPaymentTypes);
        }
    }

    getAllPaymentypesFailure = () => {
        this.toastrFactory.error
            (this.localize.getLocalizedString('Failed to retrieve the list of payment types. Refresh the page to try again.'),
                this.localize.getLocalizedString('Server Error'));
    }

    onTabSelect = (e: SelectEvent) => {
        this.searchText = '';
        this.selectedTab = e?.index;
    }

    addPaymentType = () => {
        if (this.hasCreateAccess) {
            this.dialog = this.dialogService.open({ appendTo: this.containerRef, content: PaymentTypeComponent });
            this.dialog.content.instance.selectedTab = this.selectedTab;
            this.setDialogContent(`Add`);
            this.dialogSubscription = this.dialog.result.subscribe((paymentTypesResult: PaymentTypes) => {
                if (paymentTypesResult && Object.keys(paymentTypesResult)?.length) {
                    if (this.selectedTab) {
                        this.insurancePaymentTypes.push(paymentTypesResult);
                        this.insurancePaymentTypes = this.orderList(this.insurancePaymentTypes, this.defaultOrderKey);
                        this.insurancePaymentTypes$ = of([...this.insurancePaymentTypes]);
                    } else {
                        this.accountPaymentTypes.push(paymentTypesResult);
                        this.accountPaymentTypes = this.orderList(this.accountPaymentTypes, this.defaultOrderKey);
                        this.accountPaymentTypes$ = of([...this.accountPaymentTypes]);
                    }
                }
            });
        }
    }

    setDialogContent = (formMode: string) => {
        this.dialog.content.instance.title = this.selectedTab ? `${formMode} Insurance Payment Type` : `${formMode} Account Payment Type`;
        this.dialog.content.instance.paymentTypes = this.selectedTab ? this.insurancePaymentTypes : this.accountPaymentTypes;
    }

    orderList = (records: PaymentTypes[], columnValue: string): PaymentTypes[] => {
        const orderPipe = new OrderByPipe();
        return orderPipe.transform(records, { sortColumnName: columnValue, sortDirection: 1 });
    }

    authAccess = () => {
        this.hasViewAccess = this.authAccessByType(this.viewAuthAbbreviation);
        this.hasEditAccess = this.authAccessByType(this.editAuthAbbreviation);
        this.hasCreateAccess = this.authAccessByType(this.createAuthAbbreviation);
        this.hasDeleteAccess = this.authAccessByType(this.deleteAuthAbbreviation);
        this.hasIntCtrlViewAccess = this.authAccessByType(this.viewWeaveIntCtrlAbbreviation);

        if (this.hasViewAccess === false || this.hasIntCtrlViewAccess === false) {
            setTimeout(() => {
                this.toastrFactory.error(this.localize.getLocalizedString('User is not authorized to access this area.'), this.localize.getLocalizedString('Not Authorized'));
            }, 0);
            if (this.viewAuthAbbreviation) {
                this.$location.path(encodeURIComponent('/'));
            }
        }
    }

    authAccessByType = (authtype: string): boolean => {
        const result = this.patSecurityService.IsAuthorizedByAbbreviation(authtype);
        return result;
    }

    clearSearchText = () => {
        this.searchText = '';
    }

    ngOnDestroy() {
        this.dialogSubscription?.unsubscribe();
    }
}