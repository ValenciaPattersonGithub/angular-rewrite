'use strict';

angular
  .module('common.directives')
  .directive('setFocus', [
    '$timeout',
    function ($timeout) {
      return {
        restrict: 'A',
        link: function (scope, elem, attr, ctrl) {
          scope.setTimeout = function () {
            $timeout(function () {
              var e;
              if (attr.setFocus) {
                e = $(elem[0].parentElement).find(attr.setFocus);
                e[0].focus();
              } else if (attr.kendoDropDownList === '') {
                e = $(elem[0].parentElement);
                e[0].focus();
              } else {
                $(elem[0]).focus();
              }
            }, 500);
          };

          $(scope.setTimeout);
        },
      };
    },
  ])

  .directive('setFocusIf', [
    '$timeout',
    function ($timeout) {
      return {
        restrict: 'A',
        scope: {
          setFocusIf: '@',
        },
        link: function (scope, elem, attr) {
          scope.$watch('setFocusIf', function (shouldFocus) {
            if (shouldFocus) {
              scope.setTimeout = function () {
                $timeout(function () {
                  var e;
                  var condition = scope.$eval(attr.setFocusIf);
                  if (attr.ele) {
                    if (condition) {
                      e = $(elem[0].parentElement).find(attr.ele);
                      e[0].focus();
                    }
                  } else if (attr.kendoDropDownList === '') {
                    if (condition) {
                      e = $(elem[0].parentElement);
                      e[0].focus();
                    }
                  } else {
                    if (condition) {
                      $(elem[0]).focus();
                    }
                  }
                }, 500);
              };
              $(scope.setTimeout);
            }
          });
        },
      };
    },
  ])

  .directive('focusEnter', [
    function () {
      return {
        restrict: 'A',
        link: function ($scope, elem, attrs) {
          elem.bind('keydown', function (e) {
            var code = e.keyCode || e.which;
            if (code === 13) {
              e.preventDefault();
              elem.next().focus();
            }
          });
        },
      };
    },
  ])
  .directive('showFocus', [
    '$timeout',
    function ($timeout) {
      return {
        restrict: 'A',
        link: function link(scope, element, attrs) {
          scope.$watch(
            attrs.showFocus,
            function (newValue) {
              $timeout(function () {
                if (element.find('textarea')[0]) {
                  newValue && element.find('textarea')[0].focus();
                } else {
                  newValue && element.find('input')[0].focus();
                }
              }, 500);
            },
            true
          );
        },
      };
    },
  ]);
