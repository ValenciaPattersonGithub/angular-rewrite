describe('ChartingButtonCrudController tests ->', function () {
  var ctrl, scope, layoutItems, conditions, services;
  var chartingFavoritesFactory;

  chartingFavoritesFactory = {
    SetSelectedChartingFavorites: jasmine.createSpy().and.returnValue({
      then: jasmine.createSpy().and.returnValue(),
    }),
  };

  conditions = [
    {
      ConditionId: '9db58108-8b45-e611-9a6b-a4db3021bfa0',
    },
  ];

  services = [
    {
      ServiceCodeId: 'c3ac9626-8b45-e611-9a6b-a4db3021bfa0',
      ServiceTypeId: '12',
      IconName: 'randomIconName',
      IsSwiftPickCode: false,
    },
    {
      ServiceCodeId: 'c4ac9626-8b45-e611-9a6b-a4db3021bfa0',
      ServiceTypeId: '13',
      IconName: null,
      IsSwiftPickCode: false,
    },
  ];

  beforeEach(module('Soar.Patient'));

  beforeEach(inject(function ($rootScope, $controller) {
    scope = $rootScope.$new();
    ctrl = $controller('ChartingButtonCrudController', {
      $scope: scope,
      UserServices: {},
      ScheduleServices: {},
      ModalFactory: {},
      ChartingFavoritesFactory: chartingFavoritesFactory,
    });
    scope.selectedLayoutItems = [];
  }));

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
