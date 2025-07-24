describe('collection-to-net-production-gauge-widget-controller', function () {
  var ctrl,
    scope,
    widgetInitStatus,
    factory,
    localize,
    widgetDateFilterValues,
    q,
    timeout,
    deferred,
    featureFlagService;
  beforeEach(module('Soar.Dashboard'));
  beforeEach(module('Soar.Widget'));
  beforeEach(inject(function ($rootScope, $controller, $q, $timeout) {
    q = $q;
    deferred = q.defer();
    timeout = $timeout;
    scope = $rootScope.$new();

    scope.data = {
      initData: {
        Appointment: null,
        DefaultFilter: 'YTD',
        Data: {
          YTD: {
            SeriesData: [
              {
                Category: 'Collections',
                Color: '#30AFCD',
                Count: 0,
                Label: null,
                SeriesName: 'CollectionsToNetProduction',
                Value: 4685583.71,
              },
              {
                Category: 'Production',
                Color: '#AEB5BA',
                Count: 0,
                Label: null,
                SeriesName: 'CollectionsToNetProduction',
                Value: 6848493.5,
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
      Title: 'Collection to Net Production',
      Locations: [{ 0: 1 }],
    };

    widgetInitStatus = {
      ToLoad: 0,
      Loading: 1,
      Loaded: 2,
    };

    widgetDateFilterValues = {
      All: 'All',
      LastMonth: 'Last Month',
      LastYear: 'Last Year',
      MonthToDate: 'MTD',
      Range: 'Date Range',
      Today: 'Today',
      YearToDate: 'YTD',
    };

    localize = {
      getLocalizedString: jasmine
        .createSpy('localize.getLocalizedString')
        .and.callFake(function (val) {
          return val;
        }),
    };

    factory = {
      GetCollectionToNetProduction: jasmine.createSpy().and.returnValue({
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
    ctrl = $controller('CollectionToNetProductionGaugeWidgetController', {
      $scope: scope,
      WidgetInitStatus: widgetInitStatus,
      WidgetFactory: factory,
      localize: localize,
      WidgetDateFilterValues: widgetDateFilterValues,
      $timeout: timeout,
      FeatureFlagService: featureFlagService,
    });
  }));

  describe('initial values -> ', function () {
    it('controller should exist', function () {
      expect(ctrl).not.toBeNull();
    });

    it('should have injected services ', function () {
      expect(factory).not.toBeNull();
      expect(widgetInitStatus).not.toBeNull();
      expect(widgetDateFilterValues).not.toBeNull();
    });
  });

  describe('processInitMode function ->', function () {
    it('processInitMode should be called', function () {
      var initMode = 0;
      var dateOption = 'YTD';
      ctrl.processInitMode(initMode);
      var filterResult = factory.GetFilterDto(
        dateOption,
        scope.data.Locations,
        null
      );
      expect(factory.GetCollectionToNetProduction).toHaveBeenCalledWith(
        filterResult
      );
    });

    it('processInitMode should be called', function () {
      var initMode = 2;
      ctrl.processInitMode(initMode);
      timeout.flush(300);
      expect(scope.gaugeData[2].SeriesName).toEqual('_hole_');
      expect(scope.gaugeData[2].Category).toEqual('of yearly production');
      expect(scope.gaugeData[2].label).toEqual('68%');
    });
  });

  describe('onDateFilterChange function ->', function () {
    it('onDateFilterChange should be called', function () {
      var dateOption = 'YTD';
      ctrl.getWidgetData(dateOption);
      var filterResult = factory.GetFilterDto(
        dateOption,
        scope.data.Locations,
        null
      );
      expect(factory.GetCollectionToNetProduction).toHaveBeenCalledWith(
        filterResult
      );
    });
  });
});
