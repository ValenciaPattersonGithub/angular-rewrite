'use strict';

angular.module('Soar.BusinessCenter').controller('BluePreferencesController', [
  '$scope',
  '$routeParams',
  '$sce',
  '$injector',
  '$timeout',
  'localize',
  function ($scope, $routeParams, $sce, $injector, $timeout, localize) {
    var ctrl = this;

    ctrl.init = function () {
      if ($routeParams.blueUrl && $routeParams.blueUrl !== 'undefined') {
        let imagingMasterService = $injector.get('ImagingMasterService');
        let imagingProviders = $injector.get('ImagingProviders');

        angular.element('body').attr('style', 'padding:0;');
        angular
          .element('.view-container')
          .attr('style', 'background-color:#fff;padding:0;');
        angular.element('.top-header').remove();
        angular.element('.feedback-container').remove();

        imagingMasterService.getReadyServices().then(res => {
          var imagingProvider = imagingProviders.Blue;
          if (res[imagingProvider] && res[imagingProvider].status === 'ready') {
            $scope.frameSource = $sce.trustAsResourceUrl($routeParams.blueUrl); // Fusion TBD: Appears Unsafe - url came from this page url!
            $scope.showBlue = true;
          } else {
            ctrl.error();
          }
        });
      } else {
        ctrl.error();
      }
    };

    ctrl.error = function () {
      $scope.errorMessage = localize.getLocalizedString(
        'An error occurred. Please return to the previous tab and try again'
      );
    };

    $timeout(ctrl.init);
  },
]);
