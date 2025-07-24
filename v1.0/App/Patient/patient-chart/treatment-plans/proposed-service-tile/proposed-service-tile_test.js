describe('proposedServiceTile directive ->', function () {
  var scope,
    ctrl,
    q,
    toastrFactory,
    patientServices,
    service,
    providers,
    modalFactory,
    treatmentPlansFactory;
  var modalInstance, $uibModal;
  var usersFactory;

  var txPlanData = {
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
      {
        TreatmentPlanServiceHeader: {
          TreatmentPlanServiceId: 2,
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
          TreatmentPlanServiceId: 3,
          Priority: 0,
          TreatmentPlanId: 1,
          TreatmentPlanGroupNumber: 2,
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
    ],
  };

  service = {
    ServiceTransaction: {
      ProviderUserId: 1,
    },
  };

  providers = [
    {
      UserId: 1,
      UserCode: 'code',
    },
  ];

  usersFactory = {
    Users: jasmine.createSpy('usersFactory.Users').and.callFake(function () {
      var userFactoryDeferred = q.defer();
      userFactoryDeferred.resolve(1);
      return {
        result: userFactoryDeferred.promise,
        then: function () {},
      };
    }),
  };
  modalFactory = {
    DeleteModal: jasmine
      .createSpy('modalFactory.DeleteModal')
      .and.callFake(function () {
        var modalFactoryDeferred = q.defer();
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
        DeleteStage: jasmine.createSpy().and.returnValue({
          then: jasmine.createSpy(),
        }),
        SetActiveTreatmentPlan: jasmine.createSpy(),
        SetNewTreatmentPlan: jasmine.createSpy(),
        CollapseAll: jasmine.createSpy(),
        GetPlanStages: jasmine.createSpy().and.returnValue({}),
        SetEditing: jasmine.createSpy(),
        SetDataChanged: jasmine.createSpy(),
        Update: jasmine.createSpy(),
        RemoveService: jasmine.createSpy(),
        UpdateServiceHeader: jasmine.createSpy().and.returnValue({
          then: jasmine.createSpy(),
        }),
        ActiveTreatmentPlan: txPlanData,
        GetActiveTreatmentPlanNextGroupNumber: jasmine
          .createSpy()
          .and.returnValue(3),
      };
      $provide.value('TreatmentPlansFactory', treatmentPlansFactory);

      patientServices = {
        ServiceTransactions: {
          get: jasmine.createSpy(),
        },
      };
      $provide.value('PatientServices', patientServices);
      toastrFactory = {};
      toastrFactory.error = jasmine.createSpy();
      toastrFactory.success = jasmine.createSpy();
      $provide.value('toastrFactory', toastrFactory);
    })
  );

  beforeEach(inject(function ($rootScope, $controller, $q, _$uibModal_) {
    q = $q;
    $uibModal = _$uibModal_;
    spyOn($uibModal, 'open').and.callThrough();

    modalInstance = {
      close: jasmine.createSpy('modalInstance.close').and.returnValue({}),
      dismiss: jasmine.createSpy('modalInstance.dismiss'),
      result: {
        then: jasmine.createSpy('modalInstance.result.then'),
      },
    };
    modalFactory = {
      Modal: jasmine.createSpy().and.callFake(function () {
        var modalFactoryDeferred = q.defer();
        modalFactoryDeferred.resolve(1);
        return {
          result: modalFactoryDeferred.promise,
          then: function () {},
        };
      }),
      DeleteModal: jasmine
        .createSpy('modalFactory.DeleteModal')
        .and.callFake(function () {
          var modalFactoryDeferred = q.defer();
          modalFactoryDeferred.resolve(1);
          return {
            result: modalFactoryDeferred.promise,
            then: function () {},
          };
        }),
      CancelModal: jasmine
        .createSpy('modalFactory.CancelModal')
        .and.callFake(function () {
          var modalFactoryDeferred = q.defer();
          modalFactoryDeferred.resolve(1);
          return {
            result: modalFactoryDeferred.promise,
            then: function () {},
          };
        }),
    };
    scope = $rootScope.$new();
    scope.service = service;
    ctrl = $controller('ProposedServiceTileController', {
      $scope: scope,
      UsersFactory: usersFactory,
      ModalFactory: modalFactory,
      $uibModalInstance: modalInstance,
      TreatmentPlansFactory: treatmentPlansFactory,
    });
    ctrl.providers = providers;
  }));

  describe('getUserCode -> ', function () {
    it('should ', function () {
      ctrl.getUserCode();
      expect(scope.service.ServiceTransaction.UserCode).toBe('code');
    });
  });

  describe('delete stage -> ', function () {
    it('opend modal for deletes stages and services ', function () {
      ctrl.removeStage(txPlanData.TreatmentPlanServices[0]);
      expect(ctrl.stageMarkedforDeletion).toEqual(1);
      expect(modalFactory.DeleteModal).toHaveBeenCalledWith('Stage ', 1, true);
    });

    it('deletes stages and services after confirming in modal', function () {
      ctrl.confirmRemoveStage();
      expect(treatmentPlansFactory.DeleteStage).toHaveBeenCalled();
    });
  });

  describe('delete treatment plan -> ', function () {
    it('opened modal for deleting treatment plan ', function () {
      ctrl.deletePlan();
      expect(modalFactory.DeleteModal).toHaveBeenCalled();
    });

    it('deletes treatment plan after confirming in modal', function () {
      ctrl.confirmDeletePlan();
      expect(treatmentPlansFactory.Delete).toHaveBeenCalled();
    });
  });
  describe('check for stage number', function () {
    it('check for stage number in treatment plan services', function () {
      scope.txPlan = txPlanData;
      expect(ctrl.findStageNumberNumInServices(1)).toBeTruthy();
      expect(ctrl.findStageNumberNumInServices(2)).toBeTruthy();
      expect(ctrl.findStageNumberNumInServices(3)).toBeFalsy();
    });
  });
  describe('removes stage if it hase only one service while deleting and removes treatment plan if it has only one service or stage', function () {
    it('moves service to new stage', function () {
      scope.remove({
        TreatmentPlanServiceHeader: { TreatmentPlanGroupNumber: 2 },
      });
      expect(modalFactory.DeleteModal).toHaveBeenCalled();

      scope.remove({
        TreatmentPlanServiceHeader: { TreatmentPlanGroupNumber: 1 },
      });
      expect(treatmentPlansFactory.RemoveService).toHaveBeenCalled();
    });
  });
  describe('move service', function () {
    it('moves service to new stage', function () {
      scope.move(txPlanData.TreatmentPlanServices[0], 2);
      expect(treatmentPlansFactory.UpdateServiceHeader).toHaveBeenCalled();
      expect(
        txPlanData.TreatmentPlanServices[0].TreatmentPlanServiceHeader
          .TreatmentPlanGroupNumber
      ).toEqual(2);
    });

    it('adds new stage and moves service to stage', function () {
      scope.planStages = [{ stageno: 1 }, { stageno: 2 }];
      scope.addToNewStage(txPlanData.TreatmentPlanServices[0]);
      expect(
        treatmentPlansFactory.GetActiveTreatmentPlanNextGroupNumber
      ).toHaveBeenCalled();
      expect(
        txPlanData.TreatmentPlanServices[0].TreatmentPlanServiceHeader
          .TreatmentPlanGroupNumber
      ).toEqual(3);
      expect(scope.planStages).toEqual([
        { stageno: 1 },
        { stageno: 2 },
        { stageno: 3 },
      ]);
    });
  });
});
