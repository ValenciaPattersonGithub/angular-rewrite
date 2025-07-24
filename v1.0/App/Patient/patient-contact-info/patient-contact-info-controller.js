'use strict';

angular
  .module('Soar.Patient')
  .controller('PatientContactInfoController', [
    '$scope',
    '$routeParams',
    'toastrFactory',
    'StaticData',
    'localize',
    'PatientServices',
    'SaveStates',
    'ListHelper',
    '$timeout',
    PatientContactInfoController,
  ]);
function PatientContactInfoController(
  $scope,
  $routeParams,
  toastrFactory,
  staticData,
  localize,
  patientServices,
  saveStates,
  listHelper,
  $timeout
) {
  BaseCtrl.call(this, $scope, 'PatientContactInfoController');
  var ctrl = this;

  ctrl.copyContactInfoFromPatient = function (patient) {
    var data = $scope.contactInfo ? $scope.contactInfo : {};

    if (patient) {
      data.EmailAddress = patient.EmailAddress;
      data.EmailAddress2 = patient.EmailAddress2;
      data.AddressLine1 = patient.AddressLine1;
      data.AddressLine2 = patient.AddressLine2;
      data.City = patient.City;
      data.State = patient.State;
      data.ZipCode = patient.ZipCode;
      data.Phones = patient.Phones;
      data.Emails = patient.Emails;
      data.AddressReferrerId = patient.AddressReferrerId;
      if (
        patient.PersonAccount != null &&
        patient.PersonAccount.PersonAccountMember != null
      ) {
        if (
          patient.PersonAccount.PersonAccountMember.ResponsiblePersonId ==
          patient.PatientId
        ) {
          data.ResponsiblePersonId = patient.PatientId;
          data.ResponsiblePersonType = '1';
        } else {
          data.ResponsiblePersonId =
            patient.PersonAccount.PersonAccountMember.ResponsiblePersonId;
          data.ResponsiblePersonType = '2';
        }
      }
    }

    $scope.contactInfo = data;
    $scope.originalContactInfo = angular.copy($scope.contactInfo);
  };

  ctrl.getAllPatients = function () {
    if ($scope.patient.PersonAccount) {
      $timeout(function () {
        patientServices.Account.getAllAccountMembersByAccountId(
          {
            accountId: $scope.patient.PersonAccount.AccountId,
          },
          ctrl.getAllAccountMembersSuccess,
          ctrl.getAllAccountMembersFailure
        );
      }, 0);
    }
  };

  ctrl.getAllAccountMembersSuccess = function (res) {
    $scope.allPatients = res.Value;
  };

  ctrl.getAllAccountMembersFailure = function (error) {
    toastrFactory.error(
      localize.getLocalizedString('Failed to load patient info'),
      localize.getLocalizedString('Server Error')
    );
  };

  ctrl.getAllPatients();

  // phone info directive with emit 'phones-changed' every time the phones array is updated
  // not sure why i need to do this but $scope.contactInfo.Phones will not update otherwise
  $scope.$on('phones-changed', function (event) {
    $scope.contactInfo.Phones = $scope.phones;
    //console.log('$scope.phones: ' + $scope.phones[0].PhoneNumber);
    // console.log('$scope.contactInfo.Phones: ' +$scope.contactInfo.Phones[0].PhoneNumber);
  });

  //ctrl.copyContactInfoToPatient = function (contactInfo, patient)
  //{
  //    patient = patient ? patient : {};

  //    if (contactInfo)
  //    {
  //        patient.EmailAddress = contactInfo.EmailAddress;
  //        patient.EmailAddress2 = contactInfo.EmailAddress2;
  //        patient.AddressLine1 = contactInfo.AddressLine1;
  //        patient.AddressLine2 = contactInfo.AddressLine2;
  //        patient.City = contactInfo.City;
  //        patient.State = contactInfo.State;
  //        patient.ZipCode = contactInfo.ZipCode;
  //        patient.ResponsiblePersonId = contactInfo.ResponsiblePersonId;
  //        patient.ResponsiblePersonType = contactInfo.ResponsiblePersonType;
  //    }
  //};

  // If we were not passed the patient, retrieve it.
  if (!$scope.patient) {
    $scope.patient = patientServices.Patients.get({
      Id: $routeParams.patientId,
    });

    $scope.patient.$promise.then(function (result) {
      if (result.Value.AddressReferrerId) {
        $timeout(function () {
          patientServices.Patients.get(
            { Id: result.Value.AddressReferrerId },
            ctrl.getPatientByIdOnSuccess,
            ctrl.getPatientByIdOnFail
          );
        }, 0);
      } else {
        $scope.patientAddressReference = $scope.patient;
      }
      ctrl.copyContactInfoFromPatient(result.Value);
    });
  } else {
    if ($scope.patient.AddressReferrerId) {
      $timeout(function () {
        patientServices.Patients.get(
          { Id: $scope.patient.AddressReferrerId },
          ctrl.getPatientByIdOnSuccess,
          ctrl.getPatientByIdOnFail
        );
      }, 0);
    } else {
      $scope.patientAddressReference = $scope.patient;
    }
    ctrl.copyContactInfoFromPatient($scope.patient);
  }

  ctrl.getPatientByIdOnSuccess = function (res) {
    $scope.patientAddressReference = res.Value;
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
        $scope.contactInfo.AddressLine1 =
          $scope.patientAddressReference.AddressReferrer.AddressReferrer.AddressLine1;
        $scope.contactInfo.AddressLine2 =
          $scope.patientAddressReference.AddressReferrer.AddressReferrer.AddressLine2;
        $scope.contactInfo.City =
          $scope.patientAddressReference.AddressReferrer.AddressReferrer.City;
        $scope.contactInfo.State =
          $scope.patientAddressReference.AddressReferrer.AddressReferrer.State;
        $scope.contactInfo.ZipCode =
          $scope.patientAddressReference.AddressReferrer.AddressReferrer.ZipCode;
      } else {
        $scope.contactInfo.AddressLine1 =
          $scope.patientAddressReference.AddressReferrer.AddressLine1;
        $scope.contactInfo.AddressLine2 =
          $scope.patientAddressReference.AddressReferrer.AddressLine2;
        $scope.contactInfo.City =
          $scope.patientAddressReference.AddressReferrer.City;
        $scope.contactInfo.State =
          $scope.patientAddressReference.AddressReferrer.State;
        $scope.contactInfo.ZipCode =
          $scope.patientAddressReference.AddressReferrer.ZipCode;
      }
    } else {
      $scope.contactInfo.AddressLine1 =
        $scope.patientAddressReference.AddressLine1;
      $scope.contactInfo.AddressLine2 =
        $scope.patientAddressReference.AddressLine2;
      $scope.contactInfo.City = $scope.patientAddressReference.City;
      $scope.contactInfo.State = $scope.patientAddressReference.State;
      $scope.contactInfo.ZipCode = $scope.patientAddressReference.ZipCode;
    }
  };

  $scope.valid = true;

  //#region validate required and any attributes
  $scope.validatePanel = function (nv, ov) {
    if (nv && ov !== nv) {
      $scope.hasErrors = !(
        $scope.frmPatientContactInfo.$valid &&
        $scope.frmPatientContactInfo.inpPatientEmailOneAddress.$valid &&
        $scope.frmPatientContactInfo.inpPatientEmailTwoAddress.$valid &&
        $scope.frmPatientContactInfo.inpZipCode.$valid &&
        $scope.validPhones
      );
    }
  };

  $scope.$watch('editing', function (nv, ov) {
    if (angular.isDefined(nv) && angular.isDefined(ov) && nv != ov) {
      ctrl.copyContactInfoFromPatient($scope.patient);
    }
    // resetting phones when user leaves edit mode
    if (nv === false && ov === true) {
      console.log($scope.backupPhones);
      $scope.phones = JSON.parse($scope.backupPhones);
      $scope.contactInfo.Phones = $scope.phones;
      $scope.patient.Data.Phones = $scope.phones;
    }
  });

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

  //$scope.$watch('editing', function (nv, ov) {
  //    if (angular.isDefined(nv) &&
  //        angular.isDefined(ov) &&
  //        nv != ov) {
  //        ctrl.copyContactInfoFromPatient($scope.patient);
  //    }
  //     resetting phones when user leaves edit mode
  //    if (nv === false && ov === true) {
  //        $scope.phones = JSON.parse($scope.backupPhones);
  //    }
  //});

  //$scope.onSuccess = function (res) {
  //    toastrFactory.success(localize.getLocalizedString('Update {0}', ['successful.']), 'Success');
  //    $scope.patient = res.Value;
  //    $scope.contactInfo.Updated = true;
  //    // the patient api is only called the first time the dashboard loads
  //    // because of that we need to update the patient object on the parent
  //    // if we don't, the stale patient object will keep getting reloaded everytime this view loads
  //    $scope.$parent.$parent.additionalData = $scope.patient;
  //    $scope.savePhones();
  //};

  //$scope.onError = function (error) {
  //    toastrFactory.error('Update was unsuccessful. Please retry your save.', 'Server Error');
  //};

  //$scope.saveFunction = function (contactInfo, onSuccess, onError) {
  //    $scope.validatePanel($scope.patient);
  //    $scope.valid = !$scope.hasErrors;

  //    if ($scope.valid)
  //    {
  //        ctrl.copyContactInfoToPatient(contactInfo, $scope.patient);
  //        // hack? Not sure if there's a better way to handle input manipulation, so this is here to remove dash when saved
  //        if ($scope.patient.ZipCode)
  //            $scope.patient.ZipCode = $scope.patient.ZipCode.replace('-', '');

  //        if ($scope.valid) {
  //            patientServices.Patients.update($scope.patient, onSuccess, onError);
  //        }
  //    }
  //};

  // validating panel whenever validPhones changes
  $scope.$watch('validPhones', function (nv, ov) {
    $scope.validatePanel($scope.patient);
    $scope.valid = !$scope.hasErrors;
  });

  //#region Phones

  $scope.validPhones = true;
  $scope.phones = $scope.contactInfo.Phones;

  // Build instance
  $scope.backupPhones = null;
  $scope.buildBackupPhonesInstance = function (currentPhones) {
    $scope.backupPhones = JSON.stringify(angular.copy(currentPhones));
  };
  $scope.buildBackupPhonesInstance($scope.phones);

  // validating phone: should not send phone with ObjectState of 'None' or null
  // or with an empty Number or Type
  //$scope.checkValidPhone = function (phone) {
  //    if ((phone.ObjectState !== saveStates.None) && phone.ObjectState && phone.PhoneNumber && phone.Type) {
  //        return phone;
  //    }
  //}

  //$scope.contactIdsToDelete = [];
  //$scope.savePhones = function () {
  //    var phonesToSend = [];
  //    angular.forEach($scope.phones, function (phone) {
  //        if ($scope.checkValidPhone(phone)) {
  //            phone.PatientId = $scope.patient.PatientId;
  //            phonesToSend.push(phone);
  //            // keeping track of the deletes for easy removal in success callback
  //            if (phone.ObjectState === saveStates.Delete) {
  //                $scope.contactIdsToDelete.push(phone.ContactId);
  //            }
  //        }
  //    });
  //    if (phonesToSend.length > 0) {
  //        patientServices.Contacts.addUpdate(
  //            { Id: $scope.patient.PatientId },
  //            phonesToSend,
  //            function (res) {
  //                $scope.patientContactsSaveSuccess(res);
  //            },
  //            function () {
  //                $scope.patientContactsSaveFailure('There was an error while saving your contacts(s)');
  //            }
  //        );
  //    }
  //}

  //$scope.patientContactsSaveSuccess = function (res) {
  //    angular.forEach(res.Value, function (phoneReturned) {
  //        if (phoneReturned.ObjectState === saveStates.Successful) {
  //            // if contact id already exists in $scope.phones, then we have an update or delete
  //            var index = listHelper.findIndexByFieldValue($scope.phones, 'ContactId', phoneReturned.ContactId);
  //            if (index != -1) {
  //                if ($scope.contactIdsToDelete.indexOf(phoneReturned.ContactId) !== -1) {
  //                    // delete
  //                    $scope.phones.splice(index, 1);
  //                }
  //                else {
  //                    // update
  //                    phoneReturned.ObjectState = saveStates.None;
  //                    $scope.phones.splice(index, 1, phoneReturned);
  //                }
  //            }
  //            else {
  //                // add
  //                phoneReturned.ObjectState = saveStates.None;
  //                $scope.phones.push(phoneReturned);
  //            }
  //            // console.log($scope.phones);
  //        }
  //        else if (phoneReturned.ObjectState === saveStates.Failed) {
  //            // console.log('add, update, or delete failed for this phone number: ' + phone.PhoneNumber);
  //        }
  //    });
  //    $scope.buildBackupPhonesInstance($scope.phones);
  //};

  //$scope.patientContactsSaveFailure = function (msg) {
  //    $scope.phones = JSON.parse($scope.backupPhones);
  //    toastrFactory.error(msg, 'Error');
  //};

  // validating when contactInfo changes
  $scope.$watch(
    'contactInfo',
    function (nv, ov) {
      $scope.validatePanel($scope.patient);
      $scope.valid = !$scope.hasErrors;
      // used to set originalContactInfo in dashboard, for back button discard message
      if (
        nv.Phones &&
        ov.Phones &&
        nv.Phones.length === 1 &&
        ov.Phones.length === 1 &&
        ov.Phones[0].invalidPhoneNumber === undefined
      ) {
        $scope.$emit('contact-info-changed', $scope.contactInfo);
      }
    },
    true
  );

  //#endregion
}

PatientContactInfoController.prototype = Object.create(BaseCtrl.prototype);
