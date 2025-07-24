'use strict';

angular.module('Soar.Patient').controller('PatientDetailsModalController', [
  '$scope',
  '$routeParams',
  '$location',
  'BoundObjectFactory',
  '$timeout',
  '$rootScope',
  'LocationServices',
  'PatientServices',
  'UserServices',
  'toastrFactory',
  'localize',
  '$anchorScroll',
  'ShareData',
  'UsersFactory',
  'ListHelper',
  'PatientMedicalHistoryAlertsFactory',
  'StaticData',
  'TimeZoneFactory',
  '$filter',
  'referenceDataService',
  'userSettingsDataService',
  'tabLauncher',
  function (
    $scope,
    $routeParams,
    $location,
    boundObjectFactory,
    $timeout,
    $rootScope,
    locationServices,
    patientServices,
    userServices,
    toastrFactory,
    localize,
    $anchorScroll,
    shareData,
    usersFactory,
    listHelper,
    patientMedicalHistoryAlertsFactory,
    staticData,
    timeZoneFactory,
    $filter,
    referenceDataService,
    userSettingsDataService,
    tabLauncher
  ) {
    var ctrl = this;
    $scope.showNewPatientHeader = userSettingsDataService.isNewNavigationEnabled();

    $scope.target = '_blank';
    $scope.patient = null;
    $scope.accountId = null;
    $scope.masterAlerts = [];
    $scope.customAlerts = [];
    $scope.phones = [];
    $scope.emailAddresses = [];
    $scope.isReferred = false;
    //List of account members
    $scope.accountMembers = [];

    //Flag used to display loading icon
    $scope.loadingAccountMembers = false;

    //var patientId = 'ce42715b-d8f9-45e9-8dbe-b252afa2246e';
    var patientId = $scope.selectedPatientId;

    //#region Patient functions
    var getPatientByIdSuccess = function (result) {
      $scope.patient = result.Value;
      $scope.address =
        $scope.patient.AddressReferrer != null
          ? $scope.patient.AddressReferrer
          : $scope.patient;

      angular.forEach($scope.patient.EmailAddresses, function (obj) {
        var email = obj.AccountEMail != null ? obj.AccountEMail : obj;
        email.ReferrerId =
          obj.AccountEmailId != null ? obj.AccountEMail.PatientId : null;
        $scope.emailAddresses.push(email);
      });

      ctrl.getAllAccountMembers(result.Value.PersonAccount.AccountId);
      $scope.selectedLocation = ctrl.lookupLocation(
        $scope.patient.PreferredLocation
      );
      $scope.selectedDentist = ctrl.lookupProvider(
        $scope.dentists,
        $scope.patient.PreferredDentist
      );
      $scope.selectedHygienist = ctrl.lookupProvider(
        $scope.hygienists,
        $scope.patient.PreferredHygienist
      );
    };

    var getPatientByIdFailed = function () {
      toastrFactory.error(
        localize.getLocalizedString(
          'Failed to retrieve the {0}. Please try again.',
          ['patient']
        ),
        'Error'
      );
    };

    ctrl.patientData = function (patientId) {
      return patientServices.Patients.get({
        Id: patientId,
      }).$promise.then(getPatientByIdSuccess, getPatientByIdFailed);
    };

    //#endregion Patient functions

    //#region Phones
    var getPatientPhonesSuccess = function (result) {
      if (result.Value && result.Value.length > 0) {
        angular.forEach(result.Value, function (obj) {
          if (obj.PhoneReferrerId !== null) {
            $scope.isReferred = true;
            obj.PhoneReferrer.ReferrerId = obj.PhoneReferrer.PatientId;
            obj.PhoneReferrer.Referrer = $filter('filter')(
              $scope.accountMembers,
              {
                PatientId: obj.PhoneReferrer.PatientId,
              }
            )[0];
            $scope.phones.push(obj.PhoneReferrer);
          } else {
            $scope.phones.push(obj);
          }
        });

        $rootScope.$broadcast('setPatientPhoneNumber', $scope.phones);
      }
    };

    var getPatientPhonesFailed = function () {
      toastrFactory.error(
        localize.getLocalizedString(
          'Failed to retrieve the {0}. Please try again.',
          ['phones']
        ),
        'Error'
      );
    };

    ctrl.patientPhones = function (patientId) {
      return patientServices.Contacts.getAllPhonesWithLinks({
        Id: patientId,
      }).$promise.then(getPatientPhonesSuccess, getPatientPhonesFailed);
    };

    //#region Phones

    ctrl.getAlerts = function () {
      patientServices.Alerts.get(
        { Id: $scope.selectedPatientId },
        ctrl.patientAlertsServiceGetSuccess,
        ctrl.patientAlertsServiceGetFailure
      );
    };

    //Fill master and custom array
    ctrl.patientAlertsServiceGetSuccess = function (res) {
      $scope.masterAlerts = _.filter(res.Value, function (alert) {
        return alert.MasterAlertId;
      });
      $scope.customAlerts = _.filter(res.Value, function (alert) {
        return !alert.MasterAlertId;
      });
    };

    //Clear master and custom array
    ctrl.patientAlertsServiceGetFailure = function () {
      $scope.masterAlerts = [];
      $scope.customAlerts = [];
      toastrFactory.error(
        localize.getLocalizedString(
          'Failed to retrieve the list of {0}. Refresh the page to try again.',
          ['Alerts']
        ),
        'Server Error'
      );
    };

    if (patientId != null) {
      ctrl.getAlerts();
    }

    // lookups
    ctrl.lookupLocation = function (locationId) {
      return listHelper.findItemByFieldValue(
        $scope.locations,
        'LocationId',
        locationId
      );
    };

    ctrl.lookupProvider = function (array, providerId) {
      return listHelper.findItemByFieldValue(array, 'ProviderId', providerId);
    };

    /**
     * get locations.
     *
     * @returns {angular.IPromise}
     */
    ctrl.getLocations = function () {
      ctrl.loadingLocations = true;
      return referenceDataService
        .getData(referenceDataService.entityNames.locations)
        .then(function (locations) {
          ctrl.locationServicesGetOnSuccess({ Value: locations });
          return locations;
        });
    };

    //#region Preferences functions

    //#region locations get

    ctrl.locationServicesGetOnSuccess = function (res) {
      ctrl.loadingLocations = false;
      $scope.locations = res.Value;
      angular.forEach($scope.locations, function (location) {
        if (location.Timezone)
          location.tzInfo = timeZoneFactory.GetTimeZoneInfo(location.Timezone);
      });
      //$scope.selectedLocation = ctrl.lookupLocation($scope.preferences.PreferredLocation);

      if ($scope.selectedLocation == null) {
        $scope.selectLocation = true;
      }

      $scope.doneLoading = ctrl.isDoneLoading();
    };

    //#endregion

    // gets all the providers
    ctrl.getProviders = function () {
      ctrl.loadingProviders = true;
      usersFactory
        .Users()
        .then(ctrl.userServicesGetOnSuccess, ctrl.userServicesGetOnError);
    };

    ctrl.filterProviders = function (providers) {
      $scope.dentists = [];
      $scope.hygienists = [];

      providers.filter(function (filterValue) {
        var pd = filterValue.ProfessionalDesignation
          ? ', ' + filterValue.ProfessionalDesignation
          : '';

        // Provider is Dentist
        if (
          (filterValue.ProviderTypeId == 1 ||
            filterValue.ProviderTypeId == 5) &&
          filterValue.IsActive
        ) {
          $scope.dentists.push({
            Name: filterValue.FirstName + ' ' + filterValue.LastName + pd,
            ProviderId: filterValue.UserId,
          });
        }
        // Provider is Hygienist
        if (
          (filterValue.ProviderTypeId < 4 || filterValue.ProviderTypeId == 5) &&
          filterValue.IsActive &&
          filterValue.ProviderTypeId != null
        ) {
          $scope.hygienists.push({
            Name: filterValue.FirstName + ' ' + filterValue.LastName + pd,
            ProviderId: filterValue.UserId,
          });
        }
      });
    };

    //Success callback to receive providers from server
    ctrl.userServicesGetOnSuccess = function (successResponse) {
      ctrl.loadingProviders = false;

      ctrl.filterProviders(successResponse.Value);

      if ($scope.patient != null) {
        $scope.selectedDentist = ctrl.lookupProvider(
          $scope.dentists,
          $scope.patient.PreferredDentist
        );
        $scope.selectedHygienist = ctrl.lookupProvider(
          $scope.hygienists,
          $scope.patient.PreferredHygienist
        );
      }
      $scope.doneLoading = ctrl.isDoneLoading();
    };

    //Error callback to handle error from server
    ctrl.userServicesGetOnError = function () {
      ctrl.loadingProviders = false;
      $scope.providers = [];

      $scope.doneLoading = ctrl.isDoneLoading();

      toastrFactory.error(
        localize.getLocalizedString(
          'Failed to retrieve the list of {0}. Refresh the page to try again.',
          ['providers']
        ),
        localize.getLocalizedString('Error')
      );
    };

    ctrl.isDoneLoading = function () {
      return !ctrl.loadingProviders && !ctrl.loadingLocations;
    };

    $scope.doneLoading = false;

    ctrl.getProviders();
    ctrl.getLocations();

    //#endregion Preferences functions

    //#region templates
    $scope.locationValueTemplate =
      '<div id="locationValueTemplate" type="text/x-kendo-template">' +
      '<span id="lblSelectedName" class="value-template-input k-state-default">#: NameLine1 #</span>' +
      '</div>';

    $scope.dentistValueTemplate =
      '<div id="dentistValueTemplate" type="text/x-kendo-template">' +
      '<span id="lblDentistSelectedName" class="value-template-input k-state-default">#: Name #</span>' +
      '</div>';

    $scope.hygienistValueTemplate =
      '<div id="hygienistValueTemplate" type="text/x-kendo-template">' +
      '<span id="lblHygienistSelectedName" class="value-template-input k-state-default">#: Name #</span>' +
      '</div>';

    //#endregion
    //Success handler to get all account members
    ctrl.getAllAccountMembersSuccess = function (successResponse) {
      $scope.accountMembers = successResponse.Value;
      ctrl.patientPhones($scope.patient.PatientId);

      //To hide loading icon set loadingAccountMembers flag to false
      $scope.loadingAccountMembers = false;

      //Referrers
      if ($scope.patient.AddressReferrerId) {
        $scope.isReferred = true;
        $scope.addressReferrer = $filter('filter')($scope.accountMembers, {
          PatientId: $scope.patient.AddressReferrerId,
        })[0];
      }
      angular.forEach($scope.emailAddresses, function (obj) {
        if (obj.ReferrerId) {
          $scope.isReferred = true;
          obj.Referrer = $filter('filter')($scope.accountMembers, {
            PatientId: obj.ReferrerId,
          })[0];
        }
      });
    };

    //Error handler to get all account members
    ctrl.getAllAccountMembersFailure = function () {
      $scope.accountMembers = [];

      //To hide loading icon set loadingAccountMembers flag to false
      $scope.loadingAccountMembers = false;

      //Display error message
      toastrFactory.error(
        localize.getLocalizedString('An error has occurred while {0}', [
          'getting all account members.',
        ]),
        localize.getLocalizedString('Error')
      );

      ctrl.patientPhones($scope.patient.PatientId);
    };

    //Call service to get details of all account members for specified account id
    ctrl.getAllAccountMembers = function (accountId) {
      //To display loading icon set loadingAccountMembers flag to true
      $scope.loadingAccountMembers = true;

      //Get all account members using patient service
      if (shareData.AllAccountMembers) {
        ctrl.getAllAccountMembersSuccess({
          Value: shareData.AllAccountMembers,
        });
      } else {
        //Get all account members using patient service
        patientServices.Account.getAllAccountMembersByAccountId(
          {
            accountId: accountId,
          },
          ctrl.getAllAccountMembersSuccess,
          ctrl.getAllAccountMembersFailure
        );
      }
    };

    if (patientId != null) {
      ctrl.patientData(patientId);
    }

    $scope.patientMedicalHistoryAlerts = [];
    ctrl.getMedicalHistoryAlerts = function () {
      patientMedicalHistoryAlertsFactory
        .PatientMedicalHistoryAlerts($scope.selectedPatientId)
        .then(function (res) {
          $scope.patientMedicalHistoryAlerts = res.Value;
        });
    };

    if (patientId != null) {
      ctrl.getMedicalHistoryAlerts();
    }

    // getting the font awesome icon class based on id
    ctrl.symbolList = staticData.AlertIcons();

    //Get Font awesome class name from id
    $scope.getClass = function (id) {
      return 'fa ' + ctrl.symbolList.getClassById(id);
    };
    $scope.navigate = function (url) {
      tabLauncher.launchNewTab('/v1.0/index.html' + _.escape(url));
    };
  },
]);
