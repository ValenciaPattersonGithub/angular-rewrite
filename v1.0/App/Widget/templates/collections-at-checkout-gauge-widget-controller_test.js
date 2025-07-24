describe('collections-at-checkout-gauge-widget-controller', function () {
  var ctrl,
    scope,
    widgetInitStatus,
    factory,
    localize,
    reportsFactory,
    widgetDateFilterValues,
    q,
    timeout,
    deferred;
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
        DefaultFilter: 'YTD',
        Data: {
          YTD: {
            SeriesData: [
              {
                Category: 'CollectionsAtCheckout',
                Color: '#30AFCD',
                Count: 0,
                Label: null,
                SeriesName: 'CollectionsAtCheckout',
                Value: 4679342.29,
              },
              {
                Category: 'PatientBalance',
                Color: '#AEB5BA',
                Count: 0,
                Label: null,
                SeriesName: 'CollectionsAtCheckout',
                Value: 6834114.22,
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
      Title: 'Collection at Checkout',
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
      GetCollectionsAtCheckout: jasmine.createSpy().and.returnValue({
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
    };

    ctrl = $controller('CollectionsAtCheckoutGaugeWidgetController', {
      $scope: scope,
      WidgetInitStatus: widgetInitStatus,
      WidgetFactory: factory,
      $timeout: timeout,
      localize: localize,
      ReportsFactory: reportsFactory,
      WidgetDateFilterValues: widgetDateFilterValues,
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
      expect(factory.GetCollectionsAtCheckout).toHaveBeenCalledWith(
        filterResult
      );
    });

    it('processInitMode should be called', function () {
      var initMode = 2;
      ctrl.processInitMode(initMode);
      timeout.flush(300);
      expect(scope.gaugeDataCheckout[2].SeriesName).toEqual('_hole_');
      expect(scope.gaugeDataCheckout[2].Category).toEqual('$4,679,342.29');
      expect(scope.gaugeDataCheckout[2].label).toEqual('68%');
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
      expect(factory.GetCollectionsAtCheckout).toHaveBeenCalledWith(
        filterResult
      );
    });
  });
});
