'use strict';

angular
  .module('Soar.BusinessCenter')
  .directive('servicesSettings', function () {
    return {
      restrict: 'E',
      scope: {
        list: '=',
      },
      replace: true,
      templateUrl:
        'App/BusinessCenter/practice-setup/practice-setup-section.html',
      controller: 'ServicesSettingsController',
      link: function link(scope, element, attrs) {
        element.on('$destroy', function elementOnDestroy() {
          scope.$destroy();
        });
      },
    };
  });
