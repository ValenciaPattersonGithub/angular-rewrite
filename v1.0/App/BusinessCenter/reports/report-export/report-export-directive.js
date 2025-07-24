'use strict';

angular.module('Soar.BusinessCenter').directive('reportExport', function () {
  return {
    restrict: 'E',
    scope: {
      getAllData: '=getAllData',
      reportId: '=reportId',
      isCustomReport: '=isCustomReport',
      exportDisabled: '=exportDisabled',
      exportNewApi: '=exportNewApi'
    },
    templateUrl: 'App/BusinessCenter/reports/report-export/report-export.html',
    controller: 'ReportExportController',
    link: function link(scope, element, attrs) {
      element.on('$destroy', function elementOnDestroy() {
        scope.$destroy();
      });
    },
  };
});
