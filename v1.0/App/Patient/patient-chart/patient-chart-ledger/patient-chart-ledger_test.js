import { of } from 'rsjs';

describe('PatientChartLedgerController ->', function () {
  var toastrFactory, $uibModal, scope, staticData;
  var modalInstance,
    modalFactory,
    userServices,
    patientServices,
    referenceDataService,
    featureFlagService,
    commonServices,
    patientAppointmentsFactory,
    mockModalDataFactory;
  var ctrl,
    usersFactory,
    userFactoryDeferred,
    chartColors,
    q,
    deferred,
    rootScope;
  var location,
    userSettingsDataService,
    appointmentViewDataLoadingService,
    appointmentViewVisibleService;
  var multiServiceEditService, chartColorsService;
  var locationService;
  var patCacheFactory;
  var cache = {};

  var chartLedgerRecordIds = [
    { RecordId: 'e1b25c6a-07f0-4628-b633-937753c3l1hh' },
    { RecordId: 'e1b25c6a-07f0-4628-b633-937753c3l1gg' },
    { RecordId: 'e1b25c6a-07f0-4628-b633-937753c3l1ff' },
    { RecordId: 'e1b25c6a-07f0-4628-b633-937753c3l1ee' },
    { RecordId: 'e1b25c6a-07f0-4628-b633-937753c3l1dd' },
  ];

  //#region mocks

  var conditionsMockList = [
    {
      ConditionId: '1234',
      Description: 'First Condition',
      AffectedAreaId: 1,
    },
    {
      ConditionId: '2345',
      Description: 'Second Condition',
      AffectedAreaId: 2,
    },
    {
      ConditionId: '3456',
      Description: 'Third Condition',
      AffectedAreaId: 3,
    },
  ];

  var conditionsMockResult = {
    Value: conditionsMockList,
  };

  var serviceTransactionStatusesMock = [
    { Id: 1, Name: 'Proposed' },
    { Id: 2, Name: 'Rejected' },
  ];

  var serviceTransactionsStatusesMockResponse = {
    Value: serviceTransactionStatusesMock,
  };

  var serviceCodesMockResponse = {
    Value: [
      {
        ServiceCodeId: '5b23fd7b-3b96-422c-98c4-00a6f17dfe41',
        Description: 'test',
        Code: 8678,
        ServiceTypeDescription: 'FakeServiceTypeDescription',
        CdtCodeName: 'FakeCdtCodeName',
        AffectedAreaId: '1',
        Fee: 500.0,
      },
    ],
  };

  var personIdMock = 'b3eb6f7f-7b4a-4be5-b8ac-d24cccdd42b9';

  var serviceTransactionMock = {
    PersonId: personIdMock,
    CreatedByUserId: '63ee50c9-b373-4998-8db3-08097a34621d',
    ServiceCodeId: serviceCodesMockResponse.Value[0].ServiceCodeId,
    ServiceTransactionId: chartLedgerRecordIds[0].RecordId,
    DateEntered: new Date(),
    Note: null,
    ProviderId: null,
    Surfaces: [],
    Tooth: null,
    Fee: 200,
    StatusId: 1,
    AppointmentId: null,
  };

  var providersMockResponse = {
    Value: [
      {
        UserId: 10,
        FirstName: 'Bill',
        LastName: 'Murray',
      },
      {
        UserId: 11,
        FirstName: 'Dan',
        LastName: 'Belushi',
      },
    ],
  };

  var providersMock = providersMockResponse.Value;

  var chartLedgerServicesMock = [
    {
      PatientId: personIdMock,
      RecordId: chartLedgerRecordIds[0].RecordId,
      RecordType: 'ServiceTransaction',
      ServiceCodeId: serviceCodesMockResponse.Value[0].ServiceCodeId,
      Description: null,
      CreationDate: new Date(),
      StatusId: '1',
      StatusName: null,
      AppointmentId: null,
      ProviderId: providersMock[0].UserId,
      ProviderName: null,
      Surfaces: [],
      Tooth: null,
      Fee: 200.0,
      ConditionId: null,
      ConditionIsActive: null,
      Note: null,
      AffectedAreaId: null,
    },
    {
      PatientId: personIdMock,
      RecordId: chartLedgerRecordIds[1].RecordId,
      RecordType: 'ServiceTransaction',
      ServiceCodeId: serviceCodesMockResponse.Value[0].ServiceCodeId,
      Description: null,
      CreationDate: new Date(),
      StatusId: '1',
      StatusName: null,
      AppointmentId: null,
      ProviderId: providersMock[1].UserId,
      ProviderName: null,
      Surfaces: [],
      Tooth: null,
      Fee: 200.0,
      ConditionId: null,
      ConditionIsActive: null,
      Note: null,
      AffectedAreaId: null,
    },
    {
      PatientId: personIdMock,
      RecordId: chartLedgerRecordIds[2].RecordId,
      RecordType: 'Condition',
      ServiceCodeId: null,
      Description: null,
      CreationDate: new Date(),
      StatusId: null,
      StatusName: null,
      AppointmentId: null,
      ProviderId: providersMock[1].UserId,
      ProviderName: null,
      Surfaces: [],
      Tooth: null,
      Fee: null,
      ConditionId: conditionsMockList[0].ConditionId,
      ConditionIsActive: null,
      Note: null,
      AffectedAreaId: null,
    },
    {
      PatientId: personIdMock,
      RecordId: chartLedgerRecordIds[3].RecordId,
      RecordType: 'Condition',
      ServiceCodeId: null,
      Description: null,
      CreationDate: new Date(),
      StatusId: null,
      StatusName: null,
      AppointmentId: null,
      ProviderId: '12',
      ProviderName: null,
      Surfaces: [],
      Tooth: null,
      Fee: null,
      ConditionId: conditionsMockList[0].ConditionId,
      ConditionIsActive: null,
      Note: null,
      AffectedAreaId: null,
    },
    {
      PatientId: personIdMock,
      RecordId: chartLedgerRecordIds[4].RecordId,
      RecordType: 'Watch',
      ServiceCodeId: null,
      Description: null,
      CreationDate: new Date(),
      StatusId: null,
      StatusName: null,
      AppointmentId: null,
      ProviderId: '12',
      ProviderName: null,
      Surfaces: [],
      Tooth: '8',
      Fee: null,
      ConditionId: null,
      ConditionIsActive: null,
      Note: null,
      AffectedAreaId: null,
    },
  ];

  var chartLedgerServicesMockResult = {
    Value: chartLedgerServicesMock,
  };

  var mockSurfaces = ['S', 'U'];
  var mockTooth = '66';
  var patientConditionMock = {
    PersonId: personIdMock,
    PatientConditionId: chartLedgerRecordIds[2].RecordId,
    ConditionDate: new Date(),
    ProviderId: providersMock[0],
    Surfaces: mockSurfaces,
    Tooth: mockTooth,
    IsActive: true,
    ConditionId: conditionsMockList[0].ConditionId,
  };

  //#endregion

  //#region spies for services...

  beforeEach(module('Soar.Common'));
  beforeEach(module('common.factories'));
  beforeEach(module('Soar.Patient'));

  // create spies for services
  beforeEach(
    module('Soar.Patient', function ($provide) {
      patCacheFactory = {
        ClearCache: jasmine.createSpy().and.callFake(function () {}),
        GetCache: jasmine.createSpy().and.callFake(function () {
          return cache;
        }),
      };
      $provide.value('PatCacheFactory', patCacheFactory);

      mockModalDataFactory = {};
      $provide.value('ModalDataFactory', mockModalDataFactory);

      patientAppointmentsFactory = {
        AppointmentDataWithoutDetails: jasmine.createSpy().and.returnValue({
          then: jasmine.createSpy().and.returnValue({ Value: 1 }),
        }),
      };
      $provide.value('PatientAppointmentsFactory', patientAppointmentsFactory);

      patientServices = {
        PatientDuplicates: {
          get: jasmine.createSpy().and.callFake(function () {
            deferred = q.defer();
            deferred.$promise = deferred.promise;
            deferred.resolve({ Value: [] });
            return deferred;
          }),
        },
        ServiceTransactions: {
          get: jasmine.createSpy().and.returnValue(serviceTransactionMock),
          create: jasmine.createSpy().and.returnValue(serviceTransactionMock),
          delete: jasmine.createSpy(),
          batchDelete: jasmine.createSpy().and.callFake(function () {
            deferred = q.defer();
            deferred.$promise = deferred.promise;
            deferred.resolve({ Value: [] });
            return deferred;
          }),
        },
        PatientWatch: {
          delete: jasmine.createSpy().and.returnValue({}),
        },
        TreatmentPlans: {
            getTreatmentPlansWithServicesByPersonId: jasmine.createSpy().and.callFake(function () {
                deferred = q.defer();
                deferred.$promise = deferred.promise;
                deferred.resolve({ Value: [] });
                return deferred;
            }),
        },
        ChartLedger: {
          get: jasmine
            .createSpy()
            .and.returnValue(chartLedgerServicesMockResult),
        },
        Conditions: {
          delete: jasmine.createSpy().and.returnValue({}),
          batchDelete: jasmine.createSpy().and.callFake(function () {
            deferred = q.defer();
            deferred.$promise = deferred.promise;
            deferred.resolve({ Value: [] });
            return deferred;
          }),
        },
        Claim: {
          getClaimsByServiceTransaction: jasmine
            .createSpy()
            .and.returnValue({}),
        },
        Predetermination: {
          Close: jasmine.createSpy().and.returnValue({}),
          getClaimsByServiceTransactionIds: jasmine
            .createSpy()
            .and.callFake(function () {
              deferred = q.defer();
              deferred.$promise = deferred.promise;
              deferred.resolve({ Value: [] });
              return deferred;
            }),
          closeBatch: jasmine.createSpy().and.callFake(function () {
            deferred = q.defer();
            deferred.$promise = deferred.promise;
            deferred.resolve({ Value: [] });
            return deferred;
          }),
        },
      };
      $provide.value('PatientServices', patientServices);

      locationService = {
        getCurrentLocation: jasmine.createSpy().and.returnValue({ id: '1234' }),
        getActiveLocations: jasmine.createSpy().and.returnValue([{ id: 12 }]),
      };
      $provide.value('locationService', locationService);

      userServices = {
        Users: {
          get: jasmine.createSpy().and.returnValue(providersMockResponse),
        },
      };
      $provide.value('UserServices', userServices);

      referenceDataService = {
        getData: jasmine.createSpy(),
        entityNames: {
          conditions: 'conditions',
        },
      };
      $provide.value('referenceDataService', referenceDataService);

      toastrFactory = {};
      toastrFactory.error = jasmine.createSpy();
      toastrFactory.success = jasmine.createSpy();
      $provide.value('toastrFactory', toastrFactory);

      staticData = {
        ServiceTransactionStatuses: jasmine
          .createSpy()
          .and.returnValue({ then: function () {} }),
      };
      $provide.value('StaticData', staticData);

      modalFactory = {
        CancelModal: jasmine.createSpy().and.returnValue({
          then: jasmine.createSpy(),
        }),
        DeleteModal: jasmine.createSpy().and.returnValue({
          then: jasmine.createSpy(),
        }),
        LoadingModal: jasmine.createSpy().and.returnValue({
          then: jasmine.createSpy(),
        }),
        Modal: jasmine.createSpy().and.returnValue({
          result: { then: jasmine.createSpy() },
        }),
        ConfirmModal: jasmine.createSpy().and.returnValue({
          then: jasmine.createSpy().and.callFake(function () {}),
        }),
      };
      $provide.value('ModalFactory', modalFactory);

      chartColors = {};
      $provide.value('ChartColors', chartColors);

      userSettingsDataService = {
        isNewAppointmentAreaEnabled: jasmine.createSpy().and.returnValue(false),
      };
      $provide.value('userSettingsDataService', userSettingsDataService);

      appointmentViewVisibleService = {
        changeAppointmentViewVisible: jasmine.createSpy(),
      };
      $provide.value(
        'AppointmentViewVisibleService',
        appointmentViewVisibleService
      );

      appointmentViewDataLoadingService = {
        getViewData: jasmine
          .createSpy('appointmentViewDataLoadingService.getViewData')
          .and.callFake(function () {
            return {
              then: function () {},
            };
          }),
      };
      $provide.value(
        'AppointmentViewDataLoadingService',
        appointmentViewDataLoadingService
      );

      multiServiceEditService = {
        open: jasmine
          .createSpy('multiServiceEditService.open')
          .and.returnValue({ events: { subscribe: jasmine.createSpy() } }),
      };
      $provide.value('multiServiceEditService', multiServiceEditService);

      chartColorsService = {
        getChartColor: jasmine
          .createSpy()
          .and.returnValue('getChartColorResult'),
      };
      $provide.value('ChartColorsService', chartColorsService);

      featureFlagService = {
        getOnce$: jasmine.createSpy().and.returnValue(of(false)),
      }
      $provide.value('featureFlagService', featureFlagService);
    })
  );

  //#endregion

  // create controller and scope
  beforeEach(inject(function (
    $rootScope,
    $controller,
    _$uibModal_,
    $q,
    $location
  ) {
    q = $q;
    location = $location;
    $uibModal = _$uibModal_;
    spyOn($uibModal, 'open').and.callThrough();

    referenceDataService.getData.and.returnValue(
      $q.resolve(conditionsMockResult)
    );

    modalInstance = {
      close: jasmine
        .createSpy('modalInstance.close')
        .and.returnValue(chartLedgerServicesMock),
      dismiss: jasmine.createSpy('modalInstance.dismiss'),
      result: {
        then: jasmine.createSpy('modalInstance.result.then'),
      },
    };

    scope = $rootScope.$new();
    rootScope = $rootScope;
    scope.serviceTransactionStatuses = serviceTransactionStatusesMock;
    scope.chartLedgerServices = [];
    scope.selection = {};
    scope.patientInfo = { IsActive: true };

    usersFactory = {
      Users: jasmine.createSpy('usersFactory.Users').and.callFake(function () {
        userFactoryDeferred = $q.defer();
        userFactoryDeferred.resolve(1);
        return {
          result: userFactoryDeferred.promise,
          then: function () {},
        };
      }),
      UserName: jasmine.createSpy().and.returnValue(providersMock[0].UserName),
      UserNameUnescaped: jasmine.createSpy().and.returnValue(providersMock[0].UserName),
    };

    patientAppointmentsFactory = {
      AppointmentDataWithDetails: jasmine
        .createSpy('patientAppointmentsFactory.AppointmentDataWithDetails')
        .and.callFake(function () {
          return {
            then: function () {},
          };
        }),
    };

    ctrl = $controller('PatientChartLedgerController', {
      $scope: scope,
      patSecurityService: _authPatSecurityService_,
      personId: personIdMock,
      modalFactory: modalFactory,
      $uibModalInstance: modalInstance,
      UserServices: userServices,
      CommonServices: commonServices,
      PatientServices: patientServices,
      UsersFactory: usersFactory,
      PatientAppointmentsFactory: patientAppointmentsFactory,
      $location: location,
      ChartColorsService: chartColorsService,
    });
  }));

  describe('initial setup -> ', function () {
    it('check if controller exists', function () {
      expect(ctrl).not.toBeNull();
    });

    it('should set scope properties', function () {
      expect(scope.conditions).toEqual([]);
      expect(scope.providers).toEqual([]);
      expect(scope.serviceCodes).toEqual([]);
      expect(scope.serviceTransactionStatuses).toEqual([]);

      expect(scope.selectedServiceTransaction).toBe(null);

      expect(scope.loadingProviders).toBe(false);
      expect(scope.loadingConditions).toBe(false);
      expect(scope.loadingServiceCodes).toBe(false);

      expect(scope.orderBy).toEqual({ field: 'CreationDate', asc: false });
      expect(ctrl.fieldsToFilterOn).toEqual([
        'CreationDate',
        'ProviderName',
        'Description',
        'Code',
        'Tooth',
        'StatusName',
        'Fee',
        'AppointmentId',
        'AppointmentDate',
      ]);
      expect(scope.filterBy).toBe('');

      expect(scope.hasCreateAccess).toBe(true);
      expect(scope.hasDeleteAccess).toBe(true);
      expect(scope.hasEditAccess).toBe(true);

      expect(scope.initialized).toBe(false);
      expect(scope.watchToView).toBe(null);
      expect(scope.modalIsOpen).toBe(false);

      expect(scope.selectedWatch).toBe(null);
    });
  });

  describe('changeSortingForGrid function -> ', function () {
    it('should initialize sort order to asc ', function () {
      expect(scope.orderBy.asc).toBe(false);
    });

    it('should initialize sort order field to CreationDate ', function () {
      expect(scope.orderBy.field).toBe('CreationDate');
    });

    it('should change sort order to desc if sort column selected again ', function () {
      expect(scope.orderBy.asc).toBe(false);

      scope.changeSortingForGrid('Impacts');
      expect(scope.orderBy.asc).toBe(true);

      scope.changeSortingForGrid('Impacts');
      expect(scope.orderBy.asc).toBe(false);
    });

    it('should set sort order to asc when sort column changes ', function () {
      scope.changeSortingForGrid('Impacts');
      expect(scope.orderBy.asc).toBe(true);

      scope.changeSortingForGrid('Impacts');
      expect(scope.orderBy.asc).toBe(false);

      scope.changeSortingForGrid('Description');
      expect(scope.orderBy.asc).toBe(true);
    });
  });

  describe('editAppointmentFromModal method ->', function () {
    var appointmentData = {
      AppointmentId: '58b4e1cf-56b0-4dcf-b6db-33a8342a6fa9',
      AppointmentTypeId: '00000000-0000-0000-0000-000000000000',
      DataTag: 'AAAAAAMJ0lE=',
      LocationId: 536,
      PersonId: 'a1bb2790-7ca7-4f31-b5de-e7ed36ad0ebd',
      UserModified: 'b94308d3-f824-4d33-b06b-fa90e5fde217',
    };

    it('should call existing appointment from chart ledger', function () {
      scope.editAppointmentFromModal('a1bb2790-7ca7-4f31-b5de-e7ed36ad0ebd');

      let appt = {
        AppointmentId: 'a1bb2790-7ca7-4f31-b5de-e7ed36ad0ebd',
      };

      expect(
        appointmentViewDataLoadingService.getViewData
      ).toHaveBeenCalledWith(
        appt,
        false,
        'appointment-view:update-appointment'
      );
    });
  });
  describe('servicesFilter function -> ', function () {
    var item = {
      CreationDate: '03/12/2015',
      ProviderId: '45',
      ServiceCodeId: '1313',
      Description: 'fix teeth',
      Tooth: '23',
      Surface: 'front',
      StatusId: '322',
      AppointmentId: '989',
    };

    it('should return true if Description contains filterBy string', function () {
      scope.filterBy = 'fi';
      var returnValue = scope.servicesFilter(item);
      expect(returnValue).toBe(true);
    });

    it('should return true if multiple filterable fields contain filterBy string', function () {
      scope.filterBy = '3';
      var returnValue = scope.servicesFilter(item);
      expect(returnValue).toBe(true);
    });

    it('should return false if no filterable fields contain filterBy string', function () {
      scope.filterBy = 'z';
      var returnValue = scope.servicesFilter(item);
      expect(returnValue).toBe(false);
    });

    it('should return false if a non-filterable field contains filterBy string', function () {
      scope.filterBy = 'front';
      var returnValue = scope.servicesFilter(item);
      expect(returnValue).toBe(false);
    });
  });

  describe('getProviders function -> ', function () {
    it('should call get users api', function () {
      scope.getProviders();
      expect(scope.loadingProviders).toBe(true);
      expect(usersFactory.Users).toHaveBeenCalled();
    });
  });

  describe('addProviderNameToList function -> ', function () {
    it('should add provider name to each item in $scope.chartLedgerServices', function () {
      scope.chartLedgerServices = [];
      scope.chartLedgerServices = angular.copy(chartLedgerServicesMock);
      scope.providers = providersMockResponse.Value;
      ctrl.addProviderNameToList();
      //expect(scope.chartLedgerServices[0].ProviderName).toEqual('Bill Murray');
    });
  });

  describe('addServiceCodesToList function -> ', function () {
    it('should add ServiceCode info to each item in $scope.chartLedgerServices', function () {
      scope.serviceCodes = serviceCodesMockResponse.Value;
      scope.chartLedgerServices = [];
      scope.chartLedgerServices = chartLedgerServicesMockResult.Value;
      scope.addServiceCodesToList();
      expect(scope.chartLedgerServices[1].ServiceCodeId).toEqual(
        '5b23fd7b-3b96-422c-98c4-00a6f17dfe41'
      );
      expect(scope.chartLedgerServices[1].AffectedAreaId).toBe('1');
    });
  });

  describe('ctrl.addServiceCodesToItem function -> ', function () {
    it('should add ServiceCode info to passed in chartLedgerService', function () {
      scope.serviceCodes = serviceCodesMockResponse.Value;
      scope.chartLedgerServices = [];
      scope.chartLedgerServices = chartLedgerServicesMockResult.Value;
      ctrl.addServiceCodesToItem(scope.chartLedgerServices[1]);

      expect(scope.chartLedgerServices[1].ServiceCodeId).toEqual(
        '5b23fd7b-3b96-422c-98c4-00a6f17dfe41'
      );
      expect(scope.chartLedgerServices[1].AffectedAreaId).toEqual('1');
    });
  });

  describe('getServiceTransactionStatusName function -> ', function () {
    it('should return name if status exists in $scope.serviceTransactionStatuses', function () {
      scope.serviceTransactionStatuses =
        serviceTransactionsStatusesMockResponse.Value;
      expect(ctrl.getServiceTransactionStatusName(1)).toEqual('Proposed');
    });

    it('should return empty string if status does not exists in $scope.serviceTransactionStatuses', function () {
      scope.serviceTransactionStatuses =
        serviceTransactionsStatusesMockResponse.Value;
      expect(ctrl.getServiceTransactionStatusName(4)).toEqual('');
    });
  });

  describe('ctrl.addServiceTransactionStatus function -> ', function () {
    it('should add planned service status to each item in chartLedgerServices', function () {
      scope.serviceTransactionStatuses =
        serviceTransactionsStatusesMockResponse.Value;
      scope.chartLedgerServices = chartLedgerServicesMock;
      ctrl.addServiceTransactionStatus(scope.chartLedgerServices);
      expect(scope.chartLedgerServices[0].StatusName).toEqual('Proposed');
    });
  });

  describe('getConditions function -> ', function () {
    it('should call get conditions api', function () {
      scope.getConditions();
      scope.$apply();
      expect(scope.loadingConditions).toBe(false);
      expect(referenceDataService.getData).toHaveBeenCalledWith(
        referenceDataService.entityNames.conditions
      );
    });
  });

  describe('ctrl.addConditionInfoToItem function -> ', function () {
    it('should not change values if ConditionId not in list', function () {
      scope.conditions = conditionsMockResult.Value;
      var param = {
        ConditionId: 'junk',
        Description: 'testD',
        AffectedAreaId: 99,
      };
      ctrl.addConditionInfoToItem(param);
      expect(param.Description).toBe('testD');
      expect(param.AffectedAreaId).toBe(99);
    });

    it('should change values if ConditionId in list', function () {
      scope.conditions = conditionsMockResult.Value;
      var param = {
        ConditionId: scope.conditions[0].ConditionId,
        Description: 'testD',
        AffectedAreaId: 99,
      };
      ctrl.addConditionInfoToItem(param);
      expect(param.Description).toBe(scope.conditions[0].Description);
      expect(param.AffectedAreaId).toBe(scope.conditions[0].AffectedAreaId);
    });

    it('should return empty string if paramter does not have ConditionId property', function () {
      expect(ctrl.addConditionInfoToItem({})).toEqual('');
    });
  });

  describe('addConditionDescriptionToList function -> ', function () {
    it('should add condition description to each item in $scope.chartLedgerServices', function () {
      scope.chartLedgerServices = [];
      scope.chartLedgerServices = chartLedgerServicesMockResult.Value;
      scope.conditions = conditionsMockResult.Value;
      ctrl.addConditionDescriptionToList();

      // get the chartLedgerServices that are patient conditions
      for (var i = 0; i < scope.chartLedgerServices.length; i++) {
        if (scope.chartLedgerServices[i].RecordType == 'Condition') {
          expect(scope.chartLedgerServices[i].Description).toEqual(
            conditionsMockList[0].Description
          );
        }
      }
    });
  });

  describe('loadServiceTransactionToChartLedgerService function -> ', function () {
    it('should load a planned service record to a chartLedgerService object', function () {
      var chartLedgerService = ctrl.loadServiceTransactionToChartLedgerService(
        serviceTransactionMock
      );
      expect(chartLedgerService.RecordId).toEqual(
        serviceTransactionMock.ServiceTransactionId
      );
      expect(chartLedgerService.RecordType).toEqual('ServiceTransaction');
      expect(chartLedgerService.PatientId).toEqual(
        serviceTransactionMock.PersonId
      );
    });
  });

  describe('loadConditionToChartLedgerService function -> ', function () {
    it('should load a patient condition record to a chartLedgerService object', function () {
      var chartLedgerService = ctrl.loadConditionToChartLedgerService(
        patientConditionMock
      );
      expect(chartLedgerService.RecordId).toEqual(
        patientConditionMock.PatientConditionId
      );
      expect(chartLedgerService.RecordType).toEqual('Condition');
      expect(chartLedgerService.PatientId).toEqual(
        patientConditionMock.PatientId
      );
    });
  });

  describe('createServiceTransactions function -> ', function () {
    it('should initialize newServiceTransactions', function () {
      scope.createServiceTransactions();
      expect(scope.serviceTransactions.length).toEqual(0);
    });

    it('should open modal open', function () {
      scope.createServiceTransactions();
      expect(modalFactory.Modal).toHaveBeenCalled();
    });

    it('should set modalOpen to true', function () {
      scope.createServiceTransactions();
      expect(scope.modalIsOpen).toBe(true);
    });
  });

  describe('editService function - > ', function () {
    it('should call getServiceTransaction if RecordType is ServiceTransaction', function () {
      spyOn(scope, 'getServiceTransaction');
      var chartLedgerService = chartLedgerServicesMock[0];
      expect(chartLedgerService.RecordType).toEqual('ServiceTransaction');
      scope.editService(chartLedgerService);
      // TODO - uncomment when this is re-activated
      // expect(scope.getServiceTransaction).toHaveBeenCalledWith(chartLedgerService.RecordId);
    });

    it('should call viewPatientWatch if RecordType is Watch', function () {
      spyOn(scope, 'viewPatientWatch');
      var chartLedgerService = chartLedgerServicesMock[4];
      expect(chartLedgerService.RecordType).toEqual('Watch');
      scope.editService(chartLedgerService);
      // TODO - uncomment when this is re-activated
      // expect(scope.viewPatientWatch).toHaveBeenCalledWith(chartLedgerService.RecordId, false);
    });
  });

  describe('deleteService function - > ', function () {
    it('should set conditions vars and call displayConfirmationModal', function () {
      spyOn(ctrl, 'displayConfirmationModal');
      var chartLedgerService = chartLedgerServicesMock[2];
      expect(chartLedgerService.RecordType).toEqual('Condition');
      scope.deleteService(chartLedgerService);
      expect(ctrl.delText).toEqual('condition');
      expect(ctrl.delPropertyToDisplay).toEqual('Description');
      expect(ctrl.delParam).toEqual('ConditionId');
      expect(ctrl.delService).toEqual('Conditions');
      expect(ctrl.displayConfirmationModal).toHaveBeenCalled();
    });
  });

  describe('displayConfirmationModal function - > ', function () {
    it('should open delete confirmation modal', function () {
      var chartLedgerService = chartLedgerServicesMock[2];
      scope.deleteService(chartLedgerService);
      ctrl.displayConfirmationModal();
      expect(modalFactory.DeleteModal).toHaveBeenCalled();
    });
  });

  // note, this test should be fixed
  describe('confirmDelete function - > ', function () {
    it('should call service', function () {
      var chartLedgerService = chartLedgerServicesMock[2];
      scope.deleteService(chartLedgerService);
      ctrl.confirmDelete();
      expect(patientServices[ctrl.delService].delete).toHaveBeenCalled();
    });
  });

  describe('ctrl.closePredeterminations function - > ', function () {
    var predeterminations = [];
    beforeEach(function () {
      predeterminations.push({ ClaimId: '1234' });
      predeterminations.push({ ClaimId: '12345' });
      predeterminations.push({ ClaimId: '123456' });
    });
    it('should call patientServices.Predetermination.Close for each predetermination', function () {
      ctrl.closePredeterminations(predeterminations);
      _.forEach(predeterminations, function (predetermination) {
        var closePredeterminationObject = {
          ClaimId: predetermination.ClaimId,
          Note: null,
          NoInsurancePayment: true,
          RecreateClaim: false,
          CloseClaimAdjustment: null,
          UpdateServiceTransactions: false,
          disableCancel: true,
        };
        expect(patientServices.Predetermination.Close).toHaveBeenCalledWith(
          closePredeterminationObject
        );
      });
    });
  });

  describe('cancelDelete function - > ', function () {
    it('should reset itemSelectedForDeletion', function () {
      var chartLedgerService = chartLedgerServicesMock[2];
      scope.$parent.getPatientChartLedgerServices = jasmine.createSpy();
      scope.deleteService(chartLedgerService);
      ctrl.cancelDelete();
      expect(ctrl.itemSelectedForDeletion).toBeNull();
    });
  });

  describe('deleteSuccess function - > ', function () {
    it('should reset itemSelectedForDeletion, show toastr success, and remove item from list', function () {
      scope.chartLedgerServices = angular.copy(chartLedgerServicesMock);
      scope.$parent.getPatientChartLedgerServices = jasmine.createSpy();
      expect(scope.chartLedgerServices.length).toBe(5);
      var chartLedgerService = chartLedgerServicesMock[2];
      scope.deleteService(chartLedgerService);
      ctrl.deleteSuccess();
      expect(ctrl.itemSelectedForDeletion).toBeNull();
      expect(toastrFactory.success).toHaveBeenCalled();
      expect(scope.chartLedgerServices.length).toBe(4);
    });
  });

  describe('deleteFailure function - > ', function () {
    it('should reset itemSelectedForDeletion and show toastr failure', function () {
      var chartLedgerService = chartLedgerServicesMock[2];
      scope.deleteService(chartLedgerService);
      ctrl.deleteFailure();
      expect(ctrl.itemSelectedForDeletion).toBeNull();
      expect(toastrFactory.error).toHaveBeenCalled();
    });
  });

  describe('serviceTransactionCreated function -> ', function () {
    it('should set modalIsOpen to false', function () {
      scope.serviceTransactionCreated();
      expect(scope.modalIsOpen).toBe(false);
    });

    it('should add serviceTransaction to chartLedgerServices', function () {
      var newServiceTransaction = [
        {
          PersonId: personIdMock,
          CreatedByUserId: '63ee50c9-b373-4998-8db3-08097a34621d',
          ServiceCodeId: serviceCodesMockResponse.Value[0].ServiceCodeId,
          ServiceTransactionId: 'new112',
          DateEntered: new Date(),
          Surfaces: [],
        },
      ];

      scope.chartLedgerServices = angular.copy(chartLedgerServicesMock);
      expect(scope.chartLedgerServices.length).toBe(5);
      scope.serviceTransactionCreated(newServiceTransaction);
      expect(scope.chartLedgerServices.length).toBe(6);
      expect(scope.chartLedgerServices[5].RecordId).toBe(
        newServiceTransaction[0].ServiceTransactionId
      );
    });
  });

  describe('serviceTransactionsUpdated function -> ', function () {
    it('should set modalIsOpen to false', function () {
      scope.serviceTransactionCreated();
      expect(scope.modalIsOpen).toBe(false);
    });

    it('should update planned service to chartLedgerServices', function () {
      scope.chartLedgerServices = angular.copy(chartLedgerServicesMock);
      expect(scope.chartLedgerServices.length).toBe(5);

      var updatedServiceTransaction = [
        {
          PatientId: scope.chartLedgerServices[1].PersonId,
          CreatedByUserId: scope.chartLedgerServices[1].CreatedByUserId,
          ServiceCodeId: scope.chartLedgerServices[1].ServiceCodeId,
          ServiceTransactionId: scope.chartLedgerServices[1].RecordId,
          Fee: 250,
          RecordType: 'ServiceTransaction',
          StatusId: 1,
          AppointmentId: null,
          ProviderId: providersMock[0],
          Surfaces: [],
          Tooth: null,
        },
      ];

      scope.$parent.getPatientChartLedgerServices = jasmine.createSpy();

      scope.serviceTransactionsUpdated(updatedServiceTransaction);
      expect(scope.$parent.getPatientChartLedgerServices).toHaveBeenCalledWith(
        true
      );
      expect(scope.chartLedgerServices.length).toEqual(5);
      for (var i = 0; i < scope.chartLedgerServices.length; i++) {
        if (
          scope.chartLedgerServices[i].RecordId ==
          updatedServiceTransaction.ServiceTransactionId
        ) {
          expect(scope.chartLedgerServices[i].Fee).toBe(250);
        }
      }
    });
  });

  describe('deleteServiceTransaction function -> ', function () {
    it('should set selectedServiceTransaction to serviceTransaction parameter', function () {
      var serviceToDelete = chartLedgerServicesMock[0];
      scope.deleteServiceTransaction(serviceToDelete);
      expect(scope.selectedServiceTransaction).toEqual(serviceToDelete);
    });

    it('should call getClaimsByServiceTransaction and set ctrl.claimsPromise', function () {
      var serviceToDelete = chartLedgerServicesMock[0];
      var getClaimsResult = 'test';
      patientServices.Claim.getClaimsByServiceTransaction = jasmine
        .createSpy()
        .and.returnValue(getClaimsResult);

      scope.deleteServiceTransaction(serviceToDelete);

      expect(
        patientServices.Claim.getClaimsByServiceTransaction
      ).toHaveBeenCalledWith(
        jasmine.objectContaining({
          serviceTransactionId: serviceToDelete.RecordId,
          ClaimType: 2,
        })
      );
      expect(ctrl.claimsPromise).toBe(getClaimsResult);
    });

    it('should call modalFactory.DeleteModal with correct parameters when status is not 6', function () {
      var serviceToDelete = _.cloneDeep(chartLedgerServicesMock[0]);
      serviceToDelete.StatusId = 5;
      serviceToDelete.Description = 'description';

      scope.deleteServiceTransaction(serviceToDelete);

      expect(modalFactory.DeleteModal).toHaveBeenCalledWith(
        'Planned Service',
        serviceToDelete.Description,
        true,
        jasmine.stringMatching('This service will be')
      );
    });

    it('should call modalFactory.DeleteModal with correct parameters when status is 6', function () {
      var serviceToDelete = _.cloneDeep(chartLedgerServicesMock[0]);
      serviceToDelete.StatusId = 6;
      serviceToDelete.Description = 'description';

      scope.deleteServiceTransaction(serviceToDelete);

      expect(modalFactory.DeleteModal).toHaveBeenCalledWith(
        'Planned Service',
        serviceToDelete.Description,
        true,
        ''
      );
    });
  });

  describe('ctrl.deleteService function ->', function () {
    it('should call patientServices.ServiceTransaction.deleteFromLedger with correct parameters', function () {
      scope.personId = '1234';
      scope.selectedServiceTransaction = {
        RecordId: '5555',
        RecordType: 'ServiceTransaction',
        PatientId: '1234',
      };
      patientServices.ServiceTransactions.deleteFromLedger = jasmine.createSpy();

      ctrl.deleteService();

      expect(
        patientServices.ServiceTransactions.deleteFromLedger
      ).toHaveBeenCalledWith(
        jasmine.objectContaining({
          Id: scope.personId,
          servicetransactionid: scope.selectedServiceTransaction.RecordId,
        }),
        scope.serviceTransactionDeleteSuccess,
        scope.serviceTransactionDeleteFailed
      );
    });
  });

  describe('serviceTransactionDeleteSuccess function -> ', function () {
    beforeEach(function () {
      spyOn(rootScope, '$broadcast').and.callThrough();
    });
    it('should remove selectedServiceTransaction from list', function () {
      scope.$parent.getPatientChartLedgerServices = jasmine.createSpy();
      scope.chartLedgerServices = angular.copy(chartLedgerServicesMock);
      scope.selectedServiceTransaction = scope.chartLedgerServices[0];
      expect(scope.chartLedgerServices.length).toBe(5);
      scope.serviceTransactionDeleteSuccess();
      expect(scope.chartLedgerServices[0].IsDeleted).toBe(true);
    });

    it('should set selectedServiceTransaction to null', function () {
      scope.$parent.getPatientChartLedgerServices = jasmine.createSpy();
      scope.chartLedgerServices = angular.copy(chartLedgerServicesMock);
      scope.selectedServiceTransaction = scope.chartLedgerServices[0];
      expect(scope.chartLedgerServices.length).toBe(5);
      scope.serviceTransactionDeleteSuccess();
      expect(scope.selectedServiceTransaction).toBe(null);
    });

    it('should clear the cacheFactory for treatment plans then broadcast', function () {
      scope.$parent.getPatientChartLedgerServices = jasmine.createSpy();
      scope.chartLedgerServices = angular.copy(chartLedgerServicesMock);
      scope.selectedServiceTransaction = scope.chartLedgerServices[0];
      scope.serviceTransactionDeleteSuccess();
      expect(patCacheFactory.GetCache).toHaveBeenCalledWith(
        'PatientTreatmentPlans'
      );
      expect(patCacheFactory.ClearCache).toHaveBeenCalledWith(cache);
      expect(rootScope.$broadcast).toHaveBeenCalledWith(
        'soar:tx-plan-services-changed',
        null,
        true
      );
    });

    it('should call toastrFactory success', function () {
      scope.$parent.getPatientChartLedgerServices = jasmine.createSpy();
      scope.chartLedgerServices = angular.copy(chartLedgerServicesMock);
      scope.selectedServiceTransaction = scope.chartLedgerServices[0];
      scope.serviceTransactionDeleteSuccess();
      expect(toastrFactory.success).toHaveBeenCalled();
    });
  });

  describe('serviceTransactionDeleteFailed function -> ', function () {
    it('should set selectedServiceTransaction to null', function () {
      scope.chartLedgerServices = angular.copy(chartLedgerServicesMock);
      scope.selectedServiceTransaction = scope.chartLedgerServices[0];

      expect(scope.selectedServiceTransaction).toEqual(
        scope.chartLedgerServices[0]
      );
      scope.serviceTransactionDeleteFailed();
      expect(scope.selectedServiceTransaction).toBe(null);
    });
    it('should call toastrFactory error', function () {
      scope.serviceTransactionDeleteFailed();
      expect(toastrFactory.error).toHaveBeenCalled();
    });
  });

  describe('openConditionCrudModal function -> ', function () {
    it('should open loading modal open', function () {
      scope.openConditionCrudModal();
      expect(modalFactory.LoadingModal).toHaveBeenCalled();
    });
  });

  describe('patientConditionCreated function -> ', function () {
    it('should set modalIsOpen to false', function () {
      scope.patientConditionCreated();
      expect(scope.modalIsOpen).toBe(false);
    });

    it('should add new condition to chartLedgerServices', function () {
      scope.$parent.getPatientChartLedgerServices = function () {
        return true;
      };
      spyOn(scope.$parent, 'getPatientChartLedgerServices');

      scope.chartLedgerServices = angular.copy(chartLedgerServicesMock);
      scope.selection = { type: 'tooth', tooth: '8' };
      var newPatientCondition = {
        PatientConditionId: 'ee12',
        PatientId: personIdMock,
        ProviderId: providersMock[1].UserId,
        ConditionId: conditionsMockList[0].ConditionId,
        ConditionDate: new Date(),
        Surface: null,
        Tooth: null,
        IsActive: true,
      };
      scope.patientConditionCreated(newPatientCondition);
      expect(scope.chartLedgerServices[0].PatientId).toEqual(
        newPatientCondition.PatientId
      );
      expect(scope.$parent.getPatientChartLedgerServices).toHaveBeenCalled();
    });
  });

  describe(' getPatientWatchList function -> ', function () {
    it('should filter chartLedgerServices for list with RecordType of Watch', function () {
      scope.chartLedgerServices = angular.copy(chartLedgerServicesMock);
      ctrl.getPatientWatchList();
      expect(scope.patientWatches[0].RecordType).toEqual('Watch');
    });
  });

  describe(' viewPatientWatch function -> ', function () {
    it('should set modalIsOpen to true', function () {
      scope.viewPatientWatch();
      expect(scope.modalIsOpen).toBe(true);
    });

    it('should call getPatientWatchList', function () {
      spyOn(ctrl, 'getPatientWatchList');
      scope.viewPatientWatch();
      expect(ctrl.getPatientWatchList).toHaveBeenCalled();
    });

    it('should open modal open', function () {
      scope.selection = { type: 'tooth', tooth: '8' };
      scope.viewPatientWatch('anything');
      expect(modalFactory.Modal).toHaveBeenCalled();
    });
  });

  describe('watch watchToView function -> ', function () {
    it('should call viewPatientWatch if watchToView is not null', function () {
      scope.watchToView = null;
      spyOn(scope, 'viewPatientWatch');
      scope.watchToView = 'anything';
      scope.$digest();
      expect(scope.viewPatientWatch).toHaveBeenCalledWith(
        scope.watchToView,
        true
      );
    });

    it('should not call viewPatientWatch if watchToView is null', function () {
      scope.watchToView = null;
      spyOn(scope, 'viewPatientWatch');
      scope.$digest();
      expect(scope.viewPatientWatch).not.toHaveBeenCalled();
    });
  });


  describe('on soar:chart-services-retrieved broadcast function ->', function () {
    it('should call getServiceCodes if initialized is false', function () {
      scope.initialized = false;
      spyOn(scope, 'getServiceCodes');
      scope.chartLedgerServices = [];
      scope.conditions = [];
      scope.$apply();
      spyOn(ctrl, 'addConditionInfoToItem');
      scope.chartLedgerServices = angular.copy(chartLedgerServicesMock);

      scope.$apply();
      expect(scope.getServiceCodes).toHaveBeenCalled();
    });

    it('should call getProviders if initialized is false', function () {
      scope.initialized = false;
      spyOn(scope, 'getProviders');
      scope.chartLedgerServices = [];
      scope.$apply();
      scope.chartLedgerServices = angular.copy(chartLedgerServicesMock);
      spyOn(ctrl, 'addConditionInfoToItem');
      scope.$apply();
      expect(scope.getProviders).toHaveBeenCalled();
    });

    it('should call getServiceTransactionStatuses if initialized is false', function () {
      scope.initialized = false;
      spyOn(scope, 'getServiceTransactionStatuses');
      scope.$broadcast('soar:chart-services-retrieved');
    });

    it('should call getConditions if initialized is false', function () {
      scope.initialized = false;
      spyOn(scope, 'getConditions');
      scope.chartLedgerServices = [];
      scope.$apply();
      scope.chartLedgerServices = angular.copy(chartLedgerServicesMock);
      scope.$apply();
      scope.$broadcast('soar:chart-services-retrieved');
      expect(scope.getConditions).toHaveBeenCalled();
    });

    it('should not call functions if initialized is true', function () {
      scope.initialized = true;
      scope.selection = { type: 'tooth', tooth: '8' };
      spyOn(scope, 'getServiceCodes');
      spyOn(scope, 'getProviders');
      spyOn(scope, 'getServiceTransactionStatuses');
      spyOn(scope, 'getConditions');
      scope.$broadcast('soar:chart-services-retrieved');
      expect(scope.getServiceCodes).not.toHaveBeenCalled();
      expect(scope.getProviders).not.toHaveBeenCalled();
      expect(scope.getServiceTransactionStatuses).not.toHaveBeenCalled();
      expect(scope.getConditions).not.toHaveBeenCalled();
      expect(scope.initialized).toBe(true);
    });
  });

  describe('on soar:chart-ledger-services broadcast function ->', function () {
    it('should call methods on broadcast', function () {
      scope.chartLedgerServices = false;

      ctrl.addServiceTransactionStatus = jasmine.createSpy();
      ctrl.addConditionDescriptionToList = jasmine.createSpy();
      scope.getProviders = jasmine.createSpy();

      scope.$broadcast('soar:chart-ledger-services', true);

      expect(scope.chartLedgerServices).toBe(true);
      expect(ctrl.addServiceTransactionStatus).toHaveBeenCalled();
      expect(ctrl.addConditionDescriptionToList).toHaveBeenCalled();
      expect(scope.getProviders).toHaveBeenCalled();
    });
  });

  describe(' createPatientWatch function -> ', function () {
    it('should call getPatientWatchList', function () {
      spyOn(ctrl, 'getPatientWatchList');
      scope.createPatientWatch();
      expect(ctrl.getPatientWatchList).toHaveBeenCalled();
    });

    it('should open modal open', function () {
      scope.selection = { type: 'tooth', tooth: '8' };
      scope.createPatientWatch();
      expect(modalFactory.Modal).toHaveBeenCalled();
    });

    it('should set modalIsOpen to true', function () {
      scope.createPatientWatch();
      expect(scope.modalIsOpen).toBe(true);
    });
  });

  /*$scope.patientWatchClosed=function(patientWatch) {
            $scope.modalIsOpen = false;
            if (patientWatch) {
                var chartLedgerService = ctrl.loadPatientWatchToChartLedgerService(patientWatch);
                chartLedgerService.ProviderName = ctrl.getProviderName(patientWatch.ProviderId);
                $scope.chartLedgerServices.splice(listHelper.findIndexByFieldValue($scope.chartLedgerServices, "RecordId", chartLedgerService.RecordId), 1);
                $scope.chartLedgerServices.push(chartLedgerService);
            };
        }*/
  describe('patientWatchClosed function -> ', function () {
    it('should set modalIsOpen to false', function () {
      var watch = chartLedgerServicesMock[4];
      scope.patientWatchClosed(watch);
      expect(scope.modalIsOpen).toBe(false);
    });

    it('should add the updated watch to the list', function () {
      scope.chartLedgerServices = angular.copy(chartLedgerServicesMock);
      var watch = scope.chartLedgerServices[4];
      expect(watch.Tooth).toBe('8');
      watch.Tooth = '9';
      scope.patientWatchClosed(watch);
      for (var i = 0; i < scope.chartLedgerServices.length; i++) {
        if (scope.chartLedgerServices[i].RecordId == watch.RecordId) {
          expect(scope.chartLedgerServices[0].Tooth).toBe('9');
        }
      }
    });
  });

  describe('deleteWatch function -> ', function () {
    it('should set selectedWatch to watch parameter', function () {
      scope.chartLedgerServices = angular.copy(chartLedgerServicesMock);
      var watch = scope.chartLedgerServices[4];
      scope.deleteWatch(watch);
      expect(scope.selectedWatch).toEqual(watch);
    });

    it('should call DeleteModal', function () {
      scope.chartLedgerServices = angular.copy(chartLedgerServicesMock);
      var watch = scope.chartLedgerServices[4];
      scope.deleteWatch(watch);
      expect(modalFactory.DeleteModal).toHaveBeenCalled();
    });
  });

  describe('confirmWatchDelete function -> ', function () {
    it('should call patientServices.PatientWatch.delete', function () {
      scope.chartLedgerServices = angular.copy(chartLedgerServicesMock);
      scope.selectedWatch = scope.chartLedgerServices[4];
      scope.confirmWatchDelete();
      expect(patientServices.PatientWatch.delete).toHaveBeenCalled();
    });
  });

  describe('patientWatchDeleteSuccess function -> ', function () {
    it('should remove watch from chartLedgerServices list', function () {
      scope.chartLedgerServices = angular.copy(chartLedgerServicesMock);
      scope.selectedWatch = scope.chartLedgerServices[4];
      var recordIdToDelete = scope.selectedWatch.RecordId;
      ctrl.patientWatchDeleteSuccess();
      for (var i = 0; i < scope.chartLedgerServices.length; i++) {
        expect(scope.chartLedgerServices[i].RecordId).not.toEqual(
          recordIdToDelete
        );
      }
    });

    it('should set selectedWatch to null ', function () {
      scope.chartLedgerServices = angular.copy(chartLedgerServicesMock);
      scope.selectedWatch = scope.chartLedgerServices[4];
      ctrl.patientWatchDeleteSuccess();
      expect(scope.selectedWatch).toEqual(null);
    });

    it('should ', function () {
      scope.chartLedgerServices = angular.copy(chartLedgerServicesMock);
      scope.selectedWatch = scope.chartLedgerServices[4];
      ctrl.patientWatchDeleteSuccess();
      expect(toastrFactory.success).toHaveBeenCalled();
    });
  });

  describe('patientWatchDeleteFailed function -> ', function () {
    it('should call toastrFactory', function () {
      ctrl.patientWatchDeleteFailed();
      expect(toastrFactory.error).toHaveBeenCalled();
    });

    it('should set selectedWatch to null ', function () {
      scope.chartLedgerServices = angular.copy(chartLedgerServicesMock);
      scope.selectedWatch = scope.chartLedgerServices[4];
      ctrl.patientWatchDeleteSuccess();
      expect(scope.selectedWatch).toEqual(null);
    });
  });

  describe('ctrl.setAllowEdit function -> ', function () {
    beforeEach(function () {
      scope.patientInfo.IsActive = true;
      ctrl.currentLocation = { id: 12 };
      scope.chartLedgerServices = _.cloneDeep(chartLedgerServicesMock);
      scope.personId = '1234';
    });

    it('should set cls.setAllowEdit to false if patient.IsActive is false', function () {
      scope.chartLedgerServices[0].PatientId = '1234';
      scope.patientInfo.IsActive = false;
      scope.chartLedgerServices[0].StatusId = 1;
      scope.chartLedgerServices[0].LocationId = 12;
      scope.chartLedgerServices[0].$AllowEdit = true;
      ctrl.setAllowEdit();
      expect(scope.chartLedgerServices[0].$AllowEdit).toBe(false);
      expect(scope.chartLedgerServices[0].EditButtonTooltip).toBe(
        'Cannot edit service transaction for an inactive patient.'
      );
    });

    it('should set cls.$AllowEdit to false if service is for a duplicate patient', function () {
      scope.chartLedgerServices[0].PatientId = '1235';
      scope.chartLedgerServices[0].StatusId = 1;
      scope.chartLedgerServices[0].LocationId = 12;
      scope.chartLedgerServices[0].$AllowEdit = true;
      ctrl.setAllowEdit();
      expect(scope.chartLedgerServices[0].$AllowEdit).toBe(false);
    });

    it(
      'should set cls.$AllowEdit to true if serviceTransaction.StatusId does not equal 4 or 5' +
        'and one of users locations equals serviceTransaction.LocationId',
      function () {
        scope.chartLedgerServices[0].PatientId = scope.personId;
        scope.chartLedgerServices[0].StatusId = 1;
        scope.chartLedgerServices[0].LocationId = 12;
        scope.chartLedgerServices[0].$AllowEdit = true;
        ctrl.setAllowEdit();
        expect(scope.chartLedgerServices[0].$AllowEdit).toBe(true);
      }
    );

    it('should set cls.$AllowEdit to false if serviceTransaction.StatusId equals 4 (Completed)', function () {
      scope.chartLedgerServices[0].PatientId = scope.personId;
      scope.chartLedgerServices[0].StatusId = 4;
      scope.chartLedgerServices[0].LocationId = 12;
      scope.chartLedgerServices[0].$AllowEdit = true;
      ctrl.setAllowEdit();
      expect(scope.chartLedgerServices[0].$AllowEdit).toBe(false);
      expect(scope.chartLedgerServices[0].EditButtonTooltip).toBe(
        'Cannot edit a service transaction with a {0} status.'
      );
    });
  });

  describe('ctrl.setAllowDelete function -> ', function () {
    beforeEach(function () {
      scope.personId = '1234';
      scope.patientInfo.IsActive = true;
      ctrl.currentLocation = { id: 12 };
      scope.chartLedgerServices = _.cloneDeep(chartLedgerServicesMock);
    });

    it(
      'should set cls.$AllowDelete to true if serviceTransaction.StatusId does not equal 4 or 5' +
        'and currentLocation.id equals serviceTransaction.LocationId',
      function () {
        scope.chartLedgerServices[0].PatientId = scope.personId;
        scope.chartLedgerServices[0].StatusId = 1;
        scope.chartLedgerServices[0].LocationId = 12;
        scope.chartLedgerServices[0].$AllowDelete = true;
        ctrl.setAllowDelete();
        expect(scope.chartLedgerServices[0].$AllowDelete).toBe(true);
      }
    );

    it('should set cls.$AllowDelete to false if serviceTransaction.PatientId is not the same as scope.personId (duplicatePatient)', function () {
      scope.chartLedgerServices[0].PatientId = scope.personId;
      scope.chartLedgerServices[0].StatusId = 1;
      scope.chartLedgerServices[0].LocationId = 12;
      scope.chartLedgerServices[0].$AllowDelete = false;
      ctrl.setAllowDelete();
      expect(scope.chartLedgerServices[0].$AllowDelete).toBe(true);
    });

    it('should set cls.$AllowDelete to false if serviceTransaction.StatusId equals 4 (Completed)', function () {
      scope.chartLedgerServices[0].StatusId = 4;
      scope.chartLedgerServices[0].LocationId = 12;
      scope.chartLedgerServices[0].$AllowDelete = true;
      ctrl.setAllowDelete();
      expect(scope.chartLedgerServices[0].$AllowDelete).toBe(false);
      expect(scope.chartLedgerServices[0].DeleteButtonTooltip).toBe(
        'Cannot delete a service transaction with a {0} status.'
      );
    });

    it('should set cls.$AllowDelete to false if serviceTransaction.StatusId equals 5 (Pending)', function () {
      scope.chartLedgerServices[0].StatusId = 5;
      scope.chartLedgerServices[0].LocationId = 12;
      scope.chartLedgerServices[0].$AllowDelete = true;
      ctrl.setAllowDelete();
      expect(scope.chartLedgerServices[0].$AllowDelete).toBe(false);
      expect(scope.chartLedgerServices[0].DeleteButtonTooltip).toBe(
        'Cannot delete a service transaction with a {0} status.'
      );
    });
  });

  describe('scope.patLedgerRowType function ->', function () {
    var chartClassResult = 'getChartColorResult';
    beforeEach(function () {
      //chartColors.getChartClass = jasmine.createSpy().and.returnValue(chartClassResult);
    });

    it('should return corectly when service is deleted', function () {
      var result = scope.patLedgerRowType({ IsDeleted: true });

      expect(result).toBe('deleted-transaction-display-color');
      expect(chartColorsService.getChartColor).not.toHaveBeenCalled();
    });

    it('should call chartColors with the correct parameters when record type is condition', function () {
      var statusId = 'statusId';
      var result = scope.patLedgerRowType({
        IsDeleted: false,
        RecordType: 'Condition',
        StatusId: statusId,
      });

      expect(result).toBe(chartClassResult);
      expect(chartColorsService.getChartColor).toHaveBeenCalledWith(
        'Condition',
        statusId
      );
    });

    it('should call chartColors with the correct parameters when record type is service', function () {
      var statusId = 'statusId';
      var result = scope.patLedgerRowType({
        IsDeleted: false,
        RecordType: 'ServiceTransaction',
        StatusId: statusId,
      });

      expect(result).toBe(chartClassResult);
      expect(chartColorsService.getChartColor).toHaveBeenCalledWith(
        'ServiceTransaction',
        statusId
      );
    });
  });

  describe('watch chartLedgerServices function ->', function () {
    beforeEach(function () {
      scope.initialized = false;
      spyOn(ctrl, 'setAllowEdit');
      spyOn(ctrl, 'setAllowDelete');
      spyOn(ctrl, 'callIntializerFunctions');
      scope.chartLedgerServices = [];
      scope.conditions = [];
      scope.$apply();
    });
    it('should call setAllowEdit and setAllowDelete if we have chartLedgerServices', function () {
      scope.chartLedgerServices = [];
      scope.conditions = [];
      scope.$apply();
      scope.chartLedgerServices = _.cloneDeep(chartLedgerServicesMock);
      scope.$apply();
      expect(ctrl.setAllowEdit).toHaveBeenCalled();
      expect(ctrl.setAllowDelete).toHaveBeenCalled();
    });
    it('should call ctrl.callIntializerFunctions if initialized is false', function () {
      scope.chartLedgerServices = [];
      scope.conditions = [];
      scope.$apply();
      scope.initialized = false;
      scope.reloadingChartLedger = false;
      scope.chartLedgerServices = _.cloneDeep(chartLedgerServicesMock);
      scope.$apply();
      expect(ctrl.callIntializerFunctions).toHaveBeenCalled();
      expect(scope.initialized).toBe(true);
      expect(scope.reloadingChartLedger).toBe(false);
      expect(scope.disableDeleteActions).toBe(false);
    });
    it('should call ctrl.callIntializerFunctions if reloadingChartLedger is true', function () {
      scope.chartLedgerServices = [];
      scope.conditions = [];
      scope.$apply();
      scope.initialized = true;
      scope.reloadingChartLedger = true;
      scope.chartLedgerServices = _.cloneDeep(chartLedgerServicesMock);
      scope.$apply();
      expect(ctrl.callIntializerFunctions).toHaveBeenCalled();
      expect(scope.initialized).toBe(true);
      expect(scope.reloadingChartLedger).toBe(false);
      expect(scope.disableDeleteActions).toBe(false);
    });
  });

  describe('scope.deleteAll function -> ', function () {
    beforeEach(function () {});

    it('should ', function () {});

    it('should ', function () {});

    it('should ', function () {});
  });

  describe('scope.deleteAll function -> ', function () {
    beforeEach(function () {
      scope.chartLedgerServices = angular.copy(chartLedgerServicesMock);
      scope.chartLedgerServices.forEach(function (record) {
        record.$$SelectedRow = true;
      });
    });

    it('should set ctrl.selectedServiceRecords and selectedConditionRecords based on $$SelectedRow ', function () {
      let conditionsCount = _.filter(scope.chartLedgerServices, function (x) {
        return x.RecordType === 'Condition';
      });
      let servcicesCount = _.filter(scope.chartLedgerServices, function (x) {
        return x.RecordType === 'ServiceTransaction';
      });
      scope.deleteAll();
      expect(ctrl.selectedServiceRecords.length).toBe(servcicesCount.length);
      expect(ctrl.selectedConditionRecords.length).toBe(conditionsCount.length);
    });

    it('should call confirmModal if selectedConditionRecords or selectedServicesRecords have records', function () {
      scope.deleteAll();
      expect(modalFactory.ConfirmModal).toHaveBeenCalled();
    });
  });

  describe('ctrl.createClaimEntityDtos method -> ', function () {
    var predeterminations = [];
    beforeEach(function () {
      predeterminations.push({ ClaimId: '1234', Status: 2 });
      predeterminations.push({ ClaimId: '12345', Status: 2 });
      predeterminations.push({ ClaimId: '123456', Status: 2 });
    });

    it('should call patientServices.Predetermination.closeBatch with list of ClaimEntityDtos', function () {
      expect(ctrl.createClaimEntityDtos(predeterminations)).toEqual([
        {
          ClaimId: '1234',
          Note: null,
          NoInsurancePayment: true,
          RecreateClaim: false,
          CloseClaimAdjustment: null,
          UpdateServiceTransactions: false,
          disableCancel: true,
        },
        {
          ClaimId: '12345',
          Note: null,
          NoInsurancePayment: true,
          RecreateClaim: false,
          CloseClaimAdjustment: null,
          UpdateServiceTransactions: false,
          disableCancel: true,
        },
        {
          ClaimId: '123456',
          Note: null,
          NoInsurancePayment: true,
          RecreateClaim: false,
          CloseClaimAdjustment: null,
          UpdateServiceTransactions: false,
          disableCancel: true,
        },
      ]);
    });

    it('should not include predetermination in list if Status is 7', function () {
      predeterminations = [];
      predeterminations.push({ ClaimId: '1234', Status: 2 });
      predeterminations.push({ ClaimId: '12345', Status: 7 });
      predeterminations.push({ ClaimId: '123456', Status: 2 });
      expect(ctrl.createClaimEntityDtos(predeterminations)).toEqual([
        {
          ClaimId: '1234',
          Note: null,
          NoInsurancePayment: true,
          RecreateClaim: false,
          CloseClaimAdjustment: null,
          UpdateServiceTransactions: false,
          disableCancel: true,
        },
        {
          ClaimId: '123456',
          Note: null,
          NoInsurancePayment: true,
          RecreateClaim: false,
          CloseClaimAdjustment: null,
          UpdateServiceTransactions: false,
          disableCancel: true,
        },
      ]);
    });
  });

  describe('ctrl.processServiceDeletes method -> ', function () {
    beforeEach(function () {
      scope.chartLedgerServices = angular.copy(chartLedgerServicesMock);
      scope.chartLedgerServices.forEach(function (record) {
        record.$$SelectedRow = true;
      });
      ctrl.selectedServiceRecords = _.filter(
        scope.chartLedgerServices,
        function (x) {
          return x.RecordType === 'ServiceTransaction';
        }
      );
      spyOn(ctrl, 'createClaimEntityDtos').and.callFake(function () {});
    });

    it('should call patientServices.Predetermination.getClaimsByServiceTransactionIds if ctrl.selectedServiceRecords length more then 0 ', function () {
      ctrl.processServiceDeletes();
      expect(
        patientServices.Predetermination.getClaimsByServiceTransactionIds
      ).toHaveBeenCalled();
    });

    it('should not call patientServices.Predetermination.getClaimsByServiceTransactionIds if ctrl.selectedServiceRecords length equals 0 ', function () {
      ctrl.selectedServiceRecords = [];
      ctrl.processServiceDeletes();
      expect(
        patientServices.Predetermination.getClaimsByServiceTransactionIds
      ).not.toHaveBeenCalled();
    });
  });

  describe('ctrl.deleteServiceTransactions method -> ', function () {
    beforeEach(function () {
      scope.chartLedgerServices = angular.copy(chartLedgerServicesMock);
      scope.chartLedgerServices.forEach(function (record) {
        record.$$SelectedRow = true;
      });
      ctrl.selectedServiceRecords = _.filter(
        scope.chartLedgerServices,
        function (x) {
          return x.RecordType === 'ServiceTransaction';
        }
      );
      scope.personId = '1234';
    });

    it('should call patientServices.ServiceTransactions.batchDelete if ctrl.selectedServiceRecords length more than 0', function () {
      let serviceTransactionIds = _.map(
        _.uniqBy(ctrl.selectedServiceRecords, service => service.RecordId),
        service => service.RecordId
      );
      ctrl.deleteServiceTransactions();
      expect(
        patientServices.ServiceTransactions.batchDelete
      ).toHaveBeenCalledWith(
        { personId: scope.personId },
        serviceTransactionIds
      );
    });

    it('should not call patientServices.ServiceTransactions.batchDelete if ctrl.selectedServiceRecords length equals 0', function () {
      ctrl.selectedServiceRecords = [];
      ctrl.deleteServiceTransactions();
      expect(
        patientServices.ServiceTransactions.batchDelete
      ).not.toHaveBeenCalled();
    });
  });

  describe('ctrl.deleteServiceTransactionsSuccess method -> ', function () {
    var returnedValue = [];
    beforeEach(function () {
      scope.chartLedgerServices = [
        {
          PatientId: personIdMock,
          RecordType: 'Service',
          RecordId: 1234,
        },
        {
          PatientId: personIdMock,
          RecordType: 'Service',
          RecordId: 1235,
        },
      ];

      returnedValue = [
        {
          PatientId: personIdMock,
          RecordType: 'Service',
          ServiceTransactionId: 1234,
          ObjectState: 'Delete',
          FailedMessage: null,
        },
        {
          PatientId: personIdMock,
          RecordType: 'Service',
          ServiceTransactionId: 1235,
          ObjectState: 'Delete',
          FailedMessage: 'any message',
        },
      ];
      spyOn(rootScope, '$broadcast');
    });

    it('should set RecordId equal to service.ServiceTransactionId if no FailedMessage', function () {
      ctrl.deleteServiceTransactionsSuccess(returnedValue);
      returnedValue.forEach(function (service) {
        if (service.FailedMessage === null  ) {
          expect(service.RecordId).toEqual(service.ServiceTransactionId);
        }        
      });
    });

    it('should call rootScope.$broadcast with each service that is successfully deleted ', function () {
      ctrl.deleteServiceTransactionsSuccess(returnedValue);
      returnedValue.forEach(function (service) {
        if (service.ObjectState === 'Delete' && service.FailedMessage === null) {
          expect(rootScope.$broadcast).toHaveBeenCalledWith(
            'chart-ledger:service-transaction-deleted',
            service
          );
        }        
      });
    });

    it('should remove service from chartLedgerServices if no failedMessage', function () {
      let counter = 0;
      returnedValue.forEach(function (service) {
        let indx = _.findIndex(scope.chartLedgerServices, {
          RecordId: service.ServiceTransactionId,
        });
        expect(indx).toEqual(counter);
        counter += 1;
      });

      ctrl.deleteServiceTransactionsSuccess(returnedValue);

      returnedValue.forEach(function (service) {
        if (service.ObjectState === 'Delete' && !service.FailedMessage) {
          let indx = _.findIndex(scope.chartLedgerServices, {
            RecordId: service.ServiceTransactionId,
          });
          expect(indx).toBe(-1);
        }
      });
    });

    it('should call rootScope.$broadcast soar:tx-plan-services-changed ', function () {
      ctrl.deleteServiceTransactionsSuccess(returnedValue);
      expect(rootScope.$broadcast).toHaveBeenCalledWith(
        'soar:tx-plan-services-changed',
        null,
        true
      );
    });    
  });

  describe('ctrl.deleteConditionsSuccess method -> ', function () {
    var returnedValue = [];
    beforeEach(function () {
      scope.chartLedgerServices = [
        {
          PatientId: personIdMock,
          RecordType: 'Condition',
          RecordId: 1234,
        },
        {
          PatientId: personIdMock,
          RecordType: 'Condition',
          RecordId: 1235,
        },
      ];

      returnedValue = [
        {
          PatientId: personIdMock,
          RecordType: 'Condition',
          PatientConditionId: 1234,
        },
        {
          PatientId: personIdMock,
          RecordType: 'Condition',
          PatientConditionId: 1235,
        },
      ];
      spyOn(rootScope, '$broadcast');
    });

    it('should set RecordId equal to PatientConditionId ', function () {
      ctrl.deleteConditionsSuccess(returnedValue);
      returnedValue.forEach(function (condition) {
        expect(condition.RecordId).toEqual(condition.PatientConditionId);
      });
    });

    it('should call rootScope.$broadcast with each condition ', function () {
      ctrl.deleteConditionsSuccess(returnedValue);
      returnedValue.forEach(function (condition) {
        expect(rootScope.$broadcast).toHaveBeenCalledWith(
          'chart-ledger:patient-condition-deleted',
          condition
        );
      });
    });

    it('should remove condition from chartLedgerServices', function () {
      let counter = 0;
      returnedValue.forEach(function (condition) {
        let indx = _.findIndex(scope.chartLedgerServices, {
          RecordId: condition.PatientConditionId,
        });
        expect(indx).toEqual(counter);
        counter += 1;
      });

      ctrl.deleteConditionsSuccess(returnedValue);

      returnedValue.forEach(function (condition) {
        let indx = _.findIndex(scope.chartLedgerServices, {
          RecordId: condition.PatientConditionId,
        });
        expect(indx).toBe(-1);
      });
    });
  });

  describe('ctrl.deleteConditions method -> ', function () {
    beforeEach(function () {
      scope.chartLedgerServices = angular.copy(chartLedgerServicesMock);
      scope.chartLedgerServices.forEach(function (record) {
        record.$$SelectedRow = true;
      });
      ctrl.selectedConditionRecords = [];
      scope.personId = '1234';
    });

    it('should call patientServices.ServiceTransactions.batchDelete if ctrl.selectedServiceRecords length more than 0', function () {
      ctrl.selectedConditionRecords = _.filter(
        scope.chartLedgerServices,
        function (x) {
          return x.RecordType === 'Condition';
        }
      );
      let conditionIds = _.map(
        _.uniqBy(
          ctrl.selectedConditionRecords,
          condition => condition.RecordId
        ),
        condition => condition.RecordId
      );
      ctrl.deleteConditions();
      expect(patientServices.Conditions.batchDelete).toHaveBeenCalledWith(
        { patientId: scope.personId },
        conditionIds
      );
    });

    it('should not call patientServices.ServiceTransactions.batchDelete if ctrl.selectedServiceRecords length equals 0', function () {
      ctrl.selectedServiceRecords = [];
      ctrl.deleteConditions();
      expect(patientServices.Conditions.batchDelete).not.toHaveBeenCalled();
    });
  });

  describe('scope.setHasSelectedRows method -> ', function () {
    beforeEach(function () {
      scope.chartLedgerServices = angular.copy(chartLedgerServicesMock);
      scope.hasSelectedRows = false;
    });

    it('should set scope.hasSelectedRows to false if no selectedRows', function () {
      scope.hasSelectedRows = true;
      scope.setHasSelectedRows();
      expect(scope.hasSelectedRows).toBe(false);
    });

    it('should set scope.hasSelectedRows to true if selectedRows', function () {
      scope.hasSelectedRows = false;
      scope.chartLedgerServices[0].$$SelectedRow = true;
      scope.setHasSelectedRows();
      expect(scope.hasSelectedRows).toBe(true);
    });
  });

  describe('patCore:initlocation broadcast listener -> ', function () {
    beforeEach(function () {
      spyOn(ctrl, 'setCurrentLocation');
    });

    it('should call ctrl.loadProvidersByLocation if $scope.filterByLocationId is null', function () {
      rootScope.$broadcast('patCore:initlocation');
      expect(ctrl.setCurrentLocation).toHaveBeenCalled();
    });
  });

  describe('scope.setCurrentLocation method -> ', function () {
    beforeEach(function () {
      scope.chartLedgerServices = angular.copy(chartLedgerServicesMock);
      spyOn(ctrl, 'setAllowDelete');
      spyOn(ctrl, 'setAllowEdit');
    });

    it('should set ctrl.currentLocation', function () {
      ctrl.setCurrentLocation();
      expect(ctrl.currentLocation).toEqual(
        locationService.getCurrentLocation()
      );
    });

    it('should call ctrl.setAllowDelete and ctrl.setAllowEdit', function () {
      ctrl.setCurrentLocation();
      expect(ctrl.setAllowDelete).toHaveBeenCalled();
      expect(ctrl.setAllowEdit).toHaveBeenCalled();
    });

    describe('scope.selectedPatientsChanged method -> ', function () {
      beforeEach(function () {
        scope.personId = '1234';
        spyOn(rootScope, '$broadcast');
        scope.reloadingChartLedger = false;
        scope.duplicatePatients = [
          { PatientId: '1234', Selected: false },
          { PatientId: '1235', Selected: false },
          { PatientId: '1236', Selected: false },
        ];
      });

      it('should always set the routed patient to Selected equals true', function () {
        scope.selectedPatientsChanged();
        expect(scope.duplicatePatients[0].Selected).toBe(true);
      });

      it('should broadcast soar:reload-clinical-overview with a list of duplicates selected ', function () {
        scope.duplicatePatients[0].Selected = true;
        scope.duplicatePatients[1].Selected = true;
        scope.selectedPatientsChanged();
        expect(
          rootScope.$broadcast
        ).toHaveBeenCalledWith('soar:reload-clinical-overview', [
          '1234',
          '1235',
        ]);
      });
    });

    describe('scope.setCurrentLocation method -> ', function () {
      var mockServiceTransactions = _.cloneDeep(chartLedgerServicesMock);
      beforeEach(function () {
        mockServiceTransactions.forEach(function (service) {
          service.FailedMessage = null;
        }); 
      });

      it('should call modalFactory.ConfirmModal with message including all services that failed deletion ', function () {
        mockServiceTransactions[0].FailedMessage = 'something went wrong';
        mockServiceTransactions[0].Description = 'D0191: assesment of a patient (D0191)';
        mockServiceTransactions[0].Tooth = '5';
        mockServiceTransactions[2].FailedMessage = 'something else went wrong';
        mockServiceTransactions[2].Description = 'D7860: arthrotomy (D7860)';
        ctrl.messageForFailedServiceTransactionDeletes(mockServiceTransactions);
        expect(modalFactory.ConfirmModal).toHaveBeenCalledWith( 'Confirm', 'Failed to delete some services.'+
          '\n\n Description: '+mockServiceTransactions[0].Description+' #5: '+

          mockServiceTransactions[0].FailedMessage +
          '\n\n Description: '+mockServiceTransactions[2].Description+': '+
          mockServiceTransactions[2].FailedMessage, 'Ok');
      });

      it('should not call modalFactory.ConfirmModal if no services have FailedMessages', function () {
        mockServiceTransactions.forEach(function (service) {
          service.FailedMessage = null;
        });
        expect(modalFactory.ConfirmModal).not.toHaveBeenCalled(); 
      });
    });

  });
});
