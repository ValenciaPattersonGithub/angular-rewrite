describe('timePicker ->', function () {
  var mockAvailableTimes = [
    {
      Duration: 5,
      Display: '3:05 am',
      DisplayWithDuration: '3:05 am5 minutes',
      ShowDuration: false,
      Time: new Date(2015, 1, 1, 1, 1, 1),
    },
    {
      Duration: 10,
      Display: '3:10 am',
      DisplayWithDuration: '3:10 am10 minutes',
      ShowDuration: false,
      Time: new Date(2015, 2, 2, 2, 2, 2),
    },
  ];

  var mockTime = {
    Time: '111-11-11T11:11:11.111Z',
    Duration: 123,
  };

  describe('directive ->', function () {
    var element;
    var compile;
    var rootScope;
    var scope;

    beforeEach(module('common.factories'));
    beforeEach(module('common.controllers'));
    beforeEach(module('common.directives'));
    beforeEach(module('soar.templates'));

    beforeEach(inject(function ($compile, $rootScope) {
      compile = $compile;
      rootScope = $rootScope;
      scope = rootScope.$new();
    }));

    it('should inject template when compiled', function () {
      element = angular.element(
        '<time-picker id="timePicker" selected-time="selectedTime"></date-selector>'
      );
      compile(element)(scope);
      rootScope.$digest();
      var p = angular.element('#timePicker', element);

      expect(p.length).toBe(1);
      expect(p.attr('id')).toBe('timePicker');
    });
  });

  describe('controller ->', function () {
    var timeout;
    var ctrl;
    var localize;
    var availableTime;
    var listHelper;
    var scope;

    beforeEach(module('common.controllers'));

    beforeEach(
      module('common.controllers', function ($provide) {
        availableTime = {
          Generate: jasmine.createSpy().and.returnValue(mockAvailableTimes),
        };

        $provide.value('AvailableTime', availableTime);

        listHelper = {
          findItemByFieldValue: jasmine
            .createSpy()
            .and.returnValue(angular.copy(mockTime)),
          findIndexByFieldValue: jasmine.createSpy().and.returnValue(1),
        };

        $provide.value('ListHelper', listHelper);

        localize = {
          getLocalizedString: jasmine.createSpy(),
        };
        $provide.value('localize', localize);
      })
    );

    beforeEach(inject(function ($rootScope, $controller, $timeout) {
      scope = $rootScope.$new();
      timeout = $timeout;

      ctrl = $controller('TimePickerCtrl', {
        $scope: scope,
        ListHelper: listHelper,
        $timeout: timeout,
        localize: localize,
      });
    }));

    it('should exist', function () {
      expect(ctrl).not.toBeNull();
    });

    describe('generateTime ->', function () {
      var duration;
      beforeEach(function () {
        ctrl.begin = moment([1, 1, 1, 0, 0, 0, 0]);
        ctrl.increment = 15;
        ctrl.maxDuration = 60;
        ctrl.showDuration = true;
        duration = 'some duration';

        scope.selectedTime = moment([3, 3, 3, 3, 3, 3, 3]);

        ctrl.changeTimeOnSelectedTime = jasmine.createSpy();
        ctrl.getDuration = jasmine.createSpy().and.returnValue(duration);
      });

      it('should generate a list of times when there are no previous time parameters', function () {
        ctrl.generateTime();

        expect(availableTime.Generate).toHaveBeenCalled();
      });

      it('when selectedTime is valid, should set selectedDuration to the duration between the begin time and the selected time', function () {
        ctrl.generateTime();

        expect(scope.selectedDuration).toEqual(duration);
      });

      it('should preserve selected time', function () {
        var originalTime = new Date(2018, 12, 11, 9, 15, 0, 0);
        scope.selectedTime = originalTime.toString();
        ctrl.previousTimeParams = null;

        ctrl.generateTime();

        expect(scope.currentTime).toBe(moment(originalTime).format('h:mm a'));
        expect(scope.selectedTime).toBe(originalTime.toString());
        expect(scope.selectedDuration).toBe(ctrl.getDuration());
        expect(ctrl.addingCustomTime).toBe(false);
        expect(ctrl.previousTimeParams).not.toBeNull();
      });
    });

    describe('selectTime ->', function () {
      describe('when currentTime and oldTime are undefined', function () {
        it('should return undefined', function () {
          var currentTime, oldTime;

          var returnValue = scope.selectTime(currentTime, oldTime);
          expect(returnValue).toBeUndefined();
        });
      });

      describe('when currentTime is undefined but oldTime is defined', function () {
        beforeEach(function () {
          scope.selectedTime = 'Not Null';
          scope.selectedDuration = 'Not Null';

          scope.selectTime(undefined, 'defined');
        });

        it('should NOT changed the values of selectedTime or selectedDuration', function () {
          expect(scope.selectedTime).toEqual('Not Null');
          expect(scope.selectedDuration).toEqual('Not Null');
        });
      });

      describe('when currentTime is defined', function () {
        beforeEach(function () {
          scope.times = angular.copy(mockAvailableTimes);

          scope.selectedTime = 'value to replace';
          scope.selectedDuration = 'value to replace';
          scope.currentTime = 'value to replace';
          scope.valid = 'value to replace';
        });

        it('should call ctrl.listHelper.findItemByFieldValue searching the array of times for the currentTime', function () {
          var currentTime = '1111-11-11T11:11:11.1111Z';

          scope.selectTime(currentTime);

          expect(ctrl.listHelper.findItemByFieldValue).toHaveBeenCalledWith(
            mockAvailableTimes,
            'Display',
            currentTime
          );
        });

        describe('and a time object is NOT found in the list', function () {
          beforeEach(function () {
            ctrl.listHelper.findItemByFieldValue = jasmine
              .createSpy()
              .and.returnValue(null);
          });

          describe('and ctrl.listHelper.findItemByFieldValue returns a value', function () {
            beforeEach(function () {
              ctrl.listHelper.findItemByFieldValue = jasmine
                .createSpy()
                .and.returnValue(mockTime);
              ctrl.changeTimeOnSelectedTime = jasmine.createSpy();

              scope.selectTime('00:00');
            });

            it("when a time is computed, should set the currentTime to the timeObject's Display property", function () {
              expect(scope.currentTime).toEqual(mockTime.Display);
            });

            it('when a time is computed, should change the time on the selected time', function () {
              expect(scope.selectedTime).toEqual(mockTime.Time);
            });
          });

          describe('and cctrl.listHelper.findItemByFieldValue does NOT return a value', function () {
            var computedTime;

            beforeEach(function () {
              computedTime = {
                Display: 'some display',
                Time: 'some time',
              };
              ctrl.listHelper.findItemByFieldValue = jasmine
                .createSpy()
                .and.returnValue(null);
              ctrl.changeTimeOnSelectedTime = jasmine.createSpy();
              ctrl.computeTimeValue = jasmine
                .createSpy()
                .and.returnValue(computedTime);
              scope.selectTime('99:99');
            });

            it('should attempt to compute the time value', function () {
              expect(ctrl.computeTimeValue).toHaveBeenCalled();
            });

            it("when a time is computed, should set the currentTime to the timeObject's Display property", function () {
              expect(scope.currentTime).toEqual(computedTime.Display);
            });

            it('when a time is computed, should change the time on the selected time', function () {
              expect(scope.selectedTime).toEqual(computedTime.Time);
            });
          });
        });
      });
    });

    describe('timeChanged ->', function () {
      it('should set current time to new time if new time does not equal current time', function () {
        var currentTime = new Date(2015, 1, 1, 1, 1, 1);

        var newTime = new Date(2015, 2, 2, 2, 2, 2);

        scope.selectedTime = moment(newTime);

        scope.currentTime = currentTime;

        expect(scope.currentTime).toEqual(currentTime);

        ctrl.timeChanged(newTime, null);
        expect(scope.currentTime).toEqual(
          moment(scope.selectedTime).format('h:mm a')
        );
      });
    });
  });
});
