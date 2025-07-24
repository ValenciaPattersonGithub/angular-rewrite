'use strict';

angular
  .module('common.directives')
  .directive('charPattern', [
    '$parse',
    function ($parse) {
      return {
        restrict: 'A',
        require: 'ngModel',
        link: function (scope, iElement, iAttrs, controller) {
          scope.$watch(iAttrs.ngModel, function (value) {
            if (!value) {
              return;
            }
            $parse(iAttrs.ngModel).assign(
              scope,
              value.replace(new RegExp(iAttrs.charPattern, 'gi'), '')
            );
          });
        },
      };
    },
  ])
  .directive('charPatternExt', [
    '$parse',
    function ($parse) {
      return {
        restrict: 'A',
        require: 'ngModel',
        link: function (scope, iElement, iAttrs, controller) {
          scope.$watch(iAttrs.ngModel, function (value) {
            if (!value || !value.replace) {
              return;
            }
            $parse(iAttrs.ngModel).assign(
              scope,
              value.replace(new RegExp(iAttrs.charPatternExt, 'gi'), '')
            );
          });
        },
      };
    },
  ]);
