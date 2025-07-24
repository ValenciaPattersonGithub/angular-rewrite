import {
  Component,
  OnInit,
  Inject,
  Input,
  Output,
  EventEmitter,
  OnDestroy,
} from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { PatientRegistrationService } from 'src/patient/common/http-providers/patient-registration.service';
import { RegistrationEvent } from 'src/patient/common/models/enums';
import { Subject, Subscription } from 'rxjs';
import { OrderByPipe } from 'src/@shared/pipes';
declare let angular: any;
declare let _: any;

import * as moment from 'moment';
import { RegistrationCustomEvent } from '../common/models/registration-custom-event.model';
import { multicast, takeUntil } from 'rxjs/operators';
@Component({
  // tslint:disable-next-line: component-selector
  selector: 'patient-duplicate-search',
  templateUrl: './patient-duplicate-search.component.html',
  styleUrls: ['./patient-duplicate-search.component.scss'],
})
export class PatientDuplicateSearchComponent implements OnInit, OnDestroy {
  @Input() patientSearchList: any[] = [];
  @Input() disableClick = false;
  @Input() isPersonalDetail: any;
  duplicatePatients: any[] = [];
  showDuplicatePatients = false;
  checkingForDuplicates = false;
  dupeCheckTimeout = null;
  defaultOrderKey = 'LastName';
  sortColumnName: string;
  sortDirection: number;
  expandedItem = 'DuplicateSearch';
  private unsubscribe$: Subject<any> = new Subject<any>();
  private dupilcateSub: Subscription;

  @Output() duplicateSelected = new EventEmitter();

  constructor(
    private translate: TranslateService,
    @Inject('toastrFactory') private toastrFactory,
    @Inject('PatientServices') private patientServices,
    @Inject('PatientValidationFactory') private patientValidationFactory,
    @Inject('tabLauncher') private tabLauncher,
    private registrationService: PatientRegistrationService
  ) {}

  ngOnInit() {
    this.dupilcateSub = this.registrationService
      .getRegistrationEvent()
      .subscribe((event: RegistrationCustomEvent) => {
        if (event) {
          switch (event.eventtype) {
            case RegistrationEvent.SearchForDuplicate:
              this.getPersonalDetailsDuplicatePatients(event.data);
          }
        }
      });
    this.getDuplicatePatients();
  }
  applyOrderByPipe = () => {
    const orderPipe = new OrderByPipe();
    return orderPipe.transform(this.duplicatePatients, {
      sortColumnName: this.defaultOrderKey,
      sortDirection: 1,
    });
  };
  getDuplicatePatients = () => {
    this.duplicatePatients = [];
    this.checkingForDuplicates = true;

    // list of objects is expected
    const patientSearchDtos = [];
    for (const patient of this.patientSearchList) {
      const patientSearchDto = {
        FirstName: patient.FirstName ? patient.FirstName : '',
        LastName: patient.LastName ? patient.LastName : '',
        PreferredName: patient.PreferredName ? patient.PreferredName : '',
        DateOfBirth: patient.DateOfBirth
          ? moment(patient.DateOfBirth).format('YYYY-MM-DD')
          : null,
      };
      patientSearchDtos.push(patientSearchDto);
    }
    // excludePatient parameter is needed
    let excludePatient = null;
    if (this.patientSearchList.length >= 1) {
      excludePatient = this.patientSearchList[0].PatientId
        ? this.patientSearchList[0].PatientId
        : null;
    }
    // tslint:disable-next-line: max-line-length
    this.patientServices.Patients.duplicates(
      { excludePatient },
      patientSearchDtos,
      this.duplicatePatientSearchGetSuccess,
      this.duplicatePatientSearchGetFailure
    );
  };

  duplicatePatientSearchGetSuccess = res => {
    this.duplicatePatients = [];
    // filter to remove patients from results who were sent to the API
    res.Value.forEach(item => {
      const match = this.patientSearchList.find(member => {
        return member.PatientId === item.PatientId;
      });
        if (!match) {
            item.FirstName = _.escape(item.FirstName);
            item.LastName = _.escape(item.LastName);
        this.duplicatePatients.push(item);
      }
    });
    if (this.isPersonalDetail) {
      this.duplicatePatients = this.applyOrderByPipe();
    } else {
      this.duplicatePatients.sort((x, y) => {
        if (x.LastName < y.LastName) {
          return -1;
        }
        if (x.LastName > y.LastName) {
          return 1;
        }
      });
    }
    this.checkingForDuplicates = false;
    this.showDuplicatePatients = true;
    for (let dupe of this.duplicatePatients) {
      this.patientValidationFactory
        .PatientSearchValidation(dupe)
        .then(patientInfo => {
          if (dupe.DateOfBirth) {
            dupe.Age = moment(dupe.DateOfBirth).local().toDate();
            dupe.Age = moment().diff(dupe.Age, 'years');
            if (dupe.Age <= 0) {
              dupe.Age = 0;
            }
          }
          // format date of birth
          dupe.DateOfBirthDisplay = dupe.DateOfBirth
            ? moment.utc(dupe.DateOfBirth).format('MM/DD/YYYY')
            : '';
          dupe = patientInfo;
        });
    }
  };

  closeDuplicatePatient = () => {
    this.showDuplicatePatients = false;
  };

  duplicatePatientSearchGetFailure = () => {
    this.showDuplicatePatients = false;
    this.duplicatePatients = [];

    // tslint:disable-next-line: max-line-length
    this.toastrFactory.error(
      this.translate.instant('Unable to check for duplicate patients.'),
      this.translate.get('Error')
    );

    // hide the spinner
    this.checkingForDuplicates = false;
  };

  duplicateClicked = duplicate => {
    this.duplicateSelected.emit(duplicate);
  };
  duplicatePatientClicked = duplicatePatient => {
    if (duplicatePatient.PatientId) {
      const baseurl = `#/Patient/${duplicatePatient.PatientId}/Overview`;
      this.tabLauncher.launchNewTab(baseurl);
    }
  };
  getPersonalDetailsDuplicatePatients = (patientSearchList: any) => {
    this.duplicatePatients = [];
    this.checkingForDuplicates = true;

    // list of objects is expected
    const patientSearchDtos = [];
    for (const patient of patientSearchList) {
      const patientSearchDto = {
        FirstName: patient.FirstName ? patient.FirstName : '',
        LastName: patient.LastName ? patient.LastName : '',
        PreferredName: patient.PreferredName ? patient.PreferredName : '',
        DateOfBirth: patient.DateOfBirth
          ? moment(patient.DateOfBirth).format('YYYY-MM-DD')
          : null,
      };
      patientSearchDtos.push(patientSearchDto);
    }
    if (this.isPersonalDetail) {
      this.patientServices.Patients.duplicates(
        null,
        patientSearchDtos,
        this.duplicatePatientSearchGetSuccess,
        this.duplicatePatientSearchGetFailure
      );
    }
  };

  ngOnDestroy(): void {
    if (this.dupilcateSub) {
      this.dupilcateSub.unsubscribe();
    }
  }
}
