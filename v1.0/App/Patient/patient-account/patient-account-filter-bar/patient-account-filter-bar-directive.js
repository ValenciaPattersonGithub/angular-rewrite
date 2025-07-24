'use strict';

angular
  .module('common.directives')
  .directive('patientAccountFilterBar', function () {
    return {
      restrict: 'E',
      scope: {
        route: '=',
        filterObject: '=',
        hideRunningBalance: '=',
        applyChangesFunction: '&',
        hideFilters: '=?',
      },
      templateUrl:
        'App/Patient/patient-account/patient-account-filter-bar/patient-account-filter-bar.html',
      controller: 'PatientAccountFilterBarController',
      link: function link(scope, element) {
        element.on('$destroy', function elementOnDestroy() {
          scope.$destroy();
        });
      },
    };
  });
