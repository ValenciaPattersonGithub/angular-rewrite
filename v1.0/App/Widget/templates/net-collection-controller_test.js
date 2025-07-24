describe('net-collection-controller', function () {
  var ctrl, scope, widgetInitStatus, factory, widgetBarChartStyle, q, deferred;
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
      Title: 'Collections',
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
      GetNetCollection: jasmine.createSpy().and.returnValue({
        then: jasmine
          .createSpy()
          .and.returnValue({ Value: scope.data.initData }),
      }),
      GetFilterDto: jasmine.createSpy().and.returnValue({
        then: jasmine.createSpy(),
      }),
    };

    ctrl = $controller('NetCollectionController', {
      $scope: scope,
      WidgetInitStatus: widgetInitStatus,
      WidgetFactory: factory,
      WidgetBarChartStyle: widgetBarChartStyle,
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
      expect(factory.GetNetCollection).toHaveBeenCalledWith(filterResult);
    });

    it('processInitMode should be called', function () {
      var initMode = 2;
      ctrl.processInitMode(initMode);
      expect(scope.netCollectionModel).toEqual(scope.data.initData);
      expect(scope.netCollectionModel.title).toEqual('Collections');
      expect(scope.netCollectionModel.isCurrency).toBe(true);
      expect(scope.netCollectionModel.barStyle).toEqual(0);
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
      expect(factory.GetNetCollection).toHaveBeenCalledWith(filterResult);
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
      expect(factory.GetNetCollection).toHaveBeenCalledWith(filterResult);
    });
  });
});
