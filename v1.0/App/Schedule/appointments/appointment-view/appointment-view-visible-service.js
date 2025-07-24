(function () {
  'use strict';
  angular
    .module('Soar.Schedule')
    .service('AppointmentViewVisibleService', appointmentViewVisibleService);

  appointmentViewVisibleService.$inject = [];

  function appointmentViewVisibleService() {
    var service = this;

    service.appointmentViewVisibleObservers = [];
    service.appointmentViewIsVisible = false;
    service.secondaryAppointmentViewIsVisible = false;

    service.updateAppointmentViewVisibleObservers = function (
      visible,
      secondaryVisible
    ) {
      for (let i = 0; i < service.appointmentViewVisibleObservers.length; i++) {
        if (
          service.appointmentViewVisibleObservers[i] !== null &&
          service.appointmentViewVisibleObservers[i] !== undefined
        ) {
          service.appointmentViewVisibleObservers[i](visible, secondaryVisible);
        }
      }
    };

    service.changeAppointmentViewVisible = function (
      visible,
      secondaryVisible
    ) {
      // cannot have both views visible ensure that cannot happen
      if (visible === true && secondaryVisible === true) {
        secondaryVisible = false;
      }

      service.appointmentViewIsVisible = visible;
      service.secondaryAppointmentViewIsVisible = secondaryVisible;
      service.updateAppointmentViewVisibleObservers(visible, secondaryVisible);
    };

    service.registerObserver = function (observer) {
      let result = false;
      if (
        observer !== null &&
        observer !== undefined &&
        service.appointmentViewVisibleObservers !== null &&
        service.appointmentViewVisibleObservers !== undefined
      ) {
        service.appointmentViewVisibleObservers.push(observer);
        result = true;
      }

      return result;
    };

    service.clearObserver = function (observer) {
      if (
        observer !== null &&
        observer !== undefined &&
        service.appointmentViewVisibleObservers !== null &&
        service.appointmentViewVisibleObservers !== undefined
      ) {
        for (
          let i = 0;
          i < service.appointmentViewVisibleObservers.length;
          i++
        ) {
          if (service.appointmentViewVisibleObservers[i] === observer) {
            service.appointmentViewVisibleObservers.splice(i, 1);
          }
        }
      }
    };

    service.getAppointmentViewVisible = function () {
      return service.appointmentViewIsVisible;
    };

    service.getSecondaryAppointmentViewVisible = function () {
      return service.secondaryAppointmentViewIsVisible;
    };

    service.setAppointmentViewVisible = function (value) {
      service.appointmentViewIsVisible = value;
    };

    service.setSecondaryAppointmentViewVisible = function (value) {
      service.secondaryAppointmentViewIsVisible = value;
    };

    service.getObserversForTesting = function () {
      return service.appointmentViewVisibleObservers;
    };

    return {
      changeAppointmentViewVisible: service.changeAppointmentViewVisible,
      updateAppointmentViewVisibleObservers:
        service.updateAppointmentViewVisibleObservers,
      registerObserver: service.registerObserver,
      clearObserver: service.clearObserver,
      getAppointmentViewVisible: service.getAppointmentViewVisible, // for getting the initial state when starting to observe the value.
      setAppointmentViewVisible: service.setAppointmentViewVisible,
      setSecondaryAppointmentViewVisible:
        service.setSecondaryAppointmentViewVisible,
      getObserversForTesting: service.getObserversForTesting, // used to allow for testing of the methods
    };
  }
})();
