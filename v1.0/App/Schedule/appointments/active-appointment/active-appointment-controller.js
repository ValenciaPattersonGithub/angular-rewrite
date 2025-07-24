(function () {
  'use strict';

  angular
    .module('Soar.Schedule')
    .controller('ActiveAppointmentController', ActiveAppointmentController);

  ActiveAppointmentController.$inject = [
    '$scope',
    'ScheduleServices',
    'toastrFactory',
    '$uibModal',
    '$rootScope',
    'SaveStates',
    'localize',
    'BoundObjectFactory',
    'patSecurityService',
    'ListHelper',
    'PatientPreventiveCareFactory',
    '$q',
    'TimeZoneFactory',
    'UserServices',
    'SurfaceHelper',
    'PatientOdontogramFactory',
    'PatientServicesFactory',
    'PatientAppointmentsFactory',
    'patAuthenticationService',
    'SoarConfig',
    'practiceService',
    'locationService',
    'ProviderOnClaimsFactory',
    'AppointmentUtilities',
    'referenceDataService',
    'PersonFactory',
    'ModalFactory',
    'AmfaKeys',
    '$timeout',
    'PatientServices',
    'AppointmentViewVisibleService',
    'AppointmentViewDataLoadingService',
    'AppointmentServiceTransactionsService',
    'ScheduleAppointmentHttpService',
    'ServerlessSignalrHubConnectionService',
  ];

  function ActiveAppointmentController(
    $scope,
    scheduleServices,
    toastrFactory,
    $uibModal,
    $rootScope,
    saveStates,
    localize,
    boundObjectFactory,
    patSecurityService,
    listHelper,
    patientPreventiveCareFactory,
    $q,
    timeZoneFactory,
    userServices,
    surfaceHelper,
    patientOdontogramFactory,
    patientServicesFactory,
    patientAppointmentsFactory,
    patAuthenticationService,
    soarConfig,
    practiceService,
    locationService,
    providerOnClaimsFactory,
    appointmentUtilities,
    referenceDataService,
    personFactory,
    modalFactory,
    AmfaKeys,
    $timeout,
    patientServices,
    appointmentViewVisibleService,
    appointmentViewDataLoadingService,
    appointmentServiceTransactionsService,
    scheduleAppointmentHttpService,
    serverlessSignalrHubConnectionService
  ) {
    BaseCtrl.call(this, $scope, 'ActiveAppointmentController');

    var ctrl = this;
    //#region local vars

    ctrl.today = new Date();
    ctrl.currentLocation = locationService.getCurrentLocation();
    ctrl.appointmentCrud = boundObjectFactory.Create(
      scheduleServices.Dtos.Appointment
    );
    // Flag to indicate if finished appointment modal is open
    ctrl.modalIsOpen = false;
    ctrl.providers = [];
    ctrl.appointmentNeedsUserChange = false;
    ctrl.allServicesProcessed = true;
    ctrl.servicesToAdd = [];
    //Set InsuranceOrder on load of a running appointment to zero
    appointmentServiceTransactionsService.setInsuranceOrderOnServiceTransaction(
      0
    );

    //#endregion

    //#region scope objects

    $scope.actApptActive = false;

    $scope.locationChosen = null;
    $scope.preventiveCareServices = null;
    $scope.reloadingAppointment = false;

    // Disable action buttons flag
    $scope.disableActions = false;

    // Tabset Active
    $scope.actApptActiveTabToggle = 1;
    $scope.preventiveDate = { dueDate: '' };
    // Tabset Object
    $scope.actApptTabs = {
      title: { index: 0, disabled: false },
      details: { index: 1, disabled: false },
      txPlans: { index: 2, disabled: false },
      addSrvc: { index: 3, disabled: false },
      prevCare: { index: 4, disabled: false },
    };
    $scope.noteData = { original: null, current: null };
    $scope.selectedGlobalProviderId = null;

    // #endregion

    //#region load service codes

    // get RDS service codes
    function loadServiceCodes() {
      $scope.serviceCodes = referenceDataService.get(
        referenceDataService.entityNames.serviceCodes
      );
    }

    loadServiceCodes();

    //#endregion

    //#region load providers
    ctrl.loadProviders = function () {
      ctrl.providers = referenceDataService.get(
        referenceDataService.entityNames.users
      );
    };
    ctrl.loadProviders();
    //#endregion

    //#region Authorization

    ctrl.soarAuthClinicalAppointmentsFinishKey = 'soar-sch-sptapt-finish';
    ctrl.soarAuthClinicalAppointmentsEditKey = 'soar-sch-sptapt-edit';
    ctrl.soarAuthScheduleApptViewKey = 'soar-sch-sch-view';
    ctrl.soarAuthSchApptClassificationSelectKey = 'soar-sch-sptapt-add';
    ctrl.soarAuthScheduleApptAddKey = 'soar-sch-sapttp-add';
    $scope.hasClinicalAppointmentEditAccess = false;
    $scope.hasClinicalAppointmentFinishAccess = false;
    ctrl.hasAddAccessToScheduleAppt = false;

    //Patient Preventive Care Services
    $scope.hasPreventiveCareViewAccess = patSecurityService.IsAuthorizedByAbbreviation(
      'soar-per-perps-view'
    );

    // Check if logged in user has edit access to patient appointments
    ctrl.authEditAccessToPatientAppointments = function () {
      return patSecurityService.IsAuthorizedByAbbreviation(
        ctrl.soarAuthClinicalAppointmentsEditKey
      );
    };

    // Check if logged in user has edit access to patient appointments
    ctrl.authFinishAccessToPatientAppointments = function () {
      return patSecurityService.IsAuthorizedByAbbreviation(
        ctrl.soarAuthClinicalAppointmentsFinishKey
      );
    };

    // Check if logged in user has view and add access to schedule appointments
    ctrl.authAddAccessToScheduleAppt = function () {
      ctrl.hasScheduleApptViewAccess = patSecurityService.IsAuthorizedByAbbreviation(
        ctrl.soarAuthScheduleApptViewKey
      );
      ctrl.hasScheduleApptClassificationSelectAccess = patSecurityService.IsAuthorizedByAbbreviation(
        ctrl.soarAuthSchApptClassificationSelectKey
      );
      ctrl.hasScheduleApptAddAccess = patSecurityService.IsAuthorizedByAbbreviation(
        ctrl.soarAuthScheduleApptAddKey
      );

      return (
        ctrl.hasScheduleApptViewAccess &&
        ctrl.hasScheduleApptClassificationSelectAccess &&
        ctrl.hasScheduleApptAddAccess
      );
    };

    // Check access rights of user
    ctrl.authAccess = function () {
      // Check edit access for starting an appointment
      if (ctrl.authEditAccessToPatientAppointments()) {
        $scope.hasClinicalAppointmentEditAccess = true;
      }

      // Check edit access for starting an appointment
      if (ctrl.authFinishAccessToPatientAppointments()) {
        $scope.hasClinicalAppointmentFinishAccess = true;
      }

      // Check view and add access to schedule appointments
      if (ctrl.authAddAccessToScheduleAppt()) {
        ctrl.hasAddAccessToScheduleAppt = true;
      }
    };

    //Notify user, he is not authorized to access current area
    ctrl.notifyNotAuthorized = function () {
      toastrFactory.error(
        localize.getLocalizedString(
          'User is not authorized to access this area.'
        ),
        localize.getLocalizedString('Not Authorized')
      );
    };

    //Notify user, he is not authorized to access
    ctrl.notifyNotAuthorizedWithAmfa = function (abbrev) {
      toastrFactory.error(
        patSecurityService.generateMessage(abbrev),
        'Not Authorized'
      );
    };

    // Check edit access for patient appointment
    ctrl.authAccess();

    //#endregion

    // #region Expand and collapse functionality

    // Toggle view/hide appointment control
    $scope.actApptToggle = function () {
      $scope.actApptActive = !$scope.actApptActive;
      $scope.actApptActiveTabToggle = 1;
    };

    // #endregion

    // #region Begin appointment event listeners

    // first load of an appointment with status of InTreatment
    ctrl.initAppointmentLoad = function (appointment) {
      // only get preventive service info if patientId is available
      if (
        !_.isNil($scope.patientInfo) &&
        !_.isNil($scope.patientInfo.PatientId)
      ) {
        ctrl.servicesDuePromise = ctrl.getPreventiveServiceInfo(
          $scope.patientInfo.PatientId
        );
      }
      $scope.actApptActive = true;
      // add service code information to each planned service
      ctrl.getPlannedServiceCodes(appointment);
      $scope.locationChosen = { LocationId: appointment.LocationId };
      $scope.activeAppointment = appointment;
      $scope.noteData.original = $scope.noteData.current = appointment.Note;
    };

    ctrl.appointmentStartupRetrievalSuccess = function (result) {
      if (result !== null && result.Value !== null) {
        var currentApp = result.Value;

        currentApp.Appointment.Location = currentApp.Location;

        ctrl.initAppointmentLoad(currentApp.Appointment);
      }
    };

    // Error callback of Get all appointment
    ctrl.appointmentRetrievalFailed = function () {
      toastrFactory.error(
        localize.getLocalizedString(
          'Failed to retrieve the list of {0}. Refresh the page to try again',
          ['Appointments']
        ),
        localize.getLocalizedString('Server Error')
      );
    };

    $scope.$watch('activeAppointmentId', function (nv) {
      // if activeAppointmentId changes and is not null, get appointment data
      if (!_.isNil(nv)) {
        var appointmentId = nv;
        $scope.actApptActive = true;
        $scope.actApptActiveTab = 1;
        var params = {
          AppointmentId: appointmentId,
          PersonId: $scope.personId,
          FillAppointmentType: true,
          FillLocation: true,
          FillPerson: true,
          FillProviders: true,
          FillRoom: false,
          FillProviderUsers: false,
          FillServices: true,
          FillServiceCodes: false,
          FillPhone: false,
          IncludeCompletedServices: true,
        };

        scheduleServices.Lists.Appointments.GetWithDetails(
          params
        ).$promise.then(
          ctrl.appointmentStartupRetrievalSuccess,
          ctrl.appointmentRetrievalFailed
        );
      }
    });

    // #endregion

    // #region Finish appointment

    // Open finish appointment modal
    ctrl.openFinishedAppointmentModal = function (
      appointment,
      pendingEncounter
    ) {
      if (ctrl.modalIsOpen === false && pendingEncounter != null) {
        ctrl.modalIsOpen = true;

        ctrl.dataForModal = {
          PatientInfo: $scope.patientInfo,
          Appointment: appointment,
          Encounter: pendingEncounter,
        };

        // Finish Appointment Modal - no feedback needed
        var modalInstance = $uibModal.open({
          templateUrl:
            'App/Schedule/appointments/active-appointment/finish-appointment-summary/finish-appointment-summary.html',
          controller: 'FinishAppointmentSummaryController',
          keyboard: false,
          size: 'lg',
          windowClass: 'center-modal',
          backdrop: 'static',
          amfa: ctrl.soarAuthClinicalAppointmentsEditKey,
          resolve: {
            DataForModal: function () {
              return ctrl.dataForModal;
            },
          },
        });
        modalInstance.result.then(ctrl.finishAppointmentModalOnClose);
      }
    };

    // Close event handler for finish appointment modal
    ctrl.finishAppointmentModalOnClose = function (action) {
      ctrl.modalIsOpen = false;
      $scope.actApptActive = false;
      $scope.activeAppointment = null;
      $scope.disableActions = false;

        if (action && action.ScheduleNextAppt) {
            $scope.openAppointmentModal();
        }
        else {
            $rootScope.$broadcast('appointment:end-appointment');
        }

        
    };

    // Finish the active appointment
    // ref bug 385773 on finish appointment plannedService.DateEntered should be set to current date
    $scope.finishAppointment = function () {
      if ($scope.hasClinicalAppointmentFinishAccess) {
        var now = moment();
        var appointmentDate = moment([
          now.year(),
          now.month(),
          now.date(),
          0,
          0,
          0,
          0,
        ]);
        if (!$scope.disableActions) {
          $scope.disableActions = true;
          ctrl.appointmentNeedsUserChange = false;
          // Set planned services object state to updated and service transaction status to Pending(5) for creation of encounter
          if (
            $scope.activeAppointment.PlannedServices &&
            $scope.activeAppointment.PlannedServices.length > 0
          ) {
            _.forEach(
              $scope.activeAppointment.PlannedServices,
              function (service) {
                var filteredProviderList = [];
                if (service.ObjectState === saveStates.None)
                  service.ObjectState = saveStates.Update;
                service.DateEntered = ctrl.today;
                service.ServiceTransactionStatusId = 5;

                // if they have not selected a global provider on claims, carry out previous logic before control was added.
                if (
                  service.ProviderOnClaimsId == null ||
                  service.ProviderOnClaimsId ==
                    '00000000-0000-0000-0000-000000000000'
                ) {
                  //Find the provider that belongs to the service
                  var serviceProvider = _.find(
                    ctrl.providers,
                    function (provider) {
                      return provider.UserId === service.ProviderUserId;
                    }
                  );
                  if (serviceProvider) {
                    //Find the provider's setup for the service location
                    var userLocationSetup = _.find(
                      serviceProvider.Locations,
                      function (locationSetup) {
                        return locationSetup.LocationId == service.LocationId;
                      }
                    );
                    if (userLocationSetup) {
                      //Prep the provider info before it is sent to the providerOnClaimsFactory
                      serviceProvider.UserLocationSetup = _.cloneDeep(
                        userLocationSetup
                      );
                      serviceProvider.ProviderId = serviceProvider.UserId;
                      filteredProviderList.push(serviceProvider);
                    }
                  }
                  //Pass in the service and location setup for the user,
                  //let the factory determine who is ProviderOnClaims for the service
                  providerOnClaimsFactory.setProviderOnClaimsForService(
                    service,
                    filteredProviderList
                  );
                }
              }
            );
          }
          // Set provider appointment object state to none and remove duplicates
          ctrl.validateProviderAppointments($scope.activeAppointment);
          timeZoneFactory.ResetAppointmentDates($scope.activeAppointment);

          var appointment = _.cloneDeep($scope.activeAppointment);

          // set appointment note if the user has made a change to it here
          // need to test scenarios where another user changes the note (do we override, copy in changes, do we get 409s, etc)
          if ($scope.noteData.current !== $scope.noteData.original)
            appointment.Note = $scope.noteData.current;

          scheduleServices.MarkAsFinished.Appointment(
            appointment,
            ctrl.finishAppointmentOnSuccess,
            ctrl.finishAppointmentOnFailure
          );
        }
      } else {
        ctrl.notifyNotAuthorized();
      }
    };

    // Success callback for finish appointment
    ctrl.finishAppointmentOnSuccess = function (successResponse) {
      var updatedAppointment = successResponse.Value.Appointments[0];
      updatedAppointment.needsUserChange = ctrl.appointmentNeedsUserChange;
      var pendingEncounter = successResponse.Value.Encounter;

      toastrFactory.success(
        localize.getLocalizedString('Finished appointment successfully.'),
        localize.getLocalizedString('Success')
      );
      $rootScope.$broadcast(
        'appointment:update-appointment',
        updatedAppointment
      );

      if (pendingEncounter) {
        // Update chart-ledger services as the status of services will be updated
        $rootScope.$broadcast('soar:chart-services-reload-ledger');

        // open finish appointment modal for further actions
        ctrl.openFinishedAppointmentModal(updatedAppointment, pendingEncounter);
      }

      // Reset active appointment properties
      $scope.actApptActive = false;
        $scope.activeAppointment = null;
        

      $scope.disableActions = false;
    };

    // if invalid properties contains ServiceCodeId property give alternate toastr message to
    // prompt user to verify the services (one example would be when the serviceCode.AffectedAreaId
    // has been changed after a service has been added to the appointment)
    ctrl.checkAppointmentFailedOnPlannedService = function (failedResponse) {
      var invalidProperty = _.find(
        failedResponse.data.InvalidProperties,
        function (property) {
          return property.PropertyName === 'ServiceCodeId';
        }
      );
      if (!_.isNil(invalidProperty)) {
        // we need to provide a different toastr message
        toastrFactory.error(
          localize.getLocalizedString(
            'One or more services on this appointment is invalid.  Please verify the services on this appointment.'
          ),
          localize.getLocalizedString('Server Error')
        );
        return true;
      }
      return false;
    };

    // Error callback for finish appointment
    ctrl.finishAppointmentOnFailure = function (failedResponse) {
      // handling an invalid plannedService toastr differently than other failures
      if (
        ctrl.checkAppointmentFailedOnPlannedService(failedResponse) === false
      ) {
        toastrFactory.error(
          localize.getLocalizedString('Finish appointment failed.'),
          localize.getLocalizedString('Server Error')
        );
      }
      // since we have reloaded the active appointment we need to refresh the dynamic properties of the planned services
      ctrl.getPlannedServiceCodes($scope.activeAppointment);
      $scope.disableActions = false;
    };

    // #endregion

    // #region Reset appointment

    // bug 377503
    // check for duplicate providerAppointment records since they can prevent finishing or cancelling an appointment
    // mark any duplicate provider appointments for ObjectState.Delete, others marked ObjectState.None
    ctrl.validateProviderAppointments = function (appointment) {
      if (
        appointment.ProviderAppointments &&
        appointment.ProviderAppointments.length > 0
      ) {
        _.forEach(appointment.ProviderAppointments, function (providerAppt) {
          providerAppt.ObjectState = saveStates.None;
        });
        // bug 377503
        // mark any duplicate provider appointments for ObjectState.Delete, others marked ObjectState.None
        appointmentUtilities.markDuplicateProviderAppointmentsToRemove(
          appointment
        );
      }
    };

    // Reset the active appointment
    $scope.resetAppointment = function () {
      if ($scope.hasClinicalAppointmentEditAccess) {
        if (!$scope.disableActions) {
          $scope.disableActions = true;
          ctrl.validateProviderAppointments($scope.activeAppointment);

          // reset appointment status to Unconfirmed(0)
          $scope.activeAppointment.Status = 0;
          timeZoneFactory.ResetAppointmentDates($scope.activeAppointment);
          var record = $scope.activeAppointment;

          // we used to call this method ...
          //ctrl.appointmentCrud.Save();

          var appointmentUpdate = {
            appointmentId: record.AppointmentId,
            DataTag: record.DataTag,
            NewAppointmentStatusId: record.Status,
            StartAppointment: false,
          };

          scheduleServices.AppointmentStatus.Update(
            appointmentUpdate,
            function (result) {
              ctrl.resetAppointmentOnSuccess(result, location);
            },
            ctrl.resetAppointmentOnFailure
          );
        }
      } else {
        ctrl.notifyNotAuthorized();
      }
    };

    // Success callback for reset appointment
    ctrl.resetAppointmentOnSuccess = function () {
      $rootScope.$broadcast(
        'appointment:update-appointment',
        $scope.activeAppointment
      );

      // Reset active appointment properties
      $scope.actApptActive = false;
      $scope.activeAppointment = null;
      $rootScope.$broadcast('appointment:end-appointment');
      $scope.disableActions = false;
    };

    // Error callback for reset appointment
    ctrl.resetAppointmentOnFailure = function () {
      $scope.disableActions = false;
    };

    // #endregion

    // #region Add or Remove a Service

    $scope.defaultDay = function (service) {
      var toCheckValue = _.cloneDeep(service.DateModified);
      if (!(toCheckValue instanceof Date)) {
        toCheckValue = new Date(toCheckValue);
      }
      var defaultValue = new Date();
      toCheckValue.setHours(0, 0, 0, 0);
      defaultValue.setHours(0, 0, 0, 0);
    };
    ctrl.addObjectState = function (service) {
      if (service.ObjectState !== saveStates.Update) {
        service.ObjectState = saveStates.Add;
      }
    };
    // Catch an event when user adds a proposed service from "Add a Service" tab
    ctrl.addToPlannedServices = function (addedServiceTransactions) {
      if ($scope.hasClinicalAppointmentEditAccess) {
        $scope.disableActions = true;
        ctrl.checkDirtyServices();

        var appointmentToUpdate = _.cloneDeep($scope.activeAppointment);

        if (_.isArray(addedServiceTransactions)) {
          _.forEach(addedServiceTransactions, function (serviceTransaction) {
            var found = serviceTransaction;
            if (found) {
              if (found.IsSwiftPickCode === true) {
                _.forEach(found.SwiftPickServiceCodes, function (sc) {
                  var fullServiceCodeObject = _.cloneDeep(
                    _.find($scope.serviceCodes, {
                      ServiceCodeId: sc.ServiceCodeId,
                    })
                  );
                  ctrl.addObjectState(fullServiceCodeObject);
                  fullServiceCodeObject.Description = null;
                  $scope.defaultDay(fullServiceCodeObject);
                  appointmentToUpdate.PlannedServices.push(found);
                });
              } else {
                ctrl.addObjectState(found);
                found.Description = null;
                $scope.defaultDay(found);
                appointmentToUpdate.PlannedServices.push(found);
              }
            }
          });
        } else {
          var found = addedServiceTransactions;
          if (found) {
            if (found.IsSwiftPickCode === true) {
              _.forEach(found.SwiftPickServiceCodes, function (sc) {
                var fullServiceCodeObject = _.cloneDeep(
                  _.find($scope.serviceCodes, {
                    ServiceCodeId: sc.ServiceCodeId,
                  })
                );
                ctrl.addObjectState(fullServiceCodeObject);
                fullServiceCodeObject.Description = null;
                $scope.defaultDay(fullServiceCodeObject);
                appointmentToUpdate.PlannedServices.push(found);
              });
            } else {
              ctrl.addObjectState(found);
              found.Description = null;
              $scope.defaultDay(found);
              appointmentToUpdate.PlannedServices.push(found);
            }
          }
        }
        timeZoneFactory.ResetAppointmentDates(appointmentToUpdate);
        ctrl.appointmentCrud.Data = appointmentToUpdate;
        ctrl.appointmentCrud.AfterSaveSuccess =
          ctrl.addToPlannedServicesSuccess;
        ctrl.appointmentCrud.AfterSaveError = ctrl.addToPlannedServicesFailure;
        ctrl.appointmentCrud.Save();
      } else {
        ctrl.notifyNotAuthorized();
      }
    };
    ctrl.checkDirtyServices = function () {
      _.forEach($scope.activeAppointment.PlannedServices, function (serv) {
        if (serv.DateEntered instanceof Date) {
          serv.ObjectState = 'Update';
        }
      });
    };
    // Success callback to handle the action of adding a proposed service
    ctrl.addToPlannedServicesSuccess = function () {
      $scope.reloadingAppointment = true;
      $rootScope.$broadcast(
        'appointment:update-appointment',
        ctrl.appointmentCrud.Data
      );

      // Update chart-ledger services to include the new service
      $rootScope.$broadcast('soar:chart-services-reload-ledger');
      $scope.actApptActiveTabToggle = 1;
    };

    // Error callback to handle the failed action of adding a proposed service
    ctrl.addToPlannedServicesFailure = function () {
      toastrFactory.error(
        localize.getLocalizedString('An error occurred while adding a {0}.', [
          'proposed service',
        ]),
        localize.getLocalizedString('Error')
      );
      $scope.disableActions = false;
    };

    // On delete service
    $scope.onRemoveService = function (service) {
      if ($scope.hasClinicalAppointmentEditAccess) {
        $scope.disableActions = true;
        var removedService = _.find($scope.activeAppointment.PlannedServices, {
          ServiceTransactionId: service.ServiceTransactionId,
        });
        // PBI 360392
        // removing a service should leave proposed service and set AppointmentId to null
        if (removedService != null) {
          removedService.AppointmentId = null;
          removedService.ObjectState = saveStates.Update;
          removedService.Description = null;
        }
        timeZoneFactory.ResetAppointmentDates($scope.activeAppointment);
        ctrl.appointmentCrud.Data = $scope.activeAppointment;
        ctrl.appointmentCrud.AfterSaveSuccess = ctrl.onRemoveServiceSuccess;
        ctrl.appointmentCrud.AfterSaveError = ctrl.onRemoveServiceFailure;
        ctrl.appointmentCrud.Save();
      } else {
        ctrl.notifyNotAuthorized();
      }
    };

    // Success callback to handle the action of removing a proposed service
    ctrl.onRemoveServiceSuccess = function () {
      $scope.reloadingAppointment = true;

      $rootScope.$broadcast(
        'appointment:update-appointment',
        ctrl.appointmentCrud.Data
      );

      // Updating chart-ledger services
      $rootScope.$broadcast('soar:chart-services-reload-ledger');
    };

    // Error callback to handle the failed action of removing a proposed service
    ctrl.onRemoveServiceFailure = function () {
      toastrFactory.error(
        localize.getLocalizedString(
          'An error occurred while removing a {0} from appointment.',
          ['proposed service']
        ),
        localize.getLocalizedString('Error')
      );
      $scope.disableActions = false;
    };

    ctrl.plannedServicesContains = function (serviceToCheck) {
      return _.isEmpty($scope.plannedServiceIds)
        ? false
        : $scope.plannedServiceIds.indexOf(
            serviceToCheck.ServiceTransactionId
          ) !== -1;
    };

    //add planned service codes
    ctrl.getPlannedServiceCodes = function (appointment) {
      ctrl.plannedServiceCodesLoaded = true;
      _.forEach(appointment.PlannedServices, function (service) {
        var serviceCode = _.find($scope.serviceCodes, {
          ServiceCodeId: service.ServiceCodeId,
        });
        if (!_.isNil(serviceCode)) {
          service.AffectedAreaId = serviceCode.AffectedAreaId;
          service.Area = serviceCode.Area;
          service.Code = serviceCode.Code;
          service.CdtCodeName = serviceCode.CdtCodeName;
          service.$$Description = serviceCode.Description;
          service.DisplayAs = serviceCode.DisplayAs;
          service.ObjectState = saveStates.Update;
          service.UsuallyPerformedByProviderTypeId =
          serviceCode.UsuallyPerformedByProviderTypeId;
          ctrl.loadProviderToServices(service);
          ctrl.loadProviderOnClaimsToServices(service);
        }
      });
    };

    ctrl.getPreventiveServiceInfo = function (personId) {
      var deferred = $q.defer();
      if ($scope.hasPreventiveCareViewAccess) {
        patientPreventiveCareFactory
          .PreventiveCareServices(personId, true)
          .then(function (res) {
            $scope.preventiveCareServices = res;
            deferred.resolve();
          });
      }
      return deferred.promise;
    };

    //add services from preventive care
    $scope.addPreventiveServices = function (returnedData, useModal) {
      var servicesToAdd = [];
      for (var i = 0; i < returnedData.PlannedServices.length; i++) {
        if (!ctrl.plannedServicesContains(returnedData.PlannedServices[i])) {
          returnedData.PlannedServices[i].AppointmentId =
            $scope.activeAppointment.AppointmentId;
          returnedData.PlannedServices[i].LocationId =
            $scope.activeAppointment.LocationId;
          returnedData.PlannedServices[i].Description = null;
          returnedData.PlannedServices[i].ObjectState = saveStates.Add;
          $scope.defaultDay(returnedData.PlannedServices[i]);
          servicesToAdd.push(returnedData.PlannedServices[i]);
        }
      }

      if (servicesToAdd.length > 0) {
        if (useModal) {
          $scope.modalAddService(servicesToAdd);
        } else {
          _.forEach(servicesToAdd, function (serv) {
            ctrl.addToQueue(serv);
          });
          ctrl.addQueue();
        }
      }
    };

    //End get preventive care services

    // Enable actions when appointment-list is reloaded
    $scope.$on('appointment:appointment-reloaded', function () {
      $scope.disableActions = false;
      $scope.reloadingAppointment = false;
    });

    // Disable actions when a service transaction is deleted. If a service transaction is deleted from chart ledger, it will reload the appointment list as the service might be associated with an appointment
    $scope.$on('chart-ledger:service-transaction-deleted', function () {
      $scope.disableActions = true;
      $scope.reloadingAppointment = true;
    });

    // #endregion

    //Add services from treatment plan

    $scope.addServices = function (transactions, useModal) {
      var servicesToAdd = [];
      var serviceObject = [];
      if (transactions.PlannedServices) {
        serviceObject = transactions.PlannedServices;
      } else {
        serviceObject = transactions;
      }

      _.forEach(serviceObject, function (transaction) {
        if (
          !transaction.ServiceTransactionId ||
          !ctrl.plannedServicesContains(transaction)
        ) {
          transaction.AppointmentId = $scope.activeAppointment.AppointmentId;
          transaction.LocationId = $scope.activeAppointment.LocationId;
          transaction.CreatedDate = transaction.CreatedDate
            ? transaction.CreatedDate
            : null;
          transaction.ServiceTransactionId = transaction.ServiceTransactionId
            ? transaction.ServiceTransactionId
            : null;
          transaction.EnteredByUserId = transaction.EnteredByUserId
            ? transaction.EnteredByUserId
            : null;
          transaction.ServiceTransactionStatusId = 7;
          servicesToAdd.push(transaction);
        } else {
          toastrFactory.error(
            localize.getLocalizedString(
              'Service already exists in this appointment.'
            ),
            localize.getLocalizedString('Error')
          );
        }
      });

      if (servicesToAdd.length > 0) {
        if (useModal) {
          $scope.modalAddService(servicesToAdd);
        } else {
          _.forEach(servicesToAdd, function (serv) {
            ctrl.addToQueue(serv);
          });
          ctrl.addQueue();
        }
      }
    };

    // #endregion

    //~~~~~~~~~~~~~~~Start tooth modal here~~~~~~~~~~~~~~~~~~~~~~~~~

    // favorite clicked
    $scope.modalAddService = function (serviceCode) {
      ctrl.servicesToAdd = [];
      if (_.isArray(serviceCode)) {
        ctrl.servicesToAdd = serviceCode;
        $scope.currentCode = ctrl.servicesToAdd[0];
        for (var i = 0; i < ctrl.servicesToAdd.length; i++) {
          ctrl.servicesToAdd[i].ServiceTransactionStatusId = 7;
        }
      } else {
        ctrl.servicesToAdd = [serviceCode];
        $scope.currentCode = serviceCode;
      }
      if (ctrl.servicesToAdd.length === 1) {
        $scope.SwiftCodesProgress = '';
        patientOdontogramFactory.setselectedChartButton(
          $scope.currentCode.ServiceCodeId
        );
        $scope.openToothCtrls(
          'Service',
          $scope.currentCode.Code,
          false,
          true,
          false
        );
      }
      if (ctrl.servicesToAdd.length > 1) {
        var firstCode = false;
        var lastCode = false;
        var index = 0;
        _.forEach(ctrl.servicesToAdd, function (serv) {
          serv.index = index;
          index++;
        });
        $scope.SwiftCodesProgress = localize.getLocalizedString(
          ' - ({0} of {1})',
          [1, ctrl.servicesToAdd.length]
        );
        firstCode = true;
        //if the service code meets all requirments, then we just add it and dont show modal
        patientOdontogramFactory.setselectedChartButton(
          $scope.currentCode.ServiceCodeId
        );
        var title = $scope.currentCode.Code + $scope.SwiftCodesProgress;
        $scope.openToothCtrls('Service', title, true, firstCode, lastCode);
      }
    };

    ctrl.closeWindow = function () {
      $scope.serviceWindow.close();
      if (ctrl.allServicesProcessed) {
        ctrl.addQueue();
      }
    };

    $scope.$on('close-tooth-window', function (e, cancelled) {
      // indicator that processing of services has been cancelled, save ones that have been processed
      ctrl.allServicesProcessed = cancelled;
      ctrl.closeWindow();
    });

    $scope.$watch('toothCtrlsOpen', function (nv) {
      if (nv === false) {
        ctrl.closeWindow();
      }
    });
    $scope.$rootScopeRegistrations.push(
      $rootScope.$on('retreaveCurrentCode', function () {
        $rootScope.$broadcast('currentCode', $scope.currentCode);
      })
    );

    $scope.$rootScopeRegistrations.push(
      $rootScope.$on('nextServiceCode', function () {
        var index;
        if ($scope.currentCode.index) {
          index = $scope.currentCode.index;
        } else {
          index = _.findIndex(ctrl.servicesToAdd, {
            ServiceCodeId: $scope.currentCode.ServiceCodeId,
          });
        }
        if (index > -1 && index !== ctrl.servicesToAdd.length - 1) {
          var firstCode = false;
          var lastindex = false;
          var nextIndex = index + 1;
          // indicator that not all of the servicesToAdd have been processed
          ctrl.allServicesProcessed = false;
          $scope.SwiftCodesProgress = localize.getLocalizedString(
            ' - ({0} of {1})',
            [nextIndex + 1, ctrl.servicesToAdd.length]
          );
          if (nextIndex >= ctrl.servicesToAdd.length - 1) lastindex = true;
          $scope.currentCode = ctrl.servicesToAdd[index + 1];
          patientOdontogramFactory.setselectedChartButton(
            $scope.currentCode.ServiceCodeId
          );
          var title = $scope.currentCode.Code + $scope.SwiftCodesProgress;
          //if it has all the fields required, do not show modal
          $scope.openToothCtrls('Service', title, true, firstCode, lastindex);
        } else {
          // indicates that this is the last of servicesToAdd to be processed
          // and that we can save the group
          ctrl.allServicesProcessed = true;
          ctrl.closeWindow();
        }
      })
    );

    $scope.editServiceModal = function (index, service) {
      if (service) {
        $scope.currentCode = service;
        ctrl.initializeToothControls(service, true);
      }
    };

    $scope.openToothCtrls = function (
      mode,
      title,
      isSwiftCode,
      firstCode,
      lastCode,
      editMode
    ) {
      var editing = editMode ? true : false;
      var passinfo = editing === false;
      var temptitle = '';
      if (editing) {
        temptitle = 'Edit ';
      } else {
        temptitle = 'Add ';
      }
      $scope.serviceWindow.content(
        '<proposed-service-create-update mode="' +
          _.escape(mode) +
          '" passinfo="' +
          _.escape(passinfo) +
          '" isswiftcode="' +
          _.escape(isSwiftCode) +
          '" isfirstcode="' +
          _.escape(firstCode) +
          '" islastcode="' +
          _.escape(lastCode) +
          '" isedit="' +
          _.escape(editing) +
          '" is-from-appointment-modal="' +
          true +
          '"></proposed-service-create-update>'
      );
      $scope.serviceWindow.setOptions({
        resizable: false,
        position: {
          top: '25%',
          left: '21.65%',
        },
        minWidth: 300,
        scrollable: false,
        iframe: false,
        actions: ['Close'],
        title: temptitle + mode + ' - ' + title,
        modal: true,
      });
      $scope.serviceWindow.open();
      //modalInstance.result.then($scope.serviceTransactionsUpdated);
    };

    // Set the tooth controls properties
    ctrl.initializeToothControls = function (serviceTransaction, editMode) {
      if (
        serviceTransaction.SwiftPickServiceCodes &&
        serviceTransaction.SwiftPickServiceCodes.length > 0
      ) {
        $scope.swiftPickSelected = serviceTransaction;
        var firstCode = false;
        var lastCode = false;
        if (serviceTransaction.SwiftPickServiceCodes.length !== 0) {
          $scope.SwiftCodesProgress = localize.getLocalizedString(
            ' - ({0} of {1})',
            [1, serviceTransaction.SwiftPickServiceCodes.length]
          );
          firstCode = true;
          if (serviceTransaction.SwiftPickServiceCodes.length === 1)
            lastCode = true;
          patientOdontogramFactory.setselectedChartButton(
            serviceTransaction.SwiftPickServiceCodes[0].ServiceCodeId
          );
          patientOdontogramFactory.setSelectedSwiftPickCode(
            serviceTransaction.SwiftPickServiceCodes[0].SwiftPickServiceCodeId
          );
          var title =
            serviceTransaction.SwiftPickServiceCodes[0].Code +
            $scope.SwiftCodesProgress;
          $scope.openToothCtrls(
            'Service',
            title,
            true,
            firstCode,
            lastCode,
            editMode
          );
        }
      } else {
        patientOdontogramFactory.setselectedChartButton(
          serviceTransaction.ServiceCodeId
        );

        patientServicesFactory.setActiveServiceTransactionId(
          serviceTransaction.ServiceTransactionId
        );
        // Open kendo window to add service
        var windowTitle = serviceTransaction.CdtCodeName
          ? serviceTransaction.CdtCodeName
          : serviceTransaction.Code;
        $scope.openToothCtrls(
          'Service',
          windowTitle,
          false,
          true,
          false,
          editMode
        );
      }
    };
    ctrl.queueToAdd = [];
    ctrl.addToQueue = function (service) {
      if (service) {
        if (_.isArray(service)) {
          _.forEach(service, function (serv) {
            //This will add the InsuranceOrder Property with the correct insurunce order number
            //We use this to order the $scope.activeAppointment.PlannedServices on the appointment to keep track of the order in which the
            //services were added
            serv.InsuranceOrder = appointmentServiceTransactionsService.setNextInsuranceOrderForPlannedService(
              $scope.activeAppointment.PlannedServices
            );
            ctrl.queueToAdd.push(serv);
          });
        } else {
          //This will add the InsuranceOrder Property with the correct insurunce order number
          //We use this to order the $scope.activeAppointment.PlannedServices on the appointment to keep track of the order in which the
          //services were added
          service.InsuranceOrder = appointmentServiceTransactionsService.setNextInsuranceOrderForPlannedService(
            $scope.activeAppointment.PlannedServices
          );
          ctrl.queueToAdd.push(service);
        }
      }
    };
    ctrl.addQueue = function () {
      var tempList = [];
      if (ctrl.queueToAdd.length > 0) {
        tempList = _.cloneDeep(ctrl.queueToAdd);
        ctrl.queueToAdd = [];
        ctrl.addToPlannedServices(tempList);
      }
    };
    $scope.$rootScopeRegistrations.push(
      $rootScope.$on('updatedServicesToAdd', function (event, services) {
        ctrl.addToQueue(services);
      })
    );

    //~~~~~~~~~~~~~~~End Tooth Modal Here~~~~~~~~~~~~~~~~~~~~~~~~~~~

    //#region add services process

    // pass state to service directives
    $scope.preventiveDate = { dueDate: '' };
    $scope.dataLoadingProposed = { loading: false };
    $scope.dataLoadingTreatment = { loading: false };
    $scope.dataLoadingPreventive = { loading: false };
    $scope.dataLoadingNewService = { loading: false };

    //#engregion

    //#region flyout functions

    $scope.showProposedFlyout = function () {
      $rootScope.$broadcast('closeFlyouts');
      $rootScope.$broadcast('openProposedSelectorFlyout');
    };
    $scope.showTxPlansFlyout = function () {
      $rootScope.$broadcast('closeFlyouts');
      $rootScope.$broadcast('openTreatmentPlanFlyout');
    };
    $scope.showPreventiveFlyout = function () {
      $rootScope.$broadcast('closeFlyouts');
      $rootScope.$broadcast('openPreventiveCareFlyout');
    };
    $scope.showServiceFlyout = function () {
      $rootScope.$broadcast('closeFlyouts');
      $rootScope.$broadcast('openNewServicesFlyout');
    };

    //#engregion

    //#region providers on plannedServices

      ctrl.loadServiceCodeInfoToServices = function (service) {
          var serviceCode = _.find($scope.serviceCodes, {
              ServiceCodeId: service.ServiceCodeId,
          });
          if (!_.isNil(serviceCode)) {
              service.AffectedAreaId = serviceCode.AffectedAreaId;
              service.Area = serviceCode.Area;
              service.Code = serviceCode.Code;
              service.CdtCodeName = serviceCode.CdtCodeName;
              service.$$Description = serviceCode.Description;
              service.DisplayAs = serviceCode.DisplayAs;
              service.ObjectState = saveStates.Update;
              service.UsuallyPerformedByProviderTypeId = serviceCode.UsuallyPerformedByProviderTypeId;
          }
      };

    ctrl.loadProviderToServices = function (service) {
      if (service && service.ProviderUserId) {
        var provider = listHelper.findItemByFieldValue(
          ctrl.providers,
          'UserId',
          service.ProviderUserId
        );
        service.$$Provider = provider ? provider : null;
        service.ProviderCode = provider.UserCode;
      }
    };

    ctrl.loadProviderOnClaimsToServices = function (service) {
      //If POC is not already set, load in the default POC. Otherwise leave it alone
      if (
        !service.ProviderOnClaimsId ||
        service.ProviderOnClaimsId === '00000000-0000-0000-0000-000000000000'
      ) {
        providerOnClaimsFactory.setProviderOnClaimsForService(
          service,
          ctrl.providers
        );
      }

      if (
        service &&
        service.ProviderOnClaimsId &&
        service.ProviderOnClaimsId != '00000000-0000-0000-0000-000000000000'
      ) {
        var provider = listHelper.findItemByFieldValue(
          ctrl.providers,
          'UserId',
          service.ProviderOnClaimsId
        );
        service.ProviderOnClaimsCode = provider.UserCode;
      }
    };

    //#endregion

    //Refresh the appointment when performing CRUD operations
    $scope.refreshAppointment = function () {
      patientAppointmentsFactory
        .AppointmentDataWithDetails($scope.activeAppointment.AppointmentId)
        .then(function (res) {
          if (res && res.Value) {
            if ($scope.noteData.original == $scope.noteData.current)
              $scope.noteData.current = $scope.noteData.original =
                res.Value.Appointment.Note;
            if (res.Value.Appointment.Status !== 4) {
              $scope.activeAppointment.ActualEndTime =
                res.Value.Appointment.ActualEndTime;
              $scope.activeAppointment.ActualStartTime =
                res.Value.Appointment.ActualStartTime;
              $scope.finishAppointment();
            } else {
              $scope.activeAppointment = res.Value.Appointment;
              $scope.finishAppointment();
            }
          }
        });
    };

    $scope.openAppointmentModal = function () {
      var loggedInLocation = JSON.parse(sessionStorage.getItem('userLocation'));

      var appt = {
        AppointmentId: null,
        AppointmentTypeId: null,
        Classification: 2,
        PersonId: $scope.patientInfo.PatientId,
        ProposedDuration: 15,
        LocationId: loggedInLocation.id,
      };

      appointmentViewDataLoadingService.getViewData(appt, false).then(
        function (res) {
          appointmentViewVisibleService.changeAppointmentViewVisible(
            true,
            false
              );
              $rootScope.$broadcast('appointment:end-appointment');
        },
        function (error) {
          console.log(error);
          toastrFactory.error(
            'Ran into a problem loading the appointment',
            'Error'
            );
            $rootScope.$broadcast('appointment:end-appointment');
        }
      );
    };

    $scope.$watchCollection('activeAppointment.PlannedServices', function () {
      if (
        $scope.activeAppointment &&
        $scope.activeAppointment.PlannedServices
      ) {
        $scope.plannedServiceIds = $scope.activeAppointment.PlannedServices.map(
          function (value) {
            return value.ServiceTransactionId;
          }
        );
      }
    });

    //#region Add Azure SignalR
    serverlessSignalrHubConnectionService.init();
    var defer = $q.defer();
    var promise = defer.promise;
    $scope.unsubscribeToServerlessSignalrHubConnectionService = serverlessSignalrHubConnectionService
      .signalRObservable()
      .subscribe({
        next: messages => {
          //This needs to reserached why it's coming as ApplicationProperties or applicationProperties
          let appProperties = messages.applicationProperties;
          if (!_.isNil(messages.ApplicationProperties)) {
            appProperties = messages.ApplicationProperties;
          }
          let appointmentId = appProperties.EntityId;
          if (appProperties.MessageType !== 'AppointmentDeletedMessage') {
            scheduleAppointmentHttpService
              .getAppointmentModalAndPatientByAppointmentId(appointmentId)
              .then(
                function (res) {
                  //This is a scheduled appointment
                  if (res.Classification === 0) {
                    if (
                      appProperties.MessageType === 'AppointmentUpdatedMessage'
                    ) {
                      res.change = 'update';
                      ctrl.hubApptChanged(res);
                    }
                  }

                  defer.resolve(res);
                },
                function () {
                  defer.reject();
                }
              );

            return promise;
          } //end if
        }, //next
        error: error => {
          console.log(error);
        },
      }); //subscribe

    ctrl.hubApptChanged = function (appointment) {
      //debugger;
      if (
        $scope.activeAppointment &&
        $scope.activeAppointment.AppointmentId === appointment.AppointmentId
      ) {
        // appt was updated
        if (
          appointment.change === 'update' ||
          appointment.change === 'finish'
        ) {
          $scope.updateAppointmentFlag = false;
          if (appointment.change === 'update') {
            $scope.disableActions = true;
            $scope.updateAppointmentFlag = true;
          }

          let params = {
            appointmentId: appointment.AppointmentId,
            FillAppointmentType: true,
            FillLocation: true,
            FillPerson: true,
            FillProviders: true,
            FillRoom: true,
            FillProviderUsers: true,
            FillServices: true,
            FillServiceCodes: true,
            FillPhone: true,
            IncludeCompletedServices: true,
          };

          patientServices.PatientAppointment.GetWithDetails(
            params
          ).$promise.then(
            function (res) {
              $timeout(function () {
                let updatedAppointment = res.Value.Appointment;

                $scope.updateAppointmentProperties(
                  updatedAppointment,
                  $scope.updateAppointmentFlag
                );
              });
            },
            function () {
              toastrFactory.error(
                localize.getLocalizedString(
                  'Failed to retrieve appointment, please reload the page.',
                  'Error'
                )
              );
            }
          );
        }
      }
      $scope.disableActions = false;
    };

    //#endregion End Azure SignalR

    ctrl.getPersonOverview = function () {
      $scope.patient = {};
      personFactory.Overview($scope.patientInfo.PatientId).then(function (res) {
        if (res.Value) {
          $scope.patient = res.Value.Profile;
        }
      });
    };

    ctrl.getPersonOverview();

    $scope.openEditPersonalModal = function () {
      var patientInfo = {
        Profile: $scope.patientInfo,
      };
      modalFactory.PersonalModal(patientInfo, AmfaKeys.SoarPerPerdemModify);
    };

    //Reset appointment properties when the appointment is updated via signal R
    $scope.updateAppointmentProperties = function (updatedAppointment, update) {
      if (update && $scope.activeAppointment) {
        ctrl.getPlannedServiceCodes(updatedAppointment);
        // need to update the whole object otherwise you can overwrite various properties on save
        // previously we were just updating part of the object masking a problem
        $scope.activeAppointment = updatedAppointment;
        ctrl.closeWindow();
      }
      $scope.disableActions = false;
    };

    // set controller properties and functions to null
    // this removes restartHub method that restarts hubconnection
    //ctrl.setCtrlPropertiesNull=function(){
    //    for (var ctrlItem in ctrl) {
    //        if (ctrlItem && ctrl.hasOwnProperty(ctrlItem)) {
    //            ctrl[ctrlItem] = null;
    //        }
    //    }
    //};

    // on destroy of controller stop the hubconnection for signalr
    ctrl.onControllerDestruction = function () {
      //if (!_.isUndefined(ctrl.hubProxy) && !_.isUndefined(ctrl.hubConnection)) {
      //    ctrl.stopHub();
      //    ctrl.setCtrlPropertiesNull();
      //}

      if ($scope.unsubscribeToServerlessSignalrHubConnectionService) {
        //Kills the subscribe
        $scope.unsubscribeToServerlessSignalrHubConnectionService.unsubscribe();
      }
    };

    // Success callback to handle the action of updating a proposed service
    ctrl.onUpdateServiceSuccess = function () {
      $scope.reloadingAppointment = true;
      $rootScope.$broadcast(
        'appointment:update-appointment',
        ctrl.appointmentCrud.Data
      );
      // Updating chart-ledger services
      $rootScope.$broadcast('soar:chart-services-reload-ledger');
    };

    // Error callback to handle the failed action of updating a proposed service
    ctrl.onUpdateServiceFailure = function () {
      toastrFactory.error(
        localize.getLocalizedString(
          'An error occurred while updating a {0} from appointment.',
          ['proposed service']
        ),
        localize.getLocalizedString('Error')
      );
      $scope.disableActions = false;
    };

    $scope.onProviderOnClaimsOnChange = function (selectedProviderOnClaimsId) {
      $scope.selectedGlobalProviderId = selectedProviderOnClaimsId;

      if (
        $scope.activeAppointment.PlannedServices &&
        $scope.activeAppointment.PlannedServices.length > 0
      ) {
        $scope.disableActions = true;

        _.forEach($scope.activeAppointment.PlannedServices, function (service) {
          service.ProviderOnClaimsId = selectedProviderOnClaimsId;
          service.ObjectState = saveStates.Update;
        });

        ctrl.appointmentCrud.Data = $scope.activeAppointment;
        ctrl.appointmentCrud.AfterSaveSuccess = ctrl.onUpdateServiceSuccess;
        ctrl.appointmentCrud.AfterSaveError = ctrl.onUpdateServiceFailure;
        ctrl.appointmentCrud.Save();
      }
      };

    $rootScope.$on('reloadProposedServices', function (event, services) {
        services.forEach((y) => {
            ctrl.loadServiceCodeInfoToServices(y);
            ctrl.loadProviderToServices(y);
            ctrl.loadProviderOnClaimsToServices(y);
        });
    });

    $scope.$on('$destroy', ctrl.onControllerDestruction);
  }

  ActiveAppointmentController.prototype = Object.create(BaseCtrl.prototype);
})();
