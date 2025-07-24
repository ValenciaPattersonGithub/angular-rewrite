angular
  .module('common.directives')
  .controller('MultiSelectFixedWidthController', [
    '$scope',
    '$document',
    'ListHelper',
    'patSecurityService',
    'toastrFactory',
    '$filter',
    '$timeout',
    MultiSelectFixedWidthController,
  ]);

function MultiSelectFixedWidthController(
  $scope,
  $document,
  listHelper,
  patSecurityService,
  toastrFactory,
  $filter,
  $timeout
) {
  BaseCtrl.call(this, $scope, 'MultiSelectFixedWidthController');
  var ctrl = this;

  //#region Authorization
  // view access
  ctrl.authViewAccess = function () {
    return patSecurityService.IsAuthorizedByAbbreviation($scope.authZ);
  };

  ctrl.authAccess = function () {
    if (!ctrl.authViewAccess()) {
      toastrFactory.error(
        patSecurityService.generateMessage($scope.authZ),
        'Not Authorized'
      );
      event.preventDefault();
    } else {
      $scope.hasViewAccess = true;
    }
  };

  // authorization
  ctrl.authAccess();
  // #endregion

  $scope.selectAllLabel = angular.isDefined($scope.selectAllLabel)
    ? $scope.selectAllLabel
    : 'Select All';
  $scope.allowBlank = angular.isDefined($scope.allowBlank)
    ? $scope.allowBlank
    : false;
  $scope.hasMultipleGroups = false;

  ctrl.populateSelected = function () {
    ctrl.selected = [];

    for (var i = 0; i < $scope.list.length; i++) {
      if ($scope.list[i].Selected) {
        ctrl.selected.push($scope.list[i]);
      }
    }

    ctrl.updateSelected();
  };

  ctrl.updateSelected = function () {
    // if the current selection would leave the dropdown empty of locations, reset to the default selection.
    if (
      $scope.type === 'Locations' &&
      _.filter(ctrl.selected, { Selected: true }).length === 0 &&
      !_.isNil($scope.initialSelection)
    ) {
      _.forEach($scope.initialSelection, function (initialItem) {
        let item = listHelper.findItemByFieldValue(
          $scope.list,
          $scope.idField,
          initialItem[$scope.idField]
        );

        if (item) {
          item.Selected = true;
        }
      });
      ctrl.selected = _.filter($scope.list, { Selected: true });
    }
    $scope.selected = angular.copy(ctrl.selected);
  };

  $scope.clickItem = function (item) {
    item.Selected = !item.Selected;

    ctrl.populateSelected();
    $scope.selectedCount = $scope.selected.length;
  };

  $scope.toggleAll = function () {
    var selecting = $scope.selectedCount != $scope.list.length;

    for (var i = 0; i < $scope.list.length; i++) {
      $scope.list[i].Selected = selecting;
    }

    ctrl.selected = angular.copy($scope.list);
    ctrl.updateSelected();
    $scope.selectedCount = selecting ? $scope.list.length : 0;
  };

  $scope.selectedAll = function (key) {
    var items = listHelper.findItemsByFieldValue($scope.list, 'Status', key);
    var selectedCount = 0;
    angular.forEach(items, function (item) {
      if (item.Selected) {
        selectedCount++;
      }
    });
    return selectedCount == items.length;
  };

  $scope.toggleSelected = function (status) {
    var items = listHelper.findItemsByFieldValue($scope.list, 'Status', status);
    var selectedCount = 0;
    angular.forEach(items, function (item) {
      if (item.Selected) {
        selectedCount++;
      }
    });

    var selecting = selectedCount != items.length;

    for (var i = 0; i < items.length; i++) {
      items[i].Selected = selecting;
    }

    ctrl.selected = angular.copy($scope.list);
    ctrl.updateSelected();

    if (selecting) {
      angular.element('#icon' + status).addClass('fa-check-square');
    } else {
      angular.element('#icon' + status).removeClass('fa-check-square');
    }
  };

  //This is where the dropdown is populated
  ctrl.initializeSelection = function () {
    var dateNow = new Date();
    var pendingLocs = [];
    var activeLocs = [];
    var inactiveLocs = [];
    var providerTempList = [];

    if (
      $scope.initialSelection &&
      $scope.initialSelection.length > 0 &&
      $scope.idField > ''
    ) {
      var selectedCount = 0;
      // need to come back and look at the peformance of this ... it is taking over 100 ms at times.
      angular.forEach($scope.initialSelection, function (initialItem) {
        var item = listHelper.findItemByFieldValue(
          $scope.list,
          $scope.idField,
          initialItem[$scope.idField]
        );

        if (item) {
          item.Selected = true;
          selectedCount++;
        }
      });
              
      _.forEach($scope.list, function (item) {
        var inactivationDate = new Date(item.DeactivationTimeUtc);
        if (item.DeactivationTimeUtc == null) {
          item.Status = 'Active';
          activeLocs.push(item);
        } else {
          if (inactivationDate > dateNow) {
            item.Status = 'Pending';
            pendingLocs.push(item);
          }

          if (inactivationDate < dateNow) {
            item.Status = 'Inactive';
            inactiveLocs.push(item);
          }
        }
      });
      
      activeLocs = $filter('orderBy')(activeLocs, 'NameLine1');
      pendingLocs = $filter('orderBy')(pendingLocs, 'DeactivationTimeUtc');
      inactiveLocs = $filter('orderBy')(inactiveLocs, '-DeactivationTimeUtc');

      $scope.hasMultipleGroups =
        (activeLocs.length > 0 && pendingLocs.length > 0) ||
        (activeLocs.length > 0 && inactiveLocs.length > 0) ||
        (inactiveLocs.length > 0 && pendingLocs.length > 0);

      $scope.list = [];
      angular.forEach(activeLocs, function (active) {
        $scope.list.push(active);
      });
      angular.forEach(pendingLocs, function (pending) {
        $scope.list.push(pending);
      });
      angular.forEach(inactiveLocs, function (inactive) {
        $scope.list.push(inactive);
      });

      //This code keeps the selected provider in the list if ShowOnSchedule is false but they are the Selected Provider
      //Otherwise, they are not to show in list if ShowOnSchedule is false and they aren't the Selected Provider
      angular.forEach($scope.list, function (item) {
            if (!item.Selected) {
                item.Selected = false;
                if (item.ShowOnSchedule) {
                    providerTempList.push(item);
                }
            }
            else {
                if (item.hasOwnProperty('FullName') && !item.hasOwnProperty('Name')) {
                    item.Name = _.unescape(item.FullName);
                }
                providerTempList.push(item);
            }
      });
      
      $scope.list = providerTempList;

      $scope.selectedCount = selectedCount;
      ctrl.populateSelected();
    } else if (!$scope.allowBlank) {
      $scope.toggleAll();
    }
  };

  ctrl.onClick = function (event) {
    if ($scope.element.find(event.target).length <= 0) {
      $scope.open = false;
      $scope.$apply();
    }
  };
  $document.on('click', ctrl.onClick);

  $scope.open = false;
  ctrl.selected = [];

  // Default values of no value is specified.
  $scope.list = $scope.list ? $scope.list : [];

  $scope.selectedCount = 0;

  ctrl.initializeSelection();

  $scope.$on('reinitializeList', function (event, list) {
    if (event.currentScope.type != 'Locations') {
      $scope.selectedCount = 0;
      if (list) {
        $scope.list = list;
      }
      $timeout(ctrl.initializeSelection);
    }
  });

  $scope.$on('refreshSelectedCount', function () {
    ctrl.populateSelected();
    $scope.selectedCount = $scope.selected.length;
  });

  $scope.$on('$destroy', function () {
    $document.off('click', ctrl.onClick);
    ctrl.onClick = null;
  });
}

MultiSelectFixedWidthController.prototype = Object.create(BaseCtrl);
