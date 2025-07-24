describe('ServiceFeeRollbackOptionsController ->', function () {
  var scope, ctrl, listHelper, timeout, modalFactory, localize, toastrFactory;

  //#region mocks

  var fakeServices = [
    {
      ServiceTransactionId: 1,
      DateEntered: '06/06/2015',
      ValidDate: true,
      AffectedAreaId: 0,
      Tooth: 'a',
      Surface: 'b',
      ProviderUserId: 'c',
      PriorFee: 50,
      Fee: 100,
      Selected: true,
    },
    {
      ServiceTransactionId: 2,
      DateEntered: '06/05/2015',
      ValidDate: true,
      AffectedAreaId: 0,
      Tooth: 'a',
      Surface: 'b',
      ProviderUserId: 'c',
      PriorFee: null,
      Fee: 200,
      Selected: true,
    },
  ];

  //#endregion

  //#region before each

  beforeEach(module('Soar.Common'));
  beforeEach(module('common.factories'));
  beforeEach(
    module('common.controllers', function ($provide) {
      localize = {
        getLocalizedString: jasmine.createSpy().and.callFake(function (val) {
          return val;
        }),
      };
      $provide.value('localize', localize);

      modalFactory = {
        CancelModal: jasmine.createSpy().and.returnValue({
          then: jasmine.createSpy(),
        }),
        Modal: jasmine.createSpy().and.returnValue({
          result: {
            then: function (fn) {
              fn();
            },
          },
        }),
      };
      $provide.value('ModalFactory', modalFactory);

      var modalInstance = {
        close: jasmine.createSpy(),
        dismiss: jasmine.createSpy(),
      };

      $provide.value('ModalInstance', modalInstance);

      toastrFactory = {};
      toastrFactory.error = jasmine.createSpy();
      toastrFactory.success = jasmine.createSpy();
      $provide.value('toastrFactory', toastrFactory);
    })
  );

  beforeEach(inject(function (
    $rootScope,
    $controller,
    $injector,
    $route,
    $timeout
  ) {
    timeout = $timeout;
    listHelper = $injector.get('ListHelper');

    scope = $rootScope.$new();
    ctrl = $controller('ServiceFeeRollbackOptionsController', {
      $scope: scope,
      ModalFactory: modalFactory,
      ListHelper: listHelper,
      $timeout: timeout,
      toastrFactory: toastrFactory,
      localize: localize,
    });
    // directive properties
  }));

  //#endregion

  describe('checkOriginalFees function -> ', function () {
    beforeEach(function () {
      scope.services = angular.copy(fakeServices);
      expect(scope.services.length).toBe(2);
    });

    it('should get a list of services with fees for rollback if service.PriorFee not equal null ', function () {
      expect(scope.services[0].PriorFee).toBe(50);
      expect(scope.services[1].PriorFee).toBe(null);
      ctrl.checkOriginalFees();
      expect(scope.servicesWithModifiedFees.length).toBe(1);
    });

    it('should set showMessage true if scope.servicesWithModifiedFees.length more than 0 ', function () {
      ctrl.checkOriginalFees();
      expect(scope.showMessage).toBe(true);
    });

    it('should set count for number of services for rollback ', function () {
      ctrl.checkOriginalFees();
      expect(scope.servicesToRollback).toBe(1);
    });
  });

  describe('init function -> ', function () {
    beforeEach(function () {});

    it('should call serviceCodesFactory if service codes not passed from parent ', function () {
      scope.serviceCodes = null;
      spyOn(ctrl, 'loadServiceCodes');
      ctrl.init();
      expect(ctrl.loadServiceCodes).toHaveBeenCalled();
    });

    it('should not call serviceCodesFactory if service codes are passed from parent ', function () {
      scope.serviceCodes = [{}, {}, {}];
      spyOn(ctrl, 'loadServiceCodes');
      ctrl.init();
      expect(ctrl.loadServiceCodes).not.toHaveBeenCalled();
    });
  });
});
