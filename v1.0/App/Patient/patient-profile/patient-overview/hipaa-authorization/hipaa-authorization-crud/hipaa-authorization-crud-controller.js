'use strict';
angular.module('Soar.Patient').controller('HipaaAuthorizationCrudController', [
  '$scope',
  '$rootScope',
  '$filter',
  'ListHelper',
  'localize',
  '$timeout',
  '$routeParams',
  'HipaaAuthorizationFactory',
  'ModalFactory',
  'toastrFactory',
  'tabLauncher',
  '$window',
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
    hipaaAuthorizationFactory,
    modalFactory,
    toastrFactory,
    tabLauncher,
    $window,
    patSecurityService,
    $location,
    userSettingsDataService
  ) {
    var ctrl = this;
    $scope.formTitle = 'New HIPAA Authorization Form';
    $scope.signatureTitle = 'Patient Signature:';
    $scope.loadingHipaaAuthorizationForm = true;
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
    $scope.formSections = hipaaAuthorizationFactory.NewHipaaAuthorizationForm;
    $scope.defaultDate = moment().format('MM/DD/YYYY');
    $scope.forViewing = hipaaAuthorizationFactory.ViewingForm;
    $scope.lblCancel = $scope.forViewing ? 'Close' : 'Cancel';

    //#region access

    ctrl.getAccess = function () {
      $scope.access = hipaaAuthorizationFactory.access();
      if (!$scope.access.View) {
        toastrFactory.error(
          patSecurityService.generateMessage('soar-per-perhst-view'),
          'Not Authorized'
        );
        event.preventDefault();
        $location.path(_.escape('/'));
      }
    };
    ctrl.getAccess();

    //#endregion

    ctrl.$onInit = function () {
      $scope.patientInfo = {};
      $scope.patientInfo.PatientId = $scope.$parent.patientId;
      $scope.loadingHipaaAuthorizationForm = true;
      ctrl.setFormViewState();
      //ctrl.setViewOrUpdate();
    };

    //ctrl.setViewOrUpdate = function () {
    //    if (hipaaAuthorizationFactory.UpdatingForm) {
    //        $scope.inputIsDisabled = false;
    //    } else {
    //        $scope.inputIsDisabled = true;
    //    }
    //};

    ctrl.getHipaaAuthorizationForm = function getHipaaAuthorizationorm() {
      var hasForm = !!hipaaAuthorizationFactory.ActiveHipaaAuthorizationForm;
      var viewOnly = !hipaaAuthorizationFactory.UpdatingForm;
      var canUpdateCurrent = hipaaAuthorizationFactory.UpdatingForm && hasForm;

      if ((viewOnly && hasForm) || canUpdateCurrent) {
        return angular.copy(
          hipaaAuthorizationFactory.ActiveHipaaAuthorizationForm
        );
      }

      // No form, render blank
      return angular.copy(hipaaAuthorizationFactory.NewHipaaAuthorizationForm);
    };

    ctrl.setHipaaAuthForm = function setHipaaAuthForm() {
      $scope.hipaaAuthorizationForm = ctrl.getHipaaAuthorizationForm();
    };

    ctrl.setFormCurrency = function setFormCurrency() {
      hipaaAuthorizationFactory
        .getSummariesByPatientId($scope.$parent.patientId)
        .then(function (res) {
          var mostRecentFormSummary = $filter('orderBy')(
            res.Value,
            'DateModified',
            true
          )[0];
          if (!mostRecentFormSummary) {
            $scope.isCurrentForm = true;
          } else {
            $scope.isCurrentForm =
              !!$scope.hipaaAuthorizationForm.DateModified.match(
                mostRecentFormSummary.DateModified
              );
          }
        });
    };

    ctrl.setFormViewState = function () {
      $scope.loadingHipaaAuthorizationForm = false;

      if (hipaaAuthorizationFactory.ViewingForm) {
        $scope.formTitle = 'View HIPAA Authorization Form';
        ctrl.setHipaaAuthForm();
        ctrl.backupForm();
        //ctrl.setFormCurrency();
        //ctrl.setFormSectionItemClassState();
        $scope.disableNoToAll = false;
        hipaaAuthorizationFactory.SetDataChanged(false);
        $scope.dataHasChanged = false;
        $scope.defaultDate = moment(
          $scope.formSections.FormSections[3].FormSectionItems[0].FormBankItem
            .Answer
        ).format('MM/DD/YYYY');
      } else {
        $scope.formTitle = 'New HIPAA Authorization Form';
        ctrl.setHipaaAuthForm();
        //ctrl.setFormCurrency();
        //ctrl.setFormSectionItemClassState();
      }
    };

    ctrl.backupForm = function () {
      $scope.hipaaAuthorizationFormBackup = angular.copy(
        $scope.hipaaAuthorizationForm
      );
    };

    //#region close form

    // final closing function
    //ctrl.closeForm = function () {
    //    if (hipaaAuthorizationFactory.UpdatingForm) {
    //        hipaaAuthorizationFactory.SetDataChanged(false)
    //        $scope.dataHasChanged = false;
    //        hipaaAuthorizationFactory.SetUpdatingForm(false);
    //    }
    //    hipaaAuthorizationFactory.SetViewingForm(false);
    //    $scope.viewSettings.expandView = false;
    //    $scope.viewSettings.activeExpand = 0;
    //}

    // handle close click function
    $scope.close = function () {
      $scope.formSections = $scope.formSections;
      if ($scope.dataHasChanged) {
        ctrl.confirmCancel();
      } else {
        $window.close();
      }
    };

    ctrl.confirmCancel = function () {
      modalFactory.CancelModal().then(function () {
        $window.close();
      });
    };

    ctrl.hasChanges = function () {
      return $scope.dataHasChanged;
    };

    //#endregion
    //#region validate form
    $scope.validateForm = function () {
      $scope.hasErrors = false;
      // check the validation on the form, top level will catch all error due to shared scope
      $scope.hasErrors = !$scope.frmHipaaAuthorization.$valid;

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
      //update date in profile view page
      window.opener.$windowScope.updateHipaaDate(moment().format('MM/DD/YYYY'));
      // load res values to form and then store in current form
      var formAnswers = res.Value;

      $scope.hipaaAuthorizationForm.DateModified = formAnswers.DateModified;
      $scope.hipaaAuthorizationForm.DataTag = formAnswers.DateTag;

      // if successful set the active form to this one
      // if successful set the active form to this one
      hipaaAuthorizationFactory.SetActiveHipaaAuthorizationForm(
        $scope.hipaaAuthorizationForm
      );
      // reset backup
      ctrl.backupForm();
      $scope.savingForm = false;
      // reset form
      hipaaAuthorizationFactory.SetUpdatingForm(false);
      hipaaAuthorizationFactory.SetDataChanged(false);

      // notify timeline
      //$rootScope.$broadcast('soar:hipaa-authorization-form-created', $scope.hipaaAuthorizationForm);

      $scope.dataHasChanged = false;
      //$scope.viewSettings.expandView = false;
      //$scope.viewSettings.activeExpand = 0;
      $window.close();
    };

    ctrl.persistHAF = function () {
      $scope.SignatureDetails.FormSectionItems[0].FormBankItem.Answer = moment(
        $scope.defaultDate
      ).format('MM/DD/YYYY');
      $scope.hipaaAuthorizationForm.FormSections[0] = $scope.ProviderDetails;
      $scope.hipaaAuthorizationForm.FormSections[1] = $scope.PatientDetails;
      $scope.hipaaAuthorizationForm.FormSections[2] = $scope.FormDetails;
      $scope.hipaaAuthorizationForm.FormSections[3] = $scope.SignatureDetails;

      hipaaAuthorizationFactory.SetActiveHipaaAuthorizationForm(
        $scope.hipaaAuthorizationForm
      );
      hipaaAuthorizationFactory
        .save($scope.$parent.patientId, $scope.hipaaAuthorizationForm)
        .then(function (res) {
          ctrl.postSaveCleanup(res);
        });
    };

    $scope.saveHipaaAuthorization = function () {
      $scope.validateForm();
      if (!$scope.hasErrors) {
        // persist the hipaa-authorization form
        $scope.savingForm = true;
        if ($scope.access.Create) {
          if ($scope.hipaaAuthorizationForm.FileAllocationId) {
            // if FileAllocationId is already set, they have used the signature directive to sign digitally
            // no need to prompt them to upload a signed mhf
            ctrl.persistHAF();
          } else {
            // give them the option to upload a scanned form before saving
            ctrl.openSigUploader();
          }
        }
      }
    };

    //#endregion

    //#region watch for changes
    $scope.$watch(
      'ProviderDetails',
      function (nv, ov) {
        if (nv && ov && nv != ov) {
          //$scope.dataHasChanged = ($scope.hipaaAuthorizationForm != $scope.hipaaAuthorizationFormBackup)
          //hipaaAuthorizationFactory.SetDataChanged($scope.dataHasChanged)
          $scope.dataHasChanged = true;
        }
      },
      true
    );
    $scope.$watch(
      'PatientDetails',
      function (nv, ov) {
        if (nv && ov && nv != ov) {
          $scope.dataHasChanged = true;
        }
      },
      true
    );
    $scope.$watch(
      'FormDetails',
      function (nv, ov) {
        if (nv && ov && nv != ov) {
          $scope.dataHasChanged = true;
        }
      },
      true
    );
    $scope.$watch(
      'SignatureDetails',
      function (nv, ov) {
        if (nv && ov && nv != ov) {
          $scope.dataHasChanged = true;
        }
      },
      true
    );

    $scope.FormDetailHeaders1 = [
      '*** AUTHORIZATION FOR RELEASE OF IDENTIFYING HEALTH INFORMATION ***',
      'I authorize the professional office of my dentist named above to release health information identifying me [including if applicable, information about HIV infection or AIDS, information about substance abuse treatment, and information about mental health services] under the following terms and conditions:',
    ];

    $scope.FormDetailHeaders2 = [
      'It is completely your decision whether to sign this authorization form. We cannot refuse to treat you if you choose not to sign this authorization.',
      'If you sign this authorization, you can revoke it later. The only exception to your right to revoke is if we have already acted in reliance upon the authorization. If you want to revoke your authorization, send us a written or electronic note telling us that your authorization is revoked.',
      'Send this note to the office contact person listed at the top of this form. When your health information is disclosed as provided in this authorization, the recipient often has no legal duty to protect its confidentiality. In many cases, the recipient may re-disclose the information as he/she wishes. Sometimes, state or federal law changes this possibility.',
      '[For marketing authorizations, include, as applicable: We will receive direct or indirect remuneration from a third party for disclosing your identifiable health information in accordance with this authorization.]',
      'I HAVE READ AND UNDERSTAND THIS FORM. I AM SIGNING IT VOLUNTARILY. I AUTHORIZE THE DISCLOSURE OF MY HEALTH INFORMATION AS DESCRIBED IN THIS FORM.',
    ];

    $scope.LocationAddressLabels = [
      'Location Address 1',
      'Location Address 2',
      'City',
      'State',
      'Zip',
    ];

    var ctr = 0;
    ctrl.getFormSections = function () {
      if (hipaaAuthorizationFactory.NewHipaaAuthorizationForm) {
        $scope.formSections =
          hipaaAuthorizationFactory.NewHipaaAuthorizationForm.FormSections;
        $scope.ProviderDetails = $scope.formSections[0];
        $scope.PatientDetails = $scope.formSections[1];
        $scope.FormDetails = $scope.formSections[2];
        $scope.SignatureDetails = $scope.formSections[3];
      } else if (ctr < 4) {
        $timeout(ctrl.getFormSections, 400);
        ctr++;
      }
    };

    $timeout(ctrl.getFormSections, 800);

    $scope.viewOnly = false;
    $scope.$watch(
      function () {
        return hipaaAuthorizationFactory.ViewingForm;
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

    $scope.closeSigUploader = function (uploadAttempted, fileAllocationId) {
      $scope.hipaaAuthorizationForm.FileAllocationId = fileAllocationId;
      if (uploadAttempted === true) {
        if ($scope.hipaaAuthorizationForm.FileAllocationId !== null) {
          // file was uploaded successfully
          $scope.sigUploader.close();
          ctrl.persistHAF();
        } else {
          // there was an error when attempting to upload, showing toastr and leaving uploader open
          toastrFactory.error(
            localize.getLocalizedString(
              'Failed to upload the HIPAA Authorization Form. Refresh the page to try again.'
            ),
            localize.getLocalizedString('Error')
          );
        }
      } else {
        // they chose not to upload
        $scope.sigUploader.close();
        //ctrl.persistHAF();
      }
    };

    ctrl.openSigUploader = function () {
      $scope.sigUploader.content(
        '<hipaa-authorization-uploader close="closeSigUploader(uploadAttempted, fileAllocationId)"><hipaa-authorization-uploader>'
      );
      $scope.sigUploader.setOptions({
        resizable: false,
        position: {
          top: '13%',
          left: '35%',
        },
        minWidth: 450,
        scrollable: false,
        iframe: false,
        actions: [],
        title: localize.getLocalizedString(
          'Please capture signature of Patient.'
        ),
        modal: true,
      });
      $scope.sigUploader.open();
    };

    //#endregion

    //#region toggle form state

    $scope.renderUpdateView = function () {
      hipaaAuthorizationFactory.SetUpdatingForm(true);
      hipaaAuthorizationFactory.SetViewingForm(false);
      $scope.inputIsDisabled = true;

      ctrl.setFormViewState();
    };

    $scope.printHipaaAuthorization = function printHipaaAuthorization() {
      let patientPath = '#/Patient/';
      tabLauncher.launchNewTab(
        patientPath +
          $scope.$parent.patientId +
          '/Clinical/HipaaAuthorizationForm/current'
      );
    };

    // Handle view toggling from patient's clinical timeline
    $scope.$watch(
      function didActiveFormChange() {
        return hipaaAuthorizationFactory.ActiveHipaaAuthorizationForm;
      },
      function onFormChange(nv, ov) {
        if (nv && ov) {
          if (nv.DateModified !== ov.DateModified) {
            ctrl.setFormViewState();
          }
        }
      }
    );

    //#endregion
  },
]);
