import { of } from "rxjs";

describe('Controller: PatientAppointmentsTileController', function () {
  var ctrl,
    scope,
    rootScope,
    staticData,
    locationService,
    scheduleServices,
    localize,
    boundObjectFactory,
    timeout,
    patSecurityService,
    timeZoneFactory,
    modalDataFactory,
    patientAppointmentsFactory;
  var appointmentUtilities,
    modalFactory,
    loggedInLocation,
    event,
    appointmentViewDataLoadingService,
    appointmentViewVisibleService;
  beforeEach(module('Soar.Common'));
  beforeEach(module('common.factories'));
  beforeEach(module('Soar.Schedule'));

  beforeEach(
    module('Soar.Patient', function ($provide) {
      appointmentUtilities = {
        markDuplicateProviderAppointmentsToRemove: jasmine
          .createSpy()
          .and.returnValue({}),
      };
      $provide.value('AppointmentUtilities', appointmentUtilities);
      const featureFlagService = jasmine.createSpyObj('FeatureFlagService', ['getOnce$']);
      featureFlagService.getOnce$.and.returnValue(of(false));
      $provide.value('FeatureFlagService', featureFlagService);
      const scheduleMFENavigator = jasmine.createSpyObj('schedulingMFENavigator', ['navigateToAppointmentModal']);
      $provide.value('schedulingMFENavigator', scheduleMFENavigator);

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

  // create controller and scope
  beforeEach(inject(function ($rootScope, $controller, $injector) {
    rootScope = $rootScope;
    scope = $rootScope.$new();
    timeout = $injector.get('$timeout');

    //mock for scheduleServices
    scheduleServices = {
      Dtos: {
        Appointment: {
          Operations: {
            Update: jasmine.createSpy('AppointmentUpdate'),
          },
        },
      },
      UpdateAndStart: {
        Appointment: jasmine.createSpy(),
      },
      AppointmentStatus: {
        Update: jasmine.createSpy('AppointmentStatus.Update'),
      },
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

    staticData = {
      AppointmentStatuses: jasmine
        .createSpy()
        .and.returnValue({ Enum: { InTreatment: 4 } }),
    };

    // mock for patSecurityService
    patSecurityService = {
      IsAuthorizedByAbbreviation: jasmine.createSpy().and.returnValue(true),
    };

    localize = {
      getLocalizedString: jasmine.createSpy(),
    };

    scope.patientAppointment = {
      StartDate: '2016-07-08:19:00:00Z',
      Status: '4',
    };

    timeZoneFactory = {
      ConvertDateToMomentTZ: jasmine.createSpy().and.returnValue(moment()),
      ResetAppointmentDates: jasmine.createSpy(),
      GetTimeZoneAbbr: jasmine.createSpy(),
    };

    modalDataFactory = {
      GetAppointmentEditData: jasmine.createSpy(),
    };

    modalFactory = {
      LocationChangeForStartAppointmentModal: jasmine
        .createSpy()
        .and.returnValue({ then: function () {} }),
    };

    patientAppointmentsFactory = {
      AppointmentDataWithDetails: jasmine.createSpy(),
    };

    // create controller
    ctrl = $controller('PatientAppointmentsTileController', {
      $scope: scope,
      $rootScope: rootScope,
      ScheduleServices: scheduleServices,
      BoundObjectFactory: boundObjectFactory,
      $timeout: timeout,
      patSecurityService: patSecurityService,
      localize: localize,
      StaticData: staticData,
      TimeZoneFactory: timeZoneFactory,
      ModalDataFactory: modalDataFactory,
      PatientAppointmentsFactory: patientAppointmentsFactory,
      ModalFactory: modalFactory,
    });
  }));

  //controller
  it('PatientAppointmentsTileController : should check if controller exists', function () {
    expect(ctrl).not.toBeNull();
    expect(ctrl).not.toBeUndefined();
  });

  describe('Init function ->', function () {
    it('should set apptStatus to "Completed" and showLabel to true if status is 3', function () {
      scope.patientAppointment.Status = 3;
      ctrl.init();
      expect(localize.getLocalizedString).toHaveBeenCalled();
      expect(scope.showLabel).toBe(true);
    });

    it('should set apptStatus to "Completed", showLabel to true and should call rootScope.$broadcast if status is 4', function () {
      scope.patientAppointment.Status = 4;
      scope.patientAppointment.ActualStartTime = 'start time';
      spyOn(rootScope, '$broadcast');
      ctrl.init();
      timeout.flush(200);
      expect(rootScope.$broadcast).toHaveBeenCalledWith(
        'appointment:startup-show-appointment-model',
        scope.patientAppointment
      );
      expect(localize.getLocalizedString).toHaveBeenCalled();
      expect(scope.showLabel).toBe(true);
    });

    it('should set apptStatus to "Ready for Checkout" and showLabel to true if status is 5', function () {
      scope.patientAppointment.Status = 5;
      ctrl.init();
      expect(localize.getLocalizedString).toHaveBeenCalled();
      expect(scope.showLabel).toBe(true);
    });

    it('should set apptStatus to "Start Appt" and showLabel to false if status is other than 3,4 and 5', function () {
      scope.patientAppointment.Status = 6;
      ctrl.init();
      expect(localize.getLocalizedString).toHaveBeenCalled();
      expect(scope.showLabel).toBe(false);
    });
  });

  describe(' beginAppointment function ->', function () {
    beforeEach(function () {
      loggedInLocation = { id: 1 };
      scope.patientAppointment = {
        Status: '4',
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
        ProviderAppointments: [
          { ObjectState: 'None' },
          { ObjectState: 'None' },
        ],
        LocationId: loggedInLocation.id,
      };

      event = {
        preventDefault: function () {},
        stopPropagation: function () {},
      };
      spyOn(event, 'preventDefault').and.callFake(function () {});
      spyOn(event, 'stopPropagation').and.callFake(function () {});

      locationService = {
        getCurrentLocation: jasmine
          .createSpy()
          .and.returnValue({ loggedInLocation }),
        getCurrentPracticeLocation: {},
        getCurrentPracticeLocations: {},
      };
    });

    it('should return if event is null', function () {
      scope.beginAppointment();
      expect(locationService.getCurrentLocation).not.toHaveBeenCalled();
    });

    it('should return if hasClinicalAppointmentEditAccess is false', function () {
      ctrl.hasClinicalAppointmentEditAccess = false;
      scope.beginAppointment(event);
      expect(locationService.getCurrentLocation).not.toHaveBeenCalled();
    });

    it('should set apptStatus to "In Treatment" and isDisabled to true', function () {
      ctrl.hasClinicalAppointmentEditAccess = true;
      ctrl.statuses = { InTreatment: 4 };
      scope.beginAppointment(event);
      expect(localize.getLocalizedString).toHaveBeenCalled();
      expect(scope.isDisabled).toBe(true);
    });

    it('should set Status to 4 ', function () {
      scope.appointment = {
        Data: { Status: 4, StartDate: '2016-07-08:19:00:00Z' },
        Save: jasmine.createSpy(),
      };
      scope.patientAppointment = {
        StartDate: '2016-07-08:19:00:00Z',
        Status: 4,
      };
      ctrl.statuses = { InTreatment: 4 };
      ctrl.hasClinicalAppointmentEditAccess = true;
      scope.beginAppointment(event);
      expect(scope.isDisabled).toBe(true);
      expect(scope.appointment.Data.Status).toEqual(ctrl.statuses.InTreatment);
      expect(scope.appointment.Data).toEqual(scope.patientAppointment);
    });
  });

  describe('ctrl.afterSaveSuccess function ->', function () {
    var res;
    var appointment;
    var ofcLocation;
    beforeEach(function () {
      appointment = {
        Data: {
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
          ProviderAppointments: [
            { ObjectState: 'None' },
            { ObjectState: 'None' },
          ],
        },
      };
      res = { Value: appointment };
      ofcLocation = {};
      spyOn(rootScope, '$broadcast');
    });

    it('should set apptStatus to "In Treatment"(4) and isDisabled to true', function () {
      ctrl.afterSaveSuccess(res, ofcLocation);
      expect(scope.patientAppointment.AppointmentId).toEqual(
        appointment.Data.AppointmentId
      );
      expect(scope.isDisabled).toBe(true);
    });

    it('should broadcast appointment:start-appointment on success', function () {
      ctrl.afterSaveSuccess(res, ofcLocation);
      timeout.flush(200);
      expect(rootScope.$broadcast).toHaveBeenCalledWith(
        'appointment:start-appointment',
        scope.patientAppointment
      );
    });

    it('should broadcast appointment:begin-appointment on success', function () {
      ctrl.afterSaveSuccess(res, ofcLocation);
      timeout.flush(200);
      expect(rootScope.$broadcast).toHaveBeenCalledWith(
        'appointment:begin-appointment',
        res.Value
      );
    });
  });

  describe('hideAppointment Function ->', function () {
    it('should return true when $scope.currentDate is one day or more less than $scope.scheduledDate', function () {
      scope.currentDate = new Date('2018-10-16 20:40:00.0000000');
      scope.scheduledDate = new Date('2018-10-17 21:41:00.0000000');
      var result = scope.hideAppointment();
      expect(result).toBe(true);
    });

    it('should return false when schedule date is one day or more less than currentdate', function () {
      scope.currentDate = new Date('2018-10-17 21:42:00.0000000');
      scope.scheduledDate = new Date('2018-10-16 20:41:00.0000000');
      var result = scope.hideAppointment();
      expect(result).toBe(false);
    });
  });
});
