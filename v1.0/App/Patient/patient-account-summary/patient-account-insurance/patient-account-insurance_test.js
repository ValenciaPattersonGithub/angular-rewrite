describe('PatientAccountInsuranceController ->', function () {
  var ctrl,
    scope,
    routeParams,
    patSecurityService,
    patientServices,
    commonServices,
    q,
    listHelper,
    modalFactory,
    modalFactoryDeferred;
  var timeout, mockAddPatientBenefitPlansModalService;
  beforeEach(module('Soar.Common'));
  beforeEach(module('Soar.Patient'));
  beforeEach(module('common.factories'));

  const mockDialogRef = {
    events: {
      pipe: jasmine
        .createSpy()
        .and.returnValue({ subscribe: jasmine.createSpy() }),
    },
    subscribe: jasmine.createSpy(),
    unsubscribe: jasmine.createSpy(),
    _subscriptions: jasmine.createSpy(),
    _parentOrParents: jasmine.createSpy(),
    closed: jasmine.createSpy(),
  };

  const mockConfirmationModalSubscription = {
    subscribe: jasmine.createSpy(),
    unsubscribe: jasmine.createSpy(),
    _subscriptions: jasmine.createSpy(),
    _parentOrParents: jasmine.createSpy(),
    closed: jasmine.createSpy(),
  };

  var listOfPatientPlans = [
    { BenefitPlanId: 'c6f80e36-0287-4666-9da7-2231d8125c36', Priority: 0 },
    { BenefitPlanId: 'f5fe735d-9275-4d8d-9343-94d195fa6e1d', Priority: 1 },
  ];

  beforeEach(
    module('Soar.BusinessCenter', function ($provide) {
      modalFactory = {
        Modal: jasmine
          .createSpy('modalFactory.Modal')
          .and.callFake(function () {
            modalFactoryDeferred = q.defer();
            modalFactoryDeferred.resolve(1);
            return {
              result: modalFactoryDeferred.promise,
              then: function () {},
            };
          }),
      };
      $provide.value('ModalFactory', modalFactory);

      mockAddPatientBenefitPlansModalService = {
        open: jasmine.createSpy().and.returnValue({
          events: {
            pipe: jasmine
              .createSpy()
              .and.returnValue({ subscribe: jasmine.createSpy() }),
            subscribe: jasmine.createSpy(),
          },
          subscribe: jasmine.createSpy(),
          closed: jasmine.createSpy(),
        }),
      };
      $provide.value(
        'AddPatientBenefitPlansModalService',
        mockAddPatientBenefitPlansModalService
      );
    })
  );

  beforeEach(inject(function ($rootScope, $controller, $q) {
    scope = $rootScope.$new();
    q = $q;

    scope.person = {
      PatientId: 'ab73aac99833344',
      Profile: {
        FirstName: 'Test',
        LastName: 'Name',
      },
      BenefitPlans: listOfPatientPlans,
    };

    routeParams = {};

    patSecurityService = {};

    patientServices = {
      Patients: {
        get: jasmine.createSpy(),
      },
      PatientBenefitPlan: {
        get: jasmine.createSpy(),
      },
    };

    commonServices = {
      Insurance: {
        BenefitPlan: {
          get: jasmine.createSpy(),
        },
        Carrier: {
          get: jasmine.createSpy(),
        },
      },
    };

    listHelper = {
      findIndexByFieldValue: jasmine.createSpy(),
      findItemByFieldValue: jasmine.createSpy(),
    };

    ctrl = $controller('PatientAccountInsuranceController', {
      $scope: scope,
      $routeParams: routeParams,
      patSecurityService: patSecurityService,
      PatientServices: patientServices,
      CommonServices: commonServices,
      ModalFactory: modalFactory,
      ListHelper: listHelper,
    });
  }));

  it('controller should exist', function () {
    expect(ctrl).not.toBeNull();
  });

  describe('openInsuranceModal ->', function () {
    beforeEach(() => {
      spyOn(ctrl, 'calcNextAvailablePriority').and.returnValue(2);
    });

    it('should call modalDlg', function () {
      scope.openInsuranceModal();
      expect(mockAddPatientBenefitPlansModalService.open).toHaveBeenCalled();
    });
  });

  describe('ctrl.newPlanAdded ->', function () {
    let newPatientBenefitPlans = [];
    beforeEach(() => {
      spyOn(ctrl, 'getPrimaryPlan');
      newPatientBenefitPlans = [{ BenefitPlanId: 3 }, { BenefitPlanId: 4 }];
      scope.patientBenefitPlans = [{ BenefitPlanId: 1 }, { BenefitPlanId: 2 }];
    });

    it('should add any new plans to patientBenefitPlans', function () {
      ctrl.newPlanAdded(newPatientBenefitPlans);
      expect(scope.patientBenefitPlans.length).toBe(4);
    });

    it('should call ctrl.getPrimaryPlan();', function () {
      ctrl.newPlanAdded(newPatientBenefitPlans);
      expect(ctrl.getPrimaryPlan).toHaveBeenCalled();
    });
  });
});
