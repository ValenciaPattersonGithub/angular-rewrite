'use strict';

angular.module('Soar.Patient').controller('PatientPreferencesController', [
  '$scope',
  '$rootScope',
  '$routeParams',
  '$q',
  'toastrFactory',
  'localize',
  'PersonServices',
  'ListHelper',
  '$timeout',
  'UsersFactory',
  'TimeZoneFactory',
  '$filter',
  'SaveStates',
  'RolesFactory',
  'locationService',
  'ModalFactory',
  'RoleNames',
  'referenceDataService',
  'PatCacheFactory',
  function (
    $scope,
    $rootScope,
    $routeParams,
    $q,
    toastrFactory,
    localize,
    personServices,
    listHelper,
    $timeout,
    usersFactory,
    timeZoneFactory,
    $filter,
    saveStates,
    rolesFactory,
    locationService,
    modalFactory,
    roleNames,
    referenceDataService,
    patCacheFactory
  ) {
    var ctrl = this;

    // default placeholder for dentists
    $scope.dentistPlaceHolder = localize.getLocalizedString(
      'No Preferred {0}',
      ['Dentist']
    );
    $scope.hygienistPlaceHolder = localize.getLocalizedString(
      'No Preferred {0}',
      ['Hygienist']
    );

    $scope.valid = true;
    $scope.doneLoading = false;
    $scope.alternateOptions = [];
    $scope.preferredDentistIsNotADentist = false;

    $scope.preferredDentistIsProvider = true;
    $scope.preferredHygienistIsProvider = true;

    $scope.patientAlternateChosenLocation = {
      LocationId: '',
    };
    $scope.currentPatientId = $scope.currentPatientId
      ? $scope.currentPatientId
      : $routeParams.patientId;
    $scope.providersWithInactiveStatusButPreferred = [];
    ctrl.providerList = [];
    if (
      typeof $scope.currentPatientId == 'undefined' ||
      $scope.currentPatientId == null ||
      $scope.currentPatientId == ''
    ) {
      //added these in the case of the patient list page, it doenst always pass info
      if ($scope.preferences && $scope.preferences.PatientId) {
        $scope.currentPatientId = $scope.preferences.PatientId;
      }
      //added this due to every other click of the button, the above info is not populated
      else if ($scope.$parent.selectedPatientId) {
        $scope.currentPatientId = $scope.$parent.selectedPatientId;
      }
      //if we find no patient id, dont load anything
      else {
        $scope.currentPatientId = null;
      }
    }
    //#region get patient
    ctrl.PersonServicesGetSuccess = function (res) {
      var deferred = $q.defer();
      $scope.loading = false;
      if (res.Value) {
        $scope.person = res.Value;
        $scope.tempPerson = angular.copy($scope.person);
        if ($scope.$parent.data) {
          $scope.$parent.data.originalData = angular.copy($scope.person);
          $scope.$parent.data.saveData = angular.copy($scope.person);
        }
        deferred.resolve();
      }
      return deferred.promise;
    };
    ctrl.PersonServicesGetFailure = function () {
      $scope.loading = false;
      toastrFactory.error(
        localize.getLocalizedString(
          'Failed to retrieve the {0}. Refresh the page to try again.',
          ['patient']
        ),
        localize.getLocalizedString('Server Error')
      );
      return $q.reject();
    };

    ctrl.getPracticeLocations = function () {
      var deferred = $q.defer();
      locationService
        .getCurrentPracticeLocations()
        .then(function (locations) {
          if ($scope.practiceLocations) {
            $scope.practiceLocations.length = 0;
            angular.forEach(locations, function (loc) {
              $scope.practiceLocations.push(loc);
            });
          } else {
            $scope.practiceLocations = locations;
          }
          deferred.resolve();
          //ctrl.filterLocations();
        })
        .catch(function () {
          $scope.selectedLocationName = 'Select a Practice';
        });
      return deferred.promise;
    };

    $scope.getPatient = function () {
      $scope.loading = true;
      var deferred = $q.defer();
      personServices.Persons.get({ Id: $scope.currentPatientId }).$promise.then(
        function (res) {
          ctrl.PersonServicesGetSuccess(res);
          deferred.resolve();
        },
        function (err) {
          ctrl.PersonServicesGetFailure(err);
        }
      );
      return deferred.promise;
    };
    //#endregion
    //#region locations get
    ctrl.resLocs = [];
    ctrl.pendingInactiveLocs = [];
    ctrl.inactiveLocs = [];
    ctrl.groupLocations = function (locs) {
      ctrl.resLocs = [];
      ctrl.activeLocs = [];
      ctrl.pendingInactiveLocs = [];
      ctrl.inactiveLocs = [];

      var dateNow = moment().format('MM/DD/YYYY');
      _.each(locs, function (obj) {
        if (obj.DeactivationTimeUtc) {
          var toCheck = moment(obj.DeactivationTimeUtc).format('MM/DD/YYYY');
          obj.LocationNameWithDate =
            obj.NameLine1 +
            ' (' +
            timeZoneFactory.GetTimeZoneAbbr(obj.Timezone) +
            ')' +
            ' - ' +
            toCheck;

          if (
            moment(toCheck).isBefore(dateNow) ||
            moment(toCheck).isSame(dateNow)
          ) {
            obj.LocationStatus = 'Inactive';
            obj.GroupOrder = 3;
            ctrl.inactiveLocs.push(obj);
          } else {
            obj.LocationStatus = 'Pending Inactive';
            obj.GroupOrder = 2;
            ctrl.pendingInactiveLocs.push(obj);
          }
        } else {
          obj.LocationNameWithDate =
            obj.NameLine1 +
            ' (' +
            timeZoneFactory.GetTimeZoneAbbr(obj.Timezone) +
            ')';
          obj.LocationStatus = 'Active';
          obj.GroupOrder = 1;
          ctrl.activeLocs.push(obj);
        }
      });
      ctrl.activeLocs = $filter('orderBy')(ctrl.activeLocs, 'NameLine1');
      ctrl.inactiveLocs = $filter('orderBy')(
        ctrl.inactiveLocs,
        'DeactivationTimeUtc',
        true
      );
      ctrl.pendingInactiveLocs = $filter('orderBy')(
        ctrl.pendingInactiveLocs,
        'DeactivationTimeUtc',
        false
      );

      var ctrIndex = 1;
      _.each(ctrl.activeLocs, function (obj) {
        obj.SortingIndex = ctrIndex;
        ctrl.resLocs.push(obj);
        ctrIndex++;
      });
      _.each(ctrl.pendingInactiveLocs, function (obj) {
        obj.SortingIndex = ctrIndex;
        ctrl.resLocs.push(obj);
        ctrIndex++;
      });
      _.each(ctrl.inactiveLocs, function (obj) {
        obj.SortingIndex = ctrIndex;
        ctrl.resLocs.push(obj);
        ctrIndex++;
      });
      return ctrl.resLocs;
    };

    ctrl.locationServicesGetOnSuccess = function (res) {
      ctrl.loadingLocations = false;
      //$scope.locations = $filter('orderBy')(res.Value, 'NameLine1');
      $scope.locations = ctrl.groupLocations(res.Value);
      _.forEach($scope.locations, function (location) {
        location.tzAbbr = timeZoneFactory.GetTimeZoneAbbr(location.Timezone);
      });

      if ($scope.locations && $scope.practiceLocations) {
        var filteredLocations = [];
        var filteredLocs = [];
        _.forEach($scope.locations, function (objLocation) {
          var item = listHelper.findItemByFieldValue(
            $scope.locations,
            'LocationId',
            objLocation.LocationId
          );
          if (item) {
            var filteredItem = listHelper.findItemByFieldValue(
              $scope.practiceLocations,
              'id',
              objLocation.LocationId
            );
            if (filteredItem) {
              filteredLocs.push(item);
            }
          }
        });

        filteredLocations = ctrl.groupLocations(filteredLocs);

        $scope.locationsDDL = {
          data: filteredLocations,
          group: { field: 'GroupOrder' },
          sort: { field: 'SortingIndex', dir: 'asc' },
        };
      }
    };

    // loads both practiceLocations and locations (I'm not sure why we need both)
    ctrl.getLocations = function () {
      var deferred = $q.defer();
      ctrl.getPracticeLocations().then(function () {
        return referenceDataService
          .getData(referenceDataService.entityNames.locations)
          .then(function (locations) {
            ctrl.loadingLocations = false;
            ctrl.locationServicesGetOnSuccess({ Value: locations });
            deferred.resolve();
          });
      });
      return deferred.promise;
    };
    //#endregion

    ctrl.getPersonData = function () {
      if (ctrl.isInitialProviderLoad && !_.isNil($scope.patient)) {
        var deferred = $q.defer();
        $scope.loading = false;
        var person = {};
        person.Profile = $scope.patient;
        person.PatientLocations = $scope.patient.PatientLocations;
        $scope.tempPerson = _.cloneDeep(person);
        $scope.person = person;
        deferred.resolve();
        return deferred.promise;
      } else {
        return personServices.Persons.get({
          Id: $scope.currentPatientId,
        }).$promise.then(
          function (res) {
            return ctrl.PersonServicesGetSuccess(res);
          },
          function (err) {
            return ctrl.PersonServicesGetFailure(err);
          }
        );
      }
    };

    ctrl.getProviders = function () {
      var deferred = $q.defer();
      referenceDataService
        .getData(referenceDataService.entityNames.users)
        .then(function (providers) {
          ctrl.providerList = providers;
          ctrl.loadingProviders = false;
          deferred.resolve();
        });
      return deferred.promise;
    };

    //#endregion
    //#region update/set values
    ctrl.updateLocationNames = function () {
      if ($scope.tempPerson && $scope.tempPerson.PatientLocations) {
        angular.forEach($scope.tempPerson.PatientLocations, function (loc) {
          loc.LocationName = ctrl.locationName(loc.LocationId);
        });
      }
    };
    $scope.setLocation = function () {
      if ($scope.tempPerson && $scope.tempPerson.Profile) {
        $scope.selectedLocation = ctrl.lookupLocation(
          $scope.tempPerson.Profile.PreferredLocation
        );
      } else if ($scope.patient && $scope.patient.PreferredLocation) {
        $scope.selectedLocation = ctrl.lookupLocation(
          $scope.patient.PreferredLocation
        );
      } else {
        $scope.selectedLocation = ctrl.lookupLocation(
          $scope.preferences.PreferredLocation
        );
      }
      if ($scope.selectedLocation == null) {
        $scope.selectLocation = true;
      }
    };

    ctrl.isNotADentistThisLocation = function (
      selectedProvider,
      preferredLocation
    ) {
      var isNotADentist = false;
      if (selectedProvider && preferredLocation) {
        var userLocationSetup = _.find(
          selectedProvider.Locations,
          function (userLocation) {
            return (
              parseInt(userLocation.LocationId) === parseInt(preferredLocation)
            );
          }
        );
        if (userLocationSetup) {
          isNotADentist = !(
            userLocationSetup.ProviderTypeId === 1 ||
            userLocationSetup.ProviderTypeId === 5
          );
        }
      }
      return isNotADentist;
    };

    ctrl.isValidProviderForThisLocation = function (
      selectedProvider,
      preferredLocation
    ) {
      var userIsValidForThisLocation = false;
      if (selectedProvider && preferredLocation) {
        var userLocationSetup = _.find(
          selectedProvider.Locations,
          function (userLocation) {
            return (
              parseInt(userLocation.LocationId) ===
                parseInt(preferredLocation) && userLocation.IsActive
            );
          }
        );
        if (userLocationSetup) {
          userIsValidForThisLocation = userLocationSetup.ProviderTypeId !== 4;
        }
      }

      return userIsValidForThisLocation;
    };

    $scope.changedDentist = function () {
      if ($scope.tempPerson && $scope.tempPerson.Profile) {
        $scope.selectedDentist = _.find(ctrl.providerList, function (provider) {
          return (
            provider.UserId === $scope.tempPerson.Profile.PreferredDentist &&
            provider.Locations.map(x => x.LocationId).includes(
              $scope.tempPerson.Profile.PreferredLocation
            )
          );
        });
        if ($scope.selectedDentist) {
          // check to make sure previously selected dentist is a provider at this location
          $scope.preferredDentistIsProvider = ctrl.isValidProviderForThisLocation(
            $scope.selectedDentist,
            $scope.tempPerson.Profile.PreferredLocation
          );

          if ($scope.preferredDentistIsProvider === true) {
            // check to make sure previously selected dentist is a dentist at this location
            $scope.preferredDentistIsNotADentist = ctrl.isNotADentistThisLocation(
              $scope.selectedDentist,
              $scope.tempPerson.Profile.PreferredLocation
            );
          }
        }
      } else if ($scope.patient && $scope.patient.PreferredDentist) {
        $scope.selectedDentist = _.find(ctrl.providerList, function (provider) {
          return provider.UserId === $scope.patient.PreferredDentist;
        });
        if ($scope.selectedDentist) {
          // check to make sure previously selected dentist is a provider at this location
          $scope.preferredDentistIsProvider = ctrl.isValidProviderForThisLocation(
            $scope.selectedDentist,
            $scope.patient.PreferredLocation
          );
          if ($scope.preferredDentistIsProvider === true) {
            // check to make sure previously selected dentist is a dentist at this location
            $scope.preferredDentistIsNotADentist = ctrl.isNotADentistThisLocation(
              $scope.selectedDentist,
              $scope.patient.PreferredLocation
            );
          }
        }
      } else {
        $scope.selectedDentist = _.find(ctrl.providerList, function (provider) {
          return provider.UserId === $scope.preferences.PreferredDentist;
        });
        $scope.selectedDentist.Name = localize.getLocalizedString(
          'No Preferred {0}',
          ['Dentist']
        );
      }
      if (!_.isNil($scope.selectedDentist)) {
        $scope.selectedDentist.Name = $filter('getDisplayNamePerBestPractice')(
          $scope.selectedDentist
        );
      }
    };

    $scope.changedHygienist = function () {
      if ($scope.tempPerson && $scope.tempPerson.Profile) {
        $scope.selectedHygienist = _.find(
          ctrl.providerList,
          function (provider) {
            return (
              provider.UserId === $scope.tempPerson.Profile.PreferredHygienist
            );
          }
        );
        if ($scope.selectedHygienist) {
          $scope.preferredHygienistIsProvider = ctrl.isValidProviderForThisLocation(
            $scope.selectedHygienist,
            $scope.tempPerson.Profile.PreferredLocation
          );

          if (!$scope.preferredHygienistIsProvider) {
            $scope.selectedHygienist = false;
          }
        }
      } else if ($scope.patient && $scope.patient.PreferredHygienist) {
        $scope.selectedHygienist = _.find(
          ctrl.providerList,
          function (provider) {
            return provider.UserId === $scope.patient.PreferredHygienist;
          }
        );
        if ($scope.selectedHygienist) {
          $scope.preferredHygienistIsProvider = ctrl.isValidProviderForThisLocation(
            $scope.selectedHygienist,
            $scope.patient.PreferredLocation
          );
        }
      } else {
        $scope.selectedHygienist = _.find(
          ctrl.providerList,
          function (provider) {
            return provider.UserId === $scope.preferences.PreferredHygienist;
          }
        );
      }
      if (
        !_.isNil($scope.selectedHygienist) &&
        $scope.preferredHygienistIsProvider
      ) {
        $scope.selectedHygienist.Name = $filter(
          'getDisplayNamePerBestPractice'
        )($scope.selectedHygienist);
      }
    };

    //TODO remove
    $scope.onChangeDentist = function () {};
    //TODO remove
    $scope.onChangeHygienist = function () {};

    $scope.resetPerson = function () {
      $scope.setLocation();
      $scope.changedDentist();
      $scope.changedHygienist();
      $scope.$parent.data.saveData = $scope.$parent.data.originalData;
      $scope.$emit('preferences-changed', false);
      $rootScope.$broadcast('patient-personal-info-changed');
    };

    ctrl.editPreferredProviders = function () {
      $scope.editing = true;
    };

    ctrl.confirmInvalidProviders = function () {
      let message = '';
      let showModal = false;
      if ($scope.preferredDentistValidForLocation === false) {
        message += localize.getLocalizedString(
          "This patient's preferred dentist is no longer valid for this location, please update the preferred provider."
        );
        message += '\r\n\r\n';
        showModal = true;
      }
      if ($scope.preferredHygienistValidForLocation === false) {
        message += localize.getLocalizedString(
          "This patient's preferred hygienist is no longer valid for this location, please update the preferred provider."
        );
        showModal = true;
      }
      if (showModal === true) {
        var title = localize.getLocalizedString(
          'Preferred Providers Validation'
        );
        var button1Text = localize.getLocalizedString('OK');
        modalFactory
          .ConfirmModal(title, message, button1Text)
          .then(ctrl.editPreferredProviders);
      }
    };

    ctrl.checkPreferredProviders = function () {
      $scope.preferredHygienistValidForLocation = true;
      $scope.preferredDentistValidForLocation = true;
      if (!_.isNil($scope.selectedDentist)) {
        $scope.preferredDentistValidForLocation = ctrl.isProviderDentistAtLocation(
          $scope.selectedDentist,
          $scope.selectedLocation.LocationId
        );
      }
      if (!_.isNil($scope.selectedHygienist)) {
        $scope.preferredHygienistValidForLocation = ctrl.isValidProviderForThisLocation(
          $scope.selectedHygienist,
          $scope.selectedLocation.LocationId
        );
      }
    };

    ctrl.isProviderDentistAtLocation = function (
      selectedProvider,
      preferredLocation
    ) {
      if (selectedProvider && preferredLocation) {
        var userLocationSetup = _.find(
          selectedProvider.Locations,
          function (userLocation) {
            return (
              parseInt(userLocation.LocationId) === parseInt(preferredLocation)
            );
          }
        );
        if (userLocationSetup) {
          return (
            userLocationSetup.ProviderTypeId === 1 ||
            userLocationSetup.ProviderTypeId === 5
          );
        }
      }
      return false;
    };

    //#endregion

    //#region filters
    //#endregion

    //#region look ups
    ctrl.lookupLocation = function (locationId) {
      return listHelper.findItemByFieldValue(
        $scope.locations,
        'LocationId',
        locationId
      );
    };

    ctrl.locationName = function (locId) {
      var loc = ctrl.lookupLocation(locId);
      if (loc) {
        if (loc.tzAbbr) {
          return loc.NameLine1 + ' (' + loc.tzAbbr + ')';
        } else {
          return loc.NameLine1;
        }
      } else {
        return '';
      }
    };
    $scope.showNoAlternate = function () {
      if ($scope.tempPerson) {
        var found = 0;

        angular.forEach($scope.tempPerson.PatientLocations, function (loc) {
          if (!loc.IsPrimary && loc.ObjectState != saveStates.Delete) found++;
        });
        return found < 1; //tempPerson.PatientLocations.length == 1
      } else {
        return true;
      }
    };
    //#endregion
    //#region save
    $scope.onSuccess = function (res) {
      ctrl.cleanDeletedLocations();
      $scope.person = angular.copy($scope.tempPerson);
      $scope.$parent.data.saveData = angular.copy($scope.person);
      $scope.resetPerson();
      toastrFactory.success(
        localize.getLocalizedString('Update {0}', ['successful.']),
        'Success'
      );
      $scope.patient = res.Value.Profile;
      // the patient api is only called the first time the dashboard loads
      // because of that we need to update the patient object on the parent
      // if we don't, the stale patient object will keep getting reloaded everytime this view loads
      $scope.preferences = res.Value.Profile;
      $scope.preferences.ResponsiblePersonType =
        $scope.person.Profile.ResponsiblePersonType;
      $scope.$parent.$parent.data.additionalData = $scope.patient;
      $scope.$parent.$parent.additionalData = $scope.patient;
      // clear cache so that dashboard gets refreshed on next load
      var patientOverviewCache = patCacheFactory.GetCache(
        'patientOverviewCache'
      );
      patCacheFactory.ClearCache(patientOverviewCache);
    };
    $scope.onError = function () {
      toastrFactory.error(
        'Update was unsuccessful. Please retry your save.',
        'Server Error'
      );
    };
    $scope.saveFunction = function (person, onSuccess, onError) {
      ctrl.checkPreferredProviders();
      if (
        $scope.preferredDentistValidForLocation === true &&
        $scope.preferredHygienistValidForLocation === true
      ) {
        if ($scope.validate()) {
          personServices.Persons.update($scope.tempPerson, onSuccess, onError);
        } else {
          $scope.valid = false;
        }
      } else {
        if (
          $scope.preferredDentistValidForLocation === false &&
          $scope.tempPerson &&
          $scope.tempPerson.Profile
        ) {
          $scope.tempPerson.Profile.PreferredDentist = null;
        }
        if (
          $scope.preferredHygienistValidForLocation === false &&
          $scope.tempPerson &&
          $scope.tempPerson.Profile
        ) {
          $scope.tempPerson.Profile.PreferredHygienist = null;
        }

        if (person.Profile.PreferredDentist == 'x') {
          person.Profile.PreferredDentist == '';
        }
        if (person.Profile.PreferredHygienist == 'x') {
          person.Profile.PreferredHygienist == '';
        }

        if ($scope.validate()) {
          personServices.Persons.update($scope.tempPerson, onSuccess, onError);
        } else {
          $scope.valid = false;
        }
      }
    };
    $scope.validate = function () {
      if ($scope.frmPatientPreferences.inpLocation.$valid) {
        return true;
      } else {
        return false;
      }
    };
    //#endregion
    //#region watchers
    ctrl.changedPreferences = function (nv, ov) {
      if (nv != ov && $scope.editing) {
        $scope.$parent.data.saveData = angular.copy($scope.tempPerson);
        $scope.$emit('preferences-changed', true);
      }
    };

    $scope.$watch('editing', function (nv, ov) {
      if (nv === false && ov === true) {
        // indicates panel save or cancel complete, set dataHasChanged to false
        $scope.tempPerson = angular.copy($scope.person);
        ctrl.updateLocationNames();
        $scope.resetPerson();
        $scope.$emit('preferences-changed', false);
      }
      if (nv === true && nv != ov) {
        $q.when()
          .then(function () {
            $scope.valid = true;
            return ctrl.loadPatient();
          })
          .then(function () {
            // if user is saving changes and the preferredDentist or PreferredHygienist isn't valid
            // null out these entries
            if ($scope.preferredDentistIsNotADentist === true) {
              $scope.tempPerson.Profile.PreferredDentist = null;
              $scope.selectedDentist = null;
            }
            if ($scope.preferredHygienistIsProvider === false) {
              $scope.tempPerson.Profile.PreferredHygienist = null;
              $scope.selectedHygienist = null;
            }
          });
      }
    });
    $scope.$watch('tempPerson', ctrl.changedPreferences, true);

    $scope.$watch('tempPerson.Profile.PreferredLocation', function (nv, ov) {
      if (nv != ov) {
        ctrl.updatePrimaryLocation(nv, ov);
      }

      if (nv !== $scope.preferredLocationId) {
        $scope.preferredLocationId = nv;
      }
    });
    $scope.$watch(
      'tempPerson.Profile.PersonAccount.ReceivesStatements',
      function (nv) {
        if (nv === false) {
          $scope.tempPerson.Profile.PersonAccount.ReceivesFinanceCharges = false;
        }
      }
    );
    $scope.$watch(
      'tempPerson.Profile.PersonAccount.ReceivesFinanceCharges',
      function (nv) {
        if (
          nv === true &&
          $scope.tempPerson.Profile.PersonAccount.ReceivesStatements == false
        ) {
          $scope.tempPerson.Profile.PersonAccount.ReceivesFinanceCharges = false;
        }
      }
    );

    $scope.$watch(
      'patientAlternateChosenLocation.LocationId',
      function (nv, ov) {
        if (nv != ov && nv != undefined && nv != '') {
          $scope.addUpdatePatientLocations(nv);
        }
      }
    );
    //#endregion
    //#region angular crud
    $scope.updateAlternateOptionsList = function () {
      if (
        $scope.tempPerson &&
        $scope.tempPerson.PatientLocations &&
        $scope.locations
      ) {
        var tempList = _.filter($scope.locations, function (location) {
          if (
            _.filter($scope.tempPerson.PatientLocations, function (used) {
              return (
                location.LocationId == used.LocationId &&
                used.ObjectState != saveStates.Delete
              );
            }).length > 0
          ) {
            return false;
          } else {
            return true;
          }
        });
        $scope.alternateOptions = tempList;

        if ($scope.locations && $scope.practiceLocations) {
          $scope.filteredLocations = [];
          var filteredLocs = [];
          angular.forEach(
            $scope.alternateOptions,
            function (alternateLocation) {
              var item = listHelper.findItemByFieldValue(
                $scope.locations,
                'LocationId',
                alternateLocation.LocationId
              );
              if (item) {
                var filteredItem = listHelper.findItemByFieldValue(
                  $scope.practiceLocations,
                  'id',
                  alternateLocation.LocationId
                );
                if (filteredItem) {
                  filteredLocs.push(item);
                }
              }
            }
          );

          $scope.filteredLocations = ctrl.groupLocations(filteredLocs);

          $scope.alternateOptionsDDL = {
            data: $scope.filteredLocations,
            group: 'GroupOrder',
            sort: { field: 'SortingIndex', dir: 'asc' },
          };
        }
      }
    };
    ctrl.cleanDeletedLocations = function () {
      var cleanLocations = [];
      angular.forEach($scope.tempPerson.PatientLocations, function (loc) {
        if (loc.ObjectState != saveStates.Delete) {
          cleanLocations.push(loc);
        }
      });
      $scope.tempPerson.PatientLocations = cleanLocations;
    };
    $scope.removePatientLocation = function (location) {
      var index = listHelper.findIndexByFieldValue(
        $scope.tempPerson.PatientLocations,
        'LocationId',
        location.LocationId
      );
      switch ($scope.tempPerson.PatientLocations[index].ObjectState) {
        case saveStates.Update:
        case saveStates.None:
          //if its an old primary, we set to alt in event of patient activity
          $scope.tempPerson.PatientLocations[index].IsPrimary = false;
          if ($scope.tempPerson.PatientLocations[index].PatientActivity) {
            $scope.tempPerson.PatientLocations[index].ObjectState =
              saveStates.Update;
          } else {
            $scope.tempPerson.PatientLocations[index].ObjectState =
              saveStates.Delete;
          }
          break;
        default:
          $scope.tempPerson.PatientLocations.splice(index, 1);
          break;
      }
      $scope.updateAlternateOptionsList();
    };
    $scope.addUpdatePatientLocations = function (location) {
      if (location != undefined) {
        var foundNew = _.filter(
          $scope.tempPerson.PatientLocations,
          function (loc) {
            return loc.LocationId == location;
          }
        );
        if (foundNew.length > 0) {
          foundNew[0].ObjectState =
            foundNew[0].ObjectState != saveStates.Add
              ? saveStates.Update
              : saveStates.Add;
        } else {
          $scope.tempPerson.PatientLocations.push(
            ctrl.createNewAlternateLocation(location)
          );
        }
      }
      $scope.updateAlternateOptionsList();
    };
    ctrl.updatePrimaryLocation = function (prefLocation, oldLocation) {
      if (prefLocation != undefined) {
        var foundNew = _.filter(
          $scope.tempPerson.PatientLocations,
          function (loc) {
            return loc.LocationId == prefLocation;
          }
        );
        if (foundNew.length > 0) {
          if (!foundNew[0].IsPrimary) {
            foundNew[0].IsPrimary = true;
            foundNew[0].ObjectState =
              foundNew[0].ObjectState != saveStates.Add
                ? saveStates.Update
                : saveStates.Add;
            $scope.selectedLocation = ctrl.lookupLocation(
              foundNew[0].LocationId
            );
          }
        } else {
          var newPrimary = ctrl.createNewPrimaryLocation(prefLocation);
          $scope.tempPerson.PatientLocations.push(newPrimary);
          $scope.selectedLocation = ctrl.lookupLocation(newPrimary.LocationId);
        }

        $scope.valid = true;
      }
      if (oldLocation != undefined) {
        var foundOld = _.filter(
          $scope.tempPerson.PatientLocations,
          function (loc) {
            return loc.LocationId == oldLocation;
          }
        );
        if (foundOld.length > 0) {
          //this handles creating an alt location if old primary has activity
          //also just removes in other situations
          $scope.removePatientLocation(foundOld[0]);
        }
      }
      $scope.updateAlternateOptionsList();
    };
    ctrl.createNewPrimaryLocation = function (id) {
      return {
        PatientId: $scope.currentPatientId ? $scope.currentPatientId : '',
        LocationId: '' + id,
        IsPrimary: true,
        ObjectState: saveStates.Add,
        PatientActivity: false,
        LocationName: ctrl.locationName(id),
      };
    };
    ctrl.createNewAlternateLocation = function (id) {
      return {
        PatientId: $scope.currentPatientId ? $scope.currentPatientId : '',
        LocationId: '' + id,
        IsPrimary: false,
        ObjectState: saveStates.Add,
        PatientActivity: false,
        LocationName: ctrl.locationName(id),
      };
    };
    //#endregion
    //#region initialize
    ctrl.isDoneLoading = function () {
      return (
        !ctrl.loadingProviders && !ctrl.loadingLocations && !$scope.loading
      );
    };
    ctrl.initializeData = function () {
      $scope.setLocation();
      $scope.changedDentist();
      $scope.changedHygienist();
      $scope.updateAlternateOptionsList();
      ctrl.updateLocationNames();
      ctrl.checkPreferredProviders();
      // if we are on the Summary tab check the providers and show modal
      if (
        $routeParams.tab === 'Profile' &&
        $routeParams.Category === 'Summary' &&
        $scope.editing === false
      ) {
        ctrl.confirmInvalidProviders();
      }

      $scope.doneLoading = ctrl.isDoneLoading();
      return $q.resolve();
    };

    ctrl.loadPatient = function () {
      var deferred = $q.defer();
      if ($scope.currentPatientId != null) {
        $scope.doneLoading = false;
        var initialDependancies = [];
        initialDependancies.push(ctrl.getLocations());
        initialDependancies.push($scope.getPatient());
        $q.all(initialDependancies).then(function () {
          ctrl.initializeData();
          deferred.resolve();
        });
      } else {
        $scope.doneLoading = true;
        deferred.resolve();
      }
      return deferred.promise;
    };
    ctrl.loadData = function () {
      if ($scope.currentPatientId != null) {
        $scope.doneLoading = false;
        var initialDependancies = [];
        initialDependancies.push(ctrl.getLocations());
        initialDependancies.push(ctrl.getPersonData());
        initialDependancies.push(ctrl.getProviders());
        $q.all(initialDependancies).then(function () {
          ctrl.initializeData();
        });
      } else {
        $scope.doneLoading = true;
      }
    };
    ctrl.isInitialProviderLoad = true;
    ctrl.loadData();
    //#endregion
  },
]);
