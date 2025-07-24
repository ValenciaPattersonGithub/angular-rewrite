'use strict';
angular.module('Soar.Patient').controller('EligibilityDirectiveController', [
  '$scope',
  '$timeout',
  'RealTimeEligibilityFactory',
  'PatientBenefitPlansFactory',
  'LocationServices',
  'locationService',
  '$rootScope',
  'localize',
  function (
    $scope,
    $timeout,
    realTimeEligibilityFactory,
    patientBenefitPlansFactory,
    locationServices,
    locationService,
    $rootScope,
    localize
  ) {
    var ctrl = this;

    $scope.isOpen = false;
    $scope.selectedPlanId;
    $scope.locationEnrolledInRTE = false;
    $scope.loggedInLocation = locationService.getCurrentLocation();
    $scope.tooltipMessage = '';
    $scope.notEnabled = localize.getLocalizedString(
      'Call Patterson Sales at 800.294.8504 to enroll with RTE'
    );
    $scope.noBenefitPlan = localize.getLocalizedString(
      'No benefit plan attached to this patient'
    );

    $scope.$watch('patientId', function (nv, ov) {
      if (nv && nv != ov) {
        $scope.getBenefitPlans();
      }
    });

    $scope.getBenefitPlans = function () {
      if ($scope.patientId) {
        if ($scope.benefitPlans) {
          $scope.patientBenefitPlans = $scope.benefitPlans;
          angular.forEach($scope.patientBenefitPlans, function (plan) {
            ctrl.priorityLabel(plan);
            ctrl.addDropdownLabel(plan);
          });
          $scope.patientBenefitPlans = _.sortBy(
            $scope.patientBenefitPlans,
            'Priority'
          );
        } else {
          patientBenefitPlansFactory
            .PatientBenefitPlans($scope.patientId, true)
            .then(function (res) {
              $scope.patientBenefitPlans = res.Value;
              angular.forEach($scope.patientBenefitPlans, function (plan) {
                ctrl.priorityLabel(plan);
                ctrl.addDropdownLabel(plan);
              });
              $scope.patientBenefitPlans = _.sortBy(
                $scope.patientBenefitPlans,
                'Priority'
              );
            });
        }
      }
    };

    // either load from passed in patient data or if none, get from server
    ctrl.loadBenefitPlans = function () {
      if ($scope.patient && $scope.patient.BenefitPlans) {
        var benefitPlans = $scope.patient.BenefitPlans;
        angular.forEach(benefitPlans, function (plan) {
          ctrl.priorityLabel(plan);
          ctrl.addDropdownLabel(plan);
        });
        $scope.patientBenefitPlans = _.sortBy(benefitPlans, 'Priority');
      } else {
        $scope.getBenefitPlans();
      }
    };

    $scope.$watch('selectedPlanId', function () {
      if ($scope.selectedPlanId) {
        realTimeEligibilityFactory.checkRTE(
          $scope.patientId,
          $scope.selectedPlanId
        );
      }
    });

    $scope.$on('EligibilityPatientBenefitPlansUpdated', function () {
      $scope.getBenefitPlans();
      ctrl.checkLocationEnrollmentStatus();
    });

    ctrl.addDropdownLabel = function (benefitPlan) {
      benefitPlan.label =
        '' +
        benefitPlan.PriorityLabel +
        ' - ' +
        benefitPlan.PolicyHolderBenefitPlanDto.BenefitPlanDto.CarrierName +
        '/' +
        benefitPlan.PolicyHolderBenefitPlanDto.BenefitPlanDto.Name;
    };

    ctrl.priorityLabel = function (benefitPlan) {
      switch (benefitPlan.Priority) {
        case 0:
          benefitPlan.PriorityLabel = 'Primary';
          break;

        case 1:
          benefitPlan.PriorityLabel = 'Secondary';
          break;

        case 2:
          benefitPlan.PriorityLabel = '3rd';
          break;

        case 3:
          benefitPlan.PriorityLabel = '4th';
          break;

        case 4:
          benefitPlan.PriorityLabel = '5th';
          break;

        case 5:
          benefitPlan.PriorityLabel = '6th';
          break;
      }
    };

    ctrl.checkLocationEnrollmentStatus = function () {
      if ($scope.loggedInLocation && $scope.loggedInLocation.id) {
        if (
          $scope.patientEligibility !== null &&
          $scope.patientEligibility !== undefined
        ) {
          $scope.locationEnrolledInRTE = $scope.patientEligibility;

          ctrl.setToolTipMessage();
        } else {
          locationServices.getLocationRteEnrollmentStatus(
            { locationId: $scope.loggedInLocation.id },
            function (res) {
              if (res) {
                $scope.locationEnrolledInRTE = res.Result;
              }

              ctrl.setToolTipMessage();
            }
          );
        }
      }
    };

    $rootScope.$on('patCore:initlocation', function () {
      var selectedLocation = locationService.getCurrentLocation();
      if (selectedLocation.id !== $scope.loggedInLocation.id) {
        $scope.loggedInLocation = selectedLocation;
        ctrl.checkLocationEnrollmentStatus();
      }
    });

    ctrl.setToolTipMessage = function () {
      if (
        (!$scope.locationEnrolledInRTE &&
          (!$scope.patientBenefitPlans ||
            $scope.patientBenefitPlans.length === 0)) ||
        !$scope.locationEnrolledInRTE
      ) {
        $scope.tooltipMessage = $scope.notEnabled;
      } else if (
        !$scope.patientBenefitPlans ||
        $scope.patientBenefitPlans.length === 0
      ) {
        $scope.tooltipMessage = $scope.noBenefitPlan;
      } else {
        $scope.tooltipMessage = '';
      }
    };

    $scope.btnClick = btnClick;
    function btnClick() {
      if ($scope.isOpen) {
        $scope.isOpen = false;
      } else {
        $scope.isOpen = true;
      }
    }

    //close dropdown when it loses focus
    $scope.onBlur = onBlur;
    function onBlur() {
      if ($scope.isOpen) {
        $scope.isOpen = false;
      }
    }

    $scope.selectItem = selectItem;
    function selectItem(selectedItem) {
      $scope.selectedItem = selectedItem;
      if (selectedItem !== null) {
        $scope.selectedPlanId = selectedItem.PatientBenefitPlanId;
      }
      $scope.isOpen = false;
    }

    ctrl.loadBenefitPlans();
    ctrl.checkLocationEnrollmentStatus();
  },
]);
