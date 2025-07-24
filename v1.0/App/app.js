'use strict';

var app = angular
  .module('Soar.Main', [
    'Soar.Common',
    'Soar.Patient',
    'Soar.BusinessCenter',
    'Soar.Schedule',
    'PatShared',
    'Soar.Dashboard',
    'ui.bootstrap',
    'ui.select',
    'angular.filter',
    'angular-cache',
    'ngSanitize',
  ])
  .config([
    '$routeProvider',
    '$compileProvider',
    '$httpProvider',
    'SoarConfigProvider',
    function ($routeProvider, $compileProvider, $httpProvider, soarConfig) {
      // Configure ng-view routing
      $routeProvider
      // Default Dashboard Path
      .when('/', {
        templateUrl: 'App/Dashboard/user-dashboard-w.html',
        controller: 'UserDashboardWrapperController',
        title: 'Dashboard',
        data: {
          isPublic: true,
          amf: 'soar',
        },
      })
      .when('/paypage-redirect-callback', {
        template: '',
        controller: ['$routeParams', '$window', function($routeParams, $window) {
          $window.parent.dispatchEvent(new CustomEvent('paypageRedirectCallback', { detail: $routeParams }));
        }]
      })

      // Disabling Debug Data in all environments above QA
      // https://docs.angularjs.org/guide/production#disabling-debug-data
      //var environmentName = soarConfig.$get().environmentName;
      //var excludedEnvs = ['Dev45', 'FuseQA', 'QA2V45', 'DEMO45', 'localhost'];
      //if(!_.includes(excludedEnvs, environmentName)) {
      $compileProvider.debugInfoEnabled(false);
      //}

      // Disable comment and css class directives
      // Requires AngularJs 1.5.9 or higher
      // https://docs.angularjs.org/guide/production#disable-comment-and-css-class-directives
      if (!_.isUndefined($compileProvider.commentDirectivesEnabled)) {
        $compileProvider.commentDirectivesEnabled(false);
      }
      if (!_.isUndefined($compileProvider.cssClassDirectivesEnabled)) {
        $compileProvider.cssClassDirectivesEnabled(false);
      }
    },
  ])
  .config([
    '$sceDelegateProvider',
    function ($sceDelegateProvider) {
      var addWildcard = function (url) {
        if (url[url.length] !== '/') url += '/';
        return (url += '**');
      };

      // Configure trusted domains for iframes, so we do not use $sce.trustAsResourceUrl(),
      // except in cases of URL.createObjectUrl()
      $sceDelegateProvider.resourceUrlWhitelist([
        // Allow same origin resource loads.
        'self',
        'about:blank',
        // TODO for Fusion - add base urls for blue imaging, apteryx, anything used for iframes
        // & wrap each base url with addWildcard(url)
      ]);
    },
  ]);

app.run([
  '$rootScope',
  '$window',
  'Page',
  function ($rootScope, $window, page) {
    $rootScope.$on('$routeChangeSuccess', page.OnRouteChangeSuccess);

    $rootScope.$on('$routeChangeStart', page.OnRouteChangeStart);

    $rootScope.$on('$locationChangeStart', page.OnLocationChangeStart);

    $window.onbeforeunload = page.BeforeExit;
  },
]);
