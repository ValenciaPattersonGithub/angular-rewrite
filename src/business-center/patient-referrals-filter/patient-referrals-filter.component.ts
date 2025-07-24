import {
  Component,
  OnInit,
  Inject,
  Input,
  Output,
  EventEmitter,
} from '@angular/core';
declare let _: any;
@Component({
  selector: 'patient-referrals-filter',
  templateUrl: './patient-referrals-filter.component.html',
  styleUrls: ['./patient-referrals-filter.component.scss'],
})
export class PatientReferralsFilterComponent implements OnInit {
  //data from report filter component
  @Input() filterModels;
  @Input() options;
  @Input() userDefinedFilter;
  @Output() onChanged = new EventEmitter<any>();
  @Output() changeData = new EventEmitter<any>();
  // initializations
  patientSearch;
  patientSearchParams;
  emptyGuid: string;
  selectedAll: boolean;
  selectedPatients;
  selectedReferralSources;
  patientReferralTypes;
  patientReferralTypeOptions;
  patientReferralTypesData;
  tempReferral;
  referral;
  inputReferralFilterModel;
  referralSources;
  constructor(
    @Inject('toastrFactory') private toastrFactory,
    @Inject('localize') private localize,
    @Inject('SearchFactory') private searchFactory,
    @Inject('PatientServices') private patientServices,
    @Inject('ReferralSourcesService') private referralSourcesService,
    @Inject('ListHelper') private listHelper,
    @Inject('GlobalSearchFactory') public globalSearchFactory
  ) {}

  getOptions() {
    this.patientReferralTypeOptions.push({
      name: this.localize.getLocalizedString('All Sources'),
      value: null,
    });
    for (let value of this.patientReferralTypesData) {
      this.patientReferralTypeOptions.push({
        name: value.Name,
        value: value.Id,
      });
      this.patientReferralTypes[value.Name] = value.Id;
    }
  }

  ReferralTypeChanged(type) {
    this.selectedAll =
      type !== this.patientReferralTypes.Person &&
      type !== this.patientReferralTypes.Other
        ? true
        : false;
    this.referral = {};
    this.patientSearchParams.searchFor = '';
    this.selectedPatients = [];
    this.selectedReferralSources = [];
    this.notifyChange();
  }
  // #endregion

  // #region Get Referral Sources

  // get referralSourceList

  getReferralSources() {
    this.referralSourcesService.get().$promise.then(
      res => {
        this.referralSourcesServiceGetSuccess(res);
      },
      err => {
        this.referralSourcesServiceGetFailure();
      }
    );
  }

  referralSourcesServiceGetSuccess(res) {
    res.Value.unshift({
      SourceName: this.localize.getLocalizedString('Select Referral Source'),
      PatientReferralSourceId: null,
    });
    this.referralSources = res.Value;
    if (
      this.userDefinedFilter &&
      this.userDefinedFilter.selectedReferralType &&
      this.userDefinedFilter.selectedReferralType.name === 'Other'
    ) {
      this.selectedAll = this.inputReferralFilterModel.selectedAll;
      if (this.userDefinedFilter.ReferralSourceIds.length > 0) {
        _.each(this.userDefinedFilter.ReferralSourceIds, item => {
          const sourceObj = this.listHelper.findItemByFieldValue(
            this.referralSources,
            'PatientReferralSourceId',
            item
          );
          this.referral.ReferralSourceId = sourceObj;
          this.SelectOther(item);
        });
      } else {
        this.ReferralTypeChanged(
          this.userDefinedFilter.selectedReferralType.value
        );
      }
    } else if (
      this.userDefinedFilter &&
      this.userDefinedFilter.selectedReferralType &&
      this.userDefinedFilter.selectedReferralType.name === 'Person'
    ) {
      this.selectedAll = this.inputReferralFilterModel.selectedAll;
      if (this.userDefinedFilter.ReferringPatientIds.length > 0) {
        _.each(this.userDefinedFilter.selectedAllPatients, item => {
          this.SelectPatient(item);
        });
        // this.selectedPatients = this.userDefinedFilter.selectedAllPatients;
      } else {
        this.ReferralTypeChanged(
          this.userDefinedFilter.selectedReferralType.value
        );
      }
    }
  }

  referralSourcesServiceGetFailure() {
    // Error
    this.toastrFactory.error(
      this.localize.getLocalizedString('Referral sources failed to load.'),
      this.localize.getLocalizedString('Server Error')
    );
  }

  // load referral sources when controller is instiated

  // #endregion

  executePatientSearch(scrolling) {
    if (this.patientSearchParams && this.patientSearchParams.searchFor != '') {
      this.patientSearch.Execute(this.patientSearchParams, scrolling);
    }
  }

  notifyChange() {
    var selectedPatients = [];
    var selectedReferralSources = [];
    for (let patient of this.selectedPatients) {
      selectedPatients.push({
        PatientId: patient.PatientId,
        DisplayName:
          patient.LastName +
          ', ' +
          patient.FirstName +
          ' - ' +
          patient.PatientCode,
      });
    }

    for (let value of this.selectedReferralSources) {
      selectedReferralSources.push({
        SourceId: value.PatientReferralSourceId,
        DisplayName: value.SourceName,
      });
    }

    var prevTotalSelected = this.inputReferralFilterModel.totalSelected;
    this.inputReferralFilterModel.totalSelected = this.selectedAll
      ? 1
      : selectedPatients.length + selectedReferralSources.length;
    this.inputReferralFilterModel.selectedAll = this.selectedAll;
    this.inputReferralFilterModel.selectedPatients = selectedPatients;
    this.inputReferralFilterModel.selectedAllPatients = this.selectedPatients;
    this.inputReferralFilterModel.selectedReferralSources =
      selectedReferralSources;
    this.inputReferralFilterModel.FilterString =
      this.buildReferralSourcesFilterString();
    this.buildReferralSourcesFilterDto();

    this.onChanged.emit(
      this.inputReferralFilterModel.totalSelected - prevTotalSelected
    );
    this.changeData.emit();
  }
  buildReferralSourcesFilterString() {
    if (this.inputReferralFilterModel.selectedAll) {
      return this.localize.getLocalizedString('All');
    } else {
      var filterString = this.localize.getLocalizedString('');

      for (let obj of this.inputReferralFilterModel.selectedPatients) {
        filterString = filterString.concat(
          obj.DisplayName + this.localize.getLocalizedString(', ')
        );
      }

      for (let obj of this.inputReferralFilterModel.selectedReferralSources) {
        filterString = filterString.concat(
          obj.DisplayName + this.localize.getLocalizedString(', ')
        );
      }

      filterString = filterString.substring(0, filterString.length - 2);
      if (filterString === '') {
        filterString = this.localize.getLocalizedString('No filters applied');
      }
      return filterString;
    }
  }

  buildReferralSourcesFilterDto() {
    var selectedPatientIds = [];
    var selectedReferralSourceIds = [];
    if (this.inputReferralFilterModel.selectedAll) {
      selectedPatientIds.push(this.emptyGuid);
      selectedReferralSourceIds.push(this.emptyGuid);
    } else {
      for (let patient of this.inputReferralFilterModel.selectedPatients) {
        selectedPatientIds.push(patient.PatientId);
      }

      for (let value of this.inputReferralFilterModel.selectedReferralSources) {
        selectedReferralSourceIds.push(value.SourceId);
      }
    }
    this.inputReferralFilterModel.ReferringPatientIdFilterDto =
      selectedPatientIds;
    this.inputReferralFilterModel.ReferringSourceIdFilterDto =
      selectedReferralSourceIds;
  }

  SelectPatient(patient) {
    if (patient) {
      this.patientSearchParams.searchFor =
        patient.LastName +
        ', ' +
        patient.FirstName +
        ' - ' +
        patient.PatientCode;
      this.patientSearch.Results = [];
      var found = false;
      for (let value of this.selectedPatients) {
        if (value.PatientId === patient.PatientId) {
          return (found = true);
        }
      }
    }
    if (!found) {
      this.selectedPatients.push(patient);
      this.notifyChange();
      this.saveMostRecent(patient.PatientId);
    }
  }
  SelectOther(other) {
    this.referral.ReferralSourceId;
    var item = this.listHelper.findItemByFieldValue(
      this.referralSources,
      'PatientReferralSourceId',
      other
    );
    if (item) {
      let found = false;
      for (let value of this.selectedReferralSources) {
        if (value === item) {
          return (found = true);
        }
      }
      if (!found) {
        this.selectedReferralSources.push(item);
        this.notifyChange();
      }
    }
    this.patientSearchParams.searchFor = '';
  }

  removeSelectedPatient(index, patient) {
    this.selectedPatients.splice(index, 1);
    this.notifyChange();
  }
  removeSelectedReferenceSource(index, item) {
    this.selectedReferralSources.splice(index, 1);
    this.notifyChange();
  }

  //#region recents
  saveMostRecent(personId) {
    this.globalSearchFactory.SaveMostRecentPerson(personId);
  }
  // #endregion
  //intial method call
  initialMethod() {
    this.patientSearch = this.searchFactory.CreateSearch(
      this.patientServices.Patients.search
    );
    this.patientSearchParams = {
      searchFor: '',
      skip: 0,
      take: 45,
      sortBy: 'LastName',
      includeInactive: false,
    };
    this.emptyGuid = '00000000-0000-0000-0000-000000000000';
    this.selectedAll = true;
    this.selectedPatients = [];
    this.selectedReferralSources = [];
    // Gets patient referral types, constants
    this.patientReferralTypesData = this.options;
    this.patientReferralTypes = {};
    // Gets options for select element
    this.patientReferralTypeOptions = [];
    this.referral = {};
    this.referral.ReferralSourceId = null;
    // this.inputReferralFilterModel.selectedReferralType = null;
    this.referralSources = [];
    this.getOptions();
    this.getReferralSources();
  }
  ngOnInit() {
    this.inputReferralFilterModel = this.filterModels;
    if (this.inputReferralFilterModel) {
      this.initialMethod();
    }
  }
}
