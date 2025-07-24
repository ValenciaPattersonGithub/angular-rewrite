//PatientExportModalController
//'use strict';

angular
  .module('Soar.Patient')
  .controller('PatientExportModalController', PatientExportModalController);

//PatientExportModalController.$inject = ['$scope', 'modalResolve'];
PatientExportModalController.$inject = [
  '$scope',
  '$uibModalInstance',
  'modalResolve',
];

function PatientExportModalController($scope, $uibModalInstance, modalResolve) {
  //function PatientExportModalController($scope, modalResolve) {
  BaseCtrl.call(this, $scope, 'PatientExportModalController');
  var ctrl = this;
  $scope.items = [
    { key: '0', value: "No, Don't Include Contact Details" },
    { key: '1', value: 'Responsible Party and/or Patient Contact Details' },
  ];
  $scope.Main = {
    Patient: false,
    ResponsibleParty: false,
  };
  $scope.ContactInfo = {
    PatientMailing: false,
    PatientEmail: false,
    PatientPrimaryPhone: false,
    PatientHomePhone: false,
    PatientMobilePhone: false,
    PatientWorkPhone: false,
    ResponsibleMailing: false,
    ResponsibleEmail: false,
    ResponsiblePrimaryPhone: false,
    ResponsibleHomePhone: false,
    ResponsibleMobilePhone: false,
    ResponsibleWorkPhone: false,
  };

  $scope.setCategory = function () {
    if ($scope.selection.key === '1') {
      $scope.Main.Patient = true;
      $scope.Main.ResponsibleParty = true;

      $scope.ContactInfo.PatientMailing = true;
      $scope.ContactInfo.PatientEmail = true;
      $scope.ContactInfo.PatientPrimaryPhone = true;
      $scope.ContactInfo.PatientHomePhone = true;
      $scope.ContactInfo.PatientMobilePhone = true;
      $scope.ContactInfo.PatientWorkPhone = true;
      $scope.ContactInfo.ResponsibleMailing = true;
      $scope.ContactInfo.ResponsibleEmail = true;
      $scope.ContactInfo.ResponsiblePrimaryPhone = true;
      $scope.ContactInfo.ResponsibleHomePhone = true;
      $scope.ContactInfo.ResponsibleMobilePhone = true;
      $scope.ContactInfo.ResponsibleWorkPhone = true;
    } else {
      $scope.Main.Patient = false;
      $scope.Main.ResponsibleParty = false;

      $scope.ContactInfo.PatientMailing = false;
      $scope.ContactInfo.PatientEmail = false;
      $scope.ContactInfo.PatientPrimaryPhone = false;
      $scope.ContactInfo.PatientHomePhone = false;
      $scope.ContactInfo.PatientMobilePhone = false;
      $scope.ContactInfo.PatientWorkPhone = false;
      $scope.ContactInfo.ResponsibleMailing = false;
      $scope.ContactInfo.ResponsibleEmail = false;
      $scope.ContactInfo.ResponsiblePrimaryPhone = false;
      $scope.ContactInfo.ResponsibleHomePhone = false;
      $scope.ContactInfo.ResponsibleMobilePhone = false;
      $scope.ContactInfo.ResponsibleWorkPhone = false;
    }
  };

  $scope.toggleCheckBoxes = function (element) {
    if (element === 'Patient') {
      if ($scope.Main.Patient === true) {
        $scope.Main.Patient = false;
        $scope.ContactInfo.PatientMailing = false;
        $scope.ContactInfo.PatientEmail = false;
        $scope.ContactInfo.PatientPrimaryPhone = false;
        $scope.ContactInfo.PatientHomePhone = false;
        $scope.ContactInfo.PatientMobilePhone = false;
        $scope.ContactInfo.PatientWorkPhone = false;
      } else {
        $scope.Main.Patient = true;
        $scope.ContactInfo.PatientMailing = true;
        $scope.ContactInfo.PatientEmail = true;
        $scope.ContactInfo.PatientPrimaryPhone = true;
        $scope.ContactInfo.PatientHomePhone = true;
        $scope.ContactInfo.PatientMobilePhone = true;
        $scope.ContactInfo.PatientWorkPhone = true;
      }
    } else {
      if ($scope.Main.ResponsibleParty === true) {
        $scope.Main.ResponsibleParty = false;
        $scope.ContactInfo.ResponsibleMailing = false;
        $scope.ContactInfo.ResponsibleEmail = false;
        $scope.ContactInfo.ResponsiblePrimaryPhone = false;
        $scope.ContactInfo.ResponsibleHomePhone = false;
        $scope.ContactInfo.ResponsibleMobilePhone = false;
        $scope.ContactInfo.ResponsibleWorkPhone = false;
      } else {
        $scope.Main.ResponsibleParty = true;
        $scope.ContactInfo.ResponsibleMailing = true;
        $scope.ContactInfo.ResponsibleEmail = true;
        $scope.ContactInfo.ResponsiblePrimaryPhone = true;
        $scope.ContactInfo.ResponsibleHomePhone = true;
        $scope.ContactInfo.ResponsibleMobilePhone = true;
        $scope.ContactInfo.ResponsibleWorkPhone = true;
      }
    }
  };

  $scope.export = function () {
    $uibModalInstance.close($scope.ContactInfo);
  };

  $scope.cancel = function () {
    $uibModalInstance.close(null);
  };
}

PatientExportModalController.prototype = Object.create(BaseCtrl.prototype);
