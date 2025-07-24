'use strict';

angular.module('common.directives').directive('personList', [
  'localize',
  'userSettingsDataService',
  function (localize, userSettingsDataService) {
    return {
      restrict: 'E',
      scope: {
        baseId: '@',
        currentPersonId: '@',
        list: '=',
        showNewPatientHeader: '=',
      },
      templateUrl: 'App/Common/components/personList/personList.html',
    };
  },
]);
