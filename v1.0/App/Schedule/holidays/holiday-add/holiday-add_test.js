import { of } from 'rsjs';

describe('holiday-add test -> ', function () {
  var routeParams, scope, ctrl, referenceDataService;

  //#region mock data

  var mockHoliday = {
    HolidayId: 1,
    Description: 'Holiday 1',
    Date: moment({ year: 2015, day: 1, hour: 8, minute: 0 }),
  };

  var mockHolidayValue = {
    Value: {
      HolidayId: 1,
      Description: 'Holiday 1',
      Date: moment({ year: 2015, day: 1, hour: 8, minute: 0 }),
    },
  };

  var modalInstanceMock = {
    close: jasmine.createSpy(),
  };

  var mockModalFactory = {
    CancelModal: jasmine.createSpy().and.returnValue({
      then: jasmine.createSpy(),
    }),
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
            save: jasmine.createSpy(),
            Update: jasmine.createSpy(),
          },
        },
      };

      referenceDataService = {
        forceEntityExecution: jasmine.createSpy(),
        entityNames: {
          holidays: 'holidays',
        },
      };

      $provide.value('ScheduleServices', mockScheduleServices);

      $provide.value('referenceDataService', referenceDataService);

      $provide.value('$uibModalInstance', modalInstanceMock);

      featureFlagService = {
        getOnce$: jasmine.createSpy().and.returnValue(of(false)),
      }
      $provide.value('featureFlagService', featureFlagService);
    })
  );

  // Create controller and scope
  beforeEach(inject(function ($rootScope, $controller, $route, $routeParams) {
    scope = $rootScope.$new();
    routeParams = $routeParams;

    ctrl = $controller('HolidayAddController', {
      $scope: scope,
      $uibModalInstance: modalInstanceMock,
      $routeParams: routeParams,
      ScheduleServices: mockScheduleServices,
      holiday: mockHoliday,
      ModalFactory: mockModalFactory,
    });
  }));

  it('should set initial scope properties', function () {
    expect(scope.editMode).toBe(true);

    expect(scope.holiday.HolidayId).toEqual(mockHoliday.HolidayId);
    expect(scope.holiday.Description).toEqual(mockHoliday.Description);
    expect(scope.holiday.Date.toDate()).toEqual(
      moment({ year: 2015, day: 1, hour: 8, minute: 0 }).toDate()
    );

    expect(ctrl.backupHoliday.HolidayId).toEqual(mockHoliday.HolidayId);
    expect(ctrl.backupHoliday.Description).toEqual(mockHoliday.Description);
    expect(ctrl.backupHoliday.Date.toDate()).toEqual(
      moment({ year: 2015, day: 1, hour: 8, minute: 0 }).toDate()
    );

    expect(scope.hasErrors).toBe(false);
    expect(scope.isSaving).toBe(false);
  });

  describe('IsValid function -> ', function () {
    it('should return true if frmHolidaySave, validDate is valid and inpDescription is valid', function () {
      scope.frmHolidaySave = {
        $valid: true,
        inpDescription: {
          $valid: true,
        },
      };

      scope.validDate = true;

      var bool = ctrl.IsValid();

      expect(bool).toBe(true);
    });

    it('should return false if frmHolidaySave is valid, validDate is valid and inpDescription is inValid', function () {
      scope.frmHolidaySave = {
        $valid: true,
        inpDescription: {
          $valid: false,
        },
      };

      scope.validDate = true;

      var bool = ctrl.IsValid();

      expect(bool).toBe(false);
    });

    it('should return false if frmHolidaySave is invalid, validDate is valid and inpDescription is valid', function () {
      scope.frmHolidaySave = {
        $valid: false,
        inpDescription: {
          $valid: true,
        },
      };

      scope.validDate = true;

      var bool = ctrl.IsValid();

      expect(bool).toBe(false);
    });

    it('should return false if frmHolidaySave is invalid, validDate is valid and inpDescription is invalid', function () {
      scope.frmHolidaySave = {
        $valid: false,
        inpDescription: {
          $valid: false,
        },
      };

      scope.validDate = true;

      var bool = ctrl.IsValid();

      expect(bool).toBe(false);
    });

    it('should return false if frmHolidaySave is valid, validDate is invalid and inpDescription is invalid', function () {
      scope.frmHolidaySave = {
        $valid: false,
        inpDescription: {
          $valid: false,
        },
      };

      scope.validDate = false;

      var bool = ctrl.IsValid();

      expect(bool).toBe(false);
    });

    it('should return false if frmHolidaySave is valid, validDate is invalid and inpDescription is valid', function () {
      scope.frmHolidaySave = {
        $valid: true,
        inpDescription: {
          $valid: true,
        },
      };

      scope.validDate = false;

      var bool = ctrl.IsValid();

      expect(bool).toBe(false);
    });
  });

  describe('saveHoliday function -> ', function () {
    it('should set isSaving to false when IsValid returns false', function () {
      spyOn(ctrl, 'IsValid').and.callFake(function () {
        return false;
      });

      scope.saveHoliday();

      expect(scope.isSaving).toBe(false);
    });

    it('should call Holidays.save when not in editMode and hasErrors is false', function () {
      spyOn(ctrl, 'IsValid').and.callFake(function () {
        return true;
      });

      scope.editMode = false;

      scope.saveHoliday();

      expect(mockScheduleServices.Dtos.Holidays.save).toHaveBeenCalled();
    });

    it('should call Holidays.Update when not in editMode and hasErrors is false', function () {
      spyOn(ctrl, 'IsValid').and.callFake(function () {
        return true;
      });

      scope.editMode = true;

      scope.saveHoliday();

      expect(mockScheduleServices.Dtos.Holidays.Update).toHaveBeenCalled();
    });

    it('should correctly format the date string to exclude the time', function () {
      spyOn(ctrl, 'IsValid').and.callFake(function () {
        return true;
      });

      scope.editMode = false;

      var expectedDate = moment(scope.holiday.Date).format('YYYY-MM-DD');

      scope.saveHoliday();

      expect(mockScheduleServices.Dtos.Holidays.save).toHaveBeenCalledWith(
        jasmine.objectContaining({ Date: expectedDate }),
        jasmine.anything(),
        jasmine.anything()
      );
    });
  });

  describe('HolidaySaveOnSuccess function -> ', function () {
    it('should set isSaving to false and call toastrFactor.success and close modalInstance', function () {
      ctrl.HolidaySaveOnSuccess(mockHolidayValue);

      expect(scope.isSaving).toBe(false);
      expect(_toastr_.success).toHaveBeenCalled();
      expect(modalInstanceMock.close).toHaveBeenCalled();
    });
  });

  describe('HolidaySaveOnError function -> ', function () {
    it('should set isSaving to false and call toastrFactor.error', function () {
      ctrl.HolidaySaveOnError();

      expect(scope.isSaving).toBe(false);
      expect(_toastr_.error).toHaveBeenCalled();
    });
  });

  describe('cancelChanges function -> ', function () {
    it('should call modalFactory.CancelModal', function () {
      scope.holiday.Description = 'blarg';
      scope.cancelChanges();

      expect(mockModalFactory.CancelModal().then).toHaveBeenCalled();
    });

    it('should call mInstance.close', function () {
      scope.cancelChanges();

      expect(modalInstanceMock.close).toHaveBeenCalled();
    });
  });

  describe('confirmCancel function -> ', function () {
    it('should call mInstance.close', function () {
      ctrl.confirmCancel();

      expect(modalInstanceMock.close).toHaveBeenCalled();
    });
  });
});
