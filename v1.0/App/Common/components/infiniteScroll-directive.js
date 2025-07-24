'use strict';

angular
  .module('common.directives')
  .directive('soarInfiniteScroll', function () {
    return {
      link: function (scope, elem, attr) {
        var raw = elem[0];

        scope.handleScrollEvent = function () {
          if (
            raw.scrollTop + raw.offsetHeight >= raw.scrollHeight &&
            !_.isUndefined(attr.soarInfiniteScroll)
          ) {
            scope.$apply(attr.soarInfiniteScroll);
          }
        };

        elem.bind('scroll', function () {
          scope.handleScrollEvent();
        });
      },
    };
  });
