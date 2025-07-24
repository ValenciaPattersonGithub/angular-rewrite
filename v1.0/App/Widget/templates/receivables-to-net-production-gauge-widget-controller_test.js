describe('receivables-to-net-production-gauge-widget-controller', function () {
  var ctrl,
    scope,
    factory,
    localize,
    widgetInitStatus,
    widgetDateFilterValues,
    reportsFactory,
    q,
    timeout,
    deferred;
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
                Category: 'Receivables',
                Color: '#30AFCD',
                Count: 0,
                Label: null,
                SeriesName: 'ReceivablesToNetProduction',
                Value: 2162909.79,
              },
              {
                Category: 'Production',
                Color: '#AEB5BA',
                Count: 0,
                Label: null,
                SeriesName: 'ReceivablesToNetProduction',
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
      Title: 'A/R to Net Production',
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
      GetReceivablesToNetProduction: jasmine.createSpy().and.returnValue({
        then: jasmine
          .createSpy()
          .and.returnValue({ Value: scope.data.initData }),
      }),
      GetFilterDto: jasmine.createSpy().and.returnValue({
        then: jasmine.createSpy(),
      }),
    };

    reportsFactory = {
      GetSpecificReports: jasmine.createSpy().and.returnValue({
        then: jasmine.createSpy(),
      }),
      GetAmfaAbbrev: jasmine.createSpy().and.returnValue({
        then: jasmine.createSpy(),
      }),
      OpenReportPageWithContext: jasmine.createSpy().and.returnValue({
        then: jasmine.createSpy(),
      }),
      ClearReportContext: jasmine.createSpy().and.returnValue({
        then: jasmine.createSpy(),
      }),
    };

    ctrl = $controller('ReceivablesToNetProductionGaugeWidgetController', {
      $scope: scope,
      WidgetFactory: factory,
      localize: localize,
      WidgetInitStatus: widgetInitStatus,
      WidgetDateFilterValues: widgetDateFilterValues,
      ReportsFactory: reportsFactory,
      $timeout: timeout,
    });
  }));

  describe('initial values -> ', function () {
    it('controller should exist', function () {
      expect(ctrl).not.toBeNull();
    });

    it('should have injected services ', function () {
      expect(factory).not.toBeNull();
      expect(widgetInitStatus).not.toBeNull();
      expect(reportsFactory).not.toBeNull();
      expect(localize).not.toBeNull();
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
      expect(factory.GetReceivablesToNetProduction).toHaveBeenCalledWith(
        filterResult
      );
    });

    it('processInitMode should be called', function () {
      var initMode = 2;
      ctrl.processInitMode(initMode);
      timeout.flush(200);
      expect(scope.gaugeData[0].Category).toEqual('Receivables');
      expect(scope.gaugeData[0].Value).toEqual(2162909.79);
      expect(scope.gaugeData[1].Value).toEqual(4685583.71);
      expect(scope.gaugeData[2].SeriesName).toEqual('_hole_');
      expect(scope.gaugeData[2].Category).toEqual('of yearly production');
      expect(scope.gaugeData[2].label).toEqual('32%');
    });
  });

  describe('onDateFilterChange function ->', function () {
    it('onDateFilterChange should be called', function () {
      var dateOption = 'YTD';
      scope.dateFilterRec = 'MTD';
      scope.onDateFilterChange(dateOption);
      var filterResult = factory.GetFilterDto(
        dateOption,
        scope.data.Locations,
        null
      );
      expect(factory.GetReceivablesToNetProduction).toHaveBeenCalledWith(
        filterResult
      );
    });
  });
});
