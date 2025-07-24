'use strict';

var app = angular.module('Soar.Schedule');
var feeListsCrudController = app.controller('ProviderSchedulesController', [
  '$scope',
  '$timeout',
  'toastrFactory',
  'localize',
  'patSecurityService',
  '$location',
  'ListHelper',
  'AppointmentModalFactory',
  function (
    $scope,
    $timeout,
    toastrFactory,
    localize,
    patSecurityService,
    $location,
    listHelper,
    AppointmentModalFactory
  ) {
    var ctrl = this;
  },
]);
