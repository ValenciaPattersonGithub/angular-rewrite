import {
  Component,
  EventEmitter,
  Inject,
  Input,
  OnInit,
  Output,
} from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import moment from 'moment';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { isNullOrUndefined, isNull } from 'util';

@Component({
  selector: 'patient-lookup',
  templateUrl: './patient-lookup.component.html',
  styleUrls: ['./patient-lookup.component.scss'],
})
export class PatientLookupComponent implements OnInit {
  @Input() modalinstance: any;

  selectedPatient = null;
  selectedIndex;
  subject = new Subject();
  patientSearch = this.searchFactory.CreateSearch(
    this.patientServices.Patients.search
  );
  patientSearchParams = {
    searchFor: '',
    skip: 0,
    take: 45,
    sortyBy: 'LastName',
    includeInactive: false,
  };

  constructor(
    private translate: TranslateService,
    @Inject('PatientServices') private patientServices,
    @Inject('SearchFactory') private searchFactory,
    @Inject('PatientValidationFactory') private patientValidationFactory
  ) {}

  ngOnInit(): void {
    this.subject.pipe(debounceTime(500)).subscribe(() => {
      this.executePatientSearch(false);
    });
  }

  closeModal() {
    this.modalinstance.close();
  }

  submit() {
    this.validateSelectedPatient(this.selectedPatient);
  }

  async input(value) {
    // signal that amount is being modified
    if (isNullOrUndefined(value)) {
      this.selectedIndex = null;
      this.selectedPatient = null;
    } else {
      this.subject.next(value);
    }
  }

  executePatientSearch(scrolling) {
    if (this.patientSearchParams && this.patientSearchParams.searchFor !== '') {
      this.patientSearch.Execute(this.patientSearchParams, scrolling);
      this.selectedIndex = null;
      this.selectedPatient = null;
    }
  }

  selectPatient(patient, selectedIndex) {
    this.selectedIndex = selectedIndex;
    this.selectedPatient = patient;
  }

  displayGender(gender) {
    if (gender) {
      if (gender == 'M') {
        return 'Male';
      } else if (gender == 'F') {
        return 'Female';
      } else {
        return gender;
      }
    }
    return '--';
  }

  calculateAge(dateOfBirth) {
    if (dateOfBirth) {
      return moment().diff(dateOfBirth, 'years');
    }
    return '--';
  }

  validateSelectedPatient(person) {
    if (person && person.PatientId) {
      this.patientValidationFactory
        .PatientSearchValidation(person)
        .then(res => {
          var patientInfo = res;
          if (
            !patientInfo.authorization
              .UserIsAuthorizedToAtLeastOnePatientLocation
          ) {
            this.patientValidationFactory.LaunchPatientLocationErrorModal(
              patientInfo
            );
            // this.patientValidationFactory.SetCheckingUserPatientAuthorization(false);
          } else {
            this.modalinstance.close(this.selectedPatient.PatientId);
          }
        });
    }
  }
}
