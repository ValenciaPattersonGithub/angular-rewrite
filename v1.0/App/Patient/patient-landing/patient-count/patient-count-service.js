'use strict';

angular.module('Soar.Patient').service('PatientCountService', [
  '$resource',
  'PatCacheFactory',
  function ($resource, cacheFactory) {
    var count = $resource(
      '_soarapi_/patients/count/:locationId',
      {},
      {
        get: { method: 'GET' },
      }
    );

    return {
      Count: count,
    };
  },
]);
