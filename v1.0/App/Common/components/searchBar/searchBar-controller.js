'use strict';

angular.module('common.controllers').controller('SearchBarController', [
  '$scope',
  '$rootScope',
  '$uibModal',
  'PatientServices',
  'localize',
  '$timeout',
  '$location',
  'toastrFactory',
  'patSecurityService',
  'GlobalSearchServices',
  'GlobalSearchFactory',
  'SearchService',
  'tabLauncher',
  'PatientValidationFactory',
  'ListHelper',
  'PersonFactory',
  'NewLocationsService',
  'userSettingsDataService',
  'FeatureService',
  function (
    $scope,
    $rootScope,
    $uibModal,
    patientServices,
    localize,
    $timeout,
    $location,
    toastrFactory,
    patSecurityService,
    globalSearchServices,
    globalSearchFactory,
    searchService,
    tabLauncher,
    patientValidationFactory,
    listHelper,
    personFactory,
    locationsService,
    userSettingsDataService,
    featureService
  ) {
    var ctrl = this;
    $scope.PatientWorkFlowEnabled = false;
    $scope.getPracticeSettings = function () {
      featureService.isEnabled('DevelopmentMode').then(res => {
        $scope.PatientWorkFlowEnabled = res;
      });
    };
    // does the user have access to search or has value been passed
    $scope.checkIfAuthorized = function () {
      $scope.amfa = $scope.authZ ? $scope.authZ : '';
    };
    $scope.checkIfAuthorized();
    $scope.$watch('authZ', $scope.checkIfAuthorized);

    if (_.isNil($scope.onSelect)) {
      $scope.onSelect = ctrl.doNothing;
    }

    // has the user been authenticated
    $scope.hasAuthenticated = false;
    // scope vars
    $scope.initializeSearch = function () {
      // initial take amount
      $scope.takeAmount = 45;
      // initial limit (rows showing)
      $scope.limit = 15;
      $scope.limitResults = true;
      // Empty string for search
      $scope.searchTerm = _.isNil($scope.defaultSearchTerm)
        ? ''
        : $scope.defaultSearchTerm;
      //current searchString
      $scope.searchString = '';
      // Set the default search variables
      $scope.resultCount = 0;
      // to hold result list
      $scope.searchResults = [];
      // Search timeout queue
      $scope.searchTimeout = null;
      // display recents switch
      $scope.showRecents = false;
      // display add person link
      $scope.showAddPerson = false;

      $scope.appointmentView = $scope.baseId === 'patientUnscheduledSearch';

      $scope.accountNumberlabel = localize.getLocalizedString('ACCT.# ');
    };
    $scope.initializeSearch();
    $scope.noSearchResults = false;

    // Boolean to display search loading gif
    $scope.searchIsQueryingServer = false;
    // Boolean to include inactive patients in search (not active yet)
    $scope.includeInactivePatients = false;
    // Boolean to display most recent loading gif
    $scope.loadingMostRecent = false;

    // Optional placeholder. If not present, use default placeholder of {{ ::'Search' | i18n }}
    $scope.placeholder = _.isNil($scope.placeholderText)
      ? localize.getLocalizedString('Search')
      : $scope.placeholderText;

    // Setup the sort columns and set the default
    $scope.sortCol = 'LastName';
    var sortOrders = {
      LastName: ['LastName', 'FirstName'],
      '-LastName': ['-LastName', '-FirstName'],
      FirstName: ['FirstName', 'LastName'],
      '-FirstName': ['-FirstName', '-LastName'],
    };
    $scope.sort = sortOrders[$scope.sortCol];

    //#region recents
    ctrl.saveMostRecentOnSuccess = function () {
      //var recentPerson = res.Value;
      //TODO get the list again?
      // TODO, can we just add this to the list and remove last...
    };

    ctrl.saveMostRecentOnError = function () {
      // TODO...remove error notification
      //toastrFactory.error(localize.getLocalizedString('Failed to save the most {0}. ', ['most recent']), localize.getLocalizedString('Server Error'));
    };

    $scope.saveMostRecent = function (personId) {
      globalSearchFactory.SaveMostRecentPerson(personId);
    };

    $scope.displayRecents = function () {
      if (!$scope.recents) {
        ctrl.getMostRecent();
      }
      $scope.showRecents = true;
      $scope.showAddPerson = true;
      $scope.searchResults = angular.copy($scope.recents);
    };
    ctrl.getMostRecent = function () {
      $scope.loadingMostRecent = true;
      $scope.recents = globalSearchFactory.MostRecentPersons();
      // If chosen filter out the current patient
      if ($scope.currentPatientId) {
        $scope.recents = _.filter($scope.recents, function (p) {
          return p.PatientId !== $scope.currentPatientId;
        });
      }
    };

    // Do not call getMostRecent here ... why might you ask?  Because this code runs before the common js file
    // for some reason and that file loads the locations needed for this calls api permissions.
    //ctrl.getMostRecent();

    //#endregion
    $scope.$on('soar:loading-most-recent-list', function () {
      $scope.getPracticeSettings();
    });
    // reset to empty string for search
    $scope.$on('$routeChangeStart', function (next, current) {
      $scope.showRecents = false;
      $scope.showAddPerson = false;
      $scope.loadingMostRecent = true;
      $scope.initializeSearch();
      ctrl.getMostRecent();
    });

    // broadcast to refresh list when there is no route change
    // TODO SG - can i combine with above?
    $scope.$on('soar:refresh-most-recent', function () {
      $scope.showRecents = false;
      $scope.showAddPerson = false;
      $scope.loadingMostRecent = true;
      $scope.initializeSearch();
      ctrl.getMostRecent();
    });
    $scope.validSearch = function (searchString) {
      // if format XXX- allow search
      var validPhoneRegex = new RegExp(/^[0-9]{3}?\-$/);
      if (validPhoneRegex.test(searchString)) {
        return true;
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

      // if format X or XX or XXX or XXX.. allow search
      var phoneRegex = new RegExp(/^[0-9]{1,9}?$/);
      if (phoneRegex.test(searchString)) {
        return true;
      }
      return true;
    };

    // listening for changes to searchIsQueryingServer, if it flips from true to false we know that we are done with a search,
    // if the user has entered more characters since the last search was initiated, we need to re-search with the last string
    $scope.$watch('searchIsQueryingServer', function (nv, ov) {
      if (
        nv === false &&
        ov === true &&
        $scope.searchTerm &&
        !angular.equals($scope.searchTerm, ctrl.searchStringFromLastQuery)
      ) {
        // searchString has to be cleared out in order get past a check in the activateSearch function
        $scope.searchString = '';
        $scope.activateSearch($scope.searchTerm);
      }
    });

    // Watch the input
    $scope.$watch('searchTerm', function (nv, ov) {
      if (nv && nv.length > 0 && nv != ov) {
        $scope.showRecents = false;
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

    // use patSecurity to find out if this user has access
    $scope.authPatientSearchAccess = function () {
      return patSecurityService.IsAuthorizedByAbbreviation(
        'soar-per-perdem-search'
      );
    };
    $scope.authAccess = function () {
      if (!$scope.authPatientSearchAccess()) {
        $scope.hasSearchAccess = false;
        toastrFactory.error(
          'User is not authorized to access this area.',
          'Not Authorized'
        );
        $scope.hasAuthenticated = true;
        $location.path(_.escape('/'));
      } else {
        $scope.hasSearchAccess = true;
        $scope.hasAuthenticated = true;
      }
    };

    // Watch the sortCol and change the sort accordingly NOT CURRENTLY USED
    $scope.$watch('sortCol', function () {
      $scope.sort = sortOrders[$scope.sortCol];

      // On sort, need to sent to server and have it sort if we are paged!
      if ($scope.resultCount > $scope.searchResults.length) {
        $scope.searchResults = [];
        $scope.resultCount = 0;

        // Need to research on sort column change, now that results are paged
        $scope.search();
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
        if ($scope.holdSearchTerm && $scope.resultCount == 0) {
          $scope.selected = null;
        }

        return;
      }
      // set variable to indicate status of search
      $scope.searchIsQueryingServer = true;
      ctrl.searchStringFromLastQuery = angular.copy($scope.searchString);

      var searchParams = {
        searchFor: $scope.searchString,
        skip: $scope.searchResults.length,
        take: $scope.takeAmount,
        sortBy: $scope.sortCol,
        includeInactive: $scope.includeInactive,
      };
      patientServices.Patients.search(
        searchParams,
        $scope.searchGetOnSuccess,
        $scope.searchGetOnError
      );
    };

    // Remove Duplicates
    $scope.removeDuplicateValue = function (myArray) {
      var newArray = [];

      angular.forEach(myArray, function (value, key) {
        var exists = false;
        angular.forEach(newArray, function (val2, key) {
          if (angular.equals(value.PatientId, val2.PatientId)) {
            exists = true;
          }
        });
        if (exists === false && value.PatientId !== '') {
          newArray.push(value);
        }
      });

      return newArray;
    };

    $scope.searchGetOnSuccess = function (res) {
      $scope.resultCount = res.Count;
      // Set the patient list
      $scope.searchResults = $scope.searchResults.concat(res.Value);
      $scope.searchResults = $scope.removeDuplicateValue($scope.searchResults);
      // If chosen filter out the current patient
      if ($scope.currentPatientId) {
        $scope.searchResults = _.filter($scope.searchResults, function (p) {
          return p.PatientId !== $scope.currentPatientId;
        });
      }
      // set variable to indicate whether any results
      $scope.noSearchResults = $scope.resultCount === 0;
      //TODO remove
      //$scope.addPhones();
      // add ViewAll if needed
      $scope.setViewAllMessage();
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
      if (!$scope.hasAuthenticated) {
        $scope.authAccess();
      }
      if ($scope.searchString != searchTerm && $scope.hasSearchAccess == true) {
        // reset limit when search changes
        $scope.limit = 15;
        $scope.limitResults = true;
        $scope.searchString = searchTerm;
        $scope.resultCount = 0;
        $scope.searchResults = [];
        $scope.search();
      }
    };

    ctrl.doNothing = function (item) {
      // no really!!
    };

    ctrl.showApptLocationWarningtModal = function () {
      $scope.apptLocationWarningModal = $uibModal.open({
        templateUrl:
          'App/Common/components/appointment-status/modal/invalid-patient-appt-location-warning.html',
        scope: $scope,
        controller: function () {
          $scope.close = function () {
            $scope.apptLocationWarningModal.close();
          };
          $scope.locationDisplayName = $scope.aptLocation.NameLine1;
        },
        size: 'md',
        windowClass: 'center-modal',
      });
    };

    $scope.isApptLocationValidPatientLocation = function (locations) {
      return locations.LocationId === $scope.aptLocation.LocationId;
    };

    // Handle click event to view / edit patient
    // NOTE, if this becomes universal search will have to base location on type of search
    $scope.viewResult = function (result, forced) {
      $scope.showAddPerson = false;
      if (result && result.PatientId && !$scope.fromAptModal) {
        //patientValidationFactory.SetCheckingUserPatientAuthorization(true);
        patientValidationFactory
          .PatientSearchValidation(result)
          .then(function (res) {
            var patientInfo = res;
            //console.log(res);
            if (
              !patientInfo.authorization
                .UserIsAuthorizedToAtLeastOnePatientLocation
            ) {
              patientValidationFactory.LaunchPatientLocationErrorModal(
                patientInfo
              );
              //patientValidationFactory.SetCheckingUserPatientAuthorization(false);
              $scope.searchTerm = '';
              $scope.selected = null;
              return;
            } else {
              $scope.proceedToView(result, forced);
            }
            // patientValidationFactory.SetCheckingUserPatientAuthorization(false);
          });
      } else if ($scope.fromAptModal) {
        if (result.PatientId) {
          personFactory
            .getPatientOverviewForApptModal(result.PatientId)
            .then(function (res) {
              if (res.Value) {
                let apptLocationIsAPatientLocation = res.Value.PatientLocations.some(
                  $scope.isApptLocationValidPatientLocation
                );
                if (!apptLocationIsAPatientLocation) {
                  ctrl.showApptLocationWarningtModal();
                  $scope.searchTerm = '';
                  $scope.selected = null;
                } else {
                  patientValidationFactory.SetPatientData(res.Value);

                  var patientData = patientValidationFactory.GetPatientData();
                  patientValidationFactory
                    .PatientSearchValidation(result)
                    .then(function (patient) {
                      var patientInfo = patient;

                      // get the patients locations
                      var patientLocations = patientData.PatientLocations;

                      // if the logged in user locations do not match any of the patients locations throw the window
                      var hasAccessToLocation = false;

                      // need to check if the search is ever used with the old appointment modal. I do not think it is. We will have to see.
                      let locs = _.cloneDeep(locationsService.locations);
                      for (let i = 0; i < locs.length; i++) {
                        for (let j = 0; j < patientLocations.length; j++) {
                          if (
                            locs[i].LocationId ===
                            patientLocations[j].LocationId
                          ) {
                            hasAccessToLocation = true;
                          }
                        }
                      }
                      if (!hasAccessToLocation) {
                        //manually get and assign primary location name and primary phone name to bypass the logged in user authorization for PatientSearchValidation
                        var patientLocation = listHelper.findItemByFieldValue(
                          patientData.PatientLocations,
                          'IsPrimary',
                          true
                        );
                        if (patientLocation) {
                          var patientPreferredLocation = listHelper.findItemByFieldValue(
                            locs,
                            'LocationId',
                            patientLocation.LocationId
                          );
                          if (patientPreferredLocation) {
                            patientInfo.authorization.PatientPrimaryLocationName =
                              patientPreferredLocation.NameLine1;
                            patientInfo.authorization.PatientPrimaryLocationPhone =
                              patientPreferredLocation.PrimaryPhone;
                          } else {
                            patientInfo.authorization.PatientPrimaryLocationName =
                              '';
                            patientInfo.authorization.PatientPrimaryLocationPhone =
                              '';
                          }
                          patientValidationFactory.LaunchMultiLocationPatientLocationErrorModal(
                            patientInfo,
                            $scope.aptLocation
                          );
                          $scope.searchTerm = '';
                          $scope.selected = null;
                        }
                      } else {
                        $scope.proceedToView(result, forced);
                      }
                    });
                }
              } else {
                patientValidationFactory.LaunchMultiLocationPatientLocationErrorModal(
                  result,
                  $scope.aptLocation
                );
                $scope.searchTerm = '';
                $scope.selected = null;
              }
            });
        }
      } else if (!patientValidationFactory.CheckingUserPatientAuthorization) {
        //console.log("Its false");
        $scope.proceedToView(result, forced);
      }
    };

    $scope.proceedToView = function (result, forced) {
      $scope.saveMostRecent(result.PatientId);
      if ($scope.selectMode) {
        $scope.selected = result;

        if (forced == true) {
          $scope.searchString =
            $scope.selected.FirstName + ' ' + $scope.selected.LastName;
        }
        $scope.searchTerm = $scope.holdSearchTerm
          ? $scope.selected.FirstName + ' ' + $scope.selected.LastName
          : '';
        // if search is from document manager,
        // pass the selected patient only if patient validation has passed
        if ($scope.documentPatients) {
          $scope.$emit('patientSelected', $scope.selected);
        }
      } else {
        if (result) {
          $scope.initializeSearch();
          let patientPath = 'Patient/';
          $location.path(
            _.escape(patientPath + result.PatientId + '/Overview/')
          );
        }
      }
    };

    $scope.$watch('selected', function (nv, ov) {
      if (!nv && ov && !$scope.holdSearchTerm) {
        $scope.searchTerm = '';
      }
    });

    //Note, we may need to adjust limit
    $scope.viewAll = function () {
      $scope.limitResults = false;
      $scope.limit = 500;
      $scope.takeAmount = 500;
      // call search directly since the search parameter hasn't changed
      $scope.search();
      $scope.$broadcast('setFocus', {});
    };

    $scope.setViewAllMessage = function () {
      if ($scope.limitResults === true && $scope.resultCount > $scope.limit) {
        $scope.viewAllMessage = 'View all ' + $scope.resultCount + ' results';
      } else {
        $scope.viewAllMessage = '';
      }
    };

    $scope.clear = function () {
      $scope.searchTerm = '';
      $scope.selected = null;
    };
    // capture event when list changes
    $scope.$on('soar:loading-most-recent-list', function (e, loading, results) {
      if (loading == false) {
        $scope.recents = results;

        // If chosen filter out the current patient
        if ($scope.currentPatientId) {
          $scope.recents = _.filter($scope.recents, function (p) {
            return p.PatientId !== $scope.currentPatientId;
          });
        }
        if ($scope.showRecents == true) {
          $timeout(function () {
            $scope.searchResults = angular.copy($scope.recents);
          }, 0);
        }
      }
      $scope.loadingMostRecent = loading;
    });

    //#region page results
    $scope.viewResults = function (searchParam) {
      if (searchParam && $scope.headerSearch) {
        $scope.initializeSearch();
        $scope.searchIsQueryingServer = false;
        // if we dont encode any forward slashes in the search string, we will get sent to the wrong route
        $location.path(
          _.escape('/Patient/Search/' + searchParam.replace(/\//g, '%2F'))
        );
        //$timeout(function () {
        //    searchService.setTerm(searchParam);
        //}, 0);
      }
    };

    $scope.addNewPatient = function () {
      $location.path(_.escape('/Patient/Create/'));
    };

    $scope.openPatientTab = function (patientId) {
      $scope.saveMostRecent(patientId);
      $scope.initializeSearch();
      ctrl.getMostRecent();
      $scope.loadingMostRecent = false;
      let patientPath = '#/Patient/';
      tabLauncher.launchNewTab(
        _.escape(patientPath + patientId + '/Overview/')
      );
    };

    $scope.addPerson = function () {
      let patientPath = '#/Patient/';
      tabLauncher.launchNewTab(_.escape(patientPath + 'Create/'));
    };
    $scope.addAPerson = function () {
      let patientPath = '#/Patient/';
      tabLauncher.launchNewTab(_.escape(patientPath + 'Register/'));
    };
    //#endregion
  },
]);
