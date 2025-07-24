'use strict';

angular.module('Soar.Patient').controller('PatientSearchController', [
  '$scope',
  'PatientServices',
  '$timeout',
  '$location',
  'localize',
  'toastrFactory',
  'SearchService',
  'patSecurityService',
  '$routeParams',
  'UsersFactory',
  'PatientValidationFactory',
  'PersonFactory',
  'userSettingsDataService',
  function (
    $scope,
    patientServices,
    $timeout,
    $location,
    localize,
    toastrFactory,
    searchService,
    patSecurityService,
    $routeParams,
    usersFactory,
    patientValidationFactory,
    personFactory,
    userSettingsDataService
  ) {
    var ctrl = this;
    // scope vars
    $scope.initializeSearch = function () {
      // decoding eny encoded forward slashes that might be part of the search string
      $scope.searchString = $routeParams.searchString.replace(/%2F/g, '/');

      ctrl.initialized = false;
      // does the user have access to search
      $scope.hasSearchAccess = null;
      // has the user been authenticated
      $scope.hasAuthenticated = false;
      // initial take amount
      $scope.takeAmount = 45;
      // initial limit (rows showing)
      $scope.limit = 15;
      $scope.limitResults = true;
      // Empty string for search
      $scope.searchTerm = '';
      //current searchString
      //$scope.searchString = '';
      // Set the default search variables
      $scope.resultCount = 0;
      // to hold result list
      $scope.searchResults = [];
      // Search timeout queue
      $scope.searchTimeout = null;

      // indicator that there are no results
      $scope.noSearchResults = false;
      // Boolean to display search loading gif
      $scope.searchIsQueryingServer = false;
      // Boolean to include inactive patients in search (not active yet)
      $scope.includeInactivePatients = false;
      // Setup the sort columns and set the default
      $scope.sortCol = 'LastName';
      ctrl.sortOrders = {
        LastName: ['LastName', 'FirstName'],
        '-LastName': ['-LastName', '-FirstName'],
        FirstName: ['FirstName', 'LastName'],
        '-FirstName': ['-FirstName', '-LastName'],
      };
      $scope.sort = ctrl.sortOrders[$scope.sortCol];

      ctrl.initialized = true;
    };
    $scope.initializeSearch();

    // filter for search results
    //$scope.filter = {
    //    IsPatient: true,
    //    IsNotAPatient: true
    //};

    //#region authorization
    // use patSecurity to find out if this user has access
    $scope.authPatientSearchAccess = function () {
      return patSecurityService.IsAuthorizedByAbbreviation(
        'soar-per-perdem-search'
      );
    };
    $scope.authAccess = function () {
      if (!$scope.authPatientSearchAccess()) {
        toastrFactory.error(
          'User is not authorized to access this area.',
          'Not Authorized'
        );
        event.preventDefault();
        $location.path('/');
      }
    };
    $scope.authAccess();
    //#endregion

    //#region sorting
    // Watch the sortCol and change the sort accordingly
    $scope.$watch('sortCol', function () {
      $scope.sort = ctrl.sortOrders[$scope.sortCol];

      // On sort, need to sent to server and have it sort if we are paged!
      if ($scope.resultCount > $scope.searchResults.length) {
        $scope.searchResults = [];
        $scope.resultCount = 0;

        // Need to research on sort column change, now that results are paged
        $scope.search();
      }
    });
    //#endregion

    //#region search
    // Perform the patient search
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

      var searchParams = {
        searchFor: $scope.searchString,
        skip: $scope.searchResults.length,
        take: $scope.takeAmount,
        sortBy: $scope.sortCol,
        includeInactive: $scope.includeInactivePatients,
      };
      patientServices.Patients.search(
        searchParams,
        $scope.searchGetOnSuccess,
        $scope.searchGetOnError
      );

      // conditionally add the IsPatient param
      //if ($scope.isPatientSearchParam != null) {
      //    searchParams.IsPatient = $scope.isPatientSearchParam;
      //}
    };

    $scope.searchGetOnSuccess = function (res) {
      $scope.resultCount = res.Count;
      // Set the patient list
      $scope.searchResults = $scope.searchResults.concat(res.Value);
      // set variable to indicate whether any results
      $scope.noSearchResults = $scope.resultCount === 0;
      // reset  variable to indicate status of search = false
      $scope.searchIsQueryingServer = false;
      // set the provider name if has PreferredDentist
      $scope.getProviders();
      // message if more results than 15
      $scope.setViewAllMessage();
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

    $scope.search();

    // capture search term from search bar when notified
    searchService.observeSearchTerm().then(null, null, function (searchTerm) {
      if ($scope.searchString != searchTerm) {
        $scope.searchString = searchTerm;
        $scope.resultCount = 0;
        $scope.searchResults = [];
        $scope.search();
      }
    });

    //#endregion

    //#region   load Providers

    $scope.getProviders = function () {
      $scope.loadingProviders = true;
      usersFactory.Users().then(function (res) {
        $scope.providers = res.Value;
        $scope.loadingProviders = false;
        ctrl.addProviderNameToList();
      });
    };

    ctrl.addProviderNameToList = function () {
      angular.forEach($scope.searchResults, function (person) {
        person.PreferredProvider = usersFactory.UserName(
          person.PreferredDentist
        );
      });
    };

    //#endregion

    //#region View All

    //Note, we may need to adjust limit
    $scope.viewAll = function () {
      $scope.limitResults = false;
      $scope.limit = 500;
      $scope.takeAmount = 500;
      $scope.search();
    };

    $scope.viewAllMessage = '';
    $scope.setViewAllMessage = function () {
      if ($scope.limitResults === true && $scope.resultCount > $scope.limit) {
        $scope.viewAllMessage = localize.getLocalizedString(
          'View all {0} results',
          [$scope.resultCount]
        );
      } else {
        $scope.viewAllMessage = '';
      }
    };

    // Navigate to patient's profile
    $scope.navToPatientProfile = function (person) {
      if (person.PatientId) {
        patientValidationFactory
          .PatientSearchValidation(person)
          .then(function (res) {
            var patientInfo = res;
            if (
              !patientInfo.authorization
                .UserIsAuthorizedToAtLeastOnePatientLocation
            ) {
              patientValidationFactory.LaunchPatientLocationErrorModal(
                patientInfo
              );
              return;
            } else {
              let patientPath = '/Patient/';
              $location.path(patientPath + person.PatientId + '/Overview');
            }
          });
      }
    };

    //#endregion

    //// Handle click event to view / edit patient
    //$scope.viewPatient = function (patientId) {
    //    $location.path('Patient/Dashboard/' + patientId);
    //};

    // If isPatientSearchParam is null do not use in search

    //$scope.isPatientSearchParam = null;
    //$scope.$watch('filter.IsNotAPatient', function(nv, ov) {
    //    $scope.filterList();
    //});
    //$scope.$watch('filter.IsPatient', function (nv, ov) {
    //    $scope.filterList();
    //});

    //// filter list
    //$scope.filterList = function() {
    //    var executeSearch = true;
    //    // only add the IsPatient param if one is unchecked
    //    if ($scope.filter.IsPatient == true && $scope.filter.IsNotAPatient == false) {
    //        $scope.isPatientSearchParam = true;
    //    } else if ($scope.filter.IsPatient == false && $scope.filter.IsNotAPatient == true) {
    //        $scope.isPatientSearchParam = false;
    //    } else if ($scope.filter.IsPatient == true && $scope.filter.IsNotAPatient == true) {
    //        $scope.isPatientSearchParam = null;
    //    } else if ($scope.filter.IsPatient == false && $scope.filter.IsNotAPatient == false) {
    //        $scope.isPatientSearchParam = null;
    //        executeSearch = false;
    //    };

    //    // we only do the search if the filter has changed AND one of the values is true
    //    if ($scope.searchTimeout) {
    //        $timeout.cancel($scope.searchTimeout);
    //    }

    //    if (executeSearch) {
    //        $scope.searchTimeout = $timeout(function () {
    //            // Reset the counts and list
    //            $scope.patientCount = 0;
    //            $scope.fullPatientList = [];
    //            $scope.search();
    //        }, 500);
    //    } else {
    //        $scope.patientCount = 0;
    //        $scope.fullPatientList = [];
    //    }

    //};
  },
]);
