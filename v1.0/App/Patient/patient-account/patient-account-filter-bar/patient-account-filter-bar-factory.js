'use strict';

angular.module('Soar.Patient').factory('PatientAccountFilterBarFactory', [
  function () {
    var factory = this;
    // The array of listeners hooked in to the changes made when the setFilterBarStatus function is called
    factory.observers = [];

    // Sets the filter bar status (bool), updates observers
    // This should only be controlled by Transaction History
    var setFilterBarStatus = function (status) {
      // Update the filter bar with the new status
      if (!_.isEmpty(factory.observers)) {
        _.forEach(factory.observers, function (observer) {
          observer(status);
        });
      }
    };

    // Reset the observers array so that old controllers are not still in the list
    // We will need to remove the correct observer when there are more instances of this directive
    var resetFilterBarObservers = function () {
      factory.observers = [];
    };

    // Return the list of observers for testing
    var getObserversList = function () {
      return factory.observers;
    };

    return {
      setFilterBarStatus: setFilterBarStatus,
      observeFilterBarStatus: function (observer) {
        factory.observers.push(observer);
      },
      resetFilterBarObservers: resetFilterBarObservers,
      getObserversList: getObserversList,
    };
  },
]);
