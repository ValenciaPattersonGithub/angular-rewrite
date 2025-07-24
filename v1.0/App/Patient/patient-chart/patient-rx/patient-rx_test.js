describe('PatientRxController ->', function () {
  var toastrFactory, scope, ctrl, sce, localize, location, boolValue;
  var patientRxFactory, patSecurityService;
  var patientRxService;

  //#region mockTemplate

  var mockRxPatient = {
    FirstName: 'James',
    LastName: 'Bond',
    MiddleName: null,
    DateOfBirth: new Date('1965-12-03'),
    Address1: '',
    Address2: '',
    City: '',
    State: '',
    ZipCode: '',
    Email: '',
    Phone: '2175403725',
  };

  var mockRequirements = [{ info: 'FirstName' }, { info: 'LastName' }];

  boolValue = true;

  var rxPatientMock = {
    FirstName: 'James',
    LastName: 'Bond',
    MiddleName: null,
    DateOfBirth: '1965-12-03',
    City: '',
    State: '',
    ZipCode: '',
    Gender: 'Unknown',
    PhoneType: 'Home',
    Height: 0,
    Weight: 0,
    HeightMetric: 0,
    WeightMetric: 0,
    UserId: '002211225588',
    MRN: null,
    Email: '',
    ApplicationId: 2,
    Address1: '',
    Address2: '',
    PostalCode: '',
    Phone: '2175403725',
  };

  var validPatientMock = {
    FirstName: 'James',
    LastName: 'Bond',
    MiddleName: null,
    DateOfBirth: '1965-12-03',
    AddressLine1: '',
    AddressLine2: '',
    City: '',
    State: '',
    ZipCode: '',
    EmailAddress: '',
    Phones: [{ Type: 'Home', PhoneNumber: '2175403725' }],
  };

  patSecurityService = {
    generateMessage: jasmine.createSpy().and.returnValue(''),
  };
  //#endregion

  beforeEach(
    module('Soar.Patient', function ($provide) {
      localize = {
        getLocalizedString: jasmine.createSpy().and.returnValue(''),
      };
      $provide.value('localize', localize);

      patientRxService = {
        getAuthAccess: jasmine.createSpy().and.returnValue(true),
        validatePatient: jasmine.createSpy().and.callFake(function () {
          return boolValue;
        }),
        createRxPatient: jasmine.createSpy().and.callFake(function () {
          return mockRxPatient;
        }),
        validationMessage: jasmine.createSpy().and.callFake(function () {
          return mockRequirements;
        }),
      };
      $provide.value('PatientRxService', patientRxService);

      patientRxFactory = {
        Save: jasmine.createSpy().and.returnValue({
          then: jasmine.createSpy().and.returnValue({}),
        }),
        access: jasmine.createSpy().and.returnValue(true),
      };
      $provide.value('PatientRxFactory', patientRxFactory);
    })
  );

  // Create controller and scope
  beforeEach(inject(function (
    $rootScope,
    $controller,
    $injector,
    $route,
    $routeParams,
    $compile,
    $location,
    $q,
    $sce
  ) {
    scope = $rootScope.$new();
    location = $location;
    sce = $injector.get('$sce');
    ctrl = $controller('PatientRxController', {
      patSecurityService: patSecurityService,
      $scope: scope,
      $sce: sce,
    });
  }));

  describe('validatePatientForRx ->', function () {
    it('should set invalidPatientData if patientRxService.validatePatient returns false', function () {
      scope.patient = angular.copy(validPatientMock);
      boolValue = false;
      ctrl.validatePatientForRx(scope.patient);
      expect(scope.invalidPatientData).toBe(true);
    });

    it('should set requirements list if patientRxService.validatePatient returns false', function () {
      scope.patient = angular.copy(validPatientMock);
      boolValue = false;
      ctrl.validatePatientForRx(scope.patient);
      expect(scope.requirementsList).toEqual([
        { info: 'FirstName' },
        { info: 'LastName' },
      ]);
    });

    it('should return false if patientRxService.ValidatePatient returns false', function () {
      scope.patient = angular.copy(validPatientMock);
      boolValue = false;
      expect(ctrl.validatePatientForRx(scope.patient)).toBe(false);
    });

    it('should not set invalidPatientData if patientRxService.validatePatient returns true', function () {
      scope.patient = angular.copy(validPatientMock);
      boolValue = true;
      ctrl.validatePatientForRx(scope.patient);
      expect(scope.invalidPatientData).toBe(false);
    });

    it('should not set requirements list if validatePatient.validatePatient returns true', function () {
      scope.patient = angular.copy(validPatientMock);
      boolValue = true;
      ctrl.validatePatientForRx(scope.patient);
      expect(scope.requirementsList).not.toBeDefined();
    });

    it('should return true if validatePatient.patientRxService returns true', function () {
      scope.patient = angular.copy(validPatientMock);
      boolValue = true;
      expect(ctrl.validatePatientForRx(scope.patient)).toBe(true);
    });

    it('should call patientRxService.validationMessage if patientRxService.validatePatient returns false', function () {
      scope.patient = angular.copy(validPatientMock);
      boolValue = false;
      ctrl.validatePatientForRx(scope.patient);
      expect(patientRxService.validationMessage).toHaveBeenCalledWith(
        ctrl.patient
      );
    });

    it('should set scope.validPatientData to false if patientRxService.validatePatient returns false', function () {
      scope.patient = angular.copy(validPatientMock);
      boolValue = false;
      ctrl.validatePatientForRx(scope.patient);
      expect(scope.validPatientData).toBe(false);
    });

    it('should set scope.validPatientData to true if patientRxService.validatePatient returns true', function () {
      scope.patient = angular.copy(validPatientMock);
      boolValue = true;
      ctrl.validatePatientForRx(scope.patient);
      expect(scope.validPatientData).toBe(true);
    });
  });

  describe('ctrl.loadRxPatient ->', function () {
    beforeEach(function () {
      ctrl.rxPatient = angular.copy(validPatientMock);
      scope.patient = 'patient';
    });

    it('should call patientRxFactory.Save ', function () {
      ctrl.loadRxPatient();
      expect(patientRxFactory.Save).toHaveBeenCalledWith(
        ctrl.rxPatient,
        scope.patient
      );
    });
  });

  describe('ctrl.handleError ->', function () {
    it('should set scope values when msg is Location', function () {
      scope.rxSaveFailed = false;
      scope.rxSaveFailedLocation = false;
      scope.rxPatientFound = false;
      ctrl.handleError('Location');
      expect(scope.rxSaveFailed).toBe(false);
      expect(scope.rxSaveFailedLocation).toBe(true);
      expect(scope.rxPatientFound).toBe(true);
    });

    it('should set scope values when msg is not Location', function () {
      scope.rxSaveFailed = false;
      scope.rxSaveFailedLocation = false;
      scope.rxPatientFound = false;
      ctrl.handleError('not Location');
      expect(scope.rxSaveFailed).toBe(true);
      expect(scope.rxSaveFailedLocation).toBe(false);
      expect(scope.rxPatientFound).toBe(true);
    });
  });

  describe('ctrl.setAddressInformation ->', function () {
    beforeEach(function () {
      scope.patient = angular.copy(validPatientMock);
    });

    it('should set address information to AddressReferrer information if it exists ', function () {
      scope.patient.AddressLine1 = null;
      scope.patient.AddressLine2 = null;
      scope.patient.City = null;
      scope.patient.State = null;
      scope.patient.ZipCode = null;
      // add AddressReferrer to patient
      scope.patient.AddressReferrerId = '123456789';
      scope.patient.AddressReferrer = {
        AddressLine1: 'AddressLine1',
        AddressLine2: 'AddressLine2',
        City: 'City',
        State: 'State',
        ZipCode: 'ZipCode',
      };
      ctrl.setReferrerAddressInformation();
      expect(scope.patient.AddressLine1).toEqual(
        scope.patient.AddressReferrer.AddressLine1
      );
      expect(scope.patient.AddressLine2).toEqual(
        scope.patient.AddressReferrer.AddressLine2
      );
      expect(scope.patient.City).toEqual(scope.patient.AddressReferrer.City);
      expect(scope.patient.State).toEqual(scope.patient.AddressReferrer.State);
      expect(scope.patient.ZipCode).toEqual(
        scope.patient.AddressReferrer.ZipCode
      );
    });
  });

  describe('ctrl.$onInit ->', function () {
    beforeEach(function () {
      scope.patient = angular.copy(validPatientMock);
      spyOn(ctrl, 'validatePatientForRx').and.returnValue(true);
      spyOn(ctrl, 'loadRxPatient');
      spyOn(ctrl, 'setReferrerAddressInformation');
    });
    it('should call loadRxPatient if validatePatientForRx returns true', function () {
      scope.patient.AddressReferrerId = null;
      scope.patient.AddressReferrer = null;
      ctrl.$onInit();
      expect(ctrl.loadRxPatient).toHaveBeenCalled();
    });

    it('should call validatePatientForRx', function () {
      scope.patient.AddressReferrerId = null;
      scope.patient.AddressReferrer = null;
      ctrl.$onInit();
      expect(ctrl.validatePatientForRx).toHaveBeenCalled();
    });

    it('should not call setReferrerAddressInformation if either AddressReferrerId or AddressReferrer are null ', function () {
      scope.patient.AddressReferrerId = null;
      scope.patient.AddressReferrer = null;
      ctrl.$onInit();
      expect(ctrl.setReferrerAddressInformation).not.toHaveBeenCalled();
    });
  });

  describe('scope.showHeightWeightRequired', function () {
    // beforeEach(inject(function () {
    //     scope.reset = jasmine.createSpy();
    // }));

    it('Show Height / Weight Required panel', function () {
      scope.showHeightWeightRequired();
      expect(scope.heightWeightRequired).toEqual(true);
      expect(scope.enterHeightWeight).toEqual(false);
    });
  });

  describe('scope.showEnterHeightWeight', function () {
    it('Show Edit Height / Weight  Panel', function () {
      scope.showEnterHeightWeight();
      expect(scope.heightWeightRequired).toEqual(false);
      expect(scope.enterHeightWeight).toEqual(true);
    });
  });

  describe('scope.cancelHeightWeightRequired', function () {
    it('Hide Height / Weight Required Panel', function () {
      scope.cancelHeightWeightRequired();
      expect(scope.heightWeightRequired).toEqual(false);
      expect(scope.enterHeightWeight).toEqual(false);
    });
  });

  describe('scope.cancelHeightWeightEntry', function () {
    it('Hide  Edit Height / Weight  Panel', function () {
      scope.cancelHeightWeightEntry();
      expect(scope.heightWeightRequired).toEqual(true);
      expect(scope.enterHeightWeight).toEqual(false);
    });
  });

  describe('scope.calculatePatientAge', function () {
    it('Calculate Patient Age', function () {
      var dateOfBirth = '2000-03-04T12:00:00';
      var age = ctrl.calculatePatientAge(dateOfBirth);
      expect(age > 18).toEqual(true);
    });
  });

  describe('scope.checkPatientForAge', function () {
    beforeEach(inject(function () {
      scope.patient = {
        HeightInches: 0,
        HeightFeet: 0,
        Weight: 0,
        DateOfBirth: '2000-03-04T12:00:00',
      };
      scope.createPatient = jasmine.createSpy();
      scope.showHeightWeightRequired = jasmine.createSpy();
      ctrl.calculatePatientAge = jasmine.createSpy();
    }));

    it('Check Patient For age  >= 18 ', function () {
      scope.patient.DateOfBirth = '2000-03-04T12:00:00';
      scope.patient.HeightFeet = 6;
      scope.patient.Weight = '245';

      scope.checkPatientForAge();

      expect(scope.createPatient).toHaveBeenCalled();
    });

    it('Check Patient For age  < 18 with valid Height / Weight', function () {
      scope.patient.DateOfBirth = '2020-03-04T12:00:00';
      scope.patient.HeightFeet = 6;
      scope.patient.Weight = '245';

      scope.checkPatientForAge();

      expect(scope.createPatient).toHaveBeenCalled();
    });
  });

  // describe('scope.checkPatientForAge', function() {
  //     beforeEach(inject(function () {
  //         scope.patient = angular.copy(validPatientMock);
  //         scope.patient.HeightInches = 0;
  //         scope.patient.HeightFeet = 0;
  //         scope.patient.Weight = 0;
  //         scope.createPatient = jasmine.createSpy();
  //         //scope.showHeightWeightRequired = jasmine.createSpy();
  //         //ctrl.calculatePatientAge = jasmine.createSpy();
  //         spyOn(ctrl, 'calculatePatientAge');
  //         spyOn(scope, 'showHeightWeightRequired');
  //     }));

  //     it('Check Patient For age  < 18 without valid Height / Weight', function() {
  //         scope.checkPatientForAge();
  //         expect(scope.calculatePatientAge).toHaveBeenCalled();
  //         expect(scope.showHeightWeightRequired).toHaveBeenCalled();
  //     });
  // });

  describe('scope.createPatient', function () {
    beforeEach(inject(function () {
      scope.cancelHeightWeightRequired = jasmine.createSpy();
    }));

    it('CreatePatient', function () {
      scope.createPatient();
      expect(scope.cancelHeightWeightRequired).toHaveBeenCalled();
    });
  });
});
