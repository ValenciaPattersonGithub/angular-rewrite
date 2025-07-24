'use strict';
angular
  .module('common.directives')
  .directive('spellCheck', function () {
    return {
      restrict: 'A',
      controller: function () {
        //nothing here
      },
      link: function (scope, element, attrs, ctrl) {
        //TODO: needs to pass this value to child directive's
        scope.spellCheck = attrs.spellCheck;
      },
    };
  })
  .directive('input', function () {
    return {
      restrict: 'E',
      priority: -1000,
      require: '^?spellCheck',
      link: function (scope, element, attrs, ctrl) {
        if (ctrl) {
          if (element[0].type === 'text') {
            if (!attrs.spellcheck) {
              attrs.$set('spellcheck', true);
            }
          }
        }
      },
    };
  })
  .directive('textarea', function () {
    return {
      restrict: 'E',
      priority: -1000,
      require: '^?spellCheck',
      link: function (scope, element, attrs, ctrl) {
        if (ctrl) {
          if (!attrs.spellcheck) {
            attrs.$set('spellcheck', true);
          }
        }
      },
    };
  });
