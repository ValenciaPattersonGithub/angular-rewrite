describe('Controller: PaymentConfirmationController', function () {
  var ctrl, scope, modalInstance, dataForModal;
  var q, filter, deferred;
  var userSettingsService;
  beforeEach(module('Soar.Common'));
  beforeEach(module('common.factories'));
  beforeEach(module('Soar.Patient'));

  beforeEach(inject(function ($rootScope, $controller, $q, _$filter_) {
    scope = $rootScope.$new();
    q = $q;
    deferred = q.defer();
    filter = _$filter_;
    //mock for modal
    modalInstance = {
      close: jasmine.createSpy('modalInstance.close'),
      dismiss: jasmine.createSpy('modalInstance.dismiss'),
      result: {
        then: jasmine.createSpy('modalInstance.result.then'),
      },
    };

    //mock for dataForModal
    dataForModal = {
      PatientDetails: {
        Name: 'Chinmay Kulkarni',
      },
      PaymentDetails: {
        Amount: 100,
        Description: 'Check: #123',
      },
    };

    userSettingsService = {
      get: jasmine.createSpy().and.returnValue({ $promise: deferred.promise }),
    };

    ctrl = $controller('PaymentConfirmationController', {
      $scope: scope,
      $uibModalInstance: modalInstance,
      DataForModal: dataForModal,
      UserSettingsService: userSettingsService,
    });
  }));

  //controller
  it('PaymentConfirmationController : should check if controller exists', function () {
    expect(ctrl).not.toBeNull();
  });

  describe('initializations ->', function () {
    it('should initialize all required variables', function () {
      expect(scope.patientName).toEqual(dataForModal.PatientDetails.Name);
      //these have been commented out of the controllerDefaultHourColumnCount
      //expect(scope.paymentAmount).toEqual(dataForModal.PaymentDetails.Amount);
      //expect(scope.paymentDescription).toEqual(dataForModal.PaymentDetails.Description);
    });
    it('userSettingsService.get should be called', function () {
      expect(userSettingsService.get).toHaveBeenCalled();
    });
  });

  describe('closeModal ->', function () {
    it('should close modalinstance', function () {
      scope.closeModal();
      expect(modalInstance.close).toHaveBeenCalled();
    });
  });

  describe('cancelModal ->', function () {
    it('should close modalinstance', function () {
      scope.cancelModal();
      expect(modalInstance.close).toHaveBeenCalled();
    });
  });
});
