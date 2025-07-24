describe('patient-dashboard -> ', function () {
  var ctrl, scope, patientServices, toastrFactory, q;
  var usersFactory,
    treatmentPlansFactory,
    typeOrMaterialsService,
    serviceToAdd,
    serviceToAddMock,
    patientServicesFactory;

  // #region mocks
  // mock for ServiceTransaction passed to treatmentPlanAddToAppointment directive
  var serviceTransactionMock = {
    Description:
      'D9220: deep sedation/general anesthesia - first 30 minutes (D9220)',
    ServiceCodeId: 1,
    ObjectState: 'None',
    InsuranceOrder: null,
    AppointmentId: 2,
  };

  // mock for treatmentPlanService passed to treatmentPlanAddToAppointment directive
  var treatmentPlanServiceMock = {
    ServiceTransaction: {
      Description:
        'D9220: deep sedation/general anesthesia - first 30 minutes (D9220)',
      ServiceCodeId: 1,
      ObjectState: 'None',
      InsuranceOrder: null,
      AppointmentId: 3,
    },
  };

  var addToAppointmentModalCallbackMock = jasmine.createSpy();

  var servicesWithAppointmentsMock = [
    {
      AppointmentId: 'abcd12345',
      Description: 'Appointment on 9/10/2018',
      ServiceTransactionId: 'b8b5c2472790',
      StartTime: '2018-09-10T21:00:00',
      LastInsuranceOrder: 2,
    },
    {
      AppointmentId: 'abcd12345',
      Description: 'Appointment on 9/10/2018',
      ServiceTransactionId: '14fea8ca7dd8',
      StartTime: '2018-09-10T21:00:00',
      LastInsuranceOrder: 2,
    },
    {
      AppointmentId: 'abcd12345',
      Description: 'Appointment on 9/10/2018',
      ServiceTransactionId: 'e8aac999043a',
      StartTime: '2018-09-10T21:00:00',
      LastInsuranceOrder: 2,
    },
  ];

  var modalInstance = {
    close: jasmine.createSpy('modalInstance.close').and.returnValue({}),
    dismiss: jasmine.createSpy('modalInstance.dismiss'),
    result: {
      then: jasmine.createSpy('modalInstance.result.then'),
    },
  };

  var altTxPlanData = {};

  beforeEach(module('Soar.Common'));
  beforeEach(
    module('Soar.Patient', function ($provide) {
      serviceToAddMock = _.cloneDeep(treatmentPlanServiceMock);

      patientServicesFactory = {
        update: jasmine.createSpy().and.returnValue({
          then: jasmine.createSpy().and.returnValue({
            Value: [
              {
                ServiceTransactionId: '5678',
                InsuranceEstimates: [
                  {
                    EstimatedInsuranceId: '1234',
                    ServiceTransactionId: '5678',
                  },
                ],
              },
            ],
          }),
        }),
      };

      treatmentPlansFactory = {
        ExistingTreatmentPlans: jasmine.createSpy().and.returnValue({}),
        Delete: jasmine.createSpy(),
        SetActiveTreatmentPlan: jasmine.createSpy(),
        CollapseAll: jasmine.createSpy(),
        SetDataChanged: jasmine.createSpy(),
        BuildTreatmentPlanDto: function () {
          return altTxPlanData;
        },
        SetNewTreatmentPlan: jasmine.createSpy(),
        CalculateInsuranceEstimates: jasmine.createSpy(),
      };

      $provide.value('TreatmentPlansFactory', treatmentPlansFactory);

      var serviceButtonsService = {
        get: jasmine.createSpy().and.callFake(function () {
          var buttonServiceDeferred = q.defer();
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
          var typeOrMaterialDeferred = q.defer();
          typeOrMaterialDeferred.resolve(1);
          return {
            result: typeOrMaterialDeferred.promise,
            then: function () {},
          };
        }),
      };

      $provide.value('TypeOrMaterialsService', typeOrMaterialsService);

      var financialService = {
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
    })
  );

  beforeEach(inject(function ($rootScope, $controller, $q) {
    q = $q;

    //mock for usersFactory
    usersFactory = {
      Users: jasmine.createSpy('usersFactory.Users').and.callFake(function () {
        var deferred = $q.defer();
        deferred.resolve(1);
        return {
          result: deferred.promise,
          then: function () {},
        };
      }),
    };

    // patientBenefitPlansFactory mock
    treatmentPlansFactory = {
      ExistingTreatmentPlans: jasmine.createSpy().and.returnValue({}),
      Delete: jasmine.createSpy(),
      SetActiveTreatmentPlan: jasmine.createSpy(),
      CollapseAll: jasmine.createSpy(),
      SetDataChanged: jasmine.createSpy(),
      BuildTreatmentPlanDto: function () {
        return altTxPlanData;
      },
      SetNewTreatmentPlan: jasmine.createSpy(),
      CalculateInsuranceEstimates: jasmine
        .createSpy('treatmentPlansFactory.CalculateInsuranceEstimates')
        .and.callFake(function () {
          var deferred = $q.defer();
          deferred.resolve(1);
          return {
            result: deferred.promise,
            then: function () {},
          };
        }),
      HasPredetermination: jasmine
        .createSpy('treatmentPlansFactory.CalculateInsuranceEstimates')
        .and.callFake(function () {
          var deferred = $q.defer();
          deferred.resolve(1);
          return {
            result: deferred.promise,
            then: function () {},
          };
        }),
      AllowCreatePredetermination: jasmine
        .createSpy('treatmentPlansFactory.AllowCreatePredetermination')
        .and.callFake(function () {
          var deferred = $q.defer();
          deferred.resolve(1);
          return {
            result: deferred.promise,
            then: function () {},
          };
        }),
      CreatePredetermination: jasmine
        .createSpy('treatmentPlansFactory.CreatePredetermination')
        .and.callFake(function () {
          var deferred = $q.defer();
          deferred.resolve(1);
          return {
            result: deferred.promise,
            then: function () {},
          };
        }),
      DefaultProviderOnPredetermination: jasmine
        .createSpy('treatmentPlansFactory.DefaultProviderOnPredetermination')
        .and.callFake(function () {
          var deferred = $q.defer();
          deferred.resolve(1);
          return {
            result: deferred.promise,
            then: function () {},
          };
        }),
      ShouldPromptToRemoveServicesFromAppointment: jasmine
        .createSpy(
          'treatmentPlansFactory.ShouldPromptToRemoveServicesFromAppointment'
        )
        .and.callFake(function () {
          var deferred = $q.defer();
          deferred.resolve(1);
          return {
            result: deferred.promise,
            then: function () {},
          };
        }),
    };

    modalInstance = {
      close: jasmine.createSpy('modalInstance.close').and.returnValue({}),
      dismiss: jasmine.createSpy('modalInstance.dismiss'),
      result: {
        then: jasmine.createSpy('modalInstance.result.then'),
      },
    };

    var patSecurityService = {
      generateMessage: function () {},
      IsAuthorizedByAbbreviation: function () {},
    };

    scope = $rootScope.$new();
    scope.patientInfo = { PatientId: '12588u0' };
    ctrl = $controller('TreatmentPlanAddToAppointment', {
      $scope: scope,
      $uibModalInstance: modalInstance,
      TreatmentPlansFactory: treatmentPlansFactory,
      UsersFactory: usersFactory,
      patSecurityService: patSecurityService,
      addToAppointmentModalCallback: addToAppointmentModalCallbackMock,
      servicesWithAppointments: [],
      serviceToAdd: serviceToAddMock,
      treatmentPlanId: '',
      treatmentPlanServices: [],
      stageNumber: '',
      PatientServicesFactory: patientServicesFactory,
    });
    scope.activeTreatmentPlan = {
      TreatmentPlanServices: [{ ServiceTransaction: {} }],
    };
  }));

  it('controller should exist', function () {
    expect(ctrl).not.toBeNull();
  });

  describe('ctrl.getUniqueAppointments method', function () {
    var servicesWithAppointments = [];
    beforeEach(function () {
      scope.appointmentChoices = [];
      servicesWithAppointments = _.cloneDeep(servicesWithAppointmentsMock);
    });

    it('should filter servicesWithAppointments to a unique list of appointments', function () {
      var appointmentChoices = ctrl.getUniqueAppointments(
        servicesWithAppointments
      );
      expect(appointmentChoices[0].AppointmentId).toEqual('abcd12345');
      expect(appointmentChoices[0].StartTime).toEqual('2018-09-10T21:00:00');
      expect(appointmentChoices[0].Description).toEqual(
        'Appointment on 9/10/2018'
      );
      expect(appointmentChoices.length).toEqual(1);
    });

    it('should filter servicesWithAppointments to a unique list of appointments', function () {
      servicesWithAppointments[2].AppointmentId = 'abcd12346';
      servicesWithAppointments[2].StartTime = '2018-09-11T21:00:00';
      servicesWithAppointments[2].Description = 'Appointment on 9/11/2018';

      var appointmentChoices = ctrl.getUniqueAppointments(
        servicesWithAppointments
      );
      expect(appointmentChoices[0].AppointmentId).toEqual('abcd12345');
      expect(appointmentChoices[0].StartTime).toEqual('2018-09-10T21:00:00');
      expect(appointmentChoices[0].Description).toEqual(
        'Appointment on 9/10/2018'
      );

      expect(appointmentChoices[1].AppointmentId).toEqual('abcd12346');
      expect(appointmentChoices[1].StartTime).toEqual('2018-09-11T21:00:00');
      expect(appointmentChoices[1].Description).toEqual(
        'Appointment on 9/11/2018'
      );
      expect(appointmentChoices.length).toEqual(2);
    });
  });

  describe('scope.saveService method when serviceToAdd is a TreatmentPlanService', function () {
    beforeEach(function () {
      treatmentPlanServiceMock.ServiceTransaction.AppointmentId = 3;
      serviceToAdd = _.cloneDeep(treatmentPlanServiceMock);
      scope.serviceToAdd = serviceToAdd.ServiceTransaction;
      scope.SelectedAppointmentId = 3;
      scope.appointmentChoices = [];
      spyOn(ctrl, 'setInsuranceOrderOnService');
      spyOn(scope, 'updateServiceTransaction').and.callFake(function () {});
    });

    it('should set serviceToAdd.ServiceTransaction.ServiceTransactionStatusId to 1 when AppointmentId is null', function () {
      serviceToAdd.ServiceTransaction.AppointmentId = null;
      serviceToAdd.ServiceTransaction.ServiceTransactionStatusId = 1;
      scope.saveService();
      expect(serviceToAdd.ServiceTransaction.ServiceTransactionStatusId).toBe(
        1
      );
    });
    it('should set serviceToAdd.ServiceTransaction.ServiceTransactionStatusId to 1 when AppointmentId is empty', function () {
      serviceToAdd.ServiceTransaction.AppointmentId = '';
      serviceToAdd.ServiceTransaction.ServiceTransactionStatusId = 1;
      scope.saveService();
      expect(serviceToAdd.ServiceTransaction.ServiceTransactionStatusId).toBe(
        1
      );
    });
    it('should set serviceToAdd.ServiceTransaction.ServiceTransactionStatusId to 1 when AppointmentId is undefined ', function () {
      serviceToAdd.ServiceTransaction.AppointmentId = undefined;
      serviceToAdd.ServiceTransaction.ServiceTransactionStatusId = 1;
      scope.saveService();
      expect(serviceToAdd.ServiceTransaction.ServiceTransactionStatusId).toBe(
        1
      );
    });
    it('should set serviceToAdd.ServiceTransaction.ServiceTransactionStatusId to 7 when AppointmentId ', function () {
      serviceToAdd.ServiceTransaction.AppointmentId = 20;
      serviceToAdd.ServiceTransaction.ServiceTransactionStatusId = 1;
      scope.saveService();
      expect(serviceToAdd.ServiceTransaction.ServiceTransactionStatusId).toBe(
        7
      );
    });
    it('should set AppointmentId when radiobutton selected and saved  ', function () {
      expect(serviceToAdd.ServiceTransaction.AppointmentId).toBe(
        scope.SelectedAppointmentId
      );
      expect(scope.SelectedAppointmentId).toBeNull;
      scope.saveService();
    });

    it('should call ctrl.setInsuranceOrderOnService with serviceToAdd.ServiceTransaction serviceToAdd is TreatmentPlanService', function () {
      scope.saveService();
      expect(ctrl.setInsuranceOrderOnService).toHaveBeenCalledWith(
        serviceToAdd.ServiceTransaction
      );
    });

    it('should call ctrl.setInsuranceOrderOnService with serviceToAdd.ServiceTransaction serviceToAdd is TreatmentPlanService', function () {
      scope.saveService();
      expect(scope.updateServiceTransaction).toHaveBeenCalled();
    });
  });

  describe('scope.saveService method when serviceToAdd is a ServiceTransaction', function () {
    beforeEach(function () {
      serviceTransactionMock.AppointmentId = 3;
      serviceToAdd = _.cloneDeep(serviceTransactionMock);
      scope.serviceToAdd = serviceToAdd;
      scope.appointmentChoices = [];
      spyOn(ctrl, 'setInsuranceOrderOnService');
      spyOn(scope, 'updateServiceTransaction').and.callFake(function () {});
    });

    it('should call ctrl.setInsuranceOrderOnService with serviceToAdd when serviceToAdd is ServiceTransaction', function () {
      scope.saveService();
      expect(ctrl.setInsuranceOrderOnService).toHaveBeenCalledWith(
        serviceToAdd
      );
    });
  });

  describe('ctrl.setInsuranceOrderOnService method', function () {
    var servicesWithAppointments = [];
    var serviceTransaction = {};
    beforeEach(function () {
      serviceTransaction = _.cloneDeep(serviceTransactionMock);
      scope.appointmentChoices = [];
      servicesWithAppointments = _.cloneDeep(servicesWithAppointmentsMock);
    });

    it('should set the InsuranceOrder on ServiceTransaction based on appointmentChoices.LastInsuranceOrder', function () {
      scope.appointmentChoices = ctrl.getUniqueAppointments(
        servicesWithAppointments
      );
      scope.appointmentChoices[0].LastInsuranceOrder = 5;
      // user has selected first appointment in appointmentChoices
      serviceTransaction.AppointmentId =
        scope.appointmentChoices[0].AppointmentId;
      ctrl.setInsuranceOrderOnService(serviceTransaction);
      expect(serviceTransaction.InsuranceOrder).toBe(6);
      expect(scope.appointmentChoices[0].LastInsuranceOrder).toBe(6);
    });

    it('should set the InsuranceOrder on treatmentPlanService.ServiceTransaction to 1 if appointmentChoices.LastInsuranceOrder is null and serviceTransaction.AppointmentId', function () {
      scope.appointmentChoices = ctrl.getUniqueAppointments(
        servicesWithAppointments
      );
      scope.appointmentChoices[0].LastInsuranceOrder = null;
      // user has selected first appointment in appointmentChoices
      serviceTransaction.AppointmentId =
        scope.appointmentChoices[0].AppointmentId;
      ctrl.setInsuranceOrderOnService(serviceTransaction);
      expect(serviceTransaction.InsuranceOrder).toBe(1);
      expect(scope.appointmentChoices[0].LastInsuranceOrder).toBe(1);
    });

    it('should set the InsuranceOrder on treatmentPlanService.ServiceTransaction to null if appointmentChoices.LastInsuranceOrder is null and serviceTransaction.AppointmentId is null', function () {
      scope.appointmentChoices = ctrl.getUniqueAppointments(
        servicesWithAppointments
      );
      scope.appointmentChoices[0].LastInsuranceOrder = null;
      // user has selected first appointment in appointmentChoices
      serviceTransaction.AppointmentId = null;
      expect(serviceTransaction.InsuranceOrder).toBe(null);
    });

    it('should set the InsuranceOrder on treatmentPlanService.ServiceTransaction to 1 if appointmentChoices.LastInsuranceOrder is undefined', function () {
      scope.appointmentChoices = ctrl.getUniqueAppointments(
        servicesWithAppointments
      );
      scope.appointmentChoices[0].LastInsuranceOrder = 'undefined';
      // user has selected first appointment in appointmentChoices
      serviceTransaction.AppointmentId =
        scope.appointmentChoices[0].AppointmentId;
      ctrl.setInsuranceOrderOnService(serviceTransaction);
      expect(serviceTransaction.InsuranceOrder).toBe(1);
      expect(scope.appointmentChoices[0].LastInsuranceOrder).toBe(1);
    });
  });

  describe('scope.updateServiceTransaction ->', function () {
    beforeEach(function () {
      var serviceToAdd = {};
      serviceToAdd.ServiceTransaction = _.cloneDeep(serviceTransactionMock);
      serviceToAdd.ServiceTransaction.InsuranceEstimates = [];
    });

    it('should call patientServicesFactory.update() with the serviceToAdd', function () {
      scope.updateServiceTransaction(serviceToAdd);
      expect(patientServicesFactory.update).toHaveBeenCalledWith([
        serviceToAdd.ServiceTransaction,
      ]);
    });

    it('should set the InsuranceEstimates array to the return value from the update call', function () {
      var result = patientServicesFactory.update([serviceToAdd]).then();
      expect(result.Value[0].InsuranceEstimates.length).toBe(1);
      expect(result.Value[0].InsuranceEstimates[0].EstimatedInsuranceId).toBe(
        '1234'
      );
      expect(result.Value[0].InsuranceEstimates[0].ServiceTransactionId).toBe(
        '5678'
      );
    });
  });
});
