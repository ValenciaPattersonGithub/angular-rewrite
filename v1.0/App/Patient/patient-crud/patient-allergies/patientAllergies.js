(function () {
  'use strict';

  angular
    .module('Soar.Patient')
    .directive('patientAllergies', patientAllergies);

  patientAllergies.$inject = ['$window'];

  function patientAllergies($window) {
    var directive = {
      link: link,
      restrict: 'EA',
      templateUrl:
        'App/Patient/patient-crud/patient-allergies/patientAllergies.html',
      controller: 'PatientAllergiesController',
    };
    return directive;

    function link(scope, element, attrs) {}
  }
})();
