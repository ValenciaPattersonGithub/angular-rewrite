'use strict';

angular
  .module('Soar.BusinessCenter')
  .directive('questionCommentEssay', function () {
    return {
      restrict: 'E',
      scope: true,
      templateUrl:
        'App/BusinessCenter/settings/custom-forms/section-crud/section-item-crud/comment-essay/comment-essay.html',
      controller: 'SectionItemController',
      link: function link(scope, element, attrs) {
        element.on('$destroy', function elementOnDestroy() {
          scope.$destroy();
        });
      },
    };
  });
