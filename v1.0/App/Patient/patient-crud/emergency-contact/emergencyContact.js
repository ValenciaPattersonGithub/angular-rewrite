(function () {
  'use strict';

  angular
    .module('Soar.Patient')
    .directive('emergencyContact', emergencyContact);

  emergencyContact.$inject = ['$window'];

  function emergencyContact($window) {
    var directive = {
      link: link,
      restrict: 'EA',
      templateUrl:
        'App/Patient/patient-crud/emergency-contact/emergencyContact.html',
      controller: 'EmergencyContactController',
    };
    return directive;

    function link(scope, element, attrs) {}
  }
})();
