// This service was created because of a sequence of unfortunate existing design items
// that prevent altering behavior of the application converting items to Angular because of module initialization in some places
// one such place is the Common.js file. Which based on what it is doing and the module it is in cannot have converted code connected to it at this time.

// General purpose of this file is to handle global handling of UserSettings in a way that will not blow up at initialization.
// Once the global module issue is addressed this service will be moved to the Practices Module and separated into a couple of different angular x services.
// Right now that cannot happen since the module loading of the application will not work without large changes to the module setup which will take a lot of time.
'use strict';

var app = angular.module('Soar.Common');

app.service('userSettingsDataService', [
  '$http',
  '$q',
  'toastrFactory',
  'localize',
  'IdmConfig',
  function ($http, $q, toastrFactory, localize, idmConfig) {
    var userSettings = null;

    var service = {
      getCachedUserSettings: getCachedUserSettings,
      isNewNavigationEnabled: isNewNavigationEnabled,
      isNewTreatmentPlanAreaEnabled: isNewTreatmentPlanAreaEnabled,
      isNewAppointmentAreaEnabled: isNewAppointmentAreaEnabled,
      isNewEditFeeOverridesAreaEnabled: isNewEditFeeOverridesAreaEnabled,
      isNewAppointmentDrawerEnabled: isNewAppointmentDrawerEnabled,
      getUserSettingsAtInitialization: getUserSettingsAtInitialization,
      getUserSettings: getUserSettings,
      saveScheduleUserSettings: saveScheduleUserSettings,
      updateScheduleUserSettings: updateScheduleUserSettings,
    };

    function getCachedUserSettings() {
      return userSettings;
    }

    function isNewNavigationEnabled() {
      // this will ensure the new navigation is always on while we move the other items out of the code.
      // the nice part about doing it this way is we can always not deploy it active for everyone.
      return true;
      //if (userSettings && userSettings.EnableNewClinicalNavigation) {
      //    return userSettings.EnableNewClinicalNavigation;
      //} else {
      //    return false;
      //}
    }

    function isNewTreatmentPlanAreaEnabled() {
      if (userSettings && userSettings.EnableNewTreatmentPlanFeatures) {
        return userSettings.EnableNewTreatmentPlanFeatures;
      } else {
        return false;
      }
    }

    function isNewAppointmentAreaEnabled() {
      if (userSettings && userSettings.EnableNewAppointmentPage) {
        return userSettings.EnableNewAppointmentPage;
      } else {
        return false;
      }
    }

    function isNewEditFeeOverridesAreaEnabled() {
      if (userSettings && userSettings.EnableFeeOverridesOnServices) {
        return userSettings.EnableFeeOverridesOnServices;
      } else {
        return false;
      }
    }

    function isNewAppointmentDrawerEnabled() {
      if (userSettings && userSettings.EnableAppointmentDrawer) {
        return userSettings.EnableAppointmentDrawer;
      } else {
        return false;
      }
    }
    // When we start up the application we need to be ensured that the user has a UserSettings record created.
    // This method calls an end point that ensures the userSettings record is created or it creates the record.
    function getUserSettingsAtInitialization() {
      var defer = $q.defer();
      var promise = defer.promise;
      if (userSettings === null) {
        $http
          .get(idmConfig.practicesApimUrl + '/api/v1/usersettings/getorcreate')
          .then(
            function (res) {
              userSettings = res.data;
              promise = $.extend(promise, {
                values: res.data,
              });
              defer.resolve(res);
            },
            function () {
              toastrFactory.error(
                localize.getLocalizedString(
                  'Failed to retrieve UserSetting or Create UserSetting.'
                ),
                localize.getLocalizedString('Server Error')
              );
              defer.reject();
            }
          );
      } else {
        // pull from the saved value
        promise = $.extend(promise, {
          values: userSettings,
        });
        defer.resolve(userSettings);
      }

      return promise;
    }

    function getUserSettings() {
      var defer = $q.defer();
      var promise = defer.promise;
      if (userSettings === null) {
        $http.get(idmConfig.practicesApimUrl + '/api/v1/usersettings').then(
          function (res) {
            userSettings = res.data;
            promise = $.extend(promise, {
              values: res.data,
            });
            defer.resolve(res);
          },
          function () {
            defer.reject();
          }
        );
      } else {
        // pull from the saved value
        promise = $.extend(promise, {
          values: userSettings,
        });
        defer.resolve(userSettings);
      }

      return promise;
    }

    function saveScheduleUserSettings(settings) {
      var defer = $q.defer();
      var promise = defer.promise;

      $http.post('_soarapi_' + '/users/setting', settings).then(
        function (res) {
          userSettings = res.data.Value;
          promise = $.extend(promise, {
            values: res.data.Value,
          });
          defer.resolve(res);
        },
        function () {
          defer.reject();
        }
      );

      return promise;
    }

    function updateScheduleUserSettings(settings) {
      var defer = $q.defer();
      var promise = defer.promise;

      $http.put('_soarapi_' + '/users/setting', settings).then(
        function (res) {
          userSettings = res.data.Value;
          promise = $.extend(promise, {
            values: res.data.Value,
          });
          defer.resolve(res);
        },
        function () {
          defer.reject();
        }
      );

      return promise;
    }

    return service;
  },
]);
