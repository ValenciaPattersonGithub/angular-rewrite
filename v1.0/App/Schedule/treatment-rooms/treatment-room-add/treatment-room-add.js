'use strict';

angular.module('Soar.Schedule').controller('TreatmentRoomAddController', [
  '$scope',
  '$uibModalInstance',
  'treatmentRoom',
  'treatmentRooms',
  'ScheduleServices',
  'toastrFactory',
  'ModalFactory',
  'localize',
  function (
    $scope,
    mInstance,
    treatmentRoom,
    treatmentRooms,
    scheduleServices,
    toastrFactory,
    modalFactory,
    localize
  ) {
    var ctrl = this;

    ctrl.backupTreatmentRoom = angular.copy(treatmentRoom);
    $scope.editMode = treatmentRoom.Name ? true : false;
    $scope.treatmentRoom = treatmentRoom;
    ctrl.treatmentRooms = treatmentRooms;
    $scope.hasErrors = false;
    $scope.hasDuplicates = false;
    $scope.isSaving = false;

    $scope.$watch('treatmentRoom.Name', function (nv, ov) {
      if (nv && nv != ov) {
        ctrl.checkForDuplicates();
      } else {
        $scope.hasDuplicates = false;
      }
    });

    // move check to the rooms service once this is hooked up all the way.
    ctrl.checkForDuplicates = function () {
      $scope.hasDuplicates = false;

      for (var i = 0; i < ctrl.treatmentRooms.length; i++) {
        if (
          ctrl.treatmentRooms[i].Name.toLowerCase() ==
            $scope.treatmentRoom.Name.toLowerCase() &&
          ctrl.treatmentRooms[i].RoomId != $scope.treatmentRoom.RoomId
        ) {
          $scope.hasDuplicates = true;
        }
      }
    };

    ctrl.IsValid = function () {
      return (
        $scope.frmTreatmentRoomSave.$valid &&
        $scope.frmTreatmentRoomSave.inpName.$valid
      );
    };

    $scope.saveTreatmentRoom = function () {
      $scope.hasErrors = !ctrl.IsValid() || $scope.hasDuplicates;
      $scope.isSaving = true;

      if (!$scope.hasErrors) {
        var params = $scope.treatmentRoom;

        if (!$scope.editMode) {
          scheduleServices.Dtos.TreatmentRooms.save(
            { LocationId: params.LocationId },
            params,
            ctrl.TreatmentRoomsSaveOnSuccess,
            ctrl.TreatmentRoomsSaveOnError
          );
        } else {
          scheduleServices.Dtos.TreatmentRooms.Update(
            { LocationId: params.LocationId },
            params,
            ctrl.TreatmentRoomsSaveOnSuccess,
            ctrl.TreatmentRoomsSaveOnError
          );
        }
      } else {
        $scope.isSaving = false;
      }
    };

    ctrl.TreatmentRoomsSaveOnSuccess = function (res) {
      $scope.isSaving = false;

      var msg = !$scope.editMode
        ? 'Successfully added the {0}.'
        : 'Successfully updated the {0}.';
      toastrFactory.success(
        localize.getLocalizedString(msg, ['treatment room']),
        'Success'
      );

      mInstance.close(res.Value);
    };

    ctrl.TreatmentRoomsSaveOnError = function () {
      $scope.isSaving = false;
      toastrFactory.error(
        localize.getLocalizedString(
          'Failed to save the {0}. Please try again.',
          ['treatment room']
        ),
        'Error'
      );
    };

    $scope.cancelChanges = function () {
      if ($scope.treatmentRoom.Name != ctrl.backupTreatmentRoom.Name) {
        modalFactory.CancelModal().then(ctrl.confirmCancel);
      } else {
        mInstance.close(null);
      }
    };

    ctrl.confirmCancel = function () {
      mInstance.close(null);
    };
  },
]);
