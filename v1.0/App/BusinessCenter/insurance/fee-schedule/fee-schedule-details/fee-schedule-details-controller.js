'use strict';

angular
  .module('Soar.BusinessCenter')
  .controller('FeeScheduleDetailsController', [
    '$rootScope',
    'toastrFactory',
    'localize',
    '$scope',
    '$routeParams',
    '$location',
    'tabLauncher',
    'patSecurityService',
    'BusinessCenterServices',
    function (
      $rootScope,
      toastrFactory,
      localize,
      $scope,
      $routeParams,
      $location,
      tabLauncher,
      patSecurityService,
      businessCenterServices
    ) {
      //#region scope and controller variables
      var ctrl = this;
      $scope.feeScheduleForLoggedInLoc = true;
      ctrl.feeScheduleId = $routeParams.FeeScheduleId;
      $scope.loadingDetails = false;
      $scope.loadingMessageNoResults = localize.getLocalizedString(
        'Could not found details associated with this fee schedule'
      );

      //#endregion

      // #region authorization

      // auth view access
      ctrl.authViewAccess = function () {
        return patSecurityService.IsAuthorizedByAbbreviation(
          'soar-ins-ifsch-view'
        );
      };

      ctrl.authAccess = function () {
        if (!ctrl.authViewAccess()) {
          toastrFactory.error(
            patSecurityService.generateMessage('soar-ins-ifsch-view'),
            'Not Authorized'
          );
          $location.path('/');
        }
      };

      //auth access
      ctrl.authAccess();

      //#endregion

      //function to open edit page once clicked on edit button
      $scope.openFeeScheduleTab = function () {
        var IsCopy = false;
        if (
          patSecurityService.IsAuthorizedByAbbreviation('soar-ins-ifsch-edit')
        ) {
          $location.path(
            '/BusinessCenter/Insurance/FeeSchedule/Edit/' +
              _.escape(ctrl.feeScheduleId)
          );
        }
      };

      //function to make a copy of a fee schedule
      $scope.copyFeeSchedule = function () {
        var IsCopy = true;
        tabLauncher.launchNewTab(
          '#/BusinessCenter/Insurance/FeeSchedule/Create/' +
            _.escape(ctrl.feeScheduleId) +
            '/' +
            _.escape(IsCopy)
        );
      };
      //#region Get Fee-Schedules By Id

      // setup all required data.
      ctrl.getFeeScheduleById = function () {
        $scope.loadingDetails = true;
        // get fee schedules by id
        var userLocationId = JSON.parse(
          sessionStorage.getItem('userLocation')
        ).id;
        businessCenterServices.FeeSchedule.getByLocation(
          { feeScheduleId: ctrl.feeScheduleId, locationId: userLocationId },
          ctrl.getFeeScheduleByIdSuccess,
          ctrl.getFeeScheduleByIdFailure
        );
      };

      //Success callback to load fee schedules
      ctrl.getFeeScheduleByIdSuccess = function (successResponse) {
        $scope.loadingDetails = false;
        $scope.feeSchedule = successResponse.Value;
        if ($scope.feeSchedule.FeeScheduleInfoDetails.length === 0) {
          $scope.feeScheduleForLoggedInLoc = false;
        } else {
          angular.forEach(
            $scope.feeSchedule.FeeScheduleInfoDetails,
            function (fee) {
              fee.ServiceCodeDescriptionWithCDTCode = '';
              fee.ServiceCodeDescriptionWithCDTCode =
                fee.ServiceCodeDescription + ' (' + fee.CdtCodeName + ')';
              fee.AdjEst =
                fee.LocationFee - fee.AllowedAmount > 0
                  ? fee.LocationFee - fee.AllowedAmount
                  : 0;
            }
          );
          $scope.feeScheduleData.data(
            $scope.feeSchedule.FeeScheduleInfoDetails
          );
          $scope.feeScheduleForLoggedInLoc = true;
        }
      };

      //Error callback to handle failure while retrieving fee schedules
      ctrl.getFeeScheduleByIdFailure = function () {
        $scope.loadingDetails = false;
        toastrFactory.error(
          localize.getLocalizedString(
            'There was an error while attempting to retrieve fee schedule details.'
          ),
          localize.getLocalizedString('Server Error')
        );
      };

      //Function call to get fee schedule by id
      ctrl.init = function () {
        ctrl.getFeeScheduleById();
        $rootScope.$on('patCore:initlocation', function () {
          ctrl.getFeeScheduleById();
        });
      };

      ctrl.init();
      //#end region

      //#region Kendo Grid Initialize
      ctrl.gridInit = function () {
        $scope.feeScheduleData = new kendo.data.DataSource({
          data: [],
          group: { field: 'ServiceTypeDescription' },
          sort: { field: 'ServiceCodeName', dir: 'asc' },
          schema: {
            model: {
              fields: {
                ServiceCodeName: { type: 'string' },
                ServiceCodeDescriptionWithCDTCode: { type: 'string' },
                LocationFee: { type: 'number' },
                AllowedAmount: { type: 'number' },
                AdjEst: { type: 'number' },
                ServiceTypeDescription: { type: 'string' },
              },
            },
          },
        });

        //Fee Schedule Columns
        $scope.feeScheduleColumns = [
          {
            field: 'ServiceCodeName',
            title: 'Service Code',
            width: 135,
          },
          {
            field: 'ServiceCodeDescriptionWithCDTCode',
            title: 'Description',
          },
          {
            field: 'LocationFee',
            format: '{0:c}',
            width: 100,
            sortable: false,
            attributes: { style: 'text-align:right;' },
            title: 'Location Fee',
          },
          {
            field: 'AllowedAmount',
            format: '{0:c}',
            sortable: false,
            width: 130,
            attributes: { style: 'text-align:right;' },
            title: 'Allowed Amount',
          },
          {
            field: 'AdjEst',
            format: '{0:c}',
            sortable: false,
            width: 90,
            attributes: { style: 'text-align:right;' },
            title: 'Difference',
          },
          {
            title: ' ',
            width: 40,
            template:
              '<button uib-dropdown-toggle class="btn btn-link btn-lg" icon="fa-ellipsis-v" ></button>',
          },
          {
            field: 'ServiceTypeDescription',
            hidden: true,
            groupHeaderTemplate: '#: value #',
          },
        ];

        //Fee Schedule Options
        $scope.feeScheduleDetailsList = {
          dataSource: $scope.feeScheduleData,
          sortable: true,
          pageable: false,
          height: 600,
          scrollable: {
            virtual: true,
          },
          editable: false,
        };
      };

      //Function call to initialize fee schedules grid
      ctrl.gridInit();

      //#endregion
    },
  ]);
