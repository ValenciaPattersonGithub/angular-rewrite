'use strict';
//TODO this is for placeholder only and will need to be modified for actual documents
var app = angular.module('Soar.Patient');
app.controller('PatientDocumentsController', [
  '$scope',
  '$location',
  'DocumentsKendoFactory',
  'localize',
  'PatientServices',
  'DocumentGroupsService',
  'DocumentService',
  'RecentDocumentsService',
  'toastrFactory',
  '$filter',
  '$sce',
  '$http',
  '$window',
  '$routeParams',
  'patSecurityService',
  '$timeout',
  'KendoGridFactory',
  'DocumentsLoadingService',
  'PatientDocumentsFactory',
  'ModalFactory',
  'ListHelper',
  '$q',
  'tabLauncher',
  'TreatmentPlanDocumentFactory',
  'InformedConsentFactory',
  'InformedConsentMessageService',
  'FileUploadFactory',
  '$rootScope',
  '$resource',
  'FormsDocumentsFactory',
  'PatientLogic',
  'PersonFactory',
  'PatientValidationFactory',
  'locationService',
  '$uibModal',
  'userSettingsDataService',
  PatientDocumentsController,
]);

function PatientDocumentsController(
  $scope,
  $location,
  documentsKendoFactory,
  localize,
  patientServices,
  documentGroupsService,
  documentService,
  recentDocumentsService,
  toastrFactory,
  $filter,
  $sce,
  $http,
  $window,
  $routeParams,
  patSecurityService,
  $timeout,
  kendoGridFactory,
  documentsLoadingService,
  patientDocumentsFactory,
  modalFactory,
  listHelper,
  $q,
  tabLauncher,
  treatmentPlanDocumentFactory,
  informedConsentFactory,
  informedConsentMessageService,
  fileUploadFactory,
  $rootScope,
  $resource,
  formsDocumentsFactory,
  patientLogic,
  personFactory,
  patientValidationFactory,
  locationService,
  $uibModal,
  userSettingsDataService
) {
  BaseCtrl.call(this, $scope, 'PatientDocumentsController');
  var ctrl = this;
  ctrl.patientPath = '#/Patient/';
  ctrl.isQueryingServer = false;
  ctrl.$onInit = function () {
    $scope.patientId = $routeParams.patientId;
    $scope.loading = false;
    $scope.documents = [];
    $scope.documentGroupsList = {};
    ctrl.window = null;
    // amfas properties
    ctrl.soarAuthClinicalDocumentsViewKey = 'soar-doc-docimp-view';
    ctrl.soarAuthClinicalDocumentsAddKey = 'soar-doc-docimp-add';
    ctrl.soarAuthClinicalDocumentsEditKey = 'soar-doc-docimp-edit';
    ctrl.soarAuthClinicalDocumentsDeleteKey = 'soar-doc-docimp-delete';
    $scope.hasClinicalDocumentsViewAccess = false;
    $scope.hasClinicalDocumentsAddAccess = false;
    $scope.hasClinicalDocumentsEditAccess = false;
    $scope.hasClinicalDocumentsDeleteAccess = false;
    // function calls
    ctrl.authAccess();
    $scope.getAllDocumentGroups();
    $scope.getDocumentsByPatientId($scope.patientId);
    ctrl.createDirectoryBeforeDownload($scope.patientId);
    $scope.access = informedConsentMessageService.access();

    if (!_.isNil($scope.patientData)) {
      $scope.formattedPatientName = patientLogic.GetFormattedName(
        $scope.patientData
      );
    } else {
      $scope.formattedPatientName = 'Unknown patient name'; // this shouldn't happen!
    }
  };

  //#region authorization

  // check if logged in user has view access to patient notes
  ctrl.authAddAccessToDocuments = function () {
    return patSecurityService.IsAuthorizedByAbbreviation(
      ctrl.soarAuthClinicalDocumentsAddKey
    );
  };

  // check if logged in user has view access to patient appointments
  ctrl.authEditAccessToDocuments = function () {
    return patSecurityService.IsAuthorizedByAbbreviation(
      ctrl.soarAuthClinicalDocumentsEditKey
    );
  };

  // check if logged in user has view access to perio stats
  ctrl.authDeleteAccessToDocuments = function () {
    return patSecurityService.IsAuthorizedByAbbreviation(
      ctrl.soarAuthClinicalDocumentsDeleteKey
    );
  };

  // check if logged in user has view access to documents
  ctrl.authViewAccessToDocuments = function () {
    return patSecurityService.IsAuthorizedByAbbreviation(
      ctrl.soarAuthClinicalDocumentsViewKey
    );
  };

  // Check view access for time-line items
  ctrl.authAccess = function () {
    if (ctrl.authViewAccessToDocuments()) {
      $scope.hasClinicalDocumentsViewAccess = true;
    }
    if (ctrl.authAddAccessToDocuments()) {
      $scope.hasClinicalDocumentsAddAccess = true;
    }
    if (ctrl.authEditAccessToDocuments()) {
      $scope.hasClinicalDocumentsEditAccess = true;
    }
    if (ctrl.authDeleteAccessToDocuments()) {
      $scope.hasClinicalDocumentsDeleteAccess = true;
    }
  };

  //#endregion

  ctrl.createDirectoryPromise = null;
  ctrl.createDirectoryBeforeDownload = function (patientId) {
    ctrl.createDirectoryPromise = fileUploadFactory.CreatePatientDirectory(
      {
        PatientId: patientId,
        DirectoryAllocationId: $scope.patientDirectoryId,
      },
      null,
      ctrl.soarAuthClinicalDocumentsViewKey
    );
  };

  $scope.setCustomProperties = function (docList) {
    angular.forEach(docList, function (doc) {
      doc.$$FormattedDate = $filter('date')(doc.DateUploaded, 'MM/dd/yyyy');
    });
    return docList;
  };

  $scope.addDocument = function () {
    $scope.openDocUploader();
  };

  // get document groups
  $scope.getAllDocumentGroups = function () {
    documentGroupsService.getAll(
      function (res) {
        $scope.documentGroupsList = res.Value;
      },
      function (res) {
        toastrFactory.error(
          localize.getLocalizedString('{0} {1}', [
            'Document Groups',
            'failed to load.',
          ]),
          localize.getLocalizedString('Server Error')
        );
      }
    );
  };

  // get documents by patientId
  $scope.getDocumentsByPatientId = function (patientId) {
    $scope.loading = true;
    if ($scope.hasClinicalDocumentsViewAccess) {
      documentService.get(
        { parentId: patientId, parentType: 'patient' },
        function (res) {
          var docList = res.Value;
          $scope.setCustomProperties(docList);
          angular.forEach(docList, function (doc) {
            // doc.$$FormattedDate = $filter('date')(doc.DateUploaded, 'MM/dd/yyyy');
            if (!doc.$$DocumentGroup) {
              var group = listHelper.findItemByFieldValue(
                $scope.documentGroupsList,
                'DocumentGroupId',
                doc.DocumentGroupId
              );
              if (group) {
                doc.$$DocumentGroup = group.Description;
              }
            }
          });
          $scope.documents = docList;
        },
        function (res) {
          toastrFactory.error(
            localize.getLocalizedString('{0} {1}', [
              'Documents',
              'failed to load.',
            ]),
            localize.getLocalizedString('Server Error')
          );
        }
      );
    }

    $scope.loading = false;
  };
  $rootScope.$on('CallParentMethodFPA', function () {
    $scope.documents = [];
    $scope.loading = true;
    if ($scope.patientId) {
      documentService.get(
        { parentId: $scope.patientId, parentType: 'patient' },
        function (res) {
          var docList = res.Value;
          $scope.setCustomProperties(docList);
          angular.forEach(docList, function (doc) {
            // doc.$$FormattedDate = $filter('date')(doc.DateUploaded, 'MM/dd/yyyy');
            if (!doc.$$DocumentGroup) {
              var group = listHelper.findItemByFieldValue(
                $scope.documentGroupsList,
                'DocumentGroupId',
                doc.DocumentGroupId
              );
              if (group) {
                doc.$$DocumentGroup = group.Description;
              }
            }
          });
          $scope.documents = docList;
        },
        function (res) {
          toastrFactory.error(
            localize.getLocalizedString('{0} {1}', [
              'Documents',
              'failed to load.',
            ]),
            localize.getLocalizedString('Server Error')
          );
        }
      );
    }

    $scope.loading = false;
  });
  // generic 'opener' function, handles all types of docs
  $scope.viewDocument = function (doc) {
    if (doc.MimeType === 'Digital') {
      switch (doc.$$DocumentGroup) {
        case 'Treatment Plans':
          $scope.viewTxPlanSnapshot(doc);
          break;
        case 'Medical History':
          $scope.viewMedHistForm(doc);
          break;
        case 'Consent':
          $scope.viewInformedConsent(doc);
          break;
      }
    } else {
      $scope.getDocumentByDocumentId(doc.DocumentId);
    }
  };

  // opening txPlan snapshots
  $scope.viewTxPlanSnapshot = function (doc) {
    if ($scope.hasClinicalDocumentsViewAccess) {
      treatmentPlanDocumentFactory
        .GetTreatmentPlanSnapshot(doc.FileAllocationId)
        .then(function (res) {
          if (res && res.Value) {
            // storing and sending to the new tab
            localStorage.setItem(
              'document_' + res.Value.SignatureFileAllocationId,
              JSON.stringify(
                treatmentPlanDocumentFactory.CreateSnapshotObject(res.Value)
              )
            );
            tabLauncher.launchNewTab(
              ctrl.patientPath +
                $scope.patientId +
                '/PrintTreatmentPlan/' +
                res.Value.SignatureFileAllocationId
            );
          }
        });
    }
    ctrl.updateRecentDocuments(doc);
  };

  // opening medical history form
  $scope.viewMedHistForm = function (doc) {
    if ($scope.hasClinicalDocumentsViewAccess) {
      tabLauncher.launchNewTab(
        ctrl.patientPath +
          $scope.patientId +
          '/Clinical/MedicalHistoryForm/past?formAnswersId=' +
          doc.FileAllocationId
      );
    }
    ctrl.updateRecentDocuments(doc);
  };

  // displaying document to user in a new tab
  $scope.displayDocument = function (doc) {
    var filegetUri = '_fileapiurl_/api/files/content/';
    var targetUri = filegetUri + doc.FileAllocationId;
    ctrl.window = {};
    documentsLoadingService.executeDownload(targetUri, doc, ctrl.window);
    ctrl.updateRecentDocuments(doc);
  };

  // opening 'regular' docs
  $scope.getDocumentByDocumentId = function (docId) {
    $scope.loading = true;
    ctrl.createDirectoryPromise.then(
      function () {
        if ($scope.hasClinicalDocumentsViewAccess) {
          documentService.getByDocumentId(
            { documentId: docId },
            function (res) {
              var document = res.Value;
              if (document != null) {
                $scope.displayDocument(document);
              }
            },
            function (res) {
              toastrFactory.error(
                localize.getLocalizedString('{0} {1}', [
                  'Document',
                  'failed to load.',
                ]),
                localize.getLocalizedString('Server Error')
              );
            }
          );
        }
      },
      function () {
        toastrFactory.error(
          localize.getLocalizedString('{0} {1}', [
            'Document',
            'failed to load.',
          ]),
          localize.getLocalizedString('Server Error')
        );
      }
    );
    $scope.loading = false;
  };

  // Update recent documents
  ctrl.updateRecentDocuments = function (doc) {
    if ($scope.hasClinicalDocumentsAddAccess) {
      formsDocumentsFactory.UpdateRecentDocuments(doc).then(function (res) {
        $scope.recentDocsList = res;
      });
    }
  };

  $scope.onUpLoadSuccess = function () {
    $scope.docCtrls.close();
    $scope.documents = [];
    $scope.getDocumentsByPatientId;
    $scope.getDocumentsByPatientId($scope.patientId);
  };

  $scope.onUpLoadCancel = function () {
    $scope.docCtrls.close();
    $scope.documents = [];
    $scope.getDocumentsByPatientId($scope.patientId);
  };

  $scope.openMoveDocsModal = function (docs) {
    if (docs.length > 0) {
      var obj = {
        pData: $scope.patientData,
        pName: $scope.formattedPatientName,
      };
      $uibModal.open({
        backdrop: 'static',
        keyboard: false,
        templateUrl:
          'App/Patient/patient-documents/patient-move-documents-modal.html',
        controller: 'MoveDocumentsController',
        controllerAs: 'ctrl',
        resolve: {
          patientData: obj,
          documents: function () {
            return docs;
          },
        },
      });
    }
  };

  //move documents modal close
  $scope.cancel = function () {
    $scope.modalInstanceEula.close();
  };

  // Open the upload modal
  $scope.openDocUploader = function () {
    $scope.docCtrls.content(
      '<doc-uploader [patient-id]="patientId"  (upload-cancel)="onUpLoadCancel($event)" (upload-success)="onUpLoadSuccess($event)"><doc-uploader>'
    );
    $scope.docCtrls.setOptions({
      resizable: false,
      position: {
        top: '40%',
        left: '35%',
      },
      minWidth: 300,
      scrollable: false,
      iframe: false,
      actions: ['Close'],
      title: localize.getLocalizedString('Upload a document'),
      modal: true,
    });
    $scope.docCtrls.open();
  };
  //#region edit docs

  // edit document properties, listening for emit, used to update item in list
  $scope.$on('soar:document-properties-edited', function (e, updatedDoc) {
    $scope.getDocumentsByPatientId($scope.patientId);
    $scope.docCtrls.close();
  });

  // edit document properties, opens kendo window for editing document properties
  $scope.openDocumentProperties = function (id, formattedPatientName) {
    if ($scope.hasClinicalDocumentsEditAccess) {
      var encodedPatientName = _.escape(formattedPatientName);
      $scope.docCtrls.content(
        '<document-properties document-id="' +
          id +
          '" formatted-patient-name="' +
          encodedPatientName +
          '"></document-properties>'
      );
      $scope.docCtrls.setOptions({
        resizable: false,
        position: {
          top: '35%',
          left: '35%',
        },
        minWidth: 400,
        scrollable: false,
        iframe: false,
        actions: [],
        title: localize.getLocalizedString('View Document Properties'),
        modal: true,
      });
      $scope.docCtrls.open();
    }
  };

  //#endregion

  //#region sorting documents

  // sort
  $scope.orderBy = {
    field: 'DateUploaded',
    asc: false,
    sortCounter: 0,
  };
  // function to apply orderBy functionality
  $scope.sortDocuments = function (sortColumn) {
    // if column is same increment sort counter
    var newSortCount =
      $scope.orderBy.field === sortColumn ? $scope.orderBy.sortCounter + 1 : 1;

    // if column is same reverse sort dir
    var asc = $scope.orderBy.field === sortColumn ? !$scope.orderBy.asc : true;

    // if column is same and sort is 2 revert to default sort
    if (newSortCount > 2) {
      sortColumn = 'DateUploaded';
      newSortCount = 0;
      asc = false;
    }
    // sort
    $scope.orderBy = {
      field: sortColumn,
      asc: asc,
      sortCounter: newSortCount,
    };
  };

  //#endregion

  $scope.viewInformedConsent = function (item) {
    if ($scope.access.View) {
      informedConsentFactory.view(item).then(function (res) {
        treatmentPlanDocumentFactory.UpdateRecentDocuments(item);
      });
    } else {
      toastrFactory.error(
        patSecurityService.generateMessage('soar-biz-icmsg-view'),
        'Not Authorized'
      );
    }
  };

  $scope.printPatientRegistrationForm = function () {
    var urlPatientRegistrationForm =
      ctrl.patientPath + 'PatientRegistrationForm/';
    tabLauncher.launchNewTab(urlPatientRegistrationForm);

    var urlPatientInsuranceForm = ctrl.patientPath + 'PatientInsuranceForm/';
    tabLauncher.launchNewTab(urlPatientInsuranceForm);
  };

  $scope.testData = true;
  $scope.testFn = function () {
    if ($scope.testData) {
      $scope.testData = false;
    }
  };
}

PatientDocumentsController.prototype = Object.create(BaseCtrl.prototype);
