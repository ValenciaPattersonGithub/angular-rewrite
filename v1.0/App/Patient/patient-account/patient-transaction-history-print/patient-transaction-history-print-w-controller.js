'use strict';
var app = angular.module('Soar.Patient');

var TransactionHistoryPrintController = app
  .controller('TransactionHistoryPrintController', [
    '$scope',
    '$routeParams',
    function ($scope, $routeParams) {
      // this controller is only used for routing...can be removed after angular routing is in place
    },
  ])
  .directive('transactionHistoryPrint', function () {
    return {
      restrict: 'E',
      scope: false,
      templateUrl:
        'App/Patient/patient-account/patient-transaction-history-print/patient-transaction-history-print-w.html',
    };
  });
