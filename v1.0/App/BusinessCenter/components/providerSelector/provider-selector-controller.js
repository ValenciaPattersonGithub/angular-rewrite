(function () {
  'use strict';

  angular
    .module('common.controllers')
    .controller('ProviderSelectorController', ProviderSelectorController);
  ProviderSelectorController.$inject = [
    '$scope',
    '$timeout',
    '$filter',
    'localize',
    'PatientLandingFactory',
    'locationService',
    'referenceDataService',
    'ProviderShowOnScheduleFactory',
  ];

  function ProviderSelectorController(
    $scope,
    $timeout,
    $filter,
    localize,
    patientLandingfactory,
    locationService,
    referenceDataService,
    showOnScheduleFactory
  ) {
    BaseCtrl.call(this, $scope, 'ProviderSelectorController');

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

    // this is hit when location changes in the UI
    $scope.$on('patCore:initlocation', function () {
      if (_.isNil($scope.filterByLocationId)) {
        ctrl.showOnSchedulePromise = null;
        ctrl.showOnScheduleExceptions = null;
        ctrl.loadProvidersByLocation();
      }
    });

    // this is hit when location changes in the UI
    $scope.$watch('filterByLocationId', function (nv, ov) {
      if (!_.isNil(nv) && parseInt(nv) !== parseInt(ov)) {
        ctrl.showOnSchedulePromise = null;
        ctrl.showOnScheduleExceptions = null;
        ctrl.loadProvidersByLocation();
      }
    });

    $scope.$watch('filterByMultipleLocations', function (nv, ov) {
      if (!_.isNil(nv) && !angular.equals(nv, ov)) {
        ctrl.showOnSchedulePromise = null;
        ctrl.showOnScheduleExceptions = null;
        ctrl.loadProvidersByLocation();
      }
    });

    ctrl.init = function () {
      ctrl.loadProvidersByLocation();
    };

    // modify providerDropdownTemplate to show inactive users in grey italics
    $scope.providerDropdownTemplate =
      '<div id="providerDropdownTemplate" type="text/x-kendo-template">' +
      '<span id="lblSelectedName" class="value-template-input k-state-default" ' +
      "ng-style=\"{'color': dataItem.IsActive ? 'black' : 'lightgrey', 'font-style': dataItem.IsActive ? 'normal' : 'italic','font-weight': dataItem.IsPreferred ? 'bold' : 'normal','display': 'block','width': '100%' }\">#: Name #</span>" +
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

    // loads and filters the provider list by either a passed location id or currentLocation.id
    ctrl.loadProvidersByLocation = function () {
      if ($scope.filterShowOnSchedule === true) {
        if ($scope.providerScheduleExceptions) {
          ctrl.showOnScheduleExceptions = $scope.providerScheduleExceptions;
        } else {
          ctrl.showOnSchedulePromise = showOnScheduleFactory
            .getAll()
            .then(function (res) {
              ctrl.showOnScheduleExceptions = res.Value;
            });
        }
      }

      ctrl.allProvidersList = [];
      $scope.providers = [];
      ctrl.currentLocation = locationService.getCurrentLocation();

      ctrl.allProvidersList = referenceDataService.get(
        referenceDataService.entityNames.users
      );

      ctrl.addDynamicColumnsToProviders(ctrl.allProvidersList);

      ctrl.filterProviders();
    };

    ctrl.filterProviders = function () {
      // if location id is passed to directive, use that else use the current location id
      var filterByLocationIds = null;

      if (!_.isNil($scope.filterByLocationId)) {
        filterByLocationIds = [$scope.filterByLocationId];
      } else if (!_.isNil($scope.filterByMultipleLocations)) {
        filterByLocationIds = [];
        for (var x = 0; x < $scope.filterByMultipleLocations.length; x++) {
          filterByLocationIds.push($scope.filterByMultipleLocations[x]);
        }
      } else {
        filterByLocationIds = [ctrl.currentLocation.id];
      }

      var filteredProviderList = ctrl.filterProviderList(
        ctrl.allProvidersList,
        filterByLocationIds
      );
      // ordering
      let providers = [];
      if (
        (filteredProviderList && $scope.patientInfo) ||
        $scope.sortForClinicalNotes
      ) {
        providers = filteredProviderList;
      } else {
        // if sorting is not handled by that getProvidersInPreferredOrderFilter sort by Active, LastName
        providers = _.orderBy(
          filteredProviderList,
          ['IsActive', 'LastName', 'FirstName'],
          ['desc', 'asc', 'asc']
        );
      }

      // only if we are filtering out inactive providers
      if ($scope.filterInactiveProviders === true) {
        // filter out all inactive providers
        // exception: if the currently selected provider is inactive, keep that provider in the list

        // custom handling for the patient overview screen. yuck.
        if ($scope.isOnPatientOverview === true) {
          $scope.providers = providers.filter(
            provider => provider.IsActive === true
          );
        } else {
          // every place except the patient overview screen
          $scope.providers = providers.filter(
            provider =>
              provider.IsActive === true ||
              $scope.selectedProvider === provider.ProviderId
          );
        }
      } else {
        $scope.providers = Object.assign([], providers);
      }

      if ($scope.sortForClinicalNotes) {
        var currentSelectedUser = _.find($scope.providers, function (provider) {
          return provider.ProviderId === $scope.selectedProvider;
        });
        if (!currentSelectedUser) {
          $scope.sbChange(null);
        }
      }

      // only if we're filtering for show on schedule
      if (
        $scope.filterShowOnSchedule === true &&
        !_.isNil(ctrl.showOnSchedulePromise)
      ) {
        ctrl.showOnSchedulePromise.then($scope.providers);
      }
    };

    ctrl.filterByProviderType = function (providerList) {
      var filteredProviderList = [];
      if ($scope.providerTypeIds) {
        _.forEach(providerList, function (provider) {
          for (var x = 0; x < provider.UserLocationSetup.length; x++) {
            var index = $scope.providerTypeIds.indexOf(
              provider.UserLocationSetup[x].ProviderTypeId
            );
            if (index !== -1) {
              filteredProviderList.push(provider);

              //Stop looping through provider locations once any of the location setups match a provider type in the filter list
              x = provider.UserLocationSetup.length;
            }
          }
        });
      } else {
        filteredProviderList = providerList;
      }
      return filteredProviderList;
    };

    // filter the provider list by selected location id and only include userLocationSetup data for that location
    ctrl.filterProvidersByUserLocations = function (
      providerList,
      filterByLocationIds
    ) {
      var filteredProviderList = [];
      _.forEach(providerList, function (provider) {
        provider.UserLocationSetup = [];
        _.forEach(filterByLocationIds, function (locationId) {
          var userLocationSetup = _.find(
            provider.Locations,
            function (userLocationSetup) {
              return userLocationSetup.LocationId === locationId;
            }
          );
          if (userLocationSetup) {
            // NOTE
            // provider.IsActive is based on the UserLocationSetup.IsActive instead of the user.IsActive
            // provider.IsActive = false currently only shows the provider in  italicized grey text and at the
            // bottom of provider list when list is based on a location
            provider.IsActive = userLocationSetup.IsActive;
            provider.UserLocationSetup.push(_.cloneDeep(userLocationSetup));
          }
        });
        if (provider.UserLocationSetup.length > 0) {
          filteredProviderList.push(provider);
        }
      });
      return filteredProviderList;
    };

    // add options for the examining dentist
    ctrl.addOptionsForExaminingDentist = function (providerList) {
      if (!_.isUndefined($scope.optionsForExaminingDentist)) {
        var option = {
          Name: localize.getLocalizedString('No Exam Needed'),
          ProviderId: 'noexam',
          IsActive: true,
        };
        providerList.unshift(option);
        option = {
          Name: localize.getLocalizedString('Any Dentist'),
          ProviderId: 'any',
          IsActive: true,
        };
        providerList.unshift(option);
      }
    };

    // if exceptionProviderId is passed to directive, add to list if not there
    ctrl.addExceptionProvider = function (providerList) {
      if (!_.isNil($scope.exceptionProviderId)) {
        // if exceptionProviderId is not in providerList, add it
        var providerInList = _.find(providerList, function (provider) {
          return (
            provider.UserId === $scope.exceptionProviderId ||
            provider.ProviderId === $scope.exceptionProviderId
          );
        });
        if (!providerInList) {
          var provider = _.find(ctrl.allProvidersList, function (provider) {
            return (
              provider.UserId === $scope.exceptionProviderId ||
              provider.ProviderId === $scope.exceptionProviderId
            );
          });
          if (provider) {
            providerList.push(provider);
          }
        }
      }
      return providerList;
    };

    // set list of providers with preferred providers set to IsPreferred based on patientInfo
    ctrl.setPreferredProviders = function (providerList, filterByLocationIds) {
      var preferredProviderList = [];

      if (!$scope.sortForClinicalNotes) {
        preferredProviderList = $filter('orderBy')(providerList, 'LastName');
        if (providerList && $scope.patientInfo) {
          preferredProviderList = $filter(
            'getProvidersInPreferredOrderFilterMultiLocations'
          )(
            preferredProviderList,
            _.cloneDeep($scope.patientInfo),
            filterByLocationIds
          );
        }
        providerList = preferredProviderList;
      } else {
        _.forEach(providerList, function (provider) {
          if (
            $scope.patientInfo &&
            provider.UserId === $scope.patientInfo.PreferredDentist
          ) {
            provider.IsPreferred = true;
          }
        });
        return providerList;
      }

      return preferredProviderList;
    };

    // filter based on onlyActive property
    ctrl.filterProviderListForOnlyActive = function (providerList) {
      // if selectedProvider is not in list, add it to filtered list for display (may have been deactivated after service transaction created)
      return $scope.onlyActive === true
        ? providerList.filter(function (provider) {
            return (
              provider.IsActive === true ||
              provider.UserId === $scope.selectedProvider
            );
          })
        : providerList;
    };

    // filter based on showOnSchedule
    //TODO: Remove this? Not even being used
    ctrl.filterProviderListForShowOnSchedule = function (
      providerList,
      filterByLocationId
    ) {
      if ($scope.filterShowOnSchedule !== true) {
        return providerList;
      }

      // filter exceptions down to filterByLocationId
      var exceptions = _.filter(ctrl.showOnScheduleExceptions, {
        LocationId: filterByLocationId,
      });

      return _.filter(providerList, function (provider) {
        // if provider type 1 or 2, initially true, else false
        var show =
          provider.UserLocationSetup.ProviderTypeId === 1 ||
          provider.UserLocationSetup.ProviderTypeId === 2;

        // if exception exists, override
        var exception = _.filter(exceptions, { UserId: provider.UserId });
        if (!_.isNil(exception) && exception.length > 0) {
          show = exception[0].ShowOnSchedule;
        }

        return show;
      });
    };

    // Handle different patient objects passed to selector
    ctrl.getPatientPreferredDentist = function (patientInfo) {
      if (patientInfo.Profile) {
        return patientInfo.Profile.PreferredDentist;
      }
      if (patientInfo.PreferredDentist) {
        return patientInfo.PreferredDentist;
      }
      return null;
    };
    ctrl.getPatientPreferredHygienist = function (patientInfo) {
      if (patientInfo.Profile) {
        return patientInfo.Profile.PreferredHygienist;
      }
      if (patientInfo.PreferredHygienist) {
        return patientInfo.PreferredHygienist;
      }
      return null;
    };

    // this method only sets the selected provider if the selected provider is null or undefined or empty
    // and setPreferred is true
    //
    ctrl.defaultSelectedProvider = function (filteredProviderList) {
      if (
        _.isEmpty($scope.selectedProvider) &&
        $scope.setPreferred === true &&
        $scope.patientInfo
      ) {
        // patientInfo may have different objects
        var patientPreferredDentist = ctrl.getPatientPreferredDentist(
          $scope.patientInfo
        );
        var patientPreferredHygenist = ctrl.getPatientPreferredHygienist(
          $scope.patientInfo
        );
        $scope.selectedProvider = '';
        $timeout(function () {
          _.forEach(filteredProviderList, function (provider) {
            if (
              provider.IsPreferred &&
              $scope.usuallyPerformedBy === 1 &&
              provider.UserLocationSetup.ProviderTypeId !== 4 &&
              provider.ProviderId === patientPreferredDentist
            ) {
              $scope.selectedProvider = provider.ProviderId;
              patientLandingfactory.setPreferredProvider(provider.ProviderId);
            }
            if (
              provider.IsPreferred &&
              $scope.usuallyPerformedBy === 2 &&
              provider.UserLocationSetup.ProviderTypeId !== 4 &&
              provider.ProviderId === patientPreferredHygenist
            ) {
              $scope.selectedProvider = provider.ProviderId;
              patientLandingfactory.setPreferredProvider(provider.ProviderId);
            }
          });
        }, 0);
      }
    };

    ctrl.sortProviderListForClinicalNotes = function (filteredProviderList) {
      var dentistList = filteredProviderList.filter(function (provider) {
        return _.find(provider.UserLocationSetup, function (setup) {
          return setup.ProviderTypeId == 1;
        });
      });

      var otherProvidersList = filteredProviderList.filter(function (provider) {
        return _.find(provider.UserLocationSetup, function (setup) {
          return setup.ProviderTypeId != 1;
        });
      });

      dentistList = $filter('orderBy')(dentistList, 'LastName');
      otherProvidersList = $filter('orderBy')(otherProvidersList, 'LastName');

      filteredProviderList = [];
      filteredProviderList = filteredProviderList.concat(dentistList);
      filteredProviderList = filteredProviderList.concat(otherProvidersList);
      return filteredProviderList;
    };

    ctrl.filterProviderList = function (allProvidersList, filterByLocationIds) {
      for (var x = 0; x < filterByLocationIds.length; x++) {
        filterByLocationIds[x] = parseInt(filterByLocationIds[x]);
      }
      var filteredProviderList = [];
      // if filterByLocation is passed to directive, filter by this location
      filteredProviderList = ctrl.filterProvidersByUserLocations(
        allProvidersList,
        filterByLocationIds
      );

      // filter list for onlyActive
      filteredProviderList = ctrl.filterProviderListForOnlyActive(
        filteredProviderList
      );

      // add preferredProviders to list
      filteredProviderList = ctrl.setPreferredProviders(
        filteredProviderList,
        filterByLocationIds
      );

      // set selected provider if needed
      ctrl.defaultSelectedProvider(filteredProviderList);

      // filter by providerType
      filteredProviderList = ctrl.filterByProviderType(filteredProviderList);
      // check for exceptionProvider
      filteredProviderList = ctrl.addExceptionProvider(filteredProviderList);

      // add options  for examining dentists
      ctrl.addOptionsForExaminingDentist(filteredProviderList);

      if ($scope.sortForClinicalNotes && !$scope.exceptionProviderId) {
        //When an exceptionProvider is given, that means we shouldn't be sorting at all
        filteredProviderList = ctrl.sortProviderListForClinicalNotes(
          filteredProviderList
        );
      }

      return filteredProviderList;
    };
    ctrl.init();
  }
  ProviderSelectorController.prototype = Object.create(BaseCtrl);
})();
