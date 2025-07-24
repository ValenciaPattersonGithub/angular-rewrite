'use strict';
//TODO this is for move multiple patient documents
var app = angular.module('Soar.Patient');
app.controller('MoveDocumentsController', [
  '$scope',
  '$location',
  'localize',
  'PatientServices',
  'toastrFactory',
  '$sce',
  '$http',
  '$window',
  '$routeParams',
  '$timeout',
  'PatientDocumentsFactory',
  'ModalFactory',
  '$rootScope',
  '$resource',
  'PatientLogic',
  'PersonFactory',
  'PatientValidationFactory',
  'locationService',
  '$uibModal',
  '$uibModalInstance',
  'patientData',
  'documents',
  MoveDocumentsController,
]);

function MoveDocumentsController(
  $scope,
  $location,
  localize,
  patientServices,
  toastrFactory,
  $sce,
  $http,
  $window,
  $routeParams,
  $timeout,
  patientDocumentsFactory,
  modalFactory,
  $rootScope,
  $resource,
  patientLogic,
  personFactory,
  patientValidationFactory,
  locationService,
  $uibModal,
  $uibModalInstance,
  patientData,
  documents
) {
  BaseCtrl.call(this, $scope, 'MoveDocumentsController');

  var ctrl = this;
  ctrl.loadingFlag = false;
  ctrl.selectedFlag = true;
  ctrl.disableSall = false;
  $scope.documents = [];
  ctrl.isQueryingServer = false;
  ctrl.initializeSearch = function () {
    // Empty string for search
    $scope.searchTerm = '';
    //current searchString
    $scope.searchString = '';
    // Set the default search variables
    ctrl.resultCount = 0;
    // to hold result list
    $scope.searchResults = [];
    // Search timeout queue
    $scope.searchTimeout = null;
    //delete selected patient object
    $scope.selectedPatientObj = {};
    //disable id move to not selected
    ctrl.moveFlag = true;
  };

  // clear the referred bu person
  $scope.clearPerson = function () {
    ctrl.initializeSearch();
  };
  ctrl.initializeSearch();
  //inidtai sort
  // Setup the sort columns and set the default
  $scope.orderBy = {
    field: '-DateUploaded',
    asc: false,
    sortCounter: 0,
  };
  // uibModalInstance.
  ctrl.cancel = function () {
    $uibModalInstance.dismiss('cancel');
  };
  ctrl.close = function () {
    $uibModalInstance.close('close');
  };
  _.each(documents, function (item) {
    if (item.hasOwnProperty('selected')) {
      item.selected = false;
    }
  });
  _.find(documents, function (doc) {
    if (
      !(
        doc.$$DocumentGroup == 'Treatment Plans' ||
        doc.$$DocumentGroup == 'Medical History' ||
        doc.MimeType == 'Digital' ||
        doc.$$DocumentGroup == 'Consent'
      )
    ) {
      return (ctrl.disableSall = true);
    }
  });
  $scope.documents = documents;
  ctrl.patientData = patientData;
  //select/deselect function

  $scope.Selected = {
    all: false,
  };
  $scope.toggleSelect = function (selected, id) {
    //if sending or not
    if (ctrl.loadingFlag === false) {
      //single row
      if (id) {
        $scope.Selected.all = true;
        ctrl.selectedFlag = true;
        _.find($scope.documents, function (item) {
          if (item.FileAllocationId === id) {
            item.selected = selected;
          }
          if (
            !item.selected &&
            !(
              item.$$DocumentGroup == 'Treatment Plans' ||
              item.$$DocumentGroup == 'Medical History' ||
              item.MimeType == 'Digital' ||
              item.$$DocumentGroup == 'Consent'
            )
          ) {
            $scope.Selected.all = false;
            return true;
          }
        });
        _.find($scope.documents, function (item) {
          if (
            item.selected &&
            !(
              item.$$DocumentGroup == 'Treatment Plans' ||
              item.$$DocumentGroup == 'Medical History' ||
              item.MimeType == 'Digital' ||
              item.$$DocumentGroup == 'Consent'
            )
          ) {
            ctrl.selectedFlag = false;
            return true;
          }
        });
      }
      //all
      else {
        if (selected) {
          _.each($scope.documents, function (item) {
            if (
              !(
                item.$$DocumentGroup == 'Treatment Plans' ||
                item.$$DocumentGroup == 'Medical History' ||
                item.MimeType == 'Digital' ||
                item.$$DocumentGroup == 'Consent'
              )
            ) {
              item.selected = true;
              ctrl.selectedFlag = false;
            }
          });
        } else {
          _.each($scope.documents, function (item) {
            item.selected = false;
            ctrl.selectedFlag = true;
          });
        }
      }
    }
  };
  //sort modal move documents
  $scope.sortDocumentsForModal = function (sortColumn) {
    $scope.orderBy.field = sortColumn;
  };

  // Update document.ParentId to the PatientId from item to assign the document to another user
  ctrl.changePatientOnDocument = function (item) {
    ctrl.moveFlag = false;
    $scope.selectedPatientObj = {};
    $scope.document.ParentId = item.PatientId;
    $scope.document.$$DirectoryAllocationId = item.DirectoryAllocationId;
    var currentLocation = locationService.getCurrentLocation();
    $scope.document.$$LocationId = currentLocation.id;
    $scope.searchTerm =
      item.FirstName +
      ' ' +
      item.LastName +
      '          ' +
      '(' +
      item.PatientCode +
      ')';
    $scope.selectedPatientObj = item;
    var fullName = item.FirstName + ' ';
    if (item.MiddleName) {
      fullName = fullName + item.MiddleName + ' ' + item.LastName;
    } else {
      fullName = fullName + ' ' + item.LastName;
    }
    if (item.Suffix) {
      fullName = fullName + ' ' + item.Suffix;
    }
    $scope.selectedPatientObj.patientName = fullName;
    $scope.disablePersonSearch = true;
  };

  ctrl.validateSelectedPatient = function (person) {
    if (person && person.PatientId) {
      patientValidationFactory
        .PatientSearchValidation(person)
        .then(function (res) {
          var patientInfo = res;
          if (
            !patientInfo.authorization
              .UserIsAuthorizedToAtLeastOnePatientLocation
          ) {
            //patientValidationFactory.LaunchPatientLocationErrorModal(patientInfo);
            $scope.showPatientLocationError = true;
          } else {
            ctrl.changePatientOnDocument(person);
          }
        });
    }

    return true;
  };

  $scope.onSelectPatient = function (item) {
    if ($scope.searchResults.length > 0 && item) {
      // display the selected searchTerm then validate
      $scope.searchTerm =
        item.FirstName +
        ' ' +
        item.LastName +
        '          ' +
        '(' +
        item.PatientCode +
        ')';
      ctrl.validateSelectedPatient(item);
    }
  };

  //#region search for patient
  ctrl.validateSearchString = function (searchString) {
    // if format XXX- allow search
    var validNumberRegex = new RegExp(/^[0-9]{3}?\-$/);
    if (validNumberRegex.test(searchString)) {
      return true;
    }

    // if format X or XX or XXX prevent search
    var formatRegex = new RegExp(/^[0-9]{1,3}?$/);
    if (formatRegex.test(searchString)) {
      return false;
    }

    // if format XX- or XX/ allow search
    var validCharacterRegex = new RegExp(/^[0-9]{1,2}?\-?$/);
    if (validCharacterRegex.test(searchString)) {
      return true;
    }

    // if format XX- or XX/ allow search
    var specialCharRegex = new RegExp(/^[0-9]{1,2}?\/?$/);
    if (specialCharRegex.test(searchString)) {
      return true;
    }
    return true;
  };

  // Watch the input (should we wait for so many characters)
  $scope.$watch('searchTerm', function (nv, ov) {
    if (nv && nv.length > 2 && nv != ov) {
      if (ctrl.validateSearchString(nv)) {
        if (ctrl.searchTimeout) {
          $timeout.cancel(ctrl.searchTimeout);
        }
        ctrl.searchTimeout = $timeout(function () {
          ctrl.activateSearch(nv);
        }, 500);
      }
    } else if (ov && ov.length > 0 && nv != ov) {
      if (ctrl.validateSearchString(nv)) {
        if (ctrl.searchTimeout) {
          $timeout.cancel(ctrl.searchTimeout);
        }
        ctrl.searchTimeout = $timeout(function () {
          ctrl.activateSearch(nv);
        }, 500);
      }
    }
  });

  // Perform the search
  $scope.search = function (term) {
    if (_.isNil(term)) {
      // Don't search if not needed!
      if (
        ctrl.isQueryingServer ||
        (ctrl.resultCount > 0 &&
          $scope.searchResults.length == ctrl.resultCount) ||
        $scope.searchString.length === 0
      ) {
        return;
      }

      // set variable to indicate status of search
      ctrl.isQueryingServer = true;

      var searchParams = {
        searchFor: $scope.searchString,
        skip: $scope.searchResults.length,
        take: 45,
        sortBy: 'LastName',
        includeInactive: ctrl.includeInactive,
        excludePatient: $scope.document.ParentId,
      };

      personFactory.PatientSearch(searchParams).then(
        function (res) {
          ctrl.onSearchSuccess(res);
        },
        function () {
          ctrl.onSearchError();
        }
      );
    }
  };

  ctrl.onSearchSuccess = function (res) {
    ctrl.isQueryingServer = false;
    ctrl.resultCount = res.Count;
    var searchData = [];
    _.each(res.Value, function (item) {
      if (ctrl.patientData.pData.PatientId != item.PatientId) {
        searchData.push(item);
      }
    });
    $scope.searchResults = $scope.searchResults.concat(searchData);
    $scope.noSearchResults = ctrl.resultCount === 0;
  };

  $scope.onSearchError = function () {
    ctrl.isQueryingServer = false;
    ctrl.resultCount = 0;
    $scope.searchResults = [];
    $scope.noSearchResults = true;
  };

  // notify of searchstring change
  ctrl.activateSearch = function (searchTerm) {
    if ($scope.searchString != searchTerm) {
      $scope.limit = 15;
      $scope.limitResults = true;
      $scope.searchString = searchTerm;
      ctrl.resultCount = 0;
      $scope.searchResults = [];
      $scope.search();
    }
  };

  // clear the selected
  $scope.clearResult = function () {
    //$scope.document.ParentId = null;
    $scope.formattedPatientName = '';
    ctrl.initializeSearch();
    $scope.disablePersonSearch = false;
    $scope.showPatientLocationError = false;
    $timeout(function () {
      angular.element('#typeAheadPersonSearch').focus();
    }, 200);
  };

  //#endregion

  //moving documents function
  $scope.moveDocuments = function (docs) {
    ctrl.confirmModal(docs);
  };

  ctrl.confirmModal = function (documents) {
    var message = localize.getLocalizedString(
      'Are you sure you would like to move these documents?'
    );
    var title = localize.getLocalizedString('');
    var button2Text = localize.getLocalizedString('No');
    var button1Text = localize.getLocalizedString('Yes');
    modalFactory
      .ConfirmModal(title, message, button1Text, button2Text)
      .then(function () {
        ctrl.sendMoveDocs(documents);
      });
  };

  ctrl.sendMoveDocs = function (docs) {
    // if patient has changed we need to first update the file with the DirectoryAllocationId
    // then update the document, otherwise just update the doc
    // if ($scope.document.ParentId !== $scope.originalDocument.ParentId) {
    ctrl.loadingFlag = true;
    var selectedList = [];
    // PatientId
    var currentLocation = locationService.getCurrentLocation();
    var LocationId = currentLocation.id;
    _.each(docs, function (doc) {
      if (doc.selected) {
        // previous patient id
        doc.existingParentId = doc.ParentId;
        selectedList.push(doc);
        doc.$$LocationId = LocationId;
        doc.$$DirectoryAllocationId =
          $scope.selectedPatientObj.DirectoryAllocationId;
        doc.ParentId = $scope.selectedPatientObj.PatientId;
        patientServices.Documents.update(doc).$promise.then(
          function (res) {},
          function (err) {
            ctrl.loadingFlag = false;
            toastrFactory.error(
              localize.getLocalizedString('{0} {1}', [
                'Documents',
                'failed to load.',
              ]),
              localize.getLocalizedString('Server Error')
            );
          }
        );
        patientDocumentsFactory.UpdateDirectoryAllocationId(doc).then(
          function () {
            $timeout(function () {
              if (ctrl.loadingFlag) {
                toastrFactory.success(
                  localize.getLocalizedString('Documents moved successfully'),
                  localize.getLocalizedString('Success')
                );
              }
              ctrl.loadingFlag = false;
            }, 2000);
          },
          function (err) {
            ctrl.loadingFlag = false;
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
    });
    //service for move documents activity log
    if (selectedList.length > 0) {
      selectedList[0].Description = selectedList[0].existingParentId;
      patientServices.Documents.addActivity(selectedList).$promise.then(
        function (res) {
          $rootScope.$emit('CallParentMethodFPA', {});
          ctrl.loadingFlag = false;
          toastrFactory.success(
            localize.getLocalizedString('Documents moved successfully'),
            localize.getLocalizedString('Success')
          );
          ctrl.close();
        },
        function (err) {
          ctrl.loadingFlag = false;
        }
      );
    }
  };
}
