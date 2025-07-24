'use strict';

var app = angular.module('Soar.Patient');

app.controller('ProposedServiceTileController', [
  '$scope',
  '$routeParams',
  'localize',
  'ListHelper',
  'PatientServices',
  'toastrFactory',
  '$filter',
  'soarAnimation',
  'patSecurityService',
  'UsersFactory',
  'TreatmentPlansFactory',
  'ModalFactory',
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
    usersFactory,
    treatmentPlansFactory,
    modalFactory
  ) {
    var ctrl = this;

    // everything that needs instantiated or called when controller loads
    ctrl.init = function () {
      ctrl.getProviders();
    };

    // listening for changes to ActiveTreatmentPlan
    $scope.$watch(
      function () {
        return treatmentPlansFactory.ActiveTreatmentPlan;
      },
      function (nv) {
        $scope.activeTreatmentPlan = nv;
      }
    );

    // used by the view to display actions
    $scope.menuToggle = function ($event, service) {
      service.ActionsVisible = !service.ActionsVisible;
      service.orientV = soarAnimation.soarVPos($event.currentTarget);
    };

    // user has clicked remove
    $scope.remove = function (service) {
      if (
        treatmentPlansFactory.ActiveTreatmentPlan.TreatmentPlanServices
          .length === 1
      ) {
        // If proposed service is the last service in plan, prompt user if they wish to delete treatment plan
        ctrl.deletePlan();
      } else {
        var i = 0;
        // counting how many
        angular.forEach(
          treatmentPlansFactory.ActiveTreatmentPlan.TreatmentPlanServices,
          function (tps) {
            if (
              tps.TreatmentPlanServiceHeader.TreatmentPlanGroupNumber ===
              service.TreatmentPlanServiceHeader.TreatmentPlanGroupNumber
            ) {
              i++;
            }
          }
        );
        if (i === 1) {
          // parts are renamed to stages
          // If proposed service is the last service in a stage, prompt user if they wish to delete that stage
          ctrl.removeStage(service);
        } else {
          treatmentPlansFactory.RemoveService(
            treatmentPlansFactory.ActiveTreatmentPlan,
            service.TreatmentPlanServiceHeader.TreatmentPlanServiceId
          );
        }
      }
    };

    // getting the user code based on ProviderUserId
    ctrl.getUserCode = function () {
      var provider = listHelper.findItemByFieldValue(
        ctrl.providers,
        'UserId',
        $scope.service.ServiceTransaction.ProviderUserId
      );
      if (provider) {
        $scope.service.ServiceTransaction.UserCode = provider.UserCode;
      }
    };

    // getting the list of providers
    ctrl.getProviders = function () {
      usersFactory.Users().then(function (res) {
        if (res && res.Value) {
          ctrl.providers = res.Value;
          ctrl.getUserCode();
        }
      });
    };

    //#region delete

    // instantiate delete modal, etc.
    ctrl.removeStage = function (service) {
      ctrl.stageMarkedforDeletion =
        service.TreatmentPlanServiceHeader.TreatmentPlanGroupNumber;
      modalFactory
        .DeleteModal('Stage ', ctrl.stageMarkedforDeletion, true)
        .then(ctrl.confirmRemoveStage);
    };

    // calling factory method to handle deletion call
    ctrl.confirmRemoveStage = function () {
      treatmentPlansFactory
        .DeleteStage(
          treatmentPlansFactory.ActiveTreatmentPlan,
          ctrl.stageMarkedforDeletion
        )
        .then(function () {
          $scope.planStages.splice($scope.planStages.length - 1, 1);
        });
      ctrl.stageMarkedforDeletion = null;
    };

    //#endregion

    //#region delete

    // instantiate delete modal, etc.
    ctrl.deletePlan = function () {
      modalFactory
        .DeleteModal(
          'plan ',
          treatmentPlansFactory.ActiveTreatmentPlan.TreatmentPlanHeader
            .TreatmentPlanName,
          true
        )
        .then(ctrl.confirmDeletePlan);
    };

    // calling factory method to handle deletion call
    ctrl.confirmDeletePlan = function () {
      treatmentPlansFactory.Delete(treatmentPlansFactory.ActiveTreatmentPlan);
    };

    //#endregion

    // Check for Empty stage in the stages list
    ctrl.checkForEmptyStage = function () {
      for (var i = 0; i <= $scope.planStages.length - 1; i++) {
        var stage = $scope.planStages[i].stageno;
        if (!ctrl.findStageNumberNumInServices(stage)) {
          return ($scope.actions[1].Disabled = true);
        }
      }
      return ($scope.actions[1].Disabled = false);
    };

    ctrl.findStageNumberNumInServices = function (stage) {
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

    $scope.move = function (svc, stageno) {
      svc.TreatmentPlanServiceHeader.TreatmentPlanGroupNumber = stageno;
      svc.ActionsVisible = false;
      treatmentPlansFactory
        .UpdateServiceHeader(treatmentPlansFactory.ActiveTreatmentPlan, svc)
        .then(function (res) {
          $scope.service.TreatmentPlanServiceHeader = res.Value;
          treatmentPlansFactory.SetActiveTreatmentPlan(
            treatmentPlansFactory.ActiveTreatmentPlan
          );
        });
      $scope.$emit('_soar-check-empty-stage');
    };

    $scope.addToNewStage = function (svc) {
      // determine next group number - get the max group number from the plan
      var nextGroupNumber =
        treatmentPlansFactory.GetActiveTreatmentPlanNextGroupNumber(
          treatmentPlansFactory.ActiveTreatmentPlan
        );
      var newStage = {};
      newStage.stageno = nextGroupNumber;
      if ($scope.planStages.length < nextGroupNumber) {
        $scope.planStages.push(newStage);
      }
      $scope.move(svc, nextGroupNumber);
    };

    // calling init function
    ctrl.init();
  },
]);
