describe('hygiene-retention-half-donut-controller', function () {
  var ctrl, scope, widgetInitStatus, factory, localize, q, deferred;
  beforeEach(module('Soar.Dashboard'));
  beforeEach(module('Soar.Widget'));
  beforeEach(inject(function ($rootScope, $controller, $q) {
    q = $q;
    deferred = q.defer();
    scope = $rootScope.$new();

    scope.data = {
      initData: {
        Appointment: null,
        DefaultFilter: 'All',
        Data: {
          All: {
            SeriesData: [
              {
                Category: 'Unscheduled',
                Color: null,
                Count: 0,
                Label: null,
                SeriesName: 'HygieneRetention',
                Value: 1000,
              },
              {
                Category: 'Scheduled',
                Color: null,
                Count: 0,
                Label: null,
                SeriesName: 'HygieneRetention',
                Value: 2000,
              },
            ],
          },
          TotalValue: 0,
        },
        FilterList: [],
      },
      Title: 'Hygiene Retention',
      Locations: [{ 0: 1 }],
      Position: [{ 0: 0 }, { 1: 2 }],
      Size: { Height: 2, Width: 2 },
    };

    widgetInitStatus = {
      ToLoad: 0,
      Loading: 1,
      Loaded: 2,
    };

    localize = {
      getLocalizedString: jasmine
        .createSpy('localize.getLocalizedString')
        .and.callFake(function (val) {
          return val;
        }),
    };

    factory = {
      GetHygieneRetention: jasmine.createSpy().and.returnValue({
        then: jasmine
          .createSpy()
          .and.returnValue({ Value: scope.data.initData }),
      }),
      GetFilterDto: jasmine.createSpy().and.returnValue({
        then: jasmine.createSpy(),
      }),
      GetUserDashboardHygieneRetention: jasmine.createSpy().and.returnValue({
        then: jasmine
          .createSpy()
          .and.returnValue({ Value: scope.data.initData }),
      }),
    };

    ctrl = $controller('HygieneRetentionHalfDonutController', {
      $scope: scope,
      WidgetInitStatus: widgetInitStatus,
      WidgetFactory: factory,
      localize: localize,
    });
  }));

  describe('initial values -> ', function () {
    it('controller should exist', function () {
      expect(ctrl).not.toBeNull();
    });

    it('should have injected services ', function () {
      expect(factory).not.toBeNull();
      expect(widgetInitStatus).not.toBeNull();
    });
  });

  describe('processInitMode function ->', function () {
    it('processInitMode should be called', function () {
      var initMode = 0;
      ctrl.processInitMode(initMode);
      var filterResult = factory.GetFilterDto(null, scope.data.Locations, null);
      expect(factory.GetUserDashboardHygieneRetention).toHaveBeenCalledWith(
        filterResult
      );
    });

    it('processInitMode should be called', function () {
      var initMode = 2;
      ctrl.processInitMode(initMode);
      expect(scope.hygieneRetentionData[2].SeriesName).toEqual('_hole_');
      expect(scope.hygieneRetentionData[2].Category).toEqual('Retention');
      expect(scope.hygieneRetentionData[2].Value).toEqual(67);
      expect(scope.hygieneRetentionData[2].label).toEqual('67%');
    });
  });
});
