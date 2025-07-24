import { of } from 'rsjs';

describe('patient-header ->', function () {
  //#region Variables
  var rootScope,
    scope,
    ctrl,
    routeParams,
    listHelper,
    controller,
    element,
    staticData,
    mockPatientServices,
    mockAppointmentService,
    mockModalDataFactory,
    mockPatSecurityService,
    AmfaKeys,
    referenceDataService,
    patientCommunicationCenterService,
    mockPatientNotesFactory,
    mockDiscardChangesService,
    mockModalFactory,
    mockNoteTemplatesHttpService,
    mockFeatureFlagService,
    mockPracticeSettingsService;
    
  var mockAppointment = {
    AppointmentId: 1,
    PatientId: 1,
    UserId: 1,
    StartTime: '2015-01-02T08:30:00.000Z',
    EndTime: '2015-01-02T09:30:00.000Z',
  };

  var toastrFactory = {
    error: jasmine.createSpy(),
  };

  var localize = {
    getLocalizedString: jasmine.createSpy(),
  };

  var $q;
  var patientDetailService;
  var locationService;

  var personFactory;
  beforeEach(
    module('Soar.Patient', function ($provide) {
      personFactory = {
        getPatientAlerts: jasmine
          .createSpy()
          .and.returnValue({ then: function () { } }),
        PatientAlerts: null,
        PatientMedicalHistoryAlerts: null,
        SetPatientAlerts: jasmine.createSpy(),
        SetMedicalHistoryAlerts: jasmine.createSpy(),
        SetPatientMedicalHistoryAlerts: jasmine.createSpy(),
        ActiveHipaaAuthorizationSummaries: null,
        SetActiveHipaaAuthorizationSummaries: jasmine.createSpy(),
        ActivePatient: null,
        SetActivePatient: jasmine.createSpy(),
      };
      $provide.value('PersonFactory', personFactory);

      patientCommunicationCenterService = {
        dataForAccountNote: jasmine.createSpy().and.returnValue({
          then: jasmine.createSpy(),
        }),
      };

      $provide.value(
        'PatientCommunicationCenterService',
        patientCommunicationCenterService
      );

      mockFeatureFlagService = {
        getOnce$: jasmine.createSpy().and.returnValue({ subscribe: jasmine.createSpy() }),
      };
      
      $provide.value('FeatureFlagService', mockFeatureFlagService);

    })
  );

  var patientMedicalHistoryAlertsFactory;
  beforeEach(
    module('Soar.Patient', function ($provide) {
      patientMedicalHistoryAlertsFactory = {
        PatientMedicalHistoryAlerts: jasmine
          .createSpy()
          .and.returnValue({ then: function () { } }),
      };
      $provide.value(
        'PatientMedicalHistoryAlertsFactory',
        patientMedicalHistoryAlertsFactory
      );
    })
  );

  function createController() {
    ctrl = controller('PatientHeaderController', {
      $scope: scope,
      $routeParams: routeParams,
      ListHelper: listHelper,
      PatientServices: mockPatientServices,
      toastrFactory: toastrFactory,
      localize: localize,
      AppointmentService: mockAppointmentService,
      ModalDataFactory: mockModalDataFactory,
      PatSecurityService: mockPatSecurityService,
      AmfaKeys: AmfaKeys,
      referenceDataService: referenceDataService,
      discardChangesService: mockDiscardChangesService,
      modalFactory: mockModalFactory,
      NoteTemplatesHttpService: mockNoteTemplatesHttpService,
      PracticeSettingsService: mockPracticeSettingsService,
    });
  }

  //#endregion

  //#region before each
  beforeEach(module('Soar.Common'));
  beforeEach(module('common.factories'));
  beforeEach(
    module('Soar.Patient', function ($provide) {
      referenceDataService = {
        getData: jasmine.createSpy(),
        entityNames: {
          users: 'users',
        },
      };

      $provide.value('referenceDataService', referenceDataService);

      mockDiscardChangesService = {
        currentChangeRegistration: { customMessage: 'Are you sure?' },
      };

      $provide.value('DiscardChangesService', mockDiscardChangesService);

      mockNoteTemplatesHttpService = {
        setDataChanged: jasmine.createSpy(),
      };

      $provide.value('NoteTemplatesHttpService', mockDiscardChangesService);

      mockModalFactory = {
        WarningModal: jasmine
          .createSpy()
          .and.returnValue(Promise.resolve(true)),
      };

      $provide.value('ModalFactory', mockModalFactory);

      mockPatientNotesFactory = {
        setDataChanged: jasmine.createSpy(),
        DataChanged: false,
        clearCached: jasmine.createSpy(),
      };

      $provide.value('PatientNotesFactory', mockPatientNotesFactory);

      patientDetailService = {
        getPatientDashboardOverviewByPatientId: jasmine
          .createSpy()
          .and.returnValue({
            then: function (callback) {
              return callback();
            },
          }),
        setActivePatientId: jasmine.createSpy().and.returnValue({}),
      };
      $provide.value('PatientDetailService', patientDetailService);
      locationService = {
        getAllLocations: jasmine.createSpy().and.returnValue({
          then: function (callback) {
            return callback({ Value: [] });
          },
        }),
      };
      $provide.value('locationService', locationService);
      staticData = {
        AppointmentStatuses: jasmine.createSpy().and.returnValue({
          then: function (callback) {
            return callback({ Value: [] });
          },
        }),
        AlertIcons: jasmine.createSpy().and.returnValue({
          then: function (callback) {
            return callback({ Value: [] });
          },
        }),
      };
      $provide.value('StaticData', staticData);
    })
  );

  beforeEach(inject(function (
    $route,
    $rootScope,
    $location,
    $routeParams,
    $injector,
    $controller,
    _AmfaKeys_
  ) {
    rootScope = $rootScope;
    $q = $injector.get('$q');

    referenceDataService.getData.and.callFake(() => $q.resolve({}));

    routeParams = {
      patientId: 100,
      Category: 'sample',
    };

    mockAppointmentService = {
      ApendDetaisl: jasmine.createSpy(),
    };
    mockPatientServices = {
      PatientAppointment: {
        NextAppointment: jasmine
          .createSpy()
          .and.returnValue({ Value: mockAppointment }),
        AppointmentsForAccount: jasmine.createSpy(),
        GetWithDetails: jasmine.createSpy(),
      },
      Alerts: {
        get: jasmine.createSpy(),
      },
    };

    const mockPracticeSettings = { DefaultTimeIncrement: 15 };

    mockPracticeSettingsService = {
      get: jasmine.createSpy().and.returnValue(of(mockPracticeSettings))
    }

    mockModalDataFactory = {
      GetAppointmentEditData: jasmine.createSpy(),
    };

    listHelper = {
      findIndexByFieldValue: jasmine
        .createSpy('listHelper.findIndexByFieldValue')
        .and.returnValue(0),
      findItemByFieldValue: jasmine
        .createSpy('listHelper.findItemByFieldValue')
        .and.returnValue({ ShowIcon: true }),
    };
    scope = $rootScope.$new();
    controller = $controller;

    element = {
      scrollTop: jasmine.createSpy().and.returnValue(1),
    };
    spyOn(angular, 'element').and.returnValue(element);

    //Create fake for patient data
    scope.patientData = {
      PersonAccount: {},
      primaryPhone: { Type: 'Mobile', PhoneNumber: '1112223333' },
    };
    AmfaKeys = _AmfaKeys_;

    createController();
  }));

  //#endregion

  describe('controller ->', function () {
    beforeEach(function () {
      scope.patientData = {
        PersonAccount: {},
      };
    });

    it('should exist', function () {
      expect(ctrl).not.toBeNull();
    });

    it('should have default values', function () {
      expect(scope.tabs).not.toBeNull();
      expect(scope.tabs.length).toEqual(5);
      expect(scope.tabs[0].Title).toEqual('Overview');
      expect(scope.tabs[0].Selected).toEqual(true);
      expect(scope.tabs[1].Title).toEqual('Appointments');
      expect(scope.tabs[2].Title).toEqual('Clinical');
      expect(scope.tabs[3].Title).toEqual('Account');
      expect(scope.tabs[4].Title).toEqual('Communication Center');
      expect(scope.selectedTabIndex).toEqual(0);
      expect(scope.SelectTab).not.toBeNull();
      expect(scope.nextAppointment).toBeNull();
    });

    describe('SelectTab function ->', function () {
      beforeEach(function () {
        createController();

        scope.tabs[2].TemplateUrl = 'test';
        scope.SelectTab(2);
      });

      it('should set the previous tab to not selected', function () {
        expect(scope.tabs[0].Selected).toEqual(false);
      });

      it('should set the current tab as selected', function () {
        expect(scope.tabs[2].Selected).toEqual(true);
      });

      it('should set selectedTabIndex to the specified index', function () {
        expect(scope.selectedTabIndex).toEqual(2);
      });

      it('should set the activeUrl to the TemplateUrl of the specified tab', function () {
        expect(scope.activeUrl).toEqual('test');
      });
    });

    describe('$routeParams.Category ->', function () {
      it('$routeParams.Categoryshould should call selectOption function if not null', function () {
        createController();
        expect(listHelper.findIndexByFieldValue).toHaveBeenCalledWith(
          scope.tabs,
          'Area',
          routeParams.Category
        );
      });

      describe('With $routeParams.Categoryshould as NULL', function () {
        it('$routeParams.Categoryshould should call SelectTab function if null', function () {
          //mock for routeParams
          routeParams = {
            patientId: 100,
            Category: null,
          };
          createController();
          expect(listHelper.findIndexByFieldValue).not.toHaveBeenCalledWith(
            scope.AccountSummaryOptions,
            'name',
            routeParams.Category
          );
        });
      });
    });

    describe('getNextAppointment ->', function () {
      it('should call patientServices.PatientAppointment.NextAppointment', function () {
        scope.patient = {
          PatientId: 'Z',
        };

        ctrl.getNextAppointment();

        expect(
          mockPatientServices.PatientAppointment.NextAppointment
        ).toHaveBeenCalledWith(
          { PersonId: 'Z' },
          ctrl.getNextAppointmentSuccess,
          ctrl.getNextAppointmentFailure
        );
      });
    });

    describe('getNextAppointmentSuccess ->', function () {
      beforeEach(function () {
        scope.nextAppointment = null;

        spyOn(ctrl, 'appointmentIsForToday').and.returnValue('Z');

        mockAppointment.LocationTimezoneInfo = 'Central Standard Time';
        ctrl.getNextAppointmentSuccess({ Value: mockAppointment });
      });

      it('should set $scope.nextAppointmentId to result.Value.AppointmentId', function () {
        expect(scope.nextappointmentId).toEqual(mockAppointment.AppointmentId);
      });
    });

    describe('getNextAppointmentFailure ->', function () {
      it('should call toastrFactory.error', function () {
        ctrl.getNextAppointmentFailure();

        expect(toastrFactory.error).toHaveBeenCalled();
      });
    });

    describe('getPreferredDentist ->', function () {
      it('get result should not be null', function () {
        scope.patient = { FirstName: 'first', LastName: 'last' };
        scope.patient.PreferredDentist = 1;

        var result = ctrl.getPreferredDentist();

        expect(result).not.toBeNull();
      });
    });

    describe('closeModal  ->', function () {
      it('should call error method', function () {
        scope.modalInstance = {
          dismiss: function () {
            return true;
          },
        };
        spyOn(scope.modalInstance, 'dismiss').and.returnValue(true);
        scope.closeModal();
        expect(scope.modalInstance.dismiss).toHaveBeenCalled();
      });
    });

    describe('changeTabStatus  ->', function () {
      it('should return true if the appointment is scheduled for today', function () {
        ctrl.changeTabStatus();
        expect(listHelper.findItemByFieldValue).toHaveBeenCalledWith(
          scope.tabs,
          'Area',
          'Summary'
        );
      });
    });

    describe('appointmentIsForToday ->', function () {
      it('should return true if the appointment is scheduled for today', function () {
        var appointment = angular.copy(mockAppointment);
        appointment.$$StartTimeLocal = new Date().toISOString();

        var result = ctrl.appointmentIsForToday(appointment);

        expect(result).toEqual(true);
      });

      it('should return false if the appointment is NOT scheduled for today', function () {
        var appointment = angular.copy(mockAppointment);
        appointment.$$StartTimeLocal = '1900-01-01T00:00:00.000Z';

        var result = ctrl.appointmentIsForToday(appointment);

        expect(result).toEqual(false);
      });
    });

    describe('ctrl.filterAlertsByType ->', function () {
      var alerts = [];
      beforeEach(function () {
        alerts.push({
          MedicalHistoryAlertTypeId: 1,
          Description: 'Alert 1',
          PatientId: '1234',
          Id: 11,
        });
        alerts.push({
          MedicalHistoryAlertTypeId: 1,
          Description: 'Alert 2',
          PatientId: '1234',
          Id: 12,
        });
        alerts.push({
          MedicalHistoryAlertTypeId: 1,
          Description: 'Alert 3',
          PatientId: '1234',
          Id: 13,
        });
        alerts.push({
          MedicalHistoryAlertTypeId: 2,
          Description: 'Alert 4',
          PatientId: '1234',
          Id: 14,
        });
        alerts.push({
          MedicalHistoryAlertTypeId: 2,
          Description: 'Alert 5',
          PatientId: '1234',
          Id: 15,
        });
        alerts.push({
          MedicalHistoryAlertTypeId: 3,
          Description: 'Alert 6',
          PatientId: '1234',
          Id: 16,
        });
        alerts.push({
          MedicalHistoryAlertTypeId: 3,
          Description: 'Alert 7',
          PatientId: '1234',
          Id: 17,
        });
        alerts.push({
          MedicalHistoryAlertTypeId: 3,
          Description: 'Alert 8',
          PatientId: '1234',
          Id: 18,
        });
        alerts.push({
          MedicalHistoryAlertTypeId: 3,
          Description: 'Alert 9',
          PatientId: '1234',
          Id: 19,
        });
      });
      it(
        'should filter medicalAlerts to populate scope.patientAllergyAlerts to contain alerts with MedicalHistoryAlertTypeId equal to 1' +
        'scope.patientMedicalAlerts to contain alerts with MedicalHistoryAlertTypeId equal to 2' +
        'scope.patientPremedAlerts to contain alerts with MedicalHistoryAlertTypeId equal to 3',
        function () {
          ctrl.filterAlertsByType(alerts);
          expect(scope.patientAllergyAlerts.length).toEqual(3);
          expect(scope.patientMedicalAlerts.length).toEqual(2);
          expect(scope.patientPremedAlerts.length).toEqual(4);
        }
      );
    });

    describe('on soar:medical-history-form-created->', function () {
      var medicalHistoryForm;
      beforeEach(function () {
        medicalHistoryForm = {};
        spyOn(ctrl, 'getMedicalHistoryAlerts').and.returnValue($q.resolve());
        spyOn(ctrl, 'getPatientFlags');
        personFactory.PatientAlerts = [{}];
        personFactory.PatientMedicalHistoryAlerts = [{}];
      });
      it('should call getMedicalHistoryAlerts ', function () {
        scope.$broadcast(
          'soar:medical-history-form-created',
          medicalHistoryForm
        );
        scope.$apply();
        expect(ctrl.getMedicalHistoryAlerts).toHaveBeenCalled();
      });
      it('should call getPatientFlags ', function () {
        scope.$broadcast(
          'soar:medical-history-form-created',
          medicalHistoryForm
        );
        scope.$apply();
        expect(ctrl.getPatientFlags).toHaveBeenCalled();
      });

      it('should clear personFactory.PatientAlerts and personFactory.PatientMedicalHistoryAlerts', function () {
        scope.$broadcast(
          'soar:medical-history-form-created',
          medicalHistoryForm
        );
        scope.$apply();
        expect(personFactory.PatientAlerts).toBe(null);
        expect(personFactory.PatientMedicalHistoryAlerts).toBe(null);
      });
    });

    describe('on alerts-updated ->', function () {
      var medicalHistoryForm;
      beforeEach(function () {
        medicalHistoryForm = {};
        spyOn(ctrl, 'getMedicalHistoryAlerts').and.returnValue($q.resolve());
        spyOn(ctrl, 'getPatientFlags');
        personFactory.PatientAlerts = [{}];
        personFactory.PatientMedicalHistoryAlerts = [{}];
      });
      it('should call getMedicalHistoryAlerts ', function () {
        scope.$broadcast('alerts-updated', medicalHistoryForm);
        scope.$apply();
        expect(ctrl.getMedicalHistoryAlerts).toHaveBeenCalled();
      });
      it('should call getPatientFlags ', function () {
        scope.$broadcast('alerts-updated', medicalHistoryForm);
        scope.$apply();
        expect(ctrl.getPatientFlags).toHaveBeenCalled();
      });

      it('should clear personFactory.PatientAlerts and personFactory.PatientMedicalHistoryAlerts', function () {
        scope.$broadcast('alerts-updated', medicalHistoryForm);
        scope.$apply();
        expect(personFactory.PatientAlerts).toBe(null);
        expect(personFactory.PatientMedicalHistoryAlerts).toBe(null);
      });
    });

    describe('ctrl.initializeStatusList method ->', function () {
      it('it should call staticData.AppointmentStatuses', function () {
        ctrl.initializeStatusList();
        expect(staticData.AppointmentStatuses).toHaveBeenCalled();
        expect(mockPracticeSettingsService.get).toHaveBeenCalled();
      });

      it('it should call practiceSettingsService.get for practiceSettings', function () {
        ctrl.initializeStatusList();
        expect(staticData.AppointmentStatuses).toHaveBeenCalled();
        expect(mockPracticeSettingsService.get).toHaveBeenCalled();
      });
    });

    describe('patientData.ResponsiblePersonName watch -> ', function () {
      beforeEach(function () {
        scope.patientData = {
          ResponsiblePersonName: 'Bob Smith',
          ResponsiblePersonId: '1234',
          ResponsiblePersonType: 1,
        };
      });

      it('should update scope.patient when scope.patientData changes', function () {
        scope.$apply();
        expect(scope.patient.ResponsiblePersonName).toBe('Bob Smith');
        expect(scope.patient.ResponsiblePersonId).toBe('1234');
        expect(scope.patient.ResponsiblePersonType).toBe(1);

        scope.patientData = {
          ResponsiblePersonName: 'Jane Smith',
          ResponsiblePersonId: '1234',
          ResponsiblePersonType: 2,
        };
        scope.$apply();
        expect(scope.patient.ResponsiblePersonName).toBe('Jane Smith');
        expect(scope.patient.ResponsiblePersonId).toBe('1234');
        expect(scope.patient.ResponsiblePersonType).toBe(2);
      });
    });

    describe('scope.openDrawer function-> ', function () {
      beforeEach(function () { });

      it('should call warning modal when patient notes DataChanged is true and index is not 1 or 4', function () {
        mockPatientNotesFactory.DataChanged = true;

        scope.openDrawer(2);

        expect(mockModalFactory.WarningModal).toHaveBeenCalled();
      });

      it('should not call warning modal when patient notes DataChanged is false', function () {
        mockPatientNotesFactory.DataChanged = false;

        scope.openDrawer(2);

        expect(mockModalFactory.WarningModal).not.toHaveBeenCalled();
      });

      it('should not call warning modal when index is 1', function () {
        mockPatientNotesFactory.DataChanged = true;

        scope.openDrawer(1);

        expect(mockModalFactory.WarningModal).not.toHaveBeenCalled();
      });

      it('should not call warning modal when index is 4', function () {
        mockPatientNotesFactory.DataChanged = true;

        scope.openDrawer(4);

        expect(mockModalFactory.WarningModal).not.toHaveBeenCalled();
      });

      it('should not call warning modal when showCommunicationDrawerNav is true', function () {
        mockPatientNotesFactory.DataChanged = true;
        scope.showCommunicationDrawerNav = true;

        scope.openDrawer(2);

        expect(mockModalFactory.WarningModal).not.toHaveBeenCalled();
      });
    });

    describe('onInit method -> ', function () {
      beforeEach(function () {
        scope.patientData = { Flags: [{}, {}], MedicalHistoryAlerts: [{}, {}] };
        spyOn(ctrl, 'initializeStatusList').and.callThrough();
        spyOn(ctrl, 'getDisplayName').and.callThrough();
      });

      it('should call getDisplayName and initializeStatusList if patient', function () {
        ctrl.onInit();
        scope.$apply();
        expect(ctrl.initializeStatusList).toHaveBeenCalled();
        expect(ctrl.getDisplayName).toHaveBeenCalled();
      });

      it('should call SetPatientAlerts and SetPatientMedicalHistoryAlerts on the personFactory if patient has them', function () {
        ctrl.onInit();
        scope.$apply();
        expect(personFactory.SetPatientAlerts).toHaveBeenCalledWith(
          scope.patientData.Flags
        );
        expect(
          personFactory.SetPatientMedicalHistoryAlerts
        ).toHaveBeenCalledWith(scope.patientData.MedicalHistoryAlerts);
      });

      it('should not call SetPatientAlerts and SetPatientMedicalHistoryAlerts on the personFactory if patient does not them', function () {
        ctrl.onInit();
        scope.$apply();
        scope.patientData.Flags = null;
        scope.patientData.MedicalHistoryAlerts = null;
        expect(personFactory.SetPatientAlerts).not.toHaveBeenCalledWith(
          scope.patientData.Flags
        );
        expect(
          personFactory.SetPatientMedicalHistoryAlerts
        ).not.toHaveBeenCalledWith(scope.patientData.MedicalHistoryAlerts);
      });
    });

    describe('scope.patientData.PersonAccount watch -> ', function () {
      beforeEach(function () {
        spyOn(ctrl, 'getPatientStatusDisplay').and.callFake(function () { });
      });

      it('should call ctrl.getPatientStatusDisplay ', function () {
        scope.patientData.PersonAccount = null;
        scope.patientLoaded = false;
        scope.$apply();
        scope.patientData.PersonAccount = {
          PersonAccountMember: { AccountId: '1234', AccountMemberId: '4321' },
        };
        scope.patientLoaded = true;
        scope.$apply();
        expect(ctrl.getPatientStatusDisplay).toHaveBeenCalled();
      });
    });

    describe('getPatientStatusDisplay method->', function () {
      beforeEach(function () {
        ctrl.hasMedicalAlertsViewAccess = true;
        scope.patient = {
          PatientId: '1234',
          IsActive: true,
          IsPatient: true,
          PersonAccount: {
            InCollection: true,
            PersonAccountMember: { AccountId: '3412', AccountMemberId: '4321' },
          },
        };
      });
      it('should set scope.patient.$$DisplayStatus based on PersonAccount if scope.patient.PersonAccount.InCollection equals true', function () {
        scope.patient.PersonAccount.InCollection = true;
        ctrl.getPatientStatusDisplay();
        expect(localize.getLocalizedString).toHaveBeenCalledWith(
          'In Collections'
        );
      });
      it('should set scope.patient.$$DisplayStatus based on if scope.patient.IsActive and scope.patient.IsPatient if scope.patient.PersonAccount.InCollection equals false', function () {
        scope.patient.PersonAccount.InCollection = false;
        scope.patient.IsActive = true;
        scope.patient.IsPatient = true;
        ctrl.getPatientStatusDisplay();
        expect(localize.getLocalizedString).toHaveBeenCalledWith(
          'Active Patient'
        );

        scope.patient.IsPatient = false;
        ctrl.getPatientStatusDisplay();
        expect(localize.getLocalizedString).toHaveBeenCalledWith(
          'Active Non-Patient'
        );

        scope.patient.IsActive = false;
        ctrl.getPatientStatusDisplay();
        expect(localize.getLocalizedString).toHaveBeenCalledWith(
          'Inactive Non-Patient'
        );

        scope.patient.IsPatient = true;
        ctrl.getPatientStatusDisplay();
        expect(localize.getLocalizedString).toHaveBeenCalledWith(
          'Inactive Patient'
        );
      });
    });

    describe('getPatientFlags method->', function () {
      beforeEach(function () {
        ctrl.hasMedicalAlertsViewAccess = true;
      });
      it('should call personFactory.PatientAlerts if personFactory.PatientAlerts is null', function () {
        personFactory.PatientAlerts = null;
        ctrl.getPatientFlags();
        expect(personFactory.getPatientAlerts).toHaveBeenCalledWith(
          scope.patient.PatientId
        );
      });
    });

    describe('getPatientFlags method->', function () {
      beforeEach(function () {
        ctrl.hasMedicalAlertsViewAccess = true;
      });
      it('should call personFactory.PatientAlerts if personFactory.PatientAlerts is null', function () {
        personFactory.PatientAlerts = null;
        ctrl.getPatientFlags();
        expect(personFactory.getPatientAlerts).toHaveBeenCalledWith(
          scope.patient.PatientId
        );
      });
    });

    describe('getPatientFlags ->', function () {
      beforeEach(function () {
        spyOn(ctrl, 'patientAlertsServiceGetSuccess');
      });
      it('should load patientAlerts from personFactory.PatientAlerts if available', function () {
        personFactory.PatientAlerts = [{}, {}];
        scope.patient = { PatientId: '11' };
        ctrl.hasMedicalAlertsViewAccess = true;
        ctrl.getPatientFlags();
        expect(ctrl.patientAlertsServiceGetSuccess).toHaveBeenCalledWith({
          Value: personFactory.PatientAlerts,
        });
        expect(personFactory.getPatientAlerts).not.toHaveBeenCalledWith(
          scope.patient.PatientId
        );
      });

      it('should call personFactory.getPatientAlerts when personFactory.PatientAlerts is null ', function () {
        personFactory.PatientAlerts = null;
        scope.patient = { PatientId: '11' };
        ctrl.hasMedicalAlertsViewAccess = true;
        ctrl.getPatientFlags();
        expect(personFactory.getPatientAlerts).toHaveBeenCalledWith(
          scope.patient.PatientId
        );
      });
    });

    describe('getMedicalHistoryAlerts ->', function () {
      beforeEach(function () {
        spyOn(ctrl, 'filterAlertsByType');
      });
      it('should load medicalHistoryAlerts from personFactory.PatientMedicalHistoryAlerts if available', function () {
        personFactory.PatientMedicalHistoryAlerts = [{}, {}];
        scope.patient = { PatientId: '11' };
        ctrl.hasMedicalAlertsViewAccess = true;
        ctrl.getMedicalHistoryAlerts();
        expect(ctrl.filterAlertsByType).toHaveBeenCalledWith(
          personFactory.PatientMedicalHistoryAlerts
        );
        expect(
          patientMedicalHistoryAlertsFactory.PatientMedicalHistoryAlerts
        ).not.toHaveBeenCalledWith(scope.patient.PatientId);
      });

      it('should call PatientMedicalHistoryAlerts when personFactory.PatientMedicalHistoryAlerts is null ', function () {
        personFactory.PatientMedicalHistoryAlerts = null;
        scope.patient = { PatientId: '11' };
        ctrl.hasMedicalAlertsViewAccess = true;
        ctrl.getMedicalHistoryAlerts();
        expect(
          patientMedicalHistoryAlertsFactory.PatientMedicalHistoryAlerts
        ).toHaveBeenCalledWith(scope.patient.PatientId);
      });
    });

    describe('ctrl.addPhoneType method ->', function () {
      beforeEach(function () {
        scope.patient = { PatientId: '1234' };
      });
      it('should load primaryPhone.$$Description with patient.primaryPhone if exists', function () {
        scope.patient.primaryPhone = { Type: 'Mobile' };
        ctrl.addPhoneType(scope.patient);
        expect(scope.patient.primaryPhone.$$Description).toBe('(M)');
      });

      it('should load primaryPhone.$$Description with empty string if patient.primaryPhone is null', function () {
        scope.patient.primaryPhone = null;
        ctrl.addPhoneType(scope.patient);
        expect(scope.patient.primaryPhone.$$Description).toBe('');
      });
    });
    describe('$routeParams.Category ->', function () {
      it('$routeParams.Category should enable flags if Category is Communication', function () {
        routeParams = {
          patientId: 100,
          Category: 'Communication',
        };
        createController();
        expect(scope.showDrawerNav).toEqual(true);
        expect(scope.showCommunicationDrawerNav).toEqual(true);
      });
      it('$routeParams.Category should enable and disable flags if Category is Clinical', function () {
        routeParams = {
          patientId: 100,
          Category: 'Clinical',
        };
        createController();
        expect(scope.showDrawerNav).toEqual(true);
        expect(scope.showCommunicationDrawerNav).toEqual(false);
      });
    });
    /*
        ctrl.addPhoneType = function (patient) {
            var phoneDesc = '';
            if (patient && patient.primaryPhone && patient.primaryPhone.Type) {
                phoneDesc = patient.primaryPhone.Type === 'Mobile' ? '(M)' : patient.primaryPhone.Type === 'Home' ? '(H)' : '(W)';
            } else {
                phoneDesc = '';
            }

            if (patient && patient.primaryPhone && patient.primaryPhone.$$Description !== phoneDesc) {
                patient.primaryPhone.$$Description = phoneDesc;
            }
            else if (phoneDesc === '' && _.isNull(patient.primaryPhone)) {
                patient.primaryPhone = { $$Description: '' };
            }
        };
        */
  });
});
