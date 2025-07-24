describe('open-clinical-notes', function () {
  var ctrl,
    scope,
    widgetInitStatus,
    widgetFactory,
    q,
    deferred,
    $rootScope,
    locationService,
    featureFlagService,
    fuseFlag;

  beforeEach(module('Soar.Dashboard'));
  beforeEach(module('Soar.Widget'));

  beforeEach(inject(function ($rootScope, $controller, $q) {
    q = $q;
    deferred = q.defer();
    scope = $rootScope.$new();
    $rootScope.patAuthContext = {
      userInfo: {
        userid: 'test',
      },
    };

    scope.data = {
      initData: {},
    };

    widgetInitStatus = {
      ToLoad: 0,
      Loading: 1,
      Loaded: 2,
    };

    widgetFactory = {
      GetOpenClinicalNotes: jasmine.createSpy().and.returnValue({
        then: jasmine.createSpy(),
      }),
    };

    locationService = {
      getActiveLocations: jasmine.createSpy().and.returnValue([
        { name: 'test1', id: 'id1' },
        { name: 'test2', id: 'id2' },
      ]),
      getCurrentLocation: jasmine.createSpy().and.returnValue({
        id: 'currentLocationId',
      }),
    };

    featureFlagService = {
      getOnce$: jasmine.createSpy().and.returnValue({ subscribe: jasmine.createSpy() })
    };

    fuseFlag = {
      DashboardClinicalNotesWidgetMvp: jasmine.createSpy().and.returnValue({ subscribe: jasmine.createSpy() })
    };

    ctrl = $controller('OpenClinicalNotesController', {
      $scope: scope,
      WidgetInitStatus: widgetInitStatus,
      WidgetFactory: widgetFactory,
      locationService: locationService,
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
    });
  });

  describe('onInit function ->', function () {
    it('should set selectedProvider.ProviderId to current logged in user', function () {
      scope.selectedProvider.ProviderId = 'original';
      ctrl.$onInit();

      expect(scope.selectedProvider.ProviderId).toBe('test');
    });

    it('should set selectedLocation.LocationId to current logged in location', function () {
      scope.selectedLocation.LocationId = 'original';
      ctrl.$onInit();

      expect(scope.selectedLocation.LocationId).toBe('currentLocationId');
    });

    it('should call getUserLocations', function () {
      scope.selectedProvider.ProviderId = 'original';
      ctrl.getUserLocations = jasmine.createSpy();

      ctrl.$onInit();

      expect(ctrl.getUserLocations).toHaveBeenCalled();
    });
  });

  describe('processInitMode function ->', function () {
    it('processInitMode should be called', function () {
      scope.selectedProviderId = 'original';
      var initMode = 0;
      ctrl.processInitMode(initMode);
      expect(widgetFactory.GetOpenClinicalNotes).toHaveBeenCalledWith({
        LocationIds: [],
        ProviderIds: ['test'],
        LaunchDarklyStatus : false
      });
    });

    it('processInitMode should be called', function () {
      var initMode = 2;
      ctrl.processInitMode(initMode);
      expect(scope.openClinicalNotes).toEqual(scope.data.initData);
    });
  });

  describe('assignedProviderChanged function ->', function () {
    //Not changed location
    it('should assign scope.selectedProviderId to passed value when location not changed', function () {
      scope.changedLocation = false;

      scope.selectedProvider.ProviderId = 'original';
      scope.assignedProviderChanged('new');
      expect(scope.selectedProvider.ProviderId).toBe('new');
    });

    it('should call getDataFromServer when location not changed', function () {
      scope.changedLocation = false;

      ctrl.getDataFromServer = jasmine.createSpy();
      scope.selectedProvider.ProviderId = 'original';
      scope.assignedProviderChanged('new');
      expect(ctrl.getDataFromServer).toHaveBeenCalled();
    });

    //Changed location
    it('should assign selectedProvider providerId to current user when changed location is true', function () {
      scope.changedLocation = true;

      scope.selectedProvider.ProviderId = 'original';
      scope.assignedProviderChanged('new');
      expect(scope.selectedProvider.ProviderId).toBe('test');
    });
  });

  describe('getUserLocations function ->', function () {
    beforeEach(function () { });

    //locationOptions == 0
    it('should not call locationService.getActiveLocations when scope.locationOptions length is greater than 0', function () {
      scope.locationOptions = [{ name: 'test1', id: 'id1' }];

      ctrl.getUserLocations();
      expect(locationService.getActiveLocations).not.toHaveBeenCalled();
    });

    //locationOptions != 0

    it('should call locationService.getActiveLocations when scope.locationOptions length is 0', function () {
      scope.locationOptions = [];

      ctrl.getUserLocations();
      expect(locationService.getActiveLocations).toHaveBeenCalled();
    });

    //- calls locationService.getActiveLocations
    it('should call locationService.getActiveLocations when scope.locationOptions length is 0', function () {
      scope.locationOptions = [];

      ctrl.getUserLocations();
      expect(locationService.getActiveLocations).toHaveBeenCalled();
    });

    //- activeLocations not set
    it('should not call ctrl.groupLocations when activeLocations is null', function () {
      scope.locationOptions = [];
      locationService.getActiveLocations = jasmine
        .createSpy()
        .and.returnValue(null);
      ctrl.groupLocations = jasmine.createSpy();

      ctrl.getUserLocations();
      expect(ctrl.groupLocations).not.toHaveBeenCalled();
    });

    //- activeLocations set
    //---- calls ctrl.groupLocations
    it('should call ctrl.groupLocations when activeLocations is not null', function () {
      scope.locationOptions = [];
      locationService.getActiveLocations = jasmine.createSpy().and.returnValue([
        { name: 'test1', id: 'id1' },
        { name: 'test2', id: 'id2' },
      ]);
      ctrl.groupLocations = jasmine
        .createSpy()
        .and.callFake(function (locations) {
          return locations;
        });

      ctrl.getUserLocations();
      expect(ctrl.groupLocations).toHaveBeenCalled();
    });

    //---- sets locationIdsForProviderDropdown

    it('should set scope.locationIdsForProviderDropdown', function () {
      scope.locationOptions = [];
      scope.locationIdsForProviderDropdown = [];
      locationService.getActiveLocations = jasmine.createSpy().and.returnValue([
        { name: 'test1', id: 'id1' },
        { name: 'test2', id: 'id2' },
      ]);
      ctrl.groupLocations = jasmine
        .createSpy()
        .and.callFake(function (locations) {
          return locations;
        });

      ctrl.getUserLocations();
      expect(scope.locationIdsForProviderDropdown).toEqual(['id1', 'id2']);
    });
  });

  describe('groupLocations function ->', function () {
    beforeEach(function () { });

    it('should call widgetFactory.GetOpenClinicalNotes', function () {
      var deactivationDate = moment().add(1, 'month');
      var locations = [
        { name: 'pendingInactive', deactivationTimeUtc: deactivationDate },
        { name: 'active', deactivationTimeUtc: null },
        {
          name: 'inactive',
          deactivationTimeUtc: '2020-04-17T18:20:03.8791182',
        },
      ];

      var response = ctrl.groupLocations(locations);
      expect(response).toEqual([
        {
          name: 'active',
          deactivationTimeUtc: null,
          status: 'Active',
          sort: 1,
        },
        {
          name: 'pendingInactive',
          deactivationTimeUtc: deactivationDate,
          status: 'Pending Inactive',
          sort: 2,
        },
        {
          name: 'inactive',
          deactivationTimeUtc: '2020-04-17T18:20:03.8791182',
          status: 'Inactive',
          sort: 3,
        },
      ]);
    });
  });

  describe('getLocationsForFilter function ->', function () {
    beforeEach(function () {
      scope.locationOptions = [{ Value: '1' }, { Value: '2' }];
    });

    it('should return array with single location when selectedLocation.LocationId is not 0', function () {
      scope.selectedLocation.LocationId = '1';

      var response = ctrl.getLocationsForFilter();
      expect(response).toEqual(['1']);
    });

    it('should call widgetFactory.GetOpenClinicalNotes', function () {
      scope.selectedLocation.LocationId = '0';

      var response = ctrl.getLocationsForFilter();
      expect(response).toEqual(['1', '2']);
    });
  });

  describe('getDataFromServer function ->', function () {
    it('should call ctrl.getLocationsForFilter', function () {
      ctrl.getLocationsForFilter = jasmine.createSpy();
      ctrl.getDataFromServer();
      expect(ctrl.getLocationsForFilter).toHaveBeenCalled();
    });

    it('should call widgetFactory.GetOpenClinicalNotes', function () {
      scope.selectedProviderId = 'original';
      ctrl.getDataFromServer();
      expect(widgetFactory.GetOpenClinicalNotes).toHaveBeenCalled();
    });
  });
});
