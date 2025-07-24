import { Component, OnInit, Input, Inject, ViewContainerRef, Output, EventEmitter} from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { filter, take } from 'rxjs/operators';
import { OrderByPipe } from 'src/@shared/pipes';
import { ConfirmationModalOverlayRef } from '../../../../@shared/components/confirmation-modal/confirmation-modal.overlayref';
import { ConfirmationModalService } from '../../../../@shared/components/confirmation-modal/confirmation-modal.service';
import cloneDeep from 'lodash/cloneDeep';
import { DialogRef } from '@progress/kendo-angular-dialog';
import { AdjustmentTypes } from '../adjustment-types';
import { AdjustmentTypesService } from 'src/@shared/providers/adjustment-types.service';
import { SoarResponse } from 'src/@core/models/core/soar-response';

@Component({
    selector: 'app-adjustment-types-list',
    templateUrl: './adjustment-types-list.component.html',
    styleUrls: ['./adjustment-types-list.component.scss']
})
export class AdjustmentTypesListComponent implements OnInit {

    @Input() adjustmentTypes = [];
    searchCatText: string;
    searchDescText: string;
    @Input() hasEditAccess: boolean;
    @Input() hasDeleteAccess: boolean;
    @Input() hasCreateAccess: boolean;
    @Output() refreshAdjustmentTypeGrid = new EventEmitter();

    isDescending: boolean;
    sortColumnName: string;
    sortDirection: number;
    typeToDelete: AdjustmentTypes;
    toolTipEditMessage: string;
    toolTipDeleteMessage: string;
    toolTipButton = 'Edit';
    adjustmentTypesGrid: AdjustmentTypes[];
    isDeleteRowDisabled: boolean;
    isEditRowDisabled: boolean;
    defaultOrderKey = 'Description';
    deleteAccessToolTipText = 'You do not have permission to delete this information.';
    deleteSystemTypeToolTipText = 'System required items cannot be edited or deleted.';
    deleteIsUsedInCreditToolTipText = 'This adjustment type has already been used and cannot be deleted.';
    deleteadjustmentFailureText = 'Failed to delete the adjustment type. Try again.';
    editSystemTypeToolTipText = 'System required items cannot be edited or deleted.';
    defaultFailureText = 'Server Error';
    defaultSuccessText = 'Success';
    defaultInfoText = 'Info';
    editAccessToolTipText = 'You do not have permission to edit this information.';
    defaultOnPlanDeleteMessage = 'This adjustment type is set as the default for one or more benefit plans and cannot be deleted.';
    adjustmentTypeEditData = {};

    dialog: DialogRef;

    @Input() containerRef: ViewContainerRef;
    @Input() drawer: { isOpen: boolean };
    confirmationRef: ConfirmationModalOverlayRef;
    confirmationModalSubscription: Subscription;

    constructor(
        @Inject('toastrFactory') private toastrFactory,
        private adjustmentTypesService: AdjustmentTypesService,
        private translate: TranslateService,
        private confirmationModalService: ConfirmationModalService,
        
    ) { }

    ngOnInit() {

    }
    ngOnChanges() {
        if (this.adjustmentTypes != null) {
            this.adjustmentTypesGrid = this.adjustmentTypes;
            this.adjustmentTypes.forEach(adjType => {
                adjType['AdjTypeStatus'] = adjType['IsActive'] ? 'Active' : 'InActive';
                adjType['Category'] = adjType['IsPositive'] ? 'Positive (+)' : 'Negative (-)';
                adjType['Impacts'] = adjType['ImpactType'] == 1 ? "Production" : (adjType['ImpactType'] == 2 ? "Collection" : "Adjustments");
            });
        }
    }

    checkAdjustmentTypeAssociations(dataItem) {
        this.adjustmentTypesService.GetAdjustmentTypeAssociatedWithTransactions(dataItem?.AdjustmentTypeId).then(res => {
            this.checkDeleteSuccess(res);
        }, () => {
            this.checkDeleteFailure(); 
        });
    }

    checkDeleteSuccess = (res) => {
        let content = ''; let data; let isDelete = false;
        if (res?.Value?.IsAdjustmentTypeAssociatedWithTransactions) {
            content = this.deleteIsUsedInCreditToolTipText;
        }
        if (res?.Value?.IsDefaultTypeOnBenefitPlan) {
            content = this.defaultOnPlanDeleteMessage;
        }
        if (content==''){
            content = this.translate.instant('Are you sure you want to delete adjustment type?');
            isDelete = true;
        }
        if (res?.Value?.IsAdjustmentTypeAssociatedWithTransactions || res?.Value?.IsDefaultTypeOnBenefitPlan) {
            data = {
                header: this.translate.instant('Warning'),
                message: this.translate.instant(content),
                confirm: this.translate.instant('Ok'),
                height: 200,
                width: 650,
            }
        }

        else {
            data = {
                header: this.translate.instant('Confirm'),
                message: this.translate.instant(content),
                confirm: this.translate.instant('Yes'),
                cancel: this.translate.instant('No'),
                height: 200,
                width: 650,
            }
        }

        this.confirmationRef = this.confirmationModalService.open({
            data
        });
        this.confirmationModalSubscription = this.confirmationRef.events.pipe(
            filter((event) => !!event),
            filter((event) => {
                return event.type === 'confirm' || event.type === 'close';
            }),
            take(1)
        ).subscribe((events) => {
            switch (events.type) {
                case 'close':
                    this.confirmationRef.close();
                    break;
                case 'confirm':
                    if (isDelete)
                        this.adjustmentTypesService.deleteAdjustmentTypeById(this.typeToDelete?.AdjustmentTypeId).then((res: SoarResponse<AdjustmentTypes[]>) => {
                            this.onSuccess(res);
                        }, () => {
                            this.onFailure();
                        });
                    this.confirmationRef.close();
                    break;
            }
        });
     
    }

    checkDeleteFailure = () => {
        this.toastrFactory.error(
            this.translate.instant(this.deleteadjustmentFailureText),
            this.translate.instant('Server Error'));
    }

    applyOrderByPipe = (): AdjustmentTypes[] => {
        const orderPipe = new OrderByPipe();
        return orderPipe.transform(this.adjustmentTypes, { sortColumnName: this.defaultOrderKey, sortDirection: 1 }) as AdjustmentTypes[];
    }

    sortAdjustmentTypes = (propName: string) => {
        this.isDescending = !this.isDescending;
        this.sortColumnName = propName;
        this.sortDirection = this.isDescending ? 1 : -1;
    }

    editAdjustmentType = (dataItem: AdjustmentTypes) => {
        let data;
        if (!this.hasEditAccess) {
            this.toolTipEditMessage = this.editAccessToolTipText;
        }
        else if (this.hasEditAccess && dataItem.IsSystemType) {
            this.toolTipEditMessage = this.editSystemTypeToolTipText;
        }
        else {
            this.toolTipEditMessage = '';
        }
        if (this.toolTipEditMessage) {
            data = {
                header: this.translate.instant('Warning'),
                message: this.translate.instant(this.toolTipEditMessage),
                confirm: this.translate.instant('Ok'),
                height: 200,
                width: 650,
            }
            this.confirmationRef = this.confirmationModalService.open({
                data
            });
            this.confirmationModalSubscription = this.confirmationRef.events.pipe(
                filter((event) => !!event),
                filter((event) => {
                    return event.type === 'confirm';
                }),
                take(1)
            ).subscribe((events) => {
                switch (events.type) {
                    case 'confirm':
                        this.confirmationRef.close();
                        break;
                }
            })

        }
        else {
            this.adjustmentTypesService.GetAdjustmentTypeAssociatedWithTransactions(dataItem?.AdjustmentTypeId).then((res: SoarResponse<AdjustmentTypes[]>) => {
                this.drawer.isOpen = true;
                this.adjustmentTypeEditData = cloneDeep(res?.Value);
            }, (ex) => {
                if (ex?.data && ex?.data?.InvalidProperties?.length) {
                    this.toastrFactory.error(
                        this.translate.instant(ex?.data?.InvalidProperties[0]?.ValidationMessage),
                        this.translate.instant(this.defaultFailureText));
                }
                else {
                    this.toastrFactory.error(
                        this.translate.instant(ex?.data?.InvalidProperties[0]?.ValidationMessage),
                        this.translate.instant(this.defaultFailureText));
                }
            });
        }
    }
    deleteAdjustmentType = (adjustmentType: AdjustmentTypes) => {
        this.typeToDelete = adjustmentType;
        if (this.hasDeleteAccess) {
            this.checkAdjustmentTypeAssociations(this.typeToDelete);
        }
    }
    onSuccess = (res) => {
        if (res) {
            const index = this.adjustmentTypes?.findIndex(x => x?.AdjustmentTypeId == this.typeToDelete?.AdjustmentTypeId);
            this.refreshAdjustmentGrid();
            this.toastrFactory.success(
                this.translate.instant('Successfully deleted the adjustment type.'),
                this.translate.instant('Success'));
            this.drawer.isOpen = false;
        }
    }
    onFailure = () => {
        this.toastrFactory.error(
            this.translate.instant(this.deleteadjustmentFailureText),
            this.translate.instant('Server Error'));
    }

    filter(inputType: string) {
        let searchDescText;
        let searchCatText;
        let res;
        if (this.searchDescText)
            searchDescText = this.searchDescText.toLowerCase();
        if (this.searchCatText)
            searchCatText = this.searchCatText.toLowerCase();
        this.adjustmentTypes = this.adjustmentTypesGrid;
        if (inputType == 'description') {
            if (searchCatText != undefined) {
                res = this.adjustmentTypes?.filter( (x) => {
                    return x.Category.toLowerCase().includes(searchCatText);
                });
                this.adjustmentTypes = res;
            }
            if (searchDescText != undefined) {
                res = this.adjustmentTypes?.filter( (x) => {
                    return x.Description.toLowerCase().includes(searchDescText);
                });
                this.adjustmentTypes = res;
            }
        }
        else if (inputType == 'category') {
            if (searchDescText != undefined) {
                res = this.adjustmentTypes?.filter( (x) => {
                    return x.Description.toLowerCase().includes(searchDescText);
                });
                this.adjustmentTypes = res;
            }
            if (searchCatText != undefined) {
                res = this.adjustmentTypes?.filter( (x) => {
                    return x.Category.toLowerCase().includes(searchCatText);
                });
                this.adjustmentTypes = res;
            }
        }

    }
    refreshAdjustmentGrid = () => {
        this.refreshAdjustmentTypeGrid?.emit();
        this.searchCatText = "";
        this.searchDescText = "";
    }

    showToolTip(dataItem) {
        if (!this.hasEditAccess) {
            this.toolTipEditMessage = this.editAccessToolTipText;
        }
        else if (this.hasEditAccess && dataItem?.IsSystemType) {
            this.toolTipEditMessage = this.editSystemTypeToolTipText;
        }
        else {
            this.toolTipEditMessage = '';
        }
    }
}
