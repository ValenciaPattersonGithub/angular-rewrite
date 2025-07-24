import { Component, Inject, OnInit, OnDestroy, Input } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { PatientHttpService } from 'src/patient/common/http-providers/patient-http.service';
import { PatientRegistrationService } from 'src/patient/common/http-providers/patient-registration.service';
import { RegistrationEvent } from 'src/patient/common/models/enums';
@Component({
  selector: 'app-patient-insurance',
  templateUrl: './patient-insurance.component.html',
  styleUrls: ['./patient-insurance.component.scss'],
})
export class PatientInsuranceComponent implements OnInit, OnDestroy {
  patientBenefitPlans: any[] = [];
  isLoading: any = true;
  defaultOrderKey = 'Priority';
  sortDirectionDesc: any = -1;
  defaultPlansLength: any = 2;
  plansShowCount: any;
  totalPlans: any[] = [];
  disableToggle: any = false;
  private unsubscribe$: Subject<any> = new Subject<any>();
  @Input() patientProfile: any;
  @Input() isTabView: boolean = false;
  constructor(
    @Inject('$routeParams') private route,
    private patientHttpService: PatientHttpService,
    private registrationService: PatientRegistrationService
  ) {}

  ngOnInit(): void {
    this.getBenefitPlans(
      this.patientProfile ? this.patientProfile.PatientId : this.route.patientId
    );
  }
  getBenefitPlans = (patientId: any) => {
    this.patientHttpService
      .getPatientBenefitPlans(patientId)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(
        (data: any) => this.getPatientBenefitPlansByPatientIdSuccess(data),
        error => this.getPatientBenefitPlansByPatientIdFailure()
      );
  };
  getPatientBenefitPlansByPatientIdSuccess = (benefitPlans: any) => {
    if (benefitPlans && benefitPlans.length) {
      this.plansShowCount = `Showing ${
        benefitPlans.length < 2 ? benefitPlans.length : this.defaultPlansLength
      } of ${benefitPlans.length}`;
      if (benefitPlans.length >= 2) {
        this.disableToggle = benefitPlans.length <= 2 ? true : false;
        this.totalPlans = benefitPlans.sort(
          ({ Priority: a }, { Priority: b }) => a - b
        );
        this.patientBenefitPlans = this.totalPlans.slice(0, 2);
      } else {
        this.disableToggle = true;
        this.patientBenefitPlans = benefitPlans;
      }
    }
    this.isLoading = false;
  };
  getPatientBenefitPlansByPatientIdFailure = () => {};
  optAllPlans = (event: any) => {
    if (event.currentTarget.checked) {
      this.plansShowCount = `Showing ${this.totalPlans.length} of ${this.totalPlans.length}`;
      if (this.totalPlans.length >= 2) {
        this.disableToggle = this.totalPlans.length <= 2 ? true : false;
        this.registrationService.setRegistrationEvent({
          eventtype: RegistrationEvent.BenefitPlans,
          data: this.totalPlans,
        });
      }
    } else {
      this.disableToggle = true;
      this.plansShowCount = `Showing ${
        this.totalPlans.length < 2
          ? this.totalPlans.length
          : this.defaultPlansLength
      } of ${this.totalPlans.length}`;
      this.registrationService.setRegistrationEvent({
        eventtype: RegistrationEvent.BenefitPlans,
        data: this.totalPlans.slice(0, 2),
      });
    }
  };
  updatePerson = () => {
    this.registrationService.setRegistrationEvent({
      eventtype: RegistrationEvent.PerformNavigation,
      data: `#/Patient/${this.route.patientId}/Summary/?tab=Insurance%20Information`,
    });
  };
  ngOnDestroy() {
    this.totalPlans = [];
    this.patientBenefitPlans = [];
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
