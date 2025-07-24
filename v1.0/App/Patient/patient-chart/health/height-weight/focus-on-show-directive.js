'use strict';

angular.module('Soar.Patient').directive('focusOnShow', [
  '$timeout',
  function ($timeout) {
    return {
      restrict: 'A',
      link: function ($scope, $element, $attr) {
        if ($attr.ngShow) {
          $scope.$watch($attr.ngShow, function (newValue) {
            if (newValue) {
              $timeout(function () {
                $element[0].focus();
                $element[0].setSelectionRange(0, $element[0].value.length);
              }, 0);
            }
          });
        }
        if ($attr.ngHide) {
          $scope.$watch($attr.ngHide, function (newValue) {
            if (!newValue) {
              $timeout(function () {
                $element[0].focus();
              }, 0);
            }
          });
        }
      },
    };
  },
]);
