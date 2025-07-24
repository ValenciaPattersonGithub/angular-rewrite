import { downgradeInjectable } from '@angular/upgrade/static';
import { FeatureFlagService } from './featureflag.service';

declare var angular: angular.IAngularStatic;

export function FeatureFlagDowngrade() {
  angular.module('Soar.Main')
    .factory('FeatureFlagService', downgradeInjectable(FeatureFlagService));
}
