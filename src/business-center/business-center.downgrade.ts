import { downgradeComponent, downgradeInjectable } from '@angular/upgrade/static';
import { NewControlTestingViewComponent } from './control-testing/new-control-testing-view.component';
import { LocationSearchComponent } from './locations/location-search/location-search.component';
import { AppointmentsTransferComponent } from './mass-updates/appointments-transfer/appointments-transfer.component';
import { MassUpdateComponent } from './mass-updates/mass-update/mass-update.component';
import { MassUpdateResultsComponent } from './mass-updates/mass-update-results/mass-update-results.component';
import { PatientReferralsFilterComponent } from './patient-referrals-filter/patient-referrals-filter.component';
import { PatientReferralsBetaFilterComponent } from './patient-referrals-beta-filter/patient-referrals-beta-filter.component';
import { ChartColorsHttpService } from './practice-settings/chart-custom-colors';
import { ChartCustomColorsComponent } from './practice-settings/chart-custom-colors/chart-custom-colors.component';
import { ReportCheckboxFilterComponent } from './report-checkbox-filter/report-checkbox-filter.component';
import { ReportDateFilterComponent } from './report-date-filter/report-date-filter.component';
import { ReportFilterBoxComponent } from './report-filter-box/report-filter-box.component';
import { ReportNumericFilterComponent } from './report-numeric-filter/report-numeric-filter.component';
import { ReportPatientFilterComponent } from './report-patient-filter/report-patient-filter.component';
import { ReportRadioFilterComponent } from './report-radio-filter/report-radio-filter.component';
import { AccountWithOffsettingProviderBalancesMigrationComponent } from './reports/accounts-with-offsetting-provider-balances-migration/accounts-with-offsetting-provider-balances-migration.component';
import { FeeScheduleAnalysisByCarrierMigrationComponent } from './reports/fee-schedule-analysis-by-carrier-migration/fee-schedule-analysis-by-carrier-migration.component';
import { AdjustmentsByProviderMigrationComponent } from './reports/adjustments-by-provider-migration/adjustments-by-provider-migration.component';
import { AdjustmentsByTypeMigrationComponent } from './reports/adjustments-by-type-migration/adjustments-by-type-migration.component';
import { CreditDistributionHistoryMigrationComponent } from './reports/credit-distribution-history-migration/credit-distribution-history-migration.component';
import { CustomReportComponent } from './reports/custom-report/custom-report.component';
import { DailyProductionCollectionSummaryMigrationComponent } from './reports/daily-production-collection-summary-migration/daily-production-collection-summary-migration.component';
import { EncountersByCarrierMigrationComponent } from './reports/encounters-by-carrier-migration/encounters-by-carrier-migration.component';
import { EncountersByPaymentMigrationComponent } from './reports/encounters-by-payment-migration/encounters-by-payment-migration.component';
import { NetCollectionByProviderMigrationComponent } from './reports/collection-by-provider-migration/collection-by-provider-migration.component';
import { NetproductionByProviderMigrationComponent } from './reports/production-by-provider-migration/production-by-provider-migration.component';
import { PatientsByBenefitPlanMigrationComponent } from './reports/patients-by-benefit-plan-migration/patients-by-benefit-plan-migration.component';
import { PatientsByFlagsMigrationComponent } from './reports/patients-by-flags-migration/patients-by-flags-migration.component';
import { PatientsClinicalNotesComponent } from './reports/patients-clinical-notes/patients-clinical-notes.component';
import { PaymentLocationReconciliationMigrationComponent } from './reports/payment-location-reconciliation-migration/payment-location-reconciliation-migration.component';
import { PaymentReconciliationMigrationComponent } from './reports/payment-reconciliation-migration/payment-reconciliation-migration.component';
import { PerformanceByProviderDetailedMigrationComponent } from './reports/performance-by-provider-detailed-migration/performance-by-provider-detailed-migration.component';
import { PotentialDuplicatePatientsMigrationComponent } from './reports/potential-duplicate-patients-migration/potential-duplicate-patients-migration.component';
import { ProjectedNetProductionMigrationComponent } from './reports/projected-production-migration/projected-production-migration.component';
import { ProposedTreatmentMigrationComponent } from './reports/proposed-treatment-migration/proposed-treatment-migration.component';
import { ReceivablesByAccountMigrationComponent } from './reports/receivables-by-account-migration/receivables-by-account-migration.component';
import { ReferralSourcesProductivityDetailedMigrationComponent } from './reports/referral-sources-productivity-detailed-migration/referral-sources-productivity-detailed-migration.component';
import { ReferredPatientsMigrationComponent } from './reports/referred-patients-migration/referred-patients-migration.component';
import { ReferredPatientsBetaMigrationComponent } from './reports/referred-patient-migration/referred-patient-migration.component';
import { ReportExportComponent } from './reports/report-export/report-export.component';
import { ScheduledAppointmentsMigrationComponent } from './reports/scheduled-appointments-migration/scheduled-appointments-migration.component';
import { ServiceCodeProductivityByProviderMigrationComponent } from './reports/service-code-productivity-by-provider-migration/service-code-productivity-by-provider-migration.component';
import { TreatmentPlanPerformanceMigrationComponent } from './reports/treatment-plan-performance-migration/treatment-plan-performance-migration.component';
import { UnassignedUnappliedCreditsMigrationComponent } from './reports/unassigned-unapplied-credits-migration/unassigned-unapplied-credits-migration.component';
import { SearchFilterComponent } from './search-filter/search-filter.component';
import { ReportServiceCodeFilterComponent } from './report-service-code-filter/report-service-code-filter.component';
import { PaymentTypesComponent } from './payment-types/payment-types.component';
import { AdjustmentTypesComponent } from './practice-settings/adjustment-types/adjustment-types.component';
import { BankAccountService } from './practice-settings/billing/bank-accounts/bank-account.service';
import { BankAccountsComponent } from './practice-settings/billing/bank-accounts/bank-accounts.component';
import { DiscountTypesComponent } from './practice-settings/billing/discount-types/discount-types.component';
import { DrawTypesLandingComponent } from './practice-settings/chart/draw-types/draw-types-landing.component';
import { NoteTemplatesComponent } from './practice-settings/chart/note-templates/note-templates.component';
import { ConditionsLandingComponent } from './practice-settings/clinical/conditions/conditions-landing/conditions-landing.component';
import { PatientMedicalAlertsComponent } from './practice-settings/clinical/patient-medical-alerts/patient-medical-alerts.component';
import { PreventiveCareSetupComponent } from './practice-settings/clinical/preventive-care-setup/preventive-care-setup.component';
import { AccountStatementMessagesService } from './practice-settings/default-messages/account-statement-billing-message/account-statement-messages.service';
import { BillingMessagesService } from './practice-settings/default-messages/billing-messages.service';
import { DefaultMessagesComponent } from './practice-settings/default-messages/default-messages.component';
import { FeeListCrudComponent } from './practice-settings/fee-lists/fee-list-crud/fee-list-crud.component';
import { FeeListsLandingComponent } from './practice-settings/fee-lists/fee-lists-landing/fee-lists-landing.component';
import { LocationsIdentifiersComponent } from './practice-settings/identifiers/locations-identifiers/locations-identifiers.component';
import { LocationCrudComponent } from './practice-settings/location-crud/location-crud.component';
import { LocationLandingComponent } from './practice-settings/location-landing/location-landing.component';
import { GroupTypesComponent } from './practice-settings/patient-profile/group-types/group-types.component';
import { MasterAlertsComponent } from './practice-settings/patient-profile/master-alerts/master-alerts.component';
import { PatientAdditionalIdentifierService } from './practice-settings/patient-profile/patient-additional-identifiers/patient-additional-identifier.service';
import { PatientAdditionalIdentifiersComponent } from './practice-settings/patient-profile/patient-additional-identifiers/patient-additional-identifiers.component';
import { ReferralSourcesComponent } from './practice-settings/patient-profile/referral-sources/referral-sources.component';
import { ReferralTypeCrudComponent } from './practice-settings/patient-profile/referral-type/referral-type-crud/referral-type-crud.component';
import { ReferralTypeListComponent } from './practice-settings/patient-profile/referral-type/referral-type-list/referral-type-list.component';
import { ReferralTypeComponent } from './practice-settings/patient-profile/referral-type/referral-type.component';
import { PracticeInformationComponent } from './practice-settings/practice-information/practice-information.component';
import { PracticeSettingsComponent } from './practice-settings/practice-settings.component';
import { AppointmentTypesLandingComponent } from './practice-settings/schedule/appointment-types-landing/appointment-types-landing.component';
import { ServiceTypesComponent } from './practice-settings/service-types/service-types.component';
import { TeamMemberCrudComponent } from './practice-settings/team-members/team-member-crud/team-member-crud.component';
import { TeamMemberIdentifiersComponent } from './practice-settings/team-members/team-member-identifiers/team-member-identifiers.component';
import { TeamMemberLandingComponent } from './practice-settings/team-members/team-member-landing/team-member-landing.component';
import { UserRolesByLocationComponent } from './practice-settings/team-members/user-roles-by-location/user-roles-by-location.component';
import { TreatmentConsentComponent } from './practice-settings/treatment-consent/treatment-consent.component';
import { InformedConsentSetupComponent } from './practice-setup/informed-consent-setup/informed-consent-setup.component';
import { ServiceCodeSearchComponent } from './service-code/service-code-search/service-code-search.component';
import { PatientsByPatientGroupsMigrationComponent } from './reports/patients-by-patient-groups-migration/patients-by-patient-groups-migration.component';
import { BenefitPlansByInsurancePaymentTypeMigrationComponent } from './reports/benefit-plans-by-insurance-payment-type-migration/benefit-plans-by-insurance-payment-type-migration.component';
import { BenefitPlansByFeeScheduleMigrationComponent } from './reports/benefit-plans-by-fee-schedule-migration/benefit-plans-by-fee-schedule-migration.component';
import { BenefitPlansByCarrierMigrationComponent } from './reports/benefit-plans-by-carrier-migration/benefit-plans-by-carrier-migration.component';
import { NewPatientsSeenMigrationComponent } from './reports/new-patients-seen-migration/new-patients-seen-migration.component';
import { ServiceCodeByServiceTypeProductivityMigrationComponent } from './reports/service-code-by-service-type-productivity-migration/service-code-by-service-type-productivity-migration.component';
import { ReferralManagementHttpService } from '../@core/http-services/referral-management-http.service';
import { ReferralsDrawerViewComponent } from './practice-settings/patient-profile/referrals-drawer-view/referrals-drawer-view.component';
import { CarrierMigrationComponent } from './reports/carrier-migration/carrier-migration.component';
import { ReferralAffiliatesReferralOutMigrationComponent } from './reports/referral-affiliates-referral-out/referral-affiliates-referral-out-migration.component'
import { ReferralSourceProductivityMigrationComponent } from './reports/referral-source-productivity-migration/referral-source-productivity-migration.component';
import { ServiceTypesService } from './practice-settings/service-types/service-types.service';
import { ActivityLogsMigrationComponent } from './reports/activity-logs-migration/activity-logs-migration.component';
import { ServiceHistoryMigrationComponent } from './reports/service-history-migration/service-history-migration.component';

declare var angular: angular.IAngularStatic;

export function BusinessCenterDowngrade() {
  angular
    .module('Soar.Main')
    .directive('newControlTestingView', downgradeComponent({ component: NewControlTestingViewComponent }))
    .directive('locationSearchNg', downgradeComponent({ component: LocationSearchComponent }))
    .directive('massUpdateAppointmentsTransfer', downgradeComponent({ component: AppointmentsTransferComponent }))
    .directive('massUpdate', downgradeComponent({ component: MassUpdateComponent }))
    .directive('massUpdateResults', downgradeComponent({ component: MassUpdateResultsComponent }))
    .directive('patientReferralsFilter', downgradeComponent({ component: PatientReferralsFilterComponent }))
    .directive('patientReferralsBetaFilter', downgradeComponent({ component: PatientReferralsBetaFilterComponent }))
    .factory('ChartColorsHttpService', downgradeInjectable(ChartColorsHttpService))
    .directive('chartCustomColors', downgradeComponent({ component: ChartCustomColorsComponent }))
    .directive('reportCheckboxFilter', downgradeComponent({ component: ReportCheckboxFilterComponent }))
    .directive('reportDateFilter', downgradeComponent({ component: ReportDateFilterComponent }))
    .directive('reportFilterBox', downgradeComponent({ component: ReportFilterBoxComponent }))
    .directive('reportNumericFilter', downgradeComponent({ component: ReportNumericFilterComponent }))
    .directive('reportPatientFilter', downgradeComponent({ component: ReportPatientFilterComponent }))
    .directive('reportRadioFilter', downgradeComponent({ component: ReportRadioFilterComponent }))
    .directive(
      'accountsWithOffsettingProviderBalancesReport',
      downgradeComponent({ component: AccountWithOffsettingProviderBalancesMigrationComponent })
    )
    .directive(
      'feeScheduleAnalysisByCarrierReport',
      downgradeComponent({ component: FeeScheduleAnalysisByCarrierMigrationComponent })
    )
    .directive('adjustmentsByProviderReport', downgradeComponent({ component: AdjustmentsByProviderMigrationComponent }))
    .directive('adjustmentsByTypeReport', downgradeComponent({ component: AdjustmentsByTypeMigrationComponent }))
    .directive('creditDistributionHistoryReport', downgradeComponent({ component: CreditDistributionHistoryMigrationComponent }))
    .directive('customReport', downgradeComponent({ component: CustomReportComponent }))
    .directive('dailyProductionCollectionSummary', downgradeComponent({ component: DailyProductionCollectionSummaryMigrationComponent }))
    .directive('encountersByCarrier', downgradeComponent({ component: EncountersByCarrierMigrationComponent }))
    .directive('encountersByPayment', downgradeComponent({ component: EncountersByPaymentMigrationComponent }))
    .directive('netCollectionByProviderReport', downgradeComponent({ component: NetCollectionByProviderMigrationComponent }))
    .directive('netproductionByProviderReport', downgradeComponent({ component: NetproductionByProviderMigrationComponent }))
    .directive('patientsByBenefitPlanReport', downgradeComponent({ component: PatientsByBenefitPlanMigrationComponent }))
    .directive('patientsByFlagsReport', downgradeComponent({ component: PatientsByFlagsMigrationComponent }))
    .directive('patientsByPatientGroupsReport', downgradeComponent({ component: PatientsByPatientGroupsMigrationComponent }))
    .directive('benefitPlansByInsurancePaymentTypeReport', downgradeComponent({ component: BenefitPlansByInsurancePaymentTypeMigrationComponent }))
    .directive('serviceHistoryReport', downgradeComponent({ component: ServiceHistoryMigrationComponent }))
    .directive('patientsClinicalNotesReport', downgradeComponent({ component: PatientsClinicalNotesComponent }))
    .directive('paymentLocationReconciliationReport', downgradeComponent({ component: PaymentLocationReconciliationMigrationComponent }))
    .directive('paymentReconciliationReport', downgradeComponent({ component: PaymentReconciliationMigrationComponent }))
    .directive('performanceByProviderDetailedReport', downgradeComponent({ component: PerformanceByProviderDetailedMigrationComponent }))
    .directive('potentialDuplicatePatientsReport', downgradeComponent({ component: PotentialDuplicatePatientsMigrationComponent }))
    .directive('projectedNetProductionReport', downgradeComponent({ component: ProjectedNetProductionMigrationComponent }))
    .directive('proposedTreatmentReport', downgradeComponent({ component: ProposedTreatmentMigrationComponent }))
    .directive('receivablesByAccountReport', downgradeComponent({ component: ReceivablesByAccountMigrationComponent }))
    .directive(
      'referralSourcesProductivityDetailedReport',
      downgradeComponent({ component: ReferralSourcesProductivityDetailedMigrationComponent })
    )
    .directive('referredPatientsReport', downgradeComponent({ component: ReferredPatientsMigrationComponent }))
    .directive('referredPatientReport', downgradeComponent({ component: ReferredPatientsBetaMigrationComponent }))
    .directive('reportExportt', downgradeComponent({ component: ReportExportComponent }))
    .directive('scheduledAppointmentsReport', downgradeComponent({ component: ScheduledAppointmentsMigrationComponent }))
    .directive(
      'serviceCodeProductivityByProviderReport',
      downgradeComponent({ component: ServiceCodeProductivityByProviderMigrationComponent })
    )
    .directive('treatmentPlanPerformanceReport', downgradeComponent({ component: TreatmentPlanPerformanceMigrationComponent }))
    .directive('unassignedUnappliedCreditsReport', downgradeComponent({ component: UnassignedUnappliedCreditsMigrationComponent }))
    .directive('search-filter', downgradeComponent({ component: SearchFilterComponent }))
    .directive('report-service-code-filter', downgradeComponent({ component: ReportServiceCodeFilterComponent }))
    .directive(
      'locationCrudNg',
      downgradeComponent({
        component: LocationCrudComponent,
        inputs: ['selected-location'],
        outputs: ['saveFuncChange', 'editFuncChange'],
      })
    )
    .directive('practiceInformationNg', downgradeComponent({ component: PracticeInformationComponent }))
    .directive('locationSearchNg', downgradeComponent({ component: LocationSearchComponent }))
    .directive('practiceSettingsNg', downgradeComponent({ component: PracticeSettingsComponent }))
    .directive('locationLandingNg', downgradeComponent({ component: LocationLandingComponent }))
    .directive('locationsIdentifiersNg', downgradeComponent({ component: LocationsIdentifiersComponent }))
    .directive('informedConsentSetupNg', downgradeComponent({ component: InformedConsentSetupComponent }))
    .directive('treatmentConsentNg', downgradeComponent({ component: TreatmentConsentComponent }))
    .directive('serviceCodeSearchNg', downgradeComponent({ component: ServiceCodeSearchComponent }))
    .directive('teamMemberIdentifiersNg', downgradeComponent({ component: TeamMemberIdentifiersComponent }))
    .directive('serviceTypes', downgradeComponent({ component: ServiceTypesComponent }))
    .directive('feeListsLanding', downgradeComponent({ component: FeeListsLandingComponent }))
    .directive('feeListCrud', downgradeComponent({ component: FeeListCrudComponent }))
    .directive('defaultMessages', downgradeComponent({ component: DefaultMessagesComponent }))
    .directive('drawTypesLanding', downgradeComponent({ component: DrawTypesLandingComponent }))
    .directive('discountTypesLanding', downgradeComponent({ component: DiscountTypesComponent }))
    .directive('noteTemplatesNg', downgradeComponent({ component: NoteTemplatesComponent }))
    .directive('conditionsLanding', downgradeComponent({ component: ConditionsLandingComponent }))
    .directive('preventiveCareSetup', downgradeComponent({ component: PreventiveCareSetupComponent }))
    .directive('patientMedicalAlertsNg', downgradeComponent({ component: PatientMedicalAlertsComponent }))
    .directive('groupTypesNg', downgradeComponent({ component: GroupTypesComponent }))
    .directive('adjustmentTypesNg', downgradeComponent({ component: AdjustmentTypesComponent }))
    .directive('masterAlertsNg', downgradeComponent({ component: MasterAlertsComponent }))
    .directive('patientAdditionalIdentifiers', downgradeComponent({ component: PatientAdditionalIdentifiersComponent }))
    .directive('referralSources', downgradeComponent({ component: ReferralSourcesComponent }))
    .directive(
      'userRolesByLocationNg',
      downgradeComponent({
        component: UserRolesByLocationComponent,
      })
    )
    .directive(
      'teamMemberCrudNg',
      downgradeComponent({
        component: TeamMemberCrudComponent,
      })
    )
    .directive('appointmentTypesLandingNg', downgradeComponent({ component: AppointmentTypesLandingComponent }))
    .directive('teamMemberLandingNg', downgradeComponent({ component: TeamMemberLandingComponent }))
    .directive('bankAccounts', downgradeComponent({ component: BankAccountsComponent }))
    .factory('BankAccountService', downgradeInjectable(BankAccountService))
    .factory('BillingMessagesService', downgradeInjectable(BillingMessagesService))
    .factory('AccountStatementMessagesService', downgradeInjectable(AccountStatementMessagesService))
    .factory('PatientAdditionalIdentifierService', downgradeInjectable(PatientAdditionalIdentifierService))
    .factory('ReferralManagementHttpService', downgradeInjectable(ReferralManagementHttpService))
    .factory('ServiceTypesService', downgradeInjectable(ServiceTypesService))
    .directive('paymentType', downgradeComponent({ component: PaymentTypesComponent }))
    .directive('referralTypeList', downgradeComponent({ component: ReferralTypeCrudComponent }))
    .directive('referralType', downgradeComponent({ component: ReferralTypeComponent }))
    .directive('referralTypeList', downgradeComponent({ component: ReferralTypeListComponent }))
    .directive('benefitPlansByFeeScheduleReport', downgradeComponent({ component: BenefitPlansByFeeScheduleMigrationComponent })) 
    .directive('benefitPlansByCarrierReport', downgradeComponent({ component: BenefitPlansByCarrierMigrationComponent }))
    .directive('newPatientsSeenReport', downgradeComponent({ component: NewPatientsSeenMigrationComponent }))
    .directive('referralsDrawerView', downgradeComponent({ component: ReferralsDrawerViewComponent }))
    .directive(
          'serviceCodeByServiceTypeProductivityReport',
        downgradeComponent({ component: ServiceCodeByServiceTypeProductivityMigrationComponent })
      )
      
    .directive('carrierReport', downgradeComponent({ component: CarrierMigrationComponent }))
    .directive('referralSourceProductivityReport', downgradeComponent({ component: ReferralSourceProductivityMigrationComponent }))
    .directive('referralAffiliatesReferralOutReport', downgradeComponent({ component: ReferralAffiliatesReferralOutMigrationComponent }))
    .directive('activityLogsAsyncReport', downgradeComponent({ component: ActivityLogsMigrationComponent }))
}
