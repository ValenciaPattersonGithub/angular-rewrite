import { Component, Inject, Input, OnInit } from '@angular/core';
import { ControlValueAccessor } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { PatientCurrentLocation } from 'src/patient/common/models/patient-location.model';
import { FeatureFlagService } from '../../../featureflag/featureflag.service';
import { FuseFlag } from 'src/@core/feature-flags/fuse-flag';
import { PatientBenefitPlanLiteDto } from 'src/@core/models/patient-benefit-plan-dtos.model';
import { SoarPatientBenefitPlanHttpService } from 'src/@core/http-services/soar-patient-benefit-plan-http.service';

export interface LocationRteEnrollment {
  Result: boolean;
}

export enum BenefitPlanPriorityStatus {
  primary = 'Primary',
  secondary = 'Secondary',
  third = '3rd',
  forth = '4th',
  fifth = '5th',
  sixth = '6th',
}

@Component({
  selector: 'real-time-eligibility',
  templateUrl: './real-time-eligibility.component.html',
  styleUrls: ['./real-time-eligibility.component.scss'],
})
export class RealTimeEligibilityComponent implements OnInit, ControlValueAccessor {
  @Input() patientId: string;
  loggedInLocation: PatientCurrentLocation;
  // Note: this is always undefined
  eligibility;
  locationEnrolledInRTE = false;
  tooltipMessage = '';
  patientBenefitPlanLiteDtos: PatientBenefitPlanLiteDto[] = [];
  data: { PropertyName: string; Message: string }[];
  allowRTE = false;
  rteDisabledMessage = '';
  // Loading benefit plans indicator
  loadingPlans = false;
  // benefit plans loaded indicator
  plansLoaded = false;
  isDisabled = true;
  selectedBenefitPlanId: number;

  constructor(
    @Inject('$rootScope') private $rootScope,
    @Inject('locationService') private locationService,
    @Inject('LocationServices') private locationServices,
    @Inject('RealTimeEligibilityFactory') private realTimeEligibilityFactory,
    @Inject('ModalFactory') private modalFactory,
    private translate: TranslateService,
    private featureFlagService: FeatureFlagService,
    private patientBenefitPlanService: SoarPatientBenefitPlanHttpService
  ) {}

  public defaultItem: { label: string; PatientBenefitPlanId: number } = {
    label: this.translate.instant('Check Eligibility'),
    PatientBenefitPlanId: null,
  };
  public popupSettings = { width: 'auto', popupClass: 'items-templateListHeader' };

  // Support ControlValueAccessor in Reactive Form
  writeValue() {}
  onChange = () => {};
  onTouched = () => {};

  registerOnTouched(fn) {
    this.onTouched = fn;
  }
  registerOnChange(fn) {
    this.onChange = fn;
  }

  ngOnInit(): void {
    this.selectedBenefitPlanId = this.defaultItem.PatientBenefitPlanId;
    this.loggedInLocation = this.locationService.getCurrentLocation();
    this.checkFeatureFlags();
    this.checkLocationEnrollmentStatus();
    this.$rootScope.$on('patCore:initlocation', () => {
      const selectedLocation = this.locationService.getCurrentLocation();
      if (selectedLocation?.id != this.loggedInLocation?.id) {
        this.loggedInLocation = selectedLocation;
        // Reset the flags when location changes
        this.plansLoaded = false;
        this.locationEnrolledInRTE = false;
        this.tooltipMessage = '';
        this.checkLocationEnrollmentStatus();
      }
    });
  }

  checkFeatureFlags() {
    this.featureFlagService.getOnce$(FuseFlag.AllowRealTimeEligibilityVerification).subscribe(value => {
      this.allowRTE = value;
    });
    this.featureFlagService.getOnce$(FuseFlag.ConfigureRealTimeEligibilityDisabledMessage).subscribe(value => {
      this.rteDisabledMessage = value;
    });
  }

  loadBenefitPlans = () => {
    // reset this value on open so onSectionSelectedChange will execute
    this.selectedBenefitPlanId = this.defaultItem.PatientBenefitPlanId;
    if (this.patientId && this.plansLoaded === false) {
      this.loadingPlans = true;
      this.patientBenefitPlanService.requestPatientBenefitPlansMinimal({ patientId: this.patientId }).subscribe(res => {
        const patientBenefitPlans = res?.Value;

        if (!patientBenefitPlans || patientBenefitPlans?.length == 0) {
          this.tooltipMessage = this.translate.instant('No benefit plan attached to this patient');
        }

        patientBenefitPlans?.forEach(plan => {
          this.priorityLabel(plan);
          this.addDropdownLabel(plan);
        });
        this.patientBenefitPlanLiteDtos = patientBenefitPlans?.sort((a, b) => a?.Priority - b?.Priority);
        this.loadingPlans = false;
        this.plansLoaded = true;
      });
    }
  };

  addDropdownLabel = benefitPlan => {
    benefitPlan.label = `${benefitPlan?.PriorityLabel as string} - ${benefitPlan.CarrierName as string}/${
      benefitPlan.PlanName as string
    }`;
  };

  priorityLabel = benefitPlan => {
    switch (benefitPlan?.Priority) {
      case 0:
        benefitPlan.PriorityLabel = BenefitPlanPriorityStatus.primary;
        break;
      case 1:
        benefitPlan.PriorityLabel = BenefitPlanPriorityStatus.secondary;
        break;
      case 2:
        benefitPlan.PriorityLabel = BenefitPlanPriorityStatus.third;
        break;
      case 3:
        benefitPlan.PriorityLabel = BenefitPlanPriorityStatus.forth;
        break;
      case 4:
        benefitPlan.PriorityLabel = BenefitPlanPriorityStatus.fifth;
        break;
      case 5:
        benefitPlan.PriorityLabel = BenefitPlanPriorityStatus.sixth;
        break;
    }
  };

  checkLocationEnrollmentStatus = () => {
    if (this.loggedInLocation && this.loggedInLocation?.id) {
      if (this.eligibility != null && this.eligibility != undefined) {
        // NOTE, is this ever relavant?  elibility is always undefined
        // I think this was originally an input, but it is not used as such
        this.locationEnrolledInRTE = this.eligibility;
        this.setToolTipMessage();
      } else {
        this.locationServices
          .getLocationRteEnrollmentStatus({ locationId: this.loggedInLocation?.id })
          .$promise?.then((res: LocationRteEnrollment) => {
            if (res) {
              this.locationEnrolledInRTE = res?.Result;
              this.isDisabled = !this.locationEnrolledInRTE;
              this.setToolTipMessage();
            }
          });
      }
    }
  };

  setToolTipMessage = () => {
    if (
      (!this.locationEnrolledInRTE &&
        (!this.patientBenefitPlanLiteDtos || this.patientBenefitPlanLiteDtos?.length == 0)) ||
      !this.locationEnrolledInRTE
    ) {
      this.tooltipMessage = this.translate.instant('Call Patterson Sales at 800.294.8504 to enroll with RTE');
    } else {
      this.tooltipMessage = '';
    }
  };

  onSectionSelectedChange = selectedPlanId => {
    if (selectedPlanId?.PatientBenefitPlanId) {
      if (!this.allowRTE) {
        this.modalFactory.ConfirmModal('Eligibility', this.rteDisabledMessage, 'OK');
      } else {
        this.realTimeEligibilityFactory.checkRTE(this.patientId, selectedPlanId?.PatientBenefitPlanId);
      }
    }
  };
}
