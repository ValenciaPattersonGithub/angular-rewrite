angular.module('common.directives').directive('subSection', function () {
  return {
    restrict: 'E',
    transclude: true,
    scope: {
      sectionTitle: '@',
      height: '@',
    },
    templateUrl: 'App/Common/components/subSection/subSection.html',
    link: function link(scope, elem, attr, ctrl) {
      if (attr.height) {
        var contentSection = $(elem).find('.sub-section-content');
        contentSection.css('height', attr.height);
        contentSection.css('overflow-y', 'auto');
      }

      elem.on('$destroy', function elementOnDestroy() {
        scope.$destroy();
      });
    },
  };
});
