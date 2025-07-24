'use strict';
angular.module('Soar.BusinessCenter').factory('UserRxFactory', [
  '$q',
  'patSecurityService',
  'practiceService',
  '$interval',
  '$injector',
  function ($q, patSecurityService, practiceService, $interval, $injector) {
    var factory = this;
    // named method for interval
    factory.rxNotificationTimer = null;
    // configurable interval
    factory.intervalMs = 300000;
    // observers
    factory.notificationObservers = [];
    // this value iterates to 3 tries before showing notifications toastr error message
    factory.rxNotificationAttempts = 0;

    //#region authentication
    factory.authCreatePatientAccess = function () {
      return patSecurityService.IsAuthorizedByAbbreviation(
        'rxapi-rx-rxpat-create'
      );
    };

    factory.authGetNotificationCount = function () {
      return patSecurityService.IsAuthorizedByAbbreviation(
        'rxapi-rx-rxuser-getcnt'
      );
    };

    // we want the rx notifications count to be updated regularly if the initial call is successful
    // otherwise we don't want to continue to make the calls
    factory.setRxNotificationsTimer = function (entId) {
      if (!_.isUndefined(factory.rxNotificationTimer)) {
        $interval.cancel(factory.rxNotificationTimer);
      }
      factory.rxNotificationTimer = $interval(function () {
        factory.getRxNotifications(entId);
      }, factory.intervalMs);
    };

    // retrieve notification failed storageitem if exists            /
    // if expiration has passed, remove session object
    factory.getNotificationFailed = function (userId) {
      var practiceId = practiceService.getCurrentPractice().id;
      var sessionObject = sessionStorage.getItem(
        'notificationFailed_' + userId + '_' + practiceId
      );
      if (sessionObject) {
        sessionObject = JSON.parse(sessionObject);
        var currentDate = new Date();
        var expirationDate = sessionObject.expiresAt;
        if (Date.parse(currentDate) < Date.parse(expirationDate)) {
          return sessionObject.notificationFailed;
        } else {
          // remove expired notification
          sessionStorage.removeItem(
            'notificationFailed_' + userId + '_' + practiceId
          );
          return false;
        }
      } else {
        return false;
      }
    };

    // persist notification failed across tabs by storing it on session stoarage
    // if the call to get rx notifications failed, set the expiration date on the sessionObject
    factory.setNotificationFailed = function () {
      var practiceId = practiceService.getCurrentPractice().id;
      // expires in 4 hours
      var expires = new Date(new Date().getTime() + 60000 * 240);
      var sessionObject = {
        expiresAt: expires.toISOString(),
        notificationFailed: true,
      };
      sessionStorage.setItem(
        'notificationFailed_' + factory.userId + '_' + practiceId,
        JSON.stringify(sessionObject)
      );
    };

    // This call is the new entry point for rx notifications by practice,
    // if it fails, no further action is taken
    // if succcessful it returns the notifications for the initial call and sets up the interval
    // which will make the call on a predetermined interval
    factory.getRxNotifications = function (entId) {
      if (factory.authGetNotificationCount()) {
        var defer = $q.defer();
        var promise = defer.promise;

        let rxService = $injector.get('RxService');
        rxService.getRxNotifications(factory.userId, entId).then(
          function (res) {
            promise = $.extend(promise, { values: res.Value });
            defer.resolve(res);
            // post to the observers
            angular.forEach(factory.notificationObservers, function (observer) {
              observer(res);
            });
          },
          function (res) {
            // only set the expiration date on the sessionObject if 3 attempts have been made
            if (factory.rxNotificationAttempts === 3) {
              factory.setNotificationFailed();
            }
            defer.reject(res);
          }
        );
        return promise;
      }
      };
      factory.location = {};
      factory.notificationFlag = false;
    factory.setLocation = function (newLocation) {
          factory.location = newLocation;            
    };
    factory.getLocation = function () {
          return factory.location;
      }

      factory.setLocationChange = function (flag) {
          const notificationService = $injector.get('NotificationsService'); // Angular service
          notificationService.notifyLocationChange(flag);
      }


    //#endregion
    return {
      // access to rx
      access: function () {
        return factory.authAccess();
      },
      RxNotifications: function (userId, rxNotificationAttempts, entId) {
        factory.userId = userId;
        factory.rxNotificationAttempts = rxNotificationAttempts;
        return factory.getRxNotifications(entId);
      },
      NotificationFailed: function (userId) {
        return factory.getNotificationFailed(userId);
      },
      SetRxNotificationsTimer: function (userId, entId) {
        factory.userId = userId;
        return factory.setRxNotificationsTimer(entId);
      },
      observeNotifications: function (observer) {
        factory.notificationObservers.push(observer);
      },
      setLocation: function (newLocation){
          factory.setLocation(newLocation);
      },
      getLocation: function () {
          return factory.getLocation;
        },
      setLocationChange: function (newFlag) {      
          factory.setLocationChange(newFlag);
      }


    };
  },
]);
