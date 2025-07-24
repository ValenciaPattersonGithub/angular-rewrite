'use strict';

angular.module('Soar.Schedule').directive('idealDaysCrud', function () {
  return {
    restrict: 'E',
    scope: {
      saveIdealDay: '=',
      cancel: '=',
      data: '=',
    },
    templateUrl: 'App/Schedule/ideal-days/ideal-days-crud/ideal-days-crud.html',
    controller: 'IdealDaysCrudController',
    link: function link(scope, element, attrs) {
      element.on('$destroy', function elementOnDestroy() {
        scope.$destroy();
      });
    },
  };
});
