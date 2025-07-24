'use strict';

angular.module('Soar.BusinessCenter').controller('CarriersController', [
  '$scope',
  'patSecurityService',
  'toastrFactory',
  'localize',
  'BusinessCenterServices',
  'ListHelper',
  '$filter',
  '$timeout',
  '$location',
  'ReportsFactory',
  'FeatureFlagService',
  'FuseFlag',
  function (
    $scope,
    patSecurityService,
    toastrFactory,
    localize,
    businessCenterServices,
    listHelper,
    $filter,
    $timeout,
    $location,
    reportsFactory,
    featureFlagService,
    fuseFlag
  ) {
    var ctrl = this;
    $scope.currentPage = 0;
    $scope.pageCount = 30;
    $scope.allDataDisplayed = false;
    ctrl.sortCriteria = { CarrierName: 1 };
    ctrl.sortOrder = 1;
    $scope.isUpdating = true;
    $scope.activeFilter = true;
    $scope.inactiveFilter = false;
    $scope.searchFilter = '';
    $scope.reports = {};
    $scope.enablePayerIdCorrection = false;
    //#region Authorization

    // view access
    ctrl.authViewAccess = function () {
      return patSecurityService.IsAuthorizedByAbbreviation(
        'soar-ins-ibcomp-view'
      );
    };
    $scope.authBpbcViewAccess = function () {
      if (
        patSecurityService.IsAuthorizedByAbbreviation('soar-report-ins-cbybp')
      ) {
        return true;
      } else {
        return false;
      }
    };
    $scope.authCpaViewAccess = function () {
      if (
        patSecurityService.IsAuthorizedByAbbreviation('soar-report-ins-crrprd')
      ) {
        return true;
      } else {
        return false;
      }
    };
    $scope.authCpadViewAccess = function () {
      if (
        patSecurityService.IsAuthorizedByAbbreviation('soar-report-ins-crprdt')
      ) {
        return true;
      } else {
        return false;
      }
    };
    $scope.authCaViewAccess = function () {
      if (
        patSecurityService.IsAuthorizedByAbbreviation('soar-report-ins-carri')
      ) {
        return true;
      } else {
        return false;
      }
    };

    ctrl.authAccess = function () {
      if (!ctrl.authViewAccess()) {
        toastrFactory.error(
          patSecurityService.generateMessage('soar-ins-ibcomp-view'),
          'Not Authorized'
        );
        event.preventDefault();
        $location.path('/');
      } else {
        $scope.hasViewAccess = true;
      }
    };

    // authorization
    ctrl.authAccess();

    // #endregion

    $scope.reports = [];
    $scope.isReportDataLoaded = false;
    $scope.accessReportIds = [];
    $scope.selectedReport = { ReportId: 0 };
    ctrl.BenefitPlansbyCarrierReportId = 4;
    ctrl.CarrierProductivityAnalysisReportId = 33;
    ctrl.CarrierProductivityAnalysisDetailedReportId = 35;
    ctrl.CarriersReportId = 9;
    ctrl.getListOfServiceReports = function () {
      //this is getting the specific reports needed for Carriers by ID
      if (
        $scope.authBpbcViewAccess() &&
        $scope.authCpaViewAccess() &&
        $scope.authCpadViewAccess() &&
        $scope.authCaViewAccess()
      ) {
        $scope.accessReportIds = [
          ctrl.BenefitPlansbyCarrierReportId,
          ctrl.CarrierProductivityAnalysisReportId,
          ctrl.CarrierProductivityAnalysisDetailedReportId,
          ctrl.CarriersReportId,
        ];
      } else if ($scope.authBpbcViewAccess() && $scope.authCaViewAccess()) {
        $scope.accessReportIds = [
          ctrl.BenefitPlansbyCarrierReportId,
          ctrl.CarriersReportId,
        ];
      } else if ($scope.authCpadViewAccess() && $scope.authCpadViewAccess()) {
        $scope.accessReportIds = [
          ctrl.CarrierProductivityAnalysisReportId,
          ctrl.CarrierProductivityAnalysisDetailedReportId,
        ];
      } else if ($scope.authBpbcViewAccess()) {
        $scope.accessReportIds = [ctrl.BenefitPlansbyCarrierReportId];
      } else if ($scope.authCaViewAccess()) {
        $scope.accessReportIds = [ctrl.CarriersReportId];
      } else if ($scope.authCpaViewAccess() && $scope.authCpadViewAccess()) {
        $scope.accessReportIds = [
          ctrl.CarrierProductivityAnalysisReportId,
          ctrl.CarrierProductivityAnalysisDetailedReportId,
        ];
      } else if ($scope.authCpaViewAccess()) {
        $scope.accessReportIds = [ctrl.CarrierProductivityAnalysisReportId];
      } else if ($scope.authCpadViewAccess()) {
        $scope.accessReportIds = [
          ctrl.CarrierProductivityAnalysisDetailedReportId,
        ];
      }

      if ($scope.accessReportIds.length > 0) {
        reportsFactory
          .getReportArrayPromise($scope.accessReportIds)
          .then(data => {
            $scope.reports = data;
            $scope.isReportDataLoaded = true;
          });
      } else {
        $scope.reports = null;
        $scope.isReportDataLoaded = true;
      }
    };

    $scope.$watch('selectedReport.ReportId', function (nv, ov) {
      if (nv != ov && nv > 0) {
        var currentReport = $scope.reports[$scope.selectedReport.ReportId - 1];
        reportsFactory.OpenReportPage(
          currentReport,
          $scope.selectedView.Url.substring(1) +
            '/' +
            $scope.reports[
              $scope.selectedReport.ReportId - 1
            ].ReportTitle.replace(/\s/g, ''),
          true
        );
        $scope.selectedReport.ReportId = 0;
      }
    });

    $scope.initialize = function () {
      $scope.carriers = [];
      $scope.orderBy = {
        field: 'Name',
        asc: true,
      };
      $scope.loading = false;

      ctrl.lastElement = angular.element('#colName').addClass('active');
      ctrl.lastElement.find('span').addClass('fa-caret-down');
      ctrl.lastElement.find('span').removeClass('fa-sort');
      ctrl.getListOfServiceReports();
      $scope.getCarriers();
      ctrl.checkFeatureFlags();   
    };

    ctrl.checkFeatureFlags= function () {
      featureFlagService.getOnce$(fuseFlag.EnablePayerIdCorrection).subscribe((value) => {
        $scope.enablePayerIdCorrection = value;
      });      
    }

    $scope.getCarriers = function () {
      $scope.isUpdating = true;
      $scope.initialized = false;
      businessCenterServices.Carrier.search(
        {
          ReturnRows: true,
          PageCount: $scope.pageCount,
          CurrentPage: $scope.currentPage,
          SortCriteria: ctrl.sortCriteria,
          FilterCriteria: {
            ActiveStatus: ctrl.activeFilter(),
            SearchText: $scope.searchFilter,
          }, // PBI 316218
        },
        function (res) {
          if (res.Value.Rows.length != $scope.pageCount) {
            $scope.allDataDisplayed = true;
          }
          $scope.carriers = $scope.carriers.concat(res.Value.Rows);
          $scope.initialized = true;
          $timeout(function () {
            $scope.isUpdating = false;
          });
          $scope.currentPage++;
        },
        function (res) {
          $scope.loading = false;
          toastrFactory.error(
            localize.getLocalizedString(
              'Failed to retrieve the list of {0}. Please try again.',
              ['Carriers']
            ),
            'Error'
          );
        }
      );
      featureFlagService.getOnce$(fuseFlag.viewAddEditCarriersNewUi).subscribe((value) => {
        $scope.viewAddEditCarriersNewUi = value;
    });
    };

    ctrl.setPhoneHTMLTitle = function (carriers) {
      if (!carriers) return;

      angular.forEach(carriers, function (carrier) {
        carrier.phonesTitle = '';
        for (var i = 0; i < carrier.PhoneNumbers.length; i++) {
          carrier.phonesTitle +=
            (i > 0 ? ', ' : '') +
            $filter('tel')(carrier.PhoneNumbers[i].PhoneNumber) +
            (carrier.PhoneNumbers[i].Type
              ? ' (' + carrier.PhoneNumbers[i].Type.toLowerCase() + ')'
              : '');
        }
      });
    };
    ctrl.activeFilter = function () {
      if ($scope.activeFilter) {
        if ($scope.inactiveFilter) {
          return 3;
        }
        return 1;
      } else if ($scope.inactiveFilter) {
        return '2';
      } else {
        return 3;
      }
    };
    // function to apply orderBy functionality
    $scope.changeSorting = function (elemId, field) {
      ctrl.lastElement.removeClass('active');
      ctrl.lastElement.find('span').removeClass('fa-caret-up');
      ctrl.lastElement.find('span').removeClass('fa-caret-down');
      ctrl.lastElement.find('span').addClass('fa-sort');

      var asc = $scope.orderBy.field === field ? !$scope.orderBy.asc : true;
      $scope.orderBy = { field: field, asc: asc };

      switch (field) {
        case 'Name':
          if (ctrl.sortCriteria.CarrierName === 1) {
            ctrl.sortCriteria.CarrierName = 2;
          } else {
            ctrl.sortCriteria = { CarrierName: 1 };
          }
          break;

        case 'PayerId':
          if (ctrl.sortCriteria.PayerId === 1) {
            ctrl.sortCriteria.PayerId = 2;
          } else {
            ctrl.sortCriteria = { PayerId: 1 };
          }
          break;
      }

      var elem = angular.element('#' + elemId).addClass('active');
      elem.find('span').removeClass('fa-sort');
      elem.find('span').addClass(asc ? 'fa-caret-down' : 'fa-caret-up');

      ctrl.lastElement = elem;
      $scope.reloadGrid();
    };

    $scope.reloadGrid = function () {
      $scope.currentPage = 0;
      $scope.carriers = [];
      $scope.allDataDisplayed = false;
      $scope.getCarriers();
    };

    $scope.search = function (carrier) {
      if ($scope.filter == null || $scope.filter.length == 0) {
        return true;
      }

      var query = $scope.filter.toLowerCase();
      var phoneFilter = $scope.filter.replace(/[/()\s-]/g, '');

      if (
        (carrier.Name && carrier.Name.toLowerCase().indexOf(query) > -1) ||
        (carrier.PayerId && carrier.PayerId.toLowerCase().indexOf(query) > -1)
      ) {
        return true;
      }

      for (var i = 0; i < carrier.PhoneNumbers.length; i++) {
        if (carrier.PhoneNumbers[i].PhoneNumber.indexOf(phoneFilter) > -1) {
          return true;
        }
      }

      return false;
    };
  },
]);
