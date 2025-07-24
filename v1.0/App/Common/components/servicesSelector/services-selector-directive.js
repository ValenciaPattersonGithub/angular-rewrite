'use strict';

angular.module('common.directives').directive('servicesSelector', [
  '$rootScope',
  function ($rootScope) {
    return {
      restrict: 'E',
      scope: {
        onAdd: '=',
        codes: '=?',
        personId: '=',
        serviceTransactions: '=?',
        hasDataChanged: '=?',
        editableDate: '=?',
        minDate: '=?',
        maxDate: '=?',
        defaultDate: '=?',
        fieldOptions: '=?',
        appointment: '=?',
        appointmentType: '=?',
        hideProvider: '=',
        currentPatient: '=?',
        disableAddButtons: '=?',
      },
      templateUrl:
        'App/Common/components/servicesSelector/services-selector.html',
      controller: 'ServicesSelectorController',
      link: function link(scope, element, attrs) {
        element.on('$destroy', function elementOnDestroy() {
          scope.$destroy();
        });
      },
    };
  },
]);
