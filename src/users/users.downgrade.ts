import { downgradeComponent } from "@angular/upgrade/static";
import { UserLoginTimePanelComponent } from "./crud/user-login-time-panel/user-login-time-panel.component";

declare var angular: angular.IAngularStatic;

export function UsersDowngrade() {

    angular.module('Soar.Main')
        .directive('userLoginTimePanel', downgradeComponent({ component: UserLoginTimePanelComponent }));    

}