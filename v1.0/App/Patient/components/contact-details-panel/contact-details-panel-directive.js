'use strict';

angular.module('Soar.Patient').directive('contactDetailsPanel', function () {
  return {
    restrict: 'E',
    scope: {
      patientData: '=',
      panelTitle: '@',
      phones: '=',
      setFocusOnInput: '=',
      emails: '=',
    },
    templateUrl:
      'App/Patient/components/contact-details-panel/contact-details-panel.html',
    controller: 'ContactDetailsPanelController',
    link: function link(scope, element, attrs) {
      element.on('$destroy', function elementOnDestroy() {
        scope.$destroy();
      });
    },
  };
});
