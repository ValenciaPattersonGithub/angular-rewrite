(function () {
  'use strict';

  angular
    .module('Soar.Patient')
    .controller(
      'ClinicalTimelineLandingController',
      ClinicalTimelineLandingController
    );

  ClinicalTimelineLandingController.$inject = [
    '$scope',
    '$rootScope',
    '$timeout',
    'AmfaKeys',
    'ScheduleServices',
    'TreatmentPlansFactory',
    '$filter',
    '$q',
    'patSecurityService',
    'localize',
    'toastrFactory',
    'PatientNotesFactory',
    'UsersFactory',
    'ListHelper',
    'PatientServices',
    '$routeParams',
    'DocumentGroupsService',
    'PatientDocumentsFactory',
    'MedicalHistoryFactory',
    'TimeZoneFactory',
    'PatientRxFactory',
    'PatientImagingExamFactory',
    'ToothSelectionService',
    'ClinicalTimelineBusinessService',
    'AmfaKeys',
    'StaticData',
    'OdontogramUtilities',
    'PatientPerioExamFactory',
    'PatientAppointmentsFactory',
    'referenceDataService',
    'PatientLogic',
    'ImagingMasterService',
    'ImagingProviders',
    'ExternalImagingWorkerFactory',
    'FileUploadFactory',
    'userSettingsDataService',
    'ConditionsService',
    'FeatureFlagService',
    'FuseFlag',
  ];

  function ClinicalTimelineLandingController(
    $scope,
    $rootScope,
    $timeout,
    AmfaKeys,
    scheduleServices,
    treatmentPlansFactory,
    $filter,
    $q,
    patSecurityService,
    localize,
    toastrFactory,
    patientNotesFactory,
    usersFactory,
    listHelper,
    patientServices,
    $routeParams,
    documentGroupsService,
    patientDocumentsFactory,
    medicalHistoryFactory,
    timeZoneFactory,
    patientRxFactory,
    patientImagingExamFactory,
    toothSelectionService,
    clinicalTimelineBusinessService,
    amfaKeys,
    staticData,
    odontogramUtilities,
    patientPerioExamFactory,
    patientAppointmentsFactory,
    referenceDataService,
    patientLogic,
    imagingMasterService,
    imagingProviders,
    externalImagingWorkerFactory,
    fileUploadFactory,
    userSettingsDataService,
    conditionsService,
    featureFlagService,
    fuseFlag
  ) {
    BaseCtrl.call(this, $scope, 'ClinicalTimelineLandingController');
    //#region Properties and Variables
    var ctrl = this;

    $scope.showNewPatientHeader = userSettingsDataService.isNewNavigationEnabled();
    // Filter button collection

    $scope.filterButtons = clinicalTimelineBusinessService.getFilterButtons();

    $scope.selectAllLabel = angular.isDefined($scope.selectAllLabel)
      ? $scope.selectAllLabel
      : 'Select/Deselect All';
    $scope.allowBlank = angular.isDefined($scope.allowBlank)
      ? $scope.allowBlank
      : false;

    $scope.selectedFilters = [];
    $scope.openFile = function () {
      if ($scope.appliedFilters.length === 1 && $scope.showUpload) {
        patientDocumentsFactory.selectedFilter =
          $scope.appliedFilters[0].Description;
      } else {
        patientDocumentsFactory.selectedFilter = '';
      }
      $scope.openDocUploader();
    };

    // Get medical history access
    //#region access
    $scope.canView = medicalHistoryFactory.access().View;
    //#endregion

    // Main collection that holds all items to be shown in "All" tab
    $scope.timelineRecords = [];
    $scope.filteredTimelineRecords = [];
    $scope.appliedFilters = [];

    // these variables together determine if the timeline will load
    ctrl.filterTimeline = false;
    ctrl.everythingIsLoaded = false;
    $scope.userSelectedAFilter = false;
    $scope.firstFilterPass = true;
    // This variable holds collection of patient services and patient conditions separately
    ctrl.patientServicesAndConditions = [];

    // This variable holds collection of patient treatment plans separately
    ctrl.treatmentPlans = [];

    // This variable holds collection of parents documents separately

    ctrl.parentDocuments = [];
    // supporting practice conditions collection for retrieving data for patient conditions
    ctrl.conditions = [];

    // supporting clinical notes collection
    ctrl.clinicalNotes = [];

    //
    ctrl.imageExams = [];
    ctrl.externalImageExams = [];

    // supporting appointments collection
    ctrl.appointments = [];
    ctrl.appointmentData = [];
    ctrl.appointmentTypes = [];
    ctrl.providers = [];

    //supporting perio stats collection
    ctrl.perioStatsMouth = [];
    ctrl.perioStatsMouthData = [];

    // Array to hold medical hx forms
    ctrl.medicalHistoryForms = [];

    // today's appts properties
    $scope.todaysAppts = [];
    $scope.showTodaysAppts = true;

    ctrl.clinicalOverviewDeferred = $q.defer();

    // object to hold initialized flags for time line items
    ctrl.initialized = {
      ServiceAndCondition: false,
      TreatmentPlan: false,
      ClinicalNote: false,
      Appointment: false,
      PerioStatsMouth: false,
      PerioStatsTooth: false,
      Documents: false,
      MedicalHistoryForms: false,
      ImageExam: false,
      ImageExamExternal: false,
      PatientRx: false,
    };

    // object to hold loading flags for time line items
    $scope.loading = {
      ServiceAndCondition: true,
      TreatmentPlan: true,
      ClinicalNote: true,
      Appointment: true,
      PerioStatsMouth: true,
      PerioStatsTooth: false,
      Documents: false,
      MedicalHistoryForms: false,
      ImageExam: true,
      ImageExamExternal: true,
      PatientRx: true,
    };
    //#endregion

    //#region Authorization
    // Check view access for time-line items
    function authAccess() {
      // Check if logged in user has view access to patient services
      $scope.hasClinicalServiceViewAccess = patSecurityService.IsAuthorizedByAbbreviation(
        AmfaKeys.SoarClinCpsvcView
      );
      // Check if logged in user has view access to patient conditions
      $scope.hasClinicalConditionViewAccess = patSecurityService.IsAuthorizedByAbbreviation(
        AmfaKeys.SoarClinCcondView
      );
      // Check if logged in user has view access to patient treatment plans
      $scope.hasClinicalTxPlanViewAccess = patSecurityService.IsAuthorizedByAbbreviation(
        AmfaKeys.SoarClinCplanView
      );
      // Check if logged in user has view access to patient notes
      $scope.hasClinicalNoteViewAccess = patSecurityService.IsAuthorizedByAbbreviation(
        AmfaKeys.SoarClinCnotesView
      );
      // Check if logged in user has add rx access to patient notes
      $scope.hasClinicalNoteAddRxAccess = patSecurityService.IsAuthorizedByAbbreviation(
        AmfaKeys.SoarClinCnotesAddrx
      );
      // Check if logged in user has view access to patient appointments
      $scope.hasClinicalAppointmentViewAccess = patSecurityService.IsAuthorizedByAbbreviation(
        AmfaKeys.SoarSchSptaptView
      );
      // Check if logged in user has view access to perio stats
      $scope.hasClinicalPerioStatsViewAccess = patSecurityService.IsAuthorizedByAbbreviation(
        AmfaKeys.SoarClinCperioView
      );
      // Check if logged in user has view access to documents
      $scope.hasClinicalDocumentsViewAccess = patSecurityService.IsAuthorizedByAbbreviation(
        AmfaKeys.SoarDocDocimpView
      );
      // Check if logged in user has view access to imaging
      $scope.hasClinicalImagingViewAccess = patSecurityService.IsAuthorizedByAbbreviation(
        AmfaKeys.SoarClinCimgsView
      );
      // Check if logged in user has view access to rx
      $scope.hasRxViewAccess = patSecurityService.IsAuthorizedByAbbreviation(
        AmfaKeys.SoarClinClinrxView
      );
    }

    authAccess();

    //var y = 0
    // set filteredTimelineRecords and sort it according to date
    ctrl.updateAndSortFilteredTimelineRecords = function (
      filteredTimeLineCollection
    ) {
      //console.log('Updating List');

      //console.log('sort method on filter controller called: ' + y++ + ' times');
      var list = _.cloneDeep(filteredTimeLineCollection);

      //region ... handling today's appointments section
      var newTodaysAppointments = [];
      var newArray = [];
      // loop through the list and remove today's appointments from it and add them to a different list to display in a today section
      list = _.filter(list, function (item) {
        // if type is appointment
        if (item.recordType === 'Appointment') {
          if (
            new Date(item.record.StartTime).toDateString() ===
              new Date().toDateString() ||
            item.record.Status === 4
          ) {
            newTodaysAppointments.push(item);
            return false;
          } else {
            return true;
          }
          // if type is MedicalHx
        } else if (item.recordType === 'MedicalHx') {
          var exists = false;
          angular.forEach(newArray, function (val2, key) {
            if (
              angular.equals(
                item.record.FormAnswersId,
                val2.record.FormAnswersId
              )
            ) {
              exists = true;
            }
          });
          if (exists == false) {
            newArray.push(item);
          }
          return false;
        } else {
          return true;
        }
      });
      //bind unique records to existing list items.
      var i = 1;
      angular.forEach(newArray, function (value, key) {
        var arrCount = newArray.length;
        if (i === arrCount) {
          value.record.isDisabled = false;
          list.push(value);
        } else {
          value.record.isDisabled = true;
          list.push(value);
        }
        i = i + 1;
      });
      $scope.todaysAppts = newTodaysAppointments;

      // hide todaysAppts if only showing deleted records
      $scope.showTodaysAppts = $scope.showActive;

      //endregion

      list = _.filter(list, function (record) {
        if ($scope.showActive === false) {
          return true; // now we want to show all the records
        } else {
          return record.record.IsDeleted !== true;
        }
      });

      // order filtered timeline records by date in descending order
      list = $filter('orderBy')(list, 'date', true);

      // set what records are loaded.
      _.forEach(list, function (record, index) {
        if (index < 13) {
          return (record.load = true);
        }
        return false;
      });

      // group the records
      list = _.groupBy(list, 'groupDate');

      $scope.filteredTimelineRecords = list;
    };

    $scope.isFilteredTimelineRecordsEmpty = function () {
      // This was not processing right on the client so I made it a function.
      return _.isEmpty($scope.filteredTimelineRecords);
    };

    $scope.isTodaysApptsEmpty = function () {
      // This was not processing right on the client so I made it a function.
      return (
        _.isEmpty($scope.todaysAppts) ||
        (!$scope.showTodaysAppts && !_.isEmpty($scope.todaysAppts))
      );
    };

    // Function to filter timeline records based on filters (conditions, services, treatment plans & appointments) and teeth selected from odontogram
    ctrl.filterRecords = function () {
      //Only filter if:
      //Timeline is the active tab
      //AND Everything has loaded
      //OR Important items loaded AND No other timeline tile filters changed AND no tooth filters AND first pass

      if (
        ctrl.filterTimeline === true &&
        (ctrl.everythingIsLoaded === true ||
          ($scope.loadingComplete === true &&
            $scope.userSelectedAFilter === false &&
            !ctrl.toothFilterApplied &&
            $scope.firstFilterPass === true))
      ) {
        $scope.firstFilterPass = false;

        var list = _.cloneDeep($scope.timelineRecords);

        var isToothAssociated = false;
        // If filters are applied, process records, otherwise display all timeline records
        if (ctrl.buttonFiltersApplied) {
          // filter all records of one type
          ctrl.filteredTimelineRecordsCollection = list.filter(function (
            timelineRecord
          ) {
            // special handling for documents in the 'Medical History' doc group, these need to show up when the Med Hx filter is active
            var timelineRecordType =
              timelineRecord.recordType === 'Medical History'
                ? 'MedicalHx'
                : timelineRecord.recordType;
            // special handling for images which can have a record type of 'Images' or 'ExternalImages'
            timelineRecordType =
              timelineRecordType === 'ExternalImageExam'
                ? 'ImageExam'
                : timelineRecordType;
            timelineRecordType =
              timelineRecordType === 'DigitalConsent'
                ? 'Consent'
                : timelineRecordType;

            var item = _.find($scope.appliedFilters, {
              RecordType: timelineRecordType,
            });
            isToothAssociated = clinicalTimelineBusinessService.checkToothAssociated(
              ctrl.selectedTeeth,
              timelineRecord
            );
            return item && item.Active && isToothAssociated;
          });
          var perioFilterButton = _.find($scope.appliedFilters, {
            RecordType: 'PerioStatsMouth',
          });

          // If tooth filter is also applied along with button filter, get latest perio stats tooth exam and append it to filteredTimelineRecords
          if (
            perioFilterButton &&
            perioFilterButton.Active &&
            ctrl.toothFilterApplied &&
            ctrl.hasClinicalPerioStatsViewAccess
          ) {
            ctrl.getPerioStatsToothExamDetailsByPatientId(
              ctrl.filteredTimelineRecordsCollection
            );
          } else {
            ctrl.updateAndSortFilteredTimelineRecords(
              ctrl.filteredTimelineRecordsCollection
            );
          }
        } else if (ctrl.toothFilterApplied) {
          ctrl.filteredTimelineRecordsCollection = _.filter(
            list,
            function (timelineRecord) {
              isToothAssociated = clinicalTimelineBusinessService.checkToothAssociated(
                ctrl.selectedTeeth,
                timelineRecord
              );
              return isToothAssociated;
            }
          );
          if (
            ctrl.hasClinicalPerioStatsViewAccess &&
            ctrl.reloadPerio === true
          ) {
            //get latest perio stats tooth exam and append it to filteredTimelineRecords
            ctrl.getPerioStatsToothExamDetailsByPatientId(
              ctrl.filteredTimelineRecordsCollection
            );
          } else {
            ctrl.updateAndSortFilteredTimelineRecords(
              ctrl.filteredTimelineRecordsCollection
            );
          }
        } else {
          ctrl.filteredTimelineRecordsCollection = $scope.timelineRecords;
          ctrl.updateAndSortFilteredTimelineRecords(
            ctrl.filteredTimelineRecordsCollection
          );
        }
      } else {
        return;
      }
    };

    ctrl.shouldIFilterRecords = function () {
      if ($scope.loading) {
        if (
          $scope.loading.ServiceAndCondition === false &&
          $scope.loading.MedicalHistory === false &&
          $scope.loading.TreatmentPlan === false &&
          $scope.loading.Appointment === false &&
          $scope.loading.ClinicalNote === false &&
          $scope.loading.Documents === false &&
          $scope.loading.PerioStatsMouth === false &&
          $scope.loading.ImageExam === false &&
          $scope.loading.ImageExamExternal === false &&
          $scope.loading.PatientRx === false
        ) {
          ctrl.everythingIsLoaded = true;
        }

        ctrl.filterRecords();
      }
    };

    ctrl.updateSelected = function () {
      // if the current selection would leave the dropdown empty of locations, reset to the default selection.
      if (
        $scope.type === 'Locations' &&
        _.filter(ctrl.selected, { Selected: true }).length === 0 &&
        !_.isNil($scope.initialSelection)
      ) {
        _.forEach($scope.initialSelection, function (initialItem) {
          let item = listHelper.findItemByFieldValue(
            $scope.filterButtons,
            $scope.idField,
            initialItem[$scope.idField]
          );

          if (item) {
            item.Selected = true;
            item.Active = true;
          }
        });
        ctrl.selected = _.filter($scope.filterButtons, { Selected: true });
      }
      $scope.appliedFilters = angular.copy(ctrl.selected);

      var showUpload = [];
      showUpload = _.filter($scope.appliedFilters, function (item) {
        return (
          item.RecordType == 'Other Clinical' ||
          item.RecordType == 'HIPAA' ||
          item.RecordType == 'Lab' ||
          item.RecordType == 'Specialist' ||
          item.RecordType == 'Consent' ||
          item.RecordType == 'Account' ||
          item.RecordType == 'Insurance' ||
          item.RecordType == 'EOB'
        );
      });
      $scope.showUpload = showUpload.length != 0;
      ctrl.buttonFiltersApplied = true;
      ctrl.shouldIFilterRecords();
    };

    ctrl.populateSelected = function () {
      ctrl.selected = [];

      for (var i = 0; i < $scope.filterButtons.length; i++) {
        if ($scope.filterButtons[i].Selected) {
          $scope.filterButtons[i].Active = true;
          ctrl.selected.push($scope.filterButtons[i]);
        } else {
          $scope.filterButtons[i].Active = false;
        }
      }

      ctrl.updateSelected();
    };

    $scope.clickItem = function (item) {
      item.Selected = !item.Selected;

      ctrl.populateSelected();
      $scope.selectedCount = $scope.appliedFilters.length;
    };

    $scope.toggleAll = function () {
      var selecting = $scope.selectedCount != $scope.filterButtons.length;

      for (var i = 0; i < $scope.filterButtons.length; i++) {
        $scope.filterButtons[i].Selected = selecting;
        $scope.filterButtons[i].Active = selecting;
      }

      ctrl.selected = angular.copy($scope.filterButtons);
      ctrl.updateSelected();
      $scope.selectedCount = selecting ? $scope.filterButtons.length : 0;
    };

    $scope.selectedAll = function (key) {
      var items = listHelper.findItemsByFieldValue(
        $scope.filterButtons,
        'Status',
        key
      );
      var selectedCount = 0;
      angular.forEach(items, function (item) {
        if (item.Selected) {
          selectedCount++;
        }
      });
      return selectedCount == items.length;
    };

    $scope.toggleSelected = function (status) {
      var items = listHelper.findItemsByFieldValue(
        $scope.filterButtons,
        'Status',
        status
      );
      var selectedCount = 0;
      angular.forEach(items, function (item) {
        if (item.Selected) {
          selectedCount++;
        }
      });

      var selecting = selectedCount != items.length;

      for (var i = 0; i < items.length; i++) {
        items[i].Selected = selecting;
        items[i].Active = selecting;
      }

      ctrl.selected = angular.copy($scope.filterButtons);
      //ctrl.updateSelected();

      if (selecting) {
        angular.element('#icon' + status).addClass('fa-check-square');
      } else {
        angular.element('#icon' + status).removeClass('fa-check-square');
      }
    };

    ctrl.initializeSelection = function () {
      if ($scope.initialSelection && $scope.initialSelection.length > 0) {
        var selectedCount = 0;

        // need to come back and look at the performance of this ... it is taking over 100 ms at times.
        angular.forEach($scope.initialSelection, function (initialItem) {
          var item = listHelper.findItemByFieldValue(
            $scope.filterButtons,
            $scope.idField,
            initialItem[$scope.idField]
          );

          if (item) {
            item.Selected = true;
            item.Active = true;
            selectedCount++;
          }
        });

        _.forEach($scope.filterButtons, function (item) {
          if (item.Selected != true) {
            item.Selected = false;
            item.Active = false;
          }
        });

        $scope.selectedCount = selectedCount;
        ctrl.populateSelected();
      }
    };

    $scope.open = false;
    ctrl.selected = [];

    $scope.selectedCount = 0;

    $scope.toggleMultiSelect = function () {
      if ($scope.open === true) {
        $scope.open = false;
      } else {
        $scope.open = true;
      }
    };

    $scope.filterHoverOff = function () {
      if ($scope.open === true) {
        $scope.open = false;
      }
    };

    ctrl.initializeSelection();

    // breaking the reset out for treatment plans due to the nested TreatmentPlanId
    ctrl.resetTxPlanTimeline = function (data, clonedList, type) {
      // only do find on treatment plan items
      _.forEach(data, function (item) {
        if (type === 'TreatmentPlan') {
          var index = _.findIndex(clonedList, function (value) {
            return (
              value.recordType === 'TreatmentPlan' &&
              value.record.TreatmentPlanHeader &&
              value.record.TreatmentPlanHeader.TreatmentPlanId ===
                item.record.TreatmentPlanHeader.TreatmentPlanId
            );
          });
          if (index !== -1) {
            clonedList[index] = item;
          } else {
            clonedList.push(item);
          }
        }
      });
      // remove tx plan items that are no longer in the list(deletions)
      _.forEachRight(clonedList, function (item) {
        if (type === 'TreatmentPlan') {
          var index = _.findIndex(data, function (value) {
            return (
              item.recordType === 'TreatmentPlan' &&
              value.record.TreatmentPlanHeader &&
              value.record.TreatmentPlanHeader.TreatmentPlanId ===
                item.record.TreatmentPlanHeader.TreatmentPlanId
            );
          });
          if (index === -1) {
            //remove from list
            var indx = _.findIndex(clonedList, function (value) {
              return (
                item.recordType === 'TreatmentPlan' &&
                value.record.TreatmentPlanHeader &&
                value.record.TreatmentPlanHeader.TreatmentPlanId ===
                  item.record.TreatmentPlanHeader.TreatmentPlanId
              );
            });
            if (indx !== -1) {
              clonedList.splice(indx, 1);
            }
          }
        }
      });
      return clonedList;
    };

    ctrl.resetItemsInTimeLine = function (data, clonedList, type, propName) {
      _.forEach(data, function (item) {
        // added null for items that have a ton of different types ... aka Documents
        clonedList = ctrl.resetSingleItemInTimeline(
          item,
          clonedList,
          type,
          propName
        );
      });
      return clonedList;
    };

    ctrl.resetSingleItemInTimeline = function (
      item,
      clonedList,
      type,
      propName
    ) {
      // added null for items that have a ton of different types ... aka Documents
      if (type !== null && item.recordType === type) {
        var index = _.findIndex(clonedList, function (value) {
          if (
            value.record[propName] &&
            !_.isEmpty(value.record[propName].toString())
          ) {
            return (
              value.record[propName] === item.record[propName] &&
              value.recordType === item.recordType
            );
          }
        });

        if (index !== -1) {
          clonedList[index] = item;
        } else {
          clonedList.push(item);
        }
      }
      return clonedList;
    };

    //#endregion

    //#region Patient Service and Condition functions

    // Initialize prerequisites for displaying patient services and patient conditions
    ctrl.loadServicesAndConditions = function () {
      if (
        !ctrl.initialized.ServiceAndCondition ||
        !$scope.loading.ServiceAndCondition
      ) {
        $scope.loading.ServiceAndCondition = true;

        featureFlagService.getOnce$(fuseFlag.UsePracticeApiForConditions).subscribe(value => {
          var dependentServices = [ctrl.getServiceCodes(), ctrl.getConditions(value)];

          // After fetching practice service codes and practice conditions, process patient services and patient conditions
          $q.all(dependentServices).then(
            ctrl.fetchServiceAndConditionRecordsOnSuccess,
            ctrl.fetchServiceAndConditionRecordsOnError
          );
        });
      } else {
        ctrl.executeServiceLoadingFallback();
      }
    };

    // Initialize patient services and conditions
    ctrl.initServicesAndConditions = function () {
      ctrl.loadServicesAndConditions();
    };

    // Create list of patient services and patient conditions
    ctrl.fetchServiceAndConditionRecordsOnSuccess = function () {
      var deferred = $q.defer();
      // Clear list before updating records
      ctrl.patientServicesAndConditions = [];

      patientServices.ServiceTransactions.getServiceTransactionsForTimeline(
        { personId: $scope.personId },
        function (res) {
          _.forEach(res.Value, function (serviceTransaction) {
            if (
              serviceTransaction.ServiceCodeId &&
              $scope.hasClinicalServiceViewAccess
            ) {
              ctrl.addServiceCodeToItem(serviceTransaction);
            }
          });

          // Update data from practice service codes and practice conditions
          _.forEach($scope.chartLedgerServices, function (chartLedgerService) {
            if (
              chartLedgerService.ConditionId &&
              $scope.hasClinicalConditionViewAccess
            ) {
              ctrl.addConditionToItem(chartLedgerService);
            }
          });
          // If service transaction and patient condition are initialized for the first time, add the list to time line records
          // Otherwise, refill the time line records
          if (ctrl.initialized.ServiceAndCondition) {
            var clonedList = _.cloneDeep($scope.timelineRecords);

            // only look at items that have this type - service and condition
            clonedList = ctrl.resetItemsInTimeLine(
              ctrl.patientServicesAndConditions,
              clonedList,
              'ServiceTransaction',
              'ServiceTransactionId'
            );

            clonedList = ctrl.resetItemsInTimeLine(
              ctrl.patientServicesAndConditions,
              clonedList,
              'Condition',
              'RecordId'
            );

            $scope.timelineRecords = clonedList;
          } else {
            if (!_.isNil($scope.timelineRecords)) {
              $scope.timelineRecords = $scope.timelineRecords.concat(
                ctrl.patientServicesAndConditions
              );
            }
            ctrl.initialized.ServiceAndCondition = true;
          }

          ctrl.executeServiceLoadingFallback();
          deferred.resolve();
        }
      );

      return deferred.promise;
    };

    // Error callback function for updating service and condition records in time line collection
    ctrl.fetchServiceAndConditionRecordsOnError = function () {
      // Clear list before updating records
      ctrl.patientServicesAndConditions = [];

      ctrl.initialized.ServiceAndCondition = true;
      ctrl.executeServiceLoadingFallback();
    };

    ctrl.executeServiceLoadingFallback = function () {
      if (!_.isNil($scope.loading)) {
        $scope.loading.ServiceAndCondition = false;
      }
      ctrl.shouldIFilterRecords();
    };

    // Update service code details in a time line record
    ctrl.addServiceCodeToItem = function (chartLedgerService) {
      chartLedgerService.CreationDate = chartLedgerService.DateEntered;
      chartLedgerService.recordType = 'ServiceTransaction';

      var serviceCode = _.find(ctrl.serviceCodes, {
        ServiceCodeId: chartLedgerService.ServiceCodeId,
      });
      if (serviceCode) {
        var listItem = ctrl.createTimelineItem(
          chartLedgerService.CreationDate,
          chartLedgerService,
          chartLedgerService.RecordType
        );

        listItem.recordType = 'ServiceTransaction';
        listItem.record.DisplayAs = serviceCode.DisplayAs;
        listItem.record.AffectedAreaId = serviceCode.AffectedAreaId;
        listItem.record.CdtCodeName = serviceCode.Code;
        listItem.record.PatientId = $routeParams.patientId;

        ctrl.patientServicesAndConditions.push(listItem);
      }
    };

    // Update condition details in a time line record
    ctrl.addConditionToItem = function (chartLedgerService) {
      //TODO: change this to be a find or other filter at some point.
      var practiceCondition = _.find(ctrl.conditions, {
        ConditionId: chartLedgerService.ConditionId,
      });
      if (practiceCondition) {
        var listItem = ctrl.createTimelineItem(
          chartLedgerService.CreationDate,
          chartLedgerService,
          chartLedgerService.RecordType
        );

        listItem.record.Description = practiceCondition.Description;
        listItem.record.AffectedAreaId = practiceCondition.AffectedAreaId;

        ctrl.patientServicesAndConditions.push(listItem);
      }
    };

    /**
     * This functions retrieves service codes which will be used by all the directives associated with this controller.
     *
     * @returns {angular.IPromise}
     */
    ctrl.getServiceCodes = function () {
      if ($scope.hasClinicalServiceViewAccess) {
        return referenceDataService
          .getData(referenceDataService.entityNames.serviceCodes)
          .then(function (serviceCodes) {
            ctrl.serviceCodes = serviceCodes;
            return ctrl.serviceCodes;
          });
      }
      return $q.resolve();
    };

    /**
     * Get conditions.
     *
     * @returns {angular.IPromise}
     */
    ctrl.getConditions = function (usePracticesApi) {
      if (usePracticesApi) {
        return conditionsService.getAll()
          .then(conditions => ctrl.conditions = conditions);
      } else {
        return referenceDataService
          .getData(referenceDataService.entityNames.conditions)
          .then(function (conditions) {
            ctrl.conditions = conditions;
            return ctrl.conditions;
          });
      }
    };

    //#endregion

    //#region Watchers
    ctrl.reloadingChartLedger = false;
    $scope.$on(
      'soar:chart-services-retrieved',
      function (event, reloadingChartLedger) {
        ctrl.reloadingChartLedger = reloadingChartLedger;
      }
    );

    // Watch chartLedgerServices collection updated in a parent controller
    $scope.$watch(
      'chartLedgerServices',
      function (nv, ov) {
        if (nv && nv !== ov) {
          if (
            ctrl.initialized.ServiceAndCondition &&
            ((nv && nv.length !== ov.length && nv.length > 0) ||
              ctrl.reloadingChartLedger === true)
          ) {
            $scope.loading.ServiceAndCondition = true;
            ctrl.reloadingChartLedger = false;
            var clonedList = _.cloneDeep($scope.timelineRecords);
            _.forEach(nv, function (item) {
              var listItem = ctrl.createTimelineItem(
                item.CreationDate,
                item,
                item.RecordType
              );
              var index = null;
              if (!_.isEmpty(item.ConditionId)) {
                var practiceCondition = _.find(ctrl.conditions, {
                  ConditionId: item.ConditionId,
                });
                if (practiceCondition) {
                  listItem.recordType = 'Condition';

                  listItem.record.Description = practiceCondition.Description;
                  listItem.record.AffectedAreaId =
                    practiceCondition.AffectedAreaId;

                  index = _.findIndex(clonedList, function (value) {
                    return value.record.RecordId === listItem.record.RecordId;
                  });

                  if (index !== -1) {
                    clonedList[index] = listItem;
                  } else {
                    clonedList.push(listItem);
                  }
                }
              }

              if (!_.isEmpty(item.ServiceCodeId)) {
                var serviceCode = _.find(ctrl.serviceCodes, {
                  ServiceCodeId: item.ServiceCodeId,
                });
                if (serviceCode) {
                  listItem.recordType = 'ServiceTransaction';

                  listItem.record.DisplayAs = serviceCode.DisplayAs;
                  listItem.record.AffectedAreaId = serviceCode.AffectedAreaId;
                  listItem.record.CdtCodeName = serviceCode.Code;

                  // The Ledger stores things different then the record the timeline gets to start out with.
                  // So we have to assign the RecordId = ServiceTransactionId to ensure the timeline still works after the update.
                  listItem.record.ServiceTransactionId =
                    listItem.record.RecordId;
                  listItem.record.ServiceTransactionStatusId =
                    listItem.record.StatusId;

                  index = _.findIndex(clonedList, function (value) {
                    return (
                      value.record.ServiceTransactionId ===
                      listItem.record.ServiceTransactionId
                    );
                  });

                  if (index !== -1) {
                    clonedList[index] = listItem;
                  } else {
                    clonedList.push(listItem);
                  }
                }
              }
            });
            // remove records from timeline records if they are not in chartLedgerServices and are recordType ServiceTransaction or Condition
            clonedList = clonedList.filter(x => {
              return nv.some(n => {
                return (
                  n.RecordId === x.record.RecordId ||
                  (x.recordType !== 'ServiceTransaction' &&
                    x.recordType !== 'Condition')
                );
              });
            });

            $scope.timelineRecords = clonedList;

            ctrl.executeServiceLoadingFallback();
          }
        }
      },
      true
    );

    // hiding todays appts if filters are applied and none of them are appt
    $scope.$watch(
      'appliedFilters',
      function (nv, ov) {
        // replace with some check
        if (!_.isEmpty(nv) && !_.some(nv, { RecordType: 'Appointment' })) {
          $scope.showTodaysAppts = false;
        } else {
          $scope.showTodaysAppts = true;
        }
      },
      true
    );

    // Refresh patient services and patient conditions in time line "All" tab when event is broad-casted
    $scope.$on(
      'chart-ledger:patient-condition-deleted',
      function (event, record) {
        // refresh list when chart ledger service have zero records. This will handle the scenario when last chart-ledger record(patient condition) is deleted
        var clonedList = $scope.timelineRecords;

        var index = _.findIndex(clonedList, function (value) {
          return value.record.RecordId === record.RecordId;
        });

        if (index !== -1) {
          clonedList.splice(index, 1);
          $scope.timelineRecords = clonedList;

          ctrl.executeServiceLoadingFallback();
        }

        //var clonedList = $scope.timelineRecords;

        //var index = _.findIndex(clonedList, function (value) {
        //    return value.record.RecordId === record.RecordId;
        //});

        //if (index !== -1) {
        //    clonedList.splice(index, 1);
        //    $scope.timelineRecords = clonedList;

        //    ctrl.executeServiceLoadingFallback();
        //}
      }
    );

    // Refresh patient services, patient conditions and appointments in time line "All" tab when event is broad-casted
    $scope.$on(
      'chart-ledger:service-transaction-deleted',
      function (event, record) {
        // refresh list when chart ledger service have zero records. This will handle the scenario when last chart-ledger record(patient service) is deleted
        var clonedList = $scope.timelineRecords;

        record.ServiceTransactionId = record.RecordId;

        var index = _.findIndex(clonedList, function (value) {
          return (
            value.record.ServiceTransactionId === record.ServiceTransactionId
          );
        });

        if (index !== -1) {
          clonedList.splice(index, 1);
          $scope.timelineRecords = clonedList;
        }

        // reload appointments
        ctrl.loadAppointments();
        $scope.isAppointmentDisabled = false;

        ctrl.executeServiceLoadingFallback();
      }
    );

    // Refresh patient documents
    $scope.$on('soar:patient-documents-changed', function (event) {
      if (ctrl.initialized.Documents) {
        ctrl.loadDocuments();
      }
    });

    // for displaying loader
    ctrl.checkLoadingComplete = function () {
      if (
        $scope.loading.ServiceAndCondition === false &&
        $scope.loading.TreatmentPlan === false &&
        $scope.loading.ClinicalNote === false &&
        $scope.loading.Appointment === false
      ) {
        $scope.loadingComplete = true;
      }
    };

    $scope.$watch(
      'loading',
      function (nv) {
        ctrl.checkLoadingComplete();
      },
      true
    );

    // low-budget client-side paging, listening for scroll to the bottom of the timeline container, making five more visible every time
    $(document).ready(function () {
      $('.clnclTmLn__lst').bind('scroll', function (e) {
        var elem = $(e.currentTarget);

        //Previously waited for the user to scroll all the way to the bottom. Broken at certain resolutions after a Chrome update.
        //Guessing that the Chrome update did something with rounding as we end up 1px off of allowing more tiles to load.
        //Adding a 10px buffer, gets user close enough to bottom that loading more tiles makes sense.

        var bottomBuffer = 10;
        if (
          elem[0].scrollHeight - elem.scrollTop() - bottomBuffer <=
          elem.outerHeight()
        ) {
          var counter = 0;

          // get properties and flatten so I can iterate over them.
          var mappedColl = _.flatten(_.map($scope.filteredTimelineRecords));

          _.forEach(mappedColl, function (val) {
            if (counter < 5 && val.load === false) {
              val.load = true;
              counter++;
            }
          });

          $scope.$apply();
        }
      });
    });

    // only show the date group header if at least one tile of that date is visible
    $scope.isDateVisible = function (group, records) {
      var result = false;

      result = _.some(records, function (ftl) {
        return ftl.load === true;
      });

      return result;
    };

    // fail-safe to make sure that loader does go away no matter what
    $timeout(function () {
      // if it is already set do not set it again.
      if ($scope.loadingComplete !== true) {
        $scope.loadingComplete = true;
      }
    }, 5000);

    function updateExistingTreatmentPlans(nv) {
      $scope.loading.TreatmentPlan = true;

      ctrl.treatmentPlans = [];

      var doISortPlans = false; // we do not want to sort every time
      if (
        ($scope.existingTreatmentPlans === null && !_.isEmpty(nv)) ||
        $scope.existingTreatmentPlans !== null
      ) {
        doISortPlans = true;
      }
      // do not reload the list if nv is null.

      $scope.existingTreatmentPlans = nv;
      $scope.treatmentPlanHeaders = nv;

      if (doISortPlans === true) {
        ctrl.processTreatmentPlans();
      }
    }

    //#endregion

    //#region Clinical Notes

    // Process clinical notes to display in "All" timeline tab
    ctrl.processClinicalNotes = function (notes) {
      ctrl.clinicalNotes = [];
      // get recent notes with histories
      var recentNotes = ctrl.getRecentClinicalNotes(notes);

      _.forEach(recentNotes, function (note) {
        note.$$OriginalCreatedDate = _.cloneDeep(note.CreatedDate);
        _.forEach(note.histories, function (his) {
          if (moment(his.CreatedDate).isBefore(note.$$OriginalCreatedDate)) {
            note.$$OriginalCreatedDate = _.cloneDeep(his.CreatedDate);
          }
        });
        var listItem = ctrl.createTimelineItem(
          note.$$OriginalCreatedDate,
          note,
          'ClinicalNote'
        );

        // ensure the properties are set ... they were not being set previously
        listItem.record.$$providerLabel = patientNotesFactory.SetProviderLabel(
          note
        );
        listItem.record.$$DisplayNameAndDesignation = patientNotesFactory.getNameAndDesignation(
          note
        );

        ctrl.clinicalNotes.push(listItem);
      });

      // If clinical notes are initialized for the first time, add the list to time line records
      // Otherwise, refill the time line records
      if (ctrl.initialized.ClinicalNote) {
        var clonedList = _.cloneDeep($scope.timelineRecords);
        clonedList = ctrl.resetItemsInTimeLine(
          ctrl.clinicalNotes,
          clonedList,
          'ClinicalNote',
          'NoteId'
        );
        // remove records from timeline note records if they are not in the latest notes
        if (!_.isEmpty(notes)) {
          clonedList = clonedList.filter(x => {
            return notes.some(n => {
              return (
                n.NoteId === x.record.NoteId || x.recordType !== 'ClinicalNote'
              );
            });
          });
        }
        $scope.timelineRecords = clonedList;
      } else {
        if (!_.isNil($scope.timelineRecords)) {
          $scope.timelineRecords = $scope.timelineRecords.concat(
            ctrl.clinicalNotes
          );
        }
        ctrl.initialized.ClinicalNote = true;
      }
      ctrl.executeClinicalNotesLoadingFallback();
    };

    ctrl.executeClinicalNotesLoadingFallback = function () {
      if (!_.isEmpty($scope.loading)) {
        $scope.loading.ClinicalNote = false;
        ctrl.shouldIFilterRecords();
      }
    };

    // Function to get recent clinical notes with histories
    ctrl.getRecentClinicalNotes = function (allClinicalNotes) {
      var notes = [];
      // this code seeks to ensure that each only shows up in the resulting list once.
      // Note records and note updates are in the list but we need to remove duplicates.
      for (var i = 0; i < allClinicalNotes.length; i++) {
        var existingNote = notes.filter(function (note) {
          return note.NoteId === allClinicalNotes[i].NoteId;
        });
        if (existingNote.length === 0) {
          allClinicalNotes[i].histories = [];
          notes.push(allClinicalNotes[i]);
        } else {
          existingNote[0].histories.push(allClinicalNotes[i]);
        }
      }
      return notes;
    };

    // update local list when it changes
    $scope.updateClinicalNoteCollection = function (notes) {
      if ($scope.hasClinicalNoteViewAccess) {
        $scope.loading.ClinicalNote = true;
        ctrl.processClinicalNotes(notes);
      } else {
        ctrl.executeClinicalNotesLoadingFallback();
      }
    };

    // Load clinical notes data
    ctrl.initClinicalNotes = function () {
      // subscribe to clinical notes list changes from factory
      patientNotesFactory.observeNotes($scope.updateClinicalNoteCollection);
    };

    //#endregion

    //#region Treatment Plans

    // Load treatment plans
    ctrl.initTreatmentPlans = function () {
      // loaded from patient-chart

      //TODO: what is this doing determine if it can be changed ... this must assume treatmentplans are loaded before hand.
      $timeout(function () {
        if (!ctrl.initialized.TreatmentPlan && $scope.loading.TreatmentPlan) {
          ctrl.initialized.TreatmentPlan = true;
          $scope.loading.TreatmentPlan = false;
          ctrl.shouldIFilterRecords();
        }
      }, 200);
    };

    // Update description for treatment plan
    ctrl.buildTreatmentPlanDescription = function (treatmentPlanHeaderSummary) {
      var displayName =
        treatmentPlanHeaderSummary.TreatmentPlanHeader.TreatmentPlanName +
        ' | ';
      if (treatmentPlanHeaderSummary.TreatmentPlanServices.length) {
        displayName =
          treatmentPlanHeaderSummary.TreatmentPlanServices.length === 1
            ? displayName +
              treatmentPlanHeaderSummary.TreatmentPlanServices.length +
              localize.getLocalizedString(' Service ')
            : displayName +
              treatmentPlanHeaderSummary.TreatmentPlanServices.length +
              localize.getLocalizedString(' Services ');
      }

      var formattedFees = '($0.00)';
      if (treatmentPlanHeaderSummary.TreatmentPlanHeader.TotalFees === 0) {
        displayName = displayName + formattedFees;
      } else {
        formattedFees = $filter('currency')(
          treatmentPlanHeaderSummary.TreatmentPlanHeader.TotalFees
        );
        displayName = displayName + '(' + formattedFees + ')';
      }

      treatmentPlanHeaderSummary.TreatmentPlanDescription = displayName;
    };

    // Process Tx Plans received from database and convert it to add in common collection of all clinical items
    ctrl.processTreatmentPlans = function () {
      // alternate txPlans need to be grouped under the original txPlan, assign them the same date in the timeline wrapper object
      var txPlanHeaderGroups = $filter('groupBy')(
        $scope.treatmentPlanHeaders,
        'TreatmentPlanHeader.AlternateGroupId'
      );
      _.forEach(txPlanHeaderGroups, function (group) {
        // making sure the the original plan is always first in the list
        group = $filter('orderBy')(group, 'TreatmentPlanHeader.CreatedDate');
        var i = 0;
        var lastIndex = group.length - 1;
        _.forEach(group, function (tph, key) {
          ctrl.buildTreatmentPlanDescription(tph);
          // assigning classes to $$GroupingClass based on position
          if (group.length > 1) {
            if (key === 0) {
              tph.$$GroupingClass = 'groupedTop';
            } else if (key === lastIndex) {
              tph.$$GroupingClass = 'groupedBottom';
            } else {
              tph.$$GroupingClass = 'grouped';
            }
          } else {
            delete tph.$$GroupingClass;
          }

          // in order for sorting to work for groups, we need the child txPlans to have dates older than the original plan
          var listItem = ctrl.createTimelineItem(
            moment
              .utc(group[0].TreatmentPlanHeader.CreatedDate)
              .subtract(1, 'ms'),
            tph,
            'TreatmentPlan'
          );
          ctrl.treatmentPlans.push(listItem);
          i++;
        });
      });

      var clonedList = _.cloneDeep($scope.timelineRecords);

      if (ctrl.initialized.TreatmentPlan) {
        // replace the existing treatment plans from the list.
        clonedList = ctrl.resetTxPlanTimeline(
          ctrl.treatmentPlans,
          clonedList,
          'TreatmentPlan'
        );
        $scope.timelineRecords = clonedList;
        ctrl.initialized.TreatmentPlan = true;
      } else {
        $scope.timelineRecords = clonedList.concat(ctrl.treatmentPlans);
        ctrl.initialized.TreatmentPlan = true;
      }

      ctrl.executeTreatmentPlanLoadingFallback();
    };

    ctrl.executeTreatmentPlanLoadingFallback = function () {
      $scope.loading.TreatmentPlan = false;
      ctrl.shouldIFilterRecords();
    };

    //#endregion

    //#region Appointments

    $scope.$on(
      'appointment:startup-show-appointment-model',
      function (event, appointment) {
        if (appointment != null) {
          $scope.isAppointmentDisabled = true;

          $rootScope.$broadcast('appointment:begin-appointment', appointment);
        }
      }
    );

    // When a user tried to start an appointment.
    $scope.$on('appointment:start-appointment', function (event, appointment) {
      // remove the item from the list of items and place it on the todays appointments view!
      if (appointment === null) {
        return;
      }
      $scope.loading.Appointment === true;
      $scope.isAppointmentDisabled = true;

      var item = ctrl.processAppointmentRecord(appointment);
      var timelineItem = ctrl.createTimelineItem(
        item.StartTime,
        item,
        'Appointment'
      );
      timelineItem.load = true;

      var clonedList = _.cloneDeep($scope.timelineRecords);
      var index = _.findIndex(clonedList, function (value) {
        return (
          value.record.AppointmentId === timelineItem.record.AppointmentId &&
          value.recordType === timelineItem.recordType
        );
      });

      if (index !== -1) {
        clonedList[index] = timelineItem;
        $scope.timelineRecords = clonedList;
      }

      ctrl.executeAppointmentLoadingFallback();
    });

    // Reload appointments once an appointment is updated
    $scope.$on('appointment:update-appointment', function (event, appointment) {
      if (appointment === null) {
        return;
      }
      var obj = { AppointmentId: appointment.AppointmentId };

      scheduleServices.Lists.Appointments.GetSingleForTimeline(
        obj
      ).$promise.then(function (response) {
        var singleAppointment = response.Value;

        // process updated object for clinical timeline
        var item = ctrl.processAppointmentRecord(singleAppointment);

        var timelineItem = ctrl.createTimelineItem(
          item.StartTime,
          item,
          'Appointment'
        );
        var clonedList = _.cloneDeep($scope.timelineRecords);

        // add the appointment to the main list.
        clonedList = ctrl.resetSingleItemInTimeline(
          timelineItem,
          clonedList,
          'Appointment',
          'AppointmentId'
        );
        $scope.timelineRecords = clonedList;

        $scope.isAppointmentDisabled = false;
        ctrl.executeAppointmentLoadingFallback();
        $rootScope.$broadcast('appointment:appointment-reloaded');
      }, ctrl.appointmentRetrievalFailed);
    });

    // Initialize prerequisites for displaying patient appointments
    ctrl.loadAppointments = function () {
      if (
        $scope.hasClinicalAppointmentViewAccess ||
        !ctrl.initialized.Appointment ||
        !$scope.loading.Appointment
      ) {
        $scope.loading.Appointment = true;

        var dependentServices = [
          ctrl.retrieveAppointments(),
          ctrl.getProviders(),
          ctrl.getServiceCodes(),
          referenceDataService
            .getData(referenceDataService.entityNames.appointmentTypes)
            .then(function (appointmentTypes) {
              ctrl.appointmentTypes = appointmentTypes;
              return ctrl.appointmentTypes;
            }),
        ];

        // After fetching practice service codes and  appointment types, appointments and providers
        $q.all(dependentServices).then(
          ctrl.fetchAppointmentRecordsOnSuccess,
          ctrl.fetchAppointmentRecordsOnError
        );
      } else {
        ctrl.executeAppointmentLoadingFallback();
      }
    };

    // Process and create list of appointments
    ctrl.fetchAppointmentRecordsOnSuccess = function () {
      ctrl.processAppointments();
    };

    // Error callback function for updating appointment records in time line collection
    ctrl.fetchAppointmentRecordsOnError = function () {
      // Clear list before updating records
      ctrl.appointments = [];

      ctrl.initialized.Appointment = true;
      ctrl.executeAppointmentLoadingFallback();
      $rootScope.$broadcast('appointment:appointment-reloaded');
    };

    // Success callback of Get all appointment
    ctrl.appointmentRetrievalSuccess = function (result) {
      if (!_.isEmpty(result.Value)) {
        var appointments = result.Value;

        // Need to figure out why this call was taking place ... before adding back in.
        //treatmentPlansFactory.SetPatientAppointments(appointments);
        var scheduledAppointments = [];
        _.forEach(appointments, function (appt) {
          if (appt.Classification === 0) {
            scheduledAppointments.push(appt);
          }
        });
        ctrl.appointmentData = scheduledAppointments;
      }
    };

    // Error callback of Get all appointment
    ctrl.appointmentRetrievalFailed = function () {
      ctrl.executeAppointmentLoadingFallback();
      toastrFactory.error(
        localize.getLocalizedString(
          'Failed to retrieve the list of {0}. Refresh the page to try again',
          ['Appointments']
        ),
        localize.getLocalizedString('Server Error')
      );
    };

    // Get all appointments for patient
    ctrl.retrieveAppointments = function () {
      var obj = { PatientId: $scope.personId };
      var promise = scheduleServices.Lists.Appointments.GetAllForTimeline(
        obj
      ).$promise.then(
        ctrl.appointmentRetrievalSuccess,
        ctrl.appointmentRetrievalFailed
      );

      return promise;
    };

    //Add provider name to appointment
    ctrl.appendProviderData = function (appointment, providerUserId) {
      if (appointment != null) {
        var provider = _.find(ctrl.providers, { UserId: providerUserId });

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
          appointment.ProviderName = provider.Name;
        } else {
          appointment.ProviderName = '';
        }
      }
      return appointment;
    };

    // getting the list of providers
    ctrl.getProviders = function () {
      var promise = usersFactory.Users().then(function (res) {
        if (res && res.Value) {
          ctrl.providers = res.Value;
        }
      });
      return promise;
    };

    //check weather date is with zero offset format i.e. Z is appended at the end of date string
    ctrl.checkDateZeroOffset = function (dateString) {
      if (dateString) {
        if (
          typeof dateString != 'string' ||
          dateString.substr(dateString.length - 1).toLowerCase() === 'z'
        ) {
          return true;
        } else {
          return false;
        }
      }
      return false;
    };

    // process a single appointment record for clinical timeline
    ctrl.processAppointmentRecord = function (appointment) {
      var serviceCodeDisplayAs = '';
      timeZoneFactory.ConvertAppointmentDatesTZ(
        appointment,
        appointment.LocationTimezoneInfo
      );

      _.forEach(appointment.PlannedServices, function (plannedService) {
        if (serviceCodeDisplayAs !== '') {
          serviceCodeDisplayAs += ', ';
        }
        var serviceCode = $filter('filter')(ctrl.serviceCodes, {
          ServiceCodeId: plannedService.ServiceCodeId,
        })[0];
        if (serviceCode) {
          serviceCodeDisplayAs += serviceCode.DisplayAs;
          plannedService.CodeName = serviceCode.Code;
          if (
            typeof serviceCode.CdtCodeName !== 'undefined' &&
            serviceCode.CdtCodeName != null &&
            serviceCode.CdtCodeName.length > 0
          ) {
            plannedService.DescriptionWithCDT =
              serviceCode.Description + ' (' + serviceCode.CdtCodeName + ')';
          } else {
            plannedService.DescriptionWithCDT = serviceCode.Description;
          }

          plannedService.AffectedAreaId = serviceCode.AffectedAreaId;
        }
        // need to filter then assign the value ... this caused problems and is hard to debug otherwise.
        plannedService.ProviderCode = $filter('filter')(ctrl.providers, {
          UserId: plannedService.ProviderUserId,
        })[0].UserCode;

        plannedService.Area = null;

        if (plannedService.Surface) {
          plannedService.SurfaceList = plannedService.Surface.split(',');
          if (plannedService.SurfaceList.length > 0) {
            plannedService.Area = plannedService.SurfaceList;
          }
        } else if (plannedService.Root) {
          plannedService.RootList = plannedService.Root.split(',');
          if (plannedService.RootList.length > 0) {
            plannedService.Area = plannedService.RootList;
          }
        }
      });
      appointment.ServiceCodeDisplayAs = serviceCodeDisplayAs;

      //correct UTC date time issue
      if (!ctrl.checkDateZeroOffset(appointment.StartTime)) {
        appointment.StartTime = appointment.StartTime + 'Z';
      }

      appointment = ctrl.appendProviderData(
        appointment,
        appointment.ProviderId
      );

      return appointment;
    };

    // Process appointments received from database and convert it to add in common collection of all clinical items
    ctrl.processAppointments = function () {
      ctrl.appointments = [];
      if (ctrl.appointmentData.length > 0) {
        _.forEach(ctrl.appointmentData, function (appointment) {
          if (appointment.Status === 4) $scope.isAppointmentDisabled = true;

          // process updated object for clinical timeline
          appointment = ctrl.processAppointmentRecord(appointment);

          var listItem = ctrl.createTimelineItem(
            appointment.StartTime,
            appointment,
            'Appointment'
          );
          ctrl.appointments.push(listItem);
        });

        // If appointments are initialized for the first time, add the list to time line records
        // Otherwise, refill the time line records
        if (ctrl.initialized.Appointment) {
          // Reset the appointments and today's appointment area
          var clonedList = _.cloneDeep($scope.timelineRecords);
          clonedList = ctrl.resetItemsInTimeLine(
            ctrl.appointments,
            clonedList,
            'Appointment',
            'AppointmentId'
          );
          $scope.timelineRecords = clonedList;
        } else {
          if (!_.isNil($scope.timelineRecords)) {
            $scope.timelineRecords = $scope.timelineRecords.concat(
              ctrl.appointments
            );
          }
          ctrl.initialized.Appointment = true;
        }
      }

      ctrl.executeAppointmentLoadingFallback();
      $rootScope.$broadcast('appointment:appointment-reloaded');
    };

    // Load appointments
    ctrl.initAppointments = function () {
      ctrl.loadAppointments();
    };

    ctrl.executeAppointmentLoadingFallback = function () {
      if (!_.isNil($scope.loading)) {
        $scope.loading.Appointment = false;
      }
      ctrl.shouldIFilterRecords();
    };

    //#endregion

    //#region Documents

    // visual grouping for MHFs that have attached docs
    ctrl.groupMedicalHxItems = function () {
      if (
        _.isEmpty(ctrl.medicalHistoryForms) ||
        _.isEmpty(ctrl.parentDocuments)
      ) {
        return;
      }

      _.forEach(ctrl.parentDocuments, function (doc) {
        var foundParentMHF = false;
        _.forEach(ctrl.medicalHistoryForms, function (mhf) {
          if (
            !foundParentMHF &&
            mhf.record.FileAllocationId === doc.record.FileAllocationId
          ) {
            mhf.record.$$GroupingClass = 'groupedTop';
            doc.record.$$GroupingClass = 'groupedBottom';
            var newDate = new Date(mhf.record.DateModified);
            newDate = newDate.setMilliseconds(newDate.getMilliseconds() - 1);
            doc.date = new Date(newDate);
            foundParentMHF = true;
          }
        });
      });
    };

    $scope.documentgroups = [];
    ctrl.documentRecords = [];
    ctrl.loadDocuments = function () {
      if ($scope.hasClinicalDocumentsViewAccess) {
        $scope.loading.Documents = true;
        var params = {};
        params.parentType = 'Patient';
        params.parentId = $routeParams.patientId;
        documentGroupsService.get().$promise.then(
          function (res) {
            $scope.documentgroups = res.Value;
            patientServices.Documents.getAllDocuments(params).$promise.then(
              function (res) {
                ctrl.documentRecords = res.Value;
                ctrl.processDocuments();
              },
              function (err) {
                ctrl.executeDocumentLoadingFallback();
              }
            );
          },
          function (err) {
            ctrl.executeDocumentLoadingFallback();
          }
        );
      } else {
        ctrl.executeDocumentLoadingFallback();
      }
    };

    // special filtering for documents to remove signed documents for Treatment Plans and Medical History
    // and to remove documents that are not Digital for Informed Consent
    // remove during load to prevent these from messing up the first load of timeline which restricts the number of items loaded
    $scope.documentRecordTypes = [
      'Other Clinical',
      'HIPAA',
      'Lab',
      'Specialist',
      'Consent',
      'Account',
      'Insurance',
      'Medical History',
    ];

    ctrl.showDocumentInTimeline = function (document, recordType) {
      // 'Digital' MimeTypes are txPlan snapshots and MHFs, MHF forms are loaded via the MHF summaries call
      // and txPlan snapshots and attached docs are only meant to be accessible via the menu in txPlan CRUD
      if (document.MimeType === 'Digital') {
        return recordType.Description === 'Consent' ? true : false;
      }
      return _.includes($scope.documentRecordTypes, recordType.Description)
        ? true
        : false;
    };

    ctrl.processDocuments = function () {
      ctrl.parentDocuments = [];
      // get perio exam records
      _.forEach(ctrl.documentRecords, function (document) {
        if (_.isEmpty(document)) {
          return;
        }

        var recordType = $filter('filter')($scope.documentgroups, {
          DocumentGroupId: document.DocumentGroupId,
        })[0];
        if (recordType) {
          // Setup sub group display
          if (recordType.Description === 'EOB') {
            recordType.Description = 'Insurance';
            recordType.$$subGroup = 'EOB';
          }

          // filter out certain documents
          var showDocument = ctrl.showDocumentInTimeline(document, recordType);

          var descriptionForItem = recordType.Description;
          if (
            recordType.Description === 'Consent' &&
            document.MimeType === 'Digital'
          ) {
            descriptionForItem = 'DigitalConsent';
          }

          if (showDocument) {
            var listItem = ctrl.createTimelineItem(
              document.DateUploaded,
              document,
              descriptionForItem
            );
            listItem.$$iconUrl = clinicalTimelineBusinessService.createTimelineIcon(
              recordType.Description
            );
            listItem.$$subGroup = recordType.$$subGroup;

            if (listItem) ctrl.parentDocuments.push(listItem);
          }
        }
      });
      //ctrl.groupMedicalHxItems();
      if (ctrl.initialized.Documents) {
        var clonedList = _.cloneDeep($scope.timelineRecords);

        _.forEach(ctrl.parentDocuments, function (item) {
          var index = _.findIndex(clonedList, function (value) {
            return value.record.DocumentId === item.record.DocumentId;
          });

          if (index !== -1) {
            clonedList[index] = item;
          } else {
            clonedList.push(item);
          }
        });

        $scope.timelineRecords = clonedList;
      } else {
        if (!_.isNil($scope.timelineRecords)) {
          $scope.timelineRecords = $scope.timelineRecords.concat(
            ctrl.parentDocuments
          );
        }
        ctrl.initialized.Documents = true;
      }
      ctrl.executeDocumentLoadingFallback();
    };

    ctrl.executeDocumentLoadingFallback = function () {
      if (!_.isNil($scope.loading)) {
        $scope.loading.Documents = false;
      }
      ctrl.shouldIFilterRecords();
    };

    // get all parent document records
    ctrl.initDocuments = function () {
      ctrl.loadDocuments();
    };

    $scope.documentRecordTypes = [
      'Other Clinical',
      'HIPAA',
      'Lab',
      'Specialist',
      'Consent',
      'Account',
      'Insurance',
      'Medical History',
    ];

    //#endregion

    //#region Medical History Forms
    $scope.medicalHistoryRecords = null;
    ctrl.loadMedicalHistoryForms = function () {
      $scope.loadingMedicalHistoryForm = true;
      if ($scope.canView) {
        $scope.loading.MedicalHistory = true;
        medicalHistoryFactory
          .getSummariesByPatientId($routeParams.patientId)
          .then(
            function (res) {
              $scope.medicalHistoryRecords = res.Value;
              ctrl.processMedicalHistoryForms();
            },
            function () {
              ctrl.executeMedicalHistoryLoadingFallback();
            }
          );
      } else {
        toastrFactory.error(
          localize.getLocalizedString(
            'You do not have permissions to view {0}.',
            ['Medical History Forms']
          ),
          localize.getLocalizedString('Server Error')
        );
        ctrl.executeMedicalHistoryLoadingFallback();
      }
    };

    ctrl.processMedicalHistoryForms = function () {
      // Array to hold medical hx forms
      ctrl.medicalHistoryForms = [];

      var currentForm = $filter('orderBy')(
        $scope.medicalHistoryRecords,
        'DateModified',
        true
      )[0];

      // get medical history records
      _.forEach($scope.medicalHistoryRecords, function (medHxForm) {
        medHxForm.isDisabled =
          medHxForm.FormAnswersId !== currentForm.FormAnswersId;

        var listItem = ctrl.createTimelineItem(
          medHxForm.DateModified,
          medHxForm,
          'MedicalHx'
        );
        if (listItem) ctrl.medicalHistoryForms.push(listItem);
      });
      //ctrl.groupMedicalHxItems();
      if (ctrl.initialized.MedicalHistoryForms) {
        var clonedList = _.cloneDeep($scope.timelineRecords);
        clonedList = ctrl.resetItemsInTimeLine(
          ctrl.medicalHistoryForms,
          clonedList,
          'MedicalHx',
          'FormAnswersId'
        );
        $scope.timelineRecords = clonedList;
      } else {
        if (!_.isNil($scope.timelineRecords)) {
          $scope.timelineRecords = $scope.timelineRecords.concat(
            ctrl.medicalHistoryForms
          );
        }
        ctrl.initialized.MedicalHistoryForms = true;
      }
      ctrl.executeMedicalHistoryLoadingFallback();
    };

    // get all medical history forms
    ctrl.initMedicalHxForms = function () {
      ctrl.loadMedicalHistoryForms();
    };

    ctrl.executeMedicalHistoryLoadingFallback = function () {
      if (!_.isNil($scope.loading)) {
        $scope.loading.MedicalHistory = false;
      }
      ctrl.shouldIFilterRecords();
    };

    //#endregion

    //#region Perio Stats Mouth

    // Process clinical Perio Stats Mouth to display in "All" timeline tab
    ctrl.processPerioStatsMouth = function () {
      ctrl.perioStatsMouth = [];

      // get perio exam records
      _.forEach(ctrl.perioStatsMouthData, function (perioStat) {
        var listItem = ctrl.createTimelineItem(
          perioStat.ExamDate,
          perioStat,
          'PerioStatsMouth'
        );
        if (listItem) ctrl.perioStatsMouth.push(listItem);
      });

      // If clinical Perio Stats Mouth are initialized for the first time, add the list to time line records
      // Otherwise, refill the time line records
      if (ctrl.initialized.PerioStatsMouth) {
        var clonedList = _.cloneDeep($scope.timelineRecords);
        clonedList = ctrl.resetItemsInTimeLine(
          ctrl.perioStatsMouth,
          clonedList,
          'ExamId'
        );
        $scope.timelineRecords = clonedList;
      } else {
        if (!_.isNil($scope.timelineRecords)) {
          $scope.timelineRecords = $scope.timelineRecords.concat(
            ctrl.perioStatsMouth
          );
        }
        ctrl.initialized.PerioStatsMouth = true;
      }
      ctrl.executePerioStatsMouthLoadingFallback();
    };

    ctrl.executePerioStatsMouthLoadingFallback = function () {
      $scope.loading.PerioStatsMouth = false;
      ctrl.shouldIFilterRecords();
    };

    $scope.onUpLoadSuccess = function () {
      if (ctrl.initialized.Documents) {
        ctrl.loadDocuments();
      }
      $scope.docCtrls.close();
    };

    $scope.onUpLoadCancel = function () {
      $scope.docCtrls.close();
    };

    $scope.openDocUploader = function () {
      $scope.docCtrls.content(
        '<doc-uploader [patient-id]="personId" (upload-cancel)="onUpLoadCancel($event)" (upload-success)="onUpLoadSuccess($event)"><doc-uploader>'
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
        title: 'Upload a document',
        modal: true,
      });

      $scope.docCtrls.open();
    };

    //#endregion

    //#region Image Exams

    // get image exams for a patient
    ctrl.imagingRefreshPromise = null;
    ctrl.getImageExams = function () {
      if ($scope.hasClinicalImagingViewAccess) {
        $scope.loading.ImageExam = true;
        imagingMasterService.getReadyServices().then(function (res) {
          try {
            let providers = _.reduce(
              res,
              function (result, value, key) {
                if (key !== imagingProviders.Sidexis) result.push(key);

                return result;
              },
              []
            );
            imagingMasterService
              .getPatientByFusePatientId(
                $scope.personId,
                $scope.personId,
                providers
              )
              .then(function (patResults) {
                let promises = [];
                let exams = [];
                for (let provider of providers) {
                  let patRes = patResults[provider];
                  if (patRes && patRes.success) {
                    if (
                      patRes.result &&
                      ((patRes.result.data &&
                        patRes.result.data.Records &&
                        patRes.result.data.Records.length > 0) ||
                        patRes.result.Value)
                    ) {
                      let patientId = patRes.result.data
                        ? patRes.result.data.Records[0].Id
                        : patRes.result.Value.Id;
                      promises.push(
                        imagingMasterService
                          .getAllByPatientId(patientId, provider)
                          .then(function (res) {
                            if (res && res.success && res.result) {
                              let newExams =
                                res.result.Exams || res.result.Value;
                              if (newExams && newExams.length > 0) {
                                newExams.forEach(function (exam) {
                                  exam.Provider = provider;
                                  exams.push(exam);
                                });
                              }
                            } else {
                              ctrl.getImageExamsFailure();
                            }
                          }, ctrl.getImageExamsFailure)
                      );
                    }
                  } else {
                    ctrl.getImageExamsFailure();
                  }
                }
                if (promises.length > 0) {
                  $q.all(promises).finally(function () {
                    ctrl.processImageExams(exams);
                  });
                } else {
                  ctrl.executeImageLoadingFallback();
                }
              }, ctrl.getImageExamsFailure);
          } catch (ex) {
            ctrl.getImageExamsFailure();
          }
        });
        if (!ctrl.imagingRefreshPromise) {
          ctrl.imagingRefreshPromise = patientImagingExamFactory.getRefreshPromise();
          ctrl.imagingRefreshPromise.then(null, null, ctrl.getImageExams);
        }
      } else {
        ctrl.executeImageLoadingFallback();
      }
    };

    ctrl.getExistingExternalImages = function () {
      var promise = patientServices.ExternalImages.get({
        patientId: $scope.personId,
      }).$promise.then(function (res) {
        ctrl.existingExternalImages = res.Value;
      });
      return promise;
    };

    // filter

    // filter existing images to see which external images have been added to fuse data
    // but are no longer attached to this patient in sidexis, remove from list
    ctrl.filterExamsForRemovedImages = function (
      existingExternalImages,
      externalImageStudies
    ) {
      // set MarkDeleted false
      existingExternalImages.forEach(externalImage => {
        externalImage.MarkDeleted = false;
      });
      // list of ImageNumbers in the sidexis data
      let sidexisImageNumbers = [];
      // for the ones that haven't, create dto data
      _.forEach(externalImageStudies, function (exam) {
        _.forEach(exam.series, function (ser) {
          if (ser.images.length > 0) {
            _.forEach(ser.images, function (image) {
              sidexisImageNumbers.push(image.imageNumber);
            });
          }
        });
      });
      existingExternalImages.forEach(existingExternalImage => {
        if (
          !sidexisImageNumbers.includes(parseInt(existingExternalImage.ImageId))
        ) {
          existingExternalImage.MarkDeleted = true;
        }
      });
    };

    ctrl.filterExamsForNewImages = function (existingImages, newExams) {
      // filter sidexis exams to see which images have not been added to fuse data
      let existingImageIds = _.map(existingImages, 'ImageId');
      // for the ones that haven't, create dto data
      let newImageDtos = [];
      _.forEach(newExams, function (exam) {
        _.forEach(exam.series, function (ser) {
          if (ser.images.length > 0) {
            _.forEach(ser.images, function (image) {
              if (!existingImageIds.includes(image.imageNumber.toString())) {
                let toothNumbers = [];
                if (image.toothNumbers && image.toothNumbers !== '') {
                  _.forEach(
                    image.toothNumbers.split(','),
                    function (toothNumber) {
                      toothNumbers.push(toothNumber);
                    }
                  );
                }
                let newImageDto = {
                  ThirdPartyImagingRecordId: null,
                  PatientId: $scope.personId,
                  ImageCreatedDate: image.date,
                  ImageId: image.imageNumber.toString(),
                  OriginalImageFilename:
                    image.description + '_' + image.imageNumber.toString(),
                  ImagingProviderId: 1,
                  ToothNumbers: toothNumbers,
                };
                newImageDtos.push(newImageDto);
              }
            });
          }
        });
      });
      return newImageDtos;
    };

    ctrl.syncImagesFailure = function (res) {
      // I'm not sure we want to do anything here
    };

    ctrl.syncImagesSuccess = function (res) {
      // I'm not sure we want to do anything here
    };

    // calls the externalImagesFactory to synchronize the fuse externalImage data with the sidexis data
    ctrl.syncExternalImages = function () {
      if (
        ctrl.externalImageStudies &&
        ctrl.externalImageStudies.length > 0 &&
        ctrl.existingExternalImages &&
        ctrl.existingExternalImages.length > 0
      ) {
        externalImagingWorkerFactory.syncImages(
          ctrl.existingExternalImages,
          ctrl.externalImageStudies,
          ctrl.syncImagesSuccess,
          ctrl.syncImagesFailure
        );
      }
    };

    ctrl.saveImagesFailure = function (res) {
      // I'm not sure we want to do anything here
    };

    ctrl.saveImagesSuccess = function (res) {
      // I'm not sure we want to do anything here
    };

    // this method will loop thru the list of stored sidexis events for this
    // patient and compare with the list we get from the sidexis server.
    // any events not in fuse data will be created and added to the timeline
    ctrl.createNewExternalImages = function () {
      // get and pass directoryAllocationId
      if (!_.isNil($scope.data)) {
        if (
          $scope.data.patientInfo &&
          $scope.data.patientInfo.PatientLocations.length > 0
        ) {
          let patientLocationIds = $scope.data.patientInfo.PatientLocations.map(
            function (pl) {
              return pl.LocationId;
            }
          );
          fileUploadFactory
            .CreatePatientDirectory(
              {
                PatientId: $scope.personId,
                DirectoryAllocationId:
                  $scope.data.patientInfo.DirectoryAllocationId,
              },
              patientLocationIds,
              'plapi-files-fsys-write'
            )
            .then(
              function (res) {
                let patientDirectoryAllocationId = res;
                // only make this call if we have a sidexis connection
                if (
                  ctrl.externalPatientId &&
                  ctrl.existingExternalImages &&
                  ctrl.existingExternalImages.length > 0
                ) {
                  externalImagingWorkerFactory.saveImages(
                    ctrl.externalPatientId,
                    ctrl.existingExternalImages,
                    patientDirectoryAllocationId,
                    ctrl.saveImagesSuccess,
                    ctrl.saveImagesFailure
                  );
                }
              },
              function () {
                toastrFactory.error(
                  'A conflict occurred while allocating the file, please contact your system administrator or rename the file and attempt to upload it again.',
                  'Error'
                );
              }
            );
        }
      }
    };

    ctrl.syncPatientData = function (sidexisPatient, fusePatient) {
      var sidexis = imagingProviders.Sidexis;

      let patientData = {
        patientId: fusePatient.ThirdPartyPatientId,
        lastName: sidexisPatient.lastName,
        firstName: sidexisPatient.firstName,
        gender: sidexisPatient.gender,
        birthDate: fusePatient.DateOfBirth
          ? moment.utc(fusePatient.DateOfBirth).format('YYYY-MM-DD')
          : sidexisPatient.birthdate,
      };

      // compare stored imaging patient with fuse patient data
      // only compare month day and year of birthdate
      // if dateOfBirth changes sych data
      const d1 = patientData.birthDate
        ? moment.utc(patientData.birthDate).format('MM/DD/YY')
        : '';
      const d2 = sidexisPatient.birthdate
        ? moment.utc(sidexisPatient.birthdate).format('MM/DD/YY')
        : '';
      const birthDateHasChanged = d1 !== d2;
      if (birthDateHasChanged) {
        imagingMasterService
          .updatePatientData(patientData, sidexis)
          .then(res => {
            if (res.success === true) {
              patientData.lastName = fusePatient.LastName;
              patientData.firstName = fusePatient.FirstName;
              // have there been name changes,  if so sync again
              if (
                sidexisPatient.firstName.toUpperCase() !==
                  fusePatient.FirstName.toUpperCase() ||
                sidexisPatient.lastName.toUpperCase() !==
                  fusePatient.LastName.toUpperCase()
              ) {
                imagingMasterService
                  .updatePatientData(patientData, sidexis)
                  .then(res => {
                    // eslint-disable-next-line no-empty
                    if (res.success === true) {
                    }
                  });
              }
            }
          });
      } else {
        patientData.lastName = fusePatient.LastName;
        patientData.firstName = fusePatient.FirstName;
        // have there been name changes,  if so sync data
        if (
          sidexisPatient.firstName.toUpperCase() !==
            fusePatient.FirstName.toUpperCase() ||
          sidexisPatient.lastName.toUpperCase() !==
            fusePatient.LastName.toUpperCase()
        ) {
          imagingMasterService
            .updatePatientData(patientData, sidexis)
            .then(res => {
              // eslint-disable-next-line no-empty
              if (res.success === true) {
              }
            });
        }
      }
    };

    // this method gets a list of external image studies when the connected to the sidexis instance
    // compare with saved data and only add ones not currently stored to the fuse data
    ctrl.getSidexisExternalImageExams = function () {
      ctrl.externalImageStudies = [];
      var sidexis = imagingProviders.Sidexis;
      var defer = $q.defer();
      if ($scope.hasClinicalImagingViewAccess) {
        $scope.loading.ImageExamExternal = true;
        ctrl.clinicalOverviewDeferred.promise.then(function () {
          imagingMasterService
            .getPatientByFusePatientId(
              $scope.personId,
              $scope.data.patientInfo.ThirdPartyPatientId,
              [sidexis]
            )
            .then(
              res => {
                if (
                  res &&
                  res[sidexis] &&
                  res[sidexis].success &&
                  res[sidexis].result &&
                  res[sidexis].result.id
                ) {
                  let sidexisPatient = res[sidexis].result;
                  console.log(res[sidexis]);
                  ctrl.externalPatientId = res[sidexis].result.id;
                  imagingMasterService
                    .getAllByPatientId(res[sidexis].result.id, sidexis)
                    .then(res => {
                      if (res) {
                        ctrl.externalImageStudies = res.result;
                        defer.resolve();
                      } else {
                        ctrl.getExternalImageExamsFailure();
                        defer.resolve();
                      }
                    });
                  ctrl.syncPatientData(sidexisPatient, $scope.data.patientInfo);
                } else {
                  ctrl.executeImageLoadingFallback();
                  defer.resolve();
                }
              },
              () => {
                ctrl.getExternalImageExamsFailure();
                defer.resolve();
              }
            );
        });
      } else {
        ctrl.executeImageLoadingFallback();
        defer.resolve();
      }
      return defer.promise;
    };

    ctrl.getExternalImageExamsFailure = function () {
      toastrFactory.error(
        'Failed to retrieve patient data from imaging server.',
        'Error'
      );
      ctrl.executeExternalImageLoadingFallback();
    };

    ctrl.getImageExamsFailure = function () {
      toastrFactory.error(
        'Failed to retrieve patient data from imaging server.',
        'Error'
      );
      ctrl.executeImageLoadingFallback();
    };

    // merge new external exams with existing external exams
    ctrl.mergeExternalImages = function () {
      // filter for new images
      let newImageDtos = ctrl.filterExamsForNewImages(
        ctrl.existingExternalImages,
        ctrl.externalImageStudies
      );
      if (newImageDtos.length > 0) {
        // add to existing image list
        ctrl.existingExternalImages = ctrl.existingExternalImages.concat(
          newImageDtos
        );
      }
      // filter out any of the fuse images that are no longer in the externalImageStudies
      // only filter if we have a connection to sidexis
      if (ctrl.externalPatientId) {
        ctrl.filterExamsForRemovedImages(
          ctrl.existingExternalImages,
          ctrl.externalImageStudies
        );
      }

      // add any new image data to fuse data
      ctrl.createNewExternalImages();
      // process new images to timeline
      ctrl.processExternalImageExams(ctrl.existingExternalImages);
    };

    // process all external images to timeline events
    ctrl.processExternalImageExams = function (externalImages) {
      // filter out any records that are MarkDeleted equals true, these indicate the image is no longer attached to this patient
      let filteredExternalImages = externalImages.filter(function (
        externalImage
      ) {
        return externalImage.MarkDeleted !== true;
      });

      ctrl.externalImageExams = [];
      // add calculated group date for bundling images as an exam
      _.forEach(filteredExternalImages, function (image) {
        image.$$ExamDate = $filter('date')(
          image.ImageCreatedDate,
          'EEEE, MMMM d y'
        );
      });
      // an exam equals all images for this patient for a particular day
      // group the records
      let imageGroups = _.groupBy(filteredExternalImages, '$$ExamDate');

      _.forEach(imageGroups, function (imageGroup) {
        // create an exam that contains those images
        let exam = { Series: [{ Images: [] }] };
        exam.ToothNumbers = [];

        _.forEach(imageGroup, function (image) {
          if (image.ToothNumbers && image.ToothNumbers !== '') {
            _.forEach(image.ToothNumbers, function (toothNumber) {
              exam.ToothNumbers.push(toothNumber);
            });
          }
          // create a series with images to be compatible with imaging tile
          exam.Series[0].Images.push(image);
        });

        exam.date = moment(imageGroup[0].$$ExamDate)
          .utc()
          .format('YYYY-MM-DDTHH:mm:ss');
        exam.Description = 'Sidexis Exam';
        var listItem = ctrl.createTimelineItem(
          exam.date,
          exam,
          'ExternalImageExam'
        );

        ctrl.externalImageExams.push(listItem);
      });
      // If image exams are initialized for the first time, add the list to time line records
      // Otherwise, refill the time line records
      if (ctrl.initialized.ImageExamExternal) {
        var clonedList = _.cloneDeep($scope.timelineRecords);
        // need to understand if this id is right for this entity.
        clonedList = ctrl.resetItemsInTimeLine(
          ctrl.externalImageExams,
          clonedList,
          'ExternalImageExam',
          'Id'
        );
        $scope.timelineRecords = clonedList;
      } else {
        if (!_.isNil($scope.timelineRecords)) {
          $scope.timelineRecords = $scope.timelineRecords.concat(
            ctrl.externalImageExams
          );
        }
        ctrl.initialized.ImageExamExternal = true;
      }

      ctrl.executeExternalImageLoadingFallback();
    };

    // Process clinical notes to display in "All" timeline tab
    ctrl.processImageExams = function (exams) {
      ctrl.imageExams = [];

      _.forEach(exams, function (exam) {
        exam.ToothNumbers = [];
        _.forEach(exam.Series, function (series) {
          _.forEach(series.Images, function (image) {
            if (image.AdultTeeth && image.AdultTeeth !== '') {
              exam.ToothNumbers = exam.ToothNumbers.concat(
                image.AdultTeeth.split(',')
              );
            }
            if (image.DeciduousTeeth && image.DeciduousTeeth !== '') {
              exam.ToothNumbers = exam.ToothNumbers.concat(
                image.DeciduousTeeth.split(',')
              );
            }
          });
        });

        if (moment(exam.Date).format('HH:mm:ss') === '00:00:00') {
          exam.Date = moment(exam.Date).utc().format('YYYY-MM-DDTHH:mm:ss');
        }

        var listItem = ctrl.createTimelineItem(exam.Date, exam, 'ImageExam');

        ctrl.imageExams.push(listItem);
      });

      // If image exams are initialized for the first time, add the list to time line records
      // Otherwise, refill the time line records
      if (ctrl.initialized.ImageExam) {
        var clonedList = _.cloneDeep($scope.timelineRecords);
        // need to understand if this id is right for this entity.
        clonedList = ctrl.resetItemsInTimeLine(
          ctrl.imageExams,
          clonedList,
          'ImageExam',
          'Id'
        );
        $scope.timelineRecords = clonedList;
      } else {
        if (!_.isNil($scope.timelineRecords)) {
          $scope.timelineRecords = $scope.timelineRecords.concat(
            ctrl.imageExams
          );
        }
        ctrl.initialized.ImageExam = true;
      }

      ctrl.executeImageLoadingFallback();
    };

    ctrl.executeExternalImageLoadingFallback = function () {
      if ($scope.loading) {
        $scope.loading.ImageExamExternal = false;
        ctrl.shouldIFilterRecords();
      }
    };

    ctrl.executeImageLoadingFallback = function () {
      if ($scope.loading) {
        $scope.loading.ImageExam = false;
        ctrl.shouldIFilterRecords();
      }
    };

    $scope.examToPreview = null;
    // updateExternalImageExams method is used to update the timeline with the latest FileAllocationIds, ThirdPartyImagingRecordId
    // that may have been added since loading the timeline, NOTE it doesn't replace timeline items, just updates properties.
    ctrl.updateExternalImageExams = function (existingExternalImages, exam) {
      let currentTimelineItems = _.filter(
        $scope.timelineRecords,
        function (item) {
          return item.recordType === 'ExternalImageExam';
        }
      );
      // TODO remove looping?
      _.forEach(existingExternalImages, function (image) {
        _.forEach(currentTimelineItems, function (timelineItem) {
          _.forEach(timelineItem.record.Series, function (series) {
            _.forEach(series.Images, function (timelineImage) {
              if (timelineImage.ImageId === image.ImageId) {
                // only update the timeline record if something has changed
                if (
                  timelineImage.ThirdPartyImagingRecordId !==
                  image.ThirdPartyImagingRecordId
                ) {
                  timelineImage.ThirdPartyImagingRecordId =
                    image.ThirdPartyImagingRecordId;
                }
                if (timelineImage.FileAllocationId !== image.FileAllocationId) {
                  timelineImage.FileAllocationId = image.FileAllocationId;
                }
              }
            });
          });
        });
      });
      ctrl.filterRecords();
      $scope.examToPreview = exam;
    };

    // reload timeline external images
    $scope.$on('soar:update-external-images', function (event, exam) {
      ctrl.getExistingExternalImages().then(function () {
        // reload all records so we get the ids and FileAllocationIds
        ctrl.updateExternalImageExams(ctrl.existingExternalImages, exam);
      });
    });

    // Load image exam data
    ctrl.initImageExams = function () {
      ctrl.getImageExams();
      // handle external images (sidexis)
      var externalImageDependancies = [];
      externalImageDependancies.push(ctrl.getExistingExternalImages());
      externalImageDependancies.push(ctrl.getSidexisExternalImageExams());
      $q.all(externalImageDependancies).then(function () {
        ctrl.syncExternalImages(
          ctrl.existingExternalImages,
          ctrl.externalImageStudies
        );
        ctrl.mergeExternalImages();
      });
    };
    //#endregion

    //#region Misc functions

    // Creates a timeline display item by accepting date, record and its type as input parameters. These properties must be set on timeline item object
    ctrl.createTimelineItem = function (date, record, recordType, groupId) {
      clinicalTimelineBusinessService.setIsDeleted(record, recordType);
      var utcDate = moment.utc(date).toDate();
      //var groupId = _.isUndefined(groupId) ? 0 : groupId;

      // data for each item in a clinical time line items list
      var listItem = {
        date: utcDate,
        groupDate: $filter('date')(utcDate, 'EEEE, MMMM d y'),
        record: _.cloneDeep(record),
        recordType: recordType,
        //groupId: groupId,
        load: false,
      };

      return listItem;
    };

    //#endregion

    //#region Startup calls

    ctrl.setInitialTimelineFilters = function () {
      var treatmentPlanFilter = _.find($scope.filterButtons, {
        RecordType: 'TreatmentPlan',
      });
      treatmentPlanFilter.Active = true;
      var servicesFilter = _.find($scope.filterButtons, {
        RecordType: 'ServiceTransaction',
      });
      servicesFilter.Active = true;
      var conditionsFilter = _.find($scope.filterButtons, {
        RecordType: 'Condition',
      });
      conditionsFilter.Active = true;
      var notesFilter = _.find($scope.filterButtons, {
        RecordType: 'ClinicalNote',
      });
      notesFilter.Active = true;
      var appointmentFilter = _.find($scope.filterButtons, {
        RecordType: 'Appointment',
      });
      appointmentFilter.Active = true;
      ctrl.buttonFiltersApplied = true;
      var activeFilterButtons = _.filter($scope.filterButtons, {
        Active: true,
      });
      $scope.appliedFilters = activeFilterButtons;
    };

    // initialize clinical timeline
    ctrl.init = function () {
      ctrl.setInitialTimelineFilters();

      // Some times this code is executing faster then the variable is getting put on scope.
      if ($scope.timelineRecords === undefined) {
        $scope.timelineRecords = [];
      }

      //Changing order of load to start loading the most important stuff first

      ctrl.initServicesAndConditions();

      ctrl.initTreatmentPlans();

      // Load clinical notes data
      ctrl.initClinicalNotes();

      // Load image exams
      ctrl.initImageExams();

      // Load appointments
      ctrl.initAppointments();

      $scope.loading.PatientRx = false;

      ctrl.initDocuments();

      // Load medical history forms
      ctrl.initMedicalHxForms();
    };

    // edit document properties, listening for emit, used to update item in list
    $scope.$on('soar:document-properties-edited', function (e, doc) {
      var clonedList = _.cloneDeep($scope.timelineRecords);

      var index = _.findIndex(clonedList, function (item) {
        return item.record.DocumentId == doc.DocumentId;
      });

      if (index !== -1) {
        $scope.loading.Documents === true;

        // either remove the value or remove and re-add the updated value
        if (
          doc.ParentType === 'Patient' &&
          doc.ParentId !== $routeParams.patientId
        ) {
          // remove from the timeline
          clonedList.splice(index, 1);
          $scope.timelineRecords = clonedList;
        } else {
          // update value in the timeline.

          // Figure out a better way to get the recordType
          var recordType = $filter('filter')($scope.documentgroups, {
            DocumentGroupId: doc.DocumentGroupId,
          })[0];

          var listItem = ctrl.createTimelineItem(
            document.DateUploaded,
            doc,
            recordType.Description
          );
          listItem.$$iconUrl = clinicalTimelineBusinessService.createTimelineIcon(
            recordType.Description
          );
          listItem.$$subGroup = recordType.$$subGroup;

          clonedList[index] = listItem;
          $scope.timelineRecords = clonedList;
        }

        ctrl.executeDocumentLoadingFallback();
      }
    });

    // edit document properties, listening for emit, used to open edit window
    $scope.$on(
      'soar:edit-document-properties',
      function (e, id, editing, selectedPatientId) {
        // get the values on the screen and mark all the Editing Disabled properties.
        _.forEach($scope.filteredTimelineRecords, function (ftr) {
          _.forEach(ftr, function (item) {
            if (item.record.DocumentId) {
              item.record.$$EditingDisabled = editing;
            }
          });
        });
        if (id !== null) {
          var formattedPatientName = patientLogic.GetFormattedName(
            $scope.data.patientInfo
          );
          ctrl.openDocumentProperties(id, formattedPatientName);
        }
      }
    );

    // edit document properties, opens kendo window for editing document properties
    ctrl.openDocumentProperties = function (id, formattedPatientName) {
      var encodedPatientName = _.escape(formattedPatientName);
      $scope.docCtrls.content(
        '<document-properties document-id="' +
          id +
          '" formatted-patient-name="' +
          _.escape(encodedPatientName) +
          '"></document-properties>'
      );
      $scope.docCtrls.setOptions({
        resizable: false,
        position: {
          top: '35%',
          left: '35%',
        },
        minWidth: 400,
        scrollable: false,
        iframe: false,
        actions: [],
        title: localize.getLocalizedString('View Document Properties'),
        modal: true,
      });
      $scope.docCtrls.open();
    };

    $scope.$on(
      'soar:medical-history-form-created',
      function (medicalHistoryForm) {
        ctrl.loadMedicalHistoryForms();
      }
    );

    $scope.showActive = true;

    //#region use clinical overview data for notes and perio exam headers when loaded
    ctrl.loadClinicalOverviewData = function () {
      $scope.loading.PerioStatsMouth = true;
      $scope.clinicalDataLoaded = true;
      ctrl.loadExamHeaders($scope.data.PerioExamSummaries);

      // on load the patientNotesFactory which has all the changes is always empty
      // on reload it will contain changes the other list does not.
      if (
        !patientNotesFactory.getNotesList() ||
        patientNotesFactory.getNotesList().length === 0
      ) {
        ctrl.loadNotes($scope.data.Notes);
      } else {
        ctrl.loadNotes(patientNotesFactory.getNotesList());
      }
    };

    ctrl.loadNotes = function (notes) {
      ctrl.processClinicalNotes(notes);
    };

    ctrl.loadExamHeaders = function (examHeaders) {
      ctrl.perioStatsMouthData = examHeaders;
      ctrl.processPerioStatsMouth();
    };

    $scope.clinicalDataLoaded = false;
    $scope.$watch(
      'data',
      function (nv, ov) {
        if (
          nv &&
          nv.PerioExamSummaries &&
          nv.Notes &&
          !$scope.clinicalDataLoaded
        ) {
          ctrl.clinicalOverviewDeferred.resolve();
          ctrl.loadClinicalOverviewData();
        }
      },
      true
    );

    //#endregion

    //#region medications
    ctrl.patientMedicationRecords = [];

    // Process medications
    ctrl.processPatientMedications = function (patientMedications) {
      _.forEach(patientMedications, function (patientMedication) {
        var listItem = ctrl.createTimelineItem(
          patientMedication.DateWritten,
          patientMedication,
          'PatientRx'
        );
        ctrl.patientMedicationRecords.push(listItem);
      });

      // If rx are initialized for the first time, add the list to time line records
      // Otherwise, refill the time line records
      if (ctrl.initialized.PatientRx) {
        var clonedList = _.cloneDeep($scope.timelineRecords);
        clonedList = ctrl.resetItemsInTimeLine(
          ctrl.patientMedicationRecords,
          clonedList,
          'PatientRx',
          'ExternalMedicationId'
        );
        $scope.timelineRecords = clonedList;
      } else {
        if (!_.isNil($scope.timelineRecords)) {
          $scope.timelineRecords = $scope.timelineRecords.concat(
            ctrl.patientMedicationRecords
          );
        }
        $scope.loadingPatientMedication = false;
      }
      ctrl.executeMedicationsLoadingFallback();
    };

    ctrl.initMedications = function () {
      if ($scope.hasRxViewAccess && $scope.rxData) {
        $scope.loading.PatientRx = true;
        $scope.loadingPatientMedication = true;

        ctrl.processPatientMedications($scope.rxData);
      } else {
        // if user has no permissions for rx, set loading complete
        ctrl.executeMedicationsLoadingFallback();
      }
    };

    $scope.$on('soar:rxNoteGenerated', function (event, value) {
      ctrl.loadClinicalOverviewData();
    });

    $scope.$on('soar:rxMedicationGetComplete', function (event, value) {
      $scope.rxData = value;
      ctrl.initMedications();
    });

    ctrl.executeMedicationsLoadingFallback = function () {
      $scope.loading.PatientRx = false;
      ctrl.shouldIFilterRecords();
    };

    $scope.toggleLabel = 'Show';

    $scope.toggleActive = function () {
      $scope.showActive = !$scope.showActive;
      $scope.toggleLabel = $scope.showActive === true ? 'Show' : 'Hide';
      // initiate the filtering
      ctrl.filterRecords();
    };

    $scope.timelineActive = true;
    $scope.timelineLabel = 'Hide';

    $scope.timelineHeight = '368px';

    $scope.toggleTimelineActive = function () {
      $scope.timelineActive = !$scope.timelineActive;

      $scope.timelineLabel = $scope.timelineActive === true ? 'Hide' : 'Show';
      if (!$scope.timelineActive) {
        $scope.timelineHeight = '523px';
      } else {
        $scope.timelineHeight = '368px';
      }
    };

    // calling initialization function
    ctrl.init();

    // filterTimeline is based on whether we are on the timeline tab
    $scope.$watch('subtabs', function (nv) {
      if (nv && !_.isUndefined(nv.timelineActive)) {
        ctrl.filterTimeline =
          $routeParams.newTab === 'formWidget' ? true : nv.timelineActive;
        ctrl.filterRecords();
      }
    });

    //#endregion

    //#region Old Filter Directive Code ...

    // Get the teeth selection from odontogram
    ctrl.selectedTeeth = toothSelectionService.selection.teeth
      ? toothSelectionService.selection.teeth
      : [];

    //$scope.timelineRecord.record.MedHx = ["1", "5"]

    ctrl.$onInit = function () {
      ctrl.setInitialTimelineFilters();

      if (
        !_.isUndefined($routeParams.activeExpand) &&
        !_.isUndefined($routeParams.txPlanId)
      ) {
        ctrl.IsNavigatedFromAppts();
      } else {
        // initial setting for reloading perio
        ctrl.reloadPerio = true;
        //ctrl.init();
        ctrl.filterRecords();
      }
      ctrl.getTeethDefinitions();
    };

    // gets the teeth defs from local storage
    ctrl.getTeethDefinitions = function () {
      staticData.TeethDefinitions().then(function (res) {
        if (res && res.Value) {
          odontogramUtilities.setTeethDefinitions(res.Value);
        }
      });
    };

    // Flag to represent if any filter is applied
    ctrl.buttonFiltersApplied = false;

    // Flag to represent if teeth have been selected from odontogram
    ctrl.toothFilterApplied = ctrl.selectedTeeth.length > 0;

    // filtered timeline records collection
    ctrl.filteredTimelineRecordsCollection = [];

    ctrl.hasClinicalPerioStatsViewAccess = patSecurityService.IsAuthorizedByAbbreviation(
      amfaKeys.SoarClinCperioView
    );

    //#endregion

    //#region PerioStatsTooth

    ctrl.getPerioStatsToothExamDetailsByPatientId = function (list) {
      // perio only needs to be reloaded if the tooth selection changes
      if (ctrl.reloadPerio === true) {
        $scope.perioStatsToothLoading = true;
        ctrl.reloadPerio = false;

        var toothIdFilter = [];
        _.forEach(ctrl.selectedTeeth, function (tooth) {
          var toothId = tooth.toothId.toString();
          toothIdFilter.push(toothId);
        });

        // if latest exam id is available, get the exam details, otherwise retrieve get all exam headers
        patientPerioExamFactory
          .getAllExamsByPatientId($scope.personId, toothIdFilter)
          .then(
            ctrl.getPerioStatsToothExamDetailsByPatientIdSuccess,
            ctrl.getPerioStatsToothExamDetailsByPatientIdFailure
          );
      }
    };

    ctrl.getPerioStatsToothExamDetailsByPatientIdSuccess = function (
      successResponse,
      list
    ) {
      successResponse.Value.forEach(x => {
        var perioStatsToothExamDetails = x.ExamDetails;

        ctrl.perioStatsToothExamDetailsByTooth = [];

        // get perio stats tooth records for selected teeth
        _.forEach(ctrl.selectedTeeth, function (tooth) {
          var toothId = tooth.toothId.toString();
          var detail = _.find(perioStatsToothExamDetails, { ToothId: toothId });
          if (detail) {
            ctrl.filterPerioStatsToothDetailsByReading(detail);
          }
        });

        // format perio stats tooth details in the timelineRecord format
        var perioStatsToothExamTimelineRecords = [];
        if (ctrl.perioStatsToothExamDetailsByTooth.length > 0) {
          _.forEach(
            ctrl.perioStatsToothExamDetailsByTooth,
            function (perioStatsToothExam) {
              perioStatsToothExam.ExamDate = x.ExamHeader.ExamDate;
              var listItem = ctrl.createTimelineItemForFilter(
                perioStatsToothExam.ExamDate,
                perioStatsToothExam,
                'PerioStatsToothExam'
              );
              if (listItem) perioStatsToothExamTimelineRecords.push(listItem);
            }
          );
        }

        // append perio stats tooth exam data to filteredTimelineRecordsCollection
        ctrl.filteredTimelineRecordsCollection = ctrl.filteredTimelineRecordsCollection.concat(
          perioStatsToothExamTimelineRecords
        );
      });

      $scope.perioStatsToothLoading = false;

      ctrl.updateAndSortFilteredTimelineRecords(
        ctrl.filteredTimelineRecordsCollection
      );
    };

    // Error callback function for getting perio exam details
    ctrl.getPerioStatsToothExamDetailsByPatientIdFailure = function () {
      $scope.perioStatsToothLoading = false;
      toastrFactory.error(
        localize.getLocalizedString(
          'Failed to retrieve the perio exam details.'
        )
      );

      ctrl.updateAndSortFilteredTimelineRecords(
        ctrl.filteredTimelineRecordsCollection
      );
    };

    // builds PerioStatsToothDetailsByTooth array by filtering out all perio stats tooth exam details where all PD and GM readings are null
    ctrl.filterPerioStatsToothDetailsByReading = function (
      perioStatsToothExamDetail
    ) {
      var hasPdReadings = false;
      var hasGmReadings = false;

      for (var i = 0; i < perioStatsToothExamDetail.DepthPocket.length; i++) {
        var dpReading = perioStatsToothExamDetail.DepthPocket[i];
        var gmReading = perioStatsToothExamDetail.GingivalMarginPocket[i];

        if (dpReading && dpReading > 0) {
          hasPdReadings = true;
          break;
        }

        if (gmReading && gmReading > 0) {
          hasGmReadings = true;
          break;
        }
      }

      if (hasPdReadings || hasGmReadings) {
        ctrl.perioStatsToothExamDetailsByTooth.push(perioStatsToothExamDetail);
      }
    };

    // Creates a timeline display item by accepting date, record and its type as input parameters. These properties must be set on timeline item object
    ctrl.createTimelineItemForFilter = function (date, record, recordType) {
      var utcDate = moment.utc(date).toDate();
      var listItem = _.cloneDeep($scope.timelineRecords[0]);
      listItem.date = new Date(date);
      listItem.record = _.cloneDeep(record);
      listItem.recordType = recordType;
      listItem.groupDate = $filter('date')(utcDate, 'EEEE, MMMM d y');

      return listItem;
    };

    //#endregion

    ctrl.isShowUpload = function (filters) {
      var showUpload = [];
      showUpload = _.filter(filters, function (item) {
        return (
          item.RecordType == 'Other Clinical' ||
          item.RecordType == 'HIPAA' ||
          item.RecordType == 'Lab' ||
          item.RecordType == 'Specialist' ||
          item.RecordType == 'Consent' ||
          item.RecordType == 'Account' ||
          item.RecordType == 'Insurance' ||
          item.RecordType == 'EOB'
        );
      });
      return showUpload.length != 0;
    };

    // setting all records to load = true for icon and tooth filtering so that they are visible
    ctrl.setAllRecordsToLoadTrue = function () {
      if (
        !ctrl.allRecordsAreVisibleForFiltering &&
        $scope.timelineRecords.length > 0
      ) {
        _.forEach($scope.timelineRecords, function (tr, $last) {
          tr.load = true;
        });
        ctrl.allRecordsAreVisibleForFiltering = true;
      }
    };

    // Activate or inactivate timeline filter
    $scope.addOrRemoveFilter = function (event, filterButton) {
      ctrl.reloadPerio = true;
      $scope.userSelectedAFilter = true;
      ctrl.setAllRecordsToLoadTrue();
      if (filterButton.Active) {
        filterButton.Active = false;
        var activeFilterButtons = _.filter($scope.filterButtons, {
          Active: true,
        });
        ctrl.buttonFiltersApplied = !_.isEmpty(activeFilterButtons);
        $scope.appliedFilters = activeFilterButtons;
        if (ctrl.buttonFiltersApplied) {
          $scope.showUpload = ctrl.isShowUpload(activeFilterButtons);
        } else {
          $scope.showUpload = false;
        }
      } else {
        filterButton.Active = true;
        $scope.appliedFilters.push(filterButton);
        var activeFilterButtons = _.filter($scope.filterButtons, {
          Active: true,
        });
        $scope.showUpload = ctrl.isShowUpload(activeFilterButtons);
        ctrl.buttonFiltersApplied = true;
      }

      ctrl.filterRecords();
    };

    // Identify teeth selection from odontogram and filter timeline entries based on selected teeth
    $scope.$watch(
      function () {
        return toothSelectionService.selection.teeth;
      },
      function (nv, ov) {
        if (nv !== ov) {
          ctrl.toothFilterApplied = !_.isEmpty(
            toothSelectionService.selection.teeth
          );
          // to control loading of perio which was looping due to watch on timeline records
          ctrl.reloadPerio = true;
          ctrl.selectedTeeth = toothSelectionService.selection.teeth;
          ctrl.filterRecords();
        }
      },
      true
    );

    //#endregion

    //checks to see if it is navigated from appointments
    ctrl.IsNavigatedFromAppts = function () {
      var filterButton = _.find($scope.filterButtons, {
        RecordType: 'TreatmentPlan',
      });
      filterButton.Active = true;
      ctrl.buttonFiltersApplied = true;
      ctrl.filterRecords();
    };

    $scope.$watch('showActive', function (nv) {
      //setting all records to load = true if want to show deleted records
      if (ctrl.allRecordsAreVisibleForFiltering !== true && nv === false) {
        ctrl.setAllRecordsToLoadTrue();
      }
    });

    //#endregion

    // service Modal code.
    // Having a kendo modal in each of the services was causing a large slow down in loading and resetting after applying a filter.
    // So now the modal previously used in each service is now in the clinical timeline.
    // Kendo control render on the dom and have to in order to function correctly. So only making one of them is a good performance improvement.
    $scope.$on('show-service-modal', function (event, args) {
      if (
        !_.isEmpty(args) &&
        args.type !== null &&
        args.title !== null &&
        args.isSwiftCode !== null &&
        args.firstCode !== null &&
        args.lastCode !== null
      ) {
        $scope.openToothCtrls(
          args.type,
          args.title,
          args.isSwiftCode,
          args.firstCode,
          args.lastCode
        );
      }
    });

    // Displays the "Add Service"/"Add Condition" kendo window
    $scope.openToothCtrls = function (
      mode,
      title,
      isSwiftCode,
      firstCode,
      lastCode
    ) {
      $scope.docCtrls.content(
        '<multi-location-proposed-service mode="' +
          _.escape(mode) +
          '" isswiftcode="' +
          _.escape(isSwiftCode) +
          '" isfirstcode="' +
          _.escape(firstCode) +
          '" islastcode="' +
          _.escape(lastCode) +
          '" isedit="' +
          true +
          '"  ></multi-location-proposed-service>'
      );
      $scope.docCtrls.setOptions({
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
      $scope.docCtrls.open();
    };

    $scope.closeWindow = function () {
      $scope.docCtrls.close();
    };

    $scope.$on('close-tooth-window', function (e) {
      $scope.closeWindow();
    });

    // conditions Modal code.
    // Having a kendo modal in each of the services was causing a large slow down in loading and resetting after applying a filter.
    // So now the modal previously used in each condition is now in the clinical timeline.
    // Kendo control render on the dom and have to in order to function correctly. So only making one of them is a good performance improvement.
    $scope.$on('show-condition-modal', function (event, args) {
      if (!_.isEmpty(args) && args.mode !== null && args.title !== null) {
        $scope.openPatientConditionCreateUpdate(args.mode, args.title);
      }
    });

    // Displays the "Add Service"/"Add Condition" kendo window
    // Displays the "Add Condition" kendo window
    $scope.openPatientConditionCreateUpdate = function openPatientConditionCreateUpdate(
      mode,
      title
    ) {
      $scope.docCtrls.content(
        '<patient-condition-create-update editing="true"></patient-condition-create-update>'
      );
      $scope.docCtrls.setOptions({
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
      $scope.docCtrls.open();
    };

    $scope.$on('close-patient-condition-create-update', function (e) {
      $scope.closeWindow();
    });

    //#region callback for existing treatment plans

    // notification that the treatmenty plan list has changed
    // only update the existing treatment plans list if the timeline is active tab
    ctrl.onExistingTreatmentPlanChange = function (existingTreatmentPlans) {
      if ($scope.hasClinicalTxPlanViewAccess) {
        updateExistingTreatmentPlans(existingTreatmentPlans);
      }
    };

    ctrl.initializeObservers = function () {
      // observer for watching the predetermination list for changes
      treatmentPlansFactory.ObserveExistingTreatmentPlansForTimeline(
        ctrl.onExistingTreatmentPlanChange
      );
      // since the ExistingTreatmentPlans may have already been instanced, get it now
      ctrl.onExistingTreatmentPlanChange(
        treatmentPlansFactory.ExistingTreatmentPlans
      );
    };
    ctrl.initializeObservers();

    $scope.$on('$destroy', function () {
      treatmentPlansFactory.ClearObservers();
    });

    //#endregion
  }

  ClinicalTimelineLandingController.prototype = Object.create(
    BaseCtrl.prototype
  );
})();
