import { downgradeComponent } from "@angular/upgrade/static";
import { StatementsComponent } from "./statements.component";

declare var angular: angular.IAngularStatic;

export function StatementsDowngrade() {
    angular
        .module('Soar.Main')
        .directive('appStatements', downgradeComponent({ component: StatementsComponent }));
}