import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import cloneDeep from 'lodash/cloneDeep';
import { PageChangeEvent, GridComponent } from '@progress/kendo-angular-grid';
import { SortDescriptor, State } from '@progress/kendo-data-query';
import isEqual from 'lodash/isequal';
import omit from 'lodash/omit';

import { Search1Pipe } from 'src/@shared/pipes/search1/search1.pipe';
import { OrderByPipe } from 'src/@shared/pipes';
import { ServiceTypes } from '../service-types';
import { SwiftpickCodeCrudComponent } from '../swiftpick-code-crud/swiftpick-code-crud.component';
import { ServiceCodeModel } from '../service-code-model'
import { ServiceCodeCrudComponent } from '../service-code-crud/service-code-crud.component';
import { ServiceCodesService } from 'src/@shared/providers/service-codes.service';
import { SoarResponse } from 'src/@core/models/core/soar-response';
import { ServiceCodeSearchInitialDataService } from '../service-code-search-initial-data.service';
import { PreventiveCareService } from 'src/@shared/providers/preventive-care.service';

@Component({
  selector: 'service-code-search',
  templateUrl: './service-code-search.component.html',
  styleUrls: ['./service-code-search.component.scss']
})
export class ServiceCodeSearchComponent implements OnInit {
  @ViewChild('grid') grid: GridComponent;

  serviceCodes: ServiceCodeModel[];

  breadCrumbs: { name: string, path: string, title: string }[] = [];
  currentBreadcrumbName:  string
  addServiceCodeAmfa: string = 'soar-biz-bsvccd-add';
  addSwiftCodeAmfa: string = 'soar-biz-bsvccd-aswift';
  editServiceCodeAmfa: string = 'soar-biz-bsvccd-edit';
  editSwiftCodeAmfa: string = 'soar-biz-bsvccd-eswift';
  @ViewChild(SwiftpickCodeCrudComponent) swiftPickCrud: SwiftpickCodeCrudComponent
  @ViewChild(ServiceCodeCrudComponent) serviceCodeCrud: ServiceCodeCrudComponent
  // Controller level
  viewServiceCodeAmfa: string = 'soar-biz-bsvccd-view';
  viewReportAmfa: string = 'soar-report-report-view';
  viewChartButtonAmfa: string = 'soar-biz-bizusr-vchbtn';
  dataForCrudOperation = {
    ShowServiceCodesList: true,
    SwiftCodes: [],
    PreventiveServices: [],
    Favorites: [],
    DataHasChanged: false,
    ServiceTypes: [],
    IsCreateOperation: false,
    AffectedAreas: [],
    UsuallyPerformedByProviderTypes: [],
    DrawTypes: [],
    ProviderTypes: [],
    TaxableServices: [],
    ServiceCode: null,
    ServiceCodeId: null,
    BreadCrumbs: [],
  };
  updatingList: boolean = false;
  updateDisabled: boolean = false;
  updatedServiceCodes = [];
  updatedServiceCodesWithErrors = [];
  saveUpdatedListMessage: string = '';
  loadingMessage = this.localize.getLocalizedString('Loading') + '...';
  savingMessage = this.localize.getLocalizedString('Saving Changes') + '...';
  filterServiceList: string | null = '';
  loadingServices = false;
  filteringServices = false;
  filtersVisible = false;
  searchServiceCodesKeyword: string = '';
  allowInactive: boolean = false;
  serviceAndSwiftTypes: Array<ServiceTypes> = []
  serviceTypes: Array<ServiceTypes>;
  reports: [{
    ReportTitle: ''
  }];
  selectedReport = { ReportId: 0 };
  hasReportAccess: boolean = true;
  ServiceCodeByServiceTypeProductivityReportId = 17;
  orderBy = {
    field: 'Code',
    asc: 1
  };
  showSwiftCodesModal: boolean = false;
  backupServiceCodes: any = []; //ToDo: Replace any type with type specific array in integration story
  swiftPickServiceCode;
  filteredServiceCodes: any = [];
  keysToOmit: any = ['$$Dirty', '$$AffectedAreaName', '$$OriginalAffectedAreaId', '$$UsuallyPerformedByProviderTypeName', '$$SubmitOnInsuranceName', '$$SubmitOnInsuranceNo', '$$SubmitOnInsuranceYes', '$$IsEligibleForDiscountName', '$$IsEligibleForDiscountNo', '$$IsEligibleForDiscountYes', '$$IsActiveName', '$$IsActiveNo', '$$IsActiveYes'];
  hasSoarAddSwiftAccess: boolean = false;

  public state: State = {
    skip: 0,
    take: 10,
  };

  public sort: SortDescriptor[] = [
    {
      field: "Code",
      dir: "asc",
    },
  ];

  public pageable = {
    buttonCount: 3,
    info: true
  };

  constructor(@Inject('localize') private localize,
    @Inject('patSecurityService') private patSecurityService,
    @Inject('$location') private $location,
    @Inject('ReportsFactory') private reportsFactory,
    @Inject('toastrFactory') private toastrFactory,
    @Inject('ModalFactory') private modalFactory,
    @Inject('ChartingFavoritesFactory') private chartingFavoritesFactory,
    @Inject('referenceDataService') private referenceDataService,
    private searchPipe: Search1Pipe,
    private serviceCodesService: ServiceCodesService,
    public serviceCodeSearchInitialDataService: ServiceCodeSearchInitialDataService,
    private preventiveCareService: PreventiveCareService
  ) { }

  ngOnInit(): void {
    this.getPageNavigation();
    this.authViewAccess();
    this.getReports();
    this.authAddSwiftCodeAccess();
    this.serviceCodeSearchInitialDataService.serviceCodeSearchInitialData().then(response => {
      if (response) {
        this.dataForCrudOperation.ServiceTypes = response.ServiceTypes;
        this.dataForCrudOperation.AffectedAreas = response.AffectedAreas;
        this.dataForCrudOperation.UsuallyPerformedByProviderTypes = response.ProviderTypes;
        this.serviceTypes = cloneDeep(response.ServiceTypes);
        this.serviceAndSwiftTypes = cloneDeep(this.serviceTypes);
        this.serviceAndSwiftTypes.push({ Description: 'Swift Code' });
        this.dataForCrudOperation.ProviderTypes = response.ProviderTypes;
        this.dataForCrudOperation.DrawTypes = response.DrawTypes;
        this.dataForCrudOperation.TaxableServices = response.TaxableServices;

        this.serviceCodes = response.ServiceCodes;
        this.serviceCodes = this.assignCustomProperties();
        this.filteredServiceCodes = this.serviceCodes;
        this.initializeServiceCodeSearchData();
      }
    });
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
        name: this.localize.getLocalizedString('Service & Swift Codes'),
        path: '#/BusinessCenter/ServiceCode/',
        title: 'Service & Swift Codes'
      }
    ];
  }
  //end region

  //#region Auth
  authViewAccess = () => {
    if (!this.patSecurityService.IsAuthorizedByAbbreviation(this.viewServiceCodeAmfa)) {
      this.notifyNotAuthorized(this.viewServiceCodeAmfa);
        this.$location.path(encodeURIComponent('/'));
    }
    this.hasReportAccess = this.patSecurityService.IsAuthorizedByAbbreviation(this.viewReportAmfa);
  }

  authEditServiceCodeAccess = () => {
    return this.patSecurityService.IsAuthorizedByAbbreviation(this.editServiceCodeAmfa);
  };

  // check if user has access for add service code
  authAddServiceCodeAccess = () => {
    return this.patSecurityService.IsAuthorizedByAbbreviation(this.addServiceCodeAmfa);
  };

  // check if user has access for add swift code
  authAddSwiftCodeAccess = () => {
    this.hasSoarAddSwiftAccess = this.patSecurityService.IsAuthorizedByAbbreviation(this.addSwiftCodeAmfa);
  };

  //Notify user, he is not authorized to access current area
  notifyNotAuthorized = (authMessageKey) => {
    this.toastrFactory.error(this.patSecurityService.generateMessage(authMessageKey), 'Not Authorized');
  }

  //end region

  //#region setup all required data.
  initializeServiceCodeSearchData = () => {
    this.loadingServices = false;
    // get all service codes from server.
    this.serviceCodes = this.assignCustomProperties();
    this.filterServiceCodes();
  };

  //#endregion

  getReports = () => {
    if (this.hasReportAccess) {
      this.reports = this.reportsFactory.GetReportArray([this.ServiceCodeByServiceTypeProductivityReportId]);
    }
  }

  createServiceCode = () => {
    if (this.authAddServiceCodeAccess()) {
      this.dataForCrudOperation.ShowServiceCodesList = false;

      const emptyServiceCode = <ServiceCodeModel>{
        TaxableServiceTypeId: this.dataForCrudOperation.TaxableServices ? this.dataForCrudOperation.TaxableServices[0].Id : null,
        TaxableServiceTypeName: this.dataForCrudOperation.TaxableServices ? this.dataForCrudOperation.TaxableServices[0].Name : null,
        AffectedAreaId: this.dataForCrudOperation.AffectedAreas ? this.dataForCrudOperation.AffectedAreas[0].Id : 0,
        AffectedAreaName: this.dataForCrudOperation.AffectedAreas ? this.dataForCrudOperation.AffectedAreas[0].Name : null,
        UseCodeForRangeOfTeeth: false,
        IsActive: true,
        IsEligibleForDiscount: false,
        SubmitOnInsurance: true,
        IsSwiftPickCode: false,
        UseSmartCodes: false,
      }
      this.dataForCrudOperation.ServiceCode = emptyServiceCode;
      this.dataForCrudOperation.ServiceCodeId = null;
      this.breadCrumbs.push(
        {
          name: this.localize.getLocalizedString('Add a Service Code'),
          path: '#/BusinessCenter/ServiceCode/',
          title: 'Add a Service Code'
        }
      );
      this.dataForCrudOperation.SwiftCodes = [];
      this.preventiveCareService.accessForServiceCode();
      this.dataForCrudOperation.PreventiveServices = [];
      this.dataForCrudOperation.Favorites = [];
      this.dataForCrudOperation.IsCreateOperation = true;
      this.dataForCrudOperation.DataHasChanged = false;
      this.dataForCrudOperation.ShowServiceCodesList = false;
      this.dataForCrudOperation.ShowServiceCodesList = false;
    }

  }

  //TODO: page change event handle in angular js using paged-view. 
  pageChange(event: PageChangeEvent) {
    this.state.skip = event.skip;
  } 

  // handling save
  saveUpdatedList = () => {
    if (this.hasSoarAddSwiftAccess) {
      this.loadingServices = true;
      // if the affected area has changed, we need to clear the Draw Type like in the CRUD window because it will no longer be valid
      this.updatedServiceCodes.forEach((usc) => {
        if (!isEqual(usc.AffectedAreaId, usc.$$OriginalAffectedAreaId) && usc.DrawTypeId) {
          usc.DrawTypeId = null;
        }
      });
      this.serviceCodesService?.UpdateServiceCodes(this.updatedServiceCodes).then((res:SoarResponse<ServiceCodeModel>) => {
        if (res && res?.Value && Array.isArray(res?.Value)) {
          res.Value?.forEach((updatedServiceCode) => {
            this.assignCustomProperties(updatedServiceCode);
            let index = this.serviceCodes?.findIndex((sc) => sc?.ServiceCodeId === updatedServiceCode?.ServiceCodeId);
            if (index !== -1) {
              this.serviceCodes.splice(index, 1, updatedServiceCode);
            }
            this.toastrFactory.success(this.localize.getLocalizedString('Your {0} have been updated.', ['Service Codes']), this.localize.getLocalizedString('Success'));
          }, () => {
            this.toastrFactory.error(this.localize.getLocalizedString('Failed to update the list of {0}. Refresh the page to try again.', ['Service Codes']), this.localize.getLocalizedString('Server Error'));
          });
          this.filteredServiceCodes = this.serviceCodes;
          this.backupServiceCodes = cloneDeep(this.filteredServiceCodes);
          this.resetDataForInlineEdit(false);
          this.loadingServices = false;
        }
        else {
          this.loadingServices = false;
        }
        this.referenceDataService.forceEntityExecution(this.referenceDataService.entityNames.serviceCodes);
        this.filterServiceCodes();
      });
    }
  }

  //handling cancel
  cancelUpdatedList = () => {
    if (this.hasSoarAddSwiftAccess) {
      if (this.updatedServiceCodes.length > 0) {
        this.modalFactory.CancelModal().then(() => {
          this.resetDataForInlineEdit(true);
        });
      } else {
        this.filteredServiceCodes = cloneDeep(this.backupServiceCodes); //TODO:temp fix to restore original data, this is needed here as in Angular js they are using 3 variables: filteredServiceCodesForEdit(it's used for update list), updatedServiceCodes, backupServiceCodes and here we are managing using 2 variables: filteredServiceCodes & backupServiceCodes
        this.closeAllRows();
        this.updatedServiceCodesWithErrors.length = 0;
        this.updatingList = false;
      }
    }
  }

  serviceCodeUpdated = (updatedServiceCode) => {
    if (updatedServiceCode) {
      updatedServiceCode = this.referenceDataService.setFeesByLocation(updatedServiceCode);
      this.assignCustomProperties(updatedServiceCode);
      let copy = cloneDeep(updatedServiceCode);

      //Update swift pick code on update of swift pick code and referenced service codes
      if (updatedServiceCode.IsSwiftPickCode) {
        this.updateSwiftPickCodeServiceCodes(copy);
      } else {
        this.resetDataForCrud();
      }

      // replace the existing service code in service codes list
      let index = this.serviceCodes?.findIndex(x => x.ServiceCodeId == updatedServiceCode.ServiceCodeId);
      if (index > -1) {
        this.serviceCodes.splice(index, 1, copy);
      }
      // replace the existing service code in backup service codes list
      let indx = this.backupServiceCodes?.findIndex(x => x.ServiceCodeId == updatedServiceCode.ServiceCodeId);
      if (indx > -1) {
        this.backupServiceCodes.splice(indx, 1, copy);
      }
      //Update swift pick code on update of service code
      this.serviceCodes.forEach(obj => {
        if (obj.IsSwiftPickCode) {
          this.updateSwiftPickCodeServiceCodes(obj);
        }
      });

      this.referenceDataService.forceEntityExecution(this.referenceDataService.entityNames.serviceCodes);
      this.filterServiceCodes();
    } else {
      this.resetDataForCrud();
    }
  };

  //Update swift pick code service codes data
  updateSwiftPickCodeServiceCodes = (serviceCode) => {
    serviceCode.Fee = 0;
    serviceCode.SwiftPickServiceCodes.forEach(s => {
      let item = this.backupServiceCodes?.find(x => x.serviceCodeId == s.ServiceCodeId);
      if (item != null) {
        s.DataTag = item?.DataTag;
        s.Code = item?.Code;
        s.Description = item?.Description;
        s.CdtCodeName = item?.CdtCodeName;
        serviceCode.Fee += item?.Fee;
      }
    });
  }

  // reset helper
  resetDataForInlineEdit = (resetServiceCodesList) => {
    if (resetServiceCodesList) {
      this.filteredServiceCodes = cloneDeep(this.backupServiceCodes);
      this.filterServiceCodes();
    }

    this.closeAllRows();
    this.updatedServiceCodes.length = 0;
    this.updatedServiceCodesWithErrors.length = 0;
    this.updatingList = false;
  };

  changeFilter = (serviceType: string | null) => {
    this.filterServiceList = serviceType || '';

    this.updateDisabled = this.filterServiceList === 'Swift Code' ? true : false;
    this.filterServiceCodes();
  }

  editOptionClicked = (event) => {
    if (event?.dataItem != null && event?.dataItem != undefined) {
      if (event?.dataItem.IsSwiftPickCode == true) {
        this.swiftPickCrud.editMode = true;
        this.swiftPickCrud.serviceCode.Data = cloneDeep(event?.dataItem); 
        this.swiftPickServiceCode = cloneDeep(event?.dataItem);
        this.swiftPickCrud.openDialog();
      }
      else {
        this.editServiceCode(event?.dataItem);
      }
    }
  }
  //end region

  //#region Service Codes Modal
  createSwiftPickCode = () => {
    if (this.hasSoarAddSwiftAccess) {
      this.swiftPickCrud.editMode = false;
      this.swiftPickCrud.openDialog();
    }
  }

  onSwiftCodeModalClose = (newServiceCode) => {
    if (!this.swiftPickCrud.editMode) { // Add
      this.serviceCodeCreated(newServiceCode);
    } else { // Update
      this.serviceCodeUpdated(newServiceCode);
    }
  }

  editServiceCode = (serviceCode) => {
    if (this.authEditServiceCodeAccess()) {
      if (serviceCode) {
        let defaultItem = this.dataForCrudOperation.TaxableServices?.find(x => x.Id == serviceCode.TaxableServiceTypeId);
        if (defaultItem != null) {
          serviceCode.TaxableServiceTypeName = defaultItem.Name;
        }
        defaultItem = this.dataForCrudOperation.AffectedAreas?.find(x => x.Id == serviceCode.AffectedAreaId);
        if (defaultItem != null) {
          serviceCode.AffectedAreaName = defaultItem.Name;
        } else {
          serviceCode.AffectedAreaName = null;
        }

        defaultItem = this.dataForCrudOperation.DrawTypes?.find(x => x.DrawTypeId == serviceCode.DrawTypeId);

        if (defaultItem != null) {
          serviceCode.DrawTypeDescription = defaultItem.Description;
        } else {
          serviceCode.DrawTypeDescription = null;
        }

        defaultItem = this.dataForCrudOperation.UsuallyPerformedByProviderTypes?.find(x => x.Id == serviceCode.UsuallyPerformedByProviderTypeId);

        if (defaultItem != null) {
          serviceCode.UsuallyPerformedByProviderTypeName = defaultItem.Name;
        } else {
          serviceCode.UsuallyPerformedByProviderTypeName = null;
        }

        serviceCode.$$locationFee = serviceCode.$$locationFee == 0 ? '' : serviceCode.$$locationFee;

        this.dataForCrudOperation.ServiceCode = cloneDeep(serviceCode);
        this.dataForCrudOperation.ServiceCodeId = cloneDeep(serviceCode.ServiceCodeId);
        this.breadCrumbs.push(
          {
            name: this.localize.getLocalizedString('Edit a Service Code'),
            path: '#/BusinessCenter/ServiceCode/',
            title: 'Edit a Service Code'
          }
        );
        this.serviceCodesService?.getSwiftCodesAttachedToServiceCode(serviceCode?.ServiceCodeId).then((res: SoarResponse<ServiceCodeModel[]>) => {
          this.dataForCrudOperation.SwiftCodes = res?.Value;
        });
        this.preventiveCareService.accessForServiceCode();
        this.preventiveCareService.GetPreventiveServicesForServiceCode(serviceCode?.ServiceCodeId).then((res: SoarResponse<ServiceCodeModel[]>) => {
          this.dataForCrudOperation.PreventiveServices = cloneDeep(res?.Value);
        });
        this.dataForCrudOperation.Favorites = this.chartingFavoritesFactory.GetAllFavoritesContainingServiceId(serviceCode?.ServiceCodeId);
        this.dataForCrudOperation.IsCreateOperation = false;
        this.dataForCrudOperation.DataHasChanged = false;
        this.dataForCrudOperation.ShowServiceCodesList = false;
      } else {
        this.toastrFactory.error(this.localize.getLocalizedString('There was an error while attempting to retrieve service code.'),
          this.localize.getLocalizedString('Server Error'));
      }
    } else {
      this.notifyNotAuthorized(this.editServiceCodeAmfa);
    }
  }


  resetDataForCrud = () => {
    this.dataForCrudOperation.DataHasChanged = false;
    this.dataForCrudOperation.ShowServiceCodesList = true;
    this.dataForCrudOperation.ServiceCode = null;
    this.breadCrumbs.pop();
  }


  filterServiceCodes = () => {
    let resultSet = [];
    const orderPipe = new OrderByPipe();

    resultSet = this.serviceCodes.filter((code) => this.filterServiceType(code));
    resultSet = orderPipe.transform(resultSet, { sortColumnName: this.orderBy.field, sortDirection: this.orderBy.asc });

    if (this.searchServiceCodesKeyword) {
      resultSet = this.searchPipe.transform(resultSet, { Code: this.searchServiceCodesKeyword, CdtCodeName: this.searchServiceCodesKeyword, Description: this.searchServiceCodesKeyword });
    }

    this.state.skip = 0;
    this.filteredServiceCodes = resultSet;
  }

  onCheckChanged = (event) => {
    this.allowInactive = event.target.checked;
    this.filterServiceCodes();
  }

  //#region Sorting
  filterServiceType = (code) => {
    return ((code.ServiceTypeDescription == this.filterServiceList || this.filterServiceList == "") && (this.allowInactive || code.IsActive));
  };


  //end region

  serviceCodeCreated = (newServiceCode) => {
    if (newServiceCode) {
      newServiceCode = this.referenceDataService.setFeesByLocation(newServiceCode);
      this.assignCustomProperties(newServiceCode);
      this.serviceCodes.push(newServiceCode);
      this.backupServiceCodes.push(newServiceCode);
      if (!newServiceCode.IsSwiftPickCode) {
        this.resetDataForCrud();
      }
      this.referenceDataService.forceEntityExecution(this.referenceDataService.entityNames.serviceCodes);
      this.filterServiceCodes();
    } else {
      this.resetDataForCrud();
    }
  }

  updatedList = () => {
    if (this.hasSoarAddSwiftAccess) {
      this.state.skip = 0;
      this.loadingServices = true;

      this.backupServiceCodes = cloneDeep(this.filteredServiceCodes);
      this.filteredServiceCodes = this.backupServiceCodes.filter((sc) => !sc.SwiftPickServiceCodes);
      this.editAllRows();
      this.updatingList = true;
      this.loadingServices = false;
    }
  }

  // used to determine which rows have changes and if any of those have validation errors
  dataChanged = (serviceCode, rowIndex) => {
    const original = this.serviceCodes.filter((sc) => sc.ServiceCodeId == serviceCode.ServiceCodeId)[0];
    serviceCode.$$Dirty = !isEqual(
      omit(serviceCode, this.keysToOmit),
      omit(original, this.keysToOmit)
    );

    this.filteredServiceCodes[rowIndex] = serviceCode;
    this.updatedServiceCodes = this.filteredServiceCodes.filter((sc) => sc.$$Dirty);
    this.updatedServiceCodesWithErrors = this.updatedServiceCodes.filter((upsc) => !upsc.Description);
  }

  // used to manage yes and no checkboxes in grid edit mode
  checkboxChanged = (event, serviceCode, propertyName, flag, rowIndex) => {
    if (!event.target.checked) event.preventDefault();

    serviceCode['$$' + propertyName + 'No'] = flag ? false : true;
    serviceCode['$$' + propertyName + 'Yes'] = !flag ? false : true;
    serviceCode[propertyName] = flag;

    this.dataChanged(serviceCode, rowIndex);
  }

  selectedReportChange = (reportId) => {
    const currentReport = this.reports[reportId - 1];
    this.reportsFactory.OpenReportPage(currentReport,
      '/BusinessCenter/ServiceCode/' + currentReport?.ReportTitle?.replace(/\s/g, ''), true);
    this.selectedReport.ReportId = 0;
  }


  editAllRows = () => {
    this.filteredServiceCodes.forEach((sc, i) => {
      this.grid.editRow(i);
    });
  }

  closeAllRows = () => {
    // close all rows to display readonly view of data
    this.filteredServiceCodes.forEach((sc, i) => {
      this.grid.closeRow(i);
    }); 
  }

  onKendoSelectionChange = (event, propertyName, serviceCode, rowIndex) => {
    serviceCode[propertyName] = event && event.toString();

    this.dataChanged(serviceCode, rowIndex);
  }
  //end region

  //#region Search Service Codes
  onSearchServiceCodesKeywordChange = () => {
    this.filteringServices = true;
    this.filterServiceCodes();
    this.filteringServices = false;
  }
  //end region

  // helper for assigning custom properties used by inline edit
  assignCustomProperties(serviceCode = null) {
    const serviceCodes = serviceCode ? [serviceCode] : this.serviceCodes;
    if (serviceCodes?.length > 0) {
    serviceCodes.map((sc) => {
      // Dirty
      sc.$$Dirty = false;

      // ServiceTypeDescription
      const serviceType: any = this.dataForCrudOperation.ServiceTypes.filter((serviceType) => serviceType.ServiceTypeId === sc.ServiceTypeId);
      sc.ServiceTypeDescription = serviceType.length ? serviceType[0].Description : sc.ServiceTypeDescription;

      // AffectedArea
      const affectedArea: any = this.dataForCrudOperation.AffectedAreas.filter(res => res.Id === +sc.AffectedAreaId);
      sc.$$AffectedAreaName = affectedArea.length ? affectedArea[0].Name : '';
      sc.AffectedAreaId = sc.AffectedAreaId ? sc.AffectedAreaId.toString() : 0;
      sc.$$OriginalAffectedAreaId = cloneDeep(sc.AffectedAreaId);

      // UsuallyPerformedByProviderType
      const usuallyPerformedByProviderType: any = this.dataForCrudOperation.UsuallyPerformedByProviderTypes.filter(res => res.Id === +sc.UsuallyPerformedByProviderTypeId);
      sc.$$UsuallyPerformedByProviderTypeName = usuallyPerformedByProviderType.length ? usuallyPerformedByProviderType[0].Name : '';
      sc.UsuallyPerformedByProviderTypeId = sc.UsuallyPerformedByProviderTypeId ? sc.UsuallyPerformedByProviderTypeId.toString() : null;

      // SubmitOnInsurance
      sc.$$SubmitOnInsuranceName = this.localize.getLocalizedString(sc.SubmitOnInsurance ? 'Yes' : 'No');
      sc.$$SubmitOnInsuranceName = sc.SwiftPickServiceCodes === null ? sc.$$SubmitOnInsuranceName : '';
      sc.$$SubmitOnInsuranceNo = sc.SubmitOnInsurance ? false : true;
      sc.$$SubmitOnInsuranceYes = !sc.SubmitOnInsurance ? false : true;

      // IsEligibleForDiscount
      sc.$$IsEligibleForDiscountName = this.localize.getLocalizedString(sc.IsEligibleForDiscount ? 'Yes' : 'No');
      sc.$$IsEligibleForDiscountName = sc.SwiftPickServiceCodes === null ? sc.$$IsEligibleForDiscountName : '';
      sc.$$IsEligibleForDiscountNo = sc.IsEligibleForDiscount ? false : true;
      sc.$$IsEligibleForDiscountYes = !sc.IsEligibleForDiscount ? false : true;

      // IsActive
      sc.$$IsActiveName = this.localize.getLocalizedString(sc.IsActive ? 'Active' : 'Inactive');
      sc.$$IsActiveNo = sc.IsActive ? false : true;
      sc.$$IsActiveYes = !sc.IsActive ? false : true;
    });
   }
    return serviceCodes;
  };

  rowClass = (args) => ({
    "inactive": !this.updatingList && !(args.dataItem.IsActive)
  });
      //#region manage breadcrumbs

    // handle URL update for breadcrumbs
changePageState =  (breadcrumb)=> {
  this.currentBreadcrumbName = breadcrumb;
   this.dataForCrudOperation.DataHasChanged =this.serviceCodeCrud?.serviceCodeForm.dirty;
  if (this.dataForCrudOperation?.DataHasChanged && this.breadCrumbs.length > 2) {
      this.modalFactory.CancelModal().then(() => {
        this.changePath();
      });
  } else {
      this.changePath();
  }
  document.title = this.currentBreadcrumbName;
};

// change URL
changePath =  ()=> {
  let breadcrumb = this.breadCrumbs.find(x=>x.name==this.currentBreadcrumbName)
  if (breadcrumb.name === this.localize.getLocalizedString('Service & Swift Codes')) {
      // Show the service-code list
      this.resetDataForCrud();
  } else {
      // Jump to business-center page
      window.location.href = breadcrumb.path;
  }
  document.title = breadcrumb.title;
};
//#endregion

  reportListBlur = () => {
    this.selectedReport.ReportId = null;
  }
}
