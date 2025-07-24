/* globals PatientAccountSelectClaimsControl, PatientAccountInsurancePaymentControl, PatientAccountInsurancePaymentRefactorControl, PatientCrudControl, PatientDashboardControl, ChooseStatementControl, PreviewStatementControl, PatientAccountTransferController, patientDashboardWrapperController , patientAccountInsuranceWrapperController*/

'use strict';

angular
  .module('Soar.Patient', [
    'ngRoute',
    'ui.bootstrap',
    'ngAnimate',
    'ngResource',
    'ngSanitize',
    'common.directives',
    'ui.utils',
    'common.controllers',
    'common.factories',
    'common.filters',
    'common.services',
    'localytics.directives',
    'PatWebCore',
    'kendo.directives',
    'infinite-scroll',
  ])
  .config([
    '$routeProvider',
    function ($routeProvider) {
      // Configure ng-view routing
      $routeProvider
        // Default Patient Path
        .when('/Patient/', {
          templateUrl: 'App/Patient/patient-landing/patient-landing-w.html',
          controller: 'PatientLandingWrapperController',
          title: 'Pt Mgmt - All Pts',
          data: {
            moduleName: 'Patient',
            amf: 'soar-per-perptm-view',
          },
        })
        .when('/Patient#/AllPatients', {
          templateUrl: 'App/Patient/patient-landing/patient-landing-w.html',
          controller: 'PatientLandingWrapperController',
          title: 'Pt Mgmt - All Pts',
          data: {
            moduleName: 'Patient',
            amf: 'soar-per-perptm-view',
          },
        })
        .when('/Patient#/PreventiveCare', {
          templateUrl: 'App/Patient/patient-landing/patient-landing-w.html',
          controller: 'PatientLandingWrapperController',
          title: 'Pt Mgmt - All Pts',
          data: {
            moduleName: 'Patient',
            amf: 'soar-per-perptm-view',
          },
        })
        .when('/Patient#/TreatmentPlans', {
          templateUrl: 'App/Patient/patient-landing/patient-landing-w.html',
          controller: 'PatientLandingWrapperController',
          title: 'Pt Mgmt - All Pts',
          data: {
            moduleName: 'Patient',
            amf: 'soar-per-perptm-view',
          },
        })
        .when('/Patient#/Appointments', {
          templateUrl: 'App/Patient/patient-landing/patient-landing-w.html',
          controller: 'PatientLandingWrapperController',
          title: 'Pt Mgmt - All Pts',
          data: {
            moduleName: 'Patient',
            amf: 'soar-per-perptm-view',
          },
        })
        .when('/Patient#/OtherToDo', {
          templateUrl: 'App/Patient/patient-landing/patient-landing-w.html',
          controller: 'PatientLandingWrapperController',
          title: 'Pt Mgmt - All Pts',
          data: {
            moduleName: 'Patient',
            amf: 'soar-per-perptm-view',
          },
        })
        // Search Patient Path (Not currently used but may be necessary when search is refactored)
        .when('/Patient/Search/:searchString', {
          templateUrl: 'App/Patient/patient-search/patient-search.html',
          controller: 'PatientSearchController',
          data: {
            moduleName: 'Patient',
            amf: 'soar-per-perdem-search',
          },
        })
        // Patient Insurance Select Claims
        .when(
          '/Patient/:patientId/Account/:accountId/SelectClaims/:PrevLocation',
          {
            templateUrl:
              'App/Patient/patient-account/patient-account-select-claims/patient-account-select-claims.html',
            controller: 'PatientAccountSelectClaimsController',
            resolve:
              PatientAccountSelectClaimsControl.resolvePatientAccountSelectClaimsControl,
            data: {
              moduleName: 'Patient',
              amf: 'soar-acct-aipmt-view',
              primaryTeam: 'Insurance',
            },
          }
        )
        .when('/Patient/:patientId/Person/', {
          template: '<registration-landing></registration-landing>',
        })
        .when('/Patient/:patientId/PersonTab/', {
          template:
            '<patient-family-registration></patient-family-registration>',
        })
        // Patient Insurance Payment

        .when(
          '/Patient/:patientId/Account/:accountId/Payment/:PrevLocation/:claimId?',
          {
            templateUrl:
            'App/Patient/patient-account/patient-account-insurance-payment/patient-account-insurance-payment-w.html',
          controller: 'PatientAccountInsuranceWrapperController',
          data: {
            moduleName: 'Patient',
            amf: 'soar-acct-aipmt-view',
            primaryTeam: 'Insurance',
          },
          resolve:patientAccountInsuranceWrapperController.resolvePatientAccountInsuranceWrapperController
          }
        )
  
        // Patient Insurance Payment
        .when(
          '/Patient/:patientId/Account/:accountId/Payment/:PrevLocation/BulkCreditTransaction/:bulkCreditTransactionId',
          {
            templateUrl:
            'App/Patient/patient-account/patient-account-insurance-payment/patient-account-insurance-payment-w.html',
          controller: 'PatientAccountInsuranceWrapperController',
          data: {
            moduleName: 'Patient',
            amf: 'soar-acct-aipmt-view',
            primaryTeam: 'Insurance',
          },
          resolve:patientAccountInsuranceWrapperController.resolvePatientAccountInsuranceWrapperController
          }  
        )
        // Delete patient Insurance Payment
        .when(
          '/Patient/:patientId/Account/:accountId/DeleteInsurancePayment/:insurancePaymentId/:PrevLocation',
          {
            templateUrl:
              'App/Patient/components/delete-insurance-payment/delete-insurance-payment-claim.html',
            controller: 'DeleteInsurancePaymentController',
            data: {
              moduleName: 'Patient',
              //TODO: need to add proper amfa, currently added amfa is just for testing purpose
              amf: 'soar-acct-aipmt-view',
              primaryTeam: 'Insurance',
            },
          }
        )
        .when('/Patient/:invoiceId/Account/PrintInvoice/', {
          title: 'Print Invoice',
          templateUrl:
            'App/Patient/patient-account/patient-print-invoice/patient-print-invoice.html',
          controller: 'PatientPrintInvoiceController',
          data: {
            moduleName: 'Patient',
            amf: 'soar-acct-aipmt-view',
          },
        })
        .when('/Patient/:creditTransactionId/Account/PrintReceipt/', {
          title: 'Print Receipt',
          templateUrl:
            'App/Patient/patient-account/patient-print-receipt/patient-print-receipt.html',
          controller: 'PatientPrintReceiptController',
          data: {
            moduleName: 'Patient',
            amf: 'soar-acct-aipmt-view',
          },
        })
        .when('/Patient/:patientId/Clinical/MedicalHistoryForm/:formType', {
          title: 'Print Medical History Form',
          templateUrl:
            'App/Patient/patient-chart/health/medical-history/medical-history-print/medical-history-print.html',
          controller: 'MedicalHistoryPrintController',
          data: {
            moduleName: 'Patient',
            amf: 'soar-per-perhst-view',
          },
        })
        .when('/Patient/:patientId/Clinical/PrintPerioExam/:examId', {
          title: 'Print Perio Exam',
          templateUrl:
            'App/Patient/patient-chart/perio/perio-chart-print/perio-chart-print.html',
          controller: 'PerioChartPrintController',
          data: {
            moduleName: 'Patient',
            amf: 'soar-clin-cperio-view',
          },
        })
        .when('/Patient/:patientId/Clinical/PrintNotes/:storageId', {
          title: 'Print Clinical Notes',
          templateUrl:
            'App/Patient/patient-chart/patient-notes/patient-notes-print/patient-notes-print.html',
          controller: 'PatientNotesPrintController',
          data: {
            moduleName: 'Patient',
            amf: 'soar-clin-cnotes-view',
          },
        })
        .when('/Patient/:patientId/Clinical/ComparePerioExams', {
          title: 'Compare Perio Exams',
          templateUrl:
            'App/Patient/patient-chart/perio/perio-compare/perio-compare.html',
          controller: 'PerioCompareController',
          data: {
            moduleName: 'Patient',
            amf: 'soar-clin-cperio-view',
          },
        })
        .when('/Patient/:patientId/Clinical/ComparePerioExams/Print', {
          title: 'Print Perio Exam Comparison',
          templateUrl:
            'App/Patient/patient-chart/perio/perio-compare-print/perio-compare-print.html',
          controller: 'PerioComparePrintController',
          data: {
            moduleName: 'Patient',
            amf: 'soar-clin-cperio-view',
          },
        })
        .when('/Patient/:patientId/Clinical/MedicalHistoryForm/:formType', {
          title: 'Print Medical History Form',
          templateUrl:
            'App/Patient/patient-chart/health/medical-history/medical-history-print/medical-history-print.html',
          controller: 'MedicalHistoryPrintController',
          data: {
            moduleName: 'Patient',
            amf: 'soar-per-perhst-view',
          },
        })
        .when(
          '/Patient/:patientId/PrintTreatmentPlan/:signatureFileAllocationId',
          {
            title: 'Treatment Plan',
            templateUrl:
              'App/Patient/patient-chart/treatment-plans/treatment-plan-print/treatment-plan-print.html',
            controller: 'TreatmentPlanPrintController',
            data: {
              moduleName: 'Patient',
              amf: 'soar-clin-cplan-view',
            },
          }
        )
        .when(
          '/Patient/:patientId/InformedConsentAgreement/:fileAllocationId',
          {
            title: 'Informed Consent Agreement',
            templateUrl:
              'App/Patient/patient-chart/treatment-plans/informed-consent-agreement/informed-consent-agreement.html',
            controller: 'InformedConsentAgreementController',
            data: {
              moduleName: 'Patient',
              amf: 'soar-clin-cplan-icview',
            },
          }
        )
        .when('/Patient/:patientId/Imaging/FullScreen', {
          title: 'Imaging',
          templateUrl:
            'App/Patient/patient-chart/imaging/imaging-fullscreen/imaging-fullscreen.html',
          controller: 'ImagingFullscreenController',
          data: {
            moduleName: 'Patient',
            amf: 'soar-clin-cimgs-view',
          },
        })
        .when('/Patient/Account/:accountId/PrintTransactionHistory', {
          templateUrl:
            'App/Patient/patient-account/patient-transaction-history-print/patient-transaction-history-print-w.html',
          controller: 'TransactionHistoryPrintController',
          title: 'Print Transaction History',
          data: {
            amf: 'soar-acct-trxhis-view',
          },
        })
        .when('/Patient/:patientId/PrintCommunications/', {
          title: 'Print Communications',
          templateUrl:
            'App/Patient/communication-center/print-communications.html',
        })                  
        //Jump in front of the angularJs Clinical route for the clinical MFE
        .when('/Patient/:patientId/Clinical/v2/:submodule?', {})          
        .when('/Patient/:patientId/Clinical/v2/:submodule*\/?', {})                             

        .when('/Patient/:patientId/:Category/:panel?', {
          templateUrl: 'App/Patient/patient-profile/patient-overview/patient-dashboard-w.html',
          controller: 'PatientDashboardWrapperController',
          resolve: patientDashboardWrapperController.resolvePatientDashboardControl,
          title: function (resolve) {
            return resolve.person.Value.Profile.PatientCode + ' - ' + resolve.title;
          },           
          data: { 
            moduleName: 'Patient',
            primaryTeam: 'Insurance',
            amfaOverride: {
              routeParamName: 'Category',
              values: {
                Overview: { amfa: 'soar-per-perdem-view' },
                Appointments: { amfa: 'soar-sch-sptapt-view' },
                Clinical: {
                  routeParamName: 'tab',
                  values: {
                    default: { amfa: 'soar-clin-cpsvc-view' },
                    0: { amfa: 'soar-clin-cmed-view' },
                    1: { amfa: 'soar-clin-cpsvc-view' },
                    2: { amfa: 'soar-clin-cpsvc-view' },
                    3: { amfa: 'soar-clin-cperio-view' },
                    4: { amfa: 'soar-clin-cimgs-view' },
                    5: { amfa: 'soar-clin-clinrx-view' },
                    6: { amfa: 'soar-clin-ceduc-view' },
                  },
                },
                Summary: {
                  routeParamName: 'tab',
                  values: {
                    default: { amfa: 'soar-acct-actsrv-view' },
                    'Account Summary': { amfa: 'soar-acct-actsrv-view' },
                    'Insurance Information': { amfa: 'soar-acct-insinf-view' },
                    'Transaction History': { amfa: 'soar-acct-trxhis-view' },
                    Profile: { amfa: 'soar-per-perdem-view' },
                    Contract: {},
                  },
                },
                Communication: { amfa: 'soar-per-pcomm-view' },
              },
            },
          },
        })
        // Create Patient Path
        .when('/Patient/Create/', {
          templateUrl: 'App/Patient/patient-crud/patient-crud.html',
          controller: 'PatientCrudController',
          title: 'Create New Patient',
          resolve: PatientCrudControl.resolvePatientCrudControl,
          data: {
            moduleName: 'Patient',
            amf: 'soar-per-perdem-add',
          },
        })
        .when('/Patient/Register/', {
          template: '<registration-landing></registration-landing>',
        })
        .when('/Patient/FamilyRegister/', {
          template:
            '<patient-family-registration></patient-family-registration>',
        })

        .when(
          '/Patient/:patientId/Account/:accountId/EncountersCart/:PrevLocation',
          {
            templateUrl:
              'App/Patient/patient-account/patient-encounter/cart/encounter-cart.html',
            controller: 'PatientEncounterCartController',
            data: {
              moduleName: 'Patient',
              primaryTeam: 'Insurance',
              amf: 'soar-acct-enctr-edit',
              disableLocationHeader: true,
            },
          }
        )

        .when(
          '/Patient/:patientId/Account/:accountId/Encounter/:encounterId/EncountersCart/:PrevLocation',
          {
            templateUrl:
              'App/Patient/patient-account/patient-encounter/cart/encounter-cart.html',
            controller: 'PatientEncounterCartController',
            data: {
              moduleName: 'Patient',
              primaryTeam: 'Insurance',
              amf: 'soar-acct-enctr-edit',
              disableLocationHeader: true,
            },
          }
        )

        .when(
          '/Patient/:patientId/Account/:accountId/Encounter/:encounterId/Checkout/:PrevLocation',
          {
            templateUrl:
              'App/Patient/patient-account/patient-encounter/checkout/checkout.html',
            controller: 'CheckoutController',
            data: {
              moduleName: 'Patient',
              primaryTeam: 'Insurance',
              amf: 'soar-acct-enctr-edit',
              disableLocationHeader: true,
            },
          }
        )

        .when('/Patient/:patientId/Account/:accountId/Checkout/:PrevLocation', {
          templateUrl:
            'App/Patient/patient-account/patient-encounter/checkout/checkout.html',
          controller: 'CheckoutController',
          data: {
            moduleName: 'Patient',
            primaryTeam: 'Insurance',
            amf: 'soar-acct-enctr-edit',
            disableLocationHeader: true,
          },
        })
        .when(
          '/Patient/:patientId/Account/:accounId/TransferAccount/:PrevLocation',
          {
            templateUrl:
              'App/Patient/patient-account/patient-account-transfer/patient-account-transfer.html',
            controller: 'PatientAccountTransferController',
            title: 'Transfer Account',
            resolve:
              PatientAccountTransferController.resolvePatientAccountTransferControl,
            data: {
              moduleName: 'Patient',
              amf: 'soar-acct-astmt-view',
            },
          }
        )
        .when('/Patient/HIPAAForm/', {
          templateUrl:
            'App/Patient/patient-profile/patient-overview/hipaa-authorization/hipaa-authorization.html',
          controller: 'HipaaAuthorizationController',
          data: {
            amf: 'soar-biz-bizloc-edit',
          },
        })
        .when('/Patient/PatientRegistrationForm/', {
          title: 'Print Patient Registration',
          templateUrl:
            'App/Patient/components/patient-form/patient-registration-form.html',
          controller: 'PatientRegistrationFormController',
          data: {
            moduleName: 'Patient',
          },
        })
        .when('/Patient/PatientInsuranceForm/', {
          title: 'Print Patient Insurance',
          templateUrl:
            'App/Patient/components/patient-form/patient-insurance-form/patient-insurance-form.html',
          controller: 'PatientInsuranceFormController',
          data: {
            moduleName: 'Patient',
            primaryTeam: 'Insurance',
          },
        })

        // Catch all redirects home
        .otherwise({
          redirectTo: '/',
        });
    },
  ]);
