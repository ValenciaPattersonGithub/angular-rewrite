import { Component, Inject, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import isUndefined from 'lodash/isUndefined';
import { TaxableServices } from 'src/business-center/service-code/service-code-model';
import { finalize } from 'rxjs/operators';
import cloneDeep from 'lodash/cloneDeep';
import find from 'lodash/find';
import { SoarResponse } from 'src/@core/models/core/soar-response';
import { FeeListDto, FeeListLocationDTO, FeeListsService } from 'src/@shared/providers/fee-lists.service';
import { AuthAccess } from 'src/@shared/models/auth-access.model';

@Component({
    selector: 'fee-lists-landing',
    templateUrl: './fee-lists-landing.component.html',
    styleUrls: ['./fee-lists-landing.component.scss']
})
export class FeeListsLandingComponent implements OnInit {
    feeListsData: FeeListLocationDTO[];

    loadingMessageNoResults = "";
    editOrViewMode = false;
    loadingFeeList = false;
    loadingFeeLists = false;
    feeListsArray: FeeListLocationDTO[];
    reports: [{
        ReportTitle: ''
    }];
    selectedReport = { ReportId: 0 };
    ServiceCodeFeesByLocationReportId: number;
    viewReportAmfa = 'soar-report-svc-fbyloc';
    breadCrumbs: { name: string, path: string, title: string }[] = [];
    hasReportAccess = false;
    orderBy = {
        field: 'Name',
        asc: true
    };
    taxableServices: TaxableServices[];
    dataForCrudOperation = {
        SaveAsDraft: true,
        EditMode: false,
        ViewOnly: false,
        Create: false,
        BackupFeeList: {},
        DataHasChanged: false,
        DraftDataHasChanged: false,
        BreadCrumbs: [],
        FeeList: {
            FeeListId: 0,
            ServiceCodes: [],

        }
    }
    authAccess: AuthAccess;

    constructor(
        @Inject('localize') private localize,
        @Inject('toastrFactory') private toastrFactory,
        @Inject('patSecurityService') private patSecurityService,
        @Inject('$location') private $location,
        @Inject('StaticData') private staticData,
        @Inject('ReportsFactory') private reportsFactory,
        @Inject('ModalFactory') private modalFactory,
        @Inject('referenceDataService') private referenceDataService,
        private feeListsService: FeeListsService) { }

    ngOnInit(): void {
        this.authViewAccess();
        this.getPageNavigation();
        this.getTaxableServices();
        this.getReportsData();
        this.getFeeLists();
    }

    //#region navigation
    getPageNavigation = () => {
        this.breadCrumbs = [
            {
                name: this.localize.getLocalizedString('Practice Settings'),
                path: '#/BusinessCenter/PracticeSettings/',
                title: 'Practice Settings'
            },
            {
                name: this.localize.getLocalizedString('Location Fee Lists'),
                path: '#/BusinessCenter/FeeLists/',
                title: 'Location Fee Lists'
            }
        ];
    }
    //end region

    //#region Auth

    authViewAccess = () => {
        //get user location
        const cachedLocation = JSON.parse(sessionStorage?.getItem('userLocation'));
        const userLocation = !(isUndefined(cachedLocation)) ? cachedLocation : null;
        this.authAccess = new AuthAccess();
        this.authAccess = this.feeListsService.authAccess();
        this.hasReportAccess = (this.patSecurityService.IsAuthorizedByAbbreviation(this.viewReportAmfa) ||
            this.patSecurityService.IsAuthorizedByAbbreviationAtLocation(
                this.viewReportAmfa,
                userLocation?.id
            ));

        if (!this.authAccess.view) {
            this.toastrFactory.error(this.patSecurityService.generateMessage('soar-biz-feelst-view'), 'Not Authorized');
            this.$location.path(encodeURIComponent('/'));
        }
    }
    //end region

    getTaxableServices = () => {
        this.staticData.TaxableServices().then((res) => {
            if (res && res?.Value) {
                this.taxableServices = res?.Value;
            }
        });
    }


    loadLocationName = (feeListsArray = this.feeListsData) => {
        this.feeListsArray = feeListsArray || [];
        if (this.feeListsArray) {
            this.feeListsArray?.forEach(feeList => {
                this.addLocationNames(feeList);
            })
        }
    }

    //#region Reports
    getReportsData = () => {
        this.reports = null;
        this.ServiceCodeFeesByLocationReportId = 12;
        if (this.hasReportAccess) {
            this.reports = this.reportsFactory.GetReportArray([this.ServiceCodeFeesByLocationReportId]);
        }
        else {
            this.reports = null;
        }
    }

    selectedReportChange = (reportId) => {
        if (reportId != null && reportId != undefined) {
            const currentReport = this.reports[reportId - 1];
            this.reportsFactory.OpenReportPage(currentReport,
                '/BusinessCenter/ServiceCode/' + currentReport?.ReportTitle?.replace(/\s/g, ''),
                true);
            this.reportListBlur();
        }
    }
    //#endregion

    addLocationNames = (feeList) => {
        feeList.LocationNames = '';
        for (let i = 0; i < feeList?.Locations?.length; i++) {
            feeList.LocationNames += feeList.Locations[i].Value += ', ';
        }
        // remove last comma
        const lastChar = feeList?.LocationNames?.slice(-2);
        if (lastChar === ', ') {
            feeList.LocationNames = feeList?.LocationNames?.slice(0, -2);
        }
    };

    // function to apply orderBy functionality
    changeSortingForGrid = (field) => {
        const asc = this.orderBy.field === field ? !this.orderBy?.asc : true;
        this.orderBy = {
            field: field, asc: asc
        };
    };

    navigateToLanding = (name) => {
        if (name === this.localize?.getLocalizedString('Location Fee Lists')) {
            this.resetDataForCrud();
        }
    }

    resetDataForCrud = () => {
        if (this.breadCrumbs?.length > 2) {
            this.dataForCrudOperation?.BreadCrumbs?.pop();
            this.breadCrumbs?.pop();
        }
        this.dataForCrudOperation.DataHasChanged = false;
        this.dataForCrudOperation.DraftDataHasChanged = false;
        this.dataForCrudOperation.SaveAsDraft = false;
        this.dataForCrudOperation.EditMode = false;
        this.dataForCrudOperation.ViewOnly = false;
        this.dataForCrudOperation.Create = false;
        this.dataForCrudOperation.BackupFeeList = {};
        this.editOrViewMode = false;
        this.orderBy = {
            field: 'Name',
            asc: true
        };

    };

    // discard service method
    resetData = () => {
        this.dataForCrudOperation.DataHasChanged = false;
    };

    reportListBlur = () => {
        this.selectedReport.ReportId = null;
    }

    // refreshes the list after save
    getFeeLists = () => {
        if (this.authAccess?.view) {
            let loadFeeList: Observable<SoarResponse<FeeListLocationDTO[]>> = null;
            loadFeeList = this.feeListsService.get();
            loadFeeList
                .pipe(finalize(() => this.loadingFeeList = false))
                .subscribe({
                    next: (loadFeeListResponse: SoarResponse<FeeListLocationDTO[]>) => this.handleLoadFeeListSuccess(loadFeeListResponse),
                    error: () => this.handleLoadFeeListError()
                });
        }
    }

    handleLoadFeeListSuccess(loadFeeListResponse: SoarResponse<FeeListLocationDTO[]>) {
        this.feeListsData = loadFeeListResponse?.Value;
        this.loadLocationName();
    }

    handleLoadFeeListError() {
        this.toastrFactory.error(
            this.localize?.getLocalizedString('Server Error'));
    }

    cancel = () => {
        this.resetDataForCrud();
    };

    save = () => {
        // check permissions ? publish
        let hasAccess = false;
        if (this.dataForCrudOperation?.EditMode) {
            hasAccess = this.authAccess?.update;
        } else {
            hasAccess = this.authAccess?.create;
        }

        if (hasAccess) {
            const feeList = this.dataForCrudOperation?.FeeList;
            this.loadingFeeList = true;

            let saveFeeList: Observable<SoarResponse<FeeListDto>> = null;
            if (this.dataForCrudOperation?.EditMode) {
                if (feeList.ServiceCodes && feeList?.ServiceCodes?.length > 0) {
                    feeList.ServiceCodes = this.dataForCrudOperation?.SaveAsDraft
                        ? feeList.ServiceCodes?.filter(serviceCode => serviceCode?.$$DraftModified)
                        : feeList.ServiceCodes?.filter(serviceCode =>
                            (serviceCode?.NewFee != serviceCode?.Fee || serviceCode?.NewTaxableServiceTypeId != serviceCode?.TaxableServiceTypeId)) // Filtering on $$Modified would be equivilant in some scenarios, but we need to filter this way to account for publishing drafts.
                }

                saveFeeList = this.feeListsService.update(feeList as FeeListDto, this.dataForCrudOperation?.SaveAsDraft);
            }
            else {
                saveFeeList = this.feeListsService.create(feeList as FeeListDto);
            }

            const isEditMode = this.dataForCrudOperation?.EditMode;
            saveFeeList
                .pipe(finalize(() => this.loadingFeeList = false))
                .subscribe({
                    next: (updatedFeeListResponse: SoarResponse<FeeListDto>) => this.handleFeeListSaveSuccess(updatedFeeListResponse, isEditMode),
                    error: () => this.handleFeeListSaveError()
                });
        }
    };

    handleFeeListSaveSuccess(updatedFeeListResponse: SoarResponse<FeeListDto>, isEditMode: boolean) {
        let addOrUpdateText = 'created';
        if (isEditMode)
            addOrUpdateText = 'updated';

        this.toastrFactory.success(
            this.localize?.getLocalizedString('Your {0} has been {1}.', ['Fee List', addOrUpdateText]),
            this.localize?.getLocalizedString('Success'));

        this.referenceDataService.forceEntityExecution(this.referenceDataService.entityNames?.feeLists);
        this.referenceDataService.forceEntityExecution(this.referenceDataService.entityNames?.serviceCodes);

        // get the feeLists again to refresh
        this.refreshGrid();
    }

    handleFeeListSaveError() {
        this.toastrFactory.error(
            this.localize?.getLocalizedString('Save was unsuccessful. Please retry your save.'),
            this.localize?.getLocalizedString('Server Error'));
    }


    initNewFeeList = () => {
        if (this.authAccess?.create) {
            this.loadingFeeList = true;
            this.dataForCrudOperation.Create = true;
            let newFeeList: Observable<SoarResponse<FeeListDto>> = null;
            newFeeList = this.feeListsService.new();
            newFeeList
                .pipe(finalize(() => this.loadingFeeList = false))
                .subscribe({
                    next: (initNewFeeListResponse: SoarResponse<FeeListDto>) => this.handleFeeListInitNewSuccess(initNewFeeListResponse, this.dataForCrudOperation?.Create),
                    error: () => this.handleFeeListInitNewError()
                });
        }
    }

    handleFeeListInitNewSuccess(initNewFeeListResponse: SoarResponse<FeeListDto>, isCreateMode: boolean) {
        this.dataForCrudOperation.FeeList = initNewFeeListResponse?.Value;
        this.dataForCrudOperation.BackupFeeList = cloneDeep(this.dataForCrudOperation?.FeeList);
        this.dataForCrudOperation.FeeList?.ServiceCodes?.forEach((sc) => {
            sc.CdtCodeName = sc.CdtCodeName ? sc.CdtCodeName : '';
            const taxableService = this.taxableServices.find(x => x?.Id == sc?.TaxableServiceTypeId);
            sc.$$TaxableServiceTypeName = taxableService ? taxableService?.Name : '';
        });
        this.dataForCrudOperation?.BreadCrumbs?.push({ name: this.localize?.getLocalizedString('Add a Location Fee List') });
        this.breadCrumbs?.push({ name: this.localize?.getLocalizedString('Add a Location Fee List'), path: '', title: '' });
        this.editOrViewMode = isCreateMode;
        this.loadingFeeList = false;
    }

    handleFeeListInitNewError() {
        this.toastrFactory.error(
            this.localize?.getLocalizedString('New was unsuccessful. Please retry your save.'),
            this.localize?.getLocalizedString('Server Error'));
    }

    deleteFeeList = (FeeListId) => {
        if (this.authAccess?.delete) {
            let feeListsToDelete: Observable<SoarResponse<FeeListLocationDTO[]>> = null;
            feeListsToDelete = this.feeListsService.get();
            feeListsToDelete
                .pipe(finalize(() => this.loadingFeeList = false))
                .subscribe({
                    next: (feeListsToDeleteResponse: SoarResponse<FeeListLocationDTO[]>) => this.handleFeeListToDeleteResponseSuccess(feeListsToDeleteResponse, FeeListId),
                    error: () => this.handleFeeListToDeleteResponseError()
                });
        }
    }

    handleFeeListToDeleteResponseSuccess(feeLists: SoarResponse<FeeListLocationDTO[]>, feeListId: number) {
        // filter for selected feeList
        const selectedFeeList = find(feeLists?.Value, { FeeListId: feeListId });
        if (selectedFeeList) {
            if (selectedFeeList.Locations?.length > 0) {
                this.confirmNoDelete(selectedFeeList);
            } else {
                this.confirmDelete(selectedFeeList);
            }
        }
    }

    handleFeeListToDeleteResponseError() {
        this.toastrFactory.error(
            this.localize?.getLocalizedString('Server Error while deleting  feelist'));
    }

    deleteFeeListDraft = () => {
        if (this.authAccess?.delete) {
            const feeListId = this.dataForCrudOperation?.FeeList?.FeeListId;
            // we need to get a fresh list to make sure draft is still valid
            let feeListsToDeleteDraft: Observable<SoarResponse<FeeListLocationDTO[]>> = null;
            feeListsToDeleteDraft = this.feeListsService.get();
            feeListsToDeleteDraft
                .pipe(finalize(() => this.loadingFeeList = false))
                .subscribe({
                    next: (feeListsToDeleteDraftResponse: SoarResponse<FeeListLocationDTO[]>) => this.handleFeeListsToDeleteDraftResponseSuccess(feeListsToDeleteDraftResponse, feeListId),
                    error: () => this.handleFeeListToDeleteDraftResponseError()
                });
        }
    };

    handleFeeListsToDeleteDraftResponseSuccess(feeListsToDeleteDraftResponse: SoarResponse<FeeListLocationDTO[]>, feeListId: number) {
        const feeLists = feeListsToDeleteDraftResponse;
        // filter for selected feeList
        const selectedFeeList = find(feeLists?.Value, { FeeListId: feeListId });
        if (selectedFeeList) {
            this.confirmDeleteFeeListDraft(this.dataForCrudOperation?.FeeList);
        }
    }

    handleFeeListToDeleteDraftResponseError() {
        this.toastrFactory.error(
            this.localize?.getLocalizedString('Server Error while deleting feelist draft'));
    }

    confirmDelete = (feeList) => {
        const data = feeList;
        const title = this.localize?.getLocalizedString(`Delete "${String(feeList?.Name)}" ?`);
        const message =
            this.localize?.getLocalizedString("Are you sure you want to delete this location fee list?");
        const button1Text = this.localize?.getLocalizedString("Yes");
        const button2Text = this.localize?.getLocalizedString("No");
        this.modalFactory.ConfirmModal(title, message, button1Text, button2Text, data).then(this.deleteConfirmed);
    };

    confirmNoDelete = (feeList) => {
        let message = this.localize?.getLocalizedString("The following locations are assigned to this fee list");
        message += ':\n\n';
        for (let i = 0; i < feeList?.Locations?.length; i++) {
            let ofcLocation = feeList?.Locations[i]?.Value;
            // remove last comma
            const lastChar = ofcLocation?.slice(-2);
            if (lastChar === ", ") {
                ofcLocation = ofcLocation?.slice(0, -2);
            }
            message += ofcLocation += "\n ";
        }
        message += "\n ";
        message += this.localize?.getLocalizedString("You must remove all assigned locations to delete a fee list.");
        message += "\n\n";
        const title = this.localize?.getLocalizedString(`${String(feeList?.Name)}" Cannot be deleted.`);
        const button1Text = this.localize?.getLocalizedString('OK');
        this.modalFactory.ConfirmModal(title, message, button1Text).then(this.cancelSave, this.resumeSave);
    }

    cancelSave = () => { }

    resumeSave = () => { }

    confirmDeleteFeeListDraft = (feeList) => {
        const data = feeList;
        const title = this.localize?.getLocalizedString(`Delete "${String(feeList?.Name)}" Draft`);
        const message = this.localize?.getLocalizedString("Are you sure you want to delete this location fee list draft?");
        const button1Text = this.localize?.getLocalizedString("Yes");
        const button2Text = this.localize?.getLocalizedString("No");
        this.modalFactory.ConfirmModal(title, message, button1Text, button2Text, data)
            .then(this.deleteFeeListDraftConfirmed);
    };

    deleteFeeListDraftConfirmed = (feeList) => {
        this.feeListsService.deleteDraft(feeList).then(() => {
            // get the feeLists again to refresh
            this.refreshGrid();
        }).catch((_error) => { })
    }


    //#endregion


    deleteConfirmed = (feeList) => {
        this.feeListsService.delete(feeList).then(() => {
            this.referenceDataService.forceEntityExecution(this.referenceDataService.entityNames?.feeLists);
            this.referenceDataService.forceEntityExecution(this.referenceDataService.entityNames?.serviceCodes);
            // get the feeLists again to refresh
            this.refreshGrid();
        }).catch((_error) => { })
    }

    //#endregion


    viewFeeList = (feeList) => {
        if (this.authAccess?.view && !this.loadingFeeList) {
            this.loadingFeeList = true;
            this.dataForCrudOperation.ViewOnly = true;
            let viewFeeList: Observable<SoarResponse<FeeListDto>> = null;
            viewFeeList = this.feeListsService.getById(feeList?.FeeListId);
            viewFeeList
                .pipe(finalize(() => this.loadingFeeList = false))
                .subscribe({
                    next: (viewFeeListResponse: SoarResponse<FeeListDto>) => this.handleViewFeeListSuccess(viewFeeListResponse),
                    error: () => this.handleViewFeeListResponseError()
                });
        }
    }

    handleViewFeeListSuccess(viewFeeListResponse: SoarResponse<FeeListDto>) {
        this.dataForCrudOperation.FeeList = viewFeeListResponse?.Value;
        this.dataForCrudOperation.FeeList?.ServiceCodes?.forEach((sc) => {
            const taxableService = this.taxableServices?.find(x => x?.Id == sc?.TaxableServiceTypeId);
            sc.$$TaxableServiceTypeName = taxableService ? taxableService?.Name : '';
        });
        this.dataForCrudOperation?.FeeList?.ServiceCodes?.forEach((sc) => {
            sc.CdtCodeName = sc?.CdtCodeName ? sc?.CdtCodeName : '';
        });
        this.dataForCrudOperation?.BreadCrumbs?.push({ name: this.localize?.getLocalizedString('View a Location Fee List') });
        this.breadCrumbs?.push({ name: this.localize?.getLocalizedString('View a Location Fee List'), path: '', title: '' });
        this.editOrViewMode = true;
        this.loadingFeeList = false;
    }

    handleViewFeeListResponseError() {
        this.toastrFactory.error(
            this.localize?.getLocalizedString('Server Error'));
    }

    //#region editing fee list or draft

    editFeeList = (feeListId) => {
        if (this.authAccess?.update && !this.loadingFeeList) {
            this.dataForCrudOperation.EditMode = true;
            this.loadingFeeList = true;

            let editFeeList: Observable<SoarResponse<FeeListDto>> = null;
            editFeeList = this.feeListsService.getById(feeListId);
            editFeeList
                .pipe(finalize(() => this.loadingFeeList = false))
                .subscribe({
                    next: (editFeeListResponse: SoarResponse<FeeListDto>) => this.handleEditFeeListSuccess(editFeeListResponse, this.dataForCrudOperation?.EditMode),
                    error: () => this.handleEditFeeListError()
                });
        }
    };

    handleEditFeeListSuccess(editFeeListResponse: SoarResponse<FeeListDto>, isEditMode: boolean) {
        this.dataForCrudOperation.FeeList = editFeeListResponse?.Value;
        this.dataForCrudOperation.BackupFeeList = cloneDeep(this.dataForCrudOperation?.FeeList);
        this.dataForCrudOperation.FeeList?.ServiceCodes.forEach((sc) => {
            sc.CdtCodeName = sc?.CdtCodeName ? sc?.CdtCodeName : '';
            const taxableService = this.taxableServices?.find(x => x?.Id == sc?.TaxableServiceTypeId);
            sc.$$TaxableServiceTypeName = taxableService ? taxableService?.Name : '';
        });
        this.dataForCrudOperation?.BreadCrumbs?.push({ name: this.localize?.getLocalizedString('Edit a Location Fee List') });
        this.breadCrumbs?.push({ name: this.localize?.getLocalizedString('Edit a Location Fee List'), path: '', title: '' });
        this.editOrViewMode = isEditMode;
        this.loadingFeeList = false;
    }

    handleEditFeeListError() {
        this.toastrFactory.error(
            this.localize?.getLocalizedString('Server Error'));
    }

    refreshGrid = () => {
        this.resetDataForCrud();
        this.getFeeLists();
    }
    //#endregion
}
