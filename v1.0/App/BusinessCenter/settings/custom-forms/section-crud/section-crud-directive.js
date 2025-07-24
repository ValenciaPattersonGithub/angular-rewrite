'use strict';

angular.module('Soar.BusinessCenter').directive('sectionCrud', function () {
  return {
    restrict: 'E',
    scope: true,
    templateUrl:
      'App/BusinessCenter/settings/custom-forms/section-crud/section-crud.html',
    controller: 'SectionCrudController',
  };
});
