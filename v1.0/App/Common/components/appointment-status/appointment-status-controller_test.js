describe('appointment-status directive controller ->', function () {
  beforeEach(module('kendo.directives'));
  beforeEach(module('Soar.Common'));
  beforeEach(module('common.factories'));
  beforeEach(module('common.directives'));

  var scope,
    ctrl,
    mockStaticData,
    mockListHelper,
    timeout,
    patientValidationFactory,
    patientAppointmentsFactory,
    location,
    localize,
    patientServices;
  var modalFactory, locationService, tabLauncher;

  var mockStatusList = [
    { Id: 'A', Description: 'First' },
    { Id: 'M', Description: 'Second' },
    { Id: 'Z', Description: 'Third' },
  ];

  var mockStatusEnum = {
    CheckOut: 'A',
    ReminderSent: '1',
    Remove: 'D',
    Reschedule: 'E',
    Unconfirmed: 'F',
    Completed: '3',
    InReception: '6',
    Unschedule: 'U',
    InTreatment: '4',
    ReadyForCheckout: '5',
    Confirmed: '0',
    StartAppointment: '10',
  };

  var mockStatusData = {
    List: mockStatusList,
    Enum: mockStatusEnum,
  };

  var scheduleServices;

  var mockModalFactory = {
    AppointmentStatusModal: jasmine.createSpy().and.returnValue({
      then: jasmine.createSpy().and.returnValue('some modal instance'),
    }),
  };

  var mockModalDataFactory;

  var mockSaveStates = {
    None: 'None',
    Add: 'Add',
    Update: 'Update',
    Delete: 'Delete',
    Failed: 'Failed',
  };

  beforeEach(
    module('Soar.Schedule', function ($provide) {
      scheduleServices = {
        Dtos: {
          Appointment: {
            Operations: {
              Update: jasmine.createSpy('AppointmentUpdate'),
              Delete: jasmine.createSpy('AppointmentDelete'),
            },
          },
        },
        SoftDelete: {
          Appointment: jasmine.createSpy(),
        },
        AppointmentStatus: {
          Update: jasmine.createSpy(),
        },
      };
      $provide.value('ScheduleServices', scheduleServices);

      patientServices = {
        PatientAppointment: {
          HardDeletedDueToBeingMissed: jasmine.createSpy().and.returnValue({}),
        },
      };
      $provide.value('PatientServices', patientServices);

      tabLauncher = {
        launchNewTab: jasmine.createSpy(),
      };
      $provide.value('tabLauncher', tabLauncher);

      modalFactory = {
        AppointmentStatusModal: jasmine.createSpy().and.returnValue({
          then: jasmine.createSpy(),
        }),
      };
      $provide.value('ModalFactory', modalFactory);

      localize = {
        getLocalizedString: jasmine.createSpy().and.callFake(function (val) {
          return val;
        }),
      };
      $provide.value('localize', localize);

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
        PatientSearchValidation: jasmine.createSpy().and.returnValue({
          then: jasmine.createSpy(),
        }),
        GetAllAccountValidation: jasmine.createSpy().and.returnValue({
          then: jasmine.createSpy(),
        }),
        LaunchPatientLocationErrorModal: jasmine.createSpy(),
      };
      $provide.value('PatientValidationFactory', patientValidationFactory);

      patientAppointmentsFactory = {
        setLoadHistory: jasmine.createSpy(),
      };
      $provide.value('PatientAppointmentsFactory', patientAppointmentsFactory);

      mockModalDataFactory = {};

      $provide.value('ModalDataFactory', mockModalDataFactory);

      location = {
        url: jasmine.createSpy('documentService.get'),
        path: jasmine.createSpy('$location.path').and.returnValue({
          includes: jasmine.createSpy().and.returnValue({}),
        }),
        search: jasmine.createSpy(),
      };

      locationService = {};
    })
  );

  beforeEach(inject(function ($rootScope, $controller, $timeout) {
    scope = $rootScope.$new();
    timeout = $timeout;

    mockStaticData = {
      AppointmentStatuses: jasmine
        .createSpy()
        .and.returnValue(angular.copy(mockStatusData)),
    };

    mockListHelper = {
      findItemByFieldValue: jasmine
        .createSpy()
        .and.returnValue(angular.copy(mockStatusList[1])),
    };

    ctrl = $controller('AppointmentStatusController', {
      $scope: scope,
      StaticData: mockStaticData,
      ListHelper: mockListHelper,
      ScheduleServices: scheduleServices,
      ModalFactory: mockModalFactory,
      SaveStates: mockSaveStates,
      $location: location,
      $window: window,
      locationService: locationService,
    });
  }));

  beforeEach(function () {
    sessionStorage.setItem(
      'activeLocations',
      '[{"id":23,"name":"PracticePerf7","practiceid":7,"merchantid":"","description":"","timezone":"Central Standard Time","deactivationTimeUtc":null},{"id":24,"name":"Location24Practice7_f","practiceid":7,"merchantid":"","description":"","timezone":"Central Standard Time","deactivationTimeUtc":null}]'
    );
  });

  it('should initialize the controller', function () {
    expect(ctrl).not.toBeNull();
  });

  describe('intializeScopeVariables ->', function () {
    beforeEach(function () {
      scope.appointment = { AppointmentId: '' };

      scope.statusList = [
        { Value: '2', Description: 'Confirmed' },
        { Value: '3', Description: 'Completed' },
        { Value: '0', Description: 'Unconfirmed' },
      ];
      ctrl.initializeStaticData = jasmine.createSpy();
      ctrl.setSelectedStatusById = jasmine.createSpy();
      scope.$watch = jasmine.createSpy();
    });

    it('should set the status to Unconfirmed on a new appointment', function () {
      scope.appointment.AppointmentId = null;
      scope.appointment.Status = undefined;
      ctrl.intializeScopeVariables();
      expect(scope.appointment.Status).toEqual('0');
    });

    it('should not reset the status on existing appointment', function () {
      scope.appointment.AppointmentId = 1234;
      scope.appointment.Status = 'Z';
      ctrl.intializeScopeVariables();
      expect(scope.appointment.Status).toEqual('Z');
    });

    it('should not reset the status on appointment that already has a status', function () {
      scope.appointment.AppointmentId = null;
      scope.appointment.Status = 'Z';
      ctrl.intializeScopeVariables();
      expect(scope.appointment.Status).toEqual('Z');
    });

    it('should call initializeStaticData', function () {
      scope.appointment.Status = 'Z';
      ctrl.intializeScopeVariables();
      expect(ctrl.initializeStaticData).toHaveBeenCalled();
    });

    it('should call setSelectedStatusById', function () {
      scope.appointment.Status = 'Z';
      ctrl.intializeScopeVariables();
      expect(ctrl.setSelectedStatusById).toHaveBeenCalledWith('Z');
    });

    it('should watch appointment.Status', function () {
      scope.appointment.Status = 'Z';
      ctrl.intializeScopeVariables();
      expect(scope.$watch).toHaveBeenCalledWith(
        'appointment.Status',
        ctrl.appointmentStatusChanged
      );
    });
  });

  describe('initializeControllerVariables ->', function () {
    var tomorow;

    beforeEach(function () {
      scope.statusList = angular.copy(mockStatusList);

      scope.selectedStatus = { Status: 'ZZZ' };

      tomorow = new Date();
      tomorow.setHours(0);
      tomorow.setMinutes(0);
      tomorow.setSeconds(0);
      tomorow.setMilliseconds(0);
      tomorow.setDate(tomorow.getDate() + 1);

      ctrl.initializeControllerVariables();
    });

    it('should initialize the default status', function () {
      expect(ctrl.defaultStatus).toEqual(mockStatusList[0]);
    });

    it("should initialize the original status to the current selected status, which should be the object corresponding to the appointment's original status", function () {
      expect(ctrl.originalStatus).toEqual(scope.selectedStatus);
    });
  });

  describe('initializeStaticData ->', function () {
    it('should initialize the status list with the values from staticData.AppointmentStatuses', function () {
      ctrl.initializeStaticData();

      expect(mockStaticData.AppointmentStatuses).toHaveBeenCalled();
      expect(scope.statusList).toEqual(mockStatusData.List);
      expect(scope.statuses).toEqual(mockStatusData.Enum);
    });
  });

  describe('getStatusById ->', function () {
    it('should call listHelper.findItemByFieldValue with the status id passed to the function and return the result', function () {
      scope.statusList = 'the list of statuses';

      var result = ctrl.getStatusById('Z');

      expect(mockListHelper.findItemByFieldValue).toHaveBeenCalledWith(
        scope.statusList,
        'Value',
        'Z'
      );
      expect(result).toEqual(mockStatusList[1]);
    });
  });

  describe('setSelectedStatusById ->', function () {
    var selectedStatus;

    beforeEach(function () {
      let loggedInLocation = { id: 1 };
      locationService.getCurrentLocation = jasmine
        .createSpy()
        .and.returnValue(loggedInLocation);

      selectedStatus = {
        Description: 'some status',
        Value: 123,
      };

      scope.statuses = {};

      ctrl.lastStatusId = 321;

      ctrl.defaultStatus = 'some default';

      ctrl.ShowStatusModal = jasmine.createSpy();
      ctrl.ShowCheckoutModal = jasmine.createSpy();
      ctrl.getStatusById = jasmine.createSpy().and.returnValue(selectedStatus);
    });

    it('should call getStatusById', function () {
      ctrl.setSelectedStatusById('Z');

      expect(ctrl.getStatusById).toHaveBeenCalledWith('Z');
    });

    it('should call ShowStatusModal and set ctrl.lastStatusId when status is Unschedule', function () {
      scope.statuses = { Unschedule: 123 };

      ctrl.setSelectedStatusById(1, 2);

      expect(ctrl.ShowStatusModal).toHaveBeenCalled();
      expect(ctrl.lastStatusId).toBe(2);
    });

    it('should call ShowCheckoutModal and set ctrl.lastStatusId when status is CheckOut', function () {
      scope.appointment = {};
      scope.appointment.LocationId = 1;

      let loggedInLocation = { LocationId: 1 };
      locationService = {};
      locationService.getCurrentLocation = jasmine
        .createSpy()
        .and.returnValue(loggedInLocation);

      scope.statuses = { CheckOut: 123 };

      ctrl.setSelectedStatusById(1, 2);

      expect(ctrl.ShowCheckoutModal).toHaveBeenCalledWith(2);
      expect(ctrl.lastStatusId).toBe(2);
    });

    it('should set selectedStatus to new status when status is other', function () {
      ctrl.setSelectedStatusById(1, 2);

      expect(scope.selectedStatus).toBe(selectedStatus);
    });
  });

  describe('confirmAction function', function () {
    it('should call onChange', function () {
      var appointment = { AppointmentId: 1 };
      ctrl.onChange = jasmine.createSpy('onChange');

      ctrl.confirmAction(appointment);

      expect(ctrl.onChange).toHaveBeenCalled();
    });
  });

  describe('cancelAction function ->', function () {
    it('should set appointment.Status to lastStatusId', function () {
      scope.appointment = {
        Status: 1,
      };
      ctrl.lastStatusId = 2;
      ctrl.cancelAction();

      expect(scope.appointment.Status).toBe(2);
    });
  });

  describe('appointmentHasChanges ->', function () {
    var appointment;

    beforeEach(function () {
      appointment = {
        ObjectState: mockSaveStates.None,
        PlannedServices: 'planned services',
        ProviderAppointments: 'provider appointments',
      };

      ctrl.objectHasChanges = jasmine.createSpy().and.returnValue(false);

      mockListHelper.findIndexByPredicate = jasmine
        .createSpy()
        .and.returnValue(-1);
    });

    it('should return false if no appointment is passed to it', function () {
      var result = ctrl.appointmentHasChanges(null);

      expect(result).toEqual(false);
    });

    it('should return true if the appointment has changes', function () {
      appointment.ObjectState = mockSaveStates.Update;

      var result = ctrl.appointmentHasChanges(appointment);

      expect(result).toEqual(true);
    });

    it("should return true if the appointment's plannde services have changes", function () {
      appointment.ObjectState = mockSaveStates.Update;

      mockListHelper.findIndexByPredicate = jasmine
        .createSpy()
        .and.callFake(function (value) {
          if (value == 'planned services') {
            return 1;
          } else {
            return -1;
          }
        });

      var result = ctrl.appointmentHasChanges(appointment);

      expect(result).toEqual(true);
    });

    it("should return true if the appointment's plannde services have changes", function () {
      appointment.ObjectState = mockSaveStates.Update;

      mockListHelper.findIndexByPredicate = jasmine
        .createSpy()
        .and.callFake(function (value) {
          if (value == 'provider appointments') {
            return 1;
          } else {
            return -1;
          }
        });

      var result = ctrl.appointmentHasChanges(appointment);

      expect(result).toEqual(true);
    });

    it("should return true if the appointment, it's planned services, and it's provider appointments have no changes", function () {
      var result = ctrl.appointmentHasChanges(appointment);

      expect(result).toEqual(false);
    });
  });

  describe('objectHasChanges ->', function () {
    it('should return false if no object is passed to it', function () {
      var result = ctrl.objectHasChanges();

      expect(result).toEqual(false);
    });

    it("should return false if the object's ObjectState property isn't set", function () {
      var object = {};

      var result = ctrl.objectHasChanges(object);

      expect(result).toEqual(false);
    });

    it("should return true if the object's ObjectState property is set to something other than None", function () {
      var object = {
        ObjectState: 'anything',
      };

      var result = ctrl.objectHasChanges(object);

      expect(result).toEqual(true);
    });

    it("should return false if the object's ObjectState property is set to None", function () {
      var object = {
        ObjectState: mockSaveStates.None,
      };

      var result = ctrl.objectHasChanges(object);

      expect(result).toEqual(false);
    });
  });

  describe('setAppointmentStatusFromStatusObject ->', function () {
    beforeEach(function () {
      scope.$apply = jasmine.createSpy();
    });

    it('should set appointment.Status to the Value property of the status passed to the function if it exists', function () {
      var someStatus = { Value: 'some value' };

      scope.appointment = { Status: 123 };

      ctrl.setAppointmentStatusFromStatusObject(someStatus);

      expect(scope.appointment.Status).toEqual(someStatus.Value);
    });

    it('should set appointment.Status to the Value property of defaultStatus if the status passed to the function does has a null Value property', function () {
      var someStatus = { Value: null };
      ctrl.defaultStatus = { Value: 'a different value' };

      scope.appointment = { Status: 123 };

      ctrl.setAppointmentStatusFromStatusObject(someStatus);

      expect(scope.appointment.Status).toEqual(ctrl.defaultStatus.Value);
    });

    it('should set appointment.Status to the Value property of defaultStatus if not status is passed to the function', function () {
      ctrl.defaultStatus = { Value: 'a default value' };

      scope.appointment = { Status: 123 };

      ctrl.setAppointmentStatusFromStatusObject();

      expect(scope.appointment.Status).toEqual(ctrl.defaultStatus.Value);
    });

    it('should call $scope.$apply to ensure that changes are picked up in the scope heirarchy', function () {
      ctrl.defaultStatus = { Value: 'a different value' };

      scope.appointment = { Status: 123 };

      ctrl.setAppointmentStatusFromStatusObject();
      timeout.flush();
      expect(scope.$apply).toHaveBeenCalled();
    });
  });

  describe('appointmentStatusChanged ->', function () {
    it('should call setSelectedStatusById with the new value passed to the function', function () {
      var newValue = 1;
      var oldValue = 2;
      ctrl.originalStatus = { Value: 2 };

      ctrl.setSelectedStatusById = jasmine.createSpy();
      spyOn(ctrl, 'disableControls');

      ctrl.appointmentStatusChanged(newValue, oldValue);

      expect(ctrl.setSelectedStatusById).toHaveBeenCalledWith(1, 2);

      expect(ctrl.disableControls).toHaveBeenCalled();
    });
  });

  describe('disableControls ->', function () {
    it("should call disableOption with CheckOut and Completed if the appointment's StartTime is later than today", function () {
      var tomorow = new Date();
      tomorow.setHours(0);
      tomorow.setMinutes(0);
      tomorow.setSeconds(0);
      tomorow.setMilliseconds(0);
      tomorow.setDate(tomorow.getDate() + 1);

      var dayAfterTomorrow = new Date(tomorow.getTime());
      dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 1);

      scope.tomorrow = tomorow;
      scope.appointment = { StartTime: dayAfterTomorrow };

      scope.statuses = angular.copy(mockStatusEnum);

      ctrl.disableOption = jasmine.createSpy();

      ctrl.disableControls();

      expect(ctrl.disableOption).toHaveBeenCalledWith(
        scope.statuses.InReception
      );
      expect(ctrl.disableOption).toHaveBeenCalledWith(scope.statuses.Completed);
    });

    it('should not call disableOption with InReception appointment is Completed', function () {
      var today = new Date();

      scope.statuses = angular.copy(mockStatusEnum);

      scope.appointment = {
        Status: scope.statuses.Completed,
        StartTime: today,
      };

      ctrl.disableOption = jasmine.createSpy();

      ctrl.disableControls();

      expect(ctrl.disableOption).not.toHaveBeenCalledWith(
        scope.statuses.InReception
      );
    });
  });

  describe('disableOption ->', function () {
    var angularElement, optionItem;

    beforeEach(function () {
      angularElement = { addClass: jasmine.createSpy() };
      optionItem = {
        disabled: 'some disabled state',
      };

      spyOn(angular, 'element').and.returnValue(angularElement);
      ctrl.getOptionItem = jasmine.createSpy().and.returnValue(optionItem);

      ctrl.disableOption();
    });

    it("should set the option item's disabled property true", function () {
      expect(optionItem.disabled).toEqual(true);
    });

    it("should add the 'text-muted' class to the option item's element", function () {
      expect(angularElement.addClass).toHaveBeenCalledWith('text-muted');
    });
  });

  describe('getOptionItem ->', function () {
    beforeEach(function () {
      mockListHelper.findIndexByFieldValue = jasmine
        .createSpy()
        .and.returnValue(1);
      spyOn(angular, 'element').and.returnValue([
        'first option item',
        'second option item',
        'third option item',
      ]);
    });

    it('should return null when ctrl.elementId is empty', function () {
      ctrl.elementId = '';
      expect(ctrl.getOptionItem('Z')).toBeNull();
      expect(mockListHelper.findIndexByFieldValue).not.toHaveBeenCalled();
      expect(angular.element).not.toHaveBeenCalled();
    });

    it('should return the element of the status specified by the value passed in to the function', function () {
      ctrl.elementId = 'id';
      var result = ctrl.getOptionItem('Z');

      expect(mockListHelper.findIndexByFieldValue).toHaveBeenCalledWith(
        scope.statusList,
        'Value',
        'Z'
      );
      expect(angular.element).toHaveBeenCalledWith('#id .k-item');

      expect(result).toEqual('second option item');
    });

    it('should return null when the status is not found', function () {
      mockListHelper.findIndexByFieldValue = jasmine
        .createSpy()
        .and.returnValue(-1);
      ctrl.elementId = 'id';

      expect(ctrl.getOptionItem('Z')).toBeNull();
      expect(mockListHelper.findIndexByFieldValue).toHaveBeenCalled();
      expect(angular.element).not.toHaveBeenCalled();
    });
  });

  describe('selectedStatusChanged ->', function () {
    beforeEach(function () {
      scope.appointment = {};
      scope.statuses = { StartAppointment: 11, Completed: 3 };
      scope.onChange = null;
      ctrl.originalStatus = {};
    });

    it('should call setAppointmentStatusFromStatusObject with scope.selectedStatus when no status parameter', function () {
      scope.selectedStatus = 3;

      ctrl.setAppointmentStatusFromStatusObject = jasmine.createSpy();

      scope.selectedStatusChanged({});

      expect(ctrl.setAppointmentStatusFromStatusObject).toHaveBeenCalledWith(3);
    });

    it('should call setAppointmentStatusFromStatusObject with parameter when provided', function () {
      scope.selectedStatus = 3;
      var param = 2;

      ctrl.setAppointmentStatusFromStatusObject = jasmine.createSpy();

      scope.selectedStatusChanged({}, param);

      expect(ctrl.setAppointmentStatusFromStatusObject).toHaveBeenCalledWith(2);
    });

    it('should call onChange when onChange is defined', function () {
      scope.onChange = jasmine.createSpy();
      scope.statuses = { StartAppointment: 'no' };
      scope.selectedStatus = 3;

      ctrl.setAppointmentStatusFromStatusObject = jasmine.createSpy();

      scope.selectedStatusChanged({});

      expect(scope.onChange).toHaveBeenCalled();
    });

    it('should call onChange with closeModal true when onChange defined', function () {
      scope.onChange = jasmine.createSpy();
      scope.selectedStatus = 10;

      ctrl.setAppointmentStatusFromStatusObject = jasmine.createSpy();

      scope.selectedStatusChanged({}, { Value: 10 }, false);

      expect(scope.onChange).toHaveBeenCalledWith(
        scope.appointment,
        false,
        true,
        null,
        null,
        false
      );
    });

    it('should set autoSave to true autoSave if status is 0 ,1, 2, 3, 4, or 6', function () {
      spyOn(scope, 'onChange');
      scope.selectedStatusChanged({}, { Value: 0 }, false);
      timeout.flush();
      expect(scope.onChange).toHaveBeenCalledWith(
        scope.appointment,
        true,
        false,
        null,
        null,
        false
      );
    });

    it('should set setManuallyCompletedFlag to true if status Completed', function () {
      spyOn(scope, 'onChange');
      scope.selectedStatusChanged({}, { Value: 3 }, false);
      timeout.flush();
      expect(scope.onChange).toHaveBeenCalledWith(
        scope.appointment,
        true,
        false,
        null,
        null,
        true
      );
    });

    it('should set setManuallyCompletedFlag to true if ctrl.originalStatus is Completed', function () {
      ctrl.originalStatus = { Value: scope.statuses.Completed };
      spyOn(scope, 'onChange');
      scope.selectedStatusChanged({}, { Value: 10 }, false);
      timeout.flush();
      expect(scope.onChange).toHaveBeenCalledWith(
        scope.appointment,
        false,
        true,
        null,
        null,
        true
      );
    });

    it('should set setManuallyCompletedFlag to false if status and ctrl.originalStatus are not Completed', function () {
      ctrl.originalStatus = { Value: scope.statuses.StartAppointment };
      spyOn(scope, 'onChange');
      scope.selectedStatusChanged({}, { Value: 10 }, false);
      timeout.flush();
      expect(scope.onChange).toHaveBeenCalledWith(
        scope.appointment,
        false,
        true,
        null,
        null,
        false
      );
    });

    it('should set autoSave to false autoSave if status is not 0 ,1, 2, 3, 4, or 6', function () {
      spyOn(scope, 'onChange');
      scope.selectedStatusChanged({}, { Value: 10 }, false);
      timeout.flush();
      expect(scope.onChange).toHaveBeenCalledWith(
        scope.appointment,
        false,
        true,
        null,
        null,
        false
      );
    });
  });

  describe('$scope.startAppointment function ->', function () {
    var loggedInLocation;
    beforeEach(function () {
      loggedInLocation = { id: 1 };
      locationService.getCurrentLocation = jasmine
        .createSpy()
        .and.returnValue(loggedInLocation);

      scope.appointment = {};

      mockModalFactory.LocationChangeForStartAppointmentModal = jasmine
        .createSpy()
        .and.returnValue({ then: function () {} });
      ctrl.updateAppointmentStatusForStart = jasmine.createSpy();
      scope.afterBeginFailed = jasmine.createSpy();
    });

    it('should call locationService.getCurrentLocation', function () {
      scope.startAppointment();

      expect(locationService.getCurrentLocation).toHaveBeenCalled();
    });

    describe('when loggedInLocation and appointment location match ->', function () {
      beforeEach(function () {
        scope.appointment.LocationId = loggedInLocation.id;
      });

      it('should call ctrl.updateAppointmentStatusForStart', function () {
        scope.startAppointment();

        expect(ctrl.updateAppointmentStatusForStart).toHaveBeenCalled();
      });
    });

    describe('when loggedInLocation and appointment location do not match ->', function () {
      beforeEach(function () {
        scope.appointment.LocationId = loggedInLocation.id + 1;
      });

      it('should call modalFactory.LocationChangeForStartAppointmentModal', function () {
        scope.startAppointment();

        expect(
          mockModalFactory.LocationChangeForStartAppointmentModal
        ).toHaveBeenCalled();
      });

      describe('modalFactory success callback ->', function () {
        beforeEach(function () {
          mockModalFactory.LocationChangeForStartAppointmentModal.and.returnValue(
            {
              then: function (success) {
                success();
              },
            }
          );
        });

        it('should call ctrl.updateAppointmentStatusForStart with correct parameters', function () {
          scope.startAppointment();

          expect(ctrl.updateAppointmentStatusForStart).toHaveBeenCalledWith(
            true
          );
        });
      });

      describe('modalFactory failure callback ->', function () {
        var result;
        beforeEach(function () {
          result = 'result';
          mockModalFactory.LocationChangeForStartAppointmentModal.and.returnValue(
            {
              then: function (success, failure) {
                failure(result);
              },
            }
          );
        });

        it('should call scope.afterBeginFailed with correct parameters', function () {
          scope.startAppointment();

          expect(scope.afterBeginFailed).toHaveBeenCalledWith(result, true);
        });
      });
    });
  });

  describe('ctrl.updateAppointmentStatusForStart function ->', function () {
    beforeEach(function () {
      scope.appointment = {
        AppointmentId: 'appointmentId',
        DataTag: 'dataTag',
        Status: 'status',
      };

      scope.statuses = { InTreatment: 'InTreatment' };
    });

    it('should set values', function () {
      scope.onChange = 'scopeOnChange';
      ctrl.onChange = 'ctrlOnChange';

      ctrl.updateAppointmentStatusForStart();

      expect(scope.appointment.Status).toBe(scope.statuses.InTreatment);
      expect(scope.onChange).toBeNull();
      expect(ctrl.onChange).toBeNull();
    });

    it('should call scheduleServices.AppointmentStatus.Update', function () {
      ctrl.updateAppointmentStatusForStart();

      var expectedObj = {
        appointmentId: scope.appointment.AppointmentId,
        DataTag: scope.appointment.DataTag,
        NewAppointmentStatusId: scope.appointment.Status,
        StartAppointment: true,
      };
      expect(scheduleServices.AppointmentStatus.Update).toHaveBeenCalledWith(
        jasmine.objectContaining(expectedObj),
        jasmine.any(Function),
        scope.afterBeginFailed
      );
    });

    describe('scheduleServices.AppointmentStatus.Update success callback ->', function () {
      var result = 'result';
      beforeEach(function () {
        scheduleServices.AppointmentStatus.Update = function (data, success) {
          success(result);
        };
        scope.afterBeginSuccess = jasmine.createSpy();
      });

      it('should call scope.afterBeginSuccess with correct parameters', function () {
        var parameter = 'parameter';
        ctrl.updateAppointmentStatusForStart(parameter);

        expect(scope.afterBeginSuccess).toHaveBeenCalledWith(result, parameter);
      });
    });
  });

  describe('$scope.afterBeginSuccess function ->', function () {
    var beginAppointmentSpy, startAppointmentSpy, result;
    beforeEach(function () {
      beginAppointmentSpy = jasmine.createSpy();
      scope.$on('appointment:begin-appointment', beginAppointmentSpy);

      startAppointmentSpy = jasmine.createSpy();
      scope.$on('appointment:start-appointment', startAppointmentSpy);

      result = { Value: { PersonId: 'personId', LocationId: 'locationId' } };
    });

    it('should broadcast events', function () {
      scope.afterBeginSuccess(result);
      timeout.flush();

      expect(beginAppointmentSpy).toHaveBeenCalledWith(
        jasmine.anything(),
        result.Value
      );
      expect(startAppointmentSpy).toHaveBeenCalledWith(
        jasmine.anything(),
        result.Value
      );
    });

    it('should set values', function () {
      scope.hasChanges = true;
      scope.PreviousLocationRoute = '';

      scope.afterBeginSuccess(result);
      timeout.flush();

      expect(scope.hasChanges).toBe(false);
      expect(scope.PreviousLocationRoute).toBe(
        `#/Patient/${result.Value.PersonId}/Clinical/?activeSubTab=0`
      );
    });

    it('should include setLocation in query string when overrideLocation is true', function () {
      scope.afterBeginSuccess(result, true);
      timeout.flush();

      expect(scope.PreviousLocationRoute).toBe(
        `#/Patient/${result.Value.PersonId}/Clinical/?activeSubTab=0&setLocation=${result.Value.LocationId}`
      );
    });

    it('should not include setLocation in query string when overrideLocation is not true', function () {
      scope.afterBeginSuccess(result);
      timeout.flush();

      expect(scope.PreviousLocationRoute).toBe(
        `#/Patient/${result.Value.PersonId}/Clinical/?activeSubTab=0`
      );
    });

    it('should call methods', function () {
      scope.afterBeginSuccess(result);
      timeout.flush();
      expect(location.search).toHaveBeenCalledWith({});
      expect(tabLauncher.launchNewTab).toHaveBeenCalledWith(
        scope.PreviousLocationRoute
      );
    });
  });

  describe('$scope.afterBeginFailed function ->', function () {
    beforeEach(function () {
      scope.appointment = {
        Status: 'status',
        originalStatus: { Value: 'originalStatus' },
      };
    });

    it('should set values', function () {
      scope.disableControl = true;
      scope.afterBeginFailed();
      expect(scope.appointment.Status).toBe(
        scope.appointment.originalStatus.Value
      );
      expect(scope.disableControl).toBe(false);
    });

    it('should not call toastrFactory.error when suppressMessage is true', function () {
      scope.afterBeginFailed(null, true);
      expect(_toastr_.error).not.toHaveBeenCalled();
    });

    it('should call toastrFactory.error when suppressMessage is not true', function () {
      scope.afterBeginFailed();
      expect(_toastr_.error).toHaveBeenCalled();
    });
  });

  describe('initialize ->', function () {
    beforeEach(function () {
      ctrl.intializeScopeVariables = jasmine.createSpy();

      ctrl.initializeControllerVariables = jasmine.createSpy();

      scope.initialize();
    });

    it('should call intializeScopeVariables', function () {
      expect(ctrl.intializeScopeVariables).toHaveBeenCalled();
    });

    it('should call initializeControllerVariables', function () {
      expect(ctrl.initializeControllerVariables).toHaveBeenCalled();
    });
  });

  describe('selectedStatusChange ->', function () {
    beforeEach(function () {
      scope.statuses = { StartAppointment: 11, Completed: 3 };
      scope.onChange = function () {};
      scope.appointment = { originalStatus: { Value: 0 } };
      ctrl.originalStatus = { Value: 0 };
      ctrl.getOptionItem = jasmine
        .createSpy()
        .and.returnValue({ disabled: false });
    });

    it('should set autoSave to true autoSave if status is 0 ,1, 2, 3, 4, or 6', function () {
      spyOn(scope, 'onChange');
      scope.selectedStatusChange('3');
      timeout.flush();
      expect(scope.onChange).toHaveBeenCalledWith(
        scope.appointment,
        true,
        false,
        null,
        null,
        true
      );
    });

    it('should set setManuallyCompletedFlag to true if status Completed', function () {
      spyOn(scope, 'onChange');
      scope.selectedStatusChange(scope.statuses.Completed);
      timeout.flush();
      expect(scope.onChange).toHaveBeenCalledWith(
        scope.appointment,
        true,
        false,
        null,
        null,
        true
      );
    });

    it('should set setManuallyCompletedFlag to true if ctrl.originalStatus is Completed', function () {
      ctrl.originalStatus = { Value: scope.statuses.Completed };
      spyOn(scope, 'onChange');
      scope.selectedStatusChange('5');
      timeout.flush();
      expect(scope.onChange).toHaveBeenCalledWith(
        scope.appointment,
        false,
        false,
        null,
        null,
        true
      );
    });

    it('should set setManuallyCompletedFlag to false if status and ctrl.originalStatus are not Completed', function () {
      ctrl.originalStatus = { Value: scope.statuses.StartAppointment };
      spyOn(scope, 'onChange');
      scope.selectedStatusChange('5');
      timeout.flush();
      expect(scope.onChange).toHaveBeenCalledWith(
        scope.appointment,
        false,
        false,
        null,
        null,
        false
      );
    });

    it('should set autoSave to false autoSave if status is not 0 ,1, 2, 3, 4, or 6', function () {
      spyOn(scope, 'onChange');
      scope.selectedStatusChange('5');
      timeout.flush();
      expect(scope.onChange).toHaveBeenCalledWith(
        scope.appointment,
        false,
        false,
        null,
        null,
        false
      );
    });

    it('should set scope.appointment.originalStatus to ctrl.originalStatus', function () {
      ctrl.originalStatus = 0;
      scope.selectedStatusChange(4);
      timeout.flush();
      expect(scope.appointment.originalStatus).toBe(0);
    });

    it('should call startAppointment if status equals StartAppointment status and onChange', function () {
      spyOn(scope, 'startAppointment');
      spyOn(scope, 'onChange');
      scope.selectedStatusChange('11');
      timeout.flush();
      expect(scope.startAppointment).toHaveBeenCalled();
    });

    it('should call onChange if method provided', function () {
      spyOn(scope, 'onChange');
      scope.selectedStatusChange('4');
      timeout.flush();
      expect(scope.onChange).toHaveBeenCalled();
    });

    it('should call onChange if method provided', function () {
      spyOn(scope, 'onChange');
      scope.selectedStatusChange('10');
      timeout.flush();
      expect(scope.onChange).toHaveBeenCalledWith(
        scope.appointment,
        false,
        true,
        null,
        null,
        false
      );
    });

    it('should call not call onChange if status is not changed', function () {
      spyOn(scope, 'onChange');
      scope.selectedStatusChange('0');
      timeout.flush();
      expect(scope.onChange).not.toHaveBeenCalled();
    });
  });

  describe('ctrl.canCheckout function ->', function () {
    var appt = {
      AppointmentId: 'appointmentId',
      Patient: { PatientId: 'patientId' },
    };
    var search = 'search';
    beforeEach(function () {
      ctrl.appointmentHasChanges = jasmine.createSpy().and.returnValue(true);
      ctrl.showAppointmentSaveModal = jasmine.createSpy();
      ctrl.sendForCheckout = jasmine.createSpy();
      ctrl.showAppointmentCheckedOutMessage = jasmine.createSpy();
      location.search = jasmine.createSpy().and.returnValue(search);
    });

    it('should set appointment and scope variables', function () {
      var oldStatusId = 'oldStatusId';
      ctrl.canCheckout(appt, oldStatusId);
      expect(scope.appointment).toEqual(appt);
      expect(scope.patient).toEqual(appt.Patient);
      expect(appt.Status).toBe(oldStatusId);
    });

    it('should call ctrl.appointmentHasChanges', function () {
      ctrl.canCheckout(appt);
      expect(ctrl.appointmentHasChanges).toHaveBeenCalledWith(appt);
    });

    describe('when appointmentHasChanges returns true', function () {
      it('should set route and call ctrl.showAppointmentSaveModal with correct parameters', function () {
        ctrl.canCheckout(appt);
        expect(scope.route).toBe(search);
        expect(ctrl.showAppointmentSaveModal).toHaveBeenCalledWith(
          appt,
          scope.patient
        );
      });
    });

    describe('when appointmentHasChanges returns false', function () {
      beforeEach(function () {
        ctrl.appointmentHasChanges = jasmine.createSpy().and.returnValue(false);
        ctrl.setClean = jasmine.createSpy();
        scope.statuses = {};
      });

      it('should call ctrl.setClean', function () {
        scope.sentForCheckout = true;
        ctrl.canCheckout(appt);
        expect(ctrl.setClean).toHaveBeenCalledWith(scope);
      });

      it('should set sentForCheckout to false when sentForCheckout is true', function () {
        scope.sentForCheckout = true;
        ctrl.canCheckout(appt);
        expect(scope.sentForCheckout).toBe(false);
      });

      describe('when planned services are not present ->', function () {
        var successFlag = false;
        var mockResult = null;
        beforeEach(function () {
          scheduleServices.Lists = {
            Appointments: {
              GetEncounterIdForAppointment: jasmine
                .createSpy()
                .and.callFake(function (param, success, failure) {
                  if (successFlag === true) success(mockResult);
                  else failure();
                }),
            },
          };
        });

        it('should set sentForCheckout to true', function () {
          ctrl.canCheckout(appt);
          expect(scope.sentForCheckout).toBe(true);
        });

        it('should call schedule service function', function () {
          ctrl.canCheckout(appt);
          expect(
            scheduleServices.Lists.Appointments.GetEncounterIdForAppointment
          ).toHaveBeenCalledWith(
            { AppointmentId: appt.AppointmentId },
            jasmine.any(Function),
            jasmine.any(Function)
          );
        });

        it('should not call ctrl.sendForCheckout or ctrl.showAppointmentCheckedOutMessage when call result is null', function () {
          successFlag = true;
          ctrl.canCheckout(appt);
          expect(ctrl.sendForCheckout).not.toHaveBeenCalled();
          expect(ctrl.showAppointmentCheckedOutMessage).not.toHaveBeenCalled();
        });

        it('should call ctrl.sendForCheckout when call succeeds and IsCompleted is false', function () {
          successFlag = true;
          var value = { IsCompleted: false, EncounterId: 'encounterId' };
          mockResult = { Value: value };
          ctrl.canCheckout(appt);
          expect(ctrl.sendForCheckout).toHaveBeenCalledWith(
            value.EncounterId,
            appt
          );
        });

        it('should call ctrl.showAppointmentCheckedOutMessage when call succeeds and IsCompleted is true', function () {
          successFlag = true;
          var value = { IsCompleted: true, EncounterId: 'encounterId' };
          mockResult = { Value: value };
          ctrl.canCheckout(appt);
          expect(ctrl.showAppointmentCheckedOutMessage).toHaveBeenCalledWith(
            appt
          );
        });

        it('should call toastrFactory.error when call fails', function () {
          successFlag = false;
          ctrl.canCheckout(appt);
          expect(_toastr_.error).toHaveBeenCalled();
        });
      });

      describe('when planned services are present ->', function () {
        it('should call ctrl.sendForCheckout with null when encounterId is not a string', function () {
          appt.PlannedServices = [{}];
          ctrl.canCheckout(appt);
          expect(ctrl.sendForCheckout).toHaveBeenCalledWith(null, appt);
        });

        it('should call ctrl.sendForCheckout with encounterId when encounterId is a string', function () {
          var encounterId = 'encounterId';
          appt.PlannedServices = [{ EncounterId: encounterId }];
          ctrl.canCheckout(appt);
          expect(ctrl.sendForCheckout).toHaveBeenCalledWith(encounterId, appt);
        });
      });
    });
  });

  describe('ctrl.showAppointmentCheckedOutMessage function ->', function () {
    var appt;
    beforeEach(function () {
      mockModalFactory.ConfirmModal = jasmine
        .createSpy()
        .and.returnValue({ then: function () {} });
      appt = 'appointment';
      scope.statuses = {};
    });

    it('should call modalFactory.ConfirmModal with correct parameters', function () {
      ctrl.showAppointmentCheckedOutMessage(appt);
      expect(mockModalFactory.ConfirmModal).toHaveBeenCalledWith(
        jasmine.any(String),
        jasmine.any(String),
        jasmine.any(String)
      );
    });

    describe('modalFactory.ConfirmModal callback function ->', function () {
      beforeEach(function () {
        mockModalFactory.ConfirmModal.and.returnValue({
          then: function (cb) {
            cb();
          },
        });
        ctrl.onChange = jasmine.createSpy();
      });

      it('should call correct methods with correct parameters', function () {
        ctrl.showAppointmentCheckedOutMessage(appt);

        expect(patientAppointmentsFactory.setLoadHistory).toHaveBeenCalledWith(
          true
        );
        expect(ctrl.onChange).toHaveBeenCalledWith(appt, false);
      });
    });
  });

  describe('initialize function -> ', function () {
    beforeEach(function () {
      scope.appointment = { Status: 0 };
      spyOn(ctrl, 'setHasRunningAppointments').and.callFake(function () {});
      spyOn(ctrl, 'intializeScopeVariables').and.callFake(function () {});
      spyOn(ctrl, 'initializeControllerVariables').and.callFake(function () {});
    });

    it('should call ctrl.setHasRunningAppointments if no appointments are passed to directive', function () {
      scope.appointments = null;
      scope.initialize();
      expect(ctrl.setHasRunningAppointments).toHaveBeenCalled();
    });

    it('should not call ctrl.setHasRunningAppointments if appointments are passed to directive', function () {
      scope.appointments = [{}, {}];
      scope.initialize();
      expect(ctrl.setHasRunningAppointments).not.toHaveBeenCalled();
    });
  });

  describe('initialize function -> ', function () {
    beforeEach(function () {
      scope.appointment = { Status: 0 };
      scope.person = { PatientId: '1234' };
      patientAppointmentsFactory.PatientHasRunningAppointment = jasmine
        .createSpy()
        .and.returnValue({
          then: jasmine
            .createSpy()
            .and.returnValue({ Value: { HasRunningAppointment: true } }),
        });
    });

    it('should call ctrl.setHasRunningAppointments if no appointments are passed to directive', function () {
      ctrl.setHasRunningAppointments();
      expect(
        patientAppointmentsFactory.PatientHasRunningAppointment
      ).toHaveBeenCalledWith(scope.person.PatientId);
    });
  });

  describe('ctrl.disableControls method -> ', function () {
    beforeEach(function () {
      scope.appointment = { Status: 0 };
      scope.statuses = angular.copy(mockStatusEnum);
      scope.person = { PatientId: '1234' };
      scope.hasRunningAppointment = false;
      spyOn(ctrl, 'disableOption');
    });

    it('should call ctrl.disableOption if scope.hasRunningAppointment is true', function () {
      scope.hasRunningAppointment = true;
      ctrl.disableControls();
      expect(ctrl.disableOption).toHaveBeenCalledWith(
        scope.statuses.StartAppointment
      );
    });
  });

  describe('person watch -> ', function () {
    beforeEach(function () {
      spyOn(ctrl, 'setHasRunningAppointments');
    });

    it('should call ctrl.setHasRunningAppointments when patient loaded', function () {
      sessionStorage.setItem(
        'activeLocations',
        '[{"id":23,"name":"PracticePerf7","practiceid":7,"merchantid":"","description":"","timezone":"Central Standard Time","deactivationTimeUtc":null},{"id":24,"name":"Location24Practice7_f","practiceid":7,"merchantid":"","description":"","timezone":"Central Standard Time","deactivationTimeUtc":null}]'
      );
      scope.person = null;
      scope.$apply();
      scope.person = { PatientId: 2, IsActive: true };
      scope.$apply();
      expect(ctrl.setHasRunningAppointments).toHaveBeenCalled();
    });

    it('should not call ctrl.setHasRunningAppointments when patient set to null or undefined', function () {
      scope.person = null;
      scope.$apply();
      expect(ctrl.setHasRunningAppointments).not.toHaveBeenCalled();
    });
  });

  describe('person watch -> ', function () {
    var appointmentParam;
    beforeEach(function () {
      appointmentParam = {
        Status: '0',
        ActualStartTime: null,
        Patient: { PatientId: '3456' },
      };
      scope.appointments = [
        { Status: '0', ActualStartTime: null, Patient: { PatientId: '3456' } },
        { Status: '0', ActualStartTime: null, Patient: { PatientId: '3456' } },
      ];
      scope.statuses = angular.copy(mockStatusEnum);
    });

    it('should call ctrl.setHasRunningAppointments when patient loaded', function () {
      //add a running appointment to the list
      scope.appointments.push({
        Status: '4',
        ActualStartTime: '2018-08-28 20:54:12.2865967',
        Patient: { PatientId: '3456' },
      });
      scope.checkRunningAppts(appointmentParam);
      expect(scope.hasRunningAppointment).toBe(true);
    });
  });

  describe('ctrl.sendForCheckout routing -> ', function () {
    var appointment;
    beforeEach(function () {
      appointment = {
        AppointmentId: '1234',
        Status: '0',
        ActualStartTime: null,
        Patient: { PatientId: '3456', PersonAccount: { AccountId: '5678' } },
      };
    });

    it(
      'should call tabLauncher.launchNewTab with path to EncountersCart with appointmentId if ' +
        'appointment has no plannedServices',
      function () {
        let path =
          '#/Patient/3456/Account/5678/EncountersCart/Schedule?appt=1234';
        let encounterId = null;
        ctrl.sendForCheckout(encounterId, appointment);
        expect(tabLauncher.launchNewTab).toHaveBeenCalledWith(path);
      }
    );

    it('should call tabLauncher.launchNewTab with path to Checkout appointment has no plannedServices and encounterId is not null', function () {
      appointment.PlannedServices = [{}, {}];
      let path =
        '#/Patient/3456/Account/5678/Encounter/1234/Checkout/EncountersCartAccountSummary';
      let encounterId = '1234';
      ctrl.sendForCheckout(encounterId, appointment);
      expect(tabLauncher.launchNewTab).toHaveBeenCalledWith(path);
    });
  });
});
