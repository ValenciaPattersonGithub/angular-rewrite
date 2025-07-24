'use strict';
angular.module('common.directives').directive('syncFocusWith', function () {
  return {
    restrict: 'A',
    scope: {
      focusValue: '=syncFocusWith',
    },
    controller: [
      '$scope',
      '$element',
      function ($scope, $element) {
        $scope.$watch('focusValue', function () {
          var el = $element[0];
          // if element is a kendo combobox, we need to focus/blur the dynamically
          // generated input field rather than the select itself
          var isKendoComboBox = false;
          if (el.attributes) {
            angular.forEach(el.attributes, function (attr) {
              if (!isKendoComboBox) {
                if (attr.name === 'kendo-combo-box') {
                  isKendoComboBox = true;
                }
              }
            });
          }
          if (isKendoComboBox) {
            var parent = angular.element($element[0].parentElement);
            el = parent.find('input');
          }
          if ($scope.focusValue) {
            el.focus();
          } else {
            el.blur();
          }
        });
      },
    ],
  };
});
