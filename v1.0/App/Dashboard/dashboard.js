'use strict';

angular
    .module('Soar.Dashboard', [
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
        'gridster',
        'Soar.Widget',
    ])
    .config([
        '$routeProvider',
        '$httpProvider',
        'SoarConfigProvider',
        function ($routeProvider, $httpProvider, soarConfig) {
            // Configure ng-view routing
            $routeProvider
                // Default Dashboard Path
                .when('/Dashboard/', {
                    templateUrl: 'App/Dashboard/user-dashboard-w.html',
                    controller: 'UserDashboardWrapperController',
                    title: 'Dashboard',
                    data: {
                        moduleName: 'Dashboard',
                        amf: 'soar-dsh-dsh-view',
                    },
                })
                .when('/Dashboard2/', {
                    template: '<dash-board></dash-board>',
                    title: 'Dashboard2',
                    data: {
                        amf: 'soar-dsh-dsh-view',
                    },
                })
                .when('/Engagement/', {
                    template: '<solution-reach></solution-reach>',
                    title: 'Engagement',
                })    
                  // Support MFE Route interim
                  .when('/patientv2', {
                }).when('/patientv2/:subroute', {
                }).when('/patientv2/:subroute/:subroute1', {
                })
                
                .when('/schedule/v2', {
                }).when('/schedule/v2/:subroute', {
                }).when('/schedule/v2/:subroute/:subroute1', {
                })
                
                .when('/schedule/alt-v2', {
                }).when('/schedule/alt-v2/:subroute', {
                }).when('/schedule/alt-v2/:subroute/:subroute1', {
                })
                .when('/practiceSettings', {
                }).when('/practiceSettings/:subroute', {
                }).when('/practiceSettings/:subroute/:subroute1', {
                })
                
                .when('/Help', {
                })
                // Catch all redirects home
                .otherwise({
                    redirectTo: '/',
                });
        },
    ]);
