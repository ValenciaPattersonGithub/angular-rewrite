describe('delete-fee-schedule-modal-controller tests -> ', function () {
  var modalInstance, insuranceServices, affectedBenefitPlans;
  var scope;

  beforeEach(module('Soar.Common'));
  beforeEach(module('common.factories'));

  var mockModalFactory = {
    CancelModal: jasmine.createSpy().and.returnValue({
      then: jasmine.createSpy(),
    }),
  };

  // Create spies for services
  beforeEach(
    module('Soar.BusinessCenter', function ($provide) {
      modalInstance = {
        close: jasmine.createSpy(),
        dismiss: jasmine.createSpy(),
      };

      $provide.value('ModalInstance', modalInstance);

      insuranceServices = {
        BenefitPlan: {
          update: jasmine.createSpy(),
        },
      };

      affectedBenefitPlans = [{ FeeScheduleId: null }];

      $provide.value('BusinessCenterServices', insuranceServices);

      $provide.value('affectedBenefitPlans', affectedBenefitPlans);

      $provide.value('ModalFactory', mockModalFactory);
    })
  );

  // Create controller and scope
  beforeEach(inject(function ($rootScope, $controller) {
    scope = $rootScope.$new();

    $controller('DeleteFeeScheduleModalController', {
      $scope: scope,
      $uibModalInstance: modalInstance,
    });
  }));

  describe('removeFeeScheduleFromAllBenefitPlans function ->', function () {
    it('should call insuranceServices.BenefitPlan.update', function () {
      scope.removeFeeScheduleFromAllBenefitPlans();
      expect(insuranceServices.BenefitPlan.update).toHaveBeenCalled();
      expect(modalInstance.close).toHaveBeenCalled();
    });

    it('should change FeeScheduleId to null', function () {
      var benefitPlan = {
        FeeScheduleId: '123',
      };
      affectedBenefitPlans.push(benefitPlan);
      scope.removeFeeScheduleFromAllBenefitPlans();

      expect(scope.affectedBenefitPlans[1].FeeScheduleId).toBe(null);
    });

    it('should change tax calculation to "1" if set to "2" on any affected plans', function () {
      var benefitPlan = {
        FeeScheduleId: '',
        TaxCalculation: 2,
      };
      affectedBenefitPlans.push(benefitPlan);
      scope.removeFeeScheduleFromAllBenefitPlans();

      expect(scope.affectedBenefitPlans[1].TaxCalculation).toBe(1);
    });

    it('should change tax assignment to "1" if set to "2" on any affected plans', function () {
      var benefitPlan = {
        FeeScheduleId: '',
        TaxAssignment: 2,
      };
      affectedBenefitPlans.push(benefitPlan);
      scope.removeFeeScheduleFromAllBenefitPlans();

      expect(scope.affectedBenefitPlans[1].TaxAssignment).toBe(1);
    });
  });

  describe('cancel function ->', function () {
    it('should call dismiss', function () {
      scope.cancel();
      expect(modalInstance.dismiss).toHaveBeenCalled();
    });
  });
});
