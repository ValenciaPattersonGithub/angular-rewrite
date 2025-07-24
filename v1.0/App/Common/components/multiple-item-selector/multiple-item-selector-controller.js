'use strict';

angular.module('common.controllers').controller('MultipleItemSelectorCtrl', [
  '$scope',
  '$filter',
  'ListHelper',
  'localize',
  function ($scope, $filter, listHelper, localize) {
    var ctrl = this;

    $scope.loadingStatus = {
      fullListLoaded: false,
      selectedItemsLoaded: false,
    };

    // everything that needs to happen when the controller is instantiated
    ctrl.init = function () {
      ctrl.localizedDisplayName = localize.getLocalizedString(
        $scope.displayName
      );
      $scope.placeholderText =
        '- ' +
        localize.getLocalizedString('Select') +
        ' ' +
        ctrl.localizedDisplayName +
        ' -';
      $scope.addLinkText =
        localize.getLocalizedString('Add') + ' ' + ctrl.localizedDisplayName;
      ctrl.sortingProperty = $scope.orderBy ? $scope.orderBy : 'Text';
    };

    // setting loadingStatus.fullListLoaded flag to true as soon as fullList is loaded
    $scope.$watch(
      'fullList',
      function (nv, ov) {
        if (
          nv &&
          nv.length >= 0 &&
          $scope.loadingStatus.fullListLoaded === false
        ) {
          $scope.loadingStatus.fullListLoaded = true;
        }
      },
      true
    );

    // setting loadingStatus.selectedItemsLoaded flag to true as soon as selectedItems is loaded
    $scope.$watch(
      'selectedItems',
      function (nv, ov) {
        if (
          nv &&
          nv.length >= 0 &&
          $scope.loadingStatus.selectedItemsLoaded === false
        ) {
          $scope.loadingStatus.selectedItemsLoaded = true;
        }
      },
      true
    );

    // calling functions that need to run once both lists are loaded
    $scope.$watch(
      'loadingStatus',
      function (nv, ov) {
        if (nv.fullListLoaded === true && nv.selectedItemsLoaded === true) {
          ctrl.addGenericProperties($scope.fullList);
          // if there is only 1 item in fullList and 0 in selectedItems, add the item from the fullList to selectedItems
          if (
            $scope.fullList.length === 1 &&
            $scope.selectedItems.length === 0
          ) {
            $scope.selectedItems.push($scope.fullList[0]);
          }
          ctrl.addGenericProperties($scope.selectedItems);
          ctrl.removeSelectedItemsFromFullList();
          // ordering
          $scope.selectedItems = $filter('orderBy')(
            $scope.selectedItems,
            ctrl.sortingProperty
          );
          $scope.fullList = $filter('orderBy')(
            $scope.fullList,
            ctrl.sortingProperty
          );
          ctrl.refreshControl(false);
        }
      },
      true
    );

    // adding the Text & Value properties for use by the control
    ctrl.addGenericProperties = function (list) {
      angular.forEach(list, function (item) {
        // expecting that objects in the fullList will have the 'textProperty' but the selectedItems objects may not
        // locations and userScheduleLocations for instance, only share the 'valueProperty' which is the key
        // looking up the 'textProperty' in the fullList for these instances
        if (!item[$scope.textProperty]) {
          var itemFromFullList = listHelper.findItemByFieldValue(
            $scope.fullList,
            $scope.key,
            item[$scope.key]
          );
          if (itemFromFullList) {
            item.Text = itemFromFullList[$scope.textProperty];
          } else {
            item.Text = '';
          }
        } else {
          item.Text = item[$scope.textProperty];
        }
        item.Value = item[$scope.valueProperty];
      });
    };

    // removing selected items from the full list
    ctrl.removeSelectedItemsFromFullList = function () {
      angular.forEach($scope.selectedItems, function (item) {
        var index = listHelper.findIndexByFieldValue(
          $scope.fullList,
          $scope.key,
          item[$scope.key]
        );
        if (index >= 0) {
          $scope.fullList.splice(index, 1);
        }
      });
    };

    // used by the template to handle add click events
    $scope.addItemToSelectedItemsList = function (itemValue) {
      if (itemValue) {
        // adding selectItem to selectedItems
        var item = listHelper.findItemByFieldValue(
          $scope.fullList,
          $scope.key,
          itemValue
        );
        if (item) {
          $scope.selectedItems.push(item);
          $scope.selectedItems = $filter('orderBy')(
            $scope.selectedItems,
            ctrl.sortingProperty
          );
          // removing selectItem from fullList
          var index = listHelper.findIndexByFieldValue(
            $scope.fullList,
            $scope.key,
            itemValue
          );
          $scope.fullList.splice(index, 1);
          $scope.selectedItemValue = null;
          ctrl.refreshControl(true);
        }
      }
    };

    // used by the template to handle select all click events
    $scope.selectAll = function () {
      angular.forEach(angular.copy($scope.fullList), function (item) {
        $scope.addItemToSelectedItemsList(item[$scope.key]);
      });
    };

    // used by the template to handle remove click events
    $scope.removeItemFromSelectedItemsList = function (item) {
      if (item) {
        // removing item from selectedItems
        var index = listHelper.findIndexByFieldValue(
          $scope.selectedItems,
          $scope.key,
          item[$scope.key]
        );
        $scope.selectedItems.splice(index, 1);
        // adding item back to fullList
        $scope.fullList.push(item);
        $scope.fullList = $filter('orderBy')(
          $scope.fullList,
          ctrl.sortingProperty
        );
        ctrl.refreshControl(false);
      }
    };

    // refreshing the control to the reflect the data change, etc.
    ctrl.refreshControl = function (alsoClearText) {
      var selector = '#multiItemSelector' + $scope.displayName;
      if (angular.element(selector).data('kendoComboBox')) {
        angular.element(selector).data('kendoComboBox').dataSource.read();
        if (alsoClearText === true) {
          angular.element(selector).data('kendoComboBox').text('');
        }
      }
    };

    ctrl.init();
  },
]);
