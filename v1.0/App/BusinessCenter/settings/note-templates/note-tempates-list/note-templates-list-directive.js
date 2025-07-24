'use strict';

angular.module('Soar.Patient').directive('noteTemplatesList', function () {
  return {
    restrict: 'E',
    scope: {
      collapseAll: '=?',
      editMode: '=?',
      existingTemplateActive: '=?',
      newCategoryName: '=?',
      noteCategories: '=?',
      noteTemplates: '=?',
      selectedTemplate: '=?',
      showHeader: '=?',
      templates: '=?',
      showMenu: '=?',
    },
    templateUrl:
      'App/BusinessCenter/settings/note-templates/note-tempates-list/note-templates-list.html',
    controller: 'NoteTemplatesListController',
    link: function link(scope, element, attrs) {
      element.on('$destroy', function elementOnDestroy() {
        scope.$destroy();
      });
    },
  };
});
