'use strict';
angular
  .module('Soar.Patient')
  .controller('PastAppointmentsController', [
    '$scope',
    '$window',
    '$filter',
    'PatientAppointmentTextService',
    'ListHelper',
    'localize',
    '$timeout',
    'ModalFactory',
    'toastrFactory',
    'UsersFactory',
    'TimeZoneFactory',
    'PatientAppointmentsFactory',
    'AppointmentTypesFactory',
    '$q',
    'patSecurityService',
    '$location',
    'userSettingsDataService',
    'AppointmentViewVisibleService',
    'AppointmentViewDataLoadingService',
    'FeatureFlagService',
    'FuseFlag',
    'schedulingMFENavigator',
    PastAppointmentsController,
  ]);

function PastAppointmentsController(
  $scope,
  $window,
  $filter,
  patientAppointmentTextService,
  listHelper,
  localize,
  $timeout,
  modalFactory,
  toastrFactory,
  usersFactory,
  timeZoneFactory,
  patientAppointmentsFactory,
  appointmentTypesFactory,
  $q,
  patSecurityService,
  $location,
  userSettingsDataService,
  appointmentViewVisibleService,
  appointmentViewDataLoadingService,
  featureFlagService,
  fuseFlag,
  schedulingMfeNavigator,
) {
  BaseCtrl.call(this, $scope, 'PastAppointmentsController');
  var ctrl = this;

  // load text for the view
  $scope.patientAppointmentText = patientAppointmentTextService.getPatientAppointmentText();

  //#region access

  ctrl.getAccess = function () {
    $scope.access = patientAppointmentsFactory.access();
    if (!$scope.access.View) {
      toastrFactory.error(
        patSecurityService.generateMessage('soar-sch-sptapt-view'),
        'Not Authorized'
      );
      event.preventDefault();
      $location.path('/');
    }
  };
  ctrl.getAccess();

  //#endregion

  $scope.initialize = function () {
    $scope.pastAppointments = [];
    $scope.appointmentLoading = true;
  };

  // patient is updated via the dropdown on the appointments tab, show trhe correct appointments
  $scope.$watch('patient', function (nv, ov) {
    // we check for `All Account Members` to make sure we're not already getting past appointments for all account members (patient-appointments-tab.js)
    if (
      nv &&
      nv.$$DisplayName != $scope.patientAppointmentText.allAccountMembers &&
      !_.isNil(nv.PatientId)
    ) {
      ctrl.getPastAppointmentsByPatient();
    }
  });

  ctrl.setProviderInfo = function (appointment) {
    var provider = listHelper.findItemByFieldValue(
      ctrl.providers,
      'UserId',
      appointment.ProviderUserId
    );
    if (provider !== null) {
      appointment.$$ProviderName = $scope.displayName = $filter(
        'getNameWithProfessionalDesignation'
      )(provider);
    } else {
      appointment.$$ProviderName =
        appointment.Classification !== 2
          ? {}
          : { Name: $scope.patientAppointmentText.anyProvider };
    }
  };

  // click handler for note modal
  $scope.openNoteModal = function (note) {
    var title = $scope.patientAppointmentText.statusNote;
    var button1Text = $scope.patientAppointmentText.close;
    modalFactory.NoteModal(title, note, button1Text);
  };

  $scope.selectPastAppointment = function (appointment) {

    if ($scope.useV2Schedule) {
      schedulingMfeNavigator.navigateToAppointmentModal({
        id: appointment.AppointmentId
      });
    }
    else {
      let appt = {
        AppointmentId: appointment.AppointmentId,
      };

      appointmentViewDataLoadingService.getViewData(appt, false).then(
        function (res) {
          appointmentViewVisibleService.changeAppointmentViewVisible(true, false);
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

  // load past appointments when account view changes
  $scope.$watch('accountView', function (nv, ov) {
    if (nv && nv !== ov) {
      if ($scope.accountView === true) {
        ctrl.getPastAppointmentsByAccount();
      }
    }
  });

  ctrl.appendStartTimeFormat = function (appointment) {
    if (appointment != null) {
      var startPM = new Date(appointment.LocationStartTime).getHours() > 11;
      var endPM = new Date(appointment.LocationEndTime).getHours() > 11;

      appointment.StartTimeFormat =
        startPM == endPM ? 'MMM dd, yyyy h:mm' : 'MMM dd, yyyy h:mm a';
    }
  };

  //#region dynamic properties for past appointments

  // set the displayed name for the appointment state
  ctrl.setAppointmentState = function (appointment) {
    if (!_.isNil($scope.patientAppointmentText)) {
      switch (appointment.PastAppointmentTypeId) {
        case 3:
          appointment.$$State = $scope.patientAppointmentText.completed;
          break;
        case 0:
          appointment.$$State = $scope.patientAppointmentText.canceled;
          break;
        case 1:
          appointment.$$State = $scope.patientAppointmentText.missed;
          break;
        default:
          appointment.$$State = '';
      }
    }
  };

  // find appointment type from list and add to model
  ctrl.setAppointmentType = function (appointment) {
    var appointmentType = listHelper.findItemByFieldValue(
      ctrl.appointmentTypes,
      'AppointmentTypeId',
      appointment.AppointmentTypeId
    );
    if (appointmentType) {
      appointment.$$AppointmentType = appointmentType;
    }
  };

  // we can only schedule past appointments that were not deleted or complete
  ctrl.setCanSchedule = function (appointment) {
    appointment.$$CanSchedule =
      appointment.IsDeleted === true ||
      appointment.PastAppointmentTypeId === 3 ||
      appointment.PastAppointmentTypeId === 0 ||
      appointment.PastAppointmentTypeId === 1
        ? false
        : true;
  };

  // set patient first name in model for use when in account view
  ctrl.setPatientFirstName = function (appointment) {
    var patient = listHelper.findItemByFieldValue(
      $scope.accountMembers,
      'PatientId',
      appointment.PersonId
    );
    appointment.$$FirstName = patient ? patient.FirstName : '';
  };
  // add dynamic properties to model
  ctrl.addDynamicProperties = function () {
    angular.forEach($scope.pastAppointments, function (appointment) {
      // timeZoneFactory.ConvertAppointmentDatesTZ(appointment);
      ctrl.setAppointmentState(appointment);
      ctrl.setProviderInfo(appointment);
      ctrl.setAppointmentType(appointment);
      ctrl.setPatientFirstName(appointment);
      ctrl.setCanSchedule(appointment);
      if (appointment.LocationEndTime) {
        ctrl.appendStartTimeFormat(appointment);
      }
    });
  };

  //#endregion

  // load past appointments based on account id
  ctrl.getPastAppointmentsByAccount = function () {
    if ($scope.accountId) {
      $scope.appointmentLoading = true;
      patientAppointmentsFactory
        .AccountPastAppointments($scope.accountId)
        .then(function (res) {
          $scope.pastAppointments = res.Value;
          $scope.appointmentLoading = false;
          ctrl.addDynamicProperties();
        });
    }
  };

  // load past appointments based on patient id
  ctrl.getPastAppointmentsByPatient = function () {
    if ($scope.patient && !_.isNil($scope.patient.PatientId)) {
      $scope.appointmentLoading = true;
      patientAppointmentsFactory
        .PatientPastAppointments($scope.patient.PatientId)
        .then(function (res) {
          $scope.appointmentLoading = false;
          $scope.pastAppointments = res.Value;
          ctrl.addDynamicProperties();
        });
    }
  };

  // subscribe to appointment history list changes
  $scope.loadPastAppointments = function (loadHistory) {
    if (loadHistory === true) {
      // we need a timeout to insure the update process has finished
      $timeout(function () {
        $scope.accountView === true
          ? ctrl.getPastAppointmentsByAccount()
          : ctrl.getPastAppointmentsByPatient();
      });
    }
  };

  // load first load of past appointments and any dependancies needed for displaying past appointments (providers, appointment types)
  ctrl.loadAllDependancies = function () {
    var initialDependancies = [];
    $scope.appointmentLoading = true;
    // initial past appointments load depends on accountView setting
    if ($scope.accountView === true && !_.isNil($scope.accountId)) {
      initialDependancies.push(
        patientAppointmentsFactory.AccountPastAppointments($scope.accountId)
      );
    }
    if (
      $scope.accountView === false &&
      $scope.patient &&
      !_.isNil($scope.patient.PatientId)
    ) {
      initialDependancies.push(
        patientAppointmentsFactory.PatientPastAppointments(
          $scope.patient.PatientId
        )
      );
    }
    initialDependancies.push(usersFactory.Users());
    initialDependancies.push(appointmentTypesFactory.AppointmentTypes());

    $q.all(initialDependancies).then(function (res) {
      $scope.pastAppointments = res[0].Value;
      ctrl.providers = res[1].Value;
      ctrl.appointmentTypes = res[2].Value;
      ctrl.addDynamicProperties();
      $scope.appointmentLoading = false;
    });
  };

  ctrl.init = function () {
    featureFlagService.getOnce$(fuseFlag.ShowScheduleV2).subscribe((value) => {
      $scope.useV2Schedule = value;
    });
    $scope.loadingDependancies = true;
    patientAppointmentsFactory.observeLoadHistory($scope.loadPastAppointments);
    ctrl.loadAllDependancies();
  };
  ctrl.init();
}

PastAppointmentsController.prototype = Object.create(BaseCtrl.prototype);
