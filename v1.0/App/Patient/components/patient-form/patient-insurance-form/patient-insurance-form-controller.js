'use strict';

angular.module('Soar.Patient').controller('PatientInsuranceFormController', [
  '$scope',
  '$routeParams',
  '$timeout',
  '$filter',
  function ($scope, $routeParams, $timeout, $filter) {
    var ctrl = this;
    $scope.hasIdentifiers = false;
    ctrl.$onInit = function () {};

    $scope.subHeaders1x = ['Plan #3 Insurance Information'];

    $scope.subHeaders2x = ['Plan #6 Insurance Information'];

    $scope.subHeaders1 = [
      'Primary Insurance Information',
      'Plan #2 Insurance Information',
      'Plan #3 Insurance Information',
    ];

    $scope.subHeaders2 = [
      'Plan #4 Insurance Information',
      'Plan #5 Insurance Information',
      'Plan #6 Insurance Information',
    ];

    $scope.field = {
      carrierName: 'Carrier Name: ____________________________________________',
      effectiveDate: 'Effective Date: _______________________',
      address1:
        'Address 1: _______________________________________________________________________________________',
      address2:
        'Address 2: _______________________________________________________________________________________',
      city: 'City: ___________________________________________',
      state: 'State: _______',
      zipCode: 'Zip Code: _______________________',
      planName: 'Plan Name: _____________________________________________',
      policyHolderId: 'Policy Holder ID: _______________________',
      policyHolder: 'Policy Holder: ',
      policyHolderDoB: 'Policy Holder Date of Birth: __________________',
      relationshipToPolicyHolder:
        'Relationship to Policy Holder: _____________________________________',
      dependentChildCoverage: 'Dependent Child Coverage Only',
      self: 'Self ',
      other: 'Other ',
      title: 'Patient Insurance',
      line: '______________________',
    };

    ctrl.removeWalkMePlayer = function () {
      $timeout(function () {
        if (angular.element('#walkme-player').length) {
          angular.element(document.querySelector('#walkme-player')).remove();
        } else {
          ctrl.removeWalkMePlayer();
        }
      }, 400);
    };

    ctrl.cleanup = function () {
      angular
        .element('.view-container')
        .attr('style', 'background-color:#dddddd');
      angular.element('.top-header').remove();
      angular.element('.feedback-container').remove();
      angular.element('body').attr('style', 'padding-top:0;');
      angular.element('body').attr('style', 'padding-left:0;');
      angular.element('body').attr('style', 'background-color:#dddddd');

      ctrl.removeWalkMePlayer();
    };

    ctrl.cleanup();

    ctrl.$onInit();
  },
]);
