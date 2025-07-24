'use strict';

angular
  .module('Soar.BusinessCenter')
  .directive('documentGroupsCrud', function () {
    return {
      restrict: 'E',
      scope: {
        documentGroups: '=',
        documentGroupDto: '=documentGroup',
        savedDocumentGroup: '=',
        cancel: '=',
      },
      templateUrl:
        'App/BusinessCenter/document-groups/document-groups-crud/document-groups-crud.html',
      controller: 'DocumentGroupsCrudController',
      link: function link(scope, element) {
        element.on('$destroy', function elementOnDestroy() {
          scope.$destroy();
        });
      },
    };
  });
