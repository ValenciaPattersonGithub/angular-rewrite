'use strict';
angular
  .module('Soar.Patient')
  .controller('PatientPreventiveCareDirectiveController', [
    '$scope',
    'ListHelper',
    'PatientPreventiveCareFactory',
    'localize',
    '$timeout',
    'ModalFactory',
    'locationService',
    'TimeZoneFactory',
    function (
      $scope,
      listHelper,
      patientPreventiveCareFactory,
      localize,
      $timeout,
      modalFactory,
      locationService,
      timeZoneFactory
    ) {
      var ctrl = this;
      $scope.nextPrev = '';

      ctrl.$onInit = function () {
        ctrl.refreshPreventiveCare(true);        
      };

      // getting patient preventive care services due
      ctrl.getPatientPrevCareItems = function () {
              
        // Wrap all processing in a $timeout to ensure Angular's digest cycle is triggered
        $timeout(function() {
          // Fetch from person object
          $scope.patientPrevCareItems = $scope.person.PreventiveServicesDue;
          
          // Process each exam
          angular.forEach($scope.patientPrevCareItems, function (exam) {
            patientPreventiveCareFactory.SetCustomPropertiesForServicesDue(
              exam,
              true
            );
            if (exam.IsTrumpService) {
              $scope.prevCareDue = exam.DateServiceDue;
              $scope.nextPrev = timeZoneFactory.ConvertDateTZ(
                exam.AppointmentStartTime,
                locationService.getCurrentLocation().timezone
              );
            }
          });
        });
      };
      
      // Add a method to refresh preventive care data
      ctrl.refreshPreventiveCare = function (forceRefresh) {
        patientPreventiveCareFactory.GetAllServicesDue($scope.person.PatientId, forceRefresh)
          .then(function (result) {
            if (result && result.Value) {
              // Update the local data
              $scope.person.PreventiveServicesDue = result.Value;
              ctrl.getPatientPrevCareItems();
            }
          });
      };
    },
  ]);                       