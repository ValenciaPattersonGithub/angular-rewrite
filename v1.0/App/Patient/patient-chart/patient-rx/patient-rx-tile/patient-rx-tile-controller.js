'use strict';

angular.module('Soar.Patient').controller('PatientRxTileController', [
  '$scope',
  '$routeParams',
  'localize',
  'toastrFactory',
  'patSecurityService',
  '$location',
  function (
    $scope,
    $routeParams,
    localize,
    toastrFactory,
    patSecurityService,
    $location
  ) {
    var ctrl = this;

    // TODO This isn't needed
    $scope.authViewAccess = function () {
      return patSecurityService.IsAuthorizedByAbbreviation(
        'soar-clin-clinrx-view'
      );
    };

    $scope.authAccess = function () {
      if (!$scope.authViewAccess()) {
        toastrFactory.error(
          patSecurityService.generateMessage('soar-clin-clinrx-view'),
          'Not Authorized'
        );
        event.preventDefault();
        $location.path('/');
      }
    };
    $scope.authAccess();

    /*    

TODO Do we want all statuses?
Revise filter icon order
Dev note: Joe Banken will need to setup 'test' users with Dosespot for creating a prescription
         */
  },
]);
