'use strict';

angular.module('Soar.BusinessCenter').controller('TotalReceivablesController', [
  '$scope',
  '$timeout',
  '$filter',
  '$sce',
  '$window',
  '$location',
  'localize',
  'ListHelper',
  'ReceivablesService',
  'toastrFactory',
  'patSecurityService',
  'ReceivablesTabService',
  'ReceivablesGridFactory',
  'PatientServices',
  'LocationServices',
  'GridPrintFactory',
  'TimeZoneFactory',
  'ModalFactory',
  '$rootScope',
  'MailingLabelPrintFactory',
  '$resource',
  'TemplatePrintFactory',
  '$routeParams',
  'FeatureService',
  'ReceivablesByLocationGridFactory',
  'userSettingsDataService',
  'tabLauncher',
  function (
    $scope,
    $timeout,
    $filter,
    $sce,
    $window,
    $location,
    localize,
    listHelper,
    receivablesService,
    toastrFactory,
    patSecurityService,
    receivablesTabService,
    receivablesGridFactory,
    patientServices,
    locationServices,
    gridPrintFactory,
    timeZoneFactory,
    modalFactory,
    $rootScope,
    mailingLabelPrintFactory,
    $resource,
    templatePrintFactory,
    $routeParams,
    featureService,
    receivablesByLocationGridFactory,
    userSettingsDataService,
    tabLauncher
  ) {
    var ctrl = this;

    // featureService
    featureService.isEnabled('DevelopmentMode').then(function (res) {
      // res is a bool, use it to enable/disable, etc
      $scope.disablePrintMailing = !res;
    });

    $scope.showFilterByLocation = true;

    // #region Declaration
    $scope.viewOptions = [
      { Name: 'Account Billing Location', Id: '0' },
      { Name: 'Service Location', Id: '1' },
    ];

    $scope.filteredByLocation = false;
    $scope.selectedView = '0';

    $scope.$watch('selectedView', function (nv, ov) {
      if (nv !== ov) {
        ctrl.changeView();
      }
    });

    $scope.locations = {
      masterLocations: [],
      selectedLocations: [],
      selectedLocationIds: [],
    };

    $scope.receivablesTab = {
      allAccountsBalance: 0,
      allAccountsCount: 0,
      balanceCurrent: 0,
      balanceCurrentCount: 0,
      balance30: 0,
      balance30Count: 0,
      balance60: 0,
      balance60Count: 0,
      balance90: 0,
      balance90Count: 0,
      inCollections: 0,
      inCollectionsCount: 0,
    };

    ctrl.factories = {
      allAccountsFactory: receivablesGridFactory.getOptions(),
      balanceCurrentFactory: receivablesGridFactory.getOptions(),
      balance30Factory: receivablesGridFactory.getOptions(),
      balance60Factory: receivablesGridFactory.getOptions(),
      balance90Factory: receivablesGridFactory.getOptions(),
      inCollectionsFactory: receivablesGridFactory.getOptions(),

      allAccountsByLocationFactory:
        receivablesByLocationGridFactory.getOptions(),
      balanceCurrentByLocationFactory:
        receivablesByLocationGridFactory.getOptions(),
      balance30ByLocationFactory: receivablesByLocationGridFactory.getOptions(),
      balance60ByLocationFactory: receivablesByLocationGridFactory.getOptions(),
      balance90ByLocationFactory: receivablesByLocationGridFactory.getOptions(),
      inCollectionsByLocationFactory:
        receivablesByLocationGridFactory.getOptions(),
    };

    // Append to the ID
    ctrl.factories.allAccountsFactory.id += 'All';
    ctrl.factories.balanceCurrentFactory.id += 'Current';
    ctrl.factories.balance30Factory.id += '30';
    ctrl.factories.balance60Factory.id += '60';
    ctrl.factories.balance90Factory.id += '90';
    ctrl.factories.inCollectionsFactory.id += 'InCollections';

    ctrl.factories.allAccountsByLocationFactory.id += 'All';
    ctrl.factories.balanceCurrentByLocationFactory.id += 'Current';
    ctrl.factories.balance30ByLocationFactory.id += '30';
    ctrl.factories.balance60ByLocationFactory.id += '60';
    ctrl.factories.balance90ByLocationFactory.id += '90';
    ctrl.factories.inCollectionsByLocationFactory.id += 'InCollections';

    // Set initial visibility state
    ctrl.factories.allAccountsFactory.isHidden = false;
    ctrl.factories.balanceCurrentFactory.isHidden = true;
    ctrl.factories.balance30Factory.isHidden = true;
    ctrl.factories.balance60Factory.isHidden = true;
    ctrl.factories.balance90Factory.isHidden = true;
    ctrl.factories.inCollectionsFactory.isHidden = true;

    ctrl.factories.allAccountsByLocationFactory.isHidden = true;
    ctrl.factories.balanceCurrentByLocationFactory.isHidden = true;
    ctrl.factories.balance30ByLocationFactory.isHidden = true;
    ctrl.factories.balance60ByLocationFactory.isHidden = true;
    ctrl.factories.balance90ByLocationFactory.isHidden = true;
    ctrl.factories.inCollectionsByLocationFactory.isHidden = true;

    $scope.currentTab = 'allAccounts';

    $scope.collapseSlideout = true;
    $scope.disablePrint = true;

    ctrl.currentFilters = [];
    $scope.showHideFilterLabel = 'Show Filters';
    $scope.showFilter = false;

    ctrl.filename = '';

    // #endregion

    //#region Additional Filters

    $scope.additionalFilters = [
      {
        header: null,
        id: 'AccountswithPendingInsurance',
        options: [
          {
            Name: 'Accounts with Pending Insurance',
            Id: 'HasPendingInsurance',
            Field: 'HasPendingInsurance',
            Value: true,
            Checked: false,
            Type: 'checkbox',
          },
        ],
      },
      {
        header: null,
        id: 'AccountswithNoPendingInsurance',
        options: [
          {
            Name: 'Accounts with No Pending Insurance',
            Id: 'HasNoPendingInsurance',
            Field: 'HasNoPendingInsurance',
            Value: true,
            Checked: false,
            Type: 'checkbox',
          },
        ],
      },
      {
        header: null,
        id: 'AccountswithNoStatementintheLast30days',
        options: [
          {
            Name: 'Accounts with No Statement in the Last 30 days',
            Id: 'HasNoLastStatement30Days',
            Field: 'HasNoLastStatement30Days',
            Value: true,
            Checked: false,
            Type: 'checkbox',
          },
        ],
      },
      {
        header: null,
        id: 'AccountswithaPaymentReceivedSinceLastStatement',
        options: [
          {
            Name: 'Accounts with a Payment Received Since Last Statement',
            Id: 'HasPaymentSinceLastStatement',
            Field: 'HasPaymentSinceLastStatement',
            Value: true,
            Checked: false,
            Type: 'checkbox',
          },
        ],
      },
      {
        header: null,
        id: 'AccountswithNoPaymentSinceLastStatement',
        options: [
          {
            Name: 'Accounts with No Payment Since Last Statement',
            Id: 'HasNoPaymentSinceLastStatement',
            Field: 'HasNoPaymentSinceLastStatement',
            Value: true,
            Checked: false,
            Type: 'checkbox',
          },
        ],
      },
      {
        header: null,
        id: 'AccountsthatReceiveStatements',
        options: [
          {
            Name: 'Accounts that Receive Statements',
            Id: 'HasReceiveStatement',
            Field: 'HasReceiveStatement',
            Value: true,
            Checked: false,
            Type: 'checkbox',
          },
        ],
      },
      {
        header: null,
        id: 'AccountsthatDoNotReceiveStatements',
        options: [
          {
            Name: 'Accounts that Do Not Receive Statements',
            Id: 'HasNoReceiveStatement',
            Field: 'HasNoReceiveStatement',
            Value: true,
            Checked: false,
            Type: 'checkbox',
          },
        ],
      },

      {
        header: null,
        id: 'AccountUnappliedCredits',
        options: [
          {
            Name: 'Exclude Accounts With Unapplied Amounts that have $0 Balance',
            Id: 'HasUnappliedAmountZeroBalance',
            Field: 'HasUnappliedAmountZeroBalance',
            Value: true,
            Checked: true,
            Type: 'checkbox',
          },
        ],
      },
      {
        header: null,
        id: 'AccountsWithBalanceforProvider',
        visible: false,
        options: [
          {
            Name: 'Accounts with Balance for Provider',
            Id: 'BalanceForProvider',
            Field: 'ProvidersWithBalances',
            Checked: false,
            Type: 'checkbox',
            ValueControl: 'multiselect',
            ValueControlOptions: {
              Type: 'Providers',
              List: [],
              SelectedList: [],
              Authz: 'soar-biz-bizrcv-view',
              FieldId: 'Key',
              FieldName: 'Value',
              Open: 'false',
              IsLoaded: 'false',
              SelectAllLabel: 'All',
            },
            Value: true,
          },
        ],
      },
    ];

    $scope.additionalFilters[8].visible = !$scope.filteredByLocation;
    //$scope.$watch('additionalFilters[6].options[0].ValueControlOptions.List',
    //    function (nv) {
    //        var selectedList = $filter('filter')($scope.additionalFilters[8].options[0].ValueControlOptions.List, { Selected: true });
    //        var balanceForProvider = document.getElementById('BalanceForProvider');

    //        if (balanceForProvider != null) {
    //            balanceForProvider.checked = selectedList.length > 0 ? true : false;
    //        }
    //    }, true);

    $scope.applyFilters = function (filters) {
      ctrl.currentFilters = [];
      angular.forEach($scope.additionalFilters, function (filter) {
        angular.forEach(filter.options, function (obj) {
          if (
            typeof obj.ValueControl !== 'undefined' &&
            obj.ValueControl === 'multiselect'
          ) {
            var selectedList = $filter('filter')(obj.ValueControlOptions.List, {
              Selected: true,
            });

            var selectedKeys = [];
            angular.forEach(selectedList, function (item) {
              selectedKeys.push(item.Key);
            });
            if (selectedKeys.length === 0) {
              selectedKeys = null;
            }
            $scope.receivablesAllAccountsGridOptions.updateFilter(
              obj.Field,
              selectedKeys
            );
            $scope.receivablesBalanceCurrentGridOptions.updateFilter(
              obj.Field,
              selectedKeys
            );
            $scope.receivablesBalance30GridOptions.updateFilter(
              obj.Field,
              selectedKeys
            );
            $scope.receivablesBalance60GridOptions.updateFilter(
              obj.Field,
              selectedKeys
            );
            $scope.receivablesBalance90GridOptions.updateFilter(
              obj.Field,
              selectedKeys
            );
            $scope.receivablesInCollectionsGridOptions.updateFilter(
              obj.Field,
              selectedKeys
            );

            $scope.receivablesAllAccountsByLocationGridOptions.updateFilter(
              obj.Field,
              selectedKeys
            );
            $scope.receivablesBalanceCurrentByLocationGridOptions.updateFilter(
              obj.Field,
              selectedKeys
            );
            $scope.receivablesBalance30ByLocationGridOptions.updateFilter(
              obj.Field,
              selectedKeys
            );
            $scope.receivablesBalance60ByLocationGridOptions.updateFilter(
              obj.Field,
              selectedKeys
            );
            $scope.receivablesBalance90ByLocationGridOptions.updateFilter(
              obj.Field,
              selectedKeys
            );
            $scope.receivablesInCollectionsByLocationGridOptions.updateFilter(
              obj.Field,
              selectedKeys
            );

            ctrl.currentFilters.push({ key: obj.Field, value: selectedKeys });
          } else {
            var find = $filter('filter')(filters, { Id: obj.Id });
            if (find.length > 0) {
              $scope.receivablesAllAccountsGridOptions.updateFilter(
                obj.Field,
                obj.Value
              );
              $scope.receivablesBalanceCurrentGridOptions.updateFilter(
                obj.Field,
                obj.Value
              );
              $scope.receivablesBalance30GridOptions.updateFilter(
                obj.Field,
                obj.Value
              );
              $scope.receivablesBalance60GridOptions.updateFilter(
                obj.Field,
                obj.Value
              );
              $scope.receivablesBalance90GridOptions.updateFilter(
                obj.Field,
                obj.Value
              );
              $scope.receivablesInCollectionsGridOptions.updateFilter(
                obj.Field,
                obj.Value
              );
              ctrl.currentFilters.push({ key: obj.Field, value: obj.Value });

              $scope.receivablesAllAccountsByLocationGridOptions.updateFilter(
                obj.Field,
                obj.Value
              );
              $scope.receivablesBalanceCurrentByLocationGridOptions.updateFilter(
                obj.Field,
                obj.Value
              );
              $scope.receivablesBalance30ByLocationGridOptions.updateFilter(
                obj.Field,
                obj.Value
              );
              $scope.receivablesBalance60ByLocationGridOptions.updateFilter(
                obj.Field,
                obj.Value
              );
              $scope.receivablesBalance90ByLocationGridOptions.updateFilter(
                obj.Field,
                obj.Value
              );
              $scope.receivablesInCollectionsByLocationGridOptions.updateFilter(
                obj.Field,
                obj.Value
              );
            } else {
              let defaultValue =
                obj.Type == 'checkbox' && obj.ValueControl != 'multiselect'
                  ? false
                  : null;
              $scope.receivablesAllAccountsGridOptions.updateFilter(
                obj.Field,
                defaultValue
              );
              $scope.receivablesBalanceCurrentGridOptions.updateFilter(
                obj.Field,
                defaultValue
              );
              $scope.receivablesBalance30GridOptions.updateFilter(
                obj.Field,
                defaultValue
              );
              $scope.receivablesBalance60GridOptions.updateFilter(
                obj.Field,
                defaultValue
              );
              $scope.receivablesBalance90GridOptions.updateFilter(
                obj.Field,
                defaultValue
              );
              $scope.receivablesInCollectionsGridOptions.updateFilter(
                obj.Field,
                defaultValue
              );

              $scope.receivablesAllAccountsByLocationGridOptions.updateFilter(
                obj.Field,
                defaultValue
              );
              $scope.receivablesBalanceCurrentByLocationGridOptions.updateFilter(
                obj.Field,
                defaultValue
              );
              $scope.receivablesBalance30ByLocationGridOptions.updateFilter(
                obj.Field,
                defaultValue
              );
              $scope.receivablesBalance60ByLocationGridOptions.updateFilter(
                obj.Field,
                defaultValue
              );
              $scope.receivablesBalance90ByLocationGridOptions.updateFilter(
                obj.Field,
                defaultValue
              );
              $scope.receivablesInCollectionsByLocationGridOptions.updateFilter(
                obj.Field,
                defaultValue
              );

              ctrl.currentFilters.push({ key: obj.Field, value: defaultValue });
            }
          }
        });
      });
      $scope.refreshGrids();
    };

    $scope.resetFilters = function () {
      ctrl.currentFilters = [];
      angular.forEach($scope.additionalFilters, function (filter) {
        angular.forEach(filter.options, function (obj) {
          let defaultValue =
            obj.Type == 'checkbox' && obj.ValueControl != 'multiselect'
              ? false
              : null;
          var filterValue = !obj.Checked ? defaultValue : true;
          $scope.receivablesAllAccountsGridOptions.updateFilter(
            obj.Field,
            filterValue
          );
          $scope.receivablesBalanceCurrentGridOptions.updateFilter(
            obj.Field,
            filterValue
          );
          $scope.receivablesBalance30GridOptions.updateFilter(
            obj.Field,
            filterValue
          );
          $scope.receivablesBalance60GridOptions.updateFilter(
            obj.Field,
            filterValue
          );
          $scope.receivablesBalance90GridOptions.updateFilter(
            obj.Field,
            filterValue
          );
          $scope.receivablesInCollectionsGridOptions.updateFilter(
            obj.Field,
            filterValue
          );

          $scope.receivablesAllAccountsByLocationGridOptions.updateFilter(
            obj.Field,
            filterValue
          );
          $scope.receivablesBalanceCurrentByLocationGridOptions.updateFilter(
            obj.Field,
            filterValue
          );
          $scope.receivablesBalance30ByLocationGridOptions.updateFilter(
            obj.Field,
            filterValue
          );
          $scope.receivablesBalance60ByLocationGridOptions.updateFilter(
            obj.Field,
            filterValue
          );
          $scope.receivablesBalance90ByLocationGridOptions.updateFilter(
            obj.Field,
            filterValue
          );
          $scope.receivablesInCollectionsByLocationGridOptions.updateFilter(
            obj.Field,
            filterValue
          );

          ctrl.currentFilters.push({ key: obj.Field, value: filterValue });
        });
      });
      $scope.refreshGrids();
    };

    // #endregion

    // #region Locations
    $scope.$on('patCore:initlocation', function () {
      ctrl.init();
    });

    ctrl.init = function () {
      var selectedLocationFromPAAG = JSON.parse(
        sessionStorage.getItem('userSelectedLocationfromPAAG')
      );
      var cachedLocation = JSON.parse(sessionStorage.getItem('userLocation'));

      if (
        typeof selectedLocationFromPAAG !== 'undefined' &&
        selectedLocationFromPAAG != null
      ) {
        ctrl.userLocation = selectedLocationFromPAAG;
        sessionStorage.removeItem('userSelectedLocationfromPAAG');
      } else
        ctrl.userLocation =
          typeof cachedLocation !== 'undefined' ? cachedLocation : null;

      ctrl.getLocations();
      if ($routeParams.tabName) {
        var event = {
          currentTarget: $('button#' + $routeParams.tabName)[0],
        };
        $scope.activateTab(event);
      }
    };

    ctrl.getLocations = function () {
      $scope.locationsLoading = true;
      locationServices
        .getPermittedLocations({ uiSuppressModal: true, ActionId: 2600 })
        .$promise.then(ctrl.getLocationSuccess, ctrl.getLocationFailure);
    };

    ctrl.getLocationSuccess = function (res) {
      $scope.locations = {
        masterLocations: [],
        selectedLocations: [],
        selectedLocationIds: [],
      };

      //ctrl.locationResult = $filter('orderBy')(res.Value, 'NameLine1');
      ctrl.locationResult = res.Value;

      $scope.locations.masterLocations = [
        {
          LocationId: null,
          NameLine1: 'All My Locations',
          Selected: false,
        },
      ];

      $scope.allLocations = angular.copy(
        $scope.locations.masterLocations.concat(ctrl.locationResult)
      );

      var dateNow = moment().format('MM/DD/YYYY');

      $scope.locations.masterLocations = [];

      angular.forEach($scope.allLocations, function (obj) {
        if (ctrl.userLocation !== null) {
          obj.Selected =
            obj.LocationId === ctrl.userLocation.id ||
            (ctrl.userLocation.filter &&
              ctrl.userLocation.filter(x => x.LocationId == obj.LocationId)
                .length > 0)
              ? true
              : false;
          if (obj.Selected) {
            $scope.locations.selectedLocations.push(obj);
          }
        }

        if (obj.DeactivationTimeUtc) {
          var toCheck = moment(obj.DeactivationTimeUtc).format('MM/DD/YYYY');
          if (
            moment(toCheck).isBefore(dateNow) ||
            moment(toCheck).isSame(dateNow)
          ) {
            obj.LocationStatus = 'Inactive';
            obj.SortOrder = 3;
          } else {
            obj.LocationStatus = 'Pending Inactive';
            obj.SortOrder = 2;
          }

          obj.NameLine1 =
            obj.NameLine1 +
            ' (' +
            timeZoneFactory.GetTimeZoneAbbr(obj.Timezone) +
            ')';
          obj.InactiveDate =
            '  -  ' + $filter('date')(obj.DeactivationTimeUtc, 'MM/dd/yyyy');
        } else {
          if (obj.LocationId) {
            obj.NameLine1 =
              obj.NameLine1 +
              ' (' +
              timeZoneFactory.GetTimeZoneAbbr(obj.Timezone) +
              ')';
            obj.LocationStatus = 'Active';
          } else {
            obj.LocationStatus = 'All Status';
          }
          obj.SortOrder = 1;
        }

        $scope.locations.masterLocations.push(obj);
      });

      $scope.locationsLoading = false;

      $scope.updateContents();
    };

    ctrl.getlocationFailure = function () {
      toastrFactory.error('Failed to retrieve locations', 'Error');
      $scope.locationsLoading = false;
    };

    $scope.updateContents = function () {
      $scope.masterLocationsSelected = $filter('filter')(
        $scope.locations.masterLocations,
        { Selected: true }
      );

      $scope.locations.selectedLocations = $scope.masterLocationsSelected;

      var locations = [];
      var same = true;

      if (
        $scope.masterLocationsSelected.length !== 0 &&
        $scope.masterLocationsSelected[0].LocationId !== null
      ) {
        angular.forEach($scope.masterLocationsSelected, function (location) {
          if (location.NameLine1 !== 'All My Locations') {
            locations.push(location.LocationId);
          }
        });
      } else if (
        $scope.masterLocationsSelected.length === 1 &&
        $scope.masterLocationsSelected[0].LocationId === null
      ) {
        locations.push(null);
      } else if ($scope.masterLocationsSelected.length === 0) {
        locations.push(0);
      }

      if (
        typeof $scope.oldSelection !== 'undefined' &&
        $scope.oldSelection.length === locations.length
      ) {
        angular.forEach(locations, function (obj) {
          var item = $filter('filter')($scope.oldSelection, obj);
          if (item.length === 0) {
            same = false;
          }
        });
      }
      if (
        typeof $scope.oldSelection === 'undefined' ||
        $scope.oldSelection.length !== locations.length ||
        same === false
      ) {
        $scope.locations.selectedLocationIds = locations;

        if (locations.length !== 0 && locations[0] !== 0) {
          $scope.oldSelection = locations;
          $scope.getTotalBalance(locations);

          $scope.receivablesAllAccountsGridOptions.updateFilter(
            'Locations',
            locations
          );
          $scope.receivablesBalanceCurrentGridOptions.updateFilter(
            'Locations',
            locations
          );
          $scope.receivablesBalance30GridOptions.updateFilter(
            'Locations',
            locations
          );
          $scope.receivablesBalance60GridOptions.updateFilter(
            'Locations',
            locations
          );
          $scope.receivablesBalance90GridOptions.updateFilter(
            'Locations',
            locations
          );
          $scope.receivablesInCollectionsGridOptions.updateFilter(
            'Locations',
            locations
          );

          $scope.receivablesAllAccountsByLocationGridOptions.updateFilter(
            'Locations',
            locations
          );
          $scope.receivablesBalanceCurrentByLocationGridOptions.updateFilter(
            'Locations',
            locations
          );
          $scope.receivablesBalance30ByLocationGridOptions.updateFilter(
            'Locations',
            locations
          );
          $scope.receivablesBalance60ByLocationGridOptions.updateFilter(
            'Locations',
            locations
          );
          $scope.receivablesBalance90ByLocationGridOptions.updateFilter(
            'Locations',
            locations
          );
          $scope.receivablesInCollectionsByLocationGridOptions.updateFilter(
            'Locations',
            locations
          );

          $scope.refreshGrids();
        }
      }
    };

    $scope.removeLocation = function (location) {
      location.Selected = false;
      $scope.updateContents();
    };

    // #endregion

    // #region Filter By Location

    ctrl.hideGrids = function () {
      $scope.receivablesAllAccountsGridOptions.isHidden = true;
      $scope.receivablesBalanceCurrentGridOptions.isHidden = true;
      $scope.receivablesBalance30GridOptions.isHidden = true;
      $scope.receivablesBalance60GridOptions.isHidden = true;
      $scope.receivablesBalance90GridOptions.isHidden = true;
      $scope.receivablesInCollectionsGridOptions.isHidden = true;

      $scope.receivablesAllAccountsByLocationGridOptions.isHidden = true;
      $scope.receivablesBalanceCurrentByLocationGridOptions.isHidden = true;
      $scope.receivablesBalance30ByLocationGridOptions.isHidden = true;
      $scope.receivablesBalance60ByLocationGridOptions.isHidden = true;
      $scope.receivablesBalance90ByLocationGridOptions.isHidden = true;
      $scope.receivablesInCollectionsByLocationGridOptions.isHidden = true;

      if ($scope.currentTab === 'allAccounts' && !$scope.filteredByLocation) {
        $scope.receivablesAllAccountsGridOptions.isHidden = false;
      } else if (
        $scope.currentTab === 'allAccounts' &&
        $scope.filteredByLocation
      ) {
        $scope.receivablesAllAccountsByLocationGridOptions.isHidden = false;
      } else if (
        $scope.currentTab === 'balanceCurrent' &&
        !$scope.filteredByLocation
      ) {
        $scope.receivablesBalanceCurrentGridOptions.isHidden = false;
      } else if (
        $scope.currentTab === 'balanceCurrent' &&
        $scope.filteredByLocation
      ) {
        $scope.receivablesBalanceCurrentByLocationGridOptions.isHidden = false;
      } else if (
        $scope.currentTab === 'balance30' &&
        !$scope.filteredByLocation
      ) {
        $scope.receivablesBalance30GridOptions.isHidden = false;
      } else if (
        $scope.currentTab === 'balance30' &&
        $scope.filteredByLocation
      ) {
        $scope.receivablesBalance30ByLocationGridOptions.isHidden = false;
      } else if (
        $scope.currentTab === 'balance60' &&
        !$scope.filteredByLocation
      ) {
        $scope.receivablesBalance60GridOptions.isHidden = false;
      } else if (
        $scope.currentTab === 'balance60' &&
        $scope.filteredByLocation
      ) {
        $scope.receivablesBalance60ByLocationGridOptions.isHidden = false;
      } else if (
        $scope.currentTab === 'balance90' &&
        !$scope.filteredByLocation
      ) {
        $scope.receivablesBalance90GridOptions.isHidden = false;
      } else if (
        $scope.currentTab === 'balance90' &&
        $scope.filteredByLocation
      ) {
        $scope.receivablesBalance90ByLocationGridOptions.isHidden = false;
      } else if (
        $scope.currentTab === 'inCollections' &&
        !$scope.filteredByLocation
      ) {
        $scope.receivablesInCollectionsGridOptions.isHidden = false;
      } else if (
        $scope.currentTab === 'inCollections' &&
        $scope.filteredByLocation
      ) {
        $scope.receivablesInCollectionsByLocationGridOptions.isHidden = false;
      }
    };

    ctrl.changeView = function () {
      $scope.filteredByLocation = $scope.selectedView === '1';
      $scope.additionalFilters[8].visible = !$scope.filteredByLocation;
      ctrl.hideGrids();
      $scope.getTotalBalance();
      $scope.refreshGrids();
      $rootScope.$broadcast('resetFiltersCount', true);
    };

    $scope.clearProviderFilter = function () {
      $scope.receivablesAllAccountsGridOptions.updateFilter(
        'ProvidersWithBalances',
        null
      );
      $scope.receivablesBalanceCurrentGridOptions.updateFilter(
        'ProvidersWithBalances',
        null
      );
      $scope.receivablesBalance30GridOptions.updateFilter(
        'ProvidersWithBalances',
        null
      );
      $scope.receivablesBalance60GridOptions.updateFilter(
        'ProvidersWithBalances',
        null
      );
      $scope.receivablesBalance90GridOptions.updateFilter(
        'ProvidersWithBalances',
        null
      );
      $scope.receivablesInCollectionsGridOptions.updateFilter(
        'ProvidersWithBalances',
        null
      );

      $scope.receivablesAllAccountsByLocationGridOptions.updateFilter(
        'ProvidersWithBalances',
        $scope.filteredByLocation
      );
      $scope.receivablesBalanceCurrentByLocationGridOptions.updateFilter(
        'ProvidersWithBalances',
        $scope.filteredByLocation
      );
      $scope.receivablesBalance30ByLocationGridOptions.updateFilter(
        'ProvidersWithBalances',
        $scope.filteredByLocation
      );
      $scope.receivablesBalance60ByLocationGridOptions.updateFilter(
        'ProvidersWithBalances',
        $scope.filteredByLocation
      );
      $scope.receivablesBalance90ByLocationGridOptions.updateFilter(
        'ProvidersWithBalances',
        $scope.filteredByLocation
      );
      $scope.receivablesInCollectionsByLocationGridOptions.updateFilter(
        'ProvidersWithBalances',
        $scope.filteredByLocation
      );

      ctrl.currentFilters.push({ key: 'ProvidersWithBalances', value: null });
    };

    // #endregion

    // #region Receivables Header

    //Receivables
    $scope.TotalReceivableBalance = 0.0;
    $scope.TotalBalancePatient = 0.0;
    $scope.TotalBalanceInsurance = 0.0;

    // Past due
    $scope.TotalPastDue = 0.0;
    $scope.TotalPastDuePatient = 0.0;
    $scope.TotalPastDueInsurance = 0.0;

    //Est Ins adj
    $scope.TotalReceivablesEstimatedInsuranceAdjustments = 0.0;

    //Net receivables
    $scope.TotalReceivablesNetBalance = 0.0;

    //Net receivables insurance.
    $scope.TotalNetReceivablesInsurance = 0.0;

    $scope.calculatingBalance = false;

    $scope.getTotalBalance = function (locations) {
      if (
        locations === null ||
        typeof locations === 'undefined' ||
        locations[0] === 0
      ) {
        locations = $scope.oldSelection;
        locations.uiSuppressModal = true;
      } else {
        locations.uiSuppressModal = true;
      }

      $scope.calculatingBalance = true;

      if ($scope.filteredByLocation) {
        receivablesService
          .getTotalBalanceByLocation(locations)
          .$promise.then(
            $scope.onGetTotalBalanceSuccess,
            $scope.onGetTotalBalanceFailure
          );
      } else {
        receivablesService
          .getTotalBalance(locations)
          .$promise.then(
            $scope.onGetTotalBalanceSuccess,
            $scope.onGetTotalBalanceFailure
          );
      }
    };

    $scope.onGetTotalBalanceSuccess = function (res) {
      $scope.calculatingBalance = false;
      if (res && res.Value) {
        $scope.ReceivablesAmount = res.Value.ReceivablesAmount;
        $scope.ReceivablesPatientAmount = res.Value.ReceivablesPatientAmount;
        $scope.ReceivablesInsuranceAmount =
          res.Value.ReceivablesInsuranceAmount;
        $scope.PastDueAmount = Number(res.Value.PastDueAmount.toFixed(2));
        $scope.PastDuePatientAmount = Number(
          res.Value.PastDuePatientAmount.toFixed(2)
        );
        $scope.PastDueInsuranceAmount = Number(
          res.Value.PastDueInsuranceAmount.toFixed(2)
        );
        $scope.EstimatedAdjustmentAmount = Number(
          res.Value.EstimatedAdjustmentAmount.toFixed(2)
        );
        $scope.NetReceivablesAmount = Number(
          res.Value.NetReceivablesAmount.toFixed(2)
        );
        $scope.NetReceivablesInsuranceAmount = Number(
          res.Value.NetReceivablesInsuranceAmount.toFixed(2)
        );
      }
      $('.idBalanceSpinner').hide();
      $scope.calculatingBalance = false;
    };

    $scope.onGetTotalBalanceFailure = function () {
      toastrFactory.error('Failed to retrieve total balance', 'Error');
    };

    // #endregion

    // #region Grid Actions

    $scope.navToPatientProfile = function (personId) {
      if (personId !== 'null') {
        var patientLocation = '#/Patient/';
        tabLauncher.launchNewTab(patientLocation + personId + '/Summary');
      }
      return '';
    };

    var selectedStatementId;
    ctrl.accountStatementPdfSuccess = function (res) {
      var file = new Blob([res.data], {
        type: 'application/pdf',
      });

      if (window.navigator && window.navigator.msSaveOrOpenBlob) {
        window.navigator.msSaveOrOpenBlob(file, selectedStatementId + '.pdf');
      } else {
        var fileUrl = URL.createObjectURL(file);
        $scope.pdfContent = fileUrl;
        window.open(fileUrl, '_blank');
      }
    };

    ctrl.accountStatementPdfFailure = function (error) {
      if (error) {
        toastrFactory.error(
          localize.getLocalizedString(
            error.status === 400
              ? 'Pdf template form is not available for generating PDF form'
              : error.data.InvalidProperties[0].ValidationMessage
          ),
          localize.getLocalizedString('Error')
        );
      }
    };

    $scope.navToLastStatement = function (statementId) {
      selectedStatementId = statementId;
      patientServices.AccountStatementSettings.GetAccountStatementPdf(
        '_soarapi_/accounts/accountstatement/' +
          statementId +
          '/GetAccountStatementPdf'
      ).then(ctrl.accountStatementPdfSuccess, ctrl.accountStatementPdfFailure);
    };

    // #endregion

    // #region All Accounts Grid

    $scope.receivablesAllAccountsGridOptions =
      ctrl.factories.allAccountsFactory;
    $scope.receivablesAllAccountsGridOptions.updateFilter(
      'HasUnappliedAmountZeroBalance',
      true
    );

    $scope.receivablesAllAccountsGridOptions.successAction = function (data) {
      $scope.receivablesAllAccountsDto = data.dto;
      $scope.receivablesTab.allAccountsCount = data.totalCount;
      $scope.receivablesTab.allAccountsBalance = data.dto.TotalBalance;
      if ($scope.currentTab === 'allAccounts' && !$scope.filteredByLocation) {
        $scope.additionalFilters[8].options[0].ValueControlOptions.List.length = 0;
        $scope.additionalFilters[8].options[0].ValueControlOptions.List = [];
        angular.forEach(data.dto.Providers, function (obj) {
          var selected = false;
          if (data.dto.FilterCriteria.ProvidersWithBalances != null) {
            var filtered = $filter('filter')(
              data.dto.FilterCriteria.ProvidersWithBalances,
              obj.Key
            );
            selected = filtered.length > 0 ? true : false;
          }

          var item = { Key: obj.Key, Value: obj.Value, Selected: selected };
          $scope.additionalFilters[8].options[0].ValueControlOptions.List.push(
            item
          );
        });

        $scope.additionalFilters[8].options[0].ValueControlOptions.IsLoaded =
          'true';
        $scope.disablePrint = data.totalCount === 0 ? true : false;
      }
    };

    $scope.receivablesAllAccountsGridOptions.actions.navToPatientProfile =
      $scope.navToPatientProfile;
    $scope.receivablesAllAccountsGridOptions.actions.navToLastStatement =
      $scope.navToLastStatement;

    // #endregion

    // #region All Accounts Grid By Location

    $scope.receivablesAllAccountsByLocationGridOptions =
      ctrl.factories.allAccountsByLocationFactory;
    $scope.receivablesAllAccountsByLocationGridOptions.updateFilter(
      'HasUnappliedAmountZeroBalance',
      true
    );

    $scope.receivablesAllAccountsByLocationGridOptions.successAction =
      function (data) {
        $scope.receivablesAllAccountsDto = data.dto;
        $scope.receivablesTab.allAccountsCount = data.totalCount;
        $scope.receivablesTab.allAccountsBalance = data.dto.TotalBalance;
        if ($scope.currentTab === 'allAccounts' && $scope.filteredByLocation) {
          $scope.disablePrint = data.totalCount === 0 ? true : false;
          $scope.additionalFilters[8].options[0].ValueControlOptions.List = [];
          angular.forEach(data.dto.Providers, function (obj) {
            var selected = false;
            if (data.dto.FilterCriteria.ProvidersWithBalances != null) {
              var filtered = $filter('filter')(
                data.dto.FilterCriteria.ProvidersWithBalances,
                obj.Key
              );
              selected = filtered.length > 0 ? true : false;
            }

            var item = { Key: obj.Key, Value: obj.Value, Selected: selected };
            $scope.additionalFilters[8].options[0].ValueControlOptions.List.push(
              item
            );
          });

          $scope.additionalFilters[8].options[0].ValueControlOptions.IsLoaded =
            'true';
        }
      };

    $scope.receivablesAllAccountsByLocationGridOptions.actions.navToPatientProfile =
      $scope.navToPatientProfile;
    $scope.receivablesAllAccountsByLocationGridOptions.actions.navToLastStatement =
      $scope.navToLastStatement;

    // #endregion

    // #region 0-30 Grid

    $scope.receivablesBalanceCurrentGridOptions =
      ctrl.factories.balanceCurrentFactory;
    $scope.receivablesBalanceCurrentGridOptions.updateFilter(
      'HasUnappliedAmountZeroBalance',
      true
    );
    $scope.receivablesBalanceCurrentGridOptions.additionalFilters.push({
      field: 'CurrentTab',
      filter: 'BalanceCurrent',
    });

    $scope.receivablesBalanceCurrentGridOptions.updateOnInit = false;
    $scope.receivablesBalanceCurrentGridOptions.successAction = function (
      data
    ) {
      $scope.receivablesBalanceCurrentDto = data.dto;
      $scope.receivablesTab.balanceCurrentCount = data.totalCount;
      $scope.receivablesTab.balanceCurrent = data.dto.TotalBalance;
      if (
        $scope.currentTab === 'balanceCurrent' &&
        !$scope.filteredByLocation
      ) {
        $scope.additionalFilters[8].options[0].ValueControlOptions.List.length = 0;
        $scope.additionalFilters[8].options[0].ValueControlOptions.List = [];
        angular.forEach(data.dto.Providers, function (obj) {
          var selected = false;
          if (data.dto.FilterCriteria.ProvidersWithBalances != null) {
            var filtered = $filter('filter')(
              data.dto.FilterCriteria.ProvidersWithBalances,
              obj.Key
            );
            selected = filtered.length > 0 ? true : false;
          }

          var item = {
            Key: obj.Key,
            Value: obj.Value,
            Selected: selected,
          };
          $scope.additionalFilters[8].options[0].ValueControlOptions.List.push(
            item
          );
        });

        $scope.additionalFilters[8].options[0].ValueControlOptions.IsLoaded =
          'true';
        $scope.disablePrint = data.totalCount === 0 ? true : false;
      }
    };

    $scope.receivablesBalanceCurrentGridOptions.actions.navToPatientProfile =
      $scope.navToPatientProfile;
    $scope.receivablesBalanceCurrentGridOptions.actions.navToLastStatement =
      $scope.navToLastStatement;

    // #endregion

    // #region 0-30 Grid By Location

    $scope.receivablesBalanceCurrentByLocationGridOptions =
      ctrl.factories.balanceCurrentByLocationFactory;
    $scope.receivablesBalanceCurrentByLocationGridOptions.updateFilter(
      'HasUnappliedAmountZeroBalance',
      true
    );
    $scope.receivablesBalanceCurrentByLocationGridOptions.additionalFilters.push(
      {
        field: 'CurrentTab',
        filter: 'BalanceCurrent',
      }
    );

    $scope.receivablesBalanceCurrentByLocationGridOptions.updateOnInit = false;
    $scope.receivablesBalanceCurrentByLocationGridOptions.successAction =
      function (data) {
        $scope.receivablesBalanceCurrentDto = data.dto;
        $scope.receivablesTab.balanceCurrentCount = data.totalCount;
        $scope.receivablesTab.balanceCurrent = data.dto.TotalBalance;
        if (
          $scope.currentTab === 'balanceCurrent' &&
          $scope.filteredByLocation
        ) {
          $scope.additionalFilters[8].options[0].ValueControlOptions.List = [];
          angular.forEach(data.dto.Providers, function (obj) {
            var selected = false;
            if (data.dto.FilterCriteria.ProvidersWithBalances != null) {
              var filtered = $filter('filter')(
                data.dto.FilterCriteria.ProvidersWithBalances,
                obj.Key
              );
              selected = filtered.length > 0 ? true : false;
            }

            var item = { Key: obj.Key, Value: obj.Value, Selected: selected };
            $scope.additionalFilters[8].options[0].ValueControlOptions.List.push(
              item
            );
          });

          $scope.additionalFilters[8].options[0].ValueControlOptions.IsLoaded =
            'true';

          $scope.disablePrint = data.totalCount === 0 ? true : false;
        }
      };

    $scope.receivablesBalanceCurrentByLocationGridOptions.actions.navToPatientProfile =
      $scope.navToPatientProfile;
    $scope.receivablesBalanceCurrentByLocationGridOptions.actions.navToLastStatement =
      $scope.navToLastStatement;

    // #endregion

    // #region 31-60 Grid

    $scope.receivablesBalance30GridOptions = ctrl.factories.balance30Factory;
    $scope.receivablesBalance30GridOptions.updateFilter(
      'HasUnappliedAmountZeroBalance',
      true
    );
    $scope.receivablesBalance30GridOptions.additionalFilters.push({
      field: 'CurrentTab',
      filter: 'Balance30',
    });

    $scope.receivablesBalance30GridOptions.updateOnInit = false;
    $scope.receivablesBalance30GridOptions.successAction = function (data) {
      $scope.receivablesBalance30Dto = data.dto;
      $scope.receivablesTab.balance30Count = data.totalCount;
      $scope.receivablesTab.balance30 = data.dto.TotalBalance;
      if ($scope.currentTab === 'balance30' && !$scope.filteredByLocation) {
        $scope.additionalFilters[8].options[0].ValueControlOptions.List.length = 0;
        $scope.additionalFilters[8].options[0].ValueControlOptions.List = [];
        angular.forEach(data.dto.Providers, function (obj) {
          var selected = false;
          if (data.dto.FilterCriteria.ProvidersWithBalances != null) {
            var filtered = $filter('filter')(
              data.dto.FilterCriteria.ProvidersWithBalances,
              obj.Key
            );
            selected = filtered.length > 0 ? true : false;
          }

          var item = {
            Key: obj.Key,
            Value: obj.Value,
            Selected: selected,
          };
          $scope.additionalFilters[8].options[0].ValueControlOptions.List.push(
            item
          );
        });

        $scope.additionalFilters[8].options[0].ValueControlOptions.IsLoaded =
          'true';
        $scope.disablePrint = data.totalCount === 0 ? true : false;
      }
    };

    $scope.receivablesBalance30GridOptions.actions.navToPatientProfile =
      $scope.navToPatientProfile;
    $scope.receivablesBalance30GridOptions.actions.navToLastStatement =
      $scope.navToLastStatement;

    // #endregion

    // #region 31-60 Grid By Location

    $scope.receivablesBalance30ByLocationGridOptions =
      ctrl.factories.balance30ByLocationFactory;
    $scope.receivablesBalance30ByLocationGridOptions.updateFilter(
      'HasUnappliedAmountZeroBalance',
      true
    );
    $scope.receivablesBalance30ByLocationGridOptions.additionalFilters.push({
      field: 'CurrentTab',
      filter: 'Balance30',
    });

    $scope.receivablesBalance30ByLocationGridOptions.updateOnInit = false;
    $scope.receivablesBalance30ByLocationGridOptions.successAction = function (
      data
    ) {
      $scope.receivablesBalance30Dto = data.dto;
      $scope.receivablesTab.balance30Count = data.totalCount;
      $scope.receivablesTab.balance30 = data.dto.TotalBalance;
      if ($scope.currentTab === 'balance30' && $scope.filteredByLocation) {
        $scope.additionalFilters[8].options[0].ValueControlOptions.List = [];
        angular.forEach(data.dto.Providers, function (obj) {
          var selected = false;
          if (data.dto.FilterCriteria.ProvidersWithBalances != null) {
            var filtered = $filter('filter')(
              data.dto.FilterCriteria.ProvidersWithBalances,
              obj.Key
            );
            selected = filtered.length > 0 ? true : false;
          }

          var item = { Key: obj.Key, Value: obj.Value, Selected: selected };
          $scope.additionalFilters[8].options[0].ValueControlOptions.List.push(
            item
          );
        });

        $scope.additionalFilters[8].options[0].ValueControlOptions.IsLoaded =
          'true';

        $scope.disablePrint = data.totalCount === 0 ? true : false;
      }
    };

    $scope.receivablesBalance30ByLocationGridOptions.actions.navToPatientProfile =
      $scope.navToPatientProfile;
    $scope.receivablesBalance30ByLocationGridOptions.actions.navToLastStatement =
      $scope.navToLastStatement;

    // #endregion

    // #region 61-90 Grid

    $scope.receivablesBalance60GridOptions = ctrl.factories.balance60Factory;
    $scope.receivablesBalance60GridOptions.updateFilter(
      'HasUnappliedAmountZeroBalance',
      true
    );
    $scope.receivablesBalance60GridOptions.additionalFilters.push({
      field: 'CurrentTab',
      filter: 'Balance60',
    });

    $scope.receivablesBalance60GridOptions.updateOnInit = false;
    $scope.receivablesBalance60GridOptions.successAction = function (data) {
      $scope.receivablesBalance60Dto = data.dto;
      $scope.receivablesTab.balance60Count = data.totalCount;
      $scope.receivablesTab.balance60 = data.dto.TotalBalance;
      if ($scope.currentTab === 'balance60' && !$scope.filteredByLocation) {
        $scope.additionalFilters[8].options[0].ValueControlOptions.List.length = 0;
        $scope.additionalFilters[8].options[0].ValueControlOptions.List = [];
        angular.forEach(data.dto.Providers, function (obj) {
          var selected = false;
          if (data.dto.FilterCriteria.ProvidersWithBalances != null) {
            var filtered = $filter('filter')(
              data.dto.FilterCriteria.ProvidersWithBalances,
              obj.Key
            );
            selected = filtered.length > 0 ? true : false;
          }

          var item = { Key: obj.Key, Value: obj.Value, Selected: selected };
          $scope.additionalFilters[8].options[0].ValueControlOptions.List.push(
            item
          );
        });

        $scope.additionalFilters[8].options[0].ValueControlOptions.IsLoaded =
          'true';
        $scope.disablePrint = data.totalCount === 0 ? true : false;
      }
    };

    $scope.receivablesBalance60GridOptions.actions.navToPatientProfile =
      $scope.navToPatientProfile;
    $scope.receivablesBalance60GridOptions.actions.navToLastStatement =
      $scope.navToLastStatement;

    // #endregion

    // #region 61-90 Grid ByLocation

    $scope.receivablesBalance60ByLocationGridOptions =
      ctrl.factories.balance60ByLocationFactory;
    $scope.receivablesBalance60ByLocationGridOptions.updateFilter(
      'HasUnappliedAmountZeroBalance',
      true
    );
    $scope.receivablesBalance60ByLocationGridOptions.additionalFilters.push({
      field: 'CurrentTab',
      filter: 'Balance60',
    });

    $scope.receivablesBalance60ByLocationGridOptions.updateOnInit = false;
    $scope.receivablesBalance60ByLocationGridOptions.successAction = function (
      data
    ) {
      $scope.receivablesBalance60Dto = data.dto;
      $scope.receivablesTab.balance60Count = data.totalCount;
      $scope.receivablesTab.balance60 = data.dto.TotalBalance;
      if ($scope.currentTab === 'balance60' && $scope.filteredByLocation) {
        $scope.additionalFilters[8].options[0].ValueControlOptions.List = [];
        angular.forEach(data.dto.Providers, function (obj) {
          var selected = false;
          if (data.dto.FilterCriteria.ProvidersWithBalances != null) {
            var filtered = $filter('filter')(
              data.dto.FilterCriteria.ProvidersWithBalances,
              obj.Key
            );
            selected = filtered.length > 0 ? true : false;
          }

          var item = { Key: obj.Key, Value: obj.Value, Selected: selected };
          $scope.additionalFilters[8].options[0].ValueControlOptions.List.push(
            item
          );
        });

        $scope.additionalFilters[8].options[0].ValueControlOptions.IsLoaded =
          'true';

        $scope.disablePrint = data.totalCount === 0 ? true : false;
      }
    };

    $scope.receivablesBalance60ByLocationGridOptions.actions.navToPatientProfile =
      $scope.navToPatientProfile;
    $scope.receivablesBalance60ByLocationGridOptions.actions.navToLastStatement =
      $scope.navToLastStatement;

    // #endregion

    // #region > 90 Grid

    $scope.receivablesBalance90GridOptions = ctrl.factories.balance90Factory;
    $scope.receivablesBalance90GridOptions.updateFilter(
      'HasUnappliedAmountZeroBalance',
      true
    );
    $scope.receivablesBalance90GridOptions.additionalFilters.push({
      field: 'CurrentTab',
      filter: 'Balance90',
    });

    $scope.receivablesBalance90GridOptions.updateOnInit = false;
    $scope.receivablesBalance90GridOptions.successAction = function (data) {
      $scope.receivablesBalance90Dto = data.dto;
      $scope.receivablesTab.balance90Count = data.totalCount;
      $scope.receivablesTab.balance90 = data.dto.TotalBalance;
      if ($scope.currentTab === 'balance90' && !$scope.filteredByLocation) {
        $scope.additionalFilters[8].options[0].ValueControlOptions.List.length = 0;
        $scope.additionalFilters[8].options[0].ValueControlOptions.List = [];
        angular.forEach(data.dto.Providers, function (obj) {
          var selected = false;
          if (data.dto.FilterCriteria.ProvidersWithBalances != null) {
            var filtered = $filter('filter')(
              data.dto.FilterCriteria.ProvidersWithBalances,
              obj.Key
            );
            selected = filtered.length > 0 ? true : false;
          }

          var item = {
            Key: obj.Key,
            Value: obj.Value,
            Selected: selected,
          };
          $scope.additionalFilters[8].options[0].ValueControlOptions.List.push(
            item
          );
        });

        $scope.additionalFilters[8].options[0].ValueControlOptions.IsLoaded =
          'true';
        $scope.disablePrint = data.totalCount === 0 ? true : false;
      }
    };

    $scope.receivablesBalance90GridOptions.actions.navToPatientProfile =
      $scope.navToPatientProfile;
    $scope.receivablesBalance90GridOptions.actions.navToLastStatement =
      $scope.navToLastStatement;

    // #endregion

    // #region > 90 Grid By Location

    $scope.receivablesBalance90ByLocationGridOptions =
      ctrl.factories.balance90ByLocationFactory;
    $scope.receivablesBalance90ByLocationGridOptions.updateFilter(
      'HasUnappliedAmountZeroBalance',
      true
    );
    $scope.receivablesBalance90ByLocationGridOptions.additionalFilters.push({
      field: 'CurrentTab',
      filter: 'Balance90',
    });

    $scope.receivablesBalance90ByLocationGridOptions.updateOnInit = false;
    $scope.receivablesBalance90ByLocationGridOptions.successAction = function (
      data
    ) {
      $scope.receivablesBalance90Dto = data.dto;
      $scope.receivablesTab.balance90Count = data.totalCount;
      $scope.receivablesTab.balance90 = data.dto.TotalBalance;
      if ($scope.currentTab === 'balance90' && $scope.filteredByLocation) {
        $scope.additionalFilters[8].options[0].ValueControlOptions.List = [];
        angular.forEach(data.dto.Providers, function (obj) {
          var selected = false;
          if (data.dto.FilterCriteria.ProvidersWithBalances != null) {
            var filtered = $filter('filter')(
              data.dto.FilterCriteria.ProvidersWithBalances,
              obj.Key
            );
            selected = filtered.length > 0 ? true : false;
          }

          var item = { Key: obj.Key, Value: obj.Value, Selected: selected };
          $scope.additionalFilters[8].options[0].ValueControlOptions.List.push(
            item
          );
        });

        $scope.additionalFilters[8].options[0].ValueControlOptions.IsLoaded =
          'true';

        $scope.disablePrint = data.totalCount === 0 ? true : false;
      }
    };

    $scope.receivablesBalance90ByLocationGridOptions.actions.navToPatientProfile =
      $scope.navToPatientProfile;
    $scope.receivablesBalance90ByLocationGridOptions.actions.navToLastStatement =
      $scope.navToLastStatement;

    // #endregion

    // #region In Collections

    $scope.receivablesInCollectionsGridOptions =
      ctrl.factories.inCollectionsFactory;
    $scope.receivablesInCollectionsGridOptions.updateFilter(
      'HasUnappliedAmountZeroBalance',
      true
    );
    $scope.receivablesInCollectionsGridOptions.additionalFilters.push({
      field: 'CurrentTab',
      filter: 'InCollections',
    });

    $scope.receivablesInCollectionsGridOptions.updateOnInit = false;
    $scope.receivablesInCollectionsGridOptions.successAction = function (data) {
      $scope.receivablesInCollectionsDto = data.dto;
      $scope.receivablesTab.inCollectionsCount = data.totalCount;
      $scope.receivablesTab.inCollections = data.dto.TotalBalance;
      if ($scope.currentTab === 'inCollections' && !$scope.filteredByLocation) {
        $scope.additionalFilters[8].options[0].ValueControlOptions.List.length = 0;
        $scope.additionalFilters[8].options[0].ValueControlOptions.List = [];
        angular.forEach(data.dto.Providers, function (obj) {
          var selected = false;
          if (data.dto.FilterCriteria.ProvidersWithBalances != null) {
            var filtered = $filter('filter')(
              data.dto.FilterCriteria.ProvidersWithBalances,
              obj.Key
            );
            selected = filtered.length > 0 ? true : false;
          }

          var item = {
            Key: obj.Key,
            Value: obj.Value,
            Selected: selected,
          };
          $scope.additionalFilters[8].options[0].ValueControlOptions.List.push(
            item
          );
        });

        $scope.additionalFilters[8].options[0].ValueControlOptions.IsLoaded =
          'true';
        $scope.disablePrint = data.totalCount === 0 ? true : false;
      }
    };

    $scope.receivablesInCollectionsGridOptions.actions.navToPatientProfile =
      $scope.navToPatientProfile;
    $scope.receivablesInCollectionsGridOptions.actions.navToLastStatement =
      $scope.navToLastStatement;

    // #endregion

    // #region In Collections

    $scope.receivablesInCollectionsByLocationGridOptions =
      ctrl.factories.inCollectionsByLocationFactory;
    $scope.receivablesInCollectionsByLocationGridOptions.updateFilter(
      'HasUnappliedAmountZeroBalance',
      true
    );
    $scope.receivablesInCollectionsByLocationGridOptions.additionalFilters.push(
      {
        field: 'CurrentTab',
        filter: 'InCollections',
      }
    );

    $scope.receivablesInCollectionsByLocationGridOptions.updateOnInit = false;
    $scope.receivablesInCollectionsByLocationGridOptions.successAction =
      function (data) {
        $scope.receivablesInCollectionsDto = data.dto;
        $scope.receivablesTab.inCollectionsCount = data.totalCount;
        $scope.receivablesTab.inCollections = data.dto.TotalBalance;
        if (
          $scope.currentTab === 'inCollections' &&
          $scope.filteredByLocation
        ) {
          $scope.additionalFilters[8].options[0].ValueControlOptions.List = [];
          angular.forEach(data.dto.Providers, function (obj) {
            var selected = false;
            if (data.dto.FilterCriteria.ProvidersWithBalances != null) {
              var filtered = $filter('filter')(
                data.dto.FilterCriteria.ProvidersWithBalances,
                obj.Key
              );
              selected = filtered.length > 0 ? true : false;
            }

            var item = { Key: obj.Key, Value: obj.Value, Selected: selected };
            $scope.additionalFilters[8].options[0].ValueControlOptions.List.push(
              item
            );
          });

          $scope.additionalFilters[8].options[0].ValueControlOptions.IsLoaded =
            'true';

          $scope.disablePrint = data.totalCount === 0 ? true : false;
        }
      };

    $scope.receivablesInCollectionsByLocationGridOptions.actions.navToPatientProfile =
      $scope.navToPatientProfile;
    $scope.receivablesInCollectionsByLocationGridOptions.actions.navToLastStatement =
      $scope.navToLastStatement;

    // #endregion

    // #region Common Functions
    $scope.scrollToTop = function () {
      $('html, body').animate({ scrollTop: 0 }, 'fast');
    };

    $scope.showHideFilter = function () {
      $scope.showFilter = !$scope.showFilter;
      if ($scope.showFilter) {
        $scope.showHideFilterLabel = 'Hide Filters';
        $('#gridGroup').removeClass();
        $('#gridGroup').addClass('col-xs-9 col-sm-9 col-md-9');
        //var balanceForProviderFilter = document.getElementById('AccountsWithBalanceforProvider');
        //if ($scope.filteredByLocation) {
        //    balanceForProviderFilter.style = 'display: block;';
        //}
        //else {
        //    balanceForProviderFilter.style = 'display: none;';
        //    $scope.clearProviderFilter();
        //}
      } else {
        $scope.showHideFilterLabel = 'Show Filters';
        $('#gridGroup').removeClass();
        $('#gridGroup').addClass('col-xs-12 col-sm-12 col-md-12');
      }
    };

    $scope.refreshGridTotals = function () {
      if ($scope.locations.selectedLocationIds[0] === 0)
        $scope.locations.selectedLocationIds = $scope.oldSelection;

      var data = {
        FilterCriteria: {
          Locations: $scope.locations.selectedLocationIds,
          HasUnappliedAmountZeroBalance: true,
          FilterByLocation: $scope.filteredByLocation,
        },
        uiSuppressModal: true,
      };

      angular.forEach(ctrl.currentFilters, function (filter) {
        data.FilterCriteria[filter.key] = filter.value;
      });

      receivablesService
        .getGridTotals(data)
        .$promise.then(
          $scope.onRefreshGridTotalsSuccess,
          $scope.onRefreshGridTotalsFailure
        );
    };

    $scope.onRefreshGridTotalsSuccess = function (data) {
      if ($scope.currentTab !== 'allAccounts') {
        $scope.receivablesTab.allAccountsCount = data.Value.BalanceAllCount;
        $scope.receivablesTab.allAccountsBalance = data.Value.BalanceAllTotal;
      }
      if ($scope.currentTab !== 'balanceCurrent') {
        $scope.receivablesTab.balanceCurrentCount =
          data.Value.BalanceCurrentCount;
        $scope.receivablesTab.balanceCurrent = data.Value.BalanceCurrentTotal;
      }
      if ($scope.currentTab !== 'balance30') {
        $scope.receivablesTab.balance30Count = data.Value.Balance30Count;
        $scope.receivablesTab.balance30 = data.Value.Balance30Total;
      }
      if ($scope.currentTab !== 'balance60') {
        $scope.receivablesTab.balance60Count = data.Value.Balance60Count;
        $scope.receivablesTab.balance60 = data.Value.Balance60Total;
      }
      if ($scope.currentTab !== 'balance90') {
        $scope.receivablesTab.balance90Count = data.Value.Balance90Count;
        $scope.receivablesTab.balance90 = data.Value.Balance90Total;
      }
      if ($scope.currentTab !== 'inCollections') {
        $scope.receivablesTab.inCollectionsCount =
          data.Value.InCollectionsCount;
        $scope.receivablesTab.inCollections = data.Value.InCollectionsTotal;
      }
    };

    $scope.onRefreshGridTotalsFailure = function () {
      toastrFactory.error('Failed to retrieve grid totals', 'Error');
    };

    ctrl.refreshData = function () {
      $scope.receivablesAllAccountsGridOptions.updateFilter(
        'FilterByLocation',
        $scope.filteredByLocation
      );
      $scope.receivablesBalanceCurrentGridOptions.updateFilter(
        'FilterByLocation',
        $scope.filteredByLocation
      );
      $scope.receivablesBalance30GridOptions.updateFilter(
        'FilterByLocation',
        $scope.filteredByLocation
      );
      $scope.receivablesBalance60GridOptions.updateFilter(
        'FilterByLocation',
        $scope.filteredByLocation
      );
      $scope.receivablesBalance90GridOptions.updateFilter(
        'FilterByLocation',
        $scope.filteredByLocation
      );
      $scope.receivablesInCollectionsGridOptions.updateFilter(
        'FilterByLocation',
        $scope.filteredByLocation
      );

      $scope.receivablesAllAccountsByLocationGridOptions.updateFilter(
        'FilterByLocation',
        $scope.filteredByLocation
      );
      $scope.receivablesBalanceCurrentByLocationGridOptions.updateFilter(
        'FilterByLocation',
        $scope.filteredByLocation
      );
      $scope.receivablesBalance30ByLocationGridOptions.updateFilter(
        'FilterByLocation',
        $scope.filteredByLocation
      );
      $scope.receivablesBalance60ByLocationGridOptions.updateFilter(
        'FilterByLocation',
        $scope.filteredByLocation
      );
      $scope.receivablesBalance90ByLocationGridOptions.updateFilter(
        'FilterByLocation',
        $scope.filteredByLocation
      );
      $scope.receivablesInCollectionsByLocationGridOptions.updateFilter(
        'FilterByLocation',
        $scope.filteredByLocation
      );

      if ($scope.currentTab === 'allAccounts' && !$scope.filteredByLocation) {
        $scope.receivablesAllAccountsGridOptions.refresh();
      } else if (
        $scope.currentTab === 'allAccounts' &&
        $scope.filteredByLocation
      ) {
        $scope.receivablesAllAccountsByLocationGridOptions.refresh();
      } else if (
        $scope.currentTab === 'balanceCurrent' &&
        !$scope.filteredByLocation
      ) {
        $scope.receivablesBalanceCurrentGridOptions.refresh();
      } else if (
        $scope.currentTab === 'balanceCurrent' &&
        $scope.filteredByLocation
      ) {
        $scope.receivablesBalanceCurrentByLocationGridOptions.refresh();
      } else if (
        $scope.currentTab === 'balance30' &&
        !$scope.filteredByLocation
      ) {
        $scope.receivablesBalance30GridOptions.refresh();
      } else if (
        $scope.currentTab === 'balance30' &&
        $scope.filteredByLocation
      ) {
        $scope.receivablesBalance30ByLocationGridOptions.refresh();
      } else if (
        $scope.currentTab === 'balance60' &&
        !$scope.filteredByLocation
      ) {
        $scope.receivablesBalance60GridOptions.refresh();
      } else if (
        $scope.currentTab === 'balance60' &&
        $scope.filteredByLocation
      ) {
        $scope.receivablesBalance60ByLocationGridOptions.refresh();
      } else if (
        $scope.currentTab === 'balance90' &&
        !$scope.filteredByLocation
      ) {
        $scope.receivablesBalance90GridOptions.refresh();
      } else if (
        $scope.currentTab === 'balance90' &&
        $scope.filteredByLocation
      ) {
        $scope.receivablesBalance90ByLocationGridOptions.refresh();
      } else if (
        $scope.currentTab === 'inCollections' &&
        !$scope.filteredByLocation
      ) {
        $scope.receivablesInCollectionsGridOptions.refresh();
      } else if (
        $scope.currentTab === 'inCollections' &&
        $scope.filteredByLocation
      ) {
        $scope.receivablesInCollectionsByLocationGridOptions.refresh();
      }
    };

    $scope.refreshGrids = function () {
      $scope.refreshGridTotals();
      $scope.additionalFilters[8].options[0].ValueControlOptions.IsLoaded =
        'false';
      ctrl.refreshData();
    };

    $scope.$on('refreshGrids', function () {
      $timeout(function () {
        $scope.refreshGrids();
        $scope.getTotalBalance($scope.oldSelection);
      }, 1000);
    });

    $scope.activateTab = function (event) {
      $scope.disablePrint = true;
      $('#tiles div button').css({
        'background-color': 'white',
        color: 'dimgray',
      });
      if (event.currentTarget.id === 'inCollections') {
        $(event.currentTarget).css({
          'background-color': 'red',
          color: 'white',
        });
      } else {
        $(event.currentTarget).css({
          'background-color': 'dimgray',
          color: 'white',
        });
      }

      $scope.currentTab = event.currentTarget.id;
      ctrl.hideGrids();
      ctrl.refreshData();
    };

    // #endregion

    // #region Print Grid
    $scope.printGrid = function () {
      var gridTotals = document.querySelector('#gridTotals').innerHTML;
      var tabTiles = document.querySelector('#tabTiles').innerHTML;
      var printableColumns = $scope.filteredByLocation
        ? $filter('filter')(
            $scope.receivablesAllAccountsByLocationGridOptions.columnDefinition,
            { printable: true }
          )
        : $filter('filter')(
            $scope.receivablesAllAccountsGridOptions.columnDefinition,
            { printable: true }
          );
      var printLocations =
        $scope.masterLocationsSelected.length !==
        $scope.locations.masterLocations.length
          ? $scope.masterLocationsSelected
          : [];

      if ($scope.currentTab === 'allAccounts') {
        ctrl.allAccountsPrint = gridPrintFactory.CreateOptions();
        ctrl.allAccountsPrint.tabTitle = 'Print Receivables';
        ctrl.allAccountsPrint.query =
          $scope.receivablesAllAccountsGridOptions.query;
        ctrl.allAccountsPrint.filterCriteria =
          $scope.receivablesAllAccountsDto.FilterCriteria;
        ctrl.allAccountsPrint.sortCriteria =
          $scope.receivablesAllAccountsDto.SortCriteria;
        ctrl.allAccountsPrint.headerCaption = 'Receivables All Accounts';
        ctrl.allAccountsPrint.locations = printLocations;
        ctrl.allAccountsPrint.columnDefinition = printableColumns;
        ctrl.allAccountsPrint.gridTotals = gridTotals;
        ctrl.allAccountsPrint.tabTiles = tabTiles;
        ctrl.allAccountsPrint.getPrintHtml();
      } else if ($scope.currentTab === 'balanceCurrent') {
        ctrl.balanceCurrentPrint = gridPrintFactory.CreateOptions();
        ctrl.balanceCurrentPrint.tabTitle = 'Print Receivables';
        ctrl.balanceCurrentPrint.query =
          $scope.receivablesBalanceCurrentGridOptions.query;
        ctrl.balanceCurrentPrint.filterCriteria =
          $scope.receivablesBalanceCurrentDto.FilterCriteria;
        ctrl.balanceCurrentPrint.sortCriteria =
          $scope.receivablesBalanceCurrentDto.SortCriteria;
        ctrl.balanceCurrentPrint.headerCaption = 'Receivables 0-30 Days';
        ctrl.balanceCurrentPrint.locations = printLocations;
        ctrl.balanceCurrentPrint.columnDefinition = printableColumns;
        ctrl.balanceCurrentPrint.gridTotals = gridTotals;
        ctrl.balanceCurrentPrint.tabTiles = tabTiles;
        ctrl.balanceCurrentPrint.getPrintHtml();
      } else if ($scope.currentTab === 'balance30') {
        ctrl.balance30Print = gridPrintFactory.CreateOptions();
        ctrl.balance30Print.tabTitle = 'Print Receivables';
        ctrl.balance30Print.query =
          $scope.receivablesBalance30GridOptions.query;
        ctrl.balance30Print.filterCriteria =
          $scope.receivablesBalance30Dto.FilterCriteria;
        ctrl.balance30Print.sortCriteria =
          $scope.receivablesBalance30Dto.SortCriteria;
        ctrl.balance30Print.headerCaption = 'Receivables 31-60 Days';
        ctrl.balance30Print.locations = printLocations;
        ctrl.balance30Print.columnDefinition = printableColumns;
        ctrl.balance30Print.gridTotals = gridTotals;
        ctrl.balance30Print.tabTiles = tabTiles;
        ctrl.balance30Print.getPrintHtml();
      } else if ($scope.currentTab === 'balance60') {
        ctrl.balance60Print = gridPrintFactory.CreateOptions();
        ctrl.balance60Print.tabTitle = 'Print Receivables';
        ctrl.balance60Print.query =
          $scope.receivablesBalance60GridOptions.query;
        ctrl.balance60Print.filterCriteria =
          $scope.receivablesBalance60Dto.FilterCriteria;
        ctrl.balance60Print.sortCriteria =
          $scope.receivablesBalance60Dto.SortCriteria;
        ctrl.balance60Print.headerCaption = 'Receivables 61-90 Days';
        ctrl.balance60Print.locations = printLocations;
        ctrl.balance60Print.columnDefinition = printableColumns;
        ctrl.balance60Print.gridTotals = gridTotals;
        ctrl.balance60Print.tabTiles = tabTiles;
        ctrl.balance60Print.getPrintHtml();
      } else if ($scope.currentTab === 'balance90') {
        ctrl.balance90Print = gridPrintFactory.CreateOptions();
        ctrl.balance90Print.tabTitle = 'Print Receivables';
        ctrl.balance90Print.query =
          $scope.receivablesBalance90GridOptions.query;
        ctrl.balance90Print.filterCriteria =
          $scope.receivablesBalance90Dto.FilterCriteria;
        ctrl.balance90Print.sortCriteria =
          $scope.receivablesBalance90Dto.SortCriteria;
        ctrl.balance90Print.headerCaption = 'Receivables 90+ Days';
        ctrl.balance90Print.locations = printLocations;
        ctrl.balance90Print.columnDefinition = printableColumns;
        ctrl.balance90Print.gridTotals = gridTotals;
        ctrl.balance90Print.tabTiles = tabTiles;
        ctrl.balance90Print.getPrintHtml();
      } else if ($scope.currentTab === 'inCollections') {
        ctrl.inCollectionsPrint = gridPrintFactory.CreateOptions();
        ctrl.inCollectionsPrint.tabTitle = 'Print Receivables';
        ctrl.inCollectionsPrint.query =
          $scope.receivablesInCollectionsGridOptions.query;
        ctrl.inCollectionsPrint.filterCriteria =
          $scope.receivablesInCollectionsDto.FilterCriteria;
        ctrl.inCollectionsPrint.sortCriteria =
          $scope.receivablesInCollectionsDto.SortCriteria;
        ctrl.inCollectionsPrint.headerCaption = 'Receivables In Collections';
        ctrl.inCollectionsPrint.locations = printLocations;
        ctrl.inCollectionsPrint.columnDefinition = printableColumns;
        ctrl.inCollectionsPrint.gridTotals = gridTotals;
        ctrl.inCollectionsPrint.tabTiles = tabTiles;
        ctrl.inCollectionsPrint.getPrintHtml();
      }
    };
    //#endregion

    //#region Export to CSV
    var exportSuccess = function (result) {
      var csv = '';
      for (var i = 0; i < result.length; i++) {
        csv += result[i];
      }

      result = csv;

      var filename = ctrl.filename;

      if (navigator.msSaveBlob) {
        var blob = new Blob([result], {
          type: 'text/csv;charset=utf-8;',
        });

        window.navigator.msSaveOrOpenBlob(blob, filename);
      } else {
        var element = document.createElement('a');
        element.setAttribute(
          'href',
          'data:text/plain;charset=utf-8,' + encodeURIComponent(result)
        );
        element.setAttribute('download', filename);
        element.setAttribute('target', '_blank');
        element.style.display = 'none';
        document.body.appendChild(element);

        element.click();

        document.body.removeChild(element);
      }
    };

    var exportFailure = function () {
      toastrFactory.error(
        localize.getLocalizedString('{0} failed to export.', [
          'Receivable parties',
        ])
      );
    };

    $scope.exportCSV = function () {
      if (!$scope.disablePrint) {
        if ($scope.currentTab === 'allAccounts') {
          $scope.activeGridDto = $scope.receivablesAllAccountsDto;
          ctrl.filename =
            'Receivables_All_' + moment().format('YYYY-MM-DD') + '.csv';
        } else if ($scope.currentTab === 'balanceCurrent') {
          $scope.activeGridDto = $scope.receivablesBalanceCurrentDto;
          ctrl.filename =
            'Receivables_0-30_' + moment().format('YYYY-MM-DD') + '.csv';
        } else if ($scope.currentTab === 'balance30') {
          $scope.activeGridDto = $scope.receivablesBalance30Dto;
          ctrl.filename =
            'Receivables_31-60_' + moment().format('YYYY-MM-DD') + '.csv';
        } else if ($scope.currentTab === 'balance60') {
          $scope.activeGridDto = $scope.receivablesBalance60Dto;
          ctrl.filename =
            'Receivables_61-90_' + moment().format('YYYY-MM-DD') + '.csv';
        } else if ($scope.currentTab === 'balance90') {
          $scope.activeGridDto = $scope.receivablesBalance90Dto;
          ctrl.filename =
            'Receivables_over90_' + moment().format('YYYY-MM-DD') + '.csv';
        } else if ($scope.currentTab === 'inCollections') {
          $scope.activeGridDto = $scope.receivablesInCollectionsDto;
          ctrl.filename =
            'Receivables_InCollections_' +
            moment().format('YYYY-MM-DD') +
            '.csv';
        }

        receivablesTabService
          .ExportToCSVFile($scope.activeGridDto)
          .$promise.then(exportSuccess, exportFailure);
      }
    };
    //#endregion

    ctrl.showWarningModal = function () {
      // modalFactory.CancelModal().then(ctrl.confirmCancel);
      var message = localize.getLocalizedString('{0}', [
        'More than 200 records.',
      ]);
      var title = localize.getLocalizedString('Warning!');
      var button2Text = localize.getLocalizedString('Ok');
      modalFactory
        .ConfirmModal(title, message, button2Text)
        .then(ctrl.cancelSave, ctrl.resumeSave);
    };

    $scope.printMailinglabels = function () {
      $scope.mailingTitle = 'Account';
      if (
        $scope.disableMailing != true &&
        $scope.disablePrint != true &&
        !$scope.disablePrintMailing
      ) {
        var strTitle = {
          title: $scope.mailingTitle,
          activeFltrTab: '0',
          activeGridDataCount:
            $scope.currentTab === 'allAccounts'
              ? $scope.receivablesTab.allAccountsCount
              : $scope.currentTab === 'balanceCurrent'
              ? $scope.receivablesTab.balanceCurrentCount
              : $scope.currentTab === 'balance30'
              ? $scope.receivablesTab.balance30Count
              : $scope.currentTab === 'balance60'
              ? $scope.receivablesTab.balance60Count
              : $scope.currentTab === 'balance90'
              ? $scope.receivablesTab.balance90Count
              : $scope.receivablesTab.inCollectionsCount,
          window: 'receivables',
        };

        modalFactory.SendMailingModal(strTitle).then(
          function () {
            switch ($scope.currentTab) {
              case 'allAccounts':
                $scope.activeGridData = $scope.receivablesAllAccountsDto;
                break;
              case 'balanceCurrent':
                $scope.activeGridData = $scope.receivablesBalanceCurrentDto;
                break;
              case 'balance30':
                $scope.activeGridData = $scope.receivablesBalance30Dto;
                break;
              case 'balance60':
                $scope.activeGridData = $scope.receivablesBalance60Dto;
                break;
              case 'balance90':
                $scope.activeGridData = $scope.receivablesBalance90Dto;
                break;
              case 'inCollections':
                $scope.activeGridData = $scope.receivablesInCollectionsDto;
                break;
            }

            if ($rootScope.isPrintMailingLabel) {
              patientServices.MailingLabel.GetMailingLabelReceivables(
                $scope.activeGridData
              ).$promise.then(function (res) {
                $scope.labels = res.Value;
                ctrl.mailingLabel = mailingLabelPrintFactory.Setup();
                ctrl.mailingLabel.data = res.Value;
                ctrl.mailingLabel.getPrintHtml();
              });
            }

            ////Generate Bulk Template
            if ($rootScope.communicationTemplateId != null) {
              var query = $resource(
                '_soarapi_/receivables/' +
                  $rootScope.communicationTemplateId +
                  '/PrintBulkLetterReceivables',
                {},
                { getData: { method: 'POST', params: {} } }
              );
              if ($rootScope.isPostcard) {
                query = $resource(
                  '_soarapi_/receivables/' +
                    $rootScope.communicationTemplateId +
                    '/PrintBulkPostcardReceivables',
                  {},
                  { getData: { method: 'POST', params: {} } }
                );
              }

              if ($scope.activeGridData.TotalCount > 200) {
                ctrl.showWarningModal();
              } else {
                ctrl.printTemplate = templatePrintFactory.Setup();
                ctrl.printTemplate.dataGrid = $scope.activeGridData;
                ctrl.printTemplate.communicationTemplateId =
                  $rootScope.communicationTemplateId;
                ctrl.printTemplate.isPostcard = $rootScope.isPostcard;
                ctrl.printTemplate.query = query;
                ctrl.printTemplate.getPrintHtml();
                $rootScope.communicationTemplateId = null;
              }
            }
          },
          function () {
            return;
          }
        );
      }
    };
    ctrl.init();
  },
]);
