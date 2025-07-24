describe('insurance-selector-modal-controller tests -> ', function () {
  var patientServices,
    patSharedServices,
    allowedPlans,
    $uibModalInstance,
    insurance,
    patient,
    businessCenterServices;
  var ctrl, scope;

  beforeEach(module('Soar.Common'));
  beforeEach(module('common.factories'));

  // Create spies for services
  beforeEach(
    module('Soar.Patient', function ($provide) {
      patientServices = {
        PatientBenefitPlan: {
          get: jasmine.createSpy(),
        },
      };
      $provide.value('PatientServices', patientServices);

      patSharedServices = {
        Format: {
          PatientName: jasmine.createSpy('Patient'),
        },
      };
      $provide.value('PatSharedServices', patSharedServices);

      allowedPlans = {};
      $provide.value('allowedPlans', allowedPlans);

      $uibModalInstance = {};
      $provide.value('$uibModalInstance', $uibModalInstance);

      insurance = {};
      $provide.value('insurance', insurance);

      patient = {
        PatientId: 1,
      };
      $provide.value('patient', patient);

      businessCenterServices = {
        BenefitPlan: {
          get: jasmine.createSpy(),
        },
      };
      $provide.value('BusinessCenterServices', businessCenterServices);
    })
  );

  // Create controller and scope
  beforeEach(inject(function ($rootScope, $controller) {
    scope = $rootScope.$new();

    ctrl = $controller('InsuranceSelectorModalController', {
      $scope: scope,
      toastrFactory: _toastr_,
      unsavedBenefitPlans: [],
    });
  }));

  describe('ctrl.getBenefitPlans ->', function () {
    it('should call patientServices.PatientBenefitPlan.get', function () {
      ctrl.getBenefitPlans(patient.PatientId);

      expect(patientServices.PatientBenefitPlan.get).toHaveBeenCalled();
    });
  });

  describe('$scope.initialize ->', function () {
    it('should call patientServices.PatientBenefitPlan.get', function () {
      scope.initialize();

      expect(patientServices.PatientBenefitPlan.get).toHaveBeenCalled();
    });
  });

  describe('sortPlansByPriority ->', function () {
    it('should order plans based on Priority', function () {
      scope.plans = [
        { Priority: 3 },
        { Priority: 2 },
        { Priority: 1 },
        { Priority: 0 },
      ];
      ctrl.sortPlansByPriority();

      expect(scope.plans[0].Priority).toBe(0);
      expect(scope.plans[1].Priority).toBe(1);
      expect(scope.plans[2].Priority).toBe(2);
      expect(scope.plans[3].Priority).toBe(3);
    });

    it('should order plans based on Priority', function () {
      scope.plans = [
        { Priority: 2 },
        { Priority: 0 },
        { Priority: 1 },
        { Priority: 3 },
      ];
      ctrl.sortPlansByPriority();

      expect(scope.plans[0].Priority).toBe(0);
      expect(scope.plans[1].Priority).toBe(1);
      expect(scope.plans[2].Priority).toBe(2);
      expect(scope.plans[3].Priority).toBe(3);
    });

    it('should order plans based on Priority', function () {
      scope.plans = [
        { Priority: 2 },
        { Priority: 2 },
        { Priority: 0 },
        { Priority: 1 },
      ];
      ctrl.sortPlansByPriority();

      expect(scope.plans[0].Priority).toBe(0);
      expect(scope.plans[1].Priority).toBe(1);
      expect(scope.plans[2].Priority).toBe(2);
      expect(scope.plans[3].Priority).toBe(2);
    });
  });
});
