'use strict';

angular.module('Soar.Schedule').service('AppointmentUtilities', [
  '$filter',
  'SaveStates',
  function ($filter, saveStates) {
    //#region date and time methods

    //services to support appointments
    var getDuration = function (startTime, endTime) {
      if (startTime != null && endTime != null) {
        var startMoment = moment(startTime);
        var endMoment = moment(endTime);
        return endMoment.diff(startMoment, 'minutes');
      }
      return 0;
    };

    var dateIsWithinWeek = function (newDate, oldDate) {
      var endOfWeek = new Date(
        oldDate.getTime() + (6 - oldDate.getDay()) * 24 * 60 * 60 * 1000
      );
      endOfWeek.setHours(23);
      endOfWeek.setMinutes(59);
      endOfWeek.setSeconds(59);
      return newDate.getTime() <= endOfWeek.getTime();
    };

    // add a specific amount of time to a datetime
    var addTime = function (date, amount) {
      var newDate = angular.copy(date);
      newDate.setTime(newDate.getTime() + amount * 60000);
      return newDate;
    };

    //#endregion

    //#region financial methods

    var calcServiceAmount = function (serviceTransaction) {
      if (
        serviceTransaction.Fee == null ||
        serviceTransaction.Fee == undefined ||
        serviceTransaction.Fee == 0
      ) {
        return 0;
      } else if (
        serviceTransaction.applyDiscount &&
        serviceTransaction.Discount
      ) {
        return (
          serviceTransaction.Fee +
          serviceTransaction.Tax -
          serviceTransaction.Discount
        );
      } else {
        return serviceTransaction.Fee + serviceTransaction.Tax;
      }
    };

    // when passed an appointment with a new start or end date this function calculates the new provider times
    // based on the slot positions of original provider times, new start and end time
    var updateProviderAppointmentsOnDrag = function (
      appointment,
      newStartTime,
      newEndTime
    ) {
      // group provider appointments by provider and order by start time
      var providerGroup = _.groupBy(appointment.ProviderAppointments, 'UserId');
      _.forEach(providerGroup, function (providerAppointments) {
        // for each provider
        _.forEach(providerAppointments, function (providerAppointment) {
          providerAppointment.ObjectState = saveStates.None;
          // for each provider appointment if provider appointment start time is < new start time set object state to deleted
          // if provider appointment end time is > new end time set object state to deleted
          var startTime = new Date(providerAppointment.StartTime);
          var endTime = new Date(providerAppointment.EndTime);
          if (startTime < newStartTime || endTime > newEndTime) {
            providerAppointment.ObjectState = saveStates.Delete;
          }
        });
      });
    };

    // iterates through collection and marks duplicates for removal
    var markDuplicateProviderAppointmentsToRemove = function (appointment) {
      // for each provider appointment if there is a duplicate provider appointment
      // set object state to delete
      _.forEach(
        appointment.ProviderAppointments,
        function (providerAppointment) {
          var dups = _.filter(
            appointment.ProviderAppointments,
            function (item) {
              return (
                item.StartTime === providerAppointment.StartTime &&
                (item.UserId === providerAppointment.UserId) |
                  (item.EndTime === providerAppointment.EndTime) &&
                item.UserId === providerAppointment.UserId
              );
            }
          );
          if (dups) {
            for (var i = 0; i < dups.length; i++) {
              if (i > 0) {
                dups[i].ObjectState = saveStates.Delete;
              }
            }
          }
        }
      );
    };

    // when passed an appointment with a new start or end date this function calculates the new provider times
    // based on the slot positions of original provider times
    var updateProviderAppointmentsOnMove = function (
      appointment,
      newStartTime
    ) {
      //calculate StartTime Difference
      var startTimeDifference = getDuration(
        appointment.StartTime,
        newStartTime
      );
      // update existing providerAppointments by appointment.StartTime offset
      for (var i = 0; i < appointment.ProviderAppointments.length; i++) {
        var startTime = new Date(appointment.ProviderAppointments[i].StartTime);
        var endTime = new Date(appointment.ProviderAppointments[i].EndTime);
        appointment.ProviderAppointments[i].StartTime = addTime(
          startTime,
          startTimeDifference
        );
        appointment.ProviderAppointments[i].EndTime = addTime(
          endTime,
          startTimeDifference
        );
        appointment.ProviderAppointments[i].ObjectState = saveStates.Update;
      }
    };

    //#region set location information on appointment

    // appointment location should match treatmentRoom location if we have a treatment room id
    // appointment location should match $scope.selectedLocation if no treatment room id
    var getLocationForAppointment = function (
      locationId,
      practiceLocations,
      selectedLocation
    ) {
      var appointmentLocation;
      // select the correct location based on room if roomId is not null
      if (!_.isNil(locationId)) {
        appointmentLocation = _.find(practiceLocations, function (location) {
          return location.LocationId === locationId;
        });
      }
      if (_.isNil(appointmentLocation)) {
        appointmentLocation = _.find(practiceLocations, function (location) {
          return location.LocationId === selectedLocation.LocationId;
        });
      }
      return appointmentLocation;
    };

    // appointment locationId should match treatmentRoom.LocationId if we have a treatment room id
    // appointment locationId should match $scope.selectedLocationLocationId if no treatment room id
    var getLocationIdForAppointment = function (
      treatmentRoomId,
      treatmentRooms,
      selectedLocation
    ) {
      // default selectedLocationId to $scope.selectedLocation.LocationId
      var selectedLocationId = selectedLocation.LocationId;
      // select the correct location based on room view if treatmentRoomId is not null
      if (!_.isNil(treatmentRoomId)) {
        var room = _.find(treatmentRooms, function (treatmentRoom) {
          return treatmentRoom.RoomId === treatmentRoomId;
        });
        if (!_.isNil(room)) {
          selectedLocationId = room.LocationId;
        }
      }
      return selectedLocationId;
    };

    //#endregion

    return {
      dateIsWithinWeek: dateIsWithinWeek,
      addTime: addTime,
      getDuration: getDuration,
      calcServiceAmount: calcServiceAmount,
      updateProviderAppointmentsOnMove: updateProviderAppointmentsOnMove,
      updateProviderAppointmentsOnDrag: updateProviderAppointmentsOnDrag,
      markDuplicateProviderAppointmentsToRemove: markDuplicateProviderAppointmentsToRemove,
      getLocationForAppointment: getLocationForAppointment,
      getLocationIdForAppointment: getLocationIdForAppointment,
    };
  },
]);
