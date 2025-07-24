'use strict';

angular.module('Soar.Patient').controller('EncounterClaimsController', [
  '$scope',
  '$rootScope',
  '$window',
  '$location',
  '$sce',
  '$q',
  '$filter',
  'localize',
  'ListHelper',
  'toastrFactory',
  'TimeZoneFactory',
  'ModalFactory',
  'CommonServices',
  'patSecurityService',
  'referenceDataService',
  'NewAdjustmentTypesService',
  'LocationServices',
  /**
   *
   * @param {*} $scope
   * @param {angular.IRootScopeService} $rootScope
   * @param {angular.IWindowService} $window
   * @param {angular.ILocationService} $location
   * @param {angular.ISCEService} $sce
   * @param {angular.IQService} $q
   * @param {angular.IFilterService} $filter
   * @param {*} localize
   * @param {*} listHelper
   * @param {*} toastrFactory
   * @param {*} timeZoneFactory
   * @param {*} modalFactory
   * @param {*} commonServices
   * @param {*} patSecurityService
   * @param {{ getData: (entity: string) => angular.IPromise<any>; entityNames: Record<string, string>; }} referenceDataService
   * @param {*} adjustmentTypesService
   * @param {*} locationServices
   */
  function (
    $scope,
    $rootScope,
    $window,
    $location,
    $sce,
    $q,
    $filter,
    localize,
    listHelper,
    toastrFactory,
    timeZoneFactory,
    modalFactory,
    commonServices,
    patSecurityService,
    referenceDataService,
    adjustmentTypesService,
    locationServices
  ) {
    var ctrl = this;
    ctrl.adjustmentTypes = [];
    ctrl.filteredProviders = [];
    ctrl.locations = [];
    ctrl.hasViewOrEditAccessToServiceTransaction = false;

    $scope.soarAuthSvcTrViewKey = 'soar-acct-actsrv-view';
    $scope.soarAuthEditTrViewKey = 'soar-acct-dbttrx-view';

    $scope.optionTitle =
      !_.isUndefined($scope.encounterClaimsList) &&
      _.isEqual($scope.encounterClaimsList.length, 1) &&
      $scope.encounterClaimsList[0].Type === 2
        ? localize.getLocalizedString('View Predetermination: ')
        : localize.getLocalizedString('View Claim: ');
    $scope.isClaimsMenuOpen = false;

    $scope.claimStatus = function (status) {
      var claimStat = null;
      switch (status) {
        case 0:
          claimStat = 'None';
          return claimStat;
        case 1:
          claimStat = 'Unsubmitted Paper';
          return claimStat;
        case 2:
          claimStat = 'Printed';
          return claimStat;
        case 3:
          claimStat = 'Unsubmitted Electronic';
          return claimStat;
        case 4:
          claimStat = 'In Process';
          return claimStat;
        case 5:
          claimStat = 'Accepted Electronic';
          return claimStat;
        case 6:
          claimStat = 'Rejected';
          return claimStat;
        case 7:
          claimStat = 'Closed';
          return claimStat;
        case 8:
          claimStat = 'Paid';
          return claimStat;
        case 9:
          claimStat = 'Queued';
          return claimStat;
        default:
          break;
      }
    };

    $scope.toggleClaimsView = function ($event) {
      $scope.isClaimsMenuOpen = !$scope.isClaimsMenuOpen;
      $event.stopPropagation();
    };

    $scope.closePopover = function () {
      $scope.isClaimsMenuOpen = false;
    };

    //Preview
    $scope.previewPdf = function (claim) {
      var internetexplorer, myWindow;
      var viewVsPreview = claim.Status === 1 ? 'Preview' : 'View';

      if (window.navigator.msSaveOrOpenBlob) {
        internetexplorer = true;
      } else {
        internetexplorer = false;
        myWindow = $window.open('');
        var claimorPred =
          claim.Type === 1 ? 'Claim for ' : 'Predetermination for ';
        var titleHtml =
          '<html><head><title>' +
          viewVsPreview +
          ' ' +
          claimorPred +
          claim.PatientName +
          '</title></head></html>';
        myWindow.document.write(titleHtml);
      }
      var fileURL;

      commonServices.Insurance.ClaimPdf(
        '_soarapi_/insurance/claims/pdf?claimCommondId=' + claim.ClaimId
      ).then(function (res) {
        var file = new Blob([res.data], {
          type: 'application/pdf',
        });

        if (internetexplorer) {
          window.navigator.msSaveOrOpenBlob(file, claim.PatientName + '.pdf');
        } else {
          fileURL = URL.createObjectURL(file);
          var pdfData = $sce.trustAsResourceUrl(fileURL);
          var html =
            '<html><head><title>View Claim for ' +
            claim.PatientName +
            "</title></head><body><iframe style='width:100%;height:100%;' src=" +
            fileURL +
            '></iframe></body></div></html>';
          myWindow.document.write(html);
          myWindow.document.close();
        }
      });
    };

    // Get adjustment types
    ctrl.getAdjustmentTypes = function () {
      var deferred = $q.defer();
      adjustmentTypesService.get({ active: false }).then(
        function (successResponse) {
          ctrl.adjustmentTypes = successResponse.Value;
          deferred.resolve(ctrl.adjustmentTypes);
        },
        function () {
          toastrFactory.error(
            localize.getLocalizedString('{0} failed to load.', [
              'Adjustment Types',
            ]),
            localize.getLocalizedString('Server Error')
          );
          deferred.reject();
        }
      );
      return deferred.promise;
    };

    // Get locations
    ctrl.getLocations = function () {
      var deferred = $q.defer();
      locationServices.get(
        function (successResponse) {
          ctrl.locations = successResponse.Value;
          deferred.resolve(ctrl.locations);
        },
        function () {
          toastrFactory.error(
            localize.getLocalizedString('{0} failed to load.', ['Locations']),
            localize.getLocalizedString('Server Error')
          );
          deferred.reject();
        }
      );
      return deferred.promise;
    };

    // Get user location
    ctrl.getUserLocation = function () {
      var userLocation = JSON.parse(sessionStorage.getItem('userLocation'));
      return listHelper.findItemByFieldValue(
        ctrl.locations,
        'LocationId',
        userLocation.id
      );
    };

    // Get location nameline1
    ctrl.getLocationNameLine1 = function (locationId) {
      var item = listHelper.findItemByFieldValue(
        ctrl.locations,
        'LocationId',
        locationId
      );
      if (item) {
        return item.NameLine1;
      } else {
        return '';
      }
    };

    // Get name of the person using EnteredByUserId
    ctrl.getNameForTheEnteredByUserId = function (enteredByUserId) {
      var userDetails = listHelper.findItemByFieldValue(
        $scope.providers,
        'UserId',
        enteredByUserId
      );
      if (userDetails != null) {
        return (
          userDetails.FirstName +
          ' ' +
          userDetails.LastName +
          (userDetails.ProfessionalDesignation
            ? ', ' + userDetails.ProfessionalDesignation
            : '')
        );
      } else {
        return '';
      }
    };

    ctrl.loadModal = function (transaction) {
      if (transaction.TransactionTypeId === 1) {
        ctrl.hasViewOrEditAccessToServiceTransaction = patSecurityService.IsAuthorizedByAbbreviation(
          $scope.soarAuthSvcTrViewKey
        );
      } else if (
        transaction.TransactionTypeId === 5 ||
        transaction.TransactionTypeId === 6
      ) {
        ctrl.hasViewOrEditAccessToServiceTransaction = patSecurityService.IsAuthorizedByAbbreviation(
          $scope.soarAuthEditTrViewKey
        );
      }

      // If user is authorized to view or edit service transaction then only allow user to proceed else notify not authorized
      if (ctrl.hasViewOrEditAccessToServiceTransaction) {
        ctrl.filteredProviders = $filter('filter')($scope.providers, {
          Locations: { LocationId: $scope.serviceTransaction.LocationId },
        });
        ctrl.filteredProviders = ctrl.filteredProviders.filter(function (f) {
          // Provider Types - Dentist, Hygienist, Assistant & Other
          if (f.ProviderTypeId) {
            return (
              f.ProviderTypeId == 1 ||
              f.ProviderTypeId == 2 ||
              f.ProviderTypeId == 3 ||
              f.ProviderTypeId == 5
            );
          }
          return false;
        });

        if (transaction.TransactionTypeId === 1) {
          ctrl.setupFeeScheduleFlags(transaction);
        }

        ctrl.dataForModal = {
          EditMode: false,
          Transaction: angular.copy(transaction),
          Providers: ctrl.filteredProviders,
          Patient: $scope.patientInfo,
          ServiceTypes: [],
          AdjustmentTypes: ctrl.adjustmentTypes,
          ServiceCodes: $scope.serviceCodes ? $scope.serviceCodes : [],
        };
        ctrl.dataForModal.Transaction.DateEntered = ctrl.dataForModal.Transaction.displayDateEntered = timeZoneFactory.ConvertDateTZString(
          transaction.DateEntered,
          ctrl.getUserLocation().Timezone
        );
        ctrl.dataForModal.Transaction.TitleDate = timeZoneFactory
          .ConvertDateToMomentTZ(
            transaction.DateEntered,
            ctrl.getUserLocation().Timezone
          )
          .format('MM/DD/YYYY');
        ctrl.dataForModal.Transaction.PatientDetailedName =
          transaction.PatientName;
        ctrl.dataForModal.Transaction.LocationNameLine1 = ctrl.getLocationNameLine1(
          transaction.LocationId
        );
        ctrl.dataForModal.Transaction.EnteredByName = ctrl.getNameForTheEnteredByUserId(
          transaction.EnteredByUserId
        );
        ctrl.dataForModal.Transaction.EncounterDate = $scope.encounter.Date;
        ctrl.dataForModal.Transaction.RelatedEncounterDate = timeZoneFactory
          .ConvertDateToMomentTZ(
            _.min(
              _.map($scope.encounter.ServiceTransactionDtos, 'DateEntered')
            ),
            ctrl.getUserLocation().Timezone
          )
          .format('MM/DD/YYYY');

        var modalInstance = modalFactory.Modal({
          templateUrl:
            'App/Patient/components/transaction-crud/transaction-crud.html',
          keyboard: false,
          windowClass: 'modal-60',
          backdrop: 'static',
          controller: 'TransactionCrudController',
          amfa: $scope.soarAuthSvcTrViewKey,
          resolve: {
            DataForModal: function () {
              return ctrl.dataForModal;
            },
          },
        });

        modalInstance.result.then(function () {
          $scope.refreshSummaryPageDataForGrid();
        });
      } else {
        if (
          transaction.TransactionTypeId === 5 ||
          transaction.TransactionTypeId === 6
        ) {
          ctrl.notifyNotAuthorized($scope.soarAuthEditTrViewKey);
        } else if (transaction.TransactionTypeId === 1) {
          ctrl.notifyNotAuthorized($scope.soarAuthSvcTrViewKey);
        }
      }
    };

    //Notify user, he is not authorized to access current area
    ctrl.notifyNotAuthorized = function (authMessageKey) {
      toastrFactory.error(
        patSecurityService.generateMessage(authMessageKey),
        'Not Authorized'
      );
      $location.path('/');
    };

    ctrl.setupFeeScheduleFlags = function (serviceTran) {
      serviceTran.hasFeeScheduleWriteOff = false;
      serviceTran.hasCheckoutFeeScheduleWriteOff = false;
      if ($scope.encounter.ServiceTransactionDtos && serviceTran) {
        _.forEach(
          $scope.encounter.ServiceTransactionDtos,
          function (credTrans) {
            if (credTrans.IsFeeScheduleWriteOff) {
              var details = _.filter(
                credTrans.CreditTransactionDetails,
                function (detail) {
                  return !detail.IsDeleted;
                }
              );
              if (
                details.length === 1 &&
                details[0].AppliedToServiceTransationId ===
                  serviceTran.ServiceTransactionId
              ) {
                serviceTran.hasFeeScheduleWriteOff = true;
                if (credTrans.IsCollectedAtCheckOut) {
                  serviceTran.hasCheckoutFeeScheduleWriteOff = true;
                }
              }
            }
          }
        );
      }
    };
    ctrl.closeDropDown = function () {
      //this is a hack because bootstrap dropdown doesn't close when you click one of the options
      $('body').trigger('click');
    };

    $scope.openClaimNotes = function (claimSubmissionResultsDto) {
      ctrl.closeDropDown();
      modalFactory
        .Modal({
          templateUrl:
            'App/BusinessCenter/insurance/claims/claims-management/claim-notes-modal/claim-notes-modal.html',
          backdrop: 'static',
          keyboard: false,
          size: 'lg',
          windowClass: 'warning-modal-center',
          controller: 'ClaimNotesModalController',
          amfa: 'soar-ins-iclaim-view',
          resolve: {
            claimSubmissionResultsDto: function () {
              return claimSubmissionResultsDto;
            },
            claimStatusDtos: function () {
              return $scope.claimStatusDtos;
            },
          },
        })
        .result.then(function () {
          $scope.isClaimsMenuOpen = false;
        });
    };
  },
]);
