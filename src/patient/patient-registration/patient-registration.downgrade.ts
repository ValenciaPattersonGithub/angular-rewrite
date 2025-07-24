import { downgradeComponent } from '@angular/upgrade/static';
import { RegistrationLandingComponent } from './registration-landing/registration-landing.component';
import { PatientFamilyRegistrationComponent } from '../patient-family-registration/patient-family-registration.component';
import { RegistrationHeaderComponent } from './registration-header/registration-header.component';

declare var angular: angular.IAngularStatic;

export function PatientRegistrationDowngrade() {
  angular
    .module('Soar.Main')
    .directive('registrationLanding', downgradeComponent({ component: RegistrationLandingComponent }))
    .directive('patientFamilyRegistration', downgradeComponent({ component: PatientFamilyRegistrationComponent }))
    .directive('registrationHeader', downgradeComponent({ component: RegistrationHeaderComponent }));
}
