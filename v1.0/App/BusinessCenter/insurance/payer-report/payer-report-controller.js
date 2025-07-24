'use strict';
angular.module('Soar.BusinessCenter').controller('PayerReportsController', [
  '$scope',
  '$rootScope',
  '$routeParams',
  '$location',
  '$q',
  '$timeout',
  '$filter',
  'localize',
  'toastrFactory',
  'patSecurityService',
  'PayerReportsService',
  'tabLauncher',
  function (
    $scope,
    $rootScope,
    $routeParams,
    $location,
    $q,
    $timeout,
    $filter,
    localize,
    toastrFactory,
    patSecurityService,
    payerReportsService,
    tabLauncher
  ) {
    var ctrl = this;
    $scope.reports = [];
    $scope.currentPage = 0;
    $scope.pageCount = 20;
    $scope.allDataDisplayed = false;
    ctrl.sortCriteria = { Date: 1 };
    ctrl.sortOrder = 1;
    $scope.filterByIsProcessed = false;

    ctrl.lastElement = angular.element('#colDate').addClass('active');
    ctrl.lastElement.find('span').addClass('fa-caret-down');
    ctrl.lastElement.find('span').removeClass('fa-sort');

    $scope.processedSearchOptions = [
      {
        IsProcessed: false,
        Description: localize.getLocalizedString('Not Completed'),
      },
      {
        IsProcessed: true,
        Description: localize.getLocalizedString('Completed'),
      },
      {
        IsProcessed: null,
        Description: localize.getLocalizedString('Show All'),
      },
    ];
    $scope.processedOptions = [
      {
        IsProcessed: false,
        Description: localize.getLocalizedString('Not Completed'),
      },
      {
        IsProcessed: true,
        Description: localize.getLocalizedString('Completed'),
      },
    ];

    $scope.getReports = function (changeFilter) {
      $scope.isUpdating = true;
      $scope.initialized = false;

      payerReportsService.GetPayerReports(
        {
          FilterCriteria: { IsProcessed: $scope.filterByIsProcessed },
          ReturnRows: true,
          PageCount: $scope.pageCount,
          CurrentPage: $scope.currentPage,
          SortCriteria: ctrl.sortCriteria,
        },
        function (res) {
          if (res.Value.Rows.length != $scope.pageCount) {
            $scope.allDataDisplayed = true;
          }
          res.Value.Rows.forEach(report => {
            if (
              report.ReportName === null ||
              report.ReportName === 'undefined'
            ) {
              report.ReportName = localize.getLocalizedString('LABEL');
            }
          });
          $scope.reports = $scope.reports.concat(res.Value.Rows);
          $scope.initialized = true;
          $timeout(function () {
            $scope.isUpdating = false;
          });
          $scope.currentPage++;
        },
        function (res) {
          toastrFactory.error(
            localize.getLocalizedString('Failed to retrieve payer reports')
          );
        }
      );
    };

    $scope.updatePayerReport = function (payerReport) {
      payerReportsService.AssignReportProcessedStatus(
        {
          payerReportId: payerReport.PayerReportId,
          isProcessed: payerReport.IsProcessed,
        },
        function (res) {
          $scope.resetInfiniteScroll();
        },
        function (res) {}
      );
    };

    $scope.viewReport = function (report) {
      tabLauncher.launchNewTab(
        '#/BusinessCenter/Insurance/payerreport/' +
          report.PracticeId +
          '/' +
          report.PlatformPayerReportId
      );
    };

    $scope.changeSorting = function (elemId, field) {
      if (ctrl.lastElement.find('span').hasClass('fa-caret-down')) {
        var asc = true;
      } else {
        var asc = false;
      }
      ctrl.lastElement.find('span').removeClass('fa-caret-up');
      ctrl.lastElement.find('span').removeClass('fa-caret-down');
      ctrl.lastElement.find('span').addClass('fa-sort');

      switch (field) {
        case 'Date':
          if (ctrl.sortCriteria.Date === 1) {
            ctrl.sortCriteria.Date = 2;
          } else {
            ctrl.sortCriteria = { Date: 1 };
          }
          break;

        case 'TaxId':
          if (ctrl.sortCriteria.TaxId === 1) {
            ctrl.sortCriteria.TaxId = 2;
          } else {
            ctrl.sortCriteria = { TaxId: 1 };
          }
          break;

        case 'ReportName':
          if (ctrl.sortCriteria.ReportName === 1) {
            ctrl.sortCriteria.ReportName = 2;
          } else {
            ctrl.sortCriteria = { ReportName: 1 };
          }
          break;

        case 'IsProcessed':
          if (ctrl.sortCriteria.IsProcessed === 1) {
            ctrl.sortCriteria.IsProcessed = 2;
          } else {
            ctrl.sortCriteria = { IsProcessed: 1 };
          }
          break;
      }
      $scope.resetInfiniteScroll();

      var elem = angular.element('#' + elemId).addClass('active');
      elem.find('span').removeClass('fa-sort');
      elem.find('span').addClass(asc ? 'fa-caret-up' : 'fa-caret-down');
      ctrl.lastElement = elem;
    };

    $scope.resetInfiniteScroll = function () {
      $scope.isUpdating = true;
      $scope.allDataDisplayed = false;
      $scope.currentPage = 0;
      $scope.reports = [];
      $scope.getReports();
    };
  },
]);
