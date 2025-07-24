describe('ReceivableMenuController ->', function () {
  var scope,
    ctrl,
    toastrFactory,
    controller,
    patientServices,
    modalDataFactory,
    usersFactory,
    modalFactory,
    q,
    deferred;

  function createController() {
    ctrl = controller('ReceivableMenuController', {
      $scope: scope,
      PatientServices: patientServices,
      toastrFactory: toastrFactory,
      ModalDataFactory: modalDataFactory,
      UsersFactory: usersFactory,
      ModalFactory: modalFactory,
    });

    ctrl.getCurrentPatientById = jasmine
      .createSpy('ctrl.getCurrentPatientById')
      .and.returnValue({ then: function () {} });
  }

  beforeEach(module('Soar.Common'));
  beforeEach(module('common.factories'));
  beforeEach(module('Soar.BusinessCenter'));

  beforeEach(inject(function ($rootScope, $controller, $injector, $q) {
    scope = $rootScope.$new();
    spyOn(scope, '$emit');
    controller = $controller;
    q = $q;
    deferred = q.defer();

    scope.receivable = { ResponsiblePartyId: '' };
    scope.modalInstance = { close: jasmine.createSpy() };

    patientServices = {
      Account: {
        updateAccountInCollections: jasmine
          .createSpy()
          .and.returnValue({ $promise: deferred.promise }),
      },
    };
    toastrFactory = {
      success: jasmine.createSpy(),
      error: jasmine.createSpy(),
    };
    modalDataFactory = {};
    modalFactory = {
      TransactionModal: jasmine.createSpy(),
      ConfirmModal: jasmine.createSpy().and.returnValue({
        then: jasmine.createSpy().and.callFake(function () {
          patientServices.Account.updateAccountInCollections();
        }),
      }),
    };
    usersFactory = {
      Users: jasmine.createSpy().and.returnValue({ then: function () {} }),
    };
  }));

  describe('controller ->', function () {
    beforeEach(function () {
      createController();
    });

    it('should exist', function () {
      expect(ctrl).not.toBeNull();
    });

    it('should call usersFactory.Users', function () {
      expect(usersFactory.Users).toHaveBeenCalled();
    });

    describe('ctrl.getProviders function ->', function () {
      it('should call usersFactory.Users', function () {
        ctrl.getProviders();
        expect(usersFactory.Users).toHaveBeenCalled();
      });
    });

    describe('ctrl.userServicesGetSuccess ->', function () {
      var successResponse = { Value: [{}] };

      it('should call ctrl.enablePayments and set ctrl.providers.length to 1', function () {
        ctrl.enablePayments = jasmine.createSpy('ctrl.enablePayments');
        ctrl.userServicesGetSuccess(successResponse);
        expect(ctrl.enablePayments).toHaveBeenCalled();
        expect(ctrl.providers.length).toEqual(1);
      });
    });

    describe('ctrl.userServicesGetFailure ->', function () {
      it('should call ctrl.enablePayments and set ctrl.providers.length to 0', function () {
        ctrl.enablePayments = jasmine.createSpy('ctrl.enablePayments');
        ctrl.userServicesGetFailure();
        expect(ctrl.enablePayments).toHaveBeenCalled();
        expect(ctrl.providers.length).toEqual(0);
        expect(toastrFactory.error).toHaveBeenCalled();
      });
    });

    describe('ctrl.enablePayments ->', function () {
      it('should set scope.disablePayments to true', function () {
        ctrl.providers = [];
        ctrl.enablePayments();
        expect(scope.disablePayments).toEqual(true);
      });
    });

    describe('ctrl.enablePayments ->', function () {
      it('should set scope.disablePayments to false', function () {
        ctrl.providers = [{}];
        ctrl.enablePayments();
        expect(scope.disablePayments).toEqual(false);
      });
    });

    describe('ctrl.openModal ->', function () {
      it('should call modalFactory.TransactionModal', function () {
        var dataForModal = {};

        ctrl.openModal(dataForModal);
        expect(modalFactory.TransactionModal).toHaveBeenCalled();
        expect(ctrl.dataForModal).toEqual(dataForModal);
      });
    });

    describe('ctrl.patientPaymentModalResultCancel ->', function () {
      it('should call set scope.applyingPayment to false', function () {
        ctrl.patientPaymentModalResultCancel();
        expect(scope.applyingPayment).toEqual(false);
      });
    });

    describe('$scope.createStatement ->', function () {
      it('should call $scope.createStatement', function () {
        var receivable = {};

        scope.createStatement(receivable);
        expect(ctrl.getCurrentPatientById).toHaveBeenCalled();
      });
    });

    describe('$scope.applyPayment ->', function () {
      it('should call $scope.getCurrentPatientById and set $scope.applyingPayment to true', function () {
        var receivable = {};

        scope.applyPayment(receivable);
        expect(ctrl.getCurrentPatientById).toHaveBeenCalled();
        expect(scope.applyingPayment).toEqual(true);
      });
    });

    describe('$scope.applyPayment ->', function () {
      it('should call $scope.getCurrentPatientById', function () {
        var receivable = {};

        scope.applyingPayment = true;
        scope.applyPayment(receivable);
        expect(ctrl.getCurrentPatientById).not.toHaveBeenCalled();
      });
    });

    describe('$scope.viewInsurance ->', function () {
      it('should call $scope.getCurrentPatientById', function () {
        var receivable = {};

        scope.viewInsurance(receivable);
        expect(ctrl.getCurrentPatientById).toHaveBeenCalled();
      });
    });

    describe('$scope.createCommunication ->', function () {
      it('should call $scope.getCurrentPatientById', function () {
        var receivable = {};

        scope.createCommunication(receivable);
        expect(ctrl.getCurrentPatientById).toHaveBeenCalled();
      });
    });

    describe('$scope.$on("closeCommunicationModal") ->', function () {
      it('should call $scope.modalInstance.close();', function () {
        var listener = jasmine.createSpy();
        scope.$broadcast('closeCommunicationModal');
        expect(scope.modalInstance.close).toHaveBeenCalled();
      });
    });

    describe('$scope.viewProfile ->', function () {
      it('should call $scope.getCurrentPatientById', function () {
        var receivable = {};

        scope.viewProfile(receivable);
        expect(ctrl.getCurrentPatientById).toHaveBeenCalled();
      });
    });

    describe('$scope.updateAccountInCollections ->', function () {
      it('should call patientServices.Account.updateAccountInCollections', function () {
        var receivable = {
          AccountId: '7EA85A2B-BBBF-4BFA-BFEA-EBFBE91FFF61',
          InCollections: false,
        };
        ctrl.updateAccountInCollectionsSuccess = jasmine.createSpy();

        scope.updateAccountInCollections(receivable);

        expect(modalFactory.ConfirmModal).toHaveBeenCalled();
        expect(
          patientServices.Account.updateAccountInCollections
        ).toHaveBeenCalled();
      });
      it('should call confirm modal when removing account from Collections', function () {
        var receivable = {
          AccountId: '7EA85A2B-BBBF-4BFA-BFEA-EBFBE91FFF61',
          InCollections: true,
        };
        ctrl.updateAccountInCollectionsSuccess = jasmine.createSpy();
        scope.updateAccountInCollections(receivable);
        deferred.resolve({});
        scope.$apply();
        expect(modalFactory.ConfirmModal).toHaveBeenCalled();
      });
    });

    describe('ctrl.refreshGrids ->', function () {
      it('should emit refreshGrids', function () {
        ctrl.refreshGrids();
        expect(scope.$emit).toHaveBeenCalledWith('refreshGrids');
      });
    });
  });
});
