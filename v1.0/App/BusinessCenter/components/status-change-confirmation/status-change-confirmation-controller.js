'use strict';
angular
  .module('Soar.Patient')
  .controller('StatusChangeConfirmationController', [
    '$scope',
    '$rootScope',
    'toastrFactory',
    'ListHelper',
    'localize',
    'ModalFactory',
    'userData',
    'LocationServices',
    'SaveStates',
    '$filter',
    '$uibModalInstance',
    '$timeout',
    '$q',
    '$uibModal',
    'layout',
    function (
      $scope,
      $rootScope,
      toastrFactory,
      listHelper,
      localize,
      modalFactory,
      userData,
      locationServices,
      saveStates,
      $filter,
      $uibModalInstance,
      $timeout,
      $q,
      $uibModal,
      layout
    ) {
      var ctrl = this;
      $scope.userData = userData;
      $scope.layout = layout;
      //var profile = patientData.profile;
      $scope.confirmationMessage = '';

      $scope.close = function () {
        $rootScope.$broadcast('statusChangeConfirmed', {
          layout: layout,
          confirm: false,
        });
        $uibModalInstance.close();
      };

      $scope.save = function () {
        $rootScope.$broadcast('statusChangeConfirmed', {
          layout: layout,
          confirm: true,
        });
        $uibModalInstance.close();
      };

      ctrl.constructMessage = function () {
        var userName =
          $scope.userData.FirstName + ' ' + $scope.userData.LastName;
        var currentDate = $filter('date')(new Date(), 'MM/dd/yyyy');

        if ($scope.userData.IsActive)
          $scope.confirmationMessage =
            'Are you sure you want to activate ' +
            userName +
            ' effective ' +
            currentDate +
            ' ?';
        else
          $scope.confirmationMessage =
            'Are you sure you want to inactivate ' +
            userName +
            ' effective ' +
            currentDate +
            ' ?';
      };

      ctrl.constructMessage();

      $scope.continueDisable = function () {
        $uibModalInstance.close();
      };
    },
  ]);
