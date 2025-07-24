describe('AppointmentPlannedServicesController ->', function () {
  var ctrl,
    scope,
    modalFactory,
    localize,
    staticData,
    usersFactory,
    referenceDataService;

  beforeEach(module('Soar.Common'));
  beforeEach(module('common.factories'));
  beforeEach(module('Soar.Schedule'));

  // create controller and scope
  beforeEach(inject(function ($rootScope, $controller) {
    scope = $rootScope.$new();
    scope.providers = { filter: function () {} };
    scope = scope.$new().$new().$new().$new().$new().$new();
    scope.onRemoveService = jasmine.createSpy();

    //mock of modalFactory
    modalFactory = {
      CancelModal: jasmine.createSpy().and.returnValue({
        then: jasmine.createSpy(),
      }),
      Modal: jasmine.createSpy().and.returnValue({
        result: { then: jasmine.createSpy() },
      }),
      ConfirmModal: jasmine.createSpy().and.returnValue({
        then: jasmine.createSpy(),
      }),
    };

    // mock of localize
    localize = {
      getLocalizedString: jasmine.createSpy().and.returnValue('same value'),
    };

    staticData = {
      TeethDefinitions: jasmine
        .createSpy()
        .and.returnValue({ then: function () {} }),
    };

    sessionStorage.getItem = jasmine.createSpy().and.returnValue(null);

    usersFactory = {
      LoadedProviders: {
        filter: jasmine.createSpy(),
      },
    };

    var mockLocations = [
      {
        LocationId: 1,
        NameAbbreviation: 'Here',
        Timezone: 'Eastern Daylight Time',
        NameLine1: 'Line',
      },
    ];

    referenceDataService = {
      entityNames: {
        locations: 'locations',
      },
      get: function (refType) {
        if (refType === 'locations') {
          return mockLocations;
        } else {
          return {};
        }
      },
    };

    // create controller
    ctrl = $controller('AppointmentPlannedServicesController', {
      $scope: scope,
      ModalFactory: modalFactory,
      localize: localize,
      StaticData: staticData,
      UsersFactory: usersFactory,
      referenceDataService: referenceDataService,
    });
  }));

  //controller
  it('AppointmentPlannedServicesController : should check if controller exists', function () {
    expect(ctrl).not.toBeNull();
    expect(ctrl).not.toBeUndefined();
  });

  describe(' getTotal function ->', function () {
    it('should return total fee of all services', function () {
      scope.plannedServices = [
        { Amount: 20.0, LocationId: 1 },
        { Amount: 40.0, LocationId: 1 },
      ];
      scope.getTotal();
      expect(scope.feeTotal).toEqual(60.0);
    });
  });

  describe('removeAppointmentService Function ->', function () {
    it('should call localize and ConfirmModal methods', function () {
      scope.removeAppointmentService();
      expect(localize.getLocalizedString).toHaveBeenCalled();
      expect(modalFactory.ConfirmModal).toHaveBeenCalled();
    });
  });

  describe('continueWithRemove Function ->', function () {
    it('should call onRemoveService', function () {
      ctrl.continueWithRemove({});
      expect(scope.onRemoveService).toHaveBeenCalled();
    });
  });

  describe('$watch discountTypeId ->', function () {
    it('should call getTotal() planned service collection changed', function () {
      scope.getTotal = jasmine.createSpy();
      scope.plannedServices = [{ Fee: 20.0 }, { Fee: 40.0 }];
      scope.$apply();
      expect(scope.getTotal).toHaveBeenCalled();
    });
  });
});
