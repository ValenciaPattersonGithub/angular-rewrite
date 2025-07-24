import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from 'src/@shared/shared.module';
import { BenefitPlanSearchComponent } from './patient-insurance-info/benefit-plan-search/benefit-plan-search.component';
import { MergeDuplicatePatientsComponent } from './merge-duplicate-patients/merge-duplicate-patients.component';
import { TranslateModule } from '@ngx-translate/core';
import { MergeDuplicatePatientsDialogComponent } from './merge-duplicate-patients-dialog/merge-duplicate-patients-dialog.component';
import { AppKendoUIModule } from 'src/app-kendo-ui/app-kendo-ui.module';
import { PatientDuplicateSearchComponent } from '../patient-duplicate-search/patient-duplicate-search.component';
import { MergeToAccountDialogComponent } from './merge-to-account-dialog/merge-to-account-dialog.component';
import { PatientTransactionGridComponent } from './patient-transaction-grid/patient-transaction-grid.component';
import { UnappliedMenuDialogComponent } from './unapplied-menu-dialog/unapplied-menu-dialog.component';
import { PatientEncounterMenuComponent } from './patient-encounter-menu/patient-encounter-menu.component';
import { PatientEncounterClaimsComponent } from './patient-encounter-claims/patient-encounter-claims.component';
import { PatientAccountNoteMenuComponent } from './patient-account-note-menu/patient-account-note-menu.component';
import { PatientAccountSummaryGridComponent } from './patient-account-summary-grid/patient-account-summary-grid.component';
import { PatientTransactionPrintComponent } from './patient-transaction-print/patient-transaction-print.component';
import { AdjustmentTypesService } from 'src/@shared/providers/adjustment-types.service';
import { MatIconModule } from "@angular/material/icon";


@NgModule({
    declarations: [
        BenefitPlanSearchComponent,
        MergeDuplicatePatientsComponent,
        MergeDuplicatePatientsDialogComponent,
        PatientDuplicateSearchComponent,
        MergeToAccountDialogComponent,
        PatientTransactionGridComponent,
        UnappliedMenuDialogComponent,
        PatientEncounterMenuComponent,
        PatientEncounterClaimsComponent,
        PatientAccountNoteMenuComponent,
        PatientAccountSummaryGridComponent,
        PatientTransactionPrintComponent,
    ],
    imports: [
        CommonModule, SharedModule, TranslateModule, AppKendoUIModule,MatIconModule
    ],
    exports:[PatientDuplicateSearchComponent, BenefitPlanSearchComponent],
    providers: [
        { provide: 'patSecurityService', useFactory: ($injector: any) => $injector.get('patSecurityService'), deps: ['$injector'] },
        { provide: 'toastrFactory', useFactory: ($injector: any) => $injector.get('toastrFactory'), deps: ['$injector'] },
        { provide: 'AccountCreditTransactionFactory', useFactory: ($injector: any) => $injector.get('AccountCreditTransactionFactory'), deps: ['$injector'] },
        { provide: 'ListHelper', useFactory: ($injector: any) => $injector.get('ListHelper'), deps: ['$injector'] },
        { provide: 'AccountNoteFactory', useFactory: ($injector: any) => $injector.get('AccountNoteFactory'), deps: ['$injector'] },
        { provide: 'DepositService', useFactory: ($injector: any) => $injector.get('DepositService'), deps: ['$injector'] },
        { provide: 'CommonServices', useFactory: ($injector: any) => $injector.get('CommonServices'), deps: ['$injector'] },
        { provide: 'referenceDataService', useFactory: ($injector: any) => $injector.get('referenceDataService'), deps: ['$injector'] },
        { provide: 'PatientServices', useFactory: ($injector: any) => $injector.get('PatientServices'), deps: ['$injector'] },
        { provide: 'TimeZoneFactory', useFactory: ($injector: any) => $injector.get('TimeZoneFactory'), deps: ['$injector'] },
        { provide: 'PatientDocumentsFactory', useFactory: ($injector: any) => $injector.get('PatientDocumentsFactory'), deps: ['$injector'] },
        { provide: 'AccountSummaryFactory', useFactory: ($injector: any) => $injector.get('AccountSummaryFactory'), deps: ['$injector'] },
        { provide: 'AccountServiceTransactionFactory', useFactory: ($injector: any) => $injector.get('AccountServiceTransactionFactory'), deps: ['$injector'] },
        { provide: 'AccountDebitTransactionFactory', useFactory: ($injector: any) => $injector.get('AccountDebitTransactionFactory'), deps: ['$injector'] },
        { provide: 'AccountSummaryDeleteFactory', useFactory: ($injector: any) => $injector.get('AccountSummaryDeleteFactory'), deps: ['$injector'] },
        AdjustmentTypesService
    ],
    entryComponents: [
        PatientTransactionGridComponent,
        BenefitPlanSearchComponent,
        MergeDuplicatePatientsComponent,
        MergeDuplicatePatientsDialogComponent,
        PatientDuplicateSearchComponent,
        MergeToAccountDialogComponent,
        PatientAccountSummaryGridComponent,
        PatientTransactionPrintComponent
    ],
})
export class PatientAccountModule { }
