'use strict';

angular
  .module('common.controllers')
  .controller('ContactDetailsSearchBarController', [
    '$scope',
    '$rootScope',
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
    ContactDetailsSearchBarController,
  ]);
function ContactDetailsSearchBarController(
  $scope,
  $rootScope,
  patientServices,
  localize,
  $timeout,
  $location,
  toastrFactory,
  patSecurityService,
  globalSearchServices,
  globalSearchFactory,
  searchService,
  tabLauncher
) {
  BaseCtrl.call(this, $scope, 'ContactDetailsSearchBarController');

  var ctrl = this;

  // does the user have access to search or has value been passed
  $scope.checkIfAuthorized = function () {
    $scope.amfa = $scope.authZ ? $scope.authZ : '';
  };
  $scope.checkIfAuthorized();

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
    $scope.searchTerm = '';
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
    $scope.patientInfo.AccountMembers = [];
    $scope.patientInfo.AccountEmails = [];
  };

  $scope.initializeSearch();
  $scope.noSearchResults = false;
  $scope.addPlaceholder =
    $scope.baseId == 'Phone' ? 'Add a Phone Number' : 'Add an Email';
  $scope.addLabel =
    $scope.baseId == 'Phone' ? '  Create a new number' : '  Create a new email';

  $scope.displayResults = function () {
    //if (!$scope.searchResults || $scope.searchResults.length == 0) {
    var filteredResults = [];
    if ($scope.baseId == 'Email') {
      var allResults = angular.copy($scope.patientInfo.AccountEmails);
      filteredResults = allResults.filter(function (result) {
        for (var i in $scope.selected) {
          if (
            result.AccountEmailId === $scope.selected[i].AccountEmailId ||
            result.AccountEmailId === $scope.selected[i].PatientEmailId ||
            result.Email === $scope.selected[i].Email
          ) {
            return false;
          }
        }
        return true;
      });
    } else {
      var allResults = angular.copy($scope.patientInfo.AccountMembers);
      filteredResults = allResults.filter(function (result) {
        for (var i in $scope.selected) {
          if (
            result.PhoneReferrerId === $scope.selected[i].PhoneReferrerId ||
            result.PhoneReferrerId === $scope.selected[i].ContactId ||
            result.PhoneNumber === $scope.selected[i].PhoneNumber
          ) {
            return false;
          }
        }
        return true;
      });
    }
    $scope.searchResults = filteredResults;
    //}
  };

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
      $location.path('/');
    } else {
      $scope.hasSearchAccess = true;
      $scope.hasAuthenticated = true;
    }
  };

  $scope.doNothing = function (item) {};

  $scope.addAccountMemberContactDetail = function (item) {
    item.added = true;
    if ($scope.baseId == 'Phone') {
      $rootScope.$broadcast('add-account-member-phone-number', item);
    } else {
      $rootScope.$broadcast('add-account-member-email-address', item);
    }
  };

  $scope.addContactDetail = function () {
    if ($scope.baseId == 'Phone') {
      $rootScope.$broadcast('add-phone-number');
    } else {
      $rootScope.$broadcast('add-email-address');
    }
  };

  //#endregion
}

ContactDetailsSearchBarController.prototype = Object.create(BaseCtrl.prototype);
