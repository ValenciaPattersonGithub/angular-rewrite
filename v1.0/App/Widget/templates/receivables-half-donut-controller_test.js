describe('receivables-half-donut-controller', function () {
    var ctrl, scope, widgetInitStatus, factory, localize, window, q, deferred, locationService, featureFlagService, fuseFlag;
    var currentLocation = { id: 2 };
  beforeEach(module('Soar.Dashboard'));
    beforeEach(module('Soar.Widget'));
    beforeEach(
        module('Soar.BusinessCenter', function ($provide) {
            locationService = {
                getCurrentLocation: jasmine
                    .createSpy()
                    .and.returnValue(currentLocation),
            };
            $provide.value('locationService', locationService);
        })
    );
  beforeEach(inject(function ($rootScope, $controller, $q, $window) {
    q = $q;
    deferred = q.defer();
    scope = $rootScope.$new();
    window = $window;

    scope.data = {
      initData: {
        SeriesData: [
          {
            Category: '0-30 days',
            Color: null,
            Count: 0,
            Label: null,
            SeriesName: 'Receivables',
            Value: 716579.54,
          },
          {
            Category: '31-60 days',
            Color: null,
            Count: 0,
            Label: null,
            SeriesName: 'Receivables',
            Value: 627075.25,
          },
          {
            Category: '61-90 days',
            Color: null,
            Count: 0,
            Label: null,
            SeriesName: 'Receivables',
            Value: 571785,
          },
          {
            Category: '> 90 days',
            Color: null,
            Count: 0,
            Label: null,
            SeriesName: 'Receivables',
            Value: 249310,
          },
        ],
        TotalValue: 0,
      },
      Title: 'Receivables',
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

    factory = {
      GetReceivables: jasmine.createSpy().and.returnValue({
        then: jasmine
          .createSpy()
          .and.returnValue({ Value: scope.data.initData }),
      }),
      GetFilterDto: jasmine.createSpy().and.returnValue({
        then: jasmine.createSpy(),
      }),
      GetUserDashboardReceivables: jasmine.createSpy().and.returnValue({
        then: jasmine
          .createSpy()
          .and.returnValue({ Value: scope.data.initData }),
      }),
      };

    featureFlagService = {
        getOnce$: jasmine.createSpy().and.returnValue({ subscribe: jasmine.createSpy() })
    };

    fuseFlag = {
        DashboardReceivablesWidgetMvp: jasmine.createSpy().and.returnValue({ subscribe: jasmine.createSpy() })
    };

    ctrl = $controller('ReceivablesHalfDonutController', {
      $scope: scope,
      WidgetInitStatus: widgetInitStatus,
      WidgetFactory: factory,
      localize: localize,
      FeatureFlagService: featureFlagService,
      FuseFlag: fuseFlag
    });
  }));

  describe('initial values -> ', function () {
    it('controller should exist', function () {
        expect(ctrl).not.toBeNull();
        expect(scope.selectedDisplayType).toBe(0);
        expect(scope.selectedType).toBe(0);
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
      var filters = factory.GetFilterDto(null, scope.data.Locations, null);
      expect(factory.GetUserDashboardReceivables).toHaveBeenCalledWith(filters);
    });
  });

  describe('filterChanged function ->', function () {
    it('filterChanged should be called', function () {
      var type = 'Patient Only';
      scope.filterChanged();
      var filters = factory.GetFilterDto(null, scope.data.Locations, null);
      expect(factory.GetUserDashboardReceivables).toHaveBeenCalledWith(filters);
    });
  });
});
