'use strict';
angular.module('Soar.BusinessCenter').controller('NoteTemplatesController', [
  '$scope',
  '$timeout',
  'toastrFactory',
  'localize',
  'patSecurityService',
  '$location',
  'NoteTemplatesHttpService',
  'ModalFactory',
  'ListHelper',
  '$window',
  'StaticData',
  'CustomFormsFactory',
  function (
    $scope,
    $timeout,
    toastrFactory,
    localize,
    patSecurityService,
    $location,
    noteTemplatesHttpService,
    modalFactory,
    listHelper,
    $window,
    staticData,
    customFormsFactory
  ) {
    var ctrl = this;

    // init
    ctrl.$onInit = function () {
      // making sure that the factory doesn't have any stale data in it
      noteTemplatesHttpService.SetActiveNoteTemplate(null);
      noteTemplatesHttpService.SetActiveTemplateCategory(null);
      // initial state of flags
      $scope.existingTemplateActive = false;
      $scope.editMode = false;
      $scope.isSaving = false;
      $scope.isValidCustomForm = false;
      // calling auth on the factory for all relevant operations
      $scope.authAccess = noteTemplatesHttpService.access();
      if (!$scope.authAccess.view) {
        toastrFactory.error(
          patSecurityService.generateMessage('soar-clin-nottmp-view'),
          'Not Authorized'
        );
        $location.path('/');
      }
    };

    //#region forms

    // section creator
    ctrl.createEmptySection = function (sectionCount) {
      return {
        FormSectionId: '00000000-0000-0000-0000-000000000000',
        Title: '',
        FormId: '00000000-0000-0000-0000-000000000000',
        SequenceNumber: sectionCount,
        ShowTitle: true,
        ShowBorder: true,
        IsVisible: true,
        FormSectionItems: [],
      };
    };

    // add section button handler, adds sections to the FormSections list
    $scope.addSection = function () {
      if (
        $scope.selectedTemplate.TemplateBodyCustomForm &&
        $scope.selectedTemplate.TemplateBodyCustomForm.FormSections
      ) {
        var sectionCount = 0;
        if (
          $scope.selectedTemplate.TemplateBodyCustomForm
            .IndexOfSectionInEditMode == -1
        ) {
          $scope.selectedTemplate.TemplateBodyCustomForm.IndexOfSectionInEditMode =
            $scope.selectedTemplate.TemplateBodyCustomForm.FormSections.length;
        }

        sectionCount =
          $scope.selectedTemplate.TemplateBodyCustomForm.FormSections.length +
          1;

        $scope.selectedTemplate.TemplateBodyCustomForm.FormSections.push(
          ctrl.createEmptySection(sectionCount)
        );
        $timeout(function () {
          if (
            $scope.selectedTemplate.TemplateBodyCustomForm
              .IndexOfSectionInEditMode != -1
          ) {
            angular
              .element(
                '#inpSectionTitle_' +
                  $scope.selectedTemplate.TemplateBodyCustomForm
                    .IndexOfSectionInEditMode
              )
              .focus();
            $window.scrollTo(0, document.body.scrollHeight);
          }
        }, 0);
        $scope.resequenceFormItems();
      }
    };

    // get api call and transformation
    ctrl.getTemplateFormById = function () {
      noteTemplatesHttpService
        .LoadTemplateBodyCustomForm($scope.selectedTemplate.Template)
        .then(
          function (res) {
            if (res.Value) {
              $scope.selectedTemplate.TemplateBodyCustomForm = res.Value;
              $scope.selectedTemplate.TemplateBodyCustomForm.IndexOfSectionInEditMode = -1;
              $scope.selectedTemplate.TemplateBodyCustomForm.SectionValidationFlag = false;
              $scope.selectedTemplate.TemplateBodyCustomForm.SectionCopyValidationFlag = -1;
              $scope.selectedTemplate.TemplateBodyCustomForm.SourceFormId =
                $scope.selectedTemplate.TemplateBodyCustomForm.FormId;
              $scope.selectedTemplate.TemplateBodyCustomForm.TemplateMode = 3;
              $scope.selectedTemplateBackup = angular.copy(
                $scope.selectedTemplate
              );
              if (noteTemplatesHttpService.CurrentOperation === 'copy') {
                $scope.selectedTemplateBackup.Template.TemplateId = null;
              }
              $scope.selectedTemplateCategoryId =
                $scope.selectedTemplate.Template.CategoryId;
              $scope.selectedTemplate.Template.CategoryId = null;
              $timeout(function () {
                $scope.selectedTemplate.Template.CategoryId =
                  $scope.selectedTemplateCategoryId;
              }, 0);
            }
          },
          function () {
            toastrFactory.error(
              localize.getLocalizedString(
                'Failed to retrieve the {0}. Refresh the page to try again.',
                ['Clinical Note Template']
              ),
              localize.getLocalizedString('Server Error')
            );
          }
        );
    };

    // update api call(s)
    ctrl.updateTemplateForm = function () {
      if ($scope.hasChanges().TemplateFormChanged) {
        noteTemplatesHttpService
          .updateNoteTemplateForm(
            $scope.selectedTemplate.TemplateBodyCustomForm
          )
          .then(
            function (result) {
              toastrFactory.success(
                localize.getLocalizedString('Your {0} has been updated.', [
                  'Clinical Note Template',
                ]),
                localize.getLocalizedString('Success')
              );
              if ($scope.hasChanges().TemplateChanged) {
                noteTemplatesHttpService
                  .updateNoteTemplate($scope.selectedTemplate.Template)
                  .then(
                    function (result) {
                      toastrFactory.success(
                        localize.getLocalizedString(
                          'Your {0} has been updated.',
                          ['Clinical Note Template']
                        ),
                        localize.getLocalizedString('Success')
                      );
                      ctrl.postSaveCleanup(result.Value, true);
                    },
                    function () {
                      toastrFactory.error(
                        localize.getLocalizedString(
                          'Save was unsuccessful. Please refresh the page and retry your save.'
                        ),
                        localize.getLocalizedString('Server Error')
                      );
                    }
                  );
              } else {
                ctrl.postSaveCleanup($scope.selectedTemplate.Template, true);
              }
            },
            function () {
              toastrFactory.error(
                localize.getLocalizedString(
                  'Save was unsuccessful. Please refresh the page and retry your save.'
                ),
                localize.getLocalizedString('Server Error')
              );
            }
          );
      } else if ($scope.hasChanges().TemplateChanged) {
        noteTemplatesHttpService
          .updateNoteTemplate($scope.selectedTemplate.Template)
          .then(
            function (result) {
              toastrFactory.success(
                localize.getLocalizedString('Your {0} has been updated.', [
                  'Clinical Note Template',
                ]),
                localize.getLocalizedString('Success')
              );
              ctrl.postSaveCleanup(result.Value, true);
            },
            function () {
              toastrFactory.error(
                localize.getLocalizedString(
                  'Save was unsuccessful. Please refresh the page and retry your save.'
                ),
                localize.getLocalizedString('Server Error')
              );
            }
          );
      }
    };

    // function to check if form is valid or not.
    $scope.isValidCustomFormCheck = function (cleanupOptions) {
      $scope.isValidCustomForm = true;
      var isValid = noteTemplatesHttpService.ValidateTemplateBodyCustomForm(
        $scope.selectedTemplate.TemplateBodyCustomForm
      );
      if (!isValid) {
        $scope.isValidCustomForm = false;
      } else if (cleanupOptions) {
        noteTemplatesHttpService.SetItemOptions(
          $scope.selectedTemplate.TemplateBodyCustomForm
        );
      }
      return $scope.isValidCustomForm;
    };

    //#endregion

    //#region watches

    // watches the change in active category
    $scope.$watch(
      function () {
        return noteTemplatesHttpService.ActiveTemplateCategory;
      },
      function (nv) {
        $scope.activeCategory = nv;
        if ($scope.activeCategory == null) {
          $scope.editMode = false;
        }
      }
    );

    // watch for category DD
    $scope.$watch('selectedTemplate.Template.CategoryId', function (nv, ov) {
      if ($scope.selectedTemplate != undefined && !_.isNil(nv)) {
        $scope.selectedTemplate.Template.CategoryId = null;
        $scope.selectedTemplate.Template.CategoryId = nv;
      }
    });

    $scope.$watch(
      function () {
        return noteTemplatesHttpService.ActiveNoteTemplate;
      },
      function (nv) {
        if (nv) {
          $scope.existingTemplateActive = true;
          $scope.selectedTemplate = angular.copy(nv);
          if (
            $scope.selectedTemplate.Template &&
            $scope.selectedTemplate.Template.TemplateBodyFormId
          ) {
            // must be editing if there is a TemplateBodyFormId, need to fetch the template
            ctrl.getTemplateFormById();
          } else {
            // new template is being created, just make the backup here
            $scope.selectedTemplateBackup = nv ? angular.copy(nv) : null;
          }
        }
      }
    );

    // watches for changes in $scope.selectedTemplate.TemplateBodyCustomForm for validating custom form on the fly
    $scope.$watch(
      'selectedTemplate.TemplateBodyCustomForm',
      function (nv, ov) {
        if (nv && !angular.equals(nv, {})) {
          $scope.isValidCustomFormCheck(false);
          if (nv.FormSections && nv.FormSections.length > 0) {
            $scope.canAddSection =
              listHelper.findIndexByFieldValue(nv.FormSections, 'Title', '') ===
                -1 && nv.IndexOfSectionInEditMode === -1
                ? true
                : false;
          } else {
            $scope.canAddSection = true;
          }
        }
      },
      true
    );

    //#endregion

    //#region save template

    // reset after successful save or edit
    ctrl.postSaveCleanup = function (result, editing) {
      if (!result.$$CategoryName) {
        var category = listHelper.findItemByFieldValue(
          $scope.noteCategories,
          'CategoryId',
          result.CategoryId
        );
        if (category) {
          result.$$CategoryName = category.CategoryName;
        }
      }
      $scope.existingTemplateActive = true;
      if ($scope.activeCategory) {
        noteTemplatesHttpService.CloseTemplateHeader($scope.activeCategory);
      }
      noteTemplatesHttpService.SetActiveNoteTemplate({});
      $scope.editMode = false;
      $scope.isSaving = false;
      noteTemplatesHttpService.setTemplateDataChanged(false);
      $scope.$broadcast('soar:update-template-in-list', result, editing);
    };

    // save button click handler, create or edit done here
    $scope.saveTemplate = function () {
      if ($scope.isSaving == false) {
        $scope.isSaving = true;
        if ($scope.isValidCustomFormCheck(true)) {
          if (
            $scope.selectedTemplate.Template.TemplateId &&
            $scope.authAccess.update &&
            noteTemplatesHttpService.CurrentOperation === 'edit'
          ) {
            ctrl.updateTemplateForm();
          } else if (noteTemplatesHttpService.CurrentOperation === 'copy') {
            ctrl.copyData();
            noteTemplatesHttpService
              .createNoteTemplate($scope.selectedTemplateCopy)
              .then(
                function (result) {
                  toastrFactory.success(
                    localize.getLocalizedString('Your {0} has been created.', [
                      'Clinical Note Template',
                    ]),
                    localize.getLocalizedString('Success')
                  );
                  ctrl.postSaveCleanup(result.Value.Template, false);
                },
                function () {
                  toastrFactory.error(
                    localize.getLocalizedString(
                      'Save was unsuccessful. Please refresh the page and retry your save.'
                    ),
                    localize.getLocalizedString('Server Error')
                  );
                }
              );
          } else {
            if ($scope.authAccess.update) {
              // the custom form name needs to be unique, just giving it a derived name because it will not be presented to the user for clinical note templates
              $scope.selectedTemplate.TemplateBodyCustomForm.FormName =
                $scope.selectedTemplate.Template.TemplateName +
                '_' +
                Math.floor(Math.random() * 1000000) +
                '_CNT';

              noteTemplatesHttpService
                .createNoteTemplate($scope.selectedTemplate)
                .then(
                  function (result) {
                    toastrFactory.success(
                      localize.getLocalizedString(
                        'Your {0} has been created.',
                        ['Clinical Note Template']
                      ),
                      localize.getLocalizedString('Success')
                    );
                    ctrl.postSaveCleanup(result.Value.Template, false);
                  },
                  function () {
                    toastrFactory.error(
                      localize.getLocalizedString(
                        'Save was unsuccessful. Please refresh the page and retry your save.'
                      ),
                      localize.getLocalizedString('Server Error')
                    );
                  }
                );
            }
          }
          noteTemplatesHttpService.CurrentOperation = '';
        }
      }
    };

    // helping to change Id's  of copied data
    ctrl.copyData = function () {
      var Id = '00000000-0000-0000-0000-000000000000';
      $scope.selectedTemplate.TemplateBodyCustomForm.FormName =
        $scope.selectedTemplate.Template.TemplateName +
        '_' +
        Math.floor(Math.random() * 1000000) +
        '_CNT';
      _.forEach(
        $scope.selectedTemplate.TemplateBodyCustomForm.FormSections,
        function (formSection) {
          formSection.FormId = Id;
          formSection.FormSectionId = Id;
          _.forEach(formSection.FormSectionItems, function (formSectionItem) {
            formSectionItem.BankItemDemographicId = null;
            formSectionItem.FormBankItemEmergencyContact = null;
            formSectionItem.BankItemEmergencyContactId = null;
            formSectionItem.FormSectionId = Id;
            formSectionItem.SectionItemId = Id;
            if (
              formSectionItem.FormItemType === 11 ||
              formSectionItem.FormItemType === 9
            ) {
              formSectionItem.BankItemId = null;
            } else {
              if (!_.isNil(formSectionItem.FormBankItem.BankItemId)) {
                formSectionItem.FormBankItem.BankItemId = Id;
              }
              if (formSectionItem.ItemOptions.length !== 0) {
                _.forEach(formSectionItem.ItemOptions, function (ItemOption) {
                  ItemOption.SectionItemId = Id;
                  ItemOption.SectionItemOptionId = Id;
                  ItemOption.BankItemId = Id;
                  ItemOption.BankItemOptionId = Id;
                  ItemOption.BankItemOption.BankItemId = Id;
                  ItemOption.BankItemOption.BankItemOptionId = Id;
                });
              }
              formSectionItem.BankItemId = Id;
            }
          });
        }
      );
      $scope.selectedTemplateCopy = {
        Template: {
          TemplateId: null,
          TemplateName: $scope.selectedTemplate.Template.TemplateName,
          CategoryId: $scope.selectedTemplate.Template.CategoryId,
          TemplateBodyFormId: null,
        },
        TemplateBodyCustomForm: {
          FormId: '00000000-0000-0000-0000-000000000000',
          VersionNumber: 1,
          SourceFormId: '00000000-0000-0000-0000-000000000000',
          FormName: $scope.selectedTemplate.TemplateBodyCustomForm.FormName,
          Description: '',
          IsActive: true,
          IsVisible: true,
          IsPublished: false,
          IsDefault: false,
          FormSections:
            $scope.selectedTemplate.TemplateBodyCustomForm.FormSections,
          IndexOfSectionInEditMode: 0,
          SectionValidationFlag: false,
          SectionCopyValidationFlag: -1,
          TemplateMode: 1,
        },
      };
    };

    // cancel button handler
    $scope.cancelEdit = function () {
      if ($scope.hasChanges().EitherChanged) {
        $scope.launchWarningModal();
      } else {
        ctrl.cancel();
      }
    };

    // launch warning modal for edit cancel
    $scope.launchWarningModal = function () {
      modalFactory.WarningModal().then(function (result) {
        if (result === true) {
          ctrl.cancel();
        }
      });
    };

    // cleanup after they have confirmed they want to cancel
    ctrl.cancel = function () {
      noteTemplatesHttpService.SetActiveNoteTemplate({});
      $scope.editMode = false;
      $scope.existingTemplateActive = false;
      noteTemplatesHttpService.setTemplateDataChanged(false);
      if ($scope.activeCategory && $scope.activeCategory.addingNewTemplate) {
        noteTemplatesHttpService.CloseTemplateHeader($scope.activeCategory);
      }
    };

    //#endregion

    //#region helpers

    // checking for changes
    $scope.hasChanges = function () {
      var result = {
        EitherChanged: false,
        TemplateChanged: false,
        TemplateFormChanged: false,
      };
      if ($scope.selectedTemplate && $scope.selectedTemplateBackup) {
        result.EitherChanged = !angular.equals(
          $scope.selectedTemplate,
          $scope.selectedTemplateBackup
        );
      }
      if (
        $scope.selectedTemplate.Template &&
        $scope.selectedTemplateBackup.Template
      ) {
        result.TemplateChanged =
          !angular.equals(
            $scope.selectedTemplate.Template.TemplateName,
            $scope.selectedTemplateBackup.Template.TemplateName
          ) ||
          !angular.equals(
            $scope.selectedTemplate.Template.CategoryId,
            $scope.selectedTemplateBackup.Template.CategoryId
          ) ||
          !angular.equals(
            $scope.selectedTemplate.Template.TemplateId,
            $scope.selectedTemplateBackup.Template.TemplateId
          );
      }
      if (
        $scope.selectedTemplate.TemplateBodyCustomForm &&
        $scope.selectedTemplateBackup.TemplateBodyCustomForm
      ) {
        result.TemplateFormChanged = !angular.equals(
          $scope.selectedTemplate.TemplateBodyCustomForm,
          $scope.selectedTemplateBackup.TemplateBodyCustomForm
        );
      }
      return result;
    };

    // used by 'global' route change discard message handler
    $scope.resetData = function () {
      noteTemplatesHttpService.setTemplateDataChanged(false);
      $scope.selectedTemplate = angular.copy($scope.selectedTemplateBackup);
    };

    // resequence the form items after one is deleted to avoid duplicates
    $scope.resequenceFormItems = function () {
      var i = 0;

      angular.forEach(
        $scope.selectedTemplate.TemplateBodyCustomForm.FormSections,
        function (res) {
          res.SequenceNumber = i;
          i++;
        }
      );
    };

    //#endregion

    ctrl.$onInit();
  },
]);
