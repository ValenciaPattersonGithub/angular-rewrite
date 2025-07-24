'use strict';

var PatientAccountTransferController = angular
  .module('Soar.Patient')
  .controller('PatientAccountTransferRightSectionController', [
    '$scope',
    '$routeParams',
    '$timeout',
    'PatientServices',
    '$filter',
    '$window',
    'BoundObjectFactory',
    'toastrFactory',
    'localize',
    '$location',
    function (
      $scope,
      $routeParams,
      $timeout,
      patientServices,
      $filter,
      $window,
      boundObjectFactory,
      toastrFactory,
      localize,
      $location
    ) {
      var ctrl = this;
      $scope.loaded = false;
      $scope.patientData = $scope.patientData2;
      $scope.isPrimary = false;

      ctrl.displayPatientInfo = function (res) {
        /// Patient Name
        if ($scope.patientData.length == 0) {
          $scope.loaded = false;
          return;
        }
        let patientId = $scope.patientData.PatientId;    
        patientServices.PatientAccountTransfer.getPatientTransferCardDetails({ patientId: patientId }).$promise.then(
          res => {
            let details = res.Value;
            $scope.patientData.AddressLine1= details.patientTransferAddressDetails.AddressLine1,
            $scope.patientData.AddressLine2= details.patientTransferAddressDetails.AddressLine2,
            $scope.patientData.City= details.patientTransferAddressDetails.City,
            $scope.patientData.State=details.patientTransferAddressDetails.State,
            $scope.patientData.ZipCode= details.patientTransferAddressDetails.ZipCode,
            $scope.patientData.PatientEmail =details.patientTransferEmailDetails;
            $scope.patientData.PatientPhone =details.patientTransferPhoneDetails;
            if ($scope.patientData.PatientPhone != undefined)
              $scope.phones = $scope.patientData.PatientPhone;
          },
          err => {
              toastrFactory.error(
                localize.getLocalizedString('Failed to retrieve patinet details.')
              );
              $scope.loading = false;          
          }
        );
        $scope.PatientName = ctrl.buildName(
          $scope.patientData.FirstName,
          $scope.patientData.LastName,
          $scope.patientData.MiddleName,
          $scope.patientData.Suffix
        );
        $scope.primaryPatientName = ctrl.buildName(
          $scope.$parent.patient.Data.FirstName,
          $scope.$parent.patient.Data.LastName,
          $scope.$parent.patient.Data.MiddleName,
          $scope.$parent.patient.Data.Suffix
        );
        $scope.primaryPID = $scope.$parent.patient.Data.PatientCode;

        if ($scope.patientData.ResponsiblePersonId != undefined)
          $scope.ResponsibleParty = $scope.patientData.ResponsiblePersonId === $scope.patientData.PatientId ?'self':'other';

        if ($scope.patientData.PersonAccountMember)
          $scope.warningRP =
            $scope.patientData.PersonAccountMember.length > 1 ? true : false;
      };


      ctrl.setHeight = function () {
        var maxheight = 0;
        var element_section1 = angular.element(
          document.querySelector('.patientAccountTransfer__section1')
        );
        var element_section2 = angular.element(
          document.querySelector('.patientAccountTransfer__section2')
        );
      };
      $scope.primarySelected = function (val) {
        $scope.$parent.isPrimary.isSelectedLeft = false;
        $scope.$parent.isPrimary.isSelectedRight = true;
        $scope.$root.borderStyle_section1 = 'border-nonePrimary';
        $scope.$root.borderStyle_section2 = 'border-primary';
        $timeout(callAtTimeout, 1);
      };
      $scope.$watch('patientData2', function (nv) {
        $scope.loaded = true;
        $scope.patientData = nv;

        ctrl.displayPatientInfo();
        $timeout(callAtTimeout, 1);
      });

      $timeout(callAtTimeout, 1);

      function callAtTimeout() {
        $scope.$parent.setHeight(0);
      }
      ctrl.buildName = function (firstname, lastname, middlename, suffix) {
        if (!!suffix && suffix.trim() !== '' && suffix !== 'N/A') {
          lastname += ', ' + suffix
        }

        return !!middlename && middlename.trim() !== '' && middlename !== 'N/A'
          ? firstname + ' ' + middlename + '.' + ' ' + lastname
          : firstname + ' ' + lastname;
      };
      ctrl.init = function () {
        $scope.loaded = false;
        ctrl.displayPatientInfo();
      };
      ctrl.init();
    },
  ]);
