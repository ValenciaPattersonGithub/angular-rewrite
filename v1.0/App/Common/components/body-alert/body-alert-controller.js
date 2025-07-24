'use strict';

angular
  .module('common.controllers')
  .controller('BodyAlertController', [
    '$scope',
    '$element',
    'HeaderAlert',
    BodyAlertController,
  ]);
function BodyAlertController($scope, $element, headerAlert) {
  BaseCtrl.call(this, $scope, 'BodyAlertController');
  $scope.headerAlert = headerAlert;

  var watchDeregister = $scope.$watch(
    'headerAlert.show',
    function (newValue, oldValue) {
      if (newValue) {
        $element.addClass('body-with-alert');
      } else {
        $element.removeClass('body-with-alert');
      }
    }
  );

  $element.on('$destroy', function () {
    $scope.$destroy();
  });
}

BodyAlertController.prototype = Object.create(BaseCtrl.prototype);
