describe('close-claim-modal-controller tests -> ', function () {
  var unittestscope,
    ctrl,
    modalInstance,
    modalFactory,
    toastrFactory,
    closeclaimobject,
    patientServiceMock,
    scheduleServices,
    mockModalDataFactory,
    claimsService,
    usersFactory;
  var modalFactoryDeferred, q, closeClaimService;

  closeclaimobject = {
    patientId: '840e769a-3328-e611-8223-7c5cf8a0cc41',
    claimId: '0edf775e-3528-e611-8223-7c5cf8a0cc41',
    hasMultipleTransactions: true,
    fromPatitentSummary: false,
  };

  beforeEach(module('Soar.Common'));
  beforeEach(module('common.factories'));

  beforeEach(
    module('Soar.BusinessCenter', function ($provide) {
      patientServiceMock = {
        Claim: {
          getEstimatedInsuranceForClaim: jasmine.createSpy(),
        },
        PatientBenefitPlan: {
          get: jasmine.createSpy().and.returnValue({}),
          update: jasmine.createSpy(),
          getBenefitPlansAvailableByClaimId: jasmine.createSpy(),
        },
      };

      $provide.value('PatientServices', patientServiceMock);
    })
  );

  beforeEach(
    module('Soar.Schedule', function ($provide) {
      scheduleServices = {
        Dtos: {
          Appointment: {
            Operations: {
              Update: jasmine.createSpy('AppointmentUpdate'),
              Delete: jasmine.createSpy('AppointmentDelete'),
            },
          },
        },
        SoftDelete: {
          Appointment: jasmine.createSpy(),
        },
      };

      $provide.value('ScheduleServices', scheduleServices);

      mockModalDataFactory = {};

      $provide.value('ModalDataFactory', mockModalDataFactory);
    })
  );

  beforeEach(inject(function ($rootScope, $controller, $injector) {
    q = $injector.get('$q');
    unittestscope = $rootScope.$new();
    // mock for modalFactory
    modalFactory = {
      CancelModal: jasmine
        .createSpy('modalFactory.CancelModal')
        .and.callFake(function () {
          modalFactoryDeferred = q.defer();
          modalFactoryDeferred.resolve(1);
          return {
            result: modalFactoryDeferred.promise,
            then: function () {},
          };
        }),
      Modal: jasmine.createSpy('modalFactory.Modal').and.callFake(function () {
        modalFactoryDeferred = q.defer();
        modalFactoryDeferred.resolve(1);
        return {
          result: modalFactoryDeferred.promise,
          then: function () {},
        };
      }),
    };

    //mock for ClaimsService
    claimsService = {
      getClaimEntityByClaimId: jasmine.createSpy(),
    };

    //mock for modal
    modalInstance = {
      open: jasmine.createSpy('modalInstance.open').and.callFake(function () {
        var deferred = q.defer();
        deferred.resolve('some value in return');
        return { result: deferred.promise };
      }),
      close: jasmine.createSpy('modalInstance.close'),
      dismiss: jasmine.createSpy('modalInstance.dismiss'),
      result: {
        then: jasmine.createSpy('modalInstance.result.then'),
      },
    };
    //mock for toastrFactory
    toastrFactory = {
      success: jasmine.createSpy(),
      error: jasmine.createSpy(),
    };

    closeClaimService = {
      update: jasmine.createSpy(),
    };

    usersFactory = {
      Users: jasmine.createSpy('usersFactory.Users').and.callFake(function () {
        return {
          result: {},
          then: function () {},
        };
      }),
    };

    ctrl = $controller('CloseClaimModalController', {
      $scope: unittestscope,
      CloseClaimService: closeClaimService,
      closeClaimObject: closeclaimobject,
      $uibModalInstance: modalInstance,
      ModalFactory: modalFactory,
      toastrFactory: toastrFactory,
      PatientServices: patientServiceMock,
      ClaimsService: claimsService,
      UsersFactory: usersFactory,
    });
  }));

  describe('initial values -> ', function () {
    it('controller should exist', function () {
      expect(ctrl).not.toBeNull();
    });

    it('should have injected closeclaims service', function () {
      expect(closeClaimService).not.toBeNull();
    });
  });

  describe('closeClaim function ->', function () {
    beforeEach(() => {
      unittestscope.claimEntity = { DataTag: '112233' };
    });

    it('should call closeclaimservice.update', function () {
      if (unittestscope.closeClaim()) {
        expect(closeClaimService.update).toHaveBeenCalled();
        expect(toastrFactory.success).toHaveBeenCalled();
      }
    });

    it('shoud close claim using DataTag from claimEntity if closeClaimObject DataTag is null', function () {
      closeclaimobject.DataTag = null;
      closeclaimobject.CheckDataTag = true;
      unittestscope.closeClaim();
      expect(closeClaimService.update.calls.first().args[0]).toEqual({
        checkDataTag: true,
        calculateEstimatedInsurance: true,
      });
      expect(closeClaimService.update.calls.first().args[1].DataTag).toEqual('112233');
    });

    it('should close claim using DataTag from closeClaimObject if closeClaimObject DataTag is not null', function () {
      closeclaimobject.DataTag = '11223344';
      closeclaimobject.CheckDataTag = true;
      unittestscope.closeClaim();
      expect(closeClaimService.update.calls.first().args[0]).toEqual({
        checkDataTag: true,
        calculateEstimatedInsurance: true,
      });
      expect(closeClaimService.update.calls.first().args[1].DataTag).toEqual('11223344');
    });

    it('should call closeclaimservice.update with checkDataTag set to true if claimObject.CheckDataTag is true', function () {
      closeclaimobject.claimActionsValue = 1;
      closeclaimobject.DataTag = '112233';
      closeclaimobject.CheckDataTag = true;
      unittestscope.estimateInsuranceOption = true;
      unittestscope.closeClaim();
      expect(closeClaimService.update.calls.first().args[0]).toEqual({
        checkDataTag: true,
        calculateEstimatedInsurance: true,
      });
    });

    it('should call closeclaimservice.update with checkDataTag set to false if claimObject.CheckDataTag is undefined', function () {
      closeclaimobject.claimActionsValue = 1;
      closeclaimobject.DataTag = '112233';
      unittestscope.estimateInsuranceOption = true;
      closeclaimobject.CheckDataTag = undefined;
      unittestscope.closeClaim();
      expect(closeClaimService.update.calls.first().args[0]).toEqual({
        checkDataTag: false,
        calculateEstimatedInsurance: unittestscope.estimateInsuranceOption,
      });
    });

    it('should call closeclaimservice.update with calculateEstimatedInsurance set to false if estimateInsuranceOption is false', function () {
      closeclaimobject.claimActionsValue = 1;
      closeclaimobject.DataTag = '112233';
      closeclaimobject.CheckDataTag = true;
      unittestscope.estimateInsuranceOption = false;
      unittestscope.closeClaim();
      expect(closeClaimService.update.calls.first().args[0]).toEqual({
        checkDataTag: true,
        calculateEstimatedInsurance: false,
      });
    });
  });

  describe('ctrl.getPatientBenefitPlan ->', function () {
    it('should call patientServiceMock.PatientBenefitPlan.get', function () {
      ctrl.getPatientBenefitPlan();
      expect(patientServiceMock.PatientBenefitPlan.get).toHaveBeenCalled();
    });
  });

  describe('unittestscope.validateIndvDeductible ->', function () {
    it('unittestscope.individualDeductibleRemaining should equal empty string', function () {
      unittestscope.patientBenefitPlan = [
        {
          PolicyHolderBenefitPlanDto: {
            BenefitPlanDto: { IndividualDeductible: 1000 },
          },
        },
      ];
      unittestscope.individualDeductibleRemaining = 1001;
      unittestscope.validateIndvDeductible();
      expect(unittestscope.individualDeductibleRemaining).toEqual('');
    });

    it('unittestscope.individualDeductibleRemaining should equal 999', function () {
      unittestscope.patientBenefitPlan = [
        {
          PolicyHolderBenefitPlanDto: {
            BenefitPlanDto: { IndividualDeductible: 1000 },
          },
        },
      ];
      unittestscope.individualDeductibleRemaining = 999;
      unittestscope.validateIndvDeductible();
      expect(unittestscope.individualDeductibleRemaining).toEqual(999);
    });
  });

  describe('unittestscope.validateFamDeductible ->', function () {
    it('unittestscope.familyDeductibleRemaining should equal empty string', function () {
      unittestscope.patientBenefitPlan = [
        {
          PolicyHolderBenefitPlanDto: {
            BenefitPlanDto: { FamilyDeductible: 4000 },
          },
        },
      ];
      unittestscope.familyDeductibleRemaining = 4001;
      unittestscope.validateFamDeductible();
      expect(unittestscope.familyDeductibleRemaining).toEqual('');
    });

    it('unittestscope.familyDeductibleRemaining should equal 3999', function () {
      unittestscope.patientBenefitPlan = [
        {
          PolicyHolderBenefitPlanDto: {
            BenefitPlanDto: { FamilyDeductible: 4000 },
          },
        },
      ];
      unittestscope.familyDeductibleRemaining = 3999;
      unittestscope.validateFamDeductible();
      expect(unittestscope.familyDeductibleRemaining).toEqual(3999);
    });
  });

  describe('ctrl.getClaimEntitySuccess ->', function () {
    it('object values should be set', function () {
      var response = { Value: { PatientBenefitPlanId: '1' } };
      unittestscope.patientBenefitPlan = [];

      ctrl.getClaimEntitySuccess(response);
      expect(unittestscope.claimEntity.PatientBenefitPlanId).toBe('1');
    });
  });

  describe('ctrl.getClaimEntityFailure ->', function () {
    it('toastrFactory.error should be called', function () {
      ctrl.getClaimEntityFailure();
      expect(toastrFactory.error).toHaveBeenCalled();
    });
  });

  describe('ctrl.getClaimEntity ->', function () {
    it('claimsService.getClaimEntityByClaimId should be called', function () {
      ctrl.getClaimEntity();
      expect(claimsService.getClaimEntityByClaimId).toHaveBeenCalled();
    });
  });
});
