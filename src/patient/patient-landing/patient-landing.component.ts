import { Component, HostListener, Inject, OnDestroy, OnInit, Sanitizer, SecurityContext, ViewChild, ViewContainerRef } from '@angular/core';
import { GroupResult, groupBy } from '@progress/kendo-data-query';
import { PatientLocation, BadgeFilterType, ExportCSV } from '../common/models/patient-location.model';
import { TranslateService } from '@ngx-translate/core';
import { AllPatient, CountUpdate, OtherToDo, PatientManagementCount, PreventiveCare, TreatmentPlans } from '../common/models/patient-grid-response.model';
import { PatientLandingGridService } from '../common/http-providers/patient-landing-grid.service';
import { AllPatientRequest, AppointmentRequest, PreventiveCareRequest, TreatmentPlansRequest, OtherToDoRequest, AllBadgesFilterCriteria } from '../common/models/patient-grid-request.model';
import { Subscription } from 'rxjs';
import { TreatmentPlansGridFilter, OtherToDoGridFilter, DateRangeFilterTypes, NumericRangeFilterTypes, PreventiveCareGridFilter, AppointmentGridFilter, TextFilterType } from '../common/models/patient-grid-filter.model';
import { PatientFilterService } from '../service/patient-filter.service';
import { NewStandardServiceModel } from 'src/@shared/models/new-standard-service.model';
import { SaveStates } from 'src/@shared/models/transaction-enum';
import { Appointment } from 'src/scheduling/common/models/appointment.model';
import { LocationsDisplayService } from 'src/practices/common/providers/locations-display.service';
import { LocationTimeService } from 'src/practices/common/providers';
import { SlideoutFilter, BadgeCSVFileName, PatientBadgeTabType, GridTabList, LocationHash } from '../common/models/enums/patient.enum';
import { DialogRef, DialogService } from '@progress/kendo-angular-dialog';
import { PatientExportModalComponent } from './patient-export-modal/patient-export-modal.component';
import { PatientSlideoutComponent } from '../patient-slideout/patient-slideout.component';
import { PatientContactInfo } from '../common/models/patient-contact-info.model';
import { SoarResponse } from 'src/@core/models/core/soar-response';
import { PatientService } from '../common/http-providers/patient.service';
import { CsvHelper } from 'src/@shared/providers/csv-helper.service';
import { SendMailingModalComponent } from './send-mailing-modal/send-mailing-modal.component';
import { TemplatePrintService } from 'src/@shared/providers/template-print.service';
import { PatientMailingInfo } from 'src/@shared/models/send-mailing.model';
import { MailingLabelPrintService } from 'src/@shared/providers/mailing-label-print.service';
import { AllPatientGridSort, AppointmentGridSort, OtherToDoGridSort, PreventiveGridSort, TreatmentGridSort } from '../common/models/patient-grid-sort.model';
import { ActiveTabService } from '../service/active-tab.service';
import { AllPatientsGridData, AppointmentGridData, IGridHelper, IGridNumericHelper, IPrintMailingHelper, OtherToDoGridData, PreventiveCareGridData, TreatmentPlansGridData } from '../service/grid-helper.service';
import { GridOperationService } from '../service/grid-operation.service';
import { Location } from '@angular/common';
import { FeatureFlagService } from 'src/featureflag/featureflag.service';
import { FuseFlag } from 'src/@core/feature-flags';

@Component({
  selector: 'patient-landing',
  templateUrl: './patient-landing.component.html',
  styleUrls: ['./patient-landing.component.scss']
})
export class PatientLandingComponent implements OnInit, OnDestroy {
  constructor(
    @Inject('toastrFactory') private toastrFactory,
    @Inject('LocationServices') private locationServices,
    @Inject('locationService') private locationService,
    @Inject('AppointmentViewVisibleService') private appointmentViewVisibleService,
    @Inject('AppointmentViewLoadingService') private appointmentViewLoadingService,
    @Inject('$rootScope') private $rootScope,
    @Inject('FeatureService') private featureService,
    @Inject('patSecurityService') private patSecurityService,
    @Inject('SoarConfig') private soarConfig,
    @Inject('AppointmentViewDataLoadingService') private appointmentViewDataLoadingService,
    @Inject('tabLauncher') private tabLauncher,
    @Inject('NewLocationsService') private newLocationsService,
    @Inject('ModalDataFactory') private modalDataFactory,
    @Inject('ScheduleModalFactory') private scheduleModalFactory,
    @Inject('PatientServices') private patientServices,
    @Inject('PatientValidationFactory') private patientValidationFactory,
    @Inject('PersonFactory') private personFactory,
    @Inject('ModalFactory') private modalFactory,
    private locationsDisplayService: LocationsDisplayService,
    private translate: TranslateService,
    private patientLandingGridService: PatientLandingGridService,
    private patientFilterService: PatientFilterService,
    private locationTimeService: LocationTimeService,
    private dialogService: DialogService,
    private csvHelper: CsvHelper,
    private patientService: PatientService,
    private templatePrintService: TemplatePrintService,
    private mailingLabelService: MailingLabelPrintService,
    private activeTabService : ActiveTabService<IGridHelper & IGridNumericHelper & IPrintMailingHelper>,
    private gridOperationService: GridOperationService,
    private location: Location,
    private featureFlagService: FeatureFlagService,
    private sanitizer: Sanitizer
  ) { 
    this.preventiveCareRequest = new PreventiveCareRequest();
    this.preventiveCareRequest.FilterCriteria = new PreventiveCareGridFilter();
    this.treatmentPlansRequest = new TreatmentPlansRequest();
    this.treatmentPlansRequest.FilterCriteria = new TreatmentPlansGridFilter();
    this.appointmentRequest = new AppointmentRequest();
    this.appointmentRequest.FilterCriteria = new AppointmentGridFilter();
    this.otherToDoGridFilter = new OtherToDoRequest();
    this.otherToDoGridFilter.FilterCriteria = new OtherToDoGridFilter();
  }

  showScheduleV2 = false;
  isAppointmentViewVisible = false;
  isSecondaryAppointmentViewVisible = false;
  PatientWorkFlowEnabled = false;
  isAuthAccess = true;
  disablePrint = true
  isUnreadCommunication = false;
  public locationsDDL: GroupResult[];
  public defaultItem: { NameLine1: string, LocationId: number } = {
    NameLine1: this.translate.instant('Select Location'),
    LocationId: null,
  };
  public popupSettings = { width: 'auto', popupClass: 'items-templateListHeader' };
  hideMenu = false;
  grdWidth: string;
  overflow: string;
  slideOutText = this.translate.instant('Hide Filters');
  activeFltrTab: BadgeFilterType = BadgeFilterType.AllPatients;
  activeGridData;
  selectedLocation: { NameLine1: string, LocationId: number };
  commonColumnWidth = 100;
  lastApptColumnWidth = 90;
  nameColumnWidth = 150;
  scheduleColumnWidth = 80;
  dobColumnWidth = 85;
  patientData = [];
  patientCount: CountUpdate = {
    allPatients: null,
    preventiveCare: null,
    treatmentPlans: null,
    appointments: null,
    otherToDo: null,
    loading: true,
  };
  tabList: PatientManagementCount[] = [];
  allPatientsGridOptions: { successAction(data) }
  allPatientRequest = new AllPatientRequest();
  preventiveCareRequest = new PreventiveCareRequest();
  treatmentPlansRequest = new TreatmentPlansRequest();
  OtherToDoRequest = new OtherToDoRequest();
  appointmentRequest = new AppointmentRequest();
  // Temporary variables for storing the request data
  tempAllPatientRequest = new AllPatientRequest();
  tempPreventiveCareRequest = new PreventiveCareRequest();
  tempTreatmentPlansRequest = new TreatmentPlansRequest();
  tempOtherToDoRequest = new OtherToDoRequest();
  tempAppointmentRequest = new AppointmentRequest();
  prevFiltrTab: BadgeFilterType = BadgeFilterType.AllPatients;
  // End of temporary variables
  subscriptions: Array<Subscription> = new Array<Subscription>();
  birthMonthStatus: string[] = ['-1', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];
  IsPatient?: string[] = ['true'];
  IsActive?: string[] = ['true'];
  url = '';
  appointment = new NewStandardServiceModel<Appointment>();
  uibModalInstance; //No data type found for this
  isDescending: boolean;
  sortColumnName: string;
  sortDirection: number;
  keepShow = true;
  transactionPlanHoverData = {};
  mouseX: number
  mouseY: number;
  isMouseUp: boolean;
  txPlansHover = [];
  loading = false;
  totalCount = 0;
  additionalFilters = [];
  allBadgeFilterCriteria: AllBadgesFilterCriteria;
  maxPage = 0;
  pageSize = 50;

  dialog: DialogRef;
  dialogSubscription: Subscription
  @ViewChild('container', { read: ViewContainerRef, static: false }) public containerRef: ViewContainerRef;
  @ViewChild('mailingContainer', { read: ViewContainerRef, static: false }) public mailingContainerRef: ViewContainerRef;

  printTemplate = new PatientMailingInfo();
  csvFileName = '';
  disableMailing = false;

  //Remove templateUrlPath and controllerName once appointment view migrated
  templateUrlPath = 'App/Schedule/appointments/appointment-view/appointment-view.html';
  controllerName = 'AppointmentViewController';

  appointmentGridFilter = new AppointmentRequest();
  otherToDoGridFilter = new OtherToDoRequest();

  allPatientGridSort = new AllPatientGridSort();
  preventiveGridSort = new PreventiveGridSort();
  treatmentGridSort = new TreatmentGridSort();
  appointmentGridSort = new AppointmentGridSort();
  otherToDoGridSort = new OtherToDoGridSort();  

  @ViewChild(PatientSlideoutComponent) public patientSlideout: PatientSlideoutComponent;

  currentSelectedGridDateRangeFilter: DateRangeFilterTypes = new DateRangeFilterTypes();
  currentSelectedNumericRangeFilter: NumericRangeFilterTypes = new NumericRangeFilterTypes();
  public get activeFilterTab(): typeof BadgeFilterType {
    return BadgeFilterType;
  }

  //Column specific to Patient Grid Print
  commonAttributesToDisplay: string[] = [
    "PatientName",
    "PatientDateOfBirth",
    "ResponsiblePartyName",
    "PreviousAppointmentDate",
    "NextAppointmentDate",
    "PreventiveCareDueDate",
    "TreatmentPlanTotalBalance",
    "LastCommunicationDate",
  ];
  apptAttributesToDisplay: string[] = [
    "PatientName",
    "PatientDateOfBirth",
    "ResponsiblePartyName",
    "PreviousAppointmentType",
    "AppointmentDate",
    "PreventiveCareDueDate",
    "AppointmentStatus",
    "LastCommunicationDate"
  ];
  otherAttributesToDisplay: string[] = [
    "PatientName",
    "PatientDateOfBirth",
    "DueDate",
    "IsComplete",
    "PreviousAppointmentType",
    "NextAppointmentType",
    "LastCommunicationDate",
  ];

  // Columns specific to AllPatients, TreatmentPlan, PreventiveCare
  commonColumns = this.activeTabService.allPatientColumns;
  // Columns specific to PreventiveCare
  preventiveColumns = this.activeTabService.preventiveColumns;
  // Columns specific to TreatmentPlan
  treatmentPlansColumns = this.activeTabService.treatmentPlansColumns;
  // Columns specific to Appointments
  appointmentColumns = this.activeTabService.appointmentColumns;
  // Columns specific to Other To Do
  otherToDoColumns = this.activeTabService.otherToDoColumns;

  ngOnInit(): void {
    this.authAccess();
    this.patientFilterService.expandedState = [];
    const hash = window?.location?.hash?.toLowerCase();
   
    this.activeFltrTab = this.activeTabService.getActiveTabByUrl(hash);
    this.prevFiltrTab = this.activeFltrTab; 

    this.setActiveTab(this.activeFltrTab); 

    this.url = this.soarConfig.domainUrl;
    const getCurrentLocation = this.locationService.getCurrentLocation();
    if(this.isAuthAccess)
    this.getAllBadgesCount(getCurrentLocation.id);
    this.getLocations(getCurrentLocation);
    
    this.onLocationChange(hash);

    this.featureService.isEnabled('DevelopmentMode').then((res: boolean) => {
      if (res) {
        this.PatientWorkFlowEnabled = res;
      }
    });

    this.featureFlagService.getOnce$(FuseFlag.ShowScheduleV2).subscribe((value) => {
        this.showScheduleV2 = value;
    });

    // this.hasAddEditAccess = this.patSecurityService.IsAuthorizedByAbbreviation('soar-per-perdem-add');
    this.appointmentViewVisibleService?.registerObserver(this.onAppointmentViewVisibleChange);

    // to hide slideout filter
    if (!this.hideMenu) {
      this.hideDiv();
    }
    this.allPatientRequest = this.patientFilterService.initializeDefaultFilters(this.selectedLocation?.LocationId);
    this.appointmentRequest = this.patientFilterService.initializeDefaultAppointmentFilters(this.selectedLocation?.LocationId);
    this.preventiveCareRequest = this.patientFilterService.initializeDefaultPreventiveCareFilters(this.selectedLocation?.LocationId);
    this.treatmentPlansRequest = this.patientFilterService.initializeDefaultTreatmentPlansFilters(this.selectedLocation?.LocationId);
    this.OtherToDoRequest = this.patientFilterService.initializeDefaultOtherToDoFilters(this.selectedLocation?.LocationId);

    //All Bages Request shared in slideOut component, after Initialize Filter
    this.allBadgeFilterCriteria = {
      allPatients: this.allPatientRequest,
      preventiveCare: this.preventiveCareRequest,
      tratmentPlans: this.treatmentPlansRequest,
      appointments: this.appointmentRequest,
      otherToDo: this.OtherToDoRequest
    }
    this.allRequestLocationUpdate(this.selectedLocation.LocationId);
    if(this.isAuthAccess)
    this.fetchAndLoadGridData();
  }

  authAccess = () => {
    this.isAuthAccess = this.patSecurityService.IsAuthorizedByAbbreviation('soar-nav-lnav-lnpat');
    if (!this.isAuthAccess) {
      this.toastrFactory.error(
        this.translate.instant(
          'User is not authorized to access this area.'
        ),
        this.translate.instant('Not Authorized')
      );
      const url = this.location.path();
      if(url)
        this.location.go(url);
    }   
  };

  setActiveTab = (tabIndex:number) => {
    let activeGrid;
      switch (tabIndex) {
        case BadgeFilterType.PreventiveCare:
          activeGrid = new PreventiveCareGridData(this.translate, this.patientLandingGridService, this.patientFilterService, this.locationTimeService, this.patientServices,this.templatePrintService, this.mailingLabelService, this.modalFactory);
          break;
        case BadgeFilterType.TreatmentPlans:
          activeGrid = new TreatmentPlansGridData(this.translate, this.patientLandingGridService, this.patientFilterService, this.locationTimeService, this.patientServices, this.templatePrintService, this.mailingLabelService, this.modalFactory);
          break;
        case BadgeFilterType.Appointments:
          activeGrid = new AppointmentGridData(this.translate, this.patientLandingGridService, this.patientFilterService, this.locationTimeService, this.patientServices, this.templatePrintService, this.mailingLabelService, this.modalFactory);
          break;
        case BadgeFilterType.otherToDo:
          activeGrid = new OtherToDoGridData(this.translate, this.patientLandingGridService, this.patientFilterService, this.locationTimeService)
          break;
        default:
          activeGrid = new AllPatientsGridData(this.translate, this.patientLandingGridService, this.patientFilterService, this.locationTimeService, this.patientServices, this.templatePrintService, this.mailingLabelService, this.modalFactory);
          break;
      }
      this.activeTabService.setActiveTab(activeGrid);
  }

  onLocationChange(hash: string) {
    this.$rootScope.$on('patCore:initlocation', () => {
      // Check if the location is changed and URL has value
      if (hash?.length > 0 && 
        (hash?.includes(LocationHash.PreventiveCare) || 
        hash?.includes(LocationHash.TreatmentPlans) || 
        hash?.includes(LocationHash.OtherTodo) || 
        hash?.includes(LocationHash.Appointments) || 
        hash?.includes(LocationHash.AllPatients))){
        this.activeFltrTab =  this.prevFiltrTab;
      }
      const location = this.locationService.getCurrentLocation();
      if (location) {
        this.selectedLocation = { NameLine1: location?.name, LocationId: location?.id }
      }

      this.selectedLocationChanged(location?.id);
    });
  }

  //Todo: Need to optimize this method
  fetchAndLoadGridData = () => {
    this.patientFilterService.CurrentPage = 0;
    this.disableMailing = this.activeFltrTab == BadgeFilterType.otherToDo ? true : false;  
    // Get the grid data based on the active filter tab
    this.getGridRecordsByTab();
    this.getTabList(this.activeFltrTab);
  }

  getAllBadgesCount = (selectedLocation: number) => {
    this.patientLandingGridService.updatePatientCount(this.url, selectedLocation).then((res: PatientManagementCount) => {
      this.patientCount.allPatients = res?.AllPatientsCount;
      this.patientCount.preventiveCare = res?.PreventiveCareCount;
      this.patientCount.treatmentPlans = res?.TreatmentPlansCount;
      this.patientCount.appointments = res?.AppointmentsCount;
      this.patientCount.otherToDo = res?.MiscellaneousCount;
      this.patientCount.loading = false;
    }, () => {
      this.patientCount.loading = false;
      this.toastrFactory.error(this.translate.instant('Failed to retrieve the list of {0}. Refresh the page to try again.', ['patients']));
    });
  }

  //Update Location for all Badges Request
  allRequestLocationUpdate = (locationId: number) => {
    this.allPatientRequest.FilterCriteria.LocationId = locationId;
    this.preventiveCareRequest.FilterCriteria.LocationId = locationId;
    this.treatmentPlansRequest.FilterCriteria.LocationId = locationId;
    this.appointmentRequest.FilterCriteria.LocationId = locationId;
    this.OtherToDoRequest.FilterCriteria.LocationId = locationId;
  }

  getTempRequestByFilterType = (filterType: BadgeFilterType) => {
    switch (filterType) {
      case BadgeFilterType.PreventiveCare:
        return this.tempPreventiveCareRequest;
      case BadgeFilterType.TreatmentPlans:
        return this.tempTreatmentPlansRequest;
      case BadgeFilterType.Appointments:
        return this.tempAppointmentRequest;
      case BadgeFilterType.otherToDo:
        return this.tempOtherToDoRequest;
      default:
        return this.tempAllPatientRequest;
    }
  }

  getGridRecordsByTab = (isCalledFromPatientGrid = false) => {
    this.loading = true;
    // Get the request object based on the active filter tab
    const activeRequest = this.getRequestByFilterType(this.activeFltrTab);
    // Get the temp request variable object based on the active filter tab
    const activeTempRequest = this.getTempRequestByFilterType(this.activeFltrTab);
    activeRequest.FilterCriteria.LocationId = this.selectedLocation?.LocationId;
    // Get the strategy object based on the active filter tab
    // Get All Badges API call
    this.activeTabService.getGridData(activeRequest, activeTempRequest, this.url, this.selectedLocation?.LocationId).then(res => {
        this.activeGridData = res;
        this.loading = false;
        this.totalCount = res?.TotalCount;
        this.updateTotalCount(res?.TotalCount);
        this.patientGridData(res, isCalledFromPatientGrid);
      }, () => {
        this.loading = false;
        this.toastrFactory.error(this.translate.instant('Failed to retrieve the list of {0}. Refresh the page to try again.', ['patients']));
    });
  }

  getLocations = (selecteLocation) => {
    this.loading = true;
    if (selecteLocation)
      this.selectedLocation = { NameLine1: selecteLocation?.name, LocationId: selecteLocation?.id }
      this.locationServices?.getPermittedLocations({ ActionId: 2610 }).$promise.then((res: PatientLocation) => {
      if (res) {
        this.getLocationSuccess(res?.Value)
      }
    }, () => {
      this.GetLocationFailed()
    });
  }

  getLocationSuccess = (res: PatientLocation[]) => {
    this.locationsDDL = []
    const location = this.activeTabService.groupLocations(res)
    this.locationsDDL = <GroupResult[]>groupBy(location, [{ field: 'LocationStatus' }]);
  }

  GetLocationFailed = () => {
    this.toastrFactory.error(this.translate.instant('Failed to retrieve locations', 'Error'));
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

  addAPerson = () => {
    window.location.href = '#/Patient/Register/';
  }

  addAFamily = () => {
    window.location.href = '#/Patient/FamilyRegister/';
  }

  selectedLocationChanged = (locationId: number) => {
    this.patientFilterService.expandedState = [];
    if (locationId != null) {
      this.getAllBadgesCount(locationId)
      // Collapse all filters
      this.activeTabService.collapseAll();
      // Update filters according to the selected location
      this.activeFltrTab = this.prevFiltrTab;
      this.selectedLocation.LocationId = locationId;
      this.setActiveTab(this.activeFltrTab);  
      this.allRequestLocationUpdate(this.selectedLocation.LocationId);
      this.setUnreadCommunicationFilter(false);
      this.resetSlideOutFilterCriteria();
      this.fetchAndLoadGridData();
    }
  }

  onBadgeChanged = (activeBadge: BadgeFilterType) => {
    this.loading = true;
    this.disablePrint = true;
    this.patientFilterService.isApplyFilters = false;
    this.activeFltrTab = activeBadge;
    this.patientFilterService.CurrentPage = 0;
    this.patientFilterService.expandedState = [];
    this.setActiveTab(this.activeFltrTab) 
    // Reset unread communication filter and additional filters
    this.setUnreadCommunicationFilter(false);
    this.additionalFilters = [];

    this.resetSlideOutFilterCriteria();
    this.fetchAndLoadGridData();

    // to hide slideout filter
    if (!this.hideMenu) {
      this.hideDiv();
    }
  }

  removeSlideOutFilter = (request, key:string) => {
    switch (key) {
      case SlideoutFilter.IsPatient:
      case SlideoutFilter.IsActive:
        request.FilterCriteria[key] = ['true'];
        break;
      case SlideoutFilter.BirthMonths:
        this.allPatientRequest.FilterCriteria[key] = ['-1'];
        break;
      case SlideoutFilter.AppointmentState:
        this.activeFltrTab == BadgeFilterType.Appointments && request?.FilterCriteria[key] ? this.allPatientRequest.FilterCriteria[key] = [SlideoutFilter.AppointmentStatusCancellation, SlideoutFilter.AppointmentStatusMissed] : delete request.FilterCriteria[key];
        break;
      case SlideoutFilter.IsScheduled:
        this.activeFltrTab == BadgeFilterType.Appointments && request?.FilterCriteria[key] ? this.appointmentRequest.FilterCriteria[key] = [SlideoutFilter.AppointmentStatusIsScheduled, SlideoutFilter.AppointmentStatusIsUnscheduled] : delete request.FilterCriteria[key];
        break;
      default:
        if (request?.FilterCriteria[key]) {
          delete request.FilterCriteria[key];
        }
        break;
    }
  };
  
  resetSlideOutFilterCriteria = () => {
    const slideoutFilterKey = this.patientFilterService?.slideoutFilterKey;
    const activeRequest = this.getRequestByFilterType(this.activeFltrTab);
    slideoutFilterKey?.forEach((key) => {
      if (activeRequest) {
        this.removeSlideOutFilter(activeRequest, key);
      }
    });

    if (this.patientSlideout) {
      this.patientSlideout?.expandCollapseFilter(false)
      this.patientSlideout?.collapseAllPanels()
    }
  };

  //On toggle change button will call this method to setFilter with unread communication and call fetchAndLoadGridData to get records
  filterUnreadCommunication = () => {
    this.setUnreadCommunicationFilter(!this.isUnreadCommunication);
    this.fetchAndLoadGridData();
  }

  //On Set the filter with unread communication and update the additional filters
  setUnreadCommunicationFilter = (isUnreadCommunication: boolean) => {
    this.isUnreadCommunication = isUnreadCommunication;
    const activeRequest = this.getRequestByFilterType(this.activeFltrTab);
    if (activeRequest && this.activeFltrTab != BadgeFilterType.otherToDo) {
      if (activeRequest.FilterCriteria) {
        activeRequest.FilterCriteria['HasUnreadCommunication'] = isUnreadCommunication;
      }
    }
    this.additionalFilters = this.isUnreadCommunication ?  this.activeTabService.updateFilter(SlideoutFilter.HasUnreadCommunication, this.isUnreadCommunication) : []; 
  }

  scrollToTop = () => {
    window.scroll({ top: 0 });
  }

  hideDiv = () => {
    // Toggle the state
    this.hideMenu = !this.hideMenu;
    if (this.hideMenu) {
      this.grdWidth = '100%';
      this.overflow = 'hidden';
      this.slideOutText = this.translate.instant('Show Filters');
    } else {
      this.grdWidth = '80%';
      this.overflow = 'scroll';
      this.slideOutText = this.translate.instant('Hide Filters');
    }
  }

  getTabList = (badgeIndex:number) => { 
    const tabList = this.activeTabService.getTabList(badgeIndex);
    this.tabList = [...tabList];
  }

  onClose = () => {
    this.hideDiv();
  }

  updateTotalCount = (totalCount: number) => {
    const getCountKey = {
      [BadgeFilterType.AllPatients]: 'allPatients',
      [BadgeFilterType.PreventiveCare]: 'preventiveCare',
      [BadgeFilterType.TreatmentPlans]: 'treatmentPlans',
      [BadgeFilterType.Appointments]: 'appointments',
      [BadgeFilterType.otherToDo]: 'otherToDo',
    }
    this.patientCount[getCountKey[this.activeFltrTab]] = totalCount;
    this.disablePrint = totalCount == 0 ? true : false;
    this.maxPage = Math.floor((isNaN(this.totalCount) ? 0 : this.totalCount) / this.pageSize);
  }
  
  resetFilterCriteria = () => {
    this.setUnreadCommunicationFilter(false);
    this.resetSlideOutFilterCriteria()
    this.fetchAndLoadGridData();
  };

  filterGrid = (filter) => {
    this.patientFilterService.CurrentPage = 0;
    const activeRequest = this.getRequestByFilterType(this.activeFltrTab);
    this.activeTabService.slideOutFilterChange(activeRequest, filter);
    this.getGridRecordsByTab()
  }

  openModal = (patientId:string, tabIdentifier: number, patientCommunication: boolean) => {
    const selectedPatientId = patientId;
    let patientPath = `#/Patient/${String(selectedPatientId)}/Communication/`;
    if (tabIdentifier == 5) {
      patientPath += `?withDrawerOpened=true&tabIdentifier=${String(tabIdentifier)}`;
    } else if (!patientCommunication) {
      patientPath += `?withDrawerOpened=true&tabIdentifier=${String(tabIdentifier)}&communicationType=-1`;
    }
    this.tabLauncher.launchNewTab(patientPath);
    this.$rootScope.$broadcast('nav:drawerChange', 5);
  }

  // Navigate to appointment's page
  navToAppointment = (appointmentId: string, accountId: string, classification: string) => {
    if (appointmentId !== '00000000-0000-0000-0000-000000000000') {
      // removed the code that routed to the old appointment edit refactor controller because you can't get into this block and that controller has been deprecated
      this.retrieveData(appointmentId, accountId, classification);
    }
  }

  retrieveData = (appointmentId: string, accountId: string, classification: string) => {
    const currentAppointmentId = appointmentId;
    if (currentAppointmentId != null) {
      // we need to alter the behavior for Block Appointments because we have not replaced the block modal startup
      if (classification != undefined && parseInt(classification) == 1) {
        // this means that this is a block and we need to proceed differently
        this.appointmentViewDataLoadingService
          .getBlockDataFromOutSideOfTheSchedule(currentAppointmentId)
          .then(
            (res) => {
              this.showAppointmentModal(res);
            },
            () => {
              this.toastrFactory.error(
                'Ran into a problem loading the appointment',
                'Error'
              );
            }
          );
      } else {
        if (this.showScheduleV2) {
            // The definition of the object can be seen here: 
            // https://dev.azure.com/pdco-fuse/Fuse/_git/WRK.PDCO.Fuse.Angular?path=/fuse/libs/schedule/domain-types/src/lib/appointment/appointment-edit-model.ts
            const appointmentData = {
                publicRecordId: appointmentId
            }
            const params = new URLSearchParams(appointmentData).toString()
            const path = `#/schedule/v2/appointment?${params}`
            window.location.href = this.sanitizer.sanitize(SecurityContext.URL, path);
            return;
          }

        const appointment = {
          AppointmentId: appointmentId,
        };

        this.appointmentViewDataLoadingService.getViewData(appointment, false).then(
          () => {
            this.appointmentViewVisibleService.changeAppointmentViewVisible(
              true,
              false
            );
          },
          () => {
            this.toastrFactory.error(
              'Ran into a problem loading the appointment',
              'Error'
            );
          }
        );
      }
    }
  };

  getAppointmentModalDataFailed = () => {
    this.toastrFactory.error('Failed to retrieve {0}. Please try again', [
      'the data necessary for editing an appointment',
    ]);
  };

  appointmentSaved = () => { };

  getAppointmentModalDataSuccess = (appointmentEditData) => {
    const appointmentEditModalData = appointmentEditData;
    this.scheduleModalFactory.ScheduleBlockModal(appointmentEditModalData, false).then(this.appointmentSaved);
  };

  showAppointmentModal = (result) => {
    const appointment = result?.appointment?.Appointment;
    appointment.Location = {
      LocationId: appointment?.LocationId,
    };

    this.newLocationsService.locations = result?.locations;
    this.newLocationsService.locations =
      this.locationsDisplayService.setLocationDisplayText(
        this.newLocationsService?.locations,
        appointment?.StartTime
      );
    // Need to make sure the ObjectState is None before going to edit the appointment.
    appointment.ObjectState = SaveStates.None;

    const locationId = appointment?.Location != null ? appointment?.Location?.LocationId : appointment?.Patient?.PreferredLocation;
    if (!locationId && !appointment?.Location) {
      appointment.Location = {
        LocationId: this.selectedLocation?.LocationId,
      };
    }

    this.modalDataFactory
      .GetBlockEditData(appointment, locationId)
      .then(
        this.getAppointmentModalDataSuccess,
        this.getAppointmentModalDataFailed
      );
  };

    createAppointment = (patientId: string) => {
        if (this.showScheduleV2) {
            // The definition of the object can be seen here: 
            // https://dev.azure.com/pdco-fuse/Fuse/_git/WRK.PDCO.Fuse.Angular?path=/fuse/libs/schedule/domain-types/src/lib/appointment/appointment-edit-model.ts
            const appointmentData = {
                patientId: patientId,
                locationId: this.selectedLocation.LocationId.toString()
            }
            const params = new URLSearchParams(appointmentData).toString()
            const path = `#/schedule/v2/appointment?${params}`
            window.location.href = this.sanitizer.sanitize(SecurityContext.URL, path);
            return;
        }
    const tmpAppt = {
      AppointmentId: null,
      AppointmentTypeId: null,
      Classification: 2,
      EndTime: null,
      PersonId: patientId,
      PlannedServices: [],
      ProposedDuration: 15,
      ProviderAppointments: [],
      ServiceCodes: [],
      StartTime: null,
      TreatmentRoomId: null,
      UserId: null,
      WasDragged: false,
      Location: { LocationId: this.selectedLocation.LocationId },
      LocationId: this.selectedLocation.LocationId,
      ObjectState: SaveStates.Add,
      Person: {},
    };

    this.appointmentViewDataLoadingService.getViewData(tmpAppt, false, null).then(
      () => {
        this.appointmentViewVisibleService.changeAppointmentViewVisible(true, false);
      },
      () => {
        this.toastrFactory.error(
          'Ran into a problem loading the appointment',
          'Error'
        );
      }
    );
  }

  navToPatientProfile = (personId : string) => {
    if (personId) {
      this.personFactory?.getById(personId).then(result => {
        let patientInfo = result?.Value;

        // Check if patientInfo is null
        if (patientInfo == null) {
          return;
        }

        this.patientValidationFactory.PatientSearchValidation(patientInfo).then(res => {
          patientInfo = res;
          if (!patientInfo.authorization.UserIsAuthorizedToAtLeastOnePatientLocation) {
            this.patientValidationFactory.LaunchPatientLocationErrorModal(patientInfo);
            return;
          }
          else {
            this.tabLauncher?.launchNewTab(`#/Patient/${String(personId)}/Overview`);
            return '';
          }
        });
      });
    }
  };

  showAppointmentTooltip = (data, field: string) => {
    if (!data || !field) {
      return '';
    }
    return this.activeTabService.showTooltip(data, field, this.activeFltrTab);   
  }

  //display gridData
  patientGridData = (response, isCalledFromPatientGrid = false) => {
    if (response && response?.Rows) {
      const resData = response?.Rows?.map(patient => {
        return this.activeTabService.transformPatientData(patient, false);
      });

      //If it is calling from patient grid while scrolling merge existing data
      if (isCalledFromPatientGrid) {
        this.patientData = [...this.patientData, ...resData];
      }
      else {
        this.patientData = resData;
      }
    } else {
      // when there is no data
      this.patientData = [];
    }
  }

  getClass = (status: string) => {
    return this.activeTabService.getTxClass(status);
  }

  displayTxPlans = (event, curpatientId) => {
    this.mouseX = event.pageX - 10;
    this.mouseY = event.pageY - 55;
    if (typeof this.transactionPlanHoverData[curpatientId] != 'undefined') {
      this.txPlanHover(this.transactionPlanHoverData[curpatientId]);
    } else {
      this.patientServices?.TreatmentPlanHover?.get({
        patientId: curpatientId,
      }).$promise.then((data) => {
        this.getTxPlanHoverSuccess(curpatientId, data);
      }, this.getTxPlanHoverFailure);
    }
  }

  txPlanHover = (data) => {
    this.txPlansHover = data;
    const toolTipHeight = this.txPlansHover.length * 20 + 20;
    if (toolTipHeight >= window.outerHeight - 100) {
      this.mouseY = this.mouseY - (toolTipHeight + 10);
    }

    this.isMouseUp = true;
    this.keepShow = true;
  }

  getTxPlanHoverSuccess = (patientId, res) => {
    const data = res.Value;
    this.transactionPlanHoverData[patientId] = data;
    this.txPlanHover(data);
  }

  getTxPlanHoverFailure = () => {
    this.toastrFactory.error('Failed to treatment plans', 'Error');
  }

  hideTxPlans = () => {
    this.keepShow = false;
    requestAnimationFrame(this.hideHoverTip);
  }

  hideHoverTip = () => {
    if (!this.keepShow) {
      this.isMouseUp = false;
    }
  };

  navToPatientTxPlan = (personId: string, treatmentPlanId: string) => {
    this.isMouseUp = false;
    if (personId != 'null') {
      const route = `#/Patient/${String(personId)}/Clinical?activeExpand=2&txPlanId=${String(treatmentPlanId)}`;
      this.tabLauncher.launchNewTab(route);
    }
    return '';
  };
  //#endregion

  applyTextValueFilter = (gridFilterText: { field: string, operator: string, value: string }) => {
    const activeRequest = this.getRequestByFilterType(this.activeFltrTab);
    if (gridFilterText.field == TextFilterType.Name) {
      activeRequest.FilterCriteria.PatientName = gridFilterText?.value ?? "";
    } else if (gridFilterText.field == TextFilterType.ResponsibleParty) {
      activeRequest.FilterCriteria.ResponsiblePartyName = gridFilterText?.value ?? "";
    } else if (gridFilterText.field == TextFilterType.Status) {
      this.OtherToDoRequest.FilterCriteria.IsComplete = gridFilterText?.value ?? "";
    }
    this.getGridRecordsByTab();
  }

  getRequestByFilterType(filterType: BadgeFilterType): AllPatient | PreventiveCare | TreatmentPlans | AppointmentRequest | OtherToDo {
    switch (filterType) {
      case BadgeFilterType.AllPatients:
        return this.allPatientRequest;
      case BadgeFilterType.PreventiveCare:
        return this.preventiveCareRequest;
      case BadgeFilterType.TreatmentPlans:
        return this.treatmentPlansRequest;
      case BadgeFilterType.Appointments:
        return this.appointmentRequest;
      case BadgeFilterType.otherToDo:
        return this.OtherToDoRequest;
      default:
        return null;
    }
  }

  applyDateRangeFilter = (response: { data: { startDate: Date, endDate: Date }, dateFieldType: string }) => {
    const dateFieldType = response?.dateFieldType;
    if (dateFieldType) {
      const activeRequest = this.getRequestByFilterType(this.activeFltrTab);
      this.activeTabService.dateRangeFilter(activeRequest, response.data, dateFieldType);
      this.getGridRecordsByTab();
    }
  }

  applyNumericRangeFilter = (data: { from: number, to: number }) => {
    if (data) {
      const activeRequest = this.getRequestByFilterType(this.activeFltrTab);
      this.activeTabService.numericRangeFilter(activeRequest, data);
      this.getGridRecordsByTab();
    }
  }

  applyAppointmentStatusFilter = (data: { selectedStatus: number, field: string }) => {
    if (!this.appointmentRequest?.FilterCriteria) {
      this.appointmentRequest = new AppointmentRequest();
      this.appointmentRequest.FilterCriteria = new AppointmentGridFilter();
    }
    this.appointmentRequest.FilterCriteria.AppointmentStatus = data?.selectedStatus?.toString();
    this.getGridRecordsByTab();
  }

  exportCSV = () => {
    if (this.activeGridData?.FilterCriteria?.LocationId)
      this.activeGridData.FilterCriteria.LocationId = this.selectedLocation?.LocationId;
      const badgeMapping = {
        [BadgeFilterType.Appointments]: { fileName: BadgeCSVFileName.Appointments, badgeType: PatientBadgeTabType.Appointments },
        [BadgeFilterType.AllPatients]: { fileName: BadgeCSVFileName.AllPatients, badgeType: PatientBadgeTabType.AllPatients },
        [BadgeFilterType.otherToDo]: { fileName: BadgeCSVFileName.OtherToDo, badgeType: PatientBadgeTabType.OtherToDo },
        [BadgeFilterType.TreatmentPlans]: { fileName: BadgeCSVFileName.TreatmentPlans, badgeType: PatientBadgeTabType.TreatmentPlans },
        [BadgeFilterType.PreventiveCare]: { fileName: BadgeCSVFileName.PreventiveCare, badgeType: PatientBadgeTabType.PreventiveCare }
      };
      if (badgeMapping[this.activeFltrTab]) {
        this.csvFileName = badgeMapping[this.activeFltrTab].fileName;
        this.export(badgeMapping[this.activeFltrTab].badgeType);
    }
  }

  export = (tab: string) => {
    this.dialog = this.dialogService?.open({
      appendTo: this.containerRef, content: PatientExportModalComponent,
      width: 'auto',
      height: 'auto',
    });
    document.body.style.overflow = 'hidden';
    this.dialogSubscription = this.dialog?.result?.subscribe((response: PatientContactInfo) => {
      if (response?.PatientMailing != null) {
        if (this.activeTabService.hasContactInfo(response)) {
          const params = { grid: this.activeGridData, contactInfo: response }
          this.patientService.exportToCSVFileWithContactInfo(params, tab, this.url).then((res: SoarResponse<ExportCSV>) => {
            this.exportSuccess(res);
          }, () => {
            this.exportFailure();
          });
        } else {
          this.patientService.exportToCSVFile(this.activeGridData, tab, this.url).then((res: SoarResponse<ExportCSV>) => {
            this.exportSuccess(res);
          }, () => {
            this.exportFailure();
          });
        }
      }
    }, () => {
      this.translate.instant('Unexpected failure in patient landing export modal');
    });
  }

  exportSuccess = (result: SoarResponse<ExportCSV>) => {
    let csv = '';
    result?.Value?.CsvRows?.forEach((row: string) => {
      csv += row;
    });
    this.csvHelper.downloadCsvFile(csv, this.csvFileName);
  }

  exportFailure = () => {
    this.toastrFactory.error(
      this.translate.instant('{0} failed to export.', [
        'Patient management',
      ])
    );
  }

  printMailinglabels = () => {
    if (!this.disableMailing && !this.disablePrint) {
      this.dialog = this.dialogService?.open({
        appendTo: this.mailingContainerRef,
        content: SendMailingModalComponent,
        width: '44%',
        height: '89%'
      });
      this.dialog.content.instance.activeFltrTab = this.activeFltrTab;
      this.dialog.content.instance.activeGridDataCount = this.patientCount;
      this.dialogSubscription = this.dialog?.result?.subscribe((response: PatientMailingInfo) => {
        this.activeTabService.setPrintMailingLabel(response, this.activeGridData)
      });
    }
  }

  printGrid = () => {
    if (!this.disablePrint) {
      switch (this.activeFltrTab) {
        case BadgeFilterType.AllPatients:
          this.gridOperationService.fetchDataAndSetLayout(this.patientLandingGridService.getAllPatients.bind(this.patientLandingGridService), this.allPatientRequest, this.url, GridTabList.AllPatients, this.commonColumns, this.commonAttributesToDisplay, this.selectedLocation);
          break;
        case BadgeFilterType.PreventiveCare:
          this.gridOperationService.fetchDataAndSetLayout(this.patientLandingGridService.getAllPreventiveCare.bind(this.patientLandingGridService), this.preventiveCareRequest, this.url, GridTabList.PreventiveCare, this.preventiveColumns, this.commonAttributesToDisplay, this.selectedLocation);
          break;
        case BadgeFilterType.TreatmentPlans:
          this.gridOperationService.fetchDataAndSetLayout(this.patientLandingGridService.getAllTreatmentPlans.bind(this.patientLandingGridService), this.treatmentPlansRequest, this.url, GridTabList.TreatmentPlans, this.treatmentPlansColumns, this.commonAttributesToDisplay, this.selectedLocation);
          break;
        case BadgeFilterType.Appointments:
          this.gridOperationService.fetchDataAndSetLayout(this.patientLandingGridService.getAllAppointments.bind(this.patientLandingGridService), this.appointmentRequest, this.url, GridTabList.Appointments, this.appointmentColumns, this.apptAttributesToDisplay, this.selectedLocation);
          break;
        case BadgeFilterType.otherToDo:
          this.gridOperationService.fetchDataAndSetLayout(this.patientLandingGridService.getAllToDo.bind(this.patientLandingGridService), this.OtherToDoRequest, this.url, GridTabList.OtherToDo, this.otherToDoColumns, this.otherAttributesToDisplay, this.selectedLocation);
          break;
        default:
          break;
      }
      this.setNormalLayout();
    }
  }

  setNormalLayout = (): void => {
    this.allPatientRequest.PageCount = 50;
    this.preventiveCareRequest.PageCount = 50;
    this.treatmentPlansRequest.PageCount = 50;
    this.appointmentRequest.PageCount = 50;
    this.OtherToDoRequest.PageCount = 50;
    this.allPatientRequest.CurrentPage = 0;
    this.preventiveCareRequest.CurrentPage = 0;
    this.treatmentPlansRequest.CurrentPage = 0;
    this.appointmentRequest.CurrentPage = 0;
    this.OtherToDoRequest.CurrentPage = 0;
  }
  //#endregion "Print" ends here

  //#region Handle Patient Grid Scroll to get new records if we scroll to bottom
  @HostListener('window:scroll', ['$event'])
  onScroll(event: Event): void {
    //Check if the user has scrolled to the bottom of the page
    //Only call next page if total records is greater than current records
    if (this.activeTabService.isScrolledToBottom(event?.target) && !this.loading && this.totalCount > this.patientData?.length && this.patientFilterService.CurrentPage < this.maxPage) {
      this.patientFilterService.CurrentPage++;
      this.getGridRecordsByTab(true);
    }
  }
  //#endregion

  //#region Sorting Grid Data
  getSortedData = (sortData: ({ sortField: string, sortDirection: number })) => {
    //sort the data based on active Badge and sort field
    const activeRequest = this.getRequestByFilterType(this.activeFltrTab);
    activeRequest.SortCriteria = this.activeTabService.sortGridData(sortData)
    this.getGridRecordsByTab();
  }
  //#endregion

  ngOnDestroy(): void {
    // unregister from observer for the appointment visibility        
    this.appointmentViewVisibleService.clearObserver(this.onAppointmentViewVisibleChange);
    this.appointmentViewVisibleService.setAppointmentViewVisible(false);
    this.appointmentViewVisibleService.setSecondaryAppointmentViewVisible(false);
    this.dialogSubscription?.unsubscribe();
  }
}
