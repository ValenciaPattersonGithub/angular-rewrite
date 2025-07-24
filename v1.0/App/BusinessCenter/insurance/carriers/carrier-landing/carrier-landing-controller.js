'use strict';

var app = angular.module('Soar.BusinessCenter');

app.controller('CarrierLandingController', [
  '$scope',
  '$sce',
  '$routeParams',
  '$timeout',
  '$location',
  'BusinessCenterServices',
  'toastrFactory',
  'patSecurityService',
  'SaveStates',
  '$filter',
  'ModalFactory',
  'localize',
  'CommonServices',
  function (
    $scope,
    $sce,
    $routeParams,
    $timeout,
    $location,
    businessCenterServices,
    toastrFactory,
    patSecurityService,
    saveStates,
    $filter,
    modalFactory,
    localize,
    commonServices
  ) {
    var ctrl = this;
    $scope.carrierId = '';
    //setup for the data we feed into the Kendo Grids
    ctrl.benefitPlanValues = {
      PlanId: '',
      Plan: '',
      FeeSchedule: '',
      Patients: 0,
      Claims: 0,
    };
    ctrl.feeScheduleValues = {
      FeeScheduleId: '',
      FeeScheduleName: '',
    };

    $scope.benefitPlansData = [];
    $scope.feeScheduleData = [];

    //#region Authorization

    // view access
    ctrl.authViewAccess = function () {
      return patSecurityService.IsAuthorizedByAbbreviation(
        'soar-ins-ibcomp-view'
      );
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

    $scope.carrierTabs = {
      plans: { index: 0, disabled: false },
      feeSchedules: { index: 1, disabled: false },
    };

    $scope.carrierTabsToggle = function (index) {
      $scope.carrierActiveTab = index;
    };

    $scope.cancel = function () {
      $location.path(_.escape('BusinessCenter/Insurance/Carriers'));
    };

    // method to set kendo grid datasource
    ctrl.setGridData = function (data) {
      $('#BenefitPlans').data('kendoGrid').dataSource.data(data);
    };

    $scope.filterPlans = function (searchTerm) {
      $scope.benefitPlansData = _.filter(
        $scope.allBenefitPlans,
        function (plan) {
          if (plan.Plan && plan.PlanGroupNumber) {
            return (
              plan.Plan.toLowerCase().indexOf(searchTerm) >= 0 ||
              plan.PlanGroupNumber.toLowerCase().indexOf(searchTerm) >= 0
            );
          } else if (
            plan.Plan &&
            (plan.PlanGroupNumber === null ||
              plan.PlanGroupNumber === undefined ||
              plan.PlanGroupNumber === '')
          ) {
            return plan.Plan.toLowerCase().indexOf(searchTerm) >= 0;
          } else if (
            plan.PlanGroupNumber &&
            (plan.Plan === null || plan.Plan === undefined || plan.Plan === '')
          ) {
            return plan.PlanGroupNumber.toLowerCase().indexOf(searchTerm) >= 0;
          } else {
            return plan;
          }
        }
      );
      ctrl.setGridData($scope.benefitPlansData);
    };

    // print carrier attached plans handler
    $scope.printCarrierPlans = function () {
      var benefitPlans = [];
      angular.forEach($scope.benefitPlansData, function (plan) {
        benefitPlans.push(plan.PlanId);
      });

      var carrierBenefitPlansPdfDto = {
        CarrierId: $routeParams.guid,
        BenefitPlanIds: benefitPlans,
      };

      commonServices.Insurance.CarrierAttachedPlansPdf(
        carrierBenefitPlansPdfDto
      ).then(ctrl.printCarrierPlansSuccess, ctrl.printCarrierPlansFailure);
    };

    ctrl.printCarrierPlansSuccess = function (response) {
      var file = new Blob([response.data], { type: 'application/pdf' });

      if (window.navigator && window.navigator.msSaveOrOpenBlob) {
        window.navigator.msSaveOrOpenBlob(
          file,
          $scope.carrierName + '_Plans.pdf'
        );
      } else {
        var fileUrl = URL.createObjectURL(file);
        $scope.pdfContent = $sce.trustAsResourceUrl(fileUrl);
      }
      window.open($scope.pdfContent.toString());
    };

    ctrl.printCarrierPlansFailure = function () {
      toastrFactory.error(
        { Text: 'Failed to {0}.', Params: ['print attached plans'] },
        'Error'
      );
    };

    ctrl.getCarrierById = function (guid) {
      $scope.loading = true;
      businessCenterServices.Carrier.get(
        { carrierId: guid },
        function (res) {
          $scope.loading = false;

          $scope.carrier = res.Value;
          $scope.carrierName = angular.copy($scope.carrier.Name);
          $scope.carrierPayerId = angular.copy($scope.carrier.PayerId);

          if ($scope.carrier.AddressLine1 !== null) {
            $scope.address1 = true;
            $scope.carrierAddress1 = angular.copy($scope.carrier.AddressLine1);
          }
          if ($scope.carrier.AddressLine2 !== null) {
            $scope.address2 = true;
            $scope.carrierAddress2 = angular.copy($scope.carrier.AddressLine2);
          }
          if ($scope.carrier.City !== null) {
            $scope.city = true;
            $scope.carrierCity = angular.copy($scope.carrier.City);
          }
          if ($scope.carrier.State !== null) {
            $scope.state = true;
            $scope.carrierState = angular.copy($scope.carrier.State);
          }
          if ($scope.carrier.ZipCode !== null) {
            $scope.zipcode = true;
            $scope.carrierZipCode = angular.copy($scope.carrier.ZipCode);
          }
          if ($scope.carrier.PhoneNumbers !== null) {
            if ($scope.carrier.PhoneNumbers.length >= 1) {
              $scope.phone1 = true;
              $scope.carrierPhoneMain = angular.copy(
                $scope.carrier.PhoneNumbers[0].PhoneNumber
              );
            }
            if ($scope.carrier.PhoneNumbers.length >= 2) {
              $scope.phone2 = true;
              $scope.carrierPhoneDirect = angular.copy(
                $scope.carrier.PhoneNumbers[1].PhoneNumber
              );
            }
            if ($scope.carrier.PhoneNumbers.length >= 3) {
              $scope.phone3 = true;
              $scope.carrierPhone3 = angular.copy(
                $scope.carrier.PhoneNumbers[2].PhoneNumber
              );
            }
            if ($scope.carrier.PhoneNumbers.length >= 4) {
              $scope.phone4 = true;
              $scope.carrierPhone4 = angular.copy(
                $scope.carrier.PhoneNumbers[3].PhoneNumber
              );
            }
            if ($scope.carrier.PhoneNumbers.length >= 5) {
              $scope.phone5 = true;
              $scope.carrierPhone5 = angular.copy(
                $scope.carrier.PhoneNumbers[4].PhoneNumber
              );
            }
            if ($scope.carrier.PhoneNumbers.length >= 6) {
              $scope.phone6 = true;
              $scope.carrierPhone6 = angular.copy(
                $scope.carrier.PhoneNumbers[5].PhoneNumber
              );
            }
            if ($scope.carrier.PhoneNumbers.length >= 7) {
              $scope.phone7 = true;
              $scope.carrierPhone7 = angular.copy(
                $scope.carrier.PhoneNumbers[6].PhoneNumber
              );
            }
          }
          if ($scope.carrier.FaxNumber !== null) {
            $scope.fax = true;
            $scope.carrierFax = angular.copy($scope.carrier.FaxNumber);
          }
          if ($scope.carrier.Email !== null) {
            $scope.email = true;
            $scope.carrierEmail = angular.copy($scope.carrier.Email);
          }
          if ($scope.carrier.Notes !== null) {
            $scope.notes = true;
            $scope.carrierNotes = angular.copy($scope.carrier.Notes);
          }
          if ($scope.carrier.Website !== null) {
            $scope.website = true;
            $scope.carrierWebsite = angular.copy($scope.carrier.Website);
            var subString1 = 'https://';
            var subString2 = 'http://';

            if (
              $scope.carrierWebsite.indexOf(subString2) !== -1 &&
              $scope.carrierWebsite.indexOf(subString2) === 0
            ) {
              $scope.websiteHttp = true;
            }
            if (
              $scope.carrierWebsite.indexOf(subString1) !== -1 &&
              $scope.carrierWebsite.indexOf(subString1) === 0
            ) {
              $scope.websiteHttp = false;
              $scope.websiteHttps = true;
            }
          }

          ctrl.getAvailableFeeSchedules();
        },
        function (err) {
          $scope.loading = false;

          toastrFactory.error(
            { Text: 'Failed to retrieve {0}.', Params: ['carrier'] },
            'Error'
          );
        }
      );
    };

    ctrl.getServiceCallData = function () {
      var service = [
        {
          Call: businessCenterServices.Carrier.getPlansSummaryById,
          OnSuccess: ctrl.getAllBenefitPlansSuccess,
          OnError: ctrl.getAllBenefitPlansFailure,
          Params: { carrierId: $routeParams.guid },
        },
      ];
      return service;
    };

    $scope.initialize = function () {
      var guid = $routeParams.guid ? $routeParams.guid : null;

      $scope.carrierId = guid;

      $scope.phone1 = false;
      $scope.phone2 = false;
      $scope.phone3 = false;
      $scope.phone4 = false;
      $scope.phone5 = false;
      $scope.phone6 = false;
      $scope.phone7 = false;
      $scope.fax = false;
      $scope.email = false;
      $scope.notes = false;
      $scope.address1 = false;
      $scope.address2 = false;
      $scope.city = false;
      $scope.state = false;
      $scope.ZipCode = false;
      $scope.website = false;
      $scope.websiteHttp = false;
      $scope.websiteHttps = false;

      $scope.carrierAddress1 = '';
      $scope.carrierAddress2 = '';
      $scope.carrierCity = '';
      $scope.carrierState = '';
      $scope.carrierZipCode = '';
      $scope.carrierWebsite = '';
      $scope.carrierPhoneMain = '';
      $scope.carrierPhoneDirect = '';
      $scope.carrierPhone3 = '';
      $scope.carrierPhone4 = '';
      $scope.carrierPhone5 = '';
      $scope.carrierPhone6 = '';
      $scope.carrierPhone7 = '';
      $scope.carrierFax = '';
      $scope.carrierEmail = '';
      $scope.carrierNotes = '';

      $scope.loading = false;

      $scope.carrier = {
        CarrierId: null,
        Name: null,
        PayerId: null,
        AddressLine1: null,
        AddressLine2: null,
        City: null,
        State: null,
        ZipCode: null,
        PhoneNumbers: [],
        FaxNumber: null,
        Website: null,
        Email: null,
        Notes: null,
        DataTag: null,
        FeeScheduleList: [],
      };

      ctrl.getCarrierById(guid);
      modalFactory.LoadingModal(ctrl.getServiceCallData);
    };

    ctrl.getAvailableFeeSchedules = function () {
      $scope.loading = true;
      businessCenterServices.FeeSchedule.get(
        {},
        function (res) {
          $scope.loading = false;
          //console.log(res.Value);
          $scope.availFeeSchedules = res.Value;
          $scope.carrier.FeeScheduleList.forEach(function (fs) {
            var fsToDelete;
            $scope.availFeeSchedules.forEach(function (avail) {
              if (avail.FeeScheduleId === fs.FeeScheduleId) {
                fsToDelete = avail;
              }
            });
            var index = $scope.availFeeSchedules.indexOf(fsToDelete);
            $scope.availFeeSchedules.splice(index, 1);
            //console.log($scope.carrier.FeeScheduleList);
          });
          for (var i = 0; i < $scope.carrier.FeeScheduleList.length; i++) {
            $scope.feeScheduleData.push(angular.copy(ctrl.feeScheduleValues));
            //console.log($scope.feeScheduleData);
            $scope.feeScheduleData[i].FeeScheduleId =
              $scope.carrier.FeeScheduleList[i].FeeScheduleId;
            $scope.feeScheduleData[i].FeeScheduleName =
              $scope.carrier.FeeScheduleList[i].FeeScheduleName;
          }
          ctrl.listOfFeeSchedules = function () {
            $scope.carrierOnly = _.filter(
              $scope.carrier.FeeScheduleList,
              function (item, index) {
                if (item.FeeScheduleId === true) return true;
              }
            );
          };
        },
        function (err) {
          $scope.loading = false;

          toastrFactory.error(
            { Text: 'Failed to retrieve {0}.', Params: ['fee schedule'] },
            'Error'
          );
        }
      );
    };

    ctrl.getAllBenefitPlansSuccess = function (res) {
      $scope.loading = true;
      $scope.benefitPlans = [];
      $scope.loading = false;
      $scope.benefitPlans = res.Value;

      for (var i = 0; i < res.Value.length; i++) {
        $scope.benefitPlansData.push(angular.copy(ctrl.benefitPlanValues));
        $scope.benefitPlansData[i].PlanId =
          res.Value[i].BenefitPlanDto.BenefitId;
        $scope.benefitPlansData[i].Plan = res.Value[i].BenefitPlanDto.Name;
        var set = false;
        for (var j = 0; j < $scope.carrier.FeeScheduleList.length; j++) {
          if (
            $scope.benefitPlans[i].BenefitPlanDto.FeeScheduleId ===
            $scope.carrier.FeeScheduleList[j].FeeScheduleId
          ) {
            $scope.benefitPlansData[i].FeeSchedule =
              $scope.carrier.FeeScheduleList[j].FeeScheduleName;
            set = true;
          }
        }
        if (!set) {
          $scope.benefitPlansData[i].FeeSchedule = 'No Fee Schedule found.';
        }

        $scope.benefitPlansData[i].Patients = res.Value[i].PatientCount;
        $scope.benefitPlansData[i].Claims = res.Value[i].ClaimsPastYear;
        $scope.benefitPlansData[i].PlanGroupNumber =
          res.Value[i].BenefitPlanDto.PlanGroupNumber;
      }

      $scope.allBenefitPlans = angular.copy($scope.benefitPlansData);
      ctrl.setGridData($scope.allBenefitPlans);
    };

    ctrl.getAllBenefitPlansFailure = function () {
      $scope.loading = false;
      toastrFactory.error(
        { Text: 'Failed to retrieve {0}.', Params: ['Benefit Plans'] },
        'Error'
      );
    };

    // function to navigate user to details page if fee Schedule Item link is clicked in kendo grid.
    $scope.feeScheduleItemClicked = function (feeScheduleData) {
      console.log(feeScheduleData);
      var feeScheduleId = feeScheduleData.dataItem.FeeScheduleId;
      window.location =
        '#/BusinessCenter/Insurance/FeeSchedule/FeeScheduleDetails/' +
        _.escape(feeScheduleId);
    };

    // function to navigate user to details page if fee Schedule Item link is clicked in kendo grid.
    $scope.benefitPlanItemClicked = function (benefitPlanData) {
      console.log(benefitPlanData);
      var benefitPlanId = benefitPlanData.dataItem.PlanId;
      window.location =
        '#/BusinessCenter/Insurance/Plans/Edit?guid=' + _.escape(benefitPlanId);
    };

    ctrl.updatePlanGridDataSource = function (event) {
      $scope.benefitPlansData = event.sender._data;
    };

    // Kendo Grid Options
    $scope.feeScheduleOptions = {
      dataSource: {
        data: $scope.feeScheduleData,
        schema: {
          model: {
            fields: {
              FeeScheduleId: {
                hidden: true,
                editable: false,
              },
              FeeScheduleName: {
                editable: false,
              },
            },
          },
        },
        group: {
          field: 'sortOrder',

          aggregates: [
            { field: 'FeeScheduleId', aggregate: 'sum' },
            { field: 'FeeScheduleName', aggregate: 'sum' },
          ],
        },
      },
      autoBind: true,
      sortable: false,
      pageable: false,
      editable: true,
      columns: [
        {
          field: 'FeeScheduleId',
          groupable: true,
          hidden: true,
        },
        {
          field: 'FeeScheduleName',
          title: 'Fee Schedule',
          template: kendo.template(
            '<button class="btn btn-link" ng-click="feeScheduleItemClicked(this)" check-auth-z="soar-ins-ifsch-view" >#:FeeScheduleName#</button>'
          ),
          width: '100px',
        },
      ],
    };

    $scope.benefitPlanOptions = {
      dataSource: new kendo.data.DataSource({
        data: [],
        schema: {
          model: {
            fields: {
              PlanId: {
                hidden: true,
                editable: false,
              },
              Plan: {
                editable: false,
              },
              FeeSchedule: {
                editable: false,
              },
              Patients: {
                editable: false,
              },
              Claims: {
                editable: false,
              },
              PlanGroupNumber: {
                editable: false,
              },
            },
          },
        },
        group: {
          field: 'SortOrder',

          aggregates: [
            { field: 'PlanId', aggregate: 'sum' },
            { field: 'Plan', aggregate: 'sum' },
            { field: 'PlanGroupNumber', aggregate: 'sum' },
            { field: 'FeeSchedule', aggregate: 'sum' },
            { field: 'Patients', aggregate: 'sum' },
            { field: 'Claims', aggregate: 'sum' },
          ],
        },
        sort: {
          field: 'Plan',
          dir: 'asc',
        },
      }),
      autoBind: false,
      sortable: {
        mode: 'single',
        allowUnsort: true,
      },
      pageable: false,
      dataBound: function (e) {
        ctrl.updatePlanGridDataSource(e);
      },
      columns: [
        {
          field: 'PlanID',
          groupable: true,
          hidden: true,
        },
        {
          field: 'Plan',
          title: localize.getLocalizedString('Plan'),
          template: kendo.template(
            '<button class="btn btn-link" ng-click="benefitPlanItemClicked(this)" check-auth-z="soar-ins-ifsch-view" >#:Plan#</button>'
          ),
          width: '100px',
        },
        {
          field: 'PlanGroupNumber',
          title: localize.getLocalizedString('Plan/Group Number'),
          width: '100px',
        },
        {
          field: 'FeeSchedule',
          title: localize.getLocalizedString('Fee Schedule'),
          width: '100px',
        },
        {
          field: 'Patients',
          title: localize.getLocalizedString('Patients'),
          width: '50px',
        },
        {
          field: 'Claims',
          title: 'Claims (Past Year)',
          width: '100px',
        },
      ],
    };
  },
]);
