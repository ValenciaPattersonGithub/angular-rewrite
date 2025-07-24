import { downgradeComponent, downgradeInjectable } from '@angular/upgrade/static';
import { ChartColorsService } from './chart-colors.service';
import { MultiServiceEditComponent } from './multi-service-edit/multi-service-edit.component';
import { MultiServiceEditService } from './multi-service-edit/multi-service-edit.service';
import { PatientNotesService } from './patient-notes/providers/patient-notes.service';
import { PatientPerioService } from './patient-perio/patient-perio.service';
import { PatientRxService } from './patient-rx/providers/patient-rx.service';
import { TreatmentPlanPrintOptionsComponent } from './treatment-plans/treatment-plan-print-options/treatment-plan-print-options.component';

declare var angular: angular.IAngularStatic;

export function PatientChartDowngrade() {
  angular
    .module('Soar.Main')
    .factory('ChartColorsService', downgradeInjectable(ChartColorsService))
    .directive('multiServiceEdit', downgradeComponent({ component: MultiServiceEditComponent }))
    .factory('multiServiceEditService', downgradeInjectable(MultiServiceEditService))
    .factory('PatientNotesService', downgradeInjectable(PatientNotesService))
    .factory('patientPerioService', downgradeInjectable(PatientPerioService))
    .factory('PatientRxService', downgradeInjectable(PatientRxService))
    .directive('treatmentPlanPrintOptions', downgradeComponent({ component: TreatmentPlanPrintOptionsComponent }));
}
