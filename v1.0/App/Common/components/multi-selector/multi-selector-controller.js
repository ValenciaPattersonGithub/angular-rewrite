angular.module('common.directives').controller('MultiSelectorController', [
  '$scope',
  '$filter',
  '$document',
  'patSecurityService',
  'toastrFactory',
  function ($scope, $filter, $document, patSecurityService, toastrFactory) {
    var ctrl = this;

    // #region Authorization

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
    if (typeof $scope.authz != 'undefined') {
      ctrl.authAccess();
    }

    // #endregion

    $scope.open = false;

    $scope.list = $scope.list ? $scope.list : [];

    $scope.onBlur = function ($event) {
      var focus =
        $event.relatedTarget != null ? $event.relatedTarget : $(':focus')[0];
      if (angular.element('div.multi-selector').find(focus).length === 0) {
        if (typeof $scope.onBlurFn == 'function') {
          $scope.onBlurFn();
        }
        $scope.open = false;
      }
    };

    $scope.onButtonBlur = function ($event) {
      var focus =
        $event.relatedTarget != null ? $event.relatedTarget : $(':focus')[0];
      if (angular.element('div.multi-selector').find(focus).length === 0) {
        $scope.open = false;
      }
    };

    $scope.hasLocations = function (locs, locStatus) {
      var result = false;
      if (locs.length > 0) {
        result =
          $filter('filter')(locs, { LocationStatus: locStatus }, true).length >
          0;
      }
      return result;
    };

    $scope.$watch(
      'list',
      function (nv, ov) {
        if ($scope.selectAll !== false) {
          var oldList = $filter('filter')(ov, { Selected: true });
          var newList = $filter('filter')(nv, { Selected: true });
          if (oldList.length > 0 && newList.length > 0) {
            if (
              newList[0][$scope.displayField] === nv[0][$scope.displayField] &&
              oldList[0][$scope.displayField] !== nv[0][$scope.displayField] &&
              newList.length > 1
            ) {
              angular.forEach($scope.list, function (obj) {
                if (obj !== nv[0]) obj.Selected = false;
              });
            }
            if (
              newList[0][$scope.displayField] === nv[0][$scope.displayField] &&
              oldList[0][$scope.displayField] === nv[0][$scope.displayField] &&
              newList.length > 1
            ) {
              $scope.list[0].Selected = false;
            }
          }
        }

        $scope.selectedList = $filter('filter')($scope.list, {
          Selected: true,
        });
      },
      true
    );
  },
]);
