'use strict';

angular
  .module('Soar.Patient')
  .controller('PatientEmailController', [
    '$scope',
    '$rootScope',
    '$timeout',
    'StaticData',
    'localize',
    'SaveStates',
    '$filter',
    'ListHelper',
    PatientEmailController,
  ]);
function PatientEmailController(
  $scope,
  $rootScope,
  $timeout,
  staticData,
  localize,
  saveStates,
  $filter,
  listHelper
) {
  BaseCtrl.call(this, $scope, 'PatientEmailController');
  var ctrl = this;
  $scope.optOutEmailReminders = false;
  $scope.showLabel = angular.isDefined($scope.showLabel)
    ? $scope.showLabel
    : true;
  $scope.isPatient =
    angular.isDefined($scope.patientInfo) && $scope.patientInfo.Profile != null;
  if ($scope.isPatient) {
    angular.forEach($scope.emails, function (email) {
      if (angular.isUndefined(email.PatientInfo) || email.PatientInfo == null) {
        email.PatientInfo = {
          FirstName: $scope.patientInfo.Profile.FirstName,
          LastName: $scope.patientInfo.Profile.LastName,
        };
      }
      if (angular.isUndefined(email.ReminderOK) || email.ReminderOK == null) {
        email.ReminderOK = false;
      }
    });
  }

  $scope.focusIndex = 0;

  $scope.filterState = function (state) {
    return function (item) {
      return item[state] != saveStates.Delete;
    };
  };

  // used to tell other emails they can or can not edit a custom email type
  $scope.flags = {
    editing: false,
  };

  //#region Init
  /* Initializes a new email object if emails is empty
   * Else will look through emails for any custom email types and add them to phoneTypes
   */
  $scope.newEmailPrimary = {
    PatientInfo: $scope.isPatient
      ? {
          FirstName: $scope.patientInfo.Profile.FirstName,
          LastName: $scope.patientInfo.Profile.LastName,
        }
      : null,
    PatientEmailId: null,
    Email: '',
    ObjectState: saveStates.Add,
    IsPrimary: true,
    ReminderOK: true,
    editMode: true,
  };
  $scope.newEmail = {
    PatientInfo: $scope.isPatient
      ? {
          FirstName: $scope.patientInfo.Profile.FirstName,
          LastName: $scope.patientInfo.Profile.LastName,
        }
      : null,
    PatientEmailId: null,
    Email: '',
    ObjectState: saveStates.Add,
    IsPrimary: false,
    ReminderOK: true,
    editMode: true,
  };

  $scope.setEmailPatientInfo = function () {
    $scope.newEmailPrimary.PatientInfo = $scope.isPatient
      ? {
          FirstName: $scope.patientInfo.Profile.FirstName,
          LastName: $scope.patientInfo.Profile.LastName,
        }
      : null;
    $scope.newEmail.PatientInfo = $scope.isPatient
      ? {
          FirstName: $scope.patientInfo.Profile.FirstName,
          LastName: $scope.patientInfo.Profile.LastName,
        }
      : null;
  };

  $scope.init = function () {
    // custom phoneTypes associated with existing emails do not always make it into the dropdown, adding a little delay
    // to try and ensure that existing emails have been loaded before we try and add any custom types to the dropdown
    $timeout(function () {
      if ($scope.emails.length === 0) {
        $scope.setEmailPatientInfo();
        var newEmail = angular.copy($scope.newEmailPrimary);
      }
    }, 200);

    $scope.activateAddEmail = false;
  };
  $scope.init();
  //#endregion Init

  $scope.$watch('focusIf', function (nv, ov) {
    if (nv != null && ov != null && nv != ov) {
      $scope.focusIndex = 0;
    }
  });

  //#region EMails
  $scope.addEmail = function (email) {
    var canAdd = true;
    angular.forEach($scope.emails, function (email) {
      if (
        email.ObjectState !== saveStates.Delete &&
        !email.Email &&
        (!email.PatientEmailId || email.PatientEmailId.length == 0)
      ) {
        canAdd = false;
        return;
      }
    });

    if (canAdd) {
      var addEmail = {};
      if (angular.isDefined(email)) {
        addEmail = angular.copy(email);
      } else {
        $scope.setEmailPatientInfo();
        addEmail = angular.copy($scope.newEmail);
      }

      if ($scope.emails.length - $scope.deletedPhones.length <= 0) {
        addEmail.IsPrimary = true;
      }

      $scope.emails.push(addEmail);

      $scope.focusIndex = Math.max(
        $scope.emails.length - $scope.deletedPhones.length - 1,
        0
      );
    }
  };

  $scope.deletedPhones = [];
  $scope.removeEmail = function (email) {
    if (email.ObjectState == saveStates.Add) {
      $scope.emails.splice($scope.emails.indexOf(email), 1);
    } else {
      email.ObjectState = saveStates.Delete;
      // keeping track of deleted emails so that the user can have up to the maxLimit without
      // taking into account how many they have deleted
      $scope.deletedPhones.push(email);
    }

    angular.forEach($scope.emails, function (email, index) {
      if (email._tempId) {
        email._tempId = index;
      }
    });

    if (email.IsPrimary && $scope.emails.length > 0) {
      for (var i = 0; i < $scope.emails.length; i++) {
        var p = $scope.emails[i];
        if (p.ObjectState != saveStates.Delete) {
          ctrl.setNewIsPrimary(p);
          break;
        }
      }
    }

    $scope.focusIndex = Math.max(
      $scope.emails.length - $scope.deletedPhones.length - 1,
      0
    );
  };

  /* Watches emails array for any of them were to throw a validation error */
  $scope.$watch(
    function () {
      if (!_.isNil($scope.emails)) {
        return $scope.emails.map(function (obj) {
          return { hasErrors: obj.hasErrors, Email: obj.Email };
        });
      }
    },
    function (nv) {
      $scope.$emit('emails-changed');
      $scope.validPhones = true;
      for (var i = 0; i < nv.length; i++) {
        if (nv[i].hasErrors == true) $scope.validPhones = false;
        if (i == 0) {
          $scope.emails[i].duplicateEmail = false;
        }
        for (var j = i + 1; j < nv.length; j++) {
          if (i == 0) $scope.emails[j].duplicateEmail = false;
          if (
            nv[i].Email == nv[j].Email &&
            $scope.emails[i].ObjectState != saveStates.Delete &&
            $scope.emails[j].ObjectState != saveStates.Delete
          ) {
            $scope.emails[i].duplicateEmail = true;
            $scope.emails[j].duplicateEmail = true;
          }
        }
      }
    },
    true
  );

  // only show IsPrimary if more than one email
  $scope.showIsPrimaryCheckBox = false;
  $scope.$watch(
    'emails',
    function (nv, ov) {
      // if email is removed and only one left, reset showIsPrimaryCheckBox
      if (nv.length > 1 && $scope.showIsPrimary) {
        $scope.showIsPrimaryCheckBox = true;
      } else if (nv && nv[0]) {
        $scope.showIsPrimaryCheckBox = false;
      }
      if (nv != ov) {
        $scope.deletedPhones = [];
        for (var i = 0; i < nv.length; i++) {
          // bug fix - when a user clears (not clicking remove) a email, the blank email object is still marked as primary
          // that email is not being sent to the API but none of the other emails are marked as primary, which is causing an error
          // trying to handle this like the remove function, just marking the first of the other emails to primary
          if (nv[i].IsPrimary == true) {
            if (nv[i].PhoneNumber && nv[i].PhoneNumber.length === 0) {
              if (i === 0 && nv.length > 1) {
                ctrl.setNewIsPrimary(nv[1]);
              } else if (i >= 1) {
                ctrl.setNewIsPrimary(nv[0]);
              }
            } else if (nv[i] && ov[i] && nv[i].IsPrimary != ov[i].IsPrimary) {
              // this is the new Primary email, set others to IsPrimary false
              ctrl.setNewIsPrimary(nv[i]);
            }
          }
          if (nv[i].ObjectState == saveStates.Delete) {
            $scope.deletedPhones.push(nv[i]);
          }
        }
      }

      $scope.tempEmail = angular.copy(nv);
    },
    true
  );

  ctrl.setNewIsPrimary = function (primaryPhone) {
    angular.forEach($scope.emails, function (email) {
      if (
        (primaryPhone._tempId >= 0 && email._tempId == primaryPhone._tempId) ||
        (primaryPhone.ContactId && email.ContactId == primaryPhone.ContactId)
      ) {
        var originalIsPrimary = email.IsPrimary;
        email.IsPrimary = true;

        if (
          originalIsPrimary !== true &&
          email.ObjectState === saveStates.None
        ) {
          email.ObjectState = saveStates.Update;
        }
      } else {
        var originalIsPrimary = email.IsPrimary;
        email.IsPrimary = false;

        if (
          originalIsPrimary !== false &&
          email.ObjectState === saveStates.None
        ) {
          email.ObjectState = saveStates.Update;
        }
      }
    });
  };

  $scope.toggleOptions = function () {
    angular.forEach($scope.emails, function (email) {
      email.ReminderOK = !$scope.optOutEmailReminders;
    });
  };

  $scope.$on('soar:email-remove', function (event, email) {
    $scope.removeEmail(email);
  });

  $scope.$rootScopeRegistrations.push(
    $rootScope.$on('account-members-loaded', function (event, accountMembers) {
      angular.forEach($scope.emails, function (email) {
        if (email.AccountEmailId) {
          var foundInfo = listHelper.findItemByFieldValue(
            accountMembers,
            'PatientId',
            email.AccountEMail.PatientId
          );
          email.PatientInfo = {
            FirstName: foundInfo.FirstName,
            LastName: foundInfo.LastName,
          };
        }
      });
    })
  );

  $scope.$rootScopeRegistrations.push(
    $rootScope.$on('add-email-address', function () {
      $scope.activateAddEmail = true;
      $scope.addEmail();
    })
  );

  $scope.$rootScopeRegistrations.push(
    $rootScope.$on('email-primary-changed', function (event, email) {
      $scope.emails.forEach(function (item) {
        if (item == email) {
          item.IsPrimary = true;
        } else {
          item.IsPrimary = false;
        }
      });
    })
  );

  $scope.$rootScopeRegistrations.push(
    $rootScope.$on('add-account-member-email-address', function (event, item) {
      var email = {
        Email: item.Email,
        PatientInfo: { FirstName: item.FirstName, LastName: item.LastName },
        IsPrimary: false,
        ReminderOK: true,
        AccountEmailId: item.AccountEmailId,
        ObjectState: saveStates.Add,
        editMode: false,
        invalidEmail: false,
      };
      item.added = true;

      $scope.addEmail(email);
    })
  );

  $scope.$rootScopeRegistrations.push(
    $rootScope.$on('opt-out-email', function (event, item) {
      $scope.optOutEmailReminders = item;
      $scope.tempEmails = _.isUndefined($scope.tempEmails)
        ? angular.copy($scope.tempEmail)
        : $scope.tempEmails;
      if (item) {
        $scope.tempEmails = angular.copy($scope.tempEmail);
        $scope.toggleOptions();
      } else {
        $scope.emails = $scope.tempEmails;
      }
    })
  );

  $scope.emailReminderChange = function () {
    if ($scope.emails != null && $scope.emails.length > 0) {
      var trueCnt = 0;
      _.each($scope.emails, function (item) {
        if (item.ReminderOK) {
          trueCnt++;
        }
      });
      $scope.optOutEmailReminders = trueCnt == 0;
    }
  };

  $scope.$rootScopeRegistrations.push(
    $rootScope.$on('email-reminder-changed', function (event, item) {
      $scope.emailReminderChange();
    })
  );

  $scope.$watch('optOutEmailReminders', function (nv, ov) {
    if (nv != null && ov != null && nv != ov) {
      var obj = { Value: nv, Type: 'Email' };
      $rootScope.$broadcast('toggle-opt-out-all-comms', obj);
    }
  });
}

PatientEmailController.prototype = Object.create(BaseCtrl.prototype);
//#endregion EMails
