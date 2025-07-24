import { downgradeComponent } from "@angular/upgrade/static";
import { ServiceBootstrapComponent } from "./service-bootstrap/service-bootstrap.component";

declare var angular: angular.IAngularStatic;

export function AppDowngrade() {
  angular.module('Soar.Main').directive('appServiceBootstrap', downgradeComponent({ component: ServiceBootstrapComponent }));
}
