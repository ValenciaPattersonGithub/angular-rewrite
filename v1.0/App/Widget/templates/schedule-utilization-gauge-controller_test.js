describe('schedule-utilization-gauge-controller', function () {
  var ctrl,
    scope,
    widgetInitStatus,
    widgetFactory,
    localize,
    q,
    timeout,
    deferred,
    featureFlagService,
    fuseFlag;
  beforeEach(module('Soar.Dashboard'));
  beforeEach(module('Soar.Widget'));
  beforeEach(inject(function ($rootScope, $controller, $q, $timeout) {
    q = $q;
    timeout = $timeout;
    deferred = q.defer();
    scope = $rootScope.$new();

    scope.data = {
      initData: {
        Appointment: null,
        DefaultFilter: 'MTD',
        Data: {
          MTD: {
            SeriesData: [
              {
                Category: 'TotalMinutesBooked',
                Color: null,
                Count: 10,
                Label: null,
                SeriesName: 'ScheduleUtilization',
                Value: 0,
              },
              {
                Category: 'TotalMinutesAvailable',
                Color: null,
                Count: 10,
                Label: null,
                SeriesName: 'ScheduleUtilization',
                Value: 69120,
              },
            ],
          },
          TotalValue: 0,
        },
        FilterList: [
          { 0: 'MTD' },
          { 1: 'YTD' },
          { 2: 'Last Month' },
          { 3: 'Last Year' },
        ],
      },
      Title: 'Schedule Utilization',
      Locations: [{ 0: 1 }],
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

    widgetFactory = {
      GetScheduleUtilization: jasmine.createSpy().and.returnValue({
        then: jasmine
          .createSpy()
          .and.returnValue({ Value: scope.data.initData }),
      }),
      GetFilterDto: jasmine.createSpy().and.returnValue({
        then: jasmine.createSpy(),
      }),
    };
    featureFlagService = {
        getOnce$: jasmine.createSpy().and.returnValue({ subscribe: jasmine.createSpy() })
    };

    fuseFlag = {
        DashboardScheduleUtilizationWidgetMvp: jasmine.createSpy().and.returnValue({ subscribe: jasmine.createSpy() })
    };
    ctrl = $controller('ScheduleUtilizationGaugeController', {
      $scope: scope,
      WidgetInitStatus: widgetInitStatus,
      WidgetFactory: widgetFactory,
      $timeout: timeout,
      localize: localize,
      FeatureFlagService: featureFlagService,
      FuseFlag: fuseFlag
    });
  }));

  describe('initial values -> ', function () {
    it('controller should exist', function () {
      expect(ctrl).not.toBeNull();
    });

    it('should have injected services ', function () {
      expect(widgetFactory).not.toBeNull();
      expect(widgetInitStatus).not.toBeNull();
    });
  });

  describe('processInitMode function ->', function () {
    it('processInitMode should be called', function () {
      var initMode = 0;
      var dateOption = undefined;
      scope.providerFilter = undefined;
      scope.schedUtilFromDate = null;
      scope.schedUtilToDate = null;
      ctrl.processInitMode(initMode);
      var filterResult = widgetFactory.GetFilterDto(
        dateOption,
        scope.data.Locations,
        [scope.providerFilter],
        scope.schedUtilFromDate,
        scope.schedUtilToDate,
        false
      );
      expect(widgetFactory.GetScheduleUtilization).toHaveBeenCalledWith(
        filterResult
      );
    });

    it('processInitMode should be called', function () {
      var initMode = 2;
      ctrl.processInitMode(initMode);
      expect(scope.schedUtilData).not.toBe(null);
      timeout.flush(300);
      expect(scope.schedUtilDateFilter).toEqual('MTD');
      expect(scope.schedUtilUtilizationData[2].SeriesName).toEqual('_hole_');
      expect(scope.schedUtilUtilizationData[2].Category).toEqual(
        localize.getLocalizedString('Booked')
      );
    });
  });
});
