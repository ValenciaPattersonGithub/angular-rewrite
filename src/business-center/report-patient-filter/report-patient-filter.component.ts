import { Patient } from './../../patient/common/models/patient.model';
import {
  Component,
  OnInit,
  Inject,
  Input,
  EventEmitter,
  Output
} from "@angular/core";
import cloneDeep from 'lodash/cloneDeep';
declare let _: any;
@Component({
  selector: 'report-patient-filter',
  templateUrl: './report-patient-filter.component.html',
  styleUrls: ['./report-patient-filter.component.scss']
})
export class ReportPatientFilterComponent implements OnInit {
  constructor(@Inject("toastrFactory") private toastrFactory,
  @Inject("localize") private localize, @Inject("SearchFactory") private searchFactory,
  @Inject("PatientServices") private patientServices, @Inject("GlobalSearchFactory") private globalSearchFactory) { }
  @Input() filterModels;
  @Input() userDefinedPatinets;
  @Output() onChanged = new EventEmitter<any>();
  @Output() changeData = new EventEmitter<any>();
  reportPatientFilterModel;
  patientSearch = this.searchFactory.CreateSearch(
    this.patientServices.Patients.search
  );
  DateOfBirth = "2001-12-31T23:59:00"
  emptyGuid = '00000000-0000-0000-0000-000000000000';
  patientSearchParams = {
    searchFor: '',
    skip: 0,
    take: 45,
    sortyBy: 'LastName',
    includeInactive: false
  };
  
  selectedPatients = [];
  includeAllPatients;
  notifyChange() {
    var selectedPatients = [];
    for (let patient of this.selectedPatients) {
      selectedPatients.push({
        PatientId: patient.PatientId,
        DisplayName: this.buildDisplayName(patient)
      });
    };
    var selectedPatientIds = [];
    if (this.includeAllPatients === 'true') {
      selectedPatientIds.push(this.emptyGuid);
    } else {
      for (let patient of this.selectedPatients) {
        selectedPatientIds.push(patient.PatientId);
      };
    }
    if (selectedPatientIds.length === 1 && this.includeAllPatients === 'false') {
      this.reportPatientFilterModel.isValid = true;
      this.onChanged.emit(true);
    }
    if (selectedPatientIds.length === 0) {
      this.reportPatientFilterModel.isValid = false;
      this.onChanged.emit(false);
    }
    this.reportPatientFilterModel.FilterDto = selectedPatientIds;
    this.setFilterString();
    this.changeData.emit();
  }

  executePatientSearch(scrolling) {
    if (
      this.patientSearchParams &&
      this.patientSearchParams.searchFor !== ''
    ) {
      this.patientSearch.Execute(this.patientSearchParams, scrolling);
    }
  };

  selectPatient(patient) {
    if (patient) {
      this.patientSearchParams.searchFor = this.buildDisplayName(patient);
      this.patientSearch.Results = [];
      var found
      for (let value of this.selectedPatients) {
        if (value.PatientId === patient.PatientId) {
          return found = value;
        };
      };
      if (!found) {
        this.selectedPatients.push(patient);
        this.notifyChange();
        this.saveMostRecent(patient.PatientId);
      }
    }
    this.reportPatientFilterModel.FilterPatients = this.selectedPatients;
  }

  userSelectedList() {
    this.selectedPatients = cloneDeep(this.userDefinedPatinets);
  }
  toggleRadio() {
    this.selectedPatients = [];
    if (this.includeAllPatients === 'true') {
      this.patientSearchParams.searchFor = '';
      this.reportPatientFilterModel.isValid = true;
      this.onChanged.emit(this.reportPatientFilterModel.isValid);
    }
    // if (this.userDefinedPatinets.length > 0) {
    //   this.userSelectedList();
    // }
    this.notifyChange();
  }

  removeSelectedPatient(index, patient) {
    this.selectedPatients.splice(index, 1);
    this.reportPatientFilterModel.FilterPatients = this.selectedPatients;
    this.notifyChange();
  }

  resetMethod() {
    this.includeAllPatients = 'true';
    this.patientSearchParams.searchFor = '';
    this.selectedPatients = [];
    this.notifyChange();
    this.setUserPatientsOption();
    this.reportPatientFilterModel.Reset = false;
  }

  saveMostRecent(personId) {
    this.globalSearchFactory.SaveMostRecentPerson(personId);
  };

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
  buildFilterString() {
    if (this.includeAllPatients === 'true') {
      return this.localize.getLocalizedString('All');
    }
    var filterString = '';
    for (let patient of this.selectedPatients) {
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

  setFilterString() {
    this.reportPatientFilterModel.FilterString = this.buildFilterString();
  }
  setUserPatientsOption() {
    if (this.userDefinedPatinets.length > 0) {
      this.includeAllPatients = 'false';
      this.userSelectedList();
    } else {
      this.includeAllPatients = 'true';
    }
  }
  ngOnInit() {
    this.reportPatientFilterModel = this.filterModels;
    this.setUserPatientsOption();
  }
}
