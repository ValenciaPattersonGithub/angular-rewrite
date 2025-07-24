'use strict';
angular.module('Soar.Patient').controller('PatientPreviousDentalController', [
  '$scope',
  '$routeParams',
  'toastrFactory',
  'localize',
  'StaticData',
  'PatientServices',
  function (
    $scope,
    $routeParams,
    toastrFactory,
    localize,
    staticData,
    patientServices
  ) {
    //#region previousDental

    // get PatientPreviousDentalOffice
    $scope.getPatientPreviousDentalOffice = function () {
      $scope.currentPatientId = $scope.currentPatientId
        ? $scope.currentPatientId
        : $routeParams.patientId;

      if ($scope.currentPatientId) {
        patientServices.PreviousDentalOffice.get(
          { Id: $scope.currentPatientId },
          $scope.getPatientPreviousDentalOfficeSuccess,
          $scope.getPatientPreviousDentalOfficeFail
        );
      }
    };

    $scope.getPatientPreviousDentalOfficeSuccess = function (res) {
      if (res.Value != null) {
        res.Value = $.extend(res.Value, {
          Id: $scope.currentPatientId,
          PatientId: $scope.currentPatientId,
        });

        $scope.previousDentalOffice = res.Value;
      } else {
        // Stub out empty previousDental object
        $scope.previousDentalOffice = {
          Id: $scope.currentPatientId,
          PreviousDentalOfficeId: null,
          PatientId: $scope.currentPatientId,
          Name: null,
          PhoneNumber: null,
          Address: {
            AddressLine1: null,
            AddressLine2: null,
            City: null,
            State: null,
            ZipCode: null,
          },
          Notes: null,
        };
      }

      if (
        $scope.previousDentalOffice.Notes &&
        $scope.previousDentalOffice.Notes.length > 0
      )
        $scope.isNoteCollapsed = false;
    };

    $scope.getPatientPreviousDentalOfficeFail = function () {
      // Stub out empty previousDental object
      $scope.previousDentalOffice = {
        Id: $scope.currentPatientId,
        PreviousDentalOfficeId: null,
        PatientId: $scope.currentPatientId,
        Name: null,
        PhoneNumber: null,
        Address: {
          AddressLine1: null,
          AddressLine2: null,
          City: null,
          State: null,
          ZipCode: null,
        },
        Notes: null,
      };

      toastrFactory.error(
        'Failed to retrieve the previous dentist information. Refresh the page to try again.',
        'Error'
      );
    };

    $scope.getPatientPreviousDentalOffice();

    // save
    $scope.saveFunction = function (previousDentist, onSuccess, onError) {
      $scope.validatePanel(previousDentist);
      previousDentist.Id = $scope.currentPatientId;

      // hack? Not sure if there's a better way to handle input manipulation, so this is here to remove dash when saved
      if (previousDentist.Address.ZipCode) {
        previousDentist.Address.ZipCode =
          previousDentist.Address.ZipCode.replace('-', '');
      }

      $scope.valid = !$scope.hasErrors;
      if ($scope.valid) {
        if (previousDentist.PreviousDentalOfficeId) {
          patientServices.PreviousDentalOffice.update(
            previousDentist,
            onSuccess,
            onError
          );
        } else {
          previousDentist.PreviousDentalOfficeId = '';
          patientServices.PreviousDentalOffice.create(
            previousDentist,
            onSuccess,
            onError
          );
        }
      }
      $scope.valid = true;
    };

    $scope.onSaveSuccess = function (res) {
      if (res.Value.Notes && res.Value.Notes.length > 0) {
        $scope.isNoteCollapsed = false;
      } else {
        $scope.isNoteCollapsed = true;
      }
      toastrFactory.success('Previous dentist has been saved.', 'Success');
    };

    $scope.onSaveError = function (error) {
      toastrFactory.error(
        'Failed to save the previous dentist information. Refresh the page to try again.',
        'Server Error'
      );
    };

    //#endregion

    $scope.valid = true;

    //#region validate required and any attributes
    $scope.validatePanel = function (nv, ov) {
      if (nv && ov !== nv) {
        $scope.hasErrors = !$scope.frmPatientPreviousDental.inpZip.$valid;
      }
    };

    $scope.isNoteCollapsed = true;
  },
]);
