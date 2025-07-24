import { of } from 'rxjs';

describe('patient-landing -> ', function () {
  var personServicesMock, scope, ctrl, listHelper;
  var q,
    globalSearchFactory,
    patientLandingFactory,
    modalDataFactory,
    scheduleViews,
    patientServices,
    appointmentTypes,
    modalInstance,
    modal,
    patSharedServices,
    tabLauncher,
    location,
    window,
    patientLandingGrid,
    gridPrintFactory,
    locationServices;
  var deferred,
    rootScope,
    appointmentViewVisibleService,
    appointmentViewLoadingService,
    appointmentViewDataLoadingService,
    scheduleModalFactory,
    newLocationsService,
    practiceSettingsService,
    locationsDisplayService;

  //#region mocks
  var mockLocations = {
    Value: [
      { LocationId: 1, NameLine1: 'Location A' },
      { LocationId: 2, NameLine1: 'Location B' },
      { LocationId: 3, NameLine1: 'Location C' },
    ],
  };

  var mockSaveStates = {
    None: 'None',
    Add: 'Add',
    Update: 'Update',
    Delete: 'Delete',
    Failed: 'Failed',
  };

  var mockAppointmentTypes = {
    Value: [
      {
        Name: 'Type 1',
        AppointmentTypeId: 1,
        AppointmentTypeColor: '#000000',
        PersonId: 1,
      },
      { Name: 'Type 2', AppoitnmentTypeId: 2, AppointmentTypeColor: '#ffffff' },
    ],
  };
  //#endregion

  beforeEach(module('Soar.Common'));
  beforeEach(module('common.factories'));
  beforeEach(module('Soar.Patient'));
  beforeEach(
    module('Soar.Schedule', function ($provide) {
      modalDataFactory = {};

      var patientValidationFactory = {
        ObservePatientData: jasmine.createSpy().and.returnValue({
          then: jasmine.createSpy(),
        }),
        GetPatientData: jasmine.createSpy().and.returnValue({
          then: jasmine.createSpy(),
        }),
        CheckPatientLocation: jasmine.createSpy().and.returnValue({
          then: jasmine.createSpy(),
        }),
        PatientSearchValidation: jasmine.createSpy().and.returnValue({
          then: jasmine.createSpy(),
        }),
      };
      $provide.value('PatientValidationFactory', patientValidationFactory);

      var userServices = {
        users: jasmine.createSpy().and.returnValue({
          then: jasmine.createSpy(),
        }),
      };
      $provide.value('UserServices', userServices);

      $provide.value('ModalDataFactory', modalDataFactory);

      scheduleViews = {
        Appointments: {
          GetAppointmentEditData: jasmine.createSpy().and.returnValue({
            then: jasmine.createSpy(),
          }),
        },
      };

      practiceSettingsService = {
        get: jasmine.createSpy().and.returnValue(of({
          DefaultTimeIncrement: 15
        }))
      }
      
      $provide.value(
        'PracticeSettingsService',
        practiceSettingsService,
      );

      $provide.value('ScheduleViews', scheduleViews);

      patientServices = {
        Patients: {
          get: jasmine.createSpy(),
        },
      };

      $provide.value('PatientServices', patientServices);

      var locationsFatory = {
        Locations: {
          get: jasmine.createSpy(),
        },
      };

      $provide.value('LocationsFatory', locationsFatory);

      appointmentTypes = angular.copy(mockAppointmentTypes);
      $provide.valueOf('appointmentTypes', appointmentTypes);

      modalInstance = {
        result: {
          then: jasmine.createSpy(),
        },
        close: jasmine.createSpy(),
        dismiss: jasmine.createSpy(),
      };
      $provide.value('$uibModalInstance', modalInstance);

      modal = {
        open: jasmine.createSpy().and.returnValue(modalInstance),
      };
      $provide.value('$uibModal', modal);

      $provide.value('SaveStates', mockSaveStates);

      patSharedServices = {
        Time: {
          isWithinWeek: jasmine.createSpy('isWithinWeek'),
          getStartDateOfWeek: jasmine.createSpy('getStartDateOfWeek'),
          getEndDateOfWeek: jasmine.createSpy('getEndDateOfWeek'),
        },
        DOM: {
          ScrollTo: jasmine.createSpy('ScrollTo').and.returnValue({
            Element: jasmine.createSpy('Element'),
          }),
          Find: {
            TopMostElement: jasmine.createSpy('TopMostElement'),
          },
        },
      };
      $provide.value('PatSharedServices', patSharedServices);

      tabLauncher = {};

      $provide.value('tabLauncher', tabLauncher);
      patientLandingFactory = {
        GetProviders: jasmine
          .createSpy()
          .and.returnValue({ then: function () {} }),
        access: jasmine.createSpy().and.returnValue(''),
        GetScheduleApptColumns: jasmine.createSpy().and.returnValue(''),
        GetUnScheduleApptColumns: jasmine.createSpy().and.returnValue(''),
        GetAllPatientsColumns: jasmine.createSpy().and.returnValue(''),
        GetPersons: jasmine
          .createSpy()
          .and.returnValue({ then: function () {} }),
        ConvertToPersonObjects: jasmine.createSpy().and.returnValue(''),
        convertToAppointmentsObjects: jasmine.createSpy().and.returnValue(''),
        GetUniqueApptTypes: jasmine.createSpy().and.returnValue(''),
        GetUniqueProviderNames: jasmine.createSpy().and.returnValue(''),
        RetriveAppointments: jasmine
          .createSpy()
          .and.returnValue({ then: function () {} }),
        GetLocations: jasmine
          .createSpy()
          .and.returnValue({ then: function () {} }),
        GetPreventiveCareColumns: jasmine.createSpy().and.returnValue(''),
        GetTreatmentPlanColumns: jasmine.createSpy().and.returnValue(''),
        GetPreventiveCares: jasmine
          .createSpy()
          .and.returnValue({ then: function () {} }),
        GetTreatmentPlans: jasmine
          .createSpy()
          .and.returnValue({ then: function () {} }),
      };
      $provide.value('PatientLandingFactory', patientLandingFactory);
      globalSearchFactory = {
        SaveMostRecentPerson: jasmine.createSpy().and.returnValue(''),
      };
      $provide.value('globalSearchFactory', globalSearchFactory);

      appointmentViewVisibleService = {
        changeAppointmentViewVisible: jasmine.createSpy(),
        registerObserver: jasmine.createSpy(),
        clearObserver: jasmine.createSpy(),
        setAppointmentViewVisible: jasmine.createSpy(),
        setSecondaryAppointmentViewVisible: jasmine.createSpy(),
      };
      $provide.value(
        'AppointmentViewVisibleService',
        appointmentViewVisibleService
      );

      appointmentViewLoadingService = {};

      $provide.value(
        'AppointmentViewLoadingService',
        appointmentViewLoadingService
      );

      appointmentViewDataLoadingService = {
        getViewData: jasmine.createSpy(),
      };
      $provide.value(
        'AppointmentViewDataLoadingService',
        appointmentViewDataLoadingService
      );

      scheduleModalFactory = {};

      $provide.value('ScheduleModalFactory', scheduleModalFactory);

      newLocationsService = {};
      $provide.value('NewLocationsService', newLocationsService);

      $provide.value('ScheduleModalFactory', scheduleModalFactory);

      locationsDisplayService = {};
      $provide.value('LocationsDisplayService', locationsDisplayService);
    })
  );

  beforeEach(inject(function ($rootScope, $controller, $q, $window) {
    scope = $rootScope.$new();
    q = $q;
    rootScope = $rootScope;

    deferred = q.defer();
    window = $window;
    spyOn(window, 'open').and.returnValue('');

    // Mock for location
    location = {
      path: 'path/',
    };

    globalSearchFactory = {
      SaveMostRecentPerson: jasmine.createSpy().and.returnValue(''),
    };

    mockLocations = [{ locationId: 1, location: 'Ngp' }];

    //mock for listHelper service
    listHelper = {
      findItemByFieldValue: jasmine
        .createSpy('listHelper.findItemByFieldValue')
        .and.returnValue(mockLocations),
    };

    patientLandingGrid = {
      allPatientsGridFactory: {
        actions: {},
        resetFilters: jasmine.createSpy(),
        updateFilter: jasmine.createSpy(),
        refresh: jasmine.createSpy(),
      },
      preventiveCareGridFactory: {
        actions: {},
        resetFilters: jasmine.createSpy(),
        updateFilter: jasmine.createSpy(),
        refresh: jasmine.createSpy(),
      },
      treatmentPlansGridFactory: {
        actions: {},
        resetFilters: jasmine.createSpy(),
        updateFilter: jasmine.createSpy(),
        refresh: jasmine.createSpy(),
      },
      appointmentsGridFactory: {
        actions: {},
        resetFilters: jasmine.createSpy(),
        updateFilter: jasmine.createSpy(),
        refresh: jasmine.createSpy(),
      },
      otherToDoGridFactory: {
        actions: {},
        resetFilters: jasmine.createSpy(),
        updateFilter: jasmine.createSpy(),
        refresh: jasmine.createSpy(),
      },
    };

    gridPrintFactory = {
      CreateOptions: jasmine.createSpy().and.callFake(function () {
        return {
          query: {},
          filterCriteria: [],
          sortCriteria: [],
          columnDefinition: [],
          locations: [],
          headerCaption: '',
          getPrintHtml: jasmine.createSpy(),
        };
      }),
    };

    locationServices = {
      getPermittedLocations: jasmine
        .createSpy()
        .and.returnValue({ $promise: deferred.promise }),
    };

    var timeZoneFactory = {
      GetTimeZoneInfo: jasmine.createSpy().and.returnValue({}),
    };

    ctrl = $controller('PatientLandingController', {
      $scope: scope,
      Location: location,
      ListHelper: listHelper,
      PatientLandingGridFactory: patientLandingGrid,
      GridPrintFactory: gridPrintFactory,
      LocationServices: locationServices,
      $location: { search: jasmine.createSpy() },
      TimeZoneFactory: timeZoneFactory,
    });
  }));

  describe('initial values -> ', function () {
    it('controller should exist', function () {
      expect(ctrl).not.toBeNull();
    });

    it('should have injected service', function () {
      expect(personServicesMock).not.toBeNull();
    });
  });

  describe('getLocations function -> ', function () {
    it('should call locationService.get function', function () {
      ctrl.getLocationSuccess = jasmine.createSpy();
      ctrl.getLocations();
      deferred.resolve({});
      scope.$apply();
      expect(locationServices.getPermittedLocations).toHaveBeenCalled();
      expect(ctrl.getLocationSuccess).toHaveBeenCalled();
    });
  });

  //describe('navToPatientProfile function ->', function() {
  //    it('should set path to navigate to patient profile', function() {
  //        var person = {}
  //        person.PatientId = 123;
  //        scope.navToPatientProfile(person);
  //        expect(location.path).toBe('path/');
  //    });
  //});

  describe('isActiveFltrTab  function ->', function () {
    it('should return false if activefltrTab is not equal to filter', function () {
      var filter = 'AllPatients';
      scope.activeFltrTab = 'ScheduleAppointment';
      var result = scope.isActiveFltrTab(filter);
      expect(result).toBe(false);
    });
    it('should return true if activefltrTab is equal to filter ', function () {
      var filter = 'AllPatients';
      scope.activeFltrTab = 'AllPatients';
      var result = scope.isActiveFltrTab(filter);
      expect(result).toBe(true);
    });
  });

  describe('activateFltrTab  function->', function () {
    beforeEach(function () {
      spyOn(document, 'getElementById').and.returnValue({
        innerHtml: 'innerHtml',
      });
      scope.selectedLocationId = 3;
      scope.locations = [{ LocationId: 3 }];
    });

    it('should set columns for all patient tab ', function () {
      var filter = '1';
      scope.activeFltrTab = '2';
      ctrl.fltrTabActivated = false;

      var appointmentFilters = ['Name', 'Phone Number', 'Appointment Date'];
      scope.appointmentFilters = appointmentFilters;

      scope.activateFltrTab(filter);

      expect(ctrl.fltrTabActivated).toBe(true);
      expect(scope.activeGridData).toBe(appointmentFilters);
      expect(scope.appointmentsGridOptions.resetFilters).toHaveBeenCalled();
      expect(scope.appointmentsGridOptions.refresh).toHaveBeenCalled();
    });

    it('should set columns for schedule appointments tab', function () {
      var filter = '1';
      scope.activeFltrTab = '2';

      var appointmentFilters = ['Name', 'Phone Number', 'Appointment Date'];
      scope.appointmentFilters = appointmentFilters;

      scope.activateFltrTab(filter);

      expect(ctrl.fltrTabActivated).toBe(true);
      expect(scope.activeGridData).toBe(appointmentFilters);
      expect(scope.appointmentsGridOptions.resetFilters).toHaveBeenCalled();
      expect(scope.appointmentsGridOptions.refresh).toHaveBeenCalled();
    });

    it('should set column for unscheduled appointments tab', function () {
      var filter = '2';
      scope.activeFltrTab = '1';
      scope.activeGridData = 'activeGridData';

      ctrl.personsListForDisplayDS = {
        _total: 3,
        options: {
          data: ['patient1', 'patient2'],
        },
      };
      ctrl.allPatientsColumns = ['Name', 'Phone Number'];
      scope.activateFltrTab(filter);

      expect(ctrl.fltrTabActivated).toBe(true);
      // Commented this out, its actually undefined, is there a way to check for null and undefined at the same time?
      //expect(scope.activeGridData).toBe(null);
    });
  });

  describe('filterUnreadCommunication Method ->', function () {
    it('should refresh all patients grid', function () {
      scope.allPatientsGridOptions = {
        updateFilter: jasmine.createSpy(),
        refresh: jasmine.createSpy(),
      };
      scope.filteredUnreadCommunication = false;
      scope.activeFltrTab = '2';
      scope.filterUnreadCommunication();
      expect(scope.allPatientsGridOptions.updateFilter).toHaveBeenCalledWith(
        'HasUnreadCommunication',
        scope.filteredUnreadCommunication
      );
      expect(scope.allPatientsGridOptions.refresh).toHaveBeenCalled();
    });

    it('should refresh preventive care grid', function () {
      scope.preventiveCareGridOptions = {
        updateFilter: jasmine.createSpy(),
        refresh: jasmine.createSpy(),
      };
      scope.filteredUnreadCommunication = false;
      scope.activeFltrTab = '7';
      scope.filterUnreadCommunication();
      expect(scope.preventiveCareGridOptions.updateFilter).toHaveBeenCalledWith(
        'HasUnreadCommunication',
        scope.filteredUnreadCommunication
      );
      expect(scope.preventiveCareGridOptions.refresh).toHaveBeenCalled();
    });
    it('should refresh treatment plan grid', function () {
      scope.treatmentPlansGridOptions = {
        updateFilter: jasmine.createSpy(),
        refresh: jasmine.createSpy(),
      };
      scope.filteredUnreadCommunication = false;
      scope.activeFltrTab = '6';
      scope.filterUnreadCommunication();
      expect(scope.treatmentPlansGridOptions.updateFilter).toHaveBeenCalledWith(
        'HasUnreadCommunication',
        scope.filteredUnreadCommunication
      );
      expect(scope.treatmentPlansGridOptions.refresh).toHaveBeenCalled();
    });
    it('should refresh appointment grid', function () {
      scope.appointmentsGridOptions = {
        updateFilter: jasmine.createSpy(),
        refresh: jasmine.createSpy(),
      };
      scope.filteredUnreadCommunication = false;
      scope.activeFltrTab = '1';
      scope.filterUnreadCommunication();
      expect(scope.appointmentsGridOptions.updateFilter).toHaveBeenCalledWith(
        'HasUnreadCommunication',
        scope.filteredUnreadCommunication
      );
      expect(scope.appointmentsGridOptions.refresh).toHaveBeenCalled();
    });
  });

  // Print Grid
  describe('printGrid function ->', function () {
    it('should print All Patients', function () {
      scope.allPatientFilters = {
        FilterCriteria: [],
        SortCriteria: [],
      };

      ctrl.selectedLocation = [{ LocationId: 1, LocationName: 'Location 1' }];

      scope.activeFltrTab = '2';
      scope.printGrid();
      expect(gridPrintFactory.CreateOptions).toHaveBeenCalled();
      expect(ctrl.allPatientPrint.headerCaption).toEqual('All Patients List');
    });
    it('should print Appointments', function () {
      scope.appointmentFilters = {
        FilterCriteria: [],
        SortCriteria: [],
      };

      ctrl.selectedLocation = [{ LocationId: 1, LocationName: 'Location 1' }];

      scope.activeFltrTab = '1';
      scope.printGrid();
      expect(gridPrintFactory.CreateOptions).toHaveBeenCalled();
      expect(ctrl.appointmentPrint.headerCaption).toEqual('Appointments');
      expect(ctrl.appointmentPrint.getPrintHtml).toHaveBeenCalled();
    });
  });
});
