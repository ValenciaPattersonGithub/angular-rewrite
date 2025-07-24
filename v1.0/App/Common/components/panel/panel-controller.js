'use strict';

angular
  .module('common.controllers')
  .controller('PanelCtrl', [
    '$scope',
    '$uibModal',
    'ModalFactory',
    '$location',
    'PatientValidationFactory',
    'userSettingsDataService',
    '$routeParams',
    PanelCtrl,
  ]);
function PanelCtrl(
  $scope,
  $uibModal,
  modalFactory,
  $location,
  patientValidationFactory,
  userSettingsDataService,
  $routeParams
) {
  BaseCtrl.call(this, $scope, 'PanelCtrl');
  var ctrl = this;

  // #region Panel Flags

  $scope.data = {
    additionalData: angular.isDefined($scope.additionalData)
      ? $scope.additionalData
      : null,
    personalInfoData: angular.isDefined($scope.editData)
      ? $scope.editData
      : null,
  };

  $scope.flags = {
    autoSave: angular.isDefined($scope.autoSave) ? $scope.autoSave : false,
    editing: angular.isDefined($scope.editing) ? $scope.editing : false,
    valid: angular.isDefined($scope.valid) ? $scope.valid : false,
    cancelling: angular.isDefined($scope.cancelling)
      ? $scope.cancelling
      : false,
  };

  $scope.functions = {
    save: null,
    afterSuccess: null,
    afterError: null,
    cancel: null,
  };

  $scope.editPersonalAndContactInfo = angular.isDefined(
    $scope.editPersonalContactInfo
  )
    ? $scope.editPersonalContactInfo
    : false;

  $scope.editAccountMembers = angular.isDefined($scope.editAccountMembers)
    ? $scope.editAccountMembers
    : false;

  $scope.isSaveButtonDisabled = false;
  // #endregion

  // If we are not given the data to use, watch for when the child control sets the saveData object and clone that to the original data.
  if ($scope.editData) {
    $scope.data.saveData = $scope.editData;
    $scope.data.originalData = angular.copy($scope.editData);

    $scope.watchSaveData = null;
    $scope.clearWatch = null;
  } else {
    $scope.watchSaveData = function (nv, ov) {
      if (nv && ov === undefined) {
        $scope.data.originalData = angular.copy(nv);
        if (
          !$scope.template.endsWith('patient-account-discounts.html') ||
          (nv.hasOwnProperty('MasterDiscountTypeId') &&
            nv.hasOwnProperty('PatientDiscountTypeId'))
        ) {
          $scope.clearWatch();
        }
      }
    };

    $scope.clearWatch = $scope.$watch('data.saveData', function (nv, ov) {
      $scope.watchSaveData(nv, ov);
    });
  }
  
  $scope.activateEdit = function () {
    $scope.flags.editing = true;
    $scope.valid = false;
    $scope.isSaveButtonDisabled = false;
  };

  $scope.transferPatient = function () {
    let tabName = $scope.getTabNameFromParam();
    let prevLocation = tabName === '' ? 'Overview' : tabName;
    let patientPath = 'Patient/';

    $location.path(
      patientPath +
        $routeParams.patientId +
        '/Account/' +
        $scope.data.additionalData.PersonAccount.AccountId +
        '/TransferAccount/' +
        prevLocation
    );
  };

  // get tab name from url
  $scope.getTabNameFromParam = function () {
    let urlParams = $location.search();
    let tabName = '';
    if (urlParams && urlParams.tab) {
      let tabNameFromParam = urlParams.tab;
      tabName = tabNameFromParam;
    }
    return tabName;
  };

  $scope.openEditPersonalModal = function () {
    var modalInstance = modalFactory.Modal({
      templateUrl:
        'App/Patient/components/edit-personal-info-modal/edit-personal-info-modal.html',
      keyboard: false,
      windowClass: 'modal-65',
      backdrop: 'static',
      controller: 'EditPersonalInfoModalController',
      amfa: $scope.access.Value,
      resolve: {
        PatientInfo: function () {
          return $scope.data.saveData;
        },
      },
    });
    modalInstance.result.then($scope.personalInfoUpdated);
  };

  $scope.openEditContactModal = function () {
    var modalInstance = modalFactory.Modal({
      templateUrl:
        'App/Patient/components/edit-contact-info-modal/edit-contact-info-modal.html',
      keyboard: false,
      windowClass: 'modal-65',
      backdrop: 'static',
      controller: 'EditContactInfoModalController',
      amfa: $scope.access.Value,
      resolve: {
        PatientInfo: function () {
          return $scope.data.saveData;
        },
      },
    });
    modalInstance.result.then(
      $scope.contactInfoUpdated,
      $scope.contactInfoUpdateCancelled
    );
  };

  $scope.personalInfoUpdated = function () {
    if ($scope.defaultExpanded) {
      let patientPath = '/Patient/';
      $scope.accountSummaryLink =
        patientPath +
        $scope.data.saveData.Profile.PatientId +
        '/Summary/?tab=Profile&currentPatientId=0';
      $location.url($scope.accountSummaryLink);
    }
  };

  $scope.contactInfoUpdated = function () {};

  //This will expand panel on load
  ctrl.setDefaultExpanded = function () {
    if (
      $scope.defaultExpanded &&
      $scope.data.saveData &&
      $scope.data.saveData.Profile
    ) {
      //$scope.activateEdit();
      $scope.data.saveData.Profile.IsResponsiblePersonEditable = true;

      if ($scope.data.saveData.Profile.ResponsiblePersonType == 0)
        $scope.openEditPersonalModal();
    }
    //adding activeEdit back in due to flag bug 295963
    else if ($scope.defaultExpanded) {
      $scope.activateEdit();
    }
  };

  //This will expand panel on load
  ctrl.setDefaultExpanded();

  $scope.cancelPanelEdit = function () {
    if ($scope.changeConfirmRequired) {
      $scope.flags.editing = false;
      $scope.flags.cancelling = false;
    } else {
      if (angular.equals($scope.data.saveData, $scope.data.originalData)) {
        $scope.flags.editing = false;
      } else {
        $scope.flags.cancelling = true;
      }
    }
  };

  $scope.confirmCancel = function () {
    if (!$scope.changeConfirmRequired) {
      $scope.data.saveData = $.extend(
        $scope.data.saveData,
        $scope.data.originalData
      );
    }
    $scope.flags.cancelling = false;
    $scope.flags.editing = false;
  };

  $scope.declineCancel = function () {
    $scope.flags.cancelling = false;
  };

  $scope.savePanelEdit = function () {
    $scope.isSaveButtonDisabled = true;
    if ($scope.functions.save) {
      if ($scope.data.saveData.Profile) {
        ctrl.PersonAccount = angular.copy(
          $scope.data.saveData.Profile.PersonAccount
        );
      }
      $scope.functions.save(
        $scope.data.saveData,
        $scope.saveSuccessful,
        $scope.saveFailed        
      );      
    } else {
      // If there's no save function, re-enable the button
      $scope.isSaveButtonDisabled = false;
    }
  };

  $scope.saveSuccessful = function (result) {
    $scope.isSaveButtonDisabled = false;
    $scope.data.saveData = result.Value;
    var saveData = $scope.data.saveData;
    if (!_.isNil(saveData)) {
      if (saveData.Profile) {
        saveData.Profile.PersonAccount = ctrl.PersonAccount;
      }
    }
    patientValidationFactory.SetPatientProfileData(saveData);
    if ($scope.functions.afterSuccess) {
      $scope.functions.afterSuccess(result);
    }

    $scope.data.originalData = angular.copy($scope.data.saveData);

    $scope.flags.editing = false;    
  };

  $scope.saveFailed = function (error) {
    $scope.isSaveButtonDisabled = false;
    if ($scope.functions.afterError) {
      $scope.functions.afterError(error);
    }    
  };

  // When defaultExpanded property is set to true from any controller having this directive, expand the panel
  $scope.$watch('defaultExpanded', function (nv, ov) {
    if (nv !== ov && nv === true) {
      //$scope.activateEdit();
      $scope.openEditPersonalModal();
    }
  });

  $scope.contactInfoUpdateCancelled = function () {
    $scope.data.saveData = $scope.data.originalData;
  };
}

PanelCtrl.prototype = Object.create(BaseCtrl.prototype);
