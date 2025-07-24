angular
  .module('common.directives')
  .controller('MultiSelectController', [
    '$scope',
    '$document',
    'ListHelper',
    'patSecurityService',
    'toastrFactory',
    '$filter',
    MultiSelectController,
  ]);

function MultiSelectController(
  $scope,
  $document,
  listHelper,
  patSecurityService,
  toastrFactory,
  $filter
) {
  BaseCtrl.call(this, $scope, 'MultiSelectController');
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
    $scope.selected = angular.copy(ctrl.selected);
  };

  $scope.clickItem = function (item) {
    item.Selected = !item.Selected;

    $scope.selectedCount = $scope.selectedCount + (item.Selected ? 1 : -1);
    ctrl.populateSelected();

    var items = listHelper.findItemsByFieldValue(
      $scope.list,
      'Status',
      item.Status
    );
    if (items) {
      var selectedCount = 0;
      angular.forEach(items, function (item) {
        if (item.Selected) {
          selectedCount++;
        }
      });

      var selecting = selectedCount == items.length;
      if (selecting) {
        angular.element('#icon' + item.Status).addClass('fa-check-square');
      } else {
        angular.element('#icon' + item.Status).removeClass('fa-check-square');
      }
    }
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

  $scope.setUlWidth = function (id) {
    var width = 0;
    if (id == 'Location' || id.contains('receivables')) {
      width = angular.element('#msRepeater' + id).width() + 2;
    } else {
      width = angular.element('#msRepeater' + id).width() + 1;
    }

    var style = 'min-width:' + width + 'px';

    return style;
  };

  $scope.sectionHeader = function (key) {
    if (key == 'Pending') {
      key = 'Pending Inactive';
    }

    return key;
  };

  ctrl.initializeSelection = function () {
    var dateNow = new Date();
    var pendingLocs = [];
    var activeLocs = [];
    var inactiveLocs = [];

    if (
      $scope.initialSelection &&
      $scope.initialSelection.length > 0 &&
      $scope.idField > ''
    ) {
      var selectedCount = 0;
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

      angular.forEach($scope.list, function (item) {
        if (item.Selected != true) {
          item.Selected = false;
        }

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

      $scope.selectedCount = selectedCount;
      ctrl.populateSelected();
    } else if (!$scope.allowBlank) {
      $scope.toggleAll();
    }
  };

  ctrl.onClick = function (event) {
    if ($scope.open && $scope.element.find(event.target).length <= 0) {
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

  $scope.$on('reinitializeList', function (event) {
    if (event.currentScope.type != 'Locations') {
      $scope.selectedCount = 0;
      ctrl.initializeSelection();
    }
  });

  $scope.$watch(
    'list',
    function (nv, ov) {
      if (JSON.stringify(nv) != JSON.stringify(ov)) {
        $scope.selectedCount = nv.filter(function (item) {
          return item.Selected;
        }).length;
      }
    },
    true
  );

  $scope.$on('$destroy', function () {
    $document.off('click', ctrl.onClick);
    ctrl.onClick = null;
  });
}

MultiSelectController.prototype = Object.create(BaseCtrl);
