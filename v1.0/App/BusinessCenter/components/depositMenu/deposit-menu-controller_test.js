describe('deposit-menu-controller ->', function () {
  var ctrl,
    q,
    deferred,
    scope,
    tabLauncher,
    window,
    depositService,
    modalFactory,
    localize,
    toastrFactory;

  var mockDeposit = {
    DepositId: 1,
    LocationId: 2,
  };
  // #region Setup

  beforeEach(module('common.factories'));

  beforeEach(inject(function ($rootScope, $controller, $q) {
    scope = $rootScope.$new();
    spyOn(scope, '$emit');
    q = $q;
    deferred = q.defer();
    tabLauncher = {
      launchNewTab: jasmine.createSpy(),
    };

    window = {
      location: {
        href: jasmine.createSpy(),
      },
    };

    depositService = {
      delete: jasmine
        .createSpy()
        .and.returnValue({ $promise: deferred.promise }),
      getDepositDetails: jasmine
        .createSpy()
        .and.returnValue({ $promise: deferred.promise }),
    };

    modalFactory = {
      ConfirmModal: jasmine.createSpy().and.returnValue({
        then: jasmine.createSpy().and.callFake(function () {
          depositService.delete();
        }),
      }),
    };

    localize = {
      getLocalizedString: jasmine.createSpy().and.returnValue(''),
    };

    toastrFactory = {
      success: jasmine.createSpy(),
      error: jasmine.createSpy(),
    };

    scope.deposit = mockDeposit;

    ctrl = $controller('DepositMenuController', {
      $scope: scope,
      tabLauncher: tabLauncher,
      $window: window,
      DepositService: depositService,
      ModalFactory: modalFactory,
      localize: localize,
      toastrFactory: toastrFactory,
    });
  }));

  // #endregion

  // #region Tests

  describe('initial values ->', function () {
    it('DepositMenuController : should check if controller exists', function () {
      expect(ctrl).not.toBeNull();
      expect(ctrl).not.toBeUndefined();
    });

    it('scope.deposit', function () {
      expect(scope.deposit).not.toBeNull();
      expect(scope.deposit).not.toBeUndefined();
    });
  });

  describe('scope.printDeposit ->', function () {
    it('should launch new tab', function () {
      scope.deposit.CreditTransactions = {};
      scope.printDeposit();
      expect(tabLauncher.launchNewTab).toHaveBeenCalled();
    });
  });

  describe('scope.editDeposit ->', function () {
    it('should call getDepositDetails when CreditTransactions is undefined', function () {
      scope.deposit.CreditTransactions = undefined;
      scope.editDeposit();
      expect(depositService.getDepositDetails).toHaveBeenCalled();
    });
    it('should redirect to edit page', function () {
      scope.deposit.CreditTransactions = {};
      scope.editDeposit();

      expect(scope.selectedLocationId).toEqual(scope.deposit.LocationId);
      expect(window.location.href).toContain('Edit');
    });
  });

  describe('scope.deleteDeposit ->', function () {
    it('should call modalFactory.ConfirmModal', function () {
      scope.deleteDeposit();
      expect(modalFactory.ConfirmModal).toHaveBeenCalled();
      expect(depositService.delete).toHaveBeenCalled();
    });
    it('should emit refreshDepositGrid', function () {
      ctrl.deleteDepositSuccess();

      expect(toastrFactory.success).toHaveBeenCalled();
      expect(scope.$emit).toHaveBeenCalledWith('refreshDepositGrid');
    });
  });

  // #endregion
});
