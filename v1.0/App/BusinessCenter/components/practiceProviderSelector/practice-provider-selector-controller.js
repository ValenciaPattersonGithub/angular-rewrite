(function () {
  'use strict';

  angular
    .module('common.controllers')
    .controller(
      'PracticeProviderSelectorController',
      PracticeProviderSelectorController
    );
  PracticeProviderSelectorController.$inject = [
    '$scope',
    '$timeout',
    'localize',
    'referenceDataService',
  ];

  function PracticeProviderSelectorController(
    $scope,
    $timeout,
    localize,
    referenceDataService
  ) {
    BaseCtrl.call(this, $scope, 'PracticeProviderSelectorController');

    var ctrl = this;
    $scope.providersLoaded = false;

    // dynamic or default placeholder
    $scope.placeHolder = $scope.placeHolder ? $scope.placeHolder : 'Providers';
    // dynamic required
    $scope.isRequired =
      $scope.required === true ? $scope.required : 'undefined';

    //#region vars
    // holds all providers
    ctrl.allProvidersList = [];
    // list of filtered providers per requirements
    $scope.filteredProviderList = [];
    $scope.providers = [];

    $scope.noProviderInfo = localize.getLocalizedString(
      'No {0} have been setup for this practice.',
      ['providers']
    );
    $scope.selectedProviderInactiveInfo = localize.getLocalizedString(
      'Selected {0} is inactive.',
      ['provider']
    );
    //#endregion

    ctrl.init = function () {
      ctrl.loadProviders();
      $scope.providersLoaded = true;
    };

    $scope.providerDropdownTemplate =
      '<div id="providerDropdownTemplate" type="text/x-kendo-template">' +
      "<span id=\"lblSelectedName\" class=\"value-template-input k-state-default\" ng-style=\"{'font-weight': dataItem.IsPreferred ? 'bold' : 'normal','display': 'block','width': '100%' }\">#: Name #</span>" +
      '</div>';

    ctrl.addDynamicColumnsToProviders = function (allProvidersList) {
      _.forEach(allProvidersList, function (provider) {
        // dynamic values for list (if not set by getProvidersInPreferredOrderFilter)
        provider.Name =
          provider.FirstName +
          ' ' +
          provider.LastName +
          (provider.ProfessionalDesignation
            ? ', ' + provider.ProfessionalDesignation
            : '');
        provider.FullName = provider.FirstName + ' ' + provider.LastName;
        provider.ProviderId =
          provider.ProviderId > '' ? provider.ProviderId : provider.UserId;
      });
    };

    // loads and filters the provider list
    ctrl.loadProviders = function () {
      ctrl.allProvidersList = [];
      $scope.providers = [];

      ctrl.allProvidersList = referenceDataService.get(
        referenceDataService.entityNames.users
      );

      ctrl.addDynamicColumnsToProviders(ctrl.allProvidersList);

      var filteredProviderList = ctrl.filterProviderList(ctrl.allProvidersList);

      $scope.providers = _.cloneDeep(filteredProviderList);
    };

    ctrl.filterByProviderOnClaimsOnly = function (providerList) {
      var filteredProviderList = [];
      if ($scope.providerOnClaimsOnly === true) {
        _.forEach(providerList, function (provider) {
          // if provider has ProviderOnClaimsRelationShip set to Self (1) then they should show in list
          var isProviderOnClaims = _.some(provider.Locations, [
            'ProviderOnClaimsRelationship',
            1,
          ]);
          if (isProviderOnClaims === true) {
            filteredProviderList.push(provider);
          }
        });
        return filteredProviderList;
      } else {
        return providerList;
      }
    };

    // filter based on onlyActive property
    ctrl.filterProviderListForOnlyActive = function (providerList) {
      // if selectedProvider is not in list, add it to filtered list for display (may have been deactivated after service transaction created)
      return $scope.onlyActive === true
        ? _.cloneDeep(providerList).filter(function (provider) {
            return (
              provider.IsActive === true ||
              provider.UserId === $scope.selectedProvider
            );
          })
        : providerList;
    };

    ctrl.filterProviderList = function (allProvidersList) {
      var filteredProviderList = [];
      // filter list for onlyActive
      filteredProviderList =
        ctrl.filterProviderListForOnlyActive(allProvidersList);
      // filter for providerOnClaims only
      filteredProviderList =
        ctrl.filterByProviderOnClaimsOnly(filteredProviderList);
      return filteredProviderList;
    };
    ctrl.init();
  }
  PracticeProviderSelectorController.prototype = Object.create(BaseCtrl);
})();
