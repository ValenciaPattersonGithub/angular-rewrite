import { downgradeInjectable } from '@angular/upgrade/static';
import { PatientDetailService } from './services/patient-detail.service';

declare var angular: angular.IAngularStatic;

export function PatientDetailDowngrade() {
  angular.module('Soar.Main').factory('PatientDetailService', downgradeInjectable(PatientDetailService));
}
