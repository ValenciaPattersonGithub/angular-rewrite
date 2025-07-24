describe('TreatmentPlansReorderController directive ->', function () {
  var scope,
    ctrl,
    treatmentPlansFactory,
    toastrFactory,
    patientServices,
    clinicalDrawerStateService,
    treatmentPlanChangeService,
    treatmentPlanEditServices;

  beforeEach(module('Soar.Patient', function () {}));

  //#region mocks
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
          Priority: 2,
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
          Priority: 3,
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
          Priority: 4,
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
          Priority: 6,
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
          Priority: 7,
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
  //#endregion

  beforeEach(
    module('Soar.Patient', function ($provide) {
      /////
      clinicalDrawerStateService = {
        getDrawerState: jasmine.createSpy(),
        registerObserver: jasmine.createSpy(),
        clearObserver: jasmine.createSpy(),
      };
      $provide.value('ClinicalDrawerStateService', clinicalDrawerStateService);

      treatmentPlanChangeService = {
        setTreatmentPlanStageOrderState: jasmine.createSpy(),
        registerTreatmentPlanStageOrderObserver: jasmine.createSpy(),
        clearTreatmentPlanStageOrderObserver: jasmine.createSpy(),
        getTreatmentPlanStageOrderState: jasmine.createSpy(),
        setCloseState: jasmine.createSpy(),
        registerCloseObserver: jasmine.createSpy(),
        clearCloseObserver: jasmine.createSpy(),
      };
      $provide.value('TreatmentPlanChangeService', treatmentPlanChangeService);

      treatmentPlansFactory = {
        GetPlanStages: jasmine.createSpy(),
        SetPlanStages: jasmine.createSpy(),
        GetDaysAgo: jasmine.createSpy(),
        GetTotalFees: jasmine.createSpy(),
        ActiveTreatmentPlan: _.cloneDeep(txPlanData),
        UpdatePriority: jasmine.createSpy().and.returnValue({
          then: jasmine.createSpy().and.returnValue(),
        }),
        SetActiveTreatmentPlan: jasmine.createSpy(),
      };
      $provide.value('TreatmentPlansFactory', treatmentPlansFactory);

      treatmentPlanEditServices = {
        setTreatmentPlan: jasmine.createSpy(),
        getTreatmentPlan: jasmine.createSpy(),
      };

      $provide.value(
        'NewTreatmentPlanEditServicesService',
        treatmentPlanEditServices
      );

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
    })
  );

  beforeEach(inject(function ($rootScope, $controller) {
    // scopes
    scope = $rootScope.$new();
    // instantiating the controller object
    ctrl = $controller('TreatmentPlansReorderController', {
      $scope: scope,
      toastrFactory: toastrFactory,
      clinicalDrawerStateService: clinicalDrawerStateService,
      treatmentPlanChangeService: treatmentPlanChangeService,
    });
    // default scope properties

    scope.viewSettings = {};
    ctrl.init();
  }));

  describe('ctrl.init method ->', function () {
    var activeTreatmentPlan = {};
    beforeEach(function () {
      activeTreatmentPlan = _.cloneDeep(txPlanData);
      scope.treatmentPlanServices = _.cloneDeep(
        activeTreatmentPlan.TreatmentPlanServices
      );
      treatmentPlansFactory.ActiveTreatmentPlan =
        _.cloneDeep(activeTreatmentPlan);
      spyOn(ctrl, 'setPriorities');
    });

    it('should initialize scope and ctrl properties', function () {
      ctrl.init();
      expect(scope.displayDate).toEqual(
        ctrl.activeTreatmentPlan.TreatmentPlanHeader.$$DisplayCreatedDate
      );
      expect(scope.daysAgo).toEqual(
        ctrl.activeTreatmentPlan.TreatmentPlanHeader.DaysAgo
      );
      expect(scope.treatmentPlanName).toEqual(
        ctrl.activeTreatmentPlan.TreatmentPlanHeader.TreatmentPlanName
      );
      expect(ctrl.setPriorities).toHaveBeenCalled();
    });
  });

  describe('ctrl.setSortProperty method ->', function () {
    var columnName, stage;
    var activeTreatmentPlan = {};
    beforeEach(function () {
      activeTreatmentPlan = _.cloneDeep(txPlanData);
      scope.treatmentPlanServices = _.cloneDeep(
        activeTreatmentPlan.TreatmentPlanServices
      );
      treatmentPlansFactory.ActiveTreatmentPlan =
        _.cloneDeep(activeTreatmentPlan);
    });

    it('should set scope.stageSorted', function () {
      columnName = 'tooth';
      stage = 2;
      ctrl.setSortProperty(columnName, stage);
      expect(scope.stageSorted).toEqual(stage);
    });

    it('should set scope.sortProperty to -ServiceTransaction.Tooth if sortProperty is currently ServiceTransaction.Tooth', function () {
      columnName = 'tooth';
      stage = 2;
      scope.sortProperty = 'ServiceTransaction.Tooth';
      ctrl.setSortProperty(columnName, stage);
      expect(scope.sortProperty).toEqual('-ServiceTransaction.Tooth');
    });

    it('should set scope.sortProperty to ServiceTransaction.Tooth if sortProperty is not currently ServiceTransaction.Tooth', function () {
      columnName = 'tooth';
      stage = 2;
      scope.sortProperty = null;
      ctrl.setSortProperty(columnName, stage);
      expect(scope.sortProperty).toEqual('ServiceTransaction.Tooth');
      ctrl.setSortProperty(columnName, stage);
      expect(scope.sortProperty).toEqual('-ServiceTransaction.Tooth');
    });

    it('should set scope.sortProperty to -ServiceTransaction.Tooth if sortProperty is currently ServiceTransaction.Tooth', function () {
      columnName = 'amount';
      stage = 2;
      scope.sortProperty = 'ServiceTransaction.Amount';
      ctrl.setSortProperty(columnName, stage);
      expect(scope.sortProperty).toEqual('-ServiceTransaction.Amount');
    });

    it('should set scope.sortProperty to ServiceTransaction.Tooth if sortProperty is not currently ServiceTransaction.Tooth', function () {
      columnName = 'amount';
      stage = 2;
      scope.sortProperty = null;
      ctrl.setSortProperty(columnName, stage);
      expect(scope.sortProperty).toEqual('ServiceTransaction.Amount');
      ctrl.setSortProperty(columnName, stage);
      expect(scope.sortProperty).toEqual('-ServiceTransaction.Amount');
    });
  });

  describe('scope.save method ->', function () {
    var activeTreatmentPlan = {};
    beforeEach(function () {
      activeTreatmentPlan = _.cloneDeep(txPlanData);
      scope.treatmentPlanServices = _.cloneDeep(
        activeTreatmentPlan.TreatmentPlanServices
      );
      treatmentPlansFactory.ActiveTreatmentPlan =
        _.cloneDeep(activeTreatmentPlan);
      spyOn(ctrl, 'authTreatmentPlanEditAccess').and.returnValue(true);
    });

    it('should initialize scope and ctrl properties', function () {
      scope.save();
      expect(treatmentPlansFactory.UpdatePriority).toHaveBeenCalledWith(
        ctrl.activeTreatmentPlan
      );
    });
  });

  describe('ctrl.getPatientBalance function ->', function () {
    var serviceTransaction;
    beforeEach(function () {
      serviceTransaction = {
        $$PatientBalance: 'test',
        Amount: 100,
        InsuranceEstimates: [{ EstInsurance: 10, AdjEst: 20 }],
      };
    });

    it('should set $$PatientBalance to 0 and return 0 when service is deleted', function () {
      serviceTransaction.IsDeleted = true;
      var retVal = ctrl.getPatientBalance(serviceTransaction);
      expect(retVal).toBe(0);
      expect(serviceTransaction.$$PatientBalance).toBe(0);
    });

    it('should set $$PatientBalance and return value correctly when service is not deleted and insurance estimates are present', function () {
      serviceTransaction.IsDeleted = false;
      var expected =
        serviceTransaction.Amount -
        serviceTransaction.InsuranceEstimates[0].EstInsurance -
        serviceTransaction.InsuranceEstimates[0].AdjEst;
      var retVal = ctrl.getPatientBalance(serviceTransaction);
      expect(retVal).toBe(expected);
      expect(serviceTransaction.$$PatientBalance).toBe(expected);
    });

    it('should take no action when service is not deleted and insurance estimates are not present', function () {
      serviceTransaction.IsDeleted = false;
      serviceTransaction.InsuranceEstimates = null;
      var retVal = ctrl.getPatientBalance(serviceTransaction);
      expect(retVal).toBeUndefined();
      expect(serviceTransaction.$$PatientBalance).toBe('test');
    });
  });

  describe('ctrl.setPriorities method ->', function () {
    var activeTreatmentPlan = {};
    beforeEach(function () {
      activeTreatmentPlan = _.cloneDeep(txPlanData);
      scope.treatmentPlanServices = _.cloneDeep(
        activeTreatmentPlan.TreatmentPlanServices
      );
      treatmentPlansFactory.ActiveTreatmentPlan =
        _.cloneDeep(activeTreatmentPlan);
      spyOn(ctrl, 'authTreatmentPlanEditAccess').and.returnValue(true);
    });

    it('should reset Priorities on services based on stage and current priority', function () {
      expect(
        scope.treatmentPlanServices[0].TreatmentPlanServiceHeader
          .TreatmentPlanServiceId
      ).toEqual(111);
      expect(
        scope.treatmentPlanServices[0].TreatmentPlanServiceHeader.Priority
      ).toEqual(2);
      expect(
        scope.treatmentPlanServices[0].TreatmentPlanServiceHeader
          .TreatmentPlanGroupNumber
      ).toEqual(1);

      expect(
        scope.treatmentPlanServices[1].TreatmentPlanServiceHeader
          .TreatmentPlanServiceId
      ).toEqual(112);
      expect(
        scope.treatmentPlanServices[1].TreatmentPlanServiceHeader.Priority
      ).toEqual(3);
      expect(
        scope.treatmentPlanServices[1].TreatmentPlanServiceHeader
          .TreatmentPlanGroupNumber
      ).toEqual(1);

      expect(
        scope.treatmentPlanServices[2].TreatmentPlanServiceHeader
          .TreatmentPlanServiceId
      ).toEqual(113);
      expect(
        scope.treatmentPlanServices[2].TreatmentPlanServiceHeader.Priority
      ).toEqual(4);
      expect(
        scope.treatmentPlanServices[2].TreatmentPlanServiceHeader
          .TreatmentPlanGroupNumber
      ).toEqual(1);

      expect(
        scope.treatmentPlanServices[3].TreatmentPlanServiceHeader
          .TreatmentPlanServiceId
      ).toEqual(211);
      expect(
        scope.treatmentPlanServices[3].TreatmentPlanServiceHeader.Priority
      ).toEqual(6);
      expect(
        scope.treatmentPlanServices[3].TreatmentPlanServiceHeader
          .TreatmentPlanGroupNumber
      ).toEqual(2);

      expect(
        scope.treatmentPlanServices[4].TreatmentPlanServiceHeader
          .TreatmentPlanServiceId
      ).toEqual(212);
      expect(
        scope.treatmentPlanServices[4].TreatmentPlanServiceHeader.Priority
      ).toEqual(7);
      expect(
        scope.treatmentPlanServices[4].TreatmentPlanServiceHeader
          .TreatmentPlanGroupNumber
      ).toEqual(2);

      ctrl.setPriorities();

      expect(
        scope.treatmentPlanServices[0].TreatmentPlanServiceHeader
          .TreatmentPlanServiceId
      ).toEqual(111);
      expect(
        scope.treatmentPlanServices[0].TreatmentPlanServiceHeader.Priority
      ).toEqual(1);
      expect(
        scope.treatmentPlanServices[0].TreatmentPlanServiceHeader
          .TreatmentPlanGroupNumber
      ).toEqual(1);

      expect(
        scope.treatmentPlanServices[1].TreatmentPlanServiceHeader
          .TreatmentPlanServiceId
      ).toEqual(112);
      expect(
        scope.treatmentPlanServices[1].TreatmentPlanServiceHeader.Priority
      ).toEqual(2);
      expect(
        scope.treatmentPlanServices[1].TreatmentPlanServiceHeader
          .TreatmentPlanGroupNumber
      ).toEqual(1);

      expect(
        scope.treatmentPlanServices[2].TreatmentPlanServiceHeader
          .TreatmentPlanServiceId
      ).toEqual(113);
      expect(
        scope.treatmentPlanServices[2].TreatmentPlanServiceHeader.Priority
      ).toEqual(3);
      expect(
        scope.treatmentPlanServices[2].TreatmentPlanServiceHeader
          .TreatmentPlanGroupNumber
      ).toEqual(1);

      expect(
        scope.treatmentPlanServices[3].TreatmentPlanServiceHeader
          .TreatmentPlanServiceId
      ).toEqual(211);
      expect(
        scope.treatmentPlanServices[3].TreatmentPlanServiceHeader.Priority
      ).toEqual(4);
      expect(
        scope.treatmentPlanServices[3].TreatmentPlanServiceHeader
          .TreatmentPlanGroupNumber
      ).toEqual(2);

      expect(
        scope.treatmentPlanServices[4].TreatmentPlanServiceHeader
          .TreatmentPlanServiceId
      ).toEqual(212);
      expect(
        scope.treatmentPlanServices[4].TreatmentPlanServiceHeader.Priority
      ).toEqual(5);
      expect(
        scope.treatmentPlanServices[4].TreatmentPlanServiceHeader
          .TreatmentPlanGroupNumber
      ).toEqual(2);
    });

    it('should reset Priorities on services based on stage and current priority', function () {
      scope.treatmentPlanServices[2].TreatmentPlanServiceHeader.Priority = 7;
      scope.treatmentPlanServices[3].TreatmentPlanServiceHeader.Priority = 5;

      expect(
        scope.treatmentPlanServices[0].TreatmentPlanServiceHeader
          .TreatmentPlanServiceId
      ).toEqual(111);
      expect(
        scope.treatmentPlanServices[0].TreatmentPlanServiceHeader.Priority
      ).toEqual(2);
      expect(
        scope.treatmentPlanServices[0].TreatmentPlanServiceHeader
          .TreatmentPlanGroupNumber
      ).toEqual(1);

      expect(
        scope.treatmentPlanServices[1].TreatmentPlanServiceHeader
          .TreatmentPlanServiceId
      ).toEqual(112);
      expect(
        scope.treatmentPlanServices[1].TreatmentPlanServiceHeader.Priority
      ).toEqual(3);
      expect(
        scope.treatmentPlanServices[1].TreatmentPlanServiceHeader
          .TreatmentPlanGroupNumber
      ).toEqual(1);

      expect(
        scope.treatmentPlanServices[2].TreatmentPlanServiceHeader
          .TreatmentPlanServiceId
      ).toEqual(113);
      expect(
        scope.treatmentPlanServices[2].TreatmentPlanServiceHeader.Priority
      ).toEqual(7);
      expect(
        scope.treatmentPlanServices[2].TreatmentPlanServiceHeader
          .TreatmentPlanGroupNumber
      ).toEqual(1);

      expect(
        scope.treatmentPlanServices[3].TreatmentPlanServiceHeader
          .TreatmentPlanServiceId
      ).toEqual(211);
      expect(
        scope.treatmentPlanServices[3].TreatmentPlanServiceHeader.Priority
      ).toEqual(5);
      expect(
        scope.treatmentPlanServices[3].TreatmentPlanServiceHeader
          .TreatmentPlanGroupNumber
      ).toEqual(2);

      expect(
        scope.treatmentPlanServices[4].TreatmentPlanServiceHeader
          .TreatmentPlanServiceId
      ).toEqual(212);
      expect(
        scope.treatmentPlanServices[4].TreatmentPlanServiceHeader.Priority
      ).toEqual(7);
      expect(
        scope.treatmentPlanServices[4].TreatmentPlanServiceHeader
          .TreatmentPlanGroupNumber
      ).toEqual(2);

      ctrl.setPriorities();

      expect(
        scope.treatmentPlanServices[0].TreatmentPlanServiceHeader
          .TreatmentPlanServiceId
      ).toEqual(111);
      expect(
        scope.treatmentPlanServices[0].TreatmentPlanServiceHeader.Priority
      ).toEqual(1);
      expect(
        scope.treatmentPlanServices[0].TreatmentPlanServiceHeader
          .TreatmentPlanGroupNumber
      ).toEqual(1);

      expect(
        scope.treatmentPlanServices[1].TreatmentPlanServiceHeader
          .TreatmentPlanServiceId
      ).toEqual(112);
      expect(
        scope.treatmentPlanServices[1].TreatmentPlanServiceHeader.Priority
      ).toEqual(2);
      expect(
        scope.treatmentPlanServices[1].TreatmentPlanServiceHeader
          .TreatmentPlanGroupNumber
      ).toEqual(1);

      expect(
        scope.treatmentPlanServices[2].TreatmentPlanServiceHeader
          .TreatmentPlanServiceId
      ).toEqual(113);
      expect(
        scope.treatmentPlanServices[2].TreatmentPlanServiceHeader.Priority
      ).toEqual(3);
      expect(
        scope.treatmentPlanServices[2].TreatmentPlanServiceHeader
          .TreatmentPlanGroupNumber
      ).toEqual(1);

      expect(
        scope.treatmentPlanServices[3].TreatmentPlanServiceHeader
          .TreatmentPlanServiceId
      ).toEqual(211);
      expect(
        scope.treatmentPlanServices[3].TreatmentPlanServiceHeader.Priority
      ).toEqual(4);
      expect(
        scope.treatmentPlanServices[3].TreatmentPlanServiceHeader
          .TreatmentPlanGroupNumber
      ).toEqual(2);

      expect(
        scope.treatmentPlanServices[4].TreatmentPlanServiceHeader
          .TreatmentPlanServiceId
      ).toEqual(212);
      expect(
        scope.treatmentPlanServices[4].TreatmentPlanServiceHeader.Priority
      ).toEqual(5);
      expect(
        scope.treatmentPlanServices[4].TreatmentPlanServiceHeader
          .TreatmentPlanGroupNumber
      ).toEqual(2);
    });
  });
});
