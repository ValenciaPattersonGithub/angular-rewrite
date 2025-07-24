//'use strict';

angular.module('common.controllers').controller('CalendarPickerCtrl', [
  '$scope',
  '$attrs',
  '$timeout',
  'patSecurityService',
  'localize',
  function ($scope, $attrs, $timeout, patSecurityService, localize) {
    var ctrl = this;

    //#region Authorization
    // view access
    ctrl.authViewAccess = function () {
      return patSecurityService.IsAuthorizedByAbbreviation($scope.authZ);
    };

    ctrl.authAccess = authAccess;
    function authAccess() {
      if (!ctrl.authViewAccess()) {
        //toastrFactory.error(patSecurityService.generateMessage($scope.authZ), 'Not Authorized');
        event.preventDefault();
      } else {
        $scope.hasViewAccess = true;

        setTimeout(function () {
          $('#datePickerCtrl').css('pointer-events', 'auto');
        }, 1);
      }
    }

    // authorization
    ctrl.authAccess();
    // #endregion
    $scope.calPickOpt = {
      minDate: $scope.minDate,
      maxDate: $scope.maxDate,
      showWeeks: false,
    };

    $scope.open = true;
    $scope.calendarPickerDateTemp = $scope.dateVar;

    $scope.hideDateInput = true;
    $scope.navBarClicked = false;

    $scope.monthNames = [
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
    $scope.calenderText = {
      today: localize.getLocalizedString('Today'),
      threeMonth: localize.getLocalizedString('+3M'),
      fourMonth: localize.getLocalizedString('+4M'),
      sixMonth: localize.getLocalizedString('+6M'),
      oneYear: localize.getLocalizedString('+1Y'),
    };

    $scope.calendarPickerOpen = true;

    $scope.getHeaderMonth = getHeaderMonth;
    function getHeaderMonth(val) {
      var month = '';

      if (val >= 0) {
        month = $scope.monthNames[val];
      }

      return month;
    }

    $scope.goToNextMonth = goToNextMonth;
    function goToNextMonth() {
      $scope.navBarClicked = true;

      var calendarPickerDateTempMoment = moment($scope.calendarPickerDateTemp);

      // handle incrementing into a new year
      $scope.calendarPickerDateTemp = calendarPickerDateTempMoment
        .add(1, 'months')
        .toDate();
      $scope.$parent.calendarUpdated($scope.calendarPickerDateTemp);
    }

    $scope.goToPrevMonth = goToPrevMonth;
    function goToPrevMonth() {
      $scope.navBarClicked = true;

      var calendarPickerDateTempMoment = moment($scope.calendarPickerDateTemp);

      // handle incrementing into a new year
      $scope.calendarPickerDateTemp = calendarPickerDateTempMoment
        .subtract(1, 'months')
        .toDate();
      $scope.$parent.calendarUpdated($scope.calendarPickerDateTemp);
    }

    // broadcast from scheduler when navigation arrows are used to jump ahead or back
    // passes the increment value for datepicker
    $scope.$on('goToDateChild', function (event, args, incrementBy) {
      if (args == 'today') {
        $scope.goToToday();
      } else if (args === 'jumptodate') {
        // yes using the incrementBy to pass date is probably bad practice but I'm hoping
        // this whole control is replaced by something better in the move to Angular8 - D1
        $scope.calendarPickerDateTemp = incrementBy;
      } else {
        var calendarPickerDateTempMoment = moment(
          $scope.calendarPickerDateTemp
        );
        if (args == 'day' || args == 'week') {
          $scope.calendarPickerDateTemp = calendarPickerDateTempMoment
            .add(incrementBy, 'days')
            .toDate();
        } else if (args == '-day' || args == '-week') {
          $scope.calendarPickerDateTemp = calendarPickerDateTempMoment
            .subtract(incrementBy, 'days')
            .toDate();
        }
      }
    });

    $scope.goToToday = function () {
      if ($scope.disableToday === true) return;

      $scope.calendarPickerDateTemp = new Date();
    };

    $scope.jumpMonth = jumpMonth;
    function jumpMonth(increment) {
      $scope.navBarClicked = true;

      var calendarPickerDateTempMoment = moment($scope.dateVar);

      // handle incrementing into a new year
      $scope.calendarPickerDateTemp = calendarPickerDateTempMoment
        .add(increment, 'months')
        .startOf('day')
        .toDate();

      // bubble up event to parent scope to allow updating of date
      $scope.$parent.calendarUpdated($scope.calendarPickerDateTemp);
    }

    $scope.toggleCalendarPicker = toggleCalendarPicker;
    function toggleCalendarPicker() {
      $scope.open = true;
      $scope.navBarClicked = true;
      $scope.calendarPickerDateTemp = $scope.dateVar;
    }

    ctrl.WatchCalendarPickerDateTemp = watchCalendarPickerDateTemp;
    function watchCalendarPickerDateTemp(nv, ov) {
      if (_.isEqual(nv, ov)) {
        return;
      }

      if (nv != null && $scope.navBarClicked == false) {
        $scope.dateVar = $scope.calendarPickerDateTemp;
        $scope.$parent.calendarUpdated($scope.dateVar);
        $scope.open = true; // set to true since there are now no picker icon for scheduler calendar
      }

      $scope.navBarClicked = false;
    }

    $scope.$watch('calendarPickerDateTemp', ctrl.WatchCalendarPickerDateTemp);

    $scope.onCalendarPickerBlur = onCalendarPickerBlur;
    function onCalendarPickerBlur(blurEvent) {
      if (blurEvent && blurEvent.relatedTarget) {
        if (blurEvent.relatedTarget.id) {
          if (blurEvent.relatedTarget.id.indexOf('NoBlur') > -1) {
            $scope.navBarClicked = false;
            $scope.open = true;
            $('#' + blurEvent.relatedTarget.id).focus();
          } else {
            $scope.dateVar = $scope.calendarPickerDateTemp;
            $scope.open = false;
          }
        }
      } else {
        $scope.open = false;
      }
    }
  },
]);
