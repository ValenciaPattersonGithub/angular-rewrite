'use strict';

angular.module('Soar.Patient').factory('PatientCountFactory', [
  'PatientCountService',
  function (patientCountService) {
    var count = {
      allPatients: null,
      preventiveCare: null,
      treatmentPlans: null,
      appointments: null,
      otherToDo: null,
      loading: true,
    };

    var updateCount = function (locationId) {
      count.loading = true;
      if (typeof locationId !== 'undefined') {
        patientCountService.Count.get({ locationId: locationId }).$promise.then(
          function (data) {
            count.allPatients = data.Value.AllPatientsCount;
            count.preventiveCare = data.Value.PreventiveCareCount;
            count.treatmentPlans = data.Value.TreatmentPlansCount;
            count.appointments = data.Value.AppointmentsCount;
            count.otherToDo = data.Value.MiscellaneousCount;
            count.loading = false;
          }
        );
      }
    };

    var setCount = function (countName, countAmount) {
      count[countName] = countAmount;
    };

    count.update = updateCount;
    count.set = setCount;

    var getCount = function (locationId) {
      if (typeof locationId !== 'undefined' && locationId !== null) {
        updateCount(locationId);
      }
      return count;
    };

    return {
      getCount: getCount,
    };
  },
]);
