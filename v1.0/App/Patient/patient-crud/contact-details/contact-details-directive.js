'use strict';

angular.module('Soar.Patient').directive('contactDetails', function () {
  return {
    restrict: 'E',
    templateUrl:
      'App/Patient/patient-crud/contact-details/contact-details.html',
    scope: {
      person: '=',
      phones: '=',
      emails: '=',
      setFocusOnInput: '=',
    },
    controller: 'ContactDetailsController',
    link: function link(scope, element, attrs) {
      element.on('$destroy', function elementOnDestroy() {
        scope.$destroy();
      });
    },
  };
});
