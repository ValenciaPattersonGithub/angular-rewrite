(function () {
    'use strict';
  
    angular
      .module('common.controllers')
      .controller('CardReaderController', cardReaderController);
  
    cardReaderController.$inject = [
      '$scope',
      '$uibModalInstance',
      'item',
    ];
  
    function cardReaderController(
      $scope,
      $uibModalInstance,
      item
    ) {
    $scope.selectedCardReader;
    $scope.item = item;
    $scope.cardReaderOnChange = function (deviceId) {
        $scope.selectedCardReader = deviceId;
      };
  
      $scope.okClick = function () { 
        $uibModalInstance.close($scope.selectedCardReader);
      };
  
      $scope.cancelClick = function () {
        $uibModalInstance.dismiss(undefined);
      };
    }
  })();
  