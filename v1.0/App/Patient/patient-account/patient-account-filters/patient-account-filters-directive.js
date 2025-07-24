'use strict';

angular
  .module('common.directives')
  .directive('patientAccountFilters', function () {
    return {
      restrict: 'E',
      scope: {
        accountMembers: '=',
        allProviders: '=',
        currentPatientId: '=',
        filtersApplied: '=',
        list1: '=',
        list2: '=',
      },
      template:
        '<filter-box ng-if="data.activeTeeth !== undefined && data.providers !== undefined" data="data" ' +
        'filter-function="filterFunction" filter-object="filterObject" filter-template="filterTemplate" ' +
        'list1="list1" list2="list2" original-filter-object="originalFilterObject"></filter-box>',
      controller: 'PatientAccountFiltersController',
      link: function link(scope, element, attrs) {
        element.on('$destroy', function elementOnDestroy() {
          scope.$destroy();
        });
      },
    };
  });
