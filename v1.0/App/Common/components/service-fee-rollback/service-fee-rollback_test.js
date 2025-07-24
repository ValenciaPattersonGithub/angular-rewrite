describe('ServiceFeeRollbackController ->', function () {
  var scope,
    listHelper,
    localize,
    timeout,
    modalFactory,
    ctrl,
    servicesToRollback;
  var CdtCodeService, patientServicesFactory, modalInstance, toastrFactory;

  //#region mocks

  var fakeServices = [
    {
      ServiceTransactionId: 1,
      PriorFee: 50,
      Fee: 100,
      Selected: true,
    },
    { ServiceTransactionId: 2, PriorFee: 100, Fee: 200, Selected: true },
  ];

  var fakeServiceCodes = [{}, {}, {}];

  var fakeCdtCodes = [
    { CdtCodeId: 1, Code: '1234' },
    { CdtCodeId: 2, Code: '2345' },
    { CdtCodeId: 3, Code: '3456' },
  ];

  //#endregion

  //#region before each
  beforeEach(
    module('Soar.Patient', function ($provide) {
      patientServicesFactory = {
        feeRollback: jasmine.createSpy().and.returnValue({
          then: jasmine.createSpy(),
        }),
      };
      $provide.value('PatientServicesFactory', patientServicesFactory);

      CdtCodeService = {
        getList: jasmine.createSpy().and.returnValue({
          then: jasmine.createSpy(),
        }),
      };
      $provide.value('CdtCodeService', CdtCodeService);
    })
  );

  beforeEach(module('Soar.Common'));
  beforeEach(module('common.factories'));
  beforeEach(
    module('common.controllers', function ($provide) {
      var serviceCodes = jasmine.createSpy().and.returnValue(fakeServiceCodes);
      $provide.value('serviceCodes', serviceCodes);

      servicesToRollback = jasmine.createSpy().and.returnValue({});
      $provide.value('servicesToRollback', servicesToRollback);

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

      modalInstance = {
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
    ctrl = $controller('ServiceFeeRollbackController', {
      $scope: scope,
      ModalFactory: modalFactory,
      ListHelper: listHelper,
      $timeout: timeout,
      $uibModalInstance: modalInstance,
      toastrFactory: toastrFactory,
      localize: localize,
    });
    // directive properties
  }));

  //#endregion

  describe('validateRollback function -> ', function () {
    beforeEach(function () {
      scope.servicesToRollback = angular.copy(fakeServices);
    });

    it('should get a list of services that are selected for rollback based on $$RollbackFee ', function () {
      scope.servicesToRollback[0].$$RollbackFee = true;
      var servicesForRollback = ctrl.validateRollback();
      expect(servicesForRollback.length).toBe(1);
    });

    it('should set dataHasChanged to true if scope.servicesForRollback.length more than 0 ', function () {
      scope.servicesToRollback[0].$$RollbackFee = true;
      ctrl.validateRollback();
      expect(scope.dataHasChanged).toBe(true);
    });
  });

  describe('rollBackFees function -> ', function () {
    beforeEach(function () {
      scope.servicesToRollback = angular.copy(fakeServices);
    });

    it('should call patientServicesFactory.feeRollback with servicesForRollback if scope.dataHasChanged ', function () {
      scope.servicesToRollback[0].$$RollbackFee = true;
      scope.rollBackFees();
      var servicesForRollback = ctrl.validateRollback();
      expect(patientServicesFactory.feeRollback).toHaveBeenCalledWith(
        servicesForRollback
      );
    });

    it('should not call patientServicesFactory.feeRollback with servicesForRollback if scope.dataHasChanged is false ', function () {
      scope.servicesToRollback[0].$$RollbackFee = false;
      scope.rollBackFees();
      ctrl.validateRollback();
      expect(patientServicesFactory.feeRollback).not.toHaveBeenCalled();
    });
  });

  describe('cancelListChanges function -> ', function () {
    it('should call modalFactory.CancelModal if scope.dataHasChanged ', function () {
      scope.dataHasChanged = true;
      scope.cancelListChanges();
      expect(modalFactory.CancelModal).toHaveBeenCalled();
    });

    it('should call cancelChanges if scope.dataHasChanged is false ', function () {
      spyOn(scope, 'cancelChanges');
      scope.dataHasChanged = false;
      scope.cancelListChanges();
      expect(scope.cancelChanges).toHaveBeenCalled();
    });
  });

  describe('loadCdtCodesToService function -> ', function () {
    beforeEach(function () {
      scope.servicesToRollback = angular.copy(fakeServices);
      scope.cdtCodes = angular.copy(fakeCdtCodes);
      scope.serviceCodes = angular.copy(fakeServiceCodes);
    });

    it('should set cdtCode for each service ', function () {
      listHelper.findIndexByFieldValue = jasmine
        .createSpy('listHelper.findIndexByFieldValue')
        .and.returnValue(0);
      ctrl.loadServiceCodesToServices();
      ctrl.loadCdtCodesToService();
      angular.forEach(scope.servicesToRollback, function (svc) {
        expect(svc.$$CdtCode).toEqual(scope.cdtCodes[0].Code);
      });
    });
  });

  describe('loadServiceCodesToServices function -> ', function () {
    beforeEach(function () {
      scope.servicesToRollback = angular.copy(fakeServices);
      scope.cdtCodes = angular.copy(fakeCdtCodes);
      scope.serviceCodes = angular.copy(fakeServiceCodes);
    });

    it('should set cdtCode for each service ', function () {
      listHelper.findIndexByFieldValue = jasmine
        .createSpy('listHelper.findIndexByFieldValue')
        .and.returnValue(0);
      ctrl.loadServiceCodesToServices();
      angular.forEach(scope.servicesToRollback, function (svc) {
        expect(svc.$$ServiceCode).toEqual(scope.serviceCodes[0]);
      });
    });
  });
});
