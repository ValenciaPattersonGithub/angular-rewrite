describe('PatientRxFactory ->', function () {
  var toastrFactory, patientRxFactory, deferred, q;
  var patSecurityService, rxService;

  //#region mocks

  //mock for amfa authorization
  patSecurityService = {
    logout: jasmine.createSpy(),
    IsAuthorizedByAbbreviation: jasmine.createSpy().and.returnValue(true),
    generateMessage: jasmine.createSpy().and.returnValue('This operation'),
  };

  var mockPatientWithOutPhoneNumbers = {
    FirstName: 'James',
    LastName: 'Bond',
    MiddleName: null,
    DateOfBirth: '1965-12-03',
    AddressLine1: 'xxx',
    City: 'Eff',
    State: 'IL',
    ZipCode: '62541',
    EmailAddress: 'xxx',
    Phones: [{ Type: 'Home', PhoneNumber: '2175403725' }],
  };

  //#endregion

  //#region before each

  beforeEach(module('Soar.Common'));
  beforeEach(module('common.factories'));
  beforeEach(
    module('Soar.Patient', function ($provide) {
      rxService = {
        saveRxPatient: jasmine.createSpy().and.callFake(function () {
          deferred = q.defer();
          deferred.resolve({});
          return deferred.promise;
        }),
      };
      $provide.value('RxService', rxService);

      toastrFactory = {};
      toastrFactory.error = jasmine.createSpy();
      toastrFactory.success = jasmine.createSpy();
      $provide.value('toastrFactory', toastrFactory);
    })
  );

  // inject the factory

  beforeEach(inject(function ($injector, $q) {
    q = $q;
    patientRxFactory = $injector.get('PatientRxFactory');
  }));

  //#endregion

  describe('Save method -> ', function () {
    it('it should call patientServices.RxPatient.save if user has access', function () {
      patSecurityService.IsAuthorizedByAbbreviation = jasmine
        .createSpy('patSecurityService.IsAuthorizedByAbbreviation')
        .and.returnValue(true);
      var patient = angular.copy(mockPatientWithOutPhoneNumbers);
      patientRxFactory.Save(patient);
      expect(rxService.saveRxPatient).toHaveBeenCalled();
    });
  });
});
