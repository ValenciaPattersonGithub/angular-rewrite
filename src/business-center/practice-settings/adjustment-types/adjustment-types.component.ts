import { Component, OnInit, Inject, ViewChild, ViewContainerRef } from '@angular/core';
import { DialogRef } from '@progress/kendo-angular-dialog';
import { OrderByPipe } from 'src/@shared/pipes';
import { Observable, of } from 'rxjs';
import * as moment from 'moment';
import find from 'lodash/find';
import { AdjustmentTypes } from './adjustment-types';
import { SoarResponse } from 'src/@core/models/core/soar-response';
import { User } from '../team-members/team-member';
import { AdjustmentTypesService } from 'src/@shared/providers/adjustment-types.service';

@Component({
    selector: 'app-adjustment-types',
    templateUrl: './adjustment-types.component.html',
    styleUrls: ['./adjustment-types.component.scss']
})
export class AdjustmentTypesComponent implements OnInit {
    @ViewChild('container', { read: ViewContainerRef, static: false })
    public containerRef: ViewContainerRef;
    adjustmentTypes$: Observable<AdjustmentTypes[]>;
    adjustmentTypes: AdjustmentTypes[];
    searchText: string;
    breadCrumbs: { name: string, path: string, title: string }[] = [];
    headerDate = Date.now();
    sortDirection: number;
    sortColumnName: string;
    isDescending: boolean;
    dialog: DialogRef;

    viewAuthAbbreviation = 'soar-biz-badjtp-view';
    editAuthAbbreviation = 'soar-biz-badjtp-edit';
    createAuthAbbreviation = 'soar-biz-badjtp-add';
    deleteAuthAbbreviation = 'soar-biz-badjtp-delete';
    hasViewAccess: boolean;
    hasEditAccess: boolean;
    hasCreateAccess: boolean;
    hasDeleteAccess: boolean;
    defaultOrderKey = 'Description';
    toolTipMessage: string;
    drawer = { isOpen: false };
    dayDateDisplay = moment(new Date()).format('dddd, MMMM D, YYYY');
    showSecondary = false;
    displayName = "";
 
    constructor(
        @Inject('localize') private localize,
        @Inject('toastrFactory') private toastrFactory,
        private adjustmentTypesService: AdjustmentTypesService,
        @Inject('patSecurityService') private patSecurityService,
        @Inject('referenceDataService') private referenceDataService,
        @Inject('platformSessionCachingService') private platformSessionCachingService,
        ) {
        
    }

    ngOnInit() {
        this.getUserInfo();
    }
    ngOnChanges() {
        this.initializeGrid();
    }
    getPageNavigation = () => {
        this.breadCrumbs = [
            {
                name: this.localize.getLocalizedString('Practice Settings'),
                path: '#/BusinessCenter/PracticeSettings/',
                title: 'Practice Settings'
            },
            {
                name: this.localize.getLocalizedString('Adjustment Types'),
                path: '/Business/Billing/AdjustmentTypes/',
                title: 'Adjustment Types'
            }
        ];

    }
    getAllAdjustmentTypesSuccess = (res: SoarResponse<AdjustmentTypes[]>) => {
        if (res && res?.Value) {
            this.adjustmentTypes = res?.Value;
            this.adjustmentTypes$ = of(this.adjustmentTypes);
        }
    }

    getAllAdjustmentTypesFailure = () => {
        this.toastrFactory.error(this.localize.getLocalizedString('Failed to retrieve the list of {0}. Refresh the page to try again.', ['Adjustment Types']), this.localize.getLocalizedString('Server Error'));
    }


    orderList = (records:AdjustmentTypes[], columnValue:string):AdjustmentTypes[] => {
        const orderPipe = new OrderByPipe();
        return orderPipe.transform(records, { sortColumnName: columnValue, sortDirection: 1 }) as AdjustmentTypes[];
    }

    authAccess = () => {
        this.hasViewAccess = this.authAccessByType(this.viewAuthAbbreviation);
        this.hasEditAccess = this.authAccessByType(this.editAuthAbbreviation);
        this.hasCreateAccess = this.authAccessByType(this.createAuthAbbreviation);
        this.hasDeleteAccess = this.authAccessByType(this.deleteAuthAbbreviation);
        if (this.hasViewAccess === false) {
            this.toastrFactory.error('User is not authorized to access this area.', 'Not Authorized');
            if (this.viewAuthAbbreviation) {
                window.location.href = '/';
            }
        }
    }
    authAccessByType = (authtype: string): boolean => {
        const result: boolean = this.patSecurityService.IsAuthorizedByAbbreviation(authtype);
        return result;
    }

    clearSearchText = () => {
        this.searchText = '';
    }
    onCategoryChange = () => {
        return true;
    }
    showAdjustmentForm = () => {
        if (this.hasCreateAccess) {
            this.drawer.isOpen = true;
        }
    }
    initializeGrid = () => {

        this.adjustmentTypesService.GetAllAdjustmentTypesWithOutCheckTransactions({ active: false }).then((res: SoarResponse<AdjustmentTypes[]>) => {
            this.getAllAdjustmentTypesSuccess(res);
        }, () => {
            this.getAllAdjustmentTypesFailure();
        })
        this.getPageNavigation();
        this.authAccess();
    }

    getUserInfo = () => {
        const users:User[] = this.referenceDataService.get(this.referenceDataService?.entityNames?.users);
        const userContext = this.platformSessionCachingService.userContext.get();
        if (userContext !== null) {
            const currentuser = userContext?.Result?.User;
            const user: User = find(users, { UserId: currentuser?.UserId });
            if (user) {
                const middleName: string = user?.MiddleName || '';
                const suffixName: string = user?.SuffixName || '';
                const designation: string = user?.ProfessionalDesignation || '';
                this.displayName = `${user?.FirstName}${middleName?.length > 0 ? ` ${middleName?.charAt(0)}` : ''} ${user?.LastName}${suffixName?.length > 0 ? `, ${suffixName}` : ''} - ${user?.UserCode}${designation?.length > 0 ? `, ${designation}` : ''}`.trim();
            }
        }
    }
}

