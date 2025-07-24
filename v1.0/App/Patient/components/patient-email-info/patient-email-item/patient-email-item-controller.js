'use strict';

angular.module('Soar.Patient').controller('PatientEmailItemController', [
  '$scope',
  '$rootScope',
  'ListHelper',
  'localize',
  'SaveStates',
  '$filter',
  '$timeout',
  'PatientServices',
  function (
    $scope,
    $rootScope,
    listHelper,
    localize,
    saveStates,
    $filter,
    $timeout,
    patientServices
  ) {
    var ctrl = this;

    $scope.customPhoneTypes = [];
    $scope.noteCollapsed = true;
    $scope.editing = false;
    $scope.showRemoveMsg = false;
    $scope.isPatient =
      angular.isDefined($scope.email.PatientInfo) &&
      $scope.email.PatientInfo != null;
    $scope.editingMode = $scope.email.editMode == false ? false : true;
    $scope.disableClick = true;
    $scope.emailString = '';
    $scope.allEmails = null;

    if ($scope.email.ObjectState == 'None') {
      $scope.emailString = $scope.email.Email;
      $scope.editingMode = false;
    }

    $scope.defaultPlaceholder = localize.getLocalizedString('Select {0}', [
      'Phone Type',
    ]);

    $scope.addOptionValue = localize.getLocalizedString('Custom');
    $scope.showLabel = angular.isDefined($scope.showLabel)
      ? $scope.showLabel
      : true;

    // add the id to the phone item
    $scope.email._tempId = $scope.emailId;

    //#region Custom Phone Types
    $scope.editCustomLabel = '';
    $scope.editCustomPhoneType = function (phoneType) {
      $scope.editing = true;
      $scope.editMode = true;
      $scope.editCustomLabel = phoneType;
      $scope.showRemoveMsg = false;
    };

    $scope.cancelCustomPhoneType = function () {
      $scope.addingCustomPhoneType = false;
      $scope.editing = false;
      $scope.editMode = false;
      $scope.showRemoveMsg = false;
    };

    $scope.phoneTypeChanged = function () {
      var requiresPhoneType = !($scope.hidePhoneTypes == true);

      if (requiresPhoneType && $scope.email.Type == $scope.addOptionValue) {
        $scope.email.Type = null;
        $scope.addingCustomPhoneType = true;
      }

      ctrl.ddl.options.optionLabel = $scope.defaultPlaceholder;
      ctrl.ddl.optionLabelTemplate = ctrl.defaultOptionLabelTemplate;
      ctrl.ddl.refresh();
    };

    $scope.addCustomPhoneType = function () {
      $scope.email.Type = $filter('titlecase')($scope.email.Type);
      ctrl.ddl.options.optionLabel = $scope.email.Type;
      ctrl.ddl.optionLabelTemplate = function (optionLabel) {
        return (
          '<span class="value-template-input k-state-default jrwjrwjrw">' +
          optionLabel +
          '</span>'
        );
      };
      ctrl.ddl.refresh();
      ctrl.ddl.select(0);

      $scope.editing = false;
      $scope.editMode = false;
      $scope.addingCustomPhoneType = false;
      $scope.showRemoveMsg = false;
    };

    //#endregion Custom Phone Type

    //#region Remove Phone
    $scope.$watch('showRemoveOption', function (nv, ov) {
      if (ov == false && nv == true) {
        $scope.showRemoveMsg = false;
      }
    });

    $scope.removePrompt = function () {
      $scope.editing = false;
      $scope.editMode = false;
      $scope.addingCustomPhoneType = false;

      if (
        (!$scope.email.PatientEmailId ||
          $scope.email.PatientEmailId.length == 0) &&
        (!$scope.email.Email || $scope.email.Email == '') &&
        (!$scope.email.Type || $scope.email.Type == '') &&
        (!$scope.email.Notes || $scope.email.Notes == '') &&
        !$scope.email.TextOk
      ) {
        $scope.removeFunction($scope.email);
        $scope.showRemoveMsg = false;
      } else {
        $scope.showRemoveMsg = true;
      }
    };

    $scope.confirmRemove = function () {
      $scope.removeFunction($scope.email);
      $scope.showRemoveMsg = false;
    };

    $scope.cancelRemove = function () {
      $scope.showRemoveMsg = false;
    };
    //#endregion Remove Phone

    //#region Edited Phone

    $scope.originalEmail = angular.copy($scope.email);

    $scope.email.invalidEmail =
      $scope.email.invalidEmail == undefined ? true : $scope.email.invalidEmail;
    $scope.email.edited = false;

    $scope.validateEmail = function () {
      if ($scope.email.AccountEmailId != null) {
        $scope.emailString = $scope.email.Email;
      }
      if (angular.isUndefined($scope.emailString)) {
        $scope.email.invalidEmail = true;
      } else if ($scope.email.duplicateEmail) {
        $scope.email.invalidEmail = true;
      } else {
        $scope.email.invalidEmail =
          angular.isUndefined($scope.emailString) ||
          $scope.emailString == null ||
          $scope.emailString.length == 0 ||
          ($scope.emailString.length > 0 && $scope.emailString.length > 256) ||
          !$scope.frmEmailInfo.$valid;
      }
      $scope.email.hasErrors = $scope.email.invalidEmail;
    };

    $scope.$watch('emailString', function (nv, ov) {
      if (nv != ov) {
        $timeout.cancel($scope.timeoutEmailValidation);
        $scope.email.Email = nv;
        $scope.timeoutEmailValidation = $timeout(function () {
          $scope.hasBeenEdited();
          $scope.validateEmail();
        }, 1000);
      }
    });

    $scope.$watch('email.IsPrimary', function (nv, ov) {
      if (nv != ov) {
        $scope.hasBeenEdited();
        $scope.validateEmail();
      }
    });

    $scope.$watch('email.ReminderOK', function (nv, ov) {
      if (nv != ov) {
        $scope.hasBeenEdited();
        $scope.validateEmail();
        $rootScope.$broadcast('email-reminder-changed', nv);
      }
    });

    $scope.hasBeenEdited = function () {
      var p, op;
      p = $scope.email;
      op = $scope.originalEmail;
      if (p.PatientEmailId != null) {
        if (
          p.Email != op.Email ||
          p.ReminderOK != op.ReminderOK ||
          p.IsPrimary != op.IsPrimary
        ) {
          p.ObjectState = saveStates.Update;
          p.edited = true;
        } else {
          p.ObjectState = saveStates.None;
          p.edited = false;
        }
      } else {
        p.ObjectState = saveStates.Add;
      }
    };
    //#endregion Edited Phone

    $scope.primaryChanged = function () {
      // we've been clicked, don't allow deselection
      if ($scope.email.IsPrimary == false) {
        $scope.email.IsPrimary = true;
      }
    };
    $scope.disableEdit = function (isSave) {
      $scope.editingMode = false;
      if (!$scope.email.invalidEmail && isSave) {
        $scope.email.Email = $scope.emailString;
      } else if (
        $scope.email.Email == undefined ||
        !$scope.email.Email ||
        $scope.email.Email.length == 0 ||
        $scope.originalEmail.Email == undefined ||
        !$scope.originalEmail.Email ||
        $scope.email.Email.length == 0
      ) {
        $scope.removeFunction($scope.email);
      } else {
        $scope.email = $scope.originalEmail;
      }
    };

    $scope.enableEdit = function (id) {
      $scope.editingMode = true;
      $scope.emailString = $scope.email.Email;
      $scope.originalEmail = angular.copy($scope.email);
    };

    $scope.checkPhoneNumberValue = function () {
      if ($scope.email.PhoneNumber != null) {
        $scope.disableClick = false;
      }
    };

    $scope.isPrimaryClick = function (e) {
      if ($(e.currentTarget)[0].checked) {
        $rootScope.$broadcast('email-primary-changed', $scope.email);
      }
    };
    $rootScope.$broadcast('email-reminder-changed');

    $scope.getDeleteMessage = function () {
      var message = null;
      if ($scope.email.AccountEmailId) {
        message =
          'Are you sure you want to remove the link? This will not remove the email from the original owner.';
      } else {
        if ($scope.email.Links != null && $scope.email.Links.length > 1) {
          message =
            'Are you sure you want to remove this email? This will remove this email from linked patients in this account.';
        } else {
          message = 'Are you sure you want to remove this email?';
        }
      }

      return message;
    };
  },
]);
