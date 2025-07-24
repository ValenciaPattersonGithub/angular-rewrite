'use strict';

angular.module('Soar.Patient').directive('informedConsentTile', function () {
  return {
    restrict: 'E',
    scope: {
      informedConsent: '=',
      tileIndex: '=',
      showDate: '@',
    },
    controller: 'InformedConsentTileController',
    templateUrl:
      'App/Patient/patient-chart/informed-consent/informed-consent-tile/informed-consent-tile.html',
    link: function link(scope, element, attrs) {
      element.on('$destroy', function elementOnDestroy() {
        scope.$destroy();
      });
    },
  };
});
