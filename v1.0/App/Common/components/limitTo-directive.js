'use strict';

angular.module('common.directives').directive('limitTo', [
  function () {
    return {
      restrict: 'A',
      link: function (scope, elem, attrs) {
        var limit = parseInt(attrs.limitTo);
        angular.element(elem).on('keypress', function (e) {
          // if the length exceeds the limit ... do not enter any more characters.
          if (this.value.length > limit) e.preventDefault();
        });
      },
    };
  },
]);
