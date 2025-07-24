'use strict';
angular.module('Soar.Patient').controller('PatientWatchCrudController', [
  '$scope',
  '$routeParams',
  'toastrFactory',
  'localize',
  'tooth',
  'personId',
  'providers',
  'PatientServices',
  'patientWatchId',
  'patientWatches',
  'viewOnly',
  '$uibModalInstance',
  '$uibModal',
  'ModalFactory',
  'ListHelper',
  '$filter',
  function (
    $scope,
    $routeParams,
    toastrFactory,
    localize,
    tooth,
    personId,
    providers,
    patientServices,
    patientWatchId,
    patientWatches,
    viewOnly,
    $uibModalInstance,
    modal,
    modalFactory,
    listHelper,
    $filter
  ) {
    //#region initialization
    var ctrl = this;
    $scope.editMode = false;
    $scope.patientWatchId = patientWatchId;
    $scope.viewOnly = viewOnly;
    $scope.editableDate = false;
    $scope.selectedProviderInactive = false;

    // determine editMode
    $scope.isEditMode = function () {
      if ($scope.patientWatchId != null) {
        $scope.editMode = true;
      }
    };
    $scope.isEditMode();

    $scope.savingForm = false;
    $scope.canCloseModal = true;
    $scope.maxDate = moment(new Date(2115, 12, 31, 23, 59, 59, 999));
    $scope.formIsValid = false;
    $scope.hasErrors = false;

    $scope.providers = $filter('filter')(providers, function (provider) {
      return provider.ProviderTypeId == 1 || provider.ProviderTypeId == 2;
    });
    $scope.personId = personId;

    $scope.setSelectedTooth = function () {
      if (tooth != null || tooth != undefined) {
        $scope.selectedTooth = tooth;
      } else {
        $scope.selectedTooth = null;
      }
    };
    $scope.setSelectedTooth();

    $scope.patientWatches = patientWatches;

    $scope.newPatientWatch = {
      PatientId: $scope.personId,
      WatchId: null,
      ProviderId: null,
      Date: new Date(),
      ToothNumber: $scope.selectedTooth,
      Surface: null,
      Root: null,
      Notes: null,
    };

    //#endregion

    //#region getPatientWatch
    ctrl.getPatientWatch = function (watchId) {
      patientServices.PatientWatch.get(
        { Id: $scope.personId, watchId: watchId },
        ctrl.patientWatchGetSuccess,
        ctrl.patientWatchGetFailure
      );
    };

    ctrl.patientWatchGetSuccess = function (res) {
      $scope.patientWatch = res.Value;
      ctrl.originalWatch = angular.copy($scope.patientWatch);
    };

    ctrl.patientWatchGetFailure = function () {
      toastrFactory.error(
        localize.getLocalizedString('.'),
        localize.getLocalizedString('Server Error')
      );
    };

    //#endregion

    //#region initialize patient watch
    $scope.patientWatch = {};
    if ($scope.patientWatchId == null) {
      $scope.patientWatch = $scope.newPatientWatch;
      ctrl.originalWatch = angular.copy($scope.patientWatch);
    } else {
      ctrl.getPatientWatch($scope.patientWatchId);
    }

    //#endregion

    //#region save patient watch

    $scope.savePatientWatch = function () {
      ctrl.validateForm();
      $scope.hasErrors = !$scope.formIsValid;

      if (!$scope.hasErrors) {
        $scope.savingForm = true;

        // create or update a watch
        if ($scope.editMode) {
          patientServices.PatientWatch.update(
            { Id: $scope.patientWatch.PatientId },
            $scope.patientWatch,
            ctrl.savePatientWatchSuccess,
            ctrl.savePatientWatchFailed
          );
        } else {
          patientServices.PatientWatch.save(
            { Id: $scope.patientWatch.PatientId },
            $scope.patientWatch,
            ctrl.savePatientWatchSuccess,
            ctrl.savePatientWatchFailed
          );
        }
      }
    };

    ctrl.savePatientWatchSuccess = function (res) {
      $scope.patientWatch = res.Value;
      $scope.savingForm = false;
      $scope.canCloseModal = true;

      if ($scope.editMode) {
        toastrFactory.success(
          localize.getLocalizedString('Your patient watch') +
            ' ' +
            localize.getLocalizedString('has been saved'),
          localize.getLocalizedString('Success')
        );
      } else {
        toastrFactory.success(
          localize.getLocalizedString('Your patient watch') +
            ' ' +
            localize.getLocalizedString('has been created'),
          localize.getLocalizedString('Success')
        );
      }
      $scope.closeModal();
    };

    ctrl.savePatientWatchFailed = function () {
      $scope.savingForm = false;
      if ($scope.editMode) {
        toastrFactory.error(
          localize.getLocalizedString('There was an error while saving') +
            ' ' +
            localize.getLocalizedString('your patient watch'),
          localize.getLocalizedString('Server Error')
        );
      } else {
        toastrFactory.error(
          localize.getLocalizedString('There was an error while adding') +
            ' ' +
            localize.getLocalizedString('your patient watch'),
          localize.getLocalizedString('Server Error')
        );
      }
    };

    //#endregion

    // Check that tooth not already being watched
    ctrl.CheckTooth = function () {
      if ($scope.patientWatch.ToothNumber != null) {
        var item = listHelper.findItemByFieldValueIgnoreCase(
          $scope.patientWatches,
          'Tooth',
          $scope.patientWatch.ToothNumber.toString()
        );
        $scope.duplicateWatch =
          item != null && item.RecordId != $scope.patientWatch.WatchId;
      } else {
        $scope.duplicateWatch = false;
      }
    };
    // looking to see if tooth already has a watch on load
    if (!$scope.editMode) {
      ctrl.CheckTooth();
    }

    //#region validation
    ctrl.validateForm = function () {
      if (
        $scope.patientWatch &&
        $scope.patientWatch.ToothNumber &&
        !$scope.selectedProviderInactive
      ) {
        $scope.formIsValid = !$scope.duplicateWatch;
      } else {
        $scope.formIsValid = false;
      }
    };
    ctrl.validateForm();

    // validate the watch
    $scope.$watch(
      'patientWatch',
      function (nv, ov) {
        if (nv && nv != ov) {
          // only checking for an existing watch when not in edit mode
          if ($scope.patientWatch.ToothNumber == undefined) {
            $scope.patientWatch.ToothNumber = null;
          }
          if (
            $scope.patientWatch.Notes == undefined ||
            $scope.patientWatch.Notes == ''
          ) {
            $scope.patientWatch.Notes = null;
          }
          if (
            $scope.patientWatch.Surface == undefined ||
            $scope.patientWatch.Surface == ''
          ) {
            $scope.patientWatch.Surface = null;
          }
          if (
            $scope.patientWatch.Root == undefined ||
            $scope.patientWatch.Root == ''
          ) {
            $scope.patientWatch.Root = null;
          }
          if (
            $scope.patientWatch.Root == undefined ||
            $scope.patientWatch.Root == ''
          ) {
            $scope.patientWatch.Root = null;
          }

          ctrl.CheckTooth();

          ctrl.validateForm();
          if ($scope.canCloseModal == true) {
            $scope.canCloseModal = false;
          }
        }
      },
      true
    );

    // validating the form in case the user has selected an inactive provider
    $scope.$watch(
      'selectedProviderInactive',
      function (nv, ov) {
        if (nv && nv != ov) {
          ctrl.validateForm();
        }
      },
      true
    );

    //#endregion

    //#region handle close

    // close and pass saved patient watch
    $scope.closeModal = function () {
      $uibModalInstance.close($scope.patientWatch);
    };

    // close dialog on Done
    $scope.closeAddPatientWatchTooth = function () {
      //return patient watch on save...
      $uibModalInstance.close($scope.patientWatch);
    };

    // close dialog on cancel
    $scope.showCancelModal = function () {
      modalFactory.CancelModal().then($scope.confirmCancel);
    };

    $scope.confirmCancel = function () {
      $uibModalInstance.close(null);
    };

    $scope.cancelChanges = function () {
      if ($scope.viewOnly) {
        $uibModalInstance.close(null);
      } else {
        $scope.canCloseModal =
          ctrl.originalWatch.Note == $scope.patientWatch.Note &&
          ctrl.originalWatch.ToothNumber == $scope.patientWatch.ToothNumber &&
          ctrl.originalWatch.Root == $scope.patientWatch.Root &&
          ctrl.originalWatch.Surface == $scope.patientWatch.Surface &&
          ctrl.originalWatch.ProviderId == $scope.patientWatch.ProviderId;
        if ($scope.canCloseModal) {
          $uibModalInstance.close(null);
        } else {
          modalFactory.CancelModal().then($scope.confirmCancel);
        }
      }
    };

    //#endregion
  },
]);
