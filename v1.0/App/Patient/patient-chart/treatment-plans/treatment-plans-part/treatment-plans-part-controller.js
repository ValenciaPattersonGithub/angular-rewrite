'use strict';
angular
  .module('Soar.Patient')
  // parts are renamed to stages
  .controller('TreatmentPlansStageController', [
    '$scope',
    '$q',
    'localize',
    'ListHelper',
    '$routeParams',
    '$rootScope',
    'PatientServices',
    'locationService',
    'UserServices',
    'UsersFactory',
    'toastrFactory',
    '$filter',
    'soarAnimation',
    'patSecurityService',
    'StaticData',
    'ModalFactory',
    'TreatmentPlansFactory',
    '$route',
    '$timeout',
    '$location',
    'ScheduleServices',
    'PatientLogic',
    'ModalDataFactory',
    'ResourceService',
    'ApiDefinitions',
    'PatientOdontogramFactory',
    'PatientServicesFactory',
    'TimeZoneFactory',
    'SaveStates',
    'referenceDataService',
    'userSettingsDataService',
    'FinancialService',
    'AppointmentViewVisibleService',
    'AppointmentViewDataLoadingService',
    'FeatureFlagService',
    'FuseFlag',
    'schedulingMFENavigator',
    function (
      $scope,
      $q,
      localize,
      listHelper,
      $routeParams,
      $rootScope,
      patientServices,
      locationService,
      userServices,
      usersFactory,
      toastrFactory,
      $filter,
      soarAnimation,
      patSecurityService,
      staticData,
      modalFactory,
      treatmentPlansFactory,
      $route,
      $timeout,
      $location,
      scheduleServices,
      patientLogic,
      modalDataFactory,
      resourceService,
      apiDefinitions,
      patientOdontogramFactory,
      patientServicesFactory,
      timeZoneFactory,
      saveStates,
      referenceDataService,
      userSettingsDataService,
      financialService,
      appointmentViewVisibleService,
      appointmentViewDataLoadingService,
      featureFlagService,
      fuseFlag,
      schedulingMFENavigator,
    ) {
      var ctrl = this;

      $scope.popOverTracker = {
        closeAllFeeChange: false,
        closeAllEstIns: false,
        };
        $scope.loadingPatientBenefitPlans = false;

      ctrl.$onInit = function () {
        ctrl.patientAppointments = treatmentPlansFactory.PatientAppointments;

        $scope.treatmentPlanAddServiceAmfa = 'soar-clin-cplan-asvccd';
        $scope.modalIsOpen = false;
        $scope.showAppointmentAfterLoad = false;
        ctrl.loadProviders();
        $scope.insuranceEstimatePartTotal = 0;
        $scope.serviceTransactionStatuses = [];
        $scope.adjustedEstimatePartTotal = 0;
        $scope.patientPortionPartTotal = 0;
        $scope.servicesToAddToAppt = 0;
        $scope.totalFeesPerStage = 0;
        $scope.totalDiscountsPerStage = 0;
        $scope.totalTaxPerStage = 0;
        $scope.totalAmountPerStage = 0;
        $scope.disableEditFunctions = false;
        $scope.linkToScheduleV2 = false;
        featureFlagService.getOnce$(fuseFlag.ShowScheduleV2).subscribe((value) => {
          $scope.linkToScheduleV2 = value;
        });
        featureFlagService.getOnce$(fuseFlag.ShowScheduleV2Alt).subscribe((value) => {
          if (!$scope.linkToScheduleV2) {$scope.linkToScheduleV2 = value}
        });

        $scope.stageSelectAllCheckboxId = `stage-${$scope.stageIndex}-select-all-checkbox`;
        $scope.stageSelectAllCheckboxVisible = true; // visible by default. will get set to false if the stage has no services
        $scope.stageSelectAllCheckboxValue = true; // initialize to true
        //closes tooth
        $rootScope.$emit('toothClose', {});

        // need to ensure this is loaded early we need to move the location setup to the beginning of fuse but that is not simple and would take more time right now.
        // going try this for today instead.
      };

      $scope.toggleSelectAllStageCheckbox = function (
        proposedServicesForStage,
        currentStageSelectAllCheckboxValue
      ) {
        //$scope.stageSelectAllCheckboxValue = !$scope.stageSelectAllCheckboxValue;
        $scope.stageSelectAllCheckboxValue = currentStageSelectAllCheckboxValue;

        // we're here after a checkbox to select/deselect all is clicked for a _stage_
        for (let i = 0; i < proposedServicesForStage.length; i++) {
          let service = proposedServicesForStage[i];

          // this might be null/undefined
          // we still want execution to fall in here if it's false, so a truthy check won't work
          if (
            service.ServiceTransaction.$$IncludeInAppointment !== null &&
            service.ServiceTransaction.$$IncludeInAppointment !== undefined
          ) {
            service.ServiceTransaction.$$IncludeInAppointment =
              $scope.stageSelectAllCheckboxValue;
          }

          $scope.addToApptChbxChecked(service.ServiceTransaction);

          // do we need to set service.ServiceTransaction.$$IncludeInAppointment here too?
        }
      };

      ctrl.setServiceStatus = function (st) {
        if (!_.isEmpty($scope.serviceTransactionStatuses)) {
          if (_.isUndefined(st)) {
            if (
              !_.isUndefined($scope.proposedServicesForStage) &&
              !_.isEmpty($scope.proposedServicesForStage)
            ) {
              _.forEach($scope.proposedServicesForStage, function (service) {
                service.ServiceTransaction.$$statusName =
                  service.ServiceTransaction.IsDeleted === true
                    ? localize.getLocalizedString('Deleted')
                    : _.filter($scope.serviceTransactionStatuses, {
                        Id:
                          service.ServiceTransaction.ServiceTransactionStatusId,
                      })[0].Name;
                service.ServiceTransaction.$$CreatedDate = $filter(
                  'toShortDisplayDateUtc'
                )(service.ServiceTransaction.CreatedDate);
              });
            }
          } else {
            st.ServiceTransaction.$$statusName =
              st.ServiceTransaction.IsDeleted === true
                ? localize.getLocalizedString('Deleted')
                : _.filter($scope.serviceTransactionStatuses, {
                    Id: st.ServiceTransaction.ServiceTransactionStatusId,
                  })[0].Name;
            return st.ServiceTransaction.$$statusName;
          }
        }
      };

      // get a list of available service transaction statuses
      ctrl.getServiceTransactionStatuses = function () {
        if (!_.isUndefined(staticData)) {
          staticData.ServiceTransactionStatuses().then(function (res) {
            if (!_.isUndefined(res) && !_.isEmpty(res)) {
              $scope.serviceTransactionStatuses = res.Value;
              ctrl.setServiceStatus();
            }
          });
        }
      };

      ctrl.getServiceTransactionStatuses();

      // listening for changes to PatientAppointments
      $scope.$watch(
        function () {
          return treatmentPlansFactory.PatientAppointments;
        },
        function (nv) {
          ctrl.patientAppointments = nv;
          if ($scope.proposedServicesForStage) {
            ctrl.getScheduledStatus($scope.proposedServicesForStage);
          }
        }
        );

        $scope.$watch(
            function () {
                return treatmentPlansFactory.LoadingPatientBenefitPlans;
            },
            function (nv) {
                $scope.loadingPatientBenefitPlans = nv
            }
        );

      ctrl.getSum = function (items, prop) {
        return items.reduce(function (a, b) {
          return a + b[prop];
        }, 0);
      };
      $scope.serviceAmountTotal = function (services) {
        var sum = 0;
        if (services) {
          for (var i = 0; i <= services.length - 1; i++) {
            sum += services[i].ServiceTransaction.Fee;
          }
        }
        return sum;
      };

      ctrl.getScheduledStatus = function (proposedServices) {
        angular.forEach(proposedServices, function (ps) {
          if (ps.ServiceTransaction.AppointmentId) {
            var appt = $scope.getAppointment(
              ps.ServiceTransaction.AppointmentId
            );
            ctrl.appendRoute(appt);
            if (appt) {
              if (appt.StartTime !== null && appt.Status !== 3) {
                ps.ServiceTransaction.ScheduledStatus = $filter(
                  'toShortDisplayDateUtc'
                )(appt.StartTime);
              } else {
                if (appt.Status === 3) {
                  ps.ServiceTransaction.ScheduledStatus = localize.getLocalizedString(
                    'Completed'
                  );
                  ps.ServiceTransaction.$$DateCompleted = $filter(
                    'toShortDisplayDateUtc'
                  )(appt.DateModified);
                } else {
                  ps.ServiceTransaction.ScheduledStatus = localize.getLocalizedString(
                    'Unscheduled'
                  );
                }
                ps.ServiceTransaction.AppointmentRoute =
                  appt.StartTime != null
                    ? appt.Route
                    : '#/Schedule/?open=' +
                      appt.AppointmentId +
                      '&unscheduled=true';
                ps.ServiceTransaction.ApptClassification =
                  appt.StartTime != null ? 0 : 2;
                var startPM = new Date(appt.StartTime).getHours() > 11;
                var endPM = new Date(appt.EndTime).getHours() > 11;
                var startTimeFormat =
                  startPM == endPM
                    ? 'MMM dd, yyyy h:mm'
                    : 'MMM dd, yyyy h:mm a';
                ps.ServiceTransaction.FormattedDateTime =
                  $filter('date')(appt.StartTime, startTimeFormat) +
                  '-' +
                  $filter('date')(new Date(appt.EndTime + 'Z'), 'h:mm a');
              }
            }
          }
          ctrl.setServiceStatus(ps);
        });
      };

      $scope.getDs = function (n) {
        if (ctrl.patientAppointments.length > 0) {
          ctrl.getScheduledStatus($scope.proposedServices);
        }
        var r = angular.copy(
          $filter('filter')($scope.proposedServices, {
            TreatmentPlanServiceHeader: { TreatmentPlanGroupNumber: n },
          })
        );
        return r;
      };

      /**
       * add $$Area column dynamically.
       *
       * @param {*} treatmentPlanServices
       * @returns {angular.IPromise}
       */
      ctrl.addAreaToServices = function (treatmentPlanServices) {
        return referenceDataService
          .getData(referenceDataService.entityNames.locations)
          .then(function (locations) {
            var addArea = false;
            angular.forEach(
              treatmentPlanServices,
              function (treatmentPlanService) {
                if (!treatmentPlanService.ServiceTransaction.$$Area) {
                  addArea = true;
                }
                let ofcLocation = listHelper.findItemByFieldValue(
                  locations,
                  'LocationId',
                  treatmentPlanService.ServiceTransaction.LocationId
                );
                treatmentPlanService.ServiceTransaction.LocationName =
                  ofcLocation.NameLine1;
                treatmentPlanService.ServiceTransaction.DisplayName =
                  ofcLocation.NameAbbreviation;
              }
            );
            if (addArea) {
              treatmentPlansFactory.AddAreaToServices(treatmentPlanServices);
            }
          });
      };

      // NOTE: this also controls if the stage select all checkbox is visible or not.
      ctrl.stageCheckboxIsChecked = function (stageIndexInput) {
        let stageIndex = parseInt(stageIndexInput);

        // i'm not sure how many times this will get executed as the page loads.
        // it's more than one. ssometimes, the proposedServices won't be in the planStages object
        // so to be safe, let's get them from $scope.proposedServices
        let stageServices = $scope.proposedServices.filter(service => {
          return (
            service.TreatmentPlanServiceHeader.TreatmentPlanGroupNumber ===
            stageIndex
          );
        });

        if (stageServices.length === 0) {
          // this stage has no services, so we hide the checkbox
          $scope.stageSelectAllCheckboxVisible = false;
          return false;
        } else {
          $scope.stageSelectAllCheckboxVisible = true;
        }

        // get all the services that have the 'include in appt' checkbox checked
        let includeInApptServicesForStage = stageServices.filter(service => {
          // most of the time, the ServiceTransaction will have a true/false value set in $$IncludeInAppointment
          // if that exists, key off that
          if (
            service.ServiceTransaction.$$IncludeInAppointment !== null &&
            service.ServiceTransaction.$$IncludeInAppointment !== undefined
          ) {
            return service.ServiceTransaction.$$IncludeInAppointment;
          }
        });

        // all the services that are eligible to be included in an appt for this stage
        let servicesEligibleToBeIncludedInAppt = stageServices.filter(
          service => {
            // if $$IncludeInAppointment is not there, then we need to determine if the service will be included in the appointment another way
            switch (service.ServiceTransaction.ServiceTransactionStatusId) {
              case 1: // proposed
              case 7: // accepted
                return true;
              case 2: // referred
              case 3: // rejected
              case 8: // referred completed
                return false;
              default:
                // we shouldn't hit here
                return false;
            }
          }
        );

        // if all of this stage's eligible services should be included in the appt, set this stage's bool to true
        // so the 'select all' checkbox for the stage starts off as checked
        if (
          includeInApptServicesForStage.length ===
          servicesEligibleToBeIncludedInAppt.length
        ) {
          return true;
        }

        // else, return false
        return false;
      };

      // the grid uses proposedServicesForStage, keeping it updated with fresh data here
      $scope.$watch(
        'proposedServices',
        function (nv, ov) {
          if (nv) {
            // removing angular.copy
            var servicesForStage = $filter('filter')(
              nv,
              {
                TreatmentPlanServiceHeader: {
                  TreatmentPlanGroupNumber: $scope.stage.stageno,
                },
              },
              true
            );

            ctrl.initCheckboxesForAppt(servicesForStage);

            // initialize checkboxes to checked by default and set tp.ServiceTransaction.$$IncludeInAppointment to match
            $scope.stageSelectAllCheckboxValue = ctrl.stageCheckboxIsChecked(
              $scope.stage.stageno
            );

            ctrl.addAreaToServices(servicesForStage).then(function () {
              $scope.setScheduleOption(servicesForStage);
              ctrl.getScheduledStatus(servicesForStage);
              ctrl.calculateStageTotals(servicesForStage);
              ctrl.disableAppointmentButton($scope.proposedServices);
              ctrl.disableSendPredetermination($scope.proposedServices);
              $scope.$emit(
                'soar-is-plan-duplicatable',
                $scope.proposedServices
              );
              $scope.$emit(
                'soar-disable-create-appointment-button',
                $scope.isAppointmentCreate
              );
              $scope.$emit(
                'soar-disable-send-predetermination-button',
                $scope.isSendPredetermination
              );

              let tempSumTotals = {
                DiscountTotal: 0,
                TaxTotal: 0,
                feeTotal: 0,
                allowedAmountTotal: 0,
                estimatedInsuranceAdjustmentTotal: 0,
                chargesTotal: 0,
                estimatedInsuranceTotal: 0,
                estimatedPatientBalanceTotal: 0,
              };

              angular.forEach(servicesForStage, function (ps) {
                // need to get the full names of the providers
                ctrl.getUserCode(ps.ServiceTransaction);

                // allowed amount is often null we need it to be populated with a numeric value thus is override.
                if (ps.ServiceTransaction.AllowedAmount === null) {
                  ps.ServiceTransaction.AllowedAmount = 0;
                }

                // set the checkboxDisabled propert for the service
                ps.ServiceTransaction.checkboxDisabled = false;

                // summing the currency fields
                tempSumTotals.DiscountTotal += ps.ServiceTransaction.Discount;
                tempSumTotals.TaxTotal += ps.ServiceTransaction.Tax;
                tempSumTotals.feeTotal += ps.ServiceTransaction.Fee;
                tempSumTotals.allowedAmountTotal +=
                  ps.ServiceTransaction.AllowedAmount;
                tempSumTotals.estimatedInsuranceAdjustmentTotal +=
                  ps.ServiceTransaction.$$AdjEst;
                tempSumTotals.chargesTotal += ps.ServiceTransaction.Amount;
                tempSumTotals.estimatedInsuranceTotal +=
                  ps.ServiceTransaction.$$EstInsurance;
                tempSumTotals.estimatedPatientBalanceTotal +=
                  ps.ServiceTransaction.$$PatientPortion;
              });
              // need this to find how to edit the fields yet

              // sorting and loading data to scope
              $scope.stageTotals = tempSumTotals;
              $scope.proposedServicesForStage = $filter('orderBy')(
                servicesForStage,
                [
                  'TreatmentPlanServiceHeader.TreatmentPlanGroupNumber',
                  'TreatmentPlanServiceHeader.Priority',
                ],
                true
              );
            });
          }
        },
        true
      );

      // the grid uses proposedServicesForStage, keeping it updated with fresh data here
      $scope.$watch(
        'patientAppointments',
        function (nv, ov) {
          if (nv) {
            if ($scope.proposedServicesForStage)
              ctrl.getScheduledStatus($scope.proposedServicesForStage);
          }
        },
        true
      );

      $scope.createUnscheduledAppointment = function (plan, stage) {
        if (stage.AppointmentId == null) {
          var stageNumber = stage.stageno;
          var servicesInStage = $filter('filter')(plan.TreatmentPlanServices, {
            TreatmentPlanServiceHeader: {
              TreatmentPlanGroupNumber: stageNumber,
            },
          });
          treatmentPlansFactory
            .CreateUnscheduleAppointment(plan, servicesInStage, stageNumber)
            .then(function (res) {
              if (res.Value.length > 0) {
                angular.forEach(servicesInStage, function (v) {
                  angular.forEach(res.Value, function (response) {
                    var item = listHelper.findItemByFieldValue(
                      response.ServiceTransactions,
                      'ServiceTransactionId',
                      v.ServiceTransaction.ServiceTransactionId
                    );
                    if (item) {
                      v.ServiceTransaction.DataTag = item.DataTag;
                      v.ServiceTransaction.AppointmentId = item.AppointmentId;
                    }
                  });
                });
                $rootScope.$broadcast(
                  'soar:tx-plan-services-changed',
                  servicesInStage,
                  true
                );
                scheduleServices.Lists.Appointments.GetAppointmentById(
                  { AppointmentId: res.Value[0].AppointmentId },
                  function (res) {
                    ctrl.patientAppointments.push(res.Value);
                  }
                );
                stage.appointmentId = res.Value[0].AppointmentId;
                stage.appointmentStatus = 'Unscheduled Appointment Created';
              }
              treatmentPlansFactory.SetActiveTreatmentPlan(plan);
            });
        } else {
          toastrFactory.error(
            localize.getLocalizedString(
              ' Unscheduled appointment already created for Stage {0}',
              [stage.stageno]
            ),
            localize.getLocalizedString('Please try again')
          );
        }
      };

      // user has clicked remove
      $scope.remove = function (service, $event, setActive) {
        if (!_.isNil($event)) {
          $event.stopPropagation();
        }

        if (setActive === true) {
          treatmentPlansFactory.SetActiveTreatmentPlan($scope.treatmentPlan);
        }

        if (
          treatmentPlansFactory.ActiveTreatmentPlan.TreatmentPlanServices
            .length === 1
        ) {
          // If proposed service is the last service in plan, prompt user if they wish to delete treatment plan
          ctrl.deletePlan();
        } else {
          var i = 0;
          // counting how many
          angular.forEach(
            treatmentPlansFactory.ActiveTreatmentPlan.TreatmentPlanServices,
            function (tps) {
              if (
                tps.TreatmentPlanServiceHeader.TreatmentPlanGroupNumber ===
                service.TreatmentPlanServiceHeader.TreatmentPlanGroupNumber
              ) {
                i++;
              }
            }
          );

          ctrl.deleteService(service);
        }
      };

      $scope.setScheduleOption = function (services) {
        var servicesinAppt = 0;
        angular.forEach(services, function (tp) {
          if (tp.ServiceTransaction.AppointmentId != null) {
            servicesinAppt++;
          }
        });
        if (servicesinAppt != 0) {
          $scope.scheduledStatus = localize.getLocalizedString('Scheduled');
          $scope.isStageScheduled = true;
        } else {
          $scope.isStageScheduled = false;
        }
        // set disabled state of create appt toggle
        ctrl.setDisableCreateAppointmentToggle();
      };

      //#region create appt

      // user has clicked create appt, keeping track of what services get added to the appt
      $scope.addToApptChbxChecked = function (serviceTransaction) {
        $scope.servicesToAddToAppt = 0;
        angular.forEach($scope.proposedServicesForStage, function (tp) {
          // in case $$IncludeInAppointment hasn't been created yet
          if (
            angular.isUndefined(tp.ServiceTransaction.$$IncludeInAppointment)
          ) {
            tp.ServiceTransaction.$$IncludeInAppointment = false;
          }
          if (
            tp.ServiceTransaction.ServiceTransactionId ===
            serviceTransaction.ServiceTransactionId
          ) {
            // update the predetermination list each time a checkbox is checked / unchecked
            treatmentPlansFactory.UpdatePredeterminationList(
              tp,
              tp.ServiceTransaction.$$IncludeInAppointment
            );
          }
          // used to enabled/disable create appt button
          if (tp.ServiceTransaction.$$IncludeInAppointment === true) {
            $scope.servicesToAddToAppt++;
          }
        });

        $scope.setScheduleOption($scope.proposedServicesForStage);
        // disable create appointment button when checkbox is unchecked
        ctrl.disableAppointmentButton($scope.proposedServices);
        //disable send predetermination when checkbox is unchecked
        ctrl.disableSendPredetermination($scope.proposedServices);
        $scope.$emit(
          'soar-disable-create-appointment-button',
          $scope.isAppointmentCreate
        );
        $scope.$emit(
          'soar-disable-send-predetermination-button',
          $scope.isSendPredetermination
        );
      };

      //#endregion

      //#region delete Service

      // instantiate delete modal, etc.
      ctrl.deleteService = function (service) {
        ctrl.serviceMarkedforDeletion = service;
        modalFactory
          .DeleteModal(
            'Proposed Service from treatment plan ',
            treatmentPlansFactory.ActiveTreatmentPlan.TreatmentPlanHeader
              .TreatmentPlanName,
            true
          )
          .then(ctrl.confirmDeleteService);
      };

      // deciding whether or not to show the delete services from appt modal
      ctrl.confirmDeleteService = function () {
        // default removeServicesFromAppt
        $scope.removeServicesFromAppt = false;
        // do we have services on appts
        // PBI 360392 when a service is removed that is scheduled for an appointment that is Ready for Checkout,
        // do not present the option to the user to remove that service from the existing appointment as we normally do.
        //  Allow the service to be removed from the treatment plan but remain on the pending encounter and related appointment
        if (
          _.isNil(ctrl.serviceMarkedforDeletion.ServiceTransaction.EncounterId)
        ) {
          var promptToRemoveServices = treatmentPlansFactory.ShouldPromptToRemoveServicesFromAppointment(
            treatmentPlansFactory.ActiveTreatmentPlan,
            null,
            ctrl.serviceMarkedforDeletion.TreatmentPlanServiceHeader
              .TreatmentPlanServiceId
          );
          // if so do we want to delete them
          if (promptToRemoveServices) {
            ctrl.confirmDeleteServicesFromAppts('service');
          } else {
            ctrl.deleteServiceWithFlag();
          }
        } else {
          ctrl.deleteServiceWithFlag();
        }
      };

      // when service is removed from plan, reset the $scope.proposedServicesForStage and $scope.proposedServicesForStage
      ctrl.updateSelectedProposedServicesOnRemoveService = function (
        treatmentPlanService
      ) {
        // remove from selected services ($scope.proposedServicesForStage)
        treatmentPlanService.ServiceTransaction.$$IncludeInAppointment = false;
        // find this service in $scope.proposedServicesForStage and set $$IncludeInAppointment
        var indx = _.findIndex(
          $scope.proposedServicesForStage,
          function (service) {
            return (
              service.ServiceTransaction.ServiceTransactionId ===
              treatmentPlanService.ServiceTransaction.ServiceTransactionId
            );
          }
        );
        if (indx !== -1) {
          $scope.proposedServicesForStage[
            indx
          ].ServiceTransaction.$$IncludeInAppointment = false;
        }
        // remove from proposedServicesForStage
        if (indx !== -1) {
          $scope.proposedServicesForStage.splice(indx, 1);
        }
      };

      // calling factory method to handle deletion call
      ctrl.deleteServiceWithFlag = function () {
        // since we're removing this one, we need to remove it from the list of selected services
        // and update the count of the selected ones
        ctrl.updateSelectedProposedServicesOnRemoveService(
          ctrl.serviceMarkedforDeletion
        );
        treatmentPlansFactory
          .RemoveService(
            treatmentPlansFactory.ActiveTreatmentPlan,
            ctrl.serviceMarkedforDeletion.TreatmentPlanServiceHeader
              .TreatmentPlanServiceId,
            $scope.removeServicesFromAppt
          )
          .then(function () {
            ctrl.serviceMarkedforDeletion = null;
            treatmentPlansFactory.GetAllHeaders($scope.personId, true);
            $rootScope.$broadcast(
              'soar:tx-plan-services-changed',
              ctrl.serviceMarkedforDeletion,
              true
            );
          });
      };

      //#endregion service

      //#region remove

      // instantiate delete modal, etc.
      ctrl.removeStage = function (service) {
        ctrl.serviceMarkedforDeletion = service;
        ctrl.stageMarkedforDeletion =
          service.TreatmentPlanServiceHeader.TreatmentPlanGroupNumber;
        modalFactory
          .DeleteModal('Stage ', $scope.stageIndex)
          .then(ctrl.confirmRemoveStage);
      };

      // calling factory method to handle deletion call
      ctrl.confirmRemoveStage = function () {
        ctrl.stageMarkedforDeletion = null;
        ctrl.deleteService(ctrl.serviceMarkedforDeletion);
      };

      //#endregion

      $scope.move = function (svc, stageno) {
        $scope.movedServiceTransaction = null;
        svc.TreatmentPlanServiceHeader.TreatmentPlanGroupNumber = stageno;
        svc.ActionsVisible = false;
        var serviceMoved = {
          ServiceTransaction: svc.ServiceTransaction,
          TreatmentPlanServiceHeader: svc.TreatmentPlanServiceHeader,
        };

        $scope.$emit('soar:tx-plan-editinprogress', true);

        treatmentPlansFactory
          .UpdateServiceHeader(
            treatmentPlansFactory.ActiveTreatmentPlan,
            serviceMoved,
            stageno,
            svc.ServiceTransaction.AppointmentId
          )
          .then(function (res) {
            svc.TreatmentPlanServiceHeader =
              res.Value.TreatmentPlanServiceHeader;
            var service = treatmentPlansFactory.ActiveTreatmentPlan.TreatmentPlanServices.filter(
              function (s) {
                return (
                  s.TreatmentPlanServiceHeader.TreatmentPlanServiceId ==
                  res.Value.TreatmentPlanServiceHeader.TreatmentPlanServiceId
                );
              }
            );
            if (service.length > 0) {
              service[0].TreatmentPlanServiceHeader.TreatmentPlanGroupNumber =
                res.Value.TreatmentPlanServiceHeader.TreatmentPlanGroupNumber;
              service[0].ServiceTransaction.DataTag =
                res.Value.ServiceTransaction.DataTag;
            }
            $rootScope.$broadcast(
              'soar:tx-plan-services-changed',
              service,
              true
            );
          });
        $scope.$emit('_soar-check-empty-stage');
      };

      $scope.addToNewStage = function (svc) {
        // determine next group number - get the max group number from the plan
        var nextGroupNumber = treatmentPlansFactory.GetNextStageNumber(
          $scope.planStages
        );
        var newStage = {};
        newStage.stageno = nextGroupNumber;
        if ($scope.planStages.length < nextGroupNumber) {
          $scope.planStages.push(newStage);
        }
        $scope.move(svc, nextGroupNumber);
      };

      //This will get the updated Plan Stages and update the $scope.planStages variable
      //to reflect all of the current stages on TX Plan including empty stages
      $scope.getUpdatedPlanStages = function (svc) {
        var stages = treatmentPlansFactory.GetPlanStages();
        if (stages.length > 0) {
          $scope.planStages = treatmentPlansFactory.GetPlanStages();
        } else {
          $scope.planStages = treatmentPlansFactory.LoadPlanStages(
            $scope.treatmentPlan.TreatmentPlanServices
          );
        }
      };

      $scope.addServicesWhenEnabled = function (index) {
        if (!$scope.disableEditFunctions) {
          $scope.addServices(index);
        }
      };

      $scope.deleteStage = function (stageIndex, stage, $event) {
        if (!$scope.disableEditFunctions) {
          $event.stopPropagation();
          $scope.planStages = treatmentPlansFactory.GetPlanStages();
          if (treatmentPlansFactory.ActiveTreatmentPlan === null) {
            treatmentPlansFactory.RemovePlanStage(stage.stageno);
          } else if (
            treatmentPlansFactory.ActiveTreatmentPlan.TreatmentPlanServices
              .length >= 1 &&
            treatmentPlansFactory.ActiveTreatmentPlan.TreatmentPlanServices[0]
              .TreatmentPlanServiceHeader.TreatmentPlanGroupNumber ===
              stage.stageno &&
            ctrl.getUniqueGroupNumbersOnServicesOnActiveTreatmentPlan()
              .length === 1
          ) {
            // If proposed service is the last service in plan, prompt user if they wish to delete treatment plan
            ctrl.deletePlan();
          } else {
            ctrl.stageMarkedforDeletion = stage.stageno;
            modalFactory
              .DeleteModal('stage', 'Stage' + stageIndex, true)
              .then(ctrl.confirmDelete);
          }
        }
      };

      //Call this if needing to know the unique Group Numbers/Stage Numbers that exist on Services on an Active Treatment Plan
      ctrl.getUniqueGroupNumbersOnServicesOnActiveTreatmentPlan = function () {
        var uniqueGroupNumbers = [];
        //Get a list of Stage Group Numbers that are distinct that exist on the Treatment Plan Services
        //The ... is called a spread operator (It expands the set values into an array). The Set keyword is a collection of unique values and it removes duplicates
        //We put into that the list of property values we get from using map()
        uniqueGroupNumbers = [
          ...new Set(
            treatmentPlansFactory.ActiveTreatmentPlan.TreatmentPlanServices.map(
              treatmentPlanServices =>
                treatmentPlanServices.TreatmentPlanServiceHeader
                  .TreatmentPlanGroupNumber
            )
          ),
        ].sort((a, b) => a - b);
        return uniqueGroupNumbers;
      };

      ctrl.confirmDelete = function () {
        // default removeServicesFromAppt
        $scope.removeServicesFromAppt = false;
        // does stage have services on appts
        var promptToRemoveServices = treatmentPlansFactory.ShouldPromptToRemoveServicesFromAppointment(
          treatmentPlansFactory.ActiveTreatmentPlan,
          ctrl.stageMarkedforDeletion,
          null
        );
        // if so do we want to delete them
        if (promptToRemoveServices) {
          ctrl.confirmDeleteServicesFromAppts('stage');
        } else {
          ctrl.deleteStageWithFlag();
        }
      };

      ctrl.deleteStageWithFlag = function () {
        treatmentPlansFactory
          .DeleteStage(
            $scope.treatmentPlan,
            ctrl.stageMarkedforDeletion,
            $scope.removeServicesFromAppt
          )
          .then(function () {
            treatmentPlansFactory.SetActiveTreatmentPlan($scope.treatmentPlan);
            $scope.planStages = treatmentPlansFactory.GetPlanStages();
            $rootScope.$broadcast('soar:tx-plan-services-changed', [], true);
          });
      };

      // instantiate delete modal, etc.
      ctrl.deletePlan = function () {
        modalFactory
          .DeleteModal(
            'plan ',
            treatmentPlansFactory.ActiveTreatmentPlan.TreatmentPlanHeader
              .TreatmentPlanName,
            true
          )
          .then(ctrl.confirmDeletePlan);
      };

      // calling factory method to handle deletion call
      ctrl.confirmDeletePlan = function () {
        // default removeServicesFromAppt
        $scope.removeServicesFromAppt = false;
        // do we have services on appts
        var promptToRemoveServices = treatmentPlansFactory.ShouldPromptToRemoveServicesFromAppointment(
          treatmentPlansFactory.ActiveTreatmentPlan,
          null,
          null
        );
        // if so do we want to delete them
        if (promptToRemoveServices) {
          ctrl.confirmDeleteServicesFromAppts('plan');
        } else {
          ctrl.deletePlanWithFlag();
        }
      };

      ctrl.deletePlanWithFlag = function () {
        treatmentPlansFactory.Delete(
          treatmentPlansFactory.ActiveTreatmentPlan,
          $scope.removeServicesFromAppt
        );
      };

      $scope.checkForEmptyStage = function () {
        for (var i = 0; i <= $scope.planStages.length - 1; i++) {
          var stage = $scope.planStages[i].stageno;
          if (!ctrl.findStageNumberNumInServices(stage)) {
            return true;
          }
        }
        return false;
      };

      ctrl.findStageNumberNumInServices = function (stage) {
        var services = $scope.treatmentPlan
          ? $scope.treatmentPlan.TreatmentPlanServices
          : [];
        for (var j = 0; j <= services.length - 1; j++) {
          if (
            services[j].TreatmentPlanServiceHeader.TreatmentPlanGroupNumber ===
            stage
          ) {
            return true;
          }
        }
        return false;
      };

      //#region Insurance Estimate

      // calculate stage totals when the services change
      ctrl.calculateStageTotals = function (servicesInStage) {
        $scope.insuranceEstimatePartTotal = 0;
        $scope.patientPortionPartTotal = 0;
        $scope.adjustedEstimatePartTotal = 0;
        $scope.totalFeesPerStage = 0;
        $scope.totalDiscountsPerStage = 0;
        $scope.totalTaxPerStage = 0;
        $scope.totalAmountPerStage = 0;
        angular.forEach(servicesInStage, function (ps) {
          if (
            ps.ServiceTransaction.IsDeleted !== true &&
            ps.ServiceTransaction.ServiceTransactionStatusId !== 4 &&
            ps.ServiceTransaction.ServiceTransactionStatusId !== 8 &&
            ps.ServiceTransaction.ServiceTransactionStatusId !== 3 &&
            ps.ServiceTransaction.ServiceTransactionStatusId !== 2
          ) {
            if (ps.ServiceTransaction.InsuranceEstimates) {
              ctrl.calculateInsuranceAmounts(ps.ServiceTransaction);
            }
          }
          if (ps.ServiceTransaction.IsDeleted !== true) {
            $scope.totalFeesPerStage += ps.ServiceTransaction.Fee;
            $scope.totalDiscountsPerStage += ps.ServiceTransaction.Discount;
            $scope.totalTaxPerStage += ps.ServiceTransaction.Tax;
            $scope.totalAmountPerStage += ps.ServiceTransaction.Amount;
          }
        });
      };

      // appointment filter
      $scope.getAppointment = function (apptId) {
        var appointment = listHelper.findItemByFieldValue(
          ctrl.patientAppointments,
          'AppointmentId',
          apptId
        );
        return appointment;
      };

      ctrl.appendRoute = function (appointment) {
        if (appointment != null) {
          var route = '#/Schedule/';

          route +=
            '?date=' +
            new Date(appointment.StartTime).toISOString().substr(0, 10);
          route += '&view=' + 'provider';
          route += '&open=' + appointment.AppointmentId;

          appointment.Route = route;
        }
      };

      //#endregion

      //#region use loaded providers if available

      ctrl.getProviders = function () {
        usersFactory
          .Users()
          .then(ctrl.getProvidersSuccess, ctrl.getProvidersFailure);
      };

      // success callback handler for get all providers
      ctrl.getProvidersSuccess = function (successResponse) {
        if (successResponse && successResponse.Value) {
          $scope.providers = successResponse.Value;
        }
      };

      ctrl.loadProviders = function () {
        if (usersFactory.LoadedProviders) {
          $scope.providers = usersFactory.LoadedProviders;
        } else {
          ctrl.getProviders();
        }
      };

      //#endregion

      // getting the user code based on ProviderUserId
      ctrl.getUserCode = function (serviceTransaction) {
        // it would be a lot more efficient to get this from the services in a format you want already.
        let provider = listHelper.findItemByFieldValue(
          $scope.providers,
          'UserId',
          serviceTransaction.ProviderUserId
        );
        if (provider) {
          serviceTransaction.UserCode = provider.UserCode;
          serviceTransaction.ProviderFullName =
            provider.FirstName + ' ' + provider.LastName;
        } else {
          serviceTransaction.ProviderFullName = '';
        }

        let providerOnClaims = listHelper.findItemByFieldValue(
          $scope.providers,
          'UserId',
          serviceTransaction.ProviderOnClaimsId
        );
        if (providerOnClaims) {
          serviceTransaction.ProviderOnClaimsUserCode =
            providerOnClaims.UserCode;
          serviceTransaction.ProviderOnClaimsFullName =
            providerOnClaims.FirstName + ' ' + providerOnClaims.LastName;
        } else {
          serviceTransaction.ProviderOnClaimsFullName = '';
        }
      };

      /**
       * look up service code based on serviceCodeId if we have serviceCodes.
       *
       * @param {*} serviceCodeId
       * @returns {angular.IPromise}
       */
      ctrl.loadServiceCodeById = function (serviceCodeId) {
        return referenceDataService
          .getData(referenceDataService.entityNames.serviceCodes)
          .then(function (serviceCodes) {
            if (!_.isEmpty(serviceCodes)) {
              var serviceCode = _.find(serviceCodes, {
                ServiceCodeId: serviceCodeId,
              });
              if (serviceCode) {
                $scope.selectedServiceCode = serviceCode;
                $scope.selectedService.ServiceTransaction.AffectedAreaId =
                  serviceCode.AffectedAreaId;
                $scope.selectedService.ServiceTransaction.Code =
                  serviceCode.Code;
                $scope.initializeToothControls(
                  $scope.selectedService.ServiceTransaction
                );
              }
            }
            // fallback
            if (!_.isEmpty(serviceCodes)) {
              var serviceCodeButton = _.find(serviceCodes, {
                ServiceCodeId: patientOdontogramFactory.selectedChartButtonId,
              });
              if (serviceCodeButton) {
                $scope.selectedServiceCode = serviceCodeButton;
                $scope.selectedService.ServiceTransaction.AffectedAreaId =
                  serviceCodeButton.AffectedAreaId;
                $scope.selectedService.ServiceTransaction.Code =
                  serviceCodeButton.Code;
                $scope.initializeToothControls(
                  $scope.selectedService.ServiceTransaction
                );
              }
            }
          });
      };

      /**
       * Edit service transaction.
       *
       * @param {*} tps
       * @returns {angular.IPromise}
       */
      $scope.editServiceTransaction = function (tps) {
        $scope.selectedService = tps;
        return ctrl.loadServiceCodeById(tps.ServiceTransaction.ServiceCodeId);
      };

      $scope.$on('reloadProposedServices', function (e, updatedService) {
        $scope.toothCtrls.close();
      });

      $scope.$on('close-tooth-window', function (e) {
        $scope.toothCtrls.close();
      });

      $scope.$on('soar:tx-plan-disable-edit-functions', function (e, value) {
        $scope.disableEditFunctions = value;
      });

      $scope.$watch('toothCtrlsOpen', function (nv) {
        if (nv === false) {
          $scope.toothCtrls.close();
        }
      });

      $scope.openToothCtrls = function (
        mode,
        title,
        isSwiftCode,
        firstCode,
        lastCode
      ) {
        $scope.toothCtrls.content(
          '<multi-location-proposed-service mode="' +
            mode +
            '" isswiftcode="' +
            isSwiftCode +
            '" isfirstcode="' +
            firstCode +
            '" islastcode="' +
            lastCode +
            '" isedit="' +
            true +
            '" istreatmentplan="' +
            true +
            '" treatmentplanname="' +
            $scope.treatmentPlan.TreatmentPlanHeader.TreatmentPlanName +
            '" treatmentplangroupnumber="' +
            $scope.stageIndex +
            '"></multi-location-proposed-service>'
        );
        $scope.toothCtrls.setOptions({
          resizable: false,
          position: {
            top: '25%',
            left: '21.65%',
          },
          minWidth: 300,
          scrollable: false,
          iframe: false,
          actions: ['Close'],
          title: 'Edit ' + mode + ' - ' + title,
          modal: true,
        });
        $scope.toothCtrls.open();
        //modalInstance.result.then($scope.serviceTransactionsUpdated);
      };

      // Set the tooth controls properties
      $scope.initializeToothControls = function (serviceTransaction) {
        if (
          serviceTransaction.SwiftPickServiceCodes &&
          serviceTransaction.SwiftPickServiceCodes.length > 0
        ) {
          $scope.swiftPickSelected = serviceTransaction;
          var firstCode = false;
          var lastCode = false;
          if (serviceTransaction.SwiftPickServiceCodes.length != 0) {
            $scope.SwiftCodesProgress = localize.getLocalizedString(
              ' - ({0} of {1})',
              [1, serviceTransaction.SwiftPickServiceCodes.length]
            );
            firstCode = true;
            if (serviceTransaction.SwiftPickServiceCodes.length == 1)
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
            $scope.openToothCtrls('Service', title, true, firstCode, lastCode);
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
          $scope.openToothCtrls('Service', windowTitle, false, true, false);
        }
      };

      // the initial state for checkboxes used by appts and predeterminations is checked
      ctrl.initCheckboxesForAppt = function (servicesForStage) {
        $scope.servicesToAddToAppt = 0;
        angular.forEach(servicesForStage, function (ps) {
          if (
            ps.ServiceTransaction.ServiceTransactionStatusId == 4 ||
            ps.ServiceTransaction.ServiceTransactionStatusId == 3 ||
            ps.ServiceTransaction.ServiceTransactionStatusId == 8 ||
            ps.ServiceTransaction.ServiceTransactionStatusId == 2 ||
            ps.ServiceTransaction.ServiceTransactionStatusId == 5
          ) {
            ps.ServiceTransaction.$$IncludeInAppointment = false;
          } else {
            ps.ServiceTransaction.$$IncludeInAppointment = true;
          }
          $scope.servicesToAddToAppt++;
        });
      };

      // disable the create appointment button
      ctrl.disableAppointmentButton = function (proposedServices) {
        $scope.isAppointmentCreate = true;
        angular.forEach(proposedServices, function (ps) {
          if (
            ((ps.ServiceTransaction.ServiceTransactionStatusId == 7 &&
              ps.ServiceTransaction.AppointmentId === null) ||
              ps.ServiceTransaction.ServiceTransactionStatusId == 1) &&
            ps.ServiceTransaction.$$IncludeInAppointment
          ) {
            $scope.isAppointmentCreate = false;
            return;
          }
        });
      };

      // disable the Send predetermination button
      // disable the Sendpredeterminationbutton when ServiceTransactionStatusId=2,3,4,5,8
      ctrl.disableSendPredetermination = function (proposedServices) {
        $scope.isSendPredetermination = true;
        angular.forEach(proposedServices, function (ps) {
          if (
            (ps.ServiceTransaction.ServiceTransactionStatusId == 7 ||
              ps.ServiceTransaction.ServiceTransactionStatusId == 1) &&
            ps.ServiceTransaction.$$IncludeInAppointment
          ) {
            $scope.isSendPredetermination = false;
            return;
          }
        });
      };
      //#region confirm remove services from appt when plan or stage deleted

      $scope.removeServicesFromAppt = false;

      // modal to confirm deleting services from appt when plan or stage is deleted
      ctrl.confirmDeleteServicesFromAppts = function (type) {
        var data = true;
        var title = localize.getLocalizedString(
          'Remove Services from Appointment?'
        );
        var button2Text = localize.getLocalizedString('No, keep');
        var button1Text = localize.getLocalizedString('Yes, remove');
        var message = '';
        switch (type) {
          case 'service':
            if (
              ctrl.serviceMarkedforDeletion.ServiceTransaction
                .ApptClassification === 2
            ) {
              message = localize.getLocalizedString(
                'This service is currently in an unscheduled appointment. Remove service from appointment as well?'
              );
            } else if (
              ctrl.serviceMarkedforDeletion.ServiceTransaction
                .ApptClassification === 0
            ) {
              message = localize.getLocalizedString(
                'This service is currently scheduled for {0}. {1}',
                [
                  ctrl.serviceMarkedforDeletion.ServiceTransaction
                    .FormattedDateTime,
                  'Remove service from appointment as well?',
                ]
              );
            }
            modalFactory
              .ConfirmModal(title, message, button1Text, button2Text, data)
              .then(ctrl.removeServiceInAppt, ctrl.keepServiceInAppt);
            break;
          case 'stage':
            message = localize.getLocalizedString(
              'This stage contains services that are currently scheduled.\n\n Would you like to remove these services from their appointment as well?'
            );
            modalFactory
              .ConfirmModal(title, message, button1Text, button2Text, data)
              .then(
                ctrl.removeStageServicesInAppt,
                ctrl.keepStageServicesInAppt
              );
            break;
          case 'plan':
            message = localize.getLocalizedString(
              'This treatment plan contains services that are currently scheduled.\n\n Would you like to remove these services from their appointment as well?'
            );
            modalFactory
              .ConfirmModal(title, message, button1Text, button2Text, data)
              .then(ctrl.removeServicesInAppt, ctrl.keepServicesInAppt);
            break;
        }
      };

      // keep services in appt
      ctrl.removeServicesInAppt = function () {
        $scope.removeServicesFromAppt = true;
        ctrl.deletePlanWithFlag();
      };

      ctrl.keepServicesInAppt = function () {
        $scope.removeServicesFromAppt = false;
        ctrl.deletePlanWithFlag();
      };

      // keep services in appt
      ctrl.removeStageServicesInAppt = function () {
        $scope.removeServicesFromAppt = true;
        ctrl.deleteStageWithFlag();
      };

      ctrl.keepStageServicesInAppt = function () {
        $scope.removeServicesFromAppt = false;
        ctrl.deleteStageWithFlag();
      };

      // keep service in appt
      ctrl.removeServiceInAppt = function () {
        $scope.removeServicesFromAppt = true;
        ctrl.deleteServiceWithFlag();
      };

      ctrl.keepServiceInAppt = function () {
        $scope.removeServicesFromAppt = false;
        ctrl.deleteServiceWithFlag();
      };

      //#endregion

      //#region disable create appt on inactive patient

      $scope.disableCreateAppointmentToggle = false;
      $scope.createAppointmentTitle = '';
      ctrl.setDisableCreateAppointmentToggle = function () {
        $scope.disableCreateAppointmentToggle = false;
        $scope.createAppointmentTitle = '';

        if ($scope.patient && $scope.patient.IsActive === false) {
          $scope.disableCreateAppointmentToggle = true;
          $scope.createAppointmentTitle =
            'Cannot create appointment for inactive patient';
        } else {
          if ($scope.servicesToAddToAppt === 0) {
            $scope.disableCreateAppointmentToggle = true;
            $scope.createAppointmentTitle = '';
          } else {
            if ($scope.isStageScheduled) {
              $scope.disableCreateAppointmentToggle = true;
              $scope.createAppointmentTitle = '';
            }
          }
        }
      };

      //#endregion

      $scope.sum = function (items, prop) {
        return items.reduce(function (a, b) {
          return a + b[prop];
        }, 0);
      };

      $scope.editAppointmentFromModal = function (appointmentId) {

        if ($scope.linkToScheduleV2) {
          schedulingMFENavigator.navigateToAppointmentModal({
            id: appointmentId,
          });
          return;
        }

        let appt = {
          AppointmentId: appointmentId,
        };

        appointmentViewDataLoadingService.getViewData(appt, false).then(
          function (res) {
            appointmentViewVisibleService.changeAppointmentViewVisible(
              true,
              false
            );
          },
          function (error) {
            console.log(error);
            toastrFactory.error(
              'Ran into a problem loading the appointment',
              'Error'
            );
          }
        );
      };

      ctrl.appendTreatmentRoomData = function (appointment, treatmentRoom) {
        if (appointment != null) {
          var emptyTreatmentRoom = { Name: '' };

          appointment.Room =
            treatmentRoom != null && treatmentRoom.Name > ''
              ? treatmentRoom
              : emptyTreatmentRoom;
        }
      };

      ctrl.appendLocationData = function (appointment, location) {
        if (appointment != null) {
          appointment.Location = location != null ? location : null;
        }
      };

      ctrl.appendProviderData = function (appointment, provider) {
        if (appointment != null) {
          if (provider != null) {
            provider.Name =
              provider.Name > ''
                ? provider.Name
                : provider.FirstName +
                  ' ' +
                  provider.LastName +
                  (provider.ProfessionalDesignation > ''
                    ? ', ' + provider.ProfessionalDesignation
                    : '');
            appointment.Provider = provider;
          } else {
            appointment.Provider =
              appointment.Classification != 2
                ? {}
                : { Name: localize.getLocalizedString('Any Provider') };
          }
        }
      };

      ctrl.appendAppointmentTypeData = function (appointment, appointmentType) {
        if (appointment != null) {
          appointment.AppointmentType =
            appointmentType != null
              ? appointmentType
              : {
                  Name: localize.getLocalizedString('No Appointment Type'),
                  AppointmentTypeColor: 'rgba(100, 100, 100, 0.34902)',
                  FontColor: 'rgb(0, 0, 0)',
                };
        }
      };

      ctrl.appendAppointmentStatusData = function (appointment) {
        if (appointment != null) {
          var status = ctrl.getStatusById(appointment.Status);

          if (status != null) {
            appointment.StatusName = status.Description;
            appointment.StatusIcon = status.Icon;
          }
        }
      };

      ctrl.appendServiceCodeData = function (appointment, serviceCodes) {
        if (appointment != null) {
          appointment.ServiceCodes = serviceCodes;
          for (var i = 0; i < appointment.PlannedServices.length; i++) {
            appointment.PlannedServices[i].AffectedAreaId =
              appointment.ServiceCodes[i].AffectedAreaId;
            appointment.PlannedServices[i].Code =
              appointment.ServiceCodes[i].Code;
            appointment.PlannedServices[i].DisplayAs =
              appointment.ServiceCodes[i].DisplayAs;
            appointment.PlannedServices[i].ObjectState =
              appointment.ServiceCodes[i].Update;
          }
        }
      };

      // calculates $$PatientBalance based on $$Charges - EstInsurance - AdjEst
      $scope.getPatientBalance = function (serviceTransaction) {
        if (serviceTransaction.IsDeleted === true) {
          serviceTransaction.$$PatientBalance = 0;
          serviceTransaction.$$ShowInsEstimate = false;
          return serviceTransaction.$$PatientBalance;
        }
        if (
          (serviceTransaction.InsuranceEstimates &&
            serviceTransaction.ServiceTransactionStatusId === 4) ||
          serviceTransaction.ServiceTransactionStatusId === 8 ||
          serviceTransaction.ServiceTransactionStatusId === 3 ||
          serviceTransaction.ServiceTransactionStatusId === 2
        ) {
          serviceTransaction.$$PatientBalance = null;
          serviceTransaction.$$ShowInsEstimate = false;
          return serviceTransaction.$$PatientBalance;
        }
        if (
          serviceTransaction.InsuranceEstimates &&
          serviceTransaction.ServiceTransactionStatusId !== 4 &&
          serviceTransaction.ServiceTransactionStatusId !== 8 &&
          serviceTransaction.ServiceTransactionStatusId !== 3 &&
          serviceTransaction.ServiceTransactionStatusId !== 2
        ) {
          serviceTransaction.$$ShowInsEstimate = true;
          serviceTransaction.$$PatientBalance =
            serviceTransaction.Amount -
            $scope.sum(serviceTransaction.InsuranceEstimates, 'EstInsurance') -
            $scope.sum(serviceTransaction.InsuranceEstimates, 'AdjEst');
          return serviceTransaction.$$PatientBalance;
        }
      };

      $scope.checkServicesAppointments = function (serviceToMove, stage) {
        var servicesWithAppointments = [];
        if ($scope.treatmentPlan.TreatmentPlanServices.length > 0) {
          angular.forEach(
            $scope.treatmentPlan.TreatmentPlanServices,
            function (service) {
              if (
                service.ServiceTransaction.AppointmentId &&
                service.ServiceTransaction.AppointmentId != null &&
                service.TreatmentPlanServiceHeader.TreatmentPlanGroupNumber ==
                  stage
              ) {
                service.$$AppointmentId =
                  service.ServiceTransaction.AppointmentId;
                servicesWithAppointments.push(service);
              }

              if (
                service.ServiceTransaction.ServiceTransactionId ==
                serviceToMove.ServiceTransaction.ServiceTransactionId
              ) {
                serviceToMove = service;
              }
            }
          );
          $scope.launchAddServiceToAppointmentModal(
            serviceToMove,
            stage,
            servicesWithAppointments
          );
        }
      };

      // calculate insurance amounts per service and totals
      ctrl.calculateInsuranceAmounts = function (serviceTransaction) {
        serviceTransaction.$$EstInsurance = ctrl.getSum(
          serviceTransaction.InsuranceEstimates,
          'EstInsurance'
        );
        serviceTransaction.$$AdjEst = ctrl.getSum(
          serviceTransaction.InsuranceEstimates,
          'AdjEst'
        );
        serviceTransaction.$$PatientPortion = $scope.getPatientBalance(
          serviceTransaction
        );
        $scope.insuranceEstimatePartTotal += serviceTransaction.$$EstInsurance;
        $scope.adjustedEstimatePartTotal += serviceTransaction.$$AdjEst;
        $scope.patientPortionPartTotal += serviceTransaction.$$PatientPortion;
      };

      $scope.launchAddServiceToAppointmentModal = function (
        serviceToMove,
        stage,
        servicesWithAppointments
      ) {
        if (
          servicesWithAppointments.length > 0 &&
          !serviceToMove.ServiceTransaction.AppointmentId
        ) {
          var modalInstance = modalFactory.Modal({
            templateUrl:
              'App/Patient/patient-chart/treatment-plans/treatment-plan-add-to-appointment/treatment-plan-add-to-appointment.html',
            controller: 'TreatmentPlanAddToAppointment',
            amfa: $scope.treatmentPlanAddServiceAmfa,
            backdrop: 'static',
            keyboard: false,
            size: 'lg',
            windowClass: 'center-modal',
            resolve: {
              addToAppointmentModalCallback: function () {
                return $scope.move;
              },
              stageNumber: function () {
                return stage;
              },
              serviceToAdd: function () {
                return serviceToMove;
              },
              servicesWithAppointments: function () {
                return servicesWithAppointments;
              },
              treatmentPlanId: function () {
                return $scope.treatmentPlan.TreatmentPlanHeader.TreatmentPlanId;
              },
              treatmentPlanServices: function () {
                return $scope.treatmentPlan.TreatmentPlanServices;
              },
            },
          });
        } else {
          $scope.move(serviceToMove, stage);
        }
      };

      //#endregion

      /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
      //recalculateServiceTransactions is called when amount is changed from the patient-encounter-estins directive
      $scope.recalculateServiceTransactions = recalculateServiceTransactions;
      function recalculateServiceTransactions(serviceTransaction) {
        //Logging//console.log('recalculateServiceTransactions');

        $scope.$emit('soar:tx-plan-editinprogress', true);

        // get tax, discount, then calc insurance estimates
        ctrl.calculatePlannedServiceAmounts(serviceTransaction);

        // need to set the object state and initiate a save for the treatment plan.
        serviceTransaction.ObjectState =
          serviceTransaction.ObjectState == saveStates.Add
            ? serviceTransaction.ObjectState
            : saveStates.Update;
        $rootScope.$emit('soar:tx-est-ins-overridden');
      }

      //TODO: might have to move to the parent component
      ctrl.calculatePlannedServiceAmounts = calculatePlannedServiceAmounts;
      function calculatePlannedServiceAmounts(service, isInitializing) {
        //Logging//console.log('calculatePlannedServiceAmounts');
        //Logging//console.log('seems like this method should only be called when edit or ... when not drag.');
        /*if (!_.isEmpty($scope.proposedServicesForStage)) {*/
        // get tax, discount, then calc insurance estimates
        return ctrl
          .calculateTaxAndDiscountOnServices(service, isInitializing)
          .then(function () {
            ctrl.saveServicesAfterFinancialUpdate(service);
            //$scope.calculateEstimatedAmount(service, isInitializing);
          });
        //}
      }

      //TODO: might have to move to the parent component
      $scope.calculateEstimatedAmount = calculateEstimatedAmount;
      function calculateEstimatedAmount(service, isInitializing) {
        //debugger;
        //Logging//console.log('calculateEstimatedAmount');

        // Probably can delete this foreach loop check as we are not adding this way.
        if ($scope.proposedServicesForStage.length > 0) {
          _.forEach($scope.proposedServicesForStage, function (service) {
            if (service.ServiceTransaction.ObjectState == saveStates.Add) {
              service.InsuranceEstimates = financialService.CreateOrCloneInsuranceEstimateObject(
                service.ServiceTransaction
              );
            }
          });
        }

        // get a list of the serviceTransactions from the treatment plan services collection.
        let listOfServices = [];
        _.forEach($scope.proposedServicesForStage, function (plannedService) {
          listOfServices.push(plannedService.ServiceTransaction);
        });

        financialService
          .RecalculateInsurance(listOfServices, $scope.patient.PersonId)
          .then(function (result) {
            // This code did not have a return value in the appointment view when I grabbed it from the appointment view code.
            // Not sure why ... but I added it here so the values can be used if needed.
            //result.Value[0] -- the value is a collection in a collection / not sure why

            var insuranceEstimated = 0;
            var estimatedAmount = 0.0;

            if (
              result &&
              result.Value &&
              result.Value.length === 1 &&
              result.Value[0] !== null &&
              result.Value[0].length !== 0
            ) {
              _.forEach($scope.proposedServicesForStage, function (service) {
                estimatedAmount += service.Amount;
                insuranceEstimated +=
                  service.ServiceTransaction.TotalEstInsurance +
                  service.ServiceTransaction.TotalAdjEstimate;
              });
            }
            $scope.estimatedAmount = estimatedAmount;
            if (!insuranceEstimated) {
              insuranceEstimated = 0;
            }
            $scope.estimatedInsurance = insuranceEstimated;

            //debugger;

            ctrl.saveServicesAfterFinancialUpdate();
          });
      }

      //TODO: might have to move to the parent component
      // calculates tax, discount, and amount for a list of existing serviceTransactions attached to this appointment
      ctrl.calculateTaxAndDiscountOnServices = calculateTaxAndDiscountOnServices;
      function calculateTaxAndDiscountOnServices(service, isInitializing) {
        //Logging//console.log('calculateTaxAndDiscountOnServices');

        // get a list of the serviceTransactions from the treatment plan services collection.
        let listOfServices = [];
        //_.forEach($scope.proposedServicesForStage, function (plannedService) {
        //    listOfServices.push(plannedService.ServiceTransaction);
        //});
        listOfServices.push(service);

        return patientServicesFactory
          .GetTaxAndDiscount(listOfServices)
          .then(function (res) {
            var serviceTransactions = res.Value;
            ctrl.processTaxAndDiscount(
              service,
              serviceTransactions,
              isInitializing
            );
          });
      }

      //TODO: might have to move to the parent component
      // find matching record in proposedServicesForStage and transfer calculates tax, discount, and amount since
      // the returned dataset will not contain any dynamic properties
      ctrl.processTaxAndDiscount = processTaxAndDiscount;
      function processTaxAndDiscount(
        service,
        serviceTransactions,
        isInitializing
      ) {
        //Logging//console.log('processTaxAndDiscount');
        _.forEach($scope.proposedServicesForStage, function (plannedService) {
          var match = _.find(
            serviceTransactions,
            function (serviceTransaction) {
              return (
                serviceTransaction.ServiceTransactionId ===
                  plannedService.ServiceTransaction.ServiceTransactionId &&
                serviceTransaction.Fee === plannedService.ServiceTransaction.Fee
              );
            }
          );
          if (!_.isNil(match)) {
            // set Amount, Discount, and Tax on original list
            if (match.Amount !== plannedService.ServiceTransaction.Amount) {
              plannedService.ServiceTransaction.Amount = match.Amount;
              plannedService.ServiceTransaction.ObjectState =
                plannedService.ServiceTransaction.ObjectState === saveStates.Add
                  ? saveStates.Add
                  : saveStates.Update;
            }
            if (match.Discount !== plannedService.ServiceTransaction.Discount) {
              plannedService.ServiceTransaction.Discount = match.Discount;
              plannedService.ServiceTransaction.ObjectState =
                plannedService.ObjectState === saveStates.Add
                  ? saveStates.Add
                  : saveStates.Update;
            }
            if (match.Tax !== plannedService.ServiceTransaction.Tax) {
              plannedService.ServiceTransaction.Tax = match.Tax;
              plannedService.ServiceTransaction.ObjectState =
                plannedService.ServiceTransaction.ObjectState === saveStates.Add
                  ? saveStates.Add
                  : saveStates.Update;
            }
          }
        });
      }

      // Save service changes
      ctrl.saveServicesAfterFinancialUpdate = saveServicesAfterFinancialUpdate;
      function saveServicesAfterFinancialUpdate(service) {
        // get the global in this control list of services
        let list = _.cloneDeep($scope.proposedServicesForStage);

        // get just the services to update.
        let listOfServices = [];
        _.forEach(list, function (plannedService) {
          if (
            plannedService.ServiceTransaction.ServiceTransactionId ==
            service.ServiceTransactionId
          ) {
            listOfServices.push(plannedService.ServiceTransaction);
          }
        });

        patientServicesFactory
          .update(listOfServices, true, $scope.planName, $scope.stage.stageno)
          .then(
            function (res) {
              var savedServiceTransactions = res.Value;
              if (savedServiceTransactions.length > 0) {
                // need to update the collection with the new values
                _.forEach(
                  $scope.proposedServicesForStage,
                  function (plannedService) {
                    var match = _.find(
                      savedServiceTransactions,
                      function (serviceTransaction) {
                        return (
                          serviceTransaction.ServiceTransactionId ===
                          plannedService.ServiceTransaction.ServiceTransactionId
                        );
                      }
                    );

                    if (
                      match &&
                      plannedService.ServiceTransaction.DataTag !==
                        match.DataTag
                    ) {
                      plannedService.ServiceTransaction = match;
                    }
                  }
                );
                // need to determine if these two operations are needed after updating the ServiceTransaction.
                $scope.$emit(
                  'reloadProposedServices',
                  savedServiceTransactions
                );
                $rootScope.$broadcast('soar:chart-services-reload-ledger');
              }
            },
            function () {
              // nothing at the moement
            }
          );
      }

      //#region methods that calculate fees, discount, tax,

      //TODO: Future use for when we add edit option next to fee
      var inputPromises = [];
      $scope.recalculateReturnUpdatedInputFees = recalculateReturnUpdatedInputFees;
      function recalculateReturnUpdatedInputFees(inputData, returnFunction) {
        //Logging//console.log('recalculateReturnUpdatedInputFee');

        $timeout.cancel(ctrl.recalulateinputDataFeesTimeout);
        ctrl.recalulateinputDataFeesTimeout = $timeout(function () {
          $scope.inputDataFee = inputData;
          inputPromises.push(ctrl.calculateDiscountInputValues());
          inputPromises.push(ctrl.calculateTaxInputValues());
          $q.all(inputPromises).then(function () {
            $scope.inputDataFee.Amount =
              $scope.inputDataFee.Fee -
              $scope.inputDataFee.Discount +
              $scope.inputDataFee.Tax;
            returnFunction();
          });
        }, 500);
      }

      ctrl.calculateDiscountInputValues = calculateDiscountInputValues;
      function calculateDiscountInputValues() {
        //Logging//console.log('calculateDiscountInputValues');
        $scope.inputDiscountLoading = true;

        $scope.inputDiscountCalculationInProgress = true;
        var serviceCode = _.find(ctrl.serviceCodes, {
          ServiceCodeId: $scope.inputDataFee.ServiceCodeId,
        });

        if (serviceCode != null) {
          $scope.inputDataFee.DiscountableServiceTypeId =
            serviceCode.DiscountableServiceTypeId;
          $scope.inputDataFee.applyDiscount = serviceCode.IsEligibleForDiscount;
        }

        return patientServices.Discount.get(
          { isDiscounted: $scope.inputDataFee.applyDiscount },
          $scope.inputDataFee,
          ctrl.calculateDiscountInputValuesSuccess,
          ctrl.calculateDiscountInputValuesFailure
        ).$promise;
      }

      ctrl.calculateTaxInputValues = calculateTaxInputValues;
      function calculateTaxInputValues() {
        //Logging//console.log('calculateTaxInputValues');
        $scope.inputTaxLoading = true;

        $scope.inputTaxCalculationInProgress = true;
        var serviceCode = _.find(ctrl.serviceCodes, {
          ServiceCodeId: $scope.inputDataFee.ServiceCodeId,
        });

        if (serviceCode != null) {
          $scope.inputDataFee.$$locationTaxableServiceTypeId =
            serviceCode.$$locationTaxableServiceTypeId;
        } else {
          return ctrl.calculateTaxInputValuesFailure.$promise;
        }

        ctrl.serviceTransaction = _.cloneDeep($scope.inputDataFee);

        ctrl.serviceHashKey = $scope.inputDataFee.$$hashKey;
        $scope.taxLoadingId = $scope.inputDataFee.$$hashKey;

        return patientServices.TaxAfterDiscount.get(
          {
            isDiscounted: $scope.inputDataFee.applyDiscount,
          },
          $scope.inputDataFee,
          ctrl.calculateTaxInputValuesSuccess,
          ctrl.calculateTaxInputValuesFailure
        ).$promise;
      }

      ctrl.calculateTaxInputValuesSuccess = calculateTaxInputValuesSuccess;
      function calculateTaxInputValuesSuccess(response) {
        //Logging//console.log('calculateTaxInputValuesSuccess');
        if ($scope.inputDataFee != null) {
          $scope.inputDataFee.Tax = response.Value;
        }
        $scope.inputTaxCalculationInProgress = false;
        $scope.inputTaxLoading = false;
        $scope.inputDiscountCalculationInProgress = false;
        $scope.inputDiscountLoading = false;
      }

      ctrl.calculateTaxInputValuesFailure = calculateTaxInputValuesFailure;
      function calculateTaxInputValuesFailure(response) {
        //Logging//console.log('calculateTaxInputValuesFailure');
        $scope.inputDataFee.Tax = 0;
        $scope.inputTaxCalculationInProgress = false;
        $scope.inputTaxLoading = false;
        $scope.inputDiscountCalculationInProgress = false;
        $scope.inputDiscountLoading = false;
        toastrFactory.error(
          localize.getLocalizedString('Failed to calculate tax'),
          localize.getLocalizedString('Server Error')
        );
      }

      ctrl.calculateDiscountInputValuesSuccess = calculateDiscountInputValuesSuccess;
      function calculateDiscountInputValuesSuccess(response) {
        //Logging//console.log('calculateDiscountInputValuesSuccess');
        if ($scope.inputDataFee != null) {
          if ($scope.inputDataFee.applyDiscount) {
            $scope.inputDataFee.Discount = response.Value;
          } else {
            $scope.inputDataFee.Discount = 0;
          }
        }
        $scope.inputDiscountCalculationInProgress = false;
        $scope.inputDiscountLoading = false;
      }

      ctrl.calculateDiscountInputValuesFailure = calculateDiscountInputValuesFailure;
      function calculateDiscountInputValuesFailure(response) {
        //Logging//console.log('calculateDiscountInputValuesFailure');
        $scope.inputDataFee.Discount = 0;
        $scope.inputDiscountCalculationInProgress = false;
        $scope.inputDiscountLoading = false;
        toastrFactory.error(
          localize.getLocalizedString('Failed to calculate discount'),
          localize.getLocalizedString('Server Error')
        );
      }

      //TODO: might have to move to the parent component
      ctrl.keepCountOfServiceTransactions = keepCountOfServiceTransactions;
      function keepCountOfServiceTransactions() {
        //Logging//console.log('keepCountOfServiceTransactions');
        var filterdSelectedServiceTransactions = $scope.calculateDiscountNewOnSuccess.filter(
          function (serviceTransaction) {
            if (serviceTransaction.ObjectState != saveStates.Delete) {
              return true;
            }
            return false;
          }
        );
        return filterdSelectedServiceTransactions.length;
      }

      //#endregion
    },
  ]);
