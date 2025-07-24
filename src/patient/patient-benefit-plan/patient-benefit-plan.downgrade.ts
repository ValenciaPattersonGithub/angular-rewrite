import { downgradeInjectable } from '@angular/upgrade/static';
import { AddPatientBenefitPlansModalService } from './add-patient-benefit-plans-modal.service';

declare var angular: angular.IAngularStatic;

export function PatientBenefitPlanDowngrade() {
  angular.module('Soar.Main').factory('AddPatientBenefitPlansModalService', downgradeInjectable(AddPatientBenefitPlansModalService));
}
