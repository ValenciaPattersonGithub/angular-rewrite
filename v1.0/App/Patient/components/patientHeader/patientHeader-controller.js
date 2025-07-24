(function () {
  'use strict';

  angular
    .module('Soar.Patient')
    .controller('PatientHeaderController', PatientHeaderController);

  PatientHeaderController.$inject = [
    '$scope',
    '$routeParams',
    '$location',
    '$window',
    'AmfaKeys',
    'ListHelper',
    '$timeout',
    '$rootScope',
    'PatientServices',
    'UserServices',
    'toastrFactory',
    'localize',
    'ShareData',
    '$filter',
    'AppointmentService',
    'ModalFactory',
    'SaveStates',
    'ModalDataFactory',
    'TimeZoneFactory',
    'StaticData',
    'PatientMedicalHistoryAlertsFactory',
    'patSecurityService',
    'referenceDataService',
    '$q',
    'PersonFactory',
    'userSettingsDataService',
    'PatientDetailService',
    'locationService',
    'PatientNotesFactory',
    '$injector',
    'tabLauncher',
    'DiscardChangesService',
    'NoteTemplatesHttpService',
    'FeatureService',
    'FeatureFlagService',
    'FuseFlag',
    'CommonServices',
  ];

  function PatientHeaderController(
    $scope,
    $routeParams,
    $location,
    $window,
    AmfaKeys,
    listHelper,
    $timeout,
    $rootScope,
    patientServices,
    userServices,
    toastrFactory,
    localize,
    shareData,
    $filter,
    appointmentService,
    modalFactory,
    saveStates,
    modalDataFactory,
    timeZoneFactory,
    staticData,
    patientMedicalHistoryAlertsFactory,
    patSecurityService,
    referenceDataService,
    $q,
    personFactory,
    userSettingsDataService,
    patientDetailService,
    locationService,
    patientNotesFactory,
    $injector,
    tabLauncher,
    discardChangesService,
    noteTemplatesHttpService,
    featureService,
    featureFlagService,
    fuseFlag,
    commonServices,
  ) {
    BaseCtrl.call(this, $scope, 'PatientHeaderController');
    var ctrl = this;
    $scope.showNewPatientHeader = userSettingsDataService.isNewNavigationEnabled();

    $scope.nextappointmentId = null;
    $scope.nextAppointment = null;
    $scope.inactivePreferredDentist = false;
    $scope.inactivePreferredHygienist = false;
    ctrl.hasMedicalAlertsViewAccess = false;
    $scope.displayMoreInfo = false;
    $scope.displayMoreIcons = false;
    $scope.masterAlerts = [];
    $scope.Alerts = [];
    $scope.overFlowAlerts = [];
    $scope.customAlerts = [];
    $scope.alertsAndFlags = [];
    $scope.allFlags = [];
    $scope.allAlerts = [];
    $scope.showDrawerNav = false;
    $scope.drawerisOpen = true;
    $scope.drawerChange = 1; // drawer starts on timeline
    $scope.editProfileLink = '#/Patient/' + $routeParams.patientId + '/Person/';
    $scope.editProfileTabLink =
      '#/Patient/' + $routeParams.patientId + '/PersonTab/';
    $scope.ProfileLink =
      '#/Patient/' +
      $routeParams.patientId +
      '/Summary/?tab=Profile&currentPatientId=' +
      $routeParams.patientId;
    $scope.editProfileText = localize.getLocalizedString('Edit Profile');
    $scope.patientDetail = null;
    $scope.showCommunicationDrawerNav = false;
    $scope.showTreatmentPlanServicesDrawerNav = false;
    $scope.getChartExistingModeOn = false;
    $scope.TabMode = false;
    $scope.showReferralsDrawerNav = false;

    $scope.navigate = function (url) {
      tabLauncher.launchNewTab('/v1.0/index.html' + url);
    };
    $scope.navigateNewProfile = function (url) {
      $window.location.href = _.escape(url);
      // if($scope.TabMode){
      //     $window.location.href = $scope.editProfileTabLink;
      // }
      // else{
      //     $window.location.href = url;
      // }
    };
    $scope.showMore = function () {
      if ($scope.displayMoreInfo === false) {
        patientDetailService
          .getPatientDashboardOverviewByPatientId(ctrl.patientId)
          .then(patientOverview => {
            locationService.getAllLocations().then(results => {
              for (let i = 0; i < results.length; i++) {
                if (
                  patientOverview.Profile.PreferredLocation === results[i].id
                ) {
                  patientOverview.Profile.PreferredLocationName =
                    results[i].name;
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
                  patientOverview.AccountMemberOverview
                    .AccountMembersProfileInfo[i].LastName +
                  ', ' +
                  patientOverview.AccountMemberOverview
                    .AccountMembersProfileInfo[i].FirstName;
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

              if ($scope.patientDetail.Profile.AddressReferrer) {
                $scope.displayAddressLine1 =
                  $scope.patientDetail.Profile.AddressReferrer.AddressLine1;
                $scope.displayAddressLine1 =
                  $scope.patientDetail.Profile.AddressReferrer.AddressLine1;
                $scope.displayCity =
                  $scope.patientDetail.Profile.AddressReferrer.City;
                $scope.displayState =
                  $scope.patientDetail.Profile.AddressReferrer.State;
                $scope.displayZipCode =
                  $scope.patientDetail.Profile.AddressReferrer.ZipCode;
                $scope.isReferredAddress = '(Reffered)';
              } else {
                if (ctrl.patientHasAddress($scope.patientDetail.Profile)) {
                  $scope.displayAddressLine1 =
                    $scope.patientDetail.Profile.AddressLine1;
                  $scope.displayAddressLine2 =
                    $scope.patientDetail.Profile.AddressLine2;
                  $scope.displayCity = $scope.patientDetail.Profile.City;
                  $scope.displayState = $scope.patientDetail.Profile.State;
                  $scope.displayZipCode = $scope.patientDetail.Profile.ZipCode;
                } else {
                  $scope.displayAddressLine1 = localize.getLocalizedString(
                    'No Address on File'
                  );
                }
              }

              for (let j = 0; j < $scope.patientDetail.Emails.length; j++) {
                if ($scope.patientDetail.Emails[j].IsPrimary === true) {
                  $scope.displayEmail = $scope.patientDetail.Emails[j].Email;
                }
              }

              // setup insurance display
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

              $scope.displayMoreInfo = true;
            });
          });
      } else {
        $scope.displayMoreInfo = false;
      }
    };

    ctrl.getDisplayName = function () {
      if ($scope.patient) {
        var patient = $scope.patient;
        var name = patient.LastName;
        if (patient.Suffix) {
          name += ' ' + patient.Suffix;
        }
        name += ', ' + patient.FirstName;
        if (patient.MiddleName) {
          name += ' ' + patient.MiddleName[0];
        }
        if (patient.PreferredName) {
          name += ' (' + patient.PreferredName + ')';
        }

        $scope.patient.displayName = name;
      }
    };

    ctrl.patientHasAddress = function (patientProfile) {
      if (patientProfile.AddressLine1) {
        return true;
      }

      if (patientProfile.AddressLine2) {
        return true;
      }

      if (patientProfile.City) {
        return true;
      }

      if (patientProfile.State) {
        return true;
      }

      if (patientProfile.ZipCode) {
        return true;
      }

      return false;
    };

    ctrl.getNextAppointment = function () {
      if ($scope.patient.PatientId) {
        patientServices.PatientAppointment.NextAppointment(
          { PersonId: $scope.patient.PatientId },
          ctrl.getNextAppointmentSuccess,
          ctrl.getNextAppointmentFailure
        );
      }
    };

    ctrl.getNextAppointmentSuccess = function (result) {
      if (result.Value) {
        $scope.nextappointmentId = result.Value.AppointmentId;
        $scope.nextAppointment = result.Value;
        ctrl.displayNextAppointment($scope.nextAppointment);
      }
    };

    ctrl.displayNextAppointment = function () {
      if ($scope.nextAppointment && $scope.nextAppointment.StartTime) {
        timeZoneFactory.ConvertAppointmentDatesTZ(
          $scope.nextAppointment,
          $scope.nextAppointment.LocationTimezoneInfo
        );
        $scope.nextAppointment.$$StartTimeLocal =
          $scope.nextAppointment.StartTime;
        $scope.nextAppointmentIsToday = ctrl.appointmentIsForToday(
          $scope.nextAppointment
        );
      }
      if (!$scope.nextAppointmentDetails)
        patientServices.PatientAppointment.GetWithDetails(
          {
            appointmentId: $scope.nextappointmentId,
            FillAppointmentType: true,
            FillLocation: true,
            FillPerson: true,
            FillProviders: true,
            FillRoom: true,
            FillProviderUsers: true,
            FillServices: true,
            FillServiceCodes: true,
          },
          ctrl.appointmentDetailsSuccess,
          ctrl.getNextAppointmentFailure
        );
    };

    ctrl.getNextAppointmentFailure = function () {
      toastrFactory.error(
        localize.getLocalizedString('Failed to retrieve {0}.', [
          'Next Scheduled Appointment',
        ]),
        'Error'
      );
    };
    ctrl.appointmentDetailsSuccess = function (data) {
      ctrl.processAppointmentDetail(data.Value.Appointment, data.Value);
    };

    ctrl.appointmentIsForToday = function (appointment) {
      var appointmentStart =
        appointment && appointment.$$StartTimeLocal > ''
          ? new Date(appointment.$$StartTimeLocal)
          : null;

      return (
        appointmentStart && moment(new Date()).isSame(appointmentStart, 'day')
      );
    };
    $rootScope.$on(
      'update_patient_data_for_communication_header',
      function (event, result) {
        ctrl.onInit();
      }
    );

    // Fires when tabs are changed and removes Chart Existing Mode on Banner
    $scope.$watch(
      'patientServices.ChartExistingModeOn',
      function () {
        $scope.getChartExistingModeOn = false;
        patientServices.ChartExistingModeOn = false;
      },
      true
    );

    // Fires wwen receiving 'toggleChartMode' messasge
    $scope.$on('toggleChartMode', function (event, args) {
      patientServices.ChartExistingModeOn = args.show;

      // to get UI to update immediately
      $timeout(function () {
        $scope.getChartExistingModeOn = args.show;
      });
    });

    /**
     * Get preferred dentist
     *
     * @returns {angular.IPromise}
     */
    ctrl.getPreferredDentist = function () {
      var deferred = $q.defer();
      if ($scope.patient.PreferredDentist) {
        referenceDataService
          .getData(referenceDataService.entityNames.users)
          .then(function (users) {
            if (!$scope.patient) {
              deferred.resolve();
              return;
            }
            var user = _.find(users, {
              UserId: $scope.patient.PreferredDentist,
            });
            if (!_.isNil(user)) {
              var value = user;
              var pd = value.ProfessionalDesignation
                ? ' ' + value.ProfessionalDesignation
                : '';

              $scope.preferredDentist =
                value.FirstName.substring(0, 1) +
                '. ' +
                value.LastName +
                (value.SuffixName != null && value.SuffixName !== ''
                  ? ' ' + value.SuffixName
                  : '') +
                pd;

              $scope.inactivePreferredDentist =
                !value.IsActive || value.ProviderTypeId === 4;
            }
            deferred.resolve();
          });
      } else {
        $scope.preferredDentist = 'No Preference';
        $scope.inactivePreferredDentist = false;
        deferred.resolve();
      }
      return deferred.promise;
    };

    /**
     * Get preferred hygienist
     *
     * @returns {angular.IPromise}
     */
    ctrl.getPreferredHygienist = function () {
      var deferred = $q.defer();
      if ($scope.patient.PreferredHygienist) {
        referenceDataService
          .getData(referenceDataService.entityNames.users)
          .then(function (users) {
            if (!$scope.patient) {
              deferred.resolve();
              return;
            }
            var user = _.find(users, {
              UserId: $scope.patient.PreferredHygienist,
            });
            if (!_.isNil(user)) {
              var value = user;
              var pd = value.ProfessionalDesignation
                ? ' ' + value.ProfessionalDesignation
                : '';

              $scope.PreferredHygienist =
                value.FirstName.substring(0, 1) +
                '. ' +
                value.LastName +
                (value.SuffixName != null && value.SuffixName !== ''
                  ? ' ' + value.SuffixName
                  : '') +
                pd;
              $scope.inactivePreferredHygienist =
                !value.IsActive || value.ProviderTypeId === 4;
            }
            deferred.resolve();
          });
      } else {
        $scope.PreferredHygienist = 'No Preference';
        $scope.inactivePreferredHygienist = false;
        deferred.resolve();
      }
      return deferred.promise;
    };

    $scope.closeModal = function () {
      $scope.modalInstance.dismiss();
    };

    $scope.$watch('patientData.ResponsiblePersonName', function (nv) {
      if (nv !== null && nv !== undefined && $scope.patient !== undefined) {
        $scope.patient.ResponsiblePersonName = nv;
        $scope.patient.ResponsiblePersonId =
          $scope.patientData.ResponsiblePersonId;
        $scope.patient.ResponsiblePersonType =
          $scope.patientData.ResponsiblePersonType;
      }
    });

    // watch PersonAccount and set Status when Account information available
    $scope.$watch(
      'patientData.PersonAccount',
      function (nv, ov) {
        if (nv && !angular.equals(nv, ov)) {
          ctrl.getPatientStatusDisplay();
          // Save data that we require again and again into the shareData factory.
          shareData.SearchedPatientAccountDetails = {
            AccountId: nv.PersonAccount
              ? nv.PersonAccount.PersonAccountMember.AccountId
              : '',
            AccountMemberId: nv.PersonAccount
              ? nv.PersonAccount.PersonAccountMember.AccountMemberId
              : '',
            PatientId: nv.PatientId,
          };
        }
      },
      true
    );

    $scope.tabs = [
      {
        Area: 'Overview',
        Title: 'Overview',
        Url: '#/Patient/' + $routeParams.patientId + '/Overview/',
        TemplateUrl:
          'App/Patient/patient-profile/patient-overview/patient-overview.html',
        Selected: true,
        amfa: AmfaKeys.SoarPerPerdemView,
      },
      {
        Area: 'Appointments',
        Title: 'Appointments',
        Url: '#/Patient/' + $routeParams.patientId + '/Appointments/',
        TemplateUrl:
          'App/Patient/patient-appointments/patient-appointments-tab.html',
        Selected: false,
        amfa: AmfaKeys.SoarSchSptaptView,
      },
      {
        Area: 'Clinical',
        Title: 'Clinical',
        Url: '#/Patient/' + $routeParams.patientId + '/Clinical/',
        TemplateUrl: 'App/Patient/patient-chart/patient-chart.html',
        Selected: false,
        amfa: AmfaKeys.SoarClinCpsvcView,
      },
      {
        Area: 'Summary',
        Title: 'Account',
        Url:
          '#/Patient/' +
          $routeParams.patientId +
          '/Summary/?tab=Account%20Summary',
        TemplateUrl:
          'App/Patient/patient-account/patient-account-options/patient-account-options.html',
        Selected: false,
        ShowIcon: $scope.patient ? !$scope.patient.PersonAccount : false,
        IconClass: 'glyphicon-exclamation-sign',
        IconRight: true,
        amfa: AmfaKeys.SoarAcctActsrvView,
      },
      {
        Area: 'Communication',
        Title: 'Communication Center',
        Url: '#/Patient/' + $routeParams.patientId + '/Communication',
        TemplateUrl:
          'App/Patient/communication-center/communication-center.html',
        Selected: false,
        IconClass: 'glyphicon-exclamation-sign',
        IconRight: true,
        amfa: AmfaKeys.SoarPatCommView,
      },
    ];

    // disable tabs
    if ($scope.disableTabs) {
      _.forEach($scope.tabs, function (tab) {
        tab.Disabled = true;
        tab.Selected = false;
        tab.Url = 'javascript:void(0)';
      });
    }

    // Hide tabs.
    if ($scope.hideTabs) {
      _.forEach($scope.tabs, function (tab) {
        tab.Disabled = false;
        tab.Selected = false;
        tab.Hidden = true;
        tab.Url = 'javascript:void(0)';
      });
    }

    $scope.selectedTabIndex = 0;

    $scope.SelectTab = function (tabIndex) {
      if (tabIndex == 0 && $scope.patientData) {
        document.title =
          $scope.patientData.PatientCode +
          ' - ' +
          localize.getLocalizedString('Overview');
      }
      //disable tab selection
      if ($scope.disableTabs || $scope.hideTabs) {
        return;
      }

      tabIndex = tabIndex < 0 || tabIndex >= $scope.tabs.length ? 0 : tabIndex; // If the index is out of the bounds of the array, set the value to 0.
      $scope.selectedTabIndex = tabIndex;
      _.forEach($scope.tabs, function (tab) {
        tab.Selected = false;
      });
      $scope.tabs[$scope.selectedTabIndex].Selected = true;
      $scope.activeUrl = $scope.tabs[$scope.selectedTabIndex].TemplateUrl;
    };
    // Remove warning icon for responsible person once it has added from edit patient screen.
    ctrl.changeTabStatus = function () {
      var overviewTab = listHelper.findItemByFieldValue(
        $scope.tabs,
        'Area',
        'Summary'
      );
      overviewTab.ShowIcon = false;
    };

    // Remove warning icon for responsible person once it has added from edit patient screen.
    $scope.$rootScopeRegistrations.push(
      $rootScope.$on('soar:responsible-person-assigned', ctrl.changeTabStatus)
    );

    if ($routeParams.Category) {
      $scope.SelectTab(
        listHelper.findIndexByFieldValue(
          $scope.tabs,
          'Area',
          $routeParams.Category
        )
      );
    } else {
      $scope.SelectTab(0);
    }

    if ($routeParams.Category == 'Clinical') {
      $scope.showDrawerNav = true;
      $scope.showCommunicationDrawerNav = false;
    } else if ($routeParams.Category == 'Communication') {
      $scope.showDrawerNav = true;
      $scope.showCommunicationDrawerNav = true;
    } else {
      $scope.showDrawerNav = false;
    }

    $scope.$on('nav:showHideDrawerNav', function (events, showDrawerNav) {
      $scope.showDrawerNav = showDrawerNav;
    });

    //TODO until we have the IsActive property, base this off IsPatient

    $scope.$on('updatePatientStatus', function (events, args) {
      $scope.patient.PersonAccount.InCollection = args;
      if (args) {
        $scope.patient.PersonAccount.ReceivesStatements = false;
        $scope.patient.PersonAccount.ReceivesFinanceCharges = false;
      }
      ctrl.getPatientStatusDisplay();
    });

    ctrl.getPatientStatusDisplay = function () {
      if ($scope.patient) {
        if (
          $scope.patient.PersonAccount &&
          $scope.patient.PersonAccount.InCollection
        ) {
          $scope.patient.$$DisplayStatus = localize.getLocalizedString(
            'In Collections'
          );
        } else if ($scope.patient.IsActive === true) {
          $scope.patient.$$DisplayStatus =
            $scope.patient.IsPatient === true
              ? localize.getLocalizedString('Active Patient')
              : localize.getLocalizedString('Active Non-Patient');
        } else {
          $scope.patient.$$DisplayStatus =
            $scope.patient.IsPatient === true
              ? localize.getLocalizedString('Inactive Patient')
              : localize.getLocalizedString('Inactive Non-Patient');
        }
      }
    };

    if ($scope.patient && !$scope.patient.$$DisplayStatus) {
      ctrl.getPatientStatusDisplay();
    }

    ctrl.getAppointmentModalDataFailed = function () {
      ctrl.ShowErrorMessage(
        localize.getLocalizedString(
          'Failed to retrieve {0}. Please try again',
          ['the data necessary for editing an appointment']
        )
      );
    };

    ctrl.processAppointmentDetail = function (appointment, appointmentDetail) {
      var details = appointmentDetail ? appointmentDetail : appointment;
      appointment.StartTime = checkDateZeroOffset(
        appointment.StartTime.toString()
      )
        ? appointment.StartTime.toString()
        : appointment.StartTime.toString() + 'Z';
      appointment.EndTime = checkDateZeroOffset(appointment.EndTime.toString())
        ? appointment.EndTime.toString()
        : appointment.EndTime.toString() + 'Z';
      if (details != null) {
        ctrl.appendPatientData(appointment, details.Person);
        ctrl.appendTreatmentRoomData(appointment, details.Room);
        $scope.nextAppointmentDetails = appointment;
      }
    };
    var checkDateZeroOffset = function (dateString) {
      if (dateString) {
        return dateString.substr(dateString.length - 1).toLowerCase() === 'z';
      }
      return false;
    };

    ctrl.appendPatientData = function (appointment, patient) {
      if (appointment != null) {
        appointment.Patient = patient != null ? patient : {};
      }
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

    /**
     * Initialize status list.
     *
     * @returns {angular.IPromise}
     */
    ctrl.initializeStatusList = function () {
      $scope.statusList = staticData.AppointmentStatuses();

      return commonServices.PracticeSettings.Operations.Retrieve().$promise.then((res) => {
        var practiceSettings = res.Value;
        $scope.timeIncrement = _.isNil(practiceSettings) ? null : practiceSettings.DefaultTimeIncrement;
      })
    };

    $scope.dynamicPopover = {
      templateUrl: 'PopoverTemplate.html',
    };

    //#region authorization

    ctrl.authAccess = function () {
      // view access
      if (
        !patSecurityService.IsAuthorizedByAbbreviation(
          AmfaKeys.SoarPerPeraltView
        )
      ) {
        toastrFactory.error(
          patSecurityService.generateMessage(AmfaKeys.SoarPerPeraltView),
          'Not Authorized'
        );
        $location.path(_.escape('/'));
      } else {
        ctrl.hasMedicalAlertsViewAccess = true;
      }
    };

    // authorization
    ctrl.authAccess();

    //#endregion

    //#region medical history alerts

    ctrl.filterAlertsByType = function (alerts) {
      $scope.patientMedicalAlerts = [];
      $scope.patientAllergyAlerts = [];
      $scope.patientPremedAlerts = [];
      if (alerts) {
        $scope.patientAllergyAlerts = _.filter(alerts, {
          MedicalHistoryAlertTypeId: 1,
        });
        $scope.patientMedicalAlerts = _.filter(alerts, {
          MedicalHistoryAlertTypeId: 2,
        });
        $scope.patientPremedAlerts = _.filter(alerts, {
          MedicalHistoryAlertTypeId: 3,
        });
      }
    };

    /**
     * Get medical history alerts.
     *
     * @returns {angular.IPromise}
     */
    ctrl.getMedicalHistoryAlerts = function () {
      var defer = $q.defer();
      if (ctrl.hasMedicalAlertsViewAccess) {
        if (personFactory.PatientMedicalHistoryAlerts) {
          ctrl.filterAlertsByType(personFactory.PatientMedicalHistoryAlerts);
          defer.resolve();
        } else {
          patientMedicalHistoryAlertsFactory
            .PatientMedicalHistoryAlerts($scope.patient.PatientId)
            .then(function (res) {
              // NOTE: if res.Value is NULL or undefined, when we load the encounter checkout screen, we'll start throwing errors
              //       and those errors prevent checkout from working. If res.Value is null or undefined, set it to an empty array
              if (!res.Value) {
                res.Value = [];
              }

              personFactory.SetPatientMedicalHistoryAlerts(res.Value);
              ctrl.filterAlertsByType(res.Value);

              defer.resolve();
            });
        }
      }
      return defer.promise;
    };

    // refresh when medical history changes
    $scope.$on('soar:medical-history-form-created', function () {
      personFactory.PatientAlerts = null;
      personFactory.PatientMedicalHistoryAlerts = null;
      ctrl.getMedicalHistoryAlerts().then(function () {
        ctrl.getPatientFlags();
      });
    });

    $scope.$on('alerts-updated', function () {
      personFactory.PatientAlerts = null;
      personFactory.PatientMedicalHistoryAlerts = null;
      ctrl.getMedicalHistoryAlerts().then(function () {
        ctrl.getPatientFlags();
      });
    });

    //#endregion

    //#region patient flags
    ctrl.getPatientFlags = function () {
      var defer = $q.defer();
      if (ctrl.hasMedicalAlertsViewAccess) {
        if (personFactory.PatientAlerts) {
          ctrl.patientAlertsServiceGetSuccess({
            Value: personFactory.PatientAlerts,
          });
          defer.resolve();
        } else {
          personFactory
            .getPatientAlerts($scope.patient.PatientId)
            .then(function (res) {
              personFactory.SetPatientAlerts(res.Value);
              ctrl.patientAlertsServiceGetSuccess(res);
              defer.resolve();
            });
        }
      }
      return defer.promise;
    };

    //Fill master and custom array
    ctrl.patientAlertsServiceGetSuccess = function (res) {
      $scope.masterAlerts = [];
      $scope.customAlerts = [];
      $scope.Alerts = [];
      $scope.alerts = _.cloneDeep(res.Value);
      $scope.masterAlerts = _.filter(res.Value, function (alert) {
        return alert.MasterAlertId;
      });
      $scope.customAlerts = _.filter(res.Value, function (alert) {
        return !alert.MasterAlertId;
      });

      if ($scope.masterAlerts.length > 8) {
        for (var i = 8; i < $scope.masterAlerts.length; i++) {
          $scope.overFlowAlerts[i - 8] = $scope.masterAlerts[i];
        }
        for (var x = 0; x < $scope.masterAlerts.length; x++) {
          $scope.Alerts[x] = $scope.masterAlerts[x];
        }
      } else {
        for (var y = 0; y < $scope.masterAlerts.length; y++) {
          $scope.Alerts[y] = $scope.masterAlerts[y];
        }
      }
      $scope.concatAlertsAndFlags();
    };

    // getting the font awesome icon class based on id
    var symbolList = staticData.AlertIcons();
    $scope.getClass = function (id) {
      return symbolList.getClassById(id);
    };
    //#endregion

    // Bug 7137
    $timeout(function () {
      $window.scrollTo(0, 0);

      //$('.communication-patient-header .patientHeader__info').removeClass("col-md-6 col-sm-6");
      //$('.communication-patient-header .patientHeader__info').addClass("col-md-12 col-sm-12");
      //$('.communication-patient-header .secondaryNavigation').removeClass("col-md-6 col-sm-6");
    }, 500);

    $scope.primaryPhone = {};
    ctrl.addPhoneType = function (patient) {
      var phoneDesc = '';
      if (patient && patient.primaryPhone && patient.primaryPhone.Type) {
        phoneDesc =
          patient.primaryPhone.Type === 'Mobile'
            ? '(M)'
            : patient.primaryPhone.Type === 'Home'
              ? '(H)'
              : '(W)';
      } else {
        phoneDesc = '';
      }

      if (
        patient &&
        patient.primaryPhone &&
        patient.primaryPhone.$$Description !== phoneDesc
      ) {
        patient.primaryPhone.$$Description = phoneDesc;
      } else if (phoneDesc === '' && _.isNull(patient.primaryPhone)) {
        patient.primaryPhone = { $$Description: '' };
      }
      $scope.primaryPhone = patient.primaryPhone;
    };

    ctrl.patientLoaded = false;

    $scope.openDrawer = function (index) {
      var promise = null;
      var triggersNoteDiscard =
        patientNotesFactory.DataChanged &&
        index != 1 &&
        index != 4 &&
        !$scope.showCommunicationDrawerNav;
      if (triggersNoteDiscard) {
        //Display discard warning when switching header tabs when we have an open clinical note with changes
        promise = modalFactory.WarningModal(
          discardChangesService.currentChangeRegistration.customMessage
        );
      } else {
        //Otherwise, just resolve the promise and continue
        promise = Promise.resolve(true);
      }

      promise.then(function (result) {
        if (result === true) {
          if (triggersNoteDiscard) {
            patientNotesFactory.setDataChanged(false);
            noteTemplatesHttpService.SetActiveNoteTemplate(null);
          }

          // discard changes and reroute
          if ($scope.showCommunicationDrawerNav) {
            $scope.drawerChange = index;
            $location
              .path(
                _.escape('/Patient/' + $routeParams.patientId + '/Clinical/')
              )
              .search({ drawerIndex: index });
          } else {
            $scope.drawerChange = index;
            $rootScope.$broadcast('nav:drawerChange', index);
          }
          $scope.$digest();
          $rootScope.$digest();
        }
      });
    };

    $scope.$on(
      'nav:resetDisplayIconsForTreatmentPlanDisplay',
      function (events, value) {
        $scope.showTreatmentPlanServicesDrawerNav = value;
      }
    );

    $scope.concatAlertsAndFlags = function () {
      $scope.alertsAndFlags = [
        ...$scope.patientMedicalAlerts,
        ...$scope.patientAllergyAlerts,
        ...$scope.overFlowAlerts,
        ...$scope.patientPremedAlerts,
        ...$scope.Alerts,
        ...$scope.customAlerts,
      ];
      $scope.allFlags = [...$scope.Alerts, ...$scope.customAlerts];
      $scope.allAlerts = [
        ...$scope.patientMedicalAlerts,
        ...$scope.patientAllergyAlerts,
        ...$scope.patientPremedAlerts,
      ];
    };

    ctrl.setupWatchers = function () {
      $scope.$watch(
        'patientData.PreferredLocation',
        function (nv) {
          if (!_.isNil(nv) && ctrl.patientLoaded === true) {
            referenceDataService
              .getData(referenceDataService.entityNames.locations)
              .then(function (locations) {
                if (!$scope.patient) {
                  return;
                }
                var primaryLocation = _.find(locations, { LocationId: nv });
                if (primaryLocation) {
                  $scope.patient.PrimaryLocation = primaryLocation;
                  // force refresh of patient data
                  personFactory.ActivePatient = null;
                }
              });
          }
        },
        true
      );

      $scope.$watch(
        'patientData.PreferredDentist',
        function (nv) {
          if (!_.isNil(nv) && ctrl.patientLoaded === true) {
            $scope.patient.PreferredDentist = nv;
            // force refresh of patient data
            personFactory.ActivePatient = null;
            ctrl.getPreferredDentist();
          }
        },
        true
      );

      $scope.$watch(
        'patientData.PreferredHygienist',
        function (nv) {
          if (!_.isNil(nv) && ctrl.patientLoaded === true) {
            $scope.patient.PreferredHygienist = nv;
            // force refresh of patient data
            personFactory.ActivePatient = null;
            ctrl.getPreferredHygienist();
          }
        },
        true
      );
    };

    ctrl.onInit = function () {
      $scope.patient = _.cloneDeep($scope.patientData);
      if ($scope.patient) {

        featureFlagService.getOnce$(fuseFlag.ShowPatientReferralsOnClinical).subscribe((value) => {
          $scope.showReferralsDrawerNav = value;
        });

        // set the patientId for other things to utilize later.
        patientDetailService.setActivePatientId($scope.patientData.PatientId);

        patientNotesFactory.clearCached();
        ctrl.patientId = $scope.patientData.PatientId;
        ctrl.initializeStatusList().then(function () {
          if (!$scope.patientData) {
            return;
          }

          ctrl.getDisplayName();

          // load flags and medical history alerts to factory if exist
          if ($scope.patientData.Flags) {
            personFactory.SetPatientAlerts($scope.patientData.Flags);
          }
          if ($scope.patientData.MedicalHistoryAlerts) {
            personFactory.SetPatientMedicalHistoryAlerts(
              $scope.patientData.MedicalHistoryAlerts
            );
          }
          ctrl
            .getMedicalHistoryAlerts()
            .then(() => ctrl.getPatientFlags())
            .then(function () {
              if (!$scope.patientData) {
                return;
              }
              ctrl.getPatientStatusDisplay();
              ctrl.addPhoneType($scope.patientData);
              ctrl.patientLoaded = true;

              ctrl.setupWatchers();
            });
          featureService
            .isEnabled('AccountMemberTabs', 'practicesettingrow')
            .then(function (res) {
              $scope.TabMode = res;
            });
          // set default button for drawer (if showing it will matter)
          var tempSubTab = $routeParams.activeSubTab;
          if (
            tempSubTab &&
            parseInt(tempSubTab) + 1 !== ctrl.defaultSubTabIndex
          ) {
            $scope.drawerChange = parseInt(tempSubTab) + 1;
          }
        });
      }
    };
    ctrl.onInit();
  }

  PatientHeaderController.prototype = Object.create(BaseCtrl.prototype);
})();
