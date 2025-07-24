'use strict';

angular.module('Soar.Patient').directive('documentProperties', function () {
  return {
    restrict: 'E',
    scope: {
      documentId: '@',
      formattedPatientName: '@',
    },
    templateUrl:
      'App/Patient/components/document-properties/document-properties.html',
    controller: 'DocumentPropertiesController',
    link: function link(scope, element, attrs) {
      element.on('$destroy', function elementOnDestroy() {
        scope.$destroy();
      });
    },
  };
});
