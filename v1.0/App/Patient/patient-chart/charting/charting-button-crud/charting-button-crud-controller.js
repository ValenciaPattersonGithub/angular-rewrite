'use strict';
angular.module('Soar.Patient').controller('ChartingButtonCrudController', [
  '$rootScope',
  '$scope',
  '$timeout',
  'UserServices',
  'toastrFactory',
  'ListHelper',
  'localize',
  'ModalFactory',
  'ChartingFavoritesFactory',
  function (
    $rootScope,
    $scope,
    $timeout,
    userServices,
    toastrFactory,
    listHelper,
    localize,
    modalFactory,
    chartingFavoritesFactory
  ) {
    var ctrl = this;

    ctrl.$onInit = function () {
      $scope.chartButtonLayout = null;
      $scope.allConditions = [];
      $scope.allServices = [];
      $scope.allSwiftCodes = [];
      $scope.selectedLayoutItems = [];
      $scope.selectedLayoutItemsBackup = [];
      // subscribe to charting layout changes
      chartingFavoritesFactory.observeChartButtonLayout(
        $scope.updateChartingLayout
      );
    };

    //#region helpers

    // after allConditions, allServices, and allSwiftCodes have loaded via child directives, update selectedLayoutItems based on chartButtonLayout.LayoutItems
    ctrl.updateSelectedLayoutItems = function () {
      if ($scope.chartButtonLayout && $scope.chartButtonLayout.LayoutItems) {
        $scope.selectedLayoutItems.length = 0;
        angular.forEach($scope.chartButtonLayout.Favorites, function (item) {
          if (item.Button != null) {
            // Set the favorites list
            $scope.selectedLayoutItems.push(
              chartingFavoritesFactory.SetChartingButtonLayout(
                item.Button,
                $scope.allServices,
                $scope.allConditions
              )
            );
          } else {
            if (item.ButtonGroup && item.ButtonGroup != null) {
              // Set the favorites list
              $scope.selectedLayoutItems.push(
                chartingFavoritesFactory.SetChartingButtonLayout(
                  item.ButtonGroup,
                  $scope.allServices,
                  $scope.allConditions
                )
              );
            }
          }
        });
        //$scope.selectedLayoutItemsBackup = angular.copy($scope.selectedLayoutItems);
      }
    };

    // dto builder
    ctrl.buildNewChartButtonLayoutDto = function (layoutItemsToSend) {
      return {
        UserId: $rootScope.patAuthContext.userInfo.userid,
        LayoutItems: layoutItemsToSend,
      };
    };

    // warning modal logic
    ctrl.showWarningModal = function () {
      modalFactory.WarningModal().then(function (result) {
        if (result === true) {
          ctrl.updateViewSettings();
        }
      });
    };

    // closing this window
    ctrl.updateViewSettings = function () {
      $scope.viewSettings.expandView = false;
      $scope.viewSettings.activeExpand = 0;
    };

    //#endregion

    //#region watches

    // listening for allConditions to be loaded before updating selectedLayoutItems
    $scope.$watch(
      'allConditions',
      function (nv, ov) {
        if (nv && nv.length > 0 && !angular.equals(nv, ov)) {
          ctrl.updateSelectedLayoutItems();
        }
      },
      true
    );

    // listening for allServices to be loaded before updating selectedLayoutItems
    $scope.$watch(
      'allServices',
      function (nv, ov) {
        if (nv && nv.length > 0 && !angular.equals(nv, ov)) {
          ctrl.updateSelectedLayoutItems();
        }
      },
      true
    );

    // listening for allSwiftCodes to be loaded before updating selectedLayoutItems
    $scope.$watch(
      'allSwiftCodes',
      function (nv, ov) {
        if (nv && nv.length > 0 && !angular.equals(nv, ov)) {
          ctrl.updateSelectedLayoutItems();
        }
      },
      true
    );

    //#endregion

    //#region view

    // cancel button click handler
    $scope.cancel = function () {
      if ($scope.noChanges()) {
        ctrl.updateViewSettings();
      } else {
        ctrl.showWarningModal();
      }
    };

    // enabling/disabling save button
    $scope.noChanges = function () {
      return angular.equals(
        $scope.selectedLayoutItems,
        $scope.selectedLayoutItemsBackup
      );
    };

    // observer for watching the predetermination list for changes
    $scope.updateChartingLayout = function (chartingLayout) {
      $scope.chartingButtonLayout = chartingLayout;
      ctrl.updateSelectedLayoutItems();
    };

    $scope.getConditionChartIconUrl = function (condition) {
      var url = 'Images/ConditionIcons/';
      var path = angular.copy(condition.IconName);
      if (!path) {
        url += 'default_condition.svg';
      } else {
        url += path + '.svg';
      }
      return url;
    };

    $scope.getServiceChartIconUrl = function (service) {
      var url = 'Images/ChartIcons/';
      var path = angular.copy(service.IconName);
      if (!path || path === null) {
        url += service.IsSwiftPickCode
          ? 'default_swift_code.svg'
          : 'default_service_code.svg';
      } else {
        url += path + '.svg';
      }
      return url;
    };

    //#endregion
  },
]);
