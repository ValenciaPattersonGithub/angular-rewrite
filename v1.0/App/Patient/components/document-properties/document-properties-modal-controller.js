'use strict';
// ARWEN: #509747 No tests; doesn't appear to be used.
angular.module('Soar.Patient').controller('DocumentPropertiesModalController', [
  '$scope',
  'localize',
  'PatientServices',
  'toastrFactory',
  '$routeParams',
  'ModalFactory',
  'DocumentGroupsService',
  '$filter',
  'UserServices',
  'PatientOdontogramFactory',
  '$timeout',
  'StaticData',
  'referenceDataService',
  'PatientDocumentsFactory',
  '$http',
  'locationService',
  'patSecurityService',
  '$q',
  'PersonFactory',
  'PatientValidationFactory',
  '$uibModalInstance',
  /**
   *
   * @param {*} $scope
   * @param {*} localize
   * @param {*} patientServices
   * @param {*} toastrFactory
   * @param {*} $routeParams
   * @param {*} modalFactory
   * @param {*} documentGroupsService
   * @param {angular.IFilterService} $filter
   * @param {*} userServices
   * @param {*} patientOdontogramFactory
   * @param {angular.ITimeoutService} $timeout
   * @param {*} staticData
   * @param {{ getData: (entity: string) => angular.IPromise<any>; entityNames: Record<string, string>; }} referenceDataService
   * @param {*} patientDocumentsFactory
   * @param {angular.IHttpService} $http
   * @param {*} locationService
   * @param {*} patSecurityService
   * @param {angular.IQService} $q
   * @param {*} personFactory
   * @param {*} patientValidationFactory
   * @param {*} $uibModalInstance
   */
  function (
    $scope,
    localize,
    patientServices,
    toastrFactory,
    $routeParams,
    modalFactory,
    documentGroupsService,
    $filter,
    userServices,
    patientOdontogramFactory,
    $timeout,
    staticData,
    referenceDataService,
    patientDocumentsFactory,
    $http,
    locationService,
    patSecurityService,
    $q,
    personFactory,
    patientValidationFactory,
    $uibModalInstance
  ) {
    var ctrl = this;
    $scope.patTeeth = null;
    $scope.patientDisabled = false;
    $scope.groupTypeDisabled = false;
    ctrl.isQueryingServer = false;
    $scope.disablePersonSearch = true;
    $scope.dataHasChanged = false;
    $scope.documentError = false;
    $scope.showPatientLocationError = false;
    $scope.formIsValid = true;
    $scope.isViewingInModal = false;

    if ($scope.$resolve) {
      $scope.isViewingInModal = true;
      $scope.documentId = $scope.$resolve.documentId;
      $scope.formattedPatientName = $scope.$resolve.formattedPatientName;
    }

    ctrl.$onInit = function () {
      $scope.activeTeeth = [];
      ctrl.kendoWindowId = '#docCtrlsWindow';
      ctrl.getDocument();
      // Load the other kendo elements first on pages with multiple Kendo objects
      $timeout(function () {
        $scope.loadKendoWidgets = true;
      });
      ctrl.initializeSearch();
    };

    ctrl.initializeSearch = function () {
      // Empty string for search
      $scope.searchTerm = $scope.formattedPatientName;
      //current searchString
      $scope.searchString = $scope.formattedPatientName;
      // Set the default search variables
      ctrl.resultCount = 0;
      // to hold result list
      $scope.searchResults = [];
      // Search timeout queue
      $scope.searchTimeout = null;
    };

    // clear the referred bu person
    $scope.clearPerson = function () {
      ctrl.initializeSearch();
    };

    $scope.KeyPressed = function (keyEvent) {
      var inActivekeyCodeLst = [
        43,
        47,
        92,
        63,
        62,
        60,
        58,
        42,
        34,
        44,
        59,
        61,
        91,
        93,
        124,
      ];
      if (inActivekeyCodeLst.includes(keyEvent.keyCode)) {
        event.preventDefault();
      } else {
        return false;
      }
    };

    //#region helpers

    // k-change on kendo-multi-select uses this to keep activeTeeth updated
    $scope.activeTeethUpdated = function (e) {
      $scope.activeTeeth = this.value();
      $scope.$apply();
    };

    // set select options for kendo-multi-select
    $scope.teethSelectOptions = {
      placeholder: 'Select teeth...',
      dataSource: $scope.patTeeth,
      dataTextField: 'USNumber',
      dataValueField: 'USNumber',
      valuePrimitive: true,
      autoBind: false,
    };

    // get teeth definitions from local storage
    ctrl.getTeethDefinitions = function () {
      staticData.TeethDefinitions().then(function (res) {
        if (res && res.Value && res.Value.Teeth) {
          $scope.patTeeth = new kendo.data.DataSource({
            data: res.Value.Teeth,
          });
        }
      });
    };
    ctrl.getTeethDefinitions();

    //#endregion

    //#region get document

    // calling the api
    ctrl.getDocument = function () {
      patientServices.Documents.get(
        { DocumentId: $scope.documentId },
        ctrl.documentGetSuccess,
        ctrl.documentGetFailure
      );
    };

    // success handler
    ctrl.documentGetSuccess = function (res) {
      if (res && res.Value) {
        referenceDataService
          .getData(referenceDataService.entityNames.users)
          .then(function (users) {
            var user = _.find(users, { UserId: res.Value.UploadedByUserId });
            if (!_.isNil(user)) {
              // Commented out to call filer in controller, when switching to one-way binding for this value.
              //$scope.uploadedByUser = user;
              $scope.uploadedByUser = $filter(
                'getPatientNameAsPerBestPractice'
              )(user);
            }
            $scope.document = res.Value;
            // convert utc date to local
            if ($scope.document.DateUploaded) {
              var gmtDateTime = moment.utc(
                $scope.document.DateUploaded,
                'YYYY-MM-DD HH'
              );
              // Commented out to call filer in controller, when switching to one-way binding for this value.
              //$scope.displayDate = gmtDateTime.local().format('YYYY-MMM-DD h:mm A');
              $scope.displayDateUtc = gmtDateTime.local().format('MM/DD/YYYY');
            }

            if ($scope.document.ToothNumbers != null) {
              $scope.activeTeeth = $scope.document.ToothNumbers;
            }
            if ($scope.document.NumberOfBytes >= 1048576) {
              $scope.document.$$DocumentSize =
                $filter('number')($scope.document.NumberOfBytes / 1048576, 1) +
                ' MB';
            } else if (
              $scope.document.NumberOfBytes >= 1024 &&
              $scope.document.NumberOfBytes < 1048576
            ) {
              $scope.document.$$DocumentSize =
                $filter('number')($scope.document.NumberOfBytes / 1024, 1) +
                ' KB';
            } else {
              $scope.document.$$DocumentSize =
                $scope.document.NumberOfBytes + ' Bytes';
            }
            // used for comparison to determine whether or not to show the discard warning message
            $scope.originalDocument = angular.copy($scope.document);

            ctrl.getDocumentGroups();
          });
      }
    };

    // failure handler
    ctrl.documentGetFailure = function () {
      toastrFactory.error(
        localize.getLocalizedString('{0} {1}', ['Document', 'failed to load.']),
        localize.getLocalizedString('Server Error')
      );
    };

    //#endregion

    //#region get document groups

    // calling the api
    ctrl.getDocumentGroups = function () {
      documentGroupsService.get().$promise.then(function (res) {
        if (res && res.Value) {
          // filter by alphabetical order.
          var displayInOrder = $filter('orderBy')(
            res.Value,
            ['Description'],
            false
          );
          //Hiding 'Treatment Plans' if the document's MimeType is Digital
          //  because Digital files cannot be moved to the Treatment Plans document group
          if ($scope.document.MimeType === 'Digital') {
            $scope.documentGroups = $filter('filter')(
              displayInOrder,
              function (item) {
                return item.Description !== 'Treatment Plans';
              }
            );
          } else {
            $scope.documentGroups = displayInOrder;
          }

          $scope.docGroupChanged($scope.document.DocumentGroupId);
        }
      });
    };

    //#endregion

    //#region update document

    // calling the api
    ctrl.updateDocument = function () {
      $scope.document.Name = $scope.document.Name.replace('’', "'");
      patientServices.Documents.update(
        $scope.document,
        ctrl.documentUpdateSuccess,
        ctrl.documentUpdateFailure
      );
    };

    // success handler
    ctrl.documentUpdateSuccess = function (res) {
      if (res && res.Value) {
        $scope.document = res.Value;
        $scope.dataHasChanged = false;
        $scope.originalDocument = angular.copy($scope.document);
        $scope.close();
        toastrFactory.success(
          localize.getLocalizedString(
            'The document properties has been saved.'
          ),
          localize.getLocalizedString('Success')
        );
        $scope.$emit('soar:document-properties-edited', $scope.document);
      }
    };

    // failure handler
    ctrl.documentUpdateFailure = function () {
      toastrFactory.error(
        localize.getLocalizedString('{0} {1}', [
          'Document',
          'failed to update.',
        ]),
        localize.getLocalizedString('Server Error')
      );
    };

    //#endregion

    //#region view

    // warning modal logic
    ctrl.showWarningModal = function (window) {
      modalFactory.WarningModal().then(function (result) {
        if (result === true) {
          $scope.document = angular.copy($scope.originalDocument);
          $scope.dataHasChanged = false;
          $scope.close();
        } else {
          // show the window again if they choose to not discard changes
          window.open();
        }
      });
    };

    // used by cancel button to close kendo window
    $scope.close = function () {
      var window = angular.element(ctrl.kendoWindowId).data('kendoWindow');
      if (window) {
        if ($scope.dataHasChanged === false) {
          window.close();
          $scope.$emit('soar:edit-document-properties', null, false);
        } else {
          ctrl.showWarningModal(window);
          // just hiding it while discard modal is open, trying to not have modals on top of modals
          window.close();
        }
      }
      if ($scope.isViewingInModal) {
        $uibModalInstance.close();
      }
    };

    ctrl.authEditAccessToDocuments = function () {
      return patSecurityService.IsAuthorizedByAbbreviation(
        'soar-doc-docimp-edit'
      );
    };

    // calling update api
    $scope.save = function () {
      ctrl.validateDocument();
      if ($scope.formIsValid === true) {
        // if patient has changed we need to first update the file with the DirectoryAllocationId
        // then update the document, otherwise just update the doc
        if ($scope.document.ParentId !== $scope.originalDocument.ParentId) {
          patientDocumentsFactory
            .UpdateDirectoryAllocationId($scope.document)
            .then(function () {
              ctrl.updateDocument();
            });
        } else {
          ctrl.updateDocument();
        }
        if ($scope.isViewingInModal) {
          $uibModalInstance.close();
        }
      }
    };

    // used to display only the file type in the ui
    $scope.displayMimeType = function (mimeType) {
      if (mimeType && mimeType.indexOf('/') !== -1) {
        mimeType = mimeType.slice(mimeType.indexOf('/') + 1);
      }
      return mimeType;
    };

    //#region patient selected

    // Update document.ParentId to the PatientId from item to assign the document to another user
    ctrl.changePatientOnDocument = function (item) {
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
    };

    //#endregion

    ctrl.getMatchingDocumentGroupDescription = function (documentGroupId) {
      return $filter('filter')($scope.documentGroups, {
        DocumentGroupId: documentGroupId,
      })[0].Description;
    };

    // Disable patient select list when the document group is EOB / Informed Consent
    $scope.docGroupChanged = function (value) {
      var docGroup = ctrl.getMatchingDocumentGroupDescription(value);
      switch (docGroup) {
        case 'EOB':
          $scope.patientDisabled = true;
          break;
        case 'Consent':
          $scope.patientDisabled = true;
          $scope.groupTypeDisabled = true;
          break;
        case 'Medical History':
          $scope.patientDisabled = true;
          break;

        default:
          $scope.patientDisabled = false;
          $scope.groupTypeDisabled = false;
      }
    };

    ctrl.validateDocument = function () {
      $scope.formIsValid = true;
      if (_.isNil($scope.document.Name) || _.isEmpty($scope.document.Name)) {
        $scope.formIsValid = false;
      }
      if (_.isNil($scope.document.DocumentGroupId)) {
        $scope.formIsValid = false;
      }
      if (
        _.isNil($scope.document.ParentId) ||
        _.isEmpty($scope.document.ParentId)
      ) {
        $scope.formIsValid = false;
      }
    };

    ctrl.checkChanges = function () {
      $scope.dataHasChanged = false;
      if ($scope.originalDocument && $scope.document) {
        if (
          $scope.originalDocument.DocumentGroupId !==
          $scope.document.DocumentGroupId
        ) {
          $scope.dataHasChanged = true;
        }
        if ($scope.originalDocument.ParentId !== $scope.document.ParentId) {
          $scope.dataHasChanged = true;
        }
        if ($scope.originalDocument.Name !== $scope.document.Name) {
          $scope.dataHasChanged = true;
        }
        if (
          JSON.stringify($scope.originalDocument.ToothNumbers) !=
          JSON.stringify($scope.document.ToothNumbers)
        ) {
          $scope.dataHasChanged = true;
        }
      }
    };

    // debugging purposes
    $scope.$watch(
      'document',
      function (nv) {
        if (nv) {
          ctrl.checkChanges();
        }
      },
      true
    );

    //#region search for patient

    ctrl.validateSearchString = function (searchString) {
      // if format XXX- allow search
      var validPhoneRegex = new RegExp(/^[0-9]{3}?\-$/);
      if (validPhoneRegex.test(searchString)) {
        return true;
      }

      // if format X or XX or XXX prevent search
      var phoneRegex = new RegExp(/^[0-9]{1,3}?$/);
      if (phoneRegex.test(searchString)) {
        return false;
      }

      // if format XX- or XX/ allow search
      var validDateRegex = new RegExp(/^[0-9]{1,2}?\-?$/);
      if (validDateRegex.test(searchString)) {
        return true;
      }

      // if format XX- or XX/ allow search
      var dateRegex = new RegExp(/^[0-9]{1,2}?\/?$/);
      if (dateRegex.test(searchString)) {
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
      $scope.searchResults = $scope.searchResults.concat(res.Value);
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
  },
]);
