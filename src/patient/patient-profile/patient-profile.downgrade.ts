import { downgradeComponent } from '@angular/upgrade/static';
import { PatientProfileFamilyLandingComponent } from './patient-profile-family-landing/patient-profile-family-landing.component';
import { PatientProfileLandingComponent } from './patient-profile-landing/patient-profile-landing.component';

declare var angular: angular.IAngularStatic;

export function PatientProfileDowngrade() {
  angular
    .module('Soar.Main')
    .directive('patientProfileFamilyLanding', downgradeComponent({ component: PatientProfileFamilyLandingComponent }))
    .directive('patientProfileLanding', downgradeComponent({ component: PatientProfileLandingComponent }));
}
