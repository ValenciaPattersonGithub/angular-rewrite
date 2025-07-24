'use strict';

describe('FeeScheduleLandingController tests -> ', function () {
  var ctrl,
    toastrFactory,
    localize,
    timeout,
    rootScope,
    scope,
    businessCenterServices,
    patSecurityService,
    location,
    modalFactoryDeferred,
    modalFactory,
    tabLauncher,
    q;

  beforeEach(module('Soar.Common'));
  beforeEach(module('common.factories'));
  beforeEach(module('Soar.BusinessCenter'));

  // create controller and scope
  beforeEach(inject(function ($rootScope, $controller, $injector) {
    rootScope = $rootScope;
    scope = $rootScope.$new();

    timeout = $injector.get('$timeout');
    q = $injector.get('$q');

    //mock for toastrFactory
    toastrFactory = {
      success: jasmine.createSpy(),
      error: jasmine.createSpy(),
    };

    // mock localize
    localize = {
      getLocalizedString: jasmine.createSpy().and.returnValue(''),
    };

    //mock for businessCenterServices
    businessCenterServices = {
      BenefitPlan: {
        get: jasmine.createSpy(),
      },
      FeeSchedule: {
        save: jasmine.createSpy(),
        checkDuplicateFeeScheduleName: jasmine.createSpy(),
        get: jasmine.createSpy(),
      },
      Carrier: {
        get: jasmine.createSpy(),
      },
    };

    //mock for location
    location = {
      path: jasmine.createSpy().and.returnValue(''),
    };

    //mock for patSecurityService
    patSecurityService = {
      generateMessage: jasmine.createSpy().and.returnValue(''),
      IsAuthorizedByAbbreviation: jasmine.createSpy().and.returnValue(''),
    };

    //mock for CancelModal
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
    };

    // mock for tab launcher
    tabLauncher = { launchNewTab: jasmine.createSpy() };

    // create controller
    ctrl = $controller('FeeScheduleLandingController', {
      $scope: scope,
      $rootScope: rootScope,
      toastrFactory: toastrFactory,
      localize: localize,
      $timeout: timeout,
      BusinessCenterServices: businessCenterServices,
      $location: location,
      patSecurityService: patSecurityService,
      ModalFactory: modalFactory,
      PatientServices: {},
      tabLauncher: tabLauncher,
    });
  }));

  //controller
  it('FeeScheduleLandingController : should check if controller exists', function () {
    expect(ctrl).not.toBeNull();
    expect(ctrl).not.toBeUndefined();
  });

  describe('feeScheduleItemClicked ->', function () {
    it('should call to tab launcher method', function () {
      var feeScheduleObj = {
        dataItem: {
          FeeScheduleId: 1,
          BenefitPlanId: 2,
        },
      };
      scope.feeScheduleItemClicked(feeScheduleObj);
      expect(tabLauncher.launchNewTab).toHaveBeenCalled();
    });
  });

  //ctrl.authViewAccess function
  describe('authViewAccess function ->', function () {
    it('should call patient security authorization', function () {
      ctrl.authViewAccess();
      expect(patSecurityService.IsAuthorizedByAbbreviation).toHaveBeenCalled();
    });
  });

  //ctrl.authAccess function
  describe('authAccess function ->', function () {
    it('should set view  access', function () {
      ctrl.authViewAccess = jasmine.createSpy().and.returnValue(true);
      ctrl.authAccess();
      expect(ctrl.hasViewAccess).toBe(true);
    });

    it('should call toastr error', function () {
      ctrl.authViewAccess = jasmine.createSpy().and.returnValue(false);
      ctrl.authAccess();
      expect(toastrFactory.error).toHaveBeenCalled();
    });
  });

  describe('addFeeSchedule ->', function () {
    it('should call the location service', function () {
      scope.addFeeSchedule();
      expect(location.path).toHaveBeenCalled();
    });
  });

  describe('gridInit ->', function () {
    it('should set grid data', function () {
      ctrl.gridInit();
      expect(scope.feeScheduleDataSource).not.toBe(null);
      expect(scope.feeScheduleColumns).not.toBe(null);
      expect(scope.feeScheduleOptions).not.toBe(null);
    });
  });

  describe('getfeeSchedules', function () {
    it('should call to fee schedule get api', function () {
      ctrl.hasViewAccess = true;
      ctrl.getfeeSchedules();
      expect(businessCenterServices.FeeSchedule.get).toHaveBeenCalled();
    });
  });

  describe('ctrl.feeScheduleGetAllSuccess ->', function () {
    it('should set feeSchedules, loadingFeeSchedules, call ctrl.getCarriers ', function () {
      ctrl.getCarriers = jasmine.createSpy();
      ctrl.feeScheduleGetAllSuccess({ Value: [{ AccId: 1 }] });
      expect(ctrl.feeSchedules).toEqual([{ AccId: 1 }]);
      expect(ctrl.getCarriers).toHaveBeenCalled();
    });
  });

  describe('ctrl.feeScheduleGetAllFailure ->', function () {
    it('should call toastrFactory.error', function () {
      ctrl.feeScheduleGetAllFailure();
      expect(toastrFactory.error).toHaveBeenCalled();
    });
  });

  describe('scope.actionsFunction ->', function () {
    it('should call toastrFactory.error', function () {
      var fn = jasmine.createSpy();
      var param = { test: 'test' };
      scope['functionName'] = fn;
      scope.actionsFunction('functionName', param);
      expect(fn).toHaveBeenCalledWith(param);
    });
  });

  describe('ctrl.getCarriers ->', function () {
    it('should call businessCenterServices.Carrier.get', function () {
      ctrl.hasViewAccess = true;
      ctrl.getCarriers();
      expect(businessCenterServices.Carrier.get).toHaveBeenCalled();
    });
  });

  describe('ctrl.carrierGetAllSuccess ->', function () {
    it('should set carriers and call ctrl.getBenefitPlans', function () {
      ctrl.getBenefitPlans = jasmine.createSpy();
      ctrl.carrierGetAllSuccess({ Value: [{ AccId: 1 }] });
      expect(ctrl.carriers).toEqual([{ AccId: 1 }]);
      expect(ctrl.getBenefitPlans).toHaveBeenCalled();
    });
  });

  describe('ctrl.carrierGetAllFailure ->', function () {
    it('should set scope.loadingFeeSchedules to false and call toastrFactory.error', function () {
      ctrl.carrierGetAllFailure();
      expect(scope.loadingFeeSchedules).toBe(false);
      expect(toastrFactory.error).toHaveBeenCalled();
    });
  });

  describe('ctrl.getBenefitPlans ->', function () {
    it('should call businessCenterServices.BenefitPlan.get', function () {
      ctrl.hasViewAccess = true;
      ctrl.getBenefitPlans();
      expect(businessCenterServices.BenefitPlan.get).toHaveBeenCalled();
    });
  });

  describe('ctrl.benefitPlansGetAllSuccess ->', function () {
    it('should set benefitPlans and call ctrl.addCarrierNamesAssociatedWithFeeSchedules and ctrl.addAssociatedPlansCount', function () {
      ctrl.addCarrierNamesAssociatedWithFeeSchedules = jasmine.createSpy();
      ctrl.addAssociatedPlansCount = jasmine.createSpy();
      ctrl.benefitPlansGetAllSuccess({ Value: [{ AccId: 1 }] });
      expect(ctrl.benefitPlans).toEqual([{ AccId: 1 }]);
      expect(ctrl.addCarrierNamesAssociatedWithFeeSchedules).toHaveBeenCalled();
      expect(ctrl.addAssociatedPlansCount).toHaveBeenCalled();
    });
  });

  describe('ctrl.benefitPlansGetAllFailure ->', function () {
    it('should set scope.loadingFeeSchedules to false and call toastrFactory.error', function () {
      ctrl.benefitPlansGetAllFailure();
      expect(scope.loadingFeeSchedules).toBe(false);
      expect(toastrFactory.error).toHaveBeenCalled();
    });
  });

  describe('ctrl.addCarrierNamesAssociatedWithFeeSchedules ->', function () {
    it('feeSchedule[0].$CarrierNames should be Carrier One, Carrier Two', function () {
      ctrl.feeSchedules = [
        { FeeScheduleId: '658F4D12-145F-E611-B258-989096E2D412' },
      ];

      ctrl.carriers = [
        {
          Name: 'Carrier One',
          FeeScheduleList: [
            {
              FeeScheduleId: '658F4D12-145F-E611-B258-989096E2D412',
            },
          ],
        },
        {
          Name: 'Carrier Two',
          FeeScheduleList: [
            {
              FeeScheduleId: '658F4D12-145F-E611-B258-989096E2D412',
            },
          ],
        },
      ];

      ctrl.addCarrierNamesAssociatedWithFeeSchedules();
      expect(ctrl.feeSchedules[0].$CarrierNames).toBe(
        'Carrier One, Carrier Two'
      );
    });
    it('feeSchedule[0].$CarrierNames should be Carrier One, Carrier Two.  Tests Sort', function () {
      ctrl.feeSchedules = [
        { FeeScheduleId: '658F4D12-145F-E611-B258-989096E2D412' },
      ];

      ctrl.carriers = [
        {
          Name: 'Carrier Two',
          FeeScheduleList: [
            {
              FeeScheduleId: '658F4D12-145F-E611-B258-989096E2D412',
            },
          ],
        },
        {
          Name: 'Carrier One',
          FeeScheduleList: [
            {
              FeeScheduleId: '658F4D12-145F-E611-B258-989096E2D412',
            },
          ],
        },
      ];

      ctrl.addCarrierNamesAssociatedWithFeeSchedules();
      expect(ctrl.feeSchedules[0].$CarrierNames).toBe(
        'Carrier One, Carrier Two'
      );
    });
  });

  describe('ctrl.addAssociatedPlansCount ->', function () {
    it('feeSchedule[0].$Associated Plans should be 2', function () {
      ctrl.feeSchedules = [
        { FeeScheduleId: '658F4D12-145F-E611-B258-989096E2D412' },
      ];
      ctrl.benefitPlans = [
        { FeeScheduleId: '658F4D12-145F-E611-B258-989096E2D412' },
        { FeeScheduleId: '658F4D12-145F-E611-B258-989096E2D412' },
      ];

      ctrl.addAssociatedPlansCount();
      expect(ctrl.feeSchedules[0].$AssociatedPlans).toBe('2');
    });
    it('feeSchedule[0].$Associated Plans should be 1', function () {
      ctrl.feeSchedules = [
        { FeeScheduleId: '658F4D12-145F-E611-B258-989096E2D412' },
      ];
      ctrl.benefitPlans = [
        { FeeScheduleId: 'AFB2C8BB-CC5F-E611-B258-989096E2D412' },
        { FeeScheduleId: '658F4D12-145F-E611-B258-989096E2D412' },
      ];

      ctrl.addAssociatedPlansCount();
      expect(ctrl.feeSchedules[0].$AssociatedPlans).toBe('1');
    });
  });
});
