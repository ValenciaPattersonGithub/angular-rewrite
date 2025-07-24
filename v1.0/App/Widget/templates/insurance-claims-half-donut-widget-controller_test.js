describe('insurance-claims-half-donut-widget-controller', function () {
  var ctrl,
    scope,
    widgetInitStatus,
    factory,
    localize,
    locationService,
    filter,
    q,
    timeout,
    deferred,
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
    beforeEach(inject(function ($rootScope, $controller, $q, $filter, $timeout) {
    q = $q;
    deferred = q.defer();
    scope = $rootScope.$new();
    filter = $filter;
    timeout = $timeout;
    scope.data = {
      initData: {
        Appointment: null,
        DefaultFilter: 'YTD',
        Data: {
          YTD: {
            SeriesData: [
              {
                Category: 'Unsubmitted',
                Color: null,
                Count: 25,
                Label: null,
                SeriesName: null,
                Value: 105253.5,
              },
              {
                Category: 'Submitted',
                Color: null,
                Count: 0,
                Label: null,
                SeriesName: null,
                Value: 0,
              },
              {
                Category: 'Alerts',
                Color: null,
                Count: 0,
                Label: null,
                SeriesName: null,
                Value: 0,
              },
              {
                Category: 'Paid',
                Color: null,
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
          { 0: 'MTD' },
          { 1: 'YTD' },
          { 2: 'Last Month' },
          { 3: 'Last Year' },
        ],
      },
      Title: 'Insurance Claims',
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
      GetInsuranceClaims: jasmine.createSpy().and.returnValue({
        then: jasmine
          .createSpy()
          .and.returnValue({ Value: scope.data.initData }),
      }),
      GetFilterDto: jasmine.createSpy().and.returnValue({
        then: jasmine.createSpy(),
      }),
      GetUserDashboardInsuranceClaims: jasmine.createSpy().and.returnValue({
        then: jasmine
          .createSpy()
          .and.returnValue({ Value: scope.data.initData }),
      }),
    };


    featureFlagService = {
        getOnce$: jasmine.createSpy().and.returnValue({ subscribe: jasmine.createSpy() })
    };

    fuseFlag = {
        DashboardInsuranceClaimsWidgetMvp: jasmine.createSpy().and.returnValue({ subscribe: jasmine.createSpy() })
    };

    ctrl = $controller('InsuranceClaimsHalfDonutWidgetController', {
      $scope: scope,
      WidgetInitStatus: widgetInitStatus,
      WidgetFactory: factory,
      localize: localize,
      $timeout: timeout,
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
      var dateOption = null;
      ctrl.processInitMode(initMode);
      var filterResult = factory.GetFilterDto(
        dateOption,
        scope.data.Locations,
        null
      );
      expect(factory.GetUserDashboardInsuranceClaims).toHaveBeenCalledWith(
        filterResult
      );
    });

    it('processInitMode should be called', function () {
      var initMode = 2;
      ctrl.processInitMode(initMode);
      timeout.flush(200);
      expect(scope.selectedDisplayType).toEqual('YTD');
      expect(scope.displayTypeOptions[0].display[0]).toEqual('MTD');
      expect(scope.displayTypeOptions[0].value[0]).toEqual('MTD');
      expect(scope.displayTypeOptions[1].display[1]).toEqual('YTD');
      expect(scope.displayTypeOptions[1].value[1]).toEqual('YTD');
      expect(scope.displayTypeOptions[2].display[2]).toEqual('Last Month');
      expect(scope.displayTypeOptions[2].value[2]).toEqual('Last Month');
      expect(scope.displayTypeOptions[3].display[3]).toEqual('Last Year');
      expect(scope.displayTypeOptions[3].value[3]).toEqual('Last Year');
      expect(scope.insuranceClaimsData[0].Category).toEqual('Unsubmitted');
      expect(scope.insuranceClaimsData[0].label).toEqual('$105,253.50');
      expect(scope.insuranceClaimsData[0].Value).toEqual(105253.5);
    });
  });

  describe('filterChanged function ->', function () {
    it('filterChanged should be called', function () {
      var dateOption = 'YTD';
      var type = 'MTD';
      scope.filterChanged(type);
      var filterResult = factory.GetFilterDto(
        dateOption,
        scope.data.Locations,
        null
      );
      expect(factory.GetUserDashboardInsuranceClaims).toHaveBeenCalledWith(
        filterResult
      );
    });
  });
});
