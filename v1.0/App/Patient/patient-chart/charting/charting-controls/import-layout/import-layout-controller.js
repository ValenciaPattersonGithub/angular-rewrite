angular.module('Soar.Patient').controller('ImportChartButtonLayoutController', [
  '$scope',
  '$uibModalInstance',
  'usersList',
  'UserServices',
  'toastrFactory',
  function ($scope, $uibModalInstance, usersList, userServices, toastrFactory) {
    var ctrl = this;

    ctrl.$onInit = function () {
      $scope.users = usersList;
      $scope.disableSave = false;
    };

    $scope.close = function () {
      $uibModalInstance.dismiss();
    };

    $scope.save = function () {
      if (!_.isNil($scope.selectedUserId)) {
        $scope.disableSave = true;

        userServices.ChartButtonLayout.importFavoritesFromUser(
          { userId: $scope.selectedUserId },
          ctrl.importSuccess,
          ctrl.importFailure
        );
      }
    };

    ctrl.importSuccess = function (res) {
      if (_.isNil(res) || _.isNil(res.Value)) {
        ctrl.importFailure();
      } else {
        $uibModalInstance.close(res.Value);
      }
    };

    ctrl.importFailure = function () {
      $scope.disableSave = false;
      toastrFactory.error('Import was unsuccessful.', 'Server Error');
    };
  },
]);
