'use strict';
angular
  .module('Soar.Patient')
  .controller('PatientPersonalInfoController', [
    '$scope',
    '$routeParams',
    'toastrFactory',
    'BoundObjectFactory',
    'PatientServices',
    'PersonServices',
    '$rootScope',
    'SaveStates',
    'localize',
    'ListHelper',
    'ModalFactory',
    'PatientAppointmentsFactory',
    '$filter',
    'PersonFactory',
    'patSecurityService',
    'GlobalSearchFactory',
    '$timeout',
    PatientPersonalInfoController,
  ]);
function PatientPersonalInfoController(
  $scope,
  $routeParams,
  toastrFactory,
  boundObjectFactory,
  patientServices,
  personServices,
  $rootScope,
  saveStates,
  localize,
  listHelper,
  modalFactory,
  patientAppointmentsFactory,
  $filter,
  personFactory,
  patSecurityService,
  globalSearchFactory,
  $timeout
) {
  BaseCtrl.call(this, $scope, 'PatientPersonalInfoController');

  var ctrl = this;
  if ($scope.patientData) {
    document.title =
      $scope.patientData.PatientCode +
      ' - ' +
      localize.getLocalizedString('Profile');
  }

  $scope.inactivatingPatient = false;

  $scope.dataHasChanges = false;

  $scope.responsiblePerson = null;

  $scope.attemptedSave = false;

  $scope.patientProfileSexOptions = ['M', 'F'];

  $scope.patientProfileSexLabels = ['Male', 'Female'];

  $scope.validResponsiblePerson = true;

  $scope.disableResponsibleParty = false;

  $scope.patient = boundObjectFactory.Create(patientServices.Patient);

  $scope.validPhones = true;

  $scope.valid = true;
  // This variable is used to identify if data is being fetched from the server. Till that time user won't see html for personal information panel on the screen.
  $scope.loading = false;

  $scope.maxDate = moment().startOf('day').toDate();
  $scope.personalInfoRegex =
    '[^a-zA-Z0-9. !""#$%&\'()*+,-/:;<=>?@[\\]^_`{|}~d]$';

  if ($scope.patientData) {
    if ($scope.patientData.AddressReferrerId) {
      $timeout(function () {
        personServices.Persons.get(
          { Id: $scope.patientData.AddressReferrerId },
          ctrl.getPatientByIdOnSuccess,
          ctrl.getPatientByIdOnFail
        );
      }, 0);
    } else {
      $scope.patientAddressReference = $scope.patientData;
    }
  }

  //#region get person

  ctrl.PersonServicesGetSuccess = function (res) {
    if (res.Value) {
      $scope.personalInfo = res.Value;

      if ($scope.patientData.AddressReferrerId) {
        ctrl.assignLinkedPatientAddress();
      }

      // need this for $scope.data.saveData/$scope.data.originalData cancel comparison function in panel directive
      ctrl.addColumnsToPhones = function (personPhones) {
        angular.forEach(personPhones, function (phone) {
          phone.invalidPhoneNumber = false;
          phone.invalidType = false;
        });
      };
      $scope.getPatientStatusDisplay();
      ctrl.addColumnsToPhones($scope.personalInfo.Phones);
      $scope.original = angular.copy($scope.personalInfo);
      $scope.dataHasChanges = false;
    }
    $scope.loading = false;
    $rootScope.$broadcast('patsoar:setreasponsiblepersonfocus');
  };

  ctrl.PersonServicesGetFailure = function () {
    $scope.loading = false;
    toastrFactory.error(
      localize.getLocalizedString(
        'Failed to retrieve the {0}. Refresh the page to try again.',
        ['person']
      ),
      localize.getLocalizedString('Server Error')
    );
  };

  $scope.getPerson = function () {
    $scope.loading = true;
    personServices.Persons.get(
      { Id: $scope.patientData.PatientId },
      ctrl.PersonServicesGetSuccess,
      ctrl.PersonServicesGetFailure
    );
  };

  ctrl.getPatientByIdOnSuccess = function (res) {
    $scope.patientAddressReference = res.Value.Profile;
    ctrl.assignLinkedPatientAddress();
  };

  ctrl.getPatientByIdOnFail = function (error) {
    toastrFactory.error(
      localize.getLocalizedString('Failed to load patient info'),
      localize.getLocalizedString('Server Error')
    );
  };

  ctrl.assignLinkedPatientAddress = function () {
    if ($scope.patientAddressReference.AddressReferrerId) {
      if ($scope.patientAddressReference.AddressReferrer.AddressReferrerId) {
        $scope.personalInfo.Profile.AddressLine1 =
          $scope.patientAddressReference.AddressReferrer.AddressReferrer.AddressLine1;
        $scope.personalInfo.Profile.AddressLine2 =
          $scope.patientAddressReference.AddressReferrer.AddressReferrer.AddressLine2;
        $scope.personalInfo.Profile.City =
          $scope.patientAddressReference.AddressReferrer.AddressReferrer.City;
        $scope.personalInfo.Profile.State =
          $scope.patientAddressReference.AddressReferrer.AddressReferrer.State;
        $scope.personalInfo.Profile.ZipCode =
          $scope.patientAddressReference.AddressReferrer.AddressReferrer.ZipCode;
      } else {
        $scope.personalInfo.Profile.AddressLine1 =
          $scope.patientAddressReference.AddressReferrer.AddressLine1;
        $scope.personalInfo.Profile.AddressLine2 =
          $scope.patientAddressReference.AddressReferrer.AddressLine2;
        $scope.personalInfo.Profile.City =
          $scope.patientAddressReference.AddressReferrer.City;
        $scope.personalInfo.Profile.State =
          $scope.patientAddressReference.AddressReferrer.State;
        $scope.personalInfo.Profile.ZipCode =
          $scope.patientAddressReference.AddressReferrer.ZipCode;
      }
    } else {
      $scope.personalInfo.Profile.AddressLine1 =
        $scope.patientAddressReference.AddressLine1;
      $scope.personalInfo.Profile.AddressLine2 =
        $scope.patientAddressReference.AddressLine2;
      $scope.personalInfo.Profile.City = $scope.patientAddressReference.City;
      $scope.personalInfo.Profile.State = $scope.patientAddressReference.State;
      $scope.personalInfo.Profile.ZipCode =
        $scope.patientAddressReference.ZipCode;
    }
  };

  ctrl.getAllPatients = function () {
    if (
      $scope.personalInfo &&
      $scope.personalInfo.Profile &&
      $scope.personalInfo.Profile.PersonAccount
    ) {
      $timeout(function () {
        patientServices.Account.getAllAccountMembersByAccountId(
          {
            accountId: $scope.personalInfo.Profile.PersonAccount.AccountId,
          },
          ctrl.getAllPatientOnSuccess,
          ctrl.getAllPatientOnFail
        );
      }, 0);
    }
  };

  ctrl.getAllPatientOnSuccess = function (res) {
    $scope.allPatients = res.Value;
  };

  ctrl.getAllPatientOnFail = function (error) {
    toastrFactory.error(
      localize.getLocalizedString('Failed to load patient info'),
      localize.getLocalizedString('Server Error')
    );
  };

  ctrl.getAllPatients();

  //#endregion

  //#region copy person to patient

  // NOTE After a save, copy the personal info object and phones back to the patient object
  // to sync display on header, overview

  ctrl.copyPersonToPatient = function (personalInfo, patient) {
    patient = patient ? patient : {};

    if (personalInfo.Profile) {
      patient.DataTag = personalInfo.Profile.DataTag;
      patient.PatientId = personalInfo.Profile.PatientId;
      patient.FirstName = ctrl.validValue(personalInfo.Profile.FirstName);
      patient.LastName = ctrl.validValue(personalInfo.Profile.LastName);
      patient.MiddleName = ctrl.validValue(personalInfo.Profile.MiddleName);
      patient.Suffix = ctrl.validValue(personalInfo.Profile.Suffix);
      patient.PreferredName = ctrl.validValue(
        personalInfo.Profile.PreferredName
      );
      patient.Sex = ctrl.validValue(personalInfo.Profile.Sex);
      patient.DateOfBirth = ctrl.validValue(personalInfo.Profile.DateOfBirth);
      patient.IsPatient = ctrl.validValue(personalInfo.Profile.IsPatient);
      patient.ResponsiblePersonId = ctrl.validValue(
        personalInfo.Profile.ResponsiblePersonId
      );
      patient.ResponsiblePersonType = ctrl.validValue(
        personalInfo.Profile.ResponsiblePersonType
      );
      patient.IsActive = ctrl.validValue(personalInfo.Profile.IsActive);
      patient.EmailAddress = personalInfo.Profile.EmailAddress;
      patient.EmailAddress2 = personalInfo.Profile.EmailAddress2;
      patient.AddressLine1 = personalInfo.Profile.AddressLine1;
      patient.AddressLine2 = personalInfo.Profile.AddressLine2;
      patient.City = personalInfo.Profile.City;
      patient.State = personalInfo.Profile.State;
      patient.ZipCode = personalInfo.Profile.ZipCode;
      patient.ResponsiblePersonId = personalInfo.Profile.ResponsiblePersonId;
      patient.ResponsiblePersonType =
        personalInfo.Profile.ResponsiblePersonType;
      patient.AddressReferrerId = personalInfo.Profile.AddressReferrerId;

      if (
        personalInfo.Profile.PersonAccount != null &&
        personalInfo.Profile.PersonAccount.PersonAccountMember != null
      ) {
        if (
          personalInfo.Profile.PersonAccount.PersonAccountMember
            .ResponsiblePersonId == personalInfo.Profile.PatientId
        ) {
          patient.ResponsiblePersonId = personalInfo.Profile.PatientId;
          patient.ResponsiblePersonType = '1';
        } else {
          patient.ResponsiblePersonId =
            personalInfo.Profile.PersonAccount.PersonAccountMember.ResponsiblePersonId;
          patient.ResponsiblePersonType = '2';
        }
      }

      patient.Phones = angular.copy(personalInfo.Phones);
      patient.Emails = angular.copy(personalInfo.Emails);
    }
  };

  //#endregion

  //#region utility functions
  // Decide whether to set default focus on first name field or responsible party field
  ctrl.checkForDefaultFocus = function () {
    $scope.defaultFocusOnRespParty =
      $routeParams.panel === 'PI_RP' ||
      $scope.patientData.defaultExpandedPanel === 'PI_RP'
        ? true
        : false;
    //console.log($routeParams.panel === 'PI_RP')
    if ($scope.defaultFocusOnRespParty) {
      $scope.defaultFocusOnFirstName = false;
      $scope.defaultFocusOnRespParty = true;
      $scope.defaultExpandedPanel = 'PI_RP';
    } else {
      $scope.defaultFocusOnFirstName = true;
      $scope.defaultFocusOnRespParty = false;
    }
  };
  ctrl.checkForDefaultFocus();

  // Keep a watch whether to set focus on first name or responsible party control
  $scope.$watch('patientData.defaultExpandedPanel', function (nv, ov) {
    if (nv != ov && nv) {
      $scope.defaultFocusOnFirstName = false;
      $scope.defaultFocusOnRespParty = true;
    }
  });

  // Uncheck sex radio button (?)
  $scope.uncheckedSex = function (event) {
    if ($scope.personalInfo.Profile.Sex == event.target.value) {
      $scope.personalInfo.Profile.Sex = null;
    }
  };

  ctrl.editingInitialized = false;
  // When editing is changed, reset the person object to backup
  $scope.$watch('editing', function (nv, ov) {
    if (nv && (!ctrl.editingInitialized || nv != ov) && nv == true) {
      ctrl.editingInitialized = true;
      $scope.getPerson();
      $scope.valid = true;
      $scope.$broadcast('resetRpValues');
    }
  });

  // keeping DataTag updated when its changed by another panel
  $scope.$watch('$parent.$parent.additionalData', function (nv, ov) {
    if (
      nv &&
      !angular.equals(nv, ov) &&
      $scope.personalInfo.Profile.DataTag !== nv.DataTag
    ) {
      $scope.personalInfo.Profile.DataTag = nv.DataTag;
    }
  });

  ctrl.validValue = function (value) {
    return angular.isDefined(value) ? value : null;
  };

  //#endregion

  //#region save personal info and phones

  $scope.saveFunction = function () {
    //remove - from zipCode
    if (
      $scope.personalInfo.Profile.ZipCode &&
      $scope.personalInfo.Profile.ZipCode.indexOf('-') > 0
    ) {
      $scope.personalInfo.Profile.ZipCode =
        $scope.personalInfo.Profile.ZipCode.replace(/-/g, '');
    }
    ctrl.checkPhones();
    $scope.attemptedSave = true;
    $scope.validate();
    if ($scope.valid && $scope.dataHasChanges) {
      personServices.Persons.update(
        $scope.personalInfo,
        ctrl.savePersonalInfoSuccess,
        $scope.savePersonalInfoFailure
      );
      $scope.valid = false;
    }
  };

  ctrl.savePersonalInfoSuccess = function (res) {
    if (res.Value) {
      var originalPhones = angular.copy($scope.personalInfo.Phones);
      $scope.personalInfo = res.Value;
      // $scope.backupData($scope.person);
      $scope.personalInfo.Updated = true;
      // sync phone data
      $scope.syncPhonesAfterSave(originalPhones);

      // reset original
      $scope.original = angular.copy($scope.personalInfo);

      // copy the new person data to patient to sync
      ctrl.copyPersonToPatient($scope.personalInfo, $scope.patientData);
      $scope.patientData.Updated = true;
      $scope.attemptedSave = false;
      $scope.dataHasChanges = false;
      $scope.getPatientStatusDisplay();
      $scope.$emit('personal-info-changed', $scope.dataHasChanges);
    }
    $scope.editing = false;

    // Broadcast notification that responsible person has been assigned to a patient and provide updated data received from server
    if (
      $scope.personalInfo.Profile.ResponsiblePersonId &&
      $scope.personalInfo.Profile.ResponsiblePersonType &&
      $scope.personalInfo.Profile.ResponsiblePersonType != 0
    )
      $rootScope.$broadcast(
        'soar:responsible-person-assigned',
        $scope.personalInfo.Profile
      );

    toastrFactory.success(
      localize.getLocalizedString('Update {0}.', ['successful']),
      localize.getLocalizedString('Success')
    );
  };

  $scope.savePersonalInfoFailure = function (error) {
    $scope.editing = true;
    $scope.attemptedSave = false;
    toastrFactory.error(
      localize.getLocalizedString(
        'Update was unsuccessful. Please retry your save.'
      ),
      localize.getLocalizedString('Server Error')
    );
  };

  //#endregion

  //#region ResponsiblePerson

  // when the ResponsiblePersonId changes set the PersonAccount
  $scope.$watch(
    'personalInfo.Profile.ResponsiblePersonId',
    function (nv, ov) {
      $scope.defaultFocusOnRespParty =
        $routeParams.panel === 'PI_RP' ||
        $scope.patientData.defaultExpandedPanel === 'PI_RP'
          ? true
          : false;
      if (nv && nv != ov) {
        $scope.personalInfo.Profile.PersonAccount.PersonAccountMember.ResponsiblePersonId =
          $scope.personalInfo.Profile.ResponsiblePersonId;
        $scope.personalInfo.Profile.PersonAccount.PersonAccountMember.ResponsiblePersonType =
          $scope.personalInfo.Profile.ResponsiblePersonType;
      }
    },
    true
  );

  //#endregion

  //#region validatation

  $scope.validate = function () {
    if ($scope.personalInfo.Profile.ResponsiblePersonType !== '1') {
      $scope.validResponsiblePerson = $scope.personalInfo.Profile
        .ResponsiblePersonId
        ? true
        : false;
    }

    $scope.hasErrors = !(
      $scope.frmPatientPersonalInfo.$valid &&
      $scope.frmPatientPersonalInfo.inpFirstName.$valid &&
      $scope.frmPatientPersonalInfo.inpLastName.$valid &&
      $scope.frmPatientPersonalInfo.inpPatientEmailOneAddress.$valid &&
      $scope.frmPatientPersonalInfo.inpPatientEmailTwoAddress.$valid &&
      $scope.frmPatientPersonalInfo.inpZipCode.$valid &&
      $scope.validPhones &&
      $scope.validResponsiblePerson
    );
    $scope.valid = !$scope.hasErrors || $scope.inactivatingPatient;
    //console.log($scope.hasErrors)
  };

  // Validate when change
  $scope.$watch(
    'personalInfo.Profile',
    function (nv, ov) {
      $scope.hasDataChanged();
      if ($scope.attemptedSave && nv) {
        $scope.validate();
      }
    },
    true
  );

  //#endregion

  //#region phones

  $scope.syncPhonesAfterSave = function (originalPhones) {
    var phoneCopy = angular.copy($scope.personalInfo.Phones);
    angular.forEach(phoneCopy, function (phone) {
      if (phone.ObjectState === saveStates.Successful) {
        var originalPhone = listHelper.findItemByFieldValue(
          originalPhones,
          'ContactId',
          phone.ContactId
        );
        if (originalPhone && originalPhone.ObjectState == saveStates.Delete) {
          var indexToRemove = listHelper.findIndexByFieldValue(
            $scope.personalInfo.Phones,
            'ContactId',
            phone.ContactId
          );
          $scope.personalInfo.Phones.splice(indexToRemove, 1);
        } else {
          phone.ObjectState = saveStates.None;
        }
      } else if (phone.ObjectState === saveStates.Failed) {
        // Remove the failed phone update
        var index = listHelper.findIndexByFieldValue(
          $scope.personalInfo.Phones,
          'ContactId',
          phone.ContactId
        );
        $scope.personalInfo.Phones.splice(index, 1);
        //Message user...
        toastrFactory.error(
          localize.getLocalizedString('One or more contacts did not save.'),
          localize.getLocalizedString('Server Error')
        );
      }
    });
  };

  //#endregion

  //#region handle changes
  $scope.hasDataChanged = function () {
    if ($scope.editing) {
      $scope.dataHasChanges = !angular.equals(
        $scope.original,
        $scope.personalInfo
      );
      $scope.$emit('personal-info-changed', $scope.dataHasChanges);
    } else {
      $scope.dataHasChanges = false;
      $scope.$emit('personal-info-changed', $scope.dataHasChanges);
      $scope.$broadcast('resetRpValues');
    }
  };

  // remove phones that aren't valid
  ctrl.checkPhones = function () {
    var resetPrimary = false;
    angular.forEach($scope.personalInfo.Phones, function (phone) {
      if (phone.PhoneNumber.length == 0) {
        $scope.$broadcast('soar:phone-remove', phone);
      }
    });
  };

  //#region Active status change

  //  allow user to cancel Active change, delete appts, or unschedule appts
  ctrl.confirmAppointmentActions = function () {
    var patientName = $filter('getPatientNameAsPerBestPractice')(
      $scope.personalInfo.Profile
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

  // handle person activation, inactivation
  ctrl.setPatientActiveStatus = function (isActive, unscheduleOnly) {
    // disable save button
    $scope.inactivatingPatient = true;
    $scope.valid = false;
    personFactory
      .SetPersonActiveStatus(
        $scope.patientData.PatientId,
        isActive,
        unscheduleOnly
      )
      .then(function (res) {
        if (res) {
          var newDataTag = res.Value;
          // set isActive on original
          $scope.original.Profile.IsActive = isActive;
          // copy to patient to sync
          $scope.patientData.IsActive = isActive;
          // reset dataTags to latest
          $scope.original.Profile.DataTag = newDataTag;
          $scope.personalInfo.Profile.DataTag = newDataTag;
          // copy to patient to sync
          $scope.patientData.DataTag = newDataTag;
          // reset dataHasChanged
          $scope.hasDataChanged();
          // changes the status text in collapsed mode
          $scope.getPatientStatusDisplay();
          // resetting most recents
          globalSearchFactory.ClearRecentPersons();
          $rootScope.$broadcast('soar:refresh-most-recent');
          // enable save button and check for changes
          $scope.inactivatingPatient = false;
          $scope.validate();
        }
      });
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
    $scope.personalInfo.Profile.IsActive = true;
  };

  // on active status change
  $scope.activeStatusChange = function () {
    if ($scope.personalInfo.Profile.IsActive === false) {
      patientAppointmentsFactory
        .ScheduledAppointmentCount($scope.personalInfo.Profile.PatientId)
        .then(function (res) {
          var numberOfScheduledAppointments = res.Value;
          console.log(res.Value);
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

  $scope.getPatientStatusDisplay = function () {
    if ($scope.personalInfo.Profile.IsActive === true) {
      $scope.personalInfo.Profile.$$DisplayStatus =
        $scope.personalInfo.Profile.IsPatient === true
          ? localize.getLocalizedString('Active Patient')
          : localize.getLocalizedString('Active Person');
    } else {
      $scope.personalInfo.Profile.$$DisplayStatus =
        $scope.personalInfo.Profile.IsPatient === true
          ? localize.getLocalizedString('Inactive Patient')
          : localize.getLocalizedString('Inactive Person');
    }
  };
  $scope.getPatientStatusDisplay();

  //#region patient/non-patient change handling

  // this builds either the update isActive or the warning modal
  ctrl.buildStatusChangeModal = function () {
    var title = localize.getLocalizedString('Patient Status Change');
    var name = $filter('getPatientNameAsPerBestPractice')(
      $scope.personalInfo.Profile
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
      $scope.personalInfo.Profile.IsActive === true &&
      patSecurityService.IsAuthorizedByAbbreviation('soar-per-perdem-inactv')
    ) {
      modalFactory
        .ConfirmModal(title, upperMessage, button1Text, button2Text)
        .then(
          function () {
            $scope.personalInfo.Profile.IsActive = false;
            $scope.activeStatusChange();
            $scope.personalInfo.Profile.IsPatient = true;
          },
          function () {
            $scope.personalInfo.Profile.IsPatient = true;
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
          $scope.personalInfo.Profile.IsPatient = true;
        });
    }
  };

  // if patient status is changed to non-patient, check if they have appts or pending charges
  // if so, only allow them to change patient to inactive
  $scope.isPatientBooleanChanged = function () {
    if ($scope.personalInfo.Profile.IsPatient === false) {
      // checking if patient has appts or pending charges, if property is mutable they do not
      personServices.Persons.getIsPatientPropertyMutability(
        { Id: $scope.patientData.PatientId },
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
          $scope.personalInfo.Profile.IsPatient = true;
        }
      );
    }
  };

  //#endregion

  $scope.typeInitial = function (type) {
    if (type == 'Mobile') return 'M';
    else if (type == 'Home') return 'H';
    else if (type == 'Work') return 'W';
  };

  $scope.patientEmailReference = function (email) {
    if (email) {
      var patientEmailReference = listHelper.findItemByFieldValue(
        $scope.allPatients,
        'PatientId',
        email.AccountEMail.PatientId
      );
      return patientEmailReference;
    } else {
      return null;
    }
  };

  $scope.patientPhoneReference = function (phone) {
    if (phone) {
      var patientPhoneReference = listHelper.findItemByFieldValue(
        $scope.allPatients,
        'PatientId',
        phone.PhoneReferrer.PatientId
      );
      return patientPhoneReference;
    } else {
      return null;
    }
  };

  $scope.showTextIcon = function (phone) {
    if (phone.PhoneReferrer == null) {
      if (phone.Type == 'Mobile') {
        return phone.TextOk;
      } else {
        return false;
      }
    } else {
      return phone.TextOk;
    }
  };

  $scope.showReminder = function (phone) {
    if (phone.Type != 'Mobile') {
      return phone.ReminderOK;
    } else {
      return phone.ReminderOK || phone.TextOk;
    }
  };

  $scope.findStatus = function (status) {
    if (status === 'Inactive Patient' || status === 'Inactive Person') {
      return true;
    } else {
      return false;
    }
  };
}

PatientPersonalInfoController.prototype = Object.create(BaseCtrl.prototype);
