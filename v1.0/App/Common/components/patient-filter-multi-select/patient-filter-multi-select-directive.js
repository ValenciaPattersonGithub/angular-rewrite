angular
  .module('common.directives')
  .directive('patientFilterMultiSelect', function () {
    return {
      restrict: 'E',
      scope: {
        options: '=',
        textField: '@',
        valueField: '@',
        changeEvent: '&?',
        dropDownLabel: '@?',
        maxVisibleOptions: '=?',
        disableInput: '=?',
      },
      templateUrl:
        'App/Common/components/patient-filter-multi-select/patient-filter-multi-select.html',
      controller: 'PatientFilterMultiSelectController',
      link: function link(scope, elem) {
        scope.element = elem;
        elem.on('$destroy', function elementOnDestroy() {
          scope.$destroy();
        });
      },
    };
  });
