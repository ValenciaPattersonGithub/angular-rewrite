// some place to put the links we have that are used in a number of places
(function () {
  'use strict';

  angular
    .module('Soar.Schedule')
    .factory('AppointmentModalLinksService', appointmentModalLinksService);
  appointmentModalLinksService.$inject = [
    'tabLauncher',
    '$routeParams',
    '$window',
    'userSettingsDataService',
  ];

  function appointmentModalLinksService(
    tabLauncher,
    $routeParams,
    window,
    userSettingsDataService
  ) {
    // this is just a temporary thing for converted APIs and the old methods that we used to utilize before converting.
    var service = {
      navigateToLink: navigateToLink,
      appointmentLinks: appointmentLinks,
    };

    return service;

    function navigateToLink(type, patientId) {
      let patientPath = '#/Patient/';

      let value = '';
      if (type === 'overview') {
        value = patientPath + patientId + '/Overview';
      } else if (type === 'patientProfile') {
        value =
          patientPath +
          patientId +
          '/Summary/?tab=Profile&currentPatientId=' +
          patientId;
      } else if (type === 'insuranceInformation') {
        value =
          patientPath +
          patientId +
          '/Summary/?tab=Insurance%20Information&currentPatientId=' +
          patientId;
      } else if (type === 'appointments') {
        value = patientPath + patientId + '/Appointments';
      } else if (type === 'clinical') {
        value = patientPath + patientId + '/Clinical';
      } else if (type === 'health') {
        value =
          patientPath +
          patientId +
          '/Clinical/?tab=0&activeSubTab=0&currentPatientId=' +
          patientId;
      } else if (type === 'ledger') {
        value =
          patientPath +
          patientId +
          '/Clinical/?tab=2&activeSubTab=0&currentPatientId=' +
          patientId;
      } else if (type === 'perio') {
        value =
          patientPath +
          patientId +
          '/Clinical/?tab=3&activeSubTab=0&currentPatientId=' +
          patientId;
      } else if (type === 'images') {
        value =
          patientPath +
          patientId +
          '/Clinical/?tab=4&activeSubTab=0&currentPatientId=' +
          patientId;
      } else if (type === 'rx') {
        value =
          patientPath +
          patientId +
          '/Clinical/?tab=5&activeSubTab=0&currentPatientId=' +
          patientId;
      } else if (type === 'charting') {
        value =
          patientPath +
          patientId +
          '/Clinical/?tab=1&activeSubTab=1&currentPatientId=' +
          patientId;
      } else if (type === 'treatmentPlans') {
        value =
          patientPath +
          patientId +
          '/Clinical/?tab=1&activeSubTab=2&currentPatientId=' +
          patientId;
      } else if (type === 'notes') {
        value =
          patientPath +
          patientId +
          '/Clinical/?tab=1&activeSubTab=3&currentPatientId=' +
          patientId;
      } else if (type === 'account') {
        value = patientPath + patientId + '/Summary/?tab=Account%20Summary';
      } else if (type === 'transactionHistory') {
        value =
          patientPath +
          patientId +
          '/Summary/?tab=Transaction%20History&currentPatientId=' +
          patientId;
      }

      tabLauncher.launchNewTab(value);
    }

    function appointmentLinks(appointment, currentUrl, hasChanges) {
      let value = '';

      // save the current browser location
      // this is done so I can return where we were after saving
      sessionStorage.setItem('fuse-last-url', currentUrl);

      if (appointment && appointment.AppointmentId && hasChanges === false) {
        $routeParams = { date: '' };
        value = '#/Schedule/Appointment/' + appointment.AppointmentId + '/';

        // unscheduled items will fall in this category when they have not changed
        // so we need to ensure we do not require the startTime value.
        if (appointment.StartTime) {
          let year = appointment.StartTime.getFullYear();
          let month = appointment.StartTime.getMonth() + 1;
          let date = appointment.StartTime.getDate();
          let fullDate = year + '-' + month + '-' + date;
          value += '?date=' + fullDate;
        }
      } else if (
        appointment &&
        appointment.AppointmentId &&
        hasChanges === true
      ) {
        // this is meant to be used by pinned and unscheduled appointments that have been updated but not saved before coming here.
        // example dragging from the pinned appointment area.

        $routeParams = { date: '' };
        value = '#/Schedule/Appointment/' + appointment.AppointmentId + '/';

        // if location set location variable
        let ofcLocation = appointment.LocationId;
        value += '?location=' + ofcLocation;

        value = setupExtraUrlParams(appointment, value); // if startTime
      } else if (
        appointment &&
        (appointment.AppointmentId === null ||
          appointment.AppointmentId === undefined) &&
        appointment.Classification === 2
      ) {
        // from the schedule we are attempting to create a new unscheduled appointment.

        $routeParams = { date: '' };
        value = '#/Schedule/Appointment/';

        // if location set location variable
        let ofcLocation = appointment.LocationId;
        value += '?location=' + ofcLocation;

        // if duration set duration variable
        let duration = appointment.ProposedDuration;
        if (duration) {
          value += '&duration=' + duration;
        }

        let classification = appointment.Classification;
        if (classification) {
          value += '&classification=' + classification;
        }

        // in some instances the Person is known when creating a new appointment.
        let person = appointment.PersonId;
        if (person) {
          value += '&person=' + person;
        }
      } else {
        value = '#/Schedule/Appointment/';

        // if location set location variable
        let ofcLocation = appointment.LocationId;
        value += '?location=' + ofcLocation;

        // in some instances the Person is known when creating a new appointment.
        let person = appointment.PersonId;
        if (person) {
          value += '&person=' + person;
        }

        value = setupExtraUrlParams(appointment, value); // if startTime

        // we will have to setup the provider hours on the appointment modal.
      }

      window.open(value, '_self');
    }

    function setupExtraUrlParams(appointment, value) {
      // if room set room variable
      let room = appointment.TreatmentRoomId;
      if (room) {
        value += '&room=' + room;
      }

      // if provider set provider variable
      let provider = appointment.UserId;
      if (provider) {
        value += '&provider=' + provider;
      }

      // if appointment type set appointment type variable
      let appointmentType = appointment.AppointmentTypeId;
      if (appointmentType) {
        value += '&appointmenttype=' + appointmentType;
      }

      // if startTime
      let fullDate = null;
      let startTime = null;
      if (appointment.StartTime) {
        let year = appointment.StartTime.getFullYear();
        let month = appointment.StartTime.getMonth() + 1;
        let date = appointment.StartTime.getDate();
        fullDate = year + '-' + month + '-' + date;

        let hour = appointment.StartTime.getHours();
        let minute = appointment.StartTime.getMinutes();
        let second = appointment.StartTime.getSeconds();
        startTime = hour + ':' + minute + ':' + second;

        value += '&date=' + fullDate + '&start=' + startTime;
      }
      // if endtime
      let endTime = null;
      if (appointment.StartTime) {
        let hour = appointment.EndTime.getHours();
        let minute = appointment.EndTime.getMinutes();
        let second = appointment.EndTime.getSeconds();
        endTime = hour + ':' + minute + ':' + second;

        value += '&end=' + endTime;
      }

      return value;
    }
  }
})();
