'use strict';

angular.module('common.controllers').controller('BoxSelectorItemController', [
  '$scope',
  '$timeout',
  '$compile',
  function ($scope, $timeout, $compile) {
    $scope.$watch('element', function (nv) {
      if (nv) {
        $timeout(function () {
          var ele = angular.element(nv).find('>ng-include>div');
          ele.append(
            '<span ng-class="{ \'boxSelector__itemSelected\': item.$selected == true }" ></span>'
          );
          $compile(ele.contents())($scope);
        }, 100);
      }
    });
  },
]);
