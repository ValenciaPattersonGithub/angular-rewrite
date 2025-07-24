describe('AppointmentUtilities tests ->', function () {
  var appointmentUtilities, filter;
  // utilities currently used only be the appointment modal and appointment providers modules
  //#region mocks

  var providerAppointmentsWithDuplicates = [
    {
      UserId: '234',
      EndTime: '2018-05-15T14:15:00',
      StartTime: '2018-05-15T14:00:00',
      ObjectState: 'None',
    },
    {
      UserId: '234',
      EndTime: '2018-05-15T14:15:00',
      StartTime: '2018-05-15T14:00:00',
      ObjectState: 'None',
    },
    {
      UserId: '234',
      EndTime: '2018-05-15T14:15:00',
      StartTime: '2018-05-15T14:00:00',
      ObjectState: 'None',
    },
    {
      UserId: '234',
      EndTime: '2018-05-15T15:00:00',
      StartTime: '2018-05-15T14:45:00',
      ObjectState: 'None',
    },
    {
      UserId: '235',
      EndTime: '2018-05-15T14:45:00',
      StartTime: '2018-05-15T14:30:00',
      ObjectState: 'None',
    },
    {
      UserId: '235',
      EndTime: '2018-05-15T15:00:00',
      StartTime: '2018-05-15T14:45:00',
      ObjectState: 'None',
    },
  ];

  var appointmentMock = {
    AppointmentId: '1234',
    TreatmentRoomId: '12345',
    StartTime: '2018-05-15T14:00:00',
    EndTime: '2018-05-15T15:00:00',
    ExaminingDentist: null,
    ProviderAppointments: [
      {
        UserId: '234',
        EndTime: '2018-05-15T14:15:00',
        StartTime: '2018-05-15T14:00:00',
      },
      {
        UserId: '234',
        EndTime: '2018-05-15T14:30:00',
        StartTime: '2018-05-15T14:15:00',
      },
      {
        UserId: '234',
        EndTime: '2018-05-15T14:45:00',
        StartTime: '2018-05-15T14:30:00',
      },
      {
        UserId: '234',
        EndTime: '2018-05-15T15:00:00',
        StartTime: '2018-05-15T14:45:00',
      },
      {
        UserId: '234',
        EndTime: '2018-05-15T15:15:00',
        StartTime: '2018-05-15T15:00:00',
      },
      {
        UserId: '234',
        EndTime: '2018-05-15T15:30:00',
        StartTime: '2018-05-15T15:15:00',
      },
      {
        UserId: '235',
        EndTime: '2018-05-15T14:45:00',
        StartTime: '2018-05-15T14:30:00',
      },
      {
        UserId: '235',
        EndTime: '2018-05-15T15:00:00',
        StartTime: '2018-05-15T14:45:00',
      },
    ],
    PlannedServices: null,
    LocationId: 2,
  };

  beforeEach(module('Soar.Schedule'));

  beforeEach(inject(function ($rootScope, $controller, $injector, $q) {
    //create service
    appointmentUtilities = $injector.get('AppointmentUtilities');
  }));

  // helper function to calculate difference between 2 times in minutes
  describe('getDuration function --> ', function () {
    it('should return difference between start and end times in minutes', function () {
      var startTime = '2018-05-15T14:30:00';
      var endTime = '2018-05-15T14:45:00';
      var duration = appointmentUtilities.getDuration(startTime, endTime);
      expect(duration).toBe(15);

      startTime = '2018-05-15T14:45:00';
      endTime = '2018-05-15T14:30:00';
      duration = appointmentUtilities.getDuration(startTime, endTime);
      expect(duration).toBe(-15);
    });
  });

  // helper function to add specified amount to a datetime
  describe('addTime function --> ', function () {
    it('should add a specified amount of time to a dateTime', function () {
      var startDateTime = new Date('2018-05-15T14:30:00');
      var amount = 60;
      var expectedValue = new Date('2018-05-15T15:30:00');
      var newTime = appointmentUtilities.addTime(startDateTime, amount);
      expect(newTime).toEqual(expectedValue);
    });
  });

  // helper function to add specified amount to a datetime
  describe('dateIsWithinWeek function --> ', function () {
    // test is based off week of 6/10/2018 to 6/16/2018
    it('should return true if new date is in same week as old date', function () {
      var startDateTime = new Date('2018-06-13T14:30:00');
      var newDate = new Date('2018-06-15T14:30:00');
      var isWithinSameWeek = appointmentUtilities.dateIsWithinWeek(
        newDate,
        startDateTime
      );
      expect(isWithinSameWeek).toBe(true);
    });

    // test is based off week of 6/10/2018 to 6/16/2018
    it('should return false if new date is not in same week as old date', function () {
      var startDateTime = new Date('2018-06-09T14:30:00');
      var newDate = new Date('2018-06-15T14:30:00');
      var isWithinSameWeek = appointmentUtilities.dateIsWithinWeek(
        newDate,
        startDateTime
      );
      expect(isWithinSameWeek).toBe(false);
    });
  });

  // helper function to reset ProviderAppointments when an appointment is moved to another time slot
  describe('updateProviderAppointmentsOnMove function --> ', function () {
    it('should modify provider appointment time range to reflect new appointment start and end times', function () {
      var appointment = angular.copy(appointmentMock);
      // verify start times before calliing function
      expect(appointment.ProviderAppointments[0].StartTime).toEqual(
        '2018-05-15T14:00:00'
      );
      expect(appointment.ProviderAppointments[1].StartTime).toEqual(
        '2018-05-15T14:15:00'
      );
      expect(appointment.ProviderAppointments[2].StartTime).toEqual(
        '2018-05-15T14:30:00'
      );
      expect(appointment.ProviderAppointments[3].StartTime).toEqual(
        '2018-05-15T14:45:00'
      );
      expect(appointment.ProviderAppointments[4].StartTime).toEqual(
        '2018-05-15T15:00:00'
      );
      expect(appointment.ProviderAppointments[5].StartTime).toEqual(
        '2018-05-15T15:15:00'
      );
      // verify end times before calling function
      expect(appointment.ProviderAppointments[0].EndTime).toEqual(
        '2018-05-15T14:15:00'
      );
      expect(appointment.ProviderAppointments[1].EndTime).toEqual(
        '2018-05-15T14:30:00'
      );
      expect(appointment.ProviderAppointments[2].EndTime).toEqual(
        '2018-05-15T14:45:00'
      );
      expect(appointment.ProviderAppointments[3].EndTime).toEqual(
        '2018-05-15T15:00:00'
      );
      expect(appointment.ProviderAppointments[4].EndTime).toEqual(
        '2018-05-15T15:15:00'
      );
      expect(appointment.ProviderAppointments[5].EndTime).toEqual(
        '2018-05-15T15:30:00'
      );

      //new appointment start time and end time indicate 1.5 hour offset
      var newAppointmentStartTime = '2018-05-15T15:30:00';
      var newAppointmentEndTime = '2018-05-15T16:30:00';
      appointmentUtilities.updateProviderAppointmentsOnMove(
        appointment,
        newAppointmentStartTime,
        newAppointmentEndTime
      );
      // expect providerAppointments to reflect new start times
      expect(appointment.ProviderAppointments[0].StartTime).toEqual(
        new Date('2018-05-15T15:30:00')
      );
      expect(appointment.ProviderAppointments[1].StartTime).toEqual(
        new Date('2018-05-15T15:45:00')
      );
      expect(appointment.ProviderAppointments[2].StartTime).toEqual(
        new Date('2018-05-15T16:00:00')
      );
      expect(appointment.ProviderAppointments[3].StartTime).toEqual(
        new Date('2018-05-15T16:15:00')
      );
      expect(appointment.ProviderAppointments[4].StartTime).toEqual(
        new Date('2018-05-15T16:30:00')
      );
      expect(appointment.ProviderAppointments[5].StartTime).toEqual(
        new Date('2018-05-15T16:45:00')
      );

      // expect providerAppointments to reflect new end times
      expect(appointment.ProviderAppointments[0].EndTime).toEqual(
        new Date('2018-05-15T15:45:00')
      );
      expect(appointment.ProviderAppointments[1].EndTime).toEqual(
        new Date('2018-05-15T16:00:00')
      );
      expect(appointment.ProviderAppointments[2].EndTime).toEqual(
        new Date('2018-05-15T16:15:00')
      );
      expect(appointment.ProviderAppointments[3].EndTime).toEqual(
        new Date('2018-05-15T16:30:00')
      );
      expect(appointment.ProviderAppointments[4].EndTime).toEqual(
        new Date('2018-05-15T16:45:00')
      );
      expect(appointment.ProviderAppointments[5].EndTime).toEqual(
        new Date('2018-05-15T17:00:00')
      );
    });
  });

  // helper function to reset ProviderAppointments when an appointment is dragged to expand / contract time
  describe('updateProviderAppointmentsOnDrag function --> ', function () {
    var appointment = {};
    beforeEach(function () {
      appointment = angular.copy(appointmentMock);
    });

    it('should mark ObjectState.Delete to any ProviderAppointments that have a StartTime less than new start time ', function () {
      // verify start times before calliing function
      expect(appointment.ProviderAppointments[0].StartTime).toEqual(
        '2018-05-15T14:00:00'
      );
      expect(appointment.ProviderAppointments[1].StartTime).toEqual(
        '2018-05-15T14:15:00'
      );
      expect(appointment.ProviderAppointments[2].StartTime).toEqual(
        '2018-05-15T14:30:00'
      );
      expect(appointment.ProviderAppointments[3].StartTime).toEqual(
        '2018-05-15T14:45:00'
      );
      expect(appointment.ProviderAppointments[4].StartTime).toEqual(
        '2018-05-15T15:00:00'
      );
      expect(appointment.ProviderAppointments[5].StartTime).toEqual(
        '2018-05-15T15:15:00'
      );

      expect(appointment.ProviderAppointments[6].StartTime).toEqual(
        '2018-05-15T14:30:00'
      );
      expect(appointment.ProviderAppointments[7].StartTime).toEqual(
        '2018-05-15T14:45:00'
      );
      // verify end times before calling function
      expect(appointment.ProviderAppointments[0].EndTime).toEqual(
        '2018-05-15T14:15:00'
      );
      expect(appointment.ProviderAppointments[1].EndTime).toEqual(
        '2018-05-15T14:30:00'
      );
      expect(appointment.ProviderAppointments[2].EndTime).toEqual(
        '2018-05-15T14:45:00'
      );
      expect(appointment.ProviderAppointments[3].EndTime).toEqual(
        '2018-05-15T15:00:00'
      );
      expect(appointment.ProviderAppointments[4].EndTime).toEqual(
        '2018-05-15T15:15:00'
      );
      expect(appointment.ProviderAppointments[5].EndTime).toEqual(
        '2018-05-15T15:30:00'
      );

      expect(appointment.ProviderAppointments[6].EndTime).toEqual(
        '2018-05-15T14:45:00'
      );
      expect(appointment.ProviderAppointments[7].EndTime).toEqual(
        '2018-05-15T15:00:00'
      );

      //new appointment start time and end time indicate 1.5 hour offset
      var newAppointmentStartTime = '2018-05-15T14:30:00';
      var newAppointmentEndTime = '2018-05-15T15:00:00';
      appointmentUtilities.updateProviderAppointmentsOnDrag(
        appointment,
        newAppointmentStartTime,
        newAppointmentEndTime
      );

      // verify object state after call
      _.forEach(
        appointment.ProviderAppointments,
        function (providerAppointment) {
          var startTime = new Date(providerAppointment.StartTime);
          var endTime = new Date(providerAppointment.EndTime);
          if (
            startTime < newAppointmentStartTime ||
            endTime > newAppointmentEndTime
          ) {
            expect(providerAppointment.ObjectState).toEqual('Delete');
          }
          if (
            startTime > newAppointmentStartTime &&
            endTime < newAppointmentEndTime
          ) {
            expect(providerAppointment.ObjectState).toEqual('None');
          }
        }
      );
    });
  });

  // helper function to reset ProviderAppointments when an appointment is dragged to expand / contract time
  describe('markDuplicateProviderAppointmentsToRemove function --> ', function () {
    var appointment = {};
    beforeEach(function () {
      appointment = angular.copy(appointmentMock);
      // first 3 are duplicates
      appointment.ProviderAppointments = angular.copy(
        providerAppointmentsWithDuplicates
      );
    });

    it('should mark ObjectState.Delete to all but first ProviderAppointments that have duplicate StartTime and UserId', function () {
      appointmentUtilities.markDuplicateProviderAppointmentsToRemove(
        appointment
      );
      var duplicateAppointments = _.filter(
        appointment.ProviderAppointments,
        function (providerAppointment) {
          return (providerAppointment.StartTime = '2018-05-15T14:00:00');
        }
      );
      expect(duplicateAppointments[0].ObjectState).toBe('None');
      expect(duplicateAppointments[1].ObjectState).toBe('Delete');
      expect(duplicateAppointments[2].ObjectState).toBe('Delete');
    });

    it('should mark ObjectState.Delete to all but first ProviderAppointments that have duplicate EndTime and UserId', function () {
      appointmentUtilities.markDuplicateProviderAppointmentsToRemove(
        appointment
      );
      var duplicateAppointments = _.filter(
        appointment.ProviderAppointments,
        function (providerAppointment) {
          return (providerAppointment.EndTime = '2018-05-15T14:15:00');
        }
      );
      expect(duplicateAppointments[0].ObjectState).toBe('None');
      expect(duplicateAppointments[1].ObjectState).toBe('Delete');
      expect(duplicateAppointments[2].ObjectState).toBe('Delete');
    });
  });

  // helper function to calculate total line item amount
  describe('calcServiceAmount function --> ', function () {
    it('should return calculated amount based on Fee and Discount if Discount is not null and applyDiscount is true', function () {
      var serviceTransaction = {
        Fee: 200,
        Discount: 10,
        applyDiscount: true,
        Tax: 6.25,
      };
      var amount = appointmentUtilities.calcServiceAmount(serviceTransaction);
      var feePlusTaxMinusDiscount =
        serviceTransaction.Fee +
        serviceTransaction.Tax -
        serviceTransaction.Discount;
      expect(amount).toBe(feePlusTaxMinusDiscount);
    });

    it('should return 0 if fee is null', function () {
      var serviceTransaction = {
        Fee: null,
        Discount: 10,
        applyDiscount: true,
        Tax: 6.25,
      };
      var amount = appointmentUtilities.calcServiceAmount(serviceTransaction);
      expect(amount).toBe(0);
    });

    it('should return calculated amount based on Fee and Tax if Discount is null or applyDiscount is false', function () {
      var serviceTransaction = {
        Fee: 200,
        Discount: 10,
        applyDiscount: false,
        Tax: 6.25,
      };
      var amount = appointmentUtilities.calcServiceAmount(serviceTransaction);
      var feePlusTax = serviceTransaction.Fee + serviceTransaction.Tax;
      expect(amount).toBe(feePlusTax);
    });
  });

  describe('getLocationForAppointment method --> ', function () {
    var practiceLocations = [
      { LocationId: 1, Name: 'Location1' },
      { LocationId: 2, Name: 'Location2' },
      { LocationId: 3, Name: 'Location3' },
    ];
    var selectedLocation = { LocationId: 3, Name: 'Location3' };

    it('return location for appointment based on location id if locationId not null', function () {
      var ofcLocation = appointmentUtilities.getLocationForAppointment(
        practiceLocations[1].LocationId,
        practiceLocations,
        selectedLocation
      );
      expect(ofcLocation).toEqual(practiceLocations[1]);
    });

    it('return location for appointment based on selectedLocation id if locationId is null', function () {
      var ofcLocation = appointmentUtilities.getLocationForAppointment(
        null,
        practiceLocations,
        selectedLocation
      );
      expect(ofcLocation).toEqual(selectedLocation);
    });
  });

  describe('getLocationIdForAppointment method --> ', function () {
    var treatmentRooms = [
      { Name: 'TreatmentRoomA', RoomId: 123, LocationId: 1 },
      { Name: 'TreatmentRoomB', RoomId: 124, LocationId: 1 },
      { Name: 'TreatmentRoomC', RoomId: 125, LocationId: 1 },
      { Name: 'TreatmentRoomD', RoomId: 126, LocationId: 2 },
      { Name: 'TreatmentRoomE', RoomId: 127, LocationId: 3 },
    ];
    var selectedLocation = { LocationId: 3, Name: 'Location3' };

    it('return locationId for appointment based on treatmentRoom.LocationId if treatmentRoomId is not null ', function () {
      var locationId = appointmentUtilities.getLocationIdForAppointment(
        treatmentRooms[1].RoomId,
        treatmentRooms,
        selectedLocation
      );
      expect(locationId).toEqual(treatmentRooms[1].LocationId);
    });

    it('return selectedLocation.LocationId for appointment if treatmentRoomId is null ', function () {
      var locationId = appointmentUtilities.getLocationIdForAppointment(
        null,
        treatmentRooms,
        selectedLocation
      );
      expect(locationId).toEqual(selectedLocation.LocationId);
    });

    it('return selectedLocation.LocationId for appointment if treatmentRoomId is not null but not in list of rooms ', function () {
      var locationId = appointmentUtilities.getLocationIdForAppointment(
        456,
        treatmentRooms,
        selectedLocation
      );
      expect(locationId).toEqual(selectedLocation.LocationId);
    });
  });
});
