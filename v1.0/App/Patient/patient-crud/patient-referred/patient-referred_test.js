describe('patient-referred -> ', function () {
  var scope, routeParams, $httpBackend;

  //#region mocks
  // patient referral service for Patient
  var patientsReferredMock = {
    Value: [
      { FirstName: 'Patient', LastName: 'Test1' },
      { FirstName: 'Patient', LastName: 'Test2' },
      { FirstName: 'Patient', LastName: 'Test3' },
    ],
  };
  var patientServicesMock = {
    Referrals: {
      GetReferredPatients: jasmine
        .createSpy()
        .and.returnValue(patientsReferredMock.Value),
    },
  };
  //#endregion

  //#region mock services
  // mock the injected factory
  beforeEach(module('Soar.Common'));
  beforeEach(module('common.factories'));
  beforeEach(module('Soar.Patient'));

  describe('when user is authorized -> ', function () {
    // inject the search service to controller
    beforeEach(inject(function (
      $rootScope,
      $controller,
      $injector,
      $routeParams
    ) {
      scope = $rootScope.$new();
      routeParams = $routeParams;
      routeParams.patientId = 1;

      $controller('PatientReferredController', {
        $scope: scope,
        PatientServices: patientServicesMock,
      });

      $httpBackend = $injector.get('$httpBackend');
    }));

    it('should call GetReferredPatients service and be successful', function () {
      $httpBackend
        .expectGET('_soarapi_/patients/:Id/referredPatients')
        .respond(200, scope.GetReferredPatientsOnSuccess(patientsReferredMock));

      scope.GetPatientsReferred();
      expect(scope.patientsReferred.length).toBeGreaterThan(0);
    });

    it('should call GetReferedPatients service and thrown an error', function () {
      $httpBackend
        .expectGET('_soarapi_/patients/:Id/referredPatients')
        .respond(500, 'Error');

      expect(function () {
        scope.GetPatientsReferred();
        $httpBackend.flush();
      }).toThrow();
    });

    it('should return editMode as true when routeParams.patientId is not null', function () {
      expect(scope.editMode).toBeTruthy();
    });

    it('should call patient referral service GetReferredPatients when GetPatientsReferred is ran', function () {
      scope.GetPatientsReferred();

      expect(
        patientServicesMock.Referrals.GetReferredPatients
      ).toHaveBeenCalled();
    });

    it('should return patients referred array when GetReferredPatientsOnSuccess', function () {
      var result = patientsReferredMock;
      scope.GetReferredPatientsOnSuccess(result);

      expect(scope.patientsReferred.length).toBe(3);
      expect(scope.count).toBe(3);
    });
  });
});
