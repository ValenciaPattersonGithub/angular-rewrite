(function () {
  'use strict';

  angular
      .module('Soar.Patient')
      .controller('TreatmentPlansCrudController', TreatmentPlansCrudController)
      .filter('sanitize', ['$sanitize', function($sanitize) {
        return function(input) {
          return $sanitize(input).replace(/&amp;/g, '&');
        };
      }]);
  
  TreatmentPlansCrudController.$inject = [
    '$scope',
    '$uibModal',
    'localize',
    'ListHelper',
    'toastrFactory',
    'TreatmentPlanHttpService',
    '$filter',
    '$timeout',
    'patSecurityService',
    'StaticData',
    'ModalFactory',
    'TreatmentPlansFactory',
    'ServiceButtonsService',
    'TypeOrMaterialsService',
    '$q',
    'UsersFactory',
    'PatientBenefitPlansFactory',
    '$location',
    'DocumentsLoadingService',
    'TreatmentConsentService',
    'locationService',
    'RecentDocumentsService',
    '$rootScope',
    'tabLauncher',
    '$window',
    'PatientAppointmentsFactory',
    'ModalDataFactory',
    'TreatmentPlanDocumentFactory',
    'DocumentService',
    'InformedConsentFactory',
    'DocumentGroupsService',
    'referenceDataService',
    'FormsDocumentsFactory',
    'PracticesApiService',
    'userSettingsDataService',
    'ClinicalDrawerStateService',
    'AppointmentModalLinksService',
    'TreatmentPlanChangeService',
    'NewTreatmentPlanEditServicesService',
    'AppointmentViewDataLoadingService',
    'AppointmentViewVisibleService',
    'PatientServicesFactory',
    '$sanitize',
    'FeatureFlagService',
    'FuseFlag',
    'schedulingMFENavigator',
  ];

  function TreatmentPlansCrudController(
    $scope,
    $uibModal,
    localize,
    listHelper,
    toastrFactory,
    treatmentPlanHttpService,
    $filter,
    $timeout,
    patSecurityService,
    staticData,
    modalFactory,
    treatmentPlansFactory,
    serviceButtonsService,
    typeOrMaterialsService,
    $q,
    usersFactory,
    patientBenefitPlansFactory,
    $location,
    documentsLoadingService,
    treatmentConsentService,
    locationService,
    recentDocumentsService,
    $rootScope,
    tabLauncher,
    $window,
    patientAppointmentsFactory,
    modalDataFactory,
    treatmentPlanDocumentFactory,
    documentService,
    informedConsentFactory,
    documentGroupsService,
    referenceDataService,
    formsDocumentsFactory,
    practicesApiService,
    userSettingsDataService,
    clinicalDrawerStateService,
    appointmentModalLinksService,
    treatmentPlanChangeService,
    treatmentPlanEditServices,
    appointmentViewDataLoadingService,
    appointmentViewVisibleService,
    patientServicesFactory,
    $sanitize,
    featureFlagService,
    fuseFlag,
    schedulingMFENavigator,
  ) {
    BaseCtrl.call(this, $scope, 'TreatmentPlansCrudController');

    var ctrl = this;

    ctrl.emptyUser = '00000000-0000-0000-0000-000000000000';
    $scope.treatmentPlanAddServiceAmfa = 'soar-clin-cplan-asvccd';
    $scope.treatmentPlanDeleteAmfa = 'soar-clin-cplan-delete';
    $scope.disablePrint = true;
    $scope.consentMessage = '';
    $scope.patientName = '';
    $scope.totalFeesPerPlan = 0;
    $scope.totalDiscountsPerPlan = 0;
    $scope.totalTaxPerPlan = 0;
    $scope.totalAmountPerPlan = 0;
    $scope.updatingInsurance = false;
    $scope.loadingAppointment = false;
    $scope.servicesForRollback = [];
    $scope.treatmentPlanDocuments = [];
    $scope.predeterminationProviderDropdownTemplate =
      '<div id="providerDropdownTemplate" type="text/x-kendo-template">' +
      "<span id=\"lblSelectedName\" class=\"value-template-input k-state-default\" ng-style=\"{'font-weight': dataItem.IsPreferred ? 'bold' : 'normal','display': 'block','width': '100%' }\">#: Name #</span>" +
      '</div>';
    $scope.drawerState = false;
    // linking up an observable value so we can have other areas notified when it changes
    $scope.drawerState = clinicalDrawerStateService.getDrawerState();
    // initial value should never be matched to force initial load
    $scope.treatmentPlanId = 'not_a_real_id';

    $scope.txPlanAreaActive = false;
    $scope.isResetEstimatedInsuranceEnabled = false;

    $scope.planOnDetermination = null;
    $scope.hasBenefitPlan = false;
    $scope.disableEditFunctions = false;
    $scope.linkToScheduleV2 = false;

    // everything that needs instantiated or called when controller loads
    ctrl.$onInit = function () {
      $scope.disablePrint = true;
      $scope.formIsValid = true;
      $scope.editing = false;
      $scope.enableNote = true;
      $scope.isNotDuplicatable = false;
      $scope.tooltipRecommendFalse = localize.getLocalizedString(
        'Recommend this treatment'
      );
      $scope.tooltipRecommendTrue = localize.getLocalizedString(
        "Clinician's recommended choice"
      );
      $scope.hasPredeterminationForCurrentPlan = false;
      $scope.treatmentPlanDocuments = [];
      $scope.treatmentPlanSnapshotTooltip = localize.getLocalizedString(
        'Treament Plan Attachments'
      );
      ctrl
        .loadLocations()
        .then(function () {
          return ctrl.loadProviders();
        })
        .then(function () {
          ctrl.initializeServiceCodes();
          ctrl.getConsentMessage();
          ctrl.initTreatmentPlanPage();
          ctrl.initPredeterminationProviders();
          ctrl.getPatientBenefitPlans();
          ctrl.setResetEstimatedInsuranceState();
        });
      featureFlagService.getOnce$(fuseFlag.ShowScheduleV2).subscribe((value) => {
        $scope.linkToScheduleV2 = value;
      });
      featureFlagService.getOnce$(fuseFlag.ShowScheduleV2Alt).subscribe((value) => {
        if (!$scope.linkToScheduleV2) {$scope.linkToScheduleV2 = value}
      });
    };

    //#region Get Location
    $scope.location = {};
      $scope.currentLocation = {};

      $scope.sbChange = function (changeProviderId) {
          $scope.providerOnDetermination = changeProviderId;
      };

    /**
     * Load locations.
     *
     * @returns {angular.IPromise}
     */
    ctrl.loadLocations = function () {
      $scope.currentLocation = locationService.getCurrentLocation();
      return referenceDataService
        .getData(referenceDataService.entityNames.locations)
        .then(function (locations) {
          $scope.locations = locations;
          // get locations that you can schedule for.
          practicesApiService.getLocationsWithDetails(2135).then(
            function (res) {
              ctrl.schedulableLocations = res.data;
            },
            function (error) {
              return {};
            }
          );

          if ($scope.locations) {
            $scope.location = _.find($scope.locations, {
              LocationId: $scope.currentLocation.id,
            });
          }
        });
    };

    // we include any user as a possible override as long as there is at least one location where:
    // provider type is one of {Dentist, Hygienist, Assistant, Other} and provider on claims is 'self' and provider is active
    ctrl.initPredeterminationProviders = function () {
      $scope.predeterminationProviders = [
        {
          Name: 'Provider on Claims Override (Optional)',
          ProviderId: ctrl.emptyUser,
          IsPreferred: false,
        },
      ];
      for (let i = 0; i < ctrl.providers.length; ++i) {
        let dentistHygienistOnClaim = ctrl.providers[i].Locations.filter(
          x =>
            x.ProviderOnClaimsRelationship === 1 &&
            x.IsActive &&
            (x.ProviderTypeId === 1 ||
              x.ProviderTypeId === 2 ||
              x.ProviderTypeId === 3 ||
              x.ProviderTypeId === 5)
        );
        if (dentistHygienistOnClaim.length > 0) {
          let providerId = ctrl.providers[i].UserId;
          $scope.predeterminationProviders.push({
            Name:
              ctrl.providers[i].FirstName + ' ' + ctrl.providers[i].LastName,
            ProviderId: providerId,
            IsPreferred:
              providerId === $scope.patientInfo.PreferredDentist ||
              providerId === $scope.patientInfo.PreferredHygienist,
          });
        }
      }
      $scope.providerOnDetermination = ctrl.emptyUser;
    };
    //#endregion

    //#region Get Service Codes
    /**
     * Get service codes.
     *
     * @returns {angular.IPromise}
     */
    ctrl.initializeServiceCodes = function () {
      return referenceDataService
        .getData(referenceDataService.entityNames.serviceCodes)
        .then(function (serviceCodes) {
          ctrl.serviceCodes = serviceCodes;
          return ctrl.serviceCodes;
        });
    };

    //#endregion

    ctrl.getConsentMessage = function () {
      treatmentConsentService.getConsent().then(function (res) {
        if (res && res.Value) {
          $scope.consentMessage = res.Value.Text;
        }
      });
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

    // call auth function
    ctrl.authAccess();

    ctrl.checkIsPlanDuplicatable = function (
      services,
      activeTreatmentPlanStatus
    ) {
      $scope.isNotDuplicatable = false;
      // cant duplicate a treatment plans that is completed
      if (activeTreatmentPlanStatus == 'Completed') {
        $scope.isNotDuplicatable = true;
      }
      // cant duplicate a treatment plan that has services that aren't proposed
      _.forEach(services, function (service) {
        if (service.ServiceTransaction.ServiceTransactionStatusId != 1) {
          $scope.isNotDuplicatable = true;
        }
      });
    };

    $scope.$on('soar-is-plan-duplicatable', function (event, services) {
      ctrl.checkIsPlanDuplicatable(
        services,
        $scope.activeTreatmentPlan.TreatmentPlanHeader.Status
      );
    });
    // listening for changes to ExistingTreatmentPlans
    $scope.$watch(
      function () {
        return treatmentPlansFactory.ExistingTreatmentPlans;
      },
      function (nv) {
        // only reload existing treatment plans if something has changes

        if (_.isEqual(nv, ctrl.existingTreatmentPlans)) {
          ctrl.existingTreatmentPlans = nv;
        }
      }
    );

    // TODO not sure TreatmentPlanCopy serves a purpose
    // parts are renamed to stages
    // listening for changes to TreatmentPlanCopy
    $scope.$watch(
      function () {
        return treatmentPlansFactory.TreatmentPlanCopy;
      },
      function (nv) {
        $scope.savingPlan = false;
        $scope.plan = nv;
      }
    );

    $scope.$watch('planOnDetermination', function (nv, ov) {
      $scope.hasPredeterminationForCurrentPlan = ctrl.checkForReceivedPredetermination(
        $scope.activeTreatmentPlan
      );
    });

    // listening for changes to Editing
    $scope.$watch(
      function () {
        return treatmentPlansFactory.Editing;
      },
      function (nv, ov) {
        if (nv === false) {
          $scope.editing = false;
          // left tab mid-edit and chose to discard changes
          if (
            $scope.plan &&
            $scope.plan.TreatmentPlanHeader.TreatmentPlanNameBackup
          ) {
            $scope.plan.TreatmentPlanHeader.TreatmentPlanName = angular.copy(
              $scope.plan.TreatmentPlanHeader.TreatmentPlanNameBackup
            );
            delete $scope.plan.TreatmentPlanHeader.TreatmentPlanNameBackup;
          }
        }
      }
    );

    $scope.viewPredetermination = function () {
      _.forEach($scope.activeTreatmentPlan.Predeterminations, function (pred) {
        if (
          pred.IsReceived &&
          $scope.planOnDetermination === pred.PatientBenefitPlanId
        ) {
          $location.path(
            _.escape(
              'BusinessCenter/Insurance/Claims/CarrierResponse/' +
                pred.ClaimId +
                '/Patient/' +
                pred.PatientId
            )
          );
        }
      });
    };

    ctrl.checkForReceivedPredetermination = function (activeTreatmentPlan) {
      var val = false;
      if (_.isEmpty(activeTreatmentPlan)) {
        return val;
      }

      var found = _.find(
        activeTreatmentPlan.Predeterminations,
        function (pred) {
          return (
            pred.IsReceived &&
            $scope.planOnDetermination === pred.PatientBenefitPlanId
          );
        }
      );
      if (!_.isUndefined(found)) {
        val = true;
      }

      return val;
    };

    //#region update

    // make call to api for update
    $scope.update = function (plan) {
      $scope.editing = !$scope.editing;
      treatmentPlansFactory.SetEditing($scope.editing);
      if (!$scope.editing) {
        treatmentPlansFactory.SetDataChanged(false);
        ctrl.validateForm();
        if ($scope.formIsValid) {
          $scope.setDisableEditFunctions(true);
          treatmentPlansFactory.Update(plan);
          // deleting backup if they chose to save
          if (plan.TreatmentPlanHeader.TreatmentPlanNameBackup) {
            delete plan.TreatmentPlanHeader.TreatmentPlanNameBackup;
          }
        } else {
          $scope.editing = !$scope.editing;
          treatmentPlansFactory.SetEditing($scope.editing);
        }
      } else {
        plan.TreatmentPlanHeader.TreatmentPlanNameBackup = angular.copy(
          plan.TreatmentPlanHeader.TreatmentPlanName
        );
        treatmentPlansFactory.SetDataChanged(true);
      }
    };

    //#endregion

    //#region delete

    // instantiate delete modal, etc.
    $scope.delete = function (plan) {
      ctrl.planMarkedForDeletion = plan;
      modalFactory
        .DeleteModal('plan ', plan.TreatmentPlanHeader.TreatmentPlanName, true)
        .then(ctrl.confirmDelete);
    };

    // calling factory method to handle deletion call
    ctrl.confirmDelete = function () {
      // default removeServicesFromAppt
      $scope.removeServicesFromAppt = false;
      // do we have services on appts
      var promptToRemoveServices = treatmentPlansFactory.ShouldPromptToRemoveServicesFromAppointment(
        ctrl.planMarkedForDeletion,
        null,
        null
      );

      // if so do we want to delete them
      if (promptToRemoveServices) {
        ctrl.confirmDeleteServicesFromAppts(null);
      } else {
        ctrl.deletePlan();
      }
    };

    // delete a treatment plan
    ctrl.deletePlan = function () {
      treatmentPlansFactory.Delete(
        ctrl.planMarkedForDeletion,
        $scope.removeServicesFromAppt
      );
    };

    //#endregion

    //#region validation

    ctrl.validateForm = function () {
      $scope.formIsValid = !_.isEmpty(
        $scope.activeTreatmentPlan.TreatmentPlanHeader.TreatmentPlanName
      );
    };

    ctrl.validateDuplicateTreatmentPlanForm = function () {
      $scope.isDuplicatePlanValid = true;
      _.forEach(ctrl.existingTreatmentPlans, function (tp) {
        if (
          tp.TreatmentPlanHeader.TreatmentPlanName ===
            $scope.ntp.TreatmentPlanHeader.TreatmentPlanName &&
          tp.TreatmentPlanHeader.TreatmentPlanId !==
            $scope.ntp.TreatmentPlanHeader.TreatmentPlanId
        ) {
          $scope.isDuplicatePlanValid = false;
        }
      });
    };

    //#endregion

    // closing
    $scope.closeTxPlan = function () {
      if ($scope.editing) {
        $scope.activeTreatmentPlan.TreatmentPlanHeader.TreatmentPlanName =
          $scope.activeTreatmentPlan.TreatmentPlanHeader.TreatmentPlanNameBackup;
      }
      $scope.viewSettings.expandView = false;
      $scope.viewSettings.activeExpand = 0;
      treatmentPlansFactory.SetActiveTreatmentPlan(null);
      treatmentPlansFactory.CollapseAll();
      if (!_.isNil(treatmentPlansFactory.NewTreatmentPlan)) {
        treatmentPlansFactory.NewTreatmentPlan = null;
      }
    };

    $scope.planStages = [];
    $scope.addSection = function () {
      if ($scope.planStages.length === 0) {
        var firstStage = {};
        firstStage.stageno = 1;
        $scope.planStages.push(firstStage);
      }
      var newStage = {};
      newStage.stageno = ctrl.getMaxStageNumber($scope.planStages) + 1;
      $scope.planStages.push(newStage);
      $scope.checkForEmptyStage();

      treatmentPlansFactory.SetPlanStages($scope.planStages);
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
      if ($scope.activeTreatmentPlan) {
        var services = $scope.activeTreatmentPlan.TreatmentPlanServices;
        for (var j = 0; j <= services.length - 1; j++) {
          if (
            services[j].TreatmentPlanServiceHeader.TreatmentPlanGroupNumber ==
            stage
          ) {
            return true;
          }
        }
      }
      return false;
    };

    ctrl.getMaxStageNumber = function (stages) {
      var stagenums = [];
      _.forEach(stages, function (v) {
        stagenums.push(v.stageno);
      });
      return Math.max.apply(null, stagenums);
    };

    $scope.$on('_soar-check-empty-stage', function (event) {
      $scope.checkForEmptyStage();
    });

    $scope.addPlannedServiceAuthAbbrev = 'soar-clin-cpsvc-add';
    $scope.modalIsOpen = false;

    ctrl.successHandler = function (newItem) {
      $scope.modalIsOpen = false;
      if (newItem) {
        // deselect teeth
        if ($scope.selection && $scope.selection.teeth) {
          $scope.selection.teeth = [];
        }
        if (newItem.length > 0) {
          $scope.$emit('soar:chart-services-reload-ledger');
        }
      }
    };
    $scope.checkCanAddSection = function () {
      var result = false;
      var groupNumbers = [];
      if (
        $scope.activeTreatmentPlan &&
        $scope.activeTreatmentPlan.TreatmentPlanServices
      ) {
        _.forEach(
          $scope.activeTreatmentPlan.TreatmentPlanServices,
          function (tps) {
            if (result === false) {
              if (
                groupNumbers.indexOf(
                  tps.TreatmentPlanServiceHeader.TreatmentPlanGroupNumber
                ) !== -1
              ) {
                result = true;
              } else {
                groupNumbers.push(
                  tps.TreatmentPlanServiceHeader.TreatmentPlanGroupNumber
                );
              }
            }
          }
        );
      }
      return result;
    };

    $scope.addServices = function (stage) {
      var modalInstance = modalFactory.Modal({
        windowTemplateUrl: 'uib/template/modal/window.html',
        templateUrl:
          'App/Patient/patient-chart/treatment-plans/add-services/add-services.html',
        controller: 'AddTxPlanServicesController',
        amfa: $scope.addPlannedServiceAuthAbbrev,
        backdrop: 'static',
        keyboard: false,
        size: 'lg',
        windowClass: 'center-modal',
        resolve: {
          addServicesCallback: function () {
            return ctrl.addServicesToTreatmentPlan;
          },
          patient: function () {
            return $scope.patientInfo;
          },
          stageNumber: function () {
            return stage;
          },
          treatmentPlanId: function () {
            return $scope.activeTreatmentPlan.TreatmentPlanHeader
              .TreatmentPlanId;
          },
          treatmentPlanServices: function () {
            return $scope.activeTreatmentPlan.TreatmentPlanServices;
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
      modalInstance.IsEditTreatmentPlan = true;
    };

    ctrl.addServicesModalCallback = function (service, stage) {
      // set insurance order based on treatmentPlanService.Priority (if added to an appointment)
      $scope.insuranceInitialized = false;
      if (!service.$$new) {
        treatmentPlansFactory.AddPlannedService(service, stage);
      } else {
        var alreadyExists = false;
        _.forEach(
          $scope.activeTreatmentPlan.TreatmentPlanServices,
          function (tps) {
            if (alreadyExists === false) {
              alreadyExists =
                tps.TreatmentPlanServiceHeader.TreatmentPlanServiceId ===
                service.TreatmentPlanServiceHeader.TreatmentPlanServiceId;
            }
          }
        );
        if (
          typeof service.TreatmentPlanServiceHeader != 'undefined' &&
          alreadyExists === false
        ) {
          $scope.activeTreatmentPlan.TreatmentPlanServices = _.concat(
            service,
            $scope.activeTreatmentPlan.TreatmentPlanServices
          ); // changed so new service is at beginning of array
          treatmentPlansFactory.UpdatePredeterminationList(service, true);
          if (service.ServiceTransaction.AppointmentId) {
            var appt = listHelper.findItemByFieldValue(
              treatmentPlansFactory.PatientAppointments,
              'AppointmentId',
              service.ServiceTransaction.AppointmentId
            );
            if (appt) {
              appt.PlannedServices.push(service.ServiceTransaction);
            }
          }
        }
      }
    };

    $scope.CreateAlternatePlan = function () {
      //if ($scope.hasTreatmentPlanCreateAccess) {
      treatmentPlansFactory.SetDataChanged(true);
      var alternateGroupId =
        $scope.activeTreatmentPlan.TreatmentPlanHeader.AlternateGroupId;
      treatmentPlansFactory.SetActiveTreatmentPlan(null);
      treatmentPlansFactory.CollapseAll();
      $scope.formIsValid = true;
      var altTreatmentPlan = treatmentPlansFactory.BuildTreatmentPlanDto(
        null,
        $scope.personId
      );
      altTreatmentPlan.TreatmentPlanHeader.TreatmentPlanName =
        'Alt of Treatment Plan';
      altTreatmentPlan.TreatmentPlanHeader.AlternateGroupId = alternateGroupId;
      treatmentPlansFactory.SetNewTreatmentPlan(altTreatmentPlan);
      $scope.viewSettings.expandView = true;
      $scope.viewSettings.activeExpand = 2;
      $scope.viewSettings.txPlanActiveId = null;
      // }
    };

    $scope.serviceAmountTotal = function (services) {
      var serviceAmounts = _.map(services, function (service) {
        return service.ServiceTransaction.IsDeleted !== true
          ? service.ServiceTransaction.Amount
          : 0;
      });
      var sum = _.sum(serviceAmounts);
      return sum;
    };

    $scope.saveNote = function (e) {
      if (
        !angular.equals(
          $scope.activeTreatmentPlan.TreatmentPlanHeader.Note,
          ctrl.noteBackup
        )
      ) {
        $scope.setDisableEditFunctions(true);
        _.forEach(ctrl.existingTreatmentPlans, function (tp) {
          if (
            tp.TreatmentPlanHeader.TreatmentPlanId ===
            $scope.activeTreatmentPlan.TreatmentPlanHeader.TreatmentPlanId
          ) {
            tp.TreatmentPlanHeader.Note =
              $scope.activeTreatmentPlan.TreatmentPlanHeader.Note;
          }
        });
        $scope.disablePrint = true;
        treatmentPlansFactory.Update($scope.activeTreatmentPlan);
        ctrl.noteBackup = angular.copy(
          $scope.activeTreatmentPlan.TreatmentPlanHeader.Note
        );
      }
      if (
        e.relatedTarget !== null &&
        e.relatedTarget.id === 'printPreviewTxPlan'
      ) {
        $scope.disablePrint = false;
        $scope.printPreviewTreatmentPlan(e);
      }
    };

    $scope.createDuplicatePlan = function () {
      treatmentPlansFactory.SetDataChanged(true);
      treatmentPlansFactory.CollapseAll();

      var tph = angular.copy($scope.activeTreatmentPlan.TreatmentPlanHeader);
      var tps = angular.copy($scope.activeTreatmentPlan.TreatmentPlanServices);
      tph.TreatmentPlanId = null;
      var ntp = treatmentPlansFactory.BuildTreatmentPlanDto(
        null,
        $scope.personId
      );
      ntp.TreatmentPlanHeader.TreatmentPlanName =
        'Copy of ' + tph.TreatmentPlanName;
      for (var item in tps) {
        tps[item].TreatmentPlanServiceHeader.TreatmentPlanId = null;
        tps[item].TreatmentPlanServiceHeader.TreatmentPlanServiceId = null;
      }
      ntp.TreatmentPlanServices = tps;
      $scope.ntp = ntp;
      ctrl.validateDuplicateTreatmentPlanForm();
      if ($scope.isDuplicatePlanValid) {
        treatmentPlansFactory.Create(null, $scope.personId, true, ntp);
        $scope.viewSettings.expandView = true;
        $scope.viewSettings.txPlanActiveId = null;
      } else {
        toastrFactory.error(
          localize.getLocalizedString(
            'Duplicated treatment plan must have a unique name.'
          ),
          localize.getLocalizedString('Server Error')
        );
      }
    };
    // confirm there are no services selected

    ctrl.confirmNoServices = function () {
      var message = localize.getLocalizedString(
        'Please select at least one proposed service to schedule.'
      );
      var title = localize.getLocalizedString('Create Appointment');
      var button1Text = localize.getLocalizedString('OK');
      modalFactory.ConfirmModal(title, message, button1Text);
    };

    ctrl.confirmServicesOnAppointment = function () {
      var message = localize.getLocalizedString(
        'One or more selected services are already scheduled. Please unselect any scheduled services and try again.'
      );
      var title = localize.getLocalizedString('Create Appointment');
      var button1Text = localize.getLocalizedString('OK');
      modalFactory.ConfirmModal(title, message, button1Text);
    };

    // set the InsuranceOrder on serviceTransactions that are to be added to an appointment based
    // on the TreatmentPlanServiceHeader.ServiceTransaction.Priority
    ctrl.setInsuranceOrderOnServices = function (treatmentPlanServices) {
      var proposedServices = [];
      // sort the service transactions by TreatmentPlanGroupNumber, then  Priority
      treatmentPlanServices = $filter('orderBy')(treatmentPlanServices, [
        'TreatmentPlanServiceHeader.TreatmentPlanGroupNumber',
        'TreatmentPlanServiceHeader.Priority',
      ]);
      var nextInsuranceOrder = 1;
      // set InsuranceOrder based on Priority
      _.forEach(treatmentPlanServices, function (treatmentPlanService) {
        treatmentPlanService.ServiceTransaction.InsuranceOrder = nextInsuranceOrder;
        proposedServices.push(treatmentPlanService.ServiceTransaction);
        nextInsuranceOrder++;
      });
      return proposedServices;
    };

    // check to see if there are
    // 1) any treatmentPlanServices selected to add to an Appointment
    // 2) if there are any of these that have an appointmentId (this would prevent adding them)
    // message if no services or if one of the services has an appointmentid and return false
    ctrl.canCreateAnAppointment = function (treatmentPlanServices) {
      if (treatmentPlanServices.length > 0) {
        var treatmentPlanServicesOnAppointments = _.filter(
          treatmentPlanServices,
          function (treatmentPlanService) {
            return treatmentPlanService.ServiceTransaction.AppointmentId;
          }
        );
        if (treatmentPlanServicesOnAppointments.length > 0) {
          ctrl.confirmServicesOnAppointment();
          return false;
        }
        var serviceLocationId =
          treatmentPlanServices[0].ServiceTransaction.LocationId;
        var servicesFromOtherLocations = _.filter(
          treatmentPlanServices,
          function (treatmentPlanService) {
            return (
              treatmentPlanService.ServiceTransaction.LocationId !=
              serviceLocationId
            );
          }
        );
        if (servicesFromOtherLocations.length > 0) {
          var multilocationModal = $uibModal.open({
            templateUrl:
              'App/Patient/patient-chart/treatment-plans/treatment-plans-crud/scheduling-multiple-locations-alert.html',
            scope: $scope,
            controller: function () {
              $scope.close = function () {
                multilocationModal.close();
              };
            },
            size: 'md',
            windowClass: 'center-modal',
          });
          return false;
        }

        // check if the user has access to schedule service(s) for the location specified
        // if the location is not present then we can just tell them that they will not have access
        let tempLocation = _.find(ctrl.schedulableLocations, {
          LocationId: treatmentPlanServices[0].ServiceTransaction.LocationId,
        });
        if (tempLocation === null || tempLocation === undefined) {
          var modalInstance = $uibModal.open({
            templateUrl:
              'App/Patient/patient-chart/treatment-plans/treatment-plans-crud/scheduling-multiple-locations-authorization-failed-alert.html',
            scope: $scope,
            controller: function () {
              $scope.close = function () {
                modalInstance.close();
              };
            },
            size: 'md',
            windowClass: 'center-modal',
          });
          return false;
        }

        return true;
      } else {
        ctrl.confirmNoServices();
        return false;
      }
    };

    ctrl.canIncludeInAppointment = function (treatmentPlanService) {
      let canBeIncluded = true;

      switch (treatmentPlanService.$$statusName) {
        case 'Pending':
        case 'Completed':
        case 'Referred':
        case 'Referred Completed':
        case 'Rejected':
          canBeIncluded = false;
          break;
        default:
          canBeIncluded = true;
      }

      if (treatmentPlanService.IsDeleted) {
        canBeIncluded = false;
      }

      return canBeIncluded;
    };

    $scope.createAppointment = function () {
      //
      // filter for treatment plan services that have ServiceTransaction.$$IncludeInAppointment = true
      var treatmentPlanServicesForAppointment = _.filter(
        $scope.activeTreatmentPlan.TreatmentPlanServices,
        function (treatmentPlanService) {
          return (
            treatmentPlanService.ServiceTransaction.$$IncludeInAppointment ===
              true &&
            ctrl.canIncludeInAppointment(
              treatmentPlanService.ServiceTransaction
            )
          );
        }
      );
      // check to see if there are treatmentPlanServicesForAppointment AND can we create appointment with selected services
      if (ctrl.canCreateAnAppointment(treatmentPlanServicesForAppointment)) {
        if ($scope.linkToScheduleV2) {
          schedulingMFENavigator.navigateToAppointmentModal({
            patientId: $scope.personId,
            locationId: ctrl.getLoggedInLocation(),
            serviceTransactionIds: treatmentPlanServicesForAppointment.map(
              (service) => service.ServiceTransaction.ServiceTransactionId
            ).filter((id) => id),
          }, true);
          return;
        }
        // set insurance order based on treatmentPlanService.Priority
        var proposedServices = _.cloneDeep(
          ctrl.setInsuranceOrderOnServices(treatmentPlanServicesForAppointment)
        );

        // Attach Service Code active status to proposedServices
        _.forEach(proposedServices, function (service) {
          var serviceCode = _.find(ctrl.serviceCodes, {
            ServiceCodeId: service.ServiceCodeId,
          });
          service.IsActive = serviceCode.IsActive;
          service.InactivationDate = serviceCode.InactivationDate;

          // through a series of unfortunate events we are left with a description that we need to adjust.
          service.Description = serviceCode.Description;
        });
        treatmentPlansFactory.SetAppointmentServices(proposedServices);
        var locationId = proposedServices[0].LocationId;
        var appointmentData = patientAppointmentsFactory.AppointmentData(
          $scope.patientInfo
        );

        if (!appointmentData.Location || !appointmentData.LocationId) {
          appointmentData.LocationId = locationId;
          appointmentData.Location = appointmentData.Location
            ? appointmentData.Location
            : { LocationId: locationId };
        }

        var tmpAppt = {
          AppointmentId: null,
          AppointmentTypeId: null,
          Classification: 2,
          EndTime: null,
          PersonId: $scope.personId,
          PlannedServices: proposedServices,
          ProposedDuration: 15,
          ProviderAppointments: [],
          ServiceCodes: [],
          StartTime: null,
          TreatmentRoomId: null,
          UserId: appointmentData.ProviderId,
          WasDragged: false,
          Location: appointmentData.Location,
          LocationId: appointmentData.LocationId,
          ObjectState: 'Add',
          Person: {},
        };

        appointmentViewDataLoadingService.getViewData(tmpAppt, false).then(
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
      }
    };

    ctrl.getLoggedInLocation = function () {
      // retrieve the location that the user is currently logged into (the location dropdown in the header)
      var loggedInLocation = JSON.parse(sessionStorage.getItem('userLocation'));
      return loggedInLocation.id;
    };

    ctrl.appointmentSaved = function (savedAppointment) {
      // refresh the services
      $scope.loadingAppointment = true;
      // clear appointment services
      treatmentPlansFactory.ClearAppointmentServices();
      if (savedAppointment) {
        var classification = savedAppointment.Classification;
        var modifiedServices = savedAppointment.PlannedServices;

        // reload services from saved appointment rather than call for tx plan
        _.forEach(
          $scope.activeTreatmentPlan.TreatmentPlanServices,
          function (tps) {
            var item = listHelper.findItemByFieldValue(
              modifiedServices,
              'ServiceTransactionId',
              tps.ServiceTransaction.ServiceTransactionId
            );
            if (item) {
              tps.ServiceTransaction.DataTag = item.DataTag;
              tps.ServiceTransaction.AppointmentId = item.AppointmentId;
              tps.ServiceTransaction.ApptClassification = classification;
              tps.ServiceTransaction.ServiceTransactionStatusId =
                item.ServiceTransactionStatusId;
              tps.ServiceTransaction.Amount = item.Amount;
              item.$$Classification = classification;
            }
          }
        );
        treatmentPlansFactory.RefreshTreatmentPlanServices(modifiedServices);
        $scope.loadingAppointment = false;
        treatmentPlansFactory.SetActiveTreatmentPlan(
          $scope.activeTreatmentPlan
        );
        ctrl.setSelected($scope.activeTreatmentPlan);
        treatmentPlansFactory.PatientAppointments.push(savedAppointment);
        $rootScope.$broadcast(
          'appointment:update-appointment',
          savedAppointment
        );
        $rootScope.$broadcast('soar:chart-services-reload-ledger');
        $scope.$emit(
          'soar:tx-plan-services-changed',
          $scope.activeTreatmentPlan.TreatmentPlanServices,
          true
        );
      }
    };

    $scope.$on(
      'soar:treatment-plan-part-appointment-saved',
      function (event, updatedAppointment) {
        ctrl.appointmentSaved(updatedAppointment);
      }
    );

    ctrl.setSelected = function (activeTreatmentPlan) {
      if (_.isEmpty(activeTreatmentPlan)) {
        return;
      }
      _.forEach(activeTreatmentPlan.TreatmentPlanServices, function (tps) {
        tps.ServiceTransaction.$$IncludeInAppointment = true;
      });
    };

    ctrl.appointmentCanceled = function () {
      // clear the appointment services
      treatmentPlansFactory.ClearAppointmentServices();
    };

    $scope.CreateAppointments = function () {
      var stages = [];
      for (var item in $scope.planStages) {
        var stageNumber = $scope.planStages[item].stageno;
        var stageData = {};
        stageData.PersonId = $scope.personId;
        stageData.TreatmentPlanId =
          $scope.activeTreatmentPlan.TreatmentPlanHeader.TreatmentPlanId;
        stageData.Stage = stageNumber;
        stageData.ServiceTransactions = [];
        for (var itm in $scope.activeTreatmentPlan.TreatmentPlanServices) {
          if (
            $scope.activeTreatmentPlan.TreatmentPlanServices[itm]
              .TreatmentPlanServiceHeader.TreatmentPlanGroupNumber ==
            stageNumber
          ) {
            stageData.ServiceTransactions.push(
              $scope.activeTreatmentPlan.TreatmentPlanServices[itm]
                .ServiceTransaction
            );
          }
        }
        stages.push(stageData);
      }
      var stagesafe = [];
      for (var i = 0; i < stages.length; i++) {
        if (stages[i].ServiceTransactions[0].AppointmentId == null) {
          stagesafe.push(stages[i]);
        }
      }
      if (stagesafe.length == 0) {
        toastrFactory.error(
          localize.getLocalizedString(
            'Unscheduled appointment already created.'
          ),
          localize.getLocalizedString('Please try again')
        );
        return false;
      }
      treatmentPlansFactory
        .CreateAppointments(
          $scope.personId,
          $scope.activeTreatmentPlan.TreatmentPlanHeader.TreatmentPlanId,
          stagesafe
        )
        .then(function (res) {
          if (res && res.Value) {
            _.forEach(
              $scope.activeTreatmentPlan.TreatmentPlanServices,
              function (tps) {
                _.forEach(res.Value, function (response) {
                  var item = listHelper.findItemByFieldValue(
                    response.ServiceTransactions,
                    'ServiceTransactionId',
                    tps.ServiceTransaction.ServiceTransactionId
                  );
                  if (item) {
                    tps.ServiceTransaction.DataTag = item.DataTag;
                    tps.ServiceTransaction.AppointmentId = item.AppointmentId;
                  }
                });
              }
            );
          }
          treatmentPlansFactory.SetActiveTreatmentPlan(
            $scope.activeTreatmentPlan
          );
          $scope.planStages = treatmentPlansFactory.LoadPlanStages(
            $scope.activeTreatmentPlan.TreatmentPlanServices
          );
        });
    };
    //#region Insurance Estimate

    $scope.resetEstimatedInsurance = function () {
      $scope.setDisableEditFunctions(true);
      treatmentPlansFactory
        .ResetEstimatedInsurance($scope.activeTreatmentPlan)
        .then(function () {
          treatmentPlansFactory.GetAllHeaders($scope.personId, true);
          ctrl.recalculateInsuranceEstimates();
        });
    };

    ctrl.recalculateInsuranceEstimates = function () {
      // get latest insurance estimates
      ctrl.updateInsuranceEstimateWithOverrides();

      // calculate est ins totals on tp when tp changes
      ctrl.calculateInsuranceTotals();
      // calculate plan totals
      ctrl.calculatePlanTotals();
      // set hasPredetermination
      ctrl.setHasPredetermination();
    };

    $rootScope.$on('soar:tx-est-ins-overridden', function () {
      ctrl.setResetEstimatedInsuranceState();
    });

    $scope.insuranceInitialized = false;
    $scope.$watch(
      'activeTreatmentPlan.TreatmentPlanServices',
      function (nv, ov) {
        // servicesThatHaveNotBeenPersisted contains list of services that haven't been persisted
        var servicesThatHaveNotBeenPersisted = [];
        //resort services before calculating ins
        if (nv && nv.length > 0) {
          servicesThatHaveNotBeenPersisted = _.filter(
            nv,
            function (treatmentPlanService) {
              return (
                treatmentPlanService.TreatmentPlanServiceHeader
                  .TreatmentPlanId === null
              );
            }
          );
        }
        // calculate est ins totals on tp when tp changes
        ctrl.calculateInsuranceTotals();
        // calculate plan totals
        ctrl.calculatePlanTotals();
        // no need to do any of these dependent functions if the treatment plan services is empty or any of the services have not been persisted
        if (
          nv &&
          nv.length > 0 &&
          servicesThatHaveNotBeenPersisted.length === 0
        ) {
          treatmentPlansFactory.AddAreaToServices(nv);
          if (!$scope.insuranceInitialized) {
            $scope.insuranceInitialized = true;
            ctrl.recalculateInsuranceEstimates();
            // set provider on predetermination
            ctrl.setPrintEnabled();
          }
        }
        // NOTE, this could be simplified to build this list each time the send Predetermination button is clicked
        // reset PredeterminationList after services change
        treatmentPlansFactory.InitPredeterminationList();
        // set current services for PredeterminationList
        angular.forEach(nv, function (tps) {
          treatmentPlansFactory.UpdatePredeterminationList(tps, true);
        });
      },
      true
    );

    $scope.insuranceEstimateTotal = 0;
    $scope.patientPortionTotal = 0;
    $scope.adjustedEstimateTotal = 0;

    // calculate totals when the services change
    ctrl.calculateInsuranceTotals = function () {
      $scope.insuranceEstimateTotal = 0;
      $scope.patientPortionTotal = 0;
      $scope.adjustedEstimateTotal = 0;
      if (
        $scope.activeTreatmentPlan &&
        $scope.activeTreatmentPlan.TreatmentPlanServices
      ) {
        _.forEach(
          $scope.activeTreatmentPlan.TreatmentPlanServices,
          function (ps) {
            if (
              ps.ServiceTransaction.IsDeleted !== true &&
              ps.ServiceTransaction.ServiceTransactionStatusId !== 4 &&
              ps.ServiceTransaction.ServiceTransactionStatusId !== 8 &&
              ps.ServiceTransaction.ServiceTransactionStatusId !== 3 &&
              ps.ServiceTransaction.ServiceTransactionStatusId !== 2
            ) {
              if (ps.ServiceTransaction.InsuranceEstimates) {
                $scope.insuranceEstimateTotal += $scope.sum(
                  ps.ServiceTransaction.InsuranceEstimates,
                  'EstInsurance'
                );
                $scope.adjustedEstimateTotal += $scope.sum(
                  ps.ServiceTransaction.InsuranceEstimates,
                  'AdjEst'
                );
                ps.ServiceTransaction.PatientBalance =
                  ps.ServiceTransaction.Amount -
                  $scope.sum(
                    ps.ServiceTransaction.InsuranceEstimates,
                    'EstInsurance'
                  ) -
                  $scope.sum(
                    ps.ServiceTransaction.InsuranceEstimates,
                    'AdjEst'
                  );
                $scope.patientPortionTotal +=
                  ps.ServiceTransaction.PatientBalance;
              } else {
                ps.ServiceTransaction.PatientBalance =
                  ps.ServiceTransaction.Fee;
              }
            } else {
              ps.ServiceTransaction.PatientBalance = 0;
            }
          }
        );
      }
    };

    ctrl.setResetEstimatedInsuranceState = function () {
      if (
        $scope.activeTreatmentPlan &&
        $scope.activeTreatmentPlan.TreatmentPlanServices
      ) {
        var hasInsuranceOverrides = $scope.activeTreatmentPlan.TreatmentPlanServices.find(
          txService => {
            if (
              txService.TreatmentPlanServiceHeader
                .TreatmentPlanInsuranceEstimates &&
              txService.TreatmentPlanServiceHeader
                .TreatmentPlanInsuranceEstimates.length > 0
            ) {
              var estimateOverride = txService.TreatmentPlanServiceHeader.TreatmentPlanInsuranceEstimates.find(
                estimate => {
                  return estimate.IsUserOverRidden == true;
                }
              );
              if (estimateOverride) {
                return true;
              } else {
                return false;
              }
            } else {
              return false;
            }
          }
        );
        if (hasInsuranceOverrides) {
          $scope.isResetEstimatedInsuranceEnabled = true;
        } else {
          $scope.isResetEstimatedInsuranceEnabled = false;
        }
      } else {
        $scope.isResetEstimatedInsuranceEnabled = false;
      }
    };

    ctrl.updateInsuranceEstimateWithOverrides = function () {
      if ($scope.updatingInsurance === false) {
        $scope.disablePrint = true;
        $scope.enableNote = false;
        $scope.updatingInsurance = true;
        // need applyDiscount set for financialServices factory to calculate insurance properly when there is a discount
        _.forEach(
          $scope.activeTreatmentPlan.TreatmentPlanServices,
          function (tps) {
            tps.ServiceTransaction.Discount > 0
              ? (tps.ServiceTransaction.applyDiscount = true)
              : (tps.ServiceTransaction.applyDiscount = false);
          }
        );
        treatmentPlansFactory
          .CalculateInsuranceEstimatesWithOverride($scope.activeTreatmentPlan)
          .then(function (res) {
            treatmentPlansFactory.SetInsuranceEstimateObjectState(
              $scope.activeTreatmentPlan.TreatmentPlanServices
            );
            $scope.enableNote = true;
            $scope.updatingInsurance = false;
            // calculate patient portion
            treatmentPlansFactory.PatientPortion($scope.activeTreatmentPlan);
            // if insurance changes, recalculat totals
            ctrl.calculateInsuranceTotals();
            // set allowCreatePredetermination based on ins est
            ctrl.setAllowCreatePredetermination();
            ctrl.setPrintEnabled();
            ctrl.setResetEstimatedInsuranceState();

            $scope.$emit('soar:tx-plan-services-changed', res.Value, true);
            $scope.$broadcast('soar:tx-plan-services-changed', res.Value, true);
            $scope.setDisableEditFunctions(false);
          });
      } else {
        $scope.setDisableEditFunctions(false);
      }
    };

    $scope.$on('reloadProposedServices', function (e, updatedService) {
      $scope.serviceTransactionsUpdated(updatedService);
    });

    $scope.setDisableEditFunctions = function (value) {
      $scope.disableEditFunctions = value;
      $scope.$broadcast('soar:tx-plan-disable-edit-functions', value);
    };

    $scope.$on('soar:tx-plan-editinprogress', function (e, value) {
      $scope.setDisableEditFunctions(value);
    });

    $scope.serviceTransactionsUpdated = function (serviceTransactionsToUpdate) {
      var modifiedServices = [];
      if (serviceTransactionsToUpdate != null) {
        ctrl.getUserCode(serviceTransactionsToUpdate[0]);

        angular.forEach(
          $scope.activeTreatmentPlan.TreatmentPlanServices,
          function (tps) {
            if (
              tps.ServiceTransaction.ServiceTransactionId ==
              serviceTransactionsToUpdate[0].ServiceTransactionId
            ) {
              tps.ServiceTransaction = serviceTransactionsToUpdate[0];

              patientServicesFactory
                .GetTaxAndDiscountByPersonId(
                  [tps.ServiceTransaction],
                  $scope.activeTreatmentPlan.TreatmentPlanHeader.PersonId
                )
                .then(function (res) {
                  tps.ServiceTransaction = res.Value[0];

                  treatmentPlansFactory
                    .CalculateInsuranceEstimateWithOverrides(
                      $scope.activeTreatmentPlan,
                      tps,
                      $scope.patientBenefitPlans
                    )
                    .then(function (res) {
                      treatmentPlansFactory.PatientPortion(
                        $scope.activeTreatmentPlan
                      );
                      treatmentPlansFactory.GetAllHeaders(
                        $scope.personId,
                        true
                      );
                      $scope.$broadcast(
                        'soar:tx-plan-services-changed',
                        res.Value,
                        true
                      );
                      $scope.$emit(
                        'soar:tx-plan-services-changed',
                        res.Value,
                        true
                      );

                      modifiedServices.push(tps.ServiceTransaction);
                      // apply changes to all treatment plans with this proposed service
                      treatmentPlansFactory.RefreshTreatmentPlanServices(
                        modifiedServices
                      );
                      //ctrl.setServiceStatus()
                      $scope.$emit('soar:chart-services-reload-ledger');
                      $rootScope.$emit('soar:tx-est-ins-overridden');
                      $scope.setDisableEditFunctions(false);
                    });
                });
            } else {
              //ctrl.setServiceStatus()
              $scope.$emit('soar:chart-services-reload-ledger');
              $rootScope.$emit('soar:tx-est-ins-overridden');
              $scope.setDisableEditFunctions(false);
            }
          }
        );
      }
    };

    ctrl.getUserCode = function (serviceTransaction) {
      // it would be a lot more efficient to get this from the services in a format you want already.
      let provider = listHelper.findItemByFieldValue(
        ctrl.providers,
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
        ctrl.providers,
        'UserId',
        serviceTransaction.ProviderOnClaimsId
      );
      if (providerOnClaims) {
        serviceTransaction.ProviderOnClaimsUserCode = providerOnClaims.UserCode;
        serviceTransaction.ProviderOnClaimsFullName =
          providerOnClaims.FirstName + ' ' + providerOnClaims.LastName;
      } else {
        serviceTransaction.ProviderOnClaimsFullName = '';
      }
    };

    //#endregion

    //#region Predeterminations

    // indicator that this plan has a predetermination (only one open preD at a time)
    $scope.hasPredetermination = false;
    // set hasPredetermination which indicates whether there is already a predetermination
    ctrl.setHasPredetermination = function () {
      $scope.hasPredetermination =
        $scope.activeTreatmentPlan.TreatmentPlanHeader.HasAtLeastOnePredetermination;
      ctrl.setDisableCreateDeterminationButton($scope.activeTreatmentPlan);
    };

    // indicator that we can create a predetermination for the services on this plan
    $scope.allowCreatePredetermination = false;
    ctrl.setAllowCreatePredetermination = function () {
      $scope.allowCreatePredetermination = treatmentPlansFactory.AllowCreatePredetermination(
        $scope.activeTreatmentPlan
      );
      ctrl.setDisableCreateDeterminationButton($scope.activeTreatmentPlan);
    };

    // create ordered list of services for predetermination
    ctrl.getPredeterminationServices = function () {
      var predeterminationList = [];
      // sort the list
      var treatmentPlanServices = $filter('orderBy')(
        $scope.activeTreatmentPlan.TreatmentPlanServices,
        [
          'TreatmentPlanServiceHeader.TreatmentPlanGroupNumber',
          'TreatmentPlanServiceHeader.Priority',
        ]
      );
      // only include serviceTransactions on selected
      _.forEach(treatmentPlanServices, function (tps) {
        if (
          tps.ServiceTransaction.$$IncludeInAppointment === true &&
          ctrl.canIncludeInAppointment(tps.ServiceTransaction)
        ) {
          predeterminationList.push(tps.ServiceTransaction);
        }
      });
      return predeterminationList;
    };

    // send predetermination services
    $scope.createPredetermination = function (planOnDetermination) {
      $scope.planOnDetermination = planOnDetermination;

      // disable button while creating predetermination
      if (!$scope.disableCreateDeterminationButton) {
        $scope.disableCreateDeterminationButton = true;
        // to insure we have the most recent changes to Priority on each treatmentPlanServices,
        // build list of services
        var predeterminationList = ctrl.getPredeterminationServices();

        var createPredeterminationAccess = patSecurityService.IsAuthorizedByAbbreviation(
          'soar-ins-ipred-add'
        );
        if (createPredeterminationAccess) {
          // pass services instead of plan when api is available
          if ($scope.providerOnDetermination === ctrl.emptyUser) {
            $scope.sendPredeterminationsByService(
              predeterminationList,
              $scope.personId,
              $scope.planOnDetermination,
              $scope.activeTreatmentPlan.TreatmentPlanHeader.TreatmentPlanId
            );
          } else {
            treatmentPlansFactory
              .CreatePredetermination(
                predeterminationList,
                $scope.personId,
                $scope.planOnDetermination,
                $scope.providerOnDetermination,
                $scope.activeTreatmentPlan.TreatmentPlanHeader.TreatmentPlanId
              )
              .then(function () {
                // on success disable button
                $scope.hasPredetermination = true;
                // set enable/disable CreateDeterminationButton
                ctrl.setDisableCreateDeterminationButton(
                  $scope.activeTreatmentPlan
                );
                // get this tp to display latest?
                treatmentPlansFactory.GetAllHeaders($scope.personId, true);
              });
          }
        }
      }
    };

    $scope.sendPredeterminationsByService = function (
      list,
      person,
      plan,
      treatmentPlanId
    ) {
      if (list.length === 0) {
        return;
      }
      let tailOfList = [];
      let i = 1;
      // the following line SHOULD work and we should be able to remove $scope.getClaimsProvider but we cannot do this
      // until someone fixes the assignment of ProviderOnClaimsId when the service is created. - D1 3/24/2020
      //let firstProvider = list[0].ProviderOnClaimsId === ctrl.emptyUser ? list[0].ProviderUserId : list[0].ProviderOnClaimsId
      let firstProvider = $scope.getClaimsProvider(
        list[0].ProviderUserId,
        list[0].LocationId
      );
      while (list.length > i) {
        let curProvider = $scope.getClaimsProvider(
          list[i].ProviderUserId,
          list[i].LocationId
        );
        if (curProvider === firstProvider) {
          ++i;
        } else {
          tailOfList.push(list[i]);
          list.splice(i, 1);
        }
      }
      treatmentPlansFactory
        .CreatePredetermination(
          list,
          person,
          plan,
          firstProvider,
          treatmentPlanId
        )
        .then(function () {
          if (tailOfList.length === 0) {
            // on success disable button
            $scope.hasPredetermination = true;
            // set enable/disable CreateDeterminationButton
            ctrl.setDisableCreateDeterminationButton(
              $scope.activeTreatmentPlan
            );
            // get this tp to display latest?
            treatmentPlansFactory.GetAllHeaders($scope.personId, true);
          } else {
            $scope.sendPredeterminationsByService(
              tailOfList,
              person,
              plan,
              treatmentPlanId
            );
          }
        });
    };

    $scope.getClaimsProvider = function (providerId, locationId) {
      let provider = ctrl.providers.filter(x => x.UserId === providerId);
      if (provider.length > 0) {
        let providerLocation = provider[0].Locations.filter(
          y => y.LocationId === locationId
        );
        if (providerLocation.length > 0) {
          if (providerLocation[0].ProviderOnClaimsRelationship > 1) {
            return providerLocation[0].ProviderOnClaimsId;
          } else {
            return providerId;
          }
        }
      }
      // this should never happen
      return null;
    };

    // when treatment plan changes, reset predetermination flags
    ctrl.resetPredeterminationFlags = function () {
      $scope.hasPredetermination = true;
      $scope.disableCreateDeterminationButton = true;
      $scope.disableCreateDeterminationButtonServiceChecked = true;
      $scope.allowCreatePredetermination = false;
      $scope.hasPredeterminationTooltip = '';
      $scope.insuranceInitialized = false;
    };

    // function to handle rules for disabling create predetermination button
    ctrl.setDisableCreateDeterminationButton = function (activeTreatmentPlan) {
      $timeout(function () {
        var disableTooltipMessage = '';
        var disableButton = false;

        var hasSubmitOnInsuranceAndCdt =
          activeTreatmentPlan &&
          _.some(activeTreatmentPlan.TreatmentPlanServices, function (service) {
            var associatedService = _.find(
              ctrl.serviceCodes,
              function (serviceCode) {
                return (
                  service.ServiceTransaction.ServiceCodeId ===
                  serviceCode.ServiceCodeId
                );
              }
            );
            if (
              associatedService &&
              associatedService.CdtCodeId &&
              associatedService.SubmitOnInsurance
            ) {
              return true;
            }
          });

        // if no providerOnPredtermination disable button
        if (
          !$scope.providerOnDetermination ||
          $scope.providerOnDetermination === ''
        ) {
          disableButton = true;
          disableTooltipMessage += localize.getLocalizedString(
            'You must select a provider before sending the Predetermination.'
          );
        }

        // disable create predetermination if no benefit plan
        if (!$scope.hasBenefitPlan) {
          disableButton = true;
          if (disableTooltipMessage !== '') {
            disableTooltipMessage += '\n';
          }
          disableTooltipMessage += localize.getLocalizedString(
            'There are no benefit plans attached to this patient.'
          );
        } else if (!$scope.planOnDetermination) {
          if (disableTooltipMessage !== '') {
            disableTooltipMessage += '\n';
          }
          disableTooltipMessage += localize.getLocalizedString(
            'You must select a benefit plan before sending the Predetermination.'
          );
        }

        if (!hasSubmitOnInsuranceAndCdt) {
          disableButton = true;
          if (disableTooltipMessage !== '') {
            disableTooltipMessage += '\n';
          }
          if (treatmentPlansFactory.PredeterminationList.length !== 0) {
            disableTooltipMessage += localize.getLocalizedString(
              'At least one of the services must have a CDT Code assigned and be marked to submit to insurance.'
            );
          }
        }

        // disable create predetermination if no services
        if (
          _.isUndefined($scope.copyPredeterminationList) ||
          $scope.copyPredeterminationList === 0
        ) {
          disableButton = true;
          if (disableTooltipMessage !== '') {
            disableTooltipMessage += '\n';
          }
          disableTooltipMessage += localize.getLocalizedString(
            'There are no services on the treatment plan.'
          );
        }
        $scope.disableTooltipMessage = disableTooltipMessage;
        // disable creaate predetermination if no services are selected
        $scope.disableCreateDeterminationButton =
          disableButton ||
          $scope.disableCreateDeterminationButtonServiceChecked;
      });

      // Disable this until rules are available for when to disable

      //if ($scope.hasPredetermination === false && $scope.allowCreatePredetermination===true) {
      //    $scope.disableCreateDeterminationButton = false;

      //} else {
      //    $scope.disableCreateDeterminationButton = true;
      //    $scope.hasPredeterminationTooltip = localize.getLocalizedString('This treatment plan has a Predetermination');
      //}
    };

    //#endregion

    $scope.UpdateRecommend = function (plan) {
      ctrl.validateForm();
      if ($scope.formIsValid) {
        if (plan.TreatmentPlanHeader.Status != 'Completed') {
          treatmentPlansFactory.Update(plan);
        }
      }
    };

    $scope.actionRecommended = function (plan) {
      if (
        plan.TreatmentPlanHeader.Status != 'Completed' &&
        $scope.savingPlan !== true &&
        $scope.disableEditFunctions !== true
      ) {
        if (plan.TreatmentPlanHeader.IsRecommended == true)
          plan.TreatmentPlanHeader.IsRecommended = false;
        else plan.TreatmentPlanHeader.IsRecommended = true;

        $scope.setDisableEditFunctions(true);

        $scope.savingPlan = true;
        $scope.UpdateRecommend(plan);
      }
    };

    /**
     * gets all the providers.
     *
     * @returns {angular.IPromise}
     */
    ctrl.loadProviders = function () {
      return referenceDataService
        .getData(referenceDataService.entityNames.users)
        .then(function (providers) {
          ctrl.providers = providers;
          return ctrl.providers;
        });
    };

    // get patient benefit plans we will move to factory when
    ctrl.getPatientBenefitPlans = function () {
        $scope.loadingBenefitPlans = true;        
        treatmentPlansFactory.LoadingPatientBenefitPlans = true;
      patientBenefitPlansFactory
        .PatientBenefitPlans($scope.patientInfo.PatientId)
        .then(function (res) {
          $scope.patientBenefitPlans = _.filter(res.Value, function (plan) {
            return (
              plan.PolicyHolderBenefitPlanDto.BenefitPlanDto.ClaimMethod !== 3
            );
          });
          $scope.patientBenefitPlans = $filter('orderBy')(
            $scope.patientBenefitPlans,
            'Priority'
            );            
          $timeout(function () {
            // let the kendo grid load on the html before setting the default selected
            ctrl.setPlanOnPredetermination();
              $scope.loadingBenefitPlans = false;              
              treatmentPlansFactory.LoadingPatientBenefitPlans = false;
          });
        });
    };

    // Until we have priority, just pick the first plan NOTE will move to factory when more functionality
    ctrl.setPlanOnPredetermination = function () {
      if ($scope.patientBenefitPlans && $scope.patientBenefitPlans.length > 0) {
        $scope.hasBenefitPlan = true;
        $scope.planOnDetermination =
          $scope.patientBenefitPlans[0].PatientBenefitPlanId;
      } else {
        $scope.hasBenefitPlan = false;
      }
      ctrl.setAllowCreatePredetermination();
    };

    //#region select services for predetermination

    // observer for watching the predetermination list for changes
    ctrl.getPredeterminationListChanges = function (predeterminationList) {
      ctrl.setDisableCreateDeterminationButton($scope.activeTreatmentPlan);
    };

    // reset the PredeterminationList to all services in tx plan each time the activeTreatementPlan changes
    ctrl.initPredeterminationList = function (treatmentPlanServices) {
      angular.forEach(treatmentPlanServices, function (tps) {
        treatmentPlansFactory.UpdatePredeterminationList(tps, true);
      });
    };

    $scope.$watch(
      'providerOnDetermination',
      function (nv, ov) {
        ctrl.setDisableCreateDeterminationButton($scope.activeTreatmentPlan);
      },
      true
    );

    //#region confirm remove services from appt when plan or stage deleted

    $scope.removeServicesFromAppt = false;

    // modal to confirm deleting services from appt when plan or stage is deleted
    ctrl.confirmDeleteServicesFromAppts = function (stageNo) {
      var data = true;
      var message = stageNo
        ? localize.getLocalizedString(
            'This treatment plan contains services that are currently scheduled.\n\n Would you like to remove these services from their appointment as well?'
          )
        : localize.getLocalizedString(
            'This treatment plan contains services that are currently scheduled.\n\n Would you like to remove these services from their appointment as well?'
          );
      var title = localize.getLocalizedString(
        'Remove Services from Appointment?'
      );
      var button2Text = localize.getLocalizedString('No, keep');
      var button1Text = localize.getLocalizedString('Yes, remove');
      modalFactory
        .ConfirmModal(title, message, button1Text, button2Text, data)
        .then(ctrl.removeServicesInAppt, ctrl.keepServicesInAppt);
    };

    // keep services in appt
    ctrl.removeServicesInAppt = function () {
      $scope.removeServicesFromAppt = true;
      ctrl.deletePlan();
    };

    ctrl.keepServicesInAppt = function () {
      $scope.removeServicesFromAppt = false;
      ctrl.deletePlan();
    };

    //#endregion

    //#region printTreatmentPlan

    // calculate stage totals when the services change
    ctrl.calculateStageTotals = function (servicesInStage) {
      $scope.insuranceEstimatePartTotal = 0;
      $scope.patientPortionPartTotal = 0;
      angular.forEach(servicesInStage, function (ps) {
        if (ps.ServiceTransaction.InsuranceEstimates) {
          $scope.patientPortionPartTotal += $scope.sum(
            ps.ServiceTransaction.InsuranceEstimates,
            'PatientPortion'
          );
        }
      });
    };

    $scope.totalFeesPerStage = function (treatmentPlanServices, stageno) {
      var chargesTotalForStage = 0;
      var servicesInStage = $filter('filter')(treatmentPlanServices, {
        TreatmentPlanServiceHeader: { TreatmentPlanGroupNumber: stageno },
        ServiceTransaction: { IsDeleted: false },
      });
      angular.forEach(servicesInStage, function (service) {
        chargesTotalForStage +=
          service.ServiceTransaction.Fee -
          service.ServiceTransaction.Discount +
          service.ServiceTransaction.Tax;
      });
      return chargesTotalForStage;
    };

    $scope.totalServicesPerStage = function (treatmentPlanServices, stageno) {
      var servicesInStage = $filter('filter')(treatmentPlanServices, {
        TreatmentPlanServiceHeader: { TreatmentPlanGroupNumber: stageno },
      });
      return servicesInStage ? servicesInStage.length : 0;
    };

    $scope.totalInsuranceEstimatePerStage = function (
      treatmentPlanServices,
      stageno
    ) {
      var insTotalForStage = 0;
      var servicesInStage = $filter('filter')(treatmentPlanServices, {
        TreatmentPlanServiceHeader: { TreatmentPlanGroupNumber: stageno },
        ServiceTransaction: { IsDeleted: false },
      });
      angular.forEach(servicesInStage, function (service) {
        if (service.ServiceTransaction.InsuranceEstimates) {
          // do not include ServiceTransactions with IsDeleted === true or ServiceTransactionStatusId === 4 or ServiceTransactionStatusId === 3 or ServiceTransactionStatusId === 2 or 8 in totals
          if (
            service.ServiceTransaction.IsDeleted !== true &&
            service.ServiceTransaction.ServiceTransactionStatusId !== 4 &&
            service.ServiceTransaction.ServiceTransactionStatusId !== 8 &&
            service.ServiceTransaction.ServiceTransactionStatusId !== 3 &&
            service.ServiceTransaction.ServiceTransactionStatusId !== 2
          ) {
            insTotalForStage += $scope.sum(
              service.ServiceTransaction.InsuranceEstimates,
              'EstInsurance'
            );
          }
        }
      });
      return insTotalForStage;
    };

    $scope.totalAdjustedEstimatePerStage = function (
      treatmentPlanServices,
      stageno
    ) {
      var adjEstTotalForStage = 0;
      var servicesInStage = $filter('filter')(treatmentPlanServices, {
        TreatmentPlanServiceHeader: { TreatmentPlanGroupNumber: stageno },
        ServiceTransaction: { IsDeleted: false },
      });
      angular.forEach(servicesInStage, function (service) {
        if (service.ServiceTransaction.InsuranceEstimates) {
          // do not include ServiceTransactions with IsDeleted === true or ServiceTransactionStatusId === 4 or ServiceTransactionStatusId === 3 or ServiceTransactionStatusId === 2 or 8 in totals
          if (
            service.ServiceTransaction.IsDeleted !== true &&
            service.ServiceTransaction.ServiceTransactionStatusId !== 4 &&
            service.ServiceTransaction.ServiceTransactionStatusId !== 8 &&
            service.ServiceTransaction.ServiceTransactionStatusId !== 3 &&
            service.ServiceTransaction.ServiceTransactionStatusId !== 2
          ) {
            adjEstTotalForStage += $scope.sum(
              service.ServiceTransaction.InsuranceEstimates,
              'AdjEst'
            );
          }
        }
      });
      return adjEstTotalForStage;
    };

    $scope.totalPatientPortionPerStage = function (
      treatmentPlanServices,
      stageno
    ) {
      var patPortionTotalForStage = 0;
      var servicesInStage = $filter('filter')(treatmentPlanServices, {
        TreatmentPlanServiceHeader: { TreatmentPlanGroupNumber: stageno },
        ServiceTransaction: { IsDeleted: false },
      });
      angular.forEach(servicesInStage, function (service) {
        // do not include ServiceTransactions with IsDeleted === true or ServiceTransactionStatusId === 4 or ServiceTransactionStatusId === 3 or  ServiceTransactionStatusId === 2 or 8in totals
        if (
          service.ServiceTransaction.IsDeleted !== true &&
          service.ServiceTransaction.ServiceTransactionStatusId !== 4 &&
          service.ServiceTransaction.ServiceTransactionStatusId !== 8 &&
          service.ServiceTransaction.ServiceTransactionStatusId !== 3 &&
          service.ServiceTransaction.ServiceTransactionStatusId !== 2
        ) {
          patPortionTotalForStage += service.ServiceTransaction.Amount;
          if (service.ServiceTransaction.InsuranceEstimates) {
            patPortionTotalForStage -= $scope.sum(
              service.ServiceTransaction.InsuranceEstimates,
              'EstInsurance'
            );
            patPortionTotalForStage -= $scope.sum(
              service.ServiceTransaction.InsuranceEstimates,
              'AdjEst'
            );
          }
        }
      });
      return patPortionTotalForStage;
    };

    $scope.formatPhoneNumberFromString = function (phoneNumberString) {
      var cleaned = ('' + phoneNumberString).replace(/\D/g, '');
      var match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
      if (match) {
        return '(' + match[1] + ')' + match[2] + '-' + match[3];
      }
      return null;
    };

    $scope.printPreviewTreatmentPlan = function (e) {
      if ($scope.disablePrint === false && $scope.updatingInsurance === false) {
        var printDocument = {};

        // clear previous local storage items for printing / signing document
        $window.localStorage.removeItem('signedTxPlanInfo');

        // get treatment plan location information for report
        var locationId =
          $scope.activeTreatmentPlan.TreatmentPlanServices[0].ServiceTransaction
            .LocationId;
        var ofcLocation = $filter('filter')($scope.locations, {
          LocationId: locationId,
        });
        var treatmentPlanLocation = ofcLocation[0];

        // get patient and practice info
        var patientName = $filter('getPatientNameAsPerBestPractice')(
          $scope.patientInfo
        );
        var locationName = treatmentPlanLocation.NameLine1;

        // build the address
        var locationAddress = treatmentPlanLocation.AddressLine1
          ? treatmentPlanLocation.AddressLine1 + ' '
          : '';
        locationAddress += treatmentPlanLocation.City
          ? treatmentPlanLocation.City
          : '';
        locationAddress += treatmentPlanLocation.State
          ? ', ' + treatmentPlanLocation.State
          : '';
        var formattedZipCode = $filter('zipCode')(
          treatmentPlanLocation.ZipCode
        );
        locationAddress += formattedZipCode ? ' ' + formattedZipCode : '';

        var primaryPhone = $scope.formatPhoneNumberFromString(
          treatmentPlanLocation.PrimaryPhone
        );

        // build the header
        printDocument.header = {
          PatientName: patientName,
          LocationName: locationName,
          LocationAddress: locationAddress,
          PrimaryPhone: primaryPhone,
        };

        printDocument.title =
          $scope.activeTreatmentPlan.TreatmentPlanHeader.TreatmentPlanName;

        printDocument.recommendedOption =
          $scope.activeTreatmentPlan.TreatmentPlanHeader.IsRecommended;

        // tx date
        printDocument.date = $filter('toDisplayDate')(
          $scope.activeTreatmentPlan.TreatmentPlanHeader.CreatedDate
        );

        // provider notes
        printDocument.notes =
          $scope.activeTreatmentPlan.TreatmentPlanHeader.Note !== null
            ? $scope.activeTreatmentPlan.TreatmentPlanHeader.Note
            : '';

        //#region contents and totals
        // hide no-print sections
        angular
          .element(document.getElementsByClassName('no-print'))
          .addClass('hidden');

        // get the contents
        //var printContents = document.getElementById('txPlanStages').innerHTML;
        var printContents = document.getElementById('txPlanReport').innerHTML;

        // get the totals section
        var txTotals = document.getElementsByClassName('txPlanCrud__totals')[0]
          .innerHTML;

        // unhide no-print sections
        angular
          .element(document.getElementsByClassName('no-print'))
          .removeClass('hidden');

        printDocument.content = printContents;
        printDocument.footer = txTotals;

        //#endregion

        // get the consent message
        printDocument.signatureConsent = $scope.consentMessage;

        printDocument.treatmentPlanId =
          $scope.activeTreatmentPlan.TreatmentPlanHeader.TreatmentPlanId;
        printDocument.status =
          $scope.activeTreatmentPlan.TreatmentPlanHeader.Status;

        var modalInstance = modalFactory.Modal({
          windowTemplateUrl: 'uib/template/modal/window.html',
          templateUrl:
            'App/Patient/patient-chart/treatment-plans/treatment-plan-print-options/treatment-plan-print-options.html',
          controller: 'TxPlanPrintOptionsController',
          amfa: 'soar-clin-cplan-view',
          backdrop: 'static',
          keyboard: false,
          size: 'md',
          windowClass: 'center-modal',
          resolve: {
            txPlanPrintTemplate: function () {
              return printDocument;
            },
            activeTreatmentPlan: function () {
              return $scope.activeTreatmentPlan;
            },
            personId: function () {
              return $scope.personId;
            },
          },
        });
        modalInstance.result.then(ctrl.successHandler);
      }
    };

    //#region status change

    // listening for changes to signedTxPlanInfo in localStorage, if they signed the txPlan in the print preview, we need to update the txPlan to accepted
    angular.element($window).on('storage', function (event) {
      if (event.originalEvent.key === 'signedTxPlan') {
        $scope.updateTreatmentPlanDocuments();
        $window.localStorage.removeItem('signedTxPlan');
      }

      if (
        event.originalEvent.key === 'signedTxPlanInfo' &&
        !$window.localStorage.getItem('savingPrintedTxPlan') === true &&
        $scope.activeTreatmentPlan.TreatmentPlanHeader.Status !== 'Accepted'
      ) {
        // this is keeping us from getting in here twice since there are two tabs open at this point, update will get called twice without it
        $window.localStorage.setItem('savingPrintedTxPlan', true);
        // grabbing the data from localStorage and then removing it
        var signedTxPlanInfoObject = JSON.parse(event.originalEvent.newValue);
        $window.localStorage.removeItem('signedTxPlanInfo');
        // need a fresh get because of multiple tabs being open
        treatmentPlansFactory
          .GetTreatmentPlanById(
            $scope.personId,
            signedTxPlanInfoObject.treatmentPlanId
          )
          .then(function (res) {
            if (res && res.Value) {
              var printedTreatmentPlan = res.Value;
              printedTreatmentPlan.TreatmentPlanHeader.Status = 'Accepted';
              treatmentPlansFactory.Update(printedTreatmentPlan, true);
              // final localStorage cleanup
              $window.localStorage.removeItem('savingPrintedTxPlan');
            }
          });
      } else if (event.originalEvent.key === 'signedTxPlanInfo') {
        $window.localStorage.removeItem('signedTxPlanInfo');
      }
    });

    $scope.updateStatus = function (plan, statusOption) {
      if (plan.TreatmentPlanHeader.Status != statusOption.StatusName) {
        plan.TreatmentPlanHeader.Status = statusOption.StatusId;
        ctrl.validateForm();
        if ($scope.formIsValid) {
          // if TreatmentPlanHeader.Status is Accepted or Rejected, update the ServiceTransaction.ServiceTransactionStatusId
          var updateServiceTransactionStatus =
            plan.TreatmentPlanHeader.Status === 'Accepted'
              ? true
              : plan.TreatmentPlanHeader.Status === 'Rejected'
              ? true
              : false;
          if (plan.TreatmentPlanHeader.Status != 'Completed') {
            $scope.setDisableEditFunctions(true);

            treatmentPlansFactory.Update(plan, updateServiceTransactionStatus);
          }
        }
      }
    };

    $scope.getStatusOptions = function () {
      var proposedStatusName = localize.getLocalizedString('Proposed');
      var presentedStatusName = localize.getLocalizedString('Presented');
      var acceptedStatusName = localize.getLocalizedString('Accepted');
      var rejectedStatusName = localize.getLocalizedString('Rejected');
      var completedStatusName = localize.getLocalizedString('Completed');
      $scope.statusOptions = [
        { StatusName: proposedStatusName, StatusId: 'Proposed' },
        { StatusName: presentedStatusName, StatusId: 'Presented' },
        { StatusName: acceptedStatusName, StatusId: 'Accepted' },
        { StatusName: rejectedStatusName, StatusId: 'Rejected' },
        { StatusName: completedStatusName, StatusId: 'Completed' },
      ];
    };
    $scope.getStatusOptions();

    $scope.statusFilter = function (status) {
      if (status.StatusId === 'Completed') {
        return false;
      }
      return true;
    };

    $scope.getClass = function (statusId) {
      switch (statusId) {
        case 'Proposed':
          return 'fa-question-circle';
        case 'Presented':
          return 'fa-play-circle';
        case 'Accepted':
          return 'far fa-thumbs-up';
        case 'Rejected':
          return 'far fa-thumbs-down';
        case 'Completed':
          return 'fa-check';
      }
    };

    //#endregion
    /*

    5.A user may not select "Completed" as a status, as this is triggered by all services in a treatment plan going to "Complete" status, however when a treatment plan is completed, display it in this list [use font awesome check icon]
    1.The select box on a completed treatment plan is disabled, a user cannot change the status once the plan is completed

         */

    //#endregion

    //#region document

    $scope.onUpLoadSuccess = function () {
      ctrl.getTreatmentPlanDocuments(
        $scope.activeTreatmentPlan.TreatmentPlanHeader.TreatmentPlanId
      );
      $scope.docCtrls.close();
    };

    $scope.onUpLoadCancel = function () {
      $scope.docCtrls.close();
    };

    $scope.openDocUploader = function () {
      if ($scope.activeTreatmentPlan.TreatmentPlanHeader.TreatmentPlanId) {
        $scope.docCtrls.content(
          '<doc-uploader [patient-id]="personId" [treatment-plan-id]="activeTreatmentPlan.TreatmentPlanHeader.TreatmentPlanId" (upload-cancel)="onUpLoadCancel($event)" (upload-success)="onUpLoadSuccess($event)"><doc-uploader>'
        );
        $scope.docCtrls.setOptions({
          resizable: false,
          position: {
            top: '35%',
            left: '35%',
          },
          minWidth: 300,
          scrollable: false,
          iframe: false,
          actions: ['Close'],
          title: 'Attach a document',
          modal: true,
        });
        $scope.docCtrls.open();
      }
    };

    //#endregion

    //#region disable create appt on inactive patient
    $scope.createAppointmentTitle = 'Create appointment';
    $scope.disableCreateApptButton = false;
    ctrl.setDisableCreateAppointmentButton = function (activeTreatmentPlan) {
      $scope.disableCreateApptButton = false;
      $scope.createAppointmentTitle = 'Create appointment';
      var disableButton = false;
      if ($scope.patientInfo.IsActive === false) {
        $scope.disableCreateApptButton = true;
        $scope.createAppointmentTitle =
          'Cannot create appointment for inactive patient';
      } else {
        if (activeTreatmentPlan.TreatmentPlanHeader.Status == 'Completed') {
          $scope.disableCreateApptButton = true;
          $scope.createAppointmentTitle =
            'Cannot create appointment for completed treatment plan';
        }
      }
    };
    // listening to disable the create appointment button
    $scope.printableServicesSelected = false;
    $scope.$on(
      'soar-disable-create-appointment-button',
      function (event, isAppointmentCreate) {
        $scope.disableCreateApptButton = isAppointmentCreate;

        if ($scope.activeTreatmentPlan) {
          $scope.printableServicesSelected = _.some(
            $scope.activeTreatmentPlan.TreatmentPlanServices,
            tps => tps.ServiceTransaction.$$IncludeInAppointment === true
          );
        }
      }
    );
    // listening to disable the send predetermination button
    $scope.$on(
      'soar-disable-send-predetermination-button',
      function (event, isSendPredetermination) {
        $scope.disableCreateDeterminationButtonServiceChecked = isSendPredetermination;
      }
    );

    //#endregion
    //#region disable create appt on inactive patient
    $scope.addProposedServiceTitle = 'Add a proposed service';
    $scope.disableAddServices = false;
    ctrl.setAddProposedServiceButton = function (activeTreatmentPlan) {
      $scope.disableAddServices = false;
      $scope.addProposedServiceTitle = 'Add a proposed service';
      var disableButton = false;
      if ($scope.patientInfo.IsActive === false) {
        $scope.disableAddServices = true;
        $scope.addProposedServiceTitle =
          'Cannot add a proposed service for inactive patient';
      } else {
        if (activeTreatmentPlan.TreatmentPlanHeader.Status == 'Completed') {
          $scope.disableAddServices = true;
          $scope.addProposedServiceTitle =
            'Cannot add a proposed service for completed treatment plan';
        }
      }
    };

    $scope.sum = function (items, prop) {
      return items.reduce(function (a, b) {
        return a + b[prop];
      }, 0);
    };

    //ng-disabled="disableAddServices" title="{{addProposedService|i18n}}"

    //#endregion

    //#region Treatment Plan Snapshots

    // get Treatment Plan Snapshot access
    ctrl.getAccess = function () {
      $scope.treatmentPlanSnapshotAccess = treatmentPlanDocumentFactory.access();
      if (!$scope.treatmentPlanSnapshotAccess.View) {
        toastrFactory.error(
          patSecurityService.generateMessage('soar-per-perhst-view'),
          'Not Authorized'
        );
        event.preventDefault();
        $location.path('/');
      }
    };
    ctrl.getAccess();

    // get Treatment Plan Snapshots
    ctrl.getTreatmentPlanDocuments = function (treatmentPlanId) {
      $scope.loadingTxPlanSnapshots = true;
      if ($scope.treatmentPlanSnapshotAccess.View && treatmentPlanId !== null) {
        treatmentPlanDocumentFactory
          .DocumentsByTreatmentPlanId(treatmentPlanId)
          .then(function (res) {
            $scope.treatmentPlanDocuments = res.Value;
            $scope.loadingTxPlanSnapshots = false;
            ctrl.setTreatmentPlanSnapshotsTooltip();
          });
      }
    };

    // view Treatment Plan Documents / InformedConsent
    $scope.viewTreatmentPlanDocument = function (txPlanDoc) {
      ctrl.getDocumentGroup(txPlanDoc);
      if ($scope.treatmentPlanSnapshotAccess.View) {
        if (txPlanDoc.MimeType === 'Digital') {
          switch (txPlanDoc.DocumentGroupName) {
            case 'Consent':
              informedConsentFactory.view(txPlanDoc).then(function (res) {
                formsDocumentsFactory.UpdateRecentDocuments(txPlanDoc);
              });
              break;
            default:
              // Treatment Plans
              treatmentPlanDocumentFactory
                .ViewTreatmentPlanSnapshot(txPlanDoc)
                .then(function (res) {
                  formsDocumentsFactory.UpdateRecentDocuments(txPlanDoc);
                });
              break;
          }
        } else {
          documentService.getByDocumentId(
            { documentId: txPlanDoc.DocumentId },
            function (res) {
              var doc = res.Value;
              if (doc != null) {
                var filegetUri = '_fileapiurl_/api/files/content/';
                var targetUri = filegetUri + doc.FileAllocationId;
                ctrl.window = {};
                documentsLoadingService.executeDownload(
                  targetUri,
                  doc,
                  ctrl.window
                );
                formsDocumentsFactory.UpdateRecentDocuments(doc);
              }
            },
            function (res) {
              toastrFactory.error(
                localize.getLocalizedString('{0} {1}', [
                  'Document',
                  'failed to load.',
                ]),
                localize.getLocalizedString('Server Error')
              );
            }
          );
        }
      }
    };

    // delete Treatment Plan Documents / Blob
    $scope.deleteTreatmentPlanDocument = function (txPlanDocument) {
      if ($scope.treatmentPlanSnapshotAccess.Delete) {
        var title = localize.getLocalizedString('Delete {0}', ['Document']);
        var message = localize.getLocalizedString(
          'Are you sure you want to {0}',
          ["remove this document permanently from this patient's record?"]
        );
        // confirm delete
        modalFactory
          .ConfirmModal(
            title,
            message,
            localize.getLocalizedString('Yes'),
            localize.getLocalizedString('No')
          )
          .then(function (res) {
            // if MimeType is 'Digital', it is a txPlan snapshot
            if (txPlanDocument.MimeType === 'Digital') {
              // get signature file allocation id from snapshot so it can be removed from the db and not orphaned
              treatmentPlanDocumentFactory
                .GetSignatureFileAllocationId(txPlanDocument.FileAllocationId)
                .then(function (resource) {
                  var fileAllocationId = resource.Value;
                  // delete the document
                  treatmentPlanDocumentFactory
                    .DeleteTreatmentPlanDocument(txPlanDocument.DocumentId)
                    .then(function (res) {
                      // delete the blob
                      treatmentPlanDocumentFactory.DeleteTreatmentPlanDocumentBlob(
                        fileAllocationId
                      );
                    });
                });
            } else {
              // delete the document
              treatmentPlanDocumentFactory
                .DeleteTreatmentPlanDocument(txPlanDocument.DocumentId)
                .then(function (res) {
                  // delete the blob
                  treatmentPlanDocumentFactory.DeleteTreatmentPlanDocumentBlob(
                    txPlanDocument.FileAllocationId
                  );
                });
            }
          });
      }
    };

    // update snapshot list when it changes
    $scope.updateTreatmentPlanDocuments = function () {
      ctrl.getTreatmentPlanDocuments(
        $scope.activeTreatmentPlan.TreatmentPlanHeader.TreatmentPlanId
      );
    };

    // subscribe snapshot list changes
    treatmentPlanDocumentFactory.observeSnapshots(
      $scope.updateTreatmentPlanDocuments
    );

    ctrl.setTreatmentPlanSnapshotsTooltip = function () {
      if ($scope.treatmentPlanDocuments.length > 0) {
        $scope.treatmentPlanSnapshotTooltip = localize.getLocalizedString(
          'Treament Plan attachments'
        );
      } else {
        $scope.treatmentPlanSnapshotTooltip = localize.getLocalizedString(
          'No attachments'
        );
      }
    };

    //#endregion

    ctrl.calculatePlanTotals = function () {
      $scope.totalFeesPerPlan = 0;
      $scope.totalDiscountsPerPlan = 0;
      $scope.totalTaxPerPlan = 0;
      $scope.totalAmountPerPlan = 0;
      if ($scope.activeTreatmentPlan) {
        angular.forEach(
          $scope.activeTreatmentPlan.TreatmentPlanServices,
          function (tps) {
            if (tps.ServiceTransaction.IsDeleted !== true) {
              $scope.totalFeesPerPlan += tps.ServiceTransaction.Fee;
              $scope.totalDiscountsPerPlan += tps.ServiceTransaction.Discount;
              $scope.totalTaxPerPlan += tps.ServiceTransaction.Tax;
              $scope.totalAmountPerPlan += tps.ServiceTransaction.Amount;
            }
          }
        );
      }
    };

    //#region rollback
    // rollback direct expects services only
    ctrl.getServicesForRollback = function (treatmentPlanServices) {
      $scope.servicesForRollback = [];
      angular.forEach(treatmentPlanServices, function (tps) {
        $scope.servicesForRollback.push(tps.ServiceTransaction);
      });
    };

    $scope.onRollback = function (services) {
      // insurance will need to be recalculated
      $scope.insuranceInitialized = false;
      // refresh the treatmentPlanServices attached
      treatmentPlansFactory.RefreshTreatmentPlanServices(services);
      // update the chart ledger
      $scope.$emit('soar:chart-services-reload-ledger');
    };

    //#endregion

    //#region informed consent

    ctrl.authInformedConsentCreateAccess = function () {
      return patSecurityService.IsAuthorizedByAbbreviation(
        'soar-clin-cplan-icadd'
      );
    };

    // sets UserCode if not current
    ctrl.addUserCodeToServices = function (activeTreatmentPlan) {
      angular.forEach(
        activeTreatmentPlan.TreatmentPlanServices,
        function (tps) {
          if (!tps.ServiceTransaction.UserCode) {
            var provider = listHelper.findItemByFieldValue(
              ctrl.providers,
              'UserId',
              tps.ServiceTransaction.ProviderUserId
            );
            if (provider) {
              tps.ServiceTransaction.UserCode = provider.UserCode;
            }
          }
        }
      );
    };
    $scope.createInformedConsent = function () {
      // reference bug 286148
      // make sure all services have UserCode at time of consent
      ctrl.addUserCodeToServices($scope.activeTreatmentPlan);

      if (ctrl.authInformedConsentCreateAccess()) {
        // open modal
        var modalInstance = modalFactory.Modal({
          templateUrl:
            'App/Patient/patient-chart/treatment-plans/informed-consent/informed-consent.html',
          controller: 'InformedConsentController',
          amfa: 'soar-clin-cplan-icadd',
          backdrop: 'static',
          keyboard: false,
          windowClass: 'modal-80 .modal-dialog',
          resolve: {
            informedConsentCallback: function () {
              return ctrl.createInformedConsentCallback;
            },
            patient: function () {
              return $scope.patientInfo;
            },
            treatmentPlan: function () {
              return $scope.activeTreatmentPlan;
            },
          },
        });
        modalInstance.result.then(ctrl.successHandler);
      }
    };

    ctrl.createInformedConsentCallback = function (
      informedConsentDocument,
      services
    ) {
      angular.forEach(services, function (svc) {
        angular.forEach(
          $scope.activeTreatmentPlan.TreatmentPlanServices,
          function (tps) {
            if (
              !tps.ServiceTransaction.IsOnInformedConsent &&
              tps.ServiceTransaction.ServiceTransactionId ===
                svc.ServiceTransactionId
            ) {
              tps.ServiceTransaction.IsOnInformedConsent = true;
            }
          }
        );
      });
      $scope.treatmentPlanDocuments.push(informedConsentDocument);
    };

    ctrl.successHandler = function () {};

    //#endregion

    // #region document groups

    ctrl.getDocumentGroup = function (doc) {
      var item = listHelper.findItemByFieldValue(
        $scope.documentGroups,
        'DocumentGroupId',
        doc.DocumentGroupId
      );
      if (item) {
        doc.DocumentGroupName = item.Description;
      }
    };
    // control when documents can be viewed
    $scope.documentGroupsLoaded = false;
    $scope.getAllDocumentGroups = function () {
      documentGroupsService.getAll(
        function (res) {
          $scope.documentGroups = res.Value;
          $scope.documentGroupsLoaded = true;
        },
        function (res) {
          toastrFactory.error(
            localize.getLocalizedString('{0} {1}', [
              'Document Groups',
              'failed to load.',
            ]),
            localize.getLocalizedString('Server Error')
          );
        }
      );
    };

    //#endregion

    $scope.initializeDropdown = function () {
      ctrl.checkIsPlanDuplicatable(
        $scope.activeTreatmentPlan.TreatmentPlanServices,
        $scope.activeTreatmentPlan.TreatmentPlanHeader.Status
      );
    };

    // this method calls an endpoint to check to see if other services on this treatment plan are attached to an appointment
    // it will only return services where the service is not in a ready for checkout status (determined by EncounterId) but has an appointmentId and is in the same stage
    ctrl.checkServicesAppointments = function (services, stage, areNew) {
      var servicesWithAppointments = [];
      treatmentPlansFactory
        .ServicesOnAppointments(
          $scope.activeTreatmentPlan.TreatmentPlanHeader.TreatmentPlanId,
          stage
        )
        .then(function (res) {
          servicesWithAppointments = res.Value;
          $scope.launchAddServiceToAppointmentModal(
            services,
            stage,
            areNew,
            servicesWithAppointments
          );
        });
    };

    // do not launch appointment modal to add this service to an appointment if it is already attached to one
    $scope.launchAddServiceToAppointmentModal = function (
      services,
      stage,
      areNew,
      servicesWithAppointments
    ) {
      ctrl.proposedServicesToProcess = [];
      angular.forEach(services, function (serviceToAdd) {
        if (
          services &&
          services.length > 0 &&
          servicesWithAppointments.length > 0 &&
          !serviceToAdd.$$appointmentAdded &&
          _.isNil(serviceToAdd.AppointmentId)
        ) {
          serviceToAdd.$$new = areNew;
          var modalInstance = modalFactory.Modal({
            templateUrl:
              'App/Patient/patient-chart/treatment-plans/treatment-plan-add-to-appointment/treatment-plan-add-to-appointment.html',
            controller: 'TreatmentPlanAddToAppointment',
            amfa: $scope.addPlannedServiceAuthAbbrev,
            backdrop: 'static',
            keyboard: false,
            size: 'lg',
            windowClass: 'center-modal',
            resolve: {
              addToAppointmentModalCallback: function () {
                return ctrl.addServicesModalCallback;
              },
              stageNumber: function () {
                return stage;
              },
              serviceToAdd: function () {
                return serviceToAdd;
              },
              servicesWithAppointments: function () {
                return servicesWithAppointments;
              },
            },
          });
          modalInstance.result.then(ctrl.successHandler);
        } else {
          serviceToAdd.$$new = areNew;
          serviceToAdd.AppontmentId = '';
          if (serviceToAdd.$$new) {
            ctrl.addServicesModalCallback(serviceToAdd, stage);
          } else {
            // set insurance order based on treatmentPlanService.Priority only if adding it to an appointment?
            ctrl.proposedServicesToProcess.push(serviceToAdd);
          }
        }
      });
      // regression bug 353350
      // This process and series of callbacks should be refined, adding this for now to address
      // just this one specific bug
      if (ctrl.proposedServicesToProcess.length === 1) {
        $scope.insuranceInitialized = false;
        ctrl.addServicesModalCallback(ctrl.proposedServicesToProcess[0], stage);
      }
      // handles updating a list of proposed services with one call
      if (ctrl.proposedServicesToProcess.length > 1) {
        $scope.insuranceInitialized = false;
        treatmentPlansFactory.AddPlannedService(
          ctrl.proposedServicesToProcess,
          stage
        );
      }
    };

    //#region new treatment plan

    // listening for changes to NewTreatmentPlan
    $scope.$watch(
      function () {
        return treatmentPlansFactory.NewTreatmentPlan;
      },
      function (nv) {
        // load new treatment plan to active treatment plan
        if (nv) {
          $scope.activeTreatmentPlan = nv;
          // reset scope.properties
          $scope.servicesForRollback = [];
          $scope.treatmentPlanDocuments = [];
          // when we first add the new treatment plan add a stage
          $scope.planStages = [];
          $scope.planStages.push({ stageno: 1 });
        }
      }
    );

    ctrl.initializeServicesOnNewTreatmentPlan = function (newTreatmentPlan) {
      if (newTreatmentPlan.TreatmentPlanHeader) {
        $scope.treatmentPlanId =
          newTreatmentPlan.TreatmentPlanHeader.TreatmentPlanId;
      }
      newTreatmentPlan.TreatmentPlanHeader.TotalFees = treatmentPlansFactory.GetTotalFees(
        newTreatmentPlan
      );
      newTreatmentPlan.TreatmentPlanHeader.DaysAgo = treatmentPlansFactory.GetDaysAgo(
        newTreatmentPlan.TreatmentPlanHeader
      );
      newTreatmentPlan.TreatmentPlanHeader.FullTreatmentPlanHasLoaded = true;
      treatmentPlansFactory.AddAreaToServices(
        newTreatmentPlan.TreatmentPlanServices
      );
      treatmentPlansFactory.SetActiveTreatmentPlan(newTreatmentPlan);
      treatmentPlansFactory.SetNewTreatmentPlan(null);
      treatmentPlansFactory.SavingPlan = false;
      treatmentPlansFactory.SetDataChanged(false);
      $rootScope.$broadcast('serviceHeadersUpdated');

      treatmentPlansFactory.RefreshTreatmentPlanServices(
        _.map(newTreatmentPlan.TreatmentPlanServices, 'ServiceTransaction')
      );
    };

    // this only happens when one or more services is added to a new treatment plan
    // NOTE, once this happens, the plan is saved and any services added afterwards
    // will be handled by $scope.checkServicesAppointments
    ctrl.addServicesToNewTreatmentPlan = function (services, stage, areNew) {
      // only create a treatment plan if we have at least one service
      if (services.length > 0) {
        treatmentPlansFactory
          .CreateWithNoReload(services, $scope.personId, stage)
          .then(function (res) {
            if (res && res.Value) {
              var newTreatmentPlan = res.Value;
              ctrl.initializeServicesOnNewTreatmentPlan(newTreatmentPlan);
              // after a service or services is added this newTreatmentPlan is saved
              // and added to existing plans
              treatmentPlansFactory.SetActiveTreatmentPlan(newTreatmentPlan);
              treatmentPlansFactory.ExistingTreatmentPlans.push(
                newTreatmentPlan
              );
            }
          });
      }
    };

    // branch handling of new services for new treatment plan
    ctrl.addServicesToTreatmentPlan = function (services, stage, areNew) {
      // existing plan handling
      if ($scope.activeTreatmentPlan.TreatmentPlanServices.length > 0) {
        // add services to an existing plan
        ctrl.checkServicesAppointments(services, stage, areNew);
      } else {
        // new treatment plan handling
        if (services.length > 0) {
          ctrl.addServicesToNewTreatmentPlan(services, stage, areNew);
        }
      }
    };

    //#endregion

    // CreatedDate local date and time display = $$DisplayCreatedDate
    ctrl.setDisplayDate = function (activeTreatmentPlan) {
      let localDisplayDate = '';
      if (
        activeTreatmentPlan &&
        activeTreatmentPlan.TreatmentPlanHeader &&
        activeTreatmentPlan.TreatmentPlanHeader.CreatedDate
      ) {
        localDisplayDate = activeTreatmentPlan.TreatmentPlanHeader.CreatedDate.toUpperCase().endsWith(
          'Z'
        )
          ? activeTreatmentPlan.TreatmentPlanHeader.CreatedDate
          : activeTreatmentPlan.TreatmentPlanHeader.CreatedDate + 'Z';
      }

      activeTreatmentPlan.TreatmentPlanHeader.$$DisplayCreatedDate = localDisplayDate;
    };

    // get next available Priority for this treatment plan
    ctrl.getNextPriorityNumber = function () {
      var nextPriorityNumber = 1;
      if (
        $scope.activeTreatmentPlan &&
        !_.isEmpty($scope.activeTreatmentPlan.TreatmentPlanServices)
      ) {
        var lastTreatmentPlanService = _.maxBy(
          $scope.activeTreatmentPlan.TreatmentPlanServices,
          function (tps) {
            return tps.TreatmentPlanServiceHeader.Priority;
          }
        );
        nextPriorityNumber =
          lastTreatmentPlanService.TreatmentPlanServiceHeader.Priority + 1;
      }
      return nextPriorityNumber;
    };

    $scope.reorder = function () {
      $scope.viewSettings.expandView = true;
      $scope.viewSettings.activeExpand = 6;
    };

    $scope.editServices = function () {
      $rootScope.$broadcast(
        'nav:resetDisplayIconsForTreatmentPlanDisplay',
        true
      );

      $scope.viewSettings.showTreatmentPlanServices = true;
      $scope.txPlanAreaActive = true;
      treatmentPlansFactory.SetPlanStages($scope.planStages);
    };

    //#endregion

    //#region calculate line, stage, and plan totals

    $scope.getTotalAdjEstimate = function (serviceTransaction) {
      return serviceTransaction.IsDeleted === true ||
        serviceTransaction.ServiceTransactionStatusId === 4 ||
        serviceTransaction.ServiceTransactionStatusId === 8 ||
        serviceTransaction.ServiceTransactionStatusId === 3 ||
        serviceTransaction.ServiceTransactionStatusId === 2
        ? null
        : serviceTransaction.TotalAdjEstimate;
    };

    $scope.getTotalEstInsurance = function (serviceTransaction) {
      return serviceTransaction.IsDeleted === true ||
        serviceTransaction.ServiceTransactionStatusId === 4 ||
        serviceTransaction.ServiceTransactionStatusId === 8 ||
        serviceTransaction.ServiceTransactionStatusId === 3 ||
        serviceTransaction.ServiceTransactionStatusId === 2
        ? null
        : serviceTransaction.TotalEstInsurance;
    };

    $scope.getPatientBalance = function (serviceTransaction) {
      return serviceTransaction.IsDeleted === true ||
        serviceTransaction.ServiceTransactionStatusId === 4 ||
        serviceTransaction.ServiceTransactionStatusId === 8 ||
        serviceTransaction.ServiceTransactionStatusId === 3 ||
        serviceTransaction.ServiceTransactionStatusId === 2
        ? null
        : serviceTransaction.PatientBalance;
    };

    //#endregion

    //#region observe activeTreatmentPlan

    // respond to changes to treatment plan and treatment plan services
    ctrl.onActiveTreatmentPlanChange = function (activeTreatmentPlan) {
      var uniqueGroupNumbers = [];
      $scope.disablePrint = true;
      // reset pred flags when active tp has changed
      ctrl.resetPredeterminationFlags();
      if (activeTreatmentPlan) {
        $scope.hasPredeterminationForCurrentPlan = ctrl.checkForReceivedPredetermination(
          activeTreatmentPlan
        );
        // reset PredeterminationList
        treatmentPlansFactory.InitPredeterminationList();
        // initialize the predetermination list
        ctrl.initPredeterminationList(
          activeTreatmentPlan.TreatmentPlanServices
        );
        //This will happen if a treatment plan is updated
        if (
          activeTreatmentPlan.TreatmentPlanHeader &&
          activeTreatmentPlan.TreatmentPlanHeader.TreatmentPlanId &&
          activeTreatmentPlan.TreatmentPlanHeader.TreatmentPlanId ===
            $scope.treatmentPlanId
        ) {
          //Get a list of Stage Group Numbers that are distinct that exist on the Treatment Plan Services
          //The ... is called a spread operator (It expands the set values into an array). The Set keyword is a collection of unique values and it removes duplicates
          //We put into that the list of property values we get from using map()
          uniqueGroupNumbers = [
            ...new Set(
              activeTreatmentPlan.TreatmentPlanServices.map(
                treatmentPlanServices =>
                  treatmentPlanServices.TreatmentPlanServiceHeader
                    .TreatmentPlanGroupNumber
              )
            ),
          ].sort((a, b) => a - b);
          if (
            uniqueGroupNumbers[uniqueGroupNumbers.length - 1] >
            $scope.planStages.length
          ) {
            $scope.addSection();
          }
          //This updates the patient-factories TreatmentPlansFactory SetPlanStages
          $scope.planStages = treatmentPlansFactory.GetPlanStages();
        }
        //This part will get hit if creating an alternate tx plan or if switching to a different tx plan
        else {
          $scope.planStages = treatmentPlansFactory.LoadPlanStages(
            activeTreatmentPlan.TreatmentPlanServices
          );
          if (_.isNil($scope.planStages) || $scope.planStages.length === 0) {
            $scope.planStages = [
              {
                stageno: 1,
                AppointmentId: null,
              },
            ];

            treatmentPlansFactory.SetPlanStages($scope.planStages);
          } else {
            treatmentPlansFactory.SetPlanStages($scope.planStages);
          }

          if (
            activeTreatmentPlan.TreatmentPlanHeader &&
            activeTreatmentPlan.TreatmentPlanHeader.TreatmentPlanId
          ) {
            $scope.treatmentPlanId =
              activeTreatmentPlan.TreatmentPlanHeader.TreatmentPlanId;
          }
        }
        ctrl.noteBackup = angular.copy(
          activeTreatmentPlan.TreatmentPlanHeader.Note
        );
        // check for rollback services
        ctrl.getServicesForRollback(activeTreatmentPlan.TreatmentPlanServices);

        ctrl.setDisableCreateAppointmentButton(activeTreatmentPlan);
        ctrl.setAddProposedServiceButton(activeTreatmentPlan);
        ctrl.setSelected(activeTreatmentPlan);

        // sorting modified to be by priority
        activeTreatmentPlan.TreatmentPlanServices = $filter(
          'orderBy'
        )(activeTreatmentPlan.TreatmentPlanServices, [
          'TreatmentPlanServiceHeader.TreatmentPlanGroupNumber',
          'TreatmentPlanServiceHeader.Priority',
        ]);

        // get any attached documents
        ctrl.getTreatmentPlanDocuments(
          activeTreatmentPlan.TreatmentPlanHeader.TreatmentPlanId
        );
        // get documentGroups
        $scope.getAllDocumentGroups();

        ctrl.setDisplayDate(activeTreatmentPlan);

        ctrl.addUserCodeToServices(activeTreatmentPlan);
        ctrl.checkIsPlanDuplicatable(
          activeTreatmentPlan.TreatmentPlanServices,
          activeTreatmentPlan.TreatmentPlanHeader.Status
        );
        ctrl.setDisableCreateDeterminationButton(activeTreatmentPlan);

        // load activeTreatmentPlan to scope
        $scope.activeTreatmentPlan = activeTreatmentPlan;
        // load predeterminationlist to scope
        $scope.copyPredeterminationList =
          treatmentPlansFactory.PredeterminationList.length;
        ctrl.setPrintEnabled();
      }
    };

    // delay printing until loading is complete
    ctrl.setPrintEnabled = function () {
      if ($scope.disablePrint === true) {
        $timeout(function () {
          $scope.disablePrint = false;
        }, 100);
      }
    };

    // initialize treatment plan page and set observers
    ctrl.initTreatmentPlanPage = function () {
      treatmentPlansFactory.ClearObservers();
      // observer for watching the predetermination list for changes
      treatmentPlansFactory.ObserveActiveTreatmentPlan(
        ctrl.onActiveTreatmentPlanChange
      );
      // subscribe to changes in the predetermination list
      treatmentPlansFactory.ObservePredeterminationList(
        ctrl.getPredeterminationListChanges
      );
      // since the ActiveTreatmentPlan may have already been instanced, get it now
      if (treatmentPlansFactory.ActiveTreatmentPlan) {
        ctrl.onActiveTreatmentPlanChange(
          treatmentPlansFactory.ActiveTreatmentPlan
        );
      }
    };

    // after I set the $scope values to close the page angular js is not updating
    // so I have to force it to update with $scope.$apply;
    ctrl.closeView = function () {
      let state = treatmentPlanChangeService.getCloseState();

      if (state !== null && state !== undefined && state === true) {
        // ok so we know we are closing the other page. Now we need to determine if we should be updating the activeTreatment plan data or not.
        let treatmentPlan = treatmentPlanEditServices.getTreatmentPlan();
        treatmentPlanEditServices.setTreatmentPlan(null);

        if (treatmentPlan !== null) {
          treatmentPlansFactory.SetActiveTreatmentPlan(treatmentPlan);
          ctrl.onActiveTreatmentPlanChange(treatmentPlan);
          // need to update the ExistingTreatementPlansList which then updates the timeline because it watches this collection.
          treatmentPlansFactory.UpdateExistingTreatmentPlanList(treatmentPlan);
        }

        $rootScope.$broadcast(
          'nav:resetDisplayIconsForTreatmentPlanDisplay',
          false
        );
        $scope.txPlanAreaActive = false;
        $scope.viewSettings.expandView = true;
        $scope.viewSettings.activeExpand = 2;
        $scope.viewSettings.showTreatmentPlanServices = false;
        // because this page was only partially converted the code functions off at times.
        // to ensure the code will continue to function for the time now we are applying the changes
        // this way we can move to other changes and then address when the rest of the page is converted.
        //$scope.$apply();
      }
    };

    ctrl.openDrawerFromAngular = function () {
      // hard coding for now.
      $rootScope.$broadcast('nav:drawerChange', 3);
      // because this page was only partially converted the code functions off at times.
      // to ensure the code will continue to function for the time now we are applying the changes
      // this way we can move to other changes and then address when the rest of the page is converted.
      $scope.$apply();
    };

    ctrl.onDrawerChange = function () {
      $scope.drawerState = clinicalDrawerStateService.getDrawerState();
    };
    clinicalDrawerStateService.registerObserver(ctrl.onDrawerChange);

    treatmentPlanChangeService.setCloseState(false);
    treatmentPlanChangeService.registerCloseObserver(ctrl.closeView);

    treatmentPlanChangeService.registerOpenDrawerObserver(
      ctrl.openDrawerFromAngular
    );

    $scope.$on('$destroy', function () {
      treatmentPlansFactory.ClearObservers();
      clinicalDrawerStateService.clearObserver(ctrl.onDrawerChange);
      // probably need to remove the observer from the list

      // for page that has all converted
      treatmentPlanChangeService.clearCloseObserver(ctrl.closeView);
      treatmentPlanChangeService.setCloseState(false);

      // for removing the watch on drawer close
      treatmentPlanChangeService.clearOpenDrawerObserver(
        ctrl.openDrawerFromAngular
      );
    });

    //#endregion
  }

  TreatmentPlansCrudController.prototype = Object.create(BaseCtrl);
})();
