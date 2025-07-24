'use strict';
angular
  .module('Soar.BusinessCenter')
  .controller('ClosePredeterminationModalController', [
    '$scope',
    '$location',
    '$uibModalInstance',
    'toastrFactory',
    'closePredeterminationObject',
    'localize',
    'patSecurityService',
    'PatientServices',
    function (
      $scope,
      $location,
      $uibModalInstance,
      toastrFactory,
      closePredeterminationObject,
      localize,
      patSecurityService,
      patientServices
    ) {
      var ctrl = this;
      $scope.disableCancel = false;
      if (closePredeterminationObject.disableCancel) {
        $scope.disableCancel = true;
      }
      $scope.closePredetermination = function () {
        if (closePredeterminationObject) {
          if ($scope.note) {
            closePredeterminationObject.Note = $scope.note;
          } else {
            closePredeterminationObject.Note = '';
          }

          patientServices.Predetermination.Close(
            closePredeterminationObject,
            ctrl.closePredeterminationSuccess,
            ctrl.closePredeterminationFailure
          );
        }
      };

      ctrl.closePredeterminationSuccess = function () {
        toastrFactory.success(
          localize.getLocalizedString('{0} closed successfully.', [
            'Predetermination',
          ]),
          'Success'
        );
        $uibModalInstance.close();
        //I dont think we want to do this and as of my change
        //this doesnt seem to work on any pages where this modal is implemented
        //$location.path('BusinessCenter/Insurance/Claims');
      };

      ctrl.closePredeterminationFailure = function () {
        toastrFactory.error(
          localize.getLocalizedString('An error has occurred while {0}', [
            'closing the predetermination',
          ]),
          'Error'
        );
      };

      $scope.cancelClosePredetermination = function () {
        if (!$scope.disableCancel) {
          $uibModalInstance.dismiss();
        }
      };
    },
  ]);
