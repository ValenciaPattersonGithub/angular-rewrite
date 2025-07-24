import { of } from 'rsjs';

describe('ChartingButtonServicesController tests ->', function () {
  var ctrl, scope, layoutItems, services;
  var chartingFavoritesFactory, referenceDataService, featureFlagService;

  chartingFavoritesFactory = {
    SetSelectedChartingFavorites: jasmine.createSpy().and.returnValue({
      then: jasmine.createSpy().and.returnValue(),
    }),
  };

  layoutItems = [
    {
      Id: '1,9db58108-8b45-e611-9a6b-a4db3021bfa0',
      Text: 'Internal Root Resorption',
    },
    {
      Id: '2,c3ac9626-8b45-e611-9a6b-a4db3021bfa0',
      Text: 'Crown3/4Resin',
    },
    {
      Id: '3,00000000-0000-0000-0000-000000000000',
      Text: 'Bad',
    },
  ];

  services = [
    {
      ServiceCodeId: 'c3ac9626-8b45-e611-9a6b-a4db3021bfa0',
      ServiceTypeId: '12',
      IconName: null,
      IsSwiftPickCode: false,
    },
    {
      ServiceCodeId: 'c4ac9626-8b45-e611-9a6b-a4db3021bfa0',
      ServiceTypeId: '13',
      IconName: 'Iconsvg',
      IsSwiftPickCode: false,
    },
    {
      ServiceCodeId: 'c5ac9626-8b45-e611-9a6b-a4db3021bfa0',
      ServiceTypeId: '14',
      IconName: null,
      IsSwiftPickCode: true,
    },
  ];

  beforeEach(
    module('Soar.Patient', function ($provide) {
      referenceDataService = {
        getData: jasmine.createSpy(),
        entityNames: {
          serviceTypes: 'serviceTypes',
          preventiveServiceTypes: 'preventiveServiceTypes',
          serviceCodes: 'serviceCodes',
        },
      };

      $provide.value('referenceDataService', referenceDataService);

      featureFlagService = {
        getOnce$: jasmine.createSpy().and.returnValue(of(false)),
      }
      $provide.value('featureFlagService', featureFlagService);
    })
  );

  var $q;

  beforeEach(inject(function ($rootScope, $controller, _$q_) {
    $q = _$q_;

    referenceDataService.getData.and.callFake(function () {
      return $q.resolve(services);
    });

    scope = $rootScope.$new();
    ctrl = $controller('ChartingButtonServicesController', {
      $scope: scope,
      ChartingFavoritesFactory: chartingFavoritesFactory,
    });
    scope.selectedLayoutItems = [];
  }));

  describe('servicesFilter function -> ', function () {
    beforeEach(function () {
      scope.filterBy = {
        text: '',
        serviceTypeId: '',
        showInactive: false,
      };
    });

    it('should return true if DisplayAs contains filterBy.text string', function () {
      scope.filterBy.text = 'Cr';
      expect(
        scope.servicesFilter({ DisplayAs: 'Cracked Tooth', IsActive: true })
      ).toBe(true);
    });

    it('should return true if filterBy.text is falsy', function () {
      scope.filterBy.text = '';
      expect(
        scope.servicesFilter({ DisplayAs: 'Cracked Tooth', IsActive: true })
      ).toBe(true);
    });

    it('should return false if DisplayAs does not contain filterBy.text string', function () {
      scope.filterBy.text = 'Blunted R';
      expect(
        scope.servicesFilter({ DisplayAs: 'Cracked Tooth', IsActive: true })
      ).toBe(false);
    });

    it('should return true if filterBy.serviceTypeId matches', function () {
      scope.filterBy.serviceTypeId = '12';
      expect(
        scope.servicesFilter({ ServiceTypeId: '12', IsActive: true })
      ).toBe(true);
    });

    it('should return false if filterBy.serviceTypeId doesnt match', function () {
      scope.filterBy.serviceTypeId = '1';
      expect(
        scope.servicesFilter({ ServiceTypeId: '12', IsActive: true })
      ).toBe(false);
    });

    it('should return true if filterBy.showInactive is true and item is inactive', function () {
      scope.filterBy.showInactive = true;
      expect(scope.servicesFilter({ IsActive: false })).toBe(true);
    });

    it('should return false if filterBy.showInactive is false and item is inactive', function () {
      expect(scope.servicesFilter({ IsActive: false })).toBe(false);
    });
  });

  describe('selectedLayoutItems watch -> ', function () {
    beforeEach(function () {
      scope.selectedLayoutItems = angular.copy(layoutItems);
      scope.services = angular.copy(services);
      ctrl.layoutItemType = '2';
    });

    it('should add services back to list if it is not present', function () {
      scope.servicesBackup = angular.copy(services);
      scope.selectedLayoutItems.length = 0;
      scope.services.length = 2;
      scope.$apply();
      expect(scope.services.length).toBe(3);
    });
  });

  describe('ctrl.getServiceChartIconUrl method -> ', function () {
    beforeEach(function () {
      scope.selectedLayoutItems = angular.copy(layoutItems);
      scope.servicesBackup = [];
      scope.services = angular.copy(services);
      ctrl.layoutItemType = '2';
    });

    it('should add default IconUrl to each service where service IconName is null', function () {
      angular.forEach(scope.services, function (service) {
        if (service.IsSwiftPickCode === false && service.IconName === null) {
          expect(scope.getServiceChartIconUrl(service)).toEqual(
            'Images/ChartIcons/default_service_code.svg'
          );
        }
      });
    });

    it('should add IconUrl based on IconName to each service where IconName is not null', function () {
      angular.forEach(scope.services, function (service) {
        if (service.IsSwiftPickCode === false && service.IconName !== null) {
          expect(scope.getServiceChartIconUrl(service)).toEqual(
            'Images/ChartIcons/' + service.IconName + '.svg'
          );
        }
      });
    });

    it('should add default IconUrl to swift code', function () {
      angular.forEach(scope.services, function (service) {
        if (service.IsSwiftPickCode === true && service.IconName !== null) {
          expect(scope.getServiceChartIconUrl(service)).toEqual(
            'Images/ChartIcons/default_swift_code.svg'
          );
        }
      });
    });
  });
});
