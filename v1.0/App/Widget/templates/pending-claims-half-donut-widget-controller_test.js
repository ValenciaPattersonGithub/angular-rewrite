describe('pending-claims-half-donut-widget-controller', function () {
  var ctrl, scope, widgetInitStatus, factory, localize, locationService, q, deferred ,
  featureFlagService,
  fuseFlag;

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
  beforeEach(inject(function ($rootScope, $controller, $q) {
    q = $q;
    deferred = q.defer();
    scope = $rootScope.$new();

    scope.data = {
      initData: {
        Appointment: null,
        DefaultFilter: 'Date Range',
        Data: {
          ['Date Range']: {
            SeriesData: [
              {
                Category: '0-30 days',
                Color: null,
                Count: 0,
                Label: null,
                SeriesName: null,
                Value: 100,
              },
              {
                Category: '31-60 days',
                Color: null,
                Count: 0,
                Label: null,
                SeriesName: null,
                Value: 200,
              },
              {
                Category: '61-90 days',
                Color: null,
                Count: 0,
                Label: null,
                SeriesName: null,
                Value: 300,
              },
              {
                Category: '> 90 days',
                Color: null,
                Count: 0,
                Label: null,
                SeriesName: null,
                Value: 400,
              },
            ],
          },
          TotalValue: 0,
        },
        FilterList: [
          { 0: 'MTD' },
          { 1: 'YTD' },
          { 2: 'Last Year' },
          { 3: 'Last Month' },
        ],
      },
      Title: 'Pending Claims',
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
      GetPendingClaims: jasmine.createSpy().and.returnValue({
        then: jasmine
          .createSpy()
          .and.returnValue({ Value: scope.data.initData }),
      }),
      GetFilterDto: jasmine.createSpy().and.returnValue({
        then: jasmine.createSpy(),
      }),
      GetUserDashboardPendingClaims: jasmine.createSpy().and.returnValue({
        then: jasmine
          .createSpy()
          .and.returnValue({ Value: scope.data.initData }),
      }),
    };

    featureFlagService = {
      getOnce$: jasmine.createSpy().and.returnValue({ subscribe: jasmine.createSpy() })
    };
  
    fuseFlag = {
      DashboardPendingClaimsWidgetMvp: jasmine.createSpy().and.returnValue({ subscribe: jasmine.createSpy() })
    };

    ctrl = $controller('PendingClaimsHalfDonutWidgetController', {
      $scope: scope,
      WidgetInitStatus: widgetInitStatus,
      WidgetFactory: factory,
      localize: localize,
      $location: location,
      FeatureFlagService: featureFlagService,
      FuseFlag: fuseFlag
    });
  }));

  describe('initial values -> ', function () {
    it('controller should exist', function () {
      expect(ctrl).not.toBeNull();
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
      var filterResult = factory.GetFilterDto(null, scope.data.Locations, null);
      expect(factory.GetUserDashboardPendingClaims).toHaveBeenCalledWith(
        filterResult
      );
    });

    it('processInitMode should be called', function () {
      var initMode = 2;
      ctrl.processInitMode(initMode);
      expect(scope.pendingClaimsData).not.toBeNull();
      expect(scope.pendingClaimsData[0].Category).toEqual('0-30 days');
      expect(scope.pendingClaimsData[1].Category).toEqual('31-60 days');
      expect(scope.pendingClaimsData[2].Category).toEqual('61-90 days');
      expect(scope.pendingClaimsData[3].Category).toEqual('> 90 days');
      expect(scope.pendingClaimsData[4].Category).toEqual('Days Outstanding');
      expect(scope.pendingClaimsData[4].SeriesName).toEqual('_hole_');
    });
  });
});
