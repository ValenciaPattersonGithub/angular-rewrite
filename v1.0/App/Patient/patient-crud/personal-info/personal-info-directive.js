'use strict';

angular.module('Soar.Patient').directive('personalInfo', function () {
  return {
    restrict: 'E',
    templateUrl: 'App/Patient/patient-crud/personal-info/personal-info.html',
    scope: {
      person: '=',
      phones: '=',
      setFocusOnInput: '=',
    },
    controller: 'PersonalInfoController',
    link: function link(scope, element, attrs) {
      element.on('$destroy', function elementOnDestroy() {
        scope.$destroy();
      });
    },
  };
});
