'use strict';

angular.module('Soar.BusinessCenter').directive('reportGrid', function () {
  return {
    restrict: 'E',
    scope: {
      data: '=',
      showFilterMessage: '=',
      template: '=',
    },
    template: '<div ng-include="getTemplateUrl()"></div>',
    controller: [
      '$scope',
      'localize',
      function ($scope, localize) {
        $scope.noResultsMessage = localize.getLocalizedString(
          'No Data Matches Report Criteria.'
        );
        $scope.setFiltersMessage = localize.getLocalizedString(
          'Select filters to begin.'
        );

        $scope.launchClinicalTab = function (patientId, typeId, description) {
          return $scope.$parent.launchClinicalTab(
            patientId,
            typeId,
            description
          );
        };

        $scope.getTemplateUrl = function () {
          return 'App/BusinessCenter/reports/grid-templates/' + $scope.template;
        };
        $scope.getPagedReport = function () {
          $scope.$parent.currentPage++;
          $scope.$parent.getReport(false);
        };
        $scope.isUpdating = function () {
          return $scope.$parent.isUpdating;
        };
        $scope.allDataDisplayed = function () {
          return $scope.$parent.allDataDisplayed;
        };
      },
    ],
    link: function link(scope, element, attrs) {
      element.on('$destroy', function elementOnDestroy() {
        scope.$destroy();
      });
    },
  };
});
