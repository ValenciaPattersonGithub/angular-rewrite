'use strict';
angular.module('Soar.Schedule').factory('ProviderOnClaimsFactory', [
  function () {
    var factory = this;

    factory.setProviderOnClaimsForService = function (
      serviceTransaction,
      providers
    ) {
      if (serviceTransaction.ProviderUserId && providers.length > 0) {
        var serviceProvider = _.find(providers, function (provider) {
          return provider.UserId === serviceTransaction.ProviderUserId;
        });
        // if the provider on this service transaction has ProviderOnClaimsRelationship of Other and has a ProviderOnClaimsId, set to ProviderOnClaimsId
        // otherwise set to provider
        if (serviceProvider) {
          //var location = serviceProvider.Locations.length > 0 ? serviceProvider.Locations.find()

          var location = _.find(
            serviceProvider.Locations,
            function (locationSetup) {
              return locationSetup.LocationId == serviceTransaction.LocationId;
            }
          );

          serviceTransaction.ProviderOnClaimsId =
            location &&
            location.ProviderOnClaimsRelationship === 2 &&
            location.ProviderOnClaimsId
              ? location.ProviderOnClaimsId
              : serviceProvider.UserId;
        }
      }
    };

    return {
      setProviderOnClaimsForService: function (service, providers) {
        return factory.setProviderOnClaimsForService(service, providers);
      },
    };
  },
]);
