var AppointmentControl = angular
  .module('Soar.Schedule')
  .controller(
    'AppointmentViewEndTimeDropdownController',
    AppointmentViewEndTimeDropdownController
  );
AppointmentViewEndTimeDropdownController.$inject = [
  '$scope',
  '$timeout',
  'ListHelper',
  'AvailableTime',
];

function AppointmentViewEndTimeDropdownController(
  $scope,
  $timeout,
  listHelper,
  availableTime
) {
  BaseSchedulerCtrl.call(
    this,
    $scope,
    'AppointmentViewEndTimeDropdownController'
  );
  var ctrl = this;

  $scope.isOpen = false;

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
    }

    return null;
  };

  //This function scrolls to the selected end time in the end time dropdown
  $scope.scrollToSelectedEndTime = function (
    dropdownListBox,
    index,
    lblOptionName
  ) {
    if (document.getElementById(lblOptionName + index)) {
      var topPos = document.getElementById(lblOptionName + index).offsetTop;
      //console.log(topPos);
      document.getElementById(dropdownListBox).scrollTop = topPos - 5;
      //Set to true so the scrollToSelectedEndTime function doesn't keep getting executed after it finds the selected time in the dropdown
      $scope.selectedEndTimeFound = true;
    }
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
    //Check to see if there is a duration set, then adjust increment to avoid timing issues
    if (
      ($scope.$parent.selectedAppointmentType !== null &&
        $scope.$parent.selectedAppointmentType.DefaultDuration !== null) ||
      ($scope.$parent.appointmentTime !== null &&
        $scope.$parent.appointmentTime.Duration !== null)
    ) {
      //$scope.increment = $scope.$parent.selectedAppointmentType.DefaultDuration;
      $scope.increment = 5;
    }
    //I want to leave this hear until we clean up this bug in Moose4, I had some alternative code to set end
    // increments to the same length as the appt duration or the schedule increment duration.
    // $scope.originalIncrement = $scope.increment;
    //if ($scope.$parent.appointmentTime !== null && $scope.$parent.appointmentTime.Duration !== null) {
    //    $scope.increment = $scope.$parent.appointmentTime.Duration;
    //    $scope.increment = 5;
    //}
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
        ctrl.timeParams.showDuration
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
        $scope.selectedTime = time.Time;
        $scope.selectedItem = time;

        $scope.selectedDuration = time.Duration;
      }

      ctrl.addingCustomTime = false;

      ctrl.previousTimeParams = angular.copy(ctrl.timeParams);
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

  ctrl.timeChanged = function (newTime, oldTime) {
    if (newTime != null && newTime != oldTime) {
      $scope.selectedTime = newTime;

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
        $scope.selectedItem = time;

        $scope.selectedDuration = time.Duration;
      }

      ctrl.addingCustomTime = false;
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

  ctrl.listHelper = listHelper;

  ctrl.increment = $scope.increment > 0 ? $scope.increment : 5;
  ctrl.showDuration = $scope.showDuration == true ? true : false;

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

  ctrl.init = init;
  function init() {
    let selection = _.find($scope.times, function (item) {
      return item.Time === $scope.selectedTime;
    });

    $scope.selectedItem = selection;
  }

  $scope.btnClick = btnClick;
  function btnClick() {
    //This needs set so the scrollToSelectedEndTime function doesn't keep getting executed after it finds the selected time in the dropdown
    $scope.selectedEndTimeFound = false;

    if ($scope.isOpen) {
      $scope.isOpen = false;
    } else {
      $scope.isOpen = true;
    }
  }

  //close dropdown when it loses focus
  $scope.onBlur = onBlur;
  function onBlur() {
    if ($scope.isOpen) {
      $scope.isOpen = false;
    }
  }

  $scope.selectItem = selectItem;
  function selectItem(selectedItem) {
    if (selectedItem !== null) {
      $scope.selectedItem = selectedItem;
      $scope.currentTime = selectedItem.Display;
      $scope.selectedTime = selectedItem.Time;
    }
    $scope.isOpen = false;
  }

  ctrl.init();
}
AppointmentViewEndTimeDropdownController.prototype = Object.create(
  BaseSchedulerCtrl.prototype
);
