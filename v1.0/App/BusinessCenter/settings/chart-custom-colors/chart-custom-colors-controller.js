(function () {
  'use strict';

  angular
    .module('Soar.BusinessCenter')
    .controller('ChartCustomColorsController', ChartCustomColorsController);

  ChartCustomColorsController.$inject = [
    '$scope',
    '$rootScope',
    '$routeParams',
    '$location',
    'localize',
    'PatientServices',
    'ShareData',
    'referenceDataService',
  ];
  function ChartCustomColorsController(
    $scope,
    $rootScope,
    $routeParams,
    $location,
    localize,
    patientServices,
    shareData,
    referenceDataService
  ) {
    BaseCtrl.call(this, $scope, 'ChartCustomColorsController');

    var ctrl = this;
    $scope.hasChanges = false;

    ctrl.init = function () {};

    ctrl.init();
  }

  ChartCustomColorsController.prototype = Object.create(BaseCtrl);
})();
