'use strict';

angular.module('Soar.Patient').controller('PatientAccountFiltersController', [
  '$scope',
  'ListHelper',
  '$timeout',
  'StaticData',
  'UsersFactory',
  '$filter',
  function ($scope, listHelper, $timeout, staticData, usersFactory, $filter) {
    var ctrl = this;

    $scope.list1Filtered = false;
    $scope.list2Filtered = false;

    // implementation specific data to send to the filter box directive
    $scope.data = {};

    // base filter object
    $scope.filterObject = {
      members: [],
      dateRange: {
        start: null,
        end: null,
      },
      teethNumbers: [],
      transactionTypes: [],
      providers: [],
    };

    // the transaction history controller will only broadcast this if the list has been reloaded
    $scope.$on('transaction-history-reloaded', function (event, nv) {
      $scope.list1 = nv;
      if ($scope.reloadList1 === false) {
        $scope.reloadList1 = true;
      } else {
        $scope.$broadcast('list1-reloaded', nv, true);
        ctrl.populateTeethAndUsersLists(nv);
        ctrl.addProviders();
      }
    });

    $scope.$watch(
      'list1',
      function (nv, ov) {
        // if list1Filtered is true, we got in here because list1 changed as a result of a filter action
        // if not, then it changed as a result of the parent doing a refresh, so we need to re-filter
        if ($scope.list1Filtered === true) {
          $scope.list1Filtered = false;
        } else if (
          $scope.list1Filtered === false &&
          $scope.filterObject.members.length > 0
        ) {
          $scope.$broadcast('list1-reloaded', nv);
        }
        if (!angular.equals(nv, ov)) {
          $scope.reloadList1 = false;
          // emitting 'list1-updated', transaction history page is listening for this
          $scope.$emit('list1-updated', nv);
        }
        if (nv && nv.length > 0) {
          ctrl.populateTeethAndUsersLists(nv);
          ctrl.addProviders();
        }
      },
      true
    );

    $scope.$watch(
      'list2',
      function (nv, ov) {
        // if list2Filtered is true, we got in here because list2 changed as a result of a filter action
        // if not, then it changed as a result of the parent doing a refresh, so we need to re-filter
        if ($scope.list2Filtered === true) {
          $scope.list2Filtered = false;
        } else if (
          $scope.list2Filtered === false &&
          $scope.filterObject.members.length > 0
        ) {
          $scope.$broadcast('list2-reloaded', nv, true);
        }
        if (nv && nv.length > 0) {
          ctrl.populateTeethAndUsersLists(nv);
          ctrl.addProviders();
        }
      },
      true
    );

    // listening for filterObject change event emitted by the child
    $scope.$on('filter-object-changed', function (event, nv, list1, list2) {
      $scope.list1Filtered = true;
      $scope.list2Filtered = true;
      // date validation
      if (nv.dateRange.start && nv.dateRange.end) {
        var startDate = new Date(nv.dateRange.start);
        var endDate = new Date(nv.dateRange.end);
        if (endDate.setHours(0, 0, 0, 0) < startDate.setHours(0, 0, 0, 0)) {
          $scope.data.dateError = true;
        } else {
          $scope.data.dateError = false;
        }
      } else {
        $scope.data.dateError = false;
      }
      $scope.filterObject = nv;

      // conditional for setting filtersApplied flag
      if (
        ($scope.filterObject.members[0] !== 0 &&
          $scope.filterObject.members.length > 1) ||
        $scope.filterObject.dateRange.start ||
        $scope.filterObject.dateRange.end ||
        $scope.filterObject.teethNumbers.length > 0 ||
        $scope.filterObject.transactionTypes.length > 0 ||
        $scope.filterObject.providers.length > 0
      ) {
        $scope.filtersApplied = true;
      } else {
        $scope.filtersApplied = false;
      }
      $scope.$emit('filters-applied-change', $scope.filtersApplied);
      $scope.list1 = list1;
      $scope.list2 = list2;
    });

    // listening for filterObject members change event emitted by the child
    $scope.$on('filter-object-members-changed', function (event, nv) {
      $scope.$emit('account-members-selected-changed', nv);
    });

    // currentPatientId drives the member filtering via the drop down, making sure that these filters are in sync
    ctrl.hasLoaded = false;
    $scope.$watch(
      'currentPatientId',
      function (nv, ov) {
        var accountMemberServerDto = listHelper.findItemByFieldValue(
          $scope.accountMembers,
          'personId',
          $scope.currentPatientId
        );
        if (accountMemberServerDto) {
          $scope.filterObject.members = [];
          // all account members was selected in the dropdown
          if (accountMemberServerDto.accountMemberId === 0) {
            angular.forEach($scope.accountMembers, function (member) {
              $scope.filterObject.members.push(member.accountMemberId);
            });
          } else {
            $scope.filterObject.members.push(
              accountMemberServerDto.accountMemberId
            );
          }
        }
        // making a copy of the initial state of the filter object
        if (!ctrl.hasLoaded) {
          ctrl.hasLoaded = true;
          $scope.originalFilterObject = angular.copy($scope.filterObject);
        }
      },
      true
    );

    // lists
    $scope.data.accountMembers = $scope.accountMembers;
    $scope.data.activeTeeth = undefined;
    ctrl.userIdsInLists = [];

    // some filterable properties need to be disabled or removed from the filters if they do not exist in any of the rows in the lists
    // ex: if there is no teeth history for tooth 22, we disable tooth 22 in the toothPicker
    // lopping through each list once to get all the necessary values
    ctrl.populateTeethAndUsersLists = function (list) {
      if (angular.isUndefined($scope.data.activeTeeth)) {
        $scope.data.activeTeeth = [];
      }
      angular.forEach(list, function (item) {
        item = item.ServiceTransactionDtos ? item.ServiceTransactionDtos : item;
        if (item.length) {
          angular.forEach(item, function (std) {
            if (std.Tooth) {
              std.Tooth = angular.isString(std.Tooth)
                ? std.Tooth.toUpperCase()
                : std.Tooth;
              if ($scope.data.activeTeeth.indexOf(std.Tooth) === -1) {
                $scope.data.activeTeeth.push(std.Tooth);
              }
            }
            if (std.ProviderUserId) {
              if (ctrl.userIdsInLists.indexOf(std.ProviderUserId) === -1) {
                ctrl.userIdsInLists.push(std.ProviderUserId);
              }
            }
          });
        } else {
          if (item.Tooth) {
            item.Tooth = angular.isString(item.Tooth)
              ? item.Tooth.toUpperCase()
              : item.Tooth;
            if ($scope.data.activeTeeth.indexOf(item.Tooth) === -1) {
              $scope.data.activeTeeth.push(item.Tooth);
            }
          }
          if (item.ProviderUserId) {
            if (ctrl.userIdsInLists.indexOf(item.ProviderUserId) === -1) {
              ctrl.userIdsInLists.push(item.ProviderUserId);
            }
          }
        }
      });
    };

    //#region transactionTypes

    $scope.data.transactionTypes = [];

    staticData.TransactionTypes().then(function (response) {
      if (response && response.Value) {
        $scope.data.transactionTypes = response.Value;
      }
    });

    //#endregion

    //#region providers

    $scope.data.providers = undefined;

    ctrl.addProviders = function () {
      if (angular.isUndefined($scope.data.providers)) {
        $scope.data.providers = [];
      }
      angular.forEach($scope.allProviders, function (prov) {
        var indexInUserIdsInLists = ctrl.userIdsInLists.indexOf(prov.UserId);
        var indexInDataProviders = listHelper.findIndexByFieldValue(
          $scope.data.providers,
          'UserId',
          prov.UserId
        );
        // only add providers that have history and are not already in the list
        if (indexInUserIdsInLists !== -1 && indexInDataProviders === -1) {
          prov.PD = prov.ProfessionalDesignation
            ? ', ' + prov.ProfessionalDesignation
            : '';
          $scope.data.providers.push(prov);
        }
      });
    };

    //#endregion

    // used by members filter checkboxes
    $scope.data.filter = function (filterProperty, identifier) {
      var index = $scope.filterObject[filterProperty].indexOf(identifier);
      // if it was already in the list, remove it or all
      if (index !== -1) {
        if (identifier === 0 && filterProperty === 'members') {
          $scope.filterObject[filterProperty] = [];
        } else {
          $scope.filterObject[filterProperty].splice(index, 1);
          // if 'all' had been selected previously, remove it from the list
          var allIndex = $scope.filterObject[filterProperty].indexOf(0);
          if (allIndex !== -1 && filterProperty === 'members') {
            $scope.filterObject[filterProperty].splice(allIndex, 1);
          }
        }
      }
      // if it wasn't already in the list, add it or all
      else {
        if (identifier === 0 && filterProperty === 'members') {
          $scope.filterObject[filterProperty] = [];
          angular.forEach($scope.accountMembers, function (mbr) {
            $scope.filterObject[filterProperty].push(mbr.accountMemberId);
          });
        } else {
          $scope.filterObject[filterProperty].push(identifier);
        }
      }
    };

    // implementation specific template for injecting into the filter box directive
    $scope.filterTemplate =
      'App/Patient/patient-account/patient-account-filters/patient-account-filters.html';

    // filtering for each section
    ctrl.filters = function (value) {
      // member filtering
      var memberMatch = false;
      angular.forEach($scope.filterObject.members, function (member) {
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
      if ($scope.filterObject.dateRange.start) {
        var startDate = new Date($scope.filterObject.dateRange.start);
        var date = new Date($filter('toShortDisplayDate')(value.DateEntered));
        dateFiltered = true;
        if (date >= startDate.setHours(0, 0, 0, 0)) {
          startDateMatch = true;
        } else {
          startDateMatch = false;
        }
      }
      if ($scope.filterObject.dateRange.end) {
        var endDate = new Date($scope.filterObject.dateRange.end);
        var date = new Date($filter('toShortDisplayDate')(value.DateEntered));
        dateFiltered = true;
        if (date <= endDate.setHours(23, 59, 59, 999)) {
          endDateMatch = true;
        } else {
          endDateMatch = false;
        }
      }
      if (
        dateFiltered &&
        (startDateMatch === false || endDateMatch === false)
      ) {
        return false;
      }

      // teeth numbers filtering
      var teethNumbersFiltered = false;
      var teethNumbersMatch = false;
      angular.forEach($scope.filterObject.teethNumbers, function (tooth) {
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

      // transactionTypes filtering
      var transactionTypesFiltered = false;
      var transactionTypesMatch = false;
      angular.forEach($scope.filterObject.transactionTypes, function (tt) {
        transactionTypesFiltered = true;
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
      angular.forEach($scope.filterObject.providers, function (p) {
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

    // the custom filter function called every time filterObject changes
    $scope.filterFunction = function (value) {
      // filterFunction is used by account summary and transaction history, setting the value accordingly
      // account summary
      if (value.ServiceTransactionDtos) {
        var accountMemberIdFromEncounter = value.AccountMemberId
          ? value.AccountMemberId
          : null;
        // if we find a match in any of the ServiceTransactionDtos, return true
        var hasMatch = false;
        angular.forEach(value.ServiceTransactionDtos, function (std) {
          if (!std.AccountMemberId) {
            std.AccountMemberId = accountMemberIdFromEncounter;
          }
          if (!hasMatch) {
            hasMatch = ctrl.filters(std);
          }
        });
        return hasMatch;
      }
      // transaction history
      else {
        return ctrl.filters(value);
      }
    };
  },
]);
