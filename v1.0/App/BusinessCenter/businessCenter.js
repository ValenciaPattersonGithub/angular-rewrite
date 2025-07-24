/* global patientMedicalAlertsWrapperController, userCrudWrapperController */

'use strict';

angular
  .module('Soar.BusinessCenter', [
    'ngRoute',
    'ngResource',
    'ngAnimate',
    'ngSanitize',
    'ngCookies',
    'common.directives',
    'common.controllers',
    'ui.bootstrap',
    'ui.select',
    'ui.utils',
    'common.factories',
    'common.filters',
    'common.services',
    'localytics.directives',
  ])
  .config([
    '$routeProvider',
    /**
     * 
     * @param {ng.route.IRouteProvider} $routeProvider
     */
    function ($routeProvider) {
      // Configure ng-view routing
      $routeProvider
        .when('/BusinessCenter/ControlTesting/', {
          title: 'Control Sand Box',
          templateUrl:
            'App/BusinessCenter/control-testing/control-testing.html',
          controller: 'ControlTestingController',
          data: {},
        })
        .when('/BusinessCenter/PracticeAtAGlance', {
          templateUrl:
            'App/BusinessCenter/practice-at-a-glance/practice-at-a-glance.html',
          controller: 'PracticeAtAGlanceController',
          title: 'Practice At A Glance',
          data: {},
        })
        .when('/BusinessCenter/medicalhistory/', {
          templateUrl:
            'App/BusinessCenter/settings/custom-forms/custom-forms-crud.html',
          controller: 'CustomFormsController',
          data: {
            amf: 'soar-biz-bcform-view',
            moduleName: 'BusinessCenter',
          },
        })
        .when('/BusinessCenter/PracticeSettings/Locations/', {
          templateUrl:
            'App/BusinessCenter/locations/location-landing/location-landing-w.html',
          controller: 'LocationLandingWrapperController',
          title: 'Locations',
          data: {
            amf: 'soar-biz-bizloc-view',
          },
        })
        .when('/BusinessCenter/PracticeSettings/Locations/:locationId', {
          templateUrl:
            'App/BusinessCenter/locations/location-crud/location-crud-w.html',
          controller: 'LocationCrudWrapperController',
          data: {
            amf: 'soar-biz-bizloc-edit',
          },
        })
        .when('/BusinessCenter/PracticeSettings/Blue', {
          templateUrl:
            'App/BusinessCenter/practice-setup/clinical-setup/blue-preferences/blue-preferences.html',
          controller: 'BluePreferencesController',
        })
        .when('/BusinessCenter/Receivables', {
          templateUrl: 'App/BusinessCenter/receivables/receivables.html',
          title: 'Receivables',
          data: {
            amf: 'soar-biz-bizrcv-view',
          },
        })
        .when('/BusinessCenter/Receivables/TotalReceivables/:tabName', {
          templateUrl: 'App/BusinessCenter/receivables/receivables.html',
          title: 'Receivables',
          data: {
            amf: 'soar-biz-bizrcv-view',
          },
        })
        .when('/BusinessCenter/Receivables/Deposits/:locationId/Create', {
          templateUrl:
            'App/BusinessCenter/receivables/deposits/deposit-payments-modal/deposit-payments-modal.html',
          controller: 'DepositPaymentsModalController',
          title: 'Create Deposits',
          data: {},
        })
        .when(
          '/BusinessCenter/Receivables/Deposits/:locationId/Edit/:depositId/:viewMode?',
          {
            templateUrl:
              'App/BusinessCenter/receivables/deposits/deposit-payments-modal/deposit-payments-modal.html',
            controller: 'DepositPaymentsModalController',
            title: 'Edit Deposit',
            data: {},
          }
        )
        .when('/BusinessCenter/Receivables/Deposits/:depositId/PrintDeposit/', {
          title: 'Print Deposit',
          templateUrl:
            'App/BusinessCenter/receivables/deposits/deposit-grid-print/deposit-grid-print.html',
          controller: 'DepositGridPrintController',
          data: {},
        })
        .when(
          '/BusinessCenter/Receivables/Statements/Report/:batchStatementId',
          {
            title: 'eStatement Report',
            templateUrl:
              'App/BusinessCenter/receivables/statements/statement-report/statement-report.html',
            controller: 'StatementReportController',
            data: {},
          }
        )
        .when(
          '/BusinessCenter/Insurance/Claims/CarrierResponse/:claimId/Patient/:patientId',
          {
            templateUrl:
              'App/BusinessCenter/insurance/claims/predetermination-authorization/predetermination-authorization.html',
            controller: 'PredeterminationAuthorizationController',
            data: {
              amf: 'soar-ins-iclaim-view',
              primaryTeam: 'Insurance',
            },
          }
        )
        .when('/BusinessCenter/Users/', {
          templateUrl:
            'App/BusinessCenter/users/user-landing/user-landing-w.html',
          controller: 'UserLandingWrapperController',
          title: 'Team Members',
          data: {
            amf: 'soar-biz-bizusr-view',
          },
        })
        .when('/BusinessCenter/Users/Create/', {
          templateUrl: 'App/BusinessCenter/users/user-crud/user-crud-w.html',
          controller: 'UserCrudWrapperController',
          title: 'Add a Team Member',
          data: {
            amf: 'soar-biz-bizusr-add',
          },
          resolve: userCrudWrapperController.resolveUserCrudControl,
        })
        .when('/BusinessCenter/Users/Edit/:userId', {
          templateUrl: 'App/BusinessCenter/users/user-crud/user-crud-w.html',
          controller: 'UserCrudWrapperController',
          title: 'Edit Team Member',
          data: {
            amf: 'soar-biz-bizusr-edit',
          },
          resolve: userCrudWrapperController.resolveUserCrudControl,
        })
        .when('/BusinessCenter/Users/Roles/', {
          templateUrl:
            'App/BusinessCenter/user-roles-by-location/user-roles-by-location-w.html',
          controller: 'UserRolesByLocationWrapperController',
          title: 'Assign Roles',
          data: {
            amf: 'plapi-user-usrrol-read',
          },
        })
        .when('/BusinessCenter/Users/UserIdentifiers/', {
          templateUrl:
            'App/BusinessCenter/identifiers/team-member-identifiers/team-member-identifiers-crud-w.html',
          controller: 'TeamMemberIdentifiersWrapperController',
          title: 'Additional Team Member Identifiers',
          data: {
            amf: 'soar-biz-aitm-view',
          },
        })
        .when('/BusinessCenter/ServiceCode/', {
          template: '<service-code-search-ng></service-code-search-ng>',
          title: 'Service & Swift Codes',
          data: {
            amf: 'soar-biz-bsvccd-view',
          },
        })
        .when('/BusinessCenter/ServiceTypes/', {
          template: '<service-types></service-types>',
          title: 'Service Types',
          data: {
            amf: 'soar-biz-bsvct-view',
          },
        }) // TODO: implement resolve when angular routing is implemented
        .when('/BusinessCenter/FeeLists/', {
          template: '<fee-lists-landing></fee-lists-landing>',
          title: 'Location Fee Lists',
          data: {
            amf: 'soar-biz-feelst-view',
          },
        })

        .when('/BusinessCenter/DrawTypes/', {
          template: '<draw-types-landing></draw-types-landing>',
          title: 'Draw Types',
          data: {
            amf: 'soar-biz-bdrwtp-view',
          },
        })
        .when('/BusinessCenter/NoteTemplates/', {
          templateUrl:
            'App/BusinessCenter/settings/note-templates/note-templates-w.html',
          controller: 'NoteTemplatesWrapperController',
          title: 'Clinical Note Templates',
          data: {
            amf: 'soar-clin-nottmp-view',
          },
        })
        .when('/BusinessCenter/ChartColors/', {
          templateUrl:
            'App/BusinessCenter/settings/chart-custom-colors/chart-custom-colors.html',
          controller: 'ChartCustomColorsController',
          title: 'Chart Colors',
          data: {
            amf: 'soar-biz-chclrs-view',
          },
        })
        // TODO: implement resolve when angular routing is implemented
        .when('/BusinessCenter/Conditions/', {
          template: '<conditions-landing></conditions-landing>',
          title: 'Conditions',
          data: {
            amf: 'soar-biz-bcond-view',
          },
        })
        .when('/BusinessCenter/PreventiveCare/', {
          template: '<preventive-care-setup></preventive-care-setup>',
          title: 'Preventive Care',
          data: {
            amf: 'soar-biz-bprsvc-view',
          },
        })
        .when('/BusinessCenter/InformedConsentMessage/', {
          template: '<informed-consent-setup-ng></informed-consent-setup-ng>',
          title: 'Informed Consent Message',
          data: {
            amf: 'soar-biz-icmsg-view',
          },
        })
        .when('/BusinessCenter/Clinical/v2/MedicalHistoryEdit/', {})
        .when('/BusinessCenter/TreatmentConsentLetter/', {
          template: '<treatment-consent-ng></treatment-consent-ng>',
          title: 'Treatment Consent Letter',
          data: {
            amf: 'soar-biz-tpmsg-view',
          },
        })
        .when('/BusinessCenter/PatientMedicalAlerts/', {
          templateUrl:
            'App/BusinessCenter/settings/patient-medical-alerts/patient-medical-alerts-w.html',
          controller: 'PatientMedicalAlertsWrapperController',
          title: 'Medical History Alerts',
          data: {
            amf: 'soar-biz-medalt-view',
          },
          resolve:
            patientMedicalAlertsWrapperController.resolvePatientMedicalAlerts,
        })
        .when('/BusinessCenter/Roles/:RoleId/:SourceName', {
          templateUrl:
            'App/BusinessCenter/roles/role-landing/role-landing.html',
          controller: 'RoleLandingController',
        })
        .when('/BusinessCenter/PatientProfile/AdditionalIdentifiers', {
          template:'<patient-additional-identifiers></patient-additional-identifiers>',
          title: 'Additional Patient Identifiers',
          data: {
            amf: 'soar-biz-aipat-view',
          },
        })
        .when('/BusinessCenter/PatientProfile/Flags', {
          title: 'Flags',
          template: '<master-alerts-ng></master-alerts-ng>',
          data: {
            amf: 'soar-biz-bmalrt-view',
          },
        })
        .when('/BusinessCenter/PatientProfile/GroupTypes', {
          template: '<group-types-ng></group-types-ng>',
          title: 'Group Types',
          data: {
            amf: 'soar-biz-bizgrp-view',
          },
        })
        .when('/BusinessCenter/PatientProfile/ReferralSources', {
          template:'<referral-sources></referral-sources>',
          title: 'Referral Sources', 
          data: {
            amf: 'soar-biz-brfsrc-view',
          },
        })
          .when('/BusinessCenter/PatientProfile/ReferralType', {
            template: '<referral-type></referral-type>',
              title: 'Referral Affiliates',
            data: {
            }
        })
        .when('/Business/Billing/AdjustmentTypes/', {
          templateUrl:
            'App/BusinessCenter/settings/adjustment-types/adjustment-types-w.html',
          controller: 'AdjustmentTypesWrapperController',
          title: 'Adjustment Types',
          data: {
            amf: 'soar-biz-badjtp-view',
          },
        })
        .when('/Business/Billing/DiscountTypes/', {
          template: '<discount-types-landing></discount-types-landing>',
          title: 'Discount Types',
          data: {
            amf: 'soar-biz-bizdsc-view',
          },
        })        
        .when('/Business/Billing/PaymentTypes/', {
          template: '<payment-type></payment-type>', 
          title: 'Manage Payment Types',
          data: {
            amf: 'soar-biz-bpmttp-view',
          },
        })
        .when('/Business/Billing/DefaultMessages/', {
          template: '<default-messages></default-messages>',
          title: 'Default Messages',
          data: {
            amf: 'soar-biz-bilmsg-view',
          },
        })
        .when('/Business/Billing/BankAccounts/', {
          template:'<bank-accounts></bank-accounts>',          
          title: 'Bank Accounts',
          data: {
            amf: 'soar-biz-badjtp-view', // Need to update to new AMFA
          },
        })
        .when('/BusinessCenter/Insurance', {
          templateUrl: 'App/BusinessCenter/insurance/insurance.html',
          title: 'Claims & Predeterminations',
          data: {
            amf: 'soar-ins-iclaim-view',
            primaryTeam: 'Insurance',
          },
        })
        .when('/BusinessCenter/Insurance/Claim/:claimId/ChangeAnswers/Dental', {
          templateUrl:
            'App/BusinessCenter/insurance/claims/claims-management/change-answers/dental/dental-change-answers.html',
          controller: 'DentalChangeAnswersController',
          title: 'Claims & Predeterminations',
          data: {
            amf: 'soar-ins-iclaim-view',
            primaryTeam: 'Insurance',
          },
        })
        .when(
          '/BusinessCenter/Insurance/Claim/:claimId/ChangeAnswers/Medical',
          {
            templateUrl:
              'App/BusinessCenter/insurance/claims/claims-management/change-answers/medical/medical-change-answers.html',
            title: 'Claims & Predeterminations',
            controller: 'MedicalChangeAnswersController',
            data: {
              amf: 'soar-ins-iclaim-view',
              primaryTeam: 'Insurance',
            },
          }
        )
        .when('/BusinessCenter/Insurance/Plans/Create', {
          templateUrl:
            'App/BusinessCenter/insurance/benefit-plans/dental-benefit-plan-crud/dental-benefit-plan-crud.html',
          title: 'Add a Plan',
          controller: 'BenefitPlanCrudController',
          resolve: {
            serviceCodes: [
              'referenceDataService',
              function (referenceDataService) {
                return referenceDataService
                  .getData(referenceDataService.entityNames.serviceCodes)
                  .then(function (res) {
                    return res;
                  });
              },
            ],
          },
          data: {
            amf: 'soar-ins-ibplan-add',
            primaryTeam: 'Insurance',
          },
        })
        .when('/BusinessCenter/Insurance/Plans/Edit', {
          templateUrl:
            'App/BusinessCenter/insurance/benefit-plans/dental-benefit-plan-crud/dental-benefit-plan-crud.html',
          title: 'Edit Plan',
          controller: 'BenefitPlanCrudController',
          resolve: {
            serviceCodes: [
              'referenceDataService',
              function (referenceDataService) {
                return referenceDataService
                  .getData(referenceDataService.entityNames.serviceCodes)
                  .then(function (res) {
                    return res;
                  });
              },
            ],
          },
          data: {
            amf: 'soar-ins-ibplan-edit',
            primaryTeam: 'Insurance',
          },
        })
        .when('/BusinessCenter/Insurance/Carriers/Create', {
          templateUrl:
            'App/BusinessCenter/insurance/carriers/carrier-crud/carrier-crud.html',
          title: 'Add a Carrier',
          data: {
            amf: 'soar-ins-ibcomp-add',
            primaryTeam: 'Insurance',
          },
        })
        .when('/BusinessCenter/Insurance/Carriers/Edit', {
          templateUrl:
            'App/BusinessCenter/insurance/carriers/carrier-crud/carrier-crud.html',
          title: 'Edit a Carrier',
          data: {
            amf: 'soar-ins-ibcomp-edit',
            primaryTeam: 'Insurance',
          },
        })
        .when('/BusinessCenter/Insurance/v2/Insurance-Carrier/CarrierView/:guid', {
        })
        .when('/BusinessCenter/Insurance/v2/Insurance-Carrier/Carrier/Edit/:guid', {
        })
        .when('/BusinessCenter/Insurance/v2/Insurance-Carrier/Carrier/Create', {
        })
        .when('/BusinessCenter/Insurance/v2/Insurance-Carrier/PayerIdCorrection', {
        })
        .when('/BusinessCenter/Insurance/Carriers/Landing', {
          templateUrl:
            'App/BusinessCenter/insurance/carriers/carrier-landing/carrier-landing.html',
          title: 'View a Carrier',
          data: { 
            amf: '',
            primaryTeam: 'Insurance',
          },
        })
        .when('/BusinessCenter/Insurance/FeeSchedule/Create', {
          templateUrl:
            'App/BusinessCenter/insurance/fee-schedule/fee-schedule-edit/fee-schedule-edit.html',
          controller: 'FeeScheduleEditController',
          title: 'Add a Fee Schedule',
          resolve: {
            serviceCodes: [
              'referenceDataService',
              function (referenceDataService) {
                return referenceDataService
                  .getData(referenceDataService.entityNames.serviceCodes)
                  .then(function (res) {
                    return res;
                  });
              },
            ],
            feeLists: [
              'referenceDataService',
              function (referenceDataService) {
                return referenceDataService
                  .getData(referenceDataService.entityNames.feeLists)
                  .then(function (res) {
                    return res;
                  });
              },
            ],
          },
          data: {
            amf: 'soar-ins-ifsch-add',
            primaryTeam: 'Insurance',
          },
        })
        .when('/BusinessCenter/Insurance/FeeSchedule/Create/:guid/:IsCopy', {
          templateUrl:
            'App/BusinessCenter/insurance/fee-schedule/fee-schedule-edit/fee-schedule-edit.html',
          controller: 'FeeScheduleEditController',
          title: 'Add a Fee Schedule',
          resolve: {
            serviceCodes: [
              'referenceDataService',
              function (referenceDataService) {
                return referenceDataService
                  .getData(referenceDataService.entityNames.serviceCodes)
                  .then(function (res) {
                    return res;
                  });
              },
            ],
            feeLists: [
              'referenceDataService',
              function (referenceDataService) {
                return referenceDataService
                  .getData(referenceDataService.entityNames.feeLists)
                  .then(function (res) {
                    return res;
                  });
              },
            ],
          },
          data: {
            amf: 'soar-ins-ifsch-add',
            primaryTeam: 'Insurance',
          },
        })
        .when('/BusinessCenter/Insurance/FeeSchedule/Edit/:guid', {
          templateUrl:
            'App/BusinessCenter/insurance/fee-schedule/fee-schedule-edit/fee-schedule-edit.html',
          controller: 'FeeScheduleEditController',
          resolve: {
            serviceCodes: [
              'referenceDataService',
              function (referenceDataService) {
                return referenceDataService
                  .getData(referenceDataService.entityNames.serviceCodes)
                  .then(function (res) {
                    return res;
                  });
              },
            ],
            feeLists: [
              'referenceDataService',
              function (referenceDataService) {
                return referenceDataService
                  .getData(referenceDataService.entityNames.feeLists)
                  .then(function (res) {
                    return res;
                  });
              },
            ],
          },
          data: {
            amf: 'soar-ins-ifsch-add',
            primaryTeam: 'Insurance',
          },
        })
        .when(
          '/BusinessCenter/Insurance/FeeSchedule/FeeScheduleDetails/:FeeScheduleId',
          {
            templateUrl:
              'App/BusinessCenter/insurance/fee-schedule/fee-schedule-details/fee-schedule-details.html',
            controller: 'FeeScheduleDetailsController',
            title: 'Fee Schedule Details',
            data: {
              amf: 'soar-ins-ifsch-view',
              primaryTeam: 'Insurance',
            },
          }
        )
        .when('/BusinessCenter/Insurance/ERA/:EraId', {
          template: '<app-era-view></app-era-view>',
        })
        .when('/BusinessCenter/Insurance/ERA/:EraId/Claim/:ClaimCommonId', {
          template: '<app-era-view></app-era-view>',
        })
        .when(
          '/BusinessCenter/Insurance/payerreport/:practiceId/:platformPayerReportId',
          {
            templateUrl:
              'App/BusinessCenter/insurance/payer-report/view-payer-report/view-payer-report.html',
            controller: 'ViewPayerReportController',
            data: {
              amf: 'soar-ins-iclaim-view',
              primaryTeam: 'Insurance',
            },
          }
        )
        .when('/BusinessCenter/Insurance/BulkPayment/:EraId', {
          templateUrl:
            'App/BusinessCenter/insurance/bulk-payment/bulk-payment-w.html',
          controller: 'BulkPaymentWrapperController',
          title: 'Apply Bulk Insurance Payment',
          data: {
            amf: 'soar-acct-aipmt-add',
            primaryTeam: 'Insurance',
          },
        })
        .when('/BusinessCenter/FormsDocuments', {
          templateUrl:
            'App/BusinessCenter/forms-documents/forms-documents.html',
          controller: 'FormsDocumentsController',
          title: 'Forms & Documents',
          data: {
            amf: 'soar-doc-docimp-view',
          },
        })
        .when('/BusinessCenter/FormsDocuments/Patients', {
          templateUrl:
            'App/BusinessCenter/forms-documents/forms-documents.html',
          controller: 'FormsDocumentsController',
          title: 'Forms & Documents',
          data: {
            amf: 'soar-doc-docimp-view',
          },
        })
        .when('/BusinessCenter/FormsDocuments/TemplatePreview/', {
          templateUrl:
            'App/BusinessCenter/forms-documents/template-preview/template-preview.html',
          controller: 'TemplatePreviewController',
          title: 'Postcard Preview',
          data: {
            amf: 'soar-doc-docimp-view',
          },
        })
        .when('/BusinessCenter/FormsDocuments/FormsTemplates', {
          templateUrl:
            'App/BusinessCenter/forms-documents/forms-templates/forms-templates.html',
          controller: 'FormsTemplatesController',
          title: 'Templates & Forms',
          data: {
            amf: 'soar-doc-docimp-view',
          },
        })
        .when('/BusinessCenter/Reports', {
          templateUrl: 'App/BusinessCenter/reports/reports-landing.html',
          controller: 'ReportsLandingController',
          title: 'Reports',
          data: {
            amf: 'soar-report-report-view',
          },
        })
        .when('/BusinessCenter/Reports/:ReportName', {
          templateUrl: 'App/BusinessCenter/reports/report-page.html',
          controller: 'ReportPageController',
          data: {
            amf: 'soar-report-report-view',
          },
          resolve: {
            InitialData: [
              'PatientRefferalInitialData',
              function (patientRefferalInitialData) {
                return patientRefferalInitialData();
              },
            ],
          },
        })
        .when('/BusinessCenter/Reports/Custom/:Id', {
          template: '<custom-report></custom-report',
          data: {
            amf: 'soar-report-custom-read',
          },
        })
        .when('/BusinessCenter/PracticeSettings/Identifiers/', {
          template: '<locations-identifiers-ng></locations-identifiers-ng>',
          title: 'Additional Identifiers',
          data: {
            amf: 'soar-biz-ailoc-view',
          },
        })
        .when('/BusinessCenter/PracticeSettings/PracticeInformation/', {
          template: '<practice-information-ng></practice-information-ng>',
          title: 'Practice Information',
          data: {
            amf: 'soar-biz-bizloc-view',
          },
        })
        .when('/BusinessCenter/PracticeSettings/', {
          templateUrl: 'App/BusinessCenter/businessCenter.html',
          controller: 'BusinessCenterController',
          title: 'Practice Settings',
          data: {
            amf: 'soar-biz-biz-view',
          },
          reloadOnSearch: false,
        })
        .when('/BusinessCenter/:Category?/:SubCategory?/:Action?', {
          templateUrl: 'App/BusinessCenter/businessCenter.html',
          controller: 'BusinessCenterController',
          data: {
            amf: 'soar-biz-biz-view',
          },
          reloadOnSearch: false,
        })
        .when(
          '/BusinessCenter/Receivables/Deposits/:locationId/ViewDeposit/:depositId',
          {
            title: 'Single Deposit View',
            templateUrl:
              'App/BusinessCenter/receivables/deposits/deposit-view/deposit-view.html',
            controller: 'DepositViewController',
            data: {},
          }
        )
        .when('/BusinessCenter/MassUpdate', {
          template: '<mass-update></mass-update>',
          data: {},
        })
        .when('/BusinessCenter/MassUpdateResults', {
          template: '<mass-update-results></mass-update-results>',
          data: {},
        })
        .when('/BusinessCenter/AppointmentsTransfer', {
          template:
            '<mass-update-appointments-transfer></mass-update-appointments-transfer>',
          data: {},
        })
        .when('/UnauthorizedAccess', {
          templateUrl: 'App/Dashboard/inactive/inactive.html',
          controller: 'InactiveController',
        })
        .when('/PracticeOnCreditHold', {
            templateUrl: 'App/Dashboard/credithold/credithold.html',
            controller: 'creditHoldController',
        })
        /** keep at bottom */
        // Catch all redirects home
        .otherwise({
          redirectTo: '/',
        });
    },
  ]);
