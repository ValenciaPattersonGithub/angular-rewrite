'use strict';

angular.module('Soar.BusinessCenter').directive('serviceFeesByLocation', [
  '$uibModal',
  function ($uibModal) {
    return {
      restrict: 'E',
      link: function ($scope, el, attrs) {
        var modalInstance = $uibModal.open({
          templateUrl:
            'App/BusinessCenter/service-code/service-fees-by-location/service-fees-by-location.html',
          controller: 'ServiceFeesByLocationController',
          backdrop: 'static',
          keyboard: false,
          size: 'md',
          scope: $scope,
          windowClass: 'center-modal',
        });
        //Handle OK/CANCEL button actions of dialog
        modalInstance.result.then(function () {
          $scope.closeFeesByLocation(
            $scope.data.ServiceCode.LocationSpecificInfo
          );
        });
        el.on('$destroy', function () {
          $scope.$destroy();
        });
      },
    };
  },
]);
