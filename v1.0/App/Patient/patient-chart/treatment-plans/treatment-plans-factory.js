(function () {
  'use strict';

  angular
    .module('Soar.Patient')
    .factory('TreatmentPlansFactory', TreatmentPlansFactory);
  TreatmentPlansFactory.$inject = [
    '$rootScope',
    'PatientServices',
    '$filter',
    'localize',
    '$q',
    'toastrFactory',
    '$timeout',
    'patSecurityService',
    'UsersFactory',
    'ListHelper',
    'FinancialService',
    'SaveStates',
    'locationService',
    'ScheduleServices',
    'PatCacheFactory',
    'AmfaKeys',
    'NewTreatmentPlansService',
    'FeatureService',
    'TreatmentPlanHttpService',
  ];
  function TreatmentPlansFactory(
    $rootScope,
    patientServices,
    $filter,
    localize,
    $q,
    toastrFactory,
    $timeout,
    patSecurityService,
    usersFactory,
    listHelper,
    financialService,
    saveStates,
    locationService,
    scheduleServices,
    patCacheFactory,
    AmfaKeys,
    treatmentPlansService,
    featureService,
    treatmentPlanHttpService
  ) {
    var factory = this;
    // maintains a list of dependents
    factory.existingTreatmentPlansObserversForTimeline = [];
    factory.activeTreatmentPlanObservers = [];
    factory.activeTreatmentPlanServicesObservers = [];
    factory.predetermationListObservers = [];

    factory.defaultPlanName = 'Treatment Plan';

    //#region authorization

    factory.treatmentPlanViewAmfa = 'soar-clin-cplan-view';
    factory.treatmentPlanEditAmfa = 'soar-clin-cplan-edit';
    factory.treatmentPlanDeleteAmfa = 'soar-clin-cplan-delete';
    factory.treatmentPlanCreateAmfa = 'soar-clin-cplan-add';
    factory.treatmentPlanAddServiceAmfa = 'soar-clin-cplan-asvccd';
    factory.treatmentPlanDeleteServiceAmfa = 'soar-clin-cplan-dsvccd';
    factory.isEstInsFlagInitialized = false;
    factory.isEstInsFlagEnabled = false;

    // NOTE, when pred amfas are in place replace this.
    factory.predeterminationCreateAmfa = 'soar-ins-iclaim-add';

    factory.authTreatmentPlanViewAccess = function () {
      return patSecurityService.IsAuthorizedByAbbreviation(
        factory.treatmentPlanViewAmfa
      );
    };

    factory.authTreatmentPlanEditAccess = function () {
      return patSecurityService.IsAuthorizedByAbbreviation(
        factory.treatmentPlanEditAmfa
      );
    };

    factory.authTreatmentPlanDeleteAccess = function () {
      return patSecurityService.IsAuthorizedByAbbreviation(
        factory.treatmentPlanDeleteAmfa
      );
    };

    factory.authTreatmentPlanCreateAccess = function () {
      return patSecurityService.IsAuthorizedByAbbreviation(
        factory.treatmentPlanCreateAmfa
      );
    };

    factory.authTreatmentPlanAddServiceAccess = function () {
      return patSecurityService.IsAuthorizedByAbbreviation(
        factory.treatmentPlanAddServiceAmfa
      );
    };

    factory.authTreatmentPlanDeleteServiceAccess = function () {
      return patSecurityService.IsAuthorizedByAbbreviation(
        factory.treatmentPlanDeleteServiceAmfa
      );
    };

    factory.authPredeterminationCreateAccess = function () {
      return patSecurityService.IsAuthorizedByAbbreviation(
        factory.predeterminationCreateAmfa
      );
    };

    factory.authAccess = function () {
      if (factory.authTreatmentPlanViewAccess()) {
        factory.hasTreatmentPlanViewAccess = true;
      }
      if (factory.authTreatmentPlanEditAccess()) {
        factory.hasTreatmentPlanEditAccess = true;
      }
      if (factory.authTreatmentPlanDeleteAccess()) {
        factory.hasTreatmentPlanDeleteAccess = true;
      }
      if (factory.authTreatmentPlanCreateAccess()) {
        factory.hasTreatmentPlanCreateAccess = true;
      }
      if (factory.authTreatmentPlanAddServiceAccess()) {
        factory.hasTreatmentPlanAddServiceAccess = true;
      }
      if (factory.authTreatmentPlanDeleteServiceAccess()) {
        factory.hasTreatmentPlanDeleteServiceAccess = true;
      }
      if (factory.authPredeterminationCreateAccess()) {
        factory.hasPredeterminationCreateAccess = true;
      }
    };

    factory.authAccess();

    //#endregion

    //#region utility methods

    // helper for building new treatment plan header DTOs
    factory.buildDefaultTreatmentPlanHeaderDto = function (personId) {
      return {
        TreatmentPlanId: null,
        PersonId: personId,
        Status: 'Proposed',
        TreatmentPlanName: factory.defaultPlanName,
        TreatmentPlanDescription: null,
        RejectedReason: null,
        SortSettings: null,
        DaysAgo: 0,
        Note: null,
      };
    };

    // helper for building treatment plan DTOs
    factory.buildTreatmentPlanDto = function (tph, personId) {
      return {
        TreatmentPlanHeader: tph
          ? tph
          : factory.buildDefaultTreatmentPlanHeaderDto(personId),
        TreatmentPlanServices: [],
      };
    };

    // helper for building new treatment plan service header DTOs
    factory.buildTreatmentPlanServiceHeaderDto = function (
      serviceTransactionId,
      personId,
      stage
    ) {
      if (stage === undefined || stage === null) {
        stage = 1;
      } else if (typeof stage === 'string') {
        stage = parseInt(stage, 10);
      }
      return {
        TreatmentPlanServiceId: null,
        PersonId: personId,
        Priority: null,
        TreatmentPlanId: null,
        TreatmentPlanGroupNumber: stage,
        EstimatedInsurance: 0,
        PatientPortion: 0,
        ServiceTransactionId: serviceTransactionId,
      };
    };

    // helper for building new treatment plan service DTOs
    factory.buildTreatmentPlanServiceDto = function (ps, personId, stage) {
      return {
        TreatmentPlanServiceHeader: factory.buildTreatmentPlanServiceHeaderDto(
          ps.ServiceTransactionId,
          personId,
          stage
        ),
        ServiceTransaction: ps,
      };
    };

    factory.checkForAsscociatedTxPlans = function (serviceCodes) {
      var defer = $q.defer();
      var promise = defer.promise;
      patientServices.TreatmentPlanFlags.save(serviceCodes).$promise.then(
        function (res) {
          promise = $.extend(promise, {
            values: res.Value,
          });
          defer.resolve(res);
        },
        function () {}
      );
      return promise;
    };

    // used to display how many days ago the tp was created
    factory.getDaysAgo = function (tph) {
      var today = new Date();
      var createdDate = new Date(tph.CreatedDate);
      return Math.round((today - createdDate) / (1000 * 60 * 60 * 24));
    };

    // adding up total fees for all services
    factory.getTotalFees = function (tp) {
      var totalFees = _.sumBy(tp.TreatmentPlanServices, function (tps) {
        return !_.isEmpty(tps.ServiceTransaction)
          ? tps.ServiceTransaction.Fee
          : 0;
      });

      return totalFees;
    };

    // getting services of each stage
    factory.getstageServices = function (stage, tps) {
      var stageServices = _.filter(tps, function (service) {
        return (
          service.TreatmentPlanServiceHeader.TreatmentPlanGroupNumber ===
          stage.stageno
        );
      });

      return stageServices;
    };

    // refresh services with appointment info / service-fee-rollback
    factory.refreshTreatmentPlanServices = function (
      existingPlans,
      modifiedServices
    ) {
      // get matching plan
      _.forEach(existingPlans, function (tp) {
        // update services
        _.forEach(tp.TreatmentPlanServices, function (tps) {
          var item = _.find(modifiedServices, {
            ServiceTransactionId: tps.ServiceTransaction.ServiceTransactionId,
          });
          if (!_.isEmpty(item)) {
            tps.ServiceTransaction.DataTag = item.DataTag;
            tps.ServiceTransaction.AppointmentId = item.AppointmentId;
            tps.ServiceTransaction.ApptClassification = item.$$Classification;
            // service-fee-rollback modifications
            tps.ServiceTransaction.Fee = item.Fee;
            tps.ServiceTransaction.PriorFee = item.PriorFee;
            tps.ServiceTransaction.Amount = item.Amount;
            tps.ServiceTransaction.Balance = item.Balance;
            tps.ServiceTransaction.LocationId = item.LocationId; //might not need this
          }
        });
      });

      factory.updateExistingTreatmentPlans(existingPlans);
    };

    // refreshing datatag & name for updated plan
    factory.refreshUpdatedPlan = function (existingPlans, res) {
      _.forEach(existingPlans, function (tp) {
        if (
          tp.TreatmentPlanHeader.TreatmentPlanId ===
          factory.planToUpdate.TreatmentPlanHeader.TreatmentPlanId
        ) {
          tp.TreatmentPlanHeader.DataTag = res.Value.DataTag;
          tp.TreatmentPlanHeader.TreatmentPlanName =
            res.Value.TreatmentPlanName;
          tp.TreatmentPlanHeader.IsRecommended = res.Value.IsRecommended;
          tp.TreatmentPlanHeader.Status = res.Value.Status;
          tp.TreatmentPlanHeader.Note = res.Value.Note;
          tp.TreatmentPlanHeader.SortSettings = res.Value.SortSettings;
          tp.TreatmentPlanHeader.SignatureFileAllocationId =
            res.Value.SignatureFileAllocationId;
          factory.mergeTreatmentPlanHeaderUpdateOnlyDto(tp, res);
          factory.planToUpdate = tp;
        }
      });

      return existingPlans;
    };

    // removing deleted plan from list
    factory.removePlanFromExistingList = function (existingPlans) {
      var index = -1;
      _.forEach(existingPlans, function (tp, $index) {
        if (
          index === -1 &&
          tp.TreatmentPlanHeader.TreatmentPlanId ===
            factory.planMarkedForDeletion.TreatmentPlanHeader.TreatmentPlanId
        ) {
          index = $index;
        }
      });
      existingPlans.splice(index, 1);
      return existingPlans;
    };

    // collapsing all plans
    factory.collapseAll = function (etps) {
      _.forEach(etps, function (tp) {
        tp.TreatmentPlanHeader.CollapsedViewVisible = false;
      });
      return etps;
    };

    // it will call only when we are deleting the stage
    // removing deleted service from treatment plan services list
    factory.removeDeletedTPSFromPlan = function (plan, treatmentPlanServiceId) {
      var index = -1;
      _.forEach(plan.TreatmentPlanServices, function (tps, $index) {
        if (
          index === -1 &&
          tps.TreatmentPlanServiceHeader.TreatmentPlanServiceId ===
            treatmentPlanServiceId
        ) {
          index = $index;
        }
      });
      plan.TreatmentPlanServices.splice(index, 1);
      return plan;
    };

    // it will call only when we are removing the service
    // removing deleted service from treatment plan services list
    factory.removeSerivceFromPlan = function (
      plan,
      treatmentPlanServiceId,
      returnObject
    ) {
      var index = -1;
      var stageNumber = 0;
      var removingService = true;
      _.forEach(plan.TreatmentPlanServices, function (tps, $index) {
        if (
          index === -1 &&
          tps.TreatmentPlanServiceHeader.TreatmentPlanServiceId ===
            treatmentPlanServiceId
        ) {
          index = $index;
          stageNumber = tps.TreatmentPlanServiceHeader.TreatmentPlanGroupNumber;
        }
      });
      plan.TreatmentPlanServices.splice(index, 1);
      _.forEach(plan.TreatmentPlanServices, function (tps) {
        if (
          tps.TreatmentPlanServiceHeader.TreatmentPlanGroupNumber ===
          stageNumber
        ) {
          removingService = false;
        }
      });

      if (removingService === true) {
        factory.arrangeServices(plan, stageNumber, returnObject);
        returnObject.SetActiveTreatmentPlan(plan);
      }
      return plan;
    };
    //#endregion

    //#region create

    factory.create = function (ps, ntp, personId, isDuplicatePlan, stage) {
      if (factory.hasTreatmentPlanCreateAccess) {
        var defer = $q.defer();
        var promise = defer.promise;
        if (isDuplicatePlan != true) {
          ntp.TreatmentPlanServices = [];
          // calculate and set the next priority number for service
          var nextPriorityNumber = 1;
          _.forEach(ps, function (service) {
            var dto = factory.buildTreatmentPlanServiceDto(
              service,
              personId,
              stage
            );
            dto.ServiceTransaction.ObjectState = saveStates.Update;
            dto.TreatmentPlanServiceHeader.Priority = nextPriorityNumber;
            ntp.TreatmentPlanServices.push(dto);
            nextPriorityNumber++;
          });

          let firstServiceTransaction =
            ntp.TreatmentPlanServices[0].ServiceTransaction;

          // ensure the CreatedAtLocationId is set based on the proposed at location of the first service
          if (
            firstServiceTransaction.ProposedAtLocationId != null &&
            firstServiceTransaction.ProposedAtLocationId != undefined
          ) {
            ntp.CreatedAtLocationId =
              firstServiceTransaction.ProposedAtLocationId;
          } else {
            ntp.CreatedAtLocationId = firstServiceTransaction.LocationId;
          }
        }
        // set objectState
        factory.setObjectStates(ntp);

        // Remove invalid properties
        let treatmentPlanToSave = _.cloneDeep(ntp);
        delete treatmentPlanToSave.TreatmentPlanHeader.TreatmentPlanId;
        _.forEach(
          treatmentPlanToSave.TreatmentPlanServices,
          function (service) {
            delete service.TreatmentPlanServiceHeader.TreatmentPlanServiceId;
            delete service.TreatmentPlanServiceHeader.TreatmentPlanId;
          }
        );

        patientServices.TreatmentPlans.save(
          { Id: treatmentPlanToSave.TreatmentPlanHeader.PersonId },
          treatmentPlanToSave
        ).$promise.then(
          function (res) {
            promise = $.extend(promise, {
              values: res.Value,
            });
            defer.resolve(res);
            toastrFactory.success(
              localize.getLocalizedString('Your {0} has been created', [
                factory.defaultPlanName,
              ]),
              localize.getLocalizedString('Success')
            );
          },
          function () {
            toastrFactory.error(
              localize.getLocalizedString(
                'There was an error while creating your {0}',
                [factory.defaultPlanName]
              ),
              localize.getLocalizedString('Server Error')
            );
          }
        );
        return promise;
      }
    };

    //#endregion
    // ServiceTransaction.LocationId can now vary, only set equal the current user's current location if null or undefined
    factory.setOrUpdateLocation = function (tp) {
      var currentLocation = locationService.getCurrentLocation();
      _.forEach(tp.TreatmentPlanServices, function (tps) {
        if (
          tps.ServiceTransaction.LocationId === undefined ||
          tps.ServiceTransaction.LocationId === null
        ) {
          tps.ServiceTransaction.LocationId = currentLocation.id;
          tps.ServiceTransaction.ObjectState = saveStates.Update;
        }
      });
    };

    factory.setObjectStates = function (tp) {
      _.forEach(tp.TreatmentPlanServices, function (tps) {
        if (tps.ServiceTransaction.InsuranceEstimate) {
          tps.ServiceTransaction.InsuranceEstimate.ObjectState =
            saveStates.None;
        }
      });
    };

    factory.setInsuranceEstimateObjectState = function (treatmentPlanServices) {
      _.forEach(treatmentPlanServices, function (tps) {
        if (tps.ServiceTransaction.InsuranceEstimate) {
          tps.ServiceTransaction.InsuranceEstimate.ObjectState =
            saveStates.None;
        }
      });
    };

    //#region update

    // build expected dto for update based on whether status has changed
    // if status has not changed to Accepted or Rejected, no need to send serviceTransactionIds
    // if status has changed to one of these, we need to update the serviceTransactions status also
    // by sending pair values of Id and DataTag
    factory.getTreatmentPlanHeaderUpdateOnlyDto = function (
      planToUpdate,
      updateStatus
    ) {
      var treatmentPlanHeaderUpdateOnlyDto = planToUpdate.TreatmentPlanHeader;
      treatmentPlanHeaderUpdateOnlyDto.ServiceTransactionKeys = [];
      if (updateStatus === false) {
        return treatmentPlanHeaderUpdateOnlyDto;
      } else {
        // add ServiceTransactionKeys for plan
        _.forEach(
          planToUpdate.TreatmentPlanServices,
          function (treatmentPlanService) {
            var serviceTransactionId =
              treatmentPlanService.ServiceTransaction.ServiceTransactionId;
            var dataTag = treatmentPlanService.ServiceTransaction.DataTag;
            treatmentPlanHeaderUpdateOnlyDto.ServiceTransactionKeys.push({
              key: serviceTransactionId,
              value: dataTag,
            });
          }
        );
        return treatmentPlanHeaderUpdateOnlyDto;
      }
    };

    // if serviceTransactions have been updated we need to reset the dataTag
    factory.mergeTreatmentPlanHeaderUpdateOnlyDto = function (
      activeTreatmentPlan,
      res
    ) {
      var treatmentPlanHeaderUpdateOnlyDto = res.Value;
      var updateChartLedger = false;

      // if status has been changed to Rejected or Accepted we need to set all serviceTransactions.ServiceTransactionStatusId to same
      var serviceTransactionStatusId =
        treatmentPlanHeaderUpdateOnlyDto.Status === 'Rejected'
          ? 3
          : treatmentPlanHeaderUpdateOnlyDto.Status === 'Accepted'
          ? 7
          : null;

      // only update service transactions if matching ServiceTransactionKeys
      _.forEach(
        activeTreatmentPlan.TreatmentPlanServices,
        function (treatmentPlanService) {
          // find the matching record in the ServiceTransactionKeys
          var matchingRecord = _.find(
            treatmentPlanHeaderUpdateOnlyDto.ServiceTransactionKeys,
            function (serviceTransactionKey) {
              return (
                serviceTransactionKey.Key ===
                treatmentPlanService.ServiceTransaction.ServiceTransactionId
              );
            }
          );

          if (matchingRecord) {
            // we need to update the chartLedger with changes if any of the services have been updated
            updateChartLedger = true;
            // update the status of the service if the DataTag has changed (Indicates the status has been changed)
            if (
              treatmentPlanService.ServiceTransaction.DataTag !==
              matchingRecord.Value
            ) {
              treatmentPlanService.ServiceTransaction.DataTag =
                matchingRecord.Value;
              treatmentPlanService.ServiceTransaction.ServiceTransactionStatusId = serviceTransactionStatusId
                ? serviceTransactionStatusId
                : treatmentPlanService.ServiceTransaction
                    .ServiceTransactionStatusId;
            }
          }
        }
      );
      if (updateChartLedger === true) {
        $rootScope.$broadcast('soar:chart-services-reload-ledger');
      }
      return activeTreatmentPlan;
    };

    factory.update = function (updateStatus) {
      if (factory.hasTreatmentPlanEditAccess) {
        var defer = $q.defer();
        var promise = defer.promise;
        var params = {};
        // ensure the LocationId is set based on the first service
        factory.planToUpdate.TreatmentPlanHeader.LocationId =
          factory.planToUpdate.TreatmentPlanServices[0].ServiceTransaction.LocationId;
        params.Id = factory.planToUpdate.TreatmentPlanHeader.PersonId;
        params.TreatmentPlanId =
          factory.planToUpdate.TreatmentPlanHeader.TreatmentPlanId;
        factory.setObjectStates(factory.planToUpdate);
        var treatmentPlanHeaderUpdateOnlyDto = factory.getTreatmentPlanHeaderUpdateOnlyDto(
          factory.planToUpdate,
          updateStatus
        );
        patientServices.TreatmentPlans.updateHeader(
          params,
          treatmentPlanHeaderUpdateOnlyDto
        ).$promise.then(
          function (res) {
            promise = $.extend(promise, {
              values: res.Value,
            });
            defer.resolve(res);
            toastrFactory.success(
              localize.getLocalizedString('Update successful.'),
              localize.getLocalizedString('Success')
            );
          },
          function () {
            toastrFactory.error(
              localize.getLocalizedString(
                'Failed to update the {0}. Please try again.',
                [factory.defaultPlanName]
              ),
              localize.getLocalizedString('Server Error')
            );
          }
        );
        return promise;
      }
    };

    //#endregion

    //#region delete

    factory.delete = function (removeServicesFromAppt) {
      if (factory.hasTreatmentPlanDeleteAccess) {
        var defer = $q.defer();
        var promise = defer.promise;
        var params = {};
        params.Id = factory.planMarkedForDeletion.TreatmentPlanHeader.PersonId;
        params.TreatmentPlanId =
          factory.planMarkedForDeletion.TreatmentPlanHeader.TreatmentPlanId;
        params.RemoveServicesFromAppointment = removeServicesFromAppt;
        patientServices.TreatmentPlans.deletePlan(params).$promise.then(
          function (res) {
            promise = $.extend(promise, {
              values: res.Value,
            });
            defer.resolve(res);
            toastrFactory.success(
              localize.getLocalizedString('Delete successful.'),
              localize.getLocalizedString('Success')
            );
          },
          function () {
            toastrFactory.error(
              localize.getLocalizedString(
                'Failed to delete the {0}. Please try again.',
                [factory.defaultPlanName]
              ),
              localize.getLocalizedString('Server Error')
            );
          }
        );
        return promise;
      }
    };

    //Check for this because we do not allow completed services to be deleted from a scheuled/unscheduled appointment when deleting a stage or removing a service from the stage on a tx plan
    factory.stageHasServicesThatAreNotCompletedOnAppointment = function (
      treatmentPlan,
      stageNo
    ) {
      var hasScheduledAppointmentWithNonCompletedService = false;
      var appointmentIdsOnStage = [];
      // filter list to only that stage
      var servicesInStage = $filter(
        'filter'
      )(treatmentPlan.TreatmentPlanServices, {
        TreatmentPlanServiceHeader: { TreatmentPlanGroupNumber: stageNo },
      });
      for (var i = 0; i < servicesInStage.length; i++) {
        if (
          appointmentIdsOnStage.indexOf(
            servicesInStage[i].ServiceTransaction.AppointmentId
          ) === -1 &&
          servicesInStage[i].ServiceTransaction.AppointmentId !== null &&
          servicesInStage[i].ServiceTransaction.ServiceTransactionStatusId !==
            4 &&
          servicesInStage[i].ServiceTransaction.ServiceTransactionStatusId !== 5
        ) {
          appointmentIdsOnStage.push(
            servicesInStage[i].ServiceTransaction.AppointmentId
          );
        }
      }
      if (appointmentIdsOnStage.length > 0) {
        hasScheduledAppointmentWithNonCompletedService = true;
      }
      return hasScheduledAppointmentWithNonCompletedService;
    };

    // get the stage numbers for plan
    factory.getStagesInPlan = function (treatmentPlan) {
      var stagesInPlan = [];
      for (var i = 0; i < treatmentPlan.TreatmentPlanServices.length; i++) {
        if (
          stagesInPlan.indexOf(
            treatmentPlan.TreatmentPlanServices[i].TreatmentPlanServiceHeader
              .TreatmentPlanGroupNumber
          ) === -1
        ) {
          stagesInPlan.push(
            treatmentPlan.TreatmentPlanServices[i].TreatmentPlanServiceHeader
              .TreatmentPlanGroupNumber
          );
        }
      }
      return stagesInPlan;
    };

    // should we prompt for deleting services from appointment
    factory.promptForServiceToBeRemovedFromAppt = function (
      treatmentPlan,
      stageNo
    ) {
      var promptForDelete = false;
      // if deleting only a stage
      if (stageNo) {
        var promptForDelete = factory.stageHasServicesThatAreNotCompletedOnAppointment(
          treatmentPlan,
          stageNo
        );
      } else {
        // group the stages in plan
        var stagesInPlan = factory.getStagesInPlan(treatmentPlan);
        // for each stage should we prompt for delete
        for (var i = 0; i < stagesInPlan.length; i++) {
          stageNo = stagesInPlan[i];
          var canPromptForDelete = factory.stageHasServicesThatAreNotCompletedOnAppointment(
            treatmentPlan,
            stageNo
          );
          // if we can delete for a stage, then set prompt for true
          if (canPromptForDelete) {
            promptForDelete = true;
          }
        }
      }
      return promptForDelete;
    };

    //don't allow services to be removed if the tx planservice is on other tx plans
    factory.allowServiceToBeRemovedFromAppt = function (
      treatmentPlan,
      txPlanService,
      existingTreatmentPlans
    ) {
      var allowRemove = true;
      _.forEach(existingTreatmentPlans, function (plan) {
        if (
          treatmentPlan.TreatmentPlanHeader.TreatmentPlanId !=
          plan.TreatmentPlanHeader.TreatmentPlanId
        ) {
          _.forEach(
            plan.TreatmentPlanServices,
            function (treatmentPlanService) {
              if (
                treatmentPlanService.ServiceTransaction.ServiceTransactionId ===
                txPlanService.ServiceTransaction.ServiceTransactionId
              ) {
                allowRemove = false;
              }
            }
          );
        }
      });
      return allowRemove;
    };

    // when a plan or stage is deleted, should we prompt user to confirm deleting service from appointments
    factory.shouldPromptToRemoveServicesFromAppointment = function (
      treatmentPlan,
      stageNo,
      servTransId,
      existingTreatmentPlans
    ) {
      var promptToRemoveServicesFromAppointment = false;
      _.forEach(
        treatmentPlan.TreatmentPlanServices,
        function (treatmentPlanService) {
          if (servTransId) {
            if (
              servTransId ===
              treatmentPlanService.TreatmentPlanServiceHeader
                .TreatmentPlanServiceId
            ) {
              if (treatmentPlanService.ServiceTransaction.AppointmentId) {
                if (
                  factory.allowServiceToBeRemovedFromAppt(
                    treatmentPlan,
                    treatmentPlanService,
                    existingTreatmentPlans
                  )
                ) {
                  promptToRemoveServicesFromAppointment = true;
                }
              }
            }
          } else if (stageNo) {
            if (
              stageNo ===
              treatmentPlanService.TreatmentPlanServiceHeader
                .TreatmentPlanGroupNumber
            ) {
              if (treatmentPlanService.ServiceTransaction.AppointmentId) {
                // only allow delete if stage has services only on one appt
                if (
                  factory.promptForServiceToBeRemovedFromAppt(
                    treatmentPlan,
                    stageNo
                  )
                ) {
                  // only allow delete if services aren't on another appt
                  if (
                    factory.allowServiceToBeRemovedFromAppt(
                      treatmentPlan,
                      treatmentPlanService,
                      existingTreatmentPlans
                    )
                  ) {
                    promptToRemoveServicesFromAppointment = true;
                  }
                }
              }
            }
          } else {
            if (treatmentPlanService.ServiceTransaction.AppointmentId) {
              // only allow delete if at least one stage has services only on one appt
              if (
                factory.promptForServiceToBeRemovedFromAppt(
                  treatmentPlan,
                  stageNo
                )
              ) {
                // only allow delete if services aren't on another appt
                if (
                  factory.allowServiceToBeRemovedFromAppt(
                    treatmentPlan,
                    treatmentPlanService,
                    existingTreatmentPlans
                  )
                ) {
                  promptToRemoveServicesFromAppointment = true;
                }
              }
            }
          }
        }
      );
      return promptToRemoveServicesFromAppointment;
    };

    //#endregion

    //#region remove service

    factory.resetPatientAppointments = function resetPatientAppointments(
      personId
    ) {
      var defer = $q.defer();
      var promise = defer.promise;
      scheduleServices.Lists.Appointments.GetAll({
        PersonId: personId,
        FillProviders: true,
        FillServices: true,
      }).$promise.then(function (res) {
        defer.resolve(res);
      });
      return promise;
    };

    factory.removeService = function (
      plan,
      treatmentPlanServiceId,
      removeServiceFromAppointment
    ) {
      if (factory.hasTreatmentPlanDeleteServiceAccess) {
        var defer = $q.defer();
        var promise = defer.promise;
        var params = {};
        params.Id = plan.TreatmentPlanHeader.PersonId;
        params.TreatmentPlanId = plan.TreatmentPlanHeader.TreatmentPlanId;
        params.TreatmentPlanServiceId = treatmentPlanServiceId;
        params.RemoveServiceFromAppointment = removeServiceFromAppointment;
        patientServices.TreatmentPlans.removeService(params).$promise.then(
          function (res) {
            promise = $.extend(promise, {
              values: res.Value,
            });
            defer.resolve(res);
            toastrFactory.success(
              localize.getLocalizedString('Delete successful.'),
              localize.getLocalizedString('Success')
            );
          },
          function () {
            toastrFactory.error(
              localize.getLocalizedString(
                'Failed to delete the {0}. Please try again.',
                ['Proposed Service']
              ),
              localize.getLocalizedString('Server Error')
            );
          }
        );
        return promise;
      }
    };

    //#endregion

    //#region get all headers

    factory.getAllHeaders = function (personId) {
      if (factory.hasTreatmentPlanViewAccess) {
        var defer = $q.defer();
        var promise = defer.promise;

        patientServices.TreatmentPlans.getAllHeaders({
          Id: personId,
        }).$promise.then(
          function (res) {
            promise = $.extend(promise, {
              values: res.Value,
            });
            defer.resolve(res);
          },
          function () {
            toastrFactory.error(
              localize.getLocalizedString(
                'Failed to retrieve the list of {0}. Refresh the page to try again.',
                [factory.defaultPlanName + 's']
              ),
              localize.getLocalizedString('Error')
            );
          }
        );
        return promise;
      }
    };

    //#endregion

    //#region get by id

    // includePredeterminationInfo if false, do not populate HasAtLeastOnePredetermination in TreatmentPlanServiceHeader
    factory.getById = function (plan, includePredeterminationInfo) {
      if (factory.hasTreatmentPlanViewAccess) {
        var defer = $q.defer();
        var promise = defer.promise;
        var params = {};
        params.Id = plan.TreatmentPlanHeader.PersonId;
        params.TreatmentPlanId = plan.TreatmentPlanHeader.TreatmentPlanId;
        params.includePredeterminationInfo = includePredeterminationInfo;
        patientServices.TreatmentPlans.get(params).$promise.then(
          function (res) {
            promise = $.extend(promise, {
              values: res.Value,
            });
            defer.resolve(res);
          },
          function () {
            toastrFactory.error(
              localize.getLocalizedString('Failed to get {0}.', [
                factory.defaultPlanName,
              ]),
              localize.getLocalizedString('Server Error')
            );
          }
        );
        return promise;
      }
    };

    factory.getPredeterminationsById = function (plan) {
      if (factory.hasTreatmentPlanViewAccess) {
        var defer = $q.defer();
        var promise = defer.promise;
        var params = {};
        params.Id = plan.TreatmentPlanHeader.PersonId;
        params.TreatmentPlanId = plan.TreatmentPlanHeader.TreatmentPlanId;
        patientServices.TreatmentPlans.getPredeterminationsForTreatmentPlan(
          params
        ).$promise.then(
          function (res) {
            promise = $.extend(promise, {
              values: res.Value,
            });
            defer.resolve(res);
          },
          function () {
            toastrFactory.error(
              localize.getLocalizedString(
                'Failed to get predeterminations for {0}.',
                [factory.defaultPlanName]
              ),
              localize.getLocalizedString('Server Error')
            );
          }
        );
        return promise;
      }
    };

    factory.getTreatmentPlanById = function (personId, planId) {
      var defer = $q.defer();
      var promise = defer.promise;
      var params = {};
      params.Id = personId;
      params.TreatmentPlanId = planId;
      patientServices.TreatmentPlans.getTreatmentPlanById(params).$promise.then(
        function (res) {
          promise = $.extend(promise, { values: res.Value });
          defer.resolve(res);
        },
        function () {
          toastrFactory.error(
            localize.getLocalizedString('Failed to get TreatmentPlan.'),
            localize.getLocalizedString('Server Error')
          );
        }
      );
      return promise;
    };

    factory.getCount = function (personId) {
      var defer = $q.defer();
      var promise = defer.promise;
      var params = {};
      params.Id = personId;
      patientServices.TreatmentPlans.getCount(params).$promise.then(
        function (res) {
          promise = $.extend(promise, { values: res.Value });
          defer.resolve(res);
        },
        function () {
          toastrFactory.error(
            localize.getLocalizedString('Failed to get Treatment Plans Count.'),
            localize.getLocalizedString('Server Error')
          );
        }
      );
      return promise;
    };

    // #region get all acoount members

    factory.getAllAccountMembers = function (accountId) {
      var defer = $q.defer();
      var promise = defer.promise;
      var params = {};
      params.accountId = accountId;
      patientServices.Account.getAllAccountMembersByAccountId(
        params
      ).$promise.then(
        function (res) {
          promise = $.extend(promise, { values: res.Value });
          defer.resolve(res);
        },
        function () {
          toastrFactory.error(
            localize.getLocalizedString('Failed to get Account Members.'),
            localize.getLocalizedString('Server Error')
          );
        }
      );
      return promise;
    };

    // #region get all treatment plans for an account

    factory.getAllAccountTxPlans = function (id) {
      var defer = $q.defer();
      var promise = defer.promise;
      patientServices.TreatmentPlans.getAccountOverview({
        Id: id,
      }).$promise.then(
        function (res) {
          promise = $.extend(promise, {
            values: res.Value,
          });
          defer.resolve(res);
        },
        function () {
          toastrFactory.error(
            localize.getLocalizedString(
              'Failed to retrieve the list of {0}. Refresh the page to try again.',
              [factory.defaultPlanName + 's']
            ),
            localize.getLocalizedString('Error')
          );
        }
      );
      return promise;
    };

    factory.getPersonTxplans = function (PatientId) {
      var defer = $q.defer();
      var promise = defer.promise;
      patientServices.TreatmentPlans.getHeadersWithServicesSummary({
        Id: PatientId,
      }).$promise.then(
        function (res) {
          promise = $.extend(promise, {
            values: res.Value,
          });
          defer.resolve(res);
        },
        function () {
          toastrFactory.error(
            localize.getLocalizedString(
              'Failed to retrieve the list of {0}. Refresh the page to try again.',
              [factory.defaultPlanName + 's']
            ),
            localize.getLocalizedString('Error')
          );
        }
      );
      return promise;
    };

    //#region updateServiceHeader
    factory.updateTreatmentPlanServiceHeader = function (
      plan,
      treatmentPlanService,
      stageno,
      appointmentId
    ) {
      if (factory.hasTreatmentPlanEditAccess) {
        var defer = $q.defer();
        var promise = defer.promise;
        var params = {};
        params.Id = plan.TreatmentPlanHeader.PersonId;
        params.TreatmentPlanId = plan.TreatmentPlanHeader.TreatmentPlanId;
        params.TreatmentPlanServiceId =
          treatmentPlanService.TreatmentPlanServiceHeader.TreatmentPlanServiceId;
        params.stageNumber = stageno;
        params.AppointmentId = appointmentId;

        patientServices.TreatmentPlans.updateServiceHeader(
          params,
          treatmentPlanService
        ).$promise.then(
          function (res) {
            var updatedPlan = factory.updateTreatmentPlanServiceHeadersFromPlan(
              plan,
              res.Value.TreatmentPlanServiceHeader
            );
            // update the active treatment plan with updated header
            factory.updateActiveTreatmentPlan(updatedPlan);
            promise = $.extend(promise, {
              values: res.Value,
            });
            defer.resolve(res);
            toastrFactory.success(
              localize.getLocalizedString('Update successful.'),
              localize.getLocalizedString('Success')
            );
          },
          function () {
            toastrFactory.error(
              localize.getLocalizedString(
                'Failed to update the {0}. Please try again.',
                ['Treatment Plan Service']
              ),
              localize.getLocalizedString('Server Error')
            );
          }
        );
        return promise;
      }
    };

    // update TreatmentPlanServices with updatedService
    factory.updateTreatmentPlanServiceHeadersFromPlan = function (
      plan,
      treatmentPlanServiceHeader
    ) {
      var index = -1;
      angular.forEach(plan.TreatmentPlanServices, function (tps, $index) {
        if (
          index === -1 &&
          tps.TreatmentPlanServiceHeader.TreatmentPlanServiceId ===
            treatmentPlanServiceHeader.TreatmentPlanServiceId
        ) {
          index = $index;
        }
      });
      if (index > -1) {
        plan.TreatmentPlanServices[
          index
        ].TreatmentPlanServiceHeader = treatmentPlanServiceHeader;
      }

      return plan;
    };

    factory.getActiveTreatmentPlanNextGroupNumber = function (plan) {
      var nextGroupNumber = 1;
      angular.forEach(plan.TreatmentPlanServices, function (tps) {
        if (
          tps.TreatmentPlanServiceHeader.TreatmentPlanGroupNumber >
          nextGroupNumber
        ) {
          nextGroupNumber =
            tps.TreatmentPlanServiceHeader.TreatmentPlanGroupNumber;
        }
      });
      return nextGroupNumber + 1;
    };

    //This gets the Next Stage Number for a Treatment Plan
    factory.getNextStageNumber = function (stagePlan) {
      let maxStageNumber = stagePlan[stagePlan.length - 1];
      return maxStageNumber.stageno + 1;
    };

    // delete services in the stage
    factory.deleteStage = function (plan, stageNum, removeServicesFromAppt) {
      if (factory.hasTreatmentPlanDeleteAccess) {
        var defer = $q.defer();
        var promise = defer.promise;
        var params = {};
        params.Id = plan.TreatmentPlanHeader.PersonId;
        params.TreatmentPlanId = plan.TreatmentPlanHeader.TreatmentPlanId;
        params.PartNumber = stageNum;
        params.RemoveServicesFromAppointment = removeServicesFromAppt;
        // do we have services in the stage we want to delete? if there are no services in the stage we want to delete,
        //  we don't actually have to call the API to do anything
        //  if we have services in the stage we want to delete, we need to call the api
        if (
          plan.TreatmentPlanServices &&
          plan.TreatmentPlanServices.length > 0
        ) {
          let servicesInSelectedStage = [];
          for (let i = 0; i < plan.TreatmentPlanServices.length; i++) {
            let currentTxPlanService = plan.TreatmentPlanServices[i];
            if (
              currentTxPlanService.TreatmentPlanServiceHeader !== null &&
              currentTxPlanService.TreatmentPlanServiceHeader
                .TreatmentPlanGroupNumber == stageNum
            ) {
              servicesInSelectedStage.push(currentTxPlanService);
            }
          }
          if (servicesInSelectedStage.length === 0) {
            // just show a toaster. we all good, don't call the API
            defer.resolve({});
            toastrFactory.success(
              localize.getLocalizedString('Delete successful.'),
              localize.getLocalizedString('Success')
            );
            return promise;
          }
        }
        patientServices.TreatmentPlans.deleteStage(params).$promise.then(
          function (res) {
            promise = $.extend(promise, {
              values: res.Value,
            });
            defer.resolve(res);
            toastrFactory.success(
              localize.getLocalizedString('Delete successful.'),
              localize.getLocalizedString('Success')
            );
          },
          function () {
            toastrFactory.error(
              localize.getLocalizedString(
                'Failed to delete the Stage. Please try again.'
              ),
              localize.getLocalizedString('Server Error')
            );
          }
        );
        return promise;
      }
    };

    //#endregion

    // re arrange the services in chronological order

    factory.arrangeServices = function (plan, stageNumber, returnObject) {
      angular.forEach(plan.TreatmentPlanServices, function (ps) {
        if (
          ps.TreatmentPlanServiceHeader.TreatmentPlanGroupNumber > stageNumber
        ) {
          var newGroup =
            ps.TreatmentPlanServiceHeader.TreatmentPlanGroupNumber - 1;
          ps.TreatmentPlanServiceHeader.TreatmentPlanGroupNumber = newGroup;
          factory
            .updateTreatmentPlanServiceHeader(plan, ps, newGroup)
            .then(function (res) {
              ps.TreatmentPlanServiceHeader =
                res.Value.TreatmentPlanServiceHeader;
              // update this plan in existingTreatmentPlans
              // find the matching plan and replace, NOTE, this may happen x number of times
              var indx = _.findIndex(
                returnObject.ExistingTreatmentPlans,
                function (treatmentPlan) {
                  return (
                    treatmentPlan.TreatmentPlanHeader.TreatmentPlanId ===
                    plan.TreatmentPlanHeader.TreatmentPlanId
                  );
                }
              );
              if (indx > -1) {
                returnObject.ExistingTreatmentPlans.splice(indx, 1);
                returnObject.ExistingTreatmentPlans.push(plan);
              }
            });
        }
      });
    };

    factory.createUnscheduleAppointment = function (plan, services, stageNum) {
      if (factory.hasTreatmentPlanEditAccess) {
        var defer = $q.defer();
        var promise = defer.promise;
        var params = {};
        params.Id = plan.TreatmentPlanHeader.PersonId;
        params.TreatmentPlanId = plan.TreatmentPlanHeader.TreatmentPlanId;
        //params.PartNumber = stageNum;
        var requestObj = [
          {
            PersonId: params.Id,
            TreatmentPlanId: params.TreatmentPlanId,
            Stage: stageNum,
            ServiceTransactions: services.map(function (service) {
              return service.ServiceTransaction;
            }),
          },
        ];
        patientServices.TreatmentPlans.createUnscheduleAppointment(
          params,
          requestObj
        ).$promise.then(
          function (res) {
            promise = $.extend(promise, {
              values: res.Value,
            });
            defer.resolve(res);
            toastrFactory.success(
              localize.getLocalizedString('Appointment create successful.'),
              localize.getLocalizedString('Success')
            );
          },
          function () {
            toastrFactory.error(
              localize.getLocalizedString(
                'Failed to create the {0}. Please try again.',
                ['Appointment']
              ),
              localize.getLocalizedString('Server Error')
            );
          }
        );
        return promise;
      }
    };

    //  Creating Unscheduled appointments from  the stage
    factory.createAppointements = function (personId, treatmentPlanId, stages) {
      var defer = $q.defer();
      var promise = defer.promise;
      var params = {};
      params.PersonId = personId;
      params.TreatmentPlanId = treatmentPlanId;
      patientServices.TreatmentPlans.createAppointments(
        params,
        stages
      ).$promise.then(
        function (res) {
          promise = $.extend(promise, {
            values: res.Value,
          });
          defer.resolve(res);
          toastrFactory.success(
            localize.getLocalizedString('Appointment creation is successful.'),
            localize.getLocalizedString('Success')
          );
        },
        function () {
          toastrFactory.error(
            localize.getLocalizedString(
              'Failed to create Appointments. Please try again.'
            ),
            localize.getLocalizedString('Server Error')
          );
        }
      );
      return promise;
    };
    //#endregion

    //#region Insurance Estimates

    // calculate patient portion based on est ins, tax, and fee
    factory.setPatientPortion = function (tp) {
      let txPlanArrayOfServiceTransactions = [];
      let txPlanCoverageServiceArray = [];

      angular.forEach(tp.TreatmentPlanServices, function (tps) {
        var serviceTransaction = tps.ServiceTransaction;
        var fee = serviceTransaction.Fee ? serviceTransaction.Fee : 0;
        var tax = serviceTransaction.Tax ? serviceTransaction.Tax : 0;
        var discount = serviceTransaction.Discount
          ? serviceTransaction.Discount
          : 0;
        // add check for Insurance estimate
        serviceTransaction.InsuranceEstimates = financialService.CreateOrCloneInsuranceEstimateObject(
          serviceTransaction
        );

        angular.forEach(
          serviceTransaction.InsuranceEstimates,
          function (estimate) {
            estimate.PatientPortion =
              fee - discount + tax - estimate.EstInsurance;
          }
        );

        tps.ServiceTransaction.Discount > 0
          ? (tps.ServiceTransaction.applyDiscount = true)
          : (tps.ServiceTransaction.applyDiscount = false);
        txPlanArrayOfServiceTransactions.push(tps.ServiceTransaction);

        txPlanCoverageServiceArray.push({
          AccountMemberId: tps.ServiceTransaction.AccountMemberId,
          Fee: tps.ServiceTransaction.Fee,
          LocationId: tps.ServiceTransaction.LocationId,
          ServiceCodeId: tps.ServiceTransaction.ServiceCodeId,
          ServiceTransactionId: tps.ServiceTransaction.ServiceTransactionId,
          ServiceTransactionStatusId:
            tps.ServiceTransaction.ServiceTransactionStatusId,
        });
      });

      treatmentPlanHttpService
        .getInsuranceInfo(txPlanCoverageServiceArray)
        .subscribe({
          next: result => {
            // this will stomp any old value with the latest and greatest
            this.treatmentPlanCoverage = result.Value;

            // now we can add the missing service coverages, emptying the Services array as we do, we should end up with an empty array
            if (
              !this.treatmentPlanCoverage.Services ||
              !Array.isArray(this.treatmentPlanCoverage.Services)
            ) {
              console.log(
                'treatment plans insurance coverage returned a Services object that is not an array!'
              );
            } else {
              // walk the services
              for (
                let j = 0;
                j < txPlanArrayOfServiceTransactions.length;
                ++j
              ) {
                let curService = txPlanArrayOfServiceTransactions[j];

                if (!curService.Coverage) {
                  // current service is missing coverage, fill in from return element with matching service code and location
                  for (
                    let k = 0;
                    k < this.treatmentPlanCoverage.Services.length;
                    ++k
                  ) {
                    if (
                      this.treatmentPlanCoverage.Services[k]
                        .ServiceTransactionId ===
                      curService.ServiceTransactionId
                    ) {
                      curService.Coverage = this.treatmentPlanCoverage.Services[
                        k
                      ];

                      if (
                        this.treatmentPlanCoverage.Services[k]
                          .PrimaryCoverage !== null &&
                        this.treatmentPlanCoverage.Services[k].PrimaryCoverage
                          .AllowedAmount !== null
                      ) {
                        curService.AllowedAmount = this.treatmentPlanCoverage.Services[
                          k
                        ].PrimaryCoverage.AllowedAmount;
                      } else {
                        curService.AllowedAmount = 0;
                      }
                      this.treatmentPlanCoverage.Services.splice(k, 1);
                      break;
                    }
                  }
                }
              }
            }
          },
          error: error => {
            console.log(error);
          },
        });
    };

    // calculate insurance estimates on one or more treatmentPlanServices before adding to treatment plan

    //TODO: Remove this method? It isn't being used anywhere except unit tests
    factory.calculateInsuranceEstimateOnServices = function (
      treatmentPlanServices
    ) {
      var serviceTransactions = [];
      for (var i = 0; i < treatmentPlanServices.length; i++) {
        var st = treatmentPlanServices[i].ServiceTransaction;
        st.InsuranceEstimates = financialService.CreateOrCloneInsuranceEstimateObject(
          st
        );
        st.InsuranceEstimate.AccountMemberId = st.AccountMemberId;
        // PBI 394368 do not send services with a status of 'Completed' to be calculated by the insurance est
        // do not send services with a status of 'Rejected' and 'Referred','ReferredCompleted' to be calculated by the insurance est
        if (
          st.IsDeleted !== true &&
          st.ServiceTransactionStatusId !== 4 &&
          st.ServiceTransactionStatusId !== 3 &&
          st.ServiceTransactionStatusId !== 2 &&
          st.ServiceTransactionStatusId !== 8
        ) {
          serviceTransactions.push(st);
        }
      }
      return financialService.RecalculateInsuranceWithCascadingEstimates(
        serviceTransactions
      );
    };

    // calculate insurance estimate for all services on treatment plan
    factory.calculateInsuranceEstimates = function (tp) {
      var serviceTransactions = [];
      // order TreatmentPlanServices by TreatmentPlanGroupNumber before calculating
      var treatmentPlanServices = $filter('orderBy')(tp.TreatmentPlanServices, [
        'TreatmentPlanServiceHeader.TreatmentPlanGroupNumber',
        'TreatmentPlanServiceHeader.Priority',
      ]);
      for (var i = 0; i < treatmentPlanServices.length; i++) {
        var st = treatmentPlanServices[i].ServiceTransaction;
        st.InsuranceEstimates = financialService.CreateOrCloneInsuranceEstimateObject(
          st
        );
        // PBI 394368 do not send services with a status of 'Completed' to be calculated by the insurance est
        // do not send services with a status of 'Rejected' and 'Referred','ReferredCompleted'to be calculated by the insurance est
        if (
          st.IsDeleted !== true &&
          st.ServiceTransactionStatusId !== 4 &&
          st.ServiceTransactionStatusId !== 3 &&
          st.ServiceTransactionStatusId !== 2 &&
          st.ServiceTransactionStatusId !== 8
        ) {
          serviceTransactions.push(st);
        }
      }
      return financialService.RecalculateInsuranceWithCascadingEstimates(
        serviceTransactions
      );
    };

    // calculate insurance estimate for one service based on all services on treatment plan
    factory.calculateInsuranceEstimate = function (tp, treatmentPlanService) {
      var defer = $q.defer();
      var promise = defer.promise;
      // get the list of service transactions
      var serviceTransactions = [];
      // order TreatmentPlanServices by TreatmentPlanGroupNumber before calculating
      tp.TreatmentPlanServices = $filter('orderBy')(tp.TreatmentPlanServices, [
        'TreatmentPlanServiceHeader.TreatmentPlanGroupNumber',
        'TreatmentPlanServiceHeader.Priority',
      ]);

      _.forEach(tp.TreatmentPlanServices, function (tps) {
        if (tps.ServiceTransaction.IsDeleted !== true) {
          if (
            _.isEqual(
              tps.ServiceTransaction.ServiceTransactionId,
              treatmentPlanService.ServiceTransaction.ServiceTransactionId
            )
          ) {
            serviceTransactions.push(treatmentPlanService.ServiceTransaction);
          } else {
            serviceTransactions.push(tps.ServiceTransaction);
          }
        }
      });

      if (
        !_.includes(
          serviceTransactions,
          treatmentPlanService.ServiceTransaction
        ) &&
        treatmentPlanService.ServiceTransaction.IsDeleted !== true
      ) {
        serviceTransactions.push(treatmentPlanService.ServiceTransaction);
      }

      // initialize or clone the Insurance Estimate
      angular.forEach(serviceTransactions, function (serviceTransaction) {
        serviceTransaction.InsuranceEstimates = financialService.CreateOrCloneInsuranceEstimateObject(
          serviceTransaction
        );
      });
      financialService
        .RecalculateInsuranceWithCascadingEstimates(serviceTransactions)
        .then(
          function () {
            // set the objectState for the passed in tps
            if (treatmentPlanService.ServiceTransaction.InsuranceEstimate) {
              treatmentPlanService.ServiceTransaction.InsuranceEstimate
                .ObjectState === saveStates.None;
            }
            promise = $.extend(promise, {
              values: treatmentPlanService,
            });
            defer.resolve(treatmentPlanService);
          },
          function () {
            toastrFactory.error(
              localize.getLocalizedString(
                'Failed to create Insurance Estimate. Please try again.'
              ),
              localize.getLocalizedString('Server Error')
            );
          }
        );
      return promise;
    };

    factory.calculateInsuranceEstimatesWithOverride = function (tp) {
      //This gets called when a new service is created, that new service will not have an insurance estimate
      //This will also get called first thing when a treatment plan is first loaded to calculate all the estimates

      //Because of that... we need to let recalculation happen first
      //After recalculation, see if there are any overrides present on the treatment plan
      //If there are overrides present, take those overrides from the plan, load them onto the insurance estimates
      //Then recalc the insurance and save to the treatment plan
      //If there are overrides, make sure that all insurance estimates get marked as overridden with primary being most recent

      //If there are no overrides present, take whatever comes back from the recalculation and save it to tx plan services
      //Return the data (with any overrides applied) to where it is needed.

      var defer = $q.defer();
      var promise = defer.promise;

      var serviceTransactions = [];
      // order TreatmentPlanServices by TreatmentPlanGroupNumber before calculating
      var treatmentPlanServices = $filter('orderBy')(tp.TreatmentPlanServices, [
        'TreatmentPlanServiceHeader.TreatmentPlanGroupNumber',
        'TreatmentPlanServiceHeader.Priority',
      ]);
      for (var i = 0; i < treatmentPlanServices.length; i++) {
        var st = treatmentPlanServices[i].ServiceTransaction;

        if (st.InsuranceEstimates && st.InsuranceEstimates.length > 0) {
          //If there are any insurance estimates already saved,
          //we need to ignore whether they are overridden or not

          st.InsuranceEstimates.forEach(estimate => {
            estimate.IsUserOverRidden = false;
            estimate.IsMostRecentOverride = false;
          });
        }

        st.InsuranceEstimates = financialService.CreateOrCloneInsuranceEstimateObject(
          st
        );
        // PBI 394368 do not send services with a status of 'Completed' to be calculated by the insurance est
        // do not send services with a status of 'Rejected' and 'Referred','ReferredCompleted'to be calculated by the insurance est
        if (
          st.IsDeleted !== true &&
          st.ServiceTransactionStatusId !== 4 &&
          st.ServiceTransactionStatusId !== 3 &&
          st.ServiceTransactionStatusId !== 2 &&
          st.ServiceTransactionStatusId !== 8
        ) {
          serviceTransactions.push(st);
        }
      }
      financialService
        .RecalculateInsuranceWithCascadingEstimates(serviceTransactions)
        .then(function () {
          serviceTransactions.forEach(service => {
            if (
              service.InsuranceEstimates &&
              service.InsuranceEstimates.length > 0
            ) {
              var tpService = tp.TreatmentPlanServices.find(function (x) {
                return (
                  service.ServiceTransactionId ==
                  x.ServiceTransaction.ServiceTransactionId
                );
              });

              if (
                tpService &&
                tpService.TreatmentPlanServiceHeader
                  .TreatmentPlanInsuranceEstimates &&
                tpService.TreatmentPlanServiceHeader
                  .TreatmentPlanInsuranceEstimates.length > 0
              ) {
                tpService.TreatmentPlanServiceHeader.TreatmentPlanInsuranceEstimates.forEach(
                  tpServiceEstimate => {
                    if (
                      angular.isUndefined(
                        tpService.TreatmentPlanServiceHeader
                          .TreatmentPlanInsuranceEstimates
                      ) ||
                      tpService.TreatmentPlanServiceHeader
                        .TreatmentPlanInsuranceEstimates == null
                    ) {
                      //The tx plan service InsuranceEstimates was null/undefined, set it to empty list
                      tpService.TreatmentPlanServiceHeader.TreatmentPlanInsuranceEstimates = [];
                    }
                    var serviceEstimate = service.InsuranceEstimates.find(
                      function (x) {
                        return (
                          x.PatientBenefitPlanId ==
                          tpServiceEstimate.PatientBenefitPlanId
                        );
                      }
                    );

                    if (serviceEstimate) {
                      //We found a matching estimate for the benefit plan on the tx service header estimates
                      //Change the estimate on the service
                      serviceEstimate.EstInsurance =
                        tpServiceEstimate.EstInsurance;
                      serviceEstimate.AdjEst = tpServiceEstimate.AdjEst;
                      serviceEstimate.IsUserOverRidden =
                        tpServiceEstimate.IsUserOverRidden;
                    } else {
                      //We didn't find a match for the benefit plan anywhere in the tx plan estimates
                    }
                  }
                );
              }
            }
          });

          if (
            serviceTransactions.find(function (x) {
              return (
                x.InsuranceEstimates.find(function (y) {
                  return y.IsUserOverRidden == true;
                }) != undefined
              );
            })
          ) {
            serviceTransactions.forEach(service => {
              if (
                service.InsuranceEstimates &&
                service.InsuranceEstimates.length > 0
              ) {
                service.InsuranceEstimates.forEach(estimate => {
                  estimate.IsUserOverRidden = true;
                });
              }
              service.InsuranceEstimates[0].IsMostRecentOverride = true;
            });
          }

          //Recalculate estimated insurance again, this time with any treatment plan overrides applied
          financialService
            .RecalculateInsuranceWithCascadingEstimates(serviceTransactions)
            .then(function () {
              //Sift through the responses and this time do any updating to the treatment plan service estimate amounts
              tp.TreatmentPlanServices.forEach(tpService => {
                var serviceTransaction = serviceTransactions.find(function (x) {
                  return (
                    x.ServiceTransactionId ==
                    tpService.ServiceTransaction.ServiceTransactionId
                  );
                });

                if (serviceTransaction) {
                  serviceTransaction.InsuranceEstimates.forEach(
                    serviceEstimate => {
                      if (
                        angular.isUndefined(
                          tpService.TreatmentPlanServiceHeader
                            .TreatmentPlanInsuranceEstimates
                        ) ||
                        tpService.TreatmentPlanServiceHeader
                          .TreatmentPlanInsuranceEstimates == null
                      ) {
                        //The tx plan service InsuranceEstimates was null/undefined, set it to empty list
                        tpService.TreatmentPlanServiceHeader.TreatmentPlanInsuranceEstimates = [];
                      }
                      var txEstimate = tpService.TreatmentPlanServiceHeader.TreatmentPlanInsuranceEstimates.filter(
                        function (x) {
                          return (
                            x.PatientBenefitPlanId ==
                            serviceEstimate.PatientBenefitPlanId
                          );
                        }
                      );

                      if (txEstimate && txEstimate.length > 0) {
                        //We found a matching estimate for the benefit plan on the tx service header estimates
                        //Update it
                        //Remove any duplicates that happen to be lying around
                        for (
                          var count = 0;
                          count < txEstimate.length;
                          count++
                        ) {
                          if (count == 0) {
                            txEstimate[count].EstInsurance =
                              serviceEstimate.EstInsurance;
                            txEstimate[count].AdjEst = serviceEstimate.AdjEst;
                            txEstimate[count].ObjectState = 'Update';
                          } else {
                            txEstimate[count].ObjectState = 'Delete';
                          }
                        }
                      } else {
                        //We didn't find a match for the benefit plan anywhere in the tx plan estimates
                        //Add a new one to the tx plan estimates
                        tpService.TreatmentPlanServiceHeader.TreatmentPlanInsuranceEstimates.push(
                          {
                            PatientBenefitPlanId:
                              serviceEstimate.PatientBenefitPlanId,
                            IsUserOverRidden: false,
                            EstInsurance: serviceEstimate.EstInsurance,
                            AdjEst: serviceEstimate.AdjEst,
                            ObjectState: 'Add',
                            TreatmentPlanServiceHeaderId:
                              tpService.TreatmentPlanServiceHeader
                                .TreatmentPlanServiceId,
                          }
                        );
                      }
                    }
                  );
                }
              });

              if (
                tp &&
                tp.TreatmentPlanHeader &&
                tp.TreatmentPlanHeader.Status != 'Completed'
              ) {
                var treatmentPlanServicesList = tp.TreatmentPlanServices.map(
                  function (a) {
                    return a.TreatmentPlanServiceHeader;
                  }
                );
                treatmentPlanServicesList.forEach(x => {
                  x.ObjectState = 'Update';

                  if (
                    x.TreatmentPlanInsuranceEstimates &&
                    x.TreatmentPlanInsuranceEstimates.length > 0
                  ) {
                    x.TreatmentPlanInsuranceEstimates = x.TreatmentPlanInsuranceEstimates.filter(
                      function (estimate) {
                        return (
                          estimate.PatientBenefitPlanId !=
                          '00000000-0000-0000-0000-000000000000'
                        );
                      }
                    );
                  }
                });

                patientServices.TreatmentPlans.updateMultipleServiceHeaders(
                  {
                    Id: tp.TreatmentPlanHeader.PersonId,
                    TreatmentPlanId: tp.TreatmentPlanHeader.TreatmentPlanId,
                    TreatmentPlanServiceId:
                      tp.TreatmentPlanServices[0].TreatmentPlanServiceHeader
                        .TreatmentPlanServiceId,
                  },
                  treatmentPlanServicesList
                ).$promise.then(function (res) {
                  res.Value.forEach(x => {
                    factory.updateTreatmentPlanServiceHeadersFromPlan(tp, x);
                  });

                  defer.resolve(res);
                });
              } else {
                defer.resolve(tp);
              }
            });
        });
      return promise;
    };

    //Currently only used behind the feature flag for treatment plan estimated insurance editing
    factory.calculateInsuranceEstimateWithOverrides = function (
      tp,
      treatmentPlanService,
      pbps
    ) {
      //If we are here, then we are coming from the est ins update or from Edit in ellipses menu

      //If we end up not having an insurance estimate on the treatmentPlanService...
      //We must be editing the fee from somewhere, so we'll want to recalculate
      var hasTxPlanEstOverrides = false;
      var defer = $q.defer();
      var promise = defer.promise;
      // get the list of service transactions
      var serviceTransactions = [];
      // order TreatmentPlanServices by TreatmentPlanGroupNumber before calculating
      tp.TreatmentPlanServices = $filter('orderBy')(tp.TreatmentPlanServices, [
        'TreatmentPlanServiceHeader.TreatmentPlanGroupNumber',
        'TreatmentPlanServiceHeader.Priority',
      ]);

      _.forEach(tp.TreatmentPlanServices, function (tps) {
        if (
          tps.ServiceTransaction.IsDeleted !== true &&
          tps.ServiceTransaction.ServiceTransactionStatusId !== 4 &&
          tps.ServiceTransaction.ServiceTransactionStatusId !== 3 &&
          tps.ServiceTransaction.ServiceTransactionStatusId !== 2 &&
          tps.ServiceTransaction.ServiceTransactionStatusId !== 8
        ) {
          if (
            _.isEqual(
              tps.ServiceTransaction.ServiceTransactionId,
              treatmentPlanService.ServiceTransaction.ServiceTransactionId
            )
          ) {
            serviceTransactions.push(treatmentPlanService.ServiceTransaction);
          } else {
            serviceTransactions.push(tps.ServiceTransaction);
          }
        }
      });

      if (
        !_.includes(
          serviceTransactions,
          treatmentPlanService.ServiceTransaction
        ) &&
        treatmentPlanService.ServiceTransaction.IsDeleted !== true
      ) {
        serviceTransactions.push(treatmentPlanService.ServiceTransaction);
      }

      // initialize or clone the Insurance Estimate
      angular.forEach(serviceTransactions, function (serviceTransaction) {
        var tpService = tp.TreatmentPlanServices.find(function (service) {
          return (
            service.ServiceTransaction.ServiceTransactionId ==
            serviceTransaction.ServiceTransactionId
          );
        });
        if (tpService) {
          if (
            tpService.TreatmentPlanServiceHeader.TreatmentPlanInsuranceEstimates.find(
              function (x) {
                return x.IsUserOverRidden == true;
              }
            ) &&
            serviceTransaction.InsuranceEstimates != null &&
            serviceTransaction.InsuranceEstimates.length > 0
          ) {
            //If the current serviceTransaction has insurance estimates (meaning we are changing the insurance estimates)
            //And the treatment plan service header has any estimates on it that are overridden
            //Then set that we have an override
            hasTxPlanEstOverrides = true;
          } else if (
            tpService.TreatmentPlanServiceHeader.TreatmentPlanInsuranceEstimates.find(
              function (x) {
                return x.IsUserOverRidden == true;
              }
            ) &&
            (angular.isUndefined(serviceTransaction.InsuranceEstimates) ||
              serviceTransaction.InsuranceEstimates == null ||
              serviceTransaction.InsuranceEstimates.length == 0)
          ) {
            //If we don't have insurance estimates on the current service,
            //We need to make sure the tx service header estimates aren't treated as overrides
            //Reason: Without those estimates, we must have changed a fee or something
            //So we will have to recalculate insurance for that service
            tpService.TreatmentPlanServiceHeader.TreatmentPlanInsuranceEstimates.forEach(
              x => {
                x.IsUserOverRidden = false;
              }
            );
          }
        }
      });

      if (hasTxPlanEstOverrides) {
        angular.forEach(serviceTransactions, function (serviceTransaction) {
          if (
            serviceTransaction.InsuranceEstimates != null &&
            serviceTransaction.InsuranceEstimates.length > 0
          ) {
            angular.forEach(
              serviceTransaction.InsuranceEstimates,
              function (estimate) {
                estimate.IsUserOverRidden = true;
              }
            );
            serviceTransaction.InsuranceEstimates[0].IsMostRecentOverride = true;

            serviceTransaction.InsuranceEstimates = financialService.CreateOrCloneInsuranceEstimateObject(
              serviceTransaction
            );
          } else {
            //This service doesn't have any estimated insurance.
            //We have most likely came from the Edit Ellipsis menu

            //Add a blank estimated insurance object for the patient's primary and secondary benefit plans (if patient has them)
            //This will prevent any stray estimated insurances that are saved from messing with the new calculations
            //We need to do this because the fee might have changed and caused one of those overrides to become invalid
            serviceTransaction.InsuranceEstimates = [];
            serviceTransaction.InsuranceEstimates = financialService.CreateOrCloneInsuranceEstimateObject(
              serviceTransaction
            );

            if (pbps.length > 1) {
              serviceTransaction.InsuranceEstimates.push(
                _.cloneDeep(serviceTransaction.InsuranceEstimates[0])
              );
              serviceTransaction.InsuranceEstimates[1].PatientBenefitPlanId =
                pbps[1].PatientBenefitPlanId;
            }
          }
        });
      } else {
        angular.forEach(serviceTransactions, function (serviceTransaction) {
          if (
            serviceTransaction.ServiceTransactionId ==
              treatmentPlanService.ServiceTransaction.ServiceTransactionId &&
            (!serviceTransaction.InsuranceEstimates ||
              serviceTransaction.InsuranceEstimates.length == 0)
          ) {
            //This service doesn't have any estimated insurance.
            //We have most likely came from the Edit Ellipsis menu

            //Add a blank estimated insurance object for the patient's primary and secondary benefit plans (if patient has them)
            //This will prevent any stray estimated insurances that are saved from messing with the new calculations
            //We need to do this because the fee might have changed and caused one of those overrides to become invalid
            serviceTransaction.InsuranceEstimates = [];
            serviceTransaction.InsuranceEstimates = financialService.CreateOrCloneInsuranceEstimateObject(
              serviceTransaction
            );

            if (pbps.length > 1) {
              serviceTransaction.InsuranceEstimates.push(
                _.cloneDeep(serviceTransaction.InsuranceEstimates[0])
              );
              serviceTransaction.InsuranceEstimates[1].PatientBenefitPlanId =
                pbps[1].PatientBenefitPlanId;
            }
          }
        });
      }

      financialService
        .RecalculateInsuranceWithCascadingEstimates(serviceTransactions)
        .then(
          function () {
            tp.TreatmentPlanServices.forEach(tpService => {
              var serviceTransaction = serviceTransactions.find(function (x) {
                return (
                  x.ServiceTransactionId ==
                  tpService.ServiceTransaction.ServiceTransactionId
                );
              });

              if (serviceTransaction) {
                serviceTransaction.InsuranceEstimates.forEach(
                  serviceEstimate => {
                    if (
                      angular.isUndefined(
                        tpService.TreatmentPlanServiceHeader
                          .TreatmentPlanInsuranceEstimates
                      ) ||
                      tpService.TreatmentPlanServiceHeader
                        .TreatmentPlanInsuranceEstimates == null
                    ) {
                      //The tx plan service InsuranceEstimates was null/undefined, set it to empty list
                      tpService.TreatmentPlanServiceHeader.TreatmentPlanInsuranceEstimates = [];
                    }
                    var txEstimate = tpService.TreatmentPlanServiceHeader.TreatmentPlanInsuranceEstimates.find(
                      function (x) {
                        return (
                          x.PatientBenefitPlanId ==
                          serviceEstimate.PatientBenefitPlanId
                        );
                      }
                    );

                    if (txEstimate) {
                      //We found a matching estimate for the benefit plan on the tx service header estimates
                      //Update it
                      txEstimate.EstInsurance = serviceEstimate.EstInsurance;
                      txEstimate.AdjEst = serviceEstimate.AdjEst;
                      txEstimate.ObjectState = 'Update';
                    } else {
                      //We didn't find a match for the benefit plan anywhere in the tx plan estimates
                      //Add a new one to the tx plan estimates
                      tpService.TreatmentPlanServiceHeader.TreatmentPlanInsuranceEstimates.push(
                        {
                          PatientBenefitPlanId:
                            serviceEstimate.PatientBenefitPlanId,
                          IsUserOverRidden: false,
                          EstInsurance: serviceEstimate.EstInsurance,
                          AdjEst: serviceEstimate.AdjEst,
                          ObjectState: 'Add',
                          TreatmentPlanServiceHeaderId:
                            tpService.TreatmentPlanServiceHeader
                              .TreatmentPlanServiceId,
                        }
                      );
                    }
                  }
                );
              }
            });

            if (
              tp &&
              tp.TreatmentPlanHeader &&
              tp.TreatmentPlanHeader.Status != 'Completed'
            ) {
              var treatmentPlanServicesList = tp.TreatmentPlanServices.map(
                function (a) {
                  return a.TreatmentPlanServiceHeader;
                }
              );

              treatmentPlanServicesList.forEach(x => {
                if (
                  x.TreatmentPlanInsuranceEstimates &&
                  x.TreatmentPlanInsuranceEstimates.length > 0
                ) {
                  x.TreatmentPlanInsuranceEstimates = x.TreatmentPlanInsuranceEstimates.filter(
                    function (estimate) {
                      return (
                        estimate.PatientBenefitPlanId !=
                        '00000000-0000-0000-0000-000000000000'
                      );
                    }
                  );
                }
              });

              patientServices.TreatmentPlans.updateMultipleServiceHeaders(
                {
                  Id: tp.TreatmentPlanHeader.PersonId,
                  TreatmentPlanId: tp.TreatmentPlanHeader.TreatmentPlanId,
                  TreatmentPlanServiceId:
                    tp.TreatmentPlanServices[0].TreatmentPlanServiceHeader
                      .TreatmentPlanServiceId,
                },
                treatmentPlanServicesList
              ).$promise.then(function (res) {
                // set the objectState for the passed in tps
                if (treatmentPlanService.ServiceTransaction.InsuranceEstimate) {
                  treatmentPlanService.ServiceTransaction.InsuranceEstimate
                    .ObjectState === saveStates.None;
                }

                res.Value.forEach(x => {
                  factory.updateTreatmentPlanServiceHeadersFromPlan(tp, x);
                });

                promise = $.extend(promise, {
                  values: treatmentPlanService,
                });
                defer.resolve(res);
              });
            } else {
              defer.resolve(tp);
            }
          },
          function () {
            toastrFactory.error(
              localize.getLocalizedString(
                'Failed to create Insurance Estimate. Please try again.'
              ),
              localize.getLocalizedString('Server Error')
            );
          }
        );
      return promise;
    };

    factory.resetEstimatedInsurance = function (tp) {
      var defer = $q.defer();
      var promise = defer.promise;

      factory
        .getTreatmentPlanById(
          tp.TreatmentPlanHeader.PersonId,
          tp.TreatmentPlanHeader.TreatmentPlanId
        )
        .then(function (res) {
          factory.planToUpdate = res.Value;

          var treatmentPlanServicesList = tp.TreatmentPlanServices.map(
            function (a) {
              return a.TreatmentPlanServiceHeader;
            }
          );
          treatmentPlanServicesList.forEach(serviceHeader => {
            serviceHeader.ObjectState = 'Update';
            if (
              serviceHeader.TreatmentPlanInsuranceEstimates &&
              serviceHeader.TreatmentPlanInsuranceEstimates.length > 0
            ) {
              serviceHeader.TreatmentPlanInsuranceEstimates.forEach(
                estimate => {
                  estimate.ObjectState = 'Delete';
                }
              );
            }
          });
          patientServices.TreatmentPlans.updateMultipleServiceHeaders(
            {
              Id: tp.TreatmentPlanHeader.PersonId,
              TreatmentPlanId: tp.TreatmentPlanHeader.TreatmentPlanId,
              TreatmentPlanServiceId:
                tp.TreatmentPlanServices[0].TreatmentPlanServiceHeader
                  .TreatmentPlanServiceId,
            },
            treatmentPlanServicesList
          ).$promise.then(function (res) {
            res.Value.forEach(x => {
              factory.updateTreatmentPlanServiceHeadersFromPlan(tp, x);
            });

            defer.resolve(res);
          });
        });

      return promise;
    };

    //#endregion

    //#region Predeterminations

    // NOTE replace amfa when we have for pred

    // list of predetermination services
    var predeterminationList = [];

    factory.initPredeterminationList = function () {
      predeterminationList = [];
      return predeterminationList;
    };

    // maintain predetermination list of services
    factory.updatePredeterminationList = function (tps, include) {
      // find the service transaction if in list
      var index = listHelper.findIndexByFieldValue(
        predeterminationList,
        'ServiceTransactionId',
        tps.ServiceTransaction.ServiceTransactionId
      );
      if (include === true) {
        if (index <= -1) {
          predeterminationList.push(tps.ServiceTransaction);
        }
      } else {
        if (index > -1) {
          predeterminationList.splice(index, 1);
        }
      }
      // notify observer when list changes
      angular.forEach(factory.predetermationListObservers, function (observer) {
        observer(predeterminationList);
      });
      return predeterminationList;
    };

    // NOTE replace amfa when we have for pred
    factory.createPredetermination = function (
      serviceTransactions,
      patientId,
      planOnPredetermination,
      providerOnPredetermination,
      treatmentPlanId
    ) {
      // TODO change to predetermination amfa when available
      var createPredeterminationAccess = patSecurityService.IsAuthorizedByAbbreviation(
        'soar-ins-iclaim-add'
      );
      if (createPredeterminationAccess) {
        var defer = $q.defer();
        var promise = defer.promise;
        var params = {
          personId: patientId,
          patientBenefitPlanId: planOnPredetermination,
          providerId: providerOnPredetermination,
          calculateEstimatatedInsurance: true,
          treatmentPlanId: treatmentPlanId,
        };
        patientServices.Predetermination.Create(
          params,
          serviceTransactions
        ).$promise.then(
          function (res) {
            promise = $.extend(promise, {
              values: res.Value,
            });
            defer.resolve(res);
            toastrFactory.success(
              localize.getLocalizedString('Your {0} has been created', [
                'Predetermination',
              ]),
              localize.getLocalizedString('Success')
            );
          },
          function () {
            toastrFactory.error(
              localize.getLocalizedString(
                'There was an error while creating your {0}',
                ['Predetermination']
              ),
              localize.getLocalizedString('Server Error')
            );
          }
        );
      }
      return promise;
    };

    // can this user create a predetermination for this tp.
    factory.allowCreatePredetermination = function (tp, serviceCodes) {
      var allowCreateDetermination = false;
      // if patient doesn't have insurance or estInsurance amount = 0 we can't create pretermination
      if (tp && tp.TreatmentPlanServices) {
        angular.forEach(tp.TreatmentPlanServices, function (tps) {
          if (
            tps.ServiceTransaction.InsuranceEstimate != null &&
            tps.ServiceTransaction.InsuranceEstimate.PatientBenefitPlanId
          ) {
            if (
              tps.ServiceTransaction.InsuranceEstimate.PatientBenefitPlanId !==
                '00000000-0000-0000-0000-000000000000' &&
              tps.ServiceTransaction.InsuranceEstimate.EstInsurance > 0
            ) {
              allowCreateDetermination = true;
            }
          }
        });
      }
      return allowCreateDetermination;
    };

    // get default provider on plans for preD
    factory.getDefaultProviderOnDetermination = function (tp, providers) {
      // filter out any users that are not providers
      let defaultProvider = null;
      let provider = null;
      let matchingProvider = null;
      let i = 0;
      if (providers && tp && tp.TreatmentPlanServices) {
        // 1) get ProviderOnClaims based on the first dentist (ProviderTypeId = 1) in providers list that matches one of the services.ProviderUserId
        // and whose location matches the service.LocationId.  If match found use the ProviderOnClaims for that user
        for (i = 0; i < tp.TreatmentPlanServices.length; i++) {
          provider = providers.find(
            prov =>
              prov.UserId ===
              tp.TreatmentPlanServices[i].ServiceTransaction.ProviderUserId
          );
          if (provider) {
            matchingProvider = provider.Locations.find(
              loc =>
                loc.ProviderTypeId === 1 &&
                loc.LocationId ===
                  tp.TreatmentPlanServices[i].ServiceTransaction.LocationId
            );
            if (matchingProvider) {
              // break the loop since we have a value
              i = tp.TreatmentPlanServices.length;
              defaultProvider =
                matchingProvider.ProviderOnClaimsRelationship === 2
                  ? matchingProvider.ProviderOnClaimsId
                  : provider.UserId;
            }
          }
        }
        // 2) if none found get ProviderOnClaims based on the first hygienist (ProviderTypeId = 2) in providers list that matches one of the services.ProviderUserId
        // and whose location matches the service.LocationId.  If match found use the ProviderOnClaims for that user
        if (defaultProvider === null) {
          for (i = 0; i < tp.TreatmentPlanServices.length; i++) {
            provider = providers.find(
              prov =>
                prov.UserId ===
                tp.TreatmentPlanServices[i].ServiceTransaction.ProviderUserId
            );
            if (provider) {
              matchingProvider = provider.Locations.find(
                loc =>
                  loc.ProviderTypeId === 2 &&
                  loc.LocationId ===
                    tp.TreatmentPlanServices[i].ServiceTransaction.LocationId
              );
              if (matchingProvider) {
                // break the loop since we have a value
                i = tp.TreatmentPlanServices.length;
                defaultProvider =
                  matchingProvider.ProviderOnClaimsRelationship === 2
                    ? matchingProvider.ProviderOnClaimsId
                    : provider.UserId;
              }
            }
          }
        }
        //3) if none get first provider.UserId in the provider list that is a dentist based on userLocation.ProviderTypeId = 1 and ProviderOnClaimsRelationship = 1
        if (defaultProvider === null) {
          for (i = 0; i < providers.length; i++) {
            matchingProvider = providers[i].Locations.find(
              loc =>
                loc.ProviderTypeId === 1 &&
                loc.ProviderOnClaimsRelationship === 1
            );
            if (matchingProvider) {
              // break the loop since we have a value
              defaultProvider = providers[i].UserId;
              i = providers[i].length;
            }
          }
        }
        // 4) if none get first provider.UserId in the provider list that is a hygeniest  based on userLocation.ProviderTypeId = 2 and ProviderOnClaimsRelationship = 1
        if (defaultProvider === null) {
          for (i = 0; i < providers.length; i++) {
            matchingProvider = providers[i].Locations.find(
              loc =>
                loc.ProviderTypeId === 2 &&
                loc.ProviderOnClaimsRelationship === 1
            );
            if (matchingProvider) {
              // break the loop since we have a value
              defaultProvider = providers[i].UserId;
              i = providers[i].length;
            }
          }
        }
        // 5) if none found broaden the search to include all ProviderTypeIds other than 4 and  then get first provider whose ProviderOnClaimsRelationship is 1
        if (defaultProvider === null) {
          for (i = 0; i < providers.length; i++) {
            matchingProvider = providers[i].Locations.find(
              loc =>
                loc.ProviderTypeId !== 4 &&
                loc.ProviderOnClaimsRelationship === 1
            );
            if (matchingProvider) {
              // break the loop since we have a value
              defaultProvider = providers[i].UserId;
              i = providers[i].length;
            }
          }
        }
        return defaultProvider;
      }
    };

    factory.getPredeterminationsForExistingPlans = function (
      returnObject,
      treatmentPlans
    ) {
      // do any plans have predeterminations
      var plansWithPredeterminations = _.filter(
        treatmentPlans,
        function (treatmentPlan) {
          return (
            treatmentPlan.TreatmentPlanHeader.HasAtLeastOnePredetermination ===
            true
          );
        }
      );
      // if so get predeterminations for these
      if (plansWithPredeterminations) {
        var promises = [];
        _.forEach(
          plansWithPredeterminations,
          function (planWithPredeterminations) {
            promises.push(
              factory.getPredeterminationsById(planWithPredeterminations)
            );
          }
        );
        $q.all(promises).then(function (res) {
          for (
            let index = 0;
            index < plansWithPredeterminations.length;
            index++
          ) {
            plansWithPredeterminations[index].Predeterminations =
              res[index].Value;
          }
          // update ExistingTreatmentPlans object
          returnObject.SetExistingTreatmentPlans(treatmentPlans);
          $rootScope.$broadcast('serviceHeadersUpdated');
        });
      }
    };

    // this method calculates whether a tp has a predetermination
    factory.hasPredetermination = function (tp) {
      var defer = $q.defer();
      var promise = defer.promise;
      var hasPredetermination = false;

      patientServices.Claim.getServiceTransactionIdsByPatient({
        patientId: tp.TreatmentPlanHeader.PersonId,
        statusCodes: [1, 2, 3, 4, 5, 6],
        isActual: false,
      }).$promise.then(
        function (res) {
          var servicesWithPredeterminations = res.Value;
          angular.forEach(tp.TreatmentPlanServices, function (tps) {
            if (
              servicesWithPredeterminations.indexOf(
                tps.ServiceTransaction.ServiceTransactionId
              ) !== -1
            ) {
              hasPredetermination = true;
            }
          });
          promise = $.extend(promise, {
            values: hasPredetermination,
          });
          defer.resolve(hasPredetermination);
        },
        function () {
          toastrFactory.error(
            localize.getLocalizedString('{0} failed to load.', [
              'Predeterminations',
            ]),
            localize.getLocalizedString('Server Error')
          );
        }
      );
      return promise;
    };

    //#endregion

    factory.addAreaToServices = function (treatmentPlanServices) {
      angular.forEach(treatmentPlanServices, function (tps) {
        if (tps.ServiceTransaction) {
          tps.ServiceTransaction.$$Area = null;
          if (tps.ServiceTransaction.SurfaceSummaryInfo != null) {
            tps.ServiceTransaction.$$Area =
              tps.ServiceTransaction.SurfaceSummaryInfo;
          } else if (tps.ServiceTransaction.RootSummaryInfo != null) {
            tps.ServiceTransaction.$$Area =
              tps.ServiceTransaction.RootSummaryInfo;
          }
        }
      });
      return treatmentPlanServices;
    };

    // gets a list of proposed services for a person
    factory.getServicesOnAppointments = function (treatmentPlanId, stageId) {
      if (
        patSecurityService.IsAuthorizedByAbbreviation(
          AmfaKeys.SoarClinCpsvcView
        )
      ) {
        var defer = $q.defer();
        var promise = defer.promise;
        patientServices.TreatmentPlans.ServicesOnAppointments({
          treatmentPlanId: treatmentPlanId,
          stageId: stageId,
        }).$promise.then(
          function (res) {
            promise = $.extend(promise, { values: res.Value });
            defer.resolve(res);
          },
          function () {
            toastrFactory.error(
              localize.getLocalizedString(
                'Failed to retrieve the list of {0}.',
                ['Services on Appointments']
              ),
              localize.getLocalizedString('Error')
            );
          }
        );
        return promise;
      }
    };

    // gets a list of proposed services for a person
    factory.getProposedServicesForAdd = function (personId) {
      if (
        patSecurityService.IsAuthorizedByAbbreviation(
          AmfaKeys.SoarClinCpsvcView
        )
      ) {
        var defer = $q.defer();
        var promise = defer.promise;
        patientServices.TreatmentPlans.ProposedServicesForAdd({
          Id: personId,
        }).$promise.then(
          function (res) {
            promise = $.extend(promise, { values: res.Value });
            defer.resolve(res);
          },
          function () {
            toastrFactory.error(
              localize.getLocalizedString(
                'Failed to retrieve the list of {0}.',
                ['Proposed Services']
              ),
              localize.getLocalizedString('Error')
            );
          }
        );
        return promise;
      }
    };

    // adds Priority to treatmentPlanService(s)
    factory.addPriorityToServices = function (
      treatmentPlanServices,
      nextPriority
    ) {
      _.forEach(treatmentPlanServices, function (tps) {
        tps.TreatmentPlanServiceHeader.Priority = nextPriority;
        nextPriority++;
      });
      return treatmentPlanServices;
    };

    // returns next Priority number for a selected treatment plan
    // if Priority has not been set on at least one of the services on the plan,
    // calls getDefaultPriorityOrder to set Priority on all services on the plan and then calculates next
    factory.getNextPriority = function (treatmentPlanId) {
      if (factory.hasTreatmentPlanEditAccess) {
        var defer = $q.defer();
        var promise = defer.promise;

        if (
          _.isNil(treatmentPlanId) ||
          treatmentPlanId.length === 0 ||
          treatmentPlanId === '00000000-0000-0000-0000-000000000000'
        ) {
          defer.resolve({ Value: 1 });
        } else {
          factory.getLastPriority(treatmentPlanId).then(function (res) {
            var nextPriorityNumber = res.Value;
            if (nextPriorityNumber === 0) {
              // indicates Priority has not been set on at least one of the services on the plan
              factory
                .getDefaultPriorityOrder(treatmentPlanId)
                .then(function (resolved) {
                  var treatmentPlanServicePriorityOrderDto = resolved.Value;
                  // get last priority for this set and add
                  var lastServicePriority = _.maxBy(
                    treatmentPlanServicePriorityOrderDto.ServicePriorities,
                    function (sp) {
                      return sp.Priority;
                    }
                  );
                  nextPriorityNumber = lastServicePriority.Priority + 1;
                  defer.resolve({ Value: nextPriorityNumber });
                });
            } else {
              nextPriorityNumber++;
              defer.resolve({ Value: nextPriorityNumber });
            }
          });
        }
        return promise;
      }
    };

    // saves one or more services to an existing treatment plan
    factory.saveServicesToExistingTreatmentPlan = function (
      personId,
      treatmentPlanId,
      treatmentPlanServices
    ) {
      if (factory.hasTreatmentPlanEditAccess) {
        var defer = $q.defer();
        var promise = defer.promise;
        patientServices.TreatmentPlans.addServices(
          { Id: personId, TreatmentPlanId: treatmentPlanId },
          treatmentPlanServices
        ).$promise.then(
          function (res) {
            promise = $.extend(promise, {
              values: res.Value,
            });
            defer.resolve(res);
            toastrFactory.success(
              localize.getLocalizedString(
                'The {0} has been added to your {1}',
                ['proposed service', 'treatment plan']
              ),
              localize.getLocalizedString('Success')
            );
          },
          function () {
            toastrFactory.error(
              localize.getLocalizedString(
                'Failed to update the {0}. Please try again.',
                ['treatment plan']
              ),
              localize.getLocalizedString('Server Error')
            );
          }
        );
        return promise;
      }
    };

    // determines whether the services on a treatment plan have been prioritized
    // used to decide whether we need to call for the defaultPriority
    factory.checkPriorityOnServices = function (activeTreatmentPlan) {
      if (_.isNil(activeTreatmentPlan)) {
        return false;
      } else {
        // if at least one service hasn't had the Priority set (indicated by default setting of 0) we need to update the list
        var servicesNotPrioritized = _.find(
          activeTreatmentPlan.TreatmentPlanServices,
          function (tps) {
            return tps.TreatmentPlanServiceHeader.Priority === 0;
          }
        );
        return _.isNil(servicesNotPrioritized) ? false : true;
      }
    };

    // load treatmentplanservices to the TreatmentPlanServicePriorityOrderDto
    factory.buildTreatmentPlanServicePriorityOrderDto = function (
      activeTreatmentPlan
    ) {
      if (factory.hasTreatmentPlanEditAccess) {
        var treatmentPlanServicePriorityOrderDto = {
          TreatmentPlanId:
            activeTreatmentPlan.TreatmentPlanHeader.TreatmentPlanId,
          DataTag: activeTreatmentPlan.TreatmentPlanHeader.DataTag,
          ServicePriorities: [],
        };

        // order services by Priority
        var treatmentPlanServices = $filter(
          'orderBy'
        )(activeTreatmentPlan.TreatmentPlanServices, [
          'TreatmentPlanServiceHeader.TreatmentPlanGroupNumber',
          'TreatmentPlanServiceHeader.Priority',
        ]);
        _.forEach(treatmentPlanServices, function (treatmentPlanService) {
          var treatmentPlanServicePriorityDto = {
            TreatmentPlanServiceId: null,
            Priority: null,
            DataTag: null,
          };
          treatmentPlanServicePriorityDto.TreatmentPlanServiceId =
            treatmentPlanService.TreatmentPlanServiceHeader.TreatmentPlanServiceId;
          treatmentPlanServicePriorityDto.Priority =
            treatmentPlanService.TreatmentPlanServiceHeader.Priority;
          treatmentPlanServicePriorityDto.TreatmentPlanGroupNumber =
            treatmentPlanService.TreatmentPlanServiceHeader.TreatmentPlanGroupNumber;
          treatmentPlanServicePriorityDto.DataTag =
            treatmentPlanService.TreatmentPlanServiceHeader.DataTag;
          treatmentPlanServicePriorityOrderDto.ServicePriorities.push(
            treatmentPlanServicePriorityDto
          );
        });
        return treatmentPlanServicePriorityOrderDto;
      }
    };

    // returns last Priority number in TreatmentPlanServices
    factory.getLastPriority = function (treatmentPlanId) {
      if (factory.hasTreatmentPlanEditAccess) {
        var defer = $q.defer();
        var promise = defer.promise;
        patientServices.TreatmentPlans.LastPriority({
          Id: treatmentPlanId,
        }).$promise.then(
          function (res) {
            promise = $.extend(promise, {
              values: res.Value,
            });
            defer.resolve(res);
            // TODO remove after testing
            // toastrFactory.success(localize.getLocalizedString('Get Last Priority update successful.'), localize.getLocalizedString('Success'));
          },
          function () {
            toastrFactory.error(
              localize.getLocalizedString(
                'Failed to get the {0}. Please try again.',
                ['Last Priority ']
              ),
              localize.getLocalizedString('Server Error')
            );
          }
        );
        return promise;
      }
    };

    // returns TreatmentPlanServicePriorityOrderDto
    factory.getDefaultPriorityOrder = function (treatmentPlanId) {
      if (factory.hasTreatmentPlanEditAccess) {
        var defer = $q.defer();
        var promise = defer.promise;
        patientServices.TreatmentPlans.DefaultPriorityOrder({
          Id: treatmentPlanId,
        }).$promise.then(
          function (res) {
            promise = $.extend(promise, {
              values: res.Value,
            });
            defer.resolve(res);
            // TODO remove after testing
            //toastrFactory.success(localize.getLocalizedString('{0} updated successfully.', ['Default Priority Order']), localize.getLocalizedString('Success'));
          },
          function () {
            toastrFactory.error(
              localize.getLocalizedString(
                'Failed to update the {0}. Please try again.',
                ['Default Priority Order']
              ),
              localize.getLocalizedString('Server Error')
            );
          }
        );
        return promise;
      }
    };

    // merges the treatmentPlanServicePriorityOrderDto.DataTag and Priority back to the activeTreatmentPlan
    factory.mergeTreatmentPlanServicePriorityOrderDtoToPlan = function (
      activeTreatmentPlan,
      treatmentPlanServicePriorityOrderDto
    ) {
      if (factory.hasTreatmentPlanEditAccess) {
        _.forEach(
          activeTreatmentPlan.TreatmentPlanServices,
          function (treatmentPlanService) {
            // find the matching record in the treatmentPlanServicePriorityOrderDto
            var matchingRecord = _.find(
              treatmentPlanServicePriorityOrderDto.ServicePriorities,
              function (servicePriority) {
                return (
                  servicePriority.TreatmentPlanServiceId ===
                  treatmentPlanService.TreatmentPlanServiceHeader
                    .TreatmentPlanServiceId
                );
              }
            );
            if (matchingRecord) {
              // update the DataTag in the service
              treatmentPlanService.TreatmentPlanServiceHeader.DataTag =
                matchingRecord.DataTag;
              treatmentPlanService.TreatmentPlanServiceHeader.Priority =
                matchingRecord.Priority;
              treatmentPlanService.TreatmentPlanServiceHeader.TreatmentPlanGroupNumber =
                matchingRecord.TreatmentPlanGroupNumber;
            }
          }
        );
        // update the DataTag in the header (may be the same, this is only updates if the SortSettings on the header changes)
        activeTreatmentPlan.TreatmentPlanHeader.DataTag =
          treatmentPlanServicePriorityOrderDto.DataTag;
      }
      return activeTreatmentPlan;
    };

    // persist PriorityOrder on services on treatment plan
    // returns TreatmentPlanServicePriorityOrderDto, use when reordering services
    factory.updatePriorityOrder = function (activeTreatmentPlan) {
      if (factory.hasTreatmentPlanEditAccess) {
        var defer = $q.defer();
        var promise = defer.promise;
        var treatmentPlanServicePriorityOrder = factory.buildTreatmentPlanServicePriorityOrderDto(
          activeTreatmentPlan
        );
        patientServices.TreatmentPlans.PriorityOrder(
          treatmentPlanServicePriorityOrder
        ).$promise.then(
          function (res) {
            promise = $.extend(promise, {
              values: res.Value,
            });
            defer.resolve(res);
            toastrFactory.success(
              localize.getLocalizedString('{0} updated successfully.', [
                'Priority Order',
              ]),
              localize.getLocalizedString('Success')
            );
          },
          function () {
            toastrFactory.error(
              localize.getLocalizedString(
                'Failed to update the {0}. Please try again.',
                ['Priority Order']
              ),
              localize.getLocalizedString('Server Error')
            );
          }
        );
        return promise;
      }
    };

    // helper method to create plan stages
    //This is only to be called when opening tx plan
    //treatmentPlansFactory.SetPlanStages($scope.planStages) needs called after calling this function to update Stages
    factory.loadPlanStages = function (
      treatmentPlanServices,
      includeMissingStages = true
    ) {
      var planStages = [];
      var uniqueGroupNumbers = [];

      //Get a list of Stage Group Numbers that are distinct that exist on the Treatment Plan Services
      //The ... is called a spread operator (It expands the set values into an array). The Set keyword is a collection of unique values and it removes duplicates
      //We put into that the list of property values we get from using map()
      uniqueGroupNumbers = [
        ...new Set(
          treatmentPlanServices.map(
            treatmentPlanServices =>
              treatmentPlanServices.TreatmentPlanServiceHeader
                .TreatmentPlanGroupNumber
          )
        ),
      ].sort((a, b) => a - b);
      //Populate planStages array with Existing Stages and any missing stages between the existing maximum stage number
      if (includeMissingStages === true) {
        for (
          var k = 0;
          k < uniqueGroupNumbers[uniqueGroupNumbers.length - 1];
          k++
        ) {
          var newStage = {};
          newStage.stageno = k + 1;
          planStages.push(newStage);
        }
      } else {
        for (var k = 0; k < uniqueGroupNumbers.length; k++) {
          var newStage = {};
          newStage.stageno = uniqueGroupNumbers[k];
          planStages.push(newStage);
        }
      }

      //This will populate the Stages with Services or Create Empty Stages that don't have services on them
      if (planStages.length != 0) {
        angular.forEach(planStages, function (pst) {
          pst.appointmentStatus = localize.getLocalizedString(
            'Create Unscheduled Appointment'
          );
          pst.AppointmentId = null;
          var stageServices = treatmentPlanServices.filter(function (item) {
            return (
              item.TreatmentPlanServiceHeader.TreatmentPlanGroupNumber ==
              pst.stageno
            );
          });
          angular.forEach(stageServices, function (stServ) {
            if (stServ.ServiceTransaction.AppointmentId != null) {
              pst.appointmentStatus = localize.getLocalizedString(
                'Unscheduled Appointment Created'
              );
              pst.AppointmentId = stServ.ServiceTransaction.AppointmentId;
            }
          });
        });
      }
      return planStages;
    };

    // notifies timeline that existingtreatmentplans list has changed
    factory.updateExistingTreatmentPlans = function (plans) {
      angular.forEach(
        factory.existingTreatmentPlansObserversForTimeline,
        function (observer) {
          observer(plans);
        }
      );
    };

    factory.sum = function (items, prop) {
      return items.reduce(function (a, b) {
        return a + b[prop];
      }, 0);
    };

    factory.calculateStageTotals = function (treatmentPlanServices, stages) {
      if (stages.length != 0) {
        _.forEach(stages, function (stage) {
          var servicesInStage = $filter('filter')(treatmentPlanServices, {
            TreatmentPlanServiceHeader: {
              TreatmentPlanGroupNumber: stage.stageno,
            },
            ServiceTransaction: { IsDeleted: false },
          });
          // service count totals for stage
          stage.ServiceCountForStage = servicesInStage
            ? servicesInStage.length
            : 0;

          stage.InsuranceEstTotalForStage = 0;
          stage.PatientPortionTotalForStage = 0;
          stage.AdjEstTotalForStage = 0;
          stage.TotalFeesForStage = 0;
          _.forEach(servicesInStage, function (treatmentPlanService) {
            if (treatmentPlanService.ServiceTransaction.InsuranceEstimates) {
              // do not include ServiceTransactions with IsDeleted === true or ServiceTransactionStatusId === 4 or ServiceTransactionStatusId === 3 or ServiceTransactionStatusId === 2 or 8 in totals
              if (
                treatmentPlanService.ServiceTransaction.IsDeleted !== true &&
                treatmentPlanService.ServiceTransaction
                  .ServiceTransactionStatusId !== 4 &&
                treatmentPlanService.ServiceTransaction
                  .ServiceTransactionStatusId !== 8 &&
                treatmentPlanService.ServiceTransaction
                  .ServiceTransactionStatusId !== 3 &&
                treatmentPlanService.ServiceTransaction
                  .ServiceTransactionStatusId !== 2
              ) {
                // total ins est per stage
                stage.InsuranceEstTotalForStage += factory.sum(
                  treatmentPlanService.ServiceTransaction.InsuranceEstimates,
                  'EstInsurance'
                );
                // total patient portion stage
                stage.PatientPortionTotalForStage +=
                  treatmentPlanService.ServiceTransaction.Amount;
                if (
                  treatmentPlanService.ServiceTransaction.InsuranceEstimates
                ) {
                  stage.PatientPortionTotalForStage -= factory.sum(
                    treatmentPlanService.ServiceTransaction.InsuranceEstimates,
                    'EstInsurance'
                  );
                  stage.PatientPortionTotalForStage -= factory.sum(
                    treatmentPlanService.ServiceTransaction.InsuranceEstimates,
                    'AdjEst'
                  );
                }
                // total ins est adj stage
                stage.AdjEstTotalForStage += factory.sum(
                  treatmentPlanService.ServiceTransaction.InsuranceEstimates,
                  'AdjEst'
                );
                // total fees stage
                stage.TotalFeesForStage +=
                  treatmentPlanService.ServiceTransaction.Fee -
                  treatmentPlanService.ServiceTransaction.Discount +
                  treatmentPlanService.ServiceTransaction.Tax;
              }
            }
          });
        });
      }
      return stages;
    };

    factory.updateActiveTreatmentPlan = function (plan) {
      angular.forEach(
        factory.activeTreatmentPlanObservers,
        function (observer) {
          observer(plan);
        }
      );
    };

    return {
      // properties
      ExistingTreatmentPlans: [],
      SetExistingTreatmentPlans: function (etps) {
        this.ExistingTreatmentPlans = etps;
        // set up treatment Plans in service.
        treatmentPlansService.setTreatmentPlans(etps);

        // notify observers
        factory.updateExistingTreatmentPlans(etps);
      },

      ActiveTreatmentPlan: null,
      TreatmentPlanCopy: null,
      SetActiveTreatmentPlan: function (atp) {
        var _factory = this;
        var planIsComplete = false;
        // don't set Priority on a completed treatment plan
        if (!_.isNil(atp) && atp.TreatmentPlanHeader.Status == 'Completed') {
          planIsComplete = atp.TreatmentPlanHeader.Status == 'Completed';
        }
        // check priority settings before continuing
        var servicesNeedPrioritized = factory.checkPriorityOnServices(atp);
        // if priority settings need to be set do that before setting active treatment plan

        if (servicesNeedPrioritized && planIsComplete === false) {
          // calculate and set the priority
          factory
            .getDefaultPriorityOrder(atp.TreatmentPlanHeader.TreatmentPlanId)
            .then(function (res) {
              var activeTreatmentPlan = factory.mergeTreatmentPlanServicePriorityOrderDtoToPlan(
                atp,
                res.Value
              );
              treatmentPlansService.setActiveTreatmentPlan(activeTreatmentPlan);
              _factory.ActiveTreatmentPlan = activeTreatmentPlan;
              _factory.TreatmentPlanCopy = _.cloneDeep(activeTreatmentPlan);
              // notify observers that ActiveTreatmentPlan has changed
              factory.updateActiveTreatmentPlan(_factory.ActiveTreatmentPlan);
            });
        } else {
          treatmentPlansService.setActiveTreatmentPlan(atp);
          _factory.ActiveTreatmentPlan = atp;
          _factory.TreatmentPlanCopy = _.cloneDeep(
            _factory.ActiveTreatmentPlan
          );
          // notify observers that ActiveTreatmentPlan has changed
          factory.updateActiveTreatmentPlan(atp);
        }

        // reset PredeterminationList when active plan changes
        _factory.PredeterminationList = [];
      },
      LastPriority: function (treatmentPlanId) {
        return factory.getLastPriority(treatmentPlanId);
      },
      DefaultPriorityOrder: function (activeTreatmentPlan) {
        var _factory = this;
        return factory
          .getDefaultPriorityOrder(
            activeTreatmentPlan.TreatmentPlanHeader.TreatmentPlanId
          )
          .then(function (res) {
            var treatmentPlan = _factory.mergeTreatmentPlanServicePriorityOrderDtoToPlan(
              activeTreatmentPlan,
              res.Value
            );
            return treatmentPlan;
          });
      },
      UpdatePriority: function (activeTreatmentPlan) {
        return factory.updatePriorityOrder(activeTreatmentPlan);
      },
      MergeTreatmentPlanServicePriorityOrderDtoToPlan: function (
        activeTreatmentPlan,
        treatmentPlanServicePriorityOrderDto
      ) {
        // merge reordering to activeTreatmentPlan
        var updatedTreatmentPlan = factory.mergeTreatmentPlanServicePriorityOrderDtoToPlan(
          activeTreatmentPlan,
          treatmentPlanServicePriorityOrderDto
        );
        // splice updatePlan to the ExistingTreatmentPlans
        var indx = _.findIndex(
          this.ExistingTreatmentPlans,
          function (treatmentPlan) {
            return (
              treatmentPlan.TreatmentPlanHeader.TreatmentPlanId ===
              updatedTreatmentPlan.TreatmentPlanHeader.TreatmentPlanId
            );
          }
        );
        if (indx > -1) {
          this.ExistingTreatmentPlans.splice(indx, 1);
          this.ExistingTreatmentPlans.push(updatedTreatmentPlan);
        }
        return updatedTreatmentPlan;
      },
      UpdateExistingTreatmentPlanList: function (activeTreatmentPlan) {
        // updates from save operations do not always set this value so we need to set it again to ensure the timeline will load correctly.
        activeTreatmentPlan.TreatmentPlanHeader.FullTreatmentPlanHasLoaded = true;
        // splice updatePlan to the ExistingTreatmentPlans
        var indx = _.findIndex(
          this.ExistingTreatmentPlans,
          function (treatmentPlan) {
            return (
              treatmentPlan.TreatmentPlanHeader.TreatmentPlanId ===
              activeTreatmentPlan.TreatmentPlanHeader.TreatmentPlanId
            );
          }
        );
        if (indx > -1) {
          this.ExistingTreatmentPlans.splice(indx, 1);
          this.ExistingTreatmentPlans.push(activeTreatmentPlan);
        }
      },
      SaveServicesToExistingTreatmentPlan: function (
        personId,
        treatmentPlanId,
        treatmentPlanServices
      ) {
        return factory.saveServicesToExistingTreatmentPlan(
          personId,
          treatmentPlanId,
          treatmentPlanServices
        );
      },
      NextPriority: function (treatmentPlanId) {
        return factory.getNextPriority(treatmentPlanId);
      },
      AddPriorityToServices: function (treatmentPlanServices, nextPriority) {
        return factory.addPriorityToServices(
          treatmentPlanServices,
          nextPriority
        );
      },
      AccountTreatmentPlans: [],
      SetAccountTreatmentPlans: function (actp) {
        this.AccountTreatmentPlans = actp;
      },

      NewTreatmentPlan: null,
      SetNewTreatmentPlan: function (ntp) {
        this.NewTreatmentPlan = ntp;
      },

      NewPlannedService: null,
      StageSelectedToMove: null,
      AddPlannedService: function (ps, stageno) {
        this.StageSelectedToMove = stageno;
        this.NewPlannedService = ps;
      },

      DataChanged: false,
      SetDataChanged: function (flag) {
        this.DataChanged = flag;
      },

        SavingPlan: false,

        LoadingPatientBenefitPlans: false,        
      AddingService: false,
      AddAreaToServices: function (treatmentPlanServices) {
        return factory.addAreaToServices(treatmentPlanServices);
      },
      Editing: false,
      SetEditing: function (flag) {
        this.Editing = flag;
      },
      RefreshTreatmentPlanServices: function (modifiedServices) {
        return factory.refreshTreatmentPlanServices(
          this.ExistingTreatmentPlans,
          modifiedServices
        );
      },
      RefreshTreatmentPlans: function (personId, treatmentPlanId) {
        // this method has some clean up to remove looping and assignment if nothing has changed.
        var returnObject = this;
        var currentTreatmentPlans = _.cloneDeep(
          returnObject.ExistingTreatmentPlans
        );
        // get the updated plan
        factory
          .getTreatmentPlanById(personId, treatmentPlanId)
          .then(function (res) {
            factory.planToUpdate = res.Value;

            // refresh list with updated plan
            returnObject.SetExistingTreatmentPlans(
              factory.refreshUpdatedPlan(currentTreatmentPlans, res)
            );
            // set active to trigger refresh on page
            returnObject.SetActiveTreatmentPlan(factory.planToUpdate);
            factory.planToUpdate = null;
          });
      },
      //#region Predeterminations
      SetInsuranceEstimateObjectState: function (tps) {
        return factory.setInsuranceEstimateObjectState(tps);
      },
      // Calculate ins est for all services on plan
      CalculateInsuranceEstimates: function (tp) {
        return factory.calculateInsuranceEstimates(tp);
      },
      // Calculate ins est for one service
      CalculateInsuranceEstimate: function (tp, serviceTransaction) {
        return factory.calculateInsuranceEstimate(tp, serviceTransaction);
      },
      CalculateInsuranceEstimateWithOverrides: function (
        tp,
        serviceTransaction,
        pbps
      ) {
        return factory.calculateInsuranceEstimateWithOverrides(
          tp,
          serviceTransaction,
          pbps
        );
      },
      CalculateInsuranceEstimatesWithOverride: function (tp) {
        return factory.calculateInsuranceEstimatesWithOverride(tp);
      },
      ResetEstimatedInsurance: function (tp) {
        return factory.resetEstimatedInsurance(tp);
      },
      GetPersonTxplans: function (PatientId) {
        return factory.getPersonTxplans(PatientId);
      },
      // Calculate ins est for multiple treatment plan services
      CalculateInsuranceEstimateOnServices: function (treatmentPlanServices) {
        return factory.calculateInsuranceEstimateOnServices(
          treatmentPlanServices
        );
      },

      // Calculate patient portion
      PatientPortion: function (tp) {
        return factory.setPatientPortion(tp);
      },
      // Allow user to create a predetermination
      AllowCreatePredetermination: function (tp) {
        return factory.allowCreatePredetermination(tp);
      },
      // Maintain a list for predetermination
      PredeterminationList: [],
      // Reset List to empty
      InitPredeterminationList: function () {
        return factory.initPredeterminationList();
      },
      UpdatePredeterminationList: function (treatmentPlanService, include) {
        this.PredeterminationList = factory.updatePredeterminationList(
          treatmentPlanService,
          include
        );
        return predeterminationList;
      },
      // subscribe to notes list changes
      ObservePredeterminationList: function (observer) {
        // should only have one callback
        if (factory.predetermationListObservers.length === 0) {
          factory.predetermationListObservers.push(observer);
          // indicates observer added
          return true;
        }
        // indicates already being observed
        return false;
      },
      ObserveExistingTreatmentPlansForTimeline: function (observer) {
        // should only have one callback
        if (factory.existingTreatmentPlansObserversForTimeline.length === 0) {
          factory.existingTreatmentPlansObserversForTimeline.push(observer);
          // indicates observer added
          return true;
        }
        // indicates already being observed
        return false;
      },
      ClearObservers: function () {
        factory.existingTreatmentPlansObserversForTimeline = [];
        factory.activeTreatmentPlanObservers = [];
        factory.predetermationListObservers = [];
      },

      // Does the tp have a predetermination
      HasPredetermination: function (tp) {
        return factory.hasPredetermination(tp);
      },
      // Create Predetermination
      CreatePredetermination: function (
        serviceTransactions,
        patientId,
        planOnPredetermination,
        providerOnPredetermination,
        treatmentPlanId
      ) {
        return factory.createPredetermination(
          serviceTransactions,
          patientId,
          planOnPredetermination,
          providerOnPredetermination,
          treatmentPlanId
        );
      },
      // Calculate providerOnPredetermination
      DefaultProviderOnPredetermination: function (tp, providers) {
        return factory.getDefaultProviderOnDetermination(tp, providers);
      },
      //#endregion
      // TODO Calculate planOnPredetermination

      // utility

      BuildTreatmentPlanDto: function (tph, personId) {
        return factory.buildTreatmentPlanDto(tph, personId);
      },

      BuildTreatmentPlanServiceDto: function (ps, personId, stage) {
        return factory.buildTreatmentPlanServiceDto(ps, personId, stage);
      },

      CollapseAll: function () {
        // not sure why we would reset the treatment plans here since this basically means we did not do anything and are just closing the view ...
        // look into this.
        this.SetExistingTreatmentPlans(
          factory.collapseAll(this.ExistingTreatmentPlans)
        );
      },

      LoadPlanStages: function (
        treatmentPlanServices,
        includeMissingStages = true
      ) {
        return factory.loadPlanStages(
          treatmentPlanServices,
          includeMissingStages
        );
      },

      GetTotalFees: function (tp) {
        return factory.getTotalFees(tp);
      },

      GetDaysAgo: function (tph) {
        return factory.getDaysAgo(tph);
      },

      CalculateStageTotals: function (treatmentPlanServices, stages) {
        return factory.calculateStageTotals(treatmentPlanServices, stages);
      },
      GetStageServices: function (tpp, tps) {
        return factory.getstageServices(tpp, tps);
      },

      GetTxPlanFlags: function (serviceCodes) {
        return factory.checkForAsscociatedTxPlans(serviceCodes);
      },

      // crud

      CreateWithNoReload: function (ps, personId, stage) {
        var returnObject = this;
        return factory.create(
          ps,
          returnObject.NewTreatmentPlan,
          personId,
          false,
          stage
        );
      },

      Create: function (ps, personId, isDuplicatePlan, ntp) {
        var returnObject = this;
        var tmpTreatmentPlan;
        if (isDuplicatePlan) {
          tmpTreatmentPlan = ntp;
        } else {
          tmpTreatmentPlan = returnObject.NewTreatmentPlan;
        }
        factory
          .create(ps, tmpTreatmentPlan, personId, isDuplicatePlan)
          .then(function (res) {
            if (res && res.Value) {
              var plan = res.Value;
              plan.TreatmentPlanHeader.TotalFees = factory.getTotalFees(plan);
              plan.TreatmentPlanHeader.FullTreatmentPlanHasLoaded = true;
              returnObject.SetActiveTreatmentPlan(plan);
              returnObject.SetNewTreatmentPlan(null);
              returnObject.ExistingTreatmentPlans.push(plan);
              returnObject.SavingPlan = false;
              returnObject.SetDataChanged(false);
            }
          });
      },
      // loads tx headers only
      Headers: function (personId) {
        return factory.getAllHeaders(personId);
      },

      GetPredeterminationsById: function (tp) {
        return factory.getPredeterminationsById(tp);
      },

      //// WorkingOnThis
      // NOTE adding treatmentPlanHeader.CreatedDate & AlternateGroupId, needed for sorting and grouping
      GetAllHeaders: function (personId, getDetail) {
        var returnObject = this;

        var plans = []; // temp variable
        if (!_.isNil(personId)) {
          patientServices.TreatmentPlans.getTreatmentPlansWithServicesByPersonId(
            {
              Id: personId,
            }
          ).$promise.then(function (res) {
            if (res && res.Value) {
              var millisecondsInADay = 1000 * 60 * 60 * 24;
              var today = new Date();
              _.forEach(res.Value, function (tp) {
                var createdDate = new Date(tp.TreatmentPlanHeader.CreatedDate);
                var daysAgo = Math.round(
                  (today - createdDate) / millisecondsInADay
                );

                var treatmentPlanHeader = {
                  TreatmentPlanId: tp.TreatmentPlanHeader.TreatmentPlanId,
                  PersonId: personId,
                  CreatedDate: tp.TreatmentPlanHeader.CreatedDate,
                  AlternateGroupId: tp.TreatmentPlanHeader.AlternateGroupId,
                  Status: tp.TreatmentPlanHeader.Status,
                  TreatmentPlanName: tp.TreatmentPlanHeader.TreatmentPlanName,
                  RejectedReason: tp.TreatmentPlanHeader.RejectedReason,
                  Note: tp.TreatmentPlanHeader.Note,
                  TotalFees: 0,
                  HasAtLeastOnePredetermination:
                    tp.TreatmentPlanHeader.HasAtLeastOnePredetermination,
                  DaysAgo: daysAgo,
                  SortSettings: tp.TreatmentPlanHeader.SortSettings,
                  FullTreatmentPlanHasLoaded: false,
                  Predeterminations: [],
                  IsRecommended: tp.TreatmentPlanHeader.IsRecommended,
                  DataTag: tp.TreatmentPlanHeader.DataTag,
                };
                var current = {
                  TreatmentPlanHeader: treatmentPlanHeader,
                  TreatmentPlanServices: tp.TreatmentPlanServices,
                };

                plans.push(current);
              });
            }
            // get users then get treatment plans
            usersFactory.Users().then(function (res) {
              if (_.isEmpty(res) || _.isEmpty(res.Value)) {
                return;
              }

              var localUsers = res.Value;
              _.forEach(plans, function (plan) {
                // tacking on user codes to objects
                _.forEach(plan.TreatmentPlanServices, function (tps) {
                  if (tps.ServiceTransaction) {
                    tps.ServiceTransaction.$$Area = null;
                    if (tps.ServiceTransaction.SurfaceSummaryInfo != null) {
                      tps.ServiceTransaction.$$Area =
                        tps.ServiceTransaction.SurfaceSummaryInfo;
                    } else if (tps.ServiceTransaction.RootSummaryInfo != null) {
                      tps.ServiceTransaction.$$Area =
                        tps.ServiceTransaction.RootSummaryInfo;
                    }

                    var provider = _.find(localUsers, {
                      UserId: tps.ServiceTransaction.ProviderUserId,
                    });
                    if (!_.isEmpty(provider)) {
                      tps.ServiceTransaction.UserCode = provider.UserCode;
                    }
                  }
                });

                plan.TreatmentPlanHeader.TotalFees = factory.getTotalFees(plan);
                plan.TreatmentPlanHeader.FullTreatmentPlanHasLoaded = true;
              });

              // get predetermination information for plans that have Predeterminations
              factory.getPredeterminationsForExistingPlans(returnObject, plans);
              returnObject.SetExistingTreatmentPlans(plans);
              $rootScope.$broadcast('serviceHeadersUpdated');
            });
          });
        }
      },

      GetTreatmentPlanById: function (personId, txplanId) {
        return factory.getTreatmentPlanById(personId, txplanId);
      },

      GetCount: function (personId) {
        return factory.getCount(personId);
      },

      GetAllAccountMembers: function (accountId) {
        return factory.getAllAccountMembers(accountId);
      },

      GetAllAccountTreatmentPlans: function (id) {
        return factory.getAllAccountTxPlans(id);
      },

      // for unit testing internal function use only
      GetTreatmentPlanHeaderUpdateOnlyDto: function (
        activeTreatmentPlan,
        updateStatus
      ) {
        return factory.getTreatmentPlanHeaderUpdateOnlyDto(
          activeTreatmentPlan,
          updateStatus
        );
      },

      // for unit testing internal function use only
      MergeTreatmentPlanHeaderUpdateOnlyDto: function (
        activeTreatmentPlan,
        res
      ) {
        return factory.mergeTreatmentPlanHeaderUpdateOnlyDto(
          activeTreatmentPlan,
          res
        );
      },

      Update: function (plan, statusUpdate) {
        factory.planToUpdate = plan;
        var updateStatus = statusUpdate ? statusUpdate : false;
        var returnObject = this;
        factory.update(updateStatus).then(function (res) {
          var currentTreatmentPlans = _.cloneDeep(
            returnObject.ExistingTreatmentPlans
          );
          // always refresh the activeTreatmentPlan
          returnObject.SetExistingTreatmentPlans(
            factory.refreshUpdatedPlan(currentTreatmentPlans, res)
          );
          // if a txPlan is Accepted, do a get on all the alternates so that they show their new status of Rejected
          if (res.Value.Status === 'Accepted') {
            _.forEach(currentTreatmentPlans, function (plan) {
              if (
                plan.TreatmentPlanHeader.TreatmentPlanId !==
                  res.Value.TreatmentPlanId &&
                plan.TreatmentPlanHeader.AlternateGroupId ===
                  res.Value.AlternateGroupId
              ) {
                factory
                  .getTreatmentPlanById(
                    plan.TreatmentPlanHeader.PersonId,
                    plan.TreatmentPlanHeader.TreatmentPlanId
                  )
                  .then(function (res) {
                    factory.planToUpdate = plan;
                    var response = {};
                    // refreshUpdatedPlan only expects the header, doing this rather than write a new method or convolute that one
                    response.Value = res.Value.TreatmentPlanHeader;
                    currentTreatmentPlans = factory.refreshUpdatedPlan(
                      currentTreatmentPlans,
                      response
                    );
                  });
              }
            });

            returnObject.SetExistingTreatmentPlans(currentTreatmentPlans);
          } else {
            returnObject.SetExistingTreatmentPlans(
              factory.refreshUpdatedPlan(currentTreatmentPlans, res)
            );
          }
          returnObject.SetActiveTreatmentPlan(factory.planToUpdate);
          factory.planToUpdate = null;
        });
      },

      Delete: function (plan, removeServicesFromAppt) {
        factory.planMarkedForDeletion = plan;
        var returnObject = this;
        factory.delete(removeServicesFromAppt).then(function (res) {
          returnObject.SetExistingTreatmentPlans(
            factory.removePlanFromExistingList(
              returnObject.ExistingTreatmentPlans
            )
          );
          returnObject.SetActiveTreatmentPlan(null);
          factory.planMarkedForDeletion = null;
          $rootScope.$broadcast('TreatmentPlansUpdated');
        });
      },
      // determine whether services should be deleted on delete of treatment plan services
      ShouldPromptToRemoveServicesFromAppointment: function (
        treatmentPlan,
        stage,
        servTransId
      ) {
        return factory.shouldPromptToRemoveServicesFromAppointment(
          treatmentPlan,
          stage,
          servTransId,
          this.ExistingTreatmentPlans
        );
      },
      RemoveService: function (
        plan,
        treatmentPlanServiceId,
        removeServiceFromAppointment
      ) {
        var returnObject = this;
        return factory
          .removeService(
            plan,
            treatmentPlanServiceId,
            removeServiceFromAppointment
          )
          .then(function () {
            returnObject.SetActiveTreatmentPlan(
              factory.removeSerivceFromPlan(
                plan,
                treatmentPlanServiceId,
                returnObject
              )
            );
            returnObject.ActiveTreatmentPlan.TreatmentPlanHeader.TotalFees = factory.getTotalFees(
              returnObject.ActiveTreatmentPlan
            );

            if (removeServiceFromAppointment) {
              factory
                .resetPatientAppointments(plan.TreatmentPlanHeader.PersonId)
                .then(function (res) {
                  returnObject.SetPatientAppointments(res.Value);
                });
            }
          });
      },

      UpdateServiceHeader: function (
        plan,
        treatmentPlanService,
        stageno,
        appointmentId
      ) {
        return factory.updateTreatmentPlanServiceHeader(
          plan,
          treatmentPlanService,
          stageno,
          appointmentId
        );
      },
      GetActiveTreatmentPlanNextGroupNumber: function (plan) {
        return factory.getActiveTreatmentPlanNextGroupNumber(plan);
      },
      GetNextStageNumber: function (planStage) {
        return factory.getNextStageNumber(planStage);
      },

      DeleteStage: function (plan, stageNumber, removeServicesFromAppt) {
        var returnObject = this;
        this.RemovePlanStage(stageNumber);

        return factory
          .deleteStage(plan, stageNumber, removeServicesFromAppt)
          .then(function (res) {
            var services = angular.copy(plan.TreatmentPlanServices);
            angular.forEach(services, function (ps, index) {
              if (
                ps.TreatmentPlanServiceHeader.TreatmentPlanGroupNumber ==
                stageNumber
              ) {
                factory.removeDeletedTPSFromPlan(
                  plan,
                  ps.TreatmentPlanServiceHeader.TreatmentPlanServiceId
                );
                returnObject.ActiveTreatmentPlan.TreatmentPlanHeader.TotalFees = factory.getTotalFees(
                  returnObject.ActiveTreatmentPlan
                );
              }
            });
            factory.arrangeServices(plan, stageNumber, returnObject);
            returnObject.SetActiveTreatmentPlan(plan);
          });
      },
      CreateUnscheduleAppointment: function (plan, services, stageNumber) {
        return factory.createUnscheduleAppointment(plan, services, stageNumber);
      },
      CreateAppointments: function (personId, treatmentPlanId, stages) {
        return factory.createAppointements(personId, treatmentPlanId, stages);
      },
      AppointmentServices: [],
      ClearAppointmentServices: function () {
        this.AppointmentServices = [];
      },
      SetAppointmentServices: function (proposedServices) {
        this.AppointmentServices = proposedServices;
      },
      PlanStages: [],
      //Set the Treatment Plan Stages
      SetPlanStages: function (planStages) {
        this.PlanStages = planStages;
      },
      //Get the Treatment Plan Stages
      GetPlanStages: function () {
        return this.PlanStages;
      },
      RemovePlanStage: function (stageNumber) {
        for (var i = 0; i < this.PlanStages.length; ++i) {
          if (this.PlanStages[i].stageno > stageNumber) {
            // stage after deleted, just decrement the stage number
            this.PlanStages[i].stageno = this.PlanStages[i].stageno - 1;
          } else if (this.PlanStages[i].stageno === stageNumber) {
            // this is the stage to delete, splice it out,
            // then decrement the index so the new element now at the index gets processed
            this.PlanStages.splice(i, 1);
            --i;
          }
        }
      },
      PatientAppointments: [],
      SetPatientAppointments: function setPatientAppointments(appts) {
        this.PatientAppointments = appts;
      },
      ClearCache: function () {
        patCacheFactory.ClearCache(
          patCacheFactory.GetCache('PatientTreatmentPlans')
        );
      },
      ProposedServicesForAdd: function (personId) {
        return factory.getProposedServicesForAdd(personId);
      },
      ServicesOnAppointments: function (treatmentPlanId, stageId) {
        return factory.getServicesOnAppointments(treatmentPlanId, stageId);
      },
      ObserveActiveTreatmentPlan: function (observer) {
        // should only have one callback
        if (factory.activeTreatmentPlanObservers.length === 0) {
          factory.activeTreatmentPlanObservers.push(observer);
          // indicates observer added
          return true;
        }
        // indicates already being observed
        return false;
      },
    };
  }
})();
