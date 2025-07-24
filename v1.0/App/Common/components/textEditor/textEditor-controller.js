'use strict';

angular.module('common.controllers').controller('TextEditorController', [
  '$scope',
  '$rootScope',
  'localize',
  '$timeout',
  '$location',
  'toastrFactory',
  '$sanitize',
  'RichTextSanitizerService',
  function (
    $scope,
    $rootScope,
    localize,
    $timeout,
    $location,
    toastrFactory,
    $sanitize,
    richTextSanitizerService
  ) {
      var ctrl = this;      

    // ie hack: sometimes ie will make the textarea unfocusable until you focus another element in the form
    // this puts the focus on the textarea, the long timeout is to keep the cursor from appearing above the textarea
    if ($scope.focus) {
      $timeout(function () {
        ctrl.setBtnIdByTitle('Bold');
        ctrl.setBtnIdByTitle('Italic');
        ctrl.setBtnIdByTitle('Underline');
        ctrl.setBtnIdByTitle('Color');
        var colorSelector = document.querySelector('[title="Color"] .k-select');
        if (colorSelector) {
          colorSelector.setAttribute('id', 'btnClinicalNotesColorArrow');
        }
          var editor = $('#' + $scope.editorId).data('kendoEditor');          
        if (editor) {
          editor.focus();
        }
      }, 2000);
    }

    $scope.change = function () {
      if ($scope.onChange) {
        $scope.onChange();
      }
    };

    $scope.cancel = function () {
      if ($scope.onCancel) {
        $scope.onCancel();
      }
    };

    $scope.save = function () {
      if ($scope.onSave) {
        $scope.onSave();
        // trying to fix an ie bug, the content was being cached, the previous note was displayed when a second new note was being created
        //$scope.content = null;
      }
    };

    $scope.saveDraft = function () {
      console.log('saving the draft');
      if ($scope.onSaveDraft) {
        $scope.onSaveDraft();
      }
      };

    ctrl.setBtnIdByTitle = function (title) {
      var control = document.querySelector('[title="' + title + '"]');
      if (control) {
        control.setAttribute('id', 'btn' + title);
      }
    };

    $scope.paste = function (e) {
        if (e.html.includes('<img src=')) {
            e.html = '';
            toastrFactory.error(
                localize.getLocalizedString(
                    'Images may not be pasted into patient clinical notes'
                )
            );
        }
        else {
            e.html = richTextSanitizerService.sanitizeRichText(e.html);
        }
    };

    // set max length for text
    ctrl.setMaxLength = function () {
      if (!$scope.maxLength) {
        $scope.maxLength = 500;
      }
    };
    ctrl.setMaxLength();

    // validate the content
    $scope.$watch(
      'content',
      function (nv, ov) {
        if (nv && nv != ov) {
          ctrl.validateForm();
        }
      },
      true
    );
    $scope.formIsValid = true;
    //TOOD change maxLength;
    ctrl.validateForm = function () {
      if ($scope.content && $scope.content != null) {
        if ($scope.content.length > $scope.maxLength) {
          $scope.formIsValid = false;
        } else {
          $scope.formIsValid = true;
        }
      } else {
        $scope.formIsValid = false;
      }
    };

    ctrl.canEdit = function () {
      $timeout(function () {
        var editor = $('#templateEditor').data('kendoEditor');
        if (editor) {
          var editorBody = $(editor.body);
          if (editorBody) {
            editorBody.add('td', editorBody).removeAttr('contenteditable');
          }
        }
      }, 1000);
    };
    ctrl.canEdit();

    $scope.$on('tooth-widget-active', function (event, nv) {
      $scope.widgetActive = nv;
    });      
  },
]);
