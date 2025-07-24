'use strict';
angular
  .module('Soar.Patient')
  .controller('AppointmentHistoryDirectiveController', [
    '$scope',
    '$routeParams',
    '$filter',
    'PatientAppointmentsFactory',
    'toastrFactory',
    'patSecurityService',
    '$location',
    function (
      $scope,
      $routeParams,
      $filter,
      patientAppointmentsFactory,
      toastrFactory,
      patSecurityService,
      $location
    ) {
      var ctrl = this;

      //#region access

      ctrl.getAccess = function () {
        $scope.access = patientAppointmentsFactory.access();
        if (!$scope.access.View) {
          toastrFactory.error(
            patSecurityService.generateMessage('soar-sch-sptapt-view'),
            'Not Authorized'
          );
          event.preventDefault();
          $location.path('/');
        }
      };
      ctrl.getAccess();

      //#endregion

      ctrl.$onInit = function () {
        // local vars

        ctrl.patientId = $scope.data
          ? $scope.data.PatientId
          : $routeParams.patientId;
        ctrl.filterAppointmentHistory();
      };

      ctrl.filterAppointmentHistory = function () {
        if ($scope.counts && $scope.counts.length > 0) {
          $scope.apptHistory = $filter('filter')($scope.counts, {
            PersonId: ctrl.patientId,
          })[0];
        }
      };

      $scope.$watch(
        'counts',
        function (nv, ov) {
          if (!angular.equals(nv, ov)) {
            ctrl.filterAppointmentHistory();
          }
        },
        true
      );
    },
  ]);
