'use strict';
angular.module('Soar.Patient').controller('PatientAccountInsuranceController', [
  '$scope',
  '$routeParams',
  'patSecurityService',
  'toastrFactory',
  'PatientServices',
  'CommonServices',
  '$q',
  'ListHelper',
  'ModalFactory',
  '$filter',
  'userSettingsDataService',
  'AddPatientBenefitPlansModalService',
  '$timeout',
  function (
    $scope,
    $routeParams,
    patSecurityService,
    toastrFactory,
    patientServices,
    commonServices,
    $q,
    listHelper,
    modalFactory,
    $filter,
    userSettingsDataService,
    addPatientBenefitPlansModalService,
    $timeout
  ) {
    var ctrl = this;
    $scope.disableAddInsurance = false;

    // #region Patient Insurance

    $scope.showNewPatientHeader =
      userSettingsDataService.isNewNavigationEnabled();

    ctrl.getPatientInsurance = function () {
      $scope.patientBenefitPlans = $scope.person.BenefitPlans;
      ctrl.getPrimaryPlan();
    };

    ctrl.getPrimaryPlan = function () {
      // get the primary plan
      var primaryPlan = $filter('filter')($scope.patientBenefitPlans, {
        Priority: 0,
      });

      if (primaryPlan) {
        $scope.primaryPlan = primaryPlan[0];
      }
    };

    // #endregion

    var modalSubscription;
    $scope.openInsuranceModal = function () {
      $scope.disableAddInsurance = true;
      var patient = $scope.person.Profile;
      var nextAvailablePriority = ctrl.calcNextAvailablePriority();
      if (patient) {
        this.disableSummary = true;
        let data = {
          header: 'Header here',
          confirm: 'Save',
          cancel: 'Close',
          size: 'md',
          patient: patient,
          nextAvailablePriority: nextAvailablePriority,
        };
        let modalDialog = addPatientBenefitPlansModalService.open({ data });

        $scope.modalSubscription = modalDialog.events.subscribe(events => {
          if (events && events.type) {
            switch (events.type) {
              case 'confirm':
                modalDialog.close();
                // refresh the page
                ctrl.newPlanAdded(events.data);
                this.disableAddInsurance = false;
                break;
              case 'close':
                ctrl.onClose();
                modalDialog.close();
                break;
            }
          }
        });
      }
    };

    // disable property doesn't always get handled by digest
    ctrl.onClose = function () {
      $timeout(function () {
        $scope.disableAddInsurance = false;
      });
    };

    // after plan added
    ctrl.newPlanAdded = function (patientBenefitPlans) {
      // add any new plans to list
      patientBenefitPlans.forEach(plan => {
        let ndx = $scope.patientBenefitPlans.findIndex(
          x => x.BenefitPlanId === plan.BenefitPlanId
        );
        if (ndx === -1) {
          $scope.patientBenefitPlans.push(plan);
        }
      });
      // Reset display, primary plan
      ctrl.getPrimaryPlan();
      $timeout(function () {
        // disable property doesn't always get handled by normal digest
        $scope.disableAddInsurance = false;
      }, 300);
    };

    $scope.$on('$destroy', function () {
      if (modalSubscription) {
        modalSubscription.unsubscribe();
      }
    });

    $scope.initialize = function () {
      $scope.loading = true;
      $scope.patientId = $routeParams.patientId;
      $scope.primaryPlan = null;
      ctrl.getPatientInsurance();
      $scope.loading = false;
    };

    // calculate the next available priority when adding a new plan
    ctrl.calcNextAvailablePriority = function () {
      var nextAvailablePriority = 0;
      angular.forEach($scope.patientBenefitPlans, function (plan) {
        if (plan.Priority >= nextAvailablePriority) {
          nextAvailablePriority = plan.Priority + 1;
        }
      });
      return nextAvailablePriority;
    };
  },
]);
