import { of } from 'rsjs';

describe('ProposedSelectorController -> ', function () {
  var scope, ctrl, rootScope, timeout, listHelper, serviceCodesService;
  var toastrFactory,
    usersFactory,
    referenceDataService,
    patientValidationFactory;
  var patientAppointmentsFactory,
    treatmentPlansFactory,
    scheduleAppointmentHttpService,
    scheduleDisplayPlannedServicesService;
  var practicesApiService;
  var existingTreatmentPlans = [{}, {}, {}];
  var serviceTypesData;
  var featureFlagService;

  var mockModalFactory = {
    ConfirmModal: jasmine.createSpy('modalFactory.ConfirmModal'),
  };

  beforeEach(module('Soar.Common'));
  beforeEach(module('common.factories'));
  beforeEach(
    module('Soar.Patient', function ($provide) {
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
      patientAppointmentsFactory = {
        AppointmentDataWithoutDetails: jasmine.createSpy().and.returnValue({
          then: jasmine.createSpy().and.returnValue({ Value: 1 }),
        }),
      };
      $provide.value('PatientAppointmentsFactory', patientAppointmentsFactory);

      treatmentPlansFactory = {
        ExistingTreatmentPlans: jasmine
          .createSpy()
          .and.returnValue(existingTreatmentPlans),
      };
      $provide.value('TreatmentPlansFactory', treatmentPlansFactory);

      scheduleAppointmentHttpService = {
        getProposedServicesWithAppointmentStartTimeWithPromise:
          jasmine.createSpy(),
      };

      $provide.value(
        'ScheduleAppointmentHttpService',
        scheduleAppointmentHttpService
      );

      featureFlagService = {
        getOnce$: jasmine.createSpy().and.returnValue(of(false)),
      }
      $provide.value('featureFlagService', featureFlagService);

      serviceCodesService = {
        LoadedServiceCodes: jasmine.createSpy().and.returnValue([
          { ServiceTransactionId: 12344, Description: 'Description1' },
          { ServiceTransactionId: 12345, Description: 'Description2' },
          { ServiceTransactionId: 12346, Description: 'Description3' },
        ]),
        CheckForAffectedAreaChanges: jasmine.createSpy(),
        ServiceCodesByTimestamp: jasmine.createSpy().and.returnValue({
          then: jasmine.createSpy().and.returnValue({}),
        }),
      };
      $provide.value('ServiceCodesService', serviceCodesService);

      scheduleDisplayPlannedServicesService = {
        getSurfacesInSummaryFormat: jasmine.createSpy().and.returnValue(''),
      };
      $provide.value(
        'ScheduleDisplayPlannedServicesService',
        scheduleDisplayPlannedServicesService
      );
      practicesApiService = {
        getLocationsWithDetails: jasmine.createSpy().and.returnValue({
          then: success =>
            success({
              data: [
                { NameAbbreviation: 'loc1', LocationId: 1 },
                { NameAbbreviation: 'loc2', LocationId: 2 },
              ],
            }),
        }),
      };
      $provide.value('PracticesApiService', practicesApiService);

      $provide.value('ModalFactory', mockModalFactory);
    })
  );

  // Create spies for services
  beforeEach(
    module('Soar.Patient', function ($provide) {
      //mock for listHelper service
      listHelper = {
        findItemByFieldValue: jasmine
          .createSpy('listHelper.findItemByFieldValue')
          .and.returnValue(1),
      };
      usersFactory = {
        Users: jasmine.createSpy().and.returnValue({ then: function () {} }),
      };
      $provide.value('UsersFactory', usersFactory);

      serviceTypesData = [
        {
          ServiceTypeId: 'e928ed50-1c73-4836-8a07-11d4ac39e947',
          IsSystemType: true,
          Description: 'Adjunctive General Services',
          IsAssociatedWithServiceCode: false,
        },
        {
          ServiceTypeId: 'cc08eb08-425d-43af-9d9d-ce976a208489',
          IsSystemType: true,
          Description: 'Diagnostic',
          IsAssociatedWithServiceCode: true,
        },
        {
          ServiceTypeId: '46206c7f-e4df-4158-86d9-c442c1fa63b4',
          IsSystemType: true,
          Description: 'Endodontics',
          IsAssociatedWithServiceCode: false,
        },
        {
          ServiceTypeId: '3493fe28-4e23-4ef7-8ca2-9a5edcce883a',
          IsSystemType: true,
          Description: 'Implant Services',
          IsAssociatedWithServiceCode: false,
        },
      ];

      referenceDataService = {
        get: jasmine.createSpy().and.returnValue({ Value: serviceTypesData }),
        entityNames: {
          serviceTypes: 'serviceTypes',
        },
        registerForLocationSpecificDataChanged: jasmine.createSpy(),
        unregisterForLocationSpecificDataChanged: jasmine.createSpy(),
      };

      //mock for toaster functionality
      toastrFactory = {
        success: jasmine.createSpy(),
        error: jasmine.createSpy(),
      };
    })
  );
  // Create controller and scope
  beforeEach(inject(function ($rootScope, $controller, $injector) {
    scope = $rootScope.$new();
    rootScope = $rootScope;
    scope.onAdd = function () {};

    ctrl = $controller('ProposedSelectorController', {
      $scope: scope,
      $rootScope: rootScope,
      referenceDataService: referenceDataService,
      ListHelper: listHelper,
      toastrFactory: toastrFactory,
    });
    timeout = $injector.get('$timeout');
    spyOn(timeout, 'cancel');
  }));

  it('should initialize controller', function () {
    expect(ctrl).not.toBeNull();
  });

  describe('initializeServiceTypes function -> ', function () {
    it('should call serviceTypesGetSuccess with Value.list ', function () {
      scope.checkValue = null;
      scope.serviceTypesGetSuccess = function (value) {
        scope.checkValue = value.Value;
      };
      ctrl.initializeServiceTypes();
      expect(scope.checkValue == serviceTypesData);
    });
  });

  describe('addServiceCodeInfo function -> ', function () {
    beforeEach(function () {
      ctrl.serviceCodes = [
        {
          ServiceCodeId: 1,
          DisplayAs: 'code1',
          Description: 'desc1',
          AffectedAreaId: 1,
          Code: 'code1',
          CdtCodeName: 'code name1',
        },
        {
          ServiceCodeId: 2,
          DisplayAs: 'code2',
          Description: 'desc2',
          AffectedAreaId: 2,
          Code: 'code2',
          CdtCodeName: 'code name2',
        },
        {
          ServiceCodeId: 3,
          DisplayAs: 'code3',
          Description: 'desc3',
          AffectedAreaId: 2,
          Code: 'code3',
          CdtCodeName: 'code name3',
        },
      ];
      serviceCodesService.LoadedServiceCodes = ctrl.serviceCodes;
    });

    it('should add service code informaton to the proposed service if finds match', function () {
      var ps = ctrl.serviceCodes[0];
      ctrl.addServiceCodeInfo(ps);
      expect(ps.Desc).toEqual(ctrl.serviceCodes[0].Description);
    });

    it('should add defaults service code info to the proposed service if no match', function () {
      var ps = { ServiceCodeId: 4, Description: 'NoMatch' };
      ctrl.addServiceCodeInfo(ps);
      expect(ps.ServiceCodeString).toEqual('NoMat');
      expect(ps.showDisc).toEqual('');
    });
  });

  describe('getAllProposedServicesSuccess function -> ', function () {
    var res;
    beforeEach(function () {
      res = [
        { ServiceCodeId: '1234', IsActive: true },
        { ServiceCodeId: '1235', IsActive: true },
      ];
      scope.patient = { PatientId: 1 };
    });

    it('should call ctrl.servicesToUpdate if some of the proposed services have appointment ids', function () {
      angular.forEach(scope.proposedServices, function (ps) {
        expect(ctrl.servicesToUpdate).toHaveBeenCalledWith(ps);
      });
    });

    it('should call addServiceCodeInfo for each proposed service', function () {
      spyOn(scope, 'compareServLocations').and.callFake(function () {});
      spyOn(ctrl, 'addServiceCodeInfo').and.callFake(function () {});
      spyOn(ctrl, 'markServicesStatus');
      ctrl.serviceCodes = [
        { ServiceCodeId: '1234', IsActive: true, LocationId: '12' },
        { ServiceCodeId: '1235', IsActive: true, LocationId: '12' },
      ];

      scope.getAllProposedServicesSuccess(res);
      angular.forEach(scope.proposedServices, function (ps) {
        expect(ctrl.addServiceCodeInfo).toHaveBeenCalledWith(ps);
      });
    });
  });

  describe('on openProposedSelectorFlyout ->', function () {
    var sender = 'txplan';

    beforeEach(function () {
      spyOn(ctrl, 'showFilters');
      spyOn(ctrl, 'loadData');
      sender = 'txplan';
    });

    it('should call loadData', function () {
      scope.firstLoad = true;
      scope.$emit('openProposedSelectorFlyout', sender);
      expect(ctrl.loadData).toHaveBeenCalledWith(sender);
    });
  });

  describe('quickAddService function -> ', function () {
    var proposedServiceVm;
    beforeEach(function () {
      ctrl.proposedServices = [
        { ServiceTransactionId: 12344, Description: 'Description1' },
        { ServiceTransactionId: 12345, Description: 'Description2' },
        { ServiceTransactionId: 12346, Description: 'Description3' },
      ];
      proposedServiceVm = {
        ServiceTransactionId: 12344,
        Description: 'Description1',
        ServiceCodeString: 'dd',
      };
      spyOn(scope, 'onSelectedCodes').and.callFake(function () {});
      spyOn(ctrl, 'openServiceCodesNeedUpdatedModal').and.callFake(
        function () {}
      );
    });

    it('should call serviceCodesService.CheckForAffectedAreaChanges with proposedService', function () {
      scope.quickAddService(proposedServiceVm);
      expect(
        serviceCodesService.CheckForAffectedAreaChanges
      ).toHaveBeenCalledWith(
        [
          {
            ServiceTransactionId: 12344,
            Description: 'Description1',
            Code: 'dd',
          },
        ],
        ctrl.serviceCodes,
        false
      );
    });
  });

  describe('onSelectedCodes function ->', function () {
    beforeEach(function () {
      spyOn(ctrl, 'openServiceCodesNeedUpdatedModal').and.callFake(
        function () {}
      );
      spyOn(ctrl, 'updateCheckedRowsProposedServices').and.callFake(
        function () {}
      );
      spyOn(ctrl, 'addServicesToEncounter').and.callFake(function () {});
      ctrl.selectedServiceCodes = [
        { ServiceTransactionId: '1' },
        { ServiceTransactionId: '2' },
      ];
      ctrl.proposedServicesResponse = [
        { ServiceTransactionId: '1', ServiceCodeString: 'aa' },
        { ServiceTransactionId: '2', ServiceCodeString: 'ab' },
      ];
      scope.serviceFilter = 'encounter-refactored';
    });

    it('should call addServicesToEncounter function when called from encounter page and no service exists on future appointment(s)', function () {
      scope.onSelectedCodes();
      expect(ctrl.addServicesToEncounter).toHaveBeenCalled();
    });

    it('should call promptServiceOnFutureAppointment function when called from encounter page and a service exists on future appointment(s)', function () {
      spyOn(ctrl, 'promptServiceOnFutureAppointment').and.callFake(
        function () {}
      );
      ctrl.proposedServicesResponse[0].AppointmentId = '1';
      ctrl.proposedServicesResponse[0].StartTime = new Date(
        Date.now() + 1000000
      ).toISOString();

      scope.onSelectedCodes();
      expect(ctrl.promptServiceOnFutureAppointment).toHaveBeenCalledWith([
        ctrl.selectedServiceCodes[0].ServiceTransactionId,
      ]);
      expect(ctrl.addServicesToEncounter).not.toHaveBeenCalled();
    });
  });

  describe('addServicesToEncounter function ->', function () {
    beforeEach(function () {
      ctrl.selectedServiceCodes = [
        { ServiceTransactionId: '1' },
        { ServiceTransactionId: '2' },
      ];
      scope.addSelectedServices = jasmine
        .createSpy('addSelectedServices')
        .and.callFake(function () {});
    });

    it('should call addSelectedServices with services being added to encounter', function () {
      var services = ctrl.selectedServiceCodes;

      ctrl.addServicesToEncounter();
      expect(scope.addSelectedServices).toHaveBeenCalledWith(services, false);
    });
  });

  describe('promptServiceOnFutureAppointment function ->', function () {
    beforeEach(function () {
      ctrl.selectedServiceCodes = [
        { ServiceTransactionId: '1', AppointmentId: '1' },
        { ServiceTransactionId: '2' },
      ];
    });

    it('should set future appointment service AppointmentId to null and call addServicesToEncoutner when user selects confirm', function () {
      mockModalFactory.ConfirmModal = jasmine
        .createSpy('modalFactory.ConfirmModal')
        .and.returnValue({
          then: function (callback) {
            callback();
          },
        });
      spyOn(ctrl, 'addServicesToEncounter').and.callFake(function () {});

      ctrl.promptServiceOnFutureAppointment([
        ctrl.selectedServiceCodes[0].ServiceTransactionId,
      ]);
      expect(ctrl.selectedServiceCodes[0].AppointmentId).toBeNull();
      expect(ctrl.addServicesToEncounter).toHaveBeenCalled();
    });

    it('should call addServicesToEncounter with no selected services when user selects cancel', function () {
      mockModalFactory.ConfirmModal = jasmine
        .createSpy('modalFactory.ConfirmModal')
        .and.returnValue({
          then: function (callback, declineCallback) {
            declineCallback();
          },
        });
      spyOn(ctrl, 'addServicesToEncounter').and.callFake(function () {});

      ctrl.promptServiceOnFutureAppointment([
        ctrl.selectedServiceCodes[0].ServiceTransactionId,
      ]);
      expect(ctrl.selectedServiceCodes.length).toBe(0);
      expect(ctrl.addServicesToEncounter).toHaveBeenCalled();
    });
  });

  describe('ctrl.setHasBeenAddedToOtherTreatmentPlans method -> ', function () {
    beforeEach(function () {
      // mock services on current treatment plan for this patient
      scope.servicesOnPlan = [
        { ServiceTransaction: { ServiceTransactionId: '1234' } },
        { ServiceTransaction: { ServiceTransactionId: '2234' } },
      ];
      // mock services on all treatment plans for this patient
      ctrl.existingTreatmentPlans = [
        {
          TreatmentPlanHeader: { TreatmentPlanId: 1 },
          TreatmentPlanServices: [
            { ServiceTransaction: { ServiceTransactionId: '1234' } },
            { ServiceTransaction: { ServiceTransactionId: '1235' } },
          ],
        },
        {
          TreatmentPlanHeader: { TreatmentPlanId: 2 },
          TreatmentPlanServices: [
            { ServiceTransaction: { ServiceTransactionId: '1236' } },
            { ServiceTransaction: { ServiceTransactionId: '1237' } },
            { ServiceTransaction: { ServiceTransactionId: '1234' } },
          ],
        },
      ];
      // mock all proposed services for this patient
      ctrl.serviceVms = [
        { ServiceTransaction: { ServiceTransactionId: '1234' } },
        { ServiceTransaction: { ServiceTransactionId: '1236' } },
        { ServiceTransaction: { ServiceTransactionId: '1235' } },
        { ServiceTransaction: { ServiceTransactionId: '1236' } },
        { ServiceTransaction: { ServiceTransactionId: '1237' } },
        { ServiceTransaction: { ServiceTransactionId: '1238' } },
        { ServiceTransaction: { ServiceTransactionId: '2234' } },
        { ServiceTransaction: { ServiceTransactionId: '2239' } },
        { ServiceTransaction: { ServiceTransactionId: '2241' } },
        { ServiceTransaction: { ServiceTransactionId: '2240' } },
      ];
    });

    it('should set ps.$$hasBeenAddedToATxPlan on each proposed service if ctrl.existingTreatmentPlans && ctrl.serviceVms and proposed service is on an existing plan', function () {
      // these ids are on current plan 1234, 1235
      ctrl.setHasBeenAddedToOtherTreatmentPlans();
      _.forEach(ctrl.serviceVms, function (ps) {
        // these ids are on existing plans in mocks 1234,1235,1236,1237
        if (
          ps.ServiceTransactionId === 1234 ||
          ps.ServiceTransactionId === 1235 ||
          ps.ServiceTransactionId === 1236 ||
          ps.ServiceTransactionId === 1237
        ) {
          expect(ps.$$hasBeenAddedToATxPlan).toBe(true);
        } else {
          expect(ps.$$hasBeenAddedToATxPlan).toBe(false);
        }
      });
    });

    it('should set ps.$$onPlan on each proposed service  if ctrl.existingTreatmentPlans && ctrl.serviceVms and proposed service is in scope.servicesOnPlan', function () {
      // these ids are on current plan 1234, 1235
      ctrl.setHasBeenAddedToOtherTreatmentPlans();
      _.forEach(ctrl.serviceVms, function (ps) {
        if (
          ps.ServiceTransactionId === 1234 ||
          ps.ServiceTransactionId === 1235
        ) {
          expect(ps.$$onPlan).toBe(true);
        } else {
          expect(ps.$$onPlan).toBe(false);
        }
      });
    });
  });

  describe('methodtreatmentPlansFactory.ExistingTreatmentPlans watch -> ', function () {
    beforeEach(function () {
      treatmentPlansFactory.ExistingTreatmentPlans = {
        TreatmentPlanHeader: { TreatmentPlanId: 1 },
      };
      scope.$apply();
      spyOn(ctrl, 'setHasBeenAddedToOtherTreatmentPlans');
    });

    it('should set ctrl.existingTreatmentPlans and call ctrl.setHasBeenAddedToOtherTreatmentPlans if serviceFilter is txplan', function () {
      treatmentPlansFactory.ExistingTreatmentPlans = {
        TreatmentPlanHeader: { TreatmentPlanId: 2 },
      };
      scope.serviceFilter = 'txplan';
      scope.$apply();
      expect(ctrl.setHasBeenAddedToOtherTreatmentPlans).toHaveBeenCalled();
    });

    it('should not set ctrl.existingTreatmentPlans and not call ctrl.setHasBeenAddedToOtherTreatmentPlans if serviceFilter is not txplan', function () {
      treatmentPlansFactory.ExistingTreatmentPlans = {
        TreatmentPlanHeader: { TreatmentPlanId: 2 },
      };
      scope.serviceFilter = 'appointment';
      scope.$apply();
      expect(ctrl.setHasBeenAddedToOtherTreatmentPlans).not.toHaveBeenCalled();
    });
  });

  describe('ctrl.markServicesStatus method -> ', function () {
    var services = [];
    beforeEach(function () {
      services = [
        { Description: 'd2140', LocationId: 2, ServiceTransactionId: '2234' },
        { Description: 'd2140', LocationId: 3, ServiceTransactionId: '2233' },
      ];
      ctrl.currentLocation = { id: 2 };
      // used by appointment and encounter
      scope.chosenLocation = { LocationId: 2 };
    });

    it('should not mark service disabled if the location of the service does not match services on plan', function () {
      scope.servicesOnPlan = ['1234', '2234'];
      ctrl.markServicesStatus(services);
      expect(services[1].LocationId).toEqual(3);
      expect(services[1].$$disableAddService).toEqual(false);
    });

    it('should set only allow services to be added that match the current location if this is first service on plan', function () {
      scope.servicesOnPlan = [];
      ctrl.markServicesStatus(services);
      expect(services[0].$$disableAddService).toEqual(false);
      expect(services[1].$$disableAddService).toEqual(false);
    });

    it('should mark service disabled if it is already on an appointment if adding to an appointment', function () {
      scope.serviceFilter = 'appointment';
      scope.servicesOnPlan = ['1234', '2234'];
      services = [
        {
          Description: 'd2140',
          LocationId: 2,
          ServiceTransactionId: '2235',
          AppointmentId: 2,
        },
      ];
      ctrl.markServicesStatus(services);
      expect(services[0].$$disableAddService).toEqual(true);
    });

    it('should mark service disabled if it is already on an appointment if adding to an encounter', function () {
      scope.serviceFilter = 'encounter';
      scope.servicesOnPlan = ['1234', '2234'];
      services = [
        {
          Description: 'd2140',
          LocationId: 2,
          ServiceTransactionId: '2235',
          AppointmentId: 2,
        },
      ];
      ctrl.markServicesStatus(services);
      expect(services[0].$$disableAddService).toEqual(true);
    });

    it('should not mark service disabled if it is already on an appointment if adding to an treatment plan', function () {
      scope.serviceFilter = 'txplan';
      scope.servicesOnPlan = ['1234', '2234'];
      services = [
        {
          Description: 'd2140',
          LocationId: 2,
          ServiceTransactionId: '2235',
          AppointmentId: 2,
        },
      ];
      ctrl.markServicesStatus(services);
      expect(services[0].$$disableAddService).toEqual(false);
    });

    it('should mark service disabled it is already on this plan', function () {
      scope.servicesOnPlan = ['1234', '2234'];
      ctrl.markServicesStatus(services);
      expect(services[0].$$disableAddService).toEqual(true);
    });

    it('should mark service disabled if the location of the service does not match current location and serviceFilter = encounter-refactored', function () {
      services = [
        { Description: 'd2140', LocationId: 2, ServiceTransactionId: '1234' },
        { Description: 'd2140', LocationId: 2, ServiceTransactionId: '2234' },
        { Description: 'd2140', LocationId: 3, ServiceTransactionId: '2233' },
      ];
      ctrl.currentLocation = { id: 2 };
      scope.serviceFilter = 'encounter-refactored';

      scope.servicesOnPlan = ['1234'];
      ctrl.markServicesStatus(services);
      // enabled
      expect(services[1].LocationId).toEqual(2);
      expect(services[1].$$disableAddService).toEqual(false);
      // disabled because location is different than encounter
      expect(services[2].LocationId).toEqual(3);
      expect(services[2].$$disableAddService).toEqual(true);
    });

    it('should mark service disabled if the serviceFilter = encounter-refactored and service is already on encounter', function () {
      services = [
        { Description: 'd2140', LocationId: 2, ServiceTransactionId: '1234' },
        { Description: 'd2140', LocationId: 2, ServiceTransactionId: '2234' },
        { Description: 'd2140', LocationId: 3, ServiceTransactionId: '2233' },
      ];
      ctrl.currentLocation = { id: 2 };
      scope.serviceFilter = 'encounter-refactored';

      scope.servicesOnPlan = ['1234'];
      ctrl.markServicesStatus(services);
      // enabled because not on plan and location matches
      expect(services[1].LocationId).toEqual(2);
      expect(services[1].$$disableAddService).toEqual(false);
      // disabled because it is already on the plan
      expect(services[0].LocationId).toEqual(2);
      expect(services[0].$$disableAddService).toEqual(true);
    });
  });

  describe('ctrl.onLocationChange method -> ', function () {
    beforeEach(function () {
      ctrl.serviceVms = [
        { Description: 'd2140', LocationId: 2, ServiceTransactionId: '2234' },
        { Description: 'd2140', LocationId: 3, ServiceTransactionId: '2233' },
      ];
      ctrl.currentLocation = { id: 2 };
      //ctrl.patientInfo && ctrl.patientInfo.PatientId && ctrl.patientInfo.PatientId === $scope.patient.PatientId
      scope.patient = { PatientId: 1 };
      spyOn(ctrl, 'markServicesStatus');
      spyOn(scope, 'checkPatientLocation');
    });

    it('should call ctrl.markServicesStatus with ctrl.serviceVms', function () {
      ctrl.onLocationChange();
      expect(ctrl.markServicesStatus).toHaveBeenCalledWith(ctrl.serviceVms);
      expect(scope.checkPatientLocation).toHaveBeenCalled();
    });
  });

  describe('scope.changeSortingForGrid method ->', function () {
    beforeEach(function () {
      scope.orderBy = {
        field: 'Tooth',
        asc: true,
      };
    });
    it('should set tooth in ascending order when the page loads', function () {
      scope.changeSortingForGrid('Tooth');
      expect(scope.orderBy.asc).toBe(false);
    });
    it('should set providers in ascending order when providers is clicked', function () {
      scope.changeSortingForGrid('Name');
      expect(scope.orderBy.asc).toBe(false);
    });
    it('should set Fee in ascending order when Fee is clicked', function () {
      scope.changeSortingForGrid('Fee');
      expect(scope.orderBy.asc).toBe(false);
    });
    it('should set Cdtcode in ascending order when cdtcode is clicked', function () {
      scope.changeSortingForGrid('CdtCode');
      expect(scope.orderBy.asc).toBe(false);
    });
    it('should set Area in ascending order when Area is clicked', function () {
      scope.changeSortingForGrid('Area');
      expect(scope.orderBy.asc).toBe(false);
    });
    it('should set Description in ascending order when description is clicked', function () {
      scope.changeSortingForGrid('Desc');
      expect(scope.orderBy.asc).toBe(false);
    });
  });
  describe('ctrl.mapServiceTransactionToVm ->', function () {
    it('should set view model tooth to integer zero when ServiceTransaction.Tooth is an empty string', function () {
      var serviceTransaction = { Tooth: '', Fee: 200 };
      var vm = ctrl.mapServiceTransactionToVm(serviceTransaction);
      expect(vm.Tooth).toBe(0);
    });
    it('should set view model tooth to integer when ServiceTransaction.Tooth is a string that is a number', function () {
      var serviceTransaction = { Tooth: '1', Fee: 200 };
      var vm = ctrl.mapServiceTransactionToVm(serviceTransaction);
      expect(vm.Tooth).toBe(1);
    });
    it('should set view model tooth to the ServiceTransaction.Tooth string when ServiceTransaction.Tooth is a string that is not a number', function () {
      var serviceTransaction = { Tooth: 'A', Fee: 200 };
      var vm = ctrl.mapServiceTransactionToVm(serviceTransaction);
      expect(vm.Tooth).toBe('A');
    });
    it('should set view model tooth to null when ServiceTransaction.Tooth is null', function () {
      var serviceTransaction = { Tooth: null, Fee: 200 };
      var vm = ctrl.mapServiceTransactionToVm(serviceTransaction);
      expect(vm.Tooth).toBe(null);
    });
    it('should set view model tooth to undefined when ServiceTransaction.Tooth is undefined', function () {
      var serviceTransaction = { Tooth: undefined, Fee: 200 };
      var vm = ctrl.mapServiceTransactionToVm(serviceTransaction);
      expect(vm.Tooth).toBe(undefined);
    });
  });
});
