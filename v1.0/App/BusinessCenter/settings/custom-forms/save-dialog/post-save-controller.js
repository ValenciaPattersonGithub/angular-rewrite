'use strict';

var app = angular.module('Soar.BusinessCenter');

var CustomFormPostSaveControl = app.controller('CustomFormPostSaveController', [
  '$scope',
  '$uibModalInstance',
  'formId',
  'isSave',
  function ($scope, $uibModalInstance, formId, isSave) {
    $scope.isSaveOpearation = isSave;
    $scope.doPublish = function () {
      $uibModalInstance.close({ formId: formId, doPublish: true });
    };

    $scope.doNotPublish = function () {
      $uibModalInstance.close({ formId: formId, doPublish: false });
    };
  },
]);
