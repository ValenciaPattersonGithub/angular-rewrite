import { downgradeModule } from '@angular/upgrade/static';
import { enableProdMode, StaticProvider } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { AppModule } from './app/app.module';
import { environment } from './environments/environment';
import { enableDebugTools } from '@angular/platform-browser';
import { CoreDowngrade } from './@core/core.downgrade';
import { SharedDowngrade } from './@shared/shared.downgrade';
import { EncounterDowngrade } from './accounting/encounter/encounter.downgrade';
import { TransactionHistoryDowngrade } from './accounting/transactions/transaction-history/transaction-history.downgrade';
import { AppDowngrade } from './app/app.downgrade';
import { BusinessCenterDowngrade } from './business-center/business-center.downgrade';
import { DashboardDowngrade } from './dashboard/dashboard.downgrade';
import { ClaimsManagementDowngrade } from './insurance/claims/claims-management/claims-management.downgrade';
import { EraDowngrade } from './insurance/era/era.downgrade';
import { CommunicationCenterDowngrade } from './patient/communication-center/communication-center.downgrade';
import { ImagingDowngrade } from './patient/imaging/imaging.downgrade';
import { PatientAccountDowngrade } from './patient/patient-account/patient-account.downgrade';
import { PatientBenefitPlanDowngrade } from './patient/patient-benefit-plan/patient-benefit-plan.downgrade';
import { PatientChartDowngrade } from './patient/patient-chart/patient-chart.downgrade';
import { PatientDetailDowngrade } from './patient/patient-detail/patient-detail.downgrade';
import { PatientProfileDowngrade } from './patient/patient-profile/patient-profile.downgrade';
import { PatientRegistrationDowngrade } from './patient/patient-registration/patient-registration.downgrade';
import { PatientSharedDowngrade } from './patient/patient-shared/patient-shared.downgrade';
import { PatientDowngrade } from './patient/patient.downgrade';
import { PracticesDowngrade } from './practices/practices.downgrade';
import { RxDowngrade } from './rx/rx.downgrade';
import { SchedulingDowngrade } from './scheduling/scheduling.downgrade';
import { SecurityDowngrade } from './security/security.downgrade';
import { TreatmentPlansDowngrade } from './treatment-plans/treatment-plans.downgrade';
import { UsersDowngrade } from './users/users.downgrade';
import { VendorsIntegrationDowngrade } from './vendors-integration/vendors-integration.downgrade';
import { FeatureFlagDowngrade } from './featureflag/featureflag.downgrade';
import { ProviderAppointmentValidationDowngrade } from './scheduling/common/providers/provider-appointment-validation.downgrade';
import { BulkInsuranceDowngrade } from './insurance/bulk-insurance/bulk-insurance.downgrade';
import { BrowserCacheDowngrade } from './browser-cache/browser-cache.downgrade';
import { StatementsDowngrade } from './accounting/statements/statements.downgrade';
import { InsuranceCommonDowngrade } from './insurance/insurance-common.downgrade';

declare var angular: angular.IAngularStatic;

if (environment.production) {
  enableProdMode();
}

// The normal directions for using enableDebugTools do not seem to work with
// our downgradeModule() setup below, but found this workaround:
// Open DevTools console and do the following:
// 1) Use the devtools element selector and click something in the UI bound to angular
// 2) enableDebugTools(ng.probe($0));
// 3) Now you can profile the cost of an average change detection cycle using
//    ng.profiler.timeChangeDetection();
globalThis.enableDebugTools = enableDebugTools;

// The function that will bootstrap the Angular module (when/if necessary).
// (This would be omitted if we provided an `NgModuleFactory` directly.)
const bootstrapFn = (extraProviders: StaticProvider[]) =>
  platformBrowserDynamic(extraProviders).bootstrapModule(AppModule);

// making a new name to ensure no name collisions before replacement of existing structure - temp

// delay the boostraping of the hybrid app.
const startMyHybridApp = (container, mainAngularModule) => {
  if (!(window as any).fuseNgBootstrapped) {
    (window as any).fuseNgBootstrapped = true;

    CoreDowngrade();
    SharedDowngrade();
    EncounterDowngrade();
    StatementsDowngrade();
    TransactionHistoryDowngrade();
    AppDowngrade();
    BusinessCenterDowngrade();
    DashboardDowngrade();
    FeatureFlagDowngrade();
    BrowserCacheDowngrade();
    BulkInsuranceDowngrade();
    InsuranceCommonDowngrade();
    ClaimsManagementDowngrade();
    EraDowngrade();
    {
      // Patient Folder Modules:
      CommunicationCenterDowngrade();
      ImagingDowngrade();
      PatientAccountDowngrade();
      PatientBenefitPlanDowngrade();
      PatientChartDowngrade();
      PatientDetailDowngrade();
      PatientProfileDowngrade();
      PatientRegistrationDowngrade();
      PatientSharedDowngrade();
      PatientDowngrade();
    }
    PracticesDowngrade();
    RxDowngrade();
    SchedulingDowngrade();
    SecurityDowngrade();
    TreatmentPlansDowngrade();
    UsersDowngrade();
    VendorsIntegrationDowngrade();
    ProviderAppointmentValidationDowngrade();
  }

  if (!container) {
    container = document.body;
  }

  // This AngularJS module represents the AngularJS pieces of the application.
  angular.bootstrap(container, [
    mainAngularModule,
    // Declare a dependency on the "downgraded" Angular module.
    downgradeModule(bootstrapFn)
  ]);
};

// expose as global for use.
declare global {
  interface Window {
    startHybridApp: any;
  }
}
window.startHybridApp = startMyHybridApp;
