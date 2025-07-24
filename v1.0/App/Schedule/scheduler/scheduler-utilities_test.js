describe('SchedulerUtilities tests ->', function () {
  var schedulerUtilities, locationService;
  beforeEach(module('Soar.Schedule'));

  var currentLocation = {
    name: '45 Hickory Industrial Ct.',
    id: '2def',
  };

  beforeEach(
    module('Soar.Schedule', function ($provide) {
      locationService = {
        getCurrentLocation: jasmine
          .createSpy()
          .and.returnValue(currentLocation),
      };
      $provide.value('locationService', locationService);
    })
  );

  beforeEach(inject(function ($injector) {
    //create service
    schedulerUtilities = $injector.get('SchedulerUtilities');
  }));

  describe('mergeScheduleColumnOrder method ->', function () {
    var schedColumnOrder;
    var userColumnOrder;
    beforeEach(function () {
      schedColumnOrder = [
        {
          location: '1abc',
          provider: ['1234cc', '5678bb', '9876aa', '5432dd', '8521'],
          room: ['123', '456', '789'],
        },
        {
          location: '2def',
          provider: ['1234cc', '5678bb', '9876aa', '5432dd'],
          room: ['123', '456', '789', '987'],
        },
        {
          location: '3ghi',
          provider: ['1234cc', '5678bb', '9876aa'],
          room: ['123', '456'],
        },
      ];
      // mock userColumnOrder to be first row of scheduleColumnOrder
      userColumnOrder = schedColumnOrder[0];
    });

    it('should replace row in userSettings.ScheduleColumnOrder if already had entry for this location', function () {
      // modify userColumnOrder.provider
      userColumnOrder.provider = ['1234cc', '5678bb'];
      var scheduleColumnOrder = angular.copy(schedColumnOrder);
      schedulerUtilities.mergeScheduleColumnOrder(
        scheduleColumnOrder,
        userColumnOrder
      );
      expect(scheduleColumnOrder[0]).toEqual(userColumnOrder);
    });

    it('should add row in userSettings.ScheduleColumnOrder if original did not have entry for this location', function () {
      var scheduleColumnOrder = angular.copy(schedColumnOrder);
      // set userColumnOrder equal to row 2
      userColumnOrder = schedColumnOrder[2];
      // remove row 2 from dataset
      scheduleColumnOrder.splice(2, 1);
      expect(scheduleColumnOrder).not.toEqual(schedColumnOrder);
      schedulerUtilities.mergeScheduleColumnOrder(
        scheduleColumnOrder,
        userColumnOrder
      );
      expect(scheduleColumnOrder).toEqual(schedColumnOrder);
    });
  });

  describe('parseScheduleColumnOrder method ->', function () {
    var scheduleColumnOrderWithoutLocations;
    var scheduleColumnOrderWithLocations;
    beforeEach(function () {
      scheduleColumnOrderWithoutLocations = {
        provider: ['1234cc', '5678bb', '9876aa', '5432dd'],
        room: ['123', '456', '789', '987'],
      };
      scheduleColumnOrderWithLocations = [
        {
          location: '2def',
          provider: ['1234cc', '5678bb', '9876aa', '5432dd'],
          room: ['123', '456', '789', '987'],
        },
      ];
    });

    it('should replace row in userSettings.ScheduleColumnOrder to contain location if original did not have locations', function () {
      var scheduleColumnOrder = schedulerUtilities.parseScheduleColumnOrder(
        scheduleColumnOrderWithoutLocations
      );
      expect(scheduleColumnOrder).toEqual(scheduleColumnOrderWithLocations);
    });
  });

  describe('getUserColumnOrder method ->', function () {
    var schedColumnOrder;
    beforeEach(function () {
      // this is the new format which includes location
      schedColumnOrder = [
        {
          location: '1abc',
          provider: ['1234cc', '5678bb', '9876aa', '5432dd', '8521'],
          room: ['123', '456', '789'],
        },
        {
          location: '2def',
          provider: ['1234cc', '5678bb', '9876aa', '5432dd'],
          room: ['123', '456', '789', '987'],
        },
        {
          location: '3ghi',
          provider: ['1234cc', '5678bb', '9876aa'],
          room: ['123', '456'],
        },
      ];
    });

    it('should parse scheduleColumnOrder to get userColumnOrder for current location if location in resultset', function () {
      var scheduleColumnOrder = angular.copy(schedColumnOrder);
      var result =
        schedulerUtilities.getUserColumnOrderByLocation(scheduleColumnOrder);
      expect(result).toEqual(schedColumnOrder[1]);
    });

    it('should parse scheduleColumnOrder and create userColumnOrder for current location if location not in resultset', function () {
      schedColumnOrder.splice(1, 1);
      schedColumnOrder.splice(1, 1);
      var scheduleColumnOrder = angular.copy(schedColumnOrder);
      var result =
        schedulerUtilities.getUserColumnOrderByLocation(scheduleColumnOrder);
      expect(result).toEqual({
        location: currentLocation.id,
        provider: [],
        room: [],
      });
    });
  });
});
