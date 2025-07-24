(function () {
  'use strict';
  angular.module('Soar.Patient').factory('PatientLandingModalFactory', [
    '$uibModal',
    function ($uibModal) {
      var factory = this;

      factory.getPatientExportModal = function (
        activeGridData,
        fromPatientLanding
      ) {
        return $uibModal.open({
          templateUrl:
            'App/Patient/patient-landing/patient-export-modal/patient-export-modal.html',
          controller: 'PatientExportModalController',
          size: '',
          windowClass: 'patient-landing-modal',
          backdrop: 'static',
          keyboard: false,
          animation: false,
          //amfa: appointmentEditData.existingAppointment != null && appointmentEditData.existingAppointment.AppointmentId > '' ? 'soar-sch-sptapt-edit' : 'soar-sch-sptapt-add',
          resolve: {
            modalResolve: function () {
              return angular.copy(activeGridData);
            },
            fromPatientLanding: function () {
              return fromPatientLanding;
            },
          },
        }).result;
      };

      return {
        getPatientExportModal: function (activeGridData, fromPatientLanding) {
          return factory.getPatientExportModal(
            activeGridData,
            fromPatientLanding
          );
        },
      };
    },
  ]);
})();
