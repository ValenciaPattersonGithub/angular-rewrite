'use strict';

var app = angular
  .module('Soar.Patient')
  .controller('PatientDuplicatesController', [
    '$scope',
    'localize',
    'PatientServices',
    '$timeout',
    'toastrFactory',
    'tabLauncher',
    'PatientValidationFactory',
    'userSettingsDataService',
    function (
      $scope,
      localize,
      patientServices,
      $timeout,
      toastrFactory,
      tabLauncher,
      patientValidationFactory,
      userSettingsDataService
    ) {
      // hides the spinner
      $scope.checkingForDuplicates = false;
      $scope.showDuplicatePatients = false;
      $scope.duplicatePatients = [];
      $scope.duplicatePatientsLoaded = false;

      // duplicate patient check timeout queue
      $scope.dupeCheckTimeout = null;

      // Watch name string for changes
      $scope.$watch('patient.FirstName', function (nv, ov) {
        if ($scope.patient.LastName || $scope.patient.PreferredName) {
          if (nv != ov) {
            $scope.getDuplicatePatients();
          }
        }
      });
      $scope.$watch('patient.LastName', function (nv, ov) {
        if ($scope.patient.FirstName || $scope.patient.PreferredName) {
          if (nv != ov) {
            $scope.getDuplicatePatients();
          }
        }
      });
      $scope.$watch('patient.DateOfBirth', function (nv, ov) {
        if (nv != ov) {
          $scope.getDuplicatePatients();
        }
      });
      $scope.$watch('patient.PreferredName', function (nv, ov) {
        if ($scope.patient.LastName || $scope.patient.FirstName) {
          if (nv != ov) {
            $scope.getDuplicatePatients();
          }
        }
      });

      $scope.getDuplicatePatients = function () {
        if ($scope.dupeCheckTimeout) {
          $timeout.cancel($scope.dupeCheckTimeout);
        }

        // Delay search 500ms
        $scope.dupeCheckTimeout = $timeout(function () {
          $scope.duplicatePatients = [];

          //if (!$scope.patient.FirstName || !$scope.patient.LastName || $scope.patient.FirstName.length == 0 || $scope.patient.LastName.length == 0) {
          //    // if names are empty, clear duplicates
          //    $scope.showDuplicatePatients = false;
          //    return;
          //}

          $scope.checkingForDuplicates = true;

          //list of objects is expected
          let patientSearchDtos = [];
          let patientSearchDto = {
            FirstName: $scope.patient.FirstName ? $scope.patient.FirstName : '',
            LastName: $scope.patient.LastName ? $scope.patient.LastName : '',
            PreferredName: $scope.patient.PreferredName
              ? $scope.patient.PreferredName
              : '',
            DateOfBirth: $scope.patient.DateOfBirth
              ? moment($scope.patient.DateOfBirth).format('YYYY-MM-DD')
              : null,
          };
          //excludePatient parameter is needed
          let excludePatient = $scope.patient.PatientId
            ? $scope.patient.PatientId
            : null;
          patientSearchDtos.push(patientSearchDto);
          patientServices.Patients.duplicates(
            { excludePatient: excludePatient },
            patientSearchDtos,
            $scope.duplicatePatientSearchGetSuccess,
            $scope.duplicatePatientSearchGetFailure
          );
        }, 1000);
      };

      $scope.duplicatePatientSearchGetSuccess = function (res) {
        $scope.duplicatePatients = res.Value;
        $scope.duplicatePatientsLoaded = false;
        $scope.duplicateCount = 0;
        angular.forEach($scope.duplicatePatients, function (dupe) {
          patientValidationFactory
            .PatientSearchValidation(dupe)
            .then(function (patientInfo) {
              dupe.PatientInfo = patientInfo;
              $scope.duplicateCount++;
              if ($scope.duplicateCount == $scope.duplicatePatients.length) {
                $scope.duplicatePatientsLoaded = true;
              }
            });
        });

        // hide duplicates if there are none
        if (res.Value == null || res.Value.length == 0) {
          $scope.showDuplicatePatients = false;
        } else {
          $scope.showDuplicatePatients = true;
        }

        // hide the spinner
        $scope.checkingForDuplicates = false;
      };

      $scope.duplicatePatientSearchGetFailure = function () {
        $scope.showDuplicatePatients = false;
        $scope.duplicatePatients = [];

        toastrFactory.error(
          localize.getLocalizedString(
            'Unable to check for duplicate patients.'
          ),
          localize.getLocalizedString('Error')
        );

        // hide the spinner
        $scope.checkingForDuplicates = false;
      };

      $scope.closeDuplicatePatient = function () {
        $scope.showDuplicatePatients = false;
      };

      $scope.openPatientTab = function (patient) {
        if (
          patient.PatientInfo.authorization
            .UserIsAuthorizedToAtLeastOnePatientLocation
        ) {
          let patientPath = '#/Patient/';
          tabLauncher.launchNewTab(
            patientPath + patient.PatientId + '/Overview/'
          );
        } else {
          patientValidationFactory.LaunchPatientLocationErrorModal(
            patient.PatientInfo
          );
          return;
        }
      };
    },
  ]);
