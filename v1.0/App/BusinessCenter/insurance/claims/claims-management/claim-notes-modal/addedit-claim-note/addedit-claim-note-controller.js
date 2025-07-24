(function () {
  'use strict';
  angular
    .module('Soar.BusinessCenter')
    .controller(
      'AddEditClaimNotesModalController',
      AddEditClaimNotesModalController
    );
  AddEditClaimNotesModalController.$inject = [
    '$scope',
    'localize',
    '$uibModalInstance',
    'toastrFactory',
    'ModalFactory',
    'PatientServices',
    'noteHistory',
    'claimSubmissionResultsDto',
  ];
  function AddEditClaimNotesModalController(
    $scope,
    localize,
    $uibModalInstance,
    toastrFactory,
    modalFactory,
    patientServices,
    noteHistory,
    claimSubmissionResultsDto
  ) {
    BaseCtrl.call(this, $scope, 'AddEditClaimNotesModalController');
    var ctrl = this;
    $scope.claimNote = {};
    ctrl.init = function () {
      angular.copy(noteHistory, $scope.claimNote);
      $scope.modalTitle = $scope.claimNote.isEditClaim
        ? 'Edit Claim Note'
        : 'Add Claim Note';
      $scope.hasErrors = false;
      $scope.isValid = {
        Note: true,
      };
    };

    $scope.isSaveDisabled = function () {
      return (
        _.isEqual(noteHistory['Note'], $scope.claimNote['Note']) ||
        _.isUndefined($scope.claimNote.Note)
      );
    };

    $scope.close = function () {
      if ($scope.isSaveDisabled()) {
        $uibModalInstance.close(null);
      } else {
        modalFactory.CancelModal().then($scope.closeModal);
      }
    };

    $scope.closeModal = function () {
      $uibModalInstance.close(null);
    };

    $scope.save = function () {
      ctrl.validateSave();

      if (!$scope.hasErrors) {
        $scope.claimNote.PatientId = claimSubmissionResultsDto.PatientId;
        if ($scope.claimNote.isEditClaim) {
          patientServices.ClaimNotes.update($scope.claimNote).$promise.then(
            editSuccess,
            editFailure
          );
        } else {
          $scope.claimNote.Type = 2;
          $scope.claimNote.CreatedDate = new Date();
          patientServices.ClaimNotes.create($scope.claimNote).$promise.then(
            saveSuccess,
            saveFailure
          );
        }
      }
    };

    var saveSuccess = function () {
      toastrFactory.success(
        localize.getLocalizedString('{0} saved successfully.', [
          'The Claim Note has been',
        ])
      );
      $uibModalInstance.close(true);
    };
    var saveFailure = function (result) {
      var data = result.data;
      toastrFactory.error(
        data.InvalidProperties[0].ValidationMessage,
        localize.getLocalizedString('Save Error')
      );
    };

    var editSuccess = function () {
      toastrFactory.success(
        localize.getLocalizedString('{0} updated successfully.', [
          'The Claim Note has been',
        ])
      );
      $uibModalInstance.close(true);
    };

    var editFailure = function (result) {
      var data = result.data;
      toastrFactory.error(
        data.InvalidProperties[0].ValidationMessage,
        localize.getLocalizedString('Update Error')
      );
    };

    ctrl.validateSave = function () {
      $scope.hasErrors = false;

      $scope.isValid.Note = true;

      if (!$scope.claimNote.Note) {
        $scope.isValid.Note = false;
        $scope.hasErrors = true;
      }
    };

    ctrl.init();
  }

  AddEditClaimNotesModalController.prototype = Object.create(BaseCtrl);
})();
