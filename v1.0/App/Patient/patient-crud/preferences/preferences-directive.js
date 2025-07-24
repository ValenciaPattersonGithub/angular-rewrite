'use strict';

angular.module('Soar.Patient').directive('preferences', function () {
  return {
    restrict: 'E',
    templateUrl: 'App/Patient/patient-crud/preferences/preferences.html',
    scope: {
      person: '=',
      setFocusOnInput: '=',
    },
    controller: 'PreferencesController',
    link: function link(scope, element, attrs) {
      element.on('$destroy', function elementOnDestroy() {
        scope.$destroy();
      });
    },
  };
});
