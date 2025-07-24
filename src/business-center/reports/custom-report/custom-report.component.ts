import { Component, OnInit, Inject } from '@angular/core';
import * as moment from 'moment';
import { Subscription } from 'rxjs';
import { SoarResponse } from 'src/@core/models/core/soar-response';
import { GroupTypeService } from 'src/@shared/providers/group-type.service';
import { GroupType } from 'src/business-center/practice-settings/patient-profile/group-types/group-type';
declare let _: any;
declare var angular: any;
@Component({
  selector: 'custom-report',
  templateUrl: './custom-report.component.html',
  styleUrls: ['./custom-report.component.scss']
})
export class CustomReportComponent implements OnInit {

  constructor(@Inject('toastrFactory') private toastrFactory, @Inject('localize') private localize,
              @Inject('$location') private $location, @Inject('ModalFactory') private modalFactory,
              @Inject('$routeParams') private route, @Inject('patSecurityService') private patSecurityService,
              @Inject('ReportsService') private reportsService, private groupTypeService: GroupTypeService,
              @Inject('CustomReportService') private customReportService, @Inject('ReportsFactory') private reportsFactory
              ) { }
  readAmfa = 'soar-report-custom-read';
  createAmfa = 'soar-report-custom-create';
  updateAmfa = 'soar-report-custom-update';
  // document = this.localize.getLocalizedString('Create New Report');
  showFilters = false;
  isEdit = false;
  currentDate = new Date();
  maxDate = this.currentDate;
  isformDirty = false;
   firstDayOfMonth = new Date(
    this.currentDate.getFullYear(),
    this.currentDate.getMonth(),
    1
  );
  subscriptions: Array<Subscription> = new Array<Subscription>();

  invaliDate = this.localize.getLocalizedString(
    'Invalid Date'
  );
  report = {
    IncludeAllLocations: false,
    IncludeAllPatientGroups: true,
    IncludeAllProviders: false,
    LocationIds: [],
    ProviderIds: [],
    PatientGroupIds: [],
    DateFilter: 1,
    Category: null,
    Ignore: 1,
    origStartDate: null,
    origEndtDate: null,
    FromDate: null,
    ToDate: null,
    Name: '',
    Description: '',
    IncludeProduction: false,
    IncludeCollections: false,
    IncludeAdjustments: false
  };

  originalReport = {
    LocationIds: [],
    ProviderIds: [],
    PatientGroupIds: [],
    DateFilter: 1,
    Ignore: 1,
    Name: '',
    IncludeProduction: false,
    IncludeCollections: false,
    IncludeAdjustments: false
  };
  methodCallFlag = true;
  appliedReport;
  copyReportObject;
  patientGroups;
  reportLocations;
  reportProviders;
  reportPatientGroups;
  reportId;
  data;
  userCode;
  showMoreMax = 5;
  filteredProviders;
  nameError;
  showNameError;
  showCategoryError;
  showLocationError;
  showProviderError;
  showPatientGroupError;
  showItemsError;
  filterExpanded;
  time = moment();
  readyToDisplayLocations = false;
  readyToDisplayProviders = false;
  readyToDisplayPatientGroups = false;
  displayedLocations = '';
  displayedProviders = '';
  displayedPatientGroups = '';
  expanded = [false, false, false, false, false];
  isVisibleShowMorebuttonLocation = false;
  isVisibleShowMorebuttonProvider = false;
  isVisibleShowMorebuttonPatientGroup = false;
  locations = [];
  providers = [];
  patientReferralTypeOptions = [];
  showGrid = false;
  reportCategories = [
    { text: this.localize.getLocalizedString('Choose a Category'), value: null },
    { text: this.localize.getLocalizedString('Activity Reports'), value: '8' },
    { text: this.localize.getLocalizedString('Clinical Reports'), value: '6' },
    { text: this.localize.getLocalizedString('Financial Reports'), value: '5' },
    { text: this.localize.getLocalizedString('Insurance Reports'), value: '0' },
    { text: this.localize.getLocalizedString('Patient Reports'), value: '1' },
    { text: this.localize.getLocalizedString('Provider Reports'), value: '2' },
    { text: this.localize.getLocalizedString('Referral Reports'), value: '7' },
    { text: this.localize.getLocalizedString('Schedule Reports'), value: '3' },
    { text: this.localize.getLocalizedString('Service Reports'), value: '4' }
  ];

  dateCategories = [
    { text: this.localize.getLocalizedString('Today'), value: 1 },
    { text: this.localize.getLocalizedString('Month to Date'), value: 2 },
    { text: this.localize.getLocalizedString('Year to Date'), value: 3 },
    { text: this.localize.getLocalizedString('Custom Date Range'), value: 4 }
  ];
  breadCrumbs = [
    {
      name: this.localize.getLocalizedString('Business Center'),
      path: '#/BusinessCenter/PracticeSettings/',
      title: 'Practice Settings'
    },
    {
      name: this.localize.getLocalizedString('Reports'),
      path: '#/BusinessCenter/Reports/',
      title: 'Reports'
    },
    {
      name: this.localize.getLocalizedString('Custom'),
      path: '/BusinessCenter/Reports/Custom/Create',
      title: 'Custom'
    }
  ];

  errorRequiredDate = this.localize.getLocalizedString(
    'From Date and To Date are required'
  );
  errorDateRange = this.localize.getLocalizedString(
    'From date must be the same or less than to date.'
  );
  getOptions() {
    this.patientReferralTypeOptions.push({
      name: this.localize.getLocalizedString('All Sources'),
      value: 1
    });
  }

  changeOption(type, dateRange) {
    if (dateRange === 'DR') {
      this.report.DateFilter = Number(type.target.value);
       this.isformDirty = true;
      if (type.target.value === '4') {
        if (!isNaN(this.route.Id)) {
        this.report.FromDate = null;
        this.report.ToDate = null;
        } else {
          this.report.FromDate = this.currentDate;
          this.report.ToDate = this.currentDate;
        }
      }
      // else {
      //   this.report.origStartDate = null;
      //   this.report.origEndtDate = null;
      // }
    } else {
    if (type === 0) {
      if (!isNaN(this.route.Id)) {
      this.report.origStartDate = null;
      this.report.origEndtDate = null;
      } else {
        this.report.origStartDate = this.firstDayOfMonth;
        this.report.origEndtDate = this.currentDate;
      }
    } else {
      this.report.origStartDate = null;
      this.report.origEndtDate = null;
    }
    }
  }

   // amfa
   checkAccess(amfa) {
    if (!this.patSecurityService.IsAuthorizedByAbbreviation(amfa)) {
      this.$location.path('/');
    }
  }

  hasAccess(amfa) {
    return this.patSecurityService.IsAuthorizedByAbbreviation(amfa);
  }

  print() {
    this.showFilters = false;
    setTimeout(window.print, 0);
    this.reportsFactory.AddPrintedReportActivityEvent(this.reportId, true);
  }


    // initialize
    init() {
      this.reportId = this.route.Id;
      this.checkAccess(this.readAmfa);
      if (!isNaN(this.route.Id)) {
        this.isEdit = true;
        this.reportsService.GetCustom({  customReportId: this.route.Id },
          this.successService, this.retrieveGridFailure);
      } else {
        this.originalReport.Name = this.localize.getLocalizedString('Create a New Report');
        this.showFilters = true;
        this.isEdit = false;
      }

      // TODO: replace with new call to get locations user has access to
      this.customReportService.getLocations(this.getLocationsSuccess, this.failure('Get Locations'));
      this.customReportService.getProviders(this.getProvidersSuccess, this.failure('Get Providers'));

      this.subscriptions.push(this.groupTypeService.get()?.subscribe({
        next: (groupTypesList: SoarResponse<Array<GroupType>>) => this.getPatientGroupsSuccess(groupTypesList),
        error: () => this.failure('Get Patient Groups')
    }));

    }
    successService = (res: any) => {
      if (res) {
            this.showGrid = true;
            this.report = res.Value;
            this.report.DateFilter = this.report.DateFilter;
            this.report.FromDate = null;
            this.report.ToDate = null;
            this.report.Ignore = res.Value.OriginalTransactionDateFilter ? 0 : 1;
            // if (this.report.Ignore === '1') {
            //   this.report.origStartDate = this.firstDayOfMonth;
            //   this.report.origEndtDate = this.currentDate;
            // } else {
            this.report.Category = res.Value.Category.toString();
            this.report.origStartDate = null;
            this.report.origEndtDate = null;
            // }
            this.retrieveGrid();
            this.report.IncludeAllPatientGroups = this.report
              .IncludeAllPatientGroups
              ? true
              : false;
            this.report.IncludeAllProviders = this.report
              .IncludeAllProviders
              ? true
              : false;
            this.report.IncludeAllLocations = this.report
              .IncludeAllLocations
              ? true
              : false;
            this.originalReport = Object.assign({}, this.report);
            this.appliedReport = Object.assign({}, this.report);
            document.title = this.report.Name;
            if (this.readyToDisplayLocations) {
              this.setDisplayLocations();
            }
            if (this.readyToDisplayProviders) {
              this.setDisplayProviders();
            }
            if (this.readyToDisplayPatientGroups) {
              this.setDisplayPatientGroups();
            }
            this.readyToDisplayPatientGroups = true;
            this.readyToDisplayProviders = true;
            this.readyToDisplayLocations = true;
            this.retrieveGridSuccess(res);
          }
    }
    getLocationsSuccess = (res: any) => {
      this.showLessButton(res.Value, 'Location');
      _.each(res.Value, (item) => {
        const element = _.pick(
          item,
          'LocationId',
          'NameAbbreviation',
          'NameLine1',
          'NameLine2',
          'isVisible'
        );
        this.locations.push(element);
      });
      this.filterProviders();
      if (this.readyToDisplayLocations) {
        this.setDisplayLocations();
      }
      this.readyToDisplayLocations = true;
    }

    getProvidersSuccess = (res: any) => {
      this.showLessButton(res.Value, 'Provider');
      _.each(res.Value, (item) => {
        const element = _.pick(
          item,
          'FirstName',
          'LastName',
          'UserCode',
          'LocationIds',
          'UserId',
          'isVisible'
        );
        this.providers.push(element);
      });
      this.filterProviders();
      if (this.readyToDisplayProviders) {
        this.setDisplayProviders();
      }
      this.readyToDisplayProviders = true;
    }

    getPatientGroupsSuccess = (apiResponse: SoarResponse<Array<GroupType>>) => {
      if (apiResponse?.Value) {
      this.showLessButton(apiResponse.Value, 'PatientGroup');
      this.patientGroups = _.sortBy(apiResponse.Value, 'GroupTypeName');
         if (this.readyToDisplayPatientGroups) {
          this.setDisplayPatientGroups();
          }
           this.readyToDisplayPatientGroups = true;
      }
    }

    // creates the list of providers to display based on selected locations
    filterProviders() {
      if (
        (this.report.IncludeAllLocations === true ||
          this.report.LocationIds.length <= 0) &&
        this.providers.length > 0
      ) {
        this.filteredProviders = this.providers;
      } else {
        this.filteredProviders = _.filter(this.providers, (provider) => {
          for (const item of this.report.LocationIds) {
            for (const data of provider.LocationIds) {
              if (item === data) {
                return true;
              }
            }
          }
        });
      }
    }

    setDisplayLocations() {
      this.displayedLocations = '';
      this.reportLocations = _.filter(this.locations, (location) => {
        return _.find(this.appliedReport.LocationIds, (reportLocation) => {
          return reportLocation === location.LocationId;
        });
      });
      _.each(this.reportLocations, (location) => {
        this.displayedLocations = this.displayedLocations === '' ? location.NameLine1 : this.displayedLocations + ', ' + location.NameLine1;
      });
    }

    setDisplayProviders() {
      this.displayedProviders = '';
      this.reportProviders = _.filter(this.providers, (provider) => {
        return _.find(this.appliedReport.ProviderIds, (reportProvider) => {
          return reportProvider === provider.UserId;
        });
      });
      _.each(this.reportProviders, (provider) => {
            const ProviderFullname = provider.LastName + ', ' + provider.FirstName + (provider.UserCode ? ' - ' + provider.UserCode : '');
            this.displayedProviders = this.displayedProviders === '' ? ProviderFullname : this.displayedProviders + '; ' + ProviderFullname;
      });
    }

    filerCount() {
      let count = 0;
      count += this.report && this.report.LocationIds ? this.report.LocationIds.length : 0;
      count += this.report && this.report.LocationIds ? this.report.LocationIds.length : 0;
      count += this.report && this.report.LocationIds ? this.report.LocationIds.length : 0;
      count += !this.report || !this.report.DateFilter ? 0 : 1;
      count += this.report && this.report.IncludeProduction ? 1 : 0;
      count += this.report && this.report.IncludeCollections ? 1 : 0;
      count += this.report && this.report.IncludeAdjustments ? 1 : 0;
      return count;
    }
    setDisplayPatientGroups() {
      this.displayedPatientGroups = '';
      this.reportPatientGroups = _.filter(this.patientGroups, (patientGroup) => {
        return _.find(this.appliedReport.PatientGroupIds, (reportPatientGroup) => {
          return reportPatientGroup == patientGroup.MasterPatientGroupId;
        });
      });
      _.each(this.reportPatientGroups, (patientGroup) => {
        this.displayedPatientGroups = this.displayedPatientGroups === '' ? patientGroup.GroupTypeName : this.displayedPatientGroups + ', ' + patientGroup.GroupTypeName;
      });
    }

 // click events
 cancel() {
  if (!_.isEqual(this.report, this.originalReport)) {
    this.modalFactory.CancelModal().then(() => {
      this.changePageState(this.breadCrumbs[1]);
    });
  } else {
    this.changePageState(this.breadCrumbs[1]);
  }
}

applyFilters() {
  this.retrieveGrid();
}

retrieveGrid() {
  this.copyReportObject = Object.assign({}, this.report);
  if (this.copyReportObject.DateFilter !== 4) {
    delete this.copyReportObject.FromDate;
    delete this.copyReportObject.ToDate;
  }
  this.reportsService.GetCustomReportGrid(this.copyReportObject,
    this.retrieveGridSuccess, this.retrieveGridFailure);
}

retrieveGridSuccess = (res: any) => {
  this.showGrid = true;
  this.data = Object.assign({}, res.Value);
  const today = new Date();
  let from, to;
  switch (this.report.DateFilter) {
    case 1:
      from = today;
      to = from;
      break;
    case 2:
      from = new Date(today.getFullYear(), today.getMonth(), 1);
      to = today;
      break;
    case 3:
      from = new Date(today.getFullYear(), 0, 1);
      to = today;
      break;
    case 4:
      from = this.report.FromDate;
      to = this.report.ToDate;
      break;
  }
  this.data.fromDate = from;
  this.data.toDate = to;
  this.data.origStartDate = this.report.origStartDate;
  this.data.origEndtDate = this.report.origEndtDate;
  this.data.IgnoreSelected = 'Ignore';
  this.userCode = res.Value.GeneratedByUserCode;
  this.appliedReport = Object.assign({}, this.report);
  this.resetFooter();
}

resetFooter() {
  this.setDisplayLocations();
  this.setDisplayPatientGroups();
  this.setDisplayProviders();
}

retrieveGridFailure = (res: any) => {
  return () => {
    this.toastrFactory.error(
      this.localize.getLocalizedString('Failed to {0}', [res]),
      'Error'
    );
  };
}

cleanseReportForSelectAll() {
  if (this.report.IncludeAllPatientGroups === true) {
    this.report.IncludeAllPatientGroups = true;
    this.report.PatientGroupIds = [];
  }
  if (this.report.IncludeAllProviders === true) {
    this.report.IncludeAllProviders = true;
    this.report.ProviderIds = [];
  }
  if (this.report.IncludeAllLocations === true) {
    this.report.IncludeAllLocations = true;
    this.report.LocationIds = [];
  }
}

saveReport() {
  if (this.isValid()) {
    if (this.report.Name !== this.originalReport.Name) {
      if (this.patSecurityService.IsAuthorizedByAbbreviation(this.createAmfa)) {
        this.cleanseReportForSelectAll();
        this.reportsService.CreateCustom(
          this.report,
          this.success('created new report'),
          this.failCreate
        );
      }
    } else {
      if (this.patSecurityService.IsAuthorizedByAbbreviation(this.updateAmfa)) {
        this.cleanseReportForSelectAll();
        this.reportsService.UpdateCustom(
          this.report,
          this.success('saved report'),
          this.failure('save report')
        );
      }
    }
  }
}

success = (detail: any) => {
  return () => {
    this.toastrFactory.success(
      this.localize.getLocalizedString('Successfully {0}', [detail]),
      'Success'
    );
    this.changePageState(this.breadCrumbs[1]);
  };
}

failCreate = (res: any) => {
  if (res.data && res.data.InvalidProperties) {
    const nameInvalid = _.find(res.data.InvalidProperties, (property) => {
      return property.PropertyName === 'Name';
    });
    if (nameInvalid) {
      this.nameError = nameInvalid.ValidationMessage;
    } else {
      this.failure('create new report')();
    }
  } else {
    this.failure('create new report')();
  }
}

changePageState(breadcrumb) {
  window.open(breadcrumb.path, '_self');
}

onSelect(list, id) {
  list =
    list.indexOf(id) > -1
      ? list.splice(list.indexOf(id), 1)
      : list.push(id);
}

toggleSelect(list, id) {
  switch (list) {
    case 'Location':
      this.onSelect(this.report.LocationIds, id);
      this.filterProviders();
      break;
    case 'Provider':
      this.onSelect(this.report.ProviderIds, id);
      break;
    case 'PatientGroup':
      this.onSelect(this.report.PatientGroupIds, id);
      break;
  }
  // this.customReportBody.$dirty = true;
}

displayShowMore(flag) {
  switch (flag) {
    case 'Location':
      this.isVisibleShowMorebuttonLocation = !this.isVisibleShowMorebuttonLocation;
      break;
    case 'Provider':
      this.isVisibleShowMorebuttonProvider = !this.isVisibleShowMorebuttonProvider;
      break;
    case 'PatientGroup':
      this.isVisibleShowMorebuttonPatientGroup = !this.isVisibleShowMorebuttonPatientGroup;
      break;
  }
}

showMoreButton(rows, flag) {
  _.each(rows, (row) => {
    row.isVisible = true;
  });
  this.displayShowMore(flag);
}

showLessButton(rows, flag) {
  let i = 0;
  _.each(rows, (row) => {
    if (i < this.showMoreMax) {
      row.isVisible = true;
      i++;
    } else {
      row.isVisible = false;
    }
  });
  this.displayShowMore(flag);
}

toggleExpanded(index) {
  this.expanded[index] = !this.expanded[index];
}

toggleAll(toggle) {
  this.filterExpanded = toggle;
  for (const i in this.expanded) {
    if (i !== '') {
      this.expanded[i] = toggle;
    }
  }
  if (!toggle) {
    angular.element('.panel-collapse.in').collapse('hide');
  } else {
    angular.element('.panel-collapse:not(".in")').collapse('show');
  }
}

selectAllLocations() {
  this.report.LocationIds = [];
}

selectAllProviders() {
  this.report.ProviderIds = [];
}

selectAllPatientGroups() {
  this.report.PatientGroupIds = [];
}

reset() {
  this.report.LocationIds = this.originalReport.LocationIds;
  this.report.ProviderIds = this.originalReport.ProviderIds;
  this.report.PatientGroupIds = this.originalReport.PatientGroupIds;
  this.report.DateFilter = this.originalReport.DateFilter;
  this.report.IncludeProduction = this.originalReport.IncludeProduction;
  this.report.Ignore = this.originalReport.Ignore;
  if (!isNaN(this.route.Id)) {
      if (this.report.Ignore === 0) {
        this.report.origStartDate = null;
        this.report.origEndtDate = null;
      } else {
        this.report.origStartDate = this.firstDayOfMonth;
        this.report.origEndtDate = this.currentDate;
      }
  } else {
    this.report.origStartDate = this.firstDayOfMonth;
    this.report.origEndtDate = this.currentDate;
  }
  this.report.IncludeCollections =
  this.originalReport.IncludeCollections;
  this.report.IncludeAdjustments =
  this.originalReport.IncludeAdjustments;
  this.isVisibleShowMorebuttonLocation = false;
  this.isVisibleShowMorebuttonProvider = false;
  this.isVisibleShowMorebuttonPatientGroup = false;

}

  // helper methods


  isValid() {
    let valid = true;
    if (!this.report.Name || this.report.Name === '') {
      this.showNameError = true;
      valid = false;
    } else {
      this.showNameError = false;
    }
    // if (
    //   !_.find(this.reportCategories, (category)=> {
    //     return (
    //       this.report.Category &&
    //       category.Value === this.report.Category.toString()
    //     );
    //   })
    // ) {
    //   this.showCategoryError = true;
    //   valid = false;
    // } else {
    //   this.showCategoryError = false;
    // }
    if (this.report.Category != null) {
    const SelVal = this.reportCategories.find(x => x.value === this.report.Category);
    if (SelVal.value != null && SelVal.value === this.report.Category) {
      this.showCategoryError = false;
    } else {
      this.showCategoryError = true;
      valid = false;
    }
    } else {
      this.showCategoryError = true;
      valid = false;
    }
    if (
      this.report.LocationIds.length === 0 &&
      this.report.IncludeAllLocations !== true
    ) {
      valid = false;
      this.showLocationError = true;
    } else {
      this.showLocationError = false;
    }
    if (
      this.report.ProviderIds.length === 0 &&
      this.report.IncludeAllProviders !== true
    ) {
      valid = false;
      this.showProviderError = true;
    } else {
      this.showProviderError = false;
    }
    if (
      this.report.PatientGroupIds.length === 0 &&
      this.report.IncludeAllPatientGroups !== true
    ) {
      valid = false;
      this.showPatientGroupError = true;
    } else {
      this.showPatientGroupError = false;
    }

    if (
      !this.report.IncludeProduction &&
      !this.report.IncludeCollections &&
      !this.report.IncludeAdjustments
    ) {
      this.showItemsError = true;
      valid = false;
    } else {
      this.showItemsError = false;
    }
    return valid;
  }

  failure = (detail: any) => {
    return () => {
      this.toastrFactory.error(
        this.localize.getLocalizedString('Failed to {0}', [detail]),
        'Error'
      );
    };
  }

  getAllMissingData(callback) {
    callback();
  } // Currently only being used to work with export component. Can be used for paging if needed.

  ngOnInit() {
    if (this.methodCallFlag) {
    this.init();
    this.getOptions();
    this.filerCount();
    }
  }
  updateDate(value, type) { 
    switch (type) {
      case 'FromDate':
        this.report.FromDate = value;
        break;
      case 'ToDate':
        this.report.ToDate = value;
        break;
      case 'origStartDate':
        this.report.origStartDate = value;
        break;
      case 'origEndtDate':
        this.report.origEndtDate = value;
        break;
      
      default:
        break;
    }
  }
  updateCategory(event) { 
    this.isformDirty = true;
    this.report.Category = event.target.value;
  }
}
