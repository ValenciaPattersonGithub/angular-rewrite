'use strict';
angular.module('common.directives').filter('i18n', [
  'localize',
  function (localize) {
    return function (input, params) {
      return localize.getLocalizedString(input, params);
    };
  },
]);
