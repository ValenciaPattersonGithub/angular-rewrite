describe('gross-production-gauge-widget-controller', function () {
  var ctrl,
    scope,
    widgetInitStatus,
    widgetFactory,
    localize,
    reportsFactory,
    q,
    timeout,
    deferred,
    featureFlagService,
    fuseFlag;
  var modelMock = {
    reportId: 21,
  };
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
                Category: 'Value',
                Color: '#30AFCD',
                Count: 0,
                Label: null,
                SeriesName: null,
                Value: 180,
              },
              {
                Category: 'Goal',
                Color: '#AEB5BA',
                Count: 0,
                Label: null,
                SeriesName: null,
                Value: 0,
              },
            ],
          },
          TotalValue: 0,
        },
        FilterList: [
          { 0: 'YTD' },
          { 1: 'Today' },
          { 2: 'MTD' },
          { 3: 'Last Year' },
          { 4: 'Last Month' },
        ],
      },
      Title: 'Gross Production',
      Locations: [{ 0: 1 }],
      userData: { UserId: 'd0be7456-e01b-e811-b7c1-a4db3021bfa0' },
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
      GetGrossProduction: jasmine.createSpy().and.returnValue({
        then: jasmine
          .createSpy()
          .and.returnValue({ Value: scope.data.initData }),
      }),
      GetUserDashboardGrossProduction: jasmine.createSpy().and.returnValue({
        then: jasmine
          .createSpy()
          .and.returnValue({ Value: scope.data.initData }),
      }),
      GetFilterDto: jasmine.createSpy().and.returnValue({
        then: jasmine.createSpy(),
      }),
      GetReportFilterDto: jasmine.createSpy().and.returnValue({
        then: jasmine.createSpy(),
      }),
    };
    reportsFactory = {
      GetSpecificReports: jasmine.createSpy().and.returnValue({
        then: jasmine.createSpy(),
      }),
    };

    featureFlagService = {
      getOnce$: jasmine.createSpy().and.returnValue({ subscribe: jasmine.createSpy() })
    };
  
    fuseFlag = {
      DashboardGrossProductionWidgetMvp: jasmine.createSpy().and.returnValue({ subscribe: jasmine.createSpy() })
    };

    ctrl = $controller('GrossProductionGaugeWidgetController', {
      $scope: scope,
      WidgetInitStatus: widgetInitStatus,
      WidgetFactory: widgetFactory,
      $timeout: timeout,
      localize: localize,
      ReportsFactory: reportsFactory,
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
      expect(reportsFactory).not.toBeNull();
    });
  });

  describe('processInitMode function ->', function () {
    it('processInitMode should be called', function () {
      var initMode = 0;
      var dateOption = 'YTD';
      var userIds = [{ 0: scope.data.userData.UserId }];
      ctrl.processInitMode(initMode);
      var filterResult = widgetFactory.GetFilterDto(dateOption, null, userIds);
      expect(
        widgetFactory.GetUserDashboardGrossProduction
      ).toHaveBeenCalledWith(filterResult);
    });

    it('processInitMode should be called', function () {
      var initMode = 2;
      ctrl.processInitMode(initMode);
      timeout.flush(300);
      expect(scope.gaugeData[2].SeriesName).toEqual('_hole_');
      expect(scope.gaugeData[2].Category).toEqual('$180.00');
      expect(scope.gaugeData[2].label).toEqual('100%');
    });
  });

  describe('onDateFilterChange function ->', function () {
    it('onDateFilterChange should be called', function () {
      scope.dateFilter = 'YTD';
      ctrl.tempDateFilter = 'MTD';
      var userIds = [{ 0: scope.data.userData.UserId }];
      ctrl.getWidgetData(scope.dateFilter);
      var filterResult = widgetFactory.GetFilterDto(
        scope.dateFilter,
        null,
        userIds
      );
      expect(
        widgetFactory.GetUserDashboardGrossProduction
      ).toHaveBeenCalledWith(filterResult);
    });
  });
  describe('scope.drilldown ->', function () {
    it('drilldown should be called', function () {
      var model = modelMock;
      var e = { category: 'Apr', value: 1234570 };
      scope.drilldown(e);
      expect(reportsFactory.GetSpecificReports).toHaveBeenCalledWith([
        model.reportId,
      ]);
    });
  });
});
