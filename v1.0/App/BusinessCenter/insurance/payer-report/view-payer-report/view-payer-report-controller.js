'use strict';
angular.module('Soar.BusinessCenter').controller('ViewPayerReportController', [
  '$scope',
  '$routeParams',
  '$location',
  'toastrFactory',
  'patSecurityService',
  'PayerReportsService',
  function (
    $scope,
    $routeParams,
    $location,
    toastrFactory,
    patSecurityService,
    payerReportsService
  ) {
    var report = $routeParams;
    $('body').addClass('payer-report-view');

    $scope.initialize = function () {
      payerReportsService.ViewPayerReport(
        {
          practiceId: report.practiceId,
          denticalId: report.platformPayerReportId,
        },
        function (res) {
          document.title = res.Result.ReportName;
          $scope.content = res.Result.ReportText;
        }
      );
    };

    $scope.initialize();
  },
]);
