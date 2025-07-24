'use strict';

angular
  .module('Soar.BusinessCenter')
  .controller('ReportPageController', [
    '$scope',
    '$rootScope',
    'localize',
    '$location',
    '$routeParams',
    'ReportsFactory',
    'toastrFactory',
    'patSecurityService',
    '$timeout',
    '$window',
    'ReportIds',
    'InitialData',
    'userSettingsDataService',
    'tabLauncher',
    'ReportingAPIServiceDownload',
    'FeatureFlagService',
    'FuseFlag',
    ReportPageController,
  ]);

function ReportPageController(
  $scope,
  $rootScope,
  localize,
  $location,
  $routeParams,
  reportsFactory,
  toastrFactory,
  patSecurityService,
  $timeout,
  $window,
  ReportIds,
  initialData,
  userSettingsDataService,
  tabLauncher,
  ReportingAPIServiceDownload,
  featureFlagService,
  fuseFlag
) {
  BaseCtrl.call(this, $scope, 'ReportPageController');
  var ctrl = this;
  $scope.pagingInProgress = false;
  var launchDarklyStatus = false;
  angular.element('#reports-wrapper').toggleClass('toggled');
  $scope.toggleViewFilters = false;
  $scope.filterModels = {};
  $scope.patientReferralTypesData = initialData.ReferralTypes.Value;
  ctrl.filterDto = {};
  ctrl.reportPath = reportsFactory.GetReportPath();
  $scope.requestBodyProperties = reportsFactory.GetRequestBodyProperties();
  $scope.reportId = parseInt(reportsFactory.GetReportId());
  $scope.reportAmfa = reportsFactory.GetAmfa();
  ctrl.navigationFromDashboard = reportsFactory.GetNavigationFrom();
  // Get Empty report first in order to get header data, unless report has no parameters
  ctrl.generateReport = $scope.requestBodyProperties === null;
  $scope.currentPage = 0;
  $scope.pageCount = 30; //Size of a page
  $scope.allDataDisplayed = false;
  $scope.isUpdating = false;
  $scope.dateRangeTitle = [];
  $scope.dateFilterList = [];
  $scope.printDisabled = true;
  $scope.isNoData = true;
  $scope.isNewReportingAPI = false;
  $scope.exportDisabled = true;
  $scope.exportNewApi = false;
  ctrl.emptyGuid = '00000000-0000-0000-0000-000000000000';
  //$scope.fuseReportTitle = reportsFactory.GetFuseReportTitle();

  // initialize report id constants
  $scope.reportIds = ReportIds;

  ctrl.showPartialProviders = true;

  $scope.getAllRows = ($scope.reportId != $scope.reportIds.ActivityLogReportId || $scope.reportIds.ActivityLogBetaReportId);

  //
  $scope.pageReady = false;
  $scope.blobId = "";
  $scope.contentType = "";
  ctrl.$onInit = function () {
    if (!reportsFactory.GetReportContext()) {
      const hash = window.location.hash;
      var asyncBlobId = "";
      if (hash) {
          const queryParams = hash.split('?')[1];      
          if (queryParams) {
              const urlParams = new URLSearchParams(queryParams);
              asyncBlobId = urlParams.get('bid');
              if (asyncBlobId){
                sessionStorage.setItem(asyncBlobId + '_loaded', false);
              }
          }
      }
      if (!asyncBlobId){
        $scope.afterFilterInit = null;
      }
    }
    var cachedLocation = JSON.parse(sessionStorage.getItem('userLocation'));
    $scope.userLocation = typeof _.isUndefined(cachedLocation)
      ? cachedLocation
      : null;
    ctrl.checkAuth();
    ctrl.setTabTitle();
    if (!$scope.hideMenu) {
      $scope.hideDiv(true);
    }
    ctrl.buildBreadCrumbs(ctrl.reportPath);
    $scope.gridTemplate = ctrl.deriveTemplateNameFromRoute();
    ctrl.checkIfShowFilterMessage();
    $scope.getReport(false);
  };

  // show hide filters
  $scope.hideDiv = function (showDefault) {
    if (showDefault) {
      $scope.hideMenu =
        _.isNull($scope.requestBodyProperties) ||
          ctrl.navigationFromDashboard === 'true'
          ? true
          : false;
      $scope.columnWidth =
        _.isNull($scope.requestBodyProperties) ||
          ctrl.navigationFromDashboard === 'true'
          ? 'col-md-12'
          : 'col-md-9';
    } else {
      $scope.hideMenu = $scope.hideMenu ? false : true;
      $scope.columnWidth = $scope.hideMenu ? 'col-md-12' : 'col-md-9';
    }
    $timeout(function () {
      $scope.slideOutText = $scope.hideMenu ? 'Show Filters' : 'Hide Filters';
    }, 0);
  };

  $scope.validDateRange = function (model) {
    return model && model.StartDate && model.EndDate;
  };

  // displays the date range for reports that are filtered that way
  ctrl.setDateRangeTitle = function () {
    var asyncBlobId = "";
    const hash = window.location.hash;                    
    if (hash) {
        const queryParams = hash.split('?')[1];      
        if (queryParams) {
            const urlParams = new URLSearchParams(queryParams);
            asyncBlobId = urlParams.get('bid');
        }
    }
    
    var index = 0;
    $scope.dateRangeTitle = [];
    _.each($scope.dateFilterList, function (model) {
      if (model.Name != 'Original Transaction Date Range') {
        if ($scope.validDateRange(model)) {
          var rangeTitle = '';
          if (
            $scope.dateFilterList.length > 1 &&
            $scope.data.ReportTitle === 'Collections by Service Date'
          ) {
            rangeTitle = model.Name + localize.getLocalizedString(': ');
          }
          $scope.dateRangeTitle.push(rangeTitle + model.TitleDateRangeString);
          index++;
        } else {
          if (asyncBlobId != null && asyncBlobId != undefined && asyncBlobId != '') {
            return;
          }
          $scope.showFilterMessage = true;
          return;
        }
      }
    });
  };

  ctrl.setTabTitle = function () {
    var crumbs = ctrl.reportPath.split('/');
    document.title = crumbs[crumbs.length - 1].replace(/([A-Z])/g, ' $1');
  };

  // build the breadcrumbs based on report path
  ctrl.buildBreadCrumbs = function (path) {
    if (!_.isNull(path)) {
      var pathSections = path.split('/');
      _.each(pathSections, function (location) {
        var index = _.indexOf(pathSections, location);
        if (index === 1) {
          $scope.breadcrumbs = [
            {
              name: localize.getLocalizedString(
                pathSections[index].replace(/([A-Z])/g, ' $1')
              ),
              path: '/' + pathSections[index] + '/',
            },
          ];
        }
        if (index > 1) {
          $scope.breadcrumbs.push({
            name: localize.getLocalizedString(
              pathSections[index].replace(/([A-Z])/g, ' $1')
            ),
            path:
              $scope.breadcrumbs[index - 2].path + pathSections[index] + '/',
          });
        }
      });
    }
  };

  $scope.print = function () {
    if (!$scope.printDisabled) {
      $scope.isPrinting = true;
      setTimeout(() => {
        $scope.isPrint = true;
        if (typeof $scope.getAllMissingData === 'function') {
          $scope.getAllMissingData($scope.printAllDataComplete);
        }
        if (reportsFactory && reportsFactory.AddPrintedReportActivityEvent) {
          reportsFactory.AddPrintedReportActivityEvent($scope.reportId, false);
        }
        $timeout(() => {
          $scope.isPrinting = false;
        }, 300);
      }, 100);
    }
  };

  $scope.downloadCSV = function () {
    if (!$scope.exportDisabled && !$scope.isNoData) {
      $scope.isSavePdf = false;
      $scope.downloadOnly = true;
      $scope.contentType = 'CSV';
      ReportingAPIServiceDownload.executeDownload(
        $routeParams.ReportName,
        null,
        $scope.downloadOnly,
        null,
        null,
        $scope.isNewReportingAPI,
        $scope.blobId,
        $scope.contentType
      );
    }
  };

  $scope.savePdf = function () {
    if (!$scope.printDisabled && !$scope.isNoData) {
      $scope.isSavePdf = true;
      $scope.downloadOnly = true;

      $scope.getReport(true, function () { });
    }
  };
  $scope.downloadPdf = function () {
    if (!$scope.printDisabled && !$scope.isNoData) {
      $scope.isSavePdf = true;
      $scope.downloadOnly = false;

      $scope.getReport(true, function () { });
    }
  };
  $scope.printAllDataComplete = function () {
    if (!$scope.hideMenu) {
      $scope.hideDiv(false);
    }
    $timeout(function () {
      if ($scope.lazyLoadEnabled)
        setTimeout(function () {
          if ($scope.canPrint) {
            $scope.setReportHeadersBeforePrint();
            $window.print();
            $scope.setReportHeadersAfterPrint();
            $scope.canPrint = false;
          }
        }, 100);
      else {
        $scope.setReportHeadersBeforePrint();
        $window.print();
        $scope.setReportHeadersAfterPrint();
      }
    }, 0);
  };

  $scope.setReportHeadersBeforePrint = function () {
    if (!document.querySelector('#showOnPrint')) {
      var e = document.createElement('thead');
      var dateRangeTitleDiv1 = '';
      var dateRangeTitleDiv2 = '';
      if (!_.isNull(document.querySelector('#dateRange'))) {
        dateRangeTitleDiv1 =
          !_.isUndefined(document.querySelector('#dateRange').children[1]) &&
            !_.isNull(document.querySelector('#dateRange').children[1])
            ? document.querySelector('#dateRange').children[1].innerHTML
            : '';
        dateRangeTitleDiv2 =
          !_.isUndefined(document.querySelector('#dateRange').children[2]) &&
            !_.isNull(document.querySelector('#dateRange').children[2])
            ? document.querySelector('#dateRange').children[2].innerHTML
            : '';
      }

      var headerMessage1 = !_.isNull(
        document.querySelector('.reportPage__reportHeader')
      )
        ? document.querySelector('.reportPage__reportHeader').innerHTML
        : '';
      var headerMessage2 = !_.isNull(document.querySelector('#dateRange h4'))
        ? document.querySelector('#dateRange h4').innerHTML
        : '';

        var headerMessage3 = !_.isNull(document.querySelector('#displaybanner h4'))
            ? document.querySelector('#displaybanner h4').innerHTML
            : '';
      var fusePrintGrid = document.querySelectorAll('.fusePrintGrid  thead'),
        i;
      _.each(fusePrintGrid, function (item) {
        if (!_.includes(item.className, 'preventPrepend')) {
          e.innerHTML =
            "<tr><th id='showOnPrint' style='text-align: center;'><div>" +
            headerMessage1 +
            " <h4 style='clear: both;'>" +
            headerMessage2 +
            "</h4><h5 style='clear: both; '>" +
            headerMessage3 +
            '</h5><div>' +
            dateRangeTitleDiv1 +
            '</div><div>' +
            dateRangeTitleDiv2 +
            '</div></div></th></tr>';
          if (!_.isUndefined(item)) {
            item.prepend(e.firstChild);
          }
        }
      });
      if (!_.isNull(document.querySelector('.reportPage__reportTitle'))) {
        document
          .querySelector('.reportPage__reportTitle')
          .classList.add('no-print');
      }

      if (!_.isNull(document.querySelector('.reportPage__reportHeader'))) {
        document
          .querySelector('.reportPage__reportHeader')
          .classList.add('no-print');
      }
    }

    if (!document.querySelector('#appendFooterID')) {
      var element = document.createElement('tr');
      var reportPage__reportFilterSection =
        document.querySelector('.reportPage__reportFilterSection') != null
          ? document.querySelector('.reportPage__reportFilterSection').innerHTML
          : '';
      element.innerHTML =
        "<tr><tr id='appendFooterID'><td>" +
        reportPage__reportFilterSection +
        '</td></tr></tr>';
      var appendFooter = document.querySelectorAll('.appendFooter');
      var reportPage__reportFilterSectionNoPrint = document.querySelectorAll(
        '.reportPage__reportFilterSection > div'
      ),
        npAll;
      _.each(reportPage__reportFilterSectionNoPrint, function (item) {
        if (!_.isUndefined(item) && !_.isEmpty(appendFooter)) {
          item.classList.add('no-print');
        }
      });
      if (appendFooter[appendFooter.length - 1]) {
        appendFooter[appendFooter.length - 1].prepend(element.firstChild);
      }
    }
  };

  $scope.setReportHeadersAfterPrint = function () {
    var showOnPrintDiv = document.querySelectorAll('#showOnPrint'),
      j;
    _.each(showOnPrintDiv, function (item) {
      if (!_.isUndefined(item)) {
        item.remove();
      }
    });

    var appendFooterID = document.querySelectorAll('.appendFooter td'),
      k;
    _.each(appendFooterID, function (item) {
      if (!_.isUndefined(item)) {
        item.remove();
      }
    });
    if (!_.isNull(document.querySelector('.reportPage__reportTitle'))) {
      document
        .querySelector('.reportPage__reportTitle')
        .classList.remove('no-print');
    }
    if (!_.isNull(document.querySelector('.reportPage__reportHeader'))) {
      document
        .querySelector('.reportPage__reportHeader')
        .classList.remove('no-print');
    }

    var reportPage__reportFilterSectionNoPrint = document.querySelectorAll(
      '.reportPage__reportFilterSection > div'
    ),
      npAll;
    _.each(reportPage__reportFilterSectionNoPrint, function (item) {
      if (!_.isUndefined(item)) {
        item.classList.remove('no-print');
      }
    });
  };

  // sending user to root if they don't have permission to view this report
  ctrl.checkAuth = function () {
    if (
      !patSecurityService.IsAuthorizedByAbbreviation($scope.reportAmfa) &&
      !patSecurityService.IsAuthorizedByAbbreviationAtLocation(
        $scope.reportAmfa,
        $scope.userLocation.id
      )
    ) {
      ctrl.generateReport = false;
      toastrFactory.error(
        localize.getLocalizedString(
          'User is not authorized to access this area.'
        ),
        localize.getLocalizedString('Not Authorized')
      );
      $location.path('/');
    }
  };

  // handle URL update for breadcrumbs
  $scope.changePageState = function (breadcrumb) {
    document.title =
      breadcrumb.name === ' Business Center'
        ? localize.getLocalizedString('Practice Settings')
        : breadcrumb.name;
    $location.url(breadcrumb.path);
  };

  // dynamically getting name of HTML template from route param
  ctrl.deriveTemplateNameFromRoute = function () {
    var caps = [];
    // Here $routeParams.ReportName is not an array, that's why didn't used lodash
    for (var i = 0; i < $routeParams.ReportName.length; i++) {
      if ($routeParams.ReportName[i].match(/[A-Z]/) !== null) {
        var dash = i !== 0 ? '-' : '';
        caps.push(dash + $routeParams.ReportName[i].toLowerCase());
      }
    }
    var templateArray = _.clone($routeParams.ReportName).split(/[A-Z]/);
    templateArray = templateArray.splice(1);
    var templateName = '';
    _.each(caps, function (firstLetter, $index) {
      templateName = templateName.concat(
        firstLetter + templateArray.slice($index, $index + 1).toString()
      );
    });
    return templateName + '.html';
  };

  ctrl.checkIfShowFilterMessage = function () {
    switch ($scope.reportId) {
      case $scope.reportIds.PatientsByFeeScheduleReportId:
      case $scope.reportIds.PatientsByBenfitPlansReportId:
      case $scope.reportIds.PatientsByDiscountReportId:
      case $scope.reportIds.PatientsWithPendingEncountersReportId:
      case $scope.reportIds.CarriersReportId:
      case $scope.reportIds.FeeScheduleMasterReportId:
      case $scope.reportIds.ServiceCodeFeesByLocationReportId:
      case $scope.reportIds.PatientsByAdditionalIdentifiersReportId:
      case $scope.reportIds.PatientsSeenReportId:
      case $scope.reportIds.ReferredPatientsReportId:
      case $scope.reportIds.NewPatientsByComprehensiveExamReportId:
      case $scope.reportIds.ServiceCodeByServiceTypeProductivityReportId:
      case $scope.reportIds.PerformanceByProviderSummaryReportId:
      case $scope.reportIds.PerformanceByProviderDetailsReportId:
      case $scope.reportIds.DaySheetReportId:
      case $scope.reportIds.ServiceCodeProductivityByProviderReportId:
      case $scope.reportIds.NetProductionByProviderReportId:
      case $scope.reportIds.AdjustmentsByProviderReportId:
      case $scope.reportIds.NetCollectionByProviderReportId:
      case $scope.reportIds.FeeExceptionsReportId:
      case $scope.reportIds.ServiceCodeFeesByFeeScheduleReportId:
      case $scope.reportIds.ServiceHistoryReportId:
      case $scope.reportIds.UnassignedUnappliedCreditsReportId:
      case $scope.reportIds.ProviderServiceHistoryReportId:
      case $scope.reportIds.ProductionExceptionsReportId:
      case $scope.reportIds.ServiceTypeProductivityReportId:
      case $scope.reportIds.DeletedTransactionsReportId:
      case $scope.reportIds.CarrierProductivityAnalysisReportId:
      case $scope.reportIds.ActivityLogReportId:
      case $scope.reportIds.ActivityLogBetaReportId:
      case $scope.reportIds.TreatmentPlanPerformanceReportId:
      case $scope.reportIds.CarrierProductivityAnalysisDetailedReportId:
      case $scope.reportIds.PendingClaimsReportId:
      case $scope.reportIds.FeeScheduleAnalysisByCarrier:
      case $scope.reportIds.TreatmentPlanProviderReconciliationReportId:
      case $scope.reportIds.ReferralSourcesProductivityDetailedReportId:
      case $scope.reportIds.PatientsWithRemainingBenefitsReportId:
      case $scope.reportIds.AppointmentsReportId:
      case $scope.reportIds.CollectionsAtCheckoutReportId:
      case $scope.reportIds.ReferralSourcesProductivitySummaryReportId:
      case $scope.reportIds.ServiceTransactionsWithDiscountsReportId:
      case $scope.reportIds.PeriodReconciliationReportId:
      case $scope.reportIds.AppointmentTimeElapsedReportId:
      case $scope.reportIds.CollectionsByServiceDateReportId:
      case $scope.reportIds.EncountersByFeeScheduleReportId:
      case $scope.reportIds.EncountersByCarrierReportId:
      case $scope.reportIds.NewPatientsSeenReportId:
      case $scope.reportIds.PaymentReconciliationReportId:
      case $scope.reportIds.PatientsByPatientGroupsReportId:
      case $scope.reportIds.PatientsByFlagsReportId:
      case $scope.reportIds.DailyProductionCollectionSummaryReportId:
      case $scope.reportIds.ReceivablesByProviderReportId:
      case $scope.reportIds.PatientsByMedicalHistoryAlertsReportId:
      case $scope.reportIds.ProjectedNetProductionReportId:
      case $scope.reportIds.PatientsByLastServiceDateReportId:
      case $scope.reportIds.MedicalHistoryFormAnswersReportId:
      case $scope.reportIds.AdjustmentsByTypeReportId:
      case $scope.reportIds.ProposedTreatmentReportId:
      case $scope.reportIds.ReceivablesByAccountId:
      case $scope.reportIds.CreditDistributionHistoryReportId:
      case $scope.reportIds.PotentialDuplicatePatientsReportId:
      case $scope.reportIds.ProposedTreatmentBetaReportId:
      case $scope.reportIds.BenefitPlansbyAdjustmentTypeReportId:
      case $scope.reportIds.NetCollectionByProviderReportIdBeta:
      case $scope.reportIds.NetProductionByProviderReporBetatId:
      case $scope.reportIds.PeriodReconciliationReportIdBeta:
      case $scope.reportIds.BenefitPlansbyInsurancePaymentType:
      case $scope.reportIds.ProjectedNetProductionBetaReportId:
      case $scope.reportIds.PaymentLocationReconciliationReportId:
      case $scope.reportIds.ReferralSourcesProductivityDetailedBetaReportId:
      case $scope.reportIds.PaymentReconciliationBetaReportId:
      case $scope.reportIds.ReceivablesByAccountBetaId:
      case $scope.reportIds.PaymentLocationReconciliationBetaReportId:
      case $scope.reportIds.ReferredPatientsBetaReportId:
      case $scope.reportIds.EncountersByCarrierBetaReportId:
      case $scope.reportIds.AppointmentsBetaReportId:
      case $scope.reportIds.CreditDistributionHistoryBetaReportId:
      case $scope.reportIds.EncountersByPaymentReportId:
      case $scope.reportIds.UnassignedUnappliedCreditsBetaReportId:
      case $scope.reportIds.ServiceCodeByServiceTypeProductivityBetaReportId:
      case $scope.reportIds.PatientsByBenefitPlanBetaReportId:
      case $scope.reportIds.PatientsByFlagsBetaReportId:
      case $scope.reportIds.PatientsByPatientGroupsBetaReportId:
      case $scope.reportIds.ServiceCodeProductivityByProviderBetaReportId:
      case $scope.reportIds.BenefitPlansByInsurancePaymentTypeBetaReportId:
      case $scope.reportIds.NewPatientsSeenBetaReportId:
      case $scope.reportIds.PatientsByPatientGroupsNewReportId:
      case $scope.reportIds.PatientsByCarrierBetaReportId:
      case $scope.reportIds.PatientSeenReportId:
      case $scope.reportIds.ReferralSourceProductivityReportId:
      case $scope.reportIds.ReferralAffiliatesReportId:
       $scope.showFilterMessage = true;
        break;

      default:
        $scope.showFilterMessage = false;
        break;
    }
  };

  //#region activity log functions

  //opens new tab of the patient clinical page
  $scope.launchClinicalTab = function (patientId, typeId, description) {
    let patientPath = '#/Patient/';
    var urlToLaunch = patientPath + patientId + '/Clinical/';
    if (typeId === 22) {
      var params = 'newTab=true?activeSubTab=3';
      tabLauncher.launchNewTab(urlToLaunch + '&' + params);
    } else if (typeId === 25) {
      var params = 'MedicalHistoryForm/past?formAnswersId=' + description;
      tabLauncher.launchNewTab(urlToLaunch + params);
    }
  };

  //#endregion

  // region set filter string data

  ctrl.setFilterString = function () {
    $scope.filterData = angular.copy($scope.filterModels);

    if ($scope.isNewReportingAPI === true) {
      var updatedFilterData = {};
      _.each($scope.filterData, function (value, key) {
        if (value.data && value.data.length > 0) {
          updatedFilterData[key] = value;
        }
        else if (value.Name === localize.getLocalizedString('Date Range')) {
          updatedFilterData[key] = value;
        }
      });

      $scope.filterData = updatedFilterData;
    }

    _.each($scope.filterData, function (model) {
      if (model.Name === localize.getLocalizedString('Payer ID')) {
        model.ActualFilterString = model.FilterDto;
      } else {
        if (model.FilterFilterModel) {
          model.FilterFilterModel.ActualFilterString =
            model.FilterFilterModel.FilterString;
        }
        model.ActualFilterString = model.FilterString;
      }
    });

    if ($scope.reportId == $scope.reportIds.ReceivablesByProviderReportId) {
      featureFlagService.getOnce$(fuseFlag.ReportReceivablesByProvider).subscribe((value) => {
        launchDarklyStatus = value;
      });
      ctrl.filterDto["LaunchDarklyStatus"] = launchDarklyStatus;
    }

    if ($scope.reportId == $scope.reportIds.DaySheetReportId) {
      featureFlagService.getOnce$(fuseFlag.ReportDaySheet).subscribe((value) => {
        launchDarklyStatus = value;
      });
      ctrl.filterDto["LaunchDarklyStatus"] = launchDarklyStatus;
    }
      if ($scope.reportId == $scope.reportIds.NetProductionByProviderReportId) {
          featureFlagService.getOnce$(fuseFlag.ReportProductionByProvider).subscribe((value) => {
            launchDarklyStatus = value;
        });
        ctrl.filterDto["LaunchDarklyStatus"] = launchDarklyStatus;
      }

      if ($scope.reportId == $scope.reportIds.DaySheetReportId) {
          if (sessionStorage.getItem('FlagForARNetProductionWidget') == 'true') {
              ctrl.filterDto.FlagForARNetProductionWidget = true;
              sessionStorage.setItem('FlagForARNetProductionWidget', 'false');
          }
          else {
              ctrl.filterDto.FlagForARNetProductionWidget = false;
          }
      }
      if ($scope.reportId == $scope.reportIds.ReferralSourceProductivityReportId) {
          sessionStorage.setItem("fuse-reporting-page-number-Referral Productivity", "0");
          ctrl.filterDto.CurrentPage = 0;
      }

     if ($scope.reportId == $scope.reportIds.PerformanceByProviderDetailsReportId ||
      $scope.reportId == $scope.reportIds.PerformanceByProviderSummaryReportId ||
      $scope.reportId == $scope.reportIds.DailyProductionCollectionSummaryReportId ||
      $scope.reportId == $scope.reportIds.AdjustmentsByTypeReportId || 
      $scope.reportId == $scope.reportIds.DaySheetReportId ||
      $scope.reportId == $scope.reportIds.NetProductionByProviderReportId ||
      $scope.reportId == $scope.reportIds.NetCollectionByProviderReportId ||
      $scope.reportId == $scope.reportIds.AdjustmentsByProviderReportId 
     ) {
        featureFlagService.getOnce$(fuseFlag.ReleaseReportInconsistencies).subscribe((value) => {
          launchDarklyStatus = value;
        });
        ctrl.filterDto["LaunchDarklyStatus"] = launchDarklyStatus;
      }


      if ($scope.reportId == $scope.reportIds.ReferralSourceProductivityReportId 
      ) {
          featureFlagService.getOnce$(fuseFlag.ReleaseReferralExport).subscribe((value) => {
              launchDarklyStatus = value;
          });
          ctrl.filterDto["LaunchDarklyStatus"] = launchDarklyStatus;
      }


      const reportIdsToCheck = [
          $scope.reportIds.ActivityLogBetaReportId,
          $scope.reportIds.ProviderServiceHistoryBetaReportId,
          $scope.reportIds.PerformanceByProviderSummaryReportId,
          $scope.reportIds.PaymentReconciliationReportId,
          $scope.reportIds.PendingClaimsReportId,
          $scope.reportIds.NetProductionByProviderReportId,
          $scope.reportIds.CollectionsByServiceDateBetaReportId,
          $scope.reportIds.NetCollectionByProviderReportId,
          $scope.reportIds.DaySheetReportId,
          $scope.reportIds.AdjustmentsByTypeReportId,
          $scope.reportIds.ReferralAffiliatesReportId,
          $scope.reportIds.CarrierProductivityAnalysisBetaReportId,
          $scope.reportIds.DailyProductionCollectionSummaryReportId,
          $scope.reportIds.TreatmentPlanPerformanceReportId,
          $scope.reportIds.ServiceCodeProductivityByProviderReportId,
          $scope.reportIds.FeeExceptionsBetaReportId,
          $scope.reportIds.PatientByFlagsBetaReportId,
          $scope.reportIds.PatientAnalysisReportId,
          $scope.reportIds.CollectionAtCheckoutBetaReportId
      ];

      if (reportIdsToCheck.includes($scope.reportId)) {
          featureFlagService.getOnce$(fuseFlag.IncreaseTimeout).subscribe((value) => {
              ctrl.filterDto["IncreaseTimeout"] = value;
          });
      }
  };

  // endregion
  $scope.objChanged = function () {
    ctrl.setFilterString();
  };
  // region set filter DTO data

  // get the selected filter information and set the filter Dto
  ctrl.getFilterData = function (userFilters) {
    _.each($scope.filterModels, function (model, name) {
      if (
        _.has(model, 'StartDateName') &&
        _.has(model, 'EndDateName') &&
        _.has(model, 'FilterDtoStartDate') &&
        _.has(model, 'FilterDtoEndDate')
      ) {
        if (
          $scope.data.ReportTitle === 'Adjustments by Type' ||
          $scope.data.ReportTitle === 'Credit Distribution History' ||
          $scope.data.ReportTitle === 'Credit Distribution History Beta' ||
          $scope.data.ReportTitle === 'Carriers Beta' ||
          $scope.data.ReportTitle === 'Production by Provider' ||
          $scope.data.ReportTitle === 'Gross Performance by Provider - Detailed' ||
          $scope.data.ReportTitle === 'Collection by Provider' ||
          $scope.data.ReportTitle === 'Referred Patients' ||
          $scope.data.ReportTitle == 'Payment Reconciliation' ||
          $scope.data.ReportTitle === 'Adjustments by Provider' ||
          $scope.data.ReportTitle == 'Service Code Productivity by Provider' ||
          $scope.data.ReportTitle == 'Encounters by Carrier' ||
          $scope.data.ReportTitle ==
          'Referral Sources Productivity - Detailed' ||
          $scope.data.ReportTitle ==
          'Referral Sources Productivity - Detailed Beta' ||
          $scope.data.ReportTitle == 'Gross Daily Production / Collection Summary' ||
          $scope.data.ReportTitle == 'Payment Location Reconciliation' ||
          $scope.data.ReportTitle == 'Payment Location Reconciliation Beta' ||
          $scope.data.ReportTitle == 'Gross Performance by Provider - Summary' ||
          $scope.data.ReportTitle == 'Encounters by Payment' ||
          $scope.data.ReportTitle == 'New Patients by Comprehensive Exam' ||
          $scope.data.ReportTitle == 'Payment Reconciliation Beta' ||
          $scope.data.ReportTitle === 'Referred Patients Beta' ||
          $scope.data.ReportTitle === 'Day Sheet' ||
          $scope.data.ReportTitle === 'Proposed Treatment' ||
          $scope.data.ReportTitle === 'Proposed Treatment Beta' ||
          $scope.data.ReportTitle == 'Encounters by Fee Schedule' ||
          $scope.data.ReportTitle == 'Projected Production' ||
          $scope.data.ReportTitle == 'Treatment Plan Performance' ||
          $scope.data.ReportTitle == 'Patients Clinical Notes' ||
          $scope.data.ReportTitle === 'Day Sheet Beta' ||
          $scope.data.ReportTitle === 'Unassigned/Unapplied Credits' ||
          $scope.data.ReportTitle ===
          'Service Code by Service Type Productivity Beta' ||
          $scope.data.ReportTitle === 'Patients By Benefit Plan' ||
          $scope.data.ReportTitle === 'Patients by Flags Beta' ||
          $scope.data.ReportTitle === 'Service Code Productivity by Provider Beta' ||
          $scope.data.ReportTitle === 'Patients by Patient Groups Beta' ||
          $scope.data.ReportTitle === 'Benefit Plans by Insurance Payment Type Beta' ||
          $scope.data.ReportTitle === 'Fee Schedule Analysis by Carrier' ||
          $scope.data.ReportTitle === 'Service Code Fees by Fee Schedule' ||
          $scope.data.ReportTitle === 'Production Exceptions' ||
          $scope.data.ReportTitle === 'Collections by Service Date' ||
          ($scope.data.ReportTitle === 'Service History' && $scope.reportId == $scope.reportIds.ServiceHistoryBetaReportId) ||
          ($scope.data.ReportTitle === 'Service Transactions with Discounts' && $scope.reportId == $scope.reportIds.ServiceTransactionsWithDiscountsBetaReportId) ||
          ($scope.data.ReportTitle === 'Referral Sources Productivity - Summary' && $scope.reportId == $scope.reportIds.ReferralSourcesProductivitySummaryBetaReportId) ||
          ($scope.data.ReportTitle === 'Fee Exceptions' && $scope.reportId == $scope.reportIds.FeeExceptionsBetaReportId) ||
          ($scope.data.ReportTitle === 'Carrier Productivity Analysis' && $scope.reportId == $scope.reportIds.CarrierProductivityAnalysisBetaReportId) ||
          ($scope.data.ReportTitle === 'Carrier Productivity Analysis - Detailed' && $scope.reportId == $scope.reportIds.CarrierProductivityAnalysisDetailedBetaReportId) ||
          ($scope.data.ReportTitle === 'Treatment Plan Provider Reconciliation' && $scope.reportId == $scope.reportIds.TreatmentPlanProviderReconciliationBetaReportId) ||
          ($scope.data.ReportTitle === 'Period Reconciliation' && $scope.reportId == $scope.reportIds.PeriodReconciliationBetaReportId) ||
          ($scope.data.ReportTitle === 'Activity Log' && $scope.reportId == $scope.reportIds.ActivityLogBetaReportId) ||
          ($scope.data.ReportTitle === 'New Patients Seen' && $scope.reportId == $scope.reportIds.NewPatientSeenReportId) ||
          ($scope.data.ReportTitle === 'Referral Productivity' && $scope.reportId == $scope.reportIds.ReferralSourceProductivityReportId) ||
          ($scope.data.ReportTitle === 'Service Code by Service Type Productivity') ||
          ($scope.data.ReportTitle === 'Referral Affiliates' && $scope.reportId == $scope.reportIds.ReferralAffiliatesReportId) ||
          ($scope.data.ReportTitle === 'Provider Service History' && $scope.reportId == $scope.reportIds.ProviderServiceHistoryBetaReportId) ||
          ($scope.data.ReportTitle === 'Collections at Checkout' && $scope.reportId == $scope.reportIds.CollectionAtCheckoutBetaReportId) || 
          ($scope.data.ReportTitle === 'Deleted Transactions' && $scope.reportId == $scope.reportIds.DeletedTransactionsBetaReportId) ||
          ($scope.data.ReportTitle === 'Unassigned/Unapplied Credits' && $scope.reportId == $scope.reportIds.UnassignedUnappliedCreditsReportId) ||
          ($scope.data.ReportTitle === 'Activity Logs' && $scope.reportId == $scope.reportIds.ActivityLogAsyncReportId) 
        ) {
          if (userFilters) {
            model.FilterDtoStartDate = moment(model.FilterDtoStartDate).format(
              'l LT'
            );
            model.FilterDtoEndDate = moment(model.FilterDtoEndDate).format(
              'l LT'
            );
          } else {
            model.FilterDtoStartDate = moment(model.FilterDtoStartDate).format(
              'YYYY-MM-DD'
            );
            model.FilterDtoEndDate = moment(model.FilterDtoEndDate).format(
              'YYYY-MM-DD'
            );
            if($scope.reportId == $scope.reportIds.PerformanceByProviderDetailsReportId ){              
              if(model["FilterId"]=="DateRange"){
              ctrl.filterDto.dateType = model.dateType;
              }
              else{
              ctrl.filterDto.otherDateType = model.dateType;
              } 
            }   
            else if ($scope.reportId == $scope.reportIds.NetCollectionByProviderReportId) {
                if (model["FilterId"] == "DateRange") {
                    ctrl.filterDto.dateType = model.dateType;
                }
                else {
                    ctrl.filterDto.otherDateType = model.dateType;
                }
            }   
            else{
              ctrl.filterDto.dateType = model.dateType;
            }  
          }
          if ($scope.reportId == $scope.reportIds.PerformanceByProviderDetailsReportId) {
            featureFlagService.getOnce$(fuseFlag.EnableNotificationsForGrossPerformanceByProviderReport).subscribe((value) => {
              if(value){
                featureFlagService.getOnce$(fuseFlag.ShowNotifications).subscribe((value) => {
                  ctrl.filterDto["ShowNotification"] = value;
              });
              }
              else{
                ctrl.filterDto["ShowNotification"] = false;
              }
          });
            
          } 
          if ($scope.reportId == $scope.reportIds.PaymentReconciliationReportId) {
            featureFlagService.getOnce$(fuseFlag.EnableTimeZoneForPaymentReconciliationReport).subscribe((value) => {
              if (value) {
                featureFlagService.getOnce$(fuseFlag.ShowNotifications).subscribe((value) => {
                  ctrl.filterDto["EnableUTCTimeZone"] = value;
                  ctrl.filterDto["LocalTimeZone"] = moment.tz.guess();
                });
              }
              else {
                ctrl.filterDto["EnableUTCTimeZone"] = false;
              }
            });
          }
          if ($scope.reportId == $scope.reportIds.ActivityLogAsyncReportId) {
            featureFlagService.getOnce$(fuseFlag.EnableNotificationsForActivityLogsReport).subscribe((value) => {
              if(value){
                featureFlagService.getOnce$(fuseFlag.ShowNotifications).subscribe((value) => {
                  ctrl.filterDto["ShowNotification"] = value;
                    ctrl.filterDto["LocalTimeZone"] = moment.tz.guess();
              });
              }
              else{
                ctrl.filterDto["ShowNotification"] = false;
              }
          });
            
          }

          if ($scope.reportId == $scope.reportIds.UnassignedUnappliedCreditsReportId) {
            featureFlagService.getOnce$(fuseFlag.EnableNotificationsForUnAssignedUnAppliedCreditsReport).subscribe((value) => {
              if(value){
                featureFlagService.getOnce$(fuseFlag.ShowNotifications).subscribe((value) => {
                  ctrl.filterDto["ShowNotification"] = value;
              });
              }
              else{
                ctrl.filterDto["ShowNotification"] = false;
              }
          });
            
          } 

          if ($scope.reportId == $scope.reportIds.ServiceHistoryBetaReportId)
          {
            featureFlagService.getOnce$(fuseFlag.EnableNotificationsForServiceHistoryReport).subscribe((value) => {
              if(value){
                featureFlagService.getOnce$(fuseFlag.ShowNotifications).subscribe((value) => {
                  ctrl.filterDto["ShowNotification"] = value;
                });
              }
              else{
                ctrl.filterDto["ShowNotification"] = false;
              }
            });
          }

          if ($scope.reportId == $scope.reportIds.NetCollectionByProviderReportId) {
              featureFlagService.getOnce$(fuseFlag.EnableNotificationsForCollectionByProviderReport).subscribe((value) => {
                  if (value) {
                      featureFlagService.getOnce$(fuseFlag.ShowNotifications).subscribe((value) => {
                          ctrl.filterDto["ShowNotification"] = value;
                      });
                  }
                  else {
                      ctrl.filterDto["ShowNotification"] = false;
                  }
              });

              var isExportClick = sessionStorage.getItem('_CSVExport');
              if (isExportClick == 'true' || isExportClick == true) {
                  sessionStorage.setItem('_CSVExport', false);
                  ctrl.filterDto["ShowNotification"] = false;
              }
          }

        } else if (
          $scope.data.ReportTitle === 'Gross Performance by Provider - Summary' ||
          $scope.data.ReportTitle === 'Service Transactions with Discounts' ||
          $scope.data.ReportTitle === 'Period Reconciliation' ||
          $scope.data.ReportTitle === 'Collections at Checkout' ||
          $scope.data.ReportTitle === 'Collections by Service Date' ||
          $scope.data.ReportTitle === 'Fee Exceptions' ||
          $scope.data.ReportTitle === 'Deleted Transactions' ||
          $scope.data.ReportTitle === 'New Patients Seen' ||
          $scope.data.ReportTitle === 'Encounters by Fee Schedule' ||
          $scope.data.ReportTitle === 'Carrier Productivity Analysis' ||
          $scope.data.ReportTitle ===
          'Carrier Productivity Analysis - Detailed' ||
          $scope.data.ReportTitle === 'Fee Schedule Analysis by Carrier' ||
          $scope.data.ReportTitle === 'New Patients by Comprehensive Exam' ||
          $scope.data.ReportTitle === 'Patients Seen' ||
          $scope.data.ReportTitle === 'Production Exceptions' ||
          $scope.data.ReportTitle === 'Provider Service History' ||
          $scope.data.ReportTitle === 'Service Code Productivity by Provider' ||
          $scope.data.ReportTitle === 'Service History' ||
          $scope.data.ReportTitle ===
          'Referral Sources Productivity - Summary' ||
          $scope.data.ReportTitle === 'Treatment Plan Performance Beta' ||
          $scope.data.ReportTitle === 'Period Reconciliation Beta' ||
          $scope.data.ReportTitle === 'Treatment Plan Performance' ||
          $scope.data.ReportTitle === 'Period Reconciliation' && $scope.reportId == $scope.reportIds.PeriodReconciliationBetaReportId ||
          $scope.data.ReportTitle === 'Activity Log' && $scope.reportId == $scope.reportIds.ActivityLogBetaReportId ||
          $scope.data.ReportTitle === 'New Patients Seen' && $scope.reportId == $scope.reportIds.NewPatientSeenReportId ||
          ($scope.data.ReportTitle === 'Patients Seen' && $scope.reportId === $scope.reportIds.PatientSeenReportId)    
        ) {
            if ($scope.data.ReportTitle === 'Patients Seen' && $scope.reportId === $scope.reportIds.PatientSeenReportId) {

            model.FilterDtoStartDate = moment(model.FilterDtoStartDate).format(
              'YYYY-MM-DD'
            );
            model.FilterDtoEndDate = moment(model.FilterDtoEndDate).format(
              'YYYY-MM-DD'
            );
          }
          else {
            model.FilterDtoStartDate = moment(model.FilterDtoStartDate).format(
              'l LT'
            );
            model.FilterDtoEndDate = moment(model.FilterDtoEndDate).format(
              'l LT'
            );
          }
        }
        if ($scope.data.reportTitle === 'New Patients Seen Beta') {
          model.FilterDtoStartDate = moment(model.FilterDtoStartDate).format(
            'l LT'
          );
          model.FilterDtoEndDate = moment(model.FilterDtoEndDate).format(
            'l LT'
          );
        }
        ctrl.filterDto[model.StartDateName] = model.FilterDtoStartDate;
        ctrl.filterDto[model.EndDateName] = model.FilterDtoEndDate;
        if (model.Name === 'Original Transaction Date Range') {
          ctrl.filterDto['Ignore'] = model.Ignore;
          if (model.Ignore === '1') {
            ctrl.filterDto[model.StartDateName] = null;
            ctrl.filterDto[model.EndDateName] = null;
          }
        }
      } else if (
        _.has(model, 'ReferralSourceIdName') &&
        _.has(model, 'ReferralPatientIdName') &&
        _.has(model, 'ExternalProviderIdName') &&
        _.has(model, 'ReferringPatientIdFilterDto') &&
        _.has(model, 'ReferringSourceIdFilterDto') &&
        _.has(model, 'ExternalProviderIdFilterDto') && 
          ($scope.reportId === $scope.reportIds.ReferredPatientsBetaReportId || $scope.reportId === $scope.reportIds.ReferralSourceProductivityReportId || $scope.reportId === $scope.reportIds.ReferralAffiliatesReportId)
      ) {
        ctrl.filterDto[model.ReferralPatientIdName] =
          model.ReferringPatientIdFilterDto;
        ctrl.filterDto[model.ReferralSourceIdName] =
          model.ReferringSourceIdFilterDto;
        ctrl.filterDto[model.ExternalProviderIdName] =
          model.ExternalProviderIdFilterDto;

            if (angular.isDefined(model.selectedAllExternalProviders) && angular.isArray(model.selectedAllExternalProviders)) {
              ctrl.filterDto.selectedAllExternalProviders = model.selectedAllExternalProviders;
            }        
            if (angular.isDefined(model.selectedAllPatients) && angular.isArray(model.selectedAllPatients)) {
              ctrl.filterDto.selectedAllPatients = model.selectedAllPatients;
            }        
            if (angular.isDefined(model.selectedReferralType) && angular.isArray(model.selectedReferralType)) {
              ctrl.filterDto.selectedReferralType = model.selectedReferralType;
            }
          if (Array.isArray(ctrl.filterDto.selectedReferralType) && 
            ctrl.filterDto.selectedReferralType.every(item => item === null || typeof item === 'number')) {              
          } else {
            ctrl.filterDto.selectedReferralType = [];
          }
          if ($scope.reportId == $scope.reportIds.ReferralSourceProductivityReportId) {
            featureFlagService.getOnce$(fuseFlag.ShowNotifications).subscribe((value) => {
                ctrl.filterDto["ShowNotification"] = value;
            });
          }

      } else if (
        _.has(model, 'ReferralSourceIdName') &&
        _.has(model, 'ReferralPatientIdName') &&
        _.has(model, 'ReferringPatientIdFilterDto') &&
        _.has(model, 'ReferringSourceIdFilterDto')
      ) {
        ctrl.filterDto[model.ReferralPatientIdName] =
          model.ReferringPatientIdFilterDto;
        ctrl.filterDto[model.ReferralSourceIdName] =
          model.ReferringSourceIdFilterDto;
      } else {
        ctrl.filterDto[name] = model.FilterDto;
        if (
          (name === 'Patients' || name === 'PatientIds') &&
          userFilters &&
          model.FilterString !== 'All'
        ) {
          ctrl.filterDto['SelectedUserPatients'] = model.FilterPatients;
        }
        else if (
            (name === 'Patients' || name === 'PatientIds') &&  
            model.FilterString !== 'All' && $scope.reportId === $scope.reportIds.ActivityLogAsyncReportId
        ) {
            ctrl.filterDto['SelectedUserPatients'] = model.FilterPatients;
        }
        else if (name === 'ProviderUserIds' || name === 'ProviderIds') {
          var lstProviderTypeIds = [];
          _.each(model.FilterFilterModel.data, function (type) {
            if (type.Checked) {
              lstProviderTypeIds.push(type.FilterValue);
            }
          });

          ctrl.filterDto['ProviderTypeIds'] = lstProviderTypeIds;

          //Handle unassigned provider when all active or inactive providers selected start

          if (
            $scope.reportId == 23 ||
            $scope.reportId == 19 ||
            $scope.reportId == 21
          ) {
            var activeProvidersCount = model.data.filter(function (item, idx) {
              return item.IsActive == true && item.Value != 'All';
            });
            var activeProvidersCheckedCount = model.data.filter(function (
              item,
              idx
            ) {
              return item.IsActive == true && item.Checked == true;
            });
            var inActiveProvidersCount = model.data.filter(function (
              item,
              idx
            ) {
              return item.IsActive == false;
            });
            var inActiveProvidersCheckedCount = model.data.filter(function (
              item,
              idx
            ) {
              return item.IsActive == false && item.Checked == true;
            });
            var hasEmptyProvider = ctrl.filterDto['ProviderUserIds'].filter(
              function (item, idx) {
                return item == ctrl.emptyGuid;
              }
            );

            if (
              hasEmptyProvider.length == 0 &&
              ((activeProvidersCount.length ==
                activeProvidersCheckedCount.length &&
                inActiveProvidersCheckedCount.length == 0) ||
                (inActiveProvidersCount.length ==
                  inActiveProvidersCheckedCount.length &&
                  activeProvidersCheckedCount.length == 0))
            ) {
              ctrl.filterDto['ProviderUserIds'].push(ctrl.emptyGuid);
            }
          }
          //Handle unassigned provider when all active or inactive providers selected end
        } else if (name === 'ServiceCodeId') {
          ctrl.filterDto['ServiceCode'] = model.FilterString;
        }
      }
    });
    ctrl.setPagingOnFilterDto(ctrl.filterDto);
  };

  ctrl.setPagingOnFilterDto = function (filterDto) {
    if ($scope.reportId === $scope.reportIds.ActivityLogReportId 
      || $scope.reportId === $scope.reportIds.ReferredPatientsBetaReportId 
      || $scope.reportId === $scope.reportIds.ActivityLogBetaReportId
      || $scope.reportId === $scope.reportIds.ReferralSourceProductivityReportId
      || $scope.reportId === $scope.reportIds.ReferralAffiliatesReportId) {
      filterDto['PageCount'] = $scope.getAllRows ? 0 : $scope.pageCount;
      filterDto['CurrentPage'] = $scope.getAllRows ? 0 : $scope.currentPage;
    }
  };

  // endregion

  // calling the API to generate the report
  $scope.getReport = function (resetPaging, callback) {
    $scope.isUpdating = true;
    if (resetPaging) {
      $scope.currentPage = 0;
      $scope.getAllRows =
        $scope.reportId != ($scope.reportIds.ActivityLogReportId && $scope.reportIds.ActivityLogBetaReportId);
      $scope.allDataDisplayed = false;
        if ($scope.reportId === $scope.reportIds.ReferredPatientsBetaReportId || $scope.reportId === $scope.reportIds.ReferralSourceProductivityReportId || $scope.reportId === $scope.reportIds.ReferralAffiliatesReportId) {
        var pageSize = sessionStorage.getItem('fuse-reporting-page-size-' + $scope.data.ReportTitle);
        var pageNumber = sessionStorage.getItem('fuse-reporting-page-number-' + $scope.data.ReportTitle);

        $scope.currentPage = pageNumber != null ? pageNumber : 0;
        $scope.getAllRows = false;
        $scope.allDataDisplayed = false;
        $scope.pageCount = pageSize != null ? pageSize : 15;
        if ($scope.pageNumber > 0) {
          resetPaging = false;
        }
      }
    }

      var isExportClick = sessionStorage.getItem('_CSVExport');
      if (isExportClick == 'true' || isExportClick == true) {
          sessionStorage.setItem('_CSVExport', false);
          ctrl.filterDto["ShowNotification"] = false;
      }

    if (!ctrl.generateReport) {
      ctrl.emptyFilterDto();
      ctrl.checkIfShowFilterMessage();
    } else {
      $scope.showFilterMessage = false;
      if (resetPaging || _.isNull(ctrl.filterDto)) {
        ctrl.setDateRangeTitle();
        ctrl.setFilterString();
        ctrl.getFilterData();
      } else {
        ctrl.setPagingOnFilterDto(ctrl.filterDto);
      }
    }
    // when there are no negative and positive values
    if (sessionStorage.getItem('fromDashboard') == 'true') {
      if ($routeParams.ReportName === 'ProductionByProvider') {
        var defaultGuid = '00000000-0000-0000-0000-000000000000';
        if (
          ctrl.filterDto.hasOwnProperty('NegativeAdjustmentTypeIds') &&
          ctrl.filterDto.NegativeAdjustmentTypeIds.length === 0
        ) {
          ctrl.filterDto.NegativeAdjustmentTypeIds.push(defaultGuid);
          sessionStorage.setItem('fromDashboard', 'false');
        }
        if (
          ctrl.filterDto.hasOwnProperty('PositiveAdjustmentTypeIds') &&
          ctrl.filterDto.PositiveAdjustmentTypeIds.length === 0
        ) {
          ctrl.filterDto.PositiveAdjustmentTypeIds.push(defaultGuid);
          sessionStorage.setItem('fromDashboard', 'false');
        }
      }
    }
    if (ctrl.filterDto.ProviderTypeIds) {
      if (ctrl.filterDto.ProviderTypeIds.length === 0) {
        if (ctrl.filterDto.ProviderIds) {
          ctrl.filterDto.ProviderIds = [];
        } else if (ctrl.filterDto.ProviderUserIds) {
          ctrl.filterDto.ProviderUserIds = [];
        }
      } else if (ctrl.filterDto.ProviderTypeIds.length === 5) {
      } else {
        if (ctrl.filterDto.ProviderIds) {
          ctrl.filterDto.ProviderIds = ctrl.filterDto.ProviderIds.filter(
            function (item, idx) {
              return item !== '00000000-0000-0000-0000-000000000000';
            }
          );
        } else if (ctrl.filterDto.ProviderUserIds) {
          ctrl.filterDto.ProviderUserIds = ctrl.filterDto.ProviderUserIds.filter(
            function (item, idx) {
              return item !== '00000000-0000-0000-0000-000000000000';
            }
          );
        }
      }
    }

    if (
        ctrl.filterDto.ViewDeletedTransaction &&
        ctrl.filterDto.ViewDeletedTransaction.length >= 0
    ) {
        if (ctrl.filterDto.ViewDeletedTransaction[0] == 1) {
            ctrl.filterDto.ViewDeletedTransaction = true;
        } else {
            ctrl.filterDto.ViewDeletedTransaction = false;
        }
    }

    //end
    if ($scope.isSavePdf != undefined && $scope.isSavePdf) {
      $scope.isSavePdf = false;
      $scope.isMigratedReport = false;
      var filterInfo = $('#reportFilterInfo')[0].innerHTML;
      var reportRunDate = $('#divReportHeaderRunDateTime')[0].innerHTML;
      var filters = $scope.requestBodyProperties ? ctrl.filterDto : null;
      $scope.isMigratedReport = true;
      ReportingAPIServiceDownload.executeDownload(
        $routeParams.ReportName,
        filters,
        $scope.downloadOnly,
        filterInfo,
        reportRunDate,
        $scope.isNewReportingAPI,
        $scope.blobId
      );
    } else {
      if ($scope.gridTemplate == 'patient-by-benefit-plans.html' ||
        $scope.gridTemplate == "patients-by-flags-beta.html" ||
        $scope.gridTemplate == "patients-by-patient-groups-beta.html" ||
        $scope.gridTemplate == "benefit-plans-by-insurance-payment-type-beta.html" ||
        $scope.gridTemplate == "benefit-plans-by-fee-schedule-beta.html" ||
          $scope.gridTemplate == "benefit-plans-by-carrier-beta.html" ||
        $scope.gridTemplate == "new-patients-seen-beta.html" ||
        $scope.gridTemplate == "carrier.html" 
      ) {
        $scope.isNewReportingAPI = true;
        $scope.exportNewApi = true;
      }

      //Set the filter string for the new report
      if(typeof $scope.filterData === 'object' && Object.keys($scope.filterData).length > 0) {
        const extractedData = [];
        for (const key in $scope.filterData) {
          if ($scope.filterData.hasOwnProperty(key)) {
            const data = $scope.filterData[key];
            
            if (($scope.reportId == $scope.reportIds.ServiceHistoryBetaReportId || $scope.reportId == $scope.reportIds.ActivityLogAsyncReportId) && $scope.filterData[key].FilterFilterModel) {
              if ($scope.filterData[key].FilterFilterModel.data.length > 0) {
                const nestedFilterData = $scope.filterData[key].FilterFilterModel;
                if (nestedFilterData['FilterString'] && nestedFilterData['Name']) {
                  const filterString = nestedFilterData['FilterString'];
                  const name = nestedFilterData['Name'];
     
                  extractedData.push({ filterString, name });
                }
              }
            }
 
            if (data['FilterString'] && data['Name']) {
              const filterString = data['FilterString'];
              const name = data['Name'];
 
              extractedData.push({ filterString, name });
            }
          }
          ctrl.filterDto.AppliedFilter = JSON.stringify(extractedData);
        }
      }

      reportsFactory
        .GenerateReport(
          $scope.requestBodyProperties ? ctrl.filterDto : null,
          $routeParams.ReportName
        )
        .then(function (res) {
          const hash = window.location.hash;
          var asyncBlobId = "";
          if (hash) {
              const queryParams = hash.split('?')[1];      
              if (queryParams) {
                  const urlParams = new URLSearchParams(queryParams);
                  asyncBlobId = urlParams.get('bid');
                  if (asyncBlobId != null && asyncBlobId != undefined && asyncBlobId != '' && res && res.Rows && res.Rows.length > 0) {
                    res.Value = res.Rows[0];
                  }
                  if (asyncBlobId != null && asyncBlobId != undefined && asyncBlobId != '' && Object.keys(ctrl.filterDto).length !== 0){
                    sessionStorage.setItem(asyncBlobId + '_loaded', 'true');
                    callback = undefined;
                  }
              }
          }
          if (res && res.Value) {
            if (!$scope.currentPage || $scope.currentPage <= 0) {
              $scope.blobId = res.Value.blobId || res.Value.BlobId;
            }
            if (res.Value.ActivityEvents) {
              if (res.Value.ActivityEvents.length != $scope.pageCount) {
                $scope.allDataDisplayed = true;
              }
              if (
                !$scope.getAllRows &&
                ctrl.filterDto.CurrentPage &&
                ctrl.filterDto.CurrentPage > 0
              ) {
                //When paging, add old rows to the incoming dataset
                res.Value.ActivityEvents = _.concat(
                   $scope.data.ActivityEvents,
                  res.Value.ActivityEvents
                );
              }
            }

            var daySheetPdfLaunchDarklyStatus = false;
            if ($scope.reportId == $scope.reportIds.DaySheetReportId) {
              featureFlagService.getOnce$(fuseFlag.ReportDaySheetPdf).subscribe((value) => {
                daySheetPdfLaunchDarklyStatus = value;
              });

            }
            if (
              $scope.gridTemplate == 'gross-performance-by-provider-detailed.html' ||
              $scope.gridTemplate == 'collection-by-provider.html' ||
              $scope.gridTemplate == 'production-by-provider.html' ||
              $scope.gridTemplate == 'adjustments-by-provider.html' ||
              $scope.gridTemplate == 'adjustments-by-type.html' ||
              $scope.gridTemplate ==
              'gross-daily-production-collection-summary.html' ||
              $scope.gridTemplate ==
              'referral-sources-productivity-detailed.html' ||
              $scope.gridTemplate == 'payment-reconciliation.html' ||
              $scope.gridTemplate == 'receivables-by-account.html' ||
              $scope.gridTemplate == 'payment-location-reconciliation.html' ||
              $scope.gridTemplate == 'projected-production.html' ||
              $scope.gridTemplate == 'potential-duplicate-patients.html' ||
              $scope.gridTemplate == 'referred-patients.html' ||
              $scope.gridTemplate == 'referred-patient.html' ||
              $scope.gridTemplate == 'encounters-by-carrier.html' ||
              $scope.gridTemplate == 'scheduled-appointments.html' ||
              $scope.gridTemplate == 'credit-distribution-history.html' ||
              $scope.gridTemplate == 'proposed-treatment.html' ||
              $scope.gridTemplate == 'encounters-by-payment.html' ||
              $scope.gridTemplate == 'treatment-plan-performance.html' ||
              $scope.gridTemplate == 'patients-clinical-notes.html' ||
              $scope.gridTemplate == 'unassigned-unapplied-credits.html' ||
              $scope.gridTemplate == 'accounts-with-offsetting-provider-balances.html' ||
              $scope.gridTemplate == 'patient-by-benefit-plans.html' ||
              $scope.gridTemplate == 'patients-by-flags-beta.html' ||
              $scope.gridTemplate == 'service-code-productivity-by-provider.html' ||
              $scope.gridTemplate == 'patients-by-patient-groups-beta.html' ||
              $scope.gridTemplate == 'benefit-plans-by-insurance-payment-type-beta.html' ||
              $scope.gridTemplate == 'benefit-plans-by-fee-schedule-beta.html' ||
              $scope.gridTemplate == "benefit-plans-by-carrier-beta.html" ||
              $scope.gridTemplate == 'new-patients-seen-beta.html' ||
              $scope.gridTemplate == 'service-code-by-service-type-productivity.html' ||
              $scope.gridTemplate == 'carrier.html' ||
              $scope.gridTemplate == 'referral-source-productivity.html' ||
                $scope.gridTemplate == 'referral-affiliates.html' ||
                $scope.gridTemplate == 'services-history.html' ||
                $scope.gridTemplate == 'fee-schedule-analysis-by-carriers.html' ||
              ($scope.gridTemplate == 'day-sheet.html' && daySheetPdfLaunchDarklyStatus == true)||
              $scope.gridTemplate == "activity-logs-async.html"
            ) {
              $scope.isMigratedReport = true;
            }
            if (
              !_.isUndefined(ctrl.filterDto.ReportView) &&
              ctrl.filterDto.ReportView === 1 &&
                $scope.reportId != 232 &&
                $scope.reportId != 233
            ) {
              $scope.data = reportsFactory.getSummaryViewData(
                res.Value,
                $scope.reportId,
                $scope.reportIds
              );
            } else {
              $scope.data = res.Value;
            }
            if (
              $scope.isMigratedReport &&
              (_.isNil($scope.data) ||
                (!_.isNil($scope.data) &&
                  !_.isNil($scope.data.Locations) &&
                  $scope.data.Locations.length === 0) ||
                (($scope.reportId == 18 || $scope.reportId == 22) &&
                  !_.isNil($scope.data) &&
                  !_.isNil($scope.data.ProviderDetails) &&
                  $scope.data.ProviderDetails.length === 0) ||
                (($scope.reportId == 23 || $scope.reportId == 21) &&
                  !_.isNil($scope.data) &&
                  !_.isNil($scope.data.Providers) &&
                  $scope.data.Providers.length === 0) ||
                ($scope.reportId == 65 &&
                  !_.isNil($scope.data) &&
                  !_.isNil($scope.data.Patients) &&
                  $scope.data.Patients.length === 0) ||
                (($scope.reportId == 15 || $scope.reportId == 120 || $scope.reportId == 232 || $scope.reportId == 233) &&
                  !_.isNil($scope.data) &&
                  !_.isNil($scope.data.ReferralTypes) &&
                  $scope.data.ReferralTypes.length === 0) ||
                ($scope.reportId == 41 &&
                  !_.isNil($scope.data) &&
                  !_.isNil($scope.data.Appointments) &&
                  $scope.data.Appointments.length === 0))
            ) {
              $scope.isNoData = true;
            } else $scope.isNoData = false;
          }
          $scope.isUpdating = false;
          if (callback) {
            callback();
          }
          if (ctrl.generateReport) {
            $scope.printDisabled = false;
            $scope.exportDisabled = false;
          }
          ctrl.generateReport = true;
          if ($scope.pageReady === false) {
            $scope.pageReady = true;
          }
        });
    }
  };
  $scope.userFilters = function (resetPaging, callback) {
    ctrl.getFilterData('userFilters');
    if ($scope.filterModels.StartDate) {
      ctrl.filterDto.dateType = $scope.filterModels.StartDate.dateType;
    }
    if ($scope.filterModels.ProviderUserIds) {
      if ($scope.filterModels.ProviderUserIds.data.length === 1) {
        if (
          $scope.filterModels.ProviderUserIds.data[0].Id ===
          '00000000-0000-0000-0000-000000000000' &&
          $scope.filterModels.ProviderUserIds.data[0].Checked
        ) {
          ctrl.filterDto.ProviderUserIds.push(
            '00000000-0000-0000-0000-000000000000'
          );
        }
      }
    } else if ($scope.filterModels.ProviderIds) {
      if ($scope.filterModels.ProviderIds.data.length === 1) {
        if (
          $scope.filterModels.ProviderIds.data[0].Id ===
          '00000000-0000-0000-0000-000000000000' &&
          $scope.filterModels.ProviderIds.data[0].Checked
        ) {
          ctrl.filterDto.ProviderIds.push(
            '00000000-0000-0000-0000-000000000000'
          );
        }
      }
    }

    if ($scope.filterModels.CollectionStartDate) {
      ctrl.filterDto.CollectioDateType =
        $scope.filterModels.CollectionStartDate.CollectioDateType;
    }
    if ($scope.filterModels.ProductionStartDate) {
      ctrl.filterDto.ProductionDateType =
        $scope.filterModels.ProductionStartDate.ProductionDateType;
    }
    if (ctrl.filterDto.LocationIds) {
      ctrl.filterDto.LocationIds = ctrl.filterDto.LocationIds.filter(function (
        item,
        idx
      ) {
        return item !== 0;
      });
    }
    if (ctrl.filterDto.DistributedLocationIds) {
      ctrl.filterDto.DistributedLocationIds = ctrl.filterDto.DistributedLocationIds.filter(function (
        item,
        idx
      ) {
        return item !== 0;
      });
    }
    if (ctrl.filterDto.FlagIds) {
      if ($scope.filterModels.FlagIds.data[0].Checked) {
        ctrl.filterDto.FlagIds = ctrl.filterDto.FlagIds.filter(function (
          item,
          idx
        ) {
          return item !== '00000000-0000-0000-0000-000000000000';
        });
        ctrl.filterDto.FlagIds.unshift('00000000-0000-0000-0000-000000000000');
      }
    }
    if (ctrl.filterDto.MedicalHistoryAlertIds) {
      if ($scope.filterModels.MedicalHistoryAlertIds.data[0].Checked) {
        ctrl.filterDto.MedicalHistoryAlertIds = ctrl.filterDto.MedicalHistoryAlertIds.filter(
          function (item, idx) {
            return item !== -1;
          }
        );
        ctrl.filterDto.MedicalHistoryAlertIds.unshift(-1);
      }
    }
    if (ctrl.filterDto.ReferralSourceIds) {
      ctrl.filterDto.selectedReferralType =
        $scope.filterModels.ReferralSourceIds.selectedReferralType;
      if ($scope.filterModels.ReferralSourceIds.selectedAllPatients) {
        ctrl.filterDto.selectedAllPatients =
          $scope.filterModels.ReferralSourceIds.selectedAllPatients;
      }
        if (($scope.reportId === $scope.reportIds.ReferredPatientsBetaReportId || $scope.reportIds.ReferralSourceProductivityReportId || $scope.reportId === $scope.reportIds.ReferralAffiliatesReportId) && $scope.filterModels.ReferralSourceIds.selectedAllExternalProviders) {
        ctrl.filterDto.selectedAllExternalProviders =
          $scope.filterModels.ReferralSourceIds.selectedAllExternalProviders;
      }
    }

    var userDefinedFilterDto = {};
    userDefinedFilterDto.Filters = JSON.stringify(ctrl.filterDto);
    userDefinedFilterDto.ReportId = $scope.reportId;
    reportsFactory.SaveFilters(userDefinedFilterDto).then(
      function (res) {
        $rootScope.$broadcast('business:reports');
      },
      function () { }
    );
  };

  ctrl.afterFilterInit = function () {
    var context = reportsFactory.GetReportContext();
    if (context && context.PresetFilterDto) {
      for (var property in context.PresetFilterDto) {
        switch (property) {
          case 'EndDate':
            $scope.filterModels[
              'StartDate'
            ].FilterDtoEndDate = $scope.filterModels[
              'StartDate'
            ].EndDate = moment(context.PresetFilterDto[property]).toDate();
            break;
          case 'StartDate':
            $scope.filterModels[
              'StartDate'
            ].FilterDtoStartDate = $scope.filterModels[
              'StartDate'
            ].StartDate = moment(context.PresetFilterDto[property]).toDate();
            break;
          case 'DistributedLocationIds':
          case 'LocationIds':
            $scope.filterModels[property].FilterDto =
              context.PresetFilterDto[property];
            _.each($scope.filterModels[property].data, function (item) {
              item.Checked =
                _.includes(context.PresetFilterDto[property], ctrl.emptyGuid) ||
                _.includes(context.PresetFilterDto[property], item.Id);
            });
            if (_.includes(context.PresetFilterDto[property], ctrl.emptyGuid)) {
              $scope.filterModels[
                property
              ].FilterString = localize.getLocalizedString('All');
            } else {
              $scope.filterModels[property].FilterString = _.filter(
                $scope.filterModels[property].data,
                function (item) {
                  return item.Checked;
                }
              )
                .map(function (l) {
                  return l.Value;
                })
                .join(', ');
            }
            break;
          case 'ProviderUserIds':
          case 'TransactionTypes':
          case 'CarrierIds':
          case 'PatientStatus':
            $scope.filterModels[property].FilterDto =
              context.PresetFilterDto[property];
            _.each($scope.filterModels[property].data, function (item) {
              item.Checked =
                context.PresetFilterDto[property].indexOf(item.Id) !== -1;
            });
            $scope.filterModels[property].FilterString = _.filter(
              $scope.filterModels[property].data,
              function (l) {
                return l.Checked;
              }
            )
              .map(function (l) {
                return l.Value;
              })
              .join(', ');
            break;
          case 'ServiceCodeStatus':
            $scope.filterModels[property].FilterDto = _.filter(
              $scope.filterModels[property].data,
              function (data) {
                return _.includes(
                  context.PresetFilterDto[property],
                  data.Value
                );
              }
            ).map(function (data) {
              return data.Id;
            });
            _.each($scope.filterModels[property].data, function (item) {
              item.Checked = _.includes(
                context.PresetFilterDto[property],
                item.Value
              );
            });
            $scope.filterModels[property].FilterString = _.filter(
              $scope.filterModels[property].data,
              function (l) {
                return l.Checked;
              }
            )
              .map(function (l) {
                return l.Value;
              })
              .join(', ');
            break;
          case 'TreatmentPlanStatus':
            $scope.filterModels[property].FilterDto = _.filter(
              $scope.filterModels[property].data,
              function (data) {
                return _.includes(
                  context.PresetFilterDto[property],
                  data.Value
                );
              }
            ).map(function (data) {
              return data.Id;
            });
            _.each($scope.filterModels[property].data, function (item) {
              item.Checked = _.includes(
                context.PresetFilterDto[property],
                item.Value
              );
            });
            $scope.filterModels[property].FilterString = _.filter(
              $scope.filterModels[property].data,
              function (l) {
                return l.Checked;
              }
            )
              .map(function (l) {
                return l.Value;
              })
              .join(', ');
            break;
          case 'ProviderTypes':
            var providerFilterDto = [];
            var providerTypeId =
              context.PresetFilterDto[property][0] === 'Dentist' ? 1 : 2;
            _.each(
              $scope.filterModels['ProviderUserIds'].FilterFilterModel.data,
              function (item) {
                item.Checked =
                  context.PresetFilterDto[property].indexOf(item.Value) !== -1;
              }
            );
            _.each(
              $scope.filterModels['ProviderUserIds'].data,
              function (item) {
                if (item.Id == ctrl.emptyGuid) {
                  providerFilterDto.push(item);
                } else {
                  _.each(item.FilterValue, function (loc) {
                    if (
                      loc.ProviderTypeId === providerTypeId &&
                      providerFilterDto.filter(function (l) {
                        return l.ProviderTypeId === loc.ProviderTypeId;
                      }).length == 0
                    ) {
                      providerFilterDto.push(item);
                    }
                  });
                }
              }
            );
            $scope.filterModels['ProviderUserIds'].data = providerFilterDto;
            _.each(
              $scope.filterModels['ProviderUserIds'].data,
              function (item) {
                item.isVisible = true;
              }
            );
            $scope.filterModels['ProviderUserIds'].FilterDto = _.filter(
              providerFilterDto,
              function (item) {
                return item.FilterValue;
              }
            ).map(function (item) {
              return item.Id;
            });
            $scope.filterModels['ProviderUserIds'].FilterString = 'All';
            $scope.filterModels[
              'ProviderUserIds'
            ].FilterFilterModel.FilterDto = [providerTypeId];
            $scope.filterModels[
              'ProviderUserIds'
            ].FilterFilterModel.FilterString = _.filter(
              $scope.filterModels['ProviderUserIds'].FilterFilterModel.data,
              function (l) {
                return l.Checked;
              }
            )
              .map(function (l) {
                return l.Value;
              })
              .join(', ');
            break;
          case 'DiscountType':
            $scope.filterModels[property].FilterDto = _.filter(
              $scope.filterModels[property].data,
              function (data) {
                return _.includes(
                  context.PresetFilterDto[property],
                  data.Value
                );
              }
            ).map(function (data) {
              return data.Id;
            });
            _.each($scope.filterModels[property].data, function (item) {
              item.Checked = _.includes(
                context.PresetFilterDto[property],
                item.Value
              );
            });
            $scope.filterModels[property].FilterString = _.filter(
              $scope.filterModels[property].data,
              function (l) {
                return l.Checked;
              }
            )
              .map(function (l) {
                return l.Value;
              })
              .join(', ');
            break;
          case 'PatientIds':
            $scope.$broadcast(
              'reportPatientFilterModel.SelectPatients',
              context.PresetFilterDto[property]
            );
            $scope.filterModels[property].FilterDto =
              context.PresetFilterDto[property];
            break;
          case 'PositiveAdjustmentTypeIds':
          case 'NegativeAdjustmentTypeIds':
            $scope.filterModels[property].FilterDto =
              context.PresetFilterDto[property];
            _.each($scope.filterModels[property].data, function (item) {
              item.Checked =
                _.includes(context.PresetFilterDto[property], ctrl.emptyGuid) ||
                _.includes(context.PresetFilterDto[property], item.Id);
            });
            if (_.includes(context.PresetFilterDto[property], ctrl.emptyGuid)) {
              $scope.filterModels[
                property
              ].FilterString = localize.getLocalizedString('All');
            } else if (context.PresetFilterDto[property].length < 1) {
              $scope.filterModels[
                property
              ].FilterString = localize.getLocalizedString(
                'No filters applied'
              );
            } else {
              $scope.filterModels[property].FilterString = _.filter(
                $scope.filterModels[property].data,
                function (item) {
                  return item.Checked;
                }
              );
            }
                break;
            case 'TaxableServiceTypes':
                $scope.filterModels[property].FilterDto =
                    context.PresetFilterDto[property];
                _.each($scope.filterModels[property].data, function (item) {
                    item.Checked =
                        context.PresetFilterDto[property].indexOf(item.Id) !== -1;
                });
                $scope.filterModels[property].FilterString = _.filter(
                    $scope.filterModels[property].data,
                    function (l) {
                        return l.Checked;
                    }
                )
                    .map(function (l) {
                        return l.Value;
                    })
                    .join(', ');
                break;
          default:
            if (_.has($scope.filterModels, property)) {
              $scope.filterModels[property].FilterDto =
                context.PresetFilterDto[property];
            }
        }
      }
      reportsFactory.ClearReportContext();
    }
    $scope.getReport(true, function () {
      ctrl.setFilterString();
      ctrl.setDateRangeTitle();
    });
  };

  $scope.afterFilterInit = function () {
    if ($scope.pageReady) {
        ctrl.afterFilterInit();
    } else {
      $scope.$watch('pageReady', function (nv) {
        if (nv) {
          ctrl.afterFilterInit();
        }
      });
    }
  };

  // Empties the filterDto properties so the initial report generated will be very quick
  ctrl.emptyFilterDto = function () {
    for (var key in ctrl.filterDto) {
      if (_.has(ctrl.filterDto, key)) {
        if (_.isArray(ctrl.filterDto[key])) {
          ctrl.filterDto[key] = [];
        } else if (typeof ctrl.filterDto[key] == 'string') {
          ctrl.filterDto[key] = '';
        }
      }
    }
  };

  $scope.getAllMissingData = function (callback) {
    // Be sure we have ALL of the data, used when printing or exporting and Activity Log is paging and does not have all of the data
    if ($scope.getAllRows || !$scope.allDataDisplayed) {
      $scope.getAllRows = true;
      $scope.getReport(false, callback);
    } else {
      callback();
    }
  };

  //
  ctrl.$onInit();

  $scope.$on('patCore:initlocation', function () {
    if (!patSecurityService.IsAuthorizedByAbbreviation($scope.reportAmfa)) {
      toastrFactory.error(
        localize.getLocalizedString(
          'You do not have permission to view this report.'
        ),
        localize.getLocalizedString('Not Authorized')
      );
      window.location.replace('#');
    }
  });
  $scope.allData = $scope.$parent;

  $scope.toggleViewFilters = function ($event) {
    $scope.isFiltersOpen = !$scope.isFiltersOpen;
    $event.stopPropagation();
  };

  $scope.closePopover = function () {
    $scope.isFiltersOpen = false;
  };
}

ReportPageController.prototype = Object.create(BaseCtrl.prototype);