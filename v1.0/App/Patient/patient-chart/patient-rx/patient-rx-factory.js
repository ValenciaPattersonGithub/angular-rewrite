'use strict';
angular.module('Soar.Patient').factory('PatientRxFactory', [
  '$q',
  '$timeout',
  'patSecurityService',
  'locationService',
  '$injector',
  function ($q, $timeout, patSecurityService, locationService, $injector) {
    var factory = this;
    factory.medicationsObservers = [];

    factory.hasAccess = {
      CreatePatient: false,
      View: false,
    };

    //#region authentication
    factory.authCreatePatientAccess = function () {
      return patSecurityService.IsAuthorizedByAbbreviation(
        'rxapi-rx-rxpat-create'
      );
    };

    factory.authViewAccess = function () {
      return patSecurityService.IsAuthorizedByAbbreviation(
        'soar-clin-clinrx-view'
      );
    };

    factory.authAccess = function () {
      if (factory.authViewAccess()) {
        factory.hasAccess.CreatePatient = factory.authCreatePatientAccess();
        factory.hasAccess.View = true;
      }
      return factory.hasAccess;
    };

    factory.savePatient = function (rxPatient, fusePatient) {
      if (factory.authCreatePatientAccess()) {
        var defer = $q.defer();
        var promise = defer.promise;
        var rxService = $injector.get('RxService');
        rxService.saveRxPatient(rxPatient, fusePatient).then(
          function (res) {
            promise = $.extend(promise, { values: res.Value });
            defer.resolve(res);
          },
          function (res) {
            defer.reject(res);
          }
        );
        return promise;
      }
    };

    // TODO get permissions
    factory.getMedications = function (personId) {
      if (factory.authViewAccess()) {
        var defer = $q.defer();
        var promise = defer.promise;
        $timeout(function () {
          var currentLocation = locationService.getCurrentLocation();
          if (currentLocation) {
            var rxService = $injector.get('RxService');
            rxService.getRxPatientMedications(personId).then(
              function (res) {
                _.forEach(factory.medicationsObservers, function (observer) {
                  observer(res);
                });
                promise = $.extend(promise, { values: res });
                defer.resolve(res);
              },
              function (res) {
                // let the caller know that this failed
                defer.reject(res);
              }
            );
          } else {
            console.log(
              'PatientRxFactory->getMedications-> currentLocation not found'
            );
          }
        }, 5000);
        //TODO Need to figure out why we are waiting for 5000 milliseconds. ....
        return promise;
      }
    };

    //#endregion
    return {
      // access to rx
      access: function () {
        return factory.authAccess();
      },
      Save: function (rxPatient, fusePatient) {
        return factory.savePatient(rxPatient, fusePatient);
      },
      Medications: function (personId) {
        return factory.getMedications(personId);
      },
      observeMedications: function (observer) {
        factory.medicationsObservers.push(observer);
      },
    };
  },
]);
