describe('practice-at-a-glance-controller', function () {
  var ctrl,
    scope,
    dashboardService,
    toastrFactory,
    patSecurityService,
    locationServices,
    amfaInfo,
    locationService,
    listHelper,
    timeZoneFactory,
    q,
    deferred;

  var amfaAbbrev = 'soar-dsh-dsh-view';
  var dashboardId = 1;
  var batchIds = [1, 2, 3, 4, 5];
  beforeEach(module('Soar.BusinessCenter'));
  beforeEach(inject(function ($rootScope, $controller, $q, $filter) {
    q = $q;
    deferred = q.defer();
    scope = $rootScope.$new();

    scope.locations = [
      {
        LocationId: 2,
        NameAbbreviation: '#abc',
        NameLine1: '#abc',
        NameLine2: null,
        DeactivationTimeUtc: null,
        Selected: true,
      },
      {
        LocationId: 3,
        NameAbbreviation: '#xyz',
        NameLine1: '#xyz',
        NameLine2: null,
        DeactivationTimeUtc: null,
        Selected: false,
      },
    ];

    toastrFactory = {};
    toastrFactory.error = jasmine.createSpy();
    toastrFactory.success = jasmine.createSpy();

    locationService = {
      getCurrentLocation: jasmine
        .createSpy()
        .and.returnValue({ $promise: deferred.promise }),
    };

    patSecurityService = {
      IsAuthorizedByAbbreviation: jasmine
        .createSpy(amfaAbbrev)
        .and.returnValue(false),
    };

    dashboardService = {
      BatchLoader: {
        Init: jasmine
          .createSpy()
          .and.returnValue({ $promise: deferred.promise }),
      },
      DashboardId: 1,
    };

    locationServices = {
      getPermittedLocations: jasmine
        .createSpy()
        .and.returnValue({ $promise: deferred.promise }),
    };

    timeZoneFactory = {
      GetTimeZoneAbbr: jasmine
        .createSpy()
        .and.returnValue({ $promise: deferred.promise }),
    };

    //mock controller
    ctrl = $controller('PracticeAtAGlanceController', {
      $scope: scope,
      DashboardService: dashboardService,
      toastrFactory: toastrFactory,
      patSecurityService: patSecurityService,
      LocationServices: locationServices,
      AmfaInfo: amfaInfo,
      locationService: locationService,
      ListHelper: listHelper,
      TimeZoneFactory: timeZoneFactory,
      $filter: $filter,
    });
  }));

  describe('initial values -> ', function () {
    it('controller should exist', function () {
      expect(ctrl).not.toBeNull();
    });

    it('should have injected services ', function () {
      expect(dashboardService).not.toBeNull();
      expect(toastrFactory).not.toBeNull();
      expect(patSecurityService).not.toBeNull();
      expect(locationServices).not.toBeNull();
      expect(amfaInfo).not.toBeNull();
      expect(locationService).not.toBeNull();
      expect(listHelper).not.toBeNull();
      expect(timeZoneFactory).not.toBeNull();
    });

    it('should set scope properties', function () {
      expect(dashboardId).toBe(1);
      expect(batchIds).toEqual([1, 2, 3, 4, 5]);
      expect(scope.locationMultiSelectOpen).toBe(false);
      expect(scope.locationsLoading).toBe(false);
      expect(scope.authorizeFailed).toBe(true);
    });
  });

  describe('updateContents function ->', function () {
    it('updateContents should be called', function () {
      scope.selectedLocations = [];
      scope.updateContents();
      expect(scope.selectedLocations).not.toBe([]);
    });
  });

  describe('removeLocation function ->', function () {
    it('removeLocation should be called', function () {
      scope.updateContents = jasmine.createSpy();
      var ofcLocation = { Selected: true };
      scope.removeLocation(ofcLocation);
      expect(scope.updateContents).toHaveBeenCalled();
    });
  });

  describe('ComputeLocationStatusesWithTimezones function ->', function () {
    it('ComputeLocationStatusesWithTimezones should be called', function () {
      var locations = [
        {
          LocationId: 2,
          NameAbbreviation: '#abc',
          NameLine1: '#abc',
          NameLine2: null,
          DeactivationTimeUtc: null,
          Selected: true,
        },
      ];
      ctrl.ComputeLocationStatusesWithTimezones(locations);
      expect(locations[0].SortOrder).toBe(1);
    });

    it('ComputeLocationStatusesWithTimezones should be called', function () {
      var locations = [
        {
          LocationId: 2,
          NameAbbreviation: '#abc',
          NameLine1: '#abc',
          NameLine2: null,
          DeactivationTimeUtc: 2018 - 11 - 04,
          Selected: true,
        },
      ];
      // var dateNow = moment().format('MM/DD/YYYY');
      ctrl.ComputeLocationStatusesWithTimezones(locations);
      expect(locations[0].SortOrder).toBe(3);
      expect(locations[0].LocationStatus).toBe('Inactive');
    });

    it('ComputeLocationStatusesWithTimezones should be called', function () {
      var locations = [
        {
          LocationId: null,
          NameAbbreviation: '#abc',
          NameLine1: '#abc',
          NameLine2: null,
          DeactivationTimeUtc: null,
          Selected: true,
        },
      ];
      ctrl.ComputeLocationStatusesWithTimezones(locations);
      expect(locations[0].SortOrder).toBe(1);
      expect(locations[0].LocationStatus).toBe('All Status');
    });
  });

  describe('locationChange function ->', function () {
    it('locationChange should be called', function () {
      var list = undefined;
      ctrl.tempLocations = [
        {
          LocationId: 2,
          NameAbbreviation: '#abc',
          NameLine1: '#abc',
          NameLine2: null,
          DeactivationTimeUtc: null,
          Selected: true,
        },
      ];
      scope.locations = [
        {
          LocationId: 2,
          NameAbbreviation: '#abc',
          NameLine1: '#abc',
          NameLine2: null,
          DeactivationTimeUtc: null,
          Selected: false,
        },
        {
          LocationId: 3,
          NameAbbreviation: '#xyz',
          NameLine1: '#xyz',
          NameLine2: null,
          DeactivationTimeUtc: null,
          Selected: false,
        },
      ];
      scope.selectedLocations = [
        {
          LocationId: 3,
          NameAbbreviation: '#xyz',
          NameLine1: '#xyz',
          NameLine2: null,
          DeactivationTimeUtc: null,
          Selected: true,
        },
      ];
      scope.locationChange(list);
      expect(dashboardService.BatchLoader.Init).toHaveBeenCalled();
    });
  });
});
