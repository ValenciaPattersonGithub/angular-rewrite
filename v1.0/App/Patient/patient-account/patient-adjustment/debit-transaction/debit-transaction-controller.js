'use strict';
angular.module('Soar.Patient').controller('DebitTransactionController', [
  '$scope',
  '$filter',
  'toastrFactory',
  'ListHelper',
  'localize',
  'TimeZoneFactory',
  'referenceDataService',
  'StaticData',
  'FeatureFlagService',
  'FuseFlag',
  function (
    $scope,
    $filter,
    toastrFactory,
    listHelper,
    localize,
    timeZoneFactory,
    referenceDataService,
    staticData,
    featureFlagService,
    fuseFlag,
    
  ) {
    //#region Member Variables And Default Initialization

    var ctrl = this;

    ctrl.patientInfo = $scope.data.PatientInfo;
    ctrl.now = moment();

    ctrl.preferredName = ctrl.patientInfo.PreferredName
      ? '(' + ctrl.patientInfo.PreferredName + ')'
      : '';
    ctrl.middleName = ctrl.patientInfo.MiddleName
      ? ctrl.patientInfo.MiddleName.charAt(0) + '.'
      : '';
    $scope.nameForPositiveAdjustmentWindow =
      [ctrl.patientInfo.FirstName, ctrl.preferredName, ctrl.middleName]
        .filter(function (text) {
          return text;
        })
        .join(' ') +
      '  ' +
      [ctrl.patientInfo.LastName, ctrl.patientInfo.Suffix]
        .filter(function (text) {
          return text;
        })
        .join(', ');

    $scope.providers = [];
    $scope.PaymentProviders = staticData.PaymentProviders();
    $scope.cardReaders = [];
    $scope.selectedCardReader = null;
    $scope.positiveAdjustmentTypes = $scope.data.AdjustmentTypes.filter(function (adjustmentType) {
      return (
        adjustmentType.Description.toLowerCase().indexOf('vendor payment refund') === -1
      );
    });
    $scope.debitTransactionDto = $scope.data.DebitTransactionDto;
    $scope.errorFlags = $scope.data.ErrorFlags;
    $scope.currencyTypes = [
      { Description: 'CREDIT', CurrencyTypeId: 1 },
      { Description: 'DEBIT', CurrencyTypeId: 2 },
    ];
    $scope.defaultPlaceHolder = localize.getLocalizedString(
      'Leave as Unassigned'
    );
    // this variable holds the preferred dentist, hygienist, active providers and inactive providers other than "Not a Provider" type
    ctrl.providersOtherThanNotAProvider = [];

    // This template helps to show inactive providers in gray color and preferred providers in bold text
    $scope.providerDropdownTemplate =
      '<div id="providerDropdownTemplate" type="text/x-kendo-template">' +
      "<span id=\"lblSelectedName\" class=\"value-template-input k-state-default\" ng-style=\"{'color': dataItem.IsActive ? 'black' : 'gray', 'font-weight': isPreferred(dataItem) ? 'bold' : 'normal','display': 'block','width': '150px' }\">#: Name #</span>" +
      '</div>';

    //#endregion

    ctrl.checkFeatureFlag = function (location) {
      featureFlagService.getOnce$(fuseFlag.UsePaymentService).subscribe((value) => {
        $scope.paymentProviderSupportsIndependentRefunds  = !value;
        $scope.data.paymentProviderSupportsIndependentRefunds = !value;
      });
    };

    //#region Providers Dropdown & Service

    // Composes a list of providers which are other than "Not a provider", in below order
    // Active preferred dentist, active preferred hygienist, active providers sorted by last name, inactive providers sorted by last name
    ctrl.processProvidersList = function (allProviders) {
      ctrl.inactiveProviders = [];
      ctrl.finalListOfProviders = [];

      // Compose a list of providers which are other than "Not a provider" type
      ctrl.providersOtherThanNotAProvider = ctrl.getProvidersOtherThanNotAProvider(
        allProviders
      );

      // Retrieve preferred dentist and hygienist for a patient searched by user
      ctrl.retrievePreferredDentistAndHygienist(allProviders);

      // Compose a list of inactive providers
      ctrl.inactiveProviders = ctrl.getListOfInactiveProviders();

      //#region Compose a final list of providers to be shown on screen
      ctrl.temporaryProviders = [];

      // If preferred dentist is active, add it to the top of the list
      if (ctrl.preferredDentist != null || ctrl.preferredDentist != undefined) {
        if (ctrl.preferredDentist.IsActive) {
          ctrl.temporaryProviders.push(ctrl.preferredDentist);
        }
      }

      // If preferred hygienist is active, add it below the active dentist in the list
      if (
        ctrl.preferredHygienist != null ||
        ctrl.preferredHygienist != undefined
      ) {
        if (ctrl.preferredHygienist.IsActive) {
          ctrl.temporaryProviders.push(ctrl.preferredHygienist);
        }
      }

      // Add sorted active providers
      ctrl.providersOtherThanNotAProvider = $filter('orderBy')(
        ctrl.providersOtherThanNotAProvider,
        'LastName'
      );
      ctrl.temporaryProviders = ctrl.temporaryProviders.concat(
        ctrl.providersOtherThanNotAProvider
      );

      // Add sorted inactive providers after active providers in the final list
      ctrl.inactiveProviders = $filter('orderBy')(
        ctrl.inactiveProviders,
        'LastName'
      );
      ctrl.temporaryProviders = ctrl.temporaryProviders.concat(
        ctrl.inactiveProviders
      );

      //#endregion

      return ctrl.temporaryProviders;
    };

    // DateEntered manipulation required by bug 433188
    // NOTE I'm doing the same process in 4 separate objects so maybe this should be
    // centralized somehow but seems outside the scope of a bug

    // Days difference from original DateEntered to current DateEntered in days if any
    ctrl.daysDifference = function (originalDate, currentDate) {
      var start = moment(originalDate);
      var end = moment(currentDate);
      var days = end.diff(start, 'days');
      return days;
    };

    ctrl.setDateEntered = function (transactionDto, displayDate) {
      // if $$DateEntered has changed we need to update it here, currently DateEntered can only be today or in the past
      var days = ctrl.daysDifference(displayDate, transactionDto.$$DateEntered);
      if (days < 0) {
        var currentDate = new Date(Date.parse(transactionDto.DateEntered));
        currentDate = moment(currentDate).add(days, 'days');
        transactionDto.DateEntered = currentDate;
      }
    };

    /**
     * Get location timezone.
     *
     * @returns {angular.IPromise}
     */
    ctrl.getLocationTimezone = function () {
      return referenceDataService
        .getData(referenceDataService.entityNames.locations)
        .then(function (locations) {
          //Getting the list of locations then filtering for the currently logged in location
          var userLocation = JSON.parse(sessionStorage.getItem('userLocation'));
          var userLocationId = parseInt(userLocation.id);
          var ofcLocation = locations.find(
            location => location.LocationId === userLocationId
          );
          ctrl.checkFeatureFlag(ofcLocation);
          var locationTimezone = ofcLocation ? ofcLocation.Timezone : '';
          return locationTimezone;
        });
    };

    // Get providers having their type as - Dentist, Hygienist, Assistant & Other
    ctrl.getProvidersOtherThanNotAProvider = function (allProviders) {
      var providersOtherThanNotAProvider = allProviders.filter(function (
        provider
      ) {
        // Provider Types - Dentist, Hygienist, Assistant & Other
        if (provider.ProviderTypeId) {
          return (
            provider.ProviderTypeId === 1 ||
            provider.ProviderTypeId === 2 ||
            provider.ProviderTypeId === 3 ||
            provider.ProviderTypeId === 5
          );
        }
        return false;
      });

      return providersOtherThanNotAProvider;
    };

    // Retrieve preferred dentist and hygienist for a patient searched by user
    ctrl.retrievePreferredDentistAndHygienist = function (allProviders) {
      if (ctrl.patientInfo.PreferredDentist) {
        // Retrieve preferred dentist from the list of providers
        ctrl.preferredDentist = listHelper.findItemByFieldValue(
          allProviders,
          'UserId',
          ctrl.patientInfo.PreferredDentist
        );

        // Remove existing preferredDentist from the providersOtherThanNotAProvider list so that it won't appear twice in the dropdown
        var dentistRemoveIndex = listHelper.findIndexByFieldValue(
          ctrl.providersOtherThanNotAProvider,
          'UserId',
          ctrl.patientInfo.PreferredDentist
        );
        if (dentistRemoveIndex !== -1)
          ctrl.providersOtherThanNotAProvider.splice(dentistRemoveIndex, 1);
      }

      if (
        ctrl.patientInfo.PreferredHygienist &&
        ctrl.patientInfo.PreferredHygienist !==
          ctrl.patientInfo.PreferredDentist
      ) {
        // Retrieve preferred hygienist from the list of providers
        ctrl.preferredHygienist = listHelper.findItemByFieldValue(
          allProviders,
          'UserId',
          ctrl.patientInfo.PreferredHygienist
        );

        // Remove existing preferredHygienist from the providersOtherThanNotAProvider list so that it won't appear twice in the dropdown
        var hygienistRemoveIndex = listHelper.findIndexByFieldValue(
          ctrl.providersOtherThanNotAProvider,
          'UserId',
          ctrl.patientInfo.PreferredHygienist
        );
        if (hygienistRemoveIndex !== -1)
          ctrl.providersOtherThanNotAProvider.splice(hygienistRemoveIndex, 1);
      }
    };

    // Get a list of inactive providers from the list of providers other than "Not a Provider" type
    // If patient has set preferred dentist and hygienist and if they are in Inactive state, they will be added at the top. Dentist at first index and then hygienist
    ctrl.getListOfInactiveProviders = function () {
      ctrl.copyOfProvidersOtherThanNotAProvider = angular.copy(
        ctrl.providersOtherThanNotAProvider
      );

      var inactiveProviders = ctrl.copyOfProvidersOtherThanNotAProvider.filter(
        function (provider) {
          // Find Inactive provider
          if (!provider.IsActive) {
            var inactiveRemoveIndex = listHelper.findIndexByFieldValue(
              ctrl.providersOtherThanNotAProvider,
              'UserId',
              provider.UserId
            );
            ctrl.providersOtherThanNotAProvider.splice(inactiveRemoveIndex, 1);
            return true;
          }

          return false;
        }
      );

      // If preferred dentist is inactive, add it at the top of list of inactive providers.
      if (ctrl.preferredDentist != null || ctrl.preferredDentist != undefined) {
        if (!ctrl.preferredDentist.IsActive) {
          inactiveProviders.push(ctrl.preferredDentist);
        }
      }

      // If preferred hygienist is inactive, add it to the list of inactive providers below inactive preferred dentist.
      if (
        ctrl.preferredHygienist != null ||
        ctrl.preferredHygienist != undefined
      ) {
        if (!ctrl.preferredHygienist.IsActive) {
          inactiveProviders.push(ctrl.preferredHygienist);
        }
      }

      return inactiveProviders;
    };

    // Find if a data item from providers dropdown list is a preferred provider for a currently searched patient
    $scope.isPreferred = function (dataItem) {
      return (
        ctrl.patientInfo &&
        (dataItem.ProviderId == ctrl.patientInfo.PreferredDentist ||
          dataItem.ProviderId == ctrl.patientInfo.PreferredHygienist)
      );
    };

    $scope.providers = ctrl.processProvidersList($scope.data.Providers);

    /**
     * Getting the list of locations then filtering for the currently logged in location.
     *
     * @returns {angular.IPromise}
     */
    ctrl.setDatesByTimeZone = function () {
      return ctrl.getLocationTimezone().then(function (locationTimezone) {
        var todaysDate = timeZoneFactory.ConvertDateToMomentTZ(
          ctrl.now,
          locationTimezone
        );
        $scope.transactionMaxDate = moment([
          todaysDate.year(),
          todaysDate.month(),
          todaysDate.date(),
          0,
          0,
          0,
          0,
        ]);
        $scope.tansactionMinDate = moment()
          .add(-100, 'years')
          .startOf('day')
          .toDate();
      });
    };

    /**
     * Filter provider.
     *
     * @returns {angular.IPromise}
     */
    ctrl.filterProviders = function () {
      ctrl.location = JSON.parse(sessionStorage.getItem('userLocation'));
      if ($scope.providers && ctrl.location) {
        $scope.filteredProviders = $filter('filter')($scope.providers, {
          Locations: { LocationId: ctrl.location.id },
        });
      }
      // reset when location changes
      return ctrl.setDatesByTimeZone();
    };
    ctrl.filterProviders();

    $scope.$on('patCore:initlocation', function () {
      ctrl.filterProviders();
    });
    //#endregion
  },
]);
