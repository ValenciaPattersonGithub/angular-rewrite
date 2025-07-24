import { downgradeComponent } from '@angular/upgrade/static';
import { EraLandingComponent } from './era-landing/era-landing.component';
import { EraViewComponent } from './era-view/era-view.component';

declare var angular: angular.IAngularStatic;

export function EraDowngrade() {
  angular
    .module('Soar.Main')
    .directive('appEraLanding', downgradeComponent({ component: EraLandingComponent }))
    .directive('appEraView', downgradeComponent({ component: EraViewComponent }));
}
