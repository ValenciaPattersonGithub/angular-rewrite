import { of } from 'rxjs';

describe('TreatmentPlansPartController ->', function () {
  var scope,
    ctrl,
    modalFactory,
    modalFactoryDeferred,
    q,
    toastrFactory,
    patientServices,
    treatmentPlansFactory,
    patientServicesFactory,
    staticData,
    referenceDataService;
  var modalInstance, $uibModal, usersFactory, rootScope;
  var userSettingsDataService,
    appointmentViewDataLoadingService,
    appointmentViewVisibleService;

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
  modalFactory = {
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
        ActiveTreatmentPlan: {
          TreatmentPlanHeader: { Status: '' },
        },
        GetAllHeaders: jasmine.createSpy(),
        PatientPortion: jasmine.createSpy(),
        RefreshTreatmentPlanServices: jasmine.createSpy(),
      };

      patientServicesFactory = {
        setActiveServiceTransactionId: jasmine.createSpy(),
      };

      $provide.value('TreatmentPlansFactory', treatmentPlansFactory);
      $provide.value('PatientServicesFactory', patientServicesFactory);

      const featureFlagService = jasmine.createSpyObj('FeatureFlagService', ['getOnce$']);
      featureFlagService.getOnce$.and.returnValue(of(false));
      $provide.value('FeatureFlagService', featureFlagService);
      const scheduleMFENavigator = jasmine.createSpyObj('schedulingMFENavigator', ['navigateToAppointmentModal']);
      $provide.value('schedulingMFENavigator', scheduleMFENavigator);

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
        getViewData: jasmine.createSpy(),
      };
      $provide.value(
        'AppointmentViewDataLoadingService',
        appointmentViewDataLoadingService
      );
    })
  );

  beforeEach(inject(function ($rootScope, $controller, $q, _$uibModal_) {
    q = $q;
    $uibModal = _$uibModal_;
    spyOn($uibModal, 'open').and.callThrough();

    rootScope = $rootScope;

    referenceDataService.getData.and.callFake(function () {
      return $q.resolve([]);
    });

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
    };

    scope = $rootScope.$new();
    ctrl = $controller('TreatmentPlansStageController', {
      $scope: scope,
      ModalFactory: modalFactory,
      ModalDataFactory: {},
      $uibModalInstance: modalInstance,
      TreatmentPlansFactory: treatmentPlansFactory,
      UserServices: {},
      ScheduleServices: {},
      ResourceService: {},
      ApiDefinitions: {},
      StaticData: staticData,
    });
  }));

  describe('initial values -> ', function () {
    it('controller should exist', function () {
      expect(ctrl).not.toBeNull();
    });

    it('calculate total of services fee in treatment plan', function () {
      var total = scope.serviceAmountTotal(txPlanData.TreatmentPlanServices);
      expect(total).toEqual(1004);
    });

    it('check for stage number in treatment plan services', function () {
      scope.treatmentPlan = txPlanData;
      expect(ctrl.findStageNumberNumInServices(1)).toBeTruthy();
      expect(ctrl.findStageNumberNumInServices(2)).toBeTruthy();
      expect(ctrl.findStageNumberNumInServices(3)).toBeFalsy();
    });
  });

  describe('ctrl.calculateStageTotals method -> ', function () {
    it('should calculate total fees for stage', function () {
      var totalFees = 0;
      var servicesInStage = [];
      angular.forEach(txPlanData.TreatmentPlanServices, function (tps) {
        if (tps.TreatmentPlanServiceHeader.TreatmentPlanGroupNumber === 1) {
          servicesInStage.push(tps);
          totalFees += tps.ServiceTransaction.Fee;
        }
      });
      servicesInStage.push({
        ServiceTransaction: { Fee: 100, IsDeleted: true },
      });
      ctrl.calculateStageTotals(servicesInStage);
      expect(scope.totalFeesPerStage).toEqual(totalFees);
    });

    it('should calculate total Discounts for stage', function () {
      var totalDiscounts = 0;
      var servicesInStage = [];
      angular.forEach(txPlanData.TreatmentPlanServices, function (tps) {
        if (tps.TreatmentPlanServiceHeader.TreatmentPlanGroupNumber === 1) {
          var copyTps = _.cloneDeep(tps);
          servicesInStage.push(copyTps);
          copyTps.ServiceTransaction.Discount = 10;
          totalDiscounts += copyTps.ServiceTransaction.Discount;
        }
      });
      servicesInStage.push({
        ServiceTransaction: { Discount: 10, IsDeleted: true },
      });
      ctrl.calculateStageTotals(servicesInStage);
      expect(scope.totalDiscountsPerStage).toEqual(totalDiscounts);
    });

    it('should calculate total amount for stage', function () {
      var totalAmount = 0;
      var servicesInStage = [];
      angular.forEach(txPlanData.TreatmentPlanServices, function (tps) {
        if (tps.TreatmentPlanServiceHeader.TreatmentPlanGroupNumber === 1) {
          servicesInStage.push(tps);
          totalAmount += tps.ServiceTransaction.Amount;
        }
      });
      servicesInStage.push({
        ServiceTransaction: { Amount: 100, IsDeleted: true },
      });
      ctrl.calculateStageTotals(servicesInStage);
      expect(scope.totalAmountPerStage).toEqual(totalAmount);
    });

    it('should calculate total tax for stage', function () {
      var totalTax = 0;
      var servicesInStage = [];
      angular.forEach(txPlanData.TreatmentPlanServices, function (tpsOrig) {
        if (tpsOrig.TreatmentPlanServiceHeader.TreatmentPlanGroupNumber === 1) {
          var tps = _.cloneDeep(tpsOrig);
          servicesInStage.push(tps);
          tps.ServiceTransaction.Tax = 10;
          totalTax += tps.ServiceTransaction.Tax;
        }
      });
      servicesInStage.push({
        ServiceTransaction: { Tax: 10, IsDeleted: true },
      });
      ctrl.calculateStageTotals(servicesInStage);
      expect(scope.totalTaxPerStage).toEqual(totalTax);
    });

    it('should calculate total insurance estimate for stage', function () {
      var totalInsEst = 0;
      var servicesInStage = [];
      angular.forEach(txPlanData.TreatmentPlanServices, function (tpsOrig) {
        if (tpsOrig.TreatmentPlanServiceHeader.TreatmentPlanGroupNumber === 1) {
          var tps = _.cloneDeep(tpsOrig);
          servicesInStage.push(tps);
          tps.ServiceTransaction.InsuranceEstimates = [{ EstInsurance: 10 }];
          totalInsEst +=
            tps.ServiceTransaction.InsuranceEstimates[0].EstInsurance;
        }
      });
      servicesInStage.push({
        ServiceTransaction: {
          InsuranceEstimates: [{ EstInsurance: 10 }],
          IsDeleted: true,
        },
      });
      ctrl.calculateStageTotals(servicesInStage);
      expect(scope.insuranceEstimatePartTotal).toEqual(totalInsEst);
    });

    it('should call ctrl.calculateInsuranceAmounts for each service', function () {
      var treatmentPlanServices = [
        {
          ServiceTransaction: {
            Amount: 320.0,
            Description:
              'D9220: deep sedation/general anesthesia - first 30 minutes (D9220)',
            Fee: 320.0,
            ServiceCodeId: 1,
            ServiceTransactionId: 1,
            ServiceTransactionStatusId: 1,
            Tax: 0.0,
            Tooth: null,
            TransactionTypeId: 1,
            ObjectState: 'None',
            Balance: 320.0,
          },
        },
        {
          ServiceTransaction: {
            Amount: 210.0,
            Description:
              'D9220: deep sedation/general anesthesia - first 30 minutes (D9220)',
            Fee: 210.0,
            ServiceCodeId: 1,
            ServiceTransactionId: 1,
            ServiceTransactionStatusId: 1,
            Tax: 0.0,
            Tooth: null,
            TransactionTypeId: 1,
            ObjectState: 'None',
            Balance: 210.0,
          },
        },
        {
          ServiceTransaction: {
            Amount: 220.0,
            Description:
              'D9220: deep sedation/general anesthesia - first 30 minutes (D9220)',
            Fee: 220.0,
            ServiceCodeId: 1,
            ServiceTransactionId: 1,
            ServiceTransactionStatusId: 1,
            Tax: 0.0,
            Tooth: null,
            TransactionTypeId: 1,
            ObjectState: 'None',
            Balance: 220.0,
          },
        },
      ];
      spyOn(ctrl, 'calculateInsuranceAmounts');

      ctrl.calculateStageTotals(treatmentPlanServices);
      _.forEach(
        treatmentPlanServices.ServiceTransaction,
        function (serviceTransaction) {
          expect(ctrl.calculateInsuranceAmounts).toHaveBeenCalledWith(
            serviceTransaction
          );
        }
      );
    });

    it('should calculate total insurance adjustment for stage', function () {
      var totalAdjEst = 0;
      var servicesInStage = [];
      angular.forEach(txPlanData.TreatmentPlanServices, function (tpsOrig) {
        if (tpsOrig.TreatmentPlanServiceHeader.TreatmentPlanGroupNumber === 1) {
          var tps = _.cloneDeep(tpsOrig);
          servicesInStage.push(tps);
          tps.ServiceTransaction.InsuranceEstimates = [{ AdjEst: 10 }];
          totalAdjEst += tps.ServiceTransaction.InsuranceEstimates[0].AdjEst;
        }
      });
      servicesInStage.push({
        ServiceTransaction: {
          InsuranceEstimates: [{ AdjEst: 10 }],
          IsDeleted: true,
        },
      });
      ctrl.calculateStageTotals(servicesInStage);
      expect(scope.adjustedEstimatePartTotal).toEqual(totalAdjEst);
    });

    it('should ignore serviceTransactions where ServiceTransaction Status is complete when calculate total patient portion for stage', function () {
      var totalPatPortion = 0;
      var servicesInStage = [];
      var activeTreatmentPlan = _.cloneDeep(txPlanData);
      spyOn(scope, 'sum').and.returnValue(25.0);
      // set first service Status to complete
      activeTreatmentPlan.TreatmentPlanServices[0].ServiceTransaction.ServiceTransactionStatusId = 4;
      angular.forEach(
        activeTreatmentPlan.TreatmentPlanServices,
        function (tps) {
          tps.ServiceTransaction.Amount = 100.0;
          tps.ServiceTransaction.IsDeleted = false;
          tps.ServiceTransaction.InsuranceEstimates = [
            { AdjEst: 0, EstInsurance: 0 },
          ];
          servicesInStage.push(tps);
          if (tps.ServiceTransaction.ServiceTransactionStatusId !== 4) {
            totalPatPortion += tps.ServiceTransaction.Amount - 25 - 25;
          }
        }
      );
      servicesInStage.push({
        ServiceTransaction: {
          Amount: 100,
          InsuranceEstimates: [{ AdjEst: 10, EstInsurance: 20 }],
          IsDeleted: true,
        },
      });
      ctrl.calculateStageTotals(servicesInStage);
      expect(scope.patientPortionPartTotal).toEqual(totalPatPortion);
    });

    it('should ignore serviceTransactions where ServiceTransaction.IsDeleted is true when calculate total patient portion for stage', function () {
      var totalPatPortion = 0;
      var servicesInStage = [];
      var activeTreatmentPlan = _.cloneDeep(txPlanData);
      spyOn(scope, 'sum').and.returnValue(25.0);
      // set first service IsDeleted to true
      activeTreatmentPlan.TreatmentPlanServices[0].ServiceTransaction.ServiceTransactionStatusId = 1;
      activeTreatmentPlan.TreatmentPlanServices[0].ServiceTransaction.IsDeleted = true;
      angular.forEach(
        activeTreatmentPlan.TreatmentPlanServices,
        function (tps) {
          tps.ServiceTransaction.Amount = 100.0;
          tps.ServiceTransaction.InsuranceEstimates = [
            { AdjEst: 0, EstInsurance: 0 },
          ];
          servicesInStage.push(tps);
          if (tps.ServiceTransaction.IsDeleted !== true) {
            totalPatPortion += tps.ServiceTransaction.Amount - 25 - 25;
          }
        }
      );
      servicesInStage.push({
        ServiceTransaction: {
          Amount: 100,
          InsuranceEstimates: [{ AdjEst: 10, EstInsurance: 20 }],
          IsDeleted: true,
        },
      });
      ctrl.calculateStageTotals(servicesInStage);
      expect(scope.patientPortionPartTotal).toEqual(totalPatPortion);
    });

    it('should ignore serviceTransactions where ServiceTransaction.IsDeleted is true when calculate totalAmountPerStage for stage', function () {
      var totalPatPortion = 0;
      var servicesInStage = [];
      var activeTreatmentPlan = _.cloneDeep(txPlanData);
      spyOn(scope, 'sum').and.returnValue(25.0);
      // set first service IsDeleted to true
      activeTreatmentPlan.TreatmentPlanServices[0].ServiceTransaction.ServiceTransactionStatusId = 1;
      activeTreatmentPlan.TreatmentPlanServices[0].ServiceTransaction.IsDeleted = true;
      angular.forEach(
        activeTreatmentPlan.TreatmentPlanServices,
        function (tps) {
          tps.ServiceTransaction.Amount = 100.0;
          tps.ServiceTransaction.InsuranceEstimates = [
            { AdjEst: 0, EstInsurance: 0 },
          ];
          servicesInStage.push(tps);
          if (tps.ServiceTransaction.IsDeleted !== true) {
            totalPatPortion += tps.ServiceTransaction.Amount;
          }
        }
      );
      servicesInStage.push({
        ServiceTransaction: {
          Amount: 100,
          InsuranceEstimates: [{ AdjEst: 10, EstInsurance: 20 }],
          IsDeleted: true,
        },
      });
      ctrl.calculateStageTotals(servicesInStage);
      expect(scope.totalAmountPerStage).toEqual(totalPatPortion);
    });

    it('should include serviceTransactions where ServiceTransaction status is Completed is true when calculate totalAmountPerStage for stage', function () {
      var totalPatPortion = 0;
      var servicesInStage = [];
      var activeTreatmentPlan = _.cloneDeep(txPlanData);
      spyOn(scope, 'sum').and.returnValue(25.0);
      // set first service IsDeleted to true
      activeTreatmentPlan.TreatmentPlanServices[0].ServiceTransaction.ServiceTransactionStatusId = 4;
      activeTreatmentPlan.TreatmentPlanServices[0].ServiceTransaction.IsDeleted = false;
      angular.forEach(
        activeTreatmentPlan.TreatmentPlanServices,
        function (tps) {
          tps.ServiceTransaction.Amount = 100.0;
          tps.ServiceTransaction.InsuranceEstimates = [
            { AdjEst: 0, EstInsurance: 0 },
          ];
          servicesInStage.push(tps);
          if (tps.ServiceTransaction.IsDeleted !== true) {
            totalPatPortion += tps.ServiceTransaction.Amount;
          }
        }
      );
      servicesInStage.push({
        ServiceTransaction: {
          Amount: 100,
          InsuranceEstimates: [{ AdjEst: 10, EstInsurance: 20 }],
          IsDeleted: true,
        },
      });
      ctrl.calculateStageTotals(servicesInStage);
      expect(scope.totalAmountPerStage).toEqual(totalPatPortion);
    });

    it('should calculate total patient portion for stage', function () {
      var totalPatPortion = 0;
      var servicesInStage = [];
      angular.forEach(txPlanData.TreatmentPlanServices, function (tpsOrig) {
        if (tpsOrig.TreatmentPlanServiceHeader.TreatmentPlanGroupNumber === 1) {
          var tps = _.cloneDeep(tpsOrig);
          servicesInStage.push(tps);
          tps.ServiceTransaction.InsuranceEstimates = [
            { AdjEst: 10, EstInsurance: 20 },
          ];
          totalPatPortion +=
            tps.ServiceTransaction.Amount -
            tps.ServiceTransaction.InsuranceEstimates[0].AdjEst -
            tps.ServiceTransaction.InsuranceEstimates[0].EstInsurance;
        }
      });
      servicesInStage.push({
        ServiceTransaction: {
          Amount: 100,
          InsuranceEstimates: [{ AdjEst: 10, EstInsurance: 20 }],
          IsDeleted: true,
        },
      });
      ctrl.calculateStageTotals(servicesInStage);
      expect(scope.patientPortionPartTotal).toEqual(totalPatPortion);
    });
  });

  describe('ctrl.disableAppointmentButton method -> ', function () {
    it('should disable the createAppointment button', function () {
      var servicesInStage = [];
      angular.forEach(txPlanData.TreatmentPlanServices, function (tps) {
        if (tps.ServiceTransaction.ServiceTransactionStatusId === 2) {
          scope.isAppointmentCreate = true;
          return;
        }
      });
      ctrl.disableAppointmentButton(servicesInStage);
      expect(scope.isAppointmentCreate).toEqual(true);
    });
  });

  describe('ctrl.disablesendPredeterminationButton method -> ', function () {
    it('should disable the sendPredetermination button', function () {
      var servicesInStage = [];
      angular.forEach(txPlanData.TreatmentPlanServices, function (tps) {
        if (tps.ServiceTransaction.ServiceTransactionStatusId === 2) {
          scope.isSendPredetermination = true;
          return;
        }
      });
      ctrl.disableSendPredetermination(servicesInStage);
      expect(scope.isSendPredetermination).toEqual(true);
    });
  });
  describe('loadProviders function -> ', function () {
    it('should load locations from factory.LoadedLocations if parent loaded them', function () {
      spyOn(ctrl, 'getProviders');
      usersFactory.LoadedProviders = [{ IsActive: true }, { IsActive: true }];
      ctrl.loadProviders();
      expect(ctrl.getProviders).not.toHaveBeenCalled();
    });

    it('should load locations from factory.Locations if parent did not load them', function () {
      spyOn(ctrl, 'getProviders');
      usersFactory.LoadedProviders = null;
      ctrl.loadProviders();
      expect(ctrl.getProviders).toHaveBeenCalled();
    });
  });

  describe('confirmDeleteService method -> ', function () {
    beforeEach(function () {
      spyOn(ctrl, 'confirmDeleteServicesFromAppts');
      spyOn(ctrl, 'deleteServiceWithFlag');
      ctrl.serviceMarkedforDeletion = {
        TreatmentPlanServiceHeader: { TreatmentPlanServiceId: '7894' },
        ServiceTransaction: {
          ServiceTransactionId: '5678',
          EncounterId: '1234',
        },
      };
    });
    it('should call ctrl.deleteServiceWithFlag if service from an appointment if appointment that is Ready for Checkout', function () {
      ctrl.confirmDeleteService();
      expect(ctrl.deleteServiceWithFlag).toHaveBeenCalled();
    });

    it('should not prompt to remove a service from an appointment if appointment that is Ready for Checkout', function () {
      ctrl.confirmDeleteService();
      expect(
        treatmentPlansFactory.ShouldPromptToRemoveServicesFromAppointment
      ).not.toHaveBeenCalled();
    });

    it('should call treatmentPlansFactory.ShouldPromptToRemoveServicesFromAppointment if service is not on an appointment that is Ready for Checkout', function () {
      ctrl.serviceMarkedforDeletion.ServiceTransaction.EncounterId = null;
      ctrl.confirmDeleteService();
      expect(
        treatmentPlansFactory.ShouldPromptToRemoveServicesFromAppointment
      ).toHaveBeenCalled();
    });

    it('should call ctrl.confirmDeleteServicesFromAppts if treatmentPlansFactory.ShouldPromptToRemoveServicesFromAppointment returns true', function () {
      ctrl.serviceMarkedforDeletion.ServiceTransaction.EncounterId = null;
      treatmentPlansFactory.ShouldPromptToRemoveServicesFromAppointment = jasmine
        .createSpy(
          ' treatmentPlansFactory.ShouldPromptToRemoveServicesFromAppointment'
        )
        .and.returnValue(true);
      ctrl.confirmDeleteService();
      expect(ctrl.confirmDeleteServicesFromAppts).toHaveBeenCalled();
    });

    it('should call ctrl.deleteServiceWithFlag if treatmentPlansFactory.ShouldPromptToRemoveServicesFromAppointment returns false', function () {
      ctrl.serviceMarkedforDeletion.ServiceTransaction.EncounterId = null;
      treatmentPlansFactory.ShouldPromptToRemoveServicesFromAppointment = jasmine
        .createSpy(
          ' treatmentPlansFactory.ShouldPromptToRemoveServicesFromAppointment'
        )
        .and.returnValue(false);

      ctrl.confirmDeleteService();
      expect(ctrl.deleteServiceWithFlag).toHaveBeenCalled();
    });
  });

  describe('ctrl.deleteServiceWithFlag ->', function () {
    var serviceId;
    beforeEach(function () {
      serviceId = 'serviceId';
      ctrl.updateSelectedProposedServicesOnRemoveService = jasmine.createSpy();
      ctrl.serviceMarkedforDeletion = {
        TreatmentPlanServiceHeader: { TreatmentPlanServiceId: serviceId },
      };
      treatmentPlansFactory.RemoveService = jasmine
        .createSpy()
        .and.returnValue({ then: angular.noop });
    });

    it('should call methods with correct parameters', function () {
      treatmentPlansFactory.ActiveTreatmentPlan = 'activePlan';
      scope.removeServicesFromAppt = 'remove';

      ctrl.deleteServiceWithFlag();

      expect(
        ctrl.updateSelectedProposedServicesOnRemoveService
      ).toHaveBeenCalledWith(ctrl.serviceMarkedforDeletion);
      expect(treatmentPlansFactory.RemoveService).toHaveBeenCalledWith(
        treatmentPlansFactory.ActiveTreatmentPlan,
        serviceId,
        scope.removeServicesFromAppt
      );
    });

    describe('treatmentPlansFactory.RemoveService callback ->', function () {
      beforeEach(function () {
        treatmentPlansFactory.RemoveService = function () {
          return {
            then: function (success) {
              success();
            },
          };
        };
        spyOn(rootScope, '$broadcast').and.callThrough();
      });

      it('should set values and broadcaset event', function () {
        ctrl.deleteServiceWithFlag();

        expect(ctrl.serviceMarkedforDeletion).toBeNull();
        expect(rootScope.$broadcast).toHaveBeenCalledWith(
          'soar:tx-plan-services-changed',
          ctrl.serviceMarkedforDeletion,
          true
        );
      });
    });
  });

  describe('scope.deleteStage function ->', function () {
    var event, stages;
    beforeEach(function () {
      stages = [];
      treatmentPlansFactory.GetPlanStages = jasmine
        .createSpy()
        .and.returnValue(stages);
      treatmentPlansFactory.ActiveTreatmentPlan = _.cloneDeep(txPlanData);
      event = { stopPropagation: jasmine.createSpy() };
      ctrl.deletePlan = jasmine.createSpy();
      scope.disableEditFunctions = false;
    });

    it('should call event.stopPropagation and treatmentPlansFactory.GetPlanStages', function () {
      scope.treatmentPlan = 'treatmentPlan';
      scope.deleteStage({}, {}, event);

      expect(event.stopPropagation).toHaveBeenCalled();
      expect(treatmentPlansFactory.GetPlanStages).toHaveBeenCalled();
      expect(scope.planStages).toBe(stages);
    });

    describe('when planStages.length is 1 ->', function () {
      beforeEach(function () {
        // leave just one service in plan in the last stage
        treatmentPlansFactory.ActiveTreatmentPlan.TreatmentPlanServices.splice(
          1
        );
        stages.push({});
        stages[0].stageno = 1;
        treatmentPlansFactory.ActiveTreatmentPlan.TreatmentPlanServices[0].TreatmentPlanServiceHeader.TreatmentPlanGroupNumber = 1;
      });

      it('should call ctrl.deletePlan', function () {
        scope.deleteStage({}, stages[0], event);

        expect(ctrl.deletePlan).toHaveBeenCalled();
      });
    });

    describe('when planStages.length is greater than 1 ->', function () {
      var stageIndex, stage;
      beforeEach(function () {
        stageIndex = 'stageIndex';
        stage = { stageno: 'stageno' };
        stages.push({}, {});
      });

      it('should set ctrl.stageMarkedForDeletion and call modalFactory.DeleteModal', function () {
        ctrl.stageMarkedforDeletion = 'oldval';

        scope.deleteStage(stageIndex, stage, event);

        expect(ctrl.stageMarkedforDeletion).toBe(stage.stageno);
        expect(modalFactory.DeleteModal).toHaveBeenCalledWith(
          'stage',
          `Stage${stageIndex}`,
          true
        );
      });

      describe('modalFactory.DeleteModal success handler ->', function () {
        beforeEach(function () {
          ctrl.confirmDelete = jasmine.createSpy();
          modalFactory.DeleteModal = jasmine.createSpy().and.returnValue({
            then: function (success) {
              success();
            },
          });
        });

        it('should call ctrl.confirmDelete', function () {
          scope.deleteStage(stageIndex, stage, event);

          expect(ctrl.confirmDelete).toHaveBeenCalled();
        });
      });
    });

    it('should not call event.stopPropagation or treatmentPlansFactory.GetPlanStages when disableEditFunctions is true', function () {
      scope.treatmentPlan = 'treatmentPlan';
      scope.disableEditFunctions = true;
      scope.deleteStage({}, {}, event);

      expect(event.stopPropagation).not.toHaveBeenCalled();
      expect(treatmentPlansFactory.GetPlanStages).not.toHaveBeenCalled();
    });
  });

  describe('ctrl.getServiceTransactionStatuses ->', function () {
    it('static data shoud be defined', function () {
      spyOn(ctrl, 'setServiceStatus');
      ctrl.getServiceTransactionStatuses();
      expect(staticData).not.toBe(undefined);
      expect(ctrl.setServiceStatus).toHaveBeenCalled();
    });

    it('setServiceStatuses -> st not empty, not deleted', function () {
      scope.serviceTransactionStatuses = [
        { Id: 1, Name: 'Proposed', Order: 1 },
        { Id: 2, Name: 'Referred', Order: 2 },
        { Id: 3, Name: 'Rejected', Order: 3 },
        { Id: 4, Name: 'Completed', Order: 4 },
        { Id: 5, Name: 'Pending', Order: 5 },
        { Id: 6, Name: 'Existing', Order: 6 },
      ];

      scope.proposedServicesForStage = [
        {
          ServiceTransaction: {
            AccountMemberId: 'eff2c1a5-a5d6-485a-8b18-5205fc7d8a86',
            Amount: 1000,
            AppointmentId: null,
            RelatedRecordId: null,
            DateCompleted: '2018-11-15T23:13:07.7995325',
          },
          TreatmentPlanServiceHeader: {
            TreatmentPlanServiceId: '08d14a59-8661-402e-962b-e556d11a61f0',
            Priority: 0,
            TreatmentPlanId: 'd84e01fc-90dc-4e69-bf12-420d5f895d51',
            TreatmentPlanGroupNumber: 1,
            EstimatedInsurance: 0,
          },
        },
      ];
      let st = {
        ServiceTransaction: {
          statusName: 'Completed',
          ServiceTransactionStatusId: 4,
        },
      };
      let returnValue = ctrl.setServiceStatus(st);

      expect(returnValue).toBe('Completed');
    });

    it('setServiceStatuses -> st not empty, deleted', function () {
      scope.serviceTransactionStatuses = [
        { Id: 1, Name: 'Proposed', Order: 1 },
        { Id: 2, Name: 'Referred', Order: 2 },
        { Id: 3, Name: 'Rejected', Order: 3 },
        { Id: 4, Name: 'Completed', Order: 4 },
        { Id: 5, Name: 'Pending', Order: 5 },
        { Id: 6, Name: 'Existing', Order: 6 },
      ];

      scope.proposedServicesForStage = [
        {
          ServiceTransaction: {
            AccountMemberId: 'eff2c1a5-a5d6-485a-8b18-5205fc7d8a86',
            Amount: 1000,
            AppointmentId: null,
            RelatedRecordId: null,
            DateCompleted: '2018-11-15T23:13:07.7995325',
          },
          TreatmentPlanServiceHeader: {
            TreatmentPlanServiceId: '08d14a59-8661-402e-962b-e556d11a61f0',
            Priority: 0,
            TreatmentPlanId: 'd84e01fc-90dc-4e69-bf12-420d5f895d51',
            TreatmentPlanGroupNumber: 1,
            EstimatedInsurance: 0,
          },
        },
      ];
      let st = {
        ServiceTransaction: {
          statusName: 'Completed',
          ServiceTransactionStatusId: 4,
          IsDeleted: true,
        },
      };
      let returnValue = ctrl.setServiceStatus(st);

      expect(returnValue).toBe('Deleted');
    });

    it('setServiceStatuses -> st empty, not deleted', function () {
      scope.serviceTransactionStatuses = [
        { Id: 1, Name: 'Proposed', Order: 1 },
        { Id: 2, Name: 'Referred', Order: 2 },
        { Id: 3, Name: 'Rejected', Order: 3 },
        { Id: 4, Name: 'Completed', Order: 4 },
        { Id: 5, Name: 'Pending', Order: 5 },
        { Id: 6, Name: 'Existing', Order: 6 },
      ];
      scope.proposedServicesForStage = [
        {
          ServiceTransaction: {
            AccountMemberId: 'eff2c1a5-a5d6-485a-8b18-5205fc7d8a86',
            Amount: 1000,
            AppointmentId: null,
            RelatedRecordId: null,
            DateCompleted: '2018-11-15T23:13:07.7995325',
            ServiceTransactionStatusId: 4,
          },
          TreatmentPlanServiceHeader: {
            TreatmentPlanServiceId: '08d14a59-8661-402e-962b-e556d11a61f0',
            Priority: 0,
            TreatmentPlanId: 'd84e01fc-90dc-4e69-bf12-420d5f895d51',
            TreatmentPlanGroupNumber: 1,
            EstimatedInsurance: 0,
            ServiceTransactionStatusId: 4,
          },
        },
      ];
      let st;
      ctrl.setServiceStatus(st);
      expect(
        scope.proposedServicesForStage[0].ServiceTransaction.$$statusName
      ).toBe('Completed');
    });

    it('setServiceStatuses -> st empty, deleted', function () {
      scope.serviceTransactionStatuses = [
        { Id: 1, Name: 'Proposed', Order: 1 },
        { Id: 2, Name: 'Referred', Order: 2 },
        { Id: 3, Name: 'Rejected', Order: 3 },
        { Id: 4, Name: 'Completed', Order: 4 },
        { Id: 5, Name: 'Pending', Order: 5 },
        { Id: 6, Name: 'Existing', Order: 6 },
      ];
      scope.proposedServicesForStage = [
        {
          ServiceTransaction: {
            AccountMemberId: 'eff2c1a5-a5d6-485a-8b18-5205fc7d8a86',
            Amount: 1000,
            AppointmentId: null,
            RelatedRecordId: null,
            DateCompleted: '2018-11-15T23:13:07.7995325',
            ServiceTransactionStatusId: 4,
            IsDeleted: true,
          },
          TreatmentPlanServiceHeader: {
            TreatmentPlanServiceId: '08d14a59-8661-402e-962b-e556d11a61f0',
            Priority: 0,
            TreatmentPlanId: 'd84e01fc-90dc-4e69-bf12-420d5f895d51',
            TreatmentPlanGroupNumber: 1,
            EstimatedInsurance: 0,
            ServiceTransactionStatusId: 4,
          },
        },
      ];
      let st;
      ctrl.setServiceStatus(st);
      expect(
        scope.proposedServicesForStage[0].ServiceTransaction.$$statusName
      ).toBe('Deleted');
    });
  });

  describe('scope.remove function ->', function () {
    beforeEach(function () {
      ctrl.deletePlan = jasmine.createSpy();
      ctrl.removeStage = jasmine.createSpy();
      ctrl.deleteService = jasmine.createSpy();
      treatmentPlansFactory.ActiveTreatmentPlan.TreatmentPlanServices = [{}];
    });

    it('should call event.stopPropagation when event parameter is defined', function () {
      var event = { stopPropagation: jasmine.createSpy() };

      scope.remove({}, event);

      expect(event.stopPropagation).toHaveBeenCalled();
    });

    it('should call treatmentPlansFactory.SetActiveTreatmentPlan when setActive is true', function () {
      scope.treatmentPlan = 'txPlan';

      scope.remove({}, null, true);

      expect(treatmentPlansFactory.SetActiveTreatmentPlan).toHaveBeenCalledWith(
        scope.treatmentPlan
      );
    });

    it('should not call treatmentPlansFactory.SetActiveTreatmentPlan when setActive is not true', function () {
      scope.treatmentPlan = 'txPlan';

      scope.remove({});

      expect(
        treatmentPlansFactory.SetActiveTreatmentPlan
      ).not.toHaveBeenCalled();
    });

    describe('when active treatment plan has only one service ->', function () {
      it('should call ctrl.deletePlan', function () {
        scope.remove({});

        expect(ctrl.deletePlan).toHaveBeenCalled();
      });
    });

    describe('when active treatment plan has multiple services ->', function () {
      describe('when service stage has only a single service ->', function () {
        var group;
        beforeEach(function () {
          group = 'group1';
          treatmentPlansFactory.ActiveTreatmentPlan.TreatmentPlanServices = [
            {
              TreatmentPlanServiceHeader: {
                TreatmentPlanGroupNumber: group,
              },
            },
            {
              TreatmentPlanServiceHeader: {
                TreatmentPlanGroupNumber: group + '_other',
              },
            },
          ];
        });
      });

      describe('when service stage has multiple services ->', function () {
        var group;
        beforeEach(function () {
          group = 'group1';
          treatmentPlansFactory.ActiveTreatmentPlan.TreatmentPlanServices = [
            {
              TreatmentPlanServiceHeader: {
                TreatmentPlanGroupNumber: group,
              },
            },
            {
              TreatmentPlanServiceHeader: {
                TreatmentPlanGroupNumber: group,
              },
            },
          ];
        });

        it('should call ctrl.deleteService with service', function () {
          var paramService = {
            TreatmentPlanServiceHeader: {
              TreatmentPlanGroupNumber: group,
            },
          };

          scope.remove(paramService);

          expect(ctrl.deleteService).toHaveBeenCalledWith(paramService);
        });
      });
    });
  });

  describe('scope.getPatientBalance function ->', function () {
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
      var retVal = scope.getPatientBalance(serviceTransaction);
      expect(retVal).toBe(0);
      expect(serviceTransaction.$$PatientBalance).toBe(0);
    });

    it('should set $$PatientBalance and return value correctly when service is not deleted and insurance estimates are present', function () {
      serviceTransaction.IsDeleted = false;
      var expected =
        serviceTransaction.Amount -
        serviceTransaction.InsuranceEstimates[0].EstInsurance -
        serviceTransaction.InsuranceEstimates[0].AdjEst;
      var retVal = scope.getPatientBalance(serviceTransaction);
      expect(retVal).toBe(expected);
      expect(serviceTransaction.$$PatientBalance).toBe(expected);
    });

    it('should take no action when service is not deleted and insurance estimates are not present', function () {
      serviceTransaction.IsDeleted = false;
      serviceTransaction.InsuranceEstimates = null;
      var retVal = scope.getPatientBalance(serviceTransaction);
      expect(retVal).toBeUndefined();
      expect(serviceTransaction.$$PatientBalance).toBe('test');
    });

    it('should set $$PatientBalance to null and $$ShowInsEstimate to false if serviceTransaction status is Completed', function () {
      spyOn(scope, 'sum').and.returnValue(25.0);
      serviceTransaction = {
        IsDeleted: false,
        Amount: 100.0,
        InsuranceEstimates: { EstInsurance: 0, AdjEst: 0 },
      };
      serviceTransaction.ServiceTransactionStatusId = 4;
      scope.getPatientBalance(serviceTransaction);
      expect(serviceTransaction.$$ShowInsEstimate).toBe(false);
      expect(serviceTransaction.$$PatientBalance).toBe(null);
    });

    it('should set $$PatientBalance to 0 and $$ShowInsEstimate to false if serviceTransaction.IsDeleted is true', function () {
      spyOn(scope, 'sum').and.returnValue(25.0);
      serviceTransaction = {
        IsDeleted: true,
        Amount: 100.0,
        InsuranceEstimates: { EstInsurance: 0, AdjEst: 0 },
      };
      serviceTransaction.ServiceTransactionStatusId = 1;
      scope.getPatientBalance(serviceTransaction);
      expect(serviceTransaction.$$ShowInsEstimate).toBe(false);
      expect(serviceTransaction.$$PatientBalance).toBe(0);
    });

    it(
      'should set $$PatientBalance to Amount - EstInsurance - AdjEst and $$ShowInsEstimate to true if serviceTransaction.IsDeleted is false and ' +
        'ServiceTransactionStatusId is not 4',
      function () {
        spyOn(scope, 'sum').and.returnValue(25.0);
        serviceTransaction = {
          IsDeleted: false,
          Amount: 100.0,
          InsuranceEstimates: { EstInsurance: 0, AdjEst: 0 },
        };
        serviceTransaction.ServiceTransactionStatusId = 1;
        scope.getPatientBalance(serviceTransaction);
        expect(serviceTransaction.$$ShowInsEstimate).toBe(true);
        expect(serviceTransaction.$$PatientBalance).toBe(50);
      }
    );
  });

  describe('ctrl.getSum method ->', function () {
    var serviceTransaction;
    beforeEach(function () {
      serviceTransaction = {
        InsuranceEstimates: [
          { EstInsurance: 20.0 },
          { EstInsurance: 30.0 },
          { EstInsurance: 40.0 },
        ],
      };
    });
    it('should total values for a list based on property', function () {
      expect(
        ctrl.getSum(serviceTransaction.InsuranceEstimates, 'EstInsurance')
      ).toEqual(90.0);
    });
  });

  describe('ctrl.calculateInsuranceAmounts method ->', function () {
    var serviceTransaction;
    beforeEach(function () {
      spyOn(scope, 'getPatientBalance').and.callFake(function () {
        return 99.0;
      });
      serviceTransaction = {
        InsuranceEstimates: [
          { EstInsurance: 20.0, AdjEst: 12.0 },
          { EstInsurance: 30.0, AdjEst: 12.0 },
          { EstInsurance: 40.0, AdjEst: 12.0 },
        ],
      };
    });
    it('should call getSum for $$EstInsurance', function () {
      ctrl.calculateInsuranceAmounts(serviceTransaction);
      expect(
        ctrl.getSum(serviceTransaction.InsuranceEstimates, 'EstInsurance')
      ).toEqual(90.0);
    });
    it('should call getSum for $$EstInsurance', function () {
      ctrl.calculateInsuranceAmounts(serviceTransaction);
      expect(
        ctrl.getSum(serviceTransaction.InsuranceEstimates, 'AdjEst')
      ).toEqual(36.0);
    });
    it('should call scope,getPatientBalance ', function () {
      ctrl.calculateInsuranceAmounts(serviceTransaction);
      expect(scope.getPatientBalance).toHaveBeenCalledWith(serviceTransaction);
    });
    it('should set scope.adjustedEstimatePartTotal and scope.patientPortionPartTotal ', function () {
      scope.adjustedEstimatePartTotal = 0;
      scope.patientPortionPartTotal = 0;
      ctrl.calculateInsuranceAmounts(serviceTransaction);
      expect(scope.adjustedEstimatePartTotal).toEqual(36.0);
      expect(scope.patientPortionPartTotal).toEqual(99.0);
    });
  });

  describe('scope.addServicesWhenEnabled method ->', function () {
    var serviceTransaction;

    beforeEach(function () {
      scope.addServices = jasmine.createSpy();
    });

    it('should call addServices when disableEditFunctions is false', function () {
      var index = 5;
      scope.disableEditFunctions = false;

      scope.addServicesWhenEnabled(index);

      expect(scope.addServices).toHaveBeenCalledWith(index);
    });

    it('should not call addServices when disableEditFunctions is true', function () {
      var index = 5;
      scope.disableEditFunctions = true;

      scope.addServicesWhenEnabled(index);

      expect(scope.addServices).not.toHaveBeenCalled();
    });
  });
});
