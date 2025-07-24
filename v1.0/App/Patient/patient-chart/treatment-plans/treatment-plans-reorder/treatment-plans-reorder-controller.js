'use strict';
angular
  .module('Soar.Patient')
  //
  .controller('TreatmentPlansReorderController', [
    '$scope',
    'localize',
    '$filter',
    'patSecurityService',
    'TreatmentPlansFactory',
    'StaticData',
    'ModalFactory',
    'ClinicalDrawerStateService',
    'TreatmentPlanChangeService',
    'userSettingsDataService',
    'NewTreatmentPlanEditServicesService',
    function (
      $scope,
      localize,
      $filter,
      patSecurityService,
      treatmentPlansFactory,
      staticData,
      modalFactory,
      clinicalDrawerStateService,
      treatmentPlanChangeService,
      userSettingsDataService,
      treatmentPlanEditServices
    ) {
      // controller for sorting and persisting treatmentPlan Priority
      var ctrl = this;

      // attempt at putting plan stages together
      $scope.planStages = [];
      $scope.planStages = treatmentPlansFactory.GetPlanStages();

      $scope.drawerState = false;
      // linking up an observable value so we can have other areas notified when it changes
      $scope.drawerState = clinicalDrawerStateService.getDrawerState();

      ctrl.treatmentPlanEditAmfa = 'soar-clin-cplan-edit';
      ctrl.authTreatmentPlanEditAccess = function () {
        return patSecurityService.IsAuthorizedByAbbreviation(
          ctrl.treatmentPlanEditAmfa
        );
      };

      $scope.stageIndex = 1;
      ctrl.init = function () {
        // load services to ctrl.treatmentPlanServices so that watchers don't fire
        ctrl.activeTreatmentPlan = _.cloneDeep(
          treatmentPlansFactory.ActiveTreatmentPlan
        );
        $scope.treatmentPlanServices =
          ctrl.activeTreatmentPlan.TreatmentPlanServices;
        $scope.displayCreatedDate =
          ctrl.activeTreatmentPlan.TreatmentPlanHeader.$$DisplayCreatedDate;
        $scope.daysAgo = ctrl.activeTreatmentPlan.TreatmentPlanHeader.DaysAgo;
        $scope.treatmentPlanName =
          ctrl.activeTreatmentPlan.TreatmentPlanHeader.TreatmentPlanName;
        //need to verify if this is the correct location and why its attached to servicetxn and not txPLanHeader
        $scope.proposedAtLocationName =
          ctrl.activeTreatmentPlan.TreatmentPlanServices[0].ServiceTransaction.LocationName;
        $scope.hasChanges = false;
        ctrl.setPriorities();

        treatmentPlanChangeService.setTreatmentPlanStageOrderState(null);
        treatmentPlanChangeService.registerTreatmentPlanStageOrderObserver(
          ctrl.controllerHasChanges
        );
      };

      // resets priorities in case services have been removed or moved to different stage
      ctrl.newPrioritiesList = [];
      ctrl.setPriorities = function () {
        var maxPriority = $scope.treatmentPlanServices.length;
        for (var i = 0; i < maxPriority; i++) {
          var priority = i + 1;
          ctrl.newPrioritiesList.push(priority);
        }
        $scope.treatmentPlanServices = $filter('orderBy')(
          $scope.treatmentPlanServices,
          [
            'TreatmentPlanServiceHeader.TreatmentPlanGroupNumber',
            'TreatmentPlanServiceHeader.Priority',
          ]
        );
        for (var indx = 0; indx < $scope.treatmentPlanServices.length; indx++) {
          $scope.treatmentPlanServices[
            indx
          ].TreatmentPlanServiceHeader.Priority = ctrl.newPrioritiesList[indx];
        }
      };

      ctrl.setSortProperty = function (columnName, stage) {
        // sort the services on this stage by columnName
        if (columnName === 'tooth') {
          $scope.stageSorted = stage;
          $scope.sortProperty =
            $scope.sortProperty === 'ServiceTransaction.Tooth'
              ? '-ServiceTransaction.Tooth'
              : 'ServiceTransaction.Tooth';
        }
        if (columnName === 'amount') {
          $scope.stageSorted = stage;
          $scope.sortProperty =
            $scope.sortProperty === 'ServiceTransaction.Amount'
              ? '-ServiceTransaction.Amount'
              : 'ServiceTransaction.Amount';
        }
      };

      ctrl.sum = function (items, prop) {
        return items.reduce(function (a, b) {
          return a + b[prop];
        }, 0);
      };

      // calculates $$PatientBalance based on $$Charges - EstInsurance - AdjEst
      ctrl.getPatientBalance = function (serviceTransaction) {
        if (serviceTransaction.IsDeleted === true) {
          serviceTransaction.$$PatientBalance = 0;
          return serviceTransaction.$$PatientBalance;
        }
        if (serviceTransaction.InsuranceEstimates) {
          serviceTransaction.$$PatientBalance =
            serviceTransaction.Amount -
            ctrl.sum(serviceTransaction.InsuranceEstimates, 'EstInsurance') -
            ctrl.sum(serviceTransaction.InsuranceEstimates, 'AdjEst');
          return serviceTransaction.$$PatientBalance;
        }
      };

      // persist sort
      // reset services on active treatment plan
      $scope.save = function () {
        // check security for editing

        if (ctrl.authTreatmentPlanEditAccess()) {
          ctrl.activeTreatmentPlan.TreatmentPlanServices =
            treatmentPlanChangeService.getTreatmentPlanStageOrderState();

          treatmentPlansFactory
            .UpdatePriority(ctrl.activeTreatmentPlan)
            .then(function (res) {
              // merge updated priorities back into the activeTreatmentPlan
              ctrl.activeTreatmentPlan =
                treatmentPlansFactory.MergeTreatmentPlanServicePriorityOrderDtoToPlan(
                  ctrl.activeTreatmentPlan,
                  res.Value
                );
              // merge these to the treatmentPlansFactory.ActiveTreatmentPlan
              $scope.activeTreatmentPlan =
                treatmentPlansFactory.ActiveTreatmentPlan;
              treatmentPlansFactory.MergeTreatmentPlanServicePriorityOrderDtoToPlan(
                $scope.activeTreatmentPlan,
                res.Value
              );
              $scope.viewSettings.expandView = true;
              $scope.viewSettings.activeExpand = 2;
              $scope.planStages = treatmentPlansFactory.LoadPlanStages(
                $scope.activeTreatmentPlan.TreatmentPlanServices
              );
              treatmentPlansFactory.SetPlanStages($scope.planStages);
            });
          $scope.hasChanges = false;
        }
      };

      $scope.close = function () {
        // warn user changes will be lost if they continue (if there are any changes)
        // also, if user tries to navigate away do the same
        // if continue, revert to original
        if ($scope.hasChanges === true) {
          modalFactory.WarningModal().then(function (result) {
            if (result === true) {
              $scope.viewSettings.expandView = true;
              $scope.viewSettings.activeExpand = 2;
            }
          });
        } else {
          $scope.viewSettings.expandView = true;
          $scope.viewSettings.activeExpand = 2;
        }
      };

      ctrl.controllerHasChanges = function () {
        let state =
          treatmentPlanChangeService.getTreatmentPlanStageOrderState();

        if (state !== null && $scope.hasChanges === false) {
          $scope.hasChanges = true;
          // because this page was only partially converted the code functions off at times.
          // to ensure the code will continue to function for the time now we are applying the changes
          // this way we can move to other changes and then address when the rest of the page is converted.
          $scope.$apply();
        }
      };

      ctrl.init();

      ctrl.onDrawerChange = function () {
        $scope.drawerState = clinicalDrawerStateService.getDrawerState();
      };
      clinicalDrawerStateService.registerObserver(ctrl.onDrawerChange);

      $scope.$on('$destroy', function () {
        clinicalDrawerStateService.clearObserver(ctrl.onDrawerChange);
        // for page that has half converted
        treatmentPlanChangeService.setTreatmentPlanStageOrderState(null);
        treatmentPlanChangeService.clearTreatmentPlanStageOrderObserver(
          ctrl.controllerHasChanges
        );
      });
    },
  ]);
