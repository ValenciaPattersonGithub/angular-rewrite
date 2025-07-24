describe('MultiLocationProposedServiceController', function () {
  var ctrl,
    scope,
    staticData,
    listHelper,
    localize,
    toothSelectionService,
    filter,
    toastrFactory,
    locationService,
    q;
  var scheduleServices,
    referenceDataService,
    rootScope,
    patientValidationFactory,
    proposedServiceFactory;
  var patSecurityService,
    AmfaKeys,
    saveStates,
    timeout,
    practicesApiService,
    newLocationService,
    patientLogic,
    patientOdontogramFactory;
  var usersFactory,
    patientServicesFactory,
    serviceCodesService,
    patientLandingfactory,
    treatmentPlansFactory,
    patientServices,
    userServices;
  var fakeDateFromTimeZoneFactory = new Date('2019-11-08 16:55:29');
  var appointmentServiceProcessingRulesService;
  var schedulingApiService;

  beforeEach(module('Soar.Common'));
  beforeEach(module('common.factories'));

  var mockTimeZoneFactory = {
    ConvertDateToMomentTZ: jasmine
      .createSpy('mockTimeZoneFactory.ConvertDateToMomentTZ')
      .and.callFake(function () {
        return moment(fakeDateFromTimeZoneFactory);
      }),
    ConvertDateTZString: jasmine
      .createSpy('mockTimeZoneFactory.ConvertDateTZString')
      .and.callFake(function () {
        return fakeDateFromTimeZoneFactory;
      }),
  };

  var serviceCodes = [
    { ServiceCodeId: 1, Description: 'Desc 0A12', Code: '0A12', Fee: 2.0 },
    { ServiceCodeId: 2, Description: 'Desc 0B1', Code: '0B1', Fee: 4.0 },
    { ServiceCodeId: 3, Description: 'Desc 0B1', Code: '0B1', Fee: 4.0 },
  ];

  beforeEach(
    module('Soar.Schedule', function ($provide) {
      practicesApiService = {
        getLocationsWithDetails: jasmine.createSpy().and.returnValue({
          then: jasmine.createSpy(),
        }),
      };
      $provide.value('PracticesApiService', practicesApiService);
    })
  );

  beforeEach(
    module('Soar.Patient', function ($provide) {
      //mock for listHelper service
      listHelper = {
        findItemByFieldValue: jasmine
          .createSpy('listHelper.findItemByFieldValue')
          .and.returnValue(null),
      };

      staticData = {
        TeethDefinitions: jasmine.createSpy().and.callFake(function () {
          var deferrred = q.defer();
          var result = { Value: { Teeth: [] } };
          deferrred.resolve(result);
          return deferrred.promise;
        }),
        ServiceTransactionStatuses: jasmine.createSpy().and.returnValue({
          then: jasmine.createSpy(),
        }),
      };

      proposedServiceFactory = {
        GetSmartCode: null,
        GetNumberOfRoots: jasmine.createSpy().and.callThrough(),
        checkPropertiesByAffectedArea: jasmine.createSpy().and.callThrough(),
        GetSmartCodeForRootAffectedArea: jasmine.createSpy().and.callThrough(),
      };
      $provide.value('ProposedServiceFactory', proposedServiceFactory);

      newLocationService = {};
      $provide.value('NewLocationService', newLocationService);

      appointmentServiceProcessingRulesService = {
        addServiceSuccess: jasmine.createSpy().and.callThrough(),
      };
      $provide.value(
        'AppointmentServiceProcessingRulesService',
        appointmentServiceProcessingRulesService
      );

      schedulingApiService = {
        addServiceSuccess: jasmine.createSpy().and.callThrough(),
      };
      $provide.value('SchedulingApiService', schedulingApiService);

      locationService = {
        getCurrentLocation: jasmine
          .createSpy()
          .and.returnValue({ id: '2', name: 'some location' }),
        get: jasmine.createSpy(),
      };
      $provide.value('locationService', locationService);

      referenceDataService = {
        getData: jasmine.createSpy(),
        entityNames: {
          serviceTypes: 'serviceTypes',
          preventiveServiceTypes: 'preventiveServiceTypes',
          serviceCodes: 'serviceCodes',
          locations: 'locations',
        },
      };

      $provide.value('referenceDataService', referenceDataService);

      //#region mocks for factories
      var locationsServices = {};
      $provide.value('LocationServices', locationsServices);

      scheduleServices = {};
      $provide.value('ScheduleServices', scheduleServices);

      patientLogic = {
        GetPatientById: jasmine.createSpy().and.returnValue({
          then: jasmine.createSpy(),
        }),
      };
      $provide.value('PatientLogic', patientLogic);

      patientOdontogramFactory = {
        TeethDefinitions: jasmine.createSpy().and.returnValue({
          then: jasmine.createSpy(),
        }),
        serviceCodes: jasmine.createSpy().and.returnValue({
          then: jasmine.createSpy().and.returnValue(serviceCodes),
        }),
      };
      $provide.value('PatientOdontogramFactory', patientOdontogramFactory);

      usersFactory = {};
      $provide.value('UsersFactory', usersFactory);

      patientServicesFactory = {
        access: jasmine.createSpy().and.returnValue({}),
        getById: jasmine.createSpy().and.returnValue({
          then: jasmine.createSpy().and.returnValue({}),
        }),
        update: jasmine.createSpy().and.returnValue({
          then: jasmine.createSpy().and.returnValue({}),
        }),
        ActiveServiceTransactionId: jasmine
          .createSpy()
          .and.returnValue('123456'),
        setActiveServiceTransactionId: jasmine.createSpy().and.returnValue({}),
      };
      $provide.value('PatientServicesFactory', patientServicesFactory);

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

      serviceCodesService = {
        CheckForAffectedAreaChanges: jasmine.createSpy(),
      };
      $provide.value('ServiceCodesService', serviceCodesService);

      patientLandingfactory = {};
      $provide.value('PatientLandingfactory', patientLandingfactory);

      treatmentPlansFactory = {
        GetTxPlanFlags: jasmine.createSpy().and.returnValue({
          then: jasmine.createSpy(),
        }),
        NextPriority: jasmine.createSpy().and.returnValue({
          then: jasmine.createSpy(),
        }),
        AddPriorityToServices: jasmine.createSpy(),
        SaveServicesToExistingTreatmentPlan: jasmine
          .createSpy()
          .and.returnValue({
            then: jasmine.createSpy().and.callFake(function () {}),
          }),
        GetPlanStages: jasmine.createSpy(),
      };
      $provide.value('TreatmentPlansFactory', treatmentPlansFactory);

      //#endregion

      //#region mocks for services

      patientServices = {
        TreatmentPlans: {
          treatmentPlanSummariesForAddService: jasmine
            .createSpy()
            .and.returnValue({
              then: jasmine.createSpy(),
            }),
        },
      };
      $provide.value('PatientServices', patientServices);

      userServices = {};
      $provide.value('UserServices', userServices);

      //mock for patSecurityService
      patSecurityService = {
        IsAuthorizedByAbbreviation: jasmine.createSpy().and.returnValue(''),
        logout: jasmine.createSpy(),
        IsAuthorizedByAbbreviationAtLocation: jasmine.createSpy(),
      };
      $provide.value('patSecurityService', patSecurityService);
      //#endregion

      $provide.value('PatientLandingFactory', {});
    })
  );

  beforeEach(inject(function (
    $rootScope,
    $controller,
    $injector,
    $q,
    _AmfaKeys_
  ) {
    scope = $rootScope.$new();
    filter = $injector.get('$filter');
    q = $q;

    referenceDataService.getData.and.callFake(function () {
      return $q.resolve(serviceCodes);
    });

    AmfaKeys = _AmfaKeys_;

    listHelper = {};

    $rootScope.patAuthContext = {
      isAuthorized: true,
      userInfo: {
        userid: '1111111',
      },
    };

    //fake of saveStates
    saveStates = {
      Add: 'Add',
      Update: 'Update',
      Delete: 'Delete',
      None: 'None',
    };

    timeout = $injector.get('$timeout');

    //mock for localize
    localize = {
      getLocalizedString: jasmine
        .createSpy('localize.getLocalizedString')
        .and.callFake(function (value) {
          return value;
        }),
    };
    rootScope = $rootScope;

    //mock for toothSelectionService
    toothSelectionService = {
      selection: { teeth: ['S'] },
    };

    //creating controller
    ctrl = $controller('MultiLocationProposedServiceController', {
      $scope: scope,
      $filter: filter,
      $attrs: {
        isswiftcode: false,
        isfirstcode: false,
        islastcode: false,
        isedit: true,
        isNewTreatmentPlan: true,
        treatmentPlanId: null,
      },
      patSecurityService: patSecurityService,
      toastrFactory: toastrFactory,
      StaticData: staticData,
      ListHelper: listHelper,
      localize: localize,
      PatientServices: patientServices,
      $rootScope: rootScope,
      TimeZoneFactory: mockTimeZoneFactory,
      ToothSelectionService: toothSelectionService,
      TreatmentPlansFactory: treatmentPlansFactory,
      PatientOdontogramFactory: patientOdontogramFactory,
      UsersFactory: usersFactory,
      PatientServicesFactory: patientServicesFactory,
      ServiceCodesService: serviceCodesService,
      PatientLandingfactory: patientLandingfactory,
      PatientLogic: patientLogic,
      UserServices: userServices,
      SaveStates: saveStates,
      AmfaKeys: AmfaKeys,
      $timeout: timeout,
      NewLocationsService: newLocationService,
    });

    scope.currentServiceCode = {
      UseSmartCodes: true,
    };

    scope.$apply();
  }));

  //controller
  it('ProposedServiceCreateUpdateController should check if controller exists', function () {
    expect(ctrl).not.toBeNull();
    expect(ctrl).not.toBeUndefined();
  });

  describe('validateForm function -> ', function () {
    it('should set formIsValid to false and return if mode is Service and dataHasChanged is false', function () {
      scope.mode = 'Service';
      scope.isEncounterRefactored = false;
      scope.passinfo = undefined;
      scope.dataHasChanged = false;
      scope.validateForm();
      expect(scope.formIsValid).toEqual(false);
    });

    it('should set formIsValid to false and return if no activeTeeth selected and area is not 1, 2, or 6', function () {
      for (var i = 1; i < 8; i++) {
        switch (i) {
          case 1:
          case 2:
          case 6:
            break;
          default:
            scope.area = i;
            scope.activeTeeth = [];
            scope.validateForm();
            expect(scope.formIsValid).toEqual(false);
            break;
        }
      }
    });

    it('should set formIsValid to false and return if area is 4 and no surfaces are selected', function () {
      scope.area = 4;
      listHelper.findIndexByFieldValue = jasmine
        .createSpy('listHelper.findIndexByFieldValue')
        .and.returnValue(-1);
      scope.surfaces = [];
      scope.validateForm();
      expect(scope.formIsValid).toEqual(false);
    });

    it('should set formIsValid to false and return if validDate is false ', function () {
      scope.validDate = false;
      scope.validateForm();
      expect(scope.formIsValid).toEqual(false);
    });

    it(
      'should set formIsValid to false and return if mode is Service and dataHasChanged is true ' +
        'and any required properties null and ServiceTransactionStatusId not 6',
      function () {
        scope.mode = 'Service';
        scope.serviceTransaction = {
          ProviderUserId: null,
          ServiceTransactionStatusId: 5,
          LocationId: null,
        };
        scope.dataHasChanged = true;
        scope.validateForm();
        expect(scope.formIsValid).toEqual(false);
      }
    );

    it('should set formIsValid to true and return if mode is Service and dataHasChanged is true and any required properties not null and ServiceTransactionStatusId not 6', function () {
      scope.mode = 'Service';
      spyOn(scope, 'validateLocation').and.returnValue(true);
      scope.serviceTransaction = {
        ProviderUserId: 'ProviderUserId',
        ServiceTransactionStatusId: 5,
        LocationId: 5,
      };
      scope.dataHasChanged = true;
      scope.validateForm();
      expect(scope.formIsValid).toEqual(true);
    });

    it(
      'should set formIsValid to true and return if mode is Service and dataHasChanged is true and any required properties ' +
        'null but ServiceTransactionStatusId equals 6 (existing)',
      function () {
        spyOn(scope, 'validateLocation').and.returnValue(true);
        scope.mode = 'Service';
        scope.serviceTransaction = {
          ProviderUserId: 'ProviderUserId',
          ServiceTransactionStatusId: 5,
          LocationId: 5,
        };
        scope.dataHasChanged = true;
        scope.validateForm();
        expect(scope.validateLocation).toHaveBeenCalled();
        expect(scope.formIsValid).toEqual(true);
      }
    );

    it(
      'should set formIsValid to false and return if mode is Service and dataHasChanged is true and any required properties ' +
        'null but LocationId is null or undefined',
      function () {
        spyOn(scope, 'validateLocation').and.returnValue(false);
        scope.mode = 'Service';
        scope.serviceTransaction = {
          ProviderUserId: 'ProviderUserId',
          ServiceTransactionStatusId: 5,
          LocationId: 5,
        };
        scope.dataHasChanged = true;
        scope.validateForm();
        expect(scope.validateLocation).toHaveBeenCalled();
        expect(scope.formIsValid).toEqual(false);
      }
    );

    it('should set formIsValid to false and return if mode is Service and dataHasChanged is true but validateLocation returns false', function () {
      spyOn(scope, 'validateLocation').and.returnValue(false);
      scope.mode = 'Service';
      scope.serviceTransaction = {
        ProviderUserId: 'ProviderUserId',
        ServiceTransactionStatusId: 5,
      };
      scope.dataHasChanged = true;
      scope.validateForm();
      expect(scope.validateLocation).toHaveBeenCalled();
      expect(scope.formIsValid).toEqual(false);
    });

    it('should set formIsValid to true Service and dataHasChanged and scope.isEncounterRefactored is true ', function () {
      scope.isEncounterRefactored = true;
      scope.mode = 'Service';
      scope.serviceTransaction = {
        ProviderUserId: 'ProviderUserId',
        ServiceTransactionStatusId: 5,
      };
      scope.dataHasChanged = true;
      scope.validateForm();
      expect(scope.formIsValid).toEqual(true);
    });

    it('should set formIsValid to true Service and dataHasChanged and scope.passinfo is true ', function () {
      scope.passinfo = true;
      scope.mode = 'Service';
      scope.serviceTransaction = {
        ProviderUserId: 'ProviderUserId',
        ServiceTransactionStatusId: 5,
      };
      scope.dataHasChanged = true;
      scope.validateForm();
      expect(scope.formIsValid).toEqual(true);
    });

    it('should not call validateLocation if scope.isEncounterRefactored is true ', function () {
      spyOn(scope, 'validateLocation');
      scope.isEncounterRefactored = true;
      scope.mode = 'Service';
      scope.serviceTransaction = {
        ProviderUserId: 'ProviderUserId',
        ServiceTransactionStatusId: 5,
      };
      scope.dataHasChanged = true;
      scope.validateForm();
      expect(scope.validateLocation).not.toHaveBeenCalled();
    });

    it('should not call validateLocation if scope.passinfo is true ', function () {
      spyOn(scope, 'validateLocation');
      scope.passinfo = true;
      scope.mode = 'Service';
      scope.serviceTransaction = {
        ProviderUserId: 'ProviderUserId',
        ServiceTransactionStatusId: 5,
      };
      scope.dataHasChanged = true;
      scope.validateForm();
      expect(scope.validateLocation).not.toHaveBeenCalled();
    });
  });

  describe('setMaxDate method -> ', function () {
    it('should return maximum date set to today if passed from appointment (passinfo is true) on new service', function () {
      scope.serviceTransaction = { ServiceTransactionId: null };
      scope.passinfo = true;
      scope.isEncounterRefactored = false;
      var todaysDate = new Date();
      var dateReturned = ctrl.setMaxDate();
      expect(new Date(dateReturned).getFullYear()).toEqual(
        todaysDate.getFullYear()
      );
      expect(new Date(dateReturned).getMonth()).toEqual(todaysDate.getMonth());
      expect(new Date(dateReturned).getDate()).toEqual(todaysDate.getDate());
    });
    it('should return maximum date set to today if passed from encounter (isEncounterRefactored is true)  on new service', function () {
      scope.serviceTransaction = { ServiceTransactionId: null };
      scope.passinfo = false;
      scope.isEncounterRefactored = true;
      var todaysDate = new Date();
      var dateReturned = ctrl.setMaxDate();
      expect(new Date(dateReturned).getFullYear()).toEqual(
        todaysDate.getFullYear()
      );
      expect(new Date(dateReturned).getMonth()).toEqual(todaysDate.getMonth());
      expect(new Date(dateReturned).getDate()).toEqual(todaysDate.getDate());
    });
    it('should return maximum date set to null if not passed from encounter or appointment  on new service', function () {
      scope.serviceTransaction = { ServiceTransactionId: null };
      scope.passinfo = false;
      scope.isEncounterRefactored = false;
      var dateReturned = ctrl.setMaxDate();
      expect(dateReturned).toEqual(null);
    });
    it('should return maximum date set to today if existing serviceTransaction is being edited', function () {
      scope.serviceTransaction = {
        ServiceTransactionId: 1234,
        ServiceTransactionStatusId: 4,
      };
      scope.passinfo = false;
      scope.isEncounterRefactored = false;
      var todaysDate = new Date();
      var dateReturned = ctrl.setMaxDate();
      expect(new Date(dateReturned).getFullYear()).toEqual(
        todaysDate.getFullYear()
      );
      expect(new Date(dateReturned).getMonth()).toEqual(todaysDate.getMonth());
      expect(new Date(dateReturned).getDate()).toEqual(todaysDate.getDate());
    });
  });
});
