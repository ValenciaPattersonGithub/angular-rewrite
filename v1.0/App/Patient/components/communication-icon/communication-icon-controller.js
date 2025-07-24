'use strict';

angular.module('Soar.Patient').controller('CommunicationIconController', [
  '$scope',
  '$rootScope',
  'toastrFactory',
  '$timeout',
  'localize',
  '$uibModal',
  'PatientServices',
  'FeatureService',
  function (
    $scope,
    $rootScope,
    toastrFactory,
    $timeout,
    localize,
    $uibModal,
    patientServices,
    featureService
  ) {
    var ctrl = this;
    $scope.showCount = false;
    $scope.disable = $scope.disable ? true : false;
    $scope.openModal = function () {
      $scope.selectedIcon = $scope.communicationTypeId;
      $scope.selectedPatientId = $scope.patientId;
      $scope.withUnread = $scope.count > 0 ? true : false;
      $rootScope.$broadcast('soar:openCommunicationModal');

      $scope.modalInstance = $uibModal.open({
        animation: true,
        ariaLabelledBy: 'modal-title',
        ariaDescribedBy: 'modal-body',
        templateUrl:
          'App/Patient/patient-communication/patient-communication-modal.html',
        controller: 'patientCommunicationModalController',
        bindtoController: true,
        backdrop: 'static',
        keyboard: false,
        windowClass: 'patient-modal-window',
        scope: $scope,
      });
    };

    $scope.$on('closeCommunicationModal', function () {
      if ($scope.modalInstance) {
        $scope.modalInstance.close();
      }
    });

    $scope.$on('refreshCommunicationCount', function (event, args) {
      if ($scope.patientId == args) {
        ctrl.getCount();
      }
    });
    ctrl.getCount = function () {
      if ($scope.patientId && $scope.showUnreadCount) {
        patientServices.Communication.countUnReadCommunication({
          PatientId: $scope.patientId,
          CommunicationTypeId: $scope.communicationTypeId,
        }).$promise.then(ctrl.getCountSuccess, ctrl.getCountFailure);
      }
    };

    ctrl.getCountSuccess = function (res) {
      $scope.count = res.Value;
      $scope.showCount = $scope.count > 0 ? true : false;
      if ($scope.hideOnZeroCount) {
        $scope.showIcon = $scope.showCount ? true : false;
      } else {
        $scope.showIcon = true;
      }
    };

    ctrl.getCountFailure = function () {
      toastrFactory.error(
        localize.getLocalizedString(
          'Failed to retrieve count of unread communication.'
        ),
        'Error'
      );
    };

    $scope.$watch('patientId', function (nv, ov) {
      if (nv) {
        if ($scope.showUnreadCount) {
          if ($scope.initialCount == undefined) {
            ctrl.getCount();
          } else {
            $scope.count = $scope.initialCount;
            $scope.showCount = $scope.count > 0 ? true : false;
          }
          if ($scope.hideOnZeroCount) {
            $scope.showIcon = $scope.showCount ? true : false;
          } else {
            $scope.showIcon = true;
          }
        } else {
          $scope.showIcon = true;
        }
      }
    });

    $scope.developmentMode = false;
    featureService.isEnabled('DevelopmentMode').then(function (res) {
      $scope.developmentMode = res;
    });
  },
]);
