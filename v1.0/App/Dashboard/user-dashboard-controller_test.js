import { of } from 'rxjs';

describe('user-dashboard-controller ->', function () {
  var ctrl,
    scope,
    localize,
    toastrFactory,
    deferred,
    dashboardService,
    userServices,
    locationService,
    referenceDataService,
    q,
    compile,
    appointmentViewVisibleService,
    practiceSettingsService,
    appointmentViewDataLoadingService,
    appointmentViewLoadingService;

  var dashboardId = 2;
  var batchIds = [1, 2, 3, 4];
  var ofcLocation = { id: 1 };

  beforeEach(
    module('Soar.Dashboard', function ($provide) {
      referenceDataService = {
        get: jasmine.createSpy().and.callFake(function () {
          return [];
        }),
        entityNames: {
          users: 'users',
        },
      };

      $provide.value('referenceDataService', referenceDataService);

      appointmentViewVisibleService = {
        changeAppointmentViewVisible: jasmine.createSpy(),
        setAppointmentViewVisible: jasmine.createSpy(),
        setSecondaryAppointmentViewVisible: jasmine.createSpy(),
        registerObserver: jasmine.createSpy(),
        clearObserver: jasmine.createSpy(),
      };

      $provide.value(
        'AppointmentViewVisibleService',
        appointmentViewVisibleService
      );

      practiceSettingsService = {
        get: jasmine.createSpy().and.returnValue(of({
          DefaultTimeIncrement: 15
        }))
      }
      
      $provide.value(
        'PracticeSettingsService',
        practiceSettingsService,
      );

      appointmentViewDataLoadingService = {
        getViewData: jasmine
          .createSpy('appointmentViewDataLoadingService.getViewData')
          .and.callFake(function () {
            return {
              then: function () {},
            };
          }),
      };

      $provide.value(
        'AppointmentViewDataLoadingService',
        appointmentViewDataLoadingService
      );

      appointmentViewLoadingService = {};

      $provide.value(
        'AppointmentViewLoadingService',
        appointmentViewLoadingService
      );
    })
  );
  beforeEach(inject(function ($rootScope, $controller, $q) {
    q = $q;
    deferred = q.defer();
    $rootScope.patAuthContext = {
      isAuthorized: true,
      userInfo: {
        userid: null,
      },
    };
    scope = $rootScope.$new();

    //mock for localize
    localize = {
      getLocalizedString: jasmine.createSpy().and.returnValue(''),
    };

    //mock for toastrFactory
    toastrFactory = {
      success: jasmine.createSpy(),
      error: jasmine.createSpy(),
    };

    dashboardService = {
      BatchLoader: {
        Init: jasmine
          .createSpy()
          .and.returnValue({ $promise: deferred.promise }),
      },
      DashboardId: 1,
    };

    locationService = {
      getCurrentLocation: jasmine
        .createSpy()
        .and.returnValue({ $promise: deferred.promise }),
    };

    userServices = {
      Users: {
        get: jasmine
          .createSpy()
          .and.returnValue({ $promise: { then: jasmine.createSpy() } }),
      },
      LoginActivityEvent: {
        create: jasmine
          .createSpy()
          .and.returnValue({ $promise: deferred.promise }),
      },
    };
    //mock controller
    ctrl = $controller('UserDashboardController', {
      $scope: scope,
      toastrFactory: toastrFactory,
      DashboardService: dashboardService,
      UserServices: userServices,
      locationService: locationService,
      localize: localize
    });
  }));

  describe('initial values -> ', function () {
    it('controller should exist', function () {
      expect(ctrl).not.toBeNull();
    });

    it('should have injected services ', function () {
      expect(dashboardService).not.toBeNull();
      expect(userServices).not.toBeNull();
      expect(locationService).not.toBeNull();
    });

    it('should set scope properties', function () {
      expect(dashboardId).toBe(2);
      expect(batchIds).toEqual([1, 2, 3, 4]);
    });
  });

  describe('init function ->', function () {
    it('should call referenceDataService.get', function () {
      expect(referenceDataService.get).toHaveBeenCalled();
    });

    it('userSuccess should be called', function () {
      var user = {
        userId: 'd0be7456-e01b-e811-b7c1-a4db3021bfa0',
        LastName: 'Swift',
        FirstName: 'Mary Beth',
        UserCode: 'SWIMA1',
      };
      var response = { Value: user };
      ctrl.userSuccess(response);
      expect(scope.displayName).toEqual('Mary Beth Swift - SWIMA1');
      expect(userServices.LoginActivityEvent.create).toHaveBeenCalled();
      expect(dashboardService.BatchLoader.Init).toHaveBeenCalled();
    });

    it('should initialize definition variables', function () {
      ctrl.location = { id: 123 };
      var widget = { ItemId: 1, Locations: [] };
      var definition = { Items: [{ widget }] };
      ctrl.dashboardLoadSuccess(definition);
      expect(scope.dashboardDefinition).toEqual(definition);
      expect(scope.dashboardDefinition.Items[0].Locations[0]).toEqual(123);
    });

    it('show toaster message if get dashboard definitiion failed', function () {
      ctrl.dashboardLoadFailed();
      expect(toastrFactory.error).toHaveBeenCalled();
    });
  });
});
