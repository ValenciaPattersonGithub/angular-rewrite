'use strict';
var app = angular.module('Soar.Patient');
app.controller('PatientProfileRefactorController', [
  '$scope',
  '$timeout',
  'toastrFactory',  
  'StaticData',
  'localize',
  '$location',
  '$rootScope',
  'ModalFactory',
  '$routeParams',
  'patSecurityService',
  'ListHelper',
  '$filter',
  'FeatureService',
  function (
    $scope,
    $timeout,
    toastrFactory,    
    staticData,
    localize,
    $location,
    $rootScope,
    modalFactory,
    $routeParams,
    patSecurityService,
    listHelper,
    $filter,
    featureService
  ) {
    var ctrl = this;
    ctrl.$onInit = function () {
      $scope.TabMode = false;
      featureService
        .isEnabled('AccountMemberTabs', 'practicesettingrow')
        .then(function (res) {
          $scope.TabMode = res;
        });
    };

    ctrl.$onInit();
  },
]);
