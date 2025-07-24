//#region READ ME
/*
    Expected Object:
        An ARRAY, with the following properties in an OBJECT
        - Call: RESOURCE the service you want to call (GET, POST, DELETE)
        - Params: OBJECT the parameters you want to pass the service
        - OnSuccess: FUNCTION you want to call if it's successful
        - OnError: FUNCTION you want to call if it fails

    End Result:
        modalFactory.LoadingModal(ctrl.providerSetup).then(ctrl.doneLoading);

    Initial setup from your controller:
        ctrl.providerSetup = function () {
            return [
                {
                    Call: scheduleServices.Dtos.ProviderHoursOfOperation.Operations.get,
                    Params: { UserId: $scope.provider.UserId },
                    OnSuccess: ctrl.ProviderHoursOfOperationGetOnSuccess,
                    OnError: ctrl.ProviderHoursOfOperationGetOnError
                },
                {
                    Call: '',
                    Params: { UserId: $scope.provider.UserId },
                    OnSuccess: ctrl.ProviderIdealDayGetOnSuccess,
                    OnError: ctrl.ProviderIdealDayGetOnError
                }
            ];
        }

    Modal closed call from your controller:
        ctrl.doneLoading(){
            // Whatever you want to do after it's completed
        }
*/
//#endregion

(function () {
  'use strict';

  angular
    .module('common.controllers')
    .controller('LoadingModalController', LoadingModalController);
  LoadingModalController.$inject = ['$scope', '$timeout', '$uibModalInstance'];
  function LoadingModalController($scope, $timeout, $uibModalInstance) {
    BaseCtrl.call(this, $scope, 'LoadingModalController');

    var ctrl = this;
    if (_.isFunction($scope.init)) {
      $scope.services = $scope.init();
    }

    $timeout(function () {
      if (!_.isEmpty($scope.services)) {
        _.forEach($scope.services, function (service) {
          service.isLoading = true;

          var pr = service.Call(service.Params);
          if (_.isFunction(pr.then)) {
            pr.then(
              function (res) {
                ctrl.success(res, service);
              },
              function (error) {
                ctrl.failure(error, service);
              }
            );
          } else {
            pr.$promise.then(
              function (res) {
                ctrl.success(res, service);
              },
              function (error) {
                ctrl.failure(error, service);
              }
            );
          }
        });
      } else {
        // If $scope.services is blank then close the modal.
        if ($scope.$parent) {
          $scope.$parent.init = null;
        }
        $scope.init = null;
        $uibModalInstance.close();
      }
    }, 250);

    ctrl.success = function (res, service) {
      service.OnSuccess(res);
      service.isLoading = false;
      $scope.getIsLoading();
    };
    ctrl.failure = function (error, service) {
      service.OnError(error);
      service.isLoading = false;
      $scope.getIsLoading();
    };

    $scope.getIsLoading = function () {
      var loadingService = _.find($scope.services, { isLoading: true });
      if (_.isUndefined(loadingService)) {
        if ($scope.$parent) {
          $scope.$parent.init = null;
        }
        $scope.init = null;
        $scope.services = null;
        $uibModalInstance.close();
      }
    };
  }
  LoadingModalController.prototype = Object.create(BaseCtrl);
})();
