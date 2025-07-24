import { BrowserModule } from '@angular/platform-browser';
import { NgModule, ElementRef, APP_INITIALIZER, ErrorHandler  } from '@angular/core';
import { CoreModule } from '../@core/core.module';
import { HTTP_INTERCEPTORS, HttpClientModule, HttpClient } from '@angular/common/http';
import { SharedModule } from '../@shared/shared.module';
import { ServiceBootstrapComponent } from './service-bootstrap/service-bootstrap.component';
import { PracticesModule } from '../practices/practices.module';
import { SchedulingModule } from '../scheduling/scheduling.module';
import { SecurityModule } from '../security/security.module';
import { TransactionHistoryModule } from '../accounting/transactions/transaction-history/transaction-history.module';
import { BusinessCenterModule } from '../business-center/business-center.module';
import { TranslateLoader, TranslateModule, TranslateService } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { I18nTypes } from '../@core/models/I18nTypes';
import { PatientChartModule } from '../patient/patient-chart/patient-chart.module';
import { PatientDetailModule } from '../patient/patient-detail/patient-detail.module';
import { PatientAccountModule } from '../patient/patient-account/patient-account.module';
import { EraModule } from '../insurance/era/era.module';
import { ClaimsManagementModule } from '../insurance/claims/claims-management/claims-management.module';
import { POPUP_CONTAINER } from '@progress/kendo-angular-popup';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { GlobalErrorHandlerService, GlobalInterceptorService, MicroServiceApiService, UltInterceptorService } from '../security/providers';
import { ImagingModule } from '../patient/imaging/imaging.module';
import { TreatmentPlansModule } from '../treatment-plans/treatment-plans.module';
import { EncounterModule } from 'src/accounting/encounter/encounter.module';
import { DashboardModule } from '../dashboard/dashboard.module';
import { CommunicationCenterModule } from '../patient/communication-center/communication-center.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RxModule } from 'src/rx/rx.module';
import { VendorsIntegration } from 'src/vendors-integration/vendors-integration.module';
import {SvgDefinitionsComponent} from '../@shared/components/svg-icons/svg-definitions.component';

import { BulkInsuranceModule } from '../insurance/bulk-insurance/bulk-insurance.module';
import { PatientRegistrationModule } from 'src/patient/patient-registration/patient-registration.module';
import { PatientProfileModule } from 'src/patient/patient-profile/patient-profile.module';
import { UsersModule } from 'src/users/users.module';

// documentation module
import { StylesDocumentationModule } from 'src/stylings/styles-documentation.module';
import { PatientBenefitPlanModule } from 'src/patient/patient-benefit-plan/patient-benefit-plan.module';
import { PatientModule } from '../patient/patient.module';
import { FuseFeatureFlagInitializationService, LAUNCH_DARKLY_CLIENT_ID } from './fuse-featureflag-initialization.service';
import { FULLSTORY_ORG_ID, FullstoryInitializationService } from './fullstory-initialization.service';
import { AttachmentsModule } from 'src/insurance/attachments/attachments.module';
import { StatementsModule } from 'src/accounting/statements/statements.module';
import { FeeScheduleModule } from 'src/insurance/fee-schedule/fee-schedule.module';

export function loadFeatureFlags (flagService: FuseFeatureFlagInitializationService): () => Promise<void> {
    return () => {
        // Do NOT await the initialize() promise!  If you async wait during an APP_INITIALIZER,
        // hybrid angular will start up ngRoute and component rendering *prior*
        // to completing this promise!
        flagService.initialize();
        return Promise.resolve();
    }
};

export function initializeFullstory(fullstoryInitService: FullstoryInitializationService): () => Promise<void> {
    return () => {
        fullstoryInitService.initialize(); // Do not await this promise, see above comment
        return Promise.resolve();
    }
};

@NgModule({
    declarations: [
        ServiceBootstrapComponent,
        SvgDefinitionsComponent
    ],
    imports: [
        BrowserModule,
        BusinessCenterModule,
        PatientAccountModule,
        EncounterModule,
        StatementsModule,
        EraModule,
        ClaimsManagementModule,
        AttachmentsModule,
        HttpClientModule,
        SharedModule,
        CoreModule,
        PracticesModule,
        SchedulingModule,
        SecurityModule,
        TransactionHistoryModule,
        VendorsIntegration,
        TranslateModule.forRoot({
            loader: {
                provide: TranslateLoader,
                useFactory: HttpLoaderFactory,
                deps: [HttpClient]
            }
        }),
        TreatmentPlansModule,
        BrowserAnimationsModule,
        DashboardModule,
        CommunicationCenterModule,
        FormsModule,
        ReactiveFormsModule,
        BulkInsuranceModule,
        FeeScheduleModule,
        PatientRegistrationModule,
        PatientProfileModule,
        UsersModule,
        StylesDocumentationModule,
        PatientBenefitPlanModule,
        PatientModule
    ],
    exports: [
        TranslateModule,
        PatientChartModule,
        PatientDetailModule,
        ImagingModule,
        RxModule,
        StatementsModule
    ],
    providers: [
        {
            provide: APP_INITIALIZER,
            useFactory: loadFeatureFlags,
            deps: [FuseFeatureFlagInitializationService],
            multi: true
        },
        {
            provide: APP_INITIALIZER,
            useFactory: initializeFullstory,
            deps: [FullstoryInitializationService],
            multi: true
        },
        { provide: LAUNCH_DARKLY_CLIENT_ID, useFactory: ($injector: any) => $injector.get(LAUNCH_DARKLY_CLIENT_ID), deps: ['$injector'] },
        { provide: FULLSTORY_ORG_ID, useFactory: ($injector: any) => $injector.get(FULLSTORY_ORG_ID), deps: ['$injector'] },
        { provide: ErrorHandler, useClass: GlobalErrorHandlerService },
        { provide: HTTP_INTERCEPTORS, useClass: GlobalInterceptorService, multi: true },
        { provide: HTTP_INTERCEPTORS, useClass: UltInterceptorService, multi: true },
        { provide: 'localize', useFactory: ($injector: any) => $injector.get('localize'), deps: ['$injector'] },
        { provide: 'errorLogService', useFactory: ($injector: any) => $injector.get('errorLogService'), deps: ['$injector'] },
        { provide: 'toastrFactory', useFactory: ($injector: any) => $injector.get('toastrFactory'), deps: ['$injector'] },
        { provide: 'imagingProviderFactory', useFactory: ($injector: any) => $injector.get('imagingProviderFactory'), deps: ['$injector'] },
        // since we are still using angularjs routing, need to use angularjs service to handle route parameter retrieval
        { provide: '$routeParams', useFactory: ($injector: any) => $injector.get('$routeParams'), deps: ['$injector'] },
        { provide: POPUP_CONTAINER, useFactory: () => { return { nativeElement: document.body } as ElementRef; } },
        // will reside in security module eventually
        { provide: 'patSecurityService', useFactory: ($injector: any) => $injector.get('patSecurityService'), deps: ['$injector'] },
        // will reside in security module eventually
        { provide: 'AccountCreditTransactionFactory', useFactory: ($injector: any) => $injector.get('AccountCreditTransactionFactory'), deps: ['$injector'] },
        // will reside in security module eventually
        { provide: 'patAuthenticationService', useFactory: ($injector: any) => $injector.get('patAuthenticationService'), deps: ['$injector'] },
        // will reside in practices module eventually
        { provide: 'practiceService', useFactory: ($injector: any) => $injector.get('practiceService'), deps: ['$injector'] },
        // MFA Practice Settings URLs - injection from Angular 1 to Angular 2+
        { provide: 'mfaPracticeSettingsUrl', useFactory: ($injector: any) => $injector.get('MFA_PRACTICE_SETTINGS_URL'), deps: ['$injector'] },
        { provide: 'mfaManagementPracticeServiceUrl', useFactory: ($injector: any) => $injector.get('MFA_MANAGEMENT_PRACTICE_SETTINGS_URL'), deps: ['$injector'] },
        // SSO Domain API
        { provide: 'ssoDomainServiceUrl', useFactory: ($injector: any) => $injector.get('SSO_DOMAIN_SERVICE_URL'), deps: ['$injector'] },
        // will reside in practices module eventually
        // will reside in security module eventually
        { provide: 'instanceIdentifier', useFactory: ($injector: any) => $injector.get('instanceIdentifier'), deps: ['$injector'] },
        // will reside in security module eventually
        { provide: 'uniqueIdentifier', useFactory: ($injector: any) => $injector.get('uniqueIdentifier'), deps: ['$injector'] },
        // will reside in security module eventually
        { provide: 'applicationService', useFactory: ($injector: any) => $injector.get('applicationService'), deps: ['$injector'] },
        // will reside in security module eventually
        { provide: 'platformSessionCachingService', useFactory: ($injector: any) => $injector.get('platformSessionCachingService'), deps: ['$injector'] },
        // will move to security module eventually
        { provide: 'MicroServiceApiUrlConfig', useFactory: ($injector: any) => $injector.get('MicroServiceApiUrlConfig'), deps: ['$injector'], multi: true },
        // will move to security module eventually
        { provide: 'AppliationVariableConfig', useFactory: ($injector: any) => $injector.get('ApplicationVariableConfig'), deps: ['$injector'], multi: true },
        { provide: 'ClinicalDrawerStateService', useFactory: ($injector: any) => $injector.get('ClinicalDrawerStateService'), deps: ['$injector'] },
        { provide: 'TeamMemberIdentifierService', useFactory: ($injector: any) => $injector.get('TeamMemberIdentifierService'), deps: ['$injector'] },
        { provide: 'ULTModalService', useFactory: ($injector: any) => $injector.get('ULTModalService'), deps: ['$injector'] },
        { provide: 'configSettingsService', useFactory: ($injector: any) => $injector.get('configSettingsService'), deps: ['$injector'] },
        { provide: 'UserRxFactory', useFactory: ($injector: any) => $injector.get('UserRxFactory'), deps: ['$injector']}
      ],
    bootstrap: [],
    entryComponents: [
        ServiceBootstrapComponent,
        SvgDefinitionsComponent
    ]
})
export class AppModule {
    constructor(translate: TranslateService) {
        // this language will be used as a fallback when a translation isn't found in the current language
        translate.setDefaultLang(I18nTypes[I18nTypes.en]);

        // Set the language to use upon bootstrapping of this application; this is the spot to change languages initially
        // If the language isn't available, it will use the current loader to get them
        translate.use(I18nTypes[I18nTypes.en]);
    }
    ngDoBootstrap() {

    }
}

// AoT requires an exported function for factories
export function HttpLoaderFactory(http: HttpClient) {
    return new TranslateHttpLoader(http, '../src/assets/i18n/', '.json');
}
