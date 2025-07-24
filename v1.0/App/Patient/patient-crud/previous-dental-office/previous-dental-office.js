'use strict';

var app = angular
  .module('Soar.Patient')
  .controller('PreviousDentalOfficeController', [
    '$scope',
    '$location',
    'localize',
    '$timeout',
    'StaticData',
    'SaveStates',
    function ($scope, $location, localize, $timeout, staticData, saveStates) {
      //#region properties
      var ctrl = this;
      $scope.nameRequired = false;
      $scope.isContactCollapsed = false;

      // may remove
      $scope.isNoteCollapsed = false;
      ctrl.initializeController = function () {
        $scope.stateList = staticData.States();
      };

      //#endregion

      //#region validation

      ctrl.validateForm = function () {
        // allow all columns to be blank...won't save the record in this case
        if (
          $scope.previousDentalOffice.Name == '' &&
          $scope.previousDentalOffice.Address.AddressLine1 == '' &&
          $scope.previousDentalOffice.Address.AddressLine2 == '' &&
          $scope.previousDentalOffice.Address.City == '' &&
          ($scope.previousDentalOffice.Address.State == null ||
            $scope.previousDentalOffice.Address.State == '') &&
          $scope.previousDentalOffice.Address.ZipCode == '' &&
          $scope.previousDentalOffice.PhoneNumber == '' &&
          $scope.previousDentalOffice.Notes == ''
        ) {
          $scope.previousDentalOffice.IsValid = true;
          $scope.nameRequired = false;
          $scope.frmPreviousDentalOffice.inpPreviousDentistName.$valid = true;
        } else {
          // name is required if we are saving a previous dental office record
          $scope.nameRequired = true;
          $scope.frmPreviousDentalOffice.inpPreviousDentistName.$valid =
            $scope.previousDentalOffice.Name != '';
          // set is valid based on input
          $scope.previousDentalOffice.IsValid =
            $scope.frmPreviousDentalOffice.$valid &&
            $scope.frmPreviousDentalOffice.inpPreviousDentistName.$valid &&
            $scope.frmPreviousDentalOffice.inpDentalOfficeZip.$valid;
        }
        ctrl.addPreviousDentalToPerson();
      };

      // only add valid PreviousDentalOffice to person if it has a Name
      ctrl.addPreviousDentalToPerson = function () {
        if (
          $scope.previousDentalOffice.IsValid == true &&
          $scope.previousDentalOffice.Name &&
          $scope.previousDentalOffice.Name.length > 0
        ) {
          $scope.person.PreviousDentalOffice = $scope.previousDentalOffice;
        } else {
          $scope.person.PreviousDentalOffice = null;
        }
      };

      // Watch the data, if any changes validate and enable/disable save
      $scope.$watch(
        'previousDentalOffice',
        function (nv, ov) {
          if (nv) {
            ctrl.validateForm(nv);
          }
        },
        true
      );

      //#endregion

      //#region

      $scope.$watch('setFocusOnInput', function (nv, ov) {
        if (nv && nv != ov) {
          $scope.hasErrors = !$scope.previousDentalOffice.IsValid;
          $scope.setFocusOnElement();
        }
      });

      // sets the focus on the first invalid input
      $scope.setFocusOnElement = function () {
        // reset focus trigger
        if (
          $scope.frmPreviousDentalOffice.inpPreviousDentistName.$valid == false
        ) {
          $timeout(function () {
            angular.element('#inpPreviousDentistName').focus();
          }, 0);
          return true;
        }
        if ($scope.frmPreviousDentalOffice.inpDentalOfficeZip.$valid == false) {
          $timeout(function () {
            angular.element('#inpDentalOfficeZip').focus();
          }, 0);
          return true;
        }
        return false;
      };

      //#endregion

      ctrl.initializeController();
    },
  ]);
