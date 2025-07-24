'use strict';
angular.module('Soar.Patient').controller('PreventiveCareDirectiveController', [
  '$scope',
  'ListHelper',
  'PreventiveCareService',
  'PatientPreventiveCareFactory',
  'localize',
  '$timeout',
  'ModalFactory',
  '$routeParams',
  'toastrFactory',
  'locationService',
  'TimeZoneFactory',
  '$location',
  'userSettingsDataService',
  'AppointmentViewVisibleService',
  'AppointmentViewDataLoadingService',
  'FeatureFlagService',
  'FuseFlag',
  'schedulingMFENavigator',
  function (
    $scope,
    listHelper,
    preventiveCareService,
    patientPreventiveCareFactory,
    localize,
    $timeout,
    modalFactory,
    $routeParams,
    toastrFactory,
    locationService,
    timeZoneFactory,
    $location,
    userSettingsDataService,
    appointmentViewVisibleService,
    appointmentViewDataLoadingService,
    featureFlagService,
    fuseFlag,
    schedulingMfeNavigator
  ) {
    var ctrl = this;

    ctrl.$onInit = function () {
      // scope vars
      $scope.hasErrors = false;
      $scope.servicesDueLoading = true;
      // panel directive initial valid setting
      $scope.valid = false;
      $scope.gridDataSourceLoading = true;
      // local vars
      ctrl.patientId = $scope.patientId
        ? $scope.patientId
        : $routeParams.patientId;
      ctrl.gridDataSourceHasLoaded = false;
      // function calls
      preventiveCareService.accessForServiceType();
      // if we dont get the data, make the get services due call
      if (!$scope.data) {
        ctrl.getServicesDue();
      } else {
        ctrl.processServicesDue($scope.data);
      }
      //
      $scope.preventCareSchedulerURL =
        '#/Schedule/?open=newPreventiveAppointment&patient=' + ctrl.patientId; // let's start with a base URL
      if (
        location.href.toUpperCase().endsWith('APPOINTMENTS/') ||
        location.href.toUpperCase().endsWith('APPOINTMENTS')
      )
        $scope.preventCareSchedulerURL =
          $scope.preventCareSchedulerURL + '&targetTab=Appointments';
      if (
        location.href.toUpperCase().endsWith('CLINICAL/') ||
        location.href.toUpperCase().endsWith('CLINICAL')
      )
        $scope.preventCareSchedulerURL =
          $scope.preventCareSchedulerURL + '&targetTab=Clinical';

      featureFlagService.getOnce$(fuseFlag.ShowScheduleV2).subscribe((value) => {
        $scope.useV2Schedule = value;
      });
    };

    $scope.showAppointmentModal = function (trumpService) {
      let appointmentCopy = angular.copy(trumpService);

      appointmentCopy.AppointmentId = trumpService.AppointmentId;
      appointmentCopy.StartTime = trumpService.AppointmentStartTime;
      appointmentCopy.PersonId = trumpService.PersonId || ctrl.patientId;

      if (trumpService.Location && trumpService.Location.Timezone) {
        appointmentCopy.Location = angular.copy(trumpService.Location);
      } 
      else {
        let currentLocation = locationService.getCurrentLocation();
        if (currentLocation && currentLocation.timezone) {
          appointmentCopy.Location = { Timezone: currentLocation.timezone };
        } 
        else {
          toastrFactory.error('Location information is missing', 'Error');
          return;
        }
      }

      if ($scope.useV2Schedule) {
        schedulingMfeNavigator.navigateToAppointmentModal({
          id: appointmentCopy.AppointmentId
        });
      }
      else {
        appointmentViewDataLoadingService.getViewData(appointmentCopy, false)
          .then(function (res) {
            appointmentViewVisibleService.changeAppointmentViewVisible(true, false);
          }, function (error) {
            console.error(error);
            toastrFactory.error('Ran into a problem loading the appointment', 'Error');
          });
      }
    };

    //#region 'private' methods

    // services due response handler
    ctrl.processServicesDue = function (servicesDue) {
      $scope.servicesDue = servicesDue;
      angular.forEach($scope.servicesDue, function (exam) {
        patientPreventiveCareFactory.SetCustomPropertiesForServicesDue(
          exam,
          false
        );
        exam.$$DateLabel =
          exam.$$DateLabel === 'Due'
            ? localize.getLocalizedString('Due After')
            : exam.$$DateLabel;
        // grabbing trump service
        if (exam.IsTrumpService === true) {
          $scope.trumpService = exam;
          $scope.trumpService.AppointmentId = $scope.trumpService.AppointmentId
            ? $scope.trumpService.AppointmentId
            : '';
          $scope.trumpService.$$copyOfAppointmentStartTime =
            timeZoneFactory.ConvertDateTZ(
              angular.copy($scope.trumpService.AppointmentStartTime),
              locationService.getCurrentLocation().timezone
            );
          $scope.trumpService.AppointmentStartTime = $scope.trumpService
            .$$copyOfAppointmentStartTime
            ? moment($scope.trumpService.$$copyOfAppointmentStartTime).format(
                'YYYY-MM-DD'
              )
            : '';
        }
      });
      $scope.servicesDueLoading = true;
    };

    // getting patient preventive care services due
    ctrl.getServicesDue = function () {
      patientPreventiveCareFactory
        .GetAllServicesDue(ctrl.patientId, true)
        .then(function (res) {
          if (res && res.Value) {
            ctrl.processServicesDue(res.Value);
          }
        });
    };

    // overrides response handler
    ctrl.processOverridesResponse = function (res, initialLoad) {
      if (res && res.Value) {
        $scope.patientPrevCareOverrides = res.Value;
        if (initialLoad === true) {
          $scope.patientPrevCareOverridesSource = res.Value;
          var patientHasTrumpService = false;
          var practiceTrumpService;
          angular.forEach(res.Value, function (exam) {
            exam.PatientFrequency =
              exam.PatientFrequency === null
                ? exam.PracticeFrequency
                : exam.PatientFrequency;
            if (exam.IsPatientTrumpService === true) {
              patientHasTrumpService = true;
            }
            if (exam.IsPracticeTrumpService === true) {
              practiceTrumpService = exam;
            }
          });
          // if a patient has never had any overrides, IsPatientTrumpService will be false for all services, setting IsPatientTrumpService to true based on IsPracticeTrumpService
          if (patientHasTrumpService === false) {
            practiceTrumpService.IsPatientTrumpService = true;
          }
          $scope.gridDataSource = new kendo.data.DataSource({
            data: $scope.patientPrevCareOverridesSource,
          });
        } else {
          angular.forEach(res.Value, function (exam) {
            var override = listHelper.findItemByFieldValue(
              $scope.patientPrevCareOverridesSource,
              'PreventiveServiceTypeId',
              exam.PreventiveServiceTypeId
            );
            if (override) {
              override.DataTag = exam.DataTag;
              override.PatientFrequency = exam.PatientFrequency;
              override.IsPatientTrumpService = exam.IsPatientTrumpService;
            }
            var backup = listHelper.findItemByFieldValue(
              ctrl.patientPrevCareOverridesBackup,
              'PreventiveServiceTypeId',
              exam.PreventiveServiceTypeId
            );
            if (backup) {
              backup.DataTag = exam.DataTag;
              backup.PatientFrequency = exam.PatientFrequency;
              backup.IsPatientTrumpService = exam.IsPatientTrumpService;
            }
          });
        }
        ctrl.refreshBackup = true;
      }
    };

    // getting patient preventive care frequency overrides
    ctrl.getPatientPrevCareOverrides = function () {
      patientPreventiveCareFactory
        .GetAllOverrides(ctrl.patientId, true)
        .then(function (res) {
          ctrl.processOverridesResponse(res, true);
          $scope.gridDataSourceLoading = false;
        });
    };

    // update patient preventive care frequency overrides
    ctrl.updatePatientPrevCareOverrides = function () {
      $scope.saving = true;
      // only sending objects that have changed
      var updatedOverrides = [];
      angular.forEach($scope.patientPrevCareOverrides, function (exam) {
        var originalStateOfOverride = listHelper.findItemByFieldValue(
          ctrl.patientPrevCareOverridesBackup,
          'PreventiveServiceTypeId',
          exam.PreventiveServiceTypeId
        );
        if (
          originalStateOfOverride &&
          !angular.equals(originalStateOfOverride, exam)
        ) {
          if (isNaN(exam.PatientFrequency)) {
            exam.PatientFrequency = null;
          }
          updatedOverrides.push(exam);
        }
      });
      if (updatedOverrides.length > 0) {
        patientPreventiveCareFactory
          .UpdateOverrides(ctrl.patientId, updatedOverrides)
          .then(function (res) {
            ctrl.processOverridesResponse(res, false);
            // need to fetch services due again to make sure changes are reflected in the bars/chart
            ctrl.getServicesDue();
            $scope.saving = false;
            $scope.cancel();
          });
      }
    };

    // if they choose to lose changes, reset
    ctrl.resetGrid = function () {
      ctrl.gridDataSourceHasLoaded = false;
      $scope.valid = false;
      $scope.gridDataSource = new kendo.data.DataSource({
        data: angular.copy(ctrl.patientPrevCareOverridesBackup),
      });
    };

    // warning modal if applicable, etc.
    $scope.cancel = function () {
      if ($scope.hasChanges()) {
        modalFactory.WarningModal().then(function (result) {
          if (result === true) {
            $scope.editing = false;
            ctrl.resetGrid();
          } else {
            $scope.editing = true;
            ctrl.preservingChanges = true;
          }
        });
      } else {
        $scope.editing = false;
        ctrl.resetGrid();
      }
    };

    //#endregion

    //#region view

    // save button handler
    $scope.save = function () {
      ctrl.updatePatientPrevCareOverrides();
    };

    // used by the x button in the input to reset value to practice default
    $scope.resetToPracticeDefault = function (exam) {
      exam.PatientFrequency = exam.PracticeFrequency;
      exam.IsOverride = false;
    };

    // used by the view to enable/disable save button
    $scope.hasChanges = function () {
      var foundChange = false;
      angular.forEach($scope.patientPrevCareOverrides, function (exam) {
        var item = listHelper.findItemByFieldValue(
          ctrl.patientPrevCareOverridesBackup,
          'PreventiveServiceTypeId',
          exam.PreventiveServiceTypeId
        );
        if (item && foundChange === false) {
          if (
            item.PatientFrequency !== exam.PatientFrequency ||
            (isNaN(item.PatientFrequency) && isNaN(exam.PatientFrequency))
          ) {
            foundChange = true;
          } else if (
            item.IsPatientTrumpService !== exam.IsPatientTrumpService
          ) {
            foundChange = true;
          }
        }
      });
      $scope.$emit(
        'personal-info-changed',
        $scope.dataHasChanged === false ? $scope.dataHasChanged : foundChange
      );
      // signal panel directive that something has changed
      $scope.valid = foundChange;
      return foundChange;
    };

    // listening for broadcast from parent for route change discard message logic
    $scope.$on('data-has-changed-updated', function (event, dataHasChanged) {
      $scope.dataHasChanged = dataHasChanged;
      if ($scope.dataHasChanged === false) {
        ctrl.resetGrid();
      }
    });

    //#endregion

    //#region watches

    // making the API call needed for showing rotation grid, checking for changes, etc.
    $scope.$watch('editing', function (nv) {
      if (nv === false) {
        // indicates panel save or cancel complete, set dataHasChanged to false
        $scope.$emit('personal-info-changed', false);
      }
      if (ctrl.preservingChanges) {
        ctrl.preservingChanges = false;
      } else if (nv === true) {
        ctrl.gridDataSourceHasLoaded = false;
        ctrl.getPatientPrevCareOverrides();
      }
    });

    // used for the appointments tab implementation, it uses the profileSection directive rather than the panel directive
    $scope.$on('soar:edit-rotation-clicked', function (event, patientId) {
      // only toggle the appropriate one
      if (angular.equals(patientId, ctrl.patientId)) {
        $scope.editing = !$scope.editing;
      }
    });

    // source for grid populated by patientPrevCareOverrides
    $scope.patientPrevCareOverridesSource = [];

    // once the grid data list is populated, make our scope object
    $scope.$watch(
      'gridDataSource',
      function (nv) {
        if (
          nv &&
          nv._data &&
          nv._data.length > 0 &&
          ctrl.gridDataSourceHasLoaded === false
        ) {
          $scope.patientPrevCareOverridesSource = nv._data;
          ctrl.reLoadPatientPrevCareOverrides();
          ctrl.gridDataSourceHasLoaded = true;
        }
      },
      true
    );

    // listening of for changes to patientPrevCareOverrides
    $scope.$watch(
      'patientPrevCareOverridesSource',
      function (nv) {
        ctrl.reLoadPatientPrevCareOverrides();
        if (nv && nv.length > 0 && ctrl.refreshBackup === true) {
          ctrl.patientPrevCareOverridesBackup = angular.copy(nv);
          ctrl.refreshBackup = false;
        }
        $scope.hasErrors = false;
        angular.forEach(nv, function (exam) {
          exam.$$HasErrors = exam.PatientFrequency > 120 ? true : false;
          if (exam.$$HasErrors === true && $scope.hasErrors === false) {
            $scope.hasErrors = true;
          }
          exam.PatientFrequency =
            exam.PatientFrequency !== null && !isNaN(exam.PatientFrequency)
              ? parseInt(exam.PatientFrequency)
              : null;
          exam.IsOverride =
            exam.PatientFrequency !== exam.PracticeFrequency &&
            exam.PatientFrequency !== null
              ? true
              : false;
        });
        $scope.hasChanges();
      },
      true
    );

    //#endregion

    //#region grid

    // column definitions and templates
    $scope.gridColumns = [
      {
        field: 'PreventiveServiceTypeDescription',
        title: localize.getLocalizedString('Type of Service'),
      },
      {
        field: localize.getLocalizedString('Frequency'),
        template: kendo.template(
          '<div class="prevCarePanel__editFrequency">' +
            '<input class="prevCarePanel__input" title="" maxlength="3" ng-model="dataItem.PatientFrequency" numeric-only />' +
            '<a class="prevCarePanel__reset fa fa-times" title="" ng-if="dataItem.IsOverride" ng-click="resetToPracticeDefault(dataItem)"></a>' +
            '</div> months' +
            '<div class="error" ng-if="dataItem.$$HasErrors">{{ \'Maximum 120\' | i18n }}</div>'
        ),
      },
      {
        title: localize.getLocalizedString('Sets Next Appt'),
        template: kendo.template(
          '<input type="radio" ng-checked="dataItem.IsPatientTrumpService" ng-show="dataItem.IsAllowedToBeTrumpService" ng-click="setPatientTrumpService(dataItem)">'
        ),
      },
    ];

    //#endregion

    // radio button handler
    $scope.setPatientTrumpService = function (item) {
      angular.forEach(
        $scope.patientPrevCareOverridesSource,
        function (override) {
          if (
            override.PreventiveServiceTypeId !== item.PreventiveServiceTypeId
          ) {
            override.IsPatientTrumpService = false;
          } else {
            item.IsPatientTrumpService = !item.IsPatientTrumpService;
          }
        }
      );
    };

    $scope.createNewAppointment = function () {
      var loggedInLocation = JSON.parse(sessionStorage.getItem('userLocation'));

      var appt = {
        AppointmentId: null,
        AppointmentTypeId: null,
        Classification: 2,
        PersonId: ctrl.patientId,
        ProposedDuration: 15,
        LocationId: loggedInLocation.id,
      };

      if ($scope.useV2Schedule) {
        schedulingMfeNavigator.navigateToAppointmentModal({
          patientId: appt.PersonId,
          locationId: appt.LocationId
        });
      }
      else {
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
      }
    };

    //#region save

    $scope.saveFunction = function () {
      ctrl.updatePatientPrevCareOverrides();
    };

    //#endregion

    //#region

    // keep original overrides in sync with grid datasource
    // this is necessary for panel cancel and save functions to work properly and detect changes
    ctrl.reLoadPatientPrevCareOverrides = function () {
      angular.forEach(
        $scope.patientPrevCareOverridesSource,
        function (override) {
          var item = listHelper.findItemByFieldValue(
            $scope.patientPrevCareOverrides,
            'PreventiveServiceTypeId',
            override.PreventiveServiceTypeId
          );
          if (item) {
            item.PatientFrequency = override.PatientFrequency;
            item.IsPatientTrumpService = override.IsPatientTrumpService;
          }
        }
      );
    };

    //#endregion
  },
]);
