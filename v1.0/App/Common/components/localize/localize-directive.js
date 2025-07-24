'use strict';
// To use: i18n="Localize this string" or i18n="i18n-placeholder" to localize a placeholder

angular.module('common.directives').directive('i18n', [
  'localize',
  function (localize) {
    var i18nDirective;

    i18nDirective = {
      restrict: 'EA',
      updateText: function (ele, input, placeholder) {
        var result;
        result = void 0;
        if (input === 'i18n-placeholder') {
          result = localize.getLocalizedString(placeholder);
          return ele.attr('placeholder', result);
        } else if (input.length >= 1) {
          result = localize.getLocalizedString(input);
          return ele.text(result);
        }
      },
      link: function link(scope, ele, attrs) {
        // Listen to localize event to update values (language switcher)
        scope.$on('localizeResourcesUpdated', function () {
          return i18nDirective.updateText(ele, attrs.i18n, attrs.placeholder);
        });
        ele.on('$destroy', function elementOnDestroy() {
          scope.$destroy();
        });
        return attrs.$observe('i18n', function (value) {
          return i18nDirective.updateText(ele, value, attrs.placeholder);
        });
      },
    };
    return i18nDirective;
  },
]);
