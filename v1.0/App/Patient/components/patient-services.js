'use strict';

// parts are renamed to stages
// Define Services
angular
  .module('Soar.Patient')
  .service('PersonServices', [
    '$resource',
    'PatCacheFactory',
    function ($resource, cacheFactory) {
      var patCache = cacheFactory.GetCache(
        'PersonServices',
        'aggressive',
        30000,
        30000
      );
      return {
        Persons: $resource(
          '_soarapi_/persons/:Id/',
          {},
          {
            save: { method: 'POST', cache: patCache },
            update: { method: 'PUT', cache: patCache },
            get: { method: 'GET' },
            setActiveStatus: {
              method: 'PUT',
              cache: patCache,
              params: { unscheduleOnly: '@unscheduleOnly' },
              url: '_soarapi_/persons/:Id/isActive',
            }, // unscheduleOnly=true, default false
            getIsPatientPropertyMutability: {
              method: 'GET',
              cache: patCache,
              url: '_soarapi_/persons/:Id/isPatient/mutability',
            },
            delete: { method: 'POST', cache: patCache },
          }
        ),
      };
    },
  ])

  .service('PatientServices', [
    '$resource',
    '$http',
    '$q',
    'PatCacheFactory',
    function ($resource, $http, $q, cacheFactory) {
      // Used for patients only
      var patCache = cacheFactory.GetCache(
        'PatientServices',
        'aggressive',
        15000,
        15000
      );
      var patBenefitPlanCache = cacheFactory.GetCache(
        'PatientBenefitPlans',
        'aggressive',
        60000,
        60000
      );
      var patAccountCache = cacheFactory.GetCache(
        'PatientAccount',
        'aggressive',
        60000,
        60000
      );
      var accMembersCache = cacheFactory.GetCache(
        'AccountMembers',
        'aggressive',
        2000,
        2000
      );
      var patTreatmentPlanCache = cacheFactory.GetCache(
        'PatientTreatmentPlans',
        'aggressive',
        60000,
        60000
      );
      var patientOverviewCache = cacheFactory.GetCache(
        'patientOverviewCache',
        'aggressive',
        15000,
        15000
      );
      var claimInformation;
      var chartExistingModeOn = false;

      var setClaimInformation = function (patId) {
        claimInformation = patId;
      };

      var getClaimInformation = function () {
        return claimInformation;
      };

      var standardService = function (
        name,
        idParams,
        url,
        canUpdate,
        canDelete,
        validationFunction
      ) {
        var methodParams = {};

        if (angular.isArray(idParams)) {
          for (var i = 0; i < idParams.length; i++) {
            methodParams[idParams[i]] = '@' + idParams[i];
          }
        } else {
          methodParams[idParams] = '@' + idParams;
        }

        var operations = {
          Retrieve: { method: 'GET', params: methodParams },
        };

        if (canUpdate) {
          operations.Create = { method: 'POST' };
          operations.Update = { method: 'PUT' };
        } else {
          operations.Save = { method: 'POST' };
        }

        if (canDelete) {
          operations.Delete = { method: 'DELETE', params: methodParams };
        }

        return {
          ObjectName: name,
          IdField: angular.isArray(idParams) ? idParams[0] : idParams,
          IsValid: validationFunction,
          Operations: $resource(url, {}, operations),
        };
      };

      return {
        ChartExistingModeOn: chartExistingModeOn,
        SetClaimInformation: setClaimInformation,
        GetClaimInformation: getClaimInformation,
        CheckoutInfo: $resource(
          '_insurancesapi_/accounts/:accountId/checkoutInfo',
          {},
          {
            getCheckoutInfo: {
              method: 'GET',
              url: '_insurancesapi_/accounts/:accountId/checkoutInfo?pendingEncounterId=:encounterId',
              params: { accountId: '@accountId', encounterId: '@encounterId' },
            },
          }
        ),
        AccountSummary: $resource(
          '_insurancesapi_/accounts/AccountSummary',
          {},
          {
            getAccountSummary: {
              method: 'POST',
              url: '_insurancesapi_/accounts/AccountSummary',
            },
            getTransactionHistory: {
              method: 'POST',
              url: '_insurancesapi_/TransactionHistory/:accountId',
              params: { accountId: '@accountId' },
            },
            getTransactionHistoryDebitDeleteInfo: {
              method: 'GET',
              params: { debitTransactionId: '@debitTransactionId' },
              url: '_insurancesapi_/transactionHistoryDebitDeleteInfo?debitTransactionId=:debitTransactionId',
            },
            getAccountSummaryRowDetail: {
              method: 'GET',
              url: '_insurancesapi_/AccountSummary/RowDetail/:id/:type',
              params: { id: '@id', type: '@type', accountId: '@accountId' },
            },
            getAccountSummaryMain: {
              method: 'POST',
              url: '_insurancesapi_/AccountSummary/Main/:accountId',
              params: { accountId: '@accountId' },
            },
            getAccountSummaryPending: {
              method: 'POST',
              url: '_insurancesapi_/AccountSummary/Pending/:accountId',
              params: { accountId: '@accountId' },
            },
          }
        ),
        Account: $resource(
          '_insurancesapi_/accounts/person/:personId',
          {},
          {
            getByPersonId: {
              method: 'GET',
              params: { personId: '@personId' },
              cache: patAccountCache,
            },
            getAllAccountMembersByAccountId: {
              method: 'GET',
              cache: patAccountCache,
              params: { accountId: '@accountId' },
              url: '_insurancesapi_/accounts/accountMembers/:accountId',
            },
            getAccountMembersDetailByAccountId: {
              method: 'GET',
              cache: accMembersCache,
              params: { accountId: '@accountId' },
              url: '_insurancesapi_/accountmembers/allaccountmembers/:accountId',
            },
            getServiceTransactionsByPersonId: {
              method: 'GET',
              cache: patAccountCache,
              params: { personId: '@personId' },
              url: '_insurancesapi_/persons/:personId/servicetransactions',
            },
            getAccountMembersWithDuplicates: {
              method: 'GET',
              params: { accountId: '@accountId' },
              url: '_insurancesapi_/accounts/accountMembersWithDuplicates/:accountId',
            },

            // TODO overview add to its own cache?
            overview: {
              method: 'GET',
              url: '_insurancesapi_/accounts/:accountId/overview',
              params: { accountId: '@accountId' },
            },
            getAccountMemberByAccountMemberId: {
              method: 'GET',
              cache: patAccountCache,
              params: { accountMemberId: '@accountMemberId' },
              url: '_insurancesapi_/accounts/accountMemberPatientDetail/:accountMemberId',
            },
            updateAccountInCollections: {
              method: 'PUT',
              params: {
                personAccountId: '@personAccountId',
                inCollection: '@inCollection',
              },
              url: ' _insurancesapi_/accounts/collection/:personAccountId/:inCollection',
            },
          }
        ),
        AccountNote: $resource(
          '_insurancesapi_/person/accountNote',
          {},
          {
            getByAccountNoteId: {
              method: 'GET',
              url: '_insurancesapi_/person/accountNote/:personAccountNoteId',
              params: { personAccountNoteId: '@personAccountNoteId' },
            },
            create: {
              method: 'POST',
              url: '_insurancesapi_/person/accountNote',
            },
            update: {
              method: 'PUT',
              url: '_insurancesapi_/person/accountNote',
            },
            deleteAccountNote: {
              method: 'DELETE',
              params: { personAccountNoteId: '@personAccountNoteId' },
              url: '_insurancesapi_/person/accountNote/:personAccountNoteId',
            },
            saveByList: {
              method: 'POST',
              url: '_insurancesapi_/person/accountNote/accountNoteList',
            },
            getEraClaimByAccountNoteId: {
              method: 'GET',
              url: '_insurancesapi_/person/accountNote/EraClaim/:personAccountNoteId',
              params: { personAccountNoteId: '@personAccountNoteId' },
            },
          }
        ),
        Alerts: $resource(
          '_soarapi_/patients/:Id/alerts/:PatientAlertId',
          {},
          {
            create: { method: 'POST', params: { Id: '@Id' } },
            update: { method: 'PUT', params: { Id: '@Id' } },
            delete: {
              method: 'DELETE',
              params: { Id: '@Id', PatientAlertId: '@PatientAlertId' },
            },
          }
        ),
        PatientAlerts: $resource('_soarapi_/patients/alerts', {}, {}),
        ChartLedger: $resource('_soarapi_/patients/:Id/chartledger', {}, {}),
        Claim: $resource(
          '_insurancesapi_/insurance/claims',
          {},
          {
            Create: { method: 'POST', url: '_insurancesapi_/insurance/claims' },
            createMultipleClaims: {
              method: 'POST',
              url: '_insurancesapi_/insurance/claims/createMultipleClaims',
            },
            getByPatient: {
              method: 'GET',
              url: '_insurancesapi_/insurance/claims/getByPatient',
              params: { patientId: '@patientId' },
            },
            getServiceTransactionIdsByPatient: {
              method: 'GET',
              url: '_insurancesapi_/insurance/claims/getServiceTransactionIdsByPatient',
              params: { patientId: '@patientId' },
            },
            getServiceTransactionToClaimDtosByPatient: {
              method: 'GET',
              url: '_insurancesapi_/insurance/claims/getServiceTransactionToClaimDtosByPatient',
              params: {
                patientId: '@patientId',
                claimStatus: '@claimStatus',
                isActual: '@isActual',
              },
            },
            getClaimsByServiceTransactionId: {
              method: 'GET',
              url: '_insurancesapi_/insurance/claims/getServiceTransactionsByServiceTransaction/:serviceTransactionId',
              params: { serviceTransactionId: '@serviceTransactionId' },
            },
            getServiceTransactionsByClaimId: {
              method: 'GET',
              url: '_insurancesapi_/insurance/claims/getServiceTransactionsByClaimId/:claimId',
              params: { claimId: '@claimId' },
            },
            getEstimatedInsuranceForClaimsGroupedByStatusCodes: {
              method: 'POST',
              url: '_insurancesapi_/insurance/claims/GetEstimatedInsuranceForClaimsGoupedByStatusCodes',
            },
            getClaimsByAccount: {
              method: 'GET',
              url: '_insurancesapi_/insurance/claims/getClaimsByAccount',
              params: { accountId: '@accountId' },
            }, // get claims for provided accountId with all service transactions with in claims
            getClaimsByAccountAndCreditTransaction: {
              method: 'GET',
              url: '_insurancesapi_/insurance/claims/getClaimsByAccountAndCreditTransaction',
              params: {
                accountId: '@accountId',
                creditTransactionId: '@creditTransactionId',
              },
            }, // get claims for provided accountId with all service transactions with in claims
            getEstimatedInsuranceForClaim: {
              method: 'GET',
              url: '_insurancesapi_/insurance/claims/GetEstimatedInsuranceForClaim/?claimId=:claimId',
              params: { claimId: '@claimId' },
            },
            recreateClaim: {
              method: 'POST',
              url: '_insurancesapi_/insurance/claims/recreate?claimId=:claimId',
              params: { claimId: '@claimId' },
            },
            recreateMultipleClaims: {
              method: 'POST',
              url: '_insurancesapi_/insurance/claims/recreateMultipleClaims',
            },
            getClaimsByInsuarncePaymentId: {
              method: 'GET',
              url: '_insurancesapi_/insurance/claims/getClaimsByInsurancePaymentId',
              params: {
                accountId: '@accountId',
                insurancePaymentId: '@insurancePaymentId',
              },
            },
            GetClaimsByBulkCreditTransactionId: {
              method: 'GET',
              url: '_insurancesapi_/insurance/claims/bulkCreditTransaction',
              params: { bulkCreditTransactionId: '@bulkCreditTransactionId' },
            },
            markInsurancePaymentAsDeleted: {
              method: 'PUT',
              params: { accountId: '@accountId' },
              url: '_insurancesapi_/accounts/:accountId/deleteinsurancepayment',
            },
            CreateClaimFromServiceTransactions: {
              method: 'POST',
              url: '_insurancesapi_/insurance/claims/:patientBenefitPlanId/',
              params: {
                patientBenefitPlanId: '@patientBenefitPlanId',
                calculateEstimatatedInsurance: '@calculateEstimatatedInsurance',
              },
            },
            AttachFilesToClaim: {
              method: 'POST',
              url: '_insurancesapi_/insurance/claims/attachment/:claimId',
              params: { claimId: '@claimId' },
              },
            GetFilesAttachedToClaim: {
              method: 'GET',
              url: '_insurancesapi_/insurance/claims/attachment/:claimId',
              params: { claimId: '@claimId' },
            },
            GetAttachedFileForClaim: {
              method: 'GET',
              url: '_claimapiurl_/api/v1/locations/:locationId/claim-attachment/forClaim/:claimCommonId/:attachmentFileId',
              params: {
                locationId: '@locationId',
                claimCommonId: '@claimCommonId',
                attachmentFileId: '@attachmentFileId',
              },
            },
            CheckPayerAcceptsAttachments: {
              method: 'GET',
              url: '_claimapiurl_/api/v2/locations/:locationId/claim-attachment/checkpayer/:claimId',
              params: { locationId: '@locationId', claimId: '@claimId' },
            },
            GetAttachmentPayerReferenceNumber: {
              method: 'GET',
              url: '_insurancesapi_/insurance/claims/payerReferenceNumber/:claimId',
              params: { claimId: '@claimId' },
            },
            GetSubmittedClaimsByCarrierAndLocation: {
              method: 'POST',
              url: '_insurancesapi_/insurance/claims/getSubmittedClaimsByCarrierId/:carrierId',
              params: { carrierId: '@carrierId' },
            },
            GetSubmittedClaimsByPayerAndLocation: {
              method: 'POST',
              url: '_insurancesapi_/insurance/claims/getSubmittedClaimsByPayerId/:payerId',
              params: { payerId: '@payerId' },
            },
            GetEraByEraId: {
              method: 'GET',
              url: '_insurancesapi_/insurance/eras/:eraId/claimPayment',
              params: { eraId: '@eraId' },
            },
            getClaimEntitiesByAccountId: {
              method: 'GET',
              url: '_insurancesapi_/insurance/claims/claimEntity/account/{accountId}',
              params: { accountId: '@accountId' },
            },
            getClaimsByServiceTransaction: {
              method: 'GET',
              url: '_insurancesapi_/insurance/claims/getClaimsByServiceTransaction/:serviceTransactionId',
              params: { serviceTransactionId: '@serviceTransactionId' },
            },
            getServiceTransactionForClaim: {
              method: 'GET',
              url: '_insurancesapi_/insurance/claim/getServiceTransactionForClaim/:claimId/:type',
              params: { claimId: '@claimId', type: '@type' },
            },
          }
        ),
        ClaimNotes: $resource(
          '_insurancesapi_/insurance/claimNote',
          {},
          {
            create: { method: 'POST' },
            update: { method: 'PUT' },
            getAllClaimNote: { method: 'GET' },
            GetClaimNotesByClaimId: {
              method: 'GET',
              url: '_insurancesapi_/insurance/claimNote/:claimId',
              params: { claimId: '@claimId' },
            },
            getByPatientId: {
              method: 'GET',
              url: '_insurancesapi_/insurance/claimNote/GetByPatientId/:patientId',
              params: { patientId: '@patientId' },
            },
            delete: {
              method: 'POST',
              url: '_insurancesapi_/insurance/claimNote/delete',
            },
          }
        ),
        ClaimChangeStatus: $resource(
          '_insurancesapi_/insurance/claims',
          {},
          {
            update: {
              method: 'PUT',
              url: '_insurancesapi_/insurance/claims/:claimId/changeStatus?claimStatus=:claimStatus',
              params: { claimId: '@claimId', claimStatus: '@claimStatus' },
            },
          }
        ),
        ClaimsAndPredeterminations: $resource(
          '_insurancesapi_/insurance/claims',
          {},
          {
            submit: {
              method: 'PUT',
              url: '_insurancesapi_/insurance/claims/submitClaimsAndPredeterminations',
            },
            submitGrid: {
              method: 'PUT',
              url: '_insurancesapi_/insurance/claims/submitClaimsAndPredeterminationsGrid',
            },
            validateById: {
              method: 'GET',
              url: '_insurancesapi_/insurance/claims/validateClaim',
              params: { claimId: '@claimId' },
            },
            validateForAttachments: {
              method: 'GET',
              url: '_insurancesapi_/insurance/claims/:claimId/attachment/validateClaim',
              params: { claimId: '@claimId' },
            },
          }
        ),
        Communication: $resource(
          '_soarapi_/patients/:Id/communications',
          {},
          {
            create: { method: 'POST' },
            get: { method: 'GET' },
            //update: { method: 'PUT' }
            updateStatus: {
              method: 'PUT',
              params: {
                Id: '@Id',
                PatientCommunicationId: '@PatientCommunicationId',
              },
              url: '_soarapi_/patients/:Id/communications/:PatientCommunicationId',
            },
            getTemplatesByGroupId: {
              method: 'GET',
              params: {
                Id: '@Id',
                GroupId: '@GroupId',
                mediaTypeId: '@mediaTypeId',
              },
              url: '_soarapi_/patients/:Id/communications/:GroupId/:mediaTypeId',
            },
            getTemplateById: {
              method: 'GET',
              params: { Id: '@Id', templateId: '@templateId' },
              url: '_soarapi_/patients/:Id/templateCommunications/:templateId/:appointmentId',
            },
            sendTextMessage: {
              method: 'POST',
              params: { phoneNumber: '@phoneNumber' },
              url: '_soarapi_/patients/:phoneNumber/communications/sendSMS',
            },
            sendEmail: {
              method: 'POST',
              params: {},
              url: '_soarapi_/patients/communications/sendEmail',
            },
            tagRead: {
              method: 'PUT',
              params: {
                PatientCommunicationId: '@PatientCommunicationId',
              },
              url: '_soarapi_/patients/communications/:PatientCommunicationId/tagRead',
            },
            countUnReadCommunication: {
              method: 'GET',
              params: {
                patientId: '@PatientId',
                communicationTypeId: '@CommunicationTypeId',
              },
              url: '_soarapi_/patients/communications/count/unread',
            },
          }
        ),
        PredChangeStatus: $resource(
          '_insurancesapi_/insurance/predeterminations/',
          {},
          {
            update: {
              method: 'PUT',
              url: '_insurancesapi_/insurance//predeterminations/:claimId/changeStatus?claimStatus=:claimStatus',
              params: { claimId: '@claimId', claimStatus: '@claimStatus' },
            },
          }
        ),
        ClinicalNotes: $resource(
          '_clinicalapi_/patients/:Id/clinicalnotes/:NoteId',
          {},
          {
            create: { method: 'POST' },
            createRxNote: {
              method: 'POST',
              params: { Id: '@Id' },
              url: '_clinicalapi_/patients/:Id/clinicalnotes/rx',
            },
            getRxMaps: {
              method: 'GET',
              params: { Id: '@Id' },
              url: '_clinicalapi_/patients/:Id/clinicalnotes/v2/rxmaps',
            },
            markDeleted: {
              method: 'PUT',
              params: { Id: '@Id', NoteId: '@NoteId' },
            },
            update: { method: 'PUT' },
          }
        ),
        ClinicalOverviews: $resource(
          '_clinicalapi_/patients/clinicaloverview',
          {},
          {
            getAll: { method: 'POST' },
            // gets a list of ClinicalOverviews for multiple patients
          }
        ),
        ClinicalOverview: $resource(
          '_clinicalapi_/patients/:Id/clinicaloverview',
          {},
          {}
        ),
        Conditions: $resource(
          '_clinicalapi_/patients/:Id/conditions/:ConditionId',
          {},
          {
            update: { method: 'PUT' },
            batchDelete: {
              method: 'DELETE',
              hasBody: true,
              headers: { 'Content-Type': 'application/json;charset=UTF-8' },
              params: { patientId: '@patientId' },
              url: '_clinicalapi_/patients/:patientId/conditions',
            },
          }
        ),
        Contacts: $resource(
          '_soarapi_/patients/:Id/contacts',
          {},
          {
            addUpdate: { method: 'PUT', params: { Id: '@Id' } },
            getAllPhonesWithLinks: {
              method: 'GET',
              params: { Id: '@Id' },
              url: '_soarapi_/patients/:Id/contactsWithLinks',
            },
            getAllEmailsWithLinks: {
              method: 'GET',
              params: { Id: '@Id' },
              url: '_soarapi_/patients/:Id/emailsWithLinks',
            },
          }
        ),
        Emails: $resource('_soarapi_/patients/:Id/emails', {}, {}),
        ExternalImages: $resource(
          '_clinicalapi_/patients/:patientId/thirdpartyimagingrecords',
          {},
          {
            create: {
              method: 'POST',
              url: '_clinicalapi_/patients/thirdpartyimagingrecords',
            },
          }
        ),
        CreditTransactions: $resource(
          '_insurancesapi_/accounts/:accountId/credittransaction/:creditTransactionId',
          {},
          {
            getCreditTransactionsByAccountId: {
              method: 'GET',
              params: { accountId: '@accountId' },
              url: '_insurancesapi_/accounts/:accountId/credittransactions',
            },
            getCreditTransactionByIdForAccount: {
              method: 'GET',
              params: {
                accountId: '@accountId',
                creditTransactionId: '@creditTransactionId',
              },
              url: '_insurancesapi_/accounts/:accountId/credittransaction/:creditTransactionId',
            },
            create: {
              method: 'POST',
              params: { accountId: '@AccountId' },
              url: '_insurancesapi_/accounts/:accountId/credittransaction',
            },
            createMultiple: {
              method: 'POST',
              params: { accountId: '@AccountId' },
              url: '_insurancesapi_/accounts/:accountId/credittransactions',
            },
            update: {
              method: 'PUT',
              params: { accountId: '@accountId' },
              url: '_insurancesapi_/accounts/:accountId/credittransaction',
            },
            updateAll: {
              method: 'PUT',
              params: { accountId: '@accountId' },
              url: '_insurancesapi_/accounts/:accountId/credittransactions',
            },
            creditDistribution: {
              method: 'GET',
              params: {
                accountId: '@accountId',
                accountMemberId: '@accountMemberId',
              },
              url: '_insurancesapi_/accounts/:accountId/accountmembers/:accountMemberId/creditdistribution',
            },
            creditDistributionForAccount: {
              method: 'POST',
              params: {
                accountMemberId: '@accountMemberId',
                amount: '@amount',
              },
              url: '_insurancesapi_/accountmembers/:accountMemberId/servicetransactions/creditdistribution',
            },
            markAccountPaymentAsDeleted: {
              method: 'PUT',
              params: { accountId: '@AccountId' },
              url: '_insurancesapi_/accounts/:accountId/deletedaccountpayment',
            },
            markNegativeAdjustmentAsDeleted: {
              method: 'PUT',
              params: { accountId: '@AccountId' },
              url: '_insurancesapi_/accounts/:accountId/deletednegativeadjustment',
            },
            creditDistributionForSelectedServiceTransactions: {
              method: 'POST',
              params: { accountMemberId: '@accountMemberId' },
              url: '_insurancesapi_/accountmembers/:accountMemberId/servicetransactions/creditdistribution',
            },
            applyInsurance: {
              method: 'POST',
              params: { accountId: '@AccountId' },
              url: '_insurancesapi_/accounts/:accountId/insurancepayment',
            },
            applyBulkInsurancePayment: {
              method: 'POST',
              url: '_insurancesapi_/accounts/bulkInsurancePayment',
            },
            applyBulkInsurancePayments: {
              params: { payerId: '@payerId' },
              method: 'POST',
              url: '_insurancesapi_/accounts/bulkInsurancePayments',
            },
            updateBulkInsurancePayment: {
              method: 'PUT',
              url: '_insurancesapi_/accounts/bulkInsurancePayment',
            },
            getBulkInsurancePayment: {
              method: 'GET',
              url: '_insurancesapi_/accounts/bulkInsurancePayment/:bulkCreditTransactionId',
              params: { bulkCreditTransactionId: '@bulkCreditTransactionId' },
            },
            applyPaymentAdjustment: {
              method: 'PUT',
              params: { accountId: '@AccountId' },
              url: '_insurancesapi_/accounts/:accountId/credittransactionadjustment',
            },
            applyUnappliedCreditTransaction: {
              method: 'PUT',
              params: { accountId: '@AccountId' },
              url: '_insurancesapi_/accounts/:accountId/applyunappliedcredittransaction',
            },
            getTransactionHistoryPaymentDetails: {
              method: 'GET',
              params: {
                accountId: '@accountId',
                creditTransactionId: '@creditTransactionId',
              },
              url: '_insurancesapi_/transactionHistoryPaymentDetails?accountId=:accountId&creditTransactionId=:creditTransactionId',
            },
            getTransactionHistoryPaymentInformation: {
              method: 'GET',
              params: {
                creditTransactionId: '@creditTransactionId',
                getAdditionalBulkPaymentInfo: '@getAdditionalBulkPaymentInfo',
              },
              url: '_insurancesapi_/transactionHistoryPaymentInformation?creditTransactionId=:creditTransactionId&getAdditionalBulkPaymentInfo=:getAdditionalBulkPaymentInfo',
            },
            payPageRequest: {
              method: 'POST',
              url: '_insurancesapi_/payment-integration/payment-intent',
            },
            payPageReturnRequest: {
              method: 'POST',
              url: '_insurancesapi_/payment-integration/payment-intent/return',
            }
          }
        ),
        AccountStatements: $resource(
          '_soarapi_/accounts/:accountId/accountstatement',
          {},
          {
            GetAccountStatementByAccountId: {
              method: 'GET',
              params: { accountId: '@accountId' },
              url: '_soarapi_/accounts/:accountId/accountstatement',
            },
            GetAccountStatementMessages: {
              method: 'GET',
              params: {},
              url: '_soarapi_/accounts/accountstatementmessage',
            },
          }
        ),
        AccountStatementSettings: {
          GetAccountStatementPdf: function (url, data) {
            var q = $q.defer();
            $http
              .get(url, {
                responseType: 'arraybuffer',
              })
              .then(
                function (res) {
                  q.resolve(res);
                },
                function (error) {
                  q.reject(error);
                }
              );
            return q.promise;
          },
        },
        ClaimServiceTransactions: $resource(
          '_insurancesapi_/accounts/claimservicetransactions/creditdistribution',
          {},
          {
            // distribute insurance payment v1 - distribute up to est ins
            creditdistribution: {
              method: 'POST',
              params: { amount: '@amount' },
              url: '_insurancesapi_/accounts/claimservicetransactions/creditdistribution',
            },
            // distribute insurance payment v2 - distribute up to remaining charge
            creditdistributions: {
              method: 'POST',
              params: { amount: '@amount' },
              url: '_insurancesapi_/accounts/claimservicetransactions/creditdistribution/v2',
            },
          }
        ),
        DebitTransaction: $resource(
          '_insurancesapi_/accounts/debittransaction',
          {},
          {
            getDebitTransactionsByAccountId: {
              method: 'GET',
              params: { accountId: '@accountId' },
              url: '_insurancesapi_/accounts/:accountId/debittransactions',
            },
            createDebitTransaction: { method: 'POST' },
            getDebitTransactionsByAccountMemberId: {
              method: 'GET',
              params: { accountMemberId: '@accountMemberId' },
              url: '_insurancesapi_/accountmembers/:accountMemberId/debittransactions',
            },
            markDeleted: {
              method: 'PUT',
              params: { debitTransactionId: '@debitTransactionId' },
              url: '_insurancesapi_/accounts/debittransaction/:debitTransactionId',
            },
            update: {
              method: 'PUT',
              url: '_insurancesapi_/accountmembers/debittransactions',
            },
            getDebitTransactionById: {
              method: 'GET',
              params: { debitTransactionId: '@debitTransactionId' },
              url: '_insurancesapi_/accounts/debittransaction/:debitTransactionId',
            },
          }
        ),
        Discount: $resource(
          '_insurancesapi_/servicetransactions/calculatediscount',
          {},
          {
            get: { method: 'POST', params: { isDiscounted: '@isDiscounted' } },
            getByPersonId: {
              method: 'POST',
              params: { personId: '@personId', isDiscounted: '@isDiscounted' },
              url: '_insurancesapi_/servicetransactions/:personId/calculatediscount',
            },
          }
        ),
        Discounts: $resource(
          '_soarapi_/Patients/:PatientId/DiscountType/:PatientDiscountTypeId',
          {},
          {
            getDiscount: { method: 'GET', params: { PatientId: '@PatientId' } },
            addDiscount: {
              method: 'POST',
              params: { PatientId: '@PatientId' },
            },
            updateDiscount: {
              method: 'PUT',
              params: { PatientId: '@PatientId' },
            },
            removeDiscount: {
              method: 'DELETE',
              params: {
                PatientId: '@PatientId',
                PatientDiscountTypeId: '@PatientDiscountTypeId',
              },
            },
          }
        ),
        DocumentManagement: $resource(
          '_soarapi_/documentmanagement/patients',
          {},
          {}
        ),
        Encounter: $resource(
          '_insurancesapi_/encounters',
          {},
          {
            create: { method: 'POST' },
            getAllEncountersByEncounterId: {
              method: 'GET',
              params: { encounterId: '@encounterId' },
              url: '_insurancesapi_/encounters/:encounterId',
            },
            getEncounterServiceTransactionLinkByPersonId: {
              method: 'GET',
              params: { personId: '@personId' },
              url: '_insurancesapi_/persons/:personId/encounters',
            },
            checkoutEncounters: {
              method: 'PUT',
              url: '_insurancesapi_/encounters/checkout',
            },
            update: { method: 'PUT' },
            deleteEncounter: {
              method: 'DELETE',
              params: { encounterId: '@encounterId' },
              url: '_insurancesapi_/encounters/:encounterId',
            },
            getEncountersByAccountId: {
              method: 'GET',
              params: {
                accountId: '@accountId',
                includeTransactions: '@includeTransactions',
              },
              url: '_insurancesapi_/accounts/:accountId/encounters',
            },
            createInvoices: {
              method: 'POST',
              params: { accountId: '@accountId' },
              url: '_insurancesapi_/accounts/:accountId/invoiceoptions',
            },
            createRefactorInvoices: {
              method: 'POST',
              url: '_insurancesapi_/accounts/invoiceoptionsbyencounterid',
            },
            invoiceOptions: {
              method: 'GET',
              params: { encounterId: '@encounterId' },
              url: '_insurancesapi_/encounters/:encounterId/invoiceoptions',
            },
            getDebitTransactionsByPersonId: {
              method: 'GET',
              params: { personId: '@personId' },
              url: '_insurancesapi_/persons/:personId/positiveAdjustments',
            },
            getDebitTransactionsByAccountId: {
              method: 'GET',
              params: { accountId: '@accountId' },
              url: '_insurancesapi_/account/:accountId/positiveAdjustments',
            },
          }
        ),
        GroupTypes: $resource(
          '_soarapi_/patients/:Id/groups/:PatientGroupTypeId',
          {},
          {
            create: { method: 'POST', params: { Id: '@Id' } },
          }
        ),
        PatientAdditionalIdentifiers: $resource(
          '_soarapi_/patients/:Id/patientidentifiers',
          {},
          {
            save: { method: 'POST', params: { Id: '@Id' } },
            update: { method: 'PUT', params: { Id: '@Id' } },
          }
        ),
        MedicalHistory: $resource(
          '_clinicalapi_/patients/:patientId/MedicalHistory/:formAnswerId',
          {},
          {
            getById: {
              method: 'GET',
              url: '_clinicalapi_/patients/:patientId/MedicalHistoryView/current',
            },
            getSummariesByPatientId: {
              method: 'GET',
              url: '_clinicalapi_/patients/:patientId/MedicalHistoryView/summaries',
            },
            getByFormAnswersId: {
              method: 'GET',
              url: '_clinicalapi_/patients/:patientId/MedicalHistoryView/:formAnswersId/form',
            },
          }
        ),
        HipaaAuthorization: $resource(
          '_soarapi_/patients/:patientId/HipaaAuthorization/:formAnswerId',
          {},
          {
            save: {
              method: 'POST',
              url: '_soarapi_/patients/:patientId/HipaaAuthorization',
            },
            getById: {
              method: 'GET',
              url: '_soarapi_/patients/:patientId/HipaaAuthorizationView/current',
            },
            getByFormAnswersId: {
              method: 'GET',
              url: '_soarapi_/patients/:patientId/HipaaAuthorizationView/:formAnswersId/form',
            },
            getSummariesByPatientId: {
              method: 'GET',
              params: { patientId: '@patientId' },
              url: '_soarapi_/patients/:patientId/HipaaAuthorizationView/summaries',
            },
          }
        ),
        Odontogram: $resource(
          '_clinicalapi_/patients/:Id/odontogram',
          {},
          {
            get: { method: 'GET', params: { Id: '@Id' } },
            create: { method: 'POST', params: { Id: '@Id' } },
            update: { method: 'PUT', params: { Id: '@Id' } },
            mouthstatus: {
              method: 'GET',
              params: { Id: '@Id' },
              url: '_clinicalapi_/patients/:Id/mouthstatus',
            },
          }
        ),
        ExportOdontogram: $resource(
          '_clinicalapi_/patients/:patientId/clinicalsnapshot',
          {},
          {
            save: { method: 'POST', params: { patientId: '@patientId' } },
          }
        ),
        Patient: standardService(
          'Patient',
          'PatientId',
          '_soarapi_/persons/profile/:PatientId',
          true,
          false,
          function (patient) {
            if (patient.FirstName == undefined) patient.FirstName = '';
            if (patient.LastName == undefined) patient.LastName = '';
            return patient.FirstName != '' && patient.LastName != '';
          }
        ),
        PatientLocations: $resource(
          '_soarapi_/patientlocations/:Id',
          {},
          {
            get: { method: 'GET', cache: patCache },
          }
        ),
        Patients: $resource(
          '_soarapi_/persons/profile/:Id',
          {},
          {
            get: { method: 'GET', cache: patCache },
            getWithoutAccount: {
              method: 'GET',
              url: '_soarapi_/persons/profile/withoutaccount/:Id',
            },
            save: { method: 'POST', cache: patCache },
            update: { method: 'PUT', cache: patCache },
            search: { method: 'GET', url: '_soarapi_/patients/search/' },
            duplicates: {
              method: 'POST',
              url: '_soarapi_/patients/duplicates',
            },
            overview: {
              method: 'GET',
              cache: patientOverviewCache,
              url: '_soarapi_/patients/:patientId/overview',
            },
            isResponsiblePersonEditable: {
              method: 'GET',
              url: '_soarapi_/patients/:patientId/isResponsiblePersonEditable',
              params: {
                patientId: '@patientId',
                accountAccountId: '@accountAccountId',
                accountMemberAccountId: '@accountMemberAccountId',
                responsiblePersonType: '@responsiblePersonType',
              },
            },
            dashboard: {
              method: 'GET',
              cache: patientOverviewCache,
              url: '_soarapi_/patients/:patientId/dashboard',
            },
            updateDirectoryId: {
              method: 'PUT',
              url: '_soarapi_/persons/profile/:Id/directory',
              params: { Id: '@patientId', directoryId: '@directoryId' },
            },
          }
        ),
        PatientDuplicates: $resource(
          '_soarapi_/patient/duplicates/:Id',
          {},
          {
            update: { method: 'PUT' },
          }
        ),
        PatientBenefitPlan: $resource(
          '_insurancesapi_/patients/:patientId/benefitplan/:benefitPlanId/:category',
          {},
          {
            get: {
              method: 'GET',
              cache: patBenefitPlanCache,
              params: { patientId: '@patientId' },
            },
            create: {
              method: 'POST',
              cache: patBenefitPlanCache,
              params: { patientId: '@patientId' },
            },
            update: {
              method: 'PUT',
              cache: patBenefitPlanCache,
              params: { patientId: '@patientId' },
            },
            deletePatientBenefitPlan: {
              method: 'PUT',
              cache: patBenefitPlanCache,
              params: {
                patientId: '@patientId',
                benefitPlanId: '@benefitPlanId',
              },
            },
            deletePolicyHolderBenefitPlan: {
              method: 'PUT',
              cache: patBenefitPlanCache,
              params: {
                policyHolderBenefitPlanId: '@policyHolderBenefitPlanId',
              },
              url: '_insurancesapi_/patients/PolicyHolderBenefitPlan/:policyHolderBenefitPlanId',
            },
            getBenefitPlanRecordByPatientBenefitPlanId: {
              method: 'GET',
              params: { benefitPlanId: '@benefitPlanId' },
            },
            getPatientBenefitPlanRecordById: {
              method: 'GET',
              params: {
                patientId: '@patientId',
                benefitPlanId: '@benefitPlanId',
              },
            },
            getDependentsForPolicyHolder: {
              method: 'GET',
              params: {
                patientId: '@patientId',
                benefitPlanId: '@benefitPlanId',
                category: 'dependents',
              },
            },
            getDependentsForBenefitPlan: {
              method: 'GET',
              params: {
                benefitPlanId: '@benefitPlanId',
                category: 'dependents',
              },
            },
            getBenefitPlansRecordsByAccountId: {
              method: 'GET',
              params: { accountId: '@accountId' },
              url: '_insurancesapi_/patients/:accountId/plan',
            },
            getBenefitPlansRecordsByPatientId: {
              method: 'GET',
              params: { patientId: '@patientId' },
              url: '_insurancesapi_/patients/:patientId/benefitPlan',
            },
            getBenefitPlansAvailableByClaimId: {
              method: 'POST',
              url: '_insurancesapi_/patients/benefitplan/claim/claimIds',
            },
            checkRTE: {
              method: 'GET',
              params: {
                patientId: '@patientId',
                patientBenefitPlanId: '@patientBenefitPlanId',
                enterpriseId: '@enterpriseId',
              },
              url: '_insurancesapi_/v2/patients/:patientId/benefitplan/:patientBenefitPlanId/eligibility',
            },
            getRTE: {
              method: 'GET',
              params: {
                enterpriseId: '@enterpriseId',
                patientId: '@patientId',
                eligibilityId: '@eligibilityId',
                applicationId:'@applicationId',
              },
              url: '_rteApiUrl_/api/v1/Eligibility/enterprises/:enterpriseId/patients/:patientId/eligibility/:eligibilityId',
            },
            hasPatientBenefitPlansByAccountId: {
              method: 'GET',
              params: { accountId: '@accountId' },
              url: '_insurancesapi_/patients/hasPatientBenefitPlans/:accountId',
            },
            getPatientBenefitPlansByAccountId: {
              method: 'GET',
              params: { accountId: '@accountId' },
              url: '_insurancesapi_/patients/getPatientBenefitPlans/:accountId',
            },
            getPatientBenefitPlansByPatientId: {
              method: 'GET',
              params: {
                patientId: '@patientId',
                claimId: '@claimId',
                type: '@type',
              },
              url: '_insurancesapi_/patients/getPatientBenefitPlans/:patientId/:claimId/:type',
            },
          }
        ),
        PatientAppointmentHistory: $resource(
          '_soarapi_/patients/:patientId/pastAppointments/counts',
          {},
          {}
        ),
        AccountAppointmentHistory: $resource(
          '_soarapi_/accounts/:accountId/pastAppointments/counts',
          {},
          {}
        ),
        PatientPastAppointments: $resource(
          '_soarapi_/patients/:patientId/pastAppointments',
          {},
          {}
        ),
        AccountPastAppointments: $resource(
          '_soarapi_/accounts/:accountId/pastAppointments',
          {},
          {}
        ),
        PatientAppointment: $resource(
          '_soarapi_/appointments/nextappointment',
          {},
          {
            AppointmentsForAccount: {
              method: 'GET',
              url: '_sapischeduleapi_/Appointments/detail',
            },
            AppointmentsForAccountRefactor: {
              method: 'GET',
              url: '_soarapi_/Appointments/patient',
            },
            AppointmentsByClassification: {
              method: 'GET',
              url: '_soarapi_/Appointments/:classification/ByClassification',
              params: { classification: '@classification' },
            },
            NextAppointment: {
              method: 'GET',
              params: { PersonId: '@PersonId' },
            },
            AppointmentsForPatient: {
              method: 'GET',
              url: '_sapischeduleapi_/Appointments',
            },
            ScheduledCount: {
              method: 'GET',
              params: { patientId: '@patientId' },
              url: '_soarapi_/patients/:patientId/appointments-view/scheduled/count',
            },
            GetWithDetails: {
              method: 'GET',
              url: '_soarapi_/appointments/:appointmentId/detail',
              params: { appointmentId: '@appointmentId' },
            },
            HardDeletedDueToBeingMissed: {
              method: 'PUT',
              url: '_soarapi_/appointments/hardDeletedDueToBeingMissed',
            },
            CheckForRunningAppointment: {
              method: 'GET',
              params: { patientId: '@patientId' },
              url: '_soarapi_/appointments/running/:patientId',
            },
            OverviewByAccount: {
              method: 'GET',
              params: {
                accountId: '@accountId',
                includeServiceCodes: '@includeServiceCodes',
              },
              url: '_soarapi_/appointments/accountOverview/:accountId/:includeServiceCodes',
            },
            OverviewByPatient: {
              method: 'GET',
              params: {
                patientId: '@patientId',
                includeServiceCodes: '@includeServiceCodes',
              },
              url: '_soarapi_/appointments/patientOverview/:patientId/:includeServiceCodes',
            },
            ConvertToUnscheduled: {
              method: 'PUT',
              url: '_sapischeduleapi_/appointments/convertToUnscheduled',
            },
            FlagForScheduling: {
              method: 'PUT',
              url: '_soarapi_/appointments/:appointmentId/flagForScheduling',
              params: { appointmentId: '@appointmentId' },
            },
          }
        ),
        PatientAccountTransfer: $resource(
          '_insurancesapi_/accounts/transferAccount/:patientId',
          {},
          {
            split: { method: 'PUT', params: { patientId: '@patientId' } },
            merge: {
              method: 'PUT',
              params: {
                patientId: '@patientId',
                otherAccountId: '@otherAccountId',
              },
              url: '_insurancesapi_/accounts/mergeAccount/:patientId/:otherAccountId',
            },
            canMerge: {
              method: 'GET',
              params: { personId: '@personId' },
              url: '_insurancesapi_/accounts/mergeAccount/:personId/canMerge',
            },
            getPatientGrid: {
              method: 'GET',
              params: { searchQuery: 'searchQuery' },
              url: '_insurancesapi_/accounts/transferAccount/patientTransferGrid',
            },
            getPatientTransferCardDetails:{
              method: 'GET',
              params: { patientId: '@patientId'},
              url: '_insurancesapi_/accounts/transferAccount/:patientId/patientTransferCardDetails',
            },
          }
        ),

        PatientMedicalHistoryAlerts: $resource(
          '_soarapi_/patients/:patientId/medicalHistoryAlerts',
          {},
          {}
        ),
        MedicalHistoryAlerts: $resource(
          '_soarapi_/patients/medicalHistoryAlerts',
          {},
          {}
        ),
        PatientWatch: $resource(
          '_soarapi_/patients/:Id/watch/:watchId',
          {},
          {
            update: { method: 'PUT' },
          }
        ),
        PerioExam: $resource(
          '_clinicalapi_/patients/:Id/perioexams/:examId',
          {},
          {
            get: { method: 'GET', params: { Id: '@Id', ExamId: '@examId' } },
            create: { method: 'POST', params: { Id: '@Id' } },
            update: { method: 'PUT' },
            getAllHeaders: {
              method: 'GET',
              params: { Id: '@Id' },
              url: '_clinicalapi_/patients/:Id/perioexams/headers',
            },
            getAllExamsByPatient: {
              method: 'POST',
              params: { Id: '@Id' },
              url: '_clinicalapi_/patients/:Id/perioexams/perioExamsByToothIds',
            },
            summaries: {
              method: 'GET',
              params: { Id: '@Id' },
              url: '_clinicalapi_/patients/:Id/perioexams/summaries',
            },
            getPerioComparison: {
              method: 'GET',
              url: '_clinicalapi_/patients/:Id/perioexams/comparison',
              params: { examIds: '@examIds' },
            },
          }
        ),
        Predetermination: $resource(
          '_insurancesapi_/insurance/predetermination/:personId',
          {},
          {
            Create: {
              method: 'POST',
              url: '_insurancesapi_/insurance/predetermination/',
              params: {
                personId: '@personId',
                benefitPlanId: '@benefitPlanId',
                providerId: '@providerId',
                calculateEstimatatedInsurance: true,
                treatmentPlanId: '@treatmentPlanId',
              },
            },
            Close: {
              method: 'PUT',
              url: '_insurancesapi_/insurance/predeterminations/close',
            },
            // support for getting predeterminations by multiple serviceTransactionIds / deleting multiple predeterminations
            getClaimsByServiceTransactionIds: {
              method: 'POST',
              url: '_insurancesapi_/insurance/claims/getClaimsByServiceTransactions/:claimType',
              params: { claimType: '@claimType' },
            },
            closeBatch: {
              method: 'PUT',
              url: '_insurancesapi_/insurance/predeterminations/closeMultiple',
            },
          }
        ),
        PreventiveServicesOverview: $resource(
          '_practicesapi_/api/v1/preventiveservicesoverview',
          {},
          {
            Retrieve: {
              method: 'GET',
              isArray: true
            }
          }
        ),
        PreventiveCare: $resource(
          '_clinicalapi_/patients/:Id/preventivecare',
          {},
          {
            getAllServicesDue: {
              method: 'GET',
              params: { Id: '@Id' },
              url: '_clinicalapi_/patients/:Id/preventivecare/servicesdue',
            },
            getAllServicesDueForAccount: {
              method: 'GET',
              params: { Id: '@Id' },
              url: '_clinicalapi_/patients/:Id/preventivecare/accountoverview',
            },
            getAllOverrides: {
              method: 'GET',
              params: { Id: '@Id' },
              url: '_clinicalapi_/patients/:Id/preventivecare/overrides',
            },
            updateOverrides: {
              method: 'PUT',
              params: { Id: '@Id' },
              url: '_clinicalapi_/patients/:Id/preventivecare/overrides',
            },
          }
        ),
        PreventiveCareTab: $resource(
          '_soarapi_/patients/preventivecaretab',
          {},
          {
            get: { method: 'GET' },
            ExportToCSVFile: {
              method: 'POST',
              params: {},
              url: '_soarapi_/patients/PreventiveCareTab/csvFile',
            },
            ExportToCSVFileWithContactInfo: {
              method: 'POST',
              params: {},
              url: '_soarapi_/patients/PreventiveCareTab/csvFileWithContactInfo',
            },
          }
        ),
        TreatmentPlanTab: $resource(
          '_soarapi_/patients/TreatmentPlanTab',
          {},
          {
            ExportToCSVFile: {
              method: 'POST',
              params: {},
              url: '_soarapi_/patients/TreatmentPlanTab/csvFile',
            },
            ExportToCSVFileWithContactInfo: {
              method: 'POST',
              params: {},
              url: '_soarapi_/patients/TreatmentPlanTab/csvFileWithContactInfo',
            },
          }
        ),
        TreatmentPlanHover: $resource(
          '_soarapi_/patients/TreatmentPlanHover/:patientId',
          {},
          {
            get: { method: 'GET', params: { patientId: '@patientId' } },
          }
        ),
        AppointmentPatientTab: $resource(
          '_sapischeduleapi_/patients/AppointmentTab',
          {},
          {
            get: { method: 'GET' },
            ExportToCSVFile: {
              method: 'POST',
              params: {},
              url: '_sapischeduleapi_/patients/AppointmentTab/csvFile',
            },
            ExportToCSVFileWithContactInfo: {
              method: 'POST',
              params: {},
              url: '_sapischeduleapi_/patients/AppointmentTab/csvFileWithContactInfo',
            },
          }
        ),

        AllPatientTab: $resource(
          '_soarapi_/patients/PatientTab/csvFile',
          {},
          {
            ExportToCSVFile: {
              method: 'POST',
              params: {},
              url: '_soarapi_/patients/PatientTab/csvFile',
            },
            ExportToCSVFileWithContactInfo: {
              method: 'POST',
              params: {},
              url: '_soarapi_/patients/PatientTab/csvFileWithContactInfo',
            },
          }
        ),

        OtherToDoTab: $resource(
          '_soarapi_/patients/OtherToDoTab/csvFile',
          {},
          {
            ExportToCSVFile: {
              method: 'POST',
              params: {},
              url: '_soarapi_/patients/OtherToDoTab/csvFile',
            },
            ExportToCSVFileWithContactInfo: {
              method: 'POST',
              params: {},
              url: '_soarapi_/patients/OtherToDoTab/csvFileWithContactInfo',
            },
          }
        ),

        PreviousDentalOffice: $resource(
          '_soarapi_/patients/:Id/previousdentaloffice',
          {},
          {
            create: { method: 'POST', params: { Id: '@Id' } },
            update: { method: 'PUT', params: { Id: '@Id' } },
          }
        ),
        PolicyHolder: $resource(
          '_insurancesapi_/patients/:patientId/policyHolderBenefitPlan/:policyHolderBenefitPlanId/:category',
          {},
          {
            availablePolicyHolders: {
              method: 'GET',
              params: { category: 'AvailablePolicyHolders' },
            },
          }
        ),
        Referral: standardService(
          'Referral',
          ['PatientReferralId', 'PatientId'],
          '',
          true,
          false
        ),
        Referrals: $resource(
          '_soarapi_/patients/:Id/patientReferral',
          {},
          {
            GetReferredPatients: {
              method: 'GET',
              params: { Id: '@Id' },
              url: '_soarapi_/patients/:Id/referredPatients',
            },
            GetReferral: {
              method: 'GET',
              params: { Id: '@Id' },
              url: '_soarapi_/patients/:Id/patientReferral',
            },
            UpdateReferral: {
              method: 'PUT',
              params: { Id: '@ReferredPatientId' },
            },
            save: { method: 'POST', params: { Id: '@ReferredPatientId' } },
          }
        ),
        RxPatient: $resource(
          '_rxapiurl_/api/locations/:locationId/patients',
          {},
          {
            save: { method: 'PUT' },
            medications: {
              method: 'GET',
              isArray: true,
              params: {
                applicationId: '@applicationId',
                patientId: '@patientId',
                userId: '@userId',
              },
              url: '_rxapiurl_/api/locations/:locationId/patients/:patientId/medications?applicationId=:applicationId&patientId=:patientId&userId=:userId&medicationSources=History&medicationSources=Prescription&medicationSources=SelfReported&medicationSources=Imported&medicationStatuses=Active&medicationStatuses=Inactive&medicationStatuses=Completed&medicationStatuses=Discontinued',
            },
          }
        ),
        ServiceTransactions: $resource(
          '_insurancesapi_/persons/:Id/servicetransactions/:servicetransactionid',
          {},
          {
            update: {
              method: 'PUT',
              params: {
                accountMemberId: '@accountMemberId',
                isTreatmentPlan: '@isTreatmentPlan',
                treatmentPlanName: '@treatmentPlanName',
                treatmentPlanGroupNumber: '@treatmentPlanGroupNumber',
                processMaxUsed: '@processMaxUsed',
              },
              url: '_insurancesapi_/accountmembers/:accountMemberId/servicetransactions',
            },
            getServiceTransactionsByAccountId: {
              method: 'GET',
              params: {
                accountId: '@accountId',
                serviceTransactionStatusId: '@serviceTransactionStatusId',
              },
              url: '_insurancesapi_/accounts/:accountId/servicetransactions',
            },
            getServiceTransactionsByAccountMemberId: {
              method: 'GET',
              params: {
                accountMemberId: '@accountMemberId',
                serviceTransactionStatusId: '@serviceTransactionStatusId',
              },
              url: '_insurancesapi_/accountmembers/:accountMemberId/servicetransactions',
            },
            getServiceTransactionsForTimeline: {
              method: 'GET',
              params: { personId: '@personId' },
              url: '_clinicalapi_/persons/:personId/servicetransactionsfortimeline',
            },
            serviceEstimates: {
              method: 'POST',
              url: '_insurancesapi_/insurance/serviceEstimates',
            },
            calculateInsuranceForTransactions: {
              method: 'POST',
              params: {},
              url: '_insurancesapi_/insurance/estimatefortransactions',
            },
            calculateInsuranceForTransactionsByPersonId: {
              method: 'POST',
              params: { personId: '@personId' },
              url: '_insurancesapi_/insurance/:personId/estimatefortransactions',
            },
            markDeleted: {
              method: 'DELETE',
              params: {
                personId: '@personId',
                serviceTransactionId: '@serviceTransactionId',
              },
              url: '_insurancesapi_/persons/:personId/servicetransactions/:serviceTransactionId',
            },
            updateInsurance: {
              method: 'PUT',
              url: '_insurancesapi_/accountmember/servicetransactions/insuranceEstimates',
            },
            feeRollback: {
              method: 'PUT',
              url: '_insurancesapi_/servicetransactions/priorfees',
            },
            checkForInsurancePayment: {
              method: 'GET',
              params: { serviceTransactionId: '@serviceTransactionId' },
              url: '_insurancesapi_/servicetransactions/:serviceTransactionId/hasinsurancepayment',
            },
            calculateTaxAndDiscount: {
              method: 'POST',
              url: '_insurancesapi_/servicetransactions/calculateTaxAndDiscount',
            },
            calculateTaxAndDiscountByPersonId: {
              method: 'POST',
              params: { personId: '@personId' },
              url: '_insurancesapi_/servicetransactions/:personId/calculateTaxAndDiscount',
            },
            calculateDiscountAndTaxAndInsuranceEstimate: {
              method: 'POST',
              url: '_insurancesapi_/servicetransactions/calculatediscountandtaxandinsuranceestimate',
            },
            deleteFromLedger: {
              method: 'DELETE',
              url: '_insurancesapi_/persons/:Id/servicetransactions/:servicetransactionid?fromLedger=true',
            },
            getAppliedTransactionInformation: {
              method: 'GET',
              url: '_insurancesapi_/servicetransactions/:serviceTransactionId/appliedtransactioninformation',
            },
            getServiceTransactionsByIds: {
              method: 'POST',
              url: '_insurancesapi_/servicetransactions',
            },
            batchDelete: {
              method: 'DELETE',
              hasBody: true,
              headers: { 'Content-Type': 'application/json;charset=UTF-8' },
              params: { personId: '@personId' },
              url: '_insurancesapi_/persons/:personId/servicetransactions?deleteFromLedger',
            },
          }
        ),
        ServiceTransactionsCalculation: $resource(
          '_insurancesapi_/servicetransactions/calculateinsuranceandtax',
          {},
          {
            get: {
              method: 'GET',
              params: {
                providerUserId: '@providerUserId',
                locationId: '@locationId',
                taxableServiceTypeId: '@taxableServiceTypeId',
                fee: '@fee',
                patientId: '@patientId',
                serviceCodeId: '@serviceCodeId',
              },
            },
          }
        ),
        Tax: $resource(
          '_insurancesapi_/servicetransactions/calculatetax',
          {},
          {
            get: { method: 'POST' },
          }
        ),
        TaxAfterDiscount: $resource(
          '_insurancesapi_/servicetransactions/calculatetaxafterdiscount',
          {},
          {
            get: { method: 'POST', params: { isDiscounted: '@isDiscounted' } },
            getByPersonId: {
              method: 'POST',
              params: { personId: '@personId', isDiscounted: '@isDiscounted' },
              url: '_insurancesapi_/servicetransactions/:personId/calculatetaxafterdiscount',
            },
          }
        ),
        ToothHistory: $resource(
          '_soarapi_/patients/:Id/toothhistory/:tooth',
          {},
          {}
        ),

        TreatmentPlans: $resource(
          '_clinicalapi_/persons/:Id/treatmentplans/:TreatmentPlanId',
          {},
          {
            save: { method: 'POST', cache: patTreatmentPlanCache },
            update: { method: 'PUT', cache: patTreatmentPlanCache },
            getTreatmentPlansWithServicesByPersonId: {
              method: 'GET',
              params: { Id: '@Id' },
                url: '_clinicalapi_/persons/:Id/treatmentplanswithservices',                                               
            },
            get: {
              method: 'GET',
              params: {
                Id: '@Id',
                TreatmentPlanId: '@TreatmentPlanId',
                includePredeterminationInfo: '@includePredeterminationInfo',
              },
              cache: patTreatmentPlanCache,
            },
            getTreatmentPlanById: {
              method: 'GET',
              params: { Id: '@Id', TreatmentPlanId: '@TreatmentPlanId' },
              url: '_clinicalapi_/persons/:Id/treatmentplans/:TreatmentPlanId',
              cache: patTreatmentPlanCache,
            },
            getPredeterminationsForTreatmentPlan: {
              method: 'GET',
              params: { Id: '@Id', TreatmentPlanid: '@TreatmentPlanId' },
              url: '_clinicalapi_/persons/:Id/treatmentplans/:TreatmentPlanId/predeterminations',
              cache: patTreatmentPlanCache,
            },
            deletePlan: {
              method: 'DELETE',
              params: { Id: '@Id', TreatmentPlanId: '@TreatmentPlanId' },
              cache: patTreatmentPlanCache,
            },
            getAllHeaders: {
              method: 'GET',
              params: { Id: '@Id' },
              url: '_clinicalapi_/persons/:Id/treatmentplans/headers',
              cache: patTreatmentPlanCache,
            },
            getCount: {
              method: 'GET',
              params: { Id: '@Id' },
              url: '_clinicalapi_/persons/:Id/treatmentplans-view/activeCount',
              cache: patTreatmentPlanCache,
            },
            updateHeader: {
              method: 'PUT',
              params: { Id: '@Id', TreatmentPlanId: '@TreatmentPlanId' },
              url: '_clinicalapi_/persons/:Id/treatmentplans/:TreatmentPlanId/header',
              cache: patTreatmentPlanCache,
            },
            updateServiceHeader: {
              method: 'PUT',
              params: {
                Id: '@Id',
                TreatmentPlanId: '@TreatmentPlanId',
                TreatmentPlanServiceId: '@TreatmentPlanServiceId',
                StageNumber: '@StageNumber',
                AppointmentId: '@AppointmentId',
              },
              url: '_clinicalapi_/persons/:Id/treatmentplans/:TreatmentPlanId/services/:TreatmentPlanServiceId',
              cache: patTreatmentPlanCache,
            },
            addServices: {
              method: 'POST',
              params: { Id: '@Id', TreatmentPlanId: '@TreatmentPlanId' },
              url: '_clinicalapi_/persons/:Id/treatmentplans/:TreatmentPlanId/services',
              cache: patTreatmentPlanCache,
            },
            removeService: {
              method: 'DELETE',
              params: {
                Id: '@Id',
                TreatmentPlanId: '@TreatmentPlanId',
                TreatmentPlanServiceId: '@TreatmentPlanServiceId',
              },
              url: '_clinicalapi_/persons/:Id/treatmentplans/:TreatmentPlanId/services/:TreatmentPlanServiceId',
              cache: patTreatmentPlanCache,
            },
            getHeadersWithServicesSummary: {
              method: 'GET',
              params: { Id: '@Id' },
              url: '_clinicalapi_/persons/:Id/treatmentplans/headerswithservicessummary',
              cache: patTreatmentPlanCache,
            },
            treatmentPlanSummariesForAddService: {
              method: 'GET',
              params: { Id: '@Id' },
              url: '_clinicalapi_/persons/:Id/treatmentPlanSummariesForAddService',
            },
            getAccountOverview: {
              method: 'GET',
              params: { Id: '@Id' },
              url: '_clinicalapi_/persons/:Id/treatmentplans/accountoverview',
              cache: patTreatmentPlanCache,
            },
            deleteStage: {
              method: 'DELETE',
              params: {
                Id: '@Id',
                TreatmentPlanId: '@TreatmentPlanId',
                PartNumber: '@PartNumber',
              },
              url: '_clinicalapi_/persons/:Id/treatmentplans/:TreatmentPlanId/parts/:PartNumber',
              cache: patTreatmentPlanCache,
            },
            createUnscheduleAppointment: {
              method: 'POST',
              params: { Id: '@Id', TreatmentPlanId: '@TreatmentPlanId' },
              url: '_clinicalapi_/persons/:Id/treatmentplans/:TreatmentPlanId/appointments',
            },
            createAppointments: {
              method: 'POST',
              params: {
                PersonId: '@PersonId',
                TreatmentPlanId: '@TreatmentPlanId',
              },
              url: '_clinicalapi_/persons/:PersonId/treatmentplans/:TreatmentPlanId/appointments',
            },
            txPlanFlags: {
              method: 'POST',
              url: '_clinicalapi_/services/isontreatmentplanflags',
            },
            ServicesOnAppointments: {
              method: 'GET',
              params: {
                treatmentPlanId: '@treatmentPlanId',
                stageId: '@stageId',
              },
              url: '_clinicalapi_/treatmentPlans/:treatmentPlanId/stages/:stageId/servicesOnAppointments',
            },
            ProposedServicesForAdd: {
              method: 'GET',
              params: { Id: '@Id' },
              url: '_clinicalapi_/persons/:Id/treatmentPlanProposedServicesForAdd',
            },
            // returns TreatmentPlanServicePriorityOrderDto, use when reordering services
            PriorityOrder: {
              method: 'PUT',
              url: '_clinicalapi_/treatmentplanservices/priorityOrder',
              cache: patTreatmentPlanCache,
            },
            // returns last Priority number in TreatmentPlanServices by TreatmentPlanId
            LastPriority: {
              method: 'GET',
              params: { Id: '@Id' },
              url: '_clinicalapi_/treatmentPlans/:Id/services/lastPriority',
            },
            // returns TreatmentPlanServicePriorityOrderDto use by TreatmentPlanId when Priority hasn't been set to update list
            DefaultPriorityOrder: {
              method: 'PUT',
              params: { Id: '@Id' },
              url: '_clinicalapi_/treatmentplans/:Id/services/defaultPriorityOrder',
            },
            updateMultipleServiceHeaders: {
              method: 'PUT',
              params: {
                Id: '@Id',
                TreatmentPlanId: '@TreatmentPlanId',
                TreatmentPlanServiceId: '@TreatmentPlanServiceId',
              },
              url: '_clinicalapi_/persons/:Id/treatmentplans/:TreatmentPlanId/services/:TreatmentPlanServiceId/headers',
              cache: patTreatmentPlanCache,
            },
          }
        ),
        TreatmentPlanFlags: $resource(
          '_clinicalapi_/services/isontreatmentplanflags',
          {},
          {
            //Save
          }
        ),
        TreatmentPlanSnapshots: $resource(
          '_clinicalapi_/treatmentplans/:treatmentPlanId/snapshots',
          {},
          {
            //This isn't being used anywhere
          }
        ),
        TreatmentPlanDocuments: $resource(
          '_clinicalapi_/treatmentplans/:treatmentPlanId/documents',
          {},
          {
            //Save, Get
          }
        ),
        InformedConsent: $resource(
          '_clinicalapi_/informedconsents/:consentId',
          {},
          {
            //Save, Get
          }
        ),
        InsuranceInfo: $resource(
          '_insurancesapi_/patients/:AccountId/plan',
          {},
          {}
        ),
        Documents: $resource(
          '_soarapi_/documents/:DocumentId',
          {},
          {
            getAllDocuments: {
              method: 'GET',
              params: { parentType: '@parentType', parentId: '@parentId' },
              url: '_soarapi_/documents/:parentType/:parentId',
            },
            Add: { method: 'POST', url: '_soarapi_/documents/' },
            update: { method: 'PUT' },
            addActivity: {
              method: 'POST',
              url: '_soarapi_/documents/Activity/',
            },
          }
        ),
        MailingLabel: $resource(
          '_soarapi_/patients/MailingLabelPatient',
          {},
          {
            GetMailingLabelPatient: {
              method: 'POST',
              params: {},
              url: '_soarapi_/patients/MailingLabelPatient',
            },
            GetMailingLabelPreventive: {
              method: 'POST',
              params: {},
              url: '_soarapi_/patients/MailingLabelPreventive',
            },
            GetMailingLabelTreatment: {
              method: 'POST',
              params: {},
              url: '_soarapi_/patients/MailingLabelTreatment',
            },
            GetMailingLabelAppointment: {
              method: 'POST',
              params: {},
              url: '_soarapi_/patients/MailingLabelAppointment',
            },
            GetMailingLabelReceivables: {
              method: 'POST',
              params: {},
              url: '_soarapi_/patients/MailingLabelReceivables',
            },
          }
        ),
      };
    },
  ]);
