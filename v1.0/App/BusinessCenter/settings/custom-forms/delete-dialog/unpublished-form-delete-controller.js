'use strict';

var app = angular.module('Soar.BusinessCenter');

var CustomFormDiscardControl = app.controller('CustomFormDeleteController', [
  '$scope',
  '$uibModalInstance',
  'formId',
  'formName',
  function ($scope, $uibModalInstance, formId, formName) {
    $scope.formName = formName;
    $scope.confirmDeleteUnpublishedForm = function () {
      $uibModalInstance.close(formId);
    };

    $scope.cancelDeleteUnpublishedForm = function () {
      $uibModalInstance.dismiss('cancel');
    };
  },
]);
