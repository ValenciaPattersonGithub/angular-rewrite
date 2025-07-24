describe('appointment-overview-controller -> ', function () {
  // #region Data

  var routeParams, scope, ctrl, timeout;

  var mockAppointment = {
    AppointmentId: 1,
    TreatmentRoomId: 1,
    ProviderId: null,
    PersonId: 1,
    AppointmentTypeId: 1,
    StartTime: new Date(2003, 1, 2, 8, 15, 0, 0),
    EndTime: new Date(2003, 1, 2, 9, 30, 0, 0),
    start: new Date(2003, 1, 2, 8, 15, 0, 0),
    end: new Date(2003, 1, 2, 9, 30, 0, 0),
    Note: 'Test Note',
  };

  var mockUpdatedAppointment = {
    AppointmentId: 1,
    PersonId: 1,
    AppointmentTypeId: 2,
    TreatmentRoomId: 1,
    ProviderId: null,
    Start: new Date(2003, 1, 2, 10, 0, 0, 0),
    End: new Date(2003, 1, 2, 12, 0, 0, 0),
    Note: 'Updated Test Note',
  };

  var mockPatientFlags = [
    { PatientAlertId: 1, PatientId: 1, Description: 'Description 1' },
  ];

  // #endregion

  //#region mocks

  var mockLocationHours = {
    StartTime: moment(new Date()),
    EndTime: moment(new Date()),
  };

  var mockSaveStates = {
    None: 'None',
    Add: 'Add',
    Update: 'Update',
    Delete: 'Delete',
    Failed: 'Failed',
  };

  //#endregion

  beforeEach(module('Soar.Common'));
  beforeEach(module('common.factories'));
  beforeEach(module('Soar.Schedule'));

  var scheduleServices, modalInstance, staticData;

  // Create spies for services
  beforeEach(
    module('Soar.Schedule', function ($provide) {
      staticData = {
        AlertIcons: function () {
          return [];
        },
      };
      $provide.value('StaticData', staticData);

      modalInstance = {
        close: jasmine.createSpy(),
        dismiss: jasmine.createSpy(),
      };
      $provide.value('$uibModalInstance', modalInstance);

      scheduleServices = {
        ProviderTime: jasmine.createSpy().and.returnValue({
          Calculate: jasmine.createSpy(),
        }),
      };
      $provide.value('ScheduleServices', scheduleServices);
    })
  );

  // Create controller and scope
  beforeEach(inject(function (
    $rootScope,
    $controller,
    $injector,
    $uibModalInstance,
    $timeout
  ) {
    scope = $rootScope.$new();
    timeout = $timeout;

    scope.displayFunction = jasmine.createSpy().and.returnValue({
      PracticeSettings: {
        DefaultTimeIncrement: 15,
      },
    });
    scope.cancelFunction = jasmine.createSpy();
    scope.saveFunction = jasmine.createSpy();

    scope.appointment = mockAppointment;

    scope.frmAppointmentOverview = {
      $dirty: false,
    };

    ctrl = $controller('AppointmentOverviewController', {
      $scope: scope,
      StaticData: staticData,
      saveStates: mockSaveStates,
      ScheduleServies: scheduleServices,
    });

    scope.frmAppointmentOverview = {
      $dirty: true,
    };
  }));

  it('should check if controller exists', function () {
    expect(ctrl).not.toBeNull();
  });

  it('should set scope properties', function () {
    expect(scope.display).toEqual(scope.displayFunction());
    expect(scope.symbolList).toEqual(staticData.AlertIcons());
    expect(scope.appointmentDuration).toEqual(240);
    expect(scope.appointmentDate).toEqual(mockAppointment.StartTime);
    expect(scope.PracticeSettings).toEqual(scope.display.PracticeSettings);
    expect(scope.isValid).toBe(true);
  });

  describe('cancelChanges function -> ', function () {
    var modalFactory;
    var promiseMock;

    beforeEach(inject(function (ModalFactory, $q) {
      modalFactory = ModalFactory;

      promiseMock = {
        then: jasmine.createSpy(),
      };

      modalFactory.CancelModal = jasmine
        .createSpy()
        .and.returnValue({ then: function () {} });
    }));

    it('should call modalFactory.CancelModal when frmAppointmentOverview.$dirty is true', function () {
      scope.frmAppointmentOverview.$dirty = true;
      scope.cancelChanges();

      expect(modalFactory.CancelModal).toHaveBeenCalled();
    });

    it('should call cancelFunction when frmAppointmentOverview.$dirty is false', function () {
      scope.frmAppointmentOverview.$dirty = false;
      scope.cancelChanges();

      expect(scope.cancelFunction).toHaveBeenCalled();
    });
  });

  describe('saveChanges function -> ', function () {
    beforeEach(function () {
      scope.appointmentTime = {
        start: mockAppointment.StartTime,
        end: mockAppointment.EndTime,
      };
    });

    //it('should call cancelAppointmentTimeWatch if validation passes', function() {
    //    scope.saveChanges();

    //});
  });

  describe('initializeAppointmentTimes function -> ', function () {
    beforeEach(function () {
      scope.appointmentTime = null;
      scope.appointment = {
        StartTime: new Date(2001, 2, 3, 4, 5, 6, 7),
        EndTime: new Date(2001, 2, 3, 4, 10, 6, 7),
        start: new Date(2001, 2, 3, 4, 5, 6, 7),
        end: new Date(2001, 2, 3, 4, 10, 6, 7),
      };

      ctrl.initializeAppointmentTimes();
    });

    it('should initialize the appointmentTime object', function () {
      expect(scope.appointmentTime).not.toBeNull();
    });

    it('should remove the second and milliseconds from the start and end time', function () {
      expect(scope.appointment.StartTime.toDateString()).toEqual(
        new Date(2001, 2, 3, 4, 5, 0, 0).toDateString()
      );
      expect(scope.appointment.EndTime.toDateString()).toEqual(
        new Date(2001, 2, 3, 4, 10, 0, 0).toDateString()
      );
    });

    it('should set appointmentTime.start and appointmentTime.end to appointment.StarTime and appointment.EndTime respectively without the seconds and milliseconds', function () {
      var expectedStart = moment([2001, 2, 3, 4, 5, 0, 0]);
      var expectedEnd = moment([2001, 2, 3, 4, 10, 0, 0]);

      expect(scope.appointmentTime.start).toEqual(expectedStart.toISOString());
      expect(scope.appointmentTime.end).toEqual(expectedEnd.toISOString());
    });

    it('should default appointmentTime.valid to true', function () {
      expect(scope.appointmentTime.valid).toEqual(true);
    });
  });

  describe('setAppointmentDateTime function -> ', function () {
    it('should set appointment.StartTime and appointment.EndTime date', function () {
      var dateObject = new Date('2015-09-01T13:00:00.000Z');
      var timeObject = {
        start: '2015-09-01T13:00:00.000Z',
        end: '2015-09-01T14:00:00.000Z',
      };

      ctrl.setAppointmentDateTime(dateObject, timeObject);

      expect(scope.appointment.StartTime.toISOString()).toEqual(
        '2015-09-01T13:00:00.000Z'
      );
      expect(scope.appointment.EndTime.toISOString()).toEqual(
        '2015-09-01T14:00:00.000Z'
      );
    });

    it('should set appointment.Data.StartTime and appointment.Data.EndTime when day value of date is greater than the maximum number of days', function () {
      var dateObject = new Date('2019-02-04 10:25:00');
      var timeObject = {
        start: new Date('2019-01-30T13:00:00.000Z'),
        end: new Date('2019-01-30T14:00:00.000Z'),
      };

      ctrl.setAppointmentDateTime(dateObject, timeObject);
      expect(scope.appointment.StartTime.toISOString()).toEqual(
        '2019-02-04T13:00:00.000Z'
      );
      expect(scope.appointment.EndTime.toISOString()).toEqual(
        '2019-02-04T14:00:00.000Z'
      );
    });

    it('should call scheduleServices.ProviderTime().Calculate', function () {
      var dateObject = new Date('2015-09-01T13:00:00.000Z');
      var timeObject = {
        start: '2015-09-01T13:00:00.000Z',
        end: '2015-09-01T14:00:00.000Z',
      };

      ctrl.setAppointmentDateTime(dateObject, timeObject);

      expect(scheduleServices.ProviderTime().Calculate).toHaveBeenCalled();
    });
  });

  describe('setProviderAppointmentsDateTime ->', function () {
    var providerAppontment;
    beforeEach(function () {
      providerAppontment = {
        StartTime: new Date('2001-01-01T11:22:33.444Z'),
        EndTime: new Date('2001-01-01T22:44:55.888Z'),
      };

      scope.appointmentDate = new Date();
      scope.appointmentDate.setFullYear(2011);
      scope.appointmentDate.setMonth(10);
      scope.appointmentDate.setDate(11);
      scope.appointmentDate.setHours(0);
      scope.appointmentDate.setMinutes(0);
      scope.appointmentDate.setSeconds(0);
      scope.appointmentDate.setMilliseconds(0);

      scope.appointment = {
        ProviderAppointments: [providerAppontment],
      };
    });

    it('should change the date on the provider appointments StartTime and EndTime to the year, month, and date of appointmentDate leaving the time intact', function () {
      ctrl.setProviderAppointmentsDateTime();

      expect(
        providerAppontment.StartTime.toISOString().indexOf('11:22:33.444Z')
      ).not.toBe(-1);
      expect(
        providerAppontment.EndTime.toISOString().indexOf('22:44:55.888Z')
      ).not.toBe(-1);
    });
  });

  describe('appointmentTimeChanged ->', function () {
    var newTime, oldTime, providerAppointment;

    beforeEach(function () {
      newTime = {
        start: new Date('2015-01-01T08:00:00.000Z'),
        end: new Date('2015-01-01T09:15:00.000Z'),
        Duration: 75,
      };

      oldTime = {
        start: 'old start',
        end: 'old end',
        Duration: 60,
      };

      providerAppointment = {
        StartTime: 'some start',
        EndTime: 'some end',
        Duration: 30,
        ObjectState: mockSaveStates.None,
      };

      ctrl.checkForChanges = jasmine.createSpy();
      ctrl.cancelAppointmentTimeWatch = jasmine.createSpy();
      scope.$watch = jasmine.createSpy().and.returnValue('new watch');

      scope.appointment = {
        ProviderAppointments: [providerAppointment],
      };
    });

    it('should call checkForChanges', function () {
      ctrl.appointmentTimeChanged(newTime, oldTime);

      expect(ctrl.checkForChanges).toHaveBeenCalled();
    });

    describe('when oldTime.Duration >= 0', function () {
      var originalWatch;
      beforeEach(function () {
        originalWatch = ctrl.cancelAppointmentTimeWatch;

        ctrl.getDuration = jasmine.createSpy().and.returnValue(35);

        ctrl.appointmentTimeChanged(newTime, oldTime);
      });

      it('should call cancelAppointmentTimeWatch and re-initialize it before exiting', function () {
        expect(originalWatch).toHaveBeenCalled();
        expect(scope.$watch).toHaveBeenCalledWith(
          'appointmentTime',
          ctrl.appointmentTimeChanged,
          true
        );
        expect(ctrl.cancelAppointmentTimeWatch).toEqual('new watch');
      });
    });

    describe('when oldTime.Duration is NOT >= 0', function () {
      it("should set newTime's Duration property to the appointments's new duration", function () {
        oldTime.Duration = null;
        ctrl.getDuration = jasmine.createSpy().and.returnValue('new duration');

        ctrl.appointmentTimeChanged(newTime, oldTime);

        expect(newTime.Duration).toEqual('new duration');
      });
    });
  });

  describe('checkForChanges ->', function () {
    beforeEach(function () {
      ctrl.originalAppointmentTime = {
        start: 'original',
        end: 'original',
      };

      ctrl.originalAppointment = {
        Status: 'original',
        StatusNote: 'original',
      };

      scope.appointmentTime = angular.copy(ctrl.originalAppointmentTime);
      scope.appointment = angular.copy(ctrl.originalAppointment);

      scope.hasChanges = 'not even a boolean';
    });

    it('should set hasChanges to true if the originalAppointmentTime.start != appointmentTime.start', function () {
      scope.appointmentTime.start = 'changed';

      ctrl.checkForChanges();

      expect(scope.hasChanges).toEqual(true);
    });

    it('should set hasChanges to true if the originalAppointmentTime.end != appointmentTime.end', function () {
      scope.appointmentTime.end = 'changed';

      ctrl.checkForChanges();

      expect(scope.hasChanges).toEqual(true);
    });

    it('should set hasChanges to true if the originalAppointmentTime.Status != appointmentTime.Status', function () {
      scope.appointment.Status = 'changed';

      ctrl.checkForChanges();

      expect(scope.hasChanges).toEqual(true);
    });

    it('should set hasChanges to true if the originalAppointmentTime.StatusNote != appointmentTime.StatusNote', function () {
      scope.appointment.StatusNote = 'changed';

      ctrl.checkForChanges();

      expect(scope.hasChanges).toEqual(true);
    });

    it('should set hasChanges to false if the all compared values are equal', function () {
      ctrl.checkForChanges();

      expect(scope.hasChanges).toEqual(false);
    });
  });
});
