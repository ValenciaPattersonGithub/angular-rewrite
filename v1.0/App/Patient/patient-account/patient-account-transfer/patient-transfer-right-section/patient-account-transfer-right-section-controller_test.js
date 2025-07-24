'use strict';
describe('patient-account-transfer-right-section-controller', function () {
  var ctrl,
    scope,
    rootScope,
    q,
    location,
    patientServices,
    localize,
    toastrFactory,
    routeParams,
    boundObjectFactory,
    compile,
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
    })
  );

  beforeEach(inject(function (
    $rootScope,
    $controller,
    $q,
    $routeParams,
    $compile
  ) {
    rootScope = $rootScope;
    scope = rootScope.$new(); 
    q = $q;
    compile = $compile;
    routeParams = $routeParams;
    sessionStorage.setItem('userLocation', JSON.stringify({ id: 1 }));

    // Mock for location
    location = {
      path: jasmine.createSpy(),
    };

    // Mock for boundObjectFactory
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

    // Mock patient data
    scope.patientData2 = {
      CodePrefix: 'LEEAL',
      CodeSequence: 1,
      DateOfBirth: null,
      DateOfBirthString: '',
      FirstName: 'Alex',
      IsActive: true,
      LastName: 'Lee',
      MiddleName: 'T',
      PatientCode: 'LEEAL1',
      PatientId: '93977e26-032a-4a45-8ab2-677e078af069',
      PersonAccountMember: [
        {
          AccountId: '1431074b-c89c-45a9-ba6c-d44eedb8a0ad',
          PersonId: '1ffa5dc4-2def-4c32-a0ed-29d92612abba',
          ResponsiblePersonId: '93977e26-032a-4a45-8ab2-677e078af069',
        },
      ],
      PreferredName: null,
      PrefixName: null,
      ResponsiblePersonId: '93977e26-032a-4a45-8ab2-677e078af069',
      Suffix: 'Jr',
      TotalCount: 72,
      highlighted: true,
      ZipCode :123,

    };

    // Mock parent scope to prevent scope hierarchy issues
    scope.$parent.patient= {  
        Data: {
          FirstName: 'Devid',
          IsActive: true,
          LastName: 'Simond',
          MiddleName: 'T',
          PatientCode: 'SIMDE1',
          Suffix: 'Jr',
        }
      };
      
      scope.$parent.isPrimary={isSelectedLeft:false,isSelectedRight:true}

  
    // Mock patient services
    patientServices = {
      PatientAccountTransfer: {
        getPatientTransferCardDetails: jasmine.createSpy().and.callFake(function (options) {
          var deferred = q.defer();
          deferred.resolve({
            Value: {
              patientTransferAddressDetails: {
                AddressLine1: '123 Street',
                AddressLine2: 'Apt 4',
                City: 'Los Angeles',
                State: 'CA',
                ZipCode: '90011',
              },
              patientTransferEmailDetails: [{ Email: 'testingemail@gmail.com' }],
              patientTransferPhoneDetails: [{ PhoneNumber: '1234567890', Type: 'Mobile' }],
            },
          });
          return { $promise: deferred.promise };
        }),
      },
    };

    // Mock for toastrFactory
    toastrFactory = {
      success: jasmine.createSpy(),
      error: jasmine.createSpy(),
    };

    // Mock for localize
    localize = {
      getLocalizedString: jasmine.createSpy().and.returnValue(''),
    };

    // Initialize the controller with mocked dependencies
    ctrl = $controller('PatientAccountTransferRightSectionController', {
      $scope: scope,
      $location: location,
      toastrFactory: toastrFactory,
      localize: localize,
      BoundObjectFactory: boundObjectFactory,
      PatientServices: patientServices,
      userSettingsDataService: {
        isNewNavigationEnabled: function () {
          return false;
        },
      },
    });
  }));

  // Ensure proper cleanup after each test
  afterEach(function () {
    if (scope) {
      scope.$destroy(); // Manually destroy scope to ensure proper cleanup
    }
  });

  describe('initial values -> ', function () {
    it('controller should exist', function () {
      expect(ctrl).not.toBeNull();
    });

    it('should initialize scope variables correctly', function () {
        expect(scope.loaded).toBe(false);
        expect(scope.patientData).toEqual(scope.patientData2);
        expect(scope.isPrimary).toBe(false);
      });

  });

  describe('displayPatientInfo', function () {
    it('should call patient service to get patient transfer details', function () {
      ctrl.displayPatientInfo();
      scope.$apply(); // Resolve the promise
      expect(patientServices.PatientAccountTransfer.getPatientTransferCardDetails).toHaveBeenCalled();
    });

    it('should set patient transfer details to scope variables', function () {
      ctrl.displayPatientInfo();
      scope.$apply();
      expect(scope.patientData.AddressLine1).toBe('123 Street');
      expect(scope.patientData.AddressLine2).toBe('Apt 4');
      expect(scope.patientData.City).toBe('Los Angeles');
      expect(scope.patientData.ZipCode).toBe('90011');
      expect(scope.patientData.State).toBe('CA');
      expect(scope.phones).toEqual([{ PhoneNumber: '1234567890', Type: 'Mobile' }]);
      expect(scope.patientData.PatientEmail).toEqual([{ Email: 'testingemail@gmail.com' }]);
      expect(scope.ResponsibleParty).toEqual('self');
      expect(scope.patientData.PersonAccountMember.length).toEqual(1);
    });

    it('should handle error when fetching patient transfer details', function () {
      // Force error
      patientServices.PatientAccountTransfer.getPatientTransferCardDetails.and.callFake(function () {
        var deferred = q.defer();
        deferred.reject();
        return { $promise: deferred.promise };
      });

      ctrl.displayPatientInfo();
      scope.$apply(); 
      expect(toastrFactory.error).toHaveBeenCalledWith(
        localize.getLocalizedString('Failed to retrieve patinet details.')
      );
    });

    describe('primarySelected', function () {
        it('should set primary selection correctly', function () {
          scope.primarySelected();
          expect(scope.$parent.isPrimary.isSelectedLeft).toBe(false);
          expect(scope.$parent.isPrimary.isSelectedRight).toBe(true);
          expect(scope.$root.borderStyle_section1).toBe('border-nonePrimary');
          expect(scope.$root.borderStyle_section2).toBe('border-primary');
        });
      });
  });

  describe('setHeight', function () {
    it('should set height based on elements', function () {
      spyOn(angular.element.prototype, 'css');
      ctrl.setHeight();
      expect(angular.element.prototype.css).not.toHaveBeenCalled(); 
    });
  });

  describe('buildName', function () {
    it('should correctly build the patient name with middle name and suffix', function () {
      const name = ctrl.buildName('John', 'Doe', 'A', 'Jr');
      expect(name).toBe('John A. Doe, Jr');
    });

    it('should correctly build the patient name without middle name', function () {
      const name = ctrl.buildName('John', 'Doe', '', '');
      expect(name).toBe('John Doe');
    });
  });

  describe('watchers and timeout behavior', function () {
    it('should set patient data and call displayPatientInfo on patientData2 change', function () {
      spyOn(ctrl, 'displayPatientInfo');
      scope.patientData2 = { FirstName: 'New' };
      scope.$digest();
      expect(scope.loaded).toBe(true);
      expect(scope.patientData).toEqual({ FirstName: 'New' });
      expect(ctrl.displayPatientInfo).toHaveBeenCalled();
    });
  });

});
