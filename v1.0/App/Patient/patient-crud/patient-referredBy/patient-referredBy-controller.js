'use strict';

angular
  .module('Soar.Patient')
  .controller('PatientReferredByController', [
    '$scope',
    '$routeParams',
    '$filter',
    '$location',
    'localize',
    '$timeout',
    'toastrFactory',
    'PatientServices',
    'ReferralSourcesService',
    'StaticData',
    'ListHelper',
    'GlobalSearchFactory',
    PatientReferredByController,
  ]);
function PatientReferredByController(
  $scope,
  $routeParams,
  $filter,
  $location,
  localize,
  $timeout,
  toastrFactory,
  patientServices,
  referralSourcesService,
  staticData,
  listHelper,
  globalSearchFactory
) {
  BaseCtrl.call(this, $scope, 'PatientReferredByController');
  var ctrl = this;
  //#region type ahead search
  // scope vars
  ctrl.initializeSearch = function () {
    $scope.disablePerson = false;
    $scope.searchLabel = 'Find a Person';
    // initial take amount
    $scope.takeAmount = 45;
    // initial limit (rows showing)
    $scope.limit = 15;
    $scope.limitResults = true;
    // Empty string for search
    $scope.searchTerm = '';
    //current searchString
    $scope.searchString = '';
    // Set the default search variables
    $scope.resultCount = 0;
    // to hold result list
    $scope.searchResults = [];
    // Search timeout queue
    $scope.searchTimeout = null;

    // Boolean to display search loading gif
    $scope.searchIsQueryingServer = false;
    // Boolean to include inactive patients in search (not active yet)
    $scope.includeInactivePatients = true;

    // to hold patient result list
    $scope.fullPatientList = [];
  };
  ctrl.initializeSearch();

  //#endregion

  //#region referral types

  // Gets patient referral types, constants
  $scope.patientReferralTypesData = staticData.ReferralTypes();
  $scope.patientReferralTypes = {};

  // Gets options for select element
  $scope.patientReferralTypeOptions = [];
  $scope.patientReferralTypesData.then(function () {
    angular.forEach($scope.patientReferralTypesData.values, function (value) {
      $scope.patientReferralTypeOptions.push({
        name: value.Name,
        value: value.Id,
      });
      $scope.patientReferralTypes[value.Name] = value.Id;
    });
  });

  //#endregion

  //#region validate search

  $scope.validSearch = function (searchString) {
    // if format XXX- allow search
    var validPhoneRegex = new RegExp(/^[0-9]{3}?\-$/);
    if (validPhoneRegex.test(searchString)) {
      return true;
    }

    // if format X or XX or XXX prevent search
    var phoneRegex = new RegExp(/^[0-9]{1,3}?$/);
    if (phoneRegex.test(searchString)) {
      return false;
    }

    // if format XX- or XX/ allow search
    var validDateRegex = new RegExp(/^[0-9]{1,2}?\-?$/);
    if (validDateRegex.test(searchString)) {
      return true;
    }

    // if format XX- or XX/ allow search
    var dateRegex = new RegExp(/^[0-9]{1,2}?\/?$/);
    if (dateRegex.test(searchString)) {
      return true;
    }
    return true;
  };

  //#endregion

  //#region search

  // Watch the input
  $scope.$watch('searchTerm', function (nv, ov) {
    if (nv && nv.length > 0 && nv != ov) {
      if ($scope.validSearch(nv)) {
        if ($scope.searchTimeout) {
          $timeout.cancel($scope.searchTimeout);
        }
        $scope.searchTimeout = $timeout(function () {
          $scope.activateSearch(nv);
        }, 500);
      }
    } else if (ov && ov.length > 0 && nv != ov) {
      if ($scope.validSearch(nv)) {
        if ($scope.searchTimeout) {
          $timeout.cancel($scope.searchTimeout);
        }
        $scope.searchTimeout = $timeout(function () {
          $scope.activateSearch(nv);
        }, 500);
      }
    }
  });

  // Perform the search
  $scope.search = function () {
    // Don't search if not needed!
    if (
      $scope.searchIsQueryingServer ||
      ($scope.resultCount > 0 &&
        $scope.searchResults.length == $scope.resultCount) ||
      $scope.searchString.length === 0
    ) {
      return;
    }
    // set variable to indicate status of search
    $scope.searchIsQueryingServer = true;

    var searchParams = {
      searchFor: $scope.searchString,
      skip: $scope.searchResults.length,
      take: $scope.takeAmount,
      sortBy: $scope.sortCol,
      includeInactive: $scope.includeInactive,
      //excludePatient: $scope.patient.PatientId
    };
    patientServices.Patients.search(
      searchParams,
      $scope.searchGetOnSuccess,
      $scope.searchGetOnError
    );
  };

  $scope.searchGetOnSuccess = function (res) {
    $scope.resultCount = res.Count;
    // Set the patient list
    $scope.searchResults = $scope.searchResults.concat(res.Value);
    // set variable to indicate whether any results
    $scope.noSearchResults = $scope.resultCount === 0;
    // reset  variable to indicate status of search = false
    $scope.searchIsQueryingServer = false;
  };

  $scope.searchGetOnError = function () {
    // Toastr alert to show error
    toastrFactory.error(
      localize.getLocalizedString('Please search again.'),
      localize.getLocalizedString('Server Error')
    );
    // if search fails reset all scope var
    $scope.searchIsQueryingServer = false;
    $scope.resultCount = 0;
    $scope.searchResults = [];
    $scope.noSearchResults = true;
  };

  // notify of searchstring change
  $scope.activateSearch = function (searchTerm) {
    if ($scope.searchString != searchTerm && $scope.disablePerson !== true) {
      // reset limit when search changes
      $scope.limit = 15;
      $scope.limitResults = true;
      $scope.searchString = searchTerm;
      $scope.resultCount = 0;
      $scope.searchResults = [];
      $scope.search();
    }
  };

  //#endregion

  // Determine if we are in edit or create mode
  $scope.editMode = $routeParams.patientId ? true : false;
  $scope.patientId = $routeParams.patientId ? $routeParams.patientId : null;

  $scope.tempReferral = {
    PatientReferralId: null,
    ReferredPatientId: null,
    ReferralType: null,
    ReferralSourceId: null,
    SourceDescription1: null,
    SourceDescription2: null,
  };

  $scope.referralHasBeenSet = false;
  $scope.referralType = null;

  $scope.getReferral = function () {
    patientServices.Referrals.GetReferral(
      { Id: $routeParams.patientId },
      $scope.patientReferralsGetReferralSuccess,
      $scope.patientReferralsGetReferralFailure
    );
  };

  $scope.patientReferralsGetReferralSuccess = function (res) {
    // Success
    $scope.referral = res.Value;

    // Sets the referral type so the correct radio button can be selected
    if ($scope.referral.ReferralType == $scope.patientReferralTypes.Other) {
      $scope.referralType = $scope.referral.ReferralType;
      $scope.referralHasBeenSet = true;
      $scope.selectedId = $scope.referral.ReferralSourceId;
    } else if (
      $scope.referral.ReferralType == $scope.patientReferralTypes.Person
    ) {
      $scope.referralType = $scope.referral.ReferralType;
      $scope.referralHasBeenSet = true;
    } else {
      $scope.referral.PatientReferralId = null;
      $scope.ResetReferral();
    }
  };

  $scope.patientReferralsGetReferralFailure = function () {
    // Error
    toastrFactory.error(
      localize.getLocalizedString('Patient {0}', ['referrals']) +
        ' ' +
        localize.getLocalizedString('failed to load.'),
      localize.getLocalizedString('Server Error')
    );
  };

  // get referral
  if ($scope.editMode) {
    $scope.getReferral();
  } else {
    $scope.referral = angular.copy($scope.tempReferral);
  }

  //#region get referralSourceList
  $scope.referralSources = [];
  $scope.getReferralSources = function () {
    $scope.loading = true;
    referralSourcesService.get(
      $scope.referralSourcesServiceGetSuccess,
      $scope.referralSourcesServiceGetFailure
    );
  };

  $scope.referralSourcesServiceGetSuccess = function (res) {
    $scope.loading = false;
    $scope.referralSources = res.Value;
  };

  $scope.referralSourcesServiceGetFailure = function () {
    $scope.loading = false;
    // Error
    toastrFactory.error(
      localize.getLocalizedString('Referral sources failed to load.'),
      localize.getLocalizedString('Server Error')
    );
  };

  // load referral sources when controller is instiated
  $scope.getReferralSources();

  //#endregion

  //#regions referral source

  $scope.referralSource = null;

  $scope.selectedId = null;
  $scope.$watch('selectedId', function (nv) {
    if (nv) {
      var source = angular.copy(
        listHelper.findItemByFieldValue(
          $scope.referralSources,
          'PatientReferralSourceId',
          nv
        )
      );
      $scope.selectReferralSource(source);
    }
  });

  $scope.selectReferralSource = function (selected) {
    // check if dropdown selection returns null
    if (selected) {
      $scope.referral.ReferralType = $scope.referralType;

      if ($scope.referralType == $scope.patientReferralTypes.Person) {
        $scope.searchTerm =
          selected.FirstName +
          ' ' +
          selected.LastName +
          '          ' +
          $filter('toShortDisplayDateUtc')(selected.DateOfBirth) +
          '          ' +
          $filter('tel')(selected.PhoneNumber);
        $scope.searchLabel = 'Referral Source';
        $scope.disablePerson = true;
        $scope.referral.ReferralSourceId = selected.PatientId;
        $scope.referral.SourceDescription1 = selected.FirstName;
        $scope.referral.SourceDescription2 = selected.LastName;
      } else if ($scope.referralType == $scope.patientReferralTypes.Other) {
        $scope.referral.SourceDescription1 = selected.SourceName;
        $scope.referral.SourceDescription2 = null;
        $scope.referral.ReferralSourceId = selected.PatientReferralSourceId;
      }
      $scope.validate();
      // add selected person id to 'most recent' list
      ctrl.saveMostRecent(selected.PatientId);
    } else {
      $scope.ResetReferral();
    }
    $scope.searchString = '';
    $scope.fullPatientList = [];
    $scope.referralSource = null;
  };
  //#endregion
  $scope.ResetReferral = function () {
    if (!$scope.referral.PatientReferralId) {
      $scope.referral = angular.copy($scope.tempReferral);
    } else {
      $scope.referral.ReferralType = $scope.patientReferralTypes.None;
      $scope.referral.ReferralSourceId = null;
      $scope.referral.SourceDescription1 = null;
      $scope.referral.SourceDescription2 = null;
    }

    $scope.person.Referral = null;
    ctrl.initializeSearch();
    $scope.referralSource = null;

    // Only sets to None if was a referral before
    if ($scope.referralHasBeenSet) {
      $scope.referralType = $scope.patientReferralTypes.None;
    }
    $scope.validate();
  };

  $scope.$watch('referralType', function (nv, ov) {
    if (nv != ov) {
      $scope.validate();
    }
  });

  $scope.referralTypeChanged = function () {
    $timeout($scope.ResetReferral, 0);
    $scope.hasErrors = false;
  };

  $scope.formIsValid = true;

  $scope.validate = function () {
    var viewValue = $scope.referral.ReferralSourceId;

    if (
      $scope.referralType &&
      $scope.referralType != $scope.patientReferralTypes.None &&
      !viewValue
    ) {
      $scope.valid = false;
    } else {
      $scope.valid = true;
      $scope.formIsValid = true;
    }
    ctrl.setReferral();
  };

  // clear the referred bu person
  $scope.clearPerson = function () {
    ctrl.initializeSearch();
    $scope.referral.ReferralSourceId = null;
    $scope.referral.SourceDescription1 = null;
    $scope.referral.SourceDescription2 = null;
    $scope.validate();
  };

  ctrl.setReferral = function () {
    if (
      $scope.valid == true &&
      ($scope.referral.ReferralType != null ||
        $scope.referral.ReferralSourceId != null)
    ) {
      $scope.person.Referral = $scope.referral;
    } else {
      $scope.person.Referral = null;
    }
  };

  $scope.$watch('setFocusOnInput', function (nv, ov) {
    if (nv && nv != ov) {
      $scope.hasErrors = !$scope.valid;
      $scope.setFocusOnElement();
    }
  });

  //#region set focus

  // sets the focus on the first invalid input
  $scope.setFocusOnElement = function () {
    $timeout(function () {
      angular.element('#inpReferralSource').focus();
      angular.element('#inpPatientSearch').focus();
      angular.element('personTypeAhead').focus();
    }, 0);
    return true;
  };

  //#region recents
  ctrl.saveMostRecent = function (personId) {
    globalSearchFactory.SaveMostRecentPerson(personId);
  };
  // #endregion
}

PatientReferredByController.prototype = Object.create(BaseCtrl.prototype);
