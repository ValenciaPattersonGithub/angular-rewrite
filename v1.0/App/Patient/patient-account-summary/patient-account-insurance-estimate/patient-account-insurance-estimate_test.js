describe('PatientAccountInsuranceEstimateController ->', function () {
  var scope, ctrl, controller, patSecurityService;
  beforeEach(module('Soar.Patient'));

  function createController() {
    return controller('PatientAccountInsuranceEstimateController', {
      $scope: scope,
      patSecurityService: patSecurityService,
    });
  }

  beforeEach(inject(function ($rootScope, $controller, $injector) {
    //mock for patSecurityService
    patSecurityService = {
      IsAuthorizedByAbbreviation: jasmine
        .createSpy('patSecurityService.IsAuthorizedByAbbreviation')
        .and.returnValue(true),
      generateMessage: jasmine.createSpy('patSecurityService.generateMessage'),
    };
    scope = $rootScope.$new();
    controller = $controller;
    ctrl = createController();

    scope.disablePayments = true;
    scope.hasPatientInsurancePaymentViewAccess = false;

    ctrl.soarAuthInsPaymentViewKey = 'soar-acct-aipmt-view';
    scope.hasPatientInsurancePaymentViewAccess = false;
  }));

  describe('controller should not be empty', function () {
    it('PatientAccountInsuranceEstimateController should not be null or undefined ', function () {
      expect(ctrl).not.toBe(null);
      expect(ctrl.soarAuthInsPaymentViewKey).toEqual('soar-acct-aipmt-view');
    });
  });

  describe('scope.makeInsurancePayment  ->', function () {
    it('should gets call to scope.paymentFunction method which passed  from parent controller ', function () {
      scope.paymentFunction = jasmine.createSpy();
      scope.makeInsurancePayment();
      expect(scope.paymentFunction).toHaveBeenCalled();
    });
  });

  describe('ctrl.authPatientInsurancePaymentViewAccess  ->', function () {
    it('should gets call to scope.paymentFunction method which passed  from parent controller ', function () {
      patSecurityService.IsAuthorizedByAbbreviation = jasmine.createSpy();
      ctrl.authPatientInsurancePaymentViewAccess();
      expect(patSecurityService.IsAuthorizedByAbbreviation).toHaveBeenCalled();
    });
  });
});
