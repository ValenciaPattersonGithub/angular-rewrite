'use strict';

var app = angular.module('Soar.Patient');

app.controller('TreatmentPlansTileController', [
  '$scope',
  '$routeParams',
  'localize',
  'ListHelper',
  'PatientServices',
  'toastrFactory',
  '$filter',
  'soarAnimation',
  'patSecurityService',
  'ModalFactory',
  'TreatmentPlansFactory',
  'ServiceButtonsService',
  'TypeOrMaterialsService',
  '$q',
  '$location',
  'DiscardChangesService',
  'userSettingsDataService',
  function (
    $scope,
    $routeParams,
    localize,
    listHelper,
    patientServices,
    toastrFactory,
    $filter,
    soarAnimation,
    patSecurityService,
    modalFactory,
    treatmentPlansFactory,
    serviceButtonsService,
    typeOrMaterialsService,
    $q,
    $location,
    discardChangesService,
    userSettingsDataService
  ) {
    var ctrl = this;
    $scope.treatmentPlanAddServiceAmfa = 'soar-clin-cplan-asvccd';

    // everything that needs instantiated or called when controller loads
    ctrl.$onInit = function () {
      $scope.formIsValid = true;
      $scope.editing = false;
      $scope.tooltipRecommendFalse = localize.getLocalizedString(
        'Recommend this treatment'
      );
      $scope.tooltipRecommendTrue = localize.getLocalizedString(
        "Clinician's recommended choice"
      );
      $scope.tooltipPredeterminationResponseTrue = localize.getLocalizedString(
        'View Carrier Response'
      );
      $scope.localizedTreatmentPlanCreateDate = moment
        .utc($scope.txPlan.TreatmentPlanHeader.CreatedDate)
        .toDate();
      // set css class
      $scope.groupingClassCss = ctrl.getTxPlanTileClasses($scope.txPlan);
      // initialize view state
      $scope.txPlan.TreatmentPlanHeader.CollapsedViewVisible = false;
      // calculate totals
      ctrl.calculateServiceTotals($scope.txPlan.TreatmentPlanServices);
      $scope.hasCarrierResponse = false;
    };

    //#region auth
    ctrl.authTreatmentPlanAddServiceAccess = function () {
      return patSecurityService.IsAuthorizedByAbbreviation(
        $scope.treatmentPlanAddServiceAmfa
      );
    };

    // watch treatment plan services and update totals when they change
    $scope.$watch(
      'txPlan.TreatmentPlanServices',
      function (nv, ov) {
        //console.log(nv);
        //console.log(ov);
        if (nv) {
          // calculate totals
          ctrl.calculateServiceTotals(nv);
        }
      },
      true
    );

    $scope.$watch(
      'txPlan.Predeterminations',
      function (nv, ov) {
        if (nv) {
          $scope.setCarrierResponse();
        }
      },
      true
    );

    ctrl.authAccess = function () {
      if (ctrl.authTreatmentPlanAddServiceAccess()) {
        $scope.hasTreatmentPlanAddServiceAccess = true;
      }
    };

    // call auth function
    ctrl.authAccess();

    //#endregion

    //#region toggles
    ctrl.closeArea = function (plan) {
      ctrl.removeEmptyStage();
      plan.TreatmentPlanHeader.CollapsedViewVisible = false;
      $scope.viewSettings.expandView = false;
    };

    $scope.txPlanCollapseTile = function (plan, $event) {
      $event.stopPropagation();
      ctrl.closeArea(plan, $event);
    };

    $scope.txPlanExpandTile = function (i) {
      i.TreatmentPlanHeader.CollapsedViewVisible = true;
    };

    $scope.viewPredetermination = function () {
      if ($scope.txPlan.Predeterminations.length > 0) {
        var claim = $scope.txPlan.Predeterminations[0];
        $location.path(
          'BusinessCenter/Insurance/Claims/CarrierResponse/' +
            _.escape(claim.ClaimId) +
            '/Patient/' +
            _.escape(claim.PatientId)
        );
      }
    };

    $scope.planToggle = function (plan, $event) {
      $event.stopPropagation();
      treatmentPlansFactory.SetNewTreatmentPlan(null);
      var collapsedViewVisible =
        $scope.viewSettings.activeExpand !== 3
          ? !plan.TreatmentPlanHeader.CollapsedViewVisible
          : false;
      if (collapsedViewVisible === true) {
        $scope.viewSettings.txPlanActiveId =
          plan.TreatmentPlanHeader.TreatmentPlanId;
        treatmentPlansFactory.SetActiveTreatmentPlan(plan);
        $scope.planStages = treatmentPlansFactory.LoadPlanStages(
          plan.TreatmentPlanServices
        );
        plan.TreatmentPlanHeader.CollapsedViewVisible = true;
      } else {
        ctrl.closeArea(plan);
      }
    };

    //#endregion toggles

    //#region delete
    // TODO is this relevant now
    // instantiate delete modal, etc.
    $scope.delete = function (plan) {
      if (!$scope.viewSettings.expandView) {
        ctrl.planMarkedForDeletion = plan;
        modalFactory
          .DeleteModal(
            'plan ',
            plan.TreatmentPlanHeader.TreatmentPlanName,
            true
          )
          .then(ctrl.confirmDelete);
      }
    };

    // calling factory method to handle deletion call
    ctrl.confirmDelete = function () {
      treatmentPlansFactory.Delete(ctrl.planMarkedForDeletion);
    };

    //#endregion

    //#region ellipsis

    //#endregion

    //region get plan stages

    $scope.planStages = [];

    $scope.actionRecommended = function (plan) {
      if (plan.TreatmentPlanHeader.Status != 'Completed') {
        if (plan.TreatmentPlanHeader.IsRecommended == true)
          plan.TreatmentPlanHeader.IsRecommended = false;
        else plan.TreatmentPlanHeader.IsRecommended = true;
        $scope.UpdateRecommend(plan);
      }
    };

    ctrl.getMaxStageNumber = function (stages) {
      var stagenums = [];
      _.forEach(stages, function (v) {
        stagenums.push(v.stageno);
      });
      return Math.max.apply(null, stagenums);
    };

    $scope.fillPlanStages = function (services) {
      $scope.planStages = [];
      for (var i = 0; i <= services.length - 1; i++) {
        var groupNumber =
          services[i].TreatmentPlanServiceHeader.TreatmentPlanGroupNumber;
        var existingStages = $scope.planStages.filter(function (item) {
          return item.stageno == groupNumber;
        });
        if (existingStages.length === 0) {
          var newStage = {};
          newStage.stageno =
            services[i].TreatmentPlanServiceHeader.TreatmentPlanGroupNumber;
          $scope.planStages.push(newStage);
        }
      }
      if ($scope.planStages.length !== 0) {
        _.forEach($scope.planStages, function (pst) {
          pst.appointmentStatus = 'Create Unscheduled Appointment';
          pst.AppointmentId = null;
          var stageServices = services.filter(function (item) {
            return (
              item.TreatmentPlanServiceHeader.TreatmentPlanGroupNumber ==
              pst.stageno
            );
          });
          _.forEach(stageServices, function (stServ) {
            if (stServ.ServiceTransaction.AppointmentId != null) {
              pst.appointmentStatus = 'Unscheduled Appointment Created';
              pst.AppointmentId = stServ.ServiceTransaction.AppointmentId;
            }
          });
        });
      }
    };

    ctrl.removeEmptyStage = function () {
      var emptyStageIndex = -1;
      _.forEach($scope.planStages, function (stage, $index) {
        if (
          emptyStageIndex === -1 &&
          !ctrl.findStageNumberNumInServices(stage.stageno)
        ) {
          emptyStageIndex = $index;
          $scope.planStages.splice(emptyStageIndex, 1);
        }
      });
    };

    ctrl.findStageNumberNumInServices = function (stage) {
      // need to change this to a _.find query - in next round of changes.
      var services = $scope.txPlan.TreatmentPlanServices;
      for (var j = 0; j <= services.length - 1; j++) {
        if (
          services[j].TreatmentPlanServiceHeader.TreatmentPlanGroupNumber ===
          stage
        ) {
          return true;
        }
      }
      return false;
    };

    //#region expand treatment plan on clicking of clinical timeline tile from "All" tab

    // Expand treatment plan from timeline
    $scope.openTreatmentPlanCrudPanel = function () {
      var newActiveTxPlan =
        !treatmentPlansFactory.ActiveTreatmentPlan ||
        treatmentPlansFactory.ActiveTreatmentPlan != $scope.txPlan;
      treatmentPlansFactory.SetActiveTreatmentPlan(
        newActiveTxPlan ? $scope.txPlan : null
      );
      $scope.viewSettings.expandView = newActiveTxPlan;
      $scope.viewSettings.activeExpand = $scope.viewSettings.expandView ? 2 : 0;
    };

    ctrl.checkDiscardChangesService = function (controllerName) {
      if (
        discardChangesService.currentChangeRegistration !== null &&
        discardChangesService.currentChangeRegistration.hasChanges === true
      ) {
        if (
          discardChangesService.currentChangeRegistration.controller ===
          controllerName
        ) {
          return true;
        }
        return false;
      }
    };

    ctrl.clearDiscardChangesService = function (controllerName) {
      // since notes can be accessed from multiple tabs (timeline and notes) clear here if has changes
      if (
        discardChangesService.currentChangeRegistration !== null &&
        discardChangesService.currentChangeRegistration.hasChanges === true
      ) {
        if (
          discardChangesService.currentChangeRegistration.controller ===
          controllerName
        ) {
          discardChangesService.currentChangeRegistration.hasChanges = false;
          return true;
        }
      }
      return false;
    };

    ctrl.cancelChanges = function () {
      modalFactory.CancelModal().then(ctrl.confirmCancel);
    };

    // process cancel confirmation
    ctrl.confirmCancel = function () {
      ctrl.clearDiscardChangesService('TreatmentPlansReorderController');
      ctrl.navigateToPlan();
    };

    ctrl.navigateToPlan = function () {
      $scope.viewSettings.expandView = true;
      $scope.viewSettings.activeExpand = $scope.viewSettings.expandView ? 2 : 0;
      ctrl.selectedPlan.TreatmentPlanHeader.CollapsedViewVisible = false;
      if (
        treatmentPlansFactory.ActiveTreatmentPlan &&
        ctrl.selectedPlan.TreatmentPlanHeader.TreatmentPlanId !=
          treatmentPlansFactory.ActiveTreatmentPlan.TreatmentPlanHeader
            .TreatmentPlanId
      ) {
        treatmentPlansFactory.SetActiveTreatmentPlan(null);
      }

      //We don't really need to reload the tx plan if we already have it selected, right?
      //If ActiveTreatmentPlan is null or we are trying to select a different plan from the current active plan

      if (
        !treatmentPlansFactory.ActiveTreatmentPlan ||
        ctrl.selectedPlan.TreatmentPlanHeader.TreatmentPlanId !=
          treatmentPlansFactory.ActiveTreatmentPlan.TreatmentPlanHeader
            .TreatmentPlanId
      ) {
        treatmentPlansFactory.SetActiveTreatmentPlan(ctrl.selectedPlan);
        $scope.planStages = treatmentPlansFactory.LoadPlanStages(
          ctrl.selectedPlan.TreatmentPlanServices
        );
        treatmentPlansFactory.SetPlanStages($scope.planStages);
      }
    };

    $scope.expandPlan = function (plan) {
      ctrl.selectedPlan = plan;
      // dont allow navigation if TreatmentPlansReorderController has changes
      if (
        ctrl.checkDiscardChangesService('TreatmentPlansReorderController') ===
        true
      ) {
        ctrl.cancelChanges();
        return;
      }
      ctrl.navigateToPlan();
    };
    //#endregion

    ctrl.servicesCompleted = function (services) {
      var completedServices = _.filter(services, function (service) {
        return service.ServiceTransaction.ServiceTransactionStatusId == 4;
      });
      return completedServices.length;
    };

    ctrl.servicesAmountLeft = function (services) {
      var balance = 0;
      _.forEach(services, function (service) {
        if (
          service.ServiceTransaction &&
          service.ServiceTransaction.ServiceTransactionStatusId != 4
        ) {
          balance += service.ServiceTransaction.Amount;
        }
      });
      return balance;
    };

    ctrl.calculateServiceTotals = function (services) {
      $scope.txPlan.TreatmentPlanHeader.$$ServicesCompleted =
        ctrl.servicesCompleted(services);
      $scope.txPlan.TreatmentPlanHeader.$$ServicesAmountLeft =
        ctrl.servicesAmountLeft(services);
    };

    // function for returning dynamic css classes for main container
    ctrl.getTxPlanTileClasses = function (plan) {
      var cssClasses = '';
      if (
        plan.TreatmentPlanHeader.TreatmentPlanId ==
        $scope.viewSettings.txPlanActiveId
      ) {
        cssClasses = cssClasses.concat('active ');
      }
      if ($scope.timelineView) {
        if (plan.$$GroupingClass) {
          cssClasses = cssClasses.concat(plan.$$GroupingClass);
        }
      }
      if (!$scope.timelineView) {
        cssClasses = cssClasses.concat('txPlanTile__txPlanTileBorder');
      }
      return cssClasses;
    };

    $scope.setCarrierResponse = function () {
      if ($scope.txPlan.Predeterminations.length !== 0) {
        for (let i = 0; i < $scope.txPlan.Predeterminations.length; i++) {
          if ($scope.txPlan.Predeterminations[i].IsReceived) {
            $scope.hasCarrierResponse = true;
            break;
          }
        }
      }
    };
  },
]);
