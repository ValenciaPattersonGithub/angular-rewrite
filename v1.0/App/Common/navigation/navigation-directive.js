'use strict';

angular
  .module('Soar.Common')
  .directive('navBar', function () {
    return {
      restrict: 'E',
      scope: {
        navClicked: '=',
      },
      templateUrl: 'App/Common/navigation/navigation.html',
      controller: 'NavigationCtrl',
    };
  })
  .directive('secondaryNav', function () {
    return {
      restrict: 'E',
      replace: true,
      transclude: true,
      scope: {},
      templateUrl: 'App/Common/navigation/secondaryNav.html',
      controller: 'NavigationCtrl',
    };
  });
