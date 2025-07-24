describe('gross-production-controller', function () {
  var ctrl, scope, widgetInitStatus, factory, widgetBarChartStyle, q, deferred,featureFlagService;
  beforeEach(module('Soar.Dashboard'));
  beforeEach(module('Soar.Widget'));
  beforeEach(inject(function ($rootScope, $controller, $q) {
    q = $q;
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
          },
        },
        FilterList: [
          { 0: 'MTD' },
          { 1: 'YTD' },
          { 2: 'Last Month' },
          { 3: 'Last Year' },
        ],
      },
      Title: 'Gross Production',
      Locations: [{ 0: 1 }],
    };

    widgetInitStatus = {
      ToLoad: 0,
      Loading: 1,
      Loaded: 2,
    };

    widgetBarChartStyle = {
      Flat: 0,
      Pillar: 1,
    };

    factory = {
      GetGrossProduction: jasmine.createSpy().and.returnValue({
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
    ctrl = $controller('GrossProductionController', {
      $scope: scope,
      WidgetInitStatus: widgetInitStatus,
      WidgetFactory: factory,
      WidgetBarChartStyle: widgetBarChartStyle,
      FeatureFlagService: featureFlagService,
    });
  }));

  describe('initial values -> ', function () {
    it('controller should exist', function () {
      expect(ctrl).not.toBeNull();
    });

    it('should have injected services ', function () {
      expect(factory).not.toBeNull();
      expect(widgetBarChartStyle).not.toBeNull();
      expect(widgetInitStatus).not.toBeNull();
    });
  });

  describe('processInitMode function ->', function () {
    it('processInitMode should be called', function () {
      var initMode = 0;
      var dateOption = 'Last Month';
      ctrl.processInitMode(initMode);
      var filterResult = factory.GetFilterDto(
        dateOption,
        scope.data.Locations,
        null
      );
      expect(factory.GetGrossProduction).toHaveBeenCalledWith(filterResult);
    });

    it('processInitMode should be called', function () {
      var initMode = 2;
      ctrl.processInitMode(initMode);
      expect(scope.grossProductionModel).toEqual(scope.data.initData);
      expect(scope.grossProductionModel.title).toEqual('Gross Production');
      expect(scope.grossProductionModel.isCurrency).toBe(true);
      expect(scope.grossProductionModel.barStyle).toEqual(0);
      expect(scope.grossProductionModel.reportId).toEqual(21);
    });
  });

  describe('locationsUpdated function ->', function () {
    it('locationsUpdated should be called', function () {
      scope.$broadcast('locationsUpdated');
      var dateOption = 'YTD';
      ctrl.getWidgetData(dateOption);
      var filterResult = factory.GetFilterDto(
        dateOption,
        scope.data.Locations,
        null
      );
      expect(factory.GetGrossProduction).toHaveBeenCalledWith(filterResult);
    });
  });

  describe('onFilterCallback  function ->', function () {
    it('onFilterCallback  should be called', function () {
      var dateOption = 'YTD';
      scope.onFilterCallback(dateOption);
      ctrl.getWidgetData(dateOption);
      var filterResult = factory.GetFilterDto(
        dateOption,
        scope.data.Locations,
        null
      );
      expect(factory.GetGrossProduction).toHaveBeenCalledWith(filterResult);
    });
  });
});
