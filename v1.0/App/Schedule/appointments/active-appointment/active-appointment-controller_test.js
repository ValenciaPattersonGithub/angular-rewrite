describe('ActiveAppointmentController ->', function () {
  var ctrl,
    scope,
    scheduleServices,
    toastrFactory,
    rootScope,
    timeout,
    saveStates,
    localize,
    boundObjectFactory,
    patSecurityService,
    listHelper,
    uibModal,
    modalFactory,
    tabLauncher;
  var patientPreventiveCareFactory,
    userServices,
    patientOdontogramFactory,
    patientAppointmentsFactory,
    patAuthenticationService,
    providerOnClaimsFactory;
  var deferred,
    q,
    updatedAppointment,
    appointmentUtilities,
    referenceDataService,
    modalFactoryDeferred,
    patientServices,
    personFactory,
    appointmentViewDataLoadingService,
    appointmentViewVisibleService,
    appointmentServiceTransactionsService,
    scheduleAppointmentHttpService,
    serverlessSignalrHubConnectionService;

  beforeEach(module('Soar.Common'));
  beforeEach(module('common.factories'));
  beforeEach(
    module('Soar.Schedule', function ($provide) {
      providerOnClaimsFactory = {
        setProviderOnClaimsForService: jasmine.createSpy(),
      };
      $provide.value('ProviderOnClaimsFactory', providerOnClaimsFactory);
      personFactory = {
        Overview: jasmine.createSpy().and.returnValue({
          then: jasmine
            .createSpy()
            .and.returnValue({ Value: { PatientId: '12345' } }),
        }),
        SetPersonActiveStatus: jasmine
          .createSpy()
          .and.returnValue({ then: function () {} }),
      };

      //mock ServerlessSignalrHubConnectionService
      serverlessSignalrHubConnectionService = {
        signalRObservable: jasmine
          .createSpy('serverlessSignalrHubConnectionService.signalRObservable')
          .and.callFake(function () {
            deferred = q.defer();
            deferred.resolve(1);
            return {
              result: deferred.promise,
              subscribe: function () {},
              then: function () {},
              next: function () {},
            };
          }),
        init: jasmine
          .createSpy('serverlessSignalrHubConnectionService.init')
          .and.callFake(function () {}),
      };

      //mock ScheduleAppointmentHttpService
      scheduleAppointmentHttpService = {
        getAppointmentModalAndPatientByAppointmentId: jasmine
          .createSpy()
          .and.returnValue({
            then: jasmine
              .createSpy()
              .and.returnValue(new Promise(() => Promise.resolve())),
          }),
      };

      $provide.value('PersonFactory', personFactory);
      $provide.value(
        'AppointmentServiceTransactionsService',
        appointmentServiceTransactionsService
      );
      $provide.value(
        'ServerlessSignalrHubConnectionService',
        serverlessSignalrHubConnectionService
      );
      $provide.value(
        'ScheduleAppointmentHttpService',
        scheduleAppointmentHttpService
      );
    })
  );

  beforeEach(
    module('Soar.Patient', function ($provide) {
      patientOdontogramFactory = {
        TeethDefinitions: jasmine.createSpy().and.returnValue({
          then: jasmine.createSpy(),
        }),
        LoadedServiceCodes: jasmine.createSpy().and.returnValue({
          then: jasmine.createSpy(),
        }),
        setselectedChartButton: jasmine.createSpy(),
      };
      $provide.value('PatientOdontogramFactory', patientOdontogramFactory);

      patAuthenticationService = {
        getCachedToken: jasmine.createSpy().and.returnValue({
          then: jasmine.createSpy(),
        }),
      };
      $provide.value('patAuthenticationService', patAuthenticationService);

      appointmentUtilities = {
        markDuplicateProviderAppointmentsToRemove: jasmine
          .createSpy()
          .and.returnValue({}),
      };
      $provide.value('AppointmentUtilities', appointmentUtilities);
      //$provide.value('ResourceService', resourceService);
      //$provide.value('ApiDefinitions', apiDefinitions);
      //$provide.value('ResourceFactory', resourceFactory);
      $provide.value('PatientServices', patientServices);
      $provide.value('PersonFactory', personFactory);
      $provide.value('PatientServicesFactory', {});

      patientAppointmentsFactory = {
        AppointmentDataWithDetails: jasmine.createSpy().and.returnValue({
          then: jasmine.createSpy().and.returnValue({
            Value: {
              AppointmentId: '1',
              PlannedServices: [
                {
                  ServiceCodeId: '1',
                  ObjectState: 'None',
                  ServiceTransactionStatusId: 1,
                  fee: '2.00',
                },
                {
                  ServiceCodeId: '2',
                  ObjectState: 'None',
                  ServiceTransactionStatusId: 1,
                  fee: '22.00',
                },
              ],
              ProviderAppointments: [
                { ObjectState: null },
                { ObjectState: 'Add' },
              ],
            },
          }),
        }),
      };
      $provide.value('PatientAppointmentsFactory', patientAppointmentsFactory);

      referenceDataService = {
        get: jasmine.createSpy().and.callFake(function () {
          return [];
        }),
        getData: () => Promise.resolve([]),
        entityNames: {
          serviceTypes: 'serviceTypes',
          preventiveServiceTypes: 'preventiveServiceTypes',
          serviceCodes: 'serviceCodes',
        },
      };

      $provide.value('referenceDataService', referenceDataService);

      appointmentViewVisibleService = {
        changeAppointmentViewVisible: jasmine.createSpy(),
      };
      $provide.value(
        'AppointmentViewVisibleService',
        appointmentViewVisibleService
      );

      appointmentViewDataLoadingService = {
        getViewData: jasmine
          .createSpy('appointmentViewDataLoadingService.getViewData')
          .and.callFake(function () {
            return {
              then: function () {},
            };
          }),
      };
      $provide.value(
        'AppointmentViewDataLoadingService',
        appointmentViewDataLoadingService
      );
    })
  );

  beforeEach(
    module('Soar.BusinessCenter', function ($provide) {
      userServices = {
        Users: {
          get: jasmine.createSpy().and.returnValue(''),
        },
        Providers: {
          get: jasmine.createSpy().and.callFake(function () {
            var mock = q.defer();
            mock.resolve(1);
            return {
              result: mock.promise,
              then: function () {},
            };
          }),
        },
        ActivationHistory: {
          get: jasmine.createSpy(),
        },
      };
      $provide.value('UserServices', userServices);
    })
  );

  // create controller and scope
  beforeEach(inject(function ($rootScope, $controller, $injector, $q) {
    rootScope = $rootScope;
    scope = $rootScope.$new();
    scope.patientInfo = {};
    timeout = $injector.get('$timeout');
    q = $q;
    deferred = q.defer();
    //mock for scheduleServices
    scheduleServices = {
      MarkAsFinished: {
        Appointment: jasmine.createSpy('MarkAsFinished'),
      },
      Dtos: {
        Appointment: jasmine.createSpy('Appointment'),
      },
      AppointmentStatus: {
        Update: jasmine.createSpy(),
      },
      Lists: {
        Appointments: {
          GetWithDetails: jasmine
            .createSpy()
            .and.returnValue({ $promise: { then: jasmine.createSpy() } }),
        },
      },
    };
    patientServices = {
      Patients: {
        overview: jasmine.createSpy(),
        get: jasmine
          .createSpy()
          .and.returnValue({ $promise: { then: jasmine.createSpy() } }),
      },
      PatientAppointment: {
        GetWithDetails: jasmine
          .createSpy()
          .and.returnValue({ $promise: { then: jasmine.createSpy() } }),
      },
    };
    personFactory = {
      Overview: jasmine
        .createSpy()
        .and.returnValue({ then: jasmine.createSpy() }),
    };

    //mock for toastrFactory
    toastrFactory = {
      success: jasmine.createSpy(),
      error: jasmine.createSpy(),
    };

    tabLauncher = {
      launchNewTab: jasmine.createSpy(),
    };
    //mock for saveStates
    saveStates = {
      None: 'None',
      Update: 'Update',
      Add: 'Add',
      Delete: 'Delete',
    };

    // mock localize
    localize = {
      getLocalizedString: jasmine.createSpy().and.returnValue(''),
    };

    // mock for boundObjectFactory
    boundObjectFactory = {
      Create: jasmine.createSpy().and.returnValue({
        AfterDeleteSuccess: null,
        AfterSaveError: null,
        AfterSaveSuccess: null,
        Data: {},
        Deleting: false,
        IdField: 'AppointmentTypeId',
        Loading: true,
        Name: 'AppointmentType',
        Saving: false,
        Valid: true,
        Load: jasmine.any(Function),
        Save: jasmine.createSpy().and.returnValue(''),
        Validate: jasmine.createSpy().and.returnValue(''),
        CheckDuplicate: jasmine.createSpy().and.returnValue(''),
      }),
    };

    // mock for patSecurityService
    patSecurityService = {
      IsAuthorizedByAbbreviation: jasmine.createSpy().and.returnValue(true),
      generateMessage: jasmine.createSpy().and.returnValue(''),
    };

    listHelper = {
      findItemByFieldValue: jasmine.createSpy().and.returnValue(''),
      findItemByPredicate: jasmine.createSpy().and.returnValue({}),
    };

    //mock for modalFactory
    uibModal = {
      open: jasmine.createSpy('uibModal.open').and.callFake(function () {
        deferred = q.defer();
        deferred.resolve('some value in return');
        return { result: deferred.promise };
      }),
      result: {
        then: jasmine.createSpy('uibModal.result.then'),
      },
    };

    modalFactory = {
      PersonalModal: jasmine
        .createSpy('modalFactory.Modal')
        .and.callFake(function () {
          modalFactoryDeferred = q.defer();
          modalFactoryDeferred.resolve(1);
          return {
            result: modalFactoryDeferred.promise,
            then: function () {},
          };
        }),
    };

    patientPreventiveCareFactory = {
      PreventiveCareServices: jasmine.createSpy().and.returnValue({
        then: jasmine.createSpy(),
      }),
    };

    // Create spies for services

    userServices = {
      Providers: {
        get: jasmine
          .createSpy()
          .and.returnValue({ $promise: deferred.promise }),
      },
    };

    appointmentServiceTransactionsService = {
      setInsuranceOrderOnServiceTransaction: jasmine
        .createSpy()
        .and.returnValue({ then: function () {} }),
      setNextInsuranceOrderForPlannedService: jasmine
        .createSpy()
        .and.returnValue({ then: function () {} }),
    };

    // create controller
    ctrl = $controller('ActiveAppointmentController', {
      $scope: scope,
      $rootScope: rootScope,
      ScheduleServices: scheduleServices,
      toastrFactory: toastrFactory,
      $timeout: timeout,
      SaveStates: saveStates,
      BoundObjectFactory: boundObjectFactory,
      localize: localize,
      $uibModal: uibModal,
      patSecurityService: patSecurityService,
      ListHelper: listHelper,
      tabLauncher: tabLauncher,
      $q: q,
      PatientPreventiveCareFactory: patientPreventiveCareFactory,
      UserServices: userServices,
      ModalFactory: modalFactory,
      personFactory: personFactory,
      AppointmentServiceTransactionsService: appointmentServiceTransactionsService,
      ServerlessSignalrHubConnectionService: serverlessSignalrHubConnectionService,
      ScheduleAppointmentHttpService: scheduleAppointmentHttpService,
    });
  }));

  //controller
  describe('ActiveAppointmentController : should check if controller exists', function () {
    it('should check if controller exists', function () {
      personFactory = {
        Overview: jasmine
          .createSpy()
          .and.returnValue({ then: jasmine.createSpy() }),
      };
      expect(ctrl).not.toBeNull();
      expect(ctrl).not.toBeUndefined();
    });
  });

  describe('scope.actApptToggle function ->', function () {
    it('should toggle actApptActive', function () {
      scope.actApptActive = false;
      scope.actApptToggle();
      expect(scope.actApptActive).toBe(true);
    });
  });

  describe('ctrl.initAppointmentLoad method ->', function () {
    var appointment = {};
    beforeEach(function () {
      spyOn(ctrl, 'getPreventiveServiceInfo');
      spyOn(ctrl, 'getPlannedServiceCodes');
      appointment = {
        AppointmentId: '1234',
        PlannedServices: [{ ServiceCodeId: '1' }, { ServiceCodeId: '2' }],
      };
    });

    it('should call ctrl.getPreventiveServiceInfo if scope.patientInfo is not undefined', function () {
      scope.patientInfo = { PatientId: '1234' };
      ctrl.initAppointmentLoad(appointment);
      expect(ctrl.getPreventiveServiceInfo).toHaveBeenCalledWith(
        scope.patientInfo.PatientId
      );
    });

    it('should not call ctrl.getPreventiveServiceInfo if scope.patientInfo is undefined', function () {
      scope.patientInfo = undefined;
      ctrl.initAppointmentLoad(appointment);
      expect(ctrl.getPreventiveServiceInfo).not.toHaveBeenCalled();
    });

    it('should set actApptActive to true', function () {
      ctrl.initAppointmentLoad(appointment);
      expect(scope.actApptActive).toBe(true);
    });

    it('should set actApptActive to true and activeAppointment to appointment', function () {
      ctrl.initAppointmentLoad(appointment);
      expect(ctrl.getPlannedServiceCodes).toHaveBeenCalledWith(appointment);
    });

    it('should set activeAppointment to appointment', function () {
      ctrl.initAppointmentLoad(appointment);
      expect(scope.activeAppointment).toEqual(appointment);
    });

    it('should initialize noteData properties', function () {
      scope.noteData = { original: 'original', current: 'current' };
      appointment.Note = 'test';
      ctrl.initAppointmentLoad(appointment);
      expect(scope.noteData).toEqual({ original: 'test', current: 'test' });
    });
  });

  describe('watch activeAppointmentId ->', function () {
    var params = {};
    beforeEach(function () {
      spyOn(ctrl, 'initAppointmentLoad').and.callFake(function () {});
      scope.activeAppointmentId = null;
      params = {
        AppointmentId: 2,
        PersonId: undefined,
        FillAppointmentType: true,
        FillLocation: true,
        FillPerson: true,
        FillProviders: true,
        FillRoom: false,
        FillProviderUsers: false,
        FillServices: true,
        FillServiceCodes: false,
        FillPhone: false,
        IncludeCompletedServices: true,
      };
    });

    it('should do nothing if activeAppointmentId is null ', function () {
      scope.activeAppointmentId = null;
      scope.$apply();
      expect(
        scheduleServices.Lists.Appointments.GetWithDetails
      ).not.toHaveBeenCalled();
    });

    it('should call api with scope.activeAppointmentId if activeAppointmentId is not null ', function () {
      scope.activeAppointmentId = null;
      scope.$apply();
      scope.activeAppointmentId = 2;
      scope.$apply();
      expect(
        scheduleServices.Lists.Appointments.GetWithDetails
      ).toHaveBeenCalled();
      expect(
        scheduleServices.Lists.Appointments.GetWithDetails
      ).toHaveBeenCalledWith(params);
    });

    it('should set scope.actApptActiveTab if activeAppointmentId is not null ', function () {
      scope.activeAppointmentId = null;
      scope.$apply();
      scope.activeAppointmentId = 2;
      scope.$apply();
      expect(scope.actApptActive).toBe(true);
      expect(scope.actApptActiveTab).toBe(1);
    });
  });

  describe('finishAppointment function ->', function () {
    beforeEach(function () {
      scope.activeAppointment = {
        PlannedServices: [
          {
            ServiceCodeId: '1',
            ObjectState: 'None',
            ServiceTransactionStatusId: 1,
            LocationId: 1,
            ProviderUserId: 'c637af01-8c03-4b2d-bede-ab396b5835cf',
            ProviderOnClaimsId: '00000000-0000-0000-0000-000000000000',
          },
          {
            ServiceCodeId: '2',
            ObjectState: 'None',
            ServiceTransactionStatusId: 1,
            LocationId: 2,
            ProviderUserId: 'fc61f2c7-fb94-4eee-bd91-3d7e02f19ea9',
            ProviderOnClaimsId: '00000000-0000-0000-0000-000000000000',
          },
        ],
        ProviderAppointments: [{ ObjectState: null }, { ObjectState: null }],
      };
    });

    it('should set PlannedServices DateEntered to todays date', function () {
      var appointmentDate = new Date();
      scope.hasClinicalAppointmentFinishAccess = true;
      scope.activeAppointment = {
        PlannedServices: [
          {
            ServiceCodeId: '1',
            ObjectState: 'None',
            ServiceTransactionStatusId: 1,
            DateEntered: '2018-10-30',
          },
          {
            ServiceCodeId: '2',
            ObjectState: 'None',
            ServiceTransactionStatusId: 1,
            DateEntered: '2018-10-30',
          },
        ],
        ProviderAppointments: [{ ObjectState: null }, { ObjectState: 'Add' }],
      };
      scope.finishAppointment();
      _.forEach(scope.activeAppointment.PlannedServices, function (service) {
        expect(moment(service.DateEntered).format('MM/DD/YYYY')).toEqual(
          moment(appointmentDate).format('MM/DD/YYYY')
        );
      });
    });

    it('should set actApptActive to true and activeAppointment to appointment', function () {
      scope.hasClinicalAppointmentFinishAccess = true;
      scope.activeAppointment = {
        PlannedServices: [
          {
            ServiceCodeId: '1',
            ObjectState: 'None',
            ServiceTransactionStatusId: 1,
          },
          {
            ServiceCodeId: '2',
            ObjectState: 'None',
            ServiceTransactionStatusId: 1,
          },
        ],
        ProviderAppointments: [{ ObjectState: null }, { ObjectState: 'Add' }],
      };
      scope.finishAppointment();
      expect(scheduleServices.MarkAsFinished.Appointment).toHaveBeenCalled();
    });

    it('should call notifyNotAuthorized', function () {
      scope.hasClinicalAppointmentFinishAccess = false;
      spyOn(ctrl, 'notifyNotAuthorized');
      scope.finishAppointment();
      expect(ctrl.notifyNotAuthorized).toHaveBeenCalled();
    });

    it('should call appointmentUtilities.markDuplicateProviderAppointmentsToRemove if there are activeAppointment.ProviderAppointments', function () {
      spyOn(ctrl, 'validateProviderAppointments');
      scope.finishAppointment();
      expect(ctrl.validateProviderAppointments).toHaveBeenCalledWith(
        scope.activeAppointment
      );
    });

    describe('when note has not been modified ->', function () {
      beforeEach(function () {
        scope.noteData = { original: 'original', current: 'original' };
        scope.activeAppointment = { Note: 'note' };
      });

      it('should not update the appointment note', function () {
        scope.finishAppointment();
        expect(
          scheduleServices.MarkAsFinished.Appointment
        ).toHaveBeenCalledWith(
          jasmine.objectContaining({ Note: 'note' }),
          jasmine.any(Function),
          jasmine.any(Function)
        );
      });
    });

    describe('when note has been modified ->', function () {
      beforeEach(function () {
        scope.noteData = { original: 'original', current: 'modified' };
        scope.activeAppointment = { Note: 'note' };
      });

      it('should update the appointment note', function () {
        scope.finishAppointment();
        expect(
          scheduleServices.MarkAsFinished.Appointment
        ).toHaveBeenCalledWith(
          jasmine.objectContaining({ Note: 'modified' }),
          jasmine.any(Function),
          jasmine.any(Function)
        );
      });
    });

    describe('ctrl.validateProviderAppointments method ->', function () {
      var appointment;
      beforeEach(function () {
        appointment = {
          ProviderAppointments: [
            { ObjectState: 'None' },
            { ObjectState: 'None' },
          ],
        };
      });

      it('should call appointmentUtilities.markDuplicateProviderAppointmentsToRemove if there are appointment.ProviderAppointments', function () {
        ctrl.validateProviderAppointments(appointment);
        expect(
          appointmentUtilities.markDuplicateProviderAppointmentsToRemove
        ).toHaveBeenCalled();
      });

      it('should not call appointmentUtilities.markDuplicateProviderAppointmentsToRemove if there are not appointment.ProviderAppointments', function () {
        appointment.ProviderAppointments = [];
        ctrl.validateProviderAppointments(appointment);
        expect(
          appointmentUtilities.markDuplicateProviderAppointmentsToRemove
        ).not.toHaveBeenCalled();
      });
    });
  });

  describe('finishAppointmentOnSuccess function ->', function () {
    it('should broadcast an event, should open finish appointment modal and should set actApptActive to true and activeAppointment to null', function () {
      var successResponse = {
        Value: {
          Appointments: [{ ServiceCodeId: '1' }, { ServiceCodeId: '2' }],
          Encounter: { EncounterId: '1' },
        },
      };
      spyOn(rootScope, '$broadcast');
      spyOn(ctrl, 'openFinishedAppointmentModal');

      ctrl.finishAppointmentOnSuccess(successResponse);
      expect(rootScope.$broadcast).toHaveBeenCalledWith(
        'appointment:update-appointment',
        successResponse.Value.Appointments[0]
      );
      expect(rootScope.$broadcast).toHaveBeenCalledWith(
        'soar:chart-services-reload-ledger'
      );
      expect(ctrl.openFinishedAppointmentModal).toHaveBeenCalledWith(
        successResponse.Value.Appointments[0],
        successResponse.Value.Encounter
      );
      expect(scope.actApptActive).toBe(false);
      expect(scope.activeAppointment).toBe(null);
      expect(scope.disableActions).toBe(false);
    });
  });

  describe('resetAppointment function ->', function () {
    beforeEach(function () {
      spyOn(ctrl, 'validateProviderAppointments');
      scope.hasClinicalAppointmentEditAccess = true;
      scope.disableActions = false;
    });
    it('should reset appointment', function () {
      scope.hasClinicalAppointmentEditAccess = true;
      scope.activeAppointment = { Status: '4' };
      scope.resetAppointment();
      expect(ctrl.validateProviderAppointments).toHaveBeenCalled();
      expect(scope.disableActions).toBe(true);
      expect(scheduleServices.AppointmentStatus.Update).toHaveBeenCalled();
    });

    it('should call notifyNotAuthorized', function () {
      scope.hasClinicalAppointmentEditAccess = false;
      spyOn(ctrl, 'notifyNotAuthorized');
      scope.resetAppointment();
      expect(ctrl.notifyNotAuthorized).toHaveBeenCalled();
    });
  });

  describe('resetAppointmentOnSuccess function ->', function () {
    it('should reset appointment', function () {
      scope.activeAppointment = { Status: '4' };
      spyOn(rootScope, '$broadcast');
      ctrl.resetAppointmentOnSuccess();
      expect(
        rootScope.$broadcast
      ).toHaveBeenCalledWith('appointment:update-appointment', { Status: '4' });
      expect(scope.actApptActive).toBe(false);
      expect(scope.activeAppointment).toBe(null);
    });
  });

  describe('resetAppointmentOnFailure function ->', function () {
    it('should call toastrFactory.error', function () {
      ctrl.resetAppointmentOnFailure();
      expect(scope.disableActions).toBe(false);
    });
  });

  describe('addToPlannedServices function ->', function () {
    it('should add planned services if services are array', function () {
      scope.hasClinicalAppointmentEditAccess = true;
      var addedServiceTransactions = [
        { ObjectState: 'None', Description: 'ServiceAdded1' },
        { ObjectState: 'None', Description: 'ServiceAdded2' },
      ];
      scope.activeAppointment = { PlannedServices: [] };
      var resSuccess = (ctrl.addToPlannedServicesSuccess = jasmine
        .createSpy()
        .and.returnValue('addSuccess'));
      var resFailure = (ctrl.addToPlannedServicesFailure = jasmine
        .createSpy()
        .and.returnValue('addFailure'));
      ctrl.addToPlannedServices(addedServiceTransactions);
      expect(scope.disableActions).toBe(true);
      expect(ctrl.appointmentCrud.Save).toHaveBeenCalled();
      expect(ctrl.appointmentCrud.AfterSaveSuccess).toBe(resSuccess);
      expect(ctrl.appointmentCrud.AfterSaveError).toBe(resFailure);
    });

    it('should add planned services if services are objects', function () {
      scope.hasClinicalAppointmentEditAccess = true;
      var addedServiceTransactions = {
        ObjectState: 'None',
        Description: 'ServiceAdded1',
      };
      scope.activeAppointment = { PlannedServices: [] };
      var resSuccess = (ctrl.addToPlannedServicesSuccess = jasmine
        .createSpy()
        .and.returnValue('addSuccess'));
      var resFailure = (ctrl.addToPlannedServicesFailure = jasmine
        .createSpy()
        .and.returnValue('addFailure'));
      ctrl.addToPlannedServices(addedServiceTransactions);
      expect(scope.disableActions).toBe(true);
      expect(ctrl.appointmentCrud.Save).toHaveBeenCalled();
      expect(ctrl.appointmentCrud.AfterSaveSuccess).toBe(resSuccess);
      expect(ctrl.appointmentCrud.AfterSaveError).toBe(resFailure);
    });

    it('should not add planned services if not authorized to', function () {
      scope.hasClinicalAppointmentEditAccess = false;
      spyOn(ctrl, 'notifyNotAuthorized');
      var addedServiceTransactions = [
        { ObjectState: 'None', Description: 'ServiceAdded1' },
        { ObjectState: 'None', Description: 'ServiceAdded2' },
      ];
      scope.activeAppointment = { PlannedServices: [] };
      ctrl.addToPlannedServices(addedServiceTransactions);
      expect(ctrl.notifyNotAuthorized).toHaveBeenCalled();
    });
  });

  describe('notifyNotAuthorized function ->', function () {
    it('should reset appointment', function () {
      ctrl.notifyNotAuthorized();
      expect(toastrFactory.error).toHaveBeenCalled();
    });
  });

  describe('notifyNotAuthorizedWithAmfa function ->', function () {
    it('should reset appointment', function () {
      var abbrev = 'soar-sch-apt-edit';
      ctrl.notifyNotAuthorizedWithAmfa(abbrev);
      expect(toastrFactory.error).toHaveBeenCalledWith(
        patSecurityService.generateMessage(abbrev),
        'Not Authorized'
      );
    });
  });

  describe('openFinishedAppointmentModal function ->', function () {
    it('should open Finished Appointment Modal', function () {
      var appointment = { StartTime: '5.00 am' };
      var pendingEncounter = { id: '1' };
      ctrl.modalIsOpen = false;
      scope.patientInfo = { PatientName: 'Smith' };
      ctrl.openFinishedAppointmentModal(appointment, pendingEncounter);
      expect(ctrl.modalIsOpen).toBe(true);

      expect(uibModal.open).toHaveBeenCalled();
    });
  });

  describe('finishAppointmentModalOnClose function ->', function () {
    var action;
    beforeEach(function () {
      action = { ScheduleNextAppt: true };
      scope.patientInfo = { PatientId: '123' };
    });
    it('should open the appointment modal if it has add Access To Schedule Appt', function () {
      spyOn(scope, 'openAppointmentModal');
      ctrl.finishAppointmentModalOnClose(action);
      ctrl.hasAddAccessToScheduleAppt = true;
      expect(ctrl.modalIsOpen).toBe(false);
      expect(scope.openAppointmentModal).toHaveBeenCalled();
    });
  });

  describe('addToPlannedServicesSuccess function ->', function () {
    it('should broadcast an event and should set reloadingAppointment to true ', function () {
      spyOn(rootScope, '$broadcast');
      ctrl.addToPlannedServicesSuccess();
      expect(scope.reloadingAppointment).toBe(true);
      expect(rootScope.$broadcast).toHaveBeenCalledWith(
        'appointment:update-appointment',
        ctrl.appointmentCrud.Data
      );
      expect(rootScope.$broadcast).toHaveBeenCalledWith(
        'soar:chart-services-reload-ledger'
      );
    });
  });

  describe('addToPlannedServicesFailure function ->', function () {
    it('should set ctrl.modalIsOpen to false', function () {
      ctrl.addToPlannedServicesFailure();
      expect(scope.disableActions).toBe(false);
      expect(toastrFactory.error).toHaveBeenCalled();
    });
  });

  describe('onRemoveService function ->', function () {
    it('should set ctrl.modalIsOpen to false', function () {
      var service = { ServiceTransactionId: '1' };
      scope.activeAppointment = {
        PlannedServices: [
          {
            ServiceTransactionId: '1',
            ObjectState: 'Add',
            Description: 'Added1',
          },
          {
            ServiceTransactionId: '2',
            ObjectState: 'Add',
            Description: 'Added2',
          },
        ],
      };
      listHelper.findItemByFieldValue = jasmine
        .createSpy()
        .and.returnValue(scope.activeAppointment.PlannedServices[0]);
      scope.hasClinicalAppointmentEditAccess = true;
      var resSuccess = (ctrl.onRemoveServiceSuccess = jasmine
        .createSpy()
        .and.returnValue('removeSuccess'));
      var resFailure = (ctrl.onRemoveServiceFailure = jasmine
        .createSpy()
        .and.returnValue('removeFailure'));
      scope.onRemoveService(service);
      expect(scope.disableActions).toBe(true);
      expect(ctrl.appointmentCrud.Data).toEqual(scope.activeAppointment);
      expect(ctrl.appointmentCrud.AfterSaveSuccess).toBe(resSuccess);
      expect(ctrl.appointmentCrud.AfterSaveError).toBe(resFailure);
      expect(ctrl.appointmentCrud.Save).toHaveBeenCalled();
    });

    it('should set AppointmentId to null and objectState to Update', function () {
      scope.hasClinicalAppointmentEditAccess = true;
      var service = {
        ServiceTransactionId: '1',
        AppointmentId: '1234',
        ObjectState: 'None',
      };
      scope.activeAppointment = { PlannedServices: [] };
      scope.activeAppointment.PlannedServices.push({
        ServiceTransactionId: '1',
        AppointmentId: '1234',
        ObjectState: 'None',
      });
      scope.activeAppointment.PlannedServices.push({
        ServiceTransactionId: '2',
        AppointmentId: '1234',
        ObjectState: 'None',
      });
      scope.activeAppointment.PlannedServices.push({
        ServiceTransactionId: '3',
        AppointmentId: '1234',
        ObjectState: 'None',
      });

      listHelper.findItemByFieldValue = jasmine
        .createSpy('listHelper.findItemByFieldValue')
        .and.returnValue(scope.activeAppointment.PlannedServices[0]);
      scope.onRemoveService(service);
      expect(scope.activeAppointment.PlannedServices[0].ObjectState).toEqual(
        'Update'
      );
      expect(scope.activeAppointment.PlannedServices[0].AppointmentId).toEqual(
        null
      );
    });

    it('should call notifyNotAuthorized if not having authorization', function () {
      var service = { ServiceTransactionId: '1' };
      scope.hasClinicalAppointmentEditAccess = false;
      spyOn(ctrl, 'notifyNotAuthorized');
      scope.onRemoveService(service);
      expect(ctrl.notifyNotAuthorized).toHaveBeenCalled();
    });
  });

  describe('onRemoveServiceSuccess function ->', function () {
    it('should broadcast an event and should set reloadingAppointment to true ', function () {
      spyOn(rootScope, '$broadcast');
      ctrl.onRemoveServiceSuccess();
      expect(scope.reloadingAppointment).toBe(true);
      expect(rootScope.$broadcast).toHaveBeenCalledWith(
        'appointment:update-appointment',
        ctrl.appointmentCrud.Data
      );
      expect(rootScope.$broadcast).toHaveBeenCalledWith(
        'soar:chart-services-reload-ledger'
      );
    });
  });

  describe('onRemoveServiceFailure function ->', function () {
    it('should set ctrl.modalIsOpen to false', function () {
      ctrl.onRemoveServiceFailure();
      expect(scope.disableActions).toBe(false);
      expect(toastrFactory.error).toHaveBeenCalled();
    });
  });

  describe('appointment:appointment-reloaded event ->', function () {
    it('should set disableActions and reloadingAppointment to false ', function () {
      scope.$broadcast('appointment:appointment-reloaded', null);
      expect(scope.disableActions).toBe(false);
      expect(scope.reloadingAppointment).toBe(false);
    });
  });

  describe('chart-ledger:service-transaction-deleted event ->', function () {
    it('should set disableActions and reloadingAppointment to true ', function () {
      scope.$broadcast('chart-ledger:service-transaction-deleted', null);
      expect(scope.disableActions).toBe(true);
      expect(scope.reloadingAppointment).toBe(true);
    });
  });

  describe('$scope.refreshAppointment function ->', function () {
    beforeEach(function () {
      scope.activeAppointment = {
        AppointmentId: '1',
        DataTag: '=AAAADEF',
        PlannedServices: [
          {
            ServiceCodeId: '1',
            ObjectState: 'None',
            ServiceTransactionStatusId: 1,
            fee: '5.00',
          },
          {
            ServiceCodeId: '2',
            ObjectState: 'None',
            ServiceTransactionStatusId: 1,
            fee: '9.00',
          },
        ],
        ProviderAppointments: [{ ObjectState: null }, { ObjectState: 'Add' }],
      };
    });

    it('should call to get the latest active appointment by id', function () {
      scope.refreshAppointment();
      expect(
        patientAppointmentsFactory.AppointmentDataWithDetails
      ).toHaveBeenCalledWith('1');
    });

    describe('then function ->', function () {
      var resultAppt;
      beforeEach(function () {
        resultAppt = { Note: 'note' };
        var result = { Value: { Appointment: resultAppt } };
        patientAppointmentsFactory.AppointmentDataWithDetails = jasmine
          .createSpy()
          .and.returnValue({
            then: function (cb) {
              cb(result);
            },
          });
        scope.finishAppointment = jasmine.createSpy();
      });

      describe('when note has not been changed ->', function () {
        beforeEach(function () {
          scope.noteData = { original: 'original', current: 'original' };
        });

        it('should update scope.noteData', function () {
          scope.refreshAppointment();
          expect(scope.noteData).toEqual({ original: 'note', current: 'note' });
        });
      });

      describe('when note has been changed ->', function () {
        beforeEach(function () {
          scope.noteData = { original: 'original', current: 'modified' };
        });

        it('should not update scope.noteData', function () {
          scope.refreshAppointment();
          expect(scope.noteData).toEqual({
            original: 'original',
            current: 'modified',
          });
        });
      });

      describe('when returned appointment status is not 4 ->', function () {
        beforeEach(function () {
          resultAppt.Status = 3;
          resultAppt.ActualEndTime = 'newActualEndTime';
          resultAppt.ActualStartTime = 'newActualStartTime';
          scope.activeAppointment.ActualEndTime = 'actualEndTime';
          scope.activeAppointment.ActualStartTime = 'actualStartTime';
        });

        it('should set properties on active appointment', function () {
          scope.refreshAppointment();
          expect(scope.activeAppointment.ActualEndTime).toBe(
            'newActualEndTime'
          );
          expect(scope.activeAppointment.ActualStartTime).toBe(
            'newActualStartTime'
          );
          expect(scope.activeAppointment).not.toBe(resultAppt);
        });

        it('should call scope.finishAppointment', function () {
          scope.refreshAppointment();
          expect(scope.finishAppointment).toHaveBeenCalled();
        });
      });

      describe('when returned appointment status is 4 ->', function () {
        beforeEach(function () {
          resultAppt.Status = 4;
          resultAppt.ActualEndTime = 'newActualEndTime';
          resultAppt.ActualStartTime = 'newActualStartTime';
          scope.activeAppointment.ActualEndTime = 'actualEndTime';
          scope.activeAppointment.ActualStartTime = 'actualStartTime';
        });

        it('should set scope.activeAppointment to the result', function () {
          scope.refreshAppointment();
          expect(scope.activeAppointment).toBe(resultAppt);
        });

        it('should call scope.finishAppointment', function () {
          scope.refreshAppointment();
          expect(scope.finishAppointment).toHaveBeenCalled();
        });
      });
    });
  });

  describe('ctrl.initHub function ->', function () {
    beforeEach(function () {
      scope.activeAppointment = {
        AppointmentId: '1',
        DataTag: '=AAAADEF',
        PlannedServices: [
          {
            ServiceCodeId: '1',
            ObjectState: 'None',
            ServiceTransactionStatusId: 1,
            fee: '5.00',
          },
          {
            ServiceCodeId: '2',
            ObjectState: 'None',
            ServiceTransactionStatusId: 1,
            fee: '9.00',
          },
        ],
        ProviderAppointments: [{ ObjectState: null }, { ObjectState: 'Add' }],
      };

      updatedAppointment = {
        change: 'update',
        value: {
          AppointmentId: '1',
          DataTag: '=AAAABCD',
          Value: {
            AppointmentId: '1',
            DataTag: '=AAAABCD',
            PlannedServices: [
              {
                ServiceCodeId: '1',
                ObjectState: 'None',
                ServiceTransactionStatusId: 1,
                fee: '122.00',
              },
              {
                ServiceCodeId: '2',
                ObjectState: 'None',
                ServiceTransactionStatusId: 1,
                fee: '400.00',
              },
            ],
            ProviderAppointments: [
              { ObjectState: null },
              { ObjectState: 'Add' },
            ],
          },
        },
      };
    });

    it('should not update the running appointment when the active appointment id does not match', function () {
      var res = {
        Value: { Appointment: {} },
      };
      patientServices.PatientAppointment = {
        GetWithDetails: jasmine.createSpy(),
      };

      patientServices.PatientAppointment.GetWithDetails = () => {
        return {
          $promise: {
            then: success => success(res),
          },
        };
      };

      spyOn(scope, 'updateAppointmentProperties');
      updatedAppointment.value.Value.AppointmentId = '2';
      ctrl.hubApptChanged(updatedAppointment);
      expect(updatedAppointment.change).toBe('update');
      expect(scope.updateAppointmentProperties).not.toHaveBeenCalledWith(
        updatedAppointment.value.Value,
        true
      );
    });
  });

  describe('scope.updateAppointmentProperties ->', function () {
    beforeEach(function () {
      scope.activeAppointment = {
        AppointmentId: '1',
        DataTag: '=AAAADEF',
        PlannedServices: [
          {
            ServiceCodeId: '1',
            ObjectState: 'None',
            ServiceTransactionStatusId: 1,
            fee: '5.00',
          },
          {
            ServiceCodeId: '2',
            ObjectState: 'None',
            ServiceTransactionStatusId: 1,
            fee: '9.00',
          },
        ],
        ProviderAppointments: [{ ObjectState: null }, { ObjectState: 'Add' }],
      };
      spyOn(ctrl, 'closeWindow');
    });

    it('should set the active appointment with the updated appointment info when signal R updates come in', function () {
      spyOn(ctrl, 'getPlannedServiceCodes');
      updatedAppointment.change = 'update';
      scope.updateAppointmentProperties(updatedAppointment.value.Value, true);
      expect(updatedAppointment.change).toEqual('update');
      expect(scope.activeAppointment.DataTag).toEqual(
        updatedAppointment.value.DataTag
      );
      expect(scope.activeAppointment.PlannedServices).toEqual(
        updatedAppointment.value.Value.PlannedServices
      );
      expect(ctrl.closeWindow).toHaveBeenCalled();
      expect(ctrl.getPlannedServiceCodes).toHaveBeenCalledWith(
        updatedAppointment.value.Value
      );
    });

    it('should add and remove services from the active treatment plan via signal R', function () {
      updatedAppointment.change = 'update';
      updatedAppointment.value.Value.PlannedServices.push({
        ServiceCodeId: '3',
        ObjectState: 'None',
        ServiceTransactionStatusId: 3,
        fee: '25.00',
      });
      scope.updateAppointmentProperties(updatedAppointment.value.Value, true);
      expect(updatedAppointment.change).toEqual('update');
      expect(scope.activeAppointment.PlannedServices.length).toEqual(3);
    });
  });

  describe('scope.updateAppointmentProperties ->', function () {
    beforeEach(function () {
      scope.activeAppointment = {
        AppointmentId: '1',
        DataTag: '=AAAADEF',
        PlannedServices: [
          {
            ServiceCodeId: '1',
            ObjectState: 'None',
            ServiceTransactionStatusId: 1,
            fee: '5.00',
          },
          {
            ServiceCodeId: '2',
            ObjectState: 'None',
            ServiceTransactionStatusId: 1,
            fee: '9.00',
          },
        ],
        ProviderAppointments: [{ ObjectState: null }, { ObjectState: 'Add' }],
      };
    });

    it('should set the active appointment with the updated appointment info when signal R updates come in', function () {
      spyOn(ctrl, 'closeWindow');
      spyOn(ctrl, 'getPlannedServiceCodes');
      updatedAppointment.change = 'update';
      scope.updateAppointmentProperties(updatedAppointment.value.Value, true);
      expect(updatedAppointment.change).toEqual('update');
      expect(scope.activeAppointment.DataTag).toEqual(
        updatedAppointment.value.DataTag
      );
      expect(scope.activeAppointment.PlannedServices).toEqual(
        updatedAppointment.value.Value.PlannedServices
      );
      expect(ctrl.closeWindow).toHaveBeenCalled();
      expect(ctrl.getPlannedServiceCodes).toHaveBeenCalledWith(
        updatedAppointment.value.Value
      );
    });
  });

  describe('ctrl.getPreventiveServiceInfo', function () {
    var personId;
    var deferredObject;
    beforeEach(function () {
      scope.hasPreventiveCareViewAccess = true;
      (personId = '1234'),
        (deferredObject = {
          resolve: jasmine.createSpy(),
          defer: jasmine.createSpy(),
        });
    });

    // Note FIX this test
    it('should call patientPreventiveCareFactory.PreventiveCareServices if preventiveCareServices not already loaded', function () {
      scope.preventiveCareServices = null;
      q = deferredObject;
      ctrl.getPreventiveServiceInfo(personId);
      //expect(patientPreventiveCareFactory.PreventiveCareServices).toHaveBeenCalledWith(personId, true);
    });
  });

  describe('ctrl.plannedServicesContains', function () {
    var serviceToCheck = { ServiceTransactionId: null };
    beforeEach(function () {
      scope.plannedServiceIds = [22, 23, 24];
    });

    it('should return true if scope.plannedServiceIds contains serviceToCheck.ServiceTransactionId', function () {
      serviceToCheck.ServiceTransactionId = 22;
      expect(ctrl.plannedServicesContains(serviceToCheck)).toBe(true);
    });

    it('should return false if scope.plannedServiceIds does not contain serviceToCheck.ServiceTransactionId', function () {
      serviceToCheck.ServiceTransactionId = 44;
      expect(ctrl.plannedServicesContains(serviceToCheck)).toBe(false);
    });
  });

  describe('ctrl.finishAppointmentOnFailure method -> ', function () {
    var failedResponse = {};
    beforeEach(function () {
      scope.activeAppointment = { PlannedServices: [] };
      failedResponse = {
        data: {
          InvalidProperties: [],
        },
        config: {
          data: {
            PlannedServices: [],
          },
        },
      };
      spyOn(ctrl, 'getPlannedServiceCodes').and.callFake(function () {});
    });

    it('should call ctrl.checkAppointmentFailedOnPlannedService to see if service code failed ', function () {
      spyOn(ctrl, 'checkAppointmentFailedOnPlannedService');
      ctrl.finishAppointmentOnFailure(failedResponse);
      expect(ctrl.checkAppointmentFailedOnPlannedService).toHaveBeenCalledWith(
        failedResponse
      );
    });

    it('should show regular toastr if ctrl.checkAppointmentFailedOnPlannedService returns true ', function () {
      spyOn(ctrl, 'checkAppointmentFailedOnPlannedService').and.returnValue(
        true
      );
      ctrl.finishAppointmentOnFailure(failedResponse);
      expect(toastrFactory.error).not.toHaveBeenCalled();
    });

    it('should not show regular toastr if ctrl.checkAppointmentFailedOnPlannedService returns false ', function () {
      spyOn(ctrl, 'checkAppointmentFailedOnPlannedService').and.returnValue(
        false
      );
      ctrl.finishAppointmentOnFailure(failedResponse);
      expect(toastrFactory.error).toHaveBeenCalled();
    });

    it('should call ctrl.getPlannedServiceCodes to reload dynamic properties', function () {
      ctrl.finishAppointmentOnFailure(failedResponse);
      expect(ctrl.getPlannedServiceCodes).toHaveBeenCalledWith(
        scope.activeAppointment
      );
    });
  });

  describe('ctrl.checkAppointmentFailedOnPlannedService method -> ', function () {
    var failedResponse = {};
    beforeEach(function () {
      failedResponse = {
        data: {
          InvalidProperties: [
            {
              PropertyName: 'ServiceCodeId',
              ValidationMessage:
                "Tooth '' is not valid for service code '6160575a-13f3-4bc5-8bff-cf930a770695' affected area.",
            },
          ],
        },
        config: {
          data: {
            PlannedServices: {
              ServiceCodeId: '6160575a-13f3-4bc5-8bff-cf930a770695',
              AffectedAreaId: 1,
              Description:
                'D0120: periodic oral evaluation - established patient (D0120)',
            },
          },
        },
      };
    });

    it('should return true if failedResponse contains invalidProperties.Property equal to ServiceCodeId  ', function () {
      var returnValue = ctrl.checkAppointmentFailedOnPlannedService(
        failedResponse
      );
      expect(returnValue).toBe(true);
    });

    it('should return false if failedResponse does not contain invalidProperties.Property equal to ServiceCodeId  ', function () {
      failedResponse.data.InvalidProperties[0].PropertyName = 'SomethingElse';
      var returnValue = ctrl.checkAppointmentFailedOnPlannedService(
        failedResponse
      );
      expect(returnValue).toBe(false);
    });

    it('should show invalid service toastr if failedResponse contains invalidProperties.Property equal to ServiceCodeId  ', function () {
      ctrl.checkAppointmentFailedOnPlannedService(failedResponse);
      expect(toastrFactory.error).toHaveBeenCalled();
    });

    it('should not show invalid service toastr if failedResponse does not contain invalidProperties.Property equal to ServiceCodeId  ', function () {
      failedResponse.data.InvalidProperties[0].PropertyName = 'SomethingElse';
      ctrl.checkAppointmentFailedOnPlannedService(failedResponse);
      expect(toastrFactory.error).not.toHaveBeenCalled();
    });

    describe('openFinishedAppointmentModal function ->', function () {
      it('should open Finished Appointment Modal', function () {
        scope.openEditPersonalModal();
        expect(modalFactory.PersonalModal).toHaveBeenCalled();
      });
    });
  });

  describe('scope.modalAddService -->', function () {
    it('Should passing an empty array', function () {
      scope.modalAddService([]);
      expect(ctrl.servicesToAdd.length).toBe(0);
    });
    it('Should set service status to accepted', function () {
      spyOn(scope, 'openToothCtrls');
      scope.modalAddService([
        {
          AppointmentId: '60cdf58f-6b17-49bf-9846-18e290c136d1',
          LocationId: 10002,
          CreatedDate: '2018-11-14T19:27:20.5525516',
          ServiceTransactionId: '47b70b57-5227-43cd-87b5-3fe62691d478',
          EnteredByUserId: 'd0be7456-e01b-e811-b7c1-a4db3021bfa0',
          ServiceTransactionStatusId: 7,
        },
        {
          AppointmentId: '60cdf58f-6b17-49bf-9846-18e290c145d1',
          LocationId: 10002,
          CreatedDate: '2018-11-14T19:27:20.5527716',
          ServiceTransactionId: '47b70b57-5227-43cd-87b5-3fe63691d478',
          EnteredByUserId: 'd0be7456-e01b-e811-b7c1-a4db3044bfa0',
          ServiceTransactionStatusId: 7,
        },
      ]);
      expect(ctrl.servicesToAdd.length).toBe(2);
      expect(
        ctrl.servicesToAdd[ctrl.servicesToAdd.length - 1]
          .ServiceTransactionStatusId
      ).toBe(7);
    });
  });

  describe('scope.addServices-->', function () {
    it('Should not Add services when useModal is false', function () {
      spyOn(ctrl, 'addQueue');
      var transactions = [];
      var useModal = false;
      scope.addServices(transactions, useModal);
      expect(ctrl.addQueue).not.toHaveBeenCalled();
    });

    it('Should Add services when useModal is true', function () {
      spyOn(ctrl, 'addQueue');
      spyOn(scope, 'modalAddService');
      var transactions = [
        {
          AppointmentId: '60cdf58f-6b17-49bf-9846-18e290c136d1',
          LocationId: 10002,
          CreatedDate: '2018-11-14T19:27:20.5525516',
          ServiceTransactionId: '47b70b57-5227-43cd-87b5-3fe62691d478',
          EnteredByUserId: 'd0be7456-e01b-e811-b7c1-a4db3021bfa0',
          ServiceTransactionStatusId: 1,
        },
      ];
      scope.plannedServiceIds = ['d0be7456-e01b-e811-b7c1-a4db3021bfa0'];
      scope.activeAppointment = {
        AppointmentTypeId: '00000000-0000-0000-0000-000000000000',
        LocationId: 10002,
      };
      var useModal = true;
      scope.addServices(transactions, useModal);
      expect(scope.modalAddService).toHaveBeenCalled();
      expect(transactions[0].ServiceTransactionStatusId).toBe(7);
    });
  });
});
