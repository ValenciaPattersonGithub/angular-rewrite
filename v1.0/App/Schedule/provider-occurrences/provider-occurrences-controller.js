'use strict';

var app = angular.module('Soar.Schedule');
app.controller('ProviderOccurrencesController', [
  '$scope',
  'toastrFactory',
  'localize',
  'patSecurityService',
  'ListHelper',
  '$filter',
  '$uibModalInstance',
  'providers',
  'currentLocation',
  'rooms',
  'ScheduleServices',
  'TimeZoneFactory',
  function (
    $scope,
    toastrFactory,
    localize,
    patSecurityService,
    listHelper,
    $filter,
    $uibModalInstance,
    providers,
    currentLocation,
    rooms,
    scheduleServices,
    timeZoneFactory
  ) {
    var ctrl = this;

    ctrl.init = function () {
      ctrl.getProviderOccurrences();
    };

    $scope.loading = true;
    $scope.providers = $filter('filter')(
      $filter('orderBy')(providers, 'LastName'),
      { ShowOnSchedule: true }
    );
    $scope.currentLocation = currentLocation;
    $scope.rooms = rooms;
    $scope.providerOccurrences = [];
    ctrl.providerRoomSetups = [];
    ctrl.providerRoomOccurences = [];
    $scope.selectedProviderId = null;
    $scope.providerPlaceholder = localize.getLocalizedString('All {0}', [
      'Providers',
    ]);

    $scope.closeModal = function () {
      $uibModalInstance.close();
      $uibModalInstance.dismiss('cancel');
    };

    //#region supporting methods

    ctrl.viewProviderOccurrencesAccess = function () {
      return patSecurityService.IsAuthorizedByAbbreviation(
        'soar-sch-sprvhr-view'
      );
    };

    ctrl.getProviderOccurrences = function () {
      if (ctrl.viewProviderOccurrencesAccess()) {
        scheduleServices.ProviderRoomSetup.GetAll(
          { locationId: $scope.currentLocation.id },
          ctrl.getProviderOccurrencesSuccess,
          ctrl.getProviderOccurrencesFailure
        );
      }
    };

    ctrl.getProviderOccurrencesSuccess = function (res) {
      if (res && res.Value) {
        ctrl.providerRoomSetups = res.Value.ProviderRoomSetups;
        ctrl.providerRoomOccurences = res.Value.ProviderRoomOccurrences;
        ctrl.prepareProviderOccurrences();
      }
    };

    ctrl.getProviderOccurrencesFailure = function (res) {
      toastrFactory.error(
        localize.getLocalizedString(
          'Failed to retrieve the {0}. Please try again.',
          ['Provider Occurrences']
        ),
        'Error'
      );
    };

    // scope variable that holds ordering details
    $scope.orderBy = {
      field: 'startsOn',
      asc: true,
    };

    // function to apply orderBy functionality
    $scope.changeSortingForGrid = function (field) {
      var asc = $scope.orderBy.field === field ? !$scope.orderBy.asc : true;
      $scope.orderBy = {
        field: field,
        asc: asc,
      };
    };

    ctrl.prepareProviderOccurrences = function () {
      angular.forEach(ctrl.providerRoomSetups, function (providerRoomSetup) {
        var provider = listHelper.findItemByFieldValue(
          $scope.providers,
          'UserId',
          providerRoomSetup.UserId
        );
        var room = listHelper.findItemByFieldValue(
          $scope.rooms,
          'RoomId',
          providerRoomSetup.RoomId
        );

        var repeatOn = ctrl.getRepeatOn(providerRoomSetup.RecurrenceSetup);
        var endsOn = ctrl.getEndsOn(providerRoomSetup.RecurrenceSetup);

        var series = {
          startsOn: moment(providerRoomSetup.RecurrenceSetup.StartDate).format(
            'MM/DD/YYYY'
          ),
          endsOn: endsOn,
          provider: provider != null ? provider.FullName : '',
          room: room != null ? room.Name : '',
          startTime: moment(providerRoomSetup.StartTime).format('hh:mm A'),
          endTime: moment(providerRoomSetup.EndTime).format('hh:mm A'),
          repeatOn: repeatOn,
          providerId: provider != null ? provider.UserId : null,
        };
        $scope.providerOccurrences.push(series);
      });

      angular.forEach(
        ctrl.providerRoomOccurences,
        function (providerRoomOccurrence) {
          var provider = listHelper.findItemByFieldValue(
            $scope.providers,
            'UserId',
            providerRoomOccurrence.UserId
          );
          var room = listHelper.findItemByFieldValue(
            $scope.rooms,
            'RoomId',
            providerRoomOccurrence.RoomId
          );
          var occurrence = {
            startsOn: moment(
              timeZoneFactory.ConvertDateTZ(
                providerRoomOccurrence.StartTime,
                $scope.currentLocation.timezone
              )
            ).format('MM/DD/YYYY'),
            endsOn: moment(
              timeZoneFactory.ConvertDateTZ(
                providerRoomOccurrence.EndTime,
                $scope.currentLocation.timezone
              )
            ).format('MM/DD/YYYY'),
            provider: provider != null ? provider.FullName : '',
            room: room != null ? room.Name : '',
            startTime: moment(
              timeZoneFactory.ConvertDateTZ(
                providerRoomOccurrence.StartTime,
                $scope.currentLocation.timezone
              )
            ).format('hh:mm A'),
            endTime: moment(
              timeZoneFactory.ConvertDateTZ(
                providerRoomOccurrence.EndTime,
                $scope.currentLocation.timezone
              )
            ).format('hh:mm A'),
            repeatOn: localize.getLocalizedString('None'),
            providerId: provider != null ? provider.UserId : null,
          };
          $scope.providerOccurrences.push(occurrence);
        }
      );

      $scope.loading = false;
    };

    ctrl.getEndsOn = function (recurrenceSetup) {
      return recurrenceSetup.EndDate
        ? moment(
            timeZoneFactory.ConvertDateTZ(
              recurrenceSetup.EndDate,
              $scope.currentLocation.timezone
            )
          ).format('MM/DD/YYYY')
        : localize.getLocalizedString('Never');
    };

    ctrl.getRepeatOn = function (recurrenceSetup) {
      var string = '';
      switch (recurrenceSetup.FrequencyTypeId) {
        case 1:
          if (recurrenceSetup.RepeatOnMonday) {
            string += localize.getLocalizedString('Mon, ');
          }
          if (recurrenceSetup.RepeatOnTuesday) {
            string += localize.getLocalizedString('Tue, ');
          }
          if (recurrenceSetup.RepeatOnWednesday) {
            string += localize.getLocalizedString('Wed, ');
          }
          if (recurrenceSetup.RepeatOnThursday) {
            string += localize.getLocalizedString('Thu, ');
          }
          if (recurrenceSetup.RepeatOnFriday) {
            string += localize.getLocalizedString('Fri, ');
          }
          if (recurrenceSetup.RepeatOnSaturday) {
            string += localize.getLocalizedString('Sat, ');
          }
          if (recurrenceSetup.RepeatOnSunday) {
            string += localize.getLocalizedString('Sun, ');
          }
          string += localize.getLocalizedString('every {0} Week(s).', [
            recurrenceSetup.Interval,
          ]);
          break;
        case 2:
          if (recurrenceSetup.RepeatOnDayOfMonth) {
            var date = moment(recurrenceSetup.StartDate).format('Do');
            string += localize.getLocalizedString('{0} day of the month, ', [
              date,
            ]);
          } else if (recurrenceSetup.RepeatOnDayOfWeek) {
            var day = moment(recurrenceSetup.StartDate).format('dddd');
            string += localize.getLocalizedString('{0} of the week, ', [day]);
          }
          string += localize.getLocalizedString('every {0} Month(s).', [
            recurrenceSetup.Interval,
          ]);
          break;
      }
      return string;
    };

    $scope.providerChanged = function (newValue) {
      $scope.selectedProviderId = newValue;
    };

    //#endregion

    ctrl.init();
  },
]);
