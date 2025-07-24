'use strict';

angular
  .module('Soar.BusinessCenter')
  .directive('serviceCodeSearch', function () {
    return {
      restrict: 'E',
      scope: true,
      templateUrl:
        'App/BusinessCenter/service-code/service-code-search/service-code-search.html',
      controller: 'ServiceCodeSearchController',
    };
  });
