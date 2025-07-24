describe('real-time-elibility_directive-controller test -> ', function () {
  var scope, realTimeEligibilityFactory, patientBenefitPlansFactory, featureFlagService, fuseFlag, modalFactory;
  var ctrl, rootScope, locationService, locationServices, localize;

  beforeEach(
    module('Soar.Patient', function ($provide) {
      realTimeEligibilityFactory = {
        checkRTE: jasmine.createSpy(),
      };
      $provide.value('RealTimeEligibilityFactory', realTimeEligibilityFactory);

      patientBenefitPlansFactory = {
        checkRTE: jasmine.createSpy(),
      };
      $provide.value('PatientBenefitPlansFactory', patientBenefitPlansFactory);

      locationService = {
        getCurrentLocation: jasmine.createSpy().and.callFake(function (val) {
          return val;
        }),
      };
      $provide.value('locationService', locationService);

      featureFlagService = {
        getOnce$: jasmine.createSpy().and.returnValue({ subscribe: jasmine.createSpy() })
      };
      $provide.value('FeatureFlagService', featureFlagService);

      fuseFlag = {};
      $provide.value('FuseFlag', fuseFlag);

      locationServices = {
        get: jasmine.createSpy('LocationServices.get'),
        getLocationEstatementEnrollmentStatus: jasmine.createSpy(
          'LocationServices.getLocationEstatementEnrollmentStatus'
        ),
      };
      $provide.value('LocationServices', locationServices);

      localize = {
        getLocalizedString: jasmine.createSpy().and.callFake(function (val) {
          return val;
        }),
      };
      $provide.value('localize', localize);
    })
  );

  beforeEach(module('Soar.Common'));
  beforeEach(module('common.factories'));

  beforeEach(inject(function ($rootScope, $controller) {
    scope = $rootScope.$new();
    rootScope = $rootScope;
    ctrl = $controller('RealTimeEligibilityDirectiveController', {
      $scope: scope,
      patSecurityService: _authPatSecurityService_,
      $rootScope: rootScope,
      FeatureFlagService: featureFlagService,
      FuseFlag: fuseFlag,
      ModalFactory: modalFactory
    });
  }));

  describe('ctrl.loadBenefitPlans method -> ', function () {
    beforeEach(function () {
      scope.patient = { BenefitPlans: [{}] };
      spyOn(ctrl, 'priorityLabel').and.callFake(function () {});
      spyOn(ctrl, 'addDropdownLabel').and.callFake(function () {});
      spyOn(scope, 'getBenefitPlans').and.callFake(function () {});
    });

    it('should call ctrl.PriorityLable if patient.BenefitPlans are passed to directive   -> ', function () {
      ctrl.loadBenefitPlans();
      _.forEach(scope.patient.BenefitPlans, function (benefitPlan) {
        expect(ctrl.priorityLabel).toHaveBeenCalledWith(benefitPlan);
        expect(ctrl.addDropdownLabel).toHaveBeenCalledWith(benefitPlan);
      });
    });

    it('should call scope.getBenefitPlans if patient.BenefitPlans are not passed to directive   -> ', function () {
      scope.patient.BenefitPlans = null;
      ctrl.loadBenefitPlans();
      _.forEach(scope.patient.BenefitPlans, function (benefitPlan) {
        expect(ctrl.priorityLabel).not.toHaveBeenCalledWith(benefitPlan);
        expect(ctrl.addDropdownLabel).not.toHaveBeenCalledWith(benefitPlan);
      });
      expect(scope.getBenefitPlans).toHaveBeenCalled();
    });
  });
});
