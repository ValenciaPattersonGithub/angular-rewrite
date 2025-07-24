'use strict';

angular.module('Soar.Patient').factory('PatientSummaryFactory', [
  'PatientServices',
  '$filter',
  '$location',
  '$window',
  'patSecurityService',
  'ModalFactory',
  'localize',
  'userSettingsDataService',
  'tabLauncher',
  function (
    patientServices,
    $filter,
    $location,
    $window,
    patSecurityService,
    modalFactory,
    localize,
    userSettingsDataService,
    tabLauncher
  ) {
    var factory = this;
    factory.encounterLocationIds = [];
    factory.hasAccess = {
      Create: false,
      Delete: false,
      Edit: false,
      View: false,
    };

    //soar-acct-enctr-chkout
    factory.viewAccess = function () {
      return patSecurityService.IsAuthorizedByAbbreviation(
        'soar-acct-enctr-chkout'
      );
    };

    // NOTE, currently no need for anything but view
    factory.getAccess = function () {
      if (factory.viewAccess()) {
        factory.hasAccess.View = true;
      }
      return factory.hasAccess;
    };

    // Navigate to service location when services on the checkout/encounter have different location set
    var changeCheckoutEncounterLocation = function (routeParams) {
      var queryString = '';
      var locationRoute = '';
      var encounters =
        routeParams.encounterId === null
          ? '/'
          : `/Encounter/${routeParams.encounterId}/`;
      var checkoutEditMessage = localize.getLocalizedString(
        "Your active {1} is different than this {0}’s service {1}. When you check out or edit this {0}, your active {1} will be changed to the {0}'s {1}. Do you wish to proceed?",
        ['encounter', 'location']
      );
      var checkoutAllMessage = localize.getLocalizedString(
        "Your active {1} is different than the {0}s’ service {1}. When you check out this {0}, your active {1} will be changed to the {0}s' {1}. Do you wish to proceed?",
        ['encounter', 'location']
      );

      if (factory.viewAccess) {
        //Set up route based on navigation
        if (routeParams.overrideLocation) {
          var title = localize.getLocalizedString('Change Location');
          var message =
            routeParams.encounterId === null
              ? checkoutAllMessage
              : checkoutEditMessage;
          var button1Text = localize.getLocalizedString('Yes');
          var button2Text = localize.getLocalizedString('No');

          modalFactory
            .ConfirmModal(title, message, button1Text, button2Text)
            .then(
              function () {
                queryString = `activeSubTab=0${
                  routeParams.overrideLocation === true
                    ? `&setLocation=${routeParams.location}`
                    : ''
                }`;
                let patientPath = '#/Patient/';
                locationRoute = `${patientPath}${routeParams.patientId}/Account/${routeParams.accountId}${encounters}${routeParams.route}/?${queryString}`;
                tabLauncher.launchNewTab(locationRoute);
              },
              function (err) {
                return;
              }
            );
        } else {
          let patientPath = '/Patient/';
          locationRoute = `${patientPath}${routeParams.patientId}/Account/${routeParams.accountId}${encounters}${routeParams.route}`;
          $location.url(locationRoute);
        }
      }
    };

    var canCheckoutAllEncounters = function (rows) {
      var canCheckout = true;
      //you cannot check out all encounters if:
      _.each(rows, function (row) {
        //any encounters are multi location
        if (row.EncounterServiceLocationIds.length > 1) canCheckout = false;
        //any encounter's location doesn't match the others
        if (
          row.EncounterServiceLocationIds[0] !==
          rows[0].EncounterServiceLocationIds[0]
        )
          canCheckout = false;
        //you are not authorized to checkout at any of the encounter's locations
        if (!row.$$authorizedForEditOrCheckoutAtLocation) canCheckout = false;
      });
      return canCheckout;
    };

    return {
      access: factory.getAccess(),
      changeCheckoutEncounterLocation: changeCheckoutEncounterLocation,
      canCheckoutAllEncounters: canCheckoutAllEncounters,
    };
  },
]);
