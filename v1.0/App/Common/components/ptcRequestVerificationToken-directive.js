'use strict';

angular.module('common.directives').directive('ptcRequestVerificationToken', [
  '$http',
  function ($http) {
    return function (scope, element, attrs) {
      $http.defaults.headers.common['X-XSRF-Token'] =
        attrs.ptcRequestVerificationToken;
    };
  },
]);
