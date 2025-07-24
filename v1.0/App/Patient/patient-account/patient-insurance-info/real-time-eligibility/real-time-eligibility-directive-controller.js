'use strict';
angular
  .module('Soar.Patient')
  .controller('RealTimeEligibilityDirectiveController', [
    '$scope',
    '$timeout',
    'RealTimeEligibilityFactory',
    'PatientBenefitPlansFactory',
    'LocationServices',
    'locationService',
    '$rootScope',
    'localize',
    'FeatureFlagService',
    'FuseFlag',
    'ModalFactory',
    function (
      $scope,
      $timeout,
      realTimeEligibilityFactory,
      patientBenefitPlansFactory,
      locationServices,
      locationService,
      $rootScope,
      localize,
      featureFlagService,
      fuseFlag,
      modalFactory
    ) {
      var ctrl = this;
      $scope.selectedPlanId;
      $scope.locationEnrolledInRTE = false;
      $scope.loggedInLocation = locationService.getCurrentLocation();
      $scope.tooltipMessage = '';

      ctrl.allowRTE = false;
      ctrl.rteDisabledMessage = '';

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
          if (!ctrl.allowRTE) {
            modalFactory.ConfirmModal('Eligibility', ctrl.rteDisabledMessage, 'OK');
          } else {
            realTimeEligibilityFactory.checkRTE(
              $scope.patientId,
              $scope.selectedPlanId
            );
          }
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
          if ($scope.eligibility !== null && $scope.eligibility !== undefined) {
            $scope.locationEnrolledInRTE = $scope.eligibility;

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

      ctrl.checkFeatureFlags = function () {

        featureFlagService.getOnce$(fuseFlag.AllowRealTimeEligibilityVerification).subscribe((value) => {
          ctrl.allowRTE = value;
        });

        featureFlagService.getOnce$(fuseFlag.ConfigureRealTimeEligibilityDisabledMessage).subscribe((value) => {
          ctrl.rteDisabledMessage = value;
        });

      };

      ctrl.setToolTipMessage = function () {
        if (
          (!$scope.locationEnrolledInRTE &&
            (!$scope.patientBenefitPlans ||
              $scope.patientBenefitPlans.length === 0)) ||
          !$scope.locationEnrolledInRTE
        ) {
          $scope.tooltipMessage = localize.getLocalizedString(
            'Call Patterson Sales at 800.294.8504 to enroll with RTE'
          );
        } else if (
          !$scope.patientBenefitPlans ||
          $scope.patientBenefitPlans.length === 0
        ) {
          $scope.tooltipMessage = localize.getLocalizedString(
            'No benefit plan attached to this patient'
          );
        } else {
          $scope.tooltipMessage = '';
        }
      };

      ctrl.checkFeatureFlags();
      ctrl.loadBenefitPlans();
      ctrl.checkLocationEnrollmentStatus();
    },
  ]);
