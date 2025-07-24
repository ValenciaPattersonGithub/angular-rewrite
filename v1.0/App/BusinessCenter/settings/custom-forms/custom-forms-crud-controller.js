'use strict';

var app = angular.module('Soar.BusinessCenter');

var CustomFormsControl = app.controller('CustomFormsController', [
  '$scope',
  'CustomFormsService',
  'UniqueCustomFormNameService',
  'toastrFactory',
  '$uibModal',
  'localize',
  '$timeout',
  '$animate',
  'CustomFormsPublishService',
  'ObjectService',
  'patSecurityService',
  '$location',
  'CustomFormsFactory',
  function (
    $scope,
    customFormsService,
    uniqueCustomFormNameService,
    toastrFactory,
    $uibModal,
    localize,
    $timeout,
    $animate,
    customFormsPublishService,
    objectService,
    patSecurityService,
    $location,
    customFormsFactory
  ) {
    var ctrl = this;

    //#region Authorization
    ctrl.authViewAccess = function () {
      return patSecurityService.IsAuthorizedByAbbreviation(
        'soar-biz-bcform-view'
      );
    };

    ctrl.authCreateAccess = function () {
      return patSecurityService.IsAuthorizedByAbbreviation(
        'soar-biz-bcform-add'
      );
    };

    ctrl.authEditAccess = function () {
      return patSecurityService.IsAuthorizedByAbbreviation(
        'soar-biz-bcform-edit'
      );
    };

    ctrl.authAccess = function () {
      $scope.hasViewAccess = ctrl.authViewAccess();
      $scope.hasEditAccess = ctrl.authEditAccess();
      $scope.hasCreateAccess = ctrl.authCreateAccess();

      if (
        !$scope.hasViewAccess ||
        !$scope.hasEditAccess ||
        !$scope.hasCreateAccess
      ) {
        toastrFactory.error(
          'User is not authorized to access this area.',
          'Not Authorized'
        );
        $location.path('/');
      }
    };

    ctrl.authAccess();
    //#endregion

    //Controller level variables
    $scope.sectionUIIndex = 1;
    $scope.showUniqueFormMessage = true;
    $scope.oneAtATime = true;
    $scope.showCustomSidebar = 'hidediv';
    $scope.customSidebarCollapse = true;
    $scope.saveAndDoPublish = false;
    $scope.saveAndDoNotPublish = false;
    $scope.customFormActual = {};

    $scope.modalIsOpen = false;
    $scope.modalDismissed = function () {
      $scope.modalIsOpen = false;
    };

    //check if any field in the form has been updated by user
    $scope.checkIfFormDataHasChanged = function () {
      $scope.customFormActual = angular.copy($scope.customForm);
      $scope.initialComparison = angular.equals(
        $scope.customForm,
        $scope.customFormActual
      );
      $scope.dataHasChanged = angular.copy($scope.initialComparison);
    };

    // Initialize custom form object
    $scope.initializeForm = function () {
      $scope.customForm = {
        FormId: '00000000-0000-0000-0000-000000000000',
        VersionNumber: 1,
        SourceFormId: '00000000-0000-0000-0000-000000000000',
        FormName: '',
        Description: '',
        IsActive: true,
        IsVisible: true,
        IsPublished: false,
        IsDefault: false,
        FormSections: [],
        IndexOfSectionInEditMode: -1,
        SectionValidationFlag: false,
        SectionCopyValidationFlag: -1,
        TemplateMode: 1,
      };

      //check if any field in the form has been updated by user
      $scope.checkIfFormDataHasChanged();
    };

    // Initialize section object
    $scope.initializeSection = function (sectionCount) {
      var formSection = {
        FormSectionId: '00000000-0000-0000-0000-000000000000',
        Title: '',
        FormId: '00000000-0000-0000-0000-000000000000',
        SequenceNumber: sectionCount,
        ShowTitle: true,
        ShowBorder: true,
        IsVisible: true,
        FormSectionItems: [],
      };

      return formSection;
    };

    // Highlight added, copied & moved section
    $scope.$watchCollection(
      'customForm.FormSections.length',
      function (newLength, oldLength) {
        if (newLength === 1 && oldLength === 0) {
          $animate.enabled(false);
        } else {
          $animate.enabled(true);
        }
      }
    );

    $scope.initializeForm();

    // Add blank template with default options
    $scope.addBlankTemplate = function () {
      $scope.toggleSidebarHeader(true);
      $scope.showTemplate = true;

      $scope.initializeForm();

      //Add default option when creating new template
      if ($scope.customForm.FormSections.length === 0) {
        $scope.addSection();
      }

      // Reset focus - Fix for setting focus on Formname input box.
      $timeout(function () {
        angular.element('#customFormName').focus();
      }, 100);

      //check if any field in the form has been updated by user
      $scope.checkIfFormDataHasChanged();
    };

    //Add new section
    $scope.addSection = function () {
      var sectionCount = $scope.customForm.FormSections.length;
      var newSection = $scope.initializeSection(sectionCount);

      if ($scope.customForm.IndexOfSectionInEditMode == -1) {
        $scope.customForm.IndexOfSectionInEditMode =
          $scope.customForm.FormSections.length;
      }

      $scope.customForm.FormSections.push(newSection);

      $timeout(function () {
        if ($scope.customForm.IndexOfSectionInEditMode != -1) {
          angular
            .element(
              '#inpSectionTitle_' + $scope.customForm.IndexOfSectionInEditMode
            )
            .focus();
        }
      }, 0);
    };

    //Edit custom form
    $scope.editCustomForm = function (formId) {
      $scope.getFormById(formId);
    };

    //Call server to get form data by ID
    $scope.getFormById = function (formId) {
      customFormsService.getFormById(
        { formId: formId },
        $scope.customFormsServiceGetFormByIdSuccess,
        $scope.customFormsServiceGetFormByIdFailure
      );
    };

    //Update form controls with received data from server
    $scope.customFormsServiceGetFormByIdSuccess = function (successResponse) {
      $scope.customForm = successResponse.Value;

      customFormsFactory.LoadFormItemTypeNames($scope.customForm);

      if ($scope.customForm.IsPublished) {
        var sourceFormId = $scope.customForm.FormId;
        $scope.customForm.FormName = '';
        $scope.customForm.Description = '';
        $scope.customForm.FormId = '00000000-0000-0000-0000-000000000000';
        $scope.customForm.VersionNumber = 1;
        $scope.customForm.IsPublished = false;
        $scope.customForm.IsActive = true;
        $scope.customForm.IndexOfSectionInEditMode = -1;
        $scope.customForm.SectionValidationFlag = false;
        $scope.customForm.SectionCopyValidationFlag = -1;
        $scope.customForm.SourceFormId = sourceFormId;
        $scope.customForm.TemplateMode = 2;
      } else {
        $scope.customForm.IndexOfSectionInEditMode = -1;
        $scope.customForm.SectionValidationFlag = false;
        $scope.customForm.SectionCopyValidationFlag = -1;
        $scope.customForm.TemplateMode = 3;
        $scope.customForm.IsActive = true;
      }

      $scope.toggleSidebarHeader(true);
      $scope.showTemplate = true;

      //check if any field in the form has been updated by user
      $scope.checkIfFormDataHasChanged();
    };

    $scope.customFormsServiceGetFormByIdFailure = function (errorResponse) {
      toastrFactory.error(
        localize.getLocalizedString(
          'There was an error while attempting to retrieve this template data.'
        ),
        localize.getLocalizedString('Server Error')
      );
    };

    //Delete custom form
    // confirmation dialog - no feedback needed
    $scope.deleteCustomForm = function (formId, formName) {
      $scope.modalIsOpen = true;
      var modalInstance = $uibModal.open({
        templateUrl:
          'App/BusinessCenter/settings/custom-forms/delete-dialog/unpublished-form-delete.html',
        backdrop: 'static',
        keyboard: false,
        controller: 'CustomFormDeleteController',
        size: 'md',
        windowClass: 'center-modal',
        resolve: {
          formId: function () {
            return formId;
          },
          formName: function () {
            return formName;
          },
        },
      });
      modalInstance.result.then(
        $scope.customFormsServiceDeleteResultThenYes,
        $scope.modalDismissed
      );
    };

    //OK callback to handle OK button click from delete modal
    $scope.customFormsServiceDeleteResultThenYes = function (formId, formName) {
      $scope.modalIsOpen = false;
      $scope.deleteFormById(formId);

      // Added to hide background when form in edit is deleted.
      $scope.showTemplate = false;
    };

    //Delete form by id. Form will be hard deleted from database
    $scope.deleteFormById = function (formId) {
      customFormsService.deleteFormById(
        { formId: formId },
        $scope.customFormsServiceDeleteSuccess,
        $scope.customFormsServiceDeleteFailure
      );
    };

    //Handle success callback after form is deleted
    $scope.customFormsServiceDeleteSuccess = function () {
      $scope.getFormsByStatus(false);
    };

    //Handle error callback after form is deleted
    $scope.customFormsServiceDeleteFailure = function () {
      toastrFactory.error(
        localize.getLocalizedString(
          'There was an error while attempting to delete saved template.'
        ),
        localize.getLocalizedString('Server Error')
      );
    };

    //Active or Inactive custom form
    $scope.activeOrInactiveCustomForm = function (formId, status) {
      $scope.activeOrInactiveFormById(formId, status);
    };

    //Activate or inactivate unpublished templates
    $scope.activeOrInactiveFormById = function (formId, status) {
      customFormsService.activeOrInactiveFormById(
        { formId: formId, isActive: status },
        $scope.customFormsServiceActiveOrInactiveSuccess,
        $scope.customFormsServiceActiveOrInactiveFailure
      );
    };

    //Success callback to handle activation or deactivation
    $scope.customFormsServiceActiveOrInactiveSuccess = function () {
      $scope.getFormsByStatus(true);
    };

    //Error callback to handle activation or deactivation
    $scope.customFormsServiceActiveOrInactiveFailure = function () {
      toastrFactory.error(
        localize.getLocalizedString(
          'There was an error while attempting to active or inactive published template.'
        ),
        localize.getLocalizedString('Server Error')
      );
    };

    //Publish form
    $scope.publishFormById = function (formId) {
      $scope.showPublishConfirmation = false;
      customFormsPublishService.publishFormById(
        { formId: formId },
        $scope.customFormsServicePublishedSuccess,
        $scope.customFormsServicePublishedFailure
      );
    };

    //Success callback to handle conditions after form is published
    $scope.customFormsServicePublishedSuccess = function (successResponse) {
      if (successResponse) {
        var customFormName = $scope.customForm.FormName;
        $scope.customForm = null;
        $scope.initializeForm();
        $scope.customSidebarCollapse = true;
        $scope.zIndexClass = '';
        $scope.showTemplate = false;
        // clear the savedTemplates variable as it has old data.(bug #23783)
        $scope.savedTemplates = [];

        //check if any field in the form has been updated by user
        $scope.checkIfFormDataHasChanged();

        $scope.toggleSidebarHeader(false);

        $scope.customTemplateForm.formTitle.$dirty = false;

        $scope.loadSavedTemplates(true);

        toastrFactory.success(
          '"' +
            customFormName +
            '" ' +
            localize.getLocalizedString('has been published'),
          localize.getLocalizedString('Success')
        );
      } else {
        toastrFactory.error(
          localize.getLocalizedString(
            'There was an error while attempting to publish non existing template at server.'
          ),
          localize.getLocalizedString('Server Error')
        );
      }
    };

    //Error callback to handle publish failure
    $scope.customFormsServicePublishedFailure = function () {
      toastrFactory.error(
        localize.getLocalizedString(
          'There was an error while attempting to publish template.'
        ),
        localize.getLocalizedString('Server Error')
      );
    };

    // Load saved forms
    $scope.getFormsByStatus = function (isPublished) {
      $scope.doesFormTitleExists = false;
      customFormsService.getFormsByPublishedStatus(
        { isPublished: isPublished },
        $scope.customFormsServiceGetFormsByPublishedSuccess,
        $scope.customFormsServiceGetFormsByPublishedFailure
      );
    };

    //Success callback to load templates list by publish status
    $scope.customFormsServiceGetFormsByPublishedSuccess = function (
      successResponse
    ) {
      $scope.savedTemplates = successResponse.Value;
    };

    //Error callback to handle failure when templates could not be fetched by published status
    $scope.customFormsServiceGetFormsByPublishedFailure = function () {
      toastrFactory.error(
        localize.getLocalizedString(
          'There was an error while attempting to retrieve saved templates.'
        ),
        localize.getLocalizedString('Server Error')
      );
    };

    //Display unpublished templates list
    $scope.loadSavedTemplates = function (isPublished) {
      if (isPublished) {
        $timeout(function () {
          angular
            .element(document.querySelector('#btnEditTemplate'))
            .removeClass('active');
          angular
            .element(document.querySelector('#btnCreateFromExistingTemplate'))
            .addClass('active');
        }, 0);
      } else {
        $timeout(function () {
          angular
            .element(document.querySelector('#btnEditTemplate'))
            .addClass('active');
          angular
            .element(document.querySelector('#btnCreateFromExistingTemplate'))
            .removeClass('active');
        }, 0);
      }
      $scope.getFormsByStatus(isPublished);
    };

    //Get unpublished templates list on page load
    $scope.loadSavedTemplates(false);

    // Track the changes in customForm object on user interaction
    $scope.$watch(
      'customForm',
      function () {
        $scope.dataHasChanged = objectService.objectAreEqual(
          angular.copy($scope.customForm),
          angular.copy($scope.customFormActual)
        );
      },
      true
    );

    //Save complete form object to server
    $scope.saveCustomForm = function () {
      // Check if formname is entered or not
      if (!$scope.customForm.FormName) {
        // If FormName is blank set invalidName flag to true to display error message.
        $scope.invalidName = true;
      } else {
        // Set validation flag to true to show messages if any.
        $scope.customForm.SectionValidationFlag = true;

        // Save formdata only if form is Valid.
        $scope.isValidForm = customFormsFactory.ValidateForm($scope.customForm);
        if ($scope.isValidForm) {
          // update options
          ctrl.setItemOptions();

          $scope.customForm.SectionValidationFlag = false;

          // Set flag to disable button when clicked once on save.
          $scope.alreadyClicked = true;

          // If FormName is non-blank set invalidName flag to false to hide error message.
          $scope.invalidName = false;

          // Set zindex of sidebar.
          $scope.zIndexClass = 'zero-zindex';
          if ($scope.customForm.TemplateMode == 3) {
            customFormsService.update(
              $scope.customForm,
              $scope.customFormsServiceUpdateGetSuccess,
              $scope.customFormsServiceUpdateGetFailure
            );
          } else {
            customFormsService.create(
              $scope.customForm,
              $scope.customFormsServiceCreateGetSuccess,
              $scope.customFormsServiceCreateGetFailure
            );
          }
        }
      }
    };

    // Success callback handler after form is saved on server
    $scope.customFormsServiceCreateGetSuccess = function (successResponse) {
      //Reset flag to enable save button
      $scope.alreadyClicked = false;
      //User has chosen to save and publish both
      if ($scope.saveAndDoPublish) {
        toastrFactory.success(
          '"' +
            $scope.customForm.FormName +
            '" ' +
            localize.getLocalizedString('has been saved and published'),
          localize.getLocalizedString('Success')
        );
        $scope.saveAndDoPublish = false;

        // clear the savedTemplates variable as it has old data.(bug #23783)
        $scope.savedTemplates = [];
        //Navigate to landing page
        $scope.cleanUpFormAndLoadSideBar(true);
      } else if ($scope.saveAndDoNotPublish) {
        toastrFactory.success(
          '"' +
            $scope.customForm.FormName +
            '" ' +
            localize.getLocalizedString('has been saved'),
          localize.getLocalizedString('Success')
        );
        $scope.saveAndDoNotPublish = false;

        //Open form in edit mode and update unpublished tempaltes list.
        $scope.reloadSavedFormAndUpdateUnpublishedTemplates(
          successResponse.Value.FormId
        );
      } else {
        //Afer form is saved, prompt a user to publish form now or later
        $scope.modalIsOpen = true;
        // confirmation dialog - no feedback needed
        var modalInstance = $uibModal.open({
          templateUrl:
            'App/BusinessCenter/settings/custom-forms/save-dialog/post-save.html',
          backdrop: 'static',
          keyboard: false,
          controller: 'CustomFormPostSaveController',
          size: 'md',
          windowClass: 'center-modal',
          resolve: {
            formId: function () {
              return successResponse.Value.FormId;
            },
            isSave: function () {
              return true;
            },
          },
        });

        //Handle OK/CANCEL button actions of dialog
        modalInstance.result.then(
          $scope.customFormsServiceCreateGetSuccessModelResultThenOk,
          $scope.modalDismissed
        );
      }
    };

    //Callback handler for continue form publish process
    $scope.customFormsServiceCreateGetSuccessModelResultThenOk = function (
      modalResponse
    ) {
      $scope.modalIsOpen = false;
      if (modalResponse.doPublish) {
        $scope.publishFormById(modalResponse.formId);
      } else {
        //Bug: 8713 Save should give standard success message.
        // Toastr alert to show success
        toastrFactory.success(
          '"' +
            $scope.customForm.FormName +
            '" ' +
            localize.getLocalizedString('has been created'),
          localize.getLocalizedString('Success')
        );

        //Open form in edit mode and update unpublished tempaltes list.
        $scope.reloadSavedFormAndUpdateUnpublishedTemplates(
          modalResponse.formId
        );
      }
    };

    // Open form in edit mode and update unpublished tempaltes list.
    $scope.reloadSavedFormAndUpdateUnpublishedTemplates = function (formId) {
      $scope.getFormById(formId);
      $scope.loadSavedTemplates(false);
    };

    // Do cleanup form object and navigate user to sidebar's landing page
    $scope.cleanUpFormAndLoadSideBar = function (doPublish) {
      $scope.customForm = null;
      $scope.customSidebarCollapse = true;
      $scope.zIndexClass = '';
      $scope.showTemplate = false;

      //check if any field in the form has been updated by user
      $scope.checkIfFormDataHasChanged();
      $scope.toggleSidebarHeader(false);
      $scope.customTemplateForm.formTitle.$dirty = false;
      $scope.loadSavedTemplates(doPublish);
    };

    // Error callback handler to handle server exception and user notification
    $scope.customFormsServiceCreateGetFailure = function (errorResponse) {
      if (
        errorResponse.data &&
        errorResponse.data.Value &&
        errorResponse.data.InvalidProperties
      ) {
        //Bug: 8694 Duplicate message gives server error when clicking save.
        $scope.zindexclass = '';
        $scope.invalidName = false;
        $scope.uniqueTitleServerMessage = localize.getLocalizedString(
          'A template with this title already exists'
        );
      } else {
        toastrFactory.error(
          localize.getLocalizedString(
            'An error occurred while saving form. Please try again'
          ),
          localize.getLocalizedString('Server Error')
        );
      }
      //Reset flag to enable save button
      $scope.alreadyClicked = false;
    };

    // Success callback handler after form is updated on server
    $scope.customFormsServiceUpdateGetSuccess = function (successResponse) {
      //Reset flag to enable save button
      $scope.alreadyClicked = false;
      //User has chosen to save and publish both
      if ($scope.saveAndDoPublish) {
        toastrFactory.success(
          '"' +
            $scope.customForm.FormName +
            '" ' +
            localize.getLocalizedString('has been saved and published'),
          localize.getLocalizedString('Success')
        );
        $scope.saveAndDoPublish = false;

        // clear the savedTemplates variable as it has old data.(bug #23783)
        $scope.savedTemplates = [];
        //Navigate to landing page
        $scope.cleanUpFormAndLoadSideBar(true);
      } else if ($scope.saveAndDoNotPublish) {
        toastrFactory.success(
          '"' +
            $scope.customForm.FormName +
            '" ' +
            localize.getLocalizedString('has been saved'),
          localize.getLocalizedString('Success')
        );
        $scope.saveAndDoNotPublish = false;

        //Open form in edit mode and update unpublished tempaltes list.
        $scope.reloadSavedFormAndUpdateUnpublishedTemplates(
          successResponse.Value.FormId
        );
      } else {
        $scope.modalIsOpen = true;
        // confirmation dialog - no feedback needed
        var modalInstance = $uibModal.open({
          templateUrl:
            'App/BusinessCenter/settings/custom-forms/save-dialog/post-save.html',
          backdrop: 'static',
          keyboard: false,
          controller: 'CustomFormPostSaveController',
          size: 'md',
          windowClass: 'center-modal',
          resolve: {
            formId: function () {
              return successResponse.Value.FormId;
            },
            isSave: function () {
              return false;
            },
          },
        });

        //Handle OK/CANCEL button actions of dialog
        modalInstance.result.then(
          $scope.customFormsServiceUpdateGetSuccessModelResultThenOk,
          $scope.modalDismissed
        );
      }
    };

    //Callback handler for continue form publish process
    $scope.customFormsServiceUpdateGetSuccessModelResultThenOk = function (
      modalResponse
    ) {
      $scope.modalIsOpen = false;
      if (modalResponse.doPublish) {
        $scope.publishFormById(modalResponse.formId);
      } else {
        var customFormName = $scope.customForm.FormName;
        //Bug: 8713 Save should give standard success message.
        toastrFactory.success(
          '"' +
            customFormName +
            '" ' +
            localize.getLocalizedString('has been updated'),
          localize.getLocalizedString('Success')
        );

        //Open form in edit mode and update unpublished tempaltes list.
        $scope.reloadSavedFormAndUpdateUnpublishedTemplates(
          modalResponse.formId
        );
      }
    };

    // Error callback handler to handle server exception and user notification
    $scope.customFormsServiceUpdateGetFailure = function (errorResponse) {
      //Reset flag to enable save button
      $scope.alreadyClicked = false;
      if (
        errorResponse.data &&
        errorResponse.data.Value &&
        errorResponse.data.InvalidProperties
      ) {
        //Bug: 8694 Duplicate message gives server error when clicking save.
        $scope.zindexclass = '';
        $scope.invalidName = false;
        $scope.uniqueTitleServerMessage = localize.getLocalizedString(
          'A template with this title already exists'
        );
      } else {
        toastrFactory.error(
          localize.getLocalizedString(
            'An error occurred while updating form. Please try again'
          ),
          localize.getLocalizedString('Server Error')
        );
      }
    };

    // Publish custom form object
    $scope.publishCustomForm = function (formId) {
      //If data has not changed, ask for user confirmation (are you sure message)
      if ($scope.dataHasChanged) {
        $scope.showPublishConfirmation = true;
      } else {
        // Set zindex of sidebar.
        $scope.zIndexClass = 'zero-zindex';

        $scope.modalIsOpen = true;
        // confirmation dialog - no feedback needed
        var modalInstance = $uibModal.open({
          templateUrl:
            'App/BusinessCenter/settings/custom-forms/publish-dialog/custom-forms-publish.html',
          backdrop: 'static',
          keyboard: false,
          controller: 'CustomFormPublishController',
          size: 'md',
          windowClass: 'center-modal',
          resolve: {
            formId: function () {
              return formId;
            },
          },
        });

        //Handle "SAVE & PUBLISH", "SAVE" and "CANCEL" button actions of dialog
        modalInstance.result.then(
          $scope.customFormsSavePublishModalResultOk,
          $scope.modalDismissed
        );
      }
    };

    // Publish custom form dialog's "Save & Publish" and "Save" buttons handler
    $scope.customFormsSavePublishModalResultOk = function (dialogReturnValues) {
      $scope.modalIsOpen = false;
      if (dialogReturnValues.canPublish) {
        $scope.customForm.IsPublished = true;
        $scope.saveAndDoPublish = true;
      } else {
        $scope.saveAndDoNotPublish = true;
      }

      // Check if form is in edit or create mode
      $scope.saveCustomForm();
    };

    //Discard changes made to a form
    $scope.discardCustomForm = function () {
      // Set zindex of sidebar.
      $scope.zIndexClass = 'zero-zindex';

      $scope.modalIsOpen = true;
      // confirmation dialog - no feedback needed
      var modalInstance = $uibModal.open({
        templateUrl:
          'App/BusinessCenter/settings/custom-forms/discard-dialog/custom-forms-discard.html',
        backdrop: 'static',
        keyboard: false,
        controller: 'CustomFormDiscardController',
        size: 'md',
        windowClass: 'center-modal',
      });

      //Handle callback for "OK" & "CACNCEL" buttons action of dialog
      modalInstance.result.then(
        $scope.customFormsDiscardModalResultOk,
        $scope.modalDismissed
      );
    };

    // Discard custom form dialog's "Ok" button handler
    $scope.customFormsDiscardModalResultOk = function () {
      $scope.modalIsOpen = false;

      $scope.customForm = angular.copy($scope.customFormActual);

      //Navigate to landing page
      $scope.cleanUpFormAndLoadSideBar(false);

      toastrFactory.success(
        localize.getLocalizedString('Your changes has been discarded.'),
        localize.getLocalizedString('Success')
      );
    };

    // Verify unique form name from server
    $scope.checkUniqueFormName = function () {
      if ($scope.customForm.FormName) {
        uniqueCustomFormNameService.checkUniqueFormName(
          {
            formName: $scope.customForm.FormName,
            formId: $scope.customForm.FormId,
          },
          $scope.checkUniqueFormNameGetSuccess,
          $scope.checkUniqueFormNameGetFailure
        );
      }
    };

    // Success callback handler to notify user after verifying unique form name
    $scope.checkUniqueFormNameGetSuccess = function (successResponse) {
      // Form Name is Unique
      $scope.doesFormTitleExists = successResponse.Value;
      if ($scope.doesFormTitleExists) {
        $scope.uniqueTitleServerMessage = localize.getLocalizedString(
          'A template with this title already exists'
        );
      }
    };

    // Error callback handler to notify user after failed to verify unique form name
    $scope.checkUniqueFormNameGetFailure = function (errorResponse) {
      //Bug 8652	Duplicate Form Title should give 400 error instead of 404.
      $scope.doesFormTitleExists = true;
      if (errorResponse.data && errorResponse.data.InvalidProperties) {
        $scope.uniqueTitleServerMessage = localize.getLocalizedString(
          'Could not verify unique form title. Please try again'
        );
      }
    };

    // Function to toggle display of custom sidebarheader
    $scope.toggleSidebarHeader = function (show) {
      if (show) {
        $scope.showCustomSidebar = 'showdiv';
        $scope.customSidebarCollapse = false;
      } else {
        if (!$scope.dataHasChanged) {
          $scope.discardCustomForm();
        } else {
          $scope.showCustomSidebar = 'hidediv';
          $scope.customSidebarCollapse = true;
        }
      }
    };

    // if form is valid update the options
    ctrl.setItemOptions = function () {
      if ($scope.isValidForm) {
        angular.forEach($scope.customForm.FormSections, function (formSection) {
          angular.forEach(
            formSection.FormSectionItems,
            function (formSectionItem) {
              switch (formSectionItem.FormItemType) {
                case 3:
                case 9:
                  for (
                    var ndx = 0;
                    ndx < formSectionItem.ItemOptions.length;
                    ndx++
                  ) {
                    if (
                      formSectionItem.ItemOptions[ndx].BankItemOption.OptionText
                    ) {
                      formSectionItem.ItemOptions[
                        ndx
                      ].BankItemOption.OptionValue =
                        formSectionItem.ItemOptions[
                          ndx
                        ].BankItemOption.OptionText;
                    } else {
                      formSectionItem.ItemOptions.splice(ndx, 1);
                      ndx--;
                    }
                  }
                  break;
                default:
                  break;
              }
            }
          );
        });
      }
    };
  },
]);
