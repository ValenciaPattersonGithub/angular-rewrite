'use strict';

var app = angular.module('Soar.Patient').controller('PatientRxController', [
  '$scope',
  '$sce',
  'toastrFactory',
  'localize',
  '$location',
  'PatientRxFactory',
  'patSecurityService',
  'PatientRxService',
  function (
    $scope,
    $sce,
    toastrFactory,
    localize,
    $location,
    patientRxFactory,
    patSecurityService,
    patientRxService
  ) {
    var ctrl = this;
    $scope.rxPatientFound = false;
    $scope.loadingMessage = localize.getLocalizedString('Loading ...');
    $scope.invalidPatientData = false;
    $scope.heightWeightRequired = false;
    $scope.enterHeightWeight = false;

    $scope.$on('height-weight-check-values', function (evt, patient) {
      $scope.patient.HeightFeet = patient.HeightFeet;
      $scope.patient.HeightInches = patient.HeightInches;
      $scope.patient.Weight = patient.Weight;
      $scope.patient.DataTag = patient.DataTag;
      $scope.checkPatientForAge();
    });

    //TODO correct amfa
    $scope.authAccess = patientRxService.getAuthAccess();
    if (!$scope.authAccess.view) {
      toastrFactory.error(
        patSecurityService.generateMessage('soar-clin-cpsvc-view'),
        'Not Authorized'
      );
      event.preventDefault();
      $location.path('/');
    }

    //#endregion

    ctrl.setFrameSource = function () {
      $scope.rxFrameSource = $sce.trustAsResourceUrl(
        $scope.rxPatientSource.ExternalPatientURL
      ); // Fusion TBD: use resourceUrlWhitelist
      $scope.loading = false;
    };

    // handle validation of patient data
    ctrl.validatePatientForRx = function () {
      $scope.validPatientData = true;
      if (patientRxService.validatePatient(ctrl.rxPatient) === false) {
        $scope.invalidPatientData = true;
        $scope.validPatientData = false;
        $scope.requirementsList = patientRxService.validationMessage(
          ctrl.rxPatient
        );
        return false;
      }
      return true;
    };

    ctrl.handleError = function (msg) {
      if (msg === 'Location') {
        $scope.rxSaveFailedLocation = true;
      } else {
        $scope.rxSaveFailed = true;
      }
      $scope.rxPatientFound = true;
    };

    $scope.rxSaveFailed = false;
    $scope.rxSaveFailedLocation = false;
    ctrl.loadRxPatient = function () {
      if (ctrl.rxPatient) {
        patientRxFactory.Save(ctrl.rxPatient, $scope.patient).then(
          function (res) {
            $scope.rxPatientSource = res;
            console.log(res);
            $scope.rxPatientFound = true;
            ctrl.setFrameSource();
          },
          function (msg) {
            ctrl.handleError(msg);
          }
        );
      }
    };

    // rx access requires address info.  if this patient uses AddressReferrer (responsible party) address information
    // we need to replace the patient.address with patient.AddressReferrer information before
    // validating and before the save
    ctrl.setReferrerAddressInformation = function () {
      $scope.patient.AddressLine1 = $scope.patient.AddressReferrer.AddressLine1;
      $scope.patient.AddressLine2 = $scope.patient.AddressReferrer.AddressLine2;
      $scope.patient.City = $scope.patient.AddressReferrer.City;
      $scope.patient.State = $scope.patient.AddressReferrer.State;
      $scope.patient.ZipCode = $scope.patient.AddressReferrer.ZipCode;
    };

    ctrl.$onInit = function () {
      if ($scope.patient.AddressReferrer && $scope.patient.AddressReferrerId) {
        ctrl.setReferrerAddressInformation();
      }

      // remove me
      //$scope.createPatient();
      $scope.checkPatientForAge();
    };

    ctrl.calculatePatientAge = function (birthday) {
      // using type coercion +() because ts does not like what we are trying to do here
      // all that does is convert the date to a number making typescript happy again.
      var dateNow = new Date();
      dateNow = dateNow.setDate(dateNow.getDate() - 1);
      var ageDifferenceInMilliseconds = dateNow - +new Date(birthday);
      var ageDate = new Date(ageDifferenceInMilliseconds);

      return Math.abs(ageDate.getUTCFullYear() - 1970);
    };

    $scope.showHeightWeightRequired = function () {
      $scope.heightWeightRequired = true;
      $scope.enterHeightWeight = false;
    };

    // Show enter Height Weight screen
    $scope.showEnterHeightWeight = function () {
      $scope.heightWeightRequired = false;
      $scope.enterHeightWeight = true;
    };

    // Close all Height Weight required dialogs
    $scope.cancelHeightWeightRequired = function () {
      $scope.heightWeightRequired = false;
      $scope.enterHeightWeight = false;
    };

    // Move back to Height / Weight Requiremed Scrren - May Not be needed
    $scope.cancelHeightWeightEntry = function () {
      $scope.heightWeightRequired = true;
      $scope.enterHeightWeight = false;
    };

    $scope.checkPatientForAge = function () {
      var age = ctrl.calculatePatientAge($scope.patient.DateOfBirth);

      if (
        age < 18 &&
        ($scope.patient.HeightFeet === 0 || $scope.patient.Weight == 0)
      ) {
        $scope.showHeightWeightRequired();
      } else {
        $scope.createPatient();
      }
    };

    // Create the RxPatient
    $scope.createPatient = function () {
      ctrl.rxPatient = patientRxService.createRxPatient($scope.patient);
      if (ctrl.validatePatientForRx()) {
        $scope.loading = true;
        ctrl.loadRxPatient();
      }

      $scope.cancelHeightWeightRequired();
    };
  },
]);
