import { of } from 'rsjs';

describe('holidays list test -> ', function () {
  var routeParams, scope, ctrl, timeout, referenceDataService;

  //#region mock data

  var mockHolidayValue = {
    Value: {
      HolidayId: 1,
      Description: 'Holiday 1',
      Date: moment({ year: 2015, day: 1, hour: 8, minute: 0 }),
      IsActive: false,
      IsDefaultHoliday: false,
    },
  };

  var mockDefaultHolidayValue = {
    Value: {
      HolidayId: 4,
      Description: 'Default Holiday 1',
      Date: moment({ year: 2015, day: 1, hour: 8, minute: 0 }),
      IsActive: false,
      IsDefaultHoliday: true,
    },
  };

  var mockHolidays = [
    {
      HolidayId: 1,
      Description: 'Holiday 1',
      Date: moment({ year: 2015, day: 1, hour: 8, minute: 0 }),
      IsActive: true,
      IsDefaultHoliday: false,
    },
    {
      HolidayId: 2,
      Description: 'Holiday 2',
      Date: moment({ year: 2015, day: 1, hour: 8, minute: 0 }),
      IsActive: true,
      IsDefaultHoliday: false,
    },
    {
      HolidayId: 3,
      Description: 'Holiday 3',
      Date: moment({ year: 2015, day: 1, hour: 8, minute: 0 }),
      IsActive: true,
      IsDefaultHoliday: false,
    },
  ];

  var mockHolidaysValue = {
    Value: [
      {
        HolidayId: 1,
        Description: 'Holiday 1',
        Date: moment({ year: 2015, day: 1, hour: 8, minute: 0 }),
        IsActive: true,
        IsDefaultHoliday: false,
      },
      {
        HolidayId: 2,
        Description: 'Holiday 2',
        Date: moment({ year: 2015, day: 1, hour: 8, minute: 0 }),
        IsActive: true,
        IsDefaultHoliday: false,
      },
      {
        HolidayId: 3,
        Description: 'Holiday 3',
        Date: moment({ year: 2015, day: 1, hour: 8, minute: 0 }),
        IsActive: true,
        IsDefaultHoliday: false,
      },
    ],
  };

  var mockDefaultHolidays = [
    {
      HolidayId: 4,
      Description: 'Default Holiday 1',
      Date: moment({ year: 2015, day: 1, hour: 8, minute: 0 }),
      IsActive: true,
      IsDefaultHoliday: true,
    },
    {
      HolidayId: 5,
      Description: 'Default Holiday 2',
      Date: moment({ year: 2015, day: 1, hour: 8, minute: 0 }),
      IsActive: true,
      IsDefaultHoliday: true,
    },
    {
      HolidayId: 6,
      Description: 'Default Holiday 3',
      Date: moment({ year: 2015, day: 1, hour: 8, minute: 0 }),
      IsActive: true,
      IsDefaultHoliday: true,
    },
  ];

  var listHelperMock = {
    findIndexByFieldValue: jasmine.createSpy().and.returnValue(0),
  };

  var modalInstanceMock = {
    result: {
      then: jasmine.createSpy(),
    },
  };

  var modalFactory = {
    DeleteModal: jasmine.createSpy().and.returnValue({ then: function () {} }),
    Modal: jasmine.createSpy().and.returnValue(modalInstanceMock),
  };

  //#endregion

  beforeEach(module('Soar.Common'));
  beforeEach(module('common.factories'));
  beforeEach(module('Soar.Schedule'));

  var mockScheduleServices, featureFlagService;

  // Create spies for services
  beforeEach(
    module('Soar.Schedule', function ($provide) {
      mockScheduleServices = {
        Dtos: {
          Holidays: {
            get: jasmine.createSpy(),
            delete: jasmine.createSpy(),
            save: jasmine.createSpy(),
            Update: jasmine.createSpy(),
          },
        },
      };

      referenceDataService = {
        forceEntityExecution: jasmine.createSpy(),
        get: jasmine.createSpy().and.returnValue(mockHolidays),
        entityNames: {
          holidays: 'holidays',
        },
      };

      $provide.value('ScheduleServices', mockScheduleServices);

      $provide.value('referenceDataService', referenceDataService);
      $provide.value('$uibModal', modalFactory);

      featureFlagService = {
        getOnce$: jasmine.createSpy().and.returnValue(of(false)),
      }
      $provide.value('featureFlagService', featureFlagService);
    })
  );

  // Create controller and scope
  beforeEach(inject(function (
    $rootScope,
    $controller,
    $route,
    $routeParams,
    $timeout
  ) {
    scope = $rootScope.$new();
    routeParams = $routeParams;
    timeout = $timeout;
    ctrl = $controller('HolidaysController', {
      $scope: scope,
      ModalFactory: modalFactory,
      $routeParams: routeParams,
      $timeout: timeout,
      ScheduleServices: mockScheduleServices,
      listHelper: listHelperMock,
      holidays: {
        Value: mockHolidays,
      },
      defaultHolidays: {
        Value: mockDefaultHolidays,
      },
    });
  }));

  it('should set initial scope properties', function () {
    expect(scope.holidays.length).toBe(3);
    expect(scope.orderBy.field).toBe('Date');
  });

  describe('changeSortingForGrid function -> ', function () {
    it('should set orderBy.asc to false', function () {
      scope.changeSortingForGrid('Date');

      expect(scope.orderBy.asc).toBe(false);
    });

    it('should set orderBy.asc to true', function () {
      scope.changeSortingForGrid('Description');

      expect(scope.orderBy.asc).toBe(true);
    });

    it('should set defaultOrderBy.asc to false', function () {
      scope.changeSortingForGrid('Date', true);

      expect(scope.defaultOrderBy.asc).toBe(false);
    });

    it('should set defaultOrderBy.asc to true', function () {
      scope.changeSortingForGrid('Description', true);

      expect(scope.defaultOrderBy.asc).toBe(true);
    });
  });

  describe('createHoliday function -> ', function () {
    it('should prepare selectedHoliday for adding a holiday in the modal and open modal', function () {
      scope.createHoliday();

      expect(ctrl.selectedHoliday.Description).toBeNull();
      expect(ctrl.selectedHoliday.Date).toBeNull();
      expect(ctrl.selectedHoliday.IsActive).toBe(true);
      expect(ctrl.selectedHoliday.IsDefaultHoliday).toBe(false);

      expect(modalInstanceMock.result.then).toHaveBeenCalled();
    });

    it('should prepare selectedHoliday for updating a holiday in the modal and open modal', function () {
      scope.createHoliday(mockHolidays[0]);

      expect(ctrl.selectedHoliday.Description).toBe(
        mockHolidays[0].Description
      );
      expect(ctrl.selectedHoliday.Description).toBe(
        mockHolidays[0].Description
      );
      expect(ctrl.selectedHoliday.Date).toBe(mockHolidays[0].Date);
      expect(ctrl.selectedHoliday.IsActive).toBe(true);
      expect(ctrl.selectedHoliday.IsDefaultHoliday).toBe(false);

      expect(modalInstanceMock.result.then).toHaveBeenCalled();
    });
  });

  describe('updateHolidays function -> ', function () {
    it('should update holidays array with updated value and set selectedHoliday to null', function () {
      scope.holidays = angular.copy(mockHolidays);
      ctrl.selectedHoliday = mockHolidays[0];
      mockHolidays[0].Description = 'blarg';

      ctrl.updateHolidays(mockHolidays[0]);

      expect(scope.holidays[0].Description).toBe('blarg');
    });

    it('should add to holidays array with new value', function () {
      scope.holidays = angular.copy(mockHolidays);
      ctrl.selectedHoliday = { Description: null };

      ctrl.updateHolidays({ Description: 'blarg', HolidayId: 4 });

      expect(scope.holidays[3].Description).toBe('blarg');
    });

    it('should strip the "Z" from the Date property', function () {
      ctrl.selectedHoliday = { Description: null };
      var date = '09-26-2018T00:00:00Z';
      var holiday = { Description: 'blarg', HolidayId: 4, Date: date };
      ctrl.updateHolidays(holiday);
      expect(holiday.Date).toBe(date.replace('Z', ''));
    });
  });

  describe('saveHoliday function -> ', function () {
    it('should call Holidays.save', function () {
      ctrl.selectedHoliday = angular.copy(mockHolidays[0]);
      ctrl.selectedHoliday.IsActive = false;
      scope.holidays = angular.copy(mockHolidays);
      scope.saveHoliday(ctrl.selectedHoliday);
      timeout.flush();
      expect(mockScheduleServices.Dtos.Holidays.Update).toHaveBeenCalled();
    });
  });

  describe('saveHolidayOnSuccess function -> ', function () {
    describe('when updating a default holiday -> ', function () {
      it('should update the isActive tag and call toastrFactory.success', function () {
        scope.holidays = angular.copy(mockHolidays);
        scope.defaultHolidays = angular.copy(mockDefaultHolidays);

        ctrl.selectedHoliday = angular.copy(mockHolidays[0]);

        ctrl.saveHolidayOnSuccess(mockDefaultHolidayValue);

        expect(scope.defaultHolidays.length).toBe(3);
        expect(ctrl.selectedHoliday).toBe(null);
      });
    });

    describe('when updating a non-default holiday -> ', function () {
      it('should update the isActive tag and call toastrFactory.success', function () {
        scope.holidays = angular.copy(mockHolidays);
        scope.defaultHolidays = angular.copy(mockDefaultHolidays);

        ctrl.selectedHoliday = angular.copy(mockHolidays[0]);

        ctrl.saveHolidayOnSuccess(mockHolidayValue);

        expect(scope.holidays.length).toBe(4);
        expect(scope.holidays[0].IsActive).toBe(false);
        expect(ctrl.selectedHoliday).toBe(null);
      });
    });
  });

  describe('saveHolidayOnError function -> ', function () {
    it('should set selectedHoliday to null and call toastrFactor.error', function () {
      ctrl.selectedHoliday = angular.copy(mockHolidays[0]);
      ctrl.saveHolidayOnError();

      expect(ctrl.selectedHoliday).toBeNull();
      expect(_toastr_.error).toHaveBeenCalled();
    });
  });

  describe('deleteHoliday function -> ', function () {
    it('should set selectedHoliday and call getApointmentsByRoom', function () {
      scope.deleteHoliday(mockHolidays[0]);

      expect(ctrl.selectedHoliday).toEqual(mockHolidays[0]);
    });
  });

  describe('confirmDelete function -> ', function () {
    it('should call Holidays.delete service', function () {
      ctrl.selectedHoliday = mockHolidays[0];
      ctrl.confirmDelete();

      expect(mockScheduleServices.Dtos.Holidays.delete).toHaveBeenCalled();
    });
  });

  describe('cancelDelete function -> ', function () {
    it('should set selectedTreatmentRoom to null', function () {
      ctrl.cancelDelete();

      expect(ctrl.selectedHoliday).toBeNull();
    });
  });

  describe('deleteHolidayOnSuccess function -> ', function () {
    it('should remove room from holidays, set selectedHoliday to null and call toastrFactory.success', function () {
      ctrl.selectedHoliday = mockHolidays[0];
      scope.holidays = angular.copy(mockHolidays);
      ctrl.deleteHolidayOnSuccess();

      expect(scope.holidays.length).toBe(3);
      expect(ctrl.selectedHoliday).toBeNull();
      expect(_toastr_.success).toHaveBeenCalled();
    });
  });

  describe('deleteHolidayOnError function -> ', function () {
    it('should set selectedHoliday to null and call toastrFactor.error', function () {
      ctrl.deleteHolidayOnError();

      expect(ctrl.selectedHoliday).toBeNull();
      expect(_toastr_.error).toHaveBeenCalled();
    });
  });
});
