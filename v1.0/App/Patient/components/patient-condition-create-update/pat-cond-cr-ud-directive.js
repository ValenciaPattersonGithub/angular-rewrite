(function () {
  'use strict';

  angular
    .module('Soar.Patient')
    .directive('patientConditionCreateUpdate', patientConditionCreateUpdate);

  patientConditionCreateUpdate.$inject = ['$window'];

  function patientConditionCreateUpdate($window) {
    var directive = {
      restrict: 'E',
      scope: {
        editing: '=?',
      },
      templateUrl: function (elem, attrs) {
        return 'App/Patient/components/patient-condition-create-update/pat-cond-cr-ud.html';
      },
      controller: 'PatientConditionCreateUpdateController',
      link: function link(scope, element, attrs) {
        element.on('$destroy', function elementOnDestroy() {
          scope.$destroy();
        });
      },
    };
    return directive;
  }
})();
