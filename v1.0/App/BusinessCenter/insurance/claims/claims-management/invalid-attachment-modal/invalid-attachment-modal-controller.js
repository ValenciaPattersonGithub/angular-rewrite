'use strict';
angular
  .module('Soar.BusinessCenter')
  .controller('InvalidAttachmentModalController', [
    '$scope',
    '$location',
    '$uibModalInstance',
    'toastrFactory',
    'localize',
    'claimSubmissionResultsDto',
    'claimStatusDtos',
    'PatientServices',
    'tabLauncher',
    'ValidateClaimMessagesFactory',
    function (
      $scope,
      $location,
      $uibModalInstance,
      toastrFactory,
      localize,
      claimSubmissionResultsDto,
      claimStatusDtos,
      patientServices,
      tabLauncher,
      validateClaimMessagesFactory
    ) {
      var ctrl = this;

      ctrl.init = function () {
        $scope.claimSubmissionResultsDto = claimSubmissionResultsDto;
        validateClaimMessagesFactory.SetupMessages(
          $scope.claimSubmissionResultsDto
        );
      };

      $scope.cancel = function () {
        $uibModalInstance.dismiss();
      };

      ctrl.init();
    },
  ]);
