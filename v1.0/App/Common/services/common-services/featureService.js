'use strict';

var app = angular.module('Soar.Common');

app.service('FeatureService', [
  '$http',
  '$q',
  'toastrFactory',
  'localize',
  'IdmConfig',
  'configSettingsService',
  function ($http, $q, toastrFactory, localize, idmConfig, configSettingsService) {
    var featureService = {};
    var enabledFeatures = [];
    var migrationEnabledFeatures = [];
    var migrationFeaturesLoaded = false;
      featureService.isEnabled = function (featureName, source, useDevMode=true) {
      var q = $q.defer();

      // removing a lot of unnecessary api calls if a users has already stored if a feature is active or not
      if (
        enabledFeatures !== null &&
        enabledFeatures !== [] &&
        enabledFeatures.length > 0
      ) {
        for (let x = 0; x < enabledFeatures.length; x++) {
          if (
            enabledFeatures[x].featureName !== null &&
            enabledFeatures[x].featureName === featureName
          ) {
            q.resolve(enabledFeatures[x].isEnabled);
            return q.promise;
          }
        }
      }
        var q = $q.defer();
      $http
        .get('_soarapi_/features/' + featureName, {
            params: { source: source, useDevMode: useDevMode},
        })
        .then(
          function success(response) {
            let result = _.find(enabledFeatures, function (code) {
              return _.isEqual(code.featureName, featureName);
            });
            if (result === undefined) {
              enabledFeatures.push({
                featureName: featureName,
                isEnabled: response.data.Enabled,
              });
            }
            q.resolve(response.data.Enabled);
          },
          function error(err) {
            toastrFactory.error(
              localize.getLocalizedString(
                'Failed to load feature settings for {0}.',
                [featureName]
              ),
              localize.getLocalizedString('Server Error')
            );
            q.reject(err);
          }
        );
      return q.promise;
    };

    featureService.isMigrationEnabled = function (featureName) {
      var q = $q.defer();

      // removing a lot of unnecessary api calls if a users has already stored if a feature is active or not
      if (migrationFeaturesLoaded) {
        if (
          migrationEnabledFeatures !== null &&
          migrationEnabledFeatures !== [] &&
          migrationEnabledFeatures.length > 0
        ) {
          for (let x = 0; x < migrationEnabledFeatures.length; x++) {
            if (migrationEnabledFeatures[x] === featureName) {
              q.resolve(true);
              return q.promise;
            }
          }
        }

        q.resolve(false);
        return q.promise;
      }
      var q = $q.defer();
      configSettingsService.loadSettings().then(_ => {
        $http.get(idmConfig.practicesApimUrl + '/api/v1/practicesettings/byPrefix/NgMigration').then(
          function success(response) {
            migrationEnabledFeatures = response.data.Value;
            migrationFeaturesLoaded = true;
            var isEnabled = false;
            for (let x = 0; x < migrationEnabledFeatures.length; x++) {
              if (migrationEnabledFeatures[x] === featureName) {
                isEnabled = true;
              }
            }
            q.resolve(isEnabled);
          },
          function error(err) {
            toastrFactory.error(
              localize.getLocalizedString(
                'Failed to load migration feature settings for {0}.',
                [featureName]
              ),
              localize.getLocalizedString('Server Error')
            );
            q.reject(err);
          }
        );
      });
      return q.promise;
    };


    return featureService;
  },
]);
