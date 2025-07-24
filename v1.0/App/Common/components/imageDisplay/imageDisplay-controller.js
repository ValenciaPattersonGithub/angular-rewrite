'use strict';

angular.module('common.controllers').controller('ImageDisplayController', [
  '$scope',
  function ($scope) {
    $scope.newImage = {
      name: null, // name of the file, used to display details
      src: null, // compressed and re-sized image dataURL - USE FOR DB
    };

    // function to determine when to show default image
    $scope.showDefaultImage = function () {
      return (
        !$scope.newImage.src &&
        (!$scope.currentImage.src || $scope.currentImage.removeImage)
      );
    };

    // function to determine when to show current image
    $scope.showCurrentImage = function () {
      return (
        !$scope.newImage.src &&
        $scope.currentImage.src &&
        !$scope.currentImage.removeImage
      );
    };

    // function to show delete button when applicable
    $scope.showRemoveButton = function () {
      return (
        $scope.newImage.src ||
        ($scope.currentImage.src && !$scope.currentImage.removeImage)
      );
    };

    // set confirmedChange true
    $scope.confirmedChange = false;
    $scope.confirmChanges = function () {
      if ($scope.currentImage.removeImage == true) {
        $scope.currentImage.src = null;
        $scope.currentImage.name = null;
      }
      if ($scope.newImage.src) {
        $scope.currentImage.src = $scope.newImage.src;
        $scope.currentImage.name = $scope.newImage.name;
        $scope.newImage.src = null;
        $scope.newImage.name = null;
        $scope.currentImage.removeImage = false;
      }
      $scope.confirmedChange = true;
      $scope.currentImage.imageHasChanged = true;
    };

    // set confirmedChange false
    $scope.cancelChanges = function () {
      $scope.currentImage.removeImage = false;
      $scope.newImage.src = null;
      $scope.newImage.name = null;
      $scope.confirmedChange = true;
    };

    $scope.$on('EditPatientController.cancelImageChanges', function () {
      $scope.cancelChanges();
    });

    // remove the existing image
    $scope.removeImage = function () {
      if ($scope.currentImage.src !== null) {
        $scope.currentImage.removeImage = true;
      }
      $scope.newImage.src = null;
      $scope.newImage.name = null;
      $scope.confirmedChange = false;
    };

    $scope.$watch(
      'newImage',
      function (nv, ov) {
        $scope.confirmedChange = nv.src === null;
      },
      true
    );

    //$scope.$watch('currentImage', function(nv, ov) {
    //    //$scope.confirmedChange = !nv.removeImage;
    //}, true);
  },
]);
