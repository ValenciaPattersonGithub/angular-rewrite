describe('dashboard-container', function () {
  var ctrl,
    scope,
    localize,
    location,
    toastrFactory,
    deferred,
    dashboardService,
    widgetInitStatus,
    q;

  var value = 1;
  var id = 1;

  var response = { Value: {} };
  beforeEach(module('Soar.Dashboard'));
  beforeEach(inject(function ($rootScope, $controller, $q) {
    q = $q;
    deferred = q.defer();
    scope = $rootScope.$new();

    scope.data = {
      Items: [
        {
          ItemId: 1,
          Title: 'Gross Production',
          Position: [{ 0: 1 }, { 1: 3 }],
          IsHidden: true,
        },
        {
          ItemId: 2,
          Title: 'Net Production',
          Position: [{ 0: 2 }, { 1: 6 }],
          IsHidden: false,
        },
      ],
    };
    //mock for localize
    localize = {
      getLocalizedString: jasmine.createSpy().and.returnValue(''),
    };
    //mock for location
    location = {
      url: jasmine.createSpy('$location.url'),
      search: jasmine.createSpy('$location.search'),
      path: jasmine.createSpy('$location.path'),
    };
    //mock for toastrFactory
    toastrFactory = {
      success: jasmine.createSpy(),
      error: jasmine.createSpy(),
    };

    widgetInitStatus = {
      ToLoad: 0,
      Loading: 1,
      Loaded: 2,
    };

    dashboardService = {
      DashboardDefinitions: {
        save: jasmine
          .createSpy()
          .and.returnValue({ $promise: deferred.promise }),
      },
      DashboardId: 1,
    };

    //mock controller
    ctrl = $controller('DashboardContainerController', {
      $scope: scope,
      toastrFactory: toastrFactory,
      DashboardService: dashboardService,
      widgetInitStatus: widgetInitStatus,
      localize: localize,
      $location: location,
    });
  }));

  describe('initial values -> ', function () {
    it('controller should exist', function () {
      expect(ctrl).not.toBeNull();
    });

    it('should have injected services ', function () {
      expect(toastrFactory).not.toBeNull();
      expect(dashboardService).not.toBeNull();
      expect(widgetInitStatus).not.toBeNull();
      expect(localize).not.toBeNull();
    });

    it('should set scope properties', function () {
      expect(scope.hiddenFilter).toBeNull();
      expect(scope.saveLayoutDisabled).toBe(true);
    });
  });

  describe('scope.changeFilter ->', function () {
    it('changeFilter should be called', function () {
      var value = { dataItem: { Id: 1 } };
      ctrl.createGridster = jasmine.createSpy();
      scope.changeFilter(value);
      expect(scope.saveLayoutDisabled).toBe(false);
      expect(ctrl.createGridster).toHaveBeenCalled();
    });
  });

  describe('scope.onClose ->', function () {
    it('onClose should be called', function () {
      var id = 1;
      ctrl.createGridster = jasmine.createSpy();
      scope.onClose(id);
      expect(scope.saveLayoutDisabled).toBe(false);
      expect(ctrl.createGridster).toHaveBeenCalled();
    });
  });

  describe('saveLayout function ->', function () {
    it('should call DashboardService.DashboardDefinitions.save', function () {
      scope.saveLayoutDisabled = false;
      scope.saveLayout();
      expect(dashboardService.DashboardDefinitions.save).toHaveBeenCalled();
      // expect(scope.saveLayoutDisabled).toBe(true);
    });
  });
});
