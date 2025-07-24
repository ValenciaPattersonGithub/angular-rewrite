'use strict';
angular
  .module('Soar.Patient')
  .controller('PatientChartLedgerController', [
    '$scope',
    '$rootScope',
    'localize',
    '$timeout',
    '$location',
    '$routeParams',
    'patSecurityService',
    'toastrFactory',
    'CommonServices',
    'PatientServices',
    '$uibModal',
    'ModalFactory',
    '$filter',
    'UserServices',
    'UsersFactory',
    'StaticData',
    'ListHelper',
    'referenceDataService',
    'soarAnimation',
    'PatientOdontogramFactory',
    'PatientServicesFactory',
    'PatientConditionsFactory',
    'locationService',
    'PatientAppointmentsFactory',
    'ModalDataFactory',
    '$q',
    'SaveStates',
    'PatCacheFactory',
    'userSettingsDataService',
    'AppointmentViewVisibleService',
    'AppointmentViewDataLoadingService',
    'multiServiceEditService',
    'ChartColorsService',
    'ConditionsService',
    'FeatureFlagService',
    'FuseFlag',
    'schedulingMFENavigator',
    PatientChartLedgerController,
  ]);
function PatientChartLedgerController(
  $scope,
  $rootScope,
  localize,
  $timeout,
  $location,
  $routeParams,
  patSecurityService,
  toastrFactory,
  commonServices,
  patientServices,
  $uibModal,
  modalFactory,
  $filter,
  userServices,
  usersFactory,
  staticData,
  listHelper,
  referenceDataService,
  soarAnimation,
  patientOdontogramFactory,
  patientServicesFactory,
  patientConditionsFactory,
  locationService,
  patientAppointmentsFactory,
  modalDataFactory,
  $q,
  saveStates,
  patCacheFactory,
  userSettingsDataService,
  appointmentViewVisibleService,
  appointmentViewDataLoadingService,
  multiServiceEditService,
  chartColorsService,
  conditionsService,
  featureFlagService,
  fuseFlag,
  schedulingMFENavigator
) {
  BaseCtrl.call(this, $scope, 'PatientChartLedgerController');
  //#region properties

  // initial properties
  var ctrl = this;

  // no results message
  $scope.patientName = $filter('getDisplayNamePerBestPractice')(
    $scope.patientInfo
  );
  $scope.noResultsMessage = localize.getLocalizedString(
    'There are no saved services or conditions for {0}',
    [$scope.patientName]
  );

  // supporting collections
  $scope.conditions = [];
  $scope.providers = [];
  $scope.serviceCodes = [];
  $scope.serviceTransactionStatuses = [];
  $scope.modalIsOpen = false; //
  $scope.selectedServiceTransaction = null;
  $scope.confirmationRef = null;
  $scope.linkToScheduleV2 = false;
  

  // loading indicators
  $scope.loadingProviders = false;
  $scope.loadingConditions = false;
  $scope.loadingServiceCodes = false;
  $scope.loadingChartLedgerServices = false;
  // prevent all deletes while one delete is processing
  $scope.disableDeleteActions = false;

  //#endregion

  //#region Authorization

  $scope.hasCreateAccess = false;
  $scope.hasDeleteAccess = false;
  $scope.hasEditAccess = false;

  //TODO Set Authorization Abbreviation to correct settings
  // For now use patient, other matrixes can be substituted later
  //soar-per-perdem-add
  //soar-per-perdem-delete
  //soar-per-perdem-modify
  //soar-per-perdem-view
  ctrl.$onInit = function () {
    featureFlagService.getOnce$(fuseFlag.ShowScheduleV2).subscribe((value) => {
      $scope.linkToScheduleV2 = value;
    });
    featureFlagService.getOnce$(fuseFlag.ShowScheduleV2Alt).subscribe((value) => {
      if (!$scope.linkToScheduleV2) { $scope.linkToScheduleV2 = value }
    });
  }
  $scope.authCreateAccess = function () {
    return patSecurityService.IsAuthorizedByAbbreviation('soar-per-perdem-add');
  };

  $scope.authDeleteAccess = function () {
    return patSecurityService.IsAuthorizedByAbbreviation(
      'soar-per-perdem-delete'
    );
  };

  $scope.authEditAccess = function () {
    return patSecurityService.IsAuthorizedByAbbreviation(
      'soar-per-perdem-modify'
    );
  };

  $scope.authViewAccess = function () {
    return patSecurityService.IsAuthorizedByAbbreviation(
      'soar-per-perdem-view'
    );
  };

  $scope.authAccess = function () {
    if (!$scope.authViewAccess()) {
      toastrFactory.error(
        localize.getLocalizedString(
          'User is not authorized to access this area.'
        ),
        localize.getLocalizedString('Not Authorized')
      );
      event.preventDefault();
      $location.path('/');
    } else {
      $scope.hasCreateAccess = $scope.authCreateAccess();
      $scope.hasDeleteAccess = $scope.authDeleteAccess();
      $scope.hasEditAccess = $scope.authEditAccess();
    }
  };
  $scope.authAccess();

  //#endregion

  //#region   load Providers

  $scope.getProviders = function () {
    $scope.loadingProviders = true;
    usersFactory.Users().then(function (res) {
      $scope.providers = res.Value;
      $scope.loadingProviders = false;
      ctrl.addProviderNameToList();
      $scope.$broadcast('providers:loaded', $scope.providers);
    });
  };

  ctrl.addProviderNameToList = function () {
    angular.forEach($scope.chartLedgerServices, function (chartLedgerService) {
      chartLedgerService.ProviderName = usersFactory.UserNameUnescaped(
        chartLedgerService.ProviderId
      );
    });
  };

  //#endregion

  //#region   load Service Codes

  /**
   * Get service codes.
   *
   * @returns {angular.IPromise}
   */
  $scope.getServiceCodes = function () {
    $scope.loadingServiceCodes = true;
    return referenceDataService
      .getData(referenceDataService.entityNames.serviceCodes)
      .then(function (serviceCodes) {
        $scope.serviceCodes = serviceCodes;
        $scope.addServiceCodesToList();
        $scope.loadingServiceCodes = false;
        return serviceCodes;
      });
  };

  $scope.addServiceCodesToList = function () {
    _.forEach($scope.chartLedgerServices, function (chartLedgerService) {
      ctrl.addServiceCodesToItem(chartLedgerService);
    });
  };

  ctrl.addServiceCodesToItem = function (chartLedgerService) {
    if (chartLedgerService.ServiceCodeId) {
      var serviceCode = _.find($scope.serviceCodes, {
        ServiceCodeId: chartLedgerService.ServiceCodeId,
      });
      if (serviceCode) {
        chartLedgerService.Code = serviceCode.Code;
        chartLedgerService.AffectedAreaId = serviceCode.AffectedAreaId;
      }
    }
  };

  //#endregion

  //#region ServiceTransactionStatus

  $scope.getServiceTransactionStatuses = function () {
    staticData.ServiceTransactionStatuses().then(function (res) {
      $scope.serviceTransactionStatuses = res.Value;
      ctrl.addServiceTransactionStatus();
    });
  };

  // set the provider name based on provider type id
  ctrl.getServiceTransactionStatusName = function (statusId) {
    if (statusId) {
      var status = $filter('filter')($scope.serviceTransactionStatuses, {
        Id: statusId,
      });
      if (status && status[0]) {
        return status[0].Name;
      }
    }
    return '';
    };

  $scope.setRowControlVisibility = function () {

      //This method was created because we found that someone can edit a service on the ledger
      // that is in a Completed, Rejected, Referred, or Referred Completed state and is part of a Completed
      // treatment plan, which is not allowed. This will get triggered each time the list that feeds the ledger changes.

    if ($scope.chartLedgerServices && $scope.chartLedgerServices.length > 0) {

        patientServices.TreatmentPlans.getTreatmentPlansWithServicesByPersonId({
            Id: $scope.personId,
        }).$promise.then(function (res) {

            var patientTreatmentPlans = res.Value;

            for (var clsIndex = 0, length = $scope.chartLedgerServices.length; clsIndex < length; clsIndex++) {

                $scope.chartLedgerServices[clsIndex].$ShowLedgerRowEditControl = true;

                if ($scope.chartLedgerServices[clsIndex].StatusId == 4) {
                    $scope.chartLedgerServices[clsIndex].$ShowLedgerRowEditControl = false;
                    continue;
                }

                if (!res || !res.Value || !res.Value[0]) {
                    continue;
                }

                var treatmentPlanCompleted = false;

                for (var outerIndex = 0, outerTreatmentPlanLength = patientTreatmentPlans.length; outerIndex < outerTreatmentPlanLength; outerIndex++) {

                    let tpHeader = patientTreatmentPlans[outerIndex].TreatmentPlanHeader;
                    let matchingTreamentPlan = false;

                    for (var innerIndex = 0, innerTreatmentPlanLength = patientTreatmentPlans[outerIndex].TreatmentPlanServices.length; innerIndex < innerTreatmentPlanLength; innerIndex++) {

                        if (patientTreatmentPlans[outerIndex].TreatmentPlanServices[innerIndex].ServiceTransaction.ServiceTransactionId ==
                            $scope.chartLedgerServices[clsIndex].RecordId) {
                            matchingTreamentPlan = true;
                            break;
                        }
                    }

                    if (matchingTreamentPlan && tpHeader.Status == 'Completed') {
                        treatmentPlanCompleted = true;
                        break;
                    }
                }

                // StatusId == 4 : Completed
                // StatusId == 3 : Rejected
                // StatusId == 2 : Referred
                // StatusId == 8 : Referred Completed
                if (($scope.chartLedgerServices[clsIndex].StatusId == 4 ||
                     $scope.chartLedgerServices[clsIndex].StatusId == 3 ||
                     $scope.chartLedgerServices[clsIndex].StatusId == 2 ||
                     $scope.chartLedgerServices[clsIndex].StatusId == 8) &&
                     treatmentPlanCompleted) {
                    $scope.chartLedgerServices[clsIndex].$ShowLedgerRowEditControl = false;
                    $scope.chartLedgerServices[clsIndex].$AllowDelete = false;
                }
            }
        });

    }
  };

  ctrl.addServiceTransactionStatus = function () {
    angular.forEach($scope.chartLedgerServices, function (chartLedgerService) {
      if (chartLedgerService.StatusId) {
        chartLedgerService.StatusName = ctrl.getServiceTransactionStatusName(
          chartLedgerService.StatusId
        );
      }
      if (
        chartLedgerService.RecordType == 'Condition' ||
        chartLedgerService.RecordType == 'Watch'
      ) {
        chartLedgerService.StatusName =
          chartLedgerService.StatusId === 1 ? 'Present' : 'Resolved';
      }
    });
  };

  //#endregion

  //#region load Conditions

  /**
   * get the condition list.
   *
   */
  $scope.getConditions = function () {
    $scope.loadingConditions = true;

    featureFlagService.getOnce$(fuseFlag.UsePracticeApiForConditions).subscribe(value => {
      if (value) {
        conditionsService.getAll()
          .then(conditions => {
            $scope.conditions = conditions;

            ctrl.addConditionDescriptionToList();
            $scope.$broadcast('conditions:loaded', $scope.conditions);
            $scope.loadingConditions = false;
          });
      } else {
        referenceDataService
          .getData(referenceDataService.entityNames.conditions)
          .then(function (conditions) {
            $scope.conditions = conditions;

            ctrl.addConditionDescriptionToList();
            $scope.$broadcast('conditions:loaded', $scope.conditions);
            $scope.loadingConditions = false;
          });
      }
    });
  };

  // get the condition description based on condition id
  ctrl.addConditionInfoToItem = function (chartLedgerService) {
    var conditionId = chartLedgerService.ConditionId;
    if (conditionId) {
      var condition = $filter('filter')($scope.conditions, {
        ConditionId: conditionId,
      });
      if (condition && condition[0]) {
        chartLedgerService.Description = condition[0].Description;
        chartLedgerService.AffectedAreaId = condition[0].AffectedAreaId;
      }
    }
    return '';
  };

  // if this is a condition record, get the condition description
  ctrl.addConditionDescriptionToList = function () {
    angular.forEach($scope.chartLedgerServices, function (chartLedgerService) {
      if (chartLedgerService.ConditionId != null) {
        ctrl.addConditionInfoToItem(chartLedgerService);
      }
    });
  };

  //#endregion

  // watch selection
  $scope.$watch(
    'selection',
    function (nv, ov) {
      if ($scope.selection && $scope.selection.type == 'tooth') {
      }
    },
    true
  );

  //#region ChartLedgerServices to join the different service sets

  // load planned services, conditions to a common object
  $scope.chartLedgerService = {
    PatientId: null,
    RecordId: null,
    RecordType: null,
    ServiceCodeId: null,
    Description: null,
    CreationDate: new Date(),
    StatusId: null,
    StatusName: null,
    AppointmentId: null,
    ProviderId: null,
    ProviderName: null,
    Surfaces: null,
    Tooth: null,
    Fee: null,
    ConditionId: null,
    Note: null,
    AffectedAreaId: null,
    AppointmentDate: new Date(),
  };

  // load a planned service to ChartLedgerService
  this.loadServiceTransactionToChartLedgerService = function (
    serviceTransaction
  ) {
    var chartLedgerService = angular.copy($scope.chartLedgerService);

      if (serviceTransaction != null) {
      chartLedgerService.PatientId = serviceTransaction.PersonId;
      chartLedgerService.RecordId = serviceTransaction.ServiceTransactionId;
      chartLedgerService.ServiceCodeId = serviceTransaction.ServiceCodeId;
      chartLedgerService.CreationDate = serviceTransaction.DateEntered;
      chartLedgerService.Description = serviceTransaction.Description;
      chartLedgerService.RecordType = 'ServiceTransaction';
      chartLedgerService.StatusId =
        serviceTransaction.ServiceTransactionStatusId;
      chartLedgerService.AppointmentId = serviceTransaction.AppointmentId;
      chartLedgerService.ProviderId = serviceTransaction.ProviderUserId;
      chartLedgerService.Surfaces = serviceTransaction.Surfaces.join('');
      chartLedgerService.Tooth = serviceTransaction.Tooth;
      chartLedgerService.Fee = serviceTransaction.Fee;
      chartLedgerService.AppointmentDate = serviceTransaction.AppointmentDate;
    }
    return chartLedgerService;
  };

  // load a patient condition record to ChartLedgerService
  this.loadConditionToChartLedgerService = function (patientCondition) {
    var chartLedgerService = angular.copy($scope.chartLedgerService);
    if (patientCondition != null) {
      chartLedgerService.PatientId = patientCondition.PatientId;
      chartLedgerService.RecordId = patientCondition.PatientConditionId;
      chartLedgerService.CreationDate = patientCondition.ConditionDate;
      chartLedgerService.StatusName = 'Condition';
      chartLedgerService.RecordType = 'Condition';
      chartLedgerService.ProviderId = patientCondition.ProviderId;
      chartLedgerService.Surfaces = patientCondition.Surfaces.join('');
      chartLedgerService.Tooth = patientCondition.Tooth;
      chartLedgerService.ConditionIsActive = patientCondition.IsActive;
      chartLedgerService.ConditionId = patientCondition.ConditionId;
    }
    return chartLedgerService;
  };

  //#endregion

  // #region - Sorting

  // scope variable that holds ordering details
  $scope.orderBy = {
    field: 'CreationDate',
    asc: false,
  };

  // function to apply orderBy functionality
  $scope.changeSortingForGrid = function (field) {
    var asc = $scope.orderBy.field === field ? !$scope.orderBy.asc : true;
    $scope.orderBy = { field: field, asc: asc };
  };

  // #endregion

  // #region - Filtering

  // objects used for filtering
  $scope.filteredServices = $scope.chartLedgerServices;
  ctrl.fieldsToFilterOn = [
    'CreationDate',
    'ProviderName',
    'Description',
    'Code',
    'Tooth',
    'StatusName',
    'Fee',
    'AppointmentId',
    'AppointmentDate',
  ];
  $scope.filterBy = '';

  // contains filter
  $scope.servicesFilter = function (item) {
    var result = false;
    // remove any dashes in scope property
    var filter = $scope.filterBy.replace(/-/g, '');
    filter = filter.toLowerCase();
    if (filter.length === 0) {
      result = true;
    } else {
      // looping through the fieldsToFilterOn array, as soon as we find a match in one of the object's fields, set result to true
      _.forEach(ctrl.fieldsToFilterOn, function (field) {
        if (field == 'CreationDate') {
          var dateField = $filter('date')(item[field], 'MM/dd/yy');
          if (!result && dateField && dateField.indexOf(filter) !== -1) {
            result = true;
          }
        } else if (
          !result &&
          item[field] &&
          item[field].toLowerCase().indexOf(filter) !== -1
        ) {
          result = true;
        }
      });
    }
    return result;
  };

  $scope.showDeleted = false;
  $scope.showDeletedToggle = function () {
    $scope.showDeleted = !$scope.showDeleted;
  };

  $scope.filterByDeleted = function (chartLedgerService) {
    if ($scope.showDeleted) {
      return true;
    } else if (chartLedgerService.IsDeleted) {
      return false;
    } else {
      return true;
    }
  };

  // #endregion

  //#region add service transaction modal

  // create modal dialog
  $scope.createServiceTransactions = function () {
    var selectedTooth = null;
    //if ($scope.selection.type == 'tooth') {
    //    selectedTooth = $scope.selection.position;
    //}
    $scope.serviceTransactions = [];
    if ($scope.modalIsOpen == false) {
      $scope.modalIsOpen = true;
      var modalInstance = modalFactory.Modal({
        templateUrl:
          'App/Patient/patient-services/patient-services-crud/patient-services-crud.html',
        controller: 'PatientServiceTransactionCrudController',
        windowClass: 'modal-80',
        backdrop: 'static',
        amfa: 'soar-clin-cpsvc-add',
        resolve: {
          serviceTransactions: function () {
            return $scope.serviceTransactions;
          },
          tooth: function () {
            return selectedTooth;
          },
          personId: function () {
            return $scope.personId;
          },
          serviceTransactionId: function () {
            return null;
          },
        },
      });
      modalInstance.result.then($scope.serviceTransactionCreated);
    }
  };

  // push new planned services to combined list (must handle a list)
  $scope.serviceTransactionCreated = function (newServiceTransactions) {
    $scope.modalIsOpen = false;
    if (newServiceTransactions) {
      _.forEach(newServiceTransactions, function (serviceTransaction) {
        // load the planned services to the chartLedgerService dto
        var chartLedgerService = ctrl.loadServiceTransactionToChartLedgerService(
          serviceTransaction
        );
        // set the provider name, service code info, and status info
        chartLedgerService.ProviderName = usersFactory.UserNameUnescaped(
          chartLedgerService.ProviderId
        );
        // add service code info
        ctrl.addServiceCodesToItem(chartLedgerService);
        // add status name
        chartLedgerService.StatusName = ctrl.getServiceTransactionStatusName(
          chartLedgerService.StatusId
        );
        // add to list
        $scope.chartLedgerServices.push(chartLedgerService);
      });
    }
  };

  //#endregion

  //#region edit planned service modal

  $scope.editService = function (chartLedgerService) {
    chartLedgerService.ActionsVisible = false;
    switch (chartLedgerService.RecordType) {
      case 'ServiceTransaction':
        $scope.serviceTransactions = [];
        $scope.getServiceTransaction(chartLedgerService);
        break;
      case 'Watch':
        // $scope.viewPatientWatch(chartLedgerService.RecordId, false);
        break;
      case 'Condition':
        patientOdontogramFactory.setselectedChartButton(
          chartLedgerService.ConditionId
        );
        patientConditionsFactory.setActivePatientConditionId(
          chartLedgerService.RecordId
        );
        $scope.openToothCtrls(
          'Condition',
          chartLedgerService.Description,
          false,
          null,
          null
        );
        break;
    }
  };

  ctrl.getLoggedInLocation = function () {
    // retrieve the location that the user is currently logged into (the location dropdown in the header)
    var loggedInLocation = JSON.parse(sessionStorage.getItem('userLocation'));
    return loggedInLocation.id;
  };

  ctrl.appointmentEditModalData = null;
  
  // edit an existing appointment from chart ledger
  $scope.editAppointmentFromModal = function editAppointmentFromModal(
    appointmentId,
    appointmentDate
  ) {
    let appt = {
      AppointmentId: appointmentId,
    };
    if ($scope.linkToScheduleV2) {
          schedulingMFENavigator.navigateToAppointmentModal({
            patientId: $scope.personId,
            locationId: ctrl.getLoggedInLocation(),
            id: appointmentId
          });
          return;
        }

    appointmentViewDataLoadingService
      .getViewData(appt, false, 'appointment-view:update-appointment')
      .then(
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

  $scope.$on(
    'appointment-view:update-appointment',
    function (event, appointment) {
      $rootScope.$broadcast('appointment:update-appointment', appointment);
      $rootScope.$broadcast('soar:chart-services-reload-ledger');
    }
  );

  // edited appointment save success
  ctrl.appointmentSaved = function (updatedAppointment) {
    $rootScope.$broadcast('appointment:update-appointment', updatedAppointment);
    $rootScope.$broadcast('soar:chart-services-reload-ledger');
  };

  //#region deletion

  $scope.deleteService = function (chartLedgerService) {
    ctrl.itemSelectedForDeletion = chartLedgerService;

    switch (chartLedgerService.RecordType) {
      case 'ServiceTransaction':
        $scope.deleteServiceTransaction(chartLedgerService);
        break;
      case 'Condition':
        ctrl.delText = 'condition';
        ctrl.delPropertyToDisplay = 'Description';
        ctrl.delParam = 'ConditionId';
        ctrl.delService = 'Conditions';
        ctrl.displayConfirmationModal();
        break;
    }
  };

  // generic - display confirmation modal function
  ctrl.displayConfirmationModal = function () {
    modalFactory
      .DeleteModal(
        ctrl.delText,
        ctrl.itemSelectedForDeletion[ctrl.delPropertyToDisplay]
      )
      .then(ctrl.confirmDelete, ctrl.cancelDelete);
  };

  // generic - confirm deletion function
  ctrl.confirmDelete = function () {
    var params = { Id: ctrl.itemSelectedForDeletion.PatientId };
    params[ctrl.delParam] = ctrl.itemSelectedForDeletion.RecordId;
    patientServices[ctrl.delService].delete(
      params,
      ctrl.deleteSuccess,
      ctrl.deleteFailure
    );
  };

  // generic - cancel deletion function
  ctrl.cancelDelete = function () {
    ctrl.itemSelectedForDeletion = null;
  };

  // generic - successful delete callback
  ctrl.deleteSuccess = function () {
      var oldValue = ctrl.itemSelectedForDeletion;
    $scope.chartLedgerServices.splice(
      _.find($scope.chartLedgerServices, {
        RecordId: ctrl.itemSelectedForDeletion.RecordId,
      }),
      1
    );
    ctrl.itemSelectedForDeletion = null;
    toastrFactory.success(
      localize.getLocalizedString('Delete successful.', 'Success')
    );
    $rootScope.$broadcast('chart-ledger:patient-condition-deleted', oldValue);
    $scope.reloadingChartLedger = true;
    $scope.$parent.getPatientChartLedgerServices(true);
  };

  // generic - failed delete callback
  ctrl.deleteFailure = function () {
    ctrl.itemSelectedForDeletion = null;
    ctrl.delText = localize.getLocalizedString(ctrl.delText);
    toastrFactory.error(
      localize.getLocalizedString(
        'Failed to delete the {0}. Please try again.',
        [ctrl.delText]
      ),
      localize.getLocalizedString('Server Error')
    );
  };

  //#endregion

  // get ServiceTransaction by id...TODO this should be moved to ServiceTransactionCrud
  $scope.getServiceTransaction = function (chartLedgerService) {
    patientServices.ServiceTransactions.get(
      {
        Id: chartLedgerService.PatientId,
        servicetransactionid: chartLedgerService.RecordId,
      },
      $scope.serviceTransactionGetSuccess,
      $scope.serviceTransactionGetFailure
    );
  };

  $scope.serviceTransactionGetSuccess = function (res) {
    var serviceTransaction = res.Value;
    $scope.serviceTransaction = serviceTransaction;
    // service code selector needs the serviceCode info
    var serviceCode = $filter('filter')($scope.serviceCodes, {
      ServiceCodeId: serviceTransaction.ServiceCodeId,
    });
    if (serviceCode && serviceCode[0]) {
      serviceTransaction.Code = serviceCode[0].Code;
      serviceTransaction.AffectedAreaId = serviceCode[0].AffectedAreaId;
    }
    $scope.serviceTransactions.push(serviceTransaction);
    $scope.initializeToothControls(serviceTransaction);
    //$scope.editServiceTransaction(serviceTransaction.ServiceTransactionId);
  };

  $scope.$on('soar:chart-services-reload-ledger', function (e) {
      $scope.closeKendoWindow($scope.toothCtrls);
      $scope.closeKendoWindow($scope.patientConditionCreateUpdate);
  });

  $scope.$on('close-tooth-window', function (e) {
      $scope.closeKendoWindow($scope.toothCtrls);
  });

  $scope.$on('close-patient-condition-create-update', function (e) {
      $scope.closeKendoWindow($scope.patientConditionCreateUpdate);
  });

  $scope.$watch('toothCtrlsOpen', function (nv) {
    if (nv === false) {
        $scope.closeKendoWindow($scope.toothCtrls);
        $scope.closeKendoWindow($scope.patientConditionCreateUpdate);
    }
  });

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
        title: 'Edit ' + mode + ' - ' + title,
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
          '" isedit="' +
          true +
          '"></multi-location-proposed-service>'
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
        title: 'Edit ' + mode + ' - ' + title,
        modal: true,
      });
      $scope.patientConditionCreateUpdate.content(
        '<patient-condition-create-update editing="true"></patient-condition-create-update>'
      );
      $scope.patientConditionCreateUpdate.open();
    }
  };

    $scope.closeKendoWindow = function (kendoWindow) {
        kendoWindow.setOptions({
            title: '',
        });
        kendoWindow.close();
    }

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

  $scope.serviceTransactionGetFailure = function () {
    toastrFactory.error(
      localize.getLocalizedString('.'),
      localize.getLocalizedString('Server Error')
    );
  };

  // add updated service transaction to list
  $scope.serviceTransactionsUpdated = function (serviceTransactionsToUpdate) {
    $scope.modalIsOpen = false;
    // business logic on the domain side determines how to display surfaces, just reloading the list for now
    // so that we don't have to duplicate that logic here, eventually we will either get back a chart ledger
    // object on save or we will have a get by id that we can call to refresh the list
    if (serviceTransactionsToUpdate) {
      $scope.reloadingChartLedger = true;
      $scope.$parent.getPatientChartLedgerServices(true);
      $rootScope.$broadcast('soar:tx-plan-services-changed', null, true);
    }
  };

  $scope.deleteServiceTransaction = function (chartLedgerService) {
    if (chartLedgerService.StatusId !== 4) {
      $scope.selectedServiceTransaction = chartLedgerService;
      var cautionMessage =
        'This service will be deleted from all appointments and treatment plans. Any open predeterminations will be closed.  ';
      if (chartLedgerService.StatusId === 6) {
        cautionMessage = '';
      }

      //get claims while the user interacts with a warning modal to avoid loading spinners
      ctrl.claimsPromise = patientServices.Claim.getClaimsByServiceTransaction({
        serviceTransactionId: $scope.selectedServiceTransaction.RecordId,
        ClaimType: 2,
      });
      modalFactory
        .DeleteModal(
          'Planned Service',
          $scope.selectedServiceTransaction.Description,
          true,
          cautionMessage
        )
        .then($scope.confirmDeletion, $scope.cancelDelete);
    }
  };
  $scope.confirmDeletion = function () {
    $scope.disableDeleteActions = true;
    ctrl.claimsPromise.$promise.then(function (res) {
      ctrl.checkForPredeterminationInProcess(res);
      // if we have in process predeterminations we can't delete the service
      if (!ctrl.predInProcess) {
        if (ctrl.hasPred) {
          // if we have non in process predeterminations attached to the service we close them first then
          // delete the service
          ctrl
            .closePredeterminations(ctrl.predeterminationsToClose)
            .then(function (res) {
              ctrl.deleteService();
            });
        } else {
          // if we don't have predeterminations attached to the service just delete the service
          ctrl.deleteService();
        }
      } else {
        //cannot delete in process predeterminations
        ctrl.predInProcessAlert();
        $scope.disableDeleteActions = false;
      }
    });
  };

  ctrl.deleteService = function () {
    var params = {};
    params.Id = $scope.selectedServiceTransaction.PatientId;
    params.servicetransactionid = $scope.selectedServiceTransaction.RecordId;

    patientServices.ServiceTransactions.deleteFromLedger(
      params,
      $scope.serviceTransactionDeleteSuccess,
      $scope.serviceTransactionDeleteFailed
    );
  };

  ctrl.checkForPredeterminationInProcess = function (res) {
    ctrl.hasPred = false;
    ctrl.predInProcess = false;

    ctrl.predeterminationsToClose = res.Value;
    //tracks predeterminations that WE close
    ctrl.closedPredeterminations = 0;
    //remove predeterminations that are already closed
    for (var i = 0; i < ctrl.predeterminationsToClose.length; i++) {
      if (ctrl.predeterminationsToClose[i].IsClosed) {
        ctrl.predeterminationsToClose.splice(i, 1);
        i--;
      }
    }

    if (res.Value.length) {
      ctrl.hasPred = true;
      //returns undefined if no in process predeterminations
      ctrl.predInProcess = _.find(res.Value, function (predetermination) {
        if (predetermination.Status == 4) {
          return true;
        }
      });
    }
  };

  ctrl.predInProcessAlert = function () {
    var message = localize.getLocalizedString(
      'This service is on an in-process predetermination and cannot be deleted'
    );
    var title = localize.getLocalizedString('Confirm');
    var buttonContinue = localize.getLocalizedString('Ok');
    modalFactory.ConfirmModal(title, message, buttonContinue);
  };

  // This method closes any predeterminations that are not in process
  // prior to deleting a service
  ctrl.closePredeterminations = function (predeterminations) {
    var deferred = $q.defer();
    var promises = [];
    predeterminations.forEach(function (predetermination) {
      var closePredeterminationObject = {
        ClaimId: predetermination.ClaimId,
        Note: null,
        NoInsurancePayment: true,
        RecreateClaim: false,
        CloseClaimAdjustment: null,
        UpdateServiceTransactions: false,
        disableCancel: true,
      };
      promises.push(
        patientServices.Predetermination.Close(closePredeterminationObject)
          .$promise
      );
    });
    $q.all(promises).then(
      function (res) {
        deferred.resolve(res);
      },
      function () {
        toastrFactory.error(
          localize.getLocalizedString('An error has occurred while {0}', [
            'closing the predetermination',
          ]),
          'Error'
        );
        //deferred.reject();
        deferred.resolve();
      }
    );
    return deferred.promise;
  };

  $scope.serviceTransactionDeleteSuccess = function () {
    var tempService = $scope.selectedServiceTransaction;
    $scope.selectedServiceTransaction.IsDeleted = true;
    // clear the cache in order to refresh the treatment plans
    patCacheFactory.ClearCache(
      patCacheFactory.GetCache('PatientTreatmentPlans')
    );
    $rootScope.$broadcast('soar:tx-plan-services-changed', null, true);
    $scope.selectedServiceTransaction = null;
    toastrFactory.success(
      localize.getLocalizedString('Delete successful.', 'Success')
    );
    $rootScope.$broadcast(
      'chart-ledger:service-transaction-deleted',
      tempService
    );

    $scope.reloadingChartLedger = true;
    $scope.$parent.getPatientChartLedgerServices(true);
  };

  $scope.serviceTransactionDeleteFailed = function () {
    $scope.selectedServiceTransaction = null;
    toastrFactory.error(
      localize.getLocalizedString(
        'Failed to delete the {0}. Please try again.',
        ['Planned Service']
      ),
      localize.getLocalizedString('Server Error')
    );
  };

  //#endregion

  ctrl.conditionGetSuccess = function (res) {
    if (res && res.Value) {
      var patientCondition = res.Value;
      var teeth = [{ toothId: patientCondition.Tooth }];
      if ($scope.modalIsOpen == false) {
        $scope.modalIsOpen = true;
        var modalInstance = modalFactory.Modal({
          templateUrl:
            'App/Patient/patient-conditions/patient-conditions-crud/patient-conditions-crud.html',
          controller: 'PatientConditionCrudController',
          windowClass: 'addCond',
          backdrop: 'static',
          amfa: 'soar-clin-ccond-edit',
          resolve: {
            teeth: function () {
              return teeth;
            },
            personId: function () {
              return $scope.personId;
            },
            patientInfo: function () {
              return $scope.patientInfo;
            },
            providers: function () {
              return $scope.providers;
            },
            conditions: function () {
              return $scope.conditions;
            },
            patientCondition: function () {
              return patientCondition;
            },
            selectedConditionData: function () {
              return null;
            },
          },
        });
        modalInstance.result.then($scope.patientConditionCreated);
      }
    }
  };

  ctrl.conditionGetFailure = function (error) {
    toastrFactory.error(
      localize.getLocalizedString(
        'Failed to retrieve the condition. Refresh the page to try again.'
      ),
      localize.getLocalizedString('Error')
    );
  };

  ctrl.conditionsGetSetup = function () {
    return [
      {
        Call: patientServices.Conditions.get,
        Params: { Id: $scope.personId, ConditionId: ctrl.selectedConditionId },
        OnSuccess: ctrl.conditionGetSuccess,
        OnError: ctrl.conditionGetFailure,
      },
    ];
  };

  //#region edit PatientCondition modal
  $scope.openConditionCrudModal = function (id) {
    ctrl.selectedConditionId = id;
    modalFactory.LoadingModal(ctrl.conditionsGetSetup).then(ctrl.doneLoading);
  };

  // push new conditions to chartLedgerServices
  $scope.patientConditionCreated = function (newPatientConditions) {
    $scope.modalIsOpen = false;
    // business logic on the domain side determines how to display surfaces, just reloading the list for now
    // so that we don't have to duplicate that logic here, eventually we will either get back a chart ledger
    // object on save or we will have a get by id that we can call to refresh the list
    if (newPatientConditions) {
      $scope.reloadingChartLedger = true;
        $scope.$parent.getPatientChartLedgerServices(true);
    }
    /*
        angular.forEach(newPatientConditions, function (npc) {
            var chartLedgerService = ctrl.loadConditionToChartLedgerService(npc);
            chartLedgerService.ProviderName = usersFactory.UserName(npc.ProviderId);
            chartLedgerService.Description = ctrl.getConditionDescription(npc.ConditionId);
            $scope.chartLedgerServices.push(chartLedgerService);
        });
        */
  };

  //#endregion

  //#region Watch

  //#region Add PatientWatch

  // filter chartLedgerServices for watch(s) only
  ctrl.getPatientWatchList = function () {
    var watches = $filter('filter')($scope.chartLedgerServices, {
      RecordType: 'Watch',
    });
    if (watches && watches.length > 0) {
      $scope.patientWatches = watches;
    }
  };
  ctrl.getPatientWatchList();

  // load a patient watch record to ChartLedgerService
  this.loadPatientWatchToChartLedgerService = function (patientWatch) {
    var chartLedgerService = angular.copy($scope.chartLedgerService);
    if (patientWatch != null) {
      chartLedgerService.PatientId = patientWatch.PatientId;
      chartLedgerService.RecordId = patientWatch.WatchId;
      chartLedgerService.CreationDate = patientWatch.Date;
      chartLedgerService.StatusName = 'Watch';
      chartLedgerService.RecordType = 'Watch';
      chartLedgerService.ProviderId = patientWatch.ProviderId;
      chartLedgerService.Surfaces = patientWatch.Surfaces.join('');
      chartLedgerService.Tooth = patientWatch.ToothNumber;
      chartLedgerService.Note = patientWatch.Note;
    }
    return chartLedgerService;
  };

  $scope.createPatientWatch = function () {
    ctrl.getPatientWatchList();

    var selectedTooth = null;
    if ($scope.selection && $scope.selection.type == 'tooth') {
      selectedTooth = $scope.selection.toothId;
    }
    if ($scope.modalIsOpen == false) {
      $scope.modalIsOpen = true;
      var modalInstance = modalFactory.Modal({
        templateUrl:
          'App/Patient/patient-watch/patient-watch-crud/patient-watch-crud.html',
        controller: 'PatientWatchCrudController',
        windowClass: 'modal-65',
        backdrop: 'static',
        amfa: 'soar-clin-cwtoo-add',
        resolve: {
          viewOnly: function () {
            return false;
          },
          tooth: function () {
            return selectedTooth;
          },
          personId: function () {
            return $scope.personId;
          },
          providers: function () {
            return $scope.providers;
          },
          patientWatchId: function () {
            return null;
          },
          patientWatches: function () {
            return $scope.patientWatches;
          },
        },
      });
      modalInstance.result.then($scope.patientWatchCreated);
    }
  };

  // push new watch tooth to chartLedgerServices
  $scope.patientWatchCreated = function (newPatientWatch) {
    $scope.modalIsOpen = false;
    if (newPatientWatch) {
      var chartLedgerService = ctrl.loadPatientWatchToChartLedgerService(
        newPatientWatch
      );
      chartLedgerService.ProviderName = usersFactory.UserNameUnescaped(
        chartLedgerService.ProviderId
      );
        $scope.chartLedgerServices.push(chartLedgerService);
    }
  };

  //#region View or Edit Patient Watch
  $scope.viewPatientWatch = function (watchId, viewOnly) {
    ctrl.getPatientWatchList();
    var selectedTooth = null;
    if ($scope.selection && $scope.selection.type == 'tooth') {
      selectedTooth = $scope.selection.toothId;
    }
    // instantiate add/edit modal and pass data to it, etc.
    if ($scope.modalIsOpen == false) {
      $scope.modalIsOpen = true;
      var modalInstance = modalFactory.Modal({
        templateUrl:
          'App/Patient/patient-watch/patient-watch-crud/patient-watch-crud.html',
        controller: 'PatientWatchCrudController',
        windowClass: 'modal-65',
        backdrop: 'static',
        amfa: viewOnly ? 'soar-clin-cwtoo-view' : 'soar-clin-cwtoo-edit',
        resolve: {
          viewOnly: function () {
            return viewOnly;
          },
          tooth: function () {
            return selectedTooth;
          },
          personId: function () {
            return $scope.personId;
          },
          providers: function () {
            return $scope.providers;
          },
          patientWatchId: function () {
            return watchId;
          },
          patientWatches: function () {
            return $scope.patientWatches;
          },
        },
      });
      modalInstance.result.then($scope.patientWatchClosed);
    }
  };

  $scope.patientWatchClosed = function (patientWatch) {
    $scope.modalIsOpen = false;
    if (patientWatch) {
      var chartLedgerService = ctrl.loadPatientWatchToChartLedgerService(
        patientWatch
      );
      chartLedgerService.ProviderName = usersFactory.UserNameUnescaped(
        chartLedgerService.ProviderId
      );
      $scope.chartLedgerServices.splice(
        listHelper.findIndexByFieldValue(
          $scope.chartLedgerServices,
          'RecordId',
          chartLedgerService.RecordId
        ),
        1
      );
        $scope.chartLedgerServices.push(chartLedgerService);
    }
  };

  //#endregion

  //#region Delete Patient Watch

  $scope.selectedWatch = null;

  $scope.deleteWatch = function (patientWatch) {
    $scope.selectedWatch = patientWatch;
    modalFactory
      .DeleteModal('watch on tooth', $scope.selectedWatch.Tooth)
      .then($scope.confirmWatchDelete, $scope.cancelDelete);
  };

  $scope.confirmWatchDelete = function () {
    patientServices.PatientWatch.delete(
      {
        Id: $scope.selectedWatch.PatientId,
        watchId: $scope.selectedWatch.RecordId,
      },
      ctrl.patientWatchDeleteSuccess,
      ctrl.patientWatchDeleteFailed
    );
  };

  ctrl.patientWatchDeleteSuccess = function () {
    $scope.chartLedgerServices.splice(
      listHelper.findIndexByFieldValue(
        $scope.chartLedgerServices,
        'RecordId',
        $scope.selectedWatch.RecordId
      ),
      1
    );
    if ($scope.patientWatches && $scope.patientWatches.length > 0) {
      $scope.patientWatches.splice(
        listHelper.findIndexByFieldValue(
          $scope.patientWatches,
          'RecordId',
          $scope.selectedWatch.RecordId
        ),
        1
      );
    }
    $scope.selectedWatch = null;
    toastrFactory.success(
      localize.getLocalizedString('Delete successful.', 'Success')
    );
  };

  ctrl.patientWatchDeleteFailed = function () {
    $scope.selectedWatch = null;
    toastrFactory.error(
      localize.getLocalizedString(
        'Failed to delete the {0}. Please try again.',
        ['watch']
      ),
      localize.getLocalizedString('Server Error')
    );
  };

  // dynamically adding amfas for authorization on action controls in ledger grid
   ctrl.getAMFAs = function () {
    angular.forEach($scope.chartLedgerServices, function (cls) {
      switch (cls.RecordType) {
        // add more of these as new record types and controls are added to the ledger
        case 'Condition':
          cls.editAMFA = 'soar-clin-ccond-edit';
          cls.deleteAMFA = 'soar-clin-ccond-delete';
          break;
        case 'Watch':
          cls.editAMFA = 'soar-clin-cwtoo-edit';
          cls.deleteAMFA = 'soar-clin-cwtoo-delete';
          break;
        case 'ServiceTransaction':
          cls.editAMFA = 'soar-clin-cpsvc-edit';
          cls.deleteAMFA = 'soar-clin-cpsvc-delete';
          break;
        default:
          cls.editAMFA = '';
          cls.deleteAMFA = '';
      }
    });
  };

  //#endregion

  // encapsulating these functions
  ctrl.callIntializerFunctions = function () {
    $scope.getServiceCodes();
    $scope.getProviders();
    $scope.getServiceTransactionStatuses();
    $scope.getConditions();
    ctrl.getAMFAs();
  };

  // watch chartLedgerServices
  $scope.initialized = false;
  $scope.$watch(
    'chartLedgerServices',
    function (nv, ov) {
        if (nv && nv.length > 0 && nv !== ov) {
        // edit and delete actions must be recalculated each time list changes
        ctrl.setAllowEdit();
        ctrl.setAllowDelete();
        $scope.setRowControlVisibility();
      }
      if (
        ($scope.initialized === false ||
          $scope.reloadingChartLedger === true) &&
        nv
      ) {
        ctrl.callIntializerFunctions();
        $scope.initialized = true;
        $scope.reloadingChartLedger = false;
        $scope.disableDeleteActions = false;
        }
    },
    true
  );

  // watch selection
  $scope.watchToView = null;
  $scope.$watch(
    'watchToView',
    function () {
      if ($scope.watchToView && $scope.watchToView != null) {
        $scope.viewPatientWatch($scope.watchToView, true);
      }
    },
    true
  );

  // broadcasted by parent every time chartledgerServices are retrieved
  $scope.$on(
    'soar:chart-services-retrieved',
    function (event, reloadingChartLedger) {
      $scope.reloadingChartLedger = reloadingChartLedger;
    }
  );

  $scope.$on(
    'soar:chart-ledger-services',
    function (event, chartLedgerServices) {
      $scope.chartLedgerServices = chartLedgerServices;
      ctrl.addServiceTransactionStatus();
      ctrl.addConditionDescriptionToList();
      $scope.getProviders();
    }
  );

  //#endregion

  //#endregion=

  //#region Row Type
  $scope.patLedgerRowType = function (singleCase) {
    if (singleCase.IsDeleted == true) {
      return 'deleted-transaction-display-color';
    }

    return chartColorsService.getChartColor(
      singleCase.RecordType,
      singleCase.StatusId
    );
  };

  //#region Menu Toggle
  $scope.patLedgerMenuToggle = function ($event, i) {
    i.ActionsVisible = !i.ActionsVisible;
    i.orientV = soarAnimation.soarVPos($event.currentTarget);
  };
  //#endregion Menu Toggle

  //#region delete a service

  ctrl.setAllowDelete = function () {
    _.forEach($scope.chartLedgerServices, function (cls) {
      cls.$AllowDelete = true;
      cls.$$SelectedRow = false;
      cls.DeleteButtonTooltip = '';
      switch (cls.RecordType) {
        case 'Condition':
          // for the time being we can only edit services, conditions that are attached to the patient (not duplicates)
          if (cls.PatientId !== $scope.personId) {
            cls.$AllowDelete = false;
            cls.EditButtonTooltip = localize.getLocalizedString(
              'Cannot delete a condition for a duplicate patient.'
            );
          }
          break;
        case 'ServiceTransaction':
          if (cls.StatusId === 4) {
            cls.$AllowDelete = false;
            cls.DeleteButtonTooltip = localize.getLocalizedString(
              'Cannot delete a service transaction with a {0} status.',
              ['Completed']
            );
          }
          if (cls.StatusId === 5) {
            cls.$AllowDelete = false;
            cls.DeleteButtonTooltip = localize.getLocalizedString(
              'Cannot delete a service transaction with a {0} status.',
              ['Pending']
            );
          }

          if (cls.$AllowDelete === true) {
            // get locations from session storage, check if can access service location
            let locations = locationService.getActiveLocations();
            let loc = null;
            for (let i = 0; i < locations.length; i++) {
              if (locations[i].id === cls.LocationId) {
                loc = locations[i];
                break;
              }
            }

            if (
              loc === null ||
              loc === undefined ||
              $scope.authDeleteAccess() === false ||
              $scope.authViewAccess() === false
            ) {
              cls.$AllowDelete = false;
              cls.DeleteButtonTooltip = localize.getLocalizedString(
                'User is not authorized to access this area.'
              );
            }
          }

          // for the time being we can only edit services, conditions that are attached to the patient (not duplicates)
          if (cls.PatientId !== $scope.personId) {
            cls.$AllowDelete = false;
            cls.EditButtonTooltip = localize.getLocalizedString(
              'Cannot delete a service for a duplicate patient.'
            );
          }
          break;
        default:
          cls.$AllowDelete = false;
          break;
      }
    });
  };

  //#endregion

  //#region edit a service

  ctrl.setAllowEdit = function () {
    _.forEach($scope.chartLedgerServices, function (cls) {
      cls.$AllowEdit = true;
      cls.EditButtonTooltip = '';

      switch (cls.RecordType) {
        case 'Condition':
          if ($scope.patientInfo.IsActive !== true) {
            cls.$AllowEdit = false;
            cls.EditButtonTooltip = localize.getLocalizedString(
              'Cannot edit conditions for an inactive patient.'
            );
          }
          // for the time being we can only edit services, conditions that are attached to the patient (not duplicates)
          if (cls.PatientId !== $scope.personId) {
            cls.$AllowEdit = false;
            cls.EditButtonTooltip = localize.getLocalizedString(
              'Cannot edit a condition for a duplicate patient.'
            );
          }
          break;
        case 'ServiceTransaction':
          if ($scope.patientInfo.IsActive === true) {
            if (cls.StatusId === 4) {
              cls.$AllowEdit = false;
              cls.EditButtonTooltip = localize.getLocalizedString(
                'Cannot edit a service transaction with a {0} status.',
                ['Completed']
              );
            }
          } else {
            cls.$AllowEdit = false;
            cls.EditButtonTooltip = localize.getLocalizedString(
              'Cannot edit service transaction for an inactive patient.'
            );
          }
          if (cls.$AllowEdit === true) {
            // get locations from session storage, check if can access service location
            let locations = locationService.getActiveLocations();
            let loc = null;
            for (let i = 0; i < locations.length; i++) {
              if (locations[i].id === cls.LocationId) {
                loc = locations[i];
                break;
              }
            }

            if (
              loc === null ||
              loc === undefined ||
              $scope.authEditAccess() === false ||
              $scope.authViewAccess() === false
            ) {
              cls.$AllowEdit = false;
              cls.EditButtonTooltip = localize.getLocalizedString(
                'User is not authorized to access this area.'
              );
            }
          }
          // for the time being we can only edit services, conditions that are attached to the patient (not duplicates)
          if (cls.PatientId !== $scope.personId) {
            cls.$AllowEdit = false;
            cls.EditButtonTooltip = localize.getLocalizedString(
              'Cannot edit a service for a duplicate patient.'
            );
          }
          break;
        default:
          cls.$AllowEdit = false;
          break;
      }
    });
  };

  //#endregion

  //#region location

  // setting the current location

  // listening for the location change broadcast from the header for updating rooms, etc.
  $scope.$on('patCore:initlocation', function () {
    ctrl.setCurrentLocation();
  });

  ctrl.setCurrentLocation = function () {
    ctrl.currentLocation = locationService.getCurrentLocation();
    // edit and delete actions must be recalculated each time list changes
    ctrl.setAllowEdit();
    ctrl.setAllowDelete();
  };
  ctrl.setCurrentLocation();

  //#endregion

  //#region inactivated patient
  $scope.patientIsInactive = false;
  $scope.$watch('patientInfo', function (nv, ov) {
    if (nv) {
      $scope.patientIsInactive = nv.IsActive;
    }
  });

  ////#endregion

  $scope.editAll = function () {
    ctrl.selectedServiceRecords = [];
    ctrl.selectedConditionRecords = [];

    // are there any selected rows
    $scope.selectedServiceRecords = _.filter(
      $scope.chartLedgerServices,
      function (chartLedgerService) {
        return (
          chartLedgerService.$$SelectedRow === true &&
          chartLedgerService.RecordType == 'ServiceTransaction'
        );
      }
    );

    if (
      $scope.selectedServiceRecords &&
      $scope.selectedServiceRecords.length > 0
    ) {
      var data = {
        serviceList: $scope.selectedServiceRecords,
        patientInfo: $scope.patientInfo,
        height: 375,
        width: 500,
      };

      $scope.showMultiEditModal = true;
      $scope.confirmationRef = multiServiceEditService.open({ data });

      $scope.confirmationModalSubscription = $scope.confirmationRef.events.subscribe(
        events => {
          if (events && events.type) {
            switch (events.type) {
              case 'confirm':
                $scope.confirmationRef.close();
                break;
              case 'close':
                $scope.confirmationRef.close();
                break;
            }
          }
        }
      );
    }
  };

  $scope.deleteAll = function () {
    ctrl.selectedServiceRecords = [];
    ctrl.selectedConditionRecords = [];

    // are there any selected rows
    ctrl.selectedServiceRecords = _.filter(
      $scope.chartLedgerServices,
      function (chartLedgerService) {
        return (
          chartLedgerService.$$SelectedRow === true &&
          chartLedgerService.RecordType == 'ServiceTransaction'
        );
      }
    );

    ctrl.selectedConditionRecords = _.filter(
      $scope.chartLedgerServices,
      function (chartLedgerService) {
        return (
          chartLedgerService.$$SelectedRow === true &&
          chartLedgerService.RecordType == 'Condition'
        );
      }
    );

    // if so, confirm then process deletes
    if (
      ctrl.selectedConditionRecords.length > 0 ||
      ctrl.selectedServiceRecords.length > 0
    ) {
      var cautionMessage =
        'Any selected services will be deleted from all appointments and treatment plans. ' +
        '\r\n\r\n Any open predeterminations on services will be closed. ' +
        '\r\n\r\n Are you sure you want to delete the selected services and conditions?';
      modalFactory
        .ConfirmModal('Deletion', cautionMessage, 'Yes', 'No')
        .then(function () {
          ctrl.processServiceDeletes();
          ctrl.deleteConditions();
        });
    }
  };

  ////#region delete predeterminations

  // create list of ClaimEntityDtos to pass to close api
  ctrl.createClaimEntityDtos = function (predeterminations) {
    let claimEntityDtos = [];
    predeterminations.forEach(function (predetermination) {
      // dont include predetermination that is already closed
      if (predetermination.Status !== 7) {
        let claimEntityDto = {
          ClaimId: predetermination.ClaimId,
          Note: null,
          NoInsurancePayment: true,
          RecreateClaim: false,
          CloseClaimAdjustment: null,
          UpdateServiceTransactions: false,
          disableCancel: true,
        };
        claimEntityDtos.push(claimEntityDto);
      }
    });
    return claimEntityDtos;
  };

  ////#endregion

  ////#region

  // get predeterminations for services, close predeterminations, and delete services
  ctrl.processServiceDeletes = function () {
    if (ctrl.selectedServiceRecords.length > 0) {
      // Get the unique serviceTransactionIds pass a list of serviceTransactionIds to claims and get back list of predeterminations for each
      var serviceTransactionIds = _.map(
        _.uniqBy(ctrl.selectedServiceRecords, service => service.RecordId),
        service => service.RecordId
      );
      patientServices.Predetermination.getClaimsByServiceTransactionIds(
        { claimType: 2 },
        serviceTransactionIds
      ).$promise.then(function (res) {
        let claimEntityDtos = ctrl.createClaimEntityDtos(res.Value);
        // if there are predeterminations delete those first, if not just delete the services
        if (claimEntityDtos.length > 0) {
          patientServices.Predetermination.closeBatch(
            claimEntityDtos
          ).$promise.then(function (res) {
            ctrl.deleteServiceTransactions();
          });
        } else {
          ctrl.deleteServiceTransactions();
        }
      });
    }
  };

  ctrl.deleteServiceTransactions = function () {
    if (ctrl.selectedServiceRecords.length > 0) {
      var serviceTransactionIds = _.map(
        _.uniqBy(ctrl.selectedServiceRecords, service => service.RecordId),
        service => service.RecordId
      );
      patientServices.ServiceTransactions.batchDelete(
        { personId: $scope.personId },
        serviceTransactionIds
      ).$promise.then(
        function (res) {
          ctrl.deleteServiceTransactionsSuccess(res.Value);
          ctrl.messageForFailedServiceTransactionDeletes(res.Value);
        },
        function () {
          toastrFactory.error(
            localize.getLocalizedString(
              'Failed to delete the {0}. Please try again.',
              'selected services'
            ),
            localize.getLocalizedString('Server Error')
          );
        }
      );
    }
  };

  ctrl.messageForFailedServiceTransactionDeletes = function (services) {
    var failedDeletes = services.filter(service => service.FailedMessage !== null);    
    if (failedDeletes.length > 0) {
      var message = 'Failed to delete some services.';
      failedDeletes.forEach(function (service) {
        message += '\n\n Description: ' + service.Description
        if (service.Tooth !== null) 
          message += ' #' + service.Tooth;
        message += ': ' + service.FailedMessage;
      });
      var title = localize.getLocalizedString('Confirm');
      var buttonContinue = localize.getLocalizedString('Ok');
      modalFactory.ConfirmModal(title, message, buttonContinue);
    }
  }

  ctrl.deleteServiceTransactionsSuccess = function (results) {
    _.forEach(results, function (service) {
      // was the service deleted, if so...
      // FailedMessage is null if the delete was successful
      if (service.ObjectState === saveStates.Delete && service.FailedMessage === null) {
        service.RecordId = service.ServiceTransactionId;
        $rootScope.$broadcast(
          'chart-ledger:service-transaction-deleted',
          service
        );
        let indx = _.findIndex($scope.chartLedgerServices, {
          RecordId: service.RecordId,
        });
        if (indx >= 0) {
          $scope.chartLedgerServices.splice(indx, 1);
        }
      }
    });

    // did any of the service deletes fail, set messaging accordingly
    var failedDeletes = _.filter(
      $scope.chartLedgerServices,
      function (chartLedgerService) {
        return (
          chartLedgerService.$$SelectedRow === true &&
          chartLedgerService.RecordType == 'Service'
        );
      }
    );
    if (failedDeletes.length > 0) {
      toastrFactory.success(
        localize.getLocalizedString(
          'Failed to delete some services.  Refresh the page to try again.',
          'Server Error'
        )
      );
    } else {
      toastrFactory.success(
        localize.getLocalizedString('Delete successful.', 'Success')
      );
    }

    // call once to notify treatment plans, timeline, and add services that they should reload
    $rootScope.$broadcast('soar:tx-plan-services-changed', null, true);
  };

  ////#endregion

  //#region delete multiple conditions

  // process deleted conditions and message if any were not successful
  ctrl.deleteConditionsSuccess = function (results) {
    _.forEach(results, function (condition) {
      // api returns a list of conditions that were deleted
      // RecordId has to be set because not in conditions list
      condition.RecordId = condition.PatientConditionId;
      // timeline uses RecordId to remove condition...
      $rootScope.$broadcast(
        'chart-ledger:patient-condition-deleted',
        condition
      );
      // remove condition from the chartLedgerServices
      let indx = _.findIndex($scope.chartLedgerServices, {
        RecordId: condition.PatientConditionId,
      });
      if (indx >= 0) {
        $scope.chartLedgerServices.splice(indx, 1);
      }
    });
    // did any of the condition deletes fail, set messaging accordingly
    var failedDeletes = _.filter(
      $scope.chartLedgerServices,
      function (chartLedgerService) {
        return (
          chartLedgerService.$$SelectedRow === true &&
          chartLedgerService.RecordType == 'Condition'
        );
      }
    );
    if (failedDeletes.length > 0) {
      toastrFactory.success(
        localize.getLocalizedString(
          'Failed to delete some conditions.  Refresh the page to try again.',
          'Server Error'
        )
      );
    } else {
      toastrFactory.success(
        localize.getLocalizedString('Delete successful.', 'Success')
      );
    }
  };

  ctrl.deleteConditions = function () {
    if (ctrl.selectedConditionRecords.length > 0) {
      // Get the unique conditionIds
      var conditionIds = _.map(
        _.uniqBy(
          ctrl.selectedConditionRecords,
          condition => condition.RecordId
        ),
        condition => condition.RecordId
      );
      patientServices.Conditions.batchDelete(
        { patientId: $scope.personId },
        conditionIds
      ).$promise.then(
        function (res) {
          ctrl.deleteConditionsSuccess(res.Value);
        },
        function () {
          toastrFactory.error(
            localize.getLocalizedString(
              'Failed to delete the {0}. Please try again.',
              'selected conditions'
            ),
            localize.getLocalizedString('Server Error')
          );
        }
      );
    }
  };
  //#endregion

  //#region duplicate patients
  // get a list of PatientIds for selected duplicates
  $scope.selectedPatientsChanged = function () {
    // the routed patient must always be selected
    let primaryPatient = $scope.duplicatePatients.find(
      x => x.PatientId === $scope.personId
    );
    primaryPatient.Selected = true;

    const selectedDuplicates = $scope.duplicatePatients.filter(
      x => x.Selected === true
    );
    let selectedDuplicatePatients = [
      ...new Set(selectedDuplicates.map(obj => obj.PatientId)),
    ];
    if ($scope.reloadingChartLedger === false) {
      $rootScope.$broadcast(
        'soar:reload-clinical-overview',
        selectedDuplicatePatients
      );
    }
  };

  //#endregion

  $scope.hasSelectedRows = false;
  $scope.setHasSelectedRows = function () {
    let selectedRows = _.filter(
      $scope.chartLedgerServices,
      function (chartLedgerService) {
        return chartLedgerService.$$SelectedRow === true;
      }
    );
    $scope.hasSelectedRows = selectedRows.length > 0 ? true : false;
  };

  ctrl.$onDestroy = function () {
    if ($scope.confirmationModalSubscription) {
      if ($scope.confirmationRef) {
        $scope.confirmationRef.close();
      }
      $scope.confirmationModalSubscription.unsubscribe();
    }
  };
}

PatientChartLedgerController.prototype = Object.create(BaseCtrl.prototype);
