(function () {
  'use strict';

  angular
    .module('common.controllers')
    .controller(
      'providerSelectorForServicesOnAppointmentController',
      providerSelectorForServicesOnAppointmentController
    );
  providerSelectorForServicesOnAppointmentController.$inject = [
    '$scope',
    '$timeout',
    '$filter',
    'localize',
    'referenceDataService',
    'AppointmentServiceProcessingRulesService',
  ];

  function providerSelectorForServicesOnAppointmentController(
    $scope,
    $timeout,
    $filter,
    localize,
    referenceDataService,
    appointmentServiceProcessingRulesService
  ) {
    BaseCtrl.call(
      this,
      $scope,
      'providerSelectorForServicesOnAppointmentController'
    );

    var ctrl = this;

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

    ctrl.showOnSchedulePromise = null;
    ctrl.showOnScheduleExceptions = null;
    //#endregion

    ctrl.init = function () {
      ctrl.loadProviders();
    };

    // modify providerDropdownTemplate to show inactive users in gray italics
    $scope.providerDropdownTemplate =
      '<div id="providerDropdownTemplate" type="text/x-kendo-template">' +
      '<span id="lblSelectedName" class="value-template-input k-state-default" ' +
      "ng-style=\"{'color': dataItem.IsActive ? 'black' : 'lightgrey', 'font-style': dataItem.IsActive ? 'normal' : 'italic','font-weight': dataItem.IsPreferred ? 'bold' : 'normal','display': 'block','width': '100%' }\">#: Name #</span>" +
      '</div>';

    // loads and filters the provider list by either a passed location id or currentLocation.id
    ctrl.loadProviders = function () {
      ctrl.allProvidersList = [];
      $scope.providers = [];

      // get full provider objects.
      ctrl.allProvidersList = referenceDataService.get(
        referenceDataService.entityNames.users
      );

      ctrl.allProvidersList =
        appointmentServiceProcessingRulesService.formatProviderPropertiesForServices(
          ctrl.allProvidersList
        );

      // get provider ids from attribute
      let filterByProviders = $scope.appointmentProviders;

      // get only items that are in both lists.
      let filteredProviderList =
        appointmentServiceProcessingRulesService.filterProvidersForServicesWithAppointments(
          ctrl.allProvidersList,
          filterByProviders
        );

      $scope.providers = filteredProviderList;
    };

    ctrl.init();
  }
  providerSelectorForServicesOnAppointmentController.prototype =
    Object.create(BaseCtrl);
})();
