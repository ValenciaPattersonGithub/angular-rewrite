'use strict';

angular.module('Soar.Schedule').service('SchedulerUtilities', [
  '$filter',
  'locationService',
  function ($filter, locationService) {
    //#region userSettings

    //services to support appointments
    // before saving we need to merge the current ctrl.userColumnOrder with the existing ctrl.scheduleColumnOrder
    var mergeScheduleColumnOrder = function (
      scheduleColumnOrder,
      userColumnOrderForLocation
    ) {
      var found = false;
      // if current ScheduleColumnOrder is an array and locations match replace this value
      _.forEach(scheduleColumnOrder, function (columnOrder) {
        if (columnOrder.location === userColumnOrderForLocation.location) {
          columnOrder = userColumnOrderForLocation;
          found = true;
        }
      });
      // if no match add row for this location
      if (found === false) {
        scheduleColumnOrder.push(userColumnOrderForLocation);
      }
      return scheduleColumnOrder;
    };

    // parses the ScheduleColumnOrder and converts to a location based dataset for current location if needed
    // alternately if its already a location based set we just return it
    var parseScheduleColumnOrder = function (schedColumnOrder, location) {
      var currentLocation = _.isEmpty(location)
        ? locationService.getCurrentLocation()
        : location;

      // if current ScheduleColumnOrder is an array, either add or replace this value
      if (angular.isArray(schedColumnOrder)) {
        return schedColumnOrder;
      } else {
        // remove current settings and append new row to array
        var scheduleColumnOrder = [];
        var revisedScheduleColumnOrder = {
          location: currentLocation.id,
          provider: schedColumnOrder.provider,
          room: schedColumnOrder.room,
        };
        scheduleColumnOrder.push(revisedScheduleColumnOrder);
        return scheduleColumnOrder;
      }
    };

    // columnOrder settings is an array to be parsed per location selected in the appHeader
    var getUserColumnOrderByLocation = function (
      scheduleColumnOrder,
      location
    ) {
      var rowFound = false;

      var currentLocation = _.isEmpty(location)
        ? locationService.getCurrentLocation()
        : location;

      var userColumnOrderByLocation = {};
      // the userColumnOrder contains location and we return the data that matches the current location
      if (angular.isArray(scheduleColumnOrder)) {
        _.forEach(scheduleColumnOrder, function (columnOrder) {
          if (columnOrder.location === currentLocation.id) {
            userColumnOrderByLocation = columnOrder;
            rowFound = true;
          }
        });
      }
      if (rowFound === false) {
        userColumnOrderByLocation = {
          location: currentLocation.id,
          provider: [],
          room: [],
        };
      }
      return userColumnOrderByLocation;
    };

    var setHoursDisplay = function (nv) {
      var val = parseInt(nv);
      var hoursDisplay = {
        text: '',
        value: 0,
      };

      switch (val) {
        case 0:
          hoursDisplay = {
            text: '2 hr',
            value: 2,
          };
          break;
        case 1:
          hoursDisplay = {
            text: '4 hr',
            value: 4,
          };
          break;
        case 2:
          hoursDisplay = {
            text: '6 hr',
            value: 6,
          };
          break;

        case 3:
          hoursDisplay = {
            text: '8 hr',
            value: 8,
          };
          break;
        case 4:
          hoursDisplay = {
            text: '12 hr',
            value: 12,
          };
          break;
      }
      return hoursDisplay;
    };

    var updateRows = function (hours, timeIncrement) {
      var size;
      switch (hours) {
        case 2:
          size = 60;
          break;
        case 4:
          size = 32;
          break;
        case 6:
          size = 22;
          break;
        case 8:
          size = 16;
          break;
        case 12:
          size = 10;
          break;
      }
      return 'scheduler__hoursZoom' + this.getSize(size, timeIncrement);
    };

    var getSize = function (base, timeIncrement) {
      var result;
      switch (timeIncrement) {
        case 5:
          result = base / 6;
          break;
        case 10:
          result = base / 3;
          break;
        case 15:
          result = base / 2;
          break;
        case 20:
          result = (base * 2) / 3;
          break;
        case 30:
          result = base;
          break;
      }
      return parseInt(result) >= 2 ? parseInt(result) : 2;
    };

    var createBreadcrumbLink = function (link, queryString, hasQuestionMark) {
      let sourceString =
        !_.isNil(queryString) && queryString.includes('source=schedule')
          ? ''
          : 'source=schedule&';

      let exit =
        link +
        (hasQuestionMark === true ? '&' : '?') +
        sourceString +
        queryString;

      return exit;
    };
    //#endregion

    return {
      mergeScheduleColumnOrder: mergeScheduleColumnOrder,
      parseScheduleColumnOrder: parseScheduleColumnOrder,
      getUserColumnOrderByLocation: getUserColumnOrderByLocation,
      setHoursDisplay: setHoursDisplay,
      updateRows: updateRows,
      getSize: getSize,
      createBreadcrumbLink: createBreadcrumbLink,
    };
  },
]);
