describe('AddTxPlanServicesController ->', function () {
  var scope,
    ctrl,
    timeout,
    $uibModalInstance,
    treatmentPlansFactory,
    patientPreventiveCareFactory,
    patientOdontogramFactory,
    localize;

  // #region mocks

  var mockAddServicesCallback = jasmine.createSpy();
  var mockPatient = {};
  var stageNumber = 1;
  var treatmentPlanIdMock = '1234';
  var mockTreatmentPlanServices = [];
  var mockServicesOnEncounter = [];
  var saveService = false;

  // #endregion mocks

  // #region setup

  beforeEach(module('Soar.Common'));

  beforeEach(
    module('Soar.Patient', function ($provide) {
      localize = {
        getLocalizedString: jasmine.createSpy().and.returnValue(''),
      };

      patientOdontogramFactory = {
        TeethDefinitions: jasmine.createSpy().and.returnValue({
          then: jasmine.createSpy(),
        }),
        serviceCodes: [],
        setNextSmartCode: jasmine.createSpy(),
        setselectedChartButton: jasmine.createSpy(),
      };
      $provide.value('PatientOdontogramFactory', patientOdontogramFactory);

      patientPreventiveCareFactory = {
        GetAllServicesDue: jasmine.createSpy().and.returnValue({
          then: jasmine.createSpy(),
        }),
        PreventiveCareServices: jasmine.createSpy().and.returnValue({
          then: jasmine.createSpy(),
        }),
        NextTrumpServiceDueDate: jasmine.createSpy().and.returnValue({
          then: jasmine.createSpy(),
        }),
        SetCustomPropertiesForServicesDue: jasmine
          .createSpy()
          .and.returnValue({}),
      };
      $provide.value(
        'PatientPreventiveCareFactory',
        patientPreventiveCareFactory
      );

      treatmentPlansFactory = {
        Headers: jasmine.createSpy().and.returnValue({
          then: jasmine.createSpy().and.returnValue({}),
        }),
        SetActiveTreatmentPlan: jasmine.createSpy().and.returnValue({}),
        GetTreatmentPlanById: jasmine.createSpy().and.returnValue({}),
      };
      $provide.value('TreatmentPlansFactory', treatmentPlansFactory);
    })
  );

  beforeEach(inject(function (
    $rootScope,
    $controller,
    $location,
    $injector,
    $timeout,
    $q
  ) {
    var deferred = $q.defer();
    deferred.resolve(1);
    $uibModalInstance = {
      rendered: {
        then: jasmine
          .createSpy('$uibModalInstance.result.then')
          .and.returnValue(deferred.promise),
      },
    };

    // scopes
    scope = $rootScope.$new();

    // instantiating the controller object
    ctrl = $controller('AddTxPlanServicesController', {
      $scope: scope,
      addServicesCallback: mockAddServicesCallback,
      patient: mockPatient,
      stageNumber: stageNumber,
      saveService: saveService,
      treatmentPlanId: treatmentPlanIdMock,
      treatmentPlanServices: mockTreatmentPlanServices,
      servicesOnEncounter: mockServicesOnEncounter,
      $uibModalInstance: $uibModalInstance,
      localize: localize,
      includeEstIns: true,
    });
    timeout = $timeout;
  }));

  //#endregion

  //#region tests

  it('should exist', function () {
    expect(ctrl).not.toBeNull();
  });

  describe('ctrl.$onInit ->', function () {
    beforeEach(function () {
      ctrl.getServices = jasmine.createSpy();
      ctrl.processTreatmentPlanServices = jasmine
        .createSpy()
        .and.returnValue({ test: 'test' });
      localize.getLocalizedString = jasmine
        .createSpy()
        .and.returnValue('Add Services to Stage {0}');
      scope.setChosenLocation = jasmine.createSpy();
    });

    it('should set default values', function () {
      ctrl.$onInit();
      expect(scope.hasChanges).toBe(false);
      expect(scope.title).toBe('Add Services to Stage {0}');
      expect(scope.dataLoadingProposed).toEqual({ loading: false });
      expect(scope.dataLoadingNewService).toEqual({ loading: false });
      expect(scope.patient).toBe(mockPatient);
      expect(ctrl.addedServiceTransactions).toEqual([]);
      expect(ctrl.addedNewServices).toEqual([]);
      expect(ctrl.processTreatmentPlanServices).toHaveBeenCalledWith(
        mockTreatmentPlanServices
      );
      expect(scope.proposedServicesOnPlan).toEqual({ test: 'test' });
      expect(
        patientPreventiveCareFactory.NextTrumpServiceDueDate
      ).toHaveBeenCalledWith(scope.patientId);
      expect(ctrl.treatmentPlanId).toBe('1234');
    });

    describe('when patientOdontogramFactory.serviceCodes does not exist ->', function () {
      beforeEach(function () {
        patientOdontogramFactory.serviceCodes = null;
      });

      it('should call ctrl.getServices', function () {
        ctrl.$onInit();
      });
    });

    describe('when patientOdontogramFactory.serviceCodes exists ->', function () {
      it('should call ctrl.getServices', function () {
        ctrl.$onInit();
      });
    });

    describe('when $uibModalInstance.IsNewTreatmentPlan exists ->', function () {
      beforeEach(function () {
        $uibModalInstance.IsNewTreatmentPlan = true;
      });

      it('should set isNewTreatmentPlan to true', function () {
        ctrl.$onInit();
        expect(scope.isNewTreatmentPlan).toBe(true);
      });

      it('should call showServiceFlyout', function () {
        spyOn(scope, 'showServiceFlyout');
        ctrl.$onInit();
        $uibModalInstance.rendered.then(function () {
          timeout.flush();
          expect(scope.showServiceFlyout).toHaveBeenCalled();
        });
      });
    });

    describe('when $uibModalInstance.IsNewTreatmentPlan doesnt exists ->', function () {
      beforeEach(function () {});

      it('should set isNewTreatmentPlan to true', function () {
        ctrl.$onInit();
        expect(scope.isNewTreatmentPlan).toBe(false);
      });
    });

    // when called from encounter cart
    describe('when $uibModalInstance.isEncounterServices is true ->', function () {
      beforeEach(function () {
        $uibModalInstance.isEncounterServices = true;
        localize.getLocalizedString = jasmine
          .createSpy()
          .and.returnValue('Add Services to Encounter');
        spyOn(ctrl, 'initializeProposedServicesOnPlan');
      });

      it('should set scope.isEncounterServices to true', function () {
        ctrl.$onInit();
        expect(scope.isEncounterServices).toBe(true);
      });

      it('should call ctrl.initializeProposedServicesOnPlan', function () {
        ctrl.$onInit();
        expect(ctrl.initializeProposedServicesOnPlan).toHaveBeenCalled();
      });

      it('should set scope.serviceFilter to encounter-refactored', function () {
        ctrl.$onInit();
        expect(scope.serviceFilter).toBe('encounter-refactored');
      });

      it('should set scope.title to Add Services to Encounter', function () {
        ctrl.$onInit();
        expect(scope.title).toBe('Add Services to Encounter');
      });

      it('should call treatmentPlansFactory.SetActiveTreatmentPlan with null', function () {
        ctrl.$onInit();
        expect(
          treatmentPlansFactory.SetActiveTreatmentPlan
        ).toHaveBeenCalledWith(null);
      });
    });
  });

  describe('ctrl.processTreatmentPlanServices ->', function () {
    it('should return list of ids', function () {
      var services = [
        { test: 'test' },
        { ServiceTransaction: { ServiceTransactionId: 1 } },
      ];
      var retValue = ctrl.processTreatmentPlanServices(services);
      expect(retValue).toEqual([
        services[1].ServiceTransaction.ServiceTransactionId,
      ]);
    });
  });

  describe('watch treatmentPlansFactory.ActiveTreatmentPlan', function () {
    beforeEach(function () {
      ctrl.treatmentPlanId = null;
    });

    it('should set ctrl.treatmentPlanId to null if ActiveTreatmentPlan is null', function () {
      treatmentPlansFactory.ActiveTreatmentPlan = null;
      scope.$apply();
      expect(ctrl.treatmentPlanId).toBe(null);
    });

    it('should set ctrl.treatmentPlanId to ActiveTreatmentPlan.TreatmentPlanHeader.TreatmentPlanId if ActiveTreatmentPlan is not null', function () {
      treatmentPlansFactory.ActiveTreatmentPlan = {
        TreatmentPlanHeader: { TreatmentPlanId: '1234' },
      };
      scope.$apply();
      expect(ctrl.treatmentPlanId).toBe('1234');
    });
  });

  //#endregion

  /*// listening for changes to ActiveTreatmentPlan to reset TreatmentPlanId after new tx plan is added

        //#region handling for a new treatment plan

        // add services to list to return from caller
        $scope.$on('addServicesToNewTreatmentPlan', function (event, services) {
            angular.forEach(services, function (service) {
                ctrl.addedNewServices.push(service);
            });
        });
        */
  describe(' on addServicesToNewTreatmentPlan broadcast event ->', function () {
    beforeEach(function () {
      ctrl.addedNewServices = [];
    });

    it('should push services to ctrl.addedNewServices', function () {
      var services = [{}, {}];
      ctrl.addedNewServices = [];
      scope.$apply();
      expect(ctrl.addedNewServices.length).toBe(0);
      scope.$emit('addServicesToNewTreatmentPlan', services);
      scope.$apply();
      expect(ctrl.addedNewServices.length).toBe(2);
    });
  });

  describe('showProposedFlyout method ->', function () {
    beforeEach(function () {
      scope.patient = { PatientId: '123' };
      spyOn(ctrl, 'syncServicesOnEncounter');
    });

    it('should call ctrl.syncServicesOnEncounter', function () {
      scope.showProposedFlyout();
      expect(ctrl.syncServicesOnEncounter).toHaveBeenCalled();
    });
  });

  describe('showTxPlansFlyout method ->', function () {
    beforeEach(function () {
      scope.patient = { PatientId: '123' };
      spyOn(ctrl, 'syncServicesOnEncounter');
    });

    it('should call ctrl.syncServicesOnEncounter', function () {
      scope.showTxPlansFlyout();
      expect(ctrl.syncServicesOnEncounter).toHaveBeenCalled();
    });
  });

  describe('showPreventiveFlyout method ->', function () {
    beforeEach(function () {
      scope.patient = { PatientId: '123' };
      scope.dataLoadingPreventive = { loading: false };
      scope.preventiveCareServices = null;
      scope.hasPreventiveCareViewAccess = true;
    });

    it('should load preventiveCareServices if not already loaded', function () {
      scope.showPreventiveFlyout();
      expect(
        patientPreventiveCareFactory.PreventiveCareServices
      ).toHaveBeenCalled();
    });

    it('should broadcast closeFlyouts and openPreventiveCareFlyout after loading preventiveCareServices', function () {
      scope.preventiveCareServices = [{}, {}];
      var listener = jasmine.createSpy();
      scope.$on('closeFlyouts', listener);
      scope.showPreventiveFlyout();
      expect(listener).toHaveBeenCalled();
    });
  });

  describe('scope.nextSwftPkServCode method ->', function () {
    beforeEach(function () {
      ctrl.serviceCodeIndex = 0;
      ctrl.servicesToAdd = [
        { Code: '1234', ServiceCodeId: '1234' },
        { Code: '12345', ServiceCodeId: '12345' },
        { Code: '123456', ServiceCodeId: '12346' },
      ];
      scope.toothCtrls = {
        close: jasmine.createSpy(),
        content: jasmine.createSpy(),
        open: jasmine.createSpy(),
        setOptions: jasmine.createSpy(),
      };
      spyOn(ctrl, 'openToothCtrls');
    });

    it('should set call ctrl.openToothCtrls if all services have not been processed ', function () {
      localize.getLocalizedString = jasmine
        .createSpy()
        .and.returnValue(' (2 of 3)');
      ctrl.serviceCodeIndex = 0;
      var title = '12345 (2 of 3)';
      scope.nextSwftPkServCode();
      expect(ctrl.openToothCtrls).toHaveBeenCalledWith(
        'Service',
        title,
        true,
        false,
        false
      );
      expect(ctrl.lastIndex).toBe(false);
    });

    it('should set ctrl.lastIndex to true if this is the last service to be processed in list', function () {
      ctrl.serviceCodeIndex = 1;
      scope.nextSwftPkServCode();
      expect(ctrl.lastIndex).toBe(true);
    });

    it('should set call scope.toothCtrls.close if all services have been processed  ', function () {
      ctrl.serviceCodeIndex = 2;
      scope.nextSwftPkServCode();
      expect(scope.toothCtrls.close).toHaveBeenCalled();
    });
  });

  describe('ctrl.toothCtrlsClosed method ->', function () {
    beforeEach(function () {
      ctrl.addedNewServices = [
        { Code: '1234', ServiceCodeId: '1234' },
        { Code: '12345', ServiceCodeId: '12345' },
        { Code: '123456', ServiceCodeId: '12346' },
      ];
      ctrl.servicesToAdd = [
        { Code: '1234', ServiceCodeId: '1234' },
        { Code: '12345', ServiceCodeId: '12345' },
        { Code: '123456', ServiceCodeId: '12346' },
      ];
    });

    it('should not call addServicesCallback if ctrl.processingComplete is false ', function () {
      ctrl.addedNewServices = [{ Code: '123456', ServiceCodeId: '12346' }];
      ctrl.lastIndex = false;
      ctrl.processingComplete = false;
      ctrl.toothCtrlsClosed();
      expect(mockAddServicesCallback).not.toHaveBeenCalled();
    });

    it('should call addServicesCallback if ctrl.processingComplete is true', function () {
      var addedNewServices = angular.copy(ctrl.addedNewServices);
      ctrl.processingComplete = true;
      ctrl.lastIndex = true;
      var stageNumber = 1;
      ctrl.toothCtrlsClosed();
      expect(mockAddServicesCallback).toHaveBeenCalledWith(
        addedNewServices,
        stageNumber,
        true
      );
    });

    it('should set ctrl.processingIsComplete based on lastIndex ', function () {
      ctrl.processingComplete = false;
      ctrl.lastIndex = true;
      ctrl.toothCtrlsClosed();
      expect(ctrl.processingComplete).toEqual(true);
    });
  });

  describe('scope.$on(close-tooth-window) ->', function () {
    beforeEach(function () {
      scope.toothCtrls = { close: jasmine.createSpy() };
    });

    it('should set ctrl.processingComplete to true if cancelled equals true and ctrl.lastIndex is true', function () {
      ctrl.processingComplete = false;
      ctrl.lastIndex = true;
      scope.$emit('close-tooth-window', true);
      expect(ctrl.processingComplete).toEqual(true);
    });

    it('should set ctrl.processingComplete to false if cancelled equals true and ctrl.lastIndex is false', function () {
      ctrl.processingComplete = false;
      ctrl.lastIndex = false;
      scope.$emit('close-tooth-window', true);
      expect(ctrl.processingComplete).toEqual(false);
    });

    it('should set ctrl.processingComplete to false if cancelled equals false and ctrl.lastIndex is true', function () {
      ctrl.processingComplete = false;
      ctrl.lastIndex = false;
      scope.$emit('close-tooth-window', true);
      expect(ctrl.processingComplete).toEqual(false);
    });
  });

  describe('scope.$on(addServicesToNewTreatmentPlan) ->', function () {
    var services = [];
    beforeEach(function () {
      services = [
        { Code: '1234', ServiceCodeId: '1234' },
        { Code: '12345', ServiceCodeId: '12345' },
        { Code: '123456', ServiceCodeId: '12346' },
      ];
      ctrl.addedNewServices = [];
    });

    it('should do nothing if services list is empty', function () {
      scope.$emit('addServicesToNewTreatmentPlan', []);
      expect(ctrl.addedNewServices).toEqual([]);
    });

    it('should set ctrl.addedNewServices to passed services', function () {
      scope.$emit('addServicesToNewTreatmentPlan', services);
      expect(ctrl.addedNewServices).toEqual(services);
    });

    it('should set ctrl.processingComplete to ctrl.lastIndex', function () {
      ctrl.lastIndex = false;
      scope.$emit('addServicesToNewTreatmentPlan', services);
      expect(ctrl.processingComplete).toEqual(ctrl.lastIndex);
    });
  });

  describe('initializeToothControls method ->', function () {
    var serviceTransactions = [];
    beforeEach(function () {
      serviceTransactions = [
        { Code: '1234', ServiceCodeId: '1234' },
        { Code: '12345', ServiceCodeId: '12345' },
        { Code: '123456', ServiceCodeId: '12346' },
      ];
      spyOn(ctrl, 'openToothCtrls');
    });

    it('should set ctrl.lastIndex to true if list length is 1', function () {
      serviceTransactions = [{}];
      ctrl.initializeToothControls(serviceTransactions);
      expect(ctrl.lastIndex).toEqual(true);
    });

    it('should set ctrl.lastIndex to false if list length is more than 1', function () {
      ctrl.initializeToothControls(serviceTransactions);
      expect(ctrl.lastIndex).toEqual(false);
    });

    it('should call patientOdontogramFactory.setselectedChartButton', function () {
      ctrl.initializeToothControls(serviceTransactions);
      expect(
        patientOdontogramFactory.setselectedChartButton
      ).toHaveBeenCalledWith(serviceTransactions[0].ServiceCodeId);
    });

    it('should call ctrl.openToothCtrsl', function () {
      ctrl.initializeToothControls(serviceTransactions);
      expect(ctrl.openToothCtrls).toHaveBeenCalledWith(
        'Service',
        serviceTransactions[0].ServiceCodeId,
        true,
        true,
        false
      );
    });
  });

  describe('scope.addProposedServices method ->', function () {
    var services;
    beforeEach(function () {
      scope.patient = { PatientId: '123' };
      spyOn(ctrl, 'syncServicesOnEncounter');
      services = [
        { ServiceTransactionId: '1223' },
        { ServiceTransactionId: '1224' },
      ];
      ctrl.addedServiceTransactions = [{}];
      scope.proposedServicesOnPlan = ['1221', '1222'];
    });

    it('should add service.ServiceTransactionId to scope.proposedServicesOnPlan', function () {
      scope.addProposedServices(services);
      expect(scope.proposedServicesOnPlan).toEqual([
        '1221',
        '1222',
        '1223',
        '1224',
      ]);
    });

    it('should call ctrl.syncServicesOnEncounter', function () {
      scope.addProposedServices(services);
      expect(ctrl.syncServicesOnEncounter).toHaveBeenCalled();
    });
  });

  describe('scope.addTxPlanServices method ->', function () {
    var services;
    beforeEach(function () {
      scope.patient = { PatientId: '123' };
      spyOn(ctrl, 'syncServicesOnEncounter');
      services = [
        { ServiceTransactionId: '1223' },
        { ServiceTransactionId: '1224' },
      ];
      ctrl.addedServiceTransactions = [{}];
      scope.proposedServicesOnPlan = ['1221', '1222'];
    });

    it('should add service.ServiceTransactionId to scope.proposedServicesOnPlan', function () {
      scope.addTxPlanServices(services);
      expect(scope.proposedServicesOnPlan).toEqual([
        '1221',
        '1222',
        '1223',
        '1224',
      ]);
    });

    it('should call ctrl.syncServicesOnEncounter', function () {
      scope.addTxPlanServices(services);
      expect(ctrl.syncServicesOnEncounter).toHaveBeenCalled();
    });
  });

  describe('scope.addTxPlanServicesWithEstIns method ->', function () {
    var services;
    beforeEach(function () {
      scope.patient = { PatientId: '123' };
      spyOn(ctrl, 'syncServicesOnEncounter');
      services = {
        TreatmentPlanServices: [
          { ServiceTransaction: { ServiceTransactionId: '1223' } },
          { ServiceTransaction: { ServiceTransactionId: '1224' } },
        ],
      };
      ctrl.addedServiceTransactions = [{}];
      scope.proposedServicesOnPlan = ['1221', '1222'];
    });

    it('should add service.ServiceTransactionId to scope.proposedServicesOnPlan', function () {
      scope.addTxPlanServicesWithEstIns(services);
      expect(scope.proposedServicesOnPlan).toEqual([
        '1221',
        '1222',
        '1223',
        '1224',
      ]);
    });

    it('should call ctrl.syncServicesOnEncounter', function () {
      scope.addTxPlanServicesWithEstIns(services);
      expect(ctrl.syncServicesOnEncounter).toHaveBeenCalled();
    });
  });

  describe('ctrl.initializeProposedServicesOnPlan method ->', function () {
    beforeEach(function () {
      scope.patient = { PatientId: '123' };
      ctrl.servicesOnEncounter = [
        { ServiceTransactionId: '1223' },
        { ServiceTransactionId: '1224' },
      ];
      scope.proposedServicesOnPlan = [];
    });

    it('should build a list of serviceTransactionIds (scope.proposedServicesOnPlan) based on servicesOnEncounter', function () {
      scope.isEncounterServices = true;
      ctrl.initializeProposedServicesOnPlan();
      expect(scope.proposedServicesOnPlan).toEqual(['1223', '1224']);
    });
  });

  describe('ctrl.syncServicesOnEncounter method ->', function () {
    beforeEach(function () {
      scope.patient = { PatientId: '123' };
      ctrl.servicesOnEncounter = [
        { ServiceTransactionId: '1223', InsuranceOrder: 1, Fee: 300 },
        { ServiceTransactionId: '1224', InsuranceOrder: 2, Fee: 200 },
      ];
      scope.proposedServicesOnPlan = [];
    });

    it('should update scope.servicesAdded to contain ServiceTransactionId and InsuranceOrder from each ctrl.servicesOnEncounter if isEncounterServices is true', function () {
      scope.isEncounterServices = true;
      ctrl.syncServicesOnEncounter();
      expect(scope.servicesAdded).toEqual([
        { ServiceTransactionId: '1223', InsuranceOrder: 1 },
        { ServiceTransactionId: '1224', InsuranceOrder: 2 },
      ]);
    });
  });
});
