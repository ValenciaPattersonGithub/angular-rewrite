'use strict';

angular.module('Soar.BusinessCenter').controller('UserGroupsController', [
  '$scope',
  '$timeout',
  '$filter',
  'toastrFactory',
  'localize',
  'patSecurityService',
  'StaticData',
  'UserServices',
  '$routeParams',
  '$rootScope',
  'PatientValidationFactory',
  'ModalFactory',
  'referenceDataService',
  function (
    $scope,
    $timeout,
    $filter,
    toastrFactory,
    localize,
    patSecurityService,
    staticData,
    userServices,
    $routeParams,
    $rootScope,
    patientValidationFactory,
    modalFactory,
    referenceDataService
  ) {
    var ctrl = this;
    var emptyClaimId = null;
    $scope.userGroupsSectionOpen = true;
    $scope.providerTypeDisabled = false;
    $scope.hasAppointmentsTooltip = '';

    $scope.initialize = function () {
      $scope.initializeSearch();
      $scope.editMode = $routeParams.userId ? true : false;
      $scope.savedProviderOnClaimsId = $scope.user.ProviderOnClaimsId;
    };
    $scope.initializeSearch = function () {
      if (angular.isUndefined($scope.user.ProviderOnClaimsRelationship)) {
        $scope.user.ProviderOnClaimsRelationship = 1;
        $scope.user.ProviderOnClaimsId = $routeParams.userId;
        $scope.providerError = false;
      }
      if (
        $scope.user.ProviderOnClaimsId != null &&
        $scope.user.ProviderOnClaimsId != emptyClaimId
      ) {
        var users = referenceDataService.get(
          referenceDataService.entityNames.users
        );
        var user = _.find(users, { UserId: $scope.user.ProviderOnClaimsId });
        if (!_.isNil(user)) {
          $scope.searchTerm = user.FirstName + ' ' + user.LastName;
          $scope.disableProviderOnClaims = true;
          $scope.providerError = false;
        } else {
          $scope.searchTerm = '';
          $scope.disableProviderOnClaims = false;
          $scope.providerError = false;
        }
      } else {
        $scope.searchTerm = '';
        $scope.disableProviderOnClaims = false;
      }
      //current searchString
      $scope.searchString = '';
      // Set the default search variables
      $scope.resultCount = 0;
      // to hold result list
      $scope.searchResults = [];
    };

    $scope.providerOnClaimsOptions = ['1', '2'];
    $scope.providerOnClaimsLabels = ['Self', 'Other'];

    if (!$scope.user.Color) {
      $scope.user.Color = '#7F7F7F';
    }

    $scope.providerTypes = [];
    staticData
      .ProviderTypes()
      .then(function (res) {
        $scope.providerTypes = res.Value;
        $scope.setDefaults();
      })
      .finally(function () {
        $timeout(function () {
          $scope.setPristine();
        }, 0);
      });

    $scope.departmentTypes = [];
    staticData.Departments().then(function (res) {
      $scope.departmentTypes = res.Value;
    });

    // capture department change
    $scope.departmentTypeChanged = function () {
      var selectedDepartment = $('#inpDepartmentType').data('kendoComboBox');
      $scope.setProviderType(selectedDepartment);
    };
    // get users for provider on claims

    $scope.getProvidersOnClaims = function () {
      $scope.loading = true;
      userServices.Providers.get($scope.userServicesGetSuccess);
    };

    $scope.selectResult = function (providerClaimUser) {
      $scope.searchTerm =
        providerClaimUser.UserDto.FirstName +
        ' ' +
        providerClaimUser.UserDto.LastName;
      $scope.user.ProviderOnClaimsId = providerClaimUser.UserDto.UserId;
      $scope.disableProviderOnClaims = true;
      $scope.providerError = false;
    };

    $scope.clearProviderClaimUser = function () {
      // $scope.initializeSearch();
      $scope.user.ProviderOnClaimsId = '';
      $scope.searchTerm = '';
      $scope.disableProviderClaim = false;
      $scope.disableProviderOnClaims = false;
      $scope.providerError = true;
    };

    $scope.ProviderTypeIdChanged = function (newValue) {
      $scope.getUserScheduleStatuses();
      var oldValue = $scope.user.ProviderTypeId;

      $scope.displayProviderQualifier = false;
      $scope.user.ProviderQualifierType = 0;
      if (newValue != '4' && newValue != '') {
        $scope.displayProviderQualifier = true;
        $scope.user.ProviderQualifierType = $scope.ProviderQualifier;
      }

      if (
        (oldValue == '4' || oldValue == '' || oldValue == null) &&
        newValue != '4' &&
        newValue != '' &&
        typeof newValue !== 'undefined'
      ) {
        var title = localize.getLocalizedString(
          'Notice - Monthly Subscription Fee Increase'
        );
        var message = localize.getLocalizedString(
          'Setting a user as a provider incurs an increase in the Practice monthly subscription fee. Please contact the Patterson Technology Center for details at (844) 426-2304.'
        );
        var button1Text = localize.getLocalizedString('Acknowledge');
        var button2Text = localize.getLocalizedString('Cancel');

        modalFactory
          .ConfirmModal(title, message, button1Text, button2Text)
          .then(
            function () {
              $scope.displayProviderQualifier = true;
              $scope.ProviderQualifier = 2;
              $scope.user.ProviderQualifierType = $scope.ProviderQualifier;
              return;
            },
            function () {
              $scope.user.ProviderTypeId = oldValue;
              $scope.displayProviderQualifier = false;
              $scope.user.ProviderQualifierType = 0;
            }
          );
      } else if (
        oldValue != '4' &&
        newValue == '4' &&
        $scope.editMode &&
        $scope.providerTypeDisabled
      ) {
        var title = localize.getLocalizedString('Warning');
        var message = localize.getLocalizedString(
          'This {0} cannot be changed because he/she has scheduled hours and/or scheduled appointments.',
          ['provider']
        );
        var button1Text = localize.getLocalizedString('Close');
        modalFactory
          .ConfirmModal(title, message, button1Text)
          .then(function () {
            $scope.user.ProviderTypeId = oldValue;
          });
      }
      if ($scope.user.ProviderTypeId == 4) {
        $scope.user.DentiCalPin = '';
      }
    };

    $scope.$watch('user.ProviderTypeId', function (newValue, oldValue) {
      if ($scope.editMode) {
        $scope.displayProviderQualifier = false;
        $scope.ProviderQualifier = 0;
        if (newValue != null && newValue != 4 && newValue != '') {
          $scope.displayProviderQualifier = true;
          $scope.ProviderQualifier = $scope.user.ProviderQualifierType;
        }
      }

      if (newValue == '4' || newValue === null || newValue === '') {
        // not a provider
        $scope.showProviderOnClaims = false;
        $scope.user.ProviderOnClaimsRelationship = 0;
        $scope.user.ProviderOnClaimsId = emptyClaimId;
      } else {
        $scope.showProviderOnClaims = true;
        if (newValue != oldValue) {
          $scope.user.ProviderOnClaimsRelationship = 1;
          $scope.user.ProviderOnClaimsId = emptyClaimId;
          $scope.providerError = false;
        }
        if ($scope.user.ProviderOnClaimsRelationship != 2) {
          $scope.user.ProviderOnClaimsRelationship = 1;
          $scope.user.ProviderOnClaimsId = emptyClaimId;
          $scope.providerError = false;
        }
      }
    });

    $scope.$watch(
      'user.ProviderOnClaimsRelationship',
      function (newValue, oldValue) {
        if (newValue == '1') {
          $scope.user.ProviderOnClaimsId = emptyClaimId;
          $scope.providerError = false;
        } else {
          $scope.user.ProviderOnClaimsId = $scope.savedProviderOnClaimsId;
        }

        if ($scope.user.ProviderTypeId == '4') {
          $scope.user.ProviderOnClaimsId = emptyClaimId;
        }
        if (newValue != oldValue && oldValue == 2) {
          $scope.searchTerm = '';
          // $scope.disableProviderClaim = false;
          $scope.disableProviderOnClaims = false;
        }
      }
    );

    $scope.displayProviderQualifier = false;
    //$scope.ProviderQualifier = 2;
    //$scope.user.ProviderQualifierType = 0;
    $scope.providerQualifierOptions = [2, 1];
    $scope.providerQualifierLabels = ['Full Time', 'Part Time'];
    $scope.$watch('ProviderQualifier', function (newValue, oldValue) {
      if ($scope.displayProviderQualifier) {
        $scope.user.ProviderQualifierType = $scope.ProviderQualifier;
      } else {
        $scope.user.ProviderQualifierType = 0;
      }
    });

    //users on success
    $scope.userServicesGetSuccess = function (res) {
      $scope.loading = false;
      $scope.providers = res.Value;
    };
    // capture provider type change
    $scope.providerTypeChanged = function () {
      //var selectedProviderType = $("#inpProviderType").data("kendoComboBox").value();
      //$scope.setSectionView(selectedProviderType);
      if ($scope.user.ProviderTypeId != '' || $scope.user.ProviderTypeId != 4) {
        $scope.showProviderOnClaims = true;
      }
    };

    // set the provider based on selection of department (on add only)
    $scope.setProviderType = function (selectedDepartment) {
      var selDepVal = selectedDepartment.value();
      var selDepText = selectedDepartment.text();

      if (selDepVal == '1' || selDepVal == '2' || selDepVal == '3') {
        // get the matching provider type and set as selected
        var matchingProvider = $filter('filter')($scope.providerTypes, {
          Name: selDepText,
        });
        if (matchingProvider) {
          $scope.user.ProviderTypeId = matchingProvider[0].Id;
          $scope.$apply();
        }
      }
    };

    // new user defaults
    $scope.setDefaults = function () {
      if ($scope.editMode == false && $scope.user.ProviderTypeId == null) {
        // provider type defaults to 'Not a provider'
        var defaultProviderType = $filter('filter')($scope.providerTypes, {
          Name: 'Not a Provider',
        });
        if (defaultProviderType) {
          $scope.user.ProviderTypeId = defaultProviderType[0].Id;
        }

        $scope.providerQualifier = 2;
        $scope.user.ProviderQualifierType = 0;
        $scope.displayProviderQualifier = false;
      }
    };

    // Perform the search
    $scope.search = function (term) {
      if (term === '') {
        userServices.getActiveUsers.get(
          $scope.searchGetOnSuccess,
          $scope.searchGetOnError
        );
        return;
      }
      if (!angular.isUndefined(term)) {
        $scope.searchResults = _.select($scope.searchResults, function (c) {
          return (
            _.toLower(c.UserDto.FirstName).indexOf(_.toLower(term)) !== -1 ||
            _.toLower(c.UserDto.LastName).indexOf(_.toLower(term)) !== -1
          );
        });
      }
    };

    $scope.searchGetOnSuccess = function (res) {
      $scope.resultCount = res.Value.length;
      // Set the Provider on Claims list
      $scope.searchResults = res.Value;

      for (var i = $scope.searchResults.length - 1; i >= 0; i--) {
        if ($scope.editMode == true) {
          if ($scope.searchResults[i].UserDto.UserId == $routeParams.userId) {
            $scope.searchResults.splice(i, 1);
          }
        }
      }

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
      if (
        $scope.searchString != searchTerm &&
        $scope.disableProviderClaim !== true
      ) {
        $scope.searchString = searchTerm;
        $scope.resultCount = 0;
        $scope.searchResults = [];
        $scope.search();
      }
    };

    $scope.displayResults = function () {
      $scope.searchIsQueryingServer = true;
      userServices.getActiveUsers.get(
        $scope.searchGetOnSuccess,
        $scope.searchGetOnError
      );
    };
    // set indicator for showing ids
    $scope.setSectionView = function (selectedProviderType) {
      if (
        selectedProviderType == '1' ||
        selectedProviderType == '2' ||
        selectedProviderType == '3' ||
        selectedProviderType == '5'
      ) {
        $scope.showIdentificationSection = true;
      } else {
        $scope.showIdentificationSection = false;
      }
    };

    $scope.setSectionView($scope.user.ProviderTypeId);
    $scope.initialize();

    //#endregion rx

    $scope.setProviderLoaded = function () {
      $rootScope.$broadcast('sendProviderLoaded', true);
    };

    $scope.$on('validateProviderOnClaims', function (events, args) {
      $scope.providerError = args;
      $scope.hasErrors = args;
    });

    $scope.$watch(
      'user.$$scheduleStatuses',
      function (nv) {
        if (nv) {
          $scope.getUserScheduleStatuses();
        }
      },
      true
    );

    $scope.getUserScheduleStatuses = function () {
      if (
        $scope.user &&
        $scope.user.$$scheduleStatuses &&
        $scope.user.$$scheduleStatuses.length > 0
      ) {
        angular.forEach(
          $scope.user.$$scheduleStatuses,
          function (userScheduleStatus) {
            if (
              userScheduleStatus.HasProviderAppointments ||
              userScheduleStatus.HasProviderRoomOccurrences
            ) {
              $scope.providerTypeDisabled = true;
            }
          }
        );
      } else {
        $scope.providerTypeDisabled = false;
      }
    };
  },
]);
