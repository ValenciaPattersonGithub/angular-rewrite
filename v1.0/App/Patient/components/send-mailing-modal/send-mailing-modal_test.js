describe('send-mailing-modal ->', function () {
  var scope;
  var controller;

  var patientService = {
    get: jasmine.createSpy(),
  };

  var mInstance = {
    get: jasmine.createSpy(),
  };

  var item = {
    get: jasmine.createSpy(),
  };

  beforeEach(module('Soar.Patient'));

  // Controller Setup
  beforeEach(inject(function ($rootScope, $controller) {
    scope = $rootScope.$new();

    var dependencies = {
      $scope: scope,
      $uibModalInstance: mInstance,
      item: item,
      PatientServices: patientService,
    };

    controller = $controller('SendMailingModalController', dependencies);
  }));

  // Tests
  describe('initialize controller ->', function () {
    it('should exist', function () {
      expect(controller).not.toBeNull();
    });
  });
});
