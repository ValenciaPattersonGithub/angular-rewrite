'use strict';

angular.module('Soar.BusinessCenter').controller('DepositsController', [
  '$scope',
  '$timeout',
  '$filter',
  'ModalFactory',
  'patSecurityService',
  'LocationServices',
  'DepositGridFactory',
  'tabLauncher',
  'localize',
  '$window',
  'TimeZoneFactory',
  'DepositService',
  'toastrFactory',
  '$location',
  'UserServices',
  'ListHelper',
  function (
    $scope,
    $timeout,
    $filter,
    modalFactory,
    patSecurityService,
    locationServices,
    depositGridFactory,
    tabLauncher,
    localize,
    $window,
    timeZoneFactory,
    depositService,
    toastrFactory,
    $location,
    userServices,
    listHelper
  ) {
    var ctrl = this;

    $scope.hasAccess = false;

    // #region AMFA
    $scope.authAccess = function () {
      if (!patSecurityService.IsAuthorizedByAbbreviation('soar-biz-dep-view')) {
        toastrFactory.error(
          localize.getLocalizedString(
            'User is not authorized to access this area.'
          ),
          localize.getLocalizedString('Not Authorized')
        );
        $location.path('/');
      } else {
        $scope.hasAccess = true;
      }
    };

    $scope.authAccess();

    $scope.hasAccessAtLocation = function () {
      var locId = $scope.selectedLocationId;

      if (!$scope.selectedLocationId)
        locId = JSON.parse(sessionStorage.getItem('userLocation')).id;

      $scope.hasBankAccountAccess =
        patSecurityService.IsAuthorizedByAbbreviationAtLocation(
          'soar-biz-dep-vrtnum',
          parseInt(locId)
        );
      $scope.hasBankRoutingAccess =
        patSecurityService.IsAuthorizedByAbbreviationAtLocation(
          'soar-biz-dep-vacnum',
          parseInt(locId)
        );
    };

    ctrl.getLocationUserRolesSuccess = function (res) {
      $scope.hasAccessAtLocation();

      var accountRow = listHelper.findItemByFieldValue(
        $scope.depositGridOptions.columnDefinition,
        'field',
        'BankAccountNumber'
      );
      var routingRow = listHelper.findItemByFieldValue(
        $scope.depositGridOptions.columnDefinition,
        'field',
        'RoutingNumber'
      );

      if (!$scope.hasBankAccountAccess) {
        accountRow.sortable = false;
        accountRow.disabled = true;
      } else {
        accountRow.sortable = true;
        accountRow.disabled = false;
      }
      if (!$scope.hasBankRoutingAccess) {
        routingRow.sortable = false;
        routingRow.disabled = true;
      } else {
        routingRow.sortable = true;
        routingRow.disabled = false;
      }
    };

    // #endregion

    // #region Deposit Grid
    $scope.disableDeposit = false;
    $scope.depositGridOptions = depositGridFactory.getOptions();
    $scope.depositGridOptions.id = 'DepositGrid';
    ctrl.getLocationUserRolesSuccess();

    $scope.depositGridOptions.successAction = function (data) {
      $scope.depositRows = data.dto.Rows;
      if (ctrl.depositsForPrinting && ctrl.depositsForPrinting.length > 0) {
        angular.forEach(ctrl.depositsForPrinting, function (deposit) {
          var printDeposit = $filter('filter')($scope.depositRows, {
            DepositId: deposit.DepositId,
          })[0];
          if (printDeposit.CreditTransactions == undefined) {
            depositService
              .getDepositDetails({
                locationId: printDeposit.LocationId,
                depositId: deposit.DepositId,
              })
              .$promise.then(function (data) {
                printDeposit.CreditTransactions =
                  data.Value.DepositPaymentHistoryItems;
                localStorage.setItem(
                  'deposit_' + printDeposit['DepositId'],
                  JSON.stringify(printDeposit)
                );
                tabLauncher.launchNewTab(
                  '#/BusinessCenter/Receivables/Deposits/' +
                    printDeposit['DepositId'] +
                    '/PrintDeposit/'
                );
              }, ctrl.getDepositDetailsFailure);
          } else {
            localStorage.setItem(
              'deposit_' + printDeposit['DepositId'],
              JSON.stringify(printDeposit)
            );
            tabLauncher.launchNewTab(
              '#/BusinessCenter/Receivables/Deposits/' +
                printDeposit['DepositId'] +
                '/PrintDeposit/'
            );
          }
        });
        ctrl.depositsForPrinting.length = 0;
      }
      $('.collapse').removeClass('in');
      angular
        .element('.glyphicon-chevron-down')
        .removeClass('glyphicon-chevron-down')
        .addClass('glyphicon-chevron-right');
    };

    $scope.toggleIcon = function (e, row) {
      if (
        row.CreditTransactions == undefined ||
        row.DepositHistory == undefined
      ) {
        depositService
          .getDepositDetails({
            locationId: row.LocationId,
            depositId: row.DepositId,
          })
          .$promise.then(function (data) {
            row.DepositHistory = _.orderBy(
              data.Value.DepositHistoryItems,
              ['ModifiedDate', 'Status'],
              ['desc', 'desc']
            );

            _.each(data.Value.DepositPaymentHistoryItems, function (item) {
              item.LocationTimezone = row.LocationTimezone;
            });

            row.CreditTransactions = data.Value.DepositPaymentHistoryItems;
            $timeout(function () {
              $(e.currentTarget)
                .find('i.indicator')
                .toggleClass('glyphicon-chevron-right glyphicon-chevron-down');
              $('#subRow' + row.DepositId).collapse('show');
            });
          }, ctrl.getDepositDetailsFailure);
      } else {
        $(e.currentTarget)
          .find('i.indicator')
          .toggleClass('glyphicon-chevron-right glyphicon-chevron-down');
        if (
          $(e.currentTarget)
            .find('i.indicator')
            .hasClass('glyphicon-chevron-right')
        ) {
          $('#subRow' + row.DepositId).collapse('hide');
        } else {
          $('#subRow' + row.DepositId).collapse('show');
        }
      }
    };

    $scope.toggleIconDepositHistory = function (e) {
      $(e.currentTarget)
        .find('i.indicator')
        .toggleClass('glyphicon-chevron-right glyphicon-chevron-down');
    };

    ctrl.getDepositDetailsFailure = function () {
      toastrFactory.error(
        localize.getLocalizedString('Failed to retrieve deposit details.'),
        localize.getLocalizedString('Error')
      );
    };

    $scope.depositGridOptions.actions.toggleIcon = $scope.toggleIcon;
    $scope.depositGridOptions.actions.toggleIconDepositHistory =
      $scope.toggleIconDepositHistory;

    ctrl.refreshDepositGrid = function () {
      if ($scope.selectedLocation != null) {
        $scope.depositGridOptions.updateFilter(
          'Location',
          $scope.selectedLocation.LocationId
        );
        $scope.depositGridOptions.refresh();
      }
    };

    $scope.$on('refreshDepositGrid', function () {
      ctrl.refreshDepositGrid();
    });

    // #endregion

    // #region Locations

    $scope.locations = [];
    $scope.selectedLocationId = null;
    $scope.selectedLocation = null;
    $scope.locationsLoading = true;

    ctrl.getLocations = function () {
      locationServices
        .getPermittedLocations({ ActionId: 2616 })
        .$promise.then(ctrl.getLocationSuccess, ctrl.getLocationFailure);
    };

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
          obj.ModifiedNameLine1 =
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
          obj.ModifiedNameLine1 =
            obj.NameLine1 +
            ' (' +
            timeZoneFactory.GetTimeZoneAbbr(obj.Timezone) +
            ')';
          obj.LocationStatus = 'Active';
          obj.GroupOrder = 1;
          ctrl.activeLocs.push(obj);
        }
      });
      ctrl.activeLocs = $filter('orderBy')(
        ctrl.activeLocs,
        'ModifiedNameLine1'
      );
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

    ctrl.getLocationSuccess = function (res) {
      $scope.locations = ctrl.groupLocations(res.Value);

      $scope.locationsDDL = {
        data: $scope.locations,
        group: 'GroupOrder',
        sort: { field: 'SortingIndex', dir: 'asc' },
      };

      if (ctrl.oldSelectedLocationId) {
        $scope.selectedLocationId = ctrl.oldSelectedLocationId;
      } else {
        var cachedLocation = JSON.parse(sessionStorage.getItem('userLocation'));
        ctrl.userLocation =
          typeof cachedLocation !== 'undefined' ? cachedLocation : null;

        if (ctrl.userLocation) {
          $scope.selectedLocationId = ctrl.userLocation.id;
        }
      }

      $scope.locationsLoading = false;
    };

    ctrl.getlocationFailure = function () {
      toastrFactory.error('Failed to retrieve locations', 'Error');
      $scope.locationsLoading = false;
    };

    $scope.removeLocation = function () {
      $scope.disableDeposit = true;
      $scope.selectedLocationId = 0;
      $scope.selectedLocation = null;
      ctrl.refreshDepositGrid();
    };

    $scope.$on('patCore:initlocation', function () {
      if (patSecurityService.IsAuthorizedByAbbreviation('soar-biz-dep-view')) {
        $scope.hasAccess = true;
        if (!$scope.locationsLoading) {
          var cachedLocation = JSON.parse(
            sessionStorage.getItem('userLocation')
          );
          ctrl.userLocation =
            typeof cachedLocation !== 'undefined' ? cachedLocation : null;
          if (ctrl.userLocation) {
            $scope.selectedLocationId = ctrl.userLocation.id;
          }
        }
      } else {
        $scope.hasAccess = false;
        toastrFactory.error(
          localize.getLocalizedString(
            'User is not authorized to access this area.'
          ),
          localize.getLocalizedString('Not Authorized')
        );
        $location.path('/');
      }
      ctrl.getLocationUserRolesSuccess();
    });

    $scope.$watch('selectedLocationId', function (nv, ov) {
      ctrl.getLocationUserRolesSuccess();
      if (nv !== ov && nv != null && nv != '' && !$scope.locationsLoading) {
        $scope.disableDeposit = false;
        $scope.selectedLocation = $filter('filter')(
          $scope.locations,
          { LocationId: parseInt($scope.selectedLocationId) },
          true
        )[0];
        ctrl.refreshDepositGrid();
      }
    });

    // #endregion

    // #region Deposit Modal

    $scope.openDepositPaymentsModal = function () {
      localStorage.setItem(
        'createDepositLocation_' + $scope.selectedLocation.LocationId,
        JSON.stringify($scope.selectedLocation)
      );
      $window.location.href =
        '#/BusinessCenter/Receivables/Deposits/' +
        $scope.selectedLocation.LocationId +
        '/Create';
    };

    // #endregion

    $timeout(function () {
      if (patSecurityService.IsAuthorizedByAbbreviation('soar-biz-dep-view')) {
        $scope.hasAccess = true;
        ctrl.depositsForPrinting = JSON.parse(
          localStorage.getItem('depositsForPrinting')
        );
        if (ctrl.depositsForPrinting && ctrl.depositsForPrinting.length > 0) {
          ctrl.oldSelectedLocationId = ctrl.depositsForPrinting[0].LocationId;
          localStorage.removeItem('depositsForPrinting');
        }
        ctrl.getLocations();
      } else {
        $scope.hasAccess = false;
      }
    });
  },
]);
