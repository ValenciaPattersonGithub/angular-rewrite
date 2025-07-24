'use strict';
angular
  .module('Soar.Widget')
  .controller('SoarWidgetController', [
    '$scope',
    'WidgetInitStatus',
    SoarWidgetController,
  ]);
function SoarWidgetController($scope, widgetInitStatus) {
  BaseCtrl.call(this, $scope, 'SoarWidgetController');

  var ctrl = this;
  $scope.getWidgetTemplateUrl = function () {
    return 'App/Widget/templates/' + $scope.data.Template;
  };

  // Manage widget loading and loading failed.
  if ($scope.data.initMode === widgetInitStatus.Loading) {
    $scope.loading = true;
    $scope.loadingFailed = false;
    $scope.errorMessage = '';
  }

  $scope.$watch('data.initMode', function (nv) {
    if (nv === widgetInitStatus.Loaded) {
      $scope.loading = false;
    } else if (nv === widgetInitStatus.Loading) {
      $scope.loading = true;
    }
    $scope.loadingFailed = false;
    $scope.errorMessage = '';
  });

  $scope.$on('WidgetLoadingStarted', function () {
    $scope.loading = true;
    $scope.loadingFailed = false;
    $scope.errorMessage = '';
  });
  $scope.$on('WidgetLoadingDone', function () {
    $scope.loading = false;
    $scope.loadingFailed = false;
    $scope.errorMessage = '';
  });
  $scope.$on('WidgetLoadingError', function (message) {
    $scope.loading = false;
    $scope.loadingFailed = true;
    $scope.errorMessage = message;
  });
}
SoarWidgetController.prototype = Object.create(BaseCtrl);
