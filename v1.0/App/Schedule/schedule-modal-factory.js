(function () {
  'use strict';
  angular.module('Soar.Patient').factory('ScheduleModalFactory', [
    'PatientServices',
    '$filter',
    'localize',
    'ListHelper',
    '$q',
    'toastrFactory',
    '$timeout',
    'patSecurityService',
    'StaticData',
    'LocationServices',
    '$uibModal',
    function (
      patientServices,
      $filter,
      localize,
      listHelper,
      $q,
      toastrFactory,
      $timeout,
      patSecurityService,
      staticData,
      locationServices,
      $uibModal
    ) {
      var factory = this;

      factory.getScheduleBlockModal = function (
        appointmentEditData,
        fromSchedule
      ) {
        return $uibModal.open({
          templateUrl:
            'App/Schedule/appointments/schedule-block-modal/schedule-block-modal.html',
          controller: 'ScheduleBlockModalController',
          size: 'lg',
          windowClass: 'block-modal',
          backdrop: 'static',
          keyboard: false,
          amfa:
            appointmentEditData.existingAppointment != null &&
            appointmentEditData.existingAppointment.AppointmentId > ''
              ? 'soar-sch-sptapt-edit'
              : 'soar-sch-sptapt-add',
          resolve: {
            modalResolve: function () {
              return angular.copy(appointmentEditData);
            },
            fromSchedule: function () {
              return fromSchedule;
            },
          },
        }).result;
      };

      return {
        ScheduleBlockModal: function (appointmentEditData, fromSchedule) {
          return factory.getScheduleBlockModal(
            appointmentEditData,
            fromSchedule
          );
        },
      };
    },
  ]);
})();
