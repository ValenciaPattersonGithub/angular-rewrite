'use strict';

angular
  .module('Soar.Patient')
  .controller('ContactDetailsPanelController', [
    '$scope',
    'ListHelper',
    '$timeout',
    '$rootScope',
    'PatientServices',
    'UserServices',
    'toastrFactory',
    'StaticData',
    'SaveStates',
    'localize',
    ContactDetailsPanelController,
  ]);
function ContactDetailsPanelController(
  $scope,
  listHelper,
  $timeout,
  $rootScope,
  patientServices,
  userServices,
  toastrFactory,
  staticData,
  saveStates,
  localize
) {
  BaseCtrl.call(this, $scope, 'ContactDetailsPanelController');
  var ctrl = this;

  $scope.optOutAllCommunications = false;
  $scope.optOutMailReminders = false;
  $scope.hasErrors = false;
  $scope.showSecondEmail = false;
  $scope.responsiblePerson = null;
  $scope.originalPatientInfo = angular.copy($scope.patientData.Profile);
  $scope.emailOptOut = false;
  $scope.phoneOptOut = false;
  $scope.validPhones = true;

  ctrl.initializeController = function () {
    $scope.stateList = staticData.States();

    if ($scope.patientData.Profile.PatientId != null) {
      angular.forEach($scope.phones, function (phone) {
        phone.CanAddNew = true;
        phone.NewlyAdded = false;
        phone.hasErrors = null;
        phone.invalidPhoneNumber = null;
      });

      if (
        $scope.patientData.Profile.ResponsiblePersonId !==
        $scope.patientData.Profile.PatientId
      ) {
        if ($scope.patientData.Profile.ResponsiblePersonId) {
          $timeout(function () {
            patientServices.Account.getByPersonId(
              { personId: $scope.patientData.Profile.ResponsiblePersonId },
              ctrl.getPersonSuccess,
              ctrl.getPersonFailed
            );
          }, 100);
        }
      } else $scope.accountMembers = [];
    }
    //There is already Promise and TimeOut in $scope.accountMembersChanged(), that'y I am commenting this below code to resolve Bug: 349354
    //if ($scope.patientData.Profile.State != null) {
    //    $scope.tempState = $scope.patientData.Profile.State;
    //    $scope.patientData.Profile.State = null;
    //}

    //$timeout(function () {
    //    $scope.patientData.Profile.State = $scope.tempState;
    //}, 100);
  };
  ctrl.initializeController();

  ctrl.getPersonSuccess = function (res) {
    $timeout(function () {
      var responsiblePerson = res.Value;
      var accountId = responsiblePerson.AccountId;
      patientServices.Account.getAllAccountMembersByAccountId(
        { accountId: accountId },
        ctrl.getAllAccountMembersByAccountIdOnSuccess,
        ctrl.getAllAccountMembersByAccountIdOnFail
      );
    }, 0);
  };

  ctrl.getPersonFailed = function (error) {
    toastrFactory.error(
      localize.getLocalizedString('Failed to retreive responsible person'),
      localize.getLocalizedString('Server Error')
    );
  };

  $scope.$watch('setFocusOnInput', function (nv, ov) {
    if (nv && nv != ov) {
      $scope.checkForErrors();
      $scope.setFocusOnElement();
    }
  });
  $scope.checkForErrors = function () {
    $scope.hasErrors = !$scope.patientData.Profile.ContactsAreValid;
  };

  $scope.validateInfo = function (nv) {
    if (nv && $scope.contactDetailsFrm) {
      $scope.patientData.Profile.ContactsAreValid =
        $scope.contactDetailsFrm.$valid &&
        $scope.contactDetailsFrm.inpZip.$valid &&
        $scope.validPhones == true;
      $scope.checkForErrors();
    }
  };

  $scope.$watch(
    'patientData.Profile',
    function (nv) {
      $timeout(function () {
        $scope.validateInfo(nv);
        $scope.$apply();
      }, 0);
    },
    true
  );

  $scope.$watch(
    'patientData.Profile.ResponsiblePersonType',
    function (nv) {
      $timeout(function () {
        if (nv == 1) {
          if (!$scope.patientData.Profile.PatientId) {
            $scope.accountMembers = [];
            ctrl.clearAddressFields();
          }
        }
      }, 0);
    },
    true
  );

  $scope.$watch(
    'patientData.Profile.ResponsiblePersonId',
    function (nv) {
      $timeout(function () {
        if (nv) {
          if ($scope.patientData.responsiblePerson) {
            var accountId =
              $scope.patientData.responsiblePerson.PersonAccount.AccountId;
            patientServices.Account.getAllAccountMembersByAccountId(
              { accountId: accountId },
              ctrl.getAllAccountMembersByAccountIdOnSuccess,
              ctrl.getAllAccountMembersByAccountIdOnFail
            );
          }
        } else {
          if (!$scope.patientData.Profile.PatientId) {
            $scope.accountMembers = [];
            ctrl.clearAddressFields();
          }
        }
      }, 0);
    },
    true
  );

  $scope.accountMembers = [];
  ctrl.getAllAccountMembersByAccountIdOnSuccess = function (res) {
    $timeout(function () {
      var memberWithPhoneInfo = [];
      var memberWithEmail = [];
      angular.forEach(res.Value, function (accountMember) {
        accountMember.Name =
          accountMember.FirstName + ' ' + accountMember.LastName;
        accountMember.PatientPhoneInformationDtos = [];
        patientServices.Emails.get(
          { Id: accountMember.PatientId },
          function (emails) {
            angular.forEach(emails.Value, function (email) {
              if (email.Email && email.AccountEmailId == null) {
                memberWithEmail.push({
                  Email: email.Email,
                  FirstName: accountMember.FirstName,
                  LastName: accountMember.LastName,
                  Notes: '',
                  ObjectState: saveStates.Add,
                  AccountEmailId: email.PatientEmailId,
                  added: false,
                });
              }
            });
          },
          ctrl.getPatientPhoneByPatientIdOnFail
        );
        patientServices.Contacts.get(
          { Id: accountMember.PatientId },
          function (contacts) {
            angular.forEach(contacts.Value, function (contact) {
              if (!contact.PhoneReferrerId) {
                memberWithPhoneInfo.push({
                  PhoneNumber: contact.PhoneNumber,
                  Type: contact.Type,
                  //AC 2.4 and 2.5 of PBI 57143
                  //IsPrimary : contact.IsPrimary,
                  ReminderOK: true,
                  TextOk: contact.Type == 'Mobile' ? true : false,
                  FirstName: accountMember.FirstName,
                  LastName: accountMember.LastName,
                  Notes: '',
                  ObjectState: saveStates.Add,
                  PhoneReferrerId: contact.ContactId,
                  added: false,
                });
              }
            });
          },
          ctrl.getPatientPhoneByPatientIdOnFail
        );
      });

      var allAcctMembers = res.Value;
      $scope.accountMembers = listHelper.findAllByPredicate(
        allAcctMembers,
        function (member) {
          return (
            member.AddressReferrerId == null &&
            member.PatientId != $scope.patientData.Profile.PatientId
          );
        }
      );
      $scope.patientData.AccountMembers = memberWithPhoneInfo;
      $scope.patientData.AccountEmails = memberWithEmail;
      $scope.patientData.AllMembers = allAcctMembers;

      if ($scope.patientData.Profile.AddressReferrerId) {
        $timeout(function () {
          $scope.selectedAccountMember = listHelper.findItemByFieldValue(
            allAcctMembers,
            'PatientId',
            $scope.patientData.Profile.AddressReferrerId
          );
          $scope.accountMembersChanged();
          $rootScope.$broadcast('account-members-loaded', allAcctMembers);
        }, 500);
      } else {
        $timeout(function () {
          $rootScope.$broadcast('account-members-loaded', allAcctMembers);
        }, 500);
      }
    }, 0);
  };

  ctrl.getAllAccountMembersByAccountIdOnFail = function (error) {
    toastrFactory.error(
      localize.getLocalizedString(
        'Failed to load account members for responsible person'
      ),
      localize.getLocalizedString('Server Error')
    );
  };

  $scope.$watch('phones', function (nv) {
    $scope.validateInfo(nv);
  });

  // Handle unchecking Sex, reset to null
  $scope.uncheckedSex = function (event) {
    if ($scope.person.Profile.Sex == event.target.value) {
      $scope.person.Profile.Sex = null;
    }
  };

  $scope.setFocusOnElement = function () {
    if ($scope.contactDetailsFrm.inpZip.$valid == false) {
      $timeout(function () {
        angular.element('#inpZip').focus();
      }, 0);
      return true;
    }
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
        angular.element('#personTypeAheadInput').focus();
      }, 0);
      $scope.focusOnResponsiblePerson = true;
      return true;
    }

    return false;
  };

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
        ReminderOK: false,
      },
    ]);
  };

  $scope.addEmail = function () {
    if ($scope.person.Profile.EmailAddress != '') {
      $scope.showSecondEmail = true;
    }
  };

  $scope.accountMembersValueTemplate = kendo.template(
    '<div id="accountMembersValueTemplate" type="text/x-kendo-template">' +
      '<span id="lblAccountMemberSelectedName" class="value-template-input k-state-default">#: Name #</span>' +
      '</div>'
  );

  $scope.accountMembersChanged = function () {
    $timeout(function () {
      if ($scope.selectedAccountMember.PatientId) {
        var patientId = $scope.selectedAccountMember.PatientId;
        $scope.patientData.Profile.AddressReferrerId = patientId;
        patientServices.Patients.get(
          { Id: patientId },
          ctrl.getPatientByIdOnSuccess,
          ctrl.getPatientByIdOnFail
        );
      } else {
        ctrl.clearAddressFields();
      }
    }, 0);
  };

  ctrl.getPatientByIdOnSuccess = function (res) {
    var responsiblePerson = res.Value;

    if (responsiblePerson.AddressReferrerId) {
      if (responsiblePerson.AddressReferrer.AddressReferrerId) {
        $scope.patientData.Profile.AddressLine1 =
          responsiblePerson.AddressReferrer.AddressReferrer.AddressLine1;
        $scope.patientData.Profile.AddressLine2 =
          responsiblePerson.AddressReferrer.AddressReferrer.AddressLine2;
        $scope.patientData.Profile.City =
          responsiblePerson.AddressReferrer.AddressReferrer.City;
        $scope.patientData.Profile.State =
          responsiblePerson.AddressReferrer.AddressReferrer.State;
        $scope.patientData.Profile.ZipCode =
          responsiblePerson.AddressReferrer.AddressReferrer.ZipCode;
      } else {
        $scope.patientData.Profile.AddressLine1 =
          responsiblePerson.AddressReferrer.AddressLine1;
        $scope.patientData.Profile.AddressLine2 =
          responsiblePerson.AddressReferrer.AddressLine2;
        $scope.patientData.Profile.City =
          responsiblePerson.AddressReferrer.City;
        $scope.patientData.Profile.State =
          responsiblePerson.AddressReferrer.State;
        $scope.patientData.Profile.ZipCode =
          responsiblePerson.AddressReferrer.ZipCode;
      }
    } else {
      $scope.patientData.Profile.AddressLine1 = responsiblePerson.AddressLine1;
      $scope.patientData.Profile.AddressLine2 = responsiblePerson.AddressLine2;
      $scope.patientData.Profile.City = responsiblePerson.City;
      $scope.patientData.Profile.State = responsiblePerson.State;
      $scope.patientData.Profile.ZipCode = responsiblePerson.ZipCode;
    }

    $scope.useAccountMemberAddress = true;
  };

  ctrl.getPatientByIdOnFail = function (error) {
    toastrFactory.error(
      localize.getLocalizedString('Failed to load patient info'),
      localize.getLocalizedString('Server Error')
    );
  };

  ctrl.getPatientPhoneByPatientIdOnFail = function (error) {
    toastrFactory.error(
      localize.getLocalizedString('Failed to load patient phone info'),
      localize.getLocalizedString('Server Error')
    );
  };

  ctrl.clearAddressFields = function () {
    $scope.patientData.Profile.AddressReferrerId = null;
    $scope.patientData.Profile.AddressLine1 =
      $scope.originalPatientInfo.AddressReferrerId == null
        ? $scope.originalPatientInfo.AddressLine1
        : null;
    $scope.patientData.Profile.AddressLine2 =
      $scope.originalPatientInfo.AddressReferrerId == null
        ? $scope.originalPatientInfo.AddressLine2
        : null;
    $scope.patientData.Profile.City =
      $scope.originalPatientInfo.AddressReferrerId == null
        ? $scope.originalPatientInfo.City
        : null;
    $scope.patientData.Profile.State =
      $scope.originalPatientInfo.AddressReferrerId == null
        ? $scope.originalPatientInfo.State
        : null;
    $scope.patientData.Profile.ZipCode =
      $scope.originalPatientInfo.AddressReferrerId == null
        ? $scope.originalPatientInfo.ZipCode
        : null;
    $scope.useAccountMemberAddress = false;
  };

  $scope.opOutAllComms = function () {
    if ($scope.optOutAllCommunications == true) {
      $scope.tempMailSettings = angular.copy(
        $scope.patientData.Profile.MailAddressRemindersOK
      );
      $scope.patientData.Profile.MailAddressRemindersOK = true;
    } else {
      $scope.patientData.Profile.MailAddressRemindersOK =
        $scope.tempMailSettings
          ? !$scope.tempMailSettings
          : $scope.tempMailSettings;
    }

    $rootScope.$broadcast('opt-out-phone', $scope.optOutAllCommunications);
    $rootScope.$broadcast('opt-out-email', $scope.optOutAllCommunications);
  };

  $scope.$rootScopeRegistrations.push(
    $rootScope.$on('toggle-opt-out-all-comms', function (event, item) {
      if (item.Type == 'Phone') $scope.phoneOptOut = item.Value;

      if (item.Type == 'Email') $scope.emailOptOut = item.Value;

      if (
        $scope.phoneOptOut &&
        $scope.emailOptOut &&
        $scope.patientData.Profile.MailAddressRemindersOK
      )
        $scope.optOutAllCommunications = true;
      else $scope.optOutAllCommunications = false;
    })
  );

  $scope.optOutMailComms = function () {
    if (
      $scope.phoneOptOut &&
      $scope.emailOptOut &&
      $scope.patientData.Profile.MailAddressRemindersOK
    )
      $scope.optOutAllCommunications = true;
    else $scope.optOutAllCommunications = false;
  };
}

ContactDetailsPanelController.prototype = Object.create(BaseCtrl.prototype);
