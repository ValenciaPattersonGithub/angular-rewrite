import { of } from 'rsjs';

describe('PatientChartController ->', function () {
  var location, toastrFactory, scope, ctrl, rootScope, q, AmfaKeys;
  var patientServices,
    modalFactory,
    treatmentPlansFactory,
    clinicalDrawerStateService;
  var patientPerioExamFactory,
    referenceDataService,
    practiceSettingsService,
    patSecurityService,
    usersFactory,
    tabLauncher,
    toothSelector;
  var clinicalOverviewFactory,
    modalFactoryDeferred,
    discardChangesService,
    patientNotesFactory,
    noteTemplatesHttpService,
    rxService;
  var imagingMasterService, imagingProviders;
  var httpBackend, deferred;
  var chartColorsService, patientRxFactory;
  var featureFlagService, fuseFlag;
  var conditionsService;
  //#region mocks

  var boolValue = true;

  var perioExamHeadersMock = [
    {
      EntityId: '0605C7DD-EBD8-4DCC-A443-1FCBA74D9966',
      ExamDate: '2017-02-01',
      IsDeleted: false,
    },
    {
      EntityId: '0505C7DD-EBD8-4DCC-A443-1FCBA74D9966',
      ExamDate: '2017-02-05',
      IsDeleted: false,
    },
    {
      EntityId: '0405C7DD-EBD8-4DCC-A443-1FCBA74D9966',
      ExamDate: '2017-02-04',
      IsDeleted: false,
    },
    {
      EntityId: '0305C7DD-EBD8-4DCC-A443-1FCBA74D9966',
      ExamDate: '2017-01-06',
      IsDeleted: true,
    },
  ];

  var personIdMock = 'b3eb6f7f-7b4a-4be5-b8ac-d24cccdd42b9';

  var routeParamsMock = { patientId: 2 };

  var conditionsMockList = [
    {
      ConditionId: '1234',
      Description: 'First Condition',
    },
    {
      ConditionId: '2345',
      Description: 'Second Condition',
    },
    {
      ConditionId: '3456',
      Description: 'Third Condition',
    },
  ];

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

  var chartLedgerRecordIds = [
    { RecordId: 'e1b25c6a-07f0-4628-b633-937753c3l1hh' },
    { RecordId: 'e1b25c6a-07f0-4628-b633-937753c3l1gg' },
    { RecordId: 'e1b25c6a-07f0-4628-b633-937753c3l1ff' },
    { RecordId: 'e1b25c6a-07f0-4628-b633-937753c3l1ee' },
  ];

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

  var examStateMock =
    ('ExamState',
    {
      EditMode: 'EditMode',
      None: 'None',
      Cancel: 'Cancel',
      Continue: 'Continue',
      Start: 'Start',
      Save: 'Save',
      SaveComplete: 'SaveComplete',
      Initializing: 'Initializing',
      Loading: 'Loading',
      ViewMode: 'ViewMode',
    });

  var conditionsMockResponse = {
    Value: [
      {
        Description: 'Condition1',
      },
      {
        Description: 'Condition2',
      },
    ],
  };

  var chartLedgerServicesMock = [
    {
      PersonId: personIdMock,
      RecordId: chartLedgerRecordIds[0].RecordId,
      RecordType: 'PlannedService',
      ServiceCodeId: serviceCodesMockResponse.Value[0].ServiceCodeId,
      Description: null,
      CreationDate: new Date(),
      StatusId: '1',
      StatusName: null,
      AppointmentId: null,
      ProviderId: providersMock[0].UserId,
      ProviderName: null,
      Surface: null,
      Tooth: null,
      Fee: 200.0,
      ConditionId: null,
      ConditionIsActive: null,
      Note: null,
      AffectedAreaId: null,
    },
    {
      PersonId: personIdMock,
      RecordId: chartLedgerRecordIds[1].RecordId,
      RecordType: 'PlannedService',
      ServiceCodeId: serviceCodesMockResponse.Value[0].ServiceCodeId,
      Description: null,
      CreationDate: new Date(),
      StatusId: '1',
      StatusName: null,
      AppointmentId: null,
      ProviderId: providersMock[1].UserId,
      ProviderName: null,
      Surface: null,
      Tooth: null,
      Fee: 200.0,
      ConditionId: null,
      ConditionIsActive: null,
      Note: null,
      AffectedAreaId: null,
    },
    {
      PersonId: personIdMock,
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
      Surface: null,
      Tooth: null,
      Fee: null,
      ConditionId: conditionsMockList[0].ConditionId,
      ConditionIsActive: null,
      Note: null,
      AffectedAreaId: null,
    },
    {
      PersonId: personIdMock,
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
      Surface: null,
      Tooth: null,
      Fee: null,
      ConditionId: conditionsMockList[0].ConditionId,
      ConditionIsActive: null,
      Note: null,
      AffectedAreaId: null,
    },
  ];

  var chartLedgerServicesMockResult = {
    Value: chartLedgerServicesMock,
  };

  //#endregion mocks

  //#region spies

  beforeEach(module('Soar.Common'));
  beforeEach(
    module('Soar.BusinessCenter', function ($provide) {
      noteTemplatesHttpService = {
        SetActiveNoteTemplate: jasmine.createSpy().and.returnValue({}),
      };
      $provide.value('NoteTemplatesHttpService', noteTemplatesHttpService);
    })
  );

  beforeEach(
    module('Soar.Patient', function ($provide) {
      patientServices = {
        PatientDuplicates: {
          get: jasmine.createSpy().and.callFake(function () {
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
        ClinicalOverview: {
          get: jasmine
            .createSpy('ClinicalOverview.get')
            .and.callFake(function () {
              var deferred = q.defer();
              deferred.$promise = deferred.promise;
              deferred.resolve('some value in return');
              return deferred;
            }),
        },
        ClinicalOverviews: {
          getAll: jasmine.createSpy().and.returnValue({
            $promise: {
              then: jasmine.createSpy().and.returnValue({
                Value: [
                  {
                    ChartLedger: [
                      { PatientId: '1234' },
                      { PatientId: '1236' },
                      { PatientId: '1288' },
                    ],
                  },
                ],
              }),
            },
          }),
        },
        Odontogram: {
          get: jasmine.createSpy().and.returnValue({}),
        },
      };
      $provide.value('PatientServices', patientServices);

      // mock patientPerioExamFactory
      patientPerioExamFactory = {
        access: jasmine.createSpy().and.returnValue({ View: true }),
        getById: jasmine.createSpy().and.returnValue({
          then: jasmine.createSpy(),
        }),
        get: jasmine.createSpy().and.returnValue({
          then: jasmine.createSpy(),
        }),
        merge: jasmine.createSpy().and.returnValue({}),
        save: jasmine.createSpy().and.returnValue({
          then: jasmine.createSpy(),
        }),
        validateExam: jasmine.createSpy().and.returnValue(true),
        deleteExam: jasmine.createSpy().and.returnValue({
          then: jasmine.createSpy(),
        }),
        clearObservers: jasmine.createSpy().and.returnValue({}),
        setExamState: jasmine.createSpy().and.returnValue({}),
        setSelectedExamId: jasmine.createSpy().and.returnValue({}),
        setActiveQuadrant: jasmine.createSpy().and.returnValue({}),
        setActiveExam: jasmine.createSpy().and.returnValue({}),
        setActiveExamPath: jasmine.createSpy(),
        setActiveTooth: jasmine.createSpy().and.returnValue({}),
        setDataChanged: jasmine.createSpy().and.returnValue({}),
        getNewExam: jasmine.createSpy().and.returnValue({}),
        observeExams: jasmine.createSpy().and.returnValue({}),
        SetActivePerioExam: jasmine.createSpy().and.returnValue({}),
        ActivePerioExam: jasmine.createSpy().and.returnValue({}),
        AcceptableKeyCodes: jasmine.createSpy().and.returnValue({}),
        ValueByKeyCode: jasmine.createSpy().and.returnValue({}),
        ValueByInputValue: jasmine.createSpy().and.returnValue({}),
        getNextValidTooth: jasmine.createSpy().and.returnValue({}),
        ActiveArch: jasmine.createSpy().and.returnValue({}),
        ActiveSide: jasmine.createSpy().and.returnValue({}),
        NextExamType: jasmine.createSpy().and.returnValue({}),
        setActiveExamParameters: jasmine.createSpy().and.returnValue({}),
        ConvertToBoolean: jasmine.createSpy().and.returnValue({}),
        ToggleExam: false,
        setToggleExam: jasmine.createSpy().and.returnValue({}),
        // yes these are duplicates to ActiveQuadrant, but that is used to drive other behavior
        ActivePerioQuadrant: null,
        setActivePerioQuadrant: jasmine.createSpy().and.returnValue({}),
        setActiveToothIndex: jasmine.createSpy().and.returnValue({}),
        setActivePerioFocus: jasmine.createSpy().and.returnValue({}),
        setActiveTab: jasmine.createSpy().and.returnValue({}),
        setActiveExamType: jasmine.createSpy().and.returnValue({}),
        ExamTypes: [{ Active: true }],
      };
      $provide.value('PatientPerioExamFactory', patientPerioExamFactory);

      patSecurityService = {
        generateMessage: jasmine.createSpy(),
        IsAuthorizedByAbbreviation: jasmine.createSpy().and.returnValue(true),
        logout: jasmine.createSpy(),
      };
      $provide.value('patSecurityService', patSecurityService);

      imagingMasterService = {};
      $provide.value('ImagingMasterService', imagingMasterService);

      imagingProviders = {
        Apteryx: 'a1',
        Apteryx2: 'a2',
        Sidexis: 's',
        Blue: 'b',
      };
      $provide.value('ImagingProviders', imagingProviders);

      toastrFactory = {};
      toastrFactory.error = jasmine.createSpy();
      toastrFactory.success = jasmine.createSpy();
      $provide.value('toastrFactory', toastrFactory);

      location = {
        search: jasmine.createSpy().and.returnValue({ tab: 2 }),
        path: jasmine.createSpy(),
      };
      $provide.value('$location', location);

      discardChangesService = {
        currentChangeRegistration: {
          controller: 'PatientCrudNotesController',
          hasChanges: true,
        },
      };
      $provide.value('DiscardChangesService', discardChangesService);

      treatmentPlansFactory = {
        GetAllHeaders: jasmine
          .createSpy()
          .and.returnValue({ then: function () {} }),
        SetDataChanged: jasmine.createSpy(),
        SetActiveTreatmentPlan: jasmine.createSpy(),
        CollapseAll: jasmine.createSpy(),
        setActiveNote: jasmine.createSpy(),
        SetNewTreatmentPlan: jasmine.createSpy(),
        SetEditing: jasmine.createSpy(),
      };
      $provide.value('TreatmentPlansFactory', treatmentPlansFactory);

      patientNotesFactory = {
        setActiveNote: jasmine.createSpy(),
        setEditMode: jasmine.createSpy(),
        load: jasmine.createSpy(),
      };
      $provide.value('PatientNotesFactory', patientNotesFactory);

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

      practiceSettingsService = {
        get: jasmine.createSpy().and.returnValue(of({}))
      };

      $provide.value('practiceSettingsService', practiceSettingsService);

      tabLauncher = {
        launchNewTab: jasmine.createSpy(),
      };
      $provide.value('tabLauncher', tabLauncher);

      toothSelector = {
        unselectTeeth: jasmine.createSpy().and.callFake(function () {}),
      };
      $provide.value('ToothSelectionService', toothSelector);

      clinicalOverviewFactory = {
        GetClinicalOverview: jasmine
          .createSpy()
          .and.returnValue({ then: function () {} }),
      };
      $provide.value('ClinicalOverviewFactory', clinicalOverviewFactory);

      clinicalDrawerStateService = {
        changeDrawerState: jasmine.createSpy(),
      };
      $provide.value('ClinicalDrawerStateService', clinicalDrawerStateService);

      rxService = {
        rxAccessCheck: jasmine.createSpy().and.returnValue(false),
      };
      $provide.value('RxService', rxService);

      chartColorsService = {
        loadChartColors: jasmine.createSpy(),
      };
      $provide.value('ChartColorsService', chartColorsService);

      conditionsService = {
        getAll: jasmine.createSpy()
      };
      $provide.value('ConditionsService', conditionsService);

      patientRxFactory = {
        Medications: jasmine
          .createSpy()
          .and.returnValue({ then: function () {} }),
        getMedications: jasmine
          .createSpy()
          .and.returnValue({ then: function () {} }),
        access: jasmine.createSpy().and.returnValue(true),
      };
      $provide.value('PatientRxFactory', patientRxFactory);

      featureFlagService = {
        getOnce$: jasmine.createSpy().and.returnValue({
          subscribe: jasmine.createSpy().and.callFake((callback) => {
            callback(false);
          }),
        }),
      };
      $provide.value('FeatureFlagService', featureFlagService);

      fuseFlag = {        
      };
      $provide.value('FuseFlag', fuseFlag);
    })
  );

  //#endregion
  var parentScope;
  beforeEach(inject(function (
    $rootScope,
    $controller,
    $injector,
    $q,
    _AmfaKeys_
  ) {
    scope = $rootScope.$new();
    parentScope = $rootScope.$new();
    scope.personalInfo = { Profile: {} };
    scope.patient = {};
    scope.serviceCodesKeyword = { search: '' };
    scope.conditionsKeyword = { search: '' };
    scope.orderBy = { field: 'test', asc: false };
    q = $q;
    AmfaKeys = _AmfaKeys_;
    httpBackend = $injector.get('$httpBackend');

    rootScope = $rootScope;
    rootScope.patAuthContext = {
      isAuthorized: true,
      userInfo: {
        userid: 1,
      },
    };

    referenceDataService.getData.and.callFake(function () {
      return $q.resolve([]);
    });

    modalFactory = {
      Modal: jasmine.createSpy('modalFactory.Modal').and.callFake(function () {
        var modalFactoryDeferred = q.defer();
        modalFactoryDeferred.resolve('some value in return');
        return {
          result: modalFactoryDeferred.promise,
          then: function () {},
        };
      }),
      ConfirmModal: jasmine
        .createSpy('modalFactory.ConfirmModal')
        .and.callFake(function () {
          var modalFactoryDeferred = q.defer();
          modalFactoryDeferred.resolve('some value in return');
          return {
            result: modalFactoryDeferred.promise,
            then: function () {},
          };
        }),
      WarningModal: jasmine
        .createSpy('modalFactory.WarningModal')
        .and.callFake(function () {
          modalFactoryDeferred = q.defer();
          modalFactoryDeferred.resolve(1);
          return {
            result: modalFactoryDeferred.promise,
            then: function (callback) {
              return callback(boolValue);
            },
          };
        }),
    };

    usersFactory = {
      Users: jasmine.createSpy('usersFactory.Users').and.callFake(function () {
        var deferred = $q.defer();
        deferred.resolve(1);
        return {
          result: deferred.promise,
          then: function () {},
        };
      }),
      SetLoadedProviders: jasmine.createSpy(),
      UserLocations: jasmine.createSpy(),
      LoadedProviders: jasmine.createSpy(),
    };

    let patientDetailService = {
      getPatientDashboardOverviewByPatientId: jasmine
        .createSpy()
        .and.callFake(function () {
          var deferred = $q.defer();
          deferred.resolve(1);
          return {
            result: deferred.promise,
            then: function () {},
          };
        }),
    };

    ctrl = $controller('PatientChartController', {
      $scope: scope,
      $routeParams: routeParamsMock,
      ModalFactory: modalFactory,
      UsersFactory: usersFactory,
      ExamState: examStateMock,
      PatientPerioExamFactory: patientPerioExamFactory,
      PatientDetailService: patientDetailService,
      $q: q,
      AmfaKeys: AmfaKeys,
      FeatureFlagService: featureFlagService,
      FuseFlag: fuseFlag,
      ConditionsService: conditionsService
    });
    scope.activeTab = undefined;
    scope.selectedPerioPath = {};
    scope.activatedHiddenAreas = { actionsPanel: false };
    scope.orderByCondition = {};
    scope.showInactive = { value: false };

    scope.$apply();
  }));

  describe('scope properties -> ', function () {
    it('should have an instance of the controller', function () {
      expect(ctrl).not.toBeNull();
    });

    it('should set scope properties', function () {
      expect(scope.editMode).toBe(false);
      expect(scope.patientId).toBe(routeParamsMock.patientId);
      expect(scope.selection).toBeNull();
      expect(scope.tabs.length).toBe(7);
      expect(scope.chartLedgerServices).toEqual([]);
    });
  });

  describe('getTabNumberFromParam function -> ', function () {
    it('should return tab number', function () {
      expect(ctrl.getTabNumberFromParam()).toBe(2);
    });
  });

  describe('activateTab function -> ', function () {
    beforeEach(function () {
      spyOn(ctrl, 'discardChangesModal').and.callFake(function () {});
      spyOn(ctrl, 'getPerioPaths').and.returnValue(true);
      parentScope.dataHasChanged = true;
      scope.$parent = parentScope;
    });

    it('should call location.search if a new activeTab is set', function () {
      scope.activeTab = 2;
      scope.activateTab(1);
      expect(scope.activeTab).toBe(1);
    });

    it('should call tabLauncher.launchNewTab with CAESY Cloud link if activeTab is 6', function () {
      scope.activateTab(6);
      expect(tabLauncher.launchNewTab).toHaveBeenCalledWith(
        'https://pca.pattersoncompanies.com/signin/signin.aspx?wa=wsignin1.0&wtrealm=https%3a%2f%2fwww.caesycloud.com&wctx=rm%3d0%26id%3dpassive%26ru%3d%252fPresentations%252flist.aspx&wct=2017-10-16T13%3a59%3a44Z&application=caesycloud'
      );
    });

    it('should not reset activeTab if CAESY Cloud tab is clicked', function () {
      scope.activeTab = 2;
      scope.activateTab(6);
      expect(scope.activeTab).toBe(2);
    });

    it('should set activeTab to 5 if index is 5 and current tab is Health', function () {
      scope.activeTab = 0;
      scope.activateTab(5);
      expect(scope.activeTab).toBe(5);
    });

    it('should set activeTab to 5 if index is 5 and current tab is Chart', function () {
      scope.activeTab = 1;
      scope.activateTab(5);
      expect(scope.activeTab).toBe(5);
    });

    it('should set activeTab to 5 if index is 5 and current tab is Ledger', function () {
      scope.activeTab = 2;
      scope.activateTab(5);
      expect(scope.activeTab).toBe(5);
    });

    it('should set activeTab to 5 if index is 5 and current tab is Perio', function () {
      scope.activeTab = 3;
      scope.activateTab(5);
      expect(scope.activeTab).toBe(5);
    });

    it('should set activeTab to 5 if index is 5 and current tab is Images', function () {
      scope.activeTab = 4;
      scope.activateTab(5);
      expect(scope.activeTab).toBe(5);
    });

    it('should not change active tab if scope.showImagingTab is false and index is 4 ', function () {
      scope.showImagingTab = false;
      scope.activeTab = 2;
      scope.activateTab(4);
      expect(scope.activeTab).toBe(2);
    });

    it('should set scope.showImagingTab to false if index is not 4 and scope.showImagingDropdown is true ', function () {
      scope.showImagingTab = false;
      scope.showImagingDropdown = true;
      scope.activeTab = 2;
      scope.activateTab(4);
      expect(scope.activeTab).toBe(2);
    });

    it('should close the options modal if index is 0', function () {
      scope.activatedHiddenAreas.actionsPanel = true;
      scope.activateTab(0);
      expect(scope.activatedHiddenAreas.actionsPanel).toBe(false);
    });

    it('should close the options modal if index is 2', function () {
      scope.activatedHiddenAreas.actionsPanel = true;
      scope.activateTab(2);
      expect(scope.activatedHiddenAreas.actionsPanel).toBe(false);
    });

    it('should close the options modal if index is 3', function () {
      scope.activatedHiddenAreas.actionsPanel = true;
      scope.activateTab(3);
      expect(scope.activatedHiddenAreas.actionsPanel).toBe(false);
    });

    it('should close the options modal if index is 4', function () {
      scope.activatedHiddenAreas.actionsPanel = true;
      scope.activateTab(4);
      expect(scope.activatedHiddenAreas.actionsPanel).toBe(false);
    });

    it('should close the options modal if index is 5', function () {
      scope.activatedHiddenAreas.actionsPanel = true;
      scope.activateTab(5);
      expect(scope.activatedHiddenAreas.actionsPanel).toBe(false);
    });

    it('should close the options modal if index is 6', function () {
      scope.activatedHiddenAreas.actionsPanel = true;
      scope.activateTab(6);
      expect(scope.activatedHiddenAreas.actionsPanel).toBe(false);
    });

    it('should check for existance of hiddenAreas and the actionPanel was created before attempting to close options panel', function () {
      scope.activatedHiddenAreas.actionsPanel = true;
      scope.activateTab(4);
      expect(scope.activatedHiddenAreas.actionsPanel).toBe(false);
    });
  });

  describe('getPatientChartLedgerServices function -> ', function () {
    it('should call patientServices.ChartLedger.get ', function () {
      scope.getPatientChartLedgerServices();
      expect(scope.loadingChartLedgerServices).toBe(true);
      expect(patientServices.ChartLedger.get).toHaveBeenCalled();
    });

    it('should set chartLedgerServices to empty list is reset flag is passed', function () {
      scope.getPatientChartLedgerServices(true);
      expect(scope.chartLedgerServices).toEqual([]);
    });
  });

  describe('ChartLedgerServicesGetSuccess function -> ', function () {
    it('should set ctrl.chartLedgerServices to result', function () {
      scope.chartLedgerServices = [];
      ctrl.ChartLedgerServicesGetSuccess(chartLedgerServicesMockResult);
      expect(scope.loadingChartLedgerServices).toBe(false);
      expect(scope.chartLedgerServices[0]).toEqual(
        chartLedgerServicesMockResult.Value[0]
      );
    });
  });

  describe('ChartLedgerServicesGetFailure function -> ', function () {
    it('should call toastr error', function () {
      ctrl.ChartLedgerServicesGetFailure();
      expect(toastrFactory.error).toHaveBeenCalled();
      expect(scope.loadingChartLedgerServices).toBe(false);
      expect(scope.chartLedgerServices).toEqual([]);
    });
  });

  describe('odontogramGetSuccess function ->', function () {
    it('should set loadingPatientOdontogram to false', function () {
      scope.loadingPatientOdontogram = true;
      ctrl.odontogramGetSuccess({});
      expect(scope.loadingPatientOdontogram).toBe(false);
    });

    it('should set patOdontogram to res.Value when res contains results', function () {
      scope.loadingPatientOdontogram = true;
      scope.patOdontogram = null;
      var res = { Value: { OdontogramId: 'id' } };
      ctrl.odontogramGetSuccess(res);
      expect(scope.patOdontogram).toEqual({ Data: res.Value });
    });

    it('should set patOdontogram to new odontogram when res.Value is null', function () {
      scope.loadingPatientOdontogram = true;
      scope.patOdontogram = null;
      var res = { Value: null };
      var expected = { Data: { PatientId: scope.patientId, Teeth: [] } };
      ctrl.odontogramGetSuccess(res);
      expect(scope.patOdontogram).toEqual(expected);
    });

    it('should set patOdontogram to new odontogram when OdontogramId is empty', function () {
      scope.loadingPatientOdontogram = true;
      scope.patOdontogram = null;
      var res = { Value: { OdontogramId: ctrl.emptyGuid } };
      var expected = { Data: { PatientId: scope.patientId, Teeth: [] } };
      ctrl.odontogramGetSuccess(res);
      expect(scope.patOdontogram).toEqual(expected);
    });
  });

  describe('activateTabFromTimelineTile function ->', function () {
    beforeEach(function () {
      scope.activateTab = jasmine.createSpy();
    });

    it('should take correct action when tab is perio', function () {
      ctrl.setPerioExamId = jasmine.createSpy();
      var data = 'testData';

      scope.activateTabFromTimelineTile('perio', data);

      expect(ctrl.setPerioExamId).toHaveBeenCalledWith(data);
      expect(scope.activateTab).toHaveBeenCalledWith(3);
    });

    it('should take correct action when tab is imaging', function () {
      scope.showImagingTab = false;
      scope.selectedImagingProvider = null;
      ctrl.setImageExamId = jasmine.createSpy();
      var data = { provider: 'testProvider', examId: 'testExamId' };

      scope.activateTabFromTimelineTile('imaging', data);

      expect(scope.showImagingTab).toBe(true);
      expect(scope.selectedImagingProvider).toBe(data.provider);
      expect(ctrl.setImageExamId).toHaveBeenCalledWith(data.examId);
      expect(scope.activateTab).toHaveBeenCalledWith(4);
    });

    it('should take correct action when tab is rx', function () {
      scope.activateTabFromTimelineTile('rx');

      expect(scope.activateTab).toHaveBeenCalledWith(5);
    });
  });

  describe('Display Service Codes  -> ', function () {
    it('should open service code panel', function () {
      scope.activatedHiddenAreas = { serviceCodeSearch: false };
      scope.activateServiceSearch();
      expect(scope.showServiceCodeSearchPanel).toBe(true);
      expect(scope.showConditionSearchPanel).toBe(false);
      expect(scope.activatedHiddenAreas.serviceCodeSearch).toBe(false);
    });

    it('should close service code panel', function () {
      scope.showServiceCodeSearchPanel = true;
      scope.hideServiceCodeSearch();
      expect(scope.showServiceCodeSearchPanel).toBe(false);
    });

    it('should open modal window with selected service details', function () {
      expect(scope.modalIsOpen).toBe(false);
      scope.openServiceCrudModal(serviceCodesMockResponse.Value[0]);
      expect(scope.modalIsOpen).toBe(true);
    });

    it('should close modal window when service save is success', function () {
      scope.modalIsOpen = true;
      ctrl.successHandler();
      expect(scope.modalIsOpen).toBe(false);
    });

    it('should close options modal when all services button is clicked', function () {
      scope.activatedHiddenAreas.actionsPanel = true;
      scope.activateConditionSearch();
      expect(scope.activatedHiddenAreas.actionsPanel).toBe(false);
    });
  });

  describe('Display Conditions  -> ', function () {
    it('should load conditions into grid', function () {
      ctrl.getConditions();
      expect(featureFlagService.getOnce$).toHaveBeenCalled();
      //ctrl.getConditionsSuccess(conditionsMockResponse);
      //expect(scope.conditionsGridData.options.data.length).toBe(conditionsMockResponse.Value.length);
      //expect(scope.conditionsGridData.options.data[0].Description).toBe(conditionsMockResponse.Value[0].Description);
      //expect(scope.conditionsGridData.options.data[1].Description).toBe(conditionsMockResponse.Value[1].Description);
    });

    it('should open conditions panel', function () {
      scope.activatedHiddenAreas = { conditionsCodeSearch: false };
      scope.activateConditionSearch();
      expect(scope.showServiceCodeSearchPanel).toBe(false);
      expect(scope.showConditionSearchPanel).toBe(true);
      expect(scope.activatedHiddenAreas.conditionsCodeSearch).toBe(true);
    });

    it('should close onditions panel', function () {
      scope.showConditionSearchPanel = true;
      scope.hideConditionSearch();
      expect(scope.showConditionSearchPanel).toBe(false);
    });

    it('should open modal window with selected condition details', function () {
      expect(scope.modalIsOpen).toBe(false);
      scope.openConditionCrudModal(conditionsMockResponse.Value[0]);
      expect(scope.modalIsOpen).toBe(true);
    });

    it('should close modal window when condition save is success', function () {
      scope.modalIsOpen = true;
      ctrl.successHandler();
      expect(scope.modalIsOpen).toBe(false);
    });

    it('should close options modal when all conditions button is clicked', function () {
      scope.activatedHiddenAreas.actionsPanel = true;
      scope.activateConditionSearch();
      expect(scope.activatedHiddenAreas.actionsPanel).toBe(false);
    });
  });

  describe('saveExam method -> ', function () {
    it('should set state to SaveComplete if completeExam is true', function () {
      scope.saveExam(true);
      expect(scope.completeExam).toBe(true);
      expect(patientPerioExamFactory.setExamState).toHaveBeenCalledWith(
        examStateMock.SaveComplete
      );
    });

    it('should set state to Save if completeExam is false', function () {
      scope.saveExam(false);
      expect(scope.completeExam).toBe(false);
      expect(patientPerioExamFactory.setExamState).toHaveBeenCalledWith(
        examStateMock.Save
      );
    });
  });

  describe('cancelExam method -> ', function () {
    it('should set state to Cancel', function () {
      scope.cancelExam();
      expect(patientPerioExamFactory.setExamState).toHaveBeenCalledWith(
        examStateMock.Cancel
      );
    });
  });

  describe('closePerioOptionMenu method -> ', function () {
    it('should set perioOptActive to true', function () {
      scope.closePerioOptionMenu();
      expect(scope.perioOptActive).toBe(true);
    });
  });

  describe('perioPathUpdated method -> ', function () {
    beforeEach(function () {
      scope.perioPaths = [{ Name: 'test' }];
    });

    it('should set selectedPerioPath to matching name from perioPaths', function () {
      scope.perioPathUpdated('test');

      expect(scope.selectedPerioPath).toEqual({ Name: 'test' });
      expect(patientPerioExamFactory.setActiveExamPath).toHaveBeenCalledWith(
        scope.perioPaths[0]
      );
    });

    it('should call patientPerioExamFactory.setActiveExamPath with matching perio path', function () {
      scope.perioPathUpdated('test');
      expect(patientPerioExamFactory.setActiveExamPath).toHaveBeenCalledWith(
        scope.perioPaths[0]
      );
    });
  });

  describe('updatePerioHeaders method -> ', function () {
    it('should filter the exams to remove deleted exams', function () {
      scope.perioExamHeaders = [];
      var list = angular.copy(perioExamHeadersMock);
      scope.updatePerioHeaders(list);
      expect(scope.perioExamHeaders.length).toEqual(3);
    });

    it('should order exams by exam date', function () {
      var list = angular.copy(perioExamHeadersMock);
      scope.updatePerioHeaders(list);
      expect(scope.perioExamHeaders[0].ExamDate).toEqual('2017-02-05');
    });

    it('should call ctrl.setSelectedExamId', function () {
      var list = angular.copy(perioExamHeadersMock);
      spyOn(ctrl, 'setSelectedExamId');
      scope.updatePerioHeaders(list);
      expect(ctrl.setSelectedExamId).toHaveBeenCalled();
    });

    it('should set selectedExam ExamId', function () {
      var list = angular.copy(perioExamHeadersMock);
      scope.updatePerioHeaders(list);
      expect(scope.selectedExam.ExamId).toBe(scope.perioExamHeaders[0].ExamId);
    });

    it('should set selectedExam to { ExamId: null } if it is null', function () {
      scope.selectedExam = null;
      var list = angular.copy(perioExamHeadersMock);
      scope.updatePerioHeaders(list);
      expect(scope.selectedExam.ExamId).toBe(scope.perioExamHeaders[0].ExamId);
    });
  });

  describe('ctrl.loadClinicalOverview method -> ', function () {
    it('should call patientServices.ClinicalOverview.get', function () {
      var patientId = 'abcd1234';
      ctrl.loadClinicalOverview(patientId);
      expect(clinicalOverviewFactory.GetClinicalOverview).toHaveBeenCalledWith(
        patientId
      );
    });

    describe('success function ->', function () {
      beforeEach(function () {
        clinicalOverviewFactory.GetClinicalOverview = jasmine
          .createSpy()
          .and.returnValue({
            then: function (cb) {
              cb();
            },
          });
        ctrl.ChartLedgerServicesGetSuccess = jasmine.createSpy();
        ctrl.odontogramGetSuccess = jasmine.createSpy();
        ctrl.loadExamHeaders = jasmine.createSpy();
      });

      it('should set scope.clinicalOverview to result from factory', function () {
        clinicalOverviewFactory.clinicalOverview = { Test: 'overview' };
        ctrl.loadClinicalOverview();
        expect(scope.clinicalOverview).toBe(
          clinicalOverviewFactory.clinicalOverview
        );
      });

      it('should call processing methods', function () {
        var overview = {
          ChartLedger: 'chartledger',
          Odontogram: 'odontogram',
          PerioExamSummaries: 'perioexams',
        };
        clinicalOverviewFactory.clinicalOverview = overview;

        ctrl.loadClinicalOverview();
        expect(ctrl.ChartLedgerServicesGetSuccess).toHaveBeenCalledWith(
          jasmine.objectContaining({ Value: overview.ChartLedger })
        );
        expect(ctrl.odontogramGetSuccess).toHaveBeenCalledWith(
          jasmine.objectContaining({ Value: overview.Odontogram })
        );
        expect(ctrl.loadExamHeaders).toHaveBeenCalledWith(
          overview.PerioExamSummaries
        );
      });
    });
  });

  describe('ctrl.loadExamHeaders method -> ', function () {
    it('should load perioExamHeaders', function () {
      var examHeaders = angular.copy(perioExamHeadersMock);
      ctrl.loadExamHeaders(examHeaders);
      expect(scope.perioExamHeaders.length).toEqual(3);
    });

    it('should order exams by exam date', function () {
      var examHeaders = angular.copy(perioExamHeadersMock);
      ctrl.loadExamHeaders(examHeaders);
      expect(scope.perioExamHeaders[0].ExamDate).toEqual('2017-02-05');
    });
  });

  describe('ctrl.getProvidersSuccess method -> ', function () {
    it('should call  usersFactory.LoadedProviders with providers', function () {
      var res = { Value: [{}, {}, {}, {}] };
      ctrl.getProvidersSuccess(res);
      expect(usersFactory.LoadedProviders).toEqual(res.Value);
    });
  });

  describe('ctrl.getLocations method -> ', function () {
    it('should call referenceDataService.getData', function () {
      ctrl.getLocations();
      expect(referenceDataService.getData).toHaveBeenCalledWith(
        referenceDataService.entityNames.locations
      );
    });
  });

  describe('ctrl.setSelectedExamId method -> ', function () {
    beforeEach(function () {
      scope.perioExamHeaders = _.cloneDeep(perioExamHeadersMock);
    });

    it('should set $scope.selectedExam.ExamId to first perioExamHeaders ExamId if $scope.selectedExam is not null or undefined', function () {
      ctrl.setSelectedExamId();
      expect(scope.selectedExam.ExamId).toEqual(
        scope.perioExamHeaders[0].ExamId
      );
    });

    it('should call patientPerioExamFactory.setSelectedExamId with scope.selectedExam.ExamId if $scope.selectedExam is not null or undefined', function () {
      ctrl.setSelectedExamId();
      expect(patientPerioExamFactory.setSelectedExamId).toHaveBeenCalledWith(
        scope.selectedExam.ExamId
      );
    });

    it('should not set $scope.selectedExam.ExamId if $scope.selectedExam is null or undefined', function () {
      scope.selectedExam = null;
      ctrl.setSelectedExamId();
      expect(scope.selectedExam).toBe(null);
    });

    it('should should call patientPerioExamFactory.setSelectedExamId with null if $scope.selectedExam is null or undefined', function () {
      scope.selectedExam = null;
      ctrl.setSelectedExamId();
      expect(patientPerioExamFactory.setSelectedExamId).toHaveBeenCalledWith(
        null
      );
    });
  });

  describe('ctrl.launchWarningModal function when discardChangesService.currentChangeRegistration.controller is TreatmentPlansReorderController -> ', function () {
    beforeEach(function () {
      spyOn(ctrl, 'clearDiscardChangesService').and.returnValue(true);
      discardChangesService.currentChangeRegistration.hasChanges = true;
      discardChangesService.currentChangeRegistration.controller =
        'TreatmentPlansReorderController';
      scope.selectedTab = 3;
      spyOn(scope, 'activated');
    });

    it('should popup the WarningModal', function (done) {
      ctrl.launchWarningModal(0);
      modalFactory.WarningModal().then(function () {
        return true;
      });
      done();
      expect(modalFactory.WarningModal).toHaveBeenCalled();
    });

    it('should reset clearDiscardChangesService if discardChangesService.currentChangeRegistration.hasChanges is true and WarningModal result is true', function (done) {
      ctrl.launchWarningModal(0);
      modalFactory.WarningModal().then(function () {
        return true;
      });
      done();
      expect(ctrl.clearDiscardChangesService).toHaveBeenCalledWith(
        'TreatmentPlansReorderController'
      );
    });
  });

  describe('ctrl.launchWarningModal function when discardChangesService.currentChangeRegistration.controller is PatientNotesCrudController -> ', function () {
    beforeEach(function () {
      scope.selectedTab = 3;
      spyOn(scope, 'activated');
      spyOn(ctrl, 'clearDiscardChangesService').and.returnValue(true);
    });

    it('should popup the WarningModal', function (done) {
      ctrl.launchWarningModal(0);
      modalFactory.WarningModal().then(function () {
        return true;
      });
      done();
      expect(modalFactory.WarningModal).toHaveBeenCalled();
    });

    it('should reset discardChangesService if discardChangesService.currentChangeRegistration.hasChanges is true and WarningModal result is true', function (done) {
      ctrl.launchWarningModal(0);
      modalFactory.WarningModal().then(function () {
        return true;
      });
      done();
      expect(ctrl.clearDiscardChangesService).toHaveBeenCalledWith(
        'PatientNotesCrudController'
      );
    });

    it('should reset ActiveNoteTemplate to null if ctrl.clearDiscardChangesService returns true ', function (done) {
      ctrl.launchWarningModal(0);
      modalFactory.WarningModal().then(function () {
        return true;
      });
      done();
      expect(ctrl.clearDiscardChangesService).toHaveBeenCalledWith(
        'PatientNotesCrudController'
      );
      expect(patientNotesFactory.DataChanged).toBe(false);
      expect(
        noteTemplatesHttpService.SetActiveNoteTemplate
      ).toHaveBeenCalledWith(null);
    });

    it(
      'should reset ActiveNoteTemplate to null if discardChangesService.currentChangeRegistration.hasChanges is true ' +
        ' and WarningModal result is true',
      function (done) {
        ctrl.launchWarningModal(0);
        modalFactory.WarningModal().then(function () {
          return true;
        });
        done();
        expect(ctrl.clearDiscardChangesService).toHaveBeenCalledWith(
          'PatientNotesCrudController'
        );
        expect(
          noteTemplatesHttpService.SetActiveNoteTemplate
        ).toHaveBeenCalledWith(null);
        expect(patientNotesFactory.setEditMode).toHaveBeenCalledWith(false);
      }
    );

    it(
      'should reset patientNotesFactory.DataChanged to false if discardChangesService.currentChangeRegistration.hasChanges is true ' +
        ' and WarningModal result is true',
      function (done) {
        ctrl.launchWarningModal(0);
        modalFactory.WarningModal().then(function () {
          return true;
        });
        done();
        expect(patientNotesFactory.DataChanged).toBe(false);
      }
    );

    it('should call scope.activated with scope.selectedTab if user chooses to discard their changes', function (done) {
      ctrl.launchWarningModal(0);
      modalFactory.WarningModal().then(function () {
        return true;
      });
      done();
      expect(scope.activated).toHaveBeenCalledWith(scope.selectedTab);
    });

    it('should reset treatmentPlanFactory and patientNotesFactory properties if user chooses to discard their changes and tab is 0', function (done) {
      ctrl.launchWarningModal(0);
      modalFactory.WarningModal().then(function () {
        return true;
      });
      done();
      expect(treatmentPlansFactory.SetDataChanged).toHaveBeenCalledWith(false);
      expect(treatmentPlansFactory.SetActiveTreatmentPlan).toHaveBeenCalledWith(
        null
      );
      expect(patientNotesFactory.setActiveNote).toHaveBeenCalledWith(null);
      expect(treatmentPlansFactory.CollapseAll).toHaveBeenCalled();
      expect(scope.viewSettings.expandView).toBe(false);
    });

    it('should reset treatmentPlanFactory and patientNotesFactory properties if user chooses to discard their changes and tab is 2', function (done) {
      ctrl.launchWarningModal(2);
      modalFactory.WarningModal().then(function () {
        return true;
      });
      done();
      expect(treatmentPlansFactory.SetDataChanged).toHaveBeenCalledWith(false);
      expect(treatmentPlansFactory.SetActiveTreatmentPlan).toHaveBeenCalledWith(
        null
      );
      expect(treatmentPlansFactory.SetNewTreatmentPlan).toHaveBeenCalledWith(
        null
      );
      expect(treatmentPlansFactory.SetEditing).toHaveBeenCalledWith(false);
      expect(treatmentPlansFactory.CollapseAll).toHaveBeenCalled();
      expect(scope.viewSettings.expandView).toBe(false);
    });

    it('should reset patientNotesFactory properties if user chooses to discard their changes and tab is 3', function (done) {
      ctrl.launchWarningModal(3);
      modalFactory.WarningModal().then(function () {
        return true;
      });
      done();
      expect(patientNotesFactory.setActiveNote).toHaveBeenCalledWith(null);
      expect(patientNotesFactory.setEditMode).toHaveBeenCalledWith(false);
      expect(scope.viewSettings.expandView).toBe(false);
    });

    it('should reset patientNotesFactory properties if user chooses not to discard their changes and tab is perio', function (done) {
      boolValue = false;
      spyOn(scope, 'activateTab');
      ctrl.launchWarningModal('perio');
      modalFactory.WarningModal().then(function () {
        return false;
      });
      done();
      expect(scope.activateTab).toHaveBeenCalledWith(3);
    });

    it('should reset patientNotesFactory properties if user chooses not to discard their changes and tab is not perio', function (done) {
      boolValue = false;
      spyOn(scope, 'activateTab');
      ctrl.launchWarningModal('3');
      modalFactory.WarningModal().then(function () {
        return false;
      });
      done();
      expect(scope.activated).toHaveBeenCalledWith('3');
    });
  });

  describe('scope.setActiveTab function -> ', function () {
    beforeEach(function () {
      scope.selectedTab = 3;
    });

    it('should set scope.selectedTab', function () {
      scope.setActiveTab(2);
      expect(scope.selectedTab).toBe(2);
    });
  });

  describe('scope.activated function -> ', function () {
    beforeEach(function () {
      scope.activeSubTab = 0;
    });

    it('should set scope.selectedTab', function () {
      scope.activated(3);
      expect(scope.activeSubTab).toBe(3);
    });

    it('should set scope.subTabs.timelineActive based on activeTab = 0', function () {
      scope.subTabs.timelineActive = false;
      scope.activated(0);
      expect(scope.subTabs.timelineActive).toBe(true);
      scope.activated(3);
      expect(scope.subTabs.timelineActive).toBe(false);
    });
  });

  describe('scope.deselected function always -> ', function () {
    var $event;
    beforeEach(function () {
      $event = { preventDefault: jasmine.createSpy() };
      spyOn(ctrl, 'launchWarningModal').and.callFake(function () {});
      scope.activeSubTab = 2;
      scope.activatedHiddenAreas.actionsPanel = true;
      spyOn(ctrl, 'checkDiscardChangesService').and.returnValue(true);
    });

    it('should always set scope.activatedHiddenAreas.actionsPanel to false when deselecting tab', function () {
      scope.activatedHiddenAreas.actionsPanel = true;
      scope.deselected($event, 0);
      expect(scope.activatedHiddenAreas.actionsPanel).toBe(false);

      scope.activatedHiddenAreas.actionsPanel = true;
      scope.deselected($event, 1);
      expect(scope.activatedHiddenAreas.actionsPanel).toBe(false);

      scope.activatedHiddenAreas.actionsPanel = true;
      scope.deselected($event, 2);
      expect(scope.activatedHiddenAreas.actionsPanel).toBe(false);
    });
  });

  describe('scope.deselected function -> ', function () {
    var $event;
    beforeEach(function () {
      $event = { preventDefault: jasmine.createSpy() };
      spyOn(ctrl, 'launchWarningModal').and.callFake(function () {});
      scope.activeSubTab = 2;
      spyOn(ctrl, 'checkDiscardChangesService').and.returnValue(true);
    });

    it('should set activatedHiddenAreas.actionsPanel to false when it is null or undefined', function () {
      scope.deselected($event, 0);
      expect(scope.activatedHiddenAreas.actionsPanel).toBe(false);
    });
  });

  describe('scope.deselected function when paramater is 0 and ctrl.checkDiscardChangesService returns true -> ', function () {
    var $event;
    var index;
    beforeEach(function () {
      index = 0;
      $event = { preventDefault: jasmine.createSpy() };

      spyOn(ctrl, 'launchWarningModal').and.callFake(function () {});
      scope.activeSubTab = 2;
    });
    it('should call event.preventDefault if ctrl.checkDiscardChangesService returns true and parameter is PatientNotesCrudController ', function () {
      spyOn(ctrl, 'checkDiscardChangesService').and.returnValue(true);
      scope.deselected($event, index);
      expect($event.preventDefault).toHaveBeenCalled();
    });

    it('should call ctrl.launchWarningModal if discardChangesService.currentChangeRegistration.hasChanges is true ', function () {
      spyOn(ctrl, 'checkDiscardChangesService').and.returnValue(true);
      scope.deselected($event, 0);
      expect(ctrl.launchWarningModal).toHaveBeenCalledWith(index);
    });

    it(
      'should not call event.preventDefault if discardChangesService.currentChangeRegistration.hasChanges is false ' +
        'and discardChangesService.currentChangeRegistration.hasChanges is false ',
      function () {
        spyOn(ctrl, 'checkDiscardChangesService').and.returnValue(false);
        scope.deselected($event, index);
        expect($event.preventDefault).not.toHaveBeenCalled();
      }
    );

    it(
      'should call patientNotesFactory.setActiveNote with null if discardChangesService.currentChangeRegistration.hasChanges is false ' +
        'and discardChangesService.currentChangeRegistration.hasChanges is false ',
      function () {
        spyOn(ctrl, 'checkDiscardChangesService').and.returnValue(false);
        scope.deselected($event, index);
        expect(patientNotesFactory.setActiveNote).toHaveBeenCalledWith(null);
      }
    );

    it(
      'should call ctrl.launchWarningModal if treatmentPlansFactory.DataChanged is true and scope.activeSubTab is 2 or 3 ' +
        'and discardChangesService.currentChangeRegistration.hasChanges is false ',
      function () {
        spyOn(ctrl, 'checkDiscardChangesService').and.returnValue(false);
        scope.activeSubTab = 2;
        treatmentPlansFactory.DataChanged = true;
        scope.deselected($event, index);
        expect(ctrl.launchWarningModal).toHaveBeenCalledWith(0);
      }
    );

    it(
      'should not call ctrl.launchWarningModal if treatmentPlansFactory.DataChanged is false' +
        'and discardChangesService.currentChangeRegistration.hasChanges is false ',
      function () {
        spyOn(ctrl, 'checkDiscardChangesService').and.returnValue(false);
        treatmentPlansFactory.DataChanged = false;
        scope.deselected($event, index);
        expect(ctrl.launchWarningModal).not.toHaveBeenCalledWith(0);
      }
    );

    it(
      'should reset treatmentPlansFactory properties if DataChanged is false' +
        'and discardChangesService.currentChangeRegistration.hasChanges is false ',
      function () {
        spyOn(ctrl, 'checkDiscardChangesService').and.returnValue(false);
        treatmentPlansFactory.DataChanged = false;
        scope.deselected($event, index);
        expect(ctrl.launchWarningModal).not.toHaveBeenCalledWith(index);
      }
    );

    it(
      'should call ctrl.launchWarningModal if treatmentPlansFactory.DataChanged is true and scope.activeSubTab is 0 or 3 and scope.toTxPlanTab is false ' +
        'and discardChangesService.currentChangeRegistration.hasChanges is false ',
      function () {
        treatmentPlansFactory.DataChanged = false;
        scope.activeSubTab = 0;
        spyOn(ctrl, 'checkDiscardChangesService').and.returnValue(false);
        scope.toTxPlanTab = false;
        scope.deselected($event, 0);
        expect(treatmentPlansFactory.SetDataChanged).toHaveBeenCalledWith(
          false
        );
        expect(
          treatmentPlansFactory.SetActiveTreatmentPlan
        ).toHaveBeenCalledWith(null);
        expect(treatmentPlansFactory.CollapseAll).toHaveBeenCalled();
        expect(scope.viewSettings.expandView).toBe(false);
      }
    );
  });

  describe('scope.deselected function when paramater is 1 -> ', function () {
    var $event;
    var index;
    beforeEach(function () {
      index = 1;
      $event = { preventDefault: jasmine.createSpy() };

      spyOn(ctrl, 'launchWarningModal').and.callFake(function () {});
      scope.activeSubTab = 2;
    });

    it('should call event.preventDefault if checkDiscardChangesService returns true ', function () {
      spyOn(ctrl, 'checkDiscardChangesService').and.returnValue(true);
      scope.deselected($event, index);
      expect($event.preventDefault).toHaveBeenCalled();
    });

    it('should call ctrl.launchWarningModal if checkDiscardChangesService returns true ', function () {
      spyOn(ctrl, 'checkDiscardChangesService').and.returnValue(true);
      scope.deselected($event, index);
      expect(ctrl.launchWarningModal).toHaveBeenCalledWith(index);
    });

    it('should not call event.preventDefault if checkDiscardChangesService returns false ', function () {
      spyOn(ctrl, 'checkDiscardChangesService').and.returnValue(false);
      scope.deselected($event, index);
      expect($event.preventDefault).not.toHaveBeenCalled();
    });

    it(
      'should not call ctrl.launchWarningModal if treatmentPlansFactory.DataChanged is true' +
        'and checkDiscardChangesService returns false ',
      function () {
        spyOn(ctrl, 'checkDiscardChangesService').and.returnValue(false);
        treatmentPlansFactory.DataChanged = true;
        scope.deselected($event, index);
        expect(ctrl.launchWarningModal).not.toHaveBeenCalled();
      }
    );
  });

  describe('scope.deselected function when paramater is 1 -> ', function () {
    var $event;
    var index;
    beforeEach(function () {
      index = 1;
      $event = { preventDefault: jasmine.createSpy() };
      spyOn(ctrl, 'launchWarningModal').and.callFake(function () {});
      scope.activeSubTab = 2;
    });

    it('should call event.preventDefault if checkDiscardChangesService returns true ', function () {
      spyOn(ctrl, 'checkDiscardChangesService').and.returnValue(true);
      scope.deselected($event, index);
      expect($event.preventDefault).toHaveBeenCalled();
    });

    it('should call ctrl.launchWarningModal if checkDiscardChangesService returns true ', function () {
      spyOn(ctrl, 'checkDiscardChangesService').and.returnValue(true);
      scope.deselected($event, index);
      expect(ctrl.launchWarningModal).toHaveBeenCalledWith(index);
    });

    it('should not call event.preventDefault if checkDiscardChangesService returns false ', function () {
      spyOn(ctrl, 'checkDiscardChangesService').and.returnValue(false);
      scope.deselected($event, index);
      expect($event.preventDefault).not.toHaveBeenCalled();
    });

    it(
      'should not call ctrl.launchWarningModal if treatmentPlansFactory.DataChanged is true' +
        'and checkDiscardChangesService returns false ',
      function () {
        spyOn(ctrl, 'checkDiscardChangesService').and.returnValue(false);
        treatmentPlansFactory.DataChanged = true;
        scope.deselected($event, index);
        expect(ctrl.launchWarningModal).not.toHaveBeenCalled();
      }
    );
  });

  describe('scope.deselected function when paramater is 2 -> ', function () {
    var $event;
    var index;
    beforeEach(function () {
      index = 2;
      $event = { preventDefault: jasmine.createSpy() };
      spyOn(ctrl, 'launchWarningModal').and.callFake(function () {});
      scope.activeSubTab = 2;
    });

    it('should call event.preventDefault if  checkDiscardChangesService returns  true ', function () {
      spyOn(ctrl, 'checkDiscardChangesService').and.returnValue(true);
      scope.deselected($event, index);
      expect($event.preventDefault).toHaveBeenCalled();
    });

    it('should call ctrl.launchWarningModal if  checkDiscardChangesService returns  true ', function () {
      spyOn(ctrl, 'checkDiscardChangesService').and.returnValue(true);
      scope.deselected($event, index);
      expect(ctrl.launchWarningModal).toHaveBeenCalledWith(index);
    });

    it('should not call event.preventDefault if  checkDiscardChangesService returns  false ', function () {
      spyOn(ctrl, 'checkDiscardChangesService').and.returnValue(false);
      scope.deselected($event, index);
      expect($event.preventDefault).not.toHaveBeenCalled();
    });

    it(
      'should not call ctrl.launchWarningModal if treatmentPlansFactory.DataChanged is true' +
        'and  checkDiscardChangesService returns  false ',
      function () {
        spyOn(ctrl, 'checkDiscardChangesService').and.returnValue(false);
        treatmentPlansFactory.DataChanged = true;
        scope.deselected($event, index);
        expect(ctrl.launchWarningModal).not.toHaveBeenCalled();
      }
    );
  });

  describe('scope.deselected function when paramater is 3 -> ', function () {
    var $event;
    var index;
    beforeEach(function () {
      index = 3;
      $event = { preventDefault: jasmine.createSpy() };
      spyOn(ctrl, 'launchWarningModal').and.callFake(function () {});
      scope.activeSubTab = 3;
    });

    it('should call event.preventDefault if  checkDiscardChangesService returns  true ', function () {
      spyOn(ctrl, 'checkDiscardChangesService').and.returnValue(true);
      scope.deselected($event, index);
      expect($event.preventDefault).toHaveBeenCalled();
    });

    it('should call ctrl.launchWarningModal if  checkDiscardChangesService returns  true ', function () {
      spyOn(ctrl, 'checkDiscardChangesService').and.returnValue(true);
      scope.deselected($event, index);
      expect(ctrl.launchWarningModal).toHaveBeenCalledWith(index);
    });

    it('should not call event.preventDefault if  checkDiscardChangesService returns  false ', function () {
      spyOn(ctrl, 'checkDiscardChangesService').and.returnValue(false);
      scope.deselected($event, index);
      expect($event.preventDefault).not.toHaveBeenCalled();
    });

    it('should reset patientNotesFactory.setActiveNote to null if patientNotesFactory.DataChanged is false and noteTemplatesHttpService.ActiveNoteTemplate is null', function () {
      spyOn(ctrl, 'checkDiscardChangesService').and.returnValue(false);
      patientNotesFactory.DataChanged = false;
      noteTemplatesHttpService.ActiveNoteTemplate = null;
      scope.deselected($event, index);
      expect(patientNotesFactory.setActiveNote).toHaveBeenCalledWith(null);
      expect(scope.viewSettings.expandView).toBe(false);
    });
  });

  describe('ctrl.setSubTabs function ->', function () {
    beforeEach(function () {
      scope.viewSettings.expandView = true;
      scope.viewSettings.activeExpand = -1;
      treatmentPlansFactory.SetActiveTreatmentPlan = jasmine.createSpy();
      treatmentPlansFactory.CollapseAll = jasmine.createSpy();
      scope.subTabs = null;
      scope.loadTimeline = null;
      scope.currentDrawer = 1;
    });

    it('should set correct values when index is 0', function () {
      ctrl.setSubTabs(0);

      expect(scope.viewSettings.expandView).toBe(true);
      expect(scope.viewSettings.activeExpand).toBe(-1);
      expect(
        treatmentPlansFactory.SetActiveTreatmentPlan
      ).not.toHaveBeenCalled();
      expect(treatmentPlansFactory.CollapseAll).not.toHaveBeenCalled();
      expect(scope.subTabs).toEqual({
        favoritesActive: false,
        timelineActive: false,
        txPlansActive: false,
        notesActive: false,
        patientInfo: true,
        referralActive: false,
      });
      expect(scope.loadTimeline).toBe(null);
    });

    it('should set correct values when index is 1', function () {
      ctrl.setSubTabs(1);

      expect(scope.viewSettings.expandView).toBe(true);
      expect(scope.viewSettings.activeExpand).toBe(-1);
      expect(
        treatmentPlansFactory.SetActiveTreatmentPlan
      ).not.toHaveBeenCalled();
      expect(treatmentPlansFactory.CollapseAll).not.toHaveBeenCalled();
      expect(scope.subTabs).toEqual({
        favoritesActive: false,
        timelineActive: true,
        txPlansActive: false,
        notesActive: false,
        patientInfo: false,
        referralActive: false,
      });
      expect(scope.currentDrawer).toBe(1);
      expect(scope.loadTimeline).toBe(true);
    });

    it('should set correct values when index is 2', function () {
      scope.viewSettings.expandView = true;
      ctrl.setSubTabs(2);

      expect(scope.viewSettings.expandView).toBe(false);
      expect(scope.viewSettings.activeExpand).toBe(0);
      expect(treatmentPlansFactory.SetActiveTreatmentPlan).toHaveBeenCalled();
      expect(treatmentPlansFactory.CollapseAll).toHaveBeenCalled();
      expect(scope.subTabs).toEqual({
        favoritesActive: true,
        timelineActive: false,
        txPlansActive: false,
        notesActive: false,
        patientInfo: false,
        referralActive: false,
      });
      expect(scope.currentDrawer).toBe(2);
      expect(scope.loadTimeline).toBe(null);
    });

    it('should set correct values when index is 3', function () {
      ctrl.setSubTabs(3);

      expect(scope.viewSettings.expandView).toBe(true);
      expect(scope.viewSettings.activeExpand).toBe(-1);
      expect(
        treatmentPlansFactory.SetActiveTreatmentPlan
      ).not.toHaveBeenCalled();
      expect(treatmentPlansFactory.CollapseAll).not.toHaveBeenCalled();
      expect(scope.subTabs).toEqual({
        favoritesActive: false,
        timelineActive: false,
        txPlansActive: true,
        notesActive: false,
        patientInfo: false,
        referralActive: false,
      });
      expect(scope.currentDrawer).toBe(3);
      expect(scope.loadTimeline).toBe(null);
    });

    it('should set correct values when index is 4', function () {
      ctrl.setSubTabs(4);

      expect(scope.viewSettings.expandView).toBe(true);
      expect(scope.viewSettings.activeExpand).toBe(-1);
      expect(
        treatmentPlansFactory.SetActiveTreatmentPlan
      ).not.toHaveBeenCalled();
      expect(treatmentPlansFactory.CollapseAll).not.toHaveBeenCalled();
      expect(scope.subTabs).toEqual({
        favoritesActive: false,
        timelineActive: false,
        txPlansActive: false,
        notesActive: true,
        patientInfo: false,
        referralActive: false
      });
      expect(scope.currentDrawer).toBe(4);
      expect(scope.loadTimeline).toBe(null);
    });
  });

  describe('scope.selectedExamChanged method -> ', function () {
    it('should call setSelectedExamId with passed value and call scope digest', function () {
      patientPerioExamFactory.setSelectedExamId = jasmine.createSpy();
      scope.$digest = jasmine.createSpy();

      scope.selectedExamChanged('test');

      expect(patientPerioExamFactory.setSelectedExamId).toHaveBeenCalledWith(
        'test'
      );
      expect(scope.$digest).toHaveBeenCalled();
    });
  });

  describe('ctrl.clearDiscardChangesService method -> ', function () {
    it('should return true if controllerName parameter matches discardChangesService.currentChangeRegistration.controller and hasChanges is true ', function () {
      discardChangesService.currentChangeRegistration.hasChanges = true;
      discardChangesService.currentChangeRegistration.controller =
        'TreatmentPlansReorderController';
      expect(
        ctrl.clearDiscardChangesService('TreatmentPlansReorderController')
      ).toBe(true);
      expect(discardChangesService.currentChangeRegistration.hasChanges).toBe(
        false
      );
    });

    it('should return false if controllerName parameter does not match discardChangesService.currentChangeRegistration.controller or hasChanges is false', function () {
      discardChangesService.currentChangeRegistration.hasChanges = true;
      discardChangesService.currentChangeRegistration.controller =
        'PatientNotesCrudController';
      expect(
        ctrl.clearDiscardChangesService('TreatmentPlansReorderController')
      ).toBe(false);
      expect(discardChangesService.currentChangeRegistration.hasChanges).toBe(
        true
      );
    });

    it('should set discardChangesService.currentChangeRegistration.hasChanges to false if controllerName parameter matches discardChangesService.currentChangeRegistration.controller and hasChanges is true ', function () {
      discardChangesService.currentChangeRegistration.hasChanges = true;
      discardChangesService.currentChangeRegistration.controller =
        'TreatmentPlansReorderController';
      expect(
        ctrl.clearDiscardChangesService('TreatmentPlansReorderController')
      ).toBe(true);
      expect(discardChangesService.currentChangeRegistration.hasChanges).toBe(
        false
      );
    });
  });

  describe('ctrl.checkDiscardChangesService method -> ', function () {
    it('should return true if controllerName parameter matches discardChangesService.currentChangeRegistration.controller and hasChanges is true ', function () {
      discardChangesService.currentChangeRegistration.hasChanges = true;
      discardChangesService.currentChangeRegistration.controller =
        'TreatmentPlansReorderController';
      expect(
        ctrl.checkDiscardChangesService('TreatmentPlansReorderController')
      ).toBe(true);
    });

    it('should return false if controllerName parameter does not match discardChangesService.currentChangeRegistration.controller or hasChanges is false', function () {
      discardChangesService.currentChangeRegistration.hasChanges = true;
      discardChangesService.currentChangeRegistration.controller =
        'PatientNotesCrudController';
      expect(
        ctrl.checkDiscardChangesService('TreatmentPlansReorderController')
      ).toBe(false);
    });
  });

  describe('ctrl.setImagingOptions method -> ', function () {
    beforeEach(function () {
      scope.imagingProviders = [
        { name: 'XVWeb', provider: imagingProviders.Apteryx2 },
        { name: 'XVWeb', provider: imagingProviders.Sidexis },
      ];
      scope.showImagingDropdown = false;
      scope.showImagingTab = true;
      scope.selectedImagingProvider = '';
    });

    it('should scope.showImagingDropdown to be false and scope.showImagingTab to be true if one provider and provider is Apteryx2', function () {
      scope.imagingProviders = [
        { name: 'XVWeb', provider: imagingProviders.Apteryx2 },
      ];
      ctrl.setImagingOptions();
      expect(scope.showImagingDropdown).toBe(false);
      expect(scope.showImagingTab).toBe(true);
      expect(scope.selectedImagingProvider).toBe(imagingProviders.Apteryx2);
    });

    it('should scope.showImagingDropdown to be false and scope.showImagingTab to be true if one provider and provider is Apteryx', function () {
      scope.imagingProviders = [
        { name: 'XVWeb', provider: imagingProviders.Apteryx },
      ];
      ctrl.setImagingOptions();
      expect(scope.showImagingDropdown).toBe(false);
      expect(scope.showImagingTab).toBe(true);
      expect(scope.selectedImagingProvider).toBe(imagingProviders.Apteryx);
    });

    it('should scope.showImagingDropdown to be false and scope.showImagingTab to be true if one provider and provider is BlueImaging', function () {
      scope.imagingProviders = [
        { name: 'Blue', provider: imagingProviders.Blue },
      ];
      ctrl.setImagingOptions();
      expect(scope.showImagingDropdown).toBe(false);
      expect(scope.showImagingTab).toBe(true);
      expect(scope.selectedImagingProvider).toBe(imagingProviders.Blue);
    });

    it('should scope.showImagingDropdown to be true and scope.showImagingTab to be false if one provider and provider is Sidexis', function () {
      scope.imagingProviders = [
        { name: 'Sidexis', provider: imagingProviders.Sidexis },
      ];
      ctrl.setImagingOptions();
      expect(scope.showImagingDropdown).toBe(true);
      expect(scope.showImagingTab).toBe(false);
      expect(scope.selectedImagingProvider).toBe(imagingProviders.Sidexis);
    });

    it('should scope.showImagingDropdown to be true and scope.showImagingTab to be false if more than one provider', function () {
      ctrl.setImagingOptions();
      expect(scope.showImagingDropdown).toBe(true);
      expect(scope.showImagingTab).toBe(false);
      expect(scope.selectedImagingProvider).toBe('');
    });

    it('should scope.showImagingDropdown to be false and scope.showImagingTab to be true if no providers', function () {
      scope.imagingProviders = [];
      ctrl.setImagingOptions();
      expect(scope.showImagingDropdown).toBe(false);
      expect(scope.showImagingTab).toBe(true);
      expect(scope.selectedImagingProvider).toBe('');
    });
  });

  describe('ctrl.getImagingOptions function ->', function () {
    beforeEach(function () {
      scope.showImagingDropdown = true;

      imagingMasterService.getServiceStatus = jasmine
        .createSpy()
        .and.returnValue({ then: () => {} });
    });

    it('should set scope.showImagingDropdown and call imagingMasterService.getServiceStatus', function () {
      ctrl.getImagingOptions();

      expect(scope.showImagingDropdown).toBe(false);
      expect(imagingMasterService.getServiceStatus).toHaveBeenCalled();
    });

    describe('getServiceStatus callback ->', function () {
      var result;
      beforeEach(function () {
        result = {};
        imagingMasterService.getServiceStatus = jasmine
          .createSpy()
          .and.returnValue({ then: cb => cb(result) });

        scope.availableImagingProviders = null;
        ctrl.setImagingOptions = jasmine.createSpy();
        scope.imagingProviders = [];
      });

      it('should set scope.availableImagingProviders and call ctrl.setImagingOptions', function () {
        ctrl.getImagingOptions();

        expect(scope.availableImagingProviders).toBe(result);
        expect(ctrl.setImagingOptions).toHaveBeenCalled();
      });

      it('should not add blue if res.blue is null', function () {
        result.blue = null;

        ctrl.getImagingOptions();

        expect(scope.imagingProviders.length).toBe(0);
      });

      it('should not add blue if res.blue.status is not ready', function () {
        result.blue = { status: 'error' };

        ctrl.getImagingOptions();

        expect(scope.imagingProviders.length).toBe(0);
      });

      it('should add blue if res.blue.status is ready', function () {
        result.blue = { status: 'ready' };

        ctrl.getImagingOptions();

        expect(scope.imagingProviders.length).toBe(1);
        expect(scope.imagingProviders[0]).toEqual({
          name: 'Blue Imaging',
          provider: imagingProviders.Blue,
        });
      });

      it('should not add apteryx if res.apteryx is null', function () {
        result.apteryx = null;

        ctrl.getImagingOptions();

        expect(scope.imagingProviders.length).toBe(0);
      });

      it('should not add apteryx if res.apteryx.status is not ready', function () {
        result.apteryx = { status: 'error' };

        ctrl.getImagingOptions();

        expect(scope.imagingProviders.length).toBe(0);
      });

      it('should add apteryx if res.apteryx.status is ready', function () {
        result.apteryx = { status: 'ready' };

        ctrl.getImagingOptions();

        expect(scope.imagingProviders.length).toBe(1);
        expect(scope.imagingProviders[0]).toEqual({
          name: 'XVWeb',
          provider: imagingProviders.Apteryx,
        });
      });

      it('should not add apteryx2 if res.apteryx2 is null', function () {
        result.apteryx2 = null;

        ctrl.getImagingOptions();

        expect(scope.imagingProviders.length).toBe(0);
      });

      it('should not add apteryx2 if res.apteryx2.status is not ready', function () {
        result.apteryx2 = { status: 'error' };

        ctrl.getImagingOptions();

        expect(scope.imagingProviders.length).toBe(0);
      });

      it('should add apteryx2 if res.apteryx2.status is ready', function () {
        result.apteryx2 = { status: 'ready' };

        ctrl.getImagingOptions();

        expect(scope.imagingProviders.length).toBe(1);
        expect(scope.imagingProviders[0]).toEqual({
          name: 'XVWeb',
          provider: imagingProviders.Apteryx2,
        });
      });

      it('should not add sidexis if res.sidex is null', function () {
        result.sidexis = null;

        ctrl.getImagingOptions();

        expect(scope.imagingProviders.length).toBe(0);
      });

      it('should add sidexis if res.sidexis.status is ready', function () {
        result.sidexis = { status: 'ready' };

        ctrl.getImagingOptions();

        expect(scope.imagingProviders.length).toBe(1);
        expect(scope.imagingProviders[0]).toEqual({
          name: 'Sidexis',
          provider: imagingProviders.Sidexis,
        });
      });

      it('should add sidexis if res.sidexis.status is error', function () {
        result.sidexis = { status: 'error' };

        ctrl.getImagingOptions();

        expect(scope.imagingProviders.length).toBe(1);
        expect(scope.imagingProviders[0]).toEqual({
          name: 'Sidexis',
          provider: imagingProviders.Sidexis,
          error: true,
          message: 'Sidexis not available.',
        });
      });
    });
  });

  describe('ctrl.launchSidexis function ->', function () {
    var sidexis, patientId, patientInfo;
    beforeEach(function () {
      sidexis = 'sidexisKey';
      patientId = 'fakePatientId';
      patientInfo = {
        ThirdPartyPatientId: 'fakeThirdPartyId',
        LastName: 'fakeLastName',
        FirstName: 'fakeFirstName',
        Sex: 'fakeSex',
        DateOfBirth: 'fakeDoB',
      };

      imagingProviders.Sidexis = sidexis;
      scope.patientId = patientId;
      scope.patientInfo = patientInfo;

      imagingMasterService.getPatientByFusePatientId = jasmine
        .createSpy()
        .and.returnValue({ then: () => {} });
    });

    it('should call imagingMasterService.getPatientByFusePatientId with correct parameters', function () {
      ctrl.launchSidexis();

      expect(
        imagingMasterService.getPatientByFusePatientId
      ).toHaveBeenCalledWith(
        patientId,
        patientInfo.ThirdPartyPatientId,
        sidexis
      );
    });

    describe('getPatientByFusePatientId callback function ->', function () {
      var getPatientResponse;
      beforeEach(function () {
        getPatientResponse = {};
        imagingMasterService.getPatientByFusePatientId = jasmine
          .createSpy()
          .and.returnValue({ then: cb => cb(getPatientResponse.res) });
        imagingMasterService.getUrlForPatientByExternalPatientId = jasmine
          .createSpy()
          .and.returnValue({ then: () => {} });
        imagingMasterService.getUrlForNewPatient = jasmine
          .createSpy()
          .and.returnValue({ then: () => {} });
      });

      it('should do nothing if res is null', function () {
        getPatientResponse.res = null;

        ctrl.launchSidexis();

        expect(imagingMasterService.getUrlForNewPatient).not.toHaveBeenCalled();
        expect(
          imagingMasterService.getUrlForPatientByExternalPatientId
        ).not.toHaveBeenCalled();
      });

      it('should do nothing if res[sidexis] is null', function () {
        getPatientResponse.res = {};

        ctrl.launchSidexis();

        expect(imagingMasterService.getUrlForNewPatient).not.toHaveBeenCalled();
        expect(
          imagingMasterService.getUrlForPatientByExternalPatientId
        ).not.toHaveBeenCalled();
      });

      it('should do nothing if res[sidexis].success is false', function () {
        getPatientResponse.res = {};
        getPatientResponse.res[sidexis] = { success: false };

        ctrl.launchSidexis();

        expect(imagingMasterService.getUrlForNewPatient).not.toHaveBeenCalled();
        expect(
          imagingMasterService.getUrlForPatientByExternalPatientId
        ).not.toHaveBeenCalled();
      });

      describe('when res[sidexis].result.id is not empty ->', function () {
        var sidexisId;
        beforeEach(function () {
          sidexisId = 'fakeSidexisId';
          getPatientResponse.res = {};
          getPatientResponse.res[sidexis] = {
            success: true,
            result: { id: sidexisId },
          };
        });

        it('should call imagingMasterService.getUrlForPatientByExternalPatientId with correct parameters', function () {
          ctrl.launchSidexis();

          expect(
            imagingMasterService.getUrlForNewPatient
          ).not.toHaveBeenCalled();
          expect(
            imagingMasterService.getUrlForPatientByExternalPatientId
          ).toHaveBeenCalledWith(
            sidexisId,
            patientInfo.ThirdPartyPatientId,
            sidexis
          );
        });

        describe('getUrlForPatientByExternalPatientId callback function ->', function () {
          var getUrlForPatientResult;
          beforeEach(function () {
            getUrlForPatientResult = {};
            imagingMasterService.getUrlForPatientByExternalPatientId = jasmine
              .createSpy()
              .and.returnValue({ then: cb => cb(getUrlForPatientResult.res) });
          });

          it('should call $http.get when res.result is not empty', function () {
            var resUrl = 'fakeUrl';
            getUrlForPatientResult.res = { result: resUrl };
            httpBackend.expectGET(resUrl).respond();

            ctrl.launchSidexis();

            httpBackend.flush();
          });

          it('should not call $http.get when res is null', function () {
            getUrlForPatientResult.res = null;

            ctrl.launchSidexis();
          });

          it('should not call $http.get when res.result is null', function () {
            getUrlForPatientResult.res = {};

            ctrl.launchSidexis();
          });
        });
      });

      it('should call imagingMasterService.getUrlForNewPatient with correct parameters when res[sidexis].result is empty', function () {
        getPatientResponse.res = {};
        getPatientResponse.res[sidexis] = {
          success: true,
          result: null,
        };
        var expectedParameter = {
          patientId: patientInfo.ThirdPartyPatientId,
          lastName: patientInfo.LastName,
          firstName: patientInfo.FirstName,
          gender: patientInfo.Sex,
          birthDate: patientInfo.DateOfBirth,
        };

        ctrl.launchSidexis();

        expect(imagingMasterService.getUrlForNewPatient).toHaveBeenCalledWith(
          jasmine.objectContaining(expectedParameter),
          sidexis
        );
        expect(
          imagingMasterService.getUrlForPatientByExternalPatientId
        ).not.toHaveBeenCalled();
      });

      it('should call imagingMasterService.getUrlForNewPatient with correct parameters when res[sidexis].result.id is empty', function () {
        getPatientResponse.res = {};
        getPatientResponse.res[sidexis] = {
          success: true,
          result: {},
        };
        var expectedParameter = {
          patientId: patientInfo.ThirdPartyPatientId,
          lastName: patientInfo.LastName,
          firstName: patientInfo.FirstName,
          gender: patientInfo.Sex,
          birthDate: patientInfo.DateOfBirth,
        };

        ctrl.launchSidexis();

        expect(imagingMasterService.getUrlForNewPatient).toHaveBeenCalledWith(
          jasmine.objectContaining(expectedParameter),
          sidexis
        );
        expect(
          imagingMasterService.getUrlForPatientByExternalPatientId
        ).not.toHaveBeenCalled();
      });

      describe('getUrlForNewPatient callback ->', function () {
        var getUrlResponse;
        beforeEach(function () {
          getUrlResponse = {};
          getPatientResponse.res = {};
          getPatientResponse.res[sidexis] = {
            success: true,
            result: {},
          };
          imagingMasterService.getUrlForNewPatient = jasmine
            .createSpy()
            .and.returnValue({ then: cb => cb(getUrlResponse.res) });
        });

        it('should call $http.get when res.result is not empty', function () {
          var resUrl = 'fakeUrl';
          getUrlResponse.res = { result: resUrl };
          httpBackend.expectGET(resUrl).respond();

          ctrl.launchSidexis();

          httpBackend.flush();
        });

        it('should not call $http.get when res is null', function () {
          getUrlResponse.res = null;

          ctrl.launchSidexis();
        });

        it('should not call $http.get when res.result is null', function () {
          getUrlResponse.res = {};

          ctrl.launchSidexis();
        });
      });
    });
  });

  describe('scope.selectImagingOption method -> ', function () {
    beforeEach(function () {
      scope.showImagingTab = true;
      scope.selectedImagingProvider = '';
      spyOn(ctrl, 'launchSidexis');
      spyOn(scope, 'activateTab');
    });

    it('should take no action if imagingProvider.error is true', function () {
      scope.showImagingTab = false;
      let imagingProvider = {
        name: 'XVWeb',
        provider: 'Apteryx2',
        error: true,
      };
      scope.selectImagingOption(imagingProvider);
      expect(scope.showImagingTab).toBe(false);
      expect(scope.selectedImagingProvider).toBe('');
      expect(scope.activateTab).not.toHaveBeenCalledWith();
    });

    it('should set scope.showImagingTab to true if imagingProvider.name is XVWeb', function () {
      scope.showImagingTab = false;
      let imagingProvider = { name: 'XVWeb', provider: 'Apteryx2' };
      scope.selectImagingOption(imagingProvider);
      expect(scope.showImagingTab).toBe(true);
      expect(scope.selectedImagingProvider).toBe('Apteryx2');
    });

    it('should call activateTab with index of 4 if imagingProvider.name is XVWeb', function () {
      let imagingProvider = { name: 'XVWeb', provider: 'Apteryx2' };
      scope.selectImagingOption(imagingProvider);
      expect(scope.activateTab).toHaveBeenCalledWith(4);
    });

    it('should set scope.showImagingTab to true if imagingProvider.name is Blue', function () {
      scope.showImagingTab = false;
      let imagingProvider = { name: 'Blue Imaging', provider: 'BlueImaging' };
      scope.selectImagingOption(imagingProvider);
      expect(scope.showImagingTab).toBe(true);
      expect(scope.selectedImagingProvider).toBe('BlueImaging');
    });

    it('should call activateTab with index of 4 if imagingProvider.name is Blue', function () {
      let imagingProvider = { name: 'Blue Imaging', provider: 'BlueImaging' };
      scope.selectImagingOption(imagingProvider);
      expect(scope.activateTab).toHaveBeenCalledWith(4);
    });

    it('should set scope.showImagingTab to true if imagingProvider.name is Sidexis', function () {
      let imagingProvider = { name: 'Sidexis', provider: 'Sidexis' };
      scope.selectImagingOption(imagingProvider);
      expect(ctrl.launchSidexis).toHaveBeenCalled();
      expect(scope.showImagingTab).toBe(false);
      expect(scope.selectedImagingProvider).toBe('Sidexis');
    });
  });

  afterEach(function () {
    httpBackend.verifyNoOutstandingExpectation();
    httpBackend.verifyNoOutstandingRequest();
  });

  describe('when $rootscope.$on(close-charting-options-modal) is triggered', function () {
    beforeEach(function () {
      spyOn(rootScope, '$on');
    });

    it('should set $scope.activatedHiddenAreas.actionsPanel = false when close-charting-options-modal is broadcast', function () {
      scope.activatedHiddenAreas.actionsPanel = true;
      rootScope.$broadcast('close-charting-options-modal');
      expect(scope.activatedHiddenAreas.actionsPanel).toEqual(false);
    });
  });

  describe('when $rootscope.$on(patcore:initlocation) is triggered', function () {
    beforeEach(function () {
      spyOn(rootScope, '$on');
      spyOn(ctrl, 'refreshServiceCodes').and.callThrough();
      spyOn(ctrl, 'filterServiceCodes').and.callThrough();
    });

    it('should call refreshServiceCodes and filterServiceCodes', function () {
      scope.activatedHiddenAreas.actionsPanel = true;
      rootScope.$broadcast('patCore:initlocation');
      scope.$apply();
      expect(ctrl.refreshServiceCodes).toHaveBeenCalled();
      expect(ctrl.filterServiceCodes).toHaveBeenCalled();
    });
  });

  describe('ctrl.loadClinicalOverviews method', function () {
    let patientIds = ['1234', '1236'];

    let res = {};
    beforeEach(function () {
      spyOn(scope, 'getPatientChartLedgerServices');
      spyOn(ctrl, 'ChartLedgerServicesGetSuccess');
      res = {
        Value: [
          {
            PatientId: '1234',
            ChartLedger: [{ RecordId: '222' }, { RecordId: '224' }],
            Notes: [{ NoteId: '111' }, { NoteId: '112' }],
          },
          {
            PatientId: '1236',
            ChartLedger: [{ RecordId: '223' }, { RecordId: '225' }],
            Notes: [{ NoteId: '113' }, { NoteId: '114' }, { NoteId: '115' }],
          },
        ],
      };
      patientServices.ClinicalOverviews.getAll = jasmine
        .createSpy('patientServices.ClinicalOverviews.getAll')
        .and.callFake(function () {
          return {
            $promise: {
              then: function (callback) {
                callback(res);
              },
            },
          };
        });
    });

    it('should call patientServices.ClinicalOverviews.getAll with a list of patientIds ', function () {
      patientIds = ['1234', '1236'];
      ctrl.loadClinicalOverviews(patientIds);
      expect(patientServices.ClinicalOverviews.getAll).toHaveBeenCalledWith(
        patientIds
      );
      expect(ctrl.clinicalOverviews).toEqual([
        {
          PatientId: '1234',
          ChartLedger: [{ RecordId: '222' }, { RecordId: '224' }],
          Notes: [{ NoteId: '111' }, { NoteId: '112' }],
        },
        {
          PatientId: '1236',
          ChartLedger: [{ RecordId: '223' }, { RecordId: '225' }],
          Notes: [{ NoteId: '113' }, { NoteId: '114' }, { NoteId: '115' }],
        },
      ]);
    });

    it('should call ctrl.ChartLedgerServicesGetSuccess with new list of ChartLedger records', function () {
      patientIds = ['1234', '1236'];
      ctrl.loadClinicalOverviews(patientIds);
      expect(ctrl.ChartLedgerServicesGetSuccess).toHaveBeenCalledWith({
        Value: [
          { RecordId: '222' },
          { RecordId: '224' },
          { RecordId: '223' },
          { RecordId: '225' },
        ],
      });
    });

    it('should reload scope.clinicalOverview.Notes', function () {
      patientIds = ['1234', '1236'];
      ctrl.loadClinicalOverviews(patientIds);
      expect(scope.clinicalOverview.Notes).toEqual([
        { NoteId: '111' },
        { NoteId: '112' },
        { NoteId: '113' },
        { NoteId: '114' },
        { NoteId: '115' },
      ]);
    });

    it('should call patientNotesFactory.load with new list of notes', function () {
      patientIds = ['1234', '1236'];
      ctrl.loadClinicalOverviews(patientIds);
      expect(patientNotesFactory.load).toHaveBeenCalledWith([
        { NoteId: '111' },
        { NoteId: '112' },
        { NoteId: '113' },
        { NoteId: '114' },
        { NoteId: '115' },
      ]);
    });
  });

  describe('scope.$on(soar:reload-clinical-overview) ->', function () {
    let duplicatePatients = [];
    beforeEach(function () {
      duplicatePatients = ['1234', '1236'];
      spyOn(ctrl, 'loadClinicalOverviews');
    });

    it('should call ctrl.loadClinicalOverviews if duplicatePatients', function () {
      scope.$emit('soar:reload-clinical-overview', duplicatePatients);
      expect(ctrl.loadClinicalOverviews).toHaveBeenCalledWith(
        duplicatePatients
      );
    });

    it('should call scope.getPatientChartLedgerServices if no duplicatePatients', function () {
      scope.$emit('soar:reload-clinical-overview', []);
      expect(ctrl.loadClinicalOverviews).not.toHaveBeenCalledWith(
        duplicatePatients
      );
    });
  });

  describe('ctrl.loadDuplicatePatients method -> ', function () {
    beforeEach(function () {
      scope.patientid = '1234';
      scope.duplicatePatients = [
        { PatientId: '1234', Selected: false },
        { PatientId: '1235', Selected: false },
        { PatientId: '1236', Selected: false },
      ];
    });

    it('should call patientServices.PatientDuplicates.get', function () {
      ctrl.loadDuplicatePatients();
      expect(patientServices.PatientDuplicates.get).toHaveBeenCalledWith({
        Id: scope.patientId,
      });
    });
  });

  describe('scope.selectedPatientsChanged method -> ', function () {
    beforeEach(function () {
      scope.patientId = '1234';
      scope.loadingChartLedgerServices = false;
      scope.duplicatePatients = [
        { PatientId: '1234', Selected: false },
        { PatientId: '1235', Selected: false },
        { PatientId: '1236', Selected: false },
      ];
      spyOn(ctrl, 'loadClinicalOverviews');
    });

    it('should always set the routed patient to Selected equals true', function () {
      scope.selectedPatientsChanged();
      expect(scope.duplicatePatients[0].Selected).toBe(true);
    });

    it('should call ctrl.loadClinicalOverviews if duplicatePatients.length > 0 and scope.loadingChartLedgerServices is false ', function () {
      scope.duplicatePatients[0].Selected = true;
      scope.selectedPatientsChanged();
      expect(ctrl.loadClinicalOverviews).toHaveBeenCalledWith(['1234']);

      scope.duplicatePatients[0].Selected = true;
      scope.duplicatePatients[1].Selected = true;
      scope.selectedPatientsChanged();
      expect(ctrl.loadClinicalOverviews).toHaveBeenCalledWith(['1234']);
    });

    it('should not call ctrl.loadClinicalOverviews if duplicatePatients.length > 0 and scope.loadingChartLedgerServices is true ', function () {
      scope.loadingChartLedgerServices = true;
      scope.duplicatePatients[0].Selected = true;
      scope.selectedPatientsChanged();
      expect(ctrl.loadClinicalOverviews).not.toHaveBeenCalled();
    });
  });

  describe('scope.$on(soar:reload-clinical-overview) ->', function () {
    let duplicatePatients = [];
    beforeEach(function () {
      duplicatePatients = ['1234', '1236'];
      spyOn(ctrl, 'loadClinicalOverviews');
    });

    it('should call ctrl.loadClinicalOverviews if duplicatePatients', function () {
      scope.$emit('soar:reload-clinical-overview', duplicatePatients);
      expect(ctrl.loadClinicalOverviews).toHaveBeenCalledWith(
        duplicatePatients
      );
    });

    it('should call scope.getPatientChartLedgerServices if no duplicatePatients', function () {
      scope.$emit('soar:reload-clinical-overview', []);
      expect(ctrl.loadClinicalOverviews).not.toHaveBeenCalledWith(
        duplicatePatients
      );
    });
  });

  describe('scope.$on(soar:chart-services-reload-ledger) ->', function () {
    beforeEach(function () {
      scope.patientId = '1234';
      scope.duplicatePatients = [
        { PatientId: '1234', Selected: false },
        { PatientId: '1235', Selected: false },
        { PatientId: '1236', Selected: false },
      ];
      spyOn(ctrl, 'loadClinicalOverviews');
      spyOn(scope, 'getPatientChartLedgerServices');
    });

    it('should call ctrl.loadClinicalOverviews if scope.duplicatePatients', function () {
      scope.duplicatePatients[0].Selected = true;
      scope.$emit('soar:chart-services-reload-ledger', true);
      expect(ctrl.loadClinicalOverviews).toHaveBeenCalledWith([
        scope.duplicatePatients[0].PatientId,
      ]);
    });
  });

  describe('checkAccessAndActivateTab ->', function () {
    beforeEach(function () {
      scope.checkAccess = jasmine.createSpy().and.returnValue(true);
      scope.activateTab = jasmine.createSpy();
    });

    it('should call checkAccess', function () {
      scope.checkAccessAndActivateTab(1);

      expect(scope.checkAccess).toHaveBeenCalled();
    });

    it('should call activateTab when user has access', function () {
      scope.checkAccessAndActivateTab(1);

      expect(scope.activateTab).toHaveBeenCalled();
    });

    it('should not call activateTab when user has access', function () {
      scope.checkAccess = jasmine.createSpy().and.returnValue(false);

      scope.checkAccessAndActivateTab(1);

      expect(scope.activateTab).not.toHaveBeenCalled();
    });
  });

  describe('getIsActive ->', function () {
    beforeEach(function () {});

    it('should return true when index equals activeTab', function () {
      scope.activeTab = 1;

      var result = scope.getIsActive(1);

      expect(result).toBe(true);
    });

    it('should return false when index does not equal activeTab', function () {
      scope.activeTab = 2;

      var result = scope.getIsActive(1);

      expect(result).toBe(false);
    });
  });

  describe('checkAccess ->', function () {
    beforeEach(function () {
      patSecurityService.IsAuthorizedByAbbreviation = jasmine
        .createSpy()
            .and.returnValue(true);        
    });

    it('should return true when tab is rx, no amfa, and has rxAccess', function () {
      scope.hasRxAccess = true;

      var result = scope.checkAccess({ Name: 'Rx', AMFA: null });

      expect(result).toBe(true);
    });

    it('should return true when tab is rx, has amfa with privilege, and has rxAccess', function () {
      scope.hasRxAccess = true;

      var result = scope.checkAccess({ Name: 'Rx', AMFA: 'test' });

      expect(result).toBe(true);
    });

    it('should return false when tab is rx, has amfa without privilege, and has rxAccess', function () {
      scope.hasRxAccess = true;
      patSecurityService.IsAuthorizedByAbbreviation = jasmine
        .createSpy()
        .and.returnValue(false);

      var result = scope.checkAccess({ Name: 'Rx', AMFA: 'test' });

      expect(result).toBe(false);
    });

    it('should return true when tab is rx, has amfa with privilege, and has rxAccess', function () {
      scope.hasRxAccess = false;

      var result = scope.checkAccess({ Name: 'Rx', AMFA: 'test' });

      expect(result).toBe(false);
    });

    it('should return true when tab is not rx, no amfa', function () {
      var result = scope.checkAccess({ Name: 'Chart', AMFA: null });

      expect(result).toBe(true);
    });

    it('should return true when tab is not rx, has amfa with privilege', function () {
      var result = scope.checkAccess({ Name: 'Chart', AMFA: 'test' });

      expect(result).toBe(true);
    });

    it('should return false when tab is not rx, has amfa without privilege', function () {
      patSecurityService.IsAuthorizedByAbbreviation = jasmine
        .createSpy()
        .and.returnValue(false);

      var result = scope.checkAccess({ Name: 'Chart', AMFA: 'test' });

      expect(result).toBe(false);
    });
  });

  describe('setTabTitle ->', function () {
    beforeEach(function () {
      scope.checkAccess = jasmine.createSpy().and.returnValue(true);
    });

    it('should return message for rx when tab is rx and has no access', function () {
      scope.checkAccess = jasmine.createSpy().and.returnValue(false);

      var result = scope.setTabTitle({ Name: 'Rx' });

      expect(result).toEqual(
        'You are not setup for ePrescriptions at this location, verify your current location and refresh the page.'
      );
    });

    it('should return different message for other tabs and has no access', function () {
      scope.checkAccess = jasmine.createSpy().and.returnValue(false);

      var result = scope.setTabTitle({ Name: 'Chart' });

      expect(result).toEqual(
        'You do not have permission to view this information'
      );
    });

    it('should return empty string when has access', function () {
      var result = scope.setTabTitle({ Name: 'Chart' });

      expect(result).toEqual('');
    });
  });

  describe('ctrl.initMedications function ->', function () {
    beforeEach(function () {
      scope.hasRxViewAccess = true;
      scope.rxMedicationsInitialized = false;
      scope.patientId = '1234';
      scope.$broadcast = jasmine.createSpy();      
      spyOn(ctrl, 'createPrscNoteIfNecessary').and.callFake(function () { });      
    });

    it('should call patientRxFactory.Medications if scope.hasRxViewAccess is true', function () {
      scope.hasRxViewAccess = true;
      ctrl.initMedications();
      expect(patientRxFactory.Medications).toHaveBeenCalledWith(
        scope.patientId
      );
    });

    it('should call  executeMedicationsLoadingFallback if scope.hasRxViewAccess is false', function () {
      scope.hasRxViewAccess = false;
      ctrl.initMedications();
      expect(scope.$broadcast).toHaveBeenCalledWith(
        'soar:rxMedicationGetComplete',
        null
      );
    });    
  });

  describe('ctrl.buildPrscNoteBody method ->', function () {
    var prescription, prescriberUser;
    beforeEach(function () {
      prescription = {
        DateWritten: '2019-03-19',
        DisplayName: 'Advil',
        NoSubstitution: true,
        Strength: '50mg',
        DispenseUnits: 20,
        Quantity: 25,
        Notes: 'Take it.',
        Refills: 0,
        PharmacyNotes: null,
      };
      prescriberUser = {
        LastName: 'Frapples',
        FirstName: 'Bob',
      };
    });

    it('should build html for prescriptions', function () {
      var result = ctrl.buildPrscNoteBody(prescription, prescriberUser);
      expect(result).toContain('<b>Prescribing User:</b> Frapples, Bob<br/>');
      expect(result).toContain(
        '<b>Date Written:</b> ' +
          moment(moment.utc(prescription.DateWritten).toDate()).format(
            'MM/DD/YYYY'
          )
      );
      expect(result).toContain(
        '<b>Name:</b> Advil<br/><b>No Substitution:</b> Yes<br/><b>Dose:</b>'
      );
      expect(result).toContain(
        '<b>Refills:</b> 0<br/><b>Pharmacy Notes:</b> <br/>'
      );
      expect(result).toContain(
        '<b>Quantity:</b> 25<br/><b>Patient Directions:</b> Take it.<br/>'
      );
    });
  });
});
