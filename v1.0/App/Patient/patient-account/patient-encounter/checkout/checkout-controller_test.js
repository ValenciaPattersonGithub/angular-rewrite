describe('CheckoutController ->', function () {
  let ctrl,
    scope,
    routeParams,
    location,
    patientServices,
    shareData,
    controller,
    deferred,
    patSecurityService;

  let mockReferenceDataService;

  beforeEach(module('Soar.Common'));
  beforeEach(module('common.factories'));
  beforeEach(module('Soar.Patient'));

  //mock for amfa authorization
  beforeEach(
    module('Soar.Patient', function ($provide) {
      patSecurityService = {
        logout: jasmine.createSpy(),
        IsAuthorizedByAbbreviation: jasmine.createSpy().and.returnValue(true),
        generateMessage: jasmine.createSpy().and.returnValue('This operation'),
      };

      mockReferenceDataService = {
        getData: jasmine.createSpy('mockReferenceDataService.get'),
        entityNames: {
          locations: 'locations',
        },
      };
      $provide.value('referenceDataService', mockReferenceDataService);

      let clinicalDrawerStateService = {
        changeDrawerState: jasmine.createSpy(),
      };
      $provide.value('ClinicalDrawerStateService', clinicalDrawerStateService);
    })
  );

  beforeEach(inject(function (
    $rootScope,
    $controller,
    $q,
    $filter,
    $injector,
    $routeParams
  ) {
    scope = $rootScope.$new();
    deferred = $q.defer();
    location = {};

    mockReferenceDataService.getData.and.returnValue(
      $q.resolve([{ LocationId: 3, Timezone: 'Central Standard Time' }])
    );

    patientServices = {
      Patients: {
        get: jasmine
          .createSpy('patientServices.Patients.get')
          .and.returnValue({ $promise: deferred.promise }),
      },
    };

    controller = $controller;
    routeParams = $routeParams;
    routeParams.patientId = '1234';
    ctrl = controller('CheckoutController', {
      $scope: scope,
      $routeParams: routeParams,
      PatientServices: patientServices,
      ShareData: shareData,
      $location: location,
      patSecurityService: patSecurityService,
    });
  }));

  describe('scope.cancelCheckout -->', function () {
    beforeEach(function () {
      location.url = jasmine.createSpy();
      scope.patientId = '1234';
      scope.accountId = '5678';
      scope.encounterId = '9101112';
    });

    it(
      'should set route to Patient/data.PatientId/Account/5678/Encounter/data.EncounterId/EncountersCart/AccountSummary/?familyCheckout=true` ' +
        'if data is passed to method with PatientId and EncounterId and scope.encounterId is null or undefined (indicates multi checkout)',
      function () {
        scope.patientId = '9101112';
        scope.encounterId = null;
        routeParams.PrevLocation = 'AccountSummaryEncounter';
        const data = { EncounterId: '123456789', PatientId: '1235' };
        scope.cancelCheckout(data);
        expect(location.url).toHaveBeenCalledWith(
          '/Patient/1235/Account/5678/Encounter/123456789/EncountersCart/AccountSummary/?familyCheckout=true'
        );
      }
    );

    it(
      'should set route to Patient/data.PatientId/Account/5678/Encounter/data.EncounterId/EncountersCart/AccountSummary ' +
        'if data is passed to method with PatientId and EncounterId and scope.encounterId is not null or undefined (indicates single checkout)',
      function () {
        scope.patientId = '1234';
        scope.encounterId = '123456788';
        routeParams.PrevLocation = 'AccountSummaryEncounter';
        const data = { EncounterId: '123456789', PatientId: '1235' };
        scope.cancelCheckout(data);
        expect(location.url).toHaveBeenCalledWith(
          '/Patient/1235/Account/5678/Encounter/123456789/EncountersCart/AccountSummary'
        );
      }
    );

    it('should set route to Patient/scope.patientId/Summary/?tab=AccountSummary if routeParams.PrevLocation equals AccountSummary', function () {
      scope.patientId = '1234';
      routeParams.PrevLocation = 'AccountSummary';
      scope.cancelCheckout(null);
      expect(location.url).toHaveBeenCalledWith(
        '/Patient/1234/Summary/?tab=Account Summary'
      );
    });

    it('should set route to Patient/patientId/PatientOverview if routeParams.PrevLocation equals PatientOverview and no data is passed to method', function () {
      routeParams.PrevLocation = 'PatientOverview';
      scope.patientId = '1234';
      scope.cancelCheckout(null);
      expect(location.url).toHaveBeenCalledWith('/Patient/1234/Overview/');
    });

    it('should set route to Patient/patientId/Account/accountId/Encounter/encounterId/Encounters/AccountSummary if routeParams.PrevLocation equals AccountSummary and no data is passed to method', function () {
      routeParams.PrevLocation = 'AccountSummaryEncounter';
      scope.patientId = '1234';
      scope.cancelCheckout(null);
      expect(location.url).toHaveBeenCalledWith(
        '/Patient/1234/Account/5678/Encounter/9101112/Encounters/AccountSummary'
      );
    });
    it('should set route to Patient/patientId/Account/5678/Encounter/encounterId/EncountersCart/AccountSummary if routeParams.PrevLocation equals EncountersCartAccountSummary and no data is passed to method', function () {
      routeParams.PrevLocation = 'EncountersCartAccountSummary';
      scope.patientId = '1234';
      scope.cancelCheckout(null);
      expect(location.url).toHaveBeenCalledWith(
        '/Patient/1234/Account/5678/Encounter/9101112/EncountersCart/AccountSummary'
      );
    });
    it('should set route to Patient/patientId/Summary/?tab=AccountSummary if routeParams.PrevLocation equals EncountersCartPatientOverview and no data is passed to method', function () {
      routeParams.PrevLocation = 'EncountersCartPatientOverview';
      scope.patientId = '1234';
      scope.cancelCheckout(null);
      expect(location.url).toHaveBeenCalledWith(
        '/Patient/1234/Account/5678/Encounter/9101112/EncountersCart/PatientOverview'
      );
    });
    it('should set route to Patient/patientId/Clinical if routeParams.PrevLocation equals Clinical and no data is passed to method', function () {
      routeParams.PrevLocation = 'Clinical';
      scope.patientId = '1234';
      scope.cancelCheckout(null);
      expect(location.url).toHaveBeenCalledWith('/Patient/1234/Clinical');
    });
  });
});
