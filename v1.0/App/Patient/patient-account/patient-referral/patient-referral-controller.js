'use strict';

angular
  .module('Soar.Patient')
  .controller('PatientReferralController', [
    '$scope',
    '$routeParams',
    '$filter',
    '$location',
    'localize',
    '$timeout',
    'toastrFactory',
    'SearchFactory',
    'PatientServices',
    'ReferralSourcesService',
    'StaticData',
    'ListHelper',
    'GlobalSearchFactory',
    'userSettingsDataService',
    PatientReferralController,
  ]);

function PatientReferralController(
  $scope,
  $routeParams,
  $filter,
  $location,
  localize,
  $timeout,
  toastrFactory,
  searchFactory,
  patientServices,
  referralSourcesService,
  staticData,
  listHelper,
  globalSearchFactory,
  userSettingsDataService
) {
  BaseCtrl.call(this, $scope, 'PatientReferralController');
  $scope.showNewPatientHeader =
    userSettingsDataService.isNewNavigationEnabled();

  $scope.patientSearch = searchFactory.CreateSearch(
    patientServices.Patients.search
  );
  var ctrl = this;
  $scope.patientSearchParams = {
    searchFor: '',
    skip: 0,
    take: 45,
    sortBy: 'LastName',
    includeInactive: false,
  };

  $scope.valid = true;
  $scope.attemptedSave = false;

  $scope.$watch('editing', function (nv) {
    if (!$scope.referral) {
      $scope.getReferral();
    } else {
      $scope.valid =
        $scope.referral.ReferralType == null ||
        $scope.referral.ReferralType == 0
          ? false
          : true;
      $scope.attemptedSave = false;

      if (nv == true) {
        if (
          $scope.referral.ReferralType == $scope.patientReferralTypes.Person
        ) {
          $scope.patientSearchParams.searchFor =
            $scope.referral.SourceDescription1 +
            ' ' +
            $scope.referral.SourceDescription2;
        }
      }
    }
  });

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

  $scope.patientId = $routeParams.patientId ? $routeParams.patientId : null;

  $scope.assigningPatient = false;

  // to hold patient result list
  $scope.fullPatientList = [];

  $scope.tempReferral = {
    PatientReferralId: null,
    ReferredPatientId: null,
    ReferralType: null,
    ReferralSourceId: null,
    SourceDescription1: null,
    SourceDescription2: null,
  };

  $scope.referralHasBeenSet = false;

  // #region Get Referral

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

    if (
      !$scope.referral ||
      $scope.referral.ReferralType == $scope.patientReferralTypes.None
    ) {
      $scope.referral = angular.copy($scope.tempReferral);
    }

    if (
      $scope.referral.PatientReferralId ==
      '00000000-0000-0000-0000-000000000000'
    ) {
      $scope.referral.PatientReferralId = null;
    }

    if (
      !$scope.referral.ReferredPatientId ||
      $scope.referral.ReferredPatientId ==
        '00000000-0000-0000-0000-000000000000'
    ) {
      $scope.referral.ReferredPatientId = $routeParams.patientId;
    }
  };

  $scope.ReferralTypeChanged = function (type) {
    $scope.referral.ReferralSourceId = null;
    $scope.referral.SourceDescription1 = '';
    $scope.referral.SourceDescription2 = '';
    $scope.patientSearchParams.searchFor = '';
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

  $scope.getReferral();

  // #endregion

  // #region Get Referral Sources

  // get referralSourceList
  $scope.referralSources = [];
  $scope.getReferralSources = function () {
    referralSourcesService.get(
      $scope.referralSourcesServiceGetSuccess,
      $scope.referralSourcesServiceGetFailure
    );
  };

  $scope.referralSourcesServiceGetSuccess = function (res) {
    $scope.referralSources = res.Value;
  };

  $scope.referralSourcesServiceGetFailure = function () {
    // Error
    toastrFactory.error(
      localize.getLocalizedString('Referral sources failed to load.'),
      localize.getLocalizedString('Server Error')
    );
  };

  // load referral sources when controller is instiated
  $scope.getReferralSources();

  // #endregion

  $scope.executePatientSearch = function (scrolling) {
    if (
      $scope.patientSearchParams &&
      $scope.patientSearchParams.searchFor != ''
    ) {
      $scope.patientSearch.Execute($scope.patientSearchParams, scrolling);
    }
  };

  $scope.filterPatient = function (patient) {
    return patient.PatientId && patient.PatientId != $scope.patientId;
  };

  $scope.SelectPatient = function (patient) {
    if (patient) {
      $scope.referral.ReferralSourceId = patient.PatientId;
      $scope.referral.SourceDescription1 = patient.FirstName;
      $scope.referral.SourceDescription2 = patient.LastName;
      $scope.patientSearchParams.searchFor =
        patient.FirstName + ' ' + patient.LastName;
      $scope.patientSearch.Results = [];

      // add selected person id to 'most recent' list
      ctrl.saveMostRecent(patient.PatientId);
    }

    $scope.validate();
  };

  $scope.SelectOther = function (other) {
    var item = listHelper.findItemByFieldValue(
      $scope.referralSources,
      'PatientReferralSourceId',
      other
    );
    if (item) {
      $scope.referral.ReferralSourceId = item.PatientReferralSourceId;
      $scope.referral.SourceDescription1 = item.SourceName;
      $scope.referral.SourceDescription2 = null;
    }

    $scope.patientSearchParams.searchFor = '';

    $scope.validate();
  };

  $scope.validate = function () {
    if ($scope.referral.ReferralType && $scope.referral.ReferralType != '') {
      var referralType = parseInt($scope.referral.ReferralType);

      $scope.valid =
        referralType == $scope.patientReferralTypes.None ||
        ($scope.referral.ReferralSourceId != undefined &&
          $scope.referral.ReferralSourceId != null &&
          referralType != $scope.patientReferralTypes.None &&
          $scope.referral.ReferralSourceId != '' &&
          !(
            referralType == $scope.patientReferralTypes.Person &&
            ($scope.patientSearchParams.searchFor == null ||
              $scope.patientSearchParams.searchFor.length == 0)
          ));
    } else {
      $scope.valid = true;
    }
  };

  $scope.saveFunction = function (referral, onSuccess, onError) {
    $scope.validate();
    $scope.attemptedSave = true;

    if ($scope.valid && referral) {
      var saveFunction = referral.PatientReferralId
        ? patientServices.Referrals.UpdateReferral
        : patientServices.Referrals.save;

      saveFunction(referral, onSuccess, onError);
    } else if (onError) {
      onError();
    }
  };

  $scope.onSuccess = function (result) {
    if ($scope.valid) {
      $scope.referral = result.Value;

      if ($scope.referral.ReferralType === 0) {
        $scope.referral.PatientReferralId = null;
      }

      toastrFactory.success(
        localize.getLocalizedString('Your patient referral has been updated.'),
        localize.getLocalizedString('Success')
      );
    }
  };

  $scope.onError = function (error) {
    if ($scope.valid) {
      toastrFactory.error(
        localize.getLocalizedString(
          'There was an error updating your patient referral.'
        ),
        localize.getLocalizedString('Server Error')
      );
    }
  };

  // #region Referred Patients

  $scope.referredPatients = [];

  $scope.getReferredPatients = function () {
    if ($scope.referredPatients.length > 0) {
      $scope.referredPatients.splice(0, $scope.referredPatients.length);
    }

    patientServices.Referrals.GetReferredPatients(
      { Id: $routeParams.patientId },
      $scope.getReferredPatientsSuccess,
      $scope.getReferredPatientsFail
    );
  };

  $scope.getReferredPatientsSuccess = function (result) {
    if (result && result.Value) {
      angular.forEach(result.Value, function (value) {
        $scope.referredPatients.push(value);
      });
    }
  };

  $scope.getReferredPatientsFail = function (error) {
    toastrFactory.error('Failed to retrieve referred patients', 'Error');
  };

  $scope.getReferredPatients();

  // #endregion

  //#region recents
  ctrl.saveMostRecent = function (personId) {
    globalSearchFactory.SaveMostRecentPerson(personId);
  };
  // #endregion
}

PatientReferralController.prototype = Object.create(BaseCtrl.prototype);
