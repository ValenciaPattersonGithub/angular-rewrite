(function () {
  'use strict';

  angular
    .module('Soar.Patient')
    .controller('PatientChartController', PatientChartController);

  PatientChartController.$inject = [
    '$scope',
    '$rootScope',
    '$routeParams',
    '$q',
    'PatientValidationFactory',
    'locationService',
    '$location',
    'AmfaKeys',
    'PatientDetailService',
    'localize',
    '$timeout',
    '$uibModal',
    'ClinicalOverviewFactory',
    'ChartLedgerFactory',
    'PatientServices',
    'toastrFactory',
    'ListHelper',
    'ModalFactory',
    'PatientNotesFactory',
    'TreatmentPlansFactory',
    'TabsetFactory',
    'PatientPerioExamFactory',
    'PatientOdontogramFactory',
    'ExamState',
    '$filter',
    'patSecurityService',
    'UsersFactory',
    'tabLauncher',
    'PatientImagingExamFactory',
    'UserServices',
    'ToothSelectionService',
    'referenceDataService',
    'StaticData',
    'DiscardChangesService',
    'NoteTemplatesHttpService',
    'ImagingMasterService',
    'ImagingProviders',
    '$http',
    'userSettingsDataService',
    'ClinicalDrawerStateService',
    '$interval',
    'RxService',
    'ChartColorsService',
    'PatientRxFactory',
    'FeatureFlagService',
    'FuseFlag',
    'CommonServices',
    'ConditionsService'
  ];

  function PatientChartController(
    $scope,
    $rootScope,
    $routeParams,
    $q,
    patientValidationFactory,
    locationService,
    $location,
    AmfaKeys,
    patientDetailService,
    localize,
    $timeout,
    $uibModal,
    clinicalOverviewFactory,
    chartLedgerFactory,
    patientServices,
    toastrFactory,
    listHelper,
    modalFactory,
    patientNotesFactory,
    treatmentPlansFactory,
    tabsetFactory,
    patientPerioExamFactory,
    patientOdontogramFactory,
    examState,
    $filter,
    patSecurityService,
    usersFactory,
    tabLauncher,
    patientImagingExamFactory,
    userServices,
    toothSelector,
    referenceDataService,
    staticData,
    discardChangesService,
    noteTemplatesHttpService,
    imagingMasterService,
    imagingProviders,
    $http,
    userSettingsDataService,
    clinicalDrawerStateService,
    $interval,
    rxService,
    chartColorsService,
    patientRxFactory,
    featureFlagService,
    fuseFlag,
    commonServices,
    conditionsService
  ) {
    BaseCtrl.call(this, $scope, 'PatientChartController');
    var ctrl = this;
    $scope.searchServicesKeyword = '';


    // misc vars
    $scope.saving = false;
    $scope.editMode = false;
    $scope.patientId = $routeParams.patientId;
    $scope.patientInfo = $scope.personalInfo.Profile;
    $scope.selection = null;
    $scope.chartActive = false;
    $scope.completeExam = false;
    $scope.examHasChanges = false;
    $scope.hasBeenSaved = false;
    $scope.enableFinish = false;
    $scope.perioOptActive = true;
    $scope.perioGraphActive = {};
    $scope.perioGraphActive.flag = false;
    $scope.selectedExam = { ExamId: null };
    $scope.chartLedgerServices = [];
    $scope.perioTabSelected = null;
    $scope.activeAppointmentId = null;
    $scope.enableNewClinicalNavigation = userSettingsDataService.isNewNavigationEnabled();
    //$scope.enableNewTreatmentPlanArea = userSettingsDataService.isNewTreatmentPlanAreaEnabled();
    $scope.duplicatePatients = [];
    $scope.perioExamHeaderListOptions = [];
    $scope.conditions = [];
    $scope.chartExistingModeOn = patientServices.ChartExistingModeOn;
    $scope.isBleedAllChecked = false;
    $scope.isSuppurationAllChecked = false;

    $scope.drawerIsOpen = true; //drawer starts open
    clinicalDrawerStateService.changeDrawerState($scope.drawerIsOpen);
    $scope.currentDrawer = 1; // drawer starts on Timeline
    $scope.patientDetail = null;
    $scope.hasSavePermissions = patSecurityService.IsAuthorizedByAbbreviation(
      'soar-clin-cperio-add'
    );
    $scope.hasEditPermissions = patSecurityService.IsAuthorizedByAbbreviation(
      'soar-clin-cperio-edit'
    );
    $scope.hasDeletePermissions = patSecurityService.IsAuthorizedByAbbreviation(
      'soar-clin-cperio-delete'
    );
    $scope.hasRxViewAccess = patSecurityService.IsAuthorizedByAbbreviation(
      AmfaKeys.SoarClinClinrxView
    );
    $scope.hasClinicalNoteAddRxAccess = patSecurityService.IsAuthorizedByAbbreviation(
      AmfaKeys.SoarClinCnotesAddrx
    );
    $scope.hasRxAccess = false;
    $scope.filteredPatientMedication = null;

    ctrl.isBleedAllCheckedTimer = null;
    ctrl.isSuppurationAllCheckedTimer = null;
    $scope.isChartColorsLoaded = false;

    patientDetailService
      .getPatientDashboardOverviewByPatientId($scope.patientId)
      .then(patientOverview => {
        locationService.getAllLocations().then(results => {
          for (let i = 0; i < results.length; i++) {
            if (patientOverview.Profile.PreferredLocation === results[i].id) {
              patientOverview.Profile.PreferredLocationName = results[i].name;
            }
          }

          // populate displayName property
          for (
            let i = 0;
            i <
            patientOverview.AccountMemberOverview.AccountMembersProfileInfo
              .length;
            i++
          ) {
            patientOverview.AccountMemberOverview.AccountMembersProfileInfo[
              i
            ].displayName =
              patientOverview.AccountMemberOverview.AccountMembersProfileInfo[i]
                .LastName +
              ', ' +
              patientOverview.AccountMemberOverview.AccountMembersProfileInfo[i]
                .FirstName;
          }
          /// now you just need to order the AccountMembersProfileInfo by displayName
          patientOverview.AccountMemberOverview.AccountMembersProfileInfo.sort(
            (current, next) => {
              return current.displayName.localeCompare(next.displayName);
            }
          );

          $scope.patientDetail = patientOverview;
          $scope.displayProviderNextAppt = '';
          if ($scope.patientDetail.Profile.NextAppointment !== undefined) {
            $scope.nextApptDate = new Date(
              $scope.patientDetail.Profile.NextAppointment.$$StartTimeLocal
            );
            $scope.displayDateNextAppt = $filter('date')(
              $scope.nextApptDate,
              'short'
            );

            if (
              $scope.patientDetail.Profile.NextAppointment
                .nextAppointmentProviderDisplayName !== undefined
            ) {
              $scope.displayProviderNextAppt =
                $scope.patientDetail.Profile.NextAppointment.nextAppointmentProviderDisplayName;
            }
          }

          for (let i = 0; i < $scope.patientDetail.Phones.length; i++) {
            if ($scope.patientDetail.Phones[i].IsPrimary === true) {
              if ($scope.patientDetail.Phones[i].PhoneNumber === null) {
                $scope.displayPhone =
                  $scope.patientDetail.Phones[i].PhoneReferrer.PhoneNumber;
              } else {
                $scope.displayPhone =
                  $scope.patientDetail.Phones[i].PhoneNumber;
              }
              $scope.displayPhoneType = $scope.patientDetail.Phones[i].Type;
            }
          }

          for (let j = 0; j < $scope.patientDetail.Emails.length; j++) {
            if ($scope.patientDetail.Emails[j].IsPrimary === true) {
              $scope.displayEmail = $scope.patientDetail.Emails[j].Email;
            }
          }

          $scope.primaryInsurance = 'N/A';
          $scope.secondaryInsurance = 'N/A';
          if (
            patientOverview.BenefitPlans &&
            patientOverview.BenefitPlans.length > 0
          ) {
            let sortedBenefitPlans = _.sortBy(
              patientOverview.BenefitPlans,
              'Priority'
            );
            if (
              sortedBenefitPlans[0] &&
              sortedBenefitPlans[0].PolicyHolderBenefitPlanDto
            ) {
              $scope.primaryInsurance =
                sortedBenefitPlans[0].PolicyHolderBenefitPlanDto.BenefitPlanDto.CarrierName;
            }

            if (
              sortedBenefitPlans[1] &&
              sortedBenefitPlans[1].PolicyHolderBenefitPlanDto
            ) {
              $scope.secondaryInsurance =
                sortedBenefitPlans[1].PolicyHolderBenefitPlanDto.BenefitPlanDto.CarrierName;
            }
          }
        });
      });

    ctrl.initMedications = function () {
      if ($scope.hasRxViewAccess) {
        patientRxFactory.Medications($scope.patientId).then(
          function (res) {
            // filter these for the ones we want in the timeline / notes Prescription status = Printed, eRxSent, or FaxSent
            $scope.filteredPatientMedication = $filter('filter')(
              res,
              function (med) {
                return (
                  med.PrescriptionStatus === 'Printed' ||
                  med.PrescriptionStatus === 'eRxSent' ||
                  med.PrescriptionStatus === 'FaxSent' ||
                  med.PrescriptionStatus === 'PharmacyVerified'
                );
              }
            );
            $scope.$broadcast(
              'soar:rxMedicationGetComplete',
              $scope.filteredPatientMedication
            );
            ctrl.createPrscNoteIfNecessary($scope.filteredPatientMedication);
          },
          function (msg) {
            // if call fails (for any reason) set loading complete
            // note, this can happen if a user is setup in fuse for rx but not
            // validated for Dosespot for a number of reasons
            $scope.$broadcast('soar:rxMedicationGetComplete', null);
          }
        );
      } else {
        // if user has no permissions for rx, set loading complete
        $scope.$broadcast('soar:rxMedicationGetComplete', null);
      }
    };

    ctrl.createPrscNoteIfNecessary = function (patientMedications) {
      if ($scope.hasClinicalNoteAddRxAccess) {
        patientNotesFactory.getAllRxMaps($scope.patientId).then(function (res) {
          if (res && res.Value) {
            var rxMaps = res.Value;
            _.forEach(patientMedications, function (prsc) {
              const externalMedicationId = parseInt(prsc.ExternalMedicationId);
              const rxMapId = prsc.RxMapId;
              const map =
                rxMaps.find(
                  map => map.PrescriptionId && externalMedicationId && map.PrescriptionId === externalMedicationId
                ) || rxMaps.find(map => rxMapId && map.RxPrescriptionMapId && map.RxPrescriptionMapId === rxMapId);
              if (!map) {
                // have to get the user every time we build an rx note because we cannot guarantee that all the users will be the same and cannot also guarantee that the users list in scope will have them
                usersFactory.User(prsc.PrescriberUserId).then(function (res) {
                  if (res && res.Value) {
                    var mockNote = {
                      CreatedDate: prsc.DateWritten,
                      NoteTitle: localize.getLocalizedString(
                        'Clinical Note - Prescription'
                      ),
                      PatientId: $scope.patientId,
                      Note: ctrl.buildPrscNoteBody(prsc, res.Value),
                      StatusTypeId: 1,
                      NoteTypeId: 5,
                    };
                    patientNotesFactory.createRxNote(mockNote, prsc.ExternalMedicationId, rxMapId).then(function (res) {
                      if (res && res.Value) {
                        $scope.clinicalOverview.Notes.push(res.Value);
                        $scope.$broadcast('soar:rxNoteGenerated', res.Value);
                      }
                    });
                  }
                });
              }
            });
          }
        });
      }
    };

    // helper for creating the rx note body
    ctrl.buildPrscNoteBody = function (prescription, prescriberUser) {
      var body = '';
      body = body.concat(
        '<b>Prescribing User:</b> ' +
        prescriberUser.LastName +
        ', ' +
        prescriberUser.FirstName +
        '<br/>'
      );
      var local = moment.utc(prescription.DateWritten).toDate();
      body = body.concat(
        '<b>Date Written:</b> ' +
        moment(local).format('MM/DD/YYYY') +
        ' - ' +
        moment(local).format('h:mm a') +
        '<br/>'
      );
      body = body.concat('<b>Name:</b> ' + prescription.DisplayName + '<br/>');
      if (prescription.NoSubstitution === true) {
        prescription.NoSubstitution = 'Yes';
      } else if (prescription.NoSubstitution === false) {
        prescription.NoSubstitution = 'No';
      }
      body = body.concat(
        '<b>No Substitution:</b> ' + prescription.NoSubstitution + '<br/>'
      );
      if (prescription.Strength != null) {
        body = body.concat('<b>Dose:</b> ' + prescription.Strength + '<br/>');
      }
      if (prescription.DispenseUnits != null) {
        body = body.concat('<b>Form:</b> ' + prescription.DispenseUnits + '<br/>');
      }
      body = body.concat('<b>Quantity:</b> ' + prescription.Quantity + '<br/>');
      body = body.concat(
        '<b>Patient Directions:</b> ' + prescription.Notes + '<br/>'
      );
      body = body.concat('<b>Refills:</b> ' + prescription.Refills + '<br/>');
      prescription.PharmacyNotes =
        prescription.PharmacyNotes == null ? '' : prescription.PharmacyNotes;
      body = body.concat(
        '<b>Pharmacy Notes:</b> ' + prescription.PharmacyNotes + '<br/>'
      );
      return body;
    };

    //Took this from patient account member to add dynamic links
    $scope.validateAccountMember = function (member) {
      if (member && member.PatientId) {
        patientValidationFactory
          .PatientSearchValidation(member)
          .then(function (res) {
            var patientInfo = res;
            let patientPath = 'Patient/';
            if (
              !patientInfo.authorization
                .UserIsAuthorizedToAtLeastOnePatientLocation
            ) {
              patientValidationFactory.LaunchPatientLocationErrorModal(
                patientInfo
              );
              return;
            } else {
              $location.path(
                _.escape(patientPath + member.PatientId + '/Overview')
              );
            }
          });
      }
    };

    // get tab name from url
    ctrl.getTabNameFromParam = function () {
      var urlParams = $location.search();
      var tabName = '';
      if (urlParams && urlParams.tab) {
        var tabNameFromParam = urlParams.tab;
        tabName = tabNameFromParam;
      }
      return tabName;
    };

    $scope.transfer = function (patientId) {
      let tabName = ctrl.getTabNameFromParam();
      let prevLocation = tabName === '' ? 'Clinical' : tabName;
      let patientPath = 'Patient/';
      $location.path(
        _.escape(
          patientPath +
          patientId +
          '/Account/' +
          $scope.patientDetail.AccountMemberOverview.AccountId +
          '/TransferAccount/' +
          prevLocation
        )
      );
    };

    //TODO: Remove this code when the flag is no longer needed for Patient page
    $scope.enableNewClinicalNavigation = userSettingsDataService.isNewNavigationEnabled();

    ctrl.emptyGuid = '00000000-0000-0000-0000-000000000000';

    // this defers the loading of the odontogram and the timeline to allow the clinical page to load more quickly and make other areas clickable for charting, etc.
    angular.element(document).ready(function () {
      $timeout(function () {
        $scope.loadOdontogram = true;
      }, 1000);
      $timeout(function () {
        $scope.loadTimeline = true;
      }, 2000);
    });

    $scope.showImagingDropdown = true;
    $scope.availableImagingProviders;
    $scope.imagingProviders = [];
    $scope.showImagingTab = false;

    ctrl.launchSidexis = function () {
      var sidexis = imagingProviders.Sidexis;
      imagingMasterService
        .getPatientByFusePatientId(
          $scope.patientId,
          $scope.patientInfo.ThirdPartyPatientId,
          sidexis
        )
        .then(res => {
          if (res && res[sidexis] && res[sidexis].success) {
            if (res[sidexis].result && res[sidexis].result.id) {
              imagingMasterService
                .getUrlForPatientByExternalPatientId(
                  res[sidexis].result.id,
                  $scope.patientInfo.ThirdPartyPatientId,
                  sidexis
                )
                .then(res => {
                  if (res && res.result) {
                    $http.get(res.result);
                  }
                });
            } else {
              var imagingPatient = {
                patientId: $scope.patientInfo.ThirdPartyPatientId,
                lastName: $scope.patientInfo.LastName,
                firstName: $scope.patientInfo.FirstName,
                gender: $scope.patientInfo.Sex,
                birthDate: $scope.patientInfo.DateOfBirth,
              };
              imagingMasterService
                .getUrlForNewPatient(imagingPatient, sidexis)
                .then(res => {
                  if (res && res.result) {
                    $http.get(res.result);
                  }
                });
            }
          }
        });
    };

    $scope.selectImagingOption = function (imagingProvider) {
      if (imagingProvider.error === true) return;

      $scope.selectedImagingProvider = imagingProvider.provider;

      if (
        imagingProvider.name === 'XVWeb' ||
        imagingProvider.name === 'Blue Imaging'
      ) {
        $scope.showImagingTab = true;
        $scope.activateTab(4);
      }
      if (imagingProvider.name === 'Sidexis') {
        ctrl.launchSidexis();
        $scope.showImagingTab = false;
      }
    };

    $scope.removeLaunchCapture = function() {
      $location.search('launchCapture', null); //Removes the parameter
      $location.replace();
    }

    ctrl.setImagingOptions = function () {
      if ($scope.imagingProviders.length === 1) {
        var provider = $scope.imagingProviders[0].provider;
        $scope.selectedImagingProvider = provider;

        switch (provider) {
          case imagingProviders.Apteryx2:
          case imagingProviders.Apteryx:
          case imagingProviders.Blue:
            $scope.showImagingDropdown = false;
            $scope.showImagingTab = true;
            break;
          case imagingProviders.Sidexis:
            $scope.showImagingDropdown = true;
            $scope.showImagingTab = false;
            break;
        }
      }
      // show dropdown if more than one imaging provider
      if ($scope.imagingProviders.length > 1) {
        $scope.showImagingDropdown = true;
        $scope.showImagingTab = false;
      }
      if ($scope.imagingProviders.length === 0) {
        $scope.showImagingDropdown = false;
        $scope.showImagingTab = true;
      }
      if ($routeParams.provider) {
        var provider = $scope.imagingProviders.filter(
          x => x.provider === $routeParams.provider
        )[0];
        if (provider) {
          $scope.selectImagingOption(provider);
        }
      }
    };

    // method to determine which imaging (if any) is available for the user
    ctrl.getImagingOptions = async function () {
      $scope.showImagingDropdown = false;

      imagingMasterService.getServiceStatus().then(res => {
        if (
          $scope.imagingProviders === null ||
          $scope.imagingProviders === undefined
        ) {
          return $q.reject();
        }
        $scope.availableImagingProviders = res;
        if (res.blue && res.blue.status === 'ready') {
          $scope.imagingProviders.push({
            name: 'Blue Imaging',
            provider: imagingProviders.Blue,
          });
        }
        if (res.apteryx && res.apteryx.status === 'ready') {
          $scope.imagingProviders.push({
            name: 'XVWeb',
            provider: imagingProviders.Apteryx,
          });
        }
        if (res.apteryx2 && res.apteryx2.status === 'ready') {
          $scope.imagingProviders.push({
            name: 'XVWeb',
            provider: imagingProviders.Apteryx2,
          });
        }
        if (res.sidexis) {
          if (res.sidexis.status === 'ready') {
            $scope.imagingProviders.push({
              name: 'Sidexis',
              provider: imagingProviders.Sidexis,
            });
          } else if (res.sidexis.status === 'error') {
            $scope.imagingProviders.push({
              name: 'Sidexis',
              provider: imagingProviders.Sidexis,
              error: true,
              message: localize.getLocalizedString('Sidexis not available.'),
            });
          }
        }
        ctrl.setImagingOptions();
      });
    };

    // on load
    ctrl.$onInit = async function () {
      ctrl.getPatientEncounters($scope.patientId);

      $scope.activeTab = ctrl.getTabNumberFromParam();

      patientPerioExamFactory.setExamState(examState.None);
      // loading chartLedgerServices, odontogram, perioExamHeaders, and notes
      ctrl.loadClinicalOverview($scope.patientId);
      ctrl.initMedications();

      ctrl.IsNavigatedFromAppts();
      ctrl.loadServiceCodes();

      $scope.perioChartActive = false;
      $scope.patientChartLoading = true;
      $scope.activeDataPoints = ['PD', 'GM', 'MGJ'];
      $scope.conditionsKeyword = { search: '' };
      $scope.serviceCodesKeyword = { search: '' };
      $scope.isBleedAllChecked = false;
      $scope.isSuppurationAllChecked = false;
      $scope.showInactive = { value: false };

      await ctrl.getConditions();
      ctrl.getProviders();
      ctrl.loadDuplicatePatients();

      treatmentPlansFactory.SetActiveTreatmentPlan(null);

      patientOdontogramFactory.setSelectedTeeth(null);

      ctrl.getImagingOptions().then(function () {$scope.patientChartLoading = false;});

      ctrl.isBleedAllCheckedTimer = $interval(() => {
        $scope.isBleedAllChecked = patientPerioExamFactory.getBleedingAll();
      }, 1000);
      ctrl.isSuppurationAllCheckedTimer = $interval(() => {
        $scope.isSuppurationAllChecked = patientPerioExamFactory.getSuppurationAll();
      }, 1000);

      commonServices.PracticeSettings.Operations.Retrieve().$promise.then((res) => {
        var practiceSettings = res.Value;
        ctrl.handlePracticeSettings(practiceSettings);
      })
      if (!$scope.patientChartLoading){
        $scope.removeLaunchCapture();
      }
    };

    ctrl.handlePracticeSettings = function (practiceSettings) {
      $scope.practiceSettings = practiceSettings;
      const practiceId = locationService.getCurrentLocation().practiceid;

      if (
        $scope.practiceSettings &&
        $scope.practiceSettings.PracticeId == practiceId
      ) {
        rxService
          .rxAccessCheck($rootScope.patAuthContext.userInfo.userid)
          .then(function (res) {
            $scope.hasRxAccess = res.result;
          })
          .catch(function () {
            $scope.hasRxAccess = false;
          });
      }

      chartColorsService.loadChartColors().then(function (result) {
        $scope.isChartColorsLoaded = true;
      });
    }

    $scope.$on('$destroy', function () {
      if (!_.isNil(ctrl.isBleedAllCheckedTimer)) {
        $interval.cancel(ctrl.isBleedAllCheckedTimer);
      }

      if (!_.isNil(ctrl.isSuppurationAllCheckedTimer)) {
        $interval.cancel(ctrl.isSuppurationAllCheckedTimer);
      }
    });

    function toggleQuadrantSelectorPanel() {
      if (_.isNil($scope.activatedHiddenAreas)) {
        $scope.activatedHiddenAreas = {};
      }

      if (_.isNil($scope.activatedHiddenAreas.actionsPanel)) {
        // we should only enter this on the first click of the button on the first pageload.
        // force to true to display the panel
        $scope.activatedHiddenAreas.actionsPanel = true;
      } else {
        // every other time, we should hit here.
        $scope.activatedHiddenAreas.actionsPanel = !$scope.activatedHiddenAreas
          .actionsPanel;
      }
    }
    $scope.toggleQuadrantSelectorPanel = toggleQuadrantSelectorPanel;

    $rootScope.$on('close-charting-options-modal', function () {
      if (
        $scope.activatedHiddenAreas &&
        !_.isNil($scope.activatedHiddenAreas.actionsPanel)
      ) {
        $scope.activatedHiddenAreas.actionsPanel = false;
      }
    });

    // #region - view settings
    $scope.viewSettings = {
      expandView: false,
      activeExpand: 0,
    };

    //Getting flag icons for patient chart drawer
    // getting the font awesome icon class based on id
    var symbolList = staticData.AlertIcons();
    $scope.getClass = function (id) {
      return symbolList.getClassById(id);
    };

    // #subregion - primary tabs

    $scope.perioTabs = [
      {
        Index: 6,
        Name: localize.getLocalizedString('PD'),
        ExamType: 'DepthPocket',
      },
      {
        Index: 7,
        Name: localize.getLocalizedString('GM'),
        ExamType: 'GingivalMarginPocket',
      },
      {
        Index: 8,
        Name: localize.getLocalizedString('MGJ'),
        ExamType: 'MgjPocket',
      },
      {
        Index: 10,
        Name: localize.getLocalizedString('MOB'),
        ExamType: 'Mobility',
      },
      {
        Index: 9,
        Name: localize.getLocalizedString('FG'),
        ExamType: 'FurcationGradeRoot',
      },
    ];

    // primary tabs
    $scope.tabs = [
      {
        Index: 0,
        Name: localize.getLocalizedString('Health'),
        AMFA: AmfaKeys.SoarClinCmedView,
      },
      { Index: 1, Name: localize.getLocalizedString('Chart'), AMFA: '' },
      { Index: 2, Name: localize.getLocalizedString('Ledger'), AMFA: '' },
      {
        Index: 3,
        Name: localize.getLocalizedString('Perio'),
        AMFA: AmfaKeys.SoarClinCperioView,
      },
      {
        Index: 4,
        Name: localize.getLocalizedString('Images'),
        AMFA: AmfaKeys.SoarClinCimgsView,
      },
      {
        Index: 5,
        Name: localize.getLocalizedString('Rx'),
        AMFA: AmfaKeys.SoarClinClinrxView,
      },
      { Index: 6, Name: 'CAESY Cloud', AMFA: AmfaKeys.SoarClinCeducView }, // intentionally not localizing CAESY Cloud because it is the name of a company
    ];

    $scope.checkAccessAndActivateTab = function (tab) {
      var hasAccess = $scope.checkAccess(tab);
      if (hasAccess) {
        $scope.activateTab(tab.Index);
      }
    };

    // changing the url param when activateTab is called, which will reload the view and set the new active tab based on that param
    $scope.activateTab = function (index) {
      if ($scope.patient.Data) {
        $scope.setTitle(index);
      }
      // close options modal if any tab that is not chart is clicked
      if (index !== 1) {
        if (
          $scope.activatedHiddenAreas &&
          !_.isNil($scope.activatedHiddenAreas.actionsPanel)
        ) {
          $scope.activatedHiddenAreas.actionsPanel = false;
        }
      }
      // if Perio page, hide drawer nav
      if (index === 3) {
        $rootScope.$broadcast('nav:showHideDrawerNav', false);
      } else {
        $rootScope.$broadcast('nav:showHideDrawerNav', true);
      }
      // do not activate tab if imaging and showImaging is false
      if (index === 4 && $scope.showImagingTab === false) {
        return;
      } else if (index !== 4 && $scope.showImagingDropdown === true) {
        // reset $scope.showImagingTab if index not 4 and showImagingDropdown is true
        $scope.showImagingTab = false;
      }

      // reset the rx alert when tab changes
      $scope.setRxPatientValidation();
      if ($scope.getModifier(index) !== 'disabled') {
        // closes tooth
        $rootScope.$emit('toothClose', {});
        if (index === 6) {
          // CAESY Cloud
          tabLauncher.launchNewTab(
            'https://pca.pattersoncompanies.com/signin/signin.aspx?wa=wsignin1.0&wtrealm=https%3a%2f%2fwww.caesycloud.com&wctx=rm%3d0%26id%3dpassive%26ru%3d%252fPresentations%252flist.aspx&wct=2017-10-16T13%3a59%3a44Z&application=caesycloud'
          );
        } else if ($scope.activeTab === 0) {
          // health
          if ($scope.$parent.$parent.dataHasChanged) {
            ctrl.discardChangesModal($scope.activeTab, index);
          }
        } else if ($scope.activeTab === 3) {
          // perio
          if (patientPerioExamFactory.DataChanged) {
            ctrl.discardChangesModal($scope.activeTab, index);
          }
        } else {
          $scope.activeTab = index;
        }
        if (index !== 4) {
          patientImagingExamFactory.setSelectedExamId();
        }
        // if previous tab was 0 or 3 this code was causing Rx (index == 5) not to be active
        if (index <= 5) {
          $scope.activeTab = index;
        }
      }
    };
    ctrl.getPatientEncounters = function (patientId) {
      patientServices.Encounter.getEncounterServiceTransactionLinkByPersonId(
        { personId: patientId },
        ctrl.getPatientEncountersSuccess,
        ctrl.getPatientEncountersFailed
      );
    };

    ctrl.getPatientEncountersSuccess = function (res) {
      if (res.Value) {
        $scope.patientEncounters = res.Value;
      } else {
        $scope.patientEncounters = null;
      }
    };

    ctrl.getPatientEncountersFailed = function () {
      toastrFactory.error(
        localize.getLocalizedString(
          'Failed to retrieve the {0}. Refresh the page to try again.',
          ['Patient Encounters']
        ),
        localize.getLocalizedString('Server Error')
      );
    };

    ctrl.discardChangesModal = function (activeTab, index) {
      modalFactory.WarningModal().then(function (result) {
        // if they confirm discard, reset the flag
        if (result === true) {
          switch (activeTab) {
            case 0:
              $scope.$parent.$parent.dataHasChanged = false;
              $scope.activeTab = index;
              break;
            case 3:
              treatmentPlansFactory.SetDataChanged(false);
              $scope.activeTab = index;
              break;
          }
        }
      });
    };

    // getting tab number from param only if it is valid, defaulting to Chart/1
    ctrl.getTabNumberFromParam = function () {
      var urlParams = $location.search();
      var tabNumber = 1;
      if (urlParams && !isNaN(urlParams.tab)) {
        tabNumber = Number(urlParams.tab);
      }
      if (
        urlParams.tab == 1 &&
        urlParams.activeSubTab == 2 &&
        $scope.patient.Data
      ) {
        document.title =
          $scope.patient.Data.PatientCode +
          ' - ' +
          localize.getLocalizedString('Treatment Plans');
      } else if (
        urlParams.tab == 1 &&
        urlParams.activeSubTab == 3 &&
        $scope.patient.Data
      ) {
        document.title =
          $scope.patient.Data.PatientCode +
          ' - ' +
          localize.getLocalizedString('Notes');
      } else if (
        urlParams.tab == 0 &&
        urlParams.activeSubTab == 0 &&
        $scope.patient.Data
      ) {
        document.title =
          $scope.patient.Data.PatientCode +
          ' - ' +
          localize.getLocalizedString('Health');
      } else if (
        urlParams.tab == 1 &&
        urlParams.activeSubTab == 0 &&
        $scope.patient.Data
      ) {
        document.title =
          $scope.patient.Data.PatientCode +
          ' - ' +
          localize.getLocalizedString('Chart');
      } else if (
        urlParams.tab == 2 &&
        urlParams.activeSubTab == 0 &&
        $scope.patient.Data
      ) {
        document.title =
          $scope.patient.Data.PatientCode +
          ' - ' +
          localize.getLocalizedString('Ledger');
      } else if (
        urlParams.tab == 3 &&
        urlParams.activeSubTab == 0 &&
        $scope.patient.Data
      ) {
        document.title =
          $scope.patient.Data.PatientCode +
          ' - ' +
          localize.getLocalizedString('Perio');
      } else if (urlParams.tab == 4 && $scope.patient.Data) {
        document.title =
          $scope.patient.Data.PatientCode +
          ' - ' +
          localize.getLocalizedString('Images');
      } else if (urlParams.tab == 5 && $scope.patient.Data) {
        document.title =
          $scope.patient.Data.PatientCode +
          ' - ' +
          localize.getLocalizedString('Rx');
      }
      return tabNumber;
    };

    // just a temporary way of tracking the enabled tabs
    ctrl.enabledTabs = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

    // dynamically adding modifier class to pills
    $scope.getModifier = function (index) {
      // disabling sections until they are ready
      var modifier = ctrl.enabledTabs.indexOf(index) === -1 ? 'disabled' : '';
      if (index === $scope.activeTab) {
        modifier = 'active';
      }
      return modifier;
    };

    $scope.getIsActive = function (index) {
      // disabling sections until they are ready
      var isActive = false;
      if (index === $scope.activeTab) {
        isActive = true;
      }

      return isActive;
    };

    //#subregion - secondary

    // watch for drawer
    $scope.$watch('', function () {
      $scope.drawerIsOpen = true;
    });

    // watch primary tabs to determine which secondary tab to show

    $scope.$watch(
      'activeTab',
      function (nv, ov) {
        if (nv === 3) {
          $scope.activeSecondary = 'perio'; //set secondary to perio
          ctrl.loadPerioExamHeaders();
          ctrl.getPerioPaths();
        } else {
          $scope.activeSecondary = 'timeline'; //else set secondary to timeline
        }
      },
      true
    );

    $scope.$watch(
      'perioExamHeaders',
      function (nv, ov) {
        //Reset the list being passed into examHeader selection dropdown
        $scope.perioExamHeaderListOptions = [];
        $scope.perioExamHeaders.forEach(x => {
          $scope.perioExamHeaderListOptions.push({
            text: x.Title,
            value: x.ExamId,
          });
        });
      },
      true
    );

    //
    $scope.$watch(
      function () {
        return patientPerioExamFactory.ExamTypes;
      },
      function (nv) {
        $scope.perioTabSelected = $filter(
          'filter'
        )(patientPerioExamFactory.ExamTypes, { Active: true })[0];
      },
      true
    );

    // Set active perio exam type
    $scope.selectPerioExamType = function (examType) {
      patientPerioExamFactory.setActiveExamType(
        listHelper.findItemByFieldValue(
          patientPerioExamFactory.ExamTypes,
          'Type',
          examType
        )
      );
    };

    //#endsubregion

    //#subregion - secondarytabs

    // activeSubTab sent in query param for loading specific subTab on load
    ctrl.defaultSubTabIndex = 0;

    ctrl.setSubTabs = function (index) {
      // we do not want to keep the chart favorites area open
      if (index == 2) {
        $scope.viewSettings.expandView = false;
        $scope.viewSettings.activeExpand = 0;
        treatmentPlansFactory.SetActiveTreatmentPlan(null);
        treatmentPlansFactory.CollapseAll();
      }

      if (index === 0) {
        $scope.subTabs = {
          favoritesActive: false,
          timelineActive: false,
          txPlansActive: false,
          notesActive: false,
          patientInfo: true,
          referralActive: false,
        };
      } else if (index === 1) {
        if ($scope.patient.Data) {
          document.title =
            $scope.patient.Data.PatientCode +
            ' - ' +
            localize.getLocalizedString('Chart');
        }
        $scope.subTabs = {
          favoritesActive: false,
          timelineActive: true,
          txPlansActive: false,
          notesActive: false,
          patientInfo: false,
          referralActive: false,
        };
        $scope.currentDrawer = index;
        $scope.loadTimeline = true;
      } else if (index === 2) {
        $scope.subTabs = {
          favoritesActive: true,
          timelineActive: false,
          txPlansActive: false,
          notesActive: false,
          patientInfo: false,
          referralActive: false,
        };
        $scope.currentDrawer = index;
      } else if (index === 3) {
        $scope.subTabs = {
          favoritesActive: false,
          timelineActive: false,
          txPlansActive: true,
          notesActive: false,
          patientInfo: false,
          referralActive: false,
        };
        if ($scope.subTabs.txPlansActive && $scope.patient.Data) {
          document.title =
            $scope.patient.Data.PatientCode +
            ' - ' +
            localize.getLocalizedString('Treatment Plans');
        }
        $scope.currentDrawer = index;
      } else if (index === 4) {
        $scope.subTabs = {
          favoritesActive: false,
          timelineActive: false,
          txPlansActive: false,
          notesActive: true,
          patientInfo: false,
          referralActive: false,
        };
        $scope.currentDrawer = index;

        if ($scope.subTabs.notesActive && $scope.patient.Data) {
          document.title =
            $scope.patient.Data.PatientCode +
            ' - ' +
            localize.getLocalizedString('Notes');
        }
      } else if (index === 5) {
        $scope.subTabs = {
          favoritesActive: false,
          timelineActive: false,
          txPlansActive: false,
          notesActive: false,
          patientInfo: false,
          referralActive: true,
        };
        $scope.currentDrawer = index;
      }
    };
    var tempSubTab = $routeParams.activeSubTab;
    if (
      tempSubTab &&
      tempSubTab !== ctrl.defaultSubTabIndex &&
      parseInt(tempSubTab) !== ctrl.defaultSubTabIndex
    ) {
      $scope.activeSubTab = parseInt(tempSubTab);

      let index = 0;
      // adapter logic to merge one index to values used by the new one for the drawer navigation
      if ($scope.activeSubTab === 0) {
        index = 1;
      } else if ($scope.activeSubTab === 1) {
        index = 2;
      } else if ($scope.activeSubTab === 2) {
        index = 3;
      } else if ($scope.activeSubTab === 3) {
        index = 4;
      } else if ($scope.activeSubTab === 4) {
        index = 5;
      }
      ctrl.setSubTabs(index);
    } else {
      // default to timeline
      $scope.activeSubTab = ctrl.defaultSubTabIndex;
      if ($routeParams.drawerIndex) {
        ctrl.setSubTabs($routeParams.drawerIndex);
      } else {
        ctrl.setSubTabs(1);
      }
    }

    $scope.$on('height-weight-check-values', function (event, patient) {
      $scope.patientInfo.HeightFeet = patient.HeightFeet;
      $scope.patientInfo.HeightInches = patient.HeightInches;
      $scope.patientInfo.Weight = patient.Weight;
      $scope.patientInfo.DataTag = patient.DataTag;
      $scope.patient.Data.HeightFeet = patient.HeightFeet;
      $scope.patient.Data.HeightInches = patient.HeightInches;
      $scope.patient.Data.Weight = patient.Weight;
      $scope.patient.Data.DataTag = patient.DataTag;
    });

    $scope.$on('nav:drawerChange', function (events, index) {
      if ($scope.currentDrawer === index && $scope.drawerIsOpen === true) {
        // set the drawer state
        $scope.drawerIsOpen = false;
        clinicalDrawerStateService.changeDrawerState($scope.drawerIsOpen);
        return; //close drawer
      } else if ($scope.drawerIsOpen === false) {
        // set the drawer state
        $scope.drawerIsOpen = true;
        clinicalDrawerStateService.changeDrawerState($scope.drawerIsOpen);
      }
      $scope.currentDrawer = index; // set new drawer selection
      ctrl.setSubTabs(index);
    });

    $scope.closeDrawer = function () {
      $scope.drawerIsOpen = false;
      // set the drawer state
      clinicalDrawerStateService.changeDrawerState($scope.drawerIsOpen);
    };

    $scope.selectedExamChanged = function (newExamValue) {
      patientPerioExamFactory.setSelectedExamId(newExamValue);
      $scope.$digest();
    };

    ctrl.clearDiscardChangesService = function (controllerName) {
      // since notes can be accessed from multiple tabs (timeline and notes) clear here if has changes
      if (
        discardChangesService.currentChangeRegistration !== null &&
        discardChangesService.currentChangeRegistration.hasChanges === true
      ) {
        if (
          discardChangesService.currentChangeRegistration.controller ===
          controllerName
        ) {
          discardChangesService.currentChangeRegistration.hasChanges = false;
          return true;
        }
      }
      return false;
    };

    ctrl.checkDiscardChangesService = function (controllerName) {
      if (
        discardChangesService.currentChangeRegistration !== null &&
        discardChangesService.currentChangeRegistration.hasChanges === true
      ) {
        if (
          discardChangesService.currentChangeRegistration.controller ===
          controllerName
        ) {
          return true;
        }
        return false;
      }
    };
    // warning modal launcher and callbacks
    ctrl.launchWarningModal = function (deSelectedTab) {
      modalFactory.WarningModal().then(function (result) {
        // if they confirm discard, reset the flag
        if (result === true) {
          // since treatmentPlans reorder can be accessed from multiple tabs clear it from here if there are changes
          ctrl.clearDiscardChangesService('TreatmentPlansReorderController');

          // since notes can be accessed from multiple tabs (timeline and notes) clear here if has changes
          if (
            ctrl.clearDiscardChangesService('PatientNotesCrudController') ===
            true
          ) {
            patientNotesFactory.DataChanged = false;
            noteTemplatesHttpService.SetActiveNoteTemplate(null);
          }
          switch (deSelectedTab) {
            case 0:
              treatmentPlansFactory.SetDataChanged(false);
              treatmentPlansFactory.SetActiveTreatmentPlan(null);
              treatmentPlansFactory.CollapseAll();
              patientNotesFactory.setActiveNote(null);
              $scope.viewSettings.expandView = false;
              patientNotesFactory.setEditMode(false);
              break;
            case 2:
              treatmentPlansFactory.SetDataChanged(false);
              treatmentPlansFactory.SetActiveTreatmentPlan(null);
              treatmentPlansFactory.SetNewTreatmentPlan(null);
              treatmentPlansFactory.CollapseAll();
              treatmentPlansFactory.SetEditing(false);
              $scope.viewSettings.expandView = false;
              break;
            case 3:
              patientNotesFactory.setActiveNote(null);
              $scope.viewSettings.expandView = false;
              patientNotesFactory.setEditMode(false);
              break;
            case 'perio':
              patientPerioExamFactory.SetDataChanged(false);
              $scope.chartActive = false;
              break;
            case 'checklist':
              break;
          }
          // set active tab based on selectedIndex
          $scope.activated($scope.selectedTab);
        }
        // if they do not want to lose changes, send them back to the deselected tab
        else if (result === false) {
          // perio
          switch (deSelectedTab) {
            case 'perio':
              $scope.activateTab(3);
              break;
            default:
              $scope.activated(deSelectedTab);
              $timeout(function () {
                // special handling for txPlan
                if ($scope.viewSettings.activeExpand === 3) {
                  $scope.viewSettings.expandView = true;
                }
              });
              break;
          }
        }
      });
    };

    // sets the active tab but does not call $scope.activated
    $scope.setActiveTab = function (selectedTab) {
      $scope.selectedTab = selectedTab;

      let index = 0;
      // adapter logic to merge one index to values used by the new one for the drawer navigation
      if ($scope.activeSubTab === 0) {
        index = 1;
      } else if ($scope.activeSubTab === 1) {
        index = 2;
      } else if ($scope.activeSubTab === 2) {
        index = 3;
      } else if ($scope.activeSubTab === 3) {
        index = 4;
      } else if ($scope.activeSubTab === 4) {
        index = 5;
      }
      ctrl.setSubTabs(index);
    };

    // called when subTab is activated
    var clickCount = false;
    $scope.activated = function (selectedTab) {
      if ($routeParams.newTab === 'formWidget' && !clickCount) {
        clickCount = true;
        $scope.activeSubTab = 3;
        $scope.subTabs.notesActive = true;
      } else {
        $scope.activeSubTab = selectedTab;
        $scope.subTabs.timelineActive = selectedTab === 0 ? true : false;
      }
    };
    $scope.$on('focustplan', function () {
      if (!$scope.subTabs.txPlansActive) {
        $timeout(function () {
          $scope.toTxPlanTab = true;
          $('#txPlanTab a').click();
        }, 500);
      }
    });

    // called when subTab is de-activated
    $scope.deselected = function ($event, deSelectedTab) {
      // always hide the quadrantSelector if changing tabs
      if (_.isNil($scope.activatedHiddenAreas)) {
        $scope.activatedHiddenAreas = {};
      }

      $scope.activatedHiddenAreas.actionsPanel = false;

      $scope.showServiceCodeSearchPanel = false;
      $scope.showConditionSearchPanel = false;

      // since treatmentPlans reorder and patient notes can be accessed from multiple tabs check to see if they have changes before
      // allowing deselect action
      if (
        ctrl.checkDiscardChangesService('PatientNotesCrudController') === true
      ) {
        $event.preventDefault();
        ctrl.launchWarningModal(deSelectedTab);
        return;
      } else {
        patientNotesFactory.setActiveNote(null);
      }
      if (
        ctrl.checkDiscardChangesService('TreatmentPlansReorderController') ===
        true
      ) {
        $event.preventDefault();
        ctrl.launchWarningModal(deSelectedTab);
        return;
      }
      switch (deSelectedTab) {
        case 0:
          if (treatmentPlansFactory.DataChanged === true) {
            if (
              !$scope.activeSubTab === 0 ||
              $scope.activeSubTab === 2 ||
              $scope.activeSubTab === 3
            ) {
              ctrl.launchWarningModal(deSelectedTab);
            }
          } else {
            //NOTE i can't find an instance when $scope.toTxPlanTab is anything but undefined.  I thin
            // this code could be refactored.
            if (!$scope.toTxPlanTab) {
              treatmentPlansFactory.SetDataChanged(false);
              treatmentPlansFactory.SetActiveTreatmentPlan(null);
              treatmentPlansFactory.CollapseAll();
              $scope.viewSettings.expandView = false;
            }
          }

          break;
        case 2:
          if (treatmentPlansFactory.DataChanged === true) {
            if (
              !$scope.activeSubTab === 2 ||
              $scope.activeSubTab === 0 ||
              $scope.activeSubTab === 3
            ) {
              ctrl.launchWarningModal(deSelectedTab);
            }
          } else {
            treatmentPlansFactory.SetDataChanged(false);
            treatmentPlansFactory.SetActiveTreatmentPlan(null);
            treatmentPlansFactory.SetNewTreatmentPlan(null);
            treatmentPlansFactory.CollapseAll();
            treatmentPlansFactory.SetEditing(false);
            $scope.viewSettings.expandView = false;
          }
          break;
        case 3:
          if (
            patientNotesFactory.DataChanged === false &&
            noteTemplatesHttpService.ActiveNoteTemplate === null
          ) {
            patientNotesFactory.setActiveNote(null);
            $scope.viewSettings.expandView = false;
            patientNotesFactory.setEditMode(false);
          }

          break;
        case 'checklist':
          break;
      }
    };

    //#endsubregion

    //#region ChartLedgerService

    ctrl.clinicalOverviews = [];
    ctrl.loadClinicalOverviews = function (patientIds) {
      patientServices.ClinicalOverviews.getAll(patientIds).$promise.then(
        function (res) {
          ctrl.reloadingChartLedger = true;
          $scope.chartLedgerServices.length = 0;
          $scope.loadingChartLedgerServices = true;
          ctrl.clinicalOverviews = res.Value;

          let chartLedgerServices = [];
          $scope.clinicalOverview.Notes = [];
          ctrl.clinicalOverviews.forEach(clinicalOverview => {
            clinicalOverview.ChartLedger.forEach(cls => {
              chartLedgerServices.push(cls);
            });
            clinicalOverview.Notes.forEach(note => {
              $scope.clinicalOverview.Notes.push(note);
            });
            // notify observers that notes list has changed
            patientNotesFactory.load($scope.clinicalOverview.Notes);
          });
          ctrl.ChartLedgerServicesGetSuccess({ Value: chartLedgerServices });
        },
        function () {
          toastrFactory.error(
            localize.getLocalizedString(
              'Failed to retrieve the list of {0}. Refresh the page to try again.',
              ['Chart ledger services']
            ),
            localize.getLocalizedString('Server Error')
          );
        }
      );
    };

    // get list of ChartLedgerService from here so it can be shared by odontogram, chart ledger
    $scope.$on(
      'soar:reload-clinical-overview',
      function (e, duplicatePatients) {
        toothSelector.unselectTeeth();
        if (duplicatePatients.length > 0) {
          ctrl.loadClinicalOverviews(duplicatePatients);
        }
      }
    );

    // get list of ChartLedgerService from here so it can be shared by odontogram, chart ledger
    $scope.$on('soar:chart-services-reload-ledger', function () {
      toothSelector.unselectTeeth();
      const selectedDuplicates = $scope.duplicatePatients.filter(
        x => x.Selected === true
      );
      let selectedDuplicatePatients = [
        ...new Set(selectedDuplicates.map(obj => obj.PatientId)),
      ];
      if (selectedDuplicatePatients.length > 0) {
        ctrl.loadClinicalOverviews(selectedDuplicatePatients);
      }
    });

    // get the ChartLedgerServices list for this patient
    $scope.getPatientChartLedgerServices = function (resetList) {
      if (resetList) {
        ctrl.reloadingChartLedger = true;
        $scope.chartLedgerServices.length = 0;
      } else {
        ctrl.reloadingChartLedger = false;
      }
      $scope.loadingChartLedgerServices = true;
      // chartLedgerFactory.GetChartLedger($scope.patientId).then(
      //     ctrl.ChartLedgerServicesGetSuccess,
      //     ctrl.ChartLedgerServicesGetFailure
      // );
      patientServices.ChartLedger.get(
        { Id: $scope.patientId },
        ctrl.ChartLedgerServicesGetSuccess,
        ctrl.ChartLedgerServicesGetFailure
      );
    };

    // chart success handler
    ctrl.ChartLedgerServicesGetSuccess = function (res) {
      $scope.loadingChartLedgerServices = false;
      if (!_.isEmpty(res.Value)) {
        chartLedgerFactory.ProcessChartLedger(res.Value);
        $scope.chartLedgerServices = res.Value;

        $timeout(function () {
          ctrl.appendEncounterIdToChartLedgerService();
        }, 1000);
      } else {
        $scope.chartLedgerServices = [];
      }
      $rootScope.$broadcast(
        'soar:chart-services-retrieved',
        ctrl.reloadingChartLedger
      );
      $rootScope.$broadcast(
        'soar:chart-ledger-services',
        $scope.chartLedgerServices
      );
    };

    $scope.$on('patCore:initlocation', function () {
      ctrl.refreshServiceCodes().then(function () {
        ctrl.filterServiceCodes();
      });
    });

    ctrl.appendEncounterIdToChartLedgerService = function () {
      var chartLedgerServices = _.cloneDeep($scope.chartLedgerServices);
      _.forEach(chartLedgerServices, function (service) {
        var encounter = _.find($scope.patientEncounters, {
          ServiceTransactionId: service.RecordId,
        });
        if (!_.isEmpty(encounter)) {
          service.EncounterId = encounter.EncounterId;
        }
      });
      $scope.chartLedgerServices = chartLedgerServices;
    };

    // chart failure handler
    ctrl.ChartLedgerServicesGetFailure = function () {
      $scope.loadingChartLedgerServices = false;
      toastrFactory.error(
        localize.getLocalizedString(
          'Failed to retrieve the list of {0}. Refresh the page to try again.',
          ['Ledger Services']
        ),
        localize.getLocalizedString('Server Error')
      );
      $scope.chartLedgerServices.length = 0;
    };

    //#endregion

    //#region odontogram
    // get the ChartLedgerServices list for this patient
    ctrl.getOdontogram = function (patientId) {
      $scope.loadingPatientOdontogram = true;
      patientServices.Odontogram.get(
        { Id: patientId },
        ctrl.odontogramGetSuccess,
        ctrl.odontogramGetFailure
      );
    };

    // chart success handler
    ctrl.odontogramGetSuccess = function (res) {
      $scope.loadingPatientOdontogram = false;
      if (res.Value && res.Value.OdontogramId != ctrl.emptyGuid) {
        $scope.patOdontogram = { Data: res.Value };
      } else {
        $scope.patOdontogram = {
          Data: { PatientId: $scope.patientId, Teeth: [] },
        };
      }
    };

    // chart failure handler
    ctrl.odontogramGetFailure = function () {
      $scope.loadingPatientOdontogram = false;
      toastrFactory.error(
        localize.getLocalizedString(
          'Failed to retrieve the {0}. Refresh the page to try again.',
          ['Patient Odontogram']
        ),
        localize.getLocalizedString('Server Error')
      );
    };

    //#endregion

    //#region Notes

    // on save
    $scope.noteSaved = function () {
      ctrl.resetNotes();
    };

    // on cancel
    $scope.noteCancelled = function () {
      ctrl.resetNotes();
    };

    // reset clinical notes
    ctrl.resetNotes = function () {
      $scope.viewSettings.expandView = false;
      $scope.viewSettings.activeExpand = 1;
    };

    //#endregion

    $scope.$watch(
      'viewSettings',
      function (nv, ov) {
        if (nv && nv.expandView === true) {
          // closing services and conditions search if we go into expanded view
          $scope.hideServiceCodeSearch();
          $scope.hideConditionSearch();
        }
      },
      true
    );

    //#region perio

    //#region auth

    var authAccess = patientPerioExamFactory.access();
    if (!authAccess.View) {
      toastrFactory.error(
        patSecurityService.generateMessage(AmfaKeys.SoarClinCperioView),
        'Not Authorized'
      );
      //event.preventDefault();
      $location.path('/');
    }

    //#endregion

    ctrl.IsNavigatedFromAppts = function () {
      if (
        !_.isUndefined($routeParams.activeExpand) &&
        !_.isUndefined($routeParams.txPlanId)
      ) {
        treatmentPlansFactory
          .GetTreatmentPlanById($routeParams.patientId, $routeParams.txPlanId)
          .then(function (res) {
            treatmentPlansFactory.SetActiveTreatmentPlan(res.Value);
            $scope.activated('txPlans');
            $scope.viewSettings.expandView = true;
            $scope.viewSettings.activeExpand = 2;
          });
      }
    };

    //Clicking on tile should navigate to selected perio exam
    $scope.activateTabFromTimelineTile = function (tab, data) {
      var tabIndex;

      switch (tab) {
        case 'perio':
          tabIndex = 3;
          ctrl.setPerioExamId(data);
          break;
        case 'imaging':
          tabIndex = 4;
          $scope.showImagingTab = true;
          $scope.selectedImagingProvider = data.provider;
          ctrl.setImageExamId(data.examId);
          break;
        case 'rx':
          tabIndex = 5;
          break;
        default:
          return;
      }
      $scope.activateTab(tabIndex);
    };

    $scope.perioExamHeaders = [];
    $scope.selectedExamId = null;
    $scope.loadingPerioExams = false;
    ctrl.loadPerioExamHeaders = function () {
      $scope.loadingPerioExams = true;
      patientPerioExamFactory.setExamState(examState.Loading);
      if (authAccess.View === true) {
        patientPerioExamFactory.get($scope.patientId).then(function (res) {
          var list = res.Value;
          if (!list) {
            list = [];
          } else {
            list = $filter('filter')(list, { IsDeleted: false });
          }
          $scope.loadingPerioExams = false;
          $scope.perioExamHeaders = $filter('orderBy')(list, ['-ExamDate']);
          $scope.hasPerioExams = !!$scope.perioExamHeaders.length;
          // set selected exam
          ctrl.setSelectedExamId();
        });
      }
    };

    // update local list when it changes
    $scope.updatePerioHeaders = function (list) {
      $scope.selectedExam = { ExamId: null };

      // filter to only active
      list = $filter('filter')(list, { IsDeleted: false });
      if (list && list.length) {
        // order by
        $scope.perioExamHeaders = $filter('orderBy')(list, ['-ExamDate']);

        $scope.hasPerioExams = $scope.perioExamHeaders.length > 0;
        $scope.selectedExam.ExamId = $scope.perioExamHeaders[0].ExamId;
      } else {
        $scope.perioExamHeaders = [];
        $scope.hasPerioExams = false;
        $scope.selectedExam.ExamId = null;
      }
      // kendo :(
      if (angular.element('.perioCompareList')[1]) {
        var kddl = angular
          .element(angular.element('.perioCompareList')[1])
          .data('kendoDropDownList');
        if (kddl) {
          kddl.setDataSource($scope.perioExamHeaders);
          kddl.select($scope.perioExamHeaders[0]);
          kddl.refresh();
        }
      }
      ctrl.setSelectedExamId();
      patientPerioExamFactory.setSelectedExamId($scope.selectedExam.ExamId);

      // re-loading chartLedgerServices, odontogram, perioExamHeaders, and notes
      if (!_.isNil($scope.patientId)) {
        ctrl.loadClinicalOverview($scope.patientId);
      }
    };

    // patient has changed, clear observers
    patientPerioExamFactory.clearObservers();
    // subscribe to list changes
    patientPerioExamFactory.observeExams($scope.updatePerioHeaders);

    //$scope.$watch('selectedExamId', function (nv) {
    //    if (nv) {
    //        $scope.selectedExamId = nv;
    //        patientPerioExamFactory.setSelectedExamId($scope.selectedExamId);
    //    }
    //}, true);

    $scope.showExamList = true;
    $scope.$watch(
      function () {
        return patientPerioExamFactory.ExamState;
      },
      function (nv) {
        nv = $scope.activeTab !== 3 ? 'None' : nv;
        switch (nv) {
          case examState.Start:
            $scope.chartActive = true;
            $scope.selectPerioExamType('DepthPocket');
            $scope.enableFinish = false;
            $scope.showExamList = false;
            $scope.saving = false;
            ctrl.getUsersPerioExamSettings();
            patientPerioExamFactory.setFocusedIndex(0);
            break;
          case examState.EditMode:
            $scope.chartActive = true;
            $scope.selectPerioExamType('DepthPocket');
            $scope.enableFinish = false;
            $scope.saving = false;
            ctrl.getUsersPerioExamSettings();
            patientPerioExamFactory.setFocusedIndex(0);
            break;
          case examState.Save:
          case examState.Loading:
            $scope.showExamList = false;
            $scope.enableFinish = false;
            $scope.saving = true;
            break;
          case examState.Cancel:
            $scope.hasBeenSaved = false;
            $scope.showExamList = false;
            $scope.chartActive = false;
            $scope.saving = false;
            patientPerioExamFactory.setFocusedIndex(0);
            break;
          case examState.Continue:
            $scope.chartActive = true;
            $scope.showExamList = false;
            $scope.saving = false;
            $scope.selectedExamId = null;
            break;
          case examState.SaveComplete:
            $scope.showExamList = true;
            $scope.chartActive = false;
            $scope.enableFinish = false;
            $scope.saving = true;
            break;
          case examState.None:
            ctrl.setSelectedExamId();
            $scope.showExamList = true;
            $scope.chartActive = false;
            $scope.saving = false;
            $scope.enableFinish = false;
            break;
          case examState.ViewMode:
            $scope.showExamList = true;
            $scope.chartActive = false;
            $scope.saving = false;
            $scope.enableFinish = false;
            break;
          default:
            $scope.showExamList = true;
            $scope.saving = false;
            break;
        }
      }
    );

    //#endregion

    //#region Preventive Service
    $scope.patient.Data = $scope.patientInfo;
    //#endregion

    //#region service code search

    $scope.nextSwftPkServCode = function () {
      var index = listHelper.findIndexByFieldValue(
        $scope.swiftPickSelected.SwiftPickServiceCodes,
        'SwiftPickServiceCodeId',
        patientOdontogramFactory.selectedSwiftPickCode
      );
      if (
        index > -1 &&
        index !== $scope.swiftPickSelected.SwiftPickServiceCodes.length - 1
      ) {
        var firstCode = false;
        var lastindex = false;
        var nextIndex = index + 1;
        $scope.SwiftCodesProgress = localize.getLocalizedString(
          ' - ({0} of {1})',
          [nextIndex + 1, $scope.swiftPickSelected.SwiftPickServiceCodes.length]
        );
        if (
          nextIndex ===
          $scope.swiftPickSelected.SwiftPickServiceCodes.length - 1
        )
          lastindex = true;
        patientOdontogramFactory.setselectedChartButton(
          $scope.swiftPickSelected.SwiftPickServiceCodes[index + 1]
            .ServiceCodeId
        );
        patientOdontogramFactory.setSelectedSwiftPickCode(
          $scope.swiftPickSelected.SwiftPickServiceCodes[index + 1]
            .SwiftPickServiceCodeId
        );
        var title =
          $scope.swiftPickSelected.SwiftPickServiceCodes[index + 1].Code +
          $scope.SwiftCodesProgress;
        $scope.openToothCtrls('Service', title, true, firstCode, lastindex);
      } else {
        $scope.closeWindow();
      }
    };

    // Displays the "Add Service"/"Add Condition" kendo window
    $scope.openToothCtrls = function (
      mode,
      title,
      isSwiftCode,
      firstCode,
      lastCode
    ) {
      if (mode === 'Service') {
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
          title: 'Add ' + mode + ' - ' + title,
          modal: true,
        });
        $scope.toothCtrls.content(
          '<multi-location-proposed-service mode="' +
          _.escape(mode) +
          '" isswiftcode="' +
          _.escape(isSwiftCode) +
          '" isfirstcode="' +
          _.escape(firstCode) +
          '" islastcode="' +
          _.escape(lastCode) +
          '" ></multi-location-proposed-service>'
        );
        $scope.toothCtrls.open();
      } else if (mode === 'Condition') {
        $scope.patientConditionCreateUpdate.setOptions({
          resizable: false,
          position: {
            top: '25%',
            left: '21.65%',
          },
          minWidth: 300,
          scrollable: false,
          iframe: false,
          actions: ['Close'],
          title: 'Add ' + mode + ' - ' + title,
          modal: true,
        });
        $scope.patientConditionCreateUpdate.content(
          '<patient-condition-create-update editing="false"></patient-condition-create-update>'
        );
        $scope.patientConditionCreateUpdate.open();
      }
    };

    $scope.closeWindow = function () {
      $scope.closeKendoWindow($scope.toothCtrls);
      $scope.closeKendoWindow($scope.patientConditionCreateUpdate);
    };

    $scope.closeKendoWindow = function (kendoWindow) {
      kendoWindow.setOptions({
        title: '',
      });
      kendoWindow.close();
    };

    $scope.$on('close-tooth-window', function (e) {
      //Workaround for closing
      if (
        !_.isEmpty($scope.toothCtrls) &&
        _.isFunction($scope.toothCtrls.close)
      ) {
        $scope.closeKendoWindow($scope.toothCtrls);
      }
    });

    $scope.$on('close-patient-condition-create-update', function (e) {
      $scope.closeKendoWindow($scope.patientConditionCreateUpdate);
    });

    $scope.$watch('conditionsKeyword.search', function (nv, ov) {
      if (nv) {
        $scope.filteringConditions = true;
      }
      $scope.filterConditions();
    });

    $scope.$watch('serviceCodesKeyword.search', function (nv, ov) {
      if (_.isEqual(nv, ov)) {
        return;
      }
      if (!_.isEmpty(nv)) {
        $scope.filteringServices = true;
      }
      ctrl.filterServiceCodes();
    });

    //
    $scope.openCrudWindow = function (type, item) {
      if (type === 'Condition') {
        patientOdontogramFactory.setselectedChartButton(item.ConditionId);
        // Open kendo window to add condition
        $scope.openToothCtrls(type, item.Description, false, false, true);
      } else if (type === 'Service') {
        if (
          item.SwiftPickServiceCodes &&
          item.SwiftPickServiceCodes.length > 0
        ) {
          $scope.swiftPickSelected = item;
          var firstCode = false;
          var lastCode = false;
          if (item.SwiftPickServiceCodes.length !== 0) {
            $scope.SwiftCodesProgress = localize.getLocalizedString(
              ' - ({0} of {1})',
              [1, item.SwiftPickServiceCodes.length]
            );
            firstCode = true;
            if (item.SwiftPickServiceCodes.length === 1) lastCode = true;
            patientOdontogramFactory.setselectedChartButton(
              item.SwiftPickServiceCodes[0].ServiceCodeId
            );
            patientOdontogramFactory.setSelectedSwiftPickCode(
              item.SwiftPickServiceCodes[0].SwiftPickServiceCodeId
            );
            var title =
              item.SwiftPickServiceCodes[0].Code + $scope.SwiftCodesProgress;
            $scope.openToothCtrls(type, title, true, firstCode, lastCode);
          }
        } else {
          patientOdontogramFactory.setselectedChartButton(item.ServiceCodeId);
          // Open kendo window to add service
          $scope.openToothCtrls(type, item.Code, false, true, false);
        }
      }
    };

    $scope.changeSortingForGrid = function (field) {
      if (
        $scope.swiftPickFilter &&
        (field === 'CdtCodeName' || field === 'ServiceTypeDescription')
      ) {
      } else if (field === 'TimesUsed' || field === 'LastUsedDate') {
        // special handling for these 2 fields based on filtering modal
        $scope.orderBy = { field: field, asc: false };
      } else {
        var asc = $scope.orderBy.field === field ? !$scope.orderBy.asc : true;
        $scope.orderBy = { field: field, asc: asc };
      }
      ctrl.filterServiceCodes();
    };

    $scope.changeSortingForCondition = function (field) {
      var asc =
        $scope.orderByCondition.field === field
          ? !$scope.orderByCondition.asc
          : true;
      $scope.orderByCondition = { field: field, asc: asc };
      $scope.filterConditions();
    };

    var serviceCodesOrderBy = _.cloneDeep($scope.orderBy);
    ctrl.filterServiceCodes = function () {
      var resultSet = ctrl.serviceCodes;
      if (!_.isEqual($scope.orderBy, serviceCodesOrderBy)) {
        serviceCodesOrderBy = _.cloneDeep($scope.orderBy);
        resultSet = _.orderBy(
          ctrl.serviceCodes,
          $scope.orderBy.field,
          $scope.orderBy.asc ? 'asc' : 'desc'
        );
      }

      if ($scope.serviceCodesKeyword && $scope.serviceCodesKeyword.search) {
        resultSet = $filter('searchOnParticularColumn')(
          resultSet,
          $scope.serviceCodesKeyword.search,
          [
            'Code',
            'CdtCodeName',
            'Description',
            'ServiceTypeDescription',
            '$$FeeString',
          ]
        );
      }

      $scope.filteredServiceCodes = $filter('filterOnIsActive')(
        resultSet,
        $scope.showInactive.value
      );
    };

    $scope.filterConditions = function () {
      var resultSet = _.orderBy(
        $scope.conditions,
        $scope.orderByCondition.field,
        $scope.orderByCondition.asc ? 'asc' : 'desc'
      );
      if ($scope.conditionsKeyword.search) {
        resultSet = $filter('searchOnParticularColumn')(
          resultSet,
          $scope.conditionsKeyword.search,
          ['Description']
        );
      }

      $scope.filteredConditions = resultSet;
    };

    ctrl.loadServiceCodes = function () {
      $scope.orderBy = {
        field: 'Code',
        asc: true,
      };

      referenceDataService
        .getData(referenceDataService.entityNames.feeLists)
        .then(function (result) {
          referenceDataService
            .getData(referenceDataService.entityNames.serviceCodes)
            .then(function (res) {
              ctrl.serviceCodes = res;
            });
        });
    };

    /**
     * Refresh and return service codes.
     * @returns {angular.IPromise<any>}
     */
    ctrl.refreshServiceCodes = function () {
      return referenceDataService
        .getData(referenceDataService.entityNames.serviceCodes)
        .then(function (serviceCodes) {
          ctrl.serviceCodes = serviceCodes;
          return ctrl.serviceCodes;
        });
    };

    //#region conditions api

    // getting the list of conditions
    ctrl.getConditions = function () {
      $scope.orderByCondition = {
        field: 'Description',
        asc: true,
      };
      return new Promise((resolve) => {
        featureFlagService.getOnce$(fuseFlag.UsePracticeApiForConditions).subscribe(value => {
          if (value) {
            conditionsService.getAll().then(conditions => {
              $scope.conditions = conditions;
              resolve();
            });
          } else {
            referenceDataService.getData(referenceDataService.entityNames.conditions)
              .then(conditions => {
                $scope.conditions = conditions;
                resolve();
              });
          }
        });
      });
    };

    //#endregion
    function showServiceCodeSearch() {
      $scope.showServiceCodeSearchPanel = true;
      $scope.showConditionSearchPanel = false;
    }
    function showConditionsSearch() {
      $scope.showServiceCodeSearchPanel = false;
      $scope.showConditionSearchPanel = true;
      $scope.filteredConditions = $scope.conditions;
    }
    $scope.hideServiceCodeSearch = function () {
      $scope.showServiceCodeSearchPanel = false;
      $scope.serviceCodesKeyword.search = '';
      $scope.filteredServiceCodes = [];
    };
    $scope.hideConditionSearch = function () {
      $scope.showConditionSearchPanel = false;
      $scope.conditionsKeyword.search = '';
    };

    // Function to open service crud modal to add a service
    $scope.modalIsOpen = false;
    ctrl.providers = [];

    // getting the list of providers
    ctrl.getProviders = function () {
      usersFactory
        .Users()
        .then(ctrl.getProvidersSuccess, ctrl.getProvidersFailure);
    };

    // success callback handler for get all providers
    ctrl.getProvidersSuccess = function (successResponse) {
      if (successResponse && successResponse.Value) {
        usersFactory.LoadedProviders = successResponse.Value;
        ctrl.providers = successResponse.Value;
      }
    };

    // failure callback handler for get all providers
    ctrl.getProvidersFailure = function () {
      ctrl.providers = [];
      toastrFactory.error(
        localize.getLocalizedString(
          'Failed to retrieve the list of {0}. Refresh the page to try again.',
          ['Providers']
        ),
        localize.getLocalizedString('Server Error')
      );
    };

    //#region for old Service Crud Modal
    $scope.openServiceCrudModal = function (serviceObject) {
      // check if user has access to add planned services
      if (
        patSecurityService.IsAuthorizedByAbbreviation(AmfaKeys.SoarClinCpsvcAdd)
      ) {
        var selectedServiceData = _.cloneDeep(serviceObject);
        if ($scope.modalIsOpen === false) {
          $scope.modalIsOpen = true;
          var modalInstance = modalFactory.Modal({
            templateUrl:
              'App/Patient/patient-services/patient-services-crud/patient-services-crud.html',
            controller: 'PatientServicesCrudController',
            windowClass: 'addServ',
            backdrop: 'static',
            amfa: AmfaKeys.SoarClinCpsvcAdd,
            resolve: {
              personId: function () {
                return $scope.patientId;
              },
              patientInfo: function () {
                return $scope.patientInfo;
              },
              providers: function () {
                return ctrl.providers;
              },
              serviceTransaction: function () {
                return null;
              },
              teeth: function () {
                return null;
              },
              selectedServiceData: function () {
                return selectedServiceData;
              },
              preSelectedTreatmentPlan: function () {
                return null;
              },
            },
          });
          modalInstance.result.then(ctrl.successHandler);
        }
      } else {
        //ctrl.notifyNotAuthorized(AmfaKeys.SoarClinCpsvcAdd);
      }
    };

    $scope.openConditionCrudModal = function (conditionObject) {
      // check if user has access to add conditions
      if (
        patSecurityService.IsAuthorizedByAbbreviation(AmfaKeys.SoarClinCcondAdd)
      ) {
        var selectedTeeth = null;
        if ($scope.selection && $scope.selection.teeth) {
          selectedTeeth = $scope.selection.teeth;
        }
        if ($scope.modalIsOpen === false) {
          $scope.modalIsOpen = true;
          var modalInstance = modalFactory.Modal({
            templateUrl:
              'App/Patient/patient-conditions/patient-conditions-crud/patient-conditions-crud.html',
            controller: 'PatientConditionCrudController',
            windowClass: 'addCond',
            backdrop: 'static',
            amfa: AmfaKeys.SoarClinCcondAdd,
            resolve: {
              teeth: function () {
                return selectedTeeth;
              },
              personId: function () {
                return $scope.patientId;
              },
              patientInfo: function () {
                return $scope.patientInfo;
              },
              providers: function () {
                return ctrl.providers;
              },
              conditions: function () {
                return $scope.conditions;
              },
              patientCondition: function () {
                return null;
              },
              selectedConditionData: function () {
                return conditionObject;
              },
            },
          });
          modalInstance.result.then(ctrl.successHandler);
        }
      } else {
        //ctrl.notifyNotAuthorized(AmfaKeys.SoarClinCcondAdd);
      }
    };
    //#endregion

    ctrl.successHandler = function (newItem) {
      $scope.modalIsOpen = false;
      if (newItem) {
        $scope.buttonMode = true;
        // deselect teeth
        if ($scope.selection && $scope.selection.teeth) {
          $scope.selection.teeth = [];
        }
      }
    };
    //#endregion

    // $emitted by ChartingButtonCrudController for refreshing ChartingControlsController
    $scope.$on('soar:chart-btn-layout-updated', function () {
      $scope.$broadcast('soar:update-favorites');
    });

    //#region inactivated patient
    $scope.patientIsInactive = false;
    $scope.$watch('patientInfo', function (nv, ov) {
      if (nv) {
        $scope.patientIsInactive = nv.IsActive;
        ctrl.setButtonState();
      }
    });

    $scope.buttonTooltip = '';
    $scope.disableWhenPatientInactive = false;
    // set button state for buttons based on active state of patient
    ctrl.setButtonState = function () {
      if ($scope.patientInfo.IsActive === false) {
        $scope.buttonTooltip = localize.getLocalizedString(
          'Cannot add services or conditions for an inactive patient'
        );
        $scope.disableWhenPatientInactive = true;
      } else {
        $scope.buttonTooltip = '';
        $scope.disableWhenPatientInactive = false;
      }

      $rootScope.$broadcast('buttonStateChange', [
        $scope.buttonTooltip,
        $scope.disableWhenPatientInactive,
      ]);
    };

    //#endregion

    // #region exam crud

    $scope.$watch(
      function () {
        return patientPerioExamFactory.DataChanged;
      },
      function (nv) {
        $scope.examHasChanges = patientPerioExamFactory.DataChanged;

        if ($scope.examHasChanges) {
          $scope.enableFinish = true;
        }

        if (!$scope.examHasChanges && $scope.hasBeenSaved) {
          $scope.enableFinish = true;
        }
      }
    );

    // Cancel the exam
    $scope.cancelExam = function () {
      patientPerioExamFactory.setExamState(examState.Cancel);
    };

    // Save exam
    $scope.saveExam = function (completeExam) {
      if (completeExam) {
        patientPerioExamFactory.setExamState(examState.SaveComplete);
        $scope.hasBeenSaved = false;
        ctrl.saveUsersPerioExamSettings();
      } else {
        patientPerioExamFactory.setExamState(examState.Save);
        $scope.hasBeenSaved = true;
        ctrl.saveUsersPerioExamSettings();
      }
      $scope.completeExam = completeExam;
    };
    // #end region

    //#region perio dropdown

    $scope.$watch(
      'selectedExam.ExamId',
      function (nv, ov) {
        if (nv) {
          patientPerioExamFactory.setSelectedExamId(nv);
        }
      },
      true
    );

    // sets the selectedExamId to the first exam id in list
    ctrl.setSelectedExamId = function () {
      patientPerioExamFactory.setSelectedExamId(null);
      if ($scope.selectedExam) {
        if ($scope.perioExamHeaders.length > 0) {
          $scope.selectedExam.ExamId = $scope.perioExamHeaders[0].ExamId;
        } else {
          $scope.selectedExam.ExamId = null;
        }
        patientPerioExamFactory.setSelectedExamId($scope.selectedExam.ExamId);
      }
    };

    //Set exam Id of the selected tile in the dropdown
    ctrl.setPerioExamId = function (examId) {
      $timeout(function () {
        patientPerioExamFactory.setSelectedExamId(examId);
      });
    };

    //#endregion

    //#region print perio report
    //TODO move method to the factory?
    $scope.printExam = function () {
      $scope.perioOptActive = false;
      $scope.perioAccess = patientPerioExamFactory.access();
      if ($scope.perioAccess.View) {
        var activePerioExam = patientPerioExamFactory.ActivePerioExam;
        activePerioExam.PerioGraphActive = $scope.perioGraphActive.flag;
        activePerioExam.ActiveDataPoints = $scope.activeDataPoints;
        // get the exam then
        localStorage.setItem(
          'perio_' + activePerioExam.ExamHeader.ExamId,
          JSON.stringify(activePerioExam)
        );
        let patientPath = '#/Patient/';
        tabLauncher.launchNewTab(
          patientPath +
          $scope.patientId +
          '/Clinical/PrintPerioExam/' +
          activePerioExam.ExamHeader.ExamId
        );
      }
    };
    //#endregion

    $scope.compareExams = function () {
      $scope.perioOptActive = false;
      let patientPath = '/Patient/';
      $location.path(
        _.escape(patientPath + $scope.patientId + '/Clinical/ComparePerioExams')
      );
    };

    $scope.viewGraph = function (flag) {
      $scope.perioOptActive = false;
      $scope.perioGraphActive.flag = flag;
    };

    $scope.togglePerioOptions = function () {
      $scope.perioOptActive = !$scope.perioOptActive;
    };

    $scope.closePerioOptionMenu = function () {
      $scope.perioOptActive = true;
    };

    //#region Imaging

    ctrl.setImageExamId = function (examId) {
      patientImagingExamFactory.setSelectedExamId(examId);
    };

    //#endregion

    //#region rx patient validation
    // sets validRxPatientData when tabs change
    $scope.setRxPatientValidation = function () {
      $scope.validRxPatientData = true;
    };
    $scope.setRxPatientValidation();

    //#endregion rx

    //#Bleed all
    $scope.getIsSuppurationAllChecked = function () {
      return $scope.isSuppurationAllChecked;
    };

    $scope.getIsBleedAllChecked = function () {
      return $scope.isBleedAllChecked;
    };

    $scope.toggleBleedAll = function (event) {
      $scope.$apply(() => {
        patientPerioExamFactory.setBleedingAll(
          event.currentTarget.checked == true
        );
      });
    };

    $scope.toggleSuppurationAll = function (event) {
      $scope.$apply(() => {
        patientPerioExamFactory.setSuppurationAll(
          event.currentTarget.checked == true
        );
      });
    };

    //#region paths
    $scope.perioPathUpdated = function (name) {
      if (name.target && name.target.value) {
        //This came from the app dropdown as an event
        $scope.selectedPerioPath = listHelper.findItemByFieldValue(
          $scope.perioPaths,
          'Name',
          name.target.value
        );
      } else {
        //This was called from this file
        $scope.selectedPerioPath = listHelper.findItemByFieldValue(
          $scope.perioPaths,
          'Name',
          name
        );
      }

      $scope.selectedPerioPathName =
        $scope.selectedPerioPath && $scope.selectedPerioPath.Name
          ? $scope.selectedPerioPath.Name
          : null;
      patientPerioExamFactory.setActiveExamPath($scope.selectedPerioPath);
      // for kendo dropdown
    };

    ctrl.getPerioPaths = function () {
      if (!$scope.perioPaths) {
        patientPerioExamFactory.getPerioExamPaths().then(function (res) {
          if (res && res.Value) {
            $scope.perioPaths = res.Value;
            $scope.perioPathsOptionList = [];
            $scope.perioPaths.forEach(x =>
              $scope.perioPathsOptionList.push({ text: x.Name, value: x.Name })
            );
          }
        });
      }
    };

    ctrl.saveUsersPerioExamSettings = function () {
      var currentUser = $rootScope.patAuthContext.userInfo;
      if ($scope.selectedPerioPath) {
        //Get the latest perio exam settings
        userServices.PerioExamSettings.get(
          { Id: currentUser.userid },
          function (res) {
            if (res) {
              if (res.Value) {
                //We have existing settings
                ctrl.existingPerioExamSetting = res.Value;
                if (
                  patSecurityService.IsAuthorizedByAbbreviation(
                    AmfaKeys.SoarBizBizusrEppref
                  )
                ) {
                  ctrl.existingPerioExamSetting.PathId =
                    $scope.selectedPerioPath.PathId;
                  userServices.PerioExamSettings.update(
                    { Id: currentUser.userid },
                    ctrl.existingPerioExamSetting,
                    function (res) { }
                  );
                }

              } else {
                //We don't have existing settings
                if (patSecurityService.IsAuthorizedByAbbreviation(AmfaKeys.SoarBizBizusrAppref)) {
                  userServices.PerioExamSettings.save(
                    { Id: currentUser.userid },
                    {
                      UserId: currentUser.userid,
                      PathId: $scope.selectedPerioPath.PathId,
                    },
                    function (res) { }
                  );
                }
              }

            }
          }
        );

      }
    };

    $scope.getUsersPerioExamSettings = function () {
      ctrl.getUsersPerioExamSettings();
    };

    ctrl.getUsersPerioExamSettings = function () {
      if (
        patSecurityService.IsAuthorizedByAbbreviation(
          AmfaKeys.SoarBizBizusrVppref
        )
      ) {
        var currentUser = $rootScope.patAuthContext.userInfo;
        userServices.PerioExamSettings.get(
          { Id: currentUser.userid },
          function (res) {
            if (res) {
              if (res.Value) {
                ctrl.existingPerioExamSetting = res.Value;
                var path = listHelper.findItemByFieldValue(
                  $scope.perioPaths,
                  'PathId',
                  ctrl.existingPerioExamSetting.PathId
                );
                var index = listHelper.findIndexByFieldValue(
                  $scope.perioPaths,
                  'PathId',
                  ctrl.existingPerioExamSetting.PathId
                );
                $scope.perioPathUpdated(path.Name);
              } else {
                $scope.perioPathUpdated($scope.perioPaths[0].Name);
              }
            }
          }
        );
      } else {
        $scope.perioPathUpdated($scope.perioPaths[0].Name);
      }
    };

    //#endregion

    //#region load Clinical overview

    //TODO move to factory method
    $scope.clinicalOverview = {};
    ctrl.loadClinicalOverview = function (patientId) {
      clinicalOverviewFactory.GetClinicalOverview(patientId).then(
        function (res) {
          $scope.clinicalOverview = clinicalOverviewFactory.clinicalOverview;
          $scope.clinicalOverview.patientInfo = $scope.patientInfo;

          ctrl.ChartLedgerServicesGetSuccess({
            Value: $scope.clinicalOverview.ChartLedger,
          });

          ctrl.odontogramGetSuccess({
            Value: $scope.clinicalOverview.Odontogram,
          });

          ctrl.loadExamHeaders($scope.clinicalOverview.PerioExamSummaries);
        },
        function () {
          toastrFactory.error(
            localize.getLocalizedString(
              'Failed to retrieve the list of {0}. Refresh the page to try again.',
              ['Clinical Notes']
            ),
            localize.getLocalizedString('Server Error')
          );
        }
      );
    };

    ctrl.loadExamHeaders = function (examHeaders) {
      var list = examHeaders;
      if (!list) {
        list = [];
      } else {
        list = $filter('filter')(list, { IsDeleted: false });
      }
      $scope.loadingPerioExams = false;
      $scope.perioExamHeaders = $filter('orderBy')(list, ['-ExamDate']);

      _.forEach($scope.perioExamHeaders, function (perioExam) {
        var local = moment.utc(perioExam.ExamDate).toDate();
        perioExam.Title =
          moment(local).format('MM/DD/YYYY') +
          ' - ' +
          moment(local).format('h:mm a');
      });

      $scope.hasPerioExams = !!$scope.perioExamHeaders.length;
      ctrl.setSelectedExamId();
    };

    $scope.modifyPreventiveCareEditAccess = {
      Value: AmfaKeys.SoarPerPerpsAovr,
    };

    $scope.preventiveCareTitle = localize.getLocalizedString('Preventive Care');
    $scope.heightWeightTitle = localize.getLocalizedString('Weight and Height');

    $scope.activateConditionSearch = function () {
      //close options modal if open
      if (
        $scope.activatedHiddenAreas &&
        !_.isNil($scope.activatedHiddenAreas.actionsPanel)
      ) {
        $scope.activatedHiddenAreas.actionsPanel = false;
      }
      showConditionsSearch();
      // Added a null check
      if (!_.isNil($scope.activatedHiddenAreas)) {
        $scope.activatedHiddenAreas.conditionsCodeSearch = true;
      }
      patientOdontogramFactory.setCloseToothOptions(true);
    };

    $scope.activateServiceSearch = function () {
      //close options modal if open
      if (
        $scope.activatedHiddenAreas &&
        !_.isNil($scope.activatedHiddenAreas.actionsPanel)
      ) {
        $scope.activatedHiddenAreas.actionsPanel = false;
      }
      ctrl.filterServiceCodes();
      showServiceCodeSearch();
      // patientOdontogramFactory.setCloseToothOptions(true);
    };

    $scope.toggleChartMode = function (event) {
      $scope.chartExistingModeOn = event;
      patientServices.ChartExistingModeOn = event;
      $rootScope.$broadcast('toggleChartMode', { show: event });
    };

    //#endregion

    //#region

    // ARWEN: #509747 Locations may not be used. Remove?
    ctrl.getLocations = function () {
      return referenceDataService
        .getData(referenceDataService.entityNames.locations)
        .then(function (locations) {
          ctrl.locations = locations;
          return ctrl.locations;
        });
    };
    ctrl.getLocations();

    //#endregion

    //#region preload treatment plans for multiple tabs (timeline / tx plans)
    treatmentPlansFactory.GetAllHeaders($scope.patientId, true);

    // Refresh treatment plans in time line "All" tab when event is broad-casted every time services are added to treatment plan
    $scope.$on(
      'soar:tx-plan-services-changed',
      function (event, svc, reloadAll) {
        if (reloadAll) {
          treatmentPlansFactory.GetAllHeaders($scope.patientId, true);
        }
      }
    );

    //#endregion

    //#region duplicate patients

    // get a list of duplicates for this patient
    ctrl.loadDuplicatePatients = function () {
      patientServices.PatientDuplicates.get({
        Id: $scope.patientId,
      }).$promise.then(function (res) {
        $scope.duplicatePatients = res.Value;
        $scope.duplicatePatients.forEach(patient => {
          patient.FullName =
            $filter('getDisplayNamePerBestPractice')(patient) +
            ' (' +
            patient.PatientCode +
            ')';
          patient.Selected =
            patient.PatientId === $scope.patientId ? true : false;
        });
      });
    };

    // get a list of PatientIds for selected duplicates
    $scope.selectedPatientsChanged = function () {
      // the routed patient must always be selected
      let primaryPatient = $scope.duplicatePatients.find(
        x => x.PatientId === $scope.patientId
      );
      primaryPatient.Selected = true;

      const selectedDuplicates = $scope.duplicatePatients.filter(
        x => x.Selected === true
      );
      let selectedDuplicatePatients = [
        ...new Set(selectedDuplicates.map(obj => obj.PatientId)),
      ];
      if ($scope.loadingChartLedgerServices === false) {
        if (selectedDuplicatePatients.length > 0) {
          ctrl.loadClinicalOverviews(selectedDuplicatePatients);
        }
      }
    };

    //#endregion

      $scope.$on('appointment:begin-appointment', function (event, appointment) {        
      $scope.activeAppointmentId = appointment.AppointmentId;
      });

      $scope.$on('appointment:end-appointment', function (event, appointment) {
          $scope.activeAppointmentId = null;
      });

    ctrl.getTeethDefinitions = function () {
      staticData.TeethDefinitions().then(function (res) {
        patientOdontogramFactory.TeethDefinitions = res.Value;
      });
      staticData.CdtCodeGroups().then(function (res) {
        patientOdontogramFactory.CdtCodeGroups = res.Value;
      });
    };
    ctrl.getTeethDefinitions();
    $scope.setTitle = function (index) {
      if (index == 0) {
        document.title =
          $scope.patient.Data.PatientCode +
          ' - ' +
          localize.getLocalizedString('Health');
      } else if (index == 1) {
        document.title =
          $scope.patient.Data.PatientCode +
          ' - ' +
          localize.getLocalizedString('Chart');
      } else if (index == 2) {
        document.title =
          $scope.patient.Data.PatientCode +
          ' - ' +
          localize.getLocalizedString('Ledger');
      } else if (index == 3) {
        document.title =
          $scope.patient.Data.PatientCode +
          ' - ' +
          localize.getLocalizedString('Perio');
      } else if (index == 4) {
        document.title =
          $scope.patient.Data.PatientCode +
          ' - ' +
          localize.getLocalizedString('Images');
      } else if (index == 5) {
        document.title =
          $scope.patient.Data.PatientCode +
          ' - ' +
          localize.getLocalizedString('Rx');
      }
    };

    $scope.checkAccess = function (tab) {
      var hasFusePrivileges = false;
      if (tab.AMFA != null && tab.AMFA != '') {
        hasFusePrivileges = patSecurityService.IsAuthorizedByAbbreviation(
          tab.AMFA
        );
      } else {
        hasFusePrivileges = true;
      }

      if (tab.Name === 'Rx') {
        return hasFusePrivileges && $scope.hasRxAccess;
      } else {
        return hasFusePrivileges;
      }
    };

    $scope.setTabTitle = function (tab) {
      var title = '';
      var result = $scope.checkAccess(tab);
      if (tab.Name === 'Rx' && !result) {
        title = localize.getLocalizedString(
          'You are not setup for ePrescriptions at this location, verify your current location and refresh the page.'
        );
      } else if (!result) {
        title = localize.getLocalizedString(
          'You do not have permission to view this information'
        );
      }

      return title;
    };

    $scope.toggleInactive = function () {
      var resultSet = ctrl.serviceCodes;

      if ($scope.serviceCodesKeyword && $scope.serviceCodesKeyword.search) {
        resultSet = $filter('searchOnParticularColumn')(
          resultSet,
          $scope.serviceCodesKeyword.search,
          [
            'Code',
            'CdtCodeName',
            'Description',
            'ServiceTypeDescription',
            '$$FeeString',
          ]
        );
      }

      resultSet = $filter('filterOnIsActive')(
        resultSet,
        $scope.showInactive.value
      );

      if (!_.isEqual($scope.orderBy, serviceCodesOrderBy)) {
        serviceCodesOrderBy = _.cloneDeep($scope.orderBy);
        resultSet = _.orderBy(
          resultSet,
          $scope.orderBy.field,
          $scope.orderBy.asc ? 'asc' : 'desc'
        );
      }

      $scope.filteredServiceCodes = resultSet;
    };
  }

  PatientChartController.prototype = Object.create(BaseCtrl);
})();
