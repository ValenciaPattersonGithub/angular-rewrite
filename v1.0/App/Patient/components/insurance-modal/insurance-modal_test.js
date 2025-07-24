describe('insurance-modal-controller tests -> ', function () {
  var modalInstance,
    timeout,
    injectedInsurance,
    injectedPatient,
    patientServices,
    modalFactory,
    patSharedServices,
    allowedPlans,
    patientBenefitPlansFactory;
  var ctrl, deferred, scope, toastrFactory;

  beforeEach(module('Soar.Common'));
  beforeEach(module('common.factories'));

  // Create spies for services
  beforeEach(
    module('Soar.Patient', function ($provide) {
      timeout = jasmine.createSpy();
      $provide.value('$timeout', timeout);

      modalInstance = {
        close: jasmine.createSpy(),
        dismiss: jasmine.createSpy(),
      };

      $provide.value('ModalInstance', modalInstance);

      injectedInsurance = {};
      $provide.value('insurance', injectedInsurance);

      injectedPatient = {};
      $provide.value('patient', injectedPatient);

      patientServices = {
        PatientBenefitPlan: {
          create: jasmine.createSpy(),
          get: jasmine.createSpy(),
        },
      };
      $provide.value('PatientServices', patientServices);

      modalFactory = {};

      $provide.value('ModalFactory', modalFactory);

      patSharedServices = {
        Format: {
          PatientName: jasmine.createSpy('Patient'),
        },
      };
      $provide.value('PatSharedServices', patSharedServices);

      allowedPlans = {};
      $provide.value('allowedPlans', allowedPlans);

      toastrFactory = {
        error: jasmine.createSpy('toastrFactory.error'),
      };

      $provide.value('PatientLogic', {});
    })
  );

  // Create controller and scope
  beforeEach(inject(function ($rootScope, $controller, $q) {
    patientBenefitPlansFactory = {
      PatientBenefitPlans: jasmine
        .createSpy('patientBenefitPlansFactory.PatientBenefitPlans')
        .and.callFake(function () {
          deferred = $q.defer();
          deferred.resolve(1);
          return {
            result: deferred.promise,
            then: function () {},
          };
        }),
    };

    scope = $rootScope.$new();

    ctrl = $controller('InsuranceModalController', {
      $scope: scope,
      $uibModalInstance: modalInstance,
      $timeout: timeout,
      toastrFactory: toastrFactory,
      PatientBenefitPlansFactory: patientBenefitPlansFactory,
    });
  }));

  describe('scope.removeInsurance ->', function () {
    it('should remove patient benefit plan', function () {
      scope.patient = {
        PatientBenefitPlanDtos: [
          { Id: 1, Priority: 0 },
          { Id: 2, Priority: 1 },
          { Id: 3, Priority: 2 },
        ],
      };
      scope.removeInsurance(1);
      expect(scope.patient.PatientBenefitPlanDtos).toEqual([
        { Id: 1, Priority: 0 },
        { Id: 3, Priority: 1 },
      ]);
    });
  });

  describe('ctrl.calculatedDeductibleAndMaximumAmounts function ->', function () {
    beforeEach(function () {
      scope.insurance = {
        $benefitPlan: {
          IndividualDeductible: 500,
          FamilyDeductible: 500,
          AnnualBenefitMaxPerIndividual: 500,
        },
        $individualDeductibleLeft: 300,
        $familyDeductibleLeft: 200,
        $individualMaxLeft: 400,
        $additionalBenefits: 50,
        IndividualDeductibleUsed: 0,
        IndividualMaxUsed: 0,
        PolicyHolderBenefitPlanDto: {
          FamilyDeductibleUsed: 0,
        },
      };

      ctrl.calculatedDeductibleAndMaximumAmounts(scope.insurance);
    });

    it('should set insurance.AdditionalBenefits to equal 50', function () {
      expect(scope.insurance.AdditionalBenefits).toEqual(50);
    });

    it('should set insurance.IndividualDeductibleUsed to equal 200', function () {
      expect(scope.insurance.IndividualDeductibleUsed).toEqual(200);
    });

    it('should set insurance.IndividualMaxUsed to equal 100', function () {
      expect(scope.insurance.IndividualMaxUsed).toEqual(150);
    });

    it('should set insurance.PolicyHolderBenefitPlanDto.FamilyDeductibleUsed to equal 300', function () {
      expect(
        scope.insurance.PolicyHolderBenefitPlanDto.FamilyDeductibleUsed
      ).toEqual(300);
    });
  });

  describe('$scope.save function ->', function () {
    it('should call patientServices.PatientBenefitPlan.create when valid object', function () {
      ctrl.validateInsurance = jasmine
        .createSpy('validateInsurance')
        .and.returnValue(true);
      ctrl.searchForDuplicates = jasmine.createSpy('searchForDuplicates');
      scope.currentPlans = [];
      scope.multipleInsurancesToAdd = [];

      var insurance = {};
      scope.save(insurance);
      expect(scope.isValid).toEqual(true);
    });
  });

  describe('$scope.saveMultiplePlans ->', function () {
    it('should call toastrFactory.error when save response is undefined', function () {
      patientServices.PatientBenefitPlan.update = jasmine
        .createSpy('patientServices.PatientBenefitPlan.update')
        .and.callFake(
          function (
            patientObject,
            insurancesToAdd,
            successFunction,
            failureFunction
          ) {
            failureFunction();
          }
        );
      scope.currentPlans = [];
      scope.editing = true;
      var insuranceList = [
        {
          PolicyHolderId: '00000000-0000-0000-0000-000000000001',
          BenefitPlanId: '00000000-0000-0000-0000-000000000002',
          PatientId: '00000000-0000-0000-0000-000000000001',
          $validPolicyHolder: true,
          $dateValid: true,
        },
      ];
      scope.saveMultiplePlans(insuranceList);
      expect(patientServices.PatientBenefitPlan.update).toHaveBeenCalled();
      expect(toastrFactory.error).toHaveBeenCalledWith(
        'Failed to save {0}. Please try again.',
        'Error'
      );
    });

    it('should call toastrFactory.error when save response status is 400', function () {
      patientServices.PatientBenefitPlan.update = jasmine
        .createSpy('patientServices.PatientBenefitPlan.update')
        .and.callFake(
          function (
            patientObject,
            insurancesToAdd,
            successFunction,
            failureFunction
          ) {
            var result = { status: 400 };
            failureFunction(result);
          }
        );
      scope.currentPlans = [];
      scope.editing = true;
      var insuranceList = [
        {
          PolicyHolderId: '00000000-0000-0000-0000-000000000001',
          BenefitPlanId: '00000000-0000-0000-0000-000000000002',
          PatientId: '00000000-0000-0000-0000-000000000001',
          $validPolicyHolder: true,
          $dateValid: true,
        },
      ];
      scope.saveMultiplePlans(insuranceList);
      expect(patientServices.PatientBenefitPlan.update).toHaveBeenCalled();
      expect(toastrFactory.error).toHaveBeenCalledWith(
        'Failed to save {0}. Please try again.',
        'Error'
      );
    });

    it('should not call toastrFactory.error when save response status is 409', function () {
      patientServices.PatientBenefitPlan.update = jasmine
        .createSpy('patientServices.PatientBenefitPlan.update')
        .and.callFake(
          function (
            patientObject,
            insurancesToAdd,
            successFunction,
            failureFunction
          ) {
            var result = { status: 409 };
            failureFunction(result);
          }
        );
      scope.currentPlans = [];
      scope.editing = true;
      var insuranceList = [
        {
          PolicyHolderId: '00000000-0000-0000-0000-000000000001',
          BenefitPlanId: '00000000-0000-0000-0000-000000000002',
          PatientId: '00000000-0000-0000-0000-000000000001',
          $validPolicyHolder: true,
          $dateValid: true,
        },
      ];
      scope.saveMultiplePlans(insuranceList);
      expect(patientServices.PatientBenefitPlan.update).toHaveBeenCalled();
      expect(toastrFactory.error).not.toHaveBeenCalled();
    });
  });

  describe('ctrl.getCurrentPlans ->', function () {
    it('should call patientServices.PatientBenefitPlan.get', function () {
      ctrl.getCurrentPlans();

      expect(patientServices.PatientBenefitPlan.get).toHaveBeenCalled();
    });
  });

  describe('confirmFailedValidation ->', function () {
    var res = {};
    it('should return false if res.status is not 400', function () {
      res = { status: 409 };
      expect(ctrl.confirmFailedValidation(res)).toBe(false);
    });

    it('should return false if res.data is undefined', function () {
      res = { status: 400, data: undefined };
      expect(ctrl.confirmFailedValidation(res)).toBe(false);
    });

    it('should return false if res.data.InvalidProperties[0] is undefined', function () {
      res = { status: 400, data: {} };
      expect(ctrl.confirmFailedValidation(res)).toBe(false);
    });

    it('should return false if res.data.InvalidProperties[0].ValidationMessage does not match conditions', function () {
      res = {
        status: 409,
        data: {
          InvalidProperties: [{ ValidationMessage: 'Any other message' }],
        },
      };
      expect(ctrl.confirmFailedValidation(res)).toBe(false);
    });

    it('should return true if res.data.InvalidProperties[0].ValidationMessage matches first set of conditions', function () {
      res = {
        status: 400,
        data: {
          InvalidProperties: [
            {
              ValidationMessage:
                'Same benefit plan cannot be repeated with same policyholder',
            },
          ],
        },
      };
      expect(ctrl.confirmFailedValidation(res)).toBe(true);
    });
    it('should return true if res.data.InvalidProperties[0].ValidationMessage matches second  set of conditions', function () {
      res = {
        status: 400,
        data: {
          InvalidProperties: [
            {
              ValidationMessage:
                'Same priority cannot be set to more than one plan',
            },
          ],
        },
      };
      expect(ctrl.confirmFailedValidation(res)).toBe(true);
    });
  });
});
