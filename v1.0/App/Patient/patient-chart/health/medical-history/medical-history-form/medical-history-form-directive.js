'use strict';

angular
  .module('Soar.Patient')
  .directive('medicalHistoryFormDirective', function () {
    return {
      controller: 'MedicalHistoryFormController',
      templateUrl:
        'App/Patient/patient-chart/health/medical-history/medical-history-form/medical-history-form.html',
      restrict: 'E',
      scope: {
        medicalHistoryFormSections: '=',
        viewOnly: '=',
        inputIsDisabled: '=',
        onRender: '&',
      },
      link: function link(scope, element, attrs) {
        element.on('$destroy', function elementOnDestroy() {
          scope.$destroy();
        });
      },
    };
  });
