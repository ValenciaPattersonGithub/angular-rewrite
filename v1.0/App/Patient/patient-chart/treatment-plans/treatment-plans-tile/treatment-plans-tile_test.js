describe('treatmentPlansTile directive ->', function () {
  var scope,
    ctrl,
    modalFactory,
    modalFactoryDeferred,
    q,
    toastrFactory,
    patientServices,
    treatmentPlansFactory,
    serviceButtonsService,
    typeOrMaterialsService,
    buttonServiceDeferred,
    typeOrMaterialDeferred;
  var modalInstance, $uibModal, mockLocation;
  var discardChangesService;

  var txPlanData = {
    TreatmentPlanHeader: {
      TreatmentPlanId: 1,
      PersonId: 1,
      Status: 'Accepted',
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

  modalFactory = {
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
        SetPlanStages: jasmine.createSpy(),
        SetEditing: jasmine.createSpy(),
        SetDataChanged: jasmine.createSpy(),
        Update: jasmine.createSpy(),
        LoadPlanStages: jasmine.createSpy(),
      };
      $provide.value('TreatmentPlansFactory', treatmentPlansFactory);

      discardChangesService = {
        currentChangeRegistration: {
          controller: 'PatientCrudNotesController',
          hasChanges: true,
        },
      };
      $provide.value('DiscardChangesService', discardChangesService);

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

    mockLocation = {
      path: jasmine.createSpy('location.path'),
    };

    scope = $rootScope.$new();
    ctrl = $controller('TreatmentPlansTileController', {
      $scope: scope,
      ModalFactory: modalFactory,
      $uibModalInstance: modalInstance,
      TreatmentPlansFactory: treatmentPlansFactory,
      ServiceButtonsService: serviceButtonsService,
      TypeOrMaterialsService: typeOrMaterialsService,
      $location: mockLocation,
    });
  }));

  describe('initial values -> ', function () {
    it('controller should exist', function () {
      expect(ctrl).not.toBeNull();
    });

    it(' opens confirmation modal when clicks on deleted treatmentplan link and deletes after clicking on confirm button', function () {
      scope.viewSettings = {};
      scope.delete(txPlanData);
      expect(modalFactory.DeleteModal).toHaveBeenCalled();
      ctrl.confirmDelete();
      expect(treatmentPlansFactory.Delete).toHaveBeenCalled();
    });
  });

  describe('openTreatmentPlanCrudPanel method -> ', function () {
    it('should call treatmentPlansFactory.SetActiveTreatmentPlan and set expandView and activeExpand to true', function () {
      scope.viewSettings = { expandView: false };
      scope.viewSettings = { activeExpand: 0 };
      treatmentPlansFactory.SetActiveTreatmentPlan = jasmine
        .createSpy()
        .and.returnValue(false);
      scope.openTreatmentPlanCrudPanel();
      expect(treatmentPlansFactory.SetActiveTreatmentPlan).toHaveBeenCalled();
      expect(scope.viewSettings.expandView).toBe(true);
      expect(scope.viewSettings.activeExpand).toEqual(2);
    });
  });

  describe('getTxPlanTileClasses method -> ', function () {
    var plan;

    beforeEach(function () {
      scope.viewSettings = {};
      scope.viewSettings.txPlanActiveId = 1;
      plan = angular.copy(txPlanData);
    });

    it('should return active class if txPlan.TreatmentPlanHeader.TreatmentPlanId == $scope.viewSettings.txPlanActiveId and timelineView is false', function () {
      scope.timelineView = true;
      expect(ctrl.getTxPlanTileClasses(plan)).toBe('active ');
    });

    it('should return active txPlanTile__txPlanTileBorder class if txPlan.TreatmentPlanHeader.TreatmentPlanId == $scope.viewSettings.txPlanActiveId and timelineView is true', function () {
      scope.timelineView = false;
      expect(ctrl.getTxPlanTileClasses(plan)).toBe(
        'active txPlanTile__txPlanTileBorder'
      );
    });

    it('should not return active class if txPlan.TreatmentPlanHeader.TreatmentPlanId and $scope.viewSettings.txPlanActiveId are not equal', function () {
      scope.viewSettings.txPlanActiveId = 2;
      scope.timelineView = true;
      expect(ctrl.getTxPlanTileClasses(plan)).toBe('');
    });

    it('should return txPlanTile__txPlanTileBorder class if not a timelineView', function () {
      scope.viewSettings.txPlanActiveId = 2;
      scope.timelineView = false;
      expect(ctrl.getTxPlanTileClasses(plan)).toBe(
        'txPlanTile__txPlanTileBorder'
      );
    });

    it('should return timelineTile class if $scope.timelineView is truthy', function () {
      scope.timelineView = true;
      expect(ctrl.getTxPlanTileClasses(plan)).toBe('active ');
    });

    it('should not return timelineTile class if $scope.timelineView is falsy', function () {
      scope.timelineView = false;
      expect(ctrl.getTxPlanTileClasses(plan)).toBe(
        'active txPlanTile__txPlanTileBorder'
      );
    });

    it('should return $$GroupingClass value if $$GroupingClass is truthy', function () {
      scope.viewSettings.txPlanActiveId = 2;
      plan.$$GroupingClass = 'test';
      scope.timelineView = true;
      expect(ctrl.getTxPlanTileClasses(plan)).toBe('test');
    });

    it('should return all the classes', function () {
      plan.$$GroupingClass = 'test';
      scope.timelineView = true;
      expect(ctrl.getTxPlanTileClasses(plan)).toBe('active test');
    });
  });

  describe('scope.txPlanCollapseTile function ->', function () {
    var event, plan;
    beforeEach(function () {
      event = { stopPropagation: jasmine.createSpy() };
      ctrl.removeEmptyStage = jasmine.createSpy();
      plan = {
        TreatmentPlanHeader: {
          CollapsedViewVisible: true,
        },
      };
      scope.viewSettings = { expandView: true };
    });

    it('should call functions and set values correctly', function () {
      scope.txPlanCollapseTile(plan, event);

      expect(event.stopPropagation).toHaveBeenCalled();
      expect(ctrl.removeEmptyStage).toHaveBeenCalled();
      expect(plan.TreatmentPlanHeader.CollapsedViewVisible).toBe(false);
      expect(scope.viewSettings.expandView).toBe(false);
    });
  });

  describe('scope.viewPredetermination method -> ', function () {
    it('should redirect if treatment plan has predetermination with response', function () {
      scope.txPlan = {
        Predeterminations: [
          {
            ClaimId: '1',
          },
        ],
      };
      scope.viewPredetermination();
      expect(mockLocation.path).toHaveBeenCalled();
    });
    it('should not redirect if treatment plan has no predetermination with response', function () {
      scope.txPlan = {
        Predeterminations: [],
      };
      scope.viewPredetermination();
      expect(mockLocation.path).not.toHaveBeenCalled();
    });
  });

  describe('ctrl.$onInit method -> ', function () {
    beforeEach(function () {
      scope.txPlan = {
        TreatmentPlanHeader: {
          TreatmentPlanId: 21,
          CollapsedViewVisible: false,
        },
        TreatmentPlanServices: [{}],
      };
      spyOn(ctrl, 'calculateServiceTotals');
      spyOn(ctrl, 'getTxPlanTileClasses').and.callFake(function () {});
    });
    it('should call ctrl.calculateServiceTotals when init', function () {
      ctrl.$onInit();
      expect(ctrl.calculateServiceTotals).toHaveBeenCalledWith(
        scope.txPlan.TreatmentPlanServices
      );
    });

    it('should call ctrl.getTxPlanTileClasses when init', function () {
      ctrl.$onInit();
      expect(ctrl.calculateServiceTotals).toHaveBeenCalledWith(
        scope.txPlan.TreatmentPlanServices
      );
      expect(scope.txPlan.TreatmentPlanHeader.CollapsedViewVisible).toBe(false);
    });
  });

  describe('ctrl.getTxPlanTileClasses method -> ', function () {
    beforeEach(function () {
      scope.txPlan = {
        TreatmentPlanHeader: {
          TreatmentPlanId: 21,
          CollapsedViewVisible: false,
        },
        TreatmentPlanServices: [{}],
      };
      scope.viewSettings = { txPlanActiveId: 21 };
      scope.txPlan.$$GroupingClass = 'Border:5px';
    });

    it('should not set css class to contain active if txPlanActiveId equals txPlan.TreatmentPlanId', function () {
      scope.viewSettings = { txPlanActiveId: 22 };
      expect(ctrl.getTxPlanTileClasses(scope.txPlan)).not.toContain('active');
    });

    it('should set css class to contain active if txPlanActiveId equals txPlan.TreatmentPlanId', function () {
      scope.viewSettings = { txPlanActiveId: 21 };
      expect(ctrl.getTxPlanTileClasses(scope.txPlan)).toContain('active');
    });

    it('should set css class to contain plan.$$GroupingClass if in timeline view ', function () {
      scope.timelineView = true;
      ctrl.getTxPlanTileClasses(scope.txPlan);
      expect(ctrl.getTxPlanTileClasses(scope.txPlan)).toContain(
        scope.txPlan.$$GroupingClass
      );
    });

    it('should set css class to not contain txPlanTile__txPlanTileBorder if not in timeline view ', function () {
      scope.timelineView = false;
      ctrl.getTxPlanTileClasses(scope.txPlan);
      expect(ctrl.getTxPlanTileClasses(scope.txPlan)).toContain(
        'txPlanTile__txPlanTileBorder'
      );
    });

    it('should set css class to contain plan.$$GroupingClass if not in timeline view ', function () {
      scope.timelineView = false;
      ctrl.getTxPlanTileClasses(scope.txPlan);
      expect(ctrl.getTxPlanTileClasses(scope.txPlan)).not.toContain(
        scope.txPlan.$$GroupingClass
      );
    });
  });

  describe('ctrl.calculateServiceTotals method -> ', function () {
    var treatmentPlan = {};
    beforeEach(function () {
      scope.txPlan = {
        TreatmentPlanHeader: {
          TreatmentPlanId: 21,
          CollapsedViewVisible: false,
        },
        TreatmentPlanServices: [
          { TreatmentPlanServiceHeader: {} },
          { TreatmentPlanServiceHeader: {} },
        ],
      };
      spyOn(ctrl, 'servicesAmountLeft').and.callFake(function () {});
      spyOn(ctrl, 'servicesCompleted').and.callFake(function () {});
    });
    it('should call ctrl.servicesCompleted treatmentPlan.TreatmentPlanServices', function () {
      ctrl.calculateServiceTotals(scope.txPlan.TreatmentPlanServices);
      expect(ctrl.servicesCompleted).toHaveBeenCalledWith(
        scope.txPlan.TreatmentPlanServices
      );
    });

    it('should call ctrl.servicesAmountLeft with treatmentPlan.TreatmentPlanServices', function () {
      ctrl.calculateServiceTotals(scope.txPlan.TreatmentPlanServices);
      expect(ctrl.servicesAmountLeft).toHaveBeenCalledWith(
        scope.txPlan.TreatmentPlanServices
      );
    });
  });

  describe('ctrl.servicesAmountLeft method -> ', function () {
    var treatmentPlanServices = [];
    beforeEach(function () {
      treatmentPlanServices = [
        {
          TreatmentPlanServiceHeader: {},
          ServiceTransaction: { Amount: 200, ServiceTransactionStatusId: 1 },
        },
        {
          TreatmentPlanServiceHeader: {},
          ServiceTransaction: { Amount: 200, ServiceTransactionStatusId: 1 },
        },
        {
          TreatmentPlanServiceHeader: {},
          ServiceTransaction: { Amount: 200, ServiceTransactionStatusId: 1 },
        },
        {
          TreatmentPlanServiceHeader: {},
          ServiceTransaction: { Amount: 200, ServiceTransactionStatusId: 1 },
        },
      ];
    });
    it('should return balance of treatmentPlanServices', function () {
      expect(ctrl.servicesAmountLeft(treatmentPlanServices)).toEqual(800);
    });

    it('should return balance of treatmentPlanServices but exclude services with status of Completed', function () {
      treatmentPlanServices[3].ServiceTransaction.ServiceTransactionStatusId = 4;
      expect(ctrl.servicesAmountLeft(treatmentPlanServices)).toEqual(600);
    });
  });

  describe('ctrl.servicesCompleted method -> ', function () {
    var treatmentPlanServices = [];
    beforeEach(function () {
      treatmentPlanServices = [
        {
          TreatmentPlanServiceHeader: {},
          ServiceTransaction: { Amount: 200, ServiceTransactionStatusId: 1 },
        },
        {
          TreatmentPlanServiceHeader: {},
          ServiceTransaction: { Amount: 200, ServiceTransactionStatusId: 1 },
        },
        {
          TreatmentPlanServiceHeader: {},
          ServiceTransaction: { Amount: 200, ServiceTransactionStatusId: 1 },
        },
        {
          TreatmentPlanServiceHeader: {},
          ServiceTransaction: { Amount: 200, ServiceTransactionStatusId: 1 },
        },
      ];
    });
    it('should return count of completed services', function () {
      expect(ctrl.servicesCompleted(treatmentPlanServices)).toEqual(0);

      treatmentPlanServices[2].ServiceTransaction.ServiceTransactionStatusId = 4;
      treatmentPlanServices[3].ServiceTransaction.ServiceTransactionStatusId = 4;

      expect(ctrl.servicesCompleted(treatmentPlanServices)).toEqual(2);
    });
  });

  describe('txPlan.TreatmentPlanServices watch -> ', function () {
    beforeEach(function () {
      scope.txPlan = {
        TreatmentPlanHeader: {
          TreatmentPlanId: 21,
          CollapsedViewVisible: false,
        },
        TreatmentPlanServices: [{}],
      };
      spyOn(ctrl, 'calculateServiceTotals');
    });
    it('should call ctrl.calculateServiceTotals when scope.txPlan.TreatmentPlanServices change', function () {
      scope.txPlan.TreatmentPlanServices.push({});
      scope.$apply();
      scope.txPlan.TreatmentPlanServices.push({});
      scope.$apply();
      expect(ctrl.calculateServiceTotals).toHaveBeenCalledWith(
        scope.txPlan.TreatmentPlanServices
      );
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

    it(
      'should set discardChangesService.currentChangeRegistration.hasChanges to false ' +
        'if controllerName parameter matches discardChangesService.currentChangeRegistration.controller and hasChanges is true ',
      function () {
        discardChangesService.currentChangeRegistration.hasChanges = true;
        discardChangesService.currentChangeRegistration.controller =
          'TreatmentPlansReorderController';
        expect(
          ctrl.clearDiscardChangesService('TreatmentPlansReorderController')
        ).toBe(true);
        expect(discardChangesService.currentChangeRegistration.hasChanges).toBe(
          false
        );
      }
    );
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

  describe('ctrl.cancelChanges -> ', function () {
    it('should call modalFactory.CancelModal', function () {
      ctrl.cancelChanges();
      expect(modalFactory.CancelModal).toHaveBeenCalled();
    });
  });

  describe('confirmCancel function -> ', function () {
    beforeEach(function () {
      spyOn(ctrl, 'navigateToPlan').and.callFake(function () {});
      spyOn(ctrl, 'clearDiscardChangesService');
    });

    it('should call ctrl.clearDiscardChangesService', function () {
      ctrl.confirmCancel();
      expect(ctrl.clearDiscardChangesService).toHaveBeenCalledWith(
        'TreatmentPlansReorderController'
      );
    });

    it('should call ctrl.navigateToPlan', function () {
      ctrl.confirmCancel();
      expect(ctrl.navigateToPlan).toHaveBeenCalled();
    });
  });

  describe('ctrl.navigateToPlan method -> ', function () {
    beforeEach(function () {
      ctrl.selectedPlan = { TreatmentPlanHeader: { TreatmentPlanId: '1234' } };

      scope.viewSettings = { expandView: true };
    });

    it('should set treatmentPlansFactory.ActiveTreatmentPlan ', function () {
      ctrl.navigateToPlan();
      expect(scope.viewSettings.activeExpand).toEqual(2);
      expect(treatmentPlansFactory.SetActiveTreatmentPlan).toHaveBeenCalledWith(
        ctrl.selectedPlan
      );
    });

    it('should not call treatmentPlansFactory.SetActiveTreatmentPlan when ActiveTreatmentPlan is not equal to selectedPlan', function () {
      treatmentPlansFactory.ActiveTreatmentPlan = {
        TreatmentPlanHeader: { TreatmentPlanId: '54321' },
      };
      ctrl.navigateToPlan();
      expect(scope.viewSettings.activeExpand).toEqual(2);

      expect(treatmentPlansFactory.SetActiveTreatmentPlan).toHaveBeenCalledWith(
        ctrl.selectedPlan
      );
    });

    it('should not call treatmentPlansFactory.SetActiveTreatmentPlan when ActiveTreatmentPlan is not equal to selectedPlan', function () {
      treatmentPlansFactory.ActiveTreatmentPlan = {
        TreatmentPlanHeader: { TreatmentPlanId: '1234' },
      };
      ctrl.navigateToPlan();
      expect(scope.viewSettings.activeExpand).toEqual(2);

      expect(
        treatmentPlansFactory.SetActiveTreatmentPlan
      ).not.toHaveBeenCalledWith(ctrl.selectedPlan);
    });
  });
});
