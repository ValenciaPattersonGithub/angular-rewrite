import { downgradeInjectable } from '@angular/upgrade/static';
import { ProviderAppointmentValidationService } from './provider-appointment-validation.service';

declare var angular: angular.IAngularStatic;

export function ProviderAppointmentValidationDowngrade() {
    angular.module('Soar.Main').factory('ProviderAppointmentValidationService', downgradeInjectable(ProviderAppointmentValidationService));
}

