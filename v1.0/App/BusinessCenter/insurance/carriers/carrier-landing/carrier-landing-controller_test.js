describe('carrer-landing-controller tests -> ', function () {
  var scope,
    ctrl,
    q,
    modalInstance,
    timeout,
    carrierBeingEdited,
    insuranceServices,
    toastrFactory,
    commonServices;

  beforeEach(module('Soar.Common'));
  beforeEach(module('common.factories'));

  var mockModalFactory = {
    CancelModal: jasmine.createSpy().and.returnValue({
      then: jasmine.createSpy(),
    }),
    Modal: jasmine.createSpy(),
  };

  // Create spies for services
  beforeEach(
    module('Soar.BusinessCenter', function ($provide) {
      timeout = jasmine.createSpy();
      $provide.value('$timeout', timeout);

      modalInstance = {
        close: jasmine.createSpy(),
        dismiss: jasmine.createSpy(),
      };

      $provide.value('ModaliInstance', modalInstance);

      carrierBeingEdited = {};
      $provide.value('Carrier', carrierBeingEdited);

      commonServices = {
        Insurance: {
          CarrierAttachedPlansPdf: jasmine
            .createSpy()
            .and.callFake(function () {
              var mock = q.defer();
              mock.resolve(1);
              return {
                result: mock.promise,
                then: function () {},
              };
            }),
        },
      };

      insuranceServices = {
        Carrier: {
          get: jasmine.createSpy(),
          update: jasmine.createSpy(),
          save: jasmine.createSpy(),
          findDuplicates: jasmine.createSpy(),
        },
        FeeSchedule: {
          get: jasmine.createSpy(),
        },
        BenefitPlan: {
          get: jasmine.createSpy(),
        },
      };
      $provide.value('BusinessCenterServices', insuranceServices);
      $provide.value('CommonServices', commonServices);
      $provide.value('ModalFactory', mockModalFactory);
    })
  );

  // Create controller and scope
  beforeEach(inject(function ($rootScope, $controller, $q) {
    scope = $rootScope.$new();
    q = $q;

    //mock for toastrFactory
    toastrFactory = {
      success: jasmine.createSpy('toastrFactory.success'),
      error: jasmine.createSpy('toastrFactory.error'),
    };

    ctrl = $controller('CarrierLandingController', {
      $scope: scope,
      $uibModalInstance: modalInstance,
      $timeout: timeout,
      toastrFactory: toastrFactory,
    });
  }));

  it('should initialize the controller', function () {
    expect(ctrl).not.toBeNull();
  });

  describe('getCarrierById function ->', function () {
    it('should call insuranceServices.Carrier.get', function () {
      ctrl.getCarrierById('1');

      expect(insuranceServices.Carrier.get).toHaveBeenCalled();
    });
  });

  describe('getAvailableFeeSchedules function ->', function () {
    it('should call insuranceServices.FeeSchedule.get', function () {
      ctrl.getAvailableFeeSchedules();

      expect(insuranceServices.FeeSchedule.get).toHaveBeenCalled();
    });
  });

  describe('ctrl.getServiceCallData ->', function () {
    it('should return one service call', function () {
      var calls = ctrl.getServiceCallData();
      expect(calls.length).toEqual(1);
    });
  });

  describe('scope.filterPlans ->', function () {
    it('benefitPlansData should contain one object', function () {
      ctrl.setGridData = jasmine.createSpy();
      scope.allBenefitPlans = [
        {
          Plan: '1',
          PlanGroupNumber: '2',
        },
      ];
      var searchTerm = '1';
      scope.filterPlans(searchTerm);
      expect(scope.benefitPlansData.length).toEqual(1);
      expect(ctrl.setGridData).toHaveBeenCalled();
    });
    it('benefitPlansData should contain no objects', function () {
      ctrl.setGridData = jasmine.createSpy();
      scope.allBenefitPlans = [
        {
          Plan: '1',
          PlanGroupNumber: '2',
        },
      ];
      var searchTerm = 'N';
      scope.filterPlans(searchTerm);
      expect(scope.benefitPlansData.length).toEqual(0);
      expect(ctrl.setGridData).toHaveBeenCalled();
    });
  });
  describe('ctrl.getAllBenefitPlansSuccess ->', function () {
    it('should set scope variables and call ctrl.setGridData', function () {
      ctrl.setGridData = jasmine.createSpy();
      var res = {
        Value: {
          BenefitId: '1',
          Name: 'Plan',
          PlanGroupNumber: '2',
        },
      };
      ctrl.getAllBenefitPlansSuccess(res);
      expect(scope.benefitPlans).toEqual(res.Value);
      expect(scope.allBenefitPlans).toEqual(scope.benefitPlansData);
      expect(ctrl.setGridData).toHaveBeenCalled();
    });
  });

  describe('ctrl.getAllBenefitPlansFailure ->', function () {
    it('should call toastrFactory.error', function () {
      ctrl.getAllBenefitPlansFailure();
      expect(toastrFactory.error).toHaveBeenCalled();
    });
  });

  describe('scope.printCarrierPlans ->', function () {
    it('should call CarrierAttachedPlansPdf', function () {
      localStorage.getItem = jasmine
        .createSpy()
        .and.returnValue(JSON.stringify({ Result: { User: { UserId: '1' } } }));
      scope.printCarrierPlans();
      expect(
        commonServices.Insurance.CarrierAttachedPlansPdf
      ).toHaveBeenCalled();
    });
  });

  describe('ctrl.updatePlanGridDataSource ->', function () {
    it('should set scope.benefitPlansData to event.sender._data', function () {
      var event = {
        sender: {
          _data: [{}],
        },
      };
      ctrl.updatePlanGridDataSource(event);
      expect(scope.benefitPlansData).toEqual(event.sender._data);
    });
  });

  describe('ctrl.printCarrierPlansSuccess ->', function () {
    it('should call window.open', function () {
      var res = { Value: {} };
      spyOn(window, 'open').and.callFake(function () {
        return true;
      });
      ctrl.printCarrierPlansSuccess(res);
      expect(window.open).toHaveBeenCalled();
    });
  });

  describe('ctrl.printCarrierPlansFailure ->', function () {
    it('should call toastrFactory.error', function () {
      ctrl.printCarrierPlansFailure();
      expect(toastrFactory.error).toHaveBeenCalled();
    });
  });
});
