angular.module('common.controllers').controller('ResponsiblePartyController', [
  '$scope',
  '$uibModalInstance',
  'item',
  'PersonServices',
  'CustomEvents',
  function ($scope, mInstance, item, personServices, customEvents) {
    var ctrl = this;

    $scope.display = item;
    $scope.patient = $scope.display.patient
      ? $scope.display.patient
      : $scope.display.appointment.Patient;
    $scope.patient.IsResponsiblePersonEditable = true;
    $scope.hasErrors = false;
    $scope.responsiblePerson = null;
    $scope.validResponsiblePerson = true;
    $scope.focusOnResponsiblePerson = false;
    $scope.ageCheck = true;
    $scope.isValid = true;

    ctrl.updateSuccess = function (res) {
      $scope.display.appointment.Patient = res.Value.Profile;
      $scope.patient = res.Value.Profile;
      $scope.confirmDiscard($scope.display.appointment);
      $scope.$root.$broadcast(customEvents.AppointmentsUpdated, [
        $scope.display.appointment,
      ]);
    };
    $scope.AddRp = function (patient) {
      $scope.isValid = true;
      if (patient.ResponsiblePersonType == 1) {
        patient.ResponsiblePersonId = patient.PatientId;
      }
      if (patient.ResponsiblePersonId != null) {
        var person = {};
        person.Profile = patient;
        personServices.Persons.update(person, ctrl.updateSuccess);
      } else {
        $scope.isValid = false;
      }
    };

    $scope.confirmDiscard = function (appointment) {
      mInstance.close(appointment);
    };

    $scope.cancelDiscard = function () {
      mInstance.dismiss();
    };
  },
]);
