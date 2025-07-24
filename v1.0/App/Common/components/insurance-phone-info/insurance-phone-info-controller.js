'use strict';

angular
  .module('common.controllers')
  .controller('InsurancePhoneInfoController', [
    '$scope',
    '$timeout',
    'StaticData',
    'localize',
    'SaveStates',
    '$filter',
    InsurancePhoneInfoController,
  ]);
function InsurancePhoneInfoController(
  $scope,
  $timeout,
  staticData,
  localize,
  saveStates,
  $filter
) {
  BaseCtrl.call(this, $scope, InsurancePhoneInfoController);
  var ctrl = this;
  $scope.showLabel = angular.isDefined($scope.showLabel)
    ? $scope.showLabel
    : true;

  $scope.PhoneTypesOnSuccess = function (res) {
    $scope.phoneTypes = new kendo.data.ObservableArray([]);
    angular.forEach(res.Value, function (phoneType) {
      phoneType.Value = angular.copy(phoneType.Name);
      $scope.phoneTypes.push(phoneType);
    });

    $scope.addOptionValue = localize.getLocalizedString('Custom');
    $scope.phoneTypes.push({
      Name: $scope.addOptionValue,
      Value: angular.copy($scope.addOptionValue),
    });

    ////BUG FIX order by name
    var phones = $filter('orderBy')($scope.phoneTypes, 'Name', false);
    $scope.phoneTypes = phones;

    $scope.init();
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

  $scope.newPhone = {
    ContactId: null,
    PhoneNumber: '',
    Type: null,
    TextOk: false,
    Notes: null,
    ObjectState: saveStates.Add,
    IsPrimary: false,
  };

  $scope.init = function () {
    // custom phoneTypes associated with existing phones do not always make it into the dropdown, adding a little delay
    // to try and ensure that existing phones have been loaded before we try and add any custom types to the dropdown
    $timeout(function () {
      if ($scope.phones.length === 0) {
        var newPhone = angular.copy($scope.newPhone);
        $scope.phones.push(newPhone);
      }
    }, 200);
  };

  //#endregion Init

  $scope.$watch('focusIf', function (nv, ov) {
    if (nv != null && ov != null && nv != ov) {
      $scope.focusIndex = 0;
    }
  });

  //#region Phones
  $scope.addPhone = function () {
    if (_.isNil($scope.phones)) {
      $scope.phones = [];
    }

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
    });

    if (
      canAdd &&
      $scope.phones.length - $scope.deletedPhones.length < $scope.maxLimit
    ) {
      var addPhone = angular.copy($scope.newPhone);
      if ($scope.phones.length - $scope.deletedPhones.length <= 0) {
        addPhone.IsPrimary = true;
      }
      $scope.phones.push(addPhone);

      $scope.focusIndex = Math.max(
        $scope.phones.length - $scope.deletedPhones.length - 1,
        0
      );
      $timeout(function () {
        angular.element('#inpPhoneNumber' + ($scope.phones.length - 1)).focus();
      });
    }
  };

  $scope.deletedPhones = [];
  $scope.removePhone = function (phone) {
    if (phone.ObjectState == saveStates.Add) {
      $scope.phones.splice($scope.phones.indexOf(phone), 1);
    } else {
      phone.ObjectState = saveStates.Delete;
      // keeping track of deleted phones so that the user can have up to the maxLimit without
      // taking into account how many they have deleted
      $scope.deletedPhones.push(phone);
    }

    angular.forEach($scope.phones, function (phone, index) {
      if (phone._tempId) {
        phone._tempId = index;
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

    $scope.focusIndex = Math.max(
      $scope.phones.length - $scope.deletedPhones.length - 1,
      0
    );
  };

  /* Watches phones array for any of them were to throw a validation error */
  $scope.$watch(
    function () {
      if (_.isNil($scope.phones)) return null;

      return $scope.phones.map(function (obj) {
        return obj.hasErrors;
      });
    },
    function (nv) {
      $scope.$emit('phones-changed');
      $scope.validPhones = true;
      for (var i = 0; i < nv.length; i++) {
        if (nv[i] == true) $scope.validPhones = false;
      }
    },
    true
  );

  // only show IsPrimary if more than one phone
  $scope.$watch(
    'phones',
    function (nv, ov) {
      // if phone is removed and only one left, reset showIsPrimaryCheckBox
      if (nv != ov) {
        $scope.deletedPhones = [];
        for (var i = 0; i < nv.length; i++) {
          // bug fix - when a user clears (not clicking remove) a phone, the blank phone object is still marked as primary
          // that phone is not being sent to the API but none of the other phones are marked as primary, which is causing an error
          // trying to handle this like the remove function, just marking the first of the other phones to primary
          if (nv[i].IsPrimary == true) {
            if (nv[i].PhoneNumber && nv[i].PhoneNumber.length === 0) {
              if (i === 0 && nv.length > 1) {
                ctrl.setNewIsPrimary(nv[1]);
              } else if (i >= 1) {
                ctrl.setNewIsPrimary(nv[0]);
              }
            } else if (nv[i] && ov[i] && nv[i].IsPrimary != ov[i].IsPrimary) {
              // this is the new Primary phone, set others to IsPrimary false
              ctrl.setNewIsPrimary(nv[i]);
            }
          }
          if (nv[i].ObjectState == saveStates.Delete) {
            $scope.deletedPhones.push(nv[i]);
          }
        }
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

  $scope.$on('soar:phone-remove', function (event, phone) {
    $scope.removePhone(phone);
  });
}

InsurancePhoneInfoController.prototype = Object.create(BaseCtrl.prototype);
