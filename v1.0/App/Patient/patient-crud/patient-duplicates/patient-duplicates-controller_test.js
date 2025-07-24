describe('patient-duplicates-controller ->', function () {
  beforeEach(module('Soar.Common'));
  beforeEach(module('common.factories'));

  // Create spies for services
  beforeEach(
    module('Soar.Patient', function ($provide) {
      var patientServices = {
        Patients: {
          get: jasmine.createSpy().and.returnValue(duplicatePatientsMock),
          duplicates: jasmine
            .createSpy()
            .and.returnValue(duplicatePatientsMock),
          update: jasmine.createSpy(),
          save: jasmine.createSpy(),
        },
      };
      $provide.value('PatientServices', patientServices);

      $provide.value('PatientValidationFactory', patientValidationFactory);
    })
  );

  var scope, ctrl;
  var duplicatePatientsMock = { Value: [] };
  var timeout;
  var tabLauncher = { launchNewTab: function (param) {} };
  var patientValidationFactory = {
    PatientSearchValidation: function (param) {
      return { then: function () {} };
    },
    LaunchPatientLocationErrorModal: function (param) {},
  };

  beforeEach(inject(function ($rootScope, $controller, $timeout) {
    scope = $rootScope.$new();
    timeout = $timeout;
    ctrl = $controller('PatientDuplicatesController', {
      $scope: scope,
      $timeout: timeout,
      tabLauncher: tabLauncher,
      patientValidationFactory: patientValidationFactory,
    });
  }));

  describe('closeDuplicatePatient ->', function () {
    it('should set showDuplicatePatients to false', function () {
      scope.showDuplicatePatients = true;

      scope.closeDuplicatePatient();

      expect(scope.showDuplicatePatients).toEqual(false);
    });
  });

  describe('getDuplicatePatients function -> ', function () {
    it('should call cancel timeout -> ', function () {
      spyOn(timeout, 'cancel');
      scope.dupeCheckTimeout = 500;
      scope.getDuplicatePatients();

      expect(timeout.cancel).toHaveBeenCalled();
    });

    //TODO: fix unit test. timeout.flush() does not execute dupeCheckTimeout function
    //it('should set scope properties', function () {
    //    scope.dupeCheckTimeout();
    //    timeout.flush();

    //    expect(scope.duplicatePatients.length).toBe(0);
    //    expect(scope.checkingForDuplicates).toBe(true);
    //    expect(duplicatePatientSearchService.get).toHaveBeenCalled();
    //});
  });

  describe('duplicatePatientSearchGetSuccess function -> ', function () {
    it('should set scope properties', function () {
      scope.duplicatePatientSearchGetSuccess(duplicatePatientsMock);

      expect(scope.duplicatePatients).toEqual(duplicatePatientsMock.Value);
      expect(scope.checkingForDuplicates).toBe(false);
    });

    it('should set showDuplicatePatients to false when res.Value is null', function () {
      scope.duplicatePatientSearchGetSuccess({ Value: null });

      expect(scope.showDuplicatePatients).toBe(false);
    });

    it('should set showDuplicatePatients to false when res.Value has length of 0', function () {
      scope.duplicatePatientSearchGetSuccess({ Value: [] });

      expect(scope.showDuplicatePatients).toBe(false);
    });

    it('should set showDuplicatePatients to true when res.Value has length greater than 0', function () {
      duplicatePatientsMock.Value.push({
        FirstName: 'John',
        LastName: 'Doe',
        DateOfBirth: null,
      });
      scope.duplicatePatientSearchGetSuccess(duplicatePatientsMock);

      expect(scope.showDuplicatePatients).toBe(true);
    });
  });

  describe('duplicatePatientSearchGetFailure function -> ', function () {
    it('should set scope properties', function () {
      scope.duplicatePatientSearchGetFailure();

      expect(scope.duplicatePatients.length).toBe(0);
      expect(scope.checkingForDuplicates).toBe(false);
      expect(scope.showDuplicatePatients).toBe(false);
    });
  });

  describe('openPatientTab function -> ', function () {
    it('should launch new tab if user is authorized to at least one patient location', function () {
      spyOn(tabLauncher, 'launchNewTab');
      spyOn(patientValidationFactory, 'LaunchPatientLocationErrorModal');
      var patient = {
        PatientInfo: {
          authorization: {
            UserIsAuthorizedToAtLeastOnePatientLocation: true,
          },
        },
      };
      scope.openPatientTab(patient);

      expect(tabLauncher.launchNewTab).toHaveBeenCalled();
      expect(
        patientValidationFactory.LaunchPatientLocationErrorModal
      ).not.toHaveBeenCalled();
    });

    it('should launch patient location error modal if user is not authorized to any patient location', function () {
      spyOn(tabLauncher, 'launchNewTab');
      spyOn(patientValidationFactory, 'LaunchPatientLocationErrorModal');
      var patient = {
        PatientInfo: {
          authorization: {
            UserIsAuthorizedToAtLeastOnePatientLocation: false,
          },
        },
      };
      scope.openPatientTab(patient);

      expect(tabLauncher.launchNewTab).not.toHaveBeenCalled();
      expect(
        patientValidationFactory.LaunchPatientLocationErrorModal
      ).toHaveBeenCalled();
    });
  });
});
