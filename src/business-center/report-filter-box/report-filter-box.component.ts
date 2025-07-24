import {
    Component,
    OnInit,
    Inject,
    Input,
    EventEmitter,
    Output,
    AfterViewInit,
    ViewChild,
    ViewChildren,
    QueryList,
    OnDestroy
} from '@angular/core';
import { isNullOrUndefined, isNull } from 'util';
import * as moment from 'moment';
import { ReportPatientFilterComponent } from '../report-patient-filter/report-patient-filter.component';
import { ReportRadioFilterComponent } from '../report-radio-filter/report-radio-filter.component';
import { ReportCheckboxFilterComponent } from '../report-checkbox-filter/report-checkbox-filter.component';
import { ReportDateFilterComponent } from '../report-date-filter/report-date-filter.component';
import { ReportNumericFilterComponent } from '../report-numeric-filter/report-numeric-filter.component';
import { SearchFilterComponent } from '../search-filter/search-filter.component';
import { PatientReferralsFilterComponent } from '../patient-referrals-filter/patient-referrals-filter.component';
import { Subscription } from 'rxjs';
import cloneDeep from 'lodash/cloneDeep';
import { MasterAlertService } from 'src/@shared/providers/master-alert.service';
import { PatientAdditionalIdentifierService } from '../practice-settings/patient-profile/patient-additional-identifiers/patient-additional-identifier.service';
import { SoarResponse } from 'src/@core/models/core/soar-response';
import { PatientAdditionalIdentifiers } from '../practice-settings/patient-profile/patient-additional-identifiers/patient-additional-identifier';
import { GroupType } from '../practice-settings/patient-profile/group-types/group-type';
import { GroupTypeService } from 'src/@shared/providers/group-type.service';
import { DiscountTypesService } from 'src/@shared/providers/discount-types.service';
import { DiscountType } from '../practice-settings/billing/discount-types/discount-type';
import { PaymentTypesService } from 'src/@shared/providers/payment-types.service';
import { AdjustmentTypesService } from 'src/@shared/providers/adjustment-types.service';
import { PatientReferralsBetaFilterComponent } from '../patient-referrals-beta-filter/patient-referrals-beta-filter.component';
import { ReportServiceCodeFilterComponent } from '../report-service-code-filter/report-service-code-filter.component';
import { FeatureFlagService } from 'src/featureflag/featureflag.service';
import { FuseFlag } from 'src/@core/feature-flags';
import { TaxableServices } from 'src/business-center/service-code/service-code-model';
import { GetProviderReferralAffiliatesRequest } from '../practice-settings/patient-profile/referral-type/referral-type.model';
import { ReferralManagementHttpService } from 'src/@core/http-services/referral-management-http.service';
import { ServiceTypesService } from '../practice-settings/service-types/service-types.service';
declare let angular: any;
declare let _: any;

export enum IncludeAllPropName {
    MasterPatientGroupIds = "IncludeAllPatientGroups",
    LocationIds = "IncludeAllLocations",
    MasterAlertIds = "IncludeAllMasterAlerts",
    PaymentTypeIds = "IncludeAllPaymentTypes",
}

export enum IncludeNonePropName {
    MasterPatientGroupIds = "IncludePatientsWithoutAssociatedMasterPatientGroup",
    MasterAlertIds = "UseCustomFlags"
}

@Component({
    selector: "report-filter-box",
    templateUrl: './report-filter-box.component.html',
    styleUrls: ['./report-filter-box.component.scss']
})
export class ReportFilterBoxComponent implements OnInit, OnDestroy, AfterViewInit {
    originalFilterModels: any;
    practiceSettings: any;
    filteredActivityTypes: any;
    localizedActivityTypes: any;
    taxableServices: TaxableServices[];
    constructor(
        @Inject('toastrFactory') private toastrFactory,
        @Inject('localize') private localize,
        @Inject('ReportsFactory') private reportsFactory,
        @Inject('AmfaInfo') private amfaInfo,
        @Inject('LocationServices') private locationServices,
        @Inject('TimeZoneFactory') private timeZoneFactory,
        @Inject('patSecurityService') private patSecurityService,
        @Inject('UsersFactory') private usersFactory,
        @Inject('BusinessCenterServices') private businessCenterServices,
        @Inject('referenceDataService') private referenceDataService,
        private groupTypeService: GroupTypeService,
        private adjustmentTypesService: AdjustmentTypesService,
        @Inject('AppointmentTypesFactory') private appointmentTypesFactory,
        @Inject('StaticData') private staticData,
        @Inject('MedicalHistoryAlertsFactory') private medicalHistoryAlertsFactory,
        @Inject('UserServices') private userServices,
        @Inject('$q') private $q,
        @Inject('ReportsService') private reportsService,
        @Inject('$scope') private scope,
        private masterAlertService: MasterAlertService,
        private patientAdditionalIdentifierService: PatientAdditionalIdentifierService,
        private discountTypesService: DiscountTypesService,
        private paymentTypesService: PaymentTypesService,
        private featureFlagService: FeatureFlagService,
        private referralManagementHttpService: ReferralManagementHttpService,
        private serviceTypesService: ServiceTypesService
    ) {
    }

    showNewReferralFilter: boolean = false;
    classExpandCollapse = 'btn soar-link icon-button font-14 expand-all';
    @Input() allData: any;
    @Input() filterModels: any;
    @Output() selectedChange = new EventEmitter<any>();
    @Output() getReport = new EventEmitter<boolean>();
    @Output() userFilters = new EventEmitter<boolean>();
    @Output() hideDiv = new EventEmitter<any>();
    @Input() afterFilterInit: any;
    @Output() afterInit = new EventEmitter<any>();
    @Output() objChanged = new EventEmitter<any>();
    @ViewChild(ReportPatientFilterComponent, { static: false })
    private patientComponent: ReportPatientFilterComponent;

    @ViewChild(ReportNumericFilterComponent, { static: false })
    private numaricComponent: ReportNumericFilterComponent;
    @ViewChild(SearchFilterComponent, { static: false })
    private searchComponent: SearchFilterComponent;

    @ViewChild(ReportServiceCodeFilterComponent, { static: false })
    private reportServiceCodeFilterComponent: ReportServiceCodeFilterComponent;

    @ViewChild(PatientReferralsFilterComponent, { static: false })
    private PatientRefComponent: PatientReferralsFilterComponent;
    @ViewChild(PatientReferralsBetaFilterComponent, { static: false })
    private PatientRefBetaComponent: PatientReferralsBetaFilterComponent;
    subscriptions: Array<Subscription> = new Array<Subscription>();

    @ViewChildren(ReportCheckboxFilterComponent) checkComponentChildren: QueryList<ReportCheckboxFilterComponent>;
    @ViewChildren(ReportRadioFilterComponent) radioComponentChildren: QueryList<ReportRadioFilterComponent>;
    @ViewChildren(ReportDateFilterComponent) dateComponentChildren: QueryList<ReportDateFilterComponent>;
    sortedLocations = [];
    locationResult = [];
    sortedDistributedLocations = [];
    distributedLocationResult = [];
    isValidDates = true;
    isValid = true;
    usersLoaded = false;
    recallMethod = true;
    parentData;
    refferedPatientsOptions;
    reportCategoryId = parseInt(this.reportsFactory.GetReportCategoryId());
    LocationList: any;
    emptyGuid = '00000000-0000-0000-0000-000000000000';
    GuidOne = '00000000-0000-0000-0000-000000000001';
    filtersLoading = false;
    // initialize basic variables that are used for filtering
    defaultFilterCount: number;
    showPatientStatus: boolean;
    showTreatmentPlanStatus: boolean;
    showServiceCodeStatus: boolean;
    showMultipleLocation: boolean;
    showSingleLocation: boolean;
    showDistributedLocation: boolean;
    showProviders: boolean;
    showUsers: boolean;
    showDateRange: boolean;
    showOrigDateRange: boolean;
    showAdditionalIdentifiers: boolean;
    showCarriers: boolean;
    showPayerId: boolean;
    showFeeSchedules: boolean;
    showReferralSources: boolean;
    showDisplayOptions: boolean;
    showTransactionTypes: boolean;
    showTaxableServiceTypes: boolean;
    showServiceTypes: boolean;
    showPatientGroupTypes: boolean;
    showServiceCode: boolean;
    showServiceCodes: boolean;
    showMonths: boolean;
    showImpactions: boolean;
    showInsurance: boolean;
    showAppointmentTypes: boolean;
    showViewDeletedTransaction: boolean;
    showViewTransactionsBy: boolean;
    showViewTransactionsByOrder: boolean;
    showServiceDate: boolean;
    showDiscountTypes: boolean;
    showActivityTypes: boolean;
    showActivityActions: boolean;
    showActivityAreas: boolean;
    showPatients: boolean;
    showCollectionDateRange: boolean;
    showProductionDateRange: boolean;
    showMasterPatientAlerts: boolean;
    showMedicalHistoryAlerts: boolean;
    showTreatmentPlan: boolean;
    showAging: boolean;
    showAgingOption: boolean;
    showClaimTypes: boolean;
    showClaimStatus: boolean;
    showReportView: boolean;
    ShowInsuranceAdjustmentMode: boolean;
    textExpandCollapse: string;
    getUsersCompletePromise;
    nameString;
    userDefinedPatinets;
    disableButtons: boolean;
    // new initializations in angular 8
    LocationsName: string;
    DistributedLocationsName: string;
    appliedFiltersCount: number;
    isVisibleShowMorebuttonLocation: boolean;
    PatientStatusName;
    TreatmentPlanStatusName;
    ServiceCodeStatusName;
    ProvidersName;
    getLocationsCompletePromise;
    getAdjustmentPromise;
    defaultProviderData = [];
    partialProviders;
    users: any;
    defaultUserData;
    UsersName;
    allLocations;
    originalUserData;
    partialUsers;
    CarrierName;
    PayerIdName;
    StartDateName;
    OrigStartDateName;
    AdditionalIdentifiersName;
    FeeSchedulesName;
    DisplayOptionsName;
    ReferralSourceIdName;
    isManagedCareOption;
    TransactionTypeName;
    ServiceTypeName;
    TaxableServiceTypeName;
    PatientGroupTypeName;
    ServiceCodeName;
    NegativeAdjustmentTypeName;
    showNegativeAdjustmentTypes;
    PositiveAdjustmentTypeName;
    InsurancePaymentTypeName;
    ReferralAffiliateName;
    PaymentTypeName;
    showPositiveAdjustmentTypes;
    showInsurancePaymentType;
    showReferralAffiliate;
    showPaymentType;
    MonthName;
    includeAll;
    ImpactionName;
    InsuranceName;
    AppointmentTypeName;
    ViewTransactionsByName;
    ViewDeletedTransactionName;
    ServiceDateName;
    DiscountTypeName;
    ActivityTypeName;
    ActivityActionName;
    ActivityAreaName;
    PatientIdName;
    CollectionStartDateName;
    ProductionStartDateName;
    MasterPatientAlertName;
    MedicalHistoryAlertName;
    TreatmentPlanName;
    AgingName;
    AgingOptionName;
    ClaimTypesName;
    ClaimStatusName;
    ReportViewName;
    InsuranceAdjustmentModeName;
    expandCollapse;
    childFlag = false;
    buttonDisabled = true;
    fromType;
    userDefinedFilter;
    callChildren = false;
    defaultLocString;
    defaultDistLocString;
    providerCallFlag = false;
    IsCommunicationCenterEnabled = false;
    angingOption;
    userContext;
    practieceAdmins;
    vtbOrderReports = [
        { reportId: 22 },
        { reportId: 60 },
        { reportId: 42 },
        { reportId: 47 },
        { reportId: 19 },
        { reportId: 53 },
        { reportId: 26 },
        { reportId: 23 },
        { reportId: 21 },
        { reportId: 50 },
        { reportId: 37 },
        { reportId: 1 },
        { reportId: 18 },
        { reportId: 30 },
        { reportId: 16 },
        { reportId: 39 },
        { reportId: 43 },
        { reportId: 64 },
        { reportId: 44 },
        { reportId: 28 },
        { reportId: 29 },
        { reportId: 20 },
        { reportId: 27 },
        { reportId: 71 },
        { reportId: 14 },
        { reportId: 113 },
        { reportId: 123 }
    ];

    patientStatusId = {
        "All": this.scope.isNewReportingAPI ? 0 : 1,
        "Active": this.scope.isNewReportingAPI ? 1 : 2,
        "Inactive": this.scope.isNewReportingAPI ? 2 : 3
    }

    defaultLoc: any = {};
    defaultDistributedLoc: any = {};
    startDateFromDashboard: Date;
    endDateFromDashboard: Date;
    asyncBlobId: string = '';
    callParent() {
        this.hideDiv.emit();
    }
    initializeFilterElements() {
        this.refferedPatientsOptions = this.parentData.patientReferralTypesData;
        const LocationData = this.reportsFactory.GetReportContext();
        if (LocationData !== null) {
            this.LocationList = LocationData.PresetFilterDto.LocationIds;
        } else {
            this.LocationList = null;
        }
        if (sessionStorage.getItem('fromDashboard') == 'true' && this.fromType == 'Date Range') {
            this.startDateFromDashboard = LocationData.PresetFilterDto.StartDate;
            this.endDateFromDashboard = LocationData.PresetFilterDto.EndDate;
        }
        this.nameString = '';
        this.defaultFilterCount = 0;
        this.appliedFiltersCount = this.defaultFilterCount;
        this.showPatientStatus = false;
        this.showTreatmentPlanStatus = false;
        this.showServiceCodeStatus = false;
        this.showMultipleLocation = false;
        this.showSingleLocation = false;
        this.showProviders = false;
        this.showUsers = false;
        this.showDateRange = false;
        this.showOrigDateRange = false;
        this.showAdditionalIdentifiers = false;
        this.showCarriers = false;
        this.showPayerId = false;
        this.showFeeSchedules = false;
        this.showReferralSources = false;
        this.showDisplayOptions = false;
        this.showTransactionTypes = false;
        this.showServiceTypes = false;
        this.showPatientGroupTypes = false;
        this.showServiceCode = false;
        this.showServiceCodes = false;
        this.showMonths = false;
        this.showImpactions = false;
        this.showInsurance = false;
        this.showAppointmentTypes = false;
        this.showViewTransactionsBy = false;
        this.showViewTransactionsByOrder = false;
        this.showServiceDate = false;
        this.showDiscountTypes = false;
        this.showActivityTypes = false;
        this.showActivityActions = false;
        this.showActivityAreas = false;
        this.showPatients = false;
        this.showCollectionDateRange = false;
        this.showProductionDateRange = false;
        this.showMasterPatientAlerts = false;
        this.showMedicalHistoryAlerts = false;
        this.showTreatmentPlan = false;
        this.showAging = false;
        this.showAgingOption = false;
        this.showClaimTypes = false;
        this.showClaimStatus = false;
        this.showReportView = false;
        this.showViewDeletedTransaction = false;
        this.showPositiveAdjustmentTypes = false;
        this.showInsurancePaymentType = false;
        this.showReferralAffiliate = false;
        this.showPaymentType = false;
        this.textExpandCollapse = this.localize.getLocalizedString('Expand All');
        this.providerCallFlag = false;
        this.showTaxableServiceTypes = false;
        this.ShowInsuranceAdjustmentMode = false;
    }

    convertToCamelCase(inputString: string): string {
        if (!inputString) {
            return inputString;
        }

        return inputString.charAt(0).toLowerCase() + inputString.slice(1);
    }

    // initialize filter classes
    initializeFilterClasses() {
        this.classExpandCollapse = 'btn soar-link icon-button font-14 expand-all';
    } setupFilters() {
        let containsLocation = false;
        if (this.parentData.requestBodyProperties) {
            this.getLocationsCompletePromise = this.$q.defer();
            for (const i in this.parentData.requestBodyProperties) {
                if (
                    this.parentData.requestBodyProperties[i].DataType ===
                    'Location[]' ||
                    this.parentData.requestBodyProperties[i].DataType ===
                    'Location'
                ) {
                    containsLocation = true;
                    break;
                }
            }
            for (const prop of this.parentData.requestBodyProperties) {
                switch (prop.DataType) {
                    case 'IncludeAll':
                        this.filterModels[prop.Name] = this.initializeFilterModel(
                            this.localize.getLocalizedString(prop.Name),
                            this.localize.getLocalizedString(this.convertToCamelCase(prop.Name)),
                            false,
                            null
                        );
                        break;
                    case 'Location[]':
                    case 'Location':
                        this.LocationsName = prop.Name;
                        this.filterModels[prop.Name] = this.initializeFilterModel(
                            this.localize.getLocalizedString('Locations'),
                            this.localize.getLocalizedString('locations'),
                            false,
                            null
                        );
                        this.showSingleLocation = prop.DataType === 'Location';
                        this.showMultipleLocation = prop.DataType === 'Location[]';
                        this.initializeLocationElements();
                        this.getLocations(null);
                        break;
                    case 'DistributedLocation[]':
                        this.DistributedLocationsName = prop.Name;
                        this.filterModels[prop.Name] = this.initializeFilterModel(
                            this.localize.getLocalizedString('Distributed Location'),
                            this.localize.getLocalizedString('distributedLocation'),
                            false,
                            null
                        );
                        this.showDistributedLocation = prop.DataType === 'DistributedLocation[]';
                        this.initializeCommonLocationElements("DistributedLocation");
                        this.getLocations("DistributedLocation");
                        break;
                    case 'PatientStatus[]':
                        this.PatientStatusName = prop.Name;
                        this.filterModels[prop.Name] = this.initializeFilterModel(
                            this.localize.getLocalizedString('Patient Status'),
                            this.localize.getLocalizedString('patientStatus'),
                            false,
                            null
                        );
                        this.setDefaultPatientStatusArray();
                        if (this.userDefinedFilter) {
                            this.defaultFilterCount += this.userDefinedFilter.PatientStatus ? this.userDefinedFilter.PatientStatus.length
                                : this.userDefinedFilter.PatientType.length;
                        } else {
                            this.defaultFilterCount =
                                this.parentData.reportId ===
                                    this.parentData.reportIds.PatientsSeenReportId ||
                                    this.parentData.reportId ===
                                    this.parentData.reportIds
                                        .NewPatientsByComprehensiveExamReportId ||
                                    this.parentData.reportId ===
                                    this.parentData.reportIds
                                        .PotentialDuplicatePatientsReportId
                                    ? this.defaultFilterCount + 1
                                    : this.defaultFilterCount + 3;
                        }
                        this.showPatientStatus = true;
                        break;
                    case 'TreatmentPlanStatus[]':
                        this.TreatmentPlanStatusName = prop.Name;
                        this.initializeTreatmentPlanStatusElements();
                        this.showTreatmentPlanStatus = true;
                        break;
                    case 'ServiceCodeStatus[]':
                        this.ServiceCodeStatusName = prop.Name;
                        this.initializeServiceCodeStatusElements();
                        this.showServiceCodeStatus = true;
                        break;
                    case 'ProviderUserId[]':
                        this.ProvidersName = prop.Name;
                        this.initializeProvidersElements();
                        this.showProviders = true;
                        // timing fix for bug;
                        if (containsLocation && !this.usersLoaded) {
                            this.getUsersCompletePromise = this.$q.defer();
                            this.$q.when(this.getLocationsCompletePromise.promise).then(() => {
                                this.getUsers(true, this.filterModels[this.ProvidersName], 'Providers');
                            });
                        } else {
                            this.processUsers(
                                this.users.filter(this.checkIfProvider),
                                this.filterModels[this.ProvidersName],
                                'Providers'
                            );
                        }
                        if (this.userDefinedFilter && this.userDefinedFilter.ProviderTypeIds) {
                            this.defaultFilterCount += this.userDefinedFilter.ProviderTypeIds.length;
                        } else {
                            this.defaultFilterCount += 5; // Provider type default number
                        }

                        break;
                    case 'UserId[]':
                        this.UsersName = prop.Name;
                        this.initializeUsersElements();
                        this.showUsers = true;
                        if (containsLocation && !this.usersLoaded) {
                            this.getUsersCompletePromise = this.$q.defer();
                            this.$q.when(this.getLocationsCompletePromise.promise).then(() => {
                                this.getUsers(false, this.filterModels[this.UsersName], 'Team Members');
                            });
                        } else {
                            this.processUsers(
                                this.users,
                                this.filterModels[this.UsersName],
                                'Team Members'
                            );
                        }
                        break;
                    case 'Carrier[]':
                        this.CarrierName = prop.Name;
                        this.showCarriers = true;
                        this.filterModels[prop.Name] = this.initializeFilterModel(
                            this.localize.getLocalizedString('Carriers'),
                            this.localize.getLocalizedString('carriers'),
                            false,
                            null
                        );
                        this.setDefaultCheckboxFilterValues(
                            this.filterModels[prop.Name],
                            true
                        );
                        this.getCarriers();
                        break;
                    case 'PayerId':
                        this.PayerIdName = prop.Name;
                        this.initializePayerIdElements();
                        this.showPayerId = true;
                        break;
                    case 'Date':
                        this.StartDateName = 'StartDate';
                        let DateVal;
                        if (this.fromType === 'fromReports' || this.fromType === 'fromInsurance') {
                            if (this.userDefinedFilter && this.userDefinedFilter.dateType) {
                                DateVal = this.userDefinedFilter.dateType;
                            } else {
                                if (this.parentData.reportId === 24 || this.parentData.reportId === 126 || this.parentData.reportId === 13) {
                                    DateVal = 1;
                                } else {
                                    DateVal = 2;
                                }
                            }
                        } else {
                            if (this.fromType === 'YTD') {
                                DateVal = 3;
                            } else if (this.fromType === 'MTD') {
                                DateVal = 2;
                            } else if (this.fromType === 'Today') {
                                DateVal = 1;
                            } else {
                                // Last Year  Last Month  Date Rangee
                                DateVal = 4;
                            }
                        }
                        this.filterModels[this.StartDateName] = {
                            Name: this.localize.getLocalizedString('Date Range'),
                            FilterId: 'DateRange',
                            ReportId: this.parentData.reportId,
                            ReportCategory: this.reportCategoryId,
                            TitleDateRangeString: '',
                            StartDateName: this.StartDateName,
                            EndDateName: 'EndDate',
                            dateType: DateVal,
                            defaultDateType: DateVal,
                            UserStartDate: this.userDefinedFilter ? this.userDefinedFilter.StartDate : (this.startDateFromDashboard ? this.startDateFromDashboard : ''),
                            UserEndDate: this.userDefinedFilter ? this.userDefinedFilter.EndDate : (this.endDateFromDashboard ? this.endDateFromDashboard : '')
                        };
                        this.AddDateFilterToList(this.filterModels[this.StartDateName]);
                        this.showDateRange = true;
                        break;
                    case 'OrigDate':
                        this.OrigStartDateName = 'OrigStartDate';
                        let ignoreVal;
                        let ignoreType;
                        if (this.userDefinedFilter && this.userDefinedFilter.Ignore) {
                            ignoreVal = this.userDefinedFilter.Ignore;
                            if (this.userDefinedFilter.Ignore === '1') {
                                ignoreType = true;
                            } else {
                                ignoreType = false;
                            }
                        } else {
                            ignoreVal = '1';
                            ignoreType = true;
                        }
                        this.filterModels[this.OrigStartDateName] = {
                            Name: this.localize.getLocalizedString('Original Transaction Date Range'),
                            FilterId: 'OrigDateRange',
                            ReportId: this.parentData.reportId,
                            ReportCategory: this.reportCategoryId,
                            TitleDateRangeString: '',
                            StartDateName: this.OrigStartDateName,
                            EndDateName: 'OrigEndDate',
                            Ignore: ignoreVal,
                            defaultType: ignoreVal,
                            ignoreType: ignoreType,
                            UserStartDate: this.userDefinedFilter ? this.userDefinedFilter.OrigStartDate : '',
                            UserEndDate: this.userDefinedFilter ? this.userDefinedFilter.OrigEndDate : ''
                        };
                        this.AddDateFilterToList(this.filterModels[this.OrigStartDateName]);
                        this.showOrigDateRange = true;
                        break;
                    case 'Ignore':
                        this.defaultFilterCount += 1;
                        break;
                    case 'AdditionalIdentifier[]':
                        this.AdditionalIdentifiersName = prop.Name;
                        this.filterModels[prop.Name] = this.initializeFilterModel(
                            this.localize.getLocalizedString('Additional Identifiers'),
                            this.localize.getLocalizedString('additionalIdentifiers'),
                            false,
                            null
                        );
                        this.setDefaultCheckboxFilterValues(
                            this.filterModels[prop.Name],
                            false
                        );
                        this.showAdditionalIdentifiers = true;
                        this.getAdditionalIdenfiers();
                        break;
                    case 'FeeSchedule[]':
                        this.FeeSchedulesName = prop.Name;
                        this.filterModels[prop.Name] = this.initializeFilterModel(
                            this.localize.getLocalizedString('Fee Schedules'),
                            this.localize.getLocalizedString('feeSchedules'),
                            false,
                            null
                        );
                        this.setDefaultCheckboxFilterValues(
                            this.filterModels[prop.Name],
                            true
                        );
                        this.showFeeSchedules = true;
                        this.getFeeSchedules();
                        break;
                    case 'DisplayOptions[]':
                        this.DisplayOptionsName = prop.Name;
                        this.isManagedCareOption = (
                            this.parentData.reportId !==
                            this.parentData.reportIds.PatientsByFeeScheduleReportId) && (this.parentData.reportId !== this.parentData.reportIds.PatientsByFeeScheduleBetaReportId);
                        this.initializeDisplayOptionsElements();
                        this.showDisplayOptions = true;
                        break;
                    case 'ReferralSourceId[]':
                        this.ReferralSourceIdName = prop.Name;
                        this.setDefaultReferralSources();
                        this.filterModels[this.ReferralSourceIdName].ReferralSourceIdName =
                            prop.Name;
                        this.showReferralSources = true;
                        if (this.showNewReferralFilter === false) {
                            if (this.userDefinedFilter && this.userDefinedFilter.selectedReferralType
                                && this.userDefinedFilter.selectedReferralType.name !== 'All Sources') {
                                if (this.userDefinedFilter.selectedReferralType.name === 'Other' || this.userDefinedFilter.selectedReferralType.name === 'External Sources') {
                                    this.defaultFilterCount += this.userDefinedFilter.ReferralSourceIds.length;
                                } else {
                                    this.defaultFilterCount += this.userDefinedFilter.ReferringPatientIds.length;
                                }
                            } else {
                                this.defaultFilterCount += 1;
                            }
                        } else {
                            if (this.userDefinedFilter && this.userDefinedFilter.selectedReferralType
                                && !this.userDefinedFilter.selectedReferralType.includes(null)) {
                                if (this.userDefinedFilter.selectedReferralType.includes(1)) {
                                    this.defaultFilterCount += this.userDefinedFilter.ReferralSourceIds.length;
                                } else {
                                    this.defaultFilterCount += this.userDefinedFilter.ReferringPatientIds.length;
                                }
                            } else {
                                this.defaultFilterCount += 1;
                            }
                        }

                        break;
                    case 'ReferringPatientId[]': // This filter property is linked to Referral SourceId and must be listed after in property list   
                        this.filterModels[this.ReferralSourceIdName].ReferralPatientIdName =
                            prop.Name; // Need the property name to correctly set up DTO
                        break;
                    case 'ExternalProviderId[]':
                        this.filterModels[this.ReferralSourceIdName].ExternalProviderIdName =
                            prop.Name;
                        break;
                    case 'TransactionTypeId[]':
                        this.TransactionTypeName = prop.Name;
                        this.filterModels[prop.Name] = this.initializeFilterModel(
                            this.localize.getLocalizedString('Transaction Types'),
                            this.localize.getLocalizedString('transactionType'),
                            false,
                            null
                        );
                        this.setDefaultCheckboxFilterValues(
                            this.filterModels[prop.Name],
                            true
                        );
                        this.showTransactionTypes = true;
                        this.getTransactionTypes();
                        break;
                    case 'ServiceTypeId[]':
                        this.ServiceTypeName = prop.Name;
                        this.filterModels[prop.Name] = this.initializeFilterModel(
                            this.localize.getLocalizedString('Service Types'),
                            this.localize.getLocalizedString('serviceType'),
                            false,
                            null
                        );
                        this.setDefaultCheckboxFilterValues(
                            this.filterModels[prop.Name],
                            true
                        );
                        this.showServiceTypes = true;
                        this.getServiceTypes();
                        break;
                    case 'TaxableServiceTypeId[]':
                        this.TaxableServiceTypeName = prop.Name;
                        this.filterModels[prop.Name] = this.initializeFilterModel(
                            this.localize.getLocalizedString('Tax Type'),
                            this.localize.getLocalizedString('taxType'),
                            false,
                            null
                        );
                        this.setDefaultCheckboxFilterValues(
                            this.filterModels[prop.Name],
                            true
                        );
                        this.showTaxableServiceTypes = true;
                        this.getTaxableServiceTypes();
                        break;
                    case 'PatientGroupTypeId[]':
                        this.PatientGroupTypeName = prop.Name;
                        this.filterModels[prop.Name] = this.initializeFilterModel(
                            this.parentData.reportId === 120 ? this.localize.getLocalizedString('Group Types') : this.localize.getLocalizedString('Patient Group Types'),
                            this.localize.getLocalizedString('patientGroupTypes'),
                            false,
                            null
                        );
                        this.setDefaultCheckboxFilterValues(
                            this.filterModels[prop.Name],
                            true
                        );
                        this.showPatientGroupTypes = true;
                        this.getPatientGroupTypes();
                        break;
                    case 'ServiceCode':
                        this.ServiceCodeName = prop.Name;
                        this.initializeServiceCodeElements();
                        this.getServiceCodeSearchData();
                        this.showServiceCode = true;
                        break;
                    case 'ServiceCodes[]':
                        this.ServiceCodeName = prop.Name;
                        this.initializeServiceCodeElements();
                        this.getServiceCodeSearchData();
                        this.showServiceCodes = true;
                        break;
                    case 'NegativeAdjustmentTypeId[]':
                        this.NegativeAdjustmentTypeName = prop.Name;
                        this.filterModels[prop.Name] = this.initializeFilterModel(
                            this.localize.getLocalizedString('Negative Adjustment Types'),
                            this.localize.getLocalizedString('negativeAdjustmentTypes'),
                            false,
                            null
                        );
                        this.setDefaultCheckboxFilterValues(
                            this.filterModels[prop.Name],
                            true
                        );
                        this.showNegativeAdjustmentTypes = true;
                        if (this.parentData.reportId === 70 || this.parentData.reportId === 237) {
                            this.getAdjustmentTypes();
                        } else {
                            this.getAdjustmentPromise = this.$q.defer();
                            this.$q.when(this.getLocationsCompletePromise.promise).then(() => {
                                this.getAdjustmentTypes();
                            });
                        }
                        break;
                    case 'PositiveAdjustmentTypeId[]':
                        this.PositiveAdjustmentTypeName = prop.Name;
                        this.filterModels[prop.Name] = this.initializeFilterModel(
                            this.localize.getLocalizedString('Positive Adjustment Types'),
                            this.localize.getLocalizedString('positiveAdjustmentTypes'),
                            false,
                            null
                        );
                        this.setDefaultCheckboxFilterValues(
                            this.filterModels[prop.Name],
                            true
                        );
                        this.showPositiveAdjustmentTypes = true;
                        if (this.parentData.reportId === 70 || this.parentData.reportId === 237) {
                            this.getAdjustmentTypes();
                        } else {
                            this.getAdjustmentPromise = this.$q.defer();
                            this.$q.when(this.getLocationsCompletePromise.promise).then(() => {
                                this.getAdjustmentTypes();
                            });
                        }
                        break;
                    case 'InsurancePaymentTypeId[]':
                        this.InsurancePaymentTypeName = prop.Name;
                        this.filterModels[prop.Name] = this.initializeFilterModel(
                            this.localize.getLocalizedString('Insurance Payment Types'),
                            this.localize.getLocalizedString('insurancePaymentTypes'),
                            false,
                            null
                        );
                        this.setDefaultCheckboxFilterValues(
                            this.filterModels[prop.Name],
                            true
                        );
                        this.showInsurancePaymentType = true;
                        this.getPaymentTypes();
                        break;
                    case 'ReferralAffiliateId[]':
                        this.ReferralAffiliateName = prop.Name;
                        this.filterModels[prop.Name] = this.initializeFilterModel(
                            this.localize.getLocalizedString('Referral Affiliates'),
                            this.localize.getLocalizedString('referralAffiliates'),
                            false,
                            null
                        );
                        this.setDefaultCheckboxFilterValues(
                            this.filterModels[prop.Name],
                            true
                        );
                        this.showReferralAffiliate = true;
                        this.getReferralAffiliates();
                        break;
                    case 'PaymentTypeId[]':
                        this.PaymentTypeName = prop.Name;
                        this.filterModels[prop.Name] = this.initializeFilterModel(
                            this.localize.getLocalizedString('Payment Types'),
                            this.localize.getLocalizedString('paymentTypes'),
                            false,
                            null
                        );
                        this.setDefaultCheckboxFilterValues(
                            this.filterModels[prop.Name],
                            true
                        );
                        this.showPaymentType = true;
                        this.getPaymentType();
                        break;

                    case 'Month[]':
                        this.MonthName = prop.Name;
                        this.filterModels[prop.Name] = this.initializeFilterModel(
                            this.localize.getLocalizedString('Months'),
                            this.localize.getLocalizedString('months'),
                            false,
                            null
                        );
                        this.showMonths = true;
                        this.getMonths();
                        if (this.userDefinedFilter.Months) {
                            this.defaultFilterCount += this.userDefinedFilter.Months.length;
                        } else {
                            this.defaultFilterCount += 3;
                        }
                        break;
                    case 'ImpactionType[]':
                        this.ImpactionName = prop.Name;
                        this.filterModels[prop.Name] = this.initializeFilterModel(
                            this.localize.getLocalizedString('Impaction'),
                            this.localize.getLocalizedString('impactions'),
                            false,
                            null
                        );
                        this.showImpactions = true;
                        this.getImpactions();
                        if (this.userDefinedFilter && this.userDefinedFilter.ImpactionTypes) {
                            this.defaultFilterCount += this.userDefinedFilter.ImpactionTypes.length;
                        } else {
                            this.defaultFilterCount += 4;
                        }
                        break;
                    case 'InsuranceType[]':
                        this.InsuranceName = prop.Name;
                        this.filterModels[prop.Name] = this.initializeFilterModel(
                            this.localize.getLocalizedString('Insurance'),
                            this.localize.getLocalizedString('insurances'),
                            false,
                            null
                        );
                        this.showInsurance = true;
                        this.getInsurances();
                        if (this.userDefinedFilter && this.userDefinedFilter.InsuranceTypes) {
                            this.defaultFilterCount += this.userDefinedFilter.InsuranceTypes.length;
                        } else {
                            this.defaultFilterCount += 3;
                        }
                        break;
                    case 'AppointmentTypes[]':
                        this.AppointmentTypeName = prop.Name;
                        this.filterModels[prop.Name] = this.initializeFilterModel(
                            this.localize.getLocalizedString('Appointment Types'),
                            this.localize.getLocalizedString('appointmentTypes'),
                            false,
                            null
                        );
                        this.setDefaultCheckboxFilterValues(
                            this.filterModels[prop.Name],
                            true
                        );
                        this.showAppointmentTypes = true;
                        this.getAppointmentTypes();
                        break;
                    case 'ViewDeletedTransaction':
                        this.ViewDeletedTransactionName = prop.Name;
                        this.filterModels[prop.Name] = this.initializeFilterModel(
                            this.localize.getLocalizedString('Deleted/Voided'),
                            this.localize.getLocalizedString('viewDeletedTransaction'),
                            false,
                            null
                        );
                        this.showViewDeletedTransaction = true;
                        this.getViewDeletedTransaction();
                        this.defaultFilterCount += 1;
                        break;
                    case 'ViewTransactionsBy':
                        this.ViewTransactionsByName = prop.Name;
                        this.filterModels[prop.Name] = this.initializeFilterModel(
                            this.localize.getLocalizedString('View Transactions By'),
                            this.localize.getLocalizedString('viewTransactionsBy'),
                            false,
                            null
                        );
                        for (const id of this.vtbOrderReports) {
                            if (this.parentData.reportId === id.reportId) {
                                this.showViewTransactionsByOrder = true;
                                break;
                            }
                        }
                        if (!this.showViewTransactionsByOrder) {
                            this.showViewTransactionsBy = true;
                        }
                        this.getViewTransactionsBy();
                        this.defaultFilterCount += 1;
                        break;
                    case 'ServiceDate':
                        this.ServiceDateName = prop.Name;
                        this.filterModels[prop.Name] = this.initializeFilterModel(
                            this.localize.getLocalizedString('Service Date'),
                            this.localize.getLocalizedString('serviceDate'),
                            false,
                            null
                        );

                        this.showServiceDate = true;
                        this.getServiceDate();
                        this.defaultFilterCount += 1;
                        break;
                    case 'DiscountType[]':
                        this.DiscountTypeName = prop.Name;
                        this.filterModels[prop.Name] = this.initializeFilterModel(
                            this.localize.getLocalizedString('Discount Type'),
                            this.localize.getLocalizedString('discountType'),
                            false,
                            null
                        );
                        this.showDiscountTypes = true;
                        this.getDiscountTypes();
                        break;
                    case 'ActivityType[]':
                        this.ActivityTypeName = prop.Name;
                        this.filterModels[prop.Name] = this.initializeFilterModel(
                            this.localize.getLocalizedString('Activity Types'),
                            this.localize.getLocalizedString('activityTypes'),
                            false,
                            null
                        );
                        this.setDefaultCheckboxFilterValues(
                            this.filterModels[prop.Name],
                            true
                        );
                        this.showActivityTypes = true;
                        this.getActivityTypes();
                        break;
                    case 'ActivityAction[]':
                        this.ActivityActionName = prop.Name;
                        this.filterModels[prop.Name] = this.initializeFilterModel(
                            this.localize.getLocalizedString('Activity Action Types'),
                            this.localize.getLocalizedString('activityActions'),
                            false,
                            null
                        );
                        this.setDefaultCheckboxFilterValues(
                            this.filterModels[prop.Name],
                            true
                        );
                        this.showActivityActions = true;
                        this.getActivityActions();
                        break;
                    case 'ActivityArea[]':
                        this.ActivityAreaName = prop.Name;
                        this.filterModels[prop.Name] = this.initializeFilterModel(
                            this.localize.getLocalizedString('Areas'),
                            this.localize.getLocalizedString('activityAreas'),
                            false,
                            null
                        );
                        this.setDefaultCheckboxFilterValues(
                            this.filterModels[prop.Name],
                            true
                        );
                        this.showActivityAreas = true;
                        this.getActivityAreas();
                        break;
                    case 'Patient[]':
                        this.PatientIdName = prop.Name;
                        this.filterModels[prop.Name] = this.initializeFilterModel(
                            this.localize.getLocalizedString('Patients'),
                            this.localize.getLocalizedString('patients'),
                            false,
                            null
                        );
                        this.setDefaultPatients();
                        this.defaultFilterCount += 1;
                        this.showPatients = true;
                        break;
                    case 'CollectionDate':
                        let CollectionDateVal;
                        if (this.userDefinedFilter && this.userDefinedFilter.CollectioDateType) {
                            CollectionDateVal = this.userDefinedFilter.CollectioDateType;
                        } else {
                            CollectionDateVal = 2;
                        }
                        this.CollectionStartDateName = 'CollectionStartDate';
                        this.filterModels[this.CollectionStartDateName] = {
                            Name: this.localize.getLocalizedString('Collection Date'),
                            FilterId: 'CollectionDateRange',
                            ReportId: this.parentData.reportId,
                            ReportCategory: this.reportCategoryId,
                            TitleDateRangeString: '',
                            StartDateName: this.CollectionStartDateName,
                            EndDateName: 'CollectionEndDate',
                            CollectioDateType: CollectionDateVal,
                            defaultDateType: CollectionDateVal,
                            UserStartDate: this.userDefinedFilter ? this.userDefinedFilter.CollectionStartDate : '',
                            UserEndDate: this.userDefinedFilter ? this.userDefinedFilter.CollectionEndDate : ''
                        };
                        this.AddDateFilterToList(
                            this.filterModels[this.CollectionStartDateName]
                        );
                        this.showCollectionDateRange = true;
                        break;
                    case 'ProductionDate':
                        let ProductionDateVal;
                        if (this.userDefinedFilter && this.userDefinedFilter.ProductionDateType) {
                            ProductionDateVal = this.userDefinedFilter.ProductionDateType;
                        } else {
                            ProductionDateVal = 2;
                        }
                        this.ProductionStartDateName = 'ProductionStartDate';
                        this.filterModels[this.ProductionStartDateName] = {
                            Name: this.localize.getLocalizedString('Production Date'),
                            FilterId: 'ProductionDateRange',
                            ReportId: this.parentData.reportId,
                            ReportCategory: this.reportCategoryId,
                            TitleDateRangeString: '',
                            StartDateName: this.ProductionStartDateName,
                            EndDateName: 'ProductionEndDate',
                            ProductionDateType: ProductionDateVal,
                            defaultDateType: ProductionDateVal,
                            UserStartDate: this.userDefinedFilter ? this.userDefinedFilter.ProductionStartDate : '',
                            UserEndDate: this.userDefinedFilter ? this.userDefinedFilter.ProductionEndDate : ''
                        };
                        this.AddDateFilterToList(
                            this.filterModels[this.ProductionStartDateName]
                        );
                        this.showProductionDateRange = true;
                        break;
                    case 'MasterPatientAlertId[]':
                        this.MasterPatientAlertName = prop.Name;
                        this.filterModels[prop.Name] = this.initializeFilterModel(
                            this.localize.getLocalizedString('Flags'),
                            this.localize.getLocalizedString('masterPatientAlerts'),
                            false,
                            null
                        );
                        this.setDefaultCheckboxFilterValues(
                            this.filterModels[prop.Name],
                            true
                        );
                        this.showMasterPatientAlerts = true;
                        this.getMasterPatientAlerts();
                        break;
                    case 'MedicalHistoryAlertId[]':
                        this.MedicalHistoryAlertName = prop.Name;
                        this.filterModels[prop.Name] = this.initializeFilterModel(
                            this.localize.getLocalizedString('Medical Alerts'),
                            this.localize.getLocalizedString('medicalHistoryAlerts'),
                            false,
                            null
                        );
                        this.setDefaultCheckboxFilterValues(
                            this.filterModels[prop.Name],
                            true
                        );
                        this.showMedicalHistoryAlerts = true;
                        this.getMedicalHistoryAlerts();
                        break;
                    case 'TreatmentPlan[]':
                        this.TreatmentPlanName = prop.Name;
                        this.filterModels[prop.Name] = this.initializeFilterModel(
                            this.localize.getLocalizedString('Treatment Plan'),
                            this.localize.getLocalizedString('treatmentPlan'),
                            false,
                            null
                        );
                        this.setDefaultCheckboxFilterValues(
                            this.filterModels[prop.Name],
                            true
                        );
                        this.showTreatmentPlan = true;
                        if (this.userDefinedFilter.TreatmentPlan) {
                            this.defaultFilterCount += this.userDefinedFilter.TreatmentPlan.length;
                        } else {
                            this.defaultFilterCount += 3;
                        }
                        this.getTreatmentPlan();
                        break;
                    case 'AgingId':
                        this.AgingName = prop.Name;
                        this.filterModels[prop.Name] = this.initializeFilterModel(
                            this.localize.getLocalizedString('Aging'),
                            this.localize.getLocalizedString('Aging'),
                            false,
                            null
                        );
                        this.showAging = true;
                        this.setDefaultAgingFilter();
                        this.defaultFilterCount += 1;
                        this.appliedFiltersCount = this.defaultFilterCount;
                        break;
                    case 'AgingOption':
                        this.AgingOptionName = prop.Name;
                        this.filterModels[prop.Name] = this.initializeFilterModel(
                            this.localize.getLocalizedString('Aging'),
                            this.localize.getLocalizedString('AgingOption'),
                            false,
                            null
                        );
                        this.showAgingOption = true;
                        this.setDefaultAgingOptionFilter();
                        this.defaultFilterCount += 1;
                        this.appliedFiltersCount = this.defaultFilterCount;
                        break;
                    case 'ClaimType[]':
                        this.ClaimTypesName = prop.Name;
                        this.filterModels[
                            this.ClaimTypesName
                        ] = this.initializeFilterModel(
                            this.localize.getLocalizedString('Claim Type'),
                            this.localize.getLocalizedString('claimTypes'),
                            false,
                            null
                        );
                        this.setDefaultClaimTypesArray();
                        this.showClaimTypes = true;
                        if (this.userDefinedFilter.ClaimType) {
                            this.defaultFilterCount = this.userDefinedFilter.ClaimType.length;
                        } else {
                            this.defaultFilterCount = 3;
                        }
                        break;
                    case 'ClaimStatus[]':
                        this.ClaimStatusName = prop.Name;
                        this.filterModels[
                            this.ClaimStatusName
                        ] = this.initializeFilterModel(
                            this.localize.getLocalizedString('Claim Status'),
                            this.localize.getLocalizedString('claimStatus'),
                            false,
                            null
                        );
                        this.setDefaultClaimStatusArray();
                        this.showClaimStatus = true;
                        if (this.userDefinedFilter.ClaimStatus) {
                            this.defaultFilterCount += this.userDefinedFilter.ClaimStatus.length;
                        } else {
                            this.defaultFilterCount += 5;
                        }
                        break;
                    case 'ReportView':
                        this.ReportViewName = prop.Name;
                        this.filterModels[prop.Name] = this.initializeFilterModel(
                            this.localize.getLocalizedString('Report View'),
                            this.localize.getLocalizedString('reportView'),
                            false,
                            null
                        );
                        this.showReportView = true;
                        this.getViewReportOptions();
                        this.defaultFilterCount += 1;
                        break;

                    case 'InsuranceAdjustmentMode':
                        this.InsuranceAdjustmentModeName = prop.Name;
                        this.filterModels[prop.Name] = this.initializeFilterModel(
                            this.localize.getLocalizedString('Insurance Adjustment Mode'),
                            this.localize.getLocalizedString('insuranceAdjustmentMode'),
                            false,
                            null
                        );
                        this.ShowInsuranceAdjustmentMode = true;
                        this.getInsuranceAdjustmentOptions();
                        this.defaultFilterCount += 1;
                        break;
                }
                this.appliedFiltersCount = this.defaultFilterCount;
            }
        }
        if (this.parentData.dateFilterList.length == 0) { this.isValidDates = true; }
    }
    // initialize variables that are used for location filter
    initializeCommonLocationElements(elementName) {
        if (elementName == "DistributedLocationIds") {
            if (this.userDefinedFilter && this.userDefinedFilter.DistributedLocationIds) {
                this.filterModels[this.DistributedLocationsName].DefaultAll = false;
            } else {
                this.filterModels[this.DistributedLocationsName].DefaultAll = this.parentData.reportId === this.parentData.reportIds.ActivityLogReportId ||
                    this.parentData.reportId === this.parentData.reportIds.ActivityLogBetaReportId;
            }
        }

        this.defaultDistributedLoc = {};
        this.setDefaultDistributedLocationArray();
    }
    initializeLocationElements() {
        if (this.userDefinedFilter && this.userDefinedFilter.LocationIds) {
            this.filterModels[this.LocationsName].DefaultAll = false;
        } else {
            this.filterModels[this.LocationsName].DefaultAll = this.parentData.reportId === this.parentData.reportIds.ActivityLogReportId ||
                this.parentData.reportId === this.parentData.reportIds.ActivityLogBetaReportId;
        }

        this.defaultLoc = {};
        this.setDefaultLocationArray();
    }
    initializeUsersElements() {
        this.defaultUserData = [];
        this.filterModels[this.UsersName] = this.initializeFilterModel(
            this.localize.getLocalizedString('Team Members'),
            this.localize.getLocalizedString('users'),
            false,
            null
        );
        this.partialUsers = true;
    }

    // initialize variables that are used for payerid filter
    initializePayerIdElements() {
        this.filterModels[this.PayerIdName] = {};
        this.filterModels[this.PayerIdName] = this.initializeFilterModel(
            this.localize.getLocalizedString('Payer ID'),
            this.localize.getLocalizedString('payerId'),
            false,
            null
        );
        this.setDefaultPayerIdArray();
        this.defaultFilterCount += 1;
        this.appliedFiltersCount = this.defaultFilterCount;
        if (this.parentData.reportId === 9) {
            this.originalFilterModels = cloneDeep(this.filterModels);
            if (this.radioComponentChildren) {
                this.radioComponentChildren.forEach((child) => {
                    child.filterModels = this.filterModels.PayerId;
                    child.ngOnInit();
                });
            }
        }
    }


    // initialize variables that are used for display options filter
    initializeDisplayOptionsElements() {
        this.filterModels[this.DisplayOptionsName] = this.initializeFilterModel(
            this.localize.getLocalizedString('Display Options'),
            this.localize.getLocalizedString('displayOptions'),
            false,
            null
        );
        if (this.userDefinedFilter.DisplayOptions) {
            this.defaultFilterCount += this.userDefinedFilter.DisplayOptions.length;
            this.filterModels[this.DisplayOptionsName].DefaultFilterCount = this.defaultFilterCount;
        } else {
            this.filterModels[this.DisplayOptionsName].DefaultFilterCount = this
                .isManagedCareOption
                ? 0
                : 1;
            if (!this.isManagedCareOption) {
                this.defaultFilterCount += 1;
            }
        }
        this.setDefaultDisplayOptionsArray();
    }

    // initialize variables that are used for service code filter
    initializeServiceCodeElements() {
        this.filterModels[this.ServiceCodeName] = {
            SearchMaterial: [],
            Name: 'Service Code',
            DisplayColumns: ['Code', 'CdtCodeName', 'Description'],
            FilterDtoColumns: ['ServiceCodeId'],
            Placeholder: this.localize.getLocalizedString(
                'Search service code, CDT code, description'
            )
        };
        this.includeAll =
            this.parentData.reportId ===
            this.parentData.reportIds.ServiceCodeFeesByFeeScheduleReportId || this.parentData.reportIds.ServiceCodeProductivityByProviderBetaReportId;
        this.setDefaultServiceCode();
    }


    // initialize variables that are used for service code filter
    initializeServiceCodesElements() {
        this.filterModels[this.ServiceCodeName] = {
            SearchMaterial: [],
            Name: 'Service Codes',
            DisplayColumns: ['Code', 'CdtCodeName', 'Description'],
            FilterDtoColumns: ['ServiceCodeId'],
            Placeholder: this.localize.getLocalizedString(
                'Search service code, CDT code, description'
            )
        };
        this.includeAll =
            this.parentData.reportId ===
            this.parentData.reportIds.ServiceCodeFeesByFeeScheduleReportId || this.parentData.reportIds.ServiceCodeProductivityByProviderBetaReportId;
        this.setDefaultServiceCodes();
    }
    // initialize variables that are used for provider filter
    initializeProvidersElements() {
        this.defaultProviderData = [];
        const providerTypeFilterModel = this.initializeFilterModel(
            this.localize.getLocalizedString('Provider Types'),
            this.localize.getLocalizedString('providerTypes'),
            false,
            null
        );
        this.filterModels[this.ProvidersName] = this.initializeFilterModel(
            this.localize.getLocalizedString('Providers'),
            this.localize.getLocalizedString('providers'),
            false,
            providerTypeFilterModel
        );
        this.partialProviders = true;
    }

    initializeFilterModel(name, filterId, reset, filter) {
        const filterModel: any = {
            data: [],
            Reset: reset,
            FilterFilterModel: filter
        };
        filterModel.Name = name;
        filterModel.FilterId = filterId;
        filterModel.reportId = this.parentData.reportId;
        return filterModel;
    }
    // endregion initialize filter data

    // region get filter data


    // initialize variables that are used for treatment plan status filter
    initializeTreatmentPlanStatusElements() {
        this.filterModels[this.TreatmentPlanStatusName] = {
            data: [],
            Reset: false
        };
        this.filterModels[this.TreatmentPlanStatusName].Name =
            'Treatment Plan Status';
        this.filterModels[this.TreatmentPlanStatusName].FilterId =
            'treatmentPlanStatus';
        this.filterModels[this.TreatmentPlanStatusName].data = [];
        const filterTreatmentPlanStatuses = [
            { Id: 1, Name: 'Accepted' },
            { Id: 3, Name: 'Completed' },
            { Id: 4, Name: 'Presented' },
            { Id: 0, Name: 'Proposed' },
            { Id: 2, Name: 'Rejected' }
        ];
        this.populateArrayWithAllID(
            filterTreatmentPlanStatuses,
            this.filterModels[this.TreatmentPlanStatusName],
            'TreatmentPlanStatus',
            'Name',
            true,
            'Id',
            null,
            -1
        );
        this.setDefaultCheckboxFilterValues(
            this.filterModels[this.TreatmentPlanStatusName],
            true
        );
    }

    // initialize variables that are used for service code status filter
    initializeServiceCodeStatusElements() {
        this.filterModels[this.ServiceCodeStatusName] = {
            data: [],
            Reset: false
        };
        this.filterModels[this.ServiceCodeStatusName].Name =
            'Service Code Status';
        this.filterModels[this.ServiceCodeStatusName].FilterId =
            'serviceCodeStatus';
        this.filterModels[this.ServiceCodeStatusName].data = [];
        const filterServiceCodeStatuses = [
            { Id: 1, Name: 'Proposed' },
            { Id: 2, Name: 'Referred' },
            { Id: 3, Name: 'Rejected' },
            { Id: 4, Name: 'Completed' },
            { Id: 7, Name: 'Accepted' },
            { Id: 8, Name: 'Referred Completed' }
        ];
        this.populateArrayWithAllID(
            filterServiceCodeStatuses,
            this.filterModels[this.ServiceCodeStatusName],
            'ServiceCodeStatus',
            'Name',
            true,
            'Id',
            null,
            -1
        );
        this.setDefaultCheckboxFilterValues(
            this.filterModels[this.ServiceCodeStatusName],
            true
        );
    }

    // get location list for location filtering
    getLocations(elementName) {
        this.locationServices.getPermittedLocations({ actionId: this.amfaInfo[this.parentData.reportAmfa].ActionId })
            .$promise.then((res: any) => {
                if (elementName == "DistributedLocation")
                    this.getCommonLocationSuccess(res);
                else
                    this.getLocationSuccess(res);
            });
    }  // create the data for location filter
    getLocationSuccess(res) {
        if (res) {
            let selectAllLocations: boolean = false;
            this.sortedLocations = [];
            if (this.showMultipleLocation) {
                this.filterModels[this.LocationsName].data = [];
                this.filterModels[this.LocationsName].data.push({
                    Field: 'Locations',
                    Value: this.localize.getLocalizedString('All'),
                    Key: true,
                    LocationStatus: 'All Status',
                    Checked: this.filterModels[this.LocationsName].DefaultAll,
                    Id: 0,
                    isVisible: true
                });
                this.childFlag = true;
                if (this.userDefinedFilter) {
                    if (this.scope.isNewReportingAPI === true && this.parentData.requestBodyProperties) {
                        for (const i in this.parentData.requestBodyProperties) {
                            if (this.parentData.requestBodyProperties[i].DisplayAs === 'Location'
                                || this.parentData.requestBodyProperties[i].DisplayAs === 'IncludeAllLocations') {
                                var allItemName = this.parentData.requestBodyProperties[i].Name ? IncludeAllPropName[this.parentData.requestBodyProperties[i].Name] : "";
                                if (this.userDefinedFilter[allItemName] && Array.isArray(this.userDefinedFilter[allItemName]) && this.userDefinedFilter[allItemName].length > 0
                                    && this.userDefinedFilter[allItemName][0] === true) {
                                    selectAllLocations = true;
                                }
                            }
                        }
                    }

                    if ((this.userDefinedFilter.LocationIds.length === (res.Value.length)) || (this.scope.isNewReportingAPI === true && selectAllLocations === true)) {
                        this.filterModels[this.LocationsName].data[0].Checked = true;
                        this.defaultFilterCount += 1;
                        this.filterModels[this.LocationsName].DefaultFilterCount = this.filterModels[this.LocationsName].DefaultFilterCount + 1;
                        this.appliedFiltersCount = this.defaultFilterCount;
                    } else {
                        this.filterModels[this.LocationsName].data[0].Checked = false;
                    }
                } else {
                    if (res.Value.length === 1) {
                        this.defaultFilterCount += 1;
                        this.filterModels[this.LocationsName].DefaultAll = true;
                        this.filterModels[this.LocationsName].data[0].Checked = true;
                    }
                }
            }
            this.sortedLocations = this.sortedLocations.concat(res.Value);

            const dateNow = moment().format('MM/DD/YYYY');
            for (const obj of this.sortedLocations) {
                if (obj.DeactivationTimeUtc) {
                    const toCheck = moment(obj.DeactivationTimeUtc).format('MM/DD/YYYY');
                    if (
                        moment(toCheck).isBefore(dateNow) ||
                        moment(toCheck).isSame(dateNow)
                    ) {
                        obj.LocationStatus = 'Inactive';
                        obj.SortOrder = 3;
                    } else {
                        obj.LocationStatus = 'Pending Inactive';
                        obj.SortOrder = 2;
                    }

                    obj.NameLine1 =
                        obj.NameLine1 +
                        ' (' +
                        this.timeZoneFactory.GetTimeZoneAbbr(obj.Timezone) +
                        ')';
                    // comment for solution
                    obj.InactiveDate = '  -  ' + moment(obj.DeactivationTimeUtc).format('MM/DD/YYYY');
                } else {
                    if (obj.LocationId) {
                        obj.LocationStatus = 'Active';
                        obj.NameLine1 =
                            obj.NameLine1 +
                            ' (' +
                            this.timeZoneFactory.GetTimeZoneAbbr(obj.Timezone) +
                            ')';
                    } else {
                        obj.LocationStatus = 'All Status';
                    }
                    obj.SortOrder = 1;
                }
            }
            this.locationResult = this.sortedLocations;
            this.filterModels[this.LocationsName].DefaultFilterCount = this
                .filterModels[this.LocationsName].DefaultAll
                ? 1
                : 0;
            if (
                this.patSecurityService.IsAuthorizedByAbbreviation(
                    this.parentData.reportAmfa
                )
            ) {
                for (const obj of this.locationResult) {
                    this.addLocationToArray(obj, selectAllLocations);
                }
            } else {
                for (const obj of this.locationResult) {
                    if (
                        this.patSecurityService.IsAuthorizedByAbbreviationAtLocation(
                            this.parentData.reportAmfa,
                            obj.LocationId
                        )
                    ) {
                        this.addLocationToArray(obj, selectAllLocations);
                    }
                }
            }
            if (this.userDefinedFilter && (this.userDefinedFilter.LocationIds
                || (this.scope.isNewReportingAPI === true && selectAllLocations === true))) {

            } else if (this.userDefinedFilter && this.userDefinedFilter.LocationId) {

            } else {
                if (this.filterModels[this.LocationsName].DefaultAll) {
                    this.filterModels[
                        this.LocationsName
                    ].FilterString = this.localize.getLocalizedString('All');
                } else {
                    this.filterModels[this.LocationsName].FilterString =
                        this.defaultLoc !== null ? this.defaultLoc.Value : '';
                }
            }
            var defaultLocArray = this.getSelectedItemIds(
                this.filterModels[this.LocationsName].data
            );

            if (this.showSingleLocation) {
                if (defaultLocArray.length > 0) {
                    this.filterModels[this.LocationsName].FilterDto = defaultLocArray[0];
                } else {
                    this.filterModels[this.LocationsName].FilterDto = -1;
                }
            } else {
                defaultLocArray = defaultLocArray.filter((item, idx) => {
                    return item !== 0;
                });
                this.filterModels[this.LocationsName].FilterDto = defaultLocArray;
            }
            this.getLocationsCompletePromise.resolve();
        }
    }

    getCommonLocationSuccess(res) {

        if (res) {
            let selectAllLocations: boolean = false;
            this.sortedDistributedLocations = [];
            this.filterModels[this.DistributedLocationsName].data = [];
            this.filterModels[this.DistributedLocationsName].data.push({
                Field: 'DistributedLocation',
                Value: this.localize.getLocalizedString('All'),
                Key: true,
                LocationStatus: 'All Status',
                Checked: this.filterModels[this.DistributedLocationsName].DefaultAll,
                Id: 0,
                isVisible: true
            });

            this.childFlag = true;
            if (this.userDefinedFilter) {
                if (this.scope.isNewReportingAPI === true && this.parentData.requestBodyProperties) {
                    for (const i in this.parentData.requestBodyProperties) {
                        if (this.parentData.requestBodyProperties[i].DisplayAs === 'DistributedLocation') {
                            var allItemName = this.parentData.requestBodyProperties[i].Name ? IncludeAllPropName[this.parentData.requestBodyProperties[i].Name] : "";
                            if (this.userDefinedFilter[allItemName] && Array.isArray(this.userDefinedFilter[allItemName]) && this.userDefinedFilter[allItemName].length > 0
                                && this.userDefinedFilter[allItemName][0] === true) {
                                selectAllLocations = true;

                            }
                        }
                    }
                }



                if ((this.userDefinedFilter.DistributedLocationIds && this.userDefinedFilter.DistributedLocationIds.length === (res.Value.length)) || (this.scope.isNewReportingAPI === true && selectAllLocations === true)) {
                    this.filterModels[this.DistributedLocationsName].data[0].Checked = true;
                    this.defaultFilterCount += 1;
                    this.filterModels[this.DistributedLocationsName].DefaultFilterCount = this.filterModels[this.DistributedLocationsName].DefaultFilterCount + 1;
                    this.appliedFiltersCount = this.defaultFilterCount;

                } else {

                    this.filterModels[this.DistributedLocationsName].data[0].Checked = false;
                    this.defaultFilterCount += 1;
                    this.filterModels[this.DistributedLocationsName].DefaultAll = false;
                }

            } else {

                if (res.Value.length === 1) {
                    this.defaultFilterCount += 1;
                    this.filterModels[this.DistributedLocationsName].DefaultAll = false;
                    this.filterModels[this.DistributedLocationsName].data[0].Checked = false;

                }

            }



            this.sortedDistributedLocations = this.sortedDistributedLocations.concat(res.Value);
            const dateNow = moment().format('MM/DD/YYYY');

            for (const obj of this.sortedDistributedLocations) {
                if (obj.DeactivationTimeUtc) {
                    const toCheck = moment(obj.DeactivationTimeUtc).format('MM/DD/YYYY');
                    if (

                        moment(toCheck).isBefore(dateNow) ||
                        moment(toCheck).isSame(dateNow)

                    ) {

                        obj.LocationStatus = 'Inactive';
                        obj.SortOrder = 3;

                    } else {

                        obj.LocationStatus = 'Pending Inactive';
                        obj.SortOrder = 2;

                    }



                    obj.NameLine1 =
                        obj.NameLine1 +
                        ' (' +
                        this.timeZoneFactory.GetTimeZoneAbbr(obj.Timezone) +
                        ')';

                    // comment for solution

                    obj.InactiveDate = '  -  ' + moment(obj.DeactivationTimeUtc).format('MM/DD/YYYY');

                } else {

                    if (obj.LocationId) {
                        obj.LocationStatus = 'Active';
                        obj.NameLine1 =
                            obj.NameLine1 +
                            ' (' +
                            this.timeZoneFactory.GetTimeZoneAbbr(obj.Timezone) +
                            ')';

                    } else {
                        obj.LocationStatus = 'All Status';
                    }
                    obj.SortOrder = 1;
                }
            }

            this.distributedLocationResult = this.sortedDistributedLocations;
            this.filterModels[this.DistributedLocationsName].DefaultFilterCount = this
                .filterModels[this.DistributedLocationsName].DefaultAll
                ? 1
                : 0;

            if (this.patSecurityService.IsAuthorizedByAbbreviation(this.parentData.reportAmfa)) {
                for (const obj of this.distributedLocationResult) {
                    this.addDistributedLocationToArray(obj, selectAllLocations);
                }
            }
            else {
                for (const obj of this.distributedLocationResult) {
                    if (
                        this.patSecurityService.IsAuthorizedByAbbreviationAtLocation(
                            this.parentData.reportAmfa, obj.LocationId)
                    ) {
                        this.addDistributedLocationToArray(obj, selectAllLocations);
                    }
                }
            }

            if (this.userDefinedFilter && (this.userDefinedFilter.DistributedLocationIds
                || (this.scope.isNewReportingAPI === true && selectAllLocations === true))) {
            }
            else {
                if (this.filterModels[this.DistributedLocationsName].DefaultAll) {
                    this.filterModels[this.DistributedLocationsName].FilterString = this.localize.getLocalizedString('All');
                } else {
                    this.filterModels[this.DistributedLocationsName].FilterString = this.defaultLoc !== null ? this.defaultLoc.Value : '';
                }
            }

            var defaultLocArray = this.getSelectedItemIds(this.filterModels[this.DistributedLocationsName].data);


            defaultLocArray = defaultLocArray.filter((item, idx) => {
                return item !== 0;
            });

            this.filterModels[this.DistributedLocationsName].FilterDto = defaultLocArray;
            this.getLocationsCompletePromise.resolve();

        }
    }


    addLocationToArray(obj, selectAllLocations: boolean = false) {
        obj.Checked = false;
        if (this.userDefinedFilter && this.userDefinedFilter.LocationIds) {
            _.find(this.userDefinedFilter.LocationIds, (item) => {
                if (item === obj.LocationId) {
                    obj.Checked = true;
                    this.nameString = this.nameString ? this.nameString + ', ' + obj.NameLine1 : obj.NameLine1;
                    this.defaultFilterCount += 1;
                    this.filterModels[this.LocationsName].DefaultFilterCount = this.filterModels[this.LocationsName].DefaultFilterCount + 1;
                    this.appliedFiltersCount = this.defaultFilterCount;
                    return;
                }
            });

            if (this.scope.isNewReportingAPI === true && selectAllLocations === true) {
                obj.Checked = true;
                this.nameString = this.nameString ? this.nameString + ', ' + obj.NameLine1 : obj.NameLine1;
                this.defaultFilterCount += 1;
                this.filterModels[this.LocationsName].DefaultFilterCount = this.filterModels[this.LocationsName].DefaultFilterCount + 1;
                this.appliedFiltersCount = this.defaultFilterCount;
            }
            if (this.scope.isNewReportingAPI === true && selectAllLocations === false && this.userDefinedFilter.LocationIds.length === 0) {
                this.filterModels[this.LocationsName].FilterString = this.localize.getLocalizedString('No filters applied');
            }
            if (this.scope.isNewReportingAPI === false && this.userDefinedFilter.LocationIds.length === 0) {
                this.filterModels[this.LocationsName].FilterString = this.localize.getLocalizedString('No filters applied');
            } else {
                this.filterModels[this.LocationsName].FilterString = this.filterModels[this.LocationsName].data[0].Checked ?
                    this.localize.getLocalizedString('All') : this.nameString;
            }
            this.defaultLocString = this.filterModels[this.LocationsName].FilterString;
        } else if (this.userDefinedFilter && this.userDefinedFilter.LocationId) {
            if (this.userDefinedFilter.LocationId === obj.LocationId) {
                obj.Checked = true;
                this.nameString = obj.NameLine1;
                this.defaultFilterCount += 1;
                this.filterModels[this.LocationsName].DefaultFilterCount = 1;
                this.appliedFiltersCount = this.defaultFilterCount;
                this.filterModels[this.LocationsName].FilterString = this.nameString;
                this.defaultLocString = this.filterModels[this.LocationsName].FilterString;
            }
        }
        this.filterModels[this.LocationsName].data.push({
            Field: 'Locations',
            Value: obj.NameLine1,
            Key: true,
            Checked: obj.Checked,
            LocationStatus: obj.LocationStatus,
            Id: obj.LocationId,
            isVisible:
                this.filterModels[this.LocationsName].data.length > 4 ? false : true
        });
        if (this.userDefinedFilter && this.userDefinedFilter.LocationIds) {
            // this.defaultFilterCount += this.userDefinedFilter.LocationIds.length;
            // this.appliedFiltersCount = this.defaultFilterCount;
        } else if (this.userDefinedFilter && this.userDefinedFilter.LocationId) {

        } else {
            if (
                !isNull(this.parentData.userLocation) ||
                this.filterModels[this.LocationsName].DefaultAll
            ) {
                obj.Selected =
                    this.filterModels[this.LocationsName].DefaultAll ||
                        obj.LocationId === this.parentData.userLocation.id
                        ? true
                        : false;
                if (obj.Selected) {
                    this.filterModels[this.LocationsName].data[
                        this.filterModels[this.LocationsName].data.length - 1
                    ].Checked = true;
                    if (obj.LocationId === this.parentData.userLocation.id) {
                        this.defaultLoc = this.filterModels[this.LocationsName].data[
                            this.filterModels[this.LocationsName].data.length - 1
                        ];
                    }
                    this.defaultFilterCount += 1;
                    this.filterModels[this.LocationsName].DefaultFilterCount = this
                        .filterModels[this.LocationsName].DefaultAll
                        ? this.filterModels[this.LocationsName].DefaultFilterCount + 1
                        : 1;
                    this.appliedFiltersCount = this.defaultFilterCount;
                }
            }
        }
        if (this.filterModels[this.LocationsName].data.length > 5) {
            this.isVisibleShowMorebuttonLocation = true;
        }
    }

    addDistributedLocationToArray(obj, selectAllLocations: boolean = false) {
        obj.Checked = false;
        if (this.userDefinedFilter && this.userDefinedFilter.DistributedLocationIds) {
            _.find(this.userDefinedFilter.DistributedLocationIds, (item) => {
                if (item === obj.LocationId) {
                    obj.Checked = true;
                    this.nameString = this.nameString ? this.nameString + ', ' + obj.NameLine1 : obj.NameLine1;
                    this.defaultFilterCount += 1;
                    this.filterModels[this.DistributedLocationsName].DefaultFilterCount = this.filterModels[this.DistributedLocationsName].DefaultFilterCount + 1;
                    this.appliedFiltersCount = this.defaultFilterCount;
                    return;
                }
            });

            if (this.scope.isNewReportingAPI === true && selectAllLocations === true) {
                obj.Checked = true;
                this.nameString = this.nameString ? this.nameString + ', ' + obj.NameLine1 : obj.NameLine1;
                this.defaultFilterCount += 1;
                this.filterModels[this.DistributedLocationsName].DefaultFilterCount = this.filterModels[this.DistributedLocationsName].DefaultFilterCount + 1;
                this.appliedFiltersCount = this.defaultFilterCount;
            }
            if (this.scope.isNewReportingAPI === true && selectAllLocations === false && this.userDefinedFilter.DistributedLocationsName.length === 0) {
                this.filterModels[this.DistributedLocationsName].FilterString = this.localize.getLocalizedString('No filters applied');
            }
            if (this.scope.isNewReportingAPI === false && this.userDefinedFilter.DistributedLocationIds.length === 0) {
                this.filterModels[this.DistributedLocationsName].FilterString = this.localize.getLocalizedString('No filters applied');
            } else {
                this.filterModels[this.DistributedLocationsName].FilterString = this.filterModels[this.DistributedLocationsName].data[0].Checked ?
                    this.localize.getLocalizedString('All') : this.nameString;
            }
            this.defaultDistLocString = this.filterModels[this.DistributedLocationsName].FilterString;
        }
        this.filterModels[this.DistributedLocationsName].data.push({
            Field: 'DistributedLocation',
            Value: obj.NameLine1,
            Key: true,
            Checked: obj.Checked,
            LocationStatus: obj.LocationStatus,
            Id: obj.LocationId,
            isVisible:
                this.filterModels[this.DistributedLocationsName].data.length > 4 ? false : true
        });
        if (this.userDefinedFilter && this.userDefinedFilter.DistributedLocationIds) {
            // this.defaultFilterCount += this.userDefinedFilter.LocationIds.length;
            // this.appliedFiltersCount = this.defaultFilterCount;
        } else {
            if (
                !isNull(this.parentData.userLocation) ||
                this.filterModels[this.DistributedLocationsName].DefaultAll
            ) {
                obj.Selected =
                    this.filterModels[this.DistributedLocationsName].DefaultAll ||
                        obj.LocationId === this.parentData.userLocation.id
                        ? true
                        : false;
                if (obj.Selected) {
                    this.filterModels[this.DistributedLocationsName].data[
                        this.filterModels[this.DistributedLocationsName].data.length - 1
                    ].Checked = true;
                    if (obj.LocationId === this.parentData.userLocation.id) {
                        this.defaultDistributedLoc = this.filterModels[this.DistributedLocationsName].data[
                            this.filterModels[this.DistributedLocationsName].data.length - 1
                        ];
                    }
                    this.defaultFilterCount += 1;
                    this.filterModels[this.DistributedLocationsName].DefaultFilterCount = this
                        .filterModels[this.DistributedLocationsName].DefaultAll
                        ? this.filterModels[this.DistributedLocationsName].DefaultFilterCount + 1
                        : 1;
                    this.appliedFiltersCount = this.defaultFilterCount;
                }
            }
        }
        if (this.filterModels[this.DistributedLocationsName].data.length > 5) {
            this.isVisibleShowMorebuttonLocation = true;
        }
    }

    // get provider list for provider filtering
    getUsers(useProviderOnly, model, fieldName) {
        this.usersFactory.Users().then((res) => {
            this.users = res.Value;
            this.setUserDisplayNames(this.users);
            this.processUsers(
                useProviderOnly ? this.users.filter(this.checkIfProvider) : this.users,
                model,
                fieldName
            );
            this.getUsersCompletePromise.resolve();
            this.usersLoaded = true;
        }, () => {
            this.toastrFactory.error(
                this.localize.getLocalizedString('{0} {1}', [
                    fieldName,
                    'failed to load.'
                ]),
                this.localize.getLocalizedString('Server Error')
            );
        });
    } processUsers(users, model, fieldName) {
        const userModels = [];
        let allValue = true;
        if (this.userDefinedFilter) {
            if (this.userDefinedFilter.ProviderUserIds && this.userDefinedFilter.ProviderUserIds.length === 0) {
                allValue = false;
            } else if (this.userDefinedFilter.ProviderIds && this.userDefinedFilter.ProviderIds.length === 0) {
                allValue = false;
            }
        } else {
            allValue = true;
        }


        userModels.push({
            Field: fieldName,
            Value: this.localize.getLocalizedString('All'),
            Key: true,
            Checked: allValue,
            Id: this.emptyGuid,
            isVisible: true,
            IsActive: true,
            SortOrder: 1
        });
        const valueKey = '$$DisplayName';
        for (const user of users) {
            userModels.push({
                Field: fieldName,
                Value: user[valueKey],
                Key: true,
                Checked: true,
                Id: user.UserId,
                FilterValue: user.Locations,
                IsActive: user.IsActive,
                isVisible: model.data.length <= 4,
                SortOrder: user.IsActive ? 2 : 3
            });
        }
        model.data = userModels.sort((a, b) => a.SortOrder - b.SortOrder);
        if (fieldName === 'Providers') {
            this.defaultProviderData = model.data;
            this.setDefaultProvidersArray();
            this.filterModels[this.ProvidersName].DefaultFilterCount = 0;
        } else if (fieldName === 'Team Members') {
            this.defaultUserData = model.data;
            this.filterModels[this.UsersName].DefaultFilterCount = 0;
        }
        this.updateFilteredList();
    }

    checkIfProvider(prov) {
        return prov.ProviderTypeId !== 4;
    }
    setUserDisplayNames(users) {
        for (const user of users) {
            user.$$DisplayName = user.LastName + ', ' + user.FirstName + ' - ' + user.UserCode;
        }
    }  // Get carrier list.
    getCarriers() {
        this.businessCenterServices.Carrier.get()
            .$promise.then((res) => {
                this.carrierGetAllSuccess(res);
            }, (err) => {
                this.carrierGetAllFailure();
            });
    }

    // Success callback to load fee schedules
    carrierGetAllSuccess(successResponse) {
        this.populateArrayWithAllID(
            successResponse.Value,
            this.filterModels[this.CarrierName],
            'Carriers',
            'Name',
            true,
            'CarrierId',
            null,
            this.emptyGuid
        );
        this.filterModels[this.CarrierName].FilterDto = this.getSelectedItemIds(
            this.filterModels[this.CarrierName].data
        );
    }
    // Error callback to handle failure while retrieving carriers
    carrierGetAllFailure() {
        this.toastrFactory.error(
            this.localize.getLocalizedString(
                'There was an error while attempting to retrieve carriers.'
            ),
            this.localize.getLocalizedString('Server Error')
        );
    }

    // Get fee schedule list.
    getFeeSchedules() {
        this.businessCenterServices.FeeSchedule.get()
            .$promise.then((res) => {
                this.feeScheduleGetAllSuccess(res);
            }, (err) => {
                this.feeScheduleGetAllFailure();
            });
    }
    // Success callback to load fee schedules
    feeScheduleGetAllSuccess(successResponse) {
        this.populateArrayWithAllID(
            successResponse.Value,
            this.filterModels[this.FeeSchedulesName],
            'FeeSchedules',
            'FeeScheduleName',
            true,
            'FeeScheduleId',
            null,
            this.emptyGuid
        );
        this.filterModels[
            this.FeeSchedulesName
        ].FilterDto = this.getSelectedItemIds(
            this.filterModels[this.FeeSchedulesName].data
        );
    }

    // Error callback to handle failure while retrieving fee schedules
    feeScheduleGetAllFailure() {
        this.toastrFactory.error(
            this.localize.getLocalizedString(
                'There was an error while attempting to retrieve fee schedules.'
            ),
            this.localize.getLocalizedString('Server Error')
        );
    }

    getTransactionTypes() {
        // This list is different from StaticData.TransactionTypes
        const filterTransactionTypes =
            (this.parentData.reportId !=
                this.parentData.reportIds.CollectionsAtCheckoutReportId && this.parentData.reportId !=
                this.parentData.reportIds.CollectionAtCheckoutBetaReportId)
                ? [
                    { Id: 1, Name: this.localize.getLocalizedString('Services') },
                    {
                        Id: 2,
                        Name: this.localize.getLocalizedString('Account Payment')
                    },
                    {
                        Id: 3,
                        Name: this.localize.getLocalizedString('Insurance Payment')
                    },
                    {
                        Id: 4,
                        Name: this.localize.getLocalizedString('Negative Adjustment')
                    },
                    {
                        Id: 5,
                        Name: this.localize.getLocalizedString('Positive Adjustment')
                    },
                    { Id: 6, Name: this.localize.getLocalizedString('Finance Charge') }
                ]
                : [
                    {
                        Id: 2,
                        Name: this.localize.getLocalizedString('Account Payment')
                    },
                    {
                        Id: 4,
                        Name: this.localize.getLocalizedString('Negative Adjustment')
                    }
                ];

        this.populateArrayWithAllID(
            filterTransactionTypes,
            this.filterModels[this.TransactionTypeName],
            'TransactionTypes',
            'Name',
            true,
            'Id',
            null,
            -1
        );
        this.filterModels[
            this.TransactionTypeName
        ].FilterDto = this.getSelectedItemIds(
            this.filterModels[this.TransactionTypeName].data
        );
    }

    getServiceTypes() {
        this.serviceTypesService.getAll().then(serviceTypes => {
            this.populateArrayWithAllID(
                serviceTypes,
                this.filterModels[this.ServiceTypeName],
                'ServiceTypes',
                'Description',
                true,
                'ServiceTypeId',
                null,
                this.emptyGuid
            );
            this.filterModels[this.ServiceTypeName].FilterDto = this.getSelectedItemIds(
                this.filterModels[this.ServiceTypeName].data
            );
        });
    }

    getTaxableServiceTypes() {
        this.staticData.TaxableServices().then((res) => {
            if (res && res?.Value) {
                this.taxableServices = res?.Value;
                this.populateArrayWithAllID(
                    this.taxableServices,
                    this.filterModels[this.TaxableServiceTypeName],
                    'TaxableServiceTypes',
                    'Name',
                    true,
                    'Id',
                    null,
                    -1
                );
                this.filterModels[this.TaxableServiceTypeName].FilterDto = this.getSelectedItemIds(
                    this.filterModels[this.TaxableServiceTypeName].data
                );
            }
        });
    }

    // Loading data for patient group types
    getPatientGroupTypes() {
        this.subscriptions.push(this.groupTypeService.get()?.subscribe({
            next: (groupTypesList: SoarResponse<Array<GroupType>>) => this.getPatientGroupTypesGetSuccess(groupTypesList),
            error: () => this.getPatientGroupTypesFailure()
        }));
    }


    // Success callback handler to notify user after getting all patient group types
    getPatientGroupTypesGetSuccess(successResponse) {
        this.populateArrayWithAllAndNoneID(
            successResponse.Value,
            this.filterModels[this.PatientGroupTypeName],
            'PatientGroupTypes',
            'GroupTypeName',
            true,
            'MasterPatientGroupId',
            null,
            this.emptyGuid,
            'No Group Type',
            this.GuidOne
        );
        this.filterModels[
            this.PatientGroupTypeName
        ].FilterDto = this.getSelectedItemIds(
            this.filterModels[this.PatientGroupTypeName].data
        );
    }

    // Error callback to handle failure while retrieving patient group types
    getPatientGroupTypesFailure() {
        this.toastrFactory.error(
            this.localize.getLocalizedString(
                'Failed to retrieve the list of patient group types. Refresh the page to try again.'
            ),
            this.localize.getLocalizedString('Server Error')
        );
    }

    getPaymentTypes() {
        this.filtersLoading = true;
        this.paymentTypesService.getAllPaymentTypes().then(res => {
            this.getAllPaymentypesSuccess(res);
        }, () => {
            this.getAllPaymentypesFailure();
        })
    }

    getAllPaymentypesSuccess = (res: any) => {
        if (res && res.Value) {
            const insurancePaymentTypes = res.Value.filter((x: any) => x.PaymentTypeCategory === 2);
            if (this.showInsurancePaymentType) {
                this.populateArrayWithAllID(
                    insurancePaymentTypes,
                    this.filterModels[this.InsurancePaymentTypeName],
                    'InsurancePaymentTypes',
                    'Description',
                    true,
                    'PaymentTypeId',
                    null,
                    this.emptyGuid
                );
                this.filterModels[
                    this.InsurancePaymentTypeName
                ].FilterDto = this.getSelectedItemIds(
                    this.filterModels[this.InsurancePaymentTypeName].data
                );
            }
            if (this.parentData.reportId === 72 || this.parentData.reportId === 204) {
                this.originalFilterModels = cloneDeep(this.filterModels);
                this.checkComponentChildren.forEach((child) => {
                    child.ngOnInit();
                });
            }
        }
        this.filtersLoading = false;
    }

    getReferralAffiliates() {
        this.filtersLoading = true;
        const userPractice = JSON.parse(sessionStorage.getItem('userPractice'));
        let req: GetProviderReferralAffiliatesRequest = {
            PracticeId: userPractice.id
            , PageSize: 0
            , PageNumber: 0
            , SortColumn: "LastName"
            , SortOrder: "ASC"
            , Search: ''
        };
        this.referralManagementHttpService
            .getProviderAffiliates(req)
            .subscribe((data: any[]) => {
                let res = data.map(item => {
                    let parts = [];

                    if (item.practiceName) parts.push(item.practiceName);
                    if (item.practiceName && (item.lastName || item.firstName)) parts.push(' - ');
                    if (item.lastName) parts.push(item.lastName);
                    if (item.lastName && item.firstName) parts.push(', ');
                    if (item.firstName) parts.push(item.firstName);

                    return {
                        ...item,
                        IsActive: item.status,
                        FullName: parts.join('').trim()
                    };
                });
                res.sort((a, b) => a.FullName.localeCompare(b.FullName));
                this.getReferralAffiliatesSuccess(res);
            });
    }

    getReferralAffiliatesSuccess = (referralAffiliates: any) => {
        if (referralAffiliates) {
            this.populateArrayWithAllID(
                referralAffiliates,
                this.filterModels[this.ReferralAffiliateName],
                'ReferralAffiliates',
                'FullName',
                true,
                'providerAffiliateId',
                null,
                this.emptyGuid
            );
            this.filterModels[
                this.ReferralAffiliateName
            ].FilterDto = this.getSelectedItemIds(
                this.filterModels[this.ReferralAffiliateName].data
            );

            if (this.parentData.reportId === 233) {
                this.originalFilterModels = cloneDeep(this.filterModels);
                this.checkComponentChildren.forEach((child) => {
                    child.ngOnInit();
                });
            }
        }
        this.filtersLoading = false;
    }

    getPaymentType() {
        this.filtersLoading = true;
        this.paymentTypesService.getAllPaymentTypes().then(res => {
            this.getAllPaymentypeSuccess(res);
        }, () => {
            this.getAllPaymentypesFailure();
        })
    }

    getAllPaymentypeSuccess = (res: any) => {
        if (res && res.Value) {
            const paymentTypes = res.Value;
            if (this.showPaymentType) {
                this.populateArrayWithAllID(
                    paymentTypes,
                    this.filterModels[this.PaymentTypeName],
                    'PaymentTypes',
                    'Description',
                    true,
                    'PaymentTypeId',
                    null,
                    this.emptyGuid
                );
                this.filterModels[
                    this.PaymentTypeName
                ].FilterDto = this.getSelectedItemIds(
                    this.filterModels[this.PaymentTypeName].data
                );
            }
        }
        this.filtersLoading = false;
    }


    getAllPaymentypesFailure = () => {
        this.toastrFactory.error
            (this.localize.getLocalizedString('Failed to retrieve the list of payment types. Refresh the page to try again.'),
                this.localize.getLocalizedString('Server Error'));
        this.filtersLoading = false;
    }

    // get adjustments
    getAdjustmentTypes() {
        this.filtersLoading = true;
        this.adjustmentTypesService.GetAllAdjustmentTypesWithOutCheckTransactions({ active: false })
            .then((res) => {
                this.adjustmentTypesGetSuccess(res);
            }, (err) => {
                this.adjustmentTypesGetFailure();
            });
    }
    // Success callback handler to notify user after getting all adjustment types
    adjustmentTypesGetSuccess(successResponse: any) {
        if (
            this.showNegativeAdjustmentTypes &&
            (this.filterModels[this.NegativeAdjustmentTypeName].data.length === 0)
        ) {
            this.populateArrayWithAllID(
                successResponse.Value.filter(this.checkIfNegativeAdjustment),
                this.filterModels[this.NegativeAdjustmentTypeName],
                'NegativeAdjustmentTypes',
                'Description',
                true,
                'AdjustmentTypeId',
                null,
                this.emptyGuid
            );
            this.filterModels[
                this.NegativeAdjustmentTypeName
            ].FilterDto = this.getSelectedItemIds(
                this.filterModels[this.NegativeAdjustmentTypeName].data
            );
        }

        if (
            this.showPositiveAdjustmentTypes &&
            (this.filterModels[this.PositiveAdjustmentTypeName].data.length === 0)
        ) {
            this.populateArrayWithAllID(
                successResponse.Value.filter(this.checkIfPositiveAdjustment),
                this.filterModels[this.PositiveAdjustmentTypeName],
                'PositiveAdjustmentTypes',
                'Description',
                true,
                'AdjustmentTypeId',
                null,
                this.emptyGuid
            );
            this.filterModels[
                this.PositiveAdjustmentTypeName
            ].FilterDto = this.getSelectedItemIds(
                this.filterModels[this.PositiveAdjustmentTypeName].data
            );
        }
        if (this.parentData.reportId === 70 || this.parentData.reportId === 237) {
            this.originalFilterModels = cloneDeep(this.filterModels);
            this.checkComponentChildren.forEach((child) => {
                child.ngOnInit();
            });
        } else {
            this.getAdjustmentPromise.resolve();
        }
        this.filtersLoading = false;
    }

    checkIfPositiveAdjustment(adj) {
        return adj.IsPositive;
    }

    checkIfNegativeAdjustment(adj) {
        return !adj.IsPositive;
    }

    getMonths() {
        this.filterModels[this.MonthName].data = [
            {
                Field: 'Months',
                Value: this.localize.getLocalizedString('All'),
                Key: true,
                Id: 0,
                Checked: false,
                FilterValue: null,
                isVisible: true
            },
            {
                Field: 'Months',
                Value: this.localize.getLocalizedString('January'),
                Key: true,
                Id: 1,
                Checked: false,
                FilterValue: null,
                isVisible: true
            },
            {
                Field: 'Months',
                Value: this.localize.getLocalizedString('February'),
                Key: true,
                Id: 2,
                Checked: false,
                FilterValue: null,
                isVisible: true
            },
            {
                Field: 'Months',
                Value: this.localize.getLocalizedString('March'),
                Key: true,
                Id: 3,
                Checked: false,
                FilterValue: null,
                isVisible: true
            },
            {
                Field: 'Months',
                Value: this.localize.getLocalizedString('April'),
                Key: true,
                Id: 4,
                Checked: false,
                FilterValue: null,
                isVisible: true
            },
            {
                Field: 'Months',
                Value: this.localize.getLocalizedString('May'),
                Key: true,
                Id: 5,
                Checked: false,
                FilterValue: null,
                isVisible: true
            },
            {
                Field: 'Months',
                Value: this.localize.getLocalizedString('June'),
                Key: true,
                Id: 6,
                Checked: false,
                FilterValue: null,
                isVisible: true
            },
            {
                Field: 'Months',
                Value: this.localize.getLocalizedString('July'),
                Key: true,
                Id: 7,
                Checked: false,
                FilterValue: null,
                isVisible: true
            },
            {
                Field: 'Months',
                Value: this.localize.getLocalizedString('August'),
                Key: true,
                Id: 8,
                Checked: false,
                FilterValue: null,
                isVisible: true
            },
            {
                Field: 'Months',
                Value: this.localize.getLocalizedString('September'),
                Key: true,
                Id: 9,
                Checked: false,
                FilterValue: null,
                isVisible: true
            },
            {
                Field: 'Months',
                Value: this.localize.getLocalizedString('October'),
                Key: true,
                Id: 10,
                Checked: false,
                FilterValue: null,
                isVisible: true
            },
            {
                Field: 'Months',
                Value: this.localize.getLocalizedString('November'),
                Key: true,
                Id: 11,
                Checked: false,
                FilterValue: null,
                isVisible: true
            },
            {
                Field: 'Months',
                Value: this.localize.getLocalizedString('December'),
                Key: true,
                Id: 12,
                Checked: false,
                FilterValue: null,
                isVisible: true
            }
        ];
        this.setDefaultMonthsArray();
    }
    // Error callback handler to notify user after it failed to retrieve all adjustment types
    adjustmentTypesGetFailure() {
        this.toastrFactory.error(
            this.localize.getLocalizedString(
                'Failed to retrieve the list of {0}. Refresh the page to try again.',
                ['Adjustment Types']
            ),
            this.localize.getLocalizedString('Server Error')
        );
        this.filtersLoading = false;
    }

    getImpactions() {
        this.filterModels[this.ImpactionName].data = [
            {
                Field: 'Impactions',
                Value: this.localize.getLocalizedString('All'),
                Key: true,
                Id: 0,
                Checked: true,
                FilterValue: null,
                isVisible: true
            },
            {
                Field: 'Impactions',
                Value: this.localize.getLocalizedString('Adjustment'),
                Key: true,
                Id: 3,
                Checked: true,
                FilterValue: null,
                isVisible: true
            },
            {
                Field: 'Impactions',
                Value: this.localize.getLocalizedString('Collection'),
                Key: true,
                Id: 2,
                Checked: true,
                FilterValue: null,
                isVisible: true
            },
            {
                Field: 'Impactions',
                Value: this.localize.getLocalizedString('Production'),
                Key: true,
                Id: 1,
                Checked: true,
                FilterValue: null,
                isVisible: true
            }
        ];
        this.setDefaultCheckboxFilterValues(
            this.filterModels[this.ImpactionName],
            true
        );
    }

    getInsurances() {
        this.filterModels[this.InsuranceName].data = [
            {
                Field: 'Insurances',
                Value: this.localize.getLocalizedString('All'),
                Key: true,
                Id: 0,
                Checked: true,
                FilterValue: null,
                isVisible: true
            },
            {
                Field: 'Insurances',
                Value: this.localize.getLocalizedString('Insurance'),
                Key: true,
                Id: 2,
                Checked: true,
                FilterValue: null,
                isVisible: true
            },
            {
                Field: 'Insurances',
                Value: this.localize.getLocalizedString('No Insurance'),
                Key: true,
                Id: 1,
                Checked: true,
                FilterValue: null,
                isVisible: true
            }
        ];
        this.setDefaultCheckboxFilterValues(
            this.filterModels[this.InsuranceName],
            true
        );
    }

    // Get appointment type list.
    getAppointmentTypes() {
        this.appointmentTypesFactory.AppointmentTypes().then((res) => {
            this.appointmentTypesGetAllSuccess(res);
        }, (err) => {
            this.appointmentTypesGetAllFailure();
        });
    }

    // Success callback
    appointmentTypesGetAllSuccess(successResponse) {
        this.populateArrayWithAllID(
            successResponse.Value,
            this.filterModels[this.AppointmentTypeName],
            'Appointment Types',
            'Name',
            true,
            'AppointmentTypeId',
            null,
            this.emptyGuid
        );
        this.filterModels[
            this.AppointmentTypeName
        ].FilterDto = this.getSelectedItemIds(
            this.filterModels[this.AppointmentTypeName].data
        );
    }

    // Error callback to handle failure
    appointmentTypesGetAllFailure() {
        this.toastrFactory.error(
            this.localize.getLocalizedString(
                'There was an error while attempting to retrieve appointment types.'
            ),
            this.localize.getLocalizedString('Server Error')
        );
    }

    // Get discount type list.
    getDiscountTypes() {
        this.discountTypesService.get().then((res: SoarResponse<Array<DiscountType>>) => {
            this.discountTypesGetAllSuccess(res);
        }, (err) => {
            this.discountTypesGetAllFailure();
        });
    }

    // Success callback
    discountTypesGetAllSuccess(successResponse) {
        this.populateArrayWithAllID(
            successResponse.Value.filter((val) => {
                return val.IsActive;
            }),
            this.filterModels[this.DiscountTypeName],
            'Discount Types',
            'DiscountName',
            true,
            'MasterDiscountTypeId',
            null,
            this.emptyGuid
        );
        this.filterModels[
            this.DiscountTypeName
        ].FilterDto = this.getSelectedItemIds(
            this.filterModels[this.DiscountTypeName].data
        );
        for (const item of this.filterModels[this.DiscountTypeName].data) {
            const dataItem = successResponse.Value.filter((val) => {
                return val.MasterDiscountTypeId === item.Id && val.IsActive;
            });
            if (item.Value !== 'All' && !item.Value.contains('%') && dataItem[0]) {
                item.Value =
                    item.Value + ' - ' + Math.floor(dataItem[0].DiscountRate * 100) + '%';
            }
        }
    }

    // Error callback to handle failure
    discountTypesGetAllFailure() {
        this.toastrFactory.error(
            this.localize.getLocalizedString(
                'There was an error while attempting to retrieve discount types.'
            ),
            this.localize.getLocalizedString('Server Error')
        );
    }
    getViewTransactionsBy() {
        this.filterModels[this.ViewTransactionsByName].data = [
            {
                Field: 'ViewTransactionsBy',
                Value: this.localize.getLocalizedString('Service Date'),
                Key: true,
                Id: 0,
                Checked: true,
                FilterValue: null,
                isVisible: true
            },
            {
                Field: 'ViewTransactionsBy',
                Value: this.localize.getLocalizedString('Posted Date'),
                Key: true,
                Id: 1,
                Checked: false,
                FilterValue: null,
                isVisible: true
            }
        ];
        this.setDefaultViewTransactionsByArray();
    }
    getViewDeletedTransaction() {
        this.filterModels[this.ViewDeletedTransactionName].data = [
            {
                Field: 'ViewDeletedTransaction',
                Value: this.localize.getLocalizedString('All'),
                Key: true,
                Id: 0,
                Checked: false,
                FilterValue: null,
                isVisible: false
            },
            {
                Field: 'ViewDeletedTransaction',
                Value: this.localize.getLocalizedString('Deleted/Voided'),
                Key: true,
                Id: 1,
                Checked: false,
                FilterValue: null,
                isVisible: true
            }
        ];
        this.setViewDeletedTransaction();
    }

    getInsuranceAdjustmentOptions() {
        this.filterModels[this.InsuranceAdjustmentModeName].data = [
            {
                Field: 'InsuranceAdjustmentMode',
                Value: this.localize.getLocalizedString('All'),
                Key: true,
                Id: -1,
                Checked: true,
                FilterValue: null,
                isVisible: true
            },
            {
                Field: 'InsuranceAdjustmentMode',
                Value: this.localize.getLocalizedString('Automatic'),
                Key: true,
                Id: 1,
                Checked: false,
                FilterValue: null,
                isVisible: true
            },
            {
                Field: 'InsuranceAdjustmentMode',
                Value: this.localize.getLocalizedString('Manual'),
                Key: true,
                Id: 0,
                Checked: false,
                FilterValue: null,
                isVisible: true
            }
        ];
        this.setDefaultAdjustmentTypeOption();
    }

    getViewReportOptions() {
        this.filterModels[this.ReportViewName].data = [
            {
                Field: 'ReportView',
                Value: this.localize.getLocalizedString('Detailed'),
                Key: true,
                Id: 0,
                Checked: true,
                FilterValue: null,
                isVisible: true
            },
            {
                Field: 'ReportView',
                Value: this.localize.getLocalizedString('Summary'),
                Key: true,
                Id: 1,
                Checked: false,
                FilterValue: null,
                isVisible: true
            }
        ];
        this.setDefaultReportViewOption();
    } getServiceDate() {
        this.filterModels[this.ServiceDateName].data = [
            {
                Field: 'ServiceDate',
                Value: this.localize.getLocalizedString('Last 12 Months'),
                Key: true,
                Id: 0,
                Checked: true,
                FilterValue: null,
                isVisible: true
            },
            {
                Field: 'ServiceDate',
                Value: this.localize.getLocalizedString('Last 18 Months'),
                Key: true,
                Id: 1,
                Checked: false,
                FilterValue: null,
                isVisible: true
            },
            {
                Field: 'ServiceDate',
                Value: this.localize.getLocalizedString('Last 24 Months'),
                Key: true,
                Id: 2,
                Checked: false,
                FilterValue: null,
                isVisible: true
            },
            {
                Field: 'ServiceDate',
                Value: this.localize.getLocalizedString('Last 36 Months'),
                Key: true,
                Id: 3,
                Checked: false,
                FilterValue: null,
                isVisible: true
            },
            {
                Field: 'ServiceDate',
                Value: this.localize.getLocalizedString('Over 36 Months'),
                Key: true,
                Id: 4,
                Checked: false,
                FilterValue: null,
                isVisible: true
            },
            {
                Field: 'ServiceDate',
                Value: this.localize.getLocalizedString(
                    'No Service Date Within Last 12 Months'
                ),
                Key: true,
                Id: 5,
                Checked: false,
                FilterValue: null,
                isVisible: true
            },
            {
                Field: 'ServiceDate',
                Value: this.localize.getLocalizedString(
                    'No Service Date Within Last 18 Months'
                ),
                Key: true,
                Id: 6,
                Checked: false,
                FilterValue: null,
                isVisible: true
            },
            {
                Field: 'ServiceDate',
                Value: this.localize.getLocalizedString(
                    'No Service Date Within Last 24 Months'
                ),
                Key: true,
                Id: 7,
                Checked: false,
                FilterValue: null,
                isVisible: true
            },
            {
                Field: 'ServiceDate',
                Value: this.localize.getLocalizedString(
                    'No Service Date Within Last 36 Months'
                ),
                Key: true,
                Id: 8,
                Checked: false,
                FilterValue: null,
                isVisible: true
            },
            {
                Field: 'ServiceDate',
                Value: this.localize.getLocalizedString(
                    'No Service Date > than 36 Months'
                ),
                Key: true,
                Id: 9,
                Checked: false,
                FilterValue: null,
                isVisible: true
            }
        ];

        this.setDefaultServiceDateArray();

    }
    getActivityTypes() {
        this.localizedActivityTypes = this.staticData.ActivityTypes.map((type) => {
            return {
                Id: type.Id,
                Name: this.localize.getLocalizedString(type.Name)
            };
        });
        this.populateArrayWithAllID(
            this.localizedActivityTypes,
            this.filterModels[this.ActivityTypeName],
            'ActivityTypes',
            'Name',
            true,
            'Id',
            null,
            -1
        );
        this.filterModels[
            this.ActivityTypeName
        ].FilterDto = this.getSelectedItemIds(
            this.filterModels[this.ActivityTypeName].data
        );
    }

    getActivityActions() {
        const localizedActivityActions = this.staticData.ActivityActions.map((action) => {
            return {
                Id: action.Id,
                Name: this.localize.getLocalizedString(action.Name)
            };
        });

        this.populateArrayWithAllID(
            localizedActivityActions,
            this.filterModels[this.ActivityActionName],
            'ActivityActions',
            'Name',
            true,
            'Id',
            null,
            -1
        );
        this.filterModels[
            this.ActivityActionName
        ].FilterDto = this.getSelectedItemIds(
            this.filterModels[this.ActivityActionName].data
        );
    }

    getActivityAreas() {
        const filteredActivityAreas = this.staticData.ActivityAreas.filter((item) => {
            return item.Id !== 4; // PBI-399312 removed forms and Documents filter from the list
        });
        const localizedActivityAreas = filteredActivityAreas.map((area) => {
            return {
                Id: area.Id,
                Name: this.localize.getLocalizedString(area.Name)
            };
        });
        this.populateArrayWithAllID(
            localizedActivityAreas,
            this.filterModels[this.ActivityAreaName],
            'ActivityAreas',
            'Name',
            true,
            'Id',
            null,
            -1
        );
        this.filterModels[
            this.ActivityAreaName
        ].FilterDto = this.getSelectedItemIds(
            this.filterModels[this.ActivityAreaName].data
        );
    }

    getMasterPatientAlerts() {
        this.masterAlertService.get()
            .then((res) => {
                this.getMasterPatientAlertsSuccess(res);
            }, (err) => {
                this.getMasterPatientAlertsFailure();
            });
    }

    getMasterPatientAlertsSuccess(successResponse) {
        this.populateArrayWithAllAndNoneID(
            successResponse.Value,
            this.filterModels[this.MasterPatientAlertName],
            'MasterPatientAlerts',
            'Description',
            true,
            'MasterAlertId',
            null,
            this.emptyGuid,
            'Custom',
            this.GuidOne
        );
        this.filterModels[
            this.MasterPatientAlertName
        ].FilterDto = this.getSelectedItemIds(
            this.filterModels[this.MasterPatientAlertName].data
        );
    }

    getMasterPatientAlertsFailure() {
        this.toastrFactory.error(
            this.localize.getLocalizedString(
                'Failed to retrieve the list of patient alerts. Refresh the page to try again.'
            ),
            this.localize.getLocalizedString('Server Error')
        );
    }
    getMedicalHistoryAlerts() {
        this.medicalHistoryAlertsFactory.MedicalHistoryAlerts()
            .then((res) => {
                this.getMedicalHistoryAlertsSuccess(res);
            }, (err) => {
                this.getMedicalHistoryAlertsFailure();
            });
    }

    getMedicalHistoryAlertsSuccess(successResponse) {
        this.populateArrayWithAllID(
            successResponse.Value,
            this.filterModels[this.MedicalHistoryAlertName],
            'MedicalHistoryAlerts',
            'Description',
            true,
            'MedicalHistoryAlertId',
            null,
            -1
        );
        this.filterModels[
            this.MedicalHistoryAlertName
        ].FilterDto = this.getSelectedItemIds(
            this.filterModels[this.MedicalHistoryAlertName].data
        );
    }

    getMedicalHistoryAlertsFailure() {
        this.toastrFactory.error(
            this.localize.getLocalizedString(
                'Failed to retrieve the list of medical history alerts. Refresh the page to try again.'
            ),
            this.localize.getLocalizedString('Server Error')
        );
    }

    // Method to get the additional identifier list
    getAdditionalIdenfiers() {
        this.subscriptions.push(
            this.patientAdditionalIdentifierService.getPatientAdditionalIdentifiers()?.subscribe({
                next: (additionalIdentifiersList: SoarResponse<Array<PatientAdditionalIdentifiers>>) => this.additionalIdentifierGetSuccess(additionalIdentifiersList),
                error: () => this.additionalIdentifierGetFailure()
            }));
    }
    additionalIdentifierGetSuccess(res: SoarResponse<Array<PatientAdditionalIdentifiers>>) {
        if (this.filterModels[this.AdditionalIdentifiersName]) {
            this.populateArrayWithAllID(
                res.Value,
                this.filterModels[this.AdditionalIdentifiersName],
                'AdditionalIdentifiers',
                'Description',
                true,
                'MasterPatientIdentifierId',
                null,
                this.emptyGuid
            );
            this.filterModels[
                this.AdditionalIdentifiersName
            ].FilterDto = this.getSelectedItemIds(
                this.filterModels[this.AdditionalIdentifiersName].data
            );
        }
    }

    additionalIdentifierGetFailure() {
        this.toastrFactory.error(
            this.localize.getLocalizedString(
                'Failed to retrieve the list of patient additional identifiers. Refresh the page to try again.'
            ),
            this.localize.getLocalizedString('Error')
        );
    }
    setDefaultDisplayOptionsArray() {
        const value = this.isManagedCareOption
            ? this.localize.getLocalizedString('Managed Care')
            : this.localize.getLocalizedString('Include benefit plan');

        this.filterModels[this.DisplayOptionsName].data = [
            {
                Field: 'DisplayOptions',
                Value: value,
                Checked: !this.isManagedCareOption,
                Id: 1,
                isVisible: true,
                Key: true
            }
        ];

        if (this.userDefinedFilter.DisplayOptions) {
            if (this.userDefinedFilter.DisplayOptions.length > 0) {
                this.filterModels[this.DisplayOptionsName].data[0].Checked = true;
                this.filterModels[this.DisplayOptionsName].FilterString = value;
            } else {
                this.filterModels[this.DisplayOptionsName].data[0].Checked = false;
                this.filterModels[this.DisplayOptionsName].FilterString = this.localize.getLocalizedString('No filters applied');
            }

        } else {
            this.filterModels[this.DisplayOptionsName].FilterString = this
                .isManagedCareOption
                ? this.localize.getLocalizedString('No filters applied')
                : value;
        }
        this.filterModels[
            this.DisplayOptionsName
        ].FilterDto = this.getSelectedItemIds(
            this.filterModels[this.DisplayOptionsName].data
        );
    }
    // set the user location as the selected default location
    setDefaultLocationArray() {
        for (const ofcLocation of this.filterModels[this.LocationsName].data) {
            if (this.userDefinedFilter && this.userDefinedFilter.LocationIds) {
                ofcLocation.Checked = this.userDefinedLocationReset(ofcLocation.Id, this.userDefinedFilter.LocationIds, 'location');
                if ((this.userDefinedFilter.LocationIds.length + 1) === this.filterModels[this.LocationsName].data.length) {
                    this.filterModels[this.LocationsName].data[0].Checked = true;
                } else {
                    this.filterModels[this.LocationsName].data[0].Checked = false;
                }
            } else if (this.userDefinedFilter && this.userDefinedFilter.LocationId) {
                if (this.userDefinedFilter.LocationId === ofcLocation.Id) {
                    ofcLocation.Checked = true;
                    this.filterModels[this.LocationsName].DefaultFilterCount = 1;
                    this.appliedFiltersCount = this.defaultFilterCount;
                    this.filterModels[this.LocationsName].FilterString = ofcLocation.Value;
                    this.defaultLocString = this.filterModels[this.LocationsName].FilterString;
                } else {
                    ofcLocation.Checked = false;
                }
            } else {
                ofcLocation.Checked =
                    ofcLocation === this.defaultLoc ||
                        this.filterModels[this.LocationsName].DefaultAll
                        ? true
                        : false;
            }
        }
        if (this.userDefinedFilter && this.userDefinedFilter.LocationIds) {
            const defaultLocArray = this.getSelectedItemIds(
                this.filterModels[this.LocationsName].data
            );
            this.filterModels[this.LocationsName].FilterDto = defaultLocArray;
            this.filterModels[this.LocationsName].DefaultFilterCount = 2;
            this.filterModels[this.LocationsName].FilterString = this.defaultLocString;
        } else if (this.userDefinedFilter && this.userDefinedFilter.LocationId) {
            const defaultLocArray = this.getSelectedItemIds(
                this.filterModels[this.LocationsName].data
            );
            if (defaultLocArray.length > 0) {
                this.filterModels[this.LocationsName].FilterDto = defaultLocArray[0];
            } else {
                this.filterModels[this.LocationsName].FilterDto = -1;
            }
        } else {
            if (this.filterModels[this.LocationsName].DefaultAll) {
                this.setDefaultCheckBoxModelValues(
                    this.filterModels[this.LocationsName],
                    true
                );
            } else {
                if (!isNull(this.defaultLoc)) {
                    this.filterModels[
                        this.LocationsName
                    ].FilterString = this.defaultLoc.Value;
                    if (this.showSingleLocation) {
                        this.filterModels[this.LocationsName].FilterDto = this.defaultLoc.Id;
                    } else {
                        this.filterModels[this.LocationsName].FilterDto = [
                            this.defaultLoc.Id
                        ];
                    }
                    this.filterModels[this.LocationsName].DefaultFilterCount = 2;
                }
            }

        }
        if (
            isNullOrUndefined(this.filterModels[this.LocationsName].FilterString) ||
            this.filterModels[this.LocationsName].FilterString === ''
        ) {
            this.filterModels[
                this.LocationsName
            ].FilterString = this.localize.getLocalizedString('No filters applied');
        }
        this.filterModels[this.LocationsName].Reset = true;
    }

    // set the user location as the selected default location
    setDefaultDistributedLocationArray() {
        for (const ofcLocation of this.filterModels[this.DistributedLocationsName].data) {
            if (this.userDefinedFilter && this.userDefinedFilter.DistributedLocationIds) {
                ofcLocation.Checked = this.userDefinedLocationReset(ofcLocation.Id, this.userDefinedFilter.DistributedLocationIds, 'location');
                if ((this.userDefinedFilter.DistributedLocationIds.length + 1) === this.filterModels[this.DistributedLocationsName].data.length) {
                    this.filterModels[this.DistributedLocationsName].data[0].Checked = true;
                } else {
                    this.filterModels[this.DistributedLocationsName].data[0].Checked = false;
                }
            } else {
                ofcLocation.Checked =
                    ofcLocation === this.defaultLoc ||
                        this.filterModels[this.DistributedLocationsName].DefaultAll
                        ? true
                        : false;
            }
        }
        if (this.userDefinedFilter && this.userDefinedFilter.DistributedLocationIds) {
            const defaultLocArray = this.getSelectedItemIds(
                this.filterModels[this.DistributedLocationsName].data
            );
            this.filterModels[this.DistributedLocationsName].FilterDto = defaultLocArray;
            this.filterModels[this.DistributedLocationsName].DefaultFilterCount = 2;
            this.filterModels[this.DistributedLocationsName].FilterString = this.defaultLocString;
        } else {
            if (this.filterModels[this.DistributedLocationsName].DefaultAll) {
                this.setDefaultCheckBoxModelValues(
                    this.filterModels[this.DistributedLocationsName],
                    true
                );
            } else {
                if (!isNull(this.defaultDistributedLoc)) {
                    this.filterModels[
                        this.DistributedLocationsName
                    ].FilterString = this.defaultDistributedLoc.Value;

                    this.filterModels[this.DistributedLocationsName].FilterDto = [
                        this.defaultDistributedLoc.Id
                    ];
                    this.filterModels[this.DistributedLocationsName].DefaultFilterCount = 2;
                }
            }

        }
        if (
            isNullOrUndefined(this.filterModels[this.DistributedLocationsName].FilterString) ||
            this.filterModels[this.DistributedLocationsName].FilterString === ''
        ) {
            this.filterModels[
                this.DistributedLocationsName
            ].FilterString = this.localize.getLocalizedString('No filters applied');
        }
        this.filterModels[this.DistributedLocationsName].Reset = true;
    }

    userDefinedLocationReset(obj, data, type) {
        let locationChecked = false;
        _.find(data, (item) => {
            if (item === obj) {
                locationChecked = true;
                return;
            }
        });
        return locationChecked;
    }

    setDefaultCheckBoxModelValues(model, checkedValue, type?) {
        model.FilterString = this.setCheckedValueForAllItems(
            model.data,
            checkedValue, type
        );

        model.FilterDto = this.getSelectedItemIds(model.data);
        if (this.userDefinedFilter) {
            if (this.userDefinedFilter.ProviderUserIds && model.Name === 'Providers' && !this.providerCallFlag) {
                model.DefaultFilterCount = this.userDefinedFilter.ProviderUserIds.length;
            } else if (this.userDefinedFilter.ProviderIds && model.Name === 'Providers' && !this.providerCallFlag) {
                model.DefaultFilterCount = this.userDefinedFilter.ProviderIds.length;
            } else if (this.userDefinedFilter.UserIds && model.Name === 'Team Members' && !this.providerCallFlag) {
                model.DefaultFilterCount = this.userDefinedFilter.UserIds.length;
            } else if ((model.Name === 'Providers' || model.Name === 'Team Members') && this.providerCallFlag) {
                model.DefaultFilterCount = checkedValue ? model.data.length : 0;
            } else {
                model.DefaultFilterCount = model.FilterDto.length;
            }
        } else {
            model.DefaultFilterCount = checkedValue ? model.data.length : 0;
        }
        if (this.userDefinedFilter) {
            if (((model.Name === 'Providers' || model.Name === 'Team Members') && !this.providerCallFlag)
                || !(model.Name === 'Providers' || model.Name === 'Team Members')) {
                model.FilterString = this.buildFilterString(model);
            }
        }
    }
    setCheckedValueForAllItems(array, isChecked, type?) {
        let definedType;
        if (this.userDefinedFilter) {
            for (const provider of array) {
                if (provider.Field === 'Providers' && !this.providerCallFlag) {
                    if (this.userDefinedFilter.ProviderUserIds) {
                        definedType = this.userDefinedFilter.ProviderUserIds;
                    } else {
                        definedType = this.userDefinedFilter.ProviderIds;
                    }
                } else if (provider.Field === 'Providers' && this.providerCallFlag) {
                    for (const item of array) {
                        item.Checked = isChecked;
                    }
                    return isChecked
                        ? this.localize.getLocalizedString('All')
                        : this.localize.getLocalizedString('No filters applied');
                    definedType = '';
                } else if (provider.Field === 'ProviderType') {
                    provider.Id = provider.FilterValue;
                    definedType = this.userDefinedFilter.ProviderTypeIds;
                } else if (provider.Field === 'Impactions') {
                    definedType = this.userDefinedFilter.ImpactionTypes;
                } else if (provider.Field === 'Team Members' && !this.providerCallFlag) {
                    definedType = this.userDefinedFilter.UserIds;
                } else if (provider.Field === 'Team Members' && this.providerCallFlag) {
                    for (const item of array) {
                        item.Checked = isChecked;
                    }
                    return isChecked
                        ? this.localize.getLocalizedString('All')
                        : this.localize.getLocalizedString('No filters applied');
                    definedType = '';
                } else if (provider.Field === 'PatientGroupTypes') {
                    definedType = this.userDefinedFilter.PatientGroupTypeIds || this.userDefinedFilter.MasterPatientGroupIds;
                } else if (provider.Field === 'NegativeAdjustmentTypes') {
                    definedType = this.userDefinedFilter.NegativeAdjustmentTypeIds;
                } else if (provider.Field === 'PositiveAdjustmentTypes') {
                    definedType = this.userDefinedFilter.PositiveAdjustmentTypeIds;
                } else if (provider.Field === 'TransactionTypes') {
                    definedType = this.userDefinedFilter.TransactionTypes;
                } else if (provider.Field === 'ActivityTypes') {
                    definedType = this.userDefinedFilter.ActivityTypes;
                } else if (provider.Field === 'ActivityActions') {
                    definedType = this.userDefinedFilter.ActivityActions;
                } else if (provider.Field === 'ActivityAreas') {
                    definedType = this.userDefinedFilter.ActivityAreas;
                } else if (provider.Field === 'TreatmentPlan') {
                    definedType = this.userDefinedFilter.TreatmentPlan;
                } else if (provider.Field === 'TreatmentPlanStatus') {
                    definedType = this.userDefinedFilter.TreatmentPlanStatus;
                } else if (provider.Field === 'ServiceCodeStatus') {
                    definedType = this.userDefinedFilter.ServiceCodeStatus;
                } else if (provider.Field === 'Appointment Types') {
                    definedType = this.userDefinedFilter.AppointmentTypes;
                } else if (provider.Field === 'ServiceTypes') {
                    definedType = this.userDefinedFilter.ServiceTypeIds;
                } else if (provider.Field === 'InsurancePaymentTypes') {
                    definedType = this.userDefinedFilter.InsurancePaymentTypeIds;
                } else if (provider.Field === 'ReferralAffiliates') {
                    definedType = this.userDefinedFilter.ReferralAffiliateIds;
                } else if (provider.Field === 'PaymentTypes') {
                    definedType = this.userDefinedFilter.PaymentTypeIds;
                } else if (provider.Field === 'Carriers') {
                    definedType = this.userDefinedFilter.CarrierIds;
                } else if (provider.Field === 'FeeSchedules') {
                    definedType = this.userDefinedFilter.FeeScheduleIds;
                } else if (provider.Field === 'AdditionalIdentifiers') {
                    definedType = this.userDefinedFilter.AdditionalIdentifiers;
                } else if (provider.Field === 'MedicalHistoryAlerts') {
                    definedType = this.userDefinedFilter.MedicalHistoryAlertIds;
                } else if (provider.Field === 'MasterPatientAlerts') {
                    definedType = this.userDefinedFilter.FlagIds;
                } else if (provider.Field === 'Discount Types') {
                    definedType = this.userDefinedFilter.DiscountType;
                } else if (provider.Field === 'Insurances') {
                    definedType = this.userDefinedFilter.InsuranceTypes;
                } else if (provider.Field === 'ClaimStatus') {
                    definedType = this.userDefinedFilter.ClaimStatus;
                }
                // tslint:disable-next-line: max-line-length
                if (definedType && definedType.length > 0) {
                    provider.Checked = this.userDefinedLocationReset(provider.Id, definedType, provider.Field);
                } else if (definedType && definedType.length === 0) {
                    provider.Checked = false;
                }
            }
            if (array.length > 0 && definedType && definedType.length > 0) {
                if (array[0].Field === 'Providers' || array[0].Field === 'Team Members') {
                    array[0].Checked = true;
                    _.find(array, (item) => {
                        if (array[0].Id === '00000000-0000-0000-0000-000000000000' && array[0].Checked === true) {
                            if (!item.Checked && item.Id !== '00000000-0000-0000-0000-000000000000') {
                                array[0].Checked = false;
                                return;
                            }
                        }
                    });
                }
                if (array[0].Field === 'Carriers' && definedType[0] === '00000000-0000-0000-0000-000000000000') {
                    _.each(array, (item) => {
                        if (!item.Checked && item.Id !== '00000000-0000-0000-0000-000000000000') {
                            item.Checked = true;
                        }
                    });
                }
            }
        } else {
            for (const item of array) {
                item.Checked = isChecked;
            }
            return isChecked
                ? this.localize.getLocalizedString('All')
                : this.localize.getLocalizedString('No filters applied');
        }
    }

    buildFilterString(model) {
        if (
            model.data[0] &&
            model.data[0].Checked &&
            model.data[0].Value === this.localize.getLocalizedString('All')
        ) {
            return this.localize.getLocalizedString('All');
        } else {
            let filterString = this.localize.getLocalizedString('');
            for (const obj of model.data) {
                if (obj.Checked) {
                    filterString = filterString.concat(
                        obj.Value + ((model.Name === 'Providers' || model.Name === 'Team Members') ? this.localize.getLocalizedString('; ') : this.localize.getLocalizedString(', '))
                    );
                }
            }
            filterString = filterString.substring(0, filterString.length - 2);
            if (filterString === '') {
                filterString = this.localize.getLocalizedString('No filters applied');
            }
            return filterString;
        }
    }


    // create the default patient type status array
    setDefaultPatientStatusArray() {
        this.filterModels[this.PatientStatusName].data = [
            {
                Field: 'PatientStatus',
                Value: this.localize.getLocalizedString('All'),
                Key: true,
                Checked: true,
                Id: this.patientStatusId.All,
                FilterValue: null,
                isVisible: true
            },
            {
                Field: 'PatientStatus',
                Value: this.localize.getLocalizedString('Active'),
                Key: true,
                Checked: true,
                Id: this.patientStatusId.Active,
                FilterValue: null,
                isVisible: true
            },
            {
                Field: 'PatientStatus',
                Value: this.localize.getLocalizedString('Inactive'),
                Key: true,
                Checked: true,
                Id: this.patientStatusId.Inactive,
                FilterValue: null,
                isVisible: true
            }
        ];
        if (this.userDefinedFilter) {
            var patientTyepData = this.userDefinedFilter.PatientStatus ? this.userDefinedFilter.PatientStatus : this.userDefinedFilter.PatientType;
            let allFlagStatus = false;
            if (patientTyepData.length > 0) {
                _.find(patientTyepData, (all) => {
                    if (all === this.patientStatusId.All) {
                        allFlagStatus = true;
                        this.filterModels[
                            this.PatientStatusName
                        ].FilterString = this.localize.getLocalizedString('All');
                        this.filterModels[this.PatientStatusName].DefaultFilterCount = 3;
                        this.filterModels[this.PatientStatusName].Reset = false;
                        return;
                    }
                });
                if (!allFlagStatus) {
                    this.filterModels[this.PatientStatusName].data[0].Checked = false;
                    this.filterModels[this.PatientStatusName].data[1].Checked = false;
                    this.filterModels[this.PatientStatusName].data[2].Checked = false;
                    _.each(patientTyepData, (item) => {
                        if (item === this.patientStatusId.Active) {
                            this.filterModels[this.PatientStatusName].data[1].Checked = true;
                            this.filterModels[this.PatientStatusName].DefaultFilterCount = 1;
                            this.filterModels[this.PatientStatusName].FilterString =
                                this.localize.getLocalizedString('Active');
                        }
                        if (item === this.patientStatusId.Inactive) {
                            this.filterModels[this.PatientStatusName].data[2].Checked = true;
                            this.filterModels[this.PatientStatusName].DefaultFilterCount = 1;
                            this.filterModels[this.PatientStatusName].FilterString =
                                this.localize.getLocalizedString('Inactive');
                        }
                    });
                }
            } else {
                this.filterModels[this.PatientStatusName].data[0].Checked = false;
                this.filterModels[this.PatientStatusName].data[1].Checked = false;
                this.filterModels[this.PatientStatusName].data[2].Checked = false;
                this.filterModels[this.PatientStatusName].DefaultFilterCount = 0;
                this.filterModels[this.PatientStatusName].FilterString =
                    this.localize.getLocalizedString('No filters applied');
            }
        } else {
            this.filterModels[
                this.PatientStatusName
            ].FilterString = this.localize.getLocalizedString('All');
            this.filterModels[this.PatientStatusName].DefaultFilterCount = 3;
            this.filterModels[this.PatientStatusName].Reset = false;
            if (
                this.parentData.reportId ===
                this.parentData.reportIds.PatientsSeenReportId ||
                this.parentData.reportId ===
                this.parentData.reportIds
                    .NewPatientsByComprehensiveExamReportId ||
                this.parentData.reportId ===
                this.parentData.reportIds.PotentialDuplicatePatientsReportId
            ) {
                this.filterModels[
                    this.PatientStatusName
                ].data[0].Checked = this.filterModels[
                    this.PatientStatusName
                ].data[2].Checked = false;
                this.filterModels[this.PatientStatusName].DefaultFilterCount = 1;
                this.filterModels[
                    this.PatientStatusName
                ].FilterString = this.localize.getLocalizedString('Active');
            }
        }

        this.filterModels[
            this.PatientStatusName
        ].FilterDto = this.getSelectedItemIds(
            this.filterModels[this.PatientStatusName].data
        );
        if (this.parentData.reportId === 65 || this.parentData.reportId === 118) {
            this.originalFilterModels = cloneDeep(this.filterModels);
            this.checkComponentChildren.forEach((child) => {
                child.ngOnInit();
            });
        }
    }


    getTreatmentPlan() {
        this.filterModels[this.TreatmentPlanName].data = [
            {
                Field: 'TreatmentPlan',
                Value: this.localize.getLocalizedString('All'),
                Key: true,
                Id: 0,
                Checked: true,
                FilterValue: null,
                isVisible: true
            },
            {
                Field: 'TreatmentPlan',
                Value: this.localize.getLocalizedString('Plan'),
                Key: true,
                Id: 1,
                Checked: true,
                FilterValue: null,
                isVisible: true
            },
            {
                Field: 'TreatmentPlan',
                Value: this.localize.getLocalizedString('No Plan'),
                Key: true,
                Id: 2,
                Checked: true,
                FilterValue: null,
                isVisible: true
            }
        ];
        this.setDefaultCheckBoxModelValues(
            this.filterModels[this.TreatmentPlanName],
            true
        );
    }

    // populates the given array from the given result list
    populateArrayWithAllID(result, model, fieldName, valueKey, isChecked, idKey, filterValue, allID) {
        this.populateArrayWithAllAndNoneID(result, model, fieldName, valueKey, isChecked, idKey, filterValue, allID, null, null
        );
    }
    populateArrayWithAllAndNoneID(result, model, fieldName,
        valueKey, isChecked, idKey, filterValue, allID, noneValue, noneID) {
        let typeOfData;
        let checkedCount = 0;
        let noneIdValue = false;
        // let allDataValue = false;
        if (this.userDefinedFilter) {
            isChecked = false;
            if (fieldName === 'PatientGroupTypes') {
                typeOfData = this.userDefinedFilter.PatientGroupTypeIds || this.userDefinedFilter.MasterPatientGroupIds;
                if (noneID != null && noneValue != null) {
                    _.find(typeOfData, (item) => {
                        if (item === noneID) {
                            noneIdValue = true;
                            return;
                        }
                    });
                }
            } else if (fieldName === 'NegativeAdjustmentTypes') {
                typeOfData = this.userDefinedFilter.NegativeAdjustmentTypeIds;
            } else if (fieldName === 'PositiveAdjustmentTypes') {
                typeOfData = this.userDefinedFilter.PositiveAdjustmentTypeIds;
            } else if (fieldName === 'TransactionTypes') {
                typeOfData = this.userDefinedFilter.TransactionTypes;
            } else if (fieldName === 'ActivityActions') {
                typeOfData = this.userDefinedFilter.ActivityActions;
            } else if (fieldName === 'ActivityTypes') {
                typeOfData = this.userDefinedFilter.ActivityTypes;
            } else if (fieldName === 'ActivityAreas') {
                typeOfData = this.userDefinedFilter.ActivityAreas;
            } else if (fieldName === 'TreatmentPlanStatus') {
                typeOfData = this.userDefinedFilter.TreatmentPlanStatus;
            } else if (fieldName === 'ServiceCodeStatus') {
                typeOfData = this.userDefinedFilter.ServiceCodeStatus;
            } else if (fieldName === 'Appointment Types') {
                typeOfData = this.userDefinedFilter.AppointmentTypes;
            } else if (fieldName === 'ServiceTypes') {
                typeOfData = this.userDefinedFilter.ServiceTypeIds;
            } else if (fieldName === 'InsurancePaymentTypes') {
                typeOfData = this.userDefinedFilter.InsurancePaymentTypeIds;
            } else if (fieldName === 'ReferralAffiliates') {
                typeOfData = this.userDefinedFilter.ReferralAffiliateIds;
            } else if (fieldName === 'PaymentTypes') {
                typeOfData = this.userDefinedFilter.PaymentTypeIds;
            } else if (fieldName === 'Carriers') {
                typeOfData = this.userDefinedFilter.CarrierIds;
            } else if (fieldName === 'FeeSchedules') {
                typeOfData = this.userDefinedFilter.FeeScheduleIds;
            } else if (fieldName === 'AdditionalIdentifiers') {
                typeOfData = this.userDefinedFilter.AdditionalIdentifiers;
            } else if (fieldName === 'MedicalHistoryAlerts') {
                typeOfData = this.userDefinedFilter.MedicalHistoryAlertIds;
            } else if (fieldName === 'MasterPatientAlerts') {
                typeOfData = this.userDefinedFilter.FlagIds || this.userDefinedFilter.MasterAlertIds;;
                if (noneID != null && noneValue != null) {
                    _.find(typeOfData, (item) => {
                        if (item === noneID) {
                            noneIdValue = true;
                            return;
                        }
                    });
                }
            } else if (fieldName === 'Discount Types') {
                typeOfData = this.userDefinedFilter.DiscountType;
            } else if (fieldName === 'ClaimStatus') {
                typeOfData = this.userDefinedFilter.ClaimStatus;
            }
            else if (fieldName === 'TaxableServiceTypes') {
                typeOfData = this.userDefinedFilter?.TaxableServiceTypes;
            }
            _.find(typeOfData, (item) => {
                if (item === allID) {
                    isChecked = true;
                    checkedCount += 1;
                    return;
                }
            });

            if (this.scope.isNewReportingAPI === true && this.parentData.requestBodyProperties) {
                for (const i in this.parentData.requestBodyProperties) {
                    if (this.parentData.requestBodyProperties[i].DisplayAs === model.Name) {
                        var allItemName = this.parentData.requestBodyProperties[i].Name ? IncludeAllPropName[this.parentData.requestBodyProperties[i].Name] : "";
                        if (this.userDefinedFilter[allItemName] && Array.isArray(this.userDefinedFilter[allItemName]) && this.userDefinedFilter[allItemName].length > 0
                            && this.userDefinedFilter[allItemName][0] === true) {
                            noneIdValue = true;
                            isChecked = true;
                            checkedCount += 1;
                            break;
                        }
                    }
                }
            }
        }
        model.data.push({
            Field: fieldName,
            Value: this.localize.getLocalizedString('All'),
            Key: true,
            Checked: isChecked,
            isVisible: true,
            IsActive: true,
            SortOrder: 1,
            Id: allID
        });

        if (noneID != null && noneValue != null) {
            model.data.push({
                Field: fieldName,
                Value: this.localize.getLocalizedString(noneValue),
                Key: true,
                Checked: !this.userDefinedFilter ? isChecked : noneIdValue,
                isVisible: true,
                Id: noneID
            });
        }

        if (this.showInsurancePaymentType || this.showReferralAffiliate) {
            var orderedResult = result.sort((a, b) => a.Description - b.Description);
            orderedResult = orderedResult.sort((a, b) => b.IsActive - a.IsActive);
        } else {
            var orderedResult = result.sort((a, b) => a[valueKey] < b[valueKey] ? -1 : 1);
        }

        for (const item of orderedResult) {
            if (this.userDefinedFilter && !isChecked) {
                const isCheckedDynamic = this.userDefinedLocationReset(item[idKey], typeOfData, 'adjustments');
                if (isCheckedDynamic) {
                    checkedCount += 1;
                }
                model.data.push({
                    Field: fieldName,
                    Value: item[valueKey],
                    Key: true,
                    Checked: isCheckedDynamic,
                    Id: item[idKey],
                    IsActive: item.IsActive,
                    FilterValue: filterValue !== null ? item[filterValue] : null,
                    isVisible: model.data.length > 4 ? false : true
                });
            } else {
                model.data.push({
                    Field: fieldName,
                    Value: item[valueKey],
                    Key: true,
                    Checked: isChecked,
                    Id: item[idKey],
                    IsActive: item.IsActive,
                    FilterValue: filterValue !== null ? item[filterValue] : null,
                    isVisible: model.data.length > 4 ? false : true
                });
            }
        }
        if (this.userDefinedFilter && !isChecked) {
            model.FilterString = this.buildFilterString(model);
        } else if (this.userDefinedFilter && isChecked) {
            model.FilterString = this.localize.getLocalizedString('All');
        }
        if (this.userDefinedFilter && !isChecked) {
            this.defaultFilterCount += checkedCount;
            this.appliedFiltersCount = this.defaultFilterCount;
            model.DefaultFilterCount = checkedCount;
        } else {
            if (
                isChecked &&
                model.FilterId !== 'providers' &&
                model.FilterId !== 'users'
            ) {
                this.defaultFilterCount += model.data.length;
                this.appliedFiltersCount = this.defaultFilterCount;
            }
            model.DefaultFilterCount = isChecked ? model.data.length : 0;
            if (fieldName === 'Discount Types') {
                model.FilterString = this.localize.getLocalizedString('All');
            }
            if (fieldName === 'AdditionalIdentifiers' && sessionStorage.getItem('fromDashboard')) {
                model.FilterString = this.localize.getLocalizedString('All');
            }
        }
    }

    getServiceCodeSearchData() {
        // get all service codes from server.
        Promise.resolve(this.referenceDataService.getData(
            this.referenceDataService.entityNames.serviceCodes
        )).then((data => {
            this.filterModels[
                this.ServiceCodeName
            ].SearchMaterial = data;
        }));
    }

    getServiceCodesSearchData() {
        // get all service codes from server.
        Promise.resolve(this.referenceDataService.getData(
            this.referenceDataService.entityNames.serviceCodes
        )).then((data => {
            this.filterModels[
                this.ServiceCodeName
            ].SearchMaterial = data;
        }));
    }

    setDefaultCheckboxFilterValues(filterModel, isAllChecked, type?) {
        this.setDefaultCheckBoxModelValues(filterModel, isAllChecked, type);
        filterModel.Reset = true;
    }  // functionality for pressing the apply filters button
    applyFilters() {
        if (this.isValidDates && this.isValid) {
            // call parent method
            if (this.scope.isNewReportingAPI === true) {
                this.updateFiltersForNewReportingAPI(this.filterModels);
            }

            this.getReport.emit(true);
        }
    }
    collapseFilters() {
        angular.element(
            'btnExpandCollapse'
        ).innerHTML = this.localize.getLocalizedString('Expand All');
        this.textExpandCollapse = 'Expand All';
        angular.element('.panel-collapse.in').collapse('hide');
        this.classExpandCollapse = 'btn soar-link icon-button font-14 expand-all';
    }
    expandFilters() {
        angular.element(
            'btnExpandCollapse'
        ).innerHTML = this.localize.getLocalizedString('Collapse All');
        this.textExpandCollapse = 'Collapse All';
        this.expandCollapse = true;
        angular.element('.panel-collapse:not(".in")').collapse('show');
        this.classExpandCollapse =
            'btn soar-link icon-button font-14 collapse-all';
    }  // functionality for pressing the reset filters button
    resetFilters() {
        if (this.fromType !== 'fromReports') {
            sessionStorage.setItem('dateType', 'fromReports');
            this.fromType = sessionStorage.getItem('dateType');
            this.getUserDefinedFilters();
            this.callChildren = true;
            this.checkModelValidity(true);
        } else if (this.parentData.reportId === 15 || this.parentData.reportId === 120) {
            this.getUserDefinedFilters();
            this.callChildren = true;
            this.checkModelValidity(true);
        } else {
            this.checkComponentChildren.forEach((child) => {
                child.resetMethod();
            });
            this.radioComponentChildren.forEach((child) => {
                child.resetMethod();
            });
            this.dateComponentChildren.forEach((child) => {
                child.resetMethod();
            });

            if (this.showPatients) {
                this.patientComponent.resetMethod();
            }

            if (this.showAgingOption) {
                this.numaricComponent.numericReset();
            }
            if (this.showServiceCode) {
                this.searchComponent.resetMethod();
            }
            if (this.showServiceCodes) {
                this.reportServiceCodeFilterComponent.resetMethod();
            }
            if (this.showReferralSources) {
                if (this.showNewReferralFilter === true) {
                    this.PatientRefBetaComponent.initialMethod();
                } else {
                    this.PatientRefComponent.initialMethod();
                }
            }
            // *end child methods
            this.checkModelValidity(true);
            this.collapseFilters();
            if (this.showMultipleLocation || this.showSingleLocation) { this.setDefaultLocationArray(); }
            if (this.showDistributedLocation) { this.setDefaultDistributedLocationArray(); }
            if (this.showCarriers) { this.setDefaultCheckboxFilterValues(this.filterModels[this.CarrierName], true); }
            if (this.showPayerId) { this.setDefaultPayerIdArray(); }
            if (this.showPatientStatus) { this.setDefaultPatientStatusArray(); }
            if (this.showTreatmentPlanStatus) { this.setDefaultCheckboxFilterValues(this.filterModels[this.TreatmentPlanStatusName], true); }
            if (this.showServiceCodeStatus) { this.setDefaultCheckboxFilterValues(this.filterModels[this.ServiceCodeStatusName], true); }
            if (this.showDateRange) { this.filterModels[this.StartDateName].Reset = true; }
            if (this.showOrigDateRange) { this.filterModels[this.StartDateName].Reset = true; }
            if (this.showAdditionalIdentifiers) { this.setDefaultCheckboxFilterValues(this.filterModels[this.AdditionalIdentifiersName], true); }
            if (this.showFeeSchedules) { this.setDefaultCheckboxFilterValues(this.filterModels[this.FeeSchedulesName], true); }

            if (this.showDisplayOptions) {
                this.setDefaultDisplayOptionsArray();
                if (this.isManagedCareOption) {
                    this.setDefaultCheckboxFilterValues(this.filterModels[this.DisplayOptionsName], false);
                } else {
                    this.setDefaultCheckboxFilterValues(this.filterModels[this.DisplayOptionsName], true);
                }
            }
            if (this.showReferralSources) { this.setDefaultReferralSources(); }
            if (this.showTransactionTypes) { this.setDefaultCheckboxFilterValues(this.filterModels[this.TransactionTypeName], true); }
            if (this.showServiceTypes) { this.setDefaultCheckboxFilterValues(this.filterModels[this.ServiceTypeName], true); }
            if (this.showPatientGroupTypes) { this.setDefaultCheckboxFilterValues(this.filterModels[this.PatientGroupTypeName], true); }
            if (this.showServiceCode) { this.setDefaultServiceCode(); }
            if (this.showServiceCodes) { this.setDefaultServiceCodes(); }
            if (this.showNegativeAdjustmentTypes) { this.setDefaultCheckboxFilterValues(this.filterModels[this.NegativeAdjustmentTypeName], true); }
            if (this.showPositiveAdjustmentTypes) { this.setDefaultCheckboxFilterValues(this.filterModels[this.PositiveAdjustmentTypeName], true); }
            if (this.showInsurancePaymentType) { this.setDefaultCheckboxFilterValues(this.filterModels[this.InsurancePaymentTypeName], true); }
            if (this.showReferralAffiliate) { this.setDefaultCheckboxFilterValues(this.filterModels[this.ReferralAffiliateName], true); }
            if (this.showPaymentType) { this.setDefaultCheckboxFilterValues(this.filterModels[this.PaymentTypeName], true); }
            if (this.showMonths) { this.setDefaultMonthsArray(); }
            if (this.showImpactions) { this.setDefaultCheckboxFilterValues(this.filterModels[this.ImpactionName], true); }
            if (this.showAppointmentTypes) { this.setDefaultCheckboxFilterValues(this.filterModels[this.AppointmentTypeName], true); }
            if (this.showViewTransactionsBy) { this.setDefaultViewTransactionsByArray(); }
            if (this.showViewTransactionsByOrder) { this.setDefaultViewTransactionsByArray(); }
            if (this.showServiceDate) { this.setDefaultServiceDateArray(); }
            if (this.showDiscountTypes) { this.setDefaultCheckboxFilterValues(this.filterModels[this.DiscountTypeName], true); }
            if (this.showActivityTypes) { this.setDefaultCheckboxFilterValues(this.filterModels[this.ActivityTypeName], true); }
            if (this.showActivityActions) { this.setDefaultCheckboxFilterValues(this.filterModels[this.ActivityActionName], true); }
            if (this.showActivityAreas) { this.setDefaultCheckboxFilterValues(this.filterModels[this.ActivityAreaName], true); }
            if (this.showPatients) { this.setDefaultPatients(); }
            if (this.showCollectionDateRange) { this.filterModels[this.CollectionStartDateName].Reset = true; }
            if (this.showProductionDateRange) { this.filterModels[this.ProductionStartDateName].Reset = true; }
            if (this.showMasterPatientAlerts) { this.setDefaultCheckboxFilterValues(this.filterModels[this.MasterPatientAlertName], true); }
            if (this.showMedicalHistoryAlerts) { this.setDefaultCheckboxFilterValues(this.filterModels[this.MedicalHistoryAlertName], true); }
            if (this.showTreatmentPlan) { this.setDefaultCheckboxFilterValues(this.filterModels[this.TreatmentPlanName], true); }
            if (this.showAging) { this.setDefaultAgingFilter(); }
            if (this.showAgingOption) { this.setDefaultAgingOptionFilter(); }
            if (this.showClaimTypes) { this.setDefaultClaimTypesArray(); }
            if (this.showClaimStatus) { this.setDefaultClaimStatusArray(); }
            if (this.showReportView) { this.setDefaultReportViewOption(); }
            if (this.ShowInsuranceAdjustmentMode) { this.setDefaultAdjustmentTypeOption(); }
            if (this.showViewDeletedTransaction) { this.setViewDeletedTransaction(); }
            if (this.showInsurance) { this.setDefaultCheckboxFilterValues(this.filterModels[this.InsuranceName], true); }
            this.appliedFiltersCount = this.defaultFilterCount;
            // The following filters are not included in the default filter count due to being location aware
            if (this.showProviders) {
                this.setDefaultProvidersArray();
                this.filterModels[this.ProvidersName].DefaultFilterCount = 0;
            }
            if (this.showUsers) {
                this.filterModels[this.UsersName].DefaultFilterCount = 0;
            }
            if (this.showUsers || this.showProviders) {
                this.providerCallFlag = false;
                this.updateFilteredList(); // This will set the team members and providers according to the selected locations
            }
            if (this.showTaxableServiceTypes) {
                this.setDefaultCheckboxFilterValues(this.filterModels[this.TaxableServiceTypeName], true);
            }
        }
        this.providerCallFlag = true;
        this.buttonDisabled = true;
    }
    // set all providers to checked by default
    setDefaultProvidersArray() {
        this.filterModels[this.ProvidersName].FilterFilterModel.data = [
            {
                Field: 'ProviderType',
                Value: this.localize.getLocalizedString('All'),
                Key: true,
                Checked: true,
                FilterValue: 0,
                isVisible: true
            },
            {
                Field: 'ProviderType',
                Value: this.localize.getLocalizedString('Assistant'),
                Key: true,
                Checked: true,
                FilterValue: 3,
                isVisible: true
            },
            {
                Field: 'ProviderType',
                Value: this.localize.getLocalizedString('Dentist'),
                Key: true,
                Checked: true,
                FilterValue: 1,
                isVisible: true
            },
            {
                Field: 'ProviderType',
                Value: this.localize.getLocalizedString('Hygienist'),
                Key: true,
                Checked: true,
                FilterValue: 2,
                isVisible: true
            },
            {
                Field: 'ProviderType',
                Value: this.localize.getLocalizedString('Other'),
                Key: true,
                Checked: true,
                FilterValue: 5,
                isVisible: true
            }
        ];

        if (this.userDefinedFilter && this.userDefinedFilter.ProviderTypeIds) {
            this.filterModels[
                this.ProvidersName
            ].FilterFilterModel.DefaultFilterCount = this.userDefinedFilter.ProviderTypeIds;
            this.setDefaultCheckboxFilterValues(
                this.filterModels[this.ProvidersName].FilterFilterModel,
                true, 'formProviderTypes'
            );
        } else {
            this.filterModels[
                this.ProvidersName
            ].FilterFilterModel.DefaultFilterCount = 5;
            this.setDefaultCheckboxFilterValues(
                this.filterModels[this.ProvidersName].FilterFilterModel,
                true
            );
            this.filterModels[this.ProvidersName].FilterFilterModel.FilterDto = ['All', 'Assistant', 'Dentist', 'Hygienist', 'Other'];
        }
    }
    // set the payer id as the selected default payer id
    setDefaultPayerIdArray() {
        this.filterModels[this.PayerIdName].data = [
            {
                Field: 'Payer ID',
                Value: this.localize.getLocalizedString('All Payer IDs'),
                Key: true,
                Id: 'All',
                Checked: true,
                FilterValue: null,
                isVisible: true
            },
            {
                Field: 'Payer ID',
                Value: this.localize.getLocalizedString('No Payer ID Assigned'),
                Key: true,
                Id: 'None',
                Checked: false,
                FilterValue: null,
                isVisible: true
            },
            {
                Field: 'Payer ID',
                Value: this.localize.getLocalizedString('Specific Payer ID:'),
                Key: true,
                Id: '',
                Checked: false,
                FilterValue: null,
                isVisible: true,
                ErrorMsg: this.localize.getLocalizedString(
                    'Payer Id must be between 2 to 10 alphanumeric characters'
                )
            }
        ];
        if (this.userDefinedFilter) {
            if (this.userDefinedFilter.PayerId === 'All') {
                this.filterModels[this.PayerIdName].data[0].Checked = true;
                this.filterModels[this.PayerIdName].data[1].Checked = false;
                this.filterModels[this.PayerIdName].data[2].Checked = false;
                this.filterModels[
                    this.PayerIdName
                ].FilterString = this.localize.getLocalizedString('All Payer IDs');
                this.filterModels[this.PayerIdName].FilterDto = this.userDefinedFilter.PayerId;
            } else if (this.userDefinedFilter.PayerId === 'None') {
                this.filterModels[this.PayerIdName].data[0].Checked = false;
                this.filterModels[this.PayerIdName].data[2].Checked = false;
                this.filterModels[this.PayerIdName].data[1].Checked = true;
                this.filterModels[
                    this.PayerIdName
                ].FilterString = this.localize.getLocalizedString('No Payer ID Assigned');
                this.filterModels[this.PayerIdName].FilterDto = this.userDefinedFilter.PayerId;
            } else {
                this.filterModels[this.PayerIdName].data[0].Checked = false;
                this.filterModels[this.PayerIdName].data[1].Checked = false;
                this.filterModels[this.PayerIdName].data[2].Checked = true;
                this.filterModels[this.PayerIdName].data[2].Id = this.userDefinedFilter.PayerId;
                this.filterModels[this.PayerIdName].FilterString = this.filterModels[this.PayerIdName].data[2].Value;
                this.filterModels[this.PayerIdName].FilterDto = this.userDefinedFilter.PayerId;
            }
        } else {
            this.filterModels[
                this.PayerIdName
            ].FilterString = this.localize.getLocalizedString('All Payer IDs');
            this.filterModels[this.PayerIdName].FilterDto = this.getSelectedItemIds(
                this.filterModels[this.PayerIdName].data
            )[0];
        }
    }
    setDefaultAgingFilter() {
        this.filterModels[this.AgingName].data = [
            { Field: 'Aging', Value: this.localize.getLocalizedString('All'), Key: true, Id: 0, Checked: true, FilterValue: null, isVisible: true },
            { Field: 'Aging', Value: this.localize.getLocalizedString('0-30 Days'), Key: true, Id: 1, Checked: false, FilterValue: null, isVisible: true },
            { Field: 'Aging', Value: this.localize.getLocalizedString('31-60 Days'), Key: true, Id: 2, Checked: false, FilterValue: null, isVisible: true },
            { Field: 'Aging', Value: this.localize.getLocalizedString('61-90 Days'), Key: true, Id: 3, Checked: false, FilterValue: null, isVisible: true },
            { Field: 'Aging', Value: this.localize.getLocalizedString('> 90 Days'), Key: true, Id: 4, Checked: false, FilterValue: null, isVisible: true }
        ];
        this.filterModels[this.AgingName].FilterString = this.localize.getLocalizedString('All');
    }
    setDefaultAgingOptionFilter() {
        if (this.userDefinedFilter.AgingOption) {
            var FirstVal;
            var SecondVal;
            this.angingOption = this.userDefinedFilter.AgingOption.OptionType;
            this.filterModels[this.AgingOptionName].data = [
                { Field: 'AgingOption', Value: this.localize.getLocalizedString('All'), Key: true, Id: 1, Checked: false, FilterValue: null, isVisible: true, Units: this.localize.getLocalizedString('Days Outstanding'), OptionType: 1, FirstValue: FirstVal, SecondValue: SecondVal },
                { Field: 'AgingOption', Value: this.localize.getLocalizedString('Less Than'), Key: true, Id: 2, Checked: false, FilterValue: null, isVisible: true, Units: this.localize.getLocalizedString('Days Outstanding'), OptionType: 2, FirstValue: FirstVal, SecondValue: SecondVal },
                { Field: 'AgingOption', Value: this.localize.getLocalizedString('Greater Than'), Key: true, Id: 3, Checked: false, FilterValue: null, isVisible: true, Units: this.localize.getLocalizedString('Days Outstanding'), OptionType: 3, FirstValue: FirstVal, SecondValue: SecondVal },
                { Field: 'AgingOption', Value: this.localize.getLocalizedString('Between'), Key: true, Id: 4, Checked: false, FilterValue: null, isVisible: true, Units: this.localize.getLocalizedString('Days Outstanding'), OptionType: 4, FirstValue: FirstVal, SecondValue: SecondVal }
            ];
            if (this.userDefinedFilter.AgingOption.OptionType === 1) {
                this.filterModels[this.AgingOptionName].data[0].Checked = true;
            } else if (this.userDefinedFilter.AgingOption.OptionType === 2) {
                this.filterModels[this.AgingOptionName].data[1].FirstValue = this.userDefinedFilter.AgingOption.FirstValue;
                this.filterModels[this.AgingOptionName].data[1].Checked = true;
            } else if (this.userDefinedFilter.AgingOption.OptionType === 3) {
                this.filterModels[this.AgingOptionName].data[2].Checked = true;
                this.filterModels[this.AgingOptionName].data[2].FirstValue = this.userDefinedFilter.AgingOption.FirstValue;
            } else if (this.userDefinedFilter.AgingOption.OptionType === 4) {
                this.filterModels[this.AgingOptionName].data[3].Checked = true;
                this.filterModels[this.AgingOptionName].data[3].FirstValue = this.userDefinedFilter.AgingOption.FirstValue;
                this.filterModels[this.AgingOptionName].data[3].SecondValue = this.userDefinedFilter.AgingOption.SecondValue;
            }
        } else {
            this.angingOption = '';
            this.filterModels[this.AgingOptionName].data = [
                {
                    Field: 'AgingOption', Value: this.localize.getLocalizedString('All'), Key: true, Id: 1, Checked: true, FilterValue: null, isVisible: true,
                    Units: this.localize.getLocalizedString('Days Outstanding'), OptionType: 1, FirstValue: FirstVal, SecondValue: SecondVal
                },
                { Field: 'AgingOption', Value: this.localize.getLocalizedString('Less Than'), Key: true, Id: 2, Checked: false, FilterValue: null, isVisible: true, Units: this.localize.getLocalizedString('Days Outstanding'), OptionType: 2, FirstValue: FirstVal, SecondValue: SecondVal },
                { Field: 'AgingOption', Value: this.localize.getLocalizedString('Greater Than'), Key: true, Id: 3, Checked: false, FilterValue: null, isVisible: true, Units: this.localize.getLocalizedString('Days Outstanding'), OptionType: 3, FirstValue: FirstVal, SecondValue: SecondVal },
                { Field: 'AgingOption', Value: this.localize.getLocalizedString('Between'), Key: true, Id: 4, Checked: false, FilterValue: null, isVisible: true, Units: this.localize.getLocalizedString('Days Outstanding'), OptionType: 4, FirstValue: FirstVal, SecondValue: SecondVal }
            ];
        }

    } setDefaultReferralSources() {
        if (this.showNewReferralFilter === false) {
            if (this.userDefinedFilter && this.userDefinedFilter.selectedReferralType
                && this.userDefinedFilter.selectedReferralType.name !== 'All Sources') {
                this.filterModels[this.ReferralSourceIdName] = {
                    Name: this.localize.getLocalizedString('Referral Sources'),
                    selectedAll: false,
                    selectedPatients: [],
                    selectedAllPatients: this.userDefinedFilter.selectedAllPatients,
                    selectedReferralSources: [],
                    selectedReferralType: this.userDefinedFilter.selectedReferralType,
                    totalSelected: (this.userDefinedFilter.selectedReferralType.name === 'Other' || this.userDefinedFilter.selectedReferralType.name === 'External Sources') ?
                        this.userDefinedFilter.ReferralSourceIds.length
                        : this.userDefinedFilter.ReferringPatientIds.length,
                    ReferringPatientIdFilterDto: this.userDefinedFilter.ReferringPatientIds,
                    ReferringSourceIdFilterDto: this.userDefinedFilter.ReferralSourceIds
                };
                this.filterModels[
                    this.ReferralSourceIdName
                ].FilterString = this.localize.getLocalizedString('All');
            } else {
                this.filterModels[this.ReferralSourceIdName] = {
                    Name: this.localize.getLocalizedString('Referral Sources'),
                    selectedAll: true,
                    selectedPatients: [],
                    selectedAllPatients: [],
                    selectedExternalProviders: [],
                    selectedReferralSources: [],
                    totalSelected: 1,
                    ReferringPatientIdFilterDto: [this.emptyGuid],
                    ReferringSourceIdFilterDto: [this.emptyGuid],
                    selectedReferralType: { name: 'All Sources', value: null }
                };
                this.filterModels[
                    this.ReferralSourceIdName
                ].FilterString = this.localize.getLocalizedString('All');
            }
        } else {
            if (this.userDefinedFilter && this.userDefinedFilter.selectedReferralType
                && !this.userDefinedFilter.selectedReferralType?.includes(null)) {

                ['ReferringPatientIds', 'ReferralSourceIds', 'ExternalProviderIds'].forEach(field => {
                    if (!this.userDefinedFilter[field]) {
                        this.userDefinedFilter[field] = [this.emptyGuid];
                    }
                });
                this.filterModels[this.ReferralSourceIdName] = {
                    Name: this.localize.getLocalizedString('Referral Categories'),
                    selectedAll: false,
                    selectedPatients: [],
                    selectedAllPatients: this.userDefinedFilter.selectedAllPatients,
                    selectedExternalProviders: [],
                    selectedAllExternalProviders: this.userDefinedFilter.selectedAllExternalProviders,
                    selectedReferralSources: [],
                    selectedReferralType: this.userDefinedFilter.selectedReferralType,
                    totalSelected: this.userDefinedFilter.selectedReferralType.includes(1) ?
                        this.userDefinedFilter.ReferralSourceIds.length
                        : this.userDefinedFilter.ReferringPatientIds.length,
                    ExternalProviderIdName: "ExternalProviderIds",
                    FilterString: "All",
                    ReferralPatientIdName: "ReferringPatientIds",
                    ReferralSourceIdName: "ReferralSourceIds",
                    ReferringPatientIdFilterDto: this.userDefinedFilter.ReferringPatientIds,
                    ReferringSourceIdFilterDto: this.userDefinedFilter.ReferralSourceIds,
                    ExternalProviderIdFilterDto: this.userDefinedFilter.ExternalProviderIds,
                    ReferringPatientIds: this.userDefinedFilter.ReferringPatientIds,
                    ReferralSourceIds: this.userDefinedFilter.ReferralSourceIds,
                    ExternalProviderIds: this.userDefinedFilter.ExternalProviderIds,
                };
                this.filterModels[
                    this.ReferralSourceIdName
                ].FilterString = this.localize.getLocalizedString('All');
            } else {
                this.filterModels[this.ReferralSourceIdName] = {
                    Name: this.localize.getLocalizedString('Referral Categories'),
                    selectedAll: true,
                    selectedPatients: [],
                    selectedAllPatients: [],
                    selectedExternalProviders: [],
                    selectedAllExternalProviders: [],
                    selectedReferralSources: [],
                    totalSelected: 1,
                    ExternalProviderIdName:"ExternalProviderIds",
                    FilterString: "All",
                    ReferralPatientIdName: "ReferringPatientIds",
                    ReferralSourceIdName: "ReferralSourceIds",
                    ReferringPatientIdFilterDto: [this.emptyGuid],
                    ReferringSourceIdFilterDto: [this.emptyGuid],
                    ExternalProviderIdFilterDto: [this.emptyGuid],
                    ReferralSourceIds:[this.emptyGuid],
                    ExternalProviderIds:[this.emptyGuid],
                    ReferringPatientIds:[this.emptyGuid],
                };
                this.filterModels[
                    this.ReferralSourceIdName
                ].FilterString = this.localize.getLocalizedString('All');
            }
        }

    }
    sortedDtos() {
        const sortedPatinets = this.filterModels.ReferralSourceIds.ReferringPatientIdFilterDto.sort();
        this.filterModels.ReferralSourceIds.ReferringPatientIdFilterDto = sortedPatinets;
        const origPatientDto = this.originalFilterModels.ReferralSourceIds.ReferringPatientIdFilterDto.sort();
        this.originalFilterModels.ReferralSourceIds.ReferringPatientIdFilterDto = origPatientDto;
        const sortedReferId = this.filterModels.ReferralSourceIds.ReferringSourceIdFilterDto.sort();
        this.filterModels.ReferralSourceIds.ReferringSourceIdFilterDto = sortedReferId;
        const origReferIftDto = this.originalFilterModels.ReferralSourceIds.ReferringSourceIdFilterDto.sort();
        this.originalFilterModels.ReferralSourceIds.ReferringSourceIdFilterDto = origReferIftDto;
        if (this.showNewReferralFilter === true) {
            const sortedExternalProviders = this.filterModels.ReferralSourceIds.ExternalProviderIdFilterDto.sort();
            this.filterModels.ReferralSourceIds.ExternalProviderIdFilterDto = sortedExternalProviders;
            const origExternalProviderDto = this.originalFilterModels.ReferralSourceIds.ExternalProviderIdFilterDto.sort();
            this.originalFilterModels.ReferralSourceIds.ExternalProviderIdFilterDto = origExternalProviderDto;
        }
    }
    setDefaultServiceCode() {
        if (this.userDefinedFilter.ServiceCodeId && this.userDefinedFilter.ServiceCodeId !== this.emptyGuid) {
            // ServiceCode
            this.filterModels[this.ServiceCodeName].FilterDto = this.userDefinedFilter.ServiceCodeId;
            this.filterModels[this.ServiceCodeName].FilterString = this.userDefinedFilter.ServiceCode;
            this.filterModels[this.ServiceCodeName].Reset = true;
        } else {
            this.filterModels[this.ServiceCodeName].Reset = true;
            this.filterModels[this.ServiceCodeName].FilterString = this.includeAll
                ? this.localize.getLocalizedString('All')
                : this.localize.getLocalizedString('No filters applied');
            this.filterModels[this.ServiceCodeName].FilterDto = this.emptyGuid;
        }
    }

    setDefaultServiceCodes() {
        if (this.userDefinedFilter.ServiceCodeId && this.userDefinedFilter.ServiceCodeId !== this.emptyGuid) {
            // ServiceCode
            this.filterModels[this.ServiceCodeName].FilterDto = this.userDefinedFilter.ServiceCodeId;
            this.filterModels[this.ServiceCodeName].FilterString = this.userDefinedFilter.ServiceCode;
            this.filterModels[this.ServiceCodeName].Reset = true;
        } else {
            this.filterModels[this.ServiceCodeName].Reset = true;
            this.filterModels[this.ServiceCodeName].FilterString = this.includeAll
                ? this.localize.getLocalizedString('All')
                : this.localize.getLocalizedString('No filters applied');
            this.filterModels[this.ServiceCodeName].FilterDto = this.emptyGuid;
        }
    }

    setDefaultMonthsArray() {
        if (this.filterModels[this.MonthName].data) {
            if (this.userDefinedFilter.Months) {
                let allMonthsFlag = true;
                this.setMonthCheckedValues(
                    this.filterModels[this.MonthName].data,
                    false
                );
                _.find(this.userDefinedFilter.Months, (id) => {
                    if (id === 0) {
                        allMonthsFlag = false;
                        return;
                    }
                });
                if (allMonthsFlag) {
                    _.each(this.filterModels[this.MonthName].data, (month) => {
                        _.each(this.userDefinedFilter.Months, (id) => {
                            if (month.Id === id) {
                                month.Checked = true;
                            }
                        });
                    });
                    this.filterModels[this.MonthName].FilterString = this.getFilterString(
                        this.filterModels[this.MonthName].data
                    );
                } else {
                    this.setMonthCheckedValues(
                        this.filterModels[this.MonthName].data,
                        true
                    );
                    this.filterModels[this.MonthName].FilterString = this.localize.getLocalizedString('All');
                }
                this.filterModels[this.MonthName].DefaultFilterCount = this.userDefinedFilter.Months.length;
            } else {
                // Only run if data is instantiated from getMonths()
                //  handle overflow months
                const todayDate = new Date();
                const thisMonth = todayDate.getMonth() + 1;
                let nextMonth = todayDate.getMonth() + 2;
                let thirdMonth = todayDate.getMonth() + 3;
                if (thisMonth === 12) {
                    nextMonth = 1;
                    thirdMonth = 2;
                } else if (thisMonth === 11) {
                    thirdMonth = 1;
                }

                this.setCheckedValueForAllItems(
                    this.filterModels[this.MonthName].data,
                    false
                );
                this.filterModels[this.MonthName].data[thisMonth].Checked = true;
                this.filterModels[this.MonthName].data[nextMonth].Checked = true;
                this.filterModels[this.MonthName].data[thirdMonth].Checked = true;
                this.filterModels[this.MonthName].DefaultFilterCount = 3;
                this.filterModels[this.MonthName].FilterString = this.getFilterString(
                    this.filterModels[this.MonthName].data
                );
            }
        }

        this.filterModels[this.MonthName].FilterDto = this.getSelectedItemIds(
            this.filterModels[this.MonthName].data
        );
        this.filterModels[this.MonthName].Reset = true;
    }

    setMonthCheckedValues(data, isChecked) {
        _.each(data, (val) => {
            val.Checked = isChecked;
        });
    }

    setDefaultClaimTypesArray() {
        this.filterModels[this.ClaimTypesName].data = [
            {
                Field: 'ClaimTypes',
                Value: this.localize.getLocalizedString('All'),
                Key: true,
                Checked: true,
                Id: 1,
                FilterValue: null,
                isVisible: true
            },
            {
                Field: 'ClaimTypes',
                Value: this.localize.getLocalizedString('Claims'),
                Key: true,
                Checked: true,
                Id: 2,
                FilterValue: null,
                isVisible: true
            },
            {
                Field: 'ClaimTypes',
                Value: this.localize.getLocalizedString('Predeterminations'),
                Key: true,
                Checked: true,
                Id: 3,
                FilterValue: null,
                isVisible: true
            }
        ];
        if (this.userDefinedFilter && this.userDefinedFilter.ClaimType && this.userDefinedFilter.ClaimType.length > 0) {
            this.setMonthCheckedValues(this.filterModels[this.ClaimTypesName].data, false);
            let claimTypeFlag = true;
            _.find(this.userDefinedFilter.ClaimType, (id) => {
                if (id === 1) {
                    claimTypeFlag = false;
                    return;
                }
            });
            if (claimTypeFlag) {
                let claimString = '';
                _.each(this.filterModels[this.ClaimTypesName].data, (val) => {
                    _.each(this.userDefinedFilter.ClaimType, (id) => {
                        if (val.Id === id) {
                            val.Checked = true;
                            claimString = val.Value;
                        }
                    });
                });
                this.filterModels[
                    this.ClaimTypesName
                ].FilterString = claimString;
            } else {
                this.setMonthCheckedValues(this.filterModels[this.ClaimTypesName].data, true);
                this.filterModels[
                    this.ClaimTypesName
                ].FilterString = this.localize.getLocalizedString('All');
            }
            this.filterModels[this.ClaimTypesName].DefaultFilterCount = this.userDefinedFilter.ClaimType.length;
            this.filterModels[this.ClaimTypesName].Reset = false;
        } else if (this.userDefinedFilter && this.userDefinedFilter.ClaimType && this.userDefinedFilter.ClaimType.length === 0) {
            _.each(this.filterModels[this.ClaimTypesName].data, (val) => {
                val.Checked = false;
            });
            this.filterModels[this.ClaimTypesName].FilterString = this.localize.getLocalizedString('No filters applied');
            this.filterModels[this.ClaimTypesName].DefaultFilterCount = this.userDefinedFilter.ClaimType.length;
            this.filterModels[this.ClaimTypesName].Reset = false;
        } else {
            this.filterModels[
                this.ClaimTypesName
            ].FilterString = this.localize.getLocalizedString('All');
            this.filterModels[this.ClaimTypesName].DefaultFilterCount = 3;
            this.filterModels[this.ClaimTypesName].Reset = false;
        }
        this.filterModels[
            this.ClaimTypesName
        ].FilterDto = this.getSelectedItemIds(
            this.filterModels[this.ClaimTypesName].data
        );
    }

    setDefaultClaimStatusArray() {
        this.filterModels[this.ClaimStatusName].data = [
            {
                Field: 'ClaimStatus',
                Value: this.localize.getLocalizedString('All'),
                Key: true,
                Checked: true,
                Id: -1, ///Can't 0 for All:- Reason 0 status used for UnSubmitted in Db So Used -1
                FilterValue: null,
                isVisible: true
            },
            {
                Field: 'ClaimStatus',
                Value: this.localize.getLocalizedString('Accepted Electronics'),
                Key: true,
                Checked: true,
                Id: 5,
                FilterValue: null,
                isVisible: true
            },
            {
                Field: 'ClaimStatus',
                Value: this.localize.getLocalizedString('In Process'),
                Key: true,
                Checked: true,
                Id: 4,
                FilterValue: null,
                isVisible: true
            }
            ,
            {
                Field: 'ClaimStatus',
                Value: this.localize.getLocalizedString('Printed'),
                Key: true,
                Checked: true,
                Id: 2,
                FilterValue: null,
                isVisible: true
            }
            ,
            {
                Field: 'ClaimStatus',
                Value: this.localize.getLocalizedString('Rejected'),
                Key: true,
                Checked: true,
                Id: 6,
                FilterValue: null,
                isVisible: true
            }
        ];
        if (this.userDefinedFilter && this.userDefinedFilter.ClaimStatus && this.userDefinedFilter.ClaimStatus.length > 0) {
            this.setMonthCheckedValues(this.filterModels[this.ClaimStatusName].data, false);
            let claimStatusFlag = true;
            _.find(this.userDefinedFilter.ClaimStatus, (id) => {
                if (id === 1) {
                    claimStatusFlag = false;
                    return;
                }
            });
            if (claimStatusFlag) {
                let claimString = '';
                _.each(this.filterModels[this.ClaimStatusName].data, (val) => {
                    _.each(this.userDefinedFilter.ClaimStatus, (id) => {
                        if (val.Id === id) {
                            val.Checked = true;
                            claimString = val.Value;
                        }
                    });
                });
                this.filterModels[
                    this.ClaimStatusName
                ].FilterString = claimString;
            } else {
                this.setMonthCheckedValues(this.filterModels[this.ClaimStatusName].data, true);
                this.filterModels[
                    this.ClaimStatusName
                ].FilterString = this.localize.getLocalizedString('All');
            }
            this.filterModels[this.ClaimStatusName].DefaultFilterCount = this.userDefinedFilter.ClaimStatus.length;
            this.filterModels[this.ClaimStatusName].Reset = false;
        } else if (this.userDefinedFilter && this.userDefinedFilter.ClaimStatus && this.userDefinedFilter.ClaimStatus.length === 0) {
            _.each(this.filterModels[this.ClaimStatusName].data, (val) => {
                val.Checked = false;
            });
            this.filterModels[this.ClaimStatusName].FilterString = this.localize.getLocalizedString('No filters applied');
            this.filterModels[this.ClaimStatusName].DefaultFilterCount = this.userDefinedFilter.ClaimStatus.length;
            this.filterModels[this.ClaimStatusName].Reset = false;
        } else {
            this.filterModels[
                this.ClaimStatusName
            ].FilterString = this.localize.getLocalizedString('All');
            this.filterModels[this.ClaimStatusName].DefaultFilterCount = 5;
            this.filterModels[this.ClaimStatusName].Reset = false;
        }
        this.filterModels[
            this.ClaimStatusName
        ].FilterDto = this.getSelectedItemIds(
            this.filterModels[this.ClaimStatusName].data
        );
    }



    setDefaultViewTransactionsByArray() {
        if (this.userDefinedFilter && this.userDefinedFilter.ViewTransactionsBy) {
            this.filterModels[this.ViewTransactionsByName].data[0].Checked =
                this.userDefinedFilter.ViewTransactionsBy === 0 ? true : false;
            this.filterModels[this.ViewTransactionsByName].data[1].Checked =
                this.userDefinedFilter.ViewTransactionsBy === 1 ? true : false;
            this.filterModels[
                this.ViewTransactionsByName
            ].FilterDto = this.userDefinedFilter.ViewTransactionsBy;
            this.filterModels[
                this.ViewTransactionsByName
            ].FilterString = this.userDefinedFilter.ViewTransactionsBy === 0 ?
                    this.filterModels[this.ViewTransactionsByName].data[0].Value : this.filterModels[this.ViewTransactionsByName].data[1].Value;
            this.filterModels[this.ViewTransactionsByName].Reset = true;
        } else {
            this.filterModels[
                this.ViewTransactionsByName
            ].FilterString = this.filterModels[
                this.ViewTransactionsByName
            ].data[0].Value;
            this.filterModels[this.ViewTransactionsByName].data[0].Checked = true;
            this.filterModels[this.ViewTransactionsByName].data[1].Checked = false;
            this.filterModels[
                this.ViewTransactionsByName
            ].FilterDto = this.filterModels[this.ViewTransactionsByName].data[0].Id;
            this.filterModels[this.ViewTransactionsByName].Reset = true;
        }

    }

    setDefaultAdjustmentTypeOption() {
        if (this.userDefinedFilter && this.userDefinedFilter.InsuranceAdjustmentMode) {
            this.filterModels[this.InsuranceAdjustmentModeName].data[0].Checked =
                this.userDefinedFilter.InsuranceAdjustmentMode === -1 ? true : false;
            this.filterModels[this.InsuranceAdjustmentModeName].data[1].Checked =
                this.userDefinedFilter.InsuranceAdjustmentMode === 1 ? true : false;
            this.filterModels[this.InsuranceAdjustmentModeName].data[2].Checked =
                this.userDefinedFilter.InsuranceAdjustmentMode === 0 ? true : false;

            this.filterModels[
                this.InsuranceAdjustmentModeName
            ].FilterDto = this.userDefinedFilter.InsuranceAdjustmentMode;
            this.filterModels[
                this.InsuranceAdjustmentModeName
            ].FilterString = this.userDefinedFilter.InsuranceAdjustmentMode === -1 ?
                this.filterModels[this.InsuranceAdjustmentModeName].data[0].Value :
                this.userDefinedFilter.InsuranceAdjustmentMode === 1 ? this.filterModels[this.InsuranceAdjustmentModeName].data[1].Value : this.filterModels[this.InsuranceAdjustmentModeName].data[2].Value;
            this.filterModels[this.InsuranceAdjustmentModeName].Reset = true;
        } else {
            this.filterModels[
                this.InsuranceAdjustmentModeName
            ].FilterString = this.filterModels[
                this.InsuranceAdjustmentModeName
            ].data[0].Value;
            this.filterModels[this.InsuranceAdjustmentModeName].data[0].Checked = true;
            this.filterModels[this.InsuranceAdjustmentModeName].data[1].Checked = false;
            this.filterModels[
                this.InsuranceAdjustmentModeName
            ].FilterDto = this.filterModels[this.InsuranceAdjustmentModeName].data[0].Id;
            this.filterModels[this.InsuranceAdjustmentModeName].Reset = true;
        }

    }

    setDefaultReportViewOption() {
        if (this.userDefinedFilter && this.userDefinedFilter.ReportView != undefined) {
            this.filterModels[this.ReportViewName].data[0].Checked = this.userDefinedFilter.ReportView === 0 ? true : false;
            this.filterModels[this.ReportViewName].data[1].Checked = this.userDefinedFilter.ReportView === 1 ? true : false;
            this.filterModels[this.ReportViewName].FilterDto = this.userDefinedFilter.ReportView;
            this.filterModels[this.ReportViewName].FilterString =
                this.userDefinedFilter.ReportView === 0 ? this.filterModels[this.ReportViewName].data[0].Value
                    : this.filterModels[this.ReportViewName].data[1].Value;
            this.filterModels[this.ReportViewName].Reset = true;
        } else {
            this.filterModels[this.ReportViewName].FilterString =
                this.filterModels[this.ReportViewName].data[0].Value;
            this.filterModels[this.ReportViewName].data[0].Checked = true;
            this.filterModels[this.ReportViewName].data[1].Checked = false;
            this.filterModels[this.ReportViewName].FilterDto =
                this.filterModels[this.ReportViewName].data[0].Id;
            this.filterModels[this.ReportViewName].Reset = true;
        }
    }

    setViewDeletedTransaction() {
        //set true when session storage have value
        if (sessionStorage.getItem('ViewDeletedTransaction') == 'true') {
            this.filterModels[this.ViewDeletedTransactionName].data[1].Checked = true;
            this.filterModels[this.ViewDeletedTransactionName].FilterDto = true;
            this.filterModels[this.ViewDeletedTransactionName].FilterString = "All";
            this.filterModels[this.ViewDeletedTransactionName].Reset = true;
            sessionStorage.removeItem('ViewDeletedTransaction');
        }
        else if (this.userDefinedFilter && this.userDefinedFilter.ViewDeletedTransaction) {
            var isChecked = this.userDefinedFilter.ViewDeletedTransaction != undefined && (this.userDefinedFilter.ViewDeletedTransaction.length > 0 || this.userDefinedFilter.ViewDeletedTransaction == true);
            var fiterString = "No filters applied";
            if (this.userDefinedFilter.ViewDeletedTransaction.length > 0 || this.userDefinedFilter.ViewDeletedTransaction == true) {
                fiterString = "All"
            }
            this.filterModels[this.ViewDeletedTransactionName].data[1].Checked = isChecked;
            this.filterModels[this.ViewDeletedTransactionName].FilterDto = this.userDefinedFilter.ViewDeletedTransaction;
            this.filterModels[this.ViewDeletedTransactionName].FilterString = fiterString;
            this.filterModels[this.ViewDeletedTransactionName].Reset = true;
        } else {

            var fiterString = "No filters applied";
            if (this.filterModels[this.ViewDeletedTransactionName].data[1].Value == "[1]" || this.filterModels[this.ViewDeletedTransactionName].data[1].Value == "1") {
                fiterString = "All"
            }
            this.filterModels[this.ViewDeletedTransactionName].FilterString = fiterString;
            this.filterModels[this.ViewDeletedTransactionName].data[1].Checked = false;
            this.filterModels[this.ViewDeletedTransactionName].FilterDto =
                this.filterModels[this.ViewDeletedTransactionName].data[1].Checked;
            this.filterModels[this.ViewDeletedTransactionName].Reset = true;
        }
    }


    setDefaultServiceDateArray() {
        // check User Defined Service Date filter Existence
        if (this.userDefinedFilter && this.userDefinedFilter.ServiceDate !== '') {
            for (const item of this.filterModels[this.ServiceDateName].data) {
                item.Checked = false;
            }
            const userSelectedServiceDateVal = this.userDefinedFilter.ServiceDate;
            this.filterModels[this.ServiceDateName].data[userSelectedServiceDateVal].Checked = true;
            this.filterModels[this.ServiceDateName].FilterString = this.filterModels[
                this.ServiceDateName
            ].data[userSelectedServiceDateVal].Value;
            this.filterModels[this.ServiceDateName].FilterDto = this.filterModels[
                this.ServiceDateName
            ].data[userSelectedServiceDateVal].Id;
            this.filterModels[this.ServiceDateName].Reset = true;
        } else {
            this.filterModels[this.ServiceDateName].FilterString = this.filterModels[
                this.ServiceDateName
            ].data[0].Value;
            this.filterModels[this.ServiceDateName].data[0].Checked = true;
            for (const item of this.filterModels[this.ServiceDateName].data) {
                item.Checked = false;
            }
            this.filterModels[this.ServiceDateName].FilterDto = this.filterModels[
                this.ServiceDateName
            ].data[0].Id;
            this.filterModels[this.ServiceDateName].Reset = true;
        }
    }

    setDefaultPatients() {
        this.userDefinedPatinets = [];
        if (this.userDefinedFilter && (this.userDefinedFilter.Patients || this.userDefinedFilter.PatientIds)) {
            this.setDefaultPatientsUserDefined();
        } else {
            this.filterModels[this.PatientIdName].Reset = true;
            this.filterModels[
                this.PatientIdName
            ].FilterString = this.localize.getLocalizedString('All');
            this.filterModels[this.PatientIdName].FilterDto = [this.emptyGuid];
        }

    }

    setDefaultPatientsUserDefined() {
        let patientData = this.userDefinedFilter.PatientIds ? this.userDefinedFilter.PatientIds : this.userDefinedFilter.Patients;
        if (patientData[0] === '00000000-0000-0000-0000-000000000000') {
            this.filterModels[this.PatientIdName].Reset = true;
            this.filterModels[
                this.PatientIdName
            ].FilterString = this.localize.getLocalizedString('All');
            this.filterModels[this.PatientIdName].FilterDto = [this.emptyGuid];
        } else {
            this.userDefinedPatinets = this.userDefinedFilter.SelectedUserPatients;
            this.filterModels[this.PatientIdName].Reset = true;
            this.filterModels[
                this.PatientIdName
            ].FilterString = this.buildPatientString();
            this.filterModels[this.PatientIdName].FilterDto = patientData;
            this.filterModels[this.PatientIdName].FilterPatients = this.userDefinedFilter.SelectedUserPatients;
        }
    }

    buildPatientString() {
        var filterString = '';
        for (let patient of this.userDefinedFilter.SelectedUserPatients) {
            filterString = filterString.concat(
                this.buildDisplayName(patient) + this.localize.getLocalizedString(', ')
            );
        }
        filterString = filterString.substring(0, filterString.length - 2);
        if (filterString === '') {
            filterString = this.localize.getLocalizedString('No filters applied');
        }
        return filterString;
    }
    buildDisplayName(patient) {
        if (patient) {
            return (
                patient.LastName +
                ', ' +
                patient.FirstName +
                ' - ' +
                patient.PatientCode
            );
        }
        return '';
    }
    getFilterString(array) {
        let filterString = '';
        for (const item of array) {
            if (item.Checked) {
                filterString = filterString
                    ? filterString + ', ' + item.Value
                    : item.Value;
            }
        }
        return filterString
            ? filterString
            : this.localize.getLocalizedString('No filters applied');
    }

    updateFilteredList(isOnchange?) {
        if ((this.filterModels.hasOwnProperty(this.LocationsName)) &&
            Array.isArray(this.filterModels[this.LocationsName].data) &&
            (this.filterModels[this.LocationsName].data.length > 0)) {
            this.allLocations = false;
            let locationFilterItems = null;
            if (!isOnchange && this.LocationList) {
                if (this.LocationList[0] === this.emptyGuid) {
                    this.allLocations = true;
                } else {
                    locationFilterItems = this.LocationList;
                }
            } else {
                locationFilterItems = this.getCheckedList(
                    this.filterModels[this.LocationsName].data
                );
            }
            let providerTypes = null;

            const defaultData = this.defaultProviderData != undefined && this.defaultProviderData.length > 0 ? this.defaultProviderData : this.defaultUserData;
            if (defaultData) {
                this.originalUserData = JSON.parse(
                    JSON.stringify(
                        defaultData
                    )
                );
            }

            if (this.defaultUserData && Array.isArray(this.defaultUserData) &&
                (this.defaultUserData.length > 0)) {
                var originalTeamMembers = JSON.parse(
                    JSON.stringify(this.defaultUserData)
                );
            }
            if (
                this.showProviders &&
                Array.isArray(this.defaultProviderData) &&
                (this.defaultProviderData.length > 0) &&
                (this.filterModels.hasOwnProperty(this.ProvidersName)) &&
                Array.isArray(this.filterModels[this.ProvidersName].data) &&
                (this.filterModels[this.ProvidersName].data.length > 0) &&
                this.filterModels[this.ProvidersName].FilterFilterModel &&
                this.filterModels[this.ProvidersName].FilterFilterModel.data
            ) {
                providerTypes = this.getCheckedList(
                    this.filterModels[this.ProvidersName].FilterFilterModel.data
                ).map((a) => {
                    return a.FilterValue;
                });
                this.updateFilterModel(
                    this.filterModels[this.ProvidersName],
                    this.getPermittedUserList(
                        providerTypes,
                        this.getUsersByLocations(this.originalUserData, locationFilterItems)
                    ),
                    this.partialProviders
                );
            }
            if (
                this.showUsers &&
                Array.isArray(this.defaultUserData) &&
                (this.defaultUserData.length > 0) &&
                (this.filterModels.hasOwnProperty(this.UsersName)) &&
                Array.isArray(this.filterModels[this.UsersName].data) &&
                (this.filterModels[this.UsersName].data.length > 0)
            ) {
                this.updateFilterModel(
                    this.filterModels[this.UsersName],
                    this.getPermittedUserList(
                        null,
                        this.getUsersByLocations(originalTeamMembers, locationFilterItems)
                    ),
                    this.partialUsers
                );
            }
        }
    }

    updateFilterModel(model, array, showPartialList) {
        if (this.userDefinedFilter && !this.providerCallFlag) {
            if (model.Name === 'Providers' || model.Name === 'Team Members') {
                var selectedCount = [];
                let providerProperty;
                if (this.userDefinedFilter.ProviderUserIds) {
                    providerProperty = this.userDefinedFilter.ProviderUserIds;
                } else {
                    providerProperty = this.userDefinedFilter.ProviderIds;
                }
                const arrayData = model.Name === 'Providers' ? providerProperty
                    : this.userDefinedFilter.UserIds;
                _.each(array, (item) => {
                    _.each(arrayData, (id) => {
                        if (id === item.Id) {
                            selectedCount.push(item);
                        }
                    });
                });
            }
            this.updateFilterCount(
                selectedCount.length - (model.DefaultFilterCount ? model.DefaultFilterCount : 0)
            );
        } else {
            this.updateFilterCount(
                array.length - (model.DefaultFilterCount ? model.DefaultFilterCount : 0)
            );
        }

        // model.Name;: 'Providers'
        model.DefaultFilterCount = (this.userDefinedFilter && !this.providerCallFlag) ? selectedCount.length : array.length;
        model.data = array;
        for (const item of model.data) {
            item.isVisible =
                showPartialList && model.data.indexOf(item) > 4 ? false : true;
        }
        this.setDefaultCheckboxFilterValues(model, true);
    }
    setPartialList($event) {
        if (
            this.filterModels[this.ProvidersName] &&
            this.filterModels[this.ProvidersName].Name === $event.name
        ) {
            this.partialProviders = $event.showPartialList;
        } else if (
            this.filterModels[this.UsersName] &&
            this.filterModels[this.UsersName].Name == $event.name
        ) {
            this.partialUsers = $event.showPartialList;
        }
    }
    onChanged(changedFilters, modelName?, data?) {
        this.updateFilterCount(changedFilters);
        if (
            modelName &&
            (modelName === this.localize.getLocalizedString('Provider Types') ||
                modelName === this.localize.getLocalizedString('Locations'))
        ) {
            this.updateFilteredList(true);
        }
        this.checkFilterdto(data);
    }

    onChangedFromChild($event) {
        const dataDuplicate = $event.dataReport;
        const count = $event.count ? $event.count : '';
        const name = $event.name ? $event.name : '';
        this.onChanged(count, name, dataDuplicate);
    }

    checkFilterdto(data?) {
        if (this.originalFilterModels) {
            if (this.parentData.reportId === 9) {
                this.filterModels.PayerId = data;
            } else if (this.parentData.reportId === 65 || this.parentData.reportId === 118) {
                this.filterModels.PatientStatus = data;
            }
            if (!_.isEqual(this.filterModels, this.originalFilterModels)) {
                if (this.filterModels.StartDate) {
                    const defaultTypeA = this.originalFilterModels.StartDate.dateType;
                    this.originalFilterModels.StartDate = cloneDeep(this.filterModels.StartDate);
                    this.originalFilterModels.StartDate.dateType = defaultTypeA;
                }
                if (this.filterModels.OrigStartDate) {
                    const defaultTypeB = this.originalFilterModels.OrigStartDate.Ignore;
                    this.originalFilterModels.OrigStartDate = cloneDeep(this.filterModels.OrigStartDate);
                    this.originalFilterModels.OrigStartDate.Ignore = defaultTypeB;
                }
                if (this.filterModels.CollectionStartDate) {
                    const defaultTypeC = this.originalFilterModels.CollectionStartDate.CollectioDateType;
                    this.originalFilterModels.CollectionStartDate = cloneDeep(this.filterModels.CollectionStartDate);
                    this.originalFilterModels.CollectionStartDate.CollectioDateType = defaultTypeC;
                }
                if (this.filterModels.ProductionStartDate) {
                    const defaultTypeD = this.originalFilterModels.ProductionStartDate.ProductionDateType;
                    this.originalFilterModels.ProductionStartDate = cloneDeep(this.filterModels.ProductionStartDate);
                    this.originalFilterModels.ProductionStartDate.ProductionDateType = defaultTypeD;
                }
                if (this.filterModels.AgingOption) {
                    const defaultAge = this.originalFilterModels.AgingOption.FilterDto;
                    this.originalFilterModels.AgingOption = cloneDeep(this.filterModels.AgingOption);
                    this.originalFilterModels.AgingOption.FilterDto = defaultAge;
                }
                if (this.filterModels.LocationIds) {
                    this.filterModels.LocationIds.FilterDto = this.filterModels.LocationIds.FilterDto.filter((item, idx) => {
                        return item !== 0;
                    });
                    this.originalFilterModels.LocationIds.FilterDto = this.originalFilterModels.LocationIds.FilterDto.filter((item, idx) => {
                        return item !== 0;
                    });
                    this.originalFilterModels.LocationIds.DefaultFilterCount = this.filterModels.LocationIds.DefaultFilterCount;
                }
                if (this.filterModels.ProviderUserIds) {
                    this.originalFilterModels.ProviderUserIds.DefaultFilterCount = this.filterModels.ProviderUserIds.DefaultFilterCount;
                    if (this.filterModels.ProviderUserIds.FilterFilterModel) {
                        this.originalFilterModels.ProviderUserIds.FilterFilterModel.FilterDto =
                            this.originalFilterModels.ProviderUserIds.FilterFilterModel.FilterDto.filter((item, idx) => {
                                return item !== 0;
                            });
                        this.filterModels.ProviderUserIds.FilterFilterModel.FilterDto =
                            this.filterModels.ProviderUserIds.FilterFilterModel.FilterDto.filter((item, idx) => {
                                return item !== 0;
                            });
                    }
                }
                if (this.filterModels.ProviderIds) {
                    this.originalFilterModels.ProviderIds.DefaultFilterCount = this.filterModels.ProviderIds.DefaultFilterCount;
                    if (this.filterModels.ProviderIds.FilterFilterModel) {
                        this.originalFilterModels.ProviderIds.FilterFilterModel.FilterDto =
                            this.originalFilterModels.ProviderIds.FilterFilterModel.FilterDto.filter((item, idx) => {
                                return item !== 0;
                            });
                        this.filterModels.ProviderIds.FilterFilterModel.FilterDto =
                            this.filterModels.ProviderIds.FilterFilterModel.FilterDto.filter((item, idx) => {
                                return item !== 0;
                            });
                    }
                }
                if (this.filterModels.LocationId) {
                    const locFIlterDto = this.originalFilterModels.LocationId.FilterDto;
                    this.originalFilterModels.LocationId = cloneDeep(this.filterModels.LocationId);
                    this.originalFilterModels.LocationId.FilterDto = locFIlterDto;
                }
                if (this.filterModels.Patients) {
                    const defaultPatinet = this.originalFilterModels.Patients.FilterDto;
                    this.originalFilterModels.Patients = cloneDeep(this.filterModels.Patients);
                    this.originalFilterModels.Patients.FilterDto = defaultPatinet;
                }
                if (this.filterModels.PatientIds) {
                    const defaultPatinet = this.originalFilterModels.PatientIds.FilterDto;
                    this.originalFilterModels.PatientIds = cloneDeep(this.filterModels.PatientIds);
                    this.originalFilterModels.PatientIds.FilterDto = defaultPatinet;
                }
                if (this.fromType !== 'fromReports') {
                    if (this.filterModels.NegativeAdjustmentTypeIds && this.filterModels.NegativeAdjustmentTypeIds.FilterDto.length > 0) {
                        if (this.filterModels.NegativeAdjustmentTypeIds.FilterDto[0] === '00000000-0000-0000-0000-000000000000') {
                            this.originalFilterModels.NegativeAdjustmentTypeIds = cloneDeep(this.filterModels.NegativeAdjustmentTypeIds);
                        }
                    }
                    if (this.filterModels.PositiveAdjustmentTypeIds && this.filterModels.PositiveAdjustmentTypeIds.FilterDto.length > 0) {
                        if (this.filterModels.PositiveAdjustmentTypeIds.FilterDto[0] === '00000000-0000-0000-0000-000000000000') {
                            this.originalFilterModels.PositiveAdjustmentTypeIds = cloneDeep(this.filterModels.PositiveAdjustmentTypeIds);
                        }
                    }
                }
                if (this.filterModels.ReferralSourceIds) {
                    const selectRef = this.originalFilterModels.ReferralSourceIds.selectedReferralType;
                    const sourceDto = this.originalFilterModels.ReferralSourceIds.ReferringSourceIdFilterDto;
                    const patientDto = this.originalFilterModels.ReferralSourceIds.ReferringPatientIdFilterDto;
                    const externalProviderDto = this.originalFilterModels.ReferralSourceIds.ExternalProviderIdFilterDto;
                    this.originalFilterModels.ReferralSourceIds = cloneDeep(this.filterModels.ReferralSourceIds);
                    this.originalFilterModels.ReferralSourceIds.selectedReferralType = selectRef;
                    this.originalFilterModels.ReferralSourceIds.ReferringSourceIdFilterDto = sourceDto;
                    this.originalFilterModels.ReferralSourceIds.ReferringPatientIdFilterDto = patientDto;
                    this.originalFilterModels.ReferralSourceIds.ExternalProviderIdFilterDto = externalProviderDto;
                    this.sortedDtos();
                }
                if (this.filterModels.ServiceTypeIds) {
                    this.originalFilterModels.ServiceTypeIds.data = this.filterModels.ServiceTypeIds.data;
                }
                if (this.filterModels.TransactionTypes) {
                    const TranFIlterDto = this.originalFilterModels.TransactionTypes.FilterDto;
                    this.originalFilterModels.TransactionTypes = cloneDeep(this.filterModels.TransactionTypes);
                    this.originalFilterModels.TransactionTypes.FilterDto = TranFIlterDto;
                }
                if (this.filterModels.CarrierIds) {
                    const CarrierIdsFIlterDto = this.originalFilterModels.CarrierIds.FilterDto;
                    this.originalFilterModels.CarrierIds = cloneDeep(this.filterModels.CarrierIds);
                    this.originalFilterModels.CarrierIds.FilterDto = CarrierIdsFIlterDto;
                }
                if (this.showMultipleLocation && this.filterModels[this.LocationsName]) {
                    this.originalFilterModels[this.LocationsName].data = this.filterModels[this.LocationsName].data;
                }
                if (this.showPatientStatus && this.filterModels[this.PatientStatusName]) {
                    this.originalFilterModels[this.PatientStatusName].data = this.filterModels[this.PatientStatusName].data;
                }
                if (this.showTreatmentPlanStatus && this.filterModels[this.TreatmentPlanStatusName]) {
                    this.originalFilterModels[this.TreatmentPlanStatusName].data = this.filterModels[this.TreatmentPlanStatusName].data;
                }
                if (this.showServiceCodeStatus && this.filterModels[this.ServiceCodeStatusName]) {
                    this.originalFilterModels[this.ServiceCodeStatusName].data = this.filterModels[this.ServiceCodeStatusName].data;
                }
                if (this.showMonths && this.filterModels[this.MonthName]) {
                    this.originalFilterModels[this.MonthName].data = this.filterModels[this.MonthName].data;
                }
                if (this.showProviders && this.filterModels[this.ProvidersName]) {
                    this.originalFilterModels[this.ProvidersName].data = this.filterModels[this.ProvidersName].data;
                }
                if (this.showUsers && this.filterModels[this.UsersName]) {
                    this.originalFilterModels[this.UsersName].data = this.filterModels[this.UsersName].data;
                }
                if (this.showCarriers && this.filterModels[this.CarrierName]) {
                    this.originalFilterModels[this.CarrierName].data = this.filterModels[this.CarrierName].data;
                }
                if (this.showActivityAreas && this.filterModels[this.ActivityAreaName]) {
                    this.originalFilterModels[this.ActivityAreaName].data =
                        this.filterModels[this.ActivityAreaName].data;
                }
                if (this.showActivityTypes && this.filterModels[this.ActivityTypeName]) {
                    this.originalFilterModels[this.ActivityTypeName].data =
                        this.filterModels[this.ActivityTypeName].data;
                }
                if (this.showActivityActions && this.filterModels[this.ActivityActionName]) {
                    this.originalFilterModels[this.ActivityActionName].data =
                        this.filterModels[this.ActivityActionName].data;
                }
                if (this.showAdditionalIdentifiers && this.filterModels[this.AdditionalIdentifiersName]) {
                    this.originalFilterModels[this.AdditionalIdentifiersName].data =
                        this.filterModels[this.AdditionalIdentifiersName].data;
                }
                if (this.showFeeSchedules && this.filterModels[this.FeeSchedulesName]) {
                    this.originalFilterModels[this.FeeSchedulesName].data =
                        this.filterModels[this.FeeSchedulesName].data;
                }
                if (this.showDisplayOptions && this.filterModels[this.DisplayOptionsName]) {
                    this.originalFilterModels[this.DisplayOptionsName].data =
                        this.filterModels[this.DisplayOptionsName].data;
                }
                if (this.showTransactionTypes && this.filterModels[this.TransactionTypeName]) {
                    this.originalFilterModels[this.TransactionTypeName].data =
                        this.filterModels[this.TransactionTypeName].data;
                }
                if (this.showPatientGroupTypes && this.filterModels[this.PatientGroupTypeName]) {
                    this.originalFilterModels[this.PatientGroupTypeName].data =
                        this.filterModels[this.PatientGroupTypeName].data;
                }
                if (this.showServiceTypes && this.filterModels[this.ServiceTypeName]) {
                    this.originalFilterModels[this.ServiceTypeName].data =
                        this.filterModels[this.ServiceTypeName].data;
                }
                if (this.showNegativeAdjustmentTypes && this.filterModels[this.NegativeAdjustmentTypeName]) {
                    this.originalFilterModels[this.NegativeAdjustmentTypeName].data =
                        this.filterModels[this.NegativeAdjustmentTypeName].data;
                }
                if (this.showPositiveAdjustmentTypes && this.filterModels[this.PositiveAdjustmentTypeName]) {
                    this.originalFilterModels[this.PositiveAdjustmentTypeName].data =
                        this.filterModels[this.PositiveAdjustmentTypeName].data;
                }
                if (this.showInsurancePaymentType && this.filterModels[this.InsurancePaymentTypeName]) {
                    this.originalFilterModels[this.InsurancePaymentTypeName].data =
                        this.filterModels[this.InsurancePaymentTypeName].data;
                }
                if (this.showReferralAffiliate && this.filterModels[this.ReferralAffiliateName]) {
                    this.originalFilterModels[this.ReferralAffiliateName].data =
                        this.filterModels[this.ReferralAffiliateName].data;
                }
                if (this.showPaymentType && this.filterModels[this.PaymentTypeName]) {
                    this.originalFilterModels[this.PaymentTypeName].data =
                        this.filterModels[this.PaymentTypeName].data;
                }
                if (this.showImpactions && this.filterModels[this.ImpactionName]) {
                    this.originalFilterModels[this.ImpactionName].data = this.filterModels[this.ImpactionName].data;
                }
                if (this.showAppointmentTypes && this.filterModels[this.AppointmentTypeName]) {
                    this.originalFilterModels[this.AppointmentTypeName].data =
                        this.filterModels[this.AppointmentTypeName].data;
                }
                if (this.showMasterPatientAlerts && this.filterModels[this.MasterPatientAlertName]) {
                    this.originalFilterModels[this.MasterPatientAlertName].data =
                        this.filterModels[this.MasterPatientAlertName].data;
                }
                if (this.showMedicalHistoryAlerts && this.filterModels[this.MedicalHistoryAlertName]) {
                    this.originalFilterModels[this.MedicalHistoryAlertName].data =
                        this.filterModels[this.MedicalHistoryAlertName].data;
                }
                if (this.showTreatmentPlan && this.filterModels[this.TreatmentPlanName]) {
                    this.originalFilterModels[this.TreatmentPlanName].data =
                        this.filterModels[this.TreatmentPlanName].data;
                }
                if (this.showClaimTypes && this.filterModels[this.ClaimTypesName]) {
                    this.originalFilterModels[this.ClaimTypesName].data =
                        this.filterModels[this.ClaimTypesName].data;
                }
                if (this.showDiscountTypes && this.filterModels[this.DiscountTypeName]) {
                    this.originalFilterModels[this.DiscountTypeName].data =
                        this.filterModels[this.DiscountTypeName].data;
                }
                if (this.showSingleLocation && this.filterModels[this.LocationsName]) {
                    this.originalFilterModels[this.LocationsName].data = this.filterModels[this.LocationsName].data;
                }
                if (this.showInsurance && this.filterModels[this.InsuranceName]) {
                    this.originalFilterModels[this.InsuranceName].data = this.filterModels[this.InsuranceName].data;
                }
                if (this.showClaimStatus && this.filterModels[this.ClaimStatusName]) {
                    this.originalFilterModels[this.ClaimStatusName].data = this.filterModels[this.ClaimStatusName].data;
                }
                if (this.showTaxableServiceTypes && this.filterModels.TaxableServiceTypeIds) {
                    this.originalFilterModels.TaxableServiceTypeIds.data = this.filterModels.TaxableServiceTypeIds.data;
                }
                if (this.showReportView && this.filterModels[this.ReportViewName]) {
                    this.originalFilterModels[this.ReportViewName].data = this.filterModels[this.ReportViewName].data;
                }

                if (this.ShowInsuranceAdjustmentMode && this.filterModels[this.InsuranceAdjustmentModeName]) {
                    this.originalFilterModels[this.InsuranceAdjustmentModeName].data = this.filterModels[this.InsuranceAdjustmentModeName].data;
                }

                if (!_.isEqual(this.filterModels, this.originalFilterModels)) {
                    this.buttonDisabled = false;
                } else {
                    this.buttonDisabled = true;
                }
            } else {
                this.buttonDisabled = true;
            }
            if (this.parentData.reportId === 120) {
                sessionStorage.setItem('dateType', 'fromReports');
                this.fromType = sessionStorage.getItem('dateType');
            }
        }
    }

    updateFiltersForNewReportingAPI(filterDto?) {
        Object.keys(filterDto).forEach((key) => {
            let allFilterKey = IncludeAllPropName[key];
            let noneFilterKey = IncludeNonePropName[key];
            if (filterDto[key].FilterString === "All" && allFilterKey) {
                filterDto[key].FilterDto = [];
                this.setAllFilterForNewReportingAPI(filterDto, allFilterKey);
            } else if (filterDto[key].FilterString !== "All" && (allFilterKey || noneFilterKey)) {
                if (allFilterKey) {
                    filterDto[allFilterKey].FilterString = "No filters applied";
                    filterDto[allFilterKey].FilterDto = [];
                }
                if (noneFilterKey && filterDto[key].FilterDto) {
                    if (filterDto[key].FilterDto[0] == this.GuidOne) {
                        filterDto[noneFilterKey].FilterString = "None";
                        filterDto[noneFilterKey].FilterDto = [];
                        filterDto[noneFilterKey].FilterDto[0] = true;
                    }
                    else {
                        filterDto[noneFilterKey].FilterString = "None";
                        filterDto[noneFilterKey].FilterDto = [];
                        filterDto[noneFilterKey].FilterDto[0] = false;
                    }
                }
            }
            else if (!filterDto[key].FilterDto || (filterDto[key].FilterDto && filterDto[key].FilterDto[0] == undefined)) {
                filterDto[key].FilterDto = [];
            }
        });
    }

    setAllFilterForNewReportingAPI(filterDto?, allFilterKey?) {
        if (allFilterKey) {
            Object.keys(filterDto).forEach((key) => {
                if (key === allFilterKey) {
                    filterDto[allFilterKey].FilterString = "All";
                    filterDto[allFilterKey].FilterDto = [];
                    filterDto[allFilterKey].FilterDto[0] = true;
                }
            });
        }
    }

    getCheckedList(originalList) {
        const checkedFilterItems = [];
        for (const item of originalList) {
            if (item.Checked) {
                checkedFilterItems.push(item);
            }
        }
        return checkedFilterItems;
    } collapsePanel() {
        if (this.textExpandCollapse === 'Expand All') {
            this.expandFilters();
        } else {
            this.collapseFilters();
        }
    }
    // end region filter UI button functions

    // region filter change functions

    updateFilterCount(changedFilters: number) {
        if (changedFilters) {
            this.appliedFiltersCount += changedFilters;
        }
    }

    getPermittedUserList(providerTypes, userList) {
        if (isNull(providerTypes)) { return userList; }
        const users = [userList[0]]; // All option is added here because it will be skipped in loop
        for (const item of userList) {
            const providerArray = [];
            let isProviderExists = false;
            if (item.FilterValue) {
                for (const loc of item.FilterValue) {
                    for (const type of providerTypes) {
                        if (
                            type === loc.ProviderTypeId &&
                            providerArray.filter((l) => {
                                return l.ProviderTypeId === loc.ProviderTypeId;
                            }).length === 0
                        ) {
                            providerArray.push(loc);
                        }
                    }
                    if (providerArray.length > 0) {
                        item.FilterValue = providerArray;
                        isProviderExists = true;
                    }
                }
            }

            if (
                isProviderExists &&
                users.filter((l) => {
                    return l.Id === item.Id;
                }).length === 0
            ) {
                users.push(item);
            }
        }
        return users;
    }

    getUsersByLocations(users, locationFilterItems) {
        if (this.allLocations) {
            this.allLocations = false;
            return users;
        }
        let pUser;
        const array = [users[0]]; // All Option
        for (const item of users) {
            const user = this.users.find((u) => {
                return u.UserId === item.Id;
            });
            // getting all practies admin team members
            if ((item.Field === 'Team Members' && (this.practieceAdmins && this.practieceAdmins.length > 0))) {
                pUser = this.practieceAdmins.find((p) => {
                    return p.User.UserId === item.Id;
                });
            }

            let isInLocation = false;
            const locationArray = [];
            if ((user && user.Locations) || pUser) {

                const filterValues = Array.isArray(item.FilterValue)? item.FilterValue: [];
                for (const location of filterValues) {
                    for (const locationFilterItem of locationFilterItems) {
                        if (locationFilterItem.Id) {
                            isInLocation =
                                isInLocation || location.LocationId === locationFilterItem.Id;
                        } else {
                            isInLocation =
                                isInLocation || location.LocationId === locationFilterItem;
                        }
                    }
                    if (
                        isInLocation &&
                        locationArray.filter((l) => {
                            return l.LocationId === location.LocationId;
                        }).length === 0
                    ) {
                        locationArray.push(location);
                        isInLocation = false;
                    }
                }
                if (locationArray.length > 0) { item.FilterValue = locationArray; }
            }
            if (locationArray.length > 0 || (pUser && this.filterModels.LocationIds.FilterDto.length > 0)) {
                array.push(item);
            }
        }
        return array;
    }

    checkModelValidity(isModelValid) {
        this.isValid = isModelValid;
    } checkValidDates(valid) {
        this.isValidDates = false;
        if (!valid) {
            this.isValidDates = true;
            if (this.parentData.dateFilterList && this.parentData.dateFilterList.length > 0) {
                for (const filter of this.parentData.dateFilterList) {
                    if (!filter || !filter.FilterDtoStartDate || !filter.FilterDtoEndDate
                        || filter.FilterDtoStartDate > filter.FilterDtoEndDate) {
                        this.isValidDates = false;
                    }
                }
            }
        }

    }
    AddDateFilterToList(filter) {
        let doesExist = false;
        for (let i = 0; i < this.parentData.dateFilterList.length; i++) {
            if (
                this.parentData.dateFilterList[i] &&
                this.parentData.dateFilterList[i].Name === filter.Name
            ) {
                this.parentData.dateFilterList[i] = filter;
                doesExist = true;
            }
        }
        if (!doesExist) {
            this.parentData.dateFilterList.push(filter);
        }
    }

    getSelectedItemIds(array) {
        const ids = [];
        if (array.length > 0) {
            // Will skip if all is checked.
            for (const item of array) {
                if (item.Checked) {
                    ids.push(item.Id);
                }
            }
        }
        return ids;
    }
    saveFilters = () => {
        if ((this.filterModels.StartDate && this.filterModels.StartDate.dateType === 4) ||
            (this.filterModels.CollectionStartDate && this.filterModels.CollectionStartDate.dateType === 4) ||
            (this.filterModels.ProductionStartDate && this.filterModels.ProductionStartDate.dateType === 4) ||
            (this.filterModels.OrigStartDate && this.filterModels.OrigStartDate.Ignore === '0')) {
            sessionStorage.setItem('dateRangeFlag', 'true');
        }
        this.userFilters.emit(true);
        this.buttonDisabled = true;
    }
    callChildComponents() {
        this.checkComponentChildren.forEach((child) => {
            child.ngOnInit();
        });
        this.radioComponentChildren.forEach((child) => {
            child.ngOnInit();
        });

        if (this.showPatients) {
            this.patientComponent.ngOnInit();
        }

        if (this.showAgingOption) {
            this.numaricComponent.ngOnInit();
        }
        if (this.showServiceCode) {
            this.searchComponent.ngOnInit();
        }
        if (this.showServiceCodes) {
            this.reportServiceCodeFilterComponent.ngOnInit();
        }
        if (this.showReferralSources) {
            if (this.showNewReferralFilter === true) {
                this.PatientRefBetaComponent.ngOnInit();
            } else {
                this.PatientRefComponent.ngOnInit();
            }
        }
        this.dateComponentChildren.forEach((child) => {
            child.ngOnInit();
        });

        sessionStorage.setItem('dateRangeFlag', 'false');
    }
    getUserDefinedFilters = () => {
        const reportId = this.parentData.reportId;
        if (this.asyncBlobId) {
            sessionStorage.setItem('dateRangeFlag', 'true');
            this.getFiltersFromBlobFile(this.asyncBlobId);
        } else {
            this.reportsService.GetSpecificUserDefinedFilter(reportId,
                this.successService, this.retrieveGridFailure);
        }
    }
    successService = (resp) => {
        if (resp.Value) {
            this.userDefinedFilter = JSON.parse(resp.Value);
            if (this.fromType === 'fromInsurance' && this.parentData.reportId === 9) {
                this.userDefinedFilter = '';
            }
        } else {
            this.userDefinedFilter = resp.Value;
            if (this.fromType === 'fromInsurance' && this.parentData.reportId === 9) {
                this.userDefinedFilter = '';
            }
        }
        this.initializeMethods();
    }
    retrieveGridFailure = (err) => {
        this.toastrFactory.error(
            this.localize.getLocalizedString('{0} {1}', [
                'getUserDefinedFilters',
                'failed to load.'
            ]),
            this.localize.getLocalizedString('Server Error')
        );
    }
    getFiltersFromBlobFile = (asyncBlobId) => {
        this.reportsService.GetReportDataFromBlob({ fileName: asyncBlobId + '_rawdata' },
            (res) => {
                this.userDefinedFilter = res.Filters;
                this.initializeMethods();
            },
            (res) => {
                this.toastrFactory.error(
                    this.localize.getLocalizedString('{0} {1}', [
                        'GetReportDataFromBlob',
                        'failed to load.'
                    ]),
                    this.localize.getLocalizedString('Server Error')
                );
            }
        );
    }

    initializeMethods() {
        this.initializeFilterElements();
        this.initializeFilterClasses();
        this.setupFilters();
        if (this.getUsersCompletePromise && this.getLocationsCompletePromise && this.getAdjustmentPromise) {
            this.$q.all([
                this.getAdjustmentPromise.promise,
                this.getUsersCompletePromise.promise,
                this.getLocationsCompletePromise.promise
            ]).then(() => {
                this.updateFilteredList();
                if (this.callChildren) {
                    this.callChildComponents();
                }
                this.callChildren = false;
                if (this.afterFilterInit && this.fromType !== 'fromReports') {
                    this.afterInit.emit();
                }
                this.originalFilterModels = cloneDeep(this.filterModels);
                this.buttonDisabled = true;
                this.providerCallFlag = true;
            });
        } else if (this.getUsersCompletePromise && this.getLocationsCompletePromise) {
            this.$q.all([
                this.getUsersCompletePromise.promise,
                this.getLocationsCompletePromise.promise
            ]).then(() => {
                this.updateFilteredList();
                if (this.callChildren) {
                    this.callChildComponents();
                }
                this.callChildren = false;
                if (this.afterFilterInit && this.fromType !== 'fromReports') {
                    this.afterInit.emit();
                }
                this.originalFilterModels = cloneDeep(this.filterModels);
                this.buttonDisabled = true;
                this.providerCallFlag = true;
            });
        } else if (this.getLocationsCompletePromise && this.afterFilterInit) {
            this.$q.when(this.getLocationsCompletePromise.promise).then(() => {
                if (this.afterFilterInit && this.fromType !== 'fromReports') {
                    this.afterInit.emit();
                }
                if (this.callChildren) {
                    this.callChildComponents();
                }
                this.callChildren = false;
                this.originalFilterModels = cloneDeep(this.filterModels);
                this.buttonDisabled = true;
            });
        } else if (this.getAdjustmentPromise) {
            this.$q.all([
                this.getAdjustmentPromise.promise
            ]).then(() => {
                this.originalFilterModels = cloneDeep(this.filterModels);
                if (this.callChildren) {
                    this.callChildComponents();
                }
                this.callChildren = false;
            });
        } else if (this.getLocationsCompletePromise) {
            this.$q.all([
                this.getLocationsCompletePromise.promise
            ]).then(() => {
                this.originalFilterModels = cloneDeep(this.filterModels);
                if (this.callChildren) {
                    this.callChildComponents();
                }
                this.callChildren = false;
            });
        }

        if (this.asyncBlobId) {
            this.buttonDisabled = true;
        }
    }
    // chacking authorization 
    rolesChack() {
        const userPractice = JSON.parse(sessionStorage.getItem('userPractice'));
        // getting all admin users
        this.userServices.Roles.getAllRolesByPractice({ practiceId: userPractice.id })
            .$promise.then((res) => {
                this.practieceAdmins = res.Result;
            }, (err) => {
            });
    }
    ngOnInit() {
        const hash = window.location.hash;
        if (hash) {
            const queryParams = hash.split('?')[1];
            if (queryParams) {
                const urlParams = new URLSearchParams(queryParams);
                this.asyncBlobId = urlParams.get('bid');
            }
        }

        this.fromType = sessionStorage.getItem('dateType');
        sessionStorage.setItem('dateRangeFlag', 'false');
        if (this.allData) {
            this.parentData = this.allData.$$childTail;

            if (this.parentData.reportId === 232) {
                this.showNewReferralFilter = true;
            } else {
                this.featureFlagService.getOnce$(FuseFlag.ReferredPatientsReport).subscribe((value) => {
                    this.showNewReferralFilter = value;
                });
            }

            if (this.parentData.requestBodyProperties) {
                this.userContext = JSON.parse(sessionStorage.getItem('userContext'));
                // call this method for practies admin only
                if (this.userContext.Result.User.AccessLevel === 2) {
                    this.rolesChack();
                }
            }
            if (this.fromType === 'fromReports' || (this.fromType === 'fromInsurance' && this.parentData.reportId === 9) || this.asyncBlobId) {
                this.getUserDefinedFilters();
            } else {
                this.userDefinedFilter = '';
                this.initializeMethods();
            }
            if (this.recallMethod) {
                this.scope.$on('business:reports', () => {
                    sessionStorage.setItem('dateType', 'fromReports');
                    this.fromType = sessionStorage.getItem('dateType');
                    this.getUserDefinedFilters();
                    this.callChildren = true;
                });
            }
        }
    }
    ngAfterViewInit() {
    }

    ngOnDestroy() {
        this.subscriptions.forEach((subscription) => subscription?.unsubscribe())
    }

}
