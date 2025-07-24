'use strict';
angular.module('Soar.BusinessCenter').controller('FormsDocumentsController', [
  '$scope',
  '$location',
  'localize',
  'PatientServices',
  'DocumentGroupsFactory',
  'DocumentService',
  'RecentDocumentsService',
  'toastrFactory',
  '$filter',
  '$http',
  '$routeParams',
  'patSecurityService',
  '$timeout',
  'DocumentsLoadingService',
  'PatientDocumentsFactory',
  'ModalFactory',
  'ListHelper',
  '$q',
  'tabLauncher',
  'TreatmentPlanDocumentFactory',
  'FormsDocumentsFactory',
  'InformedConsentFactory',
  'FileUploadFactory',
  '$uibModal',
  'PatientLogic',
  'userSettingsDataService',
  function (
    $scope,
    $location,
    localize,
    patientServices,
    documentGroupsFactory,
    documentService,
    recentDocumentsService,
    toastrFactory,
    $filter,
    $http,
    $routeParams,
    patSecurityService,
    $timeout,
    documentsLoadingService,
    patientDocumentsFactory,
    modalFactory,
    listHelper,
    $q,
    tabLauncher,
    treatmentPlanDocumentFactory,
    formsDocumentsFactory,
    informedConsentFactory,
    fileUploadFactory,
    $uibModal,
    patientLogic,
    userSettingsDataService
  ) {
    var ctrl = this;
    //
    ctrl.$onInit = function () {
      // setting default values for properties
      $scope.activeDocumentGroup = { DocumentGroupId: null };
      $scope.activeDir = {};
      $scope.documentGroups = [];
      $scope.activeDocumentList = [];
      $scope.filteredDocumentList = [];

      $scope.canUpload = false;

      $scope.patientSelected = false;
      $scope.patientFilter = '';
      $scope.itemsQueuedForDownload = [];
      $scope.selectAllForDownload = false;
      $scope.listFilter = {};
      $scope.currentPatient = null;
      ctrl.window = null;
      ctrl.documentRequests = 0;
      ctrl.documentResponses = 0;
      $scope.filteredPatients = [];
      // delete modal
      ctrl.message = localize.getLocalizedString(
        'Are you sure you want to {0}',
        ["remove this document permanently from this patient's record?"]
      );
      ctrl.title = localize.getLocalizedString('Delete {0}', ['Document']);
      ctrl.button1Text = localize.getLocalizedString('Yes');
      ctrl.button2Text = localize.getLocalizedString('No');
      // amfas properties
      ctrl.soarAuthClinicalDocumentsViewKey = 'soar-doc-docimp-view';
      ctrl.soarAuthClinicalDocumentsAddKey = 'soar-doc-docimp-add';
      ctrl.soarAuthClinicalDocumentsEditKey = 'soar-doc-docimp-edit';
      ctrl.soarAuthClinicalDocumentsDeleteKey = 'soar-doc-docimp-delete';
      $scope.hasClinicalDocumentsViewAccess = false;
      $scope.hasClinicalDocumentsAddAccess = false;
      $scope.hasClinicalDocumentsEditAccess = false;
      $scope.hasClinicalDocumentsDeleteAccess = false;
      // for keeping track of what is loaded
      $scope.loaded = {
        DocumentGroups: false,
        Documents: true,
        Persons: true,
      };
      // function calls
      ctrl.authAccess();
      ctrl.getCurrentPatient();
      $scope.getAllDocumentGroups();
    };

    //#region loader

    //Get current patient by person id
    ctrl.getCurrentPatient = function () {
      if ($location.search().patientId) {
        patientServices.Patient.Operations.Retrieve(
          { PatientId: $location.search().patientId },
          ctrl.getPatientSuccess,
          ctrl.getPatientFailure
        );
      } else {
        $scope.getRecentDocuments(true);
      }
    };

    ctrl.createDirectoryPromise = null;
    ctrl.createDirectoryBeforeDownload = function (patientId, directoryId) {
      ctrl.createDirectoryPromise = fileUploadFactory.CreatePatientDirectory(
        { PatientId: patientId, DirectoryAllocationId: directoryId },
        null,
        ctrl.soarAuthClinicalDocumentsViewKey
      );
    };

    //Success callback to load current patient
    ctrl.getPatientSuccess = function (successResponse) {
      $scope.patient = successResponse.Value;
      $scope.patient.isOpen = true;
      $scope.getPatientDocuments($scope.patient);
    };

    //Error callback to load current patient
    ctrl.getPatientFailure = function () {
      toastrFactory.error(
        localize.getLocalizedString(
          'Failed to retrieve the current patient. Refresh the page to try again.'
        ),
        localize.getLocalizedString('Server Error')
      );
      $scope.getRecentDocuments(true);
    };

    // any necessary data should be in the resolve for this controller, doing it 'manually' here to reolve a bug as there is no time for refactoring - sg
    // opening modal on page load
    ctrl.modalTimeout = $timeout(function () {
      ctrl.modal = $uibModal.open({
        template:
          '<div>' +
          '  <i class="fa fa-spinner fa-4x fa-spin"></i><br/>' +
          '</div>',
        size: 'sm',
        windowClass: 'modal-loading',
        backdrop: 'static',
        keyboard: false,
      });
    }, 0);

    // closing modal when we have all the necessary data
    $scope.$watch(
      'loaded',
      function () {
        if ($scope.loaded.DocumentGroups && $scope.loaded.Documents) {
          ctrl.modalTimeout.then(function () {
            $timeout(function () {
              ctrl.modal.dismiss();
              ctrl.modalTimeout = null;
            });
          });
          if ($scope.currentPatient && !$scope.patientSelected) {
            $scope.setActiveDirectory($scope.currentPatient, '');
          } else if ($scope.patientSelected) {
            $scope.setActiveDirectory($scope.currentPatient, 'Insurance');
          }
        }
      },
      true
    );

    //#endregion

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

    //#region helpers
    ctrl.setCustomProperties = function () {
      angular.forEach($scope.activeDocumentList, function (document) {
        document.$$FormattedDate = $filter('date')(
          document.DateUploaded,
          'MM/dd/yyyy'
        );
      });
    };

    //#endregion

    //#region get patients

    // calling the api
    ctrl.getPatients = function () {
      $scope.patientsLoading = true;
      patientServices.DocumentManagement.get(
        {},
        ctrl.patientsGetSuccess,
        ctrl.patientsGetFailure
      );
    };

    // success handler, setting patients, etc.
    ctrl.patientsGetSuccess = function (res) {
      $scope.patientsLoading = false;
      if (res && res.Value) {
        $scope.patients = res.Value;

        angular.forEach($scope.patients, function (pat) {
          pat.$$FormattedName = patientLogic.GetFormattedName(pat);
        });
      }
      $scope.loaded.Documents = true;
      $scope.loaded.Persons = true;
    };

    $scope.getPatientDocuments = function (patient) {
      ctrl.documentRequests++;
      $scope.getDocumentsByPatientId(patient);
      ctrl.createDirectoryBeforeDownload(
        patient.PatientId,
        patient.DirectoryAllocationId
      );
    };

    // falure handler
    ctrl.patientsGetFailure = function () {
      $scope.patientsLoading = false;
      toastrFactory.error(
        localize.getLocalizedString('{0} {1}', ['Patients', 'failed to load.']),
        localize.getLocalizedString('Server Error')
      );
    };

    //#endregion

    //#region view

    // breadcrumbs
    $scope.breadcrumbs = [
      {
        name: localize.getLocalizedString('Practice Settings'),
        path: '/BusinessCenter/PracticeSettings/',
        title: 'Practice Settings',
      },
      {
        name: localize.getLocalizedString('Forms & Documents'),
        path: '/BusinessCenter/FormsDocuments/',
        title: 'Forms & Documents',
      },
    ];

    // handle URL update for breadcrumbs
    $scope.changePageState = function (breadcrumb) {
      $location.url(breadcrumb.path);
      document.title = breadcrumb.title;
    };

    // Link to the correct page when a tab is clicked
    $scope.getTab = function (index) {
      switch (index) {
        case 0:
          window.location = '#/BusinessCenter/FormsDocuments';
          break;
        case 1:
          break;
        case 2:
          break;
        case 3:
          window.location = '#/BusinessCenter/FormsDocuments/FormsTemplates';
          break;
      }
    };

    $scope.viewOptions = [
      {
        Index: 0,
        Name: 'Patients',
        Disabled: false,
      },
      {
        Index: 1,
        Name: 'Practice',
        Disabled: true,
      },
      {
        Index: 2,
        Name: 'Team Members',
        Disabled: true,
      },
      {
        Index: 3,
        Name: 'Templates & Forms',
        Disabled: false,
      },
    ];

    $scope.selectedItem = $scope.viewOptions[0].Name;

    //#endregion

    //#region filtering

    // TODO refactor as one filter
    $scope.filterCol = function () {
      var filteredDocumentList = $filter('orderBy')(
        $scope.activeDocumentList,
        '-DateUploaded'
      );
      if ($scope.listFilter.Name) {
        filteredDocumentList = $filter('filter')(filteredDocumentList, {
          Name: $scope.listFilter.Name,
        });
      }
      if ($scope.listFilter.PatientName) {
        filteredDocumentList = $filter('filter')(filteredDocumentList, {
          $$FormattedName: $scope.listFilter.PatientName,
        });
      }
      if ($scope.listFilter.OriginalFileName) {
        var filterFunction = function (item) {
          var isMatch = false;
          if (
            item.Description &&
            item.Description.toLowerCase().indexOf(
              $scope.listFilter.OriginalFileName.toLowerCase()
            ) !== -1
          ) {
            isMatch = true;
          } else if (
            item.OriginalFileName.toLowerCase().indexOf(
              $scope.listFilter.OriginalFileName.toLowerCase()
            ) !== -1
          ) {
            isMatch = true;
          }
          return isMatch;
        };
        filteredDocumentList = $filter('filter')(
          filteredDocumentList,
          filterFunction
        );
      }
      if ($scope.listFilter.Date) {
        filteredDocumentList = $filter('filter')(filteredDocumentList, {
          $$FormattedDate: $scope.listFilter.Date,
        });
      }
      if ($scope.listFilter.MimeType) {
        filteredDocumentList = $filter('filter')(filteredDocumentList, {
          MimeType: $scope.listFilter.MimeType,
        });
      }
      $scope.filteredDocumentList = $filter('orderBy')(
        filteredDocumentList,
        '-DateUploaded'
      );
    };

    //#endregion

    //#region patient/dir change

    // set active directory
    $scope.setActiveDirectory = function (patientId, documentGroupDescription) {
      // get activeDocumentGroup
      $scope.activeDocumentGroup = _.find(
        $scope.documentGroups,
        function (documentGroup) {
          return documentGroup.Description === documentGroupDescription;
        }
      );
      $scope.activeDir.directory = documentGroupDescription;
      // clearing the list of docs ready to be downloaded
      $scope.itemsQueuedForDownload.length = 0;
      $scope.selectAllForDownload = false;
      if (documentGroupDescription == 'Recents') {
        $scope.activeDocumentList = ctrl.recentDocumentsList;
        $scope.filteredDocumentList = $filter('orderBy')(
          $scope.activeDocumentList,
          '-DateUploaded'
        );
        $scope.canUpload = false;
      } else {
        $scope.canUpload = true;
        $scope.activeDir.patientId = patientId;

        //$scope.filteredPatients = [];
        if ($scope.patient) {
          $scope.patient.$$FormattedName = patientLogic.GetFormattedName(
            $scope.patient
          );
        }

        if ($scope.patient) {
          $scope.patient.isOpen = true;
          $scope.patient.isParentOpen = true;
        }

        if ($scope.patientSelected) {
          $scope.patientFilter = $scope.patient.$$FormattedName;
        }

        $scope.activeDocumentList = $scope.patient.docList;
      }
      ctrl.setCustomProperties();
      ctrl.setDocumentCount();
      $scope.filteredDocumentList = $filter('orderBy')(
        $scope.activeDocumentList,
        '-DateUploaded'
      );
    };

    //#endregion

    //#region recents

    // set $$DocumentGroup
    ctrl.addDocumentGroup = function (documentList) {
      // add document groups to enable view documents
      angular.forEach(documentList, function (document) {
        if (!document.$$DocumentGroup) {
          var group = listHelper.findItemByFieldValue(
            $scope.documentGroups,
            'DocumentGroupId',
            document.DocumentGroupId
          );
          if (group) {
            document.$$DocumentGroup = group.Description;
          }
        }
      });
    };

    ctrl.addFormattedName = function (document, patient) {
      document.$$FormattedName = patientLogic.GetFormattedName(patient);
      // if activeDocumentList contains the document, update name there also
      var activeDocument = _.find($scope.activeDocumentList, function (doc) {
        return doc.DocumentId === document.DocumentId;
      });
      if (activeDocument) {
        activeDocument.$$FormattedName = patientLogic.GetFormattedName(patient);
      }
    };

    // get a list of most recent documents
    $scope.getRecentDocuments = function (changeDirectory) {
      if ($scope.hasClinicalDocumentsViewAccess) {
        recentDocumentsService.get(
          function (res) {
            $scope.filteredPatients = [];
            $scope.clearPatientSearch();
            ctrl.recentDocumentsList = res.Value;
            ctrl.addDocumentGroup(ctrl.recentDocumentsList);
            angular.forEach(ctrl.recentDocumentsList, function (doc) {
              if (doc.ParentType === 'Patient') {
                patientServices.Patients.get({
                  Id: doc.ParentId,
                }).$promise.then(function (res) {
                  if (res && res.Value) {
                    ctrl.addFormattedName(doc, res.Value);
                  }
                });
              }
            });
            // add document groups description
            ctrl.addDocumentGroup($scope.activeDocumentList);
            if (changeDirectory || $scope.activeDir.directory === 'Recents') {
              $scope.activeDir.directory = 'Recents';
              $scope.setActiveDirectory('0', 'Recents');
            }
          },
          function () {
            toastrFactory.error(
              localize.getLocalizedString('{0} {1}', [
                'Recent Documents',
                'failed to load.',
              ]),
              localize.getLocalizedString('Server Error')
            );
          }
        );
      }
    };

    // update recent documents
    ctrl.updateRecentDocuments = function (documents) {
      if ($scope.hasClinicalDocumentsAddAccess) {
        formsDocumentsFactory
          .UpdateRecentDocuments(documents)
          .then(function (res) {
            $scope.recentDocsList = res;
          });
      }
    };

    $scope.isOpen = false;
    $scope.isParentOpen = true;

    //#endregion

    //#region groups

    ctrl.resetPatientDouments = function () {
      // reset activeDocumentList to recentDocuments list
      $scope.activeParentGroup = null;
      $scope.activeDir.directory = 'Recents';
      $scope.activeDocumentList = _.cloneDeep(ctrl.recentDocumentsList);

      $scope.filteredDocumentList = $filter('orderBy')(
        $scope.activeDocumentList,
        '-DateUploaded'
      );
      _.forEach($scope.documentGroups, function (documentGroup) {
        documentGroup.$$DocumentCount = 0;
      });
      $scope.isOpen = false;
      $scope.isParentOpen = true;
    };

    // detects when patient is null
    $scope.$watch('patient', function (nv) {
      if (nv === null) {
        ctrl.resetPatientDouments();
        $scope.canUpload = false;
      }
    });

    //redo
    $scope.setActiveParentGroup = function (documentGroup) {
      if (
        $scope.activeParentGroup &&
        documentGroup.DocumentGroupId ===
          $scope.activeParentGroup.DocumentGroupId
      ) {
        $scope.activeParentGroup = null;
      } else {
        $scope.activeParentGroup = documentGroup;
      }
    };

    $scope.childGroupsFilter = function (parentDescription) {
      return function (childDocumentGroup) {
        if (
          childDocumentGroup.Description === 'EOB' &&
          parentDescription === 'Insurance'
        ) {
          return true;
        }
        if (
          (childDocumentGroup.Description === 'Lab' ||
            childDocumentGroup.Description === 'Consent' ||
            childDocumentGroup.Description === 'Specialist' ||
            childDocumentGroup.Description === 'HIPAA' ||
            childDocumentGroup.Description === 'Other Clinical') &&
          parentDescription === 'Clinical'
        ) {
          return true;
        }
        return false;
      };
    };

    $scope.parentGroupsFilter = function (documentGroup) {
      return documentGroup.$$parentGroupId === null ? true : false;
    };

    // get Clinical, Insurance Groups

    $scope.loading = false;
    ctrl.clinicalChildDocumentIds = [];
    // set property that denotes parentGroups
    ctrl.setParentGroups = function () {
      _.forEach($scope.documentGroups, function (documentGroup) {
        documentGroup.$$childGroups = [];
        documentGroup.$$IsOpen = false;
      });
      ctrl.clinicalGroup = _.find(
        $scope.documentGroups,
        function (documentGroup) {
          return documentGroup.Description === 'Clinical';
        }
      );
      ctrl.insuranceGroup = _.find(
        $scope.documentGroups,
        function (documentGroup) {
          return documentGroup.Description === 'Insurance';
        }
      );

      _.forEach($scope.documentGroups, function (documentGroup) {
        documentGroup.$$parentGroupId = null;
        if (
          documentGroup.Description === 'Lab' ||
          documentGroup.Description === 'Consent' ||
          documentGroup.Description === 'Specialist' ||
          documentGroup.Description === 'HIPAA' ||
          documentGroup.Description === 'Other Clinical'
        ) {
          documentGroup.$$parentGroupId = ctrl.clinicalGroup.DocumentGroupId;
          ctrl.clinicalGroup.$$childGroups.push(documentGroup);
          ctrl.clinicalGroup.$$IsOpen = true;
        }
        if (documentGroup.Description === 'EOB') {
          documentGroup.$$parentGroupId = ctrl.insuranceGroup.DocumentGroupId;
          ctrl.insuranceGroup.$$childGroups.push(documentGroup);
          ctrl.insuranceGroup.$$IsOpen = true;
        }
      });
      $scope.loading = true;
    };

    ctrl.setDocumentCount = function () {
      _.forEach($scope.documentGroups, function (documentGroup) {
        documentGroup.$$DocumentCount = 0;
      });
      if ($scope.patient && $scope.patient.docList) {
        var patientDocuments = $scope.patient.docList;

        _.forEach(patientDocuments, function (patientDocument) {
          // find the group
          var match = _.find($scope.documentGroups, function (documentGroup) {
            return (
              documentGroup.DocumentGroupId === patientDocument.DocumentGroupId
            );
          });
          if (match) {
            match.$$DocumentCount++;
          }
          // if this match has a parentId also add the count to that one
          if (match.$$parentGroupId) {
            // find that documentGroup and increment count also
            var parentMatch = _.find(
              $scope.documentGroups,
              function (documentGroup) {
                return documentGroup.DocumentGroupId === match.$$parentGroupId;
              }
            );
            if (parentMatch) {
              parentMatch.$$DocumentCount++;
            }
          }
        });
      }
    };

    ctrl.clinicalParentGroup = {
      DocumentGroupId: 9999,
      $$parentGroupId: null,
      Description: 'Clinical',
      IsSystemDocumentGroup: true,
      $$IsOpen: true,
    };

    // get document groups
    $scope.getAllDocumentGroups = function () {
      documentGroupsFactory.DocumentGroups().then(
        function (res) {
          $scope.loaded.DocumentGroups = true;
          $scope.documentGroups = res.Value;
          $scope.documentGroups.push(ctrl.clinicalParentGroup);
          ctrl.setParentGroups();
        },
        function () {
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

    $scope.documentsFilter = function (document) {
      switch ($scope.activeDir.directory) {
        case '':
        case 'Recents':
          return true;
        case 'Clinical':
          var returnVal = false;
          _.forEach(
            $scope.activeDocumentGroup.$$childGroups,
            function (childGroup) {
              if (document.DocumentGroupId === childGroup.DocumentGroupId) {
                returnVal = true;
              }
            }
          );
          return returnVal;
        case 'Insurance':
          returnVal = false;
          _.forEach(
            $scope.activeDocumentGroup.$$childGroups,
            function (childGroup) {
              if (document.DocumentGroupId === childGroup.DocumentGroupId) {
                returnVal = true;
              }
            }
          );
          if (returnVal === false) {
            returnVal =
              document.DocumentGroupId ===
              $scope.activeDocumentGroup.DocumentGroupId;
          }
          return returnVal;
        default:
          return (
            document.DocumentGroupId ===
            $scope.activeDocumentGroup.DocumentGroupId
          );
      }
    };

    // get documents by patientId
    $scope.getDocumentsByPatientId = function (patient) {
      if ($scope.hasClinicalDocumentsViewAccess) {
        documentService.get(
          { parentId: patient.PatientId, parentType: 'patient' },
          function (res) {
            patient.docList = res.Value;
            angular.forEach(patient.docList, function (doc) {
              doc.$$FormattedName = patientLogic.GetFormattedName(
                $scope.patient
              );
              if (!doc.$$DocumentGroup) {
                var group = listHelper.findItemByFieldValue(
                  $scope.documentGroups,
                  'DocumentGroupId',
                  doc.DocumentGroupId
                );
                if (group) {
                  doc.$$DocumentGroup = group.Description;
                }
              }
            });
            if (ctrl.preloadedPatient === patient.PatientId) {
              $scope.setActiveDirectory(patient.PatientId, 'Insurance');
              ctrl.preloadedPatient = null;
            } else {
              ctrl.documentResponses++;
              $scope.setActiveDirectory(patient.PatientId, '');
              $scope.loaded.Documents =
                ctrl.documentRequests === ctrl.documentResponses;
            }
          },
          function () {
            ctrl.documentResponses++;
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
    };

    //#endregion

    //#region multiple download

    // download button click handler
    $scope.downloadSelectedDocs = function () {
      if ($scope.hasClinicalDocumentsViewAccess) {
        angular.forEach($scope.itemsQueuedForDownload, function (doc) {
          if (doc.MimeType === 'Digital') {
            switch (doc.$$DocumentGroup) {
              case 'Treatment Plans':
                $scope.viewTxPlanSnapshot(doc);
                break;
              case 'Medical History':
                $scope.viewMedHistForm(doc);
                break;
            }
          } else {
            $scope.getDocumentByDocumentId(doc.DocumentId, false, true);
          }
        });
        // update recent documents for items downloaded
        ctrl.updateRecentDocuments($scope.itemsQueuedForDownload);
      }
    };

    // select all checkbox handler, either checks or unchecks all the docs in the grid
    $scope.selectAllCheckBoxChanged = function (value) {
      $scope.selectAllForDownload = value;
      if (!ctrl.dontUpdateDocCheckboxes) {
        // clearing the list of docs ready to be downloaded
        $scope.itemsQueuedForDownload.length = 0;
        angular.forEach($scope.activeDocumentList, function (doc) {
          doc.$$Checked = $scope.selectAllForDownload;
          if (doc.$$Checked === true) {
            $scope.itemsQueuedForDownload.push(doc);
          }
        });
      } else {
        delete ctrl.dontUpdateDocCheckboxes;
      }
    };

    // doc row checkbox handler, just here to keep the select all checkbox in sync with the state of these
    $scope.downloadCheckBoxChanged = function () {
      // clearing the list of docs ready to be downloaded
      $scope.itemsQueuedForDownload.length = 0;
      var checked = 0;
      var unChecked = 0;
      angular.forEach($scope.activeDocumentList, function (doc) {
        doc.$$Checked === true ? checked++ : unChecked++;
        if (doc.$$Checked === true) {
          $scope.itemsQueuedForDownload.push(doc);
        }
      });
      if (
        ($scope.selectAllForDownload === false && unChecked === 0) ||
        ($scope.selectAllForDownload === true && unChecked > 0)
      ) {
        $timeout(function () {
          ctrl.dontUpdateDocCheckboxes = true;
          angular.element('#selectAllDocs').triggerHandler('click');
        }, 300);
      }
    };

    //#endregion

    //#region viewing docs

    // generic 'opener' function, handles all types of docs
    $scope.viewDocument = function (doc) {
      if (doc.MimeType === 'Digital') {
        switch (doc.$$DocumentGroup) {
          case 'Consent':
            $scope.viewInformedConsent(doc);
            break;
          case 'Treatment Plans':
            $scope.viewTxPlanSnapshot(doc);
            break;
          case 'Medical History':
            $scope.viewMedHistForm(doc);
            break;
        }
      } else {
        $scope.getDocumentByDocumentId(doc.DocumentId, true);
      }
    };

    // opening 'regular' docs
    $scope.getDocumentByDocumentId = function (
      docId,
      updateRecents,
      downloadOnly
    ) {
      if ($scope.hasClinicalDocumentsViewAccess) {
        documentService.getByDocumentId(
          { documentId: docId },
          function (res) {
            var document = res.Value;
            if (document != null) {
              $scope.displayDocument(document, updateRecents, downloadOnly);
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
      }
    };

    // displaying document to user in a new tab
    $scope.displayDocument = function (doc, updateRecents, downloadOnly) {
      if (!ctrl.createDirectoryPromise) {
        ctrl.createDirectoryBeforeDownload(doc.ParentId);
      }

      ctrl.createDirectoryPromise.then(
        function () {
          var filegetUri = '_fileapiurl_/api/files/content/';
          var targetUri = filegetUri + doc.FileAllocationId;
          ctrl.window = {};
          documentsLoadingService.executeDownload(
            targetUri,
            doc,
            ctrl.window,
            downloadOnly
          );
          if (updateRecents === true) {
            ctrl.updateRecentDocuments(doc);
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
    };

    // display informedConsent
    $scope.informedConsentAccess = informedConsentFactory.access();
    $scope.viewInformedConsent = function (doc) {
      if ($scope.informedConsentAccess.View) {
        informedConsentFactory.view(doc).then(function () {
          ctrl.updateRecentDocuments(doc);
        });
      }
    };

    // opening txPlan snapshots
    $scope.viewTxPlanSnapshot = function (doc) {
      if ($scope.hasClinicalDocumentsViewAccess) {
        treatmentPlanDocumentFactory
          .GetTreatmentPlanSnapshot(doc.FileAllocationId)
          .then(function (res) {
            if (res && res.Value) {
              let patientPath = '#/Patient/';

              // storing and sending to the new tab
              localStorage.setItem(
                'document_' + res.Value.SignatureFileAllocationId,
                JSON.stringify(
                  treatmentPlanDocumentFactory.CreateSnapshotObject(res.Value)
                )
              );
              tabLauncher.launchNewTab(
                patientPath +
                  _.escape(doc.ParentId) +
                  '/PrintTreatmentPlan/' +
                  _.escape(res.Value.SignatureFileAllocationId)
              );
              ctrl.updateRecentDocuments(doc);
            }
          });
      }
    };

    // opening medical history form
    $scope.viewMedHistForm = function (doc) {
      if ($scope.hasClinicalDocumentsViewAccess) {
        let patientPath = '#/Patient/';
        tabLauncher.launchNewTab(
          patientPath +
            _.escape(doc.ParentId) +
            '/Clinical/MedicalHistoryForm/past?formAnswersId=' +
            _.escape(doc.FileAllocationId)
        );
      }
    };

    //#endregion

    //#region uploading docs

    //
    $scope.uploadFile = function () {
      patientDocumentsFactory.selectedFilter = $scope.activeDir.directory;
      $scope.openDocUploader();
      $routeParams.patientId = $scope.activeDir.patientId;
    };

    $scope.onUpLoadSuccess = function (doc) {
      if (doc) {
        var activeGroup = $filter('filter')(
          $scope.documentGroups,
          { DocumentGroupId: doc.DocumentGroupId },
          true
        );
        // set the formattedname on the document
        if ($scope.patient) {
          doc.$$FormattedName = patientLogic.GetFormattedName($scope.patient);
        }
        $scope.patient.docList.push(doc);
        $scope.setActiveDirectory(doc.ParentId, activeGroup[0].Description);
      }
      $scope.docCtrls.close();
    };

    $scope.onUpLoadCancel = function () {
      $scope.docCtrls.close();
    };

    //
    $scope.openDocUploader = function () {
      $scope.docCtrls.content(
        '<doc-uploader [patient-id]="activeDir.patientId" (upload-cancel)="onUpLoadCancel($event)" (upload-success)="onUpLoadSuccess($event)"><doc-uploader>'
      );
      $scope.docCtrls.setOptions({
        resizable: false,
        position: {
          top: '20%',
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

    //#endregion

    //#region edit docs

    // edit document properties, listening for emit, used to update item in list
    $scope.$on('soar:document-properties-edited', function () {
      if ($scope.patient) {
        $scope.getDocumentsByPatientId($scope.patient);
      }
      $scope.getRecentDocuments(true);
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

    //#region deleting docs

    // delete document
    $scope.deleteDocument = function (document) {
      modalFactory
        .ConfirmModal(
          ctrl.title,
          ctrl.message,
          ctrl.button1Text,
          ctrl.button2Text
        )
        .then(function () {
          var filegetUri = '_fileapiurl_/api/files/';
          var targetUri = filegetUri + document.FileAllocationId;
          if ($scope.hasClinicalDocumentsDeleteAccess) {
            $scope.patientCheck(document, false);
            ctrl.executeDelete(targetUri, document);
          }
        });
    };

    // delete txPlan snapshot
    $scope.deleteTxPlanSnapshot = function (document) {
      modalFactory
        .ConfirmModal(
          ctrl.title,
          ctrl.message,
          ctrl.button1Text,
          ctrl.button2Text
        )
        .then(function () {
          if ($scope.hasClinicalDocumentsDeleteAccess) {
            if (document.MimeType === 'Digital') {
              treatmentPlanDocumentFactory
                .GetSignatureFileAllocationId(document.FileAllocationId, false)
                .then(function (res) {
                  var fileAllocationId = res.Value;
                  // delete the document
                  treatmentPlanDocumentFactory
                    .DeleteTreatmentPlanDocument(document.DocumentId)
                    .then(function () {
                      // delete the blob
                      treatmentPlanDocumentFactory.DeleteTreatmentPlanDocumentBlob(
                        fileAllocationId
                      );
                      ctrl.RemoveDocumentFromList(document);
                    });
                });
            } else {
              // delete the document
              treatmentPlanDocumentFactory
                .DeleteTreatmentPlanDocument(document.DocumentId)
                .then(function () {
                  // delete the blob
                  treatmentPlanDocumentFactory.DeleteTreatmentPlanDocumentBlob(
                    document.FileAllocationId
                  );
                  ctrl.RemoveDocumentFromList(document);
                });
            }
          }
        });
    };

    $scope.patientCheck = function (document, getPatientDocs) {
      if (!$scope.patient || $scope.patient == {}) {
        patientLogic.GetPatientById(document.ParentId).then(function (res) {
          if (res && res.Value) {
            $scope.patient = res.Value;
            $scope.isOpen = true;
            $scope.isParentOpen = true;
            if (getPatientDocs) {
              // get this patients documents
              $scope.getDocumentsByPatientId($scope.patient);
            }
          }
        });
      }
    };

    ctrl.RemoveDocumentFromList = function (document) {
      var activeListindex = listHelper.findIndexByFieldValue(
        $scope.activeDocumentList,
        'DocumentId',
        document.DocumentId
      );
      if (activeListindex > -1) {
        $scope.activeDocumentList.splice(activeListindex, 1);
      }

      if ($scope.patient) {
        var patientDocsindex = listHelper.findIndexByFieldValue(
          $scope.patient.docList,
          'DocumentId',
          document.DocumentId
        );
        if (patientDocsindex > -1) {
          $scope.patient.docList.splice(patientDocsindex, 1);
        }

        if (activeListindex > -1 || patientDocsindex > -1) {
          // TODO this should be changed to just remove 1 from the appropriate count
          ctrl.setDocumentCount();
        }
      }

      $scope.filterCol();
    };

    // delete the document
    ctrl.executeDelete = function (uri, document) {
      // delete the metadata
      documentService
        .delete({ documentId: document.DocumentId }, function () {
          $scope.patientCheck(document, true);
        })
        .$promise.then(
          function () {
            // delete the blob if exists
            if (uri) {
              $http
                .delete(uri)
                .then(function (res) {
                  if (res.status == 200) {
                    toastrFactory.success(
                      localize.getLocalizedString('{0} {1}', [
                        'Document',
                        'deleted successfully.',
                      ]),
                      localize.getLocalizedString('Success')
                    );
                    ctrl.RemoveDocumentFromList(document);
                  }
                })
                .catch(function () {
                  toastrFactory.error(
                    localize.getLocalizedString('{0} {1}', [
                      'Document',
                      'failed to delete.',
                    ]),
                    localize.getLocalizedString('Server Error')
                  );
                });
            }
          },
          function (res) {
            if (
              res.status == 400 &&
              res.data.InvalidProperties[0].ValidationMessage ==
                'This entity cannot be deleted because it is being referenced by one or more other entities.'
            ) {
              toastrFactory.error(
                localize.getLocalizedString('{0} {1}', [
                  'Document',
                  'is attached to an insurance claim and cannot be deleted.',
                ]),
                localize.getLocalizedString('')
              );
            } else {
              toastrFactory.error(
                localize.getLocalizedString('{0} {1}', [
                  'Document',
                  'failed to delete.',
                ]),
                localize.getLocalizedString('Server Error')
              );
            }
          }
        );
    };

    //#endregion

    // patient has been selected using search bar, capture emited patient
    $scope.$on('patientSelected', function (e, patient) {
      $scope.patient = patient;
      $scope.patient.isOpen = true;
      $scope.getPatientDocuments(patient);
    });

    //#region delete a document

    // delete informed consent document
    $scope.deleteInformedConsent = function (documentToDelete) {
      modalFactory
        .ConfirmModal(
          ctrl.title,
          ctrl.message,
          ctrl.button1Text,
          ctrl.button2Text
        )
        .then(function () {
          if ($scope.hasClinicalDocumentsDeleteAccess) {
            // Note, for now, there is no signature file id, this is in a coming sprint
            $scope.patientCheck(document, false);
            ctrl.executeDelete(null, documentToDelete);
            // Since we are passing a null into executeDelete, we have to manually refresh
            ctrl.RemoveDocumentFromList(documentToDelete);
            toastrFactory.success(
              localize.getLocalizedString('{0} {1}', [
                'Document',
                'deleted successfully.',
              ]),
              localize.getLocalizedString('Success')
            );
          }
        });
    };

    // determine which type of deletion (this impacts what method is called)
    $scope.validateDelete = function (documentToDelete) {
      switch (documentToDelete.$$DocumentGroup) {
        case 'Treatment Plans':
          $scope.deleteTxPlanSnapshot(documentToDelete);
          break;
        case 'Consent':
          documentToDelete.MimeType === 'Digital'
            ? $scope.deleteInformedConsent(documentToDelete)
            : $scope.deleteDocument(documentToDelete);
          break;
        default:
          $scope.deleteDocument(documentToDelete);
          break;
      }
    };

    //#endregion

    //#region manage document groups

    $scope.disableDocumentGroupsButton = false;

    // view access for documentgroups
    //TODO is the correct access
    ctrl.authDocumentGroupsViewAccess = function () {
      return patSecurityService.IsAuthorizedByAbbreviation(
        'soar-sch-schidl-idlprv'
      );
    };

    // open the Document Groups modal
    $scope.openDocumentGroupsModal = function () {
      if (ctrl.authDocumentGroupsViewAccess()) {
        $scope.disableDocumentGroupsButton = true;
        // open modal
        var modalInstance = modalFactory.Modal({
          templateUrl:
            'App/BusinessCenter/document-groups/document-groups.html',
          controller: 'DocumentGroupsController',
          amfa: 'soar-clin-cplan-icadd',
          backdrop: 'static',
          keyboard: false,
          windowClass: 'center-modal .modal-dialog',
          resolve: {
            documentGroupsCallback: function () {
              return ctrl.addDocumentGroupToList;
            },
            documentGroups: function () {
              return $scope.documentGroups;
            },
          },
        });
        modalInstance.result.then(ctrl.successHandler);
      }
    };

    ctrl.addDocumentGroupToList = function (documentGroup) {
      // default parentId to null
      documentGroup.$$parentGroupId = null;
      // default document count
      documentGroup.$$DocumentCount = 0;
    };

    ctrl.successHandler = function () {
      // on close of documentGroups page
      $scope.disableDocumentGroupsButton = false;
    };

    //#endregion

    //
    ctrl.$onInit();
  },
]);
