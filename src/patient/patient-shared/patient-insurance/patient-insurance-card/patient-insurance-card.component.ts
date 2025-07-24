import { Component, Inject, OnInit, Input, OnDestroy } from '@angular/core';
import { PatientRegistrationService } from 'src/patient/common/http-providers/patient-registration.service';
import { RegistrationCustomEvent } from 'src/patient/common/models/registration-custom-event.model';
import { RegistrationEvent } from 'src/patient/common/models/enums';
import { TranslateService } from '@ngx-translate/core';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
@Component({
  selector: 'app-patient-insurance-card',
  templateUrl: './patient-insurance-card.component.html',
  styleUrls: ['./patient-insurance-card.component.scss'],
})
export class PatientInsuranceCardComponent implements OnInit, OnDestroy {
  patientBenefitPlans: any[] = [];
  // isLoading: any = true;
  @Input() plans: any;
  private unsubscribe$: Subject<any> = new Subject<any>();

  constructor(
    @Inject('tabLauncher') private tabLauncher,
    private registrationService: PatientRegistrationService,
    private translate: TranslateService
  ) {}

  ngOnInit(): void {
    this.patientBenefitPlans = [];
    if (this.plans && this.plans.length) {
      this.mapPatientBenefitPlans(this.plans);
    }
    // this.isLoading = false;
    this.registrationService
      .getRegistrationEvent()
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((event: RegistrationCustomEvent) => {
        if (event) {
          switch (event.eventtype) {
            case RegistrationEvent.BenefitPlans:
              this.checkAllPlans(event.data);
              break;
          }
        }
      });
  }

  openNewTab = (data: any, type: any) => {
    if (type === 'Name') {
      this.tabLauncher.launchNewTab(
        '#/BusinessCenter/Insurance/Plans/Edit/?guid=' + data
      );
    } else {
      var subString1 = 'https://';
      var subString2 = 'http://';

      if (data.indexOf(subString1) !== -1 || data.indexOf(subString2) !== -1)
        window.open(data, '_blank');
      else
        window.open('http://' + data, '_blank');

    }
  };
  checkAllPlans = (benefitplans: any) => {
    if (benefitplans.length) {
      this.mapPatientBenefitPlans(benefitplans);
    }
  };
  mapPatientBenefitPlans = (mapPlans: any) => {
    if (mapPlans.length) {
      this.patientBenefitPlans = mapPlans.map((o: any) => ({
        BenefitPlanId: o.BenefitPlanId,
        PriorityLabel: this.setPriorityLabels(o.Priority),
        Priority: o.Priority,
        PlanName: o.PolicyHolderBenefitPlanDto.BenefitPlanDto
          ? o.PolicyHolderBenefitPlanDto.BenefitPlanDto.Name
          : null,
        PolicyHolderName: `${
          o.PolicyHolderDetails ? o.PolicyHolderDetails.FirstName : ''
        } ${o.PolicyHolderDetails ? o.PolicyHolderDetails.LastName : ''}`,
        PolicyHolderStringId: o.PolicyHolderStringId,
        PlanGroupNumber: o.PolicyHolderBenefitPlanDto.BenefitPlanDto
          ? o.PolicyHolderBenefitPlanDto.BenefitPlanDto.PlanGroupNumber
          : null,
        CarrierName: o.PolicyHolderBenefitPlanDto.BenefitPlanDto.Carrier.Name,
        CarrierPhoneNumber: o.PolicyHolderBenefitPlanDto.BenefitPlanDto.Carrier
          .PhoneNumbers.length
          ? o.PolicyHolderBenefitPlanDto.BenefitPlanDto.Carrier.PhoneNumbers[0]
              .PhoneNumber
          : null,
        CarrierWebsite: o.PolicyHolderBenefitPlanDto.BenefitPlanDto.Carrier
          ? o.PolicyHolderBenefitPlanDto.BenefitPlanDto.Carrier.Website
          : null,
        EffectiveDate: o.EffectiveDate,
      }));
      this.patientBenefitPlans = this.patientBenefitPlans.sort(
        ({ Priority: a }, { Priority: b }) => a - b
      );
    }
  };
  setPriorityLabels = (priority: any) => {
    switch (priority) {
      case 0:
        priority = this.translate.instant('Primary');
        break;
      case 1:
        priority = this.translate.instant('Secondary');
        break;
      case 2:
        priority = this.translate.instant('3rd Supplemental');
        break;
      case 3:
        priority = this.translate.instant('4th Supplemental');
        break;
      case 4:
        priority = this.translate.instant('5th Supplemental');
        break;
      case 5:
        priority = this.translate.instant('6th Supplemental');
        break;
    }
    return priority;
  };
  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
