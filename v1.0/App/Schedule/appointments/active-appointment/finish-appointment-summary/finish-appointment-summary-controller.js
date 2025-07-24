'use strict';
angular
  .module('Soar.Schedule')
  .controller('FinishAppointmentSummaryController', [
    '$scope',
    '$rootScope',
    '$routeParams',
    'localize',
    '$uibModalInstance',
    '$uibModal',
    '$location',
    'locationService',
    'ListHelper',
    'DataForModal',
    'referenceDataService',
    'ScheduleServices',
    'toastrFactory',
    'ModalDataFactory',
    'patSecurityService',
    'ModalFactory',
    'UsersFactory',
    'userSettingsDataService',
    function (
      $scope,
      $rootScope,
      $routeParams,
      localize,
      $uibModalInstance,
      $uibModal,
      $location,
      locationService,
      listHelper,
      dataForModal,
      referenceDataService,
      scheduleServices,
      toastrFactory,
      modalDataFactory,
      patSecurityService,
      modalFactory,
      usersFactory,
      userSettingsDataService
    ) {
      // #region Variables
      var ctrl = this;
      $scope.soarAuthScheduleApptViewKey = 'soar-sch-sch-view';
      $scope.soarAuthSchApptClassificationSelectKey = 'soar-sch-sptapt-add';
      $scope.soarAuthScheduleApptAddKey = 'soar-sch-sapttp-add';
      $scope.soarAuthEnctrChkOutKey = 'soar-acct-enctr-chkout';

      $scope.loading = {};
      ctrl.patientInfo = dataForModal.PatientInfo;
      $scope.appointment = dataForModal.Appointment;
      ctrl.pendingEncounter = dataForModal.Encounter;
      $scope.disableBtn = false;
      $scope.loading.AppointmentType = false;
      $scope.loading.TreatmentRoom = false;
      $scope.isAppointmentTypeSelected = true;
      $scope.amount = 0;
      $scope.estInsurance = 0;
      $scope.patientPortion = 0;
      $scope.service =
        $scope.appointment.PlannedServices.length != 1
          ? ' Services'
          : ' Service';

      ctrl.locations = JSON.parse(sessionStorage.getItem('activeLocations'));
      //get id for logged in location and appt location
      ctrl.targetLocation = ctrl.locations.find(
        element => element.id === $scope.appointment.LocationId
      );

      ctrl.paymentTypes = [];
      ctrl.serviceCodes = [];
      ctrl.transactionTypes = [];
      ctrl.dataForModal = {};
      ctrl.locationId = null;
      // #endregion

      // #region Data loading functions

      // Function to get patient's display name
      ctrl.getPatientDisplayName = function () {
        var displayPreferredName = ctrl.patientInfo.PreferredName
          ? ' (' + ctrl.patientInfo.PreferredName + ')'
          : '';
        var displayMiddleName = ctrl.patientInfo.MiddleName
          ? ' ' + ctrl.patientInfo.MiddleName + '.'
          : '';
        var displaySuffix = ctrl.patientInfo.SuffixName
          ? ', ' + ctrl.patientInfo.SuffixName
          : '';

        return (
          ctrl.patientInfo.FirstName +
          displayPreferredName +
          displayMiddleName +
          ' ' +
          ctrl.patientInfo.LastName +
          displaySuffix
        );
      };

      // Get appointment type from appointment types list if it exists --prevents 404 on call if AppointmentTypeId is not a valid id
      ctrl.getAppointmentType = function (appointmentTypeId) {
        $scope.loading.AppointmentType = true;
        var appointmentTypes = referenceDataService.get(
          referenceDataService.entityNames.appointmentTypes
        );
        var appointmentType = _.find(appointmentTypes, {
          AppointmentTypeId: appointmentTypeId,
        });
        if (appointmentType) {
          $scope.appointment.AppointmentTypeName = appointmentType.Name;
          $scope.isAppointmentTypeSelected = true;
        } else {
          $scope.appointment.AppointmentTypeName = '';
          $scope.isAppointmentTypeSelected = false;
        }
        $scope.loading.AppointmentType = false;
      };

      // Get treatment room
      ctrl.getTreatmentRoom = function (roomId) {
        $scope.loading.TreatmentRoom = true;
        var cachedLocation = JSON.parse(sessionStorage.getItem('userLocation'));
        var locationId = cachedLocation
          ? cachedLocation.id
          : '00000000-0000-0000-0000-000000000000';
        scheduleServices.Dtos.TreatmentRooms.get(
          { RoomId: roomId, LocationId: locationId },
          ctrl.getTreatmentRoomSuccess,
          ctrl.getTreatmentRoomFailure
        );
      };

      // Success handler for get treatment room
      ctrl.getTreatmentRoomSuccess = function (successResponse) {
        $scope.appointment.TreatmentRoomName = successResponse.Value.Name;
        $scope.loading.TreatmentRoom = false;
      };

      // Error handler for get treatment room
      ctrl.getTreatmentRoomFailure = function () {
        toastrFactory.error(
          localize.getLocalizedString('Failed to retrieve the treatment room.'),
          localize.getLocalizedString('Server Error')
        );
        $scope.appointment.TreatmentRoomName = '';
        $scope.loading.TreatmentRoom = false;
      };

      // getting the list of providers
      ctrl.getProviders = function () {
        usersFactory
          .Users()
          .then(ctrl.getProvidersSuccess, ctrl.getProvidersFailure);
      };

      // Success handler for get treatment room
      ctrl.getProvidersSuccess = function (successResponse) {
        ctrl.providers = successResponse.Value;
        ctrl.getProviderName(
          $scope.appointment.ProviderAppointments != null &&
            $scope.appointment.ProviderAppointments.length > 0
            ? $scope.appointment.ProviderAppointments[0].UserId
            : null
        );
      };

      // Error handler for get treatment room
      ctrl.getProvidersFailure = function () {
        ctrl.providers = [];
        toastrFactory.error(
          localize.getLocalizedString(
            'Failed to retrieve the list of {0}. Refresh the page to try again.',
            ['Providers']
          ),
          localize.getLocalizedString('Server Error')
        );
      };

      // get provider name
      ctrl.getProviderName = function (providerUserId) {
        if (providerUserId) {
          var provider = listHelper.findItemByFieldValue(
            ctrl.providers,
            'UserId',
            providerUserId
          );
          if (provider != null) {
            provider.Name =
              provider.Name > ''
                ? provider.Name
                : provider.FirstName +
                  ' ' +
                  provider.LastName +
                  (provider.ProfessionalDesignation > ''
                    ? ', ' + provider.ProfessionalDesignation
                    : '');
            $scope.appointment.ProviderName = provider.Name;
          } else {
            $scope.appointment.ProviderName = '';
          }
        }
      };

      // Get all service codes
      ctrl.getServiceCodes = function () {
        ctrl.serviceCodes = referenceDataService.get(
          referenceDataService.entityNames.serviceCodes
        );
        ctrl.processAppointmentServices();
      };

      // Process appointment to calculate total fee and get appointment services display string
      ctrl.processAppointmentServices = function () {
        $scope.appointment.ServiceCodesDisplayAs = '';

        angular.forEach(
          $scope.appointment.PlannedServices,
          function (plannedService) {
            if ($scope.appointment.ServiceCodesDisplayAs !== '') {
              $scope.appointment.ServiceCodesDisplayAs += ', ';
            }
            // bug 381385 Clinical - Appointment:  Finish Appointment message doesn't display correct amounts.
            // decision to show total fees for services = total from service transactions
            var serviceCode = _.find(ctrl.serviceCodes, {
              ServiceCodeId: plannedService.ServiceCodeId,
            });
            $scope.appointment.ServiceCodesDisplayAs += serviceCode
              ? serviceCode.DisplayAs
              : '';
          }
        );
      };

      // #endregion

      // #region Action functions

      // Close the modal
      $scope.closeModal = function () {
        $scope.disableBtn = true;
        $uibModalInstance.close(null);
      };

      // Schedule next appointment
      $scope.scheduleNextAppt = function () {
        $scope.disableBtn = true;
        var action = {
          ScheduleNextAppt: true,
        };

        $uibModalInstance.close(action);
      };

      // Checkout pending encounter which is created for the services added in an appointment
      // GetCheckoutModalData has been refactored
      //$scope.checkout = function () {
      //    var hasCheckoutAccessToEncounter = patSecurityService.IsAuthorizedByAbbreviation($scope.soarAuthEnctrChkOutKey);

      //    if (hasCheckoutAccessToEncounter) {
      //        if (ctrl.pendingEncounter &&
      //            ctrl.pendingEncounter.ServiceTransactionDtos &&
      //            ctrl.pendingEncounter.ServiceTransactionDtos.length > 0) {
      //            ctrl.locationId = ctrl.pendingEncounter.ServiceTransactionDtos[0].LocationId;
      //        }
      //        ctrl.dataForModal.PaymentTypes = { Params: { isActive: true }, Value: ctrl.paymentTypes };
      //        ctrl.dataForModal.ServiceCodes = { Params: null, Value: ctrl.serviceCodes };
      //        ctrl.dataForModal.TransactionTypes = { Params: null, Value: ctrl.transactionTypes };

      //        modalDataFactory.GetCheckoutModalData(ctrl.dataForModal, $routeParams.patientId, ctrl.locationId, [angular.copy(ctrl.pendingEncounter)]).then(ctrl.openCheckoutEncounterModal);
      //    } else {
      //        ctrl.notifyNotAuthorized($scope.soarAuthEnctrChkOutKey);
      //    }
      //};

      $scope.checkout_v2 = function () {
        let loggedInLocation = locationService.getCurrentLocation();
        if ($scope.appointment.LocationId !== loggedInLocation.id) {
          ctrl.ShowBlockCheckoutModal();
          return;
        }
        var hasCheckoutAccessToEncounter =
          patSecurityService.IsAuthorizedByAbbreviation(
            $scope.soarAuthEnctrChkOutKey
          );

        if (hasCheckoutAccessToEncounter) {
          let patientPath = '/Patient/';

          if (
            ctrl.pendingEncounter &&
            ctrl.pendingEncounter.ServiceTransactionDtos &&
            ctrl.pendingEncounter.ServiceTransactionDtos.length > 0
          ) {
            $uibModalInstance.close(null);
            if ($scope.appointment.needsUserChange) {
              $location.url(
                patientPath +
                  $scope.appointment.PersonId +
                  '/Account/' +
                  ctrl.patientInfo.PersonAccount.AccountId +
                  '/Encounter/' +
                  ctrl.pendingEncounter.EncounterId +
                  '/EncountersCart/AccountSummary?appt=' +
                  $scope.appointment.AppointmentId
              );
            } else {
              $location.url(
                patientPath +
                  $scope.appointment.PersonId +
                  '/Account/' +
                  ctrl.patientInfo.PersonAccount.AccountId +
                  '/Encounter/' +
                  ctrl.pendingEncounter.EncounterId +
                  '/Checkout/Clinical'
              );
            }
          }
        } else {
          ctrl.notifyNotAuthorized($scope.soarAuthEnctrChkOutKey);
        }
      };

      ctrl.ShowBlockCheckoutModal = function () {
        let blockCheckoutModal = $uibModal.open({
          templateUrl:
            'App/Schedule/appointments/active-appointment/finish-appointment-summary/block-checkout-modal.html',
          scope: $scope,
          controller: function () {
            $scope.negative = function () {
              blockCheckoutModal.close();
            };
            $scope.locationDisplayName = ctrl.targetLocation.name;
          },
          size: 'sm',
          windowClass: 'center-modal',
        });
      };

      //handle ok flow of checkout modal
      ctrl.checkoutModalResultOk = function () {
        $rootScope.$broadcast('appointment:update-appointment', null);
      };

      //handle cancel flow of checkout modal
      ctrl.checkoutModalResultCancel = function () {};
      // #endregion

      //#region Patient portion calculation

      // Function to calculate total amount, patient portion and insurance estimation for a patient
      ctrl.getPatientPortionWithEstimatedInsurance = function () {
        angular.forEach(
          ctrl.pendingEncounter.ServiceTransactionDtos,
          function (serviceTransaction) {
            var amount = serviceTransaction.Amount
              ? serviceTransaction.Amount
              : 0;
            var estInsurance = serviceTransaction.TotalEstInsurance
              ? serviceTransaction.TotalEstInsurance
              : 0;

            $scope.amount += amount;
            $scope.estInsurance += estInsurance;
          }
        );
        $scope.patientPortion = $scope.amount - $scope.estInsurance;
      };

      //#endregion

      //Notify user, he is not authorized to access current area
      ctrl.notifyNotAuthorized = function () {
        toastrFactory.error(
          localize.getLocalizedString(
            'User is not authorized to access this area'
          ),
          localize.getLocalizedString('Not Authorized')
        );
      };

      ctrl.getDisplayDates = function () {
        $scope.appointmentActualStartTime =
          $scope.appointment.ActualStartTime.lastIndexOf('Z') ===
          $scope.appointment.ActualStartTime.length - 1
            ? $scope.appointment.ActualStartTime
            : $scope.appointment.ActualStartTime + 'Z';
        $scope.appointmentActualEndTime =
          $scope.appointment.ActualEndTime.lastIndexOf('Z') ===
          $scope.appointment.ActualEndTime.length - 1
            ? $scope.appointment.ActualEndTime
            : $scope.appointment.ActualEndTime + 'Z';
      };

      // #region Initialization

      // Initialization function
      ctrl.init = function () {
        $scope.patientDisplayName = ctrl.getPatientDisplayName();
        ctrl.getAppointmentType($scope.appointment.AppointmentTypeId);
        ctrl.getTreatmentRoom($scope.appointment.TreatmentRoomId);
        ctrl.getServiceCodes();
        ctrl.getProviders();
        ctrl.getPatientPortionWithEstimatedInsurance();
        ctrl.getDisplayDates();
      };

      ctrl.init();

      // #endRegion
    },
  ]);
