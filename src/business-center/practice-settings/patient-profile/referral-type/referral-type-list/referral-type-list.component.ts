import { Component, EventEmitter, Inject, Input, OnInit, Output, TemplateRef, ViewChild, ViewContainerRef } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { DialogRef, DialogService } from '@progress/kendo-angular-dialog';
import { Subscription } from 'rxjs';
import { ConfirmationModalOverlayRef } from '../../../../../@shared/components/confirmation-modal/confirmation-modal.overlayref';
import { ConfirmationModalService } from '../../../../../@shared/components/confirmation-modal/confirmation-modal.service';
import { OrderByPipe } from '../../../../../@shared/pipes';
import { ReferralTypeCrudComponent } from '../referral-type-crud/referral-type-crud.component';
import { ReferralType, ReferralFilterType } from '../referral-type.model';
import { SoarResponse } from 'src/@core/models/core/soar-response';

@Component({
    selector: 'referral-type-list',
    templateUrl: './referral-type-list.component.html',
    styleUrls: ['./referral-type-list.component.scss']
})
export class ReferralTypeListComponent implements OnInit {

    @Input() referralType: ReferralType[];
    searchCatText: string;
    searchDescText: string = "";
    optActive: boolean;
    @Input() pageSize: number;
    @Input() hasEditAccess: boolean;
    @Input() hasDeleteAccess: boolean;
    @Input() hasCreateAccess: boolean;
    @Output() refreshReferralTypeGrid = new EventEmitter();

    @Output() filterAffiliateData = new EventEmitter<{ pageNum: number, keyword: string, showInactive: boolean, sortColumn: string, sortOrder: string }>();
    @Input() filteredReferralTypes: ReferralType[];
    filterReferralTypes: any;
    isDescending: boolean;
    sortColumnName: string = "FirstName";
    sortDirection: number = -1;

    toolTipEditMessage: string;
    toolTipDescription: string;

    toolTipButton = 'Edit';
    referralTypeGrid: ReferralType[];

    isEditRowDisabled: boolean;
    defaultOrderKey = 'Description';

    editSystemTypeToolTipText = 'System required items cannot be edited';
    defaultFailureText = 'Server Error';
    defaultSuccessText = 'Success';
    defaultInfoText = 'Info';
    editAccessToolTipText = 'You do not have permission to edit this information.';

    referralTypeEditData = ReferralType;

    referralFilter: string;
    dialog: DialogRef;
    @Input() drawer: { isOpen: boolean };
    confirmationRef: ConfirmationModalOverlayRef;
    confirmationModalSubscription: Subscription;
    public containerRef: ViewContainerRef;

    numberOfPages: number = 0;
    pagesArray: number[];
    currentPageNumber: number = 1;
    constructor(
        @Inject('localize') private localize,
        @Inject('toastrFactory') private toastrFactory,
        @Inject('ReferralTypeService') private referralTypesService,
        private translate: TranslateService,
        private confirmationModalService: ConfirmationModalService,
        private dialogService: DialogService,

    ) { }

    ngOnInit(): void {

    }

    ngOnChanges() {
        if (this.referralType != null) {
            this.referralTypeGrid = this.referralType;
            this.referralType.forEach(refType => {
                refType['StatusDesc'] = refType['status'] ? 'Active' : 'Inactive';
                refType['Address'] = refType['address1'].concat(' ', refType['address2'], ' ', refType['city'], ' ', refType['zipCode']);
            });

            if (this.referralType && this.referralType.length > 0) {
                let totalRecords = this.referralType[0]["totalRecords"];
                this.numberOfPages = Math.ceil(totalRecords / this.pageSize);
                this.pagesArray = Array(this.numberOfPages).fill(0).map((x, i) => i + 1);
            } else {
                this.numberOfPages = 0;
                this.pagesArray = [];
            }

        }
        this.resetControls();
    }

    sortReferralType = (propName: string, direction: number) => {
        this.isDescending = direction == 1 ? true : false;
        this.sortColumnName = propName;
        this.sortDirection = direction;
        this.currentPageNumber = 1;
        this.filterAffiliateData.emit({ pageNum: this.currentPageNumber, keyword: this.searchDescText, showInactive: this.optActive, sortColumn: this.sortColumnName, sortOrder: this.sortDirection == 1 ? "DESC" : "ASC" });
    }

    applyOrderByPipe = () => {
        const orderPipe = new OrderByPipe();
        return orderPipe.transform(this.referralType, { sortColumnName: this.defaultOrderKey, sortDirection: 1 });
    }

    editReferralType = (dataItem: ReferralType) => {
        if (this.hasEditAccess) {
            this.dialog = this.dialogService.open({
                appendTo: this.containerRef,
                content: ReferralTypeCrudComponent,
            });
            this.dialog.content.instance.referralType = dataItem;

            this.dialog.result.subscribe(data => {
                if (data && Object.keys(data).length) {
                    this.optActive = false;
                    this.referralType = [... this.applyOrderByPipe()];
                    this.refreshReferralGrid();
                }
            });
        }
    }

    showReferralForm = () => {
        if (this.hasCreateAccess) {
            this.dialog = this.dialogService.open({ appendTo: this.containerRef, content: ReferralTypeCrudComponent });
            this.dialog.result.subscribe((result) => {
                this.refreshReferralGrid();
            });
        }
    }

    refreshReferralGrid = () => {
        this.refreshReferralTypeGrid.emit();
    }

    onPageChange = (pageNumber) => {
        this.currentPageNumber = pageNumber;
        this.filterAffiliateData.emit({ pageNum: pageNumber, keyword: this.searchDescText, showInactive: this.optActive, sortColumn: this.sortColumnName, sortOrder: this.sortDirection == 1 ? "DESC" : "ASC" });
    }

    onToggleChange = (ev) => {
        this.optActive = ev;
        this.currentPageNumber = 1;
        this.filterAffiliateData.emit({ pageNum: this.currentPageNumber, keyword: this.searchDescText, showInactive: this.optActive, sortColumn: this.sortColumnName, sortOrder: this.sortDirection == 1 ? "DESC" : "ASC" });
    }

    searchAffiliatesByKeyword = (kw) => {
        this.currentPageNumber = 1;
        this.filterAffiliateData.emit({ pageNum: this.currentPageNumber, keyword: this.searchDescText, showInactive: this.optActive, sortColumn: this.sortColumnName, sortOrder: this.sortDirection == 1 ? "DESC" : "ASC" });

    }

    resetControls = () => {

    }


    filter(event, calledFrom) {
        let searchDescText;
        let res;
        switch (calledFrom) {
            case 'referralFilter':
                this.referralFilter = event.target.value;
                break;
            case 'optActive':
                this.optActive = event.target.checked;
        }

        this.ResetGrid();
        res = this.referralType;

        if (this.searchDescText)
            searchDescText = this.searchDescText.toLowerCase();

        if (searchDescText != undefined) {
            res = this.referralType.filter(function (x) {
                return x.practiceName.toLowerCase().includes(searchDescText);
            });

        }

        if (this.optActive)
            res = res.filter((x: any) => x.Status);

        this.referralType = res;
    }

    ResetGrid() {
        this.referralType = this.referralTypeGrid;
    }
}




