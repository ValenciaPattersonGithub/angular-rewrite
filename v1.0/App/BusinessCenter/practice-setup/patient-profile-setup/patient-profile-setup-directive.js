'use strict';

angular
  .module('Soar.BusinessCenter')
  .directive('patientProfileSetup', function () {
    return {
      restrict: 'E',
      scope: {
        list: '=',
      },
      replace: true,
      templateUrl:
        'App/BusinessCenter/practice-setup/practice-setup-section.html',
      controller: 'PatientProfileSetupController',
      link: function link(scope, element, attrs) {
        element.on('$destroy', function elementOnDestroy() {
          scope.$destroy();
        });
      },
    };
  });
