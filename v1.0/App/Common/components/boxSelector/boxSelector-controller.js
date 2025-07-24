'use strict';

angular.module('common.controllers').controller('BoxSelectorController', [
  '$scope',
  'ModalFactory',
  'BusinessCenterServices',
  function ($scope, modalFactory, businessCenterServices) {
    var ctrl = this;

    $scope.selectedItem = null;

    $scope.itemTemplate = {
      url: $scope.bsItemUrl,
    };

    $scope.selectItem = function (item, elemId) {
      if (!item.alreadyAttached) {
        ctrl.removeSelectFromLastItem();

        item.$selected = true;
        item.$element = angular
          .element('#' + elemId)
          .find('>box-selector-item>ng-include>div')
          .addClass('selected');

        $scope.selectedItem = item;
      }
    };

    $scope.onAddClick = function () {
      ctrl.removeSelectFromLastItem();

      $scope.addInsurance();
    };

    ctrl.refreshPlansList = function (insList) {
      var benefitPlanId = insList[0].BenefitPlanId;
      businessCenterServices.BenefitPlan.get(
        { BenefitId: benefitPlanId },
        function (res) {
          var plan = res.Value;
          plan.PolicyHolderStringId = insList[0].PolicyHolderStringId;
          if (plan) $scope.items.push(plan);
        }
      );
    };

    // calculate the next available priority when adding a new plan
    ctrl.calcNextAvailablePriority = function () {
      var nextAvailablePriority = 0;
      angular.forEach($scope.patient.PatientBenefitPlanDtos, function (plan) {
        if (plan.Priority >= nextAvailablePriority) {
          nextAvailablePriority = plan.Priority + 1;
        }
      });
      return nextAvailablePriority;
    };

    $scope.addInsurance = function () {
      modalFactory
        .Modal({
          templateUrl:
            'App/Patient/components/insurance-modal/insurance-modal.html',
          backdrop: 'static',
          keyboard: false,
          size: 'lg',
          windowClass: 'center-modal',
          controller: 'InsuranceModalController',
          amfa: 'soar-acct-insinf-view',
          resolve: {
            insurance: function () {
              return {
                PolicyHolderId: $scope.patient.PatientId,
                PatientId: $scope.patient.PatientId,
                BenefitPlanId: null,
                PolicyHolderStringId: null,
                DependentChildOnly: false,
                RequiredIdentification: null,
                $policyHolderNeedsInsurance: true,
                Priority: ctrl.calcNextAvailablePriority(),
                AddForOther: true,
              };
            },
            allowedPlans: function () {
              return $scope.items;
            },
            patient: function () {
              return $scope.patient;
            },
          },
        })
        .result.then(ctrl.refreshPlansList);
    };

    ctrl.removeSelectFromLastItem = function () {
      if ($scope.selectedItem) {
        $scope.selectedItem.$selected = false;
        $scope.selectedItem.$element.removeClass('selected');
      }
    };
  },
]);
