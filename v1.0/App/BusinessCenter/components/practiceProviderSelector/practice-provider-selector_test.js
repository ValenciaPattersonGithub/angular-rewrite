describe('Controller: PracticeProviderSelectorController', function () {
  var ctrl, scope, toastrFactory, referenceDataService;
  var timeout;

  // list returned from preferredProviders filter
  var mockProviderList = [
    {
      ProviderId: 'd46e2bb2-f3f9-41de-b2bd-1a1f7a84438e',
      UserId: 'd46e2bb2-f3f9-41de-b2bd-1a1f7a84438e',
      Name: 'Bob Jones',
      IsPreferred: false,
      Locations: [
        { LocationId: 2, ProviderTypeId: 1 },
        { LocationId: 3, ProviderTypeId: 1 },
      ],
    },
    {
      ProviderId: '43189973-d808-4fd1-a8cc-fabf84c9f18f',
      UserId: '43189973-d808-4fd1-a8cc-fabf84c9f18f',
      Name: 'Sid Jones',
      IsPreferred: false,
      Locations: [{ LocationId: 2, ProviderTypeId: 1 }],
    },
    {
      ProviderId: 'ab796156-f6f9-4057-a463-4d4c23a74dca',
      UserId: 'ab796156-f6f9-4057-a463-4d4c23a74dca',
      Name: 'Larry Jones',
      IsPreferred: false,
      Locations: [
        { LocationId: 2, ProviderTypeId: 3 },
        { LocationId: 3, ProviderTypeId: 1 },
      ],
    },
    {
      ProviderId: 'eedf5827-6735-4832-9d20-99758df70a8b',
      UserId: 'eedf5827-6735-4832-9d20-99758df70a8b',
      Name: 'Pat Jones',
      IsPreferred: false,
      Locations: [
        { LocationId: 2, ProviderTypeId: 1 },
        { LocationId: 3, ProviderTypeId: 1 },
        { LocationId: 4, ProviderTypeId: 1 },
      ],
    },
    {
      ProviderId: '517ce215-b71b-408f-8b20-62a4c1386f77',
      UserId: '517ce215-b71b-408f-8b20-62a4c1386f77',
      Name: 'Sylvia Jones',
      IsPreferred: false,
      Locations: [{ LocationId: 2, ProviderTypeId: 2 }],
    },
  ];

  beforeEach(module('Soar.Common'));
  beforeEach(module('common.factories'));

  beforeEach(inject(function ($rootScope, $controller, $injector, $timeout) {
    scope = $rootScope.$new();
    timeout = $timeout;

    toastrFactory = {
      success: jasmine.createSpy(),
      error: jasmine.createSpy(),
    };

    referenceDataService = {
      get: jasmine
        .createSpy('referenceDataService.get')
        .and.returnValue(mockProviderList),
      entityNames: {},
    };

    ctrl = $controller('PracticeProviderSelectorController', {
      $scope: scope,
      toastrFactory: toastrFactory,
      referenceDataService: referenceDataService,
    });
  }));

  describe('ctrl.addDynamicColumnsToProviders function ->', function () {
    var allProviderList;
    beforeEach(function () {
      allProviderList = _.cloneDeep(mockProviderList);
    });

    it('should add FullName, Name, and ProviderId to list if not there', function () {
      allProviderList[0].Name = '';
      allProviderList[0].FullName = '';
      allProviderList[0].ProviderId = '';
      allProviderList[0].FirstName = 'Bob';
      allProviderList[0].LastName = 'Smith';
      allProviderList[0].UserId = '1234';
      ctrl.addDynamicColumnsToProviders(allProviderList);
      allProviderList[0].Name = 'Bob Smith';
      allProviderList[0].FullName = 'Bob Smith';
      allProviderList[0].ProviderId = '1234';
    });

    it('should not add FullName, Name, and ProviderId to list if already there', function () {
      allProviderList[0].Name = 'Larry David';
      allProviderList[0].FullName = 'Larry David';
      allProviderList[0].ProviderId = '12345';
      allProviderList[0].FirstName = 'Bob';
      allProviderList[0].LastName = 'Smith';
      allProviderList[0].UserId = '1234';
      ctrl.addDynamicColumnsToProviders(allProviderList);
      allProviderList[0].Name = 'Larry David';
      allProviderList[0].FullName = 'Larry David';
      allProviderList[0].ProviderId = '12345';
    });
  });

  describe('ctrl.init function ->', function () {
    beforeEach(function () {
      spyOn(ctrl, 'loadProviders');
      scope.providersLoaded = false;
    });

    it('should load providerList', function () {
      ctrl.init();
      expect(ctrl.loadProviders).toHaveBeenCalled();
      expect(scope.providersLoaded).toBe(true);
    });
  });

  describe('ctrl.filterProviderListForOnlyActive function ->', function () {
    beforeEach(function () {
      ctrl.allProvidersList = _.cloneDeep(mockProviderList);
      _.forEach(ctrl.allProvidersList, function (provider) {
        provider.IsActive = true;
      });
    });

    it('should filter the providerList for only providers who are active if onlyActive is true ', function () {
      scope.onlyActive = true;
      var inactiveProvider = ctrl.allProvidersList[0];
      inactiveProvider.IsActive = false;
      var filteredList = ctrl.filterProviderListForOnlyActive(
        ctrl.allProvidersList
      );
      expect(filteredList.length).toBe(ctrl.allProvidersList.length - 1);
      expect(filteredList).not.toContain(inactiveProvider);
    });

    it('should not filter the providerList for only providers who are active if onlyActive is false ', function () {
      scope.onlyActive = false;
      var inactiveProvider = ctrl.allProvidersList[0];
      inactiveProvider.IsActive = false;
      var filteredList = ctrl.filterProviderListForOnlyActive(
        ctrl.allProvidersList
      );
      expect(filteredList.length).toBe(ctrl.allProvidersList.length);
      expect(filteredList).toContain(inactiveProvider);
    });

    it('should filter the providerList for only providers who are active plus selectedProvider if onlyActive is true and selectedProvider is not empty ', function () {
      scope.onlyActive = true;
      var inactiveProvider = ctrl.allProvidersList[0];
      scope.selectedProvider = ctrl.allProvidersList[0].UserId;
      inactiveProvider.IsActive = false;
      var filteredList = ctrl.filterProviderListForOnlyActive(
        ctrl.allProvidersList
      );
      expect(filteredList.length).toBe(ctrl.allProvidersList.length);
      expect(filteredList).toContain(inactiveProvider);
    });
  });

  describe('ctrl.filterProviderList function ->', function () {
    var filteredProviderList = [];

    beforeEach(function () {
      ctrl.allProvidersList = _.cloneDeep(mockProviderList);
      filteredProviderList = _.cloneDeep(mockProviderList);
      spyOn(ctrl, 'filterProviderListForOnlyActive').and.callFake(function () {
        return filteredProviderList;
      });
      spyOn(ctrl, 'filterByProviderOnClaimsOnly').and.callFake(function () {
        return filteredProviderList;
      });
    });

    it('should call ctrl.filterProviderListForOnlyActive ', function () {
      ctrl.filterProviderList(ctrl.allProvidersList);
      expect(ctrl.filterProviderListForOnlyActive).toHaveBeenCalledWith(
        ctrl.allProvidersList
      );
    });

    it('should call ctrl.filterByProviderOnClaimsOnly ', function () {
      ctrl.filterProviderList(ctrl.allProvidersList);
      expect(ctrl.filterByProviderOnClaimsOnly).toHaveBeenCalledWith(
        filteredProviderList
      );
    });
  });

  describe('ctrl.filterByProviderOnClaimsOnly function ->', function () {
    var allProvidersList = [];

    beforeEach(function () {
      allProvidersList = _.cloneDeep(mockProviderList);
      _.forEach(allProvidersList, function (provider) {
        provider.Locations[0].ProviderOnClaimsRelationship = 1;
      });
    });

    it('should return only providers who have at least one location with ProviderOnClaimsRelationShip set to Self if scope.providerOnClaimsOnly is true', function () {
      scope.providerOnClaimsOnly = true;
      allProvidersList[0].Locations[0].ProviderOnClaimsRelationship = 0;
      var filteredProviderList =
        ctrl.filterByProviderOnClaimsOnly(allProvidersList);
      expect(filteredProviderList).not.toContain(allProvidersList[0]);
      expect(filteredProviderList.length).toEqual(allProvidersList.length - 1);
    });

    it('should return all providers passed to the method if scope.providerOnClaimsOnly is false', function () {
      scope.providerOnClaimsOnly = false;
      var filteredProviderList =
        ctrl.filterByProviderOnClaimsOnly(allProvidersList);
      expect(filteredProviderList).toEqual(allProvidersList);
    });
  });
});
