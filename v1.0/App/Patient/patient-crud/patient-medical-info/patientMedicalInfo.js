(function () {
  'use strict';

  angular
    .module('Soar.Patient')
    .directive('patientMedicalInfo', patientMedicalInfo);

  patientMedicalInfo.$inject = ['$window'];

  function patientMedicalInfo($window) {
    // Usage:
    //     <patient-medical-info></patient-medical-info>
    // Creates:
    //
    var directive = {
      link: link,
      restrict: 'EA',
      templateUrl:
        'App/Patient/patient-crud/patient-medical-info/patientMedicalInfo.html',
      controller: 'PatientMedicalInfoController',
    };
    return directive;

    function link(scope, element, attrs) {}
  }
})();
