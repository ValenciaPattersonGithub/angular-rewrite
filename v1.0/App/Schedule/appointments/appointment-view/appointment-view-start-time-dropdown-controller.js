var AppointmentControl = angular
  .module('Soar.Schedule')
  .controller(
    'AppointmentViewStartTimeDropdownController',
    AppointmentViewStartTimeDropdownController
  );
AppointmentViewStartTimeDropdownController.$inject = [
  '$scope',
  '$timeout',
  'ListHelper',
  'AvailableTime',
];
function AppointmentViewStartTimeDropdownController(
  $scope,
  $timeout,
  listHelper,
  availableTime
) {
  BaseSchedulerCtrl.call(
    this,
    $scope,
    'AppointmentViewStartTimeDropdownController'
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

  //This function scrolls to the selected start time in the start time dropdown
  $scope.scrollToSelectedStartTime = function (
    dropdownListBox,
    index,
    lblOptionName
  ) {
    if (document.getElementById(lblOptionName + index)) {
      var topPos = document.getElementById(lblOptionName + index).offsetTop;
      //console.log(topPos);
      document.getElementById(dropdownListBox).scrollTop = topPos - 5;
      //Set to true so the scrollToSelectedStartTime function doesn't keep getting executed after it finds the selected time in the dropdown
      $scope.selectedStartTimeFound = true;
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

        time = {
          Duration: ctrl.getDuration(ctrl.begin, current),
          Display: current.format('h:mm a'),
          ShowDuration: ctrl.showDuration,
          Time: $scope.selectedTime,
        };
        
        // Add start time to the list if it doesn't exist
        // this happens when people mess around with the practice
        // incremenets after scheduling appointments
        if (!$scope.times.some(t => t.Display == time.Display))
        {
          $scope.times.unshift(time);
        }
      }

      if (time) {
        $scope.currentTime = time.Display;
        $scope.selectedTime = time.Time;
        $scope.selectedItem = time;

        $scope.selectedDuration = time.Duration;
      }


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
      //ctrl.changeTimeOnSelectedTime(newTime);
      //$scope.selectedTime = ctrl.formatDate(newTime);

      var current = moment($scope.selectedTime);

      if (current.isValid()) {

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
        //ctrl.changeTimeOnSelectedTime(time.Time);
        //$scope.selectedTime = time.Time;
        $scope.selectedDuration = time.Duration;
      }

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
    //This needs set so the scrollToSelectedStartTime function doesn't keep getting executed after it finds the selected time in the dropdown
    $scope.selectedStartTimeFound = false;

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
AppointmentViewStartTimeDropdownController.prototype = Object.create(
  BaseSchedulerCtrl.prototype
);
