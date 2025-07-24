describe('MedicalHistoryPrintController ->', function () {
  //#region init tests

  beforeEach(module('Soar.Common'));
  beforeEach(module('common.factories'));

  var routeParams = {};
  var patientServices;
  var medicalHistoryFactory;
  beforeEach(
    module('Soar.Patient', function ($provide) {
      medicalHistoryFactory = {
        create: jasmine.createSpy(),
        getById: jasmine.createSpy(),
      };
      $provide.value('MedicalHistoryFactory', medicalHistoryFactory);

      patientServices = {
        Patients: {
          get: jasmine.createSpy(),
        },
      };
      $provide.value('PatientServices', patientServices);
      $provide.value('$routeParams', routeParams);
    })
  );

  var controller, scope;
  beforeEach(inject(function ($rootScope, $controller) {
    scope = $rootScope.$new();

    controller = $controller('MedicalHistoryPrintController', {
      $scope: scope,
    });
  }));

  //#endregion

  //#region describe tests

  describe('intitial setup -> ', function () {
    it('should instantiate the controller', function () {
      expect(controller).not.toBeNull();
    });
  });

  describe('resolveForm', function () {
    it('should set form state scope values', function () {
      controller.resolveForm();
      expect(scope.formSections).toEqual(new Array());
      expect(scope.loadingForm).toBe(true);
    });

    it('should get a blank medical history form when formType is "blank"', function () {
      routeParams.formType = 'blank';
      controller.resolveForm();
      expect(medicalHistoryFactory.create).toHaveBeenCalled();
    });

    it('should get the patient\'s current medical history form when formType is "current"', function () {
      routeParams.formType = 'current';
      controller.resolveForm();
      expect(medicalHistoryFactory.getById).toHaveBeenCalled();
    });

    it('should not throw an error if the formType is not "blank" or not "current"', function () {
      routeParams.formType = null;
      expect(controller.resolveForm).not.toThrow();
    });
  });

  describe('setPatient', function () {
    it('should create $scope.patient object', function () {
      var anEmptyString = '';
      expect(scope.patient).toBeTruthy();
      expect(scope.patient.FirstName).toBe(anEmptyString);
      expect(scope.patient.LastName).toBe(anEmptyString);
      expect(scope.patient.Sex).toBe(anEmptyString);
      expect(scope.patient.DateOfBirth).toBe(anEmptyString);
    });

    it('should request a patient based on route param', function () {
      expect(scope.loadingPatient).toBe(true);
      expect(patientServices.Patients.get).toHaveBeenCalled();
    });
  });

  //#endregion
});
