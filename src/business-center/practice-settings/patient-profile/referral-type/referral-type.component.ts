import { Component, Inject, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { DialogCloseResult, DialogRef, DialogService } from '@progress/kendo-angular-dialog';
import moment from 'moment';
import { Observable, of } from 'rxjs';
import { ReferralTypeCrudComponent } from './referral-type-crud/referral-type-crud.component';
import { ReferralType, ReferralSourceType, BreadCrum, GetProviderReferralAffiliatesRequest } from './referral-type.model';
import { SoarResponse } from 'src/@core/models/core/soar-response';
import { ReferralManagementHttpService } from 'src/@core/http-services/referral-management-http.service';
import { FeatureFlagService } from 'src/featureflag/featureflag.service';
import { FuseFlag } from 'src/@core/feature-flags';
declare let _: any;

@Component({
    selector: 'referral-type',
    templateUrl: './referral-type.component.html',
    styleUrls: ['./referral-type.component.scss']
})
export class ReferralTypeComponent implements OnInit {
    @ViewChild('container', { read: ViewContainerRef, static: false })
    public containerRef: ViewContainerRef;
    referralType$: Observable<ReferralType[]>;
    referralType: ReferralType[];
    searchText: string;
    breadCrumbs: BreadCrum[];
    headerDate = Date.now();
    sortDirection: number;
    sortColumnName: string;
    isDescending: boolean;
    dialog: DialogRef;

    viewAuthAbbreviation = 'soar-biz-brfsrc-view';
    editAuthAbbreviation = 'soar-biz-brfsrc-edit';
    createAuthAbbreviation = 'soar-biz-brfsrc-add';

    hasViewAccess: boolean;
    hasEditAccess: boolean;
    hasCreateAccess: boolean;

    defaultOrderKey = 'Description';
    typeToDelete: ReferralType;
    toolTipMessage: string;
    headerMessage: string;
    drawer = { isOpen: false };
    dayDateDisplay: string = moment(new Date()).format('dddd, MMMM D, YYYY');
    showSecondary = false;
    displayName = "";

    practiceId: any;

    pageNumber: number = 1;
    pageSize: number = 15;
    sortColumn: string = "FirstName";
    sortOrder: string = "ASC";
    showDBMigration: boolean = false;

    constructor(
        @Inject('localize') private localize,
        @Inject('toastrFactory') private toastrFactory,
        @Inject('ReferralTypeService') private referralTypeService,
        @Inject('patSecurityService') private patSecurityService,
        @Inject('practiceService') private practiceService,
        private dialogService: DialogService,
        @Inject('referenceDataService') private referenceDataService,
        @Inject('platformSessionCachingService') private platformSessionCachingService,
        private featureFlagService: FeatureFlagService,
        private referralManagementHttpService: ReferralManagementHttpService
    ) {
        this.practiceId = this.practiceService.getCurrentPractice().id;
    }

    ngOnInit() {

        this.getUserInfo();
    }
    ngOnChanges() {
        this.initializeGrid();
    }

    initializeGrid() {
        let req: GetProviderReferralAffiliatesRequest = {
            PracticeId: this.practiceId
            , PageSize: this.pageSize
            , PageNumber: this.pageNumber
            , SortColumn: this.sortColumn
            , SortOrder: this.sortOrder
            , Search: ''
            , Status: true
        };
        this.getProviderAffiliates(req);

        this.getPageNavigation();
        this.authAccess();
    }

    getProviderAffiliates(req: GetProviderReferralAffiliatesRequest) {
        this.referralManagementHttpService
            .getProviderAffiliates(req)
            .subscribe((data: any[]) => {
                if (data) {
                    this.referralType = data;
                    this.referralType$ = of(this.referralType);
                }
            });
    }

    filterAffiliateData(ev) {
        this.sortColumn = ev.sortColumn;
        this.sortOrder = ev.sortOrder;
        let req: GetProviderReferralAffiliatesRequest = {
            PracticeId: this.practiceId
            , PageSize: this.pageSize
            , PageNumber: ev.pageNum
            , SortColumn: this.sortColumn
            , SortOrder: this.sortOrder
            , Search: ev.keyword
            , Status: !ev.showInactive
        };
        this.getProviderAffiliates(req);
    }

    getUserInfo() {
        const users = this.referenceDataService.get(this.referenceDataService.entityNames.users);
        const userContext = this.platformSessionCachingService.userContext.get();
        if (userContext !== null) {
            const currentuser = userContext.Result.User;
            const user = _.find(users, { UserId: currentuser.UserId });
            if (user) {
                const middleName = user.MiddleName || '';
                const suffixName = user.SuffixName || '';
                const designation = user.ProfessionalDesignation || '';
                this.displayName = (user.FirstName + (middleName.length > 0 ? ' ' +
                    middleName.charAt(0) : '') + ' ' +
                    user.LastName + (suffixName.length > 0 ? ', ' +
                        suffixName : '') + ' - ' +
                    user.UserCode +
                    (designation.length > 0 ? ', ' +
                        designation : '')).trim();
            }
        }
    }

    getAllReferralTypeSuccess = (res: SoarResponse<ReferralType[]>) => {
        if (res && res?.Value) {
            this.referralType = res.Value;
            this.referralType$ = of(this.referralType);
        }
    }

    getAllReferralTypeFailure = () => {
        this.toastrFactory.error(this.localize.getLocalizedString('Failed to retrieve the list of {0}. Refresh the page to try again.', ['Referral Type']), this.localize.getLocalizedString('Server Error'));
    }

    authAccess = () => {
        this.hasViewAccess = this.authAccessByType(this.viewAuthAbbreviation);
        this.hasEditAccess = this.authAccessByType(this.editAuthAbbreviation);
        this.hasCreateAccess = this.authAccessByType(this.createAuthAbbreviation);

    }

    authAccessByType = (authtype: string) => {
        const result = this.patSecurityService.IsAuthorizedByAbbreviation(authtype);
        return result;
    }

    getPageNavigation() {
        this.breadCrumbs = [
            {
                name: this.localize.getLocalizedString('Practice Settings'),
                path: '#/BusinessCenter/PracticeSettings/',
                title: 'Practice Settings'
            },
            {
                name: this.localize.getLocalizedString('Referral Affiliates'),
                path: '/Business/Billing/ReferralType/',
                title: 'Referral Types'
            }
        ];

    }

    showReferralForm = () => {
        if (this.hasCreateAccess) {
            this.dialog = this.dialogService.open({ appendTo: this.containerRef, content: ReferralTypeCrudComponent });
            this.dialog.result.subscribe((result) => {
                if (result["referralAffiliateId"] != undefined && result["referralAffiliateId"] != null) {
                    this.initializeGrid();
                }
            });
        }
    }

    performDBMigration = () => {
        this.referralManagementHttpService
            .performDBMigration()
            .subscribe((data: any) => {
                if (data) {
                    this.toastrFactory.success('DB Migration completed successfully', 'Success');
                }
            });
    }
}

