'use strict';

var app = angular
  .module('Soar.Patient')
  .controller('ContactDetailsController', [
    '$scope',
    '$location',
    'localize',
    '$timeout',
    'StaticData',
    'SaveStates',
    function ($scope, $location, localize, $timeout, staticData, saveStates) {
      //#region properties
      var ctrl = this;
      $scope.hasErrors = false;
      $scope.showSecondEmail = false;

      //#endregion

      //#initialize controller

      ctrl.initializeController = function () {
        $scope.stateList = staticData.States();
      };
      ctrl.initializeController();

      //#endregion

      $scope.$watch('setFocusOnInput', function (nv, ov) {
        if (nv && nv != ov) {
          $scope.hasErrors = !$scope.person.Profile.ContactsAreValid;
          $scope.setFocusOnElement();
        }
      });

      $scope.validateInfo = function (nv) {
        if (nv && $scope.frmContactDetails) {
          $scope.person.Profile.ContactsAreValid =
            $scope.frmContactDetails.$valid &&
            $scope.frmContactDetails.inpAddressEmail1.$valid &&
            $scope.frmContactDetails.inpAddressEmail2.$valid;
          //&& $scope.validPhones == true
        }
      };

      // Watch the data, if any changes validate and enable/disable save
      $scope.$watch(
        'person.Profile',
        function (nv) {
          $timeout(function () {
            $scope.validateInfo(nv);
            $scope.$apply();
          }, 0);
        },
        true
      );

      $scope.$watch('phones', function (nv) {
        $scope.validateInfo(nv);
      });

      //#endregion

      // Handle unchecking Sex, reset to null
      $scope.uncheckedSex = function (event) {
        if ($scope.person.Profile.Sex == event.target.value) {
          $scope.person.Profile.Sex = null;
        }
      };

      //#region contact info from responsible person

      $scope.copyContactInfo = function (event) {
        if ($scope.useResponsiblePersonContact) {
          if (
            $scope.person.Profile.ResponsiblePersonId != null &&
            $scope.responsiblePerson != null
          ) {
            var responsiblePerson = angular.copy($scope.responsiblePerson);
            $scope.phones.splice(0, $scope.phones.length);
            angular.forEach(
              responsiblePerson.PatientPhoneInformationDtos,
              function (phone) {
                phone.PatientId = null;
                phone.ContactId = null;
                phone.ObjectState = saveStates.Add;
                $scope.phones.push(phone);
              }
            );
            // NOTE wf
            if ($scope.phones.length == 0) {
              $scope.resetPhones();
            }
            $scope.person.Profile.EmailAddress = responsiblePerson.EmailAddress;
            $scope.person.Profile.EmailAddressRemindersOk =
              responsiblePerson.EmailAddressRemindersOk;
            $scope.person.Profile.EmailAddress2 =
              responsiblePerson.EmailAddress2;
            $scope.person.Profile.EmailAddress2RemindersOk =
              responsiblePerson.EmailAddress2RemindersOk;
            if (
              responsiblePerson.EmailAddress2 &&
              responsiblePerson.EmailAddress2.length > 0
            ) {
              $scope.showSecondEmail = true;
            }

            $scope.person.Profile.AddressLine1 = responsiblePerson.AddressLine1;
            $scope.person.Profile.AddressLine2 = responsiblePerson.AddressLine2;
            $scope.person.Profile.City = responsiblePerson.City;
            $scope.person.Profile.State = responsiblePerson.State;
            $scope.person.Profile.ZipCode = responsiblePerson.ZipCode;
          }
        }
      };

      // clear responsible person fields if responsible person changes and useResponsiblePersonContact=true
      $scope.clearResponsibleContactInfo = function () {
        $scope.resetPhones();
        $scope.person.Profile.EmailAddress = null;
        $scope.person.Profile.EmailAddress2 = null;
        $scope.person.Profile.AddressLine1 = null;
        $scope.person.Profile.AddressLine2 = null;
        $scope.person.Profile.City = null;
        $scope.person.Profile.State = null;
        $scope.person.Profile.ZipCode = null;
      };

      // triggered when responsible person changes
      $scope.$watch('responsiblePerson', function (nv) {
        if ($scope.useResponsiblePersonContact) {
          $scope.clearResponsibleContactInfo();
        }
        $scope.useResponsiblePersonContact = false;
      });

      $scope.resetPhones = function () {
        $scope.phones.splice(0, $scope.phones.length, [
          {
            PatientInfo: $scope.person.Profile,
            ContactId: null,
            PatientId: null,
            PhoneNumber: '',
            Type: '',
            TextOk: false,
            Notes: '',
            ObjectState: saveStates.None,
          },
        ]);
      };

      //#endregion

      //#region set focus

      // sets the focus on the first invalid input
      $scope.setFocusOnElement = function () {
        if ($scope.frmContactDetails.inpAddressEmail1.$valid == false) {
          $timeout(function () {
            angular.element('#inpAddressEmail1').focus();
          }, 0);
          return true;
        }
        if ($scope.frmContactDetails.inpAddressEmail2.$valid == false) {
          $timeout(function () {
            angular.element('#inpAddressEmail2').focus();
          }, 0);
          return true;
        }
        //if ($scope.frmContactDetails.inpZip.$valid == false) {
        //    $timeout(function() {
        //        angular.element('#inpZip').focus();
        //    }, 0);
        //    return true;
        //}
        if ($scope.validDob == false) {
          $timeout(function () {
            angular.element('#inpDateOfBirth').focus();
          }, 0);
          return true;
        }
        if ($scope.validPhones == false) {
          $timeout(function () {
            angular.element('#lblPhones').focus();
          }, 0);
          return true;
        }
        if ($scope.validResponsiblePerson == false) {
          $timeout(function () {
            //angular.element('#inpFirstName').focus();
            angular.element('#personTypeAheadInput').focus();
          }, 0);
          $scope.focusOnResponsiblePerson = true;
          return true;
        }
        return false;
      };

      //#endregion

      //#region email

      $scope.addEmail = function () {
        if ($scope.person.Profile.EmailAddress != '') {
          $scope.showSecondEmail = true;
        }
      };

      //#endregion
    },
  ]);
