describe('hygiene-vs-doctor-net-production-half-donut-widget-controller', function () {
  var ctrl,
    scope,
    widgetInitStatus,
    widgetFactory,
    reportsFactory,
    q,
    timeout,
    deferred;
  beforeEach(module('Soar.Dashboard'));
  beforeEach(module('Soar.Widget'));
  beforeEach(inject(function ($rootScope, $controller, $q, $timeout) {
    q = $q;
    deferred = q.defer();
    scope = $rootScope.$new();
    timeout = $timeout;

    scope.data = {
      initData: {
        Appointment: null,
        DefaultFilter: 'YTD',
        Data: {
          YTD: {
            SeriesData: [
              {
                Category: 'Hygienist',
                Color: '#30AFCD',
                Count: 0,
                Label: '100.00 %',
                SeriesName: null,
                Value: 1920,
              },
              {
                Category: 'Doctor',
                Color: '#AEB5BA',
                Count: 0,
                Label: '0.00 %',
                SeriesName: null,
                Value: 0,
              },
              {
                Category: 'Total Production',
                Color: null,
                Count: 0,
                Label: '$1,920.00',
                SeriesName: '_hole_',
                Value: 1920,
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
      Title: 'Hygiene Vs Doctor Net',
      Locations: [{ 0: 1 }],
    };

    widgetInitStatus = {
      ToLoad: 0,
      Loading: 1,
      Loaded: 2,
    };

    widgetFactory = {
      GetHygieneVsDoctorNetProduction: jasmine.createSpy().and.returnValue({
        then: jasmine
          .createSpy()
          .and.returnValue({ Value: scope.data.initData }),
      }),
      GetReportFilterDtoForHygieneVsDoctorReport: jasmine
        .createSpy()
        .and.returnValue({
          then: jasmine.createSpy(),
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

    ctrl = $controller(
      'HygieneVsDoctorNetProductionHalfDonutWidgetController',
      {
        $scope: scope,
        WidgetInitStatus: widgetInitStatus,
        WidgetFactory: widgetFactory,
        ReportsFactory: reportsFactory,
        $timeout: timeout,
      }
    );
  }));

  describe('initial values -> ', function () {
    it('controller should exist', function () {
      expect(ctrl).not.toBeNull();
    });

    it('should have injected services ', function () {
      expect(widgetFactory).not.toBeNull();
      expect(widgetInitStatus).not.toBeNull();
      expect(reportsFactory).not.toBeNull();
    });
  });

  describe('processInitMode function ->', function () {
    it('processInitMode should be called', function () {
      var initMode = 0;
      ctrl.processInitMode(initMode);
      var filterResult = widgetFactory.GetFilterDto(
        scope.hygieneVsDoctorNetProductionCurrentFilter,
        scope.data.Locations,
        null
      );
      expect(
        widgetFactory.GetHygieneVsDoctorNetProduction
      ).toHaveBeenCalledWith(filterResult);
    });

    it('processInitMode should be called', function () {
      var initMode = 2;
      ctrl.processInitMode(initMode);
      timeout.flush(100);
      expect(scope.locations[0][0]).toEqual(1);
      expect(scope.hygieneVsDoctorNetProductionFilters[0].name[0]).toEqual(
        'MTD'
      );
      expect(scope.hygieneVsDoctorNetProductionFilters[0].value[0]).toEqual(
        'MTD'
      );
      expect(scope.hygieneVsDoctorNetProductionFilters[1].name[1]).toEqual(
        'YTD'
      );
      expect(scope.hygieneVsDoctorNetProductionFilters[1].value[1]).toEqual(
        'YTD'
      );
      expect(scope.hygieneVsDoctorNetProductionFilters[2].name[2]).toEqual(
        'Last Month'
      );
      expect(scope.hygieneVsDoctorNetProductionFilters[2].value[2]).toEqual(
        'Last Month'
      );
      expect(scope.hygieneVsDoctorNetProductionFilters[3].name[3]).toEqual(
        'Last Year'
      );
      expect(scope.hygieneVsDoctorNetProductionFilters[3].value[3]).toEqual(
        'Last Year'
      );
      expect(scope.hygieneVsDoctorNetProductionCurrentFilter).toEqual('YTD');
      expect(
        scope.hygieneVsDoctorNetProductionSeriesData[2].SeriesName
      ).toEqual('_hole_');
      expect(scope.hygieneVsDoctorNetProductionSeriesData[2].Category).toEqual(
        'Total Production'
      );
      expect(scope.hygieneVsDoctorNetProductionSeriesData[2].label).toEqual(
        '$1,920.00'
      );
      expect(scope.hygieneVsDoctorNetProductionSeriesData[2].Value).toEqual(
        1920
      );
    });
  });

  describe('hygieneVsDoctorNetProductionChangeFilter function ->', function () {
    it('hygieneVsDoctorNetProductionChangeFilter should be called', function () {
      var filter = 'MTD';
      scope.hygieneVsDoctorNetProductionChangeFilter();
      ctrl.getDataFromServer();
      var filterResult = widgetFactory.GetFilterDto(
        scope.hygieneVsDoctorNetProductionCurrentFilter,
        scope.data.Locations,
        null
      );
      expect(
        widgetFactory.GetHygieneVsDoctorNetProduction
      ).toHaveBeenCalledWith(filterResult);
    });
  });
});
