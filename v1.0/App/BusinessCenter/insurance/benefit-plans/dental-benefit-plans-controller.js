'use strict';

angular.module('Soar.BusinessCenter').controller('BenefitPlansController', [
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
    reportsFactory
  ) {
    var ctrl = this;

    $scope.currentPage = 0;
    $scope.pageCount = 30;
    $scope.allDataDisplayed = false;
    ctrl.sortCriteria = { PlanName: 1 };
    ctrl.sortOrder = 1;
    $scope.isUpdating = true;
    $scope.activeFilter = true;
    $scope.inactiveFilter = false;
    $scope.reports = {};
    //#region Authorization

    // view access

    ctrl.authViewAccess = function () {
      return patSecurityService.IsAuthorizedByAbbreviation(
        'soar-ins-ibplan-view'
      );
    };
    $scope.authpbybpViewAccess = function () {
      if (
        patSecurityService.IsAuthorizedByAbbreviation('soar-report-pat-pbybp')
      ) {
        return true;
      } else {
        return false;
      }
    };
    ctrl.authAccess = function () {
      if (!ctrl.authViewAccess()) {
        toastrFactory.error(
          patSecurityService.generateMessage('soar-ins-ibplan-view'),
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
    $scope.selectedReport = { ReportId: 0 };
    ctrl.PatientbyBenefitPlan = 6;
    ctrl.getListOfServiceReports = function () {
      if ($scope.authpbybpViewAccess()) {
        $scope.accessReportIds = [ctrl.PatientbyBenefitPlan];
        reportsFactory
          .getReportArrayPromise($scope.accessReportIds)
          .then(data => {
            $scope.planReport = data;
            $scope.isReportDataLoaded = true;
          });
      } else {
        $scope.planReport = null;
        $scope.isReportDataLoaded = true;
      }
    };

    $scope.$watch('selectedReport.ReportId', function (nv, ov) {
      if (nv != ov && nv > 0) {
        var currentReport =
          $scope.planReport[$scope.selectedReport.ReportId - 1];
        reportsFactory.OpenReportPage(
          currentReport,
          $scope.selectedView.Url.substring(1) +
            '/' +
            currentReport.ReportTitle.replace(/\s/g, ''),
          true
        );
        $scope.selectedReport.ReportId = 0;
      }
    });

    $scope.initialize = function () {
      $scope.benefitPlans = [];
      $scope.carriers = [];
      $scope.feeSchedules = [];

      $scope.orderBy = {
        field: 'Name',
        asc: true,
      };
      $scope.loading = false;

      ctrl.lastElement = angular.element('#colName').addClass('active');
      ctrl.lastElement.find('span').addClass('fa-caret-up');
      ctrl.lastElement.find('span').removeClass('fa-sort');
      ctrl.getListOfServiceReports();
      $scope.getBenefitPlans();
    };

    $scope.getBenefitPlans = function () {
      $scope.isUpdating = true;
      $scope.initialized = false;
      businessCenterServices.BenefitPlan.search(
        {
          ReturnRows: true,
          PageCount: $scope.pageCount,
          CurrentPage: $scope.currentPage,
          SortCriteria: ctrl.sortCriteria,
          FilterCriteria: {
            ActiveStatus: ctrl.activeFilter(),
            SearchText: $scope.searchFilter,
          }, // PBI 316219
        },
        function (res) {
          if (res.Value.Rows.length != $scope.pageCount) {
            $scope.allDataDisplayed = true;
          }
          $scope.benefitPlans = $scope.benefitPlans.concat(res.Value.Rows);
          //ctrl.setPhoneHTMLTitle($scope.benefitPlans);
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
              ['plans']
            ),
            'Error'
          );
        }
      );
    };

    ctrl.activeFilter = function () {
      if ($scope.activeFilter) {
        if ($scope.inactiveFilter) {
          return 3;
        }
        return 1;
      } else if ($scope.inactiveFilter) {
        return 2;
      } else {
        return 3;
      }
    };

    //ctrl.setPhoneHTMLTitle = function (benefitPlans) {
    //	if (!benefitPlans) return;

    //	angular.forEach(benefitPlans, function (carrier) {
    //		benefitPlans.phonesTitle = '';
    //		for (var i = 0; i < benefitPlans.PhoneNumbers.length; i++) {
    //			benefitPlans.phonesTitle += (i > 0 ? ', ' : '') + $filter('tel')(benefitPlans.PhoneNumbers[i].PhoneNumber) + (benefitPlans.PhoneNumbers[i].Type ? ' (' + benefitPlans.PhoneNumbers[i].Type.toLowerCase() + ')' : '');
    //		}
    //	});
    //};

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
          if (ctrl.sortCriteria.PlanName === 1) {
            ctrl.sortCriteria.PlanName = 2;
          } else {
            ctrl.sortCriteria = { PlanName: 1 };
          }
          break;

        case 'CarrierName':
          if (ctrl.sortCriteria.CarrierName === 1) {
            ctrl.sortCriteria.CarrierName = 2;
          } else {
            ctrl.sortCriteria = { CarrierName: 1 };
          }
          break;

        case 'PlanGroupNumber':
          if (ctrl.sortCriteria.PlanGroupNumber === 1) {
            ctrl.sortCriteria.PlanGroupNumber = 2;
          } else {
            ctrl.sortCriteria = { PlanGroupNumber: 1 };
          }
          break;

        case 'FeeScheduleName':
          if (ctrl.sortCriteria.FeeScheduleName === 1) {
            ctrl.sortCriteria.FeeScheduleName = 2;
          } else {
            ctrl.sortCriteria = { FeeScheduleName: 1 };
          }
          break;
      }

      var elem = angular.element('#' + elemId).addClass('active');
      elem.find('span').removeClass('fa-sort');
      elem.find('span').addClass(asc ? 'fa-caret-up' : 'fa-caret-down');

      ctrl.lastElement = elem;
      $scope.reloadGrid();
    };

    $scope.reloadGrid = function () {
      $scope.currentPage = 0;
      $scope.benefitPlans = [];
      $scope.allDataDisplayed = false;
      $scope.getBenefitPlans();
    };

    $scope.search = function (benefitPlan) {
      if ($scope.filter == null || $scope.filter.length == 0) {
        return true;
      }

      var query = $scope.filter.toLowerCase();
      //var phoneFilter = $scope.filter.replace(/[/()\s-]/g, '');

      if (
        (benefitPlan.Name &&
          benefitPlan.Name.toLowerCase().indexOf(query) > -1) ||
        (benefitPlan.PayerId &&
          benefitPlan.PayerId.toLowerCase().indexOf(query) > -1) ||
        (benefitPlan.$CarrierName &&
          benefitPlan.$CarrierName.toLowerCase().indexOf(query) > -1) ||
        (benefitPlan.PlanGroupNumber &&
          benefitPlan.PlanGroupNumber.toLowerCase().indexOf(query) > -1)
      ) {
        return true;
      }

      //for (var i = 0; i < benefitPlan.PhoneNumbers.length; i++) {
      //	if (benefitPlan.PhoneNumbers[i].PhoneNumber.indexOf(phoneFilter) > -1) {
      //		return true;
      //	}
      //}

      return false;
    };

    $scope.initialize();
  },
]);
