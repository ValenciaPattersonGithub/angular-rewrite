import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { PatientOverview } from '../common/models/patient-overview.model';
import { Patient } from '../common/models/patient.model';
import { NewStandardServiceModel } from 'src/@shared/models/new-standard-service.model';
import { ServiceCodeModel } from 'src/business-center/service-code/service-code-model';
import { PatientContactInfo } from '../common/models/patient-contact-info.model';
import { TranslateService } from '@ngx-translate/core';
import { ImagingProviderService } from '../imaging/services/imaging-provider.service';

@Component({
  selector: 'patient-overview',
  templateUrl: './patient-overview.component.html',
  styleUrls: ['./patient-overview.component.scss']
})
export class PatientOverviewComponent implements OnInit, OnChanges {
  isAppointmentViewVisible = false;
  isSecondaryAppointmentViewVisible = false;
  @Input() person: PatientOverview;
  @Input() serviceCodes?: ServiceCodeModel[];

  patient = new NewStandardServiceModel<Patient>();
  contactInfo?: PatientContactInfo;
  canViewAccountPendingEncounter = false;
  accountSummaryActions = [{
    amfa: "",
    Path: "",
    Text: "",
  }];
  clinicalSummmaryActions = [
    {
      Function: {},
      Path: '',
      Inactive: false,
      Text: '',
    }]
  viewFlags = [
    {
      amfa: "",
      Path: "",
      Text: "",
    }]
  aboutActions = [
    {
      amfa: "",
      Path: "",
      Text: "",
    }
  ];
  validPhones = false;
  patientPath = '#/Patient/';
  imagingService;

  constructor(private translate: TranslateService,
    private imagingProviderService: ImagingProviderService) { }

  ngOnChanges(changes: SimpleChanges): void {
    // Person
    if (changes?.person) {
      const nv = changes?.person?.currentValue;
      if (nv)
        console.log(nv); // To Do : Remove console.log later
    }
    // serviceCodes
    if (changes?.serviceCodes) {
      const nv = changes?.serviceCodes?.currentValue;
      if (nv)
        console.log(nv); // To Do : Remove console.log later
    }
  }

  ngOnInit(): void {
    if (this.person) {
      this.patient.Data = this.person?.Profile;
      this.patient.Data["Flag"] = this.person?.Flags;
      this.patient.Data["Groups"] = this.person?.PatientGroups;
      this.patient.Data["BenefitPlans"] = this.person?.BenefitPlans;
      this.patient.Data["Emails"] = this.person?.Emails;
    }
    this.imagingService = this.imagingProviderService.resolve();
    this.setAccountSummaryActions();
    this.setClinicalSummaryActions();
    this.setFlags();
    this.setAboutActions();
  }

  setAccountSummaryActions = () => {
    if (this.patient?.Data?.PersonAccount) {
      this.accountSummaryActions = [
        {
          amfa: 'soar-acct-actsrv-view',
          Path: `${this.patientPath}${this.patient?.Data?.PatientId}${'/Summary/'}`,
          Text: this.translate.instant('View Account')
        }
      ]
    } else {
      this.accountSummaryActions = [];
    }
  }

  setClinicalSummaryActions = () => {
    this.clinicalSummmaryActions = [
      {
        Function: {},
        Path: `${this.patientPath}${this.patient?.Data?.PatientId}${'/Clinical/?activeSubTab=2'}`,
        Inactive: false,
        Text: this.translate.instant('View Treatment Plans')
      },
      {
        Function: {},
        Path: `${this.patientPath}${this.patient?.Data?.PatientId}${'/Clinical/'}`,
        Inactive: false,
        Text: this.translate.instant('View Chart'),
      },
      {
        Function: this.launchCapture,
        Path: '',
        Inactive: this.imagingService == null,
        Text: this.translate.instant('Launch Capture'),
      }
    ]
  }

  launchCapture = () => {
    this.imagingService.captureImage(
      {
        patientId: this.patient?.Data?.PatientId,
        lastName: this.patient?.Data?.LastName,
        firstName: this.patient?.Data?.FirstName,
        gender: this.patient?.Data?.Sex,
        birthDate: this.patient?.Data?.DateOfBirth,
      },
      true,
      true
    );
  }

  setFlags = () => {
    this.viewFlags = [
      {
        amfa: 'soar-per-perdem-modify',
        Path: `${this.patientPath}${this.patient?.Data?.PatientId}${'/Person/?sectionId=4'}`,
        Text: this.translate.instant('View Flags'),
      }
    ]
  }

  setAboutActions = () => {
    this.aboutActions = [
      {
        amfa: 'soar-per-perdem-view',
        Path: `${this.patientPath}${this.patient?.Data?.PatientId}${'/Summary/?tab=Profile'}`,
        Text: this.translate.instant('View Profile'),
      }
    ]
  }

}
