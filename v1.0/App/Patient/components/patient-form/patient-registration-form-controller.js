'use strict';

angular.module('Soar.Patient').controller('PatientRegistrationFormController', [
  '$scope',
  '$routeParams',
  '$timeout',
  '$filter',
  'PatientAdditionalIdentifierService',
  'toastrFactory',
  'localize',
  function (
    $scope,
    $routeParams,
    $timeout,
    $filter,
    patientAdditionalIdentifierService,
    toastrFactory,
    localize
  ) {
    var ctrl = this;
    $scope.hasIdentifiers = false;
    ctrl.$onInit = function () {
      $scope.getPatientAdditionalIdentifiers();
    };

    $scope.getPatientAdditionalIdentifiers = function () {
      patientAdditionalIdentifierService.get().then(
        function (res) {
          $scope.patientAdditionalIdGetSuccess(res);
        },
        function () {
          $scope.patientAdditionalIdGetFailure();
        }
      );
    };

    $scope.patientAdditionalIdGetSuccess = function (res) {
      $scope.patientAdditionalIdentifiers = res.Value != null ? res.Value : [];
      $scope.hasIdentifiers = $scope.patientAdditionalIdentifiers.length > 0;
    };

    $scope.patientAdditionalIdGetFailure = function () {
      $scope.patientAdditionalIdentifiers = [];
      toastrFactory.error(
        localize.getLocalizedString(
          'Failed to retrieve the list of patient additional identifiers. Refresh the page to try again.'
        ),
        localize.getLocalizedString('Error')
      );
    };

    ctrl.removeWalkMePlayer = function () {
      $timeout(function () {
        if (angular.element('#walkme-player').length) {
          angular.element(document.querySelector('#walkme-player')).remove();
        } else {
          ctrl.removeWalkMePlayer();
        }
      }, 400);
    };

    ctrl.cleanup = function () {
      angular
        .element('.view-container')
        .attr('style', 'background-color:#dddddd');
      angular.element('.top-header').remove();
      angular.element('.feedback-container').remove();
      angular.element('body').attr('style', 'padding-top:0;');
      angular.element('body').attr('style', 'padding-left:0;');
      angular.element('body').attr('style', 'background-color:#dddddd');

      ctrl.removeWalkMePlayer();
    };

    ctrl.cleanup();

    ctrl.$onInit();
  },
]);
