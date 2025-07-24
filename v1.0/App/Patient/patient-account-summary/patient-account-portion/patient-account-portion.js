'use strict';
angular.module('Soar.Patient').controller('PatientAccountPortionController', [
  '$scope',
  'localize',
  '$timeout',
  '$routeParams',
  'patSecurityService',
  'toastrFactory',
  function (
    $scope,
    localize,
    $timeout,
    $routeParams,
    patSecurityService,
    toastrFactory
  ) {
    var ctrl = this;

    //#region properties

    $scope.loading = false;

    //#endregion

    $scope.makePayment = function () {
      $scope.paymentFunction();
    };
  },
]);
