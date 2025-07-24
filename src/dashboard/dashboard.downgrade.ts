import { downgradeComponent, downgradeInjectable } from '@angular/upgrade/static';
import { DashboardComponent } from './dashboard-component/dashboard.component';
import { WidgetbarComponent } from './widgets/bar-chart-widget/bar-chart-widget.component';
import { DashboardWidgetService } from './widgets/services/dashboard-widget.service';
import { UserDashboardComponent } from './user-dashboard/user-dashboard.component';

declare var angular: angular.IAngularStatic;

export function DashboardDowngrade() {
  angular
    .module('Soar.Main')
    .directive('dashBoard', downgradeComponent({ component: DashboardComponent }))
    .directive('widgetBar', downgradeComponent({ component: WidgetbarComponent }))
    .factory('DashboardWidgetService', downgradeInjectable(DashboardWidgetService))
    .directive('userDashboardNg', downgradeComponent({ component: UserDashboardComponent }));
}
