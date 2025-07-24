describe('TreatmentPlanPrintController ->', function () {
  var scope,
    ctrl,
    toastrFactory,
    patientServices,
    treatmentPlansFactory,
    patientServicesFactory,
    staticData,
    referenceDataService;
  var usersFactory,
    q,
    fileService,
    treatmentPlanDocumentFactory,
    documentsLoadingService,
    referenceDataService;

  var service = {};
  var planStages = [
    {
      stageno: 1,
      appointmentStatus: 'Create Unscheduled Appointment',
      AppointmentId: null,
      ServiceCountForStage: 1,
      InsuranceEstTotalForStage: 304.38,
      PatientPortionTotalForStage: 51.1,
      AdjEstTotalForStage: 0,
      TotalFeesForStage: 355.48,
    },
    {
      stageno: 3,
      appointmentStatus: 'Create Unscheduled Appointment',
      AppointmentId: null,
      ServiceCountForStage: 1,
      InsuranceEstTotalForStage: 152.16,
      PatientPortionTotalForStage: 564.6,
      AdjEstTotalForStage: 0,
      TotalFeesForStage: 123.48,
    },
  ];
  var insuranceEstimates = [
    {
      EstimatedInsuranceId: '00000000-0000-0000-0000-000000000000',
      AccountMemberId: 'ba787f65-31fd-430c-9132-548ace52bfcb',
      EncounterId: '00000000-0000-0000-0000-000000000000',
      ServiceTransactionId: '633c8147-4d83-41ae-82ce-9327070b7b59',
      ServiceCodeId: 'f70838bd-5be0-4a34-87d6-b8629b9b5a70',
      PatientBenefitPlanId: '8436b32f-b3f8-4cf5-88e4-ba5b62ac31e3',
      Fee: 333,
      EstInsurance: 100,
      IsUserOverRidden: false,
      FamilyDeductibleUsed: 100,
      IndividualDeductibleUsed: 100,
      CalculationDescription:
        'Insurance is estimating at $100.00 because the estimated insurance is greater than the remain patient maximum of $100.00',
      CalcWithoutClaim: false,
      PaidAmount: 0,
      AdjEst: 1,
      AdjPaid: 0,
    },
    {
      EstimatedInsuranceId: '00000000-0000-0000-0000-000000000000',
      AccountMemberId: 'ba787f65-31fd-430c-9132-548ace52bfcb',
      EncounterId: '00000000-0000-0000-0000-000000000000',
      ServiceTransactionId: '633c8147-4d83-41ae-82ce-9327070b7b59',
      ServiceCodeId: 'f70838bd-5be0-4a34-87d6-b8629b9b5a70',
      PatientBenefitPlanId: '123h32f-b4f5-1cg3-88e4-la5b62ac33e3',
      Fee: 22,
      EstInsurance: 200,
      IsUserOverRidden: false,
      FamilyDeductibleUsed: 100,
      IndividualDeductibleUsed: 100,
      CalculationDescription:
        'Insurance is estimating at $200.00 because the estimated insurance is greater than the remain patient maximum of $100.00',
      CalcWithoutClaim: false,
      PaidAmount: 0,
      AdjEst: 3,
      AdjPaid: 0,
    },
  ];

  var txPlanData = {
    TreatmentPlanHeader: {
      TreatmentPlanId: 1,
      PersonId: 1,
      StatusId: 1,
      TreatmentPlanName: 'Treatment Plan',
      TreatmentPlanDescription: null,
      AlternateGroupId: 'GID1',
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
          $$IncludeInAppointment: true,
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
          $$IncludeInAppointment: true,
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
          $$IncludeInAppointment: true,
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
          $$IncludeInAppointment: true,
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
          $$IncludeInAppointment: false,
        },
      },
    ],
  };

  beforeEach(
    module('Soar.Patient', function ($provide) {
      treatmentPlansFactory = {
        ExistingTreatmentPlans: jasmine.createSpy().and.returnValue({}),
        Delete: jasmine.createSpy(),
        SetActiveTreatmentPlan: jasmine.createSpy(),
        SetNewTreatmentPlan: jasmine.createSpy(),
        CollapseAll: jasmine.createSpy(),
        GetPlanStages: jasmine.createSpy().and.returnValue({}),
        SetEditing: jasmine.createSpy(),
        SetDataChanged: jasmine.createSpy(),
        Update: jasmine.createSpy(),
        ShouldPromptToRemoveServicesFromAppointment: jasmine.createSpy(),
        RemoveService: jasmine.createSpy(),
        ServicesOnAppointments: jasmine.createSpy(),
        LoadPlanStages: jasmine.createSpy(),
        CalculateStageTotals: jasmine
          .createSpy()
          .and.returnValue({ total1: 10, total2: 20 }),
        ActiveTreatmentPlan: {
          TreatmentPlanHeader: { Status: '' },
        },
      };

      fileService = {};

      treatmentPlanDocumentFactory = {};

      documentsLoadingService = {
        getDocument: jasmine.createSpy().and.returnValue({}),
        setDocument: jasmine.createSpy().and.returnValue({}),
      };

      patientServicesFactory = {
        setActiveServiceTransactionId: jasmine.createSpy(),
      };

      $provide.value('TreatmentPlansFactory', treatmentPlansFactory);
      $provide.value('PatientServicesFactory', patientServicesFactory);

      usersFactory = {
        Users: jasmine.createSpy().and.returnValue({ then: function () {} }),
        SetLoadedProviders: jasmine.createSpy(),
        UserLocations: jasmine.createSpy(),
      };
      $provide.value('UsersFactory', usersFactory);

      staticData = {
        ServiceTransactionStatuses: jasmine.createSpy().and.returnValue({
          then: function (callback) {
            return callback({ Value: [] });
          },
        }),
      };
      $provide.value('StaticData', staticData);

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

      referenceDataService = {
        getData: jasmine.createSpy(),
        entityNames: {
          serviceTypes: 'serviceTypes',
          preventiveServiceTypes: 'preventiveServiceTypes',
          serviceCodes: 'serviceCodes',
        },
      };

      $provide.value('referenceDataService', referenceDataService);

      localStorage.setItem('activeTreatmentPlan', JSON.stringify(txPlanData));
      localStorage.setItem('txPlanPrintOptions', JSON.stringify('{}'));
    })
  );

  beforeEach(inject(function ($rootScope, $controller, $q) {
    let q = $q;

    referenceDataService.getData.and.callFake(function () {
      return $q.resolve([]);
    });

    scope = $rootScope.$new();
    ctrl = $controller('TreatmentPlanPrintController', {
      $scope: scope,
      TreatmentPlansFactory: treatmentPlansFactory,
      UserServices: {},
      StaticData: staticData,
      fileService: fileService,
      TreatmentPlanDocumentFactory: treatmentPlanDocumentFactory,
      DocumentsLoadingService: documentsLoadingService,
    });
  }));

  describe('initial values -> ', function () {
    it('controller should exist', function () {
      expect(ctrl).not.toBeNull();
    });
  });

  describe('scope.recalculateTotals -> ', function () {
    beforeEach(function () {
      service = {
        ServiceTransactionId: 1,
        $$EstInsurance: 500,
        $$AdjEst: 50,
        InsuranceEstimates: insuranceEstimates,
      };
      spyOn(ctrl, 'calculateInsuranceTotals');
      spyOn(scope, 'serviceAmountTotal');
    });
    it('should set adjusted estimated insurance to the new value and 0 out any secondary', function () {
      scope.recalculateTotals(service, 'AdjEst');

      expect(service.InsuranceEstimates[0].AdjEst).toBe(50);
      expect(service.InsuranceEstimates[1].AdjEst).toBe(0);
      expect(ctrl.calculateInsuranceTotals).toHaveBeenCalled();
      expect(scope.serviceAmountTotal).toHaveBeenCalled();
    });
    it('should set adjusted estimated insurance 0.00', function () {
      service.$$AdjEst = 0;
      scope.recalculateTotals(service, 'AdjEst');

      expect(service.InsuranceEstimates[0].AdjEst).toBe(0.0);
      expect(service.InsuranceEstimates[1].AdjEst).toBe(0);
      expect(ctrl.calculateInsuranceTotals).toHaveBeenCalled();
      expect(scope.serviceAmountTotal).toHaveBeenCalled();
    });
    it('should set estimated insurance to the new value and 0 out any secondary', function () {
      scope.recalculateTotals(service, 'EstInsurance');

      expect(service.InsuranceEstimates[0].EstInsurance).toBe(500);
      expect(service.InsuranceEstimates[1].EstInsurance).toBe(0);
      expect(ctrl.calculateInsuranceTotals).toHaveBeenCalled();
      expect(scope.serviceAmountTotal).toHaveBeenCalled();
    });
    it('should set estimated insurance 0.00', function () {
      service.$$EstInsurance = 0;
      scope.recalculateTotals(service, 'EstInsurance');

      expect(service.InsuranceEstimates[0].EstInsurance).toBe(0.0);
      expect(service.InsuranceEstimates[1].EstInsurance).toBe(0);
      expect(ctrl.calculateInsuranceTotals).toHaveBeenCalled();
      expect(scope.serviceAmountTotal).toHaveBeenCalled();
    });
  });

  describe('scope.calculateEmptyColumnsForTotals -> ', function () {
    beforeEach(function () {});

    it('should set columnCountLeftOfTotals to 2 when 3 of the first 6 showOptions are true', function () {
      scope.showOptions = {
        showDescription: true,
        showTooth: false,
        showSurface: true,
        showStatus: false,
        showLocation: false,
        showProvider: true,
      };

      scope.calculateEmptyColumnsForTotals();

      expect(scope.columnCountLeftOfTotals).toBe(2);
    });

    it('should set columnCountLeftOfTotals to -1 when none of the first 6 showOptions are true', function () {
      scope.showOptions = {
        showDescription: false,
        showTooth: false,
        showSurface: false,
        showStatus: false,
        showLocation: false,
        showProvider: false,
      };

      scope.calculateEmptyColumnsForTotals();

      expect(scope.columnCountLeftOfTotals).toBe(-1);
    });
  });

  describe('ctrl.$onInit -> ', function () {
    it('should filter services based on $$IncludeInAppointment', function () {
      ctrl.$onInit();

      expect(scope.treatmentPlanDto.TreatmentPlanServices.length).toBe(4);
    });
  });
});
