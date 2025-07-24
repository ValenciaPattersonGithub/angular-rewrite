'use strict';
angular.module('Soar.Patient').controller('MedicalHistoryCrudController', [
  '$scope',
  '$rootScope',
  '$filter',
  'ListHelper',
  'localize',
  '$timeout',
  '$routeParams',
  'MedicalHistoryFactory',
  'ModalFactory',
  'toastrFactory',
  'tabLauncher',
  'patSecurityService',
  '$location',
  'userSettingsDataService',
  function (
    $scope,
    $rootScope,
    $filter,
    listHelper,
    localize,
    $timeout,
    $routeParams,
    medicalHistoryFactory,
    modalFactory,
    toastrFactory,
    tabLauncher,
    patSecurityService,
    $location,
    userSettingsDataService
  ) {
    var ctrl = this;
    $scope.formTitle = 'Update Medical History';
    $scope.signatureTitle = 'Signature of Patient/Legal Guardian';
    $scope.loadingMedicalHistoryForm = true;
    $scope.isCurrentForm = false;
    // disable buttons
    $scope.disableCancel = false;
    // turn off editing of questions on preview form
    $scope.canEditForm = false;
    // turn on/off input on form (off for viewing)
    $scope.inputIsDisabled = true;
    // capture changes
    $scope.hasChanges = false;
    $scope.disableNoToAll = true;

    //#region access

    ctrl.getAccess = function () {
      $scope.access = medicalHistoryFactory.access();
      if (!$scope.access.View) {
        toastrFactory.error(
          patSecurityService.generateMessage('soar-per-perhst-view'),
          'Not Authorized'
        );
        event.preventDefault();
        $location.path('/');
      }
    };
    ctrl.getAccess();

    //#endregion

    ctrl.$onInit = function () {
      $scope.loadingMedicalHistoryForm = true;
      ctrl.setFormViewState();
      ctrl.setViewOrUpdate();
    };

    ctrl.setViewOrUpdate = function () {
      if (medicalHistoryFactory.UpdatingForm) {
        $scope.inputIsDisabled = false;
      } else {
        $scope.inputIsDisabled = true;
      }
    };

    ctrl.getMedicalHistoryForm = function getMedicalHistoryForm() {
      var hasForm = !!medicalHistoryFactory.ActiveMedicalHistoryForm;
      var viewOnly = !medicalHistoryFactory.UpdatingForm;
      var canUpdateCurrent = medicalHistoryFactory.UpdatingForm && hasForm;

      if ((viewOnly && hasForm) || canUpdateCurrent) {
        return angular.copy(medicalHistoryFactory.ActiveMedicalHistoryForm);
      }

      // No form, render blank
      return angular.copy(medicalHistoryFactory.NewMedicalHistoryForm);
    };

    ctrl.setMedHistoryForm = function setMedHistoryForm() {
      $scope.medicalHistoryForm = ctrl.getMedicalHistoryForm();
    };

    ctrl.setFormCurrency = function setFormCurrency() {
      medicalHistoryFactory
        .getSummariesByPatientId($scope.patientInfo.PatientId)
        .then(function (res) {
          var mostRecentFormSummary = $filter('orderBy')(
            res.Value,
            'DateModified',
            true
          )[0];
          if (!mostRecentFormSummary) {
            $scope.isCurrentForm = true;
          } else {
            // .match() handles case where $scope.medicalHistoryForm.DateModified has trailing 'z' for zulu
            $scope.isCurrentForm =
              !!$scope.medicalHistoryForm.DateModified.match(
                mostRecentFormSummary.DateModified
              );
          }
        });
    };

    ctrl.setFormViewState = function () {
      $scope.loadingMedicalHistoryForm = false;

      if (medicalHistoryFactory.UpdatingForm) {
        $scope.formTitle = 'Update Medical History';
        ctrl.setMedHistoryForm();
        // if we are updating an existing medicalHistoryForm we need to set the AllocationId to null
        // because the signature from the previous original form would not be valid for the updated one
        // A new signature would be needed for this to be a signed document
        $scope.medicalHistoryForm.FileAllocationId = null;
        ctrl.backupForm();
        ctrl.setFormCurrency();
        ctrl.setFormSectionItemClassState();
        $scope.disableNoToAll = false;
        medicalHistoryFactory.SetDataChanged(false);
        $scope.dataHasChanged = false;
        ctrl.setViewOrUpdate();
      } else {
        // viewing only state of current or previous MHF
        $scope.formTitle = 'Medical History';
        ctrl.setMedHistoryForm();
        ctrl.setFormCurrency();
        ctrl.setFormSectionItemClassState();
      }
    };

    ctrl.setFormSectionItemClassState =
      function setFormSectionItemClassState() {
        // need this in order to display MHFs and Notes Templates differently
        angular.forEach($scope.medicalHistoryForm.FormSections, function (fs) {
          fs.$$isMHF = true;
          angular.forEach(fs.FormSectionItems, function (fsi) {
            fsi.$$isMHF = true;
          });
        });
      };

    ctrl.backupForm = function () {
      $scope.medicalHistoryFormBackup = angular.copy($scope.medicalHistoryForm);
    };

    //#region close form

    // final closing function
    ctrl.closeForm = function () {
      if (medicalHistoryFactory.UpdatingForm) {
        medicalHistoryFactory.SetDataChanged(false);
        $scope.dataHasChanged = false;
        medicalHistoryFactory.SetUpdatingForm(false);
      }
      $scope.$emit('medical-history-changed', false);
      medicalHistoryFactory.SetViewingForm(false);
      $scope.viewSettings.expandView = false;
      $scope.viewSettings.activeExpand = 0;
    };

    // handle close click function
    $scope.close = function () {
      if (medicalHistoryFactory.UpdatingForm && $scope.dataHasChanged) {
        ctrl.confirmCancel();
      } else {
        ctrl.closeForm();
      }
    };

    ctrl.confirmCancel = function () {
      modalFactory.CancelModal().then(function () {
        ctrl.closeForm();
      });
    };

    ctrl.hasChanges = function () {
      return $scope.dataHasChanged;
    };

    // update the PatientDashboard variable until we find a better way to do a global discard
    $scope.$watch(
      function () {
        return medicalHistoryFactory.DataChanged;
      },
      function (nv) {
        // notify DataChanged state
        $scope.$emit('medical-history-changed', nv);
      }
    );

    //#endregion
    //#region validate form
    $scope.validateForm = function () {
      $scope.hasErrors = false;
      // check the validation on the form, top level will catch all error due to shared scope
      $scope.hasErrors = !$scope.frmMedicalHistory.$valid;

      if ($scope.hasErrors) {
        // set the focus on the first error type input
        var firstInvalidElement = angular.element('input.ng-invalid').first();
        if (firstInvalidElement.length > 0) {
          angular.element('input.ng-invalid').first().focus();
        } else {
          var firstInvalidElement = angular
            .element('textarea.ng-invalid')
            .first();
          if (firstInvalidElement.length > 0) {
            angular.element('textarea.ng-invalid').first().focus();
          }
        }
      }
      return $scope.hasErrors;
    };

    //#endregion

    //#region save form

    ctrl.postSaveCleanup = function (res) {
      // load res values to form and then store in current form
      var formAnswers = res.Value;

      $scope.medicalHistoryForm.DateModified = formAnswers.DateModified;
      $scope.medicalHistoryForm.DataTag = formAnswers.DateTag;
      $scope.medicalHistoryForm.FileAllocationId = formAnswers.FileAllocationId;

      // if successful set the active form to this one
      // if successful set the active form to this one
      medicalHistoryFactory.SetActiveMedicalHistoryForm(
        $scope.medicalHistoryForm
      );
      // reset backup
      ctrl.backupForm();
      $scope.savingForm = false;
      // reset form
      medicalHistoryFactory.SetUpdatingForm(false);
      medicalHistoryFactory.SetDataChanged(false);
      $scope.$emit('medical-history-changed', false);

      // notify timeline
      $rootScope.$broadcast(
        'soar:medical-history-form-created',
        $scope.medicalHistoryForm
      );

      $scope.dataHasChanged = false;
      $scope.viewSettings.expandView = false;
      $scope.viewSettings.activeExpand = 0;
    };

    ctrl.persistMHF = function () {
      medicalHistoryFactory.SetActiveMedicalHistoryForm(
        $scope.medicalHistoryForm
      );
      medicalHistoryFactory
        .save($scope.patientInfo.PatientId, $scope.medicalHistoryForm)
        .then(function (res) {
          ctrl.postSaveCleanup(res);
        });
    };

    $scope.saveMedicalHistory = function () {
      $scope.validateForm();
      if (!$scope.hasErrors) {
        // persist the medical history form
        $scope.savingForm = true;
        if ($scope.access.Create) {
          if ($scope.medicalHistoryForm.FileAllocationId) {
            // if FileAllocationId is already set, they have used the signature directive to sign digitally
            // no need to prompt them to upload a signed mhf
            ctrl.persistMHF();
          } else {
            // give them the option to upload a scanned form before saving
            ctrl.openMHFUploader();
          }
        }
      }
    };

    //#endregion

    //#region watch for changes
    $scope.$watch(
      'medicalHistoryForm',
      function (nv, ov) {
        if (nv && ov && nv != ov) {
          $scope.dataHasChanged =
            $scope.medicalHistoryForm != $scope.medicalHistoryFormBackup;
          medicalHistoryFactory.SetDataChanged($scope.dataHasChanged);
        }
      },
      true
    );

    $scope.noToAll = function () {
      $scope.disableNoToAll = true;
      medicalHistoryFactory.SetYesNoToNo($scope.medicalHistoryForm);
    };

    $scope.viewOnly = false;
    $scope.$watch(
      function () {
        return medicalHistoryFactory.ViewingForm;
      },
      function (nv) {
        $scope.viewOnly = nv;
        ctrl.setFormViewState();
      }
    );

    //#endregion

    // NICE TO HAVE  localize everything in custom form

    // TODO amfa's to create ...

    //#region upload

    $scope.closeMHFUploader = function (uploadAttempted, fileAllocationId) {
      $scope.medicalHistoryForm.FileAllocationId = fileAllocationId;
      if (uploadAttempted === true) {
        if ($scope.medicalHistoryForm.FileAllocationId !== null) {
          // file was uploaded successfully
          $scope.mhfUploader.close();
          ctrl.persistMHF();
        } else {
          // there was an error when attempting to upload, showing toastr and leaving uploader open
          toastrFactory.error(
            localize.getLocalizedString(
              'Failed to upload the Medical History Form. Refresh the page to try again.'
            ),
            localize.getLocalizedString('Error')
          );
        }
      } else {
        // they chose not to upload
        $scope.mhfUploader.close();
        ctrl.persistMHF();
      }
    };

    ctrl.openMHFUploader = function () {
      $scope.mhfUploader.content(
        '<medical-history-uploader close="closeMHFUploader(uploadAttempted, fileAllocationId)"><medical-history-uploader>'
      );
      $scope.mhfUploader.setOptions({
        resizable: false,
        position: {
          top: '35%',
          left: '35%',
        },
        minWidth: 450,
        scrollable: false,
        iframe: false,
        actions: [],
        title: localize.getLocalizedString(
          'Upload or Scan a Signed Medical History Form'
        ),
        modal: true,
      });
      $scope.mhfUploader.open();
    };

    //#endregion

    //#region toggle form state

    $scope.renderUpdateView = function () {
      medicalHistoryFactory.SetUpdatingForm(true);
      medicalHistoryFactory.SetViewingForm(false);
      $scope.inputIsDisabled = true;

      ctrl.setFormViewState();
    };

    $scope.printMedicalHistory = function printMedicalHistory() {
      let patientPath = '#/Patient/';
      tabLauncher.launchNewTab(
        _.escape(
          patientPath +
            $scope.patientInfo.PatientId +
            '/Clinical/MedicalHistoryForm/current'
        )
      );
    };

    // Handle view toggling from patient's clinical timeline
    $scope.$watch(
      function didActiveFormChange() {
        return medicalHistoryFactory.ActiveMedicalHistoryForm;
      },
      function onFormChange(nv, ov) {
        if (nv.DateModified !== ov.DateModified) {
          ctrl.setFormViewState();
        }
      }
    );

    //#endregion
  },
]);
