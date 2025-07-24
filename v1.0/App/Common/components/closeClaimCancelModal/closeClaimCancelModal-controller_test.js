describe('closeClaimCancelModal ->', function () {
  var rootScope, scope, controller, mInstance, ctrl;

  var mockAvailablePlans = {
    Value: {
      PatientBenefitPlans: [
        {
          Priority: 1,
          PolicyHolderBenefitPlanDto: {
            BenefitPlanDto: { Name: 'Backup Plan' },
          },
          PatientBenefitPlanId: '29',
        },
      ],
      EncounterGuids: [],
    },
  };

  beforeEach(module('common.controllers'));

  beforeEach(inject(function ($rootScope, $controller) {
    mInstance = {
      close: function () {},
      dismiss: function () {},
    };
    rootScope = $rootScope;
    scope = rootScope.$new();
    controller = $controller('CloseClaimCancelModalController', {
      $scope: scope,
      $uibModalInstance: mInstance,
      availablePlansRes: mockAvailablePlans,
      PatientServices: {},
    });
  }));

  describe('confirmDiscard function -> ', function () {
    it('should call close', function () {
      spyOn(controller, 'createClaims');
      scope.confirmDiscard();

      expect(controller.createClaims).toHaveBeenCalled();
    });
  });

  describe('cancelDiscard function -> ', function () {
    it('should call close', function () {
      spyOn(mInstance, 'dismiss');
      scope.cancelDiscard();

      expect(mInstance.dismiss).toHaveBeenCalled();
    });
  });

  describe('modalScope.selectPlan -> ', function () {
    it('should set selectedPlanId to plan.PatientBenefitPlanId', function () {
      var plan = { PatientBenefitPlanId: '3' };
      scope.selectPlan(plan);
      expect(scope.selectedPlanId).toEqual('3');
    });

    it('should set searchTerm to plan.Name', function () {
      var plan = { Name: 'myPlan' };
      scope.selectPlan(plan);
      expect(scope.searchTerm).toEqual('myPlan');
    });

    it('should do nothing when plan is null', function () {
      scope.searchTerm = 'oldSearchTerm';
      scope.selectedPlanId = 'oldId';
      scope.selectPlan(null);
      expect(scope.searchTerm).toEqual('oldSearchTerm');
      expect(scope.selectedPlanId).toEqual('oldId');
    });
  });

  describe('ctrl.initialize -> ', function () {
    it('should set searchTerm to next priority plan with priority identifier', function () {
      expect(scope.searchTerm).toEqual('Backup Plan (Secondary)');
    });

    it('should set selectedPlanId to next priority plan PatientBenefitPlanId', function () {
      expect(scope.selectedPlanId).toEqual('29');
    });
  });
});
