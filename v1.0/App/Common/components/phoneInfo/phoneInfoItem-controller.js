'use strict';

angular
  .module('common.directives')
  .controller('PhoneInfoItemController', [
    '$scope',
    'ListHelper',
    'localize',
    'SaveStates',
    '$filter',
    '$timeout',
    '$rootScope',
    'PatientServices',
    PhoneInfoItemController,
  ]);
function PhoneInfoItemController(
  $scope,
  listHelper,
  localize,
  saveStates,
  $filter,
  $timeout,
  $rootScope,
  patientServices
) {
  BaseCtrl.call(this, $scope, 'PhoneInfoItemController');
  var ctrl = this;

  ctrl.kendoWidgets = [];
  $scope.customPhoneTypes = [];
  $scope.noteCollapsed = true;
  $scope.editing = false;
  $scope.showRemoveMsg = false;
  $scope.isPatient =
    angular.isDefined($scope.phone.PatientInfo) &&
    $scope.phone.PatientInfo != null;
  $scope.editingMode = true;
  $scope.disableClick = true;
  $scope.allPhones = null;

  if ($scope.phone.ObjectState == 'None') {
    $scope.editingMode = false;
  }

  if ($scope.phone.PhoneReferrerId) {
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
  $scope.phone._tempId = $scope.phoneId;

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

    if (requiresPhoneType && $scope.phone.Type == $scope.addOptionValue) {
      $scope.phone.Type = null;
      $scope.addingCustomPhoneType = true;
    }

    // The call to refresh() was removed due to Bug 421037
  };

  $scope.addCustomPhoneType = function () {
    $scope.phone.Type = $filter('titlecase')($scope.phone.Type);
    ctrl.ddl.options.optionLabel = $scope.phone.Type;
    ctrl.ddl.optionLabelTemplate = function (optionLabel) {
      return (
        '<span class="value-template-input k-state-default jrwjrwjrw">' +
        _.escape(optionLabel) +
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
      (!$scope.phone.ContactId || $scope.phone.ContactId.length == 0) &&
      (!$scope.phone.PhoneNumber || $scope.phone.PhoneNumber == '') &&
      (!$scope.phone.Type || $scope.phone.Type == '') &&
      (!$scope.phone.Notes || $scope.phone.Notes == '') &&
      !$scope.phone.TextOk
    ) {
      $scope.removeFunction($scope.phone);
      $scope.showRemoveMsg = false;
    } else {
      $scope.showRemoveMsg = true;
    }
  };

  $scope.confirmRemove = function () {
    $scope.removeFunction($scope.phone);
    $scope.showRemoveMsg = false;
  };

  $scope.cancelRemove = function () {
    $scope.showRemoveMsg = false;
  };
  //#endregion Remove Phone

  //#region Edited Phone

  $scope.originalPhone = angular.copy($scope.phone);

  $scope.phone.invalidPhoneNumber = false;
  $scope.phone.invalidType = false;

  $scope.validatePhone = function () {
    var requiresPhoneType = !($scope.hidePhoneTypes == true);

    if (requiresPhoneType) {
      // on new phone, its invalid if has phone but no type or has type but no phone
      if (
        $scope.phone.ObjectState == saveStates.Add ||
        $scope.phone.ObjectState == saveStates.Update
      ) {
        if (angular.isUndefined($scope.phone.PhoneNumber)) {
          $scope.phone.invalidPhoneNumber = true;
        } else if ($scope.phone.duplicateNumber) {
          $scope.phone.invalidPhoneNumber = true;
        } else {
          $scope.phone.invalidPhoneNumber =
            ((angular.isUndefined($scope.phone.PhoneNumber) ||
              $scope.phone.PhoneNumber == null ||
              $scope.phone.PhoneNumber.length == 0) &&
              $scope.phone.Type != null &&
              $scope.phone.Type != '') ||
            ($scope.phone.PhoneNumber.length > 0 &&
              $scope.phone.PhoneNumber.length < 10);
        }
        $scope.phone.invalidType =
          ($scope.phone.Type == null || $scope.phone.Type == '') &&
          $scope.phone.PhoneNumber != null &&
          $scope.phone.PhoneNumber.length > 0;
        $scope.phone.hasErrors =
          $scope.phone.invalidType || $scope.phone.invalidPhoneNumber;
      }
      // on phone update, its invalid if phone is null or undefined or phonetype is null
      if (
        $scope.phone.ObjectState == saveStates.Update ||
        $scope.phone.ObjectState == saveStates.None
      ) {
        if (angular.isUndefined($scope.phone.PhoneNumber)) {
          $scope.phone.invalidPhoneNumber = true;
        } else if ($scope.phone.duplicateNumber) {
          $scope.phone.invalidPhoneNumber = true;
        } else {
          $scope.phone.invalidPhoneNumber =
            $scope.phone.PhoneNumber == null ||
            $scope.phone.PhoneNumber.length == 0 ||
            ($scope.phone.PhoneNumber.length > 0 &&
              $scope.phone.PhoneNumber.length < 10);
        }
        $scope.phone.invalidType =
          $scope.phone.Type == null || $scope.phone.Type == '';
        $scope.phone.hasErrors =
          $scope.phone.invalidType || $scope.phone.invalidPhoneNumber;
      }
    } else {
      // on phone update, its invalid if phone is null or phonetype is null
      if (angular.isUndefined($scope.phone.PhoneNumber)) {
        $scope.phone.invalidPhoneNumber = true;
      } else if ($scope.phone.duplicateNumber) {
        $scope.phone.invalidPhoneNumber = true;
      } else {
        $scope.phone.invalidPhoneNumber =
          ((angular.isUndefined($scope.phone.PhoneNumber) ||
            $scope.phone.PhoneNumber == null ||
            $scope.phone.PhoneNumber.length == 0) &&
            !(
              ($scope.phone.Type == null || $scope.phone.Type == '') &&
              $scope.phone.PhoneNumber.length != 10
            )) ||
          ($scope.phone.PhoneNumber.length > 0 &&
            $scope.phone.PhoneNumber.length < 10);
      }
      $scope.phone.invalidType = false;
      $scope.phone.hasErrors =
        $scope.phone.invalidType || $scope.phone.invalidPhoneNumber;
    }
    if (!$scope.phone.hasErrors) {
      $scope.phone.CanAddNew = true;
    } else {
      $scope.phone.CanAddNew = false;
    }
  };

  $scope.$watch('phone.PhoneNumber', function (nv, ov) {
    if (nv != ov) {
      $timeout.cancel($scope.timeoutPhoneValidation);
      $scope.timeoutPhoneValidation = $timeout(function () {
        $scope.hasBeenEdited();
        $scope.validatePhone();
      }, 1000);
    }
  });

  $scope.$watch('phone.Type', function (nv, ov) {
    if (nv != ov) {
      $scope.hasBeenEdited();
      $scope.validatePhone();
      if (nv !== null) {
        $scope.phoneTypeChanged();
      }
    }
  });

  $scope.$watch('phone.Notes', function (nv, ov) {
    if (nv != ov) {
      $scope.hasBeenEdited();
      $scope.validatePhone();
    }
  });

  $scope.$watch('phone.TextOk', function (nv, ov) {
    if (nv != ov) {
      $scope.hasBeenEdited();
      $scope.validatePhone();
      $rootScope.$broadcast('check-option-toggling', nv);
    }
  });

  $scope.$watch('phone.ReminderOK', function (nv, ov) {
    if (nv != ov) {
      $scope.hasBeenEdited();
      $scope.validatePhone();
      $rootScope.$broadcast('check-option-toggling', nv);
    }
  });

  $scope.$watch('phone.IsPrimary', function (nv, ov) {
    if (nv != ov) {
      $scope.hasBeenEdited();
      $scope.validatePhone();
    }
  });

  // revalidate when any phone changes to see if other(s) are duplicate
  $scope.$watch('phone.duplicateNumber', function (nv, ov) {
    if (nv != ov) {
      $scope.hasBeenEdited();
      $scope.validatePhone();
    }
  });

  $scope.hasBeenEdited = function () {
    var p, op;
    p = $scope.phone;
    op = $scope.originalPhone;
    if (p.ContactId != null) {
      if (
        p.PhoneNumber != op.PhoneNumber ||
        p.Type != op.Type ||
        p.Notes != op.Notes ||
        p.TextOk != op.TextOk ||
        p.ReminderOK != op.ReminderOK ||
        p.IsPrimary != op.IsPrimary
      ) {
        p.ObjectState = saveStates.Update;
      } else {
        p.ObjectState = saveStates.None;
      }
    } else {
      p.ObjectState = saveStates.Add;
    }
  };
  //#endregion Edited Phone

  $scope.primaryChanged = function () {
    // we've been clicked, don't allow deselection
    if ($scope.phone.IsPrimary == false) {
      $scope.phone.IsPrimary = true;
    }
  };

  $scope.$on('kendoWidgetCreated', function (event, widget) {
    if (!ctrl.ddl) {
      ctrl.ddl = widget;
      ctrl.defaultOptionLabelTemplate = ctrl.ddl.optionLabelTemplate;
    }
    if ($scope.phone.Type && $scope.phone.Type != '') {
      var found = false;
      angular.forEach($scope.phoneTypes, function (type) {
        if (
          type.Name != $scope.addOptionValue &&
          type.Name == $scope.phone.Type
        ) {
          found = true;
        }
      });
      if (!found) {
        ctrl.ddl.options.optionLabel = $scope.phone.Type;
        ctrl.ddl.optionLabelTemplate = function (optionLabel) {
          return (
            '<span class="value-template-input k-state-default jrwjrwjrw">' +
            _.escape(optionLabel) +
            '</span>'
          );
        };
        ctrl.ddl.refresh();
        ctrl.ddl.select(0);
      }
    }

    if (widget && ctrl.createdWidgets) {
      ctrl.createdWidgets.push(widget);
    }
  });

  $scope.disableEdit = function (id) {
    $scope.editingMode = false;

    angular.element('#btnCancel' + id).hide();
    angular.element('#btnSave' + id).hide();

    angular.element('#btnDelete' + id).show();
    angular.element('#btnEdit' + id).show();

    angular.element('#editing' + id).show();

    $scope.phone.CanAddNew = true;
    $scope.phone.NewlyAdded = false;
  };

  $scope.cancelChanges = function (id) {
    $scope.editingMode = false;

    if ($scope.phone.NewlyAdded) {
      $scope.removeFunction($scope.phone);
      $rootScope.$broadcast('deactivate-add-phone-number');
    } else {
      $scope.phone.PhoneNumber = $scope.originalPhoneDetails.PhoneNumber;
      $scope.phone.Type = $scope.originalPhoneDetails.Type;
      $scope.phone.TextOk = $scope.originalPhoneDetails.TextOk;
      $scope.phone.ReminderOK = $scope.originalPhoneDetails.ReminderOK;
      $scope.phone.IsPrimary = $scope.originalPhoneDetails.IsPrimary;
    }

    angular.element('#btnCancel' + id).hide();
    angular.element('#btnSave' + id).hide();

    angular.element('#btnDelete' + id).show();
    angular.element('#btnEdit' + id).show();

    angular.element('#editing' + id).show();

    $scope.phone.CanAddNew = true;
  };

  $scope.enableEdit = function (id) {
    $scope.editingMode = true;
    $scope.originalPhoneDetails = angular.copy($scope.phone);
    var tempPhoneType = angular.copy($scope.phone.Type);
    $scope.phone.Type = null;

    $timeout(function () {
      $scope.phone.Type = tempPhoneType;
    }, 100);

    angular.element('#btnCancel' + id).show();
    angular.element('#btnSave' + id).show();

    angular.element('#btnDelete' + id).hide();
    angular.element('#btnEdit' + id).hide();
  };

  $scope.disableClickFn = function () {
    if (
      $scope.phone.PhoneNumber != '' &&
      $scope.phone.Type != null &&
      $scope.phone.Type != '' &&
      !$scope.phone.hasErrors
    )
      $scope.disableClick = false;
    else $scope.disableClick = true;
  };

  $scope.isPrimaryClick = function (e) {
    if ($(e.currentTarget)[0].checked) {
      $rootScope.$broadcast('phone-primary-changed', $scope.phone);
    }
  };

  $rootScope.$broadcast('check-option-toggling', true);

  $scope.getDeleteMessage = function () {
    var message = null;
    if ($scope.phone.PhoneReferrerId) {
      message =
        'Are you sure you want to remove the link? This will not remove the number from the original owner.';
    } else {
      if ($scope.phone.Links != null && $scope.phone.Links.length > 1) {
        message =
          'Are you sure you want to remove this phone? This will remove this phone number from linked patients in this account.';
      } else {
        message = 'Are you sure you want to remove this phone?';
      }
    }

    return message;
  };

  $scope.$on('$destroy', function () {
    if (ctrl && ctrl.kendoWidgets && ctrl.kendoWidgets.length) {
      angular.forEach(ctrl.kendoWidgets, function (widget) {
        if (widget) {
          try {
            widget.destroy();
            for (var widgetItem in widget) {
              if (widgetItem && widget.hasOwnProperty(widgetItem)) {
                widget[widgetItem] = null;
              }
            }
          } catch (err) {
            var test = err;
          }
        }
      });

      ctrl.kendoWidgets = null;
      ctrl = null;
    }
  });

  //updating this to not lose reference
  if (!$scope.isPatient) {
    if ($scope.phone) {
      $scope.phone.Type = null;
      $timeout(function () {
        if (!_.isNil($scope.originalPhone)) {
          $scope.phone.Type = angular.copy($scope.originalPhone.Type);
        }
      }, 500);
    }
  }
}

PhoneInfoItemController.prototype = Object.create(BaseCtrl.prototype);
