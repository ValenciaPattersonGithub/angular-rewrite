'use strict';

angular.module('Soar.Patient').factory('PatientLandingGridFactory', [
  'AllPatientsGridFactory',
  'PreventiveCareGridFactory',
  'TreatmentPlanGridFactory',
  'AppointmentsGridFactory',
  'OtherToDoGridFactory',
  function (
    allPatientsGridFactory,
    preventiveCareGridFactory,
    treatmentPlansGridFactory,
    appointmentsGridFactory,
    otherToDoGridFactory
  ) {
    var factories = {
      allPatientsGridFactory: allPatientsGridFactory,
      preventiveCareGridFactory: preventiveCareGridFactory,
      treatmentPlansGridFactory: treatmentPlansGridFactory,
      appointmentsGridFactory: appointmentsGridFactory,
      otherToDoGridFactory: otherToDoGridFactory,
    };

    return factories;
  },
]);
