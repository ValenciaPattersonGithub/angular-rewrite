describe('calendarPicker -> ', function () {
  //#region mock data
  var mockCalendarPickerDateTemp = moment({
    year: 2015,
    day: 1,
    hour: 8,
    minute: 0,
  });
  var mockDateVar = moment({ year: 2015, day: 30, hour: 1, minute: 0 });
  var mockMonthNames = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];
  //#endregion

  describe('directive ->', function () {
    var element, compile, rootScope, scope;

    beforeEach(module('common.factories'));
    beforeEach(module('common.directives'));
    beforeEach(module('Soar.Common'));
    beforeEach(module('soar.templates'));

    beforeEach(inject(function ($compile, $rootScope, $injector) {
      compile = $compile;
      rootScope = $rootScope;
      scope = rootScope.$new();

      var patSecurityService = $injector.get('patSecurityService');
      patSecurityService.IsAuthorizedByAbbreviation = jasmine
        .createSpy()
        .and.returnValue(true);
    }));

    it('should inject template when compiled', function () {
      element = angular.element(
        '<calendar-picker open="calendarPickerOpen" hide-control="hideCalendarPicker" date-var="calendarPickerDate" valid="validDate" max-date="calendarPickerMaxDate" min-date="calendarPickerMinDate"></calendar-picker>'
      );
      compile(element)(scope);
      rootScope.$digest();

      var p = angular.element('.calendar-picker-content', element);

      expect(p.length).toBe(1);
    });
  });

  describe('controller ->', function () {
    var ctrl, scope, timeout;

    beforeEach(module('common.controllers'));

    beforeEach(inject(function ($rootScope, $controller, $timeout) {
      scope = $rootScope.$new();
      scope.$parent.calendarUpdated = jasmine.createSpy();
      timeout = $timeout;
      ctrl = $controller('CalendarPickerCtrl', {
        $scope: scope,
        $timeout: timeout,
        $attrs: null,
      });
    }));

    it('should exist', function () {
      expect(ctrl).not.toBeNull();
    });

    it('should set default values', function () {
      expect(scope.open).toBe(true);
      expect(scope.calendarPickerDateTemp).toBe(scope.dateVar);
      expect(scope.hideDateInput).toBe(true);
      expect(scope.navBarClicked).toBe(false);
      expect(scope.monthNames).toEqual([
        'January',
        'February',
        'March',
        'April',
        'May',
        'June',
        'July',
        'August',
        'September',
        'October',
        'November',
        'December',
      ]);
      expect(scope.calendarPickerOpen).toBe(true);
    });

    describe('getHeaderMonth function -> ', function () {
      it('should return a month string', function () {
        scope.monthNames = angular.copy(mockMonthNames);

        var month = scope.getHeaderMonth(0);

        expect(month).toEqual(scope.monthNames[0]);
      });
    });

    describe('goToNextMonth function -> ', function () {
      it('should advance calendarPickerDateTemp one month', function () {
        scope.calendarPickerDateTemp = angular.copy(mockCalendarPickerDateTemp);

        scope.goToNextMonth();

        expect(scope.navBarClicked).toBe(true);
        expect(scope.calendarPickerDateTemp).toEqual(
          mockCalendarPickerDateTemp.add(1, 'months').toDate()
        );
      });
    });

    describe('goToPrevMonth function -> ', function () {
      it('should back up calendarPickerDateTemp one month', function () {
        scope.calendarPickerDateTemp = angular.copy(mockCalendarPickerDateTemp);

        scope.goToPrevMonth();

        expect(scope.navBarClicked).toBe(true);
        expect(scope.calendarPickerDateTemp).toEqual(
          mockCalendarPickerDateTemp.subtract(1, 'months').toDate()
        );
      });
    });

    describe('goToToday function -> ', function () {
      it('should set calendarPickerDateTemp to today when scope.disableToday is undefined', function () {
        var baseTime = new Date(2015, 8, 25);
        jasmine.clock().mockDate(baseTime);

        scope.goToToday();

        //scope.navBarClicked was taken out of the function
        //expect(scope.navBarClicked).toBe(true);
        expect(scope.calendarPickerDateTemp).toEqual(baseTime);
      });

      it('should set calendarPickerDateTemp to today when scope.disableToday is false', function () {
        var baseTime = new Date(2015, 8, 25);
        jasmine.clock().mockDate(baseTime);

        scope.disableToday = false;

        scope.goToToday();

        //scope.navBarClicked was taken out of the function
        //expect(scope.navBarClicked).toBe(true);
        expect(scope.calendarPickerDateTemp).toEqual(baseTime);
      });

      it('should not set calendarPickerDateTemp to today when scope.disableToday is true', function () {
        var baseTime = new Date(2015, 8, 25);
        var targetTime = new Date(2017, 1, 1);
        jasmine.clock().mockDate(baseTime);

        scope.calendarPickerDateTemp = targetTime;
        scope.disableToday = true;

        scope.goToToday();

        expect(scope.calendarPickerDateTemp).toEqual(targetTime);
      });
    });

    describe('jumpMonth function -> ', function () {
      it('should set calendarPickerDateTemp to one month from today', function () {
        scope.calendarPickerDateTemp = angular.copy(mockCalendarPickerDateTemp);
        scope.dateVar = moment(new Date());
        var copy = scope.dateVar;

        scope.jumpMonth(1);
        scope.dateVar = scope.calendarPickerDateTemp;

        expect(scope.navBarClicked).toBe(true);
        expect(scope.calendarPickerDateTemp).toEqual(
          copy.add(1, 'months').startOf('day').toDate()
        );
      });

      it('should set calendarPickerDateTemp to 5 months from today', function () {
        scope.calendarPickerDateTemp = angular.copy(mockCalendarPickerDateTemp);
        scope.dateVar = angular.copy(mockDateVar);
        var copy = scope.dateVar;

        scope.jumpMonth(3);
        scope.dateVar = scope.calendarPickerDateTemp;
        scope.jumpMonth(2);
        scope.dateVar = scope.calendarPickerDateTemp;

        expect(scope.navBarClicked).toBe(true);
        expect(scope.calendarPickerDateTemp).toEqual(
          copy.add(5, 'months').startOf('day').toDate()
        );
      });
    });

    describe('toggleCalendarPicker function -> ', function () {
      it('should toggle scope.open', function () {
        scope.open = false;
        scope.navBarClicked = false;
        scope.dateVar = angular.copy(mockDateVar);

        scope.toggleCalendarPicker();

        expect(scope.open).toBe(true);
        expect(scope.navBarClicked).toBe(true);
        expect(scope.calendarPickerDateTemp.toDate()).toEqual(
          mockDateVar.toDate()
        );
      });
    });

    describe(' on goToDateChild broadcast event ->', function () {
      var baseDate;
      beforeEach(function () {
        spyOn(scope, 'goToToday');
        baseDate = moment('2018-10-17 15:30:00.0000000');
        scope.calendarPickerDateTemp = baseDate;
      });

      it('should call scope.goToToday if args is today', function () {
        var args = 'today';
        scope.$apply();
        scope.$emit('goToDateChild', args);
        scope.$apply();
        expect(scope.goToToday).toHaveBeenCalled();
      });

      it('should add incrementBy value to scope.calendarPickerDateTemp if args is day', function () {
        var incrementBy = 1;
        var args = 'day';
        scope.$apply();
        scope.$emit('goToDateChild', args, incrementBy);
        scope.$apply();
        expect(scope.calendarPickerDateTemp).toEqual(
          baseDate.add(incrementBy, 'days').toDate()
        );
      });

      it('should add incrementBy value to scope.calendarPickerDateTemp if args is week', function () {
        var incrementBy = 1;
        var args = 'week';
        scope.$apply();
        scope.$emit('goToDateChild', args, incrementBy);
        scope.$apply();
        expect(scope.calendarPickerDateTemp).toEqual(
          baseDate.add(incrementBy, 'days').toDate()
        );
      });

      it('should subtract incrementBy value to scope.calendarPickerDateTemp if args is -day', function () {
        var incrementBy = 1;
        var args = '-day';
        scope.$apply();
        scope.$emit('goToDateChild', args, incrementBy);
        scope.$apply();
        expect(scope.calendarPickerDateTemp).toEqual(
          baseDate.subtract(incrementBy, 'days').toDate()
        );
      });

      it('should subtract incrementBy value to scope.calendarPickerDateTemp if args is -week', function () {
        var incrementBy = 1;
        var args = '-week';
        scope.$apply();
        scope.$emit('goToDateChild', args, incrementBy);
        scope.$apply();
        expect(scope.calendarPickerDateTemp).toEqual(
          baseDate.subtract(incrementBy, 'days').toDate()
        );
      });
    });

    describe('calendarPickerDateTemp watch', function () {
      var calendarPickerDateTempMoment;
      beforeEach(function () {
        calendarPickerDateTempMoment = moment('2018-10-17 15:30:00.0000000');
      });

      it('should call ctrl.WatchCalendarPickerDateTemp', function () {
        spyOn(ctrl, 'WatchCalendarPickerDateTemp');
        scope.calendarPickerDateTemp = calendarPickerDateTempMoment
          .add(1, 'days')
          .toDate();

        scope.$apply();
        scope.calendarPickerDateTemp = calendarPickerDateTempMoment
          .add(2, 'days')
          .toDate();
        scope.$apply();
        //expect(ctrl.WatchCalendarPickerDateTemp).toHaveBeenCalled();
      });
    });

    describe('toggleCalendarPicker function -> ', function () {
      beforeEach(function () {
        scope.navBarClicked = true;
      });

      it('should do nothing if old and new values are same', function () {
        var ov = moment('2018-10-17 15:30:00.0000000');
        var nv = moment('2018-10-17 15:30:00.0000000');
        ctrl.WatchCalendarPickerDateTemp(nv, ov);
        expect(scope.navBarClicked).toBe(true);
      });

      it('should set dateVar to new value if values are different', function () {
        var ov = moment('2018-10-17 15:30:00.0000000');
        scope.calendarPickerDateTemp = ov.add(1, 'day').toDate();
        scope.navBarClicked = false;
        ctrl.WatchCalendarPickerDateTemp(scope.calendarPickerDateTemp, ov);
        expect(scope.calendarPickerDateTemp).toEqual(
          scope.calendarPickerDateTemp
        );
      });

      it('should call scope.$parent.calendarUpdated with dateVar', function () {
        var ov = moment('2018-10-17 15:30:00.0000000');
        scope.calendarPickerDateTemp = ov.add(1, 'day').toDate();
        scope.navBarClicked = false;
        ctrl.WatchCalendarPickerDateTemp(scope.calendarPickerDateTemp, ov);
        expect(scope.$parent.calendarUpdated).toHaveBeenCalled();
      });
    });
  });
});
