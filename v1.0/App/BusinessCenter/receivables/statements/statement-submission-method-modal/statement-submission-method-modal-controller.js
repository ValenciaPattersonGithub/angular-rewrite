'use strict';

angular
  .module('Soar.BusinessCenter')
  .controller('StatementSubmissionMethodModalController', [
    '$scope',
    '$uibModalInstance',
    'submissionMethod',
    function ($scope, mInstance, submissionMethod) {
      $scope.submissionMethod = submissionMethod;

      $scope.submit = function (submissionMethod) {
        mInstance.close(submissionMethod);
      };

      $scope.cancel = function () {
        mInstance.close('cancel');
      };
    },
  ]);
