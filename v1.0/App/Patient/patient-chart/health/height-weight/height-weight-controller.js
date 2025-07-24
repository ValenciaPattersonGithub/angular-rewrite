'use strict';
angular.module('Soar.Patient').controller('HeightWeightController', [
  '$scope',
  '$http',
  'PatientServices',
  '$timeout',
  function ($scope, $http, patientServices, $timeout) {
    var ctrl = this;

    ctrl.$onInit = function () {
      // scope vars
      $scope.editing = false;
      $scope.cancelling = false;
      $scope.title = 'Weight & Height';
      $scope.hasErrors = false;

      // Get Info
      ctrl.getPatient().then(function (res) {
        $scope.master = res.Value;

        // Copy to local user model
        $scope.user = angular.copy($scope.master);
      });
    };

    ctrl.getPatient = function () {
      return patientServices.Patients.get({ Id: $scope.patientInfo.PatientId })
        .$promise;
    };

    ctrl.updatePatient = function () {
      return patientServices.Patients.update($scope.user).$promise;
    };

    $scope.checkForErrors = function () {
      $scope.hasErrors = !$scope.patientInfo.HeightWeightValid;
    };

    $scope.validateInfo = function (nv) {
      if (nv && $scope.HeightWeightForm) {
        $scope.patientInfo.HeightWeightValid =
          $scope.HeightWeightForm.$valid &&
          $scope.HeightWeightForm.Weight.$valid &&
          $scope.HeightWeightForm.HeightFeet.$valid &&
          $scope.HeightWeightForm.HeightInches.$valid &&
          $scope.checkForErrors();
      }
    };

    $scope.$watch(
      'user',
      function (nv) {
        $timeout(function () {
          $scope.validateInfo(nv);
          $scope.$apply();
        }, 0);
      },
      true
    );

    $scope.reset = function () {
      $scope.user = angular.copy($scope.master);
    };

    $scope.editHeightWeight = function () {
      // Edit Mode
      $scope.editing = true;
    };

    $scope.savePanelEdit = function () {
      $scope.editing = false;

      // Incase the save failed
      $scope.master = $scope.user;

      // Save to DB
      ctrl.updatePatient().then(function (res) {
        $scope.master = res.Value;
        $scope.$emit('height-weight-check-values', res.Value);
        $scope.reset();
      });
    };

    $scope.cancelPanelEdit = function () {
      // Read Mode
      $scope.editing = false;
      $scope.cancelling = true;
      $scope.reset();
    };

    $scope.roundMyNumber = function () {
      $scope.user.Weight = Math.round($scope.user.Weight * 10) / 10;
    };
  },
]);
