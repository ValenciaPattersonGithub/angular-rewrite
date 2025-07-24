(function () {
  'use strict';

  angular
    .module('common.controllers')
    .controller('TreatmentSelectorController', TreatmentSelectorController);

  TreatmentSelectorController.$inject = [
    'PatientServices',
    'PatientAppointmentsFactory',
    '$scope',
    '$rootScope',
    'localize',
    '$timeout',
    '$filter',
    '$location',
    'TreatmentPlansFactory',
    'TreatmentPlansApiFactory',
    'ListHelper',
    'toastrFactory',
    'UsersFactory',
    'FinancialService',
    '$q',
    'PatientValidationFactory',
    'locationService',
    'TimeZones',
    'PersonFactory',
    'referenceDataService',
    'ScheduleDisplayPlannedServicesService',
    'ModalFactory',
  ];

  function TreatmentSelectorController(
    patientServices,
    patientAppointmentsFactory,
    $scope,
    $rootScope,
    localize,
    $timeout,
    $filter,
    $location,
    treatmentPlansFactory,
    treatmentPlansApiFactory,
    listHelper,
    toastrFactory,
    usersFactory,
    financialService,
    $q,
    patientValidationFactory,
    locationService,
    timeZones,
    personFactory,
    referenceDataService,
    scheduleDisplayPlannedServicesService,
    modalFactory
  ) {
    BaseCtrl.call(this, $scope, 'TreatmentSelectorController');

    var ctrl = this;
    $scope.quickAddDisabled = false;
    $scope.txPlansServiceData = [];
    ctrl.treatmentPlanServices = [];
    $scope.checkedRows = [];
    $scope.checkedServices = [];
    $scope.displayMessage =
      $scope.serviceFilter == 'appointment' ? 'Appointment' : 'Encounter';
    $scope.firstLoad = true;
    $scope.checkboxSelected = false;
    $scope.treatmentPlansLoaded = false;
    $scope.allowInactive = false;
    ctrl.location = JSON.parse(sessionStorage.getItem('userLocation'));
    $scope.timeZones = angular.copy(timeZones);
    if (!$scope.loadingCheck) {
      $scope.loadingCheck = { loading: false };
    }
    ctrl.check = 0;
    $scope.currentLocation = locationService.getCurrentLocation();
    $scope.patientInfo = patientValidationFactory.GetPatientData();
    $scope.patientLocationMatch = false;

    //Initialize Page
    ctrl.$onInit = function () {
      $scope.getProviders();
      $scope.initializeServiceCodes();
      if (!$scope.flyout && $scope.serviceFilter == 'appointment') {
        $scope.loadingCheck.loading = true;
        ctrl.getTreatmentPlans();
      }
    };

    function onReferenceDataServiceLocationChanged() {
      $scope.initializeServiceCodes();
    }

    ctrl.referenceDataServiceLocationChangedReference = referenceDataService.registerForLocationSpecificDataChanged(
      onReferenceDataServiceLocationChanged
    );

    //Watches - Broadcasts
    $scope.$on('openTreatmentPlanFlyout', function () {
      ctrl.unselectAllServices();
      if ($scope.firstLoad) {
        $scope.firstLoad = false;
        $scope.loadingCheck.loading = true;
        $q.when()
          .then(function () {
            return ctrl.getTreatmentPlans();
          })
          .then(function () {
            if ($scope.treatmentPlanCount > 0) {
              $scope.initializeServiceCodes();
              $scope.getProviders();
            } else {
              $scope.showFilters();
              if (
                $scope.serviceFilter == 'encounter' ||
                $scope.serviceFilter == 'encounter-refactored'
              ) {
                // get the max InsuranceOrder based on serviceTransactions already on the encounter
                ctrl.getLastInsuranceOrderOnServicesAdded();
              }
              if ($scope.serviceFilter == 'appointment') {
                // get the max InsuranceOrder based on serviceTransactions already on the appointment
                ctrl.getLastInsuranceOrderOnServicesAdded();
                // mark services already on plan
                ctrl.processServicesForAppointment();
              }
              $scope.loadingCheck.loading = false;
            }
          });
      } else {
        if (
          $scope.serviceFilter == 'encounter' ||
          $scope.serviceFilter == 'encounter-refactored'
        ) {
          // get the max InsuranceOrder based on serviceTransactions already on the encounter
          ctrl.getLastInsuranceOrderOnServicesAdded();
          ctrl.processServicesForEncounter();
          // reset $$disableQuickAdd on treatment plans when already loaded
          ctrl.setQuickAddDisabledOnPlans($scope.treatmentPlans);
        }
        if ($scope.serviceFilter == 'appointment') {
          // get the max InsuranceOrder based on serviceTransactions already on the appointment
          ctrl.getLastInsuranceOrderOnServicesAdded();
          // mark services already on plan
          ctrl.processServicesForAppointment();
        }
        $scope.showFilters();
      }
      // reset directive properties
      $scope.quickAddDisabled = false;
      $scope.checkedRows = [];
      $scope.allowInactive = false;
    });
    $scope.$on('TreatmentPlansUpdated', function () {
      //this should only be hit on a running appointment
      ctrl.getTreatmentPlans();
    });
    $scope.$on('closeFlyouts', function () {
      $scope.hideFilters();
    });
    $scope.$on('recalculationCompleted', function () {
      if (
        $('#treatmentKendoGrid').data('kendoGrid') &&
        $scope.NewtxPlansServiceData
      ) {
        $('#treatmentKendoGrid')
          .data('kendoGrid')
          .dataSource.data(
            $scope.NewtxPlansServiceData.filter(ctrl.showCorrectDataImbedded)
          );
        $scope.checkedRows = [];
      }
    });

    // pbi 175474 changes should make this method obsolete
    // in cases where this is still used to load treatment plans do not process until all services are loaded

    $scope.$on('serviceHeadersUpdated', function () {
      var treatmentPlans = treatmentPlansFactory.ExistingTreatmentPlans;
      var servicesAreLoaded = true;
      _.forEach(treatmentPlans, function (tp) {
        if (tp.TreatmentPlanServices.length === 0) {
          servicesAreLoaded = false;
        }
      });
      if (servicesAreLoaded) {
        ctrl.loadTreatmentPlanServiceData(treatmentPlans);
      }
    });

    // only re-get treatment plans if the PatientId changes
    $scope.$watch(
      'patient.PatientId',
      function (nv, ov) {
        if (nv && nv !== ov) {
          ctrl.getTreatmentPlans();
        }
      },
      true
    );

    //Load Data
    $scope.getProviders = function () {
      $scope.providerList = referenceDataService.get(
        referenceDataService.entityNames.users
      );
      $scope.loaded(true);
    };
    $scope.initializeServiceCodes = function () {
      $scope.serviceCodestx = referenceDataService.get(
        referenceDataService.entityNames.serviceCodes
      );
      $scope.backupServiceCodestx = referenceDataService.get(
        referenceDataService.entityNames.serviceCodes
      );
      $scope.loaded(true);
    };

    $scope.loaded = function (check) {
      if ($scope.loadingCheck && $scope.loadingCheck.loading) {
        if (check) ctrl.check++;
        if (ctrl.check >= 2 && $scope.treatmentPlansLoaded) {
          $scope.loadingCheck.loading = false;
          ctrl.check = 0;
          $scope.showFilters();
        }
      }
    };

    //Functionality
    $scope.showFilters = function () {
      if (
        $scope.serviceFilter == 'encounter' ||
        $scope.serviceFilter == 'encounter-refactored'
      ) {
        angular.element('.slidePanelLeft').addClass('open');
      }
      if ($scope.serviceFilter == 'appointment') {
        angular.element('.treatmentSelectorAppointment').addClass('open');
      }
    };
    $scope.hideFilters = function () {
      $scope.unselectAllCheckboxes();
      if (
        $scope.serviceFilter == 'encounter' ||
        $scope.serviceFilter == 'encounter-refactored'
      ) {
        angular.element('.slidePanelLeft').removeClass('open');
      }
      if ($scope.serviceFilter == 'appointment') {
        angular.element('.treatmentSelectorAppointment').removeClass('open');
      }
    };
    $scope.changeUpperCheckbox = function (row) {
      var target = row;
      target
        .prevAll('tr:has(input.stage):first')
        .find('input')
        .prop('checked', false);
      target
        .prevAll('tr:has(input.txplan):first')
        .find('input')
        .prop('checked', false);
    }; //takes in a service row to change the stage and plan to not checked
    $scope.selectThisService = function (data, addSelected) {
      var row = $('#treatmentKendoGrid').find(
        "tr[data-uid='" + data.uid + "']"
      );
      if (row) {
        if (addSelected) {
          row.find('#serviceCheckBox').prop('checked', true);
        }
        if (
          row.find('#serviceCheckBox')[0] != undefined &&
          row.find('#serviceCheckBox')[0].checked
        ) {
          if ($scope.checkedRows.indexOf(data.uid) < 0) {
            // checkbox is unchecked ->ServiceTransaction.ServiceTransactionStatusId  to 3(Rejected)
            if (
              data.ServiceTransaction.ServiceTransactionStatusId === 3 ||
              data.ServiceTransaction.ServiceTransactionStatusId === 2 ||
              data.ServiceTransaction.ServiceTransactionStatusId === 8
            ) {
              row.find('#serviceCheckBox').prop('checked', false);
            }

            if (
              data.ServiceTransaction.ServiceTransactionStatusId !== 3 &&
              data.ServiceTransaction.ServiceTransactionStatusId !== 2 &&
              data.ServiceTransaction.ServiceTransactionStatusId !== 8
            ) {
              $scope.checkedRows.push(data.uid);
            }
          }
        } else if ($scope.checkedRows.indexOf(data.uid) >= 0) {
          $scope.checkedRows.splice($scope.checkedRows.indexOf(data.uid), 1);
          $scope.changeUpperCheckbox(row);
        }
      }
      if (addSelected) {
        $scope.onSelectedCodes();
      }
    };
    //selects target service, also unselects stage/txplan on unselect
    $scope.selectThisStage = function (data, addSelected, setTo) {
      var toSet;
      var i = 0;
      if (addSelected) {
        toSet = true;
      } else {
        if (setTo != undefined) {
          toSet = setTo;
        } else {
          toSet = false;
          for (i = 0; i < data.items.length; i++) {
            if (
              !$('#treatmentKendoGrid')
                .find("tr[data-uid='" + data.items[i].uid + "']")
                .find('#serviceCheckBox')[0].checked
            ) {
              if (data.items[i].ServiceTransaction !== undefined) {
                if (
                  data.items[i].ServiceTransaction
                    .ServiceTransactionStatusId !== 3 ||
                  data.items[i].ServiceTransaction
                    .ServiceTransactionStatusId !== 2 ||
                  data.items[i].ServiceTransaction
                    .ServiceTransactionStatusId !== 8
                ) {
                  toSet = true;
                  break;
                }
              }
            }
          }
        }
      }
      for (i = 0; i < data.items.length; i++) {
        if ($scope.checkedRows.indexOf(data.items[i].uid) < 0 == toSet) {
          // if this is for an appointment we can't select items that are already associated with an appointment
          if (
            $scope.serviceFilter == 'appointment' &&
            $scope.flyout &&
            data.items[i].ServiceTransaction.AppointmentId !== null
          ) {
            // don't add this to the items
          } else {
            $('#treatmentKendoGrid')
              .find("tr[data-uid='" + data.items[i].uid + "']")
              .find('#serviceCheckBox')
              .prop('checked', toSet);
            $scope.selectThisService(data.items[i], false);
          }
        }
      }
      if (addSelected) {
        $scope.onSelectedCodes();
      } else {
        return toSet;
      }
    };

    //selects target stage as well as all services under it, if one is unselected, it will make all selected
    $scope.selectThisTxPlan = function (data, addSelected) {
      var toSet = false;
      var i = 0;
      for (i = 0; i < data.items.length; i++) {
        for (var j = 0; j < data.items[i].items.length; j++) {
          if (
            !$('#treatmentKendoGrid')
              .find("tr[data-uid='" + data.items[i].items[j].uid + "']")
              .find('#serviceCheckBox')[0].checked
          ) {
            if (data.items[i].items[j].ServiceTransaction !== undefined) {
              if (
                data.items[i].items[j].ServiceTransaction
                  .ServiceTransactionStatusId !== 3 ||
                data.items[i].items[j].ServiceTransaction
                  .ServiceTransactionStatusId !== 2 ||
                data.items[i].items[j].ServiceTransaction
                  .ServiceTransactionStatusId !== 8
              ) {
                toSet = true;
                break;
              }
            }
          }
        }
      }
      for (i = 0; i < data.items.length; i++) {
        var state = $scope.selectThisStage(data.items[i], false, toSet);
        $('input[txplan="' + data.value + '"]')
          .closest('tr')
          .nextAll('tr:has(input.stage#stage' + data.items[i].value + '):first')
          .find('input')
          .prop('checked', state);
      }
      if (addSelected) {
        $scope.onSelectedCodes();
      }
    };

    //selects target tx plan and everything under it. If anything is unselected, it selects all
    $scope.unselectAllCheckboxes = function () {
      if ($('#treatmentKendoGrid').data('kendoGrid')) {
        var services = $('#treatmentKendoGrid')
          .data('kendoGrid')
          .dataSource.data();
        for (var i = 0; i < services.length; i++) {
          var row = $('#treatmentKendoGrid').find(
            "tr[data-uid='" + services[i].uid + "']"
          );
          row.find('#serviceCheckBox').prop('checked', false);
          $scope.selectThisService(services[i], false);
        }
      }
    };
    $scope.disableQuickAdd = function () {
      return $scope.checkedRows.length > 0;
    };

    $scope.onSelectedCodes = function () {
      if ($scope.serviceFilter == 'appointment' && $scope.flyout === true) {
        ctrl.getSelectedServiceTransactions();
      } else if (
        $scope.serviceFilter === 'encounter-refactored' &&
        $scope.flyout === true
      ) {
        ctrl.getSelectedServiceTransactions();
      } else {
        ctrl.updateCheckedRowsServices();
        ctrl.getSelectedServiceTransactions();
      }
    };
    ctrl.getSelectedServiceCodes = function () {
      var serviceCodeList = [];

      _.forEach($scope.checkedServices, function (service) {
        var serviceCode = _.find($scope.serviceCodestx, {
          ServiceCodeId: service.ServiceCodeId,
        });

        if (!_.isEmpty(serviceCode)) {
          serviceCodeList.push(_.cloneDeep(serviceCode));
        }
      });

      return serviceCodeList;
    };

    //filters
    ctrl.showCorrectDataImbedded = function (service) {
      if (service.ServiceTransaction.DateCompleted == null) {
        if ($scope.serviceFilter == 'appointment') {
          if (service.ServiceTransaction.ServiceTransactionStatusId == 4) {
            return false;
          } else {
            return true;
          }
        } else if (
          $scope.serviceFilter == 'encounter' ||
          $scope.serviceFilter == 'encounter-refactored'
        ) {
          if (service.ServiceTransaction.ServiceTransactionStatusId == 4) {
            return false;
          } else {
            return true;
          }
        } else {
          return true;
        }
      } else {
        return false;
      }
    };

    // This code only called if this is an encounter (uses Kendo grid) to set $$Selected on the ServiceTransaction
    ctrl.updateCheckedRowsServices = function () {
      $scope.checkedServices = [];
      _.forEach($scope.checkedRows, function (service) {
        var found = null;
        // get the uid of the selected row
        found = listHelper
          .findItemByFieldValue(
            $('#treatmentKendoGrid').data('kendoGrid').dataSource.data(),
            'uid',
            service
          )
          .toJSON();
        if (found) {
          // get the matching treatmentPlanService.ServiceTransaction and mark as selected
          var selectedTreatmentPlanService = _.find(
            ctrl.treatmentPlanServices,
            function (treatmentPlanService) {
              return (
                treatmentPlanService.TreatmentPlanServiceHeader
                  .TreatmentPlanServiceId ===
                found.TreatmentPlanServiceHeader.TreatmentPlanServiceId
              );
            }
          );
          if (!_.isNil(selectedTreatmentPlanService)) {
            selectedTreatmentPlanService.ServiceTransaction.$$Selected = true;
          }
        }
      });
    };

    ctrl.showCorrectData = function (service) {
      //do not use anything else off active appointment. The appointment modal passes in the location to get the location id
      //there are some things that are not shared betweent he two, so it will break if you use any other varibles off it
      //only used for LocationId variable
      if (
        $scope.chosenLocation &&
        $scope.chosenLocation.LocationId !=
          service.ServiceTransaction.LocationId
      ) {
        return false;
      }
      if (service.DateCompleted == null) {
        if ($scope.serviceFilter == 'appointment') {
          if (service.AppointmentId != null) {
            return false;
          } else {
            return true;
          }
        } else if (
          $scope.serviceFilter == 'encounter' ||
          $scope.serviceFilter == 'encounter-refactored'
        ) {
          if (service.EncounterId != null) {
            return false;
          } else {
            return true;
          }
        } else {
          return true;
        }
      } else {
        return false;
      }
    };

    $scope.isDisabled = function (serv) {
      // if no chosesLocation disable stage checkbox
      if ($scope.chosenLocation == null) {
        return true;
      }
      if (serv.items && serv.items[0].items) {
        // if this stage contains services with an appointment id disable stage checkbox
        _.forEach(serv.items[0].items, function (tps) {
          if (tps.ServiceTransaction.AppointmentId != null) {
            return true;
          }
        });

        // Check to see if the service being added has already been added to this encounter
        if (
          ctrl.checkForDuplicates(
            serv.items[0].items[0].ServiceTransaction.ServiceTransactionId
          )
        ) {
          return true;
        }

        return (
          serv.items[0].items[0].ServiceTransaction.LocationId !=
            $scope.chosenLocation.LocationId ||
          serv.items[0].items[0].ServiceTransaction.AppointmentId != null
        );
      } else if (serv.items) {
        // Check to see if the service being added has already been added to this encounter
        if (
          ctrl.checkForDuplicates(
            serv.items[0].ServiceTransaction.ServiceTransactionId
          )
        ) {
          return true;
        }

        // if chosesLocation doesn't match service location disable stage checkbox
        return (
          serv.items[0].ServiceTransaction.LocationId !=
            $scope.chosenLocation.LocationId ||
          serv.items[0].ServiceTransaction.AppointmentId != null
        );
      } else {
        // Check to see if the service being added has already been added to this encounter
        if (
          ctrl.checkForDuplicates(serv.ServiceTransaction.ServiceTransactionId)
        ) {
          return true;
        }

        // if chosesLocation doesn't match service location or service has an appointmentId  disable stage checkbox
        return (
          serv.ServiceTransaction.LocationId !=
            $scope.chosenLocation.LocationId ||
          serv.ServiceTransaction.AppointmentId != null
        );
      }
    };

    $scope.isDisabledRejected = function (serv) {
      if ($scope.chosenLocation == null) {
        return true;
      }
      if (serv.items && serv.items[0].items) {
        // Check to see if the service being added has already been added to this encounter
        if (
          ctrl.checkForDuplicates(
            serv.items[0].items[0].ServiceTransaction.ServiceTransactionId
          )
        ) {
          return true;
        }

        return (
          serv.items[0].items[0].ServiceTransaction.LocationId !=
            $scope.chosenLocation.LocationId ||
          serv.items[0].items[0].ServiceTransaction
            .ServiceTransactionStatusId == 8 ||
          serv.items[0].items[0].ServiceTransaction.AppointmentId != null ||
          serv.items[0].items[0].ServiceTransaction
            .ServiceTransactionStatusId == 3 ||
          serv.items[0].items[0].ServiceTransaction
            .ServiceTransactionStatusId == 2
        );
      } else if (serv.items) {
        // Check to see if the service being added has already been added to this encounter
        if (
          ctrl.checkForDuplicates(
            serv.items[0].ServiceTransaction.ServiceTransactionId
          )
        ) {
          return true;
        }

        return (
          serv.items[0].ServiceTransaction.LocationId !=
            $scope.chosenLocation.LocationId ||
          serv.items[0].ServiceTransaction.ServiceTransactionStatusId == 8 ||
          serv.items[0].ServiceTransaction.ServiceTransactionStatusId == 3 ||
          serv.items[0].ServiceTransaction.ServiceTransactionStatusId == 2
        );
      } else {
        // Check to see if the service being added has already been added to this encounter
        if (
          ctrl.checkForDuplicates(serv.ServiceTransaction.ServiceTransactionId)
        ) {
          return true;
        }

        return (
          serv.ServiceTransaction.LocationId !=
            $scope.chosenLocation.LocationId ||
          serv.ServiceTransaction.AppointmentId != null ||
          serv.ServiceTransaction.ServiceTransactionStatusId == 8 ||
          serv.ServiceTransaction.ServiceTransactionStatusId == 3 ||
          serv.ServiceTransaction.ServiceTransactionStatusId == 2
        );
      }
    };

    ctrl.checkForDuplicates = function (serviceTransactionId) {
      return _.some($scope.servicesAdded, function (service) {
        return service.ServiceTransactionId === serviceTransactionId;
      });
    };

    ctrl.codeWidth = 0;
    ctrl.descWidth = 0;
    ctrl.toothWidth = 0;
    ctrl.areaWidth = 0;
    ctrl.provWidth = 0;
    ctrl.feeWidth = 0;
    ctrl.insWidth = 0;
    ctrl.serviceCodeTemplate = '';
    ctrl.serviceCodeHeader = '';
    $scope.setGridSizes = function () {
      // if serviceFilter is appointment we no longer use kendo grid - this was modified to use fusegrid

      if (
        $scope.flyout &&
        ($scope.serviceFilter == 'encounter' ||
          $scope.serviceFilter == 'encounter-refactored')
      ) {
        ctrl.codeWidth = 190;
        ctrl.cdtWidth = 90;
        ctrl.descWidth = 290;
        ctrl.toothWidth = 90;
        ctrl.areaWidth = 90;
        ctrl.provWidth = 145;
        ctrl.feeWidth = 90;
        ctrl.insWidth = 90;
        ctrl.serviceCodeHeader =
          "<div class='col-xs-5' style='margin-top:13px'></div><span>Service Code</span>";
        ctrl.serviceCodeTemplate =
          "<button class='btn btn-link ng-binding col-xs-4' ng-disabled='disableQuickAdd() || isDisabledRejected(dataItem)' ng-click='$parent.selectThisService(dataItem, true)'>+ quick add </button>" +
          "<input type='checkbox' id='serviceCheckBox' ng-disabled='isDisabledRejected(dataItem)' class='service col-xs-2' ng-click='$parent.selectThisService(dataItem, false)'></input>" +
          '<i ng-if="!dataItem.ServiceTransaction.serviceIsActive" class="fa fa-exclamation-triangle inactive-service-warning  col-xs-1" popover-trigger="' +
          "'" +
          'mouseenter' +
          "'" +
          '"' +
          'popover-placement="auto bottom" popover-append-to-body="false"' +
          'uib-popover="Inactive as of {{dataItem.ServiceTransaction.serviceInactivationDate|date:\'MM/dd/yyyy\'}}"></i>' +
          "<i class='far fa-calendar-check scheduledicon col-xs-offset-1 col-xs-1' uib-tooltip-template=" +
          '"' +
          "'txScheduleTooltip.html'" +
          '"' +
          " ng-if='dataItem.ServiceTransaction.AppointmentId'></i>" +
          "<span class='col-xs-1' ng-class='{" +
          '"' +
          'col-xs-offset-1' +
          '"' +
          ": !dataItem.ServiceTransaction.AppointmentId && dataItem.ServiceTransaction.serviceIsActive}'>#:ServiceTransaction.showCode#</span>";
      }
      if (!$scope.flyout) {
        ctrl.codeWidth = 200;
        ctrl.descWidth = 220;
        ctrl.toothWidth = 60;
        ctrl.areaWidth = 60;
        ctrl.provWidth = 105;
        ctrl.feeWidth = 70;
        ctrl.insWidth = 70;
        ctrl.serviceCodeHeader =
          "<div class='col-xs-4' style='margin-top:13px'></div><span>Service Code</span>";
        ctrl.serviceCodeTemplate =
          "<button class='btn btn-link ng-binding col-xs-4' ng-disabled='disableQuickAdd() || isDisabledRejected(dataItem)' ng-click='$parent.selectThisService(dataItem, true)'>+ quick add </button>" +
          "<input type='checkbox' id='serviceCheckBox' ng-disabled='isDisabledRejected(dataItem)' class='service col-xs-2' ng-click='$parent.selectThisService(dataItem, false)'></input>" +
          '<i ng-if="!dataItem.serviceIsActive" class="fa fa-exclamation-triangle inactive-service-warning" popover-trigger="' +
          "'" +
          'mouseenter' +
          "'" +
          '"' +
          'popover-placement="auto bottom" popover-append-to-body="false" ' +
          'uib-popover="Inactive as of {{dataItem.serviceInactivationDate|date:\'MM/dd/yyyy\'}}"></i>' +
          "<i class='far fa-calendar-check scheduledicon col-xs-offset-1 col-xs-1' uib-tooltip-template=" +
          '"' +
          "'txScheduleTooltip.html'" +
          '"' +
          " ng-if='dataItem.ServiceTransaction.AppointmentId'></i>" +
          "<span class='col-xs-3' ng-class='{" +
          '"' +
          'col-xs-offset-2' +
          '"' +
          ": !dataItem.ServiceTransaction.AppointmentId}'>#:ServiceTransaction.showCode#</span>";
      }
    };
    $scope.setGridSizes();
    //Kendo Grids
    $scope.createTxNames = function () {
      $scope.treatmentPlanReference = [];
      _.forEach(ctrl.treatmentPlanServices, function (serv) {
        var found = listHelper.findItemByFieldValue(
          $scope.treatmentPlanReference,
          'TreatmentPlanId',
          serv.TreatmentPlanServiceHeader.TreatmentPlanId
        );
        if (!found) {
          $scope.treatmentPlanReference.push({
            TreatmentPlanId: serv.TreatmentPlanServiceHeader.TreatmentPlanId,
            TreatmentPlanName:
              serv.TreatmentPlanServiceHeader.TreatmentPlanName,
            TreatmentPlanCreatedDate:
              serv.TreatmentPlanServiceHeader.TreatmentPlanCreatedDate,
          });
        }
      });
    };

    $scope.treatmentPlanReference = [];
    $scope.getTxName = function (txCreatedDate) {
      var found = listHelper.findItemByFieldValue(
        $scope.treatmentPlanReference,
        'TreatmentPlanCreatedDate',
        txCreatedDate
      );
      if (found) {
        return found.TreatmentPlanName;
      } else {
        return txCreatedDate;
      }
    };
    $scope.TxPlanServiceColumnsSmall = {
      columns: [
        {
          hidden: true,
          field: 'TreatmentPlanServiceHeader.TreatmentPlanId',
          title: 'TxPlanId',
          groupHeaderTemplate:
            "<button class='btn btn-link ng-binding' ng-disabled='disableQuickAdd() || isDisabled(dataItem)' ng-click='$parent.selectThisTxPlan(dataItem, true)'>+ quick add</button>" +
            "<input type='checkbox' txplan='#: value #' class='txplan' ng-disabled='isDisabled(dataItem)' ng-click='$parent.selectThisTxPlan(dataItem, false)'></input>" +
            "<span>{{getTxName('#:value#')}}</span>",
        },
        {
          hidden: true,
          field: 'TreatmentPlanServiceHeader.TreatmentPlanGroupNumber',
          title: 'Stage Number',
          groupHeaderTemplate:
            "<button class='btn btn-link ng-binding' ng-disabled='disableQuickAdd() || isDisabled(dataItem)' ng-click='$parent.selectThisStage(dataItem, true)'>+ quick add </button>" +
            "<input type='checkbox' id='stage#: value #' value='#: value #' class='stage' ng-disabled='isDisabled(dataItem)'ng-click='$parent.selectThisStage(dataItem, false)'></input>" +
            '<span>Stage #: value #</span>',
        },
        {
          field: 'ServiceTransaction.showCode',
          title: 'Service Code',
          template: ctrl.serviceCodeTemplate,
          headerTemplate: ctrl.serviceCodeHeader,
          width: ctrl.codeWidth,
        },
        {
          field: 'ServiceTransaction.showDisc',
          title: localize.getLocalizedString('Description'),
          template: '<span>#:ServiceTransaction.showDisc#</span>',
          width: ctrl.descWidth,
        },
        {
          field: 'ServiceTransaction.Tooth',
          title: localize.getLocalizedString('Tooth'),
          width: ctrl.toothWidth,
        },
        {
          field: 'ServiceTransaction.Surface',
          title: localize.getLocalizedString('Area'),
          width: ctrl.areaWidth,
          template:
            "<span ng-if='dataItem.ServiceTransaction.Roots != null'>{{dataItem.ServiceTransaction.Roots}}</span> <span ng-if='dataItem.ServiceTransaction.Surface != null'>{{dataItem.ServiceTransaction.Surface}}</span>",
        },
        {
          field: 'ServiceTransaction.providerName',
          title: localize.getLocalizedString('Provider'),
          width: ctrl.provWidth,
        },
        {
          field: 'ServiceTransaction.Fee',
          title: localize.getLocalizedString('Fee'),
          width: ctrl.feeWidth,
          format: '{0:c}',
          attributes: { style: 'text-align:right;' },
        },
        {
          field: 'ServiceTransaction.TotalEstInsurance',
          title: localize.getLocalizedString('Est. Ins.'),
          width: ctrl.insWidth,
          format: '{0:c}',
          template:
            '<span class="currency insest" ng-if="dataItem.ServiceTransaction.TotalEstInsurance != null">{{dataItem.ServiceTransaction.TotalEstInsurance | currency}}</span> <span class="currency insest" ng-if="dataItem.ServiceTransaction.TotalEstInsurance == null">{{0 | currency}}</span>',
          attributes: { style: 'text-align:right;' },
        },
        {
          field: 'ServiceTransaction.CreatedDate',
          title: localize.getLocalizedString('Date'),
          width: 150,
          hidden: true,
          format: '{0: MM-dd-yyyy}',
        },
      ],
    };

    // keep the checkedRows list updated on change
    $scope.checkRow = function (dataItem) {
      var itemIsInList = $scope.checkedRows.indexOf(dataItem.uid) >= 0;
      // if $$Selected is true and service is not in checkedRows add the service to the checkedRows
      if (
        dataItem.ServiceTransaction.$$Selected === true &&
        itemIsInList === false
      ) {
        $scope.checkedRows.push(dataItem.uid);
      } else if (
        dataItem.ServiceTransaction.$$Selected === false &&
        itemIsInList === true
      ) {
        $scope.checkedRows.splice($scope.checkedRows.indexOf(dataItem.uid), 1);
      }
    };

    $scope.TxPlanServiceColumns = {
      columns: [
        {
          hidden: true,
          field: 'TreatmentPlanServiceHeader.TreatmentPlanCreatedDate',
          title: 'TxPlanId',
          groupHeaderTemplate:
            "<button class='btn btn-link ng-binding' ng-disabled='disableQuickAdd() || isDisabled(dataItem)' ng-click='$parent.selectThisTxPlan(dataItem, true)'>+ quick add</button>" +
            "<input type='checkbox' txplan='#: value #' class='txplan' ng-disabled='isDisabled(dataItem)' ng-click='$parent.selectThisTxPlan(dataItem, false)'></input>" +
            "<span>{{getTxName('#:value#')}}</span>",
        },
        {
          hidden: true,
          field: 'TreatmentPlanServiceHeader.TreatmentPlanGroupNumber',
          title: 'Stage Number',
          groupHeaderTemplate:
            "<button class='btn btn-link ng-binding' ng-disabled='disableQuickAdd() || isDisabled(dataItem)' ng-click='$parent.selectThisStage(dataItem, true)'>+ quick add </button>" +
            "<input type='checkbox' id='stage#: value #' value='#: value #' class='stage' ng-disabled='isDisabled(dataItem)'ng-click='$parent.selectThisStage(dataItem, false)'></input>" +
            '<span>Stage #: value #</span>',
        },
        // {template: '<button class="btn btn-link ng-binding " style="width:50px" ng-disabled="disableQuickAdd() || isDisabled(dataItem)" ng-click="selectThisService(dataItem, true)">+ quick add </button>'},
        // {template: '<input type="checkbox" class="" style="width:50px" ng-model="dataItem.ServiceTransaction.$$Selected" id="serviceCheckBox1" ng-disabled="isDisabled(dataItem)" ng-change="checkRow(dataItem)" ></input>'},
        {
          field: 'ServiceTransaction.showCode',
          title: 'Service Code',
          template: ctrl.serviceCodeTemplate,
          headerTemplate: ctrl.serviceCodeHeader,
          width: ctrl.codeWidth,
        },
        {
          field: 'ServiceTransaction.ShowCdtCode',
          title: 'CDT Code',
          template: '<span>#:ServiceTransaction.ShowCdtCode#</span>',
          width: ctrl.cdtWidth,
        },
        {
          field: 'ServiceTransaction.showDisc',
          title: localize.getLocalizedString('Description'),
          template: '<span>#:ServiceTransaction.showDisc#</span>',
          width: ctrl.descWidth,
        },
        {
          field: 'ServiceTransaction.Tooth',
          title: localize.getLocalizedString('Tooth'),
          width: ctrl.toothWidth,
        },
        {
          field: 'ServiceTransaction.Surface',
          title: localize.getLocalizedString('Area'),
          width: ctrl.areaWidth,
          template:
            "<span ng-if='dataItem.ServiceTransaction.Roots != null'>{{dataItem.ServiceTransaction.Roots}}</span> <span ng-if='dataItem.ServiceTransaction.Surface != null'>{{dataItem.ServiceTransaction.Surface}}</span>",
        },
        {
          field: 'ServiceTransaction.providerName',
          title: localize.getLocalizedString('Provider'),
          width: ctrl.provWidth,
        },
        {
          field: 'ServiceTransaction.Fee',
          title: localize.getLocalizedString('Fee'),
          width: ctrl.feeWidth,
          format: '{0:c}',
          attributes: { style: 'text-align:right;' },
        },
        {
          field: 'ServiceTransaction.TotalEstInsurance',
          title: localize.getLocalizedString('Est. Ins.'),
          width: ctrl.insWidth,
          format: '{0:c}',
          template:
            '<span class="currency insest" ng-if="dataItem.ServiceTransaction.TotalEstInsurance != null">{{dataItem.ServiceTransaction.TotalEstInsurance | currency}}</span> <span class="currency insest" ng-if="dataItem.ServiceTransaction.TotalEstInsurance == null">{{0 | currency}}</span>',
          attributes: { style: 'text-align:right;' },
        },
        {
          field: 'ServiceTransaction.CreatedDate',
          title: localize.getLocalizedString('Date'),
          width: 150,
          hidden: true,
          format: '{0: MM-dd-yyyy}',
        },
      ],
    };

    $scope.TxPlanDataSource = new kendo.data.DataSource({
      data: ctrl.treatmentPlanServices.filter(ctrl.showCorrectDataImbedded),
      schema: {
        model: {
          fields: {
            TreatmentPlanCreatedDate: { type: 'date' },
            TreatmentPlanId: { type: 'string' },
            TreatmentPlanName: { type: 'string' },
            TreatmentPlanGroupNumber: { type: 'string' },
            TreatmentPlanServiceId: { type: 'string' },
            ServiceTransactionId: { type: 'string' },
            ServiceCodeId: { type: 'string' },
            ServiceTransactionStatusId: { type: 'string' },
            Tax: { type: 'string' },
            ServiceCode: { type: 'string' },
            Description: { type: 'string' },
            Tooth: { type: 'string' },
            LocationId: { type: 'string' },
            AffectedAreaId: { type: 'string' },
            Surface: { type: 'string' },
            ProviderName: { type: 'string' },
            Fee: { type: 'number' },
            TotalEstInsurance: { type: 'string' },
            CreatedDate: { type: 'date' },
          },
        },
      },
      group: [
        {
          field: 'TreatmentPlanServiceHeader.TreatmentPlanCreatedDate',
          dir: 'desc',
        },
        {
          field: 'TreatmentPlanServiceHeader.TreatmentPlanGroupNumber',
          dir: 'asc',
        },
      ],
      filter: [{ field: 'ServiceTransaction.serviceIsActive', value: true }],
    });

    ctrl.getTreatmentPlans = function () {
      treatmentPlansApiFactory
        .getTreatmentPlansWithSevices($scope.patient.PatientId)
        .then(function (resp) {
          // bug 461605, until we refactor the api, we're going to filter out treatmentPlans with a Completed status
          // because those can't be added to appointment or encounters
          var treatmentPlans = _.filter(resp, function (treatmentPlan) {
            return treatmentPlan.TreatmentPlanHeader.Status !== 'Completed';
          });
          $scope.treatmentPlans = treatmentPlans;
          // set Priority
          ctrl.setPriorityOnPlans(treatmentPlans);
          // not a big enough perf improvement to update right now but the count should not be on scope ...
          // look at putting as a prop of the factory, populated when treatmentplans are retrieved.
          $scope.treatmentPlanCount = treatmentPlans.length;
          if (!_.isEmpty(treatmentPlans)) {
            ctrl.getTreatmentPlanServices(
              $scope.patient.PatientId,
              treatmentPlans
            );
          }
        });
    };

    // get all of the treatment plans before loading services to grid
    ctrl.getTreatmentPlanServices = function (personId, treatmentPlans) {
      ctrl.loadTreatmentPlanServiceData(treatmentPlans);
      ctrl.setQuickAddDisabledOnPlans(treatmentPlans);

      $scope.checkPatientLocation();
    };
    $scope.appointmentServiceInfo = [];
    ctrl.servicesToUpdate = [];
    // load treatment plan grid datasource
    ctrl.loadTreatmentPlanServiceData = function (treatmentPlans) {
      $scope.treatmentPlansLoaded = true;
      $scope.loaded(false);
      $scope.treatmentPlanCount = treatmentPlans.length;
      var services = [];
      var planNames = [];
      var servicesForEstimate = [];
      // would want to create a map for this at some point but the main performance issue on the page is addressed so not needed right now.]
      _.forEach(treatmentPlans, function (tp) {
        tp.$$Collapsed = false;
        planNames.push({
          id: tp.TreatmentPlanHeader.TreatmentPlanId,
          name: tp.TreatmentPlanHeader.TreatmentPlanName,
        });
        _.forEach(tp.TreatmentPlanServices, function (tps) {
          // create dynamic sorting for stage column
          tps.$$stage = (
            '00000' + tps.TreatmentPlanServiceHeader.TreatmentPlanGroupNumber
          ).slice(-6);
          var tempcode = $filter('filter')($scope.serviceCodestx, {
            ServiceCodeId: tps.ServiceTransaction.ServiceCodeId,
          });
          if (tempcode && tempcode[0]) {
            tempcode = tempcode[0];
          }
          if (tempcode) {
            tps.ServiceTransaction.$$Selected = false;
            tps.ServiceTransaction.showCode = tempcode.Code;
            tps.ServiceTransaction.CdtCode = tempcode.CdtCodeName;
            tps.ServiceTransaction.ShowCdtCode = tempcode.CdtCodeName
              ? tempcode.CdtCodeName
              : '';
            tps.ServiceTransaction.showDisc = tempcode.Description;
            tps.ServiceTransaction.serviceIsActive = tps.ServiceTransaction.IsActive =
              tempcode.IsActive;
            tps.ServiceTransaction.serviceInactivationDate = tps.ServiceTransaction.InactivationDate = tempcode.InactivationDate
              ? new Date(
                  tempcode.InactivationDate +
                    (tempcode.InactivationDate.toLowerCase().endsWith('z')
                      ? ''
                      : 'Z')
                )
              : null;

            tps.ServiceTransaction.$$RootOrSurface = _.isNil(
              tps.ServiceTransaction.Roots
            )
              ? scheduleDisplayPlannedServicesService.getSurfacesInSummaryFormat(
                  tps.ServiceTransaction.Surface
                )
              : tps.ServiceTransaction.Roots;

            tps.ServiceTransaction.serviceInactivationMessage = localize.getLocalizedString(
              'Inactive as of {0}',
              [
                $filter('toShortDisplayDateUtc')(
                  tps.ServiceTransaction.serviceInactivationDate
                ),
              ]
            );

            var found = listHelper.findItemByFieldValue(
              $scope.providerList,
              'UserId',
              tps.ServiceTransaction.ProviderUserId
            );
            if (found)
              tps.ServiceTransaction.providerName =
                found.FirstName + ' ' + found.LastName;
            else tps.ServiceTransaction.providerName = '';
            tps.TreatmentPlanServiceHeader.TreatmentPlanName =
              tp.TreatmentPlanHeader.TreatmentPlanName;

            tps.TreatmentPlanServiceHeader.TreatmentPlanCreatedDate =
              tp.TreatmentPlanHeader.CreatedDate;
            if (
              tps.ServiceTransaction.AppointmentId &&
              tps.ServiceTransaction.ServiceTransactionStatusId != 4
            ) {
              var deferred = $q.defer();
              deferred.resolve(
                patientAppointmentsFactory.AppointmentDataWithoutDetails(
                  tps.ServiceTransaction.AppointmentId
                )
              );
              $scope.appointmentServiceInfo.push(deferred.promise);
              ctrl.servicesToUpdate.push(tps);
            }
            services.push(tps);
            // if called from appointment we are not displaying insurance est so don't make call to get
            if ($scope.serviceFilter !== 'appointment') {
              tps.ServiceTransaction.InsuranceEstimates = financialService.CreateOrCloneInsuranceEstimateObject(
                tps.ServiceTransaction
              );
              servicesForEstimate.push(tps.ServiceTransaction);
            }
          }
        });
      });
      $scope.usableData = [];
      if ($scope.appointmentServiceInfo.length > 0) {
        $q.all($scope.appointmentServiceInfo).then(
          ctrl.updateServicesWithAppInfo
        );
      }

      if (
        $scope.serviceFilter !== 'appointment' &&
        servicesForEstimate.length > 0
      ) {
        financialService.RecalculateInsuranceWithCascadingEstimates(
          servicesForEstimate
        );
      }
      // Sorting default to Priority, then DateModified
      ctrl.treatmentPlanServices = $filter('orderBy')(
        services,
        [
          'TreatmentPlanServiceHeader.TreatmentPlanGroupNumber',
          'TreatmentPlanServiceHeader.Priority',
          'TreatmentPlanServiceHeader.DateModified',
        ],
        false
      );
      $scope.createTxNames();
      $scope.planNames = planNames;
      // get the max InsuranceOrder on services already on encounter or appointment
      ctrl.getLastInsuranceOrderOnServicesAdded();
      ctrl.processServicesForAppointment();
      if ($scope.serviceFilter === 'encounter-refactored') {
        ctrl.processServicesForEncounter();
      }
      // Sorting default to Priority, then DateModified
      $scope.NewtxPlansServiceData = $filter('orderBy')(
        services,
        [
          'TreatmentPlanServiceHeader.TreatmentPlanGroupNumber',
          'TreatmentPlanServiceHeader.Priority',
          'TreatmentPlanServiceHeader.DateModified',
        ],
        false
      );

      if ($('#treatmentKendoGrid').data('kendoGrid')) {
        $('#treatmentKendoGrid')
          .data('kendoGrid')
          .dataSource.data(
            $scope.NewtxPlansServiceData.filter(ctrl.showCorrectDataImbedded)
          );
        $scope.checkedRows = [];
      } else if ($scope.NewTxPlanDataSource) {
        $scope.TxPlanDataSource.data(
          $scope.NewtxPlansServiceData.filter(ctrl.showCorrectDataImbedded)
        );
        $scope.checkedRows = [];
      }
    };
    ctrl.setDisplayTimezone = function (zone) {
      if (zone) {
        return listHelper.findItemByFieldValue($scope.timeZones, 'Value', zone)
          .Abbr;
      } else {
        return '';
      }
    };
    ctrl.updateServicesWithAppInfo = function (results) {
      angular.forEach(results, function (serv) {
        if (serv.Value) {
          $scope.usableData[serv.Value.Appointment.AppointmentId] = {
            time: serv.Value.Appointment.StartTime,
            locationname: serv.Value.Location.NameLine1,
            timezone: ctrl.setDisplayTimezone(serv.Value.Location.Timezone),
            tooltipMessage:
              $filter('toShortDisplayDateUtc')(
                serv.Value.Appointment.StartTime
              ) +
              ' ' +
              $filter('toDisplayTime')(serv.Value.Appointment.StartTime) +
              ' ' +
              ctrl.setDisplayTimezone(serv.Value.Location.Timezone) +
              ' ' +
              serv.Value.Location.NameLine1,
          };
        }
      });
      ctrl.updateTxServices();
    };
    ctrl.updateTxServices = function () {
      _.forEach(ctrl.servicesToUpdate, function (serv) {
        if (serv.ServiceTransaction.AppointmentId) {
          var found = $scope.usableData[serv.ServiceTransaction.AppointmentId];
          if (found) {
            serv.AppointmentInfo = _.cloneDeep(found);
          } else {
            serv.AppointmentInfo = null;
          }
        } else {
          serv.AppointmentInfo = null;
        }
      });

      if ($('#treatmentKendoGrid').data('kendoGrid')) {
        $('#treatmentKendoGrid')
          .data('kendoGrid')
          .dataSource.data(
            $scope.NewtxPlansServiceData.filter(ctrl.showCorrectDataImbedded)
          );
        $scope.checkedRows = [];
      } else if ($scope.NewTxPlanDataSource) {
        $scope.TxPlanDataSource.data(
          $scope.NewtxPlansServiceData.filter(ctrl.showCorrectDataImbedded)
        );
        $scope.checkedRows = [];
      }
    };

    // Check to ensure the patient is active at the current location in the app header
    $scope.checkPatientLocation = function () {
      // sometimes patientInfo hasn't been loaded with new data, either by the parent or current controller
      // for now, we'll call to get the info if that happens
      // note, the best solution would be to ensure patientValidationFactory.CheckPatientLocation
      // has the data it needs but that's outside of the scope of a bug fix
      if (
        $scope.patientInfo &&
        $scope.patientInfo.PatientId &&
        $scope.patientInfo.PatientId === $scope.patient.PatientId
      ) {
        $scope.patientLocationMatch = patientValidationFactory.CheckPatientLocation(
          $scope.patientInfo,
          $scope.currentLocation
        );
      } else {
        // set the patientData if none
        if ($scope.patient.PatientId) {
          personFactory.Overview($scope.patient.PatientId).then(function (res) {
            $scope.patientInfo = res.Value;
            patientValidationFactory.SetPatientData(res.Value);
            $scope.patientLocationMatch = patientValidationFactory.CheckPatientLocation(
              $scope.patientInfo,
              $scope.currentLocation
            );
          });
        }
      }
    };

    $scope.setStatus = function () {
      if (!$scope.allowInactive) {
        $scope.allowInactive = true;
        $scope.TxPlanDataSource.filter([]);
      } else {
        $scope.allowInactive = false;
        var filter = {
          field: 'ServiceTransaction.serviceIsActive',
          value: true,
        };
        var filters = [];
        filters.push(filter);
        $scope.TxPlanDataSource.filter(filters);
      }
    };

    // get matching service codes for each service selected and modify properties for display on appointment
    ctrl.getServiceCodesForSelectedServices = function (selectedServices) {
      var serviceCodeList = [];
      _.forEach(selectedServices, function (service) {
        service.ServiceCode = service.showCode;
        service.Code = service.showCode;
        var serviceCode = _.find($scope.serviceCodestx, {
          ServiceCodeId: service.ServiceCodeId,
        });
        service.DisplayAs = serviceCode.DisplayAs;
        service.AffectedAreaId = serviceCode.AffectedAreaId;
        service.ObjectState = 'Update';
        service.$$isProposed = true;
        if (!_.isEmpty(serviceCode)) {
          serviceCodeList.push(_.cloneDeep(serviceCode));
        }
      });
      return serviceCodeList;
    };

    // get a list of all selected serviceTransactions
    // add insurance order
    ctrl.getSelectedServices = function () {
      // default InsuranceOrder is 1
      // sort services by Priority and add InsuranceOrder to selected services
      var lastInsuranceOrder = ctrl.getLastInsuranceOrderOnServicesAdded();
      if (_.isNil(lastInsuranceOrder)) {
        lastInsuranceOrder = 0;
      }
      lastInsuranceOrder++;

      var selectedServices = [];
      _.forEach($scope.treatmentPlans, function (treatmentPlan) {
        // sort all treatment plans by TreatmentPlanServiceHeader.Priority
        var sortedTreatmentPlanServices = $filter(
          'orderBy'
        )(treatmentPlan.TreatmentPlanServices, [
          'TreatmentPlanServiceHeader.TreatmentPlanGroupNumber',
          'TreatmentPlanServiceHeader.Priority',
        ]);
        _.forEach(sortedTreatmentPlanServices, function (treatmentPlanService) {
          if (treatmentPlanService.ServiceTransaction.$$Selected === true) {
            // set the InsuranceOrder before adding to appointment
            treatmentPlanService.ServiceTransaction.InsuranceOrder = lastInsuranceOrder;
            lastInsuranceOrder++;
            selectedServices.push(treatmentPlanService.ServiceTransaction);
          }
        });
      });
      return selectedServices;
    };

    ctrl.getSelectedTreatmentPlanServices = function () {
      //Used for encounter treatment plan estimated insurance

      // default InsuranceOrder is 1
      // sort services by Priority and add InsuranceOrder to selected services
      var lastInsuranceOrder = ctrl.getLastInsuranceOrderOnServicesAdded();
      if (_.isNil(lastInsuranceOrder)) {
        lastInsuranceOrder = 0;
      }
      lastInsuranceOrder++;

      var selectedServices = [];
      _.forEach($scope.treatmentPlans, function (treatmentPlan) {
        // sort all treatment plans by TreatmentPlanServiceHeader.Priority
        var sortedTreatmentPlanServices = $filter(
          'orderBy'
        )(treatmentPlan.TreatmentPlanServices, [
          'TreatmentPlanServiceHeader.TreatmentPlanGroupNumber',
          'TreatmentPlanServiceHeader.Priority',
        ]);
        _.forEach(sortedTreatmentPlanServices, function (treatmentPlanService) {
          if (treatmentPlanService.ServiceTransaction.$$Selected === true) {
            // set the InsuranceOrder before adding to appointment
            treatmentPlanService.ServiceTransaction.InsuranceOrder = lastInsuranceOrder;
            lastInsuranceOrder++;
            selectedServices.push(treatmentPlanService);
          }
        });
      });
      return selectedServices;
    };

    // calculates the highest InsuranceOrder on services on this appointment or Encounter
    // so we can set the InsuranceOrder on the added services to the next available InsuranceOrder
    ctrl.getLastInsuranceOrderOnServicesAdded = function () {
      if ($scope.servicesAdded && $scope.servicesAdded.length) {
        var serviceTransactionWithMaxInsuranceOrder = _.maxBy(
          $scope.servicesAdded,
          function (st) {
            return st.InsuranceOrder;
          }
        );
        if (!_.isNil(serviceTransactionWithMaxInsuranceOrder)) {
          return serviceTransactionWithMaxInsuranceOrder.InsuranceOrder;
        }
      }
      return 0;
    };

    // for appointments create returnedData package
    ctrl.getSelectedServiceTransactions = function () {
      var servicesToRemoveFromAppointment = [];
      // get a list of services to return
      var selectedServices = ctrl.getSelectedServices();
      var currentTime = new Date(Date.now()).toISOString();
      //loop through selected services
      _.forEach(selectedServices, function (service) {
        //check for future appointment on service
        if (service.AppointmentId !== null && service.StartTime > currentTime) {
          servicesToRemoveFromAppointment.push(service.ServiceTransactionId);
        }
      });
      if (servicesToRemoveFromAppointment.length > 0) {
        //modal removing service(s) from appointment
        ctrl.promptServiceOnFutureAppointment(
          servicesToRemoveFromAppointment,
          selectedServices
        );
        return;
      }

      ctrl.addServicesToEncounter(selectedServices);
    };

    ctrl.addServicesToEncounter = function (selectedServices) {
      var treatmentPlanServices = null;
      // get matching serviceCodes
      var serviceCodes = ctrl.getServiceCodesForSelectedServices(
        selectedServices
      );

      if ($scope.includeEstIns) {
        treatmentPlanServices = ctrl.getSelectedTreatmentPlanServices();
      }

      // create returnedData package
      var returnedData = {
        PlannedServices: selectedServices,
        TreatmentPlanServices: treatmentPlanServices,
        ServiceCodes: serviceCodes,
      };

      // hide treatment plan selector
      $scope.hideFilters();
      //calling false to not use the modal
      $scope.addSelectedServices(returnedData, false);
    };

    ctrl.promptServiceOnFutureAppointment = function (
      servicesToRemoveFromAppointment,
      selectedServices
    ) {
      var title, message, continueButtonText, cancelButtonText;
      if (selectedServices.length > 1) {
        title = localize.getLocalizedString(
          'One or more of these proposed services are on a future appointment.'
        );
        message = localize.getLocalizedString(
          'Adding these service(s) to the encounter will remove them from the appointment. Would you like to continue?'
        );
      } else {
        title = localize.getLocalizedString(
          'This proposed service is on a future appointment.'
        );
        message = localize.getLocalizedString(
          'Adding this service to the encounter will remove it from the appointment. Would you like to continue?'
        );
      }
      continueButtonText = localize.getLocalizedString('Confirm');
      cancelButtonText = localize.getLocalizedString('Cancel');
      modalFactory
        .ConfirmModal(title, message, continueButtonText, cancelButtonText)
        .then(
          function () {
            for (let i = 0; i < selectedServices.length; i++) {
              if (
                servicesToRemoveFromAppointment.includes(
                  selectedServices[i].ServiceTransactionId
                )
              ) {
                selectedServices[i].AppointmentId = null;
              }
            }
            ctrl.addServicesToEncounter(selectedServices);
          },
          function () {
            $scope.hideFilters();
          }
        );
    };

    // rebuild the checkedRows list each time there is a change
    ctrl.updateCheckedRows = function () {
      $scope.checkedRows = [];
      _.forEach($scope.treatmentPlans, function (treatmentPlan) {
        _.forEach(treatmentPlan.TreatmentPlanServices, function (tps) {
          if (tps.ServiceTransaction.$$Selected === true) {
            $scope.checkedRows.push(
              tps.ServiceTransaction.ServiceTransactionId
            );
          }
        });
      });
    };

    // handles adding a single service via the quick add button on service
    $scope.quickAdd = function (tps) {
      tps.ServiceTransaction.$$Selected = true;
      $scope.onSelectedCodes();
    };

    // select all services on a treatment plan that are not disabled
    // (indicates can't be selected because it is already on appointment)
    $scope.selectServicesOnPlan = function (treatmentPlan, quickAdd) {
      // if quickAdd set treatmentPlan.$$Selected = true
      treatmentPlan.$$Selected =
        quickAdd === true ? true : treatmentPlan.$$Selected;
      // if allowInactive === true select all enabled services otherwise only check ones that are enabled and active
      if ($scope.allowInactive === true) {
        _.forEach(treatmentPlan.TreatmentPlanServices, function (tps) {
          if (!tps.$$disableAddService) {
            tps.ServiceTransaction.$$Selected = treatmentPlan.$$Selected;
          }
        });
      } else {
        _.forEach(treatmentPlan.TreatmentPlanServices, function (tps) {
          if (
            !tps.$$disableAddService &&
            tps.ServiceTransaction.serviceIsActive === true
          ) {
            tps.ServiceTransaction.$$Selected = treatmentPlan.$$Selected;
          }
        });
      }
      // update checkedRows with selectedTransactions
      ctrl.updateCheckedRows();
      // set quickAddDisabled based on number of selected services
      ctrl.setQuickAddDisabled();
      // handles quick add of services for treatment plan
      if (quickAdd === true) {
        $scope.onSelectedCodes();
      }
    };

    // model for stage in groupBy
    $scope.group = [];
    // select all services on a treatment plan stage that are not disabled
    // (indicates can't be selected because it is already on appointment)
    $scope.selectServicesOnStage = function (key, stage, quickAdd) {
      // if quickAdd is true, set stageSelected to true / if quickAdd is false set stageSelected to $scope.group[key]
      var stageSelected = quickAdd ? true : $scope.group[key];
      // if allowInactive === true select all enabled services on stage otherwise only check ones that are enabled and active
      if ($scope.allowInactive === true) {
        _.forEach(stage, function (tps) {
          if (!tps.$$disableAddService) {
            tps.ServiceTransaction.$$Selected = stageSelected;
          }
        });
      } else {
        _.forEach(stage, function (tps) {
          if (
            !tps.$$disableAddService &&
            tps.ServiceTransaction.serviceIsActive === true
          ) {
            tps.ServiceTransaction.$$Selected = stageSelected;
          }
        });
      }
      // update checkedRows with selectedTransactions
      ctrl.updateCheckedRows();
      // set quickAddDisabled based on number of selected services
      ctrl.setQuickAddDisabled();
      // handles quick add of services for stage
      if (quickAdd === true) {
        $scope.onSelectedCodes();
      }
    };

    $scope.$on('$destroy', function () {
      referenceDataService.unregisterForLocationSpecificDataChanged(
        ctrl.referenceDataServiceLocationChangedReference
      );
    });

    $scope.checkSelected = function () {
      // update checkedRows with selectedTransactions
      ctrl.updateCheckedRows();
      // set quickAddDisabled based on number of selected services
      ctrl.setQuickAddDisabled();
    };

    // this method sets $$disableAddService on each service to prevent selection of services already
    // on any appointment, services already selected for this appointment, and services that have a different location id
    // than the appointment
    ctrl.processServicesForAppointment = function () {
      switch ($scope.serviceFilter) {
        case 'appointment':
          _.forEach(ctrl.treatmentPlanServices, function (service) {
            // reset
            service.$$disableAddService = false;
            service.ServiceTransaction.$$Selected = false;
            // disable selection if service already this appointment but not saved
            var match = _.find($scope.servicesAdded, function (serviceAdded) {
              return (
                serviceAdded.ServiceTransactionId ===
                service.ServiceTransactionId
              );
            });
            if (!_.isNil(match)) {
              service.$$disableAddService = true;
            }
            // disable selection if service already on appointment
            if (service.ServiceTransaction.AppointmentId !== null) {
              service.$$disableAddService = true;
            }
            // disable selection if servicestatus is 3(Rejected)
            if (service.ServiceTransaction.ServiceTransactionStatusId === 3) {
              service.$$disableAddService = true;
            }
            // disable selection if servicestatus is 2(Referred)
            if (service.ServiceTransaction.ServiceTransactionStatusId === 2) {
              service.$$disableAddService = true;
            }
            // disable selection if servicestatus is 4(completed)
            if (service.ServiceTransaction.ServiceTransactionStatusId === 4) {
              service.$$disableAddService = true;
            }
            // disable selection if servicestatus is 5(Pending)
            if (service.ServiceTransaction.ServiceTransactionStatusId === 5) {
              service.$$disableAddService = true;
            }
            // disable selection if servicestatus is 8(ReferredCompleted)
            if (service.ServiceTransaction.ServiceTransactionStatusId === 8) {
              service.$$disableAddService = true;
            }
          });
          break;
      }
      ctrl.unselectAllServices();
    };

    // this method sets $$disableAddService on each service to prevent selection of services already on any encounter,
    // services already selected for this encounter,
    // services that have a status in serviceStatusesToDisable list
    // and services that have a different location id than the encounter
    ctrl.processServicesForEncounter = function () {
      switch ($scope.serviceFilter) {
        case 'encounter-refactored':
          ctrl.treatmentPlanServices.forEach(function (treatmentPlanService) {
            // reset $$disableAddService, ServiceTransaction.$$Selected
            treatmentPlanService.$$disableAddService = false;
            treatmentPlanService.ServiceTransaction.$$Selected = false;
            // disable selection if service is already on this encounter
            var match = _.find($scope.servicesAdded, function (serviceAdded) {
              return (
                serviceAdded.ServiceTransactionId ===
                treatmentPlanService.ServiceTransaction.ServiceTransactionId
              );
            });
            // disable selection if  ServiceTransactionId is in list of serviceAdded
            if (!_.isNil(match)) {
              treatmentPlanService.$$disableAddService = true;
            }
            // disable selection if service already on any encounter
            if (treatmentPlanService.ServiceTransaction.EncounterId !== null) {
              treatmentPlanService.$$disableAddService = true;
            }
            // disable selection if Location on encounter different than selected location
            if (
              $scope.chosenLocation &&
              $scope.chosenLocation.LocationId !=
                treatmentPlanService.ServiceTransaction.LocationId
            ) {
              treatmentPlanService.$$disableAddService = true;
            }
            // disable selection if servicestatus is 3(Rejected), 2(Referred), 4(Completed),5(Pending), 8(ReferredCompleted)
            var serviceStatusesToDisable = [
              { statusId: 2 }, // 2(Referred)
              { statusId: 3 }, // 3(Rejected)
              { statusId: 4 }, // 4(Completed)
              { statusId: 5 }, // 5(Pending)
              { statusId: 8 }, // 8(ReferredCompleted)
            ];

            // disable selection if service status matches any of the above statuses
            var matchServiceTransactionStatusId = _.find(
              serviceStatusesToDisable,
              function (item) {
                return (
                  item.statusId ===
                  treatmentPlanService.ServiceTransaction
                    .ServiceTransactionStatusId
                );
              }
            );
            if (matchServiceTransactionStatusId) {
              treatmentPlanService.$$disableAddService = true;
            }
          });
          break;
      }
      ctrl.unselectAllServices();
    };

    // clears all selected treatmentPlan and treatmentPlan.TreatmentPlanServices, checkboxes
    ctrl.unselectAllServices = function () {
      // reset checkedRows which keeps a count of how many services have been selected
      $scope.checkedRows = [];
      // reset checkboxes on each treatmentPlan and treatmentPlan.TreatmentPlanServices
      _.forEach($scope.treatmentPlans, function (treatmentPlan) {
        treatmentPlan.$$Selected = false;
        _.forEach(treatmentPlan.TreatmentPlanServices, function (tps) {
          tps.ServiceTransaction.$$Selected = false;
        });
      });
      // reset $scope.group (holds $$Selected for each stage)
      $scope.group = [];
    };

    // enable / disable quick add based on checked rows
    ctrl.setQuickAddDisabled = function () {
      $scope.quickAddDisabled = $scope.checkedRows.length > 0;
    };

    // treatment plan quick add should be disabled if there are no services that can be added to the appointment
    ctrl.setQuickAddDisabledOnPlans = function (treatmentPlans) {
      _.forEach(treatmentPlans, function (tp) {
        // are there any services on this plan that can be selected
        var canSelectAtLeastOneService = _.find(
          tp.TreatmentPlanServices,
          function (tps) {
            return tps.$$disableAddService === false;
          }
        );
        tp.$$disableQuickAdd = _.isNil(canSelectAtLeastOneService)
          ? true
          : false;
      });
    };

    // treatment plan stage quick add should be disabled if there are no services on that stage that can be added to the appointment
    // this method sets ng-disabled for checkbox and sets stage.$$disableAddService for quickAdd button
    $scope.stageIsDisabled = function (stage) {
      // are there any services on this stage that can be selected
      var canSelectAtLeastOneService = _.find(stage, function (tps) {
        return tps.$$disableAddService === false;
      });
      _.forEach(stage, function (tps) {
        tps.$$stageIsDisabled = _.isNil(canSelectAtLeastOneService)
          ? true
          : false;
      });
      return _.isNil(canSelectAtLeastOneService) ? true : false;
    };

    $scope.togglePlan = function (treatmentPlan) {
      treatmentPlan.$$Collapsed = !treatmentPlan.$$Collapsed;
    };

    // since we can't be sure that the treatmentPlanServices will have Priority set, check here and set them if not
    ctrl.setPriorityOnPlans = function (treatmentPlans) {
      _.forEach(treatmentPlans, function (treatmentPlan) {
        // if any of the treatmentPlanServices have Priority set, don't set the Priority here
        var servicesWithPriorities = _.find(
          treatmentPlan.TreatmentPlanServices,
          function (treatmentPlanService) {
            return treatmentPlanService.TreatmentPlanServiceHeader.Priority > 0;
          }
        );
        // Only set Priority if none of the services on the Plan have Priority set
        if (_.isNil(servicesWithPriorities)) {
          ctrl.setPriorityOnServices(treatmentPlan);
        }
      });
    };

    // group the TreatmentPlanServices by stage and each stages services to setPriorityForServicesOnStage
    // nextPriority will start with 1 and be incremented each time the service.Priority is set
    // NOTE if at least one service on treatment plan has Priority set we won't set the others
    ctrl.setPriorityOnServices = function (treatmentPlan) {
      var nextPriority = 1;
      // parse SortSettings
      var sortSettings = [];
      sortSettings = _.isNil(treatmentPlan.TreatmentPlanHeader.SortSettings)
        ? []
        : JSON.parse(treatmentPlan.TreatmentPlanHeader.SortSettings);
      // sort by TreatmentPlanServiceHeader.TreatmentPlanGroupNumber (stage)
      treatmentPlan.TreatmentPlanServices = $filter(
        'orderBy'
      )(treatmentPlan.TreatmentPlanServices, ['TreatmentPlanGroupNumber']);
      // group by TreatmentPlanServiceHeader.TreatmentPlanGroupNumber (stage)
      var treatmentPlanStages = _.groupBy(
        treatmentPlan.TreatmentPlanServices,
        'TreatmentPlanServiceHeader.TreatmentPlanGroupNumber'
      );
      // iterate each stage and set Priority
      _.forEach(treatmentPlanStages, function (treatmentPlanServicesInStage) {
        // set the priority for each service on stage
        nextPriority = ctrl.setPriorityForServicesOnStage(
          treatmentPlanServicesInStage,
          nextPriority,
          sortSettings
        );
      });
    };

    // set priority for each service on stage based on SortSettings.SortProperty for that stage and the nextPriority passed to the method
    // if none, use default sort and nextPriority passed to method
    // nextPriority is the next available priority for the treatment plan
    ctrl.setPriorityForServicesOnStage = function (
      treatmentPlanServicesInStage,
      nextPriority,
      sortSettings
    ) {
      // get SortSettings for this stage
      var stage =
        treatmentPlanServicesInStage[0].TreatmentPlanServiceHeader
          .TreatmentPlanGroupNumber;
      var sortSettingsForStage = _.find(sortSettings, function (item) {
        return parseInt(item.Stage) === parseInt(stage);
      });

      // convert tooth to int if numeric for sorting
      // since this is a dynamic value, store in $$Tooth so that ServiceTransaction.Tooth is unaffected
      _.forEach(treatmentPlanServicesInStage, function (tps) {
        tps.ServiceTransaction.$$Tooth =
          tps.ServiceTransaction.Tooth === null
            ? '0'
            : tps.ServiceTransaction.Tooth;
        tps.ServiceTransaction.$$Tooth = !isNaN(tps.ServiceTransaction.Tooth)
          ? parseInt(tps.ServiceTransaction.Tooth)
          : tps.ServiceTransaction.Tooth;
      });

      // if SortSetting exists sort by that and set Priority based on this sort
      if (!_.isNil(sortSettingsForStage)) {
        // sort the services by sortSetting then set priority
        // convert to look at $$Tooth instead of Tooth column
        if (sortSettingsForStage.SortProperty === '-ServiceTransaction.Tooth') {
          treatmentPlanServicesInStage = $filter('orderBy')(
            treatmentPlanServicesInStage,
            '-ServiceTransaction.$$Tooth'
          );
        } else if (
          sortSettingsForStage.SortProperty === 'ServiceTransaction.Tooth'
        ) {
          treatmentPlanServicesInStage = $filter('orderBy')(
            treatmentPlanServicesInStage,
            'ServiceTransaction.$$Tooth'
          );
        } else {
          treatmentPlanServicesInStage = $filter('orderBy')(
            treatmentPlanServicesInStage,
            sortSettingsForStage.SortProperty
          );
        }

        _.forEach(treatmentPlanServicesInStage, function (tps) {
          // only set the Priority if it hasn't been set
          if (
            _.isNil(tps.TreatmentPlanServiceHeader.Priority) ||
            tps.TreatmentPlanServiceHeader.Priority === 0
          ) {
            tps.TreatmentPlanServiceHeader.Priority = nextPriority;
            nextPriority += 1;
          }
        });
      }
      // if not sort by default sort and set Priority based on that
      if (_.isNil(sortSettingsForStage)) {
        // sort the services by sortSetting then set priority
        treatmentPlanServicesInStage = $filter('orderBy')(
          treatmentPlanServicesInStage,
          'TreatmentPlanServiceHeader.DateModified'
        );
        _.forEach(treatmentPlanServicesInStage, function (tps) {
          // only set the Priority if it hasn't been set
          if (
            _.isNil(tps.TreatmentPlanServiceHeader.Priority) ||
            tps.TreatmentPlanServiceHeader.Priority === 0
          ) {
            tps.TreatmentPlanServiceHeader.Priority = nextPriority;
            nextPriority += 1;
          }
        });
      }
      return nextPriority;
    };
  }
  TreatmentSelectorController.prototype = Object.create(BaseCtrl);
})();
