'use strict';

var app = angular
  .module('Soar.Patient')
  .controller('PersonalInfoController', [
    '$scope',
    '$location',
    '$filter',
    'localize',
    '$timeout',
    'StaticData',
    'SaveStates',
    'ModalFactory',
    PersonalInfoController,
  ]);

function PersonalInfoController(
  $scope,
  $location,
  $filter,
  localize,
  $timeout,
  staticData,
  saveStates,
  modalFactory
) {
  BaseCtrl.call(this, $scope, 'PersonalInfoController');

  //#region properties
  var ctrl = this;
  $scope.hasErrors = false;
  // holds the responsible person when created
  $scope.responsiblePerson = null;
  $scope.useResponsiblePersonContact = false;

  $scope.personSexOptions = ['M', 'F'];
  $scope.personSexLabels = ['Male', 'Female'];

  $scope.validResponsiblePerson = true;
  $scope.focusOnResponsiblePerson = false;
  $scope.ageCheck = true;

  $scope.validDob = true;
  $scope.validPhones = true;
  $scope.ageCheck = true;
  $scope.showSecondEmail = false;

  // Regex for validating personal info
  $scope.personalInfoRegex =
    '[^a-zA-Z0-9. !""#$%&\'()*+,-/:;<=>?@[\\]^_`{|}~d]$';

  //#endregion

  //#initialize controller

  ctrl.initializeController = function () {
    $scope.stateList = staticData.States();

    $scope.maxDate = moment().startOf('day').toDate();
  };

  ctrl.initializeController();

  //#endregion

  //#region form Validation

  // validate age
  $scope.validateAge = function () {
    var person = $scope.person;
    if (
      person.Profile.DateOfBirth &&
      person.Profile.DateOfBirth.length > 0 &&
      person.Profile.ResponsiblePersonType != null &&
      person.Profile.ResponsiblePersonType == '1'
    ) {
      var age = $filter('age')(person.Profile.DateOfBirth);
      if (age < 18 && $scope.ageCheck) {
        $scope.ageCheck = false;
        var patientName = [person.Profile.FirstName, person.Profile.LastName]
          .filter(function (text) {
            return text;
          })
          .join(' ');
        var message = localize.getLocalizedString(
          '{0} is under the age of 18.',
          [patientName]
        );
        var title = localize.getLocalizedString(
          'Responsible Person Validation'
        );
        var button1Text = localize.getLocalizedString('Continue');
        var button2Text = localize.getLocalizedString('Cancel');
        modalFactory
          .ConfirmModal(title, message, button1Text, button2Text)
          .then($scope.clearResponsiblePerson);
      } else {
        $scope.continueWithSave();
      }
    } else {
      $scope.continueWithSave();
    }
  };

  // clear resonsible person if not valid age
  $scope.clearResponsiblePerson = function () {
    $scope.person.Profile.ResponsiblePersonId = null;
    $scope.responsiblePerson = null;
    $scope.person.Profile.ResponsiblePersonType = null;
    $timeout(function () {
      var ele = angular.element('#inpSelf');
      if (ele) {
        ele.value = '';
        ele.focus();
      }
    }, 200);
  };

  $scope.$watch('setFocusOnInput', function (nv, ov) {
    if (nv && nv != ov) {
      $scope.hasErrors = !$scope.person.Profile.IsValid;
      $scope.setFocusOnElement();
    }
  });

  // validate required and any attributes
  $scope.validateInfo = function (nv) {
    //console.log($scope.person.Profile.IsValid)
    if (nv && $scope.frmPersonalInfo) {
      if ($scope.person.Profile.ResponsiblePersonType == 1) {
        $scope.validResponsiblePerson = true;
      }
      $scope.person.Profile.IsValid =
        $scope.frmPersonalInfo.$valid &&
        $scope.frmPersonalInfo.inpFirstName.$valid &&
        $scope.frmPersonalInfo.inpLastName.$valid &&
        $scope.validDob == true &&
        $scope.validResponsiblePerson == true;

      if (
        $scope.person.Profile.ResponsiblePersonType == 2 &&
        $scope.person.Profile.ResponsiblePersonId == null
      ) {
        $scope.person.Profile.IsValid = false;
      }
    }
  };

  // Watch the data, if any changes validate and enable/disable save
  $scope.$watch(
    'person',
    function (nv) {
      $timeout(function () {
        $scope.validateInfo(nv);
        $scope.$apply();
      }, 0);
    },
    true
  );

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
        if (responsiblePerson.PatientPhoneInformationDtos.length > 0) {
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
        }

        $scope.person.Profile.EmailAddress = responsiblePerson.EmailAddress;
        $scope.person.Profile.EmailAddressRemindersOk =
          responsiblePerson.EmailAddressRemindersOk;
        $scope.person.Profile.EmailAddress2 = responsiblePerson.EmailAddress2;
        $scope.person.Profile.EmailAddress2RemindersOk =
          responsiblePerson.EmailAddress2RemindersOk;
        if (
          responsiblePerson.EmailAddress2 &&
          responsiblePerson.EmailAddress2.length > 0
        ) {
          $scope.showSecondEmail = true;
        }

        $scope.person.Profile.MailAddressRemindersOK =
          responsiblePerson.MailAddressRemindersOK;
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
    // reset focus trigger
    if ($scope.frmPersonalInfo.inpFirstName.$valid == false) {
      $timeout(function () {
        angular.element('#inpFirstName').focus();
      }, 0);
      return true;
    }
    if ($scope.frmPersonalInfo.inpLastName.$valid == false) {
      $timeout(function () {
        angular.element('#inpLastName').focus();
      }, 0);
      return true;
    }
    if ($scope.validDob == false) {
      $timeout(function () {
        angular.element('#inpDateOfBirth').focus();
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

  //$scope.addEmail = function() {
  //    if ($scope.person.Profile.EmailAddress != '') {
  //        $scope.showSecondEmail = true;
  //    }
  //}

  //#endregion
}

PersonalInfoController.prototype = Object.create(BaseCtrl.prototype);
