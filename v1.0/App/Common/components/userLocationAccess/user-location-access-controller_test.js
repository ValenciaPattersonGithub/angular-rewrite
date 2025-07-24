describe('PatientLocationValidationController_Test', function () {
  var ctrl,
    scope,
    patientData,
    listHelper,
    localize,
    filter,
    toastrFactory,
    deferred,
    q;
  var locationServices, rootScope, patientValidationFactory, patSecurityService;

  var patients = [
    {
      profile: {
        FirstName: 'Jordan',
        LastName: 'Schlansky',
        PatientCode: 'SCHJO1',
        PreferredLocation: '4',
        PatientId: 22,
      },
      authorization: {
        PatientId: '8ba2a49e-41d1-4dfa-9773-0dcb8d426b80',
        PatientPrimaryLocationName: 'Some Office',
        PatientPrimaryLocationPhone: 3,
        UserIsAuthorizedToAtLeastOnePatientLocation: false,
      },
    },
    {
      profile: {
        FirstName: 'Larry',
        LastName: 'Melman',
        PatientCode: 'MELLO1',
        PreferredLocation: '2',
        PatientId: 23,
      },
      authorization: {
        PatientId: '2vb2a59e-43g1-2ffa-9b73-0d9op2n26b80',
        PatientPrimaryLocationName: 'Another Office',
        PatientPrimaryLocationPhone: 5,
        UserIsAuthorizedToAtLeastOnePatientLocation: true,
      },
    },
  ];

  beforeEach(
    module('Soar.Patient', function ($provide) {
      //#region mocks for factories
      patientValidationFactory = {
        ObservePatientData: jasmine.createSpy().and.returnValue({
          then: jasmine.createSpy(),
        }),
        GetPatientData: jasmine.createSpy().and.returnValue({
          then: jasmine.createSpy(),
        }),
        CheckPatientLocation: jasmine.createSpy().and.returnValue({
          then: jasmine.createSpy(),
        }),
      };
      $provide.value('PatientValidationFactory', patientValidationFactory);

      locationServices = {
        get: jasmine.createSpy().and.returnValue({
          $promise: {
            then: jasmine.createSpy().and.returnValue({}),
          },
        }),
      };
      $provide.value('LocationServices', locationServices);

      var locationData = {};
      $provide.value('locationData', locationData);

      //#endregion

      //#region mocks for services

      //mock for patSecurityService
      patSecurityService = {
        IsAuthorizedByAbbreviation: jasmine.createSpy().and.returnValue(''),
        logout: jasmine.createSpy(),
        IsAuthorizedByAbbreviationAtLocation: jasmine.createSpy(),
      };
      $provide.value('patSecurityService', patSecurityService);
      //#endregion
    })
  );

  beforeEach(inject(function ($rootScope, $controller, $q, $filter) {
    scope = $rootScope.$new();
    filter = $filter;
    q = $q;

    //mock for listHelper service
    listHelper = {
      findItemByFieldValue: jasmine
        .createSpy('listHelper.findItemByFieldValue')
        .and.returnValue(null),
    };

    patientData = {
      Profile: {
        FirstName: 'Chris',
        LastName: 'Archer',
        Suffix: 'Jr',
        DateOfBirth: '12/04/1983',
      },
    };

    listHelper = {};

    $rootScope.patAuthContext = {
      isAuthorized: true,
      userInfo: {
        userid: '1111111',
      },
    };

    //mock for modal
    var modalInstance = {
      open: jasmine.createSpy('modalInstance.open').and.callFake(function () {
        deferred = q.defer();
        deferred.resolve('some value in return');
        return { result: deferred.promise };
      }),
      close: jasmine.createSpy('modalInstance.close'),
      dismiss: jasmine.createSpy('modalInstance.dismiss'),
      result: {
        then: jasmine.createSpy('modalInstance.result.then'),
      },
    };

    //mock for localize
    localize = {
      getLocalizedString: jasmine
        .createSpy('localize.getLocalizedString')
        .and.callFake(function (value) {
          return value;
        }),
    };
    rootScope = $rootScope;

    //creating controller
    ctrl = $controller('PatientLocationValidationController', {
      $scope: scope,
      $rootScope: rootScope,
      listHelper: listHelper,
      localize: localize,
      $filter: filter,
      patientData: patientData,
      patSecurityService: patSecurityService,
      toastrFactory: toastrFactory,
      $uibModalInstance: modalInstance,
    });
  }));

  //controller
  it('PatientLocationValidationController should check if controller exists', function () {
    expect(ctrl).not.toBeNull();
    expect(ctrl).not.toBeUndefined();
  });

  describe('Should check if all modal data is present ->', function () {
    it('patientData should have a value', function () {
      expect(patientData).not.toBeNull();
    });
  });

  describe('getFormattedName function -> ', function () {
    it('should return last name, first name, and code if there is no middle name or suffix', function () {
      expect(ctrl.getFormattedName(patients[0].profile)).toBe(
        'Jordan Schlansky'
      );
    });

    it('should append middle name if there is one', function () {
      patients[0].profile.MiddleName = 'M';
      expect(ctrl.getFormattedName(patients[0].profile)).toBe(
        'Jordan M. Schlansky'
      );
    });

    it('should append suffix if there is one', function () {
      delete patients[0].profile.MiddleName;
      patients[0].profile.Suffix = 'Sr.';
      expect(ctrl.getFormattedName(patients[0].profile)).toBe(
        'Jordan Schlansky, Sr.'
      );
    });

    it('should display them all', function () {
      patients[0].profile.MiddleName = 'M';
      patients[0].profile.Suffix = 'Sr.';
      expect(ctrl.getFormattedName(patients[0].profile)).toBe(
        'Jordan M. Schlansky, Sr.'
      );
    });
  });
});
