import { AfterViewInit, Component, ElementRef, EventEmitter, Inject, Input, OnChanges, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { SoarSelectListComponent } from '../../../@shared/components/soar-select-list/soar-select-list.component'
import { CDTCodeModel } from '../cdtcodepickermodel';
import { Accumulator, AffectedAreas, DrawTypes, Header, HeaderCategories, PreventiveLinkedServices, PreventiveServices, ProviderTypes, ServiceCodeModel, TaxableServices } from '../service-code-model';
import isEqual from 'lodash/isequal';
import reduce from 'lodash/reduce';
import isUndefined from 'lodash/isUndefined';
import cloneDeep from 'lodash/cloneDeep';
import { CdtCodePickerModalComponent } from '../cdt-code-picker-modal/cdt-code-picker-modal.component';
import { SmartCodeSetupComponent } from '../smart-code-setup/smart-code-setup.component';
import { ServiceFeesByLocationComponent } from '../service-fees-by-location/service-fees-by-location.component';
import { NgForm } from '@angular/forms';
import { SwiftpickCodeCrudComponent } from '../swiftpick-code-crud/swiftpick-code-crud.component';
import moment from 'moment';
import { CdtCodeService } from '../../../@shared/providers/cdt-code.service';
import { ServiceCodesService } from 'src/@shared/providers/service-codes.service';
import { SoarResponse } from 'src/@core/models/core/soar-response';
import { PreventiveCareService } from 'src/@shared/providers/preventive-care.service';
import { ServiceSwiftCodeService } from '../service-swift-code-service/service-swift-code.service';
import { NewStandardServiceModel } from 'src/@shared/models/new-standard-service.model';
import { ServiceTypes } from '../service-types';
import { FuseFlag } from 'src/@core/feature-flags/fuse-flag';
import { FeatureFlagService } from 'src/featureflag/featureflag.service';

@Component({
    selector: 'service-code-crud',
    templateUrl: './service-code-crud.component.html',
    styleUrls: ['./service-code-crud.component.scss']
})
export class ServiceCodeCrudComponent implements OnInit, OnChanges,AfterViewInit  {
    @Input() data;
    @Output() updateServiceCodeList = new EventEmitter<ServiceCodeModel>();

    @ViewChild('lstDrawType') soarSelectListComponent: SoarSelectListComponent;
    @ViewChild('inputServiceCode') inputServiceCode: ElementRef;
    @ViewChild('inputDescription') inputDescription: ElementRef;
    @ViewChild('lstServiceType') lstServiceType: ElementRef;
    @ViewChild('lstAffectedArea') lstAffectedArea: ElementRef;
    @ViewChild('inpDisplayAs') inpDisplayAs: ElementRef;
    @ViewChild('inpSwiftPickCode') inpSwiftPickCode: ElementRef;
    @ViewChild(CdtCodePickerModalComponent) public cdtCodePickerModal: CdtCodePickerModalComponent
    @ViewChild(SmartCodeSetupComponent) public smartCodeSetup: SmartCodeSetupComponent
    @ViewChild(ServiceFeesByLocationComponent) public serviceFeesByLocation: ServiceFeesByLocationComponent
    @ViewChild(SwiftpickCodeCrudComponent) public swiftPickCrud: SwiftpickCodeCrudComponent
    @ViewChild('addServiceCodeForm', { read: NgForm }) serviceCodeForm: NgForm;

    addServiceCodeAmfa = "soar-biz-bsvccd-add";
    editServiceCodeAmfa = "soar-biz-bsvccd-edit";
    viewChartButtonAmfa = 'soar-biz-bizusr-vchbtn';
    displayActiveStatusConfirmation = false;
    editMode = false;
    locationDataChanged = false;
    isValidCdtCode = false;
    filteredDrawTypes = [];
    drawTypes: DrawTypes[];
    providerTypes: ProviderTypes[];
    serviceTypes: ServiceTypes[];
    affectedAreas: AffectedAreas[];
    headerCategories: HeaderCategories[];
    header: Header[];
    allServiceCodes = [];
    taxableServices: TaxableServices[];
    serviceCodeError = false;
    serviceDescriptionError = false;
    serviceTypeIdError = false;
    affectedAreaIdError = false;
    saveAttempted = false;
    serviceCode = new NewStandardServiceModel<ServiceCodeModel>();
    noSearchResults = false;
    sortCol = null;
    includeInactive = false;
    serviceCodeInitial: ServiceCodeModel;
    hasViewAccess = false;
    hasAddServiceCodeAccess = false;
    hasEditServiceCodeAccess = false;
    hasViewChartButtonAccess = false;
    takeAmount: number;
    limit: number;
    limitResults: boolean;
    searchParams: { searchTerm: string; };
    searchString: string;
    resultCount: number;
    searchResults = [];
    searchTimeout = null;
    minDate = new Date(1900, 12, 31, 23, 59, 59, 999);
    maxDate = new Date(9999, 12, 31, 23, 59, 59, 999);
    inactivationDateIsValid = true;
    uniqueServiceCodeServerMessage: string;
    template = 'kendoAutoCompleteCDTTemplate';
    placeholder = 'Search by code, description...';
    fieldLabels: [string] = [""];
    validCdtCodeServerMessage = "";
    showCTDCodePickerModal: boolean;
    cdtCodeselected = "";
    cdtCodes: CDTCodeModel[] = [];
    isSmartCodeDisplay = false;
    feesByLocation = false;
    serviceCodeIsValid = false;
    preventiveServiceTypes: PreventiveServices[];
    IsPreventiveServiceAdded = false;
    IsFavouriteAdded = false;
    swiftCode = new NewStandardServiceModel<ServiceCodeModel>();
    swiftCodeInitial= ServiceCodeModel;
    dataHasChanged = false;
    confirmCancel = false;
    isAtleastOneServiceCode = false;
    uniqueSwiftPickCodeServerMessage = "";
    selectedCdtCode: CDTCodeModel;
    hasDeleteAccess = false;
    swiftPickServiceCode: ServiceCodeModel;
    smartCodeRes : ServiceCodeModel;
    dataHasChangedSmartCode = false;
    momentDate = moment(new Date().setHours(0, 0, 0, 0)).format('MM/DD/YYYY');
    hasAuthViewChartButtonAccess = false;
    hasAuthEditServiceCodeAccess = false;
    hasAuthAddServiceCodeAccess = false;
    hasAuthViewAccess = false;
    hasAuthDeleteAccess = false;
    private usePracticeApiForPreventiveServiceTypes = false;

    constructor(@Inject('ModalFactory') private modalFactory,
        @Inject('localize') private localize,
        @Inject('toastrFactory') private toastrFactory,
        @Inject('patSecurityService') private patSecurityService,
        @Inject('referenceDataService') private referenceDataService,
        @Inject('PatCacheFactory') private cacheFactory,
        @Inject('ChartingFavoritesFactory') private chartingFavoritesFactory,
        private cdtCodeService: CdtCodeService,
        private serviceCodesService: ServiceCodesService,
        private preventiveCareService: PreventiveCareService,
        private swiftCodeService: ServiceSwiftCodeService,
        featureFlagService: FeatureFlagService) {
        featureFlagService.getOnce$(FuseFlag.UsePracticeApiForPreventiveServiceTypes).subscribe((value) => this.usePracticeApiForPreventiveServiceTypes = value);
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes.data) {
            this.authAccess();
            this.watchServiceCode();
        }
    }

    ngOnInit() {
        this.drawTypes = this.data?.DrawTypes;
        this.providerTypes = this.data?.ProviderTypes;
        this.serviceTypes = this.data?.ServiceTypes;
        this.affectedAreas = this.data?.AffectedAreas;
        this.taxableServices = this.data?.TaxableServices;
        this.setFieldLabels();
        this.watchServiceCode();
        this.loadHeaderCategories();
        this.loadPreventiveServiceTypes();
        this.getServiceCodes();
        //initialize search parameters
        this.initializeSearch();
        this.getList();
    }
    ngAfterViewInit(): void {
        if (!this.editMode)
        this.inputServiceCode?.nativeElement?.focus();
    }

    ngDoCheck() {
        if (this.data != null && this.data != undefined) {
            //Used to add Preventive Service Values
            if (this.data["PreventiveServices"] && this.headerCategories && this.IsPreventiveServiceAdded == false) {
                this.headerCategories?.forEach((objData) => {
                    if (objData?.data == "PreventiveServices" && this.data["PreventiveServices"]) {
                        for (let i = 0; i < this.data[objData?.data]?.length; i++) {
                            this.data[objData?.data][i][objData?.field + "_Name"] = this.getName(this.data[objData?.data][i]);
                            this.IsPreventiveServiceAdded = true;
                        }
                    }
                })
            }

            //Used to add Preventive Service Favorites  
            if (this.data["Favorites"] && this.headerCategories && this.IsFavouriteAdded == false) {
                this.headerCategories?.forEach((objData) => {
                    if (objData?.data == "Favorites" && this.data["Favorites"]) {
                        for (let i = 0; i < this.data[objData?.data]?.length; i++) {
                            this.data[objData?.data][i][objData?.field + "_UserName"] = this.getName(this.data[objData?.data][i]);
                            this.IsFavouriteAdded = true;
                        }
                    }
                })
            }
        }
    }

    setFieldLabels = () => {
        this.fieldLabels['AffectedAreaId'] = 'unknown';
        this.fieldLabels['AffectedAreaName'] = 'Affected Area';
        this.fieldLabels['CdtCodeId'] = 'unknown';
        this.fieldLabels['CdtCodeName'] = 'CDT Code';
        this.fieldLabels['Code'] = 'Service Code';
        this.fieldLabels['CPT'] = 'CPT';
        this.fieldLabels['DataTag'] = 'unknown';
        this.fieldLabels['DateModified'] = 'unknown';
        this.fieldLabels['Description'] = 'Description';
        this.fieldLabels['DiagnosisCode'] = 'AMA Diagnosis Code';
        this.fieldLabels['DisplayAs'] = 'Display As';
        this.fieldLabels['DrawTypeDescription'] = 'Draw Type';
        this.fieldLabels['DrawTypeId'] = 'unknown';
        this.fieldLabels['IconName'] = 'unknown';
        this.fieldLabels['InactivationDate'] = 'Inactivation Date';
        this.fieldLabels['InactivationRemoveReferences'] = 'Remove service code from all Applicable Swift Code and Preventive Care Categories';
        this.fieldLabels['IsActive'] = 'Status';
        this.fieldLabels['IsEligibleForDiscount'] = 'Eligible for Discount';
        this.fieldLabels['IsSwiftPickCode'] = 'unknown';
        this.fieldLabels['LastUsedDate'] = 'unknown';
        this.fieldLabels['LocationSpecificInfo'] = 'unknown';
        this.fieldLabels['Modifications'] = 'unknown';
        this.fieldLabels['Modifier'] = 'Modifier';
        this.fieldLabels['Notes'] = 'Notes';
        this.fieldLabels['ServiceCodeId'] = 'unknown';
        this.fieldLabels['ServiceTypeDescription'] = 'Service Type';
        this.fieldLabels['ServiceTypeId'] = 'unknown';
        this.fieldLabels['SetsToothAsMissing'] = 'Sets Tooth as Missing';
        this.fieldLabels['SubmitOnInsurance'] = 'Submit on Insurance';
        this.fieldLabels['SwiftPickServiceCodes'] = 'unknown';
        this.fieldLabels['TimesUsed'] = 'unknown';
        this.fieldLabels['UserModified'] = 'unknown';
        this.fieldLabels['UsuallyPerformedByProviderTypeId'] = 'unknown';
        this.fieldLabels['UsuallyPerformedByProviderTypeName'] = 'Usually Performed By';

    }

    loadHeaderCategories = () => {
        this.header = [
            {
                label: this.localize?.getLocalizedString("Included In"),
                filters: false,
                sortable: false,
                sorted: false,
                size: 'col-sm-6 cell'
            },
            {
                label: this.localize?.getLocalizedString("Frequency"),
                filters: false,
                sortable: false,
                sorted: false,
                size: 'col-sm-6 cell'
            }
        ];
        this.headerCategories = [
            {
                label: this.localize?.getLocalizedString("Preventive Care"),
                show: false,
                data: "PreventiveServices",
                field: "PreventiveServiceTypeId",
                header: [
                    {
                        label: this.localize?.getLocalizedString("Preventive Care Categories"),
                        filters: false,
                        sortable: false,
                        sorted: false,
                        size: 'col-md-offset-1 col-sm-11 cell'
                    }
                ]
            },
            {
                label: this.localize?.getLocalizedString("Swift Codes"),
                show: false,
                data: "SwiftCodes",
                field: "Code",
                header: [
                    {
                        label: this.localize.getLocalizedString("Swift Code Name"),
                        filters: false,
                        sortable: false,
                        sorted: false,
                        size: 'col-md-offset-1 col-sm-11 cell'
                    }
                ]
            }
        ];
        if (this.hasViewChartButtonAccess) {
            this.headerCategories.push({
                label: this.localize?.getLocalizedString("Favorites"),
                show: false,
                data: "Favorites",
                field: "UserId",
                header: [
                    {
                        label: this.localize.getLocalizedString("User"),
                        filters: false,
                        sortable: false,
                        sorted: false,
                        size: 'col-md-offset-1 col-sm-11 cell'
                    }
                ]
            });
        }
    }

    openFeesByLocation() {
        this.feesByLocation = true;
        this.serviceFeesByLocation?.openPreviewDialog();
    }

    closeFeesByLocation = (event) => {
        this.feesByLocation = true;
        if (event)
            this.serviceCode.Data.LocationSpecificInfo = event;
        this.locationDataChanged = true;
    }

    //Watch data.ServiceCode for any changes and update serviceCode accordingly
    // initializes data required for add/edit on service-code
    watchServiceCode = () => {
        // set editMode to true or false
        this.editMode = (this.data?.ServiceCodeId != null) ? true : false;
        const hasAccess = this.editMode ? this.hasEditServiceCodeAccess : this.hasAddServiceCodeAccess;
        if (hasAccess) {
            if (!this.locationDataChanged) {
                this.filteredDrawTypes = this.drawTypes?.filter(x => x.AffectedAreaId == this.data?.ServiceCode?.AffectedAreaId)

                // clear the validation markers

                this.serviceCodeError = false;
                this.serviceDescriptionError = false;
                this.serviceTypeIdError = false;
                this.affectedAreaIdError = false;
                this.saveAttempted = false;

                // set name to distinguish between service-code and swift-code add/edit success/error messages
                this.serviceCode.Name = this.serviceCode?.Data?.IsSwiftPickCode ? this.localize?.getLocalizedString('Swift Code') : this.localize.getLocalizedString('Service Code');
                this.serviceCode.Data = this.data?.ServiceCode;
                this.cdtCodeselected = this.serviceCode?.Data?.CdtCodeName;
                //Store initial copy of service code, to check for data modification
                this.serviceCodeInitial = cloneDeep(this.serviceCode?.Data);
                // if there is no icon name, show the default
                const defaultFileName = this.serviceCode?.Data?.IsSwiftPickCode ? 'default_swift_code.svg' : 'default_service_code.svg';
                this.serviceCode.Data.$$IconFileName = this.serviceCode?.Data?.IconName ? `${this.serviceCode?.Data?.IconName}.svg` : defaultFileName;

            }

            // initialize search parameters
            this.initializeSearch();
            if (this.editMode)
                this.inpDisplayAs?.nativeElement?.focus();
            else {
                    this.inputServiceCode?.nativeElement?.focus();
                    this.serviceCode.Data.IsEligibleForDiscount = true;
                    this.serviceCodeInitial.IsEligibleForDiscount = true;
            }
        }
        else {
            this.editMode != false ? this.notifyNotAuthorized(this.editServiceCodeAmfa) : this.notifyNotAuthorized(this.addServiceCodeAmfa);
        }
        if (this.editMode) {
            this.checkServiceCodeUsage();
        }
        this.locationDataChanged = false;
    };


    //When affected area soar-select-list value changes change the options for draw types soar-select-list and ng-model associated with it accordingly
    affectedAreaChange = (affectedArea) => {
        if (affectedArea && affectedArea.Id != 5) {
            this.serviceCode.Data.UseCodeForRangeOfTeeth = false;
            this.serviceCode.Data.SetsToothAsMissing = false;
            this.serviceCode.Data.AffectedAreaName = affectedArea?.Name;
            this.serviceCode.Data.AffectedAreaId = affectedArea?.Id;
        }
        else if (affectedArea && affectedArea.Id == 5) {
            this.serviceCode.Data.AffectedAreaId = affectedArea?.Id;
            this.serviceCode.Data.AffectedAreaName = affectedArea?.Name;
        } else if (!affectedArea) {
            // this.serviceCode.Data.AffectedAreaName = "Select Affected Area";
            this.serviceCode.Data.AffectedAreaId = 0;
        }
        const affectedAreaId = affectedArea ? affectedArea?.Id : null;
        this.filteredDrawTypes = this.drawTypes?.filter(x => x.AffectedAreaId == affectedAreaId)
        const drawType = this.filteredDrawTypes?.find(x => x.DrawTypeId == this.serviceCode?.Data?.DrawTypeId);
        this.soarSelectListComponent.optionList = this.filteredDrawTypes;
        this.soarSelectListComponent.initSelectionList();
        if (!drawType && this.serviceCode.Data.DrawTypeId != null) {
            // Clear the display value in combo-box and its corresponding id
            this.serviceCode.Data.DrawTypeDescription = null;
            this.serviceCode.Data.DrawTypeId = null;
        }
    }

    validateServiceTypeChange = (serviceType) => {
        if (this.serviceTypes) {
            // Find item by its display text as find by id will not provide proper results if user inputs guid ids.
            const item = this.serviceTypes?.find(x => x.Description == serviceType);

            if (item == null) {
                // Clear the display value in soar-select-list and its corresponding id
                this.serviceCode.Data.ServiceTypeDescription = null;
                this.serviceCode.Data.ServiceTypeId = null;
            } else {
                //Set id corresponding to the selected item
                this.serviceCode.Data.ServiceTypeDescription = item?.Description;
                this.serviceCode.Data.ServiceTypeId = item?.ServiceTypeId;
            }
        }
        this.validateServiceCode(this.serviceCode.Data);
    };

    validateAffectedAreaChange = (affectedArea) => {
        // Validate for smart code groups
        affectedArea = this.affectedAreas?.find(x => x.Name == affectedArea);
        if (this.editMode && this.serviceCode?.Data.UseSmartCodes) {
            const associatedCodeInfo = this.getAssociatedSmartCodes();
            if (associatedCodeInfo && associatedCodeInfo.count > 0) {
                this.openWarningModal(associatedCodeInfo);
            } else {
                this.affectedAreaChange(affectedArea);
                this.serviceCode.Data.UseSmartCodes = false;
                this.validateSmartCodeSetup(this.serviceCode.Data);
            }
        } else {
            this.affectedAreaChange(affectedArea);
        }
        this.validateServiceCode(this.serviceCode?.Data);
    };

    getAssociatedSmartCodes = () => {
        const associatedSmartCodes = { count: 0, codes: "" };

        this.allServiceCodes?.forEach((code) => {
            for (let i = 1; i <= 5; i++) {
                const smartCode = `SmartCode${i}Id`;
                if (this.serviceCode.Data.ServiceCodeId == code[smartCode]) {
                    associatedSmartCodes.count = associatedSmartCodes.count + 1;
                    associatedSmartCodes.codes += `${String(code?.Code)}, `;
                    return;
                }
            }
        });
        associatedSmartCodes.codes = associatedSmartCodes.codes.replace(/,\s*$/, "");
        return associatedSmartCodes;
    }


    // open warning modal
    openWarningModal = (associatedCodeInfo) => {
        const oldAffectedAreaName = cloneDeep(this.serviceCode?.Data?.AffectedAreaName);
        const title = this.localize.getLocalizedString("Warning");
        const message = this.localize.getLocalizedString('This service exists in smart code group(s) for {0} and must be removed from that smart code group prior to changing the affected area.', [associatedCodeInfo.codes]);
        const button1Text = this.localize.getLocalizedString("OK");
        this.modalFactory.ConfirmModal(title, message, button1Text).then(() => {
            this.serviceCode.Data.AffectedAreaName = oldAffectedAreaName;
        });
    }

    validateSmartCodeSetup = (serviceCode) => {
        this.serviceCode.Data.UseCodeForRangeOfTeeth = serviceCode.UseCodeForRangeOfTeeth;
        if (serviceCode.UseSmartCodes == true || serviceCode.UseSmartCodes == "true") {
            this.serviceCode.Data = serviceCode;
        } else {
            this.serviceCode.Data.UseSmartCodes = false;
            this.serviceCode.Data.SmartCode1Id = null;
            this.serviceCode.Data.SmartCode2Id = null;
            this.serviceCode.Data.SmartCode3Id = null;
            this.serviceCode.Data.SmartCode4Id = null;
            this.serviceCode.Data.SmartCode5Id = null;
        }

        if (this.editMode && this.serviceCode?.Data?.AffectedAreaId == 5 && (this.serviceCode?.Data?.UseCodeForRangeOfTeeth == false)) {
            const associatedCodeInfo = this.getAssociatedSmartCodes();
            if (associatedCodeInfo && associatedCodeInfo?.count > 0) {
                this.openWarningModal(associatedCodeInfo);
                this.serviceCode.Data.UseCodeForRangeOfTeeth = true;
            }
        }
    }


    //#endregion

    //#region validation 



    validateServiceCode = (serviceCode) => {
        if (this.saveAttempted === true) {
            this.serviceCodeIsValid = true;
            this.serviceCodeError = false;
            this.serviceDescriptionError = false;
            this.serviceTypeIdError = false;
            this.affectedAreaIdError = false;
            this.serviceCodeError = false;

            serviceCode.Code = serviceCode?.Code?.toString().trim();
            if (serviceCode?.Code === undefined || serviceCode?.Code === null || serviceCode?.Code === '') {
                this.serviceCodeError = true;
                this.serviceCodeIsValid = false;

                    this.inputServiceCode?.nativeElement?.focus();
            }
            serviceCode.Description = serviceCode?.Description?.toString().trim();
            if (serviceCode?.Description === undefined || serviceCode?.Description === null || serviceCode?.Description === '') {
                this.serviceDescriptionError = true;
                this.serviceCodeIsValid = false;
                    this.inputDescription?.nativeElement?.focus();
            }

            if (serviceCode?.ServiceTypeId === undefined || serviceCode?.ServiceTypeId === null || serviceCode?.ServiceTypeId === '') {
                this.serviceTypeIdError = true;
                this.serviceCodeIsValid = false;
                    this.lstServiceType?.nativeElement?.focus();

            }

            if (serviceCode?.AffectedAreaId === undefined || serviceCode?.AffectedAreaId === null || serviceCode?.AffectedAreaId === 0 || serviceCode?.AffectedAreaId === '') {
                this.affectedAreaIdError = true;
                this.serviceCodeIsValid = false;
                    this.lstAffectedArea?.nativeElement?.focus();
            }
        }
    };

    ////#endregion

    //#region Authorization
    // view access
    authViewAccess = (): boolean => {
        this.hasAuthViewAccess = this.patSecurityService.IsAuthorizedByAbbreviation('soar-biz-bsvccd-view');
        return this.hasAuthViewAccess;
    }

    // delete access 
    authDeleteAccess = (): boolean => {
      this.hasAuthDeleteAccess = this.patSecurityService.IsAuthorizedByAbbreviation('soar-biz-bsvccd-delete');
      return this.hasAuthDeleteAccess;
    }

    authAccess = () => {
        this.hasViewAccess = this.authViewAccess();
        this.hasAddServiceCodeAccess = this.authAddServiceCodeAccess();
        this.hasEditServiceCodeAccess = this.authEditServiceCodeAccess();
        this.hasViewChartButtonAccess = this.authViewChartButtonAccess();
        this.hasDeleteAccess = this.authDeleteAccess();
        if (!this.hasViewAccess) {
            this.toastrFactory.error(this.localize.getLocalizedString('User is not authorized to access this area.'), this.localize.getLocalizedString('Not Authorized'));
            window.location.href = encodeURIComponent('/');
        }
    }

    getServiceCodes = () => {
        this.allServiceCodes = this.referenceDataService?.get(this.referenceDataService.entityNames.serviceCodes);
    };

    // check if user has access for add service code
    authAddServiceCodeAccess = (): boolean => {
        this.hasAuthAddServiceCodeAccess = this.patSecurityService?.IsAuthorizedByAbbreviation(this.addServiceCodeAmfa);
        return this.hasAuthAddServiceCodeAccess;
    };

    // check if user has access for edit service code
    authEditServiceCodeAccess = (): boolean => {
        this.hasAuthEditServiceCodeAccess =  this.patSecurityService?.IsAuthorizedByAbbreviation(this.editServiceCodeAmfa);
        return this.hasAuthEditServiceCodeAccess
    };
    
    authViewChartButtonAccess = (): boolean => {
        this.hasAuthViewChartButtonAccess = this.patSecurityService?.IsAuthorizedByAbbreviation(this.viewChartButtonAmfa);
        return this.hasAuthViewChartButtonAccess;
    };

    //Notify user, he is not authorized to access current area
    notifyNotAuthorized = (authMessageKey) => {
        this.toastrFactory?.error(this.patSecurityService?.generateMessage(authMessageKey), 'Not Authorized');
        this.updateServiceCodeList?.emit(null)
    };

    loadPreventiveServiceTypes(): void {
        this.preventiveCareService.accessForServiceType();
        this.preventiveCareService
            .prevCareItems().then(items => {
                this.preventiveServiceTypes = items;
            })
            .catch(err => {
                this.toastrFactory.error(this.localize.getLocalizedString('Failed to load list of {0}. Refresh the page to try again.', ['Preventive Care Items']), this.localize.getLocalizedString('Server Error'));
            });
    }


    //#endregion


    //#region Cdt Code Search
    initializeSearch = () => {
        // initial take amount
        this.takeAmount = 45;
        // initial limit (rows showing)
        this.limit = 15;
        this.limitResults = true;
        // Empty string for search
        this.searchParams = {
            searchTerm: ''
        };
        //current searchString
        this.searchString = '';
        // Set the default search variables
        this.resultCount = 0;
        // to hold result list
        this.searchResults = [];
        // Search timeout queue
        this.searchTimeout = null;
    };
    // Boolean to display search loading gif
    searchIsQueryingServer = false;


    // Perform the search
    search = (term) => {
        if (term) {
            // Don't search if not needed!
            if (this.searchIsQueryingServer || (this.resultCount > 0 && this.searchResults?.length == this.resultCount) || this.searchString?.length === 0) {
                this.noSearchResults = false;
                return;
            }
            // set variable to indicate status of search
            this.searchIsQueryingServer = true;
            const searchParams = {
                search: this.searchString,
                skip: this.searchResults?.length,
                take: this.takeAmount,
                sortBy: this.sortCol,
                includeInactive: this.includeInactive
            };
            this.cdtCodeService?.search(searchParams).then((res) => {
                this.searchGetOnSuccess(res);
            }, () => {
                this.searchGetOnError();
            });
        }
    };

    searchGetOnSuccess = (res) => {
        this.resultCount = res.Count;
        // Set the cdt code list

        this.searchResults = res.Value
        if (this.searchString.length <= 0) {
            this.resultCount = 0;
            this.searchResults = [];
        }
        if (this.searchResults?.length > 0) {
            this.searchResults?.forEach(code => {
                code["Name"] = code?.Code;
            });
        }
        // set variable to indicate whether any results
        this.noSearchResults = this.searchString.length <= 0 ? false : (this.resultCount === 0);
        // reset  variable to indicate status of search = false
        this.searchIsQueryingServer = false;
    };

    searchGetOnError = () => {
        // Toastr alert to show error
        this.toastrFactory.error(this.localize.getLocalizedString('Please search again.'), this.localize.getLocalizedString('Server Error'));
        // if search fails reset all scope let
        this.searchIsQueryingServer = false;
        this.resultCount = 0;
        this.searchResults = [];
        this.noSearchResults = true;
    };

    // notify of search-string change
    activateSearch = (searchTerm) => {
        if (this.searchString != searchTerm) {
            this.searchString = searchTerm;
            if (!this.serviceCode.IsServiceCodeUsed) {
                // reset limit when search changes
                this.limit = 15;
                this.limitResults = true;
                this.resultCount = 0;
                this.searchResults = [];
                this.search(searchTerm);
            }
        } else {
            this.noSearchResults = false;
        }
    };

    // Handle click event to select cdt code
    selectResult = (selectedCdt) => {
        if (selectedCdt) {
            const selectedCdtVal = this.cdtCodes?.find(x => x.Code == selectedCdt)
            this.selectedCdtCode = selectedCdtVal;
            this.serviceCode.Data.CdtCodeId = this.selectedCdtCode?.CdtCodeId;
            this.serviceCode.Data.CdtCodeName = this.selectedCdtCode?.Code;
            this.searchParams.searchTerm = this.selectedCdtCode?.Code;
            this.searchString = this.selectedCdtCode?.Code;

            this.serviceCode.Data.UseSmartCodes = false;
            this.serviceCode.Data.UseCodeForRangeOfTeeth = false;

            this.serviceCode.Data.SmartCode1Id = null;
            this.serviceCode.Data.SmartCode2Id = null;
            this.serviceCode.Data.SmartCode3Id = null;
            this.serviceCode.Data.SmartCode4Id = null;
            this.serviceCode.Data.SmartCode5Id = null;

            let item = null;
            this.serviceCode.Data.Description = this.selectedCdtCode?.Description;
            //When DisplayAs is empty, show the code number instead
            if (selectedCdt.DisplayAs == "") {
                this.serviceCode.Data.DisplayAs = this.selectedCdtCode?.Code;
            }
            else {
                this.serviceCode.Data.DisplayAs = this.selectedCdtCode?.DisplayAs;
            }
            this.serviceCode.Data.SubmitOnInsurance = this.selectedCdtCode?.SubmitOnInsurance;

            item = this.taxableServices?.find(x => x.Id == this.selectedCdtCode?.TaxableServiceTypeId);
            if (item != null) {
                this.serviceCode.Data.TaxableServiceTypeId = item.Id;
                this.serviceCode.Data.TaxableServiceTypeName = item.Name;
            }

            item = this.affectedAreas?.find(x => x.Id == this.selectedCdtCode?.AffectedAreaId);
            if (item != null) {
                this.serviceCode.Data.DrawTypeDescription = null;
                this.serviceCode.Data.DrawTypeId = null;
                this.serviceCode.Data.AffectedAreaId = item.Id;
                this.serviceCode.Data.AffectedAreaName = item.Name;
                this.filteredDrawTypes = this.drawTypes?.filter(x => x.AffectedAreaId == item.Id);
                this.soarSelectListComponent.optionList = this.filteredDrawTypes;
                this.soarSelectListComponent.initSelectionList();
            }
        }
        this.validCdtCodeServerMessage = "";
    };

    openCTDCodePickerModal = () => {
        if (this.authViewAccess()) {
            this.showCTDCodePickerModal = true;
            this.cdtCodePickerModal?.openPreviewDialog();
        }
    }

    onCTDCodePickerModalClose = (event) => {
        this.cdtCodeselected = event?.Code;
        this.selectResult(this.cdtCodeselected);
        this.showCTDCodePickerModal = false;
    }

    getList = () => {
        this.cdtCodeService.getList().then((res) => {
                this.cdtCodeGetAllSuccess(res);
            }, () => {
                this.cdtCodeGetAllFailure();
            });
    }

    cdtCodeGetAllSuccess = (successResponse) => {
        this.cdtCodes = successResponse.Value;
    };

    cdtCodeGetAllFailure = () => {
        this.toastrFactory.error(this.localize.getLocalizedString('Failed to retrieve the list of {0}. Refresh the page to try again.', ['CDT Codes']), this.localize.getLocalizedString('Server Error'));
    };
    //#endRegion
    //#region soar-select-list event handlers

    //Blur event handler for service type input field
    serviceTypeBlur = () => {
        if (this.serviceTypes) {
            // Find item by its display text as find by id will not provide proper results if user inputs guid ids.
            const item = this.serviceTypes?.find(x => x.Description == this.serviceCode?.Data?.ServiceTypeDescription);
            if (item == null) {
                // Clear the display value in soar-select-list and its corresponding id
                this.serviceCode.Data.ServiceTypeDescription = null;
                this.serviceCode.Data.ServiceTypeId = null;
            } else {
                //Set id corresponding to the selected item
                this.serviceCode.Data.ServiceTypeDescription = item?.Description;
                this.serviceCode.Data.ServiceTypeId = item?.ServiceTypeId;
            }
        }
    };

    //Blur event handler for affected area input field
    affectedAreaBlur = () => {
        if (this.affectedAreas) {
            // Find item by its display text as find by id will not provide proper results if user inputs digits.
            const item = this.affectedAreas?.find(x => x.Name == this.serviceCode.Data.AffectedAreaName);
            if (item == null) {
                // Get the default value
                const defaultItem = this.getDefaultValue(this.affectedAreas, "Id", this.serviceCode.Data.AffectedAreaId);

                if (defaultItem != null) {
                    // Set the display value in soar-select-list and its corresponding id
                    this.serviceCode.Data.AffectedAreaName = defaultItem?.Name;
                    this.serviceCode.Data.AffectedAreaId = defaultItem?.Id;
                }
            } else {
                //Set id corresponding to the selected item
                this.serviceCode.Data.AffectedAreaName = item?.Name;
                this.serviceCode.Data.AffectedAreaId = item?.Id;
            }
        }
    };

    //Blur event handler for usually performed by input field
    usuallyPerformedByProviderTypeBlur = () => {
        // Find item by its display text as find by id will not provide proper results if user inputs digits.
        if (this.serviceCode.Data.UsuallyPerformedByProviderTypeName != undefined && this.serviceCode.Data.UsuallyPerformedByProviderTypeName != null) {
            const item = this.providerTypes?.find(x => x.Name == this.serviceCode?.Data?.UsuallyPerformedByProviderTypeName);
            if (item == null) {
                // Clear the display value in soar-select-list and its corresponding id
                this.serviceCode.Data.UsuallyPerformedByProviderTypeName = null;
                this.serviceCode.Data.UsuallyPerformedByProviderTypeId = null;
            } else {
                //Set id corresponding to the selected item
                this.serviceCode.Data.UsuallyPerformedByProviderTypeId = item.Id;
            }
        }
        else {
            this.serviceCode.Data.UsuallyPerformedByProviderTypeName = null;
            this.serviceCode.Data.UsuallyPerformedByProviderTypeId = null;
        }

    };

    //Blur event handler for draw type input field
    drawTypeBlur = () => {
        if (this.drawTypes) {
            // Find item by its display text as find by id will not provide proper results if user inputs guid ids.
            const item = this.drawTypes?.find(x => x.Description == this.serviceCode?.Data?.DrawTypeDescription);
            if (item == null) {
                // Clear the display value in soar-select-list and its corresponding id
                this.serviceCode.Data.DrawTypeDescription = null;
                this.serviceCode.Data.DrawTypeId = null;
            }
            else {
                //Set id corresponding to the selected item
                this.serviceCode.Data.DrawTypeDescription = item?.Description;
                this.serviceCode.Data.DrawTypeId = item?.DrawTypeId;
            }
        }
    };

    //#endregion

    // Verify service code usage from server
    checkServiceCodeUsage = () => {
        if (this.serviceCode?.Data?.ServiceCodeId && this.serviceCode?.Data?.CdtCodeId) {
            this.serviceCodesService?.checkForServiceCodeUsage(this.serviceCode?.Data?.ServiceCodeId).then((res: SoarResponse<boolean>) => {
                this.serviceCode.IsServiceCodeUsed = res?.Value;
                this.searchParams.searchTerm = this.serviceCode?.Data?.CdtCodeName;
                this.validCdtCodeServerMessage = '';
            }, () => {
                this.toastrFactory.error(
                    this.localize.getLocalizedString('Failed to retrieve the list of {0}. Refresh the page to try again.', ['Service Codes']),this.localize.getLocalizedString('Server Error'));
            });
        }
    };

    //#region service-code unique check

    // Verify unique service code from server
    checkUniqueServiceCode = () => {
        if (this.serviceCode?.Data?.Code) {
            const serviceCodeId = this.serviceCode?.Data?.ServiceCodeId ? this.serviceCode?.Data?.ServiceCodeId : "00000000-0000-0000-0000-000000000000";
                const params = { "ServiceCodeId": serviceCodeId, "Code": this.serviceCode?.Data?.Code };
                this.swiftCodeService.checkDuplicate(params).then((res: SoarResponse<boolean>) => {
                    this.serviceCode.IsDuplicate = res?.Value;
                    this.checkUniqueServiceCodeGetSuccess();
                }, () => {
                    this.checkUniqueServiceCodeGetFailure();
                });
        }
    };

    // Success callback handler to notify user after verifying unique service code
    checkUniqueServiceCodeGetSuccess = () => {
        // Check if service code already exists
        if (this.serviceCode?.IsDuplicate == true)
            this.uniqueServiceCodeServerMessage = this.localize.getLocalizedString('Service Code must be unique');
    };

    // Error callback handler to notify user after it failed to verify unique service code
    checkUniqueServiceCodeGetFailure = () => {
        this.serviceCode.IsDuplicate = true;
        this.uniqueServiceCodeServerMessage = this.localize.getLocalizedString('Could not verify unique service code. Please try again');
    };
    //#endregion

    //#region utility function

    // Function to reset duplicate flag on service-code value change
    serviceCodeOnChange = () => {
        this.serviceCodeError = false
        this.serviceCode.IsDuplicate = false;
    };

    // Function to get default values of soar-select-list
    getDefaultValue = (dataArray:AffectedAreas[], dataProperty:string, dataValue:number) => {
         return dataArray?.find(item => item[dataProperty] === dataValue);
    }
    //#endregion

    //callback function to handle cancel function
    cancelOnClick = () => {
        if (this.serviceCodeForm) {
            this.dataHasChanged = this.serviceCodeForm.dirty;
        }

        if (this.dataHasChanged == true || this.dataHasChangedSmartCode == true) //to check any changes in form
            this.modalFactory.CancelModal().then(this.cancelChanges);
        else
            this.cancelChanges();
    }

    // cancel changes made to service code and close modal
    cancelChanges = () => {
        // close this screen
        this.closeCategories();
        this.displayActiveStatusConfirmation = false;
        this.updateServiceCodeList.emit(null);
        this.data.ShowServiceCodesList = true;
    }

    closeCategories = () => {        
        if (this.headerCategories && this.headerCategories?.length > 0) {
            this.headerCategories.forEach((category) => {
                category.show = false;
            });

            for (let i = 0; i < this.headerCategories?.length; i++) {
                this.headerCategories[i]["Show"] = false;
            }
        }
    }

    scrollFieldInViewArea = (fieldLabel) => {
        if ($('header') != null && $(fieldLabel) != null && $('header') != undefined && $(fieldLabel) != undefined) {
            const h = $('header').height();
            const eTop = $(fieldLabel).offset()?.top;
            const s = eTop - (h + 40);
            $(window).scrollTop(s);
        }
    }

    saveServiceCode = () => {
        // if we're valid and don't have a duplicate name, save
        if (this.serviceCode.IsDuplicate == true) {
            this.uniqueServiceCodeServerMessage = this.localize?.getLocalizedString('Service Code must be unique');

            // Set focus to code input box
            this.inputServiceCode?.nativeElement?.focus();
            this.scrollFieldInViewArea('#inpServiceCode');
        }
        else {
         // InactivationDate Save
         if (this.editMode) {
            if (this.serviceCode.Data.IsActive) {
                this.serviceCode.Data.InactivationDate = null;
            } else if (this.serviceCode.Data.IsActive === false && this.serviceCode.Data.InactivationDate === null) {
                this.serviceCode.Data.InactivationDate = new Date(this.momentDate);
            }
        }
        else {
            if (!this.serviceCode.Data.IsActive) {
                this.serviceCode.Data.InactivationDate = new Date(this.momentDate);
          }
        }
            if (this.searchParams?.searchTerm && this.searchParams?.searchTerm !== "" && this.serviceCode?.Data?.CdtCodeId != null) {               
                this.cdtCodeService.IsValid({
                    "Code": this.searchParams?.searchTerm
                }).then((res) => {
                    this.saveServiceCodeSuccessHandler(res);
                }, () => {
                    this.saveServiceCodeErrorHandler();
                });
            }
            else {
                if (this.searchParams?.searchTerm && !this.editMode) {
                    this.serviceCode.Data.CdtCodeId = '';
                    this.serviceCode.Data.CdtCodeName = '';
                }
                if (this.displayActiveStatusConfirmation) {
                    this.serviceCode.Data.IsActive = true;
                }
                this.serviceCode.Data.Modifications = reduce<Accumulator[]>(this.serviceCodeInitial, (accumulator: Accumulator[], value: string, key: string) => { 
                    if (isEqual(value, this.serviceCode?.Data[key]) || isEqual(key, 'AffectedAreaId') || isEqual(key, 'CdtCodeId')
                        || isEqual(key, 'DrawTypeId') || isEqual(key, 'ServiceTypeId') || isEqual(key, 'UsuallyPerformedByProviderTypeId')) {
                        return accumulator;
                    }

                    const label = (this.fieldLabels[key] ? this.fieldLabels[key]?.toString() : null)
                    let oldValue = null;
                    let newValue = null;

                    if (isEqual(key, 'InactivationRemoveReferences') || isEqual(key, 'IsActive') || isEqual(key, 'IsEligibleForDiscount')
                        || isEqual(key, 'IsSwiftPickCode') || isEqual(key, 'SetsToothAsMissing') || isEqual(key, 'SubmitOnInsurance')) {

                        oldValue = (value) ? 'active' : 'inactive';
                        newValue = (this.serviceCode.Data[key]) ? 'active' : 'inactive';
                    } else {
                        oldValue = (value) ? value.toString() : null;
                        newValue = (this.serviceCode.Data[key]) ? this.serviceCode.Data[key].toString() : null;
                    }

                    return accumulator.concat({ Name: this.serviceCodeInitial?.Code, Field: key, Label: label, OldValue: oldValue, NewValue: newValue });
                }, []);

                // clearing the service cache since one of them is being changed
                const scCache = this.cacheFactory?.GetCache('ServiceCodesService','aggressive', 60000, 60000);
                if (scCache) {
                    this.cacheFactory?.ClearCache(scCache);
                }
                this.swiftCodeService.save(this.serviceCode?.Data, 'ServiceCodeId').then((res: ServiceCodeModel) => {
                     // handle save success flow
                    const isUpdate = this.serviceCode.Data['ServiceCodeId'] ? true : false;
                    this.closeCategories();
                    const updatedServiceCode = res;
                    this.updateServiceCodeList.emit(updatedServiceCode);
                    this.data.ShowServiceCodesList = true;

                    if (!isUpdate) { // Create
                        this.toastrFactory.success(this.localize.getLocalizedString("{0} created successfully.", [this.serviceCode?.Name]), 'Success');
                    } else { // Update
                        this.toastrFactory.success(this.localize.getLocalizedString("{0} updated successfully.", [this.serviceCode?.Name]), 'Success');
                    }
           
                }, () => {
                    // handle focusing logic when validation fails.
                    this.saveAttempted = true;
                    this.validateServiceCode(this.serviceCode?.Data);
                    this.serviceCode.Saving = false;
                    const errorMessage = "Failed to create {0}.";
                    this.toastrFactory.error(this.localize.getLocalizedString(errorMessage, [this.serviceCode?.Name]), 'Error');
                })
            }
            this.displayActiveStatusConfirmation = false;
        }
    }

    saveServiceCodeSuccessHandler = (successResponse) => {
        this.referenceDataService.forceEntityExecution(this.referenceDataService?.entityNames?.preventiveServiceTypes);
        this.referenceDataService.forceEntityExecution(this.referenceDataService?.entityNames?.preventiveServicesOverview);
        if (successResponse.Value != null) {
            const cdtCode = successResponse?.Value;
            this.validCdtCodeServerMessage = "";
            this.serviceCode.Data.CdtCodeName = cdtCode?.Code;
            this.serviceCode.Data.CdtCodeId = cdtCode?.CdtCodeId;
            // call validate to reset Valid parameter
            this.swiftCodeService?.validate(this.serviceCode?.Data).then(res => {
                this.serviceCode.Valid = res;

                //swiftCodeService  save is not correctly validating the object
                this.saveAttempted = true;
                this.validateServiceCode(this.serviceCode?.Data);

                // explicitly set Valid
                if (isUndefined(this.serviceCode?.Valid) || this.serviceCode?.Valid === null) {
                    this.serviceCode.Valid = false;
                }
                if (this.serviceCode.Valid) {
                    if (this.displayActiveStatusConfirmation) {
                        this.serviceCode.Data.IsActive = true;
                    }
                    this.swiftCodeService.save(this.serviceCode?.Data, 'ServiceCodeId').then((res: ServiceCodeModel) => {
                        // handle save success flow
                        const isUpdate = this.serviceCode.Data['ServiceCodeId'] ? true : false;
                        this.closeCategories();
                        const updatedServiceCode = res;
                        this.updateServiceCodeList?.emit(updatedServiceCode);
                        this.data.ShowServiceCodesList = true;
    
                        if (!isUpdate) { // Create
                            this.toastrFactory.success(this.localize.getLocalizedString("{0} created successfully.", [this.serviceCode?.Name]), 'Success');
                        } else { // Update
                            this.toastrFactory.success(this.localize.getLocalizedString("{0} updated successfully.", [this.serviceCode?.Name]), 'Success');
                        }
               
                    }, () => {
                        // handle focusing logic when validation fails.
                        this.saveAttempted = true;
                        this.validateServiceCode(this.serviceCode?.Data);
                        this.serviceCode.Saving = false;
                        const errorMessage = "Failed to create {0}.";
                        this.toastrFactory.error(this.localize.getLocalizedString(errorMessage, [this.serviceCode?.Name]), 'Error');
                    })
                }
            }, () => {
                const errorMessage = "Failed to validate {0}.";
                this.toastrFactory.error(this.localize.getLocalizedString(errorMessage, [this.serviceCode?.Name]), 'Error');
            });
        } else {
            this.validCdtCodeServerMessage = this.localize?.getLocalizedString('Enter a valid CDT Code.');
        }
    }

    saveServiceCodeErrorHandler = () => {
        this.isValidCdtCode = false;
        this.validCdtCodeServerMessage = this.localize?.getLocalizedString('Could not verify CDT Code. Please try again');
    }

    // Open smart code setup window
    openSmartCodeSetup = () => {
        this.smartCodeSetup.ngOnInit();
        this.smartCodeRes = cloneDeep(this.smartCodeSetup.serviceCode);
        this.smartCodeSetup?.openPreviewDialog()
    }

    closeSmartCode = (data) => {
        if (data) {
            this.serviceCode.Data = data;
            const result = !isEqual(this.smartCodeRes, data)
            if(result) {
                this.dataHasChangedSmartCode = result;
            }
            this.validateSmartCodeSetup(this.serviceCode?.Data);
        }
       
    }

    getName = (id: { PreventiveServiceTypeId: string }): string => {
        const found:PreventiveLinkedServices = this.preventiveServiceTypes?.find(x => x.PreventiveServiceTypeId == id?.PreventiveServiceTypeId);
        if (found) {
            return found.Description;
        }
        return (this.localize.getLocalizedString("Not Found") as string);
    };

    deleteReference = (serviceCode, type) => {
        if (type.data == "SwiftCodes") {
            if (serviceCode.IsActive && serviceCode.SwiftPickServiceCodes.length > 1) {
                this.setupSwiftCode(serviceCode);
                this.removeServiceCodeFromSwiftCode(this.serviceCode.Data);
                this.saveSwiftPickCode();
            }
            else {
                this.setupSwiftCode(serviceCode);
                this.swiftPickCrud.editMode = true;
                this.swiftPickCrud.serviceCode.Data = cloneDeep(serviceCode);
                this.swiftPickServiceCode = cloneDeep(serviceCode);
                this.swiftPickCrud.openDialog();
            }
        }
        else if (type.data == "PreventiveServices") {
            this.removePreventiveServiceCode(serviceCode);
        }
    };

    onSwiftCodeModalClose = (res) => {
        this.closeCategories();
        this.serviceCodesService?.getSwiftCodesAttachedToServiceCode(this.serviceCode?.Data?.ServiceCodeId).then((res:SoarResponse<ServiceCodeModel[]>) => {
            this.data.SwiftCodes = cloneDeep(res?.Value);
        }, () => {
            this.toastrFactory.error(
              this.localize.getLocalizedString('Failed to retrieve the list of {0}. Refresh the page to try again.', ['Swift Pick Codes']),this.localize.getLocalizedString('Server Error'));
        });
       
        const updatedServiceCode = cloneDeep(res);
        this.updateServiceCodeList?.emit(updatedServiceCode);        
    }

    setupSwiftCode = (swift) => {
        // save the serviceCode object into the scope variable
        this.swiftCode.Data = swift;
        this.swiftCode.Name = this.swiftCode.Data.IsSwiftPickCode ? this.localize.getLocalizedString('Swift Code') :
            this.localize.getLocalizedString('Service Code');
        this.swiftCode.Data.ServiceTypeDescription = "Swift Code";

        //Store initial copy of service code, to check for data modification
        this.swiftCodeInitial = cloneDeep(this.swiftCode.Data);
        this.dataHasChanged = false;
        this.confirmCancel = false;

        this.setSwiftpickFees(swift);
        // set editMode to true or false
        this.editMode = this.swiftCode.Data.ServiceCodeId ? true : false;
    };


    //Removes the service code
    removeServiceCodeFromSwiftCode = (selectedService) => {
        if (this.swiftCode.Data.IsActive) {
            const index = this.swiftCode?.Data?.SwiftPickServiceCodes?.findIndex(x => x.ServiceCodeId == selectedService?.ServiceCodeId);
            if (this.editMode && index == 0 && this.swiftCode?.Data?.SwiftPickServiceCodes?.length == 1) {
                this.swiftCode.Data.SwiftPickServiceCodes = [];
            }
            else
                this.swiftCode?.Data?.SwiftPickServiceCodes?.splice(index, 1);
        }
    };


    // Set the fees for swift picks when editing
    setSwiftpickFees = (serviceCode) => {
        if (serviceCode.SwiftPickServiceCodes) {
            const codesList = this.swiftCode?.Data?.SwiftPickServiceCodes;
            const serviceCodes = [];
            this.swiftCode.Data.SwiftPickServiceCodes = [];
            codesList.forEach((code) => {
                serviceCodes.push(this.referenceDataService.setFeesByLocation(code));
            });
            this.swiftCode.Data.SwiftPickServiceCodes = serviceCodes;
        }
    };

    // save swift pick code
    saveSwiftPickCode = () => {        
        this.swiftCodeService?.validate(this.serviceCode?.Data).then(res => {
            this.serviceCode.Valid = res;
            if (this.serviceCode?.Valid) {
                //Check if duplicate swift pick code exists before saving
                const serviceCodeId = this.swiftCode?.Data?.ServiceCodeId ? this.swiftCode?.Data?.ServiceCodeId : "00000000-0000-0000-0000-000000000000";
                const params = { "ServiceCodeId": serviceCodeId, "Code": this.swiftCode?.Data?.Code};
                this.swiftCodeService.checkDuplicate(params).then((res: SoarResponse<boolean>) => {
                    this.serviceCode.IsDuplicate = res?.Value;
                    this.saveSwiftPickCodeCheckUniqueServiceCodeGetSuccess();
                }, () => {
                    this.checkUniqueServiceCodeGetFailure();
                });
            }
        }, () => {
            const errorMessage = "Failed to validate {0}.";
            this.toastrFactory.error(this.localize.getLocalizedString(errorMessage, [this.serviceCode?.Name]), 'Error');
        });
    }

    // Success callback handler to notify user after verifying unique service code before saving
    saveSwiftPickCodeCheckUniqueServiceCodeGetSuccess = () => {
        // Check if service code already exists
        if (this.swiftCode.IsDuplicate == true) {
            this.uniqueSwiftPickCodeServerMessage = this.localize.getLocalizedString('A code with this name already exists...');
            // Set focus to code input box
            this.inpSwiftPickCode?.nativeElement?.focus();
        }
        else {
            this.isAtleastOneServiceCode = this.swiftCode.Data.SwiftPickServiceCodes.length > 0 ? true : false;
            // if we're valid  and atleast, one service code
            if (this.swiftCode.Valid && this.isAtleastOneServiceCode) {
                if (this.swiftCode.Data.Fee > 0)
                    this.swiftCode.Data.Fee = 0;
                if (this.displayActiveStatusConfirmation)
                    this.swiftCode.Data.IsActive = true;

                if (this.swiftCode.Data.LocationSpecificInfo) {
                    this.swiftCode.Data.LocationSpecificInfo = null;
                }
                if (this.swiftCode.Data.TaxableServiceTypeId) {
                    this.swiftCode.Data.TaxableServiceTypeId = 0;
                }
                this.swiftCodeService.save(this.serviceCode?.Data, 'ServiceCodeId').then((result: ServiceCodeModel) => {
                     // handle save success flow
                    const isUpdate = this.serviceCode?.Data['ServiceCodeId'] ? true : false;
                    this.closeCategories();
                    this.serviceCodesService?.getSwiftCodesAttachedToServiceCode(this.serviceCode?.Data?.ServiceCodeId).then((res:SoarResponse<ServiceCodeModel[]>) => {
                        this.data.SwiftCodes = cloneDeep(res?.Value);
                    }, () => {
                        this.toastrFactory.error(
                        this.localize.getLocalizedString('Failed to retrieve the list of {0}. Refresh the page to try again.', ['Swift Pick Codes']),this.localize.getLocalizedString('Server Error'));
                    });
                    const updatedServiceCode = cloneDeep(result);
                    this.updateServiceCodeList?.emit(updatedServiceCode);

                    if (!isUpdate) { // Create
                        this.toastrFactory.success(this.localize.getLocalizedString("{0} created successfully.", [this.serviceCode?.Name]), 'Success');
                    } else { // Update
                        this.toastrFactory.success(this.localize.getLocalizedString("{0} updated successfully.", [this.serviceCode?.Name]), 'Success');
                    }
           
                }, () => {
                    this.serviceCode.Saving = false;
                    const errorMessage = "Failed to create {0}.";
                    this.toastrFactory.error(this.localize.getLocalizedString(errorMessage, [this.serviceCode?.Name]), 'Error');
                })
            }
        }
    };

    reloadFavorites = () => {
        this.closeCategories();
        if (this.authViewChartButtonAccess()) {
            this.data.Favorites = this.chartingFavoritesFactory.GetAllFavoritesContainingServiceId(this.serviceCode.Data.ServiceCodeId);
        }
    };

    removePreventiveServiceCode = (serviceCode) => {
        if (serviceCode?.PreventiveServiceTypeId && serviceCode?.PreventiveServiceId) {
            if (this.hasDeleteAccess) {
                this.preventiveCareService.RemovePreventiveServiceById(serviceCode?.PreventiveServiceTypeId, serviceCode?.PreventiveServiceId).then(() => {
                    this.reloadPreventiveServiceCodes();
                    if (this.usePracticeApiForPreventiveServiceTypes == false) {
                        this.referenceDataService.forceEntityExecution(this.referenceDataService.entityNames.preventiveServiceTypes);
                        this.referenceDataService.forceEntityExecution(this.referenceDataService.entityNames.preventiveServicesOverview);
                    }
                }).catch ((error) => { });
            } else {
                this.toastrFactory.error(this.localize.getLocalizedString('User is not authorized to access this area.'), this.localize.getLocalizedString('Not Authorized'));
            }
        }
    };

    reloadPreventiveServiceCodes = () => {
        this.closeCategories();
        if (this.hasViewAccess) {
            this.preventiveCareService.GetPreventiveServicesForServiceCode(this.serviceCode?.Data?.ServiceCodeId).then((res: SoarResponse<ServiceCodeModel[]>) => {
                this.IsPreventiveServiceAdded = false;
                this.data.PreventiveServices = res?.Value;
            }).catch ((error) => { });
        } else {
            this.toastrFactory.error(this.localize.getLocalizedString('User is not authorized to access this area.'), this.localize.getLocalizedString('Not Authorized'));
        }
    }

    toggleIsActive = (event) => {   
        if (event == true) {
            this.serviceCode.Data.InactivationRemoveReferences = false;
        }     
    }
}
