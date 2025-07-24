'use strict';

angular.module('common.directives').directive('noResults', function () {
  return {
    restrict: 'E',
    replace: true,
    scope: {
      filteringMessage: '=?',
      loadingMessage: '=?',
      loading: '=',
      filtering: '=',
    },
    templateUrl: 'App/Common/components/noResults/noResults.html',
    controller: 'NoResultsController',
    link: function link(scope, element, attrs) {
      element.on('$destroy', function elementOnDestroy() {
        scope.$destroy();
      });
    },
  };
});
