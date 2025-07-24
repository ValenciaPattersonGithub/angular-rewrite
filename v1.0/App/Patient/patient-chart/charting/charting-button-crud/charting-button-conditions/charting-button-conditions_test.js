import { of } from 'rsjs';

describe('ChartingButtonConditionsController tests ->', function () {
  var ctrl, scope, layoutItems, conditions;
  var chartingFavoritesFactory;
  var $q;
  var referenceDataServiceMock, featureFlagServiceMock;

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

  conditions = [
    {
      ConditionId: '9db58108-8b45-e611-9a6b-a4db3021bfa0',
      Name: 'ConditionOne',
    },
    {
      ConditionId: '8db58108-8b45-e611-9a6b-a4db3021bfa0',
      Name: 'ConditionTwo',
    },
  ];

  beforeEach(module('Soar.Patient'));

  beforeEach(inject(function ($rootScope, $controller, _$q_) {
    scope = $rootScope.$new();
    $q = _$q_;

    referenceDataServiceMock = {
      getData: jasmine.createSpy().and.returnValue($q.resolve([])),
      entityNames: {
        conditions: 'conditions',
      },
    };

    const conditionsService = {};
    featureFlagServiceMock = {
      getOnce$: jasmine.createSpy().and.returnValue(of(false))
    };
    const fuseFlag = {};
    ctrl = $controller('ChartingButtonConditionsController', {
      $scope: scope,
      ChartingFavoritesFactory: chartingFavoritesFactory,
      referenceDataService: referenceDataServiceMock,
      conditionsService: conditionsService,
      featureFlagService: featureFlagServiceMock,
      fuseFlag: fuseFlag
    });
    scope.selectedLayoutItems = [];
  }));

  describe('conditionsFilter function -> ', function () {
    beforeEach(function () {
      scope.filterBy = '';
    });

    it('should return true if Description contains filterBy string', function () {
      scope.filterBy = 'Cr';
      expect(scope.conditionsFilter({ Description: 'Cracked Tooth' })).toBe(
        true
      );
    });

    it('should return true if filterBy is falsy', function () {
      scope.filterBy = '';
      expect(scope.conditionsFilter({ Description: 'Cracked Tooth' })).toBe(
        true
      );
    });

    it('should return false if Description does not contain filterBy string', function () {
      scope.filterBy = 'Blunted R';
      expect(scope.conditionsFilter({ Description: 'Cracked Tooth' })).toBe(
        false
      );
    });
  });

  describe('chartingFavoritesFactory.SetSelectedChartingFavorites watcher -> ', function () {
    beforeEach(function () {
      scope.selectedLayoutItems = angular.copy(layoutItems);
      scope.conditions = angular.copy(conditions);
    });

    it('should add condition back to list if it is not present', function () {
      scope.conditionsBackup = angular.copy(conditions);
      scope.selectedLayoutItems.length = 0;
      scope.conditions.length = 2;
      scope.$apply();
      expect(scope.conditions.length).toBe(2);
    });
  });

  describe('ctrl.getConditionChartIconUrl method -> ', function () {
    beforeEach(function () {
      scope.conditions = [];
      scope.conditionsBackup = [];
      scope.selectedLayoutItems = angular.copy(layoutItems);
      scope.conditions = angular.copy(conditions);
    });

    it('should return url for each condition', function () {
      angular.forEach(scope.conditions, function (cond) {
        expect(scope.getConditionChartIconUrl(cond)).toEqual(
          'Images/ConditionIcons/default_condition.svg'
        );
      });
    });
  });
});
