'use strict';

angular.module('Soar.Patient').controller('TreatmentPlansLandingController', [
  '$scope',
  'ListHelper',
  'patSecurityService',
  'toastrFactory',
  'PatientServices',
  'localize',
  'TreatmentPlansFactory',
  'ScheduleServices',
  '$q',
  function (
    $scope,
    listHelper,
    patSecurityService,
    toastrFactory,
    patientServices,
    localize,
    treatmentPlansFactory,
    scheduleServices,
    $q
  ) {
    var ctrl = this;

    // everything that needs instantiated or called when controller loads
    ctrl.init = function () {
      // Check view access for time-line items
      ctrl.authAccess();
      if (
        treatmentPlansFactory.NewTreatmentPlan &&
        treatmentPlansFactory.NewTreatmentPlan.TreatmentPlanId == null
      ) {
        $scope.newTreatmentPlan = treatmentPlansFactory.NewTreatmentPlan;
      } else {
        $scope.newTreatmentPlan = treatmentPlansFactory.SetNewTreatmentPlan(
          null
        );
      }

      $scope.formIsValid = true;
      ctrl.loadAppointments();
    };

    // listening for changes to ActiveTreatmentPlan
    $scope.$watch(
      function () {
        return treatmentPlansFactory.ActiveTreatmentPlan;
      },
      function (nv, ov) {
        if (nv && nv !== ov) {
          ctrl.activeTreatmentPlan = nv;
          if (
            ctrl.activeTreatmentPlan !== null &&
            !ctrl.activeTreatmentPlan.TreatmentPlanHeader.CollapsedViewVisible
          ) {
            $scope.viewSettings.expandView = true;
            $scope.viewSettings.activeExpand = 2;
            $scope.viewSettings.txPlanActiveId =
              ctrl.activeTreatmentPlan.TreatmentPlanHeader.TreatmentPlanId;
          }
        }

        //This loops through the tx plan in the tx plan drawer using ExistingTreatmentPlans and if any of the service transactions
        //are on another treatment plan for the patient, we update those tx plans here so they reflect properly in the tx plan drawer
        if (nv !== null) {
          angular.forEach(
            treatmentPlansFactory.ExistingTreatmentPlans,
            function (existingTreatmentPlan, key) {
              angular.forEach(
                existingTreatmentPlan.TreatmentPlanServices,
                function (txPlanServices, key) {
                  angular.forEach(
                    nv.TreatmentPlanServices,
                    function (nvTxPlanServices, key) {
                      if (
                        nvTxPlanServices.ServiceTransaction
                          .ServiceTransactionId ===
                        txPlanServices.ServiceTransaction.ServiceTransactionId
                      ) {
                        txPlanServices.ServiceTransaction =
                          nvTxPlanServices.ServiceTransaction;
                      }
                    }
                  );
                }
              );
            }
          );
        }
      }
    );

    // listening for changes to ExistingTreatmentPlans
    $scope.$watch(
      function () {
        return treatmentPlansFactory.ExistingTreatmentPlans;
      },
      function (nv) {
        // evaluate $fuseUtil.diff on nv and ov to figure out what is calling this and what is changing.
        // trying to prevent another patient's plans from showing up until new patient's plans have loaded
        if (
          nv &&
          nv.length > 0 &&
          nv[0].TreatmentPlanHeader.PersonId !== $scope.personId
        ) {
          $scope.existingTreatmentPlans = [];
        } else {
          if (nv && nv !== $scope.existingTreatmentPlans) {
            $scope.existingTreatmentPlans = nv;
          }
        }
      },
      true
    );

    // listening for changes to NewTreatmentPlan
    $scope.$watch(
      function () {
        return treatmentPlansFactory.NewTreatmentPlan;
      },
      function (nv) {
        $scope.newTreatmentPlan = nv;
        if (!_.isNil(nv)) {
          $scope.viewSettings.expandView = true;
          $scope.viewSettings.activeExpand = 2;
        }
      }
    );

    // listening for changes to TreatmentPlanCopy
    $scope.$watch(
      function () {
        return treatmentPlansFactory.TreatmentPlanCopy;
      },
      function (nv) {
        if (nv === null && $scope.newTreatmentPlan === null) {
          $scope.viewSettings.expandView = false;
          $scope.viewSettings.txPlanActiveId = null;
        }
      }
    );

    // listening for changes to ExistingTreatmentPlans
    $scope.$watch(
      function () {
        return treatmentPlansFactory.DataChanged;
      },
      function (nv) {
        $scope.$parent.$parent.$parent.$parent.dataHasChanged = nv;
      }
    );

    $scope.clearIfDefault = function () {
      if (
        $scope.newTreatmentPlan.TreatmentPlanHeader.TreatmentPlanName ===
        'Treatment Plan'
      ) {
        $scope.newTreatmentPlan.TreatmentPlanHeader.TreatmentPlanName = '';
      }
    };

    //#region authorization

    $scope.treatmentPlanViewAmfa = 'soar-clin-cplan-view';
    $scope.treatmentPlanCreateAmfa = 'soar-clin-cplan-add';
    $scope.treatmentPlanAddServiceAmfa = 'soar-clin-cplan-asvccd';
    $scope.clinicalAppointmentsViewAmfa = 'soar-sch-sptapt-view';

    ctrl.authTreatmentPlanViewAccess = function () {
      return patSecurityService.IsAuthorizedByAbbreviation(
        $scope.treatmentPlanViewAmfa
      );
    };

    ctrl.authTreatmentPlanCreateAccess = function () {
      return patSecurityService.IsAuthorizedByAbbreviation(
        $scope.treatmentPlanCreateAmfa
      );
    };

    ctrl.authTreatmentPlanAddServiceAccess = function () {
      return patSecurityService.IsAuthorizedByAbbreviation(
        $scope.treatmentPlanAddServiceAmfa
      );
    };

    ctrl.authViewAccessToPatientAppointments = function () {
      return patSecurityService.IsAuthorizedByAbbreviation(
        $scope.clinicalAppointmentsViewAmfa
      );
    };

    ctrl.authAccess = function () {
      if (ctrl.authTreatmentPlanViewAccess()) {
        $scope.hasTreatmentPlanViewAccess = true;
      }
      if (ctrl.authTreatmentPlanCreateAccess()) {
        $scope.hasTreatmentPlanCreateAccess = true;
      }
      if (ctrl.authTreatmentPlanAddServiceAccess()) {
        $scope.hasTreatmentPlanAddServiceAccess = true;
      }
      if (ctrl.authViewAccessToPatientAppointments()) {
        $scope.hasClinicalAppointmentViewAccess = true;
      }
    };

    //#endregion

    //#region treatment plan creation

    // listening for changes to NewPlannedService, creating a new treatment plan as soon as we get one
    $scope.$watch(
      function () {
        return treatmentPlansFactory.NewPlannedService;
      },
      function (nv) {
        if (nv) {
          // tp hasnt been created yet
          if ($scope.newTreatmentPlan) {
            var proposedServicesList = [];
            if (treatmentPlansFactory.SavingPlan === false) {
              proposedServicesList.push(nv);
              treatmentPlansFactory.Create(
                proposedServicesList,
                $scope.personId
              );
            }
            treatmentPlansFactory.SavingPlan = true;
          }
          // tp has already been created with one service
          else if (!treatmentPlansFactory.AddingService) {
            var servicesToProcess = angular.isArray(nv) ? nv : [nv];
            var servicesToAdd = [];
            treatmentPlansFactory.AddingService = true;
            // making sure that we do not allow users to add the same proposed service to a treatment plan more than once
            angular.forEach(servicesToProcess, function (service) {
              var psAlreadyAddedToTreatmentPlan = false;
              angular.forEach(
                ctrl.activeTreatmentPlan.TreatmentPlanServices,
                function (tps) {
                  if (
                    !psAlreadyAddedToTreatmentPlan &&
                    tps.TreatmentPlanServiceHeader.ServiceTransactionId ===
                      nv.ServiceTransactionId
                  ) {
                    psAlreadyAddedToTreatmentPlan = true;
                  }
                }
              );

              if (!psAlreadyAddedToTreatmentPlan) {
                servicesToAdd.push(service);
              }
            });

            if (servicesToAdd.length > 0) {
              ctrl.addServicesToTreatmentPlan(servicesToAdd);
            } else {
              treatmentPlansFactory.AddingService = false;
            }
          }
        }
        treatmentPlansFactory.NewPlannedService = null;
      }
    );

    // used to get the creation process started, not really saving yet
    $scope.createTreatmentPlan = function () {
      if ($scope.hasTreatmentPlanCreateAccess) {
        treatmentPlansFactory.SetDataChanged(true);
        treatmentPlansFactory.SetActiveTreatmentPlan(null);
        treatmentPlansFactory.CollapseAll();
        $scope.formIsValid = true;
        treatmentPlansFactory.SetNewTreatmentPlan(
          treatmentPlansFactory.BuildTreatmentPlanDto(null, $scope.personId)
        );
        $scope.viewSettings.expandView = true;
        $scope.viewSettings.activeExpand = 2;
        $scope.viewSettings.txPlanActiveId = null;
      }
    };

    //#endregion

    //#region add service to treatment plan

    // success callback for add service
    ctrl.addServiceSuccess = function (res) {
      treatmentPlansFactory.AddingService = false;
      if (res && res.Value && res.Value.length > 0) {
        var serviceTransactions = [];
        angular.forEach(res.Value, function (resService) {
          var dtoTemp = listHelper.findItemByPredicate(
            ctrl.treatmentPlanServiceDtosTemp,
            function (item) {
              return (
                item.ServiceTransaction.ServiceTransactionId ==
                resService.ServiceTransaction.ServiceTransactionId
              );
            }
          );
          resService.ServiceTransaction.UserCode =
            dtoTemp.ServiceTransaction.UserCode;
          if (!resService.ServiceTransaction.InsuranceEstimates) {
            resService.ServiceTransaction.InsuranceEstimates = [{}];
          }
          if (dtoTemp.InsuranceEstimates && dtoTemp.InsuranceEstimates[0]) {
            resService.ServiceTransaction.InsuranceEstimates[0].CalculationDescription =
              dtoTemp.InsuranceEstimates[0].CalculationDescription;
          }
          ctrl.activeTreatmentPlan.TreatmentPlanServices.push(resService);
          serviceTransactions.push(resService.ServiceTransaction);
        });

        ctrl.activeTreatmentPlan.TreatmentPlanHeader.DaysAgo = treatmentPlansFactory.GetDaysAgo(
          ctrl.activeTreatmentPlan.TreatmentPlanHeader
        );
        ctrl.activeTreatmentPlan.TreatmentPlanHeader.TotalFees = treatmentPlansFactory.GetTotalFees(
          ctrl.activeTreatmentPlan
        );
        // recalculate patient portion when service added
        treatmentPlansFactory.PatientPortion(ctrl.activeTreatmentPlan);
        treatmentPlansFactory.SetActiveTreatmentPlan(ctrl.activeTreatmentPlan);

        // refresh services using tpf.RefreshTPSs
        if (serviceTransactions.length > 0) {
          treatmentPlansFactory.RefreshTreatmentPlanServices(
            serviceTransactions
          );
        }

        var index = -1;
        _.forEach($scope.existingTreatmentPlans, function (tp, $index) {
          if (
            tp.TreatmentPlanHeader.TreatmentPlanId ===
            ctrl.activeTreatmentPlan.TreatmentPlanHeader.TreatmentPlanId
          ) {
            index = $index;
          }
        });
        if (index !== -1) {
          $scope.existingTreatmentPlans[index] = ctrl.activeTreatmentPlan;
        }
        toastrFactory.success(
          localize.getLocalizedString('The {0} has been added to your {1}', [
            'proposed service',
            'treatment plan',
          ]),
          localize.getLocalizedString('Success')
        );
      }
    };

    // failure callback for add service
    ctrl.addServiceFailure = function () {
      treatmentPlansFactory.AddingService = false;
    };

    // call the add service API
    ctrl.addServicesToTreatmentPlan = function (ps) {
      // calculate and set the next priority number for service
      var nextPriorityNumber = ctrl.getNextPriorityNumber();
      if ($scope.hasTreatmentPlanAddServiceAccess) {
        var params = {};
        params.Id = ctrl.activeTreatmentPlan.TreatmentPlanHeader.PersonId;
        params.TreatmentPlanId =
          ctrl.activeTreatmentPlan.TreatmentPlanHeader.TreatmentPlanId;
        ctrl.treatmentPlanServiceDtosTemp = [];
        angular.forEach(ps, function (service) {
          var dto = treatmentPlansFactory.BuildTreatmentPlanServiceDto(
            service,
            $scope.personId
          );
          dto.TreatmentPlanServiceHeader.TreatmentPlanId =
            ctrl.activeTreatmentPlan.TreatmentPlanHeader.TreatmentPlanId;
          dto.TreatmentPlanServiceHeader.TreatmentPlanGroupNumber =
            treatmentPlansFactory.StageSelectedToMove;
          dto.TreatmentPlanServiceHeader.Priority = _.clone(nextPriorityNumber);
          ctrl.treatmentPlanServiceDtosTemp.push(dto);
          nextPriorityNumber++;
        });
        patientServices.TreatmentPlans.addServices(
          params,
          ctrl.treatmentPlanServiceDtosTemp,
          ctrl.addServiceSuccess,
          ctrl.addServiceFailure
        );
      }
    };

    //#endregion

    //#region treatment plan headers expand/edit

    // edit plan
    $scope.expandPlan = function () {
      $scope.viewSettings.expandView = !$scope.viewSettings.expandView;
      $scope.viewSettings.activeExpand = $scope.viewSettings.expandView ? 2 : 0;
    };

    $scope.$on(
      'soar:tx-plan-services-changed',
      function (event, svc, reloadAll) {
        if (reloadAll) {
          treatmentPlansFactory.GetAllHeaders($scope.personId, true);
        }
      }
    );

    //#endregion

    // Initialize prerequisites for displaying patient appointments
    ctrl.loadAppointments = function () {
      if ($scope.hasClinicalAppointmentViewAccess) {
        var dependentServices = [ctrl.retrieveAppointment()];

        // After fetching practice service codes and  appointment types, appointments and providers
        $q.all(dependentServices).then(
          ctrl.fetchAppointmentRecordsOnSuccess,
          ctrl.fetchAppointmentRecordsOnError
        );
      }
    };

    // Success callback of Get all appointment
    ctrl.appointmentRetrievalSuccess = function (result) {
      var appointments = [];
      angular.forEach(result.Value, function (appointment) {
        appointments.push(appointment.Appointment);
      });
      treatmentPlansFactory.SetPatientAppointments(appointments);
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

    // Get all appointments for patient
    ctrl.retrieveAppointment = function () {
      var params = {
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
      var promise = scheduleServices.Lists.Appointments.GetAllWithDetails(
        params
      ).$promise.then(
        ctrl.appointmentRetrievalSuccess,
        ctrl.appointmentRetrievalFailed
      );

      return promise;
    };

    $scope.sortOrder = '-TreatmentPlanHeader.CreatedDate';
    $scope.changeSorting = function () {
      $scope.sortOrder =
        $scope.sortOrder === '-TreatmentPlanHeader.CreatedDate'
          ? 'TreatmentPlanHeader.CreatedDate'
          : '-TreatmentPlanHeader.CreatedDate';
    };

    // get next available Priority for this treatment plan
    ctrl.getNextPriorityNumber = function () {
      var nextPriorityNumber = 1;
      if (
        ctrl.activeTreatmentPlan &&
        !_.isEmpty(ctrl.activeTreatmentPlan.TreatmentPlanServices)
      ) {
        var lastTreatmentPlanService = _.maxBy(
          ctrl.activeTreatmentPlan.TreatmentPlanServices,
          function (tps) {
            return tps.TreatmentPlanServiceHeader.Priority;
          }
        );
        nextPriorityNumber =
          lastTreatmentPlanService.TreatmentPlanServiceHeader.Priority + 1;
      }
      return nextPriorityNumber;
    };

    // calling init function
    ctrl.init();
  },
]);
