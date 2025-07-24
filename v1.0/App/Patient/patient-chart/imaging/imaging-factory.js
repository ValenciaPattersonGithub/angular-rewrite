'use strict';
angular.module('Soar.Patient').factory('PatientImagingExamFactory', [
  '$q',
  function ($q) {
    var refreshTrigger = $q.defer();

    return {
      SelectedExamId: null,
      setSelectedExamId: function (selectedExamId) {
        this.SelectedExamId = selectedExamId;
        return selectedExamId;
      },
      getRefreshPromise: function () {
        return refreshTrigger.promise;
      },
      notifyRefresh: function () {
        refreshTrigger.notify();
      },
    };
  },
]);
