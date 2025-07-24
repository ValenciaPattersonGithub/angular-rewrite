import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from "@angular/material/icon";
import { CommonModule } from '@angular/common';
import { PaymentTypesComponent } from './payment-types/payment-types.component';
import { SharedModule } from 'src/@shared/shared.module';
import { AppKendoUIModule } from 'src/app-kendo-ui/app-kendo-ui.module';
import { NgxMaskModule } from 'ngx-mask';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { PaymentTypeComponent } from './payment-types/payment-type/payment-type.component';
import { BrowserModule } from '@angular/platform-browser';
import { PaymentTypesListComponent } from './payment-types/payment-types-list/payment-types-list.component';
import { ReportFilterBoxComponent } from './report-filter-box/report-filter-box.component';
import { ReportRadioFilterComponent } from './report-radio-filter/report-radio-filter.component';
import { ReportCheckboxFilterComponent } from './report-checkbox-filter/report-checkbox-filter.component';
import { ReportPatientFilterComponent } from './report-patient-filter/report-patient-filter.component';
import { TranslateModule } from '@ngx-translate/core';
import { ReportDateFilterComponent } from './report-date-filter/report-date-filter.component';
import { ReportNumericFilterComponent } from './report-numeric-filter/report-numeric-filter.component';
import { SearchFilterComponent } from './search-filter/search-filter.component';
import { ReportServiceCodeFilterComponent } from './report-service-code-filter/report-service-code-filter.component';
import { PatientReferralsFilterComponent } from './patient-referrals-filter/patient-referrals-filter.component';
import { PatientReferralsBetaFilterComponent } from './patient-referrals-beta-filter/patient-referrals-beta-filter.component';
import { CustomReportComponent } from './reports/custom-report/custom-report.component';
import { ReportExportComponent } from './reports/report-export/report-export.component';
import { NewControlTestingViewComponent } from './control-testing/new-control-testing-view.component';
import { CommunicationCenterModule } from 'src/patient/communication-center/communication-center.module';
import { CommunicationCardComponent } from 'src/patient/communication-center/communication-card/communication-card.component';
import { SchedulingModule } from '../scheduling/scheduling.module';
import { ChartCustomColorsComponent } from './practice-settings/chart-custom-colors/chart-custom-colors.component';
import { ChartColorsHttpService } from './practice-settings/chart-custom-colors/chart-custom-colors-http.service';
import { PerformanceByProviderDetailedMigrationComponent } from './reports/performance-by-provider-detailed-migration/performance-by-provider-detailed-migration.component';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { NetCollectionByProviderMigrationComponent } from './reports/collection-by-provider-migration/collection-by-provider-migration.component';
import { NetproductionByProviderMigrationComponent } from './reports/production-by-provider-migration/production-by-provider-migration.component';
import { AdjustmentsByProviderMigrationComponent } from './reports/adjustments-by-provider-migration/adjustments-by-provider-migration.component';
import { AdjustmentsByTypeMigrationComponent } from './reports/adjustments-by-type-migration/adjustments-by-type-migration.component';
import { DailyProductionCollectionSummaryMigrationComponent } from './reports/daily-production-collection-summary-migration/daily-production-collection-summary-migration.component';
import { ReferralSourcesProductivityDetailedMigrationComponent } from './reports/referral-sources-productivity-detailed-migration/referral-sources-productivity-detailed-migration.component';
import { PaymentReconciliationMigrationComponent } from './reports/payment-reconciliation-migration/payment-reconciliation-migration.component';
import { ReceivablesByAccountMigrationComponent } from './reports/receivables-by-account-migration/receivables-by-account-migration.component';
import { ReportsHelper } from './reports/reports-helper';
import { PaymentLocationReconciliationMigrationComponent } from './reports/payment-location-reconciliation-migration/payment-location-reconciliation-migration.component';
import { ProjectedNetProductionMigrationComponent } from './reports/projected-production-migration/projected-production-migration.component';
import { PotentialDuplicatePatientsMigrationComponent } from './reports/potential-duplicate-patients-migration/potential-duplicate-patients-migration.component';
import { ReferredPatientsMigrationComponent } from './reports/referred-patients-migration/referred-patients-migration.component';
import { ReferredPatientsBetaMigrationComponent } from './reports/referred-patient-migration/referred-patient-migration.component';
import { EncountersByCarrierMigrationComponent } from './reports/encounters-by-carrier-migration/encounters-by-carrier-migration.component';
import { ScheduledAppointmentsMigrationComponent } from './reports/scheduled-appointments-migration/scheduled-appointments-migration.component';
import { CreditDistributionHistoryMigrationComponent } from './reports/credit-distribution-history-migration/credit-distribution-history-migration.component';
import { ProposedTreatmentMigrationComponent } from './reports/proposed-treatment-migration/proposed-treatment-migration.component';
import { LocationCrudComponent } from './practice-settings/location-crud/location-crud.component';
import { PracticeSettingsComponent } from './practice-settings/practice-settings.component';
import { MassUpdateComponent } from './mass-updates/mass-update/mass-update.component';
import { EncountersByPaymentMigrationComponent } from './reports/encounters-by-payment-migration/encounters-by-payment-migration.component';
import { LocationSearchComponent } from './locations/location-search/location-search.component';
import { PracticeInformationComponent } from './practice-settings/practice-information/practice-information.component';
import { LocationDatePickerComponent } from './practice-settings/location-crud/location-date-picker/location-date-picker.component';
import { ViewLocationComponent } from './practice-settings/view-location/view-location.component';
import { LocationLandingComponent } from './practice-settings/location-landing/location-landing.component';
import { MassUpdateResultsComponent } from './mass-updates/mass-update-results/mass-update-results.component';
import { MassUpdateService } from './mass-updates/mass-update.service';
import { LocationsIdentifiersComponent } from './practice-settings/identifiers/locations-identifiers/locations-identifiers.component';
import { InformedConsentSetupComponent } from './practice-setup/informed-consent-setup/informed-consent-setup.component';
import { TreatmentConsentComponent } from './practice-settings/treatment-consent/treatment-consent.component';
import { ServiceCodeSearchComponent } from './service-code/service-code-search/service-code-search.component';
import { TeamMemberIdentifiersComponent } from './practice-settings/team-members/team-member-identifiers/team-member-identifiers.component';
import { ServiceCodeCrudComponent } from './service-code/service-code-crud/service-code-crud.component';
import { ServiceFeesByLocationComponent } from './service-code/service-fees-by-location/service-fees-by-location.component';
import { ServiceCodesPickerModalComponent } from './service-code/service-codes-picker-modal/service-codes-picker-modal.component';
import { SmartCodeSetupComponent } from './service-code/smart-code-setup/smart-code-setup.component';
import { CdtCodePickerModalComponent } from './service-code/cdt-code-picker-modal/cdt-code-picker-modal.component';
import { SwiftpickCodeCrudComponent } from './service-code/swiftpick-code-crud/swiftpick-code-crud.component';
import { ServiceTypesComponent } from './practice-settings/service-types/service-types.component';
import { FeeListCrudComponent } from './practice-settings/fee-lists/fee-list-crud/fee-list-crud.component';
import { FeeListsLandingComponent } from './practice-settings/fee-lists/fee-lists-landing/fee-lists-landing.component';
import { DefaultMessagesComponent } from './practice-settings/default-messages/default-messages.component';
import { AccountStatementBillingMessageComponent } from './practice-settings/default-messages/account-statement-billing-message/account-statement-billing-message.component';
import { AccountStatementBillingMessageCrudComponent } from './practice-settings/default-messages/account-statement-billing-message/account-statement-billing-message-crud/account-statement-billing-message-crud.component';
import { DrawTypesLandingComponent } from './practice-settings/chart/draw-types/draw-types-landing.component';
import { DiscountTypesComponent } from './practice-settings/billing/discount-types/discount-types.component';
import { AppointmentsTransferComponent } from './mass-updates/appointments-transfer/appointments-transfer.component';
import { TreatmentPlanPerformanceMigrationComponent } from './reports/treatment-plan-performance-migration/treatment-plan-performance-migration.component';
import { OrderByFeelistPipe } from './practice-settings/fee-lists/pipes/order-by-feelist.pipe';
import { PatientsClinicalNotesComponent } from './reports/patients-clinical-notes/patients-clinical-notes.component';
import { AdjustmentTypesListComponent } from './practice-settings/adjustment-types/adjustment-types-list/adjustment-types-list.component';
import { AdjustmentTypesComponent } from './practice-settings/adjustment-types/adjustment-types.component';
import { NoteTemplatesComponent } from './practice-settings/chart/note-templates/note-templates.component';
import { ConditionsLandingComponent } from './practice-settings/clinical/conditions/conditions-landing/conditions-landing.component';
import { PreventiveCareSetupComponent } from './practice-settings/clinical/preventive-care-setup/preventive-care-setup.component';
import { PatientMedicalAlertsComponent } from './practice-settings/clinical/patient-medical-alerts/patient-medical-alerts.component';
import { GroupTypesComponent } from './practice-settings/patient-profile/group-types/group-types.component';
import { AdjustmentTypeFormComponent } from './practice-settings/adjustment-types/adjustment-type-form/adjustment-type-form.component';
import { MasterAlertsComponent } from './practice-settings/patient-profile/master-alerts/master-alerts.component';
import { PatientAdditionalIdentifiersComponent } from './practice-settings/patient-profile/patient-additional-identifiers/patient-additional-identifiers.component';
import { ReferralSourcesComponent } from './practice-settings/patient-profile/referral-sources/referral-sources.component';
import { NoteTemplatesListComponent } from './practice-settings/chart/note-templates/note-templates-list/note-templates-list.component';
import { UserRolesByLocationComponent } from './practice-settings/team-members/user-roles-by-location/user-roles-by-location.component';
import { AppointmentTypesLandingComponent } from './practice-settings/schedule/appointment-types-landing/appointment-types-landing.component';
import { TeamMemberCrudComponent } from './practice-settings/team-members/team-member-crud/team-member-crud.component';
import { TeamMemberLandingComponent } from './practice-settings/team-members/team-member-landing/team-member-landing.component';
import { BankAccountsComponent } from './practice-settings/billing/bank-accounts/bank-accounts.component';
import { BankAccountService } from './practice-settings/billing/bank-accounts/bank-account.service';
import { ViewCompareRolesComponent } from './practice-settings/team-members/view-compare-roles/view-compare-roles.component';
import { TreatmentConsentService } from 'src/@shared/providers/treatment-consent.service';
import { TeamMemberContactInformationComponent } from './practice-settings/team-members/team-member-crud/team-member-contact-information/team-member-contact-information.component';
import { TeamMemberLocationsComponent } from './practice-settings/team-members/team-member-crud/team-member-locations/team-member-locations.component';
import { TeamMemberLocationSetupComponent } from './practice-settings/team-members/team-member-crud/team-member-locations/team-member-location-setup/team-member-location-setup.component';
import { TeamMemberAdditionalIdentifiersComponent } from './practice-settings/team-members/team-member-crud/team-member-additional-identifiers/team-member-additional-identifiers.component';
import { RxModule } from 'src/rx/rx.module';
import { MasterAlertService } from 'src/@shared/providers/master-alert.service';
import { UsersModule } from 'src/users/users.module';
import { TeamMemberFederalIdentificationComponent } from './practice-settings/team-members/team-member-crud/team-member-federal-identification/team-member-federal-identification.component';
import { TeamMemberStateIdentificationComponent } from './practice-settings/team-members/team-member-crud/team-member-state-identification/team-member-state-identification.component';
import { BillingMessagesService } from './practice-settings/default-messages/billing-messages.service';
import { ServiceTypesService } from './practice-settings/service-types/service-types.service';
import { InformedConsentMessageService } from 'src/@shared/providers/informed-consent-message.service';
import { GroupTypeService } from 'src/@shared/providers/group-type.service';
import { TeamMemberIdentifierService } from 'src/@shared/providers/team-member-identifier.service';
import { PatientAdditionalIdentifierService } from './practice-settings/patient-profile/patient-additional-identifiers/patient-additional-identifier.service';
import { FeeListsService } from 'src/@shared/providers/fee-lists.service';
import { ConditionsService } from 'src/@shared/providers/conditions.service';
import { DiscountTypesService } from 'src/@shared/providers/discount-types.service';
import { ServiceCodesService } from 'src/@shared/providers/service-codes.service';
import { LocationIdentifierService } from 'src/@shared/providers/location-identifier.service';
import { PreventiveCareService } from 'src/@shared/providers/preventive-care.service';
import { UnassignedUnappliedCreditsMigrationComponent } from './reports/unassigned-unapplied-credits-migration/unassigned-unapplied-credits-migration.component';
import { ReferralTypeComponent } from './practice-settings/patient-profile/referral-type/referral-type.component';
import { ReferralTypeListComponent } from './practice-settings/patient-profile/referral-type/referral-type-list/referral-type-list.component';
import { ReferralTypeCrudComponent } from './practice-settings/patient-profile/referral-type/referral-type-crud/referral-type-crud.component';
import { NewStandardService } from 'src/@shared/providers/new-standard.service';
import { ServiceSwiftCodeService } from './service-code/service-swift-code-service/service-swift-code.service';
import { PaymentTypesService } from 'src/@shared/providers/payment-types.service';
import { AdjustmentTypesService } from 'src/@shared/providers/adjustment-types.service';
import { AccountWithOffsettingProviderBalancesMigrationComponent } from './reports/accounts-with-offsetting-provider-balances-migration/accounts-with-offsetting-provider-balances-migration.component';
import { PatientsByBenefitPlanMigrationComponent } from './reports/patients-by-benefit-plan-migration/patients-by-benefit-plan-migration.component';
import { PatientsByFlagsMigrationComponent } from './reports/patients-by-flags-migration/patients-by-flags-migration.component';
import { ServiceCodeProductivityByProviderMigrationComponent } from './reports/service-code-productivity-by-provider-migration/service-code-productivity-by-provider-migration.component';
import { PatientsByPatientGroupsMigrationComponent } from './reports/patients-by-patient-groups-migration/patients-by-patient-groups-migration.component';
import { BenefitPlansByInsurancePaymentTypeMigrationComponent } from './reports/benefit-plans-by-insurance-payment-type-migration/benefit-plans-by-insurance-payment-type-migration.component';
import { BenefitPlansByFeeScheduleMigrationComponent } from './reports/benefit-plans-by-fee-schedule-migration/benefit-plans-by-fee-schedule-migration.component';
import { BenefitPlansByCarrierMigrationComponent } from './reports/benefit-plans-by-carrier-migration/benefit-plans-by-carrier-migration.component';
import { NewPatientsSeenMigrationComponent } from './reports/new-patients-seen-migration/new-patients-seen-migration.component';
import { ServiceCodeByServiceTypeProductivityMigrationComponent } from './reports/service-code-by-service-type-productivity-migration/service-code-by-service-type-productivity-migration.component';
import { ReferralManagementHttpService } from '../@core/http-services/referral-management-http.service';
import { ApplicationBillingInfoService } from '../@core/http-services/application-billing-info.service';
import { PatientReferralPrintService } from '../patient/patient-registration/patient-referrals/patient-referral-print.service';
import { ExportFileHttpService } from '../@core/http-services/export-file-http.service';
import { CardReaderListComponent } from './practice-settings/card-reader/card-reader-list/card-reader-list.component';
import { CardReaderComponent } from './practice-settings/card-reader/card-reader/card-reader.component';
import { PatientReferralCrudComponent } from '../patient/patient-registration/patient-referrals/patient-referral-crud/patient-referral-crud.component';
import { ReferralPatientDetailsComponent } from '../patient/patient-registration/patient-referrals/referral-patient-details/referral-patient-details.component';

import { InsuranceCredentialsComponent } from './practice-settings/insurance-credentials/insurance-credentials.component';
import { ReferralsDrawerViewComponent } from './practice-settings/patient-profile/referrals-drawer-view/referrals-drawer-view.component';
import {CarrierMigrationComponent}  from './reports/carrier-migration/carrier-migration.component';
import { ReferralAffiliatesReferralOutMigrationComponent } from './reports/referral-affiliates-referral-out/referral-affiliates-referral-out-migration.component'
import { ReferralSourceProductivityMigrationComponent } from './reports/referral-source-productivity-migration/referral-source-productivity-migration.component';
import { PaymentTypeOptionsDialogComponent } from './payment-types/payment-type-options-dialog/payment-type-options-dialog.component';
import { FeeScheduleAnalysisByCarrierMigrationComponent } from './reports/fee-schedule-analysis-by-carrier-migration/fee-schedule-analysis-by-carrier-migration.component';
import { DrawTypesService } from 'src/@shared/providers/drawtypes.service';
import { ActivityLogsMigrationComponent } from './reports/activity-logs-migration/activity-logs-migration.component';
import { ServiceHistoryMigrationComponent } from './reports/service-history-migration/service-history-migration.component';

@NgModule({
    declarations: [PaymentTypesComponent,
        PaymentTypeComponent,
        PaymentTypesListComponent,
        AdjustmentTypesComponent,
        AdjustmentTypesListComponent,
        ReportFilterBoxComponent,
        ReportRadioFilterComponent,
        ReportCheckboxFilterComponent,
        ReportPatientFilterComponent,
        ReportDateFilterComponent,
        ReportNumericFilterComponent,
        SearchFilterComponent,
        ReportServiceCodeFilterComponent,
        PatientReferralsFilterComponent,
        PatientReferralsBetaFilterComponent,
        CustomReportComponent,
        ReportExportComponent,
        NewControlTestingViewComponent,
        ChartCustomColorsComponent,
        PerformanceByProviderDetailedMigrationComponent,
        NetCollectionByProviderMigrationComponent,
        NetproductionByProviderMigrationComponent,
        AdjustmentsByProviderMigrationComponent,
        AdjustmentsByTypeMigrationComponent,
        DailyProductionCollectionSummaryMigrationComponent,
        ReferralSourcesProductivityDetailedMigrationComponent,
        PaymentReconciliationMigrationComponent,
        ReceivablesByAccountMigrationComponent,
        PaymentLocationReconciliationMigrationComponent,
        ProjectedNetProductionMigrationComponent,
        PotentialDuplicatePatientsMigrationComponent,
        ReferredPatientsMigrationComponent,
        ReferredPatientsBetaMigrationComponent,
        EncountersByCarrierMigrationComponent,
        ScheduledAppointmentsMigrationComponent,
        CreditDistributionHistoryMigrationComponent,
        ProposedTreatmentMigrationComponent,
        PracticeSettingsComponent,
        LocationCrudComponent,
        MassUpdateComponent,
        EncountersByPaymentMigrationComponent,
        LocationSearchComponent,
        PracticeInformationComponent,
        LocationDatePickerComponent,        
        ViewLocationComponent, 
        LocationLandingComponent,
        MassUpdateResultsComponent,
        LocationsIdentifiersComponent,
        InformedConsentSetupComponent,
        TreatmentConsentComponent,
        ServiceCodeSearchComponent,
        TeamMemberIdentifiersComponent,
        ServiceFeesByLocationComponent,                
        ServiceCodeCrudComponent,
        ServiceCodesPickerModalComponent,
        SmartCodeSetupComponent,
        CdtCodePickerModalComponent,        
        SwiftpickCodeCrudComponent, 
        ServiceTypesComponent, 
        FeeListCrudComponent,
        FeeListsLandingComponent,
        ServiceTypesComponent,
        DefaultMessagesComponent,
        AccountStatementBillingMessageComponent,
        AccountStatementBillingMessageCrudComponent,
        DrawTypesLandingComponent,
        DiscountTypesComponent,
        AppointmentsTransferComponent,
        TreatmentPlanPerformanceMigrationComponent,
        OrderByFeelistPipe,
        PatientsClinicalNotesComponent,
        NoteTemplatesComponent,
        ConditionsLandingComponent,
        NoteTemplatesComponent,
        PatientMedicalAlertsComponent,
        PreventiveCareSetupComponent,
        AdjustmentTypeFormComponent,
        GroupTypesComponent,
        MasterAlertsComponent,
        PatientAdditionalIdentifiersComponent,        
        ReferralSourcesComponent,
        NoteTemplatesListComponent,        
        UserRolesByLocationComponent,
        TeamMemberCrudComponent,        
        AppointmentTypesLandingComponent, 
        TeamMemberLandingComponent,
        BankAccountsComponent,
        ViewCompareRolesComponent,
        TeamMemberContactInformationComponent,
        TeamMemberLocationsComponent,
        TeamMemberLocationSetupComponent,
        TeamMemberAdditionalIdentifiersComponent,
        TeamMemberFederalIdentificationComponent,  
        TeamMemberStateIdentificationComponent,
        UnassignedUnappliedCreditsMigrationComponent,
        ReferralTypeComponent,
        ReferralTypeListComponent,
        ReferralTypeCrudComponent,
        AccountWithOffsettingProviderBalancesMigrationComponent,
        PatientsByBenefitPlanMigrationComponent,
        PatientsByFlagsMigrationComponent,
        ServiceCodeProductivityByProviderMigrationComponent,
        PatientsByPatientGroupsMigrationComponent,
        BenefitPlansByInsurancePaymentTypeMigrationComponent,
        BenefitPlansByFeeScheduleMigrationComponent,
        BenefitPlansByCarrierMigrationComponent,
        NewPatientsSeenMigrationComponent,
        ServiceCodeByServiceTypeProductivityMigrationComponent,
        CardReaderListComponent,
        CardReaderComponent,
        InsuranceCredentialsComponent,
        ReferralsDrawerViewComponent,
        CarrierMigrationComponent,
        ReferralSourceProductivityMigrationComponent,
        ReferralAffiliatesReferralOutMigrationComponent,
        PaymentTypeOptionsDialogComponent,
        FeeScheduleAnalysisByCarrierMigrationComponent,
        ServiceHistoryMigrationComponent,
        ActivityLogsMigrationComponent

    ],
    providers: [
        { provide: 'toastrFactory', useFactory: ($injector: any) => $injector.get('toastrFactory'), deps: ['$injector'] },        
        { provide: 'patSecurityService', useFactory: ($injector: any) => $injector.get('patSecurityService'), deps: ['$injector'] },
        { provide: 'ListHelper', useFactory: ($injector: any) => $injector.get('ListHelper'), deps: ['$injector'] },
        { provide: 'ReportsFactory', useFactory: ($injector: any) => $injector.get('ReportsFactory'), deps: ['$injector'] },
        { provide: 'localize', useFactory: ($injector: any) => $injector.get('localize'), deps: ['$injector'] },
        { provide: 'AmfaInfo', useFactory: ($injector: any) => $injector.get('AmfaInfo'), deps: ['$injector'] },
        { provide: 'LocationServices', useFactory: ($injector: any) => $injector.get('LocationServices'), deps: ['$injector'] },
        { provide: 'TimeZoneFactory', useFactory: ($injector: any) => $injector.get('TimeZoneFactory'), deps: ['$injector'] },
        { provide: 'UsersFactory', useFactory: ($injector: any) => $injector.get('UsersFactory'), deps: ['$injector'] },
        { provide: 'BusinessCenterServices', useFactory: ($injector: any) => $injector.get('BusinessCenterServices'), deps: ['$injector'] },
        { provide: 'referenceDataService', useFactory: ($injector: any) => $injector.get('referenceDataService'), deps: ['$injector'] },
        { provide: 'AppointmentTypesFactory', useFactory: ($injector: any) => $injector.get('AppointmentTypesFactory'), deps: ['$injector'] },
        { provide: 'StaticData', useFactory: ($injector: any) => $injector.get('StaticData'), deps: ['$injector'] },
        { provide: 'MedicalHistoryAlertsFactory', useFactory: ($injector: any) => $injector.get('MedicalHistoryAlertsFactory'), deps: ['$injector'] },
        { provide: '$q', useFactory: ($injector: any) => $injector.get('$q'), deps: ['$injector'] },
        { provide: 'SearchFactory', useFactory: ($injector: any) => $injector.get('SearchFactory'), deps: ['$injector'] },
        { provide: 'PatientServices', useFactory: ($injector: any) => $injector.get('PatientServices'), deps: ['$injector'] },
        { provide: 'GlobalSearchFactory', useFactory: ($injector: any) => $injector.get('GlobalSearchFactory'), deps: ['$injector'] },
        { provide: 'ReferralSourcesService', useFactory: ($injector: any) => $injector.get('ReferralSourcesService'), deps: ['$injector'] },
        { provide: 'ReportIdsForDateOptions', useFactory: ($injector: any) => $injector.get('ReportIdsForDateOptions'), deps: ['$injector'] },
        { provide: '$location', useFactory: ($injector: any) => $injector.get('$location'), deps: ['$injector'] },
        { provide: 'ModalFactory', useFactory: ($injector: any) => $injector.get('ModalFactory'), deps: ['$injector'] },
        { provide: 'ReportsService', useFactory: ($injector: any) => $injector.get('ReportsService'), deps: ['$injector'] },
        { provide: 'CustomReportService', useFactory: ($injector: any) => $injector.get('CustomReportService'), deps: ['$injector'] },
        { provide: 'ReportIds', useFactory: ($injector: any) => $injector.get('ReportIds'), deps: ['$injector'] },
        { provide: 'UserServices', useFactory: ($injector: any) => $injector.get('UserServices'), deps: ['$injector'] },
        { provide: 'DiscardChangesService', useFactory: ($injector: any) => $injector.get('DiscardChangesService'), deps: ['$injector'] },
        { provide: 'PatCacheFactory', useFactory: ($injector: any) => $injector.get('PatCacheFactory'), deps: ['$injector'] },
        { provide: 'ObjectService', useFactory: ($injector: any) => $injector.get('ObjectService'), deps: ['$injector'] },
        ChartColorsHttpService,
        ReportsHelper,
        MassUpdateService,  
        BankAccountService,
        TreatmentConsentService,
        MasterAlertService,
        ReferralManagementHttpService,
        ExportFileHttpService,
        PatientReferralPrintService,
        { provide: 'TimeZones', useFactory: ($injector: any) => $injector.get('TimeZones'), deps: ['$injector'] },
        { provide: 'AccountsOverdueValues', useFactory: ($injector: any) => $injector.get('AccountsOverdueValues'), deps: ['$injector'] },
        { provide: 'RxService', useFactory: ($injector: any) => $injector.get('RxService'), deps: ['$injector'] },
        { provide: '$filter', useFactory: ($injector: any) => $injector.get('$filter'), deps: ['$injector'] },    
        { provide: 'LocationDataService', useFactory: ($injector: any) => $injector.get('LocationDataService'), deps: ['$injector'] }, 
        { provide: 'uriService', useFactory: ($injector: any) => $injector.get('uriService'), deps: ['$injector'] },
        { provide: 'EnterpriseSettingService', useFactory: ($injector: any) => $injector.get('EnterpriseSettingService'), deps: ['$injector'] },
        { provide: 'BoundObjectFactory', useFactory: ($injector: any) => $injector.get('BoundObjectFactory'), deps: ['$injector'] },
        { provide: 'ServiceCodeCrudService', useFactory: ($injector: any) => $injector.get('ServiceCodeCrudService'), deps: ['$injector'] },
        { provide: '$timeout', useFactory: ($injector: any) => $injector.get('$timeout'), deps: ['$injector'] },
        { provide: 'ChartingFavoritesFactory', useFactory: ($injector: any) => $injector.get('ChartingFavoritesFactory'), deps: ['$injector'] },
        { provide: 'UsersFactory', useFactory: ($injector: any) => $injector.get('UsersFactory'), deps: ['$injector'] },
        { provide: 'AuthZService', useFactory: ($injector: any) => $injector.get('AuthZService'), deps: ['$injector'] },
        { provide: 'AccountStatementMessagesService', useFactory: ($injector: any) => $injector.get('AccountStatementMessagesService'), deps: ['$injector'] },
        { provide: 'message', useFactory: ($injector: any) => $injector.get('message'), deps: ['$injector'] },
        { provide: 'MedicalHistoryAlertsService', useFactory: ($injector: any) => $injector.get('MedicalHistoryAlertsService'), deps: ['$injector'] },
        { provide: 'MasterListStatus', useFactory: ($injector: any) => $injector.get('MasterListStatus'), deps: ['$injector'] },
        { provide: 'RoleNames', useFactory: ($injector: any) => $injector.get('RoleNames'), deps: ['$injector'] },        
        { provide: 'CustomFormsFactory', useFactory: ($injector: any) => $injector.get('CustomFormsFactory'), deps: ['$injector'] },
        { provide: 'RolesFactory', useFactory: ($injector: any) => $injector.get('RolesFactory'), deps: ['$injector'] },
        { provide: 'practiceService', useFactory: ($injector: any) => $injector.get('practiceService'), deps: ['$injector'] },
        { provide: 'RxUserType', useFactory: ($injector: any) => $injector.get('RxUserType'), deps: ['$injector'] },
        { provide: 'ProviderType', useFactory: ($injector: any) => $injector.get('ProviderType'), deps: ['$injector'] },
        { provide: 'ReferralTypeService', useFactory: ($injector: any) => $injector.get('ReferralTypeService'), deps: ['$injector'] },
        BillingMessagesService,
        ServiceTypesService,
        InformedConsentMessageService,
        GroupTypeService,
        TeamMemberIdentifierService,
        PatientAdditionalIdentifierService,
        FeeListsService,
        ConditionsService,
        DrawTypesService,
        DiscountTypesService,
        ServiceCodesService,       
        LocationIdentifierService,
        PreventiveCareService,
        NewStandardService,
        ServiceSwiftCodeService,        
        PaymentTypesService,
        AdjustmentTypesService,
        ApplicationBillingInfoService,
    ],
    imports: [
        CommonModule,
        BrowserModule,
        ScrollingModule,
        FormsModule,
        ReactiveFormsModule,
        BrowserAnimationsModule,
        AppKendoUIModule,
        SharedModule,
        TranslateModule,
        CommunicationCenterModule,
        SchedulingModule,
        NgxMaskModule.forRoot(),
        RxModule,
        UsersModule,
        MatIconModule
    ],
    entryComponents: [
        PaymentTypesComponent,
        PaymentTypeComponent,
        AdjustmentTypesComponent,
        ReportFilterBoxComponent,
        ReportRadioFilterComponent,
        ReportCheckboxFilterComponent,
        ReportPatientFilterComponent,
        ReportDateFilterComponent,
        SearchFilterComponent,
        ReportServiceCodeFilterComponent,
        PatientReferralsFilterComponent,
        PatientReferralsBetaFilterComponent,
        CustomReportComponent,
        ReportExportComponent,
        NewControlTestingViewComponent,
        ChartCustomColorsComponent,
        PerformanceByProviderDetailedMigrationComponent,
        NetCollectionByProviderMigrationComponent,
        NetproductionByProviderMigrationComponent,
        AdjustmentsByProviderMigrationComponent,
        AdjustmentsByTypeMigrationComponent,
        DailyProductionCollectionSummaryMigrationComponent,
        ReferralSourcesProductivityDetailedMigrationComponent,
        PaymentReconciliationMigrationComponent,
        ReceivablesByAccountMigrationComponent,
        PaymentLocationReconciliationMigrationComponent,
        ProjectedNetProductionMigrationComponent,
        PotentialDuplicatePatientsMigrationComponent,
        ReferredPatientsMigrationComponent,
        ReferredPatientsBetaMigrationComponent,
        EncountersByCarrierMigrationComponent,
        ScheduledAppointmentsMigrationComponent,
        CreditDistributionHistoryMigrationComponent,
        ProposedTreatmentMigrationComponent,
        PracticeSettingsComponent,
        LocationCrudComponent,
        MassUpdateComponent,
        EncountersByPaymentMigrationComponent,
        LocationSearchComponent,        
        ViewLocationComponent,
        PracticeInformationComponent,
        LocationDatePickerComponent,
        LocationLandingComponent,
        MassUpdateResultsComponent,
        LocationsIdentifiersComponent,
        InformedConsentSetupComponent,
        TreatmentConsentComponent,
        ServiceCodeSearchComponent,
        TeamMemberIdentifiersComponent,
        ServiceFeesByLocationComponent,        
        ServiceCodeCrudComponent,
        ServiceCodesPickerModalComponent,
        SmartCodeSetupComponent,
        CdtCodePickerModalComponent,
        SwiftpickCodeCrudComponent,
        ServiceTypesComponent,
        FeeListsLandingComponent,
        FeeListCrudComponent,
        ServiceTypesComponent,
        DefaultMessagesComponent,
        AccountStatementBillingMessageComponent,
        AccountStatementBillingMessageCrudComponent,
        DrawTypesLandingComponent,
        DiscountTypesComponent,
        AppointmentsTransferComponent,
        TreatmentPlanPerformanceMigrationComponent,
        PatientsClinicalNotesComponent,
        NoteTemplatesComponent,
        ConditionsLandingComponent,
        PatientMedicalAlertsComponent,
        PreventiveCareSetupComponent,
        GroupTypesComponent,
        MasterAlertsComponent,
        PatientAdditionalIdentifiersComponent,
        ReferralSourcesComponent,
        NoteTemplatesListComponent,
        UserRolesByLocationComponent,
        TeamMemberCrudComponent,        
        AppointmentTypesLandingComponent,
        TeamMemberLandingComponent,
        BankAccountsComponent,
        ViewCompareRolesComponent,
        TeamMemberContactInformationComponent,
        TeamMemberLocationsComponent,
        TeamMemberLocationSetupComponent,
        TeamMemberAdditionalIdentifiersComponent,
        TeamMemberFederalIdentificationComponent,
        TeamMemberStateIdentificationComponent,
        UnassignedUnappliedCreditsMigrationComponent,
        ReferralTypeComponent,
        ReferralTypeListComponent,
        ReferralTypeCrudComponent,
        AccountWithOffsettingProviderBalancesMigrationComponent,
        PatientsByBenefitPlanMigrationComponent,
        PatientsByFlagsMigrationComponent,
        ServiceCodeProductivityByProviderMigrationComponent,
        PatientsByPatientGroupsMigrationComponent,
        BenefitPlansByInsurancePaymentTypeMigrationComponent,
        BenefitPlansByFeeScheduleMigrationComponent,
        BenefitPlansByCarrierMigrationComponent,
        NewPatientsSeenMigrationComponent,
        ServiceCodeByServiceTypeProductivityMigrationComponent,
        CardReaderComponent,
        PatientReferralCrudComponent,
        ReferralsDrawerViewComponent,
        CarrierMigrationComponent,
        ReferralSourceProductivityMigrationComponent,
        ReferralAffiliatesReferralOutMigrationComponent,
        PaymentTypeOptionsDialogComponent,
        FeeScheduleAnalysisByCarrierMigrationComponent,
        ReferralPatientDetailsComponent,
        ServiceHistoryMigrationComponent,
        ActivityLogsMigrationComponent
    ],
    exports: [
        ChartCustomColorsComponent,
        ServiceCodesPickerModalComponent
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class BusinessCenterModule { }
