import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { TranslateModule } from '@ngx-translate/core';
import { NgxMaskModule } from 'ngx-mask';
import { PatientLandingComponent } from './patient-landing/patient-landing.component';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { AppKendoUIModule } from 'src/app-kendo-ui/app-kendo-ui.module';
import { PatientOverviewComponent } from './patient-overview/patient-overview.component';
import { PatientSlideoutComponent } from './patient-slideout/patient-slideout.component';
import { SharedModule } from 'src/@shared/shared.module';
import { PatientPendingEncounterComponent } from './patient-overview/patient-pending-encounter/patient-pending-encounter.component';
import { PatientPreventiveCareComponent } from './patient-overview/patient-preventive-care/patient-preventive-care.component';
import { TreatmentPlansCountComponent } from './patient-overview/treatment-plans-count/treatment-plans-count.component';
import { PatientAlertFlagsComponent } from './patient-overview/patient-alert-flags/patient-alert-flags.component';
import { PatientAccountSummaryComponent } from './patient-overview/patient-account-summary/patient-account-summary.component';
import { PatientAccountBalanceComponent } from './patient-overview/patient-account-summary/patient-account-balance/patient-account-balance.component';
import { PatientAccountInsuranceComponent } from './patient-overview/patient-account-summary/patient-account-insurance/patient-account-insurance.component';
import { PatientAccountInsuranceAdjustedEstimateComponent } from './patient-overview/patient-account-summary/patient-account-insurance-adjusted-estimate/patient-account-insurance-adjusted-estimate.component';
import { PatientAccountInsuranceEstimateComponent } from './patient-overview/patient-account-summary/patient-account-insurance-estimate/patient-account-insurance-estimate.component';
import { PatientAccountLatestStatementComponent } from './patient-overview/patient-account-summary/patient-account-latest-statement/patient-account-latest-statement.component';
import { PatientAccountPortionComponent } from './patient-overview/patient-account-summary/patient-account-portion/patient-account-portion.component';
import { PatientSharedModule } from './patient-shared/patient-shared.module';
import { SlideoutFilterComponent } from './common/components/slideout-filter/app-slideout-filter.component';
import { AllPatientSlideoutComponent } from './patient-landing/all-patient-slideout/all-patient-slideout.component';
import { PatientRegistrationModule } from './patient-registration/patient-registration.module';
import { PatientDashboardComponent } from './patient-dashboard/patient-dashboard.component';
import { TreatmentPlansSlideoutComponent } from './patient-landing/treatment-plans-slideout/treatment-plans-slideout.component';
import { OtherToDoSlideoutComponent } from './patient-landing/other-to-do-slideout/other-to-do-slideout.component';
import { AppointmentSlideoutComponent } from './patient-landing/appointment-slideout/appointment-slideout.component';
import { PreventiveCareSlideoutComponent } from './patient-landing/preventive-care-slideout/preventive-care-slideout.component';
import { PatientExportModalComponent } from './patient-landing/patient-export-modal/patient-export-modal.component';
import { SendMailingModalComponent } from './patient-landing/send-mailing-modal/send-mailing-modal.component';
import { ApplyInsurancePaymentComponent } from './patient-apply-insurance-payment/apply-insurance-payment.component';
import { ApplyInsurancePaymentTableComponent } from './common/components/apply-insurance-payment-table/apply-insurance-payment-table.component';
import { SoarEraHttpService } from 'src/@core/http-services/soar-era-http.service';
import { ToShortDisplayDateUtcPipe } from 'src/@shared/pipes/dates/to-short-display-date-utc.pipe';
import { CloseClaimOptionsService } from 'src/insurance/bulk-insurance/close-claim-options.service';
import { SoarBulkPaymentHttpService } from 'src/@core/http-services/soar-bulk-payment-http.service';
import { PaymentTypesService } from 'src/@shared/providers/payment-types.service';
import { ClaimService } from './service/claim/claim.service';

@NgModule({
    declarations: [
        PatientLandingComponent,
        PatientOverviewComponent,
        PatientSlideoutComponent,
        PatientPendingEncounterComponent,
        PatientPreventiveCareComponent,
        TreatmentPlansCountComponent,
        PatientAlertFlagsComponent,
        PatientAccountSummaryComponent,
        PatientAccountBalanceComponent,
        PatientAccountInsuranceComponent,
        PatientAccountInsuranceAdjustedEstimateComponent,
        PatientAccountInsuranceEstimateComponent,
        PatientAccountLatestStatementComponent,
        PatientAccountPortionComponent,
        SlideoutFilterComponent,
        AllPatientSlideoutComponent,
        PatientDashboardComponent,
        TreatmentPlansSlideoutComponent,
        OtherToDoSlideoutComponent,
        AppointmentSlideoutComponent,
        PreventiveCareSlideoutComponent,
        PatientExportModalComponent,
        SendMailingModalComponent ,
        ApplyInsurancePaymentComponent ,
        ApplyInsurancePaymentTableComponent
    ],
    providers: [
        { provide: '$q', useFactory: ($injector: any) => $injector.get('$q'), deps: ['$injector'] },
        { provide: 'AmfaInfo', useFactory: ($injector: any) => $injector.get('AmfaInfo'), deps: ['$injector'] },
        { provide: '$location', useFactory: ($injector: any) => $injector.get('$location'), deps: ['$injector'] },
        { provide: 'CommonServices', useFactory: ($injector: any) => $injector.get('CommonServices'), deps: ['$injector'] },
        { provide: 'LocationServices', useFactory: ($injector: any) => $injector.get('LocationServices'), deps: ['$injector'] },
        { provide: 'ClaimsService', useFactory: ($injector: any) => $injector.get('ClaimsService'), deps: ['$injector'] },
        { provide: 'UsersFactory', useFactory: ($injector: any) => $injector.get('UsersFactory'), deps: ['$injector'] },
        { provide: 'CloseClaimService', useFactory: ($injector: any) => $injector.get('CloseClaimService'), deps: ['$injector'] },
        { provide: 'ModalFactory', useFactory: ($injector: any) => $injector.get('ModalFactory'), deps: ['$injector'] },
        { provide: 'TimeZoneFactory', useFactory: ($injector: any) => $injector.get('TimeZoneFactory'), deps: ['$injector'] },
        { provide: 'BusinessCenterServices', useFactory: ($injector: any) => $injector.get('BusinessCenterServices'), deps: ['$injector'] },
        { provide: 'tabLauncher', useFactory: ($injector: any) => $injector.get('tabLauncher'), deps: ['$injector'] },
        { provide: 'PatientInsurancePaymentFactory', useFactory: ($injector: any) => $injector.get('PatientInsurancePaymentFactory'), deps: ['$injector'] },

        { provide: 'PatientCountFactory', useFactory: ($injector: any) => $injector.get('PatientCountFactory'), deps: ['$injector'] },
        { provide: 'PatientLandingGridFactory', useFactory: ($injector: any) => $injector.get('PatientLandingGridFactory'), deps: ['$injector'] },
        { provide: 'NewLocationsService', useFactory: ($injector: any) => $injector.get('NewLocationsService'), deps: ['$injector'] },
        { provide: 'ScheduleModalFactory', useFactory: ($injector: any) => $injector.get('ScheduleModalFactory'), deps: ['$injector'] } ,        
      ToShortDisplayDateUtcPipe,     
      ClaimService

    ],
    imports: [
        CommonModule,
        BrowserModule,
        FormsModule,
        ReactiveFormsModule,
        BrowserAnimationsModule,
        TranslateModule,
        ScrollingModule,
        AppKendoUIModule,
        SharedModule,
        PatientSharedModule,
        PatientRegistrationModule,
        NgxMaskModule.forRoot()
    ],
    entryComponents: [
        PatientLandingComponent,
        PatientOverviewComponent,
        PatientSlideoutComponent,
        PatientPendingEncounterComponent,
        PatientPreventiveCareComponent,
        TreatmentPlansCountComponent,
        PatientAlertFlagsComponent,
        PatientAccountSummaryComponent,
        PatientAccountBalanceComponent,
        PatientAccountInsuranceComponent,
        PatientAccountInsuranceAdjustedEstimateComponent,
        PatientAccountInsuranceEstimateComponent,
        PatientAccountLatestStatementComponent,
        PatientAccountPortionComponent,           
        AllPatientSlideoutComponent,
        SlideoutFilterComponent,
        PatientDashboardComponent,
        TreatmentPlansSlideoutComponent,
        OtherToDoSlideoutComponent,
        AppointmentSlideoutComponent,
        PreventiveCareSlideoutComponent,
        PatientExportModalComponent,
        SendMailingModalComponent,
        ApplyInsurancePaymentComponent ,
        ApplyInsurancePaymentTableComponent
    ],
    exports: [
        PatientExportModalComponent,
        SendMailingModalComponent ,

    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class PatientModule { }