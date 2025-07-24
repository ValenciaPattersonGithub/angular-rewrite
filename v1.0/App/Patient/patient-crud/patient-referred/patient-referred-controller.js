'use strict';

angular
  .module('Soar.Patient')
  .controller('PatientReferredController', [
    '$scope',
    '$routeParams',
    '$filter',
    '$location',
    'localize',
    '$timeout',
    'toastrFactory',
    'PatientServices',
    PatientCrudReferredController,
  ]);
function PatientCrudReferredController(
  $scope,
  $routeParams,
  $filter,
  $location,
  localize,
  $timeout,
  toastrFactory,
  patientServices
) {
  BaseCtrl.call(this, $scope, 'PatientCrudReferredController');
  $scope.editMode = $routeParams.patientId ? true : false;
  $scope.patientsReferred = [];

  // get list of referred patients
  if ($scope.editMode) {
    $scope.GetPatientsReferred = function () {
      patientServices.Referrals.GetReferredPatients(
        { Id: $routeParams.patientId },
        $scope.GetReferredPatientsOnSuccess,
        function () {
          // Error
          toastrFactory.error(
            localize.getLocalizedString('Patients referred') +
              ' ' +
              localize.getLocalizedString('failed to load.'),
            localize.getLocalizedString('Server Error')
          );
        }
      );
    };
    $scope.GetReferredPatientsOnSuccess = function (res) {
      $scope.patientsReferred = res.Value;
      $scope.count = $scope.patientsReferred.length;
    };
    $scope.GetPatientsReferred();
  }
}

PatientCrudReferredController.prototype = Object.create(BaseCtrl.prototype);
