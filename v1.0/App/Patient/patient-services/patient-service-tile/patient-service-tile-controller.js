(function () {
  'use strict';

  angular
    .module('Soar.Patient')
    .controller('PatientServiceTileController', PatientServiceTileController);

  PatientServiceTileController.$inject = [
    '$rootScope',
    '$scope',
    '$routeParams',
    '$filter',
    'AmfaKeys',
    'ModalFactory',
    'UsersFactory',
    'PatientServices',
    'PatientOdontogramFactory',
    'PatientServicesFactory',
    'patSecurityService',
    'ListHelper',
    'localize',
    'StaticData',
    'soarAnimation',
    'toastrFactory',
    '$q',
    'PatCacheFactory',
    'locationService',
  ];

  function PatientServiceTileController(
    $rootScope,
    $scope,
    $routeParams,
    $filter,
    AmfaKeys,
    modalFactory,
    usersFactory,
    patientServices,
    patientOdontogramFactory,
    patientServicesFactory,
    patSecurityService,
    listHelper,
    localize,
    staticData,
    soarAnimation,
    toastrFactory,
    $q,
    patCacheFactory,
    locationService
  ) {
    BaseCtrl.call(this, $scope, 'PatientServiceTileController');
    var ctrl = this;

    $scope.truncatedDisplayAs = '';
    $scope.truncatedDescription = '';
    $scope.currencyFee = '';
    $scope.convertedTooth = '';
    $scope.transactionStatus = '';
    $scope.showEllipsesMenu = false;
    $scope.orientTop = false;
    $scope.currentLocation = null;
    $scope.editTooltip = '';
    $scope.deleteToolTip = '';
    $scope.canEditService = false;
    $scope.canDeleteService = false;
    $scope.editToolTip = '';
    $scope.deleteToolTip = '';

    ctrl.$onInit = function onInit() {
      $scope.truncatedDisplayAs = $filter('truncate')(
        $scope.patientService.DisplayAs,
        30
      );
      $scope.truncatedDescription = $filter('truncate')(
        $scope.patientService.Description,
        35
      );
      $scope.currencyFee = $filter('currency')($scope.patientService.Fee);
      $scope.transactionStatus = $filter('transactionStatusIdToString')(
        $scope.patientService.ServiceTransactionStatusId
      );

      if (
        $scope.patientService.Tooth !== null &&
        $scope.patientService.Tooth !== undefined &&
        ($scope.patientService.Tooth.toString().indexOf('-') !== -1 ||
          $scope.patientService.Tooth.toString().indexOf(',') === 1)
      ) {
        $scope.convertedTooth = $filter(
          'convertToothRangeToQuadrantOrArchCode'
        )($scope.patientService.Tooth);
      } else if (
        $scope.patientService.Tooth !== null &&
        $scope.patientService.Tooth !== undefined &&
        $scope.patientService.Tooth !== 0
      ) {
        $scope.convertedTooth = $scope.patientService.Tooth;
      }
      $scope.hasEditAmfa = patSecurityService.IsAuthorizedByAbbreviation(
        AmfaKeys.SoarClinCpsvcEdit
      );
      var map = staticData.ToothRangeToCodeMap();
      $scope.displayingCode = map[$scope.patientService.Tooth] ? true : false;
      ctrl.setAffectedArea();
      $scope.setCurrentLocation();
    };

    $scope.$on('patCore:initlocation', function () {
      $scope.currentLocation = $scope.setCurrentLocation();
    });

    $scope.setAllowEdit = function () {
      $scope.canEditService = true;
      $scope.editToolTip = '';

      if ($scope.patientInfo.IsActive === false) {
        $scope.canEditService = false;
        $scope.editToolTip = localize.getLocalizedString(
          'Cannot edit service transaction for an inactive patient.'
        );
      }

      if ($scope.canEditService === true) {
        let locations = locationService.getActiveLocations();
        let loc = null;
        for (let i = 0; i < locations.length; i++) {
          if (locations[i].id === $scope.patientService.LocationId) {
            loc = locations[i];
            break;
          }
        }

        if (loc === null || loc === undefined || $scope.hasEditAmfa === false) {
          $scope.canEditService = false;
          $scope.editToolTip = localize.getLocalizedString(
            'User is not authorized to access this area.'
          );
        }

        if ($scope.patientService.PatientId !== $routeParams.patientId) {
          $scope.canEditService = false;
          $scope.editToolTip = localize.getLocalizedString(
            'Cannot edit a service for a duplicate patient.'
          );
        }
      }
    };

    $scope.setAllowDelete = function () {
      $scope.canDeleteService = true;
      $scope.deleteToolTip = '';
      if ($scope.patientService.ServiceTransactionStatusId === 4) {
        $scope.canDeleteService = false;
        $scope.deleteToolTip = localize.getLocalizedString(
          'Cannot delete a service transaction with a {0} status.',
          ['Completed']
        );
      }
      if ($scope.patientService.ServiceTransactionStatusId === 5) {
        $scope.canDeleteService = false;
        $scope.deleteToolTip = localize.getLocalizedString(
          'Cannot delete a service transaction with a {0} status.',
          ['Pending']
        );
      }

      if ($scope.canDeleteService == true) {
        if ($scope.patientService.LocationId !== $scope.currentLocation.id) {
          $scope.canDeleteService = false;
          $scope.deleteToolTip = localize.getLocalizedString(
            'Service transaction location must be the same as the active location.'
          );
        }
      }

      if ($scope.patientService.PatientId !== $routeParams.patientId) {
        $scope.canDeleteService = false;
        $scope.deleteToolTip = localize.getLocalizedString(
          'Cannot delete a service for a duplicate patient.'
        );
      }
    };

    $scope.setCurrentLocation = function () {
      $scope.currentLocation = locationService.getCurrentLocation();
      $scope.setAllowEdit();
      $scope.setAllowDelete();
    };

    $scope.editService = function () {
      const allowEdit =
        $routeParams.patientId === $scope.patientService.PatientId
          ? true
          : false;
      if (
        $scope.canEditService &&
        $scope.patientService.IsDeleted !== true &&
        allowEdit === true
      ) {
        $scope.serviceEdited = $scope.patientService;
        ctrl.initializeToothControls();
      }
    };

    $scope.deleteServiceTransaction = function () {
      const allowDelete =
        $routeParams.patientId === $scope.patientService.PatientId
          ? true
          : false;
      if (
        $scope.canEditService &&
        $scope.patientService.IsDeleted !== true &&
        allowDelete === true
      ) {
        var cautionMessage =
          'This service will be deleted from all appointments and treatment plans. Any open predeterminations will be closed.  ';
        if ($scope.patientService.ServiceTransactionStatusId === 6) {
          cautionMessage = '';
        }

        ctrl.claimsPromise =
          patientServices.Claim.getClaimsByServiceTransaction({
            serviceTransactionId: $scope.patientService.ServiceTransactionId,
            ClaimType: 2,
          });
        modalFactory
          .DeleteModal(
            'Planned Service',
            $scope.patientService.Description,
            true,
            cautionMessage
          )
          .then($scope.confirmDeletion, $scope.cancelDelete);
      }
    };
    $scope.confirmDeletion = function () {
      ctrl.claimsPromise.$promise.then(function (res) {
        $scope.checkForPredeterminationInProcess(res);

        if (!$scope.predInProcess) {
          if (ctrl.hasPred) {
            ctrl
              .closePredeterminations(ctrl.predeterminationsToClose)
              .then(function (res) {
                $scope.deleteService();
              });
          } else {
            $scope.deleteService();
          }
        } else {
          ctrl.predInProcessAlert();
        }
      });
    };

    $scope.deleteService = function () {
      var params = {};

      params.Id = $scope.patientInfo.PatientId;
      params.servicetransactionid = $scope.patientService.ServiceTransactionId;

      patientServices.ServiceTransactions.deleteFromLedger(
        params,
        $scope.serviceTransactionDeleteSuccess,
        $scope.serviceTransactionDeleteFailed
      );
    };

    $scope.serviceTransactionDeleteSuccess = function () {
      // clear the cache in order to refresh the treatment plans
      patCacheFactory.ClearCache(
        patCacheFactory.GetCache('PatientTreatmentPlans')
      );
      $rootScope.$broadcast('soar:tx-plan-services-changed', null, true);

      $scope.patientService.IsDeleted = true;
      toastrFactory.success(
        localize.getLocalizedString('Delete successful.', 'Success')
      );
      $rootScope.$broadcast(
        'chart-ledger:service-transaction-deleted',
        $scope.patientService
      );
      $rootScope.$broadcast('soar:chart-services-reload-ledger');
    };

    $scope.serviceTransactionDeleteFailed = function () {
      toastrFactory.error(
        localize.getLocalizedString(
          'Failed to delete the {0}. Please try again.',
          ['Planned Service']
        ),
        localize.getLocalizedString('Server Error')
      );
    };

    $scope.toggleEllipsesMenu = function (event) {
      $scope.showEllipsesMenu = !$scope.showEllipsesMenu;
      $scope.orientTop = soarAnimation.soarVPos(event.currentTarget);
    };

    $scope.predInProcessAlert = function () {
      var message = localize.getLocalizedString(
        'This service is on an in-process predetermination and cannot be deleted'
      );
      var title = localize.getLocalizedString('Confirm');
      var buttonContinue = localize.getLocalizedString('Ok');
      modalFactory.ConfirmModal(title, message, buttonContinue);
    };

    $scope.checkForPredeterminationInProcess = function (res) {
      ctrl.hasPred = false;
      $scope.predInProcess = false;

      ctrl.predeterminationsToClose = res.Value;
      ////tracks predeterminations that WE close
      //remove predeterminations that are already closed
      for (var i = 0; i < ctrl.predeterminationsToClose.length; i++) {
        if (ctrl.predeterminationsToClose[i].IsClosed) {
          ctrl.predeterminationsToClose.splice(i, 1);
          i--;
        }
      }

      if (res.Value.length) {
        ctrl.hasPred = true;
        //returns undefined if no in process predeterminations
        $scope.predInProcess = _.find(res.Value, function (predetermination) {
          if (predetermination.Status == 4) {
            return true;
          }
        });
      }
    };

    ctrl.closePredeterminations = function (predeterminations) {
      var deferred = $q.defer();
      var promises = [];
      predeterminations.forEach(function (predetermination) {
        var closePredeterminationObject = {
          ClaimId: predetermination.ClaimId,
          Note: null,
          NoInsurancePayment: true,
          RecreateClaim: false,
          CloseClaimAdjustment: null,
          UpdateServiceTransactions: false,
          disableCancel: true,
        };
        promises.push(
          patientServices.Predetermination.Close(closePredeterminationObject)
            .$promise
        );
      });
      $q.all(promises).then(
        function (res) {
          deferred.resolve(res);
        },
        function () {
          toastrFactory.error(
            localize.getLocalizedString('An error has occurred while {0}', [
              'closing the predetermination',
            ]),
            'Error'
          );
          deferred.resolve();
        }
      );
      return deferred.promise;
    };

    ctrl.initializeToothControls = function () {
      var modalObject = {
        type: 'Service',
        title: '',
        isSwiftCode: false,
        firstCode: false,
        lastCode: false,
      };

      if (
        $scope.serviceEdited.SwiftPickServiceCodes &&
        $scope.serviceEdited.SwiftPickServiceCodes.length > 0
      ) {
        $scope.swiftPickSelected = $scope.serviceEdited;
        var firstCode = false;
        var lastCode = false;
        if ($scope.serviceEdited.SwiftPickServiceCodes.length !== 0) {
          $scope.SwiftCodesProgress = localize.getLocalizedString(
            ' - ({0} of {1})',
            [1, $scope.serviceEdited.SwiftPickServiceCodes.length]
          );
          firstCode = true;
          if ($scope.serviceEdited.SwiftPickServiceCodes.length === 1)
            lastCode = true;
          patientOdontogramFactory.setselectedChartButton(
            $scope.serviceEdited.SwiftPickServiceCodes[0].ServiceCodeId
          );
          patientOdontogramFactory.setSelectedSwiftPickCode(
            $scope.serviceEdited.SwiftPickServiceCodes[0].SwiftPickServiceCodeId
          );
          var title =
            $scope.serviceEdited.SwiftPickServiceCodes[0].Code +
            $scope.SwiftCodesProgress;

          modalObject.title = title;
          modalObject.isSwiftCode = true;
          modalObject.firstCode = firstCode;
          modalObject.lastCode = lastCode;

          //$scope.openToothCtrls('Service', title, true, firstCode, lastCode);

          $rootScope.$broadcast('show-service-modal', modalObject);
        }
      } else {
        patientOdontogramFactory.setselectedChartButton(
          $scope.serviceEdited.ServiceCodeId
        );

        patientServicesFactory.setActiveServiceTransactionId(
          $scope.serviceEdited.ServiceTransactionId
        );
        // Open kendo window to add service
        var windowTitle = $scope.serviceEdited.CdtCodeName
          ? $scope.serviceEdited.CdtCodeName
          : $scope.serviceEdited.DisplayAs;

        //$scope.openToothCtrls('Service', windowTitle, false, true, false);

        modalObject.title = windowTitle;
        modalObject.isSwiftCode = false;
        modalObject.firstCode = true;
        modalObject.lastCode = false;

        $rootScope.$broadcast('show-service-modal', modalObject);
      }
    };

    ctrl.setAffectedArea = function () {
      if (
        $scope.patientService.Area != null &&
        $scope.patientService.Area.length > 0
      ) {
        $scope.affectedArea = $scope.patientService.Area;
      } else {
        switch ($scope.patientService.AffectedAreaId) {
          case 4:
            $scope.affectedArea = $scope.patientService.SurfaceSummaryInfo;
            break;
          case 3:
            $scope.affectedArea = $scope.patientService.RootSummaryInfo;
            break;
          case 2:
            $scope.affectedArea = $scope.patientService.Tooth;
            break;
          default:
            break;
        }
      }
    };
  }

  PatientServiceTileController.prototype = Object.create(BaseCtrl.prototype);
})();
