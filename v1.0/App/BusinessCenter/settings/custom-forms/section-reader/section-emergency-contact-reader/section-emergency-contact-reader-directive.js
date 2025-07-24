'use strict';

angular
  .module('Soar.BusinessCenter')
  .directive('sectionEmergencyContactReaderDirective', function () {
    return {
      templateUrl:
        'App/BusinessCenter/settings/custom-forms/section-reader/section-emergency-contact-reader/section-emergency-contact-reader.html',
      restrict: 'E',
      scope: true,
      link: function link(scope, element, attrs) {
        element.on('$destroy', function elementOnDestroy() {
          scope.$destroy();
        });
      },
    };
  });
