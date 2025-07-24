import { downgradeInjectable } from '@angular/upgrade/static';
import { InsuranceErrorMessageGeneratorService } from './insurance-error-message-generator.service';

declare const angular: angular.IAngularStatic;

export function InsuranceCommonDowngrade() {
  angular
    .module('Soar.Main')
    .factory('InsuranceErrorMessageGeneratorService', downgradeInjectable(InsuranceErrorMessageGeneratorService));
}
