(function () {
  'use strict';

  angular
    .module('Soar.Patient')
    .factory('InformedConsentFactory', InformedConsentFactory);
  InformedConsentFactory.$inject = [
    'PatientServices',
    'localize',
    '$q',
    'toastrFactory',
    'patSecurityService',
    'tabLauncher',
    '$filter',
    'userSettingsDataService',
  ];
  function InformedConsentFactory(
    patientServices,
    localize,
    $q,
    toastrFactory,
    patSecurityService,
    tabLauncher,
    $filter,
    userSettingsDataService
  ) {
    var factory = this;

    factory.hasAccess = {
      Create: false,
      Delete: false,
      Edit: false,
      View: false,
    };

    //#region authentication

    factory.createAccess = function () {
      return patSecurityService.IsAuthorizedByAbbreviation(
        'soar-clin-cplan-icadd'
      );
    };

    factory.viewAccess = function () {
      return patSecurityService.IsAuthorizedByAbbreviation(
        'soar-clin-cplan-icview'
      );
    };

    factory.access = function () {
      if (!factory.viewAccess()) {
      } else {
        factory.hasAccess.Create = factory.createAccess();
        factory.hasAccess.View = true;
      }
      return factory.hasAccess;
    };

    //#endregion

    //#region internal methods

    factory.getInformedConsent = function (id) {
      if (factory.viewAccess()) {
        var defer = $q.defer();
        var promise = defer.promise;
        patientServices.InformedConsent.get({ consentId: id }).$promise.then(
          function (res) {
            promise = $.extend(promise, { values: res });
            defer.resolve(res);
          },
          function (res) {
            toastrFactory.error(
              localize.getLocalizedString(
                'Failed to retrieve the {0}. Refresh the page to try again.',
                ['Informed Consent']
              ),
              localize.getLocalizedString('Server Error')
            );
          }
        );
        return promise;
      }
    };

    factory.printUnsignedInformedConsent = function (informedConsent, patient) {
      if (factory.viewAccess()) {
        var informedConsentAgreement = { Services: [] };
        // create informedConsent document for print only
        informedConsentAgreement.PrintUnsigned = true;
        informedConsentAgreement.CreatedDate = moment();
        informedConsentAgreement.Message = informedConsent.Message;
        informedConsentAgreement.Notes = informedConsent.Notes;
        informedConsentAgreement.PatientCode = informedConsent.PatientCode;
        informedConsentAgreement.PatientName = $filter(
          'getPatientNameAsPerBestPractice'
        )(patient);
        informedConsentAgreement.ProviderComments =
          informedConsent.ProviderComments;
        informedConsentAgreement.TreatmentPlanName =
          informedConsent.TreatmentPlanName;
        informedConsentAgreement.TreatmentPlanId =
          informedConsent.TreatmentPlanId;
        angular.forEach(informedConsent.Services, function (svc) {
          var service = {};
          service.Area = svc.$$ServiceTransaction.$$Area;
          service.Status =
            svc.$$ServiceTransaction.$$ServiceTransactionStatusName;
          service.Tooth = svc.$$ServiceTransaction.Tooth;
          service.ProviderCode = svc.$$ServiceTransaction.UserCode;
          service.Description = svc.$$ServiceTransaction.Description;
          service.Fee = svc.$$ServiceTransaction.Amount;
          informedConsentAgreement.Services.push(service);
        });
        // add unique identifier for storing data and route parameter
        var customId = 'PrintUnsigned_' + patient.PatientId;
        localStorage.setItem(
          'document_' + customId,
          JSON.stringify(informedConsentAgreement)
        );
        let patientPath = '#/Patient/';
        tabLauncher.launchNewTab(
          patientPath +
            document.ParentId +
            '/InformedConsentAgreement/' +
            customId
        );
      }
    };

    factory.viewInformedConsent = function (document) {
      var defer = $q.defer();
      var promise = defer.promise;
      if (factory.viewAccess()) {
        factory
          .getInformedConsent(document.FileAllocationId)
          .then(function (res) {
            if (res && res.Value) {
              var informedConsentAgreement = res.Value;
              informedConsentAgreement.PrintUnsigned = false;
              // add patient info in model expected by filter
              var patientInfo = {
                FirstName: '',
                LastName: '',
                MiddleName: '',
                PreferredName: '',
                Suffix: '',
              };
              patientInfo.FirstName = informedConsentAgreement.PatientFirstName;
              patientInfo.LastName = informedConsentAgreement.PatientLastName;
              patientInfo.MiddleName =
                informedConsentAgreement.PatientMiddleName;
              patientInfo.PreferredName =
                informedConsentAgreement.PatientPreferredName;
              patientInfo.Suffix = informedConsentAgreement.PatientSuffixName;
              var patientName = '';
              if (patientInfo) {
                patientName = $filter('getPatientNameAsPerBestPractice')(
                  patientInfo
                );
              }
              informedConsentAgreement.PatientName = patientName;
              // add FileAllocationId to object to have unique identifier
              informedConsentAgreement.FileAllocationId =
                document.FileAllocationId;
              localStorage.setItem(
                'document_' + informedConsentAgreement.FileAllocationId,
                JSON.stringify(informedConsentAgreement)
              );
              let patientPath = '#/Patient/';
              tabLauncher.launchNewTab(
                patientPath +
                  document.ParentId +
                  '/InformedConsentAgreement/' +
                  informedConsentAgreement.FileAllocationId
              );
              promise = $.extend(promise, { values: res.Value });
              defer.resolve(res);
            }
          });
      }
      return promise;
    };

    factory.saveInformedConsent = function (informedConsent) {
      if (factory.createAccess()) {
        var defer = $q.defer();
        var promise = defer.promise;
        patientServices.InformedConsent.save(informedConsent).$promise.then(
          function (res) {
            toastrFactory.success(
              localize.getLocalizedString('Your {0} has been created.', [
                'Informed Consent Agreement',
              ]),
              localize.getLocalizedString('Success')
            );
            promise = $.extend(promise, { values: res.Value });
            defer.resolve(res);
          },
          function () {
            toastrFactory.error(
              localize.getLocalizedString(
                'Save was unsuccessful. Please retry your save.'
              ),
              localize.getLocalizedString('Server Error')
            );
          }
        );
        return promise;
      }
    };

    factory.getInformedConsentSignature = function (id) {
      if (factory.viewAccess()) {
        var defer = $q.defer();
        var promise = defer.promise;
        //patientServices.InformedConsent.get().$promise.then(function (res) {
        //    promise = $.extend(promise, { values: res });
        //    defer.resolve(res);
        //},
        //function (res) {
        //    toastrFactory.error(localize.getLocalizedString("Failed to retrieve the {0}. Refresh the page to try again.", ['Informed Consent Message']), localize.getLocalizedString('Server Error'));
        //});
        return promise;
      }
    };

    factory.saveInformedConsentSignature = function () {};

    factory.getNewInformedConsentDto = function () {
      return {
        PatientCode: null,
        TreatmentPlanId: null,
        TreatmentPlanName: null,
        ProviderComments: '',
        Notes: '',
        Message: '',
        CreatedDate: null,
        PatientSignatureFileAllocationId: null,
        WitnessSignatureFileAllocationId: null,
        Services: [],
      };
    };

    factory.getNewInformedConsentServiceDto = function () {
      return {
        ServiceTransactionId: null,
      };
    };

    //#endregion

    return {
      access: function () {
        return factory.access();
      },
      getById: function (id) {
        return factory.getInformedConsent(id);
      },
      view: function (document) {
        return factory.viewInformedConsent(document);
      },
      save: function (informedConsent) {
        return factory.saveInformedConsent(informedConsent);
      },
      printUnsigned: function (informedConsent, patient) {
        return factory.printUnsignedInformedConsent(informedConsent, patient);
      },
      getSignature: function (id) {
        return factory.getInformedConsentSignature(id);
      },
      saveSignature: function () {
        return factory.saveInformedConsentSignature();
      },
      InformedConsentDto: function () {
        return factory.getNewInformedConsentDto();
      },
      InformedConsentServiceDto: function () {
        return factory.getNewInformedConsentServiceDto();
      },
    };
  }
})();
