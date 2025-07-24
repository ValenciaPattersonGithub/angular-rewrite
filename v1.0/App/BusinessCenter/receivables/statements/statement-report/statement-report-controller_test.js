describe('statement-report ->', function () {
  var scope,
    ctrl,
    $routeParams,
    batchStatementService,
    locationServices,
    toastrFactory;

  beforeEach(module('Soar.BusinessCenter'));
  beforeEach(inject(function ($rootScope, $controller) {
    scope = $rootScope.$new();
    $routeParams = {
      batchStatementId: 123,
    };
    batchStatementService = {
      Service: {
        getReport: jasmine.createSpy('statementReportFactory.GetReport'),
      },
    };
    locationServices = {
      get: jasmine.createSpy('locationServices.get'),
    };
    toastrFactory = {
      error: jasmine.createSpy('toastrFactory.error'),
    };
    ctrl = $controller('StatementReportController', {
      $scope: scope,
      $routeParams: $routeParams,
      BatchStatementService: batchStatementService,
      LocationServices: locationServices,
      toastrFactory: toastrFactory,
    });
  }));

  describe('initial values ->', function () {
    it('StatementReportController : should check if controller exists', function () {
      expect(ctrl).not.toBeNull();
      expect(ctrl).not.toBeUndefined();
      expect(batchStatementService.Service.getReport).toHaveBeenCalled();
    });
  });

  describe('ctrl.getReportSuccess -> ', function () {
    it('should properly format given data', function () {
      var input = { Value: [{}, {}, {}, {}] };
      ctrl.getReportSuccess(input);
      expect(scope.reports).toEqual(input.Value);
      expect(locationServices.get).toHaveBeenCalled();
    });
  });

  describe('ctrl.getReportFailure -> ', function () {
    it('should call toastrFactrory', function () {
      ctrl.getReportFailure();
      expect(toastrFactory.error).toHaveBeenCalled();
    });
  });

  describe('ctrl.getLocationsSuccess -> ', function () {
    it('should map location name to report', function () {
      scope.reports = [{ LocationId: 3 }];
      ctrl.getLocationsSuccess({
        Value: [{ LocationId: 3, NameLine1: 'LocationName' }],
      });
      expect(scope.reports).toEqual([
        { LocationId: 3, LocationName: 'LocationName' },
      ]);
    });
  });
});
