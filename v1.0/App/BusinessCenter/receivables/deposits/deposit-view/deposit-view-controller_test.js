describe('deposit-view-controller ->', function () {
  var ctrl,
    q,
    deferred,
    scope,
    window,
    routeParams,
    depositService,
    filter,
    timeZoneFactory,
    toastrFactory,
    localize;

  var mockDeposit = {
    DepositId: 1,
    LocationId: 2,
  };

  beforeEach(module('Soar.BusinessCenter'));

  // Controller Setup
  beforeEach(inject(function (
    $rootScope,
    $filter,
    $q,
    $controller,
    $routeParams,
    $window
  ) {
    scope = $rootScope.$new();
    spyOn(scope, '$emit');
    q = $q;
    deferred = q.defer();
    routeParams = $routeParams;
    routeParams.locationId = 1;
    routeParams.depositId = 2;

    window = $window;

    depositService = {
      getSelectedDeposit: jasmine
        .createSpy()
        .and.returnValue({ $promise: deferred.promise }),
    };

    localize = {
      getLocalizedString: jasmine.createSpy().and.returnValue(''),
    };

    toastrFactory = {
      success: jasmine.createSpy(),
      error: jasmine.createSpy(),
    };

    scope.deposit = mockDeposit;

    var dependencies = {
      $scope: scope,
      $window: window,
      $routeParams: routeParams,
      DepositService: depositService,
      $filter: filter,
      TimeZoneFactory: timeZoneFactory,
      toastrFactory: toastrFactory,
      localize: localize,
    };

    ctrl = $controller('DepositViewController', dependencies);
  }));

  // Tests
  describe('initialize controller ->', function () {
    it('should exist', function () {
      expect(ctrl).not.toBeNull();
    });
  });

  describe('scope.getSelectedDeposit ->', function () {
    it('should call getSelectedDeposit', function () {
      scope.getSelectedDeposit();
      expect(depositService.getSelectedDeposit).toHaveBeenCalled();
    });
  });

  //describe('ctrl.getDepositSuccess ->', function () {
  //    it('ctrl.getDepositSuccess: should retrieve selected deposit',
  //        function () {
  //            var result = {
  //                Value.DepositItem: [mockDepositDto]
  //            };
  //            ctrl.getDepositSuccess(result);
  //            expect(result).not.toBeNull();
  //        });
  //});
});
