'use strict';

angular.module('Soar.Patient').directive('personalDetailsPanel', function () {
  return {
    restrict: 'E',
    scope: {
      patientData: '=',
      panelTitle: '@',
      phones: '=',
      setFocusOnInput: '=',
      hasChanges: '=?',
    },
    templateUrl:
      'App/Patient/components/personal-details-panel/personal-details-panel.html',
    controller: 'PersonalDetailsPanelController',
    link: function link(scope, element, attrs) {
      element.on('$destroy', function elementOnDestroy() {
        scope.$destroy();
      });
    },
  };
});
