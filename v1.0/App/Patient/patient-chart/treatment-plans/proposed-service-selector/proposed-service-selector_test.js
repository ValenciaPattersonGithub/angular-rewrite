describe('proposedServiceSelector directive ->', function () {
  var scope,
    modalFactory,
    q,
    ctrl,
    toastrFactory,
    patientServices,
    treatmentPlansFactory,
    mockTreatmentPlansFactory,
    patientValidationFactory,
    referenceDataService;

  var mockUsers = {
    Value: [
      { UserId: 1, UserCode: 'USERONE' },
      { UserId: 2, UserCode: 'USERTWO' },
    ],
  };

  var mockProposedServices = {
    Value: [{ ProviderUserId: 1 }, { ProviderUserId: 2 }],
  };

  beforeEach(module('Soar.Schedule'));

  beforeEach(
    module('Soar.Patient', function ($provide) {
      $provide.value('ServiceButtonsService', {});
      $provide.value('TypeOrMaterialsService', {});

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

      patientServices = {
        ServiceTransactions: {
          get: jasmine.createSpy(),
        },
      };
      var serviceCodesService = {
        CheckForAffectedAreaChanges: jasmine.createSpy().and.returnValue({}),
      };
      $provide.value('ServiceCodesService', serviceCodesService);
      $provide.value('PatientServices', patientServices);
      toastrFactory = {};
      toastrFactory.error = jasmine.createSpy();
      toastrFactory.success = jasmine.createSpy();
      $provide.value('toastrFactory', toastrFactory);
      $provide.value('UsersFactory', {
        Users: function () {
          return {
            then: function (callback) {
              return callback(mockUsers);
            },
          };
        },
      });
      $provide.value('FinancialService');
      referenceDataService = {
        getData: jasmine.createSpy(),
        entityNames: {
          serviceTypes: 'serviceTypes',
          preventiveServiceTypes: 'preventiveServiceTypes',
          serviceCodes: 'serviceCodes',
        },
      };

      $provide.value('referenceDataService', referenceDataService);
    })
  );

  beforeEach(inject(function ($rootScope, $controller, $injector, $q) {
    q = $q;
    scope = $rootScope.$new();
    scope.viewSettings = {};
    scope.patientInfo = { IsActive: true };

    referenceDataService.getData.and.callFake(function () {
      return $q.resolve([]);
    });

    mockTreatmentPlansFactory = {
      FinancialService: jasmine.createSpy().and.returnValue({}),
      ActiveTreatmentPlan: jasmine.createSpy().and.returnValue({}),
      GetActiveTreatmentPlanNextGroupNumber: jasmine
        .createSpy()
        .and.returnValue(2),
      SetNewTreatmentPlan: jasmine.createSpy(),
      CollapseAll: jasmine.createSpy(),
      SetDataChanged: jasmine.createSpy(),
      AddPlannedService: jasmine.createSpy(),
      Create: jasmine.createSpy(),
      CreateWithNoReload: jasmine
        .createSpy('treatmentPlansFactory.CreateWithNoReload')
        .and.callFake(function () {
          var deferred = q.defer();
          deferred.resolve('some value in return');
          return {
            result: deferred.promise,
            then: function () {},
          };
        }),
    };

    modalFactory = {
      Modal: jasmine.createSpy('modalFactory.Modal').and.callFake(function () {
        var modalFactoryDeferred = q.defer();
        modalFactoryDeferred.resolve('some value in return');
        return {
          result: modalFactoryDeferred.promise,
          then: function () {},
        };
      }),
    };

    ctrl = $controller('ProposedServiceSelectorController', {
      $scope: scope,
      TreatmentPlansFactory: mockTreatmentPlansFactory,
      ModalFactory: modalFactory,
    });
    ctrl.$onInit();
  }));

  describe('watches -> ', function () {
    it('should take appropriate action when treatmentPlansFactory object changes', function () {
      spyOn(ctrl, 'setHasBeenAddedToATxPlanFlag');
      // ExistingTreatmentPlans
      mockTreatmentPlansFactory.ExistingTreatmentPlans = { New: 'Value' };
      scope.$apply();
      expect(ctrl.setHasBeenAddedToATxPlanFlag).toHaveBeenCalled();
      expect(scope.existingTreatmentPlans).toEqual({ New: 'Value' });
      // NewTreatmentPlan
      mockTreatmentPlansFactory.NewTreatmentPlan = { New: 'Value' };
      scope.$apply();
      expect(scope.newTreatmentPlan).toEqual({ New: 'Value' });
      // ActiveTreatmentPlan
      mockTreatmentPlansFactory.ActiveTreatmentPlan = { Old: 'Value' };
      scope.$apply();
      mockTreatmentPlansFactory.ActiveTreatmentPlan = { New: 'Value' };
      scope.$apply();
      expect(scope.activeTreatmentPlan).toEqual({ New: 'Value' });
      expect(ctrl.setHasBeenAddedToATxPlanFlag).toHaveBeenCalled();
      // SavingPlan
      mockTreatmentPlansFactory.SavingPlan = false;
      scope.$apply();
      mockTreatmentPlansFactory.SavingPlan = true;
      scope.$apply();
      expect(ctrl.setHasBeenAddedToATxPlanFlag).toHaveBeenCalled();
      // AddingService
      mockTreatmentPlansFactory.AddingService = false;
      scope.$apply();
      mockTreatmentPlansFactory.AddingService = true;
      scope.$apply();
      expect(ctrl.setHasBeenAddedToATxPlanFlag).toHaveBeenCalled();
    });
  });

  describe('getProviders -> ', function () {
    it('should set with response and call getProposedServices', function () {
      spyOn(ctrl, 'getProposedServices');
      ctrl.getProviders();
      expect(ctrl.providers).toBe(mockUsers.Value);
      expect(ctrl.getProposedServices).toHaveBeenCalled();
    });
  });

  describe('getAllSuccess -> ', function () {
    it('should set proposedServices and call setHasBeenAddedToATxPlanFlag', function () {
      ctrl.filterByLocation = jasmine.createSpy();
      spyOn(ctrl, 'setHasBeenAddedToATxPlanFlag');
      ctrl.getAllSuccess(mockProposedServices);
      expect(ctrl.filterByLocation).toHaveBeenCalledWith(
        mockProposedServices.Value
      );
    });
    it('should assign appropriate UserCode to proposed service', function () {
      ctrl.filterByLocation = jasmine.createSpy();
      ctrl.getAllSuccess(mockProposedServices);
      expect(mockProposedServices.Value[0].UserCode).toEqual('USERONE');
      expect(mockProposedServices.Value[1].UserCode).toEqual('USERTWO');
    });
  });

  describe('getAllFailure -> ', function () {
    it('should call toastr error', function () {
      ctrl.getAllFailure();
      expect(toastrFactory.error).toHaveBeenCalled();
    });
  });

  describe('getProposedServices -> ', function () {
    it('should call patientServices.ServiceTransactions.get', function () {
      ctrl.getProposedServices();
      expect(patientServices.ServiceTransactions.get).toHaveBeenCalled();
    });
  });

  describe('add -> ', function () {
    it('should call AddPlannedService', function () {
      scope.add();
      expect(mockTreatmentPlansFactory.AddPlannedService).toHaveBeenCalled();
    });
  });

  describe('close -> ', function () {
    it('should perform appropriate resets', function () {
      scope.close();
      expect(scope.viewSettings.expandView).toBe(false);
      expect(scope.viewSettings.activeExpand).toBe(0);
      expect(scope.viewSettings.txPlanActiveId).toBe(null);
      expect(
        mockTreatmentPlansFactory.SetNewTreatmentPlan
      ).toHaveBeenCalledWith(null);
      expect(mockTreatmentPlansFactory.CollapseAll).toHaveBeenCalled();
      expect(mockTreatmentPlansFactory.SetDataChanged).toHaveBeenCalledWith(
        false
      );
    });
  });

  describe('getTitle -> ', function () {
    it('should return empty string if flag is set to false', function () {
      expect(scope.getTitle(false)).toBe('');
    });

    it('should return message if flag is set to true', function () {
      expect(scope.getTitle(true)).toBe(
        'This service is already added to another Treatment Plan.'
      );
    });
  });

  describe('Adding proposed services to treatment plan from expand view -> ', function () {
    it('should show options below when clicked on the Add to button ibb proposed service grid ', function () {
      scope.proposedServices = [
        { ServiceTransactionId: 100 },
        { ServiceTransactionId: 200 },
        { ServiceTransactionId: 300 },
      ];

      scope.showActions(scope.proposedServices[2]);
      expect(scope.proposedServices[0].ActionsVisible).toBe(false);
      expect(scope.proposedServices[1].ActionsVisible).toBe(false);
      expect(scope.proposedServices[2].ActionsVisible).toBe(true);
    });

    it('should move selected proposed service to selected stage', function () {
      var selectedService = { ServiceTransactionId: 100 };
      scope.move(selectedService, 1);
      expect(mockTreatmentPlansFactory.AddPlannedService).toHaveBeenCalled();
      expect(selectedService.ActionsVisible).toBe(false);
    });

    it('should move selected proposed service to new stage', function () {
      scope.move = jasmine.createSpy();
      var selectedService = { ServiceTransactionId: 100 };
      scope.addToNewStage(selectedService);
      scope.$apply();
      expect(scope.move).toHaveBeenCalledWith(selectedService, 2);
    });

    it('should close proposed service screen and go back to treatment plan expand view', function () {
      scope.viewSettings.expandView = true;
      scope.backToService();
      expect(scope.viewSettings.activeExpand).toBe(2);
      expect(mockTreatmentPlansFactory.CollapseAll).toHaveBeenCalledWith();
    });
  });

  describe('addServicesModalCallback -> ', function () {
    var services, stage, areNew;
    beforeEach(function () {
      services = [{}, {}];
      stage = 1;
      areNew = true;
      scope.person = '123';
    });

    it('should treatmentPlansFactory.Create with services if newTreatmentPlan', function () {
      scope.newTreatmentPlan = true;
      ctrl.addServicesModalCallback(services, stage, areNew);
      expect(mockTreatmentPlansFactory.Create).not.toHaveBeenCalledWith(
        services,
        scope.person
      );
    });

    it('should not call treatmentPlansFactory.Create if not newTreatmentPlan', function () {
      scope.newTreatmentPlan = false;
      ctrl.addServicesModalCallback(services, stage, areNew);
      expect(mockTreatmentPlansFactory.Create).not.toHaveBeenCalled();
    });
  });

  describe(' addNewService -> ', function () {
    it('should call modalFactory.Modal', function () {
      scope.addNewService();
      expect(modalFactory.Modal).toHaveBeenCalled();
    });
  });
});
