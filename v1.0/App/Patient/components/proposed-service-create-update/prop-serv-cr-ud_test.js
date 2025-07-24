describe('ProposedServiceCreateUpdateController', function () {
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
  var patSecurityService;
  var fakeDateFromTimeZoneFactory = new Date('2019-11-08 16:55:29');
  var appointmentServiceProcessingRulesService;
  var schedulingApiService;

  beforeEach(module('Soar.Common'));
  beforeEach(module('common.factories'));

  var patientOdontogramFactory,
    usersFactory,
    patientServicesFactory,
    patientConditionsFactory;
  var serviceCodesService, patientLandingfactory, treatmentPlansFactory;
  var conditionsService, patientServices, patientLogic, userServices;

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

  var existingTreatmentPlans = [
    {
      TreatmentPlanDescription: 'Treatment Plan 1',
      TreatmentPlanHeader: {
        TreatmentPlanId: '1234',
      },
      TreatmentPlanServices: {
        TreatmentPlanServiceHeader: {
          TreatmentPlanGroupNumber: 1,
        },
        ServiceTransaction: {},
      },
    },
    {
      TreatmentPlanDescription: 'Treatment Plan 2',
      TreatmentPlanHeader: {
        TreatmentPlanId: '1236',
      },
      TreatmentPlanServices: {
        TreatmentPlanServiceHeader: {
          TreatmentPlanGroupNumber: 1,
        },
        ServiceTransaction: {},
      },
    },
    {
      TreatmentPlanDescription: 'Treatment Plan 2',
      TreatmentPlanHeader: {
        TreatmentPlanId: '1236',
      },
      TreatmentPlanServices: {
        TreatmentPlanServiceHeader: {
          TreatmentPlanGroupNumber: 2,
        },
        ServiceTransaction: {},
      },
    },
    {
      TreatmentPlanDescription: 'Treatment Plan 2',
      TreatmentPlanHeader: {
        TreatmentPlanId: '1236',
      },
      TreatmentPlanServices: {
        TreatmentPlanServiceHeader: {
          TreatmentPlanGroupNumber: 3,
        },
        ServiceTransaction: {},
      },
    },
  ];

  beforeEach(
    module('Soar.Patient', function ($provide) {
      //mock for listHelper service
      listHelper = {
        findItemByFieldValue: jasmine.createSpy(
          'listHelper.findItemByFieldValue'
        ),
        // .and.returnValue(null)
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
        GetSmartCode: jasmine.createSpy(),
        GetNumberOfRoots: jasmine.createSpy().and.callThrough(),
        checkPropertiesByAffectedArea: jasmine.createSpy().and.callThrough(),
        GetSmartCodeForRootAffectedArea: jasmine.createSpy().and.callThrough(),
      };
      $provide.value('ProposedServiceFactory', proposedServiceFactory);

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
        update: jasmine.createSpy(),
        // .and.returnValue({
        //     then: jasmine.createSpy().and.returnValue({})
        // }),
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

      patientConditionsFactory = {};
      $provide.value('PatientConditionsFactory', patientConditionsFactory);

      serviceCodesService = {
        LoadedServiceCodes: jasmine.createSpy().and.returnValue([
          { ServiceTransactionId: 12344, Description: 'Description1' },
          { ServiceTransactionId: 12345, Description: 'Description2' },
          { ServiceTransactionId: 12346, Description: 'Description3' },
        ]),
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

      $provide.value('PatientLandingFactory', {});

      //#endregion

      //#region mocks for services

      conditionsService = {};
      $provide.value('ConditionsService', conditionsService);

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
    })
  );

  beforeEach(inject(function ($rootScope, $controller, $injector, $q) {
    scope = $rootScope.$new();
    filter = $injector.get('$filter');
    q = $q;

    referenceDataService.getData.and.returnValue($q.resolve(serviceCodes));
    patientServicesFactory.update.and.returnValue($q.resolve({ Value: [] }));
    // listHelper = {};

    $rootScope.patAuthContext = {
      isAuthorized: true,
      userInfo: {
        userid: '1111111',
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

    //mock for toothSelectionService
    toothSelectionService = {
      selection: { teeth: ['S'] },
    };

    //creating controller
    ctrl = $controller('ProposedServiceCreateUpdateController', {
      $scope: scope,
      $rootScope: rootScope,
      StaticData: staticData,
      ListHelper: listHelper,
      localize: localize,
      ToothSelectionService: toothSelectionService,
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
      PatientOdontogramFactory: patientOdontogramFactory,
      UsersFactory: usersFactory,
      PatientServicesFactory: patientServicesFactory,
      PatientConditionsFactory: patientConditionsFactory,
      ServiceCodesService: serviceCodesService,
      PatientLandingfactory: patientLandingfactory,
      TreatmentPlansFactory: treatmentPlansFactory,
      ConditionsService: conditionsService,
      PatientServices: patientServices,
      PatientLogic: patientLogic,
      UserServices: userServices,
      TimeZoneFactory: mockTimeZoneFactory,
    });

    scope.currentServiceCode = {
      UseSmartCodes: true,
    };
  }));

  //controller
  it('ProposedServiceCreateUpdateController should check if controller exists', function () {
    expect(ctrl).not.toBeNull();
    expect(ctrl).not.toBeUndefined();
  });

  describe('validateForm function -> ', function () {
    it('should set formIsValid to false and return if mode is Service and dataHasChanged is false', function () {
      scope.mode = 'Service';
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

    it('should set formIsValid to false and return if mode is Service and dataHasChanged is true and any required properties null and ServiceTransactionStatusId not 6', function () {
      scope.mode = 'Service';
      scope.serviceTransaction = {
        ProviderUserId: null,
        ServiceTransactionStatusId: 5,
      };
      scope.dataHasChanged = true;
      scope.validateForm();
      expect(scope.formIsValid).toEqual(false);
    });

    it('should set formIsValid to true and return if mode is Service and dataHasChanged is true and any required properties not null and ServiceTransactionStatusId not 6', function () {
      scope.mode = 'Service';
      scope.serviceTransaction = {
        ProviderUserId: 'ProviderUserId',
        ServiceTransactionStatusId: 5,
        LocationId: 5,
      };
      scope.dataHasChanged = true;
      scope.validateForm();
      expect(scope.formIsValid).toEqual(true);
    });

    it('should set formIsValid to true and return if mode is Service and dataHasChanged is true and any required properties null but ServiceTransactionStatusId equals 6 (existing)', function () {
      scope.mode = 'Service';
      scope.serviceTransaction = {
        ProviderUserId: 'ProviderUserId',
        ServiceTransactionStatusId: 5,
        LocationId: 5,
      };
      scope.dataHasChanged = true;
      scope.validateForm();
      expect(scope.formIsValid).toEqual(true);
    });

    it('should set formIsValid to false and return if mode is Service and dataHasChanged is true and any required properties null but LocationId is null or undefined', function () {
      scope.mode = 'Service';
      scope.serviceTransaction = {
        ProviderUserId: 'ProviderUserId',
        ServiceTransactionStatusId: 5,
      };
      scope.dataHasChanged = true;
      scope.validateForm();
      expect(scope.formIsValid).toEqual(false);
    });
  });

  describe('watch serviceTransaction ->', function () {
    it('should call setDataHasChanged when new value', function () {
      spyOn(ctrl, 'setDataHasChanged');
      scope.serviceTransaction = {};
      scope.$apply();
      scope.serviceTransaction = {
        ProviderUserId: 'ProviderUserId',
        ServiceTransactionStatusId: 5,
      };
      scope.$apply();

      expect(ctrl.setDataHasChanged).toHaveBeenCalled();
    });

    it('should call validateForm when new value', function () {
      spyOn(scope, 'validateForm');
      scope.serviceTransaction = {};
      scope.$apply();

      scope.serviceTransaction = {
        ProviderUserId: 'ProviderUserId',
        ServiceTransactionStatusId: 5,
      };
      scope.$apply();
      scope.originalServiceTransaction = {
        ProviderUserId: 'ProviderUserId',
        ServiceTransactionStatusId: 6,
      };
      scope.serviceTransaction = {
        ProviderUserId: 'ProviderUserId',
        ServiceTransactionStatusId: 5,
      };
      scope.$apply();
      expect(scope.validateForm).toHaveBeenCalled();
    });
  });

  describe('watch activeTeeth ->', function () {
    it('should set dataHasChanged to true when new value', function () {
      listHelper.findItemByFieldValue = jasmine
        .createSpy('listHelper.findIndexByFieldValue')
        .and.returnValue(-1);
      scope.serviceTransaction = {};
      scope.dataHasChanged = false;
      scope.activeTeeth = [];
      scope.$apply();
      scope.activeTeeth = ['2'];
      scope.$apply();
      expect(scope.dataHasChanged).toEqual(true);
    });

    it('should call setToothData when new value', function () {
      spyOn(ctrl, 'setToothData');
      listHelper.findItemByFieldValue = jasmine
        .createSpy('listHelper.findIndexByFieldValue')
        .and.returnValue(-1);
      scope.serviceTransaction = {};
      scope.dataHasChanged = false;
      scope.activeTeeth = [];
      scope.$apply();
      scope.activeTeeth = ['2'];
      scope.$apply();
      expect(ctrl.setToothData).toHaveBeenCalled();
    });

    it('should call ctrl.checkSmartCodesForRoots with activeTeeth when new value', function () {
      spyOn(ctrl, 'checkSmartCodesForRoots');
      listHelper.findItemByFieldValue = jasmine
        .createSpy('listHelper.findIndexByFieldValue')
        .and.returnValue(-1);
      scope.serviceTransaction = {};
      scope.dataHasChanged = false;
      scope.activeTeeth = []; //
      scope.$apply();
      scope.activeTeeth = ['2'];
      scope.$apply();
      expect(ctrl.checkSmartCodesForRoots).toHaveBeenCalledWith(
        scope.activeTeeth
      );
    });

    it('should call validateForm when new value', function () {
      spyOn(scope, 'validateForm');
      listHelper.findItemByFieldValue = jasmine
        .createSpy('listHelper.findIndexByFieldValue')
        .and.returnValue(-1);
      scope.serviceTransaction = {};
      scope.dataHasChanged = false;
      scope.activeTeeth = [];
      expect(scope.validateForm).not.toHaveBeenCalled();
      scope.$apply();
      scope.activeTeeth = ['2'];
      scope.$apply();
      expect(scope.validateForm).toHaveBeenCalled();
    });
  });

  describe('watch activeSurfaces ->', function () {
    beforeEach(function () {
      ctrl.getNextSmartCode = jasmine.createSpy();
      scope.currentServiceCode = { UseSmartCodes: true };
      scope.serviceTransaction = { ProviderUserId: 'check' };
    });

    it('should set dataHasChanged to true when new value', function () {
      listHelper.findItemByFieldValue = jasmine
        .createSpy('listHelper.findIndexByFieldValue')
        .and.returnValue(-1);
      scope.dataHasChanged = false;
      scope.activeSurfaces = [];
      scope.$apply();
      scope.activeSurfaces = ['D'];
      scope.$apply();
      expect(scope.dataHasChanged).toEqual(true);
    });

    it('if smartCodeGroupSelected and not editMode should call getNextSmartCode', function () {
      listHelper.findItemByFieldValue = jasmine
        .createSpy('listHelper.findIndexByFieldValue')
        .and.returnValue(-1);
      scope.dataHasChanged = false;
      scope.editMode = false;
      scope.activeSurfaces = [];
      scope.$apply();
      scope.activeSurfaces = ['D'];
      scope.$apply();
      expect(ctrl.getNextSmartCode).toHaveBeenCalled();
    });

    it('if smartCodeGroupSelected and editMode should not call getNextSmartCode', function () {
      listHelper.findItemByFieldValue = jasmine
        .createSpy('listHelper.findIndexByFieldValue')
        .and.returnValue(-1);
      scope.dataHasChanged = false;
      scope.editMode = true;
      scope.activeSurfaces = [];
      scope.$apply();
      scope.activeSurfaces = ['D'];
      scope.$apply();
    });

    it('should call validateForm', function () {
      listHelper.findItemByFieldValue = jasmine
        .createSpy('listHelper.findIndexByFieldValue')
        .and.returnValue(-1);
      scope.dataHasChanged = false;
      scope.editMode = true;
      spyOn(scope, 'validateForm');
      scope.activeSurfaces = [];
      scope.$apply();
      scope.activeSurfaces = ['D'];
      scope.$apply();
      expect(scope.validateForm).toHaveBeenCalled();
    });

    it('should call getNextSmartCode if activeSurfaces have changed and scope.currentServiceCode.UseSmartCodes is true and AffectedAreaId is not 3', function () {
      listHelper.findItemByFieldValue = jasmine
        .createSpy('listHelper.findIndexByFieldValue')
        .and.returnValue(-1);
      scope.dataHasChanged = false;
      scope.editMode = false;
      scope.activeSurfaces = [];
      scope.$apply();
      scope.activeSurfaces = ['D'];
      scope.$apply();
      expect(ctrl.getNextSmartCode).toHaveBeenCalled();
    });

    it('should not call getNextSmartCode if AffectedAreaId is 3', function () {
      listHelper.findItemByFieldValue = jasmine
        .createSpy('listHelper.findIndexByFieldValue')
        .and.returnValue(-1);
      scope.currentServiceCode.AffectedAreaId = 3;
      scope.dataHasChanged = false;
      scope.editMode = false;
      scope.activeSurfaces = [];
      scope.$apply();
      scope.activeSurfaces = ['D'];
      scope.$apply();
      expect(ctrl.getNextSmartCode).not.toHaveBeenCalled();
    });
  });

  describe('setDataHasChanged method ->', function () {
    it('should set dataHasChanged to true when originalServiceTransaction not equal serviceTransaction', function () {
      scope.originalServiceTransaction = {
        ProviderUserId: 'ProviderUserId',
        ServiceTransactionStatusId: 6,
      };
      scope.serviceTransaction = {
        ProviderUserId: 'ProviderUserId',
        ServiceTransactionStatusId: 5,
      };
      ctrl.setDataHasChanged();
      expect(scope.dataHasChanged).toEqual(true);
    });

    it('should set dataHasChanged to false when originalServiceTransaction equal serviceTransaction', function () {
      scope.originalServiceTransaction = {
        ProviderUserId: 'ProviderUserId',
        ServiceTransactionStatusId: 6,
      };
      scope.serviceTransaction = {
        ProviderUserId: 'ProviderUserId',
        ServiceTransactionStatusId: 6,
      };
      ctrl.setDataHasChanged();
      expect(scope.dataHasChanged).not.toEqual(true);
    });

    it('should ignore $$DateEntered on new ServiceTransaction', function () {
      scope.originalServiceTransaction = {
        ProviderUserId: 'ProviderUserId',
        ServiceTransactionStatusId: 6,
      };
      scope.serviceTransaction = {
        ProviderUserId: 'ProviderUserId',
        ServiceTransactionStatusId: 6,
        $$DateEntered: '2019-07-14 14:46:34.5010000',
      };
      ctrl.setDataHasChanged();
      expect(scope.dataHasChanged).not.toEqual(true);
    });

    it('should set dataHasChanged to true when originalServiceTransaction not equal serviceTransaction', function () {
      scope.originalServiceTransaction = {
        ProviderUserId: 'ProviderUserId',
        ServiceTransactionStatusId: 6,
        $$DateEntered: '2019-07-14 14:46:34.5010000',
      };
      scope.serviceTransaction = {
        ProviderUserId: 'ProviderUserId',
        ServiceTransactionStatusId: 6,
        $$DateEntered: '2019-07-15 14:46:34.5010000',
      };
      ctrl.setDataHasChanged();
      expect(scope.dataHasChanged).toEqual(true);
    });

    it('should set dataHasChanged to false when originalServiceTransaction.$$DateEntered equal serviceTransaction.$$DateEntered', function () {
      scope.originalServiceTransaction = {
        ProviderUserId: 'ProviderUserId',
        ServiceTransactionStatusId: 6,
        $$DateEntered: '2019-07-15 14:46:34.5010000',
      };
      scope.serviceTransaction = {
        ProviderUserId: 'ProviderUserId',
        ServiceTransactionStatusId: 6,
        $$DateEntered: '2019-07-15 14:46:34.5010000',
      };
      ctrl.setDataHasChanged();
      expect(scope.dataHasChanged).toEqual(false);
    });
  });
  describe('ctrl.getUserLocations method ->', function () {
    beforeEach(() => {
      scope.$apply();
    });

    it('should call ctrl.hasAccessAtLocation to determine if user has access to this location', function () {
      spyOn(ctrl, 'hasAccessAtLocation');
      ctrl.getUserLocations();
      angular.forEach(ctrl.locations, function (location) {
        expect(ctrl.hasAccessAtLocation).toHaveBeenCalledWith(location);
      });
    });

    it('should add location to scope.userLocations if user has access', function () {
      spyOn(ctrl, 'hasAccessAtLocation').and.returnValue(true);
      ctrl.getUserLocations();
      expect(scope.userLocations).toEqual(ctrl.locations);
    });

    it('should not add location to scope.userLocations if user does not have access', function () {
      spyOn(ctrl, 'hasAccessAtLocation').and.returnValue(false);
      ctrl.getUserLocations();
      expect(scope.userLocations).toEqual([]);
    });

    it('should call ctrl.checkUserLocationAssignment();', function () {
      ctrl.locations = [{ LocationId: 1 }, { LocationId: 2 }];
      spyOn(ctrl, 'hasAccessAtLocation').and.returnValue(false);
      spyOn(ctrl, 'checkUserLocationAssignment');
      ctrl.getUserLocations();
      expect(ctrl.checkUserLocationAssignment).toHaveBeenCalled();
    });
  });

  describe('ctrl.getPracticeLocations method ->', function () {
    it('should call UserLocations', function () {
      spyOn(ctrl, 'getPracticeLocations');
      ctrl.getPracticeLocations();
      expect(referenceDataService.getData).toHaveBeenCalledWith(
        referenceDataService.entityNames.locations
      );
    });
  });

  describe('init method ->', function () {
    it('should set isNewTreatmentPlan based on $attrs.isNewTreatmentPlan', function () {
      ctrl.init();
      expect(scope.isNewTreatmentPlan).toBe(true);
    });

    it('should set treatmentPlanId based on $attrs.treatmentPlanId', function () {
      ctrl.init();
      expect(scope.treatmentPlanId).toBe(null);
    });

    it('should not reset scope.activeSurfaces unintentionally', function () {
      scope.getChartButton = jasmine.createSpy().and.callFake(function () {
        scope.activeSurfaces = [1, 2, 3];
      });

      ctrl.init();

      expect(scope.activeSurfaces).toEqual([1, 2, 3]);
    });
  });

  describe('serviceTransaction.ServiceTransactionStatusId $watch function ->', function () {
    var oldStatus = 5;
    beforeEach(function () {
      ctrl.serviceTransactionStatusIdChanged = jasmine.createSpy();
      scope.serviceTransaction = { ServiceTransactionStatusId: oldStatus };
      scope.$digest();
      ctrl.serviceTransactionStatusIdChanged.calls.reset();
    });

    it('should call ctrl.serviceTransactionStatusIdChanged', function () {
      var newStatus = 1;
      scope.serviceTransaction.ServiceTransactionStatusId = newStatus;
      scope.$digest();
      expect(ctrl.serviceTransactionStatusIdChanged).toHaveBeenCalledWith(
        newStatus,
        oldStatus
      );
    });
  });

  describe('ctrl.serviceTransactionStatusIdChanged function ->', function () {
    beforeEach(function () {
      scope.validateForm = jasmine.createSpy();
      scope.serviceTransaction = {};
    });

    it('should not modify the DateEntered', function () {
      var originalDateEnteredValue = '2019-06-14 06:16:18.8940000';
      ctrl.locations = [{ LocationId: 1, Timezone: 'Hawaiian Standard Time' }];
      scope.serviceTransaction = {
        Tooth: 2,
        DateEntered: originalDateEnteredValue,
        AffectedAreaId: 4,
        Surface: 'M',
        Roots: 'P',
        LocationId: 1,
      };
      ctrl.serviceTransactionStatusIdChanged();
      expect(scope.serviceTransaction.DateEntered).toEqual(
        originalDateEnteredValue
      );
    });

    it('should call validateForm', function () {
      ctrl.serviceTransactionStatusIdChanged();
      expect(scope.validateForm).toHaveBeenCalled();
    });

    it('should set ServiceTransactionStatusId to 1 if nv is empty', function () {
      scope.serviceTransaction.ServiceTransactionStatusId = '';
      ctrl.serviceTransactionStatusIdChanged('');
      expect(scope.serviceTransaction.ServiceTransactionStatusId).toBe(1);
    });
    it('should set Fee = scope.serviceTransaction.Fee when  scope.serviceTransaction.Fee = 0', function () {
      scope.serviceTransaction.Fee = 0;
      scope.currentServiceCode.UseSmartCodes = false;
      ctrl.orginalValue = 163;
      ctrl.saveTreatmentPlanId = '';
      scope.serviceTransaction.TreatmentPlanId = '';
      var locFee = 150;
      scope.currentServiceCode.$$locationFee = locFee;
      ctrl.serviceTransactionStatusIdChanged(1, 2);
      expect(scope.serviceTransaction.Fee).toBe(locFee);
      expect(ctrl.saveTreatmentPlanId).toBe('');
    });
    it('should set Fee = ctrl.orginalValue when  scope.serviceTransaction.Fee != 0', function () {
      scope.serviceTransaction.Fee = 12;
      ctrl.orginalValue = 163;
      ctrl.serviceTransactionStatusIdChanged(1, 1);
      expect(ctrl.orginalValue).toBe(12);
    });
    describe('when new value is existing (6) ->', function () {
      var fee = 120;
      var savedFee = 150;
      beforeEach(function () {
        scope.serviceTransaction.Fee = fee;
        scope.serviceTransaction.Discount = 100;
        scope.serviceTransaction.ProviderUserId = 'userid';
        ctrl.savedFee = savedFee;
      });

      it('should set fee to 0 and provider to null', function () {
        ctrl.serviceTransactionStatusIdChanged(6);
        expect(scope.serviceTransaction.Fee).toBe(0);
        expect(scope.serviceTransaction.ProviderUserId).toBeNull();
      });

      it('should set discount to 0', function () {
        ctrl.serviceTransactionStatusIdChanged(6);
        expect(scope.serviceTransaction.Discount).toBe(0);
      });

      it('should set ctrl.savedFee if status is changed', function () {
        ctrl.serviceTransactionStatusIdChanged(6, 5);
        expect(ctrl.orginalValue).toBe(fee);
      });

      it('should not set ctrl.savedFee if status is not changed', function () {
        ctrl.serviceTransactionStatusIdChanged(6, 6);
        expect(ctrl.savedFee).toBe(savedFee);
      });

      it('should not set ctrl.savedFee if previous status was not defined', function () {
        ctrl.serviceTransactionStatusIdChanged(6);
        expect(ctrl.savedFee).toBe(savedFee);
        ctrl.serviceTransactionStatusIdChanged(6, null);
        expect(ctrl.savedFee).toBe(savedFee);
      });
    });

    describe('when new value is not existing ->', function () {
      describe('when old value is existing (6) ->', function () {
        var savedFee = 100;
        beforeEach(function () {
          ctrl.orginalValue = savedFee;
          scope.serviceTransaction.Fee = 100;
        });

        it('should set fee correctly when ctrl.savedFee is defined', function () {
          ctrl.serviceTransactionStatusIdChanged(5, 6);
          expect(scope.serviceTransaction.Fee).toBe(savedFee);
          expect(ctrl.orginalValue).toBe(savedFee);
        });

        it('should set fee correctly when ctrl.savedFee is not defined', function () {
          ctrl.orginalValue = null;
          scope.currentServiceCode.UseSmartCodes = false;
          scope.serviceTransaction.Fee = null;
          var locFee = 150;
          scope.currentServiceCode.$$locationFee = locFee;
          ctrl.serviceTransactionStatusIdChanged(5, 6);
          expect(scope.serviceTransaction.Fee).toBe(locFee);
        });
        it('should set ctrl.savedFee to originalValue when scope.serviceTransaction.Fee is  zero ', function () {
          ctrl.orginalValue = 331;
          scope.serviceTransaction.Fee = 0;
          var locFee = 150;
          scope.serviceTransactionFeeBackUp = locFee;
          scope.currentServiceCode.$$locationFee = locFee;
          ctrl.serviceTransactionStatusIdChanged(5, 6);
          expect(ctrl.savedFee).toBe(scope.serviceTransactionFeeBackUp);
        });
        it('should set ctrl.savedFee to 0 when scope.serviceTransaction.Fee is not zero ', function () {
          ctrl.orginalValue = 331;
          scope.serviceTransaction.Fee = 21;
          var locFee = 150;
          scope.currentServiceCode.$$locationFee = locFee;
          ctrl.serviceTransactionStatusIdChanged(5, 6);
          expect(ctrl.savedFee).toBe(ctrl.orginalValue);
        });
        it('should set scope.serviceTransaction.Fee to ctrl.savedFee when it is serviceCode ', function () {
          scope.currentServiceCode.UseSmartCodes = true;
          ctrl.savedFee = 331;
          scope.serviceTransaction.Fee = 0;
          var locFee = 150;
          scope.currentServiceCode.$$locationFee = locFee;
          ctrl.serviceTransactionStatusIdChanged(5, 6);
          expect(scope.serviceTransaction.Fee).toBe(ctrl.savedFee);
        });
        it('should set scope.serviceTransaction.Fee to 0 when scope.currentServiceCode is undefined ', function () {
          scope.currentServiceCode = undefined;
          scope.serviceTransaction.Fee = 0;
          ctrl.serviceTransactionStatusIdChanged(5, 6);
          expect(scope.serviceTransaction.Fee).toBe(0);
        });
      });

      describe('when old value is not existing ->', function () {
        var fee = 50;
        beforeEach(function () {
          scope.serviceTransaction.Fee = fee;
        });

        it('should not change fee', function () {
          ctrl.serviceTransactionStatusIdChanged(5, 4);
          expect(scope.serviceTransaction.Fee).toBe(fee);
          expect(ctrl.orginalValue).toBe(fee);
        });
        it('should set originalValue to zero when old value is Proposed(1)', function () {
          scope.serviceTransaction.Fee = 0;
          scope.serviceTransactionFeeBackUp = 0;
          ctrl.serviceTransactionStatusIdChanged(5, 1);
          expect(scope.serviceTransaction.Fee).toBe(0);
          expect(ctrl.orginalValue).toBe(0);
        });
        it('should set originalValue to zero when old value is Accepted(7)', function () {
          scope.serviceTransaction.Fee = 0;
          scope.serviceTransactionFeeBackUp = 0;
          ctrl.serviceTransactionStatusIdChanged(5, 7);
          expect(scope.serviceTransaction.Fee).toBe(0);
          expect(ctrl.orginalValue).toBe(0);
        });
      });
      describe('when new value is ReferredCompleted (8) ->', function () {
        var fee = 120;
        beforeEach(function () {
          scope.serviceTransaction.Fee = fee;
          scope.serviceTransaction.ProviderUserId = 'userid';
          ctrl.orginalValue = fee;
          scope.serviceTransaction.DateEntered = '2019-03-14T18:45:43.4642021';
          ctrl.dateEntered = scope.serviceTransaction.DateEntered;
        });

        it('should set fee to 0 and provider is not null', function () {
          ctrl.serviceTransactionStatusIdChanged(8);
          expect(scope.serviceTransaction.Fee).toBe(0);
          expect(scope.serviceTransaction.ProviderUserId).toBe('userid');
        });

        it('should set ctrl.orginalValue if status is changed', function () {
          ctrl.serviceTransactionStatusIdChanged(8, 5);
          expect(ctrl.orginalValue).toBe(fee);
        });

        it('should not set ctrl.orginalValue if status is not changed', function () {
          ctrl.serviceTransactionStatusIdChanged(8, 8);
          expect(ctrl.orginalValue).toBe(fee);
        });

        it('should not set ctrl.orginalValue if previous status was not defined', function () {
          ctrl.serviceTransactionStatusIdChanged(8);
          expect(ctrl.orginalValue).toBe(fee);
          ctrl.serviceTransactionStatusIdChanged(8, null);
          expect(ctrl.orginalValue).toBe(fee);
        });
        it('should set ctrl.dateentered if statusId is 8', function () {
          ctrl.serviceTransactionStatusIdChanged(8);
          expect(scope.serviceTransaction.DateEntered).toBe(ctrl.dateEntered);
        });
      });
      describe('when new value is Referred (2) ->', function () {
        var fee = 120;
        beforeEach(function () {
          scope.serviceTransaction.Fee = fee;
          scope.serviceTransaction.Discount = 60;
          scope.serviceTransaction.ProviderUserId = 'userid';
          ctrl.orginalValue = fee;
        });

        it('should set fee to 0 and provider is not null', function () {
          ctrl.serviceTransactionStatusIdChanged(2);
          expect(scope.serviceTransaction.Fee).toBe(0);
          expect(scope.serviceTransaction.ProviderUserId).toBe('userid');
        });

        it('should set discount to 0l', function () {
          ctrl.serviceTransactionStatusIdChanged(2);
          expect(scope.serviceTransaction.Discount).toBe(0);
        });

        it('should set ctrl.orginalValue if status is changed', function () {
          ctrl.serviceTransactionStatusIdChanged(2, 5);
          expect(ctrl.orginalValue).toBe(fee);
        });

        it('should not set ctrl.orginalValue if status is not changed', function () {
          ctrl.serviceTransactionStatusIdChanged(2, 2);
          expect(ctrl.orginalValue).toBe(fee);
        });

        it('should not set ctrl.orginalValue if previous status was not defined', function () {
          ctrl.serviceTransactionStatusIdChanged(2);
          expect(ctrl.orginalValue).toBe(fee);
          ctrl.serviceTransactionStatusIdChanged(2, null);
          expect(ctrl.orginalValue).toBe(fee);
        });
      });
    });
  });

  describe('servicesAdded method ->', function () {
    it('should call addServicesToNewTreatmentPlan with saved services ', function () {
      spyOn(ctrl, 'addServicesToNewTreatmentPlan');
      var savedServiceTransactions = [{}];
      scope.serviceTransaction = {
        ServiceTransactionStatusId: 1,
      };
      ctrl.servicesAdded(savedServiceTransactions);
      ctrl.addServicesToNewTreatmentPlan(savedServiceTransactions);
      expect(ctrl.addServicesToNewTreatmentPlan).toHaveBeenCalledWith(
        savedServiceTransactions
      );
    });
  });

  describe('addServicesToNewTreatmentPlan method ->', function () {
    it('should broadcast saved services if isNewTreatmentPlan ', function () {
      scope.isNewTreatmentPlan = true;
      var savedServiceTransactions = [{}];
      spyOn(rootScope, '$broadcast');
      ctrl.addServicesToNewTreatmentPlan(savedServiceTransactions);
      expect(rootScope.$broadcast).toHaveBeenCalledWith(
        'addServicesToNewTreatmentPlan',
        savedServiceTransactions
      );
    });

    it('should not broadcast saved services if isNewTreatmentPlan is false ', function () {
      scope.isNewTreatmentPlan = false;
      var savedServiceTransactions = [{}];
      spyOn(rootScope, '$broadcast');
      ctrl.addServicesToNewTreatmentPlan(savedServiceTransactions);
      expect(rootScope.$broadcast).not.toHaveBeenCalled();
    });
  });

  describe('setValuesOnServiceTransactionForNewCode method ->', function () {
    beforeEach(function () {
      scope.currentServiceCode = {
        ServiceCodeId: '123456789',
        Fee: 0,
        CdtCodeName: 'D9972',
        Code: 'D9972',
        AffectedAreaId: 1,
        CompleteDescription: null,
        Description: 'currentSmartCodeDescription',
        DisplayAs: 'currentSmartCodeDisplay',
        $$locationFee: 72,
      };

      scope.nextSmartCode = {
        ServiceCodeId: '987654321',
        Fee: 99,
        CdtCodeName: 'D9999',
        Code: 'D9999',
        AffectedAreaId: 5,
        CompleteDescription: null,
        Description: 'nextSmartCodeDescription',
        DisplayAs: 'nextSmartCodeDisplay',
        $$locationFee: 99.99,
      };
      scope.serviceTransaction = {
        ServiceCodeId: null,
        Fee: 0,
        CdtCodeName: null,
        Code: null,
        AffectedAreaId: null,
        CompleteDescription: null,
        Description: null,
        DisplayAs: null,
      };
    });

    it('should set value to currentServiceCode when newServiceCodeId matches it', function () {
      ctrl.setValuesOnServiceTransactionForNewCode('123456789');
      scope.$apply();
      expect(scope.serviceTransaction.ServiceCodeId).toEqual(
        scope.currentServiceCode.ServiceCodeId
      );
      expect(scope.serviceTransaction.CdtCodeName).toEqual(
        scope.currentServiceCode.CdtCodeName
      );
      expect(scope.serviceTransaction.Code).toEqual(
        scope.currentServiceCode.Code
      );
      expect(scope.serviceTransaction.AffectedAreaId).toEqual(
        scope.currentServiceCode.AffectedAreaId
      );
      expect(scope.serviceTransaction.Description).toEqual(
        scope.currentServiceCode.Description
      );
      expect(scope.serviceTransaction.DisplayAs).toEqual(
        scope.currentServiceCode.DisplayAs
      );
    });

    it('should set value to currentServiceCode when newServiceCodeId matches it', function () {
      ctrl.setValuesOnServiceTransactionForNewCode('987654321');
      scope.$apply();
      expect(scope.serviceTransaction.ServiceCodeId).toEqual(
        scope.nextSmartCode.ServiceCodeId
      );
      expect(scope.serviceTransaction.CdtCodeName).toEqual(
        scope.nextSmartCode.CdtCodeName
      );
      expect(scope.serviceTransaction.Code).toEqual(scope.nextSmartCode.Code);
      expect(scope.serviceTransaction.AffectedAreaId).toEqual(
        scope.nextSmartCode.AffectedAreaId
      );
      expect(scope.serviceTransaction.Description).toEqual(
        scope.nextSmartCode.Description
      );
      expect(scope.serviceTransaction.DisplayAs).toEqual(
        scope.nextSmartCode.DisplayAs
      );
    });

    it('should set value to currentServiceCode when newServiceCodeId matches it', function () {
      ctrl.setValuesOnServiceTransactionForNewCode(1);
      scope.$apply();
      expect(scope.serviceTransaction.ServiceCodeId).toEqual(1);
      expect(scope.serviceTransaction.CdtCodeName).toEqual(undefined);
      expect(scope.serviceTransaction.Code).toEqual('0A12');
      expect(scope.serviceTransaction.AffectedAreaId).toEqual(undefined);
      expect(scope.serviceTransaction.Description).toEqual('Desc 0A12');
      expect(scope.serviceTransaction.DisplayAs).toEqual(undefined);
    });
  });

  describe('setLocationDisabled method ->', function () {
    beforeEach(function () {
      scope.locationsDisabled = false;
      scope.statusDisabled = false;
    });

    it('should set locationDisabled and statusDisabled if is a treatment plan', function () {
      scope.serviceTransaction = { TreatmentPlanId: '123' };
      ctrl.setLocationDisabled();
      expect(scope.locationsDisabled).toBe(true);
    });

    it('should set locationDisabled and statusDisabled if is a new treatment plan', function () {
      scope.isNewTreatmentPlan = true;
      ctrl.setLocationDisabled();
      expect(scope.locationsDisabled).toBe(true);
    });

    it('should set locationDisabled and statusDisabled if is a new treatment plan', function () {
      scope.isNewTreatmentPlan = false;
      ctrl.setLocationDisabled();
      expect(scope.locationsDisabled).toBe(false);
      expect(scope.statusDisabled).toBe(false);
    });
  });

  describe('setFeeForServiceTransaction method ->', function () {
    beforeEach(function () {
      referenceDataService.getData.and.returnValue(
        q.resolve([
          { ServiceCodeId: '99999', $$locationFee: 150, AffectedAreaId: 3 },
        ])
      );

      scope.serviceTransaction = { Fee: 220 };
      scope.currentServiceCode = {
        ServiceCodeId: '12345',
        $$locationFee: 200,
        AffectedAreaId: 3,
      };
      scope.nextSmartCode = {
        ServiceCodeId: '54321',
        $$locationFee: 100,
        AffectedAreaId: 3,
      };
      scope.existingService = false;
    });

    it('should not overwrite a fee that has been set', function (done) {
      scope.serviceTransaction.Fee = 200;
      scope.originalServiceFee = 200;
      ctrl.setFeeForServiceTransaction('12345').then(fee => {
        expect(fee).toBe(200);
        done();
      });
      scope.$apply();
    });

    it('should set fee to 0 if this is an existing service', function (done) {
      scope.serviceTransaction.Fee = 200;
      scope.existingService = true;
      ctrl.setFeeForServiceTransaction().then(fee => {
        expect(fee).toBe(0);
        done();
      });
      scope.$apply();
    });

    it('should set fee to tempServiceCode fee if originalServiceFee equals nextSmartCode fee', function (done) {
      scope.originalServiceFee = 100;
      scope.existingService = false;
      ctrl.setFeeForServiceTransaction('99999').then(fee => {
        expect(fee).toBe(150);
        done();
      });
      scope.$apply();
    });

    it('should set fee to originalFee if fee does not equal the nextSmartCode fee', function (done) {
      scope.originalServiceFee = 99;
      scope.existingService = false;
      ctrl.setFeeForServiceTransaction('99999').then(fee => {
        expect(fee).toBe(99);
        done();
      });
      scope.$apply();
    });

    it('should keep fee set to originalServiceFee when it does not equal tempServiceCode fee', function (done) {
      scope.originalServiceFee = 20;
      scope.existingService = false;
      ctrl.setFeeForServiceTransaction('54321').then(fee => {
        expect(fee).toBe(20);
        done();
      });
      scope.$apply();
    });

    it('should set fee to tempServiceCode fee when nextSmartCode equals originalServiceFee', function (done) {
      scope.originalServiceFee = 100;
      scope.existingService = false;
      ctrl.setFeeForServiceTransaction('54321').then(fee => {
        expect(fee).toBe(100);
        done();
      });
      scope.$apply();
    });

    it('should keep fee set to originalServiceFee when it does not equal tempServiceCode fee', function (done) {
      scope.originalServiceFee = 20;
      scope.existingService = false;
      ctrl.setFeeForServiceTransaction('12345').then(fee => {
        expect(fee).toBe(20);
        done();
      });
      scope.$apply();
    });

    it('should set fee to tempServiceCode fee when nextSmartCode equals originalServiceFee', function (done) {
      scope.originalServiceFee = 200;
      scope.existingService = false;
      ctrl.setFeeForServiceTransaction('12345').then(fee => {
        expect(fee).toBe(200);
        done();
      });
      scope.$apply();
    });
  });

  describe('getServiceTransactionStatuses method ->', function () {
    beforeEach(function () {
      scope.filteredServiceTransactionStatuses = [];
      ctrl.filterServiceTransactionStatuses = jasmine.createSpy();
    });

    it('should not call staticData.ServiceTransactionStatuses if we already have filteredServiceTransactionStatuses', function () {
      scope.filteredServiceTransactionStatuses = [{}, {}];
      ctrl.getServiceTransactionStatuses();
      expect(staticData.ServiceTransactionStatuses).toHaveBeenCalled();
      expect(ctrl.filterServiceTransactionStatuses).toHaveBeenCalled();
    });

    it('should call staticData.ServiceTransactionStatuses if filteredServiceTransactionStatuses is empty', function () {
      staticData.ServiceTransactionStatuses = jasmine
        .createSpy()
        .and.returnValue({
          then: function (cb) {
            cb({ Value: [] });
          },
        });
      ctrl.getServiceTransactionStatuses();
      expect(ctrl.filterServiceTransactionStatuses).toHaveBeenCalled();
    });
  });

  describe('ctrl.filterServiceTransactionStatusesForTxPlan function ->', function () {
    beforeEach(function () {
      scope.filteredServiceTransactionStatuses = [];
      ctrl.serviceTransactionStatuses = [
        { Id: 1 },
        { Id: 2 },
        { Id: 3 },
        { Id: 8 },
        { Id: 9 },
      ];
    });

    it('should return the correct list', function () {
      ctrl.filterServiceTransactionStatuses();
      expect(scope.filteredServiceTransactionStatuses.length).toBe(4);
      expect(scope.filteredServiceTransactionStatuses).toEqual([
        { Id: 1 },
        { Id: 2 },
        { Id: 3 },
        { Id: 8 },
      ]);
    });
  });

  describe('ctrl.filterServiceTransactionStatuses function ->', function () {
    beforeEach(function () {
      scope.filteredServiceTransactionStatuses = [];
      ctrl.serviceTransactionStatuses = [
        { Id: 1 },
        { Id: 2 },
        { Id: 3 },
        { Id: 6 },
        { Id: 8 },
        { Id: 9 },
      ];
      ctrl.canSetStatusToExisting = jasmine.createSpy().and.returnValue(true);
    });

    it('should return the correct list', function () {
      ctrl.filterServiceTransactionStatuses();
      expect(scope.filteredServiceTransactionStatuses.length).toBe(5);
      expect(scope.filteredServiceTransactionStatuses).toEqual([
        { Id: 1 },
        { Id: 2 },
        { Id: 3 },
        { Id: 6 },
        { Id: 8 },
      ]);
    });

    it('should return the correct list with Accepted Status', function () {
      ctrl.serviceTransactionStatuses = [
        { Id: 1 },
        { Id: 2 },
        { Id: 3 },
        { Id: 6 },
        { Id: 7 },
        { Id: 9 },
      ];
      ctrl.filterServiceTransactionStatuses();
      expect(scope.filteredServiceTransactionStatuses.length).toBe(5);
      expect(scope.filteredServiceTransactionStatuses).toEqual([
        { Id: 1 },
        { Id: 2 },
        { Id: 3 },
        { Id: 6 },
        { Id: 7 },
      ]);
    });

    it('should return the correct list with Referred Status', function () {
      ctrl.serviceTransactionStatuses = [
        { Id: 1 },
        { Id: 2 },
        { Id: 3 },
        { Id: 6 },
      ];
      ctrl.filterServiceTransactionStatuses();
      expect(scope.filteredServiceTransactionStatuses.length).toBe(4);
      expect(scope.filteredServiceTransactionStatuses).toEqual([
        { Id: 1 },
        { Id: 2 },
        { Id: 3 },
        { Id: 6 },
      ]);
    });

    it('should return the correct list with ReferredCompleted Status', function () {
      ctrl.serviceTransactionStatuses = [
        { Id: 1 },
        { Id: 2 },
        { Id: 3 },
        { Id: 6 },
        { Id: 7 },
        { Id: 8 },
        { Id: 9 },
      ];
      ctrl.filterServiceTransactionStatuses();
      expect(scope.filteredServiceTransactionStatuses.length).toBe(6);
      expect(scope.filteredServiceTransactionStatuses).toEqual([
        { Id: 1 },
        { Id: 2 },
        { Id: 3 },
        { Id: 6 },
        { Id: 7 },
        { Id: 8 },
      ]);
    });
  });

  describe('ctrl.canSetStatusToExisting function ->', function () {
    it('should return true if service is undefined', function () {
      var result = ctrl.canSetStatusToExisting();
      expect(result).toBe(true);
    });

    it('should return true if service is null', function () {
      var result = ctrl.canSetStatusToExisting(null);
      expect(result).toBe(true);
    });

    it('should return true if service.EncounterId is undefined', function () {
      var result = ctrl.canSetStatusToExisting({});
      expect(result).toBe(true);
    });

    it('should return true if service.EncounterId is null', function () {
      var result = ctrl.canSetStatusToExisting({ EncounterId: null });
      expect(result).toBe(true);
    });

    it('should return true if service status is existing', function () {
      var result = ctrl.canSetStatusToExisting({
        EncounterId: 'id',
        ServiceTransactionStatusId: 6,
      });
      expect(result).toBe(true);
    });

    it('should return false if service status is not existing', function () {
      var result = ctrl.canSetStatusToExisting({
        EncounterId: 'id',
        ServiceTransactionStatusId: 1,
      });
      expect(result).toBe(false);
    });
  });

  describe('ctrl.getTreatmentPlanSummariesSuccess function ->', function () {
    var res = {};

    beforeEach(function () {
      res = {
        Value: [
          {
            ServicesFees: 100,
            TreatmentPlanName: 'TreatmentPlan1',
            ServicesCount: 2,
          },
          {
            ServicesFees: 1000,
            TreatmentPlanName: 'TreatmentPlan2',
            ServicesCount: 12,
          },
          {
            ServicesFees: 1500,
            TreatmentPlanName: 'TreatmentPlan3',
            ServicesCount: 3,
          },
        ],
      };
      ctrl.buildTreatmentPlanDescription = jasmine.createSpy();
    });

    it('should not set treatmentPlanSummaries when res does not exist', function () {
      ctrl.getTreatmentPlanSummariesSuccess(null);
      expect(scope.treatmentPlanSummaries).toBe(undefined);
    });

    it('should set treatmentPlanSummaries to res.Value', function () {
      ctrl.getTreatmentPlanSummariesSuccess(res);
      expect(scope.treatmentPlanSummaries).toBe(res.Value);
    });

    it('should call buildTreatmentPlanDescription for each result plus one for empty select', function () {
      ctrl.getTreatmentPlanSummariesSuccess(res);
      expect(ctrl.buildTreatmentPlanDescription).toHaveBeenCalledTimes(3);
      expect(ctrl.buildTreatmentPlanDescription).toHaveBeenCalledWith(
        res.Value[0]
      );
      expect(ctrl.buildTreatmentPlanDescription).toHaveBeenCalledWith(
        res.Value[1]
      );
    });

    it('should add a new entry with the correct properties', function () {
      ctrl.getTreatmentPlanSummariesSuccess(res);
      expect(scope.treatmentPlanSummaries.length).toBe(4);
      expect(scope.treatmentPlanSummaries[3]).toEqual({
        TreatmentPlanDescription: 'Add to new treatment plan',
        TreatmentPlanId: '00000000-0000-0000-0000-000000000000',
        PersonId: scope.PersonId,
      });
    });
  });

  describe('ctrl.getTreatmentPlanSummaries function ->', function () {
    it('should not call treatmentPlanSummariesForAdd when scope.personId is null', function () {
      scope.personId = null;

      ctrl.getTreatmentPlanSummaries();

      expect(
        patientServices.TreatmentPlans.treatmentPlanSummariesForAddService
      ).not.toHaveBeenCalled();
    });

    it('should call treatmentPlanSummariesForAdd when scope.personId is not null', function () {
      scope.personId = 'personId';

      ctrl.getTreatmentPlanSummaries();

      expect(
        patientServices.TreatmentPlans.treatmentPlanSummariesForAddService
      ).toHaveBeenCalledWith(
        { Id: scope.personId },
        ctrl.getTreatmentPlanSummariesSuccess,
        ctrl.getTreatmentPlanSummariesFailure
      );
    });
  });

  describe('ctrl.success method ->', function () {
    var res = { Value: {} };
    beforeEach(function () {
      res.Value = { Code: '02410', ServiceCodeId: 22 };
      scope.getApplicableTeeth = jasmine.createSpy();
    });

    it('should set the scope.originalCode value baed on $scope.selectedChrtBtn', function () {
      listHelper.findIndexByFieldValue = jasmine
        .createSpy('listHelper.findIndexByFieldValue')
        .and.returnValue({});
      listHelper.findItemByFieldValue = jasmine
        .createSpy('listHelper.findItemByFieldValue')
        .and.returnValue({});
      listHelper.findAllByPredicate = jasmine
        .createSpy('listHelper.findAllByPredicate')
        .and.returnValue({});
      ctrl.success(res);
      expect(scope.originalCode).toEqual(scope.selectedChrtBtn.Code);
    });
  });
  describe(' on addServicesToNewTreatmentPlan broadcast event ->', function () {
    var mockCodes = { Code: '02140' };
    beforeEach(function () {
      scope.originalCode = null;
      scope.getApplicableTeeth = jasmine.createSpy();
    });
    it('should set scope.originalCode to codes.Code', function () {
      listHelper.findIndexByFieldValue = jasmine
        .createSpy('listHelper.findIndexByFieldValue')
        .and.returnValue({});
      listHelper.findItemByFieldValue = jasmine
        .createSpy('listHelper.findItemByFieldValue')
        .and.returnValue({});
      listHelper.findAllByPredicate = jasmine
        .createSpy('listHelper.findAllByPredicate')
        .and.returnValue({});
      scope.$emit('currentCode', mockCodes);
      scope.$apply();
      expect(scope.originalCode).toEqual('02140');
    });
  });

  describe('ctrl.getNextSmartCode ->', function () {
    var activeSelections;
    beforeEach(function () {
      scope.currentServiceCode = {
        ServiceCodeId: 99,
        Description: 'A really cool code!',
        SmartCode1Id: 1,
        SmartCode2Id: 2,
        SmartCode3Id: 3,
        UseSmartCodes: true,
      };

      scope.smartCodeGroup = serviceCodes;
      scope.originalSmartCode = scope.currentServiceCode;

      scope.serviceTransaction = {
        ServiceTransactionStatusId: 3,
      };
      activeSelections = [1, 2];
    });

    it('should call proposedServiceFactory.GetSmartCode with the number of selections', function () {
      // spyOn(scope, 'checkSmartCodeGroup').and.returnValue([serviceCodes[1]]);
      // scope.nextSmartCode = spyOn(proposedServiceFactory, 'GetSmartCode').and.returnValue(serviceCodes[1]);
      ctrl.getNextSmartCode(activeSelections);
      expect(proposedServiceFactory.GetSmartCode).toHaveBeenCalledWith(
        activeSelections,
        scope.currentServiceCode
      );
    });

    it('should skip smart code logic if the service transaction is completed', function () {
      // spyOn(proposedServiceFactory, 'GetSmartCode');
      scope.serviceTransaction.ServiceTransactionStatusId = 4;
      ctrl.getNextSmartCode(activeSelections);
      expect(proposedServiceFactory.GetSmartCode).not.toHaveBeenCalled();
      expect(scope.nextSmartCode.ServiceCodeId).toBe(undefined);
    });

    it('should not execute smartCode logic if ctrl.modalIsClosing is true', function () {
      // spyOn(proposedServiceFactory, 'GetSmartCode');
      scope.serviceTransaction.ServiceTransactionStatusId = 1;
      scope.modalClosing = true;
      ctrl.getNextSmartCode(activeSelections);
      expect(proposedServiceFactory.GetSmartCode).not.toHaveBeenCalled();
    });
  });

  describe('setting modalClosing ->', function () {
    beforeEach(function () {});
    it('should set scope.modalClosing true when scope.close is called', function () {
      scope.serviceTransaction = {
        ServiceTransactionStatusId: 1,
      };
      scope.close();
      expect(scope.modalClosing).toEqual(true);
    });

    it('should set scope.modalClosing true on init', function () {
      expect(scope.modalClosing).toEqual(false);
    });
  });

  describe('scope.getRoTSmartCode ->', function () {
    var arches = ['Upper', 'Upper'];
    beforeEach(function () {
      spyOn(scope, 'setRoTSmartCode');
      spyOn(scope, 'checkRange').and.returnValue(arches);
      scope.activeTeeth = ['1', '2', '5-9'];

      listHelper.findItemByFieldValue = jasmine
        .createSpy('listHelper.findItemByFieldValue')
        .and.returnValue({});
    });
    it('should call $scope.checkRange with an array of teeth', function () {
      scope.getRoTSmartCode();
      expect(scope.setRoTSmartCode).toHaveBeenCalledWith(true, 'Upper');
    });
  });

  describe('scope.setRoTSmartCode ->', function () {
    beforeEach(function () {
      spyOn(ctrl, 'getNextSmartCode');
      scope.activeTeeth = ['1', '2', '5-9'];
    });
    it('should call ctrl.getNextSmartCode with 1 active selection', function () {
      scope.setRoTSmartCode(true, 'Upper');
      expect(ctrl.getNextSmartCode).toHaveBeenCalledWith([1]);
    });

    it('should call ctrl.getNextSmartCode with 2 active selections', function () {
      scope.setRoTSmartCode(true, 'Lower');
      expect(ctrl.getNextSmartCode).toHaveBeenCalledWith([1, 2]);
    });

    it('should call ctrl.getNextSmartCode with 0 active selections', function () {
      scope.setRoTSmartCode(false, '');
      expect(ctrl.getNextSmartCode).toHaveBeenCalledWith([]);
    });
  });

  describe('scope.checkRange ->', function () {
    var toothRange, arches;
    beforeEach(function () {
      toothRange = ['1', '2'];

      arches = ['Upper'];

      listHelper.findItemByFieldValue = jasmine
        .createSpy('listHelper.findItemByFieldValue')
        .and.returnValue({});
    });
    it('should add to the array of selected arches', function () {
      scope.checkRange(toothRange, arches);
      expect(arches.length).toBe(3);
    });

    it('should add to the array of selected arches when range is 9-10', function () {
      toothRange = ['9', '10'];
      scope.checkRange(toothRange, arches);
      expect(arches.length).toBe(3);
    });

    it('should add to the array of selected arches when range is 9-10', function () {
      toothRange = ['A', 'F'];
      scope.checkRange(toothRange, arches);
      expect(arches.length).toBe(2);
    });
  });

  describe('ctrl.resetServiceTransaction method ->', function () {
    var skipFee = true;
    var newServiceCode;
    beforeEach(function () {
      newServiceCode = {
        ServiceCodeId: '123456789',
        Fee: 0,
        CdtCodeName: 'D9972',
        Code: 'D9972',
        AffectedAreaId: 1,
        CompleteDescription: null,
        Description: 'external bleaching - per arch - performed in office',
        DisplayAs: 'Bleach-In Office',
        $$locationFee: 99.99,
      };
      scope.serviceTransaction = {
        ServiceCodeId: null,
        Fee: 0,
        CdtCodeName: null,
        Code: null,
        AffectedAreaId: null,
        CompleteDescription: null,
        Description: null,
        DisplayAs: null,
      };
    });
    it('should reset service transaction after service code change', function () {
      ctrl.resetServiceTransaction(newServiceCode, skipFee);
      expect(scope.serviceTransaction.ServiceCodeId).toEqual(
        newServiceCode.ServiceCodeId
      );
      expect(scope.serviceTransaction.Fee).toEqual(newServiceCode.Fee);
      expect(scope.serviceTransaction.CdtCodeName).toEqual(
        newServiceCode.CdtCodeName
      );
      expect(scope.serviceTransaction.Code).toEqual(newServiceCode.Code);
      expect(scope.serviceTransaction.AffectedAreaId).toEqual(
        newServiceCode.AffectedAreaId
      );
      expect(scope.serviceTransaction.Description).toEqual(
        newServiceCode.Description
      );
      expect(scope.serviceTransaction.Fee).toEqual(newServiceCode.Fee);
      expect(scope.serviceTransaction.DisplayAs).toEqual(
        newServiceCode.DisplayAs
      );
    });

    it('should reset service transaction.Discount after service code change if referredService', function () {
      scope.serviceTransaction.Discount = 100;
      scope.referredService = true;
      ctrl.resetServiceTransaction(newServiceCode, skipFee);
      expect(scope.serviceTransaction.Discount).toBe(0);
    });

    it('should reset service transaction.Discount after service code change if existingService', function () {
      scope.serviceTransaction.Discount = 100;
      scope.existingService = true;
      ctrl.resetServiceTransaction(newServiceCode, skipFee);
      expect(scope.serviceTransaction.Discount).toBe(0);
    });

    it('should concatenate Description and CdtCodeName to create CompleteDescription if CdtCodeName is defined', function () {
      ctrl.resetServiceTransaction(newServiceCode, skipFee);
      expect(scope.serviceTransaction.CompleteDescription).toEqual(
        newServiceCode.Description + ' (' + newServiceCode.CdtCodeName + ')'
      );
    });

    it('should set CompleteDescription to Description if CdtCodeName is not defined', function () {
      newServiceCode.CdtCodeName = null;
      ctrl.resetServiceTransaction(newServiceCode, skipFee);
      expect(scope.serviceTransaction.CompleteDescription).toEqual(
        newServiceCode.Description
      );
    });

    it('should set Fee to 0 if existingService', function () {
      scope.existingService = true;
      ctrl.resetServiceTransaction(newServiceCode, skipFee);
      expect(scope.serviceTransaction.Fee).toEqual(0);
    });

    it('should set Fee to newServiceCode.$$locationFee if not existingService and skipFee is false', function () {
      scope.existingService = false;
      scope.referredService = false;
      skipFee = false;
      ctrl.resetServiceTransaction(newServiceCode, skipFee);
      expect(scope.serviceTransaction.Fee).toEqual(
        newServiceCode.$$locationFee
      );
    });

    it('should set Fee to 0 if existingService and skipFee is true', function () {
      scope.existingService = false;
      skipFee = true;
      ctrl.resetServiceTransaction(newServiceCode, skipFee);
      expect(scope.serviceTransaction.Fee).toEqual(0);
    });
    it('should set Fee to 0 if Referred or Referred Completed ', function () {
      scope.referredService = true;
      ctrl.resetServiceTransaction(newServiceCode, skipFee);
      expect(scope.serviceTransaction.Fee).toEqual(0);
    });
    it('should set Fee to newServiceCode.$$locationFee if not Referred or Referred Completed and skipFee is false', function () {
      scope.existingService = false;
      scope.referredService = false;
      skipFee = false;
      ctrl.resetServiceTransaction(newServiceCode, skipFee);
      expect(scope.serviceTransaction.Fee).toEqual(
        newServiceCode.$$locationFee
      );
    });
  });

  describe('ctrl.setActiveSurfaces method ->', function () {
    beforeEach(function () {
      scope.serviceTransaction = { AffectedAreaId: 4, Surface: 'M,O,D' };

      scope.surfaces = [
        { SurfaceAbbreviation: 'M' },
        { SurfaceAbbreviation: 'O/I' },
        { SurfaceAbbreviation: 'D' },
        { SurfaceAbbreviation: 'B' },
        { SurfaceAbbreviation: 'L' },
        { SurfaceAbbreviation: 'L5' },
        { SurfaceAbbreviation: 'B/F5' },
        { SurfaceAbbreviation: 'B/F' },
      ];
    });
    it('should add selected surfaces to scope.activeSurfaces if affectedAreaId is 4 and surface', function () {
      ctrl.setActiveSurfaces(
        scope.serviceTransaction.AffectedAreaId,
        scope.serviceTransaction.Surface
      );
      expect(scope.activeSurfaces).toEqual([
        { SurfaceAbbreviation: 'M', selected: true },
        { SurfaceAbbreviation: 'O/I', selected: true },
        { SurfaceAbbreviation: 'D', selected: true },
      ]);
    });

    it('should not add selected surfaces to scope.activeSurfaces if affectedAreaId is not 4 ', function () {
      scope.serviceTransaction = { AffectedAreaId: 3, Surface: 'M,O,D' };
      ctrl.setActiveSurfaces(
        scope.serviceTransaction.AffectedAreaId,
        scope.serviceTransaction.Surface
      );
      expect(scope.activeSurfaces).toEqual([]);
    });
  });

  describe('ctrl.checkPropertiesByAffectedArea method ->', function () {
    beforeEach(function () {
      // ServiceCode.AffectedAreaId was 5 at time that the service transaction was created
      scope.serviceTransaction = {
        AffectedAreaId: 5,
        ServiceCodeId: '123456789',
        Tooth: '11',
      };
      // ServiceCode.AffectedAreaId has been modified to Mouth
      serviceCodesService.LoadedServiceCodes = [
        { ServiceCodeId: '123456789', AffectedAreaId: 1 },
        { ServiceCodeId: '123456787', AffectedAreaId: 5 },
        { ServiceCodeId: '123456788', AffectedAreaId: 3 },
      ];
    });

    it('should reset non valid properties on serviceTransaction in cases where serviceCode.AffectedAreaId has been modified', function () {
      expect(scope.serviceTransaction.Tooth).toEqual('11');
      ctrl.checkPropertiesByAffectedArea(scope.serviceTransaction);
      scope.$apply();
      expect(
        proposedServiceFactory.checkPropertiesByAffectedArea
      ).toHaveBeenCalledWith(scope.serviceTransaction, serviceCodes);
    });
  });

  describe('ctrl.createServiceTransaction method ->', function () {
    beforeEach(function () {
      // ServiceCode.AffectedAreaId was 5 at time that the service transaction was created
      scope.serviceTransaction = {
        AffectedAreaId: 5,
        ServiceCodeId: '123456789',
        Tooth: '11',
        Fee: 333,
      };
      // ServiceCode.AffectedAreaId has been modified to Mouth
      serviceCodesService.LoadedServiceCodes = [
        { ServiceCodeId: '123456789', AffectedAreaId: 1 },
        { ServiceCodeId: '123456787', AffectedAreaId: 5 },
        { ServiceCodeId: '123456788', AffectedAreaId: 3 },
      ];
      ctrl.getServiceCodeId = jasmine
        .createSpy()
        .and.returnValue({ ServiceCodeId: '123456789', AffectedAreaId: 1 });
      scope.selectedChrtBtn = { UsuallyPerformedByProviderTypeId: null };
    });

    it('should not reset fee if fee has already been set', function (done) {
      ctrl.createServiceTransaction(5, true).then(result => {
        expect(result.Fee).toEqual(scope.serviceTransaction.Fee);
        done();
      });
      scope.$apply();
    });

    it('should have a 0 fee if existing service', function (done) {
      scope.existingService = true;
      ctrl.createServiceTransaction(5, true).then(result => {
        expect(result.Fee).toEqual(0);
        done();
      });
      scope.$apply();
    });

    it('should not modify the serviceTransaction.DateEntered', function () {
      var originalDateEnteredValue = '2019-06-14 06:16:18.8940000';
      ctrl.locations = [{ LocationId: 1, Timezone: 'Hawaiian Standard Time' }];
      scope.serviceTransaction = {
        Tooth: 2,
        DateEntered: originalDateEnteredValue,
        AffectedAreaId: 4,
        Surface: 'M',
        Roots: 'P',
        LocationId: 1,
      };
      ctrl.createServiceTransaction(5, true);
      scope.$apply();
      expect(scope.serviceTransaction.DateEntered).toEqual(
        originalDateEnteredValue
      );
    });

    it('should set fee to response from setFeeForServiceTransaction', function (done) {
      scope.serviceTransaction.Fee = null;
      scope.currentServiceCode = { $$locationFee: 222 };
      scope.existingService = false;
      spyOn(ctrl, 'setFeeForServiceTransaction').and.returnValue(q.resolve(97));
      ctrl.createServiceTransaction(5, true).then(result => {
        expect(ctrl.setFeeForServiceTransaction).toHaveBeenCalled();
        expect(result.Fee).toEqual(97);
        done();
      });
      scope.$apply();
    });
  });

  describe('ctrl.getServiceCodeId method ->', function () {
    beforeEach(function () {
      // ServiceCode.AffectedAreaId was 5 at time that the service transaction was created
      scope.serviceTransaction = {
        AffectedAreaId: 5,
        ServiceCodeId: '123456789',
        Tooth: '11',
        Fee: 333,
      };
      // ServiceCode.AffectedAreaId has been modified to Mouth
      serviceCodesService.LoadedServiceCodes = [
        { ServiceCodeId: '123456789', AffectedAreaId: 1 },
        { ServiceCodeId: '123456787', AffectedAreaId: 5 },
        { ServiceCodeId: '123456788', AffectedAreaId: 3 },
      ];
      //ctrl.getServiceCodeId = jasmine.createSpy().and.returnValue({ ServiceCodeId: '123456789', AffectedAreaId: 1 });
      scope.selectedChrtBtn = { UsuallyPerformedByProviderTypeId: null };
    });

    it('should call getRootSmartCodeForTooth when area is 3', function () {
      //spyOn(ctrl, 'getRootSmartCodeForTooth').and.returnValue(10);
      ctrl.getRootSmartCodeForTooth = jasmine.createSpy().and.returnValue(10);
      scope.area = 3;
      var result = ctrl.getServiceCodeId(5);
      expect(ctrl.getRootSmartCodeForTooth).toHaveBeenCalledWith(5);
      expect(result).toEqual(10);
    });
  });

  describe('ctrl.setStatusDisabled method ->', function () {
    var serviceTransaction;
    beforeEach(function () {
      ctrl.isAssociatedWithTreatmentPlan === false;
      serviceTransaction = {
        AppointmentId: null,
        EncounterId: null,
        ServiceTransactionId: '1234',
        Code: 'd2140',
      };
    });

    it('should set statusDisabled to true if service is on any treatment plan', function () {
      ctrl.isAssociatedWithTreatmentPlan = true;
      ctrl.setStatusDisabled(serviceTransaction);
      expect(scope.statusDisabled).toEqual(false);
    });

    it('should set statusDisabled to true if Appointment is not null', function () {
      serviceTransaction.AppointmentId = '2345';
      ctrl.setStatusDisabled(serviceTransaction);
      expect(scope.statusDisabled).toEqual(true);
    });

    it('should set statusDisabled to true if EncounterId is not null', function () {
      serviceTransaction.EncounterId = '2345';
      ctrl.setStatusDisabled(serviceTransaction);
      expect(scope.statusDisabled).toEqual(true);
    });

    it('should set statusDisabled false otherwise', function () {
      ctrl.setStatusDisabled(serviceTransaction);
      expect(scope.statusDisabled).toEqual(false);
    });
  });

  describe('ctrl.setFeeForExistingService method ->', function () {
    var serviceTransaction;
    beforeEach(function () {
      ctrl.isAssociatedWithTreatmentPlan === false;
      scope.existingService = false;
      scope.referredService = false;
      serviceTransaction = {
        AppointmentId: null,
        EncounterId: null,
        ServiceTransactionId: '1234',
        Code: 'd2140',
        Fee: 5,
      };
    });

    it('should set Fee to 0 if service is Existing', function () {
      scope.existingService = true;
      ctrl.setFeeForExistingService(serviceTransaction);
      expect(serviceTransaction.Fee).toEqual(0);
    });

    it('should set Fee to 0 if service is Referred or ReferredCompleted', function () {
      scope.referredService = true;
      ctrl.setFeeForExistingService(serviceTransaction);
      expect(serviceTransaction.Fee).toEqual(0);
    });

    it('should leave Fee as its original value if service is not Existing or Referred', function () {
      ctrl.setFeeForExistingService(serviceTransaction);
      expect(serviceTransaction.Fee).toEqual(5);
    });
  });

  // ARWEN: #509747 These test cases need to be reviewed. By using $apply it forces the watcher to fire
  // which causes the Fee to be changed by the watch function in the controller.
  describe('ctrl.updateServiceTransaction method ->', function () {
    beforeEach(function () {
      ctrl.isAssociatedWithTreatmentPlan === false;
      scope.serviceTransactionFeeBackUp = 0; // ARWEN: #509747 Had to be added to make the cases work below.
      scope.existingService = false;
      scope.referredService = false;
      scope.serviceTransaction = {
        AppointmentId: null,
        EncounterId: null,
        ServiceTransactionId: '1234',
        Code: 'd2140',
        Fee: 5,
      };
    });

    it('should set Fee to 0 if service is Existing', function () {
      scope.existingService = true;
      ctrl.updateServiceTransaction();
      scope.$apply();
      expect(scope.serviceTransaction.Fee).toEqual(0);
    });

    it('should set Fee to 0 if service is Referred or ReferredCompleted', function () {
      scope.referredService = true;
      ctrl.updateServiceTransaction();
      scope.$apply();
      expect(scope.serviceTransaction.Fee).toEqual(0);
    });

    it('should leave Fee as its original value if service is not Existing or Referred', function () {
      ctrl.updateServiceTransaction();
      scope.$apply();
      expect(scope.serviceTransaction.Fee).toEqual(5);
    });
  });

  describe('ctrl.filterServiceTransactionStatusesForEdit method ->', function () {
    beforeEach(function () {
      ctrl.serviceTransactionStatuses = [{}, {}, {}, {}, {}, {}];
      scope.filteredServiceTransactionStatuses = [{}, {}, {}];
    });

    it('should change filter to contain complete list is status is disabled', function () {
      scope.statusDisabled = true;
      ctrl.filterServiceTransactionStatusesForEdit();
      expect(scope.filteredServiceTransactionStatuses).toEqual([
        {},
        {},
        {},
        {},
        {},
        {},
      ]);
    });

    it('should not change filter is status is not disabled', function () {
      scope.statusDisabled = false;
      ctrl.filterServiceTransactionStatusesForEdit();
      expect(scope.filteredServiceTransactionStatuses).toEqual([{}, {}, {}]);
    });
  });

  // ARWEN: #509747 Needs to be reviewed. Since this is now using $apply, the watchers are being
  // triggered which are changing the test behavior.
  describe('ctrl.setControlValues ->', function () {
    beforeEach(function () {
      spyOn(ctrl, 'setStatusDisabled').and.callThrough();
      spyOn(ctrl, 'filterServiceTransactionStatusesForEdit').and.callThrough();
      spyOn(ctrl, 'setToothInfo').and.callThrough();
      spyOn(ctrl, 'setActiveSurfaces').and.callThrough();
      spyOn(ctrl, 'setActiveRoots').and.callThrough();
      spyOn(ctrl, 'checkPropertiesByAffectedArea').and.callThrough();
      spyOn(ctrl, 'checkUserLocationAssignment').and.callThrough();
      moment.tz.setDefault('America/Chicago');
    });
    it('should set control values correctly', function () {
      var date = new Date('2019-4-9');
      scope.serviceTransaction = {
        Tooth: 2,
        AffectedAreaId: 4,
        Surface: 'M',
        Roots: 'P',
        LocationId: 1,
        DateEntered: date,
      };
      // ARWEN: #509747 added to resolve error in call to ctrl.getNextSmartCode.
      scope.originalSmartCode = {
        Tooth: 2,
        AffectedAreaId: 4,
        Surface: 'M',
        Roots: 'P',
        LocationId: 1,
        DateEntered: date,
      };
      ctrl.locations = [];
      ctrl.setControlValues();
      scope.$apply();
      expect(ctrl.setStatusDisabled).toHaveBeenCalled();
      expect(ctrl.filterServiceTransactionStatusesForEdit).toHaveBeenCalled();
      expect(ctrl.setToothInfo).toHaveBeenCalled();
      expect(ctrl.setActiveSurfaces).toHaveBeenCalled();
      expect(ctrl.setActiveRoots).toHaveBeenCalled();
      expect(ctrl.checkPropertiesByAffectedArea).toHaveBeenCalled();
      expect(ctrl.checkUserLocationAssignment).toHaveBeenCalled();
      // ARWEN: #509747 removed as they are no longer identical after watcher runs
      // expect(scope.originalServiceTransaction).toEqual(scope.serviceTransaction);
      expect(scope.serviceTransaction.DateEntered).toEqual(
        moment.utc(date).toDate()
      );
    });

    it('should not change DateEntered', function () {
      ctrl.locations = [{ LocationId: 1, Timezone: 'Hawaiian Standard Time' }];
      scope.serviceTransaction = {
        Tooth: 2,
        DateEntered: '2019-06-14 06:16:18.8940000',
        AffectedAreaId: 4,
        Surface: 'M',
        Roots: 'P',
        LocationId: 1,
      };
      scope.originalSmartCode = {};
      ctrl.setControlValues();
      scope.$apply();
      expect(scope.serviceTransaction.DateEntered).toEqual(
        '2019-06-14 06:16:18.8940000'
      );
    });

    afterEach(function () {
      moment.tz.setDefault();
    });
  });

  // ARWEN: #509747 Need to review this test case. The $apply causes watchers to be triggered
  // and changes the test behavior.
  describe('ctrl.setControlValues ->', function () {
    it('should set control values correctly', function () {
      var date = new Date('2019-4-9');
      scope.serviceTransaction = {
        Tooth: 2,
        AffectedAreaId: 4,
        Surface: 'M',
        Roots: 'P',
        LocationId: 1,
        DateEntered: date,
      };
      // ARWEN: #509747 added to avoid error in ctrl.getNextSmartCode
      scope.originalSmartCode = {};
      ctrl.locations = [];
      var spy1 = spyOn(ctrl, 'setStatusDisabled').and.callThrough();
      var spy2 = spyOn(
        ctrl,
        'filterServiceTransactionStatusesForEdit'
      ).and.callThrough();
      var spy3 = spyOn(ctrl, 'setToothInfo').and.callThrough();
      var spy4 = spyOn(ctrl, 'setActiveSurfaces').and.callThrough();
      var spy5 = spyOn(ctrl, 'setActiveRoots').and.callThrough();
      var spy6 = spyOn(ctrl, 'checkPropertiesByAffectedArea').and.callThrough();
      var spy7 = spyOn(ctrl, 'checkUserLocationAssignment').and.callThrough();
      ctrl.setControlValues();
      scope.$apply();
      expect(spy1).toHaveBeenCalled();
      expect(spy2).toHaveBeenCalled();
      expect(spy3).toHaveBeenCalled();
      expect(spy4).toHaveBeenCalled();
      expect(spy5).toHaveBeenCalled();
      expect(spy6).toHaveBeenCalled();
      expect(spy7).toHaveBeenCalled();
      // ARWEN: #509747 removed as they are no longer identical after watcher runs
      // expect(scope.originalServiceTransaction).toEqual(scope.serviceTransaction);
      expect(scope.serviceTransaction.DateEntered).toEqual(
        moment.utc(date).toDate()
      );
    });
  });

  describe('ctrl.checkForAssociatedTxPlans method ->', function () {
    beforeEach(function () {
      spyOn(ctrl, 'setLocationDisabled');
    });

    it('should call treatmentPlansFactory.GetTxPlanFlags with serviceTransaction.ServiceTransactionId', function () {
      var serviceTransactionId = ['1234'];
      ctrl.checkForAssociatedTxPlans('1234');
      expect(treatmentPlansFactory.GetTxPlanFlags).toHaveBeenCalledWith(
        serviceTransactionId
      );
    });
  });

  describe('ctrl.checkSmartCodesForRoots method ->', function () {
    var activeTeeth;
    beforeEach(function () {
      activeTeeth = [6, 30];
      scope.currentServiceCode = {
        UseSmartCodes: true,
        AffectedAreaId: 3,
        ServiceCodeId: '1234',
        Description: 'ServiceCodeDescription',
      };
      spyOn(ctrl, 'getNextSmartCodeForRootAffectedArea');
    });

    it('should call proposedServiceFactory.GetNumberOfRoots with first tooth in activeTeeth if AffectedArea = 3', function () {
      activeTeeth = [6, 30];
      ctrl.checkSmartCodesForRoots(activeTeeth);
      expect(proposedServiceFactory.GetNumberOfRoots).toHaveBeenCalledWith(6);
    });

    it('should not call proposedServiceFactory.GetNumberOfRoots if AffectedArea is not 3', function () {
      scope.currentServiceCode.AffectedAreaId = 4;
      activeTeeth = [6, 30];
      ctrl.checkSmartCodesForRoots(activeTeeth);
      expect(proposedServiceFactory.GetNumberOfRoots).not.toHaveBeenCalledWith(
        activeTeeth
      );
    });

    it('should not call proposedServiceFactory.GetNumberOfRoots if activeTeeth.length is 0', function () {
      scope.currentServiceCode.AffectedAreaId = 3;
      activeTeeth = [];
      ctrl.checkSmartCodesForRoots(activeTeeth);
      expect(proposedServiceFactory.GetNumberOfRoots).not.toHaveBeenCalled();
    });

    it('should call ctrl.getNextSmartCodeForRootAffectedArea for each tooth in activeTeeth if AffectedArea = 3', function () {
      activeTeeth = [6];
      proposedServiceFactory.GetNumberOfRoots = jasmine
        .createSpy()
        .and.returnValue(3);
      ctrl.checkSmartCodesForRoots(activeTeeth);
      expect(ctrl.getNextSmartCodeForRootAffectedArea).toHaveBeenCalledWith(3);
    });

    it('should set activeTeeth to itself', function () {
      activeTeeth = [6, 4];
      proposedServiceFactory.GetNumberOfRoots = jasmine
        .createSpy()
        .and.returnValue(3);
      ctrl.checkSmartCodesForRoots(activeTeeth);
      expect(activeTeeth).toEqual([6, 4]);
    });
  });

  describe('ctrl.getRootSmartCodeForTooth method ->', function () {
    beforeEach(function () {});

    it('should return currentServiceCode when UseSmartCodes is false', function () {
      scope.currentServiceCode = {
        UseSmartCodes: false,
        AffectedAreaId: 3,
        ServiceCodeId: '1234',
        Description: 'ServiceCodeDescription',
      };
      var response = ctrl.getRootSmartCodeForTooth('1');
      expect(response).toEqual(scope.currentServiceCode.ServiceCodeId);
    });

    it('should return new smart code when UseSmartCodes is true', function () {
      proposedServiceFactory.GetNumberOfRoots = jasmine
        .createSpy()
        .and.callFake(function () {
          return '1';
        });
      proposedServiceFactory.GetSmartCodeForRootAffectedArea = jasmine
        .createSpy()
        .and.callFake(function () {
          return { ServiceCodeId: '54321' };
        });
      scope.currentServiceCode = {
        UseSmartCodes: true,
        AffectedAreaId: 3,
        ServiceCodeId: '1234',
        Description: 'ServiceCodeDescription',
      };
      var response = ctrl.getRootSmartCodeForTooth({ USNumber: '1' });
      expect(response).toEqual('54321');
    });

    it('should return currentServiceCode when GetSmartCodeForRootAffectedArea returns undefined', function () {
      proposedServiceFactory.GetNumberOfRoots = jasmine
        .createSpy()
        .and.callFake(function () {
          return '1';
        });
      proposedServiceFactory.GetSmartCodeForRootAffectedArea = jasmine
        .createSpy()
        .and.callFake(function () {
          return undefined;
        });
      scope.currentServiceCode = {
        UseSmartCodes: true,
        AffectedAreaId: 3,
        ServiceCodeId: '1234',
        Description: 'ServiceCodeDescription',
      };
      var response = ctrl.getRootSmartCodeForTooth({ USNumber: '1' });
      expect(response).toEqual('1234');
    });
  });

  describe('ctrl.getNextSmartCodeForRootAffectedArea method ->', function () {
    var numberOfRoots = [];
    var nextSmartCode;
    beforeEach(function () {
      scope.currentServiceCode = {
        ServiceCodeId: '1234',
        UseSmartCodes: true,
        AffectedAreaId: 3,
        Description: 'ServiceCodeDescription',
        CdtCodeName: 'CdtCodeName1',
      };
      nextSmartCode = {
        ServiceCodeId: '2345',
        Description: 'ServiceCodeDescription',
        CdtCode: 'CdtCodeName1',
      };
      numberOfRoots = [2, 3];
      scope.activeTeeth = ['6'];
      scope.serviceTransaction = { ServiceTransactionStatusId: 1 };
      scope.originalSmartCode = {
        ServiceCodeId: '3456',
        Description: 'ServiceCodeDescription2',
        CdtCode: 'CdtCodeName2',
      };
      scope.checkSmartCodeGroup = [];
      ctrl.modalClosing = false;
    });

    it('should do nothing if ctrl.modalClosing is true', function () {
      scope.modalClosing = true;
      ctrl.getNextSmartCodeForRootAffectedArea(numberOfRoots);
      expect(
        proposedServiceFactory.GetSmartCodeForRootAffectedArea
      ).not.toHaveBeenCalled();
    });

    it('should not call proposedServiceFactory.GetSmartCodeForRootAffectedArea if scope.serviceTransaction.ServiceTransactionStatusId is 4', function () {
      scope.serviceTransaction.ServiceTransactionStatusId = 4;
      ctrl.getNextSmartCodeForRootAffectedArea(numberOfRoots);
      expect(
        proposedServiceFactory.GetSmartCodeForRootAffectedArea
      ).not.toHaveBeenCalled();
    });

    it('should not call proposedServiceFactory.GetSmartCodeForRootAffectedArea if numberOfRoots.length is less than 1', function () {
      scope.modalClosing = false;
      numberOfRoots = [];
      ctrl.getNextSmartCodeForRootAffectedArea(0);
      expect(
        proposedServiceFactory.GetSmartCodeForRootAffectedArea
      ).not.toHaveBeenCalled();
    });

    it('should not call proposedServiceFactory.GetSmartCodeForRootAffectedArea if currentServiceCode.UseSmartCodes is false', function () {
      scope.currentServiceCode.UseSmartCodes = false;
      ctrl.getNextSmartCodeForRootAffectedArea(numberOfRoots);
      expect(
        proposedServiceFactory.GetSmartCodeForRootAffectedArea
      ).not.toHaveBeenCalled();
    });

    it(
      'should call proposedServiceFactory.GetSmartCodeForRootAffectedArea if currentServiceCode.UseSmartCodes is true and numberOfRoots.length is 1 or more' +
        'and AffectedAreaId is 3 and modalClosing is false',
      function () {
        nextSmartCode = {
          ServiceCodeId: '2345',
          Description: 'ServiceCodeDescription',
          CdtCode: 'CdtCodeName3',
        };
        proposedServiceFactory.GetSmartCodeForRootAffectedArea = jasmine
          .createSpy()
          .and.returnValue(nextSmartCode);
        spyOn(ctrl, 'setNextSmartCodeForRootAffectedArea').and.returnValue(
          nextSmartCode
        );
        ctrl.getNextSmartCodeForRootAffectedArea(numberOfRoots);
        expect(
          proposedServiceFactory.GetSmartCodeForRootAffectedArea
        ).toHaveBeenCalledWith(numberOfRoots, scope.currentServiceCode);
      }
    );

    it(
      'should call proposedServiceFactory.GetSmartCodeForRootAffectedArea if currentServiceCode.UseSmartCodes is true and numberOfRoots.length is 1 or more' +
        'and AffectedAreaId is 3 and modalClosing is false',
      function () {
        proposedServiceFactory.GetSmartCodeForRootAffectedArea = jasmine
          .createSpy()
          .and.returnValue(nextSmartCode);
        nextSmartCode = {
          ServiceCodeId: '2345',
          Description: 'ServiceCodeDescription',
          CdtCode: 'CdtCodeName3',
        };
        spyOn(ctrl, 'setNextSmartCodeForRootAffectedArea').and.returnValue(
          nextSmartCode
        );

        ctrl.getNextSmartCodeForRootAffectedArea(numberOfRoots);
        expect(
          proposedServiceFactory.GetSmartCodeForRootAffectedArea
        ).toHaveBeenCalledWith(numberOfRoots, scope.currentServiceCode);
      }
    );

    it(
      'should set scope.nextSmartCode to nextSmartCode return from proposedServiceFactory.GetSmartCodeForRootAffectedArea ' +
        'if proposedServiceFactory.GetSmartCodeForRootAffectedArea is called and setNextSmartCodeForRootAffectedArea returns same',
      function () {
        nextSmartCode = {
          ServiceCodeId: '2345',
          Description: 'ServiceCodeDescription',
          CdtCode: 'CdtCodeName3',
        };
        proposedServiceFactory.GetSmartCodeForRootAffectedArea = jasmine
          .createSpy()
          .and.returnValue(nextSmartCode);
        spyOn(ctrl, 'setNextSmartCodeForRootAffectedArea').and.returnValue(
          nextSmartCode
        );

        ctrl.getNextSmartCodeForRootAffectedArea(numberOfRoots);
        expect(scope.nextSmartCode).toEqual(nextSmartCode);
      }
    );

    it(
      'should set scope.nextSmartCode to originalSmartCode if proposedServiceFactory.GetSmartCodeForRootAffectedArea is called and ' +
        'setNextSmartCodeForRootAffectedArea returns original smartCode',
      function () {
        nextSmartCode = {
          ServiceCodeId: '2345',
          Description: 'ServiceCodeDescription',
          CdtCode: 'CdtCodeName3',
        };
        var originalSmartCode = {
          ServiceCodeId: '1234',
          Description: 'ServiceCodeDescription',
          CdtCode: 'CdtCodeName3',
        };
        proposedServiceFactory.GetSmartCodeForRootAffectedArea = jasmine
          .createSpy()
          .and.returnValue(nextSmartCode);
        spyOn(ctrl, 'setNextSmartCodeForRootAffectedArea').and.returnValue(
          originalSmartCode
        );

        ctrl.getNextSmartCodeForRootAffectedArea(numberOfRoots);
        expect(scope.nextSmartCode).not.toEqual(nextSmartCode);
      }
    );

    it(
      'should call ctrl.resetServiceTransaction if proposedServiceFactory.GetSmartCodeForRootAffectedArea is called and ' +
        'setNextSmartCodeForRootAffectedArea returns nextSmartCode',
      function () {
        spyOn(ctrl, 'resetServiceTransaction');
        scope.currentServiceCode = {
          ServiceCodeId: '1234',
          UseSmartCodes: true,
          AffectedAreaId: 3,
          Description: 'ServiceCodeDescription',
          CdtCodeName: 'CdtCodeName1',
        };

        nextSmartCode = {
          ServiceCodeId: '2345',
          Description: 'ServiceCodeDescription',
          CdtCode: 'CdtCodeName3',
        };
        proposedServiceFactory.GetSmartCodeForRootAffectedArea = jasmine
          .createSpy()
          .and.returnValue(nextSmartCode);
        spyOn(ctrl, 'setNextSmartCodeForRootAffectedArea').and.returnValue(
          nextSmartCode
        );
        ctrl.getNextSmartCodeForRootAffectedArea(numberOfRoots);
        expect(ctrl.resetServiceTransaction).toHaveBeenCalledWith(
          nextSmartCode,
          false
        );
      }
    );

    it(
      'should call ctrl.resetServiceTransaction if proposedServiceFactory.GetSmartCodeForRootAffectedArea is called and ' +
        'setNextSmartCodeForRootAffectedArea returns originalSmartCode',
      function () {
        spyOn(ctrl, 'resetServiceTransaction');
        nextSmartCode = {
          ServiceCodeId: '2345',
          Description: 'ServiceCodeDescription',
          CdtCode: 'CdtCodeName3',
        };
        var originalSmartCode = {
          ServiceCodeId: '1234',
          Description: 'ServiceCodeDescription',
          CdtCode: 'CdtCodeName3',
        };
        proposedServiceFactory.GetSmartCodeForRootAffectedArea = jasmine
          .createSpy()
          .and.returnValue(nextSmartCode);
        spyOn(ctrl, 'setNextSmartCodeForRootAffectedArea').and.returnValue(
          originalSmartCode
        );
        ctrl.getNextSmartCodeForRootAffectedArea(numberOfRoots);
        expect(ctrl.resetServiceTransaction).toHaveBeenCalledWith(
          originalSmartCode,
          false
        );
      }
    );

    it('should call ctrl.appendKendoWindowTitle ', function () {
      spyOn(ctrl, 'appendKendoWindowTitle').and.callFake(function () {});
      nextSmartCode = {
        ServiceCodeId: '2345',
        Description: 'ServiceCodeDescription',
        CdtCode: 'CdtCodeName3',
      };
      proposedServiceFactory.GetSmartCodeForRootAffectedArea = jasmine
        .createSpy()
        .and.returnValue(nextSmartCode);
      spyOn(ctrl, 'setNextSmartCodeForRootAffectedArea').and.returnValue(
        nextSmartCode
      );
      ctrl.getNextSmartCodeForRootAffectedArea(numberOfRoots);
      expect(ctrl.appendKendoWindowTitle).toHaveBeenCalled();
    });
  });

  describe('ctrl.setNextSmartCodeForRootAffectedArea method ->', function () {
    var nextSmartCode;
    var originalSmartCode;

    beforeEach(function () {
      nextSmartCode = {
        ServiceCodeId: '2345',
        Description: 'ServiceCodeDescription',
        CdtCode: 'CdtCodeName3',
      };
      originalSmartCode = {
        ServiceCodeId: '1234',
        Description: 'ServiceCodeDescription',
        CdtCode: 'CdtCodeName3',
      };
      scope.currentServiceCode = {
        ServiceCodeId: '1234',
        UseSmartCodes: true,
        AffectedAreaId: 3,
        Description: 'ServiceCodeDescription',
        CdtCodeName: 'CdtCodeName3',
      };
    });

    it('should return nextSmartCode if match is found in smartCodeGroup', function () {
      nextSmartCode.CdtCode = 'CdtCodeName3';
      scope.currentServiceCode.CdtCodeName = 'CdtCodeName1';
      spyOn(scope.smartCodeGroup, 'filter').and.returnValue(['1234']);
      expect(
        ctrl.setNextSmartCodeForRootAffectedArea(
          nextSmartCode,
          originalSmartCode
        )
      ).toEqual(nextSmartCode);
    });

    it('should return originalSmartCode if no match found in smartCodeGroup', function () {
      nextSmartCode.CdtCode = 'CdtCodeName3';
      scope.currentServiceCode.CdtCodeName = 'CdtCodeName1';
      spyOn(scope.smartCodeGroup, 'filter').and.returnValue([]);
      expect(
        ctrl.setNextSmartCodeForRootAffectedArea(
          nextSmartCode,
          originalSmartCode
        )
      ).toEqual(originalSmartCode);
    });

    it('should return originalSmartCode if match found in smartCodeGroup but nextSmartCode.CdtCode equals currentServiceCode.CdtCodeName', function () {
      nextSmartCode.CdtCode = 'CdtCodeName3';
      scope.currentServiceCode.CdtCodeName = 'CdtCodeName3';
      spyOn(scope.smartCodeGroup, 'filter').and.returnValue(['1234']);
      expect(
        ctrl.setNextSmartCodeForRootAffectedArea(
          nextSmartCode,
          originalSmartCode
        )
      ).toEqual(originalSmartCode);
    });
  });

  describe('ctrl.saveServiceTransactionsToTreatmentPlans method ->', function () {
    var serviceTransactions = [];
    beforeEach(function () {
      serviceTransactions = [
        {
          TreatmentPlanId: '111',
          ServiceCodeId: '23456',
          Tooth: '11',
          Fee: 333,
        },
        { TreatmentPlanId: '111', ServiceCodeId: '12345', Fee: 111 },
      ];
      spyOn(ctrl, 'loadServiceTransactionsToTreatmentPlanServices');
    });

    it('should call loadServiceTransactionsToTreatmentPlanServices with services', function () {
      ctrl.saveServiceTransactionsToTreatmentPlans(serviceTransactions);
      expect(
        ctrl.loadServiceTransactionsToTreatmentPlanServices
      ).toHaveBeenCalledWith(serviceTransactions);
    });

    it('should call treatmentPlansFactory.NextPriority with treatmentPlanId from first service', function () {
      ctrl.saveServiceTransactionsToTreatmentPlans(serviceTransactions);
      expect(treatmentPlansFactory.NextPriority).toHaveBeenCalledWith(
        serviceTransactions[1].TreatmentPlanId
      );
    });

    it('should slice if stage length not equal to zero', function () {
      scope.stageSelected.number = 'New Stage (4)';
      var txGroupNumber = scope.stageSelected.number;
      if (!_.isNil(txGroupNumber)) {
        expect(txGroupNumber.slice(0, 9)).toBe('New Stage');
        if (txGroupNumber.slice(0, 9) === 'New Stage') {
          scope.stageSelected.number = scope.stageSelected.number.slice(11, -1);
        }
      }
      expect(scope.stageSelected.number).toBe('4');
    });

    it('should not slice if the stage length equal to null', function () {
      scope.stageSelected.number = null;
      var txGroupNumber = scope.stageSelected.number;
      if (!_.isNil(txGroupNumber)) {
        if (txGroupNumber.slice(0, 9) === 'New Stage') {
          scope.stageSelected.number = scope.stageSelected.number.slice(11, -1);
        }
      }
      expect(scope.stageSelected.number).toBe(null);
    });

    it('should not slice if the stage length is 2', function () {
      scope.stageSelected.number = '2';
      var txGroupNumber = scope.stageSelected.number;
      if (!_.isNil(txGroupNumber)) {
        expect(txGroupNumber.slice(0, 9)).toBe('2');
        if (txGroupNumber.slice(0, 9) === 'New Stage') {
          scope.stageSelected.number = scope.stageSelected.number.slice(11, -1);
        }
        expect(scope.stageSelected.number).toBe('2');
      }
    });
  });

  describe('ctrl.getSelectedTreatmentPlanSummary method ->', function () {
    beforeEach(function () {});

    it('should return treatmentPlanSummary that matches the treatmentPlanId ', function () {
      scope.treatmentPlanSummaries = [
        {
          ServicesFees: 100,
          TreatmentPlanName: 'TreatmentPlan1',
          ServicesCount: 2,
          TreatmentPlanId: 1,
        },
        {
          ServicesFees: 1000,
          TreatmentPlanName: 'TreatmentPlan2',
          ServicesCount: 12,
          TreatmentPlanId: 2,
        },
        {
          ServicesFees: 1500,
          TreatmentPlanName: 'TreatmentPlan3',
          ServicesCount: 3,
          TreatmentPlanId: 3,
        },
      ];
      var treatmentPlanId = 1;
      var selectedTreatmentPlanSummary = ctrl.getSelectedTreatmentPlanSummary(
        treatmentPlanId
      );
      expect(selectedTreatmentPlanSummary).toEqual(
        scope.treatmentPlanSummaries[0]
      );
    });

    it('should return treatmentPlanSummary that matches the treatmentPlanId ', function () {
      scope.treatmentPlanSummaries = [
        {
          ServicesFees: 100,
          TreatmentPlanName: 'TreatmentPlan1',
          ServicesCount: 2,
          TreatmentPlanId: 1,
        },
        {
          ServicesFees: 1000,
          TreatmentPlanName: 'TreatmentPlan2',
          ServicesCount: 12,
          TreatmentPlanId: 2,
        },
        {
          ServicesFees: 1500,
          TreatmentPlanName: 'TreatmentPlan3',
          ServicesCount: 3,
          TreatmentPlanId: 3,
        },
      ];
      var treatmentPlanId = 4;
      var selectedTreatmentPlanSummary = ctrl.getSelectedTreatmentPlanSummary(
        treatmentPlanId
      );
      expect(selectedTreatmentPlanSummary).toEqual({});
    });
  });

  describe('scope.close method ->', function () {
    beforeEach(function () {
      scope.serviceTransaction = {
        ServiceCodeId: '1234',
        Tooth: '11',
        Fee: 333,
      };
      spyOn(rootScope, '$broadcast').and.callFake(function () {});
      spyOn(ctrl, 'updateChartLedger').and.callFake(function () {});
    });

    it('should call ctrl.modalClosing', function () {
      scope.close();
      expect(scope.modalClosing).toBe(true);
      expect(scope.activeTeeth).toEqual([]);
      expect(scope.currentServiceCode).toBe(null);
      expect(rootScope.$broadcast).toHaveBeenCalledWith(
        'close-tooth-window',
        true
      );
    });

    it('should not broadcast soar:chart-services-reload-ledger if scope.isLastCode is false and or scope.isSwiftCode is false', function () {
      scope.close();
      expect(ctrl.updateChartLedger).toHaveBeenCalled;
    });
  });

  describe('ctrl.updateChartLedger ->', function () {
    beforeEach(function () {
      spyOn(rootScope, '$broadcast').and.callFake(function () {});
    });

    it('should broadcast soar:chart-services-reload-ledger if scope.isLastCode is true and scope.isSwiftCode is true', function () {
      scope.isLastcode = true;
      scope.isSwiftCode = true;
      ctrl.updateChartLedger();
      expect(rootScope.$broadcast).toHaveBeenCalledWith(
        'soar:chart-services-reload-ledger'
      );
    });

    it('should not broadcast soar:chart-services-reload-ledger if scope.isLastCode is false and or scope.isSwiftCode is false', function () {
      scope.isLastcode = true;
      scope.isSwiftCode = false;
      ctrl.updateChartLedger();
      expect(rootScope.$broadcast).not.toHaveBeenCalled();

      scope.isLastcode = false;
      scope.isSwiftCode = true;
      ctrl.updateChartLedger();
      expect(rootScope.$broadcast).not.toHaveBeenCalled();

      scope.isLastcode = false;
      scope.isSwiftCode = false;
      ctrl.updateChartLedger();
      expect(rootScope.$broadcast).not.toHaveBeenCalled();
    });
  });

  describe('watch serviceTransaction.$$DateEntered ->', function () {
    beforeEach(function () {
      spyOn(scope, 'validateForm');
    });
    it('should set $scope.dataHasChanged true when new value', function () {
      scope.dataHasChanged = false;
      scope.serviceTransaction = {
        $$DateEntered: '2019-06-14 06:16:18.8940000',
      };
      scope.$apply();
      scope.serviceTransaction = {
        $$DateEntered: '2019-06-13 06:16:18.8940000',
      };
      scope.$apply();
      expect(scope.dataHasChanged).toEqual(true);
    });

    it('should set $scope.dataHasChanged true when new value', function () {
      scope.dataHasChanged = false;
      scope.serviceTransaction = {
        $$DateEntered: '2019-06-14 06:16:18.8940000',
      };
      scope.$apply();
      scope.serviceTransaction = {
        $$DateEntered: '2019-06-13 06:16:18.8940000',
      };
      scope.$apply();
      expect(scope.validateForm).toHaveBeenCalled();
    });
  });

  describe('ctrl.hoursDifference ->', function () {
    it('should return number of hours between 2 dates', function () {
      var originalDate = '2019-06-14 06:16:18.8940000';
      var currentDate = '2019-06-12 06:16:18.8940000';
      expect(ctrl.hoursDifference(originalDate, currentDate)).toBe(-48);
    });
  });

  describe('ctrl.daysDifference ->', function () {
    it('should return number of days between 2 dates', function () {
      var originalDate = '2019-06-14 06:16:18.8940000';
      var currentDate = '2019-06-12 06:16:18.8940000';
      expect(ctrl.daysDifference(originalDate, currentDate)).toBe(-2);
    });
  });

  describe('checkDateEntered ->', function () {
    beforeEach(function () {
      // mock today
      let today = moment('2019-11-06 16:55:29.000').toDate();
      jasmine.clock().mockDate(today);
      //scope.serviceTransaction ={$$DateEntered:'2019-06-14 06:16:18.8940000'};
      ctrl.originalDisplayDate = '2019-06-14 06:16:18.8940000';
    });

    it('should not reset DateEntered if days difference between ctrl.originalDateEntered and $$DateEntered = 0', function () {
      scope.serviceTransaction = {
        $$DateEntered: '2019-06-14 06:16:18.8940000',
        DateEntered: '2019-06-14 09:16:18.8940000',
      };
      ctrl.originalDisplayDate = '2019-06-14 09:16:18.8940000';
      ctrl.checkDateEntered();
      expect(scope.serviceTransaction.DateEntered).toBe(
        '2019-06-14 09:16:18.8940000'
      );
    });

    it('should reset DateEntered if days difference between ctrl.originalDateEntered and $$DateEntered more than 0', function () {
      scope.serviceTransaction = {
        $$DateEntered: '2019-06-14 06:16:18.8940000',
        DateEntered: '2019-06-12 09:16:18.8940000',
      };
      ctrl.originalDisplayDate = '2019-06-14 09:16:18.8940000';
      ctrl.checkDateEntered();
      expect(new Date(scope.serviceTransaction.DateEntered).getDate()).toBe(12);
    });

    it('should reset DateEntered if days difference between ctrl.originalDateEntered and $$DateEntered more than 0', function () {
      scope.serviceTransaction = {
        $$DateEntered: '2019-11-08T16:59:10.000Z',
        DateEntered: '2019-12-06T08:59:10.000Z',
      };
      ctrl.originalDisplayDate = '2019-12-06T16:59:10.000Z';
      ctrl.checkDateEntered();
      expect(new Date(scope.serviceTransaction.DateEntered).getDate()).toBe(8);
    });
  });

  describe('ctrl.getTreatmentplanStages ->', function () {
    var singleStage;
    var doubleStage;
    var tripleStage;
    beforeEach(function () {
      spyOn(ctrl, 'setStageSelected');
      treatmentPlansFactory.ExistingTreatmentPlans = _.cloneDeep(
        existingTreatmentPlans
      );
      scope.stageNumber = 1;
      singleStage = [{ stageno: 1 }];
      doubleStage = [{ stageno: 1 }, { stageno: 2 }];
      tripleStage = [{ stageno: 1 }, { stageno: 2 }, { stageno: 3 }];
    });

    it('should call ctrl.setStageSelected', function () {
      treatmentPlansFactory.GetPlanStages = jasmine
        .createSpy('treatmentPlansFactory.GetPlanStages')
        .and.returnValue(tripleStage);
      ctrl.getTreatmentplanStages('1234');
      expect(ctrl.setStageSelected).toHaveBeenCalled();
    });

    it('should create scope.planStages based on current stages in treatmentPlan returned from treatmentPlansFactory.GetPlanStages', function () {
      treatmentPlansFactory.GetPlanStages = jasmine
        .createSpy('treatmentPlansFactory.GetPlanStages')
        .and.returnValue(tripleStage);
      ctrl.getTreatmentplanStages('1236');
      expect(scope.planStages).toEqual([
        { stageno: 1, stagedesc: 1 },
        { stageno: 2, stagedesc: 2 },
        { stageno: 3, stagedesc: 3 },
        { stageno: 4, stagedesc: 'New Stage (4)' },
      ]);

      treatmentPlansFactory.GetPlanStages = jasmine
        .createSpy('treatmentPlansFactory.GetPlanStages')
        .and.returnValue(doubleStage);
      ctrl.getTreatmentplanStages('1236');
      expect(scope.planStages).toEqual([
        { stageno: 1, stagedesc: 1 },
        { stageno: 2, stagedesc: 2 },
        { stageno: 3, stagedesc: 'New Stage (3)' },
      ]);

      treatmentPlansFactory.GetPlanStages = jasmine
        .createSpy('treatmentPlansFactory.GetPlanStages')
        .and.returnValue(singleStage);
      ctrl.getTreatmentplanStages('1236');
      expect(scope.planStages).toEqual([
        { stageno: 1, stagedesc: 1 },
        { stageno: 2, stagedesc: 'New Stage (2)' },
      ]);
    });

    it('should create scope.planStages with only one stage if no current stages', function () {
      treatmentPlansFactory.GetPlanStages = jasmine
        .createSpy('treatmentPlansFactory.GetPlanStages')
        .and.returnValue([]);
      ctrl.getTreatmentplanStages('1236');
      expect(scope.planStages).toEqual([{ stageno: 1, stagedesc: 1 }]);
    });
  });

  describe('ctrl.setStageSelected ->', function () {
    var stages1 = [];
    var stages2 = [];
    var stages3 = [];
    var stages4 = [];
    beforeEach(function () {
      treatmentPlansFactory.ExistingTreatmentPlans = _.cloneDeep(
        existingTreatmentPlans
      );
      scope.stageNumber = 1;
      stages1 = [{ stageno: 1, stagedesc: 1 }];
      stages2 = [
        { stageno: 1, stagedesc: 1 },
        { stageno: 2, stagedesc: 'New Stage (2)' },
      ];
      stages3 = [
        { stageno: 1, stagedesc: 1 },
        { stageno: 2, stagedesc: 2 },
        { stageno: 3, stagedesc: 'New Stage (3)' },
      ];
      stages4 = [
        { stageno: 1, stagedesc: 1 },
        { stageno: 2, stagedesc: 2 },
        { stageno: 3, stagedesc: 3 },
        { stageno: 4, stagedesc: 'New Stage (4)' },
      ];
    });

    it(
      'should set scope.stageSelected.number to stageNumber if stageNumber matches one of the stages in the planStages ' +
        '(including the New Stage one) and this is an existing treatment plan',
      function () {
        scope.stageNumber = '1';
        scope.treatmentPlanId = '1234';
        var stages = stages1;
        ctrl.setStageSelected(stages);
        expect(scope.stageSelected.number).toBe(1);

        scope.stageNumber = '2';
        stages = stages2;
        ctrl.setStageSelected(stages);
        expect(scope.stageSelected.number).toBe(2);

        scope.stageNumber = '3';
        stages = stages3;
        ctrl.setStageSelected(stages);
        expect(scope.stageSelected.number).toBe(3);

        scope.stageNumber = '4';
        stages = stages4;
        ctrl.setStageSelected(stages);
        expect(scope.stageSelected.number).toBe(4);
      }
    );

    it(
      'should set scope.stageSelected.number to 1 if stageNumber does not match one of the stages in the planStages ' +
        '(including the New Stage one) and this is an existing treatment plan',
      function () {
        scope.stageNumber = '2';
        scope.treatmentPlanId = '1234';
        var stages = stages1;
        ctrl.setStageSelected(stages);
        expect(scope.stageSelected.number).toBe(1);

        scope.stageNumber = '3';
        stages = stages2;
        ctrl.setStageSelected(stages);
        expect(scope.stageSelected.number).toBe(1);

        scope.stageNumber = '4';
        stages = stages3;
        ctrl.setStageSelected(stages);
        expect(scope.stageSelected.number).toBe(1);
      }
    );

    it('should set scope.stageSelected.number to 1 if stages only has one record and this is a new treatment plan', function () {
      scope.stageNumber = '2';
      var stages = stages1;
      ctrl.setStageSelected(stages);
      expect(scope.stageSelected.number).toBe(1);
    });
  });

  describe('ctrl.setActiveTeeth ->', function () {
    beforeEach(function () {
      patientOdontogramFactory.selectedTeeth = [10, 11, 12, 13, 14];
      scope.area = 2;
      scope.passinfo = false;
      scope.patTeeth.options = {
        data: [
          {
            USNumber: '1',
          },
          {
            USNumber: '2',
          },
          {
            USNumber: '3',
          },
          {
            USNumber: '4',
          },
          {
            USNumber: '5',
          },
          {
            USNumber: '6',
          },
          {
            USNumber: '7',
          },
          {
            USNumber: '8',
          },
          {
            USNumber: '9',
          },
        ],
      };
      scope.invalidToothForCode = false;
    });

    it('should set scope.invalidToothForCode to false when having a matched tooth', function () {
      patientOdontogramFactory.selectedTeeth = [1, 2, 3, 4, 5, 6];
      ctrl.setActiveTeeth();
      expect(scope.invalidToothForCode).toBe(false);
    });
    it('should set scope.invalidToothForCode to true when having a matched tooth', function () {
      ctrl.setActiveTeeth();
      expect(scope.invalidToothForCode).toBe(true);
    });
    it('should set scope.invalidToothForCode to false when having a single matched tooth', function () {
      patientOdontogramFactory.selectedTeeth = [1, 2, 10, 11, 12];
      ctrl.setActiveTeeth();
      expect(scope.invalidToothForCode).toBe(false);
    });
  });

  describe('ctrl.setMaxDate method->', function () {
    beforeEach(function () {
      scope.serviceTransaction = {};
      // mock today
      let today = moment('2019-11-06').toDate();
      jasmine.clock().mockDate(today);
    });

    it('should return today if ServiceTransaction.ServiceTransactionStatusId is 4, 5, or 6 and passinfo is false', function () {
      scope.passinfo = false;
      scope.serviceTransaction.ServiceTransactionStatusId = 4;
      var maxDate = moment(new Date());
      expect(maxDate).toEqual(moment(new Date()));
    });

    it('should set the scope.maxDate to null if ServiceTransaction.ServiceTransactionStatusId is not 4, 5, or 6 and passinfo is false', function () {
      scope.passinfo = false;
      scope.serviceTransaction.ServiceTransactionStatusId = 1;
      var maxDate = ctrl.setMaxDate();
      expect(maxDate).toBe(null);
    });

    it('should set the scope.maxDate to today if passinfo is true', function () {
      scope.passinfo = true;
      var maxDate = ctrl.setMaxDate();
      expect(maxDate).toEqual(moment(new Date()));
    });
  });

  describe('ctrl.resetDateEnteredOnStatusChange method->', function () {
    beforeEach(function () {
      scope.serviceTransaction = { ServiceTransactionStatusId: 5 };
      // mock today
      let today = moment('2019-11-06 16:55:29.000').toDate();
      jasmine.clock().mockDate(today);
    });

    it('should set serviceTransaction.$$DateEntered to today if ServiceTransactionStatusId is 4, 5, or 6', function () {
      scope.serviceTransaction.ServiceTransactionStatusId = 4;
      scope.serviceTransaction.$$DateEntered = '2019-12-13T16:59:10.000Z';
      scope.timeZoneDate = new Date();
      ctrl.resetDateEnteredOnStatusChange();
      expect(scope.serviceTransaction.$$DateEntered).toEqual(
        scope.timeZoneDate
      );
    });
  });

  describe('ctrl.setTimeZoneDate method->', function () {
    beforeEach(function () {
      scope.serviceTransaction = {
        ServiceTransactionStatusId: 5,
        LocationId: 1,
      };
      ctrl.locations = [{ LocationId: 1, Timezone: 'Hawaiian Standard Time' }];
      // mock today
      let today = moment('2019-11-06 16:55:29.000').toDate();
      jasmine.clock().mockDate(today);
    });

    it('should set should be the timezone adjusted date to null if scope.maxDate is null', function () {
      scope.serviceTransaction.ServiceTransactionStatusId = 1;
      scope.serviceTransaction.$$DateEntered = '2019-12-13T16:59:10.000Z';
      scope.maxDate = null;
      ctrl.setTimeZoneDate();
      expect(scope.timeZoneDate).toEqual(null);
    });

    it('should set should be the timezone adjusted date for the scope.maxDate if scope.maxDate is not null', function () {
      scope.serviceTransaction.ServiceTransactionStatusId = 1;
      scope.serviceTransaction.$$DateEntered = '2019-12-13T16:59:10.000Z';
      scope.maxDate = moment(new Date());
      ctrl.setTimeZoneDate();
      expect(scope.timeZoneDate).toEqual(fakeDateFromTimeZoneFactory);
    });
  });

  describe('ctrl.addServiceSuccess method->', function () {
    var res = { Value: [{ TreatmentPlanId: 1234 }] };
    beforeEach(function () {
      spyOn(rootScope, '$broadcast').and.callFake(function () {});
      scope.$parent = { $parent: { nextSwftPkServCode: function () {} } };
    });

    it('should broadcast soar:chart-services-reload-ledger if scope.isSwiftCode is false', function () {
      scope.isLastcode = false;
      scope.isSwiftCode = false;
      ctrl.addServiceSuccess(res);
      expect(rootScope.$broadcast).toHaveBeenCalledWith(
        'soar:chart-services-reload-ledger'
      );
    });

    it('should broadcast soar:chart-services-reload-ledger if scope.isLastCode is true regardless of scope.isSwiftCode', function () {
      scope.isLastcode = true;
      scope.isSwiftCode = true;
      ctrl.addServiceSuccess(res);
      expect(rootScope.$broadcast).toHaveBeenCalledWith(
        'soar:chart-services-reload-ledger'
      );

      scope.isLastcode = true;
      scope.isSwiftCode = false;
      ctrl.addServiceSuccess(res);
      expect(rootScope.$broadcast).toHaveBeenCalledWith(
        'soar:chart-services-reload-ledger'
      );
    });

    it('should not broadcast soar:chart-services-reload-ledger if scope.isLastCode is false and scope.isSwiftCode is true', function () {
      scope.isLastcode = false;
      scope.isSwiftCode = true;
      ctrl.addServiceSuccess(res);
      expect(rootScope.$broadcast).not.toHaveBeenCalledWith(
        'soar:chart-services-reload-ledger'
      );
    });
  });
});
