'use strict';

angular
  .module('Soar.Patient')
  .directive('encounterBalanceIndicator', function () {
    return {
      restrict: 'A',
      scope: {
        amount: '@',
        tile: '=',
      },
      link: function link($scope, $element) {
        $scope.$watch('amount', function (nv) {
          if (parseFloat(nv) <= 0) {
            $($element).css('background', 'limegreen');
            $($element).css('color', 'white');
          } else {
            if ($scope.tile) {
              $($element).css('background', 'steelblue');
              $($element).css('color', 'white');
            } else {
              $($element).css('background', '');
              $($element).css('color', '');
            }
          }
        });

        $element.on('$destroy', function elementOnDestroy() {
          $scope.$destroy();
        });
      },
    };
  });
