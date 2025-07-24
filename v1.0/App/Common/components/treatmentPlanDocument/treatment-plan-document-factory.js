'use strict';

angular.module('common.factories').factory('TreatmentPlanDocumentFactory', [
  'TreatmentPlanSnapshotService',
  '$q',
  'toastrFactory',
  'localize',
  '$filter',
  'TreatmentConsentService',
  'PatientServices',
  'patSecurityService',
  'tabLauncher',
  'RecentDocumentsService',
  'DocumentService',
  '$http',
  'userSettingsDataService',
  'FormsDocumentsFactory',
  function (
    treatmentPlanSnapshotService,
    $q,
    toastrFactory,
    localize,
    $filter,
    treatmentConsentService,
    patientServices,
    patSecurityService,
    tabLauncher,
    recentDocumentsService,
    documentService,
    $http,
    userSettingsDataService,
    formsDocumentsFactory
  ) {
    var factory = this;
    var observers = [];

    //#region authorization

    factory.txPlanSnapshotAccess = {
      Create: false,
      View: false,
      Edit: false,
      Delete: false,
    };

    factory.authCreateAccess = function () {
      return patSecurityService.IsAuthorizedByAbbreviation(
        'soar-doc-docimp-add'
      );
    };

    factory.authDeleteAccess = function () {
      return patSecurityService.IsAuthorizedByAbbreviation(
        'soar-doc-docimp-delete'
      );
    };

    factory.authEditAccess = function () {
      return patSecurityService.IsAuthorizedByAbbreviation(
        'soar-doc-docimp-edit'
      );
    };

    factory.authViewAccess = function () {
      return patSecurityService.IsAuthorizedByAbbreviation(
        'soar-doc-docimp-view'
      );
    };

    factory.authAccess = function () {
      if (factory.authViewAccess()) {
        factory.txPlanSnapshotAccess.View = true;
      }
      if (factory.authEditAccess()) {
        factory.txPlanSnapshotAccess.Edit = true;
      }
      if (factory.authDeleteAccess()) {
        factory.txPlanSnapshotAccess.Delete = true;
      }
      if (factory.authCreateAccess()) {
        factory.txPlanSnapshotAccess.Create = true;
      }
      return factory.txPlanSnapshotAccess;
    };

    //endregion

    factory.updateObservers = function () {
      angular.forEach(observers, function (observer) {
        observer(true);
      });
    };

    // creates the template object
    var createSnapshotObject = function (treatmentPlanSnapshotDto) {
      var snapshotObject = {};
      snapshotObject.adjustedEstimateTotal =
        treatmentPlanSnapshotDto.AdjustmentEstimated;
      snapshotObject.charges = treatmentPlanSnapshotDto.Charges;
      snapshotObject.date = $filter('toDisplayDate')(
        treatmentPlanSnapshotDto.CreatedDate
      );
      treatmentPlanSnapshotDto.LocationNameLine2 =
        treatmentPlanSnapshotDto.LocationNameLine2 === null
          ? ''
          : ' ' + treatmentPlanSnapshotDto.LocationNameLine2;
      treatmentPlanSnapshotDto.LocationAddressLine2 =
        treatmentPlanSnapshotDto.LocationAddressLine2 === null
          ? ''
          : ' ' + treatmentPlanSnapshotDto.LocationAddressLine2;
      snapshotObject.header = {
        PatientName: treatmentPlanSnapshotDto.PatientName,
        LocationName:
          treatmentPlanSnapshotDto.LocationNameLine1 +
          treatmentPlanSnapshotDto.LocationNameLine2,
        LocationAddress:
          treatmentPlanSnapshotDto.LocationAddressLine1 +
          treatmentPlanSnapshotDto.LocationAddressLine2 +
          ' ' +
          treatmentPlanSnapshotDto.LocationCityStateZip,
      };
      snapshotObject.insuranceEstimateTotal =
        treatmentPlanSnapshotDto.InsuranceEstimated;
      snapshotObject.notes =
        treatmentPlanSnapshotDto.Note !== null
          ? treatmentPlanSnapshotDto.Note
          : '';
      snapshotObject.patientBalance = treatmentPlanSnapshotDto.PatientBalance;
      snapshotObject.planStages = treatmentPlanSnapshotDto.Stages;
      snapshotObject.recommendedOption = treatmentPlanSnapshotDto.IsRecommended;
      snapshotObject.signatureConsent = treatmentPlanSnapshotDto.ConsentText;
      snapshotObject.signatureFileAllocationId =
        treatmentPlanSnapshotDto.SignatureFileAllocationId;
      snapshotObject.status = treatmentPlanSnapshotDto.Status;
      snapshotObject.title = treatmentPlanSnapshotDto.TreatmentPlanName;
      snapshotObject.snapshotDate = treatmentPlanSnapshotDto.SnapshotDate;
      snapshotObject.HiddenSnapshotColumns =
        treatmentPlanSnapshotDto.HiddenSnapshotColumns === null
          ? ''
          : treatmentPlanSnapshotDto.HiddenSnapshotColumns;
      return snapshotObject;
    };

    // get
    var getTreatmentPlanSnapshot = function (snapshotId) {
      var defer = $q.defer();
      var promise = defer.promise;
      treatmentPlanSnapshotService.get({ Id: snapshotId }).$promise.then(
        function (res) {
          promise = $.extend(promise, { values: res.Value });
          defer.resolve(res);
        },
        function (res) {
          promise = $.extend(promise, { values: res.Value });
          defer.resolve();
          toastrFactory.error(
            localize.getLocalizedString(
              'Failed to retrieve the {0}. Refresh the page to try again.',
              ['Treatment Plan Snapshot']
            ),
            localize.getLocalizedString('Server Error')
          );
        }
      );
      return promise;
    };

    // get file allocation id
    var getSignatureFileAllocationId = function (
      snapshotId,
      displayToast = true
    ) {
      var defer = $q.defer();
      var promise = defer.promise;
      treatmentPlanSnapshotService
        .getSignatureFileAllocationId({ Id: snapshotId })
        .$promise.then(
          function (res) {
            promise = $.extend(promise, { values: res.Value });
            defer.resolve(res);
          },
          function (res) {
            promise = $.extend(promise, { values: res.Value });
            defer.resolve();
            if (displayToast === true) {
              toastrFactory.error(
                localize.getLocalizedString(
                  'Failed to retrieve the {0}. Refresh the page to try again.',
                  ['File Allocation Id']
                ),
                localize.getLocalizedString('Server Error')
              );
            }
          }
        );
      return promise;
    };

    // get document by id
    factory.getDocumentsByTreatmentPlanId = function (treatmentPlanId) {
      var defer = $q.defer();
      var promise = defer.promise;
      if (factory.authViewAccess()) {
        patientServices.TreatmentPlanDocuments.get({
          treatmentPlanId: treatmentPlanId,
        }).$promise.then(
          function (res) {
            promise = $.extend(promise, { values: res.Value });
            defer.resolve(res);
          },
          function () {
            toastrFactory.error(
              localize.getLocalizedString(
                'Failed to retrieve the {0}. Refresh the page to try again.',
                ['Treatment Plan Documents']
              ),
              localize.getLocalizedString('Server Error')
            );
          }
        );
      }
      return promise;
    };

    // view snapshot
    factory.viewTreatmentPlanSnapshot = function (document) {
      var defer = $q.defer();
      var promise = defer.promise;
      if (factory.authViewAccess()) {
        getTreatmentPlanSnapshot(document.FileAllocationId).then(
          function (res) {
            if (res && res.Value) {
              let patientPath = '#/Patient/';
              var snapshot = res.Value;
              localStorage.setItem(
                'document_' + snapshot.SignatureFileAllocationId,
                JSON.stringify(createSnapshotObject(snapshot))
              );
              tabLauncher.launchNewTab(
                patientPath +
                  document.ParentId +
                  '/PrintTreatmentPlan/' +
                  snapshot.SignatureFileAllocationId
              );
              promise = $.extend(promise, { values: res.Value });
              defer.resolve(res);
            }
          }
        );
      }
      return promise;
    };

    // delete snapshot
    factory.deleteTreatmentPlanDocument = function (documentId) {
      if (factory.authDeleteAccess()) {
        var defer = $q.defer();
        var promise = defer.promise;
        documentService.delete({ documentId: documentId }).$promise.then(
          function (res) {
            factory.updateObservers();
            defer.resolve(res);
          },
          function () {
            toastrFactory.error(
              localize.getLocalizedString('Failed to delete {0}.', [
                'Treatment Plan Snapshot',
              ]),
              localize.getLocalizedString('Server Error')
            );
          }
        );
        return promise;
      }
    };

    // delete blob
    factory.deleteTreatmentPlanDocumentBlob = function (fileAllocationId) {
      if (factory.authDeleteAccess()) {
        var defer = $q.defer();
        var promise = defer.promise;
        var filegetUri = '_fileapiurl_/api/files/';
        var targetUri = filegetUri + fileAllocationId;
        $http
          .delete(targetUri)
          .then(function (res) {
            if (res.status == 200) {
              defer.resolve(res.data);
              toastrFactory.success(
                localize.getLocalizedString('Successfully deleted the {0}.', [
                  'Document',
                ]),
                localize.getLocalizedString('Success')
              );
            }
          })
          .catch(function () {
            toastrFactory.error(
              localize.getLocalizedString(
                'Failed to delete the {0}. Please try again.',
                ['Document']
              ),
              localize.getLocalizedString('Server Error')
            );
          });
        return promise;
      }
    };

    // create
    var createTreatmentPlanSnapshot = function (treatmentPlanDto) {
      var defer = $q.defer();
      var promise = defer.promise;
      treatmentPlanSnapshotService.create(treatmentPlanDto).$promise.then(
        function (res) {
          factory.updateObservers();
          promise = $.extend(promise, { values: res.Value });
          defer.resolve(res);
        },
        function (res) {
          promise = $.extend(promise, { values: res.Value });
          defer.resolve();
          toastrFactory.error(
            localize.getLocalizedString(
              'Failed to create the {0}. Refresh the page to try again.',
              ['Treatment Plan Snapshot']
            ),
            localize.getLocalizedString('Server Error')
          );
        }
      );
      return promise;
    };

    factory.updateRecentDocuments = function (doc) {
      formsDocumentsFactory.UpdateRecentDocuments(doc);
    };

    return {
      access: function () {
        return factory.authAccess();
      },
      CreateSnapshotObject: function (treatmentPlanSnapshotDto) {
        return createSnapshotObject(treatmentPlanSnapshotDto);
      },
      GetTreatmentPlanSnapshot: function (snapshotId) {
        return getTreatmentPlanSnapshot(snapshotId);
      },
      GetSignatureFileAllocationId: function (snapshotId, displayToast) {
        return getSignatureFileAllocationId(snapshotId, displayToast);
      },
      CreateTreatmentPlanSnapshot: function (treatmentPlanDto) {
        return createTreatmentPlanSnapshot(treatmentPlanDto);
      },
      DocumentsByTreatmentPlanId: function (treatmentPlanId) {
        return factory.getDocumentsByTreatmentPlanId(treatmentPlanId);
      },
      ViewTreatmentPlanSnapshot: function (document) {
        return factory.viewTreatmentPlanSnapshot(document);
      },
      DeleteTreatmentPlanDocument: function (documentId) {
        return factory.deleteTreatmentPlanDocument(documentId);
      },
      DeleteTreatmentPlanDocumentBlob: function (fileAllocationId) {
        return factory.deleteTreatmentPlanDocumentBlob(fileAllocationId);
      },
      // subscribe to changes in snapshots
      observeSnapshots: function (observer) {
        observers.push(observer);
      },
      UpdateRecentDocuments: function (txPlanDoc) {
        return factory.updateRecentDocuments(txPlanDoc);
      },
    };
  },
]);
