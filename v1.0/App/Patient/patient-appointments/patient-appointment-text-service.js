(function () {
  'use strict';

  angular
    .module('Soar.Patient')
    .service('PatientAppointmentTextService', patientAppointmentTextService);
  patientAppointmentTextService.$inject = ['localize'];

  function patientAppointmentTextService(localize) {
    var getPatientAppointmentText = function () {
      return {
        allAccountMembers: localize.getLocalizedString('All Account Members'),
        history: localize.getLocalizedString('History'),
        preventiveCare: localize.getLocalizedString('Preventive Care'),
        edit: localize.getLocalizedString('Edit'),
        error: localize.getLocalizedString('Error'),
        errorGettingAllAccountMembers: localize.getLocalizedString(
          'An error has occurred while getting all account members'
        ),
        failedToRetrieveListOfAppointmentsForAccount:
          localize.getLocalizedString(
            'Failed to retrieve the list of appointments for the account. Refresh the page to try again.'
          ),
        noPastAppointments: localize.getLocalizedString('No Past Appointments'),
        anyProvider: localize.getLocalizedString('Any Provider'),
        statusNote: localize.getLocalizedString('Status Note'),
        close: localize.getLocalizedString('Close'),
        completed: localize.getLocalizedString('Completed'),
        canceled: localize.getLocalizedString('Canceled'),
        missed: localize.getLocalizedString('Missed'),
      };
    };

    return {
      getPatientAppointmentText: getPatientAppointmentText,
    };
  }
})();
