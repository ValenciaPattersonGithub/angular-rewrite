import { of } from "rxjs";

describe('treatmentPlansCrud directive ->', function () {
  var scope,
    ctrl,
    modalFactory,
    modalFactoryDeferred,
    q,
    mockTxPlan,
    toastrFactory,
    patientServices,
    treatmentPlansFactory,
    serviceButtonsService,
    typeOrMaterialsService,
    buttonServiceDeferred,
    typeOrMaterialDeferred,
    deferred;
  var modalInstance,
    $uibModal,
    financialService,
    usersFactory,
    patientBenefitPlansFactory,
    mocklocation,
    mockTreatmentConsentService,
    listHelper;
  var mockLocationServices,
    treatmentPlanDocumentFactory,
    patSecurityService,
    documentService,
    referenceDataService,
    locationService,
    appointmentService;
  var informedConsentFactory,
    rootScope,
    timeout,
    compile ,
    sanitize,
    mockModalDataFactory,
    recentDocumentsService,
    practicesApiService,
    drawerNotificationService;
  var userSettingsDataService,
    appointmentModalLinksService,
    treatmentPlanChangeService,
    treatmentPlanEditServices,
    appointmentViewDataLoadingService,
    appointmentViewVisibleService,
    treatmentPlanHttpService;
  var patientServicesFactory;

  mockTxPlan = {
    TreatmentPlanHeader: {},
    TreatmentPlanServices: [],
  };

  beforeEach(
    module('Soar.BusinessCenter', function ($provide) {
      locationService = {
        getCurrentLocation: jasmine.createSpy().and.returnValue({}),
      };
      $provide.value('locationService', locationService);
    })
  );

  var documentGroupsService;
  beforeEach(
    module('Soar.Common', function ($provide) {
      documentGroupsService = {
        getAll: jasmine.createSpy().and.returnValue({}),
      };
      $provide.value('DocumentGroupsService', documentGroupsService);
    })
  );

  beforeEach(
    module('Soar.Patient', function ($provide) {
      documentGroupsService = {
        getAll: jasmine.createSpy().and.returnValue({}),
      };
      $provide.value('DocumentGroupsService', documentGroupsService);

      informedConsentFactory = {
        access: jasmine.createSpy().and.returnValue({}),
        view: jasmine.createSpy().and.returnValue({
          then: jasmine.createSpy().and.returnValue(),
        }),
      };
      $provide.value('InformedConsentFactory', informedConsentFactory);

      appointmentService = {};
      $provide.value('AppointmentService', appointmentService);

      recentDocumentsService = {
        update: jasmine.createSpy(),
      };
      $provide.value('RecentDocumentsService', recentDocumentsService);

      drawerNotificationService = {};

      appointmentViewVisibleService = {
        changeAppointmentViewVisible: jasmine.createSpy(),
      };
      $provide.value(
        'AppointmentViewVisibleService',
        appointmentViewVisibleService
      );

      appointmentViewDataLoadingService = {
        getViewData: jasmine.createSpy(),
      };
      $provide.value(
        'AppointmentViewDataLoadingService',
        appointmentViewDataLoadingService
      );
    })
  );

  beforeEach(
    module('Soar.Schedule', function ($provide) {
      practicesApiService = {};
      $provide.value('PracticesApiService', practicesApiService);
    })
  );

  var txPlanData = {
    TreatmentPlanHeader: {
      TreatmentPlanId: 1,
      PersonId: 1,
      StatusId: 1,
      TreatmentPlanName: 'Treatment Plan',
      TreatmentPlanDescription: null,
      AlternateGroupId: 'GID1',
      SortSettings: null,
    },
    TreatmentPlanServices: [
      {
        TreatmentPlanServiceHeader: {
          TreatmentPlanServiceId: 111,
          Priority: 0,
          TreatmentPlanId: 1,
          TreatmentPlanGroupNumber: 1,
          EstimatedInsurance: 0.0,
          PatientPortion: 0.0,
          ServiceTransactionId: 1,
          PersonId: 1,
        },
        ServiceTransaction: {
          Amount: 320.0,
          Description:
            'D9220: deep sedation/general anesthesia - first 30 minutes (D9220)',
          Fee: 320.0,
          ProviderUserId: 1,
          RejectedReason: null,
          ServiceCodeId: 1,
          ServiceTransactionId: 1,
          ServiceTransactionStatusId: 1,
          Surface: null,
          Roots: null,
          Tax: 0.0,
          Tooth: null,
          TransactionTypeId: 1,
          ObjectState: 'None',
          FailedMessage: null,
          Balance: 320.0,
        },
      },
      {
        TreatmentPlanServiceHeader: {
          TreatmentPlanServiceId: 112,
          Priority: 0,
          TreatmentPlanId: 1,
          TreatmentPlanGroupNumber: 1,
          EstimatedInsurance: 0.0,
          PatientPortion: 0.0,
          ServiceTransactionId: 2,
          PersonId: 1,
        },
        ServiceTransaction: {
          Amount: 12.0,
          Description: 'D0470: diagnostic casts (D0470)',
          Fee: 12.0,
          ProviderUserId: 1,
          RejectedReason: null,
          ServiceCodeId: 1,
          ServiceTransactionId: 2,
          ServiceTransactionStatusId: 1,
          Surface: null,
          Roots: null,
          Tax: 0.0,
          Tooth: null,
          TransactionTypeId: 1,
          ObjectState: 'None',
          FailedMessage: null,
          Balance: 12.0,
        },
      },
      {
        TreatmentPlanServiceHeader: {
          TreatmentPlanServiceId: 113,
          Priority: 0,
          TreatmentPlanId: 1,
          TreatmentPlanGroupNumber: 1,
          EstimatedInsurance: 0.0,
          PatientPortion: 0.0,
          ServiceTransactionId: 3,
          PersonId: 1,
        },
        ServiceTransaction: {
          Amount: 32.0,
          Description:
            'D6074: abutment supported retainer for cast metal FPD (noble metal) (D6074)',
          Fee: 32.0,
          ProviderUserId: 1,
          RejectedReason: null,
          ServiceCodeId: 1,
          ServiceTransactionId: 3,
          ServiceTransactionStatusId: 1,
          Surface: null,
          Roots: null,
          Tax: 0.0,
          Tooth: '30',
          TransactionTypeId: 1,
          ObjectState: 'None',
          FailedMessage: null,
          Balance: 32.0,
        },
      },
      {
        TreatmentPlanServiceHeader: {
          TreatmentPlanServiceId: 211,
          Priority: 0,
          TreatmentPlanId: 1,
          TreatmentPlanGroupNumber: 2,
          EstimatedInsurance: 0.0,
          PatientPortion: 0.0,
          ServiceTransactionId: 144,
          PersonId: 1,
        },
        ServiceTransaction: {
          Amount: 320.0,
          Description:
            'D9220: deep sedation/general anesthesia - first 30 minutes (D9220)',
          Fee: 320.0,
          ProviderUserId: 1,
          RejectedReason: null,
          ServiceCodeId: 1,
          ServiceTransactionId: 123,
          ServiceTransactionStatusId: 1,
          Surface: null,
          Roots: null,
          Tax: 0.0,
          Tooth: null,
          TransactionTypeId: 1,
          ObjectState: 'None',
          FailedMessage: null,
          Balance: 320.0,
        },
      },
      {
        TreatmentPlanServiceHeader: {
          TreatmentPlanServiceId: 212,
          Priority: 0,
          TreatmentPlanId: 1,
          TreatmentPlanGroupNumber: 2,
          EstimatedInsurance: 0.0,
          PatientPortion: 0.0,
          ServiceTransactionId: 155,
          PersonId: 1,
        },
        ServiceTransaction: {
          Amount: 320.0,
          Description:
            'D9220: deep sedation/general anesthesia - first 30 minutes (D9220)',
          Fee: 320.0,
          ProviderUserId: 1,
          RejectedReason: null,
          ServiceCodeId: 1,
          ServiceTransactionId: 155,
          ServiceTransactionStatusId: 1,
          Surface: null,
          Roots: null,
          Tax: 0.0,
          Tooth: null,
          TransactionTypeId: 1,
          ObjectState: 'None',
          FailedMessage: null,
          Balance: 320.0,
        },
      },
    ],
  };

  var altTxPlanData = {
    TreatmentPlanHeader: {
      TreatmentPlanId: 1,
      PersonId: 1,
      StatusId: 1,
      TreatmentPlanName: 'Treatment Plan',
      TreatmentPlanDescription: null,
    },
    TreatmentPlanServices: [
      {
        TreatmentPlanServiceHeader: {
          TreatmentPlanServiceId: 1,
          Priority: 0,
          TreatmentPlanId: 1,
          TreatmentPlanGroupNumber: 1,
          EstimatedInsurance: 0.0,
          PatientPortion: 0.0,
          ServiceTransactionId: 1,
          PersonId: 1,
        },
        ServiceTransaction: {
          Amount: 320.0,
          Description:
            'D9220: deep sedation/general anesthesia - first 30 minutes (D9220)',
          Fee: 320.0,
          ProviderUserId: 1,
          RejectedReason: null,
          ServiceCodeId: 1,
          ServiceTransactionId: 1,
          ServiceTransactionStatusId: 1,
          Surface: null,
          Roots: null,
          Tax: 0.0,
          Tooth: null,
          TransactionTypeId: 1,
          ObjectState: 'None',
          FailedMessage: null,
          Balance: 320.0,
        },
      },
    ],
  };

  beforeEach(
    module('Soar.Patient', function ($provide) {
      treatmentPlansFactory = {
        Update: jasmine.createSpy().and.callFake(function () {}),
        ExistingTreatmentPlans: jasmine.createSpy().and.returnValue({}),
        PredeterminationList: jasmine.createSpy(),
        Delete: jasmine.createSpy(),
        Create: jasmine.createSpy(),
        SetActiveTreatmentPlan: jasmine.createSpy(),
        CollapseAll: jasmine.createSpy(),
        SetDataChanged: jasmine.createSpy(),
        GetAllHeaders: jasmine.createSpy(),
        AddPlannedService: jasmine.createSpy().and.returnValue({
          then: jasmine.createSpy().and.returnValue({}),
        }),
        SetAppointmentServices: jasmine.createSpy(),
        BuildTreatmentPlanDto: function () {
          return altTxPlanData;
        },
        GetTreatmentPlanById: jasmine.createSpy().and.returnValue({
          then: jasmine.createSpy().and.returnValue({ Value: txPlanData }),
        }),
        SetNewTreatmentPlan: jasmine.createSpy(),
        CalculateInsuranceEstimates: jasmine.createSpy().and.returnValue({
          then: jasmine.createSpy().and.returnValue(),
        }),
        CalculateInsuranceEstimatesWithOverride: jasmine
          .createSpy()
          .and.returnValue({
            then: jasmine.createSpy().and.returnValue(),
          }),
        HasPredetermination: jasmine.createSpy().and.returnValue({
          then: jasmine.createSpy().and.returnValue(),
        }),
        AllowCreatePredetermination: jasmine.createSpy().and.returnValue({
          then: jasmine.createSpy().and.returnValue(),
        }),
        CreatePredetermination: jasmine.createSpy().and.returnValue({
          then: jasmine.createSpy().and.returnValue(),
        }),
        DefaultProviderOnPredetermination: jasmine.createSpy().and.returnValue({
          then: jasmine.createSpy().and.returnValue(),
        }),
        ShouldPromptToRemoveServicesFromAppointment: jasmine
          .createSpy()
          .and.returnValue({
            then: jasmine.createSpy().and.returnValue(),
          }),
        CreateWithNoReload: jasmine.createSpy().and.returnValue({
          then: jasmine.createSpy().and.returnValue({}),
        }),
        GetPlanStages: jasmine.createSpy(),
        SetPlanStages: jasmine.createSpy(),
        GetDaysAgo: jasmine.createSpy(),
        GetTotalFees: jasmine.createSpy(),
        AddAreaToServices: jasmine.createSpy(),
        LoadPlanStages: jasmine.createSpy(),
        InitPredeterminationList: jasmine.createSpy(),
        UpdatePredeterminationList: jasmine.createSpy(),
        ObservePredeterminationList: jasmine.createSpy(),
        SetProposedServicesToAddToAppt: jasmine.createSpy(),
        UpdateProposedServicesToAddToAppt: jasmine.createSpy(),
        ProcessAppointmentsOnPlan: jasmine.createSpy(),
        ServicesOnAppointments: jasmine.createSpy().and.returnValue({
          then: jasmine.createSpy().and.returnValue({}),
        }),
        ClearObservers: jasmine.createSpy(),
        ResetEstimatedInsurance: jasmine.createSpy().and.returnValue({
          then: jasmine.createSpy().and.callThrough(),
        }),
        PatientPortion: jasmine.createSpy(),
        RefreshTreatmentPlanServices: jasmine.createSpy(),
      };
      $provide.value('TreatmentPlansFactory', treatmentPlansFactory);

      serviceButtonsService = {
        get: jasmine.createSpy().and.callFake(function () {
          buttonServiceDeferred = q.defer();
          buttonServiceDeferred.resolve(1);
          return {
            result: buttonServiceDeferred.promise,
            then: function () {},
          };
        }),
      };

      $provide.value('ServiceButtonsService', serviceButtonsService);

      typeOrMaterialsService = {
        get: jasmine.createSpy().and.callFake(function () {
          typeOrMaterialDeferred = q.defer();
          typeOrMaterialDeferred.resolve(1);
          return {
            result: typeOrMaterialDeferred.promise,
            then: function () {},
          };
        }),
      };

      $provide.value('TypeOrMaterialsService', typeOrMaterialsService);

      patientServicesFactory = {
        setActiveServiceTransactionId: jasmine.createSpy(),
      };
      $provide.value('PatientServicesFactory', patientServicesFactory);

      referenceDataService = {
        getData: jasmine.createSpy(),
        entityNames: {
          serviceTypes: 'serviceTypes',
          preventiveServiceTypes: 'preventiveServiceTypes',
          serviceCodes: 'serviceCodes',
        },
      };

      $provide.value('referenceDataService', referenceDataService);

      mockTreatmentConsentService = {};

      financialService = {
        CreateInsuranceEstimateObject: jasmine.createSpy(),
      };
      $provide.value('FinancialService', financialService);

      patientServices = {
        TreatmentPlans: {
          deletePlan: jasmine.createSpy(),
          updateHeader: jasmine.createSpy(),
        },
      };
      $provide.value('PatientServices', patientServices);
      toastrFactory = {};
      toastrFactory.error = jasmine.createSpy();
      toastrFactory.success = jasmine.createSpy();
      $provide.value('toastrFactory', toastrFactory);

      $provide.value('DrawerNotificationService', drawerNotificationService);

      userSettingsDataService = {
        isNewAppointmentAreaEnabled: jasmine.createSpy().and.returnValue(false),
        isNewTreatmentPlanAreaEnabled: jasmine
          .createSpy()
          .and.returnValue(false),
      };
      $provide.value('userSettingsDataService', userSettingsDataService);

      treatmentPlanChangeService = {
        getCloseState: jasmine.createSpy(),
        setCloseState: jasmine.createSpy(),
        registerCloseObserver: jasmine.createSpy(),
        clearCloseObserver: jasmine.createSpy(),
        registerOpenDrawerObserver: jasmine.createSpy(),
        clearOpenDrawerObserver: jasmine.createSpy(),
      };
      $provide.value('TreatmentPlanChangeService', treatmentPlanChangeService);

      treatmentPlanEditServices = {
        getTreatmentPlan: jasmine.createSpy(),
        setTreatmentPlan: jasmine.createSpy(),
      };
      $provide.value(
        'NewTreatmentPlanEditServicesService',
        treatmentPlanEditServices
      );

      const featureFlagService = jasmine.createSpyObj('FeatureFlagService', ['getOnce$']);
      featureFlagService.getOnce$.and.returnValue(of(false));
      $provide.value('FeatureFlagService', featureFlagService);
      const scheduleMFENavigator = jasmine.createSpyObj('schedulingMFENavigator', ['navigateToAppointmentModal']);
      $provide.value('schedulingMFENavigator', scheduleMFENavigator);
    })
  );

  beforeEach(inject(function (
    $rootScope,
    $controller,
    $q,
    _$uibModal_,
    $injector,
    _$compile_,
    _$sanitize_
  ) {
    q = $q;
    rootScope = $rootScope;
    $uibModal = _$uibModal_;
    compile = _$compile_;
    sanitize = _$sanitize_;
    spyOn($uibModal, 'open').and.callThrough();
    listHelper = $injector.get('ListHelper');

    referenceDataService.getData.and.callFake(function () {
      return $q.resolve([]);
    });
    
    //mock for usersFactory
    usersFactory = {
      Users: jasmine.createSpy('usersFactory.Users').and.callFake(function () {
        deferred = $q.defer();
        deferred.resolve(1);
        return {
          result: deferred.promise,
          then: function () {},
        };
      }),
    };

    // $location mock
    mocklocation = {
      path: jasmine.createSpy(),
    };

    // patientBenefitPlansFactory mock
    patientBenefitPlansFactory = {
      PatientBenefitPlans: jasmine
        .createSpy('patientBenefitPlansFactory.PatientBenefitPlans')
        .and.callFake(function () {
          deferred = $q.defer();
          deferred.resolve(1);
          return {
            result: deferred.promise,
            then: function () {},
          };
        }),
    };

    //txPlanHttp mock
    treatmentPlanHttpService = {
      getInsuranceInfo: jasmine
        .createSpy('treatmentPlanHttpService.getInsuranceInfo')
        .and.callFake(function () {
          deferred = $q.defer();
          deferred.resolve(1);
          return {
            result: deferred.promise,
            subscribe: function () {},
            then: function () {},
            next: function () {},
          };
        }),
    };

    // patientBenefitPlansFactory mock

    modalInstance = {
      close: jasmine.createSpy('modalInstance.close').and.returnValue({}),
      dismiss: jasmine.createSpy('modalInstance.dismiss'),
      result: {
        then: jasmine.createSpy('modalInstance.result.then'),
      },
    };
    modalFactory = {
      Modal: jasmine.createSpy().and.callFake(function () {
        modalFactoryDeferred = q.defer();
        modalFactoryDeferred.resolve(1);
        return {
          result: modalFactoryDeferred.promise,
          then: function () {},
        };
      }),
      DeleteModal: jasmine
        .createSpy('modalFactory.DeleteModal')
        .and.callFake(function () {
          modalFactoryDeferred = q.defer();
          modalFactoryDeferred.resolve(1);
          return {
            result: modalFactoryDeferred.promise,
            then: function () {},
          };
        }),
      CancelModal: jasmine
        .createSpy('modalFactory.CancelModal')
        .and.callFake(function () {
          modalFactoryDeferred = q.defer();
          modalFactoryDeferred.resolve(1);
          return {
            result: modalFactoryDeferred.promise,
            then: function () {},
          };
        }),
      ConfirmModal: jasmine
        .createSpy('modalFactory.ConfirmModal')
        .and.callFake(function () {
          modalFactoryDeferred = q.defer();
          modalFactoryDeferred.resolve(1);
          return {
            result: modalFactoryDeferred.promise,
            then: function () {},
          };
        }),
    };

    treatmentPlanDocumentFactory = {
      access: function () {
        return { Create: true, View: true, Edit: true, Delete: true };
      },
      observeSnapshots: function () {},
      ViewTreatmentPlanSnapshot: jasmine
        .createSpy('treatmentPlanDocumentFactory.ViewTreatmentPlanSnapshot')
        .and.callFake(function () {
          modalFactoryDeferred = q.defer();
          modalFactoryDeferred.resolve(1);
          return {
            result: modalFactoryDeferred.promise,
            then: function () {},
          };
        }),
      GetSignatureFileAllocationId: jasmine
        .createSpy('treatmentPlanDocumentFactory.GetSignatureFileAllocationId')
        .and.callFake(function () {
          modalFactoryDeferred = q.defer();
          modalFactoryDeferred.resolve(1);
          return {
            result: modalFactoryDeferred.promise,
            then: function () {},
          };
        }),
      DeleteTreatmentPlanDocument: jasmine
        .createSpy('treatmentPlanDocumentFactory.DeleteTreatmentPlanDocument')
        .and.callFake(function () {
          modalFactoryDeferred = q.defer();
          modalFactoryDeferred.resolve(1);
          return {
            result: modalFactoryDeferred.promise,
            then: function () {},
          };
        }),
      DocumentsByTreatmentPlanId: jasmine.createSpy().and.returnValue({
        then: jasmine.createSpy().and.returnValue({}),
      }),
    };

    mockModalDataFactory = {
      GetAppointmentEditData: jasmine.createSpy().and.returnValue({
        then: jasmine.createSpy().and.returnValue(),
      }),
    };

    documentService = {
      getByDocumentId: jasmine.createSpy('documentService.getByDocumentId'),
    };

    patSecurityService = {
      generateMessage: function () {},
      IsAuthorizedByAbbreviation: function () {},
    };

    mockLocationServices = {};
    scope = $rootScope.$new();
    scope.patientInfo = { PatientId: '12588u0', PreferredLocation: '1234' };
    ctrl = $controller('TreatmentPlansCrudController', {
      $scope: scope,
      TreatmentPlanHttpService: treatmentPlanHttpService,
      ModalFactory: modalFactory,
      $uibModalInstance: modalInstance,
      ModalDataFactory: mockModalDataFactory,
      ServiceButtonsService: serviceButtonsService,
      TypeOrMaterialsService: typeOrMaterialsService,
      UsersFactory: usersFactory,
      PatientBenefitPlansFactory: patientBenefitPlansFactory,
      $location: mocklocation,
      TreatmentConsentService: mockTreatmentConsentService,
      LocationServices: mockLocationServices,
      tabLauncher: {},
      TreatmentPlanDocumentFactory: treatmentPlanDocumentFactory,
      patSecurityService: patSecurityService,
      DocumentService: documentService,
      DrawerNotificationService: drawerNotificationService,
      AppointmentViewDataLoadingService: appointmentViewDataLoadingService,
      AppointmentViewVisibleService: appointmentViewVisibleService,
    });

    scope.activeTreatmentPlan = {
      TreatmentPlanServices: [{ ServiceTransaction: {} }],
    };
    timeout = $injector.get('$timeout');
  }));

  describe('delete -> ', function () {
    it('should set planMarkedForDeletion and call modal', function () {
      scope.hasTreatmentPlanDeleteAccess = true;
      scope.delete(mockTxPlan);
      expect(ctrl.planMarkedForDeletion).toBe(mockTxPlan);
      expect(modalFactory.DeleteModal).toHaveBeenCalled();
    });
  });

  describe('sanitizeInput directive', function() {
    var $scope,
        element,
        $compile,
        $rootScope,
        $sanitize;

    beforeEach(inject(function ($injector) {
      $rootScope = $injector.get('$rootScope');
      $scope = $rootScope.$new();
      $compile = $injector.get('$compile');
      $sanitize = $injector.get('$sanitize');
      scope.activeTreatmentPlan = {
        TreatmentPlanServices: [
            { 
              TreatmentPlanServiceHeader: { TreatmentPlanId: 1234 },
              ServiceTransaction: {},
            },
        ],
        TreatmentPlanHeader: { HasAtLeastOnePredetermination: true }
      };
    }));

    it('should sanitize the input', function() {
      
      element = $compile('<input type="text" ng-model="userInput" sanitize-input>')($scope);
      $scope.$digest();

      $scope.userInput = '<script>alert("xss")</script>';
      $scope.$digest();
      expect(element.val()).toEqual($sanitize($scope.userInput));
    });

    it('should update the model with sanitized input on user change', function() {
      
      element = $compile('<input type="text" ng-model="userInput" sanitize-input>')($scope);
      $scope.$digest();

      element.val('<script>alert("xss")</script>').triggerHandler('input');
      $scope.$digest();

      expect($scope.userInput).toEqual($sanitize(element.val()));
    });
  });



  describe('$scope.closeTxPlan function -> ', function () {
    beforeEach(function () {
      scope.viewSettings = { expandView: false };
    });
    it('closes expand view', function () {
      scope.viewSettings.expandView = true;
      scope.viewSettings.activeExpand = true;
      scope.closeTxPlan();
      expect(scope.viewSettings.expandView).toBeFalsy();
      expect(scope.viewSettings.activeExpand).toBe(0);
      expect(treatmentPlansFactory.SetActiveTreatmentPlan).toHaveBeenCalled();
      expect(treatmentPlansFactory.CollapseAll).toHaveBeenCalled();
    });
    it('should set treatmentPlansFactory.NewTreatmentPlan to null if its not null', function () {
      treatmentPlansFactory.NewTreatmentPlan = {};
      scope.closeTxPlan();
      expect(treatmentPlansFactory.NewTreatmentPlan).toBe(null);
    });
  });

  describe('serviceAmountTotal method -> ', function () {
    it('calculates total of service amount in treatment plan', function () {
      var treatmentPlan = angular.copy(txPlanData);
      var total = 0;
      _.forEach(treatmentPlan.TreatmentPlanServices, function (svc) {
        if (!_.isNil(svc.ServiceTransaction.Amount)) {
          total += svc.ServiceTransaction.Amount;
        }
      });
      treatmentPlan.TreatmentPlanServices.push({
        ServiceTransaction: { Amount: 100, IsDeleted: true },
      });
      expect(
        scope.serviceAmountTotal(treatmentPlan.TreatmentPlanServices)
      ).toEqual(total);
    });
  });

  describe('addSection method -> ', function () {
    it('adds new stage in treatment plan', function () {
      scope.activeTreatmentPlan = angular.copy(txPlanData);
      scope.addSection();
      expect(scope.planStages.length).toEqual(2);
      scope.addSection();
      expect(scope.planStages.length).toEqual(3);
    });
  });

  describe('delete method -> ', function () {
    it(' opens confirmation modal when clicks on deleted treatmentplan link and deletes after clicking on confirm button', function () {
      scope.delete(txPlanData);
      spyOn(ctrl, 'confirmDeleteServicesFromAppts');
      expect(modalFactory.DeleteModal).toHaveBeenCalled();
      ctrl.confirmDelete();
      expect(ctrl.confirmDeleteServicesFromAppts).toHaveBeenCalled();
    });
  });

  describe('scope.CreateAlternatePlan numbers -> ', function () {
    beforeEach(function () {
      scope.viewSettings = { expandView: false };
    });

    it('creates alternate plan for current active treatment plan', function () {
      scope.activeTreatmentPlan = txPlanData;
      scope.viewSettings = {};
      scope.CreateAlternatePlan();
      expect(treatmentPlansFactory.SetDataChanged).toHaveBeenCalled();
      expect(treatmentPlansFactory.SetActiveTreatmentPlan).toHaveBeenCalled();
      expect(treatmentPlansFactory.CollapseAll).toHaveBeenCalled();
      expect(treatmentPlansFactory.BuildTreatmentPlanDto()).toBe(altTxPlanData);
      altTxPlanData.AlternateGroupId =
        txPlanData.TreatmentPlanHeader.AlternateGroupId;
      altTxPlanData.TreatmentPlanName = 'Alternate of Treatment Plan';
      expect(treatmentPlansFactory.SetNewTreatmentPlan).toHaveBeenCalledWith(
        altTxPlanData
      );
      expect(scope.viewSettings.expandView).toBeTruthy();
      expect(scope.viewSettings.activeExpand).toBe(2);
    });
  });

  describe('ctrl.updateInsuranceEstimateWithOverrides -> ', function () {
    //it('should call treatmentPlansFactory.CalculateInsuranceEstimates with active tx plan if updatingInsurance is false', function () {
    //    scope.updatingInsurance = false;
    //    scope.activeTreatmentPlan = {};
    //    ctrl.updateInsuranceEstimate(scope.activeTreatmentPlan);
    //    expect(treatmentPlansFactory.CalculateInsuranceEstimates).toHaveBeenCalledWith(scope.activeTreatmentPlan);
    //});

    it('should call treatmentPlansFactory.CalculateInsuranceEstimates if updatingInsurance is false', function () {
      scope.updatingInsurance = true;
      scope.activeTreatmentPlan = {};
      scope.setDisableEditFunctions = jasmine.createSpy();
      ctrl.updateInsuranceEstimateWithOverrides(scope.activeTreatmentPlan);

      expect(
        treatmentPlansFactory.CalculateInsuranceEstimates
      ).not.toHaveBeenCalled();
      expect(scope.setDisableEditFunctions).toHaveBeenCalled();
    });

    it('should call setDisableEditFunctions if updatingInsurance is false', function () {
      scope.updatingInsurance = false;
      scope.setDisableEditFunctions = jasmine.createSpy();
      scope.activeTreatmentPlan = {};
      ctrl.updateInsuranceEstimateWithOverrides(scope.activeTreatmentPlan);
    });
  });

  describe('ctrl.setHasPredetermination -> ', function () {
    it('should set scope.hasPredetermination based on activeTreatmentPlan.TreatmentPlanHeader.HasAtLeastOnePredetermination  ', function () {
      scope.activeTreatmentPlan = {
        TreatmentPlanHeader: { HasAtLeastOnePredetermination: true },
      };
      ctrl.setHasPredetermination();
      expect(scope.hasPredetermination).toBe(true);

      scope.activeTreatmentPlan = {
        TreatmentPlanHeader: { HasAtLeastOnePredetermination: false },
      };
      ctrl.setHasPredetermination();
      expect(scope.hasPredetermination).toBe(false);
    });
  });

  describe('ctrl.setAllowCreatePredetermination -> ', function () {
    it('should call treatmentPlansFactory.AllowCreatePredetermination with active tx plan  ', function () {
      scope.activeTreatmentPlan = {};
      ctrl.setAllowCreatePredetermination();
      expect(
        treatmentPlansFactory.AllowCreatePredetermination
      ).toHaveBeenCalledWith(scope.activeTreatmentPlan);
    });
  });

  describe('ctrl.getPredeterminationServices -> ', function () {
    var treatmentPlanServices = [];
    beforeEach(function () {
      scope.activeTreatmentPlan = _.cloneDeep(txPlanData);
      treatmentPlanServices = scope.activeTreatmentPlan.TreatmentPlanServices;
      var i = 0;
      treatmentPlanServices[i].TreatmentPlanServiceHeader.Priority = 5;
      treatmentPlanServices[i].ServiceTransaction.ServiceTransactionId = 1234;
      treatmentPlanServices[i].ServiceTransaction.$$IncludeInAppointment = true;
      treatmentPlanServices[
        i
      ].TreatmentPlanServiceHeader.TreatmentPlanGroupNumber = 1;
      i++;
      treatmentPlanServices[i].TreatmentPlanServiceHeader.Priority = 4;
      treatmentPlanServices[i].ServiceTransaction.ServiceTransactionId = 1235;
      treatmentPlanServices[i].ServiceTransaction.$$IncludeInAppointment = true;
      treatmentPlanServices[
        i
      ].TreatmentPlanServiceHeader.TreatmentPlanGroupNumber = 1;
      i++;
      treatmentPlanServices[i].TreatmentPlanServiceHeader.Priority = 1;
      treatmentPlanServices[i].ServiceTransaction.ServiceTransactionId = 1236;
      treatmentPlanServices[i].ServiceTransaction.$$IncludeInAppointment = true;
      treatmentPlanServices[
        i
      ].TreatmentPlanServiceHeader.TreatmentPlanGroupNumber = 1;
      i++;
      treatmentPlanServices[i].TreatmentPlanServiceHeader.Priority = 2;
      treatmentPlanServices[i].ServiceTransaction.ServiceTransactionId = 1237;
      treatmentPlanServices[i].ServiceTransaction.$$IncludeInAppointment = true;
      treatmentPlanServices[
        i
      ].TreatmentPlanServiceHeader.TreatmentPlanGroupNumber = 1;
      i++;
      treatmentPlanServices[i].TreatmentPlanServiceHeader.Priority = 3;
      treatmentPlanServices[i].ServiceTransaction.ServiceTransactionId = 1238;
      treatmentPlanServices[i].ServiceTransaction.$$IncludeInAppointment = true;
      treatmentPlanServices[
        i
      ].TreatmentPlanServiceHeader.TreatmentPlanGroupNumber = 2;
    });

    it('should return a list of ServiceTransaction', function () {
      var serviceTransactions = ctrl.getPredeterminationServices();
      expect(serviceTransactions.length).toBe(5);
    });

    it('should order list of ServiceTransaction based on TreatmentPlanServiceHeader.TreatmentPlanGroupNumber then TreatmentPlanServiceHeader.Priority', function () {
      var serviceTransactions = ctrl.getPredeterminationServices();
      expect(serviceTransactions.length).toBe(5);
      expect(serviceTransactions[0].ServiceTransactionId).toBe(1236);
      expect(serviceTransactions[1].ServiceTransactionId).toBe(1237);
      expect(serviceTransactions[2].ServiceTransactionId).toBe(1235);
      expect(serviceTransactions[3].ServiceTransactionId).toBe(1234);
      expect(serviceTransactions[4].ServiceTransactionId).toBe(1238);
    });

    it('should only contain services that have $$IncludeInAppointment set to true', function () {
      scope.activeTreatmentPlan.TreatmentPlanServices[1].ServiceTransaction.$$IncludeInAppointment = false;
      var serviceTransactions = ctrl.getPredeterminationServices();
      expect(serviceTransactions.length).toBe(4);
      expect(serviceTransactions[0].ServiceTransactionId).toBe(1236);
      expect(serviceTransactions[1].ServiceTransactionId).toBe(1237);
      expect(serviceTransactions[2].ServiceTransactionId).toBe(1234);
      expect(serviceTransactions[3].ServiceTransactionId).toBe(1238);
    });
  });

  describe('ctrl.createPredetermination -> ', function () {
    beforeEach(function () {
      spyOn(ctrl, 'getPredeterminationServices');
    });
    it('should call ctrl.getPredeterminationServices to get ordered list of services ', function () {
      scope.activeTreatmentPlan = {
        TreatmentPlanHeader: {
          TreatmentPlanId: '',
        },
      };
      ctrl.setAllowCreatePredetermination();
      scope.createPredetermination();
      expect(ctrl.getPredeterminationServices).toHaveBeenCalled();
    });

    it('should call treatmentPlansFactory.AllowCreatePredetermination with active tx plan  ', function () {
      scope.activeTreatmentPlan = {
        TreatmentPlanHeader: {
          TreatmentPlanId: '',
        },
      };
      ctrl.setAllowCreatePredetermination();
      scope.createPredetermination();
      expect(scope.disableCreateDeterminationButton).toBe(true);
    });
  });

  describe('ctrl.viewPredetermination -> ', function () {
    it('should not redirect if the active treatment plan has a predetermination response for the selected benefit plan', function () {
      scope.activeTreatmentPlan = {
        Predeterminations: [
          {
            IsReceived: true,
            BenefitPlanId: '2',
          },
        ],
      };
      scope.planOnDetermination = '1';
      scope.viewPredetermination();
      expect(mocklocation.path).not.toHaveBeenCalled();
    });
  });

  describe('ctrl.checkForReceivedPredetermination -> ', function () {
    it('should return true when active treatment plan has predetermination with benefit plan matching plan on determination and determinatin has received response  ', function () {
      scope.activeTreatmentPlan = {
        Predeterminations: [
          {
            IsReceived: true,
            BenefitPlanId: '2',
          },
        ],
      };
      scope.planOnDetermination = '2';
      var result = ctrl.checkForReceivedPredetermination();
      expect(result).toBe(false);
    });
  });

  describe('ctrl.checkForReceivedPredetermination -> ', function () {
    it('should return false when active treatment plan does not have predetermination with benefit plan matching plan on determination and determinatin has received response  ', function () {
      scope.activeTreatmentPlan = {
        Predeterminations: [
          {
            IsReceived: true,
            BenefitPlanId: '1',
          },
        ],
      };
      scope.planOnDetermination = '2';
      var result = ctrl.checkForReceivedPredetermination();
      expect(result).toBe(false);
    });
  });

  describe('ctrl.setDisableCreateDeterminationButton -> ', function () {
    beforeEach(function () {
      scope.activeTreatmentPlan = {
        TreatmentPlanHeader: { HasAtLeastOnePredetermination: false },
      };
      scope.treatmentPlansFactory = {};
      scope.treatmentPlansFactory.PredeterminationList = [];
    });

    it('should disable setDisableCreateDeterminationButton if providerOnDetermination is not selected', function () {
      scope.providerOnDetermination = null;
      ctrl.setDisableCreateDeterminationButton();
      timeout.flush();
      expect(scope.disableCreateDeterminationButton).toBe(true);
    });

    it('should disable setDisableCreateDeterminationButton if scope.hasBenefitPlan is false', function () {
      scope.hasBenefitPlan = false;
      ctrl.setDisableCreateDeterminationButton();
      timeout.flush();
      expect(scope.disableCreateDeterminationButton).toBe(true);
    });

    it('should enable setDisableCreateDeterminationButton if treatmentPlansFactory.PredeterminationList is empty', function () {
      treatmentPlansFactory.PredeterminationList = [];
      ctrl.setDisableCreateDeterminationButton();
      timeout.flush();
      expect(scope.disableCreateDeterminationButton).toBe(true);
    });

    it('should disable setDisableCreateDeterminationButton if scope.hasBenefitPlan is false and treatmentPlansFactory.PredeterminationList is not empty and providerOnDetermination is selected', function () {
      scope.providerOnDetermination = { Id: 1 };
      scope.hasBenefitPlan = false;
      treatmentPlansFactory.PredeterminationList = [{ Id: 1 }];
      ctrl.setDisableCreateDeterminationButton();
      timeout.flush();
      expect(scope.disableCreateDeterminationButton).toBe(true);
    });
  });

  describe('ctrl.getPatientBenefitPlans -> ', function () {
    it('should call treatmentPlansFactory.DefaultProviderOnPredetermination with active tx plan  ', function () {
      ctrl.getPatientBenefitPlans();
      expect(
        patientBenefitPlansFactory.PatientBenefitPlans
      ).toHaveBeenCalledWith(scope.patientInfo.PatientId);
    });
  });

  describe('ctrl.setPlanOnPredetermination -> ', function () {
    it('should scope.hasBenefitPlan to true if patient has benefit plans', function () {
      spyOn(ctrl, 'setAllowCreatePredetermination');
      scope.patientBenefitPlans = [
        {
          BenefitPlanId: '211kuj889',
          PolicyHolderBenefitPlanDto: { BenefitPlanId: '1211kuj889' },
        },
      ];
      ctrl.setPlanOnPredetermination();
      expect(scope.hasBenefitPlan).toBe(true);
    });

    it('should scope.hasBenefitPlan to false if patient doesnt have benefit plans', function () {
      spyOn(ctrl, 'setAllowCreatePredetermination');
      scope.patientBenefitPlans = [];
      ctrl.setPlanOnPredetermination();
      expect(scope.hasBenefitPlan).toBe(false);
    });

    it('should call ctrl.setAllowCreatePredetermination', function () {
      spyOn(ctrl, 'setAllowCreatePredetermination');
      scope.patientBenefitPlans = [];
      ctrl.setPlanOnPredetermination();
      expect(ctrl.setAllowCreatePredetermination).toHaveBeenCalled();
    });
  });

  describe('$scope.totalFeesPerStage function ->', function () {
    it('should calculate total fees for stage', function () {
      var totalFees = 0;
      var stage = 1;
      var tp = angular.copy(txPlanData);
      angular.forEach(tp.TreatmentPlanServices, function (tps) {
        if (tps.TreatmentPlanServiceHeader.TreatmentPlanGroupNumber == stage) {
          var st = tps.ServiceTransaction;
          st.Tax = 10;
          st.Discount = 10;
          st.IsDeleted = false;
          totalFees += st.Fee - st.Discount + st.Tax;
        }
      });
      tp.TreatmentPlanServices.push({
        ServiceTransaction: {
          Fee: 100,
          Tax: 10,
          Discount: 10,
          IsDeleted: true,
        },
        TreatmentPlanServiceHeader: { TreatmentPlanGroupNumber: stage },
      });
      var result = scope.totalFeesPerStage(tp.TreatmentPlanServices, stage);
      expect(result).toBe(totalFees);
    });
  });

  describe('$scope.totalServicesPerStage function ->', function () {
    it('should calculate total services for stage', function () {
      var totalServices = 0;
      var stage = 1;
      var tp = angular.copy(txPlanData);
      angular.forEach(tp.TreatmentPlanServices, function (tps) {
        if (tps.TreatmentPlanServiceHeader.TreatmentPlanGroupNumber == stage) {
          tps.ServiceTransaction.IsDeleted = false;
          totalServices++;
        }
      });
      tp.TreatmentPlanServices.push({
        ServiceTransaction: {
          Fee: 100,
          Tax: 10,
          Discount: 10,
          IsDeleted: true,
        },
        TreatmentPlanServiceHeader: { TreatmentPlanGroupNumber: stage },
      });
      var result = scope.totalServicesPerStage(tp.TreatmentPlanServices, stage);
      expect(result).toBe(totalServices + 1);
    });
  });

  describe('$scope.totalInsuranceEstimatePerStage function ->', function () {
    var stage;
    var activeTreatmentPlan = {};
    beforeEach(function () {
      stage = 2;
      activeTreatmentPlan = _.cloneDeep(txPlanData);
      spyOn(scope, 'sum').and.returnValue(25.0);

      angular.forEach(
        activeTreatmentPlan.TreatmentPlanServices,
        function (tps) {
          // set the Amount, Ins Est , and Ins Est Adj
          tps.TreatmentPlanServiceHeader.TreatmentPlanGroupNumber = 2;
          tps.ServiceTransaction.IsDeleted = false;
          tps.ServiceTransaction.Amount = 100.0;
          tps.ServiceTransaction.Fee = 100.0;
          tps.ServiceTransaction.Discount = 10.0;
          tps.ServiceTransaction.Tax = 5.0;
          tps.ServiceTransaction.InsuranceEstimates = [];
          tps.ServiceTransaction.InsuranceEstimates.push({
            AdjEst: 0,
            EstInsurance: 0,
          });
        }
      );

      it('should total InsuranceEstimate for all services not marked IsDeleted or Completed', function () {
        var result = scope.totalInsuranceEstimatePerStage(
          activeTreatmentPlan.TreatmentPlanServices,
          stage
        );
        expect(result).toBe(125);
      });

      it('should not include serviceTransactions with IsDeleted', function () {
        // mark first service to deleted
        activeTreatmentPlan.TreatmentPlanServices[0].ServiceTransaction.IsDeleted = true;
        var result = scope.totalInsuranceEstimatePerStage(
          activeTreatmentPlan.TreatmentPlanServices,
          stage
        );
        expect(result).toBe(100);
      });

      it('should not include serviceTransactions with IsDeleted', function () {
        // mark first service ServiceTransactionStatusId to 4
        activeTreatmentPlan.TreatmentPlanServices[0].ServiceTransaction.ServiceTransactionStatusId = 4;
        var result = scope.totalInsuranceEstimatePerStage(
          activeTreatmentPlan.TreatmentPlanServices,
          stage
        );
        expect(result).toBe(100);
      });
    });
  });

  describe('$scope.totalAdjustedEstimatePerStage function ->', function () {
    var stage;
    var activeTreatmentPlan = {};
    beforeEach(function () {
      stage = 2;
      activeTreatmentPlan = _.cloneDeep(txPlanData);
      spyOn(scope, 'sum').and.returnValue(25.0);

      angular.forEach(
        activeTreatmentPlan.TreatmentPlanServices,
        function (tps) {
          // set the Amount, Ins Est , and Ins Est Adj
          tps.TreatmentPlanServiceHeader.TreatmentPlanGroupNumber = 2;
          tps.ServiceTransaction.IsDeleted = false;
          tps.ServiceTransaction.Amount = 100.0;
          tps.ServiceTransaction.Fee = 100.0;
          tps.ServiceTransaction.Discount = 10.0;
          tps.ServiceTransaction.Tax = 5.0;
          tps.ServiceTransaction.InsuranceEstimates = [];
          tps.ServiceTransaction.InsuranceEstimates.push({
            AdjEst: 0,
            EstInsurance: 0,
          });
        }
      );
    });

    it('should total AdjEst for all services not marked IsDeleted or Completed', function () {
      var result = scope.totalAdjustedEstimatePerStage(
        activeTreatmentPlan.TreatmentPlanServices,
        stage
      );
      expect(result).toBe(125);
    });

    it('should not include serviceTransactions with IsDeleted', function () {
      // mark first service to deleted
      activeTreatmentPlan.TreatmentPlanServices[0].ServiceTransaction.IsDeleted = true;
      var result = scope.totalAdjustedEstimatePerStage(
        activeTreatmentPlan.TreatmentPlanServices,
        stage
      );
      expect(result).toBe(100);
    });

    it('should not include serviceTransactions with IsDeleted', function () {
      // mark first service ServiceTransactionStatusId to 4
      activeTreatmentPlan.TreatmentPlanServices[0].ServiceTransaction.ServiceTransactionStatusId = 4;
      var result = scope.totalAdjustedEstimatePerStage(
        activeTreatmentPlan.TreatmentPlanServices,
        stage
      );
      expect(result).toBe(100);
    });
  });

  describe('$scope.formatPhoneNumberFromString function ->', function () {
    it('should format the phonenumber', function () {
      var result = scope.formatPhoneNumberFromString('1234567890');
      expect(result).toBe('(123)456-7890');
    });
  });

  describe('$scope.totalPatientPortionPerStage function ->', function () {
    var stage;
    var activeTreatmentPlan = {};
    beforeEach(function () {
      stage = 2;
      activeTreatmentPlan = _.cloneDeep(txPlanData);
      spyOn(scope, 'sum').and.returnValue(25.0);
      activeTreatmentPlan = angular.copy(txPlanData);

      angular.forEach(
        activeTreatmentPlan.TreatmentPlanServices,
        function (tps) {
          // set the Amount, Ins Est , and Ins Est Adj
          tps.TreatmentPlanServiceHeader.TreatmentPlanGroupNumber = 2;
          tps.ServiceTransaction.IsDeleted = false;
          tps.ServiceTransaction.Amount = 100.0;
          tps.ServiceTransaction.Fee = 100.0;
          tps.ServiceTransaction.Discount = 10.0;
          tps.ServiceTransaction.Tax = 5.0;
          tps.ServiceTransaction.InsuranceEstimates = [];
          tps.ServiceTransaction.InsuranceEstimates.push({
            AdjEst: 0,
            EstInsurance: 0,
          });
        }
      );
    });

    it('should total Amount minus AdjEst minus EstInsurance for all services not marked IsDeleted or Completed', function () {
      var result = scope.totalPatientPortionPerStage(
        activeTreatmentPlan.TreatmentPlanServices,
        stage
      );
      expect(result).toBe(250);
    });

    it('should not include serviceTransactions with IsDeleted', function () {
      // mark first service to deleted
      activeTreatmentPlan.TreatmentPlanServices[0].ServiceTransaction.IsDeleted = true;
      var result = scope.totalPatientPortionPerStage(
        activeTreatmentPlan.TreatmentPlanServices,
        stage
      );
      expect(result).toBe(200);
    });

    it('should not include serviceTransactions with IsDeleted', function () {
      // mark first service ServiceTransactionStatusId to 4
      activeTreatmentPlan.TreatmentPlanServices[0].ServiceTransaction.ServiceTransactionStatusId = 4;
      var result = scope.totalPatientPortionPerStage(
        activeTreatmentPlan.TreatmentPlanServices,
        stage
      );
      expect(result).toBe(200);
    });
  });

  describe('$scope.viewTreatmentPlanDocument function -> ', function () {
    var txPlanDoc;

    beforeEach(function () {
      txPlanDoc = {};
    });

    it('should call treatmentPlanDocumentFactory.ViewTreatmentPlanSnapshot if MimeType is Digital and DocumentGroupId is 10 (i.e. a snapshot)', function () {
      txPlanDoc.MimeType = 'Digital';
      txPlanDoc.DocumentGroupId = 10;
      scope.viewTreatmentPlanDocument(txPlanDoc);
      expect(
        treatmentPlanDocumentFactory.ViewTreatmentPlanSnapshot
      ).toHaveBeenCalled();
    });

    it('should call informedConsentFactory.view if MimeType is Digital and DocumentGroupId is 2 (i.e. informed consent)', function () {
      txPlanDoc.MimeType = 'Digital';
      txPlanDoc.DocumentGroupName = 'Consent';
      scope.viewTreatmentPlanDocument(txPlanDoc);
      expect(informedConsentFactory.view).toHaveBeenCalledWith(txPlanDoc);
    });

    it('should call documentService.getByDocumentId if txPlanDoc is a regular document', function () {
      txPlanDoc.MimeType = 'image/jpeg';
      scope.viewTreatmentPlanDocument(txPlanDoc);
      expect(documentService.getByDocumentId).toHaveBeenCalled();
    });

    it('should not call modalFactory.ConfirmModal if they dont have perms', function () {
      scope.treatmentPlanSnapshotAccess.Delete = false;
      scope.viewTreatmentPlanDocument(txPlanDoc);
      expect(modalFactory.ConfirmModal).not.toHaveBeenCalled();
    });
  });

  describe('$scope.deleteTreatmentPlanDocument function -> ', function () {
    var txPlanDocument;

    beforeEach(function () {
      txPlanDocument = {};
    });

    it('should call modalFactory.ConfirmModal if they have perms', function () {
      scope.deleteTreatmentPlanDocument(txPlanDocument);
      expect(modalFactory.ConfirmModal).toHaveBeenCalled();
    });

    it('should not call modalFactory.ConfirmModal if they dont have perms', function () {
      scope.treatmentPlanSnapshotAccess.Delete = false;
      scope.deleteTreatmentPlanDocument(txPlanDocument);
      expect(modalFactory.ConfirmModal).not.toHaveBeenCalled();
    });
  });

  describe('ctrl.calculatePlanTotals method -> ', function () {
    beforeEach(function () {
      spyOn(scope, 'sum').and.returnValue(25.0);
      scope.activeTreatmentPlan = angular.copy(txPlanData);
      // mark first service ServiceTransactionStatusId to deleted
      scope.activeTreatmentPlan.TreatmentPlanServices[0].ServiceTransaction.IsDeleted = true;
      angular.forEach(
        scope.activeTreatmentPlan.TreatmentPlanServices,
        function (tps) {
          // set the Amount, Ins Est , and Ins Est Adj
          tps.ServiceTransaction.IsDeleted = false;
          tps.ServiceTransaction.Amount = 100.0;
          tps.ServiceTransaction.Fee = 100.0;
          tps.ServiceTransaction.Discount = 10.0;
          tps.ServiceTransaction.Tax = 5.0;
          tps.ServiceTransaction.InsuranceEstimates = [];
          tps.ServiceTransaction.InsuranceEstimates.push({
            AdjEst: 0,
            EstInsurance: 0,
          });
        }
      );
    });

    it('should calculate total fees for plan', function () {
      ctrl.calculatePlanTotals();
      expect(scope.totalFeesPerPlan).toEqual(500.0);
    });

    it('should calculate total Discounts for plan', function () {
      ctrl.calculatePlanTotals();
      expect(scope.totalDiscountsPerPlan).toEqual(50);
    });

    it('should calculate total tax for plan', function () {
      ctrl.calculatePlanTotals();
      expect(scope.totalTaxPerPlan).toEqual(25);
    });

    it('should calculate total amount for plan', function () {
      ctrl.calculatePlanTotals();
      expect(scope.totalAmountPerPlan).toEqual(500);
    });
  });

  describe('ctrl.calculateInsuranceTotals method -> ', function () {
    it('should calculate total insurance estimate for plan', function () {
      var totalInsEst = 0;
      scope.activeTreatmentPlan = angular.copy(txPlanData);
      angular.forEach(
        scope.activeTreatmentPlan.TreatmentPlanServices,
        function (tps) {
          var st = tps.ServiceTransaction;
          st.InsuranceEstimates = [{ EstInsurance: 10 }];
          totalInsEst += st.InsuranceEstimates[0].EstInsurance;
        }
      );
      scope.activeTreatmentPlan.TreatmentPlanServices.push({
        ServiceTransaction: {
          Amount: 100,
          InsuranceEstimates: [{ EstInsurance: 10 }],
          IsDeleted: true,
        },
      });
      ctrl.calculateInsuranceTotals();
      expect(scope.insuranceEstimateTotal).toEqual(totalInsEst);
    });

    it('should calculate total adjusted estimate for plan', function () {
      var totalAdjEst = 0;
      scope.activeTreatmentPlan = angular.copy(txPlanData);
      angular.forEach(
        scope.activeTreatmentPlan.TreatmentPlanServices,
        function (tps) {
          var st = tps.ServiceTransaction;
          st.InsuranceEstimates = [{ AdjEst: 10 }];
          totalAdjEst += st.InsuranceEstimates[0].AdjEst;
        }
      );
      scope.activeTreatmentPlan.TreatmentPlanServices.push({
        ServiceTransaction: {
          Amount: 100,
          InsuranceEstimates: [{ AdjEst: 10 }],
          IsDeleted: true,
        },
      });
      ctrl.calculateInsuranceTotals();
      expect(scope.adjustedEstimateTotal).toEqual(totalAdjEst);
    });

    it('should calculate total patient portion for plan', function () {
      var totalPatPortion = 0;
      scope.activeTreatmentPlan = angular.copy(txPlanData);
      angular.forEach(
        scope.activeTreatmentPlan.TreatmentPlanServices,
        function (tps) {
          var st = tps.ServiceTransaction;
          st.InsuranceEstimates = [{ AdjEst: 10, EstInsurance: 20 }];
          totalPatPortion +=
            st.Amount -
            st.InsuranceEstimates[0].AdjEst -
            st.InsuranceEstimates[0].EstInsurance;
        }
      );
      scope.activeTreatmentPlan.TreatmentPlanServices.push({
        ServiceTransaction: {
          Amount: 100,
          InsuranceEstimates: [{ AdjEst: 10, EstInsurance: 20 }],
          IsDeleted: true,
        },
      });
      ctrl.calculateInsuranceTotals();
      expect(scope.patientPortionTotal).toEqual(totalPatPortion);
    });

    it('should set patient balance on services', function () {
      scope.activeTreatmentPlan = angular.copy(txPlanData);
      angular.forEach(
        scope.activeTreatmentPlan.TreatmentPlanServices,
        function (tps) {
          var st = tps.ServiceTransaction;
          st.InsuranceEstimates = [{ AdjEst: 10, EstInsurance: 20 }];
          st.PatientBalance = 0;
        }
      );
      var deletedService = {
        ServiceTransaction: {
          PatientBalance: 100,
          Amount: 100,
          InsuranceEstimates: [{ AdjEst: 10, EstInsurance: 20 }],
          IsDeleted: true,
        },
      };
      scope.activeTreatmentPlan.TreatmentPlanServices.push(deletedService);
      ctrl.calculateInsuranceTotals();
      var st0 =
        scope.activeTreatmentPlan.TreatmentPlanServices[0].ServiceTransaction;
      expect(st0.PatientBalance).toBe(
        st0.Amount -
          st0.InsuranceEstimates[0].EstInsurance -
          st0.InsuranceEstimates[0].AdjEst
      );
      expect(deletedService.ServiceTransaction.PatientBalance).toBe(0);
    });

    it('should ignore serviceTransactions with Completed status when calculating total patient portion for plan', function () {
      spyOn(scope, 'sum').and.returnValue(25.0);
      scope.activeTreatmentPlan = angular.copy(txPlanData);
      // mark first service ServiceTransactionStatusId to completed
      scope.activeTreatmentPlan.TreatmentPlanServices[0].ServiceTransaction.ServiceTransactionStatusId = 4;
      angular.forEach(
        scope.activeTreatmentPlan.TreatmentPlanServices,
        function (tps) {
          // set the Amount, Ins Est , and Ins Est Adj
          tps.ServiceTransaction.IsDeleted = false;
          tps.ServiceTransaction.Amount = 100.0;
          tps.ServiceTransaction.Fee = 100.0;
          tps.ServiceTransaction.InsuranceEstimates = [];
          tps.ServiceTransaction.InsuranceEstimates.push({
            AdjEst: 0,
            EstInsurance: 0,
          });
          // if serviceTransaction.ServiceTransactionStatusId = 4 do not include in total
        }
      );
      ctrl.calculateInsuranceTotals();
      expect(scope.patientPortionTotal).toEqual(200);
    });

    it('should ignore serviceTransactions with Rejected status when calculating total patient portion for plan', function () {
      spyOn(scope, 'sum').and.returnValue(25.0);
      scope.activeTreatmentPlan = angular.copy(txPlanData);
      // mark first service ServiceTransactionStatusId to Rejected
      scope.activeTreatmentPlan.TreatmentPlanServices[0].ServiceTransaction.ServiceTransactionStatusId = 3;
      angular.forEach(
        scope.activeTreatmentPlan.TreatmentPlanServices,
        function (tps) {
          // set the Amount, Ins Est , and Ins Est Adj
          tps.ServiceTransaction.IsDeleted = false;
          tps.ServiceTransaction.Amount = 100.0;
          tps.ServiceTransaction.Fee = 100.0;
          tps.ServiceTransaction.InsuranceEstimates = [];
          tps.ServiceTransaction.InsuranceEstimates.push({
            AdjEst: 0,
            EstInsurance: 0,
          });
          // if serviceTransaction.ServiceTransactionStatusId = 3 do not include in total
        }
      );
      ctrl.calculateInsuranceTotals();
      expect(scope.patientPortionTotal).toEqual(200);
    });

    it('should ignore serviceTransactions with Referred status when calculating total patient portion for plan', function () {
      spyOn(scope, 'sum').and.returnValue(25.0);
      scope.activeTreatmentPlan = angular.copy(txPlanData);
      // mark first service ServiceTransactionStatusId to Rejected
      scope.activeTreatmentPlan.TreatmentPlanServices[0].ServiceTransaction.ServiceTransactionStatusId = 2;
      angular.forEach(
        scope.activeTreatmentPlan.TreatmentPlanServices,
        function (tps) {
          // set the Amount, Ins Est , and Ins Est Adj
          tps.ServiceTransaction.IsDeleted = false;
          tps.ServiceTransaction.Amount = 100.0;
          tps.ServiceTransaction.Fee = 100.0;
          tps.ServiceTransaction.InsuranceEstimates = [];
          tps.ServiceTransaction.InsuranceEstimates.push({
            AdjEst: 0,
            EstInsurance: 0,
          });
          // if serviceTransaction.ServiceTransactionStatusId = 2 do not include in total
        }
      );
      ctrl.calculateInsuranceTotals();
      expect(scope.patientPortionTotal).toEqual(200);
    });

    it('should ignore serviceTransactions with Referredcompleted status when calculating total patient portion for plan', function () {
      spyOn(scope, 'sum').and.returnValue(25.0);
      scope.activeTreatmentPlan = angular.copy(txPlanData);
      // mark first service ServiceTransactionStatusId to Rejected
      scope.activeTreatmentPlan.TreatmentPlanServices[0].ServiceTransaction.ServiceTransactionStatusId = 8;
      angular.forEach(
        scope.activeTreatmentPlan.TreatmentPlanServices,
        function (tps) {
          // set the Amount, Ins Est , and Ins Est Adj
          tps.ServiceTransaction.IsDeleted = false;
          tps.ServiceTransaction.Amount = 100.0;
          tps.ServiceTransaction.Fee = 100.0;
          tps.ServiceTransaction.InsuranceEstimates = [];
          tps.ServiceTransaction.InsuranceEstimates.push({
            AdjEst: 0,
            EstInsurance: 0,
          });
          // if serviceTransaction.ServiceTransactionStatusId = 8 do not include in total
        }
      );
      ctrl.calculateInsuranceTotals();
      expect(scope.patientPortionTotal).toEqual(200);
    });
  });

  describe('getServicesForRollback function -> ', function () {
    var mockTreatmentPlan = {};
    beforeEach(function () {
      mockTreatmentPlan = {
        TreatmentPlanHeader: {},
        TreatmentPlanServices: [
          {
            TreatmentPlanServiceHeader: 1,
            ServiceTransaction: { AppointmentId: null },
          },
          {
            TreatmentPlanServiceHeader: 2,
            ServiceTransaction: { AppointmentId: null },
          },
          {
            TreatmentPlanServiceHeader: 3,
            ServiceTransaction: { AppointmentId: null },
          },
        ],
      };
    });

    it('should load servicesForRollback list from activeTreatmentPlan ', function () {
      scope.activeTreatmentPlan = angular.copy(mockTreatmentPlan);
      ctrl.getServicesForRollback(
        scope.activeTreatmentPlan.TreatmentPlanServices
      );
      expect(scope.servicesForRollback.length).toBe(3);
    });
  });

  describe('loadProviders function -> ', function () {
    beforeEach(function () {
      scope.providers = [];
    });
    it('should load providers from referenceDataService if parent loaded them', function () {
      ctrl.loadProviders();
      expect(referenceDataService.getData).toHaveBeenCalledWith(
        referenceDataService.entityNames.users
      );
    });
  });

  describe('addUserCodeToServices function -> ', function () {
    var selectedProvider;

    beforeEach(function () {
      scope.activeTreatmentPlan = angular.copy(txPlanData);
    });

    it('should add UserCode to any service that does not have one', function () {
      var userCode = 'BOBO1';
      scope.activeTreatmentPlan.TreatmentPlanHeader.CreatedDate =
        '2018-09-18T02:35:37.3289045';
      scope.activeTreatmentPlan.TreatmentPlanServices[0].ServiceTransaction.UserCode = null;
      selectedProvider = { ProviderId: '123456', UserCode: userCode };
      spyOn(listHelper, 'findItemByFieldValue').and.returnValue(
        selectedProvider
      );

      ctrl.addUserCodeToServices(scope.activeTreatmentPlan);
      expect(
        scope.activeTreatmentPlan.TreatmentPlanServices[0].ServiceTransaction
          .UserCode
      ).toEqual(userCode);
    });

    it('should not add UserCode to any service that has one', function () {
      var userCode = 'BOBO1';
      scope.activeTreatmentPlan.TreatmentPlanServices[0].ServiceTransaction.UserCode =
        'DODO2';
      selectedProvider = { ProviderId: '123456', UserCode: userCode };
      spyOn(listHelper, 'findItemByFieldValue').and.returnValue(
        selectedProvider
      );

      ctrl.addUserCodeToServices(scope.activeTreatmentPlan);
      expect(
        scope.activeTreatmentPlan.TreatmentPlanServices[0].ServiceTransaction
          .UserCode
      ).toEqual('DODO2');
    });
  });

  describe('addUserCodeToServices function -> ', function () {
    beforeEach(function () {
      scope.activeTreatmentPlan = angular.copy(txPlanData);
    });

    it('should add UserCode to any service that does not have one', function () {
      var userCode = 'BOBO1';
      scope.activeTreatmentPlan.TreatmentPlanServices[0].ServiceTransaction.UserCode = null;
      var selectedProvider = { ProviderId: '123456', UserCode: userCode };
      spyOn(listHelper, 'findItemByFieldValue').and.returnValue(
        selectedProvider
      );

      ctrl.addUserCodeToServices(scope.activeTreatmentPlan);
      expect(
        scope.activeTreatmentPlan.TreatmentPlanServices[0].ServiceTransaction
          .UserCode
      ).toEqual(userCode);
    });
  });

  describe('ctrl.onActiveTreatmentPlanChange method -> ', function () {
    var activeTreatmentPlan = {};

    beforeEach(function () {
      activeTreatmentPlan = {
        TreatmentPlanHeader: {
          TreatmentPlanId: 20,
          CollapsedViewVisible: true,
          CreatedDate: '2018-09-18T02:35:37.3289045',
          SortSettings: null,
        },
        TreatmentPlanServices: [],
      };
      spyOn(ctrl, 'setSelected');
      spyOn(ctrl, 'addUserCodeToServices');
      spyOn(ctrl, 'checkForReceivedPredetermination');
      spyOn(ctrl, 'initPredeterminationList');
      spyOn(ctrl, 'setDisableCreateDeterminationButton');
      spyOn(ctrl, 'getTreatmentPlanDocuments');
      spyOn(ctrl, 'checkIsPlanDuplicatable');
      spyOn(ctrl, 'resetPredeterminationFlags');
      spyOn(ctrl, 'getServicesForRollback');
      spyOn(ctrl, 'setDisableCreateAppointmentButton');
      spyOn(ctrl, 'setAddProposedServiceButton');
      spyOn(scope, 'getAllDocumentGroups');
      scope.providers = [];
    });
    it('should call scope.getAllDocumentGroups', function () {
      ctrl.onActiveTreatmentPlanChange(activeTreatmentPlan);
      expect(scope.getAllDocumentGroups).toHaveBeenCalledWith();
    });
    it('should call ctrl.setAddProposedServiceButton', function () {
      ctrl.onActiveTreatmentPlanChange(activeTreatmentPlan);
      expect(ctrl.setAddProposedServiceButton).toHaveBeenCalledWith(
        activeTreatmentPlan
      );
    });
    it('should call ctrl.getServicesForRollback', function () {
      ctrl.onActiveTreatmentPlanChange(activeTreatmentPlan);
      expect(ctrl.getServicesForRollback).toHaveBeenCalledWith(
        activeTreatmentPlan.TreatmentPlanServices
      );
    });
    it('should call ctrl.setDisableCreateAppointmentButton', function () {
      ctrl.onActiveTreatmentPlanChange(activeTreatmentPlan);
      expect(ctrl.setDisableCreateAppointmentButton).toHaveBeenCalledWith(
        activeTreatmentPlan
      );
    });

    it('should call ctrl.addUserCodeToServices', function () {
      ctrl.onActiveTreatmentPlanChange(activeTreatmentPlan);
      expect(ctrl.addUserCodeToServices).toHaveBeenCalled();
    });

    it('should call ctrl.getTreatmentPlanDocuments', function () {
      ctrl.onActiveTreatmentPlanChange(activeTreatmentPlan);
      expect(ctrl.getTreatmentPlanDocuments).toHaveBeenCalledWith(
        activeTreatmentPlan.TreatmentPlanHeader.TreatmentPlanId
      );
    });
    it('should call predetermination methods', function () {
      ctrl.onActiveTreatmentPlanChange(activeTreatmentPlan);
      expect(ctrl.checkForReceivedPredetermination).toHaveBeenCalled();
      expect(ctrl.initPredeterminationList).toHaveBeenCalled();
      expect(ctrl.resetPredeterminationFlags).toHaveBeenCalled();
      expect(ctrl.checkForReceivedPredetermination).toHaveBeenCalled();
      expect(ctrl.setDisableCreateDeterminationButton).toHaveBeenCalled();
      expect(ctrl.checkIsPlanDuplicatable).toHaveBeenCalledWith(
        activeTreatmentPlan.TreatmentPlanServices,
        activeTreatmentPlan.TreatmentPlanServices.Status
      );
    });
    it('should call checkIsPlanDuplicatable methods', function () {
      ctrl.onActiveTreatmentPlanChange(activeTreatmentPlan);
      expect(ctrl.checkIsPlanDuplicatable).toHaveBeenCalledWith(
        activeTreatmentPlan.TreatmentPlanServices,
        activeTreatmentPlan.TreatmentPlanServices.Status
      );
    });
  });

  describe('setSelected method -> ', function () {
    var activeTreatmentPlan = {
      TreatmentPlanHeader: { TreatmentPlanId: 20, CollapsedViewVisible: true },
      TreatmentPlanServices: [],
    };
    activeTreatmentPlan.TreatmentPlanServices.push({ ServiceTransaction: {} });
    activeTreatmentPlan.TreatmentPlanServices.push({ ServiceTransaction: {} });
    beforeEach(function () {
      treatmentPlansFactory.ActiveTreatmentPlan = {
        TreatmentPlanHeader: { TreatmentPlanId: 1 },
      };
    });

    it('should default all services to $$IncludeInAppointment = true ', function () {
      ctrl.setSelected(activeTreatmentPlan);
      _.forEach(activeTreatmentPlan.TreatmentPlanServices, function (tps) {
        expect(tps.ServiceTransaction.$$IncludeInAppointment).toBe(true);
      });
    });
  });

  describe('ctrl.addServicesToNewTreatmentPlan method -> ', function () {
    beforeEach(function () {
      treatmentPlansFactory.ActiveTreatmentPlan = {
        TreatmentPlanHeader: { TreatmentPlanId: 1 },
        TreatmentPlanServices: [],
      };
      spyOn(ctrl, 'setSelected');
    });

    it('should call CreateWithNoReload if we have services', function () {
      ctrl.addServicesToNewTreatmentPlan([{}], 1, true);
      expect(treatmentPlansFactory.CreateWithNoReload).toHaveBeenCalledWith(
        [{}],
        scope.personId,
        1
      );
    });

    it('should not call CreateWithNoReload if we have dont have services', function () {
      ctrl.addServicesToNewTreatmentPlan([], 1, true);
      expect(treatmentPlansFactory.CreateWithNoReload).not.toHaveBeenCalled();
    });
  });

  describe('ctrl.addServicesToTreatmentPlan method -> ', function () {
    var newServices = [];
    beforeEach(function () {
      newServices = [{}, {}];
      spyOn(ctrl, 'addServicesToNewTreatmentPlan');
      spyOn(ctrl, 'checkServicesAppointments');
    });

    it('should call addServicesToNewTreatmentPlan if this is a new treatmentPlan', function () {
      scope.activeTreatmentPlan = {
        TreatmentPlanHeader: { TreatmentPlanId: null },
        TreatmentPlanServices: [],
      };
      ctrl.addServicesToTreatmentPlan([{}, {}], 1, true);
      expect(ctrl.addServicesToNewTreatmentPlan).toHaveBeenCalledWith(
        newServices,
        1,
        true
      );
    });

    it('should call checkServicesAppointments if this is not a new treatmentPlan', function () {
      scope.activeTreatmentPlan = {
        TreatmentPlanHeader: { TreatmentPlanId: 1 },
        TreatmentPlanServices: [{}, {}],
      };
      ctrl.addServicesToTreatmentPlan([{}, {}], 1, false);
      expect(ctrl.checkServicesAppointments).toHaveBeenCalledWith(
        [{}, {}],
        1,
        false
      );
    });

    it('should not call addServicesToNewTreatmentPlan services null or empty', function () {
      scope.activeTreatmentPlan = {
        TreatmentPlanHeader: { TreatmentPlanId: null },
        TreatmentPlanServices: [],
      };
      ctrl.addServicesToTreatmentPlan([], 1, true);
      expect(ctrl.addServicesToNewTreatmentPlan).not.toHaveBeenCalled();
    });
  });

  describe('ctrl.initializeServicesOnNewTreatmentPlan method -> ', function () {
    var newTreatmentPlan = {};
    var serviceTransaction = 'serviceTransaction';
    beforeEach(function () {
      newTreatmentPlan = {
        TreatmentPlanHeader: {},
        TreatmentPlanServices: [{ ServiceTransaction: serviceTransaction }],
      };
      spyOn(ctrl, 'addServicesToNewTreatmentPlan');
      spyOn(ctrl, 'checkServicesAppointments');
      treatmentPlansFactory.RefreshTreatmentPlanServices = jasmine.createSpy();
    });

    it('should initialize stages ', function () {
      ctrl.initializeServicesOnNewTreatmentPlan(newTreatmentPlan);
      expect(treatmentPlansFactory.SetActiveTreatmentPlan).toHaveBeenCalled();
    });

    it('should call supporting factory methods ', function () {
      ctrl.initializeServicesOnNewTreatmentPlan(newTreatmentPlan);
      expect(treatmentPlansFactory.GetTotalFees).toHaveBeenCalledWith(
        newTreatmentPlan
      );
      expect(treatmentPlansFactory.GetDaysAgo).toHaveBeenCalledWith(
        newTreatmentPlan.TreatmentPlanHeader
      );
      expect(treatmentPlansFactory.AddAreaToServices).toHaveBeenCalledWith(
        newTreatmentPlan.TreatmentPlanServices
      );
      expect(
        treatmentPlansFactory.RefreshTreatmentPlanServices
      ).toHaveBeenCalledWith([serviceTransaction]);
    });

    it('should broadcast that services have been added to treatment plan ', function () {
      spyOn(rootScope, '$broadcast');
      ctrl.initializeServicesOnNewTreatmentPlan(newTreatmentPlan);
      expect(rootScope.$broadcast).toHaveBeenCalledWith(
        'serviceHeadersUpdated'
      );
    });
  });

  describe('treatmentPlansFactory.NewTreatmentPlan watch -> ', function () {
    var newTreatmentPlan = {
      TreatmentPlanHeader: {
        TreatmentPlanId: null,
        HasAtLeastOnePredetermination: false,
      },
      TreatmentPlanServices: [],
    };
    beforeEach(function () {
      scope.activeTreatmentPlan = {
        TreatmentPlanHeader: {
          TreatmentPlanId: '1234',
          HasAtLeastOnePredetermination: false,
        },
        TreatmentPlanServices: [],
      };
    });

    it('should set activeTreatmentPlan to newTreatmentPlan', function () {
      treatmentPlansFactory.NewTreatmentPlan = newTreatmentPlan;
      scope.$apply();
      expect(scope.activeTreatmentPlan).toEqual(newTreatmentPlan);
    });

    it('should initialize stages', function () {
      treatmentPlansFactory.NewTreatmentPlan = newTreatmentPlan;
      scope.$apply();
      expect(scope.planStages[0].stageno).toEqual(1);
      expect(scope.planStages.length).toEqual(1);
    });

    it('should reset scope.properties', function () {
      scope.treatmentPlanDocuments = [{}, {}];
      scope.servicesForRollback = [{}, {}];
      treatmentPlansFactory.NewTreatmentPlan = newTreatmentPlan;
      scope.$apply();
      expect(scope.treatmentPlanDocuments).toEqual([]);
      expect(scope.servicesForRollback).toEqual([]);
    });
  });

  describe('$scope.createDuplicatePlan method -> ', function () {
    beforeEach(function () {
      scope.activeTreatmentPlan = {
        TreatmentPlanHeader: {
          TreatmentPlanId: '1234',
          HasAtLeastOnePredetermination: false,
        },
        TreatmentPlanServices: [
          { TreatmentPlanServiceHeader: { TreatmentPlanId: '1234' } },
          { TreatmentPlanServiceHeader: { TreatmentPlanId: '1234' } },
        ],
      };
      scope.viewSettings = { expandView: false, txPlanActiveId: null };
    });

    it('should create duplicate plan of activeTreatmentPlan and set TreatmentPlanIds to null on duplicate', function () {
      scope.createDuplicatePlan();
      expect(treatmentPlansFactory.Create).toHaveBeenCalled();
    });

    it('should not change scope.activeTreatmentPlan', function () {
      var activeTreatmentPlan = angular.copy(scope.activeTreatmentPlan);
      scope.createDuplicatePlan();
      expect(scope.activeTreatmentPlan).toEqual(activeTreatmentPlan);
    });
  });

  describe('activeTreatmentPlan.TreatmentPlanServices watch -> ', function () {
    beforeEach(function () {
      scope.activeTreatmentPlan = { TreatmentPlanServices: [] };
      scope.$apply();
      spyOn(ctrl, 'calculateInsuranceTotals');
      spyOn(ctrl, 'calculatePlanTotals');
      spyOn(ctrl, 'setHasPredetermination').and.callFake(function () {});
    });

    it('should call treatmentPlansFactory.InitPredeterminationList', function () {
      scope.activeTreatmentPlan.TreatmentPlanServices = null;
      scope.$apply();
      scope.activeTreatmentPlan.TreatmentPlanServices =
        txPlanData.TreatmentPlanServices;
      scope.$apply();
      expect(
        treatmentPlansFactory.UpdatePredeterminationList
      ).toHaveBeenCalled();
    });

    it('should call treatmentPlansFactory.UpdatePredeterminationList for each service', function () {
      scope.activeTreatmentPlan.TreatmentPlanServices = null;
      scope.$apply();
      scope.activeTreatmentPlan.TreatmentPlanServices =
        txPlanData.TreatmentPlanServices;
      scope.$apply();
      _.forEach(scope.activeTreatmentPlan.TreatmentPlanServices, function () {
        expect(
          treatmentPlansFactory.UpdatePredeterminationList
        ).toHaveBeenCalled();
      });
    });

    it('should call methods', function () {
      scope.activeTreatmentPlan.TreatmentPlanServices = null;
      scope.$apply();
      expect(ctrl.calculateInsuranceTotals).toHaveBeenCalled();
      expect(ctrl.calculatePlanTotals).toHaveBeenCalled();
    });

    it('should call ctrl.recalculateInsuranceEstimates if scope.insuranceInitialized is false', function () {
      spyOn(ctrl, 'recalculateInsuranceEstimates');
      var treatmentPlanServices = _.cloneDeep(txPlanData.TreatmentPlanServices);
      scope.insuranceInitialized = false;
      scope.activeTreatmentPlan.TreatmentPlanServices = treatmentPlanServices;
      scope.$apply();
      expect(ctrl.recalculateInsuranceEstimates).toHaveBeenCalled();
    });

    describe('when TreatmentPlanServices is null or empty ->', function () {
      beforeEach(function () {
        scope.activeTreatmentPlan.TreatmentPlanServices = null;
        treatmentPlansFactory.AddAreaToServices.calls.reset();
        scope.$apply();
        scope.activeTreatmentPlan.TreatmentPlanServices = [];
        scope.$apply();
      });

      it('should not call treatmentPlansFactory.AddAreaToServices', function () {
        expect(treatmentPlansFactory.AddAreaToServices).not.toHaveBeenCalled();
      });
    });

    describe('when TreatmentPlanServices is not null or empty ->', function () {
      beforeEach(function () {
        scope.insuranceInitialized = true;
      });

      it('should call treatmentPlansFactory.AddAreaToServices', function () {
        treatmentPlansFactory.AddAreaToServices.calls.reset();
        scope.activeTreatmentPlan.TreatmentPlanServices.push({
          TreatmentPlanServiceHeader: { TreatmentPlanId: '1234' },
        });
        scope.$apply();
        expect(treatmentPlansFactory.AddAreaToServices).toHaveBeenCalledWith(
          scope.activeTreatmentPlan.TreatmentPlanServices
        );
      });

      describe('when scope.insuranceInitialized is true ->', function () {
        beforeEach(function () {
          scope.insuranceInitialized = true;
          scope.disablePrint = true;

          ctrl.updateInsuranceEstimateWithOverrides = jasmine.createSpy();
          ctrl.setHasPredetermination = jasmine.createSpy();
        });

        // NOTE this test failing because hasPredetermination not correct value
        it('should not call functions and set values', function () {
          scope.activeTreatmentPlan.TreatmentPlanServices.push({
            TreatmentPlanServiceHeader: { TreatmentPlanId: '1234' },
          });
          scope.$apply();
          expect(
            ctrl.updateInsuranceEstimateWithOverrides
          ).not.toHaveBeenCalled();
          expect(ctrl.setHasPredetermination).not.toHaveBeenCalled();
          expect(scope.disablePrint).toBe(true);
        });
      });

      describe('when scope.insuranceInitialized is false and TreatmentPlanHeader.TreatmentPlanId on all treatmentPlanServices is not null ->', function () {
        beforeEach(function () {
          scope.insuranceInitialized = false;
          scope.disablePrint = true;

          ctrl.updateInsuranceEstimateWithOverrides = jasmine.createSpy();
          ctrl.setHasPredetermination = jasmine.createSpy();
        });

        it('should call functions and set values', function () {
          scope.activeTreatmentPlan.TreatmentPlanServices.push({
            TreatmentPlanServiceHeader: { TreatmentPlanId: '1234' },
          });
          scope.$apply();
          timeout.flush();
          expect(ctrl.updateInsuranceEstimateWithOverrides).toHaveBeenCalled();
          expect(ctrl.setHasPredetermination).toHaveBeenCalled();
          expect(scope.disablePrint).toBe(false);
        });
      });

      describe('when scope.insuranceInitialized is false and TreatmentPlanHeader.TreatmentPlanId on all treatmentPlanServices is null ->', function () {
        beforeEach(function () {
          scope.insuranceInitialized = false;
          scope.disablePrint = true;
          ctrl.updateInsuranceEstimateWithOverrides = jasmine.createSpy();
          ctrl.setHasPredetermination = jasmine.createSpy();
        });

        // NOTE this test failing because hasPredetermination not correct value
        it('should not call functions and set values', function () {
          scope.activeTreatmentPlan.TreatmentPlanServices.push({
            TreatmentPlanServiceHeader: { TreatmentPlanId: null },
          });
          scope.$apply();
          expect(
            ctrl.updateInsuranceEstimateWithOverrides
          ).not.toHaveBeenCalled();
          expect(ctrl.setHasPredetermination).not.toHaveBeenCalled();
          expect(scope.disablePrint).toBe(true);
        });
      });

      describe('checkServicesAppointments method ->', function () {
        var services = [];
        beforeEach(function () {
          services = angular.copy(txPlanData.TreatmentPlanServices);
          scope.activeTreatmentPlan = angular.copy(txPlanData);
          scope.personId = '1234';
        });

        it('should call treatmentPlansFactory.GetTreatmentPlanById', function () {
          scope.activeTreatmentPlan.TreatmentPlanHeader.TreatmentPlanId =
            '1234';
          ctrl.checkServicesAppointments(services, 1, true);
          expect(
            treatmentPlansFactory.ServicesOnAppointments
          ).toHaveBeenCalledWith(
            scope.activeTreatmentPlan.TreatmentPlanHeader.TreatmentPlanId,
            1
          );
        });
      });

      describe(' ctrl.setDisplayDate method ->', function () {
        beforeEach(function () {
          scope.activeTreatmentPlan = {
            TreatmentPlanHeader: {
              CreatedDate: '2018-09-18T02:35:37.3289045',
            },
          };
        });

        it('should convert the activeTreatmentPlan.TreatmentPlanHeader.CreatedDate to a local $$DisplayCreatedDate for display', function () {
          ctrl.setDisplayDate(scope.activeTreatmentPlan);
          expect(
            scope.activeTreatmentPlan.TreatmentPlanHeader.$$DisplayCreatedDate
          ).toEqual('2018-09-18T02:35:37.3289045Z');
        });

        it('should not append Z if already the last character in string', function () {
          scope.activeTreatmentPlan.TreatmentPlanHeader.CreatedDate =
            '2018-09-18T02:35:37.3289045Z';
          ctrl.setDisplayDate(scope.activeTreatmentPlan);
          expect(
            scope.activeTreatmentPlan.TreatmentPlanHeader.$$DisplayCreatedDate
          ).toEqual('2018-09-18T02:35:37.3289045Z');
        });
      });

      describe('launchAddServiceToAppointmentModal method ->', function () {
        var servicesWithAppointments = [];
        var proposedServiceWithAppointment = {
          ServiceTransactionId: '1112',
          AppointmentId: '2341',
          $$new: false,
        };
        var proposedServiceWithOutAppointment = {
          ServiceTransactionId: '1555',
          AppointmentId: null,
        };
        beforeEach(function () {
          // both service transactions on plan have appointment ids
          servicesWithAppointments = [
            {
              TreatmentPlanServiceHeader: {
                TreatmentPlanServiceId: 1,
                TreatmentPlanId: 1,
              },
              ServiceTransaction: {
                ServiceTransactionId: '1122',
                AppointmentId: '1234',
              },
            },
            {
              TreatmentPlanServiceHeader: {
                TreatmentPlanServiceId: 1,
                TreatmentPlanId: 1,
              },
              ServiceTransaction: {
                ServiceTransactionId: '1133',
                AppointmentId: '1234',
              },
            },
          ];
        });
        it('should not launch TreatmentPlanAddToAppointment modal if the service is already attached to an appointment', function () {
          scope.launchAddServiceToAppointmentModal(
            [proposedServiceWithAppointment],
            1,
            true,
            servicesWithAppointments
          );
          expect(modalFactory.Modal).not.toHaveBeenCalled();
        });

        it('should launch TreatmentPlanAddToAppointment modal if the service is not already attached to an appointment and treatment plan has appointments', function () {
          scope.launchAddServiceToAppointmentModal(
            [proposedServiceWithOutAppointment],
            1,
            true,
            servicesWithAppointments
          );
          expect(modalFactory.Modal).toHaveBeenCalled();
        });

        it('should not launch TreatmentPlanAddToAppointment modal if the service is not already attached to an appointment and treatment plan does not have appointemnts', function () {
          scope.launchAddServiceToAppointmentModal(
            [proposedServiceWithOutAppointment],
            1,
            true,
            []
          );
          expect(modalFactory.Modal).not.toHaveBeenCalled();
        });
      });

      describe('ctrl.getNextPriorityNumber method ->', function () {
        beforeEach(function () {
          scope.activeTreatmentPlan = _.cloneDeep(txPlanData);
          var nextPriority = 1;
          _.forEach(
            scope.activeTreatmentPlan.TreatmentPlanServices,
            function (tps) {
              tps.TreatmentPlanServiceHeader.Priority = nextPriority;
              nextPriority++;
            }
          );
        });

        it('should calculate the nextPriority number for the TreatmentPlanServices on the activeTreatmentPlan', function () {
          var maxPriorityOnPlan =
            scope.activeTreatmentPlan.TreatmentPlanServices.length;
          var nextPriorityNumber = ctrl.getNextPriorityNumber();
          expect(nextPriorityNumber).toBe(maxPriorityOnPlan + 1);
        });

        it('should calculate the nextPriority number to be 1 if no TreatmentPlanServices on the activeTreatmentPlan', function () {
          scope.activeTreatmentPlan.TreatmentPlanServices = [];
          var nextPriorityNumber = ctrl.getNextPriorityNumber();
          expect(nextPriorityNumber).toBe(1);
        });
      });

      describe('ctrl.canCreateAnAppointment method ->', function () {
        var treatmentPlanServices = [];
        beforeEach(function () {
          scope.activeTreatmentPlan = _.cloneDeep(txPlanData);
          var nextPriority = 1;
          _.forEach(
            scope.activeTreatmentPlan.TreatmentPlanServices,
            function (tps) {
              tps.TreatmentPlanServiceHeader.Priority = nextPriority;
              nextPriority++;
            }
          );
          treatmentPlanServices = _.cloneDeep(
            scope.activeTreatmentPlan.TreatmentPlanServices
          );
          spyOn(ctrl, 'confirmServicesOnAppointment');
          spyOn(ctrl, 'confirmNoServices');
        });

        it('should return false if there are no treatmentPlanServices', function () {
          var treatmentPlanServices = [];
          expect(ctrl.canCreateAnAppointment(treatmentPlanServices)).toEqual(
            false
          );
        });

        it('should call ctrl.canCreateAnAppointment(treatmentPlanServices)  if there are no treatmentPlanServices', function () {
          var treatmentPlanServices = [];
          ctrl.canCreateAnAppointment(treatmentPlanServices);
          expect(ctrl.confirmNoServices).toHaveBeenCalled();
        });

        it('should return false if there are treatmentPlanServices but at least one as an AppointmentId', function () {
          treatmentPlanServices[0].ServiceTransaction.AppointmentId = 1234;
          expect(ctrl.canCreateAnAppointment(treatmentPlanServices)).toEqual(
            false
          );
        });

        it('should call ctrl.confirmServicesOnAppointment if there are treatmentPlanServices but at least one as an AppointmentId', function () {
          treatmentPlanServices[0].ServiceTransaction.AppointmentId = 1234;
          ctrl.canCreateAnAppointment(treatmentPlanServices);
          expect(ctrl.confirmServicesOnAppointment).toHaveBeenCalled();
        });

        it('should return true if there are treatmentPlanServices none have an AppointmentId', function () {
          //arrange

          _.forEach(treatmentPlanServices, function (tps) {
            //This will set schedulableLocations LocationId to the last serviceTransaction LocationId
            ctrl.schedulableLocations = [
              {
                LocationId: tps.ServiceTransaction.LocationId,
              },
            ];
            tps.ServiceTransaction.AppointmentId = null;
          });
          //assert
          expect(ctrl.canCreateAnAppointment(treatmentPlanServices)).toEqual(
            true
          );
        });

        it('uibModal.open is called when different service locations exist on a treatment plan and we try to create an appointment', function () {
          //arrange
          ctrl.schedulableLocations = [
            {
              LocationId: 4,
            },
          ];

          //Don't set an AppointmentId because we want treatmentPlanServicesOnAppointments to equal 0
          var treatmentPlanServices = [
            {
              ServiceTransaction: {
                LocationId: 4,
              },
            },
            {
              ServiceTransaction: {
                LocationId: 5,
              },
            },
          ];

          //act
          ctrl.canCreateAnAppointment(treatmentPlanServices);
          //assert
          expect($uibModal.open).toHaveBeenCalled();
        });

        it('uibModal.open is not called and should return true when the same service locations exist on a treatment plan and the user can schedule for that location when we try to create an appointment', function () {
          //arrange
          ctrl.schedulableLocations = [
            {
              LocationId: 4,
            },
            {
              LocationId: 5,
            },
          ];

          //Don't set an AppointmentId because we want treatmentPlanServicesOnAppointments to equal 0
          var treatmentPlanServices = [
            {
              ServiceTransaction: {
                LocationId: 4,
              },
            },
            {
              ServiceTransaction: {
                LocationId: 4,
              },
            },
          ];

          //act
          var canCreateAnAppointmentResult = ctrl.canCreateAnAppointment(
            treatmentPlanServices
          );
          //assert
          expect(canCreateAnAppointmentResult).toEqual(true);
        });

        it('uibModal.open is called and should return false when the same service locations exist on a treatment plan and the user cannnot schedule for that location when we try to create an appointment', function () {
          //arrange
          ctrl.schedulableLocations = [
            {
              LocationId: 4,
            },
            {
              LocationId: 5,
            },
          ];

          //Don't set an AppointmentId because we want treatmentPlanServicesOnAppointments to equal 0
          var treatmentPlanServices = [
            {
              ServiceTransaction: {
                LocationId: 3,
              },
            },
            {
              ServiceTransaction: {
                LocationId: 3,
              },
            },
          ];

          //act
          var canCreateAnAppointmentResult = ctrl.canCreateAnAppointment(
            treatmentPlanServices
          );
          //assert
          expect(canCreateAnAppointmentResult).toEqual(false);
        });
      });
    });

    describe('ctrl.setInsuranceOrderOnServices method ->', function () {
      var treatmentPlanServices = [];
      beforeEach(function () {
        scope.activeTreatmentPlan = _.cloneDeep(txPlanData);
        var nextPriority = 1;
        // Set Priority on TreatmentPlanServices.TreatmentPlanServiceHeader
        _.forEach(
          scope.activeTreatmentPlan.TreatmentPlanServices,
          function (treatmentPlanService) {
            treatmentPlanService.TreatmentPlanServiceHeader.Priority = nextPriority;
            nextPriority++;
          }
        );
        treatmentPlanServices = _.cloneDeep(
          scope.activeTreatmentPlan.TreatmentPlanServices
        );
      });

      it(
        'should set the InsuranceOrder on serviceTransactions that are to be added to an appointment based on the ' +
          'same order as maintained by the TreatmentPlanServiceHeader.ServiceTransaction.Priority',
        function () {
          // only send first and last service to create appointment Priority=1 and Priority = 5
          var servicesToSendToAppointment = [];
          servicesToSendToAppointment.push(treatmentPlanServices[0]);
          servicesToSendToAppointment.push(treatmentPlanServices[4]);
          ctrl.setInsuranceOrderOnServices(servicesToSendToAppointment);
          expect(
            servicesToSendToAppointment[0].ServiceTransaction.InsuranceOrder
          ).toBe(1);
          expect(
            servicesToSendToAppointment[1].ServiceTransaction.InsuranceOrder
          ).toBe(2);

          // only send first, third, and last service to create appointment Priority=1, Priority=3, and Priority = 5
          servicesToSendToAppointment = [];
          servicesToSendToAppointment.push(treatmentPlanServices[0]);
          servicesToSendToAppointment.push(treatmentPlanServices[2]);
          servicesToSendToAppointment.push(treatmentPlanServices[4]);
          ctrl.setInsuranceOrderOnServices(servicesToSendToAppointment);
          expect(
            servicesToSendToAppointment[0].ServiceTransaction.InsuranceOrder
          ).toBe(1);
          expect(
            servicesToSendToAppointment[1].ServiceTransaction.InsuranceOrder
          ).toBe(2);
          expect(
            servicesToSendToAppointment[2].ServiceTransaction.InsuranceOrder
          ).toBe(3);
        }
      );
    });

    describe('scope.createAppointment method ->', function () {
      beforeEach(function () {
        scope.activeTreatmentPlan = _.cloneDeep(txPlanData);
        var nextPriority = 1;
        // Set Priority on TreatmentPlanServices.TreatmentPlanServiceHeader
        _.forEach(
          scope.activeTreatmentPlan.TreatmentPlanServices,
          function (treatmentPlanService) {
            treatmentPlanService.TreatmentPlanServiceHeader.Priority = nextPriority;
            treatmentPlanService.ServiceTransaction.$$IncludeInAppointment = false;
            nextPriority++;
          }
        );
        spyOn(ctrl, 'setInsuranceOrderOnServices').and.callFake(function (
          treatmentPlanServices
        ) {
          return treatmentPlanServices;
        });
      });

      it('should call ctrl.canCreateAnAppointment', function () {
        spyOn(ctrl, 'canCreateAnAppointment');
        scope.createAppointment();
        expect(ctrl.canCreateAnAppointment).toHaveBeenCalled();
      });

      //TODO: Test broken
      //it('should call ctrl.setInsuranceOrderOnServices only if ctrl.canCreateAnAppointment returns true' , function () {
      //    //scope.activeTreatmentPlan = _.cloneDeep(txPlanData);
      //    //var nextPriority = 1;
      //    //_.forEach(scope.activeTreatmentPlan.TreatmentPlanServices, function (tps) {
      //    //    tps.TreatmentPlanServiceHeader.Priority = nextPriority;
      //    //    nextPriority++;
      //    //});
      //    debugger;
      //    treatmentPlanServices = _.cloneDeep(scope.activeTreatmentPlan.TreatmentPlanServices);
      //    spyOn(ctrl, 'canCreateAnAppointment').and.callFake(function () {
      //        return true;
      //    });

      //    debugger;
      //    scope.createAppointment();
      //    expect(ctrl.setInsuranceOrderOnServices).toHaveBeenCalled();
      //});

      it('should call ctrl.setInsuranceOrderOnServices only if ctrl.canCreateAnAppointment returns true', function () {
        spyOn(ctrl, 'canCreateAnAppointment').and.returnValue(false);
        scope.createAppointment();
        expect(ctrl.setInsuranceOrderOnServices).not.toHaveBeenCalled();
      });
    });

    describe('scope.updateStatus method ->', function () {
      var plan = {};
      beforeEach(function () {
        plan = {
          TreatmentPlanHeader: {
            TreatmentPlanId: 1,
            PersonId: 1,
            StatusId: 1,
            Status: 'Proposed',
            TreatmentPlanName: 'Treatment Plan',
            TreatmentPlanDescription: null,
            AlternateGroupId: 'GID1',
            SortSettings: null,
          },
        };
        spyOn(ctrl, 'validateForm').and.callFake(function () {
          scope.formIsValid = true;
        });

        scope.setDisableEditFunctions = jasmine.createSpy();
      });

      it('should set plan.TreatmentPlanHeader.Status to statusOption.StatusName', function () {
        var statusOption = { StatusName: 'Rejected', StatusId: 'Rejected' };
        plan.TreatmentPlanHeader.Status = 'Proposed';
        scope.updateStatus(plan, statusOption);
        expect(plan.TreatmentPlanHeader.Status).toEqual(statusOption.StatusId);
      });

      it('should not call treatmentPlansFactory.Update not updating plan.TreatmentPlanHeader.Status', function () {
        var statusOption = { StatusName: 'Proposed', StatusId: 'Proposed' };
        plan.TreatmentPlanHeader.Status = 'Proposed';
        scope.updateStatus(plan, statusOption);
        expect(treatmentPlansFactory.Update).not.toHaveBeenCalledWith(
          plan,
          false
        );
        expect(scope.setDisableEditFunctions).not.toHaveBeenCalled();
      });

      it('should call treatmentPlansFactory.Update with second parameter of false if we are not updating ServiceTransaction.ServiceTransactionStatusId', function () {
        var statusOption = { StatusName: 'Previewed', StatusId: 'Previewed' };
        plan.TreatmentPlanHeader.Status = 'Proposed';
        scope.updateStatus(plan, statusOption);
        expect(treatmentPlansFactory.Update).toHaveBeenCalledWith(plan, false);
        expect(scope.setDisableEditFunctions).toHaveBeenCalledWith(true);
      });

      it(
        'should call treatmentPlansFactory.Update with second parameter of true if we are updating ' +
          'ServiceTransaction.ServiceTransactionStatusId (plan.Status is Rejected or Accepted)',
        function () {
          var statusOption = { StatusName: 'Rejected', StatusId: 'Rejected' };
          plan.TreatmentPlanHeader.Status = 'Proposed';
          scope.updateStatus(plan, statusOption);
          expect(treatmentPlansFactory.Update).toHaveBeenCalledWith(plan, true);
          expect(scope.setDisableEditFunctions).toHaveBeenCalledWith(true);

          statusOption = { StatusName: 'Accepted', StatusId: 'Accepted' };
          plan.TreatmentPlanHeader.Status = 'Proposed';
          scope.updateStatus(plan, statusOption);
          expect(treatmentPlansFactory.Update).toHaveBeenCalledWith(plan, true);
          expect(scope.setDisableEditFunctions).toHaveBeenCalledWith(true);
        }
      );
    });
  });

  describe('ctrl.recalculateInsuranceEstimates method ->', function () {
    beforeEach(function () {
      spyOn(ctrl, 'updateInsuranceEstimateWithOverrides');
      spyOn(ctrl, 'calculateInsuranceTotals');
      spyOn(ctrl, 'calculatePlanTotals');
      spyOn(ctrl, 'setHasPredetermination');
    });

    it('should call ctrl.updateInsuranceEstimateWithOverrides', function () {
      ctrl.recalculateInsuranceEstimates();
      expect(ctrl.updateInsuranceEstimateWithOverrides).toHaveBeenCalled();
    });

    it('should call ctrl.calculateInsuranceTotals', function () {
      ctrl.recalculateInsuranceEstimates();
      expect(ctrl.calculateInsuranceTotals).toHaveBeenCalled();
    });

    it('should call ctrl.calculatePlanTotals', function () {
      ctrl.recalculateInsuranceEstimates();
      expect(ctrl.calculatePlanTotals).toHaveBeenCalled();
    });

    it('should call ctrl.setHasPredetermination', function () {
      ctrl.recalculateInsuranceEstimates();
      expect(ctrl.setHasPredetermination).toHaveBeenCalled();
    });
  });

  describe('scope.onUpLoadSuccess method ->', function () {
    beforeEach(function () {
      scope.docCtrls = { open: function () {}, close: function () {} };
      spyOn(ctrl, 'getTreatmentPlanDocuments').and.callFake(function () {});
      scope.activeTreatmentPlan = {
        TreatmentPlanHeader: { TreatmentPlanId: '1234' },
      };
    });

    it('should call ctrl.getTreatmentPlanDocuments', function () {
      scope.onUpLoadSuccess();
      expect(ctrl.getTreatmentPlanDocuments).toHaveBeenCalledWith(
        scope.activeTreatmentPlan.TreatmentPlanHeader.TreatmentPlanId
      );
    });

    it('should call scope.docCtrls.close', function () {
      spyOn(scope.docCtrls, 'close');
      scope.onUpLoadSuccess();
      expect(scope.docCtrls.close).toHaveBeenCalled();
    });
  });

  describe('scope.onUpLoadCancel method ->', function () {
    beforeEach(function () {
      scope.docCtrls = { open: function () {}, close: function () {} };
    });
    it('should call scope.docCtrls.close', function () {
      spyOn(scope.docCtrls, 'close');
      scope.onUpLoadCancel();
      expect(scope.docCtrls.close).toHaveBeenCalled();
    });
  });

  describe('scope.openDocUploader method ->', function () {
    beforeEach(function () {
      scope.docCtrls = {
        open: function () {},
        close: function () {},
        content: function () {},
        setOptions: function () {},
      };
      spyOn(ctrl, 'getTreatmentPlanDocuments').and.callFake(function () {});
    });

    it('should if scope.activeTreatmentPlan.TreatmentPlanHeader.TreatmentPlanId', function () {
      spyOn(scope.docCtrls, 'content');
      scope.activeTreatmentPlan = {
        TreatmentPlanHeader: { TreatmentPlanId: '1234' },
      };
      scope.openDocUploader();
      expect(scope.docCtrls.content).toHaveBeenCalledWith(
        '<doc-uploader [patient-id]="personId" [treatment-plan-id]="activeTreatmentPlan.TreatmentPlanHeader.TreatmentPlanId" (upload-cancel)="onUpLoadCancel($event)" (upload-success)="onUpLoadSuccess($event)"><doc-uploader>'
      );
    });

    it('should if not scope.activeTreatmentPlan.TreatmentPlanHeader.TreatmentPlanId', function () {
      scope.activeTreatmentPlan = {
        TreatmentPlanHeader: { TreatmentPlanId: null },
      };
      spyOn(scope.docCtrls, 'content');
      scope.openDocUploader();
      expect(scope.docCtrls.content).not.toHaveBeenCalled();
    });
  });

  describe('scope.resetEstimatedInsurance method ->', function () {
    beforeEach(function () {});

    it('should call treatmentPlansFactory.ResetEstimatedInsurance', function () {
      scope.activeTreatmentPlan = {
        TreatmentPlanHeader: { TreatmentPlanId: '1234' },
      };
      scope.personId = 'test';
      scope.setDisableEditFunctions = jasmine.createSpy();

      scope.resetEstimatedInsurance();

      expect(
        treatmentPlansFactory.ResetEstimatedInsurance
      ).toHaveBeenCalledWith(scope.activeTreatmentPlan);
      expect(scope.setDisableEditFunctions).toHaveBeenCalledWith(true);
    });
  });

  describe('scope.setResetEstimatedInsuranceState method ->', function () {
    beforeEach(function () {});

    it('should set isResetEstimatedInsuranceEnabled to true when at least one treatment plan service est ins is overridden', function () {
      scope.isResetEstimatedInsuranceEnabled = false;

      scope.activeTreatmentPlan = {
        TreatmentPlanHeader: { TreatmentPlanId: '1234' },
        TreatmentPlanServices: [
          {
            TreatmentPlanServiceHeader: {
              TreatmentPlanInsuranceEstimates: [
                { IsUserOverRidden: false },
                { IsUserOverRidden: false },
              ],
            },
          },
          {
            TreatmentPlanServiceHeader: {
              TreatmentPlanInsuranceEstimates: [
                { IsUserOverRidden: false },
                { IsUserOverRidden: true },
              ],
            },
          },
        ],
      };

      ctrl.setResetEstimatedInsuranceState();
      expect(scope.isResetEstimatedInsuranceEnabled).toBe(true);
    });

    it('should set isResetEstimatedInsuranceEnabled to false when no treatment plan service est insurances are overridden', function () {
      scope.isResetEstimatedInsuranceEnabled = true;

      scope.activeTreatmentPlan = {
        TreatmentPlanHeader: { TreatmentPlanId: '1234' },
        TreatmentPlanServices: [
          {
            TreatmentPlanServiceHeader: {
              TreatmentPlanInsuranceEstimates: [
                { IsUserOverRidden: false },
                { IsUserOverRidden: false },
              ],
            },
          },
          {
            TreatmentPlanServiceHeader: {
              TreatmentPlanInsuranceEstimates: [
                { IsUserOverRidden: false },
                { IsUserOverRidden: false },
              ],
            },
          },
        ],
      };

      ctrl.setResetEstimatedInsuranceState();
      expect(scope.isResetEstimatedInsuranceEnabled).toBe(false);
    });

    it('should set isResetEstimatedInsuranceEnabled to false when no treatment plan service est insurances are overridden', function () {
      scope.isResetEstimatedInsuranceEnabled = true;

      scope.activeTreatmentPlan = {
        TreatmentPlanHeader: { TreatmentPlanId: '1234' },
        TreatmentPlanServices: [
          {
            TreatmentPlanServiceHeader: { TreatmentPlanInsuranceEstimates: [] },
          },
          {
            TreatmentPlanServiceHeader: { TreatmentPlanInsuranceEstimates: [] },
          },
        ],
      };

      ctrl.setResetEstimatedInsuranceState();
      expect(scope.isResetEstimatedInsuranceEnabled).toBe(false);
    });

    it('should set isResetEstimatedInsuranceEnabled to false when no treatment plan service est insurances are overridden', function () {
      scope.isResetEstimatedInsuranceEnabled = true;

      scope.activeTreatmentPlan = {};

      ctrl.setResetEstimatedInsuranceState();
      expect(scope.isResetEstimatedInsuranceEnabled).toBe(false);
    });
  });

  describe('scope.serviceTransactionsUpdated method -> ', function () {
    beforeEach(function () {
      scope.proposedServices = [
        { ServiceTransaction: { ServiceTransactionId: '1' } },
        { ServiceTransaction: { ServiceTransactionId: '2' } },
      ];
      scope.activeTreatmentPlan = {
        TreatmentPlanHeader: { PersonId: 'personId' },
        TreatmentPlanServices: [
          {
            TreatmentPlanServiceHeader: {},
            ServiceTransaction: { ServiceTransactionId: '1' },
          },
        ],
      };
      ctrl.setResetEstimatedInsuranceState = jasmine.createSpy();
    });

    it('should call treatment plan factory methods for insurance calculations', function () {
      scope.setDisableEditFunctions = jasmine.createSpy();
      patientServicesFactory.GetTaxAndDiscountByPersonId = jasmine
        .createSpy()
        .and.returnValue({
          then: (success, failure) =>
            success({ Value: [{ ServiceTransactionId: '1' }] }),
        });
      treatmentPlansFactory.CalculateInsuranceEstimateWithOverrides = jasmine
        .createSpy()
        .and.returnValue({
          then: (success, failure) =>
            success({ Value: { ServiceTransactionId: '1' } }),
        });

      scope.serviceTransactionsUpdated([{ ServiceTransactionId: '1' }]);

      expect(
        patientServicesFactory.GetTaxAndDiscountByPersonId
      ).toHaveBeenCalled();
      expect(
        treatmentPlansFactory.CalculateInsuranceEstimateWithOverrides
      ).toHaveBeenCalled();
      expect(treatmentPlansFactory.PatientPortion).toHaveBeenCalled();
      expect(treatmentPlansFactory.GetAllHeaders).toHaveBeenCalled();
      expect(
        treatmentPlansFactory.RefreshTreatmentPlanServices
      ).toHaveBeenCalled();
      expect(scope.setDisableEditFunctions).toHaveBeenCalled();
    });
  });

  describe('scope.setDisableEditFunctions method -> ', function () {
    beforeEach(function () {});

    it('should set disableEditFunctions and broadcast', function () {
      scope.$broadcast = jasmine.createSpy();
      scope.disableEditFunctions = false;

      scope.setDisableEditFunctions(true);

      expect(scope.disableEditFunctions).toBe(true);
      expect(scope.$broadcast).toHaveBeenCalledWith(
        'soar:tx-plan-disable-edit-functions',
        true
      );
    });
  });
});
