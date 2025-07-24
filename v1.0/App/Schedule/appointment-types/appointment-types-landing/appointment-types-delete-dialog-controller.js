'use strict';

var app = angular.module('Soar.Schedule');

var AppointmentTypesDeleteDialogController = app.controller(
  'AppointmentTypesDeleteDialogController',
  [
    '$scope',
    '$uibModalInstance',
    'deleteAppointmentType',
    function ($scope, $uibModalInstance, deleteAppointmentType) {
      $scope.appointmentType = deleteAppointmentType;

      // ok - close the dialog and pass back appointment type
      $scope.deleteDialogOk = function () {
        $uibModalInstance.close(deleteAppointmentType);
      };

      // cancel -- close dialog
      $scope.deleteDialogCancel = function () {
        $uibModalInstance.dismiss('cancel');
      };
    },
  ]
);
