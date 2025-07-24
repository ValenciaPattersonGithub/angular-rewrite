(function () {
  'use strict';

  angular
    .module('Soar.Schedule')
    .factory(
      'AppointmentClassificationService',
      appointmentClassificationService
    );

  //appointmentClassificationService.$inject = [''];

  function appointmentClassificationService() {
    var self = this;

    self.getAppointmentClassificationTypes = getAppointmentClassificationTypes;

    return self;

    function getAppointmentClassificationTypes() {
      return {
        Regular: 0,
        Block: 1,
        Unscheduled: 2,
      };
    }
  }
})();
