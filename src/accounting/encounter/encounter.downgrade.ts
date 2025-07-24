import { downgradeComponent } from '@angular/upgrade/static';
import { EncounterCartComponent } from './encounter-cart/encounter-cart.component';
import { PatientCheckoutComponent } from './patient-checkout/patient-checkout.component';

declare var angular: angular.IAngularStatic;

export function EncounterDowngrade() {
  angular
    .module('Soar.Main')
    .directive('encounterCart', downgradeComponent({ component: EncounterCartComponent }))
    .directive('patientCheckout', downgradeComponent({ component: PatientCheckoutComponent }));
}
