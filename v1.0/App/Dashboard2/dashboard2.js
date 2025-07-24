'use strict';

angular
  .module( [
    'ngRoute',
    'ui.bootstrap',
    'ngAnimate',
    'ngResource',
    'ngSanitize',
    'common.directives',
    'ui.utils',
    'common.controllers',
    'common.factories',
    'common.filters',
    'common.services',
    'localytics.directives',
    'PatWebCore',
    'kendo.directives',
  ])
  .config([
    '$routeProvider',
    function ($routeProvider) {
      // Configure ng-view routing
      $routeProvider
        // Dashboard2 Path
        .when('/Dashboard2/', {
          template: '<dash-board></dash-board>',
          title: 'Dashboard2',
          data: {
            moduleName: 'Dashboard2',
            amf: 'soar-lrn-lrn-view',
          },
        })
        // Catch all redirects home
        .otherwise({
          redirectTo: '/',
        });
    },
  ]);
