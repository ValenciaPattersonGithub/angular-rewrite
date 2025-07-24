describe('ServiceFeesByLocationController ->', function () {
  var scope, filter, ctrl;
  var modalInstance, referenceDataService;

  //#region mocks

  var serviceCodeMock = {
    DisplayAs: 'PerEx',
    Fee: 200.0,
    Code: 'D0150',
    TaxableServiceTypeId: 1,
    LocationSpecificInfo: [
      { TaxableServiceTypeId: 2, LocationId: 1, Fee: 100.0 },
      { TaxableServiceTypeId: 1, LocationId: 2, Fee: 200.0 },
      { TaxableServiceTypeId: 3, LocationId: 3, Fee: 300.0 },
    ],
  };

  //#endregion

  //#region before each

  beforeEach(module('Soar.Common'));
  beforeEach(module('common.factories'));
  beforeEach(
    module('Soar.BusinessCenter', function ($provide) {
      modalInstance = {
        close: jasmine.createSpy(),
        dismiss: jasmine.createSpy(),
      };

      $provide.value('ModalInstance', modalInstance);

      referenceDataService = {
        setFeesForLocations: jasmine.createSpy(),
        get: jasmine.createSpy().and.callFake(function () {
          return [{ LocationId: 5 }, { LocationId: 6 }, { LocationId: 7 }];
        }),
        entityNames: {
          locations: 'locations',
        },
      };
      $provide.value('referenceDataService', referenceDataService);
    })
  );

  beforeEach(inject(function ($rootScope, $controller, _$uibModal_, $filter) {
    filter = $filter;

    scope = $rootScope.$new();
    scope.data = { Fee: null, ServiceCode: {} };

    ctrl = $controller('ServiceFeesByLocationController', {
      $scope: scope,
      $filter: filter,
      $uibModalInstance: modalInstance,
    });
  }));

  //#endregion

  describe('setDefaultFee function -> ', function () {
    it('should set default fee to Service.Code fee if not null', function () {
      scope.data = { Fee: 200.0, ServiceCode: angular.copy(serviceCodeMock) };
      ctrl.setDefaultFee();
      expect(scope.defaultFee).toEqual(200.0);
    });

    it('should set default fee to 0.00 if ServiceCode.Fee null', function () {
      scope.data.Fee = null;
      scope.data.ServiceCode = angular.copy(serviceCodeMock);
      ctrl.setDefaultFee();
      expect(scope.defaultFee).toEqual(0.0);
    });
  });

  describe('getLocations function -> ', function () {
    it('should call referenceDataService.get', function () {
      ctrl.getLocations();
      expect(referenceDataService.get).toHaveBeenCalledWith(
        referenceDataService.entityNames.locations
      );
    });

    describe('when locations call succeeds ->', function () {
      var locations;

      beforeEach(function () {
        ctrl.setLocationProperties = jasmine.createSpy();
        locations = [{ LocationId: 5 }, { LocationId: 6 }, { LocationId: 7 }];
      });

      it('should set scope properties', function () {
        ctrl.getLocations();
        expect(scope.locations).toEqual(locations);
        expect(scope.filteredLocations).toEqual(locations);
      });

      it('should call methods', function () {
        scope.data = 'data';
        ctrl.getLocations();
        expect(referenceDataService.setFeesForLocations).toHaveBeenCalledWith(
          scope.data,
          _.map(locations, 'LocationId')
        );
        expect(ctrl.setLocationProperties).toHaveBeenCalledWith(locations);
      });
    });
  });

  describe('setLocationFilter function -> ', function () {
    beforeEach(function () {
      scope.locations = [
        { NameLine1: 'Effingham', LocationId: 1 },
        { NameLine1: 'Altamont', LocationId: 2 },
        { NameLine1: 'Teutopolis', LocationId: 3 },
        { NameLine1: 'Sigel', LocationId: 4 },
      ];
    });

    it('should filter locations by searchString', function () {
      scope.filteredLocations = [];

      scope.setLocationFilter('Effing');
      expect(scope.filteredLocations).toEqual([
        { NameLine1: 'Effingham', LocationId: 1 },
      ]);

      scope.setLocationFilter('Alt');
      expect(scope.filteredLocations).toEqual([
        { NameLine1: 'Altamont', LocationId: 2 },
      ]);
    });
  });

  describe('getTaxableServiceTypeType function -> ', function () {
    it('should set the label based on TaxableServiceTypeId', function () {
      expect(ctrl.getTaxableServiceTypeType(1)).toEqual(
        'Not A Taxable Service'
      );

      expect(ctrl.getTaxableServiceTypeType(2)).toEqual('Provider');

      expect(ctrl.getTaxableServiceTypeType(3)).toEqual('Sales And Use');
    });

    it('should not fail when an unknown value is passed in', function () {
      expect(ctrl.getTaxableServiceTypeType()).toEqual('');
    });
  });

  describe('setLocationProperties function -> ', function () {
    beforeEach(function () {
      scope.locations = [
        { NameLine1: 'Effingham', LocationId: 1 },
        { NameLine1: 'Altamont', LocationId: 2 },
        { NameLine1: 'Teutopolis', LocationId: 3 },
      ];
    });

    it('should set locationInfo to ServiceCode defaults if no LocationSpecificInfo ', function () {
      scope.data = {
        Fee: 200.0,
        ServiceCode: angular.copy(serviceCodeMock),
        TaxableServiceTypeId: 1,
        LocationSpecificInfo: null,
      };
      ctrl.setLocationProperties(scope.locations);
      expect(scope.locations[0].$$LocationOverrides.$$FeeOverride).toEqual(
        scope.defaultFee
      );
      expect(
        scope.locations[0].$$LocationOverrides.$$TaxableServiceTypeId
      ).toEqual(scope.data.TaxableServiceTypeId);
    });

    it('should set locationInfo to LocationSpecificInfo if exists ', function () {
      scope.data = {
        Fee: 200.0,
        ServiceCode: angular.copy(serviceCodeMock),
        TaxableServiceTypeId: 1,
        LocationSpecificInfo: [
          { TaxableServiceTypeId: 2, LocationId: 1, Fee: 100.0 },
          { TaxableServiceTypeId: 1, LocationId: 2, Fee: 200.0 },
          { TaxableServiceTypeId: 3, LocationId: 3, Fee: 300.0 },
        ],
      };
      ctrl.setLocationProperties(scope.locations);
      expect(scope.locations[1].$$LocationOverrides.$$FeeOverride).toEqual(
        200.0
      );
      expect(
        scope.locations[2].$$LocationOverrides.$$TaxableServiceTypeId
      ).toEqual(3);
    });
  });
});
