import { of } from 'rxjs';

describe('patient-appointments directive controller ->', function () {
  var scope,
    ctrl,
    mockStaticData,
    mockListHelper,
    mockLocalize,
    rootScope,
    mockModalFactory,
    apiDefinitions,
    shareData,
    mockTimeZoneFactory,
    mockPatientValidationFactory;

  var preventiveCareService,
    mockPatientServices,
    mockScheduleServices,
    mockScheduleViewService,
    mockSchedulerServiceThen,
    mockSchedulerServiceError,
    mockUsersFactory,
    mockModalDataFactory,
    mockResourceService,
    mockAppointmentService,
    mockAppointmentResource,
    referenceDataService,
    patientPreventiveCareFactory,
    appointmentViewDataLoadingService,
    appointmentViewVisibleService,
    appointmentTimeService,
    appointmentViewLoadingService,
    appointmentStatusService,
    patientAppointmentsFactory;

  var mockStatusList = [
    { Id: 'A', Description: 'First', Icon: 'This Icon' },
    { Id: 'M', Description: 'Second', Icon: 'That Icon' },
    { Id: 'Z', Description: 'Third', Icon: 'The Other Icon' },
  ];

  var mockAppointmentOverviewResult = [
    {
      AppointmentId: 'ApptGuid1',
      StartTime: 'Right away',
      EndTime: 'Soon',
      ProposedDuration: 30,
      Classification: 0,
      Status: 1,
      UserId: null,
      LocationId: 1,
      Patient: { FirstName: 'FirstName' },
      PersonId: 'PatientGuid1',
      ProviderId: 'ProviderGuid1',
      TreatmentRoomId: 'RoomGuid1',
      AppointmentType: {
        Name: 'No Appointment Type',
        AppointmentTypeColor: 'rgba(100, 100, 100, 0.34902)',
        FontColor: 'rgb(0, 0, 0)',
      },
      Room: { Name: 'Room1' },
      Provider: {
        Name: 'Awesome Dentist DDS',
        IsActive: true,
        ProviderTypeId: 0,
      },
      Location: {
        NameAbbreviation: 'loc',
        Timezone: 'Central Daylight Time',
      },
      DataTag: 'dtag1',
      ProviderAppointments: [],
    },
    {
      AppointmentId: 'ApptGuid2',
      StartTime: null,
      EndTime: null,
      ProposedDuration: 0,
      Classification: 2,
      Status: 0,
      TreatmentRoomId: null,
      UserId: 'ProviderGuid1',
      LocationId: 1,
      Patient: { FirstName: 'FirstName' },
      PersonId: 'PatientGuid1',
      AppointmentType: {
        Name: 'Drill and Fill',
        AppointmentTypeColor: 'rgba(10, 10, 10, 0.5)',
        FontColor: 'rgb(0, 0, 0)',
      },
      Room: null,
      ProviderId: null,
      Provider: {
        Name: 'Assign Provider',
        IsActive: false,
        ProviderTypeId: 0,
      },
      Location: {
        NameAbbreviation: 'loc',
        Timezone: 'Central Daylight Time',
      },
      DataTag: 'dtag2',
      ProviderAppointments: [],
    },
  ];

  var mockAppointmentModalResult = {
    AppointmentId: 'ApptGuid3',
    AppointmentTypeId: 'ApptTypeGuid3',
    StartTime: 'later today',
    EndTime: 'half hourish later',
    ProposedDuration: 30,
    Classification: 0,
    Satus: 2,
    TreatmentRoomId: 'RoomGuid2',
    UserId: null,
    LocationId: 1,
    Patient: {
      PatientId: 'PatientGuid1',
      FirstName: 'FirstName',
    },
    ProviderAppointments: [
      {
        UserId: 'ProviderGuid1',
      },
    ],
    DataTag: 'dtag3',
  };

  var mockNewAppointmentOverview = {
    AppointmentId: 'ApptGuid4',
    StartTime: null,
    EndTime: null,
    ProposedDuration: 0,
    Classification: 2,
    Status: 0,
    TreatmentRoomId: null,
    UserId: 'ProviderGuid1',
    LocationId: 1,
    Patient: { FirstName: 'FirstName' },
    PersonId: 'PatientGuid1',
    AppointmentType: {
      Name: 'Perio Scour',
      AppointmentTypeColor: 'rgba(40, 40, 40, 0.5)',
      FontColor: 'rgb(0, 0, 0)',
    },
    Room: null,
    ProviderId: null,
    Provider: {
      Name: 'Assign Provider',
      IsActive: false,
      ProviderTypeId: 0,
    },
    Location: {
      NameAbbreviation: 'loc',
      Timezone: 'Central Daylight Time',
    },
    DataTag: 'dtag3',
    ProviderAppointments: [],
  };

  var mockUsers = [
    {
      UserId: 'ProviderGuid0',
      FirstName: 'Doug',
      LastName: 'Zero',
      ProfessionalDesignation: 'DDS',
      ProviderTypeId: 0,
      IsActive: false,
    },
    {
      UserId: 'ProviderGuid1',
      FirstName: 'Guy',
      LastName: 'Smiley',
      ProfessionalDesignation: 'DDS',
      ProviderTypeId: 0,
      IsActive: true,
    },
  ];

  var mockLocations = [
    {
      LocationId: 1,
      NameAbbreviation: 'Here',
      Timezone: 'Eastern Daylight Time',
    },
  ];

  var mockAppointmentTypes = [
    {
      AppointmentTypeId: 'ApptTypeGuid1',
      Name: 'Checkup',
      AppointmentTypeColor: 'rgba(100, 100, 100, 0.34902)',
      FontColor: 'rgb(0, 0, 0)',
    },
    {
      AppointmentTypeId: 'ApptTypeGuid2',
      Name: 'Root Canal',
      AppointmentTypeColor: 'rgba(200, 200, 200, 0.34902)',
      FontColor: 'rgb(0, 0, 0)',
    },
    {
      AppointmentTypeId: 'ApptTypeGuid3',
      Name: 'Flouride',
      AppointmentTypeColor: 'rgba(300, 300, 300, 0.34902)',
      FontColor: 'rgb(0, 0, 0)',
    },
  ];

  var mockRooms = [
    {
      RoomId: 'RoomGuid1',
      Name: 'RoomOne',
    },
    {
      RoomId: 'RoomGuid2',
      Name: 'RoomTwo',
    },
  ];

  var mockPracticeSettings = {
    DefaultTimeIncrement: 15,
  };

  var mockCustomEvents = {
    AppointmentsUpdated: 'appointments updated event',
  };

  var mockSaveStates = {
    None: 'None',
    Add: 'Add',
    Update: 'Update',
    Delete: 'Delete',
    Failed: 'Failed',
  };

  beforeEach(module('kendo.directives'));
  beforeEach(
    module('Soar.Common', function ($provide) {
      preventiveCareService = {
        accessForServiceType: jasmine.createSpy().and.returnValue({}),
        accessForServiceCode: jasmine.createSpy().and.returnValue({}),
        GetPreventiveServicesForServiceType: jasmine
          .createSpy()
          .and.returnValue({
            then: jasmine.createSpy(),
          }),
      };
      $provide.value('PreventiveCareService', preventiveCareService);

      let featureFlagService = jasmine.createSpyObj('FeatureFlagService', ['getOnce$']);
      featureFlagService.getOnce$.and.returnValue(of(false));
      $provide.value('FeatureFlagService', featureFlagService);

      let scheduleMFENavigator = jasmine.createSpyObj('schedulingMFENavigator', ['navigateToAppointmentModal']);
      $provide.value('schedulingMFENavigator', scheduleMFENavigator);
    })
  );
  beforeEach(module('common.factories'));
  beforeEach(module('common.directives'));
  beforeEach(module('Soar.BusinessCenter'));
  beforeEach(
    module('Soar.Schedule', function ($provide) {
      mockAppointmentResource = {};

      mockResourceService = {
        Appointment: jasmine
          .createSpy()
          .and.returnValue(mockAppointmentResource),
      };

      $provide.value('ResourceService', mockResourceService);

      mockAppointmentService = {
        AppendDetails: jasmine.createSpy(),
        FlagAppointmentsAsLateIfNeeded: jasmine.createSpy(),
      };

      $provide.value('AppointmentService', mockAppointmentService);

      mockPatientValidationFactory = {
        GetAllAccountValidation: jasmine.createSpy().and.returnValue([]),
        PatientSearchValidation: jasmine
          .createSpy()
          .and.returnValue({ then: function () {} }),
      };
      $provide.value('PatientValidationFactory', mockPatientValidationFactory);
      
      referenceDataService = {
        entityNames: {
          practiceSettings: 'practiceSettings',
          appointmentTypes: 'apptTypes',
          rooms: 'rooms',
          users: 'users',
          locations: 'locations',
        },
        getData: jasmine.createSpy().
          and.returnValue({ then: function () {} }),
        get: function (refType) {
          if (refType === 'apptTypes') {
            return mockAppointmentTypes;
          } else if (refType === 'rooms') {
            return mockRooms;
          } else if (refType === 'users') {
            return mockUsers;
          } else if (refType === 'locations') {
            return mockLocations;
          } else if (refType === 'practiceSettings') {
            return mockPracticeSettings;
          } else {
            return {};
          }
        },
      };
      $provide.value('referenceDataService', referenceDataService);

      patientPreventiveCareFactory = {};
      $provide.value(
        'PatientPreventiveCareFactory',
        patientPreventiveCareFactory
      );

      appointmentViewVisibleService = {
        changeAppointmentViewVisible: jasmine.createSpy(),
      };
      $provide.value(
        'AppointmentViewVisibleService',
        appointmentViewVisibleService
      );

      appointmentViewLoadingService = {
        //changeAppointmentViewVisible: jasmine.createSpy()
      };
      $provide.value(
        'AppointmentViewLoadingService',
        appointmentViewLoadingService
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

      appointmentTimeService = {
        convertAppointmentDates: function (appt) {
          return appt;
        },
      };

      $provide.value('AppointmentTimeService', appointmentTimeService);

      appointmentStatusService = {
        //changeAppointmentViewVisible: jasmine.createSpy()
      };
      $provide.value('AppointmentStatusService', appointmentStatusService);

      patientAppointmentsFactory = {};
      $provide.value('PatientAppointmentsFactory', patientAppointmentsFactory);
    })
  );

  beforeEach(inject(function ($rootScope, $controller) {
    scope = $rootScope.$new();
    rootScope = $rootScope;

    mockStaticData = {
      AppointmentStatuses: jasmine
        .createSpy()
        .and.returnValue(angular.copy(mockStatusList)),
    };

    mockListHelper = {
      findIndexByFieldValue: jasmine
        .createSpy()
        .and.returnValue(angular.copy(mockStatusList[1])),
      findItemByFieldValue: jasmine
        .createSpy()
        .and.returnValue(angular.copy(mockStatusList[1])),
    };

    mockPatientServices = {
      PatientAppointment: {
        OverviewByAccount: jasmine
          .createSpy()
          .and.returnValue([angular.copy(mockAppointmentOverviewResult)]),
        OverviewByPatient: jasmine
          .createSpy()
          .and.returnValue([angular.copy(mockAppointmentOverviewResult)]),
      },
    };

    mockLocalize = {
      getLocalizedString: jasmine
        .createSpy()
        .and.returnValue('localized string'),
    };

    mockSchedulerServiceError = {
      error: jasmine.createSpy(),
    };

    mockSchedulerServiceThen = {
      then: jasmine.createSpy().and.returnValue(mockSchedulerServiceError),
    };

    mockScheduleViewService = {
      Appointments: {
        GetAppointmentEditDataRefactor: jasmine
          .createSpy()
          .and.returnValue(mockSchedulerServiceThen),
      },
    };

    apiDefinitions = {};

    shareData = {};

    mockModalFactory = {
      AppointmentDeleteModal: jasmine.createSpy().and.returnValue({
        then: jasmine.createSpy(),
      }),
      AppointmentModal: jasmine.createSpy().and.returnValue({
        then: jasmine.createSpy(),
      }),
    };

    mockScheduleServices = {
      Dtos: {
        Appointment: {
          Operations: {
            Retrieve: jasmine
              .createSpy()
              .and.returnValue({ $promise: { then: function () {} } }),
            Update: jasmine.createSpy(),
            Delete: jasmine.createSpy(),
          },
        },
      },
    };

    mockUsersFactory = {
      Users: jasmine.createSpy().and.returnValue({ then: function () {} }),
    };

    mockModalDataFactory = {
      GetAppointmentEditDataRefactor: jasmine
        .createSpy()
        .and.returnValue({ then: jasmine.createSpy() }),
    };
    mockTimeZoneFactory = {
      ConvertAppointmentDatesTZ: jasmine.createSpy(),
      ResetAppointmentDates: jasmine.createSpy(),
    };

    ctrl = $controller('PatientAppointmentsController', {
      $scope: scope,
      localize: mockLocalize,
      ListHelper: mockListHelper,
      PatientServices: mockPatientServices,
      StaticData: mockStaticData,
      ScheduleViews: mockScheduleViewService,
      ModalFactory: mockModalFactory,
      ScheduleServices: mockScheduleServices,
      UsersFactory: mockUsersFactory,
      ModalDataFactory: mockModalDataFactory,
      CustomEvents: mockCustomEvents,
      saveStates: mockSaveStates,
      ApiDefinitions: apiDefinitions,
      ShareData: shareData,
      TimeZoneFactory: mockTimeZoneFactory,
    });

    scope.statusList = {
      Enum: mockStatusList,
    };
  }));

  it('should initialize the controller', function () {
    expect(ctrl).not.toBeNull();
  });

  describe('ctrl.setSectionTitle function ->', function () {
    beforeEach(function () {
      scope.title = 'originalTitle';
      scope.id = 'originalId';
    });

    it('should set title and id when showAppointments is All', function () {
      scope.showAppointments = 'All';

      ctrl.setSectionTitle();

      expect(scope.title).toBe('Appointments');
      expect(scope.id).toBe('appointmentsSection');
    });

    it('should set title and id when showAppointments is Scheduled', function () {
      scope.showAppointments = 'Scheduled';

      ctrl.setSectionTitle();

      expect(scope.title).toBe('Scheduled Appointments');
      expect(scope.id).toBe('scheduledAppointmentsSection');
    });

    it('should set title and id when showAppointments is Unscheduled', function () {
      scope.showAppointments = 'Unscheduled';

      ctrl.setSectionTitle();

      expect(scope.title).toBe('Unscheduled Appointments');
      expect(scope.id).toBe('unscheduledAppointmentsSection');
    });

    it('should take no action when showAppointments is another value', function () {
      scope.showAppointments = 'UnrecognizedValue';

      ctrl.setSectionTitle();

      expect(scope.title).toBe('originalTitle');
      expect(scope.id).toBe('originalId');
    });
  });

  describe('appointmentRetrievalSuccess ->', function () {
    beforeEach(function () {
      ctrl.getPatientAppointmentsCount = jasmine
        .createSpy()
        .and.returnValue(123);

      ctrl.updateViewAppointmentActionText = jasmine.createSpy();
      ctrl.counter = jasmine.createSpy();

      ctrl.appointmentRetrievalSuccess({
        Value: angular.copy(mockAppointmentOverviewResult),
      });
    });

    it('should set loading to false', function () {
      expect(scope.loading).toEqual(false);
    });

    it('should call updateViewAppointmentActionText', function () {
      expect(ctrl.updateViewAppointmentActionText).toHaveBeenCalled();
      expect(ctrl.counter).toHaveBeenCalled();
      expect(
        mockAppointmentService.FlagAppointmentsAsLateIfNeeded
      ).toHaveBeenCalled();
    });
  });

  describe('appointmentRetrievalFailed ->', function () {
    beforeEach(function () {
      ctrl.ShowErrorMessage = jasmine.createSpy();
    });

    it('should call localize.getLocalizedString', function () {
      ctrl.appointmentRetrievalFailed();

      expect(mockLocalize.getLocalizedString).toHaveBeenCalled();
    });

    it('should call ShowErrorMessage with the result of the localize.getLocalizedString function', function () {
      ctrl.appointmentRetrievalFailed();

      expect(ctrl.ShowErrorMessage).toHaveBeenCalledWith('localized string');
    });
  });

  describe('getPatientAppointmentsCount ->', function () {
    it('should count the number of appointments matching the patient id and return the result', function () {
      scope.patientId = 'Z';
      scope.accountView = true;
      scope.showAppointments = 'All';
      scope.appointments = [
        { PersonId: 'A' },
        { PersonId: 'Z' },
        { PersonId: 'B' },
        { PersonId: 'Z' },
        { PersonId: 'C' },
      ];

      var result = ctrl.getPatientAppointmentsCount();

      expect(result).toEqual(2);
    });
  });

  describe('appendPatientData ->', function () {
    var appointment;

    beforeEach(function () {
      appointment = {};
    });

    it('when the patient is null, it should set appointment.Patient to an empty object', function () {
      ctrl.appendPatientData(appointment);

      expect(appointment.Patient).toEqual({});
    });

    it('when the patient is NOT null, it should set appointment.Patient to the patient object', function () {
      var patient = {
        FirstName: 'first',
        LastName: 'last',
        MiddleName: 'middle',
      };
      ctrl.appendPatientData(appointment, patient);

      expect(appointment.Patient).toEqual(patient);
    });
  });

  describe('appendTreatmentRoomData ->', function () {
    var appointment;

    beforeEach(function () {
      appointment = {};
    });

    it('when the treatmentRoom is null, it should set appointment.Room to an empty string', function () {
      ctrl.appendTreatmentRoomData(appointment);

      expect(appointment.Room).toEqual({ Name: '' });
    });

    it('when the treatmentRoom is NOT null, it should set appointment.Room to the treatmentRoom object', function () {
      var treatmentRoom = { Name: 'some room' };

      ctrl.appendTreatmentRoomData(appointment, treatmentRoom);

      expect(appointment.Room).toEqual(treatmentRoom);
    });
  });

  describe('appendLocationData ->', function () {
    var appointment;
    beforeEach(function () {
      appointment = {};
    });

    it('when the location is null, it should set appointment.Location to an empty object', function () {
      ctrl.appendLocationData(appointment);

      expect(appointment.Location).toBeNull();
    });

    it('when the location is NOT null, it should set appointment.Location to the location object', function () {
      var ofcLocation = { NameAbbreviation: 'some location' };

      ctrl.appendLocationData(appointment, ofcLocation);

      expect(appointment.Location).toEqual(ofcLocation);
    });
  });

  describe('appendProviderData ->', function () {
    var appointment;

    beforeEach(function () {
      appointment = {};
    });

    it('when the provider is null, it should set appointment.Provider to an empty object', function () {
      ctrl.appendProviderData(appointment);

      expect(appointment.Provider).toEqual({});
    });

    it('when the provider is NOT null, it should set appointment.Provider to the provider object', function () {
      var provider = { FirstName: 'first', LastName: 'last' };

      ctrl.appendProviderData(appointment, provider);

      expect(appointment.Provider).toEqual(provider);
    });

    it('when the provider is NOT null and does NOT have a Name property, should ensure that the provider has a Name property computed to be the FirstName, LastName, and ProfessionalDesignation', function () {
      var provider = {
        FirstName: 'first',
        LastName: 'last',
        ProfessionalDesignation: 'PHD',
      };

      ctrl.appendProviderData(appointment, provider);

      expect(appointment.Provider.Name).toEqual('first last, PHD');
    });

    it('when the provider is NOT null and has a Name property, should maintain the same name value', function () {
      var provider = { Name: 'any name' };

      ctrl.appendProviderData(appointment, provider);

      expect(appointment.Provider.Name).toEqual('any name');
    });
  });

  describe('appendAppointmentTypeData ->', function () {
    var appointment;

    beforeEach(function () {
      appointment = {};
    });

    it('when the appointmentType is null, it should set appointment.AppointmentType to an empty object', function () {
      ctrl.appendAppointmentTypeData(appointment);

      expect(appointment.AppointmentType).toEqual({
        Name: 'localized string',
        AppointmentTypeColor: 'rgba(100, 100, 100, 0.34902)',
        FontColor: 'rgb(0, 0, 0)',
      });
    });

    it('when the appointmentType.AppointmentType is NOT null, it should set appointment.AppointmentType to the appointmentType object', function () {
      var appointmentType = { AppointmentTypeColor: 'blue', FontColor: 'red' };

      ctrl.appendAppointmentTypeData(appointment, appointmentType);

      expect(appointment.AppointmentType).toEqual(appointmentType);
    });
  });

  describe('appendAppointmentStatusData ->', function () {
    it('when the appointment passed to the function is null, it should NOT call getStatusById', function () {
      ctrl.getStatusById = jasmine.createSpy();

      ctrl.appendAppointmentStatusData(null);

      expect(ctrl.getStatusById).not.toHaveBeenCalled();
    });

    it('when the appointment passed to the function is NOT null, it should call getStatusById with the Status property', function () {
      var appointment = { Status: 'Z' };

      ctrl.getStatusById = jasmine
        .createSpy()
        .and.returnValue(angular.copy(mockStatusList[1]));

      ctrl.appendAppointmentStatusData(appointment);

      expect(ctrl.getStatusById).toHaveBeenCalledWith(appointment.Status);
    });

    it("when an appointment status is retrieved, it should append a StatusName and StatusIcon property to the appointment with the status's description and icon respectively.", function () {
      var appointment = { Status: 'Z' };

      ctrl.getStatusById = jasmine
        .createSpy()
        .and.returnValue(angular.copy(mockStatusList[1]));

      ctrl.appendAppointmentStatusData(appointment);

      expect(appointment.StatusName).toEqual(mockStatusList[1].Description);
      expect(appointment.StatusIcon).toEqual(mockStatusList[1].Icon);
    });
  });

  describe('appendStartTimeFormat ->', function () {
    it("should return 'MMM dd, h:mm' if the appointment's StartTime and EndTime are both in the am or pm", function () {
      var appointment = {
        StartTime: new Date(2015, 1, 1, 10).toISOString(),
        EndTime: new Date(2015, 1, 1, 11).toISOString(),
      };

      ctrl.appendStartTimeFormat(appointment);

      expect(appointment.StartTimeFormat).toEqual('MMM dd, yyyy h:mm');
    });

    it("should return 'MMM dd, h:mm a' if the appointment's StartTime and EndTime are in parts of the day (am / pm)", function () {
      var appointment = {
        StartTime: new Date(2015, 1, 1, 10).toISOString(),
        EndTime: new Date(2015, 1, 1, 23).toISOString(),
      };

      ctrl.appendStartTimeFormat(appointment);

      expect(appointment.StartTimeFormat).toEqual('MMM dd, yyyy h:mm a');
    });
  });

  describe('getStatusById ->', function () {
    it('should call listHelper.findItemByFieldValue with the status id passed to the function and return the result', function () {
      scope.statusList = 'the list of statuses';

      var result = ctrl.getStatusById('Z');

      expect(mockListHelper.findItemByFieldValue).toHaveBeenCalledWith(
        scope.statusList.List,
        'Value',
        'Z'
      );
      expect(result).toEqual(mockStatusList[1]);
    });
  });

  describe('ShowErrorMessage ->', function () {
    it('should call toastrFactory.error with the specified message', function () {
      var message = 'any message';

      ctrl.ShowErrorMessage(message);

      expect(_toastr_.error).toHaveBeenCalledWith(message, 'Error');
    });
  });

  describe('appointmentSaved ->', function () {
    var updatedAppointment;
    var newStartTime = 'Some other time';
    var newAppointmentType = 'New exotic Type';
    beforeEach(function () {
      scope.appointments = angular.copy(mockAppointmentOverviewResult);
      scope.patient = {};
      scope.patient.appointmentCount = scope.appointments.length;
      updatedAppointment = angular.copy(scope.appointments[0]);
      updatedAppointment.StartTime = newStartTime;
      updatedAppointment.AppointmentType.Name = newAppointmentType;
      ctrl.updateItem = jasmine.createSpy();

      ctrl.appointmentSaved(updatedAppointment);
    });

    it('should call updateItem', function () {
      expect(ctrl.updateItem).toHaveBeenCalledWith(updatedAppointment);
    });
  });

  describe('initializeStatusList ->', function () {     

    it('should initialize the status list with the values from staticData.AppointmentStatuses', function () {
      ctrl.initializeStatusList();

      expect(mockStaticData.AppointmentStatuses).toHaveBeenCalled();
      expect(scope.statusList).toEqual(mockStatusList);
      expect(referenceDataService.getData).toHaveBeenCalledWith(
        referenceDataService.entityNames.practiceSettings
      );
    });  
    
    it('should set timeIncrement to null if referenceDataService.entityNames.practiceSettings is null or undefined', function (done) {
      var returnVal = { then: function (callback) {
        callback(null)
      } };      
      referenceDataService.getData.and.returnValue(returnVal);
      ctrl.initializeStatusList();      
      expect(scope.timeIncrement).toEqual(null);
      done();      
    })

    it('should set timeIncrement to returned value of DefaultTimeIncrement if referenceDataService.entityNames.practiceSettings is not null or undefined', function (done) {
      var returnVal = { then: function (callback) {
        callback({ DefaultTimeIncrement: 15 })
      } };      
      referenceDataService.getData.and.returnValue(returnVal);     
      ctrl.initializeStatusList();      
      expect(scope.timeIncrement).toEqual(15);
      done();      
    })
  });

  describe('retrieveData ->', function () {
    it('should call patientServices.PatientAppointment.AppointmentsForAccountRefactor with the following settings when the current patient has an account id', function () {
      var settings = {
        accountId: 'any id',
        includeServiceCodes: false,
      };

      scope.accountId = 'any id';

      ctrl.retrieveData();

      expect(
        mockPatientServices.PatientAppointment.OverviewByAccount
      ).toHaveBeenCalledWith(
        settings,
        ctrl.appointmentRetrievalSuccess,
        ctrl.appointmentRetrievalFailed
      );
    });

    it('should call patientServices.PatientAppointment.AppointmentsForAccountRefactor with the following settings  when the current patient does NOT have an account id', function () {
      var settings = {
        patientId: 'pat id',
        includeServiceCodes: false,
      };

      scope.accountId = null;

      scope.patient = {
        PatientId: 'pat id',
      };

      ctrl.retrieveData();

      expect(
        mockPatientServices.PatientAppointment.OverviewByPatient
      ).toHaveBeenCalledWith(
        settings,
        ctrl.appointmentRetrievalSuccess,
        ctrl.appointmentRetrievalFailed
      );
    });
  });

  describe('autoSaveAppointmentFailed', function () {
    beforeEach(function () {
      ctrl.ShowErrorMessage = jasmine.createSpy();
    });

    it('should call localize.getLocalizedString', function () {
      scope.autoSaveAppointmentFailed();

      expect(mockLocalize.getLocalizedString).toHaveBeenCalled();
    });

    it('should call ShowErrorMessage with the result of the localize.getLocalizedString function', function () {
      scope.autoSaveAppointmentFailed();

      expect(ctrl.ShowErrorMessage).toHaveBeenCalledWith('localized string');
    });
  });

  describe('autoSaveAppointmentSuccessful ->', function () {
    beforeEach(function () {
      ctrl.retrieveData = jasmine.createSpy();

      scope.autoSaveAppointmentSuccessful({
        Value: { AppointmentId: 'Z', DataTag: 'Updated Tag' },
      });
    });

    it('should call toastrFactory.success', function () {
      expect(mockLocalize.getLocalizedString).toHaveBeenCalled();
      expect(_toastr_.success).toHaveBeenCalledWith(
        'localized string',
        'Success'
      );
    });

    it('should call retrieveData', function () {
      expect(ctrl.retrieveData).toHaveBeenCalled();
    });
  });

  describe('toggleAccountView ->', function () {
    beforeEach(function () {
      ctrl.updateViewAppointmentActionText = jasmine.createSpy();
    });

    it('when accountView is false, should set it to true', function () {
      scope.accountView = false;

      ctrl.toggleAccountView();

      expect(scope.accountView).toEqual(true);
    });

    it('when accountView is true, should set it to false', function () {
      scope.accountView = true;

      ctrl.toggleAccountView();

      expect(scope.accountView).toEqual(false);
    });

    it('should call updateViewAppointmentActionText', function () {
      ctrl.toggleAccountView();

      expect(ctrl.updateViewAppointmentActionText).toHaveBeenCalled();
    });
  });

  describe('updateViewAppointmentActionText ->', function () {
    it("should call getViewAppointmentsText and assign it to the first patientAppointmentAction's Text property", function () {
      scope.patientAppointmentActions = [{}];

      ctrl.getViewAppointmentsText = jasmine
        .createSpy()
        .and.returnValue('updated text');

      ctrl.updateViewAppointmentActionText();

      expect(scope.patientAppointmentActions[0].Text).toEqual('updated text');
    });
  });

  describe('getViewAppointmentsText ->', function () {
    beforeEach(function () {
      scope.patientAppointmentCount = 123;
      scope.appointmentCount = 456;
    });

    it("when accountView is true, should return 'View Appointments for Patient (<patientAppointmentCount>)'", function () {
      scope.accountView = true;
      scope.showAppointments = 'All';

      var result = ctrl.getViewAppointmentsText();

      expect(result).toEqual('View Appointments for Patient (456)');
    });

    it("when accountView is true, should return 'View Appointments for Patient (<patientAppointmentCount>)'", function () {
      scope.accountView = false;
      scope.showAppointments = 'All';

      var result = ctrl.getViewAppointmentsText();

      expect(result).toEqual('View Appointments for Account (123)');
    });
  });

  describe('initializeScopeVariables ->', function () {
    beforeEach(function () {
      ctrl.initializeStatusList = jasmine.createSpy();
    });

    describe('when patient id NOT null', function () {
      beforeEach(function () {
        scope.patient = {
          PatientId: 'any id',
          PersonAccount: {
            AccountId: 'some account',
          },
        };

        scope.getViewAppointmentsText = jasmine
          .createSpy()
          .and.returnValue('action text');

        ctrl.initializeScopeVariables();
      });

      it('should initialize accountView to true', function () {
        expect(scope.accountView).toEqual(false);
      });

      it('should initialize loading to true', function () {
        expect(scope.loading).toEqual(true);
      });

      it('should initialize appointments to an empty list', function () {
        expect(scope.appointments).toEqual([]);
      });

      it('should call initializeStatusList', function () {
        expect(ctrl.initializeStatusList).toHaveBeenCalled();
      });

      it('should intialize loadingMessageNoResults with the results of localize.getLocalizedString', function () {
        expect(mockLocalize.getLocalizedString).toHaveBeenCalled();
        expect(scope.loadingMessageNoResults).toEqual('localized string');
      });

      it("should initialize patientId with the patient's PatientId", function () {
        expect(scope.patientId).toEqual('any id');
      });

      it("when the patient's PersonAccount property has a value, should initialize accountId with the PersonAccount's AccountId", function () {
        expect(scope.accountId).toEqual('some account');
      });

      it("should set today to the start of today's date", function () {
        var now = new Date();
        var today = new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate()
        ).toISOString();
        expect(scope.today).toEqual(today);
      });

      it('should initialize appointmentCount to 0', function () {
        expect(scope.appointmentCount).toEqual(0);
      });

      it('should initialize patientAppointmentCount to 0', function () {
        expect(scope.patientAppointmentCount).toEqual(0);
      });

      it('should initialize patientAppointmentActions', function () {
        expect(scope.patientAppointmentActions).toEqual([
          {},
          {
            Function: ctrl.createNewAppointment,
            Path: '',
            Text: 'localized string',
            Inactive: false,
            toolTip: 'localized string',
          },
        ]);
      });
    });
  });

  describe('initializeControllerVariables ->', function () {
    it('should set appointmentEditModalData to null', function () {
      ctrl.initializeControllerVariables();

      expect(ctrl.appointmentEditModalData).toBeNull();
    });
  });

  describe('getProviders function ->', function () {
    it('should call userServices.Users.get', function () {
      ctrl.getProviders();

      expect(mockUsersFactory.Users).toHaveBeenCalled();
    });
  });

  describe('UsersGetOnSuccess function ->', function () {
    beforeEach(function () {
      ctrl.retrieveData = jasmine.createSpy();
    });

    it('should set providers', function () {
      var result = {
        Value: [{ UserId: 1 }],
      };
      ctrl.UsersGetOnSuccess(result);

      expect(ctrl.providers).toEqual(result.Value);
    });

    it('should call retrieveData', function () {
      var result = {
        Value: [{ UserId: 1 }],
      };
      ctrl.UsersGetOnSuccess(result);

      expect(ctrl.retrieveData).toHaveBeenCalled();
    });
  });

  describe('UsersGetOnError function ->', function () {
    it('should call toastrFactory', function () {
      ctrl.UsersGetOnError();

      expect(_toastr_.error).toHaveBeenCalled();
    });
  });

  describe('initialize ->', function () {
    beforeEach(function () {
      ctrl.initializeScopeVariables = jasmine.createSpy();
      ctrl.getProviders = jasmine.createSpy();

      scope.initialize();
    });

    it('should call initializeScopeVariables', function () {
      expect(ctrl.initializeScopeVariables).toHaveBeenCalled();
    });

    it('should call retrieveData', function () {
      expect(ctrl.getProviders).toHaveBeenCalled();
    });
  });

  describe('showAppointmentModal ->', function () {
    var appointment, cachedLocation;

    beforeEach(function () {
      appointment = {
        AppointmentId: 'Z',
        PersonId: 'P',
        Patient: { PreferredLocation: 'PL' },
        Location: { LocationId: 'LocationId' },
        $$authorized: true,
      };

      cachedLocation = JSON.stringify({ id: 'L' });

      ctrl.setupAppointmentAsUnscheduled = jasmine.createSpy(
        'setupAppointmentAsUnscheduled'
      );

      ctrl.appointmentEditModalData = 'some data';

      localStorage.getItem = jasmine
        .createSpy()
        .and.returnValue(cachedLocation);

      spyOn(ctrl, 'checkAuthorizedForPatientLocation');
    });

    it('should create provider appointment when appointment.Classification is 2', function () {
      appointment.Classification = 2;
      appointment.ObjectState = 'None';

      scope.showAppointmentModal(appointment);

      expect(appointment.ProviderAppointments.length).toBe(1);
    });
  });

  describe('statusChanged', function () {
    var appointment;

    beforeEach(function () {
      ctrl.updateViewAppointmentActionText = jasmine.createSpy();
      ctrl.updateItemStatus = jasmine.createSpy();

      scope.statusList = {
        Enum: {
          Completed: 'Completed Status',
        },
      };

      scope.appointments = [];
    });

    it('should call autoSaveAppointment when autoSave is true', function () {
      var setManualUpdateFlag = 'flag';
      appointment = { AppointmentId: 1 };
      scope.autoSaveAppointment = jasmine
        .createSpy('autoSaveAppointment')
        .and.callFake(function () {
          return { AppointmentId: 1 };
        });
      scope.statusChanged(
        appointment,
        true,
        null,
        null,
        null,
        setManualUpdateFlag
      );

      expect(scope.autoSaveAppointment).toHaveBeenCalledWith(
        appointment,
        setManualUpdateFlag
      );
    });

    it('should broadcast correct event when ObjectState is Update', function () {
      appointment = { AppointmentId: 1, ObjectState: 'Update' };
      var spy = jasmine.createSpy();
      scope.$on('soar:appt-status-updated-via-pat-appt-ctrl', spy);

      scope.statusChanged(appointment);

      expect(spy).toHaveBeenCalledWith(jasmine.anything(), appointment);
    });

    it('should broadcast correct event when ObjectState is Delete', function () {
      appointment = { AppointmentId: 1, ObjectState: 'Delete' };
      var spy = jasmine.createSpy();
      scope.$on('soar:appt-deleted-via-pat-appt-ctrl', spy);

      scope.statusChanged(appointment);

      expect(spy).toHaveBeenCalledWith(jasmine.anything(), appointment);
    });
  });

  describe('autoSaveAppointment ->', function () {
    var appointment, status;

    beforeEach(function () {
      status = { Value: 'status' };
      ctrl.getStatusById = jasmine.createSpy().and.returnValue(status);
      appointment = {
        AppointmentId: 1,
        AppointmentTypeId: 1,
        PersonId: 3,
        TreatmentRoomId: 4,
        UserId: 5,
        Classification: 6,
        Description: 7,
        Note: 8,
        ProviderAppointments: 9,
        PlannedServices: 10,
        ExaminingDentist: 11,
        DataTag: 12,
        StartTime: 13,
        EndTime: 14,
        Status: 15,
        StatusNote: 16,
        AnotherProperty: 17,
        ExtraProperty: 18,
        DisplayDataProperties: 19,
        FlagProperties: 20,
        Saving: 21,
        IsExamNeeded: 22,
        LocationId: 23,
      };

      mockScheduleServices.AppointmentStatus = {
        Update: jasmine.createSpy(),
      };
    });

    it('should call scheduleServices.AppointmentStatus.Update with only the necessary properties on the appointment', function () {
      scope.autoSaveAppointment(appointment);
      var callObj = {
        appointmentId: appointment.AppointmentId,
        DataTag: appointment.DataTag,
        NewAppointmentStatusId: status.Value,
        StartAppointment: false,
      };
      expect(
        mockScheduleServices.AppointmentStatus.Update
      ).toHaveBeenCalledWith(
        callObj,
        jasmine.any(Function),
        jasmine.any(Function)
      );
    });

    it('should call scheduleServices.AppointmentStatus.Update with only the necessary properties on the appointment when setManualUpdateFlag is true', function () {
      scope.autoSaveAppointment(appointment, true);
      var callObj = {
        appointmentId: appointment.AppointmentId,
        DataTag: appointment.DataTag,
        NewAppointmentStatusId: status.Value,
        StartAppointment: false,
        manuallyUpdateStatus: true,
      };
      expect(
        mockScheduleServices.AppointmentStatus.Update
      ).toHaveBeenCalledWith(
        callObj,
        jasmine.any(Function),
        jasmine.any(Function)
      );
    });

    it('should not call scheduleServices.AppointmentStatus.Update when appointment.Status is Remove', function () {
      ctrl.getStatusById = jasmine.createSpy().and.callFake(function () {
        return {
          Description: 'Remove',
        };
      });

      scope.autoSaveAppointment(appointment);

      expect(
        mockScheduleServices.AppointmentStatus.Update
      ).not.toHaveBeenCalled();
    });

    it('should not call scheduleServices.Dtos.Appointment.Operations.Update when appointment.Status is Reschedule', function () {
      ctrl.getStatusById = jasmine.createSpy().and.callFake(function () {
        return {
          Description: 'Reschedule',
        };
      });

      scope.autoSaveAppointment(appointment);

      expect(
        mockScheduleServices.AppointmentStatus.Update
      ).not.toHaveBeenCalled();
    });
  });

  describe('showDeleteAppointmentModal function ->', function () {
    it('should set appointmentToDelete to appointment passed in', function () {
      var appointment = { AppointmentId: 1 };
      scope.showDeleteAppointmentModal(appointment);

      expect(ctrl.appointmentToDelete).toEqual(appointment);
    });

    it('should call AppointmentDeleteModal', function () {
      var appointment = { AppointmentId: 1 };
      scope.showDeleteAppointmentModal(appointment);

      expect(mockModalFactory.AppointmentDeleteModal).toHaveBeenCalled();
    });
  });

  describe('confirmDelete function ->', function () {
    it('should call Delete service for Appointment', function () {
      ctrl.appointmentToDelete = {
        AppointmentId: 1,
      };
      spyOn(ctrl, 'appointmentDeleteOnSuccess');
      spyOn(ctrl, 'appointmentDeleteOnError');
      ctrl.confirmDelete();

      expect(
        mockScheduleServices.Dtos.Appointment.Operations.Delete
      ).toHaveBeenCalledWith(
        { AppointmentId: ctrl.appointmentToDelete.AppointmentId },
        ctrl.appointmentDeleteOnSuccess,
        ctrl.appointmentDeleteOnError
      );
    });
  });

  describe('appointmentDeleteOnSuccess function ->', function () {
    beforeEach(function () {
      var appointments = [{ AppointmentId: 1 }, { AppointmentId: 2 }];
      scope.appointments = appointments;
      ctrl.appointmentToDelete = appointments[0];
      scope.appointmentCount = 2;
      scope.patient = {};

      ctrl.appointmentDeleteOnSuccess();
    });

    it('should set appointmentToDelete to null', function () {
      expect(ctrl.appointmentToDelete).toBeNull();
    });

    it('should call toastrFactory.success', function () {
      expect(_toastr_.success).toHaveBeenCalled();
    });
  });

  describe('appointmentDeleteOnError function ->', function () {
    beforeEach(function () {
      ctrl.appointmentDeleteOnError();
    });

    it('should set apppointmentToDelete to null', function () {
      expect(ctrl.appointmentToDelete).toBeNull();
    });

    it('should call toastrFactory.error', function () {
      expect(_toastr_.error).toHaveBeenCalled();
    });
  });

  describe('cancelDelete function ->', function () {
    beforeEach(function () {
      ctrl.cancelDelete();
    });

    it('should set apppointmentToDelete to null', function () {
      expect(ctrl.appointmentToDelete).toBeNull();
    });
  });

  describe('appointmentsUpdated ->', function () {
    beforeEach(function () {
      ctrl.retrieveData = jasmine.createSpy();
    });

    it('should get fresh data', function () {
      ctrl.appointmentsUpdated();
      expect(ctrl.retrieveData).toHaveBeenCalled();
    });
  });

  describe('checkAuthorizedForLocation ->', function () {
    var appointment;
    var accountValidation;
    beforeEach(function () {
      accountValidation = [
        {
          PatientId: 'ABC123',
          UserIsAuthorizedToAtLeastOnePatientLocation: true,
        },
      ];
      appointment = {
        AppointmentId: 'a6a9ec3c-d318-4d86-b9c8-88b6a7f20e8a',
        ActualEndTime: '2017-12-27T11:00',
        ActualStartTime: '2017-12-27T10:00',
        PersonId: 'ABC123',
      };
    });

    it('should set appointment.$$authorized based if accountValidation.UserIsAuthorizedToAtLeastOnePatientLocation is true', function () {
      scope.accountValidation = angular.copy(accountValidation);
      mockListHelper.findItemByFieldValue = jasmine
        .createSpy('listHelper.findItemByFieldValue')
        .and.returnValue(accountValidation[0]);
      ctrl.checkAuthorizedForPatientLocation(appointment);
      expect(appointment.$$authorized).toBe(true);
    });

    it('should set appointment.$$authorized based if accountValidation.UserIsAuthorizedToAtLeastOnePatientLocation is false ', function () {
      accountValidation[0].UserIsAuthorizedToAtLeastOnePatientLocation = false;
      scope.accountValidation = angular.copy(accountValidation);
      mockListHelper.findItemByFieldValue = jasmine
        .createSpy('listHelper.findItemByFieldValue')
        .and.returnValue(accountValidation[0]);
      ctrl.checkAuthorizedForPatientLocation(appointment);
      expect(appointment.$$authorized).toBe(false);
    });
  });

  describe('checkAppointmentMember ->', function () {
    var appointments;
    beforeEach(function () {
      appointments = [
        {
          AppointmentId: 'a6a9ec3c-d318-4d86-b9c8-88b6a7f20e8a',
          ActualEndTime: '2017-12-27T11:00',
          ActualStartTime: '2017-12-27T10:00',
          PersonId: 'ABC123',
        },
      ];
    });

    it('should call checkAuthorizedForPatientLocation for each appointment', function () {
      spyOn(ctrl, 'checkAuthorizedForPatientLocation');
      scope.checkAppointmentMember(appointments);
      angular.forEach(scope.appointments, function (appointment) {
        expect(ctrl.checkAuthorizedForPatientLocation).toHaveBeenCalledWith(
          appointment
        );
      });
    });
  });

  describe('ctrl.overviewFromModalAppointment function ->', function () {
    it('should create new object with correct appointment id', function () {
      var overview = ctrl.overviewFromModalAppointment(
        mockAppointmentModalResult
      );
      expect(overview.AppointmentId).toEqual(
        mockAppointmentModalResult.AppointmentId
      );
      expect(overview.AppointmentTypeId).toEqual(
        mockAppointmentModalResult.AppointmentTypeId
      );
      expect(overview.StartTime).toEqual(mockAppointmentModalResult.StartTime);
      expect(overview.EndTime).toEqual(mockAppointmentModalResult.EndTime);
      expect(overview.ProposedDuration).toEqual(
        mockAppointmentModalResult.ProposedDuration
      );
      expect(overview.Classification).toEqual(
        mockAppointmentModalResult.Classification
      );
      expect(overview.Status).toEqual(mockAppointmentModalResult.Status);
      expect(overview.TreatmentRoomId).toEqual(
        mockAppointmentModalResult.TreatmentRoomId
      );
      expect(overview.LocationId).toEqual(
        mockAppointmentModalResult.LocationId
      );
      expect(overview.ProviderId).toEqual(
        mockAppointmentModalResult.ProviderAppointments[0].UserId
      );
      expect(overview.Location.NameAbbreviation).toEqual(
        mockLocations[0].NameAbbreviation
      );
      expect(overview.Room.Name).toEqual(mockRooms[1].Name);
      expect(overview.AppointmentType.Name).toEqual(
        mockAppointmentTypes[2].Name
      );
      expect(overview.DataTag).toEqual(mockAppointmentModalResult.DataTag);
    });
  });

  describe('ctrl.updateItem function ->', function () {
    beforeEach(function () {
      scope.appointments = angular.copy(mockAppointmentOverviewResult);
      for (var i = 0; i < scope.appointments.length; ++i) {
        scope.appointments[i].$$index = i;
      }
      scope.patient = {};
    });

    it('should update the appointment in the array on scope', function () {
      var updatedAppt = angular.copy(mockAppointmentOverviewResult[0]);
      updatedAppt.StartTime += '_updated';
      updatedAppt.EndTime += '_updated';
      updatedAppt.ProposedDuration++;
      updatedAppt.Classification++;
      updatedAppt.Status++;
      updatedAppt.AppointmentType.Name += '_updated';
      updatedAppt.AppointmentType.AppointmentTypeColor += '_updated';
      updatedAppt.AppointmentType.FontColor += '_updated';
      updatedAppt.TreatmentRoomId += '_updated';
      updatedAppt.Room.Name += '_updated';
      updatedAppt.Provider.Name += '_updated';
      updatedAppt.Provider.IsActive = !updatedAppt.Provider.IsActive;
      updatedAppt.Provider.ProviderTypeId++;
      updatedAppt.LocationId++;
      updatedAppt.Location.NameAbbreviation += '_updated';
      updatedAppt.DataTag += '_updated';
      updatedAppt.ProviderAppointments = [];

      ctrl.updateItem(updatedAppt);
      var index = 0;
      while (
        index < scope.appointments.length &&
        scope.appointments[index].AppointmentId !== updatedAppt.AppointmentId
      )
        ++index;
      if (index === scope.appointments.length) {
        throw 'Appointment Not found on scope!';
      }
      expect(scope.appointments[index].StartTime).toBe(updatedAppt.StartTime);
      expect(scope.appointments[index].EndTime).toBe(updatedAppt.EndTime);
      expect(scope.appointments[index].ProposedDuration).toBe(
        updatedAppt.ProposedDuration
      );
      expect(scope.appointments[index].Classification).toBe(
        updatedAppt.Classification
      );
      expect(scope.appointments[index].Status).toBe(updatedAppt.Status);
      expect(scope.appointments[index].AppointmentType.Name).toBe(
        updatedAppt.AppointmentType.Name
      );
      expect(
        scope.appointments[index].AppointmentType.AppointmentTypeColor
      ).toBe(updatedAppt.AppointmentType.AppointmentTypeColor);
      expect(scope.appointments[index].AppointmentType.FontColor).toBe(
        updatedAppt.AppointmentType.FontColor
      );
      expect(scope.appointments[index].TreatmentRoomId).toBe(
        updatedAppt.TreatmentRoomId
      );
      expect(scope.appointments[index].Room.Name).toBe(updatedAppt.Room.Name);
      expect(scope.appointments[index].Provider.Name).toBe(
        updatedAppt.Provider.Name
      );
      expect(scope.appointments[index].Provider.IsActive).toBe(
        updatedAppt.Provider.IsActive
      );
      expect(scope.appointments[index].Provider.ProviderTypeId).toBe(
        updatedAppt.Provider.ProviderTypeId
      );
      expect(scope.appointments[index].LocationId).toBe(updatedAppt.LocationId);
      expect(scope.appointments[index].Location.NameAbbreviatio).toBe(
        updatedAppt.Location.NameAbbreviatio
      );
      expect(scope.appointments[index].DataTag).toBe(updatedAppt.DataTag);
    });
  });

  describe('ctrl.updateItemStatus function ->', function () {
    beforeEach(function () {
      scope.appointments = angular.copy(mockAppointmentOverviewResult);
      for (var i = 0; i < scope.appointments.length; ++i) {
        scope.appointments[i].$$index = i;
      }
      scope.patient = {};
      scope.patientId = scope.appointments[0].PersonId;
    });

    it('should update the appointment in the array on scope', function () {
      var updatedAppt = angular.copy(mockAppointmentOverviewResult[0]);
      updatedAppt.StartTime += '_updated';
      updatedAppt.EndTime += '_updated';
      updatedAppt.ProposedDuration++;
      updatedAppt.Classification++;
      updatedAppt.Status++;
      updatedAppt.DataTag += '_updated';

      ctrl.updateItemStatus(updatedAppt);
      var index = 0;
      while (
        index < scope.appointments.length &&
        scope.appointments[index].AppointmentId !== updatedAppt.AppointmentId
      )
        ++index;
      if (index === scope.appointments.length) {
        throw 'Appointment Not found on scope!';
      }
      expect(scope.appointments[index].StartTime).toBe(updatedAppt.StartTime);
      expect(scope.appointments[index].EndTime).toBe(updatedAppt.EndTime);
      expect(scope.appointments[index].ProposedDuration).toBe(
        updatedAppt.ProposedDuration
      );
      expect(scope.appointments[index].Classification).toBe(
        updatedAppt.Classification
      );
      expect(scope.appointments[index].Status).toBe(updatedAppt.Status);
      expect(scope.appointments[index].DataTag).toBe(updatedAppt.DataTag);
    });
  });

  describe('ctrl.deleteItem function ->', function () {
    beforeEach(function () {
      scope.appointments = angular.copy(mockAppointmentOverviewResult);
      for (var i = 0; i < scope.appointments.length; ++i) {
        scope.appointments[i].$$index = i;
      }
      scope.patient = {};
    });

    it('should remove appointment with given ID from appointment array on scope', function () {
      var apptId = scope.appointments[0].AppointmentId;
      var numAppts = scope.appointments.length;
      ctrl.deleteItem(apptId);
      var index = 0;
      while (
        index < scope.appointments.length &&
        scope.appointments[index].AppointmentId !== apptId
      )
        ++index;
      expect(scope.appointments.length).toBe(numAppts - 1);
      expect(index).toBe(scope.appointments.length);
    });
  });

  describe('ctrl.addItem function ->', function () {
    beforeEach(function () {
      scope.appointments = angular.copy(mockAppointmentOverviewResult);
      for (var i = 0; i < scope.appointments.length; ++i) {
        scope.appointments[i].$$index = i;
      }
      scope.patient = {};
    });

    it('should insert new item into appointments array on scope', function () {
      var numAppts = scope.appointments.length;
      ctrl.addItem(scope.appointments, mockNewAppointmentOverview);
      var index = 0;
      while (
        index < scope.appointments.length &&
        scope.appointments[index].AppointmentId !==
        mockNewAppointmentOverview.AppointmentId
      )
        ++index;
      expect(scope.appointments.length).toBe(numAppts + 1);
      expect(index < scope.appointments.length);
    });
  });
});
