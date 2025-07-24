'use strict';
angular
  .module('Soar.Patient')
  .controller('PatientLocationValidationController', [
    '$scope',
    '$rootScope',
    'toastrFactory',
    'ListHelper',
    'localize',
    'ModalFactory',
    'patientData',
    'locationData',
    'LocationServices',
    'SaveStates',
    '$filter',
    '$uibModalInstance',
    '$timeout',
    '$q',
    function (
      $scope,
      $rootScope,
      toastrFactory,
      listHelper,
      localize,
      modalFactory,
      patientData,
      locationData,
      locationServices,
      saveStates,
      $filter,
      $uibModalInstance,
      $timeout,
      $q
    ) {
      var ctrl = this;
      $scope.patientData = patientData;
      $scope.locationData = locationData;
      var profile = patientData.profile;

      $scope.close = function () {
        $uibModalInstance.close();
      };

      // name formatter
      ctrl.getFormattedName = function (patient) {
        if (patient) {
          var formattedName = patient.FirstName + ' ';
          formattedName = patient.PreferredName
            ? formattedName.concat(' (' + patient.PreferredName + ') ')
            : formattedName;
          formattedName = patient.MiddleName
            ? formattedName.concat(patient.MiddleName + '. ')
            : formattedName;
          formattedName = formattedName.concat(patient.LastName);
          formattedName = patient.Suffix
            ? formattedName.concat(', ' + patient.Suffix)
            : formattedName;
          formattedName = patient.DateOfBirth
            ? formattedName.concat(
                '  ' + $filter('date')(profile.DateOfBirth, 'MM/dd/yyyy')
              )
            : formattedName;
          return formattedName;
        }
      };

      $scope.patientName = ctrl.getFormattedName(profile);
    },
  ]);
