import { downgradeComponent } from '@angular/upgrade/static';
import { MergeDuplicatePatientsComponent } from './merge-duplicate-patients/merge-duplicate-patients.component';
import { PatientAccountNoteMenuComponent } from './patient-account-note-menu/patient-account-note-menu.component';
import { PatientAccountSummaryGridComponent } from './patient-account-summary-grid/patient-account-summary-grid.component';
import { PatientEncounterClaimsComponent } from './patient-encounter-claims/patient-encounter-claims.component';
import { PatientEncounterMenuComponent } from './patient-encounter-menu/patient-encounter-menu.component';
import { BenefitPlanSearchComponent } from './patient-insurance-info/benefit-plan-search/benefit-plan-search.component';
import { PatientTransactionGridComponent } from './patient-transaction-grid/patient-transaction-grid.component';
import { PatientTransactionPrintComponent } from './patient-transaction-print/patient-transaction-print.component';

declare var angular: angular.IAngularStatic;

export function PatientAccountDowngrade() {
  angular
    .module('Soar.Main')
    .directive('mergeDuplicatePatients', downgradeComponent({ component: MergeDuplicatePatientsComponent }))
    .directive('patientAccountNoteMenu', downgradeComponent({ component: PatientAccountNoteMenuComponent }))
    .directive('patientAccountSummaryGrid', downgradeComponent({ component: PatientAccountSummaryGridComponent }))
    .directive('patientEncounterClaimsMenu', downgradeComponent({ component: PatientEncounterClaimsComponent }))
    .directive('patientEncounterMenu', downgradeComponent({ component: PatientEncounterMenuComponent }))
    .directive('benefitPlanSearch', downgradeComponent({ component: BenefitPlanSearchComponent }))
    .directive('patientTransactionGrid', downgradeComponent({ component: PatientTransactionGridComponent }))
    .directive('patientTransactionPrint', downgradeComponent({ component: PatientTransactionPrintComponent }));
}
