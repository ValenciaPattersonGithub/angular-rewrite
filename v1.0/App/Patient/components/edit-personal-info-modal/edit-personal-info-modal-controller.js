'use strict';

angular.module('Soar.Patient').controller('EditPersonalInfoModalController', [
  '$scope',
  '$uibModal',
  '$uibModalInstance',
  'PatientServices',
  'toastrFactory',
  'localize',
  'PatSharedServices',
  'PatientInfo',
  '$rootScope',
  'PersonServices',
  'PersonFactory',
  'GlobalSearchFactory',
  'PatientValidationFactory',
  '$q',
  'ImagingPatientService',
  function (
    $scope,
    $uibModal,
    $uibModalInstance,
    patientServices,
    toastrFactory,
    localize,
    patSharedServices,
    patientInfo,
    $rootScope,
    personServices,
    personFactory,
    globalSearchFactory,
    patientValidationFactory,
    $q,
    imagingPatientService
  ) {
    var ctrl = this;
    $scope.hasChanges = false;

    var updatedPatientData = patientValidationFactory.GetPatientData();
    for (var key in updatedPatientData) {
      if (updatedPatientData.hasOwnProperty(key)) {
        if (updatedPatientData[key]) {
          patientInfo.Profile[key] = updatedPatientData[key];
        } else {
          if (key == 'PreferredDentist' && updatedPatientData[key] === null) {
            patientInfo.Profile[key] = null;
          }
          if (key == 'PreferredHygienist' && updatedPatientData[key] === null) {
            patientInfo.Profile[key] = null;
          }
        }
      }
    }

    $scope.patient = angular.copy(patientInfo);
    $scope.originalPatientData = angular.copy(patientInfo);

    $scope.saveEditPersonalInfo = function () {
      angular.forEach($scope.patient.Phones, function (phone) {
        if (phone.PhoneReferrerId) phone.PhoneNumber = null;
      });

      angular.forEach($scope.patient.Emails, function (email) {
        if (email.AccountEmailId) email.Email = null;
      });

      if ($scope.patient.Profile.AddressReferrerId != null) {
        var patientProfile = $scope.patient.Profile;
        patientProfile.AddressLine1 = null;
        patientProfile.AddressLine2 = null;
        patientProfile.City = null;
        patientProfile.ZipCode = null;
        patientProfile.State = null;
      }

      $scope.saving = true;
      if ($scope.patient.updatePatientActive) {
        var patient = angular.copy($scope.patient);
        patient.Profile.IsActive = $scope.originalPatientData.Profile.IsActive;
        personServices.Persons.update(patient, ctrl.onSuccess, ctrl.onError);
      } else {
        personServices.Persons.update(
          $scope.patient,
          ctrl.onSuccess,
          ctrl.onError
        );
      }
    };

    ctrl.onSuccess = function (res) {
      $scope.updatedPatient = res.Value;
      // keep the imaging data in sync, wait for this method resolve before closing modal
      ctrl.syncImagingPatient($scope.updatedPatient).then(function () {
        if ($scope.patient.updatePatientActive) {
          //$scope.$parent.inactivatingPatient = true;
          personFactory
            .SetPersonActiveStatus(
              $scope.patient.Profile.PatientId,
              $scope.patient.IsActive,
              $scope.patient.unscheduleOnly
            )
            .then(
              function (res) {
                if (res) {
                  // resetting most recents
                  globalSearchFactory.ClearRecentPersons();
                  $uibModalInstance.close();
                  $rootScope.$broadcast('soar:refresh-most-recent');
                  $rootScope.$broadcast('patient-personal-info-changed');
                }
              },
              function () {
                $scope.saving = false;
              }
            );
        } else {
          $uibModalInstance.close();
          $rootScope.$broadcast('patient-personal-info-changed');
        }
      });
    };

    ctrl.onError = function () {
      toastrFactory.error(
        'Update was unsuccessful. Please retry your save.',
        'Server Error'
      );
      $scope.saving = false;
    };

    $scope.cancelEditPersonalInfoSave = function () {
      $scope.patient = $scope.originalPatientData;
      $uibModalInstance.dismiss();
    };

    ctrl.syncImagingPatient = function (updatedPatient) {
      var defer = $q.defer();
      var promise = defer.promise;
      imagingPatientService
        .getImagingPatient(updatedPatient)
        .then(function (res) {
          if (
            res &&
            res.data &&
            res.data.Records &&
            res.data.Records.length > 0
          ) {
            var imagingPatient = res.data.Records[0];
            var hasChanged = imagingPatientService.compareImagingPatient(
              updatedPatient,
              imagingPatient
            );
            if (hasChanged) {
              imagingPatientService
                .updateImagingPatient(updatedPatient, imagingPatient)
                .then(function () {
                  defer.resolve();
                });
            } else {
              defer.resolve();
            }
          } else {
            defer.resolve();
          }
        });
      return promise;
    };
  },
]);
