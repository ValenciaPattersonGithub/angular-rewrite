'use strict';

angular.module('Soar.Common').directive('textEditor', function () {
  return {
    restrict: 'E',
    scope: {
      editorId: '@',
      content: '=',
      maxLength: '=?',
      focus: '=',
      toolOptions: '=',
      onChange: '&?',
      onSave: '&?',
      onCancel: '&?',
      onSaveDraft: '&?',
      extraContent: '=?',
    },
    templateUrl: 'App/Common/components/textEditor/textEditor.html',
    controller: 'TextEditorController',
    link: function link(scope, element, attrs) {
      element.on('$destroy', function elementOnDestroy() {
        scope.$destroy();
      });
    },
  };
});
