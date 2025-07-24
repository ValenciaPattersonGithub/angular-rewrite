'use strict';
angular
  .module('Soar.Patient')
  .controller('PatientMedicalHistoryTileController', [
    '$scope',
    '$http',
    'tabLauncher',
    'patSecurityService',
    'toastrFactory',
    'localize',
    'MedicalHistoryFactory',
    '$location',
    'TimeZoneFactory',
    '$filter',
    function (
      $scope,
      $http,
      tabLauncher,
      patSecurityService,
      toastrFactory,
      localize,
      medicalHistoryFactory,
      $location,
      timeZoneFactory,
      $filter
    ) {
      var vm = this;
      $scope.buttonClass = '';
      //#region access

      vm.getAccess = function () {
        $scope.access = medicalHistoryFactory.access();
        if (!$scope.access.View) {
          toastrFactory.error(
            patSecurityService.generateMessage('soar-per-perhst-view'),
            'Not Authorized'
          );
          event.preventDefault();
          $location.path('/');
        }

        $scope.buttonClass =
          $scope.patientMedicalHistoryForm.isDisabled === true
            ? 'disabled-tile'
            : 'btn-link link';
      };
      vm.getAccess();

      $scope.userLocation = function () {
        return JSON.parse(sessionStorage.getItem('userLocation'));
      };

      var userLocation = $scope.userLocation();
      var time = timeZoneFactory.ConvertDateTZ(
        $scope.patientMedicalHistoryForm.DateModified,
        userLocation.timezone
      );
      $scope.filteredDateTime = $filter('date')(time, 'h:mm a');

      //#endregion

      $scope.checkStatus = function checkStatus(action) {
        if (action === 'view') {
          vm.expandForm();
        }

        if (!$scope.patientMedicalHistoryForm.isDisabled) {
          if (action === 'update') {
            vm.updateForm();
          }
        }
      };

      vm.expandForm = function expandForm() {
        $scope.loadingMedicalHistoryForm = true;
        medicalHistoryFactory
          .getByFormAnswersId(
            $scope.personId,
            $scope.patientMedicalHistoryForm.FormAnswersId
          )
          .then(function (res) {
            $scope.medicalHistoryForm = res.Value;
            medicalHistoryFactory.SetUpdatingForm(false);
            medicalHistoryFactory.SetViewingForm(true);
            medicalHistoryFactory.SetActiveMedicalHistoryForm(
              $scope.medicalHistoryForm
            );

            $scope.loadingMedicalHistoryForm = false;
            $scope.viewSettings.expandView = true;
            $scope.viewSettings.activeExpand = $scope.viewSettings.expandView
              ? 5
              : 0;
          });
      };

      vm.updateForm = function updateForm() {
        $scope.loadingMedicalHistoryForm = true;
        medicalHistoryFactory.create().then(function (res) {
          var newMedicalHistoryForm = res.Value;
          medicalHistoryFactory.SetUpdatingForm(true);
          medicalHistoryFactory.SetViewingForm(false);
          medicalHistoryFactory.SetNewMedicalHistoryForm(newMedicalHistoryForm);
          $scope.loadingMedicalHistoryForm = false;

          $scope.viewSettings.expandView = true;
          $scope.viewSettings.activeExpand = $scope.viewSettings.expandView
            ? 5
            : 0;
        });
      };
    },
  ]);
