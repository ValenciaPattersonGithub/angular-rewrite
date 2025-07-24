'use strict';
angular.module('Soar.Patient').controller('PatientNoteTemplateController', [
  '$scope',
  '$rootScope',
  'localize',
  '$location',
  'ListHelper',
  'toastrFactory',
  '$filter',
  'patSecurityService',
  'NoteTemplatesHttpService',
  '$timeout',
  'ModalFactory',
  'PatientNotesFactory',
  function (
    $scope,
    $rootScope,
    localize,
    $location,
    listHelper,
    toastrFactory,
    $filter,
    patSecurityService,
    noteTemplatesHttpService,
    $timeout,
    modalFactory,
    patientNotesFactory
  ) {
    var ctrl = this;
    $scope.fadeIn = false;
    $scope.fadeOut = false;

    ctrl.$onInit = function () {
      $scope.dataHasChanged = false;
    };

    //#region init template

    // watch selected template...
    $scope.activeTemplate = false;
    $scope.$watch('selectedTemplate', function (nv, ov) {
      if ($scope.selectedTemplate && $scope.selectedTemplate.TemplateId) {
        ctrl.loadTemplateBody();
      }
    });

    ctrl.loadTemplateBody = function () {
      $scope.activeTemplate = true;
      // get the template body
      noteTemplatesHttpService
        .LoadTemplateBodyCustomForm($scope.selectedTemplate)
        .then(
          function (res) {
            $scope.selectedTemplate.TemplateBodyCustomForm = res.Value;
            noteTemplatesHttpService.LoadSelectOptions(
              $scope.selectedTemplate.TemplateBodyCustomForm
            );
            $scope.fadeIn = true;
            ctrl.backupForm();
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

    //#endregion

    //#region validation

    ctrl.validateForm = function () {
      $scope.hasErrors = false;
      var isValid = noteTemplatesHttpService.ValidateTemplateAnswers(
        $scope.selectedTemplate.TemplateBodyCustomForm
      );
      if (!isValid) {
        $scope.hasErrors = true;
      }
      // notify form of errors
      ctrl.setFocusOnFirstError();
      return $scope.hasErrors;
    };

    ctrl.setFocusOnFirstError = function () {
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
    };

    //#endregion

    //#region add template to note

    ctrl.addTemplateToNote = function (templateContent) {
      var defaultNoteTitle = localize.getLocalizedString('Clinical Note');
      if ($scope.currentNote.Note.length > 0) {
        // add spacing
        $scope.currentNote.Note += '<br />';
      }
      $scope.currentNote.Note += templateContent;
      if (
        !$scope.currentNote.NoteTitle ||
        $scope.currentNote.NoteTitle.length === 0 ||
        $scope.currentNote.NoteTitle === defaultNoteTitle
      ) {
        $scope.currentNote.NoteTitle = $scope.selectedTemplate.TemplateName;
      }
    };

    ctrl.addTeethToNote = function (selectedTemplate) {
      angular.forEach(
        $scope.selectedTemplate.TemplateBodyCustomForm.FormSections,
        function (formSection) {
          angular.forEach(
            formSection.FormSectionItems,
            function (formSectionItem) {
              if (
                formSectionItem.FormItemType === 10 &&
                formSectionItem.$$activeTeeth
              ) {
                angular.forEach(
                  formSectionItem.$$activeTeeth,
                  function (activeTooth) {
                    var ndx = -1;
                    if ($scope.currentNote.ToothNumbers) {
                      ndx = $scope.currentNote.ToothNumbers.indexOf(activeTooth);
                    } else {
                      $scope.currentNote.ToothNumbers = [];
                    }
                    if (ndx === -1) {
                      $scope.currentNote.ToothNumbers.push(activeTooth);
                    }
                  }
                );
              }
            }
          );
        }
      );
    };

    $scope.finishTemplate = function () {
      ctrl.validateForm();

      if (!$scope.hasErrors) {
        var templateContent = noteTemplatesHttpService.ConvertTemplateToText(
          $scope.selectedTemplate
        );
        ctrl.addTemplateToNote(templateContent);
        ctrl.addTeethToNote($scope.selectedTemplate);
        // notify parent that template is finished
        ctrl.closeForm();
      }
    };

    //#endregion

    // final closing function
    ctrl.closeForm = function () {
      // set dataChanged false
      $scope.fadeOut = true;
      $scope.activeTemplate = false;
      $scope.dataHasChanged = false;
      $scope.hasErrors = false;
      $scope.selectedTemplate = null;
      noteTemplatesHttpService.SetActiveNoteTemplate(null);
      //notify parent
      if ($scope.onFinish) {
        $scope.onFinish();
      }
    };

    //#region cancel form

    $scope.cancelTemplate = function () {
      if ($scope.dataHasChanged) {
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

    //#endregion

    //#region dataChanges

    ctrl.backupForm = function () {
      $scope.dataHasChanged = false;
      $scope.selectedTemplateBackup = angular.copy($scope.selectedTemplate);
    };

    //#region watch for changes
    $scope.$watch(
      'selectedTemplate',
      function (nv, ov) {
        if (nv && ov && nv != ov) {
          if (
            $scope.selectedTemplateBackup &&
            $scope.selectedTemplateBackup.TemplateBodyCustomForm
          ) {
            $scope.dataHasChanged = !angular.equals(
              $scope.selectedTemplate.TemplateBodyCustomForm,
              $scope.selectedTemplateBackup.TemplateBodyCustomForm
            );
            patientNotesFactory.setDataChanged($scope.dataHasChanged);
          }
        }
      },
      true
    );

    $scope.$watch(
      function () {
        return noteTemplatesHttpService.ActiveNoteTemplate;
      },
      function (nv, ov) {
        if (nv == null && nv != ov) {
          ctrl.closeForm();
        }
      },
      true
    );
    //#endregion
  },
]);
