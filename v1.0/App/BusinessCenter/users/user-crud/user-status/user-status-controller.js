'use strict';

angular.module('Soar.BusinessCenter').controller('UserStatusController', [
  '$scope',
  '$timeout',
  '$filter',
  'toastrFactory',
  'localize',
  'patSecurityService',
  'StaticData',
  '$http',
  'UserServices',
  'ModalFactory',
  '$uibModal',
  '$rootScope',
  function (
    $scope,
    $timeout,
    $filter,
    toastrFactory,
    localize,
    patSecurityService,
    staticData,
    $http,
    userServices,
    modalFactory,
    $uibModal,
    $rootScope
  ) {
    // store the current user status
    $scope.showToggle = angular.isDefined($scope.showToggle)
      ? $scope.showToggle
      : true;
    $scope.currentStatus = $scope.user.IsActive;
    $scope.activationHistory = [];
    $scope.maxDate = moment().add(1, 'y').toDate();
    $scope.currentDate = new Date();
    $scope.sortedColumn = '-DateModified'; //Set default Sort - Newest to Oldest PBI#332017
    $scope.printDivId = 'activationHistoryGrid';
    $scope.valid = false;

    // get activation history
    $scope.getActivationHistory = function () {
      if ($scope.user.UserId) {
        userServices.ActivationHistory.get(
          { Id: $scope.user.UserId },
          $scope.userActivationHistoryGetSuccess,
          $scope.userActivationHistoryGetFailure
        );
      } else {
        $scope.activationHistory = [];
      }
    };
    $scope.userActivationHistoryGetSuccess = function (res) {
      if (!res.Value.isEmpty) {
        $scope.activationHistory = res.Value;

        angular.forEach($scope.activationHistory, function (history) {
          if (history.IsActive) {
            history.StatusName = 'Active';
          } else {
            history.StatusName = 'Inactive';
          }
          history.DateModified = history.DateModified.endsWith('Z')
            ? history.DateModified
            : history.DateModified + 'Z';
        });

        var activationHistory = angular.copy($scope.activationHistory);
        angular.forEach(activationHistory, function (history) {
          if (!history.IsActive) {
            var userDisabledHistory = angular.copy(history);
            userDisabledHistory.StatusName = 'User Access Disabled';
            var dateModified = new Date(history.DateModified);
            dateModified.setSeconds(dateModified.getSeconds() - 1);
            userDisabledHistory.DateModified = dateModified.toISOString();
            $scope.activationHistory.push(userDisabledHistory);
          }
        });

        $scope.activationHistory = $filter('orderBy')(
          $scope.activationHistory,
          $scope.sortedColumn
        );

        if (!$scope.activationHistory.length > 0) {
          $scope.activationHistory = [];
        }
      }
    };

    $scope.userActivationHistoryGetFailure = function () {
      toastrFactory.error(
        localize.getLocalizedString('Failed to get') +
          ' ' +
          localize.getLocalizedString('Activation History'),
        localize.getLocalizedString('Server Error')
      );
    };
    $scope.getActivationHistory();

    $scope.confirmStatusChange = function () {
      $scope.currentStatus = $scope.user.IsActive;
      $scope.update();
    };

    $scope.cancelStatusChange = function () {
      $scope.user.IsActive = $scope.currentStatus;
      $scope.user.StatusChangeNote = '';
    };

    $scope.showLimit = function () {
      return $scope.showAllStatus == true ? $scope.activationHistory.length : 5;
    };

    $scope.$watch('refreshHistory', function (nv, ov) {
      if (nv && nv != ov) {
        $scope.getActivationHistory();
        $scope.refreshHistory = false;
      }
    });

    $scope.statusChangeConfirmed = function () {
      $scope.confirmStatusChange();
    };

    //disabled moved functionality PBI 197688
    //$rootScope.$on('statusChangeConfirmed', function () {
    //    $scope.confirmStatusChange();
    //});

    $scope.openStatusChangeConfirmationModal = function () {
      var modalInstance = $uibModal.open({
        templateUrl:
          'App/BusinessCenter/components/status-change-confirmation/status-change-confirmation.html',
        keyboard: false,
        size: 'md',
        windowClass: 'center-modal',
        backdrop: 'static',
        controller: 'StatusChangeConfirmationController',
        resolve: {
          userData: function () {
            return $scope.user;
          },
        },
      });
    };

    $scope.header = [
      {
        label: 'Date',
        filters: false,
        sortable: true,
        sorted: false,
        prop: 'DateModified',
      },
      {
        label: 'Status',
        filters: false,
        sortable: true,
        sorted: false,
        prop: 'StatusName',
      },
      {
        label: 'Reason',
        filters: false,
        sortable: true,
        sorted: false,
        prop: 'Note',
      },
      {
        label: 'Changed By',
        filters: false,
        sortable: true,
        sorted: false,
        prop: 'UserModifiedName',
      },
    ];

    $scope.getColumnSize = function (header) {
      var size;
      if (header.prop === 'DateModified') {
        size = 'col-sm-2 fuseGrid_cell date-column';
      }
      if (header.prop === 'StatusName') {
        size = 'col-sm-2 fuseGrid_cell status-column';
      }
      if (header.prop === 'Note') {
        size = 'col-sm-5 fuseGrid_cell reason-column';
      }
      if (header.prop === 'UserModifiedName') {
        size = 'col-sm-3 fuseGrid_cell';
      }

      return size;
    };

    $scope.sort = function (column) {
      angular.forEach($scope.header, function (value) {
        if (value.prop === column.prop) {
          value.sorted = true;
        } else {
          value.sorted = false;
        }
      });

      column = column.prop;
      if (column === $scope.sortedColumn) {
        $scope.sortedColumn = '-' + $scope.sortedColumn;
      } else {
        $scope.sortedColumn = column;
      }
    };

    $scope.print = function () {
      //print function goes here
    };
    $scope.share = function () {
      //share function goes here
    };
  },
]);
