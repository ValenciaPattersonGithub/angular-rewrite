/// <reference path="../patient-insurance-info/patient-insurance-info.html" />
/// <reference path="../patient-insurance-info/patient-insurance-info.html" />
'use strict';

var app = angular.module('Soar.Patient');
app.controller('PatientAccountOptionController', [
  '$scope',
  '$rootScope',
  '$routeParams',
  '$filter',
  'localize',
  'ListHelper',
  '$timeout',
  'PatientServices',
  'toastrFactory',
  'UserServices',
  '$location',
  'ShareData',
  'UsersFactory',
  'PatCacheFactory',
  'FeatureFlagService',  
  'FuseFlag',    
  'FeatureService',
  'userSettingsDataService',
  PatientAccountOptionController,
]);

function PatientAccountOptionController(
  $scope,
  $rootScope,
  $routeParams,
  $filter,
  localize,
  listHelper,
  $timeout,
  patientServices,
  toastrFactory,
  userServices,
  $location,
  shareData,
  usersFactory,
  cacheFactory,
  featureFlagService,
  fuseFlag,  
  featureService,
  userSettingsDataService
) {
  BaseCtrl.call(this, $scope, 'PatientAccountOptionController');
  // Get controller's object
  var ctrl = this;
  $scope.showNewPatientHeader = userSettingsDataService.isNewNavigationEnabled();
  $scope.loadingAccountOptions = true;
  //define object that holds list of account-members
  $scope.accountMembersOptions = [];
  $scope.defaultAccountMemberOptionIndex = 0;
  $scope.filterBarProperties = {};
  // Index of "Profile" option in options drop-down
  ctrl.patientProfileOptionIndex = 2;

  //Index of "Account Summary" option in drop-down to display as default selected option
  $scope.defaultSummaryOptionIndex = 0;

  // flag to determine whether or not multiple account members are selected or not, filtering directive controls this
  $scope.multipleAccountMembersSelected = false;
  $scope.enableOrthodonticContracts = false;    
  //Added auto flag for newNav UI testing

  $scope.enableNewClinicalNavigation = userSettingsDataService.isNewNavigationEnabled();

  // Collection of OPTIONs associated with summary drop-down list
  $scope.accountSummaryOptions = [
    //keep this uncommented for check in and comment this out to work on new accountsummary page
    {
      name: localize.getLocalizedString('Account Summary'),
      value: 0,
      url: '#/Patient/' + $scope.patient.Data.PatientId + '/Account/',
      templateUrl:
        'App/Patient/patient-account/patient-summary/patient-summary-beta-Migration.html',
    },
    {
      name: localize.getLocalizedString('Insurance Information'),
      value: 3,
      url: '#/Patient/' + $scope.patient.Data.PatientId + '/Account/',
      templateUrl:
        'App/Patient/patient-account/patient-insurance-info/patient-insurance-info.html',
    },
    {
      name: localize.getLocalizedString('Profile'),
      value: 1,
      url: '#/Patient/' + $scope.patient.Data.PatientId + '/ProfileBeta/',
      templateUrl:
        'App/Patient/patient-profile-refactor/patient-profile-refactor.html',
    },
    {
      name: localize.getLocalizedString('Transaction History'),
      value: 2,
      url:
        '#/Patient/' + $scope.patient.Data.PatientId + '/TransactionHistory/',
      templateUrl:
        'App/Patient/patient-account/patient-transaction-history/patient-transaction-history-Migration.html',
    },
  ];   

  $scope.initialize = function () {  
    featureFlagService.getOnce$(fuseFlag.EnableOrthodonticContracts).subscribe((value) => {
      $scope.enableOrthodonticContracts = value;

      if ($scope.enableOrthodonticContracts) {
        $scope.accountSummaryOptions.push({
          name: localize.getLocalizedString('Contract'),
          value: 4,
          url: '#/Patient/' + $scope.patient.Data.PatientId + '/Contract/',
          templateUrl: '',
        });
      }

    });
  }

  $scope.initialize();    

  $scope.filterObject = {
    // Active: 1, Edited: 2, Deleted: 3, Void: 4
    Statuses: [1],
    members: [],
    dateRange: {
      start: null,
      end: null,
    },
    Teeth: [],
    transactionTypes: null,
    providers: null,
    locations: null,
    IncludePaidTransactions: true,
    IncludeUnpaidTransactions: true,
    IncludeUnappliedTransactions: true,
    IncludeAppliedTransactions: true,
    IncludeServicesWithOpenClaims: true,
    IncludeAccountNotes: true,
    IncludeDocuments: true,
  };

  $scope.hideFilters = {
    accountMember: true,
    location: true,
    date: true,
    showMoreFilters: true,
    transactionType: true,
    transactionStatus: true,
    provider: true,
    status: true,
  };

  $scope.$on(
    'multiple-account-members-selected-flag-changed',
    function (event, nv) {
      $scope.multipleAccountMembersSelected = nv;
    }
  );

    
  ctrl.getTabNameFromParam = function () {
    var tabName =
      $scope.accountSummaryOptions[$scope.defaultSummaryOptionIndex].name;
    var urlParams = $location.search();
    if (urlParams && urlParams.tab) {
      tabName = _.escape(urlParams.tab);
    }

    return tabName;
  };

  // setting active tab based on tab-parameter
  $scope.activeTab = ctrl.getTabNameFromParam();

  // gets all the providers
  $scope.getPracticeProviders = function () {
    $scope.loadingProviders = true;
    usersFactory
      .Users()
      .then($scope.userServicesGetSuccess, $scope.userServicesGetFailure);
  };

  $scope.userServicesGetSuccess = function (res) {
    $scope.loadingProviders = false;
    $scope.providers = [];
    $scope.allProvidersList = res.Value;
    shareData.allProviders = angular.copy(res.Value);
    var filterdValue = res.Value.filter(function (f) {
      // Provider Types - Dentist, Hygienist, Assistant & Other
      if (f.ProviderTypeId) {
        return (
          f.ProviderTypeId == 1 ||
          f.ProviderTypeId == 2 ||
          f.ProviderTypeId == 3 ||
          f.ProviderTypeId == 5
        );
      }
      return false;
    });
    angular.forEach(filterdValue, function (f) {
      $scope.providers.push({
        Name: f.FirstName + ' ' + f.LastName,
        ProviderId: f.UserId,
        UserCode: f.UserCode,
      });
    });
    $scope.providers = $filter('orderBy')($scope.providers, 'Name');
  };

  $scope.userServicesGetFailure = function () {
    $scope.loadingProviders = false;
    $scope.providers = [];
    toastrFactory.error(
      localize.getLocalizedString(
        'Failed to retrieve the list of {0}. Refresh the page to try again',
        ['providers']
      ),
      localize.getLocalizedString('Server Error')
    );
  };
  $scope.isTrnxHisBetaEnabled = false;
  $scope.isOldProfileEnabled = false;
  $scope.getPracticeProviders();

  //Success handler for get all account member service
  ctrl.getAccountMembersSuccess = function (successResponse) {
    if (successResponse.Value) {
      $scope.loadingAccountOptions = false;

      ctrl.allAccountMembers = successResponse.Value;
      ctrl.allAccountMembers = $filter('orderBy')(ctrl.allAccountMembers, [
        'LastName',
        'FirstName',
      ]);

      $scope.showAccountMembersDropdown = ctrl.allAccountMembers.length > 1;

      $scope.accountMembersOptionsTemp = [];

      if (ctrl.allAccountMembers.length > 1) {
        //push first option in the account-member list to represent all account-members.
        $scope.accountMembersOptionsTemp.push({
          firstName: '',
          name:
            localize.getLocalizedString('All Account Members') +
            '(' +
            ctrl.allAccountMembers.length +
            ')',
          patientDetailedName:
            localize.getLocalizedString('All Account Members') +
            '(' +
            ctrl.allAccountMembers.length +
            ')',
          displayName: '',
          value: 0,
          personId: '0',
          accountMemberId: 0,
          accountId: 0,
          responsiblePersonId: 0,
          balanceCurrent: 0,
          isActive: false,
          isResponsiblePerson: false,
        });
      }
      angular.forEach(ctrl.allAccountMembers, function (accountMemberDto) {
        var accountMember = angular.copy(accountMemberDto);
        var accountMemberServerDto = listHelper.findItemByFieldValue(
          ctrl.AccountMembersDetail,
          'PersonId',
          accountMember.PatientId
        );

        $scope.accountMembersOptionsTemp.push({
          firstName: accountMember.FirstName,
          name: [accountMember.FirstName, accountMember.LastName]
            .filter(function (text) {
              return text;
            })
            .join(' '),
          displayName:
            [accountMember.FirstName, accountMember.LastName.charAt(0)]
              .filter(function (text) {
                return text;
              })
              .join(' ') + '.',
          personId: accountMember.PatientId,
          patientDetailedName:
            accountMember.FirstName +
            (accountMember.PreferredName != null &&
            accountMember.PreferredName != ''
              ? ' (' + accountMember.PreferredName + ')'
              : '') +
            (accountMember.MiddleName != null && accountMember.MiddleName != ''
              ? ' ' + accountMember.MiddleName + '.'
              : '') +
            ' ' +
            accountMember.LastName +
            (accountMember.SuffixName != null && accountMember.SuffixName != ''
              ? ' ' + accountMember.SuffixName
              : ''),
          value: $scope.accountMembersOptionsTemp.length + 1,
          accountMemberId: accountMemberServerDto.AccountMemberId,
          accountId: accountMemberServerDto.AccountId,
          responsiblePersonId: accountMemberServerDto.ResponsiblePersonId,
          balanceCurrent: accountMemberServerDto.BalanceCurrent,
          isActive: accountMemberServerDto.IsActive,
          isActivePatient: accountMember.IsActive,
          isResponsiblePerson: accountMember.IsResponsiblePerson,
        });
        $scope.accountMembersCount = $scope.accountMembersOptions.length;
      });

      //sync data with shareData factory so that it can be used anywhere
      shareData.accountMembersDetail = $scope.accountMembersOptionsTemp;
      shareData.selectAll = false;
      // Search and set Account Member in Account Members list on startup
      ctrl.selectAccountMembers();

      ctrl.setAccountMemberOptionData();
    } else {
      toastrFactory.error(
        localize.getLocalizedString('An error has occurred while {0}', [
          'getting all account members',
        ]),
        localize.getLocalizedString('Error')
      );
    }
  };

  // *Remove after removing old tx history - sets the old droptdown default value
  // Search and set Account Member in Account Members drop-down list
  ctrl.setAccountMemberOptionData = function () {
    $scope.accountMembersOptions = $scope.accountMembersOptionsTemp
      ? $scope.accountMembersOptionsTemp
      : $scope.accountMembersOptions;

    var itemIndex = 0;

    //for case: all account we need to select 0 index, for case: single member without all account we need 0 index too.
    if ($routeParams.currentPatientId > '') {
      var personIndex = listHelper.findIndexByFieldValue(
        $scope.accountMembersOptionsTemp,
        'personId',
        $routeParams.currentPatientId
      );

      itemIndex = personIndex > -1 ? personIndex : itemIndex;
    }

    if (
      $scope.accountMembersOptions != null &&
      $scope.accountMembersOptions.length > 0
    ) {
      $scope.defaultAccountMemberOptionIndex = itemIndex;
      $scope.selectedAccountMemberOption =
        $scope.accountMembersOptions[
          $scope.defaultAccountMemberOptionIndex
        ].patientDetailedName;
      $scope.currentPatientId =
        $scope.accountMembersOptions[
          $scope.defaultAccountMemberOptionIndex
        ].personId;
    }
  };

  ctrl.selectAccountMembers = function () {
    // initialize patient account header lists
    if (
      _.isNil(shareData.selectedPatients) ||
      !_.isEqual(shareData.currentPatientId, $routeParams.patientId)
    ) {
      var filteredMembers = _.filter($scope.accountMembersOptionsTemp, {
        personId: $routeParams.patientId,
      });
      $scope.filterObject.members = shareData.selectedPatients = _.map(
        filteredMembers,
        'personId'
      );
      shareData.currentPatientId = $routeParams.patientId;
    } else {
      $scope.filterObject.members = shareData.selectedPatients;
    }
    if ($routeParams.summaryType == 'All') {
      $scope.filterObject.members = '0';
      shareData.selectedPatients = '0';
      shareData.currentPatientId = '0';
    }
    $scope.$broadcast('set-account-member-filter');

    if (
      $scope.activeTab == 'Insurance Information' ||
      $routeParams.summaryType == 'All'
    ) {
      $scope.applyFilters();
    }
  };

  //Error handler for get all account member service
  ctrl.getAccountMembersFailure = function () {
    toastrFactory.error(
      localize.getLocalizedString('An error has occurred while {0}', [
        'getting all account members',
      ]),
      localize.getLocalizedString('Error')
    );
  };

  //Success handler for get all account member service
  ctrl.getAllAccountMembersSuccess = function (successResponse) {
    if (successResponse.Value) {
      ctrl.AccountMembersDetail = successResponse.Value;

      //Call account-member service to get all account-members for default selected user's personId only if it belongs to any account
      if (
        $scope.patient &&
        $scope.patient.Data &&
        $scope.patient.Data.PersonAccount
      ) {
        patientServices.Account.getAllAccountMembersByAccountId(
          {
            accountId: $scope.patient.Data.PersonAccount.AccountId,
          },
          ctrl.getAccountMembersSuccess,
          ctrl.getAccountMembersFailure
        );
      } else {
        $scope.loadingAccountOptions = false;
      }
    } else {
      toastrFactory.error(
        localize.getLocalizedString('An error has occurred while {0}', [
          'getting all account members',
        ]),
        localize.getLocalizedString('Error')
      );
      $scope.loadingAccountOptions = false;
    }
  };

  //Error handler for get all account member service
  ctrl.getAllAccountMembersFailure = function () {
    ctrl.AccountMembersDetail = null;
    toastrFactory.error(
      localize.getLocalizedString('An error has occurred while {0}', [
        'getting all account members',
      ]),
      localize.getLocalizedString('Error')
    );
  };

  // *Remove when old tx history page - Used for changing old acct member dropdown
  // click event handler for account member drop-down
  $scope.accountMemberOptionClicked = function (option) {
    // set to default values if option is invalid
    if (!option) {
      option =
        $scope.accountMembersOptions[$scope.defaultAccountMemberOptionIndex];
      $scope.selectedAccountMemberOption =
        $scope.accountMembersOptions[
          $scope.defaultAccountMemberOptionIndex
        ].patientDetailedName;
    }
    // set the name of currently selected view
    $scope.selectedAccountMemberOption = option.patientDetailedName;
    // set $scope.currentPatientId, which is used in PatientSummaryController to get encounter list.
    $timeout(function () {
      $scope.currentPatientId = option.personId;

      // Disable encounter expanding functionality
      $rootScope.transactionToSearchEncounter = null;
      $routeParams.currentPatientId = $scope.currentPatientId;
      //$location.search('currentPatientId', $scope.currentPatientId);
    }, 100);
  };

  // *Remove when old tx history page - Used for all account members link in header
  // function to set AccountMember selection DD to it's default value if true value is passed else set to "All Account Members"
  $scope.resetAccountMemberToDefault = function (setToDefaultUser) {
    $scope.doingReset = true;
    if (setToDefaultUser) {
      $scope.selectedAccountMemberOption =
        $scope.accountMembersOptions[
          $scope.defaultAccountMemberOptionIndex
        ].patientDetailedName;
      $scope.currentPatientId =
        $scope.accountMembersOptions[
          $scope.defaultAccountMemberOptionIndex
        ].personId;
      $timeout(function () {
        $scope.selectedAccountMemberOption =
          $scope.accountMembersOptions[
            $scope.defaultAccountMemberOptionIndex
          ].patientDetailedName;
      }, 100);
    } else {
      // Find index of "All Account Members" option to be set in drop-down list
      var indexOfAllAccountMembersOption = listHelper.findIndexByFieldValue(
        $scope.accountMembersOptions,
        'personId',
        0
      );

      //Set the "All Account Members" option in drop-down list.
      $timeout(function () {
        $scope.selectedAccountMemberOption =
          $scope.accountMembersOptions[
            indexOfAllAccountMembersOption
          ].patientDetailedName;
        $scope.currentPatientId = '0';
      }, 100);
    }
  };

  //set view for selected account option
  $scope.selectOption = function (option) {
    if (option) {
      // setting the tab value to selected option to trigger route change for amfa
      if ($routeParams.tab !== option.name) {
        $location.search('tab', option.name);
        $location.search('currentPatientId', $scope.currentPatientId);
      }
    }
  };

  if ($routeParams.tab) {
    switch ($routeParams.tab) {
      case 'Insurance Information':
        $scope.selectedSummaryOption = $scope.accountSummaryOptions[1].name;
        $scope.selectOption($scope.accountSummaryOptions[1]);
        $scope.hideFilters.accountMember = false;
        break;
      case 'Profile':
        $scope.selectedSummaryOption =
          $scope.accountSummaryOptions[ctrl.patientProfileOptionIndex].name;
        $scope.selectOption(
          $scope.accountSummaryOptions[ctrl.patientProfileOptionIndex]
        );
        break;
      case 'Account Summary':
        $scope.selectedSummaryOption =
          $scope.accountSummaryOptions[$scope.defaultSummaryOptionIndex].name;
        $scope.selectOption(
          $scope.accountSummaryOptions[$scope.defaultSummaryOptionIndex]
        );
        $scope.hideFilters.accountMember = false;
        break;
      case 'Transaction History':
        $scope.selectedSummaryOption = $scope.accountSummaryOptions[3].name;
        $scope.selectOption($scope.accountSummaryOptions[3]);
        $scope.hideFilters = _.mapValues($scope.hideFilters, () => false);
        break;
      case 'Contract':
        $scope.selectedSummaryOption = $scope.accountSummaryOptions[4].name;
        $scope.selectOption($scope.accountSummaryOptions[4]);
        $scope.hideFilters = _.mapValues($scope.hideFilters, () => false);
        break;        
      default:
        $scope.selectedSummaryOption =
          $scope.accountSummaryOptions[$scope.defaultSummaryOptionIndex].name;
        $scope.selectOption(
          $scope.accountSummaryOptions[$scope.defaultSummaryOptionIndex]
        );
        $scope.hideFilters.accountMember = false;
    }
  } else {
    // Set default "Summary" option to be shown on page startup
    $scope.selectedSummaryOption =
      $scope.accountSummaryOptions[$scope.defaultSummaryOptionIndex].name;
    $scope.hideFilters.accountMember = false;
  }

  $scope.$rootScopeRegistrations.push(
    $rootScope.$on(
      'navigate-to-related-encounters',
      function (event, transactionToSearchEncounter) {
        $scope.selectedSummaryOption =
          $scope.accountSummaryOptions[$scope.defaultSummaryOptionIndex].name;
        $location.search('tab', $scope.selectedSummaryOption);
        $location.search('currentPatientId', $scope.currentPatientId);
        $rootScope.$broadcast(
          'expand-related-active-encounters',
          transactionToSearchEncounter
        );
      }
    )
  );
  // change event handler for account options
  $scope.accountSummaryOptionClicked = function (option) {
    // if option.name does not exist, display default item
    if (!option) {
      option = $scope.accountSummaryOptions[$scope.defaultSummaryOptionIndex];
      $scope.selectedSummaryOption =
        $scope.accountSummaryOptions[$scope.defaultSummaryOptionIndex].name;
    }
    // set the name of currently selected view
    $scope.selectedSummaryOption = option.name;
    // load HTML view for selected option
    $scope.selectOption(option);

    // Disable encounter expanding functionality
    $rootScope.transactionToSearchEncounter = null;
  };

  // If user is self responsible or has other responsible person for his account then give next server call for account members
  if ($scope.patient.Data.ResponsiblePersonType != 0) {
    //Call service to get details of all account-members inside an account
    patientServices.Account.getAccountMembersDetailByAccountId(
      {
        accountId: $scope.patient.Data.PersonAccount.AccountId,
      },
      ctrl.getAllAccountMembersSuccess,
      ctrl.getAllAccountMembersFailure
    );
  } else {
    // Show No Responsible Person warning message on account tab if the patient searched has no responsible person assigned.
    $scope.loadingAccountOptions = false;
    if ($scope.selectedSummaryOption !== 'Profile') {
      $scope.showNoResponsiblePersonWarning = true;

      // User has no responsible person assigned so navigate user to profile page and show a warning message and link for assigning responsible person
      var selectedOptionData =
        $scope.accountSummaryOptions[ctrl.patientProfileOptionIndex];
      $scope.selectedSummaryOption =
        $scope.accountSummaryOptions[ctrl.patientProfileOptionIndex].name;

      // Load patient profile view so that user can view and set responsible person
      $scope.selectOption(selectedOptionData);
    }
  }

  // Navigate user to Account Summary/Transaction History
  $scope.navToAccountSummaryOrTransactionHistory = function (
    selectedOptionValue
  ) {
    // Find out Transaction History option from summary options drop-down list
    var selectedSummaryOption = listHelper.findItemByFieldValue(
      $scope.accountSummaryOptions,
      'value',
      selectedOptionValue
    );

    // Display Transaction History/Account Summary page on screen as per link
    $scope.selectOption(selectedSummaryOption);
    $scope.selectedSummaryOption = selectedSummaryOption.name;
  };

  // Find OPTION data associated with summary drop-down list
  $scope.getSummaryOptionByValue = function (optionValue) {
    return listHelper.findItemByFieldValue(
      $scope.accountSummaryOptions,
      'value',
      optionValue
    );
  };

  // Update person account object once patient is successfully updated with responsible person from patient profile page
  ctrl.updatePersonAccount = function (event, person) {
    $scope.patient.Data.PersonAccount = person.PersonAccount;

    //Call service to get details of all account-members inside an account once the responsible person is assigned to the a patient
    patientServices.Account.getAccountMembersDetailByAccountId(
      {
        accountId: $scope.patient.Data.PersonAccount.AccountId,
      },
      ctrl.getAllAccountMembersSuccess,
      ctrl.getAllAccountMembersFailure
    );
  };

  // Catch event when responsible person is assigned to a patient
  $scope.$rootScopeRegistrations.push(
    $rootScope.$on(
      'soar:responsible-person-assigned',
      function (event, person) {
        cacheFactory.ClearCache(cacheFactory.GetCache('PatientServices'));
        $scope.loadingAccountOptions = true;
        ctrl.updatePersonAccount(event, person);
      }
    )
  );

  //#region filtering

  // some of the filtering methods are the same for transaction history and account summary
  // putting them here so that are only in one place and can be share by both pages

  // *Remove with old tx history page - Filtering is handled in new filter box
  // filtering for each section
  $scope.filterFunction = function (value, filterObject, dateFilter) {
    // member filtering
    var memberMatch = false;
    angular.forEach(filterObject.members, function (member) {
      if (!memberMatch && member === value.AccountMemberId) {
        memberMatch = true;
      }
    });
    if (!memberMatch) {
      return false;
    }

    // date filtering
    var dateFiltered = false;
    var startDateMatch;
    var endDateMatch;
    if (filterObject.dateRange.start) {
      var startDate = new Date(filterObject.dateRange.start);
      var date = new Date($filter(dateFilter)(value.DateEntered));
      dateFiltered = true;
      if (date >= startDate.setHours(0, 0, 0, 0)) {
        startDateMatch = true;
      } else {
        startDateMatch = false;
      }
    }
    if (filterObject.dateRange.end) {
      var endDate = new Date(filterObject.dateRange.end);
      var date = new Date($filter(dateFilter)(value.DateEntered));
      dateFiltered = true;
      if (date <= endDate.setHours(23, 59, 59, 999)) {
        endDateMatch = true;
      } else {
        endDateMatch = false;
      }
    }
    if (dateFiltered && (startDateMatch === false || endDateMatch === false)) {
      return false;
    }

    // teeth numbers filtering
    var teethNumbersFiltered = false;
    var teethNumbersMatch = false;
    angular.forEach(filterObject.Teeth, function (tooth) {
      teethNumbersFiltered = true;
      if (!teethNumbersMatch) {
        if (value.Tooth == tooth) {
          teethNumbersMatch = true;
        }
      }
    });
    if (teethNumbersFiltered && !teethNumbersMatch) {
      return false;
    }

    var paidTransactions = 10;
    var unpaidTransactions = 11;
    var appliedTransactions = 12;
    var unappliedTransactions = 13;
    // transactionTypes filtering
    var transactionTypesFiltered = false;
    var transactionTypesMatch = false;
    angular.forEach(filterObject.transactionTypes, function (tt) {
      transactionTypesFiltered = true;

      if (tt === paidTransactions) {
        if (value.TransactionTypeId === 1) {
          if (
            typeof value.Balance !== 'undefined' &&
            typeof value.TotalEstInsurance !== 'undefined' &&
            typeof value.TotalInsurancePaidAmount !== 'undefined' &&
            value.Balance +
              (value.TotalEstInsurance - value.TotalInsurancePaidAmount) ==
              0
          ) {
            transactionTypesMatch = true;
          }
        }
      }

      if (tt === unpaidTransactions) {
        if (value.TransactionTypeId === 1) {
          if (
            typeof value.Balance !== 'undefined' &&
            typeof value.TotalEstInsurance !== 'undefined' &&
            typeof value.TotalInsurancePaidAmount !== 'undefined' &&
            value.Balance +
              (value.TotalEstInsurance - value.TotalInsurancePaidAmount) >
              0
          ) {
            transactionTypesMatch = true;
          }
        }
      }

      if (tt == appliedTransactions) {
        if (
          typeof value.CreditTransactionDetails !== 'undefined' &&
          value.CreditTransactionDetails.length > 0
        ) {
          var isApplied = true;

          for (var i = 0; i < value.CreditTransactionDetails.length; i++) {
            if (
              value.CreditTransactionDetails[i].AppliedToServiceTransationId ==
                null &&
              value.CreditTransactionDetails[i].AppliedToDebitTransactionId ==
                null
            ) {
              isApplied = false;
              break;
            }
          }

          if (isApplied) {
            transactionTypesMatch = true;
          }
        }
      }

      if (tt == unappliedTransactions) {
        if (
          typeof value.CreditTransactionDetails !== 'undefined' &&
          value.CreditTransactionDetails.length > 0
        ) {
          var isUnapplied = false;

          for (var i = 0; i < value.CreditTransactionDetails.length; i++) {
            if (
              value.CreditTransactionDetails[i].AppliedToServiceTransationId ==
                null &&
              value.CreditTransactionDetails[i].AppliedToDebitTransactionId ==
                null
            ) {
              isUnapplied = true;
              break;
            }
          }

          if (isUnapplied) {
            transactionTypesMatch = true;
          }
        }
      }

      if (!transactionTypesMatch && tt === value.TransactionTypeId) {
        transactionTypesMatch = true;
      }
    });
    if (transactionTypesFiltered && !transactionTypesMatch) {
      return false;
    }

    // providers filtering
    var providersFiltered = false;
    var providersMatch = false;
    angular.forEach(filterObject.providers, function (p) {
      providersFiltered = true;
      if (!providersMatch && p === value.ProviderUserId) {
        providersMatch = true;
      }
    });
    if (providersFiltered && !providersMatch) {
      return false;
    }

    // return true if we get here
    return true;
  };

  // *Remove with old tx history page - Not used on new pages
  // filtersApplied logic
  $scope.filtersAreApplied = function (filterObject) {
    var result = false;
    if (filterObject) {
      if (
        (filterObject.members[0] !== 0 && filterObject.members.length > 1) ||
        filterObject.dateRange.start ||
        filterObject.dateRange.end ||
        (filterObject.Teeth && filterObject.Teeth.length > 0) ||
        (filterObject.transactionTypes &&
          filterObject.transactionTypes.length > 0) ||
        (filterObject.providers && filterObject.providers.length > 0)
      ) {
        result = true;
      }
    }
    return result;
  };

  $scope.applyFilters = function () {
    shareData.selectedPatients = $scope.filterObject.members;
    $scope.$broadcast('apply-account-filters', $scope.filterObject);
  };

  //#endregion
  $scope.defaultSummaryOptionName = $scope.getSummaryOptionByValue(1).name;
}

PatientAccountOptionController.prototype = Object.create(BaseCtrl.prototype);
