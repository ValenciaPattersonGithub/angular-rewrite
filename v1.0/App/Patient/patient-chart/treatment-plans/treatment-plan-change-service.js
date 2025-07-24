(function () {
  'use strict';
  angular
    .module('Soar.Patient')
    .service('TreatmentPlanChangeService', treatmentPlanChangeService);

  treatmentPlanChangeService.$inject = [];

  function treatmentPlanChangeService() {
    var service = this;

    service.treatmentPlanStageOrderObservers = [];
    service.treatmentPlanStageOrder = null;

    service.updateTreatmentPlanStageOrderObservers = function (state) {
      for (
        let i = 0;
        i < service.treatmentPlanStageOrderObservers.length;
        i++
      ) {
        if (
          service.treatmentPlanStageOrderObservers[i] !== null &&
          service.treatmentPlanStageOrderObservers[i] !== undefined
        ) {
          service.treatmentPlanStageOrderObservers[i]();
        }
      }
    };

    service.changeTreatmentPlanStageOrderState = function (state) {
      service.treatmentPlanStageOrder = state;
      service.updateTreatmentPlanStageOrderObservers(state);
    };

    service.registerTreatmentPlanStageOrderObserver = function (observer) {
      let result = false;
      if (
        observer !== null &&
        observer !== undefined &&
        service.treatmentPlanStageOrderObservers !== null &&
        service.treatmentPlanStageOrderObservers !== undefined
      ) {
        service.treatmentPlanStageOrderObservers.push(observer);
        result = true;
      }

      return result;
    };

    service.clearTreatmentPlanStageOrderObserver = function (observer) {
      if (
        observer !== null &&
        observer !== undefined &&
        service.treatmentPlanStageOrderObservers !== null &&
        service.treatmentPlanStageOrderObservers !== undefined
      ) {
        for (
          let i = 0;
          i < service.treatmentPlanStageOrderObservers.length;
          i++
        ) {
          if (service.treatmentPlanStageOrderObservers[i] === observer) {
            service.treatmentPlanStageOrderObservers.splice(i, 1);
          }
        }
      }
    };

    service.getTreatmentPlanStageOrderState = function () {
      return service.treatmentPlanStageOrder;
    };

    service.setTreatmentPlanStageOrderState = function (value) {
      service.treatmentPlanStageOrder = value;
    };

    service.getTreatmentPlanStageOrderObserversForTesting = function () {
      return service.treatmentPlanStageOrderObserver;
    };

    // Functions allowing for
    // angular telling angular js to close the current page

    service.closeObservers = [];
    service.closeState = false;

    service.updateCloseObservers = function (state) {
      for (let i = 0; i < service.closeObservers.length; i++) {
        if (
          service.closeObservers[i] !== null &&
          service.closeObservers[i] !== undefined
        ) {
          service.closeObservers[i](state);
        }
      }
    };

    service.changeCloseState = function (state) {
      service.closeState = state;
      service.updateCloseObservers(state);
    };

    service.registerCloseObserver = function (observer) {
      let result = false;
      if (
        observer !== null &&
        observer !== undefined &&
        service.closeObservers !== null &&
        service.closeObservers !== undefined
      ) {
        service.closeObservers.push(observer);
        result = true;
      }

      return result;
    };

    service.clearCloseObserver = function (observer) {
      if (
        observer !== null &&
        observer !== undefined &&
        service.closeObservers !== null &&
        service.closeObservers !== undefined
      ) {
        for (let i = 0; i < service.closeObservers.length; i++) {
          if (service.closeObservers[i] === observer) {
            service.closeObservers.splice(i, 1);
          }
        }
      }
    };

    service.getCloseState = function () {
      return service.closeState;
    };

    service.setCloseState = function (value) {
      service.closeState = value;
    };

    // Functions allowing for
    // angular telling angular js to open the drawer area
    service.openDrawerObservers = [];
    service.openDrawerState = false;

    service.updateOpenDrawerObservers = function (state) {
      for (let i = 0; i < service.openDrawerObservers.length; i++) {
        if (
          service.openDrawerObservers[i] !== null &&
          service.openDrawerObservers[i] !== undefined
        ) {
          service.openDrawerObservers[i](state);
        }
      }
    };

    service.changeOpenDrawerState = function (state) {
      service.openDrawerState = state;
      service.updateOpenDrawerObservers(state);
    };

    service.registerOpenDrawerObserver = function (observer) {
      let result = false;
      if (
        observer !== null &&
        observer !== undefined &&
        service.openDrawerObservers !== null &&
        service.openDrawerObservers !== undefined
      ) {
        service.openDrawerObservers.push(observer);
        result = true;
      }

      return result;
    };

    service.clearOpenDrawerObserver = function (observer) {
      if (
        observer !== null &&
        observer !== undefined &&
        service.openDrawerObservers !== null &&
        service.openDrawerObservers !== undefined
      ) {
        for (let i = 0; i < service.openDrawerObservers.length; i++) {
          if (service.openDrawerObservers[i] === observer) {
            service.openDrawerObservers.splice(i, 1);
          }
        }
      }
    };

    service.getOpenDrawerState = function () {
      return service.closeState;
    };

    service.setOpenDrawerState = function (value) {
      service.closeState = value;
    };

    return {
      changeTreatmentPlanStageOrderState:
        service.changeTreatmentPlanStageOrderState,
      updateTreatmentPlanStageOrderObservers:
        service.updateTreatmentPlanStageOrderObservers,
      registerTreatmentPlanStageOrderObserver:
        service.registerTreatmentPlanStageOrderObserver,
      clearTreatmentPlanStageOrderObserver:
        service.clearTreatmentPlanStageOrderObserver,
      getTreatmentPlanStageOrderState: service.getTreatmentPlanStageOrderState, // for getting the initial state when starting to observe the value.
      setTreatmentPlanStageOrderState: service.getTreatmentPlanStageOrderState,
      getTreatmentPlanStageOrderObserversForTesting:
        service.getTreatmentPlanStageOrderObserversForTesting, // used to allow for testing of the methods

      // methods for new service edit page telling angular js that we want to close the existing page
      updateCloseObservers: service.updateCloseObservers,
      changeCloseState: service.changeCloseState,
      registerCloseObserver: service.registerCloseObserver,
      clearCloseObserver: service.clearCloseObserver,
      getCloseState: service.getCloseState,
      setCloseState: service.setCloseState,

      // methods for new service edit page telling angular js that we want to open the drawer area
      updateOpenDrawerObservers: service.updateOpenDrawerObservers,
      changeOpenDrawerState: service.changeOpenDrawerState,
      registerOpenDrawerObserver: service.registerOpenDrawerObserver,
      clearOpenDrawerObserver: service.clearOpenDrawerObserver,
      getOpenDrawerState: service.getOpenDrawerState,
      setOpenDrawerState: service.setOpenDrawerState,
    };
  }
})();
