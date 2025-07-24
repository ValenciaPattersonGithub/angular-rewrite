import { downgradeComponent } from '@angular/upgrade/static';
import { SolutionReachComponent } from './solution-reach/solution-reach.component';

declare var angular: angular.IAngularStatic;

export function VendorsIntegrationDowngrade() {
  angular.module('Soar.Main').directive('solutionReach', downgradeComponent({ component: SolutionReachComponent }));
}
