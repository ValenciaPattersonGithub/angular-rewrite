describe('Soar.Patient PatientIdentifierController -> ', function () {
  var scope;
  var controller;

  // Mocks
  var response = {
    Value: [
      {
        MasterPatientIdentifierId: 1,
        Description: 'Identifier1',
      },
    ],
  };

  var toastrFactory = {
    error: jasmine.createSpy(),
  };

  var patientAdditionalIdentifierService = {
    get: jasmine.createSpy(),
  };

  // Load Modules
  beforeEach(module('Soar.Patient'));

  // Controller Setup
  beforeEach(inject(function ($rootScope, $controller) {
    scope = $rootScope.$new();

    scope.person = {};

    var dependencies = {
      $scope: scope,
      toastrFactory: toastrFactory,
      PatientAdditionalIdentifierService: patientAdditionalIdentifierService,
    };

    controller = $controller('PatientIdentifierController', dependencies);
  }));

  // Tests
  describe('initialize controller ->', function () {
    it('should exist', function () {
      expect(controller).not.toBeNull();
    });
    it('should call getAdditionalIdentifier', function () {
      expect(patientAdditionalIdentifierService.get).toHaveBeenCalled();
      expect(scope.formIsValid).toBe(true);
    });
  });

  describe('getAdditionalIdentifier success ->', function () {
    it('should populate response', function () {
      scope.patientIdentifierGetIdenfierSuccess(response);

      expect(scope.referral).toBeDefined();
      expect(scope.referral.MasterPatientIdentifierId).toBe(
        response.Value.MasterPatientIdentifierId
      );
      expect(scope.referral.Description).toBe(response.Value.Description);
      expect(scope.additionalIdenfiers.length).toBeGreaterThan(0);
    });
  });

  describe('getAdditionalIdentifier failure ->', function () {
    it('should display toast error', function () {
      scope.patientIdentifierGetIdenfierFailure();

      expect(toastrFactory.error).toHaveBeenCalled();
    });
  });
});
