import { Component, OnInit, Inject, OnDestroy, ViewChild } from '@angular/core';
import * as moment from 'moment';
import { GridType, GridsterConfig, GridsterItem } from 'angular-gridster2';
import { OrderByPipe } from '../../@shared/pipes';
import { DashboardWidgetService, WidgetInitStatus } from '../widgets/services/dashboard-widget.service';
import { TranslateService } from '@ngx-translate/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { PatientCurrentLocation } from 'src/patient/common/models/patient-location.model';
import { AppointmentsGridWidgetComponent } from '../widgets/templates/appointments-grid-widget/appointments-grid-widget.component';
import { DropDownListComponent } from '@progress/kendo-angular-dropdowns';
import { DashboardWidgetStatus, DashboardWidgetTitle } from '../widgets/services/dashboard-widget';


@Component({
    selector: 'user-dashboard',
    templateUrl: './user-dashboard.component.html',
    styleUrls: ['./user-dashboard.component.scss']
})
export class UserDashboardComponent implements OnInit, OnDestroy {
    userDashboardForm: FormGroup = new FormGroup({
        hiddenFilter: new FormControl(),
    });
    @ViewChild(AppointmentsGridWidgetComponent) appointmentGrid: AppointmentsGridWidgetComponent;
    constructor(
        @Inject('locationService') private locationService,
        @Inject('referenceDataService') private referenceDataService,
        @Inject('$rootScope') private $rootScope,
        @Inject('UserServices') private userServices,
        @Inject('DashboardService') private dashboardService,
        @Inject('toastrFactory') private toastrFactory,
        @Inject('AppointmentViewVisibleService') private appointmentViewVisibleService,
        @Inject('AppointmentViewLoadingService') private appointmentViewLoadingService,
        private translate: TranslateService,
        public fb: FormBuilder,
        private dashboardWidgetService: DashboardWidgetService) {
    }
    practiceAtAGlanceURL = '/BusinessCenter/PracticeAtAGlance';
    dashboardURL = '#/Dashboard2/';
    uibModalInstance; //No data type found for this
    isLoaded = WidgetInitStatus.Loaded;
    isError = WidgetInitStatus.error;
    dayDateDisplay = moment(new Date()).format('dddd, MMMM D, YYYY');
    displayName = '';
    location: PatientCurrentLocation;
    locationPath = '/';
    dashboardDefinition;
    dashboardId = 2;
    batchIds = []; // To load batches
    // Properties for Gridster     
    errorMessage = '';
    saveLayoutDisabled = true;
    columns: number;
    draggable = false;
    resizable = false;
    unSelectedItems = [];
    customItemMap = {};
    gridsterOpts: GridsterConfig;
    standardItems: Array<GridsterItem>;
    hiddenItems: Array<GridsterItem>;
    hiddenWidgetFilterOptions = [];
    orderPipe = new OrderByPipe();
    isAppointmentViewVisible = false;
    isSecondaryAppointmentViewVisible = false;
    savedLayout: [];
    hiddenFilter: { Id: number, Value: string } = null;
    refreshList = false;
    tempHiddenFilterOptions = [];
    showHiddenText = this.translate.instant('Show Hidden')
    public defaultItem: { Value: string, Id: number } = {
        Value: this.showHiddenText,
        Id: null,
    };
    welcomeText = this.translate.instant('Welcome');
    noHiddenWidgetsText = this.translate.instant('NO HIDDEN WIDGETS');
    saveLayoutText = this.translate.instant('Save Layout');
    viewNewDashboardText = this.translate.instant('View New Dashboard');

    // Property for accessing Enums
    public get DashboardWidgetTitle(): typeof DashboardWidgetTitle {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return DashboardWidgetTitle;
    }

    //Remove templateUrlPath and controllerName once appointment view migrated
    templateUrlPath = 'App/Schedule/appointments/appointment-view/appointment-view.html';
    controllerName = 'AppointmentViewController';

    onLoadingComplete = (e: DashboardWidgetStatus) => {
        const index = this.dashboardDefinition?.Items?.findIndex(item => item?.ItemId == e?.itemId);
        if (index > -1) {
            this.dashboardDefinition.Items[index].initMode = e?.loading;
            this.errorMessage = e?.errorMessage;
        }
    }

    ngOnInit() {
        this.$rootScope.$on('patCore:initlocation', () => {
            this.location = this.locationService.getCurrentLocation();
            this.getUser();
        });

        // deal with initialization of the location.
        const userLocation = this.locationService.getCurrentLocation();
        if (userLocation) {
            this.location = userLocation;
            this.getUser();
        }
        else {
            this.$rootScope.$on('patCore:load-location-display', (event) => {
                this.location = event?.location;
                this.getUser();
            });
        }
        // Required for gridster initialization
        this.gridsterOpts = {
            draggable: {
                enabled: false,
            },
            resizable: {
                enabled: false,
            },
            maxCols: 8,
            minCols: 8,
            minRows: 1,
            maxRows: 100,
            gridType: GridType.ScrollVertical,
            margin: 10,
            mobileBreakpoint: 600,
            useBodyForBreakpoint: false,
            maxItemCols: 100,
            minItemCols: 1,
            maxItemRows: 90,
            minItemRows: 1,
            compactType: 'compactUp'
        };
        this.appointmentViewVisibleService.registerObserver(this.onAppointmentViewVisibleChange);
    }

    onAppointmentViewVisibleChange = (isVisible, isSecondaryVisible) => {
        const data = this.appointmentViewLoadingService.currentAppointmentSaveResult;
        this.isAppointmentViewVisible = isVisible;
        this.isSecondaryAppointmentViewVisible = isSecondaryVisible;
        if ((!isVisible || !isSecondaryVisible) && data !== null && data !== undefined) {
            if (this.appointmentViewLoadingService.afterSaveEvent) {
                this.$rootScope.$broadcast(this.appointmentViewLoadingService.afterSaveEvent, data);
            }
        }
    }

    getUser = () => {
        const users = this.referenceDataService?.get(this.referenceDataService?.entityNames?.users);
        const user = users?.find(user => user?.UserId == this.$rootScope?.patAuthContext?.userInfo?.userid);
        if (user) {
            this.userSuccess({ Value: user });
        } else {
            this.userServices?.Users?.get(
                { Id: this.$rootScope?.patAuthContext?.userInfo?.userid }, this.userSuccess, this.userFailed);
        }
    }

    userSuccess = (res) => {
        if (!this.location) {
            this.location = this.locationService?.getCurrentLocation();
        }
        const user = res?.Value;
        if (user) {
            const middleName: string = user?.MiddleName || '';
            const suffixName: string = user?.SuffixName || '';
            const designation: string = user?.ProfessionalDesignation || '';
            this.displayName = `${user?.FirstName as string}${middleName?.length > 0 ? ` ${middleName?.charAt(0)}` : ''} ${user?.LastName as string}${suffixName?.length > 0 ? `, ${suffixName}` : ''} - ${user?.UserCode as string}${designation?.length > 0 ? `, ${designation}` : ''}`.trim();
        }
        this.dashboardService?.BatchLoader?.Init([this.location?.id], user, this.dashboardId, this.batchIds,
            this.dashboardLoadSuccess,
            this.dashboardLoadFailed
        );
        //Create login event (if first visit)
        const firstVisit = localStorage?.getItem("isFirstVisit");
        if (firstVisit != 'false') {
            this.userServices?.LoginActivityEvent?.create('');
            localStorage?.setItem("isFirstVisit", "false");
        }
    }

    userFailed = () => {
        this.toastrFactory?.error(this.translate.instant('Failed to retrieve the current user. Refresh the page to try again.'), this.translate.instant('Server Error'));
    }

    dashboardLoadSuccess = (definition) => {
        this.dashboardService.DashboardId = this.dashboardId;
        this.dashboardDefinition = definition;
        this.dashboardDefinition?.Items?.forEach((widget) => {
            widget.Locations = [this.location?.id];
            //To Do: Change once created Appointments widget
            if (widget?.Title == DashboardWidgetTitle.Appointments) {
                widget.initMode = WidgetInitStatus.Loaded;
            }
        });
        this.createGridster();
    }

    dashboardLoadFailed = () => {
        this.toastrFactory?.error(this.translate.instant('Failed to retrieve the dashboard definition. Refresh the page to try again.'),
            this.translate.instant('Server Error'));
    }

    createGridster = (change = true) => {
        if (this.dashboardDefinition) {
            this.hiddenWidgetFilterOptions = [];
            this.standardItems = this.dashboardDefinition?.Items?.filter(item => !item.IsHidden);
            this.standardItems?.forEach(item => {
                item.rows = item?.Size?.Height ?? 2;
                item.cols = item?.Size?.Width ? item?.Size?.Width : item?.Title == DashboardWidgetTitle.Appointments ? 4 : 2;
                if (change) {
                    [item.y, item.x] = item?.Position ?? [undefined, undefined];
                }
            });
            this.hiddenItems = this.dashboardDefinition?.Items?.filter(item => item.IsHidden as boolean);
            this.unSelectedItems = this.hiddenItems?.map((item) => { return { Value: item?.Title, Id: item?.ItemId }; });
            this.hiddenWidgetFilterOptions = this.orderPipe.transform(this.unSelectedItems, { sortColumnName: 'Value', sortDirection: 1 });
            this.tempHiddenFilterOptions = [...this.hiddenWidgetFilterOptions];
            this.hiddenFilter = { Id: null, Value: this.showHiddenText }
            this.refreshList = true;
            this.columns = this.dashboardDefinition?.Columns;
            this.draggable = this.dashboardDefinition?.CanDrag;
            this.resizable = this.dashboardDefinition?.CanResize;
        }
        else {
            this.draggable = false;
            this.resizable = false;
        }
        if (!this.standardItems)
            this.standardItems = [];
        if (this.columns == null)
            this.columns = 6;
        this.gridsterOpts = {
            draggable: {
                enabled: this.draggable,
                ignoreContentClass: 'date-range-selector-popup-ng'
            },
            resizable: {
                enabled: this.resizable,
            },
            maxCols: 8,
            margin: 10,
            itemChangeCallback: this.itemChange,
        };
    }

    itemChange = () => {
        this.saveLayoutDisabled = false;
    }

    hideWidget = (itemId) => {
        const index = this.dashboardDefinition?.Items?.findIndex(item => item?.ItemId == itemId);
        if (index > -1) {
            this.hiddenFilter = this.dashboardDefinition?.Items[index]?.Template;
            this.dashboardDefinition.Items[index].IsHidden = true;
            this.saveLayoutDisabled = false;
            this.refreshList = false;
            this.createGridster();
        }
    }

    changeFilter = (value) => {
        if (value && this.dashboardDefinition?.Items) {
            const selectedItem = this.dashboardDefinition?.Items?.find((item) => item?.ItemId == value?.Id);
            if (selectedItem) {
                selectedItem.x = undefined;
                selectedItem.y = undefined;
                selectedItem.initMode = WidgetInitStatus.ToLoad; // This is to force the widget to load data again when it is visible
                selectedItem.IsHidden = false;
                this.saveLayoutDisabled = false;
                this.refreshList = false;
                this.createGridster(false);
            }
        }
        this.userDashboardForm?.controls["hiddenFilter"]?.setValue({
            Value: this.showHiddenText,
            Id: null,
        });
    }

    saveLayout = () => {
        if (this.saveLayoutDisabled)
            return;
        this.dashboardDefinition?.Items?.forEach(item => {
            item.Position = Object.values([item?.y ?? 0, item?.x ?? 0]);
        });
        this.dashboardService?.DashboardDefinitions.save({ id: this.dashboardService?.DashboardId }, this.dashboardDefinition).$promise.then((res) => {
            this.savedLayout = res?.Value;
            this.saveLayoutDisabled = true;
            this.toastrFactory.success(this.translate.instant('Your layout has been saved.'), this.translate.instant('Success'));
        }, () => {
            this.toastrFactory.error(this.translate.instant('Your layout has not been saved.'), this.translate.instant('Failed'));
        });
    }

    clickedOutside = (showHiddenDropdown: DropDownListComponent) => {
        this.dashboardWidgetService.clickedOutside(showHiddenDropdown)
    }

    ngOnDestroy(): void {
        // unregister from observer for the appointment visibility        
        this.appointmentViewVisibleService.clearObserver(this.onAppointmentViewVisibleChange);
        this.appointmentViewVisibleService.setAppointmentViewVisible(false);
        this.appointmentViewVisibleService.setSecondaryAppointmentViewVisible(false);
    }
}