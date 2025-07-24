'use strict';

angular
  .module('Soar.BusinessCenter')
  .controller('FeeScheduleLandingController', [
    '$scope',
    '$window',
    '$location',
    'patSecurityService',
    'toastrFactory',
    'BusinessCenterServices',
    'localize',
    'tabLauncher',
    '$timeout',
    'ReportsFactory',
    function (
      $scope,
      $window,
      $location,
      patSecurityService,
      toastrFactory,
      businessCenterServices,
      localize,
      tabLauncher,
      $timeout,
      reportsFactory
    ) {
      //#region scope and controller variables

      var ctrl = this;
      $scope.loadingFeeSchedules = false;
      $scope.loadingMessageNoResults = localize.getLocalizedString(
        'There are no {0}',
        ['fee schedules']
      );
      $scope.reports = {};
      $scope.createFeeSchedule =
        '#/BusinessCenter/Insurance/FeeSchedule/Create';
      //#endregion
      //#region Authentication

      // view access
      ctrl.authViewAccess = function () {
        return patSecurityService.IsAuthorizedByAbbreviation(
          'soar-ins-ifsch-view'
        );
      };
      $scope.authfsbybpViewAccess = function () {
        if (
          patSecurityService.IsAuthorizedByAbbreviation(
            'soar-report-ins-fsbybp'
          )
        ) {
          return true;
        } else {
          return false;
        }
      };
      $scope.authpbyfsViewAccess = function () {
        if (
          patSecurityService.IsAuthorizedByAbbreviation('soar-report-pat-pbyfs')
        ) {
          return true;
        } else {
          return false;
        }
      };
      $scope.authfsmastViewAccess = function () {
        if (
          patSecurityService.IsAuthorizedByAbbreviation(
            'soar-report-ins-fsmast'
          )
        ) {
          return true;
        } else {
          return false;
        }
      };
      $scope.authfsbycrViewAccess = function () {
        if (
          patSecurityService.IsAuthorizedByAbbreviation(
            'soar-report-ins-fsbycr'
          )
        ) {
          return true;
        } else {
          return false;
        }
      };
      $scope.authfsbycViewAccess = function () {
        if (
          patSecurityService.IsAuthorizedByAbbreviation('soar-report-ins-fsbyc')
        ) {
          return true;
        } else {
          return false;
        }
      };
      $scope.authenbyfsViewAccess = function () {
        if (
          patSecurityService.IsAuthorizedByAbbreviation(
            'soar-report-ins-enbyfs'
          )
        ) {
          return true;
        } else {
          return false;
        }
      };
      ctrl.authAccess = function () {
        if (!ctrl.authViewAccess()) {
          toastrFactory.error(
            patSecurityService.generateMessage('soar-ins-ifsch-view'),
            'Not Authorized'
          );
          $location.path('/');
        } else {
          ctrl.hasViewAccess = true;
        }
      };

      ctrl.authAccess();

      //#endregion

      // Navigates user to add fee schedule screen
      $scope.addFeeSchedule = function () {
        if (
          patSecurityService.IsAuthorizedByAbbreviation('soar-ins-ifsch-add')
        ) {
          $location.path(
            '/BusinessCenter/Insurance/FeeSchedule/FeeScheduleAdd/'
          );
        }
      };

      // function to navigate user to details page if fee Schedule Item link is clicked in kendo grid
      $scope.feeScheduleItemClicked = function (feeScheduleData) {
        var feeScheduleId = feeScheduleData.dataItem.FeeScheduleId;
        tabLauncher.launchNewTab(
          '#/BusinessCenter/Insurance/FeeSchedule/FeeScheduleDetails/' +
            _.escape(feeScheduleId)
        );
      };

      //#region Initialize Report Data

      //#endregion

      $scope.reports = [];
      $scope.isReportDataLoaded = false;
      $scope.accessReportIds = [];
      $scope.selectedReport = { ReportId: 0 };
      ctrl.BenefitPlansbyFeeScheduleReportId = 5;
      ctrl.FeeScheduleAnalysisbyCarrierReportId = 37;
      ctrl.FeeSchedulesbyCarrierReportId = 10;
      ctrl.FeeScheduleMasterReportId = 11;
      ctrl.PatientsbyFeeScheduleReportId = 7;
      ctrl.EncountersbyFeeScheduleReportId = 48;
      //#region Generate Reports
      ctrl.getListOfServiceReports = function () {
        if (
          $scope.authfsbybpViewAccess() &&
          $scope.authpbyfsViewAccess() &&
          $scope.authfsmastViewAccess() &&
          $scope.authfsbycrViewAccess() &&
          $scope.authfsbycViewAccess() &&
          $scope.authenbyfsViewAccess()
        ) {
          $scope.accessReportIds = [
            ctrl.BenefitPlansbyFeeScheduleReportId,
            ctrl.FeeScheduleAnalysisbyCarrierReportId,
            ctrl.FeeSchedulesbyCarrierReportId,
            ctrl.FeeScheduleMasterReportId,
            ctrl.PatientsbyFeeScheduleReportId,
            ctrl.EncountersbyFeeScheduleReportId,
          ];
        } else if (
          $scope.authfsbybpViewAccess() &&
          $scope.authpbyfsViewAccess() &&
          $scope.authfsmastViewAccess() &&
          $scope.authfsbycrViewAccess()
        ) {
          $scope.accessReportIds = [
            ctrl.BenefitPlansbyFeeScheduleReportId,
            ctrl.FeeSchedulesbyCarrierReportId,
            ctrl.FeeScheduleMasterReportId,
            ctrl.PatientsbyFeeScheduleReportId,
          ];
        } else if (
          $scope.authfsbycViewAccess() &&
          $scope.authenbyfsViewAccess()
        ) {
          $scope.accessReportIds = [
            ctrl.FeeScheduleAnalysisbyCarrierReportId,
            ctrl.EncountersbyFeeScheduleReportId,
          ];
        } else if ($scope.authfsbybpViewAccess()) {
          $scope.accessReportIds = [ctrl.BenefitPlansbyFeeScheduleReportId];
        } else if ($scope.authpbyfsViewAccess()) {
          $scope.accessReportIds = [ctrl.PatientsbyFeeScheduleReportId];
        } else if ($scope.authfsmastViewAccess()) {
          $scope.accessReportIds = [ctrl.FeeScheduleMasterReportId];
        } else if ($scope.authfsbycrViewAccess()) {
          $scope.accessReportIds = [ctrl.FeeSchedulesbyCarrierReportId];
        } else if ($scope.authfsbycViewAccess()) {
          $scope.accessReportIds = [ctrl.FeeScheduleAnalysisbyCarrierReportId];
        } else if ($scope.authenbyfsViewAccess()) {
          $scope.accessReportIds = [ctrl.EncountersbyFeeScheduleReportId];
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

      $scope.selectedReport = { ReportId: 0 };
      $scope.$watch('selectedReport.ReportId', function (nv, ov) {
        if (nv != ov && nv > 0) {
          reportsFactory.OpenReportPage(
            $scope.reports[$scope.selectedReport.ReportId - 1],
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
      //#endregion

      //keep the column search redirection on enter 
    $scope.preventDefault = function(event) {
        if (event.keyCode === 13) {
            event.preventDefault();
        }
     };
    

      //#region Initialize Grid

      //Function to initialize fee schedules grid
      ctrl.gridInit = function () {
        ctrl.feeScheduleDataSource = new kendo.data.DataSource({
          data: [],
          schema: {
            model: {
              fields: {
                FeeScheduleName: { editable: false, sortable: true },
                $CarrierNames: { editable: false, sortable: true },
                $AssociatedPlans: { editable: false, sortable: true },
              },
            },
          },
          sort: {
            field: 'FeeScheduleName',
            dir: 'asc',
          },
        });

        //Fee Schedule Options
        $scope.feeScheduleOptions = {
          sortable: true,
          dataSource: ctrl.feeScheduleDataSource,
         serverFiltering: true,
          height: 500,
          filterable: {
            mode: 'row',
          },
          editable: false,

          columns: [
            {
              field: 'FeeScheduleName',
              template: kendo.template(
                '<button class="btn btn-link" ng-attr-title="#:FeeScheduleName#" ng-click="preventDefault($event)" check-auth-z="soar-ins-ifsch-view" ng-mousedown="feeScheduleItemClicked(this)">#:FeeScheduleName#</button>'
              ),
              title: 'Fee Schedule Name',
              editable: false,
              sortable: true,
              width:140,
              filterable: {
                cell: {
                  showOperators: false,
                  operator: 'contains',
                  enabled: true,
                  minLength: 3,   // restrict the search query length in FeeScheduleName field
                  delay: 150000000 // provide the delay for make hide of suggestion box while typing in Fee Schedule Name of columnn
                },
              },
            },
            {
              field: '$CarrierNames',
              template: kendo.template(
                '<div check-auth-z="soar-ins-ifsch-view">#:$CarrierNames#</div>'
              ),
              title: 'Carrier',
              editable: false,
              sortable: false,
              width:210,
              filterable: {
                cell: {
                  showOperators: false,
                  operator: 'contains',
                  enabled: true,
                  minLength: 3 ,   // restrict the search query length in Carrier field
                  delay: 150000000 //  provide the delay for make hide of suggestion box while typing in carrier of columnn
                },
              },
            },
            {
              field: '$AssociatedPlans',
              attributes: { style: 'text-align:center' },
              template: kendo.template(
                '<div check-auth-z="soar-ins-ifsch-view">#:$AssociatedPlans#</div>'
              ),
              title: 'Associated Plans',
              editable: false,
              sortable: false,
              width:80,  
              filterable: {
                cell: {
                  showOperators: false,
                  operator: 'contains',
                  enabled: true,
                     delay: 150000000  //  provide the delay for make hide of suggestion box while typing in associated Plans of columnn
                },
              },
            },
            {
              title: ' ',
              width: 25,
              template: kendo.template(
                '<ellipsis-menu call-function="actionsFunction(functionName, this)"  menu-tabindex="-1" menu-actions="feeSchdMenu"></ellipsis-menu>'
              ),
            },
          ],
        };
        ctrl.getListOfServiceReports();
      };

      // ellipsis menu
      $scope.feeSchdMenu = [
        {
          FunctionName: 'feeScheduleItemClicked',
          LinkText: localize.getLocalizedString('View Fee Schedule'),
          AuthZ: 'soar-ins-ifsch-view',
        },
      ];

      //Function to navigate to details page through ellipsis menu
      $scope.actionsFunction = function (functionName, param) {
        if (functionName && $scope[functionName]) {
          $scope[functionName](param);
        }
      };

      //Function call to initialize fee schedules grid
      ctrl.gridInit();

      //#endregion

      //#region Get Fee-Schedules

      // setup all required data.
      ctrl.getfeeSchedules = function () {
        $scope.loadingFeeSchedules = true;
        // get all fee schedules from server.
        if (ctrl.hasViewAccess) {
          businessCenterServices.FeeSchedule.get(
            ctrl.feeScheduleGetAllSuccess,
            ctrl.feeScheduleGetAllFailure
          );
        }
      };

      //Success callback to load fee schedules
      ctrl.feeScheduleGetAllSuccess = function (successResponse) {
        ctrl.feeSchedules = successResponse.Value;
        ctrl.getCarriers();
      };

      //Error callback to handle failure while retrieving fee schedules
      ctrl.feeScheduleGetAllFailure = function () {
        $scope.loadingFeeSchedules = false;
        toastrFactory.error(
          localize.getLocalizedString(
            'There was an error while attempting to retrieve fee schedules.'
          ),
          localize.getLocalizedString('Server Error')
        );
      };

      ctrl.getCarriers = function () {
        //get all carriers
        if (ctrl.hasViewAccess) {
          businessCenterServices.Carrier.get(
            ctrl.carrierGetAllSuccess,
            ctrl.carrierGetAllFailure
          );
        }
      };

      ctrl.carrierGetAllSuccess = function (response) {
        ctrl.carriers = response.Value;
        ctrl.getBenefitPlans();
      };

      ctrl.carrierGetAllFailure = function () {
        $scope.loadingFeeSchedules = false;
        toastrFactory.error(
          localize.getLocalizedString(
            'There was an error while attempting to retrieve carriers.'
          ),
          localize.getLocalizedString('Server Error')
        );
      };

      ctrl.getBenefitPlans = function () {
        //get all benefitPlans
        if (ctrl.hasViewAccess) {
          businessCenterServices.BenefitPlan.get(
            ctrl.benefitPlansGetAllSuccess,
            ctrl.benefitPlansGetAllFailure
          );
        }
      };

      ctrl.benefitPlansGetAllSuccess = function (response) {
        $scope.loadingFeeSchedules = false;
        ctrl.benefitPlans = response.Value;

        // assign $CarrierNames and $AssociatedPlans to ctrl.feeSchedules object
        ctrl.addCarrierNamesAssociatedWithFeeSchedules();
        ctrl.addAssociatedPlansCount();

        ctrl.feeScheduleDataSource.data(ctrl.feeSchedules);
      };

      ctrl.benefitPlansGetAllFailure = function () {
        $scope.loadingFeeSchedules = false;
        toastrFactory.error(
          localize.getLocalizedString(
            'There was an error while attempting to benefit plans.'
          ),
          localize.getLocalizedString('Server Error')
        );
      };

      ctrl.addCarrierNamesAssociatedWithFeeSchedules = function () {
        // add all carriers related to a fee schedule to ctrl.feeSchedules
        var carrierNames = [];
        for (var i = 0; i < ctrl.feeSchedules.length; i++) {
          for (var j = 0; j < ctrl.carriers.length; j++) {
            for (var k = 0; k < ctrl.carriers[j].FeeScheduleList.length; k++) {
              if (
                ctrl.feeSchedules[i].FeeScheduleId ===
                ctrl.carriers[j].FeeScheduleList[k].FeeScheduleId
              ) {
                carrierNames.push(ctrl.carriers[j].Name);
              }
            }
          }
          carrierNames.sort();
          ctrl.feeSchedules[i].$CarrierNames = carrierNames.join(', ');
          carrierNames = [];
        }
      };

      ctrl.addAssociatedPlansCount = function () {
        // add count of benefit plans associated with fee schedule to ctrl.feeSchedules
        var associatedPlansCount = 0;
        for (var i = 0; i < ctrl.feeSchedules.length; i++) {
          for (var j = 0; j < ctrl.benefitPlans.length; j++) {
            if (
              ctrl.feeSchedules[i].FeeScheduleId ===
              ctrl.benefitPlans[j].FeeScheduleId
            ) {
              associatedPlansCount++;
            }
          }
          ctrl.feeSchedules[i].$AssociatedPlans =
            associatedPlansCount.toString();
          associatedPlansCount = 0;
        }
      };

      ctrl.getfeeSchedules();
      //#end region

      // Options for dropdown menu
      $scope.viewOptions = [
        {
          Name: 'Claim & Predetermination',
          Plural: 'Claims & Predeterminations',
          RouteValue: 'claims',
          Url: '#/BusinessCenter/Insurance/Claims',
          Template: 'App/BusinessCenter/insurance/claims/claims.html',
          Amfa: 'soar-ins-iclaim-view',
          Controls: false,
        },
        {
          Name: 'Carrier',
          Plural: 'Carriers',
          RouteValue: 'carriers',
          Url: '#/BusinessCenter/Insurance/Carriers',
          Template: 'App/BusinessCenter/insurance/carriers/carriers.html',
          Amfa: 'soar-ins-ibcomp-view',
          Controls: true,
        },
        {
          Name: 'Plan',
          Plural: 'Plans',
          RouteValue: 'plans',
          Url: '#/BusinessCenter/Insurance/Plans',
          Template:
            'App/BusinessCenter/insurance/benefit-plans/dental-benefit-plans.html',
          Amfa: 'soar-ins-ibplan-view',
          Controls: true,
        },
        {
          Name: 'Fee Schedule',
          Plural: 'Fee Schedules',
          RouteValue: 'feeschedule',
          Url: '#/BusinessCenter/Insurance/FeeSchedule',
          Template:
            'App/BusinessCenter/insurance/fee-schedule/fee-schedule-landing.html',
          Amfa: 'soar-ins-ifsch-view',
          Controls: true,
        },
      ];

      // Navigations user as per selected option from dropdown list
      $scope.selectView = function (view) {
        $scope.selectedView = view;
        $scope.filter = '';
        $window.location.href = view.Url;
      };
    },
  ]);
