(function () {
  'use strict';

  angular
    .module('Soar.Patient')
    .controller('AddTxPlanServicesController', AddTxPlanServicesController);

  AddTxPlanServicesController.$inject = [
    '$scope',
    '$rootScope',
    '$uibModalInstance',
    '$filter',
    'localize',
    'toastrFactory',
    'PatientOdontogramFactory',
    'addServicesCallback',
    'patient',
    'stageNumber',
    'saveService',
    'treatmentPlanId',
    'treatmentPlanServices',
    'servicesOnEncounter',
    'TreatmentPlansFactory',
    '$timeout',
    '$q',
    'PatientPreventiveCareFactory',
    'ListHelper',
    'patSecurityService',
    '$interval',
    'StaticData',
    'includeEstIns',
  ];

  function AddTxPlanServicesController(
    $scope,
    $rootScope,
    $uibModalInstance,
    $filter,
    localize,
    toastrFactory,
    patientOdontogramFactory,
    addServicesCallback,
    patient,
    stageNumber,
    saveService,
    treatmentPlanId,
    treatmentPlanServices,
    servicesOnEncounter,
    treatmentPlansFactory,
    $timeout,
    $q,
    patientPreventiveCareFactory,
    listHelper,
    patSecurityService,
    $interval,
    staticData,
    includeEstIns
  ) {
    BaseCtrl.call(this, $scope, 'AddTxPlanServicesController');

    var ctrl = this;
    $scope.serviceFilter = 'txplan';
    $scope.isNewTreatmentPlan = false;
    $scope.isEditTreatmentPlan = false;
    $scope.isEncounterServices = false;
    $scope.locationChosen = null;
    $scope.servicesAdded = null;
    $scope.passInTxEstIns = false;
    //$scope.isTreatmentPlanInsEstEnabled = false;
    // we need to load servicesOnEncounter to local var for testing (if passed to control)
    ctrl.servicesOnEncounter = servicesOnEncounter ? servicesOnEncounter : [];
    ctrl.location = JSON.parse(sessionStorage.getItem('userLocation'));
    $scope.preventiveDate = {
      dueDate: '',
    };

    ctrl.$onInit = function () {
      staticData.TeethDefinitions().then(function (res) {
        patientOdontogramFactory.TeethDefinitions = res.Value;
      });
      staticData.CdtCodeGroups().then(function (res) {
        patientOdontogramFactory.CdtCodeGroups = res.Value;
      });
      $scope.hasChanges = false;
      $scope.title = localize.getLocalizedString('Add Services to Stage {0}', [
        { skip: stageNumber },
      ]);
      $scope.dataLoadingProposed = { loading: false };
      $scope.dataLoadingNewService = { loading: false };
      $scope.dataLoadingPreventive = { loading: false };
      $scope.dataLoadingTreatment = { loading: false };
      $scope.patient = patient;
      $scope.passInTxEstIns = includeEstIns;
      // set parameter to controller property for ease of testing
      ctrl.treatmentPlanId = treatmentPlanId ? treatmentPlanId : null;
      ctrl.addedServiceTransactions = [];
      ctrl.addedNewServices = [];
      $scope.proposedServicesOnPlan = ctrl.processTreatmentPlanServices(
        treatmentPlanServices
      );
      if ($uibModalInstance.IsNewTreatmentPlan) {
        $scope.isNewTreatmentPlan = true;
      }
      if ($uibModalInstance.IsEditTreatmentPlan) {
        $scope.isEditTreatmentPlan = true;
      }
      if ($uibModalInstance.isEncounterServices) {
        // Indicates this is called from the encounter cart, used to
        // set title and service filter and nullify ctrl.treatmentPlanId, and passed to child controls
        $scope.serviceFilter = 'encounter-refactored';
        $scope.isEncounterServices = true;
        ctrl.initializeProposedServicesOnPlan();
        ctrl.syncServicesOnEncounter();
        $scope.title = localize.getLocalizedString('Add Services to Encounter');
        // in case the ctrl.treatmentPlanId is still set to something other than null, reset ActiveTreatmentPlan and treatmentPlanId
        // reference bug 460733. Caused when user browses away from an active treatment plan
        // This is kindof a hack but doing a more thorough refactor is beyond the scope of this bug
        treatmentPlansFactory.SetActiveTreatmentPlan(null);
      }
      $uibModalInstance.rendered.then(function () {
        $scope.modalRendered = true;
      });
      patientPreventiveCareFactory
        .NextTrumpServiceDueDate(patient.PatientId)
        .then(function (res) {
          $scope.preventiveDate.dueDate = res.Value;
        });
      $scope.setChosenLocation();
    };

    $scope.$on('patCore:initlocation', function () {
      ctrl.location = JSON.parse(sessionStorage.getItem('userLocation'));
      ctrl.location.LocationId = ctrl.location.id;
      $scope.setChosenLocation();
    });

    $scope.setChosenLocation = function () {
      $scope.locationChosen = ctrl.location;
      //first load does not have locationId set
      if (!$scope.locationChosen.LocationId) {
        $scope.locationChosen.LocationId = ctrl.location.id;
      }
    };

    ctrl.processTreatmentPlanServices = function (services) {
      var list = [];
      _.forEach(services, function (service) {
        if (service.ServiceTransaction) {
          list.push(service.ServiceTransaction.ServiceTransactionId);
        }
      });
      return list;
    };

    $scope.close = function () {
      $uibModalInstance.close(
        ctrl.addedServiceTransactions.concat(ctrl.addedNewServices)
      );
    };

    // bug 338274 add parameter to broadcast to prevent multiple selectors from responding

    $scope.showProposedFlyout = function () {
      ctrl.syncServicesOnEncounter();
      $rootScope.$broadcast('closeFlyouts');
      $rootScope.$broadcast('openProposedSelectorFlyout', $scope.serviceFilter);
    };
    $scope.showServiceFlyout = function () {
      $rootScope.$broadcast('closeFlyouts');
      $rootScope.$broadcast('openNewServicesFlyout', $scope.serviceFilter);
    };
    $scope.showTxPlansFlyout = function () {
      ctrl.syncServicesOnEncounter();
      $rootScope.$broadcast('closeFlyouts');
      $rootScope.$broadcast('openTreatmentPlanFlyout', $scope.serviceFilter);
    };

    $scope.hasPreventiveCareViewAccess = patSecurityService.IsAuthorizedByAbbreviation(
      'soar-per-perps-view'
    );

    // only load the preventive care items when needed and only once
    $scope.showPreventiveFlyout = function () {
      if ($scope.hasPreventiveCareViewAccess) {
        // show animation if retrieval takes more than 2 sec
        if (!$scope.preventiveCareServices) {
          ctrl.showLoading = $interval(function () {
            $scope.dataLoadingPreventive.loading = true;
          }, 2000);
          patientPreventiveCareFactory
            .PreventiveCareServices($scope.patient.PatientId, true)
            .then(function (res) {
              $scope.preventiveCareServices = res;
              $interval.cancel(ctrl.showLoading);
              $scope.dataLoadingPreventive.loading = false;
              $rootScope.$broadcast('closeFlyouts');
              $rootScope.$broadcast('openPreventiveCareFlyout');
            });
        } else {
          $scope.dataLoadingPreventive.loading = false;
          $rootScope.$broadcast('closeFlyouts');
          $rootScope.$broadcast('openPreventiveCareFlyout');
        }
      }
    };

    $scope.addProposedServices = function (services) {
      if (addServicesCallback) {
        addServicesCallback(services, stageNumber);
        ctrl.addedServiceTransactions = ctrl.addedServiceTransactions.concat(
          services
        );
        angular.forEach(services, function (service) {
          $scope.proposedServicesOnPlan.push(service.ServiceTransactionId);
        });
        // map $scope.servicesAdded each time we add proposed services
        ctrl.syncServicesOnEncounter();
      }
    };

    $scope.addTxPlanServices = function (services) {
      var serviceObject = services.PlannedServices
        ? services.PlannedServices
        : services;

      if (addServicesCallback) {
        addServicesCallback(serviceObject, stageNumber);
        ctrl.addedServiceTransactions = ctrl.addedServiceTransactions.concat(
          serviceObject
        );
        angular.forEach(serviceObject, function (service) {
          $scope.proposedServicesOnPlan.push(service.ServiceTransactionId);
        });
        ctrl.syncServicesOnEncounter();
      }
    };

    $scope.addTxPlanServicesWithEstIns = function (services) {
      //Tx Est Ins Feature Flag
      //Callback from treatment-selector-controller when feature flag is enabled
      //Gives back the whole treatmentPlanService, header and all
      var txPlanServices = services.TreatmentPlanServices
        ? services.TreatmentPlanServices
        : services;

      if (addServicesCallback) {
        addServicesCallback(txPlanServices, stageNumber);
        ctrl.addedServiceTransactions = ctrl.addedServiceTransactions.concat(
          txPlanServices
        );
        angular.forEach(txPlanServices, function (service) {
          $scope.proposedServicesOnPlan.push(
            service.ServiceTransaction.ServiceTransactionId
          );
        });
        ctrl.syncServicesOnEncounter();
      }
    };

    //#region methods to support when called from encounter
    // build $scope.proposedServicesOnPlan (list of ServiceTransactionIds ) if this is called from the encounter
    ctrl.initializeProposedServicesOnPlan = function () {
      if ($scope.isEncounterServices === true) {
        _.forEach(ctrl.servicesOnEncounter, function (serviceOnEncounter) {
          $scope.proposedServicesOnPlan.push(
            serviceOnEncounter.ServiceTransactionId
          );
        });
      }
    };

    // sync servicesAdded to the ctrl.servicesOnEncounter when modified if this is called from the encounter
    ctrl.syncServicesOnEncounter = function () {
      if ($scope.isEncounterServices) {
        $scope.servicesAdded = _.map(ctrl.servicesOnEncounter, function (st) {
          return {
            ServiceTransactionId: st.ServiceTransactionId,
            InsuranceOrder: st.InsuranceOrder,
          };
        });
      }
    };
    //#endregion

    $scope.addNewServices = function (services) {
      ctrl.servicesToAdd = services;
      ctrl.initializeToothControls(services);
    };

    // Set the tooth controls properties
    ctrl.initializeToothControls = function (serviceTransactions) {
      if (serviceTransactions && serviceTransactions.length > 0) {
        ctrl.lastIndex = false;
        ctrl.progress = localize.getLocalizedString(' - ({0} of {1})', [
          1,
          serviceTransactions.length,
        ]);
        if (serviceTransactions.length == 1) ctrl.lastIndex = true;
        ctrl.serviceCodeIndex = 0;
        patientOdontogramFactory.setselectedChartButton(
          serviceTransactions[0].ServiceCodeId
        );
        var title = serviceTransactions[0].Code + ctrl.progress;
        ctrl.openToothCtrls('Service', title, true, true, ctrl.lastIndex);
      }
    };

    // indicator that this is the last in a series
    ctrl.lastIndex = false;
    $scope.nextSwftPkServCode = function () {
      if (ctrl.serviceCodeIndex != ctrl.servicesToAdd.length - 1) {
        ctrl.serviceCodeIndex++;
        ctrl.progress = localize.getLocalizedString(' - ({0} of {1})', [
          ctrl.serviceCodeIndex + 1,
          ctrl.servicesToAdd.length,
        ]);
        ctrl.lastIndex =
          ctrl.serviceCodeIndex === ctrl.servicesToAdd.length - 1
            ? true
            : false;
        patientOdontogramFactory.setselectedChartButton(
          ctrl.servicesToAdd[ctrl.serviceCodeIndex].ServiceCodeId
        );
        var title =
          ctrl.servicesToAdd[ctrl.serviceCodeIndex].Code + ctrl.progress;
        ctrl.openToothCtrls('Service', title, true, false, ctrl.lastIndex);
      } else {
        $scope.toothCtrls.close();
      }
    };

    ctrl.openToothCtrls = function (
      mode,
      title,
      isSwiftCode,
      firstCode,
      lastCode
    ) {
      var encounterRefactored = $scope.serviceFilter === 'encounter-refactored';
      var topPos = Math.round($(window).height() * 0.25) + 'px';
      $scope.toothCtrls.content(
        '<multi-location-proposed-service mode="' +
          mode +
          '" saveservice="' +
          saveService +
          '" isswiftcode="' +
          isSwiftCode +
          '" isfirstcode="' +
          firstCode +
          '" islastcode="' +
          lastCode +
          '" isedit="false" treatment-plan-id="' +
          ctrl.treatmentPlanId +
          '" is-new-treatment-plan="' +
          $scope.isNewTreatmentPlan +
          '" stage-number="' +
          stageNumber +
          '" is-edit-treatment-plan="' +
          $scope.isEditTreatmentPlan +
          '" is-encounter-refactored="' +
          encounterRefactored +
          '"></multi-location-proposed-service>'
      );
      $scope.toothCtrls.setOptions({
        resizable: false,
        position: {
          top: topPos,
          left: '21.65%',
        },
        minWidth: 300,
        scrollable: false,
        iframe: false,
        actions: ['Close'],
        title: _.escape('Add ' + mode + ' - ' + title),
        modal: true,
        close: ctrl.toothCtrlsClosed,
      });
      $scope.toothCtrls.open();
    };

    ctrl.processingComplete = false;
    ctrl.toothCtrlsClosed = function () {
      // if this is the last service to process, execute callback
      // NOTE processing complete indicates either
      // 1) all services passed have been processed or
      // 2) cancellation
      if (ctrl.processingComplete === true) {
        addServicesCallback(ctrl.addedNewServices, stageNumber, true);
        ctrl.addedNewServices = [];
      }
      // if the ctrl.lastIndex is true, then set ctrl.processingComplete to true, so that the next time
      // the toothCtrls is closed, the addServicesCallback will fire
      ctrl.processingComplete = ctrl.lastIndex === true ? true : false;
    };

    $scope.$on('close-tooth-window', function (e, cancelled) {
      if (
        !_.isEmpty($scope.toothCtrls) &&
        _.isFunction($scope.toothCtrls.close)
      ) {
        // indicator that processing of services has been cancelled on last service passed
        if (cancelled === true && ctrl.lastIndex === true) {
          ctrl.processingComplete = true;
        }
        $scope.toothCtrls.close();
      }
    });

    $scope.$on(
      'soar:tx-plan-services-changed',
      function (event, treatmentPlanServices, reloadAll) {
        if (ctrl.lastIndex === true) {
          ctrl.processingComplete = true;
        }
        angular.forEach(treatmentPlanServices, function (service) {
          if (
            service.TreatmentPlanServiceHeader.TreatmentPlanId ==
            ctrl.treatmentPlanId
          ) {
            ctrl.addedNewServices.push(service);
            if (service.ServiceTransaction) {
              $scope.proposedServicesOnPlan.push(
                service.ServiceTransaction.ServiceTransactionId
              );
            }
          }
        });
      }
    );

    // listening for changes to ActiveTreatmentPlan to reset TreatmentPlanId after new tx plan is added
    $scope.$watch(
      function () {
        return treatmentPlansFactory.ActiveTreatmentPlan;
      },
      function (nv, ov) {
        if (nv && nv.TreatmentPlanHeader) {
          var activeTreatmentPlan = nv;
          ctrl.treatmentPlanId =
            activeTreatmentPlan.TreatmentPlanHeader.TreatmentPlanId;
        }
      }
    );

    //#region handling for a new treatment plan
    $scope.$on('updatedServicesToAdd', function (event, services) {
      if (_.isEmpty(services)) {
        return;
      }

      $scope.addProposedServices(services);
    });

    // add services to list to return from caller
    $scope.$on('addServicesToNewTreatmentPlan', function (event, services) {
      if (_.isEmpty(services)) {
        return;
      }
      // ref bug 368559 Clinical - Tx Plan:  Adding service for multiple teeth to a new Treatment Plan does not add service
      // if only one service is passed to prop-serv-cr-ud, but multiple teeth are selected, more than one service will
      // be created
      // ctrl.lastIndex signals that the last code passed has been processed if only  regardless of the number of services (whether only one was passed or a batch)
      ctrl.processingComplete = ctrl.lastIndex;
      ctrl.addedNewServices = _.concat(ctrl.addedNewServices, services);
    });

    //#endregion

    //#region Patient Preventive Care Services

    //add services from preventive care
    $scope.addPreventiveServices = function (returnedData, useModal) {
      var servicesToAdd = [];
      angular.forEach(returnedData.PlannedServices, function (service) {
        servicesToAdd.push(service);
      });
      $scope.addNewServices(servicesToAdd);
    };

    //#endregion

    //#region load preventive care item service information from service codes in getPreventiveServicesOverview
    ctrl.getServiceCodeById = function (serviceCodeId) {
      var match = _.find($scope.serviceCodes, { ServiceCodeId: serviceCodeId });
      return _.cloneDeep(match);
    };
    //#endregion
  }

  AddTxPlanServicesController.prototype = Object.create(BaseCtrl);
})();
