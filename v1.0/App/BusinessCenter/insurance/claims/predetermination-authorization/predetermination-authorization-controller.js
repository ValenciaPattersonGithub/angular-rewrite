'use strict';

angular
  .module('Soar.Patient')
  .controller('PredeterminationAuthorizationController', [
    '$scope',
    '$location',
    '$routeParams',
    'localize',
    'toastrFactory',
    'ModalFactory',
    'ClaimsService',
    'DocumentsLoadingService',
    'DocumentService',
    'PatientDocumentsFactory',
    'TreatmentPlansFactory',
    function (
      $scope,
      $location,
      $routeParams,
      localize,
      toastrFactory,
      modalFactory,
      claimsService,
      documentsLoadingService,
      documentService,
      patientDocumentsFactory,
      treatmentPlansFactory
    ) {
      //On Initialize:
      //1. Get Claim From ClaimAPI then
      //2. Get Predetermination Document Metadata - need docid from ClaimEntity and patientid from Claim

      var ctrl = this;
      $scope.preDMetadata = [];
      $scope.pdaChkBox = true;
      $scope.isValid = true;
      $scope.openDocUploader = {};

      //flag to determine if we show warning modal from DiscardService
      $scope.userHasEnteredData = false;

      //Breadcrumbs
      ctrl.updateBreadCrumbs = function () {
        $scope.dataForCrudOperation = {};
        $scope.dataForCrudOperation.DataHasChanged = false;
        $scope.dataForCrudOperation.BreadCrumbs = [
          {
            name: localize.getLocalizedString('Claims & Predeterminations'),
            path: 'BusinessCenter/Insurance/Claims',
          },
          {
            name: $scope.claim.IsReceived
              ? localize.getLocalizedString('View Carrier Response')
              : localize.getLocalizedString('Enter Carrier Response'),
          },
        ];
      };

      //Service Calls
      ctrl.getClaimSuccess = function (response) {
        $scope.claim = response.Value;
        ctrl.updateBreadCrumbs();
        ctrl.createDisplayedPatientName();
        ctrl.getPredeterminationMetadata();
      };

      ctrl.getPredeterminationMetadata = function () {
        if ($scope.claim.DocumentId) {
          documentService.getByDocumentId(
            { documentId: $scope.claim.DocumentId },
            ctrl.getPredeterminationMetadataSuccess,
            ctrl.failure('retrieving predetermination document metadata')
          );
        }
      };

      ctrl.getPredeterminationMetadataSuccess = function (res) {
        $scope.preDMetadata = res.Value;
      };

      //Update/Save
      $scope.saveCarrierResponse = function () {
        if (
          $scope.isValid &&
          !$scope.claim.AnyServicesCheckedOut &&
          $scope.claim.Status !== 7 &&
          $scope.claim.Status !== 8
        ) {
          claimsService.updateCarrierResponse(
            $scope.claim,
            ctrl.saveCarrierResponseSuccess,
            ctrl.failure('saving carrier response')
          );
        }
      };

      ctrl.saveCarrierResponseSuccess = function () {
        $scope.userHasEnteredData = false;
        treatmentPlansFactory.ClearCache();
        toastrFactory.success(
          localize.getLocalizedString('{0} saved successfully.', [
            'Carrier response',
          ]),
          'Success'
        );
        if ($scope.pdaChkBox) {
          ctrl.closeClaim();
        } else {
          $scope.cancelCarrierResponse();
        }
      };

      ctrl.closeClaim = function () {
        // open close predetermination are you sure modal
        var closePredeterminationObject = {
          ClaimId: $routeParams.claimId,
          Note: null,
          NoInsurancePayment: true,
          RecreateClaim: false,
          CloseClaimAdjustment: null,
          UpdateServiceTransactions: true,
        };
        modalFactory
          .Modal({
            templateUrl:
              'App/BusinessCenter/insurance/claims/claims-management/close-predetermination-modal/close-predetermination-modal.html',
            backdrop: 'static',
            keyboard: false,
            size: 'lg',
            windowClass: 'center-modal',
            controller: 'ClosePredeterminationModalController',
            amfa: 'soar-acct-insinf-view',
            resolve: {
              closePredeterminationObject: function () {
                return closePredeterminationObject;
              },
            },
          })
          .result.then(ctrl.closeClaimSuccess, ctrl.closeClaimSuccess);
      };

      ctrl.closeClaimSuccess = function () {
        $scope.cancelCarrierResponse();
      };

      $scope.cancelCarrierResponse = function () {
        $location.path(
          _.escape($scope.dataForCrudOperation.BreadCrumbs[0].path)
        );
      };

      ctrl.failure = function (action) {
        return function () {
          toastrFactory.error(
            localize.getLocalizedString('An error has occurred while {0}', [
              action,
            ]),
            localize.getLocalizedString('Error')
          );
        };
      };

      //Column Sorting
      $scope.changeSorting = function (elemId, field) {
        ctrl.lastElement.removeClass('active');
        ctrl.lastElement.find('span').removeClass('fa-caret-up');
        ctrl.lastElement.find('span').removeClass('fa-caret-down');
        ctrl.lastElement.find('span').addClass('fa-sort');

        var asc = $scope.sortProp.field === field ? !$scope.sortProp.asc : true;
        $scope.sortProp = {
          field: field,
          asc: asc,
        };

        var elem = angular.element('#' + elemId).addClass('active');
        elem.find('span').removeClass('fa-sort');
        elem.find('span').addClass(asc ? 'fa-caret-down' : 'fa-caret-up');
        ctrl.lastElement = elem;
      };

      ctrl.createDisplayedPatientName = function () {
        $scope.displayedPatientName =
          localize.getLocalizedString('for') +
          ' ' +
          $scope.claim.PatientLastName;
        if ($scope.claim.PatientSuffix) {
          $scope.displayedPatientName += ' ' + $scope.claim.PatientSuffix;
        }

        $scope.displayedPatientName +=
          ', ' + $scope.claim.PatientFirstName + ' ';
        if ($scope.claim.PatientMiddleName) {
          $scope.displayedPatientName += $scope.claim.PatientMiddleName[0];
        }

        if ($scope.claim.PatientPreferredName) {
          $scope.displayedPatientName +=
            '(' + $scope.claim.PatientPreferredName + ')';
        }
      };

      //Page Initialization
      ctrl.init = function () {
        ctrl.claimId = $routeParams.claimId;
        $scope.sortProp = {
          field: 'Charges',
          asc: false,
        };

        //Sorting Setup
        $scope.multiSortProp = [
          'claim.Charges',
          '-ClaimCommon.PatientLastName',
        ];
        ctrl.lastElement = angular
          .element('#colModifiedDate')
          .addClass('active');
        ctrl.lastElement.find('span').addClass('fa-caret-down');
        ctrl.lastElement.find('span').removeClass('fa-sort');

        //Startup Service Calls
        modalFactory.LoadingModal(ctrl.pageDataCallSetup);
      };

      ctrl.pageDataCallSetup = function () {
        var services = [];
        var getSingleClaim = {
          Call: claimsService.getCarrierResponseByClaimId,
          Params: {
            claimId: ctrl.claimId,
          },
          OnSuccess: ctrl.getClaimSuccess,
          OnError: ctrl.failure('retrieving claim data'),
        };
        services.push(getSingleClaim);
        return services;
      };

      ctrl.init();

      $scope.onUpLoadSuccess = function (doc) {
        $scope.preDMetadata = doc;
        $scope.claim.IsReceived = true;
        $scope.claim.DocumentId = doc.DocumentId;
        claimsService.updateClaimEntityDocumentId(
          {
            claimEntityId: $scope.claim.ClaimId,
            documentId: $scope.claim.DocumentId,
          },
          function (result) {
            // console.log(result)
          },
          function (error) {
            toastrFactory.error(
              localize.getLocalizedString('An error occured uploading EOB.'),
              localize.getLocalizedString('Error')
            );
          }
        );
        $scope.docCtrls.close();
      };

      $scope.onUpLoadCancel = function () {
        $scope.docCtrls.close();
      };

      //
      $scope.openDocUploader = function () {
        $scope.docCtrls.content(
          '<doc-uploader [patient-id]="claim.PatientId" (upload-cancel)="onUpLoadCancel($event)" (upload-success)="onUpLoadSuccess($event)"><doc-uploader>'
        );
        $scope.docCtrls.setOptions({
          resizable: false,
          position: {
            top: '35%',
            left: '35%',
          },
          minWidth: 300,
          scrollable: false,
          iframe: false,
          actions: ['Close'],
          title: 'Upload a document',
          modal: true,
        });
        patientDocumentsFactory.selectedFilter = 'EOB';
        $scope.docCtrls.open();
      };

      $scope.viewPredeterminationDocument = function () {
        var filegetUri = '_fileapiurl_/api/files/content/';
        var targetUri = filegetUri + $scope.preDMetadata.FileAllocationId;
        documentsLoadingService.executeDownload(
          targetUri,
          $scope.preDMetadata,
          {}
        );
      };

      $scope.changeUserDataEntryFlag = function () {
        $scope.userHasEnteredData = true;
      };

      $scope.responseAmountChange = function () {
        $scope.userHasEnteredData = true;
        $scope.isValid = $scope.validate();
      };
      $scope.validate = function () {
        var valid = true;
        angular.forEach($scope.claim.CarrierResponseDetail, function (service) {
          if (
            service.ResponseAmount &&
            service.ResponseAmount > service.Charges
          ) {
            valid = false;
          }
        });
        return valid;
      };

      $scope.resetData = function () {
        $scope.userHasEnteredData = false;
      };
    },
  ]);
