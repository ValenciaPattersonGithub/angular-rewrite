(function () {
  'use strict';
  angular
    .module('Soar.Schedule')
    .service(
      'ClipboardAppointmentUpdateService',
      clipboardAppointmentUpdateService
    );

  clipboardAppointmentUpdateService.$inject = [];

  function clipboardAppointmentUpdateService() {
    var service = this;

    service.clipboardAppointmentUpdateObservers = [];

    service.updateClipboardAppointments = function () {
      for (
        let i = 0;
        i < service.clipboardAppointmentUpdateObservers.length;
        i++
      ) {
        if (
          service.clipboardAppointmentUpdateObservers[i] !== null &&
          service.clipboardAppointmentUpdateObservers[i] !== undefined
        ) {
          service.clipboardAppointmentUpdateObservers[i]();
        }
      }
    };

    service.registerObserver = function (observer) {
      let result = false;
      if (
        observer !== null &&
        observer !== undefined &&
        service.clipboardAppointmentUpdateObservers !== null &&
        service.clipboardAppointmentUpdateObservers !== undefined
      ) {
        service.clipboardAppointmentUpdateObservers.push(observer);
        result = true;
      }

      return result;
    };

    service.clearObserver = function (observer) {
      if (
        observer !== null &&
        observer !== undefined &&
        service.clipboardAppointmentUpdateObservers !== null &&
        service.clipboardAppointmentUpdateObservers !== undefined
      ) {
        for (
          let i = 0;
          i < service.clipboardAppointmentUpdateObservers.length;
          i++
        ) {
          if (service.clipboardAppointmentUpdateObservers[i] === observer) {
            service.clipboardAppointmentUpdateObservers.splice(i, 1);
          }
        }
      }
    };

    return {
      updateClipboardAppointments: service.updateClipboardAppointments,
      registerObserver: service.registerObserver,
      clearObserver: service.clearObserver,
    };
  }
})();
