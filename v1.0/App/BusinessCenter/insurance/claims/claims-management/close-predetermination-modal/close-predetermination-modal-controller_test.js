describe('close-predetermination-modal', function () {
  var ctrl,
    scope,
    mInstance,
    location,
    localize,
    toastrFactory,
    patientServices,
    closePredeterminationObject,
    compile;

  beforeEach(module('Soar.Patient'));
  beforeEach(module('Soar.BusinessCenter'));

  beforeEach(inject(function ($rootScope, $controller, $injector, $compile) {
    scope = $rootScope.$new();
    compile = $compile;

    // mock patientServices
    patientServices = {
      Predetermination: {
        Close: jasmine.createSpy(),
      },
    };

    //mock for toastrFactory
    toastrFactory = {
      success: jasmine.createSpy(),
      error: jasmine.createSpy(),
    };

    //mock for localize
    localize = {
      getLocalizedString: jasmine.createSpy().and.returnValue(''),
    };

    //mock for location
    location = {
      path: 'path/',
      $$path: {
        substr: jasmine.createSpy(),
        indexOf: jasmine.createSpy(),
      },
    };

    //mock uibModalInstance
    mInstance = {
      close: function () {},
      dismiss: function () {},
    };

    //mock closePredeterminationObject
    closePredeterminationObject = {
      ClaimId: '3284F4C0-CC60-E611-B259-989096E2D412',
      Note: null,
      NoInsurancePayment: true,
      RecreateClaim: false,
      CloseClaimAdjustment: null,
      UpdateServiceTransactions: true,
      disableCancel: false,
    };

    //mock controller
    ctrl = $controller('ClosePredeterminationModalController', {
      $scope: scope,
      $uibModalInstance: mInstance,
      $location: location,
      toastrFactory: toastrFactory,
      localize: localize,
      PatientServices: patientServices,
      closePredeterminationObject: closePredeterminationObject,
    });
  }));

  describe('scope.closePredetermination ->', function () {
    it('closePredeterminationObject.Note should be Test Note and patientServices.Predetermination.Close should be called', function () {
      scope.note = 'Test Note';
      scope.closePredetermination();
      expect(closePredeterminationObject.Note).toBe('Test Note');
      expect(patientServices.Predetermination.Close).toHaveBeenCalled();
    });

    it('closePredeterminationObject.Note should be Empty String and patientServices.Predetermination.Close should be called', function () {
      scope.note = null;
      scope.closePredetermination();
      expect(closePredeterminationObject.Note).toBe('');
      expect(patientServices.Predetermination.Close).toHaveBeenCalled();
    });
  });

  describe('ctrl.closePredeterminationSuccess ->', function () {
    it('should call toastrFactory.success, uibModalInstance.close, and location.path', function () {
      location.path = jasmine.createSpy();
      spyOn(mInstance, 'close');
      ctrl.closePredeterminationSuccess();
      expect(toastrFactory.success).toHaveBeenCalled();
      expect(mInstance.close).toHaveBeenCalled();
    });
  });

  describe('ctrl.closePredeterminationFailure ->', function () {
    it('should call toastrFactory.error', function () {
      ctrl.closePredeterminationFailure();
      expect(toastrFactory.error).toHaveBeenCalled();
    });
  });

  describe('scope.cancelClosePredetermination ->', function () {
    it('should call mInstance.dismiss', function () {
      spyOn(mInstance, 'dismiss');
      scope.cancelClosePredetermination();
      expect(mInstance.dismiss).toHaveBeenCalled();
    });
  });
});
