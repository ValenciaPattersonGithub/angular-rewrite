'use strict';

var app = angular.module('Soar.BusinessCenter');

var CustomFormPublishControl = app.controller('CustomFormPublishController', [
  '$scope',
  '$uibModalInstance',
  'formId',
  function ($scope, $uibModalInstance, formId) {
    $scope.saveAndPublishForm = function () {
      $uibModalInstance.close({ formId: formId, canPublish: true });
    };

    $scope.saveForm = function () {
      $uibModalInstance.close({ formId: formId, canPublish: false });
    };

    $scope.closeForm = function () {
      $uibModalInstance.dismiss('cancel');
    };
  },
]);
