'use strict';

angular.module('common.directives').directive('serviceCodeSelector', [
  '$rootScope',
  function ($rootScope) {
    return {
      restrict: 'E',
      scope: {
        onAdd: '=',
        codes: '=?',
        personId: '@?',
        plannedServices: '=?',
        hasDataChanged: '=?',
        editableDate: '=?',
        minDate: '=?',
        maxDate: '=?',
        defaultDate: '=?',
        fieldOptions: '=?',
        appointment: '=?',
        appointmentType: '=?',
        hideProvider: '=',
      },
      templateUrl:
        'App/Common/components/serviceCodeSelector/serviceCodeSelector.html',
      controller: 'ServiceCodeSelectorController',
      link: function link(scope, element, attrs) {
        element.on('$destroy', function elementOnDestroy() {
          scope.$destroy();
        });
      },
    };
  },
]);
