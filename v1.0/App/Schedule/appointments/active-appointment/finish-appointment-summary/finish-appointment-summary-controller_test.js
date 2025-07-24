describe('FinishAppointmentSummaryController ->', function () {
  var ctrl,
    scope,
    rootScope,
    routeParams,
    patSecurityService,
    modalDataFactory,
    modalFactory,
    listHelper;
  var dataForModal,
    usersFactory,
    appointmentTypesService,
    scheduleServices,
    filter;
  var modalDataFactoryDeferred,
    uibModalInstance,
    referenceDataService,
    locationService;

  var location = {
    url: jasmine.createSpy(),
    path: jasmine.createSpy(),
  };

  beforeEach(
    module('Soar.BusinessCenter', function ($provide) {
      let currentLocation = { id: '1234' };
      locationService = {
        getCurrentLocation: jasmine
          .createSpy()
          .and.returnValue(currentLocation),
      };
      $provide.value('locationService', locationService);
    })
  );

  beforeEach(
    module('Soar.Schedule', function ($provide) {
      uibModalInstance = {
        result: {
          then: jasmine.createSpy(),
        },
        close: jasmine.createSpy(),
        dismiss: jasmine.createSpy(),
      };
      $provide.value('$uibModalInstance', uibModalInstance);

      referenceDataService = {
        get: jasmine.createSpy().and.returnValue({}),
        entityNames: {
          appointmentTypes: 'appointmentTypes',
          serviceCodes: 'serviceCodes',
        },
      };
      $provide.value('referenceDataService', referenceDataService);

      //mock for appointmentTypesService
      appointmentTypesService = {
        getAppointmentTypeById: jasmine.createSpy(
          'appointmentTypesService.getAppointmentTypeById'
        ),
      };
      $provide.value('AppointmentTypesService', appointmentTypesService);

      //mock for usersFactory
      usersFactory = {
        Users: jasmine
          .createSpy('usersFactory.Users')
          .and.returnValue({ then: function () {} }),
      };
      $provide.value('UsersFactory', usersFactory);

      scheduleServices = {
        Dtos: {
          TreatmentRooms: {
            get: jasmine.createSpy(),
          },
        },
      };
      $provide.value('ScheduleServices', scheduleServices);
    })
  );

  beforeEach(module('Soar.Common'));
  beforeEach(module('common.factories'));
  beforeEach(module('Soar.Schedule'));

  var serviceCodeMock = {
    DisplayAs: 'PerEx',
  };

  // create controller and scope
  beforeEach(inject(function ($rootScope, $controller, $q, $filter, $compile) {
    rootScope = $rootScope;
    ctrl = $controller;
    scope = $rootScope.$new();
    filter = $filter;
    dataForModal = {
      PatientInfo: {
        FirstName: 'Bob',
        PreferredName: null,
        MiddleName: null,
        SuffixName: 'DDS',
        LastName: 'Kally', //"Bob Kally, DDS
      },
      Appointment: {
        AppointmentTypeId: '1',
        TreatmentRoomId: '2',
        ActualStartTime: '2018-08-23 17:30:00.0000000',
        ActualEndTime: '2018-08-23 18:30:00.0000000',
        PlannedServices: [
          { Fee: '8.00', ServiceCodeId: '12234' },
          { Fee: '13.00', ServiceCodeId: '78654' },
        ],
        ProviderAppointments: [{ UserId: '1' }, { UserId: '2' }],
      },
      Encounter: {
        ServiceTransactionDtos: [
          {
            ProviderUserId: '12',
            Amount: 200,
            InsuranceEstimates: [{ EstInsurance: 30 }],
            TotalEstInsurance: 30,
          },
          {
            ProviderUserId: '78',
            Amount: 300,
            InsuranceEstimates: [{ EstInsurance: 40 }],
            TotalEstInsurance: 40,
          },
        ],
      },
    };

    //mock for routeParams
    routeParams = {
      patientId: '2',
    };

    //mock for modalDataFactory
    modalDataFactory = {
      GetCheckoutModalData: jasmine
        .createSpy('modalDataFactory.GetCheckoutModalData')
        .and.callFake(function () {
          modalDataFactoryDeferred = $q.defer();
          modalDataFactoryDeferred.resolve(1);
          return {
            result: modalDataFactoryDeferred.promise,
            then: function () {},
          };
        }),
    };

    // //mock for toastrFactory
    // toastrFactory = {
    //     success: jasmine.createSpy(),
    //     error: jasmine.createSpy()
    // };

    //mock for listHelper
    listHelper = {
      findItemByFieldValue: jasmine
        .createSpy('listHelper.findItemByFieldValue')
        .and.returnValue({
          UserId: '1',
          FirstName: 'Raveendra',
          LastName: 'koochi',
        }),
    };

    //mock for patSecurityService
    patSecurityService = {
      IsAuthorizedByAbbreviation: jasmine.createSpy().and.returnValue(true),
    };

    let locations = [
      {
        id: '1234',
        name: 'Location1234',
        practiceid: '7',
        timezone: 'Central Standard Time',
      },
    ];
    sessionStorage.setItem('activeLocations', JSON.stringify(locations));

    // create controller
    ctrl = $controller('FinishAppointmentSummaryController', {
      $scope: scope,
      $rootScope: rootScope,
      $routeParams: routeParams,
      ListHelper: listHelper,
      ModalDataFactory: modalDataFactory,
      patSecurityService: patSecurityService,
      ModalFactory: modalFactory,
      $uibModalInstance: uibModalInstance,
      DataForModal: dataForModal,
      toastrFactory: _toastr_,
      $location: location,
      $filter: filter,
    });
  }));
  //controller
  it('FinishAppointmentSummaryController : should check if controller exists', function () {
    expect(ctrl).not.toBeNull();
    expect(ctrl).not.toBeUndefined();
  });

  describe('ctrl.getPatientDisplayName function ->', function () {
    it('should return patient name', function () {
      scope.actApptActive = false;
      var result = ctrl.getPatientDisplayName();
      expect(result).toEqual('Bob Kally, DDS');
    });
  });

  describe('ctrl.getAppointmentType function ->', function () {
    var res = {};
    beforeEach(function () {
      var appointmentTypes = [
        { AppointmentTypeId: 22, Name: 'First AppointmentType' },
        { AppointmentTypeId: 33, Name: 'Second AppointmentType' },
        { AppointmentTypeId: 44, Name: 'Third AppointmentType' },
      ];
      res = { Value: appointmentTypes };
      scope.loading = { AppointmentType: true };
    });
    it('should call appointmentTypesService.getAppointmentTypeById', function () {
      var appointmentTypeId = '1';
      ctrl.getAppointmentType(appointmentTypeId);
      expect(referenceDataService.get).toHaveBeenCalled();
    });
  });

  describe('ctrl.getTreatmentRoom function ->', function () {
    it('should call appointmentTypesService.getAppointmentTypeById', function () {
      ctrl.getTreatmentRoom('1234');
      expect(scheduleServices.Dtos.TreatmentRooms.get).toHaveBeenCalled();
      expect(scope.loading.TreatmentRoom).toBe(true);
    });
  });

  describe('ctrl.getTreatmentRoomSuccess function ->', function () {
    it('should set TreatmentRoomName', function () {
      var successResponse = { Value: { Name: 'Practice Room' } };
      ctrl.getTreatmentRoomSuccess(successResponse);
      expect(scope.appointment.TreatmentRoomName).toEqual(
        successResponse.Value.Name
      );
      expect(scope.loading.TreatmentRoom).toBe(false);
    });
  });

  describe('ctrl.getTreatmentRoomFailure function ->', function () {
    it('should call toastrFactory.error', function () {
      ctrl.getTreatmentRoomFailure();
      expect(_toastr_.error).toHaveBeenCalled();
      expect(scope.appointment.TreatmentRoomName).toEqual('');
      expect(scope.loading.TreatmentRoom).toBe(false);
    });
  });

  describe('ctrl.getProviders function ->', function () {
    it('should call usersFactory.Users', function () {
      ctrl.getProviders();
      expect(usersFactory.Users).toHaveBeenCalled();
    });
  });

  describe('ctrl.getProvidersSuccess function ->', function () {
    it('should call getProviderName', function () {
      var successResponse = { Value: '1' };
      spyOn(ctrl, 'getProviderName');
      ctrl.getProvidersSuccess(successResponse);
      expect(ctrl.providers).toEqual(successResponse.Value);
      expect(ctrl.getProviderName).toHaveBeenCalled();
    });
  });

  describe('ctrl.getProvidersFailure function ->', function () {
    it('should call toastrFactory.error', function () {
      ctrl.getProvidersFailure();
      expect(ctrl.providers.length).toEqual(0);
      expect(_toastr_.error).toHaveBeenCalled();
    });
  });

  describe('ctrl.getProviderName function ->', function () {
    it('should set scope.appointment.ProviderName if providerUserId is not null', function () {
      var providerUserId = '1';
      ctrl.providers = [
        { UserId: '2', FirstName: 'Raveendra' },
        { UserId: '1', FirstName: 'Raveendra', LastName: 'koochi' },
      ];
      ctrl.getProviderName(providerUserId);
      expect(scope.appointment.ProviderName).toEqual('Raveendra koochi');
    });
  });

  describe('scope.closeModal function ->', function () {
    it('should call uibModalInstance.close', function () {
      scope.closeModal();
      expect(uibModalInstance.close).toHaveBeenCalled();
      expect(scope.disableBtn).toBe(true);
    });
  });

  describe('ctrl.getServiceCodes function ->', function () {
    beforeEach(function () {
      ctrl.processAppointmentServices = jasmine.createSpy();
    });

    it('should call referenceDataService.get', function () {
      ctrl.getServiceCodes();
      expect(referenceDataService.get).toHaveBeenCalled();
      expect(ctrl.processAppointmentServices).toHaveBeenCalled();
    });
  });

  describe('scope.scheduleNextAppt function ->', function () {
    it('should call referenceDataService.get', function () {
      scope.scheduleNextAppt();
      expect(uibModalInstance.close).toHaveBeenCalled();
    });
  });

  describe('ctrl.getPatientPortionWithEstimatedInsurance function ->', function () {
    it('should call referenceDataService.get', function () {
      ctrl.getPatientPortionWithEstimatedInsurance();
      expect(scope.amount).toEqual(1000);
      expect(scope.estInsurance).toEqual(140);
      expect(scope.patientPortion).toEqual(860);
    });
  });

  //describe('scope.checkout function ->', function () {
  //    it('should call modalDataFactory.GetCheckoutModalData if has access to encounter', function () {
  //        ctrl.pendingEncounter = {
  //            ServiceTransactionDtos: [{ LocationId: '1' }, { LocationId: '2' }]
  //        };
  //        ctrl.dataForModal = {};
  //        scope.checkout();
  //        expect(modalDataFactory.GetCheckoutModalData).toHaveBeenCalled();
  //    });

  //    it('should call notifyNotAuthorized if doesnt have access to encounter', function () {
  //        spyOn(ctrl, 'notifyNotAuthorized');
  //        ctrl.pendingEncounter = {
  //            ServiceTransactionDtos: [{ LocationId: '1' }, { LocationId: '2' }]
  //        };
  //        patSecurityService.IsAuthorizedByAbbreviation = jasmine.createSpy().and.returnValue(false);
  //        ctrl.dataForModal = {};
  //        scope.checkout();
  //        expect(ctrl.notifyNotAuthorized).toHaveBeenCalled();
  //    });
  //});

  describe('ctrl.checkoutModalResultOk function ->', function () {
    it('should call uibModalInstance.close and rootScope.$broadcast', function () {
      spyOn(rootScope, '$broadcast');
      ctrl.checkoutModalResultOk();
      expect(rootScope.$broadcast).toHaveBeenCalledWith(
        'appointment:update-appointment',
        null
      );
    });
  });

  describe('ctrl.notifyNotAuthorized function ->', function () {
    it('should throw toastrFactory.error', function () {
      ctrl.notifyNotAuthorized();
      expect(_toastr_.error).toHaveBeenCalled();
    });
  });

  describe('ctrl.init function ->', function () {
    it('should call initialize all functions', function () {
      spyOn(ctrl, 'getPatientDisplayName');
      spyOn(ctrl, 'getAppointmentType');
      spyOn(ctrl, 'getTreatmentRoom');
      spyOn(ctrl, 'getServiceCodes');
      spyOn(ctrl, 'getProviders');
      spyOn(ctrl, 'getPatientPortionWithEstimatedInsurance');
      spyOn(ctrl, 'getDisplayDates');
      ctrl.init();
      expect(ctrl.getPatientDisplayName).toHaveBeenCalled();
      expect(ctrl.getAppointmentType).toHaveBeenCalled();
      expect(ctrl.getTreatmentRoom).toHaveBeenCalled();
      expect(ctrl.getServiceCodes).toHaveBeenCalled();
      expect(ctrl.getProviders).toHaveBeenCalled();
      expect(ctrl.getDisplayDates).toHaveBeenCalled();
    });
  });

  describe('ctrl.getDisplayDates function ->', function () {
    beforeEach(function () {});
    it('it should convert ActualStartTime and ActualEndTime to local display dates', function () {
      ctrl.getDisplayDates();
      expect(scope.appointmentActualStartTime).toEqual(
        scope.appointment.ActualStartTime + 'Z'
      );
      expect(scope.appointmentActualEndTime).toEqual(
        scope.appointment.ActualEndTime + 'Z'
      );
    });

    it('it not add extra z if ActualStartTime and ActualEndTime already contain it', function () {
      ctrl.getDisplayDates();
      scope.appointment.ActualStartTime =
        scope.appointment.ActualStartTime + 'Z';
      scope.appointment.ActualEndTime = scope.appointment.ActualEndTime + 'Z';
      expect(scope.appointmentActualStartTime).toEqual(
        scope.appointment.ActualStartTime
      );
      expect(scope.appointmentActualEndTime).toEqual(
        scope.appointment.ActualEndTime
      );
    });
  });

  describe('scope.checkout_v2 function ->', function () {
    beforeEach(function () {
      ctrl.patientInfo = { PersonAccount: { AccountId: '5555' } };
      scope.appointment = {
        LocationId: '1234',
        AppointmentId: '3333',
        PersonId: '9999',
      };
      ctrl.pendingEncounter = {
        EncounterId: '1234',
        needsUserChange: true,
        ServiceTransactionDtos: [{}, {}],
      };
    });
    it('it should redirect to AccountSummary if and appointment.needsUserChange is true', function () {
      scope.appointment.needsUserChange = true;
      scope.checkout_v2();
      expect(location.url).toHaveBeenCalledWith(
        '/Patient/' +
          scope.appointment.PersonId +
          '/Account/' +
          ctrl.patientInfo.PersonAccount.AccountId +
          '/Encounter/1234/EncountersCart/AccountSummary?appt=3333'
      );
    });
    it('it should redirect to Clinical if appointment.needsUserChange is false', function () {
      scope.appointment.needsUserChange = false;
      scope.checkout_v2();
      expect(location.url).toHaveBeenCalledWith(
        '/Patient/' +
          scope.appointment.PersonId +
          '/Account/' +
          ctrl.patientInfo.PersonAccount.AccountId +
          '/Encounter/1234/Checkout/Clinical'
      );
    });
  });
});
