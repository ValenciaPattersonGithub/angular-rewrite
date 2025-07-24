import { downgradeComponent, downgradeInjectable } from '@angular/upgrade/static';
import { TreatmentPlanEditServicesService } from './component-providers';
import { TreatmentPlanEditServicesViewComponent } from './components/treatment-plan-edit-services-view/treatment-plan-edit-services-view.component';
import { TreatmentPlanServicesDrawerViewComponent } from './components/treatment-plan-services-drawer-view/treatment-plan-services-drawer-view.component';
import { TreatmentPlanServicesReorderViewComponent } from './components/treatment-plan-services-reorder-view/treatment-plan-services-reorder-view.component';
import { TreatmentPlanHttpService } from './http-providers';
import {
  TreatmentPlanConfirmationModalDataService,
  TreatmentPlanEditDetailsService,
  TreatmentPlanFilteringService,
  TreatmentPlanOrderingService,
  TreatmentPlanSelectListService,
  TreatmentPlanServicesDrawerDragService,
  TreatmentPlanTimelineService,
  TreatmentPlanViewDetailsService,
  TreatmentPlansService,
} from './providers';

declare var angular: angular.IAngularStatic;

export function TreatmentPlansDowngrade() {
  angular
    .module('Soar.Main')
    .factory('NewTreatmentPlanEditServicesService', downgradeInjectable(TreatmentPlanEditServicesService))
    .directive('treatmentPlanEditServicesView', downgradeComponent({ component: TreatmentPlanEditServicesViewComponent }))
    .directive('newTreatmentPlanServicesDrawerView', downgradeComponent({ component: TreatmentPlanServicesDrawerViewComponent }))
    .directive('oldTreatmentPlanServicesReorderView', downgradeComponent({ component: TreatmentPlanServicesReorderViewComponent }))
    .factory('TreatmentPlanHttpService', downgradeInjectable(TreatmentPlanHttpService))
    .factory('TreatmentPlanConfirmationModalDataService', downgradeInjectable(TreatmentPlanConfirmationModalDataService))
    .factory('NewTreatmentPlanEditDetailsService', downgradeInjectable(TreatmentPlanEditDetailsService))
    .factory('NewTreatmentPlanFilteringService', downgradeInjectable(TreatmentPlanFilteringService))
    .factory('NewTreatmentPlanOrderingService', downgradeInjectable(TreatmentPlanOrderingService))
    .factory('NewTreatmentPlanSelectListService', downgradeInjectable(TreatmentPlanSelectListService))
    .factory('TreatmentPlanServicesDrawerDragService', downgradeInjectable(TreatmentPlanServicesDrawerDragService))
    .factory('NewTreatmentPlanTimelineService', downgradeInjectable(TreatmentPlanTimelineService))
    .factory('NewTreatmentPlanViewDetailsService', downgradeInjectable(TreatmentPlanViewDetailsService))
    .factory('NewTreatmentPlansService', downgradeInjectable(TreatmentPlansService));
}
