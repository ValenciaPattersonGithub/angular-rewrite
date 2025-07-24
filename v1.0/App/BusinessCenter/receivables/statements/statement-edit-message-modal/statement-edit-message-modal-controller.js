(function () {
  'use strict';

  angular
    .module('Soar.BusinessCenter')
    .controller(
      'StatementEditMessageModalController',
      StatementEditMessageModalController
    );

  StatementEditMessageModalController.$inject = [
    '$scope',
    '$uibModalInstance',
    'accountStatementMessage',
  ];

  function StatementEditMessageModalController(
    $scope,
    mInstance,
    accountStatementMessage
  ) {
    $scope.accountStatementMessage = accountStatementMessage;

    $scope.close = function () {
      mInstance.dismiss();
    };

    $scope.save = function (accountStatementMessage) {
      mInstance.close(accountStatementMessage);
    };
  }
})();
