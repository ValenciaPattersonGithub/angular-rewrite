(function () {
  'use strict';
  window.PatientDashboardControl = angular
    .module('Soar.Patient')
    .controller('PatientDashboardController', PatientDashboardController);

  PatientDashboardController.$inject = [
    '$rootScope',
    '$scope',
    '$routeParams',
    '$filter',
    '$location',
    '$anchorScroll',
    'imagingProviderFactory',
    'AmfaKeys',
    'localize',
    'BoundObjectFactory',
    'PatientServices',
    'toastrFactory',
    'StaticData',
    'patSecurityService',
    '$timeout',
    'SaveStates',
    'UserServices',
    'ShareData',
    'UsersFactory',
    'PersonFactory',
    '$window',
    'PatientValidationFactory',
    'PatientBenefitPlansFactory',
    'referenceDataService',
    'FileUploadFactory',
    'PatCacheFactory',
    'PatSharedServices',
    'userSettingsDataService',
    'AppointmentViewLoadingService',
    'AppointmentViewVisibleService',
    'tabLauncher',
    'PatientCommunicationCenterService',
    'CommonServices'
  ];

  function PatientDashboardController(
    $rootScope,
    $scope,
    $routeParams,
    $filter,
    $location,
    $anchorScroll,
    imagingProviderFactory,
    AmfaKeys,
    localize,
    boundObjectFactory,
    patientServices,
    toastrFactory,
    staticData,
    patSecurityService,
    $timeout,
    saveStates,
    userServices,
    shareData,
    usersFactory,
    personFactory,
    $window,
    patientValidationFactory,
    patientBenefitPlansFactory,
    referenceDataService,
    fileUploadFactory,
    cacheFactory,
    patSharedServices,
    userSettingsDataService,
    appointmentViewLoadingService,
    appointmentViewVisibleService,
    tabLauncher,
    patientCommunicationCenterService,
    commonServices,
  ) {
    BaseCtrl.call(this, $scope, 'PatientDashboardController');

    var ctrl = this;

    commonServices.PracticeSettings.Operations.Retrieve().$promise.then((res) => {
      var practiceSettings = res.Value;
      $scope.TimeIncrement = practiceSettings.DefaultTimeIncrement;
    })
    
    $scope.showNewPatientHeader = userSettingsDataService.isNewNavigationEnabled();

    ctrl.patientPath = '#/Patient/';
    ctrl.imagingService = imagingProviderFactory.resolve();
    $scope.validPhones = true;

    // this variable helps determine when the appointment view is visible
    // it is controlled and reset using an observable setup.
    $scope.isAppointmentViewVisible = false;
    $scope.isSecondaryAppointmentViewVisible = false;

    ctrl.onAppointmentViewVisibleChange = function (
      isVisible,
      isSecondaryVisible
    ) {
      let data = appointmentViewLoadingService.currentAppointmentSaveResult;

      $scope.isAppointmentViewVisible = isVisible;
      $scope.isSecondaryAppointmentViewVisible = isSecondaryVisible;
      if (
        (!isVisible || !isSecondaryVisible) &&
        data !== null &&
        data !== undefined
      ) {
        if (appointmentViewLoadingService.afterSaveEvent) {
          if (
            appointmentViewLoadingService.afterSaveEvent ===
            'communication-center'
          ) {
            patientCommunicationCenterService.setCommunicationEvent({
              eventtype: 22,
              data: null,
            });
          } else {
            $rootScope.$broadcast(
              appointmentViewLoadingService.afterSaveEvent,
              data
            );
          }
        }
      }
    };
    appointmentViewVisibleService.registerObserver(
      ctrl.onAppointmentViewVisibleChange
    );

    //#region patient data load

    //patient.Data FOR DISPLAY on VIEW PROFILE / HEADER / ACCOUNT MEMBERS ONLY

    // instance of active patient
    $scope.patient = boundObjectFactory.Create(patientServices.Patient);

    if (_.isNil($scope.person.PatientId)) {
      $scope.person.PatientId = $scope.person.Profile.PatientId;
    }
    patientValidationFactory.SetPatientData($scope.person);
    // store overview data for use when other tabs on clinical are activated
    personFactory.SetActivePatient($scope.person);

    // patien.Data is passed into another controller that has a watch on it.
    // Set all properties on a local variable first, then set patient.Data to avoid watch being fired multiple times
    //$scope.patient.Data = $scope.person.Profile;
    ctrl.patientData = $scope.person.Profile;
    ctrl.soarAuthClinicalDocumentsViewKey = AmfaKeys.SoarDocDocimpView;

    if ($scope.person.PatientGroups) {
      ctrl.patientData.Groups = $scope.person.PatientGroups;
    }

    var pd;
    if ($scope.person.PatientLocations) {
      pd = ctrl.patientData;
      referenceDataService
        .getData(referenceDataService.entityNames.locations)
        .then(function (locations) {
          if (!$scope.person) {
            return;
          }
          _.forEach($scope.person.PatientLocations, function (location) {
            if (location.IsPrimary) {
              var primaryLocation = _.find(locations, {
                LocationId: location.LocationId,
              });
              pd.PrimaryLocation = primaryLocation;
            }
          });
        });
    }

    if ($scope.person.Profile && $scope.person.Profile.PersonAccount) {
      pd = ctrl.patientData;
      _.forEach($scope.person.BenefitPlans, function (patientBenefitPlan) {
        if (patientBenefitPlan.Priority === 0) {
          pd.PrimaryInsurance =
            patientBenefitPlan.PolicyHolderBenefitPlanDto.BenefitPlanDto.Carrier.Name;
        }
        if (patientBenefitPlan.Priority === 1) {
          pd.SecondaryInsurance =
            patientBenefitPlan.PolicyHolderBenefitPlanDto.BenefitPlanDto.Carrier.Name;
        }
      });
    }

    if ($scope.person.PreventiveServicesDue) {
      pd = ctrl.patientData;
      //debugger; ...debugging preventative
      _.forEach($scope.person.PreventiveServicesDue, function (exam) {
        if (exam.IsTrumpService) {
          pd.prevCareDue = exam.DateServiceDue;
          pd.nextPrev = exam.AppointmentStartTime;
          pd.PrevCare = exam;
        }
      });
    }

    if ($scope.person.Phones) {
      pd = ctrl.patientData;
      _.forEach($scope.person.Phones, function (phoneItem) {
        if (phoneItem.PhoneNumber == null && phoneItem.PhoneReferrer) {
          phoneItem.PhoneNumber = phoneItem.PhoneReferrer.PhoneNumber;
          phoneItem.Type = phoneItem.PhoneReferrer.Type;
        }
        if (phoneItem.IsPrimary) {
          pd.primaryPhone = phoneItem;
        }
      });
      ctrl.patientData.Phones = $scope.person.Phones;
      $scope.phones = $scope.person.Phones;
    }

    if ($scope.person.Emails) {
      _.forEach($scope.person.Emails, function (emailItem) {
        if (emailItem.Email == null && emailItem.AccountEMail) {
          emailItem.Email = emailItem.AccountEMail.Email;
        }
      });
      ctrl.patientData.Emails = $scope.person.Emails;
      $scope.emails = $scope.person.Emails;
    }

    if ($scope.person.PatientLocations) {
      ctrl.patientData.PatientLocations = $scope.person.PatientLocations;
      $scope.patientLocations = $scope.person.PatientLocations;
    }

    // add person.Flags, person.MedicalHistoryAlerts, and person.BenefitPlans to the ctrl.patientData
    ctrl.patientData.Flags = $scope.person.Flags ? $scope.person.Flags : [];
    ctrl.patientData.MedicalHistoryAlerts = $scope.person.MedicalHistoryAlerts
      ? $scope.person.MedicalHistoryAlerts
      : [];
    ctrl.patientData.BenefitPlans = $scope.person.BenefitPlans
      ? $scope.person.BenefitPlans
      : [];

    $scope.patient.Data = ctrl.patientData;
    ctrl.patientData = null;

    //#endregion

    //#region get all providers

    /**
     * Get all providers.
     *
     * @returns {angular.IPromise}
     */
    ctrl.getAllProviders = function () {
      return referenceDataService
        .getData(referenceDataService.entityNames.users)
        .then(function (allProviders) {
          shareData.allProviders = allProviders;
          return allProviders;
        });
    };
    ctrl.getAllProviders();

    //#endregion

    //#region Authorization

    ctrl.authAccess = function () {
      $scope.showNewPatientHeader = userSettingsDataService.isNewNavigationEnabled();

      // patient view access
      if (
        !patSecurityService.IsAuthorizedByAbbreviation(
          AmfaKeys.SoarPerPerdemView
        )
      ) {
        toastrFactory.error(
          patSecurityService.generateMessage(AmfaKeys.SoarPerPerdemView),
          'Not Authorized'
        );
        event.preventDefault();
        $location.path('/');
      } else {
        $scope.hasViewAccess = true;
        // accounting view access
        $scope.canViewAccount = patSecurityService.IsAuthorizedByAbbreviation(
          AmfaKeys.SoarAcctActsrvView
        );
        // appointment view access
        $scope.canViewAppointments = patSecurityService.IsAuthorizedByAbbreviation(
          AmfaKeys.SoarSchSptaptView
        );
        // Account encounter view access
        $scope.canViewAccountPendingEncounter = patSecurityService.IsAuthorizedByAbbreviation(
          AmfaKeys.SoarAcctEnctrView
        );
        // preventive care access
        $scope.canViewPreventiveCare = patSecurityService.IsAuthorizedByAbbreviation(
          AmfaKeys.SoarPerPerpsView
        );
        // treatment plans count access
        $scope.canViewTreatmentPlansCount = patSecurityService.IsAuthorizedByAbbreviation(
          AmfaKeys.SoarClinCplanView
        );
        $scope.canViewChart = patSecurityService.IsAuthorizedByAbbreviation(
          AmfaKeys.SoarClinCodogmView
        );
      }
    };

    ctrl.authAccess();

    // pass the modify amfa values to panel to enable / disable edit and save buttons
    $scope.modifyAccess = {
      Value: AmfaKeys.SoarPerPerdemModify,
    };

    $scope.modifyDiscountsAccess = {
      Value: AmfaKeys.SoarPerPerdscEdit,
    };

    $scope.modifyGroupsAccess = {
      Value: AmfaKeys.SoarPerPergrpEdit,
    };

    // #endregion

    // #region Account Members

    $scope.accountMembers = [];

    ctrl.setResponsiblePartyPanel = function () {
      // panel
      if (!_.isNil($scope.patient)) {
        $scope.patient.Data.defaultExpandedPanel =
          $scope.patient.Data.ResponsiblePersonId == null &&
          $scope.patient.Data.ResponsiblePersonType === 0
            ? 'PI_RP'
            : '';
        $scope.accountMembers[0] = $.extend($scope.patient.Data, {
          ResponsibleParty: true,
        });
        patientValidationFactory.SetPatientData($scope.patient.Data);
      }
    };

    $scope.$watch(
      'patient.Data.ResponsiblePersonId',
      function () {
        ctrl.setResponsiblePartyPanel();
      },
      true
    );

    // Bug 7137
    $timeout(function () {
      var element = angular.element('#workArea');
      element.scrollTop(0);
    }, 500);

    // #endregion

    $scope.defaultExpandedPanel = $routeParams.panel;

    $scope.patientId = $routeParams.patientId;

    // #region for accountmembers details

    ctrl.loadAccountInfo = function () {
      if ($scope.canViewAccount) {
        if (
          $scope.patient.Data.PersonAccount &&
          $scope.patient.Data.PersonAccount.AccountId
        ) {
          // may need to determine if this data is stale...
          if (personFactory.ActiveAccountOverview) {
            $scope.accountOverview = personFactory.ActiveAccountOverview;
          } else {
            personFactory
              .AccountOverview($scope.patient.Data.PersonAccount.AccountId)
              .then(function (res) {
                $scope.accountOverview = res.Value;
                personFactory.SetActiveAccountOverview($scope.accountOverview);
                ctrl.setResponsibleParty();
              });
          }
        }
      }
    };
    ctrl.loadAccountInfo();

    // set ResponsiblePersonType, ResponsiblePersonId, and ResponsiblePersonName
    ctrl.setResponsibleParty = function () {
      if ($scope.accountOverview.AccountMembersAccountInfo.length > 0) {
        if (!_.isNil($scope.patient)) {
          let accountMemberInfo = $scope.accountOverview.AccountMembersAccountInfo.find(
            function (accountMembersAccountInfo) {
              return (
                accountMembersAccountInfo.PersonId ===
                $scope.patient.Data.PatientId
              );
            }
          );
          if (
            accountMemberInfo.ResponsiblePersonId === accountMemberInfo.PersonId
          ) {
            $scope.patient.Data.ResponsiblePersonId =
              accountMemberInfo.ResponsiblePersonId;
            $scope.patient.Data.ResponsiblePersonType = 1;
            $scope.patient.Data.ResponsiblePersonName = localize.getLocalizedString(
              'Self'
            );
          } else {
            $scope.patient.Data.ResponsiblePersonId =
              accountMemberInfo.ResponsiblePersonId;
            $scope.patient.Data.ResponsiblePersonType = 2;
            let responsibleParty = $scope.accountOverview.AccountMembersProfileInfo.find(
              function (accountMembersProfileInfo) {
                return (
                  accountMembersProfileInfo.PatientId ===
                  $scope.patient.Data.ResponsiblePersonId
                );
              }
            );
            if (responsibleParty != null) {
              $scope.patient.Data.ResponsiblePersonName = patSharedServices.Format.PatientName(
                responsibleParty
              );
            }
          }
        }
        ctrl.setResponsiblePartyPanel();
      }
    };

    // #endregion

    //#region personalInfo

    $scope.nextPatientAppointment = null;

    // used by personal info page
    $scope.personalInfo = {};
    $scope.personalInfo.Profile = {};
    $scope.personalInfo = $scope.person;
    $scope.personalInfo.Updated = false;

    // Opens the panel containing patient's personal and contact information
    $scope.openPersonalInfoPanel = function () {
      // This variable is used to focus responsible person section in personal information panel
      $scope.defaultFocusOnRespParty = true;

      // This variable is used to expand personal information panel
      $scope.defaultExpandedPanel = 'PI_RP';
      $scope.patient.Data.defaultExpandedPanel = '';
      $scope.patient.Data.defaultExpandedPanel = 'PI_RP';
    };
    // #endregion

    // need this for $scope.data.saveData/$scope.data.originalData cancel comparison function in panel directive
    ctrl.addColumnsToPhones = function (personPhones) {
      _.forEach(personPhones, function (phone) {
        phone.invalidPhoneNumber = false;
        phone.invalidType = false;
      });
    };
    ctrl.addColumnsToPhones($scope.personalInfo.Phones);

    // this has to be done after addColumnsToPhones so that original data matches
    $scope.originalPersonalInfo = angular.copy($scope.personalInfo);

    //#endregion

    //#region preferences

    $scope.preferences = undefined;

    ctrl.copyPreferencesFromPatient = function (patient) {
      var data = $scope.preferences ? $scope.preferences : {};

      if (patient) {
        data = patient.Profile;
      }

      $scope.preferences = data;
      $scope.originalPreferences = angular.copy($scope.preferences);
    };
    ctrl.copyPreferencesFromPatient($scope.person);

    $scope.dataHasChanged = false;
    ctrl.personalChanged = false;
    ctrl.prefChanged = false;
    $scope.$on('personal-info-changed', function (event, dataHasChanged) {
      ctrl.personalChanged = dataHasChanged;
      ctrl.setDataChanged();
    });

    $scope.$on('preferences-changed', function (event, dataHasChanged) {
      ctrl.prefChanged = dataHasChanged;
      ctrl.setDataChanged();
    });
    ctrl.setDataChanged = function () {
      $scope.dataHasChanged = ctrl.prefChanged || ctrl.personalChanged;
    };
    $scope.$watch('dataHasChanged', function (nv) {
      $scope.$broadcast('data-has-changed-updated', nv);
    });

    $scope.$on('medical-history-changed', function (event, dataHasChanged) {
      $scope.medicalHistoryHasChanged = dataHasChanged;
    });

    $scope.$rootScopeRegistrations.push(
      $rootScope.$on('patient-personal-info-changed', function () {
        $window.location.reload();
        toastrFactory.success('Update successful.', 'Update Patient');
      })
    );

    $scope.MostRecentHIPAA = 'N/A';

    $scope.createNewHIPAA = function () {
      var urlToOpen =
        ctrl.patientPath +
        '/HIPAAForm/?patientId=' +
        $scope.patientId +
        '&type=new';
      $window.$windowScope = $scope;
      tabLauncher.launchNewTab(urlToOpen);
    };

    $scope.viewwHIPAA = function () {
      if ($scope.MostRecentHIPAA !== 'N/A') {
        var urlToOpen =
          ctrl.patientPath +
          '/HIPAAForm/?patientId=' +
          $scope.patientId +
          '&type=view';
        //$window.$windowScope = $scope;
        tabLauncher.launchNewTab(urlToOpen);
      }
    };

    $scope.updateHipaaDate = function (latestDate) {
      $scope.getHipaaDocuments();
      $scope.MostRecentHIPAA = latestDate;
      toastrFactory.success(
        localize.getLocalizedString('Your {0} has been saved.', [
          'HIPAA Authorization Form',
        ]),
        localize.getLocalizedString('Success')
      );
    };

    ctrl.getHipaaDocSuccess = function (hipaaAuthorizationSummaries) {
      if (hipaaAuthorizationSummaries) {
        $scope.hipaaDocSummary = $filter('orderBy')(
          hipaaAuthorizationSummaries,
          'FormAnswersId',
          true
        );

        if ($scope.hipaaDocSummary.length > 0) {
          $scope.MostRecentHIPAA = moment(
            $scope.hipaaDocSummary[0].DateModified
          ).format('MM/DD/YYYY');
        } else {
          $scope.MostRecentHIPAA = 'N/A';
        }
      }
    };

    $scope.getHipaaDocuments = function () {
      // cache data
      if ($scope.canViewAccount) {
        if (personFactory.ActiveHipaaAuthorizationSummaries) {
          ctrl.getHipaaDocSuccess(
            personFactory.ActiveHipaaAuthorizationSummaries
          );
        } else {
          patientServices.HipaaAuthorization.getSummariesByPatientId({
            patientId: $scope.patient.Data.PatientId,
          }).$promise.then(function (res) {
            if (res && res.Value) {
              ctrl.getHipaaDocSuccess(res.Value);
              personFactory.SetActiveHipaaAuthorizationSummaries(res.Value);
            }
          });
        }
      }
    };

    $scope.getHipaaDocuments();

    //#endregion

    // #region Referred Patients

    $scope.referredPatients = [];
    $scope.getReferredPatients = function () {
      if ($scope.referredPatients.length > 0) {
        $scope.referredPatients.splice(0, $scope.referredPatients.length);
      }
      angular.forEach($scope.person.ReferredPatients, function (value) {
        $scope.referredPatients.push(value);
      });
    };
    $scope.getReferredPatients();

    // #endregion

    $scope.activeTemplate = '';

    // TODo: this goes away...Handle click event to view patient
    $scope.EditPatient = function () {
      let patientPath = 'Patient/';
      $location.path(patientPath + 'Edit/' + $scope.patientId);
    };

    // Find a better way to do this, if the business moves forward with the collapsing sections
    $scope.toggleIcon = function ($event) {
      if ($event.target.getAttribute('class').indexOf('fa-plus') !== -1) {
        $event.target.setAttribute(
          'class',
          'pull-right icon-button fa fa-minus fa-lg'
        );
      } else {
        $event.target.setAttribute(
          'class',
          'pull-right icon-button fa fa-plus fa-lg'
        );
      }
    };

    ctrl.setAccountSummaryActions = function () {
      if ($scope.patient.Data.PersonAccount) {
        $scope.accountSummaryActions = [
          {
            amfa: 'soar-acct-actsrv-view',
            Path:
              ctrl.patientPath + $scope.patient.Data.PatientId + '/Summary/',
            Text: 'View Account',
          },
        ];
      } else {
        $scope.accountSummaryActions = '';
      }
    };
    ctrl.setAccountSummaryActions();

    ctrl.launchCapture = function () {
        ctrl.imagingService.captureImage(
          {
            patientId: $scope.patient.Data.PatientId,
            lastName: encodeURIComponent($scope.patient.Data.LastName),
            firstName: encodeURIComponent($scope.patient.Data.FirstName),
            gender: $scope.patient.Data.Sex,
            birthDate: $scope.patient.Data.DateOfBirth,
          },
          true,
          true
        );
    };

    $scope.clinicalSummmaryActions = [
      {
        Function: ctrl.launchCapture,
        Path: ctrl.imagingService?.blueImagingUrl ? ctrl.patientPath + $scope.patient.Data.PatientId + '/Clinical/?tab=4&provider=blue&launchCapture=true' : '',
        Inactive: ctrl.imagingService === null,
        Text: 'Launch Capture',
      },
      {
        Path: ctrl.patientPath + $scope.patient.Data.PatientId + '/Clinical/',
        Text: 'View Chart',
      },
      {
        Path:
          ctrl.patientPath +
          $scope.patient.Data.PatientId +
          '/Clinical/?activeSubTab=2',
        Text: 'View Treatment Plans',
      },
    ];

    $scope.aboutActions = [
      {
        amfa: 'soar-per-perdem-view',
        Path:
          ctrl.patientPath +
          $scope.patient.Data.PatientId +
          '/Summary/?tab=Profile',
        Text: 'View Profile',
      },
    ];

    //[PBI 102114]
    $scope.viewFlags = [
      {
        amfa: 'soar-per-perdem-modify',
        Path:
          ctrl.patientPath +
          $scope.patient.Data.PatientId +
          '/Person/?sectionId=4',
        Text: 'View Flags',
      },
    ];
    $scope.editFlags = $location.hash() === 'patientFlagsPanel';

    $scope.editMode = true;

    //#region vars for patient edit
    $scope.hasErrors = false;
    $scope.duplicatePatients = [];
    $scope.primaryNoteCollapsed = true;
    $scope.secondaryNoteCollapsed = true;

    $scope.currentImage = {
      name: null, // name of the user image file
      removeImage: false, // flag to remove the user image
      imageHasChanged: false, // flag to signal state
      src: null, // src of the user iamge
    };

    //#region Collapse Fields
    $scope.isCollapsed = !$scope.editMode;
    $scope.moreLess = localize.getLocalizedString('more');
    // watch the collapse button, changes text
    $scope.$watch('isCollapsed', function (nv, ov) {
      if (nv) $scope.moreLess = localize.getLocalizedString('more');
      else $scope.moreLess = localize.getLocalizedString('less');
    });
    //#endregion

    // Bug 7137
    $timeout(function () {
      var element = angular.element('#workArea');
      element.scrollTop(0);
    }, 500);

    //[PBI 102114] This automatically scrolls to flags from View Flags link in Patient-Overview
    $timeout(function () {
      if ($location.hash() === 'patientFlagsPanel') {
        $anchorScroll();
      }
    }, 900);

    //#region panels

    $scope.panels = {
      AccountMembers: {
        editData: {},
        additionalData: {
          baseId: 'AccountMember',
          list: $scope.accountMembers,
          patientId: $routeParams.patientId,
        },
        valid: true,
        autoSave: false,
      },
      Alerts: {
        valid: true,
        autoSave: true,
      },
      ContactInfo: {
        editData: $scope.patient,
        additionalData: {},
        valid: true,
        autoSave: false,
      },
      Discounts: {
        editData: null,
        valid: false,
        additionalData: {
          PatientId: $routeParams.patientId,
        },
      },
      GroupTypes: {
        editData: {},
        additionalData: {},
        valid: true,
        autoSave: true,
      },
      Preferences: {
        editData: $scope.person,
        additionalData: {},
        valid: true,
        autoSave: false,
      },
      ReferredPatients: {
        editData: {},
        additionalData: {
          baseId: 'ReferredPatient',
          list: $scope.referredPatients,
          patientId: $routeParams.patientId,
        },
        valid: true,
        autoSave: true,
      },
    };
    //#endregion

    // Watch on defaultExpandedPanel property to expand personal information panel
    $scope.$watch(
      'defaultExpandedPanel',
      function (nv, ov) {
        $scope.patient.Data.defaultExpandedPanel = $scope.defaultExpandedPanel;
      },
      true
    );

    $scope.$on('updatePatientStatus', function (events, args) {
      $scope.person.Profile.PersonAccount.InCollection = args;
      if (args) {
        $scope.person.Profile.PersonAccount.ReceivesStatements = false;
        $scope.person.Profile.PersonAccount.ReceivesFinanceCharges = false;
      }
    });

    ctrl.mergePatientData = function () {
      _.merge($scope.patient.Data, $scope.personalInfo);
    };

    if (
      $scope.personalInfo &&
      $scope.personalInfo.Profile &&
      $scope.personalInfo.Profile.DirectoryAllocationId == null
    ) {
      fileUploadFactory
        .CreatePatientDirectory(
          {
            PatientId: $scope.personalInfo.Profile.PatientId,
            DirectoryAllocationId: null,
          },
          null,
          ctrl.soarAuthClinicalDocumentsViewKey
        )
        .then(function (patientDirectoryRes) {
          $timeout(function () {
            ctrl.getPatientInfo = function () {
              if (
                $scope.personalInfo &&
                $scope.personalInfo.Profile &&
                $scope.personalInfo.Profile.DirectoryAllocationId == null &&
                patientDirectoryRes != null
              ) {
                var patientOverviewCache = cacheFactory.GetCache(
                  'patientOverviewCache'
                );
                cacheFactory.ClearCache(patientOverviewCache);
                patientServices.Patients.overview({
                  patientId: $scope.personalInfo.Profile.PatientId,
                }).$promise.then(function (res) {
                  if (res.Value.Profile.DirectoryAllocationId == null) {
                    ctrl.getPatientInfo();
                  } else {
                    $scope.personalInfo = {};
                    $scope.personalInfo.Profile = {};
                    $scope.personalInfo = res.Value;
                    $scope.personalInfo.Updated = false;
                    $scope.patient.Data = $scope.personalInfo.Profile;
                    // Bug 265250 since this method is overwriting the scope.patient.Data here
                    // we need to merge the data back in because
                    // the PatientValidationFactory.CheckPatientLocation requires PatientLocations so
                    // use this method to merge any data needed to the $scope.patient.Data
                    ctrl.mergePatientData();
                  }
                });
              }
            };
            ctrl.getPatientInfo();
          }, 10);
        });
    }

    $scope.$on('$destroy', function () {
      // unregister from observer for the appointment visibility
      appointmentViewVisibleService.clearObserver(
        ctrl.onAppointmentViewVisibleChange
      );
      appointmentViewVisibleService.setAppointmentViewVisible(false);
      appointmentViewVisibleService.setSecondaryAppointmentViewVisible(false);
    });
  }

  PatientDashboardController.prototype = Object.create(BaseCtrl.prototype);
})();
