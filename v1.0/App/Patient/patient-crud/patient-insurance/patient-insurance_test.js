describe('patient-insurance-controller tests -> ', function () {
    var modalInstance,
        timeout,
        businessCenterServices,
        patientServices,
        tabLauncher,
        patSharedServices;
  var ctrl, scope, patientBenefitPlansFactoryMock, patientValidationFactory;

  var mockModalFactory = {
    CancelModal: jasmine.createSpy().and.returnValue({
      then: jasmine.createSpy(),
    }),
    Modal: jasmine.createSpy().and.returnValue({
      then: jasmine.createSpy(),
    }),
  };

  beforeEach(module('Soar.Common'));
  beforeEach(module('common.factories'));

  // Create spies for services
  beforeEach(
    module('Soar.Patient', function ($provide) {
      modalInstance = {
        close: jasmine.createSpy(),
        dismiss: jasmine.createSpy(),
      };

      $provide.value('ModalInstance', modalInstance);

      patientServices = {
        PatientBenefitPlan: {
          create: jasmine.createSpy(),
          get: jasmine.createSpy(),
        },
      };
      $provide.value('PatientServices', patientServices);

      businessCenterServices = {
        BenefitPlan: {
          get: jasmine.createSpy(),
          getActive: jasmine.createSpy(
            'businessCenterServices.BenefitPlan.getActive'
          ),
        },
      };
      $provide.value('BusinessCenterServices', businessCenterServices);

      tabLauncher = {
        launchNewTab: jasmine.createSpy(),
      };
      $provide.value('tabLauncher', tabLauncher);

      $provide.value('ModalFactory', mockModalFactory);

      patSharedServices = {
        Format: {
          PatientName: jasmine.createSpy('Patient'),
        },
      };
      $provide.value('PatSharedServices', patSharedServices);

      patientBenefitPlansFactoryMock = {
        setUpdatedPriority: jasmine.createSpy(
          'BenefitPlansFactory.setUpdatedPriority'
        ),
      };

      patientValidationFactory = {
        PatientSearchValidation: jasmine.createSpy(
          'PatientValidationFactory.PatientSearchValidation'
        ),
      };
    })
  );

  // Create controller and scope
  beforeEach(inject(function ($rootScope, $controller, $injector) {
    scope = $rootScope.$new();
    timeout = $injector.get('$timeout');
    ctrl = $controller('PatientInsuranceController', {
      $scope: scope,
      $uibModalInstance: modalInstance,
      $timeout: timeout,
      toastrFactory: _toastr_,
      PatientBenefitPlansFactory: patientBenefitPlansFactoryMock,
      PatientValidationFactory: patientValidationFactory
    });
  }));

  describe('$scope.policyHolderChanged function ->', function () {
    var patientId = 1;

    beforeEach(function () {
      scope.clearSelectedPlan = jasmine.createSpy('clearSelectedPlan');
      ctrl.getPolicyHolderByPatientId = jasmine
        .createSpy('getPolicyHolderByPatientId')
        .and.returnValue({});

      scope.insurance = {
        PolicyHolderId: null,
      };

      scope.person = {
        ResponsiblePersonId: 1,
      };

      scope.policyHolderChanged(patientId);
    });

    it('should call $scope.clearSelectedPlan', function () {
      expect(scope.clearSelectedPlan).toHaveBeenCalled();
    });

    it('should set $scope.insurance.PolicyHolderId to patientId', function () {
      expect(scope.insurance.PolicyHolderId).toEqual(patientId);
    });
  });

  describe('$scope.selectPlan function ->', function () {
    beforeEach(function () {
      scope.insurance = {
        BenefitPlanId: null,
      };
    });

    it('should set $scope.insurance.BenefitPlanId to plan.BenefitId when plan is not null', function () {
      var plan = {
        BenefitId: 1,
      };
      scope.selectPlan(plan);

      expect(scope.insurance.BenefitPlanId).toEqual(plan.BenefitId);
    });
  });

  describe('scope.removeInsurance ->', function () {
    it('should call the remove callback function', function () {
      scope.remove = jasmine.createSpy('remove');
      scope.removeInsurance();
      expect(scope.remove).toHaveBeenCalled();
    });
  });

  describe('$scope.clearSelectedPlan function ->', function () {
    beforeEach(function () {
      scope.insurance = {
        BenefitPlanId: 1,
      };
    });

    it('should set $scope.insurance.BenefitPlanId to null', function () {
      scope.clearSelectedPlan();

      expect(scope.insurance.BenefitPlanId).toBeNull();
    });
  });

  describe('ctrl.getBenefitPlans function ->', function () {
    it('should set $scope.insurance.BenefitPlanId to null', function () {
      ctrl.getBenefitPlans();

      expect(businessCenterServices.BenefitPlan.getActive).toHaveBeenCalled();
    });
  });

  describe('ctrl.getBenefitPlansOnSuccess function ->', function () {
    beforeEach(function () {
      var result = {
        Value: [
          {
            PlanGroupNumber: '1',
            IndividualDeductible: 500,
            FamilyDeductible: 500,
            AnnualBenefitMaxPerIndividual: 500,
          },
        ],
      };

      scope.insurance = {
        IndividualDeductibleUsed: 100,
        PolicyHolderBenefitPlanDto: {
          FamilyDeductibleUsed: 200,
        },
        IndividualMaxUsed: 300,
        BenefitPlanId: 1,
        $individualDeductibleLeft: 400,
        $familyDeductibleLeft: 300,
        $individualMaxLeft: 200,
      };

      ctrl.findBenefitPlanById = jasmine
        .createSpy('findBenefitPlanById')
        .and.returnValue(result.Value[0]);

      ctrl.getBenefitPlansOnSuccess(result);
    });

    it('should set $scope.insurance.$individualDeductibleLeft to Equal 400', function () {
      expect(scope.insurance.$individualDeductibleLeft).toEqual(400);
    });

    it('should set $scope.insurance.$familyDeductibleLeft to Equal 300', function () {
      expect(scope.insurance.$familyDeductibleLeft).toEqual(300);
    });

    it('should set $scope.insurance.$individualMaxLeft to Equal 200', function () {
      expect(scope.insurance.$individualMaxLeft).toEqual(200);
    });

    it('should call patientServices.PatientBenefitPlan.get', function () {
      expect(patientServices.PatientBenefitPlan.get).toHaveBeenCalled();
    });
  });

  describe('$on broadcast function ->', function () {
    it('should handle broadcast event and sets location data', function () {
      var priorities = [{ Id: 1 }, { Id: 2 }];
      scope.refreshOptions = false;
      scope.$broadcast('PlanPriorityChange', priorities);
      expect(scope.refreshOptions).toBe(true);
      timeout.flush();
      expect(scope.refreshOptions).toBe(false);
      expect(scope.priorityOptions).toEqual(priorities);
    });
  });

  describe('ctrl.getPatientBenefitPlansOnSuccess  ->', function () {
    var res = { Value: [] };
    beforeEach(function () {
      scope.insurance = {
        AdditionalBenefits: 50,
        BenefitPlanId: 1234,
        IndividualDeductibleUsed: 75,
        IndividualMaxUsed: 75,
        PolicyHolderBenefitPlanDto: { FamilyDeductibleUsed: 125 },
      };

      ctrl.fullBenefitPlanList = [
        {
          BenefitId: 1234,
          FamilyDeductible: 200,
          PlanGroupNumber: 1,
          IndividualDeductible: 100,
          AnnualBenefitMaxPerIndividual: 2000,
        },
        {
          BenefitId: 1237,
          FamilyDeductible: 200,
          PlanGroupNumber: 2,
          IndividualDeductible: 100,
          AnnualBenefitMaxPerIndividual: 2000,
        },
        {
          BenefitId: 1235,
          FamilyDeductible: 300,
          PlanGroupNumber: 5,
          IndividualDeductible: 200,
          AnnualBenefitMaxPerIndividual: 3000,
        },
        {
          BenefitId: 1236,
          FamilyDeductible: 400,
          PlanGroupNumber: 10,
          IndividualDeductible: 300,
          AnnualBenefitMaxPerIndividual: 4000,
        },
      ];

      res.Value = [{ BenefitPlanId: 1234 }];
    });

    it('should not set selectedPlan if insurance.BenefitPlanId does not exist in ctrl.fullBenefitPlanList if editing', function () {
      scope.editing = true;
      scope.insurance.BenefitPlanId = 1239;
      ctrl.getPatientBenefitPlansOnSuccess(res);
      timeout.flush(0);
      expect(scope.selectedPlan).toBeNull();
    });

    it('should set selectedPlan if insurance.BenefitPlanId exists in ctrl.fullBenefitPlanList if editing', function () {
      scope.editing = true;
      ctrl.getPatientBenefitPlansOnSuccess(res);
      timeout.flush(0);
      expect(scope.selectedPlan).toEqual({
        BenefitId: 1234,
        FamilyDeductible: 200,
        PlanGroupNumber: 1,
        IndividualDeductible: 100,
        AnnualBenefitMaxPerIndividual: 2000,
        Priority: 4,
      });
    });

    it('should set scope.insurance.$planGroupNumber and benefitPlan if insurance.BenefitPlanId exists in ctrl.fullBenefitPlanList if editing', function () {
      scope.editing = true;
      ctrl.getPatientBenefitPlansOnSuccess(res);
      timeout.flush(0);
      expect(scope.insurance.$planGroupNumber).toEqual(1);
      expect(scope.insurance.$benefitPlan).toEqual({
        BenefitId: 1234,
        FamilyDeductible: 200,
        PlanGroupNumber: 1,
        IndividualDeductible: 100,
        AnnualBenefitMaxPerIndividual: 2000,
        Priority: 4,
      });
    });

    it(
      'should set $individualDeductibleLeft to benefitPlan.IndividualDeductible minus scope.insurance.IndividualDeductibleUsed' +
        'if insurance.BenefitPlanId exists in ctrl.fullBenefitPlanList if editing',
      function () {
        scope.editing = true;
        ctrl.getPatientBenefitPlansOnSuccess(res);
        timeout.flush(0);
        var difference =
          scope.insurance.$benefitPlan.IndividualDeductible -
          scope.insurance.IndividualDeductibleUsed;
        expect(scope.insurance.$individualDeductibleLeft).toEqual(difference);
      }
    );

    it(
      'should set $individualDeductibleLeft to benefitPlan.FamilyDeductible minus scope.insurance.FamilyDeductibleUsed' +
        'if insurance.BenefitPlanId exists in ctrl.fullBenefitPlanList if editing',
      function () {
        scope.editing = true;
        ctrl.getPatientBenefitPlansOnSuccess(res);
        timeout.flush(0);
        var difference =
          scope.insurance.$benefitPlan.FamilyDeductible -
          scope.insurance.PolicyHolderBenefitPlanDto.FamilyDeductibleUsed;
        expect(scope.insurance.$familyDeductibleLeft).toEqual(difference);
      }
    );

    it(
      'should set $individualMaxLeft to benefitPlan.AnnualBenefitMaxPerIndividual plus scope.insurance.AdditionalBenefits minus scope.insurance.IndividualMaxUsed' +
        'if insurance.BenefitPlanId exists in ctrl.fullBenefitPlanList if editing',
      function () {
        scope.editing = true;
        ctrl.getPatientBenefitPlansOnSuccess(res);
        timeout.flush(0);
        var difference =
          scope.insurance.$benefitPlan.AnnualBenefitMaxPerIndividual +
          scope.insurance.AdditionalBenefits -
          scope.insurance.IndividualMaxUsed;
        expect(scope.insurance.$individualMaxLeft).toEqual(difference);
      }
    );

    it('should set $individualMaxLeft and $additionalBenefits to zero when AnnualBenefitMaxPerIndividual is zero', function () {
      scope.editing = true;
      let tooltip = 'test';
      scope.individualMaxLeftTooltipContent = tooltip;
      scope.individualMaxLeftTooltip = { options: {} };
      scope.insurance = {
        AdditionalBenefits: 50,
        BenefitPlanId: 98765444,
        IndividualDeductibleUsed: 75,
        IndividualMaxUsed: 75,
        PolicyHolderBenefitPlanDto: { FamilyDeductibleUsed: 125 },
      };
      res.Value = [{ BenefitPlanId: 98765444 }];
      ctrl.fullBenefitPlanList = [
        {
          BenefitId: 98765444,
          FamilyDeductible: 200,
          PlanGroupNumber: 1,
          IndividualDeductible: 100,
          AnnualBenefitMaxPerIndividual: 0,
        },
      ];
      ctrl.getPatientBenefitPlansOnSuccess(res);
      timeout.flush(0);
      expect(scope.insurance.$individualMaxLeft).toEqual(0);
      expect(scope.insurance.$additionalBenefits).toEqual(0);
      expect(scope.individualMaxLeftTooltipContent).not.toEqual(tooltip);
    });
  });
});
