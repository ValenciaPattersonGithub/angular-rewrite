// This is a stop gap for me not wanting to spend time right now migrating HTTP calls to Angular 8
// The likely life of this service will be short.
(function () {
  'use strict';

  angular
    .module('Soar.Schedule')
    .factory('PracticesApiService', practicesApiService);
  practicesApiService.$inject = [
    '$http',
    '$q',
    'IdmConfig',
    'toastrFactory',
    'localize',
    'configSettingsService',
    'CommonServices',
  ];

  function practicesApiService(
    $http,
    $q,
    idmConfig,
    toastrFactory,
    localize,
    configSettingsService,
    commonServices,
  ) {
    // this is just a temporary thing for converted APIs and the old methods that we used to utilize before converting.
    var service = {
      getLocationsById: getLocationsById,
      getLocationsWithDetails: getLocationsWithDetails,
      getPracticeSetting: getPracticeSetting,
      getHolidays: getHolidays,
      getRoomById: getRoomById,
      getRoomsByPracticeId: getRoomsByPracticeId,
      getRoomsByLocationId: getRoomsByLocationId,
    };

    return service;

    function getLocationsById(id) {
      var defer = $q.defer();
      var promise = defer.promise;

      $http
        .get(idmConfig.practicesApimUrl + '/api/v1/locations/by-id/' + id)
        .then(
          function (res) {
            promise = $.extend(promise, {
              values: res.data,
            });
            defer.resolve(res);
          },
          function () {
            toastrFactory.error(
              localize.getLocalizedString(
                'Failed to retrieve Location By Id. Refresh the page to try again'
              ),
              localize.getLocalizedString('Server Error')
            );
            defer.reject();
          }
        );

      return promise;
    }

    function getLocationsWithDetails(action) {
      var defer = $q.defer();
      var promise = defer.promise;

      if (configSettingsService.settingsLoaded != true) {
        configSettingsService.loadSettings().then(() => {
          $http
          .get(idmConfig.practicesApimUrl + '/api/v1/locations/detailed/' + action)
          .then(
            function (res) {
              promise = $.extend(promise, {
                values: res.data,
              });

              defer.resolve(res);
            },
            function () {
              toastrFactory.error(
                localize.getLocalizedString(
                  'Failed to retrieve Detailed Locations. Refresh the page to try again'
                ),
                localize.getLocalizedString('Server Error')
              );
              defer.reject();
            }
          );
        })
      }
      else {
        $http
        .get(idmConfig.practicesApimUrl + '/api/v1/locations/detailed/' + action)
        .then(
          function (res) {
            promise = $.extend(promise, {
              values: res.data,
            });

            defer.resolve(res);
          },
          function () {
            toastrFactory.error(
              localize.getLocalizedString(
                'Failed to retrieve Detailed Locations. Refresh the page to try again'
              ),
              localize.getLocalizedString('Server Error')
            );
            defer.reject();
          }
        );
      }
      
      return promise;
    }

    function getPracticeSetting() {
      var defer = $q.defer();
      var promise = defer.promise;

      if (configSettingsService.settingsLoaded != true) {
        configSettingsService.loadSettings().then(() => {
          commonServices.PracticeSettings.Operations.Retrieve().$promise.then(
            function (res) {
              defer.resolve({data: res});
            },
            function () {
              toastrFactory.error(
                localize.getLocalizedString(
                  'Failed to retrieve PracticeSetting. Refresh the page to try again'
                ),
                localize.getLocalizedString('Server Error')
              );
              defer.reject();
            }
          );  
        })
      }
      else {
        commonServices.PracticeSettings.Operations.Retrieve().$promise.then(
          function (res) {
            defer.resolve({data: res});
          },
          function () {
            toastrFactory.error(
              localize.getLocalizedString(
                'Failed to retrieve PracticeSetting. Refresh the page to try again'
              ),
              localize.getLocalizedString('Server Error')
            );
            defer.reject();
          }
        );  
      }    

      return promise;
    }

    function getHolidays() {
      var defer = $q.defer();
      var promise = defer.promise;

      if (configSettingsService.settingsLoaded != true) {
        configSettingsService.loadSettings().then(() => {
          commonServices.Holidays.Operations.Retrieve().$promise.then(
            function (res) {
              defer.resolve({data: res});
            },
            function () {
              toastrFactory.error(
                localize.getLocalizedString(
                  'Failed to retrieve Holidays. Refresh the page to try again'
                ),
                localize.getLocalizedString('Server Error')
              );
              defer.reject();
            }
          );  
        })
      }
      else {
        commonServices.Holidays.Operations.Retrieve().$promise.then(
          function (res) {
            defer.resolve({data: res});
          },
          function () {
            toastrFactory.error(
              localize.getLocalizedString(
                'Failed to retrieve Holidays. Refresh the page to try again'
              ),
              localize.getLocalizedString('Server Error')
            );
            defer.reject();
          }
        );  
      }    

      return promise;
    }

    function getRoomById(id) {
      var defer = $q.defer();
      var promise = defer.promise;

      $http.get(idmConfig.practicesApimUrl + '/api/v1/rooms/by-id/' + id).then(
        function (res) {
          promise = $.extend(promise, {
            values: res.data,
          });
          defer.resolve(res);
        },
        function () {
          toastrFactory.error(
            localize.getLocalizedString(
              'Failed to retrieve Room By RoomId. Refresh the page to try again'
            ),
            localize.getLocalizedString('Server Error')
          );
          defer.reject();
        }
      );

      return promise;
    }

    function getRoomsByPracticeId() {
      var defer = $q.defer();
      var promise = defer.promise;

      $http
        .get(idmConfig.practicesApimUrl + '/api/v1/rooms/by-practice-id')
        .then(
          function (res) {
            promise = $.extend(promise, {
              values: res.data,
            });
            defer.resolve(res);
          },
          function () {
            toastrFactory.error(
              localize.getLocalizedString(
                'Failed to retrieve Rooms By PracticeId. Refresh the page to try again'
              ),
              localize.getLocalizedString('Server Error')
            );
            defer.reject();
          }
        );

      return promise;
    }

    function getRoomsByLocationId(id) {
      var defer = $q.defer();
      var promise = defer.promise;

      $http
        .get(idmConfig.practicesApimUrl + '/api/v1/rooms/by-location-id/' + id)
        .then(
          function (res) {
            promise = $.extend(promise, {
              values: res.data,
            });
            defer.resolve(res);
          },
          function () {
            toastrFactory.error(
              localize.getLocalizedString(
                'Failed to retrieve Rooms By LocationId. Refresh the page to try again'
              ),
              localize.getLocalizedString('Server Error')
            );
            defer.reject();
          }
        );

      return promise;
    }
  }
})();
