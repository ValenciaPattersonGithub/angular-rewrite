import { downgradeComponent, downgradeInjectable } from '@angular/upgrade/static';
import { RxService } from './common/providers/rx.service';
import { RxUserSetupComponent } from './rx-user-setup/rx-user-setup.component';

declare var angular: angular.IAngularStatic;

export function RxDowngrade() {
  angular
    .module('Soar.Main')
    .factory('RxService', downgradeInjectable(RxService))
    .directive('rxUserSetup', downgradeComponent({ component: RxUserSetupComponent }));
}
