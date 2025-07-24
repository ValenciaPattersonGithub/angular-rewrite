'use strict';

describe('FeeScheduleDetailsController tests -> ', function () {
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

    var userLocation = '{"id": "101"}';
    sessionStorage.setItem('userLocation', userLocation);

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
        getByLocation: jasmine.createSpy(),
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
    ctrl = $controller('FeeScheduleDetailsController', {
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

  describe('gridInit ->', function () {
    it('should set grid data', function () {
      ctrl.gridInit();
      expect(scope.feeScheduleDataSource).not.toBe(null);
      expect(scope.feeScheduleColumns).not.toBe(null);
      expect(scope.feeScheduleOptions).not.toBe(null);
    });
  });

  //ctrl.authAccess function
  describe('authAccess function ->', function () {
    beforeEach(function () {
      toastrFactory.error.calls.reset();
      location.path.calls.reset();
    });

    it('should set view  access', function () {
      ctrl.authViewAccess = jasmine.createSpy().and.returnValue(true);
      ctrl.authAccess();
      expect(toastrFactory.error).not.toHaveBeenCalled();
      expect(location.path).not.toHaveBeenCalled();
    });

    it('should call toastr error', function () {
      ctrl.authViewAccess = jasmine.createSpy().and.returnValue(false);
      ctrl.authAccess();
      expect(toastrFactory.error).toHaveBeenCalled();
      expect(location.path).toHaveBeenCalledWith('/');
    });
  });

  describe('getFeeScheduleByIdSuccess ->', function () {
    it('should prepare feeschedule collection', function () {
      var successRes = {
        Value: {
          FeeScheduleInfoDetails: [
            {
              ServiceCodeDescription: 'Service Code 1',
              CdtCodeName: 'Code 1',
            },
            {
              ServiceCodeDescription: 'Service Code 2',
              CdtCodeName: 'Code 2',
            },
            {
              ServiceCodeDescription: 'Service Code 3',
              CdtCodeName: 'Code 3',
            },
          ],
        },
      };
      ctrl.getFeeScheduleByIdSuccess(successRes);
      expect(
        scope.feeSchedule.FeeScheduleInfoDetails[0]
          .ServiceCodeDescriptionWithCDTCode
      ).toEqual('Service Code 1 (Code 1)');
    });
    it('should set feeScheduleForLoggedInLoc to true when details exist', function () {
      scope.feeScheduleForLoggedInLoc = false;
      var successRes = {
        Value: {
          FeeScheduleInfoDetails: [
            {
              ServiceCodeDescription: 'Service Code 1',
              CdtCodeName: 'Code 1',
            },
            {
              ServiceCodeDescription: 'Service Code 2',
              CdtCodeName: 'Code 2',
            },
            {
              ServiceCodeDescription: 'Service Code 3',
              CdtCodeName: 'Code 3',
            },
          ],
        },
      };
      ctrl.getFeeScheduleByIdSuccess(successRes);
      expect(scope.feeScheduleForLoggedInLoc).toEqual(true);
    });
    it('should set feeScheduleForLoggedInLoc to false when no details', function () {
      scope.feeScheduleForLoggedInLoc = false;
      var successRes = {
        Value: { FeeScheduleInfoDetails: [] },
      };
      ctrl.getFeeScheduleByIdSuccess(successRes);
      expect(scope.feeScheduleForLoggedInLoc).toEqual(false);
    });
  });

  describe('ctrl.getFeeScheduleByIdFailure ->', function () {
    it('should call toastr error method', function () {
      ctrl.getFeeScheduleByIdFailure();
      expect(toastrFactory.error).toHaveBeenCalled();
    });
  });
});
