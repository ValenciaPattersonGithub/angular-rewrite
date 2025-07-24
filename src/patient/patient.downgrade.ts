import { downgradeComponent, downgradeInjectable } from '@angular/upgrade/static';
import { PatientCommunicationCenterService } from './common/http-providers/patient-communication-center.service';
import { PatientHttpService } from './common/http-providers/patient-http.service';
import { PatientRegistrationService } from './common/http-providers/patient-registration.service';
import { PatientLandingComponent } from './patient-landing/patient-landing.component';
import { PatientDashboardComponent } from './patient-dashboard/patient-dashboard.component';
import { ApplyInsurancePaymentComponent } from './patient-apply-insurance-payment/apply-insurance-payment.component';

declare var angular: angular.IAngularStatic;

export function PatientDowngrade() {
  angular
    .module('Soar.Main')
    .factory('PatientCommunicationCenterService', downgradeInjectable(PatientCommunicationCenterService))
    .factory('PatientHttpService', downgradeInjectable(PatientHttpService))
    .factory('PatientRegistrationService', downgradeInjectable(PatientRegistrationService))
    .directive('patientLandingNg', downgradeComponent({ component: PatientLandingComponent }))
    .directive('patientDashboardNg', downgradeComponent({ component: PatientDashboardComponent }))
    .directive('patientAccountInsurancePaymentNg', downgradeComponent({ component: ApplyInsurancePaymentComponent }));

}
