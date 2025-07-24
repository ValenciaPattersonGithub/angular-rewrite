describe('createClaimsModal', function () {
  var ctrl,
    scope,
    location,
    localize,
    uibModalInstance,
    createClaimData,
    compile,
    patientServices;
  beforeEach(module('Soar.Patient'));
  beforeEach(module('Soar.BusinessCenter'));

  beforeEach(inject(function ($rootScope, $controller, $injector, $compile) {
    scope = $rootScope.$new();
    compile = $compile;

    //mock for localize
    localize = {
      getLocalizedString: jasmine.createSpy().and.returnValue(''),
    };

    //mock for location
    location = {
      path: 'path/',
      $$path: {
        substr: jasmine.createSpy(),
        indexOf: jasmine.createSpy(),
      },
    };

    //mock uibModalInstance
    uibModalInstance = {
      dismiss: jasmine.createSpy(),
      close: jasmine.createSpy(),
    };

    //mock createClaimData
    createClaimData = {
      AccountMember: {
        personId: 'C60BC768-40D6-4F8C-B150-0EEEE42E99D7',
      },
      Encounter: {
        EncounterId: 'C60BC768-40D6-4F8C-B150-0EEEE42E99D7',
      },
    };

    patientServices = {
      PatientBenefitPlan: {
        getBenefitPlansRecordsByPatientId: jasmine.createSpy(),
      },
      Claim: {
        Create: jasmine
          .createSpy('patientServices.Claim.Create')
          .and.returnValue({
            $promise: {
              then: function () {},
            },
          }),
      },
    };

    //mock controller
    ctrl = $controller('CreateClaimsModalController', {
      $scope: scope,
      $uibModalInstance: uibModalInstance,
      $location: location,
      localize: localize,
      createClaimData: createClaimData,
      PatientServices: patientServices,
    });
  }));

  describe('initial values -> ', function () {
    it('controller should exist', function () {
      expect(ctrl).not.toBeNull();
      expect(scope.createClaimButtonDisabled).toBe(true);
    });
  });

  describe('scope.cancel -> ', function () {
    it('uibModalInstance.dismiss should be called', function () {
      scope.cancel();
      expect(uibModalInstance.dismiss).toHaveBeenCalled();
    });
  });

  describe('scope.updateSelectedPlan -> ', function () {
    it('scope.selectedPlan should be defined', function () {
      scope.updateSelectedPlan();

      expect(scope.selectedPlan).not.toBe(undefined);
      expect(scope.createClaimButtonDisabled).toBe(true);
    });

    it('should set selectedPlan to 1', function () {
      scope.updateSelectedPlan(1);

      expect(scope.selectedPlan).toBe(1);
      expect(scope.createClaimButtonDisabled).toBe(false);
    });

    it('should not set selected plan when undefined', function () {
      scope.updateSelectedPlan(undefined);

      expect(scope.selectedPlan).toBe('');
      expect(scope.createClaimButtonDisabled).toBe(true);
    });
  });

  describe('scope.createClaims -> ', function () {
    it('should call uibModalInstance.close if createClaimData.selectPlanOnly is true', function () {
      createClaimData.selectPlanOnly = true;
      scope.createClaims();
      expect(uibModalInstance.close).toHaveBeenCalledWith(scope.selectedPlan);
    });
    it('should call not uibModalInstance.close if createClaimData.selectPlanOnly is false', function () {
      createClaimData.selectPlanOnly = false;
      scope.createClaims();
      expect(uibModalInstance.close).not.toHaveBeenCalled();
    });
    it('should call not uibModalInstance.close if createClaimData.selectPlanOnly is undefined', function () {
      scope.createClaims();
      expect(uibModalInstance.close).not.toHaveBeenCalled();
    });
    it('should call patientServices.Claim.Create if createClaimData.selectPlanOnly is undefined or false', function () {
      scope.createClaims();
      expect(patientServices.Claim.Create).toHaveBeenCalled();
    });
  });
});
