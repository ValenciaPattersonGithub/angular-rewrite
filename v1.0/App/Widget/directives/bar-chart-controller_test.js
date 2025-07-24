describe('bar-chart-controller', function () {
  var ctrl,
    scope,
    localize,
    filter,
    timeout,
    widgetBarChartStyle,
    reportsFactory,
    widgetFactory,
    q,
    deferred;

  var modelMock = {
    reportId: 21,
    locationIds: [{ 0: 1 }],
    Data: {
      YTD: {
        SeriesData: [
          {
            Category: 'Jan',
            Color: '#7FDE8E',
            Count: 0,
            Label: null,
            SeriesName: null,
            Value: 0,
          },
          {
            Category: 'Feb',
            Color: '#7FDE8E',
            Count: 0,
            Label: null,
            SeriesName: null,
            Value: 0,
          },
          {
            Category: 'Mar',
            Color: '#7FDE8E',
            Count: 0,
            Label: null,
            SeriesName: null,
            Value: 0,
          },
          {
            Category: 'Apr',
            Color: '#7FDE8E',
            Count: 0,
            Label: null,
            SeriesName: null,
            Value: 0,
          },
          {
            Category: 'May',
            Color: '#7FDE8E',
            Count: 0,
            Label: null,
            SeriesName: null,
            Value: 0,
          },
          {
            Category: 'Jun',
            Color: '#7FDE8E',
            Count: 0,
            Label: null,
            SeriesName: null,
            Value: 0,
          },
          {
            Category: 'Jul',
            Color: '#7FDE8E',
            Count: 0,
            Label: null,
            SeriesName: null,
            Value: 0,
          },
          {
            Category: 'Aug',
            Color: '#7FDE8E',
            Count: 0,
            Label: null,
            SeriesName: null,
            Value: 0,
          },
          {
            Category: 'Sep',
            Color: '#7FDE8E',
            Count: 0,
            Label: null,
            SeriesName: null,
            Value: 0,
          },
          {
            Category: 'Oct',
            Color: '#7FDE8E',
            Count: 0,
            Label: null,
            SeriesName: null,
            Value: 0,
          },
          {
            Category: 'Nov',
            Color: '#7FDE8E',
            Count: 0,
            Label: null,
            SeriesName: null,
            Value: 0,
          },
          {
            Category: 'Dec',
            Color: '#7FDE8E',
            Count: 0,
            Label: null,
            SeriesName: null,
            Value: 0,
          },
        ],
        TotalValue: 0,
      },
    },
    FilterList: [
      { 0: 'MTD' },
      { 1: 'YTD' },
      { 2: 'Last Month' },
      { 3: 'Last Year' },
    ],
    title: 'Net Production',
    isCurrency: true,
    DefaultFilter: 'YTD',
    barStyle: 1,
  };

  var reportFilterDTOMock = {
    PresetFilterDto: {
      StartDate: 12 - 01 - 2018,
    },
  };

  beforeEach(module('Soar.Dashboard'));
  beforeEach(module('Soar.Widget'));
  beforeEach(inject(function (
    $rootScope,
    $controller,
    $timeout,
    $injector,
    $q
  ) {
    filter = $injector.get('$filter');
    q = $q;
    deferred = q.defer();
    scope = $rootScope.$new();

    widgetBarChartStyle = {
      Flat: 0,
      Pillar: 1,
    };

    widgetFactory = {
      GetReportFilterDtoForBarChart: jasmine
        .createSpy()
        .and.returnValue(reportFilterDTOMock),
    };

    reportsFactory = {
      GetSpecificReports: jasmine.createSpy().and.returnValue({
        then: jasmine.createSpy(),
      }),
      GetAmfaAbbrev: jasmine.createSpy(),
      OpenReportPageWithContext: jasmine.createSpy(),
      ClearReportContext: jasmine.createSpy(),
    };

    localize = {
      getLocalizedString: jasmine.createSpy().and.returnValue(''),
    };

    ctrl = $controller('BarChartController', {
      $scope: scope,
      localize: localize,
      WidgetBarChartStyle: widgetBarChartStyle,
      ReportsFactory: reportsFactory,
      WidgetFactory: widgetFactory,
    });
    timeout = $timeout;
  }));

  describe('initial values -> ', function () {
    it('controller should exist', function () {
      expect(ctrl).not.toBeNull();
    });

    it('should have injected services ', function () {
      expect(widgetFactory).not.toBeNull();
      expect(reportsFactory).not.toBeNull();
      expect(widgetBarChartStyle).not.toBeNull();
    });

    it('should set scope properties', function () {
      expect(scope.dateFilter).toBeNull();
      expect(scope.totalValue).toEqual(0);
      expect(scope.dropdownOptions).toBeNull();
      expect(scope.showDropdown).toBe(true);
    });
  });

  describe('scope.drilldown ->', function () {
    it('drilldown should be called', function () {
      var model = modelMock;
      var e = { category: 'Apr', value: 1234570 };
      ctrl.patientSeenId = 14;
      ctrl.newPatientsByComprehensiveExamReportId = 16;
      ctrl.ProjectedNetProductionReportId = 56;
      ctrl.AdjustmentsByProviderReportId = 22;
      ctrl.setModel(model);
      scope.drilldown(e);
      expect(filter).not.toBeNull();
      expect(filter.PresetFilterDto).not.toBeNull();
      expect(reportsFactory.GetSpecificReports).toHaveBeenCalledWith([
        model.reportId,
      ]);
    });
  });
});
