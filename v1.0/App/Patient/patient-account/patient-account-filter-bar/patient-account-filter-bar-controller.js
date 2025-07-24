'use strict';
var app = angular.module('Soar.Patient');
app.controller('PatientAccountFilterBarController', [
  '$scope',
  '$q',
  'referenceDataService',
  'localize',
  'PatientAccountFilterBarFactory',
  'ShareData',
  'TimeZoneFactory',
  PatientAccountFilterBarController,
]);
function PatientAccountFilterBarController(
  $scope,
  $q,
  referenceDataService,
  localize,
  patientAccountFilterBarFactory,
  shareData,
  timeZoneFactory
) {
  BaseCtrl.call(this, $scope, 'PatientAccountFilterBarController');
  var ctrl = this;
  $scope.filterCount = 0;
  $scope.filters = {
    TransactionTypes: [
      {
        Text: 'All Transaction Types',
        Selected: true,
        Id: 0,
        IsAllOption: true,
        IsDefault: true,
      },
      { Text: 'Services', Selected: true, Id: 1 },
      { Text: 'Account Payments', Selected: true, Id: 2 },
      { Text: 'Insurance Payments', Selected: true, Id: 3 },
      { Text: '- Adjustments', Selected: true, Id: 4 },
      { Text: '+ Adjustments', Selected: true, Id: 5 },
      { Text: 'Finance Charges', Selected: true, Id: 6 },
      { Text: 'Account Notes', Selected: true, Id: 7 },
      { Text: 'Documents', Selected: true, Id: 8 },
    ],
    TransactionStatus: [
      {
        Text: 'All Distribution Statuses',
        Selected: true,
        Id: 0,
        IsAllOption: true,
        IsDefault: true,
      },
      { Text: 'Paid Transactions', Selected: true, Id: 0 },
      { Text: 'Unpaid Transactions', Selected: true, Id: 0 },
      { Text: 'Unapplied Transactions', Selected: true, Id: 0 },
      { Text: 'Applied Transactions', Selected: true, Id: 0 },
    ],
    Locations: [
      {
        Id: 0,
        Text: localize.getLocalizedString('All Locations'),
        Selected: true,
        IsAllOption: true,
        IsDefault: true,
        Status: 'All',
      },
    ],
    Patients: [
      {
        Id: 0,
        Text: localize.getLocalizedString('All Account Members'),
        Selected: false,
        IsAllOption: true,
        IsDefault: false,
        Status: 'All',
      },
    ],
    Providers: [
      {
        Id: 0,
        Text: localize.getLocalizedString('All Providers'),
        Selected: true,
        IsAllOption: true,
        IsDefault: true,
      },
    ],
    Statuses: [
      { Text: 'All Statuses', Selected: false, Id: 0, IsAllOption: true },
      { Text: 'Active', Selected: true, Id: 1, IsDefault: true },
      { Text: 'Deleted', Selected: false, Id: 2 },
      { Text: 'Edited', Selected: false, Id: 3 },
      { Text: 'Offsetting Void', Selected: false, Id: 4 },
    ],
    Teeth: [],
  };

  $scope.disableApply = true;
  $scope.disableReset = true;
  $scope.filterBarDisabled = false;

  $scope.errors = {
    dateError: { hasError: false },
    locationError: { hasError: false },
    patientError: { hasError: false },
    providerError: { hasError: false },
    transactionTypeError: { hasError: false },
    statusError: { hasError: false },
  };
  ctrl.hideRunningBalance = false;

  /**
   * Initialize controller.
   *
   * @returns {angular.IPromise}
   */
  ctrl.init = function () {
    return ctrl.initializeFilters().then(function () {
      ctrl.setFilterBarProperties();

      // subscribe to filter bar status changes
      patientAccountFilterBarFactory.observeFilterBarStatus(
        ctrl.updateFilterBarStatus
      );
    });
  };

  // returns only providers from entire user list
  // if provider has a ProviderTypeId other than 4 at any location, they should appear in the filter list.
  ctrl.initializeProviderList = function (allUsers) {
    var providers = [];
    _.forEach(allUsers, function (user) {
      var isProvider = false;
      _.forEach(user.Locations, function (locationSetup) {
        if (
          locationSetup.ProviderTypeId === 1 ||
          locationSetup.ProviderTypeId === 2 ||
          locationSetup.ProviderTypeId === 3 ||
          locationSetup.ProviderTypeId === 5
        ) {
          isProvider = true;
        }
      });
      if (isProvider === true) {
        providers.push({
          Id: user.UserId,
          Text:
            user.FirstName +
            ' ' +
            user.LastName +
            (user.ProfessionalDesignation
              ? ', ' + user.ProfessionalDesignation
              : ''),
          Selected: true,
          IsAllOption: false,
        });
      }
    });
    return providers;
  };

  /**
   * Initialize filters.
   *
   * @returns {angular.IPromise}
   */
  ctrl.initializeFilters = function () {
    return $q
      .all({
        locations: referenceDataService.getData(
          referenceDataService.entityNames.locations
        ),
        providers: referenceDataService.getData(
          referenceDataService.entityNames.users
        ),
      })
      .then(function (results) {
        if (!$scope.filters) {
          return;
        }

        _.each(
          _.orderBy(results.locations, 'NameLine1', 'asc'),
          function (loc) {
            var option = {
              Id: loc.LocationId,
              Text: loc.NameLine1,
              Selected: true,
              IsAllOption: false,
            };
            if (loc.DeactivationTimeUtc) {
              var dateNow = moment().format('YYYY-MM-DD');
              var inactiveDate = moment(loc.DeactivationTimeUtc).format(
                'YYYY-MM-DD'
              );
              if (
                moment(inactiveDate).isBefore(dateNow) ||
                moment(inactiveDate).isSame(dateNow)
              ) {
                option.Status = 'Inactive';
              } else {
                option.Status = 'Pending Inactive';
              }
            } else {
              option.Status = 'Active';
            }
            $scope.filters.Locations.push(option);
          }
        );
        ctrl.setPatientFilter();
        var providerOptions = ctrl.initializeProviderList(results.providers);
        $scope.filters.Providers = _.concat(
          $scope.filters.Providers,
          _.orderBy(providerOptions, 'Text', 'asc')
        );
        ctrl.selectedFilters = _.cloneDeep($scope.filters);
        ctrl.selectedStartDate = null;
        ctrl.selectedEndDate = null;
        ctrl.setMaxDateFromLocationTZ(results.locations);
      });
  };

  //Getting the list of locations then filtering for the currently logged in location
  ctrl.setMaxDateFromLocationTZ = (locations) => {
    var cachedLocation = JSON.parse(sessionStorage.getItem('userLocation'));
    var ofcLocation = null;

    if(cachedLocation){
      ofcLocation = _.find(locations, { LocationId: cachedLocation.id });
    }
    var locationTimezone = ofcLocation ? ofcLocation.Timezone : moment.tz.guess();

    var maxDate = moment();

    maxDate = timeZoneFactory.ConvertDateToMomentTZ(maxDate, locationTimezone);
    $scope.filterMaxDate = maxDate.startOf('day').local(true);
  }

  // click events
  $scope.applyFilters = function () {
    if (ctrl.filtersAreNotValid()) {
      return;
    }
    ctrl.setFilterObjectListOptions();
    ctrl.applyChanges();
  };

  ctrl.setFilterObjectListOptions = function () {
    $scope.filterObject.transactionTypes = ctrl.getSelectedFromList(
      $scope.filters.TransactionTypes,
      null
    );
    $scope.filterObject.locations = ctrl.getSelectedFromList(
      $scope.filters.Locations,
      null
    );
    $scope.filterObject.members = ctrl.getSelectedFromList(
      $scope.filters.Patients,
      '0'
    );
    $scope.filterObject.providers = ctrl.getSelectedFromList(
      $scope.filters.Providers,
      null
    );
    $scope.filterObject.IncludeAccountNotes =
      $scope.filters.TransactionTypes[7].Selected;
    $scope.filterObject.IncludeDocuments =
      $scope.filters.TransactionTypes[8].Selected;
    $scope.filterObject.IncludePaidTransactions =
      $scope.filters.TransactionStatus[1].Selected;
    $scope.filterObject.IncludeUnpaidTransactions =
      $scope.filters.TransactionStatus[2].Selected;
    $scope.filterObject.IncludeUnappliedTransactions =
      $scope.filters.TransactionStatus[3].Selected;
    $scope.filterObject.IncludeAppliedTransactions =
      $scope.filters.TransactionStatus[4].Selected;
    $scope.filterObject.Statuses = ctrl.getSelectedFromList(
      $scope.filters.Statuses,
      null
    );
  };

  ctrl.getSelectedFromList = function (options, allValue) {
    return options[0].Selected
      ? allValue
      : _.chain(options)
          .filter(x => x.Selected)
          .map(x => x.Id)
          .value();
  };

  $scope.filterChanged = function () {
    $scope.filterCount = 0;
    if (!$scope.filters.TransactionTypes[0].Selected) $scope.filterCount++;
    if (!$scope.filters.Providers[0].Selected) $scope.filterCount++;
    if (!$scope.filters.TransactionStatus[0].Selected) $scope.filterCount++;
    var selectedStatuses = _.chain($scope.filters.Statuses)
      .filter(x => x.Selected)
      .value();
    if (selectedStatuses.length !== 1 || selectedStatuses[0].Id !== 1)
      $scope.filterCount++;
    if ($scope.filters.Teeth.length > 0) $scope.filterCount++;
    ctrl.setFilterBarProperties();
  };

  // Reset filters
  $scope.resetFilters = function () {
    // Date range options
    $scope.$broadcast('dateSelector.clear');
    $scope.filterObject.dateRange.start = null;
    $scope.filterObject.dateRange.end = null;
    _.each($scope.filters.TransactionTypes, x => {
      x.Selected = true;
    });
    _.each($scope.filters.TransactionStatus, x => {
      x.Selected = true;
    });
    _.each($scope.filters.Statuses, x => {
      x.Selected = false;
    });
    $scope.filters.Statuses[1].Selected = true;
    $scope.filters.Teeth.length = 0;
    _.each($scope.filters.Locations, x => {
      x.Selected = true;
    });
    _.each($scope.filters.Providers, x => {
      x.Selected = true;
    });
    ctrl.resetPatientFilter();
    ctrl.setFilterObjectListOptions();
    _.each($scope.errors, function (err) {
      err.hasError = false;
    });
    $scope.filterChanged();

    ctrl.applyChanges();
  };

  ctrl.applyChanges = function () {
    //Store selected settings
    ctrl.selectedFilters = _.cloneDeep($scope.filters);
    ctrl.selectedStartDate = $scope.filterObject.dateRange.start;
    ctrl.selectedEndDate = $scope.filterObject.dateRange.end;
    $scope.filterObject.Teeth = $scope.filters.Teeth;
    $scope.applyChangesFunction();
    ctrl.setFilterBarProperties();
    $scope.showMoreFilters = false;
    $scope.hideRunningBalance = ctrl.hideRunningBalance; //scope.hideRunningBalance used to turn on page filtered settings
  };

  // Date filter functions
  ctrl.filterDatesAreValid = function () {
    $scope.errors.dateError.hasError =
    !_.isNil($scope.filterObject.dateRange.start) &&
    !_.isNil($scope.filterObject.dateRange.end) &&
    $scope.filterObject.dateRange.end < $scope.filterObject.dateRange.start;
    ctrl.setFilterBarProperties();
  };

  $scope.listFilterIsValid = function (listTitle) {
    switch (listTitle) {
      case 'Location':
        $scope.errors.locationError.hasError = !_.some(
          $scope.filters.Locations,
          'Selected'
        );
        break;
      case 'Patient':
        $scope.errors.patientError.hasError = !_.some(
          $scope.filters.Patients,
          'Selected'
        );
        break;
      case 'Provider':
        $scope.errors.providerError.hasError = !_.some(
          $scope.filters.Providers,
          'Selected'
        );
        $scope.filterChanged();
        break;
      case 'TransactionTypes':
        $scope.errors.transactionTypeError.hasError = !_.some(
          $scope.filters.TransactionTypes,
          'Selected'
        );
        $scope.filterChanged();
        break;
      case 'TransactionStatus':
        $scope.errors.statusError.hasError = !_.some(
          $scope.filters.Statuses,
          'Selected'
        );
        $scope.filterChanged();
        break;
    }
    ctrl.setFilterBarProperties();
  };

  ctrl.filtersAreNotValid = function () {
    return _.some($scope.errors, 'hasError');
  };

  ctrl.setFilterBarProperties = function () {
    if (!$scope.filterObject) {
      return;
    }

    var areAppliedFiltersSelected =
      _.isEqual(ctrl.selectedStartDate, $scope.filterObject.dateRange.start) &&
      _.isEqual(ctrl.selectedEndDate, $scope.filterObject.dateRange.end) &&
      _.isEqual(
        $scope.filters.TransactionTypes,
        ctrl.selectedFilters.TransactionTypes
      ) &&
      _.isEqual(
        $scope.filters.TransactionStatus,
        ctrl.selectedFilters.TransactionStatus
      ) &&
      _.isEqual($scope.filters.Locations, ctrl.selectedFilters.Locations) &&
      _.isEqual($scope.filters.Patients, ctrl.selectedFilters.Patients) &&
      _.isEqual($scope.filters.Providers, ctrl.selectedFilters.Providers) &&
      _.isEqual($scope.filters.Statuses, ctrl.selectedFilters.Statuses) &&
      _.isEqual($scope.filters.Teeth, ctrl.selectedFilters.Teeth);

    var balanceTranTypesSelected =
      _.isEqual(
        _.size(
          _.filter($scope.filterObject.transactionTypes, function (type) {
            return type < 7;
          })
        ),
        6
      ) || _.isNull($scope.filterObject.transactionTypes);

    ctrl.hideRunningBalance = !(
      _.isNull(ctrl.selectedStartDate) &&
      _.isNull(ctrl.selectedEndDate) &&
      _.isNull($scope.filterObject.locations) &&
      balanceTranTypesSelected &&
      _.isNull($scope.filterObject.providers) &&
      _.isEqual(true, $scope.filterObject.IncludePaidTransactions) &&
      _.isEqual(true, $scope.filterObject.IncludeUnpaidTransactions) &&
      _.isEqual(true, $scope.filterObject.IncludeUnappliedTransactions) &&
      _.isEqual(true, $scope.filterObject.IncludeAppliedTransactions) &&
      _.includes($scope.filterObject.Statuses, 1) &&
      _.isEqual($scope.filters.Teeth, [])
    );

    $scope.disableReset =
      (!ctrl.hideRunningBalance &&
        _.isNull($scope.filterObject.transactionTypes) &&
        (_.isEqual($scope.filterObject.members, [shareData.currentPatientId]) ||
          _.isEqual(_.size(shareData.accountMembersDetail), 1))) ||
      $scope.filterBarDisabled;

    $scope.disableApply =
      ctrl.filtersAreNotValid() ||
      areAppliedFiltersSelected ||
      $scope.filterBarDisabled;
  };

  var fromDateWatch = $scope.$watch(
    'filterObject.dateRange.start',
    function (nv, ov) {
      if (!_.isEqual(nv, ov)) {
        ctrl.filterDatesAreValid();
      }
    }
  );

  var toDateWatch = $scope.$watch(
    'filterObject.dateRange.end',
    function (nv, ov) {
      if (!_.isEqual(nv, ov)) {
        ctrl.filterDatesAreValid();
      }
    }
  );

  // Watch the selectedTeeth object in the tooth filter
  $scope.selectedTeethWatcher = function (teeth) {
    $scope.filters.Teeth = teeth;
    $scope.filterChanged();
    ctrl.setFilterBarProperties();
    $scope.$evalAsync();
  };

  ctrl.setPatientFilter = function () {
    $scope.filters.Patients = [
      {
        Id: 0,
        Text: localize.getLocalizedString('All Account Members'),
        Selected: false,
        IsAllOption: true,
        IsDefault: false,
        Status: 'All',
      },
    ];
    if (!_.isNil(shareData.accountMembersDetail)) {
      if (_.isNil(shareData.selectedPatients)) {
        var currentPatientId = shareData.currentPatientId;
        if (!_.isNil(currentPatientId)) {
          var currentPatientOptionExists = false;
          _.each(shareData.accountMembersDetail, function (mem) {
            if (!_.isEqual(mem.personId, '0')) {
              var isCurrentPatientOption = mem.personId === currentPatientId;
              if (isCurrentPatientOption) {
                currentPatientOptionExists = true;
              }
              $scope.filters.Patients.push({
                Id: mem.personId,
                Text:
                  mem.patientDetailedName +
                  (mem.isResponsiblePerson
                    ? localize.getLocalizedString(' (RP)')
                    : ''),
                Selected: isCurrentPatientOption,
                IsAllOption: false,
                Status: mem.isActivePatient ? 'Active' : 'Inactive',
              });
            }
          });
          if (
            currentPatientOptionExists &&
            _.isEqual(_.size($scope.filters.Patients), 2)
          ) {
            $scope.filters.Patients[0].Selected = true;
          }
        } else {
          _.each(shareData.accountMembersDetail, function (mem) {
            if (!_.isEqual(mem.personId, '0')) {
              $scope.filters.Patients.push({
                Id: mem.personId,
                Text:
                  mem.patientDetailedName +
                  (mem.isResponsiblePerson
                    ? localize.getLocalizedString(' (RP)')
                    : ''),
                Selected: false,
                IsAllOption: false,
                Status: mem.isActivePatient ? 'Active' : 'Inactive',
              });
            }
          });
        }
      } else {
        var allPatientsSelected = _.isEqual(shareData.selectedPatients, '0');
        var optionsSelected = 0;
        _.each(shareData.accountMembersDetail, function (mem) {
          if (!_.isEqual(mem.personId, '0')) {
            var isSelectedPatient =
              _.includes(shareData.selectedPatients, mem.personId) ||
              allPatientsSelected;
            if (isSelectedPatient) {
              optionsSelected++;
            }
            $scope.filters.Patients.push({
              Id: mem.personId,
              Text:
                mem.patientDetailedName +
                (mem.isResponsiblePerson
                  ? localize.getLocalizedString(' (RP)')
                  : ''),
              Selected: isSelectedPatient,
              IsAllOption: false,
              Status: mem.isActivePatient ? 'Active' : 'Inactive',
            });
          }
        });
        if (
          _.isEqual(optionsSelected, _.size($scope.filters.Patients) - 1) ||
          allPatientsSelected
        ) {
          $scope.filters.Patients[0].Selected = true;
        }
      }
    }
    ctrl.selectedFilters = _.cloneDeep($scope.filters);
    ctrl.setFilterBarProperties();
  };

  ctrl.resetPatientFilter = function () {
    var currentPatientId = shareData.currentPatientId;
    if (!_.isNil(currentPatientId)) {
      _.each($scope.filters.Patients, function (pat) {
        pat.Selected = false;
      });
      var patientOption = _.find($scope.filters.Patients, [
        'Id',
        currentPatientId,
      ]);
      if (!_.isNil(patientOption)) {
        patientOption.Selected = true;
        if (_.isEqual(_.size($scope.filters.Patients), 2)) {
          $scope.filters.Patients[0].Selected = true;
        }
      }
    }
  };

  $scope.$on('set-account-member-filter', function () {
    ctrl.setPatientFilter();
  });

  $scope.$on('$destroy', function () {
    fromDateWatch();
    toDateWatch();
    // unsubscribe to filter bar status changes
    patientAccountFilterBarFactory.resetFilterBarObservers();
  });

  // update filter bar disabled variable when it changes
  ctrl.updateFilterBarStatus = function (filterBarDisabled) {
    $scope.filterBarDisabled = filterBarDisabled;
    $scope.showMoreFilters = false;

    // Disable the appy/reset buttons
    ctrl.setFilterBarProperties();
  };

  ctrl.init();
}
PatientAccountFilterBarController.prototype = Object.create(BaseCtrl.prototype);
