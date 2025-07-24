(function () {
  'use strict';

  angular
    .module('Soar.Patient')
    .directive('patientConditions', patientConditions);

  patientConditions.$inject = ['$window'];

  function patientConditions($window) {
    // Usage:
    //     <patient-conditions></patient-conditions>
    // Creates:
    //
    var directive = {
      link: link,
      restrict: 'EA',
      templateUrl:
        'App/Patient/patient-crud/patient-conditions/patientConditions.html',
      controller: 'PatientConditionsController',
    };
    return directive;

    function link(scope, element, attrs) {}
  }
})();
