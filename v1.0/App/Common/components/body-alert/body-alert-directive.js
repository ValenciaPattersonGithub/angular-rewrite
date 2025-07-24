'use strict';

// Body Alert Directive
// This directive is to apply a style to the body whenever an alert is present

angular.module('common.directives').directive('bodyAlert', function () {
  return {
    restrict: 'A',
    controller: 'BodyAlertController',
    link: function link(scope, element, attrs) {
      element.ready(function elementReady() {
        //This is a performance tweak that keeps this control from holding on to all of the references created by bootstrap for each screen.
        //Without this, a destroy listener is registered which keeps multiple megs of bootstrap registrations in memory.
        scope.$watch('$$listeners', function () {
          if (
            scope &&
            scope.$$listeners &&
            scope.$$listeners.$destroy &&
            scope.$$listeners.$destroy !== []
          ) {
            scope.$$listeners.$destroy = [];
            scope.$watchCollection('$$listeners.$destroy', function () {
              if (
                scope &&
                scope.$$listeners &&
                scope.$$listeners.$destroy &&
                scope.$$listeners.$destroy !== []
              ) {
                scope.$$listeners.$destroy = [];
              }
            });
          }
        });
      });
    },
  };
});
