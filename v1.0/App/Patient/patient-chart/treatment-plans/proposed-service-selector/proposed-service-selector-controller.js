(function () {
  'use strict';
  angular
    .module('Soar.Patient')
    .controller(
      'ProposedServiceSelectorController',
      ProposedServiceSelectorController
    );

  ProposedServiceSelectorController.$inject = [
    '$scope',
    'PatientServices',
    'ListHelper',
    'UsersFactory',
    'toastrFactory',
    'localize',
    'TreatmentPlansFactory',
    'ModalFactory',
    'patSecurityService',
    '$filter',
    'locationService',
    '$rootScope',
    'PatientValidationFactory',
    'referenceDataService',
    'ServiceCodesService',
  ];
  function ProposedServiceSelectorController(
    $scope,
    patientServices,
    listHelper,
    usersFactory,
    toastrFactory,
    localize,
    treatmentPlansFactory,
    modalFactory,
    patSecurityService,
    $filter,
    locationService,
    $rootScope,
    patientValidationFactory,
    referenceDataService,
    serviceCodesService
  ) {
    BaseCtrl.call(this, $scope, 'ProposedServiceSelectorController');

    var ctrl = this;
    $scope.currentLocation = locationService.getCurrentLocation();

    // everything that needs instantiated or called when controller loads
    ctrl.$onInit = function () {
      $scope.treatmentPlanAddServiceAmfa = 'soar-clin-cplan-asvccd';
      ctrl.getProviders();
      ctrl.getTreatmentplanStages();
      ctrl.setAddProposedServiceButton();
      // call auth function
      ctrl.authAccess();
      $scope.addPlannedServiceAuthAbbrev = 'soar-clin-cpsvc-add';
      $scope.modalIsOpen = false;
      $scope.addProposedServiceTitle = '';
      $scope.patientInfo = patientValidationFactory.GetPatientData();
      $scope.patientLocationMatch = false;
    };

    ctrl.authTreatmentPlanAddServiceAccess = function () {
      return patSecurityService.IsAuthorizedByAbbreviation(
        $scope.treatmentPlanAddServiceAmfa
      );
    };

    ctrl.authAccess = function () {
      if (ctrl.authTreatmentPlanAddServiceAccess()) {
        $scope.hasTreatmentPlanAddServiceAccess = true;
      }
    };

    // listening for changes to ExistingTreatmentPlans
    $scope.$watch(
      function () {
        return treatmentPlansFactory.ExistingTreatmentPlans;
      },
      function (nv) {
        $scope.existingTreatmentPlans = nv;
        ctrl.setHasBeenAddedToATxPlanFlag();
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
      }
    );

    // listening for changes to ActiveTreatmentPlan
    $scope.$watch(
      function () {
        return treatmentPlansFactory.ActiveTreatmentPlan;
      },
      function (nv, ov) {
        $scope.activeTreatmentPlan = nv;
        if (
          $scope.activeTreatmentPlan &&
          $scope.activeTreatmentPlan.TreatmentPlanServices
        ) {
          ctrl.getTreatmentplanStages();
        }
        if (!_.isEqual(nv, ov)) {
          ctrl.setHasBeenAddedToATxPlanFlag();
        }
      }
    );

    // listening for changes to SavingPlan, updating check mark
    $scope.$watch(
      function () {
        return treatmentPlansFactory.SavingPlan;
      },
      function (nv, ov) {
        if (nv === false && ov === true) {
          ctrl.setHasBeenAddedToATxPlanFlag();
        }
      }
    );

    // listening for changes to AddingService, updating check mark
    $scope.$watch(
      function () {
        return treatmentPlansFactory.AddingService;
      },
      function (nv, ov) {
        if (nv === false && ov === true) {
          ctrl.setHasBeenAddedToATxPlanFlag();
        }
      }
    );

    // used to determine whether or not to show the check mark
    ctrl.setHasBeenAddedToATxPlanFlag = function () {
      if ($scope.existingTreatmentPlans && $scope.proposedServices) {
        var idsInThisPlan = [];
        var idsOnAllPlans = [];
        // get list of services on the active treatment plan
        if (!_.isEmpty($scope.activeTreatmentPlan)) {
          idsInThisPlan = _.uniq(
            _.map(
              $scope.activeTreatmentPlan.TreatmentPlanServices,
              'ServiceTransaction.ServiceTransactionId'
            )
          );
        }
        // build a list of services on all treatment plans
        _.forEach($scope.existingTreatmentPlans, function (etp) {
          idsOnAllPlans = _.uniq(
            _.concat(
              idsOnAllPlans,
              _.map(
                etp.TreatmentPlanServices,
                'ServiceTransaction.ServiceTransactionId'
              )
            )
          );
        });
        // list of services not on the active plan
        //idsInOtherPlans = _.difference(idsOnAllPlans, idsInThisPlan);
        if (!_.isEmpty(idsOnAllPlans) || !_.isEmpty(idsInThisPlan)) {
          var tempPs = _.cloneDeep($scope.proposedServices);
          _.forEach(tempPs, function (ps) {
            ps.$hasBeenAddedToATxPlan =
              idsOnAllPlans.indexOf(ps.ServiceTransactionId) !== -1;
            ps.$hasBeenAddedToThisTxPlan =
              idsInThisPlan.indexOf(ps.ServiceTransactionId) !== -1;
          });
          $scope.proposedServices = tempPs;
        }
      }
    };

    // getting the list of providers
    ctrl.getProviders = function () {
      usersFactory.Users().then(function (res) {
        if (res && res.Value) {
          ctrl.providers = res.Value;
          ctrl.getProposedServices();
        }
      });
    };

    $scope.$on('reloadProposedServices', function (event, services) {
      //ctrl.getProposedServices();
      var proposed = !_.isEmpty($scope.proposedServices)
        ? _.cloneDeep($scope.proposedServices)
        : [];
      _.forEach(services, function (serv) {
        var provider = _.find(ctrl.providers, { UserId: serv.ProviderUserId });
        if (!_.isEmpty(provider)) {
          serv.UserCode = provider.UserCode;
        }
        proposed.push(serv);
      });
      ctrl.filterByLocation(proposed);
    });

    //#region proposed services get all

    // success callback for get all proposed services
    ctrl.getAllSuccess = function (res) {
      if (res && res.Value) {
        _.forEach(res.Value, function (ps) {
          var provider = _.find(ctrl.providers, { UserId: ps.ProviderUserId });
          if (provider) {
            ps.UserCode = provider.UserCode;
          }
        });
        ctrl.filterByLocation(res.Value);
      }
    };

    ctrl.filterByLocation = function (proposed) {
      if (_.isEmpty($scope.currentLocation)) {
        return;
      }

      $scope.checkPatientLocation();

      _.forEach(proposed, function (service) {
        service.$$locationService =
          service.LocationId === $scope.currentLocation.id;
      });

      var filtered = _.filter(proposed, { ServiceTransactionStatusId: 1 });
      filtered = _.orderBy(filtered, '$$locationService', 'desc');

      $scope.proposedServices = filtered;
      ctrl.setHasBeenAddedToATxPlanFlag();
    };

    // failure callback for get all proposed services
    ctrl.getAllFailure = function () {
      toastrFactory.error(
        localize.getLocalizedString(
          'Failed to retrieve the list of {0}. Refresh the page to try again.',
          ['Proposed Services']
        ),
        localize.getLocalizedString('Error')
      );
    };

    // getting all proposed services for patient
    ctrl.getProposedServices = function () {
      patientServices.ServiceTransactions.get(
        { Id: $scope.personId },
        ctrl.getAllSuccess,
        ctrl.getAllFailure
      );
    };

    //#endregion

    //#region add proposed service

    // sending proposed service to add up to parent
    $scope.add = function (ps) {
      treatmentPlansFactory.AddPlannedService(ps);
    };

    // closing
    $scope.close = function () {
      $scope.viewSettings.expandView = false;
      $scope.viewSettings.activeExpand = 0;
      $scope.viewSettings.txPlanActiveId = null;
      treatmentPlansFactory.SetNewTreatmentPlan(null);
      treatmentPlansFactory.CollapseAll();
      treatmentPlansFactory.SetDataChanged(false);
    };

    // back to service
    $scope.backToService = function () {
      $scope.viewSettings.activeExpand = $scope.viewSettings.expandView ? 2 : 0;
      treatmentPlansFactory.CollapseAll();
    };

    //#endregion

    $scope.getTitle = function (flag) {
      return flag
        ? localize.getLocalizedString(
            'This service is already added to another Treatment Plan.'
          )
        : '';
    };

    // on new treatment plan create treatment plan with services
    ctrl.addServicesModalCallback = function (services, stage, areNew) {
      if ($scope.newTreatmentPlan && !_.isEmpty(services)) {
        treatmentPlansFactory
          .CreateWithNoReload(services, $scope.personId, stage)
          .then(function (res) {
            if (res && res.Value) {
              var newlyCreatedPlan = res.Value;
              newlyCreatedPlan.TreatmentPlanHeader.TotalFees = treatmentPlansFactory.GetTotalFees(
                newlyCreatedPlan
              );
              newlyCreatedPlan.TreatmentPlanHeader.DaysAgo = treatmentPlansFactory.GetDaysAgo(
                newlyCreatedPlan.TreatmentPlanHeader
              );
              newlyCreatedPlan.TreatmentPlanHeader.FullTreatmentPlanHasLoaded = true;
              treatmentPlansFactory.AddAreaToServices(
                newlyCreatedPlan.TreatmentPlanServices
              );
              treatmentPlansFactory
                .GetPredeterminationsById(newlyCreatedPlan)
                .then(function (res) {
                  if (res && res.Value) {
                    newlyCreatedPlan.Predeterminations = res.Value;
                  }
                });
              treatmentPlansFactory.SetActiveTreatmentPlan(newlyCreatedPlan);
              treatmentPlansFactory.SetNewTreatmentPlan(null);
              treatmentPlansFactory.SavingPlan = false;
              treatmentPlansFactory.SetDataChanged(false);
              $rootScope.$broadcast('serviceHeadersUpdated');
            }
          });
      }
    };

    $scope.addNewService = function () {
      var modalInstance = modalFactory.Modal({
        windowTemplateUrl: 'uib/template/modal/window.html',
        templateUrl:
          'App/Patient/patient-chart/treatment-plans/add-services/add-services.html',
        controller: 'AddTxPlanServicesController',
        amfa: 'soar-clin-cpsvc-add',
        backdrop: 'static',
        keyboard: false,
        size: 'lg',
        windowClass: 'center-modal',
        resolve: {
          addServicesCallback: function () {
            return ctrl.addServicesModalCallback;
          },
          patient: function () {
            return $scope.patientInfo;
          },
          stageNumber: function () {
            return 1;
          },
          treatmentPlanId: function () {
            if ($scope.activeTreatmentPlan) {
              return $scope.activeTreatmentPlan.TreatmentPlanHeader
                .TreatmentPlanId;
            } else if ($scope.newTreatmentPlan) {
              return null;
            }
          },
          treatmentPlanServices: function () {
            return [];
          },
          servicesOnEncounter: function () {
            return [];
          },
          saveService: () => {
            return true;
          },
          includeEstIns: () => {
            return false;
          },
        },
      });
      modalInstance.IsNewTreatmentPlan = true;
      modalInstance.result.then(ctrl.successHandler);
    };

    ctrl.successHandler = function (newItem) {
      $scope.modalIsOpen = false;
      if (!_.isNil(newItem)) {
        // deselect teeth
        if ($scope.selection && $scope.selection.teeth) {
          $scope.selection.teeth = [];
        }
        if (!_.isEmpty(newItem)) {
          var filteredTps = _.filter(newItem, function (item) {
            return !_.isNil(item.TreatmentPlanServiceHeader);
          });
          $scope.activeTreatmentPlan.TreatmentPlanServices = _.concat(
            $scope.activeTreatmentPlan.TreatmentPlanServices,
            filteredTps
          );
          $scope.$emit('soar:chart-services-reload-ledger');
        }
      }
    };

    $scope.showActions = function (service) {
      _.forEach($scope.proposedServices, function (v) {
        v.ActionsVisible = false;
      });
      service.ActionsVisible = true;
    };

    //getting stages for selected treatment plan
    ctrl.getTreatmentplanStages = function () {
      var Stages = [];
      if (
        $scope.activeTreatmentPlan &&
        $scope.activeTreatmentPlan.TreatmentPlanServices
      ) {
        Stages = treatmentPlansFactory.GetPlanStages();
      }
      $scope.planStages = _.cloneDeep(_.orderBy(Stages, 'stageno', 'asc'));
      if (!_.isEmpty($scope.planStages))
        $scope.stageSelected = $scope.planStages[0].stageno;
    };

    $scope.move = function (ps, stageno) {
      treatmentPlansFactory.AddPlannedService(ps, stageno);
      ps.ActionsVisible = false;
    };

    /**
     * Add to new stage.
     *
     * @param {*} svc
     * @param {*} validateName
     * @returns {angular.IPromise}
     */
    $scope.addToNewStage = function (svc, validateName) {
      return referenceDataService
        .getData(referenceDataService.entityNames.serviceCodes)
        .then(function (serviceCodes) {
          var serviceCode = _.find(serviceCodes, {
            ServiceCodeId: svc.ServiceCodeId,
          });
          if (!_.isEmpty(serviceCode)) {
            svc.Code = serviceCode.Code;
          }
          var serviceCodesThatNeedUpdated = serviceCodesService.CheckForAffectedAreaChanges(
            [svc],
            serviceCodes,
            true
          );
          if (!_.isEmpty(serviceCodesThatNeedUpdated)) {
            var message = localize.getLocalizedString(
              'The affected area of Service(s) {0} are missing and must be completed before proceeding.',
              [serviceCodesThatNeedUpdated.join(', ')]
            );
            var title = localize.getLocalizedString('Changes Needed');
            var button1Text = localize.getLocalizedString('OK');
            modalFactory.ConfirmModal(title, message, button1Text);
          } else {
            $scope.saveAttempted = true;
            var isValid = true;
            if (validateName) {
              isValid =
                $scope.newTreatmentPlan.TreatmentPlanHeader.TreatmentPlanName;
            }
            if (isValid) {
              // determine next group number - get the max group number from the plan
              var nextGroupNumber = treatmentPlansFactory.ActiveTreatmentPlan
                ? treatmentPlansFactory.GetActiveTreatmentPlanNextGroupNumber(
                    treatmentPlansFactory.ActiveTreatmentPlan
                  )
                : 1;
              var newStage = {};
              newStage.stageno = nextGroupNumber;
              if ($scope.planStages.length < nextGroupNumber) {
                $scope.planStages.push(newStage);
              }
              $scope.move(svc, nextGroupNumber);
            }
          }
        });
    };

    //#region disable create appt on inactive patient
    ctrl.setAddProposedServiceButton = function () {
      $scope.addProposedServiceTitle = '';
      if ($scope.patientInfo.IsActive === false) {
        $scope.addProposedServiceTitle = localize.getLocalizedString(
          'Cannot add a proposed service for inactive patient'
        );
      }
    };

    // when header locations dropdown changes, we need to reset activeLocation to make sure is not removed
    $scope.$on('patCore:initlocation', function () {
      if ($scope.currentLocation) {
        $scope.currentLocation = locationService.getCurrentLocation();
        var proposed = _.cloneDeep($scope.proposedServices);
        ctrl.filterByLocation(proposed);
      }
    });

    // Check to ensure the patient is active at the current location in the app header
    $scope.checkPatientLocation = function () {
      $scope.patientLocationMatch = patientValidationFactory.CheckPatientLocation(
        $scope.patientInfo,
        $scope.currentLocation
      );
    };
  }

  ProposedServiceSelectorController.prototype = Object.create(
    BaseCtrl.prototype
  );
})();
