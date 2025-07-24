'use strict';
angular.module('Soar.Patient').controller('TreatmentPlanAddToAppointment', [
  '$scope',
  'addToAppointmentModalCallback',
  'servicesWithAppointments',
  'serviceToAdd',
  'stageNumber',
  '$uibModalInstance',
  'ListHelper',
  'PatientServicesFactory',
  function (
    $scope,
    addToAppointmentModalCallback,
    servicesWithAppointments,
    serviceToAdd,
    stageNumber,
    $uibModalInstance,
    listHelper,
    patientServicesFactory
  ) {
    var ctrl = this;

    ctrl.$onInit = function () {
      $scope.selectedAppointmentId = null;
      $scope.appointmentChoices = ctrl.getUniqueAppointments(
        servicesWithAppointments
      );

      if (serviceToAdd.ServiceTransaction) {
        $scope.serviceToAdd = serviceToAdd.ServiceTransaction;
      } else {
        $scope.serviceToAdd = serviceToAdd;
      }
    };

    // set the InsuranceOrder on serviceTransactions that are to be added to an appointment based
    // on the TreatmentPlanServiceHeader.ServiceTransaction.Priority
    // if
    ctrl.setInsuranceOrderOnService = function (serviceTransaction) {
      // get the NextInsuranceOrder from $scope.appointmentChoices
      var matchingAppointment = _.find(
        $scope.appointmentChoices,
        function (appointmentChoice) {
          return (
            appointmentChoice.AppointmentId === serviceTransaction.AppointmentId
          );
        }
      );

      // set InsuranceOrder based on LastInsuranceOrder on appointment
      if (matchingAppointment) {
        // default to first possible InsuranceOrder
        var nextInsuranceOrder = 1;
        var lastInsuranceOrder = matchingAppointment.LastInsuranceOrder;
        if (_.isInteger(lastInsuranceOrder)) {
          nextInsuranceOrder = lastInsuranceOrder + 1;
        }
        serviceTransaction.InsuranceOrder = nextInsuranceOrder;
        matchingAppointment.LastInsuranceOrder = nextInsuranceOrder;
      }
      return serviceTransaction;
    };
    // should get appointmentId when radio button clicked
    $scope.handleRadioClick = function (
      appointmentId,
      serviceTransactionAppointmentId
    ) {
      $scope.selectedAppointmentId =
        serviceTransactionAppointmentId === undefined
          ? appointmentId
          : serviceTransactionAppointmentId;
    };

    // handle update ServiceTransaction based on whether to add ServiceTransaction to an existing appointment
    $scope.saveService = function (value) {
      if (serviceToAdd.ServiceTransaction) {
        if (value === 'Save') {
          serviceToAdd.ServiceTransaction.AppointmentId =
            $scope.selectedAppointmentId;
          $scope.selectedAppointmentId = null;
        }
        serviceToAdd.ServiceTransaction.ObjectState = 'Update';
        serviceToAdd.ServiceTransaction = $scope.serviceToAdd;
        //Set ServiceTransaction.ServiceTransactionStatusId  to 7 (Accepted) when service is added to appointment
        if (
          !_.isNil(serviceToAdd.ServiceTransaction.AppointmentId) &&
          serviceToAdd.ServiceTransaction.AppointmentId != ''
        ) {
          serviceToAdd.ServiceTransaction.ServiceTransactionStatusId = 7;
        }
        ctrl.setInsuranceOrderOnService(serviceToAdd.ServiceTransaction);
        // ServiceTransaction is updated from this module
        $scope.updateServiceTransaction(serviceToAdd);
      } else {
        if (value === 'Save') {
          serviceToAdd.AppointmentId = $scope.selectedAppointmentId;
          $scope.selectedAppointmentId = null;
        }
        if (
          serviceToAdd.AppointmentId != null &&
          serviceToAdd.AppointmentId != ''
        ) {
          // if ServiceTransaction is to be added to an Appointment, set InsuranceOrder
          ctrl.setInsuranceOrderOnService(serviceToAdd);
          // ServiceTransaction to be updated from parent module with AppointmentId
          addToAppointmentModalCallback(serviceToAdd, stageNumber);
        } else {
          // ServiceTransaction to be updated from parent module with no AppointmentId
          serviceToAdd.AppointmentId = '';
          addToAppointmentModalCallback(serviceToAdd, stageNumber);
        }
      }
      serviceToAdd.$$appointmentAdded = true;
      $uibModalInstance.close();
    };

    // this method updates a new ServiceTransaction that has been passed added via ProposedServiceController
    $scope.updateServiceTransaction = function (serviceToAdd) {
      patientServicesFactory
        .update([serviceToAdd.ServiceTransaction])
        .then(function (res) {
          $scope.saving = false;
          var savedServiceTransactions = res.Value;
          if (savedServiceTransactions.length > 0) {
            var updatedServiceToAdd = listHelper.findItemByFieldValue(
              savedServiceTransactions,
              'ServiceTransactionId',
              serviceToAdd.ServiceTransaction.ServiceTransactionId
            );
            serviceToAdd.ServiceTransaction.DataTag =
              updatedServiceToAdd.DataTag;
            serviceToAdd.ServiceTransaction.InsuranceEstimates =
              updatedServiceToAdd.InsuranceEstimates;
            addToAppointmentModalCallback(serviceToAdd, stageNumber);
            serviceToAdd.$$appointmentAdded = true;
            $uibModalInstance.close();
          }
        });
    };

    // filter servicesWithAppointments to unique appointments for display choices
    ctrl.getUniqueAppointments = function (servicesWithAppointments) {
      var appointmentChoices = [];
      appointmentChoices = _.uniqBy(
        servicesWithAppointments,
        function (serviceWithAppointment) {
          if (serviceWithAppointment.$$AppointmentId != null) {
            return serviceWithAppointment.$$AppointmentId;
          } else {
            return serviceWithAppointment.AppointmentId;
          }
        }
      );
      return appointmentChoices;
    };
  },
]);
