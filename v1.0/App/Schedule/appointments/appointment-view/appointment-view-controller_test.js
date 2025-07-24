import { of } from 'rsjs';

describe('AppointmentViewController ->', function () {
  var ctrl, scope, window, timeout, uibModal, filter, q, resource, listHelper;
  var toastrFactory,
    patSecurityService,
    localize,
    boundObjectFactory,
    scheduleTextService;
  var patientServices,
    scheduleServices,
    scheduleAppointmentConflictCheck,
    modalFactory,
    saveStates;
  var staticData,
    $routeParams,
    resourceService,
    interval,
    appointmentService,
    apiDefinitions,
    surfaceHelper;
  var financialService,
    treatmentPlansFactory,
    patientPreventiveCareFactory,
    location;
  var rootScope,
    parse,
    patientLogic,
    userServices,
    timeZoneFactory,
    patientOdontogramFactory,
    locationService;
  var personFactory,
    patientValidationFactory,
    rolesFactory,
    patientAppointmentsByClassificationFactory,
    holidaysFactory;
  var scheduleAppointmentModalFactory2,
    providerRoomOccurrenceFactory,
    appointmentUtilities,
    roleNames,
    globalSearchFactory;
  var appointmentConflictFactory,
    patientServicesFactory,
    referenceDataService,
    practiceSettingsService,
    scheduleAppointmentModalService;
  var providerShowOnScheduleFactory,
    appointmentStorageService,
    scheduleDisplayPlannedServicesService,
    scheduleProvidersService;
  var roomsService,
    locationsService,
    appointmentStatusService,
    appointmentModalLinksService,
    appointmentTypesService;
  var appointmentTimeService,
    newScheduleAppointmentUtilitiesService,
    appointmentModalProvidersService,
    userSettingsDataService;
  var locationsDisplayService,
    schedulingApiService,
    appointmentViewLoadingService,
    appointmentViewDataLoadingService;
  var appointmentViewVisibleService,
    patientBenefitPlansFactory,
    locationServices,
    unscheduledAppointmentsService,
    tabLauncher;
  var appointmentViewValidationNewService,
    appointmentServiceTransactionsService,
    serviceEstimateCalculationService,
    featureFlagService,
    fuseFlag;
  var appointmentModalText = {
    examiningDentistPlaceHolder: 'examiningDentistPlaceHolder',
    defaultPlaceHolder: 'defaultPlaceHolder',
  };
  var mockAppointment, deferred, successResult, failure, appointment, res;
  var mockPlannedServicesResponse = [
    { PersonId: '1234', InsuranceOrder: 1 },
    { PersonId: '1234', InsuranceOrder: 2 },
    { PersonId: '1234', InsuranceOrder: 3 },
    { PersonId: '1234', InsuranceOrder: 4 },
  ];

  failure = { Error: 'error' };

  var mockUsers = [
    {
      UserId: 'ProviderGuid0',
      FirstName: 'Doug',
      LastName: 'Zero',
      ProfessionalDesignation: 'DDS',
      ProviderTypeId: 0,
      IsActive: false,
    },
    {
      UserId: 'ProviderGuid1',
      FirstName: 'Guy',
      LastName: 'Smiley',
      ProfessionalDesignation: 'DDS',
      ProviderTypeId: 0,
      IsActive: true,
    },
  ];

  var mockLocations = [
    {
      LocationId: 1,
      NameAbbreviation: 'Here',
      Timezone: 'Eastern Daylight Time',
    },
  ];

  var mockAppointmentTypes = [
    {
      AppointmentTypeId: 'ApptTypeGuid1',
      Name: 'Checkup',
      AppointmentTypeColor: 'rgba(100, 100, 100, 0.34902)',
      FontColor: 'rgb(0, 0, 0)',
    },
    {
      AppointmentTypeId: 'ApptTypeGuid2',
      Name: 'Root Canal',
      AppointmentTypeColor: 'rgba(200, 200, 200, 0.34902)',
      FontColor: 'rgb(0, 0, 0)',
    },
    {
      AppointmentTypeId: 'ApptTypeGuid3',
      Name: 'Flouride',
      AppointmentTypeColor: 'rgba(300, 300, 300, 0.34902)',
      FontColor: 'rgb(0, 0, 0)',
    },
  ];

  var mockRooms = [
    {
      RoomId: 'RoomGuid1',
      Name: 'RoomOne',
    },
    {
      RoomId: 'RoomGuid2',
      Name: 'RoomTwo',
    },
  ];

  var mockPracticeSettings = {
    DefaultTimeIncrement: 15,
  };

  patSecurityService = {
    IsAuthorizedByAbbreviation: function () {
      return true;
    },
  };

  beforeEach(
    module('Soar.Schedule', function ($provide) {
      var tomorrow = new Date();
      tomorrow.setHours(0);
      tomorrow.setMinutes(0);
      tomorrow.setSeconds(0);
      tomorrow.setMilliseconds(0);
      tomorrow.setDate(tomorrow.getDate() + 1);

      var dayAfterTomorrow = new Date(tomorrow.getTime());
      dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 1);

      mockAppointment = {
        Data: {
          AppointmentId: '123456789',
          StartTime: dayAfterTomorrow,
          EndTime: dayAfterTomorrow,
          PlannedServices: [],
          Location: { LocationId: 12 },
        },
      };

      var userLocation = '{"id": "101"}';
      sessionStorage.setItem('userLocation', userLocation);
    })
  );

  beforeEach(module('Soar.Common'));
  beforeEach(module('common.factories'));
  beforeEach(module('Soar.BusinessCenter'));

  beforeEach(
    module('Soar.Patient', function ($provide) {
      patientPreventiveCareFactory = {
        PreventiveCareServices: jasmine.createSpy().and.returnValue({
          then: jasmine.createSpy(),
        }),
        NextTrumpServiceDueDate: jasmine.createSpy().and.returnValue({
          then: jasmine.createSpy(),
        }),
      };
      $provide.value(
        'PatientPreventiveCareFactory',
        patientPreventiveCareFactory
      );

      var locationsService = {
        locations: jasmine.createSpy().and.returnValue({
          then: jasmine.createSpy(),
        }),
        getRoomsFromLocations: jasmine.createSpy().and.returnValue({
          then: jasmine.createSpy(),
        }),
      };
      $provide.value('NewLocationsService', locationsService);

      var locationsDisplayService = {
        setLocationDisplayText: jasmine.createSpy(),
      };
      $provide.value('LocationsDisplayService', locationsDisplayService);

      patientServices = {
        ServiceTransactions: {
          calculateDiscountAndTaxAndInsuranceEstimate: jasmine
            .createSpy()
            .and.returnValue({
              $promise: { then: (success, failure) => success(successResult) },
            }),
        },
      };
      $provide.value('PatientServices', patientServices);

      appointmentModalProvidersService = {
        modalProviders: [],
      };
      $provide.value(
        'AppointmentModalProvidersService',
        appointmentModalProvidersService
      );

      staticData = {
        TeethDefinitions: jasmine
          .createSpy()
          .and.returnValue({ then: function () {} }),
        CdtCodeGroups: jasmine
          .createSpy()
          .and.returnValue({ then: function () {} }),
      };
      $provide.value('StaticData', staticData);

      providerShowOnScheduleFactory = {
        getSavedShowOnProviderExceptions: jasmine.createSpy(),
      };
      $provide.value(
        'ProviderShowOnScheduleFactory',
        providerShowOnScheduleFactory
      );

      serviceEstimateCalculationService = {
        validateInsuranceOrder: jasmine.createSpy().and.callFake(function () {
          return mockPlannedServicesResponse;
        }),
        onCalculateDiscountAndTaxAndInsuranceEstimateSuccess: jasmine
          .createSpy()
          .and.callFake(function () {
            return mockPlannedServicesResponse;
          }),
      };
      $provide.value(
        'ServiceEstimateCalculationService',
        serviceEstimateCalculationService
        );

      featureFlagService = {
          getOnce$: jasmine.createSpy().and.returnValue({ subscribe: jasmine.createSpy() })
      };
      $provide.value('FeatureFlagService', featureFlagService);

      fuseFlag = {};
      $provide.value('FuseFlag', fuseFlag);

      appointmentViewLoadingService = {
        loadedLocations: [],
        loadedProvidersByLocation: [],
        processAppointmentForViewDisplay: jasmine
          .createSpy()
          .and.returnValue(mockAppointment),
        currentAppointmentId: 666,
        currentAppointment: { Data: { Location: {} }, LocationId: 12 },
      };
      $provide.value(
        'AppointmentViewLoadingService',
        appointmentViewLoadingService
      );

      appointmentTypesService = {
        appointmentTypes: [],
        findByAppointmentTypeId: jasmine.createSpy(),
      };
      $provide.value('NewAppointmentTypesService', appointmentTypesService);

      roomsService = {
        rooms: [],
      };
      $provide.value('NewRoomsService', roomsService);

      scheduleProvidersService = {
        providers: [],
      };
      $provide.value('ScheduleProvidersService', scheduleProvidersService);

      appointment = appointmentViewLoadingService.currentAppointment;

      scheduleTextService = {
        getAppointmentModalText: jasmine
          .createSpy()
          .and.returnValue(appointmentModalText),
        getAppointmentStatusesTranslated: jasmine.createSpy(),
      };
      $provide.value('ScheduleTextService', scheduleTextService);

      appointmentStatusService = {
        getStatuses: jasmine.createSpy(),
      };
      $provide.value('AppointmentStatusService', appointmentStatusService);

      timeZoneFactory = {
        ConvertDateTZString: jasmine.createSpy(),
        GetTimeZoneAbbr: jasmine.createSpy(),
        ConvertDateTZ: jasmine.createSpy(),
      };
      $provide.value('TimeZoneFactory', timeZoneFactory);

      appointmentServiceTransactionsService = {
        setInsuranceOrderOnServiceTransaction: jasmine.createSpy(),
      };
      $provide.value(
        'AppointmentServiceTransactionsService',
        appointmentServiceTransactionsService
      );

      referenceDataService = {
        entityNames: {
          appointmentTypes: 'apptTypes',
          rooms: 'rooms',
          users: 'users',
          locations: 'locations',
        },
        registerForLocationSpecificDataChanged: jasmine.createSpy(),
        unregisterForLocationSpecificDataChanged: jasmine.createSpy(),
        get: function (refType) {
          if (refType === 'apptTypes') {
            return mockAppointmentTypes;
          } else if (refType === 'rooms') {
            return mockRooms;
          } else if (refType === 'users') {
            return mockUsers;
          } else if (refType === 'locations') {
            return mockLocations;
          } else {
            return {};
          }
        },
      };
      $provide.value('referenceDataService', referenceDataService);

      practiceSettingsService = {
        get: jasmine.createSpy().and.returnValue(of(mockPracticeSettings))
      };
      $provide.value('practiceSettingsService', practiceSettingsService);

      saveStates = {
        Add: 'Add',
        Update: 'Update',
        Delete: 'Delete',
        None: 'None',
      };
    })
  );

  beforeEach(inject(function (
    $rootScope,
    $controller,
    $injector,
    $q,
    $location,
    $filter,
    $interval
  ) {
    scope = $rootScope.$new();
    scope.data = {};
    q = $q;
    deferred = q.defer();
    filter = $filter;
    rootScope = $rootScope;
    location = $location;
    interval = $interval;
    scope.appointment = { Data: { Location: { LocationId: 12 } } };

    window = {
      location: {
        href: jasmine.createSpy(),
      },
    };

    //mock for listHelper service
    listHelper = {
      findItemByFieldValue: jasmine
        .createSpy('listHelper.findItemByFieldValue')
        .and.returnValue(null),
      findIndexByFieldValue: jasmine
        .createSpy('listHelper.findIndexByFieldValue')
        .and.returnValue(0),
    };

    //mock for toastrFactory
    toastrFactory = {
      success: jasmine.createSpy(),
      error: jasmine.createSpy(),
    };

    //mock of modalFactory
    modalFactory = {
      CancelModal: jasmine.createSpy().and.returnValue({
        then: jasmine.createSpy(),
      }),
      Modal: jasmine.createSpy().and.returnValue({
        result: { then: jasmine.createSpy() },
      }),
    };

    localize = {
      getLocalizedString: jasmine.createSpy().and.returnValue('some value'),
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

    ctrl = $controller('AppointmentViewController', {
      $scope: scope,
      $window: window,
      $timeout: timeout,
      $uibModal: uibModal,
      $filter: filter,
      $q: q,
      $resource: resource,
      ListHelper: listHelper,
      toastrFactory: toastrFactory,
      localize: localize,
      BoundObjectFactory: boundObjectFactory,
      ScheduleServices: scheduleServices,
      ScheduleAppointmentConflictCheck: scheduleAppointmentConflictCheck,
      ModalFactory: modalFactory,
      SaveStates: saveStates,
      $routeParams: $routeParams,
      ResourceService: resourceService,
      $interval: interval,
      AppointmentService: appointmentService,
      ApiDefinitions: apiDefinitions,
      SurfaceHelper: surfaceHelper,
      FinancialService: financialService,
      TreatmentPlansFactory: treatmentPlansFactory,
      PatientPreventiveCareFactory: patientPreventiveCareFactory,
      $location: location,
      $rootScope: rootScope,
      $parse: parse,
      PatientLogic: patientLogic,
      UserServices: userServices,
      PatientOdontogramFactory: patientOdontogramFactory,
      LocationService: locationService,
      PersonFactory: personFactory,
      PatientValidationFactory: patientValidationFactory,
      RolesFactory: rolesFactory,
      PatientAppointmentsByClassificationFactory:
        patientAppointmentsByClassificationFactory,
      HolidaysFactory: holidaysFactory,
      ScheduleAppointmentModalFactory: scheduleAppointmentModalFactory2,
      ProviderRoomOccurrenceFactory: providerRoomOccurrenceFactory,
      RoleNames: roleNames,
      GlobalSearchFactory: globalSearchFactory,
      AppointmentConflictFactory: appointmentConflictFactory,
      PatientServicesFactory: patientServicesFactory,
      ReferenceDataService: referenceDataService,
      ScheduleAppointmentModalService: scheduleAppointmentModalService,
      AppointmentStorageService: appointmentStorageService,
      ScheduleDisplayPlannedServicesService:
        scheduleDisplayPlannedServicesService,
      AppointmentStatusService: appointmentStatusService,
      AppointmentModalLinksService: appointmentModalLinksService,
      NewAppointmentTypesService: appointmentTypesService,
      AppointmentTimeService: appointmentTimeService,
      NewScheduleAppointmentUtilitiesService:
        newScheduleAppointmentUtilitiesService,
      UserSettingsDataService: userSettingsDataService,
      SchedulingApiService: schedulingApiService,
      AppointmentViewLoadingService: appointmentViewLoadingService,
      AppointmentViewDataLoadingService: appointmentViewDataLoadingService,
      AppointmentViewVisibleService: appointmentViewVisibleService,
      PatientBenefitPlansFactory: patientBenefitPlansFactory,
      LocationServices: locationServices,
      UnscheduledAppointmentsService: unscheduledAppointmentsService,
      TabLauncher: tabLauncher,
      AppointmentViewValidationNewService: appointmentViewValidationNewService,
      AppointmentServiceTransactionsService:
        appointmentServiceTransactionsService,
      PracticeSettingsService: practiceSettingsService,
    });
  }));

  describe('initial values ->', function () {
    it('AppointmentViewController : should check if controller exists', function () {
      expect(ctrl).not.toBeNull();
      expect(ctrl).not.toBeUndefined();
    });
  });

  describe('scope.calculateEstimatedAmount method ->', function () {
    var successResult = { Value: [] };
    var initialPlannedServices = [];
    var validatedPlannedServices = [];
    beforeEach(function () {
      validatedPlannedServices = [
        { PersonId: '1234', ServiceTransactionId: 1, InsuranceOrder: 1 },
        { PersonId: '1234', ServiceTransactionId: 2, InsuranceOrder: 2 },
        { PersonId: '1234', ServiceTransactionId: 3, InsuranceOrder: 3 },
        { PersonId: '1234', ServiceTransactionId: 4, InsuranceOrder: 4 },
      ];

      successResult.Value = [
        {
          PersonId: '1234',
          ServiceTransactionId: 1,
          InsuranceOrder: 1,
          Discount: null,
          Amount: 125,
          Tax: null,
          InsuranceEstimates: [{}],
          TotalEstInsurance: 80,
          TotalAdjEstimate: null,
        },
        {
          PersonId: '1234',
          ServiceTransactionId: 2,
          InsuranceOrder: 2,
          Discount: null,
          Amount: 125,
          Tax: null,
          InsuranceEstimates: [{}],
          TotalEstInsurance: 80,
          TotalAdjEstimate: null,
        },
        {
          PersonId: '1234',
          ServiceTransactionId: 3,
          InsuranceOrder: 3,
          Discount: null,
          Amount: 125,
          Tax: null,
          InsuranceEstimates: [{}],
          TotalEstInsurance: 80,
          TotalAdjEstimate: null,
        },
        {
          PersonId: '1234',
          ServiceTransactionId: 4,
          InsuranceOrder: 4,
          Discount: null,
          Amount: 125,
          Tax: null,
          InsuranceEstimates: [{}],
          TotalEstInsurance: 80,
          TotalAdjEstimate: null,
        },
      ];

      initialPlannedServices = [
        {
          PersonId: '1234',
          ServiceTransactionId: 2,
          InsuranceOrder: null,
          InsuranceEstimates: [{}],
        },
        {
          PersonId: '1234',
          ServiceTransactionId: 1,
          InsuranceOrder: null,
          InsuranceEstimates: [{}],
        },
        {
          PersonId: '1234',
          ServiceTransactionId: 3,
          InsuranceOrder: null,
          InsuranceEstimates: [{}],
        },
        {
          PersonId: '1234',
          ServiceTransactionId: 4,
          InsuranceOrder: null,
          InsuranceEstimates: [{}],
        },
      ];

      scope.plannedServices = _.cloneDeep(initialPlannedServices);

      ctrl.originalAppointmentData.PlannedServices = _.cloneDeep(
        initialPlannedServices
      );

      scope.appointment.Data.PlannedServices = _.cloneDeep(
        initialPlannedServices
      );
      scope.appointment.Data.PersonId = '1234';

      patientServices.ServiceTransactions.calculateDiscountAndTaxAndInsuranceEstimate =
        jasmine.createSpy().and.returnValue({
          $promise: { then: (success, failure) => success(successResult) },
        });

      (serviceEstimateCalculationService.onCalculateDiscountAndTaxAndInsuranceEstimateSuccess =
        jasmine.createSpy().and.callFake(function () {
          return successResult.Value;
        })),
        (serviceEstimateCalculationService.validateInsuranceOrder = jasmine
          .createSpy()
          .and.callFake(function () {
            return validatedPlannedServices;
          })),
        spyOn(rootScope, '$broadcast');
    });

    it('should copy scope.plannedServices to ctrl.originalAppointmentData.PlannedServices if initializing ', function () {
      scope.calculateEstimatedAmount(true);
      expect(ctrl.originalAppointmentData.PlannedServices).toEqual(
        scope.plannedServices
      );
    });

    it('should copy scope.plannedServices to scope.appointment.Data.PlannedServices if initializing ', function () {
      scope.calculateEstimatedAmount(true);
      expect(scope.appointment.Data.PlannedServices).toEqual(
        scope.plannedServices
      );
    });

    it('should call serviceEstimateCalculationService.validateInsuranceOrder', function () {
      scope.calculateEstimatedAmount(false);
      expect(
        serviceEstimateCalculationService.validateInsuranceOrder
      ).toHaveBeenCalledWith(initialPlannedServices);
    });

    it('should call patientServices.ServiceTransactions.calculateDiscountAndTaxAndInsuranceEstimate', function () {
      scope.calculateEstimatedAmount(false);
      expect(
        patientServices.ServiceTransactions
          .calculateDiscountAndTaxAndInsuranceEstimate
      ).toHaveBeenCalledWith(validatedPlannedServices);
    });
    it('should call serviceEstimateCalculationService.onCalculateDiscountAndTaxAndInsuranceEstimateSuccess with scope.plannedServices and res.Value on success', function () {
      res = { Value: [] };
      scope.calculateEstimatedAmount(false);
      expect(
        serviceEstimateCalculationService.onCalculateDiscountAndTaxAndInsuranceEstimateSuccess
      ).toHaveBeenCalledWith(
        validatedPlannedServices,
        successResult.Value,
        false
      );
    });

    it('should broadcast recalculationCompleted on success', function () {
      res = { Value: [] };
      scope.calculateEstimatedAmount(false);
      expect(rootScope.$broadcast).toHaveBeenCalledWith(
        'recalculationCompleted'
      );
    });

    it('should call toastr.error on error', function () {
      patientServices.ServiceTransactions.calculateDiscountAndTaxAndInsuranceEstimate =
        jasmine.createSpy().and.returnValue({
          $promise: { then: (success, failure) => failure(failure) },
        });
      scope.calculateEstimatedAmount(false);
      expect(toastrFactory.error).toHaveBeenCalled();
    });

    it('should reset ctrl.originalAppointmentData.PlannedServices if isInitializing is true ', function () {
      var servicesHaveChanges = false;
      scope.calculateEstimatedAmount(true);
      var plannedServicesExclusions = [
        'InsuranceEstimate',
        'IsEligibleForDiscount',
        'applyDiscount',
        'TaxableServiceTypeId',
        'isDiscounted',
        'IsActive',
        'InactivationDate',
        '$$isProposed',
        '$$hashKey',
        'InsuranceEstimates.InsuranceEstimate',
        'InsuranceEstimates.IsEligibleForDiscount',
        'InsuranceEstimates.applyDiscount',
        'InsuranceEstimates.TaxableServiceTypeId',
        'InsuranceEstimates.isDiscounted',
        'InsuranceEstimates.ObjectState',
        'originalProvider',
        'InsuranceEstimates',
      ];
      servicesHaveChanges = ctrl.hasChanges(
        scope.plannedServices,
        ctrl.originalAppointmentData.PlannedServices,
        plannedServicesExclusions
      );
      expect(servicesHaveChanges).toBe(false);
    });

    it('should not reset ctrl.originalAppointmentData.PlannedServices if isInitializing is false ', function () {
      var servicesHaveChanges = false;
      scope.calculateEstimatedAmount(false);
      var plannedServicesExclusions = [
        'InsuranceEstimate',
        'IsEligibleForDiscount',
        'applyDiscount',
        'TaxableServiceTypeId',
        'isDiscounted',
        'IsActive',
        'InactivationDate',
        '$$isProposed',
        '$$hashKey',
        'InsuranceEstimates.InsuranceEstimate',
        'InsuranceEstimates.IsEligibleForDiscount',
        'InsuranceEstimates.applyDiscount',
        'InsuranceEstimates.TaxableServiceTypeId',
        'InsuranceEstimates.isDiscounted',
        'InsuranceEstimates.ObjectState',
        'originalProvider',
        'InsuranceEstimates',
      ];
      servicesHaveChanges = ctrl.hasChanges(
        scope.plannedServices,
        ctrl.originalAppointmentData.PlannedServices,
        plannedServicesExclusions
      );
      expect(servicesHaveChanges).toBe(true);
    });
  });
});
