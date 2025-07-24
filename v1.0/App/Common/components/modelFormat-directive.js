angular.module('common.directives').directive('modelFormat', [
  'modelFormats',
  '$filter',
  '$parse',
  '$timeout',
  function (modelFormatConfig, $filter, $parse, $timeout) {
    return {
      require: 'ngModel',
      link: function (scope, element, attrs, ctrl) {
        var config = modelFormatConfig[attrs.modelFormat] || {};

        var parseFuction = function (funKey) {
          if (attrs[funKey]) {
            var func = $parse(attrs[funKey]);
            return function (args) {
              return func(scope, args);
            };
          }
          return config[funKey];
        };

        var modelOptionUpdateOnBlurInUse =
          attrs['ngModelOptions'] &&
          attrs['ngModelOptions'].match("updateOn: '[^']*blur'") != null;
        var formatter = parseFuction('formatter');
        var parser = parseFuction('parser');
        var isEmpty = parseFuction('isEmpty');
        var keyDown = parseFuction('keyDown');
        var getModelValue = function () {
          return $parse(attrs.ngModel)(scope);
        };

        if (keyDown) {
          element
            .bind('blur', function () {
              if (modelOptionUpdateOnBlurInUse) {
                $timeout(function () {
                  ctrl.blurEvent();
                });
              } else {
                ctrl.blurEvent();
              }
            })
            .bind('keydown', function (event) {
              keyDown({
                $event: event,
                $viewValue: element.val(),
                $modelValue: getModelValue(),
                $attrs: attrs,
                $eval: scope.$eval,
                $ngModelCtrl: ctrl,
              });
            });
        }

        ctrl.blurEvent = function () {
          element.val(
            formatter({
              $modelValue: getModelValue(),
              $filter: $filter,
              $attrs: attrs,
              $eval: scope.$eval,
            })
          );
        };

        ctrl.$parsers.push(function (viewValue) {
          return parser({
            $viewValue: viewValue,
            $attrs: attrs,
            $eval: scope.$eval,
          });
        });

        ctrl.$formatters.push(function (value) {
          return formatter({
            $modelValue: value,
            $filter: $filter,
            $attrs: attrs,
            $eval: scope.$eval,
          });
        });

        ctrl.$isEmpty = function (value) {
          return isEmpty({
            $modelValue: value,
            $attrs: attrs,
            $eval: scope.$eval,
          });
        };
      },
    };
  },
]);
