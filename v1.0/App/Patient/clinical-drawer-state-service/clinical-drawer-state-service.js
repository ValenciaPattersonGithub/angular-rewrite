(function () {
  'use strict';
  angular
    .module('Soar.Patient')
    .service('ClinicalDrawerStateService', clinicalDrawerStateService);

  clinicalDrawerStateService.$inject = ['DrawerNotificationService'];

  function clinicalDrawerStateService(drawerNotificationService) {
    var service = this;

    service.drawerObservers = [];
    service.drawerState = false;

    service.updateDrawerObservers = function (state) {
      for (let i = 0; i < service.drawerObservers.length; i++) {
        if (
          service.drawerObservers[i] !== null &&
          service.drawerObservers[i] !== undefined
        ) {
          service.drawerObservers[i](state);
        }
      }
    };

    service.changeDrawerState = function (state) {
      service.drawerState = state;
      service.updateDrawerObservers(state);

      // notify the observers who are written in angular
      drawerNotificationService.changeDrawerState(state);
    };

    service.registerObserver = function (observer) {
      let result = false;
      if (
        observer !== null &&
        observer !== undefined &&
        service.drawerObservers !== null &&
        service.drawerObservers !== undefined
      ) {
        service.drawerObservers.push(observer);
        result = true;
      }

      return result;
    };

    service.clearObserver = function (observer) {
      if (
        observer !== null &&
        observer !== undefined &&
        service.drawerObservers !== null &&
        service.drawerObservers !== undefined
      ) {
        for (let i = 0; i < service.drawerObservers.length; i++) {
          if (service.drawerObservers[i] === observer) {
            service.drawerObservers.splice(i, 1);
          }
        }
      }
    };

    service.getDrawerState = function () {
      return service.drawerState;
    };

    service.getObserversForTesting = function () {
      return service.drawerObservers;
    };

    return {
      changeDrawerState: service.changeDrawerState,
      updateDrawerObservers: service.updateDrawerObservers,
      registerObserver: service.registerObserver,
      clearObserver: service.clearObserver,
      getDrawerState: service.getDrawerState, // for getting the initial state when starting to observe the value.
      getObserversForTesting: service.getObserversForTesting, // used to allow for testing of the methods
    };
  }
})();
