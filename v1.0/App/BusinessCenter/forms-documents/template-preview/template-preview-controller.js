'use strict';

angular.module('Soar.BusinessCenter').controller('TemplatePreviewController', [
  '$scope',
  '$location',
  '$window',
  function ($scope, $location, $window) {
    var ctrl = this;
    $scope.isPostcard = true;
    $scope.postcardIndex = [1, 2, 3, 4];

    ctrl.$onInit = function () {
      var type = $location.search().type;
      $scope.isPostcard = false;
      if (type === 'postcard') {
        $scope.isPostcard = true;

        $scope.postcardDto = JSON.parse(
          localStorage.getItem('postcardPreview')
        );
      }
    };

    ctrl.$onInit();
  },
]);
