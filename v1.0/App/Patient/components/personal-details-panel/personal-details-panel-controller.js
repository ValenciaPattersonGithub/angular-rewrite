'use strict';

angular.module('Soar.Patient').controller('PersonalDetailsPanelController', [
  '$scope',
  '$q',
  'ListHelper',
  '$timeout',
  '$rootScope',
  'PatientServices',
  'UserServices',
  'toastrFactory',
  'StaticData',
  'SaveStates',
  'PersonServices',
  'localize',
  'PatientAppointmentsFactory',
  'PersonFactory',
  'patSecurityService',
  'GlobalSearchFactory',
  'ModalFactory',
  '$filter',
  function (
    $scope,
    $q,
    listHelper,
    $timeout,
    $rootScope,
    patientServices,
    userServices,
    toastrFactory,
    staticData,
    saveStates,
    personServices,
    localize,
    patientAppointmentsFactory,
    personFactory,
    patSecurityService,
    globalSearchFactory,
    modalFactory,
    $filter
  ) {
    var ctrl = this;

    //#region properties
    $scope.hasErrors = false;
    $scope.patientDataBackup = _.cloneDeep($scope.patientData);
    // holds the responsible person when created
    $scope.responsiblePerson = null;
    $scope.useResponsiblePersonContact = false;

    $scope.personSexOptions = ['M', 'F'];
    $scope.personSexLabels = ['Male', 'Female'];

    $scope.validResponsiblePerson = true;
    $scope.focusOnResponsiblePerson = false;
    $scope.ageCheck = true;
    $scope.disableResponsibleParty = false;

    $scope.validDob = true;
    $scope.validPhones = true;
    $scope.ageCheck = true;
    $scope.showSecondEmail = false;
    $scope.responsiblePersonEditable = true;
    $scope.editing = false;
    $scope.dataHasChanges = false;

    $scope.personalInfoRegex =
      '[^a-zA-Z0-9. !""#$%&\'()*+,-/:;<=>?@[\\]^_`{|}~d]$';
    $scope.suffixPattern = '[^a-zA-Z0-9.]';
    //#initialize controller

    // set patient.Profile.IsResponsiblePersonEditable
    ctrl.setIsResponsiblePersonEditable = function (patient) {
      var defer = $q.defer();
      var promise = defer.promise;
      // no need to query if this person does not have a responsible party setup
      if (
        patient.Profile.ResponsiblePersonType != 1 &&
        patient.Profile.ResponsiblePersonType != 2
      ) {
        patient.Profile.IsResponsiblePersonEditable = true;
        defer.resolve();
      } else {
        var params = {};
        params.patientId = patient.Profile.PatientId;
        params.accountAccountId = patient.Profile.PersonAccount.AccountId;
        params.accountMemberAccountId =
          patient.Profile.PersonAccount.PersonAccountMember.AccountId;
        params.responsiblePersonType = patient.Profile.ResponsiblePersonType;
        patientServices.Patients.isResponsiblePersonEditable(
          params
        ).$promise.then(function (res) {
          patient.Profile.IsResponsiblePersonEditable = res.Value;
          defer.resolve(res);
        });
      }
      return promise;
    };

    ctrl.availableServiceTransactionsSuccess = function (res) {
      var result = res.Value;

      if ($scope.patientData.Profile.IsResponsiblePersonEditable == false) {
        $scope.responsiblePersonEditable = false;
        if (result !== null && result.length > 0) {
          $('#respParty').prop(
            'title',
            'This patient has transaction history. Please go to the transfer page to transfer this patient to a different responsible party.'
          );
        } else {
          $('#respParty').prop(
            'title',
            'Cannot change this patient from the Responsible Party as there are other account members associated with this Account.'
          );
        }
      }

      $scope.patientData.Profile.IsResponsiblePersonEditable =
        $scope.responsiblePersonEditable;
    };

    ctrl.availableServiceTransactionsFailure = function () {
      toastrFactory.error(
        localize.getLocalizedString(
          'Could not retrieve available Service Transactions.'
        ),
        localize.getLocalizedString('Server Error')
      );
    };

    ctrl.initializeController = function () {
      $scope.stateList = staticData.States();

      $scope.maxDate = moment().startOf('day').toDate();
      if ($scope.patientData.Profile.PatientId) {
        if ($scope.patientData.Profile.PersonAccount) {
          var params = {
            personId:
              $scope.patientData.Profile.PersonAccount.PersonAccountMember
                .PersonId,
          };
          ctrl
            .setIsResponsiblePersonEditable($scope.patientData)
            .then(function () {
              patientServices.Account.getServiceTransactionsByPersonId(
                params,
                ctrl.availableServiceTransactionsSuccess,
                ctrl.availableServiceTransactionsFailure
              );
            });
        }

        $scope.editing = true;
      }
    };

    ctrl.initializeController();

    //#endregion

    //#region form Validation

    // validate age
    $scope.validateAge = function () {
      if (
        $scope.patientData.Profile.DateOfBirth &&
        $scope.patientData.Profile.DateOfBirth.length > 0 &&
        $scope.patientData.Profile.ResponsiblePersonType != null &&
        $scope.patientData.Profile.ResponsiblePersonType == '1'
      ) {
        var age = $filter('age')($scope.patientData.Profile.DateOfBirth);
        if (age < 18 && $scope.ageCheck) {
          $scope.ageCheck = false;
          var patientName = [
            $scope.patientData.Profile.FirstName,
            $scope.patientData.Profile.LastName,
          ]
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
      $scope.patientData.Profile.ResponsiblePersonId = null;
      $scope.responsiblePerson = null;
      $scope.patientData.Profile.ResponsiblePersonType = null;
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
        $scope.hasErrors = !$scope.patientData.Profile.IsValid;
        $scope.setFocusOnElement();
      }
    });

    // validate required and any attributes
    $scope.validateInfo = function (nv) {
      if (nv && $scope.frmPersonalInfo) {
        if ($scope.patientData.Profile.ResponsiblePersonType == 1) {
          $scope.validResponsiblePerson = true;
        }

        $scope.patientData.Profile.IsValid =
          $scope.frmPersonalInfo.$valid &&
          $scope.frmPersonalInfo.inpFirstName.$valid &&
          $scope.frmPersonalInfo.inpLastName.$valid &&
          $scope.validDob == true &&
          $scope.validResponsiblePerson == true;

        if (
          $scope.patientData.Profile.ResponsiblePersonType == 2 &&
          $scope.patientData.Profile.ResponsiblePersonId == null
        ) {
          $scope.patientData.Profile.IsValid = false;
        }

        if ($scope.editing) {
          $scope.hasErrors = $scope.patientData.Profile.IsValid === false;
        }
      }
    };

    // detect changes to patientData
    ctrl.setHasChanges = function () {
      $scope.hasChanges =
        $scope.patientDataBackup.Profile.FirstName !==
          $scope.patientData.Profile.FirstName ||
        $scope.patientDataBackup.Profile.LastName !==
          $scope.patientData.Profile.LastName ||
        $scope.patientDataBackup.Profile.MiddleName !==
          $scope.patientData.Profile.MiddleName ||
        $scope.patientDataBackup.Profile.Suffix !==
          $scope.patientData.Profile.Suffix ||
        $scope.patientDataBackup.Profile.PreferredName !==
          $scope.patientData.Profile.PreferredName ||
        $scope.patientDataBackup.Profile.Sex !==
          $scope.patientData.Profile.Sex ||
        $scope.patientDataBackup.Profile.IsPatient !==
          $scope.patientData.Profile.IsPatient ||
        $scope.patientDataBackup.Profile.IsActive !==
          $scope.patientData.Profile.IsActive ||
        $scope.patientDataBackup.Profile.IsSignatureOnFile !==
          $scope.patientData.Profile.IsSignatureOnFile ||
        $scope.patientDataBackup.Profile.ResponsiblePersonType !==
          $scope.patientData.Profile.ResponsiblePersonType;

      if ($scope.hasChanges === false) {
        $scope.hasChanges =
          new Date(
            $scope.patientDataBackup.Profile.DateOfBirth
          ).getUTCFullYear() !==
            new Date($scope.patientData.Profile.DateOfBirth).getUTCFullYear() ||
          new Date(
            $scope.patientDataBackup.Profile.DateOfBirth
          ).getUTCMonth() !==
            new Date($scope.patientData.Profile.DateOfBirth).getUTCMonth() ||
          new Date(
            $scope.patientDataBackup.Profile.DateOfBirth
          ).getUTCDate() !==
            new Date($scope.patientData.Profile.DateOfBirth).getUTCDate();
      }
    };

    // Watch the data, if any changes validate and enable/disable save
    $scope.$watch(
      'patientData',
      function (nv) {
        $timeout(function () {
          $scope.validateInfo(nv);
          ctrl.setHasChanges();
          $scope.$apply();
        }, 0);
      },
      true
    );

    $scope.$watch('validDob', function (nv) {
      $scope.validateInfo($scope.patientData);
      ctrl.setHasChanges();
    });

    //#endregion

    // Handle unchecking Sex, reset to null
    $scope.uncheckedSex = function (event) {
      if ($scope.patientData.Profile.Sex == event.target.value) {
        $scope.patientData.Profile.Sex = null;
      }
    };

    //#region contact info from responsible person
    $scope.copyContactInfo = function () {
      if ($scope.useResponsiblePersonContact) {
        if (
          $scope.patientData.Profile.ResponsiblePersonId != null &&
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

          $scope.patientData.Profile.EmailAddress =
            responsiblePerson.EmailAddress;
          $scope.patientData.Profile.EmailAddressRemindersOk =
            responsiblePerson.EmailAddressRemindersOk;
          $scope.patientData.Profile.EmailAddress2 =
            responsiblePerson.EmailAddress2;
          $scope.patientData.Profile.EmailAddress2RemindersOk =
            responsiblePerson.EmailAddress2RemindersOk;
          if (
            responsiblePerson.EmailAddress2 &&
            responsiblePerson.EmailAddress2.length > 0
          ) {
            $scope.showSecondEmail = true;
          }

          $scope.patientData.Profile.MailAddressRemindersOK =
            responsiblePerson.MailAddressRemindersOK;
          $scope.patientData.Profile.AddressLine1 =
            responsiblePerson.AddressLine1;
          $scope.patientData.Profile.AddressLine2 =
            responsiblePerson.AddressLine2;
          $scope.patientData.Profile.City = responsiblePerson.City;
          $scope.patientData.Profile.State = responsiblePerson.State;
          $scope.patientData.Profile.ZipCode = responsiblePerson.ZipCode;
        }
      }
    };

    // clear responsible person fields if responsible person changes and useResponsiblePersonContact=true
    $scope.clearResponsibleContactInfo = function () {
      $scope.resetPhones();
      $scope.patientData.Profile.EmailAddress = null;
      $scope.patientData.Profile.EmailAddress2 = null;
      $scope.patientData.Profile.AddressLine1 = null;
      $scope.patientData.Profile.AddressLine2 = null;
      $scope.patientData.Profile.City = null;
      $scope.patientData.Profile.State = null;
      $scope.patientData.Profile.ZipCode = null;
    };

    // triggered when responsible person changes
    $scope.$watch('responsiblePerson', function (nv) {
      if ($scope.useResponsiblePersonContact) {
        $scope.clearResponsibleContactInfo();
        $scope.accountMembers = null;
      }
      $scope.useResponsiblePersonContact = false;
      $scope.patientData.responsiblePerson = nv;
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
          angular.element('#personTypeAheadInput').focus();
        }, 0);
        $scope.focusOnResponsiblePerson = true;
        return true;
      }
      return false;
    };

    //#endregion

    //#region handle changes
    $scope.hasDataChanged = function () {
      if ($scope.editing) {
        $scope.dataHasChanges = true;
        $scope.$emit('personal-info-changed', $scope.dataHasChanges);
      } else {
        $scope.dataHasChanges = false;
        $scope.$emit('personal-info-changed', $scope.dataHasChanges);
        $scope.$broadcast('resetRpValues');
      }
    };

    $scope.getPatientStatusDisplay = function () {
      if ($scope.patientData.Profile.IsActive === true) {
        $scope.patientData.Profile.$$DisplayStatus =
          $scope.patientData.Profile.IsPatient === true
            ? localize.getLocalizedString('Active Patient')
            : localize.getLocalizedString('Active Person');
      } else {
        $scope.patientData.Profile.$$DisplayStatus =
          $scope.patientData.Profile.IsPatient === true
            ? localize.getLocalizedString('Inactive Patient')
            : localize.getLocalizedString('Inactive Person');
      }
    };

    //$scope.getPatientStatusDisplay();
    // handle person activation, inactivation
    ctrl.setPatientActiveStatus = function (isActive, unscheduleOnly) {
      $scope.patientData.IsActive = isActive;
      $scope.patientData.unscheduleOnly = unscheduleOnly;
      $scope.patientData.updatePatientActive = true;
    };

    // handle future appointments based on modal response
    ctrl.handleAppts = function (unscheduleAppts) {
      if (unscheduleAppts) {
        // handle future appointments by unscheduling them
        ctrl.setPatientActiveStatus(false, true);
      } else {
        // handle future appointments by deleting them
        ctrl.setPatientActiveStatus(false, false);
      }
    };

    // user cancels inactivation
    ctrl.cancelInActivation = function () {
      $scope.patientData.Profile.IsActive = true;
    };

    //  allow user to cancel Active change, delete appts, or unschedule appts
    ctrl.confirmAppointmentActions = function () {
      var patientName = $filter('getPatientNameAsPerBestPractice')(
        $scope.patientData.Profile
      );
      var message = localize.getLocalizedString(
        '{0} has current and/or future scheduled appointments.',
        [patientName]
      );
      var message2 = localize.getLocalizedString(
        'To continue, please select one of the following actions:'
      );
      var title = localize.getLocalizedString('Inactivate Patient');
      var button1Text = localize.getLocalizedString('Do Not Inactivate');
      var button2Text = localize.getLocalizedString('Unschedule Appts');
      var button3Text = localize.getLocalizedString('Delete Appts');
      modalFactory
        .DecisionModal(
          title,
          message,
          message2,
          button1Text,
          button2Text,
          button3Text,
          ''
        )
        .then(ctrl.handleAppts, ctrl.cancelInActivation);
    };

    $scope.activeStatusChange = function () {
      if ($scope.patientData.Profile.IsActive === false) {
        patientAppointmentsFactory
          .ScheduledAppointmentCount($scope.patientData.Profile.PatientId)
          .then(function (res) {
            var numberOfScheduledAppointments = res.Value;
            if (numberOfScheduledAppointments > 0) {
              ctrl.confirmAppointmentActions();
            } else {
              ctrl.setPatientActiveStatus(false, false);
            }
          });
      } else {
        // if no scheduled don't open modal, just inactivate
        ctrl.setPatientActiveStatus(true, false);
      }
    };

    // this builds either the update isActive or the warning modal
    ctrl.buildStatusChangeModal = function () {
      var title = localize.getLocalizedString('Patient Status Change');
      var name = $filter('getPatientNameAsPerBestPractice')(
        $scope.patientData.Profile
      );
      var upperMessage =
        name +
        ' ' +
        localize.getLocalizedString(
          'has scheduled or unscheduled appointments or has received treatment and cannot be marked as a non-patient, would you like to inactivate this patient instead?'
        );
      var button1Text = localize.getLocalizedString('Yes');
      var button2Text = localize.getLocalizedString('No');
      // if patient isActive and user has permission to update the isActive status, prompt them with the option of changing the status or doing nothing
      if (
        $scope.patientData.Profile.IsActive === true &&
        patSecurityService.IsAuthorizedByAbbreviation('soar-per-perdem-inactv')
      ) {
        modalFactory
          .ConfirmModal(title, upperMessage, button1Text, button2Text)
          .then(
            function () {
              $scope.patientData.Profile.IsActive = false;
              $scope.activeStatusChange();
              $scope.patientData.Profile.IsPatient = true;
            },
            function () {
              $scope.patientData.Profile.IsPatient = true;
            }
          );
      } else {
        // either the status is already inactive or the user doesn't have permission to change it, just give them the message so they know why isPatient can't be changed
        upperMessage =
          name +
          ' ' +
          localize.getLocalizedString(
            'has scheduled or unscheduled appointments or has received treatment and cannot be marked as a non-patient.'
          );
        button1Text = localize.getLocalizedString('OK');
        modalFactory
          .ConfirmModal(title, upperMessage, button1Text)
          .then(function () {
            $scope.patientData.Profile.IsPatient = true;
          });
      }
    };

    // if patient status is changed to non-patient, check if they have appts or pending charges
    // if so, only allow them to change patient to inactive
    $scope.isPatientBooleanChanged = function () {
      if ($scope.patientData.Profile.IsPatient === false) {
        // checking if patient has appts or pending charges, if property is mutable they do not
        personServices.Persons.getIsPatientPropertyMutability(
          { Id: $scope.patientData.Profile.PatientId },
          function (res) {
            if (res && res.Value === false) {
              ctrl.buildStatusChangeModal();
            }
          },
          function () {
            toastrFactory.error(
              localize.getLocalizedString(
                "Failed to determine if patient's status can be updated. Refresh the page to try again."
              ),
              localize.getLocalizedString('Server Error')
            );
            $scope.patientData.Profile.IsPatient = true;
          }
        );
      }
    };
  },
]);
