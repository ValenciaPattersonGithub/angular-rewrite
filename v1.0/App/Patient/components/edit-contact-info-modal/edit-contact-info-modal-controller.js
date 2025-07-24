'use strict';

angular.module('Soar.Patient').controller('EditContactInfoModalController', [
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
  'ListHelper',
  '$timeout',
  'PatientValidationFactory',
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
    listHelper,
    $timeout,
    patientValidationFactory
  ) {
    var ctrl = this;

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

    $scope.allPhones = null;
    $scope.allEmails = null;

    ctrl.getPhones = function () {
      patientServices.Contacts.getAllPhonesWithLinks(
        { Id: patientInfo.Profile.PatientId },
        ctrl.getPhonesSuccess,
        ctrl.getPhonesFailed
      );
    };

    ctrl.getPhonesSuccess = function (res) {
      $scope.allPhones = res.Value;

      angular.forEach($scope.patient.Phones, function (phone) {
        phone.Links = listHelper.findItemByFieldValue(
          $scope.allPhones,
          'ContactId',
          phone.ContactId
        ).Links;
      });
    };

    ctrl.getPhonesFailed = function (error) {
      toastrFactory.error(
        localize.getLocalizedString('Failed to retreive patient phones.'),
        localize.getLocalizedString('Server Error')
      );
    };

    ctrl.getPhones();

    ctrl.getEmails = function () {
      patientServices.Contacts.getAllEmailsWithLinks(
        { Id: patientInfo.Profile.PatientId },
        ctrl.getEmailsSuccess,
        ctrl.getEmailsFailed
      );
    };

    ctrl.getEmailsSuccess = function (res) {
      $scope.allEmails = res.Value;

      angular.forEach($scope.patient.Emails, function (email) {
        email.Links = listHelper.findItemByFieldValue(
          $scope.allEmails,
          'PatientEmailId',
          email.PatientEmailId
        ).Links;
      });
    };

    ctrl.getEmailsFailed = function (error) {
      toastrFactory.error(
        localize.getLocalizedString('Failed to retreive patient emails.'),
        localize.getLocalizedString('Server Error')
      );
    };

    ctrl.getEmails();

    ctrl.clearAddressFields = function () {
      $scope.patient.Profile.AddressLine1 = null;
      $scope.patient.Profile.AddressLine2 = null;
      $scope.patient.Profile.City = null;
      $scope.patient.Profile.State = null;
      $scope.patient.Profile.ZipCode = null;
    };

    $scope.patient = angular.copy(patientInfo);
    $scope.originalPatientData = angular.copy(patientInfo);

    $scope.saveEditContactInfo = function () {
      if (
        $scope.patient &&
        $scope.patient.Profile &&
        $scope.patient.Profile.ContactsAreValid
      ) {
        angular.forEach($scope.patient.Phones, function (phone) {
          if (phone.PhoneReferrerId) phone.PhoneNumber = null;
        });

        angular.forEach($scope.patient.Emails, function (email) {
          if (email.AccountEmailId) email.Email = null;
        });

        if ($scope.patient.Profile.AddressReferrerId) ctrl.clearAddressFields();

        if ($scope.patient.Profile.ZipCode)
          $scope.patient.Profile.ZipCode =
            $scope.patient.Profile.ZipCode.replace('-', '');

        personServices.Persons.update(
          $scope.patient,
          ctrl.onSuccess,
          ctrl.onError
        );
        $uibModalInstance.close();
      }
    };

    ctrl.onSuccess = function (res) {
      $scope.updatedPatient = res.Value;
      $rootScope.$broadcast('patient-personal-info-changed');
    };

    ctrl.onError = function (error) {
      toastrFactory.error(
        'Update was unsuccessful. Please retry your save.',
        'Server Error'
      );
    };

    $scope.cancelEditContactInfoSave = function () {
      //$scope.patient = $scope.originalPatientData;
      $uibModalInstance.dismiss();
    };
  },
]);
