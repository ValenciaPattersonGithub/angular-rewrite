'use strict';

var app = angular.module('Soar.BusinessCenter');
var UserLandingControl = app.controller('UserLandingController', [
  '$scope',
  '$location',
  'localize',
  function ($scope, $location, localize) {
    var ctrl = this;

    //breadcrumbs
    $scope.dataForCrudOperation = {};
    $scope.dataForCrudOperation = { DataHasChanged: false };
    $scope.dataForCrudOperation.BreadCrumbs = [
      {
        name: localize.getLocalizedString('Practice Settings'),
        path: '/BusinessCenter/PracticeSettings/',
        title: 'Practice Settings',
      },
      {
        name: localize.getLocalizedString('All Team Members'),
        title: 'All Team Members',
      },
    ];

    // handle URL update for breadcrumbs
    $scope.changePageState = function (breadcrumb) {
      ctrl.currentBreadcrumb = breadcrumb;
      document.title = breadcrumb.title;
      $location.url(ctrl.currentBreadcrumb.path);
    };
    //#endregion
  },
]);
