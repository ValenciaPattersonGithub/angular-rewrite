'use strict';

angular.module('Soar.BusinessCenter').directive('formsEditor', function () {
  return {
    restrict: 'E',
    scope: {
      editorId: '@',
      content: '=',
      groupFolders: '=',
      mediaFolders: '=',
      selectedFolder: '=',
      selectedMedia: '=',
      maxLength: '=?',
      focus: '=',
      toolOptions: '=',
      onChange: '&?',
      onSave: '&?',
      onCancel: '&?',
      onSaveDraft: '&?',
      extraContent: '=?',
    },
    templateUrl:
      'App/BusinessCenter/forms-documents/forms-editor/forms-editor.html',
    controller: 'FormsEditorController',
    link: function link(scope, element, attrs) {
      element.on('$destroy', function elementOnDestroy() {
        scope.$destroy();
      });
    },
  };
});
