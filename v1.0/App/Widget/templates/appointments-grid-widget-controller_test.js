describe('appointments-grid-widget', function () {
  var ctrl,
    scope,
    usersFactory,
    localize,
    scheduleServices,
    modalDataFactory,
    modalFactory,
    toastrFactory,
    staticData,
    saveStates,
    referenceDataService,
    roleNames,
    widgetInitStatus,
    q,
    deferred,
    appointmentViewVisibleService,
    appointmentViewDataLoadingService,
    tabLauncher,
    featureFlagService,
    fuseFlag;

  beforeEach(module('Soar.Dashboard'));
  beforeEach(
    module('Soar.Widget', function ($provide) {
      referenceDataService = {
        get: jasmine.createSpy().and.callFake(function () {
          return [];
        }),
        entityNames: {
          locations: 'locations',
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
  beforeEach(inject(function ($rootScope, $controller, $q) {
    q = $q;
    deferred = q.defer();
    scope = $rootScope.$new();

    scope.data = {
      options: {
        providerFilterOptions: [
          {
            Selected: false,
            Status: 'Active',
            display: 'Ruby Brown - BRORU1',
            id: '34de62b5-b6b6-e811-bfd7-4c34889071c5',
          },
          {
            Selected: false,
            Status: 'Active',
            display: 'Khloe Dickson - DICKH1',
            id: 'adb31dad-b6b6-e811-bfd7-4c34889071c5',
          },
        ],
      },
    };

    widgetInitStatus = {
      ToLoad: 0,
      Loading: 1,
      Loaded: 2,
    };

    roleNames = {
      PracticeAdmin: 'Practice Admin/Exec. Dentist',
      RxUser: 'Rx User',
    };

    usersFactory = {
      Users: jasmine.createSpy().and.returnValue({
        then: jasmine.createSpy(),
      }),
    };

    scheduleServices = {
      Lists: {
        Appointments: {
          GetWidget: jasmine.createSpy().and.returnValue({
            then: deferred.promise,
          }),
        },
      },
    };

    staticData = {
      AppointmentStatuses: jasmine
        .createSpy()
        .and.returnValue({ then: jasmine.createSpy() }),
    };

    featureFlagService = {
        getOnce$: jasmine.createSpy().and.returnValue({ subscribe: jasmine.createSpy() })
    };

    fuseFlag = {
        DashboardAppointmentWidgetMvp: jasmine.createSpy().and.returnValue({ subscribe: jasmine.createSpy() })
    };
    ctrl = $controller('AppointmentsGridWidgetController', {
      $scope: scope,
      UsersFactory: usersFactory,
      localize: localize,
      ScheduleServices: scheduleServices,
      ModalDataFactory: modalDataFactory,
      ModalFactory: modalFactory,
      toastrFactory: toastrFactory,
      StaticData: staticData,
      SaveStates: saveStates,
      RoleNames: roleNames,
      WidgetInitStatus: widgetInitStatus,
      FeatureFlagService: featureFlagService,
      FuseFlag: fuseFlag
    });
  }));

  describe('initial values -> ', function () {
    it('controller should exist', function () {
      expect(ctrl).not.toBeNull();
      expect(ctrl).not.toBeUndefined();
    });

    it('should have injected services ', function () {
      expect(usersFactory).not.toBeNull();
      expect(localize).not.toBeNull();
      expect(scheduleServices).not.toBeNull();
      expect(modalDataFactory).not.toBeNull();
      expect(toastrFactory).not.toBeNull();
      expect(staticData).not.toBeNull();
      expect(saveStates).not.toBeNull();
      expect(roleNames).not.toBeNull();
      expect(widgetInitStatus).not.toBeNull();
    });

    it('should set scope properties', function () {
      expect(scope.providerAppointments).toBeNull();
      expect(scope.initializeCalled).toBe(false);
    });
  });

  // describe('initialize function ->', function () {
  //     it('initialize should be called', function () {
  //         var promises = [];
  //         ctrl.initialize();
  //         expect(promises).not.toBeNull();
  //     });
  // });

  describe('processUsersFromServer function ->', function () {
    it('processUsersFromServer should be called', function () {
      var isProvider = false;
      scope.filters = {
        locationFilter: [{ id: 1 }],
        providerFilter: [{ id: '89a839b7-df1b-e811-b7c1-a4db3021bfa0' }],
      };

      scope.initials = {
        providerInitial: [{ id: '89a839b7-df1b-e811-b7c1-a4db3021bfa0' }],
      };
      ctrl.usersFromServer = [
        {
          Address: {
            AddressLine1: null,
            AddressLine2: null,
            City: null,
            State: null,
            ZipCode: null,
          },
          FirstName: 'Practice',
          MiddleName: 'Admin',
          SuffixName: 'Test',
          ProfessionalDesignation: 'Manager',
          LastName: 'Admin',
          ImageFile: null,
          IsActive: true,
          JobTitle: null,
          Locations: [{ LocationId: 1 }],
          ProviderTypeId: 2,
          Roles: [
            {
              DataTag: 'AAAAAAAAaQo=',
              DateModified: '0001-01-01T00:00:00',
              PracticeId: null,
              RoleId: 8,
              RoleName: 'Practice Admin/Exec. Dentist',
            },
          ],
          UserCode: 'ADMPR1',
          UserId: '89a839b7-df1b-e811-b7c1-a4db3021bfa0',
          UserModified: '00000000-0000-0000-0000-000000000000',
          UserName: 'seed.admin@fuse.com',
        },
      ];
      var user = ctrl.usersFromServer[0];
      ctrl.processUsersFromServer();
      var isProvider =
        !_.isNull(user.ProviderTypeId) && user.ProviderTypeId != 4;
      expect(isProvider).toBe(true);
      expect(scope.options.providerFilterOptions[0].id).toEqual(
        '89a839b7-df1b-e811-b7c1-a4db3021bfa0'
      );
      expect(scope.options.providerFilterOptions[0].display).toEqual(
        'Practice A Admin, Test - ADMPR1, Manager'
      );
      expect(scope.options.providerFilterOptions[0].Selected).toBe(true);
    });
  });

  describe('processLocationsFromServer function ->', function () {
    it('processLocationsFromServer should be called', function () {
      scope.options.locationFilterOptions = [];
      ctrl.locationsFromServer = [
        { LocationId: 2, NameLine1: 'Jangaon' },
        { LocationId: 3, NameLine1: 'Default Practice - MB' },
      ];
      ctrl.processLocationsFromServer();
      expect(scope.options.locationFilterOptions[0].id).toEqual(3);
      expect(scope.options.locationFilterOptions[0].display).toEqual(
        'Default Practice - MB'
      );
      expect(scope.options.locationFilterOptions[1].id).toEqual(2);
      expect(scope.options.locationFilterOptions[1].display).toEqual('Jangaon');
    });
  });

  describe('closeMultiSelects function ->', function () {
    it('closeMultiSelects should be called', function () {
      scope.closeMultiSelects();
      expect(scope.opens.providersOpen).toBe(false);
      expect(scope.opens.locationsOpen).toBe(false);
    });
  });

  describe('mapAppointments function ->', function () {
    it('mapAppointments should be called', function () {
      var appointments = [
        {
          Appointment: {
            ProviderAppointments: [
              {
                UserId: '123',
                StartTime: '',
                endTime: '',
                appointment: '',
                providerId: '',
              },
            ],
          },
        },
      ];
      var mapResult = ctrl.mapAppointments(appointments);
      expect(mapResult[0][0].providerId).toEqual('123');
    });
  });

  describe('formatProviderName function ->', function () {
    it('formatProviderName should be called', function () {
      var user = {
        FirstName: 'Ruby',
        LastName: 'Brown',
        UserCode: 'BRORU1',
        SuffixName: null,
      };
      var result = ctrl.formatProviderName(user);
      expect(result).toEqual('Ruby Brown - BRORU1');
    });
  });

  describe('compareValues function ->', function () {
    it('compareValues should be called', function () {
      var a = 1;
      var b = 2;
      var result = ctrl.compareValues(a, b);
      expect(result).toEqual(-1);
    });

    it('compareValues should be called', function () {
      var a = 2;
      var b = 1;
      var result = ctrl.compareValues(a, b);
      expect(result).toEqual(1);
    });
  });

  describe('formatDateForScheduleLink function ->', function () {
    it('formatDateForScheduleLink should be called', function () {
      var date = Date.parse('March 21, 2012');
      var result = scope.formatDateForScheduleLink(date);
      expect(result).toEqual('2012-3-21');
    });
  });

  describe('formatPatientName function ->', function () {
    it('formatPatientName should be called', function () {
      var patient = {
        FirstName: 'Ruby',
        LastName: 'Brown',
        PatientCode: 'BRORU1',
      };
      var result = scope.formatPatientName(patient);
      expect(result).toEqual('Brown, Ruby - BRORU1');
    });
  });

  describe('findProviderName function ->', function () {
    it('findProviderName should be called', function () {
      var providerId = 123;
      var providers = [
        {
          FirstName: 'Ruby',
          LastName: 'Brown',
          UserCode: 'BRORU1',
          SuffixName: null,
          UserId: 123,
        },
      ];
      var result = scope.findProviderName(providerId, providers);
      expect(result).toEqual('Ruby Brown - BRORU1');
    });
  });

  describe('sortPatient function ->', function () {
    it('sortPatient should be called', function () {
      ctrl.sortsAscending = {
        time: false,
        patient: true,
        apptType: true,
        location: true,
        room: true,
        provider: true,
      };
      scope.providerAppointments = [
        {
          appointment: {
            Person: {
              FirstName: 'Ruby',
              LastName: 'Brown',
              PatientCode: 'BRORU1',
            },
          },
        },
        {
          appointment: {
            Person: {
              FirstName: 'Dornala',
              LastName: 'Dornala',
              PatientCode: 'JAGAN',
            },
          },
        },
      ];
      scope.sortPatient();
      var firstObj = scope.formatPatientName(
        scope.providerAppointments[0].appointment.Person
      );
      var secondObj = scope.formatPatientName(
        scope.providerAppointments[1].appointment.Person
      );
      expect(firstObj).toEqual('Brown, Ruby - BRORU1');
      expect(secondObj).toEqual('Dornala, Dornala - JAGAN');
      var result = ctrl.compareValues(firstObj, secondObj);
      expect(result).toEqual(-1);
      expect(ctrl.sortsAscending.patient).toBe(false);
    });
  });

  describe('sortTime function ->', function () {
    it('sortTime should be called', function () {
      ctrl.sortsAscending = {
        time: false,
        patient: true,
        apptType: true,
        location: true,
        room: true,
        provider: true,
      };
      scope.providerAppointments = [
        { StartTime: '2018-12-03T06:15:00' },
        { StartTime: '2018-12-03T06:15:00' },
      ];
      scope.sortTime();
      var result = ctrl.compareValues(
        scope.providerAppointments[0].StartTime,
        scope.providerAppointments[1].StartTime
      );
      var expectedResult = ctrl.sortsAscending.time ? result : -result;
      expect(expectedResult).toEqual(0);
      expect(ctrl.sortsAscending.time).toBe(true);
    });
  });

  describe('sortApptType function ->', function () {
    it('sortApptType should be called', function () {
      ctrl.sortsAscending = {
        time: false,
        patient: true,
        apptType: true,
        location: true,
        room: true,
        provider: true,
      };
      scope.providerAppointments = [
        { appointment: { AppointmentType: { Name: 'Crown Bridge Delivery' } } },
        { appointment: { AppointmentType: { Name: 'Crown Bridge Delivery' } } },
      ];
      scope.sortApptType();
      var val1 = scope.providerAppointments[0].appointment.AppointmentType
        ? scope.providerAppointments[0].appointment.AppointmentType.Name
        : '';
      var val2 = scope.providerAppointments[1].appointment.AppointmentType
        ? scope.providerAppointments[0].appointment.AppointmentType.Name
        : '';
      var result = ctrl.compareValues(val1, val2);
      expect(result).toEqual(0);
      expect(ctrl.sortsAscending.apptType).toBe(false);
    });
  });

  describe('sortLocation function ->', function () {
    it('sortLocation should be called', function () {
      ctrl.sortsAscending = {
        time: false,
        patient: true,
        apptType: true,
        location: true,
        room: true,
        provider: true,
      };
      scope.providerAppointments = [
        { appointment: { Location: { NameLine1: 'Default Practice - MB' } } },
        { appointment: { Location: { NameLine1: 'Jangaon' } } },
      ];
      scope.sortLocation();
      var val1 = scope.providerAppointments[0].appointment.Location.NameLine1;
      var val2 = scope.providerAppointments[1].appointment.Location.NameLine1;
      var result = ctrl.compareValues(val1, val2);
      expect(result).toEqual(-1);
      expect(ctrl.sortsAscending.location).toBe(false);
    });
  });

  describe('sortRoom function ->', function () {
    it('sortRoom should be called', function () {
      ctrl.sortsAscending = {
        time: false,
        patient: true,
        apptType: true,
        location: true,
        room: true,
        provider: true,
      };
      scope.providerAppointments = [
        { appointment: { Room: { Name: 'Room 104' } } },
        { appointment: { Room: { Name: 'Room 108' } } },
      ];
      scope.sortRoom();
      var val1 = scope.providerAppointments[0].appointment.Room.Name;
      var val2 = scope.providerAppointments[1].appointment.Room.Name;
      var result = ctrl.compareValues(val1, val2);
      expect(result).toEqual(-1);
      expect(ctrl.sortsAscending.room).toBe(false);
    });
  });

  describe('getStatusIcon function ->', function () {
    it('getStatusIcon should be called', function () {
      var status = 0;
      ctrl.appointmentStatuses = [
        { Description: 'Unconfirmed', Icon: 'fas fa-question', Value: 0 },
        { Description: 'Reminder Sent', Icon: 'far fa-bell', Value: 1 },
      ];
      var stausResult = scope.getStatusIcon(status);
      expect(stausResult).toEqual('fas fa-question');
    });
  });

  describe('getStatusDescription function ->', function () {
    it('getStatusDescription should be called', function () {
      var status = 0;
      ctrl.appointmentStatuses = [
        { Description: 'Unconfirmed', Icon: 'fas fa-question', Value: 0 },
        { Description: 'Reminder Sent', Icon: 'far fa-bell', Value: 1 },
      ];
      var stausResult = scope.getStatusDescription(status);
      expect(stausResult).toEqual('Unconfirmed');
    });
  });
});
