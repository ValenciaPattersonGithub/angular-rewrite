'use strict';
angular.module('Soar.Schedule').factory('ProviderRoomOccurrenceFactory', [
  'localize',
  '$q',
  'toastrFactory',
  'patSecurityService',
  '$filter',
  'StaticData',
  'ScheduleServices',
  'ListHelper',
  function (
    localize,
    $q,
    toastrFactory,
    patSecurityService,
    $filter,
    staticData,
    scheduleServices,
    listHelper
  ) {
    var factory = this;
    factory.observers = [];
    factory.templates = [];

    //TODO get correct amfa
    factory.hasAccess = {
      Create: false,
      Delete: false,
      Edit: false,
      View: false,
    };

    //#region authentication

    factory.createAccess = function () {
      return patSecurityService.IsAuthorizedByAbbreviation(
        'soar-sch-schidl-idlprv'
      );
    };

    factory.updateAccess = function () {
      return patSecurityService.IsAuthorizedByAbbreviation(
        'soar-sch-schidl-idlprv'
      );
    };

    factory.deleteAccess = function () {
      return patSecurityService.IsAuthorizedByAbbreviation(
        'soar-sch-schidl-idlprv'
      );
    };

    factory.viewAccess = function () {
      return patSecurityService.IsAuthorizedByAbbreviation(
        'soar-sch-schidl-idlprv'
      );
    };

    factory.access = function () {
      if (!factory.viewAccess()) {
      } else {
        factory.hasAccess.Create = factory.createAccess();
        factory.hasAccess.Update = factory.updateAccess();
        factory.hasAccess.Delete = factory.deleteAccess();
        factory.hasAccess.View = true;
      }
      return factory.hasAccess;
    };

    //#endregion

    //#region internal methods

    factory.getProviderRoomOccurrences = function (
      providerId,
      locationId,
      roomId,
      startTime
    ) {
      if (factory.viewAccess()) {
        var defer = $q.defer();
        var promise = defer.promise;
        var params = {
          locationDate: moment(startTime).format('YYYY-MM-DD'),
          locationId: locationId,
          providerId: providerId,
          roomId: roomId,
        };
        scheduleServices.ProviderRoomOccurrences.get(params).$promise.then(
          function (res) {
            promise = $.extend(promise, { values: res.Value });
            defer.resolve(res);
          },
          function (res) {
            if (res.status != 404) {
              toastrFactory.error(
                localize.getLocalizedString('Failed to retrieve {0}.', [
                  'provider-room assignment',
                ]),
                'Error'
              );
            }
          }
        );
        return promise;
      }
    };

    //#endregion

    return {
      access: function () {
        return factory.access();
      },
      get: function (providerId, locationId, roomId, startTime) {
        return factory.getProviderRoomOccurrences(
          providerId,
          locationId,
          roomId,
          startTime
        );
      },
    };
  },
]);
