(function () {
  'use strict';

  angular
    .module('Soar.Schedule')
    .controller(
      'PatientAppointmentsTileController',
      patientAppointmentsTileController
    );

  patientAppointmentsTileController.$inject = [
    '$scope',
    '$rootScope',
    '$location',
    'ScheduleServices',
    'BoundObjectFactory',
    'localize',
    '$timeout',
    'patSecurityService',
    'StaticData',
    'SaveStates',
    '$uibModal',
    'ModalFactory',
    'ModalDataFactory',
    'ListHelper',
    'PatientAppointmentsFactory',
    'TimeZoneFactory',
    '$filter',
    'toastrFactory',
    'locationService',
    'userSettingsDataService',
    'AppointmentModalLinksService',
    'AppointmentViewVisibleService',
    'AppointmentViewDataLoadingService',
    'FeatureFlagService',
    'FuseFlag',
    'schedulingMFENavigator',
  ];

  function patientAppointmentsTileController(
    $scope,
    $rootScope,
    $location,
    scheduleServices,
    boundObjectFactory,
    localize,
    $timeout,
    patSecurityService,
    staticData,
    saveStates,
    $uibModal,
    modalFactory,
    modalDataFactory,
    listHelper,
    patientAppointmentsFactory,
    timeZoneFactory,
    $filter,
    toastrFactory,
    locationService,
    userSettingsDataService,
    appointmentModalLinksService,
    appointmentViewVisibleService,
    appointmentViewDataLoadingService,
    featureFlagService,
    fuseFlag,
    schedulingMFENavigator,
  ) {
    var ctrl = this;

    $scope.showLabel = false;
    $scope.soarAuthClinicalAppointmentsEditKey = 'soar-sch-sptapt-edit';
    ctrl.hasClinicalAppointmentEditAccess = false;
    $scope.timelineView = true;

    $scope.scheduledDate = $scope.patientAppointment.StartTime;
    $scope.currentDate = new Date();
    $scope.startTime = new Date($scope.patientAppointment.StartTime);
    $scope.buttonStyle = '';
    $scope.truncatedAppointmentType = '';
    $scope.truncatedServiceCodeDisplayAs = '';
    $scope.dateStartTime = '';
    $scope.showStartButton = false;
    $scope.linkToScheduleV2 = false;

    // #region Initialization
    ctrl.isDateToday = function (date) {
      var today = new Date();
      return (
        date.getDate() == today.getDate() &&
        date.getMonth() == today.getMonth() &&
        date.getFullYear() == today.getFullYear()
      );
    };

    // Initialize tile properties as per appointment status
    ctrl.init = function () {
      // Post process values so that we do not have to process them on the template.
      var isItToday = ctrl.isDateToday($scope.startTime);
      if (isItToday) {
        $scope.showStartButton = true;
      } else {
        $scope.showStartButton = $scope.startTime <= $scope.currentDate;
      }
      $scope.truncatedAppointmentType = $filter('truncate')(
        $scope.patientAppointment.AppointmentTypeName,
        25
      );
      $scope.truncatedServiceCodeDisplayAs = $filter('truncate')(
        $scope.patientAppointment.ServiceCodeDisplayAs,
        30
      );
      $scope.dateStartTime = $filter('date')($scope.startTime, 'h:mm a');
      featureFlagService.getOnce$(fuseFlag.ShowScheduleV2).subscribe((value) => {
        $scope.linkToScheduleV2 = value;
      });
      featureFlagService.getOnce$(fuseFlag.ShowScheduleV2Alt).subscribe((value) => {
        if (!$scope.linkToScheduleV2) {$scope.linkToScheduleV2 = value}
      });
      // End Post processing values for the display
      switch ($scope.patientAppointment.Status) {
        case 3:
          $scope.apptStatus = localize.getLocalizedString('Completed');
          $scope.showLabel = true;
          break;

        case 4:
          if ($scope.patientAppointment.ActualStartTime) {
            $scope.apptStatus = localize.getLocalizedString('In Treatment');
            $scope.showLabel = true;
            $scope.showStartButton = false;
            $timeout(function () {
              $rootScope.$broadcast(
                'appointment:startup-show-appointment-model',
                $scope.patientAppointment
              );
            }, 100);
          } else {
            $scope.apptStatus = localize.getLocalizedString('Start Appt');
            $scope.showLabel = false;
            $scope.isDisabled = false;
          }
          break;

        case 5:
          $scope.apptStatus = localize.getLocalizedString(
            'Ready for Check out'
          );
          $scope.showLabel = true;
          break;

        default:
          $scope.apptStatus = localize.getLocalizedString('Start Appt');
          $scope.showLabel = false;
      }
    };
    ctrl.init();

    // #endregion

    //#region display / start appointments

    //hide appointments of future data
    $scope.hideAppointment = function () {
      if (_.isNil($scope.currentDate) || _.isNil($scope.scheduledDate)) {
        return false;
      }

      if (
        $scope.currentDate.setHours(0, 0, 0, 0) <
        $scope.scheduledDate.setHours(0, 0, 0, 0)
      ) {
        return true;
      } else {
        return false;
      }
    };

    // Success call back of start appointment
    ctrl.afterSaveSuccess = function (result) {
      // need to look at the result

      var appointment = result.Value;

      $scope.apptStatus = localize.getLocalizedString('In Treatment');
      $scope.isDisabled = true;
      $scope.showLabel = true;
      $scope.showStartButton = false;
      //

      // and then alter the current patientAppointment
      $scope.patientAppointment.Status = appointment.Status;
      $scope.patientAppointment.StatusText = $scope.apptStatus;
      $scope.patientAppointment.StartDate = appointment.StartDate;
      $scope.patientAppointment.originalStart = angular.copy(
        appointment.StartTime
      );
      $scope.patientAppointment.StartTime = timeZoneFactory
        .ConvertDateToMomentTZ(
          appointment.StartTime,
          $scope.patientAppointment.LocationTimezoneInfo
        )
        .toDate();

      $scope.patientAppointment.ActualStartTime = appointment.ActualStartTime;
      $scope.patientAppointment.start = angular.copy(appointment.StartTime);
      $scope.patientAppointment.tzAbbr = timeZoneFactory.GetTimeZoneAbbr(
        $scope.patientAppointment.LocationTimezoneInfo,
        appointment.StartTime
      );

      // this is what is called when you say you want to start an appointment.
      // rearrange the timeline so that appointment is moved to the today area.
      $rootScope.$broadcast(
        'appointment:start-appointment',
        $scope.patientAppointment
      );
      // setup the model that opens
      $rootScope.$broadcast('appointment:begin-appointment', appointment);
    };

    // Error call back of  start appointment
    ctrl.afterSaveError = function () {
      toastrFactory.error(
        localize.getLocalizedString('Start appointment failed.'),
        localize.getLocalizedString('Server Error')
      );
      $scope.isDisabled = false;
      $scope.showLabel = false;
    };

    //Start appointment
    $scope.beginAppointment = function ($event) {
      if ($event) {
        $event.stopPropagation();

        if (ctrl.hasClinicalAppointmentEditAccess) {
          $scope.isDisabled = true;
          var loggedInLocation = locationService.getCurrentLocation();

          var data = _.cloneDeep($scope.patientAppointment);
          if (angular.isDefined(data.originalStart)) {
            timeZoneFactory.ResetAppointmentDates(data);
          }

          if (loggedInLocation.id === data.LocationId) {
            ctrl.beginLocationAppointment(data);
          } else {
            modalFactory.LocationChangeForStartAppointmentModal().then(
              () => ctrl.beginLocationAppointment(data, true),
              result => ($scope.isDisabled = false)
            );
          }
        }
      }
    };

    ctrl.beginLocationAppointment = function (data, overrideLocation) {
      data.Status = staticData.AppointmentStatuses().Enum.InTreatment;

      if (overrideLocation) {
        if (!ctrl.setLocationFromAppointment(data.LocationId)) {
          modalFactory.LocationMismatchOnOverrideModal();
          return;
        }
      }

      var appointmentUpdate = {
        appointmentId: data.AppointmentId,
        DataTag: data.DataTag,
        NewAppointmentStatusId: data.Status,
        StartAppointment: true,
      };

      scheduleServices.AppointmentStatus.Update(
        appointmentUpdate,
        function (result) {
          ctrl.afterSaveSuccess(result);
        },
        ctrl.afterSaveError
      );
    };

    ctrl.setLocationFromAppointment = function (locationId) {
      if (!_.isNil(locationId)) {
        var activeLocations = locationService.getActiveLocations();
        var appointmentLocation = _.find(activeLocations, { id: locationId });

        if (!_.isNil(appointmentLocation)) {
          locationService.selectLocation(appointmentLocation);
          return true;
        }
      }
      return false;
    };

    //#endregion

    //#region Authorization

    // Check if logged in user has view access to patient appointments
    ctrl.authEditAccessToPatientAppointments = function () {
      return patSecurityService.IsAuthorizedByAbbreviation(
        $scope.soarAuthClinicalAppointmentsEditKey
      );
    };

    // Check edit access for starting an appointment
    ctrl.authAccess = function () {
      if (ctrl.authEditAccessToPatientAppointments()) {
        ctrl.hasClinicalAppointmentEditAccess = true;
      }
    };

    // Check view access for time-line items
    ctrl.authAccess();

    //#endregion

    //#region edit appointment

    ctrl.appointmentEditModalData = null;

    // edit an existing appointment from timeline tile
    $scope.editAppointmentFromModal = function (appt) {
      if (ctrl.hasClinicalAppointmentEditAccess) {
        if ($scope.linkToScheduleV2) {
          schedulingMFENavigator.navigateToAppointmentModal({
            id: appt.AppointmentId,
          });
          return;
        }

        appt.StartTime = null;

        appointmentViewDataLoadingService
          .getViewData(appt, false, 'appointment:update-appointment')
          .then(
            function (res) {
              appointmentViewVisibleService.changeAppointmentViewVisible(
                true,
                false
              );
            },
            function (error) {
              console.log(error);
              toastrFactory.error(
                'Ran into a problem loading the appointment',
                'Error'
              );
            }
          );
      }
    };

    // edited appointment save success
    ctrl.appointmentSaved = function (updatedAppointment) {
      $rootScope.$broadcast(
        'appointment:update-appointment',
        updatedAppointment
      );
    };

    // edited appointment cancelled
    ctrl.appointmentEditCanceled = function () {
      //? probably don't need this
    };
  }
})();
