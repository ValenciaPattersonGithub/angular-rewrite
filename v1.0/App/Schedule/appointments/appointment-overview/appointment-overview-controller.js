'use strict';

angular.module('Soar.Schedule').controller('AppointmentOverviewController', [
  '$scope',
  'StaticData',
  'SaveStates',
  'ModalFactory',
  '$timeout',
  '$window',
  'ScheduleServices',
  'userSettingsDataService',
  'tabLauncher',
  function (
    $scope,
    staticData,
    saveStates,
    modalFactory,
    $timeout,
    $window,
    scheduleServices,
    userSettingsDataService,
    tabLauncher
  ) {
    var ctrl = this;

    $scope.hasChanges = false;

    $scope.cancelChanges = function () {
      if ($scope.frmAppointmentOverview.$dirty) {
        modalFactory.CancelModal().then($scope.cancelFunction);
      } else {
        $scope.cancelFunction();
      }
    };

    $scope.saveChanges = function () {
      var c1, c2, c3;

      var dateObject, timeObject;
      var providerTimeValid = true;

      dateObject = $scope.appointmentDate;
      timeObject = $scope.appointmentTime;

      angular.forEach(
        $scope.providerAppointments,
        function (providerAppointment) {
          providerTimeValid = providerTimeValid && providerAppointment.valid;
        }
      );

      timeObject.Valid =
        timeObject.start != null &&
        moment(timeObject.start).isValid() &&
        timeObject.end != null &&
        moment(timeObject.end).isValid();

      if (timeObject.Valid && dateObject && providerTimeValid) {
        ctrl.cancelAppointmentTimeWatch();

        ctrl.setAppointmentDateTime(
          $scope.appointmentDate,
          $scope.appointmentTime
        );

        ctrl.setProviderAppointmentsDateTime();

        c1 =
          $scope.appointment.StartTime != undefined &&
          $scope.appointment.StartTime != null;
        c2 =
          $scope.appointment.EndTime != undefined &&
          $scope.appointment.EndTime != null;
        c3 = $scope.appointment.EndTime > $scope.appointment.StartTime;

        $scope.isValid = c1 && c2 && c3;

        if ($scope.isValid) {
          $scope.saveFunction();
        } else {
          ctrl.cancelAppointmentTimeWatch = $scope.$watch(
            'appointmentTime',
            ctrl.appointmentTimeChanged,
            true
          );
        }
      }
    };

    $scope.showRemoveModal = function () {
      $scope.removeClicked = true;
      //modalFactory.AppointmentRemoveModal($scope.appointment.Data.Classification).then(ctrl.confirmDelete, ctrl.cancelDelete);
    };

    ctrl.initializeAppointmentTimes = function () {
      var startTime, endTime;
      $scope.appointmentTime = {
        start: null,
        end: null,
        valid: true,
      };

      if ($scope.appointment.start) {
        $scope.appointment.start.setSeconds(0);
        $scope.appointment.start.setMilliseconds(0);

        startTime = moment($scope.appointment.start);
        $scope.appointmentTime.start = startTime.toISOString();
      }

      if ($scope.appointment.end) {
        $scope.appointment.end.setSeconds(0);
        $scope.appointment.end.setMilliseconds(0);

        endTime = moment($scope.appointment.end);
        $scope.appointmentTime.end = endTime.toISOString();
      }

      angular.forEach(
        $scope.appointment.ProviderAppointments,
        function (providerAppointment) {
          startTime = moment(providerAppointment.StartTime);
          providerAppointment.StartTime = startTime.toISOString();

          endTime = moment(providerAppointment.EndTime);
          providerAppointment.EndTime = endTime.toISOString();

          providerAppointment.Duration = ctrl.getDuration(
            providerAppointment.StartTime,
            providerAppointment.EndTime
          );
        }
      );

      $scope.appointmentTime.Duration = ctrl.getDuration(
        $scope.appointmentTime.start,
        $scope.appointmentTime.end
      );

      ctrl.originalAppointmentTime = angular.copy($scope.appointmentTime);
    };

    ctrl.getDuration = function (startTime, endTime) {
      if (startTime != null && endTime != null) {
        var startMoment = moment(startTime);
        var endMoment = moment(endTime);

        return endMoment.diff(startMoment, 'minutes');
      }

      return 0;
    };

    ctrl.setAppointmentDateTime = function (dateObject, timeObject) {
      // Convert time to date and set appointment.Data.StartTime/EndTime
      var date = new Date(dateObject);

      var startWithDate = new Date(timeObject.start);
      var endWithDate = new Date(timeObject.end);

      startWithDate.setFullYear(date.getFullYear());
      startWithDate.setMonth(date.getMonth(), date.getDate());

      endWithDate.setFullYear(date.getFullYear());
      endWithDate.setMonth(date.getMonth(), date.getDate());

      $scope.appointment.start = startWithDate;
      $scope.appointment.end = endWithDate;

      scheduleServices.ProviderTime($scope.appointment).Calculate();

      $scope.appointment.StartTime = startWithDate;
      $scope.appointment.EndTime = endWithDate;
    };

    ctrl.setProviderAppointmentsDateTime = function () {
      var date = new Date($scope.appointmentDate);
      var startWithDate;
      var endWithDate;

      for (var p = 0; p < $scope.appointment.ProviderAppointments.length; p++) {
        if (
          $scope.appointment.ProviderAppointments[p].StartTime &&
          $scope.appointment.ProviderAppointments[p].EndTime
        ) {
          startWithDate = new Date(
            $scope.appointment.ProviderAppointments[p].StartTime
          );
          endWithDate = new Date(
            $scope.appointment.ProviderAppointments[p].EndTime
          );

          startWithDate.setFullYear(date.getFullYear());
          startWithDate.setMonth(date.getMonth(), date.getDate());

          endWithDate.setFullYear(date.getFullYear());
          endWithDate.setMonth(date.getMonth(), date.getDate());

          $scope.appointment.ProviderAppointments[p].StartTime = startWithDate;
          $scope.appointment.ProviderAppointments[p].EndTime = endWithDate;
        }
      }
    };

    $scope.goToPatient = function () {
      let patientPath = '#/Patient/';
      var href =
        patientPath + $scope.appointment.Patient.PatientId + '/Overview';
      tabLauncher.launchNewTab(href);
    };

    ctrl.appointmentTimeChanged = function (newTime, oldTime) {
      if (newTime && newTime != oldTime) {
        ctrl.cancelAppointmentTimeWatch();

        var originalDuration, newStart, newEnd;

        if (
          newTime.start != oldTime.start &&
          oldTime.Duration != null &&
          oldTime.Duration >= 0
        ) {
          newEnd = moment(newTime.start);

          newEnd.add(oldTime.Duration, 'm');

          newTime.end = newEnd.toISOString();
          newTime.Duration = oldTime.Duration;
        } else if (newTime.end != oldTime.end) {
          newTime.Duration = ctrl.getDuration(newTime.start, newTime.end);
        }

        ctrl.cancelAppointmentTimeWatch = $scope.$watch(
          'appointmentTime',
          ctrl.appointmentTimeChanged,
          true
        );
      }

      ctrl.checkForChanges();
    };

    ctrl.checkForChanges = function () {
      $scope.hasChanges =
        ctrl.originalAppointmentTime.start != $scope.appointmentTime.start ||
        ctrl.originalAppointmentTime.end != $scope.appointmentTime.end ||
        ctrl.originalAppointment.Status != $scope.appointment.Status ||
        ctrl.originalAppointment.StatusNote != $scope.appointment.StatusNote;
    };

    ctrl.cancelAppointmentTimeWatch = $scope.$watch(
      'appointmentTime',
      ctrl.appointmentTimeChanged,
      true
    );

    // List of symbols that can be used for master alerts
    $scope.getClass = function (id) {
      return id
        ? $scope.symbolList.getClassById(id)
        : 'fas fa-exclamation-triangle';
    };

    $scope.display = $scope.displayFunction();

    $scope.symbolList = staticData.AlertIcons();

    // Set to 240 so that provider times on modal open can be set correctly.
    $scope.appointmentDuration = 240;

    $scope.appointmentDate = $scope.appointment.StartTime
      ? new Date($scope.appointment.StartTime)
      : null;

    ctrl.initializeAppointmentTimes();

    $scope.PracticeSettings = $scope.display.PracticeSettings;

    $scope.isValid = true;

    ctrl.originalAppointment = angular.copy($scope.appointment);

    $scope.$watch(
      'appointment',
      function (nv, ov) {
        ctrl.checkForChanges();
      },
      true
    );
  },
]);
