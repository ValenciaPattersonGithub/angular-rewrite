(function () {
  'use strict';

  var app = angular.module('PatWebCoreV1');

  app.factory('ultWarningService', [
    '$rootScope',
    '$uibModal',
    'TimeZoneFactory',
    function ($rootScope, $uibModal, timeZoneFactory) {
      var ultTimerStarted = false;

      const fifteenMinInMs = 15 * 60 * 1000;
      const twoMinInMs = 2 * 60 * 1000;

      function startUltTimers() {
        if (!ultTimerStarted) {
          ultTimerStarted = true;

          var ultEndTimeForWarning = localStorage.getItem('ultEndTime');
          if (ultEndTimeForWarning) {
            var ult = JSON.parse(ultEndTimeForWarning);
            var currentMoment = moment();
            var localTimeForUltTimezone = timeZoneFactory.ConvertDateToMomentTZ(
              currentMoment,
              ult.Timezone
            );

            var startTimeHoursInMs =
              localTimeForUltTimezone.hour() * 60 * 60 * 1000;
            var startTimeMinutesInMs =
              localTimeForUltTimezone.minutes() * 60 * 1000;
            var startTimeSecondsInMs = localTimeForUltTimezone.seconds() * 1000;
            var startTimeInMs =
              startTimeHoursInMs + startTimeMinutesInMs + startTimeSecondsInMs;
            var endTimeInMs = ult.EndTime;

            var timeRemainingMs = endTimeInMs - startTimeInMs;

            if (timeRemainingMs > fifteenMinInMs) {
              initiateUltTimer(timeRemainingMs, 15);
            }

            if (timeRemainingMs > twoMinInMs) {
              initiateUltTimer(timeRemainingMs, 2);
            }

            if (timeRemainingMs > 0) {
              initiateUltHeaderCountdown(timeRemainingMs);
            }
          }
        }
      }

      function initiateUltTimer(timeRemainingMs, timerWarningMinute) {
        var timeoutMs = timeRemainingMs - timerWarningMinute * 60 * 1000;

        setTimeout(function () {
          openUltEndWarning(timerWarningMinute);
        }, timeoutMs);
      }

      function initiateUltHeaderCountdown(minutesRemainingInMs) {
        if (minutesRemainingInMs > fifteenMinInMs) {
          setTimeout(function () {
            //UltHeaderCountdown should be set in seconds, not milliseconds
            $rootScope.ultHeaderCountdown = fifteenMinInMs / 1000;
          }, minutesRemainingInMs - fifteenMinInMs);
        } else {
          //UltHeaderCountdown should be set in seconds, not milliseconds
          $rootScope.ultHeaderCountdown = minutesRemainingInMs / 1000;
        }
      }

      function setUltEndTime(endTimeMinutes, timezone) {
        var endTimeMs = endTimeMinutes * 60 * 1000;

        //Set a local storage value for when the ULT will end
        localStorage.setItem(
          'ultEndTime',
          JSON.stringify({ Timezone: timezone, EndTime: endTimeMs })
        );
      }

      function openUltEndWarning(minutesRemaining) {
        var message =
          'Your session based on Restrict Day and Time Access team member settings is set to expire in ' +
          minutesRemaining +
          ' minutes, please save any unfinished work prior to session expiration. Please contact your Practice Administrator with any questions.';

        $uibModal.open({
          templateUrl: 'App/Common/components/confirmModal/confirmModal.html',
          controller: 'ConfirmModalController',
          size: 'lg',
          windowClass: 'warning-modal-center',
          backdrop: 'static',
          keyboard: false,
          resolve: {
            item: function () {
              return {
                Title: 'Warning',
                Message: message,
                Button1Text: 'OK',
                Data: null,
              };
            },
          },
        });
      }

      return {
        startUltTimers: startUltTimers,
        setUltEndTime: setUltEndTime,
      };
    },
  ]);
})();
