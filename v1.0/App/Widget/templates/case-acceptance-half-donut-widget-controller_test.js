describe('case-acceptance-half-donut-widget-controller', function () {
  var ctrl,
    scope,
    widgetInitStatus,
    widgetFactory,
    localize,
    reportsFactory,
    filter,
    q,
    deferred;
  beforeEach(module('Soar.Dashboard'));
  beforeEach(module('Soar.Widget'));
  beforeEach(inject(function ($rootScope, $controller, $q, $filter) {
    q = $q;
    deferred = q.defer();
    scope = $rootScope.$new();
    filter = $filter;

    scope.data = {
      initData: {
        Appointment: null,
        DefaultFilter: 'MTD',
        Data: {
          MTD: {
            SeriesData: [
              {
                Category: 'Proposed',
                Color: '#30AFCD',
                Count: 0,
                Label: null,
                SeriesName: null,
                Value: 60,
              },
              {
                Category: 'Accepted',
                Color: '#AEB5BA',
                Count: 0,
                Label: null,
                SeriesName: null,
                Value: 50,
              },
            ],
          },
          TotalValue: 0,
        },
        FilterList: [{ 0: 'MTD' }, { 1: 'YTD' }, { 2: 'Date Range' }],
      },
      Title: 'Case Acceptance',
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
      GetCaseAcceptance: jasmine.createSpy().and.returnValue({
        then: jasmine
          .createSpy()
          .and.returnValue({ Value: scope.data.initData }),
      }),
      GetReportFilterDtoForCaseAcceptance: jasmine.createSpy().and.returnValue({
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

    ctrl = $controller('CaseAcceptanceHalfDonutWidgetController', {
      $scope: scope,
      WidgetInitStatus: widgetInitStatus,
      WidgetFactory: widgetFactory,
      localize: localize,
      ReportsFactory: reportsFactory,
    });
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
      scope.caseAccDateFilter = 'MTD';
      var caseAccStartDate = null;
      var caseAccEndDate = null;
      ctrl.processInitMode(initMode);
      var filterResult = widgetFactory.GetFilterDto(
        scope.caseAccDateFilter,
        scope.data.Locations,
        null,
        caseAccStartDate,
        caseAccEndDate
      );
      expect(widgetFactory.GetCaseAcceptance).toHaveBeenCalledWith(
        filterResult
      );
    });

    it('processInitMode should be called', function () {
      var initMode = 2;
      ctrl.processInitMode(initMode);
      expect(scope.caseAccData.TotalValue).toEqual(0);
      expect(scope.caseAccDateFilter).toEqual('MTD');
      expect(scope.caseAccSeriesData[2].SeriesName).toEqual('_hole_');
      expect(scope.caseAccSeriesData[2].Category).toEqual('Case Acceptance');
      expect(scope.caseAccSeriesData[2].label).toEqual('45%');
    });
  });

  describe('onDateFilterChange function ->', function () {
    it('onDateFilterChange should be called', function () {
      var dateOption = 'YTD';
      var caseAccStartDate = null;
      var caseAccEndDate = null;
      ctrl.getWidgetData(dateOption);
      var filterResult = widgetFactory.GetFilterDto(
        scope.caseAccDateFilter,
        scope.data.Locations,
        null,
        caseAccStartDate,
        caseAccEndDate
      );
      expect(widgetFactory.GetCaseAcceptance).toHaveBeenCalledWith(
        filterResult
      );
    });
  });
});
