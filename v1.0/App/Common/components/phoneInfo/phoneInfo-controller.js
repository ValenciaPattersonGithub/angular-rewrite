'use strict';

angular
  .module('common.controllers')
  .controller('PhoneInfoController', [
    '$scope',
    '$rootScope',
    '$timeout',
    'StaticData',
    'localize',
    'SaveStates',
    '$filter',
    'ListHelper',
    PhoneInfoController,
  ]);

function PhoneInfoController(
  $scope,
  $rootScope,
  $timeout,
  staticData,
  localize,
  saveStates,
  $filter,
  listHelper
) {
  BaseCtrl.call(this, $scope, 'PhoneInfoController');
  var ctrl = this;
  $scope.toggle = { Checked: false };
  $scope.activateAddPhone = false;
  $scope.fromTeamMember = false;
  $scope.showLabel = angular.isDefined($scope.showLabel)
    ? $scope.showLabel
    : true;
  $scope.isPatient =
    angular.isDefined($scope.patientInfo) && $scope.patientInfo.Profile != null;
  if ($scope.isPatient) {
    angular.forEach($scope.phones, function (phone) {
      if (angular.isUndefined(phone.PatientInfo) || phone.PatientInfo == null) {
        phone.PatientInfo = {
          FirstName: $scope.patientInfo.Profile.FirstName,
          LastName: $scope.patientInfo.Profile.LastName,
        };
      }
      if (angular.isUndefined(phone.ReminderOK) || phone.ReminderOK == null) {
        phone.ReminderOK = false;
      }
    });
  }

  $scope.PhoneTypesOnSuccess = function (res) {
    $scope.phoneTypes = new kendo.data.ObservableArray([]);
    angular.forEach(res.Value, function (phoneType) {
      phoneType.Value = angular.copy(phoneType.Name);
      $scope.phoneTypes.push(phoneType);
    });

    ////BUG FIX order by name
    var phones = $filter('orderBy')($scope.phoneTypes, 'Name', false);
    $scope.phoneTypes = phones;

    if (
      $scope.patientInfo != null &&
      $scope.patientInfo.Profile.PatientId != null
    ) {
      if ($scope.phones != null && $scope.phones.length > 0)
        $scope.activateAddPhone = true;

      if ($scope.phones != null && $scope.phones.length == 1)
        $scope.phones[0].IsPrimary = true;
    }
  };

  $scope.focusIndex = 0;

  staticData
    .PhoneTypes()
    .then($scope.PhoneTypesOnSuccess, $scope.PhoneTypesOnError);

  $scope.filterState = function (state) {
    return function (item) {
      return item[state] != saveStates.Delete;
    };
  };

  // used to tell other phones they can or can not edit a custom phone type
  $scope.flags = {
    editing: false,
  };

  //#region Init
  /* Initializes a new phone object if phones is empty
   * Else will look through phones for any custom phone types and add them to phoneTypes
   */
  $scope.newPhonePrimary = {
    PatientInfo: $scope.isPatient
      ? {
          FirstName: $scope.patientInfo.Profile.FirstName,
          LastName: $scope.patientInfo.Profile.LastName,
        }
      : null,
    ContactId: null,
    PhoneNumber: '',
    Type: null,
    TextOk: false,
    Notes: null,
    ObjectState: saveStates.Add,
    IsPrimary: true,
    ReminderOK: false,
  };
  $scope.newPhone = {
    PatientInfo: $scope.isPatient
      ? {
          FirstName: $scope.patientInfo.Profile.FirstName,
          LastName: $scope.patientInfo.Profile.LastName,
        }
      : null,
    ContactId: null,
    PhoneNumber: '',
    Type: null,
    TextOk: true,
    Notes: null,
    ObjectState: saveStates.Add,
    IsPrimary: false,
    ReminderOK: true,
    CanAddNew: false,
    NewlyAdded: true,
  };

  $scope.setPhonePatientInfo = function () {
    $scope.newPhonePrimary.PatientInfo = $scope.isPatient
      ? {
          FirstName: $scope.patientInfo.Profile.FirstName,
          LastName: $scope.patientInfo.Profile.LastName,
        }
      : null;
    $scope.newPhone.PatientInfo = $scope.isPatient
      ? {
          FirstName: $scope.patientInfo.Profile.FirstName,
          LastName: $scope.patientInfo.Profile.LastName,
        }
      : null;
  };

  if ($scope.area == 'user-crud') {
    $scope.newPhonePrimary.OrderColumn = 1;
    $scope.newPhone.OrderColumn = 1;
  }

  $scope.init = function () {
    // custom phoneTypes associated with existing phones do not always make it into the dropdown, adding a little delay
    // to try and ensure that existing phones have been loaded before we try and add any custom types to the dropdown
    //$timeout(
    //    function () {
    //        if ($scope.phones.length === 0) {
    //            var newPhone = angular.copy($scope.newPhonePrimary);
    //            $scope.phones.push(newPhone);
    //        } else {
    //            //$scope.initCustomPhoneTypes();
    //        }
    //    },
    //    200
    //);
  };

  //#endregion Init

  $scope.$watch('focusIf', function (nv, ov) {
    if (nv != null && ov != null && nv != ov) {
      $scope.focusIndex = 0;
    }
  });

  //#region Phones
  $scope.addPhone = function (phone) {
    var canAdd = true;
    angular.forEach($scope.phones, function (phone) {
      if (
        phone.ObjectState !== saveStates.Delete &&
        (!phone.PhoneNumber || phone.PhoneNumber.length != 10) &&
        (!phone.ContactId || phone.ContactId.length == 0)
      ) {
        canAdd = false;
        return;
      }

      if (!phone.CanAddNew) {
        canAdd = false;
        return;
      }
    });

    if (
      canAdd &&
      $scope.phones.length - $scope.deletedPhones.length < $scope.maxLimit
    ) {
      var addPhone = {};
      if (angular.isDefined(phone)) {
        addPhone = angular.copy(phone);
      } else {
        //the new phone templates dont hold reference, have to update first and last name. Front end only
        $scope.setPhonePatientInfo();
        addPhone = angular.copy($scope.newPhone);
      }

      if ($scope.phones.length - $scope.deletedPhones.length <= 0) {
        addPhone.IsPrimary = true;
      }

      $scope.phones.push(addPhone);

      $scope.focusIndex = Math.max(
        $scope.phones.length - $scope.deletedPhones.length - 1,
        0
      );
      if ($scope.area == 'user-crud')
        $scope.phones[$scope.phones.length - 1].OrderColumn =
          $scope.focusIndex + 1;
    }
  };

  $scope.deletedPhones = [];

  $scope.removePhone = function (phone) {
    var OrderColumnRemoved = null;
    if ($scope.area == 'user-crud') OrderColumnRemoved = phone.OrderColumn;
    if (phone.ObjectState == saveStates.Add) {
      $scope.phones.splice($scope.phones.indexOf(phone), 1);
    } else {
      phone.ObjectState = saveStates.Delete;
      if ($scope.area == 'user-crud') phone.hasErrors = false;
      // keeping track of deleted phones so that the user can have up to the maxLimit without
      // taking into account how many they have deleted
      $scope.deletedPhones.push(phone);
    }

    angular.forEach($scope.phones, function (phone, index) {
      if (phone._tempId) {
        phone._tempId = index;
      }
      if (
        $scope.area == 'user-crud' &&
        phone.OrderColumn > OrderColumnRemoved &&
        phone.object != saveStates.Delete
      ) {
        phone.OrderColumn--;
      }
    });

    if (phone.IsPrimary && $scope.phones.length > 0) {
      for (var i = 0; i < $scope.phones.length; i++) {
        var p = $scope.phones[i];
        if (p.ObjectState != saveStates.Delete) {
          ctrl.setNewIsPrimary(p);
          break;
        }
      }
    }

    if ($scope.phones.length == 0) {
      $scope.activateAddPhone = false;
    }

    $scope.focusIndex = Math.max(
      $scope.phones.length - $scope.deletedPhones.length - 1,
      0
    );
  };

  /* Watches phones array for any of them were to throw a validation error */
  $scope.$watch(
    function () {
      if (!_.isNil($scope.phones)) {
        return $scope.phones.map(function (obj) {
          return { hasErrors: obj.hasErrors, PhoneNumber: obj.PhoneNumber };
        });
      }
    },
    function (nv) {
      $scope.$emit('phones-changed');
      $scope.validPhones = true;
      if (nv) {
        for (var i = 0; i < nv.length; i++) {
          if ($scope.area == 'user-crud') {
            if (i == 0) {
              $scope.phones[i].duplicateNumber = false;
            }
            for (var j = i + 1; j < nv.length; j++) {
              if (i == 0) $scope.phones[j].duplicateNumber = false;
              if (
                nv[i].PhoneNumber == nv[j].PhoneNumber &&
                $scope.phones[i].ObjectState != saveStates.Delete &&
                $scope.phones[j].ObjectState != saveStates.Delete
              ) {
                $scope.phones[i].duplicateNumber = true;
                $scope.phones[j].duplicateNumber = true;
              }
            }
          } else {
            if (
              nv[i].hasErrors == true &&
              ($scope.phones[i].ObjectState === saveStates.Add ||
                $scope.phones[i].ObjectState === saveStates.Update)
            ) {
              $scope.validPhones = false;
            }
            if (i == 0) {
              $scope.phones[i].duplicateNumber = false;
            }
            for (var j = i + 1; j < nv.length; j++) {
              if (i == 0) $scope.phones[j].duplicateNumber = false;
              if (
                nv[i].PhoneNumber == nv[j].PhoneNumber &&
                $scope.phones[i].ObjectState != saveStates.Delete &&
                $scope.phones[j].ObjectState != saveStates.Delete
              ) {
                $scope.phones[i].duplicateNumber = true;
                $scope.phones[j].duplicateNumber = true;
              }
            }
          }
        }
      }
    },
    true
  );

  // only show IsPrimary if more than one phone
  $scope.showIsPrimaryCheckBox = false;
  $scope.$watch(
    'phones',
    function (nv, ov) {
      // if phone is removed and only one left, reset showIsPrimaryCheckBox
      if (nv) {
        if (nv.length > 1 && $scope.showIsPrimary) {
          $scope.showIsPrimaryCheckBox = true;
        } else if (nv && nv[0]) {
          $scope.showIsPrimaryCheckBox = false;
        }
        if (nv != ov) {
          $scope.deletedPhones = [];
          for (var i = 0; i < nv.length; i++) {
            // bug fix - when a user clears (not clicking remove) a phone, the blank phone object is still marked as primary
            // that phone is not being sent to the API but none of the other phones are marked as primary, which is causing an error
            // trying to handle this like the remove function, just marking the first of the other phones to primary
            if (ov) {
              if (nv[i].IsPrimary == true) {
                if (nv[i].PhoneNumber && nv[i].PhoneNumber.length === 0) {
                  if (i === 0 && nv.length > 1) {
                    ctrl.setNewIsPrimary(nv[1]);
                  } else if (i >= 1) {
                    ctrl.setNewIsPrimary(nv[0]);
                  }
                } else if (
                  nv[i] &&
                  ov[i] &&
                  nv[i].IsPrimary != ov[i].IsPrimary
                ) {
                  // this is the new Primary phone, set others to IsPrimary false
                  ctrl.setNewIsPrimary(nv[i]);
                }
              }
              if (nv[i].ObjectState == saveStates.Delete) {
                $scope.deletedPhones.push(nv[i]);
              }
            }
          }
        }
        $scope.tempPhone = angular.copy(nv);
      }
    },
    true
  );

  ctrl.setNewIsPrimary = function (primaryPhone) {
    angular.forEach($scope.phones, function (phone) {
      if (
        (primaryPhone._tempId >= 0 && phone._tempId == primaryPhone._tempId) ||
        (primaryPhone.ContactId && phone.ContactId == primaryPhone.ContactId)
      ) {
        phone.IsPrimary = true;
      } else {
        phone.IsPrimary = false;
      }
    });
  };

  $scope.toggleOptions = function () {
    angular.forEach($scope.phones, function (phone) {
      phone.ReminderOK = !$scope.toggle.Checked;

      if (phone.Type == 'Mobile') phone.TextOk = !$scope.toggle.Checked;
    });
  };

  $scope.$on('soar:phone-remove', function (event, phone) {
    $scope.removePhone(phone);
  });
  //fix for bug to show the empty phone box in the event we have no phone data for the user
  $scope.$on('add-empty-phone', function (event) {
    //end the broadcast
    event.defaultPrevented = true;
    $scope.addPhone();
  });

  $scope.$rootScopeRegistrations.push(
    $rootScope.$on('account-members-loaded', function (event, accountMembers) {
      angular.forEach($scope.phones, function (phone) {
        if (phone.PhoneReferrerId) {
          var foundInfo = listHelper.findItemByFieldValue(
            accountMembers,
            'PatientId',
            phone.PhoneReferrer.PatientId
          );
          phone.PatientInfo = {
            FirstName: foundInfo.FirstName,
            LastName: foundInfo.LastName,
          };
        }
      });
    })
  );

  $scope.$rootScopeRegistrations.push(
    $rootScope.$on('add-phone-number', function () {
      $scope.activateAddPhone = true;
      $scope.addPhone();
    })
  );

  $scope.$rootScopeRegistrations.push(
    $rootScope.$on('deactivate-add-phone-number', function () {
      if ($scope.phones.length == 0) $scope.activateAddPhone = false;
    })
  );

  $scope.$rootScopeRegistrations.push(
    $rootScope.$on('rx-required-user', function () {
      $scope.fromTeamMember = true;
      $scope.addPhone();
    })
  );

  $scope.$rootScopeRegistrations.push(
    $rootScope.$on('phone-primary-changed', function (event, phone) {
      $scope.phones.forEach(function (item) {
        if (item == phone) {
          item.IsPrimary = true;
        } else {
          item.IsPrimary = false;
        }
      });
    })
  );

  $scope.$rootScopeRegistrations.push(
    $rootScope.$on('add-account-member-phone-number', function (event, phone) {
      $scope.activateAddPhone = true;
      phone.FromLinkedMember = true;
      phone.PatientInfo = $scope.isPatient
        ? {
            FirstName: $scope.patientInfo.Profile.FirstName,
            LastName: $scope.patientInfo.Profile.LastName,
          }
        : null;
      if ($scope.phones.length == 0) {
        phone.IsPrimary = true;
      }
      phone.CanAddNew = true;
      phone.NewlyAdded = false;

      $scope.addPhone(phone);
    })
  );

  $scope.$rootScopeRegistrations.push(
    $rootScope.$on('opt-out-phone', function (event, item) {
      $scope.toggle.Checked = item;
      $scope.tempPhones = _.isUndefined($scope.tempPhones)
        ? angular.copy($scope.tempPhone)
        : $scope.tempPhones;
      if (item) {
        $scope.tempPhones = angular.copy($scope.tempPhone);
        $scope.toggleOptions();
      } else {
        $scope.phones = $scope.tempPhones;
      }
    })
  );

  $scope.checkOptionToggling = function () {
    if ($scope.phones != null && $scope.phones.length > 0) {
      var trueCnt = 0;
      _.each($scope.phones, function (item) {
        if (item.Type == 'Mobile') {
          if (item.ReminderOK || item.TextOk) {
            trueCnt++;
          }
        } else {
          if (item.ReminderOK) {
            trueCnt++;
          }
        }
      });
      $scope.toggle.Checked = trueCnt == 0;
    }
  };

  $scope.$rootScopeRegistrations.push(
    $rootScope.$on('check-option-toggling', function (event, item) {
      $scope.checkOptionToggling();
    })
  );

  $scope.$watch('toggle.Checked', function (nv, ov) {
    if (nv != null && ov != null && nv != ov) {
      var obj = { Value: nv, Type: 'Phone' };
      $rootScope.$broadcast('toggle-opt-out-all-comms', obj);
    }
  });

  if (
    (!$scope.$parent.user ||
      ($scope.$parent.user && !$scope.$parent.user.UserId)) &&
    $scope.area == 'user-crud'
  ) {
    $scope.addPhone();
  }
}

PhoneInfoController.prototype = Object.create(BaseCtrl.prototype);
