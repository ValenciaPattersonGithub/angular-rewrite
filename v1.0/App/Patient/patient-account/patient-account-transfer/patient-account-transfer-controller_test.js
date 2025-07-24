describe('patient-account-transfer-account', function () {
  var ctrl,
    scope,
    q,
    location,
    patientServices,
    localize,
    toastrFactory,
    routeParams,
    boundObjectFactory,
    compile,
    currentPatient,
    phones,
    accountMember,
    mockCurrentPatient,
    locationsFactory,
    userServices;
  beforeEach(module('Soar.Common'));
  beforeEach(module('common.factories'));
  beforeEach(
    module('Soar.Patient', function ($provide) {
      locationsFactory = {
        UserLocations: jasmine.createSpy().and.returnValue({
          then: jasmine.createSpy(),
        }),
      };
      $provide.value('LocationsFactory', locationsFactory);

      userServices = {
        users: jasmine.createSpy().and.returnValue({
          then: jasmine.createSpy(),
        }),
      };
      $provide.value('UserServices', userServices);

      $provide.value('PatientValidationFactory', {});
    })
  );

  beforeEach(inject(function (
    $rootScope,
    $controller,
    $injector,
    $q,
    $routeParams,
    $compile
  ) {
    scope = $rootScope.$new();
    mockCurrentPatient = {
      Data: {
        IsActive: true,
        PersonAccount: {
          AccountId: 1,
        },
      },
    };
    q = $q;
    compile = $compile;
    routeParams = $routeParams;
    sessionStorage.setItem('userLocation', JSON.stringify({ id: 1 }));

    // Mock for location
    location = {
      path: jasmine.createSpy(),
    };

    // mock for boundObjectFactory
    boundObjectFactory = {
      Create: jasmine.createSpy().and.returnValue({
        AfterDeleteSuccess: null,
        AfterSaveError: null,
        AfterSaveSuccess: null,
        Data: {},
        Deleting: false,
        IdField: 'ServiceCodeId',
        Loading: true,
        Name: 'ServiceCode',
        Saving: false,
        Valid: true,
        Load: jasmine.any(Function),
        Save: jasmine.createSpy().and.returnValue(''),
        Validate: jasmine.createSpy().and.returnValue(''),
        CheckDuplicate: jasmine.createSpy().and.returnValue(''),
      }),
    };

    // mock current patient
    currentPatient = {
      Value: {
        PatientId: 'TONE',
        Zipcode: '1111111111',
        EmailAddress: 'abc@gmail.com',
        EmailAddress2: 'abcd@gmail.com',
        FirstName: 'Test1',
        LastName: 'One',
        MiddleName: '',
        IsActive: 'true',
        PatientCode: 'TONE',
        PersonAccount: {
          AccountId: 1,
        },
      },
    };
    phones = {
      Value: [
        {
          ContactId: '1',
          PhoneNumber: '1111111111',
          ObjectState: 'Successful',
          Type: 'Home',
          invalidPhoneNumber: false,
          invalidType: false,
        },
        {
          ContactId: '2',
          PhoneNumber: '2222222222',
          ObjectState: 'Successful',
          Type: 'Home',
          invalidPhoneNumber: false,
          invalidType: false,
        },
        {
          ContactId: '3',
          PhoneNumber: '3333333333',
          ObjectState: 'Successful',
          Type: 'Home',
          invalidPhoneNumber: false,
          invalidType: false,
        },
      ],
    };

    accountMember = {
      Value: [
        {
          FirstName: '1',
          LastName: '1111111111',
          MiddleName: 'asdas',
          SuffixName: 'asdsa',
          IsResponsiblePerson: true,
        },
        {
          FirstName: '1',
          LastName: 'asds',
          MiddleName: 'xcxc',
          SuffixName: 'sda',
          IsResponsiblePerson: 'false',
        },
        {
          FirstName: 'ssdsa',
          LastName: '1111111111',
          MiddleName: 'Successful',
          SuffixName: 'Homdasde',
          IsResponsiblePerson: 'false',
        },
      ],
    };
    // mock the patient services
    patientServices = {
      Patients: { get: jasmine.createSpy() },
      PatientAccountTransfer: {
        save: jasmine.createSpy().and.callFake(function (options) {
          var deferred = q.defer();
          deferred.resolve('some value in return');
          return {
            result: deferred.promise,
          };
        }),
        getPatientGrid: jasmine
          .createSpy('patientServices.PatientAccountTransfer.getPatientGrid')
          .and.callFake(function (options) {
            var deferred = q.defer();
            deferred.resolve('some value in return');
            return {
              result: deferred.promise,
              $promise: {
                then: function () {},
              },
            };
          }),
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

    ctrl = $controller('PatientAccountTransferController', {
      $scope: scope,
      $location: location,
      toastrFactory: toastrFactory,
      localize: localize,
      BoundObjectFactory: boundObjectFactory,
      currentPatient: currentPatient,
      PatientServices: patientServices,
      phones: phones,
      accountMember: accountMember,
      emails: {},
      userSettingsDataService: {
        isNewNavigationEnabled: function () {
          return false;
        },
      },
    });
  }));

  describe('initial values -> ', function () {
    it('controller should exist', function () {
      expect(ctrl).not.toBeNull();
    });
  });

  describe('ctrl.createBreadCrumb -> ', function () {
    it('scope.PreviousLocationName should equal Account Summary', function () {
      scope.patient = {
        Data: {
          PersonAccount: {
            AccountId: 1,
          },
        },
      };

      routeParams.PrevLocation = 'account summary';
      ctrl.createBreadCrumb();
      expect(scope.PreviousLocationName).toEqual('Account Summary');
    });
    it('scope.PreviousLocationName should equal Transaction History', function () {
      routeParams.PrevLocation = 'transaction history';
      ctrl.createBreadCrumb();
      expect(scope.PreviousLocationName).toEqual('Transaction History');
    });
    it('scope.PreviousLocationName should equal Patient Overview', function () {
      routeParams.PrevLocation = 'overview';
      ctrl.createBreadCrumb();
      expect(scope.PreviousLocationName).toEqual('Overview');
    });
    it('scope.PreviousLocationName should equal Patient Profile', function () {
      routeParams.PrevLocation = 'profile';
      ctrl.createBreadCrumb();
      expect(scope.PreviousLocationName).toEqual('Profile');
    });
  });

  describe('scope.backToPreviousLocation -> ', function () {
    it('should call location.path', function () {
      scope.backToPreviousLocation();
      expect(location.path).toHaveBeenCalled();
    });
  });

  describe('ctrl.init -> ', function () {
    it('should call ctrl.createBreadCrumb and modalFactory.LoadingModal', function () {
      ctrl.createBreadCrumb = jasmine.createSpy();
      ctrl.displayPatientInfo = jasmine.createSpy();
      ctrl.init();
      expect(ctrl.createBreadCrumb).toHaveBeenCalled();
    });

    it('should set viewOptions disabled for Split Account when person is not active', function () {
      scope.patient.Data.IsActive = false;
      scope.patient.Data.ResponsiblePersonName = 'Bob';
      ctrl.createBreadCrumb = jasmine.createSpy();
      ctrl.displayPatientInfo = jasmine.createSpy();
      ctrl.init();
      expect(scope.viewOptions[0].Disabled).toBe(true);
    });
  });

  describe('ctrl.disableContinueBtn  -> ', function () {
    it('should set continue to true if scope.patient.Data.ResponsiblePersonName is Self and scope.accountMembers.length is more than one', function () {
      scope.patient.Data.ResponsiblePersonName = 'Self';
      scope.patient.Data.IsActive = true;
      ctrl.disableContinueBtn();
      expect(scope.continue).toBe(true);
    });

    it('should set continue to true if scope.patient.Data.IsActive is false and scope.accountMembers.length is more than one', function () {
      scope.patient.Data.IsActive = false;
      scope.patient.Data.ResponsiblePersonName = 'Bob';
      ctrl.disableContinueBtn();
      expect(scope.continue).toBe(true);
    });

    it('should set continue to false if scope.section is not 2', function () {
      scope.patient.Data.IsActive = true;
      scope.section = 1;
      scope.patient.Data.ResponsiblePersonName = 'Bob';
      ctrl.disableContinueBtn();
      expect(scope.continue).toBe(false);
    });

    it('should set continue to false if scope.section is not 2', function () {
      scope.patient.Data.IsActive = true;
      scope.accountMembers = [{}];
      scope.section = 2;
      scope.patient.Data.ResponsiblePersonName = 'Bob';
      ctrl.disableContinueBtn();
      expect(scope.continue).toBe(true);
    });
  });
});
