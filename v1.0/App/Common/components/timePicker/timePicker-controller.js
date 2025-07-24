'use strict';

// currentTime is what is displayed in the combo box.
// selectedTime is what is the value passed between to the parent scope and the time picker

angular
  .module('common.controllers')
  .controller('TimePickerCtrl', [
    '$scope',
    '$timeout',
    'ListHelper',
    'AvailableTime',
    TimePickerCtrl,
  ]);

function TimePickerCtrl($scope, $timeout, listHelper, availableTime) {
  BaseCtrl.call(this, $scope, 'TimePickerCtrl');
  var ctrl = this;
  ctrl.kendoWidgets = [];

  ctrl.formatDate = function (newValue) {
    if (newValue != null) {
      var valueAsMoment;
      if (angular.isString(newValue)) {
        valueAsMoment = moment(newValue);
      } else if (angular.isDate(newValue)) {
        valueAsMoment = moment(newValue.toISOString());
      } else if (angular.isNumber(newValue)) {
        valueAsMoment = moment(newValue);
      }

      return valueAsMoment.toISOString();
      //var valueAsISO = angular.isString(newValue) ? newValue : newValue.toISOString();
      //valueAsISO = '0001-01-01' + valueAsISO.substr(valueAsISO.indexOf('T'));

      //return valueAsISO;
    }

    return null;
  };

  ctrl.getDuration = function (startTime, endTime) {
    if (startTime != null && endTime != null) {
      var startMoment = moment(startTime);
      var endMoment = moment(endTime);

      var duration = endMoment.diff(startMoment, 'm');

      return duration;
    }

    return 0;
  };

  ctrl.localMoment = function (isoString) {
    return moment(moment(isoString).format('YYYY-MM-DD HH:mm:ss'));
  };

  ctrl.localDate = function (isoString) {
    return ctrl.localMoment(isoString).toDate();
  };

  ctrl.generateTime = function () {
    ctrl.timeParams = {
      date: ctrl.begin.toISOString(),
      hour: ctrl.begin.hour(),
      minute: ctrl.begin.minute(),
      increment: $scope.increment,
      maxDuration: ctrl.maxDuration,
      showDuration: ctrl.showDuration,
    };

    if (
      JSON.stringify(ctrl.timeParams) != JSON.stringify(ctrl.previousTimeParams)
    ) {
      $scope.times = availableTime.Generate(
        ctrl.begin,
        ctrl.timeParams.hour,
        ctrl.timeParams.minute,
        ctrl.timeParams.increment,
        ctrl.timeParams.maxDuration,
        ctrl.timeParams.showDuration,
        undefined,
        ctrl.includeZeroDuration
      );
      var current = ctrl.localMoment($scope.selectedTime);

      var time = null;

      if (current.isValid()) {
        ctrl.addingCustomTime = true;

        time = {
          Duration: ctrl.getDuration(ctrl.begin, current),
          Display: current.format('h:mm a'),
          ShowDuration: ctrl.showDuration,
          Time: $scope.selectedTime,
        };
      }

      if (time) {
        $scope.currentTime = time.Display;
        //$scope.selectedTime = time.Time;
        $scope.selectedTime = time.Time;
        //ctrl.changeTimeOnSelectedTime(time.Time);

        $scope.selectedDuration = time.Duration;
      }

      ctrl.addingCustomTime = false;

      ctrl.previousTimeParams = angular.copy(ctrl.timeParams);
    }
  };

  $scope.selectTime = function (currentTime) {
    if (angular.isUndefined(currentTime) || ctrl.addingCustomTime) {
      return;
    }

    if (currentTime) {
      var time;
      $scope.selectedTime = ctrl.formatDate($scope.selectedTime);

      time = ctrl.listHelper.findItemByFieldValue(
        $scope.times,
        'Display',
        currentTime
      );

      if (time) {
        $scope.currentTime = time.Display;
        //$scope.selectedTime = time.Time;
        $scope.selectedTime = time.Time;
        //ctrl.changeTimeOnSelectedTime(time.Time);
        //$scope.selectedDuration = time.Duration;
      } else {
        time = ctrl.computeTimeValue(currentTime);

        if (time) {
          $scope.currentTime = time.Display;
          //$scope.selectedTime = time.Time;
          $scope.selectedTime = time.Time;
          //ctrl.changeTimeOnSelectedTime(time.Time);
          //$scope.selectedDuration = time.Duration;
        }
      }
    } else {
      $scope.currentTime = null;
      $scope.selectedTime = null;
    }
  };

  ctrl.changeTimeOnSelectedTime = function (time) {
    if (!angular.isUndefined(time) && time != null) {
      if (
        !angular.isUndefined($scope.selectedTime) &&
        $scope.selectedTime != null
      ) {
        var selectedTime = ctrl.formatDate($scope.selectedTime);
        var strippedTime = ctrl.formatDate(time).substring(10);

        $scope.selectedTime = selectedTime.substring(0, 10) + strippedTime;
      } else {
        $scope.selectedTime = time;
      }
    } else {
      $scope.selectedTime = null;
    }
  };

  ctrl.CreateTimeFromDuration = function (startTime, duration) {
    // Ensure that we only use mutliples of 5.
    duration = duration - (duration % 5) + (duration % 5 > 0 ? 5 : 0);

    var time = moment(startTime ? startTime : [1, 1, 1, 0, 0, 0, 0]);
    time.add(duration, 'm');

    if (time.isValid()) {
      return {
        Duration: duration,
        Display: time.format('h:mm a'),
        ShowDuration: ctrl.showDuration,
        Time: time.toISOString(),
      };
    } else {
      return null;
    }
  };

  ctrl.CreateTimeFromString = function (startTime, hours, minutes, meridian) {
    var time = moment(startTime ? startTime : [1, 1, 1, 0, 0, 0, 0]);
    time.hour(meridian == 'pm' ? hours + 12 : hours);
    time.minutes(minutes - (minutes % 5) + (minutes % 5 > 0 ? 5 : 0));

    var duration = ctrl.getDuration(startTime, time);

    if (time.isValid()) {
      return {
        Duration: duration,
        Display: time.format('h:mm a'),
        ShowDuration: ctrl.showDuration,
        Time: time.toISOString(),
      };
    } else {
      return null;
    }
  };

  ctrl.computeTimeValue = function (currentTime) {
    var time = null;
    var parts, meridian, duration, hour, minute;

    if (angular.isString(currentTime)) {
      parts = currentTime.split(':');

      if (parts.length == 1) {
        duration = parseInt(parts[0]);

        duration = duration - (duration % 5) + (duration % 5 > 0 ? 5 : 0);

        time = ctrl.listHelper.findItemByFieldValue(
          $scope.times,
          'Duration',
          duration
        );

        if (!time) {
          time = ctrl.CreateTimeFromDuration(ctrl.begin, duration);
        }
      } else {
        meridian = parts[1].slice(2).trim().toLowerCase();

        if (parts[0].length > 0 && parts[0][0] == '0') {
          parts[0] = parts[0].slice(1);
        }

        if (meridian == '') {
          time = ctrl.listHelper.findItemByFieldValue(
            $scope.times,
            'Display',
            parts[0] + ':' + parts[1].slice(0, 2) + ' am'
          );

          time = time
            ? time
            : ctrl.listHelper.findItemByFieldValue(
                $scope.times,
                'Display',
                parts[0] + ':' + parts[1].slice(0, 2) + ' pm'
              );
        } else if (meridian.length == 2) {
          time = ctrl.listHelper.findItemByFieldValue(
            $scope.times,
            'Display',
            parts[0] + ':' + parts[1].slice(0, 2) + ' ' + meridian
          );
        }

        if (!time) {
          hour = parseInt(parts[0]) % 12;
          minute = parseInt(parts[1]);
          minute = minute - (minute % 5) + (minute % 5 > 0 ? 5 : 0);

          time = ctrl.CreateTimeFromString(
            ctrl.begin,
            hour,
            minute,
            meridian,
            $scope.times.length > 0 ? $scope.times[0].ShowDuration : null
          );
        }
      }
    }

    return time;
  };

  ctrl.timeChanged = function (newTime, oldTime) {
    if (newTime != null && newTime != oldTime) {
      $scope.selectedTime = newTime;
      //ctrl.changeTimeOnSelectedTime(newTime);
      //$scope.selectedTime = ctrl.formatDate(newTime);

      var current = moment($scope.selectedTime);

      if (current.isValid()) {
        ctrl.addingCustomTime = true;

        var time = {
          Duration: ctrl.getDuration(ctrl.begin, current),
          Display: current.format('h:mm a'),
          ShowDuration: ctrl.showDuration,
          Time: $scope.selectedTime,
        };
      }

      if (time) {
        $scope.currentTime = time.Display;
        $scope.selectedTime = time.Time;
        //ctrl.changeTimeOnSelectedTime(time.Time);
        //$scope.selectedTime = time.Time;
        $scope.selectedDuration = time.Duration;
      }

      ctrl.addingCustomTime = false;
      //$scope.selectTime(String($scope.selectedTime));
    }
  };

  ctrl.incrementChanged = function (nv, ov) {
    if (nv != null && nv != ov) {
      ctrl.generateTime();
    }
  };

  ctrl.beginChanged = function (nv, ov) {
    if (nv && nv != ov) {
      ctrl.updateTimeRange();

      ctrl.generateTime(true);
    }
  };

  ctrl.endChanged = function (nv, ov) {
    if (nv && nv != ov) {
      ctrl.updateTimeRange();

      ctrl.generateTime();
    }
  };

  ctrl.updateTimeRange = function () {
    ctrl.begin = ctrl.formatDate($scope.begin);
    ctrl.begin = moment(ctrl.begin ? ctrl.begin : ctrl.today);

    ctrl.end = ctrl.formatDate($scope.end);
    ctrl.end = moment(
      ctrl.end
        ? ctrl.end
        : [ctrl.begin.year(), ctrl.begin.month(), ctrl.begin.date(), 23, 55]
    );

    ctrl.maxDuration = ctrl.getDuration(ctrl.begin, ctrl.end);
  };

  $scope.currentTimeChanged = function () {
    $scope.selectTime(this.value());
  };

  ctrl.listHelper = listHelper;

  ctrl.increment = $scope.increment > 0 ? $scope.increment : 5;
  ctrl.showDuration = $scope.showDuration == true ? true : false;
  ctrl.includeZeroDuration = $scope.includeZeroDuration == true ? true : false;

  var now = new Date();
  ctrl.today = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    0,
    0,
    0,
    0
  );
  ctrl.endOfDay = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    23,
    55,
    0,
    0
  );

  ctrl.updateTimeRange();

  ctrl.addingCustomTime = false;

  $scope.times = [];
  $scope.valid = true;

  $scope.$on('kendoWidgetCreated', function (event, widget) {
    ctrl.kendoWidgets.push(widget);
    if (widget.ns == '.kendoComboBox' && $scope.showDuration) {
      widget.list.width(200);
      widget.list.kendoAddClass('time-picker-times');
    }
  });

  $scope.comboOpen = function (event) {
    $timeout(function () {
      var parent = $(event.sender.list).find('ul.k-list');
      var item = $(event.sender.list).find('ul.k-list .k-state-selected');
      var itemOffsetTop = angular.isDefined(item.offset())
        ? item.offset().top
        : 0;
      parent.scrollTop(
        itemOffsetTop - parent.offset().top + parent.scrollTop()
      );
    }, 500);
  };

  ctrl.generateTime();

  $scope.$watch('selectedTime', ctrl.timeChanged);

  $scope.$watch('increment', ctrl.incrementChanged);

  $scope.$watch('begin', ctrl.beginChanged);

  $scope.$watch('end', ctrl.endChanged);
}

TimePickerCtrl.prototype = Object.create(BaseCtrl.prototype);
