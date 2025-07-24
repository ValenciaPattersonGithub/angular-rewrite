var app = angular.module('Soar.Schedule');

app.controller('ScheduleAppointmentProvidersController', [
  '$scope',
  'ListHelper',
  function (
    $scope,
    listHelper,
  ) {
    var ctrl = this;

    //#region vars
    $scope.loading = true;
    $scope.validStartAndEndTime = true;
    $scope.providerValidationMissingHours = [];
    //#endregion

    // this method should be used for new appointments or after slot size has changed since provider appointments were defined
    ctrl.initProviderSchedulesFromScratch = function () {
      //debugger;
      let providerSchedules = [];
      if (
        $scope.appointment &&
        !_.isEmpty($scope.appointment.ProviderAppointments) &&
        !_.isEmpty($scope.slots)
      ) {
        let providers = [
          ...new Set(
            $scope.appointment.ProviderAppointments.map(x => x.UserId)
          ),
        ];
        _.forEach(providers, function (provider) {
          // for each provider, set up a schedule element for each slot
          for (let i = 0; i < $scope.slots.length; i++) {
            let slot = $scope.slots[i];
            providerSchedules.push({
              ProviderId: provider,
              Start: slot.Start,
              End: slot.End,
              Name: provider + '_' + slot.Name,
            });
          }
        });
      }
      $scope.providerSchedules = providerSchedules;
    };

    // this method should be used when there are existing provider appointments of current increment length
    ctrl.initProviderSchedulesFromProviderAppointments = function () {
      let providerSchedules = [];
      _.forEach(
        $scope.appointment.ProviderAppointments,
        function (providerAppointment) {
          let startTimeToUse = _.cloneDeep(
            new Date(providerAppointment.StartTime)
          );
          let endTimeToUse = _.cloneDeep(new Date(providerAppointment.EndTime));
          for (let i = 0; i < $scope.slots.length; i++) {
            let slotStart = new Date($scope.slots[i].Start);
            let slotEnd = new Date($scope.slots[i].End);
            let slot = $scope.slots[i];
            if (
              slotStart.getHours() === startTimeToUse.getHours() &&
              slotStart.getMinutes() === startTimeToUse.getMinutes() &&
              slotEnd.getHours() === endTimeToUse.getHours() &&
              slotEnd.getMinutes() === endTimeToUse.getMinutes()
            ) {
              providerSchedules.push({
                ProviderId: providerAppointment.UserId,
                Start: slotStart,
                End: slotEnd,
                Name: providerAppointment.UserId + '_' + slot.Name,
                ProviderAppointmentId:
                  providerAppointment.ProviderAppointmentId,
              });
              break;
            }
          }
        }
      );
      $scope.providerSchedules = providerSchedules;
    };

    ctrl.initProviderSchedulesFromAppointment = function () {
      //debugger;
      if (
        $scope.appointment &&
        !_.isEmpty($scope.appointment.ProviderAppointments) &&
        !_.isEmpty($scope.slots) &&
        $scope.appointment.Classification != 2
      ) {
        if ($scope.appointment.ProviderAppointments[0].ObjectState === 'Add') {
          // new appointment
          ctrl.initProviderSchedulesFromScratch();
        } else {
          // check slot duration against provider appt duration, if they match we can use provider appts, otherwise we'll need to create a complete set from the slots
          let slotDuration = moment($scope.slots[0].End).diff(
            $scope.slots[0].Start,
            'minutes'
          );
          let provApptDuration = moment(
            $scope.appointment.ProviderAppointments[0].originalEndTime
          ).diff(
            $scope.appointment.ProviderAppointments[0].originalStartTime,
            'minutes'
          );
          if (slotDuration === provApptDuration) {
            // create schedules from existing provider appointments
            ctrl.initProviderSchedulesFromProviderAppointments();
          } else {
            // slot size has changed, create new provider appointments from scratch
            ctrl.initProviderSchedulesFromScratch();
          }
        }
      }
    };

    ctrl.initProviderSchedulesFromAppointment();

    // checks to see if provider has been selected but has no timeslot selected
    // displays alert for each provider in list
    $scope.checkProviderMissingHours = function () {
      $scope.providerValidationMissingHours = [];
      if ($scope.appointment && $scope.appointment.Classification == 0) {
        angular.forEach($scope.selectedProviders, function (provider) {
          var providerSchedule = listHelper.findItemByFieldValue(
            $scope.providerSchedules,
            'ProviderId',
            provider.UserId
          );
          provider.FirstName = _.unescape(provider.FirstName);
          provider.LastName = _.unescape(provider.LastName);
          $scope.providerValidationMissingHours = $scope.providerValidationMissingHours
            ? $scope.providerValidationMissingHours
            : [];
          if (!providerSchedule) {
            $scope.providerValidationMissingHours.push({
              ProviderId: provider.UserId,
              ProviderName:
                provider.FirstName.charAt(0) + '. ' + provider.LastName,
            });
          } else {
            var index = listHelper.findIndexByFieldValue(
              $scope.providerValidationMissingHours,
              'ProviderId',
              provider.UserId
            );
            if (index > -1) {
              $scope.providerValidationMissingHours.splice(index, 1);
            }
          }
        });
      }
    };

    $scope.providerConflicts = [];
    $scope.outsideWorkingHoursConflicts = [];
    // filter conflicts.ProviderConflicts to only show conflicts for selected providers
    ctrl.filterProviderConflicts = function () {
      if (
        !_.isNil($scope.conflicts) &&
        !_.isEmpty($scope.conflicts.ProviderConflicts)
      ) {
        var selectedProviderIds = _.uniq(
          _.map($scope.selectedProviders, 'UserId')
        );

        $scope.providerConflicts = _.filter(
          $scope.conflicts.ProviderConflicts,
          function (conflict) {
            return _.includes(selectedProviderIds, conflict.UserId);
          }
        );
      } else {
        // this clears out the view making it empty out the errors
        $scope.providerConflicts = [];
      }
    };

    // filter conflicts.OutsideWorkingHours to only show conflicts for selected providers
    ctrl.filterOutsideWorkingHoursConflicts = function () {
      if (
        !_.isNil($scope.conflicts) &&
        !_.isEmpty($scope.conflicts.OutsideWorkingHours)
      ) {
        var selectedProviderIds = _.uniq(
          _.map($scope.selectedProviders, 'UserId')
        );

        $scope.outsideWorkingHoursConflicts = _.filter(
          $scope.conflicts.OutsideWorkingHours,
          function (conflict) {
            return _.includes(selectedProviderIds, conflict.UserId);
          }
        );
      }
    };

    $scope.$watch(
      'conflicts',
      function (nv, ov) {
        if (nv && nv !== ov) {
          $scope.checkProviderMissingHours();
          ctrl.filterProviderConflicts();
          ctrl.filterOutsideWorkingHoursConflicts();
        }
      },
      true
    );

    $scope.$watch(
      'selectedProviders',
      function (nv, ov) {
        if (nv && nv !== ov) {
          $scope.providerSchedules = [];
          $scope.checkProviderMissingHours();
          ctrl.filterProviderConflicts();
          ctrl.filterOutsideWorkingHoursConflicts();
          //set this variable to false so if there are no providers on the appointment, the validation message gets displayed
          $scope.loading = false;
          ctrl.fillProviderTimeSlot();
        }
      },
      true
    );

    // on slot change fire call to parent to getConflicts based on new slots
    $scope.$watch(
      'providerSchedules',
      function (nv, ov) {
        if (nv && nv.length > 0) {
          if ($scope.onChange) {
            $scope.onChange();
          }
        }
        // check that a provider(s) has hours
        $scope.checkProviderMissingHours();
      },
      true
    );

    $scope.isSelected = function (provider, slot) {
      //console.log('isSelected - AppointmentProviders');
      //console.log('ProviderSchedules count: ' + $scope.providerSchedules.length);
      //debugger;
      if ($scope.providerSchedules) {
        for (let i = 0; i < $scope.providerSchedules.length; i++) {
          if (
            $scope.providerSchedules[i]['Name'] ===
            provider.UserId + '_' + slot.Name
          ) {
            return true;
          }
        }
      }

      return false;
    };

    $scope.selectSlot = function (provider, slot) {
      var index = listHelper.findIndexByFieldValue(
        $scope.providerSchedules,
        'Name',
        provider.UserId + '_' + slot.Name
      );
      if (index > -1) {
        // slot is currently selected, remove from schedules
        $scope.providerSchedules.splice(index, 1);
      } else {
        // slot is currently not selected, add to schedules
        ctrl.addSlotToSchedule(provider, slot);
        //ctrl.validateSlot();
      }
    };

    ctrl.addSlotToSchedule = function (provider, slot) {
      $scope.providerSchedules.push({
        ProviderId: provider.UserId,
        Start: angular.copy(slot.Start),
        End: angular.copy(slot.End),
        Name: provider.UserId + '_' + slot.Name,
      });
    };

    $scope.deleteProvider = function (index, providerId) {
      // remove from selected providers
      $scope.selectedProviders = $.grep($scope.selectedProviders, function (e) {
        return e.UserId != providerId;
      });
      // remove provider schedules based on deleted provider
      $scope.providerSchedules = $.grep($scope.providerSchedules, function (e) {
        return e.ProviderId != providerId;
      });
      // remove from Provider appointments
      $scope.appointment.ProviderAppointments = $.grep(
        $scope.appointment.ProviderAppointments,
        function (e) {
          return e.ProviderId != providerId;
        }
      );
    };

    // when appointment start or end times changes, remove ProviderAppointments outside of range
    ctrl.checkProviderSchedules = function () {
      var startTime = new Date($scope.appointment.StartTime);
      var endTime = new Date($scope.appointment.EndTime);
      for (
        var i = $scope.providerSchedules.length - 1;
        i >= 0 && $scope.providerSchedules.length > 0;
        i--
      ) {
        if (
          $scope.providerSchedules[i].Start < startTime ||
          $scope.providerSchedules[i].End > endTime
        ) {
          $scope.providerSchedules.splice(i, 1);
        }
      }
    };

    $scope.$watch(
      'appointment.StartTime',
      function (nv, ov) {
        if (nv && nv !== ov) {
          ctrl.checkProviderSchedules();
          ctrl.fillProviderTimeSlot();
        }
      },
      true
    );

    $scope.$watch(
      'appointment.EndTime',
      function (nv, ov) {
        if (nv && nv !== ov) {
          ctrl.checkProviderSchedules();
          ctrl.fillProviderTimeSlot();
        }
      },
      true
    );

    ctrl.addProviderSchedule = function (
      userId,
      startTime,
      endTime,
      slotName,
      providerAppointmentId
    ) {
      var found = listHelper.findItemByFieldValue(
        $scope.providerSchedules,
        'Name',
        userId + '_' + slotName
      );
      if (!found) {
        $scope.providerSchedules.push({
          ProviderId: userId,
          Start: new Date(startTime),
          End: new Date(endTime),
          Name: userId + '_' + slotName,
          ProviderAppointmentId: providerAppointmentId
        });
      }
    };

    // if this is a regular appointment (Classification = 0) and only one provider, fill all slots when time change
    ctrl.fillProviderTimeSlot = function () {
      // not sure if this was here for anything.
      //$timeout(function () {
      if (
        $scope.appointment.Classification == 0 &&
        $scope.selectedProviders.length == 1 &&
        $scope.providerSchedules &&
        $scope.slots
      ) {
        var prov = $scope.selectedProviders[0];
        $scope.providerSchedules = [];
        angular.forEach($scope.slots, function (slot) {
          ctrl.addProviderSchedule(
            prov.UserId,
            slot.Start,
            slot.End,
            slot.Name,
            null
          );
        });
      }
      //}, false);
    };
  },
]);
